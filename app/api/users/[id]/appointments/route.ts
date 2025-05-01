import { NextRequest, NextResponse } from 'next/server';
import { getUserById, getUserAppointments } from '@/lib/services/userService';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Kullanıcı oturumunu kontrol et
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const userId = params.id;
    
    // Kullanıcı kendi randevularını veya admin/berber ise ilgili randevuları görüntüleyebilir
    const currentUserDetails = await getUserById(session.user.id);
    
    if (!currentUserDetails) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }
    
    if (session.user.id !== userId && 
        !['ADMIN', 'BARBER'].includes(currentUserDetails.role)) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmuyor' },
        { status: 403 }
      );
    }

    // Kullanıcı detaylarını getir
    const user = await getUserById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // URL parametrelerini al
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    
    // Kullanıcının randevularını getir
    const appointments = await getUserAppointments(userId);

    return NextResponse.json({
      appointments,
      userId,
      userRole: user.role
    });
  } catch (error) {
    console.error('Kullanıcı randevuları getirilemedi:', error);
    return NextResponse.json(
      { error: 'Kullanıcı randevuları getirilemedi' },
      { status: 500 }
    );
  }
}
