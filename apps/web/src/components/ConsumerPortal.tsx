"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Tag,
  Star,
  ExternalLink,
  Bell,
  TrendingDown,
  TrendingUp,
  Percent,
  CheckCircle,
  AlertTriangle,
  Flame,
  Truck,
  Trash2,
  LineChart as ChartIcon,
  ShoppingBag,
  ShieldCheck,
  Store,
  ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { apiUrl } from "@/lib/api";

interface ConsumerOfferItem {
  id?: number;
  marketplace: string;
  seller_name: string;
  price: number;
  original_price?: number;
  discount_pct: number;
  free_shipping: boolean;
  in_stock: boolean;
  product_url: string;
  seller_rating: number;
  review_count: number;
}

interface PriceVerdict {
  status: string;
  label: string;
  badge_color: string;
  message: string;
  discount_pct: number;
  lowest_recorded: number;
  average_recorded: number;
}

interface DetailedComparisonResponse {
  query: string;
  title: string;
  brand?: string;
  image_url?: string;
  lowest_price: number;
  highest_price: number;
  average_price: number;
  total_offers_count: number;
  best_offer: ConsumerOfferItem;
  offers: ConsumerOfferItem[];
  price_verdict: PriceVerdict;
  category_name?: string;
  price_history?: { date: string; price: number }[];
}

interface DealProductItem {
  id: number;
  title: string;
  brand?: string;
  image_url?: string;
  current_price: number;
  original_price: number;
  discount_amount: number;
  discount_pct: number;
  seller_name?: string;
  rating: number;
  url: string;
  verdict: string;
}

interface ActivePriceAlertItem {
  alert_id: number;
  product_id: number;
  product_title: string;
  product_image?: string;
  current_price: number;
  target_price: number;
  price_difference: number;
  is_triggered: boolean;
  user_email?: string;
  product_url: string;
  created_at: string;
}

interface ConsumerPortalProps {
  onOpenPriceModal?: (product: any) => void;
}

