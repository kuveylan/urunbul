"use client";

import React, { useState } from "react";
import { Sparkles, ExternalLink, ShieldCheck, X } from "lucide-react";

export type AdSlotType = "top_leaderboard" | "sidebar_bottom" | "native_feed";

interface AdBannerProps {
  slot: AdSlotType;
  className?: string;
  adClient?: string;
  adSlot?: string;
}

export default function AdBanner({
  slot,
  className = "",
  adClient,
  adSlot,
}: AdBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  // 1. Üst Leaderboard Banner (TopBar Altı veya Sayfa Başlığı)
  if (slot === "top_leaderboard") {
    return (
      <div
        className={`w-full bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 dark:from-emerald-950/40 dark:via-cyan-950/30 dark:to-blue-950/40 border border-emerald-500/20 dark:border-emerald-500/30 rounded-xl px-4 py-2.5 flex items-center justify-between gap-4 text-xs ${className}`}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
            Sponsorlu
          </span>
          <p className="text-slate-800 dark:text-slate-200 font-medium truncate">
            🚀 <strong>Pazaryeri Entegratörleri & Kargo İndirimleri:</strong> E-ticaret siparişlerinizi tek panelden yönetin, maliyetlerinizi %35 azaltın.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="https://urunbul.me"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition flex items-center gap-1.5 shadow-sm text-xs"
          >
            <span>İncele</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition"
            title="Kapat"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // 2. Sol Menü Altı Sponsor Kutusu (Sidebar Bottom)
  if (slot === "sidebar_bottom") {
    return (
      <div
        className={`mx-3 mb-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-left relative overflow-hidden ${className}`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Sponsor
          </span>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
        <div className="font-semibold text-slate-900 dark:text-white text-xs mb-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Fulfillment & Depolama</span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug mb-2">
          Trendyol & Hepsiburada hızlı teslimat için hazır e-ticaret lojistik çözümleri.
        </p>
        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-1">
          <span>Detaylı Bilgi</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </div>
      </div>
    );
  }

  // 3. Arama Sonuçları İçi Doğal Sponsor Kartı (Native Feed Card)
  return (
    <div
      className={`p-4 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
            Öne Çıkan Partner
          </span>
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
        </div>
        <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
          Barkod & Marka Tescili Hizmetleri
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
          Kendi markanızı koruyun, buybox savaşlarında liste kilitlerini önleyin. E-ticaret satıcılarına özel indirimli marka tescili.
        </p>
      </div>
      <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between">
        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
          %20 İndirim Kodu: URUNBUL
        </span>
        <a
          href="https://urunbul.me"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline inline-flex items-center gap-1"
        >
          <span>Fırsatı Yakala</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
