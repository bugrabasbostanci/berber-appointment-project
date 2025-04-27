"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Scissors, Menu, X } from "lucide-react"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Scissors className="h-5 w-5" />
          <span className="text-lg font-bold">BerberApp</span>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden flex items-center"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Menüyü kapat" : "Menüyü aç"}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary">
            Ana Sayfa
          </Link>
          <Link href="/hizmetler" className="text-sm font-medium hover:text-primary">
            Hizmetler
          </Link>
          <a href="/#nasil-calisir" className="text-sm font-medium hover:text-primary">
            Nasıl Çalışır
          </a>
          <a href="/#yorumlar" className="text-sm font-medium hover:text-primary">
            Yorumlar
          </a>
          <a href="/#iletisim" className="text-sm font-medium hover:text-primary">
            İletişim
          </a>
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-2">
          <Link href="/giris">
            <Button variant="outline" size="sm">
              Giriş Yap
            </Button>
          </Link>
          <Link href="/kayit">
            <Button size="sm">Kayıt Ol</Button>
          </Link>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container py-4 flex flex-col space-y-4">
            <Link href="/" className="text-sm font-medium hover:text-primary py-2" onClick={() => setIsMenuOpen(false)}>
              Ana Sayfa
            </Link>
            <Link
              href="/hizmetler"
              className="text-sm font-medium hover:text-primary py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Hizmetler
            </Link>
            <a
              href="/#nasil-calisir"
              className="text-sm font-medium hover:text-primary py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Nasıl Çalışır
            </a>
            <a
              href="/#yorumlar"
              className="text-sm font-medium hover:text-primary py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Yorumlar
            </a>
            <a
              href="/#iletisim"
              className="text-sm font-medium hover:text-primary py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              İletişim
            </a>
            <div className="flex flex-col space-y-2 pt-2">
              <Link href="/giris" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Giriş Yap
                </Button>
              </Link>
              <Link href="/kayit" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full">Kayıt Ol</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
