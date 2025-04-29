import { AvailableTime, Prisma } from '@prisma/client';
import { prisma } from '../prisma';

// Müsaitlik durumu oluşturma
export async function createAvailability(data: {
  shopId: string;
  employeeId: string;
  date: Date;
  isAvailable: boolean;
  timeSlots: Prisma.InputJsonValue; // Müsaitlik zaman aralıkları (08:00-09:00, 09:00-10:00, vb.)
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
    employeeId?: string;
  } = {}
): Promise<AvailableTime[]> {
  const { startDate, endDate, employeeId } = params;
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

  if (employeeId) {
    where.employeeId = employeeId;
  }

  return prisma.availableTime.findMany({
    where,
    include: {
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    },
    orderBy: { date: 'asc' }
  });
}

// Belirli bir çalışan için müsaitlik durumlarını getirme
export async function getEmployeeAvailability(
  employeeId: string,
  params: {
    startDate?: Date;
    endDate?: Date;
    shopId?: string;
  } = {}
): Promise<AvailableTime[]> {
  const { startDate, endDate, shopId } = params;
  const where: Prisma.AvailableTimeWhereInput = { employeeId };

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

// Belirli bir tarih için müsait çalışanları bulma
export async function getAvailableEmployeesForDate(
  shopId: string,
  date: Date
): Promise<{ employeeId: string; firstName: string | null; lastName: string | null }[]> {
  const result = await prisma.availableTime.findMany({
    where: {
      shopId,
      date,
      isAvailable: true
    },
    select: {
      employeeId: true,
      employee: {
        select: {
          firstName: true,
          lastName: true
        }
      }
    }
  });

  return result.map(item => ({
    employeeId: item.employeeId,
    firstName: item.employee.firstName,
    lastName: item.employee.lastName
  }));
}

// Birden çok müsaitlik durumu oluşturma (örneğin, birden fazla günü aynı anda eklemek için)
export async function createManyAvailabilities(
  data: {
    shopId: string;
    employeeId: string;
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

// Belirli bir tarih aralığı için bir çalışanın müsaitlik durumlarını toplu güncelleme
export async function updateAvailabilityRange(
  employeeId: string,
  shopId: string,
  startDate: Date,
  endDate: Date,
  data: {
    isAvailable: boolean;
    timeSlots?: Prisma.InputJsonValue;
    reason?: string;
  }
): Promise<Prisma.BatchPayload> {
  return prisma.availableTime.updateMany({
    where: {
      employeeId,
      shopId,
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    data
  });
}

// Müsaitlik durumlarını randevularla karşılaştırma
export async function checkAvailabilityWithAppointments(
  shopId: string,
  employeeId: string,
  date: Date
): Promise<{ 
  isAvailable: boolean; 
  availableTimeSlots: any; 
  bookedTimeSlots: { start: Date; end: Date }[];
}> {
  // 1. O gün için müsaitlik durumunu getir
  const availability = await prisma.availableTime.findFirst({
    where: {
      shopId,
      employeeId,
      date
    }
  });

  // 2. O gün için mevcut randevuları getir
  const appointments = await prisma.appointment.findMany({
    where: {
      shopId,
      employeeId,
      date
    },
    select: {
      time: true,
      endTime: true
    }
  });

  // Eğer müsaitlik kaydı yoksa veya çalışan müsait değilse
  if (!availability || !availability.isAvailable) {
    return {
      isAvailable: false,
      availableTimeSlots: {},
      bookedTimeSlots: appointments.map(app => ({
        start: app.time,
        end: app.endTime
      }))
    };
  }

  // Aksi takdirde müsaitlik durumunu ve randevuları döndür
  return {
    isAvailable: true,
    availableTimeSlots: availability.timeSlots,
    bookedTimeSlots: appointments.map(app => ({
      start: app.time,
      end: app.endTime
    }))
  };
}

// Birden fazla çalışanın takvimini getirme
export async function getTeamCalendar(
  shopId: string,
  startDate: Date,
  endDate: Date
): Promise<any> {
  // 1. Dükkandaki tüm çalışanları getir
  const employees = await prisma.shop.findUnique({
    where: { id: shopId },
    select: {
      employees: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  if (!employees) {
    return [];
  }

  // 2. Her çalışan için müsaitlik bilgilerini ve randevuları getir
  const teamCalendar = await Promise.all(
    employees.employees.map(async (employee) => {
      const availabilities = await prisma.availableTime.findMany({
        where: {
          shopId,
          employeeId: employee.id,
          date: {
            gte: startDate,
            lte: endDate
          }
        }
      });

      const appointments = await prisma.appointment.findMany({
        where: {
          shopId,
          employeeId: employee.id,
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      });

      return {
        employee,
        availabilities,
        appointments
      };
    })
  );

  return teamCalendar;
}
