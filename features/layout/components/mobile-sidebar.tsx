"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Menu, Home, Scissors, Info, Star, Phone, User, LayoutDashboard, Settings, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/features/auth/providers/auth-provider"
import { createClient } from "@/lib/supabase/client"
import useUserStore from "@/app/stores/userStore"

export function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { user, dbUser } = useAuth()
  const userStore = useUserStore()
  const isLoggedIn = !!userStore.isAuthenticated && !!userStore.dbUser

  const closeSheet = () => setOpen(false)
  const toggleSheet = () => setOpen(!open)

  // Temel navigasyon öğeleri
  const navItems = [
    { title: "Ana Sayfa", href: "/", icon: Home },
    { title: "Hizmetler", href: "/services", icon: Scissors },
    { title: "Nasıl Çalışır", href: "/#how-it-works", icon: Info },
    { title: "Yorumlar", href: "/#testimonials", icon: Star },
    { title: "İletişim", href: "/#contact", icon: Phone },
  ]

  // Kullanıcı giriş yapmışsa ek navigasyon öğeleri
  const userNavItems = isLoggedIn && userStore.dbUser
    ? [
        { title: "Dashboard", href: `/dashboard/${userStore.dbUser.role.toLowerCase()}`, icon: LayoutDashboard },
        { title: "Profil", href: `/dashboard/${userStore.dbUser.role.toLowerCase()}/profile`, icon: User },
        { title: "Ayarlar", href: `/dashboard/${userStore.dbUser.role.toLowerCase()}/settings`, icon: Settings },
      ]
    : []

  // Kullanıcı bilgilerini Zustand store'dan al
  const getFullName = () => {
    return userStore.getFullName() || 'Kullanıcı'
  }

  const getInitials = () => {
    return userStore.getInitials()
  }

  const getProfileImage = () => {
    return userStore.getProfileImage() || ""
  }

  // Oturum kapatma işlevi
  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    closeSheet()
  }

  return (
    <>
      <Button variant="ghost" size="icon" onClick={toggleSheet} className="md:hidden">
        <Menu className="h-6 w-6" />
        <span className="sr-only">Menüyü aç</span>
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="flex flex-col p-0">
          <SheetHeader className="border-b p-4">
            <SheetTitle className="flex items-center">
              {isLoggedIn && userStore.dbUser ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getProfileImage()} alt={getFullName()} />
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{getFullName()}</span>
                    <span className="truncate text-xs text-muted-foreground">{userStore.dbUser.email}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <Scissors className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">The Barber Shop</span>
                    <span className="truncate text-xs text-muted-foreground">Men's Club</span>
                  </div>
                </div>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-auto py-2">
            <nav className="grid gap-1 px-2">
              {/* Ana navigasyon öğeleri */}
              {navItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  onClick={closeSheet}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                    pathname === item.href
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </Link>
              ))}

              {/* Kullanıcı giriş yapmışsa ek navigasyon öğeleri */}
              {userNavItems.length > 0 && (
                <>
                  <div className="my-2 h-px bg-muted" />
                  {userNavItems.map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      onClick={closeSheet}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                        pathname === item.href
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.title}
                    </Link>
                  ))}
                </>
              )}
            </nav>
          </div>

          <div className="border-t p-4">
            <div className="grid gap-2">
              {isLoggedIn ? (
                <Button variant="outline" onClick={handleSignOut} className="w-full flex items-center justify-center">
                  <LogOut className="mr-2 h-4 w-4" />
                  Çıkış Yap
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/login" onClick={closeSheet}>
                    <Button variant="outline" className="w-full">
                      Giriş Yap
                    </Button>
                  </Link>
                  <Link href="/register" onClick={closeSheet}>
                    <Button className="w-full">Kayıt Ol</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
