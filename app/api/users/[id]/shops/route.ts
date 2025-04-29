import { NextRequest, NextResponse } from 'next/server';
import { getUserById, getUserOwnedShops, getUserEmployeeShops } from '@/lib/services/userService';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Kullanıcı oturumunu kontrol et
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const userId = params.id;
    
    // Kullanıcı kendi dükkanlarını veya admin ise herhangi bir kullanıcının dükkanlarını görüntüleyebilir
    const currentUserDetails = await getUserById(session.user.id);
    
    if (!currentUserDetails) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }
    
    if (session.user.id !== userId && currentUserDetails.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmuyor' },
        { status: 403 }
      );
    }

    // Kullanıcı detaylarını getir
    const user = await getUserById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Kullanıcının rolüne göre dükkan bilgilerini getir
    const response: { 
      ownedShops: any[], 
      employeeShops: any[],
      role: string
    } = {
      ownedShops: [],
      employeeShops: [],
      role: user.role
    };

    try {
      // Sahip olunan dükkanları getir
      if (['barber', 'admin'].includes(user.role)) {
        response.ownedShops = await getUserOwnedShops(userId);
      }

      // Çalışılan dükkanları getir
      if (['employee', 'barber'].includes(user.role)) {
        response.employeeShops = await getUserEmployeeShops(userId);
      }
    } catch (error) {
      console.error('Dükkan bilgileri alınırken hata oluştu:', error);
      // Hata olsa da devam et, boş array döndür
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Kullanıcı dükkanları getirilemedi:', error);
    return NextResponse.json(
      { error: 'Kullanıcı dükkanları getirilemedi' },
      { status: 500 }
    );
  }
}
