"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useIsMobile } from "@/hooks/use-mobile"

// Basitleştirilmiş randevu verileri
const appointmentsData = [
  {
    id: "1",
    date: new Date(2023, 5, 15),
    time: "09:00",
    customer: {
      name: "Mehmet Aydın",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "MA",
    },
    service: "Saç Kesimi + Sakal Düzeltme",
    duration: 45,
  },
  {
    id: "2",
    date: new Date(2023, 5, 15),
    time: "10:30",
    customer: {
      name: "Ali Demir",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "AD",
    },
    service: "Saç Kesimi",
    duration: 30,
  },
  {
    id: "3",
    date: new Date(2023, 5, 15),
    time: "11:30",
    customer: {
      name: "Hasan Kaya",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "HK",
    },
    service: "Sakal Tıraşı",
    duration: 20,
  },
  {
    id: "4",
    date: new Date(2023, 5, 16),
    time: "09:00",
    customer: {
      name: "Osman Şahin",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "OŞ",
    },
    service: "Saç Kesimi + Yıkama",
    duration: 45,
  },
  {
    id: "5",
    date: new Date(2023, 5, 16),
    time: "10:30",
    customer: {
      name: "Kemal Yıldız",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "KY",
    },
    service: "Saç Kesimi + Sakal Düzeltme",
    duration: 45,
  },
]

// Zaman dilimleri
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
  "18:30",
  "19:00",
]

// Time slots for the day view
// const timeSlots = [
//   "09:00",
//   "09:30",
//   "10:00",
//   "10:30",
//   "11:00",
//   "11:30",
//   "12:00",
//   "12:30",
//   "13:00",
//   "13:30",
//   "14:00",
//   "14:30",
//   "15:00",
//   "15:30",
//   "16:00",
//   "16:30",
//   "17:00",
//   "17:30",
//   "18:00",
//   "18:30",
//   "19:00",
// ]

// Simplified time slots for mobile view (hourly)
const mobileTimeSlots = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
]

// Days of the week for the week view
const daysOfWeek = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"]
const daysOfWeekShort = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]

