"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw } from "lucide-react"

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="text-center space-y-5 max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Kimlik Doğrulama Hatası</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Oturum açma veya kayıt işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Button onClick={() => reset()} variant="outline" className="flex items-center">
            <RefreshCw className="mr-2 h-4 w-4" />
            Tekrar Dene
          </Button>
          <Button asChild>
            <Link href="/login" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Giriş Sayfasına Dön
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
