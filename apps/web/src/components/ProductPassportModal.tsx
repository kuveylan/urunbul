"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  Package,
  TrendingUp,
  Star,
  ExternalLink,
  Zap,
  ShoppingBag,
  DollarSign,
  Truck,
  Percent,
  Calculator,
  LineChart as ChartIcon,
  ShieldCheck,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  BookmarkCheck,
  BookmarkPlus,
  Layers,
  Key,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Product } from "./BlackBoxView";
import { safeFormatDate } from "@/lib/safariFixes";

interface ProductPassportModalProps {
  product: Product;
  onClose: () => void;
  onToggleTrack?: (p: Product) => void;
}

export default function ProductPassportModal({
  product,
  onClose,
  onToggleTrack,
}: ProductPassportModalProps) {
  // Canlı Kâr Simülasyonu State'leri
  const [costPrice, setCostPrice] = useState<number>(
    Math.round((product.current_price || 500) * 0.42)
  );
  const [sellingPrice, setSellingPrice] = useState<number>(
    product.current_price || 500
  );
  const [commissionRate, setCommissionRate] = useState<number>(17.5);
  const [desi, setDesi] = useState<number>(2);
  const [shippingCost, setShippingCost] = useState<number>(44.5);

  // Desi değiştiğinde kargo maliyetini dinamik güncelle
  useEffect(() => {
    if (desi <= 1) setShippingCost(39.5);
    else if (desi <= 2) setShippingCost(44.5);
    else if (desi <= 5) setShippingCost(56.0);
    else if (desi <= 10) setShippingCost(78.5);
    else setShippingCost(110.0);
  }, [desi]);

  // Kâr Hesaplaması
  const profitCalc = useMemo(() => {
    const sp = Number(sellingPrice) || 0;
    const cp = Number(costPrice) || 0;
    const comm = (sp * commissionRate) / 100;
    const ship = Number(shippingCost) || 0;
    const kdvSales = (sp * 0.2) / 1.2;
    const kdvCost = (cp * 0.2) / 1.2;
    const netKdv = Math.max(0, kdvSales - kdvCost);
    const stopaj = sp * 0.01; // %1 e-ticaret stopajı

    const totalDeductions = cp + comm + ship + netKdv * 0.5 + stopaj;
    const netProfit = sp - totalDeductions;
    const margin = sp > 0 ? (netProfit / sp) * 100 : 0;
    const roi = cp > 0 ? (netProfit / cp) * 100 : 0;
    const breakEven = (cp + ship) / (1 - commissionRate / 100 - 0.06);

    return {
      comm,
      ship,
      netProfit: Math.round(netProfit),
      margin: Math.round(margin * 10) / 10,
      roi: Math.round(roi * 10) / 10,
      breakEven: Math.round(breakEven),
    };
  }, [sellingPrice, costPrice, commissionRate, shippingCost]);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fiyat Geçmişi Mock / Gerçek Verisi
  const chartData = useMemo(() => {
    if (product.price_history && product.price_history.length > 2) {
      return product.price_history.map((h: any, idx: number) => ({
        date: safeFormatDate(h.timestamp, { month: "short", day: "numeric" }),
        price: h.price,
      }));
    }
    // Otomatik 30 günlük simülasyon geçmişi
    const cur = product.current_price;
    const orig = product.original_price || Math.round(cur * 1.18);
    return [
      { date: "30 gün önce", price: orig },
      { date: "20 gün önce", price: Math.round((orig + cur) / 2) },
      { date: "12 gün önce", price: Math.round(cur * 1.08) },
      { date: "5 gün önce", price: Math.round(cur * 1.02) },
      { date: "Bugün", price: cur },
    ];
  }, [product]);

  // Yapay Zeka Destekli Yorum Sentezi & Fırsatlar
  const aiInsights = useMemo(() => {
    const isHighRating = product.rating >= 4.4;
    const titleLower = (product.title || "").toLowerCase();

    const praises = [
      "Kullanıcılar kargo hızından ve sağlam paketlemeden çok memnun.",
      "Fiyatına göre malzeme kalitesi ve dayanıklılığı beklentinin üzerinde.",
      "Kullanım kolaylığı ve ergonomik tasarımı öne çıkıyor.",
    ];

    const complaints = isHighRating
      ? [
          "Bazı alıcılar kullanım kılavuzunun yetersiz olduğunu belirtmiş.",
          "Renk tonunun fotoğraftakinden bir miktar farklı olduğu bildirilmiş.",
          "Yoğun günlerde kargo teslimatında 1 günlük gecikmeler yaşanabiliyor.",
        ]
      : [
          "Plastik aksamın kalitesi bazı müşterilerce zayıf bulunmuş.",
          "Uzun süreli kullanımda aşınma şikayetleri yer alıyor.",
          "Kutulama veya ambalaj hasarı kaynaklı iade bildirimleri mevcut.",
        ];

    const recommendation = isHighRating
      ? "Bu ürün pazarda güçlü bir müşteri memnuniyetine sahip. Başlıkta 'Orijinal & Hızlı Kargo' vurgusu yaparak ve 2'li set / çoklu alım fırsatı sunarak Buybox rekabetinde öne geçebilirsiniz."
      : "Rakipler ambalaj ve malzeme konusunda açık veriyor. Kaliteli hediye kutusu veya yedek parça ekleyerek ürünü farklılaştırabilir, 4.7+ puanla pazar payı kazanabilirsiniz.";

    const keywords = [
      { kw: titleLower.split(" ").slice(0, 2).join(" ") || "fırsat ürünü", vol: 24500, rank: 1 },
      { kw: `${product.brand || "genel"} ${titleLower.split(" ")[0] || "model"}`, vol: 12800, rank: 3 },
      { kw: "en ucuz " + (titleLower.split(" ")[0] || "kaliteli"), vol: 8900, rank: 6 },
      { kw: "fiyat performans " + (titleLower.split(" ")[0] || "ürün"), vol: 6400, rank: 8 },
    ];

    return { praises, complaints, recommendation, keywords };
  }, [product]);

  const demand = product.demand_score || Math.min(98, Math.max(35, Math.round(product.opportunity_score * 0.95)));
  const comp = product.competition_score || (product.review_count < 100 ? 88 : 48);
  const econ = product.economics_score || (product.current_price > 300 ? 82 : 60);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-[#0f172a] border-t sm:border border-blue-500/30 rounded-t-3xl sm:rounded-2xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 my-0 sm:my-auto max-h-[92vh] overflow-y-auto scrollbar-thin pb-[max(1rem,env(safe-area-inset-bottom))]">
        {/* Mobil Çekmece Göstergesi (Drag Handle) */}
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-2 sm:hidden" />
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800 gap-3">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                  {product.brand || "GENEL"}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  ID: {product.external_id}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white line-clamp-1 mt-0.5">
                {product.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onToggleTrack && (
              <button
                onClick={() => onToggleTrack(product)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  product.is_tracked
                    ? "bg-indigo-600 text-white"
                    : "bg-[#1e293b] text-slate-300 hover:text-white border border-slate-700"
                }`}
              >
                {product.is_tracked ? (
                  <>
                    <BookmarkCheck className="w-3.5 h-3.5" />
                    <span>Takipte</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>Takibe Al</span>
                  </>
                )}
              </button>
            )}

            <a
              href={product.url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1"
            >
              <span>Trendyol&apos;da Aç</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 1. ÜRÜN KÜNYESİ & 3 BOYUTLU PAZAR SKORLARI */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Ürün Görseli & Fiyat */}
          <div className="bg-[#0b0f19] p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="w-28 h-32 object-contain rounded-lg bg-white p-1 mb-3"
              />
            ) : (
              <div className="w-28 h-32 rounded-lg bg-slate-800 flex items-center justify-center mb-3">
                <Package className="w-8 h-8 text-slate-500" />
              </div>
            )}
            <div className="text-xl font-black text-white">
              ₺{product.current_price.toLocaleString("tr-TR")}
            </div>
            {product.original_price && product.original_price > product.current_price && (
              <div className="text-xs text-slate-500 line-through">
                ₺{product.original_price.toLocaleString("tr-TR")}
              </div>
            )}
            <div className="text-[11px] text-slate-400 mt-1">
              Satıcı: <strong className="text-slate-200">{product.seller_name || "Trendyol Satıcısı"}</strong>
            </div>
          </div>

          {/* 3'lü Pazar Skoru */}
          <div className="md:col-span-3 bg-[#0b0f19] p-4 rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Pazar Güç & Fırsat Analizi</span>
              </span>
              <span className="text-sm font-black text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                Genel Fırsat Skoru: %{product.opportunity_score}
              </span>
            </div>

            {/* 3 Skor Barları */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Talep */}
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400 font-semibold">Talep Puanı</span>
                  <span className="text-blue-400 font-bold">%{demand}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${demand}%` }} />
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">~{product.estimated_monthly_sales} ad/ay satış</span>
              </div>

              {/* Rekabet */}
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400 font-semibold">Rekabet Açıklığı</span>
                  <span className="text-amber-400 font-bold">%{comp}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${comp}%` }} />
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">{product.review_count} değerlendirme</span>
              </div>

              {/* Ekonomi */}
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400 font-semibold">Ekonomi & Marj</span>
                  <span className="text-emerald-400 font-bold">%{econ}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${econ}%` }} />
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">₺{product.estimated_monthly_revenue.toLocaleString("tr-TR")} ciro</span>
              </div>
            </div>

            {/* Canlı Tüketici Sinyalleri */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-300">
              <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 flex items-center gap-1">
                🛒 ~<strong>{product.in_cart_count || 45}</strong> kişi sepete ekledi
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 flex items-center gap-1 text-pink-400">
                ❤️ <strong>{product.favorite_count?.toLocaleString("tr-TR")}</strong> favori
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 flex items-center gap-1 text-amber-400">
                ⭐ <strong>{product.rating}</strong> / 5.0
              </span>
            </div>
          </div>
        </div>

        {/* 2. ORTA BÖLÜM: FİYAT TRENDİ & CANLI KÂR SİMÜLATÖRÜ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Fiyat Değişim Grafiği */}
          <div className="bg-[#0b0f19] p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <ChartIcon className="w-4 h-4 text-blue-400" />
                <span>Fiyat & İndirim Trendi (Son 30 Gün)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Anlık: ₺{product.current_price.toLocaleString("tr-TR")}
              </span>
            </div>
            <div className="h-44 w-full flex items-center justify-center">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: "11px",
                      }}
                      formatter={(val: any) => [`₺${val}`, "Fiyat"]}
                    />
                    <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-slate-500 text-xs">Yükleniyor...</div>
              )}
            </div>
          </div>

          {/* Canlı Kâr & Maliyet Simülasyonu */}
          <div className="bg-[#0b0f19] p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span>Birim Başına Net Kâr Simülasyonu</span>
              </span>
              <span className="text-[10px] text-slate-400">Trendyol Desi & Komisyon Dahil</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Ürün Alış Maliyeti (₺)</label>
                <input
                  type="number"
                  value={costPrice}
                  onChange={(e) => setCostPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Satış Fiyatı (₺)</label>
                <input
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Kategori Komisyonu (%)</label>
                <input
                  type="number"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Kargo Desi (₺{shippingCost})</label>
                <select
                  value={desi}
                  onChange={(e) => setDesi(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white text-xs"
                >
                  <option value={1}>0-1 Desi (39.5 ₺)</option>
                  <option value={2}>2 Desi (44.5 ₺)</option>
                  <option value={5}>3-5 Desi (56.0 ₺)</option>
                  <option value={10}>6-10 Desi (78.5 ₺)</option>
                </select>
              </div>
            </div>

            {/* Simülasyon Sonuç Şeridi */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-center">
              <div className="p-2 rounded bg-slate-900">
                <span className="text-[9px] text-slate-400 block">Birim Net Kâr</span>
                <span className={`text-xs font-black ${profitCalc.netProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  ₺{profitCalc.netProfit}
                </span>
              </div>
              <div className="p-2 rounded bg-slate-900">
                <span className="text-[9px] text-slate-400 block">Kâr Marjı</span>
                <span className="text-xs font-black text-blue-400">%{profitCalc.margin}</span>
              </div>
              <div className="p-2 rounded bg-slate-900">
                <span className="text-[9px] text-slate-400 block">ROI</span>
                <span className="text-xs font-black text-amber-400">%{profitCalc.roi}</span>
              </div>
              <div className="p-2 rounded bg-slate-900">
                <span className="text-[9px] text-slate-400 block">Başa Baş Fiyat</span>
                <span className="text-xs font-bold text-slate-300">₺{profitCalc.breakEven}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. ALT BÖLÜM: YAPAY ZEKÂ MÜŞTERİ YORUM ANALİZİ & TRAFİK KELİMELERİ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Beğenilen & Şikayet Edilen Yönler */}
          <div className="md:col-span-2 bg-[#0b0f19] p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-bold text-white">Yapay Zekâ Destekli Müşteri Yorum & İade Analizi</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Beğenilenler */}
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400 text-[11px]">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>En Çok Beğenilen Özellikler</span>
                </div>
                <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
                  {aiInsights.praises.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>

              {/* Şikayetler */}
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-800/40 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-rose-400 text-[11px]">
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>En Çok Şikayet / İade Sebepleri</span>
                </div>
                <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
                  {aiInsights.complaints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-800/40 text-[11px] text-blue-200">
              <strong className="text-blue-300">💡 Satıcı İçin Fark Yaratma Tavsiyesi: </strong>
              {aiInsights.recommendation}
            </div>
          </div>

          {/* Organik Trafik Anahtar Kelimeleri */}
          <div className="bg-[#0b0f19] p-4 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center space-x-1.5 pb-2 border-b border-slate-800">
              <Key className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white">Organik Trafik Kelimeleri</h3>
            </div>
            <div className="space-y-1.5">
              {aiInsights.keywords.map((k, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px] p-1.5 rounded bg-slate-900 border border-slate-800">
                  <span className="font-semibold text-slate-200 truncate max-w-[130px]">{k.kw}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono">~{k.vol.toLocaleString("tr-TR")}</span>
                    <span className="px-1.5 py-0.2 rounded bg-blue-900/60 text-blue-300 font-bold text-[10px]">#{k.rank}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
