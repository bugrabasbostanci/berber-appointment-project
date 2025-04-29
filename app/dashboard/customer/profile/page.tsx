"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"

// Kullanıcı tipi - Prisma şemasına uygun
type User = {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  role: string
}

export default function ProfilePage() {
  const { user, dbUser } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [userData, setUserData] = useState<User | null>(null)
  const settingsTabRef = useRef<HTMLButtonElement>(null)
  const [activeTab, setActiveTab] = useState("info")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const supabase = createClient()

  // Kullanıcı verilerini getir
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) {
        toast({
          title: "Kimlik doğrulama hatası",
          description: "Kullanıcı bilgilerinize erişilemedi",
          variant: "destructive",
        })
        return
      }

      try {
        const response = await fetch(`/api/users/${user.id}`)
        
        if (!response.ok) {
          throw new Error("Kullanıcı verileri getirilemedi")
        }
        
        const data = await response.json()
        setUserData(data)
        
        // Form verilerini başlat
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        })
      } catch (error) {
        console.error("Profil verisi yüklenirken hata:", error)
        toast({
          title: "Bir hata oluştu",
          description: "Profil bilgileriniz yüklenemedi. Lütfen tekrar deneyin.",
          variant: "destructive",
        })
      }
    }

    fetchUserData()
  }, [user, toast])

  // Form değişikliklerini takip et
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }))
  }

  // Form gönderimi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Şifre değişikliği kontrolü
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          toast({
            title: "Şifreler eşleşmiyor",
            description: "Lütfen yeni şifre ve şifre tekrarının aynı olduğundan emin olun",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
        
        if (!formData.currentPassword) {
          toast({
            title: "Mevcut şifre gerekli",
            description: "Şifrenizi değiştirmek için mevcut şifrenizi girmelisiniz",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }

        try {
          // Önce mevcut şifre ile oturum açarak doğrulama yap
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.currentPassword
          })

          if (signInError) {
            toast({
              title: "Mevcut şifre yanlış",
              description: "Girdiğiniz mevcut şifre doğru değil.",
              variant: "destructive",
            })
            setIsLoading(false)
            return
          }
          
          // Şifre değişikliği için Supabase API çağrısı
          const { error: passwordError } = await supabase.auth.updateUser({
            password: formData.newPassword
          })
          
          if (passwordError) {
            throw new Error(`Şifre güncellenirken hata: ${passwordError.message}`)
          }

          toast({
            title: "Şifre güncellendi",
            description: "Şifreniz başarıyla değiştirildi.",
          })
        } catch (passwordUpdateError) {
          console.error("Şifre güncellenirken hata:", passwordUpdateError)
          toast({
            title: "Şifre güncellenemedi",
            description: passwordUpdateError instanceof Error ? passwordUpdateError.message : "Şifre güncellenirken bir hata oluştu.",
            variant: "destructive",
          })
          // Şifre hatasını aldıktan sonra profil güncellemesine devam etmek istiyorsak setIsLoading(false) yapmadan devam ediyoruz
        }
      }

      // Profil güncellemesi (profil bilgileri şifre değişiminden ayrı yapılıyor)
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      }

      const response = await fetch(`/api/users/${user?.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Profil güncellenemedi")
      }

      toast({
        title: "Profil güncellendi",
        description: "Bilgileriniz başarıyla kaydedildi",
      })

      // Güncel verileri yeniden getir
      const updatedUser = await response.json()
      setUserData(updatedUser)
      
      // Şifre alanlarını temizle
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }))
    } catch (error) {
      console.error("Profil güncellenirken hata:", error)
      toast({
        title: "Bir hata oluştu",
        description: error instanceof Error ? error.message : "Profil güncellenemedi. Lütfen tekrar deneyin.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Kullanıcı adının baş harflerini alma
  const getInitials = () => {
    const first = formData.firstName.charAt(0)
    const last = formData.lastName.charAt(0)
    return first && last ? `${first}${last}` : user?.email?.charAt(0).toUpperCase() || "U"
  }

  // Tam ad oluşturma
  const getFullName = () => {
    if (formData.firstName && formData.lastName) {
      return `${formData.firstName} ${formData.lastName}`
    }
    return formData.email || "Kullanıcı"
  }

  // Tab değiştirme fonksiyonu
  const switchToSettings = () => {
    setActiveTab("settings")
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Lütfen giriş yapın</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="info">Kişisel Bilgiler</TabsTrigger>
          <TabsTrigger value="settings">Hesap Ayarları</TabsTrigger>
        </TabsList>
        <TabsContent value="info" className="mt-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder.svg?height=80&width=80" alt={getFullName()} />
                  <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{getFullName()}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">İletişim Bilgileri</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    <span>{formData.email}</span>
                  </div>
                  {formData.phone && (
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-muted-foreground"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <span>{formData.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={switchToSettings}>
                Bilgilerimi Düzenle
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Hesap Ayarları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Ad</Label>
                      <Input 
                        id="firstName" 
                        value={formData.firstName} 
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Soyad</Label>
                      <Input 
                        id="lastName" 
                        value={formData.lastName} 
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta</Label>
                    <Input 
                      id="email" 
                      value={formData.email}
                      disabled={true} // Email değiştirilemez
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input 
                      id="phone" 
                      value={formData.phone} 
                      onChange={handleChange}
                    />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                    <Input 
                      id="currentPassword" 
                      type="password" 
                      value={formData.currentPassword}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Yeni Şifre</Label>
                    <Input 
                      id="newPassword" 
                      type="password"
                      value={formData.newPassword}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      // Form verilerini sıfırla
                      if (userData) {
                        setFormData({
                          firstName: userData.firstName || "",
                          lastName: userData.lastName || "",
                          email: userData.email || "",
                          phone: userData.phone || "",
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: ""
                        })
                      }
                    }}
                  >
                    İptal
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
