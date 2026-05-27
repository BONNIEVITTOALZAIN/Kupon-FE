'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Kupon, PaginationInfo, TipeKupon, StatusKupon } from '@/types/kupon';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  FileSpreadsheet,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

export default function KuponsPage() {
  const { getToken } = useAuth();
  
  // Data list & state
  const [kupons, setKupons] = useState<Kupon[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [filterTipe, setFilterTipe] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [page, setPage] = useState(1);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    id: '',
    nomor: '',
    nama: '',
    tipe: 'terdaftar' as TipeKupon,
    status: 'belum' as StatusKupon,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // PDF & Excel download state
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [excelExporting, setExcelExporting] = useState(false);

  const fetchKupons = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const response = await api.getKupons(token, {
        page,
        limit: 10,
        search: search || undefined,
        tipe: filterTipe || undefined,
        status: filterStatus || undefined,
      });
      setKupons(response.kupons);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data kupon.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKupons();
  }, [page, filterTipe, filterStatus]);

  // Handle Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchKupons();
  };

  // Open forms helper
  const openCreateModal = () => {
    setFormData({
      id: '',
      nomor: '',
      nama: '',
      tipe: 'terdaftar',
      status: 'belum',
    });
    setFormError(null);
    setIsCreateOpen(true);
  };

  const openEditModal = (kupon: Kupon) => {
    setFormData({
      id: kupon.id,
      nomor: kupon.nomor,
      nama: kupon.nama,
      tipe: kupon.tipe,
      status: kupon.status,
    });
    setFormError(null);
    setIsEditOpen(true);
  };

  const openDeleteModal = (kupon: Kupon) => {
    setFormData({
      id: kupon.id,
      nomor: kupon.nomor,
      nama: kupon.nama,
      tipe: kupon.tipe,
      status: kupon.status,
    });
    setFormError(null);
    setIsDeleteOpen(true);
  };

  // Form submits handlers
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      const token = getToken();
      await api.createKupon(token, {
        nomor: formData.nomor,
        nama: formData.tipe === 'extra' ? 'EXTRA' : formData.nama,
        tipe: formData.tipe,
      });
      setIsCreateOpen(false);
      fetchKupons();
    } catch (err: any) {
      setFormError(err.message || 'Gagal membuat kupon baru.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      const token = getToken();
      await api.updateKupon(token, formData.id, {
        nomor: formData.nomor,
        nama: formData.tipe === 'extra' ? 'EXTRA' : formData.nama,
        tipe: formData.tipe,
        status: formData.status,
      });
      setIsEditOpen(false);
      fetchKupons();
    } catch (err: any) {
      setFormError(err.message || 'Gagal mengupdate kupon.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      const token = getToken();
      await api.deleteKupon(token, formData.id);
      setIsDeleteOpen(false);
      fetchKupons();
    } catch (err: any) {
      setFormError(err.message || 'Gagal menghapus kupon.');
    } finally {
      setFormLoading(false);
    }
  };

  // PDF Trigger
  const handleDownloadPDF = () => {
    try {
      setPdfGenerating(true);
      const token = getToken();
      const pdfUrl = api.getPDFUrl(token, {
        tipe: filterTipe || undefined,
        status: filterStatus || undefined,
      });
      window.open(pdfUrl, '_blank');
    } catch (e) {
      console.error(e);
    } finally {
      setPdfGenerating(false);
    }
  };

  // Excel Trigger
  const handleExportExcel = async () => {
    setExcelExporting(true);
    try {
      const token = getToken();
      await api.exportExcel(token, {
        tipe: filterTipe || undefined,
        status: filterStatus || undefined,
      });
    } catch (err: any) {
      alert(err.message || 'Gagal mengunduh Excel.');
    } finally {
      setExcelExporting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white">
              Manajemen Kupon
            </h1>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Buat, edit, hapus, dan unduh data kupon qurban.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              disabled={excelExporting}
              className="inline-flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={pdfGenerating}
              className="inline-flex items-center justify-center gap-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-450 border border-indigo-500/20 hover:bg-indigo-500/20 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Cetak PDF
            </button>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Kupon Baru
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-semibold flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4.5 h-4.5" />
            </div>
            <input
              type="text"
              placeholder="Cari kupon nomor, kode, atau penerima..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 placeholder-slate-400 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </form>

          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span>Filter:</span>
            </div>

            {/* Type filter */}
            <select
              value={filterTipe}
              onChange={(e) => {
                setFilterTipe(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer focus:outline-none text-slate-700 dark:text-slate-250 font-bold"
            >
              <option value="">Semua Tipe</option>
              <option value="terdaftar">Terdaftar</option>
              <option value="extra">Extra</option>
            </select>

            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer focus:outline-none text-slate-700 dark:text-slate-250 font-bold"
            >
              <option value="">Semua Status</option>
              <option value="belum">Belum Diambil</option>
              <option value="sudah">Sudah Diambil</option>
            </select>

            {/* Clear Filters helper */}
            {(filterTipe || filterStatus || search) && (
              <button
                type="button"
                onClick={() => {
                  setFilterTipe('');
                  setFilterStatus('');
                  setSearch('');
                  setPage(1);
                }}
                className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-450 border border-rose-500/10 hover:border-rose-500/20 px-3 py-2 rounded-xl transition-all cursor-pointer bg-rose-500/5"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/80 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Nomor Kupon</th>
                  <th className="px-6 py-4">Kode QR</th>
                  <th className="px-6 py-4">Nama Penerima</th>
                  <th className="px-6 py-4">Tipe Kupon</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Waktu Digunakan</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-36" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-28" /></td>
                      <td className="px-6 py-4 text-right"><div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-12 ml-auto" /></td>
                    </tr>
                  ))
                ) : kupons.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-bold">
                      📥 Tidak ada kupon qurban ditemukan.
                    </td>
                  </tr>
                ) : (
                  kupons.map((kupon) => (
                    <tr key={kupon.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-4 font-extrabold text-slate-800 dark:text-slate-200">
                        {kupon.nomor}
                      </td>
                      <td className="px-6 py-4 font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                        {kupon.kode}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                        {kupon.nama || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            kupon.tipe === 'extra'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450'
                          }`}
                        >
                          {kupon.tipe}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            kupon.status === 'sudah'
                              ? 'bg-teal-100 text-teal-700 dark:bg-teal-950/20 dark:text-teal-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {kupon.status === 'sudah' ? 'Sudah Diambil' : 'Belum Diambil'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">
                        {kupon.used_at
                          ? new Date(kupon.used_at).toLocaleString('id-ID', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-right space-x-1.5 flex justify-end">
                        <button
                          onClick={() => openEditModal(kupon)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(kupon)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls Footer */}
          {!loading && kupons.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
              <span>
                Menampilkan <span className="font-extrabold text-slate-700 dark:text-slate-200">{kupons.length}</span> kupon dari total{' '}
                <span className="font-extrabold text-slate-700 dark:text-slate-200">{pagination.total}</span> data
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span>
                  Halaman {page} dari {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                  disabled={page === pagination.totalPages}
                  className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ================================================= */}
        {/* MODAL 1: CREATE COUPON FORM */}
        {/* ================================================= */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl w-full max-w-md p-6 relative flex flex-col shadow-2xl">
              <button
                onClick={() => setIsCreateOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4">
                Tambah Kupon Qurban Baru
              </h3>

              {formError && (
                <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl">
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                    Tipe Kupon
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, tipe: 'terdaftar' })}
                      className={`py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        formData.tipe === 'terdaftar'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                      }`}
                    >
                      🕌 TERDAFTAR
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, tipe: 'extra', nama: 'EXTRA' })}
                      className={`py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        formData.tipe === 'extra'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                      }`}
                    >
                      ✨ EXTRA
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                    Nomor Kupon
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 021, E005"
                    value={formData.nomor}
                    onChange={(e) => setFormData({ ...formData, nomor: e.target.value })}
                    className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {formData.tipe === 'terdaftar' && (
                  <div>
                    <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                      Nama Penerima Daging
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Bapak Ahmad Fauzi"
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full flex items-center justify-center py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-emerald-950 font-black rounded-xl text-xs transition-all cursor-pointer shadow-lg"
                >
                  {formLoading ? <Loader2 className="animate-spin w-4.5 h-4.5 text-emerald-950" /> : 'Simpan Kupon'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================================================= */}
        {/* MODAL 2: EDIT COUPON FORM */}
        {/* ================================================= */}
        {isEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl w-full max-w-md p-6 relative flex flex-col shadow-2xl">
              <button
                onClick={() => setIsEditOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4">
                Edit Kupon Qurban
              </h3>

              {formError && (
                <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl">
                  {formError}
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                    Nomor Kupon
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nomor}
                    onChange={(e) => setFormData({ ...formData, nomor: e.target.value })}
                    className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {formData.tipe === 'terdaftar' && (
                  <div>
                    <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                      Nama Penerima Daging
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                    Status Pengambilan Daging
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: 'belum' })}
                      className={`py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        formData.status === 'belum'
                          ? 'bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      ⏳ BELUM
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: 'sudah' })}
                      className={`py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        formData.status === 'sudah'
                          ? 'bg-teal-500/10 border-teal-500/30 text-teal-600 dark:text-teal-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      ✅ SUDAH
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full flex items-center justify-center py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-emerald-950 font-black rounded-xl text-xs transition-all cursor-pointer shadow-lg"
                >
                  {formLoading ? <Loader2 className="animate-spin w-4.5 h-4.5 text-emerald-950" /> : 'Perbarui Kupon'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================================================= */}
        {/* MODAL 3: DELETE CONFIRMATION */}
        {/* ================================================= */}
        {isDeleteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl w-full max-w-md p-6 relative flex flex-col shadow-2xl">
              <h3 className="text-lg font-black text-slate-850 dark:text-white mb-2">
                Hapus Kupon Qurban?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-semibold">
                Apakah Anda yakin ingin menghapus kupon <strong>{formData.nomor}</strong> ({formData.nama})? Aksi ini permanen dan tidak dapat dibatalkan.
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsDeleteOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteSubmit}
                  disabled={formLoading}
                  className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center justify-center"
                >
                  {formLoading ? <Loader2 className="animate-spin w-4.5 h-4.5 text-white" /> : 'Ya, Hapus'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
