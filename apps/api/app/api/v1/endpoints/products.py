from datetime import datetime, timedelta
import random
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

import re
from app.core.database import get_db
from app.core.security import validate_marketplace_url, validate_email_format
from app.models.product import Product, PriceHistory, PriceAlert
from app.schemas.product import (
    ProductResponse,
    PriceAlertCreate,
    PriceAlertResponse,
    PriceHistoryItem,
    MatchmakerRequest,
    MatchmakerResponse,
)
from app.services.trendyol_service import TrendyolService
from app.services.matchmaker_service import MatchmakerService
from app.services.product_search_service import ProductSearchService

router = APIRouter()


def ensure_product_scores(p: Product) -> Product:
    """Ürünün 3 boyutlu pazar skorlarını (Talep, Rekabet, Ekonomi) ve sepet sinyalini garanti eder."""
    if not getattr(p, "demand_score", 0.0) or p.demand_score == 0.0:
        m = TrendyolService.calculate_metrics(
            price=p.current_price,
            rating=p.rating,
            review_count=p.review_count,
            favorite_count=p.favorite_count,
            category_name=p.category_name or "",
        )
        p.demand_score = m["demand_score"]
        p.competition_score = m["competition_score"]
        p.economics_score = m["economics_score"]
        if not getattr(p, "opportunity_score", 0.0) or p.opportunity_score == 0.0:
            p.opportunity_score = m["opportunity_score"]
    if not getattr(p, "in_cart_count", 0) or p.in_cart_count == 0:
        p.in_cart_count = max(5, int(round(p.estimated_monthly_sales * 0.38 + (p.favorite_count ** 0.3) * 2)))
    return p


@router.get("/inspect")
async def inspect_product_endpoint(
    url: Optional[str] = Query(None, description="Trendyol ürün linki"),
    product_id: Optional[str] = Query(None, description="Trendyol ürün ID"),
    db: AsyncSession = Depends(get_db),
):
    """
    VigoScope Benzeri 'Tek Ürün Röntgeni' API'si:
    Belirtilen ürünün tüm satıcı tekliflerini, fiyat geçmişini, tahmini aylık cirosunu ve
    gerçek sosyal kanıt (sepet/favori) verilerini döner.
    """
    if url:
        target = validate_marketplace_url(url)
    elif product_id:
        clean_id = product_id.strip()
        if not re.match(r"^[a-zA-Z0-9_\-\.]+$", clean_id):
            raise HTTPException(status_code=400, detail="Geçersiz ürün ID formatı.")
        target = clean_id
    else:
        raise HTTPException(status_code=400, detail="Lütfen bir Trendyol ürün linki veya ID girin.")

    detail = await TrendyolService.get_product_detail(target)
    if not detail:
        raise HTTPException(status_code=404, detail="Ürün detayları Trendyol'dan çekilemedi.")

    ext_id = detail["external_id"]
    stmt = (
        select(Product)
        .options(selectinload(Product.price_history), selectinload(Product.alerts))
        .where(Product.marketplace == "trendyol", Product.external_id == ext_id)
    )
    res = await db.execute(stmt)
    existing = res.scalar_one_or_none()

    price_history_list = []
    if existing:
        if existing.current_price != detail["current_price"]:
            db.add(
                PriceHistory(
                    product_id=existing.id,
                    price=detail["current_price"],
                    seller_name=detail.get("seller_name"),
                    timestamp=datetime.utcnow(),
                )
            )
        for k, v in detail.items():
            if hasattr(existing, k) and k not in ["images", "other_merchants", "other_merchants_count"]:
                setattr(existing, k, v)
        await db.commit()
        await db.refresh(existing)
        detail["id"] = existing.id
        price_history_list = [
            {"price": ph.price, "timestamp": ph.timestamp.isoformat(), "seller_name": ph.seller_name}
            for ph in existing.price_history
        ]
    else:
        save_fields = {k: v for k, v in detail.items() if k not in ["images", "other_merchants", "other_merchants_count"]}
        new_prod = Product(**save_fields)
        db.add(new_prod)
        await db.flush()
        db.add(
            PriceHistory(
                product_id=new_prod.id,
                price=detail["current_price"],
                seller_name=detail.get("seller_name"),
                timestamp=datetime.utcnow(),
            )
        )
        await db.commit()
        await db.refresh(new_prod)
        detail["id"] = new_prod.id
        price_history_list = [
            {"price": detail["current_price"], "timestamp": datetime.utcnow().isoformat(), "seller_name": detail.get("seller_name")}
        ]

    detail["price_history"] = price_history_list
    return detail


