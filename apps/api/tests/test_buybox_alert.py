import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy import delete

from app.main import app
from app.core.database import init_db, AsyncSessionLocal
from app.models.product import Product, PriceAlert, BuyboxRecord
from app.services.tracker_service import TrackerService
from app.services.trendyol_service import TrendyolService


@pytest_asyncio.fixture(autouse=True)
async def setup_test_db():
    await init_db()


@pytest.mark.asyncio
async def test_buybox_lost_alert_creation_and_trigger(monkeypatch):
    # 1. Mock scraper: Yeni satıcı 'Rakip Ucuzcu' 950 TL ile Buybox'ı almış olsun
    async def mock_search(query, page=1, **kwargs):
        return [{
            "marketplace": "trendyol",
            "external_id": "test-bb-202",
            "title": "Akıllı Robot Süpürge",
            "current_price": 950.0,
            "seller_name": "Rakip Ucuzcu",
            "seller_id": "rakip-99"
        }]

    monkeypatch.setattr(TrendyolService, "search_products", mock_search)

    async with AsyncSessionLocal() as session:
        # Önceki testten kalan varsa temizle
        await session.execute(delete(Product).where(Product.external_id == "test-bb-202"))
        await session.commit()

        # Bizim mağazamızın Buybox'a sahip olduğu bir ürün ekle
        prod = Product(
            marketplace="trendyol",
            external_id="test-bb-202",
            title="Akıllı Robot Süpürge",
            current_price=1000.0,
            original_price=1200.0,
            seller_name="Bizim Magaza",
            is_tracked=True,
            url="https://www.trendyol.com/robot-p-202"
        )
        session.add(prod)
        await session.commit()
        await session.refresh(prod)

        # Buybox Kaybı Alarmı ekle (Bizim Magaza Buybox'ı kaybederse uyar)
        alert = PriceAlert(
            product_id=prod.id,
            target_price=1000.0,
            alert_type="buybox_lost",
            target_seller="Bizim Magaza",
            user_email="satici@bizim-magaza.com",
            is_triggered=False,
        )
        session.add(alert)
        await session.commit()
        await session.refresh(alert)

        # Takip döngüsünü koştur
        summary = await TrackerService.run_tracking_cycle(session)
        assert summary["status"] == "success"
        assert summary["buybox_changes_count"] >= 1

        # Alarm tetiklendi mi?
        await session.refresh(alert)
        assert alert.is_triggered is True

        # Notifications endpoint'ini test et
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.get("/api/v1/notifications")
            assert res.status_code == 200
            notifications = res.json()
            assert any(n["type"] == "BUYBOX_LOST" for n in notifications)

        # Temizlik
        await session.delete(alert)
        await session.delete(prod)
        await session.commit()
