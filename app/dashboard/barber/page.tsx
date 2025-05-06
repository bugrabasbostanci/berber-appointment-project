"use client"
import { useState, useEffect } from "react"
import { Calendar, Clock, MoreHorizontal, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { formatFullDate, formatTime } from "@/features/shared/utils/date-utils"

// Tip tanımlamaları
type AppointmentType = {
  id: string
  time: string
  customer: {
    name: string
    avatar: string
    initials: string
    phone: string
  }
  service: string
}

type ApiAppointment = {
  id: string
  time: Date
  user: {
    firstName: string | null
    lastName: string | null
    phone: string | null
    profile?: {
      profileImage?: string
    }
  }
  service?: {
    name: string
  }
}

export default function BarberDashboardPage() {
  const [todaysAppointments, setTodaysAppointments] = useState<AppointmentType[]>([])
  const [customerCount, setCustomerCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Format today's date
  const today = new Date()
  const formattedDate = formatFullDate(today.toISOString())
  
  // Günün formatlanmış tarihi (yyyy-mm-dd)
  const todayFormatted = today.toISOString().split('T')[0]

  // Verileri API'den çekme
  useEffect(() => {
    const fetchDashboardData = async () => {
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
        
        // Bugünkü randevuları getirme
        const appointmentsResponse = await fetch(`/api/appointments?shopId=${shopId}&date=${todayFormatted}`)
        if (!appointmentsResponse.ok) {
          throw new Error('Randevu verileri getirilemedi')
        }
        
        const appointmentsData: ApiAppointment[] = await appointmentsResponse.json()
        
        // Müşteri sayısını getirme - ROLE=CUSTOMER olan kullanıcıların sayısını getirme
        const customersResponse = await fetch(`/api/users?role=CUSTOMER&count=true`)
        if (!customersResponse.ok) {
          throw new Error('Müşteri sayısı getirilemedi')
        }
        
        const customersData = await customersResponse.json()
        
        // API verilerini UI için uygun formata dönüştürme
        const formattedAppointments = appointmentsData.map((apt: ApiAppointment) => {
          // formatTime fonksiyonunu kullanarak saati formatla
          const formattedTime = formatTime(new Date(apt.time).toISOString())
          
          return {
            id: apt.id,
            time: formattedTime,
            customer: {
              name: `${apt.user.firstName || ''} ${apt.user.lastName || ''}`.trim(),
              avatar: apt.user.profile?.profileImage || "/placeholder.svg",
              initials: getInitials(`${apt.user.firstName || ''} ${apt.user.lastName || ''}`.trim()),
              phone: apt.user.phone || "-",
            },
            service: apt.service?.name || "Belirtilmemiş",
          }
        })
        
        setTodaysAppointments(formattedAppointments)
        setCustomerCount(customersData.count || 0)
        
      } catch (err: unknown) {
        console.error("Dashboard verileri yüklenirken hata:", err)
        setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu')
      } finally {
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [todayFormatted])
  
  // İsimlerin baş harflerini alma
  const getInitials = (name: string): string => {
    if (!name) return ''
    
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <p>Veriler yükleniyor...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-full">
          <p className="text-red-600">Hata: {error}</p>
        </div>
      ) : (
        <>
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
                  <div className="text-2xl font-bold">{todaysAppointments.filter(apt => {
                    const [hours, minutes] = apt.time.split(':').map(Number)
                    const now = new Date()
                    return (hours > now.getHours() || (hours === now.getHours() && minutes > now.getMinutes()))
                  }).length}</div>
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
                  <div className="text-2xl font-bold">{customerCount}</div>
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
                {todaysAppointments.length === 0 ? (
                  <div className="flex justify-center items-center p-8">
                    <p className="text-muted-foreground">Bugün için randevu bulunmuyor.</p>
                  </div>
                ) : (
                  todaysAppointments.map((appointment) => (
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
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/appointments/${appointment.id}`}>
                          <MoreHorizontal className="h-4 w-4 mr-2" />
                          Detay
                        </Link>
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}