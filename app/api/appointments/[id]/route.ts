import { NextResponse } from 'next/server';
import { getAppointmentById, updateAppointment, deleteAppointment } from '@/lib/services/appointmentService';
import { createClient } from '@/lib/supabase/server';

// Randevu erişim kontrolü
async function checkAppointmentAccess(id: string, userId: string, role: string) {
  const appointment = await getAppointmentById(id);
  
  if (!appointment) {
    return { access: false, error: 'Randevu bulunamadı', status: 404 };
  }
  
  // Admin ve berberler tüm randevulara erişebilir
  if (role === 'ADMIN' || role === 'BARBER') {
    return { access: true, appointment };
  }
  
  // Çalışanlar sadece kendi randevularına erişebilir
  if (role === 'EMPLOYEE' && appointment.employeeId === userId) {
    return { access: true, appointment };
  }
  
  // Müşteriler sadece kendi randevularına erişebilir
  if (role === 'CUSTOMER' && appointment.userId === userId) {
    return { access: true, appointment };
  }
  
  return { access: false, error: 'Bu randevuya erişim izniniz yok', status: 403 };
}

// GET - Belirli bir randevuyu getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Kullanıcı oturumunu kontrol et
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }
    
    const { id } = params;
    const role = session.user.user_metadata?.role || 'CUSTOMER';
    
    const { access, appointment, error, status } = await checkAppointmentAccess(
      id, 
      session.user.id, 
      role
    );
    
    if (!access) {
      return NextResponse.json({ error }, { status });
    }
    
    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Randevu getirilirken hata:', error);
    return NextResponse.json({ error: 'Randevu getirilirken bir hata oluştu' }, { status: 500 });
  }
}

// PATCH - Randevu güncelle
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Kullanıcı oturumunu kontrol et
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }
    
    const { id } = params;
    const role = session.user.user_metadata?.role || 'CUSTOMER';
    
    const { access, error, status } = await checkAppointmentAccess(
      id, 
      session.user.id, 
      role
    );
    
    if (!access) {
      return NextResponse.json({ error }, { status });
    }
    
    const body = await request.json();
    
    // Sadece izin verilen alanları güncelle (rol bazlı)
    const allowedFields = role === 'CUSTOMER' 
      ? ['notes', 'status']
      : ['date', 'time', 'endTime', 'notes', 'status', 'employeeId'];
      
    const updateData: Record<string, any> = {};
    
    for (const field of allowedFields) {
      if (field in body) {
        if (field === 'date') {
          updateData[field] = new Date(body[field]);
        } else if (field === 'time' || field === 'endTime') {
          updateData[field] = new Date(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }
    
    const updatedAppointment = await updateAppointment(id, updateData);
    
    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error('Randevu güncellenirken hata:', error);
    return NextResponse.json({ error: 'Randevu güncellenirken bir hata oluştu' }, { status: 500 });
  }
}

// DELETE - Randevu iptal et
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Kullanıcı oturumunu kontrol et
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }
    
    const { id } = params;
    const role = session.user.user_metadata?.role || 'CUSTOMER';
    
    const { access, error, status } = await checkAppointmentAccess(
      id, 
      session.user.id, 
      role
    );
    
    if (!access) {
      return NextResponse.json({ error }, { status });
    }
    
    await deleteAppointment(id);
    
    return NextResponse.json({ message: 'Randevu başarıyla silindi' });
  } catch (error) {
    console.error('Randevu silinirken hata:', error);
    return NextResponse.json({ error: 'Randevu silinirken bir hata oluştu' }, { status: 500 });
  }
}
