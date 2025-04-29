"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Scissors, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState({
    upcoming: [],
    past: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("upcoming")

  // Randevu verilerini API'den çekme
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Gelecek randevuları getir
        const response = await fetch('/api/appointments?past=false')
        
        // API'den gelen tüm yanıtları kabul et
        const appointmentsData = await response.json().catch(() => []);
        
        // API verilerini UI için formatla (null kontrolü eklendi)
        const formatAppointment = (apt) => {
          if (!apt) return null;
          
          return {
            id: apt.id || "unknown",
            date: apt.date ? new Date(apt.date).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }) : "-",
            time: apt.time ? new Date(apt.time).toLocaleTimeString('tr-TR', {
              hour: '2-digit',
              minute: '2-digit'
            }) : "-",
            staff: apt.employee ? `${apt.employee.firstName || ''} ${apt.employee.lastName || ''}`.trim() : "-",
            service: apt.serviceName || "Belirtilmemiş",
            shopName: apt.shop?.name || "Belirtilmemiş"
          }
        }
        
        const formattedAppointments = Array.isArray(appointmentsData)
          ? appointmentsData.map(formatAppointment).filter(Boolean)
          : [];
        
        setAppointments({
          upcoming: formattedAppointments,
          past: []
        })
        
      } catch (error) {
        console.error("Randevu verileri yüklenirken hata:", error)
        // Hata olsa bile boş verilerle devam et
        setAppointments({
          upcoming: [],
          past: []
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchAppointments()
  }, [])

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Randevularım</h1>
        <Button asChild>
          <a href="/appointments/new">Yeni Randevu Al</a>
        </Button>
      </div>

      <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">Yaklaşan Randevular</TabsTrigger>
          <TabsTrigger value="past">Geçmiş Randevular</TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p>Randevular yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-red-600">Hata: {error}</p>
          </div>
        ) : (
          <>
            <TabsContent value="upcoming" className="space-y-4">
              {appointments.upcoming.length === 0 ? (
                <div className="text-center p-8 border rounded-lg bg-muted/50">
                  <h3 className="text-lg font-medium mb-2">Yaklaşan randevunuz bulunmuyor</h3>
                  <p className="text-muted-foreground mb-4">
                    Yeni bir randevu almak için "Yeni Randevu Al" butonuna tıklayabilirsiniz.
                  </p>
                  <Button asChild>
                    <a href="/appointments/new">Yeni Randevu Al</a>
                  </Button>
                </div>
              ) : (
                appointments.upcoming.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} type="upcoming" />
                ))
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {appointments.past.length === 0 ? (
                <div className="text-center p-8 border rounded-lg bg-muted/50">
                  <h3 className="text-lg font-medium">Geçmiş randevunuz bulunmuyor</h3>
                </div>
              ) : (
                appointments.past.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} type="past" />
                ))
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}

// Randevu kart bileşeni
function AppointmentCard({ appointment, type }) {
  // Null kontrolü ekle
  if (!appointment) {
    return null;
  }
  
  return (
    <Card className="overflow-hidden">
      <div className="md:flex">
        <div className="bg-primary p-6 md:w-1/3 flex flex-col justify-center items-center text-white">
          <Calendar className="h-12 w-12 mb-2" />
          <h3 className="text-xl font-bold text-center">{appointment.date || "-"}</h3>
          <div className="flex items-center mt-2">
            <Clock className="h-4 w-4 mr-1" />
            <span>{appointment.time || "-"}</span>
          </div>
        </div>

        <div className="p-6 md:w-2/3">
          <h3 className="text-lg font-semibold mb-4">{appointment.service || "Belirtilmemiş"}</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Scissors className="h-5 w-5 mr-2 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Berber</p>
                <p className="font-medium">{appointment.staff || "-"}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Dükkan</p>
                <p className="font-medium">{appointment.shopName || "-"}</p>
              </div>
            </div>
          </div>

          {type === "upcoming" && (
            <div className="flex justify-end mt-4 gap-2">
              <Button variant="outline" asChild>
                <a href={`/appointments/${appointment.id}/reschedule`}>Tarih Değiştir</a>
              </Button>
              <Button variant="destructive" asChild>
                <a href={`/appointments/${appointment.id}/cancel`}>İptal Et</a>
              </Button>
            </div>
          )}
          
          {type === "past" && !appointment.reviewed && (
            <div className="flex justify-end mt-4">
              <Button variant="outline" asChild>
                <a href={`/appointments/${appointment.id}/review`}>Değerlendir</a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}