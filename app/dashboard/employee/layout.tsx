"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
// Import kısmına eksik olan bileşenleri ekleyelim
import { Calendar, Home, LayoutDashboard, LogOut, Moon, Settings, Sun, User, Scissors } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent } from "@/components/ui/sheet"

export default function EmployeeDashboardLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  // Check if we're on mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkIsMobile()

    // Add event listener
    window.addEventListener("resize", checkIsMobile)

    // Clean up
    return () => {
      window.removeEventListener("resize", checkIsMobile)
    }
  }, [])

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
        <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)}>
          <span className="sr-only">Toggle Menu</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <path d="M9 3v18" />
          </svg>
        </Button>
        <h1 className="text-lg font-semibold">
          {pathname === "/dashboard/employee"
            ? "Çalışan Paneli"
            : pathname === "/dashboard/employee/calendar"
              ? "Takvimim"
              : pathname === "/dashboard/employee/profile"
                ? "Profilim"
                : "Çalışan Paneli"}
        </h1>
      </header>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="w-[280px] p-0 sm:w-[320px]">
          <div className="flex h-full flex-col">
            <div className="p-4">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex aspect-square h-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Scissors className="h-4 w-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="font-semibold">The Barber Shop</span>
                  <span className="text-xs text-muted-foreground">Men's Club</span>
                </div>
              </div>
            </div>
            <ScrollArea className="flex-1">
              <nav className="flex flex-col gap-2 p-2">
                <NavItems pathname={pathname} setIsMobileOpen={setIsMobileOpen} />
              </nav>
            </ScrollArea>
            <div className="mt-auto border-t p-4">
              <UserMenu />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r bg-background transition-transform md:flex ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="p-4">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex aspect-square h-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Scissors className="h-4 w-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="font-semibold">The Barber Shop</span>
                  <span className="text-xs text-muted-foreground">Men's Club</span>
                </div>
              </div>
            </div>
            <ScrollArea className="flex-1">
              <nav className="flex flex-col gap-2 p-2">
                <NavItems pathname={pathname} setIsMobileOpen={setIsMobileOpen} />
              </nav>
            </ScrollArea>
            <div className="mt-auto border-t p-4">
              <UserMenu />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-200 ease-in-out ${isOpen ? "md:ml-64" : "md:ml-0"}`}>
          {/* Desktop Header with Sidebar Toggle */}
          <div className="hidden h-14 items-center gap-4 border-b bg-background px-4 md:flex">
            <Button variant="outline" size="icon" onClick={() => setIsOpen(!isOpen)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <path d="M9 3v18" />
              </svg>
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
            <h1 className="text-lg font-semibold">
              {pathname === "/dashboard/employee"
                ? "Çalışan Paneli"
                : pathname === "/dashboard/employee/calendar"
                  ? "Takvimim"
                  : pathname === "/dashboard/employee/profile"
                    ? "Profilim"
                    : "Çalışan Paneli"}
            </h1>
          </div>

          {/* Page Content */}
          {children}
        </main>
      </div>
    </div>
  )
}

function NavItems({ pathname, setIsMobileOpen }: { pathname: string; setIsMobileOpen: (open: boolean) => void }) {
  const handleLinkClick = () => {
    // Close the mobile sidebar when a link is clicked
    setIsMobileOpen(false)
  }

  return (
    <>
      <Link
        href="/dashboard/employee"
        className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
          pathname === "/dashboard/employee"
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        }`}
        onClick={handleLinkClick}
      >
        <LayoutDashboard className="h-5 w-5" />
        <span>Genel Bakış</span>
      </Link>
      <Link
        href="/dashboard/employee/calendar"
        className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
          pathname === "/dashboard/employee/calendar"
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        }`}
        onClick={handleLinkClick}
      >
        <Calendar className="h-5 w-5" />
        <span>Takvimim</span>
      </Link>
      <Link
        href="/dashboard/employee/profile"
        className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
          pathname === "/dashboard/employee/profile"
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        }`}
        onClick={handleLinkClick}
      >
        <Settings className="h-5 w-5" />
        <span>Profilim</span>
      </Link>
    </>
  )
}

function UserMenu() {
  const [open, setOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  return (
    <div className="relative">
      <div
        onClick={() => setOpen(!open)}
        className="flex w-full cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-accent"
      >
        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-blue-500 to-indigo-700">
          <Avatar className="h-full w-full rounded-md">
            <AvatarImage src="/rick-8bit.webp?height=32&width=32" alt="User" />
            <AvatarFallback>MK</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium">Mehmet Kaya</p>
          <p className="text-xs text-muted-foreground">Berber</p>
        </div>
        <Settings className="h-4 w-4 text-muted-foreground" />
      </div>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-56 rounded-md border bg-popover p-1 shadow-md">
          <Link
            href="/"
            className="flex w-full items-center px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
            onClick={() => setOpen(false)}
          >
            <Home className="mr-2 h-4 w-4" />
            <span>Ana Sayfa</span>
          </Link>
          <div className="h-px bg-border my-1" />
          <button
            className="flex w-full items-center justify-between px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <div className="flex items-center">
              {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
              <span>{theme === "dark" ? "Açık Mod" : "Koyu Mod"}</span>
            </div>
          </button>
          <Link
            href="/dashboard/employee/profile"
            className="flex w-full items-center px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
            onClick={() => setOpen(false)}
          >
            <User className="mr-2 h-4 w-4" />
            <span>Profilim</span>
          </Link>
          <div className="h-px bg-border my-1" />
          <button className="flex w-full items-center px-2 py-1.5 text-sm hover:bg-accent rounded-sm">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      )}
    </div>
  )
}
