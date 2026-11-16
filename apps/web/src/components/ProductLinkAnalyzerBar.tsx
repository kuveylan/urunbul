"use client";

import React, { useState } from "react";
import { Link2, Sparkles, Loader2, CheckCircle2, AlertCircle, X, ExternalLink } from "lucide-react";
import { apiUrl } from "@/lib/api";
import {
  MarketplaceType,
  findBestCategoryMatch,
  MARKETPLACE_CATEGORIES,
} from "@/data/marketplaceCategories";

export interface AnalyzedProductData {
  marketplace: MarketplaceType;
  title: string;
  price: number;
  category: string;
  desi: number;
  imageUrl?: string;
  url: string;
}

interface ProductLinkAnalyzerBarProps {
  onProductAnalyzed: (data: AnalyzedProductData) => void;
  currentMarketplace?: MarketplaceType;
  className?: string;
}

export default function ProductLinkAnalyzerBar({
  onProductAnalyzed,
  currentMarketplace,
  className = "",
}: ProductLinkAnalyzerBarProps) {
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [lastAnalyzed, setLastAnalyzed] = useState<AnalyzedProductData | null>(null);

  // İstemci tarafı akıllı slug ve pazaryeri çözücü (Hızlı / Çevrimdışı Fallback)
  const parseClientFallback = (url: string): AnalyzedProductData => {
    const clean = url.trim();
    const lower = clean.toLowerCase();

    let mp: MarketplaceType = "Trendyol";
    if (lower.includes("hepsiburada.com")) {
      mp = "Hepsiburada";
    } else if (lower.includes("amazon.com.tr") || lower.includes("amazon.tr")) {
      mp = "Amazon TR";
    } else if (lower.includes("n11.com")) {
      mp = "N11";
    }

    // URL path slug'ından başlık çıkarma
    let title = "";
    try {
      const urlObj = new URL(clean.startsWith("http") ? clean : `https://${clean}`);
      const segments = urlObj.pathname.split("/").filter((s) => s && !/^\d+$/.test(s));
      if (segments.length > 0) {
        let lastSegment = segments[segments.length - 1];
        lastSegment = decodeURIComponent(lastSegment)
          .replace(/-p-\d+.*|-d-\d+.*|\.html.*/i, "")
          .replace(/[-_]+/g, " ");
        title = lastSegment
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
      }
    } catch {
      title = `${mp} Ürünü`;
    }

    if (!title || title.length < 3) {
      title = `${mp} Fırsat Ürünü`;
    }

    // Kategoriyi ve desiyi metne göre eşleştir
    const matchedCategory = findBestCategoryMatch(title, mp);

    return {
      marketplace: mp,
      title,
      price: 549.90, // Varsayılan referans
      category: matchedCategory.name,
      desi: matchedCategory.defaultDesi,
      url: clean,
    };
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setErrorMsg("Lütfen geçerli bir ürün bağlantısı girin.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(apiUrl("/api/v1/calculator/analyze-link"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      if (res.ok) {
        const data = await res.json();
        const payload: AnalyzedProductData = {
          marketplace: (data.marketplace as MarketplaceType) || "Trendyol",
          title: data.title || "Çözümlenen Ürün",
          price: Number(data.selling_price) || 499.0,
          category: data.category,
          desi: Number(data.estimated_desi) || 1.0,
          imageUrl: data.image_url,
          url: data.url || trimmed,
        };
        setLastAnalyzed(payload);
        onProductAnalyzed(payload);
      } else {
        // Backend yanıt vermezse istemci tarafı zeki fallback
        const fallback = parseClientFallback(trimmed);
        setLastAnalyzed(fallback);
        onProductAnalyzed(fallback);
      }
    } catch {
      // Ağ hatası durumunda istemci tarafı fallback
      const fallback = parseClientFallback(trimmed);
      setLastAnalyzed(fallback);
      onProductAnalyzed(fallback);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Link Giriş Formu */}
      <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row items-stretch gap-2">
        <div className="relative flex-1">
          <Link2 className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value);
              if (errorMsg) setErrorMsg("");
            }}
            placeholder="Pazaryeri ürün linkini yapıştırın (Trendyol, Hepsiburada, Amazon TR, N11)..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-inner"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !urlInput.trim()}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-md shadow-emerald-600/20 shrink-0 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analiz Ediliyor...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Linki Analiz Et & Doldur</span>
            </>
          )}
        </button>
      </form>

      {/* Hata Uyarısı */}
      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Başarı Özeti Kartı */}
      {lastAnalyzed && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {lastAnalyzed.imageUrl ? (
              <img
                src={lastAnalyzed.imageUrl}
                alt={lastAnalyzed.title}
                className="w-11 h-11 rounded-lg object-cover border border-emerald-500/30 shrink-0 bg-white"
              />
            ) : (
              <div className="w-11 h-11 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-sm shrink-0">
                📦
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-900 dark:text-white truncate max-w-sm">
                  {lastAnalyzed.title}
                </span>
                <span className="text-[10px] font-black px-2 py-0.2 rounded-full bg-emerald-600 text-white">
                  {lastAnalyzed.marketplace}
                </span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 flex items-center gap-2 flex-wrap">
                <span>Fiyat: <strong>₺{lastAnalyzed.price.toFixed(2)}</strong></span>
                <span>•</span>
                <span>Kategori: <strong>{lastAnalyzed.category}</strong></span>
                <span>•</span>
                <span>Tahmini Desi: <strong>{lastAnalyzed.desi} Desi</strong></span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setLastAnalyzed(null)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded transition"
            title="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
