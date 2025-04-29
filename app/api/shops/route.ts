import { NextRequest, NextResponse } from 'next/server';
import { getShops, countShops, createShop } from '@/lib/services/shopService';
import { getUserById } from '@/lib/services/userService';
import { createClient } from '@/lib/supabase/server';

// Tüm dükkanları getirme
export async function GET(req: NextRequest) {
  try {
    // URL parametrelerini al
    const url = new URL(req.url);
    const skip = parseInt(url.searchParams.get('skip') || '0');
    const take = parseInt(url.searchParams.get('take') || '10');
    const searchQuery = url.searchParams.get('q') || undefined;
    const ownerId = url.searchParams.get('ownerId') || undefined;

    // Verileri ve toplam sayıyı getir
    const [shops, total] = await Promise.all([
      getShops({ skip, take, searchQuery, ownerId }),
      countShops({ searchQuery, ownerId })
    ]);

    return NextResponse.json({
      shops,
      pagination: {
        skip,
        take,
        total,
        hasMore: skip + take < total
      }
    });
  } catch (error) {
    console.error('Dükkanlar getirilemedi:', error);
    return NextResponse.json(
      { error: 'Dükkanlar getirilemedi' },
      { status: 500 }
    );
  }
}

// Yeni dükkan oluşturma
export async function POST(req: NextRequest) {
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

    // Kullanıcı detaylarını getir
    const currentUser = await getUserById(session.user.id);
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }
    
    // Sadece berber ve admin rolündeki kullanıcılar dükkan oluşturabilir
    if (!['barber', 'admin'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmuyor' },
        { status: 403 }
      );
    }

    // Gönderilen verileri al
    const formData = await req.json();
    
    // Dükkan verilerini hazırla
    const shopData = {
      ...formData,
      userId: session.user.id,
      ownerId: formData.ownerId || session.user.id // ownerId belirtilmemişse, mevcut kullanıcıyı ata
    };
    
    // Dükkanı oluştur
    const newShop = await createShop(shopData);
    
    return NextResponse.json(newShop, { status: 201 });
  } catch (error) {
    console.error('Dükkan oluşturulamadı:', error);
    return NextResponse.json(
      { error: 'Dükkan oluşturulamadı' },
      { status: 500 }
    );
  }
}
