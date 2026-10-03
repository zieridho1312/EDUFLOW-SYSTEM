import React from 'react';
import {
  UserCheck,
  BookOpenCheck,
  Calculator,
  HeartHandshake,
  FileSpreadsheet,
  X,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (tab: string, extraAction?: string) => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  if (!isOpen) return null;

  const actions = [
    {
      id: 'attendance',
      title: 'Mulai Presensi Kelas',
      desc: 'Catat kehadiran 1-klik per jam pelajaran (H, S, I, A).',
      icon: UserCheck,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      id: 'planner',
      extra: 'new_plan',
      title: 'Buat Modul Ajar Baru',
      desc: 'Rancang modul ajar Kurikulum Merdeka terintegrasi 6 Dimensi P3.',
      icon: BookOpenCheck,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      id: 'gradebook',
      title: 'Input Nilai & E-Rapor',
      desc: 'Isi skor asesmen formatif/sumatif dan buat deskripsi capaian rapor otomatis.',
      icon: Calculator,
      color: 'text-sky-600 bg-sky-50',
    },
    {
      id: 'behavior',
      extra: 'new_log',
      title: 'Catat Perilaku / Karakter Murid',
      desc: 'Dokumentasikan prestasi, insiden sikap, atau siapkan WA ke orang tua.',
      icon: HeartHandshake,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      id: 'export',
      title: 'Cetak Jurnal Harian Mengajar',
      desc: 'Buka dokumen resmi siap cetak untuk arsip dinas pendidikan.',
      icon: FileSpreadsheet,
      color: 'text-emerald-700 bg-emerald-100',
    },
    {
      id: 'guide',
      title: 'Panduan Guru & Cadangkan Data',
      desc: 'Cara publish web, buka di ponsel, dan amankan data ke Google Drive.',
      icon: BookOpen,
      color: 'text-teal-700 bg-teal-50',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-bold text-slate-900">Aksi Cepat Administrasi Guru</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id + (act.extra || '')}
                onClick={() => {
                  onSelectAction(act.id, act.extra);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-xl border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all flex items-start gap-3 group"
              >
                <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${act.color}`}>
                  <Icon className="w-5 h-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                    {act.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    {act.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
