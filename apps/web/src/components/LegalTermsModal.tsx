"use client";

import React, { useState } from "react";
import { X, ShieldCheck, FileText, Lock, Mail, Scale } from "lucide-react";
import AppBrandLogo from "./AppBrandLogo";

interface LegalTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "terms" | "privacy";
}

export default function LegalTermsModal({
  isOpen,
  onClose,
  initialTab = "terms",
}: LegalTermsModalProps) {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-white dark:bg-[#0f172a] border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {/* Mobil Çekmece Göstergesi (Drag Handle) */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-2.5 sm:hidden" />

        {/* Üst Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <AppBrandLogo size="sm" showText={false} />
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Hukuki Bilgilendirme & Kullanıcı Hakları</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Resmi Metin
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Son Güncelleme: 16 Kasım 2026 | urunbul.me
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sekme Seçici */}
        <div className="px-6 pt-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 shrink-0 bg-white dark:bg-[#0f172a]">
          <button
            type="button"
            onClick={() => setActiveTab("terms")}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === "terms"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Kullanım ve Hizmet Şartları</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("privacy")}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === "privacy"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Gizlilik ve KVKK Politikası</span>
          </button>
        </div>

        {/* İçerik Alanı (Kaydırılabilir) */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed scrollbar-thin">
          {activeTab === "terms" ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-200 text-xs font-medium">
                <strong>Özet Önemli Beyan:</strong> ÜrünBul, e-ticaret satıcıları için kamuya açık pazar verilerini istatistiki amaçlarla derleyen bağımsız bir pazar analitiği yazılımıdır. Sitedeki tahmin ve skorlar garanti kazanç veya yatırım tavsiyesi niteliğinde olmayıp, ticari kararlar kullanıcının kendi sorumluluğundadır.
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                  1. Taraflar ve Sözleşmenin Kabulü
                </h4>
                <p>
                  Bu Hizmet ve Kullanım Şartları ("Sözleşme"), <strong>urunbul.me</strong> alan adı üzerinden erişilen "ÜrünBul" platformunu kullanan, Google veya GitHub OAuth yöntemiyle üye olan veya platformu ziyaret eden tüm gerçek ve tüzel kişiler ("Kullanıcı") ile ÜrünBul platform yönetimi arasında yürürlüğe girer. Platforma giriş yapan her kullanıcı bu şartları peşinen kabul etmiş sayılır.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                  2. Hizmetin Niteliği ve Bağımsızlık Beyanı
                </h4>
                <p>
                  ÜrünBul; Trendyol, Hepsiburada, Amazon Türkiye, N11 ve diğer pazaryerlerinin kamuya açık web kataloglarında yer alan ürün bilgilerini, fiyat değişimlerini ve pazar dinamiklerini analitik yöntemlerle inceleyerek özet istatistikler sunar.
                </p>
                <p className="mt-1 font-semibold text-slate-800 dark:text-slate-200">
                  ÜrünBul'un adı geçen pazaryerleri ile herhangi bir organik, yasal, idari, bayilik veya resmi sponsorluk bağı kesinlikle bulunmamaktadır. Platformda adı geçen tüm ticari markalar, logolar ve tescilli isimler münhasıran ilgili şirketlerin mülkiyetindedir ve sadece referans/tanımlama amacıyla kullanılmıştır.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                  3. Yatırım ve Ticari Tavsiye Niteliğinde Olmama (Sorumluluk Reddi)
                </h4>
                <p>
                  ÜrünBul tarafından sunulan tahmini satış hacimleri, fırsat skorları, kâr marjı simülasyonları ve kelime hacimleri yapay zeka ve istatistiki tahmin modellerine dayanmaktadır. Hiçbir veri kesin kâr garantisi, minimum gelir taahhüdü veya doğrudan ticari tavsiye teşkil etmez.
                </p>
                <p className="mt-1">
                  Kullanıcının platformdaki analizlere dayanarak gerçekleştirdiği ürün alımları, stok yatırımları, fiyatlandırma, vergi/komisyon hesaplamaları veya ticari girişimlerden doğabilecek kâr veya zararlardan münhasıran Kullanıcı sorumludur. ÜrünBul ve yöneticileri hiçbir maddi veya manevi zarardan dolayı sorumlu tutulamaz.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                  4. Adil Kullanım ve Sistem Bütünlüğünün Korunması
                </h4>
                <p>
                  Kullanıcılara adil ve kaliteli hizmet sunabilmek adına günlük 200 arama ve 50 kelime analizi kotası tahsis edilmiştir. ÜrünBul altyapısının botlar, otomatik veri kazıyıcılar (web scrapers), örümcekler (crawlers) veya aşırı istek gönderen scriptler ile taranması, platformun tersine mühendisliğe tabi tutulması veya sunucu kaynaklarını kasti olarak tüketen eylemlerde bulunulması kesinlikle yasaktır.
                </p>
                <p className="mt-1">
                  Kurallara aykırı hareket ettiği tespit edilen hesaplar bildirim yapılmaksızın kalıcı olarak askıya alınabilir ve hukuki yollara başvurulabilir.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                  5. Hizmet Sürekliliği ve Değişiklik Hakkı
                </h4>
                <p>
                  ÜrünBul, reklam destekli ücretsiz modelle sunulmakta olup platformun kesintisiz, hatasız veya sıfır gecikmeli çalışacağı yönünde mutlak garanti vermez. Bakım, güncelleme veya kaynak tahsisine bağlı olarak özelliklerde veya kotalarda dilediği zaman değişiklik yapma hakkını saklı tutar.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                  6. İletişim ve Yetkili Mahkeme
                </h4>
                <p>
                  Hizmet şartlarına ilişkin soru, öneri veya yasal bildirimleriniz için <a href="mailto:hukuk@urunbul.me" className="text-emerald-600 dark:text-emerald-400 font-bold underline">hukuk@urunbul.me</a> adresi üzerinden iletişime geçebilirsiniz. Bu sözleşmeden doğacak uyuşmazlıklarda Türkiye Cumhuriyeti Mahkemeleri ve İcra Daireleri yetkilidir.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200 text-xs font-medium">
                <strong>Gizlilik Taahhüdümüz:</strong> ÜrünBul, kullanıcı gizliliğine ve 6698 sayılı KVKK standartlarına tam uyum sağlar. Şifrenizi asla kaydetmeyiz, kredi kartı bilgisi toplamayız ve profil verilerinizi hiçbir üçüncü şahsa veya reklam şirketine satmayız.
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                  1. Veri Sorumlusu ve Toplanan Veriler
                </h4>
                <p>
                  ÜrünBul, yalnızca güvenli OAuth 2.0 (Google ve GitHub) protokolleri aracılığıyla oturum açılmasını destekler. Bu süreçte kullanıcının şifresi hiçbir şekilde sunucularımıza ulaşmaz. Yalnızca aşağıdaki asgari veriler işlenir:
                </p>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-600 dark:text-slate-400">
                  <li><strong>Kimlik ve Profil Bilgisi:</strong> Ad, Soyad ve varsa genel profil fotoğrafı (Kullanıcıyı sistemde karşılamak ve profili göstermek amacıyla).</li>
                  <li><strong>İletişim Bilgisi:</strong> E-posta adresi (Tekil hesap oluşturmak ve günlük kullanım kotalarını tanımlamak amacıyla).</li>
                  <li><strong>Kullanım & Sayaç Verisi:</strong> Günlük kalan ürün arama ve kelime analizi sayaçları.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                  2. Verilerin İşlenme Amacı ve Aktarılmama Güvencesi
                </h4>
                <p>
                  Toplanan veriler yalnızca Kullanıcının sisteme güvenli giriş yapabilmesi, günlük kota sınırlarının doğru hesaplanması ve sistem kötüye kullanımlarının (botların) engellenmesi amacıyla işlenir.
                </p>
                <p className="mt-1 font-semibold text-slate-800 dark:text-slate-200">
                  Kişisel verileriniz hiçbir surette üçüncü taraf veri simsarlarına, ticari reklam ağlarına veya pazarlama şirketlerine devredilmez, kiralanmaz ve satılmaz.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                  3. Çerezler (Cookies) ve Yerel Depolama
                </h4>
                <p>
                  Platform, yalnızca kullanıcının oturumunun korunması (JWT Access Token) ve arayüz tema tercihi (Aydınlık / Karanlık Mod) için gerekli teknik çerezleri ve tarayıcı yerel depolama (`localStorage`) birimlerini kullanır. Takip amaçlı üçüncü taraf çerezler kullanılmaz.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                  4. Kullanıcı Hakları ve Veri Silme (KVKK Madde 11)
                </h4>
                <p>
                  Her kullanıcı, 6698 sayılı Kanun uyarınca tarafımıza başvurarak hesabının, geçmiş oturumlarının ve kendisine ait verilerin veritabanından kalıcı olarak silinmesini talep etme hakkına sahiptir.
                </p>
                <p className="mt-1">
                  Hesabınızı ve verilerinizi silmek için kayıtlı e-posta adresinizden <a href="mailto:hukuk@urunbul.me?subject=Hesap%20ve%20Veri%20Silme%20Talebi" className="text-emerald-600 dark:text-emerald-400 font-bold underline">hukuk@urunbul.me</a> adresine talepte bulunmanız yeterlidir. Talepler azami 48 saat içinde işleme alınır.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                  5. Veri Güvenliği
                </h4>
                <p>
                  Tüm veri iletimleri uçtan uca TLS/HTTPS şifrelemesi ile korunur. Kimlik doğrulama tokenları RFC 7519 uyumlu HS256 kriptografik imzalar ile güvence altına alınmıştır.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Alt Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Kullanıcı Güvenliği & Hukuki Koruma Güvencesi</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs transition cursor-pointer"
          >
            Anladım & Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
