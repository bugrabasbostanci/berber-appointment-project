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
    // localStorage'dan dükkan kimliğini al, yoksa demo için varsayılan değer kullan
    const shopIdFromStorage = localStorage.getItem('selectedShopId');
    const serviceId = localStorage.getItem('selectedServiceId');
    const selectedDate = localStorage.getItem('selectedDate') || new Date().toISOString().split('T')[0];
    
    setSelectedDate(selectedDate);
    
    // shp_001 şeklinde ID kullan - veritabanında oluşturduğumuz ID
    const finalShopId = shopIdFromStorage || "shp_001";
    setShopId(finalShopId);
    
    console.log(`Düzgün ID ile işlemlere başlanıyor: shopId=${finalShopId}, tarih=${selectedDate}`);
    
    // Çalışanları getir
    fetchStaffMembers(finalShopId);
    
    // Müsait zamanları getir
    fetchAvailableTimes(selectedDate, finalShopId);
    
  }, []);

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
  const fetchAvailableTimes = async (date: string, shopId: string) => {
    setLoading(true);
    try {
      // selectedStaff değerini employeeId olarak ekleyelim
      const employeeId = selectedStaff || '';
      
      console.log(`Müsaitlik kontrolü yapılıyor: date=${date}, shopId=${shopId}, employeeId=${employeeId || 'undefined'}`);
      
      // API çağrısı öncesi doğrulama yapalım
      if (employeeId && employeeId.startsWith('default-')) {
        console.log('Varsayılan personel ID kullanılıyor, API çağrısı yapmadan varsayılan zaman dilimlerini döndürüyoruz');
        const defaultTimes = generateDefaultTimeSlots();
        setAvailableTimes(defaultTimes);
        setError(null);
        setLoading(false);
        return;
      }
      
      // 500ms bekleyip API'yi çağıralım
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await fetch(`/api/availability/check?date=${date}&shopId=${shopId}&employeeId=${employeeId}`);
      
      // API yanıtını kontrol et
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Müsait zamanlar getirilemedi');
      }
      
      const data = await response.json();
      
      // API'den dönen veriyi kontrol edelim
      console.log(`API yanıtı:`, data);
      
      // API yanıt formatını kontrol edelim
      if (data.success && Array.isArray(data.availableTimes)) {
        setAvailableTimes(data.availableTimes);
        setError(null);
      } else if (data.error) {
        console.error('API hatası:', data.error);
        // Hata durumunda varsayılan zamanları kullanalım
        setAvailableTimes(generateDefaultTimeSlots());
        setError(`Müsait zamanlar yüklenirken bir hata oluştu: ${data.error}`);
      } else {
        console.warn('API beklenmeyen format döndü:', data);
        // Beklenmeyen yanıt formatı - varsayılan zamanları kullanalım
        setAvailableTimes(generateDefaultTimeSlots());
      }
    } catch (error) {
      console.error('Zaman aralıkları getirme hatası:', error);
      // Hata durumunda varsayılan zamanları kullan
      setAvailableTimes(generateDefaultTimeSlots());
      
      // Kullanıcıya gösterilecek hata mesajı
      setError('Müsait zamanlar yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Varsayılan zaman dilimlerini oluşturmak için yardımcı fonksiyon
  const generateDefaultTimeSlots = () => {
    const defaultTimes = [
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
      "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", 
      "16:00", "16:30", "17:00", "17:30", "18:00", "18:30"
    ];
    
    return defaultTimes.map((time, index) => ({
      id: (index + 1).toString(),
      time,
      available: true
    }));
  };

  // Çalışanları getirmek için
  const fetchStaffMembers = async (shopId: string) => {
    setLoading(true);
    try {
      console.log(`Çalışanlar getiriliyor, Shop ID: ${shopId}`);
      
      // Yeni API çağrısı - Veritabanından gerçek personel verilerini çek
      const endpoint = `/api/staff?shopId=${shopId}`;
      console.log(`API çağrısı: ${endpoint}`);
      
      const response = await fetch(endpoint);
      
      // Yanıt durum kodunu kontrol et
      console.log(`API yanıt durum kodu: ${response.status}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API hata detayları:', errorData);
        throw new Error(`Çalışan bilgileri alınamadı (${response.status}): ${errorData.error || 'Bilinmeyen hata'}`);
      }
      
      const data = await response.json();
      
      // Veri yapısını kontrol et
      console.log(`API yanıtı alındı, eleman sayısı: ${Array.isArray(data) ? data.length : 'veri dizi değil'}`);
      
      // Veri bir dizi değilse veya boşsa
      if (!Array.isArray(data) || data.length === 0) {
        console.log('Veri boş veya dizi değil, varsayılan personel kullanılacak');
        
        // Varsayılan personel oluştur
        const defaultStaff = {
          id: "default-staff",
          name: "Berber Ustası",
          role: "berber",
          available: true,
          experience: "10+ yıl"
        };
        
        setStaffMembers([defaultStaff]);
        setSelectedStaff("default-staff");
        setError(null);
        return;
      }
      
      // API'dan veriler düzgün formatta gelmiyorsa, UI için uygun formata dönüştür
      const formattedData = data.map((employee: any) => ({
        id: employee.id || "default-id-" + Math.random().toString(36).substring(7),
        name: employee.name || 'İsimsiz Çalışan',
        role: employee.role?.toLowerCase() || "employee",
        available: employee.available !== false, // varsayılan olarak true
        experience: employee.experience || "Deneyimli"
      }));
      
      if (formattedData.length === 0) {
        // Çalışan yoksa varsayılan bir çalışan ekleyelim ki UI çalışmaya devam etsin
        const defaultStaff = {
          id: "default-staff",
          name: "Varsayılan Çalışan",
          role: "employee",
          available: true,
          experience: "Deneyimli"
        };
        setStaffMembers([defaultStaff]);
        // Varsayılan çalışanı otomatik olarak seçelim
        setSelectedStaff("default-staff");
      } else {
        console.log(`Personel listesi alındı, toplam personel: ${formattedData.length}`);
        setStaffMembers(formattedData);
        // İlk çalışanı otomatik olarak seçelim
        if (!selectedStaff && formattedData.length > 0) {
          setSelectedStaff(formattedData[0].id);
          console.log(`İlk personel otomatik seçildi: ${formattedData[0].id}`);
        }
      }
      setError(null);
    } catch (error) {
      console.error("Çalışan bilgileri alınamadı:", error);
      // Hata durumunda önceki fallback çözümü kullanıyoruz
      try {
        // Eski API çağrısı - eski yöntem ile personelleri almayı dene
        const oldEndpoint = `/api/shops/${shopId}/employees`;
        console.log(`Yedek API çağrısı deneniyor: ${oldEndpoint}`);
        
        const fallbackResponse = await fetch(oldEndpoint);
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          
          if (Array.isArray(fallbackData) && fallbackData.length > 0) {
            console.log(`Yedek API'den ${fallbackData.length} personel alındı`);
            
            const fallbackFormatted = fallbackData.map((employee: any) => ({
              id: employee.id || "fallback-id-" + Math.random().toString(36).substring(7),
              name: `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'İsimsiz Çalışan',
              role: employee.role?.toLowerCase() || "employee",
              available: true,
              experience: "Deneyimli"
            }));
            
            setStaffMembers(fallbackFormatted);
            if (!selectedStaff && fallbackFormatted.length > 0) {
              setSelectedStaff(fallbackFormatted[0].id);
            }
            setError(null);
            setLoading(false);
            return;
          }
        }
      } catch (fallbackError) {
        console.error("Yedek API çağrısı da başarısız:", fallbackError);
      }
      
      // Hem yeni hem de yedek API başarısız olursa, varsayılan personeller kullan
      const defaultStaff = [{
        id: "default-staff-1",
        name: "Berber Ustası",
        role: "berber",
        available: true,
        experience: "10+ yıl"
      },
      {
        id: "default-staff-2", 
        name: "Çırak",
        role: "employee",
        available: true,
        experience: "1 yıl"
      }];
      
      setStaffMembers(defaultStaff);
      setSelectedStaff(defaultStaff[0].id);
      setError(null);
      console.log("Varsayılan personel listesi kullanılıyor");
    } finally {
      setLoading(false);
    }
  };

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
    console.log(`Personel seçildi, ID: ${staffId}`);
    
    setSelectedStaff(staffId);
    // Automatically open the time selection accordion when staff is selected
    setAccordionValue("time");
    
    try {
      // Personel değiştiğinde mevcut tarih için müsaitlik durumunu güncelle
      if (selectedDate && shopId) {
        // API'de hata almamak için küçük bir gecikme ekleyelim
        setTimeout(() => {
          fetchAvailableTimes(selectedDate, shopId);
        }, 500);
      }
    } catch (error) {
      console.error("Personel seçiminde hata:", error);
      
      // Hata durumunda varsayılan zamanları kullanalım
      const defaultTimes = generateDefaultTimeSlots();
      setAvailableTimes(defaultTimes);
    }
  }

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
