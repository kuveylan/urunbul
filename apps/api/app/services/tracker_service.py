from datetime import datetime
from typing import Dict, Any, List
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.models.product import Product, PriceHistory, PriceAlert, BuyboxRecord, StockRecord
from app.services.trendyol_service import TrendyolService


class TrackerService:
    @classmethod
    async def run_tracking_cycle(cls, db: AsyncSession) -> Dict[str, Any]:
        """
        Keepa & Helium 10 Modeli Otomatik Arka Plan Takip Motoru:
        1. Takipteki (is_tracked=True) ürünlerin canlı fiyat, satıcı ve Buybox durumunu günceller.
        2. Fiyat değişimlerini ve Buybox sahipliğini zaman serisi olarak PriceHistory & BuyboxRecord'a yazar.
        3. Kullanıcıların kurduğu Fiyat Alarmlarını (PriceAlert) kontrol eder ve hedef fiyata ulaşanları tetikler.
        """
        logger.info("⚡ Otomatik Pazar Takip & Fiyat Alarmı döngüsü başlatıldı...")

        # Takipteki tüm ürünleri çek
        stmt = (
            select(Product)
            .options(
                selectinload(Product.price_history),
                selectinload(Product.alerts),
                selectinload(Product.buybox_records),
                selectinload(Product.stock_records),
            )
            .where(Product.is_tracked == True)
        )
        res = await db.execute(stmt)
        tracked_products = res.scalars().all()

        products_checked = len(tracked_products)
        price_changes_detected = 0
        alerts_triggered_count = 0
        buybox_changes_count = 0

        now = datetime.utcnow()

        for product in tracked_products:
            try:
                # Canlı arama ile ürünün güncel fiyat ve satıcısını sorgula
                scraped = await TrendyolService.search_products(query=product.external_id, page=1)
                if not scraped:
                    continue

                live_data = scraped[0]
                new_price = live_data.get("current_price", product.current_price)
                new_seller = live_data.get("seller_name", product.seller_name)
                new_seller_id = live_data.get("seller_id", product.seller_id)

                # 1. Fiyat Değişimi Kontrolü
                if new_price != product.current_price:
                    price_changes_detected += 1
                    logger.info(
                        f"Fiyat değişimi yakalandı! Ürün: {product.title[:30]} | {product.current_price} -> {new_price} TL"
                    )
                    product.current_price = new_price
                    db.add(
                        PriceHistory(
                            product_id=product.id,
                            price=new_price,
                            seller_name=new_seller,
                            timestamp=now,
                        )
                    )

                # 2. Buybox Sahipliği Kontrolü
                seller_changed = new_seller != product.seller_name
                if seller_changed or not product.buybox_records:
                    buybox_changes_count += 1
                    old_seller = product.seller_name
                    product.seller_name = new_seller
                    product.seller_id = new_seller_id
                    db.add(
                        BuyboxRecord(
                            product_id=product.id,
                            seller_name=new_seller or "Bilinmeyen Satıcı",
                            seller_id=new_seller_id,
                            price=new_price,
                            has_buybox=True,
                            timestamp=now,
                        )
                    )

                # 3. Alarmları Kontrol Et (Fiyat Düşüşü & Buybox Kaybı)
                for alert in product.alerts:
                    if alert.is_triggered:
                        continue

                    alert_type = getattr(alert, "alert_type", "price_drop")
                    if alert_type == "buybox_lost":
                        if alert.target_seller and new_seller and new_seller.lower() != alert.target_seller.lower():
                            alert.is_triggered = True
                            alerts_triggered_count += 1
                            logger.warning(
                                f"⚠️ Buybox Kaybedildi! Ürün: {product.title[:30]} | Takipteki Satıcı: {alert.target_seller} | Yeni Kazanan: {new_seller}"
                            )
                        elif not alert.target_seller and seller_changed:
                            alert.is_triggered = True
                            alerts_triggered_count += 1
                            logger.warning(
                                f"⚠️ Buybox El Değiştirdi! Ürün: {product.title[:30]} | Yeni Kazanan: {new_seller}"
                            )
                    else:
                        if alert.target_price > 0 and new_price <= alert.target_price:
                            alert.is_triggered = True
                            alerts_triggered_count += 1
                            logger.success(
                                f"🎉 Fiyat Alarmı Tetiklendi! Ürün: {product.title[:30]} | Hedef: ₺{alert.target_price} | Anlık: ₺{new_price}"
                            )

            except Exception as e:
                logger.warning(f"Ürün ID {product.id} takip döngüsünde hata: {e}")
                continue

        # Ayrıca henüz tetiklenmemiş bağımsız tüm alarmları da kontrol et
        stmt_standalone_alerts = (
            select(PriceAlert)
            .options(selectinload(PriceAlert.product))
            .where(PriceAlert.is_triggered == False)
        )
        res_alerts = await db.execute(stmt_standalone_alerts)
        pending_alerts = res_alerts.scalars().all()

        for pa in pending_alerts:
            if not pa.product:
                continue
            alert_type = getattr(pa, "alert_type", "price_drop")
            if alert_type == "buybox_lost":
                if pa.target_seller and pa.product.seller_name and pa.product.seller_name.lower() != pa.target_seller.lower():
                    pa.is_triggered = True
                    alerts_triggered_count += 1
            else:
                if pa.target_price > 0 and pa.product.current_price <= pa.target_price:
                    pa.is_triggered = True
                    alerts_triggered_count += 1

        await db.commit()

        summary = {
            "timestamp": now.isoformat(),
            "products_checked": products_checked,
            "price_changes_detected": price_changes_detected,
            "buybox_changes_count": buybox_changes_count,
            "alerts_triggered_count": alerts_triggered_count,
            "status": "success",
        }
        logger.info(f"Pazar Takip döngüsü tamamlandı: {summary}")
        return summary
