import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserById, getUserByEmail, createUser } from '@/lib/services/userService'
import { Role, Prisma } from '@prisma/client'

// Hata detaylarını yazdıran yardımcı fonksiyon
function logError(prefix: string, error: any) {
  console.error(`${prefix}:`, error)
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error('Prisma hata kodu:', error.code)
    console.error('Prisma hata mesajı:', error.message)
    console.error('Hedef:', error.meta)
  } else if (error instanceof Error) {
    console.error('Hata mesajı:', error.message)
    console.error('Hata yığını:', error.stack)
  } else {
    console.error('Bilinmeyen hata tipi:', typeof error)
  }
}

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
    
    try {
      // Supabase kullanıcı ID'si ile veritabanında kullanıcı ara
      const currentUser = await getUserById(session.user.id)
      
      // Eğer kullanıcı veritabanında yoksa oluştur (Supabase ile senkronizasyon)
      if (!currentUser) {
        // Supabase'den gelen email bilgisi
        const userEmail = session.user.email || ''
        
        if (!userEmail) {
          throw new Error('Kullanıcı e-posta bilgisi bulunamadı')
        }
        
        try {
          const existingUserByEmail = await getUserByEmail(userEmail)
          
          if (existingUserByEmail) {
            // E-posta adresi ile kullanıcı varsa, Supabase ID'si ile ilişkilendir
            return NextResponse.json({
              user: existingUserByEmail,
              session
            })
          }
        } catch (emailLookupError) {
          logError('E-posta ile kullanıcı arama hatası', emailLookupError)
          // Devam et, belki e-posta bulunamadı veya başka bir hata oldu
        }
        
        // Supabase'den gelen meta bilgileri
        const userMetadata = session.user.user_metadata || {}
        console.log('Kullanıcı meta bilgileri:', JSON.stringify(userMetadata))
        
        // Role değerinin doğru formatta olduğundan emin ol
        let userRole: Role = 'CUSTOMER'
        try {
          if (userMetadata.role && typeof userMetadata.role === 'string') {
            // Role enum değerinin geçerli olduğunu kontrol et
            const roleName = userMetadata.role.toUpperCase()
            if (['CUSTOMER', 'BARBER', 'EMPLOYEE', 'ADMIN'].includes(roleName)) {
              userRole = roleName as Role
            }
          }
        } catch (roleError) {
          logError('Rol dönüştürme hatası', roleError)
        }
        
        const firstName = (userMetadata.first_name as string) || null
        const lastName = (userMetadata.last_name as string) || null
        
        // Telefon bilgisi, eğer varsa
        const userPhone = session.user.phone || null
        
        try {
          console.log('Kullanıcı oluşturma isteği:', JSON.stringify({
            id: session.user.id,
            email: userEmail,
            role: userRole,
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            phone: userPhone || undefined
          }))
          
          // Kullanıcıyı veritabanında oluştur
          const newUser = await createUser({
            id: session.user.id, // Önemli: Supabase user ID'sini kullan
            email: userEmail,
            role: userRole,
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            phone: userPhone || undefined
          })
          
          console.log('Yeni kullanıcı oluşturuldu:', JSON.stringify(newUser))
          
          return NextResponse.json({
            user: newUser,
            session
          })
        } catch (createError) {
          logError('Kullanıcı oluşturma hatası', createError)
          return NextResponse.json(
            { 
              error: 'Kullanıcı oluşturulamadı', 
              details: createError instanceof Error ? createError.message : String(createError)
            },
            { status: 500 }
          )
        }
      }
      
      // Kullanıcı ve oturum bilgilerini döndür
      return NextResponse.json({
        user: currentUser,
        session
      })
    } catch (userOperationError) {
      logError('Kullanıcı işlemi hatası', userOperationError)
      return NextResponse.json(
        { 
          error: 'Kullanıcı işlemi hatası',
          details: userOperationError instanceof Error ? userOperationError.message : String(userOperationError)
        },
        { status: 500 }
      )
    }
    
  } catch (error) {
    logError('Oturum bilgileri getirilirken hata', error)
    return NextResponse.json(
      { 
        error: 'Oturum bilgileri getirilemedi',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}