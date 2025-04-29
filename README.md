# Berber Randevu Projesi

Kullanıcıların berber randevusu alabileceği, berberlerin randevuları yönetebildiği kapsamlı bir randevu sistemi.

## Teknoloji Yığını

- **Frontend**: Next.js 15 (App Router)
- **UI**: Tailwind CSS, Shadcn UI
- **Kimlik Doğrulama**: Supabase Auth
- **Veritabanı**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Durum Yönetimi**: React Context API

## Proje Durumu

Şu anki durum:

- ✅ Next.js ve Supabase Auth ile temel mimari kuruldu
- ✅ Kullanıcı kimlik doğrulama sistemi (kayıt, giriş, şifre sıfırlama) oluşturuldu
- ✅ Randevu alma akışı için kullanıcı arayüzü hazırlandı (tarih, saat seçimi, onay)
- ✅ Dashboard sayfaları (müşteri, berber, admin) için temel yapılar oluşturuldu
- ✅ UI/UX için Shadcn UI ve özel bileşenler kullanıldı
- ✅ Prisma şeması oluşturuldu ve veritabanı yapılandırıldı

## Yapılması Gerekenler

### 1. Veritabanı ve Prisma Entegrasyonu

- ✅ Prisma şeması tanımlandı
- ✅ Veritabanı bağlantısı: Supabase ile Prisma bağlantısı sorununu çöz
- ✅ Prisma Client ile servis katmanlarını oluştur

### 2. API Endpoint'leri Geliştirme

- ✅ Randevu oluşturma, güncelleme ve iptal etme API'leri
- ✅ Kullanıcı profili yönetimi API'leri
- ✅ Berber/dükkan yönetimi API'leri
- ✅ Müsaitlik durumu için API'ler

### 3. Frontend-Backend Entegrasyonu

- ✅ Mock verileri gerçek veritabanı verileriyle değiştir
- ✅ Auth Provider ile Prisma'yı entegre et
- ✅ Form gönderimlerini gerçek API çağrılarıyla bağla

### 4. Rol Tabanlı Yetkilendirme

- ✅ Middleware kurulumu tamamlandı
- ✅ Auth sisteminde roller tanımlandı
- ❌ Rol bazlı yönlendirme ve erişim kontrolünü tamamla

### 5. Gerçek Zamanlı Özellikler

- ❌ Randevu güncellemeleri için real-time bildirimler
- ❌ Berber panelinde anlık randevu görüntüleme

### 6. Test ve Hata Ayıklama

- ❌ Kimlik doğrulama akışını test et
- ❌ Randevu oluşturma sürecini test et
- ❌ Berber panelinde randevuların görüntülenmesini test et

## Veritabanı Şeması

Prisma ile aşağıdaki veritabanı modelleri tanımlanmıştır:

- `User`: Kullanıcı bilgileri ve rolleri
- `Shop`: Berber dükkanı bilgileri
- `Appointment`: Randevu bilgileri
- `AvailableTime`: Müsaitlik durumları
- `Service`: Berber hizmetleri
- `Review`: Randevu değerlendirmeleri

## Kurulum ve Çalıştırma

1. Bağımlılıkları yükleyin:
   ```
   npm install
   ```

2. Environment değişkenlerini yapılandırın (.env dosyasında):
   ```
   DATABASE_URL="postgresql://postgres:[ŞİFRE]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
   DIRECT_URL="postgresql://postgres:[ŞİFRE]@db.[PROJE-ID].supabase.co:5432/postgres"
   NEXT_PUBLIC_SUPABASE_URL=https://[PROJE-ID].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON-KEY]
   ```

3. Veritabanını oluşturun:
   ```
   npx prisma db push
   ```

4. Uygulamayı başlatın:
   ```
   npm run dev
   ```

## Mimari Yapı

- `/app`: Next.js App Router sayfaları
- `/components`: Yeniden kullanılabilir UI bileşenleri
- `/features`: Özellik bazlı organizasyon (auth, appointments, vb.)
- `/lib`: Yardımcı işlevler, servisler, doğrulama şemaları
- `/prisma`: Veritabanı şeması ve yapılandırması
- `/public`: Statik dosyalar
- `/styles`: Global stillemeler

## Yol Haritası

1. Veritabanı entegrasyonunu tamamla
2. API endpoint'lerini geliştir
3. Frontend'i backend ile entegre et
4. Rol bazlı erişim kontrolünü tamamla
5. Test ve iyileştirmeler
6. Dağıtım ve lansman
