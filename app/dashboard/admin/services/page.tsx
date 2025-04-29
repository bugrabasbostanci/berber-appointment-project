"use client";

import { useState, useEffect } from "react";
import { MoreHorizontal, Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Service } from "@prisma/client";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ServiceForm } from "@/features/services/components/ServiceForm";

export default function ServicesAdminPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/services');
      if (!response.ok) {
        throw new Error('Hizmetler getirilemedi');
      }
      const data = await response.json();
      setServices(data.services);
    } catch (error) {
      console.error('Hizmetler yüklenirken hata:', error);
      toast.error("Hizmetler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);
  
  const handleDelete = async (service: Service) => {
    if (!confirm("Bu hizmeti silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/services?id=${service.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Hizmet silinirken bir hata oluştu");
      }

      toast.success("Hizmet başarıyla silindi");
      fetchServices();
    } catch (error) {
      console.error("Hizmet silinirken hata:", error);
      toast.error((error as Error).message || "Hizmet silinirken bir hata oluştu");
    }
  };
  
  // Arama filtreleme
  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Sayfa başlığı */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Hizmetler</h1>
        <p className="text-muted-foreground">Sistemdeki tüm hizmetleri yönetin</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Hizmet Listesi</CardTitle>
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Hizmet
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Hizmet ara..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] py-3 px-4 text-sm font-medium">
              <div>Hizmet Adı</div>
              <div className="hidden md:block">Açıklama</div>
              <div className="text-right">İşlemler</div>
            </div>
            <div className="divide-y">
              {loading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">Yükleniyor...</div>
              ) : filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                  <div key={service.id} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] items-center py-3 px-4">
                    <div className="font-medium">{service.name}</div>
                    <div className="hidden md:block text-sm text-muted-foreground">
                      {service.description || "Açıklama yok"}
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingService(service)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(service)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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

      {/* Yeni Hizmet Ekleme Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Hizmet Ekle</DialogTitle>
            <DialogDescription>
              Sisteme eklemek istediğiniz hizmet bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <ServiceForm 
            onSuccess={() => {
              setIsAddDialogOpen(false);
              fetchServices();
            }} 
          />
        </DialogContent>
      </Dialog>

      {/* Hizmet Düzenleme Dialog */}
      <Dialog 
        open={editingService !== null} 
        onOpenChange={(open) => !open && setEditingService(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hizmeti Düzenle</DialogTitle>
            <DialogDescription>
              Hizmet bilgilerini güncelleyin.
            </DialogDescription>
          </DialogHeader>
          {editingService && (
            <ServiceForm 
              service={editingService}
              onSuccess={() => {
                setEditingService(null);
                fetchServices();
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
