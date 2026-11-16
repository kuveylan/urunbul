import sys
from pathlib import Path
pkg_dir = (Path(__file__).resolve().parents[3] / "packages").as_posix()
if pkg_dir not in sys.path:
    sys.path.insert(0, pkg_dir)

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import init_db, AsyncSessionLocal
from app.models.product import ConsumerSearchSignal
from app.services.consumer_service import ConsumerService


@pytest.mark.asyncio
async def test_consumer_signals():
    await init_db()
    async with AsyncSessionLocal() as session:
        # Sinyal kaydet
        await ConsumerService.record_search_signal(session, "robot süpürge", "Elektronik")
        await ConsumerService.record_search_signal(session, "robot süpürge", "Elektronik")

        signals = await ConsumerService.get_trending_signals(session)
        assert len(signals) >= 1
        top_signal = [s for s in signals if s["query"] == "robot süpürge"][0]
        assert top_signal["search_count"] >= 2


@pytest.mark.asyncio
async def test_arbitrage_and_signals_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res_sig = await client.get("/api/v1/compare/signals")
        assert res_sig.status_code == 200
        assert isinstance(res_sig.json(), list)

        res_arb = await client.get("/api/v1/compare/arbitrage")
        assert res_arb.status_code == 200
        assert isinstance(res_arb.json(), list)
