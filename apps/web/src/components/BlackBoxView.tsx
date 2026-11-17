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
  SlidersHorizontal,
  ChevronDown,
  RefreshCw,
  CheckSquare,
  Square,
  ShieldCheck,
  Info,
  Sparkles,
  Download,
  BarChart3,
  Layers,
  Activity,
  Check,
  ArrowRight,
  Eye,
} from "lucide-react";
import ProductPassportModal from "./ProductPassportModal";
import MarketChartsPanel from "./MarketChartsPanel";
import VigoRadarFilterPanel, {
  VigoRadarFilterCriteria,
  INITIAL_VIGO_FILTERS,
  DATAVIGO_CATEGORY_TREE,
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

  // DataVigo VigoRadar İleri Metrikleri
  bsr_rank?: number;
  family_sales?: number;
  family_revenue?: number;
  sales_review_ratio?: number;
  estimated_fba_fee?: number;
  seller_count?: number;
  listing_quality_score?: number;
  weight_kg?: number;
  desi?: number;
  is_fba?: boolean;
  shipping_cost?: number;
  landed_price?: number;
  days_on_market?: number;
  review_growth_pct?: number;
  sales_growth_pct?: number;
  negative_topic_pct?: number;
  badges?: string[];
}

interface BlackBoxViewProps {
  products: Product[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedMarketplace?: string;
  setSelectedMarketplace?: (mp: string) => void;
  onSearch: (
    q?: string,
    category?: string,
    forceRefresh?: boolean,
    marketplaceOverride?: string,
    criteria?: VigoRadarFilterCriteria
  ) => void;
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

// Varsayılan DataVigo Görünür Sütunları
const DEFAULT_VISIBLE_COLUMNS = new Set([
  "variationSold",
  "revenue",
  "price",
  "discountPercent",
  "categoryRank",
  "reviewCount",
  "rating",
  "offerCount",
  "opportunity",
]);

export default function BlackBoxView({
  products,
  loading,
  searchQuery,
  setSearchQuery,
  selectedMarketplace: propMarketplace = "trendyol",
  setSelectedMarketplace: propSetMarketplace,
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
  isDeepScan = true,
  onPageChange,
  onToggleDeepScan,
  scraperStats,
}: BlackBoxViewProps) {
  // Pazaryeri seçimi (Butona tıklandığında hemen arama BAŞLAMAZ, yalnızca seçim güncellenir)
  const [localMarketplace, setLocalMarketplace] = useState<string>(propMarketplace || "trendyol");
  const currentMarketplace = propMarketplace || localMarketplace;
  const setMarketplace = propSetMarketplace || setLocalMarketplace;

  const handleMarketplaceChange = (mp: string) => {
    setMarketplace(mp);
    setLocalMarketplace(mp);
  };

  // Kategori seçimi
  const [localCategory, setLocalCategory] = useState("Tüm Kategoriler");
  const currentCategory = propCategory || localCategory;
  const setCategory = propSetCategory || setLocalCategory;

  // Görünüm Modu: Tablo veya Kart
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  // Filtreler State
  const [appliedFilters, setAppliedFilters] = useState<VigoRadarFilterCriteria>(INITIAL_VIGO_FILTERS);

  // Sıralama State
  const [sortField, setSortField] = useState<string>("opportunity");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Mükerrer / Kopya Temizleme (Aileleri Birleştir)
  const [deduplicate, setDeduplicate] = useState(false);

  // Sonuçlarda arama (Local Table Filter)
  const [resultsFilterQuery, setResultsFilterQuery] = useState("");

  // Sütun Seçici State
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(DEFAULT_VISIBLE_COLUMNS));
  const [isColumnPickerOpen, setIsColumnPickerOpen] = useState(false);

  // Çoklu Seçim
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Detay Modalları
  const [selectedProductForPassport, setSelectedProductForPassport] = useState<Product | null>(null);
  const [showCharts, setShowCharts] = useState(false);

  // Fırsat Önerileri
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Aktif Kriter Sayısı
  const activeFilterCount = useMemo(() => {
    let count = 0;
    const f = appliedFilters;
    if (f.minPrice || f.maxPrice) count++;
    if (f.minSales || f.maxSales) count++;
    if (f.minFamilySales || f.maxFamilySales) count++;
    if (f.minRevenue || f.maxRevenue) count++;
    if (f.minBsr || f.maxBsr) count++;
    if (f.minDiscountPercent || f.maxDiscountPercent) count++;
    if (f.minSalesReviewRatio || f.maxSalesReviewRatio) count++;
    if (f.minReviews || f.maxReviews) count++;
    if (f.minRating || f.maxRating) count++;
    if (f.minVariationCount || f.maxVariationCount) count++;
    if (f.minDaysOnMarket || f.maxDaysOnMarket) count++;
    if (f.minListingQualityScore || f.maxListingQualityScore) count++;
    if (f.badges && f.badges.length > 0) count += f.badges.length;
    if (f.minOfferCount || f.maxOfferCount) count++;
    if (f.amazonOffer) count++;
    if (f.fbaOffer) count++;
    if (f.fbmOffer) count++;
    if (f.hasPromotion) count++;
    if (f.includeBrands) count++;
    if (f.excludeBrands) count++;
    if (f.includeKeywords) count++;
    if (f.excludeKeywords) count++;
    if (f.minFbaFee || f.maxFbaFee) count++;
    if (f.minWeightKg || f.maxWeightKg) count++;
    if (f.minShippingPrice || f.maxShippingPrice) count++;
    if (f.minLandedPrice || f.maxLandedPrice) count++;
    if (f.shippingMethods && f.shippingMethods.length > 0) count += f.shippingMethods.length;
    if (f.primeOnly) count++;
    if (f.selectedCategories && f.selectedCategories.length > 0) count++;
    return count;
  }, [appliedFilters]);

  // Arama Tetikleyici (Kategori veya Kelime ile)
  const triggerSearch = (
    forceRefresh: boolean = false,
    categoryOverride?: string,
    marketplaceOverride?: string,
    criteriaOverride?: VigoRadarFilterCriteria
  ) => {
    const cat = categoryOverride !== undefined ? categoryOverride : currentCategory;
    const mp = marketplaceOverride !== undefined ? marketplaceOverride : currentMarketplace;
    const crit = criteriaOverride !== undefined ? criteriaOverride : appliedFilters;
    onSearch(searchQuery, cat, forceRefresh, mp, crit);
  };

  // Filtre Panelinden "Ürünleri Keşfet"e tıklandığında (Arama SADECE burada başlar!)
  const handleApplyRadarFilters = (criteria: VigoRadarFilterCriteria) => {
    setAppliedFilters(criteria);

    // Seçilen kategorilerden bir arama hedefi belirle
    let targetCategory = currentCategory;
    if (criteria.selectedCategories.length > 0) {
      const firstId = criteria.selectedCategories[0];
      for (const node of DATAVIGO_CATEGORY_TREE) {
        if (node.id === firstId) {
          targetCategory = node.nameTr;
          break;
        }
        const sub = node.children?.find((c) => c.id === firstId);
        if (sub) {
          targetCategory = sub.nameTr;
          break;
        }
      }
      setCategory(targetCategory);
    }

    // Arama SADECE burada tetiklenir: Seçilen pazaryeri ve girilen filtrelerle!
    triggerSearch(true, targetCategory, currentMarketplace, criteria);
  };

  const handleResetFilters = () => {
    setAppliedFilters(INITIAL_VIGO_FILTERS);
  };

  const toggleColumnVisibility = (colKey: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(colKey)) {
        next.delete(colKey);
      } else {
        next.add(colKey);
      }
      return next;
    });
  };

  const resetToDefaultColumns = () => {
    setVisibleColumns(new Set(DEFAULT_VISIBLE_COLUMNS));
  };

  // İstemci tarafı dinamik süzme, metrik hesaplama ve sıralama
  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => {
      // 0. Pazaryeri Uygunluğu: Seçili pazaryeriyle tam eşleşme (Trendyol seçiliyken ASLA Hepsiburada gösterilmez)
      const pMp = (p.marketplace || "").toLowerCase();
      const targetMp = (currentMarketplace || "trendyol").toLowerCase();
      if (targetMp === "amazon" || targetMp === "amazon tr") {
        if (!pMp.includes("amazon")) return false;
      } else if (targetMp !== "all") {
        if (pMp !== targetMp) return false;
      }

      const f = appliedFilters;

      // 1. Satış & Performans Filtreleri
      if (f.minPrice && p.current_price < parseFloat(f.minPrice)) return false;
      if (f.maxPrice && p.current_price > parseFloat(f.maxPrice)) return false;
      if (f.minSales && p.estimated_monthly_sales < parseInt(f.minSales, 10)) return false;
      if (f.maxSales && p.estimated_monthly_sales > parseInt(f.maxSales, 10)) return false;
      if (f.minFamilySales && (p.family_sales || p.estimated_monthly_sales) < parseInt(f.minFamilySales, 10)) return false;
      if (f.maxFamilySales && (p.family_sales || p.estimated_monthly_sales) > parseInt(f.maxFamilySales, 10)) return false;
      if (f.minRevenue && p.estimated_monthly_revenue < parseFloat(f.minRevenue)) return false;
      if (f.maxRevenue && p.estimated_monthly_revenue > parseFloat(f.maxRevenue)) return false;

      // İndirim Oranı
      if (f.minDiscountPercent || f.maxDiscountPercent) {
        const discount = p.original_price && p.original_price > p.current_price
          ? Math.round(((p.original_price - p.current_price) / p.original_price) * 100)
          : 0;
        if (f.minDiscountPercent && discount < parseFloat(f.minDiscountPercent)) return false;
        if (f.maxDiscountPercent && discount > parseFloat(f.maxDiscountPercent)) return false;
      }

      // BSR
      if (f.minBsr && (p.bsr_rank || 9999) < parseInt(f.minBsr, 10)) return false;
      if (f.maxBsr && (p.bsr_rank || 9999) > parseInt(f.maxBsr, 10)) return false;

      // Satış/Yorum Oranı
      if (f.minSalesReviewRatio || f.maxSalesReviewRatio) {
        const ratio = p.sales_review_ratio || (p.review_count > 0 ? p.estimated_monthly_sales / p.review_count : p.estimated_monthly_sales);
        if (f.minSalesReviewRatio && ratio < parseFloat(f.minSalesReviewRatio)) return false;
        if (f.maxSalesReviewRatio && ratio > parseFloat(f.maxSalesReviewRatio)) return false;
      }

      // 2. Ürün & Yorum Filtreleri
      if (f.minReviews && p.review_count < parseInt(f.minReviews, 10)) return false;
      if (f.maxReviews && p.review_count > parseInt(f.maxReviews, 10)) return false;
      if (f.minRating && p.rating < parseFloat(f.minRating)) return false;
      if (f.maxRating && p.rating > parseFloat(f.maxRating)) return false;
      if (f.minDaysOnMarket && (p.days_on_market || 100) < parseInt(f.minDaysOnMarket, 10)) return false;
      if (f.maxDaysOnMarket && (p.days_on_market || 100) > parseInt(f.maxDaysOnMarket, 10)) return false;
      if (f.minListingQualityScore && (p.listing_quality_score || 80) < parseInt(f.minListingQualityScore, 10)) return false;

      // Rozetler
      if (f.badges && f.badges.length > 0) {
        const pBadges = p.badges || [];
        for (const b of f.badges) {
          if (b === "best_seller" && !pBadges.includes("best_seller") && p.estimated_monthly_sales < 200) return false;
          if (b === "choice" && !pBadges.includes("choice") && p.rating < 4.4) return false;
          if (b === "new_release" && !pBadges.includes("new_release") && (p.days_on_market || 100) > 90) return false;
        }
      }

      // 3. Rekabet & Marka Filtreleri
      if (f.minOfferCount && (p.seller_count || 1) < parseInt(f.minOfferCount, 10)) return false;
      if (f.maxOfferCount && (p.seller_count || 1) > parseInt(f.maxOfferCount, 10)) return false;
      if (f.fbaOffer === "yes" && !p.is_fba) return false;
      if (f.fbaOffer === "no" && p.is_fba) return false;

      const pBrand = (p.brand || "").toLowerCase().trim();
      if (f.includeBrands) {
        const inc = f.includeBrands.toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);
        if (inc.length > 0 && !inc.some((b) => pBrand.includes(b))) return false;
      }
      if (f.excludeBrands) {
        const exc = f.excludeBrands.toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);
        if (exc.length > 0 && exc.some((b) => pBrand.includes(b))) return false;
      }

      // Kelime Dahil / Hariç
      const pTitle = (p.title || "").toLowerCase();
      if (f.includeKeywords) {
        const incWords = f.includeKeywords.toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);
        if (incWords.length > 0) {
          if (f.keywordMatchMode === "all") {
            if (!incWords.every((w) => pTitle.includes(w))) return false;
          } else {
            if (!incWords.some((w) => pTitle.includes(w))) return false;
          }
        }
      }
      if (f.excludeKeywords) {
        const excWords = f.excludeKeywords.toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);
        if (excWords.length > 0 && excWords.some((w) => pTitle.includes(w))) return false;
      }

      // 4. Lojistik Filtreleri
      if (f.minFbaFee && (p.estimated_fba_fee || 0) < parseFloat(f.minFbaFee)) return false;
      if (f.maxFbaFee && (p.estimated_fba_fee || 0) > parseFloat(f.maxFbaFee)) return false;
      if (f.minShippingPrice && (p.shipping_cost || 0) < parseFloat(f.minShippingPrice)) return false;
      if (f.maxShippingPrice && (p.shipping_cost || 0) > parseFloat(f.maxShippingPrice)) return false;
      if (f.primeOnly && !p.is_fba) return false;

      // Sonuçlar içi hızlı arama kutusu
      if (resultsFilterQuery.trim()) {
        const q = resultsFilterQuery.toLowerCase().trim();
        const matchTitle = pTitle.includes(q);
        const matchBrand = pBrand.includes(q);
        const matchAsin = (p.external_id || "").toLowerCase().includes(q);
        if (!matchTitle && !matchBrand && !matchAsin) return false;
      }

      return true;
    });

    // Aileleri Birleştir (Mükerrer Ayıklama)
    if (deduplicate) {
      const seen = new Set<string>();
      list = list.filter((p) => {
        const key = `${(p.brand || "brand").toLowerCase()}_${(p.title || "").slice(0, 20).toLowerCase()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    // Sıralama
    return list.sort((a, b) => {
      let valA: any = 0;
      let valB: any = 0;

      switch (sortField) {
        case "variationSold":
          valA = a.estimated_monthly_sales;
          valB = b.estimated_monthly_sales;
          break;
        case "revenue":
          valA = a.estimated_monthly_revenue;
          valB = b.estimated_monthly_revenue;
          break;
        case "price":
          valA = a.current_price;
          valB = b.current_price;
          break;
        case "originalPrice":
          valA = a.original_price || a.current_price;
          valB = b.original_price || b.current_price;
          break;
        case "categoryRank":
          valA = a.bsr_rank || 99999;
          valB = b.bsr_rank || 99999;
          break;
        case "reviewCount":
          valA = a.review_count;
          valB = b.review_count;
          break;
        case "rating":
          valA = a.rating;
          valB = b.rating;
          break;
        case "efficiency":
          valA = a.sales_review_ratio || 0;
          valB = b.sales_review_ratio || 0;
          break;
        case "offerCount":
          valA = a.seller_count || 1;
          valB = b.seller_count || 1;
          break;
        default:
          valA = a.opportunity_score;
          valB = b.opportunity_score;
          break;
      }

      if (sortDirection === "asc") {
        return valA > valB ? 1 : -1;
      }
      return valA < valB ? 1 : -1;
    });
  }, [products, appliedFilters, deduplicate, resultsFilterQuery, sortField, sortDirection]);

  // Ortalama ve Medyan Fiyat Hesaplama
  const avgPrice = useMemo(() => {
    if (filteredProducts.length === 0) return 0;
    return filteredProducts.reduce((acc, p) => acc + p.current_price, 0) / filteredProducts.length;
  }, [filteredProducts]);

  const medianPrice = useMemo(() => {
    if (filteredProducts.length === 0) return 0;
    const sorted = [...filteredProducts].map((p) => p.current_price).sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)] || 0;
  }, [filteredProducts]);

  // Çoklu Seçim
  const handleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.external_id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // CSV Dışa Aktarma
  const handleExportToExcel = () => {
    if (filteredProducts.length === 0) return;
    const headers = [
      "ID",
      "Pazaryeri",
      "Başlık",
      "Marka",
      "Kategori",
      "Fiyat",
      "Para Birimi",
      "Aylık Tahmini Satış",
      "Aylık Tahmini Ciro",
      "Fırsat Puanı",
      "BSR",
      "Değerlendirme",
      "Yorum Sayısı",
      "Satıcı Sayısı",
      "Ürün Linki",
    ];

    const rows = filteredProducts.map((p) => [
      `"${p.external_id}"`,
      `"${p.marketplace}"`,
      `"${(p.title || "").replace(/"/g, '""')}"`,
      `"${(p.brand || "").replace(/"/g, '""')}"`,
      `"${(p.category_name || "").replace(/"/g, '""')}"`,
      p.current_price,
      `"${p.currency}"`,
      p.estimated_monthly_sales,
      p.estimated_monthly_revenue,
      p.opportunity_score,
      p.bsr_rank || 1,
      p.rating,
      p.review_count,
      p.seller_count || 1,
      `"${p.url}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((e) => e.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `VigoRadar_Urunler_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="vr-workspace space-y-4 font-sans text-slate-100" data-testid="radar-research">
      {/* ============================================================
          1. WORKSPACE HEADING: BAŞLIK & REHBER POPOVER (DataVigo vr-workspace-heading)
          ============================================================ */}
      <div className="vr-workspace-heading flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1424] border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg">
        <div>
          <span className="vr-eyebrow text-[11px] font-black uppercase tracking-wider text-blue-400 block mb-0.5">
            ARAŞTIRMA ÇALIŞMA ALANI
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Bir sonraki ürün fırsatını keşfet.
          </h2>
        </div>

        {/* Nasıl Kullanılır? Popover */}
        <details className="vr-popover vr-guide relative inline-block">
          <summary className="cursor-pointer list-none flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-[#060a14] px-3.5 py-2 rounded-xl border border-slate-700/80 transition shadow-xs">
            <Info className="w-4 h-4 text-blue-400" />
            <span>Nasıl kullanılır?</span>
          </summary>
          <div className="vr-popover-panel absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#0a0f1d] border border-slate-700 rounded-2xl p-4 shadow-2xl z-50 text-xs space-y-2.5 animate-fadeIn">
            <strong className="text-white block text-sm font-black border-b border-slate-800 pb-1.5">
              Üç adımda ürün araştırması
            </strong>
            <ol className="list-decimal pl-4 space-y-1.5 text-slate-300 leading-relaxed font-medium">
              <li>Pazaryerini ve bir veya daha fazla kategoriyi seç.</li>
              <li>Bir hazır filtreyle başla veya kendi kriterlerini belirle.</li>
              <li>Ürünleri tara, sonuçları karşılaştır ve VigoScope’ta detaylı incele.</li>
            </ol>
            <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 leading-relaxed">
              Filtreler taranan ürünlere uygulanır. Varyasyon satışı tek bir varyasyonun, aile satışı ise varyasyon ailesinin aylık tahminidir. Eksik veriler “—” ile gösterilir.
            </p>
          </div>
        </details>
      </div>

      {/* ============================================================
          2. VIGORADAR FILTER PANEL (DataVigo 4-Bloklu Izgara, Kategori Ağacı, Presetler)
          ============================================================ */}
      <div className="bg-[#0b101e] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <VigoRadarFilterPanel
          onApplyFilters={handleApplyRadarFilters}
          onResetFilters={handleResetFilters}
          activeCount={activeFilterCount}
          selectedMarketplace={currentMarketplace}
          onMarketplaceChange={handleMarketplaceChange}
        />
      </div>

      {/* ============================================================
          3. PAZAR RADARI DURUM ÇUBUĞU & HIZLI KONTROLLER
          ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1424] border border-slate-800 p-3.5 rounded-xl text-xs">
        {/* Canlı Pazar Dağılımı Rozetleri */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 font-bold flex items-center gap-1.5 mr-1">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            Pazar Radarı:
          </span>
          <span className="px-2.5 py-0.5 rounded-full font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30">
            Trendyol {scraperStats?.trendyol !== undefined ? `(${scraperStats.trendyol})` : ""}
          </span>
          <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Hepsiburada {scraperStats?.hepsiburada !== undefined ? `(${scraperStats.hepsiburada})` : ""}
          </span>
          <span className="px-2.5 py-0.5 rounded-full font-bold bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
            Amazon TR {scraperStats?.amazon !== undefined ? `(${scraperStats.amazon})` : ""}
          </span>
          <span className="px-2.5 py-0.5 rounded-full font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            N11 {scraperStats?.n11 !== undefined ? `(${scraperStats.n11})` : ""}
          </span>
        </div>

        {/* Sağ: Grafikler & Canlı Yenile */}
        <div className="flex items-center gap-2 justify-end">
          {filteredProducts.length > 0 && (
            <button
              type="button"
              onClick={() => setShowCharts(!showCharts)}
              className={`px-3 py-1.5 rounded-lg border font-bold text-xs flex items-center gap-1.5 transition ${
                showCharts
                  ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20"
                  : "bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/40 text-blue-300"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{showCharts ? "Grafikleri Gizle" : "Pazar Grafikleri"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => triggerSearch(true)}
            disabled={loading}
            title="15 dakikalık önbelleği atlayıp pazaryerlerini anlık kazı (canlı veri çek)"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-bold text-xs transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Canlı Yenile</span>
          </button>
        </div>
      </div>

      {/* Pazar Analiz Grafikleri Paneli */}
      {showCharts && filteredProducts.length > 0 && (
        <MarketChartsPanel
          products={filteredProducts}
          medianPrice={medianPrice}
          avgPrice={avgPrice}
        />
      )}

      {/* ============================================================
          4. RESULTS SECTION: SONUÇLAR BÖLÜMÜ (DataVigo vr-results)
          ============================================================ */}
      <section className="vr-results bg-[#0b101e] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4" aria-labelledby="vr-results-heading">
        {/* Sonuçlar Başlığı & Görünüm Değiştirici */}
        <div className="vr-results-heading flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div>
            <span className="vr-eyebrow text-[10px] font-black uppercase tracking-wider text-emerald-400 block mb-0.5">
              KEŞİFTEN KARARA
            </span>
            <h2 id="vr-results-heading" className="text-lg font-black text-white">
              Araştırma sonuçları
            </h2>
            <p className="text-xs text-slate-400">
              Talebi, rekabeti ve ürün potansiyelini aynı tabloda karşılaştırın.
            </p>
          </div>

          {/* Tablo / Kart Görünüm Butonları */}
          <div className="vr-view-toggle flex items-center p-1 bg-[#060a14] border border-slate-800 rounded-xl">
            <button
              type="button"
              aria-label="Tablo görünümü"
              aria-pressed={viewMode === "table"}
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition ${
                viewMode === "table" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
              title="Tablo görünümü"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 5h.01"></path><path d="M3 12h.01"></path><path d="M3 19h.01"></path>
                <path d="M8 5h13"></path><path d="M8 12h13"></path><path d="M8 19h13"></path>
              </svg>
            </button>
            <button
              type="button"
              aria-label="Kart görünümü"
              aria-pressed={viewMode === "card"}
              onClick={() => setViewMode("card")}
              className={`p-1.5 rounded-lg transition ${
                viewMode === "card" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
              title="Kart görünümü"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect>
                <rect width="7" height="7" x="14" y="14" rx="1"></rect><rect width="7" height="7" x="3" y="14" rx="1"></rect>
              </svg>
            </button>
          </div>
        </div>

        {/* Sonuçlar Araç Çubuğu (vr-results-toolbar) */}
        <div className="vr-results-toolbar flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Sonuçlarda Ara Inputu */}
          <div className="vr-inline-search relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              aria-label="Sonuçlarda ara"
              placeholder="Ürün, ASIN veya marka ara…"
              value={resultsFilterQuery}
              onChange={(e) => setResultsFilterQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#060a14] border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Araç Çubuğu Aksiyonları */}
          <div className="vr-toolbar-actions flex items-center gap-2 flex-wrap justify-end text-xs">
            {/* Aileleri Birleştir Checkbox */}
            <label className="vr-check flex items-center gap-1.5 text-slate-300 font-semibold cursor-pointer px-2 py-1 bg-[#060a14] rounded-lg border border-slate-800">
              <input
                type="checkbox"
                checked={deduplicate}
                onChange={(e) => setDeduplicate(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
              />
              <span>Aileleri birleştir</span>
            </label>

            {/* Sırala Dropdown & Yön Butonu */}
            <div className="vr-sort flex items-center gap-1.5 bg-[#060a14] border border-slate-800 px-2.5 py-1 rounded-lg">
              <span className="text-slate-400 font-semibold">Sırala:</span>
              <select
                aria-label="Sıralama metriği"
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
              >
                <option value="opportunity" className="bg-[#0b101e]">Fırsat Puanı</option>
                <option value="variationSold" className="bg-[#0b101e]">Varyasyon satışı · tahmini</option>
                <option value="revenue" className="bg-[#0b101e]">Aile aylık cirosu · tahmini</option>
                <option value="price" className="bg-[#0b101e]">Satış fiyatı</option>
                <option value="originalPrice" className="bg-[#0b101e]">İndirim öncesi fiyat</option>
                <option value="categoryRank" className="bg-[#0b101e]">Çok satanlar sırası (BSR)</option>
                <option value="efficiency" className="bg-[#0b101e]">Satış / yorum oranı</option>
                <option value="reviewCount" className="bg-[#0b101e]">Yorum sayısı</option>
                <option value="rating" className="bg-[#0b101e]">Değerlendirme puanı</option>
                <option value="offerCount" className="bg-[#0b101e]">Satıcı teklifi sayısı</option>
              </select>

              <button
                type="button"
                className="vr-icon-button p-1 hover:text-white text-slate-400 transition"
                aria-label={sortDirection === "asc" ? "Artan sıralama" : "Azalan sıralama"}
                onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                title={sortDirection === "asc" ? "Artan" : "Azalan"}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sütunlar Popover (vr-column-picker) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsColumnPickerOpen(!isColumnPickerOpen)}
                className="px-2.5 py-1.5 rounded-lg bg-[#060a14] border border-slate-800 text-slate-300 hover:text-white font-semibold flex items-center gap-1.5 transition"
              >
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Sütunlar</span>
              </button>

              {isColumnPickerOpen && (
                <div className="vr-popover-panel absolute right-0 top-full mt-2 w-72 bg-[#0a0f1d] border border-slate-700 rounded-xl p-3.5 shadow-2xl z-50 text-xs space-y-2 animate-fadeIn max-h-80 overflow-y-auto">
                  <strong className="text-white block font-bold border-b border-slate-800 pb-1.5">
                    Görünür sütunlar
                  </strong>

                  <div className="space-y-1">
                    {[
                      { key: "variationSold", label: "Varyasyon satışı · tahmini" },
                      { key: "revenue", label: "Aile aylık cirosu · tahmini" },
                      { key: "price", label: "Satış fiyatı" },
                      { key: "discountPercent", label: "İndirim oranı" },
                      { key: "categoryRank", label: "Çok satanlar sırası (BSR)" },
                      { key: "efficiency", label: "Satış / yorum oranı" },
                      { key: "reviewCount", label: "Yorum sayısı" },
                      { key: "rating", label: "Değerlendirme puanı" },
                      { key: "offerCount", label: "Satıcı teklifi sayısı" },
                      { key: "fbaFee", label: "FBA / Komisyon ücreti" },
                      { key: "opportunity", label: "Fırsat Puanı" },
                    ].map((col) => (
                      <label key={col.key} className="flex items-center gap-2 py-0.5 cursor-pointer text-slate-300 hover:text-white">
                        <input
                          type="checkbox"
                          checked={visibleColumns.has(col.key)}
                          onChange={() => toggleColumnVisibility(col.key)}
                          className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                        />
                        <span>{col.label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={resetToDefaultColumns}
                      className="text-[11px] text-blue-400 hover:underline"
                    >
                      Varsayılanlara dön
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsColumnPickerOpen(false)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[11px] font-bold"
                    >
                      Kapat
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* CSV Dışa Aktar */}
            <button
              type="button"
              onClick={handleExportToExcel}
              disabled={filteredProducts.length === 0}
              className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1.5 transition disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* ----------------- GÖRÜNÜM ALANI (EMPTY, TABLO, KART) ----------------- */}
        {products.length === 0 && !loading ? (
          /* ============================================================
             DATAVIGO ORİJİNAL BOŞ DURUM (vr-empty)
             ============================================================ */
          <div className="vr-empty py-16 text-center space-y-4">
            <div className="vr-radar-art flex justify-center items-center" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-500/80 animate-pulse"
              >
                <path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"></path>
                <path d="M4 6h.01"></path>
                <path d="M2.29 9.62A10 10 0 1 0 21.31 8.35"></path>
                <path d="M16.24 7.76A6 6 0 1 0 8.23 16.67"></path>
                <path d="M12 18h.01"></path>
                <path d="M17.99 11.66A6 6 0 0 1 15.77 16.67"></path>
                <circle cx="12" cy="12" r="2"></circle>
                <path d="m13.41 10.59 5.66-5.66"></path>
              </svg>
            </div>

            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-base font-black text-white">
                İyi bir ürün, doğru sorularla bulunur.
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Kategorinizi seçin, kriterlerinizi belirleyin. Satıştan rekabete, karar vermek için gereken verileri bir araya getirelim.
              </p>
            </div>

            {/* 3 Adım */}
            <div className="vr-empty-steps inline-flex items-center gap-3 text-xs text-slate-400 bg-[#060a14] px-5 py-2.5 rounded-2xl border border-slate-800">
              <span className="flex items-center gap-1.5">
                <b className="text-blue-400 font-mono">01</b> Kategorini seç
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="flex items-center gap-1.5">
                <b className="text-amber-400 font-mono">02</b> Kriterlerini belirle
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="flex items-center gap-1.5">
                <b className="text-emerald-400 font-mono">03</b> Fırsatları karşılaştır
              </span>
            </div>
          </div>
        ) : filteredProducts.length === 0 && !loading ? (
          /* Filtreler çok sıkıysa ve ürün kalmadıysa */
          <div className="py-12 text-center bg-[#060a14] rounded-xl border border-dashed border-slate-800 space-y-3">
            <Package className="w-10 h-10 mx-auto text-slate-500" />
            <h4 className="text-sm font-bold text-white">Filtrelere Uygun Ürün Kalmadı</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Taranan {products.length} ürün içerisinden belirlediğiniz kriterleri karşılayan ürün bulunamadı.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs"
            >
              Filtreleri Sıfırla
            </button>
          </div>
        ) : viewMode === "table" ? (
          /* ============================================================
             DATAVIGO PROFESYONEL TABLO GÖRÜNÜMÜ
             ============================================================ */
          <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-[#080d19]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#050811] text-slate-400 font-bold border-b border-slate-800 text-[11px] select-none">
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                    />
                  </th>
                  <th className="py-3 px-3 min-w-[280px]">Ürün Detayı</th>
                  {visibleColumns.has("variationSold") && <th className="py-3 px-3 text-right">Aylık Satış</th>}
                  {visibleColumns.has("revenue") && <th className="py-3 px-3 text-right">Aylık Ciro</th>}
                  {visibleColumns.has("price") && <th className="py-3 px-3 text-right">Fiyat</th>}
                  {visibleColumns.has("discountPercent") && <th className="py-3 px-3 text-right">İndirim</th>}
                  {visibleColumns.has("categoryRank") && <th className="py-3 px-3 text-center">BSR</th>}
                  {visibleColumns.has("reviewCount") && <th className="py-3 px-3 text-right">Yorum</th>}
                  {visibleColumns.has("rating") && <th className="py-3 px-3 text-center">Puan</th>}
                  {visibleColumns.has("offerCount") && <th className="py-3 px-3 text-center">Satıcı</th>}
                  {visibleColumns.has("fbaFee") && <th className="py-3 px-3 text-right">Komisyon</th>}
                  {visibleColumns.has("opportunity") && <th className="py-3 px-3 text-center">Fırsat</th>}
                  <th className="py-3 px-3 text-center w-28">Aksiyon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts.map((p) => {
                  const isSelected = selectedIds.includes(p.external_id);
                  const discount = p.original_price && p.original_price > p.current_price
                    ? Math.round(((p.original_price - p.current_price) / p.original_price) * 100)
                    : 0;

                  return (
                    <tr
                      key={`${p.marketplace}:${p.external_id}`}
                      className={`hover:bg-[#0c1424] transition-colors ${
                        isSelected ? "bg-blue-950/20" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(p.external_id)}
                          className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                        />
                      </td>

                      {/* Ürün Bilgisi */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt={p.title}
                              className="w-12 h-12 rounded-lg object-cover bg-slate-900 border border-slate-700 shrink-0"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-slate-500">
                              <Package className="w-5 h-5" />
                            </div>
                          )}

                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                                {p.marketplace}
                              </span>
                              {p.brand && (
                                <span className="text-[11px] font-bold text-blue-400 truncate max-w-[140px]">
                                  {p.brand}
                                </span>
                              )}
                              {p.category_name && (
                                <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                                  • {p.category_name}
                                </span>
                              )}
                            </div>

                            <a
                              href={p.url}
                              target="_blank"
                              rel="noreferrer"
                              className="font-semibold text-white hover:text-blue-400 transition-colors line-clamp-1 block text-xs"
                              title={p.title}
                            >
                              {p.title}
                            </a>

                            <div className="text-[10px] font-mono text-slate-500 flex items-center gap-2">
                              <span>ID: {p.external_id}</span>
                              {p.seller_name && <span>Satıcı: {p.seller_name}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Varyasyon / Aylık Satış */}
                      {visibleColumns.has("variationSold") && (
                        <td className="py-3 px-3 text-right">
                          <span className="font-extrabold text-white text-xs">
                            {p.estimated_monthly_sales.toLocaleString("tr-TR")}
                          </span>
                          <span className="text-[10px] text-slate-500 block">adet/ay</span>
                        </td>
                      )}

                      {/* Aile / Aylık Ciro */}
                      {visibleColumns.has("revenue") && (
                        <td className="py-3 px-3 text-right">
                          <span className="font-extrabold text-emerald-400 text-xs">
                            {p.estimated_monthly_revenue.toLocaleString("tr-TR", { maximumFractionDigits: 0 })} {p.currency === "USD" ? "$" : "₺"}
                          </span>
                        </td>
                      )}

                      {/* Fiyat */}
                      {visibleColumns.has("price") && (
                        <td className="py-3 px-3 text-right">
                          <span className="font-bold text-white text-xs">
                            {p.current_price.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {p.currency === "USD" ? "$" : "₺"}
                          </span>
                          {p.original_price && p.original_price > p.current_price && (
                            <span className="text-[10px] text-slate-500 line-through block">
                              {p.original_price} {p.currency === "USD" ? "$" : "₺"}
                            </span>
                          )}
                        </td>
                      )}

                      {/* İndirim */}
                      {visibleColumns.has("discountPercent") && (
                        <td className="py-3 px-3 text-right">
                          {discount > 0 ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                              %{discount}
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                      )}

                      {/* BSR */}
                      {visibleColumns.has("categoryRank") && (
                        <td className="py-3 px-3 text-center">
                          <span className="font-mono text-xs text-amber-300 font-bold">
                            #{p.bsr_rank || 1}
                          </span>
                        </td>
                      )}

                      {/* Yorum Sayısı */}
                      {visibleColumns.has("reviewCount") && (
                        <td className="py-3 px-3 text-right text-xs text-slate-300 font-semibold">
                          {p.review_count.toLocaleString("tr-TR")}
                        </td>
                      )}

                      {/* Puan */}
                      {visibleColumns.has("rating") && (
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-bold text-amber-400">
                            <Star className="w-3 h-3 fill-current" />
                            <span>{p.rating.toFixed(1)}</span>
                          </div>
                        </td>
                      )}

                      {/* Satıcı Sayısı */}
                      {visibleColumns.has("offerCount") && (
                        <td className="py-3 px-3 text-center text-xs text-slate-300">
                          {p.seller_count || 1}
                        </td>
                      )}

                      {/* FBA / Komisyon Ücreti */}
                      {visibleColumns.has("fbaFee") && (
                        <td className="py-3 px-3 text-right text-xs text-slate-400">
                          {p.estimated_fba_fee ? `${p.estimated_fba_fee} ₺` : "—"}
                        </td>
                      )}

                      {/* Fırsat Skoru */}
                      {visibleColumns.has("opportunity") && (
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-black border ${
                            p.opportunity_score >= 75
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : p.opportunity_score >= 50
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}>
                            %{p.opportunity_score.toFixed(0)}
                          </span>
                        </td>
                      )}

                      {/* Hızlı İşlemler */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* VigoScope / Detay Pasaportu */}
                          <button
                            type="button"
                            onClick={() => setSelectedProductForPassport(p)}
                            title="VigoScope ile Detaylı İncele"
                            className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Kâr Hesapla */}
                          <button
                            type="button"
                            onClick={() => onOpenProfitModal(p)}
                            title="Net Kâr & Komisyon Hesapla"
                            className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 transition"
                          >
                            <Calculator className="w-3.5 h-3.5" />
                          </button>

                          {/* Fiyat Grafiği */}
                          <button
                            type="button"
                            onClick={() => onOpenPriceModal(p)}
                            title="Fiyat Geçmişi Grafiği"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          >
                            <ChartIcon className="w-3.5 h-3.5" />
                          </button>

                          {/* Takip Et */}
                          <button
                            type="button"
                            onClick={() => onToggleTrack(p)}
                            title={p.is_tracked ? "Takipten Çıkar" : "Takibe Al"}
                            className={`p-1.5 rounded-lg transition ${
                              p.is_tracked
                                ? "bg-amber-500/30 text-amber-300 border border-amber-500/40"
                                : "hover:bg-slate-800 text-slate-400 hover:text-white"
                            }`}
                          >
                            {p.is_tracked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* ============================================================
             DATAVIGO KART GÖRÜNÜMÜ
             ============================================================ */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((p) => (
              <div
                key={`${p.marketplace}:${p.external_id}`}
                className="bg-[#080d19] border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between transition-all shadow-md group"
              >
                <div>
                  <div className="relative aspect-square mb-3 rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <Package className="w-12 h-12" />
                      </div>
                    )}
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950/80 text-white border border-slate-700 uppercase">
                      {p.marketplace}
                    </span>
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-600/90 text-white shadow-sm">
                      Fırsat %{p.opportunity_score.toFixed(0)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-blue-400">{p.brand || "Genel Marka"}</div>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-xs text-white hover:text-blue-400 line-clamp-2 transition-colors"
                    >
                      {p.title}
                    </a>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 mt-3 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Fiyat</span>
                      <strong className="text-white text-sm">
                        {p.current_price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} {p.currency === "USD" ? "$" : "₺"}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">Aylık Satış</span>
                      <strong className="text-emerald-400 text-sm">
                        {p.estimated_monthly_sales.toLocaleString("tr-TR")} adet
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-800/60">
                    <button
                      type="button"
                      onClick={() => setSelectedProductForPassport(p)}
                      className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-[11px] transition"
                    >
                      VigoScope
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenProfitModal(p)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-xs"
                      title="Kâr Hesapla"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleTrack(p)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                      title="Takip Et"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ----------------- SAYFALAMA / DAHA FAZLA ÜRÜN KEŞFET (APPEND) ----------------- */}
        {products.length > 0 && onPageChange && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400">
              <strong className="text-white">{products.length}</strong> ürün listeleniyor
              {filteredProducts.length < products.length && (
                <> · <strong className="text-blue-400">{filteredProducts.length}</strong> filtre sonucu</>
              )}
              {" "}· Toplam pazar hacmi: <strong className="text-blue-400">{(totalScannedVolume || 14850).toLocaleString("tr-TR")}+</strong>
            </span>

            {currentPage < totalPages && (
              <button
                type="button"
                disabled={loading}
                onClick={() => onPageChange(currentPage + 1)}
                className="px-5 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 active:scale-95 text-white shadow-lg shadow-blue-600/20 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Layers className="w-4 h-4" />
                <span>{loading ? "Taranıyor..." : "Daha Fazla Ürün Keşfet"}</span>
              </button>
            )}
          </div>
        )}

        {/* ----------------- DATAVIGO ALT BİLGİ NOTU (vr-results-footnote) ----------------- */}
        <div className="vr-results-footnote flex items-center gap-1.5 text-[11px] text-slate-500 pt-3 border-t border-slate-800/60">
          <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>
            Eksik veri “—” ile gösterilir. Sonuçlar, tüm pazaryeri kataloğunu değil taranan ürünleri kapsar.
          </span>
        </div>
      </section>

      {/* ============================================================
          5. MODALLAR: VİGOSCOPE PASAPORT MODALI
          ============================================================ */}
      {selectedProductForPassport && (
        <ProductPassportModal
          product={selectedProductForPassport}
          onClose={() => setSelectedProductForPassport(null)}
          onToggleTrack={onToggleTrack}
        />
      )}
    </div>
  );
}
