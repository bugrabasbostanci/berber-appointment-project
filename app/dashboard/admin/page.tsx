"use client"

import { Building2, Calendar, Users } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { countShops, getShops } from "@/lib/services/shopService"
import { countUsers, getUsers } from "@/lib/services/userService"
import { getAppointmentStats } from "@/lib/services/appointmentService"

export default function AdminDashboardPage() {
  const [shopCount, setShopCount] = useState(0)
  const [userCount, setUserCount] = useState(0)
  const [appointmentCount, setAppointmentCount] = useState(0)
  const [recentShops, setRecentShops] = useState<any[]>([])
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // İstatistikleri çek
        const shopCountData = await countShops({})
        const userCountData = await countUsers({})
        const appointmentStatsData = await getAppointmentStats({})
        
        // Son eklenen dükkanları çek
        const recentShopsData = await getShops({ take: 1 })
        
        // Son eklenen kullanıcıları çek
        const recentUsersData = await getUsers({ take: 3 })
        
        // State'leri güncelle
        setShopCount(shopCountData)
        setUserCount(userCountData)
        setAppointmentCount(appointmentStatsData.total)
        setRecentShops(recentShopsData)
        setRecentUsers(recentUsersData)
      } catch (error) {
        console.error("Dashboard verisi çekilirken hata:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Admin Paneli</h1>
        <p className="text-muted-foreground">Berber randevu sistemini yönetin</p>
      </div>

      {/* Top stats cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam Dükkan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{loading ? "..." : shopCount}</div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{loading ? "..." : userCount}</div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                <Users className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam Randevu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{loading ? "..." : appointmentCount}</div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content area */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Dükkanlar</CardTitle>
              <CardDescription>Sistemdeki dükkanlar</CardDescription>
            </div>
            <Link href="/dashboard/admin/shops">
              <Button variant="outline" size="sm">
                Tümünü Gör
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">Yükleniyor...</div>
              ) : recentShops.length > 0 ? (
                recentShops.map(shop => (
                  <div key={shop.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{shop.name}</div>
                        <div className="text-sm text-muted-foreground">{shop.address}</div>
                      </div>
                    </div>
                    <Link href={`/dashboard/admin/shops/${shop.id}`}>
                      <Button variant="ghost" size="sm">
                        Detay
                      </Button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">Henüz dükkan bulunmuyor</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Son Kullanıcılar</CardTitle>
              <CardDescription>Son kaydolan kullanıcılar</CardDescription>
            </div>
            <Link href="/dashboard/admin/users">
              <Button variant="outline" size="sm">
                Tümünü Gör
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">Yükleniyor...</div>
              ) : recentUsers.length > 0 ? (
                recentUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <span className="text-sm font-medium">
                          {user.firstName ? user.firstName.charAt(0) : user.email.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}` 
                            : user.email}
                        </div>
                        <div className="text-sm text-muted-foreground">{user.role}</div>
                      </div>
                    </div>
                    <Link href={`/dashboard/admin/users/${user.id}`}>
                      <Button variant="ghost" size="sm">
                        Detay
                      </Button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">Henüz kullanıcı bulunmuyor</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
