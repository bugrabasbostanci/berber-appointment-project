import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUser, deleteUser, createUser } from '@/lib/services/userService';
import { createClient } from '@/lib/supabase/server';
import { Role } from '@prisma/client';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';

// Kullanıcı bilgilerini getirme
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    // params nesnesini await ediyoruz ve sonra id özelliğine erişiyoruz
    const resolvedParams = await params;
    const userId = resolvedParams.id;
    
    // Kullanıcı kendi profilini veya admin ise herhangi bir profili görüntüleyebilir
    const currentUserDetails = await getUserById(user.id);
    
    if (user.id !== userId && currentUserDetails?.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmuyor' },
        { status: 403 }
      );
    }

    // Kullanıcı bilgilerini getir
    let userDetails = await getUserById(userId);
    
    // Kullanıcı bulunamadığında, Supabase Auth bilgilerinden bir kullanıcı oluştur
    if (!userDetails) {
      try {
        // Role enum değerini doğru şekilde dönüştür
        const roleValue = user.user_metadata?.role?.toUpperCase() as Role || Role.CUSTOMER;
        
        userDetails = await createUser({
          id: userId,
          email: user.email || "",
          role: roleValue,
          firstName: user.user_metadata?.firstName || null,
          lastName: user.user_metadata?.lastName || null,
          phone: user.user_metadata?.phone || null
        });
        
        console.log(`Yeni kullanıcı kaydı oluşturuldu: ${userId}`);
      } catch (createError) {
        console.error("Kullanıcı oluşturma hatası:", createError);
        // Yine de temel kullanıcı bilgilerini döndür
        return NextResponse.json({
          id: userId,
          email: user.email,
          firstName: user.user_metadata?.firstName || null,
          lastName: user.user_metadata?.lastName || null,
          role: Role.CUSTOMER,
          phone: user.user_metadata?.phone || null,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    return NextResponse.json(userDetails);
  } catch (error) {
    console.error("Kullanıcı bilgilerini getirirken hata:", error);
    return NextResponse.json(
      { error: "Kullanıcı bilgileri getirilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Kullanıcı bilgilerini güncelleme
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Kullanıcı oturumunu kontrol et
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    // params nesnesini await ediyoruz ve sonra id özelliğine erişiyoruz
    const resolvedParams = await params;
    const userId = resolvedParams.id;
    
    // Kullanıcı kendi profilini veya admin ise herhangi bir profili güncelleyebilir
    const currentUserDetails = await getUserById(user.id);
    
    if (user.id !== userId && currentUserDetails?.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmuyor' },
        { status: 403 }
      );
    }

    // Gönderilen verileri al
    const formData = await req.json();
    
    // Güncellenecek verileri hazırla
    const { role, email, ...updateData } = formData;
    
    // Admin değilse rol ve email güncellenemez
    const finalUpdateData = currentUserDetails?.role === Role.ADMIN 
      ? { ...updateData, role, email } 
      : updateData;
    
    // Kullanıcı veritabanında var mı kontrol et
    let userDetails = await getUserById(userId);
    let updatedUser;
    
    // Kullanıcı bulunamadığında, önce oluştur
    if (!userDetails) {
      try {
        // Role enum değerini doğru şekilde dönüştür
        const roleValue = user.user_metadata?.role?.toUpperCase() as Role || Role.CUSTOMER;
        
        userDetails = await createUser({
          id: userId,
          email: user.email || "",
          role: roleValue,
          ...finalUpdateData
        });
        
        updatedUser = userDetails;
      } catch (createError) {
        console.error("Kullanıcı oluşturma hatası:", createError);
        return NextResponse.json(
          { error: 'Kullanıcı profili oluşturulamadı' },
          { status: 500 }
        );
      }
    } else {
      // Kullanıcı varsa güncelle
      updatedUser = await updateUser(userId, finalUpdateData);
    }
    
    // İşlem sonucunu kontrol et
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Kullanıcı güncellenemedi' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Kullanıcı bilgileri güncellenemedi:', error);
    return NextResponse.json(
      { error: 'Kullanıcı bilgileri güncellenemedi' },
      { status: 500 }
    );
  }
}

// Kullanıcının kendi hesabını silmesi
export async function DELETE(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  // Dinamik parametreye erişim
  const { id: userIdToDelete } = params; 

  // 1. Verify Authentication
  const supabase = await createClient(); // Server client
  const { data: { user: loggedInUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !loggedInUser) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // 2. Verify Authorization (User can only delete their own account)
  if (loggedInUser.id !== userIdToDelete) {
    console.warn(`Yetkisiz silme denemesi: Kullanıcı ${loggedInUser.id}, Hesap ${userIdToDelete}'ı silmeye çalıştı.`);
    return NextResponse.json({ error: 'Unauthorized to delete this account' }, { status: 403 });
  }

  // 3. Check for required environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
      console.error("[DELETE USER] Supabase URL veya Service Role Key ortam değişkenleri ayarlanmamış.");
      return NextResponse.json({ error: "Server configuration error prevents account deletion." }, { status: 500 });
  }

  try {
    // 4. Database Cleanup (Transaction)
    console.log(`[DELETE USER] Veritabanı temizliği başlıyor: ${userIdToDelete}`);
    await prisma.$transaction(async (tx) => {
        // Delete related appointments where the user is the customer
        await tx.appointment.deleteMany({
            where: { userId: userIdToDelete },
        });
        console.log(`[DELETE USER] Müşteri randevuları silindi: ${userIdToDelete}`);

        // Prisma schema (onDelete: SetNull) employee appointments'ı halletmeli.

        // Delete the user record (Profile and Reviews should cascade)
        await tx.user.delete({
            where: { id: userIdToDelete },
        });
        console.log(`[DELETE USER] Kullanıcı kaydı silindi: ${userIdToDelete}`);
    });
    console.log(`[DELETE USER] Veritabanı temizliği tamamlandı: ${userIdToDelete}`);

    // 5. Delete from Supabase Auth using Admin Client
    console.log(`[DELETE USER] Supabase Auth'dan silme başlıyor: ${userIdToDelete}`);
    const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey);

    const { error: adminDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userIdToDelete);

    if (adminDeleteError) {
        console.error(`[DELETE USER] Supabase Auth silme hatası: ${userIdToDelete}`, adminDeleteError);
        // DB silindi ama Auth silinemedi, bu ciddi bir sorun. Hatayı fırlat.
        throw new Error(`Database user deleted, but failed to delete from Auth system: ${adminDeleteError.message}`);
    }
    console.log(`[DELETE USER] Supabase Auth'dan silme tamamlandı: ${userIdToDelete}`);

    // 6. Return Success
    return NextResponse.json({ message: 'Account deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error(`[DELETE USER] Hesap silme hatası ${userIdToDelete}:`, error);
    let errorMessage = 'Failed to delete account.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
