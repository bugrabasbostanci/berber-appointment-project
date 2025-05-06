import { User, Role, Prisma } from '@prisma/client';
import { prisma } from '../prisma';

// Hata detaylarını yazdıran yardımcı fonksiyon
function logPrismaError(prefix: string, error: any) {
  console.error(`${prefix}:`, error);
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error('Prisma hata kodu:', error.code);
    console.error('Prisma hata mesajı:', error.message);
    console.error('Hedef:', error.meta);
  } else if (error instanceof Error) {
    console.error('Hata mesajı:', error.message);
    console.error('Hata yığını:', error.stack);
  } else {
    console.error('Bilinmeyen hata tipi:', typeof error);
  }
}

// Kullanıcı oluşturma
export async function createUser(userData: {
  id: string; // Supabase kullanıcı ID'si
  email: string;
  role: Role;
  firstName?: string;
  lastName?: string;
  phone?: string;
  // Eğer yeni alanlar eklediyseniz burada da tanımlamalısınız
}): Promise<User> {
  console.log('createUser isteği:', JSON.stringify(userData));
  
  try {
    // Önce kullanıcının zaten var olup olmadığını kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { 
        id: userData.id 
      }
    });
    
    if (existingUser) {
      console.log('Kullanıcı zaten var, varolan kullanıcı döndürülüyor:', existingUser.id);
      return existingUser;
    }
    
    // E-posta ile kontrol
    const existingUserByEmail = await prisma.user.findUnique({
      where: { 
        email: userData.email 
      }
    });
    
    if (existingUserByEmail) {
      console.log('Bu e-posta ile kullanıcı zaten var:', existingUserByEmail.id);
      throw new Error('Bu e-posta adresi ile kayıtlı bir kullanıcı zaten var');
    }
    
    // Yeni kullanıcı oluştur
    console.log('Yeni kullanıcı oluşturuluyor...');
    const newUser = await prisma.user.create({
      data: {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        // Aynı zamanda profile de oluştur (varsa ilişkili tablolar)
        profile: {
          create: {} // Boş bir profil oluştur
        }
      }
    });
    
    console.log('Yeni kullanıcı başarıyla oluşturuldu:', newUser.id);
    return newUser;
  } catch (error) {
    logPrismaError('Kullanıcı oluşturma hatası', error);
    throw error; // Hatayı yukarı ilet
  }
}

// ID'ye göre kullanıcı getirme
export async function getUserById(id: string): Promise<User | null> {
  try {
    return await prisma.user.findUnique({
      where: { id }
    });
  } catch (error) {
    logPrismaError(`ID ile kullanıcı arama hatası (${id})`, error);
    throw error;
  }
}

// E-posta adresine göre kullanıcı getirme
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    return await prisma.user.findUnique({
      where: { email }
    });
  } catch (error) {
    logPrismaError(`E-posta ile kullanıcı arama hatası (${email})`, error);
    throw error;
  }
}

// Kullanıcı güncelleme
export async function updateUser(
  id: string,
  data: Prisma.UserUpdateInput
): Promise<User> {
  try {
    return await prisma.user.update({
      where: { id },
      data
    });
  } catch (error) {
    logPrismaError(`Kullanıcı güncelleme hatası (${id})`, error);
    throw error;
  }
}

// Kullanıcı silme
export async function deleteUser(id: string): Promise<User> {
  try {
    return await prisma.user.delete({
      where: { id }
    });
  } catch (error) {
    logPrismaError(`Kullanıcı silme hatası (${id})`, error);
    throw error;
  }
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

  try {
    return await prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    logPrismaError('Kullanıcı listesi alma hatası', error);
    throw error;
  }
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

  try {
    return await prisma.user.count({ where });
  } catch (error) {
    logPrismaError('Kullanıcı sayısı alma hatası', error);
    throw error;
  }
}

// Kullanıcının sahip olduğu berber dükkanlarını getirme
export async function getUserOwnedShops(userId: string) {
  try {
    return await prisma.shop.findMany({
      where: { ownerId: userId }
    });
  } catch (error) {
    logPrismaError(`Kullanıcının dükkanlarını alma hatası (${userId})`, error);
    throw error;
  }
}

// Kullanıcının randevularını getirme
export async function getUserAppointments(userId: string) {
  try {
    return await prisma.appointment.findMany({
      where: { userId },
      include: {
        shop: true,
        review: true
      },
      orderBy: { date: 'desc' }
    });
  } catch (error) {
    logPrismaError(`Kullanıcının randevularını alma hatası (${userId})`, error);
    throw error;
  }
}

// Berber ve çalışanları getir (personel listesi)
export async function getStaffMembers(): Promise<User[]> {
  try {
    const whereConditions: Prisma.UserWhereInput = {
      OR: [
        { role: Role.BARBER },
        { role: Role.EMPLOYEE }
      ],
    };
    
    console.log(`[getStaffMembers] finalWhereConditions:`, JSON.stringify(whereConditions, null, 2));

    const staffMembersResult = await prisma.user.findMany({
      where: whereConditions,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true, 
        profile: {
          select: {
            bio: true
          }
        }
      },
      orderBy: { firstName: 'asc' }
    });
    
    console.log(`[getStaffMembers] Found ${staffMembersResult.length} staff members.`);

    // Mock data döndürme mantığı şimdilik kaldırıldı, gerçek veriye odaklanalım.
    // if (staffMembersResult.length === 0 && !shopIdInput) { ... }
    
    return staffMembersResult as unknown as User[];
  } catch (error) {
    logPrismaError('Personel listesi alma hatası', error);
    return []; // Hata durumunda boş liste döndür
  }
}