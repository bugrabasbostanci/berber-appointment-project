"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Service } from "@prisma/client";

type ServiceFormProps = {
  service?: Service;
  onSuccess?: () => void;
};

type FormValues = {
  name: string;
  description: string;
};

export function ServiceForm({ service, onSuccess }: ServiceFormProps) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: service ? {
      name: service.name,
      description: service.description || ""
    } : {
      name: "",
      description: ""
    }
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const url = service ? `/api/services` : '/api/services';
      const method = service ? 'PUT' : 'POST';
      const body = service ? JSON.stringify({ id: service.id, ...data }) : JSON.stringify(data);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Hizmet ${service ? 'güncellenirken' : 'eklenirken'} bir hata oluştu`);
      }

      toast.success(`Hizmet başarıyla ${service ? 'güncellendi' : 'eklendi'}`);
      
      if (!service) {
        reset();
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error(`Hizmet ${service ? 'güncellenirken' : 'eklenirken'} hata:`, error);
      toast.error((error as Error).message || `Hizmet ${service ? 'güncellenirken' : 'eklenirken'} bir hata oluştu`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          id="name"
          placeholder="Hizmet Adı"
          {...register("name", { required: "Hizmet adı gereklidir" })}
          aria-invalid={errors.name ? "true" : "false"}
        />
        {errors.name && (
          <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Textarea
          id="description"
          placeholder="Hizmet Açıklaması"
          {...register("description")}
          className="min-h-[100px]"
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? (service ? "Güncelleniyor..." : "Ekleniyor...") : (service ? "Güncelle" : "Hizmet Ekle")}
      </Button>
    </form>
  );
}
