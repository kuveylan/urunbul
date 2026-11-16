import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_inspect_endpoint_validation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Boş istekte 400 bekler
        resp = await ac.get("/api/v1/products/inspect")
        assert resp.status_code == 400
        assert "Lütfen bir Trendyol" in resp.json()["detail"]
