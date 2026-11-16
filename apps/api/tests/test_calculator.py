import pytest
from app.services.calculator_service import CalculatorService
from app.schemas.calculator import LinkAnalysisRequest, ProfitCalculationRequest

@pytest.mark.asyncio
async def test_match_category_and_desi():
    # Moda testi
    cat, desi = CalculatorService.match_category_and_desi("Kadın Oversize Pamuklu Tişört", "Trendyol")
    assert "Tişört" in cat or "Giyim" in cat
    assert desi >= 0.5

    # Elektronik testi
    cat_el, desi_el = CalculatorService.match_category_and_desi("Kablosuz Bluetooth Kulaklık", "Hepsiburada")
    assert "Kulaklık" in cat_el or "Aksesuar" in cat_el or "Elektronik" in cat_el
    assert desi_el >= 0.5

    # Mutfak / Kahve makinesi testi
    cat_kf, desi_kf = CalculatorService.match_category_and_desi("Otomatik Espresso Kahve Makinesi", "Trendyol")
    assert "Kahve" in cat_kf or "Aletleri" in cat_kf
    assert desi_kf >= 2.0

@pytest.mark.asyncio
async def test_analyze_product_link_fallback():
    # URL slug'ından veri çıkarımı testi
    url = "https://www.trendyol.com/marka/kadin-siyah-deri-spor-ayakkabi-p-12345678"
    result = await CalculatorService.analyze_product_link(url)
    
    assert result.marketplace == "Trendyol"
    assert "Ayakkabi" in result.title or "ayakkabi" in result.title.lower() or "Spor" in result.title
    assert result.selling_price > 0
    assert result.cost_estimate > 0
    assert result.matched_category != ""

@pytest.mark.asyncio
async def test_profit_calculation_logic():
    req = ProfitCalculationRequest(
        marketplace="Trendyol",
        selling_price=1000.0,
        cost_price=400.0,
        category="Kadın / Erkek Üst Giyim (Tişört, Gömlek, Kazak)",
        custom_commission_rate=21.0,
        desi=1.0,
        extra_cost=10.0,
        vat_rate=20.0,
        cost_vat_rate=20.0,
        withholding_tax_rate=1.0,
        return_rate_pct=3.0,
    )
    result = CalculatorService.calculate_profit(req)

    assert result.commission_rate == 21.0
    assert result.commission_amount == 210.0
    assert result.net_profit > 0
    assert result.break_even_price > 0
    assert result.roi_pct > 0
