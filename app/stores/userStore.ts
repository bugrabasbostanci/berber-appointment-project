import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { User as SupabaseUser } from "@supabase/supabase-js";

// Google meta verilerini içeren tip tanımı
type GoogleMetadata = {
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email?: string;
  email_verified?: boolean;
  locale?: string;
  sub?: string;
  [key: string]: any; // Diğer tüm Google meta verilerini kabul etmek için
}

// Veritabanındaki kullanıcı modeli
type DbUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: "CUSTOMER" | "BARBER" | "EMPLOYEE" | "ADMIN";
  profileImage?: string | null;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  // Google meta verileri
  googleMetadata?: GoogleMetadata | null;
  provider?: string | null; // Auth provider (google, email, vb.)
};

interface UserState {
  // Supabase auth kullanıcısı
  authUser: SupabaseUser | null;
  // Veritabanından gelen kullanıcı bilgileri
  dbUser: DbUser | null;
  // Oturum yükleniyor mu?
  loading: boolean;
  // Kullanıcı giriş yapmış mı?
  isAuthenticated: boolean;
  
  // Eylemler
  setAuthUser: (user: SupabaseUser | null) => void;
  setDbUser: (user: DbUser | null) => void;
  setLoading: (loading: boolean) => void;
  
  // Yardımcı metodlar
  getFullName: () => string;
  getInitials: () => string;
  hasRole: (role: string) => boolean;
  clearUser: () => void;
  getProfileImage: () => string | null; // Yeni metod
  isGoogleUser: () => boolean; // Yeni metod
  getGoogleData: () => GoogleMetadata | null; // Yeni metod
}

const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      authUser: null,
      dbUser: null,
      loading: true,
      isAuthenticated: false,

      setAuthUser: (user) => set({
        authUser: user,
        isAuthenticated: !!user,
      }),

      setDbUser: (user) => set({
        dbUser: user,
      }),

      setLoading: (loading) => set({
        loading,
      }),

      getFullName: () => {
        const { dbUser } = get();
        if (!dbUser) return "";
        
        // Öncelikle DB'deki isim bilgilerini kullan
        const firstName = dbUser.firstName || "";
        const lastName = dbUser.lastName || "";
        
        // DB'de isim yoksa Google meta verisine bak
        if ((!firstName || !lastName) && dbUser.googleMetadata) {
          // Google'dan gelen tam adı kullan
          if (dbUser.googleMetadata.name) {
            return dbUser.googleMetadata.name;
          }
          
          // Veya given_name ve family_name'i birleştir
          const googleFirstName = dbUser.googleMetadata.given_name || "";
          const googleLastName = dbUser.googleMetadata.family_name || "";
          
          if (googleFirstName && googleLastName) {
            return `${googleFirstName} ${googleLastName}`;
          }
          if (googleFirstName) return googleFirstName;
          if (googleLastName) return googleLastName;
        }
        
        // DB'deki isimlere geri dön
        if (firstName && lastName) return `${firstName} ${lastName}`;
        if (firstName) return firstName;
        if (lastName) return lastName;
        
        // Son çare: e-postadan kullanıcı adını çıkar
        const emailUsername = dbUser.email.split("@")[0] || "";
        
        // Eğer username noktalı veya altçizgili ise, boşlukla ayırarak her kelimenin ilk harfini büyüt
        if (emailUsername.includes('.') || emailUsername.includes('_')) {
          return emailUsername
            .replace(/[._]/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }
        
        return emailUsername;
      },

      getInitials: () => {
        const { dbUser } = get();
        if (!dbUser) return "";
        
        // Öncelikle DB'deki isim bilgilerini kullan
        const firstName = dbUser.firstName || "";
        const lastName = dbUser.lastName || "";
        
        // DB'de isim yoksa Google meta verisine bak
        if ((!firstName || !lastName) && dbUser.googleMetadata) {
          const googleFirstName = dbUser.googleMetadata.given_name || "";
          const googleLastName = dbUser.googleMetadata.family_name || "";
          
          if (googleFirstName && googleLastName) {
            return `${googleFirstName.charAt(0)}${googleLastName.charAt(0)}`.toUpperCase();
          }
          
          // Google tam adından baş harfleri al
          if (dbUser.googleMetadata.name) {
            const nameParts = dbUser.googleMetadata.name.split(" ");
            if (nameParts.length >= 2) {
              return `${nameParts[0].charAt(0)}${nameParts[nameParts.length-1].charAt(0)}`.toUpperCase();
            }
            return nameParts[0].charAt(0).toUpperCase();
          }
        }
        
        // DB'deki isimlere geri dön
        if (firstName && lastName) {
          return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
        }
        
        if (firstName) return firstName.charAt(0).toUpperCase();
        if (lastName) return lastName.charAt(0).toUpperCase();
        
        // Son çare: Mail adresini kullan
        const email = dbUser.email || "";
        
        // Gmail kullanıcılarında @ öncesindeki kısmı kullan ve ilk 2 harfi al
        const username = email.split('@')[0];
        if (username.length >= 2) {
          return username.substring(0, 2).toUpperCase();
        }
        
        return email.charAt(0).toUpperCase() || "";
      },

      hasRole: (role) => {
        const { dbUser } = get();
        if (!dbUser) return false;
        return dbUser.role === role;
      },

      clearUser: () => set({
        authUser: null,
        dbUser: null,
        isAuthenticated: false,
      }),
      
      // Yeni metodlar
      getProfileImage: () => {
        const { dbUser } = get();
        if (!dbUser) return null;
        
        // Önce DB'deki profil resmine bak
        if (dbUser.profileImage) return dbUser.profileImage;
        
        // Sonra Google profil resmini kontrol et
        if (dbUser.googleMetadata?.picture) return dbUser.googleMetadata.picture;
        
        return null;
      },
      
      isGoogleUser: () => {
        const { dbUser } = get();
        const isGoogle = dbUser?.provider === "google";
        
        // Debug için
        console.log('isGoogleUser Kontrolü:', {
          provider: dbUser?.provider,
          isGoogle,
          hasGoogleMetadata: !!dbUser?.googleMetadata
        });
        
        return isGoogle;
      },
      
      getGoogleData: () => {
        const { dbUser } = get();
        
        // Debug için
        console.log('getGoogleData Kontrolü:', {
          hasDbUser: !!dbUser,
          hasGoogleMetadata: !!dbUser?.googleMetadata,
          provider: dbUser?.provider
        });
        
        if (!dbUser) return null;
        
        // dbUser.provider = "google" ise kesinlikle Google kullanıcısı olduğunu bilerek 
        // metadata yoksa bile boş bir obje döndürelim ki UI'da sorun olmasın
        if (dbUser.provider === "google") {
          return dbUser.googleMetadata || { 
            // Varsayılan değerler eklenebilir
            email: dbUser.email,
            given_name: dbUser.firstName || '',
            family_name: dbUser.lastName || ''
          };
        }
        
        // Google kullanıcısı değilse null döndür
        return null;
      }
    }),
    {
      name: "user-storage", // localStorage'da saklanacak anahtar adı
      storage: createJSONStorage(() => localStorage),
      // Hassas bilgileri dışarıda bırak
      partialize: (state) => ({
        dbUser: state.dbUser,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useUserStore;


