import { NextRequest, NextResponse } from 'next/server';
import { getShopAppointmentsByDate } from '@/lib/services/appointmentService';
import { prisma } from '@/lib/prisma'; // Belki ileride staff bilgilerini çekmek için gerekir
import type { Appointment, User, Profile, Shop, Review } from '@prisma/client'; // Gerekli tipleri import et

export const dynamic = 'force-dynamic'; // Her zaman dinamik olarak çalıştır

// getShopAppointmentsByDate'ten dönen beklenen tip için bir arayüz
// Prisma'nın Appointment modelini genişletiyoruz, include edilen ilişkilerle.
interface AppointmentWithDetails extends Appointment {
  user: (User & {
    profile: Profile | null;
  }) | null;
  shop: Shop | null;
  review: Review | null;
  // employeeId alanı burada olmayacak, map sırasında eklenecek
}

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  // URL'den shopId'yi parse etme
  const pathSegments = request.nextUrl.pathname.split('/');
  let shopId: string | undefined = undefined;
  const shopsIndex = pathSegments.indexOf('shops');
  if (shopsIndex !== -1 && pathSegments.length > shopsIndex + 1) {
    shopId = pathSegments[shopsIndex + 1];
  }

  // console.log(`[API DEBUG] shopId from URL: ${shopId}`); // Bu log kalabilir
  // console.log(`[API DEBUG] shopId from context.params: ${context.params.id}`); // BU SATIR TAMAMEN KALDIRILACAK

  const searchParams = request.nextUrl.searchParams;
  const dateQuery = searchParams.get('date');

  if (!shopId) {
    console.error('[API ERROR] Shop ID could not be determined from URL');
    return NextResponse.json({ error: 'Shop ID is required and could not be determined from URL' }, { status: 400 });
  }

  if (!dateQuery) {
    return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
  }

  let date: Date;
  try {
    date = new Date(dateQuery);
    // Tarihin geçerli olup olmadığını kontrol et (örneğin, saat bilgisini sıfırla)
    date.setHours(0, 0, 0, 0); 
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid date format. Please use YYYY-MM-DD.' }, { status: 400 });
  }

  try {
    // getShopAppointmentsByDate servisten gelen tipe cast ediyoruz.
    const appointmentsFromDb = await getShopAppointmentsByDate(shopId, date) as AppointmentWithDetails[];
    // console.log(`[API DEBUG] Fetched ${appointmentsFromDb.length} appointments from DB for shop ${shopId} on ${dateQuery}`);

    const appointmentsWithEmployeeId = appointmentsFromDb.map(app => {
      let employeeIdFromNotes: string | null = null;
      if (app.notes) {
        const match = app.notes.match(/EmployeeId:(\S+)/);
        if (match && match[1]) {
          employeeIdFromNotes = match[1];
        }
      }
      // Alternatif: Eğer notes içinde employeeId yoksa ve randevunun bir user (müşteri) bağlantısı varsa
      // ve bu user'ın rolü 'BARBER' veya 'EMPLOYEE' ise, bunu da dikkate alabiliriz.
      // Ancak şu anki appointmentService.createAppointment mantığı notes'a yazıyor.

      // app.user artık AppointmentWithDetails tipi sayesinde güvenle erişilebilir.
      return {
        // Temel Appointment alanlarını doğrudan kopyala (id, userId, shopId, notes, createdAt, updatedAt, reviewId)
        id: app.id,
        userId: app.userId,
        shopId: app.shopId, // shopId zaten app içinde var
        notes: app.notes,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
        reviewId: app.reviewId,
        // İlişkisel veriler ve formatlanmış alanlar:
        user: app.user, // User (müşteri) objesini olduğu gibi aktar
        time: app.time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        endTime: app.endTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        date: app.date.toISOString().split('T')[0],
        employeeId: employeeIdFromNotes,
        // app.shop ve app.review da gerekirse eklenebilir.
      };
    });

    // API'nin ne döndürdüğünü logla
    console.log('[API RESPONSE DATA]', JSON.stringify(appointmentsWithEmployeeId, null, 2));

    return NextResponse.json(appointmentsWithEmployeeId, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch appointments for shop:', shopId, date, error);
    if (error instanceof Error) {
        return NextResponse.json({ error: 'Failed to fetch appointments', details: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
} 