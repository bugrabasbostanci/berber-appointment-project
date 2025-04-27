"use client"

import { Calendar, Clock, Scissors } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CustomerDashboardPage() {
  // Mock data for upcoming appointments
  const upcomingAppointments = [
    {
      id: "1",
      date: "15 Temmuz 2023",
      time: "14:00",
      staff: "Ahmet Yılmaz",
      service: "Saç Kesimi + Sakal Düzeltme",
    },
    {
      id: "2",
      date: "22 Temmuz 2023",
      time: "11:30",
      staff: "Mehmet Kaya",
      service: "Saç Kesimi",
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Upcoming appointments section */}
      <Card className="flex-1">
        <CardHeader className="pb-3">
          <CardTitle>Yaklaşan Randevularım</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length > 0 ? (
            <div className="grid gap-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Scissors className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{appointment.service}</h3>
                      <div className="flex flex-wrap gap-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{appointment.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{appointment.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 self-end sm:self-auto">
                    <Button variant="outline" size="sm">
                      Değiştir
                    </Button>
                    <Button variant="destructive" size="sm">
                      İptal Et
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">Yaklaşan randevunuz bulunmamaktadır.</p>
                <Link href="/appointments/new">
                  <Button>Randevu Al</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 font-medium">Yeni Randevu</h3>
              <Link href="/appointments/new">
                <Button className="w-full" size="sm">
                  Randevu Al
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 font-medium">Tüm Randevular</h3>
              <Link href="/dashboard/customer/appointments">
                <Button className="w-full" variant="outline" size="sm">
                  Görüntüle
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="mb-3 font-medium">Profil Bilgileri</h3>
              <Link href="/dashboard/customer/profile">
                <Button className="w-full" variant="outline" size="sm">
                  Düzenle
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
