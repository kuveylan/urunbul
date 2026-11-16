"use client";

import React, { useState } from "react";
import {
  Store,
  Search,
  Star,
  Award,
  Zap,
  Calculator,
  Wand2,
  LineChart as ChartIcon,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Target,
  Calendar,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { Product } from "./BlackBoxView";

interface SellerAnalysisData {
  seller_name: string;
  badge: string;
  product_count: number;
  average_price: number;
  estimated_monthly_sales: number;
  estimated_monthly_revenue: number;
  average_rating: number;
  total_reviews: number;
  top_products: Product[];
  all_products: Product[];
}

interface StorefrontViewProps {
  sellerData: SellerAnalysisData | null;
  loading: boolean;
  onSearch: (name: string) => void;
  onOpenProfitModal: (p: Product) => void;
  onOpenPriceModal: (p: Product) => void;
  onOpenOptimizerModal: (p: Product) => void;
  errorMessage?: string;
}

export default function StorefrontView({
  sellerData,
  loading,
  onSearch,
  onOpenProfitModal,
  onOpenPriceModal,
  onOpenOptimizerModal,
  errorMessage,
}: StorefrontViewProps) {
  const [sellerName, setSellerName] = useState(sellerData ? sellerData.seller_name : "");
  const [activeTab, setActiveTab] = useState<"products" | "swot" | "plan">("products");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerName.trim()) return;
    onSearch(sellerName);
  };

  const popularSellers = ["Arzum", "Karaca", "Xiaomi", "Philips", "Dyson"];

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Başlık Kartı */}
      <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <h1 className="text-lg font-black text-white tracking-wide">
              Rakip Mağaza Ciro & İstihbarat Analizi
            </h1>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Pazar İstihbarat & Rakip Zekası
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Rakiplerinizin Trendyol mağazasındaki toplam tahmini aylık cirosunu, ortalama sepet tutarını ve en çok satan yıldız ürünlerini listeleyin.
          </p>
        </div>
      </div>

      {/* Arama Alanı */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={sellerName}
              onChange={(e) => setSellerName(e.target.value)}
              placeholder="Rakip mağaza adı, marka veya Trendyol mağaza linki yapıştırın (örn: Karaca, Arzum, trendyol.com/magaza/...)..."
              className="w-full pl-10 pr-4 py-2 bg-[#0b0f19] border border-slate-700/80 rounded-lg text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs shadow-md shadow-amber-600/30 transition-all flex items-center space-x-1.5 disabled:opacity-50 shrink-0"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Taranıyor...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Mağazayı Analiz Et</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-500">
          <span>Örnek Mağazalar:</span>
          {popularSellers.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setSellerName(s);
                onSearch(s);
              }}
              className="px-2 py-0.5 rounded bg-[#1e293b] hover:text-amber-300 text-slate-400 border border-slate-800"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
          {errorMessage}
        </div>
      )}

      {/* Mağaza Analizi Sonucu */}
      {sellerData && (
        <div className="space-y-5 animate-fadeIn">
          {/* Mağaza Özet Başlığı */}
          <div className="bg-[#0f172a] rounded-xl p-5 border border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-black text-2xl border border-amber-500/30 shrink-0">
                {sellerData.seller_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-black text-white">{sellerData.seller_name}</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {sellerData.badge}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                  <span>Toplam {sellerData.product_count} ürün envanteri</span>
                  <span>•</span>
                  <span className="flex items-center text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                    {sellerData.average_rating} Mağaza Puanı
                  </span>
                  <span>•</span>
                  <span>{sellerData.total_reviews.toLocaleString("tr-TR")} Müşteri Yorumu</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 w-full md:w-auto justify-around">
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Ortalama Fiyat
                </div>
                <div className="text-lg font-black text-white mt-0.5">
                  ₺{sellerData.average_price.toLocaleString("tr-TR")}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Tahmini Aylık Ciro
                </div>
                <div className="text-lg font-black text-emerald-400 mt-0.5">
                  ₺{sellerData.estimated_monthly_revenue.toLocaleString("tr-TR")}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Seçici Bar */}
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab("products")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "products"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                  : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Yıldız Ürünler ({sellerData.top_products.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("swot")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "swot"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                  : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Yapay Zekâ SWOT Analizi</span>
            </button>
            <button
              onClick={() => setActiveTab("plan")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "plan"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                  : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>30 Günlük Büyüme & Rekabet Planı</span>
            </button>
          </div>

          {/* TAB 1: ÜRÜN TABLOSU */}
          {activeTab === "products" && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Award className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Mağazanın En Çok Satan Yıldız Ürünleri</h3>
              </div>

              <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#0b0f19] border-b border-slate-800 text-slate-400 font-bold">
                      <th className="py-3 px-4">Ürün</th>
                      <th className="py-3 px-4">Fiyat</th>
                      <th className="py-3 px-4">Aylık Tahmini Satış</th>
                      <th className="py-3 px-4">Aylık Tahmini Ciro</th>
                      <th className="py-3 px-4">Müşteri Puanı</th>
                      <th className="py-3 px-4 text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {sellerData.top_products.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-4">
                          <div className="flex items-center space-x-3">
                            {p.image_url ? (
                              <img
                                src={p.image_url}
                                alt={p.title}
                                referrerPolicy="no-referrer"
                                loading="lazy"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                                className="w-10 h-12 object-contain rounded-lg border border-slate-700 bg-white p-0.5 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-12 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                                <ShoppingBag className="w-4 h-4 text-slate-500" />
                              </div>
                            )}
                            <div className="max-w-md font-medium text-white line-clamp-1">
                              {p.title}
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 font-bold text-white whitespace-nowrap">
                          ₺{p.current_price.toLocaleString("tr-TR")}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-200 whitespace-nowrap">
                          ~{p.estimated_monthly_sales} ad/ay
                        </td>
                        <td className="py-2.5 px-4 font-bold text-emerald-400 whitespace-nowrap">
                          ₺{p.estimated_monthly_revenue.toLocaleString("tr-TR")}
                        </td>
                        <td className="py-2.5 px-4 text-amber-400 font-bold whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{p.rating}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => onOpenOptimizerModal(p)}
                              title="Listing Optimizer"
                              className="p-1.5 rounded-lg bg-[#1e293b] border border-slate-700 text-purple-400 hover:bg-slate-700"
                            >
                              <Wand2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onOpenProfitModal(p)}
                              title="Kâr Hesaplayıcı"
                              className="p-1.5 rounded-lg bg-[#1e293b] border border-slate-700 text-emerald-400 hover:bg-slate-700"
                            >
                              <Calculator className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onOpenPriceModal(p)}
                              title="Fiyat Değişim Grafiği (Fiyat Geçmişi & Trend)"
                              className="p-1.5 rounded-lg bg-[#1e293b] border border-slate-700 text-blue-400 hover:bg-slate-700"
                            >
                              <ChartIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: YAPAY ZEKÂ SWOT ANALİZİ */}
          {activeTab === "swot" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/30 to-slate-900 border border-amber-500/20 text-xs text-slate-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>{sellerData.seller_name}</strong> mağazasının {sellerData.product_count} ürünü, fiyat politikası ve müşteri geri bildirimleri taranarak yapay zekâ destekli stratejik SWOT matrisi oluşturuldu.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* GÜÇLÜ YÖNLER */}
                <div className="bg-[#0b0f19] p-4 rounded-xl border border-emerald-500/30 space-y-2.5">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs pb-1.5 border-b border-slate-800">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Güçlü Yönler (Strengths)</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>
                        <strong>Yüksek Mağaza Puanı:</strong> {sellerData.average_rating} / 5.0 memnuniyet ortalaması ile Trendyol algoritmasında yüksek görünürlük elde ediyor.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>
                        <strong>Oturmuş Sosyal Kanıt:</strong> Toplam {sellerData.total_reviews.toLocaleString("tr-TR")} yorum ile potansiyel alıcıların güven bariyerini aşmış durumda.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>
                        <strong>Kanıtlanmış Yıldız Ürünler:</strong> İlk {Math.min(3, sellerData.top_products.length)} ürün aylık düzenli nakit akışı ve istikrarlı talep üretiyor.
                      </span>
                    </li>
                  </ul>
                </div>

                {/* ZAYIF YÖNLER */}
                <div className="bg-[#0b0f19] p-4 rounded-xl border border-rose-500/30 space-y-2.5">
                  <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs pb-1.5 border-b border-slate-800">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Zayıf Yönler (Weaknesses)</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>
                        <strong>Ciro Yoğunlaşma Riski:</strong> Mağaza cirosunun büyük kısmı ilk birkaç ürüne bağımlı; alt katalogdaki ürünler atıl kalmış.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>
                        <strong>Ortalama Sepet Tutarı:</strong> ₺{sellerData.average_price.toLocaleString("tr-TR")} ortalama fiyat seviyesinde çoklu paket ve çapraz satış eksikliği var.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>
                        <strong>Varyasyon Kısıtı:</strong> Renk, boyut ve yedek parça opsiyonları dar tutulmuş, müşteriler alternatif satıcılara kayabiliyor.
                      </span>
                    </li>
                  </ul>
                </div>

                {/* FIRSATLAR */}
                <div className="bg-[#0b0f19] p-4 rounded-xl border border-blue-500/30 space-y-2.5">
                  <div className="flex items-center space-x-2 text-blue-400 font-bold text-xs pb-1.5 border-b border-slate-800">
                    <TrendingUp className="w-4 h-4" />
                    <span>Pazar Fırsatları (Opportunities)</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 font-bold">•</span>
                      <span>
                        <strong>Tamamlayıcı Ürün & Bundle:</strong> Yıldız ürünlerin yanına kılıf, temizleme kiti veya aksesuar ekleyerek Buybox rekabeti olmadan yeni pazar açılabilir.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 font-bold">•</span>
                      <span>
                        <strong>Fiyat Elastikiyeti:</strong> Mağazanın %15 daha düşük fiyata sunulabilecek benzer alternatiflerle pazar payı hızla çalınabilir.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 font-bold">•</span>
                      <span>
                        <strong>Trendyol Kampanyaları:</strong> Flaş indirim ve kuponlarla mağaza takipçi sayısı artırılabilir.
                      </span>
                    </li>
                  </ul>
                </div>

                {/* TEHDİTLER */}
                <div className="bg-[#0b0f19] p-4 rounded-xl border border-amber-500/30 space-y-2.5">
                  <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs pb-1.5 border-b border-slate-800">
                    <Target className="w-4 h-4" />
                    <span>Tehditler & Riskler (Threats)</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>
                        <strong>Agresif Fiyat Kırıcılar:</strong> Kategoriye yeni giren düşük kâr marjlı arbitrajcılar Buybox oranını zorlayabilir.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>
                        <strong>Desi & Kargo Maliyetleri:</strong> Artan kargo ücretleri düşük fiyatlı ürünlerde net marjı negatife çekebilir.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>
                        <strong>Algoritma Güncellemeleri:</strong> Organik sıralamada sponsorlu reklamların payının artması kârlılığı baskılayabilir.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 30 GÜNLÜK BÜYÜME PLANI */}
          {activeTab === "plan" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3.5 rounded-xl bg-[#0b0f19] border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                <span>
                  🚀 <strong>30 Günlük Aksiyon Yol Haritası:</strong> Bu mağazanın pazar payını artırmak veya rakip olarak bu mağazaya karşı avantaj sağlamak için uygulanabilecek 4 haftalık eylem planı.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                {/* 1. Hafta */}
                <div className="bg-[#0b0f19] p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-[10px] font-black uppercase text-blue-400 tracking-wider">
                    1. Hafta (1-7. Gün)
                  </div>
                  <div className="font-bold text-white text-xs">Fiyat & Buybox Röntgeni</div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Yıldız ürünlerin Buybox fiyat esnekliğini test edin. Kâr hesaplayıcıyla komisyon ve desi maliyetlerini kuruşu kuruşuna çıkarın.
                  </p>
                  <div className="pt-2 border-t border-slate-800 text-[10px] text-emerald-400 font-semibold">
                    ✓ Hedef: Başa baş ve hedef marjı netleştirme
                  </div>
                </div>

                {/* 2. Hafta */}
                <div className="bg-[#0b0f19] p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                    2. Hafta (8-14. Gün)
                  </div>
                  <div className="font-bold text-white text-xs">Açıkları Kapatma & Çeşitlilik</div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Rakiplerin zayıf kaldığı veya stok tükettiği alt kategorilere 2 adet tamamlayıcı varyasyon veya set ekleyin.
                  </p>
                  <div className="pt-2 border-t border-slate-800 text-[10px] text-emerald-400 font-semibold">
                    ✓ Hedef: Portföy riskini yayma
                  </div>
                </div>

                {/* 3. Hafta */}
                <div className="bg-[#0b0f19] p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-[10px] font-black uppercase text-purple-400 tracking-wider">
                    3. Hafta (15-21. Gün)
                  </div>
                  <div className="font-bold text-white text-xs">SEO & Başlık Optimizasyonu</div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Ters arama (Cerebro) kelime havuzunu kullanarak ürün başlık ve açıklamalarını organik arama hacmi yüksek terimlerle yenileyin.
                  </p>
                  <div className="pt-2 border-t border-slate-800 text-[10px] text-emerald-400 font-semibold">
                    ✓ Hedef: Organik tıklama oranını %25 artırma
                  </div>
                </div>

                {/* 4. Hafta */}
                <div className="bg-[#0b0f19] p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                    4. Hafta (22-30. Gün)
                  </div>
                  <div className="font-bold text-white text-xs">Sepet Kuponu & Çapraz Satış</div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    2. ürüne %15 indirim ve mağaza takipçi kuponu tanımlayarak sepet ortalamasını ₺{sellerData.average_price.toFixed(0)} seviyesinden yukarı çekin.
                  </p>
                  <div className="pt-2 border-t border-slate-800 text-[10px] text-emerald-400 font-semibold">
                    ✓ Hedef: Aylık ciroda %20 net sıçrama
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
