import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Bu Prisma client örneğini projenizdeki Prisma client konfigürasyonunuza göre güncellemeniz gerekebilir.
// import { prisma } from '@/lib/prisma'; // Örnek Prisma client importu

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim. Lütfen giriş yapın.' }, { status: 401 });
    }

    const userId = user.id;

    const body = await request.json();
    const { rating, comment } = body;

    if (rating === undefined || comment === undefined) {
      return NextResponse.json({ error: 'Puan ve yorum alanları zorunludur.' }, { status: 400 });
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Puan 1 ile 5 arasında bir sayı olmalıdır.' }, { status: 400 });
    }

    if (typeof comment !== 'string' || comment.trim() === '') {
      return NextResponse.json({ error: 'Yorum alanı boş bırakılamaz.' }, { status: 400 });
    }

    // Veritabanına kaydetme işlemi
    const newFeedback = await prisma.review.create({
      data: {
        rating: rating,
        comment: comment,
        userId: userId,
        // shopId: null, // Genel proje geri bildirimi için shopId null olacak veya belirtilmeyecek
      },
    });

    console.log("Veritabanına kaydedilen Geri Bildirim:", newFeedback);

    // Başarılı yanıt
    return NextResponse.json({ message: 'Geri bildirim başarıyla alındı ve kaydedildi.', data: newFeedback }, { status: 201 });

  } catch (error) {
    console.error('Geri bildirim işlenirken hata:', error);
    if (error instanceof SyntaxError) { // JSON parse hatası
      return NextResponse.json({ error: 'Geçersiz istek formatı.' }, { status: 400 });
    }
    // Prisma veya diğer veritabanı hatalarını da yakalamak ve daha spesifik mesajlar vermek iyi bir pratiktir.
    return NextResponse.json({ error: 'Geri bildirim işlenirken bir sunucu hatası oluştu.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      take: 3,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      }
    });
    return NextResponse.json(reviews, { status: 200 });
  } catch (error) {
    console.error('Yorumlar getirilirken hata:', error);
    return NextResponse.json({ error: 'Yorumlar getirilirken bir sunucu hatası oluştu.' }, { status: 500 });
  }
} 