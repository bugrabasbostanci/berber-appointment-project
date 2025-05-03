"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/features/layout/components/navbar"
import { Footer } from "@/features/layout/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Calendar, Home, Loader2 } from "lucide-react"
import Link from "next/link"

export default function AppointmentSuccessPage() {
  const [appointmentDetails, setAppointmentDetails] = useState({
    date: "",
    time: "",
    staff: "",
    staffRole: "",
    customerName: "",
    customerPhone: ""
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // localStorage'dan randevu bilgilerini alma
    const selectedDate = localStorage.getItem('selectedDate')
    const timeValue = localStorage.getItem('selectedTimeValue') || localStorage.getItem('selectedTime')
    const staffName = localStorage.getItem('selectedStaffName')
    const staffRole = localStorage.getItem('selectedStaffRole') || "Berber"
    const customerName = localStorage.getItem('customerName')
    const customerPhone = localStorage.getItem('customerPhone')
    
    if (selectedDate) {
      // Tarih formatını düzenleme
      let formattedDate = selectedDate
      try {
        // ISO formatındaysa (YYYY-MM-DD), Türkçe formatına çevir
        if (selectedDate.includes('-')) {
          const [year, month, day] = selectedDate.split('-').map(Number)
          const dateObj = new Date(year, month - 1, day)
          formattedDate = dateObj.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })
        }
      } catch (error) {
        console.error('Tarih formatı dönüştürme hatası:', error)
      }
      
      setAppointmentDetails({
        date: formattedDate,
        time: timeValue || "Belirtilmemiş",
        staff: staffName || "Belirtilmemiş",
        staffRole: staffRole,
        customerName: customerName || "Belirtilmemiş",
        customerPhone: customerPhone || "Belirtilmemiş"
      })
    }
    
    setLoading(false)
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-8 md:py-12 flex items-center justify-center">
        <Card className="max-w-md w-full mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Randevunuz Oluşturuldu!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tarih:</span>
                  <span className="font-medium">{appointmentDetails.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saat:</span>
                  <span className="font-medium">{appointmentDetails.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Personel:</span>
                  <span className="font-medium">{appointmentDetails.staff} ({appointmentDetails.staffRole})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ad Soyad:</span>
                  <span className="font-medium">{appointmentDetails.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Telefon:</span>
                  <span className="font-medium">{appointmentDetails.customerPhone}</span>
                </div>
              </div>
            )}
            <p className="text-sm text-center text-muted-foreground">
              Randevunuzu görüntülemek veya iptal etmek için randevular sayfasına gidiniz.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Link href="/dashboard/customer" className="w-full">
              <Button className="w-full flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Randevularım
              </Button>
            </Link>
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full flex items-center gap-2">
                <Home className="h-4 w-4" />
                Ana Sayfaya Dön
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
