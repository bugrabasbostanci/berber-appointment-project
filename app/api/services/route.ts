import { NextRequest, NextResponse } from 'next/server';
import { getAllServices, countServices, createService } from '@/lib/services/serviceService';
import { createClient } from '@/lib/supabase/server';
import { getUserById } from '@/lib/services/userService';

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
    if (currentUser.role !== 'admin') {
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

    // Yeni hizmet ekle (global - shopId olmadan)
    const newService = await createService({
      name: serviceData.name,
      description: serviceData.description
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
