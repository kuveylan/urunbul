from fastapi import APIRouter
from app.schemas.calculator import ProfitCalculationRequest, ProfitCalculationResponse
from app.services.calculator_service import CalculatorService

router = APIRouter()


@router.post("/profit", response_model=ProfitCalculationResponse)
async def calculate_profit(req: ProfitCalculationRequest):
    """
    Trendyol Net Kâr & Komisyon Hesaplayıcı:
    Trendyol komisyonu, kargo, ek maliyetler ve KDV kesintilerini hesaplayarak
    net kâr, kâr marjı, ROI ve başa baş fiyatını döndürür.
    """
    return CalculatorService.calculate_profit(req)


@router.get("/categories")
async def get_categories():
    """
    Kategori listesi ve varsayılan Trendyol komisyon oranları.
    """
    return CalculatorService.DEFAULT_COMMISSION_RATES
