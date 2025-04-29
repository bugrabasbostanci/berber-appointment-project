import { Service, Prisma } from '@prisma/client';
import { prisma } from '../prisma';

// Tüm servisleri getirme (filtreleme opsiyonlu)
export async function getAllServices(params: {
  searchQuery?: string;
  skip?: number;
  take?: number;
} = {}): Promise<Service[]> {
  const { searchQuery, skip, take } = params;
  const where: Prisma.ServiceWhereInput = {};

  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery, mode: 'insensitive' } },
      { description: { contains: searchQuery, mode: 'insensitive' } }
    ];
  }

  return prisma.service.findMany({
    where,
    skip,
    take,
    orderBy: { name: 'asc' }
  });
}

// Servislerin sayısını getirme
export async function countServices(params: {
  searchQuery?: string;
} = {}): Promise<number> {
  const { searchQuery } = params;
  const where: Prisma.ServiceWhereInput = {};

  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery, mode: 'insensitive' } },
      { description: { contains: searchQuery, mode: 'insensitive' } }
    ];
  }

  return prisma.service.count({ where });
}

// ID'ye göre servis getirme
export async function getServiceById(id: string): Promise<Service | null> {
  return prisma.service.findUnique({
    where: { id }
  });
}

// Yeni servis oluşturma
export async function createService(serviceData: {
  name: string;
  description?: string;
  shopId?: string;
}): Promise<Service> {
  return prisma.service.create({
    data: serviceData
  });
}

// Servis güncelleme
export async function updateService(
  id: string,
  data: Prisma.ServiceUpdateInput
): Promise<Service> {
  return prisma.service.update({
    where: { id },
    data
  });
}

// Servis silme
export async function deleteService(id: string): Promise<Service> {
  return prisma.service.delete({
    where: { id }
  });
}
