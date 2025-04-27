"use client"

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

export function RegisterForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Form tanımlama
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Form gönderimi - Supabase entegrasyonu için hazır
  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true)
    try {
      // Burada Supabase Auth entegrasyonu yapılacak
      // Örnek: await supabase.auth.signUp({ email: data.email, password: data.password })
      console.log("Kayıt verileri:", data)

      // Simüle edilmiş API gecikmesi - gerçek implementasyonda kaldırılacak
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Kayıt başarılı!",
        description: "Hesabınız başarıyla oluşturuldu. Lütfen e-postanızı kontrol edin.",
        variant: "default",
      })

      // Başarılı kayıt sonrası yönlendirme
      // router.push("/auth/verify-email")
    } catch (error) {
      console.error("Kayıt hatası:", error)
      toast({
        title: "Kayıt başarısız",
        description: "Bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Google ile kayıt - Supabase entegrasyonu için hazır
  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    try {
      // Burada Supabase Auth Google entegrasyonu yapılacak
      // Örnek: await supabase.auth.signInWithOAuth({ provider: 'google' })
      console.log("Google ile kayıt yapılıyor")

      // Simüle edilmiş API gecikmesi - gerçek implementasyonda kaldırılacak
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error("Google kayıt hatası:", error)
      toast({
        title: "Google ile kayıt başarısız",
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

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Hesap oluşturun</CardTitle>
          <CardDescription>E-posta ile veya Google hesabınızla kayıt olun</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
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

            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-background px-2 text-muted-foreground">Veya</span>
            </div>

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

            <div className="text-center text-sm">
              Zaten bir hesabınız var mı?{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                Giriş yap
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
