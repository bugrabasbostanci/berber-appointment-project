import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
 // -- GELİŞTİRME ORTAMINDA middleware’i tamamen pas geç
 if (process.env.NODE_ENV === "development") {
  return NextResponse.next()
}

  const { supabase, response } = createClient(request)

  // Kullanıcı oturum bilgisini al
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Korumalı rotalar için kontrol
  const protectedRoutes = ["/dashboard"]
  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // Auth sayfaları için kontrol
  const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"]
  const isAuthRoute = authRoutes.some((route) => request.nextUrl.pathname === route)

  // Korumalı rotaya erişim kontrolü
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/unauthorized", request.url))
  }

  // Oturum açmış kullanıcı auth sayfalarına erişim kontrolü
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return response
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/forgot-password", "/reset-password", "/unauthorized"],
}
