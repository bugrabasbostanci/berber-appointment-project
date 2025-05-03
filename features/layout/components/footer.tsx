import Link from "next/link"
import { Instagram, Facebook, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-4">
            <Link href="https://www.instagram.com/brbrshpdnz/" target="_blank" className="text-muted-foreground hover:text-foreground">
              <Instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </Link>
            <Link href="https://www.facebook.com/brbrshpdnz/" target="_blank" className="text-muted-foreground hover:text-foreground">
              <Facebook className="h-5 w-5" />
              <span className="sr-only">Facebook</span>
            </Link>
            <Link href="https://www.x.com" target="_blank" className="text-muted-foreground hover:text-foreground">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} The Barber Shop. Tüm hakları saklıdır.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="https://personal-website-liard-eight.vercel.app/" target="_blank" className="hover:underline">
                Tasarım ve Geliştirme: Buğra Başbostancı
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
