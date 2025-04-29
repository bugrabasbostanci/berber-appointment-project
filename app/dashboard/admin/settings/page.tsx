"use client"

import type React from "react"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SettingsPage() {
  const [saving, setSaving] = useState(false)
  
  // Genel ayarlar
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "The Barber Shop",
    contactEmail: "info@berbershop.com",
    contactPhone: "+90 555 123 4567",
    address: "İstanbul, Kadıköy",
    workingHours: "Pazartesi - Cumartesi: 09:00 - 20:00",
  })

  // Bildirim ayarları
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    appointmentReminders: true,
    marketingEmails: false,
  })
  
  // Rezervasyon ayarları
  const [bookingSettings, setBookingSettings] = useState({
    allowOnlineBooking: true,
    minAdvanceHours: "24",
    maxAdvanceDays: "30",
    timeSlotDuration: "30", // dakika
    appointmentBuffer: "15", // dakika
  })

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setGeneralSettings(prev => ({ ...prev, [name]: value }))
  }

  const handleNotificationSwitchChange = (name: string, checked: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [name]: checked }))
  }
  
  const handleBookingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setBookingSettings(prev => ({ ...prev, [name]: value }))
  }
  
  const handleBookingSwitchChange = (name: string, checked: boolean) => {
    setBookingSettings(prev => ({ ...prev, [name]: checked }))
  }
  
  const handleSelectChange = (name: string, value: string) => {
    setBookingSettings(prev => ({ ...prev, [name]: value }))
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      
      // Gerçek bir veritabanı entegrasyonu olmadığı için 
      // başarılı bir kayıt simüle edelim
      setTimeout(() => {
        setSaving(false)
        toast({
          title: "Ayarlar kaydedildi",
          description: "Sistem ayarları başarıyla güncellendi.",
        })
      }, 1000)
    } catch (error) {
      console.error("Ayarlar kaydedilirken hata:", error)
      toast({
        title: "Hata",
        description: "Ayarlar kaydedilirken bir hata oluştu.",
        variant: "destructive",
      })
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Ayarlar</h1>
        <p className="text-muted-foreground">Sistem ayarlarını yönetin</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">Genel</TabsTrigger>
          <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
          <TabsTrigger value="booking">Rezervasyon</TabsTrigger>
        </TabsList>
        
        {/* Genel Ayarlar Sekmesi */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Genel Ayarlar</CardTitle>
              <CardDescription>Temel sistem ayarlarını yapılandırın</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="siteName">Site Adı</Label>
                <Input id="siteName" name="siteName" value={generalSettings.siteName} onChange={handleGeneralChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactEmail">İletişim E-postası</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={generalSettings.contactEmail}
                  onChange={handleGeneralChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactPhone">İletişim Telefonu</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  value={generalSettings.contactPhone}
                  onChange={handleGeneralChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Adres</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={generalSettings.address}
                  onChange={handleGeneralChange}
                  rows={2}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="workingHours">Çalışma Saatleri</Label>
                <Textarea
                  id="workingHours"
                  name="workingHours"
                  value={generalSettings.workingHours}
                  onChange={handleGeneralChange}
                  rows={2}
                />
              </div>
              <Button className="mt-4" onClick={saveSettings} disabled={saving}>
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Bildirim Ayarları Sekmesi */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Bildirim Ayarları</CardTitle>
              <CardDescription>Sistem bildirim ayarlarını yapılandırın</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications">E-posta Bildirimleri</Label>
                  <p className="text-sm text-muted-foreground">
                    Sistem e-posta bildirimleri gönderebilir
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => handleNotificationSwitchChange("emailNotifications", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="smsNotifications">SMS Bildirimleri</Label>
                  <p className="text-sm text-muted-foreground">
                    Sistem SMS bildirimleri gönderebilir
                  </p>
                </div>
                <Switch
                  id="smsNotifications"
                  checked={notificationSettings.smsNotifications}
                  onCheckedChange={(checked) => handleNotificationSwitchChange("smsNotifications", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="appointmentReminders">Randevu Hatırlatmaları</Label>
                  <p className="text-sm text-muted-foreground">
                    Yaklaşan randevular için otomatik hatırlatmalar gönder
                  </p>
                </div>
                <Switch
                  id="appointmentReminders"
                  checked={notificationSettings.appointmentReminders}
                  onCheckedChange={(checked) => handleNotificationSwitchChange("appointmentReminders", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="marketingEmails">Pazarlama E-postaları</Label>
                  <p className="text-sm text-muted-foreground">
                    Müşterilere kampanya ve promosyon e-postaları gönder
                  </p>
                </div>
                <Switch
                  id="marketingEmails"
                  checked={notificationSettings.marketingEmails}
                  onCheckedChange={(checked) => handleNotificationSwitchChange("marketingEmails", checked)}
                />
              </div>
              <Button className="mt-4" onClick={saveSettings} disabled={saving}>
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Rezervasyon Ayarları Sekmesi */}
        <TabsContent value="booking">
          <Card>
            <CardHeader>
              <CardTitle>Rezervasyon Ayarları</CardTitle>
              <CardDescription>Randevu ve rezervasyon ayarlarını yapılandırın</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowOnlineBooking">Online Rezervasyon</Label>
                  <p className="text-sm text-muted-foreground">
                    Müşterilerin online randevu almasına izin ver
                  </p>
                </div>
                <Switch
                  id="allowOnlineBooking"
                  checked={bookingSettings.allowOnlineBooking}
                  onCheckedChange={(checked) => handleBookingSwitchChange("allowOnlineBooking", checked)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="minAdvanceHours">Minimum Randevu Süresi (saat)</Label>
                <Input
                  id="minAdvanceHours"
                  name="minAdvanceHours"
                  type="number"
                  value={bookingSettings.minAdvanceHours}
                  onChange={handleBookingChange}
                />
                <p className="text-xs text-muted-foreground">
                  Müşteriler randevuyu en az kaç saat öncesinden alabilir
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="maxAdvanceDays">Maksimum Randevu Süresi (gün)</Label>
                <Input
                  id="maxAdvanceDays"
                  name="maxAdvanceDays"
                  type="number"
                  value={bookingSettings.maxAdvanceDays}
                  onChange={handleBookingChange}
                />
                <p className="text-xs text-muted-foreground">
                  Müşteriler randevuyu en fazla kaç gün sonrası için alabilir
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="timeSlotDuration">Randevu Süresi (dakika)</Label>
                <Select 
                  value={bookingSettings.timeSlotDuration} 
                  onValueChange={(value) => handleSelectChange("timeSlotDuration", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Randevu süresi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 dakika</SelectItem>
                    <SelectItem value="30">30 dakika</SelectItem>
                    <SelectItem value="45">45 dakika</SelectItem>
                    <SelectItem value="60">60 dakika</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="appointmentBuffer">Randevular Arası Süre (dakika)</Label>
                <Select 
                  value={bookingSettings.appointmentBuffer} 
                  onValueChange={(value) => handleSelectChange("appointmentBuffer", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tampon süreyi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 dakika</SelectItem>
                    <SelectItem value="5">5 dakika</SelectItem>
                    <SelectItem value="10">10 dakika</SelectItem>
                    <SelectItem value="15">15 dakika</SelectItem>
                    <SelectItem value="30">30 dakika</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Randevular arasında bırakılacak hazırlık süresi
                </p>
              </div>
              
              <Button className="mt-4" onClick={saveSettings} disabled={saving}>
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
