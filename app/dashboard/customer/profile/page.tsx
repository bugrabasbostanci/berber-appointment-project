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
import { createClient } from "@/lib/supabase/client"
import useUserStore from "@/app/stores/userStore"

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
  const { 
    authUser, 
    dbUser, 
    getFullName, 
    getInitials, 
    setDbUser, 
    getProfileImage,
    isGoogleUser,
    getGoogleData 
  } = useUserStore()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
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
    if (!authUser?.id) {
      toast({
        title: "Kimlik doğrulama hatası",
        description: "Kullanıcı bilgilerinize erişilemedi",
        variant: "destructive",
      })
      return
    }

    // Form verilerini dbUser ile başlat
    if (dbUser) {
      setFormData({
        firstName: dbUser.firstName || "",
        lastName: dbUser.lastName || "",
        email: dbUser.email || "",
        phone: dbUser.phone || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
    } else {
      // dbUser yoksa API'dan getir
      const fetchUserData = async () => {
        try {
          const response = await fetch(`/api/users/${authUser.id}`)
          
          if (!response.ok) {
            throw new Error("Kullanıcı verileri getirilemedi")
          }
          
          const data = await response.json()
          
          // Zustand store'a ekle
          setDbUser(data)
          
          // Form verilerini güncelle
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
    }
  }, [authUser, dbUser, toast, setDbUser])

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

      const response = await fetch(`/api/users/${authUser?.id}`, {
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

      // Güncel verileri yeniden getir
      const updatedUser = await response.json()
      
      // Zustand store'u güncelle
      if (dbUser) {
        setDbUser({
          ...dbUser,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone
        })
      }

      toast({
        title: "Profil güncellendi",
        description: "Bilgileriniz başarıyla kaydedildi",
      })
      
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

  // Tab değiştirme fonksiyonu
  const switchToSettings = () => {
    setActiveTab("settings")
  }

  // Profil resmi URL'ini al
  const profileImageUrl = getProfileImage();
  
  // Google kullanıcısı mı kontrol et
  const isGoogle = isGoogleUser();
  
  // Google meta verilerini al
  const googleData = getGoogleData();
  
  // Debug için
  console.log('Profil Sayfası Debug:', {
    dbUser,
    isGoogle,
    googleData,
    fullName: getFullName(),
    hasGoogleData: !!googleData,
    email: dbUser?.email
  });
  
  if (!authUser) {
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
                  <AvatarImage src={profileImageUrl || "/placeholder.svg?height=80&width=80"} alt={getFullName()} />
                  <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{getFullName()}</CardTitle>
                  
                  {/* Google meta verilerinden isim ve soyisim bilgilerini göster */}
                  {isGoogle && (
                    <div className="text-sm text-muted-foreground mt-2">
                      <p className="mb-1">
                        <span className="font-medium">Google hesabı ile giriş yapıldı</span>
                      </p>
                      {googleData && googleData.given_name && (
                        <p className="mb-1">
                          <span className="font-medium">Ad:</span> {googleData.given_name}
                        </p>
                      )}
                      {googleData && googleData.family_name && (
                        <p className="mb-1">
                          <span className="font-medium">Soyad:</span> {googleData.family_name}
                        </p>
                      )}
                      {googleData && googleData.email && (
                        <p className="mb-1">
                          <span className="font-medium">E-posta:</span> {googleData.email}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {isGoogle && (
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="16" height="16">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                      </svg>
                      Google hesabınızla giriş yaptınız
                    </p>
                  )}
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

              {/* Google kullanıcısı için bilgi */}
              {isGoogle && googleData && (
                <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-100">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Google hesabınızdan alınan bilgiler</h4>
                  <p className="text-sm text-blue-700">Google hesabınız ile giriş yaptığınız için profil bilgileriniz Google'dan otomatik olarak alınmıştır.</p>
                  
                  {googleData.locale && (
                    <p className="text-xs text-blue-600 mt-2">
                      <span className="font-medium">Dil/Bölge:</span> {googleData.locale}
                    </p>
                  )}
                </div>
              )}
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
              {isGoogle && googleData && (
                <div className="text-sm text-muted-foreground mt-2 space-y-1">
                  <p className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="14" height="14">
                      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                    </svg>
                    Google hesabınızla bağlantılı olarak giriş yaptınız
                  </p>
                  {googleData.email && (
                    <p>
                      E-posta: <span className="font-medium">{googleData.email}</span>
                    </p>
                  )}
                  {googleData.given_name && (
                    <p>
                      Ad: <span className="font-medium">{googleData.given_name}</span>
                    </p>
                  )}
                  {!googleData.given_name && (
                    <p>
                      Ad: <span className="font-medium">Belirtilmemiş</span>
                    </p>
                  )}
                  {googleData.family_name && (
                    <p>
                      Soyad: <span className="font-medium">{googleData.family_name}</span>
                    </p>
                  )}
                  {!googleData.family_name && (
                    <p>
                      Soyad: <span className="font-medium">Belirtilmemiş</span>
                    </p>
                  )}
                  {googleData.email_verified && (
                    <p className="text-green-600">
                      <span className="font-medium">✓</span> E-posta doğrulanmış
                    </p>
                  )}
                </div>
              )}
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
                      // Form verilerini dbUser ile sıfırla
                      if (dbUser) {
                        setFormData({
                          firstName: dbUser.firstName || "",
                          lastName: dbUser.lastName || "",
                          email: dbUser.email || "",
                          phone: dbUser.phone || "",
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
