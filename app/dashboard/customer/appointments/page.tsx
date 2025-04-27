"use client"

import { Calendar, Clock, Scissors, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AppointmentsPage() {
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

  // Mock data for past appointments
  const pastAppointments = [
    {
      id: "3",
      date: "1 Temmuz 2023",
      time: "16:00",
      staff: "Ali Demir",
      service: "Saç Kesimi + Yıkama",
    },
    {
      id: "4",
      date: "15 Haziran 2023",
      time: "10:00",
      staff: "Ahmet Yılmaz",
      service: "Saç Kesimi",
    },
    {
      id: "5",
      date: "1 Haziran 2023",
      time: "13:30",
      staff: "Mehmet Kaya",
      service: "Saç Kesimi",
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card className="flex-1">
        <Tabs defaultValue="upcoming" className="h-full flex flex-col">
          <div className="border-b px-4 py-2">
            <TabsList>
              <TabsTrigger value="upcoming" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Yaklaşan</span>
              </TabsTrigger>
              <TabsTrigger value="past" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Geçmiş</span>
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="flex-1 overflow-auto">
            <TabsContent value="upcoming" className="h-full p-0 m-0">
              <div className="h-full p-4">
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
                              <div className="flex items-center gap-1">
                                <User className="h-3.5 w-3.5" />
                                <span>{appointment.staff}</span>
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
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <p className="text-muted-foreground">Yaklaşan randevunuz bulunmamaktadır.</p>
                      <Button className="mt-4">Randevu Al</Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="past" className="h-full p-0 m-0">
              <div className="h-full p-4">
                {pastAppointments.length > 0 ? (
                  <div className="grid gap-4">
                    {pastAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <Scissors className="h-6 w-6 text-muted-foreground" />
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
                              <div className="flex items-center gap-1">
                                <User className="h-3.5 w-3.5" />
                                <span>{appointment.staff}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Tekrar Randevu Al
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">Geçmiş randevunuz bulunmamaktadır.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  )
}
