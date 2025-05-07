import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Yanıt nesnesini oluştur
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Supabase istemcisini oluştur
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Oturumu yenile (bu otomatik token yenilemesini sağlar)
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Korumalı rotalar için kontrol
  if (request.nextUrl.pathname.startsWith("/dashboard") && !session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Kullanıcı giriş yapmışsa auth sayfalarına erişimi engelle
  if (
    (request.nextUrl.pathname.startsWith("/login") ||
      request.nextUrl.pathname.startsWith("/register")) &&
    session
  ) {
    // Kullanıcı rolüne göre yönlendirme
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const userRole = (user?.user_metadata?.role || "customer").toLowerCase();

    return NextResponse.redirect(new URL(`/dashboard/${userRole}`, request.url))
  }

  return response
}