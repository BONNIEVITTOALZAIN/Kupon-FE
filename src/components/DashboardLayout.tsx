'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  QrCode,
  Ticket,
  Printer,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Compass,
  Users,
} from 'lucide-react';

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}

function SidebarLink({ href, icon, label, active, onClick }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${active
          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
          : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/50'
        }`}
    >
      <span className={active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
        {icon}
      </span>
      {label}
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: '/scanner', label: 'Scan QR Code', icon: <QrCode className="w-5 h-5" /> },
    { href: '/kupons', label: 'Manajemen Kupon', icon: <Ticket className="w-5 h-5" /> },
    { href: '/print', label: 'Print Kupon', icon: <Printer className="w-5 h-5" /> },
    { href: '/users', label: 'Kelola Panitia', icon: <Users className="w-5 h-5" /> },
  ];

  const currentYearM = new Date().getFullYear();
  const currentYearH = currentYearM - 579;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* Mobile Navbar */}
      <header className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/80 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🕌</span>
          <span className="font-extrabold text-slate-800 dark:text-white tracking-wide text-sm">
            QURBAN KUPON
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg focus:outline-none"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar - Desktop & Mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/80 p-5 transform transition-transform duration-300 md:translate-x-0 md:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } flex flex-col h-full`}
      >
        <div className="hidden md:flex items-center gap-3 mb-8 px-2">
          <span className="text-3xl">🕌</span>
          <div>
            <h1 className="font-black text-slate-900 dark:text-white tracking-wide text-md">
              Mushola Al-Mubarokah
            </h1>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">PANITIA QURBAN {currentYearH} H</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {links.map((link) => (
            <SidebarLink
              key={link.href}
              href={link.href}
              icon={link.icon}
              label={link.label}
              active={pathname === link.href}
              onClick={() => setSidebarOpen(false)}
            />
          ))}
        </nav>

        {/* User profile card & Logout */}
        <div className="mt-auto border-t border-slate-100 dark:border-slate-800/50 pt-4 px-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <UserIcon className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {user?.email || 'Admin Panitia'}
              </p>
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                Super Admin
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/30 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Overlay for Mobile Sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Main content page area */}
      <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8 flex flex-col">
        {children}
      </main>
    </div>
  );
}
