import { NextRequest, NextResponse } from 'next/server';
import { getShopById, updateShop, deleteShop } from '@/lib/services/shopService';
import { getUserById } from '@/lib/services/userService';
import { createClient } from '@/lib/supabase/server';
import { Role } from '@prisma/client';

// Belirli bir dükkanın bilgilerini getirme
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

    return NextResponse.json(shop);
  } catch (error) {
    console.error('Dükkan bilgileri getirilemedi:', error);
    return NextResponse.json(
      { error: 'Dükkan bilgileri getirilemedi' },
      { status: 500 }
    );
  }
}

// Dükkan bilgilerini güncelleme
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
    const updateData = await req.json();
    
    // Dükkan bilgilerini güncelle
    const updatedShop = await updateShop(shopId, updateData);
    
    return NextResponse.json(updatedShop);
  } catch (error) {
    console.error('Dükkan bilgileri güncellenemedi:', error);
    return NextResponse.json(
      { error: 'Dükkan bilgileri güncellenemedi' },
      { status: 500 }
    );
  }
}

// Dükkan silme
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

    // Dükkanı sil
    await deleteShop(shopId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Dükkan silinemedi:', error);
    return NextResponse.json(
      { error: 'Dükkan silinemedi' },
      { status: 500 }
    );
  }
}
