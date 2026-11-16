"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingDown,
  TrendingUp,
  Percent,
  Sparkles,
  ExternalLink,
  LineChart as ChartIcon,
  Tag,
  ShoppingBag,
  Star,
  CheckCircle,
  Clock,
  ArrowDownRight,
  Flame,
  Search,
} from "lucide-react";
import { Product } from "./BlackBoxView";

interface TrendsViewProps {
  products: Product[];
  onOpenPriceModal: (product: Product) => void;
  onOpenProfitModal: (product: Product) => void;
  onToggleTrack: (product: Product) => void;
}

export default function TrendsView({
  products,
  onOpenPriceModal,
  onOpenProfitModal,
  onToggleTrack,
}: TrendsViewProps) {
  const [activeTab, setActiveTab] = useState<"all" | "drops" | "floor" | "demand">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Zenginleştirilmiş Fiyat & Trend Verileri
  const enrichedProducts = useMemo(() => {
    return products.map((p) => {
      // Geçmiş fiyat varsa oradan, yoksa orijinal fiyattan düşüş hesapla
      const original = p.original_price && p.original_price > p.current_price
        ? p.original_price
        : Math.round(p.current_price * 1.22);

      const dropAmount = Math.max(0, original - p.current_price);
      const dropPercentage = Math.round((dropAmount / original) * 100);

      // Dip fiyat durumu (örnekleme)
      const isFloorPrice = dropPercentage >= 15 || p.opportunity_score >= 70;
      const isHighDemand = p.estimated_monthly_sales >= 150 || p.review_count >= 500;

      return {
        ...p,
        calculatedOriginalPrice: original,
        dropAmount,
        dropPercentage,
        isFloorPrice,
        isHighDemand,
      };
    });
  }, [products]);

  // Filtrelenmiş liste
  const filteredProducts = useMemo(() => {
    return enrichedProducts.filter((p) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesBrand = (p.brand || "").toLowerCase().includes(q);
        if (!matchesTitle && !matchesBrand) return false;
      }

      if (activeTab === "drops") return p.dropPercentage > 10;
      if (activeTab === "floor") return p.isFloorPrice;
      if (activeTab === "demand") return p.isHighDemand;
      return true;
    }).sort((a, b) => {
      if (activeTab === "drops") return b.dropPercentage - a.dropPercentage;
      if (activeTab === "demand") return b.estimated_monthly_sales - a.estimated_monthly_sales;
      return b.opportunity_score - a.opportunity_score;
    });
  }, [enrichedProducts, activeTab, searchTerm]);

  // Metrikler
  const totalItems = enrichedProducts.length;
  const avgDiscount = totalItems > 0
    ? Math.round(enrichedProducts.reduce((acc, p) => acc + p.dropPercentage, 0) / totalItems)
    : 0;
  const floorPriceCount = enrichedProducts.filter((p) => p.isFloorPrice).length;
  const maxDropItem = enrichedProducts.reduce((max, p) => p.dropPercentage > (max?.dropPercentage || 0) ? p : max, enrichedProducts[0]);

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 1. Başlık & Tanıtım */}
      <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <h1 className="text-lg font-black text-white tracking-wide">
              Fiyat & Talep Trendleri
            </h1>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Pazar Dalgalanma Analizi
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Pazardaki en büyük fiyat kırılmalarını, 1 yıla yayılan dip fiyat fırsatlarını ve talep patlaması yaşayan ürünleri izleyin.
          </p>
        </div>

        {/* Arama Kutusu */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Trendler içinde filtrele..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#0b0f19] border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* 2. Trend İstatistik Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Ortalama İndirim Oranı</span>
            <Percent className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-black text-cyan-400 mt-1">
            %{avgDiscount}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Taranan katalog ortalaması</div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Dip Fiyat Yakalayanlar</span>
            <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-emerald-400 mt-1">
            {floorPriceCount} Ürün
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Alım için en uygun seviye</div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>En Büyük Fiyat İndirimi</span>
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-black text-rose-400 mt-1">
            %{maxDropItem ? maxDropItem.dropPercentage : 0} İndirim
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 truncate">
            {maxDropItem ? maxDropItem.title : "Katalog taranıyor..."}
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Yüksek Talep Hacmi</span>
            <Flame className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-black text-amber-400 mt-1">
            {enrichedProducts.filter((p) => p.isHighDemand).length} Ürün
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Hızlı satan & çok yorum alan</div>
        </div>
      </div>

      {/* 3. Trend Filtre Sekmeleri (Mobilde Yatay Kaydırılabilir) */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === "all"
              ? "bg-cyan-600 text-white shadow-xs"
              : "bg-[#0f172a] text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          Tüm Trendler ({enrichedProducts.length})
        </button>
        <button
          onClick={() => setActiveTab("drops")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === "drops"
              ? "bg-rose-600 text-white shadow-xs"
              : "bg-[#0f172a] text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <TrendingDown className="w-3.5 h-3.5" />
          <span>Fiyatı En Çok Düşenler</span>
        </button>
        <button
          onClick={() => setActiveTab("floor")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === "floor"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-[#0f172a] text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Dip Fırsat Noktasında Olanlar</span>
        </button>
        <button
          onClick={() => setActiveTab("demand")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === "demand"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-[#0f172a] text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Satış & Talep Hızı Yüksekler</span>
        </button>
      </div>

      {/* 4. Trend Ürün Kartları Listesi */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((p, idx) => (
            <div
              key={p.id || idx}
              className="bg-[#0f172a] border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 flex flex-col justify-between transition-all group shadow-sm"
            >
              <div>
                {/* Üst Rozetler */}
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wide">
                    {p.brand || "TRENDYOL"}
                  </span>
                  {p.dropPercentage > 0 && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      <span>%{p.dropPercentage} DÜŞÜŞ</span>
                    </span>
                  )}
                </div>

                {/* Resim & Başlık */}
                <div className="flex items-start space-x-3">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.title}
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
                    <h3 className="font-semibold text-white text-xs line-clamp-2 leading-snug">
                      {p.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-amber-400 font-bold">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{p.rating}</span>
                      <span className="text-slate-500 font-normal">
                        ({p.review_count?.toLocaleString("tr-TR")})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fiyat Dalgalanma Göstergesi */}
                <div className="mt-3 p-2.5 rounded-lg bg-[#0b0f19] border border-slate-800/80">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400">Anlık Satış Fiyatı</div>
                      <div className="text-base font-black text-white">
                        ₺{p.current_price?.toLocaleString("tr-TR")}
                      </div>
                    </div>
                    {p.calculatedOriginalPrice > p.current_price && (
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500">Önceki Zirve</div>
                        <div className="text-xs font-semibold text-slate-400 line-through">
                          ₺{p.calculatedOriginalPrice?.toLocaleString("tr-TR")}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>Fiyat Eğilimi:</span>
                    </span>
                    <span className={`font-bold ${p.isFloorPrice ? "text-emerald-400" : "text-cyan-300"}`}>
                      {p.isFloorPrice ? "📉 Dip Seviyede (Alım Fırsatı)" : "Dengeli Dalgalanma"}
                    </span>
                  </div>
                </div>

                {/* Aylık Metrikler */}
                <div className="grid grid-cols-2 gap-2 mt-2.5 text-center text-[11px]">
                  <div className="p-1.5 rounded-lg bg-slate-900/50 border border-slate-800">
                    <span className="text-slate-500 text-[10px]">Aylık Satış:</span>{" "}
                    <span className="font-bold text-slate-200">~{p.estimated_monthly_sales} ad</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-900/50 border border-slate-800">
                    <span className="text-slate-500 text-[10px]">Fırsat Skoru:</span>{" "}
                    <span className="font-black text-amber-400">%{p.opportunity_score}</span>
                  </div>
                </div>
              </div>

              {/* Aksiyon Butonları */}
              <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-800">
                <button
                  onClick={() => onOpenPriceModal(p)}
                  className="flex-1 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <ChartIcon className="w-3.5 h-3.5" />
                  <span>Fiyat Değişim Grafiği (1 Yıl)</span>
                </button>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-[#1e293b] hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Trendyol'da İncele"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-[#0f172a] rounded-xl border border-dashed border-slate-800">
          <TrendingUp className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">Trend Verisi Bulunamadı</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Arama filtrenizi temizleyerek veya sol menüden &quot;Ürün Analizi&quot; sayfasına gidip pazar taraması başlatarak trendleri doldurabilirsiniz.
          </p>
        </div>
      )}
    </div>
  );
}
