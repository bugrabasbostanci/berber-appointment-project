"use client"

import { useEffect, useState } from "react"
import { MoreHorizontal, Plus, Search } from "lucide-react"
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getUsers } from "@/lib/services/userService"
import { User } from "@prisma/client"

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const userData = await getUsers({})
        setUsers(userData)
      } catch (error) {
        console.error("Kullanıcılar çekilirken hata:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      (user.firstName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.lastName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Kullanıcılar</h1>
        <p className="text-muted-foreground">Sistemdeki kullanıcıları yönetin</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Kullanıcı Listesi</CardTitle>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Kullanıcı
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Kullanıcı ara..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] py-3 px-4 text-sm font-medium">
              <div>Kullanıcı</div>
              <div className="hidden md:block">E-posta</div>
              <div className="hidden md:block">Rol</div>
              <div className="text-right">İşlemler</div>
            </div>
            <div className="divide-y">
              {loading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">Yükleniyor...</div>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div key={user.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] items-center py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`/abstract-geometric-shapes.png?height=32&width=32&query=${user.firstName || user.email}`}
                          alt={user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email}
                        />
                        <AvatarFallback>
                          {user.firstName ? user.firstName.charAt(0) : user.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}` 
                            : user.email}
                        </div>
                        <div className="md:hidden text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                    <div className="hidden md:block text-sm text-muted-foreground">{user.email}</div>
                    <div className="hidden md:block text-sm">
                      {user.role === "admin"
                        ? "Admin"
                        : user.role === "barber"
                          ? "Berber"
                          : user.role === "employee"
                            ? "Çalışan"
                            : "Müşteri"}
                    </div>
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Menüyü Aç</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/admin/users/${user.id}`}>Görüntüle</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>Düzenle</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Sil</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-sm text-muted-foreground">Sonuç bulunamadı.</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
