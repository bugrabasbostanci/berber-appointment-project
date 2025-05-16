import { User, Role, Prisma } from '@prisma/client';
import { prisma } from '../prisma';

// Hata detaylarını yazdıran yardımcı fonksiyon
function logPrismaError(prefix: string, error: unknown) {
  console.error(`${prefix}:`, error);
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error('Prisma hata kodu:', error.code);
    console.error('Prisma hata mesajı:', error.message);
    console.error('Hedef:', error.meta);
  } else if (error instanceof Error) {
    console.error('Hata mesajı:', error.message);
    console.error('Hata yığını:', error.stack);
  } else {
    console.error('Bilinmeyen hata tipi:', typeof error, error);
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
  provider?: string; // örn: "google", "email" (veya e-posta/şifre için undefined/null)
}): Promise<User> {
  console.log('createUser isteği:', JSON.stringify(userData));

  try {
    // 1. Supabase Auth User ID'si ile mevcut bir kullanıcı var mı kontrol et.
    let existingUserById = await prisma.user.findUnique({
      where: { id: userData.id },
    });

    if (existingUserById) {
      // Veritabanındaki provider'ı al, eğer null/undefined ise 'email' olarak kabul et.
      const currentDbProvider = existingUserById.provider || 'email';
      // Gelen istekteki provider'ı al, eğer null/undefined ise 'email' olarak kabul et.
      const incomingProvider = userData.provider || 'email';

      // Eğer veritabanındaki provider ile gelen provider farklıysa, bu bir çakışmadır.
      if (currentDbProvider !== incomingProvider) {
        console.warn(
          `Provider Çakışması (Aynı Supabase ID): Kullanıcı ${userData.id} (${userData.email}) veritabanında '${currentDbProvider}' provider ile kayıtlı, ancak mevcut kimlik doğrulama denemesi '${incomingProvider}' ile yapılıyor.`
        );
        const displayCurrent = currentDbProvider === 'email' ? 'e-posta/şifre' : currentDbProvider;
        const displayIncoming = incomingProvider === 'email' ? 'e-posta/şifre' : incomingProvider;
        throw new Error(
          `Bu hesap (${userData.email}) zaten ${displayCurrent} yöntemiyle kayıtlıdır. ${displayIncoming} yöntemiyle devam edemezsiniz.`
        );
      }

      // Provider'lar aynı (veya her ikisi de 'email' olarak değerlendiriliyor).
      // Mevcut kullanıcıyı döndür.
      console.log(
        'Kullanıcı Supabase ID ile bulundu ve provider uyumlu. Mevcut kullanıcı döndürülüyor:',
        existingUserById.id
      );
      return existingUserById;
    }

    // 2. E-posta adresi ile mevcut bir kullanıcı var mı kontrol et.
    // Bu nokta, farklı Supabase Auth User ID'leri (farklı provider'lar) ama aynı e-posta durumu için kritiktir.
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUserByEmail) {
      // E-posta ile bir kullanıcı bulundu. Supabase ID'leri farklı olduğu için buradayız.
      // Bu, aynı e-postanın farklı kimlik doğrulama yöntemleriyle kullanılmaya çalışıldığı anlamına gelir.

      // Gelen provider bilgisini belirle, eğer yoksa 'email' (e-posta/şifre) varsay.
      const newProvider = userData.provider || 'email';
      // Veritabanındaki kullanıcının provider bilgisini belirle, eğer yoksa 'email' varsay.
      const currentProviderInDb = existingUserByEmail.provider || 'email';

      // Eğer provider'lar farklıysa, bu bir çakışmadır.
      if (currentProviderInDb !== newProvider) {
        console.log(
          `Çakışma: E-posta (${userData.email}) zaten ${currentProviderInDb} yöntemiyle kayıtlı. Yeni deneme: ${newProvider}. Supabase ID'leri farklı (mevcut Prisma User ID: ${existingUserByEmail.id}, yeni Supabase User ID: ${userData.id})`
        );
        const providerNameToDisplay =
          currentProviderInDb === 'email'
            ? 'e-posta/şifre'
            : currentProviderInDb;
        throw new Error(
          `Bu e-posta adresi (${userData.email}) zaten ${providerNameToDisplay} yöntemiyle kayıtlı. Lütfen o yöntemle giriş yapın veya farklı bir e-posta adresi kullanın.`
        );
      } else {
        // Provider'lar aynı olmasına rağmen Supabase ID'leri farklı.
        // Bu çok sıra dışı bir durumdur, çünkü Supabase normalde aynı e-posta ve aynı provider için
        // tek bir Auth User (ve dolayısıyla tek bir ID) oluşturur.
        // Bu, manuel veri tutarsızlığı veya beklenmedik bir sistem davranışı olabilir.
        console.error(
          `Kritik Tutarsızlık: E-posta (${userData.email}) ve provider (${newProvider}) aynı olmasına rağmen farklı Supabase ID'leri. Mevcut Prisma User ID ${existingUserByEmail.id}, Yeni Supabase User ID ${userData.id}. Bu durumun incelenmesi gerekiyor.`
        );
        
        // Hata fırlatmak yerine, mevcut kullanıcının ID'sini güncelle
        console.log(`Kullanıcı ID'si güncelleniyor: ${existingUserByEmail.id} -> ${userData.id}`);
        try {
          // İlişkili kayıtları güncelle (transaction içinde kullanıcıyı da günceller/taşır)
          await updateUserRelations(existingUserByEmail.id, userData.id);
          
          // Artık updateUserRelations işlemi tüm verileri taşıdığı ve 
          // yeni ID'li kullanıcıyı oluşturduğu için yeniden sorgu yapmamız gerekiyor
          const updatedUser = await prisma.user.findUnique({
            where: { id: userData.id }
          });
          
          if (!updatedUser) {
            throw new Error(`Kullanıcı taşıma işlemi tamamlandı ancak yeni kullanıcı bilgileri alınamadı: ${userData.id}`);
          }
          
          console.log(`Kullanıcı ID'si başarıyla güncellendi. Yeni ID: ${updatedUser.id}`);
          return updatedUser;
        } catch (updateError) {
          console.error(`Kullanıcı ID güncellenirken hata:`, updateError);
          // Bu durumda, çakışmayı önlemek için hata fırlatmak en güvenli yoldur.
          throw new Error(
            `Hesap bilgileriniz güncellenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin veya sistem yöneticisiyle iletişime geçin. (E-posta: ${userData.email})`
          );
        }
      }
    }

    // 3. Yeni kullanıcı oluştur.
    // Ne Supabase ID'si ile ne de e-posta ile (çakışma olmadan) eşleşen bir kullanıcı bulunamadı.
    console.log(
      'Yeni kullanıcı oluşturuluyor (Supabase ID ve e-posta ile eşleşme/çakışma yok)...'
    );
    const newUser = await prisma.user.create({
      data: {
        id: userData.id, // Yeni Supabase Auth User ID'si
        email: userData.email,
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        provider: userData.provider || 'email', // Provider'ı kaydet, yoksa 'email' varsay.
        profile: {
          create: {}, // Boş bir profil oluştur
        },
      },
    });

    console.log('Yeni kullanıcı başarıyla oluşturuldu:', newUser.id);
    return newUser;
  } catch (error) {
    logPrismaError('Kullanıcı oluşturma hatası', error);
    // Hatanın zaten Error nesnesi olup olmadığını kontrol et
    if (error instanceof Error) {
      throw error; // Zaten bir Error nesnesi ise doğrudan fırlat
    } else {
      // Değilse, yeni bir Error nesnesi oluşturarak fırlat
      throw new Error(String(error));
    }
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
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(String(error));
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
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(String(error));
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
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(String(error));
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
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(String(error));
  }
}

