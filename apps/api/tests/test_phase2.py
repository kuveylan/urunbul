import pytest
import pytest_asyncio
from datetime import datetime
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import init_db, AsyncSessionLocal
from app.models.product import Product, PriceAlert, PriceHistory, BuyboxRecord
from app.services.tracker_service import TrackerService
from app.services.trendyol_service import TrendyolService


@pytest_asyncio.fixture(autouse=True)
async def setup_test_db():
    await init_db()


from sqlalchemy import delete


@pytest.mark.asyncio
async def test_tracker_cycle_execution(monkeypatch):
    # Dış ağ bağımlılığını mockla: Trendyol fiyatı 1200 TL'ye düşürmüş olsun
    async def mock_search(query, page=1, **kwargs):
        return [{
            "marketplace": "trendyol",
            "external_id": "test-tracker-101",
            "title": "Test Espresso Makinesi",
            "current_price": 1200.0,
            "seller_name": "İndirimli Mağaza",
            "seller_id": "sel-99"
        }]

    monkeypatch.setattr(TrendyolService, "search_products", mock_search)

    async with AsyncSessionLocal() as session:
        # Önceki testten kalan varsa temizle
        await session.execute(delete(Product).where(Product.external_id == "test-tracker-101"))
        await session.commit()

        # Test için takipli bir ürün ekle
        test_prod = Product(
            marketplace="trendyol",
            external_id="test-tracker-101",
            title="Test Espresso Makinesi",
            current_price=1500.0,
            original_price=1800.0,
            seller_name="Ana Satıcı",
            is_tracked=True,
            url="https://www.trendyol.com/test-p-101"
        )
        session.add(test_prod)
        await session.commit()
        await session.refresh(test_prod)

        # Bu ürüne 1300 TL hedefli bir fiyat alarmı kur (1200 TL <= 1300 TL olduğu için tetiklenmeli)
        alert = PriceAlert(
            product_id=test_prod.id,
            target_price=1300.0,
            user_email="test@example.com",
            is_triggered=False
        )
        session.add(alert)
        await session.commit()
        await session.refresh(alert)

        # Takip döngüsünü çalıştır
        summary = await TrackerService.run_tracking_cycle(session)
        assert summary["status"] == "success"
        assert summary["products_checked"] >= 1
        assert summary["price_changes_detected"] >= 1

        # Alarmın tetiklendiğini doğrula
        await session.refresh(alert)
        assert alert.is_triggered is True

        # Buybox ve Fiyat kaydının oluştuğunu doğrula
        res_bb = await session.execute(
            BuyboxRecord.__table__.select().where(BuyboxRecord.product_id == test_prod.id)
        )
        bb_records = res_bb.fetchall()
        assert len(bb_records) >= 1

        # Temizlik
        await session.delete(alert)
        await session.delete(test_prod)
        await session.commit()


@pytest.mark.asyncio
async def test_tracker_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/v1/products/tracker/run-cycle")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert "products_checked" in data
