"use client"

import { createClient } from "@/lib/supabase/client"
import type React from "react"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Icons } from "@/features/shared/components/icons"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"

export function ForgotPasswordForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // URL'den email parametresini al
  const emailFromURL = searchParams.get("email")

  // Form tanımlama
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: emailFromURL || "",
    },
  })

  // URL'den email parametresi değiştiğinde formu güncelle
  useEffect(() => {
    if (emailFromURL) {
      form.setValue("email", emailFromURL)
    }
  }, [emailFromURL, form])

  // Form gönderimi
  const onSubmit = async (data: ForgotPasswordValues) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      
      if (error) throw error

      setIsSubmitted(true)
      toast({
        title: "Şifre sıfırlama bağlantısı gönderildi",
        description: "Lütfen e-posta kutunuzu kontrol edin",
        variant: "default",
      })
    } catch (error) {
      console.error("Şifre sıfırlama hatası:", error)
      
      let errorMessage = "Bir hata oluştu. Lütfen tekrar deneyin."
      
      if (error instanceof Error) {
        // Özel hata mesajları için kontrol
        if (error.message.includes("User not found")) {
          errorMessage = "Bu e-posta adresi ile kayıtlı bir kullanıcı bulunamadı."
        }
      }
      
      toast({
        title: "Şifre sıfırlama başarısız",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Şifrenizi mi unuttunuz?</CardTitle>
          <CardDescription>E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim</CardDescription>
        </CardHeader>
        <CardContent>
          {!isSubmitted ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-posta</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="m@example.com" 
                          {...field} 
                          disabled={isLoading || !!emailFromURL}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? "Gönderiliyor..." : "Şifre Sıfırlama Bağlantısı Gönder"}
                </Button>
              </form>
            </Form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md bg-muted p-4 text-center">
                <p className="text-sm">
                  Şifre sıfırlama bağlantısı <strong>{form.getValues().email}</strong> adresine gönderildi. Lütfen
                  e-posta kutunuzu kontrol edin.
                </p>
              </div>
              <Button variant="outline" className="w-full" onClick={() => setIsSubmitted(false)}>
                Farklı bir e-posta adresi dene
              </Button>
            </div>
          )}

          <div className="mt-4 text-center text-sm">
            <Link href="/login" className="underline underline-offset-4">
              Giriş sayfasına dön
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
