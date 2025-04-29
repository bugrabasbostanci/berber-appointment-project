import { NextRequest, NextResponse } from 'next/server';
import { getShopById, removeEmployeeFromShop } from '@/lib/services/shopService';
import { getUserById } from '@/lib/services/userService';
import { createClient } from '@/lib/supabase/server';

// Dükkandan çalışan çıkarma
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string, employeeId: string } }
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

    const { id: shopId, employeeId } = params;
    
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
    if (shop.ownerId !== session.user.id && currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmuyor' },
        { status: 403 }
      );
    }

    // Dükkandan çalışanı çıkar
    await removeEmployeeFromShop(shopId, employeeId);
    
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