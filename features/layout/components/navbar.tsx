"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/features/theme/components/theme-toggle"
import { MobileSidebar } from "./mobile-sidebar"
import { UserAccountNav } from "@/features/auth/components/user-account-nav"

// Geçici olarak kullanıcı durumunu simüle ediyoruz
// Gerçek uygulamada bu veri bir auth provider'dan gelecek
const user = {
  name: "Ahmet Yılmaz",
  email: "ahmet@example.com",
  role: "customer",
} as const

// Geliştirme sırasında kullanıcı durumunu test etmek için
// Bu değeri true/false yaparak farklı durumları test edebilirsiniz
const isLoggedIn = false

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold">The Barber Shop</span>
          <span className="text-sm text-muted-foreground">Men's Club</span>
        </Link>

        {/* Mobile Sidebar and Theme Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <MobileSidebar user={isLoggedIn ? user : null} />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium ${
              pathname === "/" ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Ana Sayfa
          </Link>
          <Link
            href="/services"
            className={`text-sm font-medium ${
              pathname === "/services" ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Hizmetler
          </Link>
          <Link href="/#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Nasıl Çalışır
          </Link>
          <Link href="/#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Yorumlar
          </Link>
          <Link href="/#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            İletişim
          </Link>
        </nav>

        {/* Desktop Auth Buttons or User Account Nav */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <UserAccountNav user={isLoggedIn ? user : null} />
        </div>
      </div>
    </header>
  )
}
