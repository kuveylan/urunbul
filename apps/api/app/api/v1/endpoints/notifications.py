from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.product import Product, PriceAlert
from app.schemas.optimizer import SystemNotification

router = APIRouter()


@router.get("", response_model=List[SystemNotification])
async def get_notifications(
    db: AsyncSession = Depends(get_db),
):
    """
    Veritabanındaki gerçek sinyallere (tetiklenen fiyat alarmları, yüksek fırsat skorlu ürünler
    ve takibe alınan rakip ürün hareketleri) dayalı dinamik sistem bildirimleri.
    """
    notifications: List[SystemNotification] = []
    notif_id = 1

    try:
        # 1. Gerçek Fiyat Düşüş ve Buybox Kaybı Alarmları (Tetiklenenler)
        stmt_alerts = (
            select(PriceAlert)
            .options(selectinload(PriceAlert.product))
            .where(PriceAlert.is_triggered == True)
            .order_by(desc(PriceAlert.created_at))
            .limit(5)
        )
        res_alerts = await db.execute(stmt_alerts)
        alerts = res_alerts.scalars().all()

        for a in alerts:
            prod_title = a.product.title if a.product else "Takipteki Ürün"
            current_p = a.product.current_price if a.product else a.target_price
            alert_type = getattr(a, "alert_type", "price_drop")

            if alert_type == "buybox_lost":
                seller = a.product.seller_name if a.product else "Rakip Satıcı"
                notifications.append(
                    SystemNotification(
                        id=notif_id,
                        title="⚠️ Buybox Kaybedildi!",
                        message=f"'{prod_title[:45]}...' ürününde Buybox el değiştirdi! Güncel Buybox kazananı: {seller} (₺{current_p:,.0f}).",
                        type="BUYBOX_LOST",
                        timestamp="Canlı Alarm",
                        is_read=False,
                    )
                )
            else:
                notifications.append(
                    SystemNotification(
                        id=notif_id,
                        title="🎉 Fiyat Alarmı Tetiklendi!",
                        message=f"'{prod_title[:45]}...' ürünü hedeflediğiniz ₺{a.target_price:,.0f} seviyesinin altına indi (Anlık: ₺{current_p:,.0f}).",
                        type="PRICE_DROP",
                        timestamp="Yeni",
                        is_read=False,
                    )
                )
            notif_id += 1

        # 2. Yüksek Fırsat Skorlu Ürünler
        stmt_opp = (
            select(Product)
            .where(Product.opportunity_score >= 70.0)
            .order_by(desc(Product.opportunity_score))
            .limit(3)
        )
        res_opp = await db.execute(stmt_opp)
        opp_prods = res_opp.scalars().all()

        for p in opp_prods:
            cat = p.category_name or "Pazaryeri"
            notifications.append(
                SystemNotification(
                    id=notif_id,
                    title="⚡ Yüksek Fırsat Skoru Tespit Edildi!",
                    message=f"'{p.title[:45]}...' ürünü {p.opportunity_score} pazar fırsat skoru ile öne çıkıyor.",
                    type="OPPORTUNITY",
                    timestamp="Piyasa Taraması",
                    is_read=False,
                )
            )
            notif_id += 1

        # 3. Takipteki Ürünlerin Durumu
        stmt_tracked = (
            select(Product)
            .where(Product.is_tracked == True)
            .order_by(desc(Product.updated_at))
            .limit(2)
        )
        res_tracked = await db.execute(stmt_tracked)
        tracked_prods = res_tracked.scalars().all()

        for p in tracked_prods:
            notifications.append(
                SystemNotification(
                    id=notif_id,
                    title="🔔 Takip Listesi Güncellemesi",
                    message=f"Takip ettiğiniz '{p.title[:45]}...' ürünü anlık ₺{p.current_price:,.0f} fiyat seviyesinde izleniyor.",
                    type="COMPETITOR",
                    timestamp="Aktif İzleme",
                    is_read=True,
                )
            )
            notif_id += 1

    except Exception as e:
        # DB sorgulama hatasında güvenli fallback
        pass

    # Eğer henüz bildirim üretecek veri yoksa rehber bildirimler sun
    if not notifications:
        notifications = [
            SystemNotification(
                id=1,
                title="🚀 ÜrünBul Pazar Radarı Devrede",
                message="Trendyol ürünlerini tarayarak fırsat skoru yüksek nişleri keşfetmeye başlayabilirsiniz.",
                type="SYSTEM",
                timestamp="Şimdi",
                is_read=False,
            ),
            SystemNotification(
                id=2,
                title="💡 Fiyat Alarmı Kurma İpucu",
                message="Herhangi bir ürünün detayından fiyat alarmı kurarak düşüşleri anlık yakalayabilirsiniz.",
                type="SYSTEM",
                timestamp="Bilgi",
                is_read=True,
            ),
        ]

    return notifications
