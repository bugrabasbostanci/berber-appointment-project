"use client"

import { Checkbox } from "@/components/ui/checkbox"

import { useState } from "react"
import Image from "next/image"
import { Calendar, Edit, Mail, Phone, Plus, Trash, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

// Mock data for staff members
const staffMembers = [
  {
    id: 1,
    name: "Ahmet Yılmaz",
    photo: "/diverse-group-city.png",
    expertise: "Saç Kesimi, Sakal Tıraşı",
    status: "active",
    email: "ahmet.yilmaz@example.com",
    phone: "+90 555 123 4567",
    workingHours: {
      monday: { start: "09:00", end: "18:00", isWorking: true },
      tuesday: { start: "09:00", end: "18:00", isWorking: true },
      wednesday: { start: "09:00", end: "18:00", isWorking: true },
      thursday: { start: "09:00", end: "18:00", isWorking: true },
      friday: { start: "09:00", end: "18:00", isWorking: true },
      saturday: { start: "10:00", end: "16:00", isWorking: true },
      sunday: { start: "10:00", end: "14:00", isWorking: false },
    },
    permissionLevel: "admin",
    address: "Kadıköy, İstanbul",
    hireDate: "2020-03-15",
  },
  {
    id: 2,
    name: "Mehmet Kaya",
    photo: "/classic-barbershop.png",
    expertise: "Saç Boyama, Saç Bakımı",
    status: "active",
    email: "mehmet.kaya@example.com",
    phone: "+90 555 234 5678",
    workingHours: {
      monday: { start: "09:00", end: "18:00", isWorking: true },
      tuesday: { start: "09:00", end: "18:00", isWorking: true },
      wednesday: { start: "09:00", end: "18:00", isWorking: true },
      thursday: { start: "09:00", end: "18:00", isWorking: true },
      friday: { start: "09:00", end: "18:00", isWorking: true },
      saturday: { start: "10:00", end: "16:00", isWorking: true },
      sunday: { start: "10:00", end: "14:00", isWorking: false },
    },
    permissionLevel: "staff",
    address: "Beşiktaş, İstanbul",
    hireDate: "2021-05-20",
  },
  {
    id: 3,
    name: "Ayşe Demir",
    photo: "/salon-styling.png",
    expertise: "Saç Kesimi, Fön",
    status: "leave",
    email: "ayse.demir@example.com",
    phone: "+90 555 345 6789",
    workingHours: {
      monday: { start: "12:00", end: "20:00", isWorking: true },
      tuesday: { start: "12:00", end: "20:00", isWorking: true },
      wednesday: { start: "12:00", end: "20:00", isWorking: true },
      thursday: { start: "12:00", end: "20:00", isWorking: true },
      friday: { start: "12:00", end: "20:00", isWorking: true },
      saturday: { start: "10:00", end: "16:00", isWorking: true },
      sunday: { start: "10:00", end: "14:00", isWorking: false },
    },
    permissionLevel: "staff",
    address: "Şişli, İstanbul",
    hireDate: "2022-01-10",
  },
  {
    id: 4,
    name: "Mustafa Öztürk",
    photo: "/creative-hair-design.png",
    expertise: "Sakal Tıraşı, Cilt Bakımı",
    status: "active",
    email: "mustafa.ozturk@example.com",
    phone: "+90 555 456 7890",
    workingHours: {
      monday: { start: "09:00", end: "18:00", isWorking: true },
      tuesday: { start: "09:00", end: "18:00", isWorking: true },
      wednesday: { start: "09:00", end: "18:00", isWorking: true },
      thursday: { start: "09:00", end: "18:00", isWorking: true },
      friday: { start: "09:00", end: "18:00", isWorking: true },
      saturday: { start: "10:00", end: "16:00", isWorking: true },
      sunday: { start: "10:00", end: "14:00", isWorking: false },
    },
    permissionLevel: "staff",
    address: "Bakırköy, İstanbul",
    hireDate: "2021-11-05",
  },
]

// Expertise options
const expertiseOptions = ["Saç Kesimi", "Sakal Tıraşı", "Saç Boyama", "Saç Bakımı", "Fön", "Cilt Bakımı"]

// Days of the week in Turkish
const daysOfWeek = {
  monday: "Pazartesi",
  tuesday: "Salı",
  wednesday: "Çarşamba",
  thursday: "Perşembe",
  friday: "Cuma",
  saturday: "Cumartesi",
  sunday: "Pazar",
}

export default function StaffManagementPage() {
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isAddEditOpen, setIsAddEditOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [staffData, setStaffData] = useState(staffMembers)

  // Function to handle opening staff details
  const handleOpenDetails = (staff) => {
    setSelectedStaff(staff)
    setIsDetailOpen(true)
  }

  // Function to handle opening add/edit modal
  const handleOpenAddEdit = (staff = null) => {
    if (staff) {
      setSelectedStaff(staff)
      setEditMode(true)
    } else {
      setSelectedStaff(null)
      setEditMode(false)
    }
    setIsAddEditOpen(true)
  }

  // Function to handle staff status change
  const handleStatusChange = (id, newStatus) => {
    setStaffData(staffData.map((staff) => (staff.id === id ? { ...staff, status: newStatus } : staff)))
  }

  return (
    <div className="w-full p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Personel Yönetimi</h1>
        <Button onClick={() => handleOpenAddEdit()} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Personel Ekle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staffData.map((staff) => (
          <Card key={staff.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden">
                    <Image src={staff.photo || "/placeholder.svg"} alt={staff.name} fill className="object-cover" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{staff.name}</CardTitle>
                    <CardDescription>{staff.expertise}</CardDescription>
                  </div>
                </div>
                <Badge variant={staff.status === "active" ? "success" : "secondary"}>
                  {staff.status === "active" ? "Aktif" : "İzinli"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{staff.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Phone className="h-4 w-4" />
                <span>{staff.phone}</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <Button variant="outline" size="sm" onClick={() => handleOpenDetails(staff)}>
                Detaylar
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => handleOpenAddEdit(staff)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant={staff.status === "active" ? "destructive" : "outline"}
                  size="icon"
                  onClick={() => handleStatusChange(staff.id, staff.status === "active" ? "leave" : "active")}
                >
                  {staff.status === "active" ? <Trash className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Staff Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Personel Detayları</SheetTitle>
            <SheetDescription>Personel bilgilerini görüntüleyin ve düzenleyin.</SheetDescription>
          </SheetHeader>
          {selectedStaff && (
            <div className="space-y-6 py-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative h-24 w-24 rounded-full overflow-hidden">
                  <Image
                    src={selectedStaff.photo || "/placeholder.svg"}
                    alt={selectedStaff.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold">{selectedStaff.name}</h3>
                  <p className="text-muted-foreground">{selectedStaff.expertise}</p>
                  <Badge variant={selectedStaff.status === "active" ? "success" : "secondary"} className="mt-2">
                    {selectedStaff.status === "active" ? "Aktif" : "İzinli"}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Kişisel Bilgiler</h4>
                <div className="grid grid-cols-[20px_1fr] gap-x-2 gap-y-3 items-center">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedStaff.email}</span>
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedStaff.phone}</span>
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedStaff.address}</span>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>İşe Başlama: {new Date(selectedStaff.hireDate).toLocaleDateString("tr-TR")}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Çalışma Saatleri</h4>
                <div className="space-y-2">
                  {Object.entries(selectedStaff.workingHours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between items-center">
                      <span className="text-sm">{daysOfWeek[day]}</span>
                      {hours.isWorking ? (
                        <span className="text-sm">
                          {hours.start} - {hours.end}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Çalışmıyor</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Kapat
                </Button>
                <Button
                  onClick={() => {
                    setIsDetailOpen(false)
                    handleOpenAddEdit(selectedStaff)
                  }}
                >
                  Düzenle
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Staff Add/Edit Dialog */}
      <Dialog open={isAddEditOpen} onOpenChange={setIsAddEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editMode ? "Personel Düzenle" : "Yeni Personel Ekle"}</DialogTitle>
            <DialogDescription>
              {editMode ? "Personel bilgilerini güncelleyin." : "Yeni personel bilgilerini girin."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="personal">Kişisel Bilgiler</TabsTrigger>
                <TabsTrigger value="expertise">Uzmanlık</TabsTrigger>
                <TabsTrigger value="schedule">Çalışma Saatleri</TabsTrigger>
              </TabsList>
              <TabsContent value="personal" className="space-y-4">
                <div className="flex flex-col items-center gap-4 mb-4">
                  <div className="relative h-24 w-24 rounded-full overflow-hidden bg-muted">
                    <Image
                      src={selectedStaff?.photo || "/placeholder.svg?height=100&width=100&query=person"}
                      alt="Profil Fotoğrafı"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    Fotoğraf Yükle
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Ad Soyad</Label>
                    <Input id="name" defaultValue={selectedStaff?.name || ""} placeholder="Ad Soyad" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta</Label>
                    <Input id="email" type="email" defaultValue={selectedStaff?.email || ""} placeholder="E-posta" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input id="phone" defaultValue={selectedStaff?.phone || ""} placeholder="Telefon" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Adres</Label>
                    <Input id="address" defaultValue={selectedStaff?.address || ""} placeholder="Adres" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="permission">Yetki Seviyesi</Label>
                  <Select defaultValue={selectedStaff?.permissionLevel || "staff"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Yetki seviyesi seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Yönetici</SelectItem>
                      <SelectItem value="manager">Müdür</SelectItem>
                      <SelectItem value="staff">Personel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Durum</Label>
                  <RadioGroup defaultValue={selectedStaff?.status || "active"} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="active" id="active" />
                      <Label htmlFor="active">Aktif</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="leave" id="leave" />
                      <Label htmlFor="leave">İzinli</Label>
                    </div>
                  </RadioGroup>
                </div>
              </TabsContent>
              <TabsContent value="expertise" className="space-y-4">
                <div className="space-y-4">
                  <Label>Uzmanlık Alanları</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {expertiseOptions.map((expertise) => (
                      <div key={expertise} className="flex items-center space-x-2">
                        <Checkbox
                          id={`expertise-${expertise}`}
                          defaultChecked={selectedStaff?.expertise.includes(expertise)}
                        />
                        <Label htmlFor={`expertise-${expertise}`}>{expertise}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="schedule" className="space-y-4">
                <div className="space-y-4">
                  <Label>Çalışma Saatleri</Label>
                  <div className="space-y-4">
                    {Object.entries(daysOfWeek).map(([day, dayName]) => (
                      <div key={day} className="flex items-center gap-4">
                        <div className="w-24">
                          <Label>{dayName}</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch id={`working-${day}`} defaultChecked={selectedStaff?.workingHours[day]?.isWorking} />
                          <Label htmlFor={`working-${day}`} className="sr-only">
                            Çalışıyor
                          </Label>
                        </div>
                        <div className="grid grid-cols-2 gap-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`start-${day}`} className="w-16 text-sm">
                              Başlangıç
                            </Label>
                            <Input
                              id={`start-${day}`}
                              type="time"
                              className="h-8"
                              defaultValue={selectedStaff?.workingHours[day]?.start || "09:00"}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`end-${day}`} className="w-16 text-sm">
                              Bitiş
                            </Label>
                            <Input
                              id={`end-${day}`}
                              type="time"
                              className="h-8"
                              defaultValue={selectedStaff?.workingHours[day]?.end || "18:00"}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEditOpen(false)}>
              İptal
            </Button>
            <Button type="submit" onClick={() => setIsAddEditOpen(false)}>
              {editMode ? "Güncelle" : "Ekle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
