/**
 * iOS Safari / WebKit ve iPad Uyumluluk Yardımcıları (Safari & WebKit Hardening)
 * 
 * 1. parseSafeDate: Safari'nin "YYYY-MM-DD HH:mm:ss" formatındaki boşluklu tarihleri reddedip
 *    'Invalid Date' üretmesini ve toLocaleDateString çağrısında RangeError vermesini engeller.
 * 2. safeLocalStorage: Safari Gizli Sekme (Private Browsing) modunda localStorage.setItem / getItem
 *    çağrılarının SecurityError / QuotaExceededError fırlatarak React bileşen ağacını çökertmesini önler.
 */

/**
 * Boşluklu veya farklı biçimli tarih stringlerini Safari WebKit için ISO-8601'e normalize eder.
 */
export function parseSafeDate(ts: any): Date {
  if (!ts) return new Date();
  if (ts instanceof Date) return isNaN(ts.getTime()) ? new Date() : ts;
  
  if (typeof ts === "string") {
    // "2026-11-16 17:34:00" -> "2026-11-16T17:34:00"
    const normalized = ts.includes(" ") && !ts.includes("T") ? ts.replace(" ", "T") : ts;
    const d = new Date(normalized);
    if (!isNaN(d.getTime())) return d;

    // Alternatif deneme (Zaman damgası / timestamp sayısı olarak kontrol)
    const num = Number(ts);
    if (!isNaN(num) && num > 0) {
      const dNum = new Date(num);
      if (!isNaN(dNum.getTime())) return dNum;
    }
  }

  if (typeof ts === "number") {
    const d = new Date(ts);
    if (!isNaN(d.getTime())) return d;
  }

  return new Date();
}

/**
 * Safari WebKit üzerinde RangeError atmadan güvenli tarih formatlar.
 */
export function safeFormatDate(
  ts: any,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" },
  locale: string = "tr-TR"
): string {
  try {
    const d = parseSafeDate(ts);
    return d.toLocaleDateString(locale, options);
  } catch (e) {
    return "";
  }
}

/**
 * Safari WebKit üzerinde RangeError atmadan güvenli saat formatlar.
 */
export function safeFormatTime(
  ts: any,
  options: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" },
  locale: string = "tr-TR"
): string {
  try {
    const d = parseSafeDate(ts);
    return d.toLocaleTimeString(locale, options);
  } catch (e) {
    return "";
  }
}

/**
 * Safari Gizli Sekme (Private Browsing) dostu LocalStorage sarmalayıcısı.
 */
export const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      // Safari gizli modda erişim engelli olabilir
    }
    return null;
  },

  setItem(key: string, value: string): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      // Safari gizli modda depolama kotası engelli olabilir
    }
  },

  removeItem(key: string): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      // Hata sessizce yutulur
    }
  },
};
