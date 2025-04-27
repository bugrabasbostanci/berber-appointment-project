"use client"

import { Building2, Calendar, Users } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminDashboardPage() {
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
              <div className="text-2xl font-bold">1</div>
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
              <div className="text-2xl font-bold">12</div>
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
              <div className="text-2xl font-bold">24</div>
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
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">The Barber Shop</div>
                    <div className="text-sm text-muted-foreground">İstanbul, Kadıköy</div>
                  </div>
                </div>
                <Link href="/dashboard/admin/shops/1">
                  <Button variant="ghost" size="sm">
                    Detay
                  </Button>
                </Link>
              </div>
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
              {[
                { id: 1, name: "Ahmet Yılmaz", role: "Berber" },
                { id: 2, name: "Mehmet Kaya", role: "Müşteri" },
                { id: 3, name: "Ayşe Demir", role: "Müşteri" },
              ].map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <span className="text-sm font-medium">{user.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.role}</div>
                    </div>
                  </div>
                  <Link href={`/dashboard/admin/users/${user.id}`}>
                    <Button variant="ghost" size="sm">
                      Detay
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
