// features/auth/providers/auth-provider.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import useUserStore from "@/app/stores/userStore"

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
  provider?: string | null
  googleMetadata?: any
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
  const { setAuthUser, setDbUser: setStoreDbUser, clearUser, setLoading: setStoreLoading } = useUserStore()

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
      
      // Auth user kontrolü ve Google ile giriş kontrolü
      // Session artık güncel olmayabilir, bu nedenle currentSession'ı da kontrol edelim
      let currentAuthSession = null;
      try {
        // Mevcut auth oturumunu al
        const { data } = await supabase.auth.getSession();
        currentAuthSession = data.session;
      } catch (err) {
        console.error('Oturum bilgisi alınamadı:', err);
      }
      
      // Kontrol için belirli bir sırayla ilerle
      // 1. Mevcut oturumdan kontrol
      // 2. Aktif user state'inden kontrol
      // 3. Hiçbiri yoksa varsayılan olarak false döndür
      const authUser = currentAuthSession?.user || user;
      
      const isGoogleAuth = 
        (authUser?.app_metadata?.provider === 'google') || 
        (userData?.provider === 'google');
      
      // Google meta verileri için birkaç yerden kontrol
      const googleMetadata = 
        authUser?.user_metadata || 
        (isGoogleAuth ? userData?.googleMetadata : null);
      
      console.log('Auth Provider - fetchUserDetails (Güncellenmiş):', {
        userId,
        isGoogleAuth,
        authUser: !!authUser,
        currentSession: !!currentAuthSession,
        hasAppMetadata: !!authUser?.app_metadata,
        hasUserMetadata: !!authUser?.user_metadata,
        googleMetadataSource: authUser?.user_metadata ? 'authUser.user_metadata' : 
                              userData?.googleMetadata ? 'userData.googleMetadata' : 'none'
      });
      
      // Google meta verilerinden isim bilgilerini daha iyi çıkar
      let enhancedGoogleMetadata = null;
      
      if (isGoogleAuth && googleMetadata) {
        enhancedGoogleMetadata = {
          ...googleMetadata,
          // Eğer given_name yoksa ancak name varsa, ilk kelimeyi given_name olarak kullan
          given_name: googleMetadata.given_name || 
            (googleMetadata.name ? googleMetadata.name.split(' ')[0] : null),
          
          // Eğer family_name yoksa ancak name birden fazla kelimeden oluşuyorsa, 
          // ilk kelimeden sonrasını family_name olarak kullan
          family_name: googleMetadata.family_name || 
            (googleMetadata.name && googleMetadata.name.includes(' ') ? 
              googleMetadata.name.split(' ').slice(1).join(' ') : null)
        };
        
        console.log('Google meta verileri iyileştirildi:', enhancedGoogleMetadata);
      }
      
      // Yanıt alınamasa bile hata üretme
      if (userData) {
        setDbUser(userData);
        // Zustand store'a, DbUser tipine uygun olarak ekle
        setStoreDbUser({
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          // role özellikle Enum değerleri ile eşleştirilmeli
          role: userData.role as "CUSTOMER" | "BARBER" | "EMPLOYEE" | "ADMIN",
          profileImage: userData.profileImage,
          isActive: userData.isActive,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
          // Google meta verilerini ekle (varsa)
          provider: isGoogleAuth ? 'google' : null,
          googleMetadata: enhancedGoogleMetadata
        });
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
        
        // Zustand store'a, DbUser tipine uygun olarak ekle
        setStoreDbUser({
          id: defaultUser.id,
          email: defaultUser.email,
          firstName: defaultUser.firstName,
          lastName: defaultUser.lastName,
          phone: defaultUser.phone,
          // role özellikle Enum değerleri ile eşleştirilmeli 
          role: (defaultUser.role as "CUSTOMER" | "BARBER" | "EMPLOYEE" | "ADMIN"),
          profileImage: defaultUser.profileImage,
          isActive: defaultUser.isActive,
          createdAt: defaultUser.createdAt,
          updatedAt: defaultUser.updatedAt,
          // Google meta verilerini ekle (varsa)
          provider: isGoogleAuth ? 'google' : null,
          googleMetadata: enhancedGoogleMetadata
        });
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
        
        if (sessionError) throw sessionError

        if (mounted) {
          if (data.session) {
            setSession(data.session)
            setUser(data.session.user)
            
            // Zustand store'a auth user'ı da ekle
            setAuthUser(data.session.user)
            
            // Oturum varsa DB'den kullanıcı bilgilerini getir
            const userDetails = await fetchUserDetails(data.session.user.id)
            
            // Kullanıcı detaylarını zaten fetchUserDetails içinde Zustand store'a ekliyoruz
          }
          setLoading(false)
          setStoreLoading(false)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Auth initialization failed'))
          console.error('Auth initialization error:', err)
          setLoading(false)
          setStoreLoading(false)
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
              // Zustand store'a auth user'ı ekle
              setAuthUser(currentSession.user)
              
              // Google ile giriş kontrolü
              const isGoogleAuth = currentSession.user.app_metadata?.provider === 'google';
              
              // Debug için Google meta verilerini kontrol et
              console.log('Auth State Change - Google Giriş Kontrolü:', {
                isGoogleAuth,
                appMetadata: currentSession.user.app_metadata,
                userMetadata: currentSession.user.user_metadata,
                email: currentSession.user.email
              });
              
              // API'dan kullanıcı verilerini getir
              const userDetails = await fetchUserDetails(currentSession.user.id)
              
              if (userDetails) {
                // Google meta verilerini ekle ve store'a kaydet
                if (isGoogleAuth && currentSession.user.user_metadata) {
                  // Daha gelişmiş Google meta veri işleme
                  const metadata = currentSession.user.user_metadata;
                  
                  // Google verilerini zenginleştir
                  const enhancedMetadata = {
                    ...metadata,
                    // Eğer given_name yoksa ancak name varsa, ilk kelimeyi given_name olarak kullan
                    given_name: metadata.given_name || 
                      (metadata.name ? metadata.name.split(' ')[0] : null),
                    
                    // Eğer family_name yoksa ancak name birden fazla kelimeden oluşuyorsa, 
                    // ilk kelimeden sonrasını family_name olarak kullan
                    family_name: metadata.family_name || 
                      (metadata.name && metadata.name.includes(' ') ? 
                        metadata.name.split(' ').slice(1).join(' ') : null)
                  };
                  
                  console.log('Zenginleştirilmiş Google Metaverisi:', enhancedMetadata);
                  
                  const updatedUser = {
                    ...userDetails,
                    provider: 'google',
                    googleMetadata: enhancedMetadata,
                    // Google profil resmini kullan (eğer kullanıcı DB'de profil resmi yoksa)
                    profileImage: userDetails.profileImage || metadata.picture || null
                  };
                  setStoreDbUser(updatedUser as any);
                } else {
                  setStoreDbUser(userDetails as any);
                }
              } else {
                // Kullanıcı DB'de bulunamadıysa
                // Google meta verilerinden varsayılan bir kullanıcı oluştur
                if (isGoogleAuth && currentSession.user.user_metadata) {
                  const metadata = currentSession.user.user_metadata;
                  
                  // Debug için metadata içeriğini kontrol et
                  console.log('Google Meta Verileri (Kullanıcı DB\'de bulunamadı):', metadata);
                  
                  // Ad ve soyad için Google metadata kontrolü
                  const firstName = metadata.given_name || metadata.name?.split(' ')[0] || null;
                  const lastName = metadata.family_name || 
                    (metadata.name && metadata.name.includes(' ') ? 
                      metadata.name.split(' ').slice(1).join(' ') : null);
                  
                  // Zenginleştirilmiş meta verileri oluştur
                  const enhancedMetadata = {
                    ...metadata,
                    given_name: firstName,
                    family_name: lastName
                  };
                  
                  const defaultUser = {
                    id: currentSession.user.id,
                    email: currentSession.user.email || '',
                    firstName: firstName,
                    lastName: lastName,
                    phone: currentSession.user.phone || null,
                    role: 'CUSTOMER',
                    isActive: true,
                    profileImage: metadata.picture || null,
                    provider: 'google',
                    googleMetadata: enhancedMetadata,
                    createdAt: new Date(),
                    updatedAt: new Date()
                  };
                  
                  console.log('Oluşturulan varsayılan Google kullanıcısı:', defaultUser);
                  
                  setStoreDbUser(defaultUser as any);
                }
              }
              
              // Debug için konsola bilgileri yazdır
              if (isGoogleAuth) {
                console.log('Google Kullanıcı Bilgileri:', currentSession.user.user_metadata);
              }
            }
            router.refresh() // Sayfayı yenile
          } else if (event === 'SIGNED_OUT') {
            // Zustand store'daki kullanıcı bilgilerini temizle
            clearUser()
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
  }, [router, supabase, setAuthUser, setStoreDbUser, clearUser, setStoreLoading])

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