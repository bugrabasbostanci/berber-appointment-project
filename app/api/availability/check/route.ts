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
    
    if (!finalEmployeeId || finalEmployeeId === '') {
      console.log('EmployeeId eksik, dükkana bağlı personel aranıyor...');
      
      try {
        // Veritabanından dükkana bağlı bir personel bul
        const employee = await prisma.user.findFirst({
          where: {
            profile: {
              availableTime: {
                shopId: shopId
              }
            },
            role: {
              in: ['BARBER', 'EMPLOYEE']
            }
          },
          select: {
            id: true
          }
        });
        
        if (employee) {
          console.log(`Veritabanından bir personel bulundu, ID: ${employee.id}`);
          finalEmployeeId = employee.id;
        } else {
          console.log('Veritabanında bu dükkana bağlı personel bulunamadı');
        }
      } catch (dbError) {
        console.error('Personel arama hatası:', dbError);
      }
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
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
        "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", 
        "16:00", "16:30", "17:00", "17:30", "18:00", "18:30"
      ];
      
      // Zaten rezerve edilmiş zamanları bu dilimlerden çıkarabiliriz
      const bookedTimes = availabilityData.bookedTimeSlots.map(slot => {
        // Date nesnesini "HH:MM" formatına dönüştür  
        return new Date(slot.start).toLocaleTimeString('tr-TR', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false
        });
      });
      
      // Hazır bir format oluşturalım
      timeSlots.forEach((time, index) => {
        availableTimes.push({
          id: (index + 1).toString(),
          time: time,
          available: !bookedTimes.includes(time)
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