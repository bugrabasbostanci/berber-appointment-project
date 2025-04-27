"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

// Mock data for appointments
const appointmentsData = {
  "2023-07-10": [
    {
      id: "1",
      time: "09:00",
      duration: 60,
      customer: {
        name: "Mehmet Aydın",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "MA",
        phone: "+90 555 123 4567",
      },
      service: "Saç Kesimi + Sakal Düzeltme",
      staff: "Ahmet Yılmaz",
    },
    {
      id: "2",
      time: "10:30",
      duration: 30,
      customer: {
        name: "Ali Demir",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "AD",
        phone: "+90 555 234 5678",
      },
      service: "Saç Kesimi",
      staff: "Ahmet Yılmaz",
    },
    {
      id: "3",
      time: "11:30",
      duration: 30,
      customer: {
        name: "Hasan Kaya",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "HK",
        phone: "+90 555 345 6789",
      },
      service: "Sakal Tıraşı",
      staff: "Mehmet Kaya",
    },
  ],
  "2023-07-11": [
    {
      id: "4",
      time: "13:00",
      duration: 45,
      customer: {
        name: "Osman Şahin",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "OŞ",
        phone: "+90 555 456 7890",
      },
      service: "Saç Kesimi + Yıkama",
      staff: "Ahmet Yılmaz",
    },
    {
      id: "5",
      time: "14:30",
      duration: 60,
      customer: {
        name: "Kemal Yıldız",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "KY",
        phone: "+90 555 567 8901",
      },
      service: "Saç Kesimi + Sakal Düzeltme",
      staff: "Mehmet Kaya",
    },
  ],
  "2023-07-12": [
    {
      id: "6",
      time: "16:00",
      duration: 90,
      customer: {
        name: "Murat Öztürk",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "MÖ",
        phone: "+90 555 678 9012",
      },
      service: "Saç Boyama",
      staff: "Ahmet Yılmaz",
    },
  ],
  "2023-07-13": [
    {
      id: "7",
      time: "17:30",
      duration: 30,
      customer: {
        name: "Serkan Acar",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "SA",
        phone: "+90 555 789 0123",
      },
      service: "Saç Kesimi",
      staff: "Mehmet Kaya",
    },
  ],
}

// Mock data for monthly view
const monthlyData = [
  { day: 1, appointments: 5 },
  { day: 2, appointments: 3 },
  { day: 3, appointments: 0 },
  { day: 4, appointments: 7 },
  { day: 5, appointments: 4 },
  { day: 6, appointments: 2 },
  { day: 7, appointments: 0 },
  { day: 8, appointments: 6 },
  { day: 9, appointments: 3 },
  { day: 10, appointments: 5 },
  { day: 11, appointments: 4 },
  { day: 12, appointments: 2 },
  { day: 13, appointments: 3 },
  { day: 14, appointments: 0 },
  { day: 15, appointments: 5 },
  { day: 16, appointments: 6 },
  { day: 17, appointments: 4 },
  { day: 18, appointments: 3 },
  { day: 19, appointments: 2 },
  { day: 20, appointments: 0 },
  { day: 21, appointments: 5 },
  { day: 22, appointments: 4 },
  { day: 23, appointments: 3 },
  { day: 24, appointments: 6 },
  { day: 25, appointments: 2 },
  { day: 26, appointments: 0 },
  { day: 27, appointments: 4 },
  { day: 28, appointments: 5 },
  { day: 29, appointments: 3 },
  { day: 30, appointments: 2 },
  { day: 31, appointments: 0 },
]

// Time slots for daily view
const timeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
]

// Staff members
const staffMembers = [
  { id: "1", name: "Ahmet Yılmaz", role: "Berber" },
  { id: "2", name: "Mehmet Kaya", role: "Çalışan" },
]

