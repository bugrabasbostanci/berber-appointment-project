import { NextRequest, NextResponse } from 'next/server';
import { getShopById } from '@/lib/services/shopService';
import { getUserById, getUsers } from '@/lib/services/userService';
import { createClient } from '@/lib/supabase/server';
import { Role, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// İlgili dükkanda çalışan kullanıcıların listesini getirme
// Bu fonksiyon dükkana bağlı çalışanları getirir (BARBER veya EMPLOYEE rolündeki)
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Next.js 13+ gereksinimi - params props'unu objeden ayır
    const { params } = context;
    
    // ID parametresini doğrudan değişken olarak al, { id } şeklinde destructuring yapmaktan kaçın
    const shopId = params.id;
    
    console.log(`Çalışanlar getiriliyor, Shop ID: ${shopId}`);
    
    // Dükkan bilgilerini getir
    const shop = await getShopById(shopId);
    
    if (!shop) {
      return NextResponse.json(
        { error: 'Dükkan bulunamadı' },
        { status: 404 }
      );
    }

    // Dükkanda çalışan kullanıcıları bul
    // Dükkan sahibini öncelikle ekle
    let employees = await prisma.user.findMany({
      where: {
        OR: [
          { id: shop.ownerId },
          {
            OR: [
              { role: Role.BARBER },
              { role: Role.EMPLOYEE }
            ],
            ownedShops: {
              some: {
                id: shopId
              }
            }
          }
        ]
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });
    
    // Ayrıca veritabanından, senin eklediğin berber role'ündeki kullanıcıları da getir
    const allBarbers = await prisma.user.findMany({
      where: {
        role: Role.BARBER,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });
    
    // Var olan çalışanların id'lerini al
    const existingIds = new Set(employees.map(emp => emp.id));
    
    // Henüz listeye eklenmemiş berberleri ekle
    for (const barber of allBarbers) {
      if (!existingIds.has(barber.id)) {
        employees.push(barber);
      }
    }
    
    // Veri yoksa boş liste döndür
    if (employees.length === 0) {
      return NextResponse.json(
        [], 
        { status: 200 }
      );
    }
    
    return NextResponse.json(employees);
  } catch (error) {
    console.error('Dükkan çalışanları getirilemedi:', error);
    
    return NextResponse.json(
      { error: 'Çalışanlar getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Dükkana yeni bir çalışan (BARBER veya EMPLOYEE) ekleme
export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
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

    // Next.js 13+ gereksinimi - params props'unu objeden ayır
    const { params } = context;
    
    // ID parametresini doğrudan değişken olarak al
    const shopId = params.id;
    
    // Dükkan bilgilerini getir
    const shop = await getShopById(shopId);
    
    if (!shop) {
      return NextResponse.json(
        { error: 'Dükkan bulunamadı' },
        { status: 404 }
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
    
    // Kullanıcı dükkanın sahibi veya admin olmalı
    if (shop.ownerId !== session.user.id && currentUser.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmuyor' },
        { status: 403 }
      );
    }

    // Gönderilen verileri al
    const { employeeId } = await req.json();
    
    if (!employeeId) {
      return NextResponse.json(
        { error: 'Çalışan ID si gerekli' },
        { status: 400 }
      );
    }
    
    // Çalışan kullanıcıyı kontrol et
    const employee = await getUserById(employeeId);
    
    if (!employee) {
      return NextResponse.json(
        { error: 'Çalışan bulunamadı' },
        { status: 404 }
      );
    }
    
    // Sadece barber veya employee rolündeki kullanıcılar çalışan olarak eklenebilir
    if (employee.role !== Role.BARBER && employee.role !== Role.EMPLOYEE) {
      return NextResponse.json(
        { error: 'Sadece berber veya çalışan rolüne sahip kullanıcılar eklenebilir' },
        { status: 400 }
      );
    }

    // Dükkana çalışan ekle (aslında bu kullanıcıyı bu dükkanın sahibi olarak ayarla)
    // NOT: Prisma şemasında doğrudan employees ilişkisi olmadığı için,
    // bu kullanıcıyı bu dükkanın sahibi olarak ekliyoruz
    // Bu iş modeli için ideal değil, ancak şema değişikliği gerekmeden çözüm buluyor
    const updatedShop = await prisma.shop.create({
      data: {
        name: `${shop.name} - ${employee.firstName} ${employee.lastName} birimi`,
        description: shop.description,
        address: shop.address,
        workingHours: shop.workingHours as Prisma.InputJsonValue,
        owner: {
          connect: { id: employeeId }
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Çalışan başarıyla eklendi',
      shopId: updatedShop.id,
      employeeId
    });
  } catch (error) {
    console.error('Çalışan eklenemedi:', error);
    return NextResponse.json(
      { error: 'Çalışan eklenemedi' },
      { status: 500 }
    );
  }
}

// Dükkandan bir çalışanı çıkarma
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
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

    // Next.js 13+ gereksinimi - params props'unu objeden ayır
    const { params } = context;
    
    // ID parametresini doğrudan değişken olarak al
    const shopId = params.id;
    
    // URL'den parametreleri al
    const url = new URL(req.url);
    const employeeId = url.searchParams.get('employeeId');
    
    // Parametre kontrolü
    if (!employeeId) {
      return NextResponse.json(
        { error: 'Çalışan ID si gerekli' },
        { status: 400 }
      );
    }
    
    // Dükkan bilgilerini getir
    const shop = await getShopById(shopId);
    
    if (!shop) {
      return NextResponse.json(
        { error: 'Dükkan bulunamadı' },
        { status: 404 }
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
    
    // Kullanıcı dükkanın sahibi veya admin olmalı
    if (shop.ownerId !== session.user.id && currentUser.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmuyor' },
        { status: 403 }
      );
    }
    
    // Çalışan kullanıcıyı kontrol et
    const employee = await getUserById(employeeId);
    
    if (!employee) {
      return NextResponse.json(
        { error: 'Çalışan bulunamadı' },
        { status: 404 }
      );
    }
    
    // Çalışanın dükkandan çıkarılması (ilgili dükkanın silinmesi)
    // Çalışana bağlı olan ve bu dükkanda bulunan dükkanı sil
    const removedShop = await prisma.shop.deleteMany({
      where: {
        ownerId: employeeId,
        name: {
          contains: shop.name
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Çalışan başarıyla çıkarıldı',
      shopId,
      employeeId
    });
  } catch (error) {
    console.error('Çalışan çıkarılamadı:', error);
    return NextResponse.json(
      { error: 'Çalışan çıkarılamadı' },
      { status: 500 }
    );
  }
}