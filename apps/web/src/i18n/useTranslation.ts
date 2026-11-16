"use client";

import { useState, useEffect } from "react";
import { translations, Language } from "./translations";
import { safeLocalStorage } from "@/lib/safariFixes";

export function useTranslation() {
  const [lang, setLang] = useState<Language>("TR");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = safeLocalStorage.getItem("urunbul_lang") as Language;
      if (saved && (saved === "TR" || saved === "EN")) {
        setLang(saved);
      }
    }

    const handleLangChange = (e: any) => {
      const newLang = e?.detail || (safeLocalStorage.getItem("urunbul_lang") as Language);
      if (newLang && (newLang === "TR" || newLang === "EN")) {
        setLang(newLang);
      }
    };

    window.addEventListener("urunbul_lang_change", handleLangChange);
    window.addEventListener("languagechange", handleLangChange);

    return () => {
      window.removeEventListener("urunbul_lang_change", handleLangChange);
      window.removeEventListener("languagechange", handleLangChange);
    };
  }, []);

  const changeLanguage = (newLang: Language) => {
    setLang(newLang);
    if (typeof window !== "undefined") {
      safeLocalStorage.setItem("urunbul_lang", newLang);
      window.dispatchEvent(new CustomEvent("urunbul_lang_change", { detail: newLang }));
      window.dispatchEvent(new Event("languagechange"));
    }
  };

  return {
    lang,
    t: translations[lang],
    changeLanguage,
  };
}
