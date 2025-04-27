"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export default function EmployeeProfilePage() {
  const [isEditing, setIsEditing] = useState(false)

  // Basitleştirilmiş çalışan verileri
  const [employeeData, setEmployeeData] = useState({
    name: "Mehmet Kaya",
    email: "mehmet.kaya@example.com",
    phone: "+90 555 123 4567",
    position: "Berber",
    experience: "5 yıl",
    bio: "5 yıllık deneyimli berberim. Modern saç kesimi ve sakal tıraşı konusunda uzmanım.",
    skills: ["Saç Kesimi", "Sakal Tıraşı", "Saç Boyama", "Cilt Bakımı"],
  })

  // Form gönderimi
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsEditing(false)
    // Gerçek bir uygulamada, burada verileri sunucuya kaydedersiniz
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 w-full">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/placeholder.svg?height=80&width=80" alt={employeeData.name} />
                <AvatarFallback>
                  {employeeData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{employeeData.name}</CardTitle>
                <CardDescription>{employeeData.position}</CardDescription>
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
                  <Label htmlFor="name">Ad Soyad</Label>
                  <Input
                    id="name"
                    value={employeeData.name}
                    onChange={(e) => setEmployeeData({ ...employeeData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Pozisyon</Label>
                  <Input
                    id="position"
                    value={employeeData.position}
                    onChange={(e) => setEmployeeData({ ...employeeData, position: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    value={employeeData.email}
                    onChange={(e) => setEmployeeData({ ...employeeData, email: e.target.value })}
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
                <Button type="submit">Kaydet</Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium">İletişim Bilgileri</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-muted-foreground">E-posta: {employeeData.email}</p>
                    <p className="text-sm text-muted-foreground">Telefon: {employeeData.phone}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Çalışma Bilgileri</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-muted-foreground">Pozisyon: {employeeData.position}</p>
                    <p className="text-sm text-muted-foreground">Deneyim: {employeeData.experience}</p>
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-medium">Hakkımda</h3>
                <p className="mt-2 text-sm text-muted-foreground">{employeeData.bio}</p>
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
