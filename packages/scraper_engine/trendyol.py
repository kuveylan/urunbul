from typing import List, Optional
from .base import BaseMarketplaceScraper, ScrapedProductItem
from app.services.trendyol_service import TrendyolService


class TrendyolScraper(BaseMarketplaceScraper):
    def __init__(self):
        super().__init__("trendyol")

    async def search(self, query: str, page: int = 1, limit: int = 24) -> List[ScrapedProductItem]:
        raw_items = await TrendyolService.search_products(query=query, page=page)
        results = []
        for it in raw_items[:limit]:
            results.append(
                ScrapedProductItem(
                    marketplace="trendyol",
                    external_id=str(it.get("external_id", "")),
                    title=str(it.get("title", "")),
                    brand=it.get("brand"),
                    barcode=it.get("barcode"),
                    category_name=it.get("category_name"),
                    url=it.get("url", ""),
                    image_url=it.get("image_url"),
                    current_price=float(it.get("current_price", 0.0)),
                    original_price=float(it.get("original_price")) if it.get("original_price") else None,
                    currency=it.get("currency", "TRY"),
                    seller_name=it.get("seller_name", "Trendyol"),
                    seller_id=str(it.get("seller_id", "")),
                    rating=float(it.get("rating", 0.0)),
                    review_count=int(it.get("review_count", 0)),
                    in_stock=True,
                )
            )
        return results

    async def get_by_barcode(self, barcode: str) -> Optional[ScrapedProductItem]:
        items = await self.search(query=barcode, page=1, limit=1)
        return items[0] if items else None