export default function ConsumerPortal({ onOpenPriceModal }: ConsumerPortalProps) {
  const [subTab, setSubTab] = useState<"compare" | "deals" | "alerts">("compare");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<DetailedComparisonResponse | null>(null);
  const [deals, setDeals] = useState<DealProductItem[]>([]);
  const [alerts, setAlerts] = useState<ActivePriceAlertItem[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  // Hızlı Alarm Formu
  const [targetAlertPrice, setTargetAlertPrice] = useState<string>("");
  const [alertEmail, setAlertEmail] = useState<string>("tuketici@ornek.com");
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [alertSubmitting, setAlertSubmitting] = useState(false);

  const getMarketplaceBadge = (mp: string) => {
    const norm = (mp || "").toLowerCase();
    if (norm.includes("trendyol")) {
      return { name: "Trendyol", badge: "bg-orange-500/15 text-orange-600 border-orange-500/30", icon: "🇹🇷" };
    } else if (norm.includes("hepsiburada")) {
      return { name: "Hepsiburada", badge: "bg-amber-500/15 text-amber-600 border-amber-500/30", icon: "🟠" };
    } else if (norm.includes("amazon")) {
      return { name: "Amazon TR", badge: "bg-yellow-500/15 text-yellow-700 border-yellow-500/30", icon: "📦" };
    } else if (norm.includes("n11")) {
      return { name: "N11", badge: "bg-purple-500/15 text-purple-600 border-purple-500/30", icon: "🟣" };
    }
    return { name: "Pazaryeri", badge: "bg-slate-500/15 text-slate-600 border-slate-500/30", icon: "🏪" };
  };

  const popularConsumerKeywords = [
    "kahve makinesi",
    "airfryer",
    "robot supurge",
    "kablosuz kulaklik",
    "termos",
    "akilli saat",
  ];

  // Fiyat Karşılaştırma Araması
  const handleSearch = async (queryToSearch?: string) => {
    const q = queryToSearch || searchQuery;
    if (!q.trim()) return;

    setLoading(true);
    setErrorMessage("");
    setAlertSuccess(false);

    try {
      const res = await fetch(apiUrl(`/api/v1/compare?q=${encodeURIComponent(q)}`));
      if (!res.ok) throw new Error("Ürün bulunamadı");
      const data: DetailedComparisonResponse = await res.json();
      setComparisonResult(data);
      setSubTab("compare");
      if (data.lowest_price) {
        setTargetAlertPrice(Math.round(data.lowest_price * 0.9).toString());
      }
    } catch (err) {
      setErrorMessage("Aradığınız ürün için satıcı teklifleri getirilemedi veya backend yanıt vermedi.");
    } finally {
      setLoading(false);
    }
  };

  // Fırsatları Getir
  const fetchDeals = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/v1/compare/deals"));
      if (res.ok) {
        const data = await res.json();
        setDeals(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Alarmları Getir
  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/v1/compare/alerts"));
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlert = async (alertId: number) => {
    try {
      const res = await fetch(apiUrl(`/api/v1/compare/alerts/${alertId}`), {
        method: "DELETE",
      });
      if (res.ok) {
        setAlerts((prev) => prev.filter((a) => a.alert_id !== alertId));
      }
    } catch (err) {
      console.error("Alarm silinemedi:", err);
    }
  };

  const handleQuickCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comparisonResult || !targetAlertPrice) return;
    setAlertSubmitting(true);
    try {
      const targetProdId = comparisonResult.best_offer?.id;
      const res = await fetch(apiUrl("/api/v1/compare/alerts"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: targetProdId,
          target_price: parseFloat(targetAlertPrice),
          user_email: alertEmail,
        }),
      });
      if (res.ok) {
        setAlertSuccess(true);
        fetchAlerts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAlertSubmitting(false);
    }
  };

  useEffect(() => {
    if (subTab === "deals" && deals.length === 0) {
      fetchDeals();
    } else if (subTab === "alerts") {
      fetchAlerts();
    }
  }, [subTab]);

  return (
    <div className="space-y-6">
      {/* Tüketici Alt Menüsü */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setSubTab("compare")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === "compare"
                ? "bg-white text-emerald-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Fiyat Karşılaştır
          </button>
          <button
            onClick={() => {
              setSubTab("deals");
              if (deals.length === 0) fetchDeals();
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              subTab === "deals"
                ? "bg-white text-rose-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>Günün Fırsatları</span>
          </button>
          <button
            onClick={() => {
              setSubTab("alerts");
              fetchAlerts();
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              subTab === "alerts"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-blue-500" />
            <span>Fiyat Alarmlarım ({alerts.length})</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Çoklu Pazar Fiyat Karşılaştırması</span>
        </div>
      </div>

      {/* Arama Alanı */}
      {subTab === "compare" && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Piyasadaki En Uygun Satıcı Teklifini Bulun
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Satıcı tekliflerini fiyata göre sıralayın, kargo durumunu kontrol edin ve yapay zeka fiyat analizini görün.
            </p>

            <div className="mt-4 flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Örn: kahve makinesi, robot süpürge, airfryer, kulaklık..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
              <button
                onClick={() => handleSearch()}
                disabled={loading}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center space-x-1 shadow-sm shrink-0"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                    <span>Aranıyor...</span>
                  </>
                ) : (
                  <span>Teklifleri Getir</span>
                )}
              </button>
            </div>

            {/* Popüler Aramalar */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-medium">Hızlı Arama:</span>
              {popularConsumerKeywords.map((k) => (
                <button
                  key={k}
                  onClick={() => {
                    setSearchQuery(k);
                    handleSearch(k);
                  }}
                  className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 transition-colors"
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            onClick={() => handleSearch()}
            className="px-3 py-1 bg-amber-200 hover:bg-amber-300 rounded text-amber-950 font-bold text-xs"
          >
            Yeniden Dene
          </button>
        </div>
      )}

      {/* 1. AKAKÇE TEKLİF VE FİYAT KARŞILAŞTIRMASI */}
      {subTab === "compare" && comparisonResult && (
        <div className="space-y-6 animate-fadeIn">
          {/* Ana Ürün Kartı */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-5 w-full md:w-auto">
              {comparisonResult.image_url ? (
                <img
                  src={comparisonResult.image_url}
                  alt={comparisonResult.title}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                  className="w-24 h-28 object-contain rounded-xl border border-slate-100 p-1.5 bg-white shrink-0"
                />
              ) : (
                <div className="w-24 h-28 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-8 h-8 text-slate-300" />
                </div>
              )}
              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                  {comparisonResult.brand || "Trendyol Kataloğu"}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-2 mt-0.5">
                  {comparisonResult.title}
                </h3>
                <div className="text-xs text-slate-500 mt-1">
                  Toplam <strong className="text-slate-900">{comparisonResult.total_offers_count}</strong> farklı satıcı teklifi incelendi
                </div>

                {/* Akıllı "Bu Fiyat İyi mi?" Tavsiye Rozeti */}
                <div className="mt-2.5">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      comparisonResult.price_verdict.badge_color === "emerald"
                        ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                        : comparisonResult.price_verdict.badge_color === "sky"
                        ? "bg-blue-100 text-blue-900 border border-blue-200"
                        : comparisonResult.price_verdict.badge_color === "amber"
                        ? "bg-amber-100 text-amber-900 border border-amber-200"
                        : "bg-rose-100 text-rose-900 border border-rose-200"
                    }`}
                  >
                    {comparisonResult.price_verdict.badge_color === "emerald" && (
                      <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    )}
                    {comparisonResult.price_verdict.label}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {comparisonResult.price_verdict.message}
                  </p>
                </div>
              </div>
            </div>

            {/* En Uygun Fiyat Blok Kutusu */}
            <div className="border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 text-center md:text-right shrink-0 w-full md:w-auto">
              <div className="text-xs text-slate-500 font-semibold">En Düşük Piyasa Fiyatı</div>
              <div className="text-3xl font-black text-emerald-600 mt-0.5">
                ₺{comparisonResult.lowest_price.toLocaleString("tr-TR")}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Ortalama: ₺{comparisonResult.average_price.toLocaleString("tr-TR")} • En Yüksek: ₺{comparisonResult.highest_price.toLocaleString("tr-TR")}
              </div>
              <div className="mt-3">
                <a
                  href={comparisonResult.best_offer.product_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  <span>En Ucuzdan Satın Al</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Akakçe Tarzı Satıcı Teklif Sıralaması Tablosu */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Store className="w-4 h-4 text-emerald-700" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Satıcı Fiyat Karşılaştırma Listesi (En Ucuzdan Sıralı)
                </h4>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {comparisonResult.offers.length} Satıcı Aktif
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {comparisonResult.offers.map((offer, idx) => (
                <div
                  key={idx}
                  className={`p-4 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${
                    idx === 0 ? "bg-emerald-50/40" : "hover:bg-slate-50/60"
                  }`}
                >
                  <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        idx === 0
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        {/* Pazaryeri Rozeti */}
                        {(() => {
                          const mpInfo = getMarketplaceBadge(offer.marketplace);
                          return (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${mpInfo.badge}`}>
                              <span>{mpInfo.icon}</span>
                              <span>{mpInfo.name}</span>
                            </span>
                          );
                        })()}
                        <span className="font-bold text-slate-900 text-sm">
                          {offer.seller_name}
                        </span>
                        {idx === 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            En Uygun Teklif
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center text-amber-500 font-semibold">
                          <Star className="w-3 h-3 fill-current mr-0.5" />
                          {offer.seller_rating}
                        </span>
                        <span>•</span>
                        {offer.free_shipping ? (
                          <span className="flex items-center text-emerald-600 font-medium">
                            <Truck className="w-3 h-3 mr-0.5" /> Ücretsiz Kargo
                          </span>
                        ) : (
                          <span>Standart Kargo</span>
                        )}
                        <span>•</span>
                        <span className="text-slate-500 font-medium">{getMarketplaceBadge(offer.marketplace).name} Güvencesi</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-4 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0">
                    <div className="text-right">
                      <div className="text-lg font-black text-slate-900">
                        ₺{offer.price.toLocaleString("tr-TR")}
                      </div>
                      {offer.original_price && offer.original_price > offer.price && (
                        <div className="text-xs text-slate-400 line-through">
                          ₺{offer.original_price.toLocaleString("tr-TR")}
                        </div>
                      )}
                    </div>

                    <a
                      href={offer.product_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center space-x-1 shadow-xs"
                    >
                      <span>Mağazaya Git</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hızlı Fiyat Alarmı & Fiyat Grafiği Özeti */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-emerald-700" />
                  <h4 className="font-bold text-slate-900 text-sm">
                    Bu Ürün İçin Fiyat Düşünce Haber Ver
                  </h4>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Belirttiğiniz fiyata indiğinde e-posta ile anında haberdar olun.
                </p>
              </div>

              {alertSuccess ? (
                <div className="flex items-center space-x-2 text-xs text-emerald-800 bg-emerald-100 p-2.5 rounded-lg border border-emerald-200">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Alarm kaydedildi! ₺{targetAlertPrice} seviyesine indiğinde bildirim alacaksınız.</span>
                </div>
              ) : (
                <form onSubmit={handleQuickCreateAlert} className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center space-x-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
                    <span className="text-slate-400">Hedef ₺:</span>
                    <input
                      type="number"
                      value={targetAlertPrice}
                      onChange={(e) => setTargetAlertPrice(e.target.value)}
                      placeholder="Hedef fiyat"
                      className="w-20 font-bold text-slate-900 focus:outline-none"
                      required
                    />
                  </div>

                  <input
                    type="email"
                    value={alertEmail}
                    onChange={(e) => setAlertEmail(e.target.value)}
                    placeholder="E-posta adresiniz"
                    className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />

                  <button
                    type="submit"
                    disabled={alertSubmitting}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {alertSubmitting ? "Kaydediliyor..." : "Alarm Kur"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. GÜNÜN FIRSATLARI */}
      {subTab === "deals" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Flame className="w-5 h-5 text-rose-500" />
              <span>Günün Fiyatı Düşenleri & Fırsat Teklifleri</span>
            </h3>
            <span className="text-xs text-slate-500">Trendyol Canlı Pazar Verisi</span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Fırsatlar taranıyor...</div>
          ) : deals.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
              Şu anda taranmış fırsat bulunamadı. Lütfen arama sekmesinden canlı pazar taraması yapın.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {deals.map((d) => (
                <div
                  key={d.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  <div className="absolute top-3 right-3 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                    %{d.discount_pct} İNDİRİM
                  </div>

                  <div>
                    {d.image_url ? (
                      <div className="w-full h-40 flex items-center justify-center p-2 mb-2 bg-white">
                        <img
                          src={d.image_url}
                          alt={d.title}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                          className="max-h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-40 bg-slate-100 rounded-xl flex items-center justify-center mb-2">
                        <ShoppingBag className="w-8 h-8 text-slate-300" />
                      </div>
                    )}

                    <div className="text-[10px] font-bold text-rose-700 uppercase">
                      {d.brand || "Trendyol Fırsatı"}
                    </div>
                    <h4 className="font-semibold text-slate-900 text-xs line-clamp-2 mt-0.5">
                      {d.title}
                    </h4>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-slate-400 line-through">
                        ₺{d.original_price.toLocaleString("tr-TR")}
                      </div>
                      <div className="text-base font-black text-rose-600">
                        ₺{d.current_price.toLocaleString("tr-TR")}
                      </div>
                    </div>
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow-xs transition-colors"
                    >
                      <span>Fırsata Git</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. AKTİF FİYAT ALARMLARIM */}
      {subTab === "alerts" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <span>Takip Ettiğim Fiyat Alarmları</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {alerts.length} Aktif Takip
            </span>
          </div>

          {alerts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
              <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-bold text-slate-700 text-sm">Henüz aktif fiyat alarmınız bulunmuyor</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Ürün tekliflerini incelerken fiyat alarmı kurarak fiyat düştüğünde bildirim alabilirsiniz.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden divide-y divide-slate-100">
              {alerts.map((a) => (
                <div key={a.alert_id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    {a.product_image ? (
                      <img
                        src={a.product_image}
                        alt={a.product_title}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                        className="w-12 h-14 object-contain rounded-lg border bg-white p-0.5"
                      />
                    ) : (
                      <div className="w-12 h-14 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Tag className="w-4 h-4 text-slate-400" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs line-clamp-1 max-w-md">
                        {a.product_title}
                      </h4>
                      <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                        <span>Anlık: <strong className="text-slate-800">₺{a.current_price}</strong></span>
                        <span>•</span>
                        <span>Hedef: <strong className="text-emerald-700">₺{a.target_price}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        a.is_triggered
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {a.is_triggered ? "🎉 Hedefe Ulaştı!" : "Takip Ediliyor"}
                    </span>

                    <button
                      onClick={() => handleDeleteAlert(a.alert_id)}
                      title="Alarmı Sil"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
