"use client"

import { createClient } from "@/lib/supabase/client"
import type React from "react"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"
import { loginFormSchema, type LoginFormValues } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Icons } from "@/features/shared/components/icons"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"
import useUserStore from "@/app/stores/userStore"

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [redirectMessage, setRedirectMessage] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const supabase = createClient()

  // URL'den email parametresini al
  const emailFromURL = searchParams.get("email")

  // Form tanımlama
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: emailFromURL || "",
      password: "",
    },
  })

  // URL'den email parametresi değiştiğinde formu güncelle
  useEffect(() => {
    if (emailFromURL) {
      form.setValue("email", emailFromURL)
      setRedirectMessage("Bu e-posta adresi ile zaten bir hesabınız var. Lütfen giriş yapın.")
    }
  }, [emailFromURL, form])

  // Form gönderimi
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email: data.email, 
        password: data.password 
      })
      
      if (error) throw error

      toast({
        title: "Giriş başarılı!",
        description: "Hoş geldiniz, yönlendiriliyorsunuz...",
        variant: "default",
      })

      // Başarılı giriş sonrası yönlendirme
      router.push("/dashboard/customer")
      // Supabase client tarafında oturum değişikliği dinleniyor olacak
      // Bu muhtemelen auth-provider.tsx içindeki useEffect'te zaten yapıldı
    } catch (error) {
      console.error("Giriş hatası:", error)
      
      let errorMessage = "E-posta veya şifre hatalı. Lütfen tekrar deneyin."
      
      if (error instanceof Error) {
        // Özel hata mesajları için kontrol
        if (error.message.includes("Email not confirmed")) {
          errorMessage = "E-posta adresiniz henüz doğrulanmamış. Lütfen e-postanızı kontrol edin."
        } else if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Geçersiz giriş bilgileri. E-posta veya şifre hatalı."
        }
      }
      
      toast({
        title: "Giriş başarısız",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Google ile giriş
  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({ 
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
          
        }
      })
      
      if (error) throw error
      
      // Google yönlendirmesi ile işlem devam edecek, toast gösterilmeyecek
    } catch (error) {
      console.error("Google giriş hatası:", error)
      toast({
        title: "Google ile giriş başarısız",
        description: "Bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Tekrar hoş geldiniz</CardTitle>
          <CardDescription>Google hesabınızla veya e-posta ile giriş yapın</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <Button
              variant="outline"
              className="w-full"
              type="button"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
            >
              <Icons.google className="mr-2 h-4 w-4" />
              Google ile giriş yap
            </Button>

            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-background px-2 text-muted-foreground">Veya</span>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-posta</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="m@example.com" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Şifre</FormLabel>
                        <Link href="/forgot-password" className="text-sm underline-offset-4 hover:underline">
                          Şifrenizi mi unuttunuz?
                        </Link>
                      </div>
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

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
                </Button>
              </form>
            </Form>

            <div className="text-center text-sm">
              Hesabınız yok mu?{" "}
              <Link href="/register" className="underline underline-offset-4">
                Kayıt ol
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
