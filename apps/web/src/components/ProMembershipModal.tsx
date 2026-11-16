"use client";

import React from "react";
import {
  X,
  Crown,
  CheckCircle2,
  Sparkles,
  Zap,
  TrendingUp,
  ShieldCheck,
  Lock,
} from "lucide-react";

interface ProMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  productRank?: number;
}

export default function ProMembershipModal({
  isOpen,
  onClose,
  productRank,
}: ProMembershipModalProps) {
  if (!isOpen) return null;

  const features = [
    {
      title: "10/10 Tam Ürün Portföyü & Tedarikçi İletişimi",
      desc: "Kilitli 1. ve 2. sıradaki en çok satan altın madeni ürünlerin tam isimleri, linkleri ve toptancı tedarikçi tüyoları.",
    },
    {
      title: "Keepa Tarzı Canlı Fiyat, Buybox & Stok Takip Motoru",
      desc: "Her 15 dakikada bir otomatik güncellenen anlık fiyat düşüş ve stok tükenme bildirimleri.",
    },
    {
      title: "Cerebro & Magnet Sınırsız Ters ASIN Arama",
      desc: "Rakiplerinizin hangi kelimelerden organik ciro çektiğini tek tıkla gösteren ters indeksleme.",
    },
    {
      title: "Yapay Zeka (AI) SEO & Yorum Madenciliği",
      desc: "Müşterilerin şikayet ettiği kronik kusurları tespit eden ve 1 tıkla kusursuz başlık yazan AI motoru.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#11192e] to-[#0a0f1d] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8">
        {/* Işıma efekti */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Kapat butonu */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Başlık ve Rozet */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Crown className="w-4 h-4 text-amber-400 animate-pulse" />
            ÜrünBul PRO Satıcı Kulübü
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {productRank
              ? `#${productRank} Numaralı VIP Fırsat Ürününün Kilidini Aç`
              : "Tüm Altın Madeni Ürünlerin Kilidini Aç"}
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-lg">
            Günde yüzlerce sipariş alan, pazarın en karlı ürünlerini ve toptancı tedarikçi tüyolarını ilk siz keşfedin.
          </p>
        </div>

        {/* Özellik Listesi */}
        <div className="space-y-3.5 my-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/20 transition"
            >
              <div className="p-1 rounded-lg bg-amber-500/10 text-amber-400 mt-0.5 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-semibold text-slate-200">{f.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Fiyatlandırma Kutusu & CTA */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/10 border border-amber-500/30 text-center">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-xs text-slate-400 line-through">₺599 / Ay</span>
            <span className="text-3xl font-black text-amber-400">₺299</span>
            <span className="text-xs text-slate-300">/ Aylık (Lansmana Özel %50 İndirim)</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-medium mt-1">
            ⚡ 7 Gün Koşulsuz Ücretsiz İptal Garantisi
          </p>

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                alert("Pro üyelik entegrasyonu simülasyonu: VIP özellikler için test üyeliği aktif edildi!");
                onClose();
              }}
              className="flex-1 py-3 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              7 Gün Ücretsiz Dene ve Kilidi Aç
            </button>
            <button
              onClick={onClose}
              className="py-3 px-5 rounded-xl text-sm font-medium text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition"
            >
              Şimdilik 2 Ücretsiz Ürünü İncele
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 mt-4">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> %100 Güvenli Ödeme
          </span>
          <span>•</span>
          <span>Anında Aktivasyon</span>
          <span>•</span>
          <span>İstediğin Zaman İptal Et</span>
        </div>
      </div>
    </div>
  );
}
