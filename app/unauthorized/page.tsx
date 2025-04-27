import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShieldAlert } from "lucide-react"

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="text-center space-y-5 max-w-md">
        <div className="flex justify-center">
          <ShieldAlert className="h-16 w-16 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Yetkisiz Erişim</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Bu sayfaya erişim yetkiniz bulunmamaktadır. Lütfen giriş yapın veya ana sayfaya dönün.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Button asChild variant="outline">
            <Link href="/login" className="flex items-center">
              Giriş Yap
            </Link>
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
