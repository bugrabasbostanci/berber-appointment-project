import { NextRequest, NextResponse } from 'next/server';
import { getUserById, getUsers, countUsers } from '@/lib/services/userService';
import { createClient } from '@/lib/supabase/server';
import { Role } from '@prisma/client';

export async function GET(req: NextRequest) {
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

    // URL parametrelerini al
    const url = new URL(req.url);
    const skip = parseInt(url.searchParams.get('skip') || '0');
    const take = parseInt(url.searchParams.get('take') || '10');
    const role = url.searchParams.get('role') as Role | undefined;
    const searchQuery = url.searchParams.get('q') || undefined;

    // Verileri ve toplam sayıyı getir
    const [users, total] = await Promise.all([
      getUsers({ skip, take, role, searchQuery }),
      countUsers({ role, searchQuery })
    ]);

    // Hassas verileri temizleyelim
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      users: safeUsers,
      pagination: {
        skip,
        take,
        total,
        hasMore: skip + take < total
      }
    });
  } catch (error) {
    console.error('Kullanıcılar getirilemedi:', error);
    return NextResponse.json(
      { error: 'Kullanıcılar getirilemedi' },
      { status: 500 }
    );
  }
}
