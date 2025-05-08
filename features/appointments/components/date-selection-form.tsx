"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { AppointmentSteps } from "./appointment-steps"
import { Separator } from "@/components/ui/separator"

// Tip tanımlamalarını dışa çıkaralım
type AvailabilityDataFromAPI = { // API'den gelen veri için ayrı bir tip
  date: string;
  timeSlots: { slots?: Array<{ available?: boolean, [key: string]: any }> }; // timeSlots'un iç yapısını daha net tanımla
  isAvailable: boolean;
  shop?: {
    id: string;
    name: string;
  };
  profiles?: Array<{
    user: {
      id: string;
      firstName: string | null;
      lastName: string | null;
    }
  }>;
};

// Takvimde kullanılacak state için tip tanımı
export type DailyCalendarInfoFromAPI = {
  date: string; // YYYY-MM-DD
  isSpecificallyClosed: boolean;
  bookedAppointmentsCount: number;
};

// Pazar günlerini de ayırt etmek için bir union type kullanalım
type EnhancedDailyInfo = DailyCalendarInfoFromAPI | "sunday-closed";
type AvailabilityDisplayState = Record<string, EnhancedDailyInfo>; // Anahtar: YYYY-MM-DD

export function DateSelectionForm() {
  const router = useRouter()
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [today] = useState<Date>(new Date())
  // Güncellenmiş state ve tipi
  const [availabilityData, setAvailabilityData] = useState<AvailabilityDisplayState>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shopId, setShopId] = useState<string | null>(null)

  // Müsaitlik verilerini API'den çekme
  useEffect(() => {
    const fetchAvailabilityData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log(`[date-selection-form] Current month for fetch: ${currentMonth.toISOString()}`);
        
        const shopResponse = await fetch('/api/shops?take=1')
        if (!shopResponse.ok) {
          throw new Error('Dükkan bilgileri getirilemedi')
        }
        
        const shopData = await shopResponse.json()
        if (!shopData.shops || shopData.shops.length === 0) {
          throw new Error('Hiç dükkan bulunamadı')
        }
        
        const selectedShopId = shopData.shops[0].id
        setShopId(selectedShopId)
        
        // API için başlangıç ve bitiş tarihlerini YYYY-MM-DD formatında manuel oluştur
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1; // getMonth 0-indexed olduğu için +1

        // Başlangıç tarihi (ayın ilk günü)
        const startDateForAPI = `${year}-${month.toString().padStart(2, '0')}-01`;

        // Bitiş tarihi (ayın son günü)
        // Ayın son gününü bulmak için bir sonraki ayın 0. gününü kullanabiliriz
        const lastDayOfMonth = new Date(year, month, 0).getDate(); // month burada 1-indexed
        const endDateForAPI = `${year}-${month.toString().padStart(2, '0')}-${lastDayOfMonth.toString().padStart(2, '0')}`;
        
        console.log(`[date-selection-form] Manually Formatted dates for API: startDate=${startDateForAPI}, endDate=${endDateForAPI}`);
        
        const availabilityResponse = await fetch(
          `/api/shops/${selectedShopId}/availability?startDate=${startDateForAPI}&endDate=${endDateForAPI}`
        );
        
        if (!availabilityResponse.ok) {
          // Hata mesajını API yanıtından almaya çalışalım (varsa)
          let errorMsg = 'Müsaitlik verileri getirilemedi';
          try {
            const errorData = await availabilityResponse.json();
            errorMsg = errorData.error || errorMsg;
          } catch (e) {
            // JSON parse edilemezse varsayılan mesaj kullanılır
          }
          throw new Error(errorMsg);
        }
        
        const dailyInfoFromAPI: DailyCalendarInfoFromAPI[] = await availabilityResponse.json();
        console.log("API Müsaitlik Yanıtı (Yeni Format):", dailyInfoFromAPI);

        const newAvailabilityDisplayData: AvailabilityDisplayState = {};

        if (Array.isArray(dailyInfoFromAPI)) {
          dailyInfoFromAPI.forEach((dayInfo: DailyCalendarInfoFromAPI) => {
            if (!dayInfo || !dayInfo.date) return; // Gerekli alanları kontrol et
            newAvailabilityDisplayData[dayInfo.date] = dayInfo; // date (YYYY-MM-DD) anahtar olarak kullanılır
          });
        }
        
        console.log("İşlenmiş Müsaitlik Günleri (Yeni Format):", newAvailabilityDisplayData);
        setAvailabilityData(newAvailabilityDisplayData);
        
      } catch (caughtError) {
        const errorMessage = caughtError instanceof Error 
          ? caughtError.message 
          : 'Bilinmeyen bir hata oluştu';
        
        console.error("Müsaitlik verileri yüklenirken hata:", caughtError);
        setError(errorMessage);
        
        setAvailabilityData({}); // Hata durumunda müsaitlik verisini temizle
      } finally {
        setLoading(false)
      }
    }
    
    fetchAvailabilityData()
  }, [currentMonth])

  // Function to handle continue button click
  const handleContinue = () => {
    if (date && shopId) {
      // Seçilen tarihi localStorage'a kaydet
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Ay 0'dan başlar, +1 ekle ve 2 haneli yap
      const day = date.getDate().toString().padStart(2, '0'); // Günü 2 haneli yap
      const formattedDate = `${year}-${month}-${day}`;
      
      localStorage.setItem('selectedDate', formattedDate) // YYYY-MM-DD formatında
      localStorage.setItem('selectedShopId', shopId)
      console.log(`Tarih seçim formundan kaydedilen değerler: tarih=${formattedDate}, dükkan=${shopId}`);
      
      router.push("/appointments/new/time")
    }
  }

  // Function to go to previous month
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  // Function to go to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  // Get month name and year
  const monthName = currentMonth.toLocaleString("tr-TR", { month: "long" })
  const year = currentMonth.getFullYear()

  // Get days in month
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  // Adjust for Monday as first day of week (0 = Monday, 6 = Sunday)
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  // Create array of days
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Add empty cells for days before first day of month
  const emptyCells = Array.from({ length: adjustedFirstDay }, (_, i) => null)

  // Combine empty cells and days
  const calendarDays = [...emptyCells, ...days]

  // Get current time
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Format current time
  const formattedTime = currentTime.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })

  // Check if a day is today
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    )
  }

  // Check if a day is a Sunday
  const isSunday = (day: number) => {
    const dateToCheck = new Date(Date.UTC(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    return dateToCheck.getUTCDay() === 0; // 0 Pazar günüdür UTC'de
  }

  // Check if a day is in the past
  const isPastDay = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const todayWithoutTime = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return date < todayWithoutTime
  }

  // Check if a day is beyond 7 days from today
  const isBeyondActiveRange = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const todayWithoutTime = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const maxActiveDate = new Date(todayWithoutTime)
    maxActiveDate.setDate(todayWithoutTime.getDate() + 6) // 7 days including today
    return date > maxActiveDate
  }

  // Check if a day is disabled
  const isDisabled = (day: number) => {
    return isPastDay(day) || isSunday(day) || isBeyondActiveRange(day)
  }

  // Get availability level for a day
  const getAvailabilityLevel = (day: number): "high" | "medium" | "low" | "closed" => {
    const dayIsSunday = isSunday(day);
    if (dayIsSunday) return "closed";

    // Takvimdeki gün için YYYY-MM-DD formatında string oluştur (UTC bazlı)
    const dateToCheckUTC = new Date(Date.UTC(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    const yearStr = dateToCheckUTC.getUTCFullYear();
    const monthStr = (dateToCheckUTC.getUTCMonth() + 1).toString().padStart(2, '0');
    const dayStr = dateToCheckUTC.getUTCDate().toString().padStart(2, '0');
    const fullDateString = `${yearStr}-${monthStr}-${dayStr}`;

    const dayInfo = availabilityData[fullDateString];

    if (dayInfo) {
      if (dayInfo === "sunday-closed") { // Bu durum yukarıda zaten ele alındı ama tip kontrolü için kalabilir
        return "closed";
      }
      // DailyCalendarInfoFromAPI tipinde olmalı
      if (typeof dayInfo === 'object') {
        if (dayInfo.isSpecificallyClosed) {
          return "closed";
        }

        const bookedCount = dayInfo.bookedAppointmentsCount;
        const totalCapacity = 32; // Günlük toplam kapasite
        
        // Kapasite 0 veya daha azsa (olmamalı ama kontrol edelim)
        if (totalCapacity <= 0) return "low"; 

        const availableSlots = Math.max(0, totalCapacity - bookedCount); // Negatif olmasın
        const availabilityPercentage = (availableSlots / totalCapacity) * 100;

        if (availabilityPercentage >= 70) return "high";
        if (availabilityPercentage >= 30) return "medium";
        if (availabilityPercentage > 0) return "low";
        return "low"; // Hiç yer kalmamışsa (bookedCount >= totalCapacity)
      }
    }
    
    // Eğer API'den o gün için özel bir veri gelmemişse ve Pazar değilse,
    // "normal şartlarda açık" kabul edip, 0 randevu alınmış gibi varsayarak "high" döneriz.
    // Bu, API'nin o gün için { date: "YYYY-MM-DD", isSpecificallyClosed: false, bookedAppointmentsCount: 0 } gibi bir kayıt
    // DÖNDÜRMEDİĞİ durumlar için bir geri çekilme (fallback) mekanizmasıdır.
    // İdealde API, istenen aralıktaki her gün için bir kayıt döndürmelidir.
    return "high"; 
  };

  // Days of week
  const daysOfWeek = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Randevu Oluştur</h1>
        <p className="text-muted-foreground">Birkaç adımda kolayca randevu alın</p>
        <p className="text-sm text-muted-foreground mt-1">Sistem saati: {formattedTime}</p>
      </div>

      {/* Progress Steps */}
      <AppointmentSteps currentStep={1} />

      <h2 className="text-xl font-bold mb-4">Randevu Tarihi Seçin</h2>

      <Card>
        <CardContent className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium">Takvim</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Bugünden itibaren 7 gün içerisinde randevu alabilirsiniz. Renk kodları müsaitlik durumunu gösterir.
            </p>
          </div>

          <Separator className="my-4" />

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <p>Müsaitlik verileri yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-8">
              <p className="text-red-600">Hata: {error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-full hover:bg-muted flex items-center justify-center"
                  aria-label="Önceki ay"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex items-center">
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  <span className="text-lg font-medium">
                    {monthName.charAt(0).toUpperCase() + monthName.slice(1)} {year}
                  </span>
                </div>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-full hover:bg-muted flex items-center justify-center"
                  aria-label="Sonraki ay"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1">
              {daysOfWeek.map((day, index) => (
                  <div
                    key={day}
                    className={cn(
                      "h-10 flex items-center justify-center text-sm font-medium",
                      index === 6 ? "text-red-500" : "text-muted-foreground",
                    )}
                  >
                    {day}
                  </div>
                ))}

                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="h-14"></div>
                  }

                  const dayIsSunday = isSunday(day)
                  const dayIsDisabled = isDisabled(day)
                  const dayIsToday = isToday(day)
                  const dayIsSelected =
                    date?.getDate() === day &&
                    date?.getMonth() === currentMonth.getMonth() &&
                    date?.getFullYear() === currentMonth.getFullYear()
                  const availabilityLevel = getAvailabilityLevel(day)

                  return (
                    <div
                      key={`day-${day}`}
                      className={cn(
                        "relative h-14 border rounded-md flex flex-col items-center justify-center transition-colors",
                        dayIsDisabled ? "cursor-not-allowed" : "cursor-pointer",
                        dayIsSelected && "bg-foreground text-background",
                        dayIsToday && "border-primary border-2",
                        dayIsSunday && "bg-red-50 dark:bg-red-950",
                      )}
                      onClick={() => {
                        if (!dayIsDisabled) {
                          // const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                          // Tarihi yerel saat dilimi yerine UTC olarak oluştur
                          const newDate = new Date(Date.UTC(currentMonth.getFullYear(), currentMonth.getMonth(), day));
                          setDate(newDate)
                        }
                      }}
                    >
                      {dayIsToday && (
                        <div className="absolute top-1 right-1">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                          </span>
                        </div>
                      )}
                      <span
                        className={cn(
                          "text-sm font-medium",
                          dayIsSunday && "text-red-500",
                          dayIsSelected && "text-background",
                          dayIsDisabled && !dayIsSunday && "text-muted-foreground/50",
                        )}
                      >
                        {day}
                      </span>
                      {dayIsSunday && (
                        <span className="text-[10px] text-red-500 font-medium mt-0.5 px-1 py-0.5 bg-red-100 dark:bg-red-900 rounded">
                          KAPALI
                        </span>
                      )}
                      {!dayIsDisabled && !dayIsSunday && (
                        <div className="flex gap-0.5 mt-1">
                          {availabilityLevel === "high" && (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            </>
                          )}
                          {availabilityLevel === "medium" && (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              <span className="w-1.5 h-1.5 rounded-full bg-muted"></span>
                            </>
                          )}
                          {availabilityLevel === "low" && (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                              <span className="w-1.5 h-1.5 rounded-full bg-muted"></span>
                              <span className="w-1.5 h-1.5 rounded-full bg-muted"></span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center justify-center gap-6 mt-6">
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  </div>
                  <span className="text-xs text-muted-foreground">Yüksek Müsaitlik</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-muted"></span>
                  </div>
                  <span className="text-xs text-muted-foreground">Orta Müsaitlik</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-muted"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-muted"></span>
                  </div>
                  <span className="text-xs text-muted-foreground">Düşük Müsaitlik</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="px-6 py-4 border-t flex justify-between">
          <Link href="/">
            <Button variant="outline">İptal</Button>
          </Link>
          <Button onClick={handleContinue} disabled={!date || loading}>
            Devam Et
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

                