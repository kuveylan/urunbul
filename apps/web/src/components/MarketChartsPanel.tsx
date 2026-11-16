"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { BarChart3, PieChart as PieIcon, Layers, TrendingUp, ShieldAlert, Award } from "lucide-react";
import { Product } from "./BlackBoxView";

interface MarketChartsPanelProps {
  products: Product[];
  medianPrice: number;
  avgPrice: number;
}

const BRAND_COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#64748b", // Slate (Others)
];

export default function MarketChartsPanel({
  products,
  medianPrice,
  avgPrice,
}: MarketChartsPanelProps) {
  const [activeTab, setActiveTab] = useState<"price" | "reviews" | "brands">("price");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 1. Fiyat Dağılım Histogramı
  const priceData = useMemo(() => {
    const buckets = [
      { name: "0-250 ₺", min: 0, max: 250, count: 0, sales: 0 },
      { name: "250-500 ₺", min: 250, max: 500, count: 0, sales: 0 },
      { name: "500-1000 ₺", min: 500, max: 1000, count: 0, sales: 0 },
      { name: "1000-2500 ₺", min: 1000, max: 2500, count: 0, sales: 0 },
      { name: "2500-5000 ₺", min: 2500, max: 5000, count: 0, sales: 0 },
      { name: "5000 ₺+", min: 5000, max: Infinity, count: 0, sales: 0 },
    ];

    products.forEach((p) => {
      const price = p.current_price || 0;
      const b = buckets.find((b) => price >= b.min && price < b.max);
      if (b) {
        b.count += 1;
        b.sales += p.estimated_monthly_sales || 0;
      }
    });

    return buckets.filter((b) => b.count > 0);
  }, [products]);

  // 2. Yorum Sayısına Göre Pazar Bariyeri
  const reviewData = useMemo(() => {
    const tiers = [
      { tier: "0 - 50 Yorum (Yeni Girenler)", min: 0, max: 50, count: 0, sales: 0, avgOpp: 0, totalOpp: 0 },
      { tier: "51 - 250 Yorum (Gelişenler)", min: 51, max: 250, count: 0, sales: 0, avgOpp: 0, totalOpp: 0 },
      { tier: "251 - 1000 Yorum (Oturmuş)", min: 251, max: 1000, count: 0, sales: 0, avgOpp: 0, totalOpp: 0 },
      { tier: "1000+ Yorum (Pazar Devleri)", min: 1001, max: Infinity, count: 0, sales: 0, avgOpp: 0, totalOpp: 0 },
    ];

    products.forEach((p) => {
      const r = p.review_count || 0;
      const t = tiers.find((tier) => r >= tier.min && r <= tier.max);
      if (t) {
        t.count += 1;
        t.sales += p.estimated_monthly_sales || 0;
        t.totalOpp += p.opportunity_score || 0;
      }
    });

    return tiers.map((t) => ({
      ...t,
      avgOpp: t.count > 0 ? Math.round(t.totalOpp / t.count) : 0,
    }));
  }, [products]);

  // 3. Marka / Satıcı Konsantrasyonu (Pazar Payı)
  const brandData = useMemo(() => {
    const brandMap: { [b: string]: { revenue: number; sales: number; count: number } } = {};
    let totalRev = 0;

    products.forEach((p) => {
      const b = (p.brand || "Genel / Belirtilmemiş").trim();
      const rev = p.estimated_monthly_revenue || 0;
      totalRev += rev;
      if (!brandMap[b]) {
        brandMap[b] = { revenue: 0, sales: 0, count: 0 };
      }
      brandMap[b].revenue += rev;
      brandMap[b].sales += p.estimated_monthly_sales || 0;
      brandMap[b].count += 1;
    });

    const sorted = Object.entries(brandMap)
      .map(([name, stat]) => ({
        name,
        revenue: stat.revenue,
        sales: stat.sales,
        count: stat.count,
        share: totalRev > 0 ? Math.round((stat.revenue / totalRev) * 100) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const top5 = sorted.slice(0, 5);
    const others = sorted.slice(5);

    if (others.length > 0) {
      const otherRev = others.reduce((acc, curr) => acc + curr.revenue, 0);
      const otherSales = others.reduce((acc, curr) => acc + curr.sales, 0);
      const otherCount = others.reduce((acc, curr) => acc + curr.count, 0);
      const otherShare = totalRev > 0 ? Math.round((otherRev / totalRev) * 100) : 0;

      top5.push({
        name: `Diğer Markalar (${others.length})`,
        revenue: otherRev,
        sales: otherSales,
        count: otherCount,
        share: otherShare,
      });
    }

    return top5;
  }, [products]);

  if (products.length === 0) return null;

  return (
    <div className="bg-[#0f172a] border border-blue-500/20 rounded-xl p-4 shadow-xl space-y-4 animate-fadeIn">
      {/* Header & Tab Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-black text-white tracking-wide">
              Pazar Röntgeni & Dağılım Grafikleri
            </h3>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Canlı Sinyal Analizi
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Pazardaki fiyat aralıkları, yorum bariyerleri ve marka tekelleşme durumunu inceleyin.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-[#0b0f19] p-1 rounded-lg border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab("price")}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === "price"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Fiyat Dağılımı</span>
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === "reviews"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Yorum Bariyeri</span>
          </button>
          <button
            onClick={() => setActiveTab("brands")}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === "brands"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Marka Pazar Payı</span>
          </button>
        </div>
      </div>

      {/* TAB 1: FİYAT DAĞILIMI */}
      {activeTab === "price" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mb-2">
            <div className="bg-[#0b0f19] p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Medyan (Ortanca) Fiyat:</span>
              <span className="text-base font-black text-blue-400">₺{medianPrice.toLocaleString("tr-TR")}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Uç fiyatlardan arındırılmış merkez</span>
            </div>
            <div className="bg-[#0b0f19] p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Ortalama Liste Fiyatı:</span>
              <span className="text-base font-black text-slate-200">₺{avgPrice.toLocaleString("tr-TR")}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Genel sepet ortalaması</span>
            </div>
            <div className="bg-[#0b0f19] p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">En Çok Ürün Bulunan Dilim:</span>
              <span className="text-base font-black text-emerald-400">
                {priceData.reduce((prev, curr) => (curr.count > prev.count ? curr : prev), priceData[0] || {}).name}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Tüketicinin yoğunlaştığı fiyat bandı</span>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0b0f19",
                      borderColor: "#334155",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    formatter={(val: any, name: any) => [
                      name === "count" ? `${val} Ürün` : `~${Number(val).toLocaleString("tr-TR")} Adet Satış`,
                      name === "count" ? "Ürün Sayısı" : "Tahmini Aylık Satış",
                    ]}
                  />
                  <Bar dataKey="count" name="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sales" name="sales" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-500 text-xs">Yükleniyor...</div>
            )}
          </div>
          <div className="flex items-center justify-center gap-6 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Ürün Sayısı (Arz)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Tahmini Aylık Satış (Talep Hacmi)
            </span>
          </div>
        </div>
      )}

      {/* TAB 2: YORUM BARİYERİ & YENİ GİRİŞ ANALİZİ */}
      {activeTab === "reviews" && (
        <div className="space-y-3">
          <div className="p-3 bg-[#0b0f19] rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
            <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">Pazara Yeni Giriş Fırsat Analizi: </span>
              {reviewData[0]?.sales > 0 ? (
                <span>
                  0-50 yorumlu yeni ürünler aylık toplam{" "}
                  <strong className="text-emerald-400">~{reviewData[0].sales.toLocaleString("tr-TR")} adet</strong>{" "}
                  satış alabiliyor. Bu pazarda yüksek yorumlu devlerin mutlak tekeli bulunmuyor; kaliteli listeleme ve doğru fiyatla yer edinilebilir.
                </span>
              ) : (
                <span>
                  Pazardaki satışların tamamına yakını yüksek yorumlu ürünlerde toplanmış. Yeni giriş için rekabetçi fiyat veya ayrışan özellik gereklidir.
                </span>
              )}
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reviewData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="tier" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0b0f19",
                      borderColor: "#334155",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    formatter={(val: any, name: any) => [
                      name === "sales"
                        ? `~${Number(val).toLocaleString("tr-TR")} ad/ay`
                        : name === "count"
                        ? `${val} Ürün`
                        : `%${val}`,
                      name === "sales" ? "Tahmini Satış" : name === "count" ? "Ürün Sayısı" : "Ortalama Fırsat Skoru",
                    ]}
                  />
                  <Bar dataKey="sales" name="sales" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="count" name="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-500 text-xs">Yükleniyor...</div>
            )}
          </div>
          <div className="flex items-center justify-center gap-6 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Tahmini Satış Hacmi (Adet)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-purple-500" /> Segmentteki Ürün Sayısı
            </span>
          </div>
        </div>
      )}

      {/* TAB 3: MARKA PAZAR PAYI KONSANTRASYONU */}
      {activeTab === "brands" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="h-64 w-full flex items-center justify-center">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={brandData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    dataKey="revenue"
                    nameKey="name"
                    paddingAngle={3}
                  >
                    {brandData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0b0f19",
                      borderColor: "#334155",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    formatter={(val: any) => [`₺${Number(val).toLocaleString("tr-TR")}`, "Tahmini Ciro"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-500 text-xs">Yükleniyor...</div>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300 mb-2">Marka Ciro Payları:</div>
            {brandData.map((b, idx) => (
              <div key={b.name} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: BRAND_COLORS[idx % BRAND_COLORS.length] }}
                  />
                  <span className="font-semibold text-white truncate max-w-[140px]">{b.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 font-mono text-[11px]">₺{b.revenue.toLocaleString("tr-TR")}</span>
                  <span className="font-bold text-blue-400 w-10 text-right">%{b.share}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
