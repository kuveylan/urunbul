import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";


export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "ÜrünBul – E-Ticaret Pazar Zekası & Akıllı Fiyat Karşılaştırma",
  description:
    "Türkiye pazaryerleri (Trendyol, Hepsiburada, N11, Amazon TR) için yeni nesil e-ticaret satıcı analitiği, pazar istihbaratı ve en uygun fiyat karşılaştırma platformu.",
  keywords: [
    "ürünbul",
    "trendyol satıcı analizi",
    "fiyat karşılaştırma",
    "pazar yeri analizi",
    "fiyat geçmişi",
    "fiyat trendleri",
    "e-ticaret ürün bulma",
    "ne satılır",
    "trendyol komisyon hesaplama",
  ],
  authors: [{ name: "ÜrünBul Teknoloji" }],
  openGraph: {
    title: "ÜrünBul – Türkiye Pazaryerleri Satıcı Analizi & Akıllı Fiyat Karşılaştırma",
    description:
      "Gerçek zamanlı pazar verileri, tahmini ciro/satış analizleri ve en ucuz satıcı teklif karşılaştırması tek platformda.",
    url: "https://urunbul.me",
    siteName: "ÜrünBul",
    locale: "tr_TR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "ÜrünBul",
    "url": "https://urunbul.app",
    "description":
      "Türkiye e-ticaret pazaryerleri için pazar analitiği ve tüketici fiyat karşılaştırma platformu.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "TRY",
    },
  };

  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('urunbul_theme');
                  var useDark = saved ? saved === 'dark' : true;
                  if (useDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[#fcfcfd] text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
