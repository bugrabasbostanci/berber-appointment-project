"use client"

import { useState } from "react"
import { Calendar, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

// Basitleştirilmiş randevu verileri
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
  {
    id: "5",
    time: "14:30",
    customer: {
      name: "Kemal Yıldız",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "KY",
    },
    service: "Saç Kesimi + Sakal Düzeltme",
  },
]

export default function EmployeeDashboardPage() {
  // Basit state yönetimi
  const [appointments] = useState(todaysAppointments)

  // Bugünün tarihi
  const today = new Date()
  const formattedDate = today.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  })

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 w-full">
      {/* Üst istatistik kartları */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bugünkü Randevular</CardTitle>
            <CardDescription>Toplam randevu sayısı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{appointments.length}</div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sonraki Randevu</CardTitle>
            <CardDescription>Bir sonraki randevunuz</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{appointments[0]?.time || "--:--"}</div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ana içerik alanı */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Bugünkü Randevularım</CardTitle>
            <CardDescription>{formattedDate}</CardDescription>
          </div>
          <Link href="/dashboard/employee/calendar">
            <Button>Takvimimi Görüntüle</Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {appointments.map((appointment) => (
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
              </div>
            ))}
            {appointments.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">Bugün için randevunuz bulunmamaktadır.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
