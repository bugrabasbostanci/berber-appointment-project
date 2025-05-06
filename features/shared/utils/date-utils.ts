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

/**
 * Supabase'e gönderilecek UTC ISO tarih oluşturur
 * KRITIK: Tarih kaymalarını önlemek için manuel UTC dönüşümü yapar
 * @param dateStr ISO formatında tarih (YYYY-MM-DD)
 * @param timeStr Saat formatı (HH:MM)
 * @returns UTC ISO formatında tarih string'i
 */
export function toUTC(dateStr: string, timeStr: string): string {
  try {
    console.log(`toUTC fonksiyonu. Orijinal: ${dateStr}, Saat: ${timeStr}`);
    
    // Tarih ve saat değerlerini parçalara ayır
    const [year, month, day] = dateStr.split('-').map(part => parseInt(part, 10));
    const [hours, minutes] = timeStr.split(':').map(part => parseInt(part, 10));
    
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
 * Tarih kaymalarını önlemek için bir gün ilerisi alınarak UTC ISO tarih oluşturur
 * @param dateStr ISO formatında tarih (YYYY-MM-DD)
 * @param timeStr Saat formatı (HH:MM)
 * @returns UTC ISO formatında tarih string'i (1 gün eklenerek)
 * @deprecated Yerine standart toUTC kullanın ve gerekirse gün ekleyin
 */
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
 * Verilen gün kadar tarih ekleyen UTC ISO tarih oluşturucu
 * @param dateStr ISO formatında tarih (YYYY-MM-DD)
 * @param timeStr Saat formatı (HH:MM)
 * @param daysToAdd Eklenecek gün sayısı (varsayılan: 0)
 * @returns UTC ISO formatında tarih string'i
 */
export function toUTCWithOffset(dateStr: string, timeStr: string, daysToAdd: number = 0): string {
  try {
    // Tarih ve saat değerlerini parçalara ayır
    let [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    // İstenen gün sayısını ekle
    if (daysToAdd !== 0) {
      // Yeni bir Date nesnesi oluştur ve günleri ekle
      const tempDate = new Date(year, month - 1, day + daysToAdd);
      year = tempDate.getFullYear();
      month = tempDate.getMonth() + 1;
      day = tempDate.getDate();
    }
    
    // ISO string formatını manuel olarak oluştur
    const isoString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00.000Z`;
    
    return isoString;
  } catch (error) {
    console.error('toUTCWithOffset dönüşüm hatası:', error);
    throw new Error(`Tarih ofset dönüşüm hatası: ${error}`);
  }
}

/**
 * ISO formatındaki tarihten kullanıcı arayüzünde gösterilecek formatı oluşturur
 * KRİTİK: Zaman dilimi farkından kaynaklanan gün kaymalarını önler!
 * @param utcDateStr ISO formatında UTC tarih string'i
 * @param locale Yerelleştirme formatı (varsayılan: 'tr-TR')
 * @returns Formatlanmış tarih string'i
 */
export function formatFromUTC(utcDateStr: string, locale: string = 'tr-TR'): string {
  try {
    if (!utcDateStr) return '';
    
    // ISO tarih formatı kontrolü (YYYY-MM-DD)
    if (utcDateStr.includes('-')) {
      // Tarihi parçalara ayır
      const dateParts = utcDateStr.split('T')[0].split('-');
      if (dateParts.length !== 3) {
        throw new Error(`Geçersiz ISO tarih formatı: ${utcDateStr}`);
      }
      
      const [yearStr, monthStr, dayStr] = dateParts;
      
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
    
    // Son çare olarak Date objesi kullan
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
 * @param localDateStr Yerel tarih formatı (DD/MM/YYYY veya DD.MM.YYYY)
 * @returns ISO formatında tarih (YYYY-MM-DD)
 */
export function parseToUTC(localDateStr: string): string {
  if (!localDateStr) return '';
  
  try {
    if (localDateStr.includes('/') || localDateStr.includes('.')) {
      const separator = localDateStr.includes('/') ? '/' : '.';
      const [day, month, year] = localDateStr.split(separator).map(Number);
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }
    
    return localDateStr; // Zaten ISO formatındaysa
  } catch (error) {
    console.error('parseToUTC hatası:', error, localDateStr);
    return localDateStr;
  }
}

/**
 * Tarih ve saat bilgisini birleştirerek kesin UTC zaman damgası oluşturur
 * Date.UTC() kullanarak kesin UTC değeri oluşturur
 * @param dateStr Tarih string'i (her formatta)
 * @param timeStr Saat string'i (HH:MM)
 * @returns UTC Date nesnesi
 */
export function combineDateTime(dateStr: string, timeStr: string): Date {
  try {
    // Tarihi ISO formatına dönüştür ve parçala
    const isoDate = parseToUTC(dateStr);
    const [year, month, day] = isoDate.split('-').map(Number);
    
    // Saati parçala
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    // ÖNEMLİ: Date.UTC kullanarak doğrudan UTC tarih oluşturuyoruz
    // Bu, zaman dilimi karmaşasını tamamen ortadan kaldırır
    const utcTimeMs = Date.UTC(year, month - 1, day, hours, minutes, 0);
    return new Date(utcTimeMs);
  } catch (error) {
    console.error('combineDateTime hatası:', error, dateStr, timeStr);
    throw new Error(`Tarih ve saat birleştirme hatası: ${error}`);
  }
}

/**
 * UTC formatındaki bir saati yerel saat olarak formatlar
 * @param dateTimeStr ISO formatında tam tarih-saat string'i
 * @param locale Yerelleştirme formatı (varsayılan: 'tr-TR')
 * @returns Formatlanmış saat string'i (HH:MM)
 */
export function formatTime(dateTimeStr: string, locale: string = 'tr-TR'): string {
  try {
    if (!dateTimeStr) return '';
    
    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) {
      throw new Error(`Geçersiz tarih-saat formatı: ${dateTimeStr}`);
    }
    
    return date.toLocaleTimeString(locale, { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  } catch (error) {
    console.error('formatTime hatası:', error, dateTimeStr);
    return dateTimeStr;
  }
}

/**
 * Tam tarih ve gün bilgisini formatlar
 * @param dateTimeStr ISO formatında tam tarih-saat string'i
 * @param locale Yerelleştirme formatı (varsayılan: 'tr-TR')
 * @returns Formatlanmış tam tarih string'i (gün adı dahil)
 */
export function formatFullDate(dateTimeStr: string, locale: string = 'tr-TR'): string {
  try {
    if (!dateTimeStr) return '';
    
    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) {
      throw new Error(`Geçersiz tarih-saat formatı: ${dateTimeStr}`);
    }
    
    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long'
    });
  } catch (error) {
    console.error('formatFullDate hatası:', error, dateTimeStr);
    return dateTimeStr;
  }
}

/**
 * Tarih geçerli mi kontrol eder
 * @param dateStr Kontrol edilecek tarih string'i
 * @returns Geçerli bir tarih ise true, değilse false
 */
export function isValidDate(dateStr: string): boolean {
  if (!dateStr) return false;
  
  try {
    // ISO formatı için doğrudan kontrol
    if (dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('-').map(Number);
      if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
      
      // Ay ve gün sınırları kontrolü
      if (month < 1 || month > 12) return false;
      if (day < 1 || day > 31) return false;
      
      // Ay uzunluğu kontrolü
      const daysInMonth = new Date(year, month, 0).getDate();
      if (day > daysInMonth) return false;
      
      return true;
    }
    
    // Diğer formatlar için Date nesnesi kullan
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  } catch (error) {
    return false;
  }
}

/**
 * İki tarih arasındaki gün farkını hesaplar
 * @param startDate Başlangıç tarihi (ISO formatında)
 * @param endDate Bitiş tarihi (ISO formatında)
 * @returns Gün farkı (tam sayı)
 */
export function daysBetween(startDate: string, endDate: string): number {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Zaman kısmını temizle
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    // MS cinsinden farkı gün sayısına dönüştür
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (error) {
    console.error('daysBetween hatası:', error, startDate, endDate);
    return 0;
  }
}
