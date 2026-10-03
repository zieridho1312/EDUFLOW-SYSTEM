import React, { useState, useRef, useEffect } from 'react';
import { TeacherProfile } from '../../types/database';
import {
  Calendar,
  Clock,
  Sparkles,
  ChevronDown,
  UserCheck,
  Calculator,
  BookOpenCheck,
  Printer,
  Settings,
  User,
  School,
  LogOut,
  Plus,
} from 'lucide-react';

interface HeaderProps {
  teacher: TeacherProfile;
  activeTab: string;
  onOpenQuickAction: () => void;
  onOpenPrintCenter: () => void;
  onSelectAction: (tab: string, extraParam?: string) => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  teacher,
  activeTab,
  onOpenQuickAction,
  onOpenPrintCenter,
  onSelectAction,
  onOpenSettings,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [quickDropdownOpen, setQuickDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (quickRef.current && !quickRef.current.contains(event.target as Node)) {
        setQuickDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return 'Dashboard Guru';
      case 'planner':
        return 'Modul Ajar (Planner)';
      case 'attendance':
        return 'Presensi Kelas';
      case 'gradebook':
        return 'Buku Nilai & E-Rapor';
      case 'behavior':
        return 'Jurnal Siswa & Sikap P3';
      case 'guide':
        return 'Panduan Guru & Publish';
      case 'settings':
        return 'Pengaturan Workspace';
      case 'export':
        return 'Pusat Cetak & Administrasi';
      case 'schema':
        return 'Skema Supabase';
      default:
        return 'Workspace Administrasi Guru';
    }
  };

  const todayDateFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-white border-b border-slate-200 select-none">
      {/* Zone 1: Brand title & Context */}
      <div className="flex items-center gap-3">
        <a href="/" className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
            EF
          </span>
          <span className="bg-gradient-to-r from-slate-900 to-emerald-950 bg-clip-text text-transparent">EduFlow</span>
        </a>
        <span className="hidden md:inline-block text-slate-300">/</span>
        <span className="hidden md:inline-block text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md truncate max-w-xs">
          {getTabLabel(activeTab)}
        </span>
      </div>

      {/* Zone 2: Active School Year & Semester Indicator */}
      <div className="hidden lg:flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50/80 border border-emerald-200/60 rounded-full text-xs font-medium text-emerald-900">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>TA {teacher.academicYear}</span>
          <span aria-hidden="true" className="text-emerald-300">·</span>
          <span>Semester {teacher.semester}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{todayDateFormatted}</span>
        </div>
      </div>

      {/* Zone 3: Actions & Teacher Profile Dropdown */}
      <div className="flex items-center gap-2.5">
        {/* + Quick Action Dropdown */}
        <div className="relative" ref={quickRef}>
          <button
            onClick={() => setQuickDropdownOpen(!quickDropdownOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-all whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Quick Action</span>
            <ChevronDown className="w-3 h-3 text-emerald-200 ml-0.5" />
          </button>

          {quickDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Aksi Cepat
              </div>
              <button
                onClick={() => {
                  onSelectAction('attendance');
                  setQuickDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors text-left"
              >
                <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-semibold leading-tight">Input Presensi</div>
                  <div className="text-[10px] text-slate-400 leading-tight">Catat kehadiran 1-klik</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onSelectAction('gradebook');
                  setQuickDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors text-left"
              >
                <Calculator className="w-4 h-4 text-sky-600 shrink-0" />
                <div>
                  <div className="font-semibold leading-tight">Tambah Nilai</div>
                  <div className="text-[10px] text-slate-400 leading-tight">Asesmen & auto E-Rapor</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onSelectAction('planner');
                  setQuickDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors text-left"
              >
                <BookOpenCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <div className="font-semibold leading-tight">Buat Modul Ajar</div>
                  <div className="text-[10px] text-slate-400 leading-tight">Rencana Kurikulum Merdeka</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Teacher Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200"
          >
            <img
              src={teacher.avatarUrl}
              alt={teacher.name}
              className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 shadow-2xs"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'https://api.dicebear.com/7.x/initials/svg?seed=Ahmad+Ridho';
              }}
            />
            <div className="hidden xl:block text-left pr-1">
              <p className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[140px]">
                {teacher.name.split(',')[0]}
              </p>
              <p className="text-[11px] text-slate-500 leading-tight truncate max-w-[140px]">
                {teacher.schoolName}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
              {/* Profile Card Header */}
              <div className="px-4 py-3 border-b border-slate-100 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{teacher.name}</span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono">NIP: {teacher.nip}</p>
                <p className="text-[11px] text-slate-500 truncate">{teacher.email}</p>
                <div className="pt-1.5 flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium">
                  <School className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="truncate">{teacher.schoolName}</span>
                </div>
              </div>

              {/* Navigation within dropdown */}
              <div className="py-1">
                <button
                  onClick={() => {
                    onOpenSettings();
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors text-left"
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>Pengaturan Akun & Profil Sekolah</span>
                </button>

                <button
                  onClick={() => {
                    onOpenPrintCenter();
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors text-left"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>Pusat Cetak Dokumen & Jurnal</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-400">
                <span>Versi 2.4 (Merdeka)</span>
                <span className="text-emerald-700 font-medium">Online</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
