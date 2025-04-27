"use client"

import { useState } from "react"
import { Search, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for customers
const mockCustomers = [
  {
    id: "1",
    name: "Ahmet Yılmaz",
    phone: "+90 555 123 4567",
    email: "ahmet.yilmaz@example.com",
    status: "Aktif",
    lastVisit: "15 Nisan 2023",
  },
  {
    id: "2",
    name: "Mehmet Kaya",
    phone: "+90 555 234 5678",
    email: "mehmet.kaya@example.com",
    status: "Aktif",
    lastVisit: "3 Mayıs 2023",
  },
  {
    id: "3",
    name: "Ayşe Demir",
    phone: "+90 555 345 6789",
    email: "ayse.demir@example.com",
    status: "Pasif",
    lastVisit: "20 Şubat 2023",
  },
  {
    id: "4",
    name: "Fatma Şahin",
    phone: "+90 555 456 7890",
    email: "fatma.sahin@example.com",
    status: "Aktif",
    lastVisit: "10 Mayıs 2023",
  },
]

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // Filter customers based on search term
  const filteredCustomers = mockCustomers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()),
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
          <Select defaultValue="all">
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
      </div>
    </div>
  )
}
