import asyncio
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

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
        raw_mp = marketplace.default if hasattr(marketplace, "default") else marketplace
        mp = (str(raw_mp) if raw_mp else "all").lower().strip()
        clean_q = (query or "").strip()
        search_term = f"{clean_q} {category}".strip() if category and category != "Tüm Kategoriler" else clean_q

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

        # 2. Canlı Scraping Taraması
        scraped_items: List[ScrapedProductItem] = []

        if mp == "trendyol":
            scraper = TrendyolScraper()
            scraped_items = await scraper.search(query=search_term, page=page, limit=limit)
        elif mp == "hepsiburada":
            scraper = HepsiburadaScraper()
            scraped_items = await scraper.search(query=search_term, page=page, limit=limit)
        elif mp == "amazon" or mp == "amazon tr":
            scraper = AmazonTrScraper()
            scraped_items = await scraper.search(query=search_term, page=page, limit=limit)
        elif mp == "n11":
            scraper = N11Scraper()
            scraped_items = await scraper.search(query=search_term, page=page, limit=limit)
        else:
            # "all" (Tüm Pazaryerleri): 4 pazaryeri paralel taranır
            ty_scraper = TrendyolScraper()
            hb_scraper = HepsiburadaScraper()
            az_scraper = AmazonTrScraper()
            n11_scraper = N11Scraper()

            sub_limit = max(6, limit // 3)
            tasks = [
                ty_scraper.search(query=search_term, page=page, limit=sub_limit),
                hb_scraper.search(query=search_term, page=page, limit=sub_limit),
                az_scraper.search(query=search_term, page=page, limit=sub_limit),
                n11_scraper.search(query=search_term, page=page, limit=sub_limit),
            ]
            batch_res = await asyncio.gather(*tasks, return_exceptions=True)

            # Sonuçları dengeli şekilde harmanla (round-robin interleave)
            valid_lists: List[List[ScrapedProductItem]] = []
            for r in batch_res:
                if isinstance(r, list) and r:
                    valid_lists.append(r)

            max_len = max([len(l) for l in valid_lists], default=0)
            for i in range(max_len):
                for l in valid_lists:
                    if i < len(l):
                        scraped_items.append(l[i])

        if not scraped_items and mp != "trendyol":
            # Hedef pazaryerinde sonuç bulunamazsa yedek olarak Trendyol dene
            try:
                fallback_ty = TrendyolScraper()
                scraped_items = await fallback_ty.search(query=search_term, page=page, limit=limit)
            except Exception:
                pass

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
                        .options(selectinload(Product.price_history), selectinload(Product.alerts))
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
                            db.add(
                                PriceHistory(
                                    product_id=existing.id,
                                    price=item.current_price,
                                    seller_name=item.seller_name,
                                    timestamp=datetime.utcnow(),
                                )
                            )
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
                        )
                        db.add(new_p)
                        await db.flush()

                        db.add(
                            PriceHistory(
                                product_id=new_p.id,
                                price=item.current_price,
                                seller_name=item.seller_name,
                                timestamp=datetime.utcnow(),
                            )
                        )
                        results.append(new_p)
                except Exception:
                    continue
            else:
                # DB yoksa geçici model nesnesi oluştur
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
                    seller_name=item.seller_name,
                    rating=item.rating,
                    review_count=item.review_count,
                    estimated_monthly_sales=monthly_sales,
                    estimated_monthly_revenue=monthly_revenue,
                    opportunity_score=opp_score,
                    demand_score=metrics["demand_score"],
                    competition_score=metrics["competition_score"],
                    economics_score=metrics["economics_score"],
                    in_cart_count=in_cart,
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
    ) -> List[Product]:
        """15 dakikalık taze önbellek kontrolü"""
        cutoff = datetime.utcnow() - timedelta(minutes=cls.CACHE_DURATION_MINUTES)
        tokens = [t.strip().lower() for t in search_term.split() if len(t.strip()) > 2]

        stmt = (
            select(Product)
            .options(selectinload(Product.price_history), selectinload(Product.alerts))
            .where(Product.updated_at >= cutoff)
        )

        if marketplace != "all":
            stmt = stmt.where(Product.marketplace == marketplace)

        if tokens:
            for token in tokens[:2]:  # İlk 2 anahtar kelimeye göre ara
                stmt = stmt.where(Product.title.ilike(f"%{token}%"))

        stmt = stmt.limit(limit)
        res = await db.execute(stmt)
        return list(res.scalars().all())

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
