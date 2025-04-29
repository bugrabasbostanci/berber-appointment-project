import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserById, getUserByEmail, createUser } from '@/lib/services/userService'
import { Role } from '@prisma/client'

// Kullanıcı oturum bilgilerini getirme ve senkronize etme
export async function GET(req: NextRequest) {
  try {
    // Supabase client oluştur
    const supabase = await createClient()
    
    // Mevcut kullanıcı oturumunu getir
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ user: null, session: null }, { status: 200 })
    }
    
    // Supabase kullanıcı ID'si ile veritabanında kullanıcı ara
    const currentUser = await getUserById(session.user.id)
    
    // Eğer kullanıcı veritabanında yoksa oluştur (Supabase ile senkronizasyon)
    if (!currentUser) {
      // Supabase'den gelen email bilgisi
      const userEmail = session.user.email || ''
      
      const existingUserByEmail = await getUserByEmail(userEmail)
      
      if (existingUserByEmail) {
        // E-posta adresi ile kullanıcı varsa, Supabase ID'si ile ilişkilendir
        return NextResponse.json({
          user: existingUserByEmail,
          session
        })
      }
      
      // Supabase'den gelen meta bilgileri
      const userMetadata = session.user.user_metadata || {}
      const userRole = (userMetadata.role as string) || 'customer'
      const firstName = (userMetadata.first_name as string) || null
      const lastName = (userMetadata.last_name as string) || null
      
      // Telefon bilgisi, eğer varsa
      const userPhone = session.user.phone || null
      
      // Kullanıcıyı veritabanında oluştur
      const newUser = await createUser({
        id: session.user.id, // Önemli: Supabase user ID'sini kullan
        email: userEmail,
        role: userRole as Role,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: userPhone || undefined,
        password: '' // Şifre alanı Supabase tarafından yönetiliyor
      })
      
      return NextResponse.json({
        user: newUser,
        session
      })
    }
    
    // Kullanıcı ve oturum bilgilerini döndür
    return NextResponse.json({
      user: currentUser,
      session
    })
    
  } catch (error) {
    console.error('Oturum bilgileri getirilirken hata:', error)
    return NextResponse.json(
      { error: 'Oturum bilgileri getirilemedi' },
      { status: 500 }
    )
  }
}