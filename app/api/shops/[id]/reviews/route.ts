import { NextRequest, NextResponse } from 'next/server';
import { getShopById, getShopReviews, getShopAverageRating } from '@/lib/services/shopService';

// Dükkanın değerlendirmelerini getirme
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const shopId = params.id;
    
    // Dükkan bilgilerini getir
    const shop = await getShopById(shopId);
    
    if (!shop) {
      return NextResponse.json(
        { error: 'Dükkan bulunamadı' },
        { status: 404 }
      );
    }

    // URL parametrelerini al
    const url = new URL(req.url);
    const includeRating = url.searchParams.get('includeRating') === 'true';
    
    // Dükkanın değerlendirmelerini getir
    const reviews = await getShopReviews(shopId);
    
    // Eğer isteniyorsa, ortalama puanı da getir
    let averageRating = null;
    if (includeRating) {
      averageRating = await getShopAverageRating(shopId);
    }
    
    return NextResponse.json({
      reviews,
      averageRating: includeRating ? averageRating : undefined,
      total: reviews.length
    });
  } catch (error) {
    console.error('Dükkan değerlendirmeleri getirilemedi:', error);
    return NextResponse.json(
      { error: 'Dükkan değerlendirmeleri getirilemedi' },
      { status: 500 }
    );
  }
}