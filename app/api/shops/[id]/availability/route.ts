import { NextRequest, NextResponse } from 'next/server';
import { getShopAvailability, getAvailableUsersForDate, getShopCalendar, getShopMonthlyCalendarView, DailyCalendarInfo } from '@/lib/services/availabilityService';
import { getShopById } from '@/lib/services/shopService';

// Dükkanın müsaitlik durumlarını getirme
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const shopId = id;
    
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
    const userId = url.searchParams.get('userId') || undefined;
    const dateParam = url.searchParams.get('date');
    const view = url.searchParams.get('view');

    console.log(`[API /shops/${shopId}/availability] Received params: shopId=${shopId}, startDateParam=${startDateParam}, endDateParam=${endDateParam}, dateParam=${dateParam}, view=${view}, userId=${userId}`);
    
    // ÖNCELİK SIRASI: Eğer `dateParam` veya `view === 'team'` varsa, onlar işlenir.
    // Yoksa, varsayılan olarak aylık takvim görünümü verileri döndürülür.

    if (dateParam) {
      const date = new Date(dateParam + "T00:00:00.000Z"); // Parametreyi UTC olarak işle
      console.log(`[API /shops/${shopId}/availability] Getting available users for date: ${date.toISOString()}`);
      const availableUsers = await getAvailableUsersForDate(shopId, date);
      
      return NextResponse.json({
        date: dateParam,
        availableUsers
      });
    }
    
    if (view === 'team' && startDateParam && endDateParam) {
      // Tarihleri UTC olarak işle
      const startDate = new Date(startDateParam + "T00:00:00.000Z");
      const endDate = new Date(endDateParam + "T23:59:59.999Z"); // Dahil olması için gün sonu

      console.log(`[API /shops/${shopId}/availability] Getting team calendar view from ${startDate.toISOString()} to ${endDate.toISOString()}`);
      const teamCalendar = await getShopCalendar(shopId, startDate, endDate);
      
      return NextResponse.json(teamCalendar);
    }
    
    // Varsayılan davranış: Aylık takvim görünümü için veri döndür
    if (startDateParam && endDateParam) {
      // Tarihleri UTC olarak işle (bu zaten bir önceki adımdan doğru geliyordu ama yine de emin olalım)
      let startDate: Date | undefined = undefined;
      if (startDateParam) {
        startDate = new Date(startDateParam + "T00:00:00.000Z");
      }

      let endDate: Date | undefined = undefined;
      if (endDateParam) {
        const tempDate = new Date(endDateParam + "T00:00:00.000Z");
        tempDate.setUTCDate(tempDate.getUTCDate() + 1);
        tempDate.setUTCMilliseconds(tempDate.getUTCMilliseconds() - 1);
        endDate = tempDate;
      }

      if (!startDate || !endDate) {
        return NextResponse.json(
          { error: 'Başlangıç ve bitiş tarihleri aylık görünüm için zorunludur' },
          { status: 400 }
        );
      }
      
      console.log(`[API /shops/${shopId}/availability] Getting monthly calendar view from ${startDate.toISOString()} to ${endDate.toISOString()}`);
      const monthlyViewData: DailyCalendarInfo[] = await getShopMonthlyCalendarView(shopId, startDate, endDate);
      return NextResponse.json(monthlyViewData);

    } else {
      // Eğer startDateParam veya endDateParam eksikse (ve diğer koşullar da karşılanmıyorsa)
      return NextResponse.json(
        { error: 'Geçerli parametreler sağlanmadı (date, view=team, veya startDate/endDate)' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Dükkan müsaitlik durumları getirilemedi:', error);
    return NextResponse.json(
      { error: 'Dükkan müsaitlik durumları getirilemedi' },
      { status: 500 }
    );
  }
}