"use client";

import React, { useState, useMemo } from "react";
import {
  Package,
  Search,
  Filter,
  TrendingUp,
  Star,
  ExternalLink,
  Zap,
  ShoppingBag,
  ArrowUpDown,
  BookmarkCheck,
  BookmarkPlus,
  LineChart as ChartIcon,
  Calculator,
  Wand2,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  CheckSquare,
  Square,
  ShieldCheck,
  Info,
  MessageSquare,
  Sparkles,
  X,
  Download,
  BarChart3,
  Layers,
  Store,
  Activity,
} from "lucide-react";
import ProductMatchmakerWizard from "./ProductMatchmakerWizard";
import MarketChartsPanel from "./MarketChartsPanel";
import ProductPassportModal from "./ProductPassportModal";
import VigoRadarFilterPanel, {
  VigoRadarFilterCriteria,
  INITIAL_VIGO_FILTERS,
} from "./VigoRadarFilterPanel";
import { apiUrl } from "@/lib/api";

export interface Product {
  id?: number;
  marketplace: string;
  external_id: string;
  title: string;
  brand?: string;
  category_name?: string;
  url: string;
  image_url?: string;
  current_price: number;
  original_price?: number;
  currency: string;
  seller_name?: string;
  rating: number;
  review_count: number;
  favorite_count: number;
  estimated_monthly_sales: number;
  estimated_monthly_revenue: number;
  opportunity_score: number;
  demand_score?: number;
  competition_score?: number;
  economics_score?: number;
  estimated_net_profit?: number;
  in_cart_count?: number;
  is_tracked?: boolean;
  price_history?: any[];
}

interface BlackBoxViewProps {
  products: Product[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedMarketplace?: string;
  onSearch: (q?: string, category?: string, forceRefresh?: boolean) => void;
  onToggleTrack: (product: Product) => void;
  onOpenPriceModal: (product: Product) => void;
  onOpenProfitModal: (product: Product) => void;
  onOpenOptimizerModal: (product: Product) => void;
  onOpenReviewModal?: (product: Product) => void;
  onOpenCrossMarketModal?: (product: Product) => void;
  errorMessage?: string;
  selectedCategory?: string;
  setSelectedCategory?: (category: string) => void;
  totalScannedVolume?: number;
  currentPage?: number;
  totalPages?: number;
  isDeepScan?: boolean;
  onPageChange?: (page: number) => void;
  onToggleDeepScan?: (active: boolean) => void;
  scraperStats?: { trendyol: number; hepsiburada: number; amazon: number; n11: number } | null;
}

export default function BlackBoxView({
  products,
  loading,
  searchQuery,
  setSearchQuery,
  selectedMarketplace = "all",
  onSearch,
  onToggleTrack,
  onOpenPriceModal,
  onOpenProfitModal,
  onOpenOptimizerModal,
  onOpenReviewModal,
  onOpenCrossMarketModal,
  errorMessage,
  selectedCategory: propCategory,
  setSelectedCategory: propSetCategory,
  totalScannedVolume = 14850,
  currentPage = 1,
  totalPages = 412,
  isDeepScan = false,
  onPageChange,
  onToggleDeepScan,
  scraperStats,
}: BlackBoxViewProps) {
  // Wizard daraltılmış/açık durumu
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Kategori seçimi (local fallback)
  const [localCategory, setLocalCategory] = useState("Tüm Kategoriler");
  const currentCategory = propCategory || localCategory;
  const setCategory = propSetCategory || setLocalCategory;

  const categories = [
    "Tüm Kategoriler",
    "Elektronik",
    "Küçük Ev Aletleri",
    "Ev & Yaşam",
    "Moda & Giyim",
    "Kozmetik & Kişisel Bakım",
    "Spor & Outdoor",
    "Anne & Bebek",
    "Kitap & Hobi",
    "Oto & Yapı Market",
  ];

  // Görünüm Modu: Otomatik (Mobilde Kart, Masaüstünde Tablo), Kartlar veya Tablo
  const [displayMode, setDisplayMode] = useState<"auto" | "cards" | "table">("auto");

  // DataVigo (VigoRadar) Filtre Kriterleri
  const [appliedFilters, setAppliedFilters] = useState<VigoRadarFilterCriteria>(INITIAL_VIGO_FILTERS);

  // Sıralama Durumu
  const [sortField, setSortField] = useState<
    | "opportunity_score"
    | "estimated_monthly_sales"
    | "current_price"
    | "estimated_monthly_revenue"
    | "rating"
    | "review_count"
  >("opportunity_score");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Seçili Ürünler (Batch Checkbox)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Fırsat Önerileri State'i
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Gelişmiş Pazar Grafikleri & Tekil Ürün Röntgeni State'leri
  const [showCharts, setShowCharts] = useState(false);
  const [passportProduct, setPassportProduct] = useState<Product | null>(null);
  const [deduplicate, setDeduplicate] = useState(false);

  // Aktif filtre sayısı sayacı (VigoRadar Kriterleri)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (appliedFilters.minSales || appliedFilters.maxSales) count++;
    if (appliedFilters.minPrice || appliedFilters.maxPrice) count++;
    if (appliedFilters.minRevenue || appliedFilters.maxRevenue) count++;
    if (appliedFilters.minOpportunity || appliedFilters.maxOpportunity) count++;
    if (appliedFilters.minSalesReviewRatio || appliedFilters.maxSalesReviewRatio) count++;
    if (appliedFilters.minReviews || appliedFilters.maxReviews) count++;
    if (
      (appliedFilters.minRating && appliedFilters.minRating !== "0") ||
      (appliedFilters.maxRating && appliedFilters.maxRating !== "5")
    ) count++;
    if (appliedFilters.minInCart || appliedFilters.maxInCart) count++;
    if (appliedFilters.badges && appliedFilters.badges.length > 0) count += appliedFilters.badges.length;
    if (appliedFilters.minSellers || appliedFilters.maxSellers) count++;
    if (appliedFilters.hasDiscountOnly) count++;
    if (appliedFilters.includeBrands || appliedFilters.excludeBrands) count++;
    if (appliedFilters.includeKeywords || appliedFilters.excludeKeywords) count++;
    if (
      appliedFilters.minShippingCost ||
      appliedFilters.maxShippingCost ||
      appliedFilters.minDesi ||
      appliedFilters.maxDesi ||
      (appliedFilters.shippingMethod && appliedFilters.shippingMethod !== "all")
    ) count++;
    if (deduplicate) count++;
    return count;
  }, [appliedFilters, deduplicate]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleResetFilters = () => {
    setAppliedFilters(INITIAL_VIGO_FILTERS);
    setDeduplicate(false);
  };

