"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  DollarSign,
  Calculator,
  Percent,
  Truck,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  CheckCircle,
  Copy,
  Check,
  Building2,
  PieChart as PieChartIcon,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Info,
  Sparkles,
  Layers,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation } from "@/i18n/useTranslation";
import {
  MARKETPLACE_CATEGORIES,
  MarketplaceCategory,
  MarketplaceType,
} from "@/data/marketplaceCategories";
import { apiUrl } from "@/lib/api";

export default function ProfitsView() {
  const { t, lang } = useTranslation();

  // Pazaryeri ve Maliyet Parametreleri
  const [marketplace, setMarketplace] = useState<MarketplaceType>("Trendyol");
  const [sellingPrice, setSellingPrice] = useState<number>(1250);
  const [costPrice, setCostPrice] = useState<number>(550);
  const [category, setCategory] = useState<string>("Sulu Boya");
  const [customRate, setCustomRate] = useState<string>("");
  const [isAutoShipping, setIsAutoShipping] = useState<boolean>(true);
  const [customShippingCost, setCustomShippingCost] = useState<number>(45.0);
  const [desi, setDesi] = useState<number>(1.0);
  const [extraCost, setExtraCost] = useState<number>(12.0);
  const [vatRate, setVatRate] = useState<number>(20.0);
  const [costVatRate, setCostVatRate] = useState<number>(20.0);
  const [withholdingTaxRate, setWithholdingTaxRate] = useState<number>(1.0);
  const [returnRate, setReturnRate] = useState<number>(3.5);

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

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

  // Pazaryeri Değiştiğinde Kategoriyi ve Oranı Senkronize Et
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

  const handleCalculate = async () => {
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
          vat_rate: Number(vatRate) || 20.0,
          cost_vat_rate: Number(costVatRate) || 20.0,
          withholding_tax_rate: Number(withholdingTaxRate) || 1.0,
          return_rate_pct: Number(returnRate) || 0,
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
  }, [
    marketplace,
    sellingPrice,
    costPrice,
    category,
    customRate,
    isAutoShipping,
    customShippingCost,
    desi,
    extraCost,
    vatRate,
    costVatRate,
    withholdingTaxRate,
    returnRate,
  ]);

  // Pasta Grafiği Verisi
  const chartData = useMemo(() => {
    if (!result || !result.cost_breakdown) return [];
    const colors = [
      "#64748b", // Alış Maliyeti
      "#f59e0b", // Komisyon
      "#0284c7", // Kargo
      "#6366f1", // Hizmet
      "#8b5cf6", // Ek Gider
      "#ec4899", // Stopaj & Net KDV
      "#f43f5e", // İade Riski
      "#10b981", // Net Kâr (Zümrüt Yeşili)
    ];
    return Object.entries(result.cost_breakdown).map(([name, val], idx) => ({
      name,
      value: Number(val),
      color: colors[idx % colors.length],
    }));
  }, [result]);

  const handleCopySummary = () => {
    if (!result) return;
    const summary = `📊 ÜRÜNBUL FİNANSAL NET KÂR RAPORU
-------------------------------------
Pazaryeri: ${result.marketplace}
Kategori: ${category} (${result.commission_rate}% Komisyon)
Satış Fiyatı: ₺${result.selling_price.toFixed(2)}
Alış Maliyeti: ₺${result.cost_price.toFixed(2)}
Pazaryeri Komisyonu: ₺${result.commission_amount.toFixed(2)}
Kargo Bedeli: ₺${result.shipping_cost.toFixed(2)} (${result.shipping_tier_desc})
Hizmet Bedeli: ₺${result.service_fee.toFixed(2)}
Stopaj (%1): ₺${result.withholding_tax_amount.toFixed(2)}
Net Ödenecek KDV: ₺${result.net_vat_payable.toFixed(2)}
Toplam Masraf: ₺${result.total_cost.toFixed(2)}
-------------------------------------
🏆 NET KÂR: ₺${result.net_profit.toFixed(2)}
📈 KÂR MARJI: %${result.profit_margin_pct.toFixed(1)} (ROI: %${result.roi_pct.toFixed(1)})
🎯 Başa Baş Fiyatı: ₺${result.break_even_price.toFixed(2)}
Tarih: ${new Date().toLocaleDateString("tr-TR")}
Hesaplayıcı: https://urunbul.app`;

    navigator.clipboard.writeText(summary);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* 1. Başlık & Pazaryeri Seçim Sekmeleri */}
      <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-xl font-black text-white tracking-wide">
                {t.calcTitle}
              </h1>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                NeSatılır & Emperator Standartlarında
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              {t.calcSubtitle}
            </p>
          </div>

          <button
            onClick={handleCopySummary}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700/80 shadow-xs shrink-0 self-start md:self-auto"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">{t.copied}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>{t.copySummary}</span>
              </>
            )}
          </button>
        </div>

        {/* 4 BÜYÜK DEV PAZARYERİ SEÇİCİ SEKMELERİ */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-slate-800/80">
          {(["Trendyol", "Hepsiburada", "N11", "Amazon TR"] as MarketplaceType[]).map((m) => {
            const isSelected = marketplace === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => handleMarketplaceChange(m)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  isSelected
                    ? "btn-emerald text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400/50"
                    : "bg-[#0b0f19] text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800"
                }`}
              >
                <span>
                  {m === "Trendyol" && "🇹🇷 Trendyol"}
                  {m === "Hepsiburada" && "🟠 Hepsiburada"}
                  {m === "N11" && "🟣 N11"}
                  {m === "Amazon TR" && "📦 Amazon TR"}
                </span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Ana Hesaplayıcı Izgarası: Sol Form - Sağ Sonuçlar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SOL: Parametre Giriş Formu (Yüksek Kontrast & Göz Yormayan Netlik) */}
        <div className="lg:col-span-5 bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>Girdi Parametreleri ({marketplace})</span>
            </h2>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-medium">
              2026 Baremleri
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Satış Fiyatı & Alış Fiyatı */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  {t.sellingPriceLabel}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-slate-700 rounded-xl text-white font-black text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  {t.costPriceLabel}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={costPrice}
                  onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-slate-700 rounded-xl text-white font-black text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-inner"
                />
              </div>
            </div>

            {/* Kategori ve Özel Komisyon (Pazaryerine Göre Gerçek Alt Kategoriler) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  {t.categoryLabel}
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setCustomRate("");
                  }}
                  className="w-full px-2.5 py-2 bg-[#0b0f19] border border-slate-700 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
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
                  {t.customRateLabel}
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder={`Standart: %${activeCategory?.rate ?? 15}`}
                  value={customRate}
                  onChange={(e) => setCustomRate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-slate-700 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                />
              </div>
            </div>

            {/* Gerçek Pazaryeri Kategori Hiyerarşisi & Komisyon Gösterge Kutusu */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
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

            {/* Kargo Modeli: Pazaryeri Baremi vs Özel Kargo */}
            <div className="p-3 bg-[#0b0f19] rounded-xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-blue-400" />
                  <span>{t.shippingModeLabel}</span>
                </span>
                <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setIsAutoShipping(true)}
                    className={`px-2 py-0.5 rounded ${
                      isAutoShipping
                        ? "bg-emerald-600 text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Barem
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAutoShipping(false)}
                    className={`px-2 py-0.5 rounded ${
                      !isAutoShipping
                        ? "bg-emerald-600 text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Özel
                  </button>
                </div>
              </div>

              {isAutoShipping ? (
                <div className="grid grid-cols-2 gap-2.5 items-center">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">
                      {t.desiLabel}
                    </label>
                    <select
                      value={desi}
                      onChange={(e) => setDesi(parseFloat(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-xs"
                    >
                      <option value="1">1 Desi (Küçük)</option>
                      <option value="2">2 Desi (Orta)</option>
                      <option value="3">3 Desi</option>
                      <option value="5">5 Desi (Büyük)</option>
                      <option value="10">10 Desi (Koli)</option>
                    </select>
                  </div>
                  <div className="text-[10px] text-emerald-400/90 leading-tight bg-emerald-950/40 p-2 rounded-lg border border-emerald-800/40">
                    Fiyata göre barem altı / üstü otomatik hesaplanır.
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">
                    Sabit Kargo Maliyetiniz (₺)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={customShippingCost}
                    onChange={(e) => setCustomShippingCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-xs"
                  />
                </div>
              )}
            </div>

            {/* İleri Düzey Vergi & İade Parametreleri */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">
                  Satış KDV %
                </label>
                <select
                  value={vatRate}
                  onChange={(e) => setVatRate(parseFloat(e.target.value))}
                  className="w-full px-2 py-1.5 bg-[#0b0f19] border border-slate-700 rounded-lg text-white font-bold text-xs"
                >
                  <option value="20">%20</option>
                  <option value="10">%10</option>
                  <option value="1">%1</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">
                  Alış KDV %
                </label>
                <select
                  value={costVatRate}
                  onChange={(e) => setCostVatRate(parseFloat(e.target.value))}
                  className="w-full px-2 py-1.5 bg-[#0b0f19] border border-slate-700 rounded-lg text-white font-bold text-xs"
                >
                  <option value="20">%20</option>
                  <option value="10">%10</option>
                  <option value="1">%1</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">
                  İade Oranı %
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={returnRate}
                  onChange={(e) => setReturnRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 bg-[#0b0f19] border border-slate-700 rounded-lg text-white font-bold text-xs"
                />
              </div>
            </div>

            {/* Ek Masraf & Stopaj Bilgisi */}
            <div className="grid grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">
                  {t.extraCostLabel}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={extraCost}
                  onChange={(e) => setExtraCost(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-[#0b0f19] border border-slate-700 rounded-lg text-white font-bold text-xs"
                />
              </div>

              <div className="pt-3">
                <div className="text-[10px] text-amber-300/90 bg-amber-950/30 border border-amber-800/40 p-2 rounded-lg flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>%1 E-ticaret peşin stopaj vergisi kesintisi dahildir.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ: Finansal Sonuç Kartları, Dağılım Çizelgesi & Analitik */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* 4 Ana Metrik Kartı */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 1. Pazaryeri Kesintisi */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {t.commissionCardTitle}
              </div>
              <div className="text-lg font-black text-amber-400 mt-1">
                ₺{Number(result?.commission_amount || 0).toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                %{result?.commission_rate || 0} + ₺{Number(result?.service_fee || 0).toFixed(2)} hiz.
              </div>
            </div>

            {/* 2. Kargo & Lojistik */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {t.shippingCardTitle}
              </div>
              <div className="text-lg font-black text-sky-400 mt-1">
                ₺{Number(result?.shipping_cost || 0).toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                {result?.shipping_tier_desc || "Barem kargo"}
              </div>
            </div>

            {/* 3. Net Kâr (Zümrüt Yeşili Vurgu) */}
            <div className={`border rounded-2xl p-4 shadow-md transition-all ${
              (result?.net_profit || 0) >= 0
                ? "bg-gradient-to-br from-emerald-950/70 to-[#0f172a] border-emerald-500/40 shadow-emerald-950/20"
                : "bg-gradient-to-br from-rose-950/70 to-[#0f172a] border-rose-500/40 shadow-rose-950/20"
            }`}>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
                {t.netProfitCardTitle}
              </div>
              <div className={`text-xl font-black mt-1 ${
                (result?.net_profit || 0) >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}>
                ₺{Number(result?.net_profit || 0).toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {(result?.net_profit || 0) >= 0 ? "Tüm giderler mahsup" : "Zarar!"}
              </div>
            </div>

            {/* 4. Marj & ROI */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {t.marginCardTitle}
              </div>
              <div className="text-lg font-black text-emerald-400 mt-1">
                %{Number(result?.profit_margin_pct || 0).toFixed(1)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                ROI: %{Number(result?.roi_pct || 0).toFixed(1)}
              </div>
            </div>
          </div>

          {/* Başa Baş Fiyatı ve Akıllı Tavsiye Kutusu */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-medium">
                  {t.breakEvenLabel}
                </div>
                <div className="text-base font-black text-white">
                  ₺{Number(result?.break_even_price || 0).toFixed(2)}
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-300 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800 max-w-md">
              <p className="line-clamp-2">{result?.recommendation}</p>
            </div>
          </div>

          {/* Tersine Hesaplayıcı: Hedef Kâra Göre Satış Fiyatı Önerileri (NeSatılır / Emperator Özelliği) */}
          {result?.target_prices && Object.keys(result.target_prices).length > 0 && (
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="text-xs font-bold text-white mb-2.5 flex items-center justify-between">
                <span>{t.targetProfitLabel}</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                  Otomatik Fiyatlandırma
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {Object.entries(result.target_prices).map(([targetName, price]: any) => (
                  <div
                    key={targetName}
                    className="p-2.5 rounded-xl bg-[#0b0f19] border border-slate-800 text-center hover:border-emerald-500/50 transition cursor-pointer"
                    onClick={() => setSellingPrice(price)}
                    title="Bu fiyatı satış fiyatı olarak ayarla"
                  >
                    <div className="text-[10px] font-bold text-slate-400">{targetName}</div>
                    <div className="text-xs font-extrabold text-emerald-400 mt-0.5">
                      ₺{price.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Masraf ve Kâr Dağılım Çizelgesi (Recharts Pie & Breakdown) */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-bold text-white mb-3 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-emerald-400" />
              <span>{t.costBreakdownTitle}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Pasta Grafiği */}
              <div className="md:col-span-5 h-44 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={65}
                      innerRadius={40}
                      paddingAngle={3}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(val: any) => `₺${Number(val).toFixed(2)}`}
                      contentStyle={{
                        backgroundColor: "#0b0f19",
                        borderColor: "#334155",
                        borderRadius: "8px",
                        fontSize: "11px",
                        color: "#fff",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Masraf Kalemleri Listesi */}
              <div className="md:col-span-7 grid grid-cols-2 gap-2 text-[11px]">
                {chartData.map((entry) => (
                  <div
                    key={entry.name}
                    className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-slate-400 truncate">{entry.name}</span>
                    </div>
                    <span className="font-bold text-slate-200 ml-1">
                      ₺{entry.value.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. REKLAM ALANI REZERVASYONU (Google AdSense Slot 728x90) */}
      <div className="w-full bg-[#0b0f19] border border-dashed border-slate-800 rounded-2xl p-4 text-center text-xs text-slate-500">
        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">
          Sponsorlu İçerik / Reklam Alanı (Google AdSense Rezervasyonu)
        </div>
        <div className="h-16 flex items-center justify-center text-slate-600 font-mono text-[11px]">
          [728x90 Banner Alanı – Organik e-Ticaret ve Entegratör Reklamları İçin Ayrılmıştır]
        </div>
      </div>

      {/* 4. SEO & GEO SEMANTİK İÇERİK MERKEZİ (Organik Arama ve Yapay Zeka Trafik Motoru) */}
      <section className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="max-w-3xl">
          <h2 className="text-lg font-black text-white">
            {t.seoTitle}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Türkiye'de faaliyet gösteren e-ticaret satıcıları için en doğru net kâr, pazaryeri komisyonları, kargo anlaşma baremleri ve yasal stopaj rehberi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-3">
          <div className="p-4 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-2">
            <h3 className="font-bold text-slate-200 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span>{t.seoGuide1Title}</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.seoGuide1Text}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-2">
            <h3 className="font-bold text-slate-200 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>{t.seoGuide2Title}</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.seoGuide2Text}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-2">
            <h3 className="font-bold text-slate-200 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>{t.seoGuide3Title}</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.seoGuide3Text}
            </p>
          </div>
        </div>

        {/* Sıkça Sorulan Sorular (FAQ - Schema.org GEO Uyumlu) */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>{t.faqTitle}</span>
          </h3>

          <div className="space-y-2.5">
            <div className="p-3.5 rounded-xl bg-[#0b0f19] border border-slate-800">
              <div className="font-bold text-xs text-slate-200">
                {t.faq1Q}
              </div>
              <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                {t.faq1A}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0b0f19] border border-slate-800">
              <div className="font-bold text-xs text-slate-200">
                {t.faq2Q}
              </div>
              <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                {t.faq2A}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
