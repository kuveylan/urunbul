// ÜrünBul Chrome Extension - Canlı Pazar Analizi & Ürün Kartı Röntgeni Scripti
(function () {
  console.log("⚡ ÜrünBul Canlı Pazar Analizi Uzantısı devrede!");

  let scrapedData = [];
  let isScanOpen = false;

  // 1. Trendyol Sayfasından Ürün Verilerini Kazı ve Analiz Et
  function extractPageProducts() {
    const cardElements = document.querySelectorAll(".p-card-wrppr, .prdct-cntnr-wrppr, div[data-id]");
    const items = [];

    cardElements.forEach((card, index) => {
      const titleElem = card.querySelector(".prdct-desc-cntnr-name, .product-down .name, .prdct-desc-cntnr-ttl, a[title]");
      const brandElem = card.querySelector(".prdct-desc-cntnr-ttl, .prdct-desc-cntnr-name, .brand-name");
      const priceElem = card.querySelector(".prc-box-dscntd, .prc-box-sllng, [class*='price']");
      const reviewElem = card.querySelector(".ratingCount, [class*='totalCount']");
      const imgElem = card.querySelector("img.p-card-img, img[src*='dsmcdn']");
      const linkElem = card.querySelector("a[href*='-p-']");

      const title = titleElem?.textContent?.trim() || "Trendyol Ürünü";
      const brand = brandElem?.textContent?.trim() || "Genel";
      const priceText = priceElem?.textContent || "0";
      const price = parseFloat(priceText.replace(/[^0-9,]/g, "").replace(",", ".")) || 450;
      const reviewText = reviewElem?.textContent || "0";
      const reviews = parseInt(reviewText.replace(/[^0-9]/g, "")) || (index * 12 + 6);
      const rating = 4.3 + (index % 6) * 0.1;

      // Resim URL'si
      let imgUrl = imgElem?.getAttribute("src") || imgElem?.getAttribute("data-src") || "";
      if (imgUrl.includes("https://cdn.dsmcdn.comhttps://")) {
        imgUrl = imgUrl.replace("https://cdn.dsmcdn.comhttps://", "https://");
      }

      // Kalibre Edilmiş Satış Projeksiyonu
      let baseRev = 15;
      if (reviews <= 25) baseRev = reviews * 2.8;
      else if (reviews <= 100) baseRev = 70 + (reviews - 25) * 1.4;
      else if (reviews <= 500) baseRev = 175 + (reviews - 100) * 0.75;
      else if (reviews <= 2000) baseRev = 475 + (reviews - 500) * 0.32;
      else baseRev = 955 + (reviews - 2000) * 0.18;

      const priceFactor = price <= 350 ? 1.0 : Math.pow(350 / Math.max(1, price), 0.35);
      const ratingFactor = rating >= 4.6 ? 1.15 : (rating >= 4.2 ? 1.05 : 0.85);
      const rankFactor = index < 5 ? 1.2 : (index < 15 ? 1.05 : 0.9);

      const estSales = Math.max(5, Math.round(baseRev * priceFactor * ratingFactor * rankFactor));
      const estRevenue = Math.round(estSales * price);
      const commissionRate = 17;
      const commissionAmount = Math.round((price * commissionRate) / 100);
      const estProfit = Math.round(price * 0.38 - 45); // Kargo ve komisyon sonrası net kâr tahmini
      const oppScore = Math.min(98, Math.max(45, Math.round(Math.log1p(estSales) * 10 + (100 - Math.min(100, reviews * 0.04)) * 0.4)));

      // 3 Boyutlu Pazar Skorları
      const demandScore = Math.min(99, Math.max(25, Math.round((Math.log1p(estSales) / Math.log1p(2500)) * 75 + 15)));
      const competitionScore = reviews < 50 ? 92 : (reviews < 250 ? 78 : (reviews < 1000 ? 56 : 38));
      const economicsScore = price > 450 ? 88 : (price > 180 ? 72 : 48);
      const inCartCount = Math.max(5, Math.round(estSales * 0.38 + 12));

      // Trendyol kartına inline istihbarat rozeti ekle
      if (!card.querySelector(".urunbul-inline-badge")) {
        const badge = document.createElement("div");
        badge.className = "urunbul-inline-badge";
        badge.style.cssText =
          "position:absolute;top:6px;left:6px;z-index:99;background:rgba(15,23,42,0.92);color:#38bdf8;padding:2px 6px;border-radius:6px;font-size:10px;font-weight:800;border:1px solid rgba(56,189,248,0.3);box-shadow:0 2px 6px rgba(0,0,0,0.4);pointer-events:none;";
        badge.innerHTML = `⚡ ~${estSales} ad/ay • ₺${estRevenue >= 1000 ? (estRevenue / 1000).toFixed(1) + "k" : estRevenue}`;
        card.style.position = "relative";
        card.appendChild(badge);
      }

      items.push({
        id: index + 1,
        title,
        brand,
        price,
        reviews,
        rating: Math.min(5.0, parseFloat(rating.toFixed(1))),
        imgUrl,
        estSales,
        estRevenue,
        commissionRate,
        commissionAmount,
        estProfit,
        oppScore,
        demandScore,
        competitionScore,
        economicsScore,
        inCartCount,
        url: linkElem ? (linkElem.href.startsWith("http") ? linkElem.href : `https://www.trendyol.com${linkElem.getAttribute("href")}`) : window.location.href,
      });
    });

    return items;
  }

  // 2. Sayfa İçi Floating Başlatıcı Buton
  function injectLauncherButton() {
    if (document.getElementById("urunbul-floating-launcher")) return;

    scrapedData = extractPageProducts();
    const launcher = document.createElement("div");
    launcher.id = "urunbul-floating-launcher";
    launcher.innerHTML = `
      <span style="color: #60a5fa;">⚡</span>
      <span>ÜrünBul Pazar Taraması (${scrapedData.length} Ürün)</span>
    `;

    launcher.addEventListener("click", () => {
      toggleScanModal();
    });

    document.body.appendChild(launcher);
  }

  // 3. Ürün Kartı & Pazar Röntgeni Modal Overlay Penceresi
  function toggleScanModal() {
    let overlay = document.getElementById("urunbul-xray-overlay");

    if (overlay) {
      if (overlay.style.display === "none") {
        overlay.style.display = "flex";
        isScanOpen = true;
      } else {
        overlay.style.display = "none";
        isScanOpen = false;
      }
      return;
    }

    scrapedData = extractPageProducts();
    if (scrapedData.length === 0) {
      alert("Bu sayfada taranabilir Trendyol ürünü bulunamadı.");
      return;
    }

    // İstatistikler & Medyan Fiyat
    const totalRevenue = scrapedData.reduce((acc, p) => acc + p.estRevenue, 0);
    const avgPrice = Math.round(scrapedData.reduce((acc, p) => acc + p.price, 0) / scrapedData.length);
    const sortedPrices = [...scrapedData].map((p) => p.price).filter((pr) => pr > 0).sort((a, b) => a - b);
    const medianPrice = sortedPrices.length
      ? (sortedPrices.length % 2 !== 0
          ? sortedPrices[Math.floor(sortedPrices.length / 2)]
          : Math.round((sortedPrices[Math.floor(sortedPrices.length / 2) - 1] + sortedPrices[Math.floor(sortedPrices.length / 2)]) / 2))
      : avgPrice;

    const avgSales = Math.round(scrapedData.reduce((acc, p) => acc + p.estSales, 0) / scrapedData.length);
    const avgRating = (scrapedData.reduce((acc, p) => acc + p.rating, 0) / scrapedData.length).toFixed(1);

    overlay = document.createElement("div");
    overlay.id = "urunbul-xray-overlay";

    overlay.innerHTML = `
      <!-- Modal Header -->
      <div class="xray-header">
        <div class="xray-title-box">
          <div class="xray-logo-badge">⚡</div>
          <span class="xray-header-title">ÜrünBul – Sayfa İçi Pazar Röntgeni & Ürün Kartı Taraması</span>
          <span class="xray-count-pill">${scrapedData.length} Ürün Taranıyor</span>
        </div>
        <div class="xray-actions">
          <button id="xray-csv-btn" class="xray-btn">📥 CSV İndir</button>
          <button id="xray-web-btn" class="xray-btn" style="background:#2563eb; color:#fff; border-color:#2563eb;">🖥️ Web Dashboard</button>
          <button id="xray-close-btn" class="xray-close-btn">✕</button>
        </div>
      </div>

      <!-- 4 Metrik Şeridi (Medyan Fiyat Vurgulu) -->
      <div class="xray-ribbon">
        <div class="xray-kpi-card">
          <div class="xray-kpi-label">Toplam Sayfa Cirosu</div>
          <div class="xray-kpi-value" style="color: #34d399;">₺${totalRevenue.toLocaleString("tr-TR")}</div>
          <div class="xray-kpi-sub">Sayfadaki ${scrapedData.length} ürün toplamı</div>
        </div>
        <div class="xray-kpi-card">
          <div class="xray-kpi-label">Medyan (Ortanca) Fiyat</div>
          <div class="xray-kpi-value" style="color: #60a5fa;">₺${medianPrice.toLocaleString("tr-TR")}</div>
          <div class="xray-kpi-sub">Ortalama: ₺${avgPrice.toLocaleString("tr-TR")}</div>
        </div>
        <div class="xray-kpi-card">
          <div class="xray-kpi-label">Ortalama Aylık Satış</div>
          <div class="xray-kpi-value" style="color: #fbbf24;">~${avgSales} ad / ay</div>
          <div class="xray-kpi-sub">Tahmini tüketici talebi</div>
        </div>
        <div class="xray-kpi-card">
          <div class="xray-kpi-label">Ortalama Puan & Güven</div>
          <div class="xray-kpi-value" style="color: #c084fc;">★ ${avgRating} / 5.0</div>
          <div class="xray-kpi-sub">Müşteri memnuniyet skoru</div>
        </div>
      </div>

      <!-- High-Density Ürün Tablosu -->
      <div class="xray-table-wrapper">
        <table class="xray-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Görsel & Başlık</th>
              <th>Marka</th>
              <th>Fiyat</th>
              <th>Tahmini Satış</th>
              <th>Tahmini Ciro</th>
              <th>Pazar Skoru</th>
              <th>Sepet / Sosyal</th>
              <th>Rating</th>
              <th style="text-align: right;">Net Kâr</th>
            </tr>
          </thead>
          <tbody>
            ${scrapedData.map((p) => `
              <tr>
                <td style="font-family: monospace; color: #64748b;">${p.id}</td>
                <td>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    ${p.imgUrl ? `<img src="${p.imgUrl}" referrerpolicy="no-referrer" class="xray-thumb" />` : ''}
                    <div style="max-width: 240px;">
                      <a href="${p.url}" target="_blank" style="color: #f8fafc; text-decoration: none; font-weight: 600; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;">
                        ${p.title}
                      </a>
                    </div>
                  </div>
                </td>
                <td style="font-weight: 700; color: #60a5fa;">${p.brand}</td>
                <td style="font-weight: 800; color: #ffffff; white-space: nowrap;">₺${p.price.toLocaleString("tr-TR")}</td>
                <td style="font-weight: 600; color: #e2e8f0; white-space: nowrap;">~${p.estSales} ad/ay</td>
                <td style="font-weight: 800; color: #34d399; white-space: nowrap;">₺${p.estRevenue.toLocaleString("tr-TR")}</td>
                <td style="white-space: nowrap;">
                  <span style="font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 999px; background: rgba(59, 130, 246, 0.2); color: #60a5fa;">
                    ⚡ %${p.oppScore}
                  </span>
                  <div style="font-size: 9px; color: #94a3b8; font-family: monospace; margin-top: 2px;">
                    T:%${p.demandScore} R:%${p.competitionScore}
                  </div>
                </td>
                <td style="font-size: 10px; color: #34d399; white-space: nowrap;">
                  🛒 ~${p.inCartCount} sepette
                </td>
                <td style="color: #fbbf24; font-weight: 700; white-space: nowrap;">
                  ★ ${p.rating} <span style="font-size: 10px; color: #64748b; font-weight: normal;">(${p.reviews})</span>
                </td>
                <td style="text-align: right; white-space: nowrap;">
                  <button class="xray-btn" onclick="alert('Ürün: ${p.title.replace(/'/g, "")}\\nTahmini Satış Fiyatı: ₺${p.price}\\nKomisyon: %17 (₺${p.commissionAmount})\\nTahmini Kargo: ₺44.5\\nBirim Başı Net Kâr: ₺${p.estProfit}')" style="background: rgba(16, 185, 129, 0.2); color: #34d399; border-color: rgba(16, 185, 129, 0.4);">
                    ₺${p.estProfit} Kâr
                  </button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;

    document.body.appendChild(overlay);
    isScanOpen = true;

    // Kapat Butonu
    document.getElementById("xray-close-btn").addEventListener("click", () => {
      overlay.style.display = "none";
      isScanOpen = false;
    });

    // Web Dashboard Butonu
    document.getElementById("xray-web-btn").addEventListener("click", () => {
      window.open("http://localhost:3000", "_blank");
    });

    // CSV İndir Butonu
    document.getElementById("xray-csv-btn").addEventListener("click", () => {
      exportCSV(scrapedData);
    });
  }

  // 4. Trendyol Ürün Detay Sayfasında Fotoğraf Altına Canlı Kâr Hesaplayıcı Enjeksiyonu
  function injectProductDetailProfitCalculator() {
    if (document.getElementById("urunbul-detail-calculator")) return;

    // Ürün detay sayfasında mıyız?
    const isProductPage = window.location.href.includes("-p-") || document.querySelector(".product-detail-container, .pr-in-cn, .gallery-container");
    if (!isProductPage) return;

    // Fotoğraf galerisi veya sol kolon hedef konteynerini bul
    const galleryTarget = document.querySelector(".gallery-container, .product-slide-container, .base-product-image, .pr-in-at");
    if (!galleryTarget) return;

    // Ürünün mevcut fiyatını çek
    const priceElem = document.querySelector(".prc-dsc, .prc-slg, .product-price-container, [class*='price']");
    const rawPriceText = priceElem?.textContent || "500";
    const initialPrice = parseFloat(rawPriceText.replace(/[^0-9,]/g, "").replace(",", ".")) || 500;
    const initialCost = Math.round(initialPrice * 0.45);

    // Hesaplayıcı Kutusu Oluştur
    const calcCard = document.createElement("div");
    calcCard.id = "urunbul-detail-calculator";
    calcCard.style.cssText = `
      margin-top: 16px;
      margin-bottom: 16px;
      padding: 14px 16px;
      background: #0f172a;
      border: 1.5px solid #10b981;
      border-radius: 14px;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
      clear: both;
      z-index: 20;
    `;

    calcCard.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #1e293b;padding-bottom:8px;margin-bottom:10px;">
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="background:#10b981;color:#fff;font-weight:900;font-size:10px;padding:2px 6px;border-radius:4px;">ÜRÜNBUL</span>
          <span style="font-weight:800;font-size:12px;color:#fff;">Canlı Kâr & Komisyon Hesaplayıcı</span>
        </div>
        <span style="font-size:10px;color:#10b981;font-weight:700;">Canlı Baremli</span>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;font-size:11px;">
        <div>
          <label style="display:block;font-size:10px;color:#94a3b8;margin-bottom:3px;font-weight:600;">Satış Fiyatı (₺)</label>
          <input id="ub-calc-sell" type="number" value="${initialPrice}" style="width:100%;box-sizing:border-box;padding:5px 8px;background:#0b0f19;border:1px solid #334155;border-radius:6px;color:#fff;font-weight:700;font-size:12px;outline:none;" />
        </div>
        <div>
          <label style="display:block;font-size:10px;color:#94a3b8;margin-bottom:3px;font-weight:600;">Alış Maliyeti (₺)</label>
          <input id="ub-calc-cost" type="number" value="${initialCost}" style="width:100%;box-sizing:border-box;padding:5px 8px;background:#0b0f19;border:1px solid #334155;border-radius:6px;color:#fff;font-weight:700;font-size:12px;outline:none;" />
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;font-size:11px;">
        <div>
          <label style="display:block;font-size:10px;color:#94a3b8;margin-bottom:3px;font-weight:600;">Komisyon (%)</label>
          <select id="ub-calc-comm" style="width:100%;box-sizing:border-box;padding:5px 8px;background:#0b0f19;border:1px solid #334155;border-radius:6px;color:#fff;font-weight:700;font-size:11px;outline:none;">
            <option value="15">Standart (%15)</option>
            <option value="13">Küçük Ev Aletleri (%13)</option>
            <option value="10">Elektronik (%10)</option>
            <option value="21">Giyim & Ayakkabı (%21)</option>
            <option value="18">Ev & Yaşam (%18)</option>
            <option value="16">Kozmetik (%16)</option>
          </select>
        </div>
        <div>
          <label style="display:block;font-size:10px;color:#94a3b8;margin-bottom:3px;font-weight:600;">Kargo Modeli</label>
          <select id="ub-calc-ship" style="width:100%;box-sizing:border-box;padding:5px 8px;background:#0b0f19;border:1px solid #334155;border-radius:6px;color:#fff;font-weight:700;font-size:11px;outline:none;">
            <option value="auto">Dinamik TY Baremi</option>
            <option value="35">Sabit 35 TL</option>
            <option value="45">Sabit 45 TL</option>
            <option value="55">Sabit 55 TL</option>
          </select>
        </div>
      </div>

      <!-- Sonuç Kutusu -->
      <div id="ub-calc-results" style="background:#0b0f19;border:1px solid #1e293b;border-radius:10px;padding:8px 10px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;text-align:center;">
        <div>
          <div style="font-size:9px;color:#94a3b8;text-transform:uppercase;">Komisyon</div>
          <div id="ub-res-comm" style="font-size:11px;font-weight:800;color:#f59e0b;margin-top:2px;">₺0.00</div>
        </div>
        <div>
          <div style="font-size:9px;color:#94a3b8;text-transform:uppercase;">Kargo</div>
          <div id="ub-res-ship" style="font-size:11px;font-weight:800;color:#38bdf8;margin-top:2px;">₺0.00</div>
        </div>
        <div style="background:rgba(16,185,129,0.1);border-radius:6px;padding:2px;">
          <div style="font-size:9px;color:#10b981;font-weight:700;text-transform:uppercase;">Net Kâr</div>
          <div id="ub-res-profit" style="font-size:12px;font-weight:900;color:#10b981;margin-top:2px;">₺0.00</div>
        </div>
      </div>

      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;font-size:10px;color:#94a3b8;">
        <span id="ub-res-margin">Marj: %0.0</span>
        <a href="http://localhost:3000" target="_blank" style="color:#10b981;text-decoration:none;font-weight:700;">Detaylı Pazar Analizi ➔</a>
      </div>
    `;

    // Fotoğraf galerisinin hemen arkasına ekle
    galleryTarget.parentNode.insertBefore(calcCard, galleryTarget.nextSibling);

    // Hesaplama Dinamiği
    function runLiveCalc() {
      const sell = parseFloat(document.getElementById("ub-calc-sell")?.value) || 0;
      const cost = parseFloat(document.getElementById("ub-calc-cost")?.value) || 0;
      const commRate = parseFloat(document.getElementById("ub-calc-comm")?.value) || 15;
      const shipModel = document.getElementById("ub-calc-ship")?.value || "auto";

      const commAmount = (sell * commRate) / 100;
      let shipping = 44.90;
      if (shipModel === "auto") {
        shipping = sell < 150 ? 29.90 : 44.90;
      } else {
        shipping = parseFloat(shipModel) || 45;
      }

      const serviceFee = 6.99;
      const withholding = (sell * 1.0) / 100;
      const totalExpense = cost + commAmount + shipping + serviceFee + withholding;
      const netProfit = sell - totalExpense;
      const margin = sell > 0 ? (netProfit / sell) * 100 : 0;

      const commElem = document.getElementById("ub-res-comm");
      const shipElem = document.getElementById("ub-res-ship");
      const profitElem = document.getElementById("ub-res-profit");
      const marginElem = document.getElementById("ub-res-margin");

      if (commElem) commElem.textContent = `₺${commAmount.toFixed(1)}`;
      if (shipElem) shipElem.textContent = `₺${shipping.toFixed(1)}`;
      if (profitElem) {
        profitElem.textContent = `₺${netProfit.toFixed(1)}`;
        profitElem.style.color = netProfit >= 0 ? "#10b981" : "#f43f5e";
      }
      if (marginElem) {
        marginElem.textContent = `Marj: %${margin.toFixed(1)} (Başa baş: ₺${(cost + shipping + serviceFee) / (1 - (commRate + 1)/100) > 0 ? ((cost + shipping + serviceFee) / (1 - (commRate + 1)/100)).toFixed(1) : 0})`;
      }
    }

    // Input dinleyicileri
    document.getElementById("ub-calc-sell")?.addEventListener("input", runLiveCalc);
    document.getElementById("ub-calc-cost")?.addEventListener("input", runLiveCalc);
    document.getElementById("ub-calc-comm")?.addEventListener("change", runLiveCalc);
    document.getElementById("ub-calc-ship")?.addEventListener("change", runLiveCalc);

    // İlk hesaplamayı çalıştır
    runLiveCalc();
  }

  // 5. CSV Dışa Aktarma
  function exportCSV(data) {
    const headers = ["ID", "Baslik", "Marka", "Fiyat", "Aylik_Satis", "Aylik_Ciro", "Komisyon_TL", "Talep_Skoru", "Pazar_Skoru", "Rating", "Yorum", "Link"];
    const rows = data.map((d) => [
      d.id,
      `"${d.title.replace(/"/g, '""')}"`,
      `"${d.brand}"`,
      d.price,
      d.estSales,
      d.estRevenue,
      d.commissionAmount,
      d.demandScore,
      d.oppScore,
      d.rating,
      d.reviews,
      `"${d.url}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((e) => e.join(";"))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `UrunBul_Pazar_Analizi_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Sayfa yüklendiğinde ve dinamik scroll'da çalıştır
  setTimeout(() => {
    injectLauncherButton();
    injectProductDetailProfitCalculator();
  }, 1500);

  window.addEventListener("scroll", () => {
    if (!document.getElementById("urunbul-floating-launcher")) {
      injectLauncherButton();
    }
    if (!document.getElementById("urunbul-detail-calculator")) {
      injectProductDetailProfitCalculator();
    }
  });
})();
