import { NextRequest, NextResponse } from 'next/server';
import { getShopById, getShopServices, addServiceToShop } from '@/lib/services/shopService';
import { getUserById } from '@/lib/services/userService';
import { createClient } from '@/lib/supabase/server';
import { Role } from '@prisma/client';

// Dükkanın hizmetlerini getirme
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const shopId = params.id;
    
    // Dükkan bilgilerini getir
    const shop = await getShopById(shopId);
    
    if (!shop) {
      return NextResponse.json(
        { error: 'Dükkan bulunamadı' },
        { status: 404 }
      );
    }

    // Dükkanın hizmetlerini getir
    const services = await getShopServices(shopId);
    
    return NextResponse.json(services);
  } catch (error) {
    console.error('Dükkan hizmetleri getirilemedi:', error);
    return NextResponse.json(
      { error: 'Dükkan hizmetleri getirilemedi' },
      { status: 500 }
    );
  }
}

// Dükkana hizmet ekleme
export async function POST(
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
    const serviceData = await req.json();
    
    if (!serviceData.name) {
      return NextResponse.json(
        { error: 'Hizmet adı gerekli' },
        { status: 400 }
      );
    }

    // Dükkana hizmet ekle
    const newService = await addServiceToShop(shopId, serviceData);
    
    return NextResponse.json(newService, { status: 201 });
  } catch (error) {
    console.error('Hizmet eklenemedi:', error);
    return NextResponse.json(
      { error: 'Hizmet eklenemedi' },
      { status: 500 }
    );
  }
}