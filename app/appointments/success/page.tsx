import { Navbar } from "@/features/layout/components/navbar"
import { Footer } from "@/features/layout/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Calendar, Home } from "lucide-react"
import Link from "next/link"

export default function AppointmentSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-8 md:py-12 flex items-center justify-center">
        <Card className="max-w-md w-full mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Randevunuz Oluşturuldu!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tarih:</span>
                <span className="font-medium">15 Temmuz 2023</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Saat:</span>
                <span className="font-medium">14:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Personel:</span>
                <span className="font-medium">Ahmet Yılmaz (Berber)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ad Soyad:</span>
                <span className="font-medium">Mehmet Aydın</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Telefon:</span>
                <span className="font-medium">0555 123 4567</span>
              </div>
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Randevunuzu görüntülemek veya iptal etmek için randevular sayfasına gidiniz.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Link href="/dashboard/customer" className="w-full">
              <Button className="w-full flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Randevularım
              </Button>
            </Link>
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full flex items-center gap-2">
                <Home className="h-4 w-4" />
                Ana Sayfaya Dön
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
