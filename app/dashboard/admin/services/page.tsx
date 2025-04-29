import { Metadata } from "next";
import { ServiceForm } from "@/features/services/components/ServiceForm";
import { getAllServices } from "@/lib/services/serviceService";

export const metadata: Metadata = {
  title: "Hizmet Yönetimi - Admin Paneli",
  description: "Berber randevu sistemi hizmet yönetimi",
};

export default async function ServicesAdminPage() {
  const services = await getAllServices();

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Hizmet Yönetimi</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Yeni Hizmet Ekle</h2>
          <ServiceForm />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Mevcut Hizmetler</h2>
          <div className="space-y-4">
            {services && services.length > 0 ? (
              services.map((service) => (
                <div
                  key={service.id}
                  className="p-4 border rounded-md shadow-sm"
                >
                  <h3 className="font-medium">{service.name}</h3>
                  {service.description && (
                    <p className="text-muted-foreground text-sm mt-1">
                      {service.description}
                    </p>
                  )}
                  <p className="text-muted-foreground text-xs mt-2">
                    ID: {service.id}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">Henüz hizmet bulunmuyor.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
