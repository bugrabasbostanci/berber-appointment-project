import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUser, deleteUser, createUser } from '@/lib/services/userService';
import { createClient } from '@/lib/supabase/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Kullanıcı bilgilerini getirme
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // getSession() yerine getUser() kullanın
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    // params objesini doğrudan kullan, App Router'da hazır geliyor
    const { id } = await params;
    const userId = id;
    
    // Kullanıcı kendi profilini veya admin ise herhangi bir profili görüntüleyebilir
    const currentUserDetails = await getUserById(user.id);
    
    if (user.id !== userId && currentUserDetails?.role !== 'admin') {
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
        userDetails = await prisma.user.create({
          data: {
            id: userId,
            email: user.email || "",
            role: user.user_metadata?.role || 'customer',
            firstName: user.user_metadata?.firstName || null,
            lastName: user.user_metadata?.lastName || null,
            phone: user.user_metadata?.phone || null
          }
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
          role: user.user_metadata?.role || 'customer',
          profileImage: null,
          phone: user.user_metadata?.phone || null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    // Hassas verileri temizle
    const { password, ...safeUser } = userDetails;

    return NextResponse.json(safeUser);
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

    const { id } = await params;
    const userId = id;
    
    // Kullanıcı kendi profilini veya admin ise herhangi bir profili güncelleyebilir
    const currentUserDetails = await getUserById(user.id);
    
    if (user.id !== userId && currentUserDetails?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmuyor' },
        { status: 403 }
      );
    }

    // Gönderilen verileri al
    const formData = await req.json();
    
    // Güncellenecek verileri hazırla
    const { password, role, email, ...updateData } = formData;
    
    // Admin değilse rol ve email güncellenemez
    const finalUpdateData = currentUserDetails?.role === 'admin' 
      ? { ...updateData, role, email } 
      : updateData;
    
    // Kullanıcı veritabanında var mı kontrol et
    let userDetails = await getUserById(userId);
    let updatedUser;
    
    // Kullanıcı bulunamadığında, önce oluştur
    if (!userDetails) {
      try {
        userDetails = await prisma.user.create({
          data: {
            id: userId,
            email: user.email || "",
            role: user.user_metadata?.role || 'customer',
            ...finalUpdateData
          }
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

    // Hassas verileri temizle
    const { password: _, ...safeUser } = updatedUser;

    return NextResponse.json(safeUser);
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

    const { id } = await params;
    const userId = id;
    
    // Sadece admin kullanıcıları silebilir
    const currentUserDetails = await getUserById(user.id);
    
    if (currentUserDetails?.role !== 'admin') {
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
