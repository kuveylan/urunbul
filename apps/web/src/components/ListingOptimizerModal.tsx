"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Copy,
  Plus,
  Lightbulb,
  Check,
  Tag,
} from "lucide-react";
import { apiUrl } from "@/lib/api";

interface ListingOptimizerModalProps {
  initialTitle?: string;
  initialBrand?: string;
  initialCategory?: string;
  onClose: () => void;
}

export default function ListingOptimizerModal({
  initialTitle = "",
  initialBrand = "",
  initialCategory = "Elektronik",
  onClose,
}: ListingOptimizerModalProps) {
  const [title, setTitle] = useState(initialTitle || "Bluetooth Kulaklık Siyah");
  const [brand, setBrand] = useState(initialBrand || "");
  const [category, setCategory] = useState(initialCategory || "Elektronik");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/v1/optimizer/analyze"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title,
          brand: brand || null,
          category: category,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (initialTitle) {
      handleAnalyze();
    }
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border-t sm:border border-slate-200 max-h-[92vh] overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))]">
        {/* Mobil Çekmece Göstergesi (Drag Handle) */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Başlık */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                SEO Başlık & Madde Sihirbazı
              </h3>
              <p className="text-xs text-slate-500">
                Trendyol arama algoritmasına tam uyumlu başlık ve anahtar kelime analizi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Giriş Alanı */}
        <form onSubmit={handleAnalyze} className="my-5 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ürün Başlığı (Mevcut veya Yeni)
            </label>
            <textarea
              rows={2}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Xiaomi Redmi Buds 4 Active Kablosuz Bluetooth Kulaklık Siyah"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Marka (Opsiyonel)
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Örn: Xiaomi"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Elektronik">Elektronik</option>
                <option value="Küçük Ev Aletleri">Küçük Ev Aletleri</option>
                <option value="Moda">Moda</option>
                <option value="Kozmetik">Kozmetik</option>
                <option value="Ev & Yaşam">Ev & Yaşam</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-all"
            >
              {loading ? "Analiz Ediliyor..." : "Başlığı Optimize Et"}
            </button>
          </div>
        </form>

        {/* Sonuç Alanı */}
        {result && (
          <div className="space-y-4 pt-3 border-t border-slate-100">
            {/* Skor ve Karakter Özeti */}
            {(() => {
              const score = result.seo_score ?? result.overall_seo_score ?? 0;
              const charCount = result.character_count ?? result.length ?? 0;
              const wordCount = result.word_count ?? (title ? title.trim().split(/\s+/).length : 0);
              const maxLen = result.max_recommended_length || 100;
              const improved = result.improved_title ?? result.suggested_improved_title ?? title;
              const tips: string[] = result.suggestions ?? result.seo_tips ?? (result.quality_checks?.map((q: any) => q.message) || []);

              return (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                      <div className="text-[10px] font-semibold text-slate-500 uppercase">SEO Kalite Skoru</div>
                      <div className={`text-xl font-black mt-0.5 ${
                        score >= 80 ? "text-emerald-600" : score >= 60 ? "text-amber-600" : "text-rose-600"
                      }`}>
                        {score} / 100
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                      <div className="text-[10px] font-semibold text-slate-500 uppercase">Karakter Uzunluğu</div>
                      <div className="text-xl font-bold text-slate-800 mt-0.5">
                        {charCount} <span className="text-xs text-slate-400 font-normal">/ {maxLen}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                      <div className="text-[10px] font-semibold text-slate-500 uppercase">Kelime Sayısı</div>
                      <div className="text-xl font-bold text-slate-800 mt-0.5">
                        {wordCount}
                      </div>
                    </div>
                  </div>

                  {/* İyileştirilmiş Başlık Önerisi */}
                  <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-3.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-purple-900">
                        <Lightbulb className="w-4 h-4 text-purple-600" />
                        <span>Yapay Zeka Tarafından Optimize Edilen Başlık</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(improved)}
                        className="flex items-center space-x-1 text-xs font-semibold text-purple-700 hover:text-purple-900 bg-white px-2 py-0.5 rounded border border-purple-200 shadow-2xs"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? "Kopyalandı" : "Kopyala"}</span>
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 bg-white p-2.5 rounded-lg border border-purple-100">
                      {improved}
                    </p>
                  </div>

                  {/* İpuçları ve Öneriler */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                    <h4 className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wide">
                      Algoritma İpuçları & Kontroller
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {tips.map((tip: string, idx: number) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
