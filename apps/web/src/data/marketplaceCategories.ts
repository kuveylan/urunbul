export interface MarketplaceCategory {
  id: string;
  name: string;        // Kategori / Ürün tipi adı (Örn: "Sulu Boya")
  path: string;        // Hiyerarşik ağaç / Breadcrumb (Örn: "Yaşam › Kırtasiye & Ofis Malz.")
  rate: number;        // 2026 Resmi komisyon oranı (%)
}

export type MarketplaceType = "Trendyol" | "Hepsiburada" | "N11" | "Amazon TR";

export const MARKETPLACE_CATEGORIES: Record<MarketplaceType, MarketplaceCategory[]> = {
  Trendyol: [
    {
      id: "ty-sulu-boya",
      name: "Sulu Boya",
      path: "Yaşam › Kırtasiye & Ofis Malz.",
      rate: 16.0,
    },
    {
      id: "ty-yagli-akrilik-boya",
      name: "Yağlı & Akrilik Boya",
      path: "Yaşam › Hobi & Sanat › Resim & Boya",
      rate: 16.0,
    },
    {
      id: "ty-defter-kagit",
      name: "Defter & Kağıt Ürünleri",
      path: "Yaşam › Kırtasiye & Ofis Malz. › Kağıt Ürünleri",
      rate: 16.0,
    },
    {
      id: "ty-kucuk-mutfak",
      name: "Küçük Mutfak Aletleri",
      path: "Elektronik › Küçük Ev Aletleri › Mutfak Aletleri",
      rate: 13.0,
    },
    {
      id: "ty-supurge-temizlik",
      name: "Süpürge & Temizlik Cihazları",
      path: "Elektronik › Küçük Ev Aletleri › Süpürgeler",
      rate: 13.0,
    },
    {
      id: "ty-kulaklik-ses",
      name: "Bluetooth Kulaklık & Ses",
      path: "Elektronik › Ses & Görüntü Sistemleri › Kulaklıklar",
      rate: 10.0,
    },
    {
      id: "ty-giyim-ust",
      name: "Kadın / Erkek Üst Giyim",
      path: "Moda › Tekstil & Giyim › Üst Giyim",
      rate: 21.0,
    },
    {
      id: "ty-spor-ayakkabi",
      name: "Spor Ayakkabı & Sneaker",
      path: "Moda › Ayakkabı & Çanta › Spor Ayakkabı",
      rate: 21.5,
    },
    {
      id: "ty-cilt-bakim",
      name: "Cilt Bakım & Serum",
      path: "Kozmetik & Kişisel Bakım › Cilt Bakımı › Serum & Krem",
      rate: 16.0,
    },
    {
      id: "ty-parfum",
      name: "Parfüm & Deodorant",
      path: "Kozmetik & Kişisel Bakım › Parfüm & Deodorant",
      rate: 16.0,
    },
    {
      id: "ty-bebek-bakim",
      name: "Bebek Bezi & Bakım",
      path: "Anne & Bebek › Bebek Bakım & Sağlık",
      rate: 15.0,
    },
    {
      id: "ty-oto-aksesuar",
      name: "Oto Aksesuar & Paspas",
      path: "Oto & Yapı Market › Araç Aksesuar",
      rate: 14.0,
    },
    {
      id: "ty-fitness",
      name: "Fitness & Kondisyon",
      path: "Spor & Outdoor › Fitness Ekipmanları",
      rate: 17.0,
    },
    {
      id: "ty-kahve-icecek",
      name: "Kahve & Sıcak İçecekler",
      path: "Süpermarket › İçecekler › Kahve & Çay",
      rate: 12.0,
    },
    {
      id: "ty-telefon-kilif",
      name: "Telefon Kılıfı & Ekran Koruyucu",
      path: "Elektronik › Telefon & Aksesuarları › Kılıf",
      rate: 19.0,
    },
    {
      id: "ty-ev-tekstili",
      name: "Ev Tekstili & Nevresim",
      path: "Ev & Yaşam › Ev Tekstili",
      rate: 18.0,
    },
    {
      id: "ty-taki-bijuteri",
      name: "Takı & Bijuteri",
      path: "Moda › Takı & Mücevher › Bijuteri",
      rate: 23.0,
    },
  ],

  Hepsiburada: [
    {
      id: "hb-sulu-boya",
      name: "Sulu Boya",
      path: "Kırtasiye / Ofis › Ofis ve Okul Kırtasiye › Okul Aktivite ve Boya › Boya",
      rate: 17.0,
    },
    {
      id: "hb-defter-bloknot",
      name: "Defter & Bloknot",
      path: "Kırtasiye / Ofis › Ofis ve Okul Kırtasiye › Defterler",
      rate: 17.0,
    },
    {
      id: "hb-kucuk-mutfak",
      name: "Küçük Mutfak Aletleri",
      path: "Elektrikli Ev Aletleri › Mutfak Gereçleri",
      rate: 13.0,
    },
    {
      id: "hb-supurge-utu",
      name: "Süpürgeler & Ütüler",
      path: "Elektrikli Ev Aletleri › Ev Bakımı & Temizlik",
      rate: 13.0,
    },
    {
      id: "hb-kulaklik",
      name: "Kulaklık & Hoparlör",
      path: "Elektronik › Telefon & Aksesuarları › Bluetooth Kulaklık",
      rate: 11.0,
    },
    {
      id: "hb-giyim",
      name: "Kadın / Erkek Giyim",
      path: "Moda › Kadın / Erkek Tekstil › Üst Giyim",
      rate: 22.0,
    },
    {
      id: "hb-ayakkabi",
      name: "Günlük & Spor Ayakkabı",
      path: "Moda › Ayakkabı & Çanta › Spor Ayakkabı",
      rate: 22.0,
    },
    {
      id: "hb-parfum",
      name: "Parfüm & Kozmetik",
      path: "Kozmetik & Sağlık & Kişisel Bakım › Parfümler",
      rate: 17.0,
    },
    {
      id: "hb-bebek-bezi",
      name: "Bebek Bezi & Islak Mendil",
      path: "Anne & Bebek & Oyuncak › Bebek Bezi",
      rate: 14.0,
    },
    {
      id: "hb-arac-bakim",
      name: "Araç Bakım & Temizlik",
      path: "Oto Aksesuar & Yapı Market › Araç Bakım",
      rate: 14.0,
    },
    {
      id: "hb-fitness",
      name: "Fitness & Kondisyon",
      path: "Spor & Outdoor › Fitness & Kondisyon Ekipmanları",
      rate: 16.5,
    },
    {
      id: "hb-cay-kahve",
      name: "Çay & Kahve & İçecek",
      path: "Temel Tüketim & Gıda › İçecekler",
      rate: 12.0,
    },
    {
      id: "hb-telefon-kilifi",
      name: "Cep Telefonu Kılıfları",
      path: "Elektronik › Aksesuar › Cep Telefonu Kılıfları",
      rate: 20.0,
    },
    {
      id: "hb-ev-tekstili",
      name: "Ev Tekstili & Yatak",
      path: "Ev & Yaşam › Ev Tekstili",
      rate: 18.5,
    },
    {
      id: "hb-taki-saat",
      name: "Takı & Saat",
      path: "Moda & Aksesuar › Saat & Takı",
      rate: 22.5,
    },
  ],

  "Amazon TR": [
    {
      id: "amz-sulu-boya",
      name: "Sulu Boya & Sanat",
      path: "Ofis ve Kırtasiye › Sanat ve El Sanatları Malzemeleri › Boyalar",
      rate: 12.0,
    },
    {
      id: "amz-defter-yazi",
      name: "Defter & Yazı Gereçleri",
      path: "Ofis ve Kırtasiye › Kağıt Ürünleri & Defterler",
      rate: 12.0,
    },
    {
      id: "amz-elektronik-kulaklik",
      name: "Tüketici Elektroniği & Kulaklık",
      path: "Elektronik › Ses ve Ev Ses Sistemleri › Kulaklıklar",
      rate: 7.0,
    },
    {
      id: "amz-kucuk-ev-mutfak",
      name: "Küçük Ev & Mutfak Aletleri",
      path: "Mutfak & Ev Gereçleri › Küçük Mutfak Aletleri",
      rate: 10.5,
    },
    {
      id: "amz-giyim-aksesuar",
      name: "Giyim & Aksesuar",
      path: "Giyim & Ayakkabı › Kadın & Erkek Giyim",
      rate: 15.0,
    },
    {
      id: "amz-ayakkabi-canta",
      name: "Ayakkabı & Çanta",
      path: "Giyim & Ayakkabı › Ayakkabı & Çantalar",
      rate: 15.0,
    },
    {
      id: "amz-cilt-bakim",
      name: "Cilt Bakım & Güzellik",
      path: "Güzellik & Kişisel Bakım › Cilt Bakımı & Parfüm",
      rate: 12.0,
    },
    {
      id: "amz-bebek-urunleri",
      name: "Bebek Ürünleri",
      path: "Bebek › Bebek Bakım ve Beslenme",
      rate: 11.0,
    },
    {
      id: "amz-spor-doga",
      name: "Spor & Doğa",
      path: "Spor ve Doğa Sporları › Egzersiz ve Fitness",
      rate: 13.0,
    },
    {
      id: "amz-otomotiv-aksesuar",
      name: "Otomotiv Aksesuar",
      path: "Otomotiv › Araç Bakım ve Parçaları",
      rate: 12.0,
    },
    {
      id: "amz-supermarket",
      name: "Süpermarket & İçecek",
      path: "Gıda ve İçecek › İçecekler & Atıştırmalıklar",
      rate: 10.0,
    },
    {
      id: "amz-kitap-hobi",
      name: "Kitap & Hobi",
      path: "Kitap › Türkçe & Yabancı Dilde Kitaplar",
      rate: 10.0,
    },
    {
      id: "amz-ev-duzenleme",
      name: "Ev & Mutfak Gereçleri",
      path: "Mutfak & Ev Gereçleri › Ev Düzenleme",
      rate: 13.0,
    },
    {
      id: "amz-telefon-aksesuar",
      name: "Cep Telefonu Aksesuarı",
      path: "Elektronik › Cep Telefonu Aksesuarları",
      rate: 13.0,
    },
  ],

  N11: [
    {
      id: "n11-sulu-boya",
      name: "Sulu Boya & Resim Malzemesi",
      path: "Kitap, Müzik, Film, Oyun › Kırtasiye & Ofis › Resim & Boya Malzemeleri",
      rate: 16.5,
    },
    {
      id: "n11-defter-okul",
      name: "Defter & Okul Kırtasiye",
      path: "Kitap, Müzik, Film, Oyun › Kırtasiye & Ofis › Okul Kırtasiye",
      rate: 16.5,
    },
    {
      id: "n11-kucuk-ev-aletleri",
      name: "Küçük Ev Aletleri",
      path: "Elektrikli Ev Aletleri › Süpürge & Temizlik",
      rate: 14.0,
    },
    {
      id: "n11-kulaklik-ses",
      name: "Kulaklık & Ses",
      path: "Elektronik › Ses ve Görüntü Sistemleri › Kulaklıklar",
      rate: 11.0,
    },
    {
      id: "n11-giyim-moda",
      name: "Giyim & Moda",
      path: "Giyim & Ayakkabı › Kadın & Erkek Giyim",
      rate: 20.5,
    },
    {
      id: "n11-ayakkabi-canta",
      name: "Ayakkabı & Çanta",
      path: "Giyim & Ayakkabı › Ayakkabı & Çanta",
      rate: 21.0,
    },
    {
      id: "n11-kozmetik-kisisel",
      name: "Kozmetik & Kişisel Bakım",
      path: "Kozmetik & Kişisel Bakım › Parfüm & Deodorant",
      rate: 16.5,
    },
    {
      id: "n11-anne-bebek",
      name: "Anne & Bebek",
      path: "Anne & Bebek › Bebek Bakım & Sağlık",
      rate: 14.5,
    },
    {
      id: "n11-spor-outdoor",
      name: "Spor & Outdoor",
      path: "Spor & Outdoor › Fitness & Kondisyon",
      rate: 16.0,
    },
    {
      id: "n11-oto-motosiklet",
      name: "Otomotiv & Motosiklet",
      path: "Otomotiv & Motosiklet › Oto Aksesuar",
      rate: 13.5,
    },
    {
      id: "n11-supermarket",
      name: "Süpermarket",
      path: "Süpermarket › Temel Gıda & İçecekler",
      rate: 12.5,
    },
    {
      id: "n11-ev-dekorasyon",
      name: "Ev & Yaşam / Dekorasyon",
      path: "Ev & Yaşam › Ev Tekstili & Dekorasyon",
      rate: 17.5,
    },
    {
      id: "n11-telefon-aksesuar",
      name: "Telefon & Aksesuarları",
      path: "Elektronik › Telefon & Aksesuarları",
      rate: 17.0,
    },
  ],
};
