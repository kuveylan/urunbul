import re
import json
import urllib.parse
from typing import List, Optional, Dict, Any
import httpx
from loguru import logger
from .base import BaseMarketplaceScraper, ScrapedProductItem
from app.services.trendyol_service import TrendyolService

try:
    from curl_cffi.requests import AsyncSession
except ImportError:
    AsyncSession = None


class TrendyolScraper(BaseMarketplaceScraper):
    def __init__(self):
        super().__init__("trendyol")
        self.headers = {
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8",
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            ),
            "Referer": "https://www.trendyol.com/",
        }

    async def search(
        self,
        query: str,
        page: int = 1,
        limit: int = 24,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
    ) -> List[ScrapedProductItem]:
        # 1. Öncelikle hafif ve ultra hızlı HTTP Gateway / HTML araması yap (bulut sunucuları ve Render için)
        items = await self._search_http(
            query=query, page=page, limit=limit, min_price=min_price, max_price=max_price
        )
        if items:
            return items

        # 2. HTTP Gateway boş dönerse ve Playwright mevcutsa derin taramayı dene
        try:
            raw_items = await TrendyolService.search_products(query=query, page=page)
            if raw_items:
                results = []
                for it in raw_items[:limit]:
                    results.append(
                        ScrapedProductItem(
                            marketplace="trendyol",
                            external_id=str(it.get("external_id", "")),
                            title=str(it.get("title", "")),
                            brand=it.get("brand"),
                            barcode=it.get("barcode"),
                            category_name=it.get("category_name"),
                            url=it.get("url", ""),
                            image_url=it.get("image_url"),
                            current_price=float(it.get("current_price", 0.0)),
                            original_price=float(it.get("original_price")) if it.get("original_price") else None,
                            currency=it.get("currency", "TRY"),
                            seller_name=it.get("seller_name", "Trendyol"),
                            seller_id=str(it.get("seller_id", "")),
                            rating=float(it.get("rating", 0.0)),
                            review_count=int(it.get("review_count", 0)),
                            in_stock=True,
                        )
                    )
                if results:
                    return results
        except Exception as e:
            logger.warning(f"Trendyol Playwright araması başarısız oldu: {e}")

        return items

    async def _search_http(
        self,
        query: str,
        page: int = 1,
        limit: int = 24,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
    ) -> List[ScrapedProductItem]:
        encoded = urllib.parse.quote_plus(query.strip())
        prc_param = ""
        if min_price is not None or max_price is not None:
            p_min = int(min_price) if min_price else 0
            p_max = int(max_price) if max_price else ""
            prc_param = f"&prc={p_min}-{p_max}"
        gw_url = f"https://public.trendyol.com/discovery-web-searchgw-service/v2/api/infinite-scroll/sr?q={encoded}&pi={page}&culture=tr-TR{prc_param}"
        items: List[ScrapedProductItem] = []

        try:
            data = None
            if AsyncSession is not None:
                async with AsyncSession(impersonate="chrome120", verify=False) as session:
                    res = await session.get(gw_url, headers=self.headers, timeout=8.0)
                    if res.status_code == 200:
                        data = res.json()
            else:
                async with httpx.AsyncClient(verify=False, headers=self.headers, timeout=8.0) as client:
                    res = await client.get(gw_url)
                    if res.status_code == 200:
                        data = res.json()

            if data and isinstance(data, dict):
                result_block = data.get("result", {})
                raw_products = result_block.get("products", [])
                for p in raw_products[:limit]:
                    p_id = str(p.get("id", ""))
                    if not p_id:
                        continue
                    price_info = p.get("price", {})
                    current_price = float(price_info.get("sellingPrice", {}).get("value") or price_info.get("discountedPrice", {}).get("value") or 0.0)
                    orig_price = float(price_info.get("originalPrice", {}).get("value") or 0.0) if price_info.get("originalPrice") else None

                    rating_obj = p.get("ratingScore", {}) or {}
                    rating = float(rating_obj.get("averageRating", 0.0) or 0.0)
                    review_count = int(rating_obj.get("totalCount", 0) or 0)

                    rel_url = p.get("url", "")
                    full_url = f"https://www.trendyol.com{rel_url}" if rel_url.startswith("/") else (rel_url or f"https://www.trendyol.com/p-p-{p_id}")

                    images = p.get("images", [])
                    raw_img = images[0] if images else ""
                    clean_img = TrendyolService.normalize_image_url(raw_img) if raw_img else None

                    merchant = p.get("merchant", {}) or {}
                    seller_name = merchant.get("name") or "Trendyol"

                    items.append(
                        ScrapedProductItem(
                            marketplace="trendyol",
                            external_id=p_id,
                            title=str(p.get("name", "")),
                            brand=(p.get("brand") or {}).get("name") if isinstance(p.get("brand"), dict) else None,
                            category_name=p.get("categoryHierarchy"),
                            url=full_url,
                            image_url=clean_img,
                            current_price=current_price,
                            original_price=orig_price,
                            currency="TRY",
                            seller_name=seller_name,
                            seller_id=str(merchant.get("id", "")),
                            rating=rating,
                            review_count=review_count,
                            in_stock=True,
                        )
                    )
        except Exception as e:
            logger.warning(f"Trendyol HTTP Gateway araması başarısız oldu: {e}")

        # Eğer API Gateway yanıt vermediyse HTML arama sayfasından veri çekmeyi dene
        if not items:
            try:
                html_url = f"https://www.trendyol.com/sr?q={encoded}&pi={page}"
                html_res = None
                if AsyncSession is not None:
                    async with AsyncSession(impersonate="chrome120", verify=False) as session:
                        html_res = await session.get(html_url, headers=self.headers, timeout=8.0)
                else:
                    async with httpx.AsyncClient(verify=False, headers=self.headers, timeout=8.0) as client:
                        html_res = await client.get(html_url)

                if html_res and html_res.status_code == 200:
                    text = html_res.text
                    match = re.search(r'__single-search-result__PROPS\s*=\s*(\{.*?\});\s*<\/script>', text, re.DOTALL)
                    if match:
                        props = json.loads(match.group(1))
                        data_block = props.get("data", {}) or {}
                        raw_products = data_block.get("products", [])
                        for p in raw_products[:limit]:
                            p_id = str(p.get("id", ""))
                            if not p_id:
                                continue
                            price_info = p.get("price", {}) or {}
                            current_price = float(price_info.get("sellingPrice", {}).get("value") or price_info.get("discountedPrice", {}).get("value") or 0.0)
                            items.append(
                                ScrapedProductItem(
                                    marketplace="trendyol",
                                    external_id=p_id,
                                    title=str(p.get("name", "")),
                                    brand=(p.get("brand") or {}).get("name") if isinstance(p.get("brand"), dict) else None,
                                    category_name=p.get("categoryHierarchy"),
                                    url=f"https://www.trendyol.com{p.get('url', '')}",
                                    image_url=TrendyolService.normalize_image_url(p.get("images", [""])[0]),
                                    current_price=current_price,
                                    original_price=float(price_info.get("originalPrice", {}).get("value") or 0.0) if price_info.get("originalPrice") else None,
                                    currency="TRY",
                                    seller_name=(p.get("merchant") or {}).get("name") or "Trendyol",
                                    seller_id=str((p.get("merchant") or {}).get("id", "")),
                                    rating=float((p.get("ratingScore") or {}).get("averageRating", 0.0)),
                                    review_count=int((p.get("ratingScore") or {}).get("totalCount", 0)),
                                    in_stock=True,
                                )
                            )
            except Exception as e:
                logger.warning(f"Trendyol HTML arama fallback başarısız oldu: {e}")

        return items

    async def get_by_barcode(self, barcode: str) -> Optional[ScrapedProductItem]:
        items = await self.search(query=barcode, page=1, limit=1)
        return items[0] if items else None
