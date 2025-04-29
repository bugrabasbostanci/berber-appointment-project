"use client"

import { createClient } from "@/lib/supabase/client"
import type React from "react"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Icons } from "@/features/shared/components/icons"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff } from "lucide-react"

export function ResetPasswordForm({
  className,
  token,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { token: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  // Token geldiğinde oturumun hala geçerli olup olmadığını kontrol et
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error || !data.session) {
        toast({
          title: "Oturum süresi dolmuş",
          description: "Lütfen şifre sıfırlama işlemini tekrar başlatın",
          variant: "destructive",
        })
        router.push('/forgot-password')
      }
    }
    
    checkSession()
  }, [router, supabase, toast])

  // Form tanımlama
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  // Form gönderimi
  const onSubmit = async (data: ResetPasswordValues) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: data.password 
      })
      
      if (error) throw error

      toast({
        title: "Şifreniz başarıyla sıfırlandı",
        description: "Yeni şifrenizle giriş yapabilirsiniz",
        variant: "default",
      })

      // Oturumu kapat ve giriş sayfasına yönlendir
      await supabase.auth.signOut()
      router.push("/login")
    } catch (error) {
      console.error("Şifre sıfırlama hatası:", error)
      toast({
        title: "Şifre sıfırlama başarısız",
        description: "Bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Şifrenizi Sıfırlayın</CardTitle>
          <CardDescription>Lütfen yeni şifrenizi belirleyin</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yeni Şifre</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} {...field} disabled={isLoading} />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={togglePasswordVisibility}
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          )}
                          <span className="sr-only">{showPassword ? "Şifreyi gizle" : "Şifreyi göster"}</span>
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şifre Tekrarı</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showConfirmPassword ? "text" : "password"} {...field} disabled={isLoading} />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={toggleConfirmPasswordVisibility}
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          )}
                          <span className="sr-only">{showConfirmPassword ? "Şifreyi gizle" : "Şifreyi göster"}</span>
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "İşleniyor..." : "Şifreyi Sıfırla"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
