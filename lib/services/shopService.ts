import { Shop, Prisma, Service } from '@prisma/client';
import { prisma } from '../prisma';

// Dükkan oluşturma
export async function createShop(shopData: {
  userId: string;
  name: string;
  ownerId: string;
  description?: string;
  contactInformation?: Prisma.InputJsonValue;
  address?: string;
  location?: string;
  workingHours?: Prisma.InputJsonValue;
}): Promise<Shop> {
  return prisma.shop.create({
    data: shopData
  });
}

// ID'ye göre dükkan getirme
export async function getShopById(id: string): Promise<Shop | null> {
  return prisma.shop.findUnique({
    where: { id },
    include: {
      owner: true,
      services: true
    }
  });
}

// Dükkan güncelleme
export async function updateShop(
  id: string,
  data: Prisma.ShopUpdateInput
): Promise<Shop> {
  return prisma.shop.update({
    where: { id },
    data
  });
}

// Dükkan silme
export async function deleteShop(id: string): Promise<Shop> {
  return prisma.shop.delete({
    where: { id }
  });
}

// Tüm dükkanları getirme (sayfalama ve filtreleme opsiyonlu)
export async function getShops(params: {
  skip?: number;
  take?: number;
  searchQuery?: string;
  ownerId?: string;
}): Promise<Shop[]> {
  const { skip, take, searchQuery, ownerId } = params;
  const where: Prisma.ShopWhereInput = {};

  if (ownerId) {
    where.ownerId = ownerId;
  }

  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery, mode: 'insensitive' } },
      { description: { contains: searchQuery, mode: 'insensitive' } },
      { address: { contains: searchQuery, mode: 'insensitive' } }
    ];
  }

  return prisma.shop.findMany({
    where,
    skip,
    take,
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      services: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

// Dükkan sayısını getirme (filtreleme opsiyonlu)
export async function countShops(params: {
  searchQuery?: string;
  ownerId?: string;
}): Promise<number> {
  const { searchQuery, ownerId } = params;
  const where: Prisma.ShopWhereInput = {};

  if (ownerId) {
    where.ownerId = ownerId;
  }

  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery, mode: 'insensitive' } },
      { description: { contains: searchQuery, mode: 'insensitive' } },
      { address: { contains: searchQuery, mode: 'insensitive' } }
    ];
  }

  return prisma.shop.count({ where });
}

// Dükkana çalışan ekleme
export async function addEmployeeToShop(
  shopId: string, 
  employeeId: string
): Promise<Shop> {
  return prisma.shop.update({
    where: { id: shopId },
    data: {
      employees: {
        connect: { id: employeeId }
      }
    }
  });
}

// Dükkandan çalışan çıkarma
export async function removeEmployeeFromShop(
  shopId: string, 
  employeeId: string
): Promise<Shop> {
  return prisma.shop.update({
    where: { id: shopId },
    data: {
      employees: {
        disconnect: { id: employeeId }
      }
    }
  });
}

// Dükkanın çalışanlarını getirme
export async function getShopEmployees(shopId: string) {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    include: {
      employees: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          phone: true
        }
      }
    }
  });
  
  return shop?.employees || [];
}

// Dükkana hizmet ekleme
export async function addServiceToShop(
  shopId: string,
  serviceData: {
    name: string;
    description?: string;
  }
): Promise<Service> {
  return prisma.service.create({
    data: {
      ...serviceData,
      shop: {
        connect: { id: shopId }
      }
    }
  });
}

// Dükkanın hizmetlerini getirme
export async function getShopServices(shopId: string): Promise<Service[]> {
  return prisma.service.findMany({
    where: { shopId }
  });
}

// Dükkanın randevularını getirme (tarih aralığına göre filtreleme opsiyonlu)
export async function getShopAppointments(
  shopId: string,
  params: {
    startDate?: Date;
    endDate?: Date;
    employeeId?: string;
  } = {}
) {
  const { startDate, endDate, employeeId } = params;
  const where: Prisma.AppointmentWhereInput = { shopId };

  // Tarih ve zaman filtreleri için AND koşulları oluştur
  const dateConditions: Prisma.AppointmentWhereInput[] = [];
  
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

  return prisma.appointment.findMany({
    where,
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
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
    orderBy: [
      { date: 'asc' },
      { time: 'asc' }
    ]
  });
}

// Dükkanın değerlendirmelerini getirme
export async function getShopReviews(shopId: string) {
  return prisma.review.findMany({
    where: { shopId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

// Dükkanın ortalama puanını hesaplama
export async function getShopAverageRating(shopId: string): Promise<number> {
  const reviews = await prisma.review.findMany({
    where: { shopId },
    select: { rating: true }
  });

  if (reviews.length === 0) {
    return 0;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  return totalRating / reviews.length;
}
