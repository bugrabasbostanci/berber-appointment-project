import { NextRequest, NextResponse } from 'next/server';
import { getShopById, getShopEmployees, addEmployeeToShop, removeEmployeeFromShop } from '@/lib/services/shopService';
import { getUserById } from '@/lib/services/userService';
import { createClient } from '@/lib/supabase/server';

// Dükkanın çalışanlarını getirme
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

    // Dükkanın çalışanlarını getir
    const employees = await getShopEmployees(shopId);
    
    return NextResponse.json(employees);
  } catch (error) {
    console.error('Dükkan çalışanları getirilemedi:', error);
    return NextResponse.json(
      { error: 'Dükkan çalışanları getirilemedi' },
      { status: 500 }
    );
  }
}

// Dükkana çalışan ekleme
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
    if (shop.ownerId !== session.user.id && currentUser.role !== 'admin') {
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
    if (!['barber', 'employee'].includes(employee.role)) {
      return NextResponse.json(
        { error: 'Sadece berber veya çalışan rolüne sahip kullanıcılar eklenebilir' },
        { status: 400 }
      );
    }

    // Dükkana çalışan ekle
    const updatedShop = await addEmployeeToShop(shopId, employeeId);
    
    return NextResponse.json({
      success: true,
      message: 'Çalışan başarıyla eklendi',
      shopId,
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