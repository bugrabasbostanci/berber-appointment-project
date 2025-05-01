"use client"

import { useState, useEffect } from "react"
import { Search, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Kullanıcı tipi tanımlaması
type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastVisit?: string;
  status: string;
}

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")

  // API'den müşteri verilerini çekme
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/users?role=CUSTOMER')
        if (!response.ok) {
          throw new Error('Müşteri verileri getirilemedi')
        }
        const data = await response.json()
        
        // API'den gelen verileri UI için uygun formata dönüştürme
        const formattedCustomers = data.users?.map((customer: any) => ({
          id: customer.id,
          name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
          email: customer.email,
          phone: customer.phone || "-",
          status: customer.profile?.isActive ? "Aktif" : "Pasif",
          lastVisit: customer.appointments?.length > 0 
            ? new Date(customer.appointments[0].date).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }) 
            : "-"
        })) || []
        
        setCustomers(formattedCustomers)
      } catch (error) {
        console.error("Müşteri verileri yüklenirken hata:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  // Arama ve durum filtreleme
  const filteredCustomers = customers.filter(
    (customer) => {
      const matchesSearch = 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = 
        statusFilter === "all" || 
        (statusFilter === "active" && customer.status === "Aktif") ||
        (statusFilter === "passive" && customer.status === "Pasif")
      
      return matchesSearch && matchesStatus
    }
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-2xl font-bold">Müşteriler</h1>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          <span>Yeni Müşteri</span>
        </Button>
      </div>

      <div className="p-4 border-b">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="İsim, telefon veya e-posta ile ara..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1) // Reset to first page on search
              }}
            />
          </div>
          <Select 
            defaultValue="all" 
            onValueChange={(value) => {
              setStatusFilter(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Müşteriler</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="passive">Pasif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p>Yükleniyor...</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">İsim</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Telefon</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">
                    E-posta
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Durum</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Son Ziyaret</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground">
                      {searchTerm ? "Arama kriterlerine uygun müşteri bulunamadı." : "Müşteri bulunamadı."}
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b">
                      <td className="p-4 align-middle font-medium">{customer.name}</td>
                      <td className="p-4 align-middle">{customer.phone}</td>
                      <td className="p-4 align-middle hidden md:table-cell">{customer.email}</td>
                      <td className="p-4 align-middle">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            customer.status === "Aktif" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
                          }`}
                        >
                          {customer.status}
                        </span>
                      </td>
                      <td className="p-4 align-middle">{customer.lastVisit}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}