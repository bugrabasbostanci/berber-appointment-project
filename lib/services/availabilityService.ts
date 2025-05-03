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
    // Eğer userId tanımlanmamışsa, null ise veya "undefined" ise varsayılan müsaitlik bilgilerini kullanalım
    if (!userId || userId === "undefined" || userId === '') {
      console.log(`checkAvailabilityWithAppointments: userId geçerli değil (${userId}). Varsayılan değerler kullanılacak.`);
      
      // O gün için mevcut randevuları getir (dükkan bazında)
      const appointments = await prisma.appointment.findMany({
        where: {
          shopId,
          date
        },
        select: {
          time: true,
          endTime: true
        }
      });
      
      // Randevulardan dolu saatleri döndür, müsaitliği true olarak belirt
      return {
        isAvailable: true,
        availableTimeSlots: [], // Boş array, UI varsayılan zamanları kullanacak
        bookedTimeSlots: appointments.map(app => ({
          start: app.time,
          end: app.endTime
        }))
      };
    }
    
    // userId "default-" ile başlıyorsa, bu varsayılan personel demektir, hataya düşmesini engelleyelim
    if (userId.startsWith('default-')) {
      console.log(`Varsayılan personel ID kullanıldı: ${userId}. Varsayılan değerler döndürülüyor.`);
      
      // O gün için mevcut randevuları getir (dükkan bazında)
      const appointments = await prisma.appointment.findMany({
        where: {
          shopId,
          date
        },
        select: {
          time: true,
          endTime: true
        }
      });
      
      return {
        isAvailable: true,
        availableTimeSlots: [], // Boş döndürerek varsayılan zamanların kullanılmasını sağlayacağız
        bookedTimeSlots: appointments.map(app => ({
          start: app.time,
          end: app.endTime
        }))
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
    const appointments = await prisma.appointment.findMany({
      where: {
        shopId,
        date
        // userId'yi sorgudan çıkartalım çünkü bu personelin ID'si, randevuları kaydettiğimiz yerde müşteri ID'si var
      },
      select: {
        time: true,
        endTime: true
      }
    });

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
