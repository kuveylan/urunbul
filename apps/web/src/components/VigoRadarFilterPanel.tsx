"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Sparkles,
  Filter,
  RotateCcw,
  Bookmark,
  Trash2,
  Check,
  Zap,
  TrendingUp,
  Package,
  Users,
  Truck,
  ChevronDown,
  ChevronRight,
  Search,
  Info,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { safeLocalStorage } from "@/lib/safariFixes";

export interface VigoRadarFilterCriteria {
  // 1. Satış & Performans
  minSales: string;
  maxSales: string;
  minFamilySales: string;
  maxFamilySales: string;
  minRevenue: string;
  maxRevenue: string;
  minPrice: string;
  maxPrice: string;
  minOriginalPrice: string;
  maxOriginalPrice: string;
  minDiscountPercent: string;
  maxDiscountPercent: string;
  minBsr: string;
  maxBsr: string;
  minSalesReviewRatio: string;
  maxSalesReviewRatio: string;
  minVariationCoverage: string;
  maxVariationCoverage: string;
  minSalesGrowth30d: string;
  maxSalesGrowth30d: string;
  minSalesLowerBoundGrowth: string;
  maxSalesLowerBoundGrowth: string;
  minSubcategoryBsr: string;
  maxSubcategoryBsr: string;
  minBsrImprovement: string;
  maxBsrImprovement: string;
  minBsrImprovementRatio: string;
  maxBsrImprovementRatio: string;

  // 2. Ürün & Yorumlar
  minReviews: string;
  maxReviews: string;
  minRating: string;
  maxRating: string;
  minVariationCount: string;
  maxVariationCount: string;
  minImageCount: string;
  maxImageCount: string;
  minDaysOnMarket: string;
  maxDaysOnMarket: string;
  minReviewGrowth: string;
  maxReviewGrowth: string;
  minRatingChange: string;
  maxRatingChange: string;
  minListingQualityScore: string;
  maxListingQualityScore: string;
  minNegativeTopicPct: string;
  maxNegativeTopicPct: string;
  reviewTopic: string;
  agePreset: string;
  badges: string[]; // "best_seller", "choice", "new_release"

  // 3. Rekabet & Marka
  minOfferCount: string;
  maxOfferCount: string;
  amazonOffer: string; // "", "yes", "no"
  fbaOffer: string; // "", "yes", "no"
  fbmOffer: string; // "", "yes", "no"
  hasPromotion: boolean;
  includeBrands: string;
  excludeBrands: string;
  includeKeywords: string;
  excludeKeywords: string;
  keywordMatchMode: "any" | "all" | "exact";

  // 4. Lojistik & Detaylar
  minFbaFee: string;
  maxFbaFee: string;
  minWeightKg: string;
  maxWeightKg: string;
  minPackageWeightKg: string;
  maxPackageWeightKg: string;
  minLengthCm: string;
  maxLengthCm: string;
  minWidthCm: string;
  maxWidthCm: string;
  minHeightCm: string;
  maxHeightCm: string;
  minShippingPrice: string;
  maxShippingPrice: string;
  minLandedPrice: string;
  maxLandedPrice: string;
  minTotalFees: string;
  maxTotalFees: string;
  minReferralFee: string;
  maxReferralFee: string;
  minFeeRatio: string;
  maxFeeRatio: string;
  minEstimatedMargin: string;
  maxEstimatedMargin: string;
  packageLengthCm: string;
  packageWidthCm: string;
  packageHeightCm: string;
  offerScope: "selected" | "any";
  shippingCountry: string;
  fbaInboundEligibility: string;
  listingApproval: string;
  unitProductCost: string;
  otherUnitCosts: string;
  shippingMethods: string[]; // "AMZ", "FBA", "FBM"
  primeOnly: boolean;

  // Kategori seçimi
  selectedCategories: string[];
}

export const INITIAL_VIGO_FILTERS: VigoRadarFilterCriteria = {
  minSales: "",
  maxSales: "",
  minFamilySales: "",
  maxFamilySales: "",
  minRevenue: "",
  maxRevenue: "",
  minPrice: "",
  maxPrice: "",
  minOriginalPrice: "",
  maxOriginalPrice: "",
  minDiscountPercent: "",
  maxDiscountPercent: "",
  minBsr: "",
  maxBsr: "",
  minSalesReviewRatio: "",
  maxSalesReviewRatio: "",
  minVariationCoverage: "",
  maxVariationCoverage: "",
  minSalesGrowth30d: "",
  maxSalesGrowth30d: "",
  minSalesLowerBoundGrowth: "",
  maxSalesLowerBoundGrowth: "",
  minSubcategoryBsr: "",
  maxSubcategoryBsr: "",
  minBsrImprovement: "",
  maxBsrImprovement: "",
  minBsrImprovementRatio: "",
  maxBsrImprovementRatio: "",

  minReviews: "",
  maxReviews: "",
  minRating: "",
  maxRating: "",
  minVariationCount: "",
  maxVariationCount: "",
  minImageCount: "",
  maxImageCount: "",
  minDaysOnMarket: "",
  maxDaysOnMarket: "",
  minReviewGrowth: "",
  maxReviewGrowth: "",
  minRatingChange: "",
  maxRatingChange: "",
  minListingQualityScore: "",
  maxListingQualityScore: "",
  minNegativeTopicPct: "",
  maxNegativeTopicPct: "",
  reviewTopic: "",
  agePreset: "",
  badges: [],

  minOfferCount: "",
  maxOfferCount: "",
  amazonOffer: "",
  fbaOffer: "",
  fbmOffer: "",
  hasPromotion: false,
  includeBrands: "",
  excludeBrands: "",
  includeKeywords: "",
  excludeKeywords: "",
  keywordMatchMode: "any",

  minFbaFee: "",
  maxFbaFee: "",
  minWeightKg: "",
  maxWeightKg: "",
  minPackageWeightKg: "",
  maxPackageWeightKg: "",
  minLengthCm: "",
  maxLengthCm: "",
  minWidthCm: "",
  maxWidthCm: "",
  minHeightCm: "",
  maxHeightCm: "",
  minShippingPrice: "",
  maxShippingPrice: "",
  minLandedPrice: "",
  maxLandedPrice: "",
  minTotalFees: "",
  maxTotalFees: "",
  minReferralFee: "",
  maxReferralFee: "",
  minFeeRatio: "",
  maxFeeRatio: "",
  minEstimatedMargin: "",
  maxEstimatedMargin: "",
  packageLengthCm: "",
  packageWidthCm: "",
  packageHeightCm: "",
  offerScope: "selected",
  shippingCountry: "",
  fbaInboundEligibility: "",
  listingApproval: "",
  unitProductCost: "",
  otherUnitCosts: "",
  shippingMethods: [],
  primeOnly: false,

  selectedCategories: [],
};

export interface SavedFilterPreset {
  id: string;
  name: string;
  createdAt: string;
  criteria: VigoRadarFilterCriteria;
}

