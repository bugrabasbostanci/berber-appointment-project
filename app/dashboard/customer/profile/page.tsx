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
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react"; // Loader ikonu için

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
  const [isDeleting, setIsDeleting] = useState(false); // Silme işlemi yüklenme durumu
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // Silme onay diyaloğu durumu
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

  // Kullanıcı verilerini getir ve Google verileriyle birleştir/kaydet
  useEffect(() => {
    if (!authUser?.id) {
      toast({
        title: "Kimlik doğrulama hatası",
        description: "Kullanıcı bilgilerinize erişilemedi",
        variant: "destructive",
      })
      return
    }

    const initializeProfileData = async () => {
      try {
        let currentFormData = { ...formData }; // Mevcut formData'yı kopyala
        let userToStore = dbUser;
        let shouldUpdateDb = false;
        const updatesForDb: Partial<User> = {};

        // Eğer dbUser zaten varsa formData'yı onunla doldur
        if (userToStore) {
          currentFormData = {
            ...currentFormData,
            firstName: userToStore.firstName || "",
            lastName: userToStore.lastName || "",
            email: userToStore.email || "",
            phone: userToStore.phone || "",
          };
        } else {
          try {
            console.log("Veritabanından kullanıcı verisi çekiliyor...");
            const response = await fetch(`/api/users/${authUser.id}`);
            if (!response.ok) throw new Error("Kullanıcı verileri DB'den getirilemedi");
            userToStore = await response.json();
            if (userToStore) {
              setDbUser(userToStore); // Store'u hemen güncelle
              console.log("Veritabanından kullanıcı verisi çekildi:", userToStore);

              currentFormData = {
                ...currentFormData,
                firstName: userToStore?.firstName || "",
                lastName: userToStore?.lastName || "",
                email: userToStore?.email || "",
                phone: userToStore?.phone || "",
              };
            } else {
              console.error("Veritabanından kullanıcı verisi çekildi fakat boş geldi.");
            }
          } catch (error) {
            console.error("DB profil verisi yüklenirken hata:", error);
          }
        }

        // Google kullanıcısı bilgileri kontrol ediliyor
        const isGoogle = isGoogleUser();
      
        // Sadece Google kullanıcıları için Google verilerini kontrol et
        if (isGoogle) {
          const googleData = getGoogleData();
          if (googleData) {
            console.log("Google kullanıcısı, googleData:", googleData);
            if (!currentFormData.firstName && googleData.given_name) {
              currentFormData.firstName = googleData.given_name;
              updatesForDb.firstName = googleData.given_name;
              shouldUpdateDb = true;
              console.log("Google'dan ad alındı:", googleData.given_name);
            }
            if (!currentFormData.lastName && googleData.family_name) {
              currentFormData.lastName = googleData.family_name;
              updatesForDb.lastName = googleData.family_name;
              shouldUpdateDb = true;
              console.log("Google'dan soyad alındı:", googleData.family_name);
            }
          } else {
            console.log("Google kullanıcısı fakat Google verileri bulunamadı.");
          }
        }
        
        setFormData(currentFormData); // Formu son haliyle güncelle

        // Eğer Google'dan alınan bilgilerle DB güncellenmesi gerekiyorsa yap
        if (isGoogle && shouldUpdateDb && Object.keys(updatesForDb).length > 0) {
          console.log("Google verileriyle DB güncelleniyor:", updatesForDb);
          try {
            const patchResponse = await fetch(`/api/users/${authUser.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updatesForDb),
            });
            if (!patchResponse.ok) throw new Error("Google verileri DB'ye kaydedilemedi");
            const updatedUserFromDb = await patchResponse.json();
            setDbUser(updatedUserFromDb); // Store'u DB'den gelen son veriyle tekrar güncelle
            console.log("Google verileri DB'ye kaydedildi, güncel kullanıcı:", updatedUserFromDb);
            toast({
              title: "Profil bilgileri Google ile senkronize edildi",
              description: "Adınız ve soyadınız Google hesabınızdan alındı.",
            });
          } catch (error) {
            console.error("Google verilerini DB'ye kaydederken hata:", error);
            toast({
              title: "Google Senkronizasyon Hatası",
              description: "Google bilgileriniz kaydedilirken bir sorun oluştu.",
              variant: "destructive",
            });
          }
        }
      } catch (generalError) {
        console.error("Profil verisi yüklenirken genel hata:", generalError);
        toast({
          title: "Profil yüklenemedi",
          description: "Profil bilgileriniz yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.",
          variant: "destructive",
        });
      }
    };

    initializeProfileData();
  }, [authUser, dbUser, formData, setDbUser, isGoogleUser, getGoogleData, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const isGoogle = isGoogleUser();

    try {
      // Şifre Değişikliği (Sadece Google dışı kullanıcılar için)
      if (!isGoogle && formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          toast({
            title: "Şifreler eşleşmiyor",
            description: "Lütfen yeni şifre ve şifre tekrarının aynı olduğundan emin olun",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        if (!formData.currentPassword) {
          toast({
            title: "Mevcut şifre gerekli",
            description: "Şifrenizi değiştirmek için mevcut şifrenizi girmelisiniz",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        // Supabase şifre doğrulama ve güncelleme (try-catch içinde)
        try {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.currentPassword,
          });
          if (signInError) throw new Error("Girdiğiniz mevcut şifre doğru değil.");

          const { error: passwordError } = await supabase.auth.updateUser({
            password: formData.newPassword,
          });
          if (passwordError) throw new Error(`Şifre güncellenirken hata: ${passwordError.message}`);
          
          toast({ title: "Şifre güncellendi", description: "Şifreniz başarıyla değiştirildi." });
          setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
        } catch (passwordUpdateError) {
          console.error("Şifre güncellenirken hata:", passwordUpdateError);
          toast({
            title: "Şifre güncellenemedi",
            description: passwordUpdateError instanceof Error ? passwordUpdateError.message : "Bir hata oluştu.",
            variant: "destructive",
          });
          // Şifre hatası durumunda profil güncellemesine devam etme, işlemi durdur.
          setIsLoading(false);
          return; 
        }
      }

      // Profil Bilgileri Güncelleme (Ad, Soyad, Telefon - tüm kullanıcılar için)
      const profileUpdateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      };

      console.log("Profil güncelleniyor, gönderilen veri:", profileUpdateData);
      const response = await fetch(`/api/users/${authUser?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileUpdateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Profil güncellenemedi");
      }

      const updatedUser = await response.json();
      console.log("Profil güncellendi, dönen veri:", updatedUser);
      // Zustand store'u güncelle (artık patchResponse.json() ile gelen güncel user ile)
      setDbUser(updatedUser); 
      // Formdaki e-posta ve şifre alanları hariç diğerlerini de güncel tutmak için formData'yı da setDbUser sonrası güncelleyebiliriz.
      setFormData(prev => ({
        ...prev,
        firstName: updatedUser.firstName || "",
        lastName: updatedUser.lastName || "",
        phone: updatedUser.phone || "",
        // Şifre alanları zaten yukarıda temizlenmişti (eğer şifre değişimi yapıldıysa)
      }));

      toast({ title: "Profil güncellendi", description: "Bilgileriniz başarıyla kaydedildi." });

    } catch (error) {
      console.error("Profil/Şifre güncellenirken genel hata:", error);
      toast({
        title: "Bir hata oluştu",
        description: error instanceof Error ? error.message : "Bilgileriniz güncellenemedi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
  /*console.log('Profil Sayfası Debug:', {
    dbUser,
    isGoogle,
    googleData,
    fullName: getFullName(),
    hasGoogleData: !!googleData,
    email: dbUser?.email
  });*/
  
  // Telefon numarasını formatlamak için yardımcı fonksiyon
  const formatPhoneNumber = (phone: string | null | undefined): string => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, ""); // Sadece rakamları al

    if (cleaned.length === 11 && cleaned.startsWith("0")) {
      // "05335190143" -> "0533 519 01 43"
      return `0${cleaned.substring(1, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7, 9)} ${cleaned.substring(9, 11)}`;
    } else if (cleaned.length === 10) {
      // "5335190143" -> "0533 519 01 43"
      return `0${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6, 8)} ${cleaned.substring(8, 10)}`;
    }
    return phone; // Tanınmayan format ise orijinalini döndür
  };

  // Silme işlemini başlatan fonksiyon (diyaloğu açar)
  const handleDeleteAccountClick = () => {
    setIsDeleteDialogOpen(true);
  };

  // Silme işlemini onaylayan fonksiyon (API isteği gönderir)
  const handleDeleteAccountConfirm = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/users/${authUser?.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Hesap silinemedi");
      }

      // Başarılı silme sonrası
      toast({
        title: "Hesap Silindi",
        description: "Hesabınız başarıyla silindi. Yönlendiriliyorsunuz...",
      });
      
      await supabase.auth.signOut(); // Kullanıcıyı sistemden çıkar
      router.push("/"); // Ana sayfaya yönlendir
      // Zustand store'u temizleme ihtiyacı olabilir (app genelinde)
      // useUserStore.getState().reset(); // Örnek reset fonksiyonu (varsa)

    } catch (error) {
      console.error("Hesap silinirken hata:", error);
      toast({
        title: "Hesap Silinemedi",
        description: error instanceof Error ? error.message : "Hesabınız silinirken bir sorun oluştu.",
        variant: "destructive",
      });
      setIsDeleting(false); // Hata durumunda yükleniyor durumunu kaldır
      setIsDeleteDialogOpen(false); // Hata durumunda diyaloğu kapat
    }
    // Başarılı olursa zaten yönlendirme olacak, finally bloğuna gerek yok
  };

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
                  <AvatarImage src={getProfileImage() || "/placeholder.svg?height=80&width=80"} alt={getFullName()} />
                  <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{getFullName() || (dbUser ? `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim() : 'Kullanıcı')}</CardTitle>
                  <p className="text-sm text-muted-foreground">{dbUser?.email || 'E-posta bulunamadı'}</p>
                  
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
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                    <span>{dbUser?.email || 'Yok'}</span>
                  </div>
                  {dbUser?.phone && (
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                      <span>{formatPhoneNumber(dbUser.phone)}</span>
                    </div>
                  )}
                  {!dbUser?.phone && (
                     <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                      <span>Telefon eklenmemiş</span>
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
                      <Input id="firstName" value={formData.firstName} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Soyad</Label>
                      <Input id="lastName" value={formData.lastName} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta</Label>
                    <Input id="email" value={formData.email} disabled={true} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input id="phone" value={formData.phone} onChange={handleChange} placeholder="0555 444 33 22" />
                  </div>
                  
                  {!isGoogleUser() && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                        <Input id="currentPassword" type="password" value={formData.currentPassword} onChange={handleChange}/>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Yeni Şifre</Label>
                        <Input id="newPassword" type="password" value={formData.newPassword} onChange={handleChange}/>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
                        <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange}/>
                      </div>
                    </>
                  )}
                  {isGoogleUser() && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-md border border-yellow-200 text-sm text-yellow-700">
                      Şifre ayarlarınız Google hesabınız üzerinden yönetilmektedir.
                    </div>
                  )}
                </div>
                <div className="mt-6 flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
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
            {/* Hesabı Sil Bölümü */}            
            <Separator className="my-6" />
            <CardContent className="space-y-3">
               <h3 className="text-lg font-medium text-destructive">Hesabı Sil</h3>
               <p className="text-sm text-muted-foreground">
                 Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak kaybolacaktır. Bu işlem geri alınamaz.
               </p>
            </CardContent>
            <CardFooter>
                <Button variant="destructive" onClick={handleDeleteAccountClick} disabled={isLoading || isDeleting}>
                   Hesabımı Sil
                </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Silme Onay Diyaloğu */}      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hesabınızı Silmek İstediğinize Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Hesabınızı ve ilişkili tüm verilerinizi kalıcı olarak silecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Vazgeç</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccountConfirm} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Siliniyor...</>
              ) : (
                "Hesabı Kalıcı Olarak Sil"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}
