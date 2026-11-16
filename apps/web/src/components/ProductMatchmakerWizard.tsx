"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Zap,
  Target,
  ArrowRight,
  RotateCcw,
  Lock,
  Unlock,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  ShieldAlert,
  Crown,
  ChevronRight,
  ExternalLink,
  Calculator,
  BookmarkPlus,
  PackageCheck,
  Building2,
  Boxes,
  Compass,
} from "lucide-react";
import ProMembershipModal from "./ProMembershipModal";
import { apiUrl } from "@/lib/api";

export interface MatchmakerItem {
  rank: number;
  id?: number;
  title: string;
  brand?: string;
  category_name?: string;
  current_price: number;
  original_price?: number;
  currency: string;
  seller_name?: string;
  rating: number;
  review_count: number;
  favorite_count: number;
  estimated_monthly_sales: number;
  estimated_monthly_revenue: number;
  opportunity_score: number;
  image_url?: string;
  url?: string;
  match_score: number;
  match_badge: string;
  match_reason: string;
  is_locked: boolean;
}

export interface MatchmakerResultData {
  total_scanned_market_volume: number;
  eliminated_count: number;
  matched_count: number;
  strategy_summary: string;
  products: MatchmakerItem[];
}

interface ProductMatchmakerWizardProps {
  onOpenProfitCalculator?: (product: any) => void;
  onToggleTrack?: (product: any) => void;
}

