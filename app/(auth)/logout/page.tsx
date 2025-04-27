"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Navbar } from "@/features/layout/components/navbar"
import { Footer } from "@/features/layout/components/footer"
import { Icons } from "@/components/icons"

export default function LogoutPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Oturum kapatma işlemi - Supabase entegrasyonu için hazır
  const handleLogout = async () => {
    setIsLoading(true)
    try {
      // Burada Supabase Auth entegrasyonu yapılacak
      // Örnek: await supabase.auth.signOut()
      console.log("Oturum kapatılıyor")

      // Simüle edilmiş API gecikmesi - gerçek implementasyonda kaldırılacak
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Oturum kapatıldı",
        description: "Başarıyla çıkış yaptınız",
        variant: "default",
      })

      // Ana sayfaya yönlendir
      router.push("/")
    } catch (error) {
      console.error("Oturum kapatma hatası:", error)
      toast({
        title: "Oturum kapatma başarısız",
        description: "Bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    // Önceki sayfaya dön
    router.back()
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] py-8">
          <Card className="mx-auto max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Çıkış Yap</CardTitle>
              <CardDescription>Hesabınızdan çıkış yapmak istediğinize emin misiniz?</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <LogOut className="h-16 w-16 text-muted-foreground" />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                İptal
              </Button>
              <Button onClick={handleLogout} disabled={isLoading}>
                {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Çıkış yapılıyor..." : "Çıkış Yap"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}
