import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Scissors, BeakerIcon as Beard, User, Star, MapPin, Phone, Mail, Baby } from "lucide-react"
import { Navbar } from "@/features/layout/components/navbar"
import { Footer } from "@/features/layout/components/footer"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full relative py-12 md:py-24 lg:py-32">
          <div className="container flex flex-col items-center justify-center gap-8 text-center min-h-[70vh] lg:min-h-[80vh] lg:flex-row lg:text-left">
            <div className="space-y-6 w-full lg:w-1/2">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                Randevunuzu hızlıca oluşturun
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Berberinizle randevu almak hiç bu kadar kolay olmamıştı. Birkaç tıkla randevunuzu oluşturun ve
                zamanınızı verimli kullanın.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link href="/login">
                  <Button size="lg" className="w-full sm:w-auto">
                    Randevu Al
                  </Button>
                </Link>

                <Link href="/services">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Hizmetler
                  </Button>
                </Link>
              </div>
            </div>
            <div className="w-full lg:w-1/2 mt-6 lg:mt-0">
              <Image
                src="/sleek-barber-shop.png"
                alt="Berber Salonu"
                width={800}
                height={600}
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover"
                priority
              />
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">Hizmetlerimiz</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground">
                Profesyonel ekibimizle size en iyi hizmeti sunuyoruz.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="text-left">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Scissors className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg mb-1">Saç Tıraşı</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Modern ve klasik saç kesim teknikleriyle istediğiniz stili yaratıyoruz.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="text-left">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Beard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg mb-1">Sakal Tıraşı</CardTitle>
                      <p className="text-sm text-muted-foreground">Yüz hatlarınıza uygun sakal kesimi ve bakımı.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="text-left">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Baby className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg mb-1">Çocuk Tıraşı</CardTitle>
                      <p className="text-sm text-muted-foreground">Çocuklara özel nazik ve eğlenceli tıraş deneyimi.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="pt-4 text-center">
              <Link href="/services">
                <Button size="lg">Tüm Hizmetleri Gör</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container space-y-8">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">Nasıl Çalışır?</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground">Sadece dört adımda randevunuzu oluşturun.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <span className="text-sm font-bold">1</span>
                  </div>
                  <h3 className="text-lg font-bold">Giriş Yapın</h3>
                </div>
                <p className="text-muted-foreground">Hesabınıza giriş yapın veya yeni bir hesap oluşturun.</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <span className="text-sm font-bold">2</span>
                  </div>
                  <h3 className="text-lg font-bold">Tarih/Gün Seçimi</h3>
                </div>
                <p className="text-muted-foreground">Randevunuz için uygun bir tarih seçin.</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <span className="text-sm font-bold">3</span>
                  </div>
                  <h3 className="text-lg font-bold">Personel ve Saat Seçimi</h3>
                </div>
                <p className="text-muted-foreground">
                  İstediğiniz personeli ve müsait saatler arasından size uygun olanı seçin.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <span className="text-sm font-bold">4</span>
                  </div>
                  <h3 className="text-lg font-bold">Randevuyu Onaylayın</h3>
                </div>
                <p className="text-muted-foreground">Bilgilerinizi girin ve randevunuzu onaylayın.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">Müşteri Yorumları</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground">Müşterilerimizin deneyimlerini dinleyin.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <span className="font-semibold text-sm">MA</span>
                    </div>
                    <div>
                      <p className="font-semibold">Mehmet Aydın</p>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    "Randevu almak çok kolay ve hızlı. Artık saatlerce sıra beklemiyorum. Kesinlikle tavsiye ederim."
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <span className="font-semibold text-sm">AK</span>
                    </div>
                    <div>
                      <p className="font-semibold">Ali Kaya</p>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < 4 ? "fill-primary text-primary" : "text-muted-foreground"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    "Uygulama çok kullanışlı. İstediğim saatte randevu alabiliyorum ve hatırlatma bildirimleri çok işime
                    yarıyor."
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <span className="font-semibold text-sm">CY</span>
                    </div>
                    <div>
                      <p className="font-semibold">Can Yılmaz</p>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    "Berberim artık her zaman dolu olmasına rağmen, uygulama sayesinde kolayca yer bulabiliyorum. Harika
                    bir sistem!"
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">İletişim</h2>
                <p className="text-muted-foreground">
                  Sorularınız için bize ulaşın. Size yardımcı olmaktan memnuniyet duyarız.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <p className="text-sm sm:text-base">Turan Mah. Okçular Sk. No:7/C Turgutlu, Manisa</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary" />
                    <p className="text-sm sm:text-base">0507 913 0769</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    <p className="text-sm sm:text-base">denizberberolan@gmail.com</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold">Çalışma Saatleri</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm sm:text-base">
                    <div>
                      <p className="font-medium">Pazartesi - Cumartesi</p>
                      <p className="text-muted-foreground">09:30 - 20:45</p>
                    </div>
                    <div>
                      <p className="font-medium">Pazar</p>
                      <p className="text-muted-foreground">Kapalı</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full h-[300px] sm:h-auto overflow-hidden rounded-lg">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3122.4946426408897!2d27.70579258237776!3d38.49930146149921!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14b9a79657586eb9%3A0xf610a9332b6ce970!2sThe%20Barber%20Shop%20Turgutlu!5e0!3m2!1str!2str!4v1746272643170!5m2!1str!2str"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Harita"
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
