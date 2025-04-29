"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export const useAuth = () => {
  const [user, setUser] = useState<any>(null)
  const [dbUser, setDbUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (user?.id) {
          try {
            const res = await fetch(`/api/users/${user.id}`)
            if (res.ok) {
              const data = await res.json()
              setDbUser(data)
            } else {
              // Kullanıcı veritabanında bulunamadıysa yine de devam et
              console.warn("Kullanıcı veritabanında bulunamadı, ancak oturum açık")
              setDbUser({
                id: user.id,
                email: user.email,
                role: user.user_metadata?.role || 'customer'
              })
            }
          } catch (error) {
            console.error("Kullanıcı verileri alınırken hata:", error)
          }
        }
      } catch (error) {
        console.error("Kimlik doğrulama hatası:", error)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(true)
        getUser()
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return {
    user,
    dbUser,
    loading,
    isAuthenticated: !!user
  }
}