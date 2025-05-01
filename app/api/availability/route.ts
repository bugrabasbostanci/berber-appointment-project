import { NextRequest, NextResponse } from 'next/server';
import { createAvailability, createManyAvailabilities } from '@/lib/services/availabilityService';
import { getUserById } from '@/lib/services/userService';
import { getShopById } from '@/lib/services/shopService';
import { createClient } from '@/lib/supabase/server';
import { Role } from '@prisma/client';

// Yeni müsaitlik durumu oluşturma
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
    
    // Sadece berber, çalışan ve admin rolündeki kullanıcılar müsaitlik durumu oluşturabilir
    if (currentUser.role !== Role.BARBER && 
        currentUser.role !== Role.EMPLOYEE && 
        currentUser.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmuyor' },
        { status: 403 }
      );
    }

    // Gönderilen verileri al
    const formData = await req.json();

    // Gelen verilerin toplu kayıt mı yoksa tekil kayıt mı olduğunu kontrol et
    if (Array.isArray(formData)) {
      // Toplu kayıt
      // Her bir giriş için gerekli alanların kontrolü
      for (const entry of formData) {
        if (!entry.shopId || !entry.date || !entry.timeSlots) {
          return NextResponse.json(
            { error: 'shopId, date ve timeSlots alanları zorunludur' },
            { status: 400 }
          );
        }

        // Dükkan kontrolü
        const shop = await getShopById(entry.shopId);
        if (!shop) {
          return NextResponse.json(
            { error: `${entry.shopId} ID'li dükkan bulunamadı` },
            { status: 404 }
          );
        }

        // Kullanıcı dükkanın sahibi veya admin olmalı
        if (shop.ownerId !== session.user.id && 
            currentUser.role !== Role.ADMIN) {
          return NextResponse.json(
            { error: 'Bu dükkan için müsaitlik durumu oluşturma yetkiniz yok' },
            { status: 403 }
          );
        }
      }

      // Her bir tarih için string'i Date objesine dönüştür
      const parsedData = formData.map(entry => ({
        shopId: entry.shopId,
        date: new Date(entry.date),
        isAvailable: entry.isAvailable !== false, // Default olarak true
        timeSlots: entry.timeSlots,
        reason: entry.reason
      }));

      // Toplu kayıt oluştur
      const result = await createManyAvailabilities(parsedData);
      
      return NextResponse.json({
        success: true,
        count: result.count,
        message: `${result.count} adet müsaitlik durumu oluşturuldu`
      }, { status: 201 });
    } else {
      // Tekil kayıt
      // Gerekli alanların kontrolü
      if (!formData.shopId || !formData.date || !formData.timeSlots) {
        return NextResponse.json(
          { error: 'shopId, date ve timeSlots alanları zorunludur' },
          { status: 400 }
        );
      }

      // Dükkan kontrolü
      const shop = await getShopById(formData.shopId);
      if (!shop) {
        return NextResponse.json(
          { error: 'Dükkan bulunamadı' },
          { status: 404 }
        );
      }

      // Kullanıcı dükkanın sahibi veya admin olmalı
      if (shop.ownerId !== session.user.id && 
          currentUser.role !== Role.ADMIN) {
        return NextResponse.json(
          { error: 'Bu dükkan için müsaitlik durumu oluşturma yetkiniz yok' },
          { status: 403 }
        );
      }

      // String tarihi Date objesine dönüştür
      const availabilityData = {
        shopId: formData.shopId,
        date: new Date(formData.date),
        isAvailable: formData.isAvailable !== false, // Default olarak true
        timeSlots: formData.timeSlots,
        reason: formData.reason
      };

      // Müsaitlik durumu oluştur
      const newAvailability = await createAvailability(availabilityData);
      
      return NextResponse.json(newAvailability, { status: 201 });
    }
  } catch (error) {
    console.error('Müsaitlik durumu oluşturulamadı:', error);
    return NextResponse.json(
      { error: 'Müsaitlik durumu oluşturulamadı' },
      { status: 500 }
    );
  }
}