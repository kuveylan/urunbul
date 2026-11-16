import sys
from pathlib import Path
pkg_dir = (Path(__file__).resolve().parents[3] / "packages").as_posix()
if pkg_dir not in sys.path:
    sys.path.insert(0, pkg_dir)

import pytest
from scraper_engine import (
    BaseMarketplaceScraper,
    ScrapedProductItem,
    TrendyolScraper,
    HepsiburadaScraper,
    AmazonTrScraper,
    N11Scraper,
    CrossMarketplaceMatcher,
)
from app.services.consumer_service import ConsumerService


def test_cross_marketplace_matcher_similarity():
    title1 = "Xiaomi Redmi Buds 4 Active TWS Kulaklık"
    title2 = "Xiaomi Redmi Buds 4 Active Bluetooth Kulaklık Siyah"
    sim = CrossMarketplaceMatcher.calculate_text_similarity(title1, title2)
    assert sim >= 0.5  # Çok benzer başlıklar

    title3 = "Dyson V15 Dikey Süpürge"
    sim_diff = CrossMarketplaceMatcher.calculate_text_similarity(title1, title3)
    assert sim_diff == 0.0  # Alakasız


def test_cross_marketplace_aggregate_offers():
    p1 = ScrapedProductItem(
        marketplace="trendyol",
        external_id="ty-1",
        title="Arzum Okka Minio Türk Kahvesi Makinesi",
        current_price=1500.0,
        url="https://trendyol.com/1",
        in_stock=True
    )
    p2 = ScrapedProductItem(
        marketplace="hepsiburada",
        external_id="hb-1",
        title="Arzum Okka Minio Türk Kahvesi Makinesi Siyah",
        current_price=1380.0,
        url="https://hepsiburada.com/1",
        in_stock=True
    )
    p3 = ScrapedProductItem(
        marketplace="amazon",
        external_id="az-1",
        title="Arzum Okka Minio Türk Kahvesi Makinesi",
        current_price=1420.0,
        url="https://amazon.com.tr/1",
        in_stock=True
    )

    aggregated = CrossMarketplaceMatcher.match_and_aggregate_offers([p1], [p2, p3])
    assert len(aggregated) == 1
    match = aggregated[0]
    assert match["lowest_price"] == 1380.0
    assert match["highest_price"] == 1500.0
    assert match["cheapest_marketplace"] == "hepsiburada"
    assert match["arbitrage_gap"] == 120.0
    assert match["total_marketplace_offers"] == 3


@pytest.mark.asyncio
async def test_consumer_service_compare_multi_marketplace(monkeypatch):
    async def mock_ty_search(*args, **kwargs):
        return [
            ScrapedProductItem(
                marketplace="trendyol",
                external_id="ty-10",
                title="Philips Airfryer XXL",
                current_price=5500.0,
                url="https://trendyol.com/airfryer",
                in_stock=True
            )
        ]

    async def mock_hb_search(*args, **kwargs):
        return [
            ScrapedProductItem(
                marketplace="hepsiburada",
                external_id="hb-10",
                title="Philips Airfryer XXL Fritöz",
                current_price=5200.0,
                url="https://hepsiburada.com/airfryer",
                in_stock=True
            )
        ]

    async def mock_az_search(*args, **kwargs):
        return [
            ScrapedProductItem(
                marketplace="amazon",
                external_id="az-10",
                title="Philips Airfryer XXL Sıcak Hava Fritözü",
                current_price=5350.0,
                url="https://amazon.com.tr/airfryer",
                in_stock=True
            )
        ]

    async def mock_n11_search(*args, **kwargs):
        return []

    monkeypatch.setattr(TrendyolScraper, "search", mock_ty_search)
    monkeypatch.setattr(HepsiburadaScraper, "search", mock_hb_search)
    monkeypatch.setattr(AmazonTrScraper, "search", mock_az_search)
    monkeypatch.setattr(N11Scraper, "search", mock_n11_search)

    res = await ConsumerService.compare_offers("Philips Airfryer XXL")
    assert res is not None
    assert res.lowest_price == 5200.0
    assert res.best_offer.marketplace == "hepsiburada"
    assert len(res.offers) == 3
