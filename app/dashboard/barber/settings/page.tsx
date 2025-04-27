"use client"

import { useState } from "react"
import { CalendarIcon, Clock, Loader2, Save, X } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SettingsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("hours")
  const [saving, setSaving] = useState<string | null>(null)

  const handleSave = (section: string) => {
    setSaving(section)
    setTimeout(() => {
      setSaving(null)
      toast({
        title: "Ayarlar kaydedildi",
        description: "Değişiklikleriniz başarıyla kaydedildi.",
      })
    }, 1000)
  }

  return (
    <div className="w-full p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Ayarlar</h1>
        <p className="text-muted-foreground">Salon ayarlarınızı buradan yönetebilirsiniz.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hours">Çalışma Saatleri</TabsTrigger>
          <TabsTrigger value="closures">Kapalı Günler</TabsTrigger>
          <TabsTrigger value="blocked-hours">Bloke Saatler</TabsTrigger>
        </TabsList>

        <TabsContent value="hours" className="space-y-4">
          <WorkingHoursSettings onSave={() => handleSave("hours")} saving={saving === "hours"} />
        </TabsContent>

        <TabsContent value="closures" className="space-y-4">
          <ClosureDaysSettings onSave={() => handleSave("closures")} saving={saving === "closures"} />
        </TabsContent>

        <TabsContent value="blocked-hours" className="space-y-4">
          <BlockedHoursSettings onSave={() => handleSave("blocked-hours")} saving={saving === "blocked-hours"} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Working Hours Settings Component
function WorkingHoursSettings({ onSave, saving }: { onSave: () => void; saving: boolean }) {
  const days = [
    { id: "monday", name: "Pazartesi" },
    { id: "tuesday", name: "Salı" },
    { id: "wednesday", name: "Çarşamba" },
    { id: "thursday", name: "Perşembe" },
    { id: "friday", name: "Cuma" },
    { id: "saturday", name: "Cumartesi" },
    { id: "sunday", name: "Pazar" },
  ]

  const [workingHours, setWorkingHours] = useState(
    days.map((day) => ({
      day: day.id,
      name: day.name,
      isOpen: day.id !== "sunday",
      openTime: "09:00",
      closeTime: "19:00",
    })),
  )

  const handleDayToggle = (dayId: string) => {
    setWorkingHours(workingHours.map((day) => (day.day === dayId ? { ...day, isOpen: !day.isOpen } : day)))
  }

  const handleTimeChange = (dayId: string, field: "openTime" | "closeTime", value: string) => {
    setWorkingHours(workingHours.map((day) => (day.day === dayId ? { ...day, [field]: value } : day)))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Çalışma Saatleri</CardTitle>
        <CardDescription>Salonunuzun normal çalışma saatlerini buradan düzenleyebilirsiniz.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {workingHours.map((day) => (
            <div key={day.day} className="flex items-center space-x-4">
              <div className="w-1/3 md:w-1/4">
                <div className="flex items-center space-x-2">
                  <Switch id={`day-${day.day}`} checked={day.isOpen} onCheckedChange={() => handleDayToggle(day.day)} />
                  <Label htmlFor={`day-${day.day}`} className="font-medium">
                    {day.name}
                  </Label>
                </div>
              </div>
              {day.isOpen ? (
                <div className="flex flex-1 items-center space-x-2">
                  <div className="grid gap-1 flex-1">
                    <Label htmlFor={`open-${day.day}`} className="text-xs">
                      Açılış
                    </Label>
                    <Input
                      id={`open-${day.day}`}
                      type="time"
                      value={day.openTime}
                      onChange={(e) => handleTimeChange(day.day, "openTime", e.target.value)}
                      className="[&::-webkit-calendar-picker-indicator]:appearance-none [&::-webkit-time-picker-indicator]:appearance-none"
                    />
                  </div>
                  <div className="grid gap-1 flex-1">
                    <Label htmlFor={`close-${day.day}`} className="text-xs">
                      Kapanış
                    </Label>
                    <Input
                      id={`close-${day.day}`}
                      type="time"
                      value={day.closeTime}
                      onChange={(e) => handleTimeChange(day.day, "closeTime", e.target.value)}
                      className="[&::-webkit-calendar-picker-indicator]:appearance-none [&::-webkit-time-picker-indicator]:appearance-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 text-muted-foreground italic">Kapalı</div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button onClick={onSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Değişiklikleri Kaydet
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Closure Days Settings Component
function ClosureDaysSettings({ onSave, saving }: { onSave: () => void; saving: boolean }) {
  const [date, setDate] = useState<Date>()
  const [closureDays, setClosureDays] = useState([
    { id: "1", date: new Date(2023, 11, 31), description: "Yılbaşı" },
    { id: "2", date: new Date(2024, 3, 23), description: "Ulusal Egemenlik ve Çocuk Bayramı" },
    { id: "3", date: new Date(2024, 4, 1), description: "İşçi Bayramı" },
  ])
  const [description, setDescription] = useState("")
  const [selectedDates, setSelectedDates] = useState<Date[]>(closureDays.map((h) => h.date))

  const addClosureDay = () => {
    if (date) {
      const newClosureDay = {
        id: Date.now().toString(),
        date: date,
        description: description || "Kapalı",
      }
      setClosureDays([...closureDays, newClosureDay])
      setSelectedDates([...selectedDates, date])
      setDate(undefined)
      setDescription("")
    }
  }

  const removeClosureDay = (id: string) => {
    const closureDayToRemove = closureDays.find((h) => h.id === id)
    setClosureDays(closureDays.filter((day) => day.id !== id))
    if (closureDayToRemove) {
      setSelectedDates(selectedDates.filter((d) => d.getTime() !== closureDayToRemove.date.getTime()))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kapalı Günler</CardTitle>
        <CardDescription>Salonunuzun özel kapalı günlerini buradan yönetebilirsiniz.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2 space-y-4">
            <div className="grid gap-2">
              <Label>Kapalı Gün Ekle</Label>
              <div className="flex flex-col space-y-2">
                <div className="grid gap-2">
                  <Label htmlFor="closure-date">Tarih</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP", { locale: tr }) : "Tarih seçin"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        disabled={(date) =>
                          selectedDates.some(
                            (selectedDate) =>
                              selectedDate.getDate() === date.getDate() &&
                              selectedDate.getMonth() === date.getMonth() &&
                              selectedDate.getFullYear() === date.getFullYear(),
                          )
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="closure-description">Açıklama (İsteğe bağlı)</Label>
                  <Input
                    id="closure-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Örn: Bayram, Özel gün, vb."
                  />
                </div>

                <Button onClick={addClosureDay} disabled={!date} className="w-full">
                  Kapalı Gün Ekle
                </Button>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 space-y-4">
            <div className="grid gap-2">
              <Label>Kapalı Günler Listesi</Label>
              <div className="border rounded-md">
                <ScrollArea className="h-[300px]">
                  {closureDays.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">Henüz kapalı gün eklenmemiş.</div>
                  ) : (
                    <div className="space-y-2 p-4">
                      {closureDays.map((day) => (
                        <div key={day.id} className="flex items-center justify-between rounded-md border p-3">
                          <div className="space-y-1">
                            <p className="font-medium">{format(day.date, "PPP", { locale: tr })}</p>
                            {day.description && <p className="text-sm text-muted-foreground">{day.description}</p>}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeClosureDay(day.id)}
                            className="h-8 w-8 text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Değişiklikleri Kaydet
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Blocked Hours Settings Component
function BlockedHoursSettings({ onSave, saving }: { onSave: () => void; saving: boolean }) {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [startTime, setStartTime] = useState<string>("")
  const [endTime, setEndTime] = useState<string>("")
  const [reason, setReason] = useState<string>("")
  const [repeatOption, setRepeatOption] = useState<string>("once")

  const [blockedHours, setBlockedHours] = useState([
    {
      id: "1",
      date: new Date(2024, 5, 15),
      startTime: "12:00",
      endTime: "13:00",
      reason: "Öğle Molası",
      repeat: "daily",
    },
    {
      id: "2",
      date: new Date(2024, 5, 20),
      startTime: "15:00",
      endTime: "16:30",
      reason: "Doktor Randevusu",
      repeat: "once",
    },
  ])

  const addBlockedHour = () => {
    if (selectedDate && startTime && endTime) {
      const newBlockedHour = {
        id: Date.now().toString(),
        date: selectedDate,
        startTime,
        endTime,
        reason: reason || "Randevuya Kapalı",
        repeat: repeatOption,
      }
      setBlockedHours([...blockedHours, newBlockedHour])
      resetForm()
    }
  }

  const resetForm = () => {
    setSelectedDate(undefined)
    setStartTime("")
    setEndTime("")
    setReason("")
    setRepeatOption("once")
  }

  const removeBlockedHour = (id: string) => {
    setBlockedHours(blockedHours.filter((hour) => hour.id !== id))
  }

  const getRepeatText = (repeat: string) => {
    switch (repeat) {
      case "once":
        return "Bir kez"
      case "daily":
        return "Her gün"
      case "weekly":
        return "Her hafta"
      case "monthly":
        return "Her ay"
      default:
        return repeat
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bloke Saatler</CardTitle>
        <CardDescription>
          Belirli saatleri randevuya kapatabilirsiniz. Örneğin: öğle molası, toplantı, kişisel işler vb.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2 space-y-4">
            <div className="grid gap-2">
              <Label>Bloke Saat Ekle</Label>
              <div className="flex flex-col space-y-3">
                <div className="grid gap-2">
                  <Label htmlFor="blocked-date">Tarih</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP", { locale: tr }) : "Tarih seçin"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="start-time">Başlangıç Saati</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="start-time"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="end-time">Bitiş Saati</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="end-time"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="reason">Neden (İsteğe bağlı)</Label>
                  <Input
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Örn: Öğle molası, Toplantı, vb."
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="repeat">Tekrar</Label>
                  <Select value={repeatOption} onValueChange={setRepeatOption}>
                    <SelectTrigger id="repeat">
                      <SelectValue placeholder="Tekrar seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Bir kez</SelectItem>
                      <SelectItem value="daily">Her gün</SelectItem>
                      <SelectItem value="weekly">Her hafta</SelectItem>
                      <SelectItem value="monthly">Her ay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={addBlockedHour}
                  disabled={!selectedDate || !startTime || !endTime}
                  className="w-full mt-2"
                >
                  Bloke Saat Ekle
                </Button>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 space-y-4">
            <div className="grid gap-2">
              <Label>Bloke Saatler Listesi</Label>
              <div className="border rounded-md">
                <ScrollArea className="h-[400px]">
                  {blockedHours.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">Henüz bloke saat eklenmemiş.</div>
                  ) : (
                    <div className="space-y-2 p-4">
                      {blockedHours.map((hour) => (
                        <div key={hour.id} className="flex items-center justify-between rounded-md border p-3">
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                              <p className="font-medium">{format(hour.date, "PPP", { locale: tr })}</p>
                            </div>
                            <div className="flex items-center">
                              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                              <p className="text-sm">
                                {hour.startTime} - {hour.endTime}
                              </p>
                            </div>
                            {hour.reason && <p className="text-sm text-muted-foreground">{hour.reason}</p>}
                            <div className="flex items-center mt-1">
                              <span className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full">
                                {getRepeatText(hour.repeat)}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeBlockedHour(hour.id)}
                            className="h-8 w-8 text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Değişiklikleri Kaydet
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
