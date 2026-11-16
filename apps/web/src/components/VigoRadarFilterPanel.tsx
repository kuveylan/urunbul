import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  Filter,
  RotateCcw,
  Bookmark,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  ShieldCheck,
  Award,
  Zap,
  Truck,
  Tag,
  Star,
  DollarSign,
  Package,
  Layers,
  X,
} from "lucide-react";
import { safeLocalStorage } from "@/lib/safariFixes";

export interface VigoRadarFilterCriteria {
  // 1. Satış & Performans
  minSales: string;
  maxSales: string;
  minPrice: string;
  maxPrice: string;
  minRevenue: string;
  maxRevenue: string;
  minOpportunity: string;
  maxOpportunity: string;
  minSalesReviewRatio: string;
  maxSalesReviewRatio: string;

  // 2. Ürün & Yorumlar
  minReviews: string;
  maxReviews: string;
  minRating: string;
  maxRating: string;
  minInCart: string;
  maxInCart: string;
  badges: string[]; // "best_seller", "flash_deal", "fast_delivery"

  // 3. Rekabet & Marka
  minSellers: string;
  maxSellers: string;
  hasDiscountOnly: boolean;
  includeBrands: string;
  excludeBrands: string;
  includeKeywords: string;
  excludeKeywords: string;
  keywordMatchMode: "any" | "all";

  // 4. Lojistik & Detaylar
  minShippingCost: string;
  maxShippingCost: string;
  minDesi: string;
  maxDesi: string;
  shippingMethod: "all" | "marketplace" | "merchant";
}

export const INITIAL_VIGO_FILTERS: VigoRadarFilterCriteria = {
  minSales: "",
  maxSales: "",
  minPrice: "",
  maxPrice: "",
  minRevenue: "",
  maxRevenue: "",
  minOpportunity: "",
  maxOpportunity: "",
  minSalesReviewRatio: "",
  maxSalesReviewRatio: "",

  minReviews: "",
  maxReviews: "",
  minRating: "0",
  maxRating: "5",
  minInCart: "",
  maxInCart: "",
  badges: [],

  minSellers: "",
  maxSellers: "",
  hasDiscountOnly: false,
  includeBrands: "",
  excludeBrands: "",
  includeKeywords: "",
  excludeKeywords: "",
  keywordMatchMode: "any",

  minShippingCost: "",
  maxShippingCost: "",
  minDesi: "",
  maxDesi: "",
  shippingMethod: "all",
};

export interface SavedFilterPreset {
  id: string;
  name: string;
  createdAt: string;
  criteria: VigoRadarFilterCriteria;
}

interface VigoRadarFilterPanelProps {
  onApplyFilters: (criteria: VigoRadarFilterCriteria) => void;
  onResetFilters: () => void;
  activeCount: number;
}

