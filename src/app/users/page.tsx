'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  Users,
  Plus,
  Trash2,
  X,
  Loader2,
  AlertTriangle,
  UserPlus,
  Calendar,
  Clock,
  Shield,
} from 'lucide-react';

interface PanitiaUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
}

export default function UsersPage() {
  const { getToken, user: currentUser } = useAuth();
  
  const [users, setUsers] = useState<PanitiaUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    id: '',
    email: '',
    password: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const data = await api.getUsers(token);
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data akun panitia.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreateModal = () => {
    setFormData({
      id: '',
      email: '',
      password: '',
    });
    setFormError(null);
    setIsCreateOpen(true);
  };

  const openDeleteModal = (targetUser: PanitiaUser) => {
    setFormData({
      id: targetUser.id,
      email: targetUser.email,
      password: '',
    });
    setFormError(null);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      const token = getToken();
      await api.createUser(token, {
        email: formData.email,
        password: formData.password,
      });
      setIsCreateOpen(false);
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message || 'Gagal membuat akun panitia baru.');
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
      await api.deleteUser(token, formData.id);
      setIsDeleteOpen(false);
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message || 'Gagal menghapus akun panitia.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              Kelola Panitia
            </h1>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Tambah, pantau, dan kelola akun panitia qurban yang sah.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Panitia
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-semibold flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* List of Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm animate-pulse space-y-4">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-full" />
              </div>
            ))
          ) : users.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-12 text-center text-slate-400 font-bold">
              📥 Belum ada akun panitia terdaftar.
            </div>
          ) : (
            users.map((panitia) => (
              <div
                key={panitia.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Avatar & Email */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-slate-800 dark:text-slate-200 truncate max-w-[150px] sm:max-w-[200px]" title={panitia.email}>
                          {panitia.email}
                        </p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wide">
                          {currentUser?.id === panitia.id ? 'Anda (Super Admin)' : 'Panitia Aktif'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/50 pt-4 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Dibuat: {new Date(panitia.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Login Terakhir:{' '}
                        {panitia.last_sign_in_at
                          ? new Date(panitia.last_sign_in_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
                          : 'Belum pernah'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {currentUser?.id !== panitia.id && (
                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/50 flex justify-end">
                    <button
                      onClick={() => openDeleteModal(panitia)}
                      className="inline-flex items-center gap-1.5 text-rose-500 hover:text-rose-600 dark:hover:text-rose-450 text-xs font-bold px-3 py-1.5 rounded-xl border border-rose-500/10 hover:bg-rose-500/5 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus Akun
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* ================================================= */}
        {/* MODAL 1: ADD PANITIA FORM */}
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

              <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-500" />
                Tambah Akun Panitia Baru
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-semibold">
                Akun baru akan langsung terkonfirmasi otomatis di Supabase dan siap digunakan untuk masuk.
              </p>

              {formError && (
                <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl">
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                    Email Akun
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Contoh: panitia1@mushola.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                    Password (Min. 6 Karakter)
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full flex items-center justify-center py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-emerald-950 font-black rounded-xl text-xs transition-all cursor-pointer shadow-lg"
                >
                  {formLoading ? <Loader2 className="animate-spin w-4.5 h-4.5 text-emerald-950" /> : 'Buat Akun Panitia'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================================================= */}
        {/* MODAL 2: DELETE CONFIRMATION */}
        {/* ================================================= */}
        {isDeleteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl w-full max-w-md p-6 relative flex flex-col shadow-2xl">
              <h3 className="text-lg font-black text-slate-850 dark:text-white mb-2">
                Hapus Akun Panitia?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-semibold">
                Apakah Anda yakin ingin menghapus akun panitia <strong>{formData.email}</strong>? Pengguna ini tidak akan bisa login lagi ke sistem.
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
                  className="flex-1 py-3 bg-rose-50 hover:bg-rose-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center justify-center"
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
