# 🚀 ÜrünBul – Türkiye Pazaryeri Satıcı Analiz & Fiyat Karşılaştırma Platformu

Türkiye e-ticaret pazarı (Trendyol, Hepsiburada, N11, Amazon.com.tr) için:
- **Satıcılar İçin (Helium 10 & Jungle Scout Benzeri):** Gerçek ürünler üzerinden satış tahmini, tahmini ciro, pazar fırsat skoru ve rakip analizi.
- **Tüketiciler İçin (Akakçe & Cimri Benzeri):** Canlı fiyat karşılaştırması, satıcı bazlı teklifler, indirim takibi ve en ucuz fiyat bulucu.

---

## 🏗️ Mimari & Teknoloji Yığını

- **Backend:** Python 3.12, FastAPI, SQLAlchemy 2.0 (Async), SQLite/PostgreSQL, Pydantic v2
- **Veri Toplama Motoru:** Playwright Headless Browser (Cloudflare WAF uyumlu, Trendyol canlı JSON veri ekstraktörü)
- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Satış & Fırsat Algoritması:** Yorum sayısı, favori sayısı, puan ve fiyat sinyallerinden aylık satış ve fırsat skoru projeksiyonu

---

## ⚡ Hızlı Başlangıç

### Tek Tıkla Başlatma (Tavsiye Edilen)
Klasör içindeki **`start.bat`** dosyasına çift tıklayarak hem Backend hem Frontend servislerini tek seferde ayağa kaldırabilirsiniz. (Tarayıcınız otomatik açılacaktır).

Alternatif olarak PowerShell üzerinden:
```powershell
.\start.ps1
```

### Ayrı Terminallerde Başlatma
- **Backend API (FastAPI):** `.\start-api.ps1` veya `start-api.bat` (`http://localhost:8000/docs`)
- **Frontend (Next.js):** `.\start-web.ps1` veya `start-web.bat` (`http://localhost:3000`)

---

## 🎯 Özellikler

1. **Canlı Trendyol Entegrasyonu:** Kesinlikle sahte/örnek veri kullanılmaz; doğrudan Trendyol üzerindeki gerçek ürünler, fiyatlar, satıcılar ve puanlar taranır.
2. **Helium 10 Modeli:**
   - Tahmini Aylık Satış Adedi
   - Tahmini Aylık Ciro (₺)
   - Fırsat Skoru (0-100)
3. **Akakçe / Cimri Modeli:**
   - Tek tıkla tüketici moduna geçiş
   - En uygun fiyat vurgusu ve doğrudan mağazaya git bağlantıları
