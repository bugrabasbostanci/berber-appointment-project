"use client"

import { useState, useEffect } from "react"
import { Building2, MoreHorizontal, Plus, Search } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

type Shop = {
  id: string;
  name: string;
  location?: string;
  address?: string;
  status?: string;
  ownerId?: string;
}

export default function ShopsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Dükkan verilerini API'den getirme
  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/shops?take=50") // İlk 50 dükkanı al
        
        if (!response.ok) {
          throw new Error("Dükkan verileri getirilemedi")
        }
        
        const data = await response.json()
        setShops(data.shops)
      } catch (error) {
        console.error("Dükkan verileri yüklenirken hata:", error)
        toast({
          title: "Hata",
          description: "Dükkan verileri yüklenirken bir sorun oluştu.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchShops()
  }, [toast])

  // Filter shops based on search term
  const filteredShops = shops.filter((shop) => {
    if (!shop) return false
    return (
      shop.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.location?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Dükkanlar</h1>
        <p className="text-muted-foreground">Sistemdeki dükkanları yönetin</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Dükkan Listesi</CardTitle>
          <Button size="sm" asChild>
            <Link href="/dashboard/admin/shops/new">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Dükkan
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Dükkan ara..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] py-3 px-4 text-sm font-medium">
              <div>Dükkan Adı</div>
              <div className="hidden md:block">Konum</div>
              <div className="hidden md:block">Durum</div>
              <div className="text-right">İşlemler</div>
            </div>
            <div className="divide-y">
              {loading ? (
                <div className="py-12 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Dükkanlar yükleniyor...</p>
                </div>
              ) : filteredShops.length > 0 ? (
                filteredShops.map((shop) => (
                  <div key={shop.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] items-center py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <div className="font-medium">{shop.name}</div>
                    </div>
                    <div className="hidden md:block text-sm text-muted-foreground">{shop.address || shop.location || "Belirtilmemiş"}</div>
                    <div className="hidden md:block">
                      <div
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          shop.status?.toLowerCase() === "inactive"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        }`}
                      >
                        {shop.status?.toLowerCase() === "inactive" ? "Pasif" : "Aktif"}
                      </div>
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
                            <Link href={`/dashboard/admin/shops/${shop.id}`}>Görüntüle</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/admin/shops/${shop.id}/edit`}>Düzenle</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Sil</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {searchTerm ? "Arama kriterine uyan sonuç bulunamadı." : "Henüz hiç dükkan eklenmemiş."}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
