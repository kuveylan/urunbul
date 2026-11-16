"use client";

import React, { useState, useMemo } from "react";
import {
  Key,
  Search,
  Sparkles,
  TrendingUp,
  BarChart3,
  Zap,
  ArrowRight,
  ShieldCheck,
  Award,
  ExternalLink,
  Star,
  Download,
  Copy,
  Check,
  Filter,
  CheckSquare,
  Square,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  Store,
  RefreshCw,
  Tag,
  ArrowUpDown,
} from "lucide-react";

export interface KeywordItem {
  keyword: string;
  frequency: number;
  market_density_pct: number;
  estimated_monthly_searches: number;
  competition_score: number;
  cerebro_iq_score?: number;
  keyword_type?: string;
  opportunity: string;
  is_autocomplete?: boolean;
}

export interface CerebroKeywordItem {
  keyword: string;
  organic_rank: number;
  estimated_monthly_searches: number;
  competition_score: number;
  cerebro_iq_score: number;
  keyword_type?: string;
  relevance: string;
  competitor_overlap?: number;
  opportunity: string;
}

export interface CerebroMagnetData {
  // Magnet alanları
  query?: string;
  total_products_analyzed?: number;
  total_keywords_found?: number;
  autocomplete_count?: number;
  keywords?: KeywordItem[];
  top_brands?: { brand: string; count: number }[];

  // Cerebro alanları
  identifier?: string;
  target_product?: any;
  total_ranking_keywords?: number;
  top_10_rank_count?: number;
  top_30_rank_count?: number;
  cerebro_keywords?: CerebroKeywordItem[];
  competing_products?: any[];
}

interface CerebroMagnetViewProps {
  mode: "cerebro" | "magnet";
  keywordData: CerebroMagnetData | null;
  loading: boolean;
  onSearch: (q: string) => void;
  onSwitchMode?: (mode: "cerebro" | "magnet") => void;
  onExportToScribbles?: (keywords: string[]) => void;
  errorMessage?: string;
}

