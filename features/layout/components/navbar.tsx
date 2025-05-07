"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/features/theme/components/theme-toggle"
import { MobileSidebar } from "./mobile-sidebar"
import { UserAccountNav } from "@/features/auth/components/user-account-nav"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/providers/auth-provider"

export function Navbar() {
  const pathname = usePathname()
  const { user, dbUser } = useAuth()
  const isLoggedIn = !!user && !!dbUser

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold">The Barber Shop</span>
          <span className="text-sm text-muted-foreground">Men's Club</span>
        </Link>

        {/* Mobile Sidebar and Theme Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <MobileSidebar />
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
          {isLoggedIn ? (
            <UserAccountNav />
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Giriş Yap</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Kayıt Ol</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
