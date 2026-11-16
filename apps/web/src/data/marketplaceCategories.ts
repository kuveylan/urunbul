export interface MarketplaceCategory {
  id: string;
  name: string;        // Kategori / Ürün tipi adı
  department: string;  // Ana Sektör (Örn: "Moda & Giyim", "Elektronik & Telefon")
  path: string;        // Hiyerarşik ağaç / Breadcrumb
  rate: number;        // 2026 Resmi komisyon oranı (%)
  defaultDesi: number; // Kategoriye özel tahmini kargo desi hacmi
  keywords: string[];  // Otomatik eşleştirme için anahtar kelimeler
}

export type MarketplaceType = "Trendyol" | "Hepsiburada" | "N11" | "Amazon TR";

// 2026 TÜRKİYE DEV PAZARYERLERİ EKSİKSİZ RESMİ KATEGORİ VE KOMİSYON VERİTABANI
export const MARKETPLACE_CATEGORIES: Record<MarketplaceType, MarketplaceCategory[]> = {
  Trendyol: [
    // 1. Moda, Giyim & Tekstil
    {
      id: "ty-giyim-ust",
      name: "Kadın / Erkek Üst Giyim (Tişört, Gömlek, Kazak)",
      department: "👗 Moda & Giyim",
      path: "Moda › Kadın / Erkek Giyim › Üst Giyim",
      rate: 21.0,
      defaultDesi: 1.0,
      keywords: ["tişört", "t-shirt", "gömlek", "kazak", "bluz", "sweatshirt", "hırka", "tunik"],
    },
    {
      id: "ty-giyim-alt",
      name: "Kadın / Erkek Alt Giyim (Pantolon, Jean, Etek)",
      department: "👗 Moda & Giyim",
      path: "Moda › Kadın / Erkek Giyim › Alt Giyim",
      rate: 21.0,
      defaultDesi: 1.5,
      keywords: ["pantolon", "jean", "kot", "etek", "şort", "tayt", "eşofman"],
    },
    {
      id: "ty-elbise-abiye",
      name: "Elbise, Takım Elbise & Abiye",
      department: "👗 Moda & Giyim",
      path: "Moda › Giyim › Elbise & Takım",
      rate: 22.0,
      defaultDesi: 1.5,
      keywords: ["elbise", "abiye", "takım elbise", "ceket", "tulum"],
    },
    {
      id: "ty-dis-giyim",
      name: "Dış Giyim (Mont, Kaban, Trençkot, Yelek)",
      department: "👗 Moda & Giyim",
      path: "Moda › Dış Giyim",
      rate: 22.0,
      defaultDesi: 3.0,
      keywords: ["mont", "kaban", "palto", "trençkot", "yağmurluk", "yelek"],
    },
    {
      id: "ty-ic-giyim",
      name: "İç Giyim, Pijama & Çorap",
      department: "👗 Moda & Giyim",
      path: "Moda › İç Giyim & Uyku",
      rate: 23.0,
      defaultDesi: 0.5,
      keywords: ["iç çamaşırı", "sütyen", "külot", "boxer", "pijama", "çorap", "gecelik"],
    },

    // 2. Ayakkabı & Çanta
    {
      id: "ty-spor-ayakkabi",
      name: "Spor Ayakkabı & Sneaker",
      department: "👟 Ayakkabı & Çanta",
      path: "Moda › Ayakkabı › Spor Ayakkabı",
      rate: 21.5,
      defaultDesi: 2.0,
      keywords: ["spor ayakkabı", "sneaker", "koşu", "yürüyüş ayakkabısı", "krampon"],
    },
    {
      id: "ty-gunluk-ayakkabi",
      name: "Klasik & Günlük Ayakkabı (Topuklu, Babet, Terlik)",
      department: "👟 Ayakkabı & Çanta",
      path: "Moda › Ayakkabı › Günlük",
      rate: 21.5,
      defaultDesi: 2.0,
      keywords: ["ayakkabı", "babet", "topuklu", "sandalet", "terlik", "loafer"],
    },
    {
      id: "ty-bot-cizme",
      name: "Bot & Çizme",
      department: "👟 Ayakkabı & Çanta",
      path: "Moda › Ayakkabı › Bot & Çizme",
      rate: 21.5,
      defaultDesi: 3.5,
      keywords: ["bot", "çizme", "kar botu"],
    },
    {
      id: "ty-canta-cuzdan",
      name: "Çanta, Sırt Çantası & Cüzdan",
      department: "👟 Ayakkabı & Çanta",
      path: "Moda › Çanta & Aksesuar",
      rate: 22.0,
      defaultDesi: 1.5,
      keywords: ["çanta", "kol çantası", "sırt çantası", "cüzdan", "kartlık", "omuz çantası"],
    },
    {
      id: "ty-valiz",
      name: "Valiz & Seyahat Çantaları",
      department: "👟 Ayakkabı & Çanta",
      path: "Seyahat › Valiz",
      rate: 18.0,
      defaultDesi: 12.0,
      keywords: ["valiz", "bavul", "seyahat çantası"],
    },

    // 3. Elektronik & Telefon Aksesuarı
    {
      id: "ty-telefon-kilif",
      name: "Telefon Kılıfı, Cam & Ekran Koruyucu",
      department: "📱 Elektronik & Telefon",
      path: "Elektronik › Telefon Aksesuarları › Kılıf",
      rate: 20.0,
      defaultDesi: 0.5,
      keywords: ["kılıf", "ekran koruyucu", "kırılmaz cam", "lens koruyucu", "telefon kılıfı"],
    },
    {
      id: "ty-sarj-kablo",
      name: "Şarj Cihazı, Data Kablosu & Powerbank",
      department: "📱 Elektronik & Telefon",
      path: "Elektronik › Telefon Aksesuarları › Şarj",
      rate: 15.0,
      defaultDesi: 1.0,
      keywords: ["şarj", "adaptör", "kablo", "type-c", "lightning", "powerbank", "hızlı şarj"],
    },
    {
      id: "ty-kulaklik-ses",
      name: "Bluetooth Kulaklık & Kablosuz Hoparlör",
      department: "📱 Elektronik & Telefon",
      path: "Elektronik › Ses Sistemleri › Kulaklık",
      rate: 11.0,
      defaultDesi: 1.0,
      keywords: ["kulaklık", "bluetooth kulaklık", "tws", "hoparlör", "soundbar", "mikrofon"],
    },
    {
      id: "ty-akilli-saat",
      name: "Akıllı Saat & Akıllı Bileklik",
      department: "📱 Elektronik & Telefon",
      path: "Elektronik › Giyilebilir Teknoloji",
      rate: 11.0,
      defaultDesi: 0.5,
      keywords: ["akıllı saat", "smart watch", "bileklik", "watch"],
    },
    {
      id: "ty-akilli-telefon",
      name: "Akıllı Telefon (Cep Telefonu)",
      department: "📱 Elektronik & Telefon",
      path: "Elektronik › Cep Telefonu",
      rate: 6.0,
      defaultDesi: 1.5,
      keywords: ["cep telefonu", "akıllı telefon", "iphone", "samsung", "xiaomi"],
    },

    // 4. Bilgisayar, Tablet & Donanım
    {
      id: "ty-bilgisayar-cevre",
      name: "Klavye, Mouse & Oyuncu Ekipmanları",
      department: "💻 Bilgisayar & Ofis",
      path: "Elektronik › Bilgisayar Bileşenleri › Çevre Birimleri",
      rate: 12.0,
      defaultDesi: 2.0,
      keywords: ["klavye", "mouse", "fare", "oyuncu kulaklığı", "gamepad", "mousepad"],
    },
    {
      id: "ty-laptop-tablet",
      name: "Dizüstü Bilgisayar (Laptop) & Tablet",
      department: "💻 Bilgisayar & Ofis",
      path: "Elektronik › Bilgisayar & Tablet",
      rate: 6.5,
      defaultDesi: 3.5,
      keywords: ["laptop", "dizüstü", "notebook", "tablet", "ipad"],
    },
    {
      id: "ty-monitor-yazici",
      name: "Monitör, Yazıcı & Tarayıcı",
      department: "💻 Bilgisayar & Ofis",
      path: "Elektronik › Monitör & Yazıcı",
      rate: 9.0,
      defaultDesi: 8.0,
      keywords: ["monitör", "ekran", "yazıcı", "toner", "kartuş"],
    },

    // 5. Küçük Ev Aletleri & Mutfak
    {
      id: "ty-kahve-makinesi",
      name: "Kahve & Çay Makineleri (Espresso, Filtre, Türk Kahvesi)",
      department: "☕ Küçük Ev Aletleri",
      path: "Elektronik › Küçük Ev Aletleri › Kahve & Çay",
      rate: 13.0,
      defaultDesi: 4.0,
      keywords: ["kahve makinesi", "türk kahvesi", "çay makinesi", "espresso", "filtre kahve", "kapsül"],
    },
    {
      id: "ty-blender-mutfak",
      name: "Blender, Mikser, Mutfak Robotu & Tost Makinesi",
      department: "☕ Küçük Ev Aletleri",
      path: "Elektronik › Küçük Ev Aletleri › Mutfak Hazırlık",
      rate: 13.0,
      defaultDesi: 3.5,
      keywords: ["blender", "mikser", "mutfak robotu", "tost makinesi", "waffle", "rondo", "doğrayıcı"],
    },
    {
      id: "ty-airfryer-fritoz",
      name: "Airfryer (Sıcak Hava Fritözü) & Pişiriciler",
      department: "☕ Küçük Ev Aletleri",
      path: "Elektronik › Pişirme Cihazları",
      rate: 13.0,
      defaultDesi: 6.0,
      keywords: ["airfryer", "fritöz", "hava fritözü", "elektrikli tencere", "düdüklü"],
    },
    {
      id: "ty-supurge-temizlik",
      name: "Robot Süpürge, Dikey & Toz Torbalı Süpürgeler",
      department: "☕ Küçük Ev Aletleri",
      path: "Elektronik › Küçük Ev Aletleri › Süpürgeler",
      rate: 12.5,
      defaultDesi: 7.0,
      keywords: ["robot süpürge", "süpürge", "dikey süpürge", "şarjlı süpürge", "buharlı temizleyici"],
    },
    {
      id: "ty-utu-bakim",
      name: "Ütü & Buharlı Kırışıklık Giderici",
      department: "☕ Küçük Ev Aletleri",
      path: "Elektronik › Ütü & Giysi Bakım",
      rate: 13.0,
      defaultDesi: 3.0,
      keywords: ["ütü", "buharlı ütü", "kazanlı ütü", "kırışıklık giderici"],
    },

    // 6. Ev & Yaşam, Mutfak & Mobilya
    {
      id: "ty-tencere-tava",
      name: "Tencere, Tava & Pişirme Setleri (Granit, Döküm, Çelik)",
      department: "🍳 Ev, Yaşam & Mutfak",
      path: "Ev & Yaşam › Mutfak Gereçleri › Tencere Tava",
      rate: 18.0,
      defaultDesi: 5.0,
      keywords: ["tencere", "tava", "döküm tava", "düdüklü tencere", "sahan", "kek kalıbı"],
    },
    {
      id: "ty-sofra-bardak",
      name: "Yemek Takımı, Çatal Kaşık & Bardak Setleri",
      department: "🍳 Ev, Yaşam & Mutfak",
      path: "Ev & Yaşam › Sofra & Mutfak",
      rate: 18.0,
      defaultDesi: 6.0,
      keywords: ["yemek takımı", "bardak", "kadeh", "çatal bıçak", "kahve fincanı", "tabak", "kupa"],
    },
    {
      id: "ty-ev-tekstili",
      name: "Ev Tekstili (Nevresim, Yorgan, Yastık, Perde)",
      department: "🍳 Ev, Yaşam & Mutfak",
      path: "Ev & Yaşam › Ev Tekstili",
      rate: 18.0,
      defaultDesi: 3.5,
      keywords: ["nevresim", "yorgan", "yastık", "çarşaf", "battaniye", "perde", "pike", "havlu"],
    },
    {
      id: "ty-mobilya",
      name: "Mobilya (Çalışma Masası, Kitaplık, Sandalye)",
      department: "🍳 Ev, Yaşam & Mutfak",
      path: "Ev & Yaşam › Mobilya",
      rate: 15.0,
      defaultDesi: 18.0,
      keywords: ["çalışma masası", "kitaplık", "sandalye", "koltuk", "sehpa", "komodin", "gardırop"],
    },
    {
      id: "ty-aydinlatma-dekor",
      name: "Dekoratif Aydınlatma, Avize & Halı",
      department: "🍳 Ev, Yaşam & Mutfak",
      path: "Ev & Yaşam › Dekorasyon & Halı",
      rate: 19.0,
      defaultDesi: 5.0,
      keywords: ["avize", "abajur", "halı", "kilim", "tablo", "ayna", "vazo", "mum"],
    },

    // 7. Kozmetik, Parfüm & Kişisel Bakım
    {
      id: "ty-parfum",
      name: "Parfüm & Deodorant (EDP, EDT, Kolonya)",
      department: "💄 Kozmetik & Bakım",
      path: "Kozmetik & Kişisel Bakım › Parfüm",
      rate: 16.0,
      defaultDesi: 0.8,
      keywords: ["parfüm", "deodorant", "edp", "edt", "kolonya", "vücut spreyi"],
    },
    {
      id: "ty-cilt-bakim",
      name: "Cilt Bakım Serum, Krem & Güneş Kremi",
      department: "💄 Kozmetik & Bakım",
      path: "Kozmetik & Kişisel Bakım › Cilt Bakımı",
      rate: 16.5,
      defaultDesi: 0.5,
      keywords: ["serum", "krem", "nemlendirici", "güneş kremi", "tonik", "c vitamini", "retinol", "peeling"],
    },
    {
      id: "ty-makyaj",
      name: "Makyaj Ürünleri (Ruj, Fondöten, Maskara)",
      department: "💄 Kozmetik & Bakım",
      path: "Kozmetik & Kişisel Bakım › Makyaj",
      rate: 17.0,
      defaultDesi: 0.5,
      keywords: ["ruj", "fondöten", "maskara", "far", "kapatıcı", "eyeliner", "allık", "pudra"],
    },
    {
      id: "ty-sac-bakim",
      name: "Saç Bakım & Şampuan",
      department: "💄 Kozmetik & Bakım",
      path: "Kozmetik & Kişisel Bakım › Saç Bakımı",
      rate: 16.0,
      defaultDesi: 1.0,
      keywords: ["şampuan", "saç kremi", "saç maskesi", "saç yağı", "keratin", "saç boyası"],
    },
    {
      id: "ty-kisisel-cihaz",
      name: "Tıraş Makinesi, Saç Kurutma & Düzleştirici",
      department: "💄 Kozmetik & Bakım",
      path: "Elektronik › Kişisel Bakım Cihazları",
      rate: 13.0,
      defaultDesi: 1.5,
      keywords: ["tıraş makinesi", "saç kurutma", "fön", "düzleştirici", "epilatör", "maşa"],
    },

    // 8. Anne, Bebek & Oyuncak
    {
      id: "ty-bebek-bezi",
      name: "Bebek Bezi & Islak Mendil",
      department: "👶 Anne & Bebek",
      path: "Anne & Bebek › Bebek Bezi",
      rate: 14.5,
      defaultDesi: 4.0,
      keywords: ["bebek bezi", "külot bez", "ıslak mendil", "alt açma"],
    },
    {
      id: "ty-bebek-beslenme",
      name: "Bebek Maması, Biberon & Emzik",
      department: "👶 Anne & Bebek",
      path: "Anne & Bebek › Beslenme",
      rate: 14.0,
      defaultDesi: 1.0,
      keywords: ["bebek maması", "biberon", "emzik", "mama sandalyesi", "göğüs pompası"],
    },
    {
      id: "ty-bebek-araba",
      name: "Bebek Arabası & Oto Koltuğu",
      department: "👶 Anne & Bebek",
      path: "Anne & Bebek › Taşıma & Oto Koltuğu",
      rate: 14.0,
      defaultDesi: 15.0,
      keywords: ["bebek arabası", "puset", "oto koltuğu", "ana kucağı", "kanguru"],
    },
    {
      id: "ty-oyuncak",
      name: "Oyuncak & Eğitici Çocuk Setleri",
      department: "👶 Anne & Bebek",
      path: "Oyuncak & Hobi › Çocuk Oyuncakları",
      rate: 17.0,
      defaultDesi: 2.0,
      keywords: ["oyuncak", "lego", "bebek", "araba", "peluş", "puzzle", "eğitici oyun"],
    },

    // 9. Spor, Outdoor & Fitness
    {
      id: "ty-fitness-aletleri",
      name: "Fitness Aletleri, Dambıl & Ağırlık",
      department: "⚽ Spor & Outdoor",
      path: "Spor & Outdoor › Fitness Ekipmanları",
      rate: 16.5,
      defaultDesi: 8.0,
      keywords: ["dambıl", "ağırlık", "pilates", "yoga matı", "koşu bandı", "kondisyon bisikleti", "direnç bandı"],
    },
    {
      id: "ty-spor-giyim",
      name: "Spor Giyim, Eşofman & Tayt",
      department: "⚽ Spor & Outdoor",
      path: "Spor & Outdoor › Spor Giyim",
      rate: 20.0,
      defaultDesi: 1.0,
      keywords: ["spor giyim", "tayt", "eşofman", "forma", "sporcu sütyeni", "şort"],
    },
    {
      id: "ty-kamp-outdoor",
      name: "Kamp Çadırı, Termos & Doğa Sporları",
      department: "⚽ Spor & Outdoor",
      path: "Spor & Outdoor › Kamp & Doğa",
      rate: 17.0,
      defaultDesi: 4.0,
      keywords: ["çadır", "kamp", "termos", "uyku tulumu", "matara", "fener", "olta"],
    },

    // 10. Otomotiv & Motosiklet
    {
      id: "ty-oto-aksesuar",
      name: "Araç İçi Aksesuar, Paspas & Telefon Tutucu",
      department: "🚗 Otomotiv & Yapı",
      path: "Oto & Yapı Market › Araç Aksesuar",
      rate: 14.5,
      defaultDesi: 3.0,
      keywords: ["paspas", "bagaj havuzu", "telefon tutucu", "oto koltuk kılıfı", "branda", "güneşlik"],
    },
    {
      id: "ty-oto-bakim",
      name: "Oto Bakım, Şampuan, Cila & Motor Yağları",
      department: "🚗 Otomotiv & Yapı",
      path: "Oto & Yapı Market › Bakım & Kimyasallar",
      rate: 13.5,
      defaultDesi: 4.0,
      keywords: ["motor yağı", "oto şampuanı", "cila", "antifriz", "cam suyu", "seramik kaplama"],
    },
    {
      id: "ty-oto-lastik",
      name: "Oto Lastik & Jant",
      department: "🚗 Otomotiv & Yapı",
      path: "Oto › Lastik & Jant",
      rate: 9.5,
      defaultDesi: 10.0,
      keywords: ["lastik", "kış lastiği", "yaz lastiği", "4 mevsim", "jant"],
    },

    // 11. Süpermarket, Gıda & Petshop
    {
      id: "ty-kahve-icecek",
      name: "Kahve Çekirdeği, Çay & İçecekler",
      department: "🛒 Süpermarket & Petshop",
      path: "Süpermarket › İçecekler",
      rate: 12.0,
      defaultDesi: 1.5,
      keywords: ["çekirdek kahve", "filtre kahve", "çay", "türk kahvesi", "kapsül kahve", "yeşil çay"],
    },
    {
      id: "ty-petshop",
      name: "Evcil Hayvan Maması (Kedi / Köpek) & Kum",
      department: "🛒 Süpermarket & Petshop",
      path: "Petshop › Kedi & Köpek",
      rate: 15.0,
      defaultDesi: 6.0,
      keywords: ["kedi maması", "köpek maması", "kedi kumu", "yaş mama", "ödül maması", "tırmalama"],
    },
    {
      id: "ty-takviye-gida",
      name: "Takviye Edici Gıda, Vitamin & Protein Tozu",
      department: "🛒 Süpermarket & Petshop",
      path: "Sağlık & Medikal › Takviye Edici Gıda",
      rate: 14.0,
      defaultDesi: 1.0,
      keywords: ["kolajen", "protein tozu", "vitamin", "omega 3", "magnezyum", "creatine", "takviye"],
    },

    // 12. Takı, Saat & Aksesuar
    {
      id: "ty-taki-bijuteri",
      name: "Takı, Bijuteri, Kolye, Küpe & Yüzük",
      department: "💍 Takı, Saat & Mücevher",
      path: "Aksesuar › Takı & Bijuteri",
      rate: 23.0,
      defaultDesi: 0.3,
      keywords: ["kolye", "küpe", "yüzük", "bileklik", "halhal", "çelik takı", "küpe"],
    },
    {
      id: "ty-kol-saati",
      name: "Kol Saati & Güneş Gözlüğü",
      department: "💍 Takı, Saat & Mücevher",
      path: "Aksesuar › Saat & Gözlük",
      rate: 20.0,
      defaultDesi: 0.5,
      keywords: ["saat", "kol saati", "güneş gözlüğü", "gözlük"],
    },

    // 13. Yapı Market, Hırdavat & Bahçe
    {
      id: "ty-el-aletleri",
      name: "Matkap, Vidalama & Elektrikli El Aletleri",
      department: "🔨 Yapı Market & Hırdavat",
      path: "Yapı Market › Elektrikli Aletler",
      rate: 14.0,
      defaultDesi: 4.0,
      keywords: ["matkap", "vidalama", "şarjlı matkap", "taşlama", "takım çantası", "hırdavat"],
    },

    // 14. Kitap, Kırtasiye & Sanat
    {
      id: "ty-kitap",
      name: "Kitap, Roman & Eğitim Kitapları",
      department: "📚 Kitap, Kırtasiye & Hobi",
      path: "Kitap › Edebiyat & Sınav Kitapları",
      rate: 14.0,
      defaultDesi: 1.0,
      keywords: ["kitap", "roman", "edebiyat", "ders kitabı", "sözlük"],
    },
    {
      id: "ty-kirtasiye-hobi",
      name: "Kırtasiye, Defter & Resim Malzemeleri",
      department: "📚 Kitap, Kırtasiye & Hobi",
      path: "Kırtasiye & Ofis › Sanat Gereçleri",
      rate: 16.0,
      defaultDesi: 1.0,
      keywords: ["defter", "kalem", "boya", "fırça", "tuval", "ajanda", "ofis malzemesi"],
    },
  ],

  Hepsiburada: [
    // 1. Moda, Giyim & Tekstil
    {
      id: "hb-giyim-ust",
      name: "Kadın / Erkek Üst Giyim (Tişört, Gömlek, Kazak)",
      department: "👗 Moda & Giyim",
      path: "Moda › Giyim › Üst Giyim",
      rate: 22.0,
      defaultDesi: 1.0,
      keywords: ["tişört", "t-shirt", "gömlek", "kazak", "bluz", "sweatshirt"],
    },
    {
      id: "hb-giyim-alt",
      name: "Kadın / Erkek Alt Giyim (Pantolon, Jean, Etek)",
      department: "👗 Moda & Giyim",
      path: "Moda › Giyim › Alt Giyim",
      rate: 22.0,
      defaultDesi: 1.5,
      keywords: ["pantolon", "jean", "etek", "şort", "tayt"],
    },
    {
      id: "hb-elbise",
      name: "Elbise & Takım Elbise",
      department: "👗 Moda & Giyim",
      path: "Moda › Giyim › Elbise",
      rate: 22.5,
      defaultDesi: 1.5,
      keywords: ["elbise", "abiye", "takım elbise", "ceket"],
    },
    {
      id: "hb-dis-giyim",
      name: "Dış Giyim (Mont, Kaban, Trençkot)",
      department: "👗 Moda & Giyim",
      path: "Moda › Dış Giyim",
      rate: 22.0,
      defaultDesi: 3.0,
      keywords: ["mont", "kaban", "palto", "trençkot"],
    },
    {
      id: "hb-ic-giyim",
      name: "İç Giyim, Pijama & Çorap",
      department: "👗 Moda & Giyim",
      path: "Moda › İç Giyim",
      rate: 23.5,
      defaultDesi: 0.5,
      keywords: ["iç çamaşırı", "sütyen", "külot", "boxer", "pijama", "çorap"],
    },

    // 2. Ayakkabı & Çanta
    {
      id: "hb-spor-ayakkabi",
      name: "Spor Ayakkabı & Sneaker",
      department: "👟 Ayakkabı & Çanta",
      path: "Moda › Ayakkabı › Spor Ayakkabı",
      rate: 22.0,
      defaultDesi: 2.0,
      keywords: ["spor ayakkabı", "sneaker", "koşu"],
    },
    {
      id: "hb-canta-cuzdan",
      name: "Çanta, Sırt Çantası & Cüzdan",
      department: "👟 Ayakkabı & Çanta",
      path: "Moda › Çanta & Cüzdan",
      rate: 22.5,
      defaultDesi: 1.5,
      keywords: ["çanta", "sırt çantası", "cüzdan"],
    },

    // 3. Elektronik & Telefon
    {
      id: "hb-telefon-kilif",
      name: "Telefon Kılıfı & Ekran Koruyucu",
      department: "📱 Elektronik & Telefon",
      path: "Elektronik › Telefon Aksesuarları › Kılıf",
      rate: 20.0,
      defaultDesi: 0.5,
      keywords: ["kılıf", "ekran koruyucu", "kırılmaz cam"],
    },
    {
      id: "hb-sarj-kablo",
      name: "Şarj Cihazı, Kablo & Powerbank",
      department: "📱 Elektronik & Telefon",
      path: "Elektronik › Telefon Aksesuarları › Şarj",
      rate: 15.0,
      defaultDesi: 1.0,
      keywords: ["şarj", "kablo", "powerbank", "adaptör"],
    },
    {
      id: "hb-kulaklik",
      name: "Bluetooth Kulaklık & Hoparlör",
      department: "📱 Elektronik & Telefon",
      path: "Elektronik › Ses Sistemleri › Kulaklık",
      rate: 11.0,
      defaultDesi: 1.0,
      keywords: ["kulaklık", "hoparlör", "bluetooth"],
    },
    {
      id: "hb-akilli-saat",
      name: "Akıllı Saat & Bileklik",
      department: "📱 Elektronik & Telefon",
      path: "Elektronik › Akıllı Saat",
      rate: 11.5,
      defaultDesi: 0.5,
      keywords: ["akıllı saat", "smart watch", "bileklik"],
    },

    // 4. Küçük Ev Aletleri
    {
      id: "hb-kahve-makinesi",
      name: "Kahve & Çay Makineleri",
      department: "☕ Küçük Ev Aletleri",
      path: "Elektronik › Küçük Ev Aletleri › Kahve & Çay",
      rate: 13.0,
      defaultDesi: 4.0,
      keywords: ["kahve makinesi", "çay makinesi", "espresso", "filtre"],
    },
    {
      id: "hb-blender-mutfak",
      name: "Blender, Mikser & Tost Makinesi",
      department: "☕ Küçük Ev Aletleri",
      path: "Elektronik › Mutfak Hazırlık",
      rate: 13.0,
      defaultDesi: 3.5,
      keywords: ["blender", "mikser", "tost makinesi", "rondo"],
    },
    {
      id: "hb-airfryer",
      name: "Airfryer (Sıcak Hava Fritözü)",
      department: "☕ Küçük Ev Aletleri",
      path: "Elektronik › Fritözler",
      rate: 13.0,
      defaultDesi: 6.0,
      keywords: ["airfryer", "fritöz"],
    },
    {
      id: "hb-supurge",
      name: "Robot Süpürge & Dikey Süpürgeler",
      department: "☕ Küçük Ev Aletleri",
      path: "Elektronik › Süpürgeler",
      rate: 12.5,
      defaultDesi: 7.0,
      keywords: ["robot süpürge", "süpürge", "dikey süpürge"],
    },

    // 5. Ev, Yaşam & Sofra
    {
      id: "hb-tencere-tava",
      name: "Tencere, Tava & Pişirme Setleri",
      department: "🍳 Ev, Yaşam & Mutfak",
      path: "Ev & Mutfak › Tencere Tava",
      rate: 18.5,
      defaultDesi: 5.0,
      keywords: ["tencere", "tava", "döküm tava", "düdüklü"],
    },
    {
      id: "hb-sofra",
      name: "Yemek Takımı, Bardak & Sofra",
      department: "🍳 Ev, Yaşam & Mutfak",
      path: "Ev & Mutfak › Sofra",
      rate: 18.5,
      defaultDesi: 6.0,
      keywords: ["yemek takımı", "bardak", "tabak", "kupa"],
    },
    {
      id: "hb-ev-tekstili",
      name: "Ev Tekstili (Nevresim, Yorgan, Yastık)",
      department: "🍳 Ev, Yaşam & Mutfak",
      path: "Ev & Yaşam › Ev Tekstili",
      rate: 18.5,
      defaultDesi: 3.5,
      keywords: ["nevresim", "yorgan", "yastık", "battaniye", "havlu"],
    },

    // 6. Kozmetik & Kişisel Bakım
    {
      id: "hb-parfum",
      name: "Parfüm & Deodorant",
      department: "💄 Kozmetik & Bakım",
      path: "Kozmetik › Parfüm",
      rate: 17.0,
      defaultDesi: 0.8,
      keywords: ["parfüm", "deodorant", "kolonya"],
    },
    {
      id: "hb-cilt-bakim",
      name: "Cilt Bakım Serum & Nemlendirici",
      department: "💄 Kozmetik & Bakım",
      path: "Kozmetik › Cilt Bakımı",
      rate: 17.0,
      defaultDesi: 0.5,
      keywords: ["serum", "krem", "nemlendirici", "güneş kremi"],
    },
    {
      id: "hb-makyaj",
      name: "Makyaj Ürünleri (Ruj, Fondöten, Maskara)",
      department: "💄 Kozmetik & Bakım",
      path: "Kozmetik › Makyaj",
      rate: 17.5,
      defaultDesi: 0.5,
      keywords: ["ruj", "fondöten", "maskara", "far"],
    },

    // 7. Anne, Bebek & Petshop
    {
      id: "hb-bebek-bezi",
      name: "Bebek Bezi & Islak Mendil",
      department: "👶 Anne & Bebek",
      path: "Anne & Bebek › Bebek Bezi",
      rate: 14.0,
      defaultDesi: 4.0,
      keywords: ["bebek bezi", "ıslak mendil"],
    },
    {
      id: "hb-petshop",
      name: "Kedi / Köpek Maması & Petshop",
      department: "🛒 Süpermarket & Petshop",
      path: "Petshop › Kedi & Köpek",
      rate: 15.5,
      defaultDesi: 6.0,
      keywords: ["kedi maması", "köpek maması", "kedi kumu", "mama"],
    },
    {
      id: "hb-takviye",
      name: "Takviye Edici Gıda & Vitamin",
      department: "🛒 Süpermarket & Petshop",
      path: "Sağlık › Takviye Gıda",
      rate: 14.5,
      defaultDesi: 1.0,
      keywords: ["kolajen", "vitamin", "protein tozu", "omega 3"],
    },
  ],

  "Amazon TR": [
    // 1. Moda, Giyim & Ayakkabı
    {
      id: "az-giyim",
      name: "Kadın / Erkek Giyim (Tişört, Pantolon, Elbise)",
      department: "👗 Moda & Giyim",
      path: "Giyim & Aksesuar › Genel Giyim",
      rate: 15.0,
      defaultDesi: 1.0,
      keywords: ["tişört", "pantolon", "elbise", "gömlek", "kazak", "mont"],
    },
    {
      id: "az-ayakkabi-canta",
      name: "Ayakkabı, Spor Ayakkabı & Çantalar",
      department: "👟 Ayakkabı & Çanta",
      path: "Ayakkabı & Çanta",
      rate: 15.0,
      defaultDesi: 2.0,
      keywords: ["ayakkabı", "sneaker", "çanta", "sırt çantası", "bot"],
    },

    // 2. Elektronik & Aksesuar
    {
      id: "az-elektronik-aksesuar",
      name: "Telefon Kılıfları, Şarj Aletleri & Aksesuar",
      department: "📱 Elektronik & Telefon",
      path: "Elektronik › Telefon Aksesuarları",
      rate: 15.0,
      defaultDesi: 0.5,
      keywords: ["kılıf", "şarj", "kablo", "ekran koruyucu", "powerbank"],
    },
    {
      id: "az-kulaklik",
      name: "Kulaklık, Hoparlör & Ses Cihazları",
      department: "📱 Elektronik & Telefon",
      path: "Elektronik › Ses & Kulaklık",
      rate: 10.0,
      defaultDesi: 1.0,
      keywords: ["kulaklık", "bluetooth", "hoparlör"],
    },
    {
      id: "az-bilgisayar",
      name: "Bilgisayar, Laptop & Çevre Birimleri (Klavye, Mouse)",
      department: "💻 Bilgisayar & Ofis",
      path: "Bilgisayar & Aksesuarları",
      rate: 7.5,
      defaultDesi: 2.5,
      keywords: ["laptop", "klavye", "mouse", "bilgisayar", "monitör"],
    },

    // 3. Küçük Ev Aletleri & Mutfak
    {
      id: "az-kucuk-ev-aletleri",
      name: "Küçük Mutfak Aletleri (Kahve Makinesi, Blender, Airfryer)",
      department: "☕ Küçük Ev Aletleri",
      path: "Ev & Mutfak › Elektrikli Ev Aletleri",
      rate: 10.5,
      defaultDesi: 4.0,
      keywords: ["kahve makinesi", "blender", "airfryer", "tost makinesi", "çay makinesi"],
    },
    {
      id: "az-supurge",
      name: "Robot Süpürgeler & Elektrikli Süpürge",
      department: "☕ Küçük Ev Aletleri",
      path: "Ev & Mutfak › Süpürgeler",
      rate: 10.0,
      defaultDesi: 7.0,
      keywords: ["robot süpürge", "süpürge", "dikey süpürge"],
    },
    {
      id: "az-mutfak-gerecleri",
      name: "Tencere, Tava & Sofra Gereçleri",
      department: "🍳 Ev, Yaşam & Mutfak",
      path: "Ev & Mutfak › Mutfak Eşyaları",
      rate: 15.0,
      defaultDesi: 5.0,
      keywords: ["tencere", "tava", "bardak", "tabak", "çatal bıçak"],
    },
    {
      id: "az-ev-tekstili",
      name: "Ev Tekstili, Yatak & Banyo",
      department: "🍳 Ev, Yaşam & Mutfak",
      path: "Ev & Mutfak › Ev Tekstili",
      rate: 15.0,
      defaultDesi: 3.0,
      keywords: ["nevresim", "yorgan", "yastık", "havlu"],
    },

    // 4. Güzellik, Kişisel Bakım & Sağlık
    {
      id: "az-guzellik-kozmetik",
      name: "Kozmetik, Parfüm & Cilt Bakımı",
      department: "💄 Kozmetik & Bakım",
      path: "Kişisel Bakım & Kozmetik",
      rate: 12.0,
      defaultDesi: 0.8,
      keywords: ["parfüm", "serum", "krem", "ruj", "şampuan", "nemlendirici"],
    },

    // 5. Bebek, Spor & Petshop
    {
      id: "az-bebek",
      name: "Bebek Ürünleri, Bez & Mama",
      department: "👶 Anne & Bebek",
      path: "Bebek Ürünleri",
      rate: 11.0,
      defaultDesi: 3.5,
      keywords: ["bebek bezi", "bebek", "biberon", "puset"],
    },
    {
      id: "az-spor-outdoor",
      name: "Spor, Fitness & Kamp Malzemeleri",
      department: "⚽ Spor & Outdoor",
      path: "Spor & Doğa",
      rate: 13.0,
      defaultDesi: 4.0,
      keywords: ["dambıl", "fitness", "çadır", "termos", "mat"],
    },
    {
      id: "az-petshop",
      name: "Evcil Hayvan Ürünleri & Mama",
      department: "🛒 Süpermarket & Petshop",
      path: "Evcil Hayvan Malzemeleri",
      rate: 12.0,
      defaultDesi: 5.0,
      keywords: ["kedi maması", "köpek maması", "kedi kumu"],
    },
    {
      id: "az-kitap",
      name: "Kitap & Basılı Eserler",
      department: "📚 Kitap, Kırtasiye & Sanat",
      path: "Kitap",
      rate: 10.0,
      defaultDesi: 1.0,
      keywords: ["kitap", "roman", "edebiyat"],
    },
  ],

  N11: [
    // 1. Moda & Tekstil
    {
      id: "n11-giyim",
      name: "Kadın / Erkek Giyim & Dış Giyim",
      department: "👗 Moda & Giyim",
      path: "Giyim & Ayakkabı › Giyim",
      rate: 20.5,
      defaultDesi: 1.5,
      keywords: ["tişört", "pantolon", "elbise", "mont", "gömlek", "kazak"],
    },
    {
      id: "n11-ayakkabi-canta",
      name: "Ayakkabı, Sneaker & Çanta",
      department: "👟 Ayakkabı & Çanta",
      path: "Giyim & Ayakkabı › Ayakkabı & Çanta",
      rate: 21.0,
      defaultDesi: 2.0,
      keywords: ["spor ayakkabı", "ayakkabı", "çanta", "cüzdan", "bot"],
    },

    // 2. Elektronik
    {
      id: "n11-telefon-aksesuar",
      name: "Telefon Kılıfları & Ekran Koruyucular",
      department: "📱 Elektronik & Telefon",
      path: "Elektronik › Telefon Aksesuarı",
      rate: 17.5,
      defaultDesi: 0.5,
      keywords: ["kılıf", "ekran koruyucu", "şarj", "kablo"],
    },
    {
      id: "n11-kulaklik",
      name: "Kulaklık & Ses Sistemleri",
      department: "📱 Elektronik & Telefon",
      path: "Elektronik › Kulaklık",
      rate: 11.0,
      defaultDesi: 1.0,
      keywords: ["kulaklık", "hoparlör", "bluetooth"],
    },

    // 3. Ev & Küçük Ev Aletleri
    {
      id: "n11-kucuk-ev-aletleri",
      name: "Küçük Ev Aletleri & Kahve Makineleri",
      department: "☕ Küçük Ev Aletleri",
      path: "Elektrikli Ev Aletleri › Mutfak",
      rate: 14.0,
      defaultDesi: 4.0,
      keywords: ["kahve makinesi", "blender", "tost makinesi", "airfryer", "çay makinesi"],
    },
    {
      id: "n11-supurge",
      name: "Robot Süpürgeler & Dikey Süpürge",
      department: "☕ Küçük Ev Aletleri",
      path: "Elektrikli Ev Aletleri › Süpürge",
      rate: 13.0,
      defaultDesi: 7.0,
      keywords: ["robot süpürge", "süpürge", "dikey süpürge"],
    },
    {
      id: "n11-ev-mutfak",
      name: "Tencere, Tava & Sofra Eşyaları",
      department: "🍳 Ev, Yaşam & Mutfak",
      path: "Ev & Yaşam › Mutfak",
      rate: 17.5,
      defaultDesi: 5.0,
      keywords: ["tencere", "tava", "bardak", "tabak"],
    },
    {
      id: "n11-ev-tekstili",
      name: "Ev Tekstili (Nevresim, Yastık, Yorgan)",
      department: "🍳 Ev, Yaşam & Mutfak",
      path: "Ev & Yaşam › Ev Tekstili",
      rate: 17.5,
      defaultDesi: 3.5,
      keywords: ["nevresim", "yastık", "yorgan", "havlu"],
    },

    // 4. Kozmetik & Kişisel Bakım
    {
      id: "n11-kozmetik",
      name: "Parfüm, Cilt Bakımı & Makyaj",
      department: "💄 Kozmetik & Bakım",
      path: "Kozmetik & Kişisel Bakım",
      rate: 16.5,
      defaultDesi: 0.8,
      keywords: ["parfüm", "serum", "krem", "ruj", "şampuan"],
    },

    // 5. Anne & Bebek & Petshop
    {
      id: "n11-bebek",
      name: "Bebek Bezi & Bebek Bakımı",
      department: "👶 Anne & Bebek",
      path: "Anne & Bebek › Bebek Bezi",
      rate: 14.5,
      defaultDesi: 4.0,
      keywords: ["bebek bezi", "ıslak mendil", "bebek arabası"],
    },
    {
      id: "n11-petshop",
      name: "Kedi / Köpek Maması & Petshop",
      department: "🛒 Süpermarket & Petshop",
      path: "Petshop › Kedi & Köpek",
      rate: 15.0,
      defaultDesi: 6.0,
      keywords: ["kedi maması", "köpek maması", "kedi kumu"],
    },
    {
      id: "n11-spor",
      name: "Spor, Fitness & Outdoor Ekipmanları",
      department: "⚽ Spor & Outdoor",
      path: "Spor & Outdoor",
      rate: 16.0,
      defaultDesi: 4.0,
      keywords: ["dambıl", "fitness", "çadır", "mat"],
    },
  ],
};

// Metin ve anahtar kelimelere göre en uygun kategoriyi otomatik bulan zeki eşleştirici
export function findBestCategoryMatch(
  text: string,
  marketplace: MarketplaceType
): MarketplaceCategory {
  const categories = MARKETPLACE_CATEGORIES[marketplace] || MARKETPLACE_CATEGORIES.Trendyol;
  const clean = text.toLowerCase().trim();

  // 1. Anahtar kelime tam veya kısmi eşleşmesi (Puanlama sistemi)
  let bestMatch: MarketplaceCategory = categories[0];
  let highestScore = 0;

  for (const cat of categories) {
    let score = 0;

    // Kategori adında geçiyor mu?
    const catWords = cat.name.toLowerCase().split(/[ ,/()]+/);
    for (const w of catWords) {
      if (w.length >= 3 && clean.includes(w)) {
        score += 5;
      }
    }

    // Anahtar kelimelerde geçiyor mu?
    for (const kw of cat.keywords) {
      if (clean.includes(kw.toLowerCase())) {
        score += 10;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = cat;
    }
  }

  return bestMatch;
}
