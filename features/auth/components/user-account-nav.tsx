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
import { BadgeCheck, LogOut, Settings, User, LayoutDashboard } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "../providers/auth-provider"

export function UserAccountNav() {
  const { user, dbUser } = useAuth()
  const supabase = createClient()
  const pathname = usePathname()
  
  // Kullanıcı oturumunu kapat
  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }
  
  if (!user || !dbUser) {
    return null
  }
  
  // Google ile giriş yapan kullanıcıların display name bilgisini kullan
  // Eğer yoksa veritabanındaki isim bilgisini kullan
  const googleDisplayName = user.user_metadata?.full_name || user.user_metadata?.name
  
  // Kullanıcı adını formatla
  const fullName = googleDisplayName || 
    `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim() || 'Kullanıcı'
  
  // İsim baş harflerini al
  const initials = fullName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
  
  // Kullanıcının dashboard'una doğru yönlendirme yap
  const dashboardPath = `/dashboard/${dbUser.role.toLowerCase()}`

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10">
          <Avatar className="h-10 w-10">
            <AvatarImage src={dbUser.profileImage || ""} alt={fullName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={dashboardPath}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`${dashboardPath}/profile`}>
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`${dashboardPath}/settings`}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Ayarlar</span>
            </Link>
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