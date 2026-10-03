import React from 'react';
import {
  LayoutDashboard,
  BookOpenCheck,
  UserCheck,
  Calculator,
  HeartHandshake,
  Settings,
  FileSpreadsheet,
  Database,
  RotateCcw,
  School,
  BookOpen,
} from 'lucide-react';
import { TeacherProfile } from '../../types/database';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  teacher: TeacherProfile;
  onResetData: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  teacher,
  onResetData,
}) => {
  const primaryNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      description: 'Ringkasan & jadwal KBM',
      icon: LayoutDashboard,
    },
    {
      id: 'planner',
      label: 'Modul Ajar (Planner)',
      description: 'Perencanaan Kurikulum Merdeka',
      icon: BookOpenCheck,
    },
    {
      id: 'attendance',
      label: 'Presensi',
      description: 'Kehadiran 1-klik per kelas',
      icon: UserCheck,
    },
    {
      id: 'gradebook',
      label: 'Buku Nilai',
      description: 'Asesmen & deskripsi E-Rapor',
      icon: Calculator,
    },
    {
      id: 'behavior',
      label: 'Jurnal Siswa',
      description: 'Catatan sikap P3 & notifikasi',
      icon: HeartHandshake,
    },
    {
      id: 'guide',
      label: 'Panduan Guru',
      description: 'Cara publish & simpan ke Drive',
      icon: BookOpen,
    },
    {
      id: 'settings',
      label: 'Pengaturan',
      description: 'Profil guru, semester & KKTP',
      icon: Settings,
    },
  ];

  const secondaryNavItems = [
    {
      id: 'export',
      label: 'Pusat Cetak Dokumen',
      icon: FileSpreadsheet,
    },
    {
      id: 'schema',
      label: 'Skema Supabase (RLS)',
      icon: Database,
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="p-4 space-y-5 overflow-y-auto">
        {/* School Summary Box */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
            <School className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">{teacher.schoolName}</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono truncate">
            NIP: {teacher.nip}
          </p>
          <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span className="text-emerald-700">TA {teacher.academicYear}</span>
            <span>Sem. {teacher.semester}</span>
          </div>
        </div>

        {/* Primary Navigation List */}
        <div className="space-y-1">
          <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Menu Utama
          </div>
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors group relative ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-950 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-medium'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs leading-tight truncate">{item.label}</div>
                  <div className="text-[10px] text-slate-400 leading-tight truncate group-hover:text-slate-500">
                    {item.description}
                  </div>
                </div>
                {isActive && (
                  <div className="w-1.5 h-4 bg-emerald-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Secondary Navigation List */}
        <div className="space-y-1 pt-2 border-t border-slate-100">
          <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Alat Administrasi
          </div>
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-xs ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-950 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-medium'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isActive ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info & Reset */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span className="font-semibold text-slate-700">EduFlow Studio</span>
          <span className="font-mono text-[10px] text-slate-400">v2.4 LTS</span>
        </div>

        <div className="px-1 text-[10px] text-slate-400 leading-tight">
          &copy; 2026 EduFlow by <span className="font-bold text-emerald-700">@zieridho13</span>
        </div>

        <button
          onClick={() => {
            if (window.confirm('Muat ulang data simulasi awal EduFlow?')) {
              onResetData();
            }
          }}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 text-[11px] font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          title="Reset ke data bawaan demo"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Data Demo</span>
        </button>
      </div>
    </aside>
  );
};
