import { NextRequest, NextResponse } from 'next/server';
import { getAvailabilityById, updateAvailability, deleteAvailability } from '@/lib/services/availabilityService';
import { getUserById } from '@/lib/services/userService';
import { getShopById } from '@/lib/services/shopService';
import { createClient } from '@/lib/supabase/server';
import { Role } from '@prisma/client';

// Belirli bir müsaitlik durumunu getirme
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const availabilityId = params.id;
    
    // Müsaitlik durumunu getir
    const availability = await getAvailabilityById(availabilityId);
    
    if (!availability) {
      return NextResponse.json(
        { error: 'Müsaitlik durumu bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(availability);
  } catch (error) {
    console.error('Müsaitlik durumu getirilemedi:', error);
    return NextResponse.json(
      { error: 'Müsaitlik durumu getirilemedi' },
      { status: 500 }
    );
  }
}

// Müsaitlik durumunu güncelleme
export async function PATCH(
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

    const availabilityId = params.id;
    
    // Müsaitlik durumunu getir
    const availability = await getAvailabilityById(availabilityId);
    
    if (!availability) {
      return NextResponse.json(
        { error: 'Müsaitlik durumu bulunamadı' },
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
    
    // Dükkan bilgilerini getir
    const shop = await getShopById(availability.shopId);
    
    if (!shop) {
      return NextResponse.json(
        { error: 'Dükkan bulunamadı' },
        { status: 404 }
      );
    }
    
    // Kullanıcı dükkanın sahibi, ilgili çalışan veya admin olmalı
    // Profillere erişim olmadığı için şu an sadece dükkan sahibi ve admin yetkilendirmesi yapabiliyoruz
    if (shop.ownerId !== session.user.id && 
        currentUser.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmuyor' },
        { status: 403 }
      );
    }

    // Gönderilen verileri al
    const updateData = await req.json();
    
    // Tarih alanı varsa, string'i Date objesine dönüştür
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    // Müsaitlik durumunu güncelle
    const updatedAvailability = await updateAvailability(availabilityId, updateData);
    
    return NextResponse.json(updatedAvailability);
  } catch (error) {
    console.error('Müsaitlik durumu güncellenemedi:', error);
    return NextResponse.json(
      { error: 'Müsaitlik durumu güncellenemedi' },
      { status: 500 }
    );
  }
}

// Müsaitlik durumunu silme
export async function DELETE(
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

    const availabilityId = params.id;
    
    // Müsaitlik durumunu getir
    const availability = await getAvailabilityById(availabilityId);
    
    if (!availability) {
      return NextResponse.json(
        { error: 'Müsaitlik durumu bulunamadı' },
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
    
    // Dükkan bilgilerini getir
    const shop = await getShopById(availability.shopId);
    
    if (!shop) {
      return NextResponse.json(
        { error: 'Dükkan bulunamadı' },
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

    // Müsaitlik durumunu sil
    await deleteAvailability(availabilityId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Müsaitlik durumu silinemedi:', error);
    return NextResponse.json(
      { error: 'Müsaitlik durumu silinemedi' },
      { status: 500 }
    );
  }
}