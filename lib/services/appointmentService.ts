import { Appointment, Prisma } from '@prisma/client';
import { prisma } from '../prisma';

// Randevu oluşturma
export async function createAppointment(data: {
  shopId: string;
  userId: string;
  date: Date;
  time: Date;
  endTime: Date;
  notes?: string;
  employeeId?: string; // Personel/berber ID'si
}): Promise<Appointment> {
  const { employeeId, ...appointmentData } = data;
  
  // Notes alanına employeeId bilgisini ekleyelim
  let notes = appointmentData.notes || '';
  
  // Eğer employeeId varsa, notes alanına "EmployeeId:[id]" şeklinde ekleyelim
  if (employeeId) {
    if (notes) {
      notes += '\n';
    }
    notes += `EmployeeId:${employeeId}`;
  }
  
  return prisma.appointment.create({
    data: {
      ...appointmentData,
      notes
    }
  });
}

// ID'ye göre randevu getirme
export async function getAppointmentById(id: string): Promise<Appointment | null> {
  return prisma.appointment.findUnique({
    where: { id },
    include: {
      shop: true,
      user: true,
      review: true
    }
  });
}

// Randevu güncelleme
export async function updateAppointment(
  id: string,
  data: Prisma.AppointmentUpdateInput
): Promise<Appointment> {
  return prisma.appointment.update({
    where: { id },
    data
  });
}

// Randevu silme
export async function deleteAppointment(id: string): Promise<Appointment> {
  return prisma.appointment.delete({
    where: { id }
  });
}

// Müşterinin randevularını getirme
export async function getCustomerAppointments(
  userId: string,
  params: {
    past?: boolean; // Geçmiş veya gelecek randevuları filtrelemek için
    skip?: number;
    take?: number;
  } = {}
): Promise<Appointment[]> {
  const { past = false, skip, take } = params;
  const now = new Date();

  // Tarih filtresini oluştur
  let dateFilter: Prisma.DateTimeFilter = past
    ? { lt: now }
    : { gte: now };

  return prisma.appointment.findMany({
    where: {
      userId,
      OR: [
        { date: dateFilter },
        {
          date: new Date(now.setHours(0, 0, 0, 0)),
          time: dateFilter
        }
      ]
    },
    include: {
      shop: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      review: true
    },
    orderBy: past
      ? [{ date: 'desc' }, { time: 'desc' }]
      : [{ date: 'asc' }, { time: 'asc' }],
    skip,
    take
  });
}

// Çalışanın (berber/personel) randevularını getirme
export async function getEmployeeAppointments(
  userId: string,
  params: {
    date?: Date;
    startDate?: Date;
    endDate?: Date;
    shopId?: string;
  } = {}
): Promise<Appointment[]> {
  const { date, startDate, endDate, shopId } = params;
  const where: Prisma.AppointmentWhereInput = {};
  
  // Kullanıcıyı bul ve rolünü kontrol et
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true }
  });
  
  if (!user || (user.role !== 'BARBER' && user.role !== 'EMPLOYEE')) {
    return []; // Kullanıcı çalışan değilse boş dizi döndür
  }
  
  // Dükkanların sahibi/çalışanı olduğu randevuları getir
  if (user.role === 'BARBER') {
    // Berber, dükkanın sahibi olduğu randevuları görebilir
    const shops = await prisma.shop.findMany({
      where: { ownerId: userId },
      select: { id: true }
    });
    
    if (shops.length > 0) {
      where.shopId = { in: shops.map(shop => shop.id) };
    }
  }
  
  // Tek bir gün için filtreleme
  if (date) {
    where.date = date;
  }
  // Tarih aralığı için filtreleme
  else if (startDate || endDate) {
    const dateConditions: Prisma.AppointmentWhereInput[] = [];
    
    if (startDate) {
      dateConditions.push({ date: { gte: startDate } });
    }
    
    if (endDate) {
      dateConditions.push({ date: { lte: endDate } });
    }
    
    if (dateConditions.length > 0) {
      where.AND = dateConditions;
    }
  }

  // Belirli bir dükkan için filtreleme
  if (shopId) {
    where.shopId = shopId;
  }

  return prisma.appointment.findMany({
    where,
    include: {
      shop: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true
        }
      },
      review: true
    },
    orderBy: [
      { date: 'asc' },
      { time: 'asc' }
    ]
  });
}

