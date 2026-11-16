from typing import Optional, Dict
from pydantic import BaseModel, Field


class ProfitCalculationRequest(BaseModel):
    marketplace: str = Field(default="Trendyol", description="Pazaryeri (Trendyol, Hepsiburada, N11, Amazon TR)")
    selling_price: float = Field(..., gt=0, description="Ürünün satış fiyatı (KDV dahil ₺)")
    cost_price: float = Field(..., ge=0, description="Ürünün alış / üretim maliyeti (₺)")
    category: str = Field(default="Küçük Ev Aletleri", description="Ürün kategorisi")
    custom_commission_rate: Optional[float] = Field(None, ge=0, le=100, description="Özel komisyon oranı (%)")
    shipping_cost: Optional[float] = Field(None, ge=0, description="Kullanıcı özel kargo maliyeti (₺)")
    is_auto_shipping: bool = Field(default=True, description="Pazaryeri baremine göre dinamik kargo hesaplansın mı?")
    desi: float = Field(default=1.0, ge=0, description="Kargo Desi hacmi")
    extra_cost: float = Field(default=10.0, ge=0, description="Paketleme vb. ek operasyonel maliyetler (₺)")
    vat_rate: float = Field(default=20.0, ge=0, le=100, description="Satış KDV oranı (%)")
    cost_vat_rate: float = Field(default=20.0, ge=0, le=100, description="Alış KDV oranı (%)")
    withholding_tax_rate: float = Field(default=1.0, ge=0, le=10, description="E-ticaret peşin stopaj tevkifat oranı (%)")
    return_rate_pct: float = Field(default=3.0, ge=0, le=100, description="Tahmini iade oranı (%)")


class ProfitCalculationResponse(BaseModel):
    marketplace: str
    selling_price: float
    cost_price: float
    commission_rate: float
    commission_amount: float
    service_fee: float
    shipping_cost: float
    shipping_tier_desc: str
    extra_cost: float
    vat_amount: float
    cost_vat_amount: float
    net_vat_payable: float
    withholding_tax_amount: float
    return_risk_cost: float
    total_cost: float
    net_profit: float
    profit_margin_pct: float
    profit_margin: Optional[float] = None
    roi_pct: float
    roi: Optional[float] = None
    break_even_price: float
    breakeven_price: Optional[float] = None
    target_prices: Dict[str, float] = Field(default_factory=dict)
    cost_breakdown: Dict[str, float] = Field(default_factory=dict)
    recommendation: str

