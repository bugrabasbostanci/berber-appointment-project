-- Test verileri oluşturma SQL komutları
-- Supabase SQL Editör'de çalıştırılacak

-- Admin kullanıcısı oluşturma
INSERT INTO "users" (id, email, phone, role, first_name, last_name, created_at, updated_at)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@berberim.com', '+905551112233', 'ADMIN', 'Admin', 'Kullanıcı', NOW(), NOW());

-- Berber kullanıcısı oluşturma
INSERT INTO "users" (id, email, phone, role, first_name, last_name, created_at, updated_at)
VALUES 
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'deniz@berberim.com', '+905551112234', 'BARBER', 'Deniz', 'Akbulut', NOW(), NOW());

-- Çalışan kullanıcısı oluşturma
INSERT INTO "users" (id, email, phone, role, first_name, last_name, created_at, updated_at)
VALUES 
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'mert@berberim.com', '+905551112235', 'EMPLOYEE', 'Mert', 'Kara', NOW(), NOW());

-- Müşteri kullanıcısı oluşturma
INSERT INTO "users" (id, email, phone, role, first_name, last_name, created_at, updated_at)
VALUES 
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'musteri@gmail.com', '+905551112236', 'CUSTOMER', 'Ali', 'Yılmaz', NOW(), NOW());

-- Profil bilgileri oluşturma
INSERT INTO "profiles" (id, user_id, bio, created_at, updated_at)
VALUES 
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', '10 yıllık deneyimli berber', NOW(), NOW()),
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', '5 yıllık deneyimli kuaför', NOW(), NOW()),
  ('g0eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Müşteri profili', NOW(), NOW());

-- Dükkan oluşturma
INSERT INTO "shops" (id, name, description, owner_id, address, working_hours, created_at, updated_at)
VALUES 
  ('h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a88', 'The Barber Shop', 'Kaliteli berber hizmetleri', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Turan Mah. Okçular Sk. No:7/C Turgutlu, Manisa', 
   '{
      "monday": {"open": "09:30", "close": "20:45", "isClosed": false},
      "tuesday": {"open": "09:30", "close": "20:45", "isClosed": false},
      "wednesday": {"open": "09:30", "close": "20:45", "isClosed": false},
      "thursday": {"open": "09:30", "close": "20:45", "isClosed": false},
      "friday": {"open": "09:30", "close": "20:45", "isClosed": false},
      "saturday": {"open": "09:30", "close": "20:45", "isClosed": false},
      "sunday": {"open": "", "close": "", "isClosed": true}
    }', 
   NOW(), NOW());

-- Servisler oluşturma (hepsi 45 dakika olarak ayarlandı)
INSERT INTO "services" (id, shop_id, name, description, price, duration, created_at, updated_at)
VALUES 
  ('i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', 'h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a88', 'Saç Kesimi', 'Erkek saç kesimi', 150.00, 45, NOW(), NOW()),
  ('j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a00', 'h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a88', 'Sakal Tıraşı', 'Sakal şekillendirme ve tıraş', 100.00, 45, NOW(), NOW()),
  ('k0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a88', 'Saç Yıkama', 'Saç yıkama hizmeti', 50.00, 45, NOW(), NOW()),
  ('l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a88', 'Komple Bakım', 'Saç kesimi, sakal tıraşı ve yıkama', 250.00, 45, NOW(), NOW());

-- Mevcut tarih için uygunluk zamanları (45 dakikalık dilimler halinde)
INSERT INTO "available_times" (id, shop_id, date, is_available, time_slots, created_at, updated_at)
VALUES 
  ('m0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a88', CURRENT_DATE, true, 
   '{
      "slots": [
        {"time": "09:30", "available": true},
        {"time": "10:15", "available": true},
        {"time": "11:00", "available": true},
        {"time": "11:45", "available": true},
        {"time": "12:30", "available": true},
        {"time": "13:15", "available": true},
        {"time": "14:00", "available": true},
        {"time": "14:45", "available": true},
        {"time": "15:30", "available": true},
        {"time": "16:15", "available": true},
        {"time": "17:00", "available": true},
        {"time": "17:45", "available": true},
        {"time": "18:30", "available": true},
        {"time": "19:15", "available": true},
        {"time": "20:00", "available": true},
        {"time": "20:45", "available": true}
      ]
    }', 
   NOW(), NOW()),
  ('n0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a88', CURRENT_DATE + INTERVAL '1 day', true, 
   '{
      "slots": [
        {"time": "09:30", "available": true},
        {"time": "10:15", "available": true},
        {"time": "11:00", "available": true},
        {"time": "11:45", "available": true},
        {"time": "12:30", "available": true},
        {"time": "13:15", "available": true},
        {"time": "14:00", "available": true},
        {"time": "14:45", "available": true},
        {"time": "15:30", "available": true},
        {"time": "16:15", "available": true},
        {"time": "17:00", "available": true},
        {"time": "17:45", "available": true},
        {"time": "18:30", "available": true},
        {"time": "19:15", "available": true},
        {"time": "20:00", "available": true},
        {"time": "20:45", "available": true}
      ]
    }', 
   NOW(), NOW());

-- Örnek bir randevu (45 dakikalık)
INSERT INTO "appointments" (id, shop_id, user_id, date, time, end_time, notes, created_at, updated_at)
VALUES 
  ('o0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a88', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 
   CURRENT_DATE, CURRENT_DATE + '14:00:00'::time, CURRENT_DATE + '14:45:00'::time, 'Saç kesimi randevusu', NOW(), NOW());

-- Örnek değerlendirme
INSERT INTO "reviews" (id, shop_id, rating, comment, created_at, updated_at)
VALUES 
  ('p0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a88', 5, 'Çok memnun kaldım, harika hizmet', NOW(), NOW());

-- Randevu için değerlendirme bağlantısı
UPDATE "appointments" SET review_id = 'p0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66' WHERE id = 'o0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55'; 