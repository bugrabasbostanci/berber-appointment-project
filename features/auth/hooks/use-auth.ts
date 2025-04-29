// features/auth/hooks/use-auth.ts
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
          const res = await fetch(`/api/users/${user.id}`)
          if (res.ok) {
            const data = await res.json()
            setDbUser(data)
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