/**
 * Merkezi API URL Yönlendiricisi
 * Canlıda (GitHub Pages / urunbul.me): NEXT_PUBLIC_API_URL ortam değişkenini (örn. https://urunbul-api.onrender.com) kullanır.
 * Ortam değişkeni derleme sırasında verilmemiş olsa dahi, tarayıcı urunbul.me veya github.io üzerinde çalışıyorsa
 * otomatik olarak https://urunbul-api.onrender.com adresine yönlenir.
 * Lokal Geliştirmede: "" (göreli /api/v1/...) kullanarak Next.js proxy veya localhost:8000'e yönlendirir.
 */
export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname.toLowerCase();
    if (host === "urunbul.me" || host === "www.urunbul.me" || host.endsWith(".github.io")) {
      return "https://urunbul-api.onrender.com";
    }
  }
  return "";
}

export const API_BASE_URL = getApiBaseUrl();

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}
