import re
from typing import List, Dict, Any, Optional, Set
from .base import ScrapedProductItem


class CrossMarketplaceMatcher:
    # Aksesuar, yedek parça ve sarf malzemesi anahtar kelimeleri
    ACCESSORY_KEYWORDS = {
        "kılıf",
        "kapak",
        "ekran koruyucu",
        "kordon",
        "kayış",
        "yedek parça",
        "filtre",
        "adaptör",
        "şarj kablosu",
        "kablo",
        "standı",
        "tutucu",
        "aksesuar",
        "cam koruyucu",
        "batarya",
        "yedek batarya",
        "toz torbası",
    }

    @staticmethod
    def calculate_text_similarity(title1: str, title2: str) -> float:
        """İki ürün başlığının Jaccard kelime kümesi benzerliğini hesaplar."""
        clean1 = set(re.findall(r"\w+", title1.lower()))
        clean2 = set(re.findall(r"\w+", title2.lower()))
        if not clean1 or not clean2:
            return 0.0
        intersection = clean1.intersection(clean2)
        union = clean1.union(clean2)
        return len(intersection) / len(union)

    @classmethod
    def is_accessory(cls, title: str) -> bool:
        """Başlığın aksesuar / yedek parça olup olmadığını tespit eder."""
        lower = title.lower()
        for kw in cls.ACCESSORY_KEYWORDS:
            if re.search(r"\b" + re.escape(kw) + r"\b", lower):
                return True
        return False

    @staticmethod
    def extract_model_tokens(title: str) -> Set[str]:
        """
        Ürün model veya seri belirteçlerini ayıklar.
        (Örn: 'v15', 'v12', 'buds4', 'buds3', '256gb', '128gb', 's23', 's24', 'pro max')
        """
        lower = title.lower()
        tokens = set()
        # Sayı içeren model kodları (v15, s24, 256gb,buds4 vb.)
        matches = re.findall(r"\b(?:[a-z]+\d+|\d+[a-z]+|\d+)\b", lower)
        for m in matches:
            # Sadece 1-2 basamaklı tek sayıları (örn. '2' adet gibi) filtrele, anlamlı model veya kapasiteyi tut
            if m.isdigit() and len(m) <= 1:
                continue
            tokens.add(m)

        if "pro max" in lower:
            tokens.add("pro_max")
        if "ultra" in lower:
            tokens.add("ultra")
        return tokens

    @classmethod
    def is_valid_cross_match(
        cls,
        p: ScrapedProductItem,
        s: ScrapedProductItem,
        similarity_threshold: float = 0.40,
    ) -> bool:
        """
        İki farklı pazaryeri ürününün gerçekten aynı ürün olup olmadığını katı kurallarla doğrular:
        1. Barkod (EAN/GTIN) eşleşmesi varsa doğrudan onaylar.
        2. Aksesuar bariyeri: Birisi ana cihazken diğeri kılıf/filtre/kablo ise reddeder.
        3. Model uyuşmazlığı: Farklı model veya seriler (V15 vs V12, S23 vs S24) reddedilir.
        4. Marka uyuşmazlığı: Bilinen markalar çelişiyorsa reddedilir.
        5. Fiyat orantısızlığı: Aşırı uçurum (4 kattan fazla fark) reddedilir.
        """
        # 1. Barkod eşleşmesi (Altın kural)
        if p.barcode and s.barcode and p.barcode.strip() == s.barcode.strip():
            return True

        # 2. Aksesuar bariyeri
        p_is_acc = cls.is_accessory(p.title)
        s_is_acc = cls.is_accessory(s.title)
        if p_is_acc != s_is_acc:
            return False

        # 3. Model token kontrolü
        p_models = cls.extract_model_tokens(p.title)
        s_models = cls.extract_model_tokens(s.title)
        if p_models and s_models:
            # Model belirteçleri varsa en az birinin ortak olması beklenir veya çelişmemesi gerekir
            common = p_models.intersection(s_models)
            if not common:
                # İkisi de sayısal model kodu içeriyor ama hiçbiri uyuşmuyor (örn: v15 vs v12)
                return False

        # 4. Marka kontrolü
        if p.brand and s.brand:
            b1 = p.brand.strip().lower()
            b2 = s.brand.strip().lower()
            if b1 and b2 and b1 != b2 and b1 not in b2 and b2 not in b1:
                return False

        # 5. Fiyat orantısızlık kontrolü
        if p.current_price > 0 and s.current_price > 0:
            ratio = s.current_price / p.current_price
            if ratio < 0.25 or ratio > 4.0:
                return False

        # 6. Metin benzerliği
        return cls.calculate_text_similarity(p.title, s.title) >= similarity_threshold

    @classmethod
    def find_best_match(
        cls,
        target: ScrapedProductItem,
        candidates: List[ScrapedProductItem],
        min_similarity: float = 0.35,
    ) -> Optional[ScrapedProductItem]:
        """Verilen ürün için adaylar arasından en iyi eşleşmeyi döner."""
        best_item = None
        best_score = 0.0

        for cand in candidates:
            if cls.is_valid_cross_match(target, cand, similarity_threshold=min_similarity):
                score = cls.calculate_text_similarity(target.title, cand.title)
                if score > best_score:
                    best_score = score
                    best_item = cand

        return best_item

    @classmethod
    def match_and_aggregate_offers(
        cls,
        primary_products: List[ScrapedProductItem],
        secondary_offers: List[ScrapedProductItem],
    ) -> List[Dict[str, Any]]:
        """
        Farklı pazaryerlerinden (Trendyol, Hepsiburada, Amazon) gelen ürünleri
        başlık, model, marka ve barkod doğrulaması ile birleştirir, arbitraj ve fiyat farklarını hesaplar.
        """
        aggregated: List[Dict[str, Any]] = []

        for p in primary_products:
            matched_offers = [p]
            p_price = p.current_price

            for s in secondary_offers:
                if cls.is_valid_cross_match(p, s):
                    matched_offers.append(s)

            # Fiyatları sırala
            prices = [item.current_price for item in matched_offers if item.current_price > 0]
            min_p = min(prices) if prices else p_price
            max_p = max(prices) if prices else p_price
            arbitrage_gap = round(max_p - min_p, 2)
            arbitrage_pct = round((arbitrage_gap / min_p) * 100.0, 1) if min_p > 0 else 0.0

            cheapest_offer = min(matched_offers, key=lambda x: x.current_price)

            aggregated.append({
                "primary_product": p,
                "lowest_price": min_p,
                "highest_price": max_p,
                "arbitrage_gap": arbitrage_gap,
                "arbitrage_pct": arbitrage_pct,
                "cheapest_marketplace": cheapest_offer.marketplace,
                "cheapest_seller": cheapest_offer.seller_name,
                "total_marketplace_offers": len(matched_offers),
                "offers": [item.model_dump() for item in matched_offers],
            })

        return aggregated
