from typing import Optional
from fastapi import APIRouter, Query, HTTPException
from app.schemas.review import ReviewInsightsResponse
from app.services.review_service import ReviewService

router = APIRouter()


@router.get("/analyze", response_model=ReviewInsightsResponse)
async def analyze_product_reviews(
    product_url: str = Query(..., description="Ürün Trendyol URL'si"),
    content_id: str = Query(..., description="Trendyol Ürün ID (contentId)"),
    title: Optional[str] = Query("", description="Ürün Başlığı"),
    brand: Optional[str] = Query(None, description="Marka Adı"),
    rating: Optional[float] = Query(4.5, description="Ürün Puanı"),
):
    """
    Müşteri Yorum & Şikayet Madencisi:
    Belirtilen ürünün gerçek kullanıcı yorumlarını analiz eder,
    en çok şikayet edilen noktaları, memnuniyet skorunu ve
    satıcılar için pazar stratejisi önerisini döner.
    """
    try:
        data = await ReviewService.analyze_product_reviews(
            product_url=product_url,
            content_id=content_id,
            title=title or "",
            brand=brand,
            rating=rating or 4.5,
        )
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Yorum analizi yapılırken hata oluştu: {str(e)}")
