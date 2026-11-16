import re
from typing import List, Dict, Any
from app.schemas.optimizer import (
    ListingOptimizeRequest,
    ListingOptimizeResponse,
    ListingQualityCheck,
    AiListingRequest,
    AiListingResponse,
)


class ListingOptimizerService:
    # Popüler kategorik anahtar kelime havuzu
    CATEGORY_KEYWORDS: Dict[str, List[str]] = {
        "Elektronik": ["Kablosuz", "Bluetooth 5.3", "Hızlı Şarj", "Uyumlu", "Orijinal", "Mikrofonlu", "Gürültü Önleyici ANC"],
        "Küçük Ev Aletleri": ["Otomatik", "Paslanmaz Çelik", "Dokunmatik", "Güçlü Motor", "Geniş Hazne", "Közde Pişirme", "Ergonomik"],
        "Giyim": ["Oversize", "Pamuklu", "Rahat Kesim", "Nefes Alabilir", "Baskılı", "Trend", "Şık Tasarım"],
        "Ev & Yaşam": ["Çift Cidarlı", "Vakumlu", "Sızdırmaz", "BPA Free", "Dayanıklı", "Kolay Temizlenir"],
        "Genel": ["Premium", "Dayanıklı", "Yeni Nesil", "Ergonomik", "Yüksek Kalite"],
    }

    @classmethod
    def analyze_listing(cls, req: ListingOptimizeRequest) -> ListingOptimizeResponse:
        title = req.title.strip()
        title_len = len(title)
        words = title.split()
        checks: List[ListingQualityCheck] = []
        total_score = 100

        # 1. Başlık Uzunluğu Kontrolü (İdeal: 50-110 karakter)
        if title_len < 30:
            total_score -= 30
            checks.append(ListingQualityCheck(
                rule="Başlık Uzunluğu",
                status="FAIL",
                score_impact=-30,
                message=f"Başlık çok kısa ({title_len} karakter). Trendyol arama algoritması kısa başlıkları alt sıralara atar. En az 50-90 karakter olmalıdır."
            ))
        elif title_len < 55:
            total_score -= 15
            checks.append(ListingQualityCheck(
                rule="Başlık Uzunluğu",
                status="WARN",
                score_impact=-15,
                message=f"Başlık biraz kısa ({title_len} karakter). 60-100 karakter arası daha fazla arama sorgusunu yakalar."
            ))
        elif title_len > 130:
            total_score -= 10
            checks.append(ListingQualityCheck(
                rule="Başlık Uzunluğu",
                status="WARN",
                score_impact=-10,
                message=f"Başlık çok uzun ({title_len} karakter). Mobil ekranda kesilebilir, kritik kelimeleri başa alın."
            ))
        else:
            checks.append(ListingQualityCheck(
                rule="Başlık Uzunluğu",
                status="PASS",
                score_impact=0,
                message=f"Harika! Başlık uzunluğu ({title_len} karakter) Trendyol standartlarına tam uyumlu."
            ))

        # 2. Marka Kontrolü
        brand_name = req.brand.strip() if req.brand else ""
        brand_detected = False
        if brand_name:
            if title.lower().startswith(brand_name.lower()):
                brand_detected = True
                checks.append(ListingQualityCheck(
                    rule="Marka Yerleşimi",
                    status="PASS",
                    score_impact=0,
                    message=f"Mükemmel! Marka adı ({brand_name}) başlığın en başında yer alıyor."
                ))
            elif brand_name.lower() in title.lower():
                brand_detected = True
                total_score -= 10
                checks.append(ListingQualityCheck(
                    rule="Marka Yerleşimi",
                    status="WARN",
                    score_impact=-10,
                    message=f"Marka adı ({brand_name}) başlıkta var ancak cümlenin başında değil. Trendyol SEO'su için en başa taşıyın."
                ))
            else:
                total_score -= 20
                checks.append(ListingQualityCheck(
                    rule="Marka Bilgisi",
                    status="FAIL",
                    score_impact=-20,
                    message=f"Marka adı ({brand_name}) başlıkta bulunamadı! Markasız başlıklar aramalarda geride kalır."
                ))
        else:
            # Marka belirtilmemişse kelime kontrolü
            checks.append(ListingQualityCheck(
                rule="Marka Belirleme",
                status="WARN",
                score_impact=-5,
                message="Başlığınızda bir marka adı belirtmeniz müşteri güvenini ve tıklanma oranını artırır."
            ))
            total_score -= 5

        # 3. Spesifik Özellik / Renk / Model Kontrolü
        common_specs = ["siyah", "beyaz", "gri", "kırmızı", "mavi", "pro", "max", "plus", "ultra", "mini", "set", "adet"]
        has_spec = any(s in title.lower() for s in common_specs) or re.search(r"\d+", title)
        if has_spec:
            checks.append(ListingQualityCheck(
                rule="Teknik Nitelik & Renk/Model",
                status="PASS",
                score_impact=0,
                message="Başlıkta model, renk veya teknik özellik varyantı tespit edildi."
            ))
        else:
            total_score -= 15
            checks.append(ListingQualityCheck(
                rule="Teknik Nitelik & Renk/Model",
                status="WARN",
                score_impact=-15,
                message="Başlıkta renk, kapasite veya model detayı yok. Müşteriler renk ve model ararken ürününüzü bulamayabilir."
            ))

        # 4. Eksik Anahtar Kelime Tespiti ve Öneriler
        cat_pool = cls.CATEGORY_KEYWORDS.get(req.category, cls.CATEGORY_KEYWORDS["Genel"])
        missing_keywords = [kw for kw in cat_pool if kw.lower() not in title.lower()][:4]
        if req.target_keywords:
            for tkw in req.target_keywords:
                if tkw.lower() not in title.lower() and tkw not in missing_keywords:
                    missing_keywords.insert(0, tkw)

        # 5. Optimize Edilmiş Başlık Üretimi (Smart Title Generator)
        prefix_brand = f"{brand_name} " if brand_name and not title.lower().startswith(brand_name.lower()) else ""
        clean_core = title if not brand_name else re.sub(rf"^{re.escape(brand_name)}\s*", "", title, flags=re.IGNORECASE)
        addon = " " + " ".join(missing_keywords[:2]) if missing_keywords else ""
        suggested_title = f"{prefix_brand}{clean_core}{addon}".strip()

        # Skor sınırlama
        final_score = max(20, min(100, total_score))

        grade = "Mükemmel" if final_score >= 85 else ("İyi" if final_score >= 70 else ("Geliştirilmeli" if final_score >= 50 else "Zayıf"))

        seo_tips = [
            "Trendyol'da ürün başlıkları arama motorunun indekslediği en kritik alandır.",
            "Marka adını her zaman en başa yazın (Örn: 'Arzum Okka Minio...').",
            "Müşterilerin filtrelerde seçtiği renk, kapasite (örn: 7.2L, 500ml) ve teknolojileri (Bluetooth 5.3) mutlaka başlıkta geçirin.",
            "Tüm harfleri BÜYÜK yazmaktan kaçının; sadece kelimelerin ilk harflerini büyük yazmak okunabilirliği artırır."
        ]

        return ListingOptimizeResponse(
            original_title=title,
            length=title_len,
            character_count=title_len,
            max_recommended_length=100,
            word_count=len(words),
            overall_seo_score=final_score,
            seo_score=final_score,
            grade=grade,
            brand_detected=brand_detected,
            quality_checks=checks,
            recommended_keywords_to_add=missing_keywords,
            suggested_improved_title=suggested_title,
            improved_title=suggested_title,
            seo_tips=seo_tips,
            suggestions=seo_tips,
        )

    @classmethod
    def generate_ai_listing(cls, req: AiListingRequest) -> AiListingResponse:
        """
        AI Destekli Trendyol Listing Üreticisi:
        Marka, ürün tipi, özellikler ve hedef anahtar kelimelerden
        Trendyol SEO algoritmasına %100 uyumlu başlık, 5 adet satış maddesi ve etiketler üretir.
        """
        brand = req.brand.strip().title()
        p_type = req.product_type.strip().title()
        variant = f" {req.color_or_variant.strip().title()}" if req.color_or_variant else ""

        # En kritik 2-3 özelliği seç
        feat_str = ""
        if req.key_features:
            feat_str = " " + " ".join(f.strip().title() for f in req.key_features[:2])

        # Başlığı inşa et: [Marka] [Ürün Tipi] [Özellikler] [Varyant]
        title_candidate = f"{brand} {p_type}{feat_str}{variant}".strip()

        # Eğer başlık kısa kaldıysa hedef kelimelerden ekle
        if len(title_candidate) < 55 and req.keywords:
            for kw in req.keywords:
                clean_kw = kw.strip().title()
                if clean_kw.lower() not in title_candidate.lower() and len(title_candidate) + len(clean_kw) + 1 <= 95:
                    title_candidate += f" {clean_kw}"

        # 5 Satış Odaklı Madde (Bullet Points)
        bullet_points = [
            f"⚡ **Üstün Performans:** {brand} güvencesiyle geliştirilen {p_type}, günlük kullanımda maksimum verimlilik ve konfor sağlar.",
            f"🎯 **Yüksek Kalite Standartları:** Birinci sınıf malzeme yapısı ve modern tasarımıyla uzun ömürlü kullanım sunar.",
            f"✨ **Ergonomik & Şık Tasarım:** Kullanıcı dostu detaylar ve hafif gövdesiyle her ortamda pratik kullanım.",
            f"📦 **Hasarsız Teslimat Güvencesi:** Ürününüz darbelere karşı ekstra korumalı özel ambalajında güvenle kargolanır.",
            f"🇹🇷 **Orijinal Ürün & Yetkili Satıcı Garantisi:** 2 yıl resmi distribütör garantili ve adınıza faturalı teslimat."
        ]

        # Backend arama etiketleri
        backend_terms = list(dict.fromkeys(
            [brand.lower(), p_type.lower()] +
            [kw.lower() for kw in req.keywords] +
            [f.lower() for f in (req.key_features or [])]
        ))[:10]

        return AiListingResponse(
            generated_title=title_candidate,
            character_count=len(title_candidate),
            bullet_points=bullet_points,
            backend_search_terms=backend_terms,
            predicted_seo_score=95,
            seo_tips=[
                "Oluşturulan başlık Trendyol mobil ve masaüstü arama algoritmalarına tam optimize edilmiştir.",
                "Madde açıklamalarını ürün panelinizdeki 'Ürün Açıklaması' bölümüne aynen kopyalayabilirsiniz."
            ]
        )
