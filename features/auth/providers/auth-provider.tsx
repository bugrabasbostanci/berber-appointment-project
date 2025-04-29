// features/auth/providers/auth-provider.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

// Prisma User tipini içe aktar (db'deki kullanıcı modeli)
type PrismaUser = {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: string
  profileImage: string | null
  phone: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

type AuthContextType = {
  user: User | null
  session: Session | null
  loading: boolean
  error: Error | null
  dbUser: PrismaUser | null // Veritabanından gelen kullanıcı bilgileri
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  error: null,
  dbUser: null
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [dbUser, setDbUser] = useState<PrismaUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Veritabanından kullanıcı bilgilerini getir
  const fetchUserDetails = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`)
      
      // API'dan gelen tüm yanıtları almaya çalış
      let userData: PrismaUser | null = null;
      
      try {
        const data = await response.json();
        if (data && data.id) {
          userData = data;
        }
      } catch (parseError) {
        console.error('API yanıtı JSON olarak ayrıştırılamadı:', parseError);
      }
      
      // Yanıt alınamasa bile hata üretme
      if (userData) {
        setDbUser(userData);
      } else {
        // Varsayılan kullanıcı bilgileri oluştur
        const defaultUser: PrismaUser = {
          id: userId,
          email: user?.email || '',
          firstName: null,
          lastName: null,
          role: user?.user_metadata?.role || 'CUSTOMER',
          profileImage: null,
          phone: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setDbUser(defaultUser);
      }
      
      return userData;
    } catch (err) {
      console.error('Kullanıcı bilgileri getirme hatası:', err);
      // Auth akışını bozmamak için null döndür
      return null;
    }
  }

  useEffect(() => {
    let mounted = true

    // İlk yüklemede mevcut session'ı kontrol et
    const initializeAuth = async () => {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          throw sessionError
        }

        if (mounted) {
          if (data.session) {
            setSession(data.session)
            setUser(data.session.user)
            
            // Oturum varsa DB'den kullanıcı bilgilerini getir
            const userDetails = await fetchUserDetails(data.session.user.id)
            
            // Kullanıcı detayları alınamasa bile auth işlemi devam eder
            // Kullanıcı henüz kayıt olmuş ve profili tamamlamamış olabilir
            if (!userDetails) {
              console.log('Kullanıcı profil bilgileri yüklenemedi, ancak oturum açma işlemi tamamlandı')
            }
          }
          setLoading(false)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Auth initialization failed'))
          console.error('Auth initialization error:', err)
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (mounted) {
          setSession(currentSession)
          setUser(currentSession?.user ?? null)
          setError(null) // Yeni oturum durumunda hata state'ini sıfırla
          
          // Oturum durumu değiştiğinde gerekli işlemler
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (currentSession?.user) {
              // Kullanıcı giriş yaptığında veya token yenilendiğinde DB'den bilgileri getir
              const userDetails = await fetchUserDetails(currentSession.user.id)
              
              // Kullanıcı detayları alınamasa bile auth işlemi devam eder
              if (!userDetails) {
                console.log('Kullanıcı profil bilgileri yüklenemedi, ancak oturum açma işlemi tamamlandı')
              }
            }
            router.refresh() // Sayfayı yenile
          } else if (event === 'SIGNED_OUT') {
            // Oturum kapatıldığında DB kullanıcı bilgilerini temizle
            setDbUser(null)
            router.push('/login') // Çıkış yapıldığında login sayfasına yönlendir
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [router, supabase])

  const value = {
    user,
    session,
    loading,
    error,
    dbUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}