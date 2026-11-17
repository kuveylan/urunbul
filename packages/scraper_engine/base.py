from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class ScrapedProductItem(BaseModel):
    marketplace: str  # trendyol, hepsiburada, amazon, n11
    external_id: str
    title: str
    brand: Optional[str] = None
    barcode: Optional[str] = None  # EAN / GTIN
    category_name: Optional[str] = None
    url: str
    image_url: Optional[str] = None
    current_price: float
    original_price: Optional[float] = None
    currency: str = "TRY"
    seller_name: Optional[str] = None
    seller_id: Optional[str] = None
    rating: float = 0.0
    review_count: int = 0
    in_stock: bool = True


class BaseMarketplaceScraper(ABC):
    def __init__(self, marketplace_name: str):
        self.marketplace_name = marketplace_name

    @abstractmethod
    async def search(
        self,
        query: str,
        page: int = 1,
        limit: int = 24,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
    ) -> List[ScrapedProductItem]:
        """Belirtilen sorguda pazaryerini tarayıp normalize edilmiş ürünleri döner."""
        pass

    @abstractmethod
    async def get_by_barcode(self, barcode: str) -> Optional[ScrapedProductItem]:
        """Barkod / EAN üzerinden doğrudan ürünü sorgular."""
        pass
