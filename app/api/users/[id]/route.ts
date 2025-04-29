import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUser, deleteUser } from '@/lib/services/userService';
import { createClient } from '@/lib/supabase/server';

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
    const userDetails = await getUserById(userId);
    
    // Kullanıcı bulunamadığında 404 yerine boş bir kullanıcı objesi döndür
    if (!userDetails) {
      // Default kullanıcı profil bilgileri - kayıt sırasında oluşturulmamış olabilir
      return NextResponse.json({
        id: userId,
        email: user.email,
        firstName: null,
        lastName: null,
        role: user.user_metadata?.role || 'CUSTOMER',
        profileImage: null,
        phone: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
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
    
    // Kullanıcı bilgilerini güncelle
    const updatedUser = await updateUser(userId, finalUpdateData);
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Kullanıcı güncellenemedi' },
        { status: 404 }
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
