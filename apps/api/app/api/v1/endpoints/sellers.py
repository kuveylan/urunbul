from fastapi import APIRouter, Query, HTTPException
from app.services.seller_service import SellerService

router = APIRouter()


@router.get("/analyze")
async def analyze_seller(
    name: str = Query(..., description="Analiz edilecek satıcı veya marka adı (örn: Arzum, Karaca, Philips, Xiaomi)"),
):
    """
    Rakip Mağaza İstihbarat Analizörü:
    Bir satıcının veya markanın Trendyol pazarındaki cirosunu, ortalama fiyatını,
    yıldız ürünlerini ve performans rozetini çıkarır.
    """
    data = await SellerService.analyze_seller(seller_name=name)
    return data
