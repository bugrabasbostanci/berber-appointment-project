"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Scissors, User } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"

// Randevu tipi tanımlaması
interface Appointment {
  id: string;
  date: string;
  time: string;
  staff: string;
  service: string;
  shopName: string;
  reviewed?: boolean;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<{
    upcoming: Appointment[];
    past: Appointment[];
  }>({
    upcoming: [],
    past: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("upcoming")

  // Randevu verilerini API'den çekme
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Gelecek randevuları getir
        const response = await fetch('/api/appointments?past=false', {
          cache: 'no-store', // Önbelleğe alma, her zaman güncel veri al
          next: { revalidate: 0 } // SSR/ISR durumunda yeni veri al
        });
        
        // API'den gelen tüm yanıtları kabul et
        const appointmentsData = await response.json().catch(() => []);
        
        // Randevu verilerini formatla - bu işlev daha temiz kod sağlar
        const formatAppointment = (apt: any) => {
          if (!apt) return null;
          
          // Tarih formatlaması için zaman dilimi farkını telafi et
          let appointmentDate;
          if (apt.date) {
            // Zaman dilimi farkını önlemek için tarih kısmını ayrıca parse et
            const dateStr = apt.date.split('T')[0]; // YYYY-MM-DD formatını al
            const [year, month, day] = dateStr.split('-').map(Number);
            
            // Yeni date objesi oluştur (zaman dilimi etkisini kaldırarak)
            appointmentDate = new Date(year, month - 1, day);
          } else {
            appointmentDate = new Date();
          }
          
          return {
            id: apt.id || "unknown",
            date: appointmentDate.toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }),
            time: apt.time ? new Date(apt.time).toLocaleTimeString('tr-TR', {
              hour: '2-digit',
              minute: '2-digit'
            }) : "-",
            staff: apt.employee ? `${apt.employee.firstName || ''} ${apt.employee.lastName || ''}`.trim() : "-",
            service: apt.service?.name || apt.serviceName || "Belirtilmemiş",
            shopName: apt.shop?.name || "Belirtilmemiş Dükkan",
            reviewed: !!apt.review
          }
        }
        
        const formattedAppointments = Array.isArray(appointmentsData)
          ? appointmentsData.map(formatAppointment).filter(Boolean) as Appointment[]
          : [];
        
        setAppointments({
          upcoming: formattedAppointments,
          past: []
        })
        
      } catch (err) {
        console.error("Randevu verileri yüklenirken hata:", err)
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
function AppointmentCard({ appointment, type }: { appointment: Appointment; type: 'upcoming' | 'past' }) {
  // Null kontrolü ekle
  if (!appointment) {
    return null;
  }
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();
  
  // Randevu iptal işlevi
  const cancelAppointment = async () => {
    try {
      setIsDeleting(true);
      setDeleteError(null);
      
      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Randevu iptal edilemedi');
      }
      
      // Dialog'u kapat ve sayfayı yenile
      setShowDeleteDialog(false);
      router.refresh(); // Sayfayı yenileyerek güncel verileri getir
    } catch (error) {
      console.error('Randevu iptal hatası:', error);
      setDeleteError(error instanceof Error ? error.message : 'Randevu iptal edilemedi');
    } finally {
      setIsDeleting(false);
    }
  };
  
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
                <a href={`/dashboard/customer/appointments/reschedule?id=${appointment.id}`}>Tarih Değiştir</a>
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    İptal Ediliyor
                  </>
                ) : 'İptal Et'}
              </Button>
              
              <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Randevu İptal Edilecek</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bu randevuyu iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  {deleteError && (
                    <div className="p-3 my-2 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                      {deleteError}
                    </div>
                  )}
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Vazgeç</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        e.preventDefault(); // Dialogu kapatmayı engelle
                        cancelAppointment();
                      }}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          İptal Ediliyor...
                        </>
                      ) : "İptal Et"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
          
          {type === "past" && !appointment.reviewed && (
            <div className="flex justify-end mt-4">
              <Button variant="outline" asChild>
                <a href={`/dashboard/customer/appointments/review?id=${appointment.id}`}>Değerlendir</a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}