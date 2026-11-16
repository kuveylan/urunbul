"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Search,
  KeyRound,
  Calculator,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Zap,
  Layers,
  ArrowRight,
  CheckCircle2,
  X,
  Store,
  DollarSign,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LandingShowcaseView() {
  const { loginWithGoogle, loginWithGitHub, loading, authError, clearAuthError } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isGoogleConnecting, setIsGoogleConnecting] = useState(false);
  const [isGithubConnecting, setIsGithubConnecting] = useState(false);


  const handleGoogleLogin = () => {
    setIsGoogleConnecting(true);
    loginWithGoogle();
  };

  const handleGithubLogin = () => {
    setIsGithubConnecting(true);
    loginWithGitHub();
  };


  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (typeof window !== "undefined") {
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("urunbul_theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("urunbul_theme", "light");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors">
      {/* 1. ÜST HEADER / NAV BAR */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-[#070b14]/80 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Zap className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="text-xl font-black tracking-tight flex items-center gap-1.5 text-slate-900 dark:text-white">
                <span>ÜrünBul</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 -mt-0.5 hidden sm:block">
                Türkiye Pazaryeri İstihbarat Platformu
              </p>
            </div>
          </div>

          {/* Menü Linkleri & Eylemler */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Tema Değiştir"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>

            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              Giriş Yap
            </button>

            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center gap-2 transition transform active:scale-95"
            >
              <span>Ücretsiz Başla</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hata / Bildirim Toast Uyarısı (OAuth veya Sunucu Uyarısı) */}
      {authError && (
        <div className="max-w-4xl mx-auto mt-4 px-4 sm:px-6 w-full animate-fadeIn z-30">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start justify-between gap-3 text-xs sm:text-sm shadow-sm">
            <div className="flex items-start gap-2.5">
              <span className="p-1 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 text-base">
                ⚠️
              </span>
              <div>
                <strong className="font-bold block mb-1">Giriş Bildirimi:</strong>
                <p className="leading-relaxed">{authError}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={clearAuthError}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition shrink-0"
              title="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. HERO BÖLÜMÜ */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        {/* Arka Plan Işık Efektleri */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 dark:bg-emerald-500/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 w-[400px] h-[250px] bg-cyan-500/10 dark:bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          {/* Rozet */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-bold mb-6 animate-pulse">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>Türkiye Pazaryerlerinin İlk %100 Ücretsiz İstihbarat Motoru</span>
          </div>

          {/* Ana Başlık */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-6">
            Pazaryerlerinde Çok Satanları,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-300">
              Kârlı Fırsatları
            </span>{" "}
            ve Kelimeleri Keşfedin
          </h1>

          {/* Açıklama */}
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Trendyol, Hepsiburada, Amazon TR ve N11 üzerindeki 100.000+ ürünü tek panelde analiz edin.
            Aylık 100$ abonelik ücreti yok; reklam destekli model ile Türkiye satıcılarına <strong>200 arama/gün</strong> tamamen ücretsiz.
          </p>

          {/* CTA Butonları */}
          <div className="flex items-center justify-center gap-4 max-w-md mx-auto mb-12">
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-3 transition transform active:scale-95 cursor-pointer"
            >
              <span>Hemen Ücretsiz Katıl (Google & GitHub)</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Canlı Metrik Sayacı */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm max-w-4xl mx-auto">
            <div className="p-3 text-center">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">4 Büyük</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Pazaryeri Taraması</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-400">100.000+</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Taranan Fırsat Ürünü</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">200 Arama</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Günlük Cömert Kota</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">%100</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Ücretsiz (Reklam Destekli)</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ÖZELLİKLER VİTRİNİ (BLACKBOX, CEREBRO, MAGNET, KÂR HESAPLAYICI) */}
      <section className="py-16 sm:py-24 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
              Kapsamlı E-Ticaret Cephanesi
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              Helium 10 & Jungle Scout Gücü, Türkiye'ye Özel
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mt-3 text-base">
              Türk pazaryerlerinin dinamiklerine uygun algoritmalarla donatılmış analiz araçları.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Araç 1: Black Box */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:border-emerald-500/50 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Black Box Ürün Keşfi
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Fırsat skoru, tahmini aylık ciro, yorum adedi ve sepet yoğunluğu filtreleriyle düşük rekabetli niş ürünleri saniyeler içinde tespit edin.
              </p>
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span>Canlı Pazar Taraması</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Araç 2: Cerebro & Magnet */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:border-cyan-500/50 transition">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4">
                <KeyRound className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Cerebro & Magnet Kelime Zekası
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Rakip ürünlerin hangi arama kelimelerinden organik sipariş aldığını ve aylık arama hacimlerini listeleyin.
              </p>
              <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                <span>Ters ASIN & Barkod Röntgeni</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Araç 3: Çoklu Pazar Arbitraj */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:border-indigo-500/50 transition">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Çoklu Pazar Fiyat Arbitrajı
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Aynı ürünün Trendyol, Hepsiburada, Amazon ve N11 fiyat farklarını karşılaştırıp pazar arbitraj kâr marjlarını yakalayın.
              </p>
              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <span>4 Pazar Tek Panelde</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Araç 4: Net Kâr Simülatörü */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:border-amber-500/50 transition">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Calculator className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Net Kâr & Komisyon Simülatörü
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Güncel kategori komisyon oranları, barem kargo ücretleri ve KDV sonrası cebinize kalacak net kârı ve başa baş fiyatını hesaplayın.
              </p>
              <div className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <span>Gerçek Kârınızı Bilin</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Araç 5: Satıcı & Mağaza Röntgeni */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:border-rose-500/50 transition">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                <Store className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Rakip Mağaza Röntgeni (Storefront)
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Rakiplerinizin mağaza envanterini, en çok satan ilk 10 ürününü ve tahmini aylık toplam cirolarını analiz edin.
              </p>
              <div className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <span>Rakip Analizi</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Araç 6: Fiyat Geçmişi & Buybox Radarı */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:border-blue-500/50 transition">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Fiyat Trendleri & Buybox Takibi
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Ürünlerin 30-90 günlük fiyat değişim grafiklerini izleyin, fiyat kıran satıcıları ve indirim fırsatlarını anında yakalayın.
              </p>
              <div className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <span>Grafikli Fiyat Geçmişi</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ŞEFFAF GELİR MODELİ: "NEDEN ÜCRETSİZ?" */}
      <section className="py-16 sm:py-24 bg-white dark:bg-[#070b14]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-slate-100 to-cyan-500/10 dark:from-emerald-950/40 dark:via-slate-900/70 dark:to-cyan-950/30 border border-emerald-500/30 text-center relative overflow-hidden">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-4">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Şeffaf Gelir & İş Modeli</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-4">
              Neden Ücretsiz? Biz Nasıl Para Kazanıyoruz?
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl mx-auto">
              Yabancı yazılımların Türkiye'deki satıcılardan aylık binlerce lira talep etmesini haksız buluyoruz.
              ÜrünBul, sayfa içinde yer alan <strong>Google reklamları</strong> ve <strong>e-ticaret lojistik / entegrasyon sponsorlukları</strong> sayesinde finanse edilir.
              Bu sayede üyelerimizden <strong>asla kredi kartı bilgisi istemez ve üyelik ücreti talep etmeyiz.</strong>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Kredi Kartı Gerektirmez
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Gizli Yenileme veya Aidat Yok
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Günlük 200 Arama Kotası
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SIKÇA SORULAN SORULAR */}
      <section className="py-16 sm:py-20 bg-slate-100/50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white text-center mb-10">
            Sıkça Sorulan Sorular
          </h3>
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-2">
                Neden yalnızca Google ve GitHub ile kayıt olunuyor?
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Geçici (temp-mail) sahte e-postalarla sistemi kötüye kullanan botları ve scraperları engellemek için doğrudan gerçek kimlik doğrulaması olan Google ve GitHub OAuth tercih ettik. Böylece gerçek satıcıların kotası korunur ve sistem asla yavaşlamaz.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-2">
                Günlük 200 arama kotası bittiğinde ne olur?
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                200 arama kotası bir e-ticaret satıcısının günlük araştırma ihtiyacının fazlasıyla üzerindedir. Kota biterse gece 00:00'da sayaç otomatik sıfırlanır ve ertesi gün 200 yeni arama hakkınız tanımlanır.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-2">
                Hangi pazaryerleri destekleniyor?
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Trendyol, Hepsiburada, Amazon TR ve N11 pazaryerleri tek bir sorguda taranır ve ortak fırsat skorları harmanlanır.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="mt-auto py-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070b14] text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 ÜrünBul (urunbul.me). Tüm hakları saklıdır. Reklam destekli ücretsiz e-ticaret istihbaratı.</p>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setIsAuthModalOpen(true)} className="hover:text-emerald-500 transition">
              Giriş Yap
            </button>
            <span>•</span>
            <span className="text-slate-400">Gizlilik & Şartlar</span>
          </div>
        </div>
      </footer>

      {/* 7. AUTH MODAL (GİRİŞ & KAYIT PENCERESİ) */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-left">
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <Zap className="w-5 h-5 fill-white" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                ÜrünBul'a Katılın
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Tek tıkla giriş yapın, günlük 200 ücretsiz arama ve pazar analiz araçlarını anında kullanmaya başlayın.
            </p>

            {/* Modal İçi Hata Uyarısı */}
            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs">
                <p className="leading-snug">{authError}</p>
              </div>
            )}

            {/* Giriş Butonları */}
            <div className="space-y-3">
              {/* Google ile Giriş */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleConnecting || isGithubConnecting || loading}
                className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-emerald-500 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-white font-bold text-sm flex items-center justify-center gap-3 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isGoogleConnecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span>Google'a Yönlendiriliyor...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Google ile Devam Et</span>
                  </>
                )}
              </button>

              {/* GitHub ile Giriş */}
              <button
                type="button"
                onClick={handleGithubLogin}
                disabled={isGoogleConnecting || isGithubConnecting || loading}
                className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-emerald-500 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-white font-bold text-sm flex items-center justify-center gap-3 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isGithubConnecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span>GitHub'a Yönlendiriliyor...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      />
                    </svg>
                    <span>GitHub ile Devam Et</span>
                  </>
                )}
              </button>

            </div>

            <div className="mt-5 text-center">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Giriş yaparak Hizmet Şartları ve Gizlilik Politikası'nı kabul etmiş sayılırsınız. Temp-mail sahte hesaplar otomatik engellenir.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
