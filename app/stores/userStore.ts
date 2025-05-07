import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { User as SupabaseUser } from "@supabase/supabase-js";

// Google meta verilerini içeren tip tanımı (Auth User'dan gelecek)
type GoogleMetadata = {
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email?: string;
  email_verified?: boolean;
  locale?: string;
  sub?: string;
  [key: string]: any;
}

// Veritabanındaki kullanıcı modeli (provider eklendi)
type DbUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: "CUSTOMER" | "BARBER" | "EMPLOYEE" | "ADMIN";
  provider?: string | null; // Sağlayıcı bilgisi eklendi
  profileImage?: string | null;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

interface UserState {
  authUser: SupabaseUser | null;
  dbUser: DbUser | null;
  loading: boolean;
  isAuthenticated: boolean;

  setAuthUser: (user: SupabaseUser | null) => void;
  setDbUser: (user: DbUser | null) => void;
  setLoading: (loading: boolean) => void;

  getFullName: () => string;
  getInitials: () => string;
  hasRole: (role: string) => boolean;
  clearUser: () => void;
  getProfileImage: () => string | null;
  isGoogleUser: () => boolean;
  getGoogleData: () => GoogleMetadata | null;
}

const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      authUser: null,
      dbUser: null,
      loading: true,
      isAuthenticated: false,

      setAuthUser: (user) => {
        console.log("setAuthUser çağrıldı:", user);
        set({
          authUser: user,
          isAuthenticated: !!user,
        });
      },

      setDbUser: (user: DbUser | null) => {
         console.log("setDbUser çağrıldı:", user);
         set({
            dbUser: user, 
         });
      },

      setLoading: (loading) => set({
        loading,
      }),

      isGoogleUser: () => {
        const { dbUser } = get();
        const isGoogle = dbUser?.provider === "google";
        console.log('isGoogleUser Kontrolü (dbUser):', { provider: dbUser?.provider, isGoogle });
        return isGoogle;
      },
      
      getGoogleData: () => {
        const { authUser } = get();
        if (authUser?.app_metadata?.provider === "google" && authUser?.user_metadata) {
           return authUser.user_metadata as GoogleMetadata;
        }
        return null;
      },

      getFullName: () => {
        const { dbUser } = get();
        const isGoogle = get().isGoogleUser();
        const googleData = get().getGoogleData();

        if (dbUser?.firstName || dbUser?.lastName) {
          return `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim();
        }
        if (isGoogle && googleData) {
          if (googleData.name) return googleData.name;
          if (googleData.given_name || googleData.family_name) {
            return `${googleData.given_name || ''} ${googleData.family_name || ''}`.trim();
          }
        }
        if (dbUser?.email) {
           const emailUsername = dbUser.email.split("@")[0] || "";
            if (emailUsername.includes('.') || emailUsername.includes('_')) {
              return emailUsername
                .replace(/[._]/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            }
           return emailUsername;
        }
        if (get().authUser?.email) {
          return get().authUser!.email!.split("@")[0] || "";
        }
        return "Kullanıcı";
      },

      getInitials: () => {
        const { dbUser } = get();
        const isGoogle = get().isGoogleUser();
        const googleData = get().getGoogleData();

        if (dbUser?.firstName && dbUser?.lastName) {
          return `${dbUser.firstName.charAt(0)}${dbUser.lastName.charAt(0)}`.toUpperCase();
        }
        if (dbUser?.firstName) return dbUser.firstName.charAt(0).toUpperCase();
        if (dbUser?.lastName) return dbUser.lastName.charAt(0).toUpperCase();

        if (isGoogle && googleData) {
          if (googleData.given_name && googleData.family_name) {
             return `${googleData.given_name.charAt(0)}${googleData.family_name.charAt(0)}`.toUpperCase();
          }
          if (googleData.name) {
            const nameParts = googleData.name.split(" ");
            if (nameParts.length >= 2) {
              return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
            }
             if (nameParts[0]) return nameParts[0].charAt(0).toUpperCase();
          }
          if (googleData.given_name) return googleData.given_name.charAt(0).toUpperCase();
          if (googleData.family_name) return googleData.family_name.charAt(0).toUpperCase();
        }

        const email = dbUser?.email || get().authUser?.email || "";
        const username = email.split('@')[0];
        if (username.length >= 2) {
          return username.substring(0, 2).toUpperCase();
        }
        if (username.length === 1) {
          return username.toUpperCase();
        }

        return "?";
      },

      hasRole: (role) => {
        const { dbUser } = get();
        return dbUser?.role === role;
      },

      clearUser: () => set({
        authUser: null,
        dbUser: null,
        isAuthenticated: false,
      }),

      getProfileImage: () => {
         const { dbUser } = get();
         const isGoogle = get().isGoogleUser();
         const googleData = get().getGoogleData();

         if (dbUser?.profileImage) return dbUser.profileImage;
         if (isGoogle && googleData?.picture) return googleData.picture;

         return null;
      },

    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        dbUser: state.dbUser,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useUserStore;


