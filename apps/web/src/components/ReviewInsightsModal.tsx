"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Star,
  ThumbsDown,
  ThumbsUp,
  AlertTriangle,
  Lightbulb,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  Filter,
} from "lucide-react";
import { Product } from "./BlackBoxView";
import { apiUrl } from "@/lib/api";

interface ReviewTopicMetric {
  topic: string;
  percentage: number;
  mention_count: number;
  sentiment: string;
}

interface ReviewKeywordMetric {
  word: string;
  count: number;
  sentiment: string;
}

interface ReviewItem {
  text: string;
  stars: number;
  seller?: string;
  date?: string;
  sentiment: string;
}

interface ReviewInsightsData {
  product_id: string;
  title: string;
  brand?: string;
  rating: number;
  total_reviews_analyzed: number;
  satisfaction_score: number;
  top_complaint_topics: ReviewTopicMetric[];
  top_praised_topics: ReviewTopicMetric[];
  frequent_keywords: ReviewKeywordMetric[];
  actionable_seller_advice: string;
  sample_reviews: ReviewItem[];
}

interface ReviewInsightsModalProps {
  product: Product;
  onClose: () => void;
}

export default function ReviewInsightsModal({
  product,
  onClose,
}: ReviewInsightsModalProps) {
  const [data, setData] = useState<ReviewInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"ALL" | "NEGATIVE" | "POSITIVE">("ALL");

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const queryParams = new URLSearchParams({
          product_url: product.url,
          content_id: product.external_id,
          title: product.title,
          brand: product.brand || "",
          rating: (product.rating || 4.5).toString(),
        });
        const res = await fetch(apiUrl(`/api/v1/reviews/analyze?${queryParams.toString()}`));
        if (!res.ok) throw new Error("Yorum analizi alınamadı");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        console.error(err);
        setErrorMessage("Yorumlar çekilirken bir hata oluştu veya ürünün yorumları henüz yüklenmedi.");
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [product]);

  const filteredReviews = (data?.sample_reviews || []).filter((r) => {
    if (selectedFilter === "NEGATIVE") return r.stars <= 2 || r.sentiment === "NEGATIVE";
    if (selectedFilter === "POSITIVE") return r.stars >= 4 || r.sentiment === "POSITIVE";
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0f172a] rounded-2xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl border border-slate-800 max-h-[92vh] overflow-y-auto text-white flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <span>Müşteri Yorum & Şikayet Madencisi</span>
                  <span className="text-[10px] font-bold bg-purple-600 text-white px-2 py-0.5 rounded">
                    Yapay Zekâ Analitiği
                  </span>
                </h3>
                <p className="text-xs text-slate-400 line-clamp-1 mt-0.5 max-w-xl">
                  {product.brand ? `${product.brand} • ` : ""}{product.title}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-sm font-bold text-slate-300">
                Trendyol Yorumları Çekiliyor & NLP Şikayet Analizi Yapılıyor...
              </div>
              <p className="text-xs text-slate-500">
                Müşteri değerlendirmeleri, 1-2 yıldızlı şikayetler ve memnuniyet kalıpları ayıklanıyor.
              </p>
            </div>
          ) : errorMessage ? (
            <div className="my-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
              {errorMessage}
            </div>
          ) : data ? (
            <div className="my-5 space-y-5 text-xs">
              {/* 1. Üst Skor Kartları */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Müşteri Memnuniyet Skoru
                    </span>
                    <div className="text-2xl font-black text-emerald-400 mt-0.5">
                      %{data.satisfaction_score}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                    <ThumbsUp className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      İncelenen Yorum Sayısı
                    </span>
                    <div className="text-2xl font-black text-blue-400 mt-0.5">
                      {data.total_reviews_analyzed} Yorum
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Ortalama Yıldız Puanı
                    </span>
                    <div className="text-2xl font-black text-amber-400 mt-0.5 flex items-center gap-1">
                      <Star className="w-5 h-5 fill-current" />
                      <span>{data.rating}</span>
                      <span className="text-xs text-slate-500 font-normal">/ 5.0</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                    ⭐
                  </div>
                </div>
              </div>

              {/* 2. Yapay Zeka Stratejik Satıcı Tavsiyesi */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-blue-950/40 border border-purple-800/40 text-slate-200 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/30 shrink-0">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                      Yapay Zekâ Destekli Pazar Fırsat Stratejisi
                    </div>
                    <div className="text-xs leading-relaxed text-slate-300">
                      {data.actionable_seller_advice}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. İki Kolonlu Konu Dağılımı (Şikayetler vs Övgüler) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Şikayetler (Zayıf Yönler) */}
                <div className="bg-[#0b0f19] border border-rose-900/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                    <ThumbsDown className="w-4 h-4" />
                    <span>En Çok Şikayet Edilen Konular (Rakip Açıkları)</span>
                  </div>
                  <div className="space-y-2.5">
                    {data.top_complaint_topics.map((t, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-300 font-medium">{t.topic}</span>
                          <span className="text-rose-400 font-bold">%{t.percentage}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-rose-500 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, t.percentage * 2)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Övgüler (Güçlü Yönler) */}
                <div className="bg-[#0b0f19] border border-emerald-900/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <ThumbsUp className="w-4 h-4" />
                    <span>Müşterilerin En Memnun Kaldığı Özellikler</span>
                  </div>
                  <div className="space-y-2.5">
                    {data.top_praised_topics.map((t, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-300 font-medium">{t.topic}</span>
                          <span className="text-emerald-400 font-bold">%{t.percentage}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, t.percentage * 1.5)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Sık Geçen Kelime Havuzu */}
              {data.frequent_keywords.length > 0 && (
                <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Yorumlarda En Çok Tekrarlanan Kelimeler (Kelime Havuzu)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {data.frequent_keywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium border flex items-center gap-1 ${
                          kw.sentiment === "NEGATIVE"
                            ? "bg-rose-500/10 text-rose-300 border-rose-500/20"
                            : kw.sentiment === "POSITIVE"
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                            : "bg-slate-800 text-slate-300 border-slate-700"
                        }`}
                      >
                        <span>{kw.word}</span>
                        <span className="text-[9px] opacity-70">({kw.count})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Örnek Yorum Kartları & Filtre */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Örnek Müşteri Yorumları ({filteredReviews.length})
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setSelectedFilter("ALL")}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        selectedFilter === "ALL"
                          ? "bg-slate-700 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Tümü
                    </button>
                    <button
                      onClick={() => setSelectedFilter("NEGATIVE")}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        selectedFilter === "NEGATIVE"
                          ? "bg-rose-600 text-white"
                          : "text-rose-400 hover:text-rose-300"
                      }`}
                    >
                      1-2 Yıldız (Şikayetler)
                    </button>
                    <button
                      onClick={() => setSelectedFilter("POSITIVE")}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        selectedFilter === "POSITIVE"
                          ? "bg-emerald-600 text-white"
                          : "text-emerald-400 hover:text-emerald-300"
                      }`}
                    >
                      4-5 Yıldız (Memnunlar)
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                  {filteredReviews.map((r, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center space-x-1 text-amber-400">
                          {Array.from({ length: r.stars || 5 }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                        <div className="text-slate-500 text-[10px]">
                          {r.seller ? `Satıcı: ${r.seller} • ` : ""}
                          {r.date}
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{r.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <a
            href={product.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>Trendyol'da Orijinal Yorumları İncele</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
