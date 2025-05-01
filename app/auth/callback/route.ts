import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") || "/dashboard/customer"
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  // Hata kontrolü
  if (error) {
    console.error(`Kimlik doğrulama hatası: ${error}, ${errorDescription}`)
    return NextResponse.redirect(new URL(`/login?error=${error}&error_description=${encodeURIComponent(errorDescription || '')}`, request.url))
  }

  if (code) {
    try {
      const cookieStore = await cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get: (name: string) => {
              const cookie = cookieStore.get(name)
              return cookie?.value
            },
            set: (name: string, value: string, options: any) => {
              cookieStore.set({ name, value, ...options })
            },
            remove: (name: string, options: any) => {
              cookieStore.set({ name, value: '', ...options })
            }
          }
        }
      )
      
      // Kodu oturum için değiştir
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error("Kod değişimi hatası:", error.message)
        return NextResponse.redirect(new URL(`/login?error=exchange_error&error_description=${encodeURIComponent(error.message)}`, request.url))
      }
      
      // Kullanıcı veritabanı senkronizasyonu için API çağrısı
      if (data?.session) {
        try {
          // Önce session verilerini yazdır
          console.log("Oturum verileri:", {
            userId: data.session.user.id,
            email: data.session.user.email
          })
          
          // Prisma ile senkronizasyon için API çağrısı
          const response = await fetch(new URL('/api/auth/session', request.url), {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Cookie': cookieStore.toString()
            }
          })
          
          if (!response.ok) {
            // Hata durumunda detayları al
            const errorData = await response.json().catch(() => ({}))
            console.error("Veritabanı senkronizasyon API hatası:", {
              status: response.status,
              statusText: response.statusText,
              error: errorData
            })
            
            // Daha detaylı hata mesajı
            const errorDescription = errorData?.details || errorData?.error || `API Hatası: ${response.status} ${response.statusText}`
            return NextResponse.redirect(new URL(`/login?error=server_error&error_description=${encodeURIComponent(errorDescription)}`, request.url))
          }
          
          console.log("Veritabanı senkronizasyonu başarılı")
        } catch (syncError) {
          console.error("Veritabanı senkronizasyon hatası:", syncError instanceof Error ? syncError.message : String(syncError))
          // Bu hatayı sayfaya yönlendir
          return NextResponse.redirect(new URL(`/login?error=sync_error&error_description=${encodeURIComponent('Kullanıcı verileri senkronize edilirken bir hata oluştu')}`, request.url))
        }
      }
    } catch (e) {
      console.error("Callback işlemi hatası:", e instanceof Error ? e.message : String(e))
      return NextResponse.redirect(new URL(`/login?error=callback_error&error_description=${encodeURIComponent('Kimlik doğrulama işlemi sırasında bir hata oluştu')}`, request.url))
    }
  }

  // URL'deki next parametresine veya varsayılan olarak customer dashboard'a yönlendir
  return NextResponse.redirect(new URL(next, request.url))
} 