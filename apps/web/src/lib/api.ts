/**
 * Merkezi API URL Yönlendiricisi
 * Canlıda (GitHub Pages): NEXT_PUBLIC_API_URL ortam değişkenini (örn. https://urunbul-api.onrender.com) kullanır.
 * Lokal Geliştirmede: "" (göreli /api/v1/...) kullanarak Next.js proxy veya localhost:8000'e yönlendirir.
 */
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

export function apiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}
