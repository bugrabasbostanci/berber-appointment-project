import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/features/layout/components/navbar"
import { Footer } from "@/features/layout/components/footer"
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form"

export const metadata: Metadata = {
  title: "Şifre Sıfırlama",
  description: "Yeni şifrenizi belirleyin",
}

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string }
}) {
  const token = searchParams.token || ""

  // Token yoksa hata mesajı göster
  if (!token) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
          <div className="container flex flex-col items-center justify-center py-12 md:py-24">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
              <div className="rounded-lg border bg-card p-8 text-center shadow-sm">
                <h1 className="mb-2 text-xl font-semibold">Geçersiz veya Süresi Dolmuş Bağlantı</h1>
                <p className="mb-4 text-sm text-muted-foreground">
                  Şifre sıfırlama bağlantınız geçersiz veya süresi dolmuş olabilir.
                </p>
                <Link href="/auth/forgot-password" className="text-sm underline underline-offset-4">
                  Yeni bir şifre sıfırlama bağlantısı talep edin
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="container flex flex-col items-center justify-center py-12 md:py-24">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <ResetPasswordForm token={token} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