export default function EmployeeCalendarPage() {
  const [date, setDate] = useState<Date>(new Date())
  const [view, setView] = useState("day") // day, week, month
  const calendarScrollRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  // Seçili tarihi formatla
  const formattedDate = date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  })

  // Get the start and end of the week for the selected date
  const getWeekDates = (date: Date) => {
    const day = date.getDay() || 7 // Convert Sunday (0) to 7
    const diff = date.getDate() - day + 1 // Adjust to Monday
    const monday = new Date(date)
    monday.setDate(diff)

    const weekDates = []
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(monday)
      nextDate.setDate(monday.getDate() + i)
      weekDates.push(nextDate)
    }
    return weekDates
  }

  const weekDates = getWeekDates(date)

  // Scroll to selected date in week view
  useEffect(() => {
    if (view === "week" && !isMobile) {
      // Scroll calendar to selected day column
      if (calendarScrollRef.current) {
        const selectedDayIndex = weekDates.findIndex((d) => d.toDateString() === date.toDateString())

        if (selectedDayIndex >= 0) {
          // +1 because of the time column
          const columnWidth = calendarScrollRef.current.scrollWidth / 8
          const scrollPosition = (selectedDayIndex + 1) * columnWidth - columnWidth / 2

          calendarScrollRef.current.scrollTo({
            left: scrollPosition,
            behavior: "smooth",
          })
        }
      }
    }
  }, [date, view, weekDates, isMobile])

  // Seçili tarih için randevuları filtrele
  const getFilteredAppointments = () => {
    if (view === "day") {
      return appointmentsData.filter(
        (appointment) =>
          appointment.date.getDate() === date.getDate() &&
          appointment.date.getMonth() === date.getMonth() &&
          appointment.date.getFullYear() === date.getFullYear(),
      )
    } else if (view === "week") {
      return appointmentsData.filter((appointment) => {
        const appDate = appointment.date
        return weekDates.some(
          (weekDate) =>
            weekDate.getDate() === appDate.getDate() &&
            weekDate.getMonth() === appDate.getMonth() &&
            weekDate.getFullYear() === appDate.getFullYear(),
        )
      })
    } else {
      // Month view - return all appointments in the current month
      return appointmentsData.filter(
        (appointment) =>
          appointment.date.getMonth() === date.getMonth() && appointment.date.getFullYear() === date.getFullYear(),
      )
    }
  }

  const filteredAppointments = getFilteredAppointments()

  // Önceki güne git
  const goToPrevious = () => {
    const newDate = new Date(date)
    if (view === "day") {
      newDate.setDate(newDate.getDate() - 1)
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setMonth(newDate.getMonth() - 1)
    }
    setDate(newDate)
  }

  // Sonraki güne git
  const goToNext = () => {
    const newDate = new Date(date)
    if (view === "day") {
      newDate.setDate(newDate.getDate() + 1)
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setDate(newDate)
  }

  // Bugüne git
  const goToToday = () => {
    setDate(new Date())
  }

  // Get appointments for a specific day in week view
  const getAppointmentsForDay = (day: Date) => {
    return appointmentsData.filter(
      (appointment) =>
        appointment.date.getDate() === day.getDate() &&
        appointment.date.getMonth() === day.getMonth() &&
        appointment.date.getFullYear() === day.getFullYear(),
    )
  }

  // Belirli bir zaman dilimi için randevuları getir
  const getAppointmentsForTimeSlot = (timeSlot: string) => {
    return filteredAppointments.filter((appointment) => appointment.time === timeSlot)
  }

  // Get appointments for a specific time slot and day
  const getAppointmentsForTimeSlotAndDay = (timeSlot: string, day: Date) => {
    return appointmentsData.filter(
      (appointment) =>
        appointment.time === timeSlot &&
        appointment.date.getDate() === day.getDate() &&
        appointment.date.getMonth() === day.getMonth() &&
        appointment.date.getFullYear() === day.getFullYear(),
    )
  }

  // Get appointments for an hour (for mobile view)
  const getAppointmentsForHour = (hour: string, day: Date) => {
    return appointmentsData.filter(
      (appointment) =>
        appointment.time.startsWith(hour) &&
        appointment.date.getDate() === day.getDate() &&
        appointment.date.getMonth() === day.getMonth() &&
        appointment.date.getFullYear() === day.getFullYear(),
    )
  }

  // Format month and year for month view
  const formattedMonthYear = date.toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 w-full">
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Takvimim</CardTitle>
              <CardDescription>Randevularınızı görüntüleyin ve yönetin</CardDescription>
            </div>
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

          {/* Günlük Görünüm */}
          <div className="mt-4">
            <div className="text-lg font-semibold mb-4">{formattedDate}</div>
            <div className="border rounded-md">
              <div className="grid grid-cols-1 divide-y">
                {timeSlots.map((timeSlot) => {
                  const appointmentsForSlot = getAppointmentsForTimeSlot(timeSlot)
                  return (
                    <div key={timeSlot} className="p-2">
                      <div className="flex items-start">
                        <div className="w-16 text-sm font-medium text-muted-foreground pt-2">{timeSlot}</div>
                        <div className="flex-1 min-h-[60px]">
                          {appointmentsForSlot.length > 0
                            ? appointmentsForSlot.map((appointment) => (
                                <div key={appointment.id} className="p-2 mb-1 rounded-md bg-muted/20 border">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage
                                          src={appointment.customer.avatar || "/placeholder.svg"}
                                          alt={appointment.customer.name}
                                        />
                                        <AvatarFallback>{appointment.customer.initials}</AvatarFallback>
                                      </Avatar>
                                      <span className="text-sm font-medium">{appointment.customer.name}</span>
                                    </div>
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {appointment.service} • {appointment.duration} dk
                                  </div>
                                </div>
                              ))
                            : null}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}
