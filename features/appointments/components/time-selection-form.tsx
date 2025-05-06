"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ChevronLeft, Clock, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { AppointmentSteps } from "./appointment-steps"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { useSearchParams } from "next/navigation"

export function TimeSelectionForm() {
  const router = useRouter()
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined)
  const [selectedStaff, setSelectedStaff] = useState<string | undefined>(undefined)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [accordionValue, setAccordionValue] = useState<string>("staff")
  const [availableTimes, setAvailableTimes] = useState<{ id: string; time: string; available: boolean }[]>([])
  const [staffMembers, setStaffMembers] = useState<{ id: string; name: string; role: string; available: boolean; experience: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [shopId, setShopId] = useState<string>("")

  // Sayfa yüklendiğinde verileri getir
  useEffect(() => {
    const shopIdFromStorage = localStorage.getItem('selectedShopId');
    const serviceId = localStorage.getItem('selectedServiceId'); // Bu henüz kullanılmıyor gibi, ileride gerekebilir.
    const selectedDateFromStorage = localStorage.getItem('selectedDate') || new Date().toISOString().split('T')[0];
    
    setSelectedDate(selectedDateFromStorage);
    const finalShopId = shopIdFromStorage || "shp_001"; // Varsayılan dükkan ID
    setShopId(finalShopId);
    
    console.log(`İlk yükleme: shopId=${finalShopId}, tarih=${selectedDateFromStorage}`);
    
    // Çalışanları getir. fetchStaffMembers içinde ilk uygun çalışan seçilip fetchAvailableTimes tetiklenecek.
    if (finalShopId) {
      fetchStaffMembers(finalShopId, selectedDateFromStorage);
    }
    // setAvailableTimes(generateDefaultTimeSlots()); // Bu satır kaldırıldı, API'den veri bekleniyor.
  }, []); // Bağımlılıklar boş, sadece ilk yüklemede çalışır.

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

  // Kullanılabilir zamanları getirmek için
  const fetchAvailableTimes = async (date: string, shopId: string, employeeId?: string) => {
    if (!employeeId) {
      console.warn("fetchAvailableTimes: EmployeeId eksik. API çağrısı yapılmıyor.");
      setAvailableTimes([]);
      setError("Lütfen bir personel seçerek zamanları görüntüleyin.");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      console.log(`Müsaitlik kontrolü: date=${date}, shopId=${shopId}, employeeId=${employeeId}`);
      
      // Demo amaçlı 500ms bekleme
      // await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await fetch(`/api/availability/check?date=${date}&shopId=${shopId}&employeeId=${employeeId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Bilinmeyen sunucu hatası' }));
        throw new Error(errorData.error || 'Müsait zamanlar getirilemedi');
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.availableTimes)) {
        setAvailableTimes(data.availableTimes);
      } else if (Array.isArray(data.availableTimes)) { // success alanı olmasa da kabul et
        setAvailableTimes(data.availableTimes);
      } else {
        console.warn('API beklenmeyen format döndü veya availableTimes yok:', data);
        setAvailableTimes([]); // Hatalı veri durumunda boş liste
        setError(data.error || 'Müsait zaman formatı hatalı.');
      }
    } catch (error: any) {
      console.error('Zaman aralıkları getirme hatası:', error);
      setAvailableTimes([]); // Hata durumunda boş liste
      setError(error.message || 'Müsait zamanlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Çalışanları getirmek için
  const fetchStaffMembers = async (shopId: string, dateForAvailability: string) => {
    setLoading(true);
    setError(null);
    setStaffMembers([]); // Önceki listeyi temizle
    setSelectedStaff(undefined); // Seçili personeli temizle
    setAvailableTimes([]); // Zamanları temizle
    try {
      console.log(`Çalışanlar getiriliyor, Shop ID: ${shopId}`);
      const endpoint = `/api/staff?shopId=${shopId}`;
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Bilinmeyen sunucu hatası' }));
        throw new Error(`Çalışan bilgileri alınamadı (${response.status}): ${errorData.error || 'Sunucu hatası'}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        console.warn('Personel verisi bir dizi değil.');
        throw new Error('Personel verisi formatı hatalı.');
      }
      
      if (data.length === 0) {
        console.log('Personel listesi boş.');
        setError("Bu dükkanda kayıtlı personel bulunamadı.");
        // setStaffMembers([]); // Zaten yukarıda temizlendi
        // setSelectedStaff(undefined); // Zaten yukarıda temizlendi
        // setAvailableTimes([]); // Zaten yukarıda temizlendi
        return;
      }
      
      const formattedData = data.map((employee: any) => ({
        id: employee.id || `temp-id-${Math.random().toString(36).substring(7)}`,
        name: employee.name || 'İsimsiz Çalışan',
        role: employee.role?.toLowerCase() || "employee",
        available: employee.available !== false,
        experience: employee.experience || "Deneyimli"
      }));
      
      setStaffMembers(formattedData);
      
      // localStorage'dan son seçilen personeli almayı dene
      const lastSelectedStaffId = localStorage.getItem('selectedStaffId');
      const stillAvailableStaff = lastSelectedStaffId ? formattedData.find(s => s.id === lastSelectedStaffId && s.available) : undefined;

      if (stillAvailableStaff) {
        setSelectedStaff(stillAvailableStaff.id);
        console.log(`localStorage'dan son seçilen personel bulundu ve müsait: ${stillAvailableStaff.id}`);
        fetchAvailableTimes(dateForAvailability, shopId, stillAvailableStaff.id);
      } else {
        const firstAvailableStaff = formattedData.find(s => s.available);
        if (firstAvailableStaff) {
          setSelectedStaff(firstAvailableStaff.id);
          console.log(`İlk müsait personel otomatik seçildi: ${firstAvailableStaff.id}`);
          fetchAvailableTimes(dateForAvailability, shopId, firstAvailableStaff.id);
        } else {
          console.log('Müsait personel bulunamadı.');
          setError("Şu anda müsait personel bulunmamaktadır.");
          // setAvailableTimes([]); // Zaten temiz
        }
      }

    } catch (error: any) {
      console.error("Çalışan bilgileri alınamadı:", error);
      // setStaffMembers([]); // Zaten yukarıda temizlendi
      // setSelectedStaff(undefined); // Zaten yukarıda temizlendi
      // setAvailableTimes([]); // Zaten yukarıda temizlendi
      setError(`Çalışan bilgileri yüklenirken bir hata oluştu: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // selectedDate, selectedStaff veya shopId değiştiğinde zamanları yeniden getir
  useEffect(() => {
    // shopId'nin ilk yüklemede boş olabileceğini ve useEffect ile ayarlandığını unutma.
    // Bu useEffect, selectedStaff veya selectedDate kullanıcı tarafından değiştirildiğinde çalışmalı.
    // İlk yükleme mantığı ana useEffect'te ele alındı.
    
    // selectedStaff değiştiğinde (kullanıcı seçimi veya otomatik ilk atama sonrası)
    // ve selectedDate değiştiğinde (kullanıcı takvimden seçtiğinde)
    // ve shopId geçerli olduğunda çalışır.
    if (shopId && selectedStaff && selectedDate) {
        console.log(`Değişiklik algılandı. Zamanlar yeniden getiriliyor: date=${selectedDate}, shopId=${shopId}, staffId=${selectedStaff}`);
        fetchAvailableTimes(selectedDate, shopId, selectedStaff);
    } else if (shopId && !selectedStaff && staffMembers.length > 0) {
        // Personel listesi var ama henüz seçilmemişse (bu durum ilk yüklemede ele alınmış olmalı)
        // Belki bir uyarı gösterilebilir veya ilk personel tekrar seçtirilebilir.
        // Şimdilik, fetchAvailableTimes içindeki kontrol bunu hallediyor (hata mesajı gösteriyor).
        console.log("Personel seçimi bekleniyor.");
        setAvailableTimes([]); // Personel seçimi yoksa zamanları temizle
        setError("Lütfen bir personel seçin.");
    }
    // Bağımlılıklara staffMembers eklemek, staffMembers değiştiğinde de tetiklenmesine neden olur.
    // Bu, fetchStaffMembers'ın sonunda fetchAvailableTimes çağrıldığı için gereksiz bir döngüye neden olabilir.
    // Sadece kullanıcı etkileşimleri (tarih veya personel seçimi) veya shopId değişimi (bu pek olası değil) ile tetiklenmeli.
  }, [selectedDate, selectedStaff, shopId]);

  // Function to handle continue button click
  const handleContinue = () => {
    if (selectedTime && selectedStaff) {
      // Seçilen bilgileri localStorage'a kaydet (context veya state yönetim aracı yoksa)
      localStorage.setItem('selectedTime', selectedTime);
      localStorage.setItem('selectedStaffId', selectedStaff);
      
      router.push("/appointments/new/confirm");
    }
  };

  // Function to handle staff selection
  const handleStaffSelection = (staffId: string) => {
    if (!staffId) {
      console.warn("handleStaffSelection: staffId tanımsız geldi.");
      setSelectedStaff(undefined);
      setAvailableTimes([]);
      setError("Lütfen bir personel seçin.");
      localStorage.removeItem('selectedStaffId'); // Seçimi kaldırınca localStorage'dan da sil
      return;
    }
    console.log(`Personel seçildi: ${staffId}`);
    setSelectedStaff(staffId);
    localStorage.setItem('selectedStaffId', staffId); // Seçimi localStorage'a kaydet
    setAccordionValue("time"); 
    // fetchAvailableTimes çağrısı artık yukarıdaki useEffect tarafından selectedStaff değişince yapılacak.
  };

  // Yükleniyor durumu
  if (loading && staffMembers.length === 0) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Randevu Oluştur</h1>
          <p className="text-muted-foreground">Birkaç adımda kolayca randevu alın</p>
        </div>
        <AppointmentSteps currentStep={2} />
        <div className="flex justify-center items-center h-48">
          <p>Veriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Hata durumu
  if (error && !loading && staffMembers.length === 0) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Randevu Oluştur</h1>
          <p className="text-muted-foreground">Birkaç adımda kolayca randevu alın</p>
        </div>
        <AppointmentSteps currentStep={2} />
        <div className="flex justify-center items-center h-48">
          <p className="text-red-500">Hata: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Randevu Oluştur</h1>
        <p className="text-muted-foreground">Birkaç adımda kolayca randevu alın</p>
        <p className="text-sm text-muted-foreground mt-1">Sistem saati: {formattedTime}</p>
      </div>

      {/* Progress Steps */}
      <AppointmentSteps currentStep={2} />

      <h2 className="text-xl font-bold mb-4">Personel ve Saat Seçin</h2>

      <Card>
        <CardContent className="p-6">
          <Accordion
            type="single"
            collapsible
            value={accordionValue}
            onValueChange={setAccordionValue}
            className="w-full"
          >
            <AccordionItem value="staff">
              <AccordionTrigger className="text-lg font-medium">
                Personel Seçimi
                {selectedStaff && (
                  <Badge variant="outline" className="ml-2">
                    {staffMembers.find((s) => s.id === selectedStaff)?.name}
                  </Badge>
                )}
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-4">
                  <RadioGroup
                    value={selectedStaff}
                    onValueChange={handleStaffSelection}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3"
                  >
                    {staffMembers.map((staff) => (
                      <div key={staff.id} className="relative">
                        <RadioGroupItem
                          value={staff.id}
                          id={`staff-${staff.id}`}
                          disabled={!staff.available}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={`staff-${staff.id}`}
                          className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary ${
                            !staff.available ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                          }`}
                        >
                          <div className="mb-2 rounded-full bg-primary/10 p-2">
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
                              <circle cx="12" cy="8" r="5" />
                              <path d="M20 21a8 8 0 0 0-16 0" />
                            </svg>
                          </div>
                          <div className="text-center">
                            <p className="font-medium">{staff.name}</p>
                            <div className="flex items-center justify-center gap-2 mt-1">
                              <Badge variant={staff.role === "berber" ? "default" : "secondary"}>
                                {staff.role === "berber" ? "Berber" : "Çalışan"}
                              </Badge>
                              {staff.available ? (
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
                                >
                                  Müsait
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800"
                                >
                                  Müsait Değil
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{staff.experience} deneyim</p>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="time">
              <AccordionTrigger className="text-lg font-medium">
                Saat Seçimi
                {selectedTime && (
                  <Badge variant="outline" className="ml-2">
                    {availableTimes.find((t) => t.id === selectedTime)?.time}
                  </Badge>
                )}
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-4">
                  <div className="flex justify-center mb-4 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-100 border border-green-300 dark:bg-green-900 dark:border-green-700 flex items-center justify-center">
                        <Clock className="h-2.5 w-2.5 text-green-700 dark:text-green-300" />
                      </div>
                      <span className="text-sm">Müsait</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-red-100 border border-red-300 dark:bg-red-900 dark:border-red-700 flex items-center justify-center">
                        <X className="h-2.5 w-2.5 text-red-700 dark:text-red-300" />
                      </div>
                      <span className="text-sm">Dolu</span>
                    </div>
                  </div>

                  <RadioGroup
                    value={selectedTime}
                    onValueChange={setSelectedTime}
                    className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3"
                  >
                    {availableTimes.map((slot) => {
                      const isDisabled = !slot.available || !selectedStaff
                      return (
                        <div key={slot.id} className="relative">
                          <RadioGroupItem
                            value={slot.id}
                            id={`time-${slot.id}`}
                            disabled={isDisabled}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={`time-${slot.id}`}
                            className={cn(
                              "flex h-12 items-center justify-center rounded-md border-2 relative",
                              isDisabled
                                ? "cursor-not-allowed"
                                : "cursor-pointer hover:bg-accent hover:text-accent-foreground",
                              slot.available
                                ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800"
                                : "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
                              selectedTime === slot.id && "border-primary"
                            )}
                          >
                            <div className="flex flex-col items-center">
                              <span className="text-sm font-medium">{slot.time}</span>
                              <div className="absolute top-1 right-1">
                                {slot.available ? (
                                  <div className="w-3 h-3 rounded-full bg-green-100 border border-green-300 dark:bg-green-900 dark:border-green-700 flex items-center justify-center">
                                    <Clock className="h-2 w-2 text-green-700 dark:text-green-300" />
                                  </div>
                                ) : (
                                  <div className="w-3 h-3 rounded-full bg-red-100 border border-red-300 dark:bg-red-900 dark:border-red-700 flex items-center justify-center">
                                    <X className="h-2 w-2 text-red-700 dark:text-red-300" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </Label>
                        </div>
                      )
                    })}
                  </RadioGroup>
                  {!selectedStaff && (
                    <p className="text-sm text-muted-foreground mt-4 text-center">Lütfen önce bir personel seçin</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>

        <Separator />

        <CardFooter className="p-6 flex justify-between">
          <Link href="/appointments/new">
            <Button variant="outline" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Geri
            </Button>
          </Link>
          <Button onClick={handleContinue} disabled={!selectedTime || !selectedStaff}>
            Devam Et
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
