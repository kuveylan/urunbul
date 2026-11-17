"use client";

import React, { useState, useEffect, useMemo } from "react";
import Sidebar, { NavView } from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import BlackBoxView, { Product } from "@/components/BlackBoxView";
import TrendsView from "@/components/TrendsView";
import CerebroMagnetView from "@/components/CerebroMagnetView";
import StorefrontView from "@/components/StorefrontView";
import ProfitsView from "@/components/ProfitsView";
import ScribblesView from "@/components/ScribblesView";
import FrankensteinView from "@/components/FrankensteinView";
import PriceHistoryModal from "@/components/PriceHistoryModal";
import ProfitCalculatorModal from "@/components/ProfitCalculatorModal";
import ListingOptimizerModal from "@/components/ListingOptimizerModal";
import NotificationDrawer from "@/components/NotificationDrawer";
import ExtensionModal from "@/components/ExtensionModal";
import ReviewInsightsModal from "@/components/ReviewInsightsModal";
import DashboardHomeView from "@/components/DashboardHomeView";
import CrossMarketModal from "@/components/CrossMarketModal";
import LandingShowcaseView from "@/components/LandingShowcaseView";
import LegalTermsModal from "@/components/LegalTermsModal";
import BottomNavigationBar from "@/components/BottomNavigationBar";
import AdBanner from "@/components/AdBanner";
import { useAuth } from "@/context/AuthContext";
import { apiUrl, getAuthHeaders, resilientFetch } from "@/lib/api";

const VALID_VIEWS: NavView[] = [
  "dashboard",
  "blackbox",
  "trendster",
  "storefront",
  "cerebro",
  "magnet",
  "scribbles",
  "frankenstein",
  "profits",
  "watchlist",
];

