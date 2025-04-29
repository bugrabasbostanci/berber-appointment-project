"use client";

import { useState } from "react";
import { Service } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ServiceForm } from "./ServiceForm";

type ServiceCardProps = {
  service: Service;
  onUpdate: () => void;
};

export function ServiceCard({ service, onUpdate }: ServiceCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Bu hizmeti silmek istediğinizden emin misiniz?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/services?id=${service.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Hizmet silinirken bir hata oluştu");
      }

      toast.success("Hizmet başarıyla silindi");
      onUpdate();
    } catch (error) {
      console.error("Hizmet silinirken hata:", error);
      toast.error((error as Error).message || "Hizmet silinirken bir hata oluştu");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hizmeti Düzenle</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceForm
            service={service}
            onSuccess={() => {
              setIsEditing(false);
              onUpdate();
            }}
          />
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            İptal
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{service.name}</CardTitle>
        {service.description && (
          <CardDescription>{service.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-xs">ID: {service.id}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setIsEditing(true)}>
          Düzenle
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "Siliniyor..." : "Sil"}
        </Button>
      </CardFooter>
    </Card>
  );
}
