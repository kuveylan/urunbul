import sys
from pathlib import Path
pkg_dir = (Path(__file__).resolve().parents[3] / "packages").as_posix()
if pkg_dir not in sys.path:
    sys.path.insert(0, pkg_dir)

import pytest
from scraper_engine import ScrapedProductItem, CrossMarketplaceMatcher


def test_matcher_rejects_accessory_vs_main_device():
    # Ana cihaz
    iphone = ScrapedProductItem(
        marketplace="trendyol",
        external_id="ty-ip-1",
        title="Apple iPhone 15 Pro Max 256GB Titanyum Gri",
        brand="Apple",
        current_price=75000.0,
        url="https://trendyol.com/iphone",
        in_stock=True
    )

    # Kılıf (aksesuar) - yüksek kelime benzerliği olmasına rağmen eşleşmemeli!
    case = ScrapedProductItem(
        marketplace="hepsiburada",
        external_id="hb-case-1",
        title="Apple iPhone 15 Pro Max Kılıf Kamera Korumalı Titanyum Gri",
        brand="Apple",
        current_price=249.0,
        url="https://hepsiburada.com/case",
        in_stock=True
    )

    is_match = CrossMarketplaceMatcher.is_valid_cross_match(iphone, case)
    assert is_match is False, "Aksesuar (kılıf) ana cihazla asla eşleşmemelidir!"


def test_matcher_rejects_conflicting_model_numbers():
    # Dyson V15
    dyson_v15 = ScrapedProductItem(
        marketplace="trendyol",
        external_id="ty-dy-1",
        title="Dyson V15 Detect Kablosuz Dikey Süpürge Sarı/Nikel",
        brand="Dyson",
        current_price=28000.0,
        url="https://trendyol.com/v15",
        in_stock=True
    )

    # Dyson V12
    dyson_v12 = ScrapedProductItem(
        marketplace="amazon",
        external_id="az-dy-2",
        title="Dyson V12 Detect Slim Kablosuz Dikey Süpürge",
        brand="Dyson",
        current_price=22000.0,
        url="https://amazon.com.tr/v12",
        in_stock=True
    )

    is_match = CrossMarketplaceMatcher.is_valid_cross_match(dyson_v15, dyson_v12)
    assert is_match is False, "V15 ile V12 farklı model numaraları olduğu için eşleşmemelidir!"


def test_matcher_accepts_valid_same_product():
    p1 = ScrapedProductItem(
        marketplace="trendyol",
        external_id="ty-arz-1",
        title="Arzum Okka Minio Türk Kahvesi Makinesi Siyah/Krom",
        brand="Arzum",
        current_price=1500.0,
        url="https://trendyol.com/arzum",
        in_stock=True
    )

    p2 = ScrapedProductItem(
        marketplace="hepsiburada",
        external_id="hb-arz-2",
        title="Arzum Okka Minio Türk Kahvesi Makinesi Siyah",
        brand="Arzum",
        current_price=1420.0,
        url="https://hepsiburada.com/arzum",
        in_stock=True
    )

    is_match = CrossMarketplaceMatcher.is_valid_cross_match(p1, p2)
    assert is_match is True, "Aynı model ve marka ürünler başarıyla eşleşmelidir!"


def test_matcher_barcode_override():
    # Farklı başlık varyasyonları olsa bile barkod aynıysa eşleşir
    p1 = ScrapedProductItem(
        marketplace="trendyol",
        external_id="ty-b-1",
        title="Logitech G305 Lightspeed Kablosuz Oyuncu Faresi",
        barcode="8690001112223",
        current_price=1200.0,
        url="https://trendyol.com/g305",
        in_stock=True
    )

    p2 = ScrapedProductItem(
        marketplace="amazon",
        external_id="az-b-2",
        title="Logitech G G305 Wireless Gaming Mouse Black",
        barcode="8690001112223",
        current_price=1150.0,
        url="https://amazon.com.tr/g305",
        in_stock=True
    )

    is_match = CrossMarketplaceMatcher.is_valid_cross_match(p1, p2)
    assert is_match is True, "Barkod eşitliği tüm metin varyasyonlarının üzerinde tutulmalıdır!"