export default function CalendarPage() {
  const [view, setView] = useState("daily")
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "long",
    })
  }

  // Navigate to today
  const goToToday = () => {
    setSelectedDate(new Date())
  }

  // Navigate to previous day/week/month
  const goToPrevious = () => {
    const newDate = new Date(selectedDate)
    if (view === "monthly") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else if (view === "weekly") {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setDate(newDate.getDate() - 1)
    }
    setSelectedDate(newDate)
  }

  // Navigate to next day/week/month
  const goToNext = () => {
    const newDate = new Date(selectedDate)
    if (view === "monthly") {
      newDate.setMonth(newDate.getMonth() + 1)
    } else if (view === "weekly") {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    setSelectedDate(newDate)
  }

  // Get appointments for the selected date
  const getAppointmentsForDate = (date) => {
    const dateString = date.toISOString().split("T")[0]
    return appointmentsData[dateString] || []
  }

  // Get month name and year
  const monthName = selectedDate.toLocaleDateString("tr-TR", { month: "long" })
  const year = selectedDate.getFullYear()

  // Get days in month
  const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate()

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay()
  // Adjust for Monday as first day of week (0 = Monday, 6 = Sunday)
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  // Create array of days
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Add empty cells for days before first day of month
  const emptyCells = Array.from({ length: adjustedFirstDay }, (_, i) => null)

  // Combine empty cells and days
  const calendarDays = [...emptyCells, ...days]

  // Get week days for weekly view
  const getWeekDays = () => {
    const weekStart = new Date(selectedDate)
    weekStart.setDate(selectedDate.getDate() - selectedDate.getDay() + 1) // Start from Monday

    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(weekStart)
      day.setDate(weekStart.getDate() + i)
      return day
    })
  }

  const weekDays = getWeekDays()

  // Monthly view content
  const MonthlyView = () => (
    <div className="grid grid-cols-7 gap-1 p-4">
      {/* Days of week */}
      {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((day) => (
        <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
          {day}
        </div>
      ))}

      {/* Calendar days */}
      {calendarDays.map((day, index) => {
        if (day === null) {
          return <div key={`empty-${index}`} className="h-24 p-1" />
        }

        const dayData = monthlyData.find((d) => d.day === day) || { appointments: 0 }
        const isToday =
          new Date().getDate() === day &&
          new Date().getMonth() === selectedDate.getMonth() &&
          new Date().getFullYear() === selectedDate.getFullYear()

        return (
          <div
            key={`day-${day}`}
            className={`h-24 border rounded-md p-1 hover:bg-accent/50 cursor-pointer transition-colors ${
              isToday ? "border-primary" : ""
            }`}
            onClick={() => {
              const newDate = new Date(selectedDate)
              newDate.setDate(day)
              setSelectedDate(newDate)
              setView("daily")
            }}
          >
            <div className="flex flex-col h-full">
              <div className={`text-right text-sm font-medium ${isToday ? "text-primary" : ""}`}>{day}</div>
              {dayData.appointments > 0 ? (
                <div className="flex flex-col justify-center items-center flex-1">
                  <div className="text-xs md:text-sm font-medium">{dayData.appointments}</div>
                </div>
              ) : (
                <div className="flex items-center justify-center flex-1 text-xs text-muted-foreground">-</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )

  // Weekly view content
  const WeeklyView = () => (
    <div className="p-4">
      <div className="grid grid-cols-8 gap-2">
        {/* Time column */}
        <div className="border-r pr-2">
          <div className="h-12"></div> {/* Empty cell for header */}
          {timeSlots.map((time) => (
            <div key={time} className="h-12 flex items-center justify-end pr-2">
              <span className="text-xs text-muted-foreground">{time}</span>
            </div>
          ))}
        </div>

        {/* Days columns */}
        {weekDays.map((day) => {
          const dayAppointments = getAppointmentsForDate(day)
          const isToday = day.toDateString() === new Date().toDateString()

          return (
            <div key={day.toISOString()} className="flex flex-col">
              {/* Day header */}
              <div
                className={`h-12 flex flex-col items-center justify-center border-b ${isToday ? "bg-primary/10" : ""}`}
              >
                <div className="text-sm font-medium">{day.toLocaleDateString("tr-TR", { weekday: "short" })}</div>
                <div className={`text-sm ${isToday ? "font-bold text-primary" : ""}`}>{day.getDate()}</div>
              </div>

              {/* Time slots */}
              <div className="relative">
                {timeSlots.map((time) => (
                  <div key={time} className="h-12 border-b border-dashed" />
                ))}

                {/* Appointments */}
                {dayAppointments.map((appointment) => {
                  const startTime = appointment.time
                  const startTimeIndex = timeSlots.findIndex((t) => t === startTime)
                  const heightInSlots = appointment.duration / 30

                  return (
                    <div
                      key={appointment.id}
                      className="absolute left-0 right-0 mx-1 rounded-md bg-primary/20 border border-primary/30 p-1 overflow-hidden"
                      style={{
                        top: `${startTimeIndex * 3}rem`,
                        height: `${heightInSlots * 3}rem`,
                      }}
                    >
                      <div className="text-xs font-medium truncate">{appointment.customer.name}</div>
                      <div className="text-xs truncate">{appointment.service}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  // Daily view content
  const DailyView = () => {
    // Personele göre randevuları gruplandır
    const appointments = getAppointmentsForDate(selectedDate)
    const groupedAppointments = {}

    // Personel listesini oluştur
    staffMembers.forEach((staff) => {
      groupedAppointments[staff.id] = []
    })

    // Randevuları personele göre gruplandır
    appointments.forEach((appointment) => {
      const staffId = staffMembers.find((s) => s.name === appointment.staff)?.id
      if (staffId && groupedAppointments[staffId]) {
        groupedAppointments[staffId].push(appointment)
      }
    })

    return (
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {staffMembers.map((staff) => (
            <div key={staff.id} className="border rounded-md p-4">
              <div className="font-medium text-lg mb-4 pb-2 border-b">
                {staff.name} - {staff.role}
              </div>

              {groupedAppointments[staff.id].length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Bu personel için randevu bulunmamaktadır.</div>
              ) : (
                <div className="space-y-4">
                  {groupedAppointments[staff.id]
                    .sort((a, b) => {
                      // Saatlere göre sırala (09:00, 10:30 gibi)
                      const timeA = a.time.split(":").map(Number)
                      const timeB = b.time.split(":").map(Number)
                      if (timeA[0] !== timeB[0]) return timeA[0] - timeB[0]
                      return timeA[1] - timeB[1]
                    })
                    .map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center p-3 border rounded-md hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center mr-3">
                          <span className="text-sm font-medium">{appointment.time}</span>
                          <span className="text-xs text-muted-foreground">{appointment.duration} dk</span>
                        </div>
                        <Separator orientation="vertical" className="h-10 mx-2" />
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={appointment.customer.avatar || "/placeholder.svg"}
                              alt={appointment.customer.name}
                            />
                            <AvatarFallback>{appointment.customer.initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{appointment.customer.name}</div>
                            <div className="text-sm text-muted-foreground">{appointment.service}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Takvim</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToPrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Bugün
              </Button>
              <Button variant="outline" size="sm" onClick={goToNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="text-lg font-medium">
              {view === "monthly"
                ? `${monthName} ${year}`
                : view === "weekly"
                  ? `${weekDays[0].toLocaleDateString("tr-TR", { day: "numeric", month: "long" })} - ${weekDays[6].toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}`
                  : formatDate(selectedDate)}
            </div>
            <Tabs value={view} onValueChange={setView}>
              <TabsList>
                <TabsTrigger value="monthly">Aylık</TabsTrigger>
                <TabsTrigger value="weekly">Haftalık</TabsTrigger>
                <TabsTrigger value="daily">Günlük</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {view === "monthly" && <MonthlyView />}
          {view === "weekly" && <WeeklyView />}
          {view === "daily" && <DailyView />}
        </CardContent>
      </Card>
    </div>
  )
}
