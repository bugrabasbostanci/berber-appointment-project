import { AvailableTime, Prisma, User } from '@prisma/client';
import { prisma } from '../prisma';

// Müsaitlik durumu oluşturma - employeeId olmadığı için değiştirildi
export async function createAvailability(data: {
  shopId: string;
  date: Date;
  isAvailable: boolean;
  timeSlots: Prisma.InputJsonValue; // Müsaitlik zaman aralıkları (09:30-10:15, 10:15-11:00, vb.)
  reason?: string;
}): Promise<AvailableTime> {
  return prisma.availableTime.create({
    data
  });
}

// ID'ye göre müsaitlik durumu getirme
export async function getAvailabilityById(id: string): Promise<AvailableTime | null> {
  return prisma.availableTime.findUnique({
    where: { id }
  });
}

// Müsaitlik durumu güncelleme
export async function updateAvailability(
  id: string,
  data: Prisma.AvailableTimeUpdateInput
): Promise<AvailableTime> {
  return prisma.availableTime.update({
    where: { id },
    data
  });
}

// Müsaitlik durumu silme
export async function deleteAvailability(id: string): Promise<AvailableTime> {
  return prisma.availableTime.delete({
    where: { id }
  });
}

// Belirli bir dükkan için müsaitlik durumlarını getirme
export async function getShopAvailability(
  shopId: string,
  params: {
    startDate?: Date;
    endDate?: Date;
  } = {}
): Promise<AvailableTime[]> {
  const { startDate, endDate } = params;
  const where: Prisma.AvailableTimeWhereInput = { shopId };

  // Tarih filtreleri için AND koşulları oluştur
  const dateConditions: Prisma.AvailableTimeWhereInput[] = [];
  
  if (startDate) {
    dateConditions.push({ date: { gte: startDate } });
  }

  if (endDate) {
    dateConditions.push({ date: { lte: endDate } });
  }

  // Tarih koşulları varsa, bunları where sorgusuna ekleyelim
  if (dateConditions.length > 0) {
    where.AND = dateConditions;
  }

  return prisma.availableTime.findMany({
    where,
    include: {
      profiles: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }
    },
    orderBy: { date: 'asc' }
  });
}

// Belirli bir kullanıcı için müsaitlik durumlarını getirme
export async function getUserAvailability(
  userId: string,
  params: {
    startDate?: Date;
    endDate?: Date;
    shopId?: string;
  } = {}
): Promise<AvailableTime[]> {
  const { startDate, endDate, shopId } = params;
  
  // Kullanıcının profilini al
  const profile = await prisma.profile.findUnique({
    where: { userId }
  });

  if (!profile) {
    return [];
  }

  // Tarih filtreleri için where koşulunu oluştur
  const where: Prisma.AvailableTimeWhereInput = {
    profiles: {
      some: {
        userId
      }
    }
  };

  // Tarih filtreleri için AND koşulları oluştur
  const dateConditions: Prisma.AvailableTimeWhereInput[] = [];
  
  if (startDate) {
    dateConditions.push({ date: { gte: startDate } });
  }

  if (endDate) {
    dateConditions.push({ date: { lte: endDate } });
  }

  // Tarih koşulları varsa, bunları where sorgusuna ekleyelim
  if (dateConditions.length > 0) {
    where.AND = dateConditions;
  }

  if (shopId) {
    where.shopId = shopId;
  }

  return prisma.availableTime.findMany({
    where,
    include: {
      shop: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: { date: 'asc' }
  });
}

// Belirli bir tarih için müsait kullanıcıları bulma
export async function getAvailableUsersForDate(
  shopId: string,
  date: Date
): Promise<{ userId: string; firstName: string | null; lastName: string | null }[]> {
  // İlgili tarih için müsait olan zaman dilimleri
  const availableTimes = await prisma.availableTime.findMany({
    where: {
      shopId,
      date,
      isAvailable: true
    },
    include: {
      profiles: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }
    }
  });

  // Profilleri olan kullanıcıları bulalım
  const users: { userId: string; firstName: string | null; lastName: string | null }[] = [];
  
  for (const time of availableTimes) {
    for (const profile of time.profiles) {
      users.push({
        userId: profile.user.id,
        firstName: profile.user.firstName,
        lastName: profile.user.lastName
      });
    }
  }

  // Tekrar eden kullanıcıları filtreleyelim
  return Array.from(
    new Map(users.map(user => [user.userId, user])).values()
  );
}

