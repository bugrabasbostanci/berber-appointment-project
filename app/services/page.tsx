import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle, CardFooter } from "@/components/ui/card"
import { Navbar } from "@/features/layout/components/navbar"
import { Footer } from "@/features/layout/components/footer"

export default function ServicesPage() {
  const services = [
    {
      title: "Saç Tıraşı",
      description: "Modern ve klasik saç kesim teknikleriyle istediğiniz stili yaratıyoruz.",
    },
    {
      title: "Sakal Tıraşı",
      description: "Yüz hatlarınıza uygun sakal kesimi ve bakımı ile özgüveninizi artırın.",
    },
    {
      title: "Çocuk Tıraşı",
      description: "Çocuklara özel nazik ve eğlenceli tıraş deneyimi sunuyoruz.",
    },
    {
      title: "Ağda",
      description: "Profesyonel ağda hizmetiyle istenmeyen tüylerden kurtulun.",
    },
    {
      title: "Maske",
      description: "Cildinizi canlandıran ve besleyen özel yüz maskeleri uyguluyoruz.",
    },
    {
      title: "Yıkama/Fön",
      description: "Saç tipinize uygun ürünlerle yıkama ve profesyonel fön çekimi.",
    },
    {
      title: "Saç Maskesi",
      description: "Saçlarınızı besleyen ve canlandıran özel bakım maskeleri uyguluyoruz.",
    },
    {
      title: "Kaş Şekillendirme",
      description: "Yüz hatlarınıza uygun kaş şekillendirme ve bakımı yapıyoruz.",
    },
    {
      title: "Tek Renk Saç Boyası",
      description: "Kaliteli ürünlerle saçlarınıza zarar vermeden istediğiniz rengi uyguluyoruz.",
    },
  ]

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
            {services.map((service, index) => (
              <Card key={index} className="flex flex-col">
                <CardContent className="p-4 sm:p-6 flex-1">
                  <CardTitle className="text-lg mb-2">{service.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0 sm:p-6 sm:pt-0">
                  <Link href="/auth/login">
                    <Button variant="outline" className="w-full">
                      Randevu Al
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/">
              <Button variant="outline">Ana Sayfaya Dön</Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
