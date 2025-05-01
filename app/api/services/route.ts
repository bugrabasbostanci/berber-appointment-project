import { NextRequest, NextResponse } from 'next/server';
import { getAllServices, countServices, createService, getServiceById, updateService, deleteService } from '@/lib/services/serviceService';
import { createClient } from '@/lib/supabase/server';
import { getUserById } from '@/lib/services/userService';
import { Role } from '@prisma/client'; // Role enum'unu doğrudan Prisma'dan import et

// Tüm servisleri getirme
export async function GET(req: NextRequest) {
  try {
    // URL parametrelerini al
    const url = new URL(req.url);
    const skip = parseInt(url.searchParams.get('skip') || '0');
    const take = parseInt(url.searchParams.get('take') || '50');
    const searchQuery = url.searchParams.get('q') || undefined;

    // Verileri ve toplam sayıyı getir
    const [services, total] = await Promise.all([
      getAllServices({ skip, take, searchQuery }),
      countServices({ searchQuery })
    ]);

    return NextResponse.json({
      services,
      pagination: {
        skip,
        take,
        total,
        hasMore: skip + take < total
      }
    });
  } catch (error) {
    console.error('Servisler getirilemedi:', error);
    return NextResponse.json(
      { error: 'Servisler getirilemedi' },
      { status: 500 }
    );
  }
}

// Yeni hizmet ekleme
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
    
    // Sadece admin rolündeki kullanıcılar global hizmet ekleyebilir
    if (currentUser.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Global hizmet ekleme yetkisine sahip değilsiniz' },
        { status: 403 }
      );
    }

    // Gönderilen verileri al
    const serviceData = await req.json();
    
    if (!serviceData.name) {
      return NextResponse.json(
        { error: 'Hizmet adı gerekli' },
        { status: 400 }
      );
    }
    
    if (!serviceData.shopId) {
      return NextResponse.json(
        { error: 'Dükkan ID (shopId) gerekli' },
        { status: 400 }
      );
    }

    // Yeni hizmet ekle
    const newService = await createService({
      name: serviceData.name,
      description: serviceData.description,
      shopId: serviceData.shopId,
      price: serviceData.price,
      duration: serviceData.duration
    });
    
    return NextResponse.json(newService, { status: 201 });
  } catch (error) {
    console.error('Hizmet eklenemedi:', error);
    return NextResponse.json(
      { error: 'Hizmet eklenemedi' },
      { status: 500 }
    );
  }
}

// Hizmet güncelleme - PUT fonksiyonu
export async function PUT(req: NextRequest) {
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
    
    // Sadece admin rolündeki kullanıcılar global hizmet güncelleyebilir
    if (currentUser.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Global hizmet güncelleme yetkisine sahip değilsiniz' },
        { status: 403 }
      );
    }

    // Gönderilen verileri al
    const { id, ...serviceData } = await req.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Hizmet ID gerekli' },
        { status: 400 }
      );
    }

    if (!serviceData.name) {
      return NextResponse.json(
        { error: 'Hizmet adı gerekli' },
        { status: 400 }
      );
    }

    // Hizmet mevcut mu kontrol et
    const existingService = await getServiceById(id);
    if (!existingService) {
      return NextResponse.json(
        { error: 'Hizmet bulunamadı' },
        { status: 404 }
      );
    }

    // Hizmeti güncelle
    const updatedService = await updateService(id, serviceData);
    
    return NextResponse.json(updatedService);
  } catch (error) {
    console.error('Hizmet güncellenemedi:', error);
    return NextResponse.json(
      { error: 'Hizmet güncellenemedi' },
      { status: 500 }
    );
  }
}

// Hizmet silme - DELETE fonksiyonu
export async function DELETE(req: NextRequest) {
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
    
    // Sadece admin rolündeki kullanıcılar global hizmet silebilir
    if (currentUser.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Global hizmet silme yetkisine sahip değilsiniz' },
        { status: 403 }
      );
    }

    // URL'den servis ID'sini al
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Hizmet ID gerekli' },
        { status: 400 }
      );
    }

    // Hizmet mevcut mu kontrol et
    const existingService = await getServiceById(id);
    if (!existingService) {
      return NextResponse.json(
        { error: 'Hizmet bulunamadı' },
        { status: 404 }
      );
    }

    // Hizmeti sil
    await deleteService(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Hizmet silinemedi:', error);
    return NextResponse.json(
      { error: 'Hizmet silinemedi' },
      { status: 500 }
    );
  }
}