export default function VigoRadarFilterPanel({
  onApplyFilters,
  onResetFilters,
  activeCount,
}: VigoRadarFilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "sales" | "reviews" | "competition" | "logistics"
  >("sales");

  // Form State
  const [filters, setFilters] = useState<VigoRadarFilterCriteria>(INITIAL_VIGO_FILTERS);

  // Filtre Kitaplığı State
  const [savedPresets, setSavedPresets] = useState<SavedFilterPreset[]>([]);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Kayıtlı filtreleri yükle
  useEffect(() => {
    try {
      const stored = safeLocalStorage.getItem("urunbul_saved_filters");
      if (stored) {
        setSavedPresets(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Filtre kitaplığı yüklenemedi:", e);
    }
  }, []);

  const savePresetToStorage = (updated: SavedFilterPreset[]) => {
    setSavedPresets(updated);
    try {
      safeLocalStorage.setItem("urunbul_saved_filters", JSON.stringify(updated));
    } catch (e) {
      console.warn("Filtre kaydedilemedi:", e);
    }
  };

  // 1. DataVigo Hızlı Başlangıç Şablonları (Presets)
  const applyQuickPreset = (presetKey: string) => {
    let preset: VigoRadarFilterCriteria = { ...INITIAL_VIGO_FILTERS };

    switch (presetKey) {
      case "newbie": // Yeni Başlayanlar: 150₺ - 1500₺, Min 50 Satış, Max 200 Yorum, Fırsat 70+
        preset = {
          ...preset,
          minPrice: "150",
          maxPrice: "1500",
          minSales: "50",
          maxReviews: "200",
          minOpportunity: "70",
        };
        break;
      case "high_demand": // Yüksek Talep: Min 250 Satış, Min 50.000₺ Ciro, Min 75 Fırsat
        preset = {
          ...preset,
          minSales: "250",
          minRevenue: "50000",
          minOpportunity: "75",
        };
        break;
      case "low_competition": // Düşük Rekabet: Max 75 Yorum, Min 60 Satış, Min 4.2 Puan
        preset = {
          ...preset,
          maxReviews: "75",
          minSales: "60",
          minRating: "4.2",
          minOpportunity: "75",
        };
        break;
      case "low_reviews": // Az Yorumlu Fırsatlar: Max 30 Yorum, Min 100 Satış, Min 80 Fırsat
        preset = {
          ...preset,
          maxReviews: "30",
          minSales: "100",
          minOpportunity: "80",
        };
        break;
      case "potential": // Geliştirme Potansiyeli: 50-500 Yorum, 3.2-4.1 Puan (Kalite artırarak pazar kapma)
        preset = {
          ...preset,
          minReviews: "50",
          maxReviews: "500",
          minRating: "3.2",
          maxRating: "4.1",
        };
        break;
      default:
        break;
    }

    setFilters(preset);
    setIsOpen(true);
  };

  const handleFieldChange = (key: keyof VigoRadarFilterCriteria, val: any) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
  };

  const toggleBadge = (badge: string) => {
    setFilters((prev) => {
      const exists = prev.badges.includes(badge);
      return {
        ...prev,
        badges: exists
          ? prev.badges.filter((b) => b !== badge)
          : [...prev.badges, badge],
      };
    });
  };

  const handleReset = () => {
    setFilters(INITIAL_VIGO_FILTERS);
    onResetFilters();
  };

  const handleApply = () => {
    onApplyFilters(filters);
    setIsOpen(false);
  };

  const handleSaveCurrentFilter = () => {
    if (!newPresetName.trim()) return;
    const newPreset: SavedFilterPreset = {
      id: Date.now().toString(),
      name: newPresetName.trim(),
      createdAt: new Date().toLocaleDateString("tr-TR"),
      criteria: { ...filters },
    };
    const updated = [newPreset, ...savedPresets];
    savePresetToStorage(updated);
    setNewPresetName("");
    setShowSaveModal(false);
  };

  const handleDeletePreset = (id: string) => {
    const updated = savedPresets.filter((p) => p.id !== id);
    savePresetToStorage(updated);
  };

  const handleLoadSavedPreset = (preset: SavedFilterPreset) => {
    setFilters(preset.criteria);
    setIsLibraryOpen(false);
    setIsOpen(true);
  };

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-3.5 sm:p-4 mb-4 shadow-xl transition-all">
      {/* 1. Hızlı Başlangıç Şablonları & Aç/Kapa Başlığı */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Sol: Hızlı Başlangıç Hapları (DataVigo Presets) */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Hızlı Başlangıç:
          </span>
          <button
            type="button"
            onClick={() => applyQuickPreset("newbie")}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 hover:border-slate-600 transition-all flex items-center gap-1 shadow-sm"
          >
            <span>🚀 Yeni Başlayanlar</span>
          </button>
          <button
            type="button"
            onClick={() => applyQuickPreset("high_demand")}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700/80 hover:border-amber-500/30 transition-all flex items-center gap-1 shadow-sm"
          >
            <span>🔥 Yüksek Talep</span>
          </button>
          <button
            type="button"
            onClick={() => applyQuickPreset("low_competition")}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700/80 hover:border-emerald-500/30 transition-all flex items-center gap-1 shadow-sm"
          >
            <span>🛡️ Düşük Rekabet</span>
          </button>
          <button
            type="button"
            onClick={() => applyQuickPreset("low_reviews")}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700/80 hover:border-cyan-500/30 transition-all flex items-center gap-1 shadow-sm"
          >
            <span>💎 Az Yorumlu Fırsatlar</span>
          </button>
          <button
            type="button"
            onClick={() => applyQuickPreset("potential")}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700/80 hover:border-purple-500/30 transition-all flex items-center gap-1 shadow-sm"
          >
            <span>📈 Geliştirme Potansiyeli</span>
          </button>

          {/* Filtre Kitaplığım Butonu */}
          <button
            type="button"
            onClick={() => setIsLibraryOpen(true)}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border border-blue-800/60 hover:border-blue-600 transition-all flex items-center gap-1.5 shadow-sm ml-auto sm:ml-0"
          >
            <Bookmark className="w-3.5 h-3.5 text-blue-400" />
            <span>Filtre Kitaplığım</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-500/30 text-[10px] font-bold text-blue-200">
              {savedPresets.length}
            </span>
          </button>
        </div>

        {/* Sağ: Detaylı Filtreleri Göster / Gizle Butonu */}
        <div className="flex items-center gap-2 justify-end shrink-0">
          {activeCount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
              {activeCount} Kriter Aktif
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm ${
              isOpen
                ? "bg-slate-800 text-white border-slate-700"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 hover:from-blue-500 hover:to-indigo-500"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{isOpen ? "Filtreleri Gizle" : "Detaylı Filtreler (VigoRadar)"}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. Açılır 4 Sekmeli Detaylı VigoRadar Paneli */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 animate-fadeIn">
          {/* Sekme Butonları */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4 overflow-x-auto text-xs scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("sales")}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === "sales"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>1. Satış & Performans</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === "reviews"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <Star className="w-4 h-4 text-amber-400" />
              <span>2. Ürün & Yorumlar</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("competition")}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === "competition"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <Tag className="w-4 h-4 text-emerald-400" />
              <span>3. Rekabet & Marka</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("logistics")}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === "logistics"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <Truck className="w-4 h-4 text-cyan-400" />
              <span>4. Lojistik & Detaylar</span>
            </button>
          </div>

          {/* Sekme İçerikleri */}
          <div className="bg-[#0b101d] border border-slate-800/80 rounded-xl p-4 mb-4">
            {/* SEKME 1: Satış & Performans */}
            {activeTab === "sales" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {/* Satış Fiyatı (₺) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Satış Fiyatı (₺)</span>
                    <span className="text-[10px] text-slate-500">Min — Max</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      placeholder="Min ₺"
                      value={filters.minPrice}
                      onChange={(e) => handleFieldChange("minPrice", e.target.value)}
                      className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-slate-600">—</span>
                    <input
                      type="number"
                      placeholder="Maks ₺"
                      value={filters.maxPrice}
                      onChange={(e) => handleFieldChange("maxPrice", e.target.value)}
                      className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Aylık Satış (Adet) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Aylık Satış (Adet)</span>
                    <span className="text-[10px] text-slate-500">Tahmini Talep</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      placeholder="Min Adet"
                      value={filters.minSales}
                      onChange={(e) => handleFieldChange("minSales", e.target.value)}
                      className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-slate-600">—</span>
                    <input
                      type="number"
                      placeholder="Maks Adet"
                      value={filters.maxSales}
                      onChange={(e) => handleFieldChange("maxSales", e.target.value)}
                      className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Aylık Ciro (₺) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Aylık Ciro (₺)</span>
                    <span className="text-[10px] text-slate-500">Pazar Geliri</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      placeholder="Min ₺"
                      value={filters.minRevenue}
                      onChange={(e) => handleFieldChange("minRevenue", e.target.value)}
                      className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-slate-600">—</span>
                    <input
                      type="number"
                      placeholder="Maks ₺"
                      value={filters.maxRevenue}
                      onChange={(e) => handleFieldChange("maxRevenue", e.target.value)}
                      className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Fırsat Skoru (%) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Fırsat Skoru (%)</span>
                    <span className="text-[10px] text-slate-500">Talep/Rekabet/Kâr</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      placeholder="Min %"
                      value={filters.minOpportunity}
                      onChange={(e) => handleFieldChange("minOpportunity", e.target.value)}
                      className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-slate-600">—</span>
                    <input
                      type="number"
                      placeholder="Maks %"
                      value={filters.maxOpportunity}
                      onChange={(e) => handleFieldChange("maxOpportunity", e.target.value)}
                      className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SEKME 2: Ürün & Yorumlar */}
            {activeTab === "reviews" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Yorum Sayısı (Adet) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Yorum Sayısı (Adet)</span>
                      <span className="text-[10px] text-slate-500">Min — Max</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        placeholder="Min Adet"
                        value={filters.minReviews}
                        onChange={(e) => handleFieldChange("minReviews", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-slate-600">—</span>
                      <input
                        type="number"
                        placeholder="Maks Adet"
                        value={filters.maxReviews}
                        onChange={(e) => handleFieldChange("maxReviews", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Değerlendirme Puanı (/ 5) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Müşteri Puanı (/ 5.0)</span>
                      <span className="text-[10px] text-slate-500">★ Ortalama</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={filters.minRating}
                        onChange={(e) => handleFieldChange("minRating", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                      >
                        <option value="0">Tümü (0+)</option>
                        <option value="3.5">★ 3.5+</option>
                        <option value="4.0">★ 4.0+</option>
                        <option value="4.3">★ 4.3+</option>
                        <option value="4.5">★ 4.5+</option>
                        <option value="4.7">★ 4.7+</option>
                      </select>
                      <span className="text-slate-600">—</span>
                      <select
                        value={filters.maxRating}
                        onChange={(e) => handleFieldChange("maxRating", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                      >
                        <option value="5">★ 5.0</option>
                        <option value="4.5">★ 4.5</option>
                        <option value="4.2">★ 4.2</option>
                        <option value="4.0">★ 4.0</option>
                      </select>
                    </div>
                  </div>

                  {/* Sepetteki Kişi Sayısı */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Sepetteki Kişi (~ Adet)</span>
                      <span className="text-[10px] text-slate-500">Canlı Talep</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        placeholder="Min Sepet"
                        value={filters.minInCart}
                        onChange={(e) => handleFieldChange("minInCart", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-slate-600">—</span>
                      <input
                        type="number"
                        placeholder="Maks Sepet"
                        value={filters.maxInCart}
                        onChange={(e) => handleFieldChange("maxInCart", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Ürün Rozetleri Seçimi */}
                <div className="pt-2 border-t border-slate-800">
                  <span className="block text-[11px] font-bold text-slate-300 mb-2">
                    Ürün Rozetleri (Pazar Sinyalleri)
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => toggleBadge("best_seller")}
                      className={`px-3 py-1.5 rounded-lg font-semibold text-xs border transition-all flex items-center gap-1.5 ${
                        filters.badges.includes("best_seller")
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Çok Satanlar (Best Seller)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleBadge("flash_deal")}
                      className={`px-3 py-1.5 rounded-lg font-semibold text-xs border transition-all flex items-center gap-1.5 ${
                        filters.badges.includes("flash_deal")
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Flaş Fırsat / İndirimde</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleBadge("fast_delivery")}
                      className={`px-3 py-1.5 rounded-lg font-semibold text-xs border transition-all flex items-center gap-1.5 ${
                        filters.badges.includes("fast_delivery")
                          ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Hızlı Teslimat / Prime</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SEKME 3: Rekabet & Marka */}
            {activeTab === "competition" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Satıcı Teklifi Sayısı */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Satıcı Teklifi Sayısı</span>
                      <span className="text-[10px] text-slate-500">Buybox Rekabeti</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        placeholder="Min Satıcı"
                        value={filters.minSellers}
                        onChange={(e) => handleFieldChange("minSellers", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-slate-600">—</span>
                      <input
                        type="number"
                        placeholder="Maks Satıcı"
                        value={filters.maxSellers}
                        onChange={(e) => handleFieldChange("maxSellers", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Sadece İndirimli Ürünler Toggle */}
                  <div className="flex flex-col justify-center">
                    <label className="block text-[11px] font-bold text-slate-300 mb-2">
                      Fiyat İndirimi
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={filters.hasDiscountOnly}
                        onChange={(e) => handleFieldChange("hasDiscountOnly", e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 text-blue-600 bg-slate-900 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-slate-300 text-xs font-medium">
                        Yalnızca indirimi olan ürünleri göster
                      </span>
                    </label>
                  </div>

                  {/* Kelime Eşleştirme Modu */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                      Dahil Edilen Kelimeleri Eşleştir
                    </label>
                    <select
                      value={filters.keywordMatchMode}
                      onChange={(e) => handleFieldChange("keywordMatchMode", e.target.value)}
                      className="w-full bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                    >
                      <option value="any">Herhangi birini içerir (OR)</option>
                      <option value="all">Hepsini içerir (AND)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                  {/* Marka Dahil Et / Hariç Tut */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Marka Dahil Et (Virgülle ayırın)
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: Philips, Karaca, Xiaomi"
                      value={filters.includeBrands}
                      onChange={(e) => handleFieldChange("includeBrands", e.target.value)}
                      className="w-full bg-[#060913] border border-slate-700/80 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500 mb-2"
                    />
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      Marka Hariç Tut (Virgülle ayırın)
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: Apple, Sony (Hariç tut)"
                      value={filters.excludeBrands}
                      onChange={(e) => handleFieldChange("excludeBrands", e.target.value)}
                      className="w-full bg-[#060913] border border-slate-700/80 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  {/* Kelime Dahil Et / Hariç Tut */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Kelime Dahil Et (Başlıkta aranan kelimeler)
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: Bluetooth, Çelik, Kablosuz"
                      value={filters.includeKeywords}
                      onChange={(e) => handleFieldChange("includeKeywords", e.target.value)}
                      className="w-full bg-[#060913] border border-slate-700/80 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500 mb-2"
                    />
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      Kelime Hariç Tut (Başlıkta geçmesin)
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: Kılıf, Kablo, Adaptör (Hariç tut)"
                      value={filters.excludeKeywords}
                      onChange={(e) => handleFieldChange("excludeKeywords", e.target.value)}
                      className="w-full bg-[#060913] border border-slate-700/80 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SEKME 4: Lojistik & Detaylar */}
            {activeTab === "logistics" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {/* Kargo Bedeli (₺) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Kargo Bedeli (₺)</span>
                    <span className="text-[10px] text-slate-500">Min — Max</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      placeholder="Min ₺"
                      value={filters.minShippingCost}
                      onChange={(e) => handleFieldChange("minShippingCost", e.target.value)}
                      className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-slate-600">—</span>
                    <input
                      type="number"
                      placeholder="Maks ₺"
                      value={filters.maxShippingCost}
                      onChange={(e) => handleFieldChange("maxShippingCost", e.target.value)}
                      className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Barem / Desi */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Hacimsel Ağırlık (Desi)</span>
                    <span className="text-[10px] text-slate-500">Kargo Desisi</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      placeholder="Min Desi"
                      value={filters.minDesi}
                      onChange={(e) => handleFieldChange("minDesi", e.target.value)}
                      className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-slate-600">—</span>
                    <input
                      type="number"
                      placeholder="Maks Desi"
                      value={filters.maxDesi}
                      onChange={(e) => handleFieldChange("maxDesi", e.target.value)}
                      className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Gönderim Yöntemi */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                    Lojistik Modeli
                  </label>
                  <select
                    value={filters.shippingMethod}
                    onChange={(e) => handleFieldChange("shippingMethod", e.target.value)}
                    className="w-full bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">Tümü (Pazaryeri & Satıcı)</option>
                    <option value="marketplace">Pazaryeri Lojistiği (Express / Prime)</option>
                    <option value="merchant">Satıcı Gönderimi (Doğrudan Kargo)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 3. Alt Eylem Çubuğu: Sıfırla, Filtremi Kaydet & Ürünleri Keşfet */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Filtreleri Sıfırla</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSaveModal(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-blue-300 hover:text-blue-200 bg-blue-950/40 hover:bg-blue-900/60 border border-blue-800/60 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Bu Filtreyi Kaydet</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleApply}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Ürünleri Keşfet (Filtreleri Uygula)</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Filtre Kitaplığım Çekmecesi / Modalı */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#0b101d] border border-slate-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-sm">Filtre Kitaplığım (VigoRadar)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLibraryOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {savedPresets.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Henüz kaydedilmiş özel bir filtre şablonunuz bulunmuyor.
                  <br />
                  Filtrelerinizi ayarladıktan sonra <strong className="text-white">&quot;Bu Filtreyi Kaydet&quot;</strong> butonuna tıklayarak buraya ekleyebilirsiniz.
                </div>
              ) : (
                savedPresets.map((sp) => (
                  <div
                    key={sp.id}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 transition-all"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-white text-xs">{sp.name}</div>
                      <div className="text-[10px] text-slate-500">Kayıt: {sp.createdAt}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleLoadSavedPreset(sp)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Yükle</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePreset(sp.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-950/50 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsLibraryOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Filtre Kaydetme Popup Modalı */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#0b101d] border border-slate-800 rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-white text-sm">Filtreyi Kitaplığa Kaydet</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Bu filtre kombinasyonuna hatırlatıcı bir isim verin:
            </p>
            <input
              type="text"
              placeholder="Örn: 2026 Kozmetik Nişi, Yüksek Kâr"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              className="w-full bg-[#060913] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleSaveCurrentFilter}
                disabled={!newPresetName.trim()}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
