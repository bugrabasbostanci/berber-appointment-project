import { User, Role, Prisma } from '@prisma/client';
import { prisma } from '../prisma';

// Kullanıcı oluşturma
export async function createUser(userData: {
  email: string;
  password: string;
  role: Role;
  firstName?: string;
  lastName?: string;
  phone?: string;
}): Promise<User> {
  return prisma.user.create({
    data: userData
  });
}

// ID'ye göre kullanıcı getirme
export async function getUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id }
  });
}

// E-posta adresine göre kullanıcı getirme
export async function getUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email }
  });
}

// Kullanıcı güncelleme
export async function updateUser(
  id: string,
  data: Prisma.UserUpdateInput
): Promise<User> {
  return prisma.user.update({
    where: { id },
    data
  });
}

// Kullanıcı silme
export async function deleteUser(id: string): Promise<User> {
  return prisma.user.delete({
    where: { id }
  });
}

// Tüm kullanıcıları getirme (sayfalama ve filtreleme opsiyonlu)
export async function getUsers(params: {
  skip?: number;
  take?: number;
  role?: Role;
  searchQuery?: string;
}): Promise<User[]> {
  const { skip, take, role, searchQuery } = params;
  const where: Prisma.UserWhereInput = {};

  if (role) {
    where.role = role;
  }

  if (searchQuery) {
    where.OR = [
      { email: { contains: searchQuery, mode: 'insensitive' } },
      { firstName: { contains: searchQuery, mode: 'insensitive' } },
      { lastName: { contains: searchQuery, mode: 'insensitive' } }
    ];
  }

  return prisma.user.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: 'desc' }
  });
}

// Kullanıcı sayısını getirme (filtreleme opsiyonlu)
export async function countUsers(params: {
  role?: Role;
  searchQuery?: string;
}): Promise<number> {
  const { role, searchQuery } = params;
  const where: Prisma.UserWhereInput = {};

  if (role) {
    where.role = role;
  }

  if (searchQuery) {
    where.OR = [
      { email: { contains: searchQuery, mode: 'insensitive' } },
      { firstName: { contains: searchQuery, mode: 'insensitive' } },
      { lastName: { contains: searchQuery, mode: 'insensitive' } }
    ];
  }

  return prisma.user.count({ where });
}

// Kullanıcının sahip olduğu berber dükkanlarını getirme
export async function getUserOwnedShops(userId: string) {
  return prisma.shop.findMany({
    where: { ownerId: userId }
  });
}

// Kullanıcının çalıştığı berber dükkanlarını getirme
export async function getUserEmployeeShops(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { employeeInShops: true }
  }).then(user => user?.employeeInShops || []);
}

// Kullanıcının randevularını getirme
export async function getUserAppointments(userId: string, role: Role) {
  const whereCondition = role === 'customer' 
    ? { userId } 
    : { employeeId: userId };

  return prisma.appointment.findMany({
    where: whereCondition,
    include: {
      shop: true,
      customer: role !== 'customer',
      employee: role === 'customer'
    },
    orderBy: { date: 'desc' }
  });
}