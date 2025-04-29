import { NextRequest, NextResponse } from 'next/server';
import { getShopAvailability, getAvailableEmployeesForDate, getTeamCalendar } from '@/lib/services/availabilityService';
import { getShopById } from '@/lib/services/shopService';

// Dükkanın müsaitlik durumlarını getirme
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
    const employeeId = url.searchParams.get('employeeId') || undefined;
    const dateParam = url.searchParams.get('date');
    const view = url.searchParams.get('view');
    
    // Belirli bir tarih için müsait çalışanları getir
    if (dateParam) {
      const date = new Date(dateParam);
      const availableEmployees = await getAvailableEmployeesForDate(shopId, date);
      
      return NextResponse.json({
        date: dateParam,
        availableEmployees
      });
    }
    
    // Takım takvimi görünümü için
    if (view === 'team' && startDateParam && endDateParam) {
      const startDate = new Date(startDateParam);
      const endDate = new Date(endDateParam);
      
      const teamCalendar = await getTeamCalendar(shopId, startDate, endDate);
      
      return NextResponse.json(teamCalendar);
    }
    
    // Normal müsaitlik durumlarını getir
    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const endDate = endDateParam ? new Date(endDateParam) : undefined;
    
    const availabilities = await getShopAvailability(shopId, {
      startDate,
      endDate,
      employeeId
    });
    
    return NextResponse.json(availabilities);
  } catch (error) {
    console.error('Dükkan müsaitlik durumları getirilemedi:', error);
    return NextResponse.json(
      { error: 'Dükkan müsaitlik durumları getirilemedi' },
      { status: 500 }
    );
  }
}