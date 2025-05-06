"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Time slots for daily view
const timeSlots = [
  "09:30", "10:15", "11:00", "11:45", "12:30", "13:15", 
  "14:00", "14:45", "15:30", "16:15", "17:00", "17:45",
  "18:30", "19:15", "20:00", "20:45"
]

// Tip tanımlamaları
type AppointmentType = {
  id: string
  date: string // API'den YYYY-MM-DD formatında string gelecek
  time: string // API'den HH:mm formatında string gelecek
  endTime: string // API'den HH:mm formatında string gelecek
  duration: number // Bu alan API yanıtında yok, gerekirse hesaplanmalı veya kaldırılmalı
  customer: {
    name: string
    avatar: string
    initials: string
    phone: string
  }
  service: string // Bu alan da API yanıtında yok, gerekirse `notes`'tan çıkarılabilir veya kaldırılabilir
  employeeId: string | null // API'den eklendi
  notes?: string // Orijinal notes alanı da kalsın
  shopId: string;
  userId: string;
}

type StaffMemberType = {
  id: string
  name: string
  role: string
}

type MonthlyDataType = {
  day: number
  appointments: number
  capacity?: number
}

// Tüm bileşenler için ortak yardımcı fonksiyonlar
// Tarih formatları için yardımcı fonksiyonlar
const formatDate = (date: Date): string => {
  // Zaman dilimi etkisini ortadan kaldırarak YYYY-MM-DD formatında tarih döndür
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

const formatDisplayDate = (date: Date): string => {
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// İsimlerin baş harflerini alma
const getInitials = (name: string): string => {
  if (!name) return ''
  
  return name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
}

// Haftalık görünüm bileşeni
function WeeklyView({ 
  appointments, 
  selectedDate,
  timeSlots,
  staffMembers
}: { 
  appointments: AppointmentType[]
  selectedDate: Date
  timeSlots: string[]
  staffMembers: StaffMemberType[]
}) {
  // Haftanın günlerini oluşturma
  const weekDays = [];
  const dayNames = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
  
  // Haftanın başlangıç gününü bulma (Pazartesi)
  const startOfWeek = new Date(selectedDate);
  const day = selectedDate.getDay(); // 0 = Pazar, 1 = Pazartesi, ...
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Pazartesi'ye ayarlama
  startOfWeek.setDate(diff);
  
  // Haftanın günlerini oluşturma
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    weekDays.push({
      date,
      name: dayNames[i]
    });
  }
  
  // Randevuları günlere ve çalışanlara göre gruplama
  const appointmentsByDayAndStaff = new Map<string, Map<string, AppointmentType[]>>();

  weekDays.forEach(day => {
    const dateStr = formatDate(day.date);
    const dailyMap = new Map<string, AppointmentType[]>();
    staffMembers.forEach(staff => {
      dailyMap.set(staff.id, []);
    });
    // Atanmamış veya employeeId'si olmayanlar için özel bir anahtar
    dailyMap.set("unassigned", []); 
    appointmentsByDayAndStaff.set(dateStr, dailyMap);
  });

  appointments.forEach(appointment => {
    // API'den gelen date string (YYYY-MM-DD) olduğu için Date nesnesine çevirmeye gerek yok, doğrudan kullan
    const dateStr = appointment.date; 
    const staffAppointmentMap = appointmentsByDayAndStaff.get(dateStr);
    if (staffAppointmentMap) {
      const employeeIdKey = appointment.employeeId || "unassigned";
      const staffAppointments = staffAppointmentMap.get(employeeIdKey);
      if (staffAppointments) {
        staffAppointments.push(appointment);
      } else {
        // Eğer map'te bu employeeId için bir giriş yoksa (dinamik çalışan ekleme vb. durumlar için)
        staffAppointmentMap.set(employeeIdKey, [appointment]);
      }
    }
  });
  
  // TODO: WeeklyView'ın render kısmı, bu yeni gruplama yapısını (appointmentsByDayAndStaff)
  // kullanarak her çalışan için ayrı satırlar/sütunlar gösterecek şekilde güncellenmeli.
  // Mevcut hali sadece berberi filtreleyip gösteriyordu.
  // Şimdilik sadece berberin randevularını göstermeye devam edelim, ama yeni yapıyı kullanarak.

  const barberStaff = staffMembers.find(staff => staff.role.toLowerCase() === "barber");
  
  return (
    <div className="border rounded-md overflow-auto">
      <div className="grid grid-cols-[auto_repeat(7,_1fr)] h-full">
        {/* Başlık satırı - boş köşe */}
        <div className="sticky top-0 z-10 bg-background border-b py-2 px-2">
          <span className="font-medium">Saat</span>
        </div>
        
        {/* Haftanın günleri başlıkları */}
        {weekDays.map((day) => (
          <div 
            key={day.name} 
            className={`sticky top-0 z-10 bg-background border-b border-l py-2 px-2 text-center
              ${formatDate(day.date) === formatDate(new Date()) ? 'bg-primary/10' : ''}`}
          >
            <div className="font-medium">{day.name}</div>
            <div className="text-sm text-muted-foreground">
              {day.date.getDate()} {day.date.toLocaleDateString('tr-TR', { month: 'long' })}
            </div>
          </div>
        ))}
        
        {/* Zaman dilimlerini gösteren sol sütun */}
        <div className="border-r py-4">
          {timeSlots.map((time) => (
            <div key={time} className="px-2 py-6 text-muted-foreground text-sm">
              {time}
            </div>
          ))}
        </div>
        
        {/* Her gün için randevu alanları */}
        {weekDays.map((day) => {
          const dateStr = formatDate(day.date); // Karşılaştırma için formatDate kullanmaya devam et
          const dayAppointmentsMap = appointmentsByDayAndStaff.get(dateStr);
          // Şimdilik sadece berberin randevularını alalım
          const dayAppointments = barberStaff && dayAppointmentsMap ? dayAppointmentsMap.get(barberStaff.id) || [] : [];
          
          return (
            <div 
              key={day.name} 
              className={`border-l p-2 relative min-h-[700px] 
                ${formatDate(day.date) === formatDate(new Date()) ? 'bg-primary/5' : ''}`}
            >
              {/* Eğer randevu yoksa mesaj göster */}
              {dayAppointments.length === 0 ? (
                <div className="text-center text-muted-foreground text-xs mt-2">
                  Randevu yok
                </div>
              ) : (
                // Günün randevularını göster
                dayAppointments.map((appointment) => {
                  // Randevunun konumu ve yüksekliğinin hesaplanması
                  const [hours, minutes] = appointment.time.split(":").map(Number);
                  const totalMinutesStart = hours * 60 + minutes;
                  const dayStart = 9 * 60 + 30; // 09:30
                  const dayEnd = 20 * 60 + 45; // 20:45
                  const dayLength = dayEnd - dayStart;
                  
                  const top = ((totalMinutesStart - dayStart) / dayLength) * 100;
                  const height = (appointment.duration / dayLength) * 100;
                  
                  return (
                    <div
                      key={appointment.id}
                      className="absolute left-1 right-1 bg-primary/10 border-l-4 border-primary rounded-md p-1 overflow-hidden"
                      style={{
                        top: `${top}%`,
                        height: `${Math.max(height, 5)}%`,
                      }}
                    >
                      <div className="flex flex-col overflow-hidden">
                        <div className="font-medium text-xs truncate">{appointment.customer.name}</div>
                        {appointment.service && <div className="text-xs text-muted-foreground truncate">{appointment.service}</div>}
                        <div className="text-xs font-medium">
                          {appointment.time}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Günlük görünüm bileşeni
function DailyView({ 
  appointments, 
  timeSlots, 
  staffMembers 
}: { 
  appointments: AppointmentType[]
  timeSlots: string[]
  staffMembers: StaffMemberType[]
}) {
  // Randevuları Berber ve Çalışanlar olarak ayır
  const barberAppointments: AppointmentType[] = [];
  const otherEmployeeAppointments = new Map<string, AppointmentType[]>();
  
  const barberStaff = staffMembers.find(staff => staff.role.toLowerCase() === "barber");

  appointments.forEach(appointment => {
    if (barberStaff && appointment.employeeId === barberStaff.id) {
      barberAppointments.push(appointment);
    } else if (appointment.employeeId) {
      if (!otherEmployeeAppointments.has(appointment.employeeId)) {
        otherEmployeeAppointments.set(appointment.employeeId, []);
      }
      otherEmployeeAppointments.get(appointment.employeeId)?.push(appointment);
    } else {
      console.warn(`Randevu ${appointment.id} için employeeId bulunamadı.`);
    }
  });
  
  const otherStaff = staffMembers.filter(staff => staff.id !== barberStaff?.id);
  const numberOfStaffColumns = otherStaff.length + (barberStaff ? 1 : 0); // Berber dahil personel sütun sayısı

  return (
    <div className="border rounded-md overflow-x-auto">
      {/* Günlük görünümde her personel için bir sütun oluşturacağız */}
      {/* Saat sütunu için 'auto', kalan personel sütunları için '1fr' (eşit paylaşım) */}
      <div 
        className={`grid ${numberOfStaffColumns > 0 ? `grid-cols-[auto_repeat(${numberOfStaffColumns},minmax(150px,1fr))]` : 'grid-cols-[auto]'} min-w-[${numberOfStaffColumns > 0 ? 100 + numberOfStaffColumns * 150 : 100}px]`}
      >
        {/* Zaman Dilimleri Sütunu (Başlık) */}
        {/* Saat sütununun genişliğini padding ve içerik belirleyecek, gerekirse max-w eklenebilir */}
        <div className="sticky top-0 z-10 bg-background border-r border-b px-3 py-4 whitespace-nowrap">
          <span className="font-medium text-sm">Saat</span>
        </div>

        {/* Berber Sütunu Başlığı */}
        {barberStaff && (
          <div className="sticky top-0 z-10 bg-background border-b px-2 py-4 text-center">
            <span className="font-medium text-sm">{barberStaff.name} (Berber)</span>
          </div>
        )}

        {/* Diğer Çalışan Sütun Başlıkları */}
        {otherStaff.map(staff => (
          <div key={staff.id} className="sticky top-0 z-10 bg-background border-b border-l px-2 py-4 text-center">
            <span className="font-medium text-sm">{staff.name}</span>
          </div>
        ))}

        {/* Zaman Dilimleri Alanı (İçerik) */}
        <div className="border-r row-start-2">
          {timeSlots.map((time) => (
            <div key={time} className="h-16 flex items-center justify-center text-xs text-muted-foreground border-b px-1 whitespace-nowrap">
              {time}
            </div>
          ))}
        </div>

        {/* Berber Randevu Sütunu (İçerik) */}
        {barberStaff && (
          <div className="relative border-b row-start-2">
            {timeSlots.map((slot, index) => (
              <div key={slot} className="h-16 border-b" /> // Arka plan çizgileri için
            ))}
            {barberAppointments.map((appointment) => {
              const [hours, minutes] = appointment.time.split(":").map(Number);
              const slotIndex = timeSlots.findIndex(ts => ts === appointment.time);
              if (slotIndex === -1) return null; // Zaman dilimi eşleşmezse gösterme

              // duration ve endTime'a göre yükseklik hesaplaması (varsayımsal)
              // API'den gelen endTime ve time stringlerini Date nesnesine çevirip farkı bulmalıyız.
              // Şimdilik sabit bir yükseklik veya slot sayısı verelim.
              // Örnek: appointment.duration (dakika cinsinden) / 15 (slot aralığı) = kaç slot kaplayacak
              // Bu duration API'den gelmiyor, onu eklememiz veya endTime'a göre hesaplamamız gerek.
              // Şimdilik 1 slot (45dk) kapladığını varsayalım.
              const appointmentDurationSlots = 3; // 11:00-11:45 gibi 3 slotu (45dk) kaplar.
                                            // Eğer timeSlots aralığı 45dk ise bu 1 olmalı.
                                            // timeSlots aralığı şu an 45dk değil, düzeltilmeli.
                                            // Düzeltme: Time slotları 15dk aralıklarla olmalı veya süre hesaplaması çok daha karmaşık olacak.
                                            // Şimdilik randevunun başladığı tek bir slotta gösterelim.

              return (
                <div
                  key={appointment.id}
                  className="absolute bg-primary/10 border-l-4 border-primary rounded-md p-1 overflow-hidden text-xs shadow-md"
                  style={{
                    top: `${slotIndex * 4}rem`, // h-16 (4rem) varsayımıyla
                    left: '2px',
                    right: '2px',
                    height: `${4 * 1}rem`, // Şimdilik 1 slot yüksekliğinde
                  }}
                >
                  <div className="font-semibold truncate">{appointment.customer.name}</div>
                  {appointment.service && <div className="text-muted-foreground truncate">{appointment.service}</div>}
                  <div>{appointment.time} - {appointment.endTime}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Diğer Çalışanların Randevu Sütunları */}
        {otherStaff.map(staff => (
          <div key={staff.id} className="relative border-l border-b row-start-2">
            {timeSlots.map((slot, index) => (
              <div key={slot} className="h-16 border-b" /> // Arka plan çizgileri
            ))}
            {(otherEmployeeAppointments.get(staff.id) || []).map(appointment => {
              const slotIndex = timeSlots.findIndex(ts => ts === appointment.time);
              if (slotIndex === -1) return null;
              return (
                <div
                  key={appointment.id}
                  className="absolute bg-secondary/20 border-l-4 border-secondary rounded-md p-1 overflow-hidden text-xs shadow-md"
                  style={{
                    top: `${slotIndex * 4}rem`,
                    left: '2px',
                    right: '2px',
                    height: `${4 * 1}rem`,
                  }}
                >
                  <div className="font-semibold truncate">{appointment.customer.name}</div>
                  {appointment.service && <div className="text-muted-foreground truncate">{appointment.service}</div>}
                  <div>{appointment.time} - {appointment.endTime}</div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// Aylık görünüm bileşeni
function MonthlyView({ 
  selectedDate, 
  monthlyData 
}: { 
  selectedDate: Date
  monthlyData: MonthlyDataType[]
}) {
  // Ayın ilk gününü ve ay sonunu bulma
  const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  const lastDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
  
  // Haftanın günleri (Pazartesi'den başlayarak)
  const weekDays = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]
  
  // Takvim oluşturmak için gerekli hesaplamalar
  const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1 // 0: Pazar, 1: Pazartesi olduğu için düzeltme
  const totalDays = lastDay.getDate()
  
  // Takvim günlerini oluşturma
  const calendarDays = Array(42).fill(null).map((_, index) => {
    const dayOffset = index - firstDayOfWeek
    if (dayOffset < 0 || dayOffset >= totalDays) {
      return null // Ay dışındaki günler
    }
    const day = dayOffset + 1
    const appointmentData = monthlyData.find(d => d.day === day) || { day, appointments: 0, capacity: 0 }
    return appointmentData
  })
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle>Aylık Görünüm</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {/* Haftanın günleri başlıkları */}
          {weekDays.map((day) => (
            <div key={day} className="text-center text-sm font-medium p-2">
              {day}
            </div>
          ))}
          
          {/* Takvim günleri */}
          {calendarDays.map((day, index) => (
            <div key={index} className={`aspect-square p-1 ${!day ? 'opacity-30' : ''}`}>
              {day && (
                <div
                  className={`h-full rounded-md border flex flex-col items-center justify-center p-1 hover:bg-muted/50 transition-colors ${
                    day.day === selectedDate.getDate() ? 'bg-primary/10 border-primary' : ''
                  }`}
                >
                  <span className="text-sm font-medium">{day.day}</span>
                  {day.appointments > 0 && (
                    <div className="mt-1 inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                      {(day.capacity && day.capacity > 0) ? `${day.appointments}/${day.capacity}` : day.appointments}
                    </div>
                  )}
                  {day.appointments === 0 && day.capacity && day.capacity > 0 && (
                    <div className="mt-1 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                      0/{day.capacity}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function AppointmentsCalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [view, setView] = useState<"day" | "week" | "month">("day")
  const [appointments, setAppointments] = useState<AppointmentType[]>([])
  const [staffMembers, setStaffMembers] = useState<StaffMemberType[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [monthlyData, setMonthlyData] = useState<MonthlyDataType[]>([])
  const [shopId, setShopId] = useState<string | null>(null); // Shop ID state'i

  // Örnek olarak shopId'yi localStorage'dan alalım veya varsayılan bir değer atayalım.
  // Gerçek uygulamada bu, kullanıcının session'ından veya global state'ten gelmeli.
  useEffect(() => {
    const storedShopId = localStorage.getItem('selectedShopId'); 
    if (storedShopId) {
      setShopId(storedShopId);
    } else {
      // Örnek bir shopId, normalde bu olmamalı, kullanıcı seçmeli veya atanmalı
      // setShopId("shp_001"); 
      setError("Lütfen bir dükkan seçin veya dükkan ID'si bulunamadı.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!shopId) return; // Shop ID yoksa veri çekme

    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        // fetchAppointmentsData içeriği buraya taşınabilir veya ayrı fonksiyon olarak kalabilir
        const formattedDate = selectedDate.toISOString().split('T')[0];
        const appointmentsResponse = await fetch(
          `/api/shops/${shopId}/appointments?date=${formattedDate}`
        );
        if (!appointmentsResponse.ok) {
          const errorData = await appointmentsResponse.json();
          throw new Error(errorData.error || "Randevular yüklenemedi");
        }
        const rawAppointmentsData: any[] = await appointmentsResponse.json(); 
        const formattedAppointments = rawAppointmentsData.map((app): AppointmentType => {
          const customerName = `${app.user?.firstName || ''} ${app.user?.lastName || ''}`.trim() || 'Müşteri Bilinmiyor';
          return {
            id: app.id,
            date: app.date,
            time: app.time,
            endTime: app.endTime,
            notes: app.notes,
            shopId: app.shopId,
            userId: app.userId,
            employeeId: app.employeeId,
            customer: {
              name: customerName,
              avatar: app.user?.profile?.avatarUrl || '',
              initials: getInitials(customerName),
              phone: app.user?.phone || ''
            },
            service: app.notes?.split('Service:')[1]?.split('\n')[0]?.trim() || '',
            duration: parseInt(app.notes?.split('Duration:')[1]?.split('\n')[0]?.trim() || '45') 
          };
        });        
        setAppointments(formattedAppointments);

        const staffResponse = await fetch(`/api/staff?shopId=${shopId}`);
        if (!staffResponse.ok) {
          const errorData = await staffResponse.json();
          throw new Error(errorData.error || "Personel listesi yüklenemedi");
        }
        const staffData = await staffResponse.json();
        setStaffMembers(staffData.map((s: any) => ({ 
            id: s.id, 
            name: s.name, 
            role: s.role || (s.name.toLowerCase().includes('berber') ? 'Berber' : 'Çalışan') 
        })));

        // Aylık görünüm verilerini de aynı useEffect içinde çekelim
        if (view === "month") {
          console.log(`[EFFECT] Fetching monthly data for ${shopId}, ${selectedDate.toISOString()}`);
          await fetchMonthlyData(shopId, selectedDate); // fetchMonthlyData zaten burada çağrılıyor
        }

      } catch (err: any) {
        console.error("Veri yükleme hatası:", err);
        setError(err.message || "Takvim verileri yüklenirken bir sorun oluştu.");
        setAppointments([]);
        setStaffMembers([]);
        setMonthlyData([]); // Hata durumunda aylık veriyi de sıfırla
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [selectedDate, shopId, view]); // Bağımlılıklara 'view' eklendi

  // Aylık veri çekme fonksiyonu
  const fetchMonthlyData = async (shopId: string, date: Date) => {
    console.log(`[fetchMonthlyData] Called for shopId: ${shopId}, date: ${date.toISOString()}`);
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-indexed month
    // API için ayın ilk ve son gününü YYYY-MM-DD formatında gönder
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    try {
      const response = await fetch(`/api/shops/${shopId}/appointments/stats?startDate=${formatDate(firstDayOfMonth)}&endDate=${formatDate(lastDayOfMonth)}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Aylık istatistik API hatası:", response.status, errorText);
        throw new Error(`Aylık istatistikler getirilemedi: ${response.status}`);
      }
      
      const statsFromApi: { date: string; count: number; capacity: number }[] = await response.json();
      console.log("[fetchMonthlyData] Stats from API:", statsFromApi);
      
      const daysInMonth = lastDayOfMonth.getDate();
      const daysArray: MonthlyDataType[] = [];

      for (let day = 1; day <= daysInMonth; day++) {
        // API'den gelen date string (YYYY-MM-DDTHH:mm:ss.sssZ) olduğu için new Date() ile parse etmeliyiz.
        // Ya da API sadece YYYY-MM-DD döndürüyorsa ona göre işlemeli.
        // Şu anki stats API'si `date: new Date(currentDate)` yani tam Date objesi döndürüyor.
        const statItem = statsFromApi.find((item) => {
            const itemDate = new Date(item.date); // API'den gelen date string'ini Date'e çevir
            return itemDate.getDate() === day && itemDate.getMonth() === month && itemDate.getFullYear() === year;
        });

        daysArray.push({
          day,
          appointments: statItem ? statItem.count : 0,
          capacity: statItem ? statItem.capacity : 0, // Eğer statItem yoksa kapasite de 0 olmalı
        });
      }
      
      console.log("[fetchMonthlyData] Processed monthly data:", daysArray);
      setMonthlyData(daysArray);

    } catch (error) {
      console.error("Aylık veriler yüklenirken hata:", error);
      // Hata durumunda ayın tüm günleri için boş veri oluştur
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const emptyDaysArray: MonthlyDataType[] = [];
      for (let day = 1; day <= daysInMonth; day++) {
        emptyDaysArray.push({
          day,
          appointments: 0,
          capacity: 0
        });
      }
      setMonthlyData(emptyDaysArray);
    }
  };
  
  // Tarih değiştirme işleyicileri
  const handlePrevDate = () => {
    const newDate = new Date(selectedDate)
    if (view === "day") {
      newDate.setDate(selectedDate.getDate() - 1)
    } else if (view === "week") {
      newDate.setDate(selectedDate.getDate() - 7)
    } else if (view === "month") {
      newDate.setMonth(selectedDate.getMonth() - 1)
    }
    setSelectedDate(newDate)
  }

  const handleNextDate = () => {
    const newDate = new Date(selectedDate)
    if (view === "day") {
      newDate.setDate(selectedDate.getDate() + 1)
    } else if (view === "week") {
      newDate.setDate(selectedDate.getDate() + 7)
    } else if (view === "month") {
      newDate.setMonth(selectedDate.getMonth() + 1)
    }
    setSelectedDate(newDate)
  }

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Randevu Takvimi</h1>
          <p className="text-muted-foreground">Randevuları görüntüle ve yönet</p>
        </div>
        <Tabs defaultValue="day" value={view} onValueChange={(value) => setView(value as "day" | "week" | "month")}>
          <TabsList>
            <TabsTrigger value="day">Gün</TabsTrigger>
            <TabsTrigger value="week">Hafta</TabsTrigger>
            <TabsTrigger value="month">Ay</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={handlePrevDate}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold">
          {view === "month"
            ? selectedDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
            : formatDisplayDate(selectedDate)}
        </h2>
        <Button variant="outline" size="icon" onClick={handleNextDate}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-full">
          <p>Veriler yükleniyor...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-full">
          <p className="text-red-600">Hata: {error}</p>
        </div>
      ) : view === "day" ? (
        <DailyView 
          appointments={appointments} 
          timeSlots={timeSlots} 
          staffMembers={staffMembers} 
        />
      ) : view === "week" ? (
        <WeeklyView
          appointments={appointments}
          selectedDate={selectedDate}
          timeSlots={timeSlots}
          staffMembers={staffMembers}
        />
      ) : view === "month" ? (
        <MonthlyView 
          selectedDate={selectedDate} 
          monthlyData={monthlyData} 
        />
      ) : (
        <p>Diğer görünümler geliştirme aşamasında...</p>
      )}
    </div>
  )
}