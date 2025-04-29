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
      const response = await fetch(`/api/availability/check?date=${date}&shopId=${shopId}`);
      
      if (!response.ok) {
        throw new Error('Müsaitlik bilgileri alınamadı');
      }
      
      const data = await response.json();
      setAvailableTimes(data.availableTimes);
    } catch (error) {
      console.error("Müsaitlik bilgileri alınamadı:", error);
      setError("Müsaitlik bilgileri yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Çalışanları getirmek için
  const fetchStaffMembers = async (shopId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/shops/${shopId}/employees`);
      
      if (!response.ok) {
        throw new Error('Çalışan bilgileri alınamadı');
      }
      
      const data = await response.json();
      setStaffMembers(data);
    } catch (error) {
      console.error("Çalışan bilgileri alınamadı:", error);
      setError("Çalışan bilgileri yüklenirken bir hata oluştu.");
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
    setSelectedStaff(staffId)
    // Automatically open the time selection accordion when staff is selected
    setAccordionValue("time")
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
                              "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-foreground peer-data-[state=checked]:text-background [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-foreground [&:has([data-state=checked])]:text-background",
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