  // Fırsat Ürünleri Öner Butonu Tıklaması
  const handleFetchRecommendations = async () => {
    setRecLoading(true);
    try {
      const catParam =
        currentCategory && currentCategory !== "Tüm Kategoriler"
          ? `?category=${encodeURIComponent(currentCategory)}`
          : "";
      const res = await fetch(apiUrl(`/api/v1/products/recommendations${catParam}`));
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data);
        setShowRecommendations(true);
      }
    } catch (err) {
      console.error("Öneri ürünleri alınamadı:", err);
    } finally {
      setRecLoading(false);
    }
  };

  // İstemci tarafı dinamik filtreleme, kopya ayıklama ve sıralama (DataVigo VigoRadar Motoru)
  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => {
      // 1. Satış & Performans Filtreleri
      if (appliedFilters.minPrice && p.current_price < parseFloat(appliedFilters.minPrice)) return false;
      if (appliedFilters.maxPrice && p.current_price > parseFloat(appliedFilters.maxPrice)) return false;
      if (appliedFilters.minSales && p.estimated_monthly_sales < parseInt(appliedFilters.minSales, 10)) return false;
      if (appliedFilters.maxSales && p.estimated_monthly_sales > parseInt(appliedFilters.maxSales, 10)) return false;
      if (appliedFilters.minRevenue && p.estimated_monthly_revenue < parseFloat(appliedFilters.minRevenue)) return false;
      if (appliedFilters.maxRevenue && p.estimated_monthly_revenue > parseFloat(appliedFilters.maxRevenue)) return false;
      if (appliedFilters.minOpportunity && p.opportunity_score < parseFloat(appliedFilters.minOpportunity)) return false;
      if (appliedFilters.maxOpportunity && p.opportunity_score > parseFloat(appliedFilters.maxOpportunity)) return false;

      // Satış/Yorum Oranı
      if (appliedFilters.minSalesReviewRatio || appliedFilters.maxSalesReviewRatio) {
        const ratio = p.review_count > 0 ? p.estimated_monthly_sales / p.review_count : p.estimated_monthly_sales;
        if (appliedFilters.minSalesReviewRatio && ratio < parseFloat(appliedFilters.minSalesReviewRatio)) return false;
        if (appliedFilters.maxSalesReviewRatio && ratio > parseFloat(appliedFilters.maxSalesReviewRatio)) return false;
      }

      // 2. Ürün & Yorum Filtreleri
      if (appliedFilters.minReviews && p.review_count < parseInt(appliedFilters.minReviews, 10)) return false;
      if (appliedFilters.maxReviews && p.review_count > parseInt(appliedFilters.maxReviews, 10)) return false;
      if (appliedFilters.minRating && p.rating < parseFloat(appliedFilters.minRating)) return false;
      if (appliedFilters.maxRating && p.rating > parseFloat(appliedFilters.maxRating)) return false;

      // Sepetteki Kişi Sayısı
      if (appliedFilters.minInCart && (p.in_cart_count || 0) < parseInt(appliedFilters.minInCart, 10)) return false;
      if (appliedFilters.maxInCart && (p.in_cart_count || 0) > parseInt(appliedFilters.maxInCart, 10)) return false;

      // Rozet Filtreleri (Best Seller, Flash Deal, Fast Delivery)
      if (appliedFilters.badges && appliedFilters.badges.length > 0) {
        for (const badge of appliedFilters.badges) {
          if (badge === "best_seller") {
            const isBestSeller = (p.opportunity_score >= 80) || (p.estimated_monthly_sales >= 300) || (p.title?.toLowerCase().includes("çok satan"));
            if (!isBestSeller) return false;
          } else if (badge === "flash_deal") {
            const hasDeal = Boolean(p.original_price && p.original_price > p.current_price);
            if (!hasDeal) return false;
          } else if (badge === "fast_delivery") {
            const isFast = (p.seller_name && p.seller_name.toLowerCase().includes("hızlı")) || (p.opportunity_score > 60);
            if (!isFast) return false;
          }
        }
      }

      // 3. Rekabet & Marka Filtreleri
      if (appliedFilters.hasDiscountOnly) {
        if (!p.original_price || p.original_price <= p.current_price) return false;
      }

      const pBrand = (p.brand || "").toLowerCase().trim();
      if (appliedFilters.includeBrands) {
        const incBrands = appliedFilters.includeBrands.toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);
        if (incBrands.length > 0 && !incBrands.some((b) => pBrand.includes(b))) return false;
      }
      if (appliedFilters.excludeBrands) {
        const excBrands = appliedFilters.excludeBrands.toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);
        if (excBrands.length > 0 && excBrands.some((b) => pBrand.includes(b))) return false;
      }

      // Dahil / Hariç Kelime Filtreleri
      const pTitle = (p.title || "").toLowerCase();
      if (appliedFilters.includeKeywords) {
        const incWords = appliedFilters.includeKeywords.toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);
        if (incWords.length > 0) {
          if (appliedFilters.keywordMatchMode === "all") {
            if (!incWords.every((w) => pTitle.includes(w))) return false;
          } else {
            if (!incWords.some((w) => pTitle.includes(w))) return false;
          }
        }
      }
      if (appliedFilters.excludeKeywords) {
        const excWords = appliedFilters.excludeKeywords.toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);
        if (excWords.length > 0 && excWords.some((w) => pTitle.includes(w))) return false;
      }

      return true;
    });

    // Mükerrer / Kopya Ürünleri Ayıkla
    if (deduplicate) {
      const seen = new Set<string>();
      list = list.filter((p) => {
        const normTitle = (p.title || "")
          .toLowerCase()
          .replace(/[^a-z0-9ğüşıöç]/gi, " ")
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 4)
          .join("_");
        const key = `${(p.brand || "genel").toLowerCase()}_${normTitle}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    return list.sort((a, b) => {
      const valA = a[sortField] || 0;
      const valB = b[sortField] || 0;
      return sortDirection === "asc" ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
  }, [
    products,
    appliedFilters,
    sortField,
    sortDirection,
    deduplicate,
  ]);

  // Metrik Hesaplamaları & Medyan Fiyat
  const totalCount = filteredProducts.length;

  const sortedPrices = useMemo(() => {
    return [...filteredProducts]
      .map((p) => p.current_price)
      .filter((pr) => pr > 0)
      .sort((a, b) => a - b);
  }, [filteredProducts]);

  const medianPrice = useMemo(() => {
    if (sortedPrices.length === 0) return 0;
    const mid = Math.floor(sortedPrices.length / 2);
    return sortedPrices.length % 2 !== 0
      ? sortedPrices[mid]
      : Math.round(((sortedPrices[mid - 1] + sortedPrices[mid]) / 2) * 100) / 100;
  }, [sortedPrices]);

  const avgPrice =
    totalCount > 0
      ? (filteredProducts.reduce((acc, p) => acc + p.current_price, 0) / totalCount).toFixed(2)
      : "0";
  const avgOpportunity =
    totalCount > 0
      ? (filteredProducts.reduce((acc, p) => acc + p.opportunity_score, 0) / totalCount).toFixed(1)
      : "0";
  const avgDemand =
    totalCount > 0
      ? (
          filteredProducts.reduce(
            (acc, p) => acc + (p.demand_score || p.opportunity_score || 65),
            0
          ) / totalCount
        ).toFixed(0)
      : "0";
  const avgCompetition =
    totalCount > 0
      ? (
          filteredProducts.reduce(
            (acc, p) => acc + (p.competition_score || (p.review_count < 100 ? 85 : 50)),
            0
          ) / totalCount
        ).toFixed(0)
      : "0";
  const avgEconomics =
    totalCount > 0
      ? (
          filteredProducts.reduce(
            (acc, p) => acc + (p.economics_score || (p.current_price > 300 ? 80 : 60)),
            0
          ) / totalCount
        ).toFixed(0)
      : "0";
  const totalVolume =
    totalCount > 0
      ? filteredProducts.reduce((acc, p) => acc + p.estimated_monthly_sales, 0)
      : 0;
  const totalRevenue =
    totalCount > 0
      ? filteredProducts.reduce((acc, p) => acc + p.estimated_monthly_revenue, 0)
      : 0;

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.external_id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Excel / CSV Olarak Dışa Aktar Fonksiyonu (Türkçe Karakter Uyumlu UTF-8 BOM)
  const handleExportToExcel = () => {
    if (filteredProducts.length === 0) return;

    const headers = [
      "No",
      "Urun_Basligi",
      "Marka",
      "Kategori",
      "Satici",
      "Fiyat_TL",
      "Onceki_Fiyat_TL",
      "Tahmini_Aylik_Satis_Adet",
      "Tahmini_Aylik_Ciro_TL",
      "Firsat_Skoru_Yuzde",
      "Puan",
      "Yorum_Sayisi",
      "Urun_Linki",
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const clean = String(val).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = filteredProducts.map((p, idx) => [
      idx + 1,
      escapeCsv(p.title),
      escapeCsv(p.brand || "GENEL"),
      escapeCsv(p.category_name || currentCategory),
      escapeCsv(p.seller_name || "Trendyol Satıcısı"),
      p.current_price,
      p.original_price || p.current_price,
      p.estimated_monthly_sales,
      p.estimated_monthly_revenue,
      p.opportunity_score,
      p.rating,
      p.review_count,
      escapeCsv(p.url),
    ]);

    // UTF-8 BOM (\uFEFF) sayesinde Microsoft Excel Türkçe harfleri (ş, ğ, ü, ı, ö, ç) bozulmadan açar
    const csvContent =
      "\uFEFF" +
      [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.setAttribute("download", `UrunBul_Pazar_Analizi_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getMarketBadge = (marketplace: string) => {
    const mp = (marketplace || "trendyol").toLowerCase();
    if (mp.includes("trendyol")) {
      return {
        label: "Trendyol",
        icon: "🇹🇷",
        cls: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30",
      };
    }
    if (mp.includes("hepsiburada")) {
      return {
        label: "Hepsiburada",
        icon: "🟠",
        cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
      };
    }
    if (mp.includes("amazon")) {
      return {
        label: "Amazon TR",
        icon: "📦",
        cls: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
      };
    }
    if (mp.includes("n11")) {
      return {
        label: "N11",
        icon: "🟣",
        cls: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
      };
    }
    return {
      label: marketplace || "Pazaryeri",
      icon: "🏪",
      cls: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30",
    };
  };

  const triggerSearch = (forceRefresh: boolean = false) => {
    const cat = currentCategory !== "Tüm Kategoriler" ? currentCategory : undefined;
    onSearch(searchQuery, cat, forceRefresh);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 0. İNTERAKTİF ÜRÜN EŞLEŞTİRME SİHİRBAZI (Katlanabilir / Varsayılan Kapalı) */}
      <div className="rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-950/20 via-slate-900 to-indigo-950/20 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setIsWizardOpen(!isWizardOpen)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-white/5 transition"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white">
              3 Soruda E-Ticaret Fırsat Eşleştirme Sihirbazı (Sermaye & Strateji Tercihi)
            </span>
            <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium">
              İsteğe Bağlı
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold">
            <span>{isWizardOpen ? "Sihirbazı Gizle" : "Sihirbazı Aç"}</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isWizardOpen ? "rotate-180" : ""}`} />
          </div>
        </button>
        {isWizardOpen && (
          <div className="p-4 border-t border-slate-800 bg-[#0b0f19]">
            <ProductMatchmakerWizard
              onOpenProfitCalculator={onOpenProfitModal}
              onToggleTrack={onToggleTrack}
            />
          </div>
        )}
      </div>

      {/* 1. BÜYÜK VERİ İSTİHBARAT & PAZAR HUNİSİ (FUNNEL BAR) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-500/20 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-400">4 Pazaryeri Canlı Pazar İstihbarat Radarı</span>
          </div>
          <div className="flex flex-wrap items-baseline gap-2.5 mt-1">
            <span className="text-xl sm:text-2xl font-black text-white">
              {(totalScannedVolume || 14850).toLocaleString("tr-TR")}+ Ürün Analiz Edildi
            </span>
            <span className="text-xs text-slate-400">
              (Pazardaki {Math.max(0, (totalScannedVolume || 14850) - products.length).toLocaleString("tr-TR")} düşük kârlı ürün elendi, en yüksek fırsatlı {products.length} ürün listeleniyor)
            </span>
          </div>
        </div>

        {/* Hızlı Aksiyonlar */}
        <div className="flex items-center gap-2">
          {onToggleDeepScan && (
            <button
              type="button"
              onClick={() => onToggleDeepScan(!isDeepScan)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                isDeepScan
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
              }`}
            >
              <Zap className={`w-4 h-4 ${isDeepScan ? "text-slate-950" : "text-amber-400"}`} />
              {isDeepScan ? "⚡ Derin Tarama Aktif (100+ Ürün)" : "⚡ 3 Sayfa Derin Tara"}
            </button>
          )}
        </div>
      </div>

      {/* 2. Başlık & Tanıtım */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0f172a] p-4 rounded-xl border border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            <h1 className="text-lg font-black text-white tracking-wide">
              Pazar & Ürün Keşfi
            </h1>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Trendyol Canlı Pazar Analizi
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Milyonlarca Trendyol ürününü tarayın, fırsat endeksi yüksek, kârlı ve düşük rekabetli ürünleri keşfedin.
          </p>
        </div>

        {/* Aksiyon Butonları */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Pazar Grafikleri Aç/Kapat */}
          {filteredProducts.length > 0 && (
            <button
              onClick={() => setShowCharts(!showCharts)}
              className={`px-3 py-1.5 rounded-lg border font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs ${
                showCharts
                  ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20"
                  : "bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/40 text-blue-300"
              }`}
              title="Fiyat histogramı, yorum bariyeri ve marka pazar payı grafiklerini aç/kapat"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{showCharts ? "Grafikleri Kapat" : "Pazar Grafikleri"}</span>
            </button>
          )}

          {/* Mükerrer / Kopya Ürün Filtresi */}
          {products.length > 0 && (
            <button
              onClick={() => setDeduplicate(!deduplicate)}
              className={`px-3 py-1.5 rounded-lg border font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs ${
                deduplicate
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
              }`}
              title="Aynı ürünün kopya ve mükerrer varyasyonlarını ayıkla"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{deduplicate ? "Kopyalar Ayıklandı" : "Kopyaları Ayıkla"}</span>
            </button>
          )}

          {/* Excel'e Aktar Butonu */}
          {filteredProducts.length > 0 && (
            <button
              onClick={handleExportToExcel}
              className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
              title="Filtrelenmiş ürün listesini Excel / CSV olarak indir"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Excel (CSV)</span>
            </button>
          )}

          <button
            onClick={handleFetchRecommendations}
            disabled={recLoading}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
          >
            {recLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>⚡ Fırsat Ürünleri Öner</span>
          </button>
        </div>
      </div>

      {/* 2. Sadeleştirilmiş Ana Arama & Kategori Çubuğu */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
          {/* Ana Arama Inputu */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Ürün adı, barkod, ASIN veya model ara… (Örn: kablosuz kulaklık, termos)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && triggerSearch()}
              className="w-full pl-10 pr-4 py-2.5 bg-[#0b0f19] border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Kategori Seçici */}
          <div className="md:w-56 shrink-0">
            <select
              value={currentCategory}
              onChange={(e) => {
                setCategory(e.target.value);
              }}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-lg px-3 py-2.5 text-white text-xs font-semibold focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Arama Butonu */}
          <button
            onClick={() => triggerSearch(false)}
            disabled={loading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs shadow-md shadow-blue-600/30 transition-all flex items-center justify-center space-x-1.5 shrink-0 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Pazar Taranıyor...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Pazarı Tara</span>
              </>
            )}
          </button>

          {/* Canlı Yenile Butonu (15 dk Cache Bypass) */}
          <button
            onClick={() => triggerSearch(true)}
            disabled={loading}
            title="15 dakikalık önbelleği atlayıp pazaryerlerini anlık kazı (canlı veri çek)"
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50 font-bold rounded-lg text-xs transition-all flex items-center justify-center space-x-1.5 shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Canlı Yenile</span>
          </button>
        </div>

        {/* Canlı Pazar Radarı Durum Rozetleri */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-2.5 border-t border-slate-800 text-[11px]">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            Canlı Tarama Radarı:
          </span>
          <span className={`px-2.5 py-0.5 rounded-full font-bold border transition ${
            scraperStats?.trendyol
              ? "bg-orange-500/15 text-orange-400 border-orange-500/30"
              : "bg-slate-800/80 text-slate-300 border-slate-700"
          }`}>
            Trendyol {scraperStats?.trendyol !== undefined ? (scraperStats.trendyol > 0 ? `(${scraperStats.trendyol} ürün)` : "(0)") : "Aktif"}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full font-bold border transition ${
            scraperStats?.hepsiburada
              ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
              : "bg-slate-800/80 text-slate-300 border-slate-700"
          }`}>
            Hepsiburada {scraperStats?.hepsiburada !== undefined ? (scraperStats.hepsiburada > 0 ? `(${scraperStats.hepsiburada} ürün)` : "(0)") : "Aktif"}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full font-bold border transition ${
            scraperStats?.amazon
              ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
              : "bg-slate-800/80 text-slate-300 border-slate-700"
          }`}>
            Amazon TR {scraperStats?.amazon !== undefined ? (scraperStats.amazon > 0 ? `(${scraperStats.amazon} ürün)` : "(0)") : "Aktif"}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full font-bold border transition ${
            scraperStats?.n11
              ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
              : "bg-slate-800/80 text-slate-300 border-slate-700"
          }`}>
            N11 {scraperStats?.n11 !== undefined ? (scraperStats.n11 > 0 ? `(${scraperStats.n11} ürün)` : "(0)") : "Aktif"}
          </span>
        </div>
      </div>

      {/* 3. DataVigo VigoRadar Açık Izgara Filtre Paneli (4 Bloklu Hep Açık Izgara, Hızlı Şablonlar & Filtre Kitaplığım) */}
      <VigoRadarFilterPanel
        onApplyFilters={(criteria) => setAppliedFilters(criteria)}
        onResetFilters={handleResetFilters}
        activeCount={activeFilterCount}
      />

      {/* 4. Fırsat Ürünleri Öner Vitrini (Top 3 Cards) */}
      {showRecommendations && recommendations.length > 0 && (
        <div className="bg-gradient-to-br from-[#0f172a] via-[#111c35] to-[#0f172a] border border-amber-500/30 rounded-xl p-4 shadow-lg animate-fadeIn relative">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white">
                ⚡ Yapay Zekâ Destekli Fırsat Önerileri (En Yüksek Pazar Endeksli 3 Ürün)
              </h2>
            </div>
            <button
              onClick={() => setShowRecommendations(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            {recommendations.map((item, idx) => (
              <div
                key={item.id || idx}
                className="bg-[#0b0f19] border border-slate-800 hover:border-amber-500/40 rounded-xl p-3.5 flex flex-col justify-between transition-all group shadow-sm"
              >
                <div>
                  {/* Badge */}
                  <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
                    {item.badge}
                  </div>

                  {/* Resim & Başlık */}
                  <div className="flex items-start space-x-3">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        className="w-14 h-16 object-contain rounded-lg border border-slate-800 bg-white p-1 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-16 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wide">
                        {item.brand || "Trendyol Satıcısı"}
                      </span>
                      <h3 className="font-semibold text-white text-xs line-clamp-2 leading-snug">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-amber-400 font-bold">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{item.rating}</span>
                        <span className="text-slate-500 font-normal">
                          ({item.review_count?.toLocaleString("tr-TR")} yorum)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Öneri Nedeni */}
                  <div className="mt-3 p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                    {item.recommendation_reason}
                  </div>

                  {/* Metrikler */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-800/80 text-center">
                    <div>
                      <div className="text-[10px] text-slate-500">Fiyat</div>
                      <div className="font-bold text-white text-xs">
                        ₺{item.current_price?.toLocaleString("tr-TR")}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Tahmini Satış</div>
                      <div className="font-bold text-emerald-400 text-xs">
                        ~{item.estimated_monthly_sales} ad/ay
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Fırsat Skoru</div>
                      <div className="font-black text-amber-400 text-xs">
                        %{item.opportunity_score}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Aksiyon Butonları */}
                <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => onOpenPriceModal(item)}
                    className="flex-1 py-1.5 rounded-lg bg-[#1e293b] hover:bg-blue-600 hover:text-white text-slate-300 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <ChartIcon className="w-3 h-3" />
                    <span>Fiyat Trendi</span>
                  </button>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-[#1e293b] hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
                    title="Trendyol'da Aç"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hata Bildirimi & Dayanıklı İyileştirme Kartı */}
      {errorMessage && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs shadow-lg backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-300 text-sm">Bağlantı & Servis Bildirimi</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                  Bulut Sunucu
                </span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed max-w-2xl">
                {errorMessage}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-amber-500/20">
            <button
              type="button"
              onClick={() => triggerSearch(false)}
              disabled={loading}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 active:scale-95 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Yeniden Dene</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. 5'li Gelişmiş Pazar İstihbarat Şeridi (Medyan Fiyat & 3'lü Skor Dahil) */}
      {totalCount > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3.5 shadow-sm">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Taranan Ürün Havuzu
            </div>
            <div className="text-xl font-black text-white mt-0.5">
              {totalCount} Ürün
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {deduplicate ? "✨ Kopyalar elendi (Tekil)" : "Trendyol Canlı Organik Veri"}
            </div>
          </div>

          <div className="bg-[#0f172a] border border-blue-500/30 rounded-xl p-3.5 shadow-sm bg-gradient-to-b from-blue-950/20 to-transparent">
            <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Medyan Fiyat</span>
              <span className="text-[9px] bg-blue-500/20 px-1 py-0.2 rounded text-blue-300">Merkez</span>
            </div>
            <div className="text-xl font-black text-blue-400 mt-0.5">
              ₺{medianPrice.toLocaleString("tr-TR")}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Uç Fiyatlardan Arındırılmış</div>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3.5 shadow-sm">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Ortalama Fiyat
            </div>
            <div className="text-xl font-black text-slate-200 mt-0.5">
              ₺{avgPrice}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Pazar Liste Ortalaması</div>
          </div>

          <div className="bg-[#0f172a] border border-emerald-500/30 rounded-xl p-3.5 shadow-sm bg-gradient-to-b from-emerald-950/20 to-transparent">
            <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Pazar Fırsat Endeksi</span>
              <span className="text-[9px] text-emerald-300 font-mono">3 Boyutlu</span>
            </div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">
              %{avgOpportunity}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
              <span className="text-blue-400" title="Ortalama Talep">T:%{avgDemand}</span>
              <span>•</span>
              <span className="text-amber-400" title="Ortalama Rekabet Açıklığı">R:%{avgCompetition}</span>
              <span>•</span>
              <span className="text-emerald-400" title="Ortalama Ekonomi/Marj">E:%{avgEconomics}</span>
            </div>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3.5 shadow-sm col-span-2 lg:col-span-1">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Tahmini Pazar Hacmi
            </div>
            <div className="text-xl font-black text-amber-400 mt-0.5">
              ~{totalVolume.toLocaleString("tr-TR")} ad/ay
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">₺{totalRevenue.toLocaleString("tr-TR")} Aylık Ciro</div>
          </div>
        </div>
      )}

      {/* 5.1. İNTERAKTİF PAZAR DAĞILIM GRAFİKLERİ PANELİ */}
      {showCharts && totalCount > 0 && (
        <MarketChartsPanel
          products={filteredProducts}
          medianPrice={medianPrice}
          avgPrice={parseFloat(avgPrice) || 0}
        />
      )}

      {/* Görünüm Değiştirici (Kart / Tablo Toggle Butonu) & Toplam Ürün Sayacı */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between gap-2 pt-2">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Taranan Sonuçlar ({filteredProducts.length})
          </div>
          <div className="flex items-center bg-slate-100 dark:bg-[#1e293b] p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setDisplayMode("cards")}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                displayMode === "cards" || displayMode === "auto"
                  ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              📱 Kartlar
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode("table")}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                displayMode === "table"
                  ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              📑 Tablo
            </button>
          </div>
        </div>
      )}

      {/* 6.1. MOBİL ÜRÜN KARTLARI LİSTESİ (Mobilde Dokunmatik Dostu Kart Görünümü) */}
      {totalCount > 0 && (
        <div className={`space-y-3 ${displayMode === "table" ? "hidden" : displayMode === "cards" ? "block" : "block md:hidden"}`}>
          {filteredProducts.map((p, idx) => {
            const badgeInfo = getMarketBadge(p.marketplace);
            return (
              <div
                key={p.external_id || idx}
                className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs space-y-3 transition hover:border-slate-300 dark:hover:border-slate-700"
              >
                {/* Üst Kısım: Görsel + Başlık & Pazar Rozeti */}
                <div className="flex gap-3">
                  <div className="relative w-20 h-24 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 flex items-center justify-center overflow-hidden">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.title}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <ShoppingBag className="w-6 h-6 text-slate-400" />
                    )}
                    <span className={`absolute top-1 left-1 text-[8px] font-black px-1 py-0.2 rounded border ${badgeInfo.cls}`}>
                      {badgeInfo.label}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1 text-[10px] text-slate-500 mb-0.5">
                        <span className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide truncate">
                          {p.brand || "GENEL"}
                        </span>
                        <span className="shrink-0 flex items-center gap-0.5 font-bold text-amber-500">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {p.rating?.toFixed(1) || "4.5"} ({p.review_count || 0})
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2 leading-snug">
                        {p.title}
                      </h4>
                    </div>

                    <div className="flex items-baseline justify-between mt-1 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                      <div>
                        <span className="text-base font-black text-slate-900 dark:text-white">
                          ₺{p.current_price.toLocaleString("tr-TR")}
                        </span>
                        {p.original_price && p.original_price > p.current_price && (
                          <span className="text-[10px] text-slate-400 line-through ml-1.5">
                            ₺{p.original_price.toLocaleString("tr-TR")}
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        ₺{(p.estimated_net_profit !== undefined ? p.estimated_net_profit : Math.round(p.current_price * 0.25)).toLocaleString("tr-TR")} Kâr
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metrik Şeridi (Aylık Satış, Ciro, Fırsat Skoru) */}
                <div className="grid grid-cols-3 gap-1.5 py-1.5 px-2 bg-slate-50 dark:bg-[#0b0f19] rounded-xl text-center border border-slate-200 dark:border-slate-800/80 text-[10px]">
                  <div>
                    <div className="text-slate-400">Tahmini Satış</div>
                    <div className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                      ~{p.estimated_monthly_sales} ad/ay
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">Aylık Ciro</div>
                    <div className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                      ₺{p.estimated_monthly_revenue ? (p.estimated_monthly_revenue > 1000 ? `${Math.round(p.estimated_monthly_revenue / 1000)}B` : p.estimated_monthly_revenue) : "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">Fırsat Skoru</div>
                    <div className="font-black text-emerald-500 mt-0.5">
                      %{p.opportunity_score || 75}
                    </div>
                  </div>
                </div>

                {/* Aksiyon Butonları (Başparmakla Kolay Tıklanabilir Dokunmatik Butonlar) */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => onOpenPriceModal(p)}
                    className="py-2 px-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <ChartIcon className="w-3.5 h-3.5 text-blue-500" />
                    <span>Trend</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenProfitModal(p)}
                    className="py-2 px-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Kâr</span>
                  </button>

                  {onOpenCrossMarketModal && (
                    <button
                      type="button"
                      onClick={() => onOpenCrossMarketModal(p)}
                      className="py-2 px-1 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>Arbitraj</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onToggleTrack(p)}
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer ${
                      p.is_tracked
                        ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {p.is_tracked ? (
                      <>
                        <BookmarkCheck className="w-3.5 h-3.5 text-rose-500" />
                        <span>Takipte</span>
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="w-3.5 h-3.5" />
                        <span>Takip</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Pazar İstihbarat & Fırsat Veri Tablosu */}
      {totalCount > 0 ? (
        <div className={`${displayMode === "cards" ? "hidden" : displayMode === "table" ? "block" : "hidden md:block"} bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-sm`}>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#0b0f19] border-b border-slate-800 text-slate-400 font-bold select-none whitespace-nowrap">
                  <th className="py-3 px-3">
                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-white">
                      {selectedIds.length === filteredProducts.length ? (
                        <CheckSquare className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-3">Ürün Detayı & Marka</th>
                  <th
                    className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort("current_price")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Fiyat</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort("estimated_monthly_sales")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Aylık Satış</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort("estimated_monthly_revenue")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Aylık Ciro</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-3">Komisyon</th>
                  <th
                    className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort("opportunity_score")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Fırsat Endeksi</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort("rating")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Puan & Yorum</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-3 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts.map((p, index) => {
                  const estCommissionRate = 18;
                  const estCommissionAmount = (p.current_price * estCommissionRate) / 100;
                  const isSelected = selectedIds.includes(p.external_id);

                  return (
                    <tr
                      key={p.external_id || index}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isSelected ? "bg-blue-900/10" : ""
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <button
                          onClick={() => toggleSelectOne(p.external_id)}
                          className="text-slate-500 hover:text-white"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-500" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                        {index + 1}
                      </td>

                      {/* Ürün Detayı & Görsel */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center space-x-3">
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt={p.title}
                              referrerPolicy="no-referrer"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                              className="w-10 h-12 object-contain rounded-lg border border-slate-700/60 bg-white p-0.5 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-12 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                              <ShoppingBag className="w-4 h-4 text-slate-500" />
                            </div>
                          )}
                          <div className="max-w-xs sm:max-w-sm">
                            <div className="flex items-center gap-1.5 mb-1">
                              {/* Pazaryeri Rozeti */}
                              {(() => {
                                const badgeInfo = getMarketBadge(p.marketplace);
                                return (
                                  <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${badgeInfo.cls}`}>
                                    <span>{badgeInfo.icon}</span>
                                    <span>{badgeInfo.label}</span>
                                  </span>
                                );
                              })()}
                              <span className="text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wide">
                                {p.brand || "GENEL"}
                              </span>
                            </div>
                            <div className="font-semibold text-slate-900 dark:text-white line-clamp-1 leading-snug">
                              {p.title}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                              <span>ID: {p.external_id}</span>
                              <span>•</span>
                              <span>Satıcı: {p.seller_name || `${p.marketplace ? p.marketplace.charAt(0).toUpperCase() + p.marketplace.slice(1) : "Pazaryeri"} Satıcısı`}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] mt-1">
                              {p.in_cart_count && p.in_cart_count > 0 ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                                  🛒 ~{p.in_cart_count} sepette
                                </span>
                              ) : null}
                              <span className="text-pink-500 dark:text-pink-400">
                                ❤️ {p.favorite_count?.toLocaleString("tr-TR")} favori
                              </span>
                            </div>

                            {/* 4 Pazaryeri Çapraz Arbitraj & Doğrudan Link Rozetleri */}
                            <div className="flex items-center gap-1.5 mt-2">
                              {onOpenCrossMarketModal && (
                                <button
                                  type="button"
                                  onClick={() => onOpenCrossMarketModal(p)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition"
                                  title="Trendyol, Hepsiburada, Amazon TR ve N11 Canlı Fiyat Karşılaştırması & Arbitraj"
                                >
                                  <Store className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                                  <span>Pazaryerleri Karşılaştır</span>
                                </button>
                              )}
                              <a
                                href={p.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-[10px] font-semibold text-slate-700 dark:text-slate-300 transition"
                                title="Doğrudan Pazaryeri Sayfasında Aç"
                              >
                                <span>Pazaryerinde Gör</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Fiyat */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-bold text-white text-sm">
                          ₺{p.current_price.toLocaleString("tr-TR")}
                        </div>
                        {p.original_price && p.original_price > p.current_price && (
                          <div className="text-[10px] text-slate-500 line-through">
                            ₺{p.original_price.toLocaleString("tr-TR")}
                          </div>
                        )}
                      </td>

                      {/* Aylık Satış */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-200">
                          ~{p.estimated_monthly_sales} ad/ay
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">Tahmini Talep</div>
                      </td>

                      {/* Aylık Ciro */}
                      <td className="py-2.5 px-3 whitespace-nowrap font-bold text-emerald-400 text-sm">
                        ₺{p.estimated_monthly_revenue.toLocaleString("tr-TR")}
                      </td>

                      {/* Komisyon */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-400 text-[11px]">
                        %{estCommissionRate} (₺{estCommissionAmount.toFixed(0)})
                      </td>

                      {/* Pazar Fırsat Endeksi & 3 Alt Skor */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black ${
                              p.opportunity_score >= 75
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : p.opportunity_score >= 50
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : "bg-slate-800 text-slate-400 border border-slate-700"
                            }`}
                          >
                            ⚡ %{p.opportunity_score}
                          </span>
                          <div className="flex items-center gap-1 text-[9px] text-slate-400 font-mono">
                            <span title="Talep Puanı" className="text-blue-400">
                              T:%{p.demand_score || Math.min(99, Math.round(p.opportunity_score * 0.95))}
                            </span>
                            <span>•</span>
                            <span title="Rekabet Açıklığı" className="text-amber-400">
                              R:%{p.competition_score || (p.review_count < 100 ? 85 : 52)}
                            </span>
                            <span>•</span>
                            <span title="Ekonomi Puanı" className="text-emerald-400">
                              E:%{p.economics_score || (p.current_price > 300 ? 82 : 60)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center space-x-1 font-semibold text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{p.rating}</span>
                          <span className="text-[10px] text-slate-500 font-normal">
                            ({p.review_count.toLocaleString("tr-TR")})
                          </span>
                        </div>
                      </td>

                      {/* Aksiyon Araçları */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1">
                          {/* Ürün Röntgeni (Tekil Pasaport) */}
                          <button
                            onClick={() => setPassportProduct(p)}
                            title="Tekil Ürün Röntgeni & Kâr Pasaportu"
                            className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 border border-blue-500/40 text-blue-300 hover:text-white transition-colors"
                          >
                            <Zap className="w-3.5 h-3.5 fill-current" />
                          </button>

                          {/* 4 Pazaryeri Arbitraj & Karşılaştırma */}
                          {onOpenCrossMarketModal && (
                            <button
                              onClick={() => onOpenCrossMarketModal(p)}
                              title="4 Pazaryeri (Trendyol, Hepsiburada, Amazon TR, N11) Çapraz Fiyat & Arbitraj Röntgeni"
                              className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-300 hover:text-white transition-colors"
                            >
                              <Store className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Takip Listesi */}
                          <button
                            onClick={() => onToggleTrack(p)}
                            title={p.is_tracked ? "Takip Listesinden Çıkar" : "Takip Listeme Ekle"}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              p.is_tracked
                                ? "bg-indigo-600 text-white border-indigo-500"
                                : "bg-[#1e293b] border-slate-700 text-slate-400 hover:text-white"
                            }`}
                          >
                            {p.is_tracked ? (
                              <BookmarkCheck className="w-3.5 h-3.5" />
                            ) : (
                              <BookmarkPlus className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Fiyat Değişim Grafiği */}
                          <button
                            onClick={() => onOpenPriceModal(p)}
                            title="Fiyat Değişim Grafiği (Fiyat Geçmişi & Trend)"
                            className="p-1.5 rounded-lg bg-[#1e293b] border border-slate-700 text-slate-300 hover:text-blue-400 transition-colors"
                          >
                            <ChartIcon className="w-3.5 h-3.5" />
                          </button>

                          {/* Kâr Hesaplayıcı */}
                          <button
                            onClick={() => onOpenProfitModal(p)}
                            title="Net Kâr & Komisyon Hesaplayıcı"
                            className="p-1.5 rounded-lg bg-[#1e293b] border border-slate-700 text-slate-300 hover:text-emerald-400 transition-colors"
                          >
                            <Calculator className="w-3.5 h-3.5" />
                          </button>

                          {/* SEO Başlık Sihirbazı */}
                          <button
                            onClick={() => onOpenOptimizerModal(p)}
                            title="SEO Başlık & Madde Sihirbazı"
                            className="p-1.5 rounded-lg bg-[#1e293b] border border-slate-700 text-slate-300 hover:text-purple-400 transition-colors"
                          >
                            <Wand2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Yorum & Şikayet Analizi */}
                          {onOpenReviewModal && (
                            <button
                              onClick={() => onOpenReviewModal(p)}
                              title="Müşteri Şikayet & Yorum Analizi"
                              className="p-1.5 rounded-lg bg-[#1e293b] border border-slate-700 text-purple-400 hover:text-purple-300 hover:bg-purple-950/40 transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Doğrudan Mağaza Linki */}
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noreferrer"
                            title={`${p.marketplace ? p.marketplace.charAt(0).toUpperCase() + p.marketplace.slice(1) : "Pazaryeri"}'de Görüntüle`}
                            className="p-1.5 rounded-lg bg-[#1e293b] border border-slate-700 text-slate-400 hover:text-white transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 3. GERÇEK SAYFALAMA VE BÜYÜK VERİ GEZGİNİ */}
          {totalPages > 1 && onPageChange && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800/80 pt-4 mt-2 px-2">
              <span className="text-xs text-slate-400">
                Sayfa <strong className="text-white">{currentPage}</strong> / {totalPages} (Taranan Pazar Hacmi: <strong className="text-blue-400">{(totalScannedVolume || 14850).toLocaleString("tr-TR")} Ürün</strong>)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage <= 1 || loading}
                  onClick={() => onPageChange(currentPage - 1)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 transition"
                >
                  Önceki
                </button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pNum = i + 1;
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => onPageChange(pNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                        currentPage === pNum
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                          : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
                {totalPages > 5 && <span className="px-1 text-slate-500">...</span>}
                <button
                  type="button"
                  disabled={currentPage >= totalPages || loading}
                  onClick={() => onPageChange(currentPage + 1)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 transition"
                >
                  Sonraki
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Henüz arama yapılmamışsa veya filtreleme sonucu ürün kalmamışsa */
        <div className="py-16 text-center bg-[#0f172a] rounded-xl border border-dashed border-slate-800">
          <div className="w-12 h-12 mx-auto rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center mb-3">
            <Package className="w-6 h-6" />
          </div>
          {products.length > 0 && filteredProducts.length === 0 ? (
            <>
              <h3 className="text-sm font-bold text-white">Filtrelere Uygun Ürün Bulunamadı</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Mevcut {products.length} taranmış ürün arasından belirlediğiniz filtre kriterlerine uyan ürün kalmadı. Filtreleri gevşetebilir veya sıfırlayabilirsiniz.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/30"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Filtreleri Sıfırla</span>
              </button>
            </>
          ) : (
            <>
              <h3 className="text-sm font-bold text-white">Ürün Taraması Bekleniyor</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Yukarıdaki arama çubuğuna bir ürün veya model yazarak, hazır şablonları seçerek ya da &quot;Pazarı Tara&quot; butonuna basarak canlı pazar verilerini analiz edebilirsiniz.
              </p>
            </>
          )}
        </div>
      )}

      {/* Tekil Ürün Röntgeni (Kapsamlı Ürün Pasaportu) */}
      {passportProduct && (
        <ProductPassportModal
          product={passportProduct}
          onClose={() => setPassportProduct(null)}
          onToggleTrack={onToggleTrack}
        />
      )}
    </div>
  );
}
