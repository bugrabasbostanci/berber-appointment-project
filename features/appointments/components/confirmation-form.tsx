"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ChevronLeft, Calendar, Clock, User, Check, AlertTriangle, Info } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { AppointmentSteps } from "./appointment-steps"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function ConfirmationForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [notes, setNotes] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [agreeToTerms, setAgreeToTerms] = useState(false)
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

  // Example appointment details (in a real app, these would come from state or context)
  const appointmentDetails = {
    date: "15 Temmuz 2023",
    time: "14:00",
    staff: "Ahmet Yılmaz",
    staffRole: "Berber",
    shopId: "1",
    employeeId: "2"
  }

  // Function to handle confirm button click
  const handleConfirm = async () => {
    if (name && phone && agreeToTerms) {
      setIsLoading(true)

      try {
        // API çağrısı yap
        const response = await fetch('/api/appointments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shopId: localStorage.getItem('selectedShopId') || appointmentDetails.shopId,
            employeeId: localStorage.getItem('selectedEmployeeId') || appointmentDetails.employeeId,
            date: new Date(appointmentDetails.date),
            time: new Date(`${appointmentDetails.date} ${appointmentDetails.time}`),
            endTime: new Date(new Date(`${appointmentDetails.date} ${appointmentDetails.time}`).getTime() + 30 * 60000), // 30 dakika ekle
            notes,
            customerName: name,
            customerPhone: phone
          })
        })

        if (!response.ok) {
          throw new Error('Randevu oluşturulurken bir hata oluştu');
        }

        const data = await response.json();
        console.log("Randevu oluşturuldu:", data);

        // Navigate to success page
        router.push("/appointments/success");
      } catch (error) {
        console.error("Error creating appointment:", error);
        // Hata durumunda kullanıcıya bilgi verebiliriz
      } finally {
        setIsLoading(false);
      }
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Randevu Oluştur</h1>
        <p className="text-muted-foreground">Birkaç adımda kolayca randevu alın</p>
        <p className="text-sm text-muted-foreground mt-1">Sistem saati: {formattedTime}</p>
      </div>

      {/* Progress Steps */}
      <AppointmentSteps currentStep={3} />

      <h2 className="text-xl font-bold mb-4">Randevu Onayı</h2>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="bg-muted p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="font-medium">Tarih:</span>
              </div>
              <span>{appointmentDetails.date}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="font-medium">Saat:</span>
              </div>
              <span>{appointmentDetails.time}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <span className="font-medium">Personel:</span>
              </div>
              <span>
                {appointmentDetails.staff} ({appointmentDetails.staffRole})
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">İletişim Bilgileri</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Ad Soyad</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ad Soyad"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon Numarası</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05XX XXX XX XX"
                  type="tel"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Ek Notlar</h3>
            <Textarea
              placeholder="Berberinize iletmek istediğiniz özel notlar (isteğe bağlı)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox id="terms" checked={agreeToTerms} onCheckedChange={(checked) => setAgreeToTerms(!!checked)} />
            <div className="grid gap-1.5 leading-none">
              <div className="flex items-center gap-1.5">
                <Label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  İptal politikasını kabul ediyorum
                </Label>
                <Popover>
                  <PopoverTrigger>
                    <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full p-0">
                      <Info className="h-3 w-3" />
                      <span className="sr-only">İptal politikası hakkında bilgi</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        Randevu İptal Politikası
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Randevunuzu en geç 3 saat öncesine kadar iptal edebilir veya değiştirebilirsiniz.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Randevunuza gelmemeniz veya geç iptal etmeniz durumunda, 24 saat içinde yeni randevu oluşturma
                        hakkınız kısıtlanabilir.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Randevunuza gelmemeniz durumunda diğer müşterilerimizin randevu alabilmesi için iptal etmeniz
                        önemlidir.
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <p className="text-xs text-muted-foreground">
                Randevunuzu en geç 3 saat öncesine kadar iptal edebilirsiniz.
              </p>
            </div>
          </div>
        </CardContent>

        <Separator />

        <CardFooter className="p-6 flex justify-between">
          <Link href="/appointments/new/time">
            <Button variant="outline" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Geri
            </Button>
          </Link>
          <Button
            onClick={handleConfirm}
            disabled={!name || !phone || !agreeToTerms || isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                İşleniyor...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Randevuyu Onayla
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
