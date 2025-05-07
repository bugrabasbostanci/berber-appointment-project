"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BadgeCheck, LogOut, Settings, User, LayoutDashboard, Sun, Moon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "../providers/auth-provider"
import useUserStore from "@/app/stores/userStore"
import { useTheme } from "next-themes"

export function UserAccountNav() {
  const { user, dbUser } = useAuth()
  const userStore = useUserStore()
  const supabase = createClient()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  
  // Kullanıcı oturumunu kapat
  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }
  
  if (!userStore.dbUser || !userStore.isAuthenticated) {
    return null
  }
  
  // Kullanıcı adını ve diğer bilgileri Zustand store'dan al
  const fullName = userStore.getFullName() || 'Kullanıcı'
  const initials = userStore.getInitials()
  const profileImage = userStore.getProfileImage() || ""
  
  // Kullanıcının dashboard'una doğru yönlendirme yap
  const dashboardPath = `/dashboard/${userStore.dbUser.role.toLowerCase()}`

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profileImage} alt={fullName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{fullName}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={dashboardPath}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Randevular</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`${dashboardPath}/profile`}>
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
            <span>{theme === "dark" ? "Açık Mod" : "Koyu Mod"}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <button onClick={handleSignOut} className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Çıkış Yap</span>
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}