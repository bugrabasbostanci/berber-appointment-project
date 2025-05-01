import { NextRequest, NextResponse } from 'next/server';
import { getStaffMembers } from '@/lib/services/userService';
import { User, Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// Personel listesini getir (berber ve çalışanları)
export async function GET(req: NextRequest) {
  try {
    // URL parametrelerini al
    const url = new URL(req.url);
    const shopId = url.searchParams.get('shopId');
    
    console.log(`Personel listesi isteniyor. ShopId: ${shopId || 'Belirtilmemiş'}`);
    
    // Önce direkt veritabanından sorgulama yapalım
    let dbStaffMembers: any[] = [];
    try {
      // Veritabanından personeli doğrudan sorgulayalım
      dbStaffMembers = await prisma.user.findMany({
        where: {
          OR: [
            { role: Role.BARBER },
            { role: Role.EMPLOYEE }
          ]
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          profile: {
            select: {
              bio: true
            }
          }
        },
        orderBy: { firstName: 'asc' }
      });
      
      console.log(`Veritabanında ${dbStaffMembers.length} personel bulundu`);
    } catch (dbError) {
      console.error("Veritabanı sorgusu sırasında hata:", dbError);
    }
    
    // Eğer veritabanından personel bulunamazsa servisi kullan
    let staffMembers;
    if (dbStaffMembers.length === 0) {
      // Veritabanından personeli getir
      staffMembers = await getStaffMembers(shopId || undefined);
      console.log(`getStaffMembers servisinden ${staffMembers.length} personel alındı`);
    } else {
      staffMembers = dbStaffMembers;
    }
    
    console.log(`${staffMembers.length} personel bulundu`);
    
    // Eğer veri bulunamazsa, boş liste döndür
    if (!staffMembers || staffMembers.length === 0) {
      console.log('Personel bulunamadı, boş liste döndürülüyor');
      return NextResponse.json([]);
    }
    
    // Kullanıcı dostu format oluştur (UI için daha uygun)
    const formattedStaff = staffMembers.map(staff => {
      // Type assertion ile profile özelliğine erişim
      const staffWithProfile = staff as any;
      
      return {
        id: staff.id,
        name: `${staff.firstName || ''} ${staff.lastName || ''}`.trim(),
        firstName: staff.firstName,
        lastName: staff.lastName,
        role: staff.role,
        bio: staffWithProfile.profile?.bio || '',
        experience: getExperienceFromBio(staffWithProfile.profile?.bio || ''),
        available: true // Varsayılan olarak müsait
      };
    });
    
    return NextResponse.json(formattedStaff);
  } catch (error) {
    console.error('Personel listesi getirilirken hata:', error);
    
    // Hata durumunda varsayılan liste dön
    const defaultStaff = [
      {
        id: 'default-error-barber',
        name: 'Berber Usta',
        firstName: 'Berber',
        lastName: 'Usta',
        role: 'BARBER',
        bio: '10 yıllık tecrübeli berber',
        experience: '10+ yıl',
        available: true
      },
      {
        id: 'default-error-employee',
        name: 'Asistan Çırak',
        firstName: 'Asistan',
        lastName: 'Çırak',
        role: 'EMPLOYEE',
        bio: '2 yıllık deneyimli asistan',
        experience: '2+ yıl',
        available: true
      }
    ];
    
    return NextResponse.json(defaultStaff);
  }
}

// Biyografiden deneyim bilgisini çıkar
function getExperienceFromBio(bio: string): string {
  // Sayıları ve "yıl" gibi ifadeleri içeren bölümleri bul
  const experienceMatch = bio.match(/(\d+)(\s+|\+)*(yıl|sene|yil)/i);
  
  if (experienceMatch) {
    const years = experienceMatch[1];
    return `${years}+ yıl`;
  }
  
  // Eğer daha spesifik bir şey bulunamazsa
  if (bio.toLowerCase().includes('deneyim') || bio.toLowerCase().includes('tecrübe')) {
    return 'Deneyimli';
  }
  
  // Varsayılan değer
  return 'Deneyimli';
} 