import type { Metadata } from "next"
import { Navbar } from "@/features/layout/components/navbar"
import { Footer } from "@/features/layout/components/footer"
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form"

export const metadata: Metadata = {
  title: "Şifremi Unuttum",
  description: "Şifrenizi sıfırlamak için e-posta adresinizi girin",
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="container flex flex-col items-center justify-center py-12 md:py-24">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <ForgotPasswordForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
