import { NextResponse } from 'next/server';
import { createAppointment, getCustomerAppointments, getEmployeeAppointments, getShopAppointmentsByDate } from '@/lib/services/appointmentService';
import { createClient } from '@/lib/supabase/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    
    // Tarih parametresini düzeltme - zaman dilimi farkını ortadan kaldır
    let date;
    if (searchParams.has('date')) {
      const dateStr = searchParams.get('date')!;
      // YYYY-MM-DD formatındaki tarih bilgisini al, sadece saat kısmını 00:00:00 olarak ayarla
      const [year, month, day] = dateStr.split('-').map(Number);
      date = new Date(year, month - 1, day);
      date.setHours(0, 0, 0, 0);
      console.log(`API - alınan tarih: ${dateStr}, dönüştürülen tarih: ${date.toISOString()}`);
    }
    
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
      else if ((role === 'ADMIN' || role === 'BARBER') && shopId && date) {
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
    const { shopId, date, time, endTime, notes, employeeId } = body;
    
    // Gerekli alanların kontrolü
    if (!shopId || !date || !time || !endTime) {
      return NextResponse.json({ error: 'Tüm zorunlu alanlar doldurulmalıdır' }, { status: 400 });
    }
    
    // Eğer personel belirtilmemişse bir uyarı logla
    if (!employeeId) {
      console.warn('Randevu oluşturulurken personel ID belirtilmedi. Varsayılan dükkan sahibi kullanılacak.');
    }
    
    // Randevunun gerçekten müsait olup olmadığını kontrol et
    const dateObj = new Date(date);
    const timeObj = new Date(time);
    const endTimeObj = new Date(endTime);
    
    console.log(`Randevu kontrolü: Tarih=${dateObj.toISOString()}, Başlangıç=${timeObj.toISOString()}, Bitiş=${endTimeObj.toISOString()}`);
    
    // Aynı saatte başka bir randevu var mı kontrol et
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        shopId,
        date: {
          equals: dateObj
        }
      }
    });
    
    console.log(`Seçilen tarihte ${existingAppointments.length} randevu bulundu`);
    
    // Randevular arasında çakışma kontrolü
    const conflictingAppointment = existingAppointments.find(app => {
      const appTimeObj = new Date(app.time);
      const appEndTimeObj = new Date(app.endTime);
      
      console.log(`Mevcut randevu: ${appTimeObj.getHours()}:${appTimeObj.getMinutes()}, Yeni randevu: ${timeObj.getHours()}:${timeObj.getMinutes()}`);
      
      // Personel belirtilmemişse veya notlarda employeeId yoksa, berber içindir
      const isForSameEmployee = 
        !employeeId || 
        !app.notes || 
        !app.notes.includes('EmployeeId:') || 
        app.notes.includes(`EmployeeId:${employeeId}`);
      
      if (!isForSameEmployee) {
        return false; // Farklı çalışanlar için çakışma olmaz
      }
      
      // Saat bazında basit çakışma kontrolü (saat ve dakika aynıysa)
      return appTimeObj.getHours() === timeObj.getHours() && 
             appTimeObj.getMinutes() === timeObj.getMinutes();
    });
    
    if (conflictingAppointment) {
      console.log(`Çakışan randevu bulundu: ${conflictingAppointment.id}`);
      return NextResponse.json({ 
        error: 'Bu saat dolu. Lütfen başka bir saat seçin.',
        details: 'Seçtiğiniz saat için zaten bir randevu bulunmaktadır.'
      }, { status: 409 });
    }
    
    // Randevu oluştur
    const appointment = await createAppointment({
      shopId,
      userId: user.id,
      date: dateObj,
      time: timeObj,
      endTime: endTimeObj,
      notes,
      employeeId
    });
    
    return NextResponse.json({ 
      appointment,
      success: true 
    });
  } catch (error) {
    console.error('Randevu oluşturma hatası:', error);
    return NextResponse.json({ error: 'Randevu oluşturulamadı' }, { status: 500 });
  }
}
