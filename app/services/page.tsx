import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle, CardFooter } from "@/components/ui/card"
import { Navbar } from "@/features/layout/components/navbar"
import { Footer } from "@/features/layout/components/footer"
import { Service } from "@prisma/client"
import { getAllServices } from "@/lib/services/serviceService"
import { redirect } from "next/navigation"

// Statik veri yerine dinamik veri kullanmak için
export async function ServicesPage() {
  try {
    // Veritabanından doğrudan servisleri çek
    const servicesData = await getAllServices()

    if (!servicesData || servicesData.length === 0) {
      // Eğer servis yoksa kullanıcıya bir mesaj göster
      return (
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">
            <div className="container py-8 md:py-12 text-center">
              <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl mb-4">
                Hizmetlerimiz
              </h1>
              <p className="text-muted-foreground mb-6">Şu anda mevcut hizmet bulunmamaktadır.</p>
            </div>
          </main>
          <Footer />
        </div>
      )
    }

    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />

        <main className="flex-1">
          <div className="container py-8 md:py-12">
            <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl mb-2 text-center">
              Hizmetlerimiz
            </h1>
            <p className="text-muted-foreground text-center mb-8">Profesyonel berber hizmetlerimiz ile tanışın</p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {servicesData.map((service) => (
                <Card key={service.id} className="flex flex-col">
                  <CardContent className="p-4 sm:p-6 flex-1">
                    <CardTitle className="text-lg mb-2">{service.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 sm:p-6 sm:pt-0">
                    <Link href="/login">
                      <Button variant="outline" className="w-full">
                        Randevu Al
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    )
  } catch (error) {
    console.error("Servis verileri alınırken hata oluştu:", error)
    // Hata durumunda ana sayfaya yönlendir
    redirect("/")
  }
}

export default ServicesPage