export default function CerebroMagnetView({
  mode: initialMode,
  keywordData,
  loading,
  onSearch,
  onSwitchMode,
  onExportToScribbles,
  errorMessage,
}: CerebroMagnetViewProps) {
  const [activeTab, setActiveTab] = useState<"magnet" | "cerebro">(initialMode);
  const [query, setQuery] = useState(
    keywordData ? keywordData.identifier || keywordData.query || "" : ""
  );

  // Tablo İçi Filtreleme State'leri
  const [tableSearch, setTableSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [minSearchVolume, setMinSearchVolume] = useState<string>("");
  const [onlyHighOpportunity, setOnlyHighOpportunity] = useState<boolean>(false);
  const [sortField, setSortField] = useState<string>("volume");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Çoklu Seçim State'i
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Sekme Değişimi
  const handleTabChange = (newMode: "magnet" | "cerebro") => {
    setActiveTab(newMode);
    setSelectedKeywords([]);
    setTableSearch("");
    if (onSwitchMode) {
      onSwitchMode(newMode);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(query.trim());
  };

  const isCerebro = activeTab === "cerebro";

  // Magnet Filtreleme
  const filteredMagnetKeywords = useMemo(() => {
    if (!keywordData || !keywordData.keywords) return [];
    let list = keywordData.keywords;

    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase();
      list = list.filter((k) => k.keyword.toLowerCase().includes(q));
    }
    if (selectedType !== "ALL") {
      list = list.filter((k) => k.keyword_type === selectedType);
    }
    if (minSearchVolume) {
      const minV = parseInt(minSearchVolume, 10);
      if (!isNaN(minV)) list = list.filter((k) => k.estimated_monthly_searches >= minV);
    }
    if (onlyHighOpportunity) {
      list = list.filter((k) => k.opportunity === "Mükemmel" || k.opportunity === "Yüksek");
    }

    return list.sort((a, b) => {
      let valA = a.estimated_monthly_searches;
      let valB = b.estimated_monthly_searches;
      if (sortField === "iq") {
        valA = a.cerebro_iq_score || 0;
        valB = b.cerebro_iq_score || 0;
      } else if (sortField === "density") {
        valA = a.market_density_pct;
        valB = b.market_density_pct;
      } else if (sortField === "competition") {
        valA = a.competition_score;
        valB = b.competition_score;
      }
      return sortDirection === "asc" ? valA - valB : valB - valA;
    });
  }, [keywordData, tableSearch, selectedType, minSearchVolume, onlyHighOpportunity, sortField, sortDirection]);

  // Cerebro Filtreleme
  const filteredCerebroKeywords = useMemo(() => {
    if (!keywordData || !keywordData.cerebro_keywords) return [];
    let list = keywordData.cerebro_keywords;

    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase();
      list = list.filter((k) => k.keyword.toLowerCase().includes(q));
    }
    if (selectedType !== "ALL") {
      list = list.filter((k) => k.keyword_type === selectedType);
    }
    if (minSearchVolume) {
      const minV = parseInt(minSearchVolume, 10);
      if (!isNaN(minV)) list = list.filter((k) => k.estimated_monthly_searches >= minV);
    }
    if (onlyHighOpportunity) {
      list = list.filter((k) => k.opportunity === "Mükemmel" || k.opportunity === "Yüksek");
    }

    return list.sort((a, b) => {
      let valA = a.organic_rank;
      let valB = b.organic_rank;
      if (sortField === "volume") {
        valA = a.estimated_monthly_searches;
        valB = b.estimated_monthly_searches;
        return sortDirection === "asc" ? valA - valB : valB - valA;
      } else if (sortField === "iq") {
        valA = a.cerebro_iq_score;
        valB = b.cerebro_iq_score;
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }
      // Rank için varsayılan küçükten büyüğe
      return sortDirection === "asc" ? valB - valA : valA - valB;
    });
  }, [keywordData, tableSearch, selectedType, minSearchVolume, onlyHighOpportunity, sortField, sortDirection]);

  // Batch Checkbox Yönetimi
  const currentListKeywords = isCerebro
    ? filteredCerebroKeywords.map((k) => k.keyword)
    : filteredMagnetKeywords.map((k) => k.keyword);

  const toggleSelectAll = () => {
    if (selectedKeywords.length === currentListKeywords.length) {
      setSelectedKeywords([]);
    } else {
      setSelectedKeywords([...currentListKeywords]);
    }
  };

  const toggleSelectOne = (kw: string) => {
    setSelectedKeywords((prev) =>
      prev.includes(kw) ? prev.filter((k) => k !== kw) : [...prev, kw]
    );
  };

  // Eylemler: Panoya Kopyala
  const handleCopyKeywords = () => {
    const listToCopy = selectedKeywords.length > 0 ? selectedKeywords : currentListKeywords;
    if (listToCopy.length === 0) return;
    navigator.clipboard.writeText(listToCopy.join(", "));
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  // Eylemler: CSV İndir
  const handleDownloadCsv = () => {
    if (isCerebro) {
      const rows = filteredCerebroKeywords.map((k) => [
        `"${k.keyword.replace(/"/g, '""')}"`,
        k.organic_rank,
        k.estimated_monthly_searches,
        k.competition_score,
        k.cerebro_iq_score,
        `"${k.keyword_type || ""}"`,
        `"${k.relevance}"`,
        `"${k.opportunity}"`,
      ]);
      const header = ["Anahtar Kelime", "Organik Sıra", "Aylık Hacim", "Rekabet Skoru", "Cerebro IQ", "Kelime Tipi", "Eşleşme Tipi", "Fırsat"];
      const csvContent = "\uFEFF" + [header.join(";"), ...rows.map((r) => r.join(";"))].join("\r\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cerebro_keywords_${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      const rows = filteredMagnetKeywords.map((k) => [
        `"${k.keyword.replace(/"/g, '""')}"`,
        k.estimated_monthly_searches,
        k.market_density_pct,
        k.competition_score,
        k.cerebro_iq_score || 0,
        `"${k.keyword_type || ""}"`,
        `"${k.opportunity}"`,
        k.is_autocomplete ? "EVET" : "HAYIR",
      ]);
      const header = ["Anahtar Kelime", "Aylık Arama Hacmi", "Pazar Yoğunluğu %", "Rekabet Skoru", "IQ Skoru", "Kelime Tipi", "Fırsat", "Autocomplete Doğrulaması"];
      const csvContent = "\uFEFF" + [header.join(";"), ...rows.map((r) => r.join(";"))].join("\r\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `magnet_keywords_${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Eylemler: Scribbles'a Aktar
  const handleSendToScribbles = () => {
    const listToSend = selectedKeywords.length > 0 ? selectedKeywords : currentListKeywords.slice(0, 30);
    if (onExportToScribbles) {
      onExportToScribbles(listToSend);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 1. ÜST SEKME SEÇİCİ (🧲 MAGNET & 🧠 CEREBRO) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 shrink-0">
            {isCerebro ? <Layers className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                Pazar SEO Zekası
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                Helium 10 Magnet & Cerebro Motoru
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {isCerebro ? "Ters Ürün & ASIN Trafik Röntgeni (Cerebro)" : "Anahtar Kelime Hacim & Rekabet Keşfi (Magnet)"}
            </h1>
          </div>
        </div>

        {/* Sekme Butonları */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/80 rounded-xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleTabChange("magnet")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              !isCerebro
                ? "bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>🧲</span>
            <span>Magnet (Kelime Keşfi)</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("cerebro")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              isCerebro
                ? "bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>🧠</span>
            <span>Cerebro (Ters Ürün)</span>
          </button>
        </div>
      </div>

      {/* 2. EVRENSEL ARAMA VE GİRDİ KONSOLU */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-3 transition-colors">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                isCerebro
                  ? "Rakip ürün linki, Trendyol ID, Amazon ASIN veya barkod girin (örn: -p-123456 veya kahve makinesi)..."
                  : "Tohum anahtar kelime girin (örn: kahve makinesi, termos, bluetooth kulaklik, airfryer)..."
              }
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700/80 rounded-lg text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs shadow-md shadow-purple-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shrink-0"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Analiz Ediliyor...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>{isCerebro ? "Ters ASIN Trafiğini Çıkar" : "Kelimeleri Keşfet"}</span>
              </>
            )}
          </button>
        </form>

        {/* Hızlı Örnek Aramalar */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
          <span className="font-semibold">Popüler Tohumlar:</span>
          {["kahve makinesi", "airfryer", "termos", "kablosuz kulaklik", "robot supurge"].map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                setQuery(k);
                onSearch(k);
              }}
              className="px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-purple-50 dark:bg-[#1e293b] dark:hover:bg-purple-900/40 text-slate-700 hover:text-purple-700 dark:text-slate-300 dark:hover:text-purple-300 border border-slate-200 dark:border-slate-700/80 transition-colors"
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 3. CEREBRO: HEDEF RAKİP ÜRÜN RÖNTGEN KARTI & İLK 5 RAKİP */}
      {isCerebro && keywordData && keywordData.target_product && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center gap-4 transition-colors">
            {keywordData.target_product.image_url ? (
              <img
                src={keywordData.target_product.image_url}
                alt={keywordData.target_product.title}
                className="w-16 h-20 object-contain rounded-lg bg-white p-1 shrink-0 border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="w-16 h-20 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                <Key className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            )}
            <div className="flex-1 space-y-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                  {keywordData.target_product.brand || "Marka"}
                </span>
                <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                  ID: {keywordData.target_product.external_id}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                {keywordData.target_product.title}
              </h3>
              <div className="flex items-center justify-center md:justify-start gap-4 text-xs text-slate-600 dark:text-slate-300">
                <span className="font-extrabold text-slate-900 dark:text-white">
                  ₺{keywordData.target_product.current_price?.toLocaleString("tr-TR")}
                </span>
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {keywordData.target_product.rating} ({keywordData.target_product.review_count} yorum)
                </span>
                <span className="text-purple-700 dark:text-purple-400 font-bold">
                  Fırsat Puanı: %{keywordData.target_product.opportunity_score || 85}
                </span>
              </div>
            </div>
            {keywordData.target_product.url && (
              <a
                href={keywordData.target_product.url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#1e293b] dark:hover:bg-slate-700 text-purple-700 dark:text-purple-300 border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
              >
                <span>Pazaryerinde Gör</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* İlk 5 Rakip Önizleme Barı */}
          {keywordData.competing_products && keywordData.competing_products.length > 0 && (
            <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40">
              <div className="text-[11px] font-bold text-purple-800 dark:text-purple-300 mb-2 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5" />
                <span>Kıyaslanan İlk 5 Rakip Ürün (Ortak Kelime Taraması)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
                {keywordData.competing_products.slice(0, 5).map((cp: any, idx: number) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px]">
                    <div className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{cp.title}</div>
                    <div className="text-slate-500 dark:text-slate-400 flex items-center justify-between mt-1">
                      <span>₺{cp.current_price?.toLocaleString("tr-TR")}</span>
                      <span className="text-amber-500 font-semibold">★ {cp.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cerebro Özet Metrikleri */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white dark:bg-[#0f172a] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Toplam Sıralanan Kelimeler
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {keywordData.total_ranking_keywords || keywordData.cerebro_keywords?.length || 0}
                <span className="text-xs font-semibold text-slate-500 ml-1">Kelime</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0f172a] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                İlk 10'da Sıralanan Kelimeler
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {keywordData.top_10_rank_count || 0}
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 ml-1">Lider Trafik</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0f172a] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                İlk 30'da Sıralanan Kelimeler
              </div>
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                {keywordData.top_30_rank_count || 0}
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 ml-1">Geniş Erişim</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MAGNET: ÖZET METRİK KARTLARI & LİDER MARKALAR */}
      {!isCerebro && keywordData && keywordData.keywords && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fadeIn">
          <div className="bg-white dark:bg-[#0f172a] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Analiz Edilen Ürün Havuzu
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {keywordData.total_products_analyzed || 0}
              <span className="text-xs font-semibold text-slate-500 ml-1">Pazar Ürünü</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0f172a] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Çıkarılan Organik Anahtar Kelimeler
            </div>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
              {keywordData.keywords.length}
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 ml-1">Kelime & Tamlama</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0f172a] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Lider Marka Yoğunluğu
            </div>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {keywordData.top_brands && keywordData.top_brands.length > 0 ? (
                keywordData.top_brands.map((b, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20"
                  >
                    {b.brand} ({b.count})
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">Marka bulunamadı</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. GELİŞMİŞ FİLTRE VE SEO AKSİYON ÇUBUĞU (TOOLBAR) */}
      {((isCerebro && keywordData?.cerebro_keywords) || (!isCerebro && keywordData?.keywords)) && (
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-4 shadow-xs space-y-3 transition-colors">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Sol: Tablo İçi Arama & Filtreler */}
            <div className="flex flex-wrap items-center gap-2 flex-1">
              {/* Tablo Arama */}
              <div className="relative min-w-[180px] flex-1 sm:flex-none">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  placeholder="Kelime filtrele..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Kelime Tipi Seçici */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Tüm Kelime Tipleri</option>
                <option value="Tekil Kök">Tekil Kök (1 Kelime)</option>
                <option value="2'li Tamlama">2'li Tamlama</option>
                <option value="Uzun Kuyruk (Long-tail)">Uzun Kuyruk (3+ Kelime)</option>
              </select>

              {/* Min Hacim Dropdown */}
              <select
                value={minSearchVolume}
                onChange={(e) => setMinSearchVolume(e.target.value)}
                className="bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="">Tüm Hacimler</option>
                <option value="1000">1.000+ Arama/ay</option>
                <option value="5000">5.000+ Arama/ay</option>
                <option value="10000">10.000+ Arama/ay</option>
                <option value="20000">20.000+ Arama/ay</option>
              </select>

              {/* Sadece Yüksek Fırsat Toggle */}
              <button
                type="button"
                onClick={() => setOnlyHighOpportunity(!onlyHighOpportunity)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1 ${
                  onlyHighOpportunity
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-600"
                    : "bg-slate-50 dark:bg-[#0b0f19] text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700"
                }`}
              >
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <span>Sadece Yüksek Fırsatlılar</span>
              </button>
            </div>

            {/* Sağ: SEO Eylemleri (Scribbles'a Aktar, CSV İndir, Panoya Kopyala) */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Panoya Kopyala */}
              <button
                type="button"
                onClick={handleCopyKeywords}
                title="Seçili veya tablodaki tüm kelimeleri panoya kopyalar"
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                {copyFeedback ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Panoya Kopyala</span>
                  </>
                )}
              </button>

              {/* CSV İndir */}
              <button
                type="button"
                onClick={handleDownloadCsv}
                title="Excel uyumlu CSV formatında dışa aktar"
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV İndir</span>
              </button>

              {/* Scribbles (SEO Builder)'a Aktar */}
              {onExportToScribbles && (
                <button
                  type="button"
                  onClick={handleSendToScribbles}
                  title="Kelimeleri doğrudan SEO Başlık ve Madde Sihirbazı'na (Scribbles) gönderir"
                  className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-purple-600/30 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Scribbles'a Aktar</span>
                </button>
              )}
            </div>
          </div>

          {/* Seçim Bilgi Barı */}
          {selectedKeywords.length > 0 && (
            <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-purple-700 dark:text-purple-300">
              <span className="font-bold">
                {selectedKeywords.length} kelime seçildi.
              </span>
              <button
                type="button"
                onClick={() => setSelectedKeywords([])}
                className="text-xs underline hover:text-purple-900 dark:hover:text-white"
              >
                Seçimi Temizle
              </button>
            </div>
          )}
        </div>
      )}

      {/* 6. TABLO: CEREBRO MODU */}
      {isCerebro && keywordData && keywordData.cerebro_keywords && (
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs transition-colors animate-fadeIn">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0b0f19] border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                  <th className="py-3 px-3 w-10">
                    <button onClick={toggleSelectAll} className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
                      {selectedKeywords.length === currentListKeywords.length && currentListKeywords.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-purple-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4">Trafik Çeken Anahtar Kelime</th>
                  <th className="py-3 px-4">Organik Sıra (Rank)</th>
                  <th className="py-3 px-4">Kelime Tipi</th>
                  <th className="py-3 px-4">Aylık Arama Hacmi</th>
                  <th className="py-3 px-4">Cerebro IQ</th>
                  <th className="py-3 px-4">Eşleşme Tipi</th>
                  <th className="py-3 px-4">Rakip Ortaklığı</th>
                  <th className="py-3 px-4 text-right">Potansiyel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {filteredCerebroKeywords.length > 0 ? (
                  filteredCerebroKeywords.map((kw, idx) => {
                    const isSelected = selectedKeywords.includes(kw.keyword);
                    return (
                      <tr
                        key={idx}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                          isSelected ? "bg-purple-50/60 dark:bg-purple-950/20" : ""
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <button onClick={() => toggleSelectOne(kw.keyword)} className="text-slate-400 hover:text-slate-800 dark:hover:text-white">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-purple-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                          <Key className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                          <span>{kw.keyword}</span>
                        </td>
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black ${
                              kw.organic_rank <= 3
                                ? "bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40"
                                : kw.organic_rank <= 10
                                ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            {kw.organic_rank <= 3 && <Award className="w-3 h-3 text-amber-500" />}
                            #{kw.organic_rank}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            {kw.keyword_type || "2'li Tamlama"}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-bold text-purple-700 dark:text-purple-300 whitespace-nowrap">
                          ~{kw.estimated_monthly_searches?.toLocaleString("tr-TR")} /ay
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          <span className="text-purple-700 dark:text-purple-400">{kw.cerebro_iq_score}</span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {kw.relevance}
                        </td>
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <span className="text-slate-600 dark:text-slate-400 font-medium">
                            {kw.competitor_overlap ? `${kw.competitor_overlap}/5 Rakipte` : "Özgün"}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                              kw.opportunity === "Mükemmel"
                                ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30"
                                : "bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30"
                            }`}
                          >
                            {kw.opportunity}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                      Filtre kriterlerine uygun anahtar kelime bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. TABLO: MAGNET MODU */}
      {!isCerebro && keywordData && keywordData.keywords && (
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs transition-colors animate-fadeIn">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0b0f19] border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                  <th className="py-3 px-3 w-10">
                    <button onClick={toggleSelectAll} className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
                      {selectedKeywords.length === currentListKeywords.length && currentListKeywords.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-purple-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4">Anahtar Kelime (Search Term)</th>
                  <th className="py-3 px-4">Kelime Tipi</th>
                  <th className="py-3 px-4">Tahmini Aylık Arama Hacmi</th>
                  <th className="py-3 px-4">Pazar Ürün Yoğunluğu</th>
                  <th className="py-3 px-4">Satıcı Rekabet Seviyesi</th>
                  <th className="py-3 px-4">Cerebro IQ</th>
                  <th className="py-3 px-4 text-right">Fırsat Değerlendirmesi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {filteredMagnetKeywords.length > 0 ? (
                  filteredMagnetKeywords.map((kw, idx) => {
                    const isSelected = selectedKeywords.includes(kw.keyword);
                    return (
                      <tr
                        key={idx}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                          isSelected ? "bg-purple-50/60 dark:bg-purple-950/20" : ""
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <button onClick={() => toggleSelectOne(kw.keyword)} className="text-slate-400 hover:text-slate-800 dark:hover:text-white">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-purple-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                          <Key className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                          <span>{kw.keyword}</span>
                          {kw.is_autocomplete && (
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60" title="Gerçek Tüketici Arama Tamamlama Doğrulaması">
                              ⚡ Canlı Arama
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            {kw.keyword_type || "2'li Tamlama"}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-bold text-purple-700 dark:text-purple-300 whitespace-nowrap">
                          ~{kw.estimated_monthly_searches.toLocaleString("tr-TR")} /ay
                        </td>
                        <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          %{kw.market_density_pct}
                        </td>
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full ${
                                  kw.competition_score > 70
                                    ? "bg-rose-500"
                                    : kw.competition_score > 40
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                }`}
                                style={{ width: `${kw.competition_score}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                              {kw.competition_score}/100
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          <span className="text-purple-700 dark:text-purple-400">{kw.cerebro_iq_score || 0}</span>
                        </td>
                        <td className="py-2.5 px-4 text-right whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                              kw.opportunity === "Mükemmel"
                                ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30"
                                : kw.opportunity === "Yüksek"
                                ? "bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30"
                                : kw.opportunity === "Orta"
                                ? "bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            {kw.opportunity}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                      Filtre kriterlerine uygun anahtar kelime bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