// Birden çok müsaitlik durumu oluşturma
export async function createManyAvailabilities(
  data: {
    shopId: string;
    date: Date;
    isAvailable: boolean;
    timeSlots: Prisma.InputJsonValue;
    reason?: string;
  }[]
): Promise<Prisma.BatchPayload> {
  return prisma.availableTime.createMany({
    data
  });
}

// Belirli bir tarih aralığı için bir kullanıcının müsaitlik durumlarını toplu güncelleme
export async function updateAvailabilityRange(
  userId: string,
  shopId: string,
  startDate: Date,
  endDate: Date,
  data: {
    isAvailable: boolean;
    timeSlots?: Prisma.InputJsonValue;
    reason?: string;
  }
): Promise<Prisma.BatchPayload> {
  // Kullanıcının profilini al
  const profile = await prisma.profile.findUnique({
    where: { userId }
  });

  if (!profile) {
    throw new Error('Kullanıcı profili bulunamadı');
  }

  // Belirtilen tarih aralığında ve dükkan için müsaitlik zamanlarını bul
  const availableTimes = await prisma.availableTime.findMany({
    where: {
      shopId,
      date: {
        gte: startDate,
        lte: endDate
      },
      profiles: {
        some: {
          userId
        }
      }
    }
  });

  // Her bir müsaitlik zamanını güncelle
  let updatedCount = 0;
  for (const time of availableTimes) {
    await prisma.availableTime.update({
      where: { id: time.id },
      data
    });
    updatedCount++;
  }

  return { count: updatedCount };
}

