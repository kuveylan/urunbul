"use client";

import React, { useState } from "react";
import {
  Package,
  TrendingUp,
  Search,
  Key,
  FileEdit,
  Scissors,
  DollarSign,
  BookmarkCheck,
  ShoppingBag,
  Zap,
  Store,
  Layers,
  ShieldCheck,
  Home,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import AdBanner from "./AdBanner";


export type NavView =
  | "dashboard"
  | "blackbox"
  | "trendster"
  | "storefront"
  | "cerebro"
  | "magnet"
  | "scribbles"
  | "frankenstein"
  | "profits"
  | "watchlist";

// Alışveriş ve Kârı Destekleyen Sade & Minimalist Vektörel Logo
export function AppLogoIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Alışveriş Çantası Konturu */}
      <path d="M6 8h12l1.2 11.5A2 2 0 0 1 17.2 22H6.8a2 2 0 0 1-2-2.5L6 8z" />
      {/* Çanta Tutma Sapı */}
      <path d="M9 8V5a3 3 0 0 1 6 0v3" />
      {/* Kâr ve Büyüme Trend Oku */}
      <path d="M8.5 15.5l2.8-2.8 2 2 3.7-3.7" />
      <path d="M14.5 11h2.5v2.5" />
    </svg>
  );
}

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  trackedCount: number;
  unreadAlertCount: number;
}

export default function Sidebar({
  currentView,
  onSelectView,
  trackedCount,
  unreadAlertCount,
}: SidebarProps) {
  const { t, lang } = useTranslation();

  return (
    <aside className="w-64 bg-white dark:bg-[#0b0f19] border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 select-none min-h-screen transition-colors">
      <div>
        {/* Brand Header */}
        <button
          type="button"
          onClick={() => onSelectView("dashboard")}
          className="w-full text-left h-16 border-b border-slate-200 dark:border-slate-800/80 px-4 flex items-center justify-between bg-white dark:bg-[#0b0f19] hover:bg-slate-50 dark:hover:bg-slate-900/60 transition group cursor-pointer"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
              <AppLogoIcon className="w-4.5 h-4.5 text-white stroke-[2.3]" />
            </div>
            <div>
              <div className="font-black text-sm text-slate-900 dark:text-white tracking-wider flex items-center">
                <span>ÜrünBul</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {t.brandSubtitle}
              </div>
            </div>
          </div>
        </button>

        {/* Menu Navigation Items (Satıcı İstihbaratı ve Pazar Araçları) */}
        <nav className="p-3 space-y-4 text-xs overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-thin">
          {/* 0. KONTROL PANELİ / ANA SAYFA */}
              <div>
                <button
                  type="button"
                  onClick={() => onSelectView("dashboard")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-semibold transition-all ${
                    currentView === "dashboard"
                      ? "btn-emerald text-white font-bold"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800/60"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    <span>{t.menuHome}</span>
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                    currentView === "dashboard" ? "bg-emerald-800 text-white" : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60"
                  }`}>
                    {lang === "EN" ? "HUB" : "ÖZET"}
                  </span>
                </button>
              </div>

              {/* 1. ÜRÜN & PAZAR RADARI */}
              <div>
                <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>{lang === "EN" ? "Product & Market Radar" : "Ürün & Pazar Radarı"}</span>
                  <span className="text-[9px] text-slate-600 font-normal">Radar</span>
                </div>
                <div className="space-y-0.5">
                  <button
                    onClick={() => onSelectView("blackbox")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-semibold transition-all ${
                      currentView === "blackbox"
                        ? "btn-emerald text-white font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-emerald-400" />
                      <span>{t.menuBlackbox}</span>
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                      currentView === "blackbox" ? "bg-emerald-800 text-white" : "bg-slate-800 text-slate-400"
                    }`}>
                      RADAR
                    </span>
                  </button>

                  <button
                    onClick={() => onSelectView("trendster")}
                    className={`w-full flex items-center px-3 py-2 rounded-lg font-medium transition-all ${
                      currentView === "trendster"
                        ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                      <span>{t.menuTrendster}</span>
                    </span>
                  </button>

                  <button
                    onClick={() => onSelectView("storefront")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all ${
                      currentView === "storefront"
                        ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-amber-400" />
                      <span>{t.menuStorefront}</span>
                    </span>
                  </button>
                </div>
              </div>

              {/* 2. KELİME & TRAFİK ZEKASI */}
              <div>
                <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>{lang === "EN" ? "Keywords & Traffic" : "Kelime & Trafik Analizi"}</span>
                  <span className="text-[9px] text-slate-600 font-normal">SEO</span>
                </div>
                <div className="space-y-0.5">
                  <button
                    onClick={() => onSelectView("cerebro")}
                    className={`w-full flex items-center px-3 py-2 rounded-lg font-medium transition-all ${
                      currentView === "cerebro"
                        ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-purple-400" />
                      <span>{t.menuCerebro}</span>
                    </span>
                  </button>

                  <button
                    onClick={() => onSelectView("magnet")}
                    className={`w-full flex items-center px-3 py-2 rounded-lg font-medium transition-all ${
                      currentView === "magnet"
                        ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-purple-400" />
                      <span>{t.menuMagnet}</span>
                    </span>
                  </button>
                </div>
              </div>

              {/* 3. LİSTELEME & SEO */}
              <div>
                <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>{lang === "EN" ? "Listing & Content" : "Listeleme & İçerik"}</span>
                  <span className="text-[9px] text-slate-600 font-normal">Content</span>
                </div>
                <div className="space-y-0.5">
                  <button
                    onClick={() => onSelectView("scribbles")}
                    className={`w-full flex items-center px-3 py-2 rounded-lg font-medium transition-all ${
                      currentView === "scribbles"
                        ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <FileEdit className="w-4 h-4 text-emerald-400" />
                      <span>{t.menuScribbles}</span>
                    </span>
                  </button>

                  <button
                    onClick={() => onSelectView("frankenstein")}
                    className={`w-full flex items-center px-3 py-2 rounded-lg font-medium transition-all ${
                      currentView === "frankenstein"
                        ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-emerald-400" />
                      <span>{t.menuFrankenstein}</span>
                    </span>
                  </button>
                </div>
              </div>

              {/* 4. FİNANS & TAKİP */}
              <div>
                <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>{lang === "EN" ? "Finance & Profit" : "Finans & Operasyon"}</span>
                  <span className="text-[9px] text-emerald-500 font-bold">₺</span>
                </div>
                <div className="space-y-0.5">
                  <button
                    onClick={() => onSelectView("profits")}
                    className={`w-full flex items-center px-3 py-2 rounded-lg font-medium transition-all ${
                      currentView === "profits"
                        ? "btn-emerald text-white font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <span>{t.menuProfits}</span>
                    </span>
                  </button>

                  <button
                    onClick={() => onSelectView("watchlist")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all ${
                      currentView === "watchlist"
                        ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <BookmarkCheck className="w-4 h-4 text-indigo-400" />
                      <span>{t.menuWatchlist}</span>
                    </span>
                    {trackedCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300">
                        {trackedCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>
        </nav>
      </div>

      {/* Sponsor / Reklam Alanı */}
      <AdBanner slot="sidebar_bottom" />

      {/* Plan Göstergesi (Limitsiz Beta Açık Sürüm) */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#070b14] transition-colors">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">{t.scanCredits}</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-[11px] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
            {t.unlimitedCredits}
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full w-full"></div>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-slate-800 dark:text-white font-semibold">{t.freePlan}</span>
          </div>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">{t.activeStatus}</span>
        </div>
      </div>
    </aside>
  );
}
