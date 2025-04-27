import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/features/layout/components/navbar"
import { Footer } from "@/features/layout/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"

export const metadata: Metadata = {
  title: "E-posta Doğrulama",
  description: "E-posta adresinizi doğrulayın",
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="container flex flex-col items-center justify-center py-12 md:py-24">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-xl">E-posta Doğrulama</CardTitle>
                <CardDescription>Hesabınızı aktifleştirmek için e-posta adresinizi doğrulayın</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-10 w-10 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    E-posta adresinize bir doğrulama bağlantısı gönderdik. Lütfen gelen kutunuzu kontrol edin ve
                    bağlantıya tıklayarak hesabınızı doğrulayın.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Button asChild className="w-full">
                  <Link href="/auth/login">Giriş Sayfasına Dön</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
