"use client"

import { createClient } from "@/lib/supabase/client"
import type React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import useUserStore from "@/app/stores/userStore"

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
  const [registrationError, setRegistrationError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const { setAuthUser, setDbUser } = useUserStore()

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
    setRegistrationError(null)

    try {
      console.log('Kayıt bilgileri:', { email: data.email, password: '********' })
      
      // Önce e-posta adresi ile kayıtlı kullanıcı var mı kontrol et
      const { data: existingUser } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      }).catch(() => ({ data: null })) // Sessiz başarısız - şifre yanlış olabilir, e-posta var mı belli değil
      
      if (existingUser?.user) {
        setExistingAccountError(data.email)
        setIsLoading(false)
        return
      }
      
      // Tam callback URL'ini oluştur
      const redirectURL = new URL('/auth/callback', window.location.origin)
      // Query parametreleri ekle
      redirectURL.searchParams.append('next', '/dashboard/customer')
      
      console.log('Yönlendirme URL:', redirectURL.toString())
      
      // Supabase Auth ile kullanıcı kaydı
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          // Email doğrulama için tam URL'i belirt
          emailRedirectTo: redirectURL.toString(),
          // Kullanıcı meta verileri - Prisma şemasındaki enum değerlerini kullan
          data: {
            role: 'CUSTOMER'
          }
        }
      })

      // Hata kontrolü ve kullanıcı dostu mesajlar
      if (error) {
        console.error('Supabase kayıt hatası:', error)
        
        if (error.message.includes("already registered")) {
          setExistingAccountError(data.email)
          return
        }
        
        setRegistrationError(error.message)
        throw error
      }
      
      console.log('Kayıt cevabı:', {
        id: authData?.user?.id,
        email: authData?.user?.email,
        emailConfirm: authData?.user?.email_confirmed_at,
      })

      // Yeni kullanıcıyı store'a kaydet
      if (authData?.user) {
        setAuthUser(authData.user)
        
        // Varsayılan DB kullanıcı bilgileri
        const defaultDbUser = {
          id: authData.user.id,
          email: authData.user.email || '',
          firstName: null,
          lastName: null,
          role: 'CUSTOMER' as const,
          profileImage: null,
          phone: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        setDbUser(defaultDbUser)
      }

      // Başarılı kayıt mesajı
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

  // Google ile kayıt
  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    try {
      // Tam callback URL'ini oluştur
      const redirectURL = new URL('/auth/callback', window.location.origin)
      // Query parametreleri ekle
      redirectURL.searchParams.append('next', '/dashboard/customer')
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectURL.toString()
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

  // Varolan hesaba giriş yapmak için yönlendirme
  const handleExistingAccountLogin = () => {
    router.push(`/login?email=${encodeURIComponent(form.getValues("email"))}`)
  }

  // Şifremi unuttum sayfasına yönlendirme
  const handleForgotPassword = () => {
    router.push(`/forgot-password?email=${encodeURIComponent(form.getValues("email"))}`)
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

            {registrationError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Kayıt işlemi başarısız</AlertTitle>
                <AlertDescription>
                  <p>{registrationError}</p>
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
