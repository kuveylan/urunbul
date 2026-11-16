from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import validate_email_format
from app.models.product import Product, PriceAlert
from app.schemas.product import PriceAlertCreate
from app.schemas.consumer import (
    DetailedComparisonResponse,
    DealProductItem,
    ActivePriceAlertItem,
)
from app.services.consumer_service import ConsumerService

router = APIRouter()


@router.get("", response_model=DetailedComparisonResponse)
async def compare_prices(
    q: str = Query(..., description="Karşılaştırılacak ürün adı veya modeli (örn: iPhone 15, Dyson V15, Airfryer)"),
    db: AsyncSession = Depends(get_db),
):
    """
    Çoklu Satıcı Fiyat Karşılaştırması:
    Belirtilen ürün için piyasadaki satıcı tekliflerini toplar,
    en ucuz teklifi, 'Bu Fiyat İyi mi?' analizini ve satıcı sıralı teklif listesini döndürür.
    """
    result = await ConsumerService.compare_offers(query=q, db=db)
    if not result:
        raise HTTPException(status_code=404, detail="Karşılaştırılacak ürün teklifi bulunamadı.")
    return result


@router.get("/deals", response_model=List[DealProductItem])
async def get_daily_deals():
    """
    Tüketici Vitrini:
    Trendyol'da şu an en yüksek indirim oranına sahip gerçek fırsat ürünlerini listeler.
    """
    deals = await ConsumerService.get_daily_deals()
    return deals


@router.get("/arbitrage")
async def get_arbitrage_radar():
    """
    Pazaryeri Fiyat Arbitraj Radarı:
    Trendyol, Hepsiburada ve Amazon TR arasındaki fiyat uçurumlarını ve arbitraj kâr marjlarını döner.
    """
    return await ConsumerService.get_arbitrage_radar()


@router.get("/signals")
async def get_consumer_signals(
    db: AsyncSession = Depends(get_db),
):
    """
    Tüketici Talep & Arama Sinyalleri (Cimri/Akakçe Trendleri):
    Tüketicilerin en çok fiyat karşılaştırması yaptığı ve alarm kurduğu yükselen ürün talepleri.
    """
    return await ConsumerService.get_trending_signals(db=db)


@router.get("/alerts", response_model=List[ActivePriceAlertItem])
async def get_active_consumer_alerts(
    db: AsyncSession = Depends(get_db),
):
    """
    Tüketicinin kurduğu tüm aktif fiyat alarmlarını ve anlık fiyat farkını listeler.
    """
    stmt = (
        select(PriceAlert)
        .options(selectinload(PriceAlert.product))
        .order_by(desc(PriceAlert.created_at))
    )
    result = await db.execute(stmt)
    alerts = result.scalars().all()

    alert_items: List[ActivePriceAlertItem] = []
    for a in alerts:
        prod = a.product
        if not prod:
            continue

        price_diff = round(prod.current_price - a.target_price, 2)
        alert_items.append(
            ActivePriceAlertItem(
                alert_id=a.id,
                product_id=prod.id,
                product_title=prod.title,
                product_image=prod.image_url,
                current_price=prod.current_price,
                target_price=a.target_price,
                price_difference=price_diff,
                is_triggered=prod.current_price <= a.target_price,
                user_email=a.user_email,
                product_url=prod.url,
                created_at=a.created_at,
            )
        )

    return alert_items


@router.post("/alerts", response_model=ActivePriceAlertItem)
async def create_consumer_price_alert(
    alert_in: PriceAlertCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Tüketici Modu için yeni Fiyat Alarmı oluşturur.
    """
    if not alert_in.product_id:
        raise HTTPException(status_code=400, detail="product_id zorunludur")

    if alert_in.user_email and not validate_email_format(alert_in.user_email):
        raise HTTPException(status_code=400, detail="Geçersiz e-posta formatı.")

    if not alert_in.target_price or alert_in.target_price <= 0:
        raise HTTPException(status_code=400, detail="Hedef fiyat 0'dan büyük olmalıdır.")

    stmt = select(Product).where(Product.id == alert_in.product_id)
    res = await db.execute(stmt)
    product = res.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")

    if alert_in.target_price > product.current_price * 1.5:
        raise HTTPException(status_code=400, detail="Hedef fiyat mevcut fiyattan mantıksız derecede yüksek olamaz.")

    alert = PriceAlert(
        product_id=product.id,
        target_price=alert_in.target_price,
        user_email=alert_in.user_email,
        is_triggered=product.current_price <= alert_in.target_price,
    )
    db.add(alert)
    await db.commit()
    await db.refresh(alert)

    price_diff = round(product.current_price - alert.target_price, 2)
    return ActivePriceAlertItem(
        alert_id=alert.id,
        product_id=product.id,
        product_title=product.title,
        product_image=product.image_url,
        current_price=product.current_price,
        target_price=alert.target_price,
        price_difference=price_diff,
        is_triggered=alert.is_triggered,
        user_email=alert.user_email,
        product_url=product.url,
        created_at=alert.created_at,
    )


@router.delete("/alerts/{alert_id}")
async def delete_consumer_alert(
    alert_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Fiyat alarmını siler.
    """
    stmt = select(PriceAlert).where(PriceAlert.id == alert_id)
    result = await db.execute(stmt)
    alert = result.scalar_one_or_none()

    if not alert:
        raise HTTPException(status_code=404, detail="Alarm bulunamadı")

    await db.delete(alert)
    await db.commit()
    return {"message": "Fiyat alarmı başarıyla kaldırıldı", "alert_id": alert_id}