// DataVigo Hiyerarşik Kategori Ağacı Verisi (TR & EN Destekli)
export interface CategoryNode {
  id: string;
  name: string;
  nameTr: string;
  searchSeed: string;
  children?: CategoryNode[];
}

export const DATAVIGO_CATEGORY_TREE: CategoryNode[] = [
  {
    id: "appliances",
    name: "Appliances",
    nameTr: "Küçük Ev Aletleri & Beyaz Eşya",
    searchSeed: "küçük ev aletleri",
    children: [
      { id: "app-kitchen", name: "Kitchen Small Appliances", nameTr: "Mutfak Robotu & Blender", searchSeed: "blender mutfak robotu" },
      { id: "app-coffee", name: "Coffee & Espresso Machines", nameTr: "Kahve Makineleri", searchSeed: "kahve makinesi" },
      { id: "app-fryer", name: "Air Fryers & Deep Fryers", nameTr: "Airfryer & Fritöz", searchSeed: "airfryer" },
      { id: "app-vacuum", name: "Robot Vacuums & Stick Vacuums", nameTr: "Robot & Dikey Süpürgeler", searchSeed: "robot süpürge dikey süpürge" },
    ],
  },
  {
    id: "electronics",
    name: "Electronics",
    nameTr: "Elektronik & Teknoloji",
    searchSeed: "elektronik",
    children: [
      { id: "elec-headphones", name: "Headphones & Earbuds", nameTr: "Bluetooth Kulaklık", searchSeed: "kablosuz kulaklık" },
      { id: "elec-smartwatch", name: "Smartwatches & Bands", nameTr: "Akıllı Saat & Bileklik", searchSeed: "akıllı saat" },
      { id: "elec-speakers", name: "Bluetooth Speakers", nameTr: "Taşınabilir Hoparlör", searchSeed: "bluetooth hoparlör" },
      { id: "elec-accessories", name: "Cables & Chargers", nameTr: "Şarj Cihazı & Powerbank", searchSeed: "powerbank hızlı şarj" },
    ],
  },
  {
    id: "home-kitchen",
    name: "Home & Kitchen",
    nameTr: "Ev, Yaşam & Mutfak",
    searchSeed: "ev yaşam mutfak",
    children: [
      { id: "hk-cookware", name: "Cookware & Pans", nameTr: "Tencere & Tava Setleri", searchSeed: "granit tencere tava" },
      { id: "hk-thermos", name: "Thermoses & Water Bottles", nameTr: "Termos & Matara", searchSeed: "çelik termos matara" },
      { id: "hk-storage", name: "Kitchen Storage & Organization", nameTr: "Düzenleyici & Saklama Kapları", searchSeed: "mutfak saklama kabı düzenleyici" },
      { id: "hk-decor", name: "Home Decor & Lighting", nameTr: "Ev Dekorasyon & Aydınlatma", searchSeed: "dekoratif lamba led aydınlatma" },
    ],
  },
  {
    id: "beauty",
    name: "Beauty & Personal Care",
    nameTr: "Kozmetik & Kişisel Bakım",
    searchSeed: "kozmetik kişisel bakım",
    children: [
      { id: "beauty-skincare", name: "Skin Care & Serums", nameTr: "Cilt Bakım Serumları", searchSeed: "cilt serumu güneş kremi" },
      { id: "beauty-hair", name: "Hair Styling & Dryers", nameTr: "Saç Şekillendirici & Kurutma", searchSeed: "saç şekillendirici kurutma makinesi" },
      { id: "beauty-perfume", name: "Fragrance & Perfume", nameTr: "Parfüm & Deodorant", searchSeed: "parfüm edp" },
    ],
  },
  {
    id: "fashion",
    name: "Clothing, Shoes & Jewelry",
    nameTr: "Moda, Ayakkabı & Aksesuar",
    searchSeed: "moda ayakkabı çanta",
    children: [
      { id: "fash-bags", name: "Backpacks & Handbags", nameTr: "Sırt Çantası & Kol Çantası", searchSeed: "deri sırt çantası" },
      { id: "fash-shoes", name: "Sneakers & Running Shoes", nameTr: "Spor Ayakkabı & Sneaker", searchSeed: "spor ayakkabı sneaker" },
      { id: "fash-sunglasses", name: "Sunglasses & Accessories", nameTr: "Güneş Gözlüğü & Takı", searchSeed: "polarize güneş gözlüğü" },
    ],
  },
  {
    id: "sports-outdoors",
    name: "Sports & Outdoors",
    nameTr: "Spor, Kamp & Outdoor",
    searchSeed: "spor outdoor kamp",
    children: [
      { id: "sport-fitness", name: "Fitness & Yoga", nameTr: "Direnç Bandı & Yoga Matı", searchSeed: "pilates yoga matı direnç bandı" },
      { id: "sport-camp", name: "Camping Gear & Tents", nameTr: "Kamp Çadırı & Sandalyesi", searchSeed: "katlanır kamp sandalyesi çadır" },
    ],
  },
  {
    id: "baby",
    name: "Baby",
    nameTr: "Anne & Bebek",
    searchSeed: "anne bebek",
    children: [
      { id: "baby-gear", name: "Strollers & Car Seats", nameTr: "Bebek Arabası & Oto Koltuğu", searchSeed: "bebek arabası oto koltuğu" },
      { id: "baby-care", name: "Baby Feeding & Care", nameTr: "Biberon & Bakım Ürünleri", searchSeed: "biberon emzik bebek bakım" },
    ],
  },
  {
    id: "automotive",
    name: "Automotive",
    nameTr: "Oto Aksesuar & Bakım",
    searchSeed: "oto aksesuar",
    children: [
      { id: "auto-dashcam", name: "Car Holders & Chargers", nameTr: "Araç İçi Telefon Tutucu & Şarj", searchSeed: "araç telefon tutucu fm transmitter" },
      { id: "auto-care", name: "Car Care & Cleaning", nameTr: "Oto Temizlik & Cila", searchSeed: "oto seramik kaplama cila" },
    ],
  },
  {
    id: "pet-supplies",
    name: "Pet Supplies",
    nameTr: "Pet Shop / Evcil Hayvan",
    searchSeed: "pet shop evcil hayvan",
    children: [
      { id: "pet-feeder", name: "Smart Feeders & Water Fountains", nameTr: "Otomatik Mama & Su Kabı", searchSeed: "otomatik kedi su pınarı mama kabı" },
      { id: "pet-toys", name: "Pet Beds & Toys", nameTr: "Kedi Köpek Yatağı & Oyuncak", searchSeed: "ortopedik kedi köpek yatağı" },
    ],
  },
  {
    id: "office-products",
    name: "Office Products & Stationery",
    nameTr: "Ofis & Kırtasiye",
    searchSeed: "ofis kırtasiye",
    children: [
      { id: "off-ergonomic", name: "Ergonomic Chairs & Cushions", nameTr: "Ortopedik Minder & Destekler", searchSeed: "ortopedik bel minderi boyun yastığı" },
      { id: "off-organizers", name: "Desk Organizers", nameTr: "Masaüstü Düzenleyiciler", searchSeed: "masaüstü organizer düzenleyici" },
    ],
  },
];

