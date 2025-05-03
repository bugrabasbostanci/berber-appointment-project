"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useIsMobile } from "@/hooks/use-mobile"
import useUserStore from "@/app/stores/userStore"
import { useSearchParams } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

// API'den alınan randevu tipi
type ApiAppointment = {
  id: string;
  time: string;
  date: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
    profile?: {
      profileImage: string | null;
    }
  };
  service?: {
    id: string;
    name: string;
    duration: number;
  };
  duration: number;
}

// UI için kullanılacak randevu tipi
type AppointmentType = {
  id: string;
  date: Date;
  time: string;
  customer: {
    name: string;
    avatar: string;
    initials: string;
  };
  service: string;
  duration: number;
}

// Time slots for daily view
const timeSlots = [
  "09:30", "10:15", "11:00", "11:45", "12:30", "13:15", 
  "14:00", "14:45", "15:30", "16:15", "17:00", "17:45",
  "18:30", "19:15", "20:00", "20:45"
]

export default function EmployeeCalendarPage() {
  const searchParams = useSearchParams()
  const userStore = useUserStore()
  
  // URL'den tarih parametresini al
  const dateParam = searchParams.get('date')
  
  // Takvim ayı ve yılı
  const [currentDate, setCurrentDate] = useState(
    dateParam ? new Date(dateParam) : new Date()
  )
  
  // Randevu verileri
  const [appointments, setAppointments] = useState<AppointmentType[]>([])
  const [loading, setLoading] = useState(true)
  
  // Seçili gün ve ay
  const [selectedYear, selectedMonth] = [currentDate.getFullYear(), currentDate.getMonth()]
  
  // Takvimi görüntülemek için referans
  const calendarRef = useRef<HTMLDivElement>(null)
  
  // Mobil ekran kontrolü
  const isMobile = useIsMobile()

  // İsimlerin baş harflerini alma
  const getInitials = (name: string): string => {
    if (!name) return ''
    
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
  }

  // Ayın günlerini oluşturma
  const getDaysInMonth = (year: number, month: number) => {
    // Ayın ilk günü
    const firstDay = new Date(year, month, 1)
    
    // Ayın son günü
    const lastDay = new Date(year, month + 1, 0)
    
    // Önceki ayın son günleri
    const daysFromPrevMonth = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
    
    // Önceki ay
    const prevMonth = month === 0 ? 11 : month - 1
    const prevMonthYear = month === 0 ? year - 1 : year
    const prevMonthLastDay = new Date(prevMonthYear, prevMonth + 1, 0).getDate()
    
    const days = []
    
    // Önceki ayın son günleri
    for (let i = prevMonthLastDay - daysFromPrevMonth + 1; i <= prevMonthLastDay; i++) {
      days.push({
        date: new Date(prevMonthYear, prevMonth, i),
        isCurrentMonth: false,
        isToday: false,
      })
    }
    
    // Bu ayın günleri
    const today = new Date()
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i)
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString(),
      })
    }
    
    // Sonraki ayın ilk günleri
    const daysToAdd = 42 - days.length
    const nextMonth = month === 11 ? 0 : month + 1
    const nextMonthYear = month === 11 ? year + 1 : year
    
    for (let i = 1; i <= daysToAdd; i++) {
      days.push({
        date: new Date(nextMonthYear, nextMonth, i),
        isCurrentMonth: false,
        isToday: false,
      })
    }
    
    return days
  }
  
  const days = getDaysInMonth(selectedYear, selectedMonth)
  
  // Randevu verilerini getir
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!userStore.authUser?.id) return
      
      try {
        setLoading(true)
        
        // Ay başlangıç ve bitiş tarihlerini oluştur
        const startOfMonth = new Date(selectedYear, selectedMonth, 1)
        const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0)
        
        const startDateStr = startOfMonth.toISOString().split('T')[0]
        const endDateStr = endOfMonth.toISOString().split('T')[0]
        
        // Çalışan ID'si ile belirli bir tarih aralığındaki randevuları getir
        const response = await fetch(
          `/api/employees/${userStore.authUser.id}/appointments?startDate=${startDateStr}&endDate=${endDateStr}`
        )
        
        if (!response.ok) {
          throw new Error('Randevu verileri getirilemedi')
        }
        
        const data: ApiAppointment[] = await response.json()
        
        // API verilerini UI formatına dönüştür
        const formattedAppointments = data.map((apt: ApiAppointment) => {
          // Tarih formatlaması için zaman dilimi farkını telafi et
          let appointmentDate;
          if (apt.date) {
            // Zaman dilimi farkını önlemek için tarih kısmını ayrıca parse et
            const dateStr = new Date(apt.date).toISOString().split('T')[0]; // YYYY-MM-DD formatını al
            const [year, month, day] = dateStr.split('-').map(Number);
            
            // Yeni date objesi oluştur
            appointmentDate = new Date(year, month - 1, day);
          } else if (apt.time) {
            // Zamandan tarih bilgisi çıkar
            const dateStr = new Date(apt.time).toISOString().split('T')[0];
            const [year, month, day] = dateStr.split('-').map(Number);
            
            // Yeni date objesi oluştur
            appointmentDate = new Date(year, month - 1, day);
          } else {
            appointmentDate = new Date();
          }
          
          return {
            id: apt.id,
            date: appointmentDate,
            time: new Date(apt.time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            customer: {
              name: `${apt.user.firstName || ''} ${apt.user.lastName || ''}`.trim() || 'İsimsiz Müşteri',
              avatar: apt.user.profile?.profileImage || "/placeholder.svg",
              initials: getInitials(`${apt.user.firstName || ''} ${apt.user.lastName || ''}`.trim() || 'İM'),
            },
            service: apt.service?.name || "Belirtilmemiş",
            duration: apt.duration || apt.service?.duration || 30,
          }
        })
        
        setAppointments(formattedAppointments)
      } catch (error) {
        console.error('Randevu verileri yüklenirken hata:', error)
        toast({
          title: "Hata",
          description: "Randevu verileri yüklenirken bir hata oluştu",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchAppointments()
  }, [selectedYear, selectedMonth, userStore.authUser?.id])

  // İleri gitmek için 
  const nextMonth = () => {
    setCurrentDate(new Date(selectedYear, selectedMonth + 1, 1))
  }
  
  // Geri gitmek için
  const prevMonth = () => {
    setCurrentDate(new Date(selectedYear, selectedMonth - 1, 1))
  }
  
  // Bugüne dönmek için
  const goToToday = () => {
    setCurrentDate(new Date())
  }
  
  // Seçilen günün randevularını bul
  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter(
      (appointment) => appointment.date.toDateString() === day.toDateString()
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Page header */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Çalışan Takvimi</h1>
          <p className="text-muted-foreground">Randevu takviminizi görüntüleyin ve yönetin</p>
        </div>
        <div className="flex items-center gap-2 mt-2 md:mt-0">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Bugün
          </Button>
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Önceki ay</span>
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Sonraki ay</span>
          </Button>
          <div className="ml-2 text-sm font-medium">
            {currentDate.toLocaleDateString("tr-TR", { month: "long", year: "numeric" })}
          </div>
        </div>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>Aylık Takvim</CardTitle>
          <CardDescription>
            Randevularınızı görüntüleyin ve yönetin
          </CardDescription>
        </CardHeader>
        <div className="p-3" ref={calendarRef}>
          {/* Calendar header */}
          <div className="grid grid-cols-7 mb-3">
            {["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"].map((day) => (
              <div key={day} className="text-center text-sm font-medium">
                {day}
              </div>
            ))}
          </div>
          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              const dayAppointments = getAppointmentsForDay(day.date)
              
              return (
                <div
                  key={i}
                  className={`aspect-square p-1 ${
                    !day.isCurrentMonth
                      ? "opacity-50 text-muted-foreground"
                      : day.isToday
                      ? "bg-primary/10 text-primary"
                      : ""
                  }`}
                >
                  <div className="h-full w-full rounded-md flex flex-col">
                    <div className="text-xs font-medium p-1">{day.date.getDate()}</div>
                    {loading ? (
                      <div className="flex-1 flex justify-center items-center">
                        <div className="w-4 h-4 border-t-2 border-primary animate-spin rounded-full" />
                      </div>
                    ) : (
                      <div className="flex-1 overflow-hidden">
                        {dayAppointments.length > 0 &&
                          dayAppointments.slice(0, isMobile ? 1 : 2).map((appointment, idx) => (
                            <div
                              key={appointment.id}
                              className="text-xs mb-1 truncate bg-primary/5 p-1 rounded"
                            >
                              {appointment.time} - {appointment.customer.name}
                            </div>
                          ))}
                        {dayAppointments.length > (isMobile ? 1 : 2) && (
                          <div className="text-xs text-center text-muted-foreground">
                            +{dayAppointments.length - (isMobile ? 1 : 2)} daha
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Günün randevuları (Örnek için bugün) */}
      <Card>
        <CardHeader>
          <CardTitle>Günlük Plan</CardTitle>
          <CardDescription>{currentDate.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</CardDescription>
        </CardHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {loading ? (
            <div className="col-span-3 flex justify-center py-8">
              <div className="w-6 h-6 border-t-2 border-primary animate-spin rounded-full" />
            </div>
          ) : (
            timeSlots.map((timeSlot) => {
              const appointmentsAtTime = appointments.filter(
                (appointment) =>
                  appointment.time === timeSlot &&
                  appointment.date.toDateString() === currentDate.toDateString()
              )
              
              return (
                <div key={timeSlot} className="border rounded-md p-2">
                  <div className="text-sm font-medium mb-1">{timeSlot}</div>
                  {appointmentsAtTime.length > 0 ? (
                    appointmentsAtTime.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center gap-2 bg-primary/5 p-2 rounded"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={appointment.customer.avatar} alt={appointment.customer.name} />
                          <AvatarFallback>{appointment.customer.initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{appointment.customer.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{appointment.service}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground h-8 flex items-center">
                      Müsait
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </Card>
    </div>
  )
}
