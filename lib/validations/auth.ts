import * as z from "zod"

// Kayıt formu şeması
export const registerFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: "E-posta adresi boş bırakılamaz" })
    .email({ message: "Lütfen geçerli bir e-posta adresi giriniz" }),
  password: z
    .string()
    .min(8, { message: "Şifreniz en az 8 karakter uzunluğunda olmalıdır" })
    .max(100, { message: "Şifreniz 100 karakterden uzun olamaz" }),
})

// Giriş formu şeması
export const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: "E-posta adresi boş bırakılamaz" })
    .email({ message: "Lütfen geçerli bir e-posta adresi giriniz" }),
  password: z.string().min(1, { message: "Şifre boş bırakılamaz" }),
})

// Şifremi unuttum formu şeması
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "E-posta adresi boş bırakılamaz" })
    .email({ message: "Lütfen geçerli bir e-posta adresi giriniz" }),
})

// Şifre sıfırlama formu şeması
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Şifreniz en az 8 karakter uzunluğunda olmalıdır" })
      .max(100, { message: "Şifreniz 100 karakterden uzun olamaz" }),
    confirmPassword: z.string().min(1, { message: "Şifre tekrarı boş bırakılamaz" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  })


// Form değerleri tipleri
export type RegisterFormValues = z.infer<typeof registerFormSchema>
export type LoginFormValues = z.infer<typeof loginFormSchema>
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>
