import { NextRequest, NextResponse } from 'next/server';
import { checkAvailabilityWithAppointments } from '@/lib/services/availabilityService';
import { getShopById } from '@/lib/services/shopService';
import { prisma } from '@/lib/prisma';

// Müsaitlik durumunu randevularla karşılaştırma (boş zaman aralıklarını bulma)
export async function GET(req: NextRequest) {
  try {
    // URL parametrelerini al
    const url = new URL(req.url);
    const shopId = url.searchParams.get('shopId');
    const employeeId = url.searchParams.get('employeeId');
    const dateParam = url.searchParams.get('date');
    
    console.log(`Alınan parametreler: shopId=${shopId}, employeeId=${employeeId}, date=${dateParam}`);
    
    // Eksik parametre kontrolü - employeeId opsiyonel olacak
    if (!shopId || !dateParam) {
      return NextResponse.json(
        { error: 'Eksik parametreler: shopId ve date zorunludur' },
        { status: 400 }
      );
    }
    
    const date = new Date(dateParam);
    
    // EmployeeId yoksa veya boş string ise, önce veritabanında düzgün çalışan bir personel bulmaya çalışalım
    let finalEmployeeId = employeeId || '';
    
    // Henüz bir personel seçilmemişse (employeeId boş gelmiş) tüm saatleri müsait olarak döndür
    if (!finalEmployeeId || finalEmployeeId === '') {
      console.log('EmployeeId eksik, tüm saatleri müsait olarak gösteriyoruz. Personel seçildiğinde gerçek müsaitlik kontrol edilecek.');
      
      // Tüm saat dilimlerini içeren varsayılan dizi
      const timeSlots = [
        "09:30", "10:15", "11:00", "11:45", "12:30", "13:15", 
        "14:00", "14:45", "15:30", "16:15", "17:00", "17:45",
        "18:30", "19:15", "20:00", "20:45"
      ];
      
      // Tüm saatleri müsait olarak işaretle
      const availableTimes = timeSlots.map((time, index) => ({
        id: (index + 1).toString(),
        time: time,
        available: true
      }));
      
      return NextResponse.json({
        success: true,
        isAvailable: true,
        bookedTimeSlots: [], // Boş dizi - randevu yok
        availableTimes: availableTimes,
        date: date.toISOString().split('T')[0]
      });
    }
    
    // Müsaitlik durumunu kontrol et
    const availabilityData = await checkAvailabilityWithAppointments(shopId, finalEmployeeId, date);
    
    // Müsait zamanları formatla (frontend için kullanılabilir yapıya dönüştür)
    const availableTimes: Array<{id: string; time: string; available: boolean}> = [];
    
    // Kullanılabilir zaman dilimleri  
    if (availabilityData.isAvailable) {
      // Sabit zaman dilimlerini kullanabiliriz, çünkü veritabanındaki timeSlots JSON değeri
      // her durumda aynı formatta olmayabilir
      const timeSlots = [
        "09:30", "10:15", "11:00", "11:45", "12:30", "13:15", 
        "14:00", "14:45", "15:30", "16:15", "17:00", "17:45",
        "18:30", "19:15", "20:00", "20:45"
      ];
      
      // Rezerve edilmiş randevuları daha güvenli bir şekilde kontrol edelim
      console.log('Dolu randevular:', availabilityData.bookedTimeSlots);
      
      // Her bir zaman dilimi için kontrolü iyileştirelim
      timeSlots.forEach((timeSlot, index) => {
        // Zaman dilimini saat ve dakika olarak ayıralım (11:00 -> saat: 11, dakika: 0)
        const [hour, minute] = timeSlot.split(':').map(Number);
        
        // Bu zaman dilimi için bir Date nesnesi oluşturalım
        const slotDate = new Date(date);
        slotDate.setHours(hour, minute, 0, 0);
        
        // Randevular içerisinde bu zaman dilimiyle çakışan var mı kontrol edelim
        const isTimeBooked = availabilityData.bookedTimeSlots.some(bookedSlot => {
          const bookedStart = new Date(bookedSlot.start);
          const bookedEnd = new Date(bookedSlot.end);
          
          // Saat ve dakikaları alalım
          const bookedStartHour = bookedStart.getHours();
          const bookedStartMinute = bookedStart.getMinutes();
          
          // bookedStartHour ve bookedStartMinute değerlerini logla
          console.log(`Randevu zamanı: ${bookedStartHour}:${bookedStartMinute} - Kontrol edilen saat: ${hour}:${minute}`);
          
          // Basit bir şekilde, randevu başlangıç saati ve dakikası bizim slot saati ve dakikamıza eşit mi kontrol edelim
          return bookedStartHour === hour && bookedStartMinute === minute;
        });
        
        availableTimes.push({
          id: (index + 1).toString(),
          time: timeSlot,
          available: !isTimeBooked
        });
      });
    } else {
      // Müsaitlik false ise tüm saatler müsait değil olarak işaretlensin
      const timeSlots = [
        "09:30", "10:15", "11:00", "11:45", "12:30", "13:15", 
        "14:00", "14:45", "15:30", "16:15", "17:00", "17:45",
        "18:30", "19:15", "20:00", "20:45"
      ];
      
      timeSlots.forEach((time, index) => {
        availableTimes.push({
          id: (index + 1).toString(),
          time: time,
          available: false
        });
      });
    }
    
    // Yanıt döndür
    return NextResponse.json({
      success: true,
      isAvailable: availabilityData.isAvailable,
      bookedTimeSlots: availabilityData.bookedTimeSlots,
      availableTimes: availableTimes,
      date: date.toISOString().split('T')[0]
    });
    
  } catch (error) {
    console.error('Müsaitlik kontrolü hatası:', error);
    return NextResponse.json(
      { error: 'Müsaitlik kontrolü sırasında bir hata oluştu', details: error },
      { status: 500 }
    );
  }
}