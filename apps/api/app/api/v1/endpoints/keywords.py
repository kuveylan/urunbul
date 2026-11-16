from fastapi import APIRouter, Query, HTTPException
from app.services.keyword_service import KeywordService

router = APIRouter()


@router.get("/analyze")
async def analyze_keywords(
    q: str = Query(..., description="Analiz edilecek anahtar kelime veya kategori (örn: kulaklik, termos, robot supurge)"),
):
    """
    Kelime Hacim & Rekabet Analizörü (Magnet Modeli):
    Trendyol'da en çok aratılan anahtar kelimeleri, arama hacimlerini, pazar yoğunluğunu
    ve rekabet skorunu analiz eder.
    """
    data = await KeywordService.analyze_keywords(query=q)
    return data


@router.get("/cerebro")
async def analyze_cerebro(
    identifier: str = Query(..., description="Rakip Trendyol Ürün Linki veya Ürün ID'si (örn: 32918239 veya ürün linki)"),
):
    """
    Ters Ürün & ASIN Trafik Analizörü (Cerebro Modeli):
    Belirtilen ürünün hangi kelimelerden organik sıra (rank) aldığını,
    arama hacmini ve Cerebro IQ skorunu çıkarır.
    """
    data = await KeywordService.analyze_cerebro(identifier=identifier)
    return data
