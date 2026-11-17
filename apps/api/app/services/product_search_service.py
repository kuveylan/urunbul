import asyncio
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, or_
from sqlalchemy.orm import selectinload
from loguru import logger

from app.models.product import Product, PriceHistory
from app.services.trendyol_service import TrendyolService
from scraper_engine import (
    TrendyolScraper,
    HepsiburadaScraper,
    AmazonTrScraper,
    N11Scraper,
    ScrapedProductItem,
)


class ProductSearchService:
    CACHE_DURATION_MINUTES = 15
    last_stats: Dict[str, int] = {"trendyol": 0, "hepsiburada": 0, "amazon": 0, "n11": 0}

    @classmethod
    async def search(
        cls,
        query: str,
        marketplace: str = "all",
        category: Optional[str] = None,
        page: int = 1,
        limit: int = 24,
        sort_by: str = "opportunity",
        force_refresh: bool = False,
        db: Optional[AsyncSession] = None,
    ) -> List[Product]:
        """
        4 Pazaryeri (Trendyol, Hepsiburada, Amazon TR, N11) Canlı Arama ve 15 Dakikalık Akıllı Önbellek Servisi
        """
        # 1. Akıllı & Temiz Arama Terimi Çözümleyici
        raw_mp = marketplace.default if hasattr(marketplace, "default") else marketplace
        mp = (str(raw_mp) if raw_mp else "all").lower().strip()
        clean_q = (query or "").strip()
        
        is_generic = not clean_q or clean_q.lower() in ["trend", "fırsat", "cok satanlar", "çok satanlar", "firsat"]
        has_category = bool(category and category.strip() and category != "Tüm Kategoriler")

        if is_generic and has_category:
            # Sadece kategori seçilmişse doğrudan temiz kategori adı aranır (Örn: "Elektronik", "Ev Aletleri")
            search_term = category.strip()
        elif is_generic and not has_category:
            # Hem kelime hem kategori boşsa popüler yüksek talep e-ticaret tohumu aranır
            search_term = "cok satanlar"
        elif not is_generic and has_category:
            # Hem kelime hem kategori girilmişse ve kategori zaten kelimede yoksa birleştirilir
            if category.lower() in clean_q.lower():
                search_term = clean_q
            else:
                search_term = f"{clean_q} {category}".strip()
        else:
            search_term = clean_q

        # 1. 15 Dakikalık Akıllı SQLite Önbellek Kontrolü
        if db and not force_refresh and search_term:
            cached = await cls._check_cache(
                search_term=search_term,
                marketplace=mp,
                db=db,
                limit=limit,
            )
            if cached and len(cached) >= 4:
                return cls._sort_products(cached, sort_by)

        # 2. Canlı Scraping Taraması (Her pazaryeri bağımsız zaman aşımı ile korunur)
        scraped_items: List[ScrapedProductItem] = []
        cls.last_stats = {"trendyol": 0, "hepsiburada": 0, "amazon": 0, "n11": 0}

        async def run_scraper_safe(scraper, name: str, lim: int) -> List[ScrapedProductItem]:
            try:
                res = await asyncio.wait_for(
                    scraper.search(query=search_term, page=page, limit=lim),
                    timeout=12.0
                )
                return res if isinstance(res, list) else []
            except Exception as e:
                logger.warning(f"{name} kazıma hatası: {e}")
                return []

        try:
            if mp == "trendyol":
                scraped_items = await run_scraper_safe(TrendyolScraper(), "Trendyol", limit)
                cls.last_stats["trendyol"] = len(scraped_items)
            elif mp == "hepsiburada":
                scraped_items = await run_scraper_safe(HepsiburadaScraper(), "Hepsiburada", limit)
                cls.last_stats["hepsiburada"] = len(scraped_items)
            elif mp in ["amazon", "amazon tr"]:
                scraped_items = await run_scraper_safe(AmazonTrScraper(), "Amazon", limit)
                cls.last_stats["amazon"] = len(scraped_items)
            elif mp == "n11":
                scraped_items = await run_scraper_safe(N11Scraper(), "N11", limit)
                cls.last_stats["n11"] = len(scraped_items)
            else:
                # "all" (Tüm Pazaryerleri): 4 pazaryeri paralel taranır
                # Her marketplace limit/2 ürün çeker → 4 marketplace × limit/2 = 2×limit ham veri
                sub_limit = max(12, limit // 2)
                results_batch = await asyncio.gather(
                    run_scraper_safe(TrendyolScraper(), "Trendyol", sub_limit),
                    run_scraper_safe(HepsiburadaScraper(), "Hepsiburada", sub_limit),
                    run_scraper_safe(AmazonTrScraper(), "Amazon", sub_limit),
                    run_scraper_safe(N11Scraper(), "N11", sub_limit),
                    return_exceptions=True
                )
                ty_items = results_batch[0] if isinstance(results_batch[0], list) else []
                hb_items = results_batch[1] if isinstance(results_batch[1], list) else []
                az_items = results_batch[2] if isinstance(results_batch[2], list) else []
                n11_items = results_batch[3] if isinstance(results_batch[3], list) else []

                cls.last_stats = {
                    "trendyol": len(ty_items),
                    "hepsiburada": len(hb_items),
                    "amazon": len(az_items),
                    "n11": len(n11_items),
                }

                # Sonuçları dengeli şekilde harmanla (round-robin interleave)
                valid_lists = [l for l in [ty_items, hb_items, az_items, n11_items] if l]
                max_len = max([len(l) for l in valid_lists], default=0)
                for i in range(max_len):
                    for l in valid_lists:
                        if i < len(l):
                            scraped_items.append(l[i])
        except Exception as e:
            logger.warning(f"Paralel kazıma genel hatası: {e}")

        if not scraped_items and mp != "trendyol":
            # Hedef pazaryerinde sonuç bulunamazsa yedek olarak Trendyol dene
            fallback_items = await run_scraper_safe(TrendyolScraper(), "Trendyol Fallback", limit)
            if fallback_items:
                scraped_items = fallback_items
                cls.last_stats["trendyol"] = len(fallback_items)

        # Eğer canlı kazımadan ürün gelmediyse veritabanındaki ilgili önbelleği getir
        if not scraped_items and db:
            cached_fallback = await cls._check_cache(
                search_term=search_term,
                marketplace=mp,
                db=db,
                limit=limit,
                ignore_expiry=True,
            )
            if cached_fallback:
                return cls._sort_products(cached_fallback, sort_by)

        # 3. Metrik Hesaplama & Veritabanı Kaydı
        results: List[Product] = []

        for item in scraped_items:
            if item.current_price <= 0:
                continue

            # Skor ve Pazar Hacmi Hesaplama
            metrics = TrendyolService.calculate_metrics(
                price=item.current_price,
                rating=item.rating,
                review_count=item.review_count,
                favorite_count=0,
                category_name=item.category_name or "",
            )

            monthly_sales = metrics["estimated_monthly_sales"]
            monthly_revenue = round(monthly_sales * item.current_price, 2)
            opp_score = metrics["opportunity_score"]
            in_cart = max(4, int(round(monthly_sales * 0.35)))

            if db:
                try:
                    stmt = (
                        select(Product)
                        .options(selectinload(Product.price_history))
                        .where(
                            Product.marketplace == item.marketplace,
                            Product.external_id == str(item.external_id),
                        )
                    )
                    res = await db.execute(stmt)
                    existing = res.scalar_one_or_none()

                    if existing:
                        # Fiyat değiştiyse fiyat geçmişine ekle
                        if abs(existing.current_price - item.current_price) >= 0.5:
                            ph = PriceHistory(
                                product_id=existing.id,
                                price=item.current_price,
                                seller_name=item.seller_name,
                                timestamp=datetime.utcnow(),
                            )
                            db.add(ph)
                            try:
                                if existing.price_history is not None:
                                    existing.price_history.append(ph)
                                else:
                                    existing.price_history = [ph]
                            except Exception:
                                pass
                        existing.title = item.title
                        existing.brand = item.brand
                        existing.current_price = item.current_price
                        existing.original_price = item.original_price or existing.original_price
                        existing.seller_name = item.seller_name or existing.seller_name
                        existing.url = item.url or existing.url
                        existing.image_url = item.image_url or existing.image_url
                        existing.rating = item.rating
                        existing.review_count = item.review_count
                        existing.estimated_monthly_sales = monthly_sales
                        existing.estimated_monthly_revenue = monthly_revenue
                        existing.opportunity_score = opp_score
                        existing.demand_score = metrics["demand_score"]
                        existing.competition_score = metrics["competition_score"]
                        existing.economics_score = metrics["economics_score"]
                        existing.in_cart_count = in_cart
                        existing.updated_at = datetime.utcnow()
                        results.append(existing)
                    else:
                        ph = PriceHistory(
                            price=item.current_price,
                            seller_name=item.seller_name,
                            timestamp=datetime.utcnow(),
                        )
                        new_p = Product(
                            marketplace=item.marketplace,
                            external_id=str(item.external_id),
                            title=item.title,
                            brand=item.brand,
                            category_name=item.category_name or "Genel",
                            url=item.url,
                            image_url=item.image_url,
                            current_price=item.current_price,
                            original_price=item.original_price,
                            currency=item.currency or "TRY",
                            seller_name=item.seller_name,
                            seller_id=item.seller_id,
                            rating=item.rating,
                            review_count=item.review_count,
                            favorite_count=0,
                            estimated_monthly_sales=monthly_sales,
                            estimated_monthly_revenue=monthly_revenue,
                            opportunity_score=opp_score,
                            demand_score=metrics["demand_score"],
                            competition_score=metrics["competition_score"],
                            economics_score=metrics["economics_score"],
                            in_cart_count=in_cart,
                            created_at=datetime.utcnow(),
                            updated_at=datetime.utcnow(),
                            price_history=[ph],
                        )
                        db.add(new_p)
                        await db.flush()
                        results.append(new_p)
                except Exception:
                    continue
            else:
                # DB yoksa geçici model nesnesi oluştur
                ph = PriceHistory(
                    price=item.current_price,
                    seller_name=item.seller_name,
                    timestamp=datetime.utcnow(),
                )
                p = Product(
                    id=len(results) + 1,
                    marketplace=item.marketplace,
                    external_id=str(item.external_id),
                    title=item.title,
                    brand=item.brand,
                    category_name=item.category_name or "Genel",
                    url=item.url,
                    image_url=item.image_url,
                    current_price=item.current_price,
                    original_price=item.original_price,
                    currency=item.currency or "TRY",
                    seller_name=item.seller_name,
                    rating=item.rating,
                    review_count=item.review_count,
                    favorite_count=0,
                    estimated_monthly_sales=monthly_sales,
                    estimated_monthly_revenue=monthly_revenue,
                    opportunity_score=opp_score,
                    demand_score=metrics["demand_score"],
                    competition_score=metrics["competition_score"],
                    economics_score=metrics["economics_score"],
                    in_cart_count=in_cart,
                    is_tracked=False,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    price_history=[ph],
                )
                results.append(p)

        if db:
            try:
                await db.commit()
            except Exception:
                await db.rollback()

        return cls._sort_products(results, sort_by)

    @classmethod
    async def _check_cache(
        cls,
        search_term: str,
        marketplace: str,
        db: AsyncSession,
        limit: int = 24,
        ignore_expiry: bool = False,
    ) -> List[Product]:
        """15 dakikalık taze önbellek kontrolü (veya yedek modunda son kayıtlı ürünler)"""
        cutoff = datetime.utcnow() - timedelta(minutes=cls.CACHE_DURATION_MINUTES)
        stop_words = {"trend", "fırsat", "firsat", "cok", "çok", "satanlar", "urun", "ürün"}
        tokens = [t.strip().lower() for t in search_term.split() if len(t.strip()) > 2 and t.strip().lower() not in stop_words]

        stmt = (
            select(Product)
            .options(selectinload(Product.price_history))
        )

        if not ignore_expiry:
            stmt = stmt.where(Product.updated_at >= cutoff)

        if marketplace != "all":
            stmt = stmt.where(Product.marketplace == marketplace)

        if tokens:
            for token in tokens[:2]:  # İlk 2 anahtar kelimeye göre ara (başlık, kategori veya marka)
                stmt = stmt.where(
                    or_(
                        Product.title.ilike(f"%{token}%"),
                        Product.category_name.ilike(f"%{token}%"),
                        Product.brand.ilike(f"%{token}%"),
                    )
                )
        else:
            # Genel sorgularda fırsat puanı yüksek ürünleri önce getir
            stmt = stmt.order_by(desc(Product.opportunity_score))

        stmt = stmt.limit(limit)
        res = await db.execute(stmt)
        products = list(res.scalars().all())

        # Yalnızca spesifik bir arama kelimesi verilmemişse (genel trend/fırsat vitrini) genel yüksek fırsatlı ürünleri getir
        is_general_query = not tokens or any(k in search_term.lower() for k in ["trend", "fırsat", "cok satanlar", "çok satanlar"])
        if not products and ignore_expiry and is_general_query:
            fallback_stmt = (
                select(Product)
                .options(selectinload(Product.price_history))
                .order_by(desc(Product.opportunity_score))
                .limit(limit)
            )
            res_fb = await db.execute(fallback_stmt)
            products = list(res_fb.scalars().all())

        return products

    @classmethod
    def _sort_products(cls, products: List[Product], sort_by: str) -> List[Product]:
        if sort_by in ["sales", "best_seller"]:
            return sorted(products, key=lambda x: getattr(x, "estimated_monthly_sales", 0), reverse=True)
        elif sort_by in ["rating", "most_rated"]:
            return sorted(products, key=lambda x: getattr(x, "rating", 0.0), reverse=True)
        elif sort_by == "price_asc":
            return sorted(products, key=lambda x: getattr(x, "current_price", 0.0))
        elif sort_by == "price_desc":
            return sorted(products, key=lambda x: getattr(x, "current_price", 0.0), reverse=True)
        else:  # default: opportunity
            return sorted(products, key=lambda x: getattr(x, "opportunity_score", 0.0), reverse=True)
