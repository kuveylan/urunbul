"use client";

import React from "react";

// Alışveriş ve Kârı Destekleyen Sade & Minimalist Vektörel Logo (Çanta + Büyüme Trend Oku)
export function AppLogoIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Alışveriş Çantası Konturu */}
      <path d="M6 8h12l1.2 11.5A2 2 0 0 1 17.2 22H6.8a2 2 0 0 1-2-2.5L6 8z" />
      {/* Çanta Tutma Sapı */}
      <path d="M9 8V5a3 3 0 0 1 6 0v3" />
      {/* Kâr ve Büyüme Trend Oku */}
      <path d="M8.5 15.5l2.8-2.8 2 2 3.7-3.7" />
      <path d="M14.5 11h2.5v2.5" />
    </svg>
  );
}

interface AppBrandLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  showSubtitle?: boolean;
  subtitleText?: string;
  className?: string;
}

export default function AppBrandLogo({
  size = "md",
  showText = true,
  showSubtitle = false,
  subtitleText = "Türkiye Pazaryerleri İstihbarat Platformu",
  className = "",
}: AppBrandLogoProps) {
  const sizeMap = {
    sm: {
      box: "w-7 h-7 rounded-lg",
      icon: "w-4 h-4 stroke-[2.2]",
      text: "text-sm",
    },
    md: {
      box: "w-8 h-8 rounded-lg",
      icon: "w-4.5 h-4.5 stroke-[2.3]",
      text: "text-base",
    },
    lg: {
      box: "w-10 h-10 rounded-xl",
      icon: "w-5.5 h-5.5 stroke-[2.4]",
      text: "text-xl",
    },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* İkon Kutusu - Zümrüt Yeşili & Turkuaz Gradyan */}
      <div
        className={`${currentSize.box} bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black shadow-md shadow-emerald-500/20 shrink-0`}
      >
        <AppLogoIcon className={`${currentSize.icon} text-white`} />
      </div>

      {/* Metin & Slogan */}
      {showText && (
        <div>
          <div
            className={`font-black ${currentSize.text} tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5`}
          >
            <span>ÜrünBul</span>
          </div>
          {showSubtitle && (
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 -mt-0.5 hidden sm:block">
              {subtitleText}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
