"use client";

import React, { useEffect, useState } from "react";
import { Activity, Zap, CheckCircle2, Package, Sparkles, X, Coffee } from "lucide-react";

export interface LiveRadarProgress {
  page: number;
  max_pages: number;
  scanned: number;
  matched: number;
  marketplace: string;
  message: string;
  products_so_far?: any[];
}

interface LiveRadarScanModalProps {
  isOpen: boolean;
  progress: LiveRadarProgress | null;
  onStopAndShow: () => void;
  onCancel: () => void;
}

const HUMOROUS_FALLBACK_MESSAGES = [
  "Dünden kalan bayat yemek yok, anlık sıcacık pazaryerini kazıyoruz...",
  "Az kaldı, yüklenip duru...",
  "İstersen bi çay al gel, yüksek kârlı fırsatlar radara takılıyor...",
  "Düşük kârlı rakipler eleniyor, kâr marjları hesaplanıyor...",
  "Fiyat geçmişi ve BSR verileri çözümleniyor...",
  "Fırsat endeksi tavan yapan yıldız ürünler ayıklanıyor...",
  "Son düzlüğe girdik, pazar istihbaratı masaya geliyor...",
];

export default function LiveRadarScanModal({
  isOpen,
  progress,
  onStopAndShow,
  onCancel,
}: LiveRadarScanModalProps) {
  const [msgIndex, setMsgIndex] = useState(0);

  // Esprili yerel mesajları 3.5 saniyede bir döndür
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % HUMOROUS_FALLBACK_MESSAGES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const page = progress?.page || 1;
  const maxPages = progress?.max_pages || 8;
  const scanned = progress?.scanned || 0;
  const matched = progress?.matched || 0;
  const marketplace = progress?.marketplace || "Pazaryeri";
  const displayMsg = progress?.message || HUMOROUS_FALLBACK_MESSAGES[msgIndex];

  // Yüzde hesaplama (sayfa bazında)
  const percent = Math.min(98, Math.max(10, Math.round((page / maxPages) * 100)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0b1020] border border-blue-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 overflow-hidden">
        {/* Arka plan siber ışıltı efekti */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Kapat / İptal Butonu */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          title="Taramayı İptal Et"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. DÖNEN RADAR İLLÜSTRASYONU */}
        <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
          {/* Dış halkalar */}
          <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-ping opacity-30" />
          <div className="absolute inset-2 rounded-full border border-indigo-500/40" />
          <div className="absolute inset-6 rounded-full border border-emerald-500/30" />

          {/* Dönen radar ışığı */}
          <div
            className="absolute inset-0 rounded-full border-t-2 border-r-2 border-emerald-400 animate-spin"
            style={{ animationDuration: "1.8s" }}
          />

          {/* Merkez İkon */}
          <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Activity className="w-7 h-7 text-white animate-pulse" />
          </div>
        </div>

        {/* 2. BAŞLIK & PAZARYERİ ROZETİ */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-black tracking-wider uppercase">
            <Zap className="w-3.5 h-3.5 fill-current text-amber-400" />
            <span>{marketplace} Canlı Pazar Radarı</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Pazar Anlık Taranıyor...
          </h3>

          {/* Dinamik ve Sempatik Türkçe Mesaj */}
          <p className="text-sm font-semibold text-emerald-400 min-h-[44px] flex items-center justify-center px-4 leading-snug">
            {displayMsg}
          </p>
        </div>

        {/* 3. İLERLEME ÇUBUĞU (% BAR) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Canlı İlerleme</span>
            </span>
            <span className="font-mono text-emerald-400">%{percent}</span>
          </div>

          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* 4. CANLI SAYAÇ KARTLARI (3'LÜ GRID) */}
        <div className="grid grid-cols-3 gap-2 text-left">
          <div className="bg-[#070b16] border border-slate-800 p-3 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Sayfa Derinliği
            </span>
            <div className="text-sm sm:text-base font-black text-white mt-0.5">
              {page} <span className="text-xs text-slate-500 font-normal">/ {maxPages}</span>
            </div>
          </div>

          <div className="bg-[#070b16] border border-slate-800 p-3 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              İncelenen Ürün
            </span>
            <div className="text-sm sm:text-base font-black text-blue-400 mt-0.5">
              {scanned.toLocaleString("tr-TR")}
            </div>
          </div>

          <div className="bg-[#070b16] border border-emerald-500/30 p-3 rounded-2xl bg-emerald-950/20">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
              Fırsat Yakalandı
            </span>
            <div className="text-sm sm:text-base font-black text-emerald-300 mt-0.5 flex items-center gap-1">
              <span>{matched.toLocaleString("tr-TR")}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            </div>
          </div>
        </div>

        {/* 5. AKSİYON BUTONLARI: ERKEN BİTİR & İNCELE */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          {matched > 0 && (
            <button
              type="button"
              onClick={onStopAndShow}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 active:scale-95 text-slate-950 font-black text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" />
              <span>Mevcut {matched} Fırsatı Göster</span>
            </button>
          )}

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1 sm:pt-0">
            <Coffee className="w-3.5 h-3.5 text-amber-400" />
            <span>Gerçek zamanlı pazar istihbaratı toplanıyor</span>
          </div>
        </div>
      </div>
    </div>
  );
}
