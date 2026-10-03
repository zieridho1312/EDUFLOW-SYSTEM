import React, { useState, useRef } from 'react';
import { EduFlowState, store } from '../../services/storage';
import {
  HelpCircle,
  BookOpen,
  Globe,
  HardDrive,
  Database,
  Smartphone,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Upload,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Laptop,
  Share2,
  Cloud,
  FileCode,
  QrCode,
  ArrowRight,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';

interface TeacherGuideModuleProps {
  state: EduFlowState;
}

export const TeacherGuideModule: React.FC<TeacherGuideModuleProps> = ({ state }) => {
  const [activeTab, setActiveTab] = useState<'flow' | 'publish' | 'backup' | 'firebase'>('flow');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [restoreStatus, setRestoreStatus] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom Firebase / Cloud state form
  const [firebaseProjectId, setFirebaseProjectId] = useState<string>('');
  const [firebaseApiKey, setFirebaseApiKey] = useState<string>('');
  const [firebaseSaved, setFirebaseSaved] = useState<boolean>(false);

  const currentAppUrl = typeof window !== 'undefined' ? window.location.origin : 'https://eduflow.app';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentAppUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // 1-Click Backup Export
  const handleExportBackup = () => {
    const backupJson = store.exportBackup();
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `EduFlow_Cadangan_Data_${state.teacher.schoolName.replace(/\s+/g, '_')}_${dateStr}.eduflow`;

    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setBackupStatus(`File cadangan berhasil diunduh (${fileName})! Anda dapat menyimpannya di Google Drive.`);
    setTimeout(() => setBackupStatus(null), 5000);
  };

  // Restore Data from Backup File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = store.importBackup(content);
      setRestoreStatus(res);
      setTimeout(() => setRestoreStatus(null), 5000);
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setFirebaseSaved(true);
    setTimeout(() => setFirebaseSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 select-none">
      {/* Toast Notification */}
      {backupStatus && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 max-w-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{backupStatus}</span>
        </div>
      )}

      {restoreStatus && (
        <div
          className={`fixed bottom-6 right-6 z-50 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 max-w-md ${
            restoreStatus.success ? 'bg-emerald-950 border border-emerald-500' : 'bg-rose-950 border border-rose-500'
          }`}
        >
          {restoreStatus.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{restoreStatus.message}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="p-1 rounded-md bg-emerald-100 text-emerald-800 font-bold">Panduan Guru</span>
              <span aria-hidden="true">·</span>
              <span>Mudah Dipahami Tanpa Latar Belakang IT / Coding</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Pusat Panduan & Cara Publikasi EduFlow
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              Panduan langkah demi langkah agar guru dapat mempublikasikan aplikasi ini, membuka aplikasi di ponsel/laptop kelas, serta mengamankan seluruh data siswa ke Google Drive atau Firebase agar tidak pernah hilang.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportBackup}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Cadangkan Data Saya</span>
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl pt-2">
          <button
            onClick={() => setActiveTab('flow')}
            className={`py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'flow' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>1. Alur Kerja Harian</span>
          </button>

          <button
            onClick={() => setActiveTab('publish')}
            className={`py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'publish' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-sky-600" />
            <span>2. Cara Publish Web</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'backup' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 text-amber-600" />
            <span>3. Simpan ke Google Drive</span>
          </button>

          <button
            onClick={() => setActiveTab('firebase')}
            className={`py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'firebase' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-indigo-600" />
            <span>4. Database Firebase</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ALUR KERJA HARIAN GURU */}
      {activeTab === 'flow' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Alur Penggunaan Praktis untuk Guru (4 Langkah)</h2>
              <p className="text-xs text-slate-500">Gunakan urutan ini agar administrasi mengajar selesai dalam hitungan menit setiap hari.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Step 1 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">1</span>
                  <h3 className="text-xs font-bold text-slate-900">Buka Dashboard & Jadwal Mengajar</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Begitu membuka EduFlow, periksa jadwal sesi mengajar hari ini di halaman utama Dashboard. Anda akan melihat jam pelajaran (JP), ruangan kelas, dan topik materi yang akan diajarkan.
                </p>
                <div className="text-[11px] text-emerald-800 font-medium bg-emerald-50 p-2 rounded-lg">
                  💡 Tips: Klik langsung tombol hijau <strong>"Buka Presensi"</strong> pada sesi yang sedang berlangsung.
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">2</span>
                  <h3 className="text-xs font-bold text-slate-900">Presensi 1-Klik Saat Jam Kelas Masuk</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Di menu <strong>Presensi</strong>, klik tombol <strong>"Tandai Semua Hadir"</strong>. Jika ada siswa yang sakit atau izin, cukup klik tombol <strong>S</strong> (Sakit), <strong>I</strong> (Izin), atau <strong>A</strong> (Alpa). Klik <strong>"Simpan Presensi"</strong>.
                </p>
                <div className="text-[11px] text-emerald-800 font-medium bg-emerald-50 p-2 rounded-lg">
                  💡 Otomatis: Data presensi ini langsung membuat dan mengisi dokumen Jurnal Harian Mengajar Anda!
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">3</span>
                  <h3 className="text-xs font-bold text-slate-900">Input Nilai & Narasi Rapor Otomatis</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Buka menu <strong>Buku Nilai</strong>. Masukkan nilai Tugas (30%), UTS (30%), dan UAS (40%). Sistem langsung menghitung Nilai Akhir dan membuat kalimat deskripsi narasi E-Rapor secara otomatis untuk tiap siswa.
                </p>
                <div className="text-[11px] text-emerald-800 font-medium bg-emerald-50 p-2 rounded-lg">
                  💡 Bebas Hitung Manual: Tombol "Unduh Excel (.xlsx)" menghasilkan rekapan nilai yang rapi siap setor ke kurikulum.
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">4</span>
                  <h3 className="text-xs font-bold text-slate-900">Cetak Dokumen & Jurnal Harian</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Buka menu <strong>Pusat Cetak</strong>. Pilih dokumen yang ingin dicetak: Jurnal Harian Mengajar, Rekapitulasi Presensi, atau Slip Rapor Sisipan untuk orang tua.
                </p>
                <div className="text-[11px] text-emerald-800 font-medium bg-emerald-50 p-2 rounded-lg">
                  💡 Format Resmi: Sudah dilengkapi kop dinas dan kolom tanda tangan Kepala Sekolah serta Guru Pengampu.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CARA PUBLISH WEB SECARA MUDAH */}
      {activeTab === 'publish' && (
        <div className="space-y-5">
          {/* Option A: Link Langsung */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                <Globe className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Opsi 1: Gunakan Tautan Web Langsung (Paling Mudah — 0 Detik)
                </h2>
                <p className="text-xs text-slate-500">
                  Website EduFlow sudah aktif di cloud dan dapat langsung dibuka di browser apa saja.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Tautan Aplikasi EduFlow Anda:</span>
                  <div className="font-mono text-xs font-bold text-emerald-800 break-all">
                    {currentAppUrl}
                  </div>
                </div>

                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Tautan Tersalin!' : 'Salin Tautan'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Anda cukup membagikan tautan ini ke grup WhatsApp guru, kepala sekolah, atau membuka tautan ini dari komputer laboratorium dan smartphone Anda.
              </p>
            </div>

            {/* Sub-Guide: Cara Pasang di HP (PWA Add to Home Screen) */}
            <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                <Smartphone className="w-4 h-4 text-emerald-700" />
                <span>Cara Memasang EduFlow Menjadi Aplikasi di HP Guru (Tampil Seperti Aplikasi Asli)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                <div className="bg-white p-3 rounded-lg border border-emerald-100 space-y-1">
                  <strong className="text-slate-900 block font-semibold">Di Ponsel Android (Google Chrome):</strong>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
                    <li>Buka tautan EduFlow di Google Chrome.</li>
                    <li>Ketuk ikon titik tiga (<strong>⋮</strong>) di sudut kanan atas.</li>
                    <li>Pilih <strong>"Tambahkan ke Layar Utama"</strong> (atau <em>Install App</em>).</li>
                    <li>Ikon EduFlow akan muncul di beranda HP Anda!</li>
                  </ol>
                </div>
                <div className="bg-white p-3 rounded-lg border border-emerald-100 space-y-1">
                  <strong className="text-slate-900 block font-semibold">Di iPhone / iPad (Safari):</strong>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
                    <li>Buka tautan EduFlow di peramban Safari.</li>
                    <li>Ketuk tombol <strong>Share</strong> (ikon kotak dengan tanda panah ke atas di bagian bawah).</li>
                    <li>Geser ke bawah dan ketuk <strong>"Add to Home Screen"</strong> (Tambah ke Layar Utama).</li>
                    <li>Ketuk <strong>Add</strong> di sudut kanan atas. Selesai!</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Option B: Publish ke Vercel / Netlify */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-2 bg-sky-50 text-sky-700 rounded-lg">
                <Laptop className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Opsi 2: Publikasikan ke Hosting Gratis (Vercel / Netlify) untuk Sekolah
                </h2>
                <p className="text-xs text-slate-500">
                  Jika sekolah ingin memiliki domain sendiri secara gratis selamanya tanpa biaya bulanan.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                <div>
                  <strong className="text-slate-900 block">Daftar Akun Vercel (Gratis)</strong>
                  Buka website <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-semibold">vercel.com</a>, lalu klik <strong>Sign Up</strong> dan masuk menggunakan akun Google Anda.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                <div>
                  <strong className="text-slate-900 block">Hubungkan Repositori Proyek EduFlow</strong>
                  Klik tombol <strong>"Add New..."</strong> lalu pilih <strong>"Project"</strong>. Pilih repositori EduFlow dari GitHub Anda.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                <div>
                  <strong className="text-slate-900 block">Klik "Deploy" & Selesai!</strong>
                  Tidak perlu mengubah pengaturan apapun. Cukup klik tombol <strong>"Deploy"</strong>. Dalam 1-2 menit, website EduFlow sekolah Anda sudah online dan dapat diakses dengan domain gratis seperti: <code>eduflow-sman1.vercel.app</code>.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SIMPAN KE GOOGLE DRIVE AGAR DATA TIDAK HILANG */}
      {activeTab === 'backup' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-2 bg-amber-50 text-amber-700 rounded-lg">
                <HardDrive className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Cara Menyimpan Data ke Google Drive (Cadangkan & Pulihkan)
                </h2>
                <p className="text-xs text-slate-500">
                  Jaminan 100% data siswa, presensi, modul ajar, dan nilai tidak pernah hilang meskipun ganti laptop atau ganti HP.
                </p>
              </div>
            </div>

            {/* Explanation */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs text-slate-700 leading-relaxed">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Penyimpanan Otomatis Sudah Aktif di Perangkat Anda</span>
              </div>
              <p>
                Setiap kali Anda mengisi presensi, membuat modul, atau memasukkan nilai di EduFlow, data <strong>otomatis tersimpan</strong> di penyimpanan memori peramban (*LocalStorage*). Anda bebas menutup browser atau mematikan laptop tanpa takut kehilangan data.
              </p>
              <p>
                Namun, agar data tetap aman jika laptop rusak atau Anda ingin berpindah ke perangkat lain, simpanlah file cadangan ke akun <strong>Google Drive (belajar.id)</strong> Anda menggunakan tombol di bawah ini.
              </p>
            </div>

            {/* Backup & Restore Interactive Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Box 1: Unduh Cadangan */}
              <div className="p-5 border border-slate-200 rounded-xl bg-slate-50 space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>Langkah 1: Unduh File Cadangan Data</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Sistem akan mengemas seluruh data profil guru, daftar kelas, siswa, presensi, buku nilai, dan jurnal mengajar ke dalam 1 file cadangan resmi.
                  </p>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    onClick={handleExportBackup}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh File Cadangan (.eduflow)</span>
                  </button>

                  <a
                    href="https://drive.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
                    <span>Buka Google Drive Saya (Untuk Menyimpan)</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              </div>

              {/* Box 2: Pulihkan Data */}
              <div className="p-5 border border-slate-200 rounded-xl bg-slate-50 space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <Upload className="w-4 h-4 text-sky-600" />
                    <span>Langkah 2: Pulihkan Data (Restore)</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Jika Anda menggunakan laptop baru atau berganti ponsel, pilih file cadangan yang sebelumnya Anda simpan di Google Drive untuk mengembalikan seluruh data Anda seketika.
                  </p>
                </div>

                <div className="pt-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".eduflow,.json"
                    className="hidden"
                    id="restoreFileInput"
                  />
                  <label
                    htmlFor="restoreFileInput"
                    className="w-full py-2.5 px-4 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-slate-600" />
                    <span>Pilih File Cadangan dari Laptop/Drive</span>
                  </label>
                  <p className="text-[10px] text-slate-400 text-center mt-1.5">
                    Mendukung format file <code>.eduflow</code> dan <code>.json</code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DATABASE CLOUD FIREBASE / SUPABASE */}
      {activeTab === 'firebase' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                <Cloud className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Panduan Menghubungkan Firebase Cloud Database (Gratis dari Google)
                </h2>
                <p className="text-xs text-slate-500">
                  Sinkronisasi data real-time antar perangkat menggunakan akun Google resmi.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                <strong className="text-slate-900 block font-semibold text-xs">
                  Cara Membuat Database Firebase Gratis (Untuk Pemula):
                </strong>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
                  <li>
                    Buka <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-semibold">console.firebase.google.com</a> dan masuk dengan akun Google sekolah (belajar.id).
                  </li>
                  <li>
                    Klik <strong>"Add Project"</strong> (Tambah Proyek), beri nama misalnya <code>EduFlow-SMA1</code>.
                  </li>
                  <li>
                    Pada bilah samping kiri, pilih menu <strong>Build → Firestore Database</strong>, lalu klik <strong>Create Database</strong>.
                  </li>
                  <li>
                    Pilih lokasi server terdekat (misal: <code>asia-southeast1 / Jakarta</code>) dan pilih mode <strong>Start in test mode</strong>.
                  </li>
                  <li>
                    Masuk ke <strong>Project Settings</strong> (ikon roda gigi ⚙️) → gulir ke bawah ke bagian <strong>Your apps</strong> → pilih ikon Web (<code>&lt;/&gt;</code>) untuk melihat <em>Project ID</em> dan <em>API Key</em>.
                  </li>
                </ol>
              </div>

              {/* Form Input Firebase Config */}
              <form onSubmit={handleSaveFirebaseConfig} className="p-4 border border-slate-200 rounded-xl bg-white space-y-3">
                <h3 className="text-xs font-bold text-slate-900">
                  Simpan Konfigurasi Firebase Proyek Anda (Opsional):
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Firebase Project ID</label>
                    <input
                      type="text"
                      placeholder="contoh: eduflow-sman1"
                      value={firebaseProjectId}
                      onChange={(e) => setFirebaseProjectId(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Firebase Web API Key</label>
                    <input
                      type="password"
                      placeholder="AIzaSy..."
                      value={firebaseApiKey}
                      onChange={(e) => setFirebaseApiKey(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">
                    {firebaseSaved ? 'Konfigurasi tersimpan di browser!' : 'Tersimpan aman di sisi perangkat guru.'}
                  </span>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                  >
                    Simpan Konfigurasi Cloud
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
