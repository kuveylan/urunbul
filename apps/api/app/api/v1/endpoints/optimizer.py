from fastapi import APIRouter
from app.schemas.optimizer import (
    ListingOptimizeRequest,
    ListingOptimizeResponse,
    AiListingRequest,
    AiListingResponse,
)
from app.services.optimizer_service import ListingOptimizerService

router = APIRouter()


@router.post("/analyze", response_model=ListingOptimizeResponse)
async def analyze_and_optimize_listing(req: ListingOptimizeRequest):
    """
    SEO Başlık & Madde Sihirbazı:
    Trendyol ürün başlığını SEO kriterlerine göre puanlar (0-100),
    eksik anahtar kelimeleri tespit eder ve optimize edilmiş yeni başlık önerir.
    """
    return ListingOptimizerService.analyze_listing(req)


@router.post("/generate-ai-listing", response_model=AiListingResponse)
async def generate_ai_listing(req: AiListingRequest):
    """
    AI Destekli Akıllı Listing ve Başlık Üreticisi:
    Marka, ürün tipi ve kelimelerden Trendyol SEO kriterlerine tam uyumlu başlık ve açıklamalar üretir.
    """
    return ListingOptimizerService.generate_ai_listing(req)
