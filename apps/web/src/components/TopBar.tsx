"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  Puzzle,
  ChevronDown,
  Calculator,
  Wand2,
  ExternalLink,
  Shield,
  Search,
  Home,
  User,
  Store,
  Settings,
  CreditCard,
  LogOut,
  CheckCircle2,
  Sun,
  Moon,
  Sparkles,
  Scale,
} from "lucide-react";
import { NavView } from "./Sidebar";
import { useAuth } from "@/context/AuthContext";


interface TopBarProps {
  currentView: NavView;
  selectedMarketplace?: string;
  onMarketplaceChange?: (mp: string) => void;
  onNavigate?: (view: NavView) => void;
  onOpenNotifications: () => void;
  onOpenCalculator: () => void;
  onOpenOptimizer: () => void;
  onOpenExtensionModal: () => void;
  onOpenLegal?: (tab?: "terms" | "privacy") => void;
  unreadCount?: number;
}

export default function TopBar({
  currentView,
  selectedMarketplace: propMarketplace,
  onMarketplaceChange,
  onNavigate,
  onOpenNotifications,
  onOpenCalculator,
  onOpenOptimizer,
  onOpenExtensionModal,
  onOpenLegal,
  unreadCount = 2,
}: TopBarProps) {
  const [localMarketplace, setLocalMarketplace] = useState("all");
  const currentMarketplace = propMarketplace !== undefined ? propMarketplace : localMarketplace;
  const [isMarketplaceDropdownOpen, setIsMarketplaceDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<"TR" | "EN">("TR");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const { user, quota, logout } = useAuth();

  const userMenuRef = useRef<HTMLDivElement>(null);
  const marketplaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("urunbul_lang") as "TR" | "EN";
      if (savedLang) setCurrentLang(savedLang);

      const savedTheme = localStorage.getItem("urunbul_theme");
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      const useDark = savedTheme ? savedTheme === "dark" : true; // Default dark modern
      setIsDarkMode(useDark);
      if (useDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (marketplaceRef.current && !marketplaceRef.current.contains(e.target as Node)) {
        setIsMarketplaceDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectLang = (lang: "TR" | "EN") => {
    setCurrentLang(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("urunbul_lang", lang);
      window.dispatchEvent(new CustomEvent("urunbul_lang_change", { detail: lang }));
      window.dispatchEvent(new Event("languagechange"));
    }
  };

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (typeof window !== "undefined") {
      localStorage.setItem("urunbul_theme", nextDark ? "dark" : "light");
      if (nextDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      window.dispatchEvent(new CustomEvent("urunbul_theme_change", { detail: nextDark ? "dark" : "light" }));
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 select-none shadow-xs transition-colors">
      {/* Sol: Pazaryeri Seçici & Sadeleştirilmiş Başlık */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Marketplace Switcher */}
        <div className="relative" ref={marketplaceRef}>
          {(() => {
            const marketOptions = [
              { id: "all", label: "Tüm Pazaryerleri", shortLabel: "Tüm Pazarlar", icon: "🌐", color: "text-blue-500", badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
              { id: "trendyol", label: "Trendyol (Türkiye)", shortLabel: "Trendyol", icon: "🇹🇷", color: "text-orange-500", badge: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20" },
              { id: "hepsiburada", label: "Hepsiburada", shortLabel: "Hepsiburada", icon: "🟠", color: "text-amber-500", badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
              { id: "amazon", label: "Amazon TR", shortLabel: "Amazon TR", icon: "📦", color: "text-sky-500", badge: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20" },
              { id: "n11", label: "N11", shortLabel: "N11", icon: "🟣", color: "text-purple-500", badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
            ];
            const activeOption = marketOptions.find((m) => m.id === currentMarketplace) || marketOptions[0];

            const handleSelect = (id: string) => {
              setLocalMarketplace(id);
              if (onMarketplaceChange) {
                onMarketplaceChange(id);
              }
              setIsMarketplaceDropdownOpen(false);
            };

            return (
              <>
                <button
                  onClick={() => setIsMarketplaceDropdownOpen(!isMarketplaceDropdownOpen)}
                  className="flex items-center space-x-2 bg-slate-100 dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700/80 hover:border-emerald-500 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-2xs"
                >
                  <span className="text-sm">{activeOption.icon}</span>
                  <span className="hidden sm:inline">{activeOption.label}</span>
                  <span className="sm:hidden">{activeOption.shortLabel}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isMarketplaceDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1.5 text-xs text-slate-700 dark:text-slate-200 z-50">
                    {marketOptions.map((opt) => {
                      const isSelected = opt.id === currentMarketplace;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelect(opt.id)}
                          className={`w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center justify-between font-semibold transition-colors ${
                            isSelected ? "bg-slate-50 dark:bg-slate-800/80 font-bold" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{opt.icon}</span>
                            <span>{opt.label}</span>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${opt.badge}`}>
                            {isSelected ? "SEÇİLİ" : "AKTİF"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {/* Pazar ve Finans Durumu Rozeti (Breadcrumb yerine temiz ve bilgilendirici pazar canlılığı) */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-500 dark:text-slate-400">
            {currentLang === "EN" ? "Market Intelligence:" : "Pazar Zekası:"}
          </span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            {currentLang === "EN" ? "Live Scraping & Real-time Arbitrage" : "Canlı Tarama & Anlık Arbitraj"}
          </span>
        </div>
      </div>

      {/* Sağ: Hızlı Aksiyon Butonları & Bildirim & Segmented Dil & Tema & Tıklanabilir Profil */}
      <div className="flex items-center space-x-2 sm:space-x-2.5">
        {/* Segmented [ 🇹🇷 TR | 🇬🇧 EN ] İki Kutuplu Dil Seçici */}
        <div className="flex items-center bg-slate-100 dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700/80 rounded-lg p-0.5 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => handleSelectLang("TR")}
            className={`px-2 py-1 rounded-md transition flex items-center gap-1 ${
              currentLang === "TR"
                ? "btn-emerald text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <span className="text-xs">🇹🇷</span> TR
          </button>
          <button
            type="button"
            onClick={() => handleSelectLang("EN")}
            className={`px-2 py-1 rounded-md transition flex items-center gap-1 ${
              currentLang === "EN"
                ? "btn-emerald text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <span className="text-xs">🇬🇧</span> EN
          </button>
        </div>

        {/* Canlı Tarayıcı Uzantısı Aç / İndir Butonu */}
        <button
          onClick={onOpenExtensionModal}
          className="px-2.5 sm:px-3 py-1.5 rounded-lg btn-emerald text-white text-xs font-bold transition-all flex items-center gap-1.5"
          title={currentLang === "EN" ? "Chrome Extension" : "Pazar Eklentisi"}
        >
          <Puzzle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{currentLang === "EN" ? "Extension" : "Pazar Eklentisi"}</span>
          <span className="sm:hidden">{currentLang === "EN" ? "Ext" : "Eklenti"}</span>
        </button>

        {/* Hızlı Kâr Hesaplayıcı Butonu */}
        <button
          onClick={() => {
            if (onNavigate) {
              onNavigate("profits");
            } else {
              onOpenCalculator();
            }
          }}
          title={currentLang === "EN" ? "Net Profit & Commission Calculator" : "Net Kâr & Komisyon Hesaplayıcı"}
          className="p-2 rounded-lg bg-slate-100 dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 hover:border-emerald-500/80 text-slate-700 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors hidden sm:flex"
        >
          <Calculator className="w-4 h-4" />
        </button>

        {/* Hızlı Listing Optimizer Butonu */}
        <button
          onClick={onOpenOptimizer}
          title={currentLang === "EN" ? "SEO & Title Wizard" : "SEO & Başlık Sihirbazı"}
          className="p-2 rounded-lg bg-slate-100 dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 hover:border-purple-500/80 text-slate-700 dark:text-slate-300 hover:text-purple-500 dark:hover:text-purple-400 transition-colors hidden sm:flex"
        >
          <Wand2 className="w-4 h-4" />
        </button>

        {/* Bildirim Çanı */}
        <button
          onClick={onOpenNotifications}
          title={currentLang === "EN" ? "Price & Market Alerts" : "Pazar ve Fiyat Bildirimleri"}
          className="p-2 rounded-lg bg-slate-100 dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 hover:border-blue-500/80 text-slate-700 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors relative"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 animate-pulse" />
          )}
        </button>

        {/* Canlı Kalan Arama Kotası Rozeti */}
        {user && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              Arama: <strong className="text-emerald-600 dark:text-emerald-400">{quota?.daily_searches_remaining ?? 200}</strong>/200
            </span>
          </div>
        )}

        {/* Doğrudan 1-Tıkla Tema Değiştirici (Aydınlık / Karanlık Mod) */}
        <button
          type="button"
          onClick={toggleTheme}
          title={
            isDarkMode
              ? currentLang === "EN"
                ? "Switch to Light Mode"
                : "Aydınlık Moda Geç"
              : currentLang === "EN"
              ? "Switch to Dark Mode"
              : "Karanlık Moda Geç"
          }
          className="p-2 rounded-lg bg-slate-100 dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-400 text-slate-700 dark:text-slate-200 transition-all cursor-pointer flex items-center justify-center shadow-xs"
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* Tıklanabilir Kullanıcı Avatarı & Açılır Menü */}
        <div className="relative pl-1.5 border-l border-slate-300 dark:border-slate-700" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-emerald-600 to-teal-500 hover:brightness-110 text-white font-black text-xs flex items-center justify-center border border-emerald-400 shadow-sm transition group cursor-pointer"
            title="Kullanıcı & Görünüm Menüsü"
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span>{user?.name ? user.name.slice(0, 2).toUpperCase() : "ÜB"}</span>
            )}
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl py-2 text-xs text-slate-700 dark:text-slate-200 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Profil Başlığı */}
              <div className="px-3.5 py-2.5 border-b border-slate-200 dark:border-slate-700/80">
                <div className="font-bold text-slate-900 dark:text-white text-sm">{user?.name || "E-Ticaret Üyesi"}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{user?.email || "uye@urunbul.me"}</div>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                  <span>{currentLang === "EN" ? "Daily Quota: 200 Searches" : "Günlük 200 Arama Kotası"}</span>
                </div>
              </div>

              {/* TEMA SEÇİCİ (Aydınlık / Karanlık Mod Değiştirici) */}
              <div className="px-3.5 py-2.5 border-b border-slate-200 dark:border-slate-700/80">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    {isDarkMode ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                    <span>{currentLang === "EN" ? "Theme:" : "Arayüz Teması:"}</span>
                  </span>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-[11px] font-bold text-slate-700 dark:text-slate-200 transition"
                  >
                    {isDarkMode ? (
                      <>
                        <Sun className="w-3 h-3 text-amber-500" />
                        <span>{currentLang === "EN" ? "Light Mode" : "Aydınlık Mod"}</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-3 h-3 text-indigo-600" />
                        <span>{currentLang === "EN" ? "Dark Mode" : "Karanlık Mod"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Menü Linkleri */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    if (onNavigate) onNavigate("dashboard");
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 font-medium transition"
                >
                  <Home className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span>{currentLang === "EN" ? "Dashboard (Home)" : "Kontrol Paneli (Ana Sayfa)"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    if (onNavigate) onNavigate("profits");
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 font-medium transition"
                >
                  <Calculator className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span>{currentLang === "EN" ? "Profit & Fee Simulator" : "Net Kâr & Komisyon Simülatörü"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    if (onNavigate) onNavigate("storefront");
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-700/60 flex items-center gap-2.5 text-slate-200 font-medium transition"
                >
                  <Store className="w-4 h-4 text-blue-400" />
                  <span>{currentLang === "EN" ? "My Stores & Competitors" : "Mağazalarım & Rakip Röntgeni"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-700/60 flex items-center gap-2.5 text-slate-200 font-medium transition"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>{currentLang === "EN" ? "Preferences & Alerts" : "Platform & Bildirim Ayarları"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    if (onOpenLegal) onOpenLegal("terms");
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-700/60 flex items-center gap-2.5 text-slate-200 font-medium transition cursor-pointer"
                >
                  <Scale className="w-4 h-4 text-emerald-400" />
                  <span>{currentLang === "EN" ? "Terms & Privacy" : "Hizmet Şartları & Gizlilik"}</span>
                </button>
              </div>

              {/* Çıkış Yap */}
              <div className="border-t border-slate-700/80 pt-1 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-rose-500/10 text-rose-400 flex items-center gap-2.5 font-medium transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>{currentLang === "EN" ? "Log Out" : "Oturumu Kapat"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