// Dükkanın belirli bir tarihteki randevularını getirme
export async function getShopAppointmentsByDate(
  shopId: string,
  date: Date, // Frontend'den gelen tarih (new Date() ile oluşturulmuş)
  userId?: string
): Promise<Appointment[]> { 
  
  // Günün başlangıcını al (frontend'den gelen tarihe göre)
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);

  // Ertesi günün başlangıcını al
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 1);
  
  console.log(`[SERVICE DEBUG] getShopAppointmentsByDate called for shopId: ${shopId}, date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);

  const whereCondition: Prisma.AppointmentWhereInput = {
    shopId,
    date: {
      gte: startDate, // Belirtilen günün başlangıcından büyük veya eşit
      lt: endDate,    // Ertesi günün başlangıcından küçük
    },
  };

  // Takvim sayfası müşteri ID'sine göre filtreleme yapmıyor, o yüzden bu kısım şimdilik gereksiz.
  // if (userId) {
  //   whereCondition.userId = userId;
  // }

  try {
    const appointments = await prisma.appointment.findMany({
      where: whereCondition,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            profile: true, 
          },
        },
        shop: true, 
        review: true, 
      },
      orderBy: { time: 'asc' },
    });

    console.log(`[SERVICE DEBUG] Prisma findMany returned ${appointments.length} appointments for shopId ${shopId} covering range starting ${startDate.toISOString()}.`);
    if (appointments.length > 0) {
      console.log('[SERVICE DEBUG] First appointment sample (id, date, time, notes):',
        {
          id: appointments[0].id,
          date: appointments[0].date,
          time: appointments[0].time,
          notes: appointments[0].notes
        });
    }
    return appointments;

  } catch (error) {
    console.error(`[SERVICE ERROR] Error in getShopAppointmentsByDate for shopId ${shopId}, date range starting ${startDate.toISOString()}:`, error);
    throw error; 
  }
}

// Belirli bir zaman diliminde çakışan randevuları kontrol etme
export async function checkOverlappingAppointments(
  shopId: string,
  date: Date,
  startTime: Date,
  endTime: Date,
  excludeAppointmentId?: string
): Promise<boolean> {
  const overlappingAppointments = await prisma.appointment.findMany({
    where: {
      shopId,
      date,
      id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
      OR: [
        // Başlangıç zamanı mevcut bir randevunun içinde
        {
          time: { lte: startTime },
          endTime: { gt: startTime }
        },
        // Bitiş zamanı mevcut bir randevunun içinde
        {
          time: { lt: endTime },
          endTime: { gte: endTime }
        },
        // Yeni randevu mevcut bir randevuyu tamamen kapsıyor
        {
          time: { gte: startTime },
          endTime: { lte: endTime }
        }
      ]
    }
  });

  return overlappingAppointments.length > 0;
}

// Randevu istatistiklerini getirme
export async function getAppointmentStats(
  params: {
    shopId?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}
): Promise<{
  total: number;
  upcoming: number;
  completed: number;
  canceledCount: number;
}> {
  const { shopId, startDate, endDate } = params;
  const now = new Date();
  const where: Prisma.AppointmentWhereInput = {};

  if (shopId) {
    where.shopId = shopId;
  }

  // Tarih aralığı filtresi
  if (startDate || endDate) {
    const dateConditions: Prisma.AppointmentWhereInput[] = [];
    
    if (startDate) {
      dateConditions.push({ date: { gte: startDate } });
    }
    
    if (endDate) {
      dateConditions.push({ date: { lte: endDate } });
    }
    
    if (dateConditions.length > 0) {
      where.AND = dateConditions;
    }
  }

  // Toplam randevu sayısı
  const total = await prisma.appointment.count({ where });

  // Gelecek randevular
  const upcomingWhere = {
    ...where,
    OR: [
      { date: { gt: now } },
      {
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        time: { gt: now }
      }
    ]
  };
  const upcoming = await prisma.appointment.count({ where: upcomingWhere });

  // Tamamlanmış randevular (geçmiş randevular)
  const completedWhere = {
    ...where,
    OR: [
      { date: { lt: now } },
      {
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        time: { lt: now }
      }
    ]
  };
  const completed = await prisma.appointment.count({ where: completedWhere });

  // İptal edilen randevuları saymak için bir alan eklenirse burası değişebilir
  // Şimdilik sıfır olarak döndürüyoruz
  const canceledCount = 0;

  return {
    total,
    upcoming,
    completed,
    canceledCount
  };
}

// Randevu değerlendirmelerini ekleme (Review modeli ile)
export async function addReviewToAppointment(
  appointmentId: string,
  data: {
    userId: string;
    shopId: string;
    rating: number;
    comment?: string;
  }
): Promise<Appointment> {
  // İlk önce randevuyu bul
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { review: true }
  });

  if (!appointment) {
    throw new Error('Randevu bulunamadı');
  }

  // Eğer zaten bir değerlendirme varsa güncelle
  if (appointment.review) {
    await prisma.review.update({
      where: { id: appointment.review.id },
      data: {
        rating: data.rating,
        comment: data.comment
      }
    });
  } else {
    // Yoksa yeni değerlendirme oluştur
    const newReview = await prisma.review.create({
      data: {
        // appointmentId direkt olarak kullanılamaz, çünkü Review modelinde bu alan yok
        shopId: data.shopId,
        rating: data.rating,
        comment: data.comment
      }
    });
    
    // Oluşturulan değerlendirmeyi randevu ile ilişkilendir
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        reviewId: newReview.id
      }
    });
  }

  // Güncellenmiş randevuyu döndür
  return prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      review: true,
      shop: true,
      user: true
    }
  }) as Promise<Appointment>;
}

// Günlük, haftalık veya aylık randevu raporlarını getirme
export async function getAppointmentReports(
  params: {
    shopId?: string;
    startDate: Date;
    endDate: Date;
    groupBy: 'day' | 'week' | 'month';
  }
): Promise<any[]> {
  const { shopId, startDate, endDate, groupBy } = params;
  const where: Prisma.AppointmentWhereInput = {
    date: {
      gte: startDate,
      lte: endDate
    }
  };

  if (shopId) {
    where.shopId = shopId;
  }

  // Tüm randevuları çek
  const appointments = await prisma.appointment.findMany({
    where,
    select: {
      id: true,
      date: true,
      time: true,
      endTime: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    },
    orderBy: [
      { date: 'asc' },
      { time: 'asc' }
    ]
  });

  // Gruplama işlevi (basit rapor için, daha karmaşık raporlar için raw SQL veya başka bir çözüm gerekebilir)
  const reports: Record<string, any> = {};

  appointments.forEach(appointment => {
    let groupKey: string;
    
    if (groupBy === 'day') {
      groupKey = appointment.date.toISOString().split('T')[0]; // YYYY-MM-DD
    } else if (groupBy === 'week') {
      const dayOfWeek = appointment.date.getDay();
      const diff = appointment.date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Pazartesi başlangıç
      const weekStart = new Date(appointment.date);
      weekStart.setDate(diff);
      groupKey = weekStart.toISOString().split('T')[0]; // Hafta başlangıç tarihi
    } else { // month
      groupKey = `${appointment.date.getFullYear()}-${appointment.date.getMonth() + 1}`; // YYYY-MM
    }

    if (!reports[groupKey]) {
      reports[groupKey] = {
        periodKey: groupKey,
        appointments: [],
        count: 0
      };
    }

    reports[groupKey].appointments.push(appointment);
    reports[groupKey].count++;
  });

  return Object.values(reports);
}
