import re
from typing import List, Dict, Any, Optional
from app.services.trendyol_service import TrendyolService


class SellerService:
    @classmethod
    async def analyze_seller(cls, seller_name: str) -> Dict[str, Any]:
        """
        Helium 10 Storefront / Competitor Analyzer:
        Belirtilen satıcının, mağaza linkinin veya markanın Trendyol pazarındaki varlığını,
        ürün gamını, tahmini aylık toplam gelirini ve yıldız ürünlerini analiz eder.
        """
        target_name = seller_name.strip()
        search_query = target_name

        # 1. Eğer tam mağaza linki girildiyse (örn: https://www.trendyol.com/magaza/arzum-m-105151)
        url_match = re.search(r"-m-(\d+)", target_name)
        mid_match = re.search(r"mid=(\d+)", target_name)
        if url_match:
            mid = url_match.group(1)
            search_query = f"mid:{mid}"
            slug_match = re.search(r"/magaza/([a-zA-Z0-9\-]+)-m-", target_name)
            if slug_match:
                target_name = slug_match.group(1).replace("-", " ").title()
        elif mid_match:
            mid = mid_match.group(1)
            search_query = f"mid:{mid}"
        elif target_name.isdigit():
            search_query = f"mid:{target_name}"

        all_products = await TrendyolService.search_products(query=search_query, page=1)

        seller_clean = seller_name.lower().strip()
        matched_products = [
            p for p in all_products
            if seller_clean in (p.get("seller_name") or "").lower()
            or seller_clean in (p.get("brand") or "").lower()
        ]

        analyzed_items = matched_products if len(matched_products) >= 3 else all_products

        if not analyzed_items:
            return {
                "seller_name": target_name,
                "badge": "Veri Toplanıyor",
                "product_count": 0,
                "average_price": 0.0,
                "estimated_monthly_sales": 0,
                "estimated_monthly_revenue": 0.0,
                "average_rating": 0.0,
                "total_reviews": 0,
                "top_products": [],
                "all_products": [],
                "message": "Satıcıya ait ürün bulunamadı.",
            }

        total_products = len(analyzed_items)
        prices = [p["current_price"] for p in analyzed_items if p.get("current_price", 0) > 0]
        avg_price = round(sum(prices) / len(prices), 2) if prices else 0.0
        
        total_monthly_sales = sum(p["estimated_monthly_sales"] for p in analyzed_items)
        total_monthly_revenue = sum(p["estimated_monthly_revenue"] for p in analyzed_items)
        
        ratings = [p["rating"] for p in analyzed_items if p.get("rating", 0) > 0]
        avg_rating = round(sum(ratings) / len(ratings), 2) if ratings else 0.0
        
        total_reviews = sum(p["review_count"] for p in analyzed_items)

        top_selling = sorted(analyzed_items, key=lambda x: x["estimated_monthly_sales"], reverse=True)[:5]

        if avg_rating >= 4.5 and total_monthly_sales > 100:
            performance_badge = "Pazar Lideri (A+)"
        elif avg_rating >= 4.2:
            performance_badge = "Güçlü Satıcı (A)"
        elif avg_rating >= 3.8:
            performance_badge = "Gelişmekte Olan (B)"
        else:
            performance_badge = "Riskli / Düşük Memnuniyet (C)"

        return {
            "seller_name": target_name,
            "badge": performance_badge,
            "product_count": total_products,
            "average_price": avg_price,
            "estimated_monthly_sales": total_monthly_sales,
            "estimated_monthly_revenue": round(total_monthly_revenue, 2),
            "average_rating": avg_rating,
            "total_reviews": total_reviews,
            "top_products": top_selling,
            "all_products": analyzed_items,
        }
