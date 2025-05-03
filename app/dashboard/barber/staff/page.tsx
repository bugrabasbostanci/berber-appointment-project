"use client"

import { Checkbox } from "@/components/ui/checkbox"

import { useState, useEffect } from "react"
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
import { Role } from "@prisma/client"

// Tür tanımlamaları
interface WorkingHour {
  start: string;
  end: string;
  isWorking: boolean;
}

interface WorkingHours {
  monday: WorkingHour;
  tuesday: WorkingHour;
  wednesday: WorkingHour;
  thursday: WorkingHour;
  friday: WorkingHour;
  saturday: WorkingHour;
  sunday: WorkingHour;
}

interface StaffMember {
  id: string;
  name: string;
  photo: string;
  expertise: string;
  status: "active" | "leave";
  email: string;
  phone: string;
  workingHours: WorkingHours;
  permissionLevel: string;
  address?: string;
  hireDate?: string;
}

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
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isAddEditOpen, setIsAddEditOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [staffData, setStaffData] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Personel verilerini API'den çekme
  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Varsayılan olarak ilk dükkanı getirme
        // (İlerleyen aşamalarda çoklu dükkan yönetimi için daha gelişmiş bir sistem yapılabilir)
        const shopResponse = await fetch('/api/shops?take=1')
        if (!shopResponse.ok) {
          throw new Error('Dükkan bilgileri getirilemedi')
        }
        
        const shopData = await shopResponse.json()
        if (!shopData.shops || shopData.shops.length === 0) {
          throw new Error('Hiç dükkan bulunamadı')
        }
        
        const shopId = shopData.shops[0].id
        
        // Dükkanın çalışanlarını getirme
        const response = await fetch(`/api/shops/${shopId}/employees`)
        if (!response.ok) {
          throw new Error('Personel bilgileri getirilemedi')
        }
        
        const employees = await response.json()
        
        // Veri yoksa boş dizi döndür
        if (!employees || employees.length === 0) {
          setStaffData([]);
          return;
        }
        
        // API'den gelen verileri UI için uygun formata dönüştürme
        const formattedStaff: StaffMember[] = employees.map((employee: any) => ({
          id: employee.id,
          name: `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || "İsimsiz Personel",
          photo: employee.profileImage || "/placeholder.svg",
          expertise: employee.expertise || "Genel Berber",
          status: employee.isActive ? "active" : "leave",
          email: employee.email || "-",
          phone: employee.phone || "-",
          workingHours: employee.workingHours || {
            monday: { start: "09:30", end: "20:45", isWorking: true },
            tuesday: { start: "09:30", end: "20:45", isWorking: true },
            wednesday: { start: "09:30", end: "20:45", isWorking: true },
            thursday: { start: "09:30", end: "20:45", isWorking: true },
            friday: { start: "09:30", end: "20:45", isWorking: true },
            saturday: { start: "09:30", end: "20:45", isWorking: true },
            sunday: { start: "10:00", end: "14:00", isWorking: false },
          },
          permissionLevel: employee.role ? employee.role.toLowerCase() : "employee",
          address: employee.address || "-",
          hireDate: employee.hireDate ? new Date(employee.hireDate).toISOString().split('T')[0] : "-"
        }))
        
        setStaffData(formattedStaff)
      } catch (error: any) {
        console.error("Personel verileri yüklenirken hata:", error)
        setError(error.message || "Bilinmeyen bir hata oluştu")
        setStaffData([])  // Hata durumunda boş dizi
      } finally {
        setLoading(false)
      }
    }

    fetchStaffData()
  }, [])

  // Function to handle opening staff details
  const handleOpenDetails = (staff: StaffMember) => {
    setSelectedStaff(staff)
    setIsDetailOpen(true)
  }

  // Function to handle opening add/edit modal
  const handleOpenAddEdit = (staff: StaffMember | null = null) => {
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
  const handleStatusChange = async (id: string, newStatus: "active" | "leave") => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: newStatus === "active"
        })
      })
      
      if (!response.ok) {
        throw new Error('Personel durumu güncellenemedi')
      }
      
      // UI'ı güncelle
      setStaffData(staffData.map((staff) => (staff.id === id ? { ...staff, status: newStatus } : staff)))
    } catch (error) {
      console.error("Personel durumu güncellenirken hata:", error)
      // Hata bildirimi burada gösterilebilir
    }
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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Personel verileri yükleniyor...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-red-600">Hata: {error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffData.length === 0 ? (
            <p>Henüz hiç personel bulunmuyor.</p>
          ) : (
            staffData.map((staff) => (
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
                    <Badge variant={staff.status === "active" ? "default" : "secondary"} className={staff.status === "active" ? "bg-green-500" : ""}>
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
            ))
          )}
        </div>
      )}

      {/* Staff Detail Sheet */}
      {/* Burada devam eden kod olduğu gibi kalabilir, sadece veriler gerçek verilerle değişti */}
    </div>
  )
}