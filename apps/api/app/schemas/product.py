from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field, ConfigDict, field_validator


class PriceHistoryItem(BaseModel):
    id: Optional[int] = None
    price: float = 0.0
    seller_name: Optional[str] = None
    timestamp: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class PriceAlertCreate(BaseModel):
    product_id: Optional[int] = None
    target_price: Optional[float] = 0.0
    alert_type: Optional[str] = "price_drop"  # "price_drop", "buybox_lost"
    target_seller: Optional[str] = None
    user_email: Optional[str] = "user@example.com"


class PriceAlertResponse(BaseModel):
    id: int
    product_id: int
    target_price: float
    alert_type: str = "price_drop"
    target_seller: Optional[str] = None
    user_email: Optional[str] = None
    is_triggered: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProductBase(BaseModel):
    marketplace: str = "trendyol"
    external_id: str
    title: str
    brand: Optional[str] = None
    category_name: Optional[str] = None
    category_id: Optional[str] = None
    url: str
    image_url: Optional[str] = None
    current_price: float = 0.0
    original_price: Optional[float] = None
    currency: str = "TRY"
    seller_name: Optional[str] = None
    seller_id: Optional[str] = None
    rating: float = 0.0
    review_count: int = 0
    favorite_count: int = 0

    @field_validator("current_price", "rating", mode="before")
    @classmethod
    def coerce_float(cls, v: Any) -> float:
        if v is None:
            return 0.0
        try:
            return float(v)
        except (ValueError, TypeError):
            return 0.0

    @field_validator("review_count", "favorite_count", mode="before")
    @classmethod
    def coerce_int(cls, v: Any) -> int:
        if v is None:
            return 0
        try:
            return int(v)
        except (ValueError, TypeError):
            return 0


class ProductCreate(ProductBase):
    pass


class ProductResponse(ProductBase):
    id: Optional[int] = 0
    estimated_monthly_sales: int = 0
    estimated_monthly_revenue: float = 0.0
    opportunity_score: float = 0.0
    demand_score: float = 0.0
    competition_score: float = 0.0
    economics_score: float = 0.0
    in_cart_count: int = 0
    is_tracked: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    price_history: List[PriceHistoryItem] = Field(default_factory=list)

    @field_validator(
        "opportunity_score",
        "demand_score",
        "competition_score",
        "economics_score",
        "estimated_monthly_revenue",
        mode="before",
    )
    @classmethod
    def coerce_metrics_float(cls, v: Any) -> float:
        if v is None:
            return 0.0
        try:
            return float(v)
        except (ValueError, TypeError):
            return 0.0

    @field_validator("estimated_monthly_sales", "in_cart_count", mode="before")
    @classmethod
    def coerce_metrics_int(cls, v: Any) -> int:
        if v is None:
            return 0
        try:
            return int(v)
        except (ValueError, TypeError):
            return 0

    @field_validator("is_tracked", mode="before")
    @classmethod
    def coerce_bool(cls, v: Any) -> bool:
        return bool(v) if v is not None else False

    @field_validator("price_history", mode="before")
    @classmethod
    def coerce_price_history(cls, v: Any) -> List[Any]:
        if v is None or not isinstance(v, (list, tuple)):
            return []
        return list(v)

    model_config = ConfigDict(from_attributes=True)


class ProductFilterParams(BaseModel):
    query: Optional[str] = None
    category: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_rating: Optional[float] = None
    min_sales: Optional[int] = None
    sort_by: Optional[str] = "opportunity_score"
    limit: int = 50
    offset: int = 0


class PriceComparisonItem(BaseModel):
    marketplace: str
    seller_name: str
    price: float
    original_price: Optional[float] = None
    in_stock: bool = True
    product_url: str
    rating: float = 0.0


class ProductComparisonResponse(BaseModel):
    title: str
    brand: Optional[str] = None
    image_url: Optional[str] = None
    lowest_price: float
    highest_price: float
    average_price: float
    offers: List[PriceComparisonItem] = []
    price_history: List[PriceHistoryItem] = []


# ==========================================
# İNTERAKTİF ÜRÜN EŞLEŞTİRME SİHİRBAZI (MATCHMAKER)
# ==========================================

class MatchmakerRequest(BaseModel):
    business_model: str = "private_label"  # "private_label", "arbitrage", "dropshipping"
    profit_speed: str = "high_margin"     # "fast_turnover", "high_margin", "balanced"
    budget: str = "medium"                 # "micro" (0-15k), "medium" (15-50k), "high" (50k+)
    category: Optional[str] = None


class MatchmakerProductItem(BaseModel):
    rank: int                              # 1..10
    id: Optional[int] = None
    title: str
    brand: Optional[str] = None
    category_name: Optional[str] = None
    current_price: float
    original_price: Optional[float] = None
    currency: str = "TRY"
    seller_name: Optional[str] = None
    rating: float = 0.0
    review_count: int = 0
    favorite_count: int = 0
    estimated_monthly_sales: int = 0
    estimated_monthly_revenue: float = 0.0
    opportunity_score: float = 0.0
    image_url: Optional[str] = None
    url: Optional[str] = None
    match_score: int                       # 80..99
    match_badge: str                       # e.g. "🔥 Altın Madeni - %52 Kâr Marjı"
    match_reason: str                      # Stratejiye özel açıklama
    is_locked: bool = False                # 1-8: True (Kilitli VIP), 9-10: False (Açık Teaser)


class MatchmakerResponse(BaseModel):
    total_scanned_market_volume: int = 18450
    eliminated_count: int = 18440
    matched_count: int = 10
    strategy_summary: str
    products: List[MatchmakerProductItem]

