import asyncio
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.services.trendyol_service import TrendyolService
from datetime import datetime
from app.models.product import Product, ConsumerSearchSignal
from app.schemas.consumer import (
    PriceVerdict,
    ConsumerOfferItem,
    DetailedComparisonResponse,
    DealProductItem,
)


class ConsumerService:
    @staticmethod
    def calculate_price_verdict(current_price: float, original_price: Optional[float], min_price: float, avg_price: float) -> PriceVerdict:
        """
        Akakçe & Keepa Modeli:
        Mevcut fiyatın piyasa ortalaması ve en dip fiyata göre avantaj seviyesini belirler.
        """
        discount_pct = 0.0
        if original_price and original_price > current_price:
            discount_pct = round(((original_price - current_price) / original_price) * 100.0, 1)

        # Fiyat karşılaştırma kriterleri
        if current_price <= min_price * 1.02 or discount_pct >= 25.0:
            return PriceVerdict(
                status="EXCELLENT",
                label="Fırsat Fiyatı! (Dip Seviye)",
                badge_color="emerald",
                message=f"Bu ürün son dönemin en uygun fiyat seviyesinde (%{discount_pct or 15} avantajlı). Kaçırmamanızı öneririz.",
                discount_pct=discount_pct,
                lowest_recorded=min_price,
                average_recorded=avg_price,
            )
        elif current_price < avg_price:
            diff_from_avg = round(((avg_price - current_price) / avg_price) * 100.0, 1)
            return PriceVerdict(
                status="GOOD",
                label="İyi Fiyat (Piyasa Altı)",
                badge_color="sky",
                message=f"Piyasa ortalamasının %{diff_from_avg} altında makul bir fiyatta.",
                discount_pct=discount_pct,
                lowest_recorded=min_price,
                average_recorded=avg_price,
            )
        elif current_price <= avg_price * 1.08:
            return PriceVerdict(
                status="AVERAGE",
                label="Normal Piyasa Fiyatı",
                badge_color="amber",
                message="Fiyat piyasa ortalamasında seyrediyor. İndirim beklenebilir.",
                discount_pct=discount_pct,
                lowest_recorded=min_price,
                average_recorded=avg_price,
            )
        else:
            diff_over_avg = round(((current_price - avg_price) / avg_price) * 100.0, 1)
            return PriceVerdict(
                status="HIGH",
                label="Pahalı (Piyasa Üstü)",
                badge_color="rose",
                message=f"Mevcut fiyat piyasa ortalamasının %{diff_over_avg} üzerinde. Fiyat alarmı kurmanız tavsiye edilir.",
                discount_pct=discount_pct,
                lowest_recorded=min_price,
                average_recorded=avg_price,
            )

    @classmethod
    async def compare_offers(cls, query: str, db: Optional[AsyncSession] = None) -> Optional[DetailedComparisonResponse]:
        """
        Akakçe & Cimri tarzı kapsamlı çoklu pazaryeri (Trendyol, Hepsiburada, Amazon TR, N11)
        satıcı ve canlı fiyat karşılaştırması. CrossMarketplaceMatcher ile katı eşleştirme yapar.
        """
        from scraper_engine import TrendyolScraper, HepsiburadaScraper, AmazonTrScraper, N11Scraper, ScrapedProductItem
        from scraper_engine.matcher import CrossMarketplaceMatcher

        # Çoklu pazaryeri paralel sorgulama (Trendyol, Hepsiburada, Amazon TR, N11)
        ty_scraper = TrendyolScraper()
        hb_scraper = HepsiburadaScraper()
        az_scraper = AmazonTrScraper()
        n11_scraper = N11Scraper()

        ty_task = ty_scraper.search(query=query, page=1, limit=10)
        hb_task = hb_scraper.search(query=query, page=1, limit=8)
        az_task = az_scraper.search(query=query, page=1, limit=8)
        n11_task = n11_scraper.search(query=query, page=1, limit=8)

        batch_results = await asyncio.gather(ty_task, hb_task, az_task, n11_task, return_exceptions=True)

        ty_items: List[ScrapedProductItem] = batch_results[0] if isinstance(batch_results[0], list) else []
        hb_items: List[ScrapedProductItem] = batch_results[1] if isinstance(batch_results[1], list) else []
        az_items: List[ScrapedProductItem] = batch_results[2] if isinstance(batch_results[2], list) else []
        n11_items: List[ScrapedProductItem] = batch_results[3] if isinstance(batch_results[3], list) else []

        all_candidates: List[ScrapedProductItem] = [
            item for group in [ty_items, hb_items, az_items, n11_items] for item in group if item.current_price > 0
        ]

        if not all_candidates:
            return None

        # 1. Hedef referans ürünü belirle (Aksesuar olmayan, başlığı sorguyla en uyumlu ürün)
        non_acc_candidates = [it for it in all_candidates if not CrossMarketplaceMatcher.is_accessory(it.title)]
        target_pool = non_acc_candidates if non_acc_candidates else all_candidates

        # Sorgu kelimeleriyle en çok örtüşen ürünü seç
        target_product = target_pool[0]
        max_overlap = -1
        query_words = set(query.lower().split())
        for cand in target_pool:
            title_words = set(cand.title.lower().split())
            overlap = len(query_words.intersection(title_words))
            if overlap > max_overlap:
                max_overlap = overlap
                target_product = cand

        # 2. Her pazaryerinden hedef ürünle gerçekten eşleşen en iyi teklifi seç
        matched_items: List[ScrapedProductItem] = [target_product]
        other_lists = [
            ("trendyol", ty_items),
            ("hepsiburada", hb_items),
            ("amazon", az_items),
            ("n11", n11_items),
        ]

        target_mp = (target_product.marketplace or "").lower()

        for mp_name, cand_list in other_lists:
            # Hedef pazarla aynıysa, aynı pazardaki diğer satıcıları/teklifleri ekle
            if mp_name in target_mp:
                for cand in cand_list:
                    if cand != target_product and cand.current_price > 0:
                        if CrossMarketplaceMatcher.is_valid_cross_match(target_product, cand, similarity_threshold=0.45):
                            matched_items.append(cand)
                            break
                continue

            # Farklı pazaryeri için en iyi eşleşmeyi bul
            valid_cands = [c for c in cand_list if c.current_price > 0]
            best_match = CrossMarketplaceMatcher.find_best_match(target_product, valid_cands, min_similarity=0.30)
            if best_match:
                matched_items.append(best_match)

        # En ucuzdan pahalıya sırala
        matched_items.sort(key=lambda x: x.current_price)

        # 3. Eğer DB oturumu varsa, hedef ana ürünü kaydet/çek ki gerçek product_id ile fiyat alarmı kurulabilsin
        saved_product_id: Optional[int] = None
        if db:
            try:
                ext_id = str(target_product.external_id)
                mp = target_product.marketplace
                stmt = select(Product).where(Product.marketplace == mp, Product.external_id == ext_id)
                res = await db.execute(stmt)
                existing = res.scalar_one_or_none()
                if existing:
                    saved_product_id = existing.id
                else:
                    new_p = Product(
                        marketplace=mp,
                        external_id=ext_id,
                        title=target_product.title,
                        brand=target_product.brand,
                        category_name=target_product.category_name,
                        url=target_product.url,
                        image_url=target_product.image_url,
                        current_price=target_product.current_price,
                        original_price=target_product.original_price,
                        currency=target_product.currency or "TRY",
                        seller_name=target_product.seller_name,
                        rating=target_product.rating or 0.0,
                        review_count=target_product.review_count or 0,
                    )
                    db.add(new_p)
                    await db.commit()
                    await db.refresh(new_p)
                    saved_product_id = new_p.id

                # Tüketici arama talebini satıcı sinyali olarak kaydet
                await cls.record_search_signal(db, query, target_product.category_name)
            except Exception:
                await db.rollback()

        prices = [p.current_price for p in matched_items]
        min_price = min(prices)
        max_price = max(prices)
        avg_price = round(sum(prices) / len(prices), 2)

        # Teklif listesi oluştur
        offers: List[ConsumerOfferItem] = []
        for p in matched_items:
            cur_p = p.current_price
            orig_p = p.original_price
            disc = 0.0
            if orig_p and orig_p > cur_p:
                disc = round(((orig_p - cur_p) / orig_p) * 100.0, 1)

            offers.append(
                ConsumerOfferItem(
                    id=saved_product_id if p == target_product else None,
                    marketplace=p.marketplace,
                    seller_name=p.seller_name or f"{p.marketplace.capitalize()} Satıcısı",
                    price=cur_p,
                    original_price=orig_p,
                    discount_pct=disc,
                    free_shipping=cur_p >= 150.0,
                    in_stock=True,
                    product_url=p.url,
                    seller_rating=p.rating or 0.0,
                    review_count=p.review_count or 0,
                )
            )

        best_offer = offers[0]
        if matched_items[0] == target_product:
            best_offer.id = saved_product_id

        verdict = cls.calculate_price_verdict(
            current_price=best_offer.price,
            original_price=best_offer.original_price,
            min_price=min_price,
            avg_price=avg_price,
        )

        return DetailedComparisonResponse(
            query=query,
            title=target_product.title,
            brand=target_product.brand,
            image_url=target_product.image_url,
            lowest_price=min_price,
            highest_price=max_price,
            average_price=avg_price,
            total_offers_count=len(offers),
            best_offer=best_offer,
            offers=offers,
            price_verdict=verdict,
            category_name=target_product.category_name,
        )

    @classmethod
    async def get_daily_deals(cls, seed_categories: Optional[List[str]] = None) -> List[DealProductItem]:
        """
        Tüketiciler için 'Günün Fiyatı Düşenleri & Fırsat Ürünleri' listesi.
        Paralel asyncio.gather ile süper hızlı veri çekimi yapar.
        """
        if not seed_categories:
            seed_categories = ["airfryer", "robot supurge", "kulaklik", "kahve makinesi", "akilli saat"]

        deals: List[DealProductItem] = []
        deal_id = 1

        # Paralel arama
        tasks = [TrendyolService.search_products(query=cat, page=1) for cat in seed_categories[:3]]
        batch_results = await asyncio.gather(*tasks, return_exceptions=True)

        for items in batch_results:
            if not isinstance(items, list):
                continue
            for it in items:
                cur = it.get("current_price", 0.0)
                orig = it.get("original_price")
                if orig and orig > cur:
                    disc_amount = round(orig - cur, 2)
                    disc_pct = round((disc_amount / orig) * 100.0, 1)
                    
                    if disc_pct >= 10.0:  # En az %10 indirimli olanlar
                        deals.append(
                            DealProductItem(
                                id=deal_id,
                                title=it.get("title", ""),
                                brand=it.get("brand"),
                                image_url=it.get("image_url"),
                                current_price=cur,
                                original_price=orig,
                                discount_amount=disc_amount,
                                discount_pct=disc_pct,
                                seller_name=it.get("seller_name"),
                                rating=it.get("rating", 0.0),
                                url=it.get("url", ""),
                                verdict="Süper Fırsat" if disc_pct >= 25 else "İndirimde",
                            )
                        )
                        deal_id += 1

        # İndirim oranına göre büyükten küçüğe sırala
        deals.sort(key=lambda d: d.discount_pct, reverse=True)
        return deals[:12]

    @classmethod
    async def record_search_signal(cls, db: AsyncSession, query: str, category: Optional[str] = None) -> None:
        """Tüketicinin arattığı kelimeyi talep frekansı olarak kaydeder veya günceller."""
        clean_q = query.strip().lower()
        if len(clean_q) < 3:
            return
        try:
            stmt = select(ConsumerSearchSignal).where(ConsumerSearchSignal.query == clean_q)
            res = await db.execute(stmt)
            signal = res.scalar_one_or_none()
            if signal:
                signal.search_count += 1
                signal.last_searched_at = datetime.utcnow()
                if category:
                    signal.category = category
            else:
                db.add(ConsumerSearchSignal(
                    query=clean_q,
                    category=category,
                    search_count=1,
                    last_searched_at=datetime.utcnow()
                ))
            await db.commit()
        except Exception:
            await db.rollback()

    @classmethod
    async def get_trending_signals(cls, db: AsyncSession, limit: int = 15) -> List[Dict[str, Any]]:
        """Satıcılar için: Tüketicilerin en çok arattığı ve fiyat karşılaştırması yaptığı popüler ürün talepleri."""
        stmt = (
            select(ConsumerSearchSignal)
            .order_by(desc(ConsumerSearchSignal.search_count), desc(ConsumerSearchSignal.last_searched_at))
            .limit(limit)
        )
        res = await db.execute(stmt)
        signals = res.scalars().all()
        return [
            {
                "id": s.id,
                "query": s.query,
                "category": s.category or "Genel Pazar",
                "search_count": s.search_count,
                "last_searched_at": s.last_searched_at.isoformat(),
                "demand_level": "Çok Yüksek" if s.search_count >= 10 else ("Yüksek" if s.search_count >= 5 else "Büyüyen Talep"),
            }
            for s in signals
        ]

    @classmethod
    async def get_arbitrage_radar(cls) -> List[Dict[str, Any]]:
        """
        Satıcı Fiyat Arbitraj Radarı:
        Trendyol, Hepsiburada ve Amazon TR arasındaki fiyat uçurumlarını ve arbitraj kâr marjlarını tespit eder.
        """
        from scraper_engine import TrendyolScraper, HepsiburadaScraper, AmazonTrScraper, N11Scraper, CrossMarketplaceMatcher

        sample_seeds = ["kahve makinesi", "airfryer", "robot supurge", "kulaklik"]
        ty = TrendyolScraper()
        hb = HepsiburadaScraper()
        az = AmazonTrScraper()
        n11 = N11Scraper()

        arbitrage_cards: List[Dict[str, Any]] = []

        for seed in sample_seeds:
            try:
                ty_items = await ty.search(query=seed, page=1, limit=3)
                hb_items = await hb.search(query=seed, page=1, limit=2)
                az_items = await az.search(query=seed, page=1, limit=2)
                n11_items = await n11.search(query=seed, page=1, limit=2)

                matches = CrossMarketplaceMatcher.match_and_aggregate_offers(
                    primary_products=ty_items,
                    secondary_offers=hb_items + az_items + n11_items
                )

                for m in matches:
                    if m["arbitrage_gap"] >= 30.0:
                        primary = m["primary_product"]
                        arbitrage_cards.append({
                            "title": primary.title,
                            "image_url": primary.image_url,
                            "category": seed.title(),
                            "lowest_price": m["lowest_price"],
                            "highest_price": m["highest_price"],
                            "cheapest_marketplace": m["cheapest_marketplace"],
                            "cheapest_seller": m["cheapest_seller"],
                            "arbitrage_gap": m["arbitrage_gap"],
                            "arbitrage_pct": m["arbitrage_pct"],
                            "recommendation": (
                                f"Bu ürün {m['cheapest_marketplace'].upper()}'da ₺{m['lowest_price']:,.0f} iken, "
                                f"diğer pazaryerinde ₺{m['highest_price']:,.0f}'ye kadar satılmaktadır. "
                                f"₺{m['arbitrage_gap']:,.0f} (%{m['arbitrage_pct']}) kâr marjı fırsatı bulunmaktadır."
                            ),
                            "offers": m["offers"]
                        })
            except Exception:
                continue

        # En yüksek arbitraj farkına göre sırala
        arbitrage_cards.sort(key=lambda x: x["arbitrage_gap"], reverse=True)
        return arbitrage_cards[:10]
