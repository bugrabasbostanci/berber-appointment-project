import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getShopById } from '@/lib/services/shopService';

const TIME_SLOTS_PER_DAY = 16; // Günlük zaman dilimi sayısı (frontend ile senkronize)

// Dükkanın günlük veya aylık randevu istatistiklerini getirme
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const shopId = params.id;
    
    // Dükkanın var olup olmadığını kontrol et
    const shop = await getShopById(shopId);
    
    if (!shop) {
      return NextResponse.json(
        { error: 'Dükkan bulunamadı' },
        { status: 404 }
      );
    }

    // URL parametrelerini al
    const url = new URL(req.url);
    const startDateParam = url.searchParams.get('startDate');
    const endDateParam = url.searchParams.get('endDate');
    
    if (!startDateParam || !endDateParam) {
      return NextResponse.json(
        { error: 'Başlangıç ve bitiş tarihi zorunludur' },
        { status: 400 }
      );
    }
    
    const startDate = new Date(startDateParam);
    const endDate = new Date(endDateParam);
    endDate.setHours(23, 59, 59, 999); // Bitiş tarihini gün sonuna ayarla
    
    const appointmentStatsByDate = await prisma.appointment.groupBy({
      by: ['date'],
      where: {
        shopId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        date: 'asc',
      },
    });
    
    // Dükkanın personel sayısını al
    const staffCount = 2; // Varsayılan olarak personel sayısını 2 kabul ediyoruz.
                                                          // Ya da staff.length === 0 ise kapasite 0 olmalı.
                                                          // Şimdilik en az 1 varsayımıyla devam.
    
    const dailyCapacity = staffCount * TIME_SLOTS_PER_DAY;
    
    // İstatistikleri startDate ve endDate arasındaki her gün için oluştur
    const results = [];
    const currentDate = new Date(startDate);
    currentDate.setHours(0,0,0,0);

    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      const statForDate = appointmentStatsByDate.find(
        (s) => new Date(s.date).toISOString().split('T')[0] === dateString
      );
      results.push({
        date: new Date(currentDate), // Date objesi olarak kalsın, API /route.ts formatlayacak
        count: statForDate ? statForDate._count.id : 0,
        capacity: dailyCapacity, // Her gün için aynı kapasite (basitleştirilmiş)
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    console.log(`[STATS API] shopId: ${shopId}, staffCount: ${staffCount}, dailyCapacity: ${dailyCapacity}, results length: ${results.length}`);
    if(results.length > 0) {
      console.log("[STATS API] First result sample:", results[0]);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Dükkan randevu istatistikleri getirilemedi:', error);
    return NextResponse.json(
      { error: 'Dükkan randevu istatistikleri getirilemedi' },
      { status: 500 }
    );
  }
} 