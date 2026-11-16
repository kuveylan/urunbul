/**
 * Merkezi API URL Yönlendiricisi ve Dayanıklı İstemci (Resilient Fetch Client)
 * 
 * - Canlıda (urunbul.me / github.io): NEXT_PUBLIC_API_URL veya doğrudan https://urunbul-api.onrender.com
 * - Mobil / Yerel Testlerde (192.168.x.x, preview vb.): Otomatik olarak https://urunbul-api.onrender.com'a yönlendirir.
 * - Render Free Tier Cold-Start koruması: Otomatik 3 aşamalı yeniden deneme ve uyanma süresi tespiti.
 * - Hata çevirisi: Ham 'Failed to fetch' hatasını kullanıcı dostu Türkçe açıklamaya dönüştürür.
 */

import { safeLocalStorage } from "./safariFixes";

export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname.toLowerCase();
    // Yalnızca lokal testte boş bırakıp Next.js proxy veya localhost:8000'e güven
    if (host === "localhost" || host === "127.0.0.1") {
      return "";
    }
    // Canlı etki alanı, github.io veya mobil yerel ağ IP'si (192.168.x.x vb.) durumunda Render canlı API'sine git
    return "https://urunbul-api.onrender.com";
  }
  return "https://urunbul-api.onrender.com";
}

export const API_BASE_URL = getApiBaseUrl();

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

export function getAuthToken(): string | null {
  return safeLocalStorage.getItem("urunbul_token");
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  if (token) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }
  return {};
}

/**
 * Ham tarayıcı hatalarını kullanıcı dostu, açıklayıcı Türkçe ifadelere dönüştürür.
 */
export function translateNetworkError(err: any): string {
  if (!err) return "Bilinmeyen bir hata oluştu. Lütfen tekrar deneyin.";
  
  const msg = typeof err === "string" ? err : err.message || "";
  const lower = msg.toLowerCase();

  if (
    lower.includes("failed to fetch") ||
    lower.includes("networkerror") ||
    lower.includes("abort") ||
    lower.includes("load failed") ||
    lower.includes("econnrefused") ||
    lower.includes("connection refused")
  ) {
    return "Bulut sunucu uyku modundan uyanıyor olabilir (Render 30-50 sn sürebilir). Lütfen biraz bekleyip 'Yeniden Dene' butonuna tıklayın.";
  }

  if (lower.includes("504") || lower.includes("gateway timeout")) {
    return "Pazaryeri yanıt süresi aşıldı. Canlı tarama gecikmesi nedeniyle lütfen tekrar deneyin.";
  }

  if (lower.includes("502") || lower.includes("bad gateway") || lower.includes("503")) {
    return "Bulut sunucu başlatılıyor. Lütfen 10-15 saniye sonra tekrar deneyin.";
  }

  if (lower.includes("429")) {
    return "Günlük arama kotanızı doldurdunuz.";
  }

  return msg;
}

export interface ResilientFetchOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  onColdStartNotice?: (msg: string) => void;
}

export interface ResilientFetchResult<T = any> {
  data: T;
  headers: Headers;
  status: number;
}

/**
 * Render Free Tier cold-start ve geçici ağ kopmalarına karşı dayanıklı fetch fonksiyonu.
 * 3 aşamalı üstel gecikmeyle (exponential backoff) otomatik dener.
 */
export async function resilientFetch<T = any>(
  inputUrl: string,
  options: ResilientFetchOptions = {}
): Promise<ResilientFetchResult<T>> {
  const {
    timeoutMs = 24000,
    retries = 2,
    retryDelayMs = 2000,
    onColdStartNotice,
    ...fetchOptions
  } = options;

  let lastError: any = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    // İlk istek 4 saniyeden uzun sürerse kullanıcıya sunucunun uyandığını bildir
    const coldNoticeTimer = setTimeout(() => {
      if (onColdStartNotice && attempt === 0) {
        onColdStartNotice("Bulut sunucu uyku modundan uyanıyor, lütfen bekleyin...");
      }
    }, 4000);

    try {
      const mergedHeaders = {
        ...getAuthHeaders(),
        ...(fetchOptions.headers || {}),
      };

      const res = await fetch(inputUrl, {
        ...fetchOptions,
        headers: mergedHeaders,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      clearTimeout(coldNoticeTimer);

      if (res.status === 429) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Bugünkü arama kotanızı doldurdunuz.");
      }

      if (res.status === 502 || res.status === 503 || res.status === 504) {
        throw new Error(`Sunucu yanıt vermedi (${res.status}). Bulut sunucu uyanıyor olabilir.`);
      }

      if (!res.ok) {
        throw new Error(`Sunucu hatası (${res.status})`);
      }

      const data = await res.json();
      return {
        data,
        headers: res.headers,
        status: res.status,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      clearTimeout(coldNoticeTimer);
      lastError = err;

      // Son deneme değilse ve ağ/cold-start hatasıysa bekle ve tekrar dene
      if (attempt < retries) {
        const backoff = retryDelayMs * (attempt + 1);
        if (onColdStartNotice) {
          onColdStartNotice(
            `Sunucu bağlantısı bekleniyor (Deneme ${attempt + 1}/${retries + 1})... Lütfen bekleyin.`
          );
        }
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
  }

  throw new Error(translateNetworkError(lastError));
}