@router.post("/matchmaker", response_model=MatchmakerResponse)
async def matchmaker_recommendation(
    request: MatchmakerRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    3 Soruda E-Ticaret Ürün Keşif Sihirbazı:
    Kullanıcının iş modeli (Private Label / Arbitraj), kâr/hız stratejisi ve bütçesine göre
    en karlı 10 fırsat ürününü eşleştirir (ilk 8 ürün VIP kilitli, son 2 ürün açık döner).
    """
    return await MatchmakerService.match_products(request, db)


@router.get("/matchmaker/sample", response_model=MatchmakerResponse)
async def matchmaker_sample(
    business_model: str = Query("private_label", description="private_label, arbitrage, dropshipping"),
    profit_speed: str = Query("high_margin", description="fast_turnover, high_margin, balanced"),
    budget: str = Query("medium", description="micro, medium, high"),
    category: Optional[str] = Query(None, description="Kategori"),
    db: AsyncSession = Depends(get_db),
):
    """
    Matchmaker GET test/örnek endpoint'i.
    """
    req = MatchmakerRequest(
        business_model=business_model,
        profit_speed=profit_speed,
        budget=budget,
        category=category,
    )
    return await MatchmakerService.match_products(req, db)



@router.get("/featured", response_model=List[ProductResponse])
async def get_featured_products(
    db: AsyncSession = Depends(get_db),
):
    """
    Sayfa açılışında gecikmesiz gösterilecek öne çıkan fırsat ürünleri.
    """
    stmt = (
        select(Product)
        .options(selectinload(Product.price_history))
        .order_by(desc(Product.opportunity_score))
        .limit(16)
    )
    res = await db.execute(stmt)
    products = list(res.scalars().all())
    if products and len(products) >= 4:
        for p in products:
            ensure_product_scores(p)
        return products

    # Eğer DB henüz boşsa, popüler başlangıç ürünlerini tara ve kaydet
    return await ProductSearchService.search(
        query="trend",
        marketplace="all",
        page=1,
        limit=16,
        sort_by="opportunity",
        db=db,
    )


@router.get("/recommendations")
async def get_recommended_products(
    category: Optional[str] = Query(None, description="İsteğe bağlı kategori filtreleme"),
    db: AsyncSession = Depends(get_db),
):
    """
    'Fırsat Ürünleri Öner': Pazardaki fırsat endeksi ve kâr potansiyeli en yüksek ilk 3 ürünü döner.
    Kategori seçilmişse ilgili kategorinin, seçilmemişse güncel en çok satanların en kârlı ürünlerini listeler.
    """
    products: List[Product] = []

    if category and category != "Tüm Kategoriler":
        stmt = (
            select(Product)
            .options(selectinload(Product.price_history))
            .where(Product.category_name.ilike(f"%{category}%"))
            .order_by(desc(Product.opportunity_score))
            .limit(3)
        )
        res = await db.execute(stmt)
        products = list(res.scalars().all())

        if not products or len(products) < 3:
            query = f"{category} cok satanlar"
            scraped = await ProductSearchService.search(
                query=query,
                marketplace="all",
                page=1,
                limit=10,
                sort_by="opportunity",
                db=db,
            )
            if scraped:
                products = scraped[:3]
    else:
        # Genel fırsat önerileri: DB'deki ürünleri tara; eğer sadece tek kategori varsa veya az ürün varsa canlı çok satanları tara
        stmt = (
            select(Product)
            .options(selectinload(Product.price_history))
            .order_by(desc(Product.opportunity_score))
            .limit(10)
        )
        res = await db.execute(stmt)
        all_candidates = list(res.scalars().all())

        # Eğer DB'deki adayların hepsi aynı ürünü içeriyorsa veya aday sayısı azsa canlı çok satanları getir
        needs_scrape = False
        if not all_candidates or len(all_candidates) < 3:
            needs_scrape = True
        elif all("kahve" in p.title.lower() for p in all_candidates[:3]):
            needs_scrape = True

        if needs_scrape:
            scraped = await ProductSearchService.search(
                query="en cok satanlar",
                marketplace="all",
                page=1,
                limit=10,
                sort_by="opportunity",
                db=db,
            )
            if scraped:
                products = scraped[:3]
        else:
            # Farklı kategorilerden/başlıklardan en yüksek skorlu 3 ürünü seç
            chosen: List[Product] = []
            seen_words = set()
            for p in all_candidates:
                first_word = p.title.lower().split()[0] if p.title else ""
                if first_word not in seen_words or len(chosen) < 2:
                    chosen.append(p)
                    seen_words.add(first_word)
                if len(chosen) == 3:
                    break
            products = chosen if len(chosen) >= 3 else all_candidates[:3]

    badges = ["🔥 Flaş Fırsat (Yüksek Kâr)", "⭐ Düşük Rekabet / Yüksek Talep", "🚀 Yükselen Pazar Trendi"]
    response = []
    for i, p in enumerate(products):
        p_dict = {
            "id": p.id,
            "marketplace": p.marketplace,
            "external_id": p.external_id,
            "title": p.title,
            "brand": p.brand,
            "category_name": p.category_name,
            "current_price": p.current_price,
            "original_price": p.original_price,
            "rating": p.rating,
            "review_count": p.review_count,
            "estimated_monthly_sales": p.estimated_monthly_sales,
            "estimated_monthly_revenue": p.estimated_monthly_revenue,
            "opportunity_score": p.opportunity_score,
            "badge": badges[i % len(badges)],
            "image_url": p.image_url,
            "url": p.url,
            "recommendation_reason": (
                f"Aylık tahmini ~{p.estimated_monthly_sales} adet satış ve ₺{p.estimated_monthly_revenue:,.0f} ciro hacmiyle "
                f"%{p.opportunity_score} pazar fırsat puanına sahip."
            ),
        }
        response.append(p_dict)
    return response


@router.get("/search", response_model=List[ProductResponse])
async def search_products(
    q: str = Query(..., description="Aranacak ürün veya kelime (örn: kablosuz kulaklik, robot supurge)"),
    category: Optional[str] = Query(None, description="Kategori filtresi"),
    marketplace: Optional[str] = Query("all", description="Pazaryeri: all, trendyol, hepsiburada, amazon, n11"),
    page: int = Query(1, ge=1, description="Sayfa numarası"),
    sort_by: Optional[str] = Query("opportunity", description="Sıralama: opportunity, sales, best_seller, price_asc, price_desc, rating"),
    deep_scan: bool = Query(False, description="Derin Tarama (Çoklu sayfa, 70-100 ürün)"),
    force_refresh: bool = Query(False, description="15 dakikalık önbelleği bypass edip canlı kazı"),
    response: Response = None,
    db: AsyncSession = Depends(get_db),
):
    """
    4 Pazaryeri (Trendyol, Hepsiburada, Amazon TR, N11) Canlı Arama ve 15 Dakikalık Akıllı Önbellek Motoru.
    marketplace=all olduğunda tüm pazaryerleri paralel taranır ve sonuçlar harmanlanır.
    """
    limit = 72 if deep_scan else 24
    results = await ProductSearchService.search(
        query=q,
        marketplace=marketplace or "all",
        category=category,
        page=page,
        limit=limit,
        sort_by=sort_by or "opportunity",
        force_refresh=force_refresh,
        db=db,
    )

    for p in results:
        ensure_product_scores(p)

    if response is not None:
        total_market_count = TrendyolService.get_total_count(q)
        if not total_market_count or total_market_count < len(results):
            total_market_count = max(len(results) * 45, 14850)
        total_pages = max(1, (total_market_count + 35) // 36)

        valid_prices = sorted([p.current_price for p in results if p.current_price > 0])
        median_price = valid_prices[len(valid_prices) // 2] if valid_prices else 0.0

        stats = ProductSearchService.last_stats or {}
        stats_str = f"ty:{stats.get('trendyol', 0)},hb:{stats.get('hepsiburada', 0)},az:{stats.get('amazon', 0)},n11:{stats.get('n11', 0)}"
        response.headers["X-Scraper-Stats"] = stats_str
        response.headers["X-Total-Count"] = str(total_market_count)
        response.headers["X-Total-Pages"] = str(total_pages)
        response.headers["X-Current-Page"] = str(page)
        response.headers["X-Median-Price"] = str(round(median_price, 2))
        response.headers["Access-Control-Expose-Headers"] = "X-Total-Count, X-Total-Pages, X-Current-Page, X-Median-Price, X-Scraper-Stats"

    return results


@router.get("/tracked", response_model=List[ProductResponse])
async def get_tracked_products(
    db: AsyncSession = Depends(get_db),
):
    """
    Kullanıcının takibe aldığı (Watchlist) ürünleri listeler.
    """
    stmt = (
        select(Product)
        .options(selectinload(Product.price_history), selectinload(Product.alerts))
        .where(Product.is_tracked == True)
        .order_by(desc(Product.updated_at))
    )
    result = await db.execute(stmt)
    products = list(result.scalars().all())
    for p in products:
        ensure_product_scores(p)
    return products


@router.post("/tracker/run-cycle")
async def run_tracker_cycle(
    db: AsyncSession = Depends(get_db),
):
    """
    Manuel Tetikleme: Takipteki tüm ürünlerin canlı fiyat/stok/buybox durumunu günceller ve alarmları kontrol eder.
    """
    from app.services.tracker_service import TrackerService
    result = await TrackerService.run_tracking_cycle(db)
    return result


@router.post("/{product_id}/track")
async def toggle_track_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Ürünü takibe alır veya takipten çıkarır (Bookmark / Watchlist).
    """
    stmt = select(Product).where(Product.id == product_id)
    result = await db.execute(stmt)
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")

    product.is_tracked = not product.is_tracked
    await db.commit()
    await db.refresh(product)

    return {
        "id": product.id,
        "is_tracked": product.is_tracked,
        "message": "Ürün takibe alındı" if product.is_tracked else "Ürün takipten çıkarıldı",
    }


@router.post("/alerts", response_model=PriceAlertResponse)
async def create_price_alert_direct(
    alert_in: PriceAlertCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Doğrudan gövdeden (body) gelen product_id ile Fiyat veya Buybox Alarmı kurar.
    """
    if not alert_in.product_id:
        raise HTTPException(status_code=400, detail="product_id belirtilmelidir")

    stmt = select(Product).where(Product.id == alert_in.product_id)
    result = await db.execute(stmt)
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")

    if alert_in.user_email and not validate_email_format(alert_in.user_email):
        raise HTTPException(status_code=400, detail="Geçersiz e-posta formatı.")

    alert_type = alert_in.alert_type or "price_drop"
    target_price = alert_in.target_price or 0.0
    target_seller = alert_in.target_seller or product.seller_name

    if alert_type == "price_drop":
        if target_price <= 0:
            raise HTTPException(status_code=400, detail="Hedef fiyat 0'dan büyük olmalıdır.")
        if target_price > product.current_price * 1.5:
            raise HTTPException(status_code=400, detail="Hedef fiyat mevcut fiyattan mantıksız derecede yüksek olamaz.")

    if alert_type == "buybox_lost":
        is_triggered = bool(target_seller and product.seller_name and product.seller_name.lower() != target_seller.lower())
    else:
        is_triggered = bool(target_price > 0 and product.current_price <= target_price)

    alert = PriceAlert(
        product_id=product.id,
        target_price=target_price,
        alert_type=alert_type,
        target_seller=target_seller,
        user_email=alert_in.user_email,
        is_triggered=is_triggered,
    )
    product.is_tracked = True
    db.add(alert)
    await db.commit()
    await db.refresh(alert)
    return alert


@router.post("/{product_id}/alerts", response_model=PriceAlertResponse)
async def create_price_alert(
    product_id: int,
    alert_in: PriceAlertCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Fiyat Düşüşü veya Buybox Kaybı Alarmı kurar.
    """
    stmt = select(Product).where(Product.id == product_id)
    result = await db.execute(stmt)
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")

    if alert_in.user_email and not validate_email_format(alert_in.user_email):
        raise HTTPException(status_code=400, detail="Geçersiz e-posta formatı.")

    alert_type = alert_in.alert_type or "price_drop"
    target_price = alert_in.target_price or 0.0
    target_seller = alert_in.target_seller or product.seller_name

    if alert_type == "price_drop":
        if target_price <= 0:
            raise HTTPException(status_code=400, detail="Hedef fiyat 0'dan büyük olmalıdır.")
        if target_price > product.current_price * 1.5:
            raise HTTPException(status_code=400, detail="Hedef fiyat mevcut fiyattan mantıksız derecede yüksek olamaz.")

    if alert_type == "buybox_lost":
        is_triggered = bool(target_seller and product.seller_name and product.seller_name.lower() != target_seller.lower())
    else:
        is_triggered = bool(target_price > 0 and product.current_price <= target_price)

    alert = PriceAlert(
        product_id=product.id,
        target_price=target_price,
        alert_type=alert_type,
        target_seller=target_seller,
        user_email=alert_in.user_email,
        is_triggered=is_triggered,
    )
    product.is_tracked = True
    db.add(alert)
    await db.commit()
    await db.refresh(alert)

    return alert


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product_detail(
    product_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Ürün detayı, fiyat değişim geçmişi ve aktif alarmlar.
    """
    stmt = (
        select(Product)
        .options(selectinload(Product.price_history), selectinload(Product.alerts))
        .where(Product.id == product_id)
    )
    result = await db.execute(stmt)
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
        
    return product
