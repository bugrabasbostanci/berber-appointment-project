// features/shared/utils/date-utils.ts

/**
 * Kullanıcı arayüzünden seçilen bir tarihi ISO formatına dönüştürür
 * @param dateStr Tarih string'i (her formatta)
 * @returns ISO format tarih (YYYY-MM-DD)
 */
export function normalizeDate(dateStr: string): string {
  if (!dateStr) return '';
  
  try {
    // Eğer / veya . içeriyorsa, muhtemelen Türkçe formatı (gün.ay.yıl)
    if (dateStr.includes('/') || dateStr.includes('.')) {
      const separator = dateStr.includes('/') ? '/' : '.';
      const [day, month, year] = dateStr.split(separator).map(Number);
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }
    
    // Eğer - içeriyorsa, muhtemelen ISO formatı (yıl-ay-gün), doğrulama yap
    if (dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('-').map(Number);
      // Ay ve gün kontrolleri
      if (month > 0 && month <= 12 && day > 0 && day <= 31) {
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      }
    }
    
    // Son çare olarak Date objesi ile işle
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    throw new Error(`Geçersiz tarih formatı: ${dateStr}`);
  } catch (error) {
    console.error('Tarih normalize etme hatası:', error, dateStr);
    return dateStr; // Hata durumunda orijinal string'i geri dön
  }
}

// Bu fonksiyonu date-utils.ts dosyasına ekleyin
export function toUTCFixed(dateStr: string, timeStr: string): string {
  console.log(`toUTCFixed fonksiyonu. Orijinal: ${dateStr}, Saat: ${timeStr}`);
  
  // YYYY-MM-DD formatındaki tarihi manuel işle
  let [year, month, day] = dateStr.split('-').map(Number);
  let [hours, minutes] = timeStr.split(':').map(Number);
  
  // Bir gün ilerisini al! Bu çok önemli - yerel zaman UTC'ye dönüştürülünce gün kayma sorununu önler
  day = day + 1;
  
  // Ayın gün sayısını aşarsa ayı ilerlet
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day > daysInMonth) {
    day = 1;
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }
  
  // ISO string formatını manuel olarak oluştur
  const isoString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00.000Z`;
  
  console.log(`UTC dönüşümü (fixed): Kullanıcının seçtiği gün + 1 alınarak çözüm yapıldı => ${isoString}`);
  
  return isoString;
}

/**
 * Supabase'e gönderilecek UTC ISO tarih oluşturur
 * KRITIK: Tarih kaymalarını tamamen önleyen bir UTC dönüşümü sağlar
 */
export function toUTC(dateStr: string, timeStr: string): string {
  try {
    console.log(`toUTC fonksiyonu. Orijinal: ${dateStr}, Normalized: ${dateStr}, Saat: ${timeStr}`);
    
    // Tarih ve saat değerlerini parçalara ayır
    const [year, month, day] = dateStr.split('-').map(part => parseInt(part, 10));
    const [hours, minutes] = timeStr.split(':').map(part => parseInt(part, 10));
    
    // KRITIK: Zaman dilimi farkından kaynaklanan gün kaymasını tamamen engellemek için
    // ISO doğrudan string olarak oluşturuyoruz - Date nesnesi kullanmadan!
    const isoString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00.000Z`;
    
    // Debug için detaylı log
    console.log(`UTC dönüşümü: ${year}-${month}-${day} ${hours}:${minutes} => ${isoString}`);
    
    return isoString;
  } catch (error) {
    console.error('toUTC dönüşüm hatası:', error);
    throw new Error(`Tarih dönüşüm hatası: ${error}`);
  }
}

/**
 * ISO formatındaki tarihten kullanıcı arayüzünde gösterilecek formatı oluşturur
 * KRİTİK: Zaman dilimi farkından kaynaklanan gün kaymalarını önler!
 */
export function formatFromUTC(utcDateStr: string, locale: string = 'tr-TR'): string {
  try {
    // ISO tarih formatı kontrolü (YYYY-MM-DD)
    if (utcDateStr.includes('-')) {
      // ÖNEMLİ: Gün kaymalarını tamamen engellemek için
      // UTC tarihi parçalara ayır
      const [yearStr, monthStr, dayStr] = utcDateStr.split('-');
      
      // Parçaları sayı olarak kullan
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const day = parseInt(dayStr, 10);
      
      // Türkçe ay isimleri
      const months = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
      ];
      
      // DATE OLUŞTURMADAN DOĞRUDAN FORMAT
      return `${day} ${months[month-1]} ${year}`;
    }
    
    return new Date(utcDateStr).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    console.error('formatFromUTC hatası:', error, utcDateStr);
    return utcDateStr;
  }
}

/**
 * Yerel tarih formatını ISO formatına dönüştürür
 */
export function parseToUTC(localDateStr: string): string {
  if (!localDateStr) return '';
  
  if (localDateStr.includes('/') || localDateStr.includes('.')) {
    const separator = localDateStr.includes('/') ? '/' : '.';
    const [day, month, year] = localDateStr.split(separator).map(Number);
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }
  
  return localDateStr; // Zaten ISO formatındaysa
}

/**
 * Tarih ve saat bilgisini birleştirerek kesin UTC zaman damgası oluşturur
 * Date.UTC() kullanarak kesin UTC değeri oluşturur
 */
export function combineDateTime(dateStr: string, timeStr: string): Date {
  // Tarihi ISO formatına dönüştür ve parçala
  const isoDate = parseToUTC(dateStr);
  const [year, month, day] = isoDate.split('-').map(Number);
  
  // Saati parçala
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // ÖNEMLİ: Date.UTC kullanarak doğrudan UTC tarih oluşturuyoruz
  // Bu, zaman dilimi karmaşasını tamamen ortadan kaldırır
  const utcTimeMs = Date.UTC(year, month - 1, day, hours, minutes, 0);
  return new Date(utcTimeMs);
}

/**
 * UTC formatındaki bir saati yerel saat olarak formatlar
 */
export function formatTime(dateTimeStr: string, locale: string = 'tr-TR'): string {
  const date = new Date(dateTimeStr);
  return date.toLocaleTimeString(locale, { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
}

/**
 * Tam tarih ve gün bilgisini formatlar
 */
export function formatFullDate(dateTimeStr: string, locale: string = 'tr-TR'): string {
  const date = new Date(dateTimeStr);
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long'
  });
}