export default function HomePage() {
  const { user, loading: authLoading, decrementSearchQuota, decrementKeywordQuota } = useAuth();
  const [currentView, setCurrentView] = useState<NavView>("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [legalModalTab, setLegalModalTab] = useState<"terms" | "privacy" | null>(null);

  // Zararsız URL Hash Gezinme Fonksiyonu
  const navigateToView = (view: NavView, pushHistory = true) => {
    setCurrentView(view);
    if (typeof window !== "undefined") {
      if (pushHistory) {
        window.history.pushState(null, "", `#${view}`);
      }
    }
    if (view === "watchlist") fetchTrackedProducts();
  };

  // İlk yüklemede ve tarayıcı İleri/Geri tuşlarında URL Hash senkronizasyonu
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleHashSync = () => {
      const hash = window.location.hash.replace("#", "") as NavView;
      if (VALID_VIEWS.includes(hash)) {
        setCurrentView(hash);
        if (hash === "watchlist") fetchTrackedProducts();
      }
    };

    handleHashSync();
    window.addEventListener("hashchange", handleHashSync);
    return () => window.removeEventListener("hashchange", handleHashSync);
  }, []);

  // Ürün & Pazar Durumları
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [trackedProducts, setTrackedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [totalScannedVolume, setTotalScannedVolume] = useState<number>(14850);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(412);
  const [isDeepScan, setIsDeepScan] = useState<boolean>(true);
  const [currentCategory, setCurrentCategory] = useState<string>("Tüm Kategoriler");
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>("all");
  const [scraperStats, setScraperStats] = useState<{ trendyol: number; hepsiburada: number; amazon: number; n11: number } | null>(null);

  // Kelime & Satıcı Verileri
  const [keywordData, setKeywordData] = useState<any>(null);
  const [sellerData, setSellerData] = useState<any>(null);
  const [scribblesKeywords, setScribblesKeywords] = useState<string[]>([]);

  // Modallar
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [selectedProductForReviewModal, setSelectedProductForReviewModal] = useState<Product | null>(null);
  const [crossMarketProduct, setCrossMarketProduct] = useState<Product | null>(null);
  const [calcProduct, setCalcProduct] = useState<Product | null>(null);
  const [optimizeProduct, setOptimizeProduct] = useState<Product | null>(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isOptimizerOpen, setIsOptimizerOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);

  // 1. Ürün Arama & Canlı Pazar Taraması
  const handleProductSearch = async (
    overrideQuery?: string,
    category?: string,
    page: number = 1,
    deepScan: boolean = false,
    marketplaceOverride?: string,
    forceRefresh: boolean = false
  ) => {
    const rawQ = overrideQuery !== undefined ? overrideQuery : searchQuery;
    const cat = category !== undefined ? category : currentCategory;
    const q = rawQ.trim() || (cat && cat !== "Tüm Kategoriler" ? "" : "trend");

    setLoading(true);
    setErrorMessage("");
    setCurrentPage(page);

    try {
      if (category !== undefined) setCurrentCategory(category);

      const mp = marketplaceOverride !== undefined ? marketplaceOverride : selectedMarketplace;
      if (marketplaceOverride !== undefined) setSelectedMarketplace(marketplaceOverride);

      const trimmed = q.trim();
      const isTrendyolLink = trimmed.includes("trendyol.com") || trimmed.includes("-p-") || (/^\d{6,}$/.test(trimmed) && (!cat || cat === "Tüm Kategoriler"));
      if (isTrendyolLink) {
        const param = trimmed.startsWith("http") || trimmed.includes("trendyol.com")
          ? `url=${encodeURIComponent(trimmed)}`
          : `product_id=${encodeURIComponent(trimmed)}`;
        try {
          const { data: productDetail } = await resilientFetch<Product>(
            apiUrl(`/api/v1/products/inspect?${param}`),
            { timeoutMs: 15000, retries: 1 }
          );
          if (productDetail) {
            setProducts([productDetail]);
            setTotalScannedVolume(1);
            setTotalPages(1);
            setLoading(false);
            return;
          }
        } catch (e: any) {
          console.warn("Hızlı ürün incelemesi başarısız oldu, genel aramaya geçiliyor:", e);
        }
      }

      const catParam =
        cat && cat !== "Tüm Kategoriler"
          ? `&category=${encodeURIComponent(cat)}`
          : "";
      const searchParam = q.trim() ? encodeURIComponent(q.trim()) : "fırsat";
      const deepParam = deepScan ? "&deep_scan=true" : "";
      const pageParam = `&page=${page}`;
      const mpParam = mp ? `&marketplace=${encodeURIComponent(mp)}` : "";
      const refreshParam = forceRefresh ? "&force_refresh=true" : "";

      const { data, headers } = await resilientFetch<Product[]>(
        apiUrl(`/api/v1/products/search?q=${searchParam}${catParam}${pageParam}${deepParam}${mpParam}${refreshParam}&sort_by=opportunity`),
        {
          timeoutMs: 25000,
          retries: 2,
          onColdStartNotice: (msg) => setErrorMessage(msg),
        }
      );

      // Header'lardan büyük veri istatistiklerini yakala
      const headerTotal = headers.get("X-Total-Count");
      const headerPages = headers.get("X-Total-Pages");
      const headerStats = headers.get("X-Scraper-Stats");

      if (headerTotal) setTotalScannedVolume(parseInt(headerTotal, 10));
      if (headerPages) setTotalPages(parseInt(headerPages, 10));

      if (headerStats) {
        const parsed = { trendyol: 0, hepsiburada: 0, amazon: 0, n11: 0 };
        headerStats.split(",").forEach((item) => {
          const [key, val] = item.split(":");
          const count = parseInt(val, 10) || 0;
          if (key === "ty") parsed.trendyol = count;
          if (key === "hb") parsed.hepsiburada = count;
          if (key === "az") parsed.amazon = count;
          if (key === "n11") parsed.n11 = count;
        });
        setScraperStats(parsed);
      }

      if (data && data.length > 0) {
        // page > 1 ise ürünleri mevcut listeye EKLE (append), aksi halde yenile
        if (page > 1) {
          setProducts((prev) => {
            // Duplicate önleme: external_id + marketplace kombinasyonu ile filtrele
            const existingKeys = new Set(prev.map((p) => `${p.marketplace}:${p.external_id}`));
            const newOnes = data.filter((p) => !existingKeys.has(`${p.marketplace}:${p.external_id}`));
            return [...prev, ...newOnes];
          });
        } else {
          setProducts(data);
        }
        setErrorMessage("");
      } else if (page === 1) {
        setErrorMessage("Aramanıza uygun ürün bulunamadı. Lütfen arama kelimesini veya kategoriyi değiştirerek tekrar deneyin.");
      }
      decrementSearchQuota();
    } catch (err: any) {
      console.error("Ürün arama hatası:", err);
      setErrorMessage(err.message || "Bağlantı hatası oluştu. Sunucu başlatılıyor olabilir, lütfen birkaç saniye sonra tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  // Sayfa ilk açıldığında gecikmesiz öne çıkan fırsat ürünlerini getir
  const fetchInitialProducts = async () => {
    setLoading(true);
    try {
      const { data } = await resilientFetch<Product[]>(apiUrl("/api/v1/products/featured"), {
        timeoutMs: 8000,
        retries: 1,
      });
      if (data && data.length > 0) {
        setProducts(data);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn("Öne çıkan ürünler servisten alınamadı, canlı pazar araması başlatılıyor:", e);
    }
    // Sunucu havuzunda hazır öne çıkan ürün yoksa doğrudan gerçek canlı arama yap
    await handleProductSearch("trend");
  };

  // 2. Cerebro & Magnet Kelime Analizi
  const handleKeywordSearch = async (q: string, modeOverride?: "cerebro" | "magnet") => {
    if (!q.trim()) return;
    setLoading(true);
    setErrorMessage("");
    const targetMode = modeOverride || (currentView === "cerebro" ? "cerebro" : "magnet");
    try {
      const endpoint =
        targetMode === "cerebro"
          ? apiUrl(`/api/v1/keywords/cerebro?identifier=${encodeURIComponent(q)}`)
          : apiUrl(`/api/v1/keywords/analyze?q=${encodeURIComponent(q)}`);
      
      const { data } = await resilientFetch<any>(endpoint, {
        timeoutMs: 25000,
        retries: 2,
        onColdStartNotice: (msg) => setErrorMessage(msg),
      });

      setKeywordData(data);
      decrementKeywordQuota();
    } catch (err: any) {
      setErrorMessage(err.message || "Anahtar kelime analizi sırasında bağlantı hatası oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Storefront Rakip Mağaza Analizi
  const handleSellerSearch = async (name: string) => {
    if (!name.trim()) return;
    setLoading(true);
    setErrorMessage("");
    try {
      const { data } = await resilientFetch<any>(
        apiUrl(`/api/v1/sellers/analyze?name=${encodeURIComponent(name)}`),
        { timeoutMs: 20000, retries: 1 }
      );
      setSellerData(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Rakip mağaza analizi sırasında bağlantı hatası oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Takip Listesi (Watchlist / My List)
  const fetchTrackedProducts = async () => {
    try {
      const res = await fetch(apiUrl("/api/v1/products/tracked"));
      if (res.ok) {
        const data = await res.json();
        setTrackedProducts(data);
      }
    } catch (err) {
      console.error("Takip listesi alınamadı:", err);
    }
  };

  const handleToggleTrack = async (product: Product) => {
    if (!product.id) return;
    try {
      const res = await fetch(apiUrl(`/api/v1/products/${product.id}/track`), {
        method: "POST",
      });
      if (res.ok) {
        const updated = await res.json();
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, is_tracked: updated.is_tracked } : p))
        );
        setTrackedProducts((prev) =>
          updated.is_tracked
            ? [...prev, { ...product, is_tracked: true }]
            : prev.filter((p) => p.id !== product.id)
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Yalnızca oturum açmış kullanıcılar için başlangıç verilerini çek
  useEffect(() => {
    if (user) {
      fetchTrackedProducts();
      fetchInitialProducts();
    }
  }, [user]);

  // SEO Schema.org JSON-LD
  const schemaStructuredData = useMemo(() => {
    if (products.length === 0) return null;
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.slice(0, 10).map((p, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: p.title,
          image: p.image_url || "",
          offers: {
            "@type": "Offer",
            price: p.current_price,
            priceCurrency: "TRY",
            availability: "https://schema.org/InStock",
            seller: {
              "@type": "Organization",
              name: p.seller_name || "Trendyol Satıcısı",
            },
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: p.rating,
            reviewCount: p.review_count || 1,
          },
        },
      })),
    };
  }, [products]);

  // Oturum durumu yüklenirken bekleme ekranı
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">ÜrünBul Yükleniyor...</span>
        </div>
      </div>
    );
  }

  // Giriş yapmamış anonim ziyaretçiler için Tanıtım (Showcase) Sayfası
  if (!user) {
    return <LandingShowcaseView />;
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900 transition-colors">
      {/* SEO Schema Script */}
      {schemaStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaStructuredData) }}
        />
      )}

      {/* Sol Menü Ağacı (Sidebar / Mobilde Açılır Yan Çekmece) */}
      <Sidebar
        currentView={currentView}
        onSelectView={(v) => {
          navigateToView(v);
          setIsMobileMenuOpen(false);
        }}
        trackedCount={trackedProducts.length}
        unreadAlertCount={2}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Ana Çalışma Alanı */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-[#070b14] overflow-hidden transition-colors">
        {/* Üst Header Bar */}
        <TopBar
          currentView={currentView}
          selectedMarketplace={selectedMarketplace}
          onMarketplaceChange={(mp) => {
            setSelectedMarketplace(mp);
            handleProductSearch(searchQuery, currentCategory, 1, isDeepScan, mp);
          }}
          onNavigate={(v) => {
            navigateToView(v);
            setIsMobileMenuOpen(false);
          }}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenNotifications={() => setIsNotificationOpen(true)}
          onOpenCalculator={() => navigateToView("profits")}
          onOpenOptimizer={() => setIsOptimizerOpen(true)}
          onOpenExtensionModal={() => setIsExtensionModalOpen(true)}
          onOpenLegal={(tab) => setLegalModalTab(tab || "terms")}
          unreadCount={2}
        />

        {/* Dinamik Görünüm İçeriği (Mobilde alt bar payı için pb-24) */}
        <main className="flex-1 p-3 sm:p-6 pb-24 md:pb-6 overflow-y-auto scrollbar-thin">
          <div className="max-w-7xl mx-auto">
            {/* Üst Sponsor / Reklam Bannerı */}
            <AdBanner slot="top_leaderboard" className="mb-4" />
            {/* 0. Kontrol Paneli (Ana Sayfa) */}
            {currentView === "dashboard" && (
              <DashboardHomeView
                onSelectView={(v) => navigateToView(v)}
                onSearch={(q) => {
                  setSearchQuery(q);
                  handleProductSearch(q);
                }}
                onOpenProfitCalculator={(p) => {
                  setCalcProduct(p || null);
                  setIsCalculatorOpen(true);
                }}
                onToggleTrack={handleToggleTrack}
                trackedCount={trackedProducts.length}
              />
            )}

            {/* 1. Black Box (Ürün Keşfi) */}
            {currentView === "blackbox" && (
              <BlackBoxView
                products={products}
                loading={loading}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedMarketplace={selectedMarketplace}
                onSearch={(q, cat, forceRefresh) => handleProductSearch(q, cat, 1, isDeepScan, selectedMarketplace, forceRefresh)}
                onToggleTrack={handleToggleTrack}
                onOpenPriceModal={(p) => setSelectedProductForModal(p)}
                onOpenProfitModal={(p) => setCalcProduct(p)}
                onOpenOptimizerModal={(p) => setOptimizeProduct(p)}
                onOpenReviewModal={(p) => setSelectedProductForReviewModal(p)}
                onOpenCrossMarketModal={(p) => setCrossMarketProduct(p)}
                errorMessage={errorMessage}
                totalScannedVolume={totalScannedVolume}
                currentPage={currentPage}
                totalPages={totalPages}
                isDeepScan={isDeepScan}
                scraperStats={scraperStats}
                onPageChange={(pNum) => handleProductSearch(searchQuery, currentCategory, pNum, isDeepScan, selectedMarketplace)}
                onToggleDeepScan={(active) => {
                  setIsDeepScan(active);
                  handleProductSearch(searchQuery, currentCategory, 1, active, selectedMarketplace);
                }}
              />
            )}

            {/* 2. Fiyat & Talep Trendleri (Trend Analiz Görünümü) */}
            {currentView === "trendster" && (
              <TrendsView
                products={products}
                onOpenPriceModal={(p) => setSelectedProductForModal(p)}
                onOpenProfitModal={(p) => setCalcProduct(p)}
                onToggleTrack={handleToggleTrack}
              />
            )}

            {/* 3. Cerebro & Magnet (Anahtar Kelime Zekası) */}
            {(currentView === "cerebro" || currentView === "magnet") && (
              <CerebroMagnetView
                mode={currentView === "cerebro" ? "cerebro" : "magnet"}
                keywordData={keywordData}
                loading={loading}
                onSearch={(q) => handleKeywordSearch(q)}
                onSwitchMode={(newMode) => {
                  navigateToView(newMode);
                  const q = keywordData?.identifier || keywordData?.query || searchQuery;
                  if (q) handleKeywordSearch(q, newMode);
                }}
                onExportToScribbles={(kws) => {
                  setScribblesKeywords(kws);
                  navigateToView("scribbles");
                }}
                errorMessage={errorMessage}
              />
            )}

            {/* 4. Storefront (Rakip Mağaza Ciro Analizi) */}
            {currentView === "storefront" && (
              <StorefrontView
                sellerData={sellerData}
                loading={loading}
                onSearch={handleSellerSearch}
                onOpenProfitModal={(p) => setCalcProduct(p)}
                onOpenPriceModal={(p) => setSelectedProductForModal(p)}
                onOpenOptimizerModal={(p) => setOptimizeProduct(p)}
                errorMessage={errorMessage}
              />
            )}

            {/* 5. Profits (Kâr & Komisyon Paneli) */}
            {currentView === "profits" && <ProfitsView />}

            {/* 6. Scribbles (SEO & Başlık Builder) & Frankenstein */}
            {currentView === "scribbles" && <ScribblesView initialKeywords={scribblesKeywords} />}
            {currentView === "frankenstein" && <FrankensteinView />}

            {/* 7. Watchlist (Takip Listem / My List) */}
            {currentView === "watchlist" && (
              <div className="space-y-4">
                <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-black text-white">Ürün & Fiyat Takip Listem</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Fiyat ve stok hareketlerini izlemek için eklediğiniz ürünler ({trackedProducts.length} Adet).
                    </p>
                  </div>
                </div>
                <BlackBoxView
                  products={trackedProducts}
                  loading={false}
                  searchQuery=""
                  setSearchQuery={() => {}}
                  onSearch={() => {}}
                  onToggleTrack={handleToggleTrack}
                  onOpenPriceModal={(p) => setSelectedProductForModal(p)}
                  onOpenProfitModal={(p) => setCalcProduct(p)}
                  onOpenOptimizerModal={(p) => setOptimizeProduct(p)}
                  onOpenReviewModal={(p) => setSelectedProductForReviewModal(p)}
                  onOpenCrossMarketModal={(p) => setCrossMarketProduct(p)}
                />
              </div>
            )}
          </div>
        </main>

        {/* Sabit Mobil Alt Gezinme Barı (Bottom Navigation) */}
        <BottomNavigationBar
          currentView={currentView}
          onSelectView={(v) => {
            navigateToView(v);
            setIsMobileMenuOpen(false);
          }}
          onOpenMenuDrawer={() => setIsMobileMenuOpen(true)}
          trackedCount={trackedProducts.length}
        />
      </div>

      {/* Modallar */}
      {selectedProductForModal && (
        <PriceHistoryModal
          product={selectedProductForModal}
          onClose={() => setSelectedProductForModal(null)}
        />
      )}

      {(calcProduct || isCalculatorOpen) && (
        <ProfitCalculatorModal
          initialPrice={calcProduct ? calcProduct.current_price : 1000}
          productTitle={calcProduct ? calcProduct.title : "Genel Ürün Kâr & Komisyon Analizi"}
          onClose={() => {
            setCalcProduct(null);
            setIsCalculatorOpen(false);
          }}
        />
      )}

      {(isOptimizerOpen || optimizeProduct) && (
        <ListingOptimizerModal
          initialTitle={optimizeProduct ? optimizeProduct.title : ""}
          initialBrand={optimizeProduct ? optimizeProduct.brand : ""}
          onClose={() => {
            setIsOptimizerOpen(false);
            setOptimizeProduct(null);
          }}
        />
      )}

      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      <ExtensionModal
        isOpen={isExtensionModalOpen}
        onClose={() => setIsExtensionModalOpen(false)}
      />

      {selectedProductForReviewModal && (
        <ReviewInsightsModal
          product={selectedProductForReviewModal}
          onClose={() => setSelectedProductForReviewModal(null)}
        />
      )}

      {crossMarketProduct && (
        <CrossMarketModal
          product={crossMarketProduct}
          onClose={() => setCrossMarketProduct(null)}
        />
      )}

      {/* Hukuki Hizmet Şartları & Gizlilik Politikası Modalı */}
      <LegalTermsModal
        isOpen={!!legalModalTab}
        initialTab={legalModalTab || "terms"}
        onClose={() => setLegalModalTab(null)}
      />
    </div>
  );
}
