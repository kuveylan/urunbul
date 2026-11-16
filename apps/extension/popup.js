document.addEventListener("DOMContentLoaded", async () => {
  const tabSeller = document.getElementById("tabSeller");
  const tabConsumer = document.getElementById("tabConsumer");
  const sellerPanel = document.getElementById("sellerPanel");
  const consumerPanel = document.getElementById("consumerPanel");

  // Sekme Değişimi
  tabSeller.addEventListener("click", () => {
    tabSeller.classList.add("active");
    tabConsumer.classList.remove("active");
    sellerPanel.style.display = "block";
    consumerPanel.style.display = "none";
  });

  tabConsumer.addEventListener("click", () => {
    tabConsumer.classList.add("active");
    tabSeller.classList.remove("active");
    consumerPanel.style.display = "block";
    sellerPanel.style.display = "none";
  });

  document.getElementById("btnOpenDashboard")?.addEventListener("click", () => {
    chrome.tabs.create({ url: "http://localhost:3000" });
  });

  document.getElementById("btnOpenCompare")?.addEventListener("click", () => {
    chrome.tabs.create({ url: "http://localhost:3000" });
  });

  // Aktif Sekmeyi Sorgula
  let queryTerm = "kulaklik";
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && tab.url.includes("trendyol.com")) {
      const titleClean = tab.title.split("-")[0].replace("Fiyatı", "").replace("Yorumları", "").trim();
      if (titleClean.length > 2) queryTerm = titleClean;
    }
  } catch (e) {
    console.log("Tab query fallback");
  }

  // Backend API'den Canlı Ürünleri Çek
  try {
    const res = await fetch(`http://localhost:8000/api/v1/products/search?q=${encodeURIComponent(queryTerm)}&limit=10`);
    if (!res.ok) throw new Error("API hatası");
    const products = await res.json();

    if (products.length > 0) {
      // 1. Satıcı Pazar Paneli Güncellemesi (Medyan Fiyat Hesaplama)
      const totalCount = products.length;
      const prices = products.map((p) => p.current_price).filter((pr) => pr > 0);
      const sortedPrices = [...prices].sort((a, b) => a - b);
      const avgP = Math.round(prices.reduce((a, b) => a + b, 0) / (totalCount || 1));
      const medianP = sortedPrices.length
        ? (sortedPrices.length % 2 !== 0
            ? sortedPrices[Math.floor(sortedPrices.length / 2)]
            : Math.round((sortedPrices[Math.floor(sortedPrices.length / 2) - 1] + sortedPrices[Math.floor(sortedPrices.length / 2)]) / 2))
        : avgP;
      const avgO = (products.reduce((a, b) => a + b.opportunity_score, 0) / totalCount).toFixed(1);

      document.getElementById("totalCount").textContent = `${totalCount} ad`;
      if (document.getElementById("medianPrice")) {
        document.getElementById("medianPrice").textContent = `₺${medianP.toLocaleString("tr-TR")}`;
      } else if (document.getElementById("avgPrice")) {
        document.getElementById("avgPrice").textContent = `₺${avgP.toLocaleString("tr-TR")}`;
      }
      document.getElementById("avgOpp").textContent = `${avgO} / 100`;

      const tbody = document.getElementById("scanList") || document.getElementById("xrayList");
      if (tbody) {
        tbody.innerHTML = "";
        products.slice(0, 5).forEach((p) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td style="max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600;">
              ${p.title}
            </td>
            <td style="font-weight: 700;">₺${p.current_price.toLocaleString("tr-TR")}</td>
            <td style="color: #64748b;">~${p.estimated_monthly_sales}</td>
            <td><span style="background: #e0f2fe; color: #0369a1; padding: 2px 5px; border-radius: 4px; font-weight: 800;">${p.opportunity_score}</span></td>
          `;
          tbody.appendChild(tr);
        });
      }

      // 2. Tüketici Paneli Güncellemesi
      const p0 = products[0];
      document.getElementById("consumerTitle").textContent = p0.title;
      document.getElementById("consumerLowest").textContent = `₺${p0.current_price.toLocaleString("tr-TR")}`;
      document.getElementById("consumerVerdict").textContent = p0.opportunity_score >= 70 ? "Fırsat Fiyatı (Dip Seviye)" : "Normal Piyasa Fiyatı";
      document.getElementById("alertPriceInput").value = Math.round(p0.current_price * 0.85);

      // Alarm Kur Butonu
      document.getElementById("btnSaveAlert")?.addEventListener("click", async () => {
        const targetPrice = parseFloat(document.getElementById("alertPriceInput").value);
        const email = document.getElementById("alertEmailInput").value;
        if (!targetPrice || !p0.id) return;

        try {
          const alertRes = await fetch(`http://localhost:8000/api/v1/products/${p0.id}/alerts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ target_price: targetPrice, user_email: email }),
          });
          if (alertRes.ok) {
            alert("✅ Fiyat alarmı kuruldu! Fiyat ₺" + targetPrice + " altına indiğinde haber verilecek.");
          }
        } catch (err) {
          alert("Alarm kaydedilemedi.");
        }
      });
    }
  } catch (err) {
    document.getElementById("xrayList").innerHTML = `
      <tr><td colspan="4" style="text-align: center; color: #ef4444; padding: 10px;">Backend API'ye bağlanılamadı.</td></tr>
    `;
  }
});
