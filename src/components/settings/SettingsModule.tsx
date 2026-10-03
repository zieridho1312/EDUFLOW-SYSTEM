import React, { useState } from 'react';
import { TeacherProfile } from '../../types/database';
import {
  Settings,
  Save,
  CheckCircle2,
  School,
  User,
  Calendar,
  Shield,
  RotateCcw,
} from 'lucide-react';

interface SettingsModuleProps {
  teacher: TeacherProfile;
  onUpdateTeacher: (partial: Partial<TeacherProfile>) => void;
  onResetData: () => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  teacher,
  onUpdateTeacher,
  onResetData,
}) => {
  const [formData, setFormData] = useState<TeacherProfile>({ ...teacher });
  const [savedNotification, setSavedNotification] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTeacher(formData);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 select-none">
      {/* Toast Notification */}
      {savedNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Pengaturan guru dan sekolah berhasil disimpan!</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-1">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Konfigurasi Administrasi</span>
          <span aria-hidden="true">·</span>
          <span>Data Guru & Satuan Pendidikan</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Pengaturan Workspace Guru
        </h1>
        <p className="text-xs text-slate-600">
          Sesuaikan data profil pengampu, informasi kepala sekolah untuk dokumen dinas, serta tahun ajaran aktif.
        </p>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
        {/* Section 1: Profil Guru */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-sm font-bold text-slate-900">
            <User className="w-4 h-4 text-emerald-600" />
            <span>Identitas Guru Pengampu</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Nama Lengkap & Gelar</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Nomor Induk Pegawai (NIP)</label>
              <input
                type="text"
                required
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Email Akun Belajar.id</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Nomor Telepon / WhatsApp</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Satuan Pendidikan */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-sm font-bold text-slate-900">
            <School className="w-4 h-4 text-emerald-600" />
            <span>Satuan Pendidikan & Kepala Sekolah</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-slate-700">Nama Sekolah</label>
              <input
                type="text"
                required
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-slate-700">Alamat Lengkap Sekolah</label>
              <input
                type="text"
                value={formData.schoolAddress}
                onChange={(e) => setFormData({ ...formData, schoolAddress: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Nama Kepala Sekolah</label>
              <input
                type="text"
                value={formData.principalName}
                onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">NIP Kepala Sekolah</label>
              <input
                type="text"
                value={formData.principalNip}
                onChange={(e) => setFormData({ ...formData, principalNip: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Periode Akademik Aktif */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-sm font-bold text-slate-900">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Tahun Ajaran & Semester</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Tahun Ajaran Aktif</label>
              <input
                type="text"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                placeholder="2026/2027"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Semester</label>
              <select
                value={formData.semester}
                onChange={(e: any) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Ganjil">Semester Ganjil</option>
                <option value="Genap">Semester Genap</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset seluruh data ke konfigurasi demo bawaan?')) {
                onResetData();
              }
            }}
            className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>

          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Pengaturan</span>
          </button>
        </div>
      </form>
    </div>
  );
};
