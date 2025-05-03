"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import useUserStore from "@/app/stores/userStore"

type AppointmentType = {
  id: string;
  time: string;
  customer: {
    name: string;
    avatar: string;
    initials: string;
  };
  service: string;
}

// API'den alınan randevu tipi
type ApiAppointment = {
  id: string;
  time: string;
  user: {
    firstName: string | null;
    lastName: string | null;
    profile?: {
      profileImage: string | null;
    }
  };
  service?: {
    name: string;
  };
}

export default function EmployeeDashboardPage() {
  const [todaysAppointments, setTodaysAppointments] = useState<AppointmentType[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const userStore = useUserStore()

  // Format today's date
  const today = new Date()
  const formattedDate = today.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  })
  
  // Günün formatlanmış tarihi (yyyy-mm-dd)
  const todayFormatted = today.toISOString().split('T')[0]

  // İsimlerin baş harflerini alma
  const getInitials = (name: string): string => {
    if (!name) return ''
    
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
  }

  // Verileri API'den çekme
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!userStore.authUser?.id) return;
      
      try {
        setLoading(true)
        setError(null)
        
        // Çalışanın randevularını getir
        const response = await fetch(`/api/employees/${userStore.authUser.id}/appointments?date=${todayFormatted}`)
        
        if (!response.ok) {
          throw new Error('Randevu verileri getirilemedi')
        }
        
        const data: ApiAppointment[] = await response.json()
        
        // API verilerini UI için uygun formata dönüştürme
        const formattedAppointments = data.map((apt: ApiAppointment) => ({
          id: apt.id,
          time: new Date(apt.time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          customer: {
            name: `${apt.user.firstName || ''} ${apt.user.lastName || ''}`.trim() || 'İsimsiz Müşteri',
            avatar: apt.user.profile?.profileImage || "/placeholder.svg",
            initials: getInitials(`${apt.user.firstName || ''} ${apt.user.lastName || ''}`.trim() || 'İM'),
          },
          service: apt.service?.name || "Belirtilmemiş",
        }))
        
        setTodaysAppointments(formattedAppointments)
      } catch (err: unknown) {
        console.error("Randevu verileri yüklenirken hata:", err)
        setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu')
        // Hata durumunda boş dizi ile devam et
        setTodaysAppointments([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchAppointments()
  }, [todayFormatted, userStore.authUser?.id])

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Çalışan Paneli</h1>
        <p className="text-muted-foreground">Randevularınızı yönetin</p>
      </div>

      {/* Top stats cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bugünkü Randevular</CardTitle>
            <CardDescription>{formattedDate}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{loading ? "..." : todaysAppointments.length}</div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Kalan Randevular</CardTitle>
            <CardDescription>Günün geri kalanı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {loading 
                  ? "..." 
                  : todaysAppointments.filter(apt => {
                    const [hours, minutes] = apt.time.split(':').map(Number)
                    const now = new Date()
                    return (hours > now.getHours() || (hours === now.getHours() && minutes > now.getMinutes()))
                  }).length
                }
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                <Clock className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments list */}
      <Card>
        <CardHeader>
          <CardTitle>Bugünkü Randevularınız</CardTitle>
          <CardDescription>
            {formattedDate} tarihinde planlanan tüm randevular
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">Randevular yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-red-500">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => window.location.reload()}
              >
                Yeniden Dene
              </Button>
            </div>
          ) : todaysAppointments.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">Bugün için randevu bulunmuyor</p>
              <Button asChild className="mt-2" size="sm">
                <Link href="/dashboard/employee/calendar">Takvimi Görüntüle</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {todaysAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold">{appointment.time}</div>
                  </div>
                  <Separator orientation="vertical" className="h-12" />
                  <Avatar>
                    <AvatarImage src={appointment.customer.avatar} alt={appointment.customer.name} />
                    <AvatarFallback>{appointment.customer.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 grid gap-0.5">
                    <div className="font-medium">{appointment.customer.name}</div>
                    <div className="text-sm text-muted-foreground">{appointment.service}</div>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/dashboard/employee/calendar?date=${todayFormatted}`}>Detay</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
