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

// Telefon ile giriş formu şeması - artık kullanılmıyor
export const phoneLoginFormSchema = z.object({
  phone: z
    .string()
    .min(10, { message: "Telefon numarası 10 haneli olmalıdır" })
    .max(10, { message: "Telefon numarası 10 haneli olmalıdır" })
    .regex(/^\d+$/, { message: "Telefon numarası sadece rakamlardan oluşmalıdır" }),
})

// Telefon ile kayıt formu şeması - artık kullanılmıyor
export const phoneRegisterFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Ad soyad en az 2 karakter olmalıdır" })
    .max(50, { message: "Ad soyad en fazla 50 karakter olabilir" }),
  phone: z
    .string()
    .min(10, { message: "Telefon numarası 10 haneli olmalıdır" })
    .max(10, { message: "Telefon numarası 10 haneli olmalıdır" })
    .regex(/^\d+$/, { message: "Telefon numarası sadece rakamlardan oluşmalıdır" }),
})

// Form değerleri tipleri
export type RegisterFormValues = z.infer<typeof registerFormSchema>
export type LoginFormValues = z.infer<typeof loginFormSchema>
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>
export type PhoneLoginFormValues = z.infer<typeof phoneLoginFormSchema>
export type PhoneRegisterFormValues = z.infer<typeof phoneRegisterFormSchema>
