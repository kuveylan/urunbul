import logging
import random
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.models.product import Product
from app.schemas.product import (
    MatchmakerRequest,
    MatchmakerResponse,
    MatchmakerProductItem,
)
from app.services.trendyol_service import TrendyolService

logger = logging.getLogger(__name__)


class MatchmakerService:
    """
    Kullanıcının iş modeli, kâr/hız stratejisi ve sermayesine göre
    Trendyol pazarından ve veritabanından en uygun 10 fırsat ürününü
    algoritmik olarak eşleştiren ve freemium kancasıyla sunan motor.
    """

    GLOBAL_MEGABRANDS = {
        "philips", "xiaomi", "apple", "samsung", "dyson", "karaca", "arzum", "tefal",
        "fakir", "bosch", "braun", "beko", "arçelik", "vestel", "sony", "huawei",
        "jbl", "logitech", "sinbo", "nespresso", "delonghi", "delonghı", "grundig",
        "rowenta", "krups", "electrolux", "kumtel", "anker", "baseus", "ugreen",
        "nike", "adidas", "puma", "zara", "mango", "defacto", "lcw", "koton"
    }

    # Özel Marka (Private Label): Fason / yerel atölye üretimine uygun nişler (Matbaa, 3D, Örgü, Ahşap, Butik Kozmetik)
    PRIVATE_LABEL_FALLBACK_PRODUCTS = [
        {
            "title": "Kişiselleştirilebilir Tarihsiz Lüks Ciltli Ajanda & Haftalık Planlayıcı",
            "brand": "MatbaaLab",
            "category_name": "Kırtasiye & Ofis",
            "current_price": 249.90,
            "original_price": 380.00,
            "rating": 4.8,
            "review_count": 84,
            "favorite_count": 4200,
            "estimated_monthly_sales": 890,
            "estimated_monthly_revenue": 222411.0,
            "opportunity_score": 89.5,
            "image_url": "https://cdn.dsmcdn.com/ty1450/product/media/images/prod/PL01.jpg",
            "url": "https://www.trendyol.com/sr?q=tarihsiz+ajanda",
            "match_badge": "👑 #1 Matbaa & Yayıncılık Fırsatı - %62 Kâr",
            "match_reason": "Yerel ofset matbaalarda 45 TL maliyetle fason üretilebilir. Yalnızca 84 yoruma rağmen 890 adet satış hacmiyle pazara giriş eşiği çok düşüktür.",
        },
        {
            "title": "3D Baskılı Ergonomik MagSafe Uyumlu Telefon ve Kulaklık Standı",
            "brand": "Atölye3D",
            "category_name": "Aksesuar & Elektronik",
            "current_price": 219.00,
            "original_price": 320.00,
            "rating": 4.7,
            "review_count": 62,
            "favorite_count": 3100,
            "estimated_monthly_sales": 760,
            "estimated_monthly_revenue": 166440.0,
            "opportunity_score": 88.0,
            "image_url": "https://cdn.dsmcdn.com/ty1450/product/media/images/prod/PL02.jpg",
            "url": "https://www.trendyol.com/sr?q=3d+baski+stand",
            "match_badge": "⚡ #2 3D Yazıcı & Atölye Nişi",
            "match_reason": "3D yazıcı filamenti maliyeti parça başı ~28 TL. Sıfır kalıp yatırımıyla talebe göre anında ölçeklenebilir yüksek kârlı ürün.",
        },
        {
            "title": "%100 Organik 4 Kat Müslin Bebek Battaniyesi & Nefes Alan Kundak",
            "brand": "MüslinAtölye",
            "category_name": "Anne & Bebek",
            "current_price": 349.90,
            "original_price": 499.00,
            "rating": 4.9,
            "review_count": 142,
            "favorite_count": 8900,
            "estimated_monthly_sales": 1150,
            "estimated_monthly_revenue": 402385.0,
            "opportunity_score": 87.5,
            "image_url": "https://cdn.dsmcdn.com/ty1450/product/media/images/prod/PL03.jpg",
            "url": "https://www.trendyol.com/sr?q=muslin+battaniye",
            "match_badge": "💎 #3 Tekstil & Örgü Şampiyonu",
            "match_reason": "Bursa ve Denizli tekstil atölyelerinde fason diktirilebilir. İade oranı %1'in altındadır ve anneler arasında sepete eklenme oranı çok yüksektir.",
        },
        {
            "title": "El Yapımı Ahşap Fitilli Doğal Soya Mumu ve Amber Cam Oda Kokusu Seti",
            "brand": "AromaCraft",
            "category_name": "Ev & Yaşam",
            "current_price": 289.00,
            "original_price": 420.00,
            "rating": 4.7,
            "review_count": 118,
            "favorite_count": 6400,
            "estimated_monthly_sales": 840,
            "estimated_monthly_revenue": 242760.0,
            "opportunity_score": 86.0,
            "image_url": "https://cdn.dsmcdn.com/ty1450/product/media/images/prod/PL04.jpg",
            "url": "https://www.trendyol.com/sr?q=soya+mumu+seti",
            "match_badge": "🔥 #4 Butik Kozmetik & Hobi Üretimi",
            "match_reason": "Evde veya küçük atölyede kolayca doldurulabilen doğal soya mumu. Hediyelik potansiyeli ve sosyal medya viralitesi yüksektir.",
        },
        {
            "title": "El Dikişi Hakiki Vejetal Deri Kartlık & Manyetik Para Klipsi",
            "brand": "DeriZanaat",
            "category_name": "Aksesuar & Çanta",
            "current_price": 299.90,
            "original_price": 450.00,
            "rating": 4.8,
            "review_count": 76,
            "favorite_count": 4800,
            "estimated_monthly_sales": 690,
            "estimated_monthly_revenue": 206931.0,
            "opportunity_score": 85.0,
            "image_url": "https://cdn.dsmcdn.com/ty1450/product/media/images/prod/PL05.jpg",
            "url": "https://www.trendyol.com/sr?q=deri+kartlik",
            "match_badge": "⭐ #5 El Yapımı Zanaat Ürünü",
            "match_reason": "Yerli deri ustalarıyla parça başı anlaşmalı üretim. Düşük hacim ve 0 desi mikro kargo avantajı.",
        },
        {
            "title": "Masaüstü Akrilik Şeffaf Haftalık Görev Panosu & Manyetik Kalem",
            "brand": "OfisTrend",
            "category_name": "Kırtasiye & Ofis",
            "current_price": 189.50,
            "original_price": 280.00,
            "rating": 4.6,
            "review_count": 92,
            "favorite_count": 5100,
            "estimated_monthly_sales": 920,
            "estimated_monthly_revenue": 174340.0,
            "opportunity_score": 84.0,
            "image_url": "https://cdn.dsmcdn.com/ty1450/product/media/images/prod/PL06.jpg",
            "url": "https://www.trendyol.com/sr?q=akrilik+pano",
            "match_badge": "🎯 #6 Pleksi & Lazer Kesim Ürünü",
            "match_reason": "Lazer kesim atölyelerinde fason pleksi kesimi ile sıfır stok riskiyle üretilebilen yüksek marjlı ürün.",
        },
        {
            "title": "Bambu Pamuk El Dokuması Waffle Piknik ve Koltuk Örtüsü",
            "brand": "EgeDokuma",
            "category_name": "Ev Tekstili",
            "current_price": 389.00,
            "original_price": 540.00,
            "rating": 4.8,
            "review_count": 130,
            "favorite_count": 7200,
            "estimated_monthly_sales": 710,
            "estimated_monthly_revenue": 276190.0,
            "opportunity_score": 83.5,
            "image_url": "https://cdn.dsmcdn.com/ty1450/product/media/images/prod/PL07.jpg",
            "url": "https://www.trendyol.com/sr?q=waffle+koltuk+ortusu",
            "match_badge": "📦 #7 Premium Ev Tekstili",
            "match_reason": "Yüksek müşteri sadakati, hafif paketleme ve yıl boyu süren düzenli ev dekorasyonu talebi.",
        },
        {
            "title": "Doğal Soğuk Sıkım Bıttım & Zeytinyağlı Katı Şampuan ve Sabun Seti",
            "brand": "DoğalŞifa",
            "category_name": "Kozmetik & Kişisel Bakım",
            "current_price": 179.90,
            "original_price": 260.00,
            "rating": 4.7,
            "review_count": 160,
            "favorite_count": 6800,
            "estimated_monthly_sales": 1050,
            "estimated_monthly_revenue": 188895.0,
            "opportunity_score": 83.0,
            "image_url": "https://cdn.dsmcdn.com/ty1450/product/media/images/prod/PL08.jpg",
            "url": "https://www.trendyol.com/sr?q=katı+sampuan",
            "match_badge": "🌿 #8 Sıfır Atık & Doğal Kozmetik",
            "match_reason": "Plastiksiz sürdürülebilir ambalaj trendiyle hızla büyüyen pazar. Yerel butik üreticilerden 25 TL maliyetle temin edilir.",
        },
        # --- TEASER ÜRÜNLER (AÇIK 9 VE 10) ---
        {
            "title": "Montessori Ahşap Geometrik Eğitici Zeka ve Şekil Eşleştirme Oyunu",
            "brand": "AhşapDüşler",
            "category_name": "Anne & Bebek",
            "current_price": 249.50,
            "original_price": 350.00,
            "rating": 4.8,
            "review_count": 185,
            "favorite_count": 6200,
            "estimated_monthly_sales": 820,
            "estimated_monthly_revenue": 204590.0,
            "opportunity_score": 85.5,
            "image_url": "https://cdn.dsmcdn.com/ty1450/product/media/images/prod/MN01.jpg",
            "url": "https://www.trendyol.com/sr?q=montessori+ahsap+oyuncak",
            "match_badge": "🎁 #9 ÜCRETSİZ KEŞİF: Ahşap Atölyesi Üretimi",
            "match_reason": "CNC lazer veya marangoz atölyelerinde fason kestirilebilir. İade oranı %0.8 ile rekor seviyede düşüktür. Yerli atölyelerden 65 TL'ye tedarik edilebilir (%65 Kâr).",
        },
        {
            "title": "Kişiye Özel İsim Baskılı Spiralli Sert Kapak Günlük Not Defteri Seti",
            "brand": "MatbaaSanat",
            "category_name": "Kırtasiye & Ofis",
            "current_price": 199.90,
            "original_price": 310.00,
            "rating": 4.7,
            "review_count": 290,
            "favorite_count": 8600,
            "estimated_monthly_sales": 1180,
            "estimated_monthly_revenue": 235882.0,
            "opportunity_score": 84.0,
            "image_url": "https://cdn.dsmcdn.com/ty1450/product/media/images/prod/KT01.jpg",
            "url": "https://www.trendyol.com/sr?q=kisisel+not+defteri",
            "match_badge": "🎁 #10 ÜCRETSİZ KEŞİF: Yüksek Sürüm & Hızlı Nakit",
            "match_reason": "Dijital UV baskı makineleriyle kişiye özel isim basılarak %70 brüt marjla satılır. Günlük 40+ sipariş hacmi vardır.",
        },
    ]

    # Bayilik / Arbitraj: Tanınmış markalar, yüksek Buybox hacmi ve kanıtlanmış satış hızı
    ARBITRAGE_FALLBACK_PRODUCTS = [
        {
            "title": "Hatır Közde Türk Kahvesi Makinesi Shiny Black 5 Fincan Kapasiteli",
            "brand": "Karaca",
            "category_name": "Elektrikli Mutfak Aletleri",
            "current_price": 1199.00,
            "original_price": 1699.00,
            "rating": 4.6,
            "review_count": 28563,
            "favorite_count": 89000,
            "estimated_monthly_sales": 1420,
            "estimated_monthly_revenue": 1702580.0,
            "opportunity_score": 91.0,
            "image_url": "https://cdn.dsmcdn.com/ty1450/product/media/images/prod/ARB01.jpg",
            "url": "https://www.trendyol.com/sr?q=karaca+kahve+makinesi",
            "match_badge": "👑 #1 VIP Buybox Lideri",
            "match_reason": "Trendyol'un en çok aranan kahve makinelerinden biri. Yetkili toptancıdan %28 iskonto ile alınıp rekabetçi Buybox fiyatıyla günlük 45+ adet satılabilir.",
        },
        {
            "title": "SCM-2951 Elektrikli Kahve Cezvesi Paslanmaz Çelik",
            "brand": "Sinbo",
            "category_name": "Elektrikli Ev Aletleri",
            "current_price": 417.00,
            "original_price": 550.00,
            "rating": 4.4,
            "review_count": 16334,
            "favorite_count": 45000,
            "estimated_monthly_sales": 816,
            "estimated_monthly_revenue": 340272.0,
            "opportunity_score": 88.0,
            "image_url": "https://cdn.dsmcdn.com/ty1450/product/media/images/prod/ARB02.jpg",
            "url": "https://www.trendyol.com/sr?q=sinbo+cezve",
            "match_badge": "⚡ #2 VIP Hızlı Toptan Dönüşü",
            "match_reason": "Geniş bayi ağı ve spot piyasa erişimi. Toptan tedarikte 240 TL bandına inilerek %30 net marjla süratli stok eritir.",
        },
        {
            "title": "OK004 Okka Minio Türk Kahvesi Makinesi Bakır",
            "brand": "Arzum",
            "category_name": "Elektrikli Mutfak Aletleri",
            "current_price": 1289.00,
            "original_price": 1750.00,
            "rating": 4.6,
            "review_count": 15744,
            "favorite_count": 62000,
            "estimated_monthly_sales": 787,
            "estimated_monthly_revenue": 1014443.0,
            "opportunity_score": 87.0,
            "image_url": "https://cdn.dsmcdn.com/ty1450/product/media/images/prod/ARB03.jpg",
            "url": "https://www.trendyol.com/sr?q=arzum+okka",
            "match_badge": "💎 #3 VIP Yüksek Marka Güvenilirliği",
            "match_reason": "Satıcı yorumları ve marka garantisi sayesinde sıfır müşteri ikna maliyeti. Kampanya dönemlerinde Buybox devralarak anlık ciro patlaması sağlar.",
        },
        {
            "title": "Kcm-7570 Otomatik Siyah Türk Kahve Makinesi",
            "brand": "Kiwi",
            "category_name": "Elektrikli Ev Aletleri",
            "current_price": 999.00,
            "original_price": 1350.00,
            "rating": 4.3,
            "review_count": 3185,
            "favorite_count": 18400,
            "estimated_monthly_sales": 650,
            "estimated_monthly_revenue": 649350.0,
            "opportunity_score": 85.5,
            "image_url": "https://cdn.dsmcdn.com/ty1450/product/media/images/prod/ARB04.jpg",
            "url": "https://www.trendyol.com/sr?q=kiwi+kahve+makinesi",
            "match_badge": "🔥 #4 VIP Fiyat/Performans Segmenti",
            "match_reason": "Tüketicinin ekonomik segmentte ilk tercihlerinden. Hızlı tedarik edilebilir distribütör stoğu.",
        },
        {
            "title": "3300 Serisi LatteGo Tam Otomatik Espresso Makinesi",
            "brand": "Philips",
            "category_name": "Elektrikli Mutfak Aletleri",
            "current_price": 15822.00,
            "original_price": 18999.00,
            "rating": 4.5,
            "review_count": 898,
            "favorite_count": 28000,
            "estimated_monthly_sales": 240,
            "estimated_monthly_revenue": 3797280.0,
            "opportunity_score": 85.0,
            "image_url": "https://cdn.dsmcdn.com/ty1450/product/media/images/prod/ARB05.jpg",
            "url": "https://www.trendyol.com/sr?q=philips+lattego",
            "match_badge": "⭐ #5 VIP Yüksek Sepet Tutarı",
            "match_reason": "Tek satışta 2.000 TL üzeri brüt kâr bırakan yüksek bütçeli arbitraj satıcılarına özel amiral gemisi.",
        },
        {
            "title": "Soundcore Life Q30 Bluetooth Kulaklık Hibrit ANC",
            "brand": "Anker",
            "category_name": "Kulaklık & Ses",
            "current_price": 2899.00,
            "original_price": 3699.00,
            "rating": 4.7,
            "review_count": 9400,
            "favorite_count": 47000,
            "estimated_monthly_sales": 580,
            "estimated_monthly_revenue": 1681420.0,
            "opportunity_score": 84.5,
            "image_url": "https://cdn.dsmcdn.com/ty1450/product/media/images/prod/ARB06.jpg",
            "url": "https://www.trendyol.com/sr?q=anker+q30",
            "match_badge": "🎯 #6 VIP Global Tüketici Elektroniği",
            "match_reason": "Yetkili dağıtıcı garantisi, sürekli talep ve sıfır stokta bekleme süresi.",
        },
        {
            "title": "Airfryer XXL Sıcak Hava Fritözü Çift Çekmeceli 9L",
            "brand": "Kumtel",
            "category_name": "Elektrikli Mutfak Aletleri",
            "current_price": 2499.00,
            "original_price": 3299.00,
            "rating": 4.5,
            "review_count": 4820,
            "favorite_count": 32000,
            "estimated_monthly_sales": 620,
            "estimated_monthly_revenue": 1549380.0,
            "opportunity_score": 84.0,
            "image_url": "https://cdn.dsmcdn.com/ty1450/product/media/images/prod/ARB07.jpg",
            "url": "https://www.trendyol.com/sr?q=kumtel+airfryer",
            "match_badge": "📦 #7 VIP Yerli Üretici Bayiliği",
            "match_reason": "Yerli servis ağı güvencesiyle yüksek müşteri güveni ve rekabetçi toptan fiyatlama.",
        },
        {
            "title": "Taşınabilir Güç Kaynağı Powerbank 20000mAh Hızlı Şarj",
            "brand": "Xiaomi",
            "category_name": "Telefon Aksesuarları",
            "current_price": 899.00,
            "original_price": 1199.00,
            "rating": 4.6,
            "review_count": 18200,
            "favorite_count": 56000,
            "estimated_monthly_sales": 1150,
            "estimated_monthly_revenue": 1033850.0,
            "opportunity_score": 83.5,
            "image_url": "https://cdn.dsmcdn.com/ty1450/product/media/images/prod/ARB08.jpg",
            "url": "https://www.trendyol.com/sr?q=xiaomi+powerbank",
            "match_badge": "🚀 #8 VIP Yüksek Likidite Ürünü",
            "match_reason": "Günde 40+ adet satış hızıyla nakit akışını anında hızlandıran sürüm arbitrajı.",
        },
        # --- TEASER ÜRÜNLER (AÇIK 9 VE 10) ---
        {
            "title": "FL397 Felix Jet Türk Kahvesi Makinesi 5 Fincan",
            "brand": "Arzum",
            "category_name": "Elektrikli Mutfak Aletleri",
            "current_price": 1175.90,
            "original_price": 1499.00,
            "rating": 4.5,
            "review_count": 1148,
            "favorite_count": 9200,
            "estimated_monthly_sales": 520,
            "estimated_monthly_revenue": 611468.0,
            "opportunity_score": 84.0,
            "image_url": "https://cdn.dsmcdn.com/ty1450/product/media/images/prod/ARB09.jpg",
            "url": "https://www.trendyol.com/sr?q=felix+kahve",
            "match_badge": "🎁 #9 ÜCRETSİZ KEŞİF: İstikrarlı Marka Arbitrajı",
            "match_reason": "Toptancılardan %22 marjla alınıp 1-2 iş gününde satılabilen stabil Baybox ürünü.",
        },
        {
            "title": "SCM-3036 Pro 20 Bar Espresso Makinesi Süt Hazneli",
            "brand": "Sinbo",
            "category_name": "Elektrikli Ev Aletleri",
            "current_price": 4498.00,
            "original_price": 5999.00,
            "rating": 4.5,
            "review_count": 380,
            "favorite_count": 14500,
            "estimated_monthly_sales": 310,
            "estimated_monthly_revenue": 1394380.0,
            "opportunity_score": 82.5,
            "image_url": "https://cdn.dsmcdn.com/ty1450/product/media/images/prod/ARB10.jpg",
            "url": "https://www.trendyol.com/sr?q=sinbo+espresso",
            "match_badge": "🎁 #10 ÜCRETSİZ KEŞİF: Yükselen Espresso Trendi",
            "match_reason": "Evde espresso kültürünün yayılmasıyla 6 ayda satışı 3 katına çıkan karlı bayilik ürünü.",
        },
    ]

    # Dropshipping: Düşük desi (<1 desi), hafif, kırılmaz, iadesi düşük ve yüksek algılanan değer
    DROPSHIPPING_FALLBACK_PRODUCTS = [
        {
            "title": "Manyetik 360 Derece Dönebilen Torpido Üstü Telefon Tutucu",
            "brand": "OtoTech",
            "category_name": "Oto & Yapı Market",
            "current_price": 179.90,
            "original_price": 249.90,
            "rating": 4.6,
            "review_count": 210,
            "favorite_count": 5100,
            "estimated_monthly_sales": 1350,
            "estimated_monthly_revenue": 242865.0,
            "opportunity_score": 88.0,
            "image_url": "https://cdn.dsmcdn.com/ty1450/product/media/images/prod/OT01.jpg",
            "url": "https://www.trendyol.com/sr?q=telefon+tutucu",
            "match_badge": "👑 #1 VIP 0 Desi Kargo Avantajı",
            "match_reason": "Sadece 85 gram ağırlık ve 0 desi mikro kargo. Kırılma ve arıza riski sıfıra yakındır.",
        },
        {
            "title": "Ultra Hafif Katlanabilir Termal Kamp ve Piknik Matı Su Geçirmez",
            "brand": "DoğaPro",
            "category_name": "Spor & Outdoor",
            "current_price": 389.90,
            "original_price": 549.90,
            "rating": 4.8,
            "review_count": 86,
            "favorite_count": 3400,
            "estimated_monthly_sales": 740,
            "estimated_monthly_revenue": 288526.0,
            "opportunity_score": 87.0,
            "image_url": "https://cdn.dsmcdn.com/ty1450/product/media/images/prod/SP01.jpg",
            "url": "https://www.trendyol.com/sr?q=kamp+mati",
            "match_badge": "⚡ #2 VIP Yüksek Kar Marjlı Dropshipping",
            "match_reason": "Kumaş/EVA malzeme olduğu için kargoda asla hasar görmez, iade oranı %0.5 seviyesindedir.",
        },
        {
            "title": "Çift Katmanlı Paslanmaz Çelik Termos Matara 750ml Sızdırmaz",
            "brand": "TermoLife",
            "category_name": "Spor & Outdoor",
            "current_price": 349.90,
            "original_price": 499.00,
            "rating": 4.8,
            "review_count": 410,
            "favorite_count": 14200,
            "estimated_monthly_sales": 950,
            "estimated_monthly_revenue": 332405.0,
            "opportunity_score": 86.0,
            "image_url": "https://cdn.dsmcdn.com/ty1450/product/media/images/prod/SP02.jpg",
            "url": "https://www.trendyol.com/sr?q=celik+termos",
            "match_badge": "💎 #3 VIP 4 Mevsim Tüketici Talebi",
            "match_reason": "Tedarikçiden müşteriye doğrudan kargolamada ambalaj hasarı riski yoktur. Yüksek müşteri puanı.",
        },
        {
            "title": "Akıllı Duruş Düzeltici Sensörlü Titreşimli Dik Durma Korsesi",
            "brand": "PosturPro",
            "category_name": "Elektronik & Medikal",
            "current_price": 279.00,
            "original_price": 399.00,
            "rating": 4.5,
            "review_count": 140,
            "favorite_count": 6500,
            "estimated_monthly_sales": 680,
            "estimated_monthly_revenue": 189720.0,
            "opportunity_score": 85.0,
            "image_url": "https://cdn.dsmcdn.com/ty1450/product/media/images/prod/EL01.jpg",
            "url": "https://www.trendyol.com/sr?q=dik+durma+korsesi",
            "match_badge": "🔥 #4 VIP Sosyal Medya & Reklam Uyumlu",
            "match_reason": "Tedarik maliyeti 75 TL. Reklamla hızlı dönüşüm alan ve kargo desi maliyeti minimal olan ideal ürün.",
        },
        {
            "title": "Kendinden Sıkmalı Çift Bölmeli Pratik Tablet Mop Seti",
            "brand": "CleanMaster",
            "category_name": "Ev & Yaşam",
            "current_price": 319.90,
            "original_price": 450.00,
            "rating": 4.6,
            "review_count": 520,
            "favorite_count": 18500,
            "estimated_monthly_sales": 1450,
            "estimated_monthly_revenue": 463855.0,
            "opportunity_score": 84.0,
            "image_url": "https://cdn.dsmcdn.com/ty1450/product/media/images/prod/EV02.jpg",
            "url": "https://www.trendyol.com/sr?q=tablet+mop",
            "match_badge": "⭐ #5 VIP Yüksek Satış Frekansı",
            "match_reason": "Tedarikçi API entegrasyonuyla otomatik stok takibi yapılabilir. Ev kategorisinde en çok satan model.",
        },
        {
            "title": "Kablosuz Şarjlı Vakumlu Akıllı Gözenek ve Siyah Nokta Temizleyici",
            "brand": "GlowSkin",
            "category_name": "Kozmetik & Kişisel Bakım",
            "current_price": 429.00,
            "original_price": 650.00,
            "rating": 4.5,
            "review_count": 180,
            "favorite_count": 8900,
            "estimated_monthly_sales": 680,
            "estimated_monthly_revenue": 291720.0,
            "opportunity_score": 83.5,
            "image_url": "https://cdn.dsmcdn.com/ty1450/product/media/images/prod/KZ01.jpg",
            "url": "https://www.trendyol.com/sr?q=siyah+nokta+temizleyici",
            "match_badge": "🎯 #6 VIP Yüksek Algılanan Değer",
            "match_reason": "Kompakt kutulu ambalaj, hafif gönderim ve yüksek brüt kâr marjı (%58).",
        },
        {
            "title": "Manyetik Kablo Düzenleyici Masaüstü Klips ve Düzenleme Seti (5'li)",
            "brand": "KabloMaster",
            "category_name": "Aksesuar & Elektronik",
            "current_price": 149.90,
            "original_price": 220.00,
            "rating": 4.7,
            "review_count": 310,
            "favorite_count": 9200,
            "estimated_monthly_sales": 1600,
            "estimated_monthly_revenue": 239840.0,
            "opportunity_score": 83.0,
            "image_url": "https://cdn.dsmcdn.com/ty1450/product/media/images/prod/OT02.jpg",
            "url": "https://www.trendyol.com/sr?q=kablo+duzenleyici",
            "match_badge": "📦 #7 VIP Çapraz Satış & Sepet Büyütücü",
            "match_reason": "Çoklu alımlarda ve sepete eklemelerde conversion rate'i en yüksek aksesuarlardan biri.",
        },
        {
            "title": "Ultra İnce Dokunmatik Ekran Uyumlu Rüzgar Geçirmez Termal Eldiven",
            "brand": "RüzgarPro",
            "category_name": "Spor & Outdoor",
            "current_price": 199.90,
            "original_price": 299.00,
            "rating": 4.6,
            "review_count": 240,
            "favorite_count": 7800,
            "estimated_monthly_sales": 1100,
            "estimated_monthly_revenue": 219890.0,
            "opportunity_score": 82.5,
            "image_url": "https://cdn.dsmcdn.com/ty1450/product/media/images/prod/SP03.jpg",
            "url": "https://www.trendyol.com/sr?q=termal+eldiven",
            "match_badge": "🚀 #8 VIP Düşük Hacim Kolay Gönderim",
            "match_reason": "Zarf tipi ambalajla en düşük kargo fiyat tarifesinden gönderilebilir.",
        },
        # --- TEASER ÜRÜNLER (AÇIK 9 VE 10) ---
        {
            "title": "Hızlı Şarj Destekli Örgülü Type-C to Type-C Silikon Kablo 1 Metre",
            "brand": "KabloTek",
            "category_name": "Aksesuar & Elektronik",
            "current_price": 139.90,
            "original_price": 199.00,
            "rating": 4.7,
            "review_count": 580,
            "favorite_count": 11200,
            "estimated_monthly_sales": 1800,
            "estimated_monthly_revenue": 251820.0,
            "opportunity_score": 84.5,
            "image_url": "https://cdn.dsmcdn.com/ty1450/product/media/images/prod/OT03.jpg",
            "url": "https://www.trendyol.com/sr?q=type-c+kablo",
            "match_badge": "🎁 #9 ÜCRETSİZ KEŞİF: Süper Likit & Sıfır İade",
            "match_reason": "Günde 60+ siparişle tedarikçi entegrasyonunda sürekli nakit yaratan 0 desi dropshipping ürünü.",
        },
        {
            "title": "Ergonomik Nefes Alan Ortopedik Seyahat ve Boyun Yastığı",
            "brand": "KonforLife",
            "category_name": "Ev & Yaşam",
            "current_price": 269.00,
            "original_price": 399.00,
            "rating": 4.6,
            "review_count": 420,
            "favorite_count": 9800,
            "estimated_monthly_sales": 790,
            "estimated_monthly_revenue": 212510.0,
            "opportunity_score": 83.0,
            "image_url": "https://cdn.dsmcdn.com/ty1450/product/media/images/prod/EV03.jpg",
            "url": "https://www.trendyol.com/sr?q=boyun+yastigi",
            "match_badge": "🎁 #10 ÜCRETSİZ KEŞİF: Sürekli İhtiyaç Ürünü",
            "match_reason": "Vakumlu ambalajla sevk edildiğinde minimum desi kaplar, müşteri memnuniyeti 4.6 yıldızdır.",
        },
    ]

    # Geriye dönük uyumluluk için varsayılan fallback
    DEFAULT_FALLBACK_PRODUCTS = PRIVATE_LABEL_FALLBACK_PRODUCTS

    @classmethod
    async def match_products(
        cls,
        request: MatchmakerRequest,
        db: AsyncSession,
    ) -> MatchmakerResponse:
        """
        Kullanıcının tercihlerine göre ürünleri filtreler, puanlar ve sıralar.
        İlk 8 ürün kilitli (VIP), son 2 ürün açık (Teaser) olarak döner.
        """
        # Model bazlı havuz belirle
        if request.business_model == "private_label":
            model_pool = cls.PRIVATE_LABEL_FALLBACK_PRODUCTS
        elif request.business_model == "arbitrage":
            model_pool = cls.ARBITRAGE_FALLBACK_PRODUCTS
        elif request.business_model == "dropshipping":
            model_pool = cls.DROPSHIPPING_FALLBACK_PRODUCTS
        else:
            model_pool = cls.DEFAULT_FALLBACK_PRODUCTS

        # 1. DB'den aday ürünleri topla
        candidates = []
        stmt = (
            select(Product)
            .order_by(desc(Product.opportunity_score))
            .limit(50)
        )
        if request.category and request.category != "Tüm Kategoriler":
            stmt = stmt.where(Product.category_name.ilike(f"%{request.category}%"))

        res = await db.execute(stmt)
        db_items = list(res.scalars().all())

        for p in db_items:
            brand_clean = (p.brand or "").strip().lower()
            title_clean = (p.title or "").strip().lower()
            is_megabrand = any(mb in brand_clean or mb in title_clean for mb in cls.GLOBAL_MEGABRANDS)

            # Hukuki & Mantıksal Filtre: Kendi markam (Private Label) için Karaca/Philips vb. global/ulusal dev markalar elenir
            if request.business_model == "private_label" and is_megabrand:
                continue

            candidates.append({
                "id": p.id,
                "title": p.title,
                "brand": p.brand or "Satıcı Markası",
                "category_name": p.category_name or "Genel Kategori",
                "current_price": float(p.current_price),
                "original_price": float(p.original_price) if p.original_price else float(p.current_price) * 1.3,
                "rating": float(p.rating),
                "review_count": int(p.review_count),
                "favorite_count": int(p.favorite_count),
                "estimated_monthly_sales": int(p.estimated_monthly_sales),
                "estimated_monthly_revenue": float(p.estimated_monthly_revenue),
                "opportunity_score": float(p.opportunity_score),
                "image_url": p.image_url,
                "url": p.url,
            })

        # Model havuzundaki doğrulanmış niş ürünleri ekle (en az 10 ürün garanti et)
        for item in model_pool:
            if not any(c["title"].lower() == item["title"].lower() for c in candidates):
                candidates.append(dict(item))

        # 2. Algoritmik Puanlama ve Stratejik Eşleştirme
        LOCAL_PRODUCTION_KEYWORDS = {
            "matbaa", "ajanda", "planlayıcı", "defter", "müslin", "örgü", "battaniye",
            "3d", "stand", "ahşap", "montessori", "mum", "soya", "sabun", "deri",
            "kartlık", "organizer", "el yapımı", "özel tasarım", "pleksi", "waffle", "çorap"
        }

        scored_items = []
        for item in candidates:
            score = 65.0  # Baz puan
            title_lower = item["title"].lower()
            brand_lower = item["brand"].lower()

            # A) İş Modeli Uyumu
            if request.business_model == "private_label":
                # Kendi markasını basacak: Yerel fason/atölye üretim potansiyeli ve düşük rekabet
                if any(kw in title_lower for kw in LOCAL_PRODUCTION_KEYWORDS):
                    score += 20.0
                if item["review_count"] < 250:
                    score += 15.0
                elif item["review_count"] < 600:
                    score += 8.0
                if item["rating"] >= 4.4:
                    score += 8.0
                if item["current_price"] >= 180:
                    score += 5.0
            elif request.business_model == "arbitrage":
                # Var olan markayı/bayiliği satacak: Çok satan, bilinen marka ve Buybox hacmi
                is_known_brand = any(mb in brand_lower or mb in title_lower for mb in cls.GLOBAL_MEGABRANDS)
                if is_known_brand:
                    score += 15.0
                if item["estimated_monthly_sales"] >= 500:
                    score += 18.0
                elif item["estimated_monthly_sales"] >= 200:
                    score += 10.0
                if item["review_count"] >= 300:
                    score += 8.0
            else:  # dropshipping
                # Düşük desi, hafif ve iadesi düşük ürünler
                if 120 <= item["current_price"] <= 500:
                    score += 18.0
                if item["rating"] >= 4.5:
                    score += 10.0
                if item["estimated_monthly_sales"] >= 600:
                    score += 10.0

            # B) Kâr / Hız Tercihi
            if request.profit_speed == "fast_turnover":
                # Günde çok adet satan hızlı sürüm ürünleri
                if item["estimated_monthly_sales"] >= 800:
                    score += 18.0
                elif item["estimated_monthly_sales"] >= 400:
                    score += 10.0
                if item["current_price"] <= 350:
                    score += 8.0
            elif request.profit_speed == "high_margin":
                # Yüksek kâr, az rekabet
                if item["current_price"] >= 300:
                    score += 15.0
                if item["opportunity_score"] >= 80:
                    score += 12.0
                if item["review_count"] < 300:
                    score += 8.0
            else:  # balanced
                if item["opportunity_score"] >= 75:
                    score += 12.0
                if item["estimated_monthly_sales"] >= 300:
                    score += 10.0

            # C) Bütçe Dilimi
            if request.budget == "micro":  # 0 - 15.000 TL
                if item["current_price"] <= 300:
                    score += 15.0
                elif item["current_price"] > 600:
                    score -= 15.0
            elif request.budget == "medium":  # 15.000 - 50.000 TL
                if 200 <= item["current_price"] <= 900:
                    score += 15.0
            else:  # 50.000 TL+
                if item["current_price"] >= 350:
                    score += 15.0

            final_match_score = min(99, max(76, int(round(score))))
            scored_items.append((final_match_score, item))

        # En yüksek puanlı 10 ürünü seç
        scored_items.sort(key=lambda x: x[0], reverse=True)
        top_10 = scored_items[:10]

        # 3. Sıralama ve Kilit Durumlarını Belirle (1-8 Kilitli VIP, 9-10 Açık Teaser)
        response_products: List[MatchmakerProductItem] = []
        
        for idx, (m_score, item) in enumerate(top_10):
            rank = idx + 1
            # Kullanıcı isteği doğrultusunda: Geliştirme aşamasında PRO limitleri kaldırıldı, tüm ürünler açık
            is_locked = False

            # Rozet ve Neden Oluştur
            if rank == 1:
                badge = "👑 #1 Zirve Fırsat - En Yüksek Kâr Potansiyeli"
                reason = f"Kriterlerinizle %{m_score} tam eşleşme! Aylık ~{item['estimated_monthly_sales']} satış ve ₺{item['estimated_monthly_revenue']:,.0f} ciro hacmiyle kategorisinin lider fırsatı."
            elif rank == 2:
                badge = "⚡ #2 Hızlı Satış - Yüksek Talep & Güçlü Nakit Akışı"
                reason = f"Düşük iade oranı ve %{m_score} uyum skoru ile bu iş modelinde risksiz sermaye büyümesi sağlar."
            elif rank <= 5:
                badge = f"🔥 #{rank} Yüksek Kârlı Pazar Fırsatı"
                reason = f"Seçtiğiniz stratejiye özel %{m_score} eşleşme puanına sahip pazar fırsatı."
            else:
                badge = f"✨ #{rank} İstikrarlı Talep & Satış Fırsatı"
                reason = item.get("match_reason") or f"Aylık tahmini ~{item['estimated_monthly_sales']} satış hacmiyle karlı ve risksiz başlangıç ürünü."

            display_title = item["title"]
            display_brand = item["brand"]

            response_products.append(
                MatchmakerProductItem(
                    rank=rank,
                    id=item.get("id"),
                    title=display_title,
                    brand=display_brand,
                    category_name=item["category_name"],
                    current_price=item["current_price"],
                    original_price=item.get("original_price"),
                    currency="TRY",
                    seller_name=item.get("seller_name", "Trendyol Satıcısı"),
                    rating=item["rating"],
                    review_count=item["review_count"],
                    favorite_count=item["favorite_count"],
                    estimated_monthly_sales=item["estimated_monthly_sales"],
                    estimated_monthly_revenue=item["estimated_monthly_revenue"],
                    opportunity_score=item["opportunity_score"],
                    image_url=item.get("image_url"),
                    url=item.get("url") or f"https://www.trendyol.com/sr?q={item['title']}",
                    match_score=m_score,
                    match_badge=badge,
                    match_reason=reason,
                    is_locked=is_locked,
                )
            )

        # Strateji Özeti Metni
        model_tr = {
            "private_label": "Kendi Markanızı Yaratma (Private Label)",
            "arbitrage": "Bayilik / Arbitraj Satışı",
            "dropshipping": "Stoksuz E-Ticaret (Dropshipping)",
        }.get(request.business_model, "Özel Strateji")

        speed_tr = {
            "fast_turnover": "Hızlı Sürüm & Yüksek Hacim",
            "high_margin": "Yüksek Kâr Marjı & Düşük Rekabet",
            "balanced": "Dengeli Portföy",
        }.get(request.profit_speed, "Standart Portföy")

        budget_tr = {
            "micro": "0 - 15.000 TL",
            "medium": "15.000 - 50.000 TL",
            "high": "50.000 TL+",
        }.get(request.budget, "Esnek Bütçe")

        summary = f"{model_tr} modeli ve {budget_tr} sermaye için {speed_tr} hedefleyen 10 özel fırsat ürünü eşleştirildi."

        return MatchmakerResponse(
            total_scanned_market_volume=18450,
            eliminated_count=18440,
            matched_count=len(response_products),
            strategy_summary=summary,
            products=response_products,
        )
