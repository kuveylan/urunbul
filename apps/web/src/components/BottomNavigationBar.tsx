"use client";

import React from "react";
import { Home, Search, DollarSign, BookmarkCheck, Menu } from "lucide-react";
import { NavView } from "./Sidebar";
import { useTranslation } from "@/i18n/useTranslation";

interface BottomNavigationBarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  onOpenMenuDrawer: () => void;
  trackedCount?: number;
}

export default function BottomNavigationBar({
  currentView,
  onSelectView,
  onOpenMenuDrawer,
  trackedCount = 0,
}: BottomNavigationBarProps) {
  const { t, lang } = useTranslation();

  const navItems = [
    {
      id: "dashboard" as NavView,
      label: t.menuHome || "Panel",
      icon: Home,
    },
    {
      id: "blackbox" as NavView,
      label: lang === "EN" ? "Radar" : "Radar",
      icon: Search,
    },
    {
      id: "profits" as NavView,
      label: lang === "EN" ? "Profits" : "Net Kâr",
      icon: DollarSign,
    },
    {
      id: "watchlist" as NavView,
      label: lang === "EN" ? "Watchlist" : "Takip",
      icon: BookmarkCheck,
      badge: trackedCount > 0 ? trackedCount : undefined,
    },
  ];

  return (
    <nav
      aria-label="Mobil Gezinme Barı"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800/80 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-lg transition-colors"
    >
      <div className="grid grid-cols-5 items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectView(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? "text-emerald-600 dark:text-emerald-400 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? "scale-110 stroke-[2.5]" : "stroke-[1.75]"
                  }`}
                />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-emerald-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 truncate max-w-[56px] leading-tight">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 bg-emerald-500 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}

        {/* 5. Buton: Tüm Araçlar / Menü Çekmecesi */}
        <button
          type="button"
          onClick={onOpenMenuDrawer}
          className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-all cursor-pointer"
        >
          <div className="relative">
            <Menu className="w-5 h-5 stroke-[1.75]" />
          </div>
          <span className="text-[10px] mt-1 truncate max-w-[56px] leading-tight">
            {lang === "EN" ? "Menu" : "Menü"}
          </span>
        </button>
      </div>
    </nav>
  );
}
