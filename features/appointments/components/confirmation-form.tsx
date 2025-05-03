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
  const [availableTimes, setAvailableTimes] = useState<{ id: string; time: string; available: boolean }[]>([])
  const [appointmentDetails, setAppointmentDetails] = useState({
    date: new Date().toLocaleDateString('tr-TR'),
    time: "14:00",
    staff: "Personel bilgisi yükleniyor...",
    staffRole: "Berber",
    shopId: "",
    employeeId: ""
  })

  // Mevcut randevu bilgilerini localStorage'dan yükle
  useEffect(() => {
    // localStorage'dan mevcut seçili zamanları yükle
    const timeId = localStorage.getItem('selectedTime');
    const selectedDate = localStorage.getItem('selectedDate');
    const shopId = localStorage.getItem('selectedShopId') || "";
    const staffId = localStorage.getItem('selectedStaffId') || "";
    
    console.log("Onay sayfasına yüklenen veriler:", { timeId, selectedDate, shopId, staffId });
    
    // LocalStorage'dan gelen bilgileri direkt kaydet, sayfada gösterilmeye başlasın
    if (shopId) {
      localStorage.setItem('selectedShopId', shopId); // Doğru anahtar ile tekrar kaydet
    }
    
    if (selectedDate) {
      // Tarih formatına çevir
      let formattedDate = selectedDate;
      try {
        // ISO formatındaysa (YYYY-MM-DD), Türkçe formatına çevir
        if (selectedDate.includes('-')) {
          const dateParts = selectedDate.split('-');
          const dateObj = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
          formattedDate = dateObj.toLocaleDateString('tr-TR');
        }
      } catch (error) {
        console.error('Tarih formatı dönüştürme hatası:', error);
      }
      
      // Tarih bilgisini localStorage'a da kaydet
      localStorage.setItem('selectedDate', selectedDate);
      
      // appointmentDetails'ı güncelle
      setAppointmentDetails(prev => ({
        ...prev,
        date: formattedDate,
        shopId: shopId,
        employeeId: staffId
      }));
    }
    
    // Seçili personel bilgilerini getir
    if (staffId) {
      // Eğer personel ID'si "default-" ile başlıyorsa, API çağrısı yapmayalım
      if (staffId.startsWith('default-')) {
        // Varsayılan personel bilgilerini kullan
        const defaultStaffName = staffId === 'default-staff-1' ? 
          'Berber Ustası' : staffId === 'default-staff-2' ? 
          'Çırak' : 'Varsayılan Personel';
        
        const defaultStaffRole = staffId === 'default-staff-1' ? 'Berber' : 'Çalışan';
        
        // Personel adını güncelle
        setAppointmentDetails(prev => ({
          ...prev,
          staff: defaultStaffName,
          staffRole: defaultStaffRole
        }));
      } else {
        // Önce personel API'sini deneyelim
        fetch(`/api/staff`)
          .then(response => {
            if (!response.ok) {
              throw new Error('Personel listesi alınamadı');
            }
            return response.json();
          })
          .then(staffList => {
            // Personel listesinden şu anki personeli bul
            const staff = staffList.find((s: any) => s.id === staffId);
            
            if (staff) {
              // Personel bilgilerini güncelle
              const staffName = staff.name || 'Personel';
              const staffRole = staff.role === 'BARBER' ? 'Berber' : 'Çalışan';
              
              setAppointmentDetails(prev => ({
                ...prev,
                staff: staffName,
                staffRole: staffRole
              }));
            } else {
              throw new Error('Personel listesinde seçili personel bulunamadı');
            }
          })
          .catch(error => {
            console.error('Personel listesi alınamadı, doğrudan kullanıcı API çağrısı yapılacak:', error);
            
            // Alternatif olarak kullanıcı API'sini dene
            return fetch(`/api/users/${staffId}`)
              .then(response => {
                if (!response.ok) {
                  console.error(`API yanıt durumu: ${response.status}`);
                  throw new Error(`Personel bilgileri alınamadı (${response.status})`);
                }
                return response.json();
              })
              .then(data => {
                // Personel adını güncelle
                const staffName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'İsimsiz Personel';
                const staffRole = data.role === 'BARBER' ? 'Berber' : 'Çalışan';
                
                setAppointmentDetails(prev => ({
                  ...prev,
                  staff: staffName,
                  staffRole: staffRole
                }));
              })
              .catch(error => {
                console.error('Personel bilgileri alınamadı, varsayılan değerler kullanılacak:', error);
                
                // API'lerden veri alınamazsa varsayılan değerler kullan
                setAppointmentDetails(prev => ({
                  ...prev,
                  staff: 'Personel Bilgisi Alınamadı',
                  staffRole: 'Berber/Çalışan'
                }));
              });
          });
      }
    }
    
    if (timeId) {
      // 45 dakikalık randevu dilimleri
      const times = [
        "09:30", "10:15", "11:00", "11:45", "12:30", "13:15", 
        "14:00", "14:45", "15:30", "16:15", "17:00", "17:45",
        "18:30", "19:15", "20:00", "20:45"
      ];
      
      // Zamanları taşıyan objeleri oluştur
      const timeObjects = times.map((time, index) => ({
        id: (index + 1).toString(),
        time,
        available: true
      }));
      
      setAvailableTimes(timeObjects);
      
      // Seçili zamanı bul ve ayarla
      const selectedTime = timeObjects.find(t => t.id === timeId)?.time || "14:00";
      setAppointmentDetails(prev => ({
        ...prev,
        time: selectedTime
      }));
    }
    
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

  // Function to handle confirm button click
  const handleConfirm = async () => {
    if (name && phone && agreeToTerms) {
      setIsLoading(true)

      try {
        // Local storage'dan verileri al
        const storedShopId = localStorage.getItem('selectedShopId');
        const storedStaffId = localStorage.getItem('selectedStaffId'); // employeeId yerine selectedStaffId kullanıyoruz
        const storedDate = localStorage.getItem('selectedDate');
        const storedTime = localStorage.getItem('selectedTime');
        
        console.log('Randevu oluşturma verileri:', { storedShopId, storedStaffId, storedDate, storedTime });
        
        // Eksik veri kontrolü
        const missingFields = [];
        if (!storedShopId) missingFields.push('Dükkan');
        if (!storedStaffId) missingFields.push('Personel');
        if (!storedDate) missingFields.push('Tarih');
        if (!storedTime) missingFields.push('Saat');
        
        if (missingFields.length > 0) {
          throw new Error(`Randevu bilgileri eksik: ${missingFields.join(', ')}. Lütfen tüm alanları doldurun.`);
        }
        
        // Tarih/Zaman doğru formata dönüştür 
        const appointmentDate = storedDate || appointmentDetails.date;
        
        // Zaman bilgisi oluştur (12:30 gibi)
        let timeValue = appointmentDetails.time; // Varsayılan değer
        
        if (storedTime) {
          // StoredTime değeri ID olduğu için mevcut zaman listesinden gerçek saat değerini bulalım
          const selectedTimeObject = availableTimes.find(t => t.id === storedTime);
          if (selectedTimeObject) {
            timeValue = selectedTimeObject.time;
          } else {
            console.warn('Seçilen saat bulunamadı, varsayılan değer kullanılacak:', timeValue);
          }
        }
        
        // ISO formatında tarih/zaman oluştur: "2025-05-01T14:30:00"
        // Tarih formatını kontrol et - localStorage'dan gelen değer genellikle "YYYY-MM-DD" formatında
        const formattedDate = appointmentDate.includes('-') 
          ? appointmentDate // Zaten doğru formattaysa kullan
          : new Date(appointmentDate).toISOString().split('T')[0]; // Değilse, dönüştür
        
        // Zaman formatını kontrol ve birleştir
        const appointmentDateTime = new Date(`${formattedDate}T${timeValue}:00`);
        
        // Geçerli bir tarih olduğunu kontrol et
        if (isNaN(appointmentDateTime.getTime())) {
          throw new Error(`Geçersiz tarih/saat formatı: ${formattedDate} ${timeValue}`);
        }
        
        // Bitiş zamanını hesapla (45 dakika ekle)
        const endDateTime = new Date(appointmentDateTime.getTime() + 45 * 60000);
        
        console.log("Randevu verileri:", {
          shopId: storedShopId,
          staffId: storedStaffId,
          date: formattedDate,
          time: appointmentDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          notes,
        });
        
        // API çağrısı yap
        const response = await fetch('/api/appointments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shopId: storedShopId,
            staffId: storedStaffId, // Çalışan ID'sini de gönderiyor olabiliriz (backend yapısına göre)
            date: formattedDate, 
            time: appointmentDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            notes,
            customerName: name,
            customerPhone: phone
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('API hata yanıtı:', errorData);
          throw new Error(errorData.error || 'Randevu oluşturulurken bir hata oluştu');
        }

        const data = await response.json();
        console.log("Randevu oluşturuldu:", data);

        // Başarılı sonuç sayfasına yönlendir
        router.push("/appointments/success");
      } catch (error) {
        console.error("Randevu oluşturma hatası:", error);
        
        // Kullanıcıya anlaşılır bir hata mesajı göster
        let errorMessage = 'Randevu oluşturulurken bir hata oluştu';
        
        if (error instanceof Error) {
          errorMessage = error.message;
          
          // Eğer hata 401 veya 403 ise, oturum açma sayfasına yönlendir
          if (error.message.includes('401') || error.message.includes('403')) {
            alert('Bu işlemi yapabilmek için oturum açmanız gerekiyor. Yönlendiriliyorsunuz...');
            setTimeout(() => router.push('/login'), 1500);
            return;
          }
        }
        
        alert(errorMessage);
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
                  <PopoverTrigger asChild>
                    <div className="cursor-pointer inline-flex items-center justify-center rounded-full h-5 w-5 p-0 hover:bg-accent">
                      <Info className="h-3 w-3" />
                      <span className="sr-only">İptal politikası hakkında bilgi</span>
                    </div>
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
