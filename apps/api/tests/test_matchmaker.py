import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import AsyncSessionLocal
from app.services.matchmaker_service import MatchmakerService
from app.schemas.product import MatchmakerRequest


@pytest.mark.asyncio
async def test_matchmaker_service_logic():
    async with AsyncSessionLocal() as db:
        req = MatchmakerRequest(
            business_model="private_label",
            profit_speed="high_margin",
            budget="medium",
        )
        res = await MatchmakerService.match_products(req, db)

        assert res.matched_count == 10
        assert len(res.products) == 10
        assert res.total_scanned_market_volume == 18450
        assert res.eliminated_count == 18440
        assert "Private Label" in res.strategy_summary

        # Kullanıcı isteği: PRO limitleri kaldırıldı, tüm 10 ürün açık olmalı
        for i in range(10):
            p = res.products[i]
            assert p.rank == i + 1
            assert p.is_locked is False

        # Sıra 9 ve 10 Açık Teaser olmalı
        p9 = res.products[8]
        p10 = res.products[9]
        assert p9.rank == 9
        assert p9.is_locked is False
        assert p10.rank == 10
        assert p10.is_locked is False
        assert p9.estimated_monthly_sales > 0
        assert p10.estimated_monthly_sales > 0


@pytest.mark.asyncio
async def test_matchmaker_api_endpoints():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # POST Testi
        payload = {
            "business_model": "arbitrage",
            "profit_speed": "fast_turnover",
            "budget": "micro",
        }
        resp = await client.post("/api/v1/products/matchmaker", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert data["matched_count"] == 10
        assert len(data["products"]) == 10
        assert data["products"][8]["is_locked"] is False
        assert data["products"][9]["is_locked"] is False
        assert data["products"][0]["is_locked"] is False

        # GET Sample Testi
        resp_get = await client.get("/api/v1/products/matchmaker/sample?business_model=dropshipping")
        assert resp_get.status_code == 200
        data_get = resp_get.json()
        assert data_get["matched_count"] == 10


@pytest.mark.asyncio
async def test_search_pagination_headers(monkeypatch):
    # TrendyolService mock
    async def mock_search(*args, **kwargs):
        return [
            {
                "external_id": "test_search_item_1",
                "marketplace": "trendyol",
                "title": "Test Akıllı Filtre Ürünü",
                "current_price": 250.0,
                "rating": 4.5,
                "review_count": 50,
                "favorite_count": 100,
                "url": "https://trendyol.com/test1",
                "estimated_monthly_sales": 320,
                "estimated_monthly_revenue": 80000.0,
                "opportunity_score": 75.0,
            }
        ]

    from app.services.trendyol_service import TrendyolService
    monkeypatch.setattr(TrendyolService, "search_products", mock_search)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/v1/products/search?q=kahve&page=2")
        assert resp.status_code == 200
        # X-Total-Count, X-Total-Pages, X-Current-Page doğrulaması
        assert "x-total-count" in resp.headers
        assert "x-total-pages" in resp.headers
        assert resp.headers["x-current-page"] == "2"
        assert int(resp.headers["x-total-count"]) >= 1000
