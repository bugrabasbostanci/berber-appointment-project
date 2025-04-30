"use client"

import { createClient } from "@/lib/supabase/client"
import type React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { registerFormSchema, type RegisterFormValues } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Icons } from "@/features/shared/components/icons"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function RegisterForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [existingAccountError, setExistingAccountError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  // Form tanımlama
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Form gönderimi
  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true)
    setExistingAccountError(null)

    try {
      // Supabase Auth ile kullanıcı kaydı
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          // Email doğrulama için
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard/customer`,
          // Kullanıcı meta verileri
          data: {
            role: 'customer' // Varsayılan olarak müşteri rolü
          }
        }
      })

      // Hata kontrolü ve kullanıcı dostu mesajlar
      if (error) {
        if (error.message.includes("already registered")) {
          setExistingAccountError(data.email)
          return
        }
        throw error
      }

      // Supabase Auth kaydından sonra Prisma'da kullanıcı oluştur
      if (authData?.user) {
        try {
          // Oturum bilgilerini güncelle
          await fetch('/api/auth/session')
        } catch (dbError) {
          console.error("Veritabanı senkronizasyon hatası:", dbError)
          // Bu hata kullanıcı deneyimini engellemeyeceği için, toast bildirimi gösterme
        }
      }

      toast({
        title: 'Kayıt başarılı!',
        description: 'Lütfen e-posta adresinizi kontrol edin ve hesabınızı doğrulayın.',
      })

      // Kullanıcıyı giriş sayfasına yönlendir
      router.push('/login')
    } catch (error) {
      console.error('Kayıt hatası:', error)
      toast({
        title: 'Kayıt başarısız',
        description: error instanceof Error ? error.message : 'Kayıt sırasında bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Varolan hesaba giriş yapmak için yönlendirme
  const handleExistingAccountLogin = () => {
    router.push(`/login?email=${encodeURIComponent(form.getValues("email"))}`)
  }

  // Şifremi unuttum sayfasına yönlendirme
  const handleForgotPassword = () => {
    router.push(`/forgot-password?email=${encodeURIComponent(form.getValues("email"))}`)
  }

  // Google ile kayıt
  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error

      // Google yönlendirmesi ile işlem devam edecek
    } catch (error) {
      console.error("Google kayıt hatası:", error)
      toast({
        title: "Google ile kayıt başarısız",
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
          <CardTitle className="text-xl">Hesap oluşturun</CardTitle>
          <CardDescription>Google hesabınızla veya e-posta ile kayıt olun</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {existingAccountError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Bu e-posta adresi zaten kayıtlı</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">
                    {existingAccountError} adresi ile bir hesap zaten bulunmaktadır.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExistingAccountLogin}
                      className="w-full"
                    >
                      Giriş yap
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleForgotPassword}
                      className="w-full"
                    >
                      Şifremi unuttum
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Button
              variant="outline"
              className="w-full"
              type="button"
              disabled={isLoading}
              onClick={handleGoogleSignUp}
            >
              <Icons.google className="mr-2 h-4 w-4" />
              Google ile kayıt ol
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
                      <FormLabel>Şifre</FormLabel>
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
                  {isLoading ? "İşleniyor..." : "Kayıt Ol"}
                </Button>
              </form>
            </Form>


            <div className="text-center text-sm">
              Zaten bir hesabınız var mı?{" "}
              <Link href="/login" className="underline underline-offset-4">
                Giriş yap
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
