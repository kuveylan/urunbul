from typing import List, Optional
from pydantic import BaseModel, Field


class ListingOptimizeRequest(BaseModel):
    title: str = Field(..., min_length=3, description="Mevcut veya taslak ürün başlığı")
    category: Optional[str] = Field("Genel", description="Ürün kategorisi")
    brand: Optional[str] = Field(None, description="Marka adı")
    target_keywords: Optional[List[str]] = Field(default=[], description="Hedeflenen anahtar kelimeler")


class AiListingRequest(BaseModel):
    brand: str = Field(..., description="Ürün marka adı (örn: Xiaomi, Arzum)")
    product_type: str = Field(..., description="Ürün ana tipi (örn: Bluetooth Kulaklık, Robot Süpürge)")
    category: str = Field("Elektronik", description="Kategori")
    color_or_variant: Optional[str] = Field(None, description="Renk veya varyant (örn: Siyah, 7.2L)")
    keywords: List[str] = Field(default=[], description="Dahil edilmesi istenen anahtar kelimeler")
    key_features: Optional[List[str]] = Field(default=[], description="Öne çıkan 2-3 teknik özellik")


class AiListingResponse(BaseModel):
    generated_title: str
    character_count: int
    bullet_points: List[str]
    backend_search_terms: List[str]
    predicted_seo_score: int
    seo_tips: List[str]


class ListingQualityCheck(BaseModel):
    rule: str
    status: str  # PASS, WARN, FAIL
    score_impact: int
    message: str


class ListingOptimizeResponse(BaseModel):
    original_title: str
    length: int
    character_count: Optional[int] = None
    max_recommended_length: Optional[int] = 100
    word_count: Optional[int] = None
    overall_seo_score: int  # 0 - 100
    seo_score: Optional[int] = None
    grade: str  # Mükemmel, İyi, Geliştirilmeli, Zayıf
    brand_detected: bool
    quality_checks: List[ListingQualityCheck]
    recommended_keywords_to_add: List[str]
    suggested_improved_title: str
    improved_title: Optional[str] = None
    seo_tips: List[str]
    suggestions: Optional[List[str]] = None


class SystemNotification(BaseModel):
    id: int
    title: str
    message: str
    type: str  # PRICE_DROP, OPPORTUNITY, COMPETITOR, SYSTEM
    timestamp: str
    is_read: bool = False
    action_url: Optional[str] = None
