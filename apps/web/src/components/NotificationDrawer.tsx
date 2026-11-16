"use client";

import React, { useState, useEffect } from "react";
import { Bell, X, TrendingDown, Zap, Store, Sparkles, Check, AlertTriangle } from "lucide-react";
import { apiUrl } from "@/lib/api";

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  timestamp: string;
  is_read: boolean;
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch(apiUrl("/api/v1/notifications"))
        .then((res) => {
          if (!res.ok) throw new Error("Bildirimler alınamadı");
          return res.json();
        })
        .then((data) => setNotifications(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const formatTimestamp = (ts: string) => {
    if (!ts) return "";
    if (ts.includes("önce") || ts.includes("ago") || isNaN(Date.parse(ts))) {
      return ts;
    }
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-sm h-full shadow-2xl p-5 flex flex-col justify-between border-l border-slate-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Pazar & Fiyat Bildirimleri</h3>
                <span className="text-[11px] text-slate-500">Canlı Pazar Alarmları</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Liste */}
          <div className="mt-4 space-y-2.5 overflow-y-auto max-h-[80vh]">
            {loading ? (
              <div className="text-center py-8 text-xs text-slate-400">Bildirimler alınıyor...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Yeni bir bildiriminiz bulunmuyor.
              </div>
            ) : (
              notifications.map((n) => {
                const isBuyboxLost = n.type === "BUYBOX_LOST";
                const isPriceDrop = n.type === "PRICE_DROP";
                return (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isBuyboxLost
                        ? "border-rose-300 bg-rose-50/70 shadow-xs"
                        : isPriceDrop
                        ? "border-emerald-300 bg-emerald-50/70"
                        : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {isBuyboxLost ? (
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        ) : isPriceDrop ? (
                          <TrendingDown className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                        )}
                        <h4 className={`text-xs font-bold ${isBuyboxLost ? "text-rose-900" : isPriceDrop ? "text-emerald-900" : "text-slate-900"}`}>
                          {n.title}
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0">
                        {formatTimestamp(n.timestamp)}
                      </span>
                    </div>
                    <p className={`text-xs mt-1.5 ${isBuyboxLost ? "text-rose-800" : isPriceDrop ? "text-emerald-800" : "text-slate-600"}`}>
                      {n.message}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
