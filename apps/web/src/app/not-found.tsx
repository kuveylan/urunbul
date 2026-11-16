import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#fcfcfd] text-center">
      <h2 className="text-2xl font-black text-slate-900">404 - Sayfa Bulunamadı</h2>
      <p className="text-xs text-slate-500 mt-2">Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
      <Link
        href="/"
        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
