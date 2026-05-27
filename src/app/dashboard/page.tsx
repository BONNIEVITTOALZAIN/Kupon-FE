'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { StatsInfo } from '@/types/kupon';
import {
  Ticket,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  RotateCw,
  AlertTriangle,
} from 'lucide-react';

export default function DashboardPage() {
  const { getToken } = useAuth();
  const [stats, setStats] = useState<StatsInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const data = await api.getStats(token);
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data statistik.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Compute values for standard progress/charts
  const total = stats?.total || 0;
  const sudah = stats?.sudah || 0;
  const persenSudah = total > 0 ? Math.round((sudah / total) * 100) : 0;
  const terdaftar = stats?.terdaftar || 0;
  const extra = stats?.extra || 0;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white">
              Ringkasan Dashboard
            </h1>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Pantau distribusi hewan qurban secara real-time.
            </p>
          </div>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 cursor-pointer text-slate-700 dark:text-slate-200"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Perbarui
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-semibold flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Kupon */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 dark:bg-emerald-500/2 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total Kupon
                </p>
                {loading ? (
                  <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-2" />
                ) : (
                  <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1">
                    {total}
                  </h3>
                )}
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Ticket className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold mr-1.5">{terdaftar}</span>
              kupon terdaftar &middot;
              <span className="text-amber-500 font-bold ml-1.5 mr-1.5">{extra}</span>
              extra
            </div>
          </div>

          {/* Card 2: Sudah Diambil */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 dark:bg-teal-500/2 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Sudah Diambil
                </p>
                {loading ? (
                  <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-2" />
                ) : (
                  <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1">
                    {sudah}
                  </h3>
                )}
              </div>
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-1.5">
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-teal-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${persenSudah}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>PROGRESS PENGAMBILAN</span>
                <span>{persenSudah}%</span>
              </div>
            </div>
          </div>

          {/* Card 3: Belum Diambil */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 dark:bg-rose-500/2 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Belum Diambil
                </p>
                {loading ? (
                  <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-2" />
                ) : (
                  <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1">
                    {stats?.belum || 0}
                  </h3>
                )}
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-slate-500 dark:text-slate-400 font-medium">
              Menunggu antrean & scan QR code kupon
            </div>
          </div>

          {/* Card 4: Kupon Extra */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 dark:bg-amber-500/2 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Kupon Extra
                </p>
                {loading ? (
                  <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-2" />
                ) : (
                  <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1">
                    {extra}
                  </h3>
                )}
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-slate-500 dark:text-slate-400 font-medium">
              Untuk penerima mendadak/tambahan
            </div>
          </div>
        </div>

        {/* Charts & Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visual Chart - 2 cols */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-lg font-black text-slate-800 dark:text-white">
                  Distribusi Kumulatif
                </h3>
              </div>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold px-2 py-1 rounded">
                REAL-TIME DATA
              </span>
            </div>

            {/* Custom Interactive SVG Chart representating Coupon flow */}
            <div className="relative flex-1 min-h-[220px] flex items-end justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-12 sm:w-16 bg-slate-100 dark:bg-slate-800/50 rounded-t-lg h-36 flex items-end overflow-hidden relative">
                      <div className="bg-gradient-to-t from-emerald-600 to-emerald-500 w-full h-full rounded-t-lg" />
                      <span className="absolute bottom-2 text-white font-extrabold text-xs text-center w-full">
                        {terdaftar}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-2 text-center">
                      TERDAFTAR
                    </span>
                  </div>

                  <div className="flex flex-col items-center flex-1">
                    <div className="w-12 sm:w-16 bg-slate-100 dark:bg-slate-800/50 rounded-t-lg h-36 flex items-end overflow-hidden relative">
                      <div className="bg-gradient-to-t from-amber-500 to-amber-400 w-full h-[60px] rounded-t-lg" />
                      <span className="absolute bottom-2 text-white font-extrabold text-xs text-center w-full">
                        {extra}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-2 text-center">
                      EXTRA
                    </span>
                  </div>

                  <div className="flex flex-col items-center flex-1">
                    <div className="w-12 sm:w-16 bg-slate-100 dark:bg-slate-800/50 rounded-t-lg h-36 flex items-end overflow-hidden relative">
                      <div className="bg-gradient-to-t from-teal-500 to-teal-400 w-full" style={{ height: `${persenSudah}%` }} />
                      <span className="absolute bottom-2 text-white font-extrabold text-xs text-center w-full">
                        {sudah}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-2 text-center">
                      DIAMBIL
                    </span>
                  </div>

                  <div className="flex flex-col items-center flex-1">
                    <div className="w-12 sm:w-16 bg-slate-100 dark:bg-slate-800/50 rounded-t-lg h-36 flex items-end overflow-hidden relative">
                      <div className="bg-gradient-to-t from-slate-400 to-slate-300 dark:from-slate-700 dark:to-slate-600 w-full" style={{ height: `${100 - persenSudah}%` }} />
                      <span className="absolute bottom-2 text-white font-extrabold text-xs text-center w-full">
                        {total - sudah}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-2 text-center">
                      SISA ANTRIAN
                    </span>
                  </div>
                </>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Distribusi Hewan Qurban Dimulai</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Validated</span>
            </div>
          </div>

          {/* Recent Activity Scans */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex flex-col">
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4">
              Scans Terkini
            </h3>
            {loading ? (
              <div className="space-y-4 flex-1">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                      <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !stats?.recentActivity || stats.recentActivity.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <span className="text-4xl mb-2">📥</span>
                <p className="text-xs font-bold">Belum ada scan kupon qurban yang sukses dilakukan hari ini.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[260px]">
                {stats.recentActivity.map((kupon) => (
                  <div
                    key={kupon.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold flex-shrink-0">
                        {kupon.tipe === 'extra' ? 'EX' : 'KP'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-slate-800 dark:text-slate-200 truncate">
                          {kupon.nama}
                        </p>
                        <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold truncate">
                          {kupon.kode} &middot; No. {kupon.nomor} {kupon.scanned_by && ` &middot; 👤 ${kupon.scanned_by.split('@')[0]}`}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-extrabold bg-teal-50 dark:bg-teal-950/20 px-2 py-1 rounded flex-shrink-0">
                      {kupon.used_at ? new Date(kupon.used_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <a
              href="/scanner"
              className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 py-2.5 rounded-xl border border-dashed border-emerald-500/20 hover:bg-emerald-500/5 transition-all text-center cursor-pointer"
            >
              Buka Scanner QR
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
