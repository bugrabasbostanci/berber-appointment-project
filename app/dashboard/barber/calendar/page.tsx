"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

// Time slots for daily view
const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", 
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", 
  "17:00", "17:30", "18:00"
]

export default function AppointmentsCalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [view, setView] = useState("day") // "day", "week", "month"
  const [appointments, setAppointments] = useState([])
  const [staffMembers, setStaffMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [monthlyData, setMonthlyData] = useState([])

  // Tarih formatları için yardımcı fonksiyonlar
  const formatDate = (date) => {
    return date.toISOString().split('T')[0]
  }

  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  // API'den randevu verilerini çekme
  useEffect(() => {
    const fetchAppointmentsData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Varsayılan olarak ilk dükkanı getirme
        const shopResponse = await fetch('/api/shops?take=1')
        if (!shopResponse.ok) {
          throw new Error('Dükkan bilgileri getirilemedi')
        }
        
        const shopData = await shopResponse.json()
        if (!shopData.shops || shopData.shops.length === 0) {
          throw new Error('Hiç dükkan bulunamadı')
        }
        
        const shopId = shopData.shops[0].id
        
        // Seçili tarihe göre randevuları getirme
        const dateString = formatDate(selectedDate)
        const response = await fetch(`/api/appointments?shopId=${shopId}&date=${dateString}`)
        
        if (!response.ok) {
          throw new Error('Randevu verileri getirilemedi')
        }
        
        const appointmentsData = await response.json()
        
        // API'den gelen verileri UI için uygun formata dönüştürme
        const formattedAppointments = appointmentsData.map(apt => ({
          id: apt.id,
          time: new Date(apt.time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          duration: Math.round((new Date(apt.endTime) - new Date(apt.time)) / (1000 * 60)),
          customer: {
            name: `${apt.customer.firstName || ''} ${apt.customer.lastName || ''}`.trim(),
            avatar: apt.customer.profileImage || "/placeholder.svg",
            initials: getInitials(`${apt.customer.firstName || ''} ${apt.customer.lastName || ''}`.trim()),
            phone: apt.customer.phone || "-",
          },
          service: apt.serviceName || "Belirtilmemiş",
          staff: `${apt.employee.firstName || ''} ${apt.employee.lastName || ''}`.trim(),
        }))
        
        setAppointments(formattedAppointments)
        
        // Dükkanın çalışanlarını getirme
        const staffResponse = await fetch(`/api/shops/${shopId}/employees`)
        if (!staffResponse.ok) {
          throw new Error('Personel bilgileri getirilemedi')
        }
        
        const staffData = await staffResponse.json()
        
        // Personel verilerini UI için formatlama
        const formattedStaff = staffData.map(staff => ({
          id: staff.id,
          name: `${staff.firstName || ''} ${staff.lastName || ''}`.trim(),
          role: staff.role === "BARBER" ? "Berber" : "Çalışan"
        }))
        
        setStaffMembers(formattedStaff)
        
        // Aylık görünüm verilerini getirme
        if (view === "month") {
          await fetchMonthlyData(shopId, selectedDate)
        }
        
      } catch (error) {
        console.error("Randevu verileri yüklenirken hata:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchAppointmentsData()
  }, [selectedDate, view])
  
  // Aylık görünüm verilerini getiren fonksiyon
  const fetchMonthlyData = async (shopId, date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)
    
    try {
      const response = await fetch(`/api/shops/${shopId}/appointments/stats?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}&groupBy=day`)
      
      if (!response.ok) {
        throw new Error('Aylık istatistikler getirilemedi')
      }
      
      const stats = await response.json()
      
      // API verisini takvim görünümü için formatlama
      const days = []
      for (let day = 1; day <= endDate.getDate(); day++) {
        const dayData = stats.find(item => new Date(item.date).getDate() === day) || { count: 0 }
        days.push({
          day,
          appointments: dayData.count
        })
      }
      
      setMonthlyData(days)
    } catch (error) {
      console.error("Aylık veriler yüklenirken hata:", error)
    }
  }
  
  // İsimlerin baş harflerini alma
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

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
        <Tabs defaultValue="day" value={view} onValueChange={setView}>
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

// Günlük görünüm bileşeni
function DailyView({ appointments, timeSlots, staffMembers }) {
  return (
    <div className="border rounded-md">
      <div className="grid grid-cols-[auto_1fr] h-full">
        {/* Zaman dilimlerini gösteren sol sütun */}
        <div className="border-r py-4">
          {timeSlots.map((time) => (
            <div key={time} className="px-2 py-3 text-muted-foreground text-sm">
              {time}
            </div>
          ))}
        </div>

        {/* Randevuları gösteren sağ sütun */}
        <div className="p-4 relative min-h-[600px]">
          {appointments.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-muted-foreground">Bu güne ait randevu bulunmuyor.</p>
            </div>
          ) : (
            appointments.map((appointment) => {
              // Randevunun konumu ve yüksekliğinin hesaplanması
              const [hours, minutes] = appointment.time.split(":").map(Number)
              const totalMinutesStart = hours * 60 + minutes
              const dayStart = 9 * 60 // 09:00
              const dayEnd = 18 * 60 // 18:00
              const dayLength = dayEnd - dayStart
              
              const top = ((totalMinutesStart - dayStart) / dayLength) * 100
              const height = (appointment.duration / dayLength) * 100
              
              return (
                <div
                  key={appointment.id}
                  className="absolute left-4 right-4 bg-primary/10 border-l-4 border-primary rounded-md p-2 overflow-hidden"
                  style={{
                    top: `${top}%`,
                    height: `${Math.max(height, 5)}%`,
                  }}
                >
                  <div className="flex items-start gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={appointment.customer.avatar} alt={appointment.customer.name} />
                      <AvatarFallback>{appointment.customer.initials}</AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                      <div className="font-medium truncate">{appointment.customer.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{appointment.service}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium">{appointment.time}</span> • {appointment.staff}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

// Aylık görünüm bileşeni
function MonthlyView({ selectedDate, monthlyData }) {
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
    const appointmentData = monthlyData.find(d => d.day === day) || { day, appointments: 0 }
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
                      {day.appointments}
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