"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown, Check, Layers, Percent, X } from "lucide-react";
import {
  MarketplaceCategory,
  MarketplaceType,
  MARKETPLACE_CATEGORIES,
} from "@/data/marketplaceCategories";

interface CategoryComboboxProps {
  marketplace: MarketplaceType;
  selectedCategoryName: string;
  onSelectCategory: (category: MarketplaceCategory) => void;
  className?: string;
}

export default function CategoryCombobox({
  marketplace,
  selectedCategoryName,
  onSelectCategory,
  className = "",
}: CategoryComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Seçili pazaryerine ait kategoriler
  const categories = useMemo(() => {
    return MARKETPLACE_CATEGORIES[marketplace] || MARKETPLACE_CATEGORIES.Trendyol;
  }, [marketplace]);

  // Aktif seçili kategori nesnesi
  const currentCategory = useMemo(() => {
    return (
      categories.find((c) => c.name.toLowerCase() === selectedCategoryName.toLowerCase()) ||
      categories[0]
    );
  }, [categories, selectedCategoryName]);

  // Arama filtresi
  const filteredCategories = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return categories;

    return categories.filter((c) => {
      const matchName = c.name.toLowerCase().includes(q);
      const matchDept = c.department.toLowerCase().includes(q);
      const matchPath = c.path.toLowerCase().includes(q);
      const matchKeywords = c.keywords.some((kw) => kw.toLowerCase().includes(q));
      return matchName || matchDept || matchPath || matchKeywords;
    });
  }, [categories, searchTerm]);

  // Kategorileri Ana Sektöre (Department) göre grupla
  const groupedCategories = useMemo(() => {
    const groups: Record<string, MarketplaceCategory[]> = {};
    for (const cat of filteredCategories) {
      if (!groups[cat.department]) {
        groups[cat.department] = [];
      }
      groups[cat.department].push(cat);
    }
    return groups;
  }, [filteredCategories]);

  // Dışarı tıklama dinleyicisi
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (cat: MarketplaceCategory) => {
    onSelectCategory(cat);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Tetikleyici Kutu (Tıklanabilir ve Yazılabilir) */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
        className="w-full text-left px-3 py-2 bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white flex items-center justify-between gap-2 hover:border-emerald-500 focus:outline-none transition shadow-2xs cursor-pointer group"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Layers className="w-4 h-4 text-emerald-500 shrink-0" />
          <div className="truncate">
            <span className="text-xs font-bold block truncate">
              {currentCategory.name}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
              {currentCategory.department}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-black px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
            %{currentCategory.rate}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-emerald-500" : ""
            }`}
          />
        </div>
      </button>

      {/* Açılır Arama & Kategori Menüsü */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-80 flex flex-col">
          {/* Arama Input Alanı */}
          <div className="p-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 sticky top-0 z-10 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Kategori veya ürün tipi ara (örn: kılıf, kahve, ayakkabı)..."
              className="w-full bg-transparent text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Kategori Listesi (Departmanlara Göre Gruplu) */}
          <div className="p-1.5 overflow-y-auto space-y-3 text-xs scrollbar-thin">
            {Object.keys(groupedCategories).length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-xs">
                "{searchTerm}" ile eşleşen kategori bulunamadı.
              </div>
            ) : (
              Object.entries(groupedCategories).map(([dept, catList]) => (
                <div key={dept} className="space-y-0.5">
                  {/* Departman Başlığı */}
                  <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100/60 dark:bg-slate-800/40 rounded-lg">
                    {dept}
                  </div>

                  {/* Kategori Öğeleri */}
                  {catList.map((c) => {
                    const isSelected =
                      c.name.toLowerCase() === currentCategory.name.toLowerCase();
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelect(c)}
                        className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between gap-3 transition cursor-pointer ${
                          isSelected
                            ? "bg-emerald-500/15 text-emerald-900 dark:text-emerald-300 font-bold border border-emerald-500/30"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-xs truncate">
                            {c.name}
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                            {c.path}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`text-[11px] font-black px-2 py-0.5 rounded-lg border ${
                              isSelected
                                ? "bg-emerald-600 text-white border-emerald-500"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            %{c.rate}
                          </span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
