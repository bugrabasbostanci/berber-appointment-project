"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type ServiceFormProps = {
  onSuccess?: () => void;
};

type FormValues = {
  name: string;
  description: string;
};

export function ServiceForm({ onSuccess }: ServiceFormProps) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Hizmet eklenirken bir hata oluştu');
      }

      toast.success('Hizmet başarıyla eklendi');
      reset();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Hizmet eklenirken hata:', error);
      toast.error((error as Error).message || 'Hizmet eklenirken bir hata oluştu');
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
        {loading ? "Ekleniyor..." : "Hizmet Ekle"}
      </Button>
    </form>
  );
}
