import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") || "/dashboard/customer"

  if (code) {
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
    await supabase.auth.exchangeCodeForSession(code)
  }

  // URL'deki next parametresine veya varsayılan olarak customer dashboard'a yönlendir
  return NextResponse.redirect(new URL(next, request.url))
} 