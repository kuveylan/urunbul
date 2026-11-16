"use client";

import React, { useState, useEffect } from "react";
import { FileEdit, Sparkles, CheckCircle, Copy, Check, Lightbulb, Zap, Tag, Plus, X } from "lucide-react";
import { apiUrl } from "@/lib/api";

interface ScribblesViewProps {
  initialKeywords?: string[];
}

export default function ScribblesView({ initialKeywords }: ScribblesViewProps) {
  const [title, setTitle] = useState("Xiaomi Redmi Buds 4 Active TWS Kablosuz Bluetooth Kulaklık Siyah");
  const [brand, setBrand] = useState("Xiaomi");
  const [category, setCategory] = useState("Elektronik");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [newKeywordInput, setNewKeywordInput] = useState("");

  // Scribbles Anahtar Kelime Bankası (Kullanıldıkça üstü çizilen kelimeler)
  const [targetKeywords, setTargetKeywords] = useState<string[]>([
    "kablosuz", "bluetooth", "kulaklık", "tws", "siyah", "mikrofonlu", "gürültü", "engelleme", "hızlı", "şarj", "suya", "dayanıklı"
  ]);

  useEffect(() => {
    if (initialKeywords && initialKeywords.length > 0) {
      setTargetKeywords(initialKeywords);
      // Başlığı da ilk anahtar kelimelerden birine adapte et
      if (initialKeywords.length >= 2) {
        setTitle(`${initialKeywords.slice(0, 4).join(" ")}`);
      }
    }
  }, [initialKeywords]);

  const handleAnalyze = async () => {
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

  useEffect(() => {
    handleAnalyze();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isWordUsed = (kw: string) => {
    return title.toLowerCase().includes(kw.toLowerCase().trim());
  };

  const handleAddKeyword = () => {
    if (!newKeywordInput.trim()) return;
    const clean = newKeywordInput.trim().toLowerCase();
    if (!targetKeywords.includes(clean)) {
      setTargetKeywords([...targetKeywords, clean]);
    }
    setNewKeywordInput("");
  };

  const handleRemoveKeyword = (kw: string) => {
    setTargetKeywords(targetKeywords.filter((k) => k !== kw));
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Başlık */}
      <div className="bg-white dark:bg-[#0f172a] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-wide">
              SEO Başlık & Madde Sihirbazı (Scribbles)
            </h1>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
              Pazar SEO Zekası
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Trendyol arama algoritması için optimize edilmiş ürün başlığı oluşturun; kullanılan anahtar kelimeleri otomatik çizerek kelime yoğunluğunuzu denetleyin.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sol Kolon: Başlık Editörü ve Ayarlar */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileEdit className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Ürün Başlık Editörü</span>
              </h2>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 dark:text-slate-400">Karakter:</span>
                <span className={`font-bold font-mono ${
                  title.length > 100 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                }`}>
                  {title.length} / 120
                </span>
              </div>
            </div>

            <textarea
              rows={3}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Trendyol ürün başlığını buraya yazın..."
              className="w-full p-3 bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:border-purple-500 transition-colors"
            />

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Marka</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Marka adı"
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="Elektronik">Elektronik</option>
                  <option value="Küçük Ev Aletleri">Küçük Ev Aletleri</option>
                  <option value="Moda">Moda</option>
                  <option value="Kozmetik">Kozmetik</option>
                  <option value="Ev & Yaşam">Ev & Yaşam</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs shadow-md shadow-purple-600/30 transition-all flex items-center space-x-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analiz Ediliyor...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>SEO Başlığını Puanla & Optimize Et</span>
                </>
              )}
            </button>
          </div>

          {/* Yapay Zeka Optimize Edilmiş Başlık Önerisi */}
          {result && (
            <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-xl p-4 shadow-xs space-y-2 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold text-purple-700 dark:text-purple-300">
                  <Lightbulb className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Algoritma Uyumlu Optimize Edilmiş Başlık</span>
                </div>
                <button
                  onClick={() => copyToClipboard(result.improved_title)}
                  className="flex items-center space-x-1 text-xs font-bold px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg shadow-xs transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Kopyalandı" : "Kopyala"}</span>
                </button>
              </div>
              <p className="text-xs text-slate-900 dark:text-white bg-white dark:bg-[#0b0f19] p-3 rounded-lg border border-purple-200 dark:border-purple-900/60 font-semibold leading-relaxed">
                {result.improved_title}
              </p>
            </div>
          )}
        </div>

        {/* Sağ Kolon: Scribbles Anahtar Kelime Çizme Kutusu */}
        <div className="space-y-4">
          {/* Skor Kartı */}
          {result && (
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center shadow-xs transition-colors">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                SEO Listing Skoru
              </div>
              <div className={`text-3xl font-black mt-1 ${
                result.seo_score >= 80 ? "text-emerald-600 dark:text-emerald-400" : result.seo_score >= 60 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"
              }`}>
                {result.seo_score} <span className="text-sm font-normal text-slate-500">/ 100</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Trendyol Sıralama İndeksi</div>
            </div>
          )}

          {/* Scribbles Kelime Bankası */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 shadow-xs transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Hedef Anahtar Kelimeler ({targetKeywords.length})</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-semibold">Scribbles Çizim</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Başlığınızda kullandığınız kelimelerin üstü yeşil ile çizilir:
            </p>

            {/* Yeni Kelime Ekleme */}
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={newKeywordInput}
                onChange={(e) => setNewKeywordInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddKeyword()}
                placeholder="Yeni kelime ekle..."
                className="flex-1 px-2.5 py-1 text-xs bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="p-1 rounded-md bg-purple-600 hover:bg-purple-500 text-white"
                title="Kelime Ekle"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {targetKeywords.map((kw) => {
                const used = isWordUsed(kw);
                return (
                  <span
                    key={kw}
                    className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-md font-semibold transition-all ${
                      used
                        ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 line-through border border-emerald-300 dark:border-emerald-500/30"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <span>{kw}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(kw)}
                      className="hover:text-rose-500 text-slate-400 ml-0.5"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Algoritma İpuçları */}
          {result && result.suggestions && (
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2 shadow-xs transition-colors">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Listing İpuçları
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                {result.suggestions.map((tip: string, idx: number) => (
                  <li key={idx} className="flex items-start space-x-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
