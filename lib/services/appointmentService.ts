import { Appointment, Prisma } from '@prisma/client';
import { prisma } from '../prisma';

// Randevu oluşturma
export async function createAppointment(data: {
  shopId: string;
  userId: string;
  employeeId: string;
  date: Date;
  time: Date;
  endTime: Date;
  notes?: string;
}): Promise<Appointment> {
  return prisma.appointment.create({
    data
  });
}

// ID'ye göre randevu getirme
export async function getAppointmentById(id: string): Promise<Appointment | null> {
  return prisma.appointment.findUnique({
    where: { id },
    include: {
      shop: true,
      customer: true,
      employee: true
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
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
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
  employeeId: string,
  params: {
    date?: Date;
    startDate?: Date;
    endDate?: Date;
    shopId?: string;
  } = {}
): Promise<Appointment[]> {
  const { date, startDate, endDate, shopId } = params;
  const where: Prisma.AppointmentWhereInput = { employeeId };

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
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true
        }
      }
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
  date: Date,
  employeeId?: string
): Promise<Appointment[]> {
  const where: Prisma.AppointmentWhereInput = {
    shopId,
    date
  };

  if (employeeId) {
    where.employeeId = employeeId;
  }

  return prisma.appointment.findMany({
    where,
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true
        }
      },
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    },
    orderBy: { time: 'asc' }
  });
}

// Belirli bir zaman diliminde çakışan randevuları kontrol etme
export async function checkOverlappingAppointments(
  employeeId: string,
  date: Date,
  startTime: Date,
  endTime: Date,
  excludeAppointmentId?: string
): Promise<boolean> {
  const overlappingAppointments = await prisma.appointment.findMany({
    where: {
      employeeId,
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
    employeeId?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}
): Promise<{
  total: number;
  upcoming: number;
  completed: number;
  canceledCount: number;
}> {
  const { shopId, employeeId, startDate, endDate } = params;
  const now = new Date();
  const where: Prisma.AppointmentWhereInput = {};

  if (shopId) {
    where.shopId = shopId;
  }

  if (employeeId) {
    where.employeeId = employeeId;
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
    await prisma.review.create({
      data: {
        appointmentId,
        userId: data.userId,
        shopId: data.shopId,
        rating: data.rating,
        comment: data.comment
      }
    });
  }

  // Güncellenmiş randevuyu döndür
  return prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      review: true,
      shop: true,
      customer: true,
      employee: true
    }
  }) as Promise<Appointment>;
}

// Günlük, haftalık veya aylık randevu raporlarını getirme
export async function getAppointmentReports(
  params: {
    shopId?: string;
    employeeId?: string;
    startDate: Date;
    endDate: Date;
    groupBy: 'day' | 'week' | 'month';
  }
): Promise<any[]> {
  const { shopId, employeeId, startDate, endDate, groupBy } = params;
  const where: Prisma.AppointmentWhereInput = {
    date: {
      gte: startDate,
      lte: endDate
    }
  };

  if (shopId) {
    where.shopId = shopId;
  }

  if (employeeId) {
    where.employeeId = employeeId;
  }

  // Tüm randevuları çek
  const appointments = await prisma.appointment.findMany({
    where,
    select: {
      id: true,
      date: true,
      time: true,
      endTime: true,
      employee: {
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
