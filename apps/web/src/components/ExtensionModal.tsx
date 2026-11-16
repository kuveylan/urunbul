"use client";

import React from "react";
import { X, Puzzle, CheckCircle, ExternalLink, Download, ShieldCheck, Zap } from "lucide-react";

interface ExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExtensionModal({ isOpen, onClose }: ExtensionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0f172a] rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-800 max-h-[90vh] overflow-y-auto text-white">
        {/* Başlık */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Puzzle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>ÜrünBul Canlı Pazar Eklentisi</span>
                <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded">V3</span>
              </h3>
              <p className="text-xs text-slate-400">
                Trendyol.com üzerinde doğrudan çalışan canlı pazar ve satıcı araştırma eklentisi
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

        {/* İçerik */}
        <div className="my-5 space-y-4 text-xs">
          <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-blue-400">
              ⚡ ÜrünBul Uzantısı Neler Sağlar?
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-slate-300">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Trendyol arama sayfalarında tek tıkla açılan <strong>Canlı Pazar Paneli</strong>.</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Toplam sayfa cirosu, ortalama fiyat ve ortalama değerlendirme.</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Her ürün için aylık satış ve net ciro projeksiyonları.</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Sayfayı terk etmeden tek tıkla <strong>Net Kâr Hesaplayıcı</strong>.</span>
              </div>
            </div>
          </div>

          {/* Kurulum Adımları */}
          <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              🚀 3 Adımda Kolay Kurulum (Chrome / Brave / Edge)
            </h4>
            <ol className="space-y-2 text-slate-300 list-decimal list-inside leading-relaxed">
              <li>
                Tarayıcınızda <code className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300 font-mono">chrome://extensions</code> adresine gidin.
              </li>
              <li>
                Sağ üstteki <strong>"Geliştirici modu" (Developer mode)</strong> anahtarını aktif edin.
              </li>
              <li>
                <strong>"Paketlenmemiş öge yükle" (Load unpacked)</strong> butonuna basıp projedeki <code className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300 font-mono">apps/extension</code> klasörünü seçin.
              </li>
            </ol>
          </div>

          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Uzantı dosyalarınız hazır: <strong className="font-mono">apps/extension</strong></span>
            </span>
            <a
              href="https://www.trendyol.com/sr?q=kahve+makinesi"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all flex items-center gap-1 text-[11px]"
            >
              <span>Trendyol'da Test Et</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
