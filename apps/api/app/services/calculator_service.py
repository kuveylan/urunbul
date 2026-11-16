from typing import Dict, Any
from app.schemas.calculator import ProfitCalculationRequest, ProfitCalculationResponse


class CalculatorService:
    # 2026 Türkiye Pazaryerleri Resmi Kategori Komisyon Oranları Tablosu (%)
    MARKETPLACE_COMMISSIONS: Dict[str, Dict[str, float]] = {
        "Trendyol": {
            "Sulu Boya": 16.0,
            "Yağlı & Akrilik Boya": 16.0,
            "Defter & Kağıt Ürünleri": 16.0,
            "Küçük Mutfak Aletleri": 13.0,
            "Süpürge & Temizlik Cihazları": 13.0,
            "Bluetooth Kulaklık & Ses": 10.0,
            "Kadın / Erkek Üst Giyim": 21.0,
            "Spor Ayakkabı & Sneaker": 21.5,
            "Cilt Bakım & Serum": 16.0,
            "Parfüm & Deodorant": 16.0,
            "Bebek Bezi & Bakım": 15.0,
            "Oto Aksesuar & Paspas": 14.0,
            "Fitness & Kondisyon": 17.0,
            "Kahve & Sıcak İçecekler": 12.0,
            "Telefon Kılıfı & Ekran Koruyucu": 19.0,
            "Ev Tekstili & Nevresim": 18.0,
            "Takı & Bijuteri": 23.0,
            "Elektronik": 10.0,
            "Küçük Ev Aletleri": 13.0,
            "Giyim": 21.0,
            "Ayakkabı & Çanta": 21.5,
            "Ev & Yaşam": 18.0,
            "Kozmetik": 16.0,
            "Anne & Bebek": 15.0,
            "Spor & Outdoor": 17.0,
            "Otomotiv": 14.0,
            "Süpermarket": 12.0,
            "Kitap & Hobi": 15.0,
            "Diğer": 15.0,
        },
        "Hepsiburada": {
            "Sulu Boya": 17.0,
            "Defter & Bloknot": 17.0,
            "Küçük Mutfak Aletleri": 13.0,
            "Süpürgeler & Ütüler": 13.0,
            "Kulaklık & Hoparlör": 11.0,
            "Kadın / Erkek Giyim": 22.0,
            "Günlük & Spor Ayakkabı": 22.0,
            "Parfüm & Kozmetik": 17.0,
            "Bebek Bezi & Islak Mendil": 14.0,
            "Araç Bakım & Temizlik": 14.0,
            "Fitness & Kondisyon": 16.5,
            "Çay & Kahve & İçecek": 12.0,
            "Cep Telefonu Kılıfları": 20.0,
            "Ev Tekstili & Yatak": 18.5,
            "Takı & Saat": 22.5,
            "Elektronik": 9.5,
            "Küçük Ev Aletleri": 13.0,
            "Giyim": 22.0,
            "Ayakkabı & Çanta": 22.0,
            "Ev & Yaşam": 18.5,
            "Kozmetik": 17.0,
            "Anne & Bebek": 15.0,
            "Spor & Outdoor": 16.5,
            "Otomotiv": 14.0,
            "Süpermarket": 12.0,
            "Kitap & Hobi": 15.0,
            "Diğer": 15.5,
        },
        "N11": {
            "Sulu Boya & Resim Malzemesi": 16.5,
            "Defter & Okul Kırtasiye": 16.5,
            "Küçük Ev Aletleri": 14.0,
            "Kulaklık & Ses": 11.0,
            "Giyim & Moda": 20.5,
            "Ayakkabı & Çanta": 21.0,
            "Kozmetik & Kişisel Bakım": 16.5,
            "Anne & Bebek": 14.5,
            "Spor & Outdoor": 16.0,
            "Otomotiv & Motosiklet": 13.5,
            "Süpermarket": 12.5,
            "Ev & Yaşam / Dekorasyon": 17.5,
            "Telefon & Aksesuarları": 17.0,
            "Elektronik": 11.0,
            "Giyim": 20.5,
            "Ev & Yaşam": 17.5,
            "Kozmetik": 16.5,
            "Kitap & Hobi": 15.0,
            "Diğer": 15.0,
        },
        "Amazon TR": {
            "Sulu Boya & Sanat": 12.0,
            "Defter & Yazı Gereçleri": 12.0,
            "Tüketici Elektroniği & Kulaklık": 7.0,
            "Küçük Ev & Mutfak Aletleri": 10.5,
            "Giyim & Aksesuar": 15.0,
            "Ayakkabı & Çanta": 15.0,
            "Cilt Bakım & Güzellik": 12.0,
            "Bebek Ürünleri": 11.0,
            "Spor & Doğa": 13.0,
            "Otomotiv Aksesuar": 12.0,
            "Süpermarket & İçecek": 10.0,
            "Kitap & Hobi": 10.0,
            "Ev & Mutfak Gereçleri": 13.0,
            "Cep Telefonu Aksesuarı": 13.0,
            "Elektronik": 7.0,
            "Küçük Ev Aletleri": 10.5,
            "Giyim": 15.0,
            "Ev & Yaşam": 13.0,
            "Kozmetik": 12.0,
            "Anne & Bebek": 11.0,
            "Spor & Outdoor": 13.0,
            "Otomotiv": 12.0,
            "Süpermarket": 10.0,
            "Diğer": 12.0,
        },
    }

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
