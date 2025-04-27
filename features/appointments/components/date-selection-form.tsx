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

// Mock availability data - consistent for all months
const MOCK_AVAILABILITY_DATA = {
  high: [1, 5, 9, 13, 17, 21, 25, 29],
  medium: [2, 6, 10, 14, 18, 22, 26, 30],
  low: [3, 7, 11, 15, 19, 23, 27, 31],
  closed: [0], // Sundays will be added dynamically
}

export function DateSelectionForm() {
  const router = useRouter()
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [today] = useState<Date>(new Date())

  // Function to handle continue button click
  const handleContinue = () => {
    if (date) {
      console.log("Selected date:", date)
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
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return date.getDay() === 0
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
  const getAvailabilityLevel = (day: number) => {
    if (isSunday(day)) return "closed"
    if (MOCK_AVAILABILITY_DATA.high.includes(day % 31)) return "high"
    if (MOCK_AVAILABILITY_DATA.medium.includes(day % 31)) return "medium"
    if (MOCK_AVAILABILITY_DATA.low.includes(day % 31)) return "low"
    return "medium" // Default
  }

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
                        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
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
                            <div
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                dayIsSelected ? "bg-background" : "bg-green-500",
                              )}
                            ></div>
                            <div
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                dayIsSelected ? "bg-background" : "bg-green-500",
                              )}
                            ></div>
                            <div
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                dayIsSelected ? "bg-background" : "bg-green-500",
                              )}
                            ></div>
                          </>
                        )}
                        {availabilityLevel === "medium" && (
                          <>
                            <div
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                dayIsSelected ? "bg-background" : "bg-yellow-500",
                              )}
                            ></div>
                            <div
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                dayIsSelected ? "bg-background" : "bg-yellow-500",
                              )}
                            ></div>
                          </>
                        )}
                        {availabilityLevel === "low" && (
                          <div
                            className={cn("w-1.5 h-1.5 rounded-full", dayIsSelected ? "bg-background" : "bg-red-500")}
                          ></div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-foreground"></div>
                <span className="text-sm">Bugün</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border border-muted-foreground"></div>
                <span className="text-sm">Aktif Günler</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-red-500 font-medium px-1 py-0.5 bg-red-100 dark:bg-red-900 rounded">
                  KAPALI
                </span>
                <span className="text-sm">Pazar Günleri</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                </div>
                <span className="text-sm">Yüksek Müsaitlik</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                </div>
                <span className="text-sm">Orta Müsaitlik</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                <span className="text-sm">Düşük Müsaitlik</span>
              </div>
            </div>
          </div>
        </CardContent>

        <Separator />

        <CardFooter className="p-6 flex justify-between">
          <Link href="/">
            <Button variant="outline">İptal</Button>
          </Link>
          <Button onClick={handleContinue} disabled={!date}>
            Devam Et
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
