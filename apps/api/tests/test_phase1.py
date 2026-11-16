import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import init_db
from app.core.config import settings


@pytest_asyncio.fixture(autouse=True)
async def setup_test_db():
    await init_db()


@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/health")
        assert res.status_code == 200
        assert res.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_canonical_db_path():
    assert "urunbul.db" in settings.DATABASE_URL
    assert not settings.DATABASE_URL.startswith("sqlite+aiosqlite:///./")


@pytest.mark.asyncio
async def test_notifications_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/v1/notifications")
        assert res.status_code == 200
        data = res.json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert "title" in data[0]
        assert "message" in data[0]


@pytest.mark.asyncio
async def test_profit_calculator():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "selling_price": 1000.0,
            "cost_price": 400.0,
            "category": "Elektronik",
            "shipping_cost": 45.0,
            "is_auto_shipping": False,
            "extra_cost": 15.0,
            "vat_rate": 20.0
        }
        res = await client.post("/api/v1/calculator/profit", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["selling_price"] == 1000.0
        assert data["commission_amount"] == 100.0  # %10 of 1000
        assert data["total_cost"] > 500.0
        assert data["net_profit"] > 0
        assert data["profit_margin_pct"] > 0
        assert data["roi_pct"] > 0


@pytest.mark.asyncio
async def test_listing_optimizer():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "title": "Xiaomi Redmi Buds 4 Active TWS Kablosuz Kulaklık Siyah",
            "brand": "Xiaomi",
            "category": "Elektronik"
        }
        res = await client.post("/api/v1/optimizer/analyze", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert "overall_seo_score" in data
        assert "quality_checks" in data
        assert data["overall_seo_score"] > 0