interface VigoRadarFilterPanelProps {
  onApplyFilters: (criteria: VigoRadarFilterCriteria) => void;
  onResetFilters: () => void;
  activeCount: number;
  selectedMarketplace: string;
  onMarketplaceChange: (mp: string) => void;
}

export default function VigoRadarFilterPanel({
  onApplyFilters,
  onResetFilters,
  activeCount,
  selectedMarketplace,
  onMarketplaceChange,
}: VigoRadarFilterPanelProps) {
  const [filters, setFilters] = useState<VigoRadarFilterCriteria>(INITIAL_VIGO_FILTERS);
  const [isFieldsVisible, setIsFieldsVisible] = useState(true);
  const [isDetailed, setIsDetailed] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Filtre Kitaplığı Modal/Popover
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [savedPresets, setSavedPresets] = useState<SavedFilterPreset[]>([]);
  const [newPresetName, setNewPresetName] = useState("");
  const libraryRef = useRef<HTMLDivElement>(null);

  // Kategori Ağacı Popover & Arama State
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    appliances: true,
    electronics: true,
    "home-kitchen": true,
  });
  const categoryPickerRef = useRef<HTMLDivElement>(null);

  // Kayıtlı filtreleri localStorage'dan yükle
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

  // Dış tıklamaları dinle (Popover kapatma)
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (libraryRef.current && !libraryRef.current.contains(e.target as Node)) {
        setIsLibraryOpen(false);
      }
      if (categoryPickerRef.current && !categoryPickerRef.current.contains(e.target as Node)) {
        setIsCategoryPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
  const applyQuickPreset = (key: string) => {
    let preset: VigoRadarFilterCriteria = { ...INITIAL_VIGO_FILTERS, selectedCategories: filters.selectedCategories };

    switch (key) {
      case "newbie": // Yeni başlayanlar: 300+ varyasyon satışı · en fazla 100 yorum
        preset = {
          ...preset,
          minSales: "300",
          maxReviews: "100",
          minPrice: "100",
        };
        break;
      case "high_demand": // Yüksek talep: 1.000+ varyasyon satış tahmini
        preset = {
          ...preset,
          minSales: "1000",
          minRevenue: "100000",
        };
        break;
      case "low_competition": // Düşük rekabet: En fazla 3 teklif · 200 yorum
        preset = {
          ...preset,
          maxOfferCount: "3",
          maxReviews: "200",
          minRating: "4.0",
        };
        break;
      case "low_reviews": // Az yorumlu fırsatlar: 100+ tahmini aylık varyasyon satışı · en fazla 100 yorum
        preset = {
          ...preset,
          minSales: "100",
          maxReviews: "100",
        };
        break;
      case "potential": // Geliştirme potansiyeli: En fazla 4 yıldız · 300+ varyasyon satışı
        preset = {
          ...preset,
          maxRating: "4.0",
          minSales: "300",
          minReviews: "40",
        };
        break;
      default:
        break;
    }

    setActivePreset(key);
    setFilters(preset);
  };

  const handleFieldChange = (key: keyof VigoRadarFilterCriteria, val: any) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
    setActivePreset(null);
  };

  const toggleBadge = (badge: string) => {
    setFilters((prev) => {
      const exists = prev.badges.includes(badge);
      return {
        ...prev,
        badges: exists ? prev.badges.filter((b) => b !== badge) : [...prev.badges, badge],
      };
    });
  };

  const toggleCategorySelection = (catId: string) => {
    setFilters((prev) => {
      const exists = prev.selectedCategories.includes(catId);
      const updated = exists
        ? prev.selectedCategories.filter((id) => id !== catId)
        : [...prev.selectedCategories, catId];
      return { ...prev, selectedCategories: updated };
    });
  };

  const toggleNodeExpansion = (nodeId: string) => {
    setExpandedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const handleReset = () => {
    setFilters(INITIAL_VIGO_FILTERS);
    setActivePreset(null);
    onResetFilters();
  };

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onApplyFilters(filters);
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
  };

  const handleDeletePreset = (id: string) => {
    const updated = savedPresets.filter((p) => p.id !== id);
    savePresetToStorage(updated);
  };

  const handleLoadSavedPreset = (preset: SavedFilterPreset) => {
    setFilters(preset.criteria);
    setIsLibraryOpen(false);
  };

  // Kategori ağacı süzme (arama metnine göre)
  const filteredCategories = useMemo(() => {
    const q = categorySearchQuery.trim().toLowerCase();
    if (!q) return DATAVIGO_CATEGORY_TREE;
    return DATAVIGO_CATEGORY_TREE.filter((cat) => {
      const matchParent = cat.name.toLowerCase().includes(q) || cat.nameTr.toLowerCase().includes(q);
      const matchChild = cat.children?.some(
        (c) => c.name.toLowerCase().includes(q) || c.nameTr.toLowerCase().includes(q)
      );
      return matchParent || matchChild;
    });
  }, [categorySearchQuery]);

  // Seçili kategori isimleri metni
  const selectedCategoryLabel = useMemo(() => {
    const count = filters.selectedCategories.length;
    if (count === 0) return "Kategori veya alt kategori seçin";
    if (count === 1) {
      const id = filters.selectedCategories[0];
      for (const node of DATAVIGO_CATEGORY_TREE) {
        if (node.id === id) return node.nameTr;
        const sub = node.children?.find((c) => c.id === id);
        if (sub) return sub.nameTr;
      }
      return "1 kategori seçili";
    }
    return `${count} kategori seçili`;
  }, [filters.selectedCategories]);

  return (
    <form className="vr-filter-panel" onSubmit={handleApply} noValidate>
      {/* ============================================================
          1. CONTEXT BAR: PAZARYERİ & PERİYOT (DataVigo vr-context-bar)
          ============================================================ */}
      <div className="vr-context-bar flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0d1424] border border-slate-800 p-3 rounded-xl">
        <div className="vr-market-row flex items-center gap-2.5 flex-wrap">
          <span className="vr-label text-xs font-bold text-slate-400">Pazaryeri</span>
          <div className="vr-market-tabs flex items-center gap-1.5 p-1 bg-[#060a14] border border-slate-800/80 rounded-xl flex-wrap">
            {[
              { id: "trendyol", label: "Trendyol", code: "TY", badge: "bg-orange-500/20 text-orange-300" },
              { id: "hepsiburada", label: "Hepsiburada", code: "HB", badge: "bg-amber-500/20 text-amber-300" },
              { id: "amazon", label: "Amazon TR", code: "AMZ", badge: "bg-yellow-500/20 text-yellow-300" },
              { id: "n11", label: "N11", code: "N11", badge: "bg-purple-500/20 text-purple-300" },
            ].map((m) => {
              const isActive =
                selectedMarketplace.toLowerCase() === m.id ||
                (m.id === "trendyol" && (selectedMarketplace === "all" || !selectedMarketplace));
              return (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => onMarketplaceChange(m.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md ring-1 ring-blue-400"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold ${m.badge}`}>
                    {m.code}
                  </span>
                  <span>{m.label}</span>
                  {isActive && <Check className="w-3.5 h-3.5 text-blue-200 ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Periyot / Veri Durum Göstergesi */}
        <div
          className="vr-period flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 shrink-0"
          title="Mevcut ürün verileri ve canlı aylık satış tahminleri."
        >
          <span className="vr-status-dot w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Ürün verileri</span>
          <span className="vr-period-divider text-slate-600">·</span>
          <span>Aylık tahminler</span>
          <Info className="w-3.5 h-3.5 text-slate-500" />
        </div>
      </div>

      {/* ============================================================
          2. PRESET ROW: HIZLI BAŞLANGIÇ & FİLTRE KİTAPLIĞIM
          ============================================================ */}
      <div className="vr-preset-row flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-800/80">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="vr-label text-xs font-bold text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Hızlı başlangıç
          </span>
          <div className="vr-preset-chips flex items-center gap-1.5 flex-wrap">
            {[
              { key: "newbie", title: "300+ varyasyon satışı · en fazla 100 yorum", label: "Yeni başlayanlar" },
              { key: "high_demand", title: "1.000+ varyasyon satış tahmini", label: "Yüksek talep" },
              { key: "low_competition", title: "En fazla 3 teklif · 200 yorum", label: "Düşük rekabet" },
              { key: "low_reviews", title: "100+ tahmini aylık varyasyon satışı · en fazla 100 yorum", label: "Az yorumlu fırsatlar" },
              { key: "potential", title: "En fazla 4 yıldız · 300+ varyasyon satışı", label: "Geliştirme potansiyeli" },
            ].map((p) => (
              <button
                key={p.key}
                type="button"
                title={p.title}
                aria-pressed={activePreset === p.key}
                onClick={() => applyQuickPreset(p.key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition shadow-xs ${
                  activePreset === p.key
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                    : "bg-[#0b101e] border-slate-700/80 hover:border-slate-600 text-slate-300 hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filtre Kitaplığım Popover */}
        <div className="relative shrink-0" ref={libraryRef}>
          <button
            type="button"
            onClick={() => setIsLibraryOpen(!isLibraryOpen)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0d1424] hover:bg-slate-800 text-blue-300 border border-blue-900/50 flex items-center gap-1.5 transition shadow-sm"
          >
            <Bookmark className="w-3.5 h-3.5 text-blue-400" />
            <span>Filtre kitaplığım</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-500/30 text-[10px] font-bold text-blue-200">
              {savedPresets.length}
            </span>
          </button>

          {isLibraryOpen && (
            <div className="vr-popover-panel absolute right-0 top-full mt-2 w-80 bg-[#0a0f1d] border border-slate-700 rounded-xl p-4 shadow-2xl z-40 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <strong className="text-white text-xs">Kaydedilen filtreler</strong>
                <span className="text-[10px] text-slate-500">Tarayıcıda saklanır</span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {savedPresets.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">Henüz bir filtre kaydetmediniz.</p>
                ) : (
                  savedPresets.map((sp) => (
                    <div
                      key={sp.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-xs"
                    >
                      <div>
                        <div className="font-bold text-white">{sp.name}</div>
                        <div className="text-[10px] text-slate-500">{sp.createdAt}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleLoadSavedPreset(sp)}
                          className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px]"
                        >
                          Yükle
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePreset(sp.id)}
                          className="p-1 hover:text-rose-400 text-slate-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <label className="block text-[11px] font-medium text-slate-300">
                  <span>Mevcut filtreyi kaydet</span>
                  <input
                    type="text"
                    maxLength={60}
                    placeholder="Örn. Mutfak fırsatları"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    className="mt-1 w-full bg-[#060913] border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleSaveCurrentFilter}
                  disabled={!newPresetName.trim()}
                  className="vr-primary w-full py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs transition"
                >
                  Şablonu kaydet
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================
          3. CATEGORY BAR: KATEGORİ SEÇİCİ & AÇILIR AĞAÇ (DataVigo vr-category-bar)
          ============================================================ */}
      <div className="vr-category-bar flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-800/80">
        <div className="vr-category-picker relative flex-1" ref={categoryPickerRef}>
          <span className="vr-label text-xs font-bold text-slate-400 mr-2" id="vr-category-label">
            Kategoriler <span className="vr-required text-amber-400">*</span>
          </span>

          <button
            type="button"
            onClick={() => setIsCategoryPickerOpen(!isCategoryPickerOpen)}
            className="vr-category-trigger w-full sm:w-auto min-w-[280px] px-3.5 py-2 rounded-lg bg-[#0d1424] border border-slate-700/90 hover:border-slate-600 text-left text-xs font-semibold text-white flex items-center justify-between gap-2 shadow-inner"
          >
            <span id="vr-category-value" className="truncate">
              {selectedCategoryLabel}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform ${
                isCategoryPickerOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Kategori Popover Paneli */}
          {isCategoryPickerOpen && (
            <div className="vr-popover-panel vr-category-panel absolute left-0 top-full mt-2 w-full sm:w-96 bg-[#0a0f1d] border border-slate-700 rounded-xl p-3.5 shadow-2xl z-50 animate-fadeIn space-y-3">
              {/* Kategori Ara */}
              <div className="vr-inline-search relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  autoComplete="off"
                  aria-label="Kategori ara"
                  placeholder="Kategori adı veya ID ara…"
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#060913] border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Kategori Ağacı */}
              <div className="vr-category-tree max-h-64 overflow-y-auto pr-1 space-y-1">
                <p className="vr-category-help text-[11px] text-slate-400 pb-1 border-b border-slate-800">
                  Kutuyu işaretleyerek seçin; ok ile alt kategorileri açın.
                </p>

                {filteredCategories.map((node) => {
                  const isExpanded = !!expandedNodes[node.id];
                  const isSelected = filters.selectedCategories.includes(node.id);

                  return (
                    <div key={node.id} className="vr-category-node">
                      <div className="vr-category-node-row flex items-center justify-between py-1 px-1.5 rounded hover:bg-slate-800/60 transition">
                        <label className="vr-category-option flex items-center gap-2 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleCategorySelection(node.id)}
                            className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                          />
                          <span className="vr-category-copy text-xs text-slate-200">
                            <strong>{node.nameTr}</strong>{" "}
                            <span className="text-[10px] text-slate-400">({node.name})</span>
                          </span>
                        </label>

                        {node.children && node.children.length > 0 && (
                          <button
                            type="button"
                            onClick={() => toggleNodeExpansion(node.id)}
                            className="vr-category-expand p-1 text-slate-400 hover:text-white"
                          >
                            <ChevronRight
                              className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                            />
                          </button>
                        )}
                      </div>

                      {/* Alt Kategoriler */}
                      {isExpanded && node.children && (
                        <div className="pl-6 space-y-0.5 border-l border-slate-800 ml-3 my-0.5">
                          {node.children.map((sub) => {
                            const isSubSelected = filters.selectedCategories.includes(sub.id);
                            return (
                              <label
                                key={sub.id}
                                className="flex items-center gap-2 py-1 px-1 rounded hover:bg-slate-800/40 cursor-pointer text-[11px] text-slate-300"
                              >
                                <input
                                  type="checkbox"
                                  checked={isSubSelected}
                                  onChange={() => toggleCategorySelection(sub.id)}
                                  className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                                />
                                <span>{sub.nameTr}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Panel Altlığı */}
              <div className="vr-popover-footer flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400 font-semibold">
                  {filters.selectedCategories.length} seçili
                </span>
                <button
                  type="button"
                  onClick={() => setIsCategoryPickerOpen(false)}
                  className="px-3.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs"
                >
                  Uygula
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Temel / Detaylı Filtreler & Filtreleri Gizle / Göster Butonları */}
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={() => setIsDetailed(!isDetailed)}
            className="vr-collapse px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0d1424] text-slate-300 border border-slate-800 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 shadow-xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span>{isDetailed ? "Temel filtreler" : "Detaylı filtreler"}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsFieldsVisible(!isFieldsVisible)}
            className="vr-collapse px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0d1424] text-slate-300 border border-slate-800 hover:text-white transition flex items-center gap-1.5"
          >
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            <span>{isFieldsVisible ? "Filtreleri gizle" : "Filtreleri göster"}</span>
            {activeCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                {activeCount}
              </span>
            )}
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${isFieldsVisible ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* ============================================================
          4. FILTER GRID: 4 SÜTUNLU AÇIK FİLTRE IZGARASI (vr-filter-grid)
          ============================================================ */}
      {isFieldsVisible && (
        <div id="vr-filter-fields" className="mt-4 pt-4 border-t border-slate-800/80">
          <div className="vr-filter-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* ---------------- SÜTUN 1: SATIŞ & PERFORMANS ---------------- */}
            <section className="vr-filter-group bg-[#090e1a] border border-slate-800/90 rounded-xl p-3.5 space-y-3 shadow-inner">
              <h3 className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-bold text-white">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Satış &amp; performans</span>
              </h3>

              {/* 1. Varyasyon Satışı */}
              <fieldset className="vr-range-field">
                <legend className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                  <span>Varyasyon satışı · tahmini</span>
                  <span className="text-[10px] text-slate-500 font-mono">adet</span>
                </legend>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={filters.minSales}
                    onChange={(e) => handleFieldChange("minSales", e.target.value)}
                    className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-slate-600">—</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={filters.maxSales}
                    onChange={(e) => handleFieldChange("maxSales", e.target.value)}
                    className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </fieldset>

              {/* Detaylı Modda: 2. Aile Satışı & 3. Aile Cirosu */}
              {isDetailed && (
                <>
                  <fieldset className="vr-range-field">
                    <legend className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                      <span>Aile satışı · tahmini</span>
                      <span className="text-[10px] text-slate-500 font-mono">adet</span>
                    </legend>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        placeholder="Min"
                        value={filters.minFamilySales}
                        onChange={(e) => handleFieldChange("minFamilySales", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-slate-600">—</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Max"
                        value={filters.maxFamilySales}
                        onChange={(e) => handleFieldChange("maxFamilySales", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </fieldset>

                  <fieldset className="vr-range-field">
                    <legend className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                      <span>Aile aylık cirosu · tahmini</span>
                      <span className="text-[10px] text-slate-500 font-mono">₺</span>
                    </legend>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        placeholder="Min"
                        value={filters.minRevenue}
                        onChange={(e) => handleFieldChange("minRevenue", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-slate-600">—</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Max"
                        value={filters.maxRevenue}
                        onChange={(e) => handleFieldChange("maxRevenue", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </fieldset>
                </>
              )}

              {/* 4. Satış Fiyatı */}
              <fieldset className="vr-range-field">
                <legend className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                  <span>Satış fiyatı</span>
                  <span className="text-[10px] text-slate-500 font-mono">₺</span>
                </legend>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFieldChange("minPrice", e.target.value)}
                    className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-slate-600">—</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFieldChange("maxPrice", e.target.value)}
                    className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </fieldset>

              {/* Detaylı Modda: 5. İndirim Öncesi Fiyat & 6. İndirim Oranı */}
              {isDetailed && (
                <>
                  <fieldset className="vr-range-field">
                    <legend className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                      <span>İndirim öncesi fiyat</span>
                      <span className="text-[10px] text-slate-500 font-mono">₺</span>
                    </legend>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        placeholder="Min"
                        value={filters.minOriginalPrice}
                        onChange={(e) => handleFieldChange("minOriginalPrice", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-slate-600">—</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Max"
                        value={filters.maxOriginalPrice}
                        onChange={(e) => handleFieldChange("maxOriginalPrice", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </fieldset>

                  <fieldset className="vr-range-field">
                    <legend className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                      <span>İndirim oranı</span>
                      <span className="text-[10px] text-slate-500 font-mono">%</span>
                    </legend>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Min"
                        value={filters.minDiscountPercent}
                        onChange={(e) => handleFieldChange("minDiscountPercent", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-slate-600">—</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Max"
                        value={filters.maxDiscountPercent}
                        onChange={(e) => handleFieldChange("maxDiscountPercent", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </fieldset>
                </>
              )}

              {/* 7. Çok Satanlar Sırası (BSR) */}
              <fieldset className="vr-range-field">
                <legend className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                  <span>Çok satanlar sırası (BSR)</span>
                  <span className="text-[10px] text-slate-500 font-mono">#</span>
                </legend>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={filters.minBsr}
                    onChange={(e) => handleFieldChange("minBsr", e.target.value)}
                    className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-slate-600">—</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={filters.maxBsr}
                    onChange={(e) => handleFieldChange("maxBsr", e.target.value)}
                    className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </fieldset>

              {/* 8. Satış / Yorum Oranı */}
              <fieldset className="vr-range-field">
                <legend className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                  <span>Satış / yorum oranı</span>
                  <span className="text-[10px] text-slate-500 font-mono">×</span>
                </legend>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Min"
                    value={filters.minSalesReviewRatio}
                    onChange={(e) => handleFieldChange("minSalesReviewRatio", e.target.value)}
                    className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-slate-600">—</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Max"
                    value={filters.maxSalesReviewRatio}
                    onChange={(e) => handleFieldChange("maxSalesReviewRatio", e.target.value)}
                    className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </fieldset>

              {/* Detaylı Modda: 9. Varyasyon Satış Kapsamı, 10. Satış Değişimi, 11. Satış Alt Sınırı Değişimi */}
              {isDetailed && (
                <>
                  <fieldset className="vr-range-field">
                    <legend className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                      <span>Varyasyon satış kapsamı</span>
                      <span className="text-[10px] text-slate-500 font-mono">%</span>
                    </legend>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Min"
                        value={filters.minVariationCoverage}
                        onChange={(e) => handleFieldChange("minVariationCoverage", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-slate-600">—</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Max"
                        value={filters.maxVariationCoverage}
                        onChange={(e) => handleFieldChange("maxVariationCoverage", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </fieldset>

                  <fieldset className="vr-range-field">
                    <legend className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                      <span>Satış değişimi · 30 gün</span>
                      <span className="text-[10px] text-slate-500 font-mono">%</span>
                    </legend>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minSalesGrowth30d}
                        onChange={(e) => handleFieldChange("minSalesGrowth30d", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-slate-600">—</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxSalesGrowth30d}
                        onChange={(e) => handleFieldChange("maxSalesGrowth30d", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </fieldset>

                  <fieldset className="vr-range-field">
                    <legend className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                      <span>Satış alt sınırı değişimi · 30 gün</span>
                      <span className="text-[10px] text-slate-500 font-mono">%</span>
                    </legend>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minSalesLowerBoundGrowth}
                        onChange={(e) => handleFieldChange("minSalesLowerBoundGrowth", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-slate-600">—</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxSalesLowerBoundGrowth}
                        onChange={(e) => handleFieldChange("maxSalesLowerBoundGrowth", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </fieldset>
                </>
              )}

              {/* 12. Alt Kategori BSR */}
              <fieldset className="vr-range-field">
                <legend className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                  <span>Alt kategori BSR</span>
                  <span className="text-[10px] text-slate-500 font-mono">#</span>
                </legend>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={filters.minSubcategoryBsr}
                    onChange={(e) => handleFieldChange("minSubcategoryBsr", e.target.value)}
                    className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-slate-600">—</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={filters.maxSubcategoryBsr}
                    onChange={(e) => handleFieldChange("maxSubcategoryBsr", e.target.value)}
                    className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </fieldset>

              {/* Detaylı Modda: 13. BSR İyileşmesi & 14. BSR İyileşme Oranı */}
              {isDetailed && (
                <>
                  <fieldset className="vr-range-field">
                    <legend className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                      <span>BSR iyileşmesi</span>
                      <span className="text-[10px] text-slate-500 font-mono">#</span>
                    </legend>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minBsrImprovement}
                        onChange={(e) => handleFieldChange("minBsrImprovement", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-slate-600">—</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxBsrImprovement}
                        onChange={(e) => handleFieldChange("maxBsrImprovement", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </fieldset>

                  <fieldset className="vr-range-field">
                    <legend className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                      <span>BSR iyileşme oranı</span>
                      <span className="text-[10px] text-slate-500 font-mono">%</span>
                    </legend>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minBsrImprovementRatio}
                        onChange={(e) => handleFieldChange("minBsrImprovementRatio", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-slate-600">—</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxBsrImprovementRatio}
                        onChange={(e) => handleFieldChange("maxBsrImprovementRatio", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </fieldset>
                </>
              )}

              <p className="vr-field-note text-[10px] text-slate-500 pt-1 leading-relaxed">
                Varyasyon satışı tek bir varyasyonun aylık satış tahminidir. Aile satışı, aynı pazar ve dönemde ailedeki varyasyonların toplamıdır; eksik aile verisi tamamlanmış toplam sayılmaz.
              </p>
            </section>

            {/* ---------------- SÜTUN 2: ÜRÜN & YORUMLAR ---------------- */}
            <section className="vr-filter-group bg-[#090e1a] border border-slate-800/90 rounded-xl p-3.5 space-y-3 shadow-inner">
              <h3 className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-bold text-white">
                <Package className="w-4 h-4 text-blue-400" />
                <span>Ürün &amp; yorumlar</span>
              </h3>

              {/* Yorum Sayısı */}
              <fieldset className="vr-range-field">
                <legend className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                  <span>Yorum sayısı</span>
                  <span className="text-[10px] text-slate-500 font-mono">adet</span>
                </legend>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={filters.minReviews}
                    onChange={(e) => handleFieldChange("minReviews", e.target.value)}
                    className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-slate-600">—</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={filters.maxReviews}
                    onChange={(e) => handleFieldChange("maxReviews", e.target.value)}
                    className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </fieldset>

              {/* Değerlendirme Puanı */}
              <fieldset className="vr-range-field">
                <legend className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                  <span>Değerlendirme puanı</span>
                  <span className="text-[10px] text-slate-500 font-mono">/ 5</span>
                </legend>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    placeholder="Min"
                    value={filters.minRating}
                    onChange={(e) => handleFieldChange("minRating", e.target.value)}
                    className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-slate-600">—</span>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    placeholder="Max"
                    value={filters.maxRating}
                    onChange={(e) => handleFieldChange("maxRating", e.target.value)}
                    className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </fieldset>

              {/* Varyasyon Sayısı */}
              <fieldset className="vr-range-field">
                <legend className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                  <span>Varyasyon sayısı</span>
                  <span className="text-[10px] text-slate-500 font-mono">adet</span>
                </legend>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={filters.minVariationCount}
                    onChange={(e) => handleFieldChange("minVariationCount", e.target.value)}
                    className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-slate-600">—</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={filters.maxVariationCount}
                    onChange={(e) => handleFieldChange("maxVariationCount", e.target.value)}
                    className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </fieldset>

              {/* Ürün Görsel Sayısı */}
              <fieldset className="vr-range-field">
                <legend className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                  <span>Ürün görsel sayısı</span>
                  <span className="text-[10px] text-slate-500 font-mono">adet</span>
                </legend>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={filters.minImageCount}
                    onChange={(e) => handleFieldChange("minImageCount", e.target.value)}
                    className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-slate-600">—</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={filters.maxImageCount}
                    onChange={(e) => handleFieldChange("maxImageCount", e.target.value)}
                    className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </fieldset>

              {/* Pazarda Yayında Olduğu Süre */}
              <fieldset className="vr-range-field">
                <legend className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                  <span>Yayında olduğu süre</span>
                  <span className="text-[10px] text-slate-500 font-mono">gün</span>
                </legend>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={filters.minDaysOnMarket}
                    onChange={(e) => handleFieldChange("minDaysOnMarket", e.target.value)}
                    className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-slate-600">—</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={filters.maxDaysOnMarket}
                    onChange={(e) => handleFieldChange("maxDaysOnMarket", e.target.value)}
                    className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </fieldset>

              {/* İlan Tamlığı Puanı */}
              <fieldset className="vr-range-field">
                <legend className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                  <span>İlan tamlığı puanı</span>
                  <span className="text-[10px] text-slate-500 font-mono">/ 100</span>
                </legend>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Min"
                    value={filters.minListingQualityScore}
                    onChange={(e) => handleFieldChange("minListingQualityScore", e.target.value)}
                    className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-slate-600">—</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Max"
                    value={filters.maxListingQualityScore}
                    onChange={(e) => handleFieldChange("maxListingQualityScore", e.target.value)}
                    className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </fieldset>

              {/* Detaylı Modda: Yorum Sayısı Artışı, Puan Değişimi, En Sık Olumsuz Konu Oranı, Yorum Konusu */}
              {isDetailed && (
                <>
                  <fieldset className="vr-range-field">
                    <legend className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                      <span>Yorum sayısı artışı</span>
                      <span className="text-[10px] text-slate-500 font-mono">%</span>
                    </legend>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minReviewGrowth}
                        onChange={(e) => handleFieldChange("minReviewGrowth", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-slate-600">—</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxReviewGrowth}
                        onChange={(e) => handleFieldChange("maxReviewGrowth", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </fieldset>

                  <fieldset className="vr-range-field">
                    <legend className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                      <span>Puan değişimi</span>
                      <span className="text-[10px] text-slate-500 font-mono">/ 5</span>
                    </legend>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Min"
                        value={filters.minRatingChange}
                        onChange={(e) => handleFieldChange("minRatingChange", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-slate-600">—</span>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Max"
                        value={filters.maxRatingChange}
                        onChange={(e) => handleFieldChange("maxRatingChange", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </fieldset>

                  <fieldset className="vr-range-field">
                    <legend className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                      <span>En sık olumsuz konu oranı</span>
                      <span className="text-[10px] text-slate-500 font-mono">%</span>
                    </legend>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minNegativeTopicPct}
                        onChange={(e) => handleFieldChange("minNegativeTopicPct", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-slate-600">—</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxNegativeTopicPct}
                        onChange={(e) => handleFieldChange("maxNegativeTopicPct", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </fieldset>

                  <label className="block text-[11px] font-semibold text-slate-300">
                    <span>Yorum konusu</span>
                    <input
                      type="text"
                      placeholder="Örn. dayanıklılık, kalite"
                      value={filters.reviewTopic}
                      onChange={(e) => handleFieldChange("reviewTopic", e.target.value)}
                      className="mt-1 w-full bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </label>
                </>
              )}

              {/* Hızlı Yaş Filtreleri (30 gün, 6 ay, 1 yıl) */}
              <div className="flex items-center gap-1.5 pt-1">
                {[
                  { label: "30 gün", val: "30" },
                  { label: "6 ay", val: "180" },
                  { label: "1 yıl", val: "365" },
                ].map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => {
                      if (filters.maxDaysOnMarket === preset.val) {
                        handleFieldChange("maxDaysOnMarket", "");
                      } else {
                        handleFieldChange("maxDaysOnMarket", preset.val);
                      }
                    }}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold border transition ${
                      filters.maxDaysOnMarket === preset.val
                        ? "bg-blue-600 text-white border-blue-500"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Ürün Rozetleri */}
              <div>
                <span className="block text-[11px] font-semibold text-slate-300 mb-1">Ürün rozetleri</span>
                <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap">
                  {[
                    { key: "best_seller", label: "Best Seller" },
                    { key: "choice", label: "Amazon's Choice" },
                    { key: "new_release", label: "New Release" },
                  ].map((b) => (
                    <label key={b.key} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.badges.includes(b.key)}
                        onChange={() => toggleBadge(b.key)}
                        className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                      />
                      <span>{b.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </section>

            {/* ---------------- SÜTUN 3: REKABET & MARKA ---------------- */}
            <section className="vr-filter-group bg-[#090e1a] border border-slate-800/90 rounded-xl p-3.5 space-y-3 shadow-inner">
              <h3 className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-bold text-white">
                <Users className="w-4 h-4 text-purple-400" />
                <span>Rekabet &amp; marka</span>
              </h3>

              {/* Satıcı Teklifi Sayısı */}
              <fieldset className="vr-range-field">
                <legend className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                  <span>Satıcı teklifi sayısı</span>
                  <span className="text-[10px] text-slate-500 font-mono">adet</span>
                </legend>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={filters.minOfferCount}
                    onChange={(e) => handleFieldChange("minOfferCount", e.target.value)}
                    className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-slate-600">—</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={filters.maxOfferCount}
                    onChange={(e) => handleFieldChange("maxOfferCount", e.target.value)}
                    className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </fieldset>

              {/* Resmi Teklif / Amazon / Pazaryeri */}
              <label className="block text-[11px] font-semibold text-slate-300">
                <span>Pazaryeri resmi teklifi</span>
                <select
                  value={filters.amazonOffer}
                  onChange={(e) => handleFieldChange("amazonOffer", e.target.value)}
                  className="mt-1 w-full bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="">Tümü</option>
                  <option value="yes">Var / uygun</option>
                  <option value="no">Yok / uygun değil</option>
                </select>
              </label>

              {/* FBA Teklifi */}
              <label className="block text-[11px] font-semibold text-slate-300">
                <span>FBA / Hızlı teslimat teklifi</span>
                <select
                  value={filters.fbaOffer}
                  onChange={(e) => handleFieldChange("fbaOffer", e.target.value)}
                  className="mt-1 w-full bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="">Tümü</option>
                  <option value="yes">Var / uygun</option>
                  <option value="no">Yok / uygun değil</option>
                </select>
              </label>

              {/* FBM Teklifi */}
              <label className="block text-[11px] font-semibold text-slate-300">
                <span>FBM / Standart satıcı teklifi</span>
                <select
                  value={filters.fbmOffer}
                  onChange={(e) => handleFieldChange("fbmOffer", e.target.value)}
                  className="mt-1 w-full bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="">Tümü</option>
                  <option value="yes">Var / uygun</option>
                  <option value="no">Yok / uygun değil</option>
                </select>
              </label>

              {/* Gözlenen Promosyonu Var */}
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={filters.hasPromotion}
                  onChange={(e) => handleFieldChange("hasPromotion", e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                />
                <span>Gözlenen promosyonu var</span>
              </label>

              {/* Marka Dahil Et / Hariç Tut */}
              <label className="block text-[11px] font-semibold text-slate-300">
                <span>Marka dahil et</span>
                <input
                  type="text"
                  placeholder="Markalar, virgülle ayırın"
                  value={filters.includeBrands}
                  onChange={(e) => handleFieldChange("includeBrands", e.target.value)}
                  className="mt-1 w-full bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </label>

              <label className="block text-[11px] font-semibold text-slate-300">
                <span>Marka hariç tut</span>
                <input
                  type="text"
                  placeholder="Markalar, virgülle ayırın"
                  value={filters.excludeBrands}
                  onChange={(e) => handleFieldChange("excludeBrands", e.target.value)}
                  className="mt-1 w-full bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </label>

              {/* Kelime Dahil Et / Hariç Tut */}
              <label className="block text-[11px] font-semibold text-slate-300">
                <span>Kelime dahil et</span>
                <input
                  type="text"
                  placeholder="Kelimeler, virgülle ayırın"
                  value={filters.includeKeywords}
                  onChange={(e) => handleFieldChange("includeKeywords", e.target.value)}
                  className="mt-1 w-full bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </label>

              <label className="block text-[11px] font-semibold text-slate-300">
                <span>Dahil edilen kelimeleri eşleştir</span>
                <select
                  value={filters.keywordMatchMode}
                  onChange={(e) => handleFieldChange("keywordMatchMode", e.target.value as any)}
                  className="mt-1 w-full bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="any">Herhangi birini içerir</option>
                  <option value="all">Tümünü içerir</option>
                  <option value="exact">Başlıkla tam eşleşir</option>
                </select>
              </label>
            </section>

            {/* ---------------- SÜTUN 4: LOJİSTİK & DETAYLAR ---------------- */}
            <section className="vr-filter-group bg-[#090e1a] border border-slate-800/90 rounded-xl p-3.5 space-y-3 shadow-inner">
              <h3 className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-white">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-400" />
                  <span>Lojistik &amp; detaylar</span>
                </div>
                <span className="vr-data-hint text-[10px] font-normal text-slate-400" title="Veri varsa uygulanır">
                  Veri varsa
                </span>
              </h3>

              {/* FBA / Hizmet Ücreti */}
              <fieldset className="vr-range-field">
                <legend className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                  <span>FBA / Komisyon ücreti</span>
                  <span className="text-[10px] text-slate-500 font-mono">{selectedMarketplace === "amazon" ? "$" : "₺"}</span>
                </legend>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={filters.minFbaFee}
                    onChange={(e) => handleFieldChange("minFbaFee", e.target.value)}
                    className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-slate-600">—</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={filters.maxFbaFee}
                    onChange={(e) => handleFieldChange("maxFbaFee", e.target.value)}
                    className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </fieldset>

              {/* Ürün Ağırlığı */}
              <fieldset className="vr-range-field">
                <legend className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                  <span>Ürün ağırlığı</span>
                  <span className="text-[10px] text-slate-500 font-mono">kg</span>
                </legend>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Min"
                    value={filters.minWeightKg}
                    onChange={(e) => handleFieldChange("minWeightKg", e.target.value)}
                    className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-slate-600">—</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Max"
                    value={filters.maxWeightKg}
                    onChange={(e) => handleFieldChange("maxWeightKg", e.target.value)}
                    className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </fieldset>

              {/* Kargo Bedeli */}
              <fieldset className="vr-range-field">
                <legend className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                  <span>Kargo bedeli</span>
                  <span className="text-[10px] text-slate-500 font-mono">{selectedMarketplace === "amazon" ? "$" : "₺"}</span>
                </legend>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={filters.minShippingPrice}
                    onChange={(e) => handleFieldChange("minShippingPrice", e.target.value)}
                    className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-slate-600">—</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={filters.maxShippingPrice}
                    onChange={(e) => handleFieldChange("maxShippingPrice", e.target.value)}
                    className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </fieldset>

              {/* Kargo Dahil Fiyat */}
              <fieldset className="vr-range-field">
                <legend className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                  <span>Kargo dahil fiyat</span>
                  <span className="text-[10px] text-slate-500 font-mono">₺</span>
                </legend>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={filters.minLandedPrice}
                    onChange={(e) => handleFieldChange("minLandedPrice", e.target.value)}
                    className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-slate-600">—</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={filters.maxLandedPrice}
                    onChange={(e) => handleFieldChange("maxLandedPrice", e.target.value)}
                    className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </fieldset>

              {/* Detaylı Modda: Boyutlar, Komisyon ve Maliyet Varsayımları */}
              {isDetailed && (
                <>
                  {/* Paket Boyutları */}
                  <fieldset className="vr-range-field">
                    <legend className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                      <span>Paket uzunluğu</span>
                      <span className="text-[10px] text-slate-500 font-mono">cm</span>
                    </legend>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        placeholder="Min"
                        value={filters.minLengthCm}
                        onChange={(e) => handleFieldChange("minLengthCm", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-slate-600">—</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Max"
                        value={filters.maxLengthCm}
                        onChange={(e) => handleFieldChange("maxLengthCm", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </fieldset>

                  {/* Satış Komisyonu */}
                  <fieldset className="vr-range-field">
                    <legend className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                      <span>Satış komisyonu · tahmini</span>
                      <span className="text-[10px] text-slate-500 font-mono">₺</span>
                    </legend>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        placeholder="Min"
                        value={filters.minReferralFee}
                        onChange={(e) => handleFieldChange("minReferralFee", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-slate-600">—</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Max"
                        value={filters.maxReferralFee}
                        onChange={(e) => handleFieldChange("maxReferralFee", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </fieldset>

                  {/* Ücret / Fiyat Oranı */}
                  <fieldset className="vr-range-field">
                    <legend className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                      <span>Ücret / fiyat oranı</span>
                      <span className="text-[10px] text-slate-500 font-mono">%</span>
                    </legend>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Min"
                        value={filters.minFeeRatio}
                        onChange={(e) => handleFieldChange("minFeeRatio", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-slate-600">—</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Max"
                        value={filters.maxFeeRatio}
                        onChange={(e) => handleFieldChange("maxFeeRatio", e.target.value)}
                        className="w-1/2 bg-[#060913] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </fieldset>

                  {/* Maliyet Varsayımları */}
                  <fieldset className="vr-cost-scenario bg-[#060913] border border-slate-800 rounded-lg p-2.5 space-y-2">
                    <legend className="text-[10px] font-bold text-slate-400">Marj için maliyet varsayımları</legend>
                    <label className="block text-[10px] text-slate-400">
                      <span>Birim ürün maliyeti (₺)</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={filters.unitProductCost}
                        onChange={(e) => handleFieldChange("unitProductCost", e.target.value)}
                        className="mt-0.5 w-full bg-[#090e1a] border border-slate-700 rounded px-2 py-1 text-white text-xs"
                      />
                    </label>
                  </fieldset>
                </>
              )}

              {/* Gönderim Yöntemi */}
              <div>
                <span className="block text-[11px] font-semibold text-slate-300 mb-1">Gönderim yöntemi</span>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  {["AMZ", "FBA", "FBM"].map((m) => (
                    <label key={m} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.shippingMethods.includes(m)}
                        onChange={() => {
                          const exists = filters.shippingMethods.includes(m);
                          handleFieldChange(
                            "shippingMethods",
                            exists
                              ? filters.shippingMethods.filter((x) => x !== m)
                              : [...filters.shippingMethods, m]
                          );
                        }}
                        className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                      />
                      <span>{m}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Yalnızca Prime / Hızlı Kargo */}
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={filters.primeOnly}
                  onChange={(e) => handleFieldChange("primeOnly", e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                />
                <span>Yalnızca Prime / Hızlı Teslimat</span>
              </label>
            </section>
          </div>
        </div>
      )}

      {/* ============================================================
          5. FILTER FOOTER: SIFIRLA & ÜRÜNLERİ KEŞFET (vr-filter-footer)
          ============================================================ */}
      <div className="vr-filter-footer flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-800/80">
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <Info className="w-3.5 h-3.5 text-slate-500" />
          Kriterler taranan ürünler üzerinde uygulanır.
        </span>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleReset}
            className="vr-quiet px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Filtreleri sıfırla</span>
          </button>

          <button
            type="submit"
            className="vr-primary px-6 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-105 active:scale-95 transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 flex-1 sm:flex-initial"
          >
            <Search className="w-4 h-4" />
            <span>Ürünleri keşfet</span>
          </button>
        </div>
      </div>
    </form>
  );
}
