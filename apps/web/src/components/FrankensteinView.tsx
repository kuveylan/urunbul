"use client";

import React, { useState, useMemo } from "react";
import { Scissors, Copy, Check, Trash2, ArrowRight, Sparkles, Filter, FileText } from "lucide-react";

interface FrankensteinViewProps {
  onSendToScribbles?: (keywords: string[]) => void;
}

const TURKISH_STOP_WORDS = new Set([
  "ve", "ile", "için", "bir", "bu", "şu", "o", "de", "da", "ki", "en", "daha",
  "tüm", "her", "gibi", "kadar", "olan", "olarak", "model", "uyumlu", "yeni", "adet"
]);

export default function FrankensteinView({ onSendToScribbles }: FrankensteinViewProps) {
  const [inputText, setInputText] = useState(
    "Xiaomi Redmi Buds 4 Active\nbluetooth kulaklik\nkablosuz kulaklik\nkulaklik\nxiaomi kulaklik\nsiyah kulaklik\nbud 4 active\nsiyah kulaklik\nbluetooth kulaklik"
  );
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [toLowerCase, setToLowerCase] = useState(true);
  const [removePunctuation, setRemovePunctuation] = useState(true);
  const [removeNumbers, setRemoveNumbers] = useState(false);
  const [removeStopWords, setRemoveStopWords] = useState(true);
  const [outputFormat, setOutputFormat] = useState<"lines" | "commas" | "spaces">("lines");
  const [copied, setCopied] = useState(false);

  // Frankenstein İşlem Motoru
  const { outputText, originalWordsCount, finalWordsCount, duplicatesRemoved, charCount } = useMemo(() => {
    if (!inputText.trim()) {
      return {
        outputText: "",
        originalWordsCount: 0,
        finalWordsCount: 0,
        duplicatesRemoved: 0,
        charCount: 0,
      };
    }

    let raw = inputText;
    if (toLowerCase) {
      raw = raw.toLocaleLowerCase("tr-TR");
    }

    if (removePunctuation) {
      raw = raw.replace(/[^\w\sğüşıöçĞÜŞİÖÇ]/g, " ");
    }

    if (removeNumbers) {
      raw = raw.replace(/\d+/g, " ");
    }

    // Kelimelere ayır
    const words = raw
      .split(/\s+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0);

    const origCount = words.length;

    let processedWords = words;

    if (removeStopWords) {
      processedWords = processedWords.filter((w) => !TURKISH_STOP_WORDS.has(w));
    }

    let dupesCount = 0;
    if (removeDuplicates) {
      const seen = new Set<string>();
      const uniqueList: string[] = [];
      for (const w of processedWords) {
        if (!seen.has(w)) {
          seen.add(w);
          uniqueList.push(w);
        } else {
          dupesCount++;
        }
      }
      processedWords = uniqueList;
    }

    let out = "";
    if (outputFormat === "lines") {
      out = processedWords.join("\n");
    } else if (outputFormat === "commas") {
      out = processedWords.join(", ");
    } else {
      out = processedWords.join(" ");
    }

    return {
      outputText: out,
      originalWordsCount: origCount,
      finalWordsCount: processedWords.length,
      duplicatesRemoved: dupesCount,
      charCount: out.length,
    };
  }, [
    inputText,
    removeDuplicates,
    toLowerCase,
    removePunctuation,
    removeNumbers,
    removeStopWords,
    outputFormat,
  ]);

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInputText("");
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Başlık Kartı */}
      <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <h1 className="text-lg font-black text-white tracking-wide">
              Frankenstein Anahtar Kelime İşlemcisi
            </h1>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
              Profesyonel Kelime Filtreleme Modeli
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cerebro, Magnet veya rakip ürünlerden topladığınız binlerce dağınık anahtar kelimeyi anında tekilleştirin, filtreleyin ve listing için optimize edin.
          </p>
        </div>
      </div>

      {/* İstatistik Çubuğu */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-[#0f172a] p-3 rounded-xl border border-slate-800">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Giriş Kelime Sayısı</div>
          <div className="text-xl font-black text-white mt-0.5">{originalWordsCount}</div>
        </div>
        <div className="bg-[#0f172a] p-3 rounded-xl border border-slate-800">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Net Tekil Kelime</div>
          <div className="text-xl font-black text-orange-400 mt-0.5">{finalWordsCount}</div>
        </div>
        <div className="bg-[#0f172a] p-3 rounded-xl border border-slate-800">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Elenen Çiftler</div>
          <div className="text-xl font-black text-emerald-400 mt-0.5">-{duplicatesRemoved}</div>
        </div>
        <div className="bg-[#0f172a] p-3 rounded-xl border border-slate-800">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Toplam Karakter</div>
          <div className="text-xl font-black text-purple-400 mt-0.5">{charCount}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sol Kolon: Ham Giriş Metni */}
        <div className="lg:col-span-5 bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Ham Kelime / Arama Listesi (Giriş)</span>
            </span>
            <button
              onClick={handleClear}
              className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Temizle</span>
            </button>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Kelimeleri veya ürün başlıklarını buraya yapıştırın..."
            rows={14}
            className="w-full flex-1 p-3 bg-[#0b0f19] border border-slate-700/80 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors resize-none"
          />
        </div>

        {/* Orta Kolon: Filtreler ve Ayarlar */}
        <div className="lg:col-span-2 bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5 mb-3">
              <Filter className="w-4 h-4 text-orange-400" />
              <span>Filtre Seçenekleri</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={removeDuplicates}
                  onChange={(e) => setRemoveDuplicates(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-orange-600 focus:ring-0"
                />
                <span className="text-[11px] font-semibold">Çiftleri Kaldır</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={toLowerCase}
                  onChange={(e) => setToLowerCase(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-orange-600 focus:ring-0"
                />
                <span className="text-[11px] font-semibold">Küçük Harfe Çevir</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={removePunctuation}
                  onChange={(e) => setRemovePunctuation(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-orange-600 focus:ring-0"
                />
                <span className="text-[11px] font-semibold">Noktalamayı Sil</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={removeNumbers}
                  onChange={(e) => setRemoveNumbers(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-orange-600 focus:ring-0"
                />
                <span className="text-[11px] font-semibold">Sayıları Çıkar</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={removeStopWords}
                  onChange={(e) => setRemoveStopWords(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-orange-600 focus:ring-0"
                />
                <span className="text-[11px] font-semibold">Stopwords (ve, ile)</span>
              </label>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Çıktı Formatı
              </span>
              <div className="space-y-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setOutputFormat("lines")}
                  className={`w-full text-left px-2.5 py-1.5 rounded transition-all font-semibold ${
                    outputFormat === "lines"
                      ? "bg-orange-600 text-white"
                      : "bg-[#0b0f19] text-slate-400 hover:text-white"
                  }`}
                >
                  Satır Satır
                </button>
                <button
                  type="button"
                  onClick={() => setOutputFormat("commas")}
                  className={`w-full text-left px-2.5 py-1.5 rounded transition-all font-semibold ${
                    outputFormat === "commas"
                      ? "bg-orange-600 text-white"
                      : "bg-[#0b0f19] text-slate-400 hover:text-white"
                  }`}
                >
                  Virgülle Ayrılmış
                </button>
                <button
                  type="button"
                  onClick={() => setOutputFormat("spaces")}
                  className={`w-full text-left px-2.5 py-1.5 rounded transition-all font-semibold ${
                    outputFormat === "spaces"
                      ? "bg-orange-600 text-white"
                      : "bg-[#0b0f19] text-slate-400 hover:text-white"
                  }`}
                >
                  Boşlukla Ayrılmış
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ Kolon: Temizlenmiş Çıktı */}
        <div className="lg:col-span-5 bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
              <Scissors className="w-4 h-4 text-orange-400" />
              <span>İşlenmiş & Optimize Kelimeler (Çıktı)</span>
            </span>
            <button
              onClick={handleCopy}
              className="text-[11px] px-3 py-1 rounded bg-orange-600 hover:bg-orange-500 text-white font-bold flex items-center gap-1 shadow-sm transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Kopyalandı!" : "Kopyala"}</span>
            </button>
          </div>
          <textarea
            readOnly
            value={outputText}
            rows={14}
            className="w-full flex-1 p-3 bg-[#0b0f19] border border-slate-700/80 rounded-lg text-xs font-mono text-orange-200 placeholder-slate-600 focus:outline-none transition-colors resize-none"
          />
        </div>
      </div>
    </div>
  );
}