export default function ProductMatchmakerWizard({
  onOpenProfitCalculator,
  onToggleTrack,
}: ProductMatchmakerWizardProps) {
  // Wizard Durumları
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [businessModel, setBusinessModel] = useState<"private_label" | "arbitrage" | "dropshipping">("private_label");
  const [profitSpeed, setProfitSpeed] = useState<"fast_turnover" | "high_margin" | "balanced">("high_margin");
  const [budget, setBudget] = useState<"micro" | "medium" | "high">("medium");
  const [selectedCategory, setSelectedCategory] = useState<string>("Tüm Kategoriler");

  // Sonuç ve Yükleme Durumları
  const [loading, setLoading] = useState(false);
  const [scanStepText, setScanStepText] = useState("");
  const [results, setResults] = useState<MatchmakerResultData | null>(null);

  // VIP Modal
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [selectedRankForVip, setSelectedRankForVip] = useState<number | undefined>(undefined);

  // Kategoriler
  const categories = [
    "Tüm Kategoriler",
    "Elektronik",
    "Ev & Yaşam",
    "Anne & Bebek",
    "Kozmetik & Kişisel Bakım",
    "Spor & Outdoor",
    "Kitap & Hobi",
    "Oto & Yapı Market",
  ];

  // Otomatik İlerleme Yardımcıları
  const handleSelectBusinessModel = (model: "private_label" | "arbitrage" | "dropshipping") => {
    setBusinessModel(model);
    setTimeout(() => {
      setStep(2);
    }, 220);
  };

  const handleSelectProfitSpeed = (speed: "fast_turnover" | "high_margin" | "balanced") => {
    setProfitSpeed(speed);
    setTimeout(() => {
      setStep(3);
    }, 220);
  };

  const handleSelectBudget = (b: "micro" | "medium" | "high") => {
    setBudget(b);
    setTimeout(() => {
      executeScan(businessModel, profitSpeed, b, selectedCategory);
    }, 240);
  };

  // Eşleştirme Motorunu Başlat
  const executeScan = async (
    bModel = businessModel,
    pSpeed = profitSpeed,
    bg = budget,
    cat = selectedCategory
  ) => {
    setLoading(true);
    setScanStepText("Trendyol'da 18.450+ canlı pazar ürünü taranıyor...");

    setTimeout(() => {
      setScanStepText("Zarar ettiren & yüksek rekabetli 18.440 ürün eleniyor...");
    }, 700);

    setTimeout(() => {
      setScanStepText("Kriterlerinize uyan 10 'Altın Madeni' ürün skorlanıyor...");
    }, 1400);

    try {
      const payload = {
        business_model: bModel,
        profit_speed: pSpeed,
        budget: bg,
        category: cat !== "Tüm Kategoriler" ? cat : null,
      };

      const res = await fetch(apiUrl("/api/v1/products/matchmaker"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Eşleştirme servisi yanıt vermedi");

      const data: MatchmakerResultData = await res.json();
      setTimeout(() => {
        setResults(data);
        setStep(4);
        setLoading(false);
      }, 1900);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleRunMatchmaker = () => {
    executeScan();
  };

  const handleReset = () => {
    setStep(1);
    setResults(null);
  };

  return (
    <div className="w-full mb-8 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-[#0f172a] dark:via-[#090d16] dark:to-[#0b101e] border border-blue-200 dark:border-blue-500/20 shadow-xl dark:shadow-2xl p-5 sm:p-7 relative overflow-hidden">
      {/* Arka plan ışık efektleri */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Pro Modal */}
      <ProMembershipModal
        isOpen={isVipModalOpen}
        onClose={() => setIsVipModalOpen(false)}
        productRank={selectedRankForVip}
      />

      {/* BAŞLIK & VİZYON ALANI */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-5 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            3 Soruda E-Ticaret Başarı Sihirbazı
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Sermayene & Stratejine En Uygun <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 dark:from-blue-400 dark:via-indigo-300 dark:to-emerald-400">Kazandıran Ürünü Keşfet</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Sayfalarca veri arasında kaybolma. 3 tercihin doğrultusunda Trendyol pazarının en kârlı 10 fırsatını eşleştirelim.
          </p>
        </div>

        {/* Adım göstergesi - Tıklanabilir Hızlı Geçiş */}
        {step < 4 && (
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`px-2.5 py-1 rounded transition flex items-center gap-1 ${
                step === 1 ? "bg-blue-600 text-white font-bold" : step > 1 ? "text-blue-400 hover:text-white" : "text-slate-500"
              }`}
            >
              1. Model
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <button
              type="button"
              onClick={() => setStep(2)}
              className={`px-2.5 py-1 rounded transition flex items-center gap-1 ${
                step === 2 ? "bg-blue-600 text-white font-bold" : step > 2 ? "text-blue-400 hover:text-white" : "text-slate-500"
              }`}
            >
              2. Kâr & Hız
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <button
              type="button"
              onClick={() => setStep(3)}
              className={`px-2.5 py-1 rounded transition flex items-center gap-1 ${
                step === 3 ? "bg-blue-600 text-white font-bold" : "text-slate-500"
              }`}
            >
              3. Sermaye
            </button>
          </div>
        )}

        {step === 4 && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Yeni Arama Yap
          </button>
        )}
      </div>

      {/* YÜKLEME EKRANI (RADAR ANİMASYONU) */}
      {loading && (
        <div className="py-14 flex flex-col items-center justify-center text-center">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-ping" />
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-indigo-500 border-b-emerald-500 border-l-transparent animate-spin" />
            <div className="absolute inset-2 rounded-full bg-slate-900 flex items-center justify-center">
              <Compass className="w-8 h-8 text-blue-400 animate-pulse" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">{scanStepText}</h3>
          <p className="text-xs text-slate-400 max-w-md">
            Piyasa derinliği, Buybox rekabeti, komisyon oranları ve iade marjları algoritmik olarak filtreleniyor...
          </p>
        </div>
      )}

      {/* ADIM 1: İŞ MODELİ */}
      {!loading && step === 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-slate-950 text-xs font-black">1</span>
              Nasıl bir satış stratejisi ile ilerleyeceksin?
            </div>
            <span className="text-[11px] text-blue-400/80 hidden sm:inline-flex items-center gap-1 font-medium">
              ⚡ Kartı seçtiğinde otomatik sonraki adıma geçer
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Private Label */}
            <button
              type="button"
              onClick={() => handleSelectBusinessModel("private_label")}
              className={`p-4 rounded-xl border text-left transition flex flex-col justify-between group hover:scale-[1.01] ${
                businessModel === "private_label"
                  ? "bg-blue-600/15 border-blue-500 shadow-lg shadow-blue-500/10"
                  : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 w-fit mb-3 group-hover:bg-blue-500/20 transition">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-white flex items-center justify-between">
                  Kendi Markam (Özel Üretim)
                  <ArrowRight className="w-3.5 h-3.5 text-blue-400 opacity-0 group-hover:opacity-100 transition" />
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Matbaa (ajanda/planlayıcı), tekstil & müslin, 3D yazıcı aparatları, ahşap atölye, butik mum & doğal kozmetik gibi yerel fason üretim nişleri.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> %45 - %65 Hedef Kâr • Sıfır Buybox Savaşı
              </div>
            </button>

            {/* Arbitrage */}
            <button
              type="button"
              onClick={() => handleSelectBusinessModel("arbitrage")}
              className={`p-4 rounded-xl border text-left transition flex flex-col justify-between group hover:scale-[1.01] ${
                businessModel === "arbitrage"
                  ? "bg-blue-600/15 border-blue-500 shadow-lg shadow-blue-500/10"
                  : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 w-fit mb-3 group-hover:bg-indigo-500/20 transition">
                  <Building2 className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-white flex items-center justify-between">
                  Bayilik & Arbitraj Satışı
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400 opacity-0 group-hover:opacity-100 transition" />
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Philips, Karaca, Sinbo, Xiaomi, Arzum gibi tanınmış çok satan markaları toptancıdan alıp Trendyol Buybox'ta hızlı satma.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-blue-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Günlük 30-80 Hızlı Sipariş • Kanıtlanmış Talep
              </div>
            </button>

            {/* Dropshipping */}
            <button
              type="button"
              onClick={() => handleSelectBusinessModel("dropshipping")}
              className={`p-4 rounded-xl border text-left transition flex flex-col justify-between group hover:scale-[1.01] ${
                businessModel === "dropshipping"
                  ? "bg-blue-600/15 border-blue-500 shadow-lg shadow-blue-500/10"
                  : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 w-fit mb-3 group-hover:bg-emerald-500/20 transition">
                  <Boxes className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-white flex items-center justify-between">
                  Stoksuz E-Ticaret (Dropship)
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400 opacity-0 group-hover:opacity-100 transition" />
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  0-1 desi mikro kargo avantajlı, kırılma riski olmayan, yüksek algılanan değerli hafif tüketici aksesuarları ve düzenleyiciler.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-amber-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Sıfır Depo & Kırılma Riski • 0 Desi Kargo
              </div>
            </button>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500">
              Mevcut seçim: <strong className="text-slate-300 font-semibold">{businessModel === "private_label" ? "Kendi Markam (Özel Üretim)" : businessModel === "arbitrage" ? "Bayilik & Arbitraj" : "Stoksuz (Dropshipping)"}</strong>
            </span>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
            >
              Devam Et <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ADIM 2: KÂR & HIZ TERCİHİ */}
      {!loading && step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-slate-950 text-xs font-black">2</span>
              Kâr marjı ve satış hızı konusunda önceliğin nedir?
            </div>
            <span className="text-[11px] text-blue-400/80 hidden sm:inline-flex items-center gap-1 font-medium">
              ⚡ Seçtiğinde otomatik sermaye adımına geçer
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Fast Turnover */}
            <button
              type="button"
              onClick={() => handleSelectProfitSpeed("fast_turnover")}
              className={`p-4 rounded-xl border text-left transition flex flex-col justify-between group hover:scale-[1.01] ${
                profitSpeed === "fast_turnover"
                  ? "bg-blue-600/15 border-blue-500 shadow-lg shadow-blue-500/10"
                  : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 w-fit mb-3 group-hover:bg-amber-500/20 transition">
                  <Zap className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-white flex items-center justify-between">
                  Hızlı Sürüm / Yüksek Hacim
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400 opacity-0 group-hover:opacity-100 transition" />
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Marj %15-%25 olsun ama günde onlarca sipariş çıksın. Hızlı nakit akışı ve yüksek mağaza puanı odaklı.
                </p>
              </div>
              <div className="mt-4 text-[11px] font-semibold text-amber-400">
                ⚡ Günlük 40+ Sipariş Hızı
              </div>
            </button>

            {/* High Margin */}
            <button
              type="button"
              onClick={() => handleSelectProfitSpeed("high_margin")}
              className={`p-4 rounded-xl border text-left transition flex flex-col justify-between group hover:scale-[1.01] ${
                profitSpeed === "high_margin"
                  ? "bg-blue-600/15 border-blue-500 shadow-lg shadow-blue-500/10"
                  : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 w-fit mb-3 group-hover:bg-emerald-500/20 transition">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-white flex items-center justify-between">
                  Yüksek Kâr Marjı / Düşük Rekabet
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400 opacity-0 group-hover:opacity-100 transition" />
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Günde 8-12 sipariş çıksın ama her satıştan net %40-%60 kâr bıraksın. Rakiplerin az olduğu gizli nişler.
                </p>
              </div>
              <div className="mt-4 text-[11px] font-semibold text-emerald-400">
                💎 Yüksek Net Kazanç
              </div>
            </button>

            {/* Balanced */}
            <button
              type="button"
              onClick={() => handleSelectProfitSpeed("balanced")}
              className={`p-4 rounded-xl border text-left transition flex flex-col justify-between group hover:scale-[1.01] ${
                profitSpeed === "balanced"
                  ? "bg-blue-600/15 border-blue-500 shadow-lg shadow-blue-500/10"
                  : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 w-fit mb-3 group-hover:bg-purple-500/20 transition">
                  <Target className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-white flex items-center justify-between">
                  Dengeli Hibrit Portföy
                  <ArrowRight className="w-3.5 h-3.5 text-purple-400 opacity-0 group-hover:opacity-100 transition" />
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Hem nakit akışını sağlayan hem de kârlılık getiren dengeli orta yol ürünleri.
                </p>
              </div>
              <div className="mt-4 text-[11px] font-semibold text-purple-400">
                ⚖️ Risk & Getiri Dengesi
              </div>
            </button>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1"
            >
              ← Geri (1. Adım)
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
            >
              Devam Et (3. Adım) <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ADIM 3: SERMAYE VE KATEGORİ SEÇİMİ */}
      {!loading && step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-slate-950 text-xs font-black">3</span>
              Başlangıç için ayırdığın sermaye miktarı nedir?
            </div>
            <span className="text-[11px] text-emerald-400/80 hidden sm:inline-flex items-center gap-1 font-medium">
              ⚡ Sermaye seçtiğinizde pazar taraması otomatik başlar
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Micro */}
            <button
              type="button"
              onClick={() => handleSelectBudget("micro")}
              className={`p-4 rounded-xl border text-left transition flex flex-col justify-between group hover:scale-[1.01] ${
                budget === "micro"
                  ? "bg-blue-600/15 border-blue-500 shadow-lg shadow-blue-500/10"
                  : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">Mikro Bütçe</span>
                <h4 className="font-bold text-base text-white mt-2 flex items-center justify-between">
                  0 - 15.000 TL
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 opacity-0 group-hover:opacity-100 transition" />
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Küçük, hafif kargo desi avantajlı ve düşük birim maliyetli ürünler.
                </p>
              </div>
            </button>

            {/* Medium */}
            <button
              type="button"
              onClick={() => handleSelectBudget("medium")}
              className={`p-4 rounded-xl border text-left transition flex flex-col justify-between group hover:scale-[1.01] ${
                budget === "medium"
                  ? "bg-blue-600/15 border-blue-500 shadow-lg shadow-blue-500/10"
                  : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">Standart Girişimci</span>
                <h4 className="font-bold text-base text-white mt-2 flex items-center justify-between">
                  15.000 - 50.000 TL
                  <Sparkles className="w-3.5 h-3.5 text-blue-400 opacity-0 group-hover:opacity-100 transition" />
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Geniş ürün kataloğu, ortalama sepet büyüklüğü ve dengeli stok alımı.
                </p>
              </div>
            </button>

            {/* High */}
            <button
              type="button"
              onClick={() => handleSelectBudget("high")}
              className={`p-4 rounded-xl border text-left transition flex flex-col justify-between group hover:scale-[1.01] ${
                budget === "high"
                  ? "bg-blue-600/15 border-blue-500 shadow-lg shadow-blue-500/10"
                  : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold">Profesyonel Sermaye</span>
                <h4 className="font-bold text-base text-white mt-2 flex items-center justify-between">
                  50.000 TL ve Üzeri
                  <Sparkles className="w-3.5 h-3.5 text-purple-400 opacity-0 group-hover:opacity-100 transition" />
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Yüksek cirolu, premium elektronik veya çoklu set ürünleri.
                </p>
              </div>
            </button>
          </div>

          {/* İsteğe Bağlı Kategori */}
          <div className="pt-2">
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">
              İsteğe Bağlı Kategori Tercihi:
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedCategory(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    selectedCategory === c
                      ? "bg-blue-600 text-white font-bold"
                      : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              ← Geri (2. Adım)
            </button>
            <button
              type="button"
              onClick={handleRunMatchmaker}
              className="py-2.5 px-6 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 text-white hover:brightness-110 shadow-lg shadow-blue-500/20 flex items-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4" />
              18.450 Ürün Arasından Fırsatları Eşleştir
            </button>
          </div>
        </div>
      )}
      {/* ADIM 4: SONUÇLAR & 10 ÜRÜNLÜK FREEMIUM PORTFÖYÜ */}
      {!loading && step === 4 && results && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* BÜYÜK VERİ İSTATİSTİK PANO BARI */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="p-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Taranan Canlı Pazar</span>
              <span className="text-xl font-black text-blue-400">
                {results.total_scanned_market_volume.toLocaleString("tr-TR")}+ Ürün
              </span>
            </div>
            <div className="p-2 border-t sm:border-t-0 sm:border-l sm:border-r border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Elenen Verimsiz Ürünler</span>
              <span className="text-xl font-black text-slate-400">
                {results.eliminated_count.toLocaleString("tr-TR")} Ürün
              </span>
              <span className="text-[10px] text-slate-500 block">Düşük Kâr & Yüksek Rekabet</span>
            </div>
            <div className="p-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Kriterlerinize Uyan</span>
              <span className="text-xl font-black text-emerald-400">10 Altın Madeni Ürün</span>
            </div>
          </div>

          {/* Strateji Özeti */}
          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 shrink-0 mt-0.5">
              <Target className="w-4 h-4" />
            </div>
            <div className="text-xs text-slate-300">
              <span className="font-bold text-white">Strateji Raporu: </span>
              {results.strategy_summary}
              <div className="text-[11px] text-emerald-400 font-bold mt-1">
                Tüm ürünler ve pazar verileri beta sürecinde tamamen ücretsiz ve sınırsız kullanımınıza açıktır.
              </div>
            </div>
          </div>

          {/* 10 ÜRÜNLÜK LİSTE (Tüm Kartlar Açık) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.products.map((p) => {
              return (
                <div
                  key={p.rank}
                  className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/20 via-slate-900 to-slate-900 border border-emerald-500/30 hover:border-emerald-500/80 shadow-xl relative flex flex-col justify-between transition group"
                >
                  <div>
                    {/* Üst Rozet Barı */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                        <Sparkles className="w-3.5 h-3.5" />
                        {p.match_badge}
                      </span>
                      <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                        %{p.match_score} Uyum
                      </span>
                    </div>

                    {/* Başlık ve Kategori */}
                    <h4 className="font-bold text-sm text-white line-clamp-2 group-hover:text-emerald-300 transition">
                      {p.title}
                    </h4>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Kategori: <span className="text-slate-300">{p.category_name}</span> • Satıcı: {p.seller_name}
                    </div>

                    {/* Metrik Grid */}
                    <div className="grid grid-cols-3 gap-2 my-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Güncel Fiyat</span>
                        <span className="text-xs font-black text-white">₺{p.current_price.toLocaleString("tr-TR")}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Tahmini Satış</span>
                        <span className="text-xs font-black text-emerald-400">~{p.estimated_monthly_sales} ad/ay</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Tahmini Ciro</span>
                        <span className="text-xs font-black text-blue-400">₺{p.estimated_monthly_revenue.toLocaleString("tr-TR")}</span>
                      </div>
                    </div>

                    {/* Neden Seçildi Açıklaması */}
                    <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-300">
                      <span className="font-bold text-emerald-400">Pazar Analizi: </span>
                      {p.match_reason}
                    </div>
                  </div>

                  {/* Aksiyon Butonları */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {onOpenProfitCalculator && (
                        <button
                          type="button"
                          onClick={() => onOpenProfitCalculator(p)}
                          className="p-2 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition flex items-center gap-1.5"
                          title="Kârını Hesapla"
                        >
                          <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                          Kâr Hesapla
                        </button>
                      )}
                      {onToggleTrack && (
                        <button
                          type="button"
                          onClick={() => onToggleTrack(p)}
                          className="p-2 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition flex items-center gap-1.5"
                          title="Takip Listeme Ekle"
                        >
                          <BookmarkPlus className="w-3.5 h-3.5 text-amber-400" />
                          Takibe Al
                        </button>
                      )}
                    </div>

                    {p.url && p.url.startsWith("http") && (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-3 rounded-lg text-xs font-bold text-white btn-emerald transition flex items-center gap-1.5"
                      >
                        Pazaryerinde Aç <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
