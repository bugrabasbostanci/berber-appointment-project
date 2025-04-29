import { createClient } from "./client"

import type {
  LoginFormValues,
  RegisterFormValues,
  ForgotPasswordValues,
  ResetPasswordValues,
} from "../validations/auth"
import { AuthChangeEvent, Session } from "@supabase/supabase-js"

// Supabase istemcisini oluştur
const supabase = createClient()

// E-posta ve şifre ile kayıt
export async function signUpWithEmail(data: RegisterFormValues) {
  const { email, password } = data

  const { data: userData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard/customer`,
    },
  })

  if (error) throw error
  return userData
}

// E-posta ve şifre ile giriş
export async function signInWithEmail(data: LoginFormValues) {
  const { email, password } = data

  const { data: userData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return userData
}

// Google ile giriş
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/customer`, 
    },
  })

  if (error) throw error
  return data
}

// Çıkış yapma
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Şifre sıfırlama e-postası gönderme
export async function sendPasswordResetEmail(data: ForgotPasswordValues) {
  const { email } = data

  const { data: userData, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })

  if (error) throw error
  return userData
}

// Şifre sıfırlama
export async function resetPassword(data: ResetPasswordValues) {
  const { password } = data

  const { data: userData, error } = await supabase.auth.updateUser({
    password,
  })

  if (error) throw error
  return userData
}

// Mevcut kullanıcıyı alma
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) throw error
  return user
}

// Oturum durumunu dinleme
export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
}

// useAuth hook'unu yeniden export et
export { useAuth } from "@/features/auth/hooks/use-auth"