// Müsaitlik durumlarını randevularla karşılaştırma
export async function checkAvailabilityWithAppointments(
  shopId: string,
  userId: string | null | undefined, // employeeId yerine userId kullanıyoruz
  date: Date
): Promise<{ 
  isAvailable: boolean; 
  availableTimeSlots: any; 
  bookedTimeSlots: { start: Date; end: Date }[];
}> {
  try {
    // Eğer userId tanımlanmamışsa, null ise veya "undefined" ise boş liste döndürüyoruz
    // Bu, henüz bir personel seçilmemişse, tüm zamanları boş göstermek anlamına gelir
    if (!userId || userId === "undefined" || userId === '') {
      console.log(`checkAvailabilityWithAppointments: userId geçerli değil (${userId}). Müsaitlik 'false' ve boş randevu listesi döndürülüyor.`);
      return {
        isAvailable: false,
        availableTimeSlots: [],
        bookedTimeSlots: []
      };
    }

    // İlk olarak dükkan bilgilerini getirelim (berber ID'sini bilmek için)
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: {
        id: true,
        ownerId: true
      }
    });
    
    if (!shop) {
      console.log(`Dükkan bulunamadı: shopId=${shopId}`);
      return {
        isAvailable: true,
        availableTimeSlots: [],
        bookedTimeSlots: []
      };
    }
    
    // Kullanıcının bağlı olduğu müsaitlik durumunu bul
    const availableTime = await prisma.availableTime.findFirst({
      where: {
        shopId,
        date,
        profiles: {
          some: {
            userId
          }
        }
      }
    });
    
    // Eğer kullanıcıya bağlı müsaitlik bulunamazsa, doğrudan dükkanın o gün için müsaitliğini kontrol et
    let effectiveAvailableTime = availableTime;
    if (!effectiveAvailableTime) {
      console.log(`Kullanıcı (${userId}) için müsaitlik bulunamadı. Dükkanın müsaitliği kontrol ediliyor.`);
      effectiveAvailableTime = await prisma.availableTime.findFirst({
        where: {
          shopId,
          date
        }
      });
    }

    // O gün için mevcut randevuları getir
    // Artık sadece belirli çalışana ait randevuları filtreleyeceğiz
    const allAppointments = await prisma.appointment.findMany({
      where: {
        shopId,
        date
      },
      select: {
        id: true,
        time: true,
        endTime: true,
        notes: true
      }
    });
    
    // Notes alanından employeeId bilgisini çıkarıp, sadece ilgili çalışanın randevularını filtreleme
    const appointments = allAppointments.filter(app => {
      // Eğer personel ID'si belirtilmemişse veya berber ID'si ise tüm randevuları göster
      if (!userId || userId === shop?.ownerId) {
        return true;
      }
      
      // Personel seçiliyse, sadece o personele ait randevuları göster
      if (app.notes && app.notes.includes(`EmployeeId:${userId}`)) {
        return true;
      }
      
      // Personel belirtilmemiş randevular berber içindir
      if (!app.notes || !app.notes.includes('EmployeeId:')) {
        return false; // Personel için bu randevuları gösterme
      }
      
      return false;
    });
    
    console.log(`${allAppointments.length} randevudan ${appointments.length} tanesi ${userId} ID'li çalışan için`);

    // Eğer müsaitlik kaydı yoksa bile, bir varsayılan durum oluşturalım
    if (!effectiveAvailableTime) {
      console.log(`Dükkan için de müsaitlik bulunamadı: shopId=${shopId}, date=${date.toISOString()}. Varsayılan müsaitlik döndürülüyor.`);
      return {
        isAvailable: true, // Varsayılan olarak müsait kabul edelim
        availableTimeSlots: [], // Boş array döndürerek UI'ın varsayılan zamanları kullanmasını sağlayalım
        bookedTimeSlots: appointments.map(app => ({
          start: app.time,
          end: app.endTime
        }))
      };
    }

    // Müsaitlik varsa ama isAvailable false ise
    if (effectiveAvailableTime && !effectiveAvailableTime.isAvailable) {
      console.log(`Müsaitlik kaydı bulundu ama müsait değil: shopId=${shopId}, userId=${userId}, date=${date.toISOString()}`);
      return {
        isAvailable: false,
        availableTimeSlots: [],
        bookedTimeSlots: appointments.map(app => ({
          start: app.time,
          end: app.endTime
        }))
      };
    }

    // Aksi takdirde müsaitlik durumunu ve randevuları döndür
    console.log(`Müsaitlik bulundu: shopId=${shopId}, userId=${userId}, date=${date.toISOString()}`);
    return {
      isAvailable: true,
      availableTimeSlots: effectiveAvailableTime.timeSlots,
      bookedTimeSlots: appointments.map(app => ({
        start: app.time,
        end: app.endTime
      }))
    };
  } catch (error) {
    console.error('Müsaitlik kontrolü hata:', error);
    // Hata durumunda varsayılan değer döndür - müsait kabul edelim ve boş dizi döndürelim
    return {
      isAvailable: true, // Hata durumunda varsayılan olarak müsait kabul edelim
      availableTimeSlots: [],
      bookedTimeSlots: []
    };
  }
}

