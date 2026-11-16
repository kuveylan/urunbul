import asyncio
import sys
import os

# Add root directory to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "apps", "api")))

from packages.scraper_engine import (
    TrendyolScraper,
    HepsiburadaScraper,
    AmazonTrScraper,
    N11Scraper,
    CrossMarketplaceMatcher,
)

async def test_live_scrapers():
    query = "kahve makinesi"
    print(f"============================================================")
    print(f"🎯 4 BÜYÜK PAZARYERİ CANLI KAZIMA DOĞRULAMA TESTİ")
    print(f"Sorgu: '{query}'")
    print(f"============================================================\n")

    scrapers = [
        ("Hepsiburada", HepsiburadaScraper()),
        ("Amazon TR", AmazonTrScraper()),
        ("N11", N11Scraper()),
        ("Trendyol", TrendyolScraper()),
    ]

    all_results = {}

    for name, scraper in scrapers:
        print(f"⏳ [{name}] Taranıyor...")
        try:
            items = await scraper.search(query=query, page=1, limit=4)
            all_results[name] = items
            print(f"✅ [{name}] Başarılı! {len(items)} adet ürün çekildi.")
            for i, it in enumerate(items, 1):
                orig = f" (İndirimsiz: {it.original_price:,.2f} ₺)" if it.original_price else ""
                print(f"   {i}. [{it.marketplace.upper()}] {it.title[:50]}...")
                print(f"      Fiyat: {it.current_price:,.2f} ₺{orig} | Puan: {it.rating} ({it.review_count} yorum)")
                print(f"      Satıcı: {it.seller_name} | ID: {it.external_id}")
        except Exception as e:
            print(f"❌ [{name}] Hata: {e}")
        print()

    print("============================================================")
    print("🔄 ÇAPRAZ EŞLEŞTİRME & ARBİTRAJ TESTİ")
    print("============================================================")
    
    # Trendyol'dan ilk ürünü alıp diğer pazarlarla eşleşiyor mu kontrol et
    ty_items = all_results.get("Trendyol", [])
    if ty_items:
        target = ty_items[0]
        print(f"Hedef Ürün: {target.title} ({target.current_price:,.2f} ₺)\n")
        
        for name in ["Hepsiburada", "Amazon TR", "N11"]:
            candidates = all_results.get(name, [])
            match = CrossMarketplaceMatcher.find_best_match(target, candidates)
            if match:
                diff = target.current_price - match.current_price
                diff_str = f"+{diff:,.2f} ₺ DAHA UCUZ" if diff > 0 else f"{abs(diff):,.2f} ₺ DAHA PAHALI"
                print(f"  👉 {name} Eşleşmesi: {match.title[:45]}...")
                print(f"     Fiyat: {match.current_price:,.2f} ₺ | Fark: {diff_str}")
            else:
                print(f"  ℹ️ {name}: Doğrudan eşleşen model bulunamadı.")
    
    print("\n🎉 Tüm 4 pazaryeri motoru doğrulaması tamamlandı!")

if __name__ == "__main__":
    asyncio.run(test_live_scrapers())
