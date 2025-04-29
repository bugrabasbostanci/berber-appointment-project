import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeAvailability, updateAvailabilityRange } from '@/lib/services/availabilityService';
import { getUserById } from '@/lib/services/userService';
import { createClient } from '@/lib/supabase/server';

// Çalışanın müsaitlik durumlarını getirme
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = params.id;
    
    // Çalışanın var olup olmadığını kontrol et
    const employee = await getUserById(employeeId);
    
    if (!employee) {
      return NextResponse.json(
        { error: 'Çalışan bulunamadı' },
        { status: 404 }
      );
    }
    
    // Sadece çalışan ve berber rolündeki kullanıcılar için müsaitlik durumları getirilebilir
    if (!['employee', 'barber'].includes(employee.role)) {
      return NextResponse.json(
        { error: 'Bu kullanıcı için müsaitlik durumları getirilemez' },
        { status: 400 }
      );
    }

    // URL parametrelerini al
    const url = new URL(req.url);
    const startDateParam = url.searchParams.get('startDate');
    const endDateParam = url.searchParams.get('endDate');
    const shopId = url.searchParams.get('shopId') || undefined;
    
    // Tarih parametrelerini dönüştür
    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const endDate = endDateParam ? new Date(endDateParam) : undefined;
    
    // Çalışanın müsaitlik durumlarını getir
    const availabilities = await getEmployeeAvailability(employeeId, {
      startDate,
      endDate,
      shopId
    });
    
    return NextResponse.json(availabilities);
  } catch (error) {
    console.error('Çalışan müsaitlik durumları getirilemedi:', error);
    return NextResponse.json(
      { error: 'Çalışan müsaitlik durumları getirilemedi' },
      { status: 500 }
    );
  }
}

// Çalışanın belirli bir tarih aralığındaki müsaitlik durumlarını toplu güncelleme
export async function PATCH(
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

    const employeeId = params.id;
    
    // Çalışanın var olup olmadığını kontrol et
    const employee = await getUserById(employeeId);
    
    if (!employee) {
      return NextResponse.json(
        { error: 'Çalışan bulunamadı' },
        { status: 404 }
      );
    }
    
    // Kullanıcı detaylarını getir
    const currentUser = await getUserById(session.user.id);
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }
    
    // Kullanıcı kendisi, admin veya berber (dükkan sahibi) olmalı
    if (session.user.id !== employeeId && 
        currentUser.role !== 'admin' && 
        currentUser.role !== 'barber') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmuyor' },
        { status: 403 }
      );
    }

    // Gönderilen verileri al
    const formData = await req.json();
    
    // Gerekli alanların kontrolü
    if (!formData.shopId || !formData.startDate || !formData.endDate || formData.isAvailable === undefined) {
      return NextResponse.json(
        { error: 'shopId, startDate, endDate ve isAvailable alanları zorunludur' },
        { status: 400 }
      );
    }

    // Tarih parametrelerini dönüştür
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    
    // Müsaitlik durumlarını toplu güncelle
    const updateData = {
      isAvailable: formData.isAvailable,
      timeSlots: formData.timeSlots,
      reason: formData.reason
    };
    
    const result = await updateAvailabilityRange(
      employeeId,
      formData.shopId,
      startDate,
      endDate,
      updateData
    );
    
    return NextResponse.json({
      success: true,
      count: result.count,
      message: `${result.count} adet müsaitlik durumu güncellendi`
    });
  } catch (error) {
    console.error('Çalışan müsaitlik durumları güncellenemedi:', error);
    return NextResponse.json(
      { error: 'Çalışan müsaitlik durumları güncellenemedi' },
      { status: 500 }
    );
  }
}