// Dükkanın takvimini getirme
export async function getShopCalendar(
  shopId: string,
  startDate: Date,
  endDate: Date
): Promise<any> {
  // 1. Dükkanın sahibini ve ilgili kullanıcı bilgilerini getir
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  if (!shop) {
    return [];
  }

  // 2. Dükkana ait müsaitlik bilgilerini getir
  const availabilities = await prisma.availableTime.findMany({
    where: {
      shopId,
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      profiles: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }
    }
  });

  // 3. Dükkana ait randevuları getir
  const appointments = await prisma.appointment.findMany({
    where: {
      shopId,
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  // 4. Tüm bilgileri birleştir ve döndür
  return {
    shop,
    availabilities,
    appointments
  };
}

export type DailyCalendarInfo = {
  date: string; // YYYY-MM-DD
  isSpecificallyClosed: boolean;
  bookedAppointmentsCount: number;
  // İleride dükkanın o gün için genel çalışma saatleri/kapasitesi de eklenebilir
};

/**
 * Belirli bir dükkan için aylık takvim görünümüne uygun müsaitlik ve randevu bilgilerini getirir.
 * İstenen tarih aralığındaki her gün için veri döndürür. (Optimize Edilmiş Versiyon)
 */
export async function getShopMonthlyCalendarView(
  shopId: string,
  startDate: Date, // UTC gün başlangıcı
  endDate: Date    // UTC gün sonu (dahil)
): Promise<DailyCalendarInfo[]> {
  console.log(`[getShopMonthlyCalendarView OPTIMIZED] Starting for shopId: ${shopId} from ${startDate.toISOString()} to ${endDate.toISOString()}`);

  // 1. Belirtilen tarih aralığındaki tüm ilgili AvailableTime kayıtlarını çek
  const availableTimeRecords = await prisma.availableTime.findMany({
    where: {
      shopId: shopId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });
  const availableTimeMap = new Map(
    availableTimeRecords.map(r => [r.date.toISOString().split('T')[0], r])
  );
  console.log(`[getShopMonthlyCalendarView OPTIMIZED] Fetched ${availableTimeRecords.length} AvailableTime records.`);

  // 2. Belirtilen tarih aralığındaki tüm ilgili Appointment kayıtlarını say (tarihe göre gruplayarak)
  // Appointment modelindeki 'date' alanı günün başlangıcını (00:00:00 UTC) tutuyorsa groupBy ['date'] yeterlidir.
  // Eğer 'date' alanı saati de içeriyorsa, gün bazında gruplama için ek işlem gerekebilir.
  // Şimdilik 'date' alanının günün başlangıcını tuttuğunu varsayıyoruz veya Prisma'nın bunu doğru şekilde gruplayabildiğini.
  const appointmentCountsByDateRaw = await prisma.appointment.groupBy({
    by: ['date'],
    where: {
      shopId: shopId,
      date: {
        gte: startDate,
        lte: endDate,
      },
      // Gerekirse randevu durumuna göre filtre ekleyin
      // status: AppointmentStatus.CONFIRMED, 
    },
    _count: {
      id: true, // veya _all: true
    },
    orderBy: { // İsteğe bağlı, ama işlerken sıralı olması yardımcı olabilir
      date: 'asc',
    }
  });

  const bookedCountsMap = new Map<string, number>();
  appointmentCountsByDateRaw.forEach(item => {
    // item.date bir Date nesnesi olacak. Bunu YYYY-MM-DD string'ine çevir.
    const dayString = item.date.toISOString().split('T')[0];
    bookedCountsMap.set(dayString, item._count.id || 0);
  });
  console.log(`[getShopMonthlyCalendarView OPTIMIZED] Fetched ${appointmentCountsByDateRaw.length} date groups for Appointment counts.`);

  // 3. Sonuçları oluşturmak için tarih aralığında döngü yap (veritabanı sorgusu olmadan)
  const results: DailyCalendarInfo[] = [];
  const currentDate = new Date(startDate);
  const loopEndDate = new Date(endDate); // endDate zaten gün sonu, döngü için +1 gün
  loopEndDate.setUTCDate(loopEndDate.getUTCDate() + 1);
  loopEndDate.setUTCHours(0,0,0,0);


  while (currentDate < loopEndDate) {
    const dayString = currentDate.toISOString().split('T')[0];
    
    const availableTimeRecord = availableTimeMap.get(dayString);
    const isSpecificallyClosed = availableTimeRecord ? !availableTimeRecord.isAvailable : false;
    const bookedAppointmentsCount = bookedCountsMap.get(dayString) || 0;

    results.push({
      date: dayString,
      isSpecificallyClosed,
      bookedAppointmentsCount,
    });

    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }
  
  console.log(`[getShopMonthlyCalendarView OPTIMIZED] Finished processing. Generated ${results.length} daily records.`);
  return results;
}

