from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class PriceVerdict(BaseModel):
    status: str  # EXCELLENT, GOOD, AVERAGE, HIGH
    label: str  # "Mükemmel Fiyat!", "İyi Fiyat", "Normal Piyasa Fiyatı", "Pahalı"
    badge_color: str  # emerald, sky, amber, rose
    message: str
    discount_pct: float
    lowest_recorded: float
    average_recorded: float


class ConsumerOfferItem(BaseModel):
    id: Optional[int] = None
    marketplace: str = "trendyol"
    seller_name: str
    price: float
    original_price: Optional[float] = None
    discount_pct: float = 0.0
    free_shipping: bool = True
    in_stock: bool = True
    product_url: str
    seller_rating: float = 0.0
    review_count: int = 0


class DetailedComparisonResponse(BaseModel):
    query: str
    title: str
    brand: Optional[str] = None
    image_url: Optional[str] = None
    lowest_price: float
    highest_price: float
    average_price: float
    total_offers_count: int
    best_offer: ConsumerOfferItem
    offers: List[ConsumerOfferItem]
    price_verdict: PriceVerdict
    category_name: Optional[str] = None


class DealProductItem(BaseModel):
    id: int
    title: str
    brand: Optional[str] = None
    image_url: Optional[str] = None
    current_price: float
    original_price: float
    discount_amount: float
    discount_pct: float
    seller_name: Optional[str] = None
    rating: float = 0.0
    url: str
    verdict: str


class ActivePriceAlertItem(BaseModel):
    alert_id: int
    product_id: int
    product_title: str
    product_image: Optional[str] = None
    current_price: float
    target_price: float
    price_difference: float
    is_triggered: bool
    user_email: Optional[str] = None
    product_url: str
    created_at: datetime
