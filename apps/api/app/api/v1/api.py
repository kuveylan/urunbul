from fastapi import APIRouter
from app.api.v1.endpoints import products, compare, keywords, sellers, calculator, optimizer, notifications, reviews

api_router = APIRouter()

# Satıcı Analiz & Ürün Keşif Araçları
api_router.include_router(products.router, prefix="/products", tags=["Satıcı Araçları - Ürün Analizi"])

# Müşteri Yorum & Şikayet Madencisi
api_router.include_router(reviews.router, prefix="/reviews", tags=["Satıcı Araçları - Yorum & Şikayet Analizi"])

# Anahtar Kelime Araştırması (Trend & Hacim Analizi)
api_router.include_router(keywords.router, prefix="/keywords", tags=["Satıcı Araçları - Anahtar Kelime"])

# Satıcı & Rakip Analizi
api_router.include_router(sellers.router, prefix="/sellers", tags=["Satıcı Araçları - Rakip Analizi"])

# Kâr & Komisyon Hesaplayıcı (Net Kâr & Başa Baş)
api_router.include_router(calculator.router, prefix="/calculator", tags=["Satıcı Araçları - Kâr Hesaplayıcı"])

# Listing & Başlık Optimizasyonu (SEO Sihirbazı)
api_router.include_router(optimizer.router, prefix="/optimizer", tags=["Satıcı Araçları - Listing Optimizasyonu"])

# Sistem Bildirim & Uyarı Merkezi
api_router.include_router(notifications.router, prefix="/notifications", tags=["Sistem - Bildirimler"])

# Tüketici Fiyat Karşılaştırma Araçları (Çoklu Pazar)
api_router.include_router(compare.router, prefix="/compare", tags=["Tüketici Araçları - Fiyat Karşılaştırma"])
