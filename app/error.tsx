"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Opsiyonel: Hatayı bir hata izleme servisine gönderebilirsiniz
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="text-center space-y-5 max-w-md">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100">Hata</h1>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Bir şeyler yanlış gitti</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Üzgünüz, bir hata oluştu. Lütfen tekrar deneyin veya ana sayfaya dönün.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Button onClick={() => reset()} variant="outline" className="flex items-center">
            <RefreshCw className="mr-2 h-4 w-4" />
            Tekrar Dene
          </Button>
          <Button asChild>
            <Link href="/" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Ana Sayfaya Dön
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
