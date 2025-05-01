import { NextRequest, NextResponse } from 'next/server';
import { getUserById, getUserOwnedShops } from '@/lib/services/userService';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

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
    
    if (session.user.id !== userId && currentUserDetails.role !== 'ADMIN') {
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
      if (['BARBER', 'ADMIN'].includes(user.role)) {
        response.ownedShops = await getUserOwnedShops(userId);
      }

      // Çalışılan dükkanları getirme - Şu anda şemada doğrudan ilişki olmadığından,
      // AvailableTime tablosu üzerinden işlem yapmamız gerekiyor
      if (['EMPLOYEE', 'BARBER'].includes(user.role)) {
        // Kullanıcının çalıştığı dükkanları randevular üzerinden bulalım
        const employeeShops = await prisma.availableTime.findMany({
          where: {
            profiles: {
              some: {
                userId: userId
              }
            }
          },
          select: {
            shop: true
          },
          distinct: ['shopId']
        });
        
        response.employeeShops = employeeShops.map(item => item.shop);
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
