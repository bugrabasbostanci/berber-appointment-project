import { NextRequest, NextResponse } from 'next/server';
import { checkAvailabilityWithAppointments } from '@/lib/services/availabilityService';

// Müsaitlik durumunu randevularla karşılaştırma (boş zaman aralıklarını bulma)
export async function GET(req: NextRequest) {
  try {
    // URL parametrelerini al
    const url = new URL(req.url);
    const shopId = url.searchParams.get('shopId');
    const employeeId = url.searchParams.get('employeeId');
    const dateParam = url.searchParams.get('date');
    
    if (!shopId || !employeeId || !dateParam) {
      return NextResponse.json(
        { error: 'shopId, employeeId ve date parametreleri zorunludur' },
        { status: 400 }
      );
    }
    
    const date = new Date(dateParam);
    
    // Müsaitlik durumunu randevularla karşılaştır
    const availabilityCheck = await checkAvailabilityWithAppointments(shopId, employeeId, date);
    
    return NextResponse.json(availabilityCheck);
  } catch (error) {
    console.error('Müsaitlik kontrolü yapılamadı:', error);
    return NextResponse.json(
      { error: 'Müsaitlik kontrolü yapılamadı' },
      { status: 500 }
    );
  }
}