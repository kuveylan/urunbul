"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ExternalLink,
  Store,
  TrendingDown,
  TrendingUp,
  Percent,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  ShoppingBag,
  Star,
  Truck,
  Sparkles,
} from "lucide-react";
import { Product } from "./BlackBoxView";
import { apiUrl } from "@/lib/api";

interface CrossMarketModalProps {
  product: Product;
  onClose: () => void;
}

interface MarketOffer {
  marketplace: string;
  seller_name: string;
  price: number;
  original_price?: number;
  discount_pct?: number;
  product_url: string;
  seller_rating?: number;
  review_count?: number;
  free_shipping?: boolean;
}

interface ComparisonData {
  title: string;
  lowest_price: number;
  highest_price: number;
  average_price: number;
  total_offers_count: number;
  offers: MarketOffer[];
  price_verdict?: {
    status: string;
    label: string;
    message: string;
  };
}

export default function CrossMarketModal({ product, onClose }: CrossMarketModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ComparisonData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchComparison = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      // Ürünün başlığı veya model kodunu temizleyip arat
      const cleanQuery = product.title
        .replace(/\b(adet|paket|renk|beden)\b/gi, "")
        .slice(0, 70)
        .trim();

      const res = await fetch(apiUrl(`/api/v1/compare?q=${encodeURIComponent(cleanQuery || product.title)}`));
      if (!res.ok) throw new Error("Karşılaştırma verisi alınamadı");

      const compData: ComparisonData = await res.json();
      setData(compData);
    } catch (err: any) {
      setErrorMessage("4 pazaryeri eşleşmesi aranırken bir hata oluştu veya eşleşen teklif bulunamadı.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison();
  }, [product]);

  // Pazaryeri kart konfigürasyonu
  const getMarketInfo = (mp: string) => {
    const norm = (mp || "").toLowerCase();
    if (norm.includes("trendyol")) {
      return {
        name: "Trendyol",
        color: "text-orange-600 dark:text-orange-400",
        bg: "bg-orange-500/10",
        border: "border-orange-500/30",
        icon: "🇹🇷",
      };
    } else if (norm.includes("hepsiburada")) {
      return {
        name: "Hepsiburada",
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        icon: "🟠",
      };
    } else if (norm.includes("amazon")) {
      return {
        name: "Amazon TR",
        color: "text-sky-600 dark:text-sky-400",
        bg: "bg-sky-500/10",
        border: "border-sky-500/30",
        icon: "📦",
      };
    } else if (norm.includes("n11")) {
      return {
        name: "N11",
        color: "text-purple-600 dark:text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/30",
        icon: "🟣",
      };
    }
    return {
      name: "Pazaryeri",
      color: "text-slate-600 dark:text-slate-400",
      bg: "bg-slate-500/10",
      border: "border-slate-500/30",
      icon: "🏪",
    };
  };

  // 4 Pazar için en uygun teklifleri grupla
  const groupedOffers = React.useMemo(() => {
    const groups: Record<string, MarketOffer> = {};

    // Mevcut incelenen ürünün ait olduğu pazaryeri slotunu doldur
    const refMp = (product.marketplace || "trendyol").toLowerCase();
    const cleanRefKey = refMp.includes("trendyol")
      ? "trendyol"
      : refMp.includes("hepsiburada")
      ? "hepsiburada"
      : refMp.includes("amazon")
      ? "amazon"
      : refMp.includes("n11")
      ? "n11"
      : "trendyol";

    groups[cleanRefKey] = {
      marketplace: cleanRefKey,
      seller_name: product.seller_name || `${cleanRefKey.charAt(0).toUpperCase() + cleanRefKey.slice(1)} Satıcısı`,
      price: product.current_price,
      original_price: product.original_price,
      product_url: product.url,
      seller_rating: product.rating,
      review_count: product.review_count,
    };

    if (data && data.offers) {
      for (const off of data.offers) {
        const mpKey = (off.marketplace || "").toLowerCase();
        const normKey = mpKey.includes("trendyol")
          ? "trendyol"
          : mpKey.includes("hepsiburada")
          ? "hepsiburada"
          : mpKey.includes("amazon")
          ? "amazon"
          : mpKey.includes("n11")
          ? "n11"
          : mpKey;

        if (!groups[normKey] || off.price < groups[normKey].price) {
          groups[normKey] = { ...off, marketplace: normKey };
        }
      }
    }
    return groups;
  }, [data, product]);

  const targetMarketplaces = ["trendyol", "hepsiburada", "amazon", "n11"];

  // Arbitraj hesabı
  const arbitrageAnalysis = React.useMemo(() => {
    const prices = Object.values(groupedOffers).map((o) => o.price).filter((p) => p > 0);
    if (prices.length < 2) return null;

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const gap = Math.round(maxPrice - minPrice);
    const pct = Math.round((gap / minPrice) * 100);

    const cheapest = Object.values(groupedOffers).find((o) => o.price === minPrice);
    const highest = Object.values(groupedOffers).find((o) => o.price === maxPrice);

    return {
      minPrice,
      maxPrice,
      gap,
      pct,
      cheapest,
      highest,
    };
  }, [groupedOffers]);

  const refInfo = getMarketInfo(product.marketplace);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl transition-colors pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {/* Mobil Çekmece Göstergesi (Drag Handle) */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-2.5 sm:hidden" />

        {/* Üst Başlık & Kapat */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
                  4 Pazaryeri Arbitraj Radarı
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                  Canlı Çapraz Fiyat Röntgeni
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-1 mt-0.5">
                {product.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchComparison}
              disabled={loading}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition disabled:opacity-50"
              title="Fiyatları Yenile"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* İçerik */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 scrollbar-thin">
          {/* Ürün & Fiyat Özeti */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-12 h-14 object-contain rounded-lg bg-white p-0.5 shrink-0 border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-12 h-14 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-6 h-6 text-slate-500" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${refInfo.border} ${refInfo.bg} ${refInfo.color}`}>
                    {refInfo.icon} {refInfo.name}
                  </span>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                    {product.brand || "GENEL"}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                  {product.title}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>Referans Fiyat: <strong className="text-slate-900 dark:text-white">₺{product.current_price.toLocaleString("tr-TR")}</strong></span>
                  <span>•</span>
                  <span>Satıcı: {product.seller_name || `${refInfo.name} Satıcısı`}</span>
                </div>
              </div>
            </div>

            {/* Arbitraj Kâr Özeti */}
            {arbitrageAnalysis && arbitrageAnalysis.gap > 0 ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 shrink-0 w-full sm:w-auto justify-between">
                <div>
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    Pazarlar Arası Net Kâr Fırsatı
                  </div>
                  <div className="text-xl font-black text-emerald-700 dark:text-emerald-400">
                    +₺{arbitrageAnalysis.gap.toLocaleString("tr-TR")}
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-300 ml-1.5">
                      (%{arbitrageAnalysis.pct} Marj)
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* 4 BÜYÜK PAZARYERİ KARTLARI (TRENDYOL, HEPSİBURADA, AMAZON TR, N11) */}
          <div>
            <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Pazaryeri Teklifleri (Canlı Fiyat Tablosu)</span>
              <span className="text-[11px] text-slate-500 font-normal">
                {loading ? "Fiyatlar taranıyor..." : "Otomatik Hiyerarşik Eşleştirme"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {targetMarketplaces.map((mpKey) => {
                const info = getMarketInfo(mpKey);
                const offer = groupedOffers[mpKey];
                const isCheapest = arbitrageAnalysis && offer && offer.price === arbitrageAnalysis.minPrice;

                return (
                  <div
                    key={mpKey}
                    className={`rounded-xl border p-4 flex flex-col justify-between transition-all relative overflow-hidden ${
                      offer
                        ? isCheapest
                          ? "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/50 shadow-sm shadow-emerald-500/10"
                          : "bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                        : "bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/40 opacity-70"
                    }`}
                  >
                    {isCheapest && (
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500 text-white">
                        EN UCUZ
                      </div>
                    )}

                    <div>
                      {/* Pazar Başlığı */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base">{info.icon}</span>
                        <span className={`text-xs font-bold ${info.color}`}>
                          {info.name}
                        </span>
                      </div>

                      {/* Fiyat Bilgisi */}
                      {loading ? (
                        <div className="space-y-1.5 my-3 animate-pulse">
                          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-16" />
                        </div>
                      ) : offer ? (
                        <div className="my-2">
                          <div className="text-2xl font-black text-slate-900 dark:text-white">
                            ₺{offer.price.toLocaleString("tr-TR")}
                          </div>
                          {offer.original_price && offer.original_price > offer.price && (
                            <div className="text-[11px] text-slate-400 dark:text-slate-500 line-through">
                              ₺{offer.original_price.toLocaleString("tr-TR")}
                            </div>
                          )}
                          <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">
                            Satıcı: <span className="text-slate-800 dark:text-slate-300 font-semibold">{offer.seller_name}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="my-3 text-xs text-slate-400 dark:text-slate-500 italic">
                          Bu pazarda doğrudan eşleşen teklif bulunamadı.
                        </div>
                      )}
                    </div>

                    {/* Aksiyon / Mağazaya Git */}
                    {offer && offer.product_url ? (
                      <a
                        href={offer.product_url}
                        target="_blank"
                        rel="noreferrer"
                        className={`w-full mt-3 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                          isCheapest
                            ? "btn-emerald text-white shadow-xs"
                            : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        <span>Pazarda İncele</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <div className="w-full mt-3 py-2 px-3 rounded-lg text-[11px] font-semibold text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-900 text-center">
                        Teklif Yok
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Arbitraj Kâr Stratejisi Tavsiyesi */}
          {arbitrageAnalysis && arbitrageAnalysis.cheapest && arbitrageAnalysis.highest && (
            <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-gradient-to-r dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-purple-950/40 border border-blue-200 dark:border-blue-800/40">
              <div className="flex items-center gap-2 mb-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold text-blue-800 dark:text-blue-300">
                  Otomatik Arbitraj & Stok Kâr Önerisi
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Bu ürün şu anda en uygun fiyatla{" "}
                <strong className="text-slate-900 dark:text-white">
                  {getMarketInfo(arbitrageAnalysis.cheapest.marketplace).name}
                </strong>{" "}
                üzerinde{" "}
                <strong className="text-emerald-700 dark:text-emerald-400 font-bold">
                  ₺{arbitrageAnalysis.minPrice.toLocaleString("tr-TR")}
                </strong>{" "}
                fiyatla satılırken,{" "}
                <strong className="text-slate-900 dark:text-white">
                  {getMarketInfo(arbitrageAnalysis.highest.marketplace).name}
                </strong>{" "}
                pazarında{" "}
                <strong className="text-slate-800 dark:text-slate-200 font-bold">
                  ₺{arbitrageAnalysis.maxPrice.toLocaleString("tr-TR")}
                </strong>{" "}
                seviyesindedir. İki pazar arasında{" "}
                <strong className="text-emerald-700 dark:text-emerald-400 font-bold">
                  ₺{arbitrageAnalysis.gap.toLocaleString("tr-TR")} (%{arbitrageAnalysis.pct})
                </strong>{" "}
                brüt arbitraj kâr marjı bulunmaktadır.
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Alt Kapat */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-white transition"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
