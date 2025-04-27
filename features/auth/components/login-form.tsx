"use client"

import type React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { loginFormSchema, type LoginFormValues } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Icons } from "@/features/shared/components/icons"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Form tanımlama
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Form gönderimi - Supabase entegrasyonu için hazır
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    try {
      // Burada Supabase Auth entegrasyonu yapılacak
      // Örnek: await supabase.auth.signInWithPassword({ email: data.email, password: data.password })
      console.log("Giriş verileri:", data)

      // Simüle edilmiş API gecikmesi - gerçek implementasyonda kaldırılacak
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Giriş başarılı!",
        description: "Hoş geldiniz, yönlendiriliyorsunuz...",
        variant: "default",
      })

      // Başarılı giriş sonrası yönlendirme
      // router.push("/dashboard/customer")
    } catch (error) {
      console.error("Giriş hatası:", error)
      toast({
        title: "Giriş başarısız",
        description: "E-posta veya şifre hatalı. Lütfen tekrar deneyin.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Google ile giriş - Supabase entegrasyonu için hazır
  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      // Burada Supabase Auth Google entegrasyonu yapılacak
      // Örnek: await supabase.auth.signInWithOAuth({ provider: 'google' })
      console.log("Google ile giriş yapılıyor")

      // Simüle edilmiş API gecikmesi - gerçek implementasyonda kaldırılacak
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error("Google giriş hatası:", error)
      toast({
        title: "Google ile giriş başarısız",
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
          <CardTitle className="text-xl">Tekrar hoş geldiniz</CardTitle>
          <CardDescription>E-posta ile veya Google hesabınızla giriş yapın</CardDescription>
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
                      <div className="flex items-center justify-between">
                        <FormLabel>Şifre</FormLabel>
                        <Link href="/auth/forgot-password" className="text-sm underline-offset-4 hover:underline">
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

            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-background px-2 text-muted-foreground">Veya</span>
            </div>

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

            <div className="text-center text-sm">
              Hesabınız yok mu?{" "}
              <Link href="/auth/register" className="underline underline-offset-4">
                Kayıt ol
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
