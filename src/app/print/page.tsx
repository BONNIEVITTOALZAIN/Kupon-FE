'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Kupon } from '@/types/kupon';
import { Printer, ChevronLeft, Loader2, Sparkles } from 'lucide-react';
import QRCode from 'qrcode';

export default function PrintPage() {
  const { getToken } = useAuth();
  const [kupons, setKupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentYearM = new Date().getFullYear();
  const currentYearH = currentYearM - 579;

  useEffect(() => {
    const fetchAndGenerateQR = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getToken();
        // Fetch all coupons (using large limit to retrieve all for printing)
        const response = await api.getKupons(token, { page: 1, limit: 1000 });

        // Generate QR codes using client-side qrcode library
        const kuponsWithQR = await Promise.all(
          response.kupons.map(async (kupon: Kupon) => {
            const qrDataUrl = await QRCode.toDataURL(kupon.kode, {
              width: 150,
              margin: 1,
              errorCorrectionLevel: 'M',
            });
            return { ...kupon, qrDataUrl };
          })
        );

        setKupons(kuponsWithQR);
      } catch (err: any) {
        setError(err.message || 'Gagal mengambil data kupon untuk dicetak.');
      } finally {
        setLoading(false);
      }
    };

    fetchAndGenerateQR();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
        <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Menyiapkan halaman print kupon...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 print:bg-white print:text-black">
      {/* Non-Printable Header Control Panel */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-40 flex items-center justify-between shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/kupons"
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-500 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-md font-black text-slate-800 dark:text-white flex items-center gap-2">
              Print Preview Kupon Qurban
              <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded">
                A4 Optimasi
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold">Total siap cetak: {kupons.length} kupon</p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          Cetak Sekarang
        </button>
      </header>

      {/* printable viewport container */}
      <main className="max-w-[210mm] mx-auto p-4 sm:p-8 print:p-0">
        {error ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-sm font-semibold">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-2 print:gap-3">
            {kupons.map((kupon) => (
              <div
                key={kupon.id}
                className="bg-white text-slate-900 border-2 border-slate-900 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden aspect-[8/5] break-inside-avoid print:break-inside-avoid print:shadow-none print:border-slate-800"
              >
                {/* Visual Top Accent Indicator */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500" />

                {/* Header of the premium voucher */}
                <div className="flex items-center justify-between border-b border-dashed border-slate-300 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🕌</span>
                    <div>
                      <h2 className="text-xs font-black tracking-widest text-emerald-600 uppercase">
                        KUPON QURBAN
                      </h2>
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                        Mushola Al-Mubarokah
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-slate-800 dark:text-slate-800 uppercase tracking-widest block">
                      {currentYearH} H / {currentYearM} M
                    </span>
                  </div>
                </div>

                {/* Content body of the coupon */}
                <div className="flex-1 flex items-center justify-between gap-4 py-2.5">
                  {/* Left Side Metadata */}
                  <div className="flex-1 space-y-2">
                    <div>
                      <span className="text-[8px] text-slate-400 font-black block uppercase tracking-wider">
                        Nomor Kupon
                      </span>
                      <span className="text-lg font-black text-slate-900 leading-none">
                        #{kupon.nomor}
                      </span>
                    </div>

                    {kupon.tipe === 'extra' ? (
                      <div className="inline-flex items-center gap-1 bg-amber-500 text-white font-black text-sm tracking-widest px-3 py-1 rounded-lg shadow-sm">
                        <Sparkles className="w-3.5 h-3.5" />
                        EXTRA
                      </div>
                    ) : (
                      <div>
                        <span className="text-[8px] text-slate-400 font-black block uppercase tracking-wider">
                          Nama Penerima
                        </span>
                        <span className="text-xs font-bold text-slate-800 block truncate max-w-[130px]">
                          {kupon.nama}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[7px] text-slate-400 font-black block uppercase tracking-wider">
                        Tipe
                      </span>
                      <span className="px-1.5 py-0.2 bg-slate-100 border border-slate-200 rounded text-[7px] font-black text-slate-500 uppercase tracking-wide">
                        {kupon.tipe}
                      </span>
                    </div>
                  </div>

                  {/* Right Side: QR Code Area */}
                  <div className="flex flex-col items-center justify-center flex-shrink-0 text-center space-y-1">
                    {kupon.qrDataUrl ? (
                      <img
                        src={kupon.qrDataUrl}
                        alt="QR Code"
                        className="w-20 h-20 border border-slate-200 p-0.5 rounded-lg bg-white"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-slate-100 rounded-lg animate-pulse" />
                    )}
                    <span className="text-[7px] font-mono font-bold text-slate-400 block tracking-widest">
                      {kupon.kode}
                    </span>
                  </div>
                </div>

                {/* Footer Warning Terms */}
                <div className="border-t border-dashed border-slate-350 pt-2 flex items-center justify-between text-[7px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>SISTEM QR KUPON QURBAN</span>
                  <span className="text-rose-500 font-black">⚠ Scan hanya 1x</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
