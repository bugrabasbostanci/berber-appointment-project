"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import useUserStore from "@/app/stores/userStore"
import { useToast } from "@/components/ui/use-toast"

export default function EmployeeProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const userStore = useUserStore()
  const { toast } = useToast()

  // Kullanıcı verileri için state
  const [employeeData, setEmployeeData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    position: "EMPLOYEE",
    experience: "",
    skills: ["Saç Kesimi", "Sakal Tıraşı", "Saç Boyama", "Cilt Bakımı"],
  })

  // Sayfa yüklendiğinde kullanıcı verilerini getir
  useEffect(() => {
    if (userStore.dbUser) {
      setEmployeeData({
        firstName: userStore.dbUser.firstName || "",
        lastName: userStore.dbUser.lastName || "",
        email: userStore.dbUser.email || "",
        phone: userStore.dbUser.phone || "",
        bio: "", // API'dan alınabilir
        position: userStore.dbUser.role || "EMPLOYEE",
        experience: "", // API'dan alınabilir
        skills: ["Saç Kesimi", "Sakal Tıraşı", "Saç Boyama", "Cilt Bakımı"], // API'dan alınabilir
      });
    } else {
      fetchProfileData();
    }
  }, [userStore.dbUser]);

  // Profil verilerini getirmek için
  const fetchProfileData = async () => {
    if (!userStore.authUser?.id) return;
    
    try {
      const response = await fetch(`/api/users/${userStore.authUser.id}`);
      
      if (!response.ok) {
        throw new Error('Profil bilgileri alınamadı');
      }
      
      const data = await response.json();
      
      // Zustand store'a kullanıcı verilerini ekle
      userStore.setDbUser(data);
      
      // Yerel state'i güncelle
      setEmployeeData({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        phone: data.phone || "",
        bio: data.bio || "",
        position: data.role || "EMPLOYEE",
        experience: data.experience || "",
        skills: data.skills || ["Saç Kesimi", "Sakal Tıraşı", "Saç Boyama", "Cilt Bakımı"],
      });
    } catch (error) {
      console.error("Profil bilgileri alınamadı:", error);
      toast({
        title: "Hata",
        description: "Profil bilgileri yüklenirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  // Form gönderimi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userStore.authUser?.id) {
      console.error("Kullanıcı kimliği bulunamadı");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/users/${userStore.authUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: employeeData.firstName,
          lastName: employeeData.lastName,
          phone: employeeData.phone,
        })
      });
      
      if (!response.ok) {
        throw new Error('Profil güncellenirken bir hata oluştu');
      }
      
      const updatedUser = await response.json();
      
      // Zustand store'u güncelle
      userStore.setDbUser({
        ...userStore.dbUser!,
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        phone: employeeData.phone,
      });
      
      setIsEditing(false);
      
      toast({
        title: "Başarılı",
        description: "Profil bilgileriniz güncellendi",
      });
    } catch (error) {
      console.error("Profil güncellenemedi:", error);
      toast({
        title: "Hata",
        description: "Profil güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFullName = () => {
    return userStore.getFullName() || 'Çalışan';
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 w-full">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={userStore.getProfileImage() || ""} alt={getFullName()} />
                <AvatarFallback>
                  {userStore.getInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{getFullName()}</CardTitle>
                <CardDescription>{employeeData.position === "EMPLOYEE" ? "Çalışan" : employeeData.position}</CardDescription>
              </div>
            </div>
            <Button onClick={() => setIsEditing(!isEditing)}>{isEditing ? "İptal" : "Profili Düzenle"}</Button>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Ad</Label>
                  <Input
                    id="firstName"
                    value={employeeData.firstName}
                    onChange={(e) => setEmployeeData({ ...employeeData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Soyad</Label>
                  <Input
                    id="lastName"
                    value={employeeData.lastName}
                    onChange={(e) => setEmployeeData({ ...employeeData, lastName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    value={employeeData.email}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={employeeData.phone}
                    onChange={(e) => setEmployeeData({ ...employeeData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Hakkımda</Label>
                  <Input
                    id="bio"
                    value={employeeData.bio}
                    onChange={(e) => setEmployeeData({ ...employeeData, bio: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="experience">Deneyim</Label>
                  <Input
                    id="experience"
                    value={employeeData.experience}
                    onChange={(e) => setEmployeeData({ ...employeeData, experience: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  İptal
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Kaydediliyor..." : "Kaydet"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium">İletişim Bilgileri</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-muted-foreground">E-posta: {employeeData.email}</p>
                    <p className="text-sm text-muted-foreground">Telefon: {employeeData.phone || "Belirtilmemiş"}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Çalışma Bilgileri</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-muted-foreground">Pozisyon: {employeeData.position === "EMPLOYEE" ? "Çalışan" : employeeData.position}</p>
                    <p className="text-sm text-muted-foreground">Deneyim: {employeeData.experience || "Belirtilmemiş"}</p>
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-medium">Hakkımda</h3>
                <p className="mt-2 text-sm text-muted-foreground">{employeeData.bio || "Henüz bilgi girilmemiş."}</p>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-medium">Uzmanlık Alanları</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {employeeData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
