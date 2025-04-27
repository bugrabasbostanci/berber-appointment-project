"use client"

import type * as React from "react"
import { Calendar, History, Home, Scissors, Settings, Star, User } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Mehmet Aydın",
    email: "mehmet@example.com",
    avatar: "/vibrant-street-market.png",
  },
  navMain: [
    {
      title: "Ana Sayfa",
      url: "/dashboard/customer",
      icon: Home,
      isActive: true,
      items: [],
    },
    {
      title: "Randevularım",
      url: "#",
      icon: Calendar,
      items: [
        {
          title: "Aktif Randevular",
          url: "#",
        },
        {
          title: "Geçmiş Randevular",
          url: "#",
        },
        {
          title: "Randevu Oluştur",
          url: "/appointments/new",
        },
      ],
    },
    {
      title: "Favorilerim",
      url: "#",
      icon: Star,
      items: [
        {
          title: "Favori Berberler",
          url: "#",
        },
        {
          title: "Favori Hizmetler",
          url: "#",
        },
      ],
    },
    {
      title: "Ayarlar",
      url: "#",
      icon: Settings,
      items: [
        {
          title: "Profil",
          url: "#",
        },
        {
          title: "Bildirimler",
          url: "#",
        },
        {
          title: "Güvenlik",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Yardım",
      url: "#",
      icon: User,
    },
    {
      title: "Geri Bildirim",
      url: "#",
      icon: History,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/" className="flex items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Scissors className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">The Barber Shop</span>
                  <span className="truncate text-xs text-muted-foreground">Men's Club</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
