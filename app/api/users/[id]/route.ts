import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUser, deleteUser, createUser } from '@/lib/services/userService';
import { createClient } from '@/lib/supabase/server';
import { Role } from '@prisma/client';

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

// Kullanıcı silme (sadece admin)
export async function DELETE(
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
    
    // Sadece admin kullanıcıları silebilir
    const currentUserDetails = await getUserById(user.id);
    
    if (currentUserDetails?.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmuyor' },
        { status: 403 }
      );
    }

    // Kullanıcıyı sil
    await deleteUser(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Kullanıcı silinemedi:', error);
    return NextResponse.json(
      { error: 'Kullanıcı silinemedi' },
      { status: 500 }
    );
  }
}
