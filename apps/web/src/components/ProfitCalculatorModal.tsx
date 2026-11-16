"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Calculator,
  Percent,
  Truck,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  Layers,
} from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import {
  MARKETPLACE_CATEGORIES,
  MarketplaceCategory,
  MarketplaceType,
} from "@/data/marketplaceCategories";
import { apiUrl } from "@/lib/api";

interface ProfitCalculatorModalProps {
  initialPrice: number;
  productTitle: string;
  onClose: () => void;
}

export default function ProfitCalculatorModal({
  initialPrice,
  productTitle,
  onClose,
}: ProfitCalculatorModalProps) {
  const { t } = useTranslation();
  const [marketplace, setMarketplace] = useState<MarketplaceType>("Trendyol");
  const [sellingPrice, setSellingPrice] = useState<number>(initialPrice || 1000);
  const [costPrice, setCostPrice] = useState<number>(Math.round((initialPrice || 1000) * 0.45));
  const [category, setCategory] = useState<string>("Sulu Boya");
  const [customRate, setCustomRate] = useState<string>("");
  const [isAutoShipping, setIsAutoShipping] = useState<boolean>(true);
  const [customShippingCost, setCustomShippingCost] = useState<number>(45.0);
  const [desi, setDesi] = useState<number>(1.0);
  const [extraCost, setExtraCost] = useState<number>(10.0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Seçili Pazaryerine Özel Dinamik Kategori Listesi
  const currentCategories = useMemo(() => {
    return MARKETPLACE_CATEGORIES[marketplace] || MARKETPLACE_CATEGORIES.Trendyol;
  }, [marketplace]);

  // Seçili Kategorinin Hiyerarşik Bilgisi
  const activeCategory = useMemo(() => {
    return (
      currentCategories.find((c) => c.name === category) ||
      currentCategories[0]
    );
  }, [currentCategories, category]);

  // Pazaryeri Değiştiğinde Kategori ve Oranı Eşle
  const handleMarketplaceChange = (nextMarketplace: MarketplaceType) => {
    setMarketplace(nextMarketplace);
    const nextList = MARKETPLACE_CATEGORIES[nextMarketplace] || MARKETPLACE_CATEGORIES.Trendyol;
    const matched = nextList.find(
      (c) => c.name.toLowerCase() === category.toLowerCase()
    );
    if (matched) {
      setCategory(matched.name);
    } else {
      setCategory(nextList[0].name);
    }
    setCustomRate("");
  };

  const handleCalculate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const effectiveRate = customRate
        ? parseFloat(customRate)
        : activeCategory?.rate ?? 15.0;

      const res = await fetch(apiUrl("/api/v1/calculator/profit"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marketplace: marketplace,
          selling_price: Number(sellingPrice) || 1,
          cost_price: Number(costPrice) || 0,
          category: activeCategory?.name || category,
          custom_commission_rate: effectiveRate,
          shipping_cost: Number(customShippingCost) || 0,
          is_auto_shipping: isAutoShipping,
          desi: Number(desi) || 1.0,
          extra_cost: Number(extraCost) || 0,
          vat_rate: 20.0,
          cost_vat_rate: 20.0,
          withholding_tax_rate: 1.0,
          return_rate_pct: 3.0,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleCalculate();
  }, [marketplace, sellingPrice, costPrice, category, customRate, isAutoShipping, customShippingCost, desi, extraCost]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0f172a] rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-700 max-h-[90vh] overflow-y-auto text-slate-100">
        {/* Başlık */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">E-Ticaret Net Kâr & Komisyon Hesaplayıcı</h3>
              <p className="text-xs text-slate-400 line-clamp-1 max-w-sm">{productTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pazaryeri Seçimi Sekmeleri */}
        <div className="grid grid-cols-4 gap-1.5 my-3.5 bg-[#0b0f19] p-1 rounded-xl border border-slate-800">
          {(["Trendyol", "Hepsiburada", "N11", "Amazon TR"] as MarketplaceType[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleMarketplaceChange(m)}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                marketplace === m
                  ? "btn-emerald text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Girdi Formu (Yüksek Kontrast: Koyu Arka Planda Beyaz / Zümrüt Rakamlar) */}
        <form onSubmit={handleCalculate} className="my-4 grid grid-cols-2 gap-3.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Satış Fiyatı (KDV Dahil ₺)
            </label>
            <input
              type="number"
              step="0.01"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm font-black bg-[#0b0f19] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 shadow-inner"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Alış / İmalat Maliyeti (₺)
            </label>
            <input
              type="number"
              step="0.01"
              value={costPrice}
              onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm font-black bg-[#0b0f19] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 shadow-inner"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Kategori Komisyonu ({marketplace})
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setCustomRate("");
              }}
              className="w-full px-2.5 py-2 text-xs font-bold bg-[#0b0f19] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {currentCategories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} (%{c.rate})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Özel Komisyon % (İsteğe Bağlı)
            </label>
            <input
              type="number"
              placeholder={`Standart: %${activeCategory?.rate ?? 15}`}
              step="0.1"
              value={customRate}
              onChange={(e) => setCustomRate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold bg-[#0b0f19] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500"
            />
          </div>

          {/* Gerçek Pazaryeri Kategori Hiyerarşisi Göstergesi */}
          <div className="col-span-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>{marketplace} Kategori Yolu:</span>
              </span>
              <span className="font-extrabold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 text-[10px]">
                %{customRate ? customRate : activeCategory?.rate} Resmi Komisyon
              </span>
            </div>
            <div className="font-bold text-slate-200 text-xs truncate flex items-center gap-1">
              <span className="text-slate-400 font-normal">{activeCategory?.path}</span>
              <span className="text-slate-500">›</span>
              <span className="text-emerald-400 font-bold">{activeCategory?.name}</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Kargo Hacmi (Desi)
            </label>
            <select
              value={desi}
              onChange={(e) => setDesi(parseFloat(e.target.value))}
              className="w-full px-2.5 py-2 text-xs font-bold bg-[#0b0f19] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="1">1 Desi (Barem)</option>
              <option value="2">2 Desi</option>
              <option value="3">3 Desi</option>
              <option value="5">5 Desi</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Paketleme & Ek Gider (₺)
            </label>
            <input
              type="number"
              step="0.5"
              value={extraCost}
              onChange={(e) => setExtraCost(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-xs font-bold bg-[#0b0f19] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </form>

        {/* Sonuç Kartları (Yüksek Kontrast & Zümrüt Kâr) */}
        {result && (
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Pazaryeri Komisyonu</div>
                <div className="text-base font-black text-amber-400 mt-0.5">
                  ₺{Number(result.commission_amount || 0).toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-500">%{result.commission_rate || 0} oran</div>
              </div>

              <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Kargo Bedeli</div>
                <div className="text-base font-black text-sky-400 mt-0.5">
                  ₺{Number(result.shipping_cost || 0).toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-500 line-clamp-1">{result.shipping_tier_desc}</div>
              </div>

              <div className={`border rounded-xl p-3 ${
                (result.net_profit || 0) >= 0
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                  : "bg-rose-950/40 border-rose-500/40 text-rose-300"
              }`}>
                <div className="text-[10px] font-bold uppercase">Net Kâr (Adet Başı)</div>
                <div className={`text-base font-black mt-0.5 ${
                  (result.net_profit || 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}>
                  ₺{Number(result.net_profit || 0).toFixed(2)}
                </div>
                <div className="text-[10px] opacity-75">Stopaj & KDV sonrası</div>
              </div>

              <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Kâr Marjı / ROI</div>
                <div className="text-base font-black text-emerald-400 mt-0.5">
                  %{Number(result.profit_margin_pct || 0).toFixed(1)}
                </div>
                <div className="text-[10px] text-slate-500">ROI: %{Number(result.roi_pct || 0).toFixed(1)}</div>
              </div>
            </div>

            <div className="bg-[#0b0f19] rounded-xl p-3 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <span>Başa Baş Satış Fiyatı (0 Kâr Eşiği):</span>
              <span className="font-black text-white text-sm">₺{Number(result.break_even_price || 0).toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