// Kullanıcı ID'si değiştiğinde ilişkili kayıtları güncelleme
async function updateUserRelations(oldId: string, newId: string): Promise<void> {
  try {
    console.log(`Kullanıcının ilişkili kayıtları güncelleniyor: ${oldId} -> ${newId}`);
    
    // İlk olarak yeni bir kullanıcı oluşturalım (ID dışında tüm bilgileri taşıyarak)
    const existingUser = await prisma.user.findUnique({
      where: { id: oldId },
      include: { profile: true }
    });
    
    if (!existingUser) {
      throw new Error(`Güncellenecek kullanıcı bulunamadı: ${oldId}`);
    }
    
    // Transaction kullanarak tüm işlemleri atomik olarak yapalım
    await prisma.$transaction(async (tx) => {
      // 1. Önce yeni ID ile kullanıcıyı oluştur
      await tx.user.create({
        data: {
          id: newId,
          email: existingUser.email,
          role: existingUser.role,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          phone: existingUser.phone,
          provider: existingUser.provider,
          createdAt: existingUser.createdAt,
          updatedAt: new Date(),
        }
      });
      
      // 2. Kullanıcı profili (varsa) yeni kullanıcıya taşı
      if (existingUser.profile) {
        await tx.profile.create({
          data: {
            userId: newId,
            bio: existingUser.profile.bio,
            availableTimeId: existingUser.profile.availableTimeId,
            createdAt: existingUser.profile.createdAt,
            updatedAt: new Date()
          }
        });
      }
      
      // 3. Müşteri randevularını güncelle
      await tx.appointment.updateMany({
        where: { userId: oldId },
        data: { userId: newId }
      });
      
      // 4. Çalışan randevularını güncelle
      await tx.appointment.updateMany({
        where: { employeeId: oldId },
        data: { employeeId: newId }
      });
      
      // 5. Değerlendirmeleri güncelle
      await tx.review.updateMany({
        where: { userId: oldId },
        data: { userId: newId }
      });
      
      // 6. Dükkanları güncelle
      await tx.shop.updateMany({
        where: { ownerId: oldId },
        data: { ownerId: newId }
      });
      
      // 7. Son olarak, eski kullanıcıyı sil
      await tx.profile.deleteMany({
        where: { userId: oldId }
      });
      
      await tx.user.delete({
        where: { id: oldId }
      });
    });
    
    console.log(`Kullanıcının ilişkili kayıtları başarıyla güncellendi: ${oldId} -> ${newId}`);
  } catch (error) {
    logPrismaError(`İlişkili kayıtları güncelleme hatası (${oldId} -> ${newId})`, error);
    throw new Error(`İlişkili kayıtlar güncellenirken hata oluştu: ${error instanceof Error ? error.message : String(error)}`);
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
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(String(error));
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