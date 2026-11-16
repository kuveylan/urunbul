"use client";

import React, { useState } from "react";
import { Sparkles, Mail, Megaphone, X, ArrowUpRight } from "lucide-react";

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
}: AdBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  // 1. Üst Leaderboard Banner (TopBar Altı / Sayfa Başı)
  if (slot === "top_leaderboard") {
    return (
      <div
        className={`w-full bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between gap-4 text-xs shadow-sm transition-colors ${className}`}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shrink-0 flex items-center gap-1">
            <Megaphone className="w-3 h-3 text-emerald-500" />
            Reklam Alanı
          </span>
          <p className="text-slate-700 dark:text-slate-300 font-medium truncate">
            📢 <strong>Bu alana reklam verebilirsiniz.</strong> E-ticaret satıcılarına doğrudan ulaşmak, lojistik veya yazılım çözümlerinizi tanıtmak için bizimle iletişime geçin.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="mailto:reklam@urunbul.me?subject=UrunBul%20Reklam%20ve%20Sponsorluk%20Talebi"
            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition flex items-center gap-1 text-xs shadow-xs"
          >
            <span>Reklam Verin</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
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

  // 2. Sol Menü Altı Sponsor / Reklam Kutusu (Sidebar Bottom)
  if (slot === "sidebar_bottom") {
    return (
      <div
        className={`mx-3 mb-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-left relative overflow-hidden transition-colors ${className}`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Megaphone className="w-2.5 h-2.5 text-emerald-500" />
            Reklam Alanı
          </span>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title="Kapat"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
        <div className="font-bold text-slate-900 dark:text-white text-xs mb-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-500" />
          <span>Bu Alana Reklam Verin</span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug mb-2">
          Türkiye pazarındaki binlerce aktif satıcıya ve mağaza sahibine markanızı duyurun.
        </p>
        <a
          href="mailto:reklam@urunbul.me?subject=UrunBul%20Sidebar%20Reklam%20Talebi"
          className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-1 hover:underline"
        >
          <span>reklam@urunbul.me</span>
          <ArrowUpRight className="w-2.5 h-2.5" />
        </a>
      </div>
    );
  }

  // 3. Arama Sonuçları İçi Doğal Kart (Native Feed Card)
  return (
    <div
      className={`p-4 rounded-xl border border-dashed border-emerald-500/40 bg-slate-50 dark:bg-slate-900/40 flex flex-col justify-between transition-colors ${className}`}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
            <Megaphone className="w-3 h-3 text-emerald-500" />
            Sponsorlu Vitrin
          </span>
        </div>
        <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
          Bu Alana Reklam Verebilirsiniz
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
          Ürün ve pazar analizi yapan aktif e-ticaret profesyonellerine ürün, lojistik veya yazılım hizmetlerinizi tanıtın.
        </p>
      </div>
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
          İş Birlikleri & Sponsorluk
        </span>
        <a
          href="mailto:reklam@urunbul.me?subject=UrunBul%20Feed%20Sponsorluk%20Talebi"
          className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline inline-flex items-center gap-1"
        >
          <span>İletişime Geçin</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
