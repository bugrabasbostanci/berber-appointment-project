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
  console.log(`getShopById çağrıldı, aranan ID: ${id}`);
  try {
    const shop = await prisma.shop.findUnique({
      where: { id },
      include: {
        owner: true,
        services: true
      }
    });
    
    if (shop) {
      console.log(`Dükkan bulundu: ${shop.name}, sahibi: ${shop.owner?.firstName || 'İsimsiz'}`);
    } else {
      console.log(`Dükkan bulunamadı: ${id}`);
    }
    
    return shop;
  } catch (error) {
    console.error(`Dükkan arama hatası (ID: ${id}):`, error);
    return null;
  }
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

// Dükkana çalışan ekleme - Bu fonksiyon şemada 'employees' ilişkisi olmadığı için güncellendi
// Owner ilişkisini güncelleme olarak değiştirildi
export async function updateShopOwner(
  shopId: string, 
  userId: string
): Promise<Shop> {
  return prisma.shop.update({
    where: { id: shopId },
    data: {
      ownerId: userId
    }
  });
}

// Dükkandan çalışan çıkarma - Artık bu fonksiyona ihtiyaç yok
// Alternatif olarak başka bir fonksiyon ekleyebiliriz
export async function getShopByOwnerId(ownerId: string): Promise<Shop[]> {
  return prisma.shop.findMany({
    where: { ownerId }
  });
}

// Dükkanın çalışanlarını getirme - Şemada employees ilişkisi olmadığı için güncellendi
// Dükkana ait işlemleri yapan kullanıcıları getirme olarak değiştirildi
export async function getShopOwner(shopId: string) {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    include: {
      owner: {
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
  
  return shop?.owner || null;
}

// Dükkana hizmet ekleme
export async function addServiceToShop(
  shopId: string,
  serviceData: {
    name: string;
    description?: string;
    price?: number | string;
    duration?: number;
  }
): Promise<Service> {
  return prisma.service.create({
    data: {
      ...serviceData,
      shopId: shopId
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
    userId?: string; // employeeId yerine userId kullanıyoruz
  } = {}
) {
  const { startDate, endDate, userId } = params;
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

  if (userId) {
    where.userId = userId;
  }

  return prisma.appointment.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true
        }
      },
      shop: true
    },
    orderBy: [
      { date: 'asc' },
      { time: 'asc' }
    ]
  });
}

// Dükkanın değerlendirmelerini getirme
export async function getShopReviews(shopId: string) {
  // Review modelinde user ilişkisi yok, olan appointments ilişkisi
  return prisma.review.findMany({
    where: { shopId },
    include: {
      appointments: {
        select: {
          id: true,
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
