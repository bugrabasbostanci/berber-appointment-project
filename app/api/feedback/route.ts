import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Bu Prisma client örneğini projenizdeki Prisma client konfigürasyonunuza göre güncellemeniz gerekebilir.
// import { prisma } from '@/lib/prisma'; // Örnek Prisma client importu

export async function POST(request: Request) {
  try {
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
        // shopId: null, // Genel proje geri bildirimi için shopId null olacak veya belirtilmeyecek
        // userId: ... // Eğer kullanıcı kimliğini de kaydetmek isterseniz ve Review modelinde userId varsa
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