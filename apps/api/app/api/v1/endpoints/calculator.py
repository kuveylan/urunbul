from fastapi import APIRouter
from app.schemas.calculator import (
    ProfitCalculationRequest,
    ProfitCalculationResponse,
    LinkAnalysisRequest,
    LinkAnalysisResponse,
)
from app.services.calculator_service import CalculatorService

router = APIRouter()


@router.post("/profit", response_model=ProfitCalculationResponse)
async def calculate_profit(req: ProfitCalculationRequest):
    """
    Pazaryeri Net Kâr, Komisyon, Stopaj & Desi Hesaplayıcı:
    Komisyon, kargo, ek maliyetler ve KDV kesintilerini hesaplayarak
    net kâr, kâr marjı, ROI ve başa baş fiyatını döndürür.
    """
    return CalculatorService.calculate_profit(req)


@router.post("/analyze-link", response_model=LinkAnalysisResponse)
async def analyze_product_link(req: LinkAnalysisRequest):
    """
    Pazaryeri Ürün Bağlantı Analizörü:
    Trendyol, Hepsiburada, Amazon TR veya N11 ürün linkini çözümler;
    başlık, satış fiyatı, görsel, komisyon kategorisi ve tahmini desiyi otomatik döndürür.
    """
    return await CalculatorService.analyze_product_link(req.url)


@router.get("/categories")
async def get_categories():
    """
    Tüm pazaryerlerinin 2026 resmi kategori ve komisyon oranları tablosu.
    """
    return CalculatorService.MARKETPLACE_COMMISSIONS

