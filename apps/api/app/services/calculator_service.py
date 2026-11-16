import re
from typing import Dict, Any, Tuple, Optional, List
from urllib.parse import urlparse, unquote
import httpx
from loguru import logger
from app.schemas.calculator import (
    ProfitCalculationRequest,
    ProfitCalculationResponse,
    LinkAnalysisResponse,
)


class CalculatorService:
    # 2026 Türkiye Pazaryerleri Resmi Kategori Komisyon Oranları Tablosu (%)
    MARKETPLACE_COMMISSIONS: Dict[str, Dict[str, float]] = {
        "Trendyol": {
            "Kadın / Erkek Üst Giyim (Tişört, Gömlek, Kazak)": 21.0,
            "Kadın / Erkek Alt Giyim (Pantolon, Jean, Etek)": 21.0,
            "Elbise, Takım Elbise & Abiye": 22.0,
            "Dış Giyim (Mont, Kaban, Trençkot, Yelek)": 22.0,
            "İç Giyim, Pijama & Çorap": 23.0,
            "Spor Ayakkabı & Sneaker": 21.5,
            "Klasik & Günlük Ayakkabı (Topuklu, Babet, Terlik)": 21.5,
            "Bot & Çizme": 21.5,
            "Çanta, Sırt Çantası & Cüzdan": 22.0,
            "Valiz & Seyahat Çantaları": 18.0,
            "Telefon Kılıfı, Cam & Ekran Koruyucu": 20.0,
            "Şarj Cihazı, Data Kablosu & Powerbank": 15.0,
            "Bluetooth Kulaklık & Kablosuz Hoparlör": 11.0,
            "Akıllı Saat & Akıllı Bileklik": 11.0,
            "Akıllı Telefon (Cep Telefonu)": 6.0,
            "Klavye, Mouse & Oyuncu Ekipmanları": 12.0,
            "Dizüstü Bilgisayar (Laptop) & Tablet": 6.5,
            "Monitör, Yazıcı & Tarayıcı": 9.0,
            "Kahve & Çay Makineleri (Espresso, Filtre, Türk Kahvesi)": 13.0,
            "Blender, Mikser, Mutfak Robotu & Tost Makinesi": 13.0,
            "Airfryer (Sıcak Hava Fritözü) & Pişiriciler": 13.0,
            "Robot Süpürge, Dikey & Toz Torbalı Süpürgeler": 12.5,
            "Ütü & Buharlı Kırışıklık Giderici": 13.0,
            "Tencere, Tava & Pişirme Setleri (Granit, Döküm, Çelik)": 18.0,
            "Yemek Takımı, Çatal Kaşık & Bardak Setleri": 18.0,
            "Ev Tekstili (Nevresim, Yorgan, Yastık, Perde)": 18.0,
            "Mobilya (Çalışma Masası, Kitaplık, Sandalye)": 15.0,
            "Dekoratif Aydınlatma, Avize & Halı": 19.0,
            "Parfüm & Deodorant (EDP, EDT, Kolonya)": 16.0,
            "Cilt Bakım Serum, Krem & Güneş Kremi": 16.5,
            "Makyaj Ürünleri (Ruj, Fondöten, Maskara)": 17.0,
            "Saç Bakım & Şampuan": 16.0,
            "Tıraş Makinesi, Saç Kurutma & Düzleştirici": 13.0,
            "Bebek Bezi & Islak Mendil": 14.5,
            "Bebek Maması, Biberon & Emzik": 14.0,
            "Bebek Arabası & Oto Koltuğu": 14.0,
            "Oyuncak & Eğitici Çocuk Setleri": 17.0,
            "Fitness Aletleri, Dambıl & Ağırlık": 16.5,
            "Spor Giyim, Eşofman & Tayt": 20.0,
            "Kamp Çadırı, Termos & Doğa Sporları": 17.0,
            "Araç İçi Aksesuar, Paspas & Telefon Tutucu": 14.5,
            "Oto Bakım, Şampuan, Cila & Motor Yağları": 13.5,
            "Oto Lastik & Jant": 9.5,
            "Kahve Çekirdeği, Çay & İçecekler": 12.0,
            "Evcil Hayvan Maması (Kedi / Köpek) & Kum": 15.0,
            "Takviye Edici Gıda, Vitamin & Protein Tozu": 14.0,
            "Takı, Bijuteri, Kolye, Küpe & Yüzük": 23.0,
            "Kol Saati & Güneş Gözlüğü": 20.0,
            "Matkap, Vidalama & Elektrikli El Aletleri": 14.0,
            "Kitap, Roman & Eğitim Kitapları": 14.0,
            "Kırtasiye, Defter & Resim Malzemeleri": 16.0,
            "Diğer": 15.0,
        },
        "Hepsiburada": {
            "Kadın / Erkek Üst Giyim (Tişört, Gömlek, Kazak)": 22.0,
            "Kadın / Erkek Alt Giyim (Pantolon, Jean, Etek)": 22.0,
            "Elbise & Takım Elbise": 22.5,
            "Dış Giyim (Mont, Kaban, Trençkot)": 22.0,
            "İç Giyim, Pijama & Çorap": 23.5,
            "Spor Ayakkabı & Sneaker": 22.0,
            "Çanta, Sırt Çantası & Cüzdan": 22.5,
            "Telefon Kılıfı & Ekran Koruyucu": 20.0,
            "Şarj Cihazı, Kablo & Powerbank": 15.0,
            "Bluetooth Kulaklık & Hoparlör": 11.0,
            "Akıllı Saat & Bileklik": 11.5,
            "Kahve & Çay Makineleri": 13.0,
            "Blender, Mikser & Tost Makinesi": 13.0,
            "Airfryer (Sıcak Hava Fritözü)": 13.0,
            "Robot Süpürge & Dikey Süpürgeler": 12.5,
            "Tencere, Tava & Pişirme Setleri": 18.5,
            "Yemek Takımı, Bardak & Sofra": 18.5,
            "Ev Tekstili (Nevresim, Yorgan, Yastık)": 18.5,
            "Parfüm & Deodorant": 17.0,
            "Cilt Bakım Serum & Nemlendirici": 17.0,
            "Makyaj Ürünleri (Ruj, Fondöten, Maskara)": 17.5,
            "Bebek Bezi & Islak Mendil": 14.0,
            "Kedi / Köpek Maması & Petshop": 15.5,
            "Takviye Edici Gıda & Vitamin": 14.5,
            "Diğer": 15.0,
        },
        "N11": {
            "Kadın / Erkek Giyim & Dış Giyim": 20.5,
            "Ayakkabı, Sneaker & Çanta": 21.0,
            "Telefon Kılıfları & Ekran Koruyucular": 17.5,
            "Kulaklık & Ses Sistemleri": 11.0,
            "Küçük Ev Aletleri & Kahve Makineleri": 14.0,
            "Robot Süpürgeler & Dikey Süpürge": 13.0,
            "Tencere, Tava & Sofra Eşyaları": 17.5,
            "Ev Tekstili (Nevresim, Yastık, Yorgan)": 17.5,
            "Parfüm, Cilt Bakımı & Makyaj": 16.5,
            "Bebek Bezi & Bebek Bakımı": 14.5,
            "Kedi / Köpek Maması & Petshop": 15.0,
            "Spor, Fitness & Outdoor Ekipmanları": 16.0,
            "Diğer": 15.0,
        },
        "Amazon TR": {
            "Kadın / Erkek Giyim (Tişört, Pantolon, Elbise)": 15.0,
            "Ayakkabı, Spor Ayakkabı & Çantalar": 15.0,
            "Telefon Kılıfları, Şarj Aletleri & Aksesuar": 15.0,
            "Kulaklık, Hoparlör & Ses Cihazları": 10.0,
            "Bilgisayar, Laptop & Çevre Birimleri (Klavye, Mouse)": 7.5,
            "Küçük Mutfak Aletleri (Kahve Makinesi, Blender, Airfryer)": 10.5,
            "Robot Süpürgeler & Elektrikli Süpürge": 10.0,
            "Tencere, Tava & Sofra Gereçleri": 15.0,
            "Ev Tekstili, Yatak & Banyo": 15.0,
            "Kozmetik, Parfüm & Cilt Bakımı": 12.0,
            "Bebek Ürünleri, Bez & Mama": 11.0,
            "Spor, Fitness & Kamp Malzemeleri": 13.0,
            "Evcil Hayvan Ürünleri & Mama": 12.0,
            "Kitap & Basılı Eserler": 10.0,
            "Diğer": 12.0,
        },
    }

    # Kategori Tahmini ve Desi Veritabanı
    CATEGORY_DESI_AND_KEYWORDS = [
        # (Keywords, Category Name, Department, Default Desi)
        (["kahve makinesi", "espresso", "türk kahvesi", "çay makinesi", "filtre kahve"], "Kahve & Çay Makineleri (Espresso, Filtre, Türk Kahvesi)", "☕ Küçük Ev Aletleri", 4.0),
        (["airfryer", "fritöz", "hava fritözü"], "Airfryer (Sıcak Hava Fritözü) & Pişiriciler", "☕ Küçük Ev Aletleri", 6.0),
        (["robot süpürge", "dikey süpürge", "süpürge"], "Robot Süpürge, Dikey & Toz Torbalı Süpürgeler", "☕ Küçük Ev Aletleri", 7.0),
        (["blender", "mikser", "tost makinesi", "rondo", "mutfak robotu"], "Blender, Mikser, Mutfak Robotu & Tost Makinesi", "☕ Küçük Ev Aletleri", 3.5),
        (["kılıf", "ekran koruyucu", "kırılmaz cam", "lens"], "Telefon Kılıfı, Cam & Ekran Koruyucu", "📱 Elektronik & Telefon", 0.5),
        (["şarj", "kablo", "powerbank", "adaptör", "type-c", "lightning"], "Şarj Cihazı, Data Kablosu & Powerbank", "📱 Elektronik & Telefon", 1.0),
        (["kulaklık", "hoparlör", "bluetooth kulaklık", "tws", "soundbar"], "Bluetooth Kulaklık & Kablosuz Hoparlör", "📱 Elektronik & Telefon", 1.0),
        (["akıllı saat", "smart watch", "bileklik"], "Akıllı Saat & Akıllı Bileklik", "📱 Elektronik & Telefon", 0.5),
        (["spor ayakkabı", "sneaker", "krampon", "koşu"], "Spor Ayakkabı & Sneaker", "👟 Ayakkabı & Çanta", 2.0),
        (["ayakkabı", "babet", "topuklu", "terlik", "sandalet"], "Klasik & Günlük Ayakkabı (Topuklu, Babet, Terlik)", "👟 Ayakkabı & Çanta", 2.0),
        (["bot", "çizme"], "Bot & Çizme", "👟 Ayakkabı & Çanta", 3.5),
        (["çanta", "sırt çantası", "cüzdan", "kartlık", "valiz"], "Çanta, Sırt Çantası & Cüzdan", "👟 Ayakkabı & Çanta", 1.5),
        (["tişört", "t-shirt", "gömlek", "kazak", "sweatshirt", "bluz"], "Kadın / Erkek Üst Giyim (Tişört, Gömlek, Kazak)", "👗 Moda & Giyim", 1.0),
        (["pantolon", "jean", "etek", "şort", "tayt", "eşofman"], "Kadın / Erkek Alt Giyim (Pantolon, Jean, Etek)", "👗 Moda & Giyim", 1.5),
        (["elbise", "abiye", "takım elbise", "tulum"], "Elbise, Takım Elbise & Abiye", "👗 Moda & Giyim", 1.5),
        (["mont", "kaban", "trençkot", "palto", "yelek"], "Dış Giyim (Mont, Kaban, Trençkot, Yelek)", "👗 Moda & Giyim", 3.0),
        (["parfüm", "deodorant", "kolonya", "vücut spreyi"], "Parfüm & Deodorant (EDP, EDT, Kolonya)", "💄 Kozmetik & Bakım", 0.8),
        (["serum", "krem", "nemlendirici", "güneş kremi", "tonik"], "Cilt Bakım Serum, Krem & Güneş Kremi", "💄 Kozmetik & Bakım", 0.5),
        (["ruj", "fondöten", "maskara", "far", "kapatıcı"], "Makyaj Ürünleri (Ruj, Fondöten, Maskara)", "💄 Kozmetik & Bakım", 0.5),
        (["bebek bezi", "ıslak mendil"], "Bebek Bezi & Islak Mendil", "👶 Anne & Bebek", 4.0),
        (["tencere", "tava", "düdüklü", "sahan"], "Tencere, Tava & Pişirme Setleri (Granit, Döküm, Çelik)", "🍳 Ev, Yaşam & Mutfak", 5.0),
        (["nevresim", "yorgan", "yastık", "battaniye", "çarşaf"], "Ev Tekstili (Nevresim, Yorgan, Yastık, Perde)", "🍳 Ev, Yaşam & Mutfak", 3.5),
        (["kedi maması", "köpek maması", "kedi kumu"], "Evcil Hayvan Maması (Kedi / Köpek) & Kum", "🛒 Süpermarket & Petshop", 6.0),
        (["kolajen", "protein tozu", "vitamin", "omega 3"], "Takviye Edici Gıda, Vitamin & Protein Tozu", "🛒 Süpermarket & Petshop", 1.0),
    ]

    # Pazaryeri Sipariş/İşlem Hizmet Bedeli (₺)
    SERVICE_FEES: Dict[str, float] = {
        "Trendyol": 6.99,
        "Hepsiburada": 6.50,
        "N11": 5.00,
        "Amazon TR": 0.00,  # Amazon referral bazlı çalışır
    }

    @classmethod
    def get_dynamic_shipping(cls, marketplace: str, selling_price: float, desi: float = 1.0) -> tuple[float, str]:
        """
        Pazaryerlerinin resmi fiyat baremlerine ve desi katsayısına göre dinamik kargo maliyeti
        """
        m = marketplace if marketplace in cls.MARKETPLACE_COMMISSIONS else "Trendyol"

        if m == "Trendyol":
            if selling_price < 150.0:
                cost = 29.90
                desc = "150 ₺ Altı Barem Altı Kargo (Trendyol Express)"
            elif selling_price < 300.0:
                cost = 44.90
                desc = "150 - 300 ₺ Arası Standart Barem (1 Desi)"
            else:
                if desi <= 1.0:
                    cost = 49.90
                    desc = "300 ₺ Üzeri Barem Üstü Kargo (0-1 Desi)"
                elif desi <= 3.0:
                    cost = 62.90
                    desc = "300 ₺ Üzeri Barem Üstü Kargo (2-3 Desi)"
                elif desi <= 5.0:
                    cost = 78.90
                    desc = "300 ₺ Üzeri Barem Üstü Kargo (4-5 Desi)"
                else:
                    cost = 78.90 + (desi - 5.0) * 8.50
                    desc = f"300 ₺ Üzeri Büyük Hacim ({desi:.1f} Desi)"

        elif m == "Hepsiburada":
            if selling_price < 150.0:
                cost = 32.50
                desc = "150 ₺ Altı HepsiJet Barem Altı"
            elif selling_price < 300.0:
                cost = 47.50
                desc = "150 - 300 ₺ Standart HepsiJet Baremi"
            else:
                cost = 54.90 if desi <= 2.0 else 54.90 + (desi - 2.0) * 8.0
                desc = f"300 ₺ Üzeri HepsiJet Desi Baremi ({desi:.1f} Desi)"

        elif m == "N11":
            if selling_price < 150.0:
                cost = 30.00
                desc = "150 ₺ Altı N11 Barem Altı Kargo"
            elif selling_price < 300.0:
                cost = 46.00
                desc = "150 - 300 ₺ N11 Standart Baremi"
            else:
                cost = 52.00 if desi <= 2.0 else 52.00 + (desi - 2.0) * 8.0
                desc = f"300 ₺ Üzeri N11 Kargo Baremi ({desi:.1f} Desi)"

        else:  # Amazon TR
            if selling_price < 150.0:
                cost = 28.50
                desc = "150 ₺ Altı Amazon Kolay Gönderi"
            elif selling_price < 300.0:
                cost = 43.50
                desc = "150 - 300 ₺ Amazon Kolay Gönderi Baremi"
            else:
                cost = 49.90 if desi <= 2.0 else 49.90 + (desi - 2.0) * 7.5
                desc = f"300 ₺ Üzeri Kolay Gönderi ({desi:.1f} Desi)"

        return round(cost, 2), desc

    @classmethod
    def calculate_profit(cls, req: ProfitCalculationRequest) -> ProfitCalculationResponse:
        m_name = req.marketplace if req.marketplace in cls.MARKETPLACE_COMMISSIONS else "Trendyol"
        cat_map = cls.MARKETPLACE_COMMISSIONS[m_name]

        # 1. Komisyon Oranı Belirleme
        if req.custom_commission_rate is not None:
            comm_rate = float(req.custom_commission_rate)
        else:
            comm_rate = cat_map.get(req.category, 15.0)

        # 2. Pazaryeri Komisyon Tutarı (KDV Dahil Satış Fiyatı üzerinden kesilir)
        commission_amount = round(req.selling_price * (comm_rate / 100.0), 2)

        # Amazon TR minimum referral komisyon kuralı (En az 2.50 TL)
        if m_name == "Amazon TR" and commission_amount < 2.50:
            commission_amount = 2.50

        # 3. Pazaryeri Sipariş / İşlem Hizmet Bedeli
        service_fee = cls.SERVICE_FEES.get(m_name, 0.0)

        # 4. Kargo Maliyeti ve Barem Açıklaması
        if req.is_auto_shipping:
            shipping_cost, shipping_tier_desc = cls.get_dynamic_shipping(
                m_name, req.selling_price, req.desi
            )
        else:
            shipping_cost = round(float(req.shipping_cost or 0.0), 2)
            shipping_tier_desc = "Özel Satıcı Kargo Anlaşması (Sabit)"

        # 5. Stopaj Kesintisi (%1 E-ticaret Tevkifatı)
        # Gelir İdaresi Başkanlığı mevzuatına göre pazaryerleri ciro üzerinden %1 stopaj keser
        withholding_tax_amount = round(req.selling_price * (req.withholding_tax_rate / 100.0), 2)

        # 6. KDV Hesabı & Mahsuplaşma:
        # Satış Faturasındaki KDV = Satış Fiyatı - (Satış Fiyatı / (1 + vat_rate/100))
        sales_vat = req.selling_price - (req.selling_price / (1.0 + req.vat_rate / 100.0))
        cost_vat = req.cost_price - (req.cost_price / (1.0 + req.cost_vat_rate / 100.0))
        
        # Pazaryeri komisyon ve kargo faturalarındaki KDV indirim hakkı (%20 KDV)
        marketplace_expenses_vat = (commission_amount + shipping_cost + service_fee) - (
            (commission_amount + shipping_cost + service_fee) / 1.20
        )
        
        # Devlete Gerçek Ödenecek Net KDV (Mahsup Sonrası)
        net_vat_payable = round(max(0.0, sales_vat - cost_vat - marketplace_expenses_vat), 2)
        sales_vat = round(sales_vat, 2)
        cost_vat = round(cost_vat, 2)

        # 7. İade Oranı & Çift Kargo Amortisman Payı (NeSatılır / Emperator Özelliği)
        # İade edilen ürünlerde gidiş-dönüş çift kargo satıcıya fatura edilir
        return_risk_cost = round((req.return_rate_pct / 100.0) * (shipping_cost * 1.8), 2)

        # 8. Toplam Maliyet
        total_cost = round(
            req.cost_price
            + commission_amount
            + service_fee
            + shipping_cost
            + req.extra_cost
            + withholding_tax_amount
            + return_risk_cost,
            2,
        )

        # 9. Net Kâr = Satış Fiyatı - Toplam Maliyet (ve net KDV yükü)
        net_profit = round(req.selling_price - total_cost - net_vat_payable, 2)

        # 10. Kâr Marjı (%) ve ROI (%)
        profit_margin_pct = round((net_profit / req.selling_price) * 100.0, 2) if req.selling_price > 0 else 0.0
        roi_pct = round((net_profit / req.cost_price) * 100.0, 2) if req.cost_price > 0 else 0.0

        # 11. Başa Baş Fiyatı (Break-even): Net kârın tam 0 TL olduğu satış fiyatı
        # Fiyat * (1 - comm_rate/100 - withholding/100) = cost_price + shipping + extra + service
        variable_deduction = (comm_rate / 100.0) + (req.withholding_tax_rate / 100.0)
        rate_multiplier = 1.0 - variable_deduction
        break_even_price = round(
            (req.cost_price + shipping_cost + req.extra_cost + service_fee) / rate_multiplier,
            2,
        ) if rate_multiplier > 0 else req.selling_price

        # 12. Tersine Hedef Kâr Satış Fiyatları
        # Örn: %15 kâr marjı veya %25 kâr marjı için önerilen fiyatlar
        target_prices = {}
        for target_margin in [10.0, 15.0, 20.0, 25.0, 30.0]:
            denom = 1.0 - variable_deduction - (target_margin / 100.0)
            if denom > 0:
                t_price = round((req.cost_price + shipping_cost + req.extra_cost + service_fee) / denom, 2)
                target_prices[f"%{int(target_margin)} Kâr"] = t_price

        # 13. Masraf Dağılım Çizelgesi (Recharts Pasta / Bar Grafiği için)
        cost_breakdown = {
            "Ürün Alış Maliyeti": req.cost_price,
            "Pazaryeri Komisyonu": commission_amount,
            "Kargo & Lojistik": shipping_cost,
            "İşlem & Hizmet Bedeli": service_fee,
            "Ek Gider & Paketleme": req.extra_cost,
            "Stopaj & Net KDV": round(withholding_tax_amount + net_vat_payable, 2),
            "İade Risk Maliyeti": return_risk_cost,
            "Net Kâr": max(0.0, net_profit),
        }

        # Tavsiye / Analiz Notu
        if net_profit <= 0:
            recommendation = f"{m_name} satışında zarar tespit edildi! Ürün alış maliyetini düşürün veya satış fiyatını en az ₺{break_even_price:.2f} seviyesine çekin."
        elif profit_margin_pct >= 25.0:
            recommendation = f"Mükemmel Kârlılık! %{profit_margin_pct:.1f} net kâr marjı ve ₺{net_profit:.2f} birim kazanç ile reklam bütçesi ve ölçeklenme için son derece elverişli."
        elif profit_margin_pct >= 12.0:
            recommendation = f"Sağlıklı Ticaret. %{profit_margin_pct:.1f} kâr marjı e-ticaret ortalamalarında dengeli ve sürdürülebilir bir operasyon sağlıyor."
        else:
            recommendation = f"Düşük Marj Riskli! %{profit_margin_pct:.1f} kâr marjı iade dalgalanmalarında zarara yol açabilir. Ek masrafları veya kargo desi baremini optimize edin."

        return ProfitCalculationResponse(
            marketplace=m_name,
            selling_price=req.selling_price,
            cost_price=req.cost_price,
            commission_rate=comm_rate,
            commission_amount=commission_amount,
            service_fee=service_fee,
            shipping_cost=shipping_cost,
            shipping_tier_desc=shipping_tier_desc,
            extra_cost=req.extra_cost,
            vat_amount=sales_vat,
            cost_vat_amount=cost_vat,
            net_vat_payable=net_vat_payable,
            withholding_tax_amount=withholding_tax_amount,
            return_risk_cost=return_risk_cost,
            total_cost=total_cost,
            net_profit=net_profit,
            profit_margin_pct=profit_margin_pct,
            profit_margin=profit_margin_pct,
            roi_pct=roi_pct,
            roi=roi_pct,
            break_even_price=break_even_price,
            breakeven_price=break_even_price,
            target_prices=target_prices,
            cost_breakdown=cost_breakdown,
            recommendation=recommendation,
        )

    @classmethod
    def match_category_and_desi(cls, text: str, marketplace: str) -> Tuple[str, str, float, float]:
        """
        Ürün başlığındaki anahtar kelimelere göre en uygun resmi kategoriyi,
        departmanı, komisyon oranını ve tahmini desiyi eşleştirir.
        """
        clean = text.lower().strip()
        m_comm = cls.MARKETPLACE_COMMISSIONS.get(marketplace, cls.MARKETPLACE_COMMISSIONS["Trendyol"])

        best_cat = list(m_comm.keys())[0]
        best_dept = "Genel Ürünler"
        best_desi = 1.0
        highest_score = 0

        for keywords, cat_name, dept, desi in cls.CATEGORY_DESI_AND_KEYWORDS:
            score = 0
            for kw in keywords:
                if kw in clean:
                    score += 10
            if score > highest_score:
                highest_score = score
                # Pazaryerinde bu kategori veya benzeri var mı kontrol et
                if cat_name in m_comm:
                    best_cat = cat_name
                else:
                    # En yakın eşleşeni bul
                    for avail in m_comm.keys():
                        if any(w in avail.lower() for w in keywords):
                            best_cat = avail
                            break
                    else:
                        best_cat = cat_name if cat_name in m_comm else list(m_comm.keys())[0]

                best_dept = dept
                best_desi = desi

        rate = m_comm.get(best_cat, 15.0)
        return best_cat, best_dept, rate, best_desi

    @classmethod
    async def analyze_product_link(cls, url: str) -> LinkAnalysisResponse:
        """
        Kullanıcının girdiği ürün linkini (Trendyol, Hepsiburada, Amazon TR, N11)
        asenkron olarak çözümler; başlık, güncel fiyat, görsel, komisyon kategorisi ve desi çıkarır.
        """
        clean_url = url.strip()
        lower_url = clean_url.lower()

        # 1. Pazaryeri Tespiti
        marketplace = "Trendyol"
        if "trendyol.com" in lower_url or "ty.gl" in lower_url:
            marketplace = "Trendyol"
        elif "hepsiburada.com" in lower_url:
            marketplace = "Hepsiburada"
        elif "amazon.com.tr" in lower_url or "amazon.tr" in lower_url:
            marketplace = "Amazon TR"
        elif "n11.com" in lower_url:
            marketplace = "N11"

        title = ""
        price = 0.0
        image_url = None

        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            ),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
        }

        # 2. Canlı Sayfa HTML Kazıma
        try:
            async with httpx.AsyncClient(timeout=7.0, follow_redirects=True, headers=headers) as client:
                resp = await client.get(clean_url)
                if resp.status_code == 200:
                    html = resp.text

                    # Başlık (og:title veya <title>)
                    title_match = re.search(r'<meta\s+property=["\']og:title["\']\s+content=["\']([^"\']+)["\']', html, re.IGNORECASE)
                    if not title_match:
                        title_match = re.search(r'<title[^>]*>([^<]+)</title>', html, re.IGNORECASE)
                    if title_match:
                        raw_title = title_match.group(1).strip()
                        title = re.sub(r"\s*[-|–]\s*(Trendyol|Hepsiburada|Amazon|N11).*", "", raw_title, flags=re.IGNORECASE).strip()

                    # Görsel (og:image)
                    img_match = re.search(r'<meta\s+property=["\']og:image["\']\s+content=["\']([^"\']+)["\']', html, re.IGNORECASE)
                    if img_match:
                        image_url = img_match.group(1).strip()

                    # Fiyat (JSON-LD, og:price veya metin)
                    price_match = re.search(r'["\'](?:price|lowPrice)["\']\s*:\s*["\']?([\d\.]+)["\']?', html)
                    if price_match:
                        try:
                            price = float(price_match.group(1))
                        except ValueError:
                            pass

                    if price <= 0:
                        meta_price = re.search(r'<meta\s+property=["\'](?:product:price:amount|og:price:amount)["\']\s+content=["\']([^"\']+)["\']', html, re.IGNORECASE)
                        if meta_price:
                            try:
                                price = float(meta_price.group(1).replace(",", ".").replace(" ", ""))
                            except ValueError:
                                pass

                    if price <= 0:
                        tl_match = re.search(r'(\d{1,5}(?:[.,]\d{2})?)\s*(?:TL|₺)', html, re.IGNORECASE)
                        if tl_match:
                            try:
                                clean_p = tl_match.group(1).replace(".", "").replace(",", ".")
                                price = float(clean_p)
                            except ValueError:
                                pass
        except Exception as e:
            logger.warning(f"Ürün linki çekilirken hata oluştu ({clean_url}): {e}. URL slug fallback devrede.")

        # 3. Fallback: URL Slug'ından Ürün Adı & Kategori Çıkarımı
        if not title or len(title) < 4:
            parsed_path = unquote(urlparse(clean_url).path)
            parts = [p for p in parsed_path.split("/") if p and not p.isdigit()]
            if parts:
                last_part = parts[-1]
                last_part = re.sub(r"-p-\d+.*|-d-\d+.*|\.html", "", last_part, flags=re.IGNORECASE)
                words = [w.capitalize() for w in last_part.replace("-", " ").split() if w]
                title = " ".join(words)

        if not title:
            title = f"{marketplace} Fırsat Ürünü"

        # 4. Akıllı Kategori & Desi Eşleştirmesi
        cat_name, department, comm_rate, est_desi = cls.match_category_and_desi(title, marketplace)

        return LinkAnalysisResponse(
            marketplace=marketplace,
            title=title,
            selling_price=price if price > 0 else 499.0,
            image_url=image_url,
            category=cat_name,
            department=department,
            commission_rate=comm_rate,
            estimated_desi=est_desi,
            url=clean_url,
        )

