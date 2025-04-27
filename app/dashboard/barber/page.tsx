"use client"
import { Calendar, Clock, MoreHorizontal, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

// Mock data for appointments
const todaysAppointments = [
  {
    id: "1",
    time: "09:00",
    customer: {
      name: "Mehmet Aydın",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "MA",
    },
    service: "Saç Kesimi + Sakal Düzeltme",
  },
  {
    id: "2",
    time: "10:30",
    customer: {
      name: "Ali Demir",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "AD",
    },
    service: "Saç Kesimi",
  },
  {
    id: "3",
    time: "11:30",
    customer: {
      name: "Hasan Kaya",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "HK",
    },
    service: "Sakal Tıraşı",
  },
  {
    id: "4",
    time: "13:00",
    customer: {
      name: "Osman Şahin",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "OŞ",
    },
    service: "Saç Kesimi + Yıkama",
  },
]

export default function BarberDashboardPage() {
  // Format today's date
  const today = new Date()
  const formattedDate = today.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  })

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Top stats cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bugünkü Randevular</CardTitle>
            <CardDescription>Toplam randevu sayısı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{todaysAppointments.length}</div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Randevular</CardTitle>
            <CardDescription>Henüz tamamlanmamış randevular</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{todaysAppointments.length}</div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam Müşteriler</CardTitle>
            <CardDescription>Kayıtlı müşteri sayısı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">24</div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                <Users className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content area */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Bugünkü Randevular</CardTitle>
            <CardDescription>{formattedDate}</CardDescription>
          </div>
          <Link href="/dashboard/barber/calendar">
            <Button>Takvime Git</Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {todaysAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-sm font-medium">{appointment.time}</span>
                  </div>
                  <Separator orientation="vertical" className="h-10" />
                  <div className="flex items-center gap-3">
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
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                  Detay
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
