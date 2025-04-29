import { NextResponse } from 'next/server';
import { createAppointment, getCustomerAppointments, getEmployeeAppointments, getShopAppointmentsByDate } from '@/lib/services/appointmentService';
import { createClient } from '@/lib/supabase/server';

// GET - Kullanıcının rolüne göre randevuları getir
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Kullanıcı oturumunu kontrol et
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const userId = user.id;
    const role = user.user_metadata?.role || 'CUSTOMER';
    
    // Parametreleri al
    const shopId = searchParams.get('shopId');
    const date = searchParams.has('date') ? new Date(searchParams.get('date')!) : undefined;
    const past = searchParams.get('past') === 'true';
    const take = searchParams.has('take') ? parseInt(searchParams.get('take')!, 10) : undefined;
    const skip = searchParams.has('skip') ? parseInt(searchParams.get('skip')!, 10) : undefined;
    
    let appointments;
    
    // Rol bazlı sorgu
    try {
      if (role === 'CUSTOMER') {
        appointments = await getCustomerAppointments(userId, { past, take, skip });
      } 
      else if (role === 'EMPLOYEE' || role === 'BARBER') {
        appointments = await getEmployeeAppointments(userId, { 
          date, 
          shopId: shopId || undefined 
        });
      } 
      else if (role === 'ADMIN' && shopId && date) {
        appointments = await getShopAppointmentsByDate(shopId, date);
      } 
      else {
        // Geçersiz parametreler durumunda bile boş dizi döndür
        return NextResponse.json([]);
      }
    } catch (queryError) {
      console.error("Randevu sorgusunda hata:", queryError);
      return NextResponse.json([]);
    }
    
    // Randevular bulunamazsa boş dizi döndür, hata değil
    const appointmentsResult = appointments || [];
    
    return NextResponse.json(appointmentsResult);
  } catch (error) {
    console.error("Randevuları getirirken hata:", error);
    // Hata olsa bile boş dizi döndür
    return NextResponse.json([]);
  }
}

// POST - Yeni randevu oluştur
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Kullanıcı oturumunu kontrol et
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }
    
    const body = await request.json();
    const { shopId, employeeId, date, time, endTime, notes } = body;
    
    // Gerekli alanların kontrolü
    if (!shopId || !employeeId || !date || !time || !endTime) {
      return NextResponse.json({ error: 'Tüm zorunlu alanlar doldurulmalıdır' }, { status: 400 });
    }
    
    // Yeni randevu oluştur
    const appointment = await createAppointment({
      shopId,
      userId: user.id,
      employeeId,
      date: new Date(date),
      time: new Date(time),
      endTime: new Date(endTime),
      notes
    });
    
    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('Randevu oluşturulurken hata:', error);
    return NextResponse.json({ error: 'Randevu oluşturulurken bir hata oluştu' }, { status: 500 });
  }
}
