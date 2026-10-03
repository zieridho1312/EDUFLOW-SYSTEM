import React from 'react';
import { EduFlowState } from '../../services/storage';
import {
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
  ClipboardList,
  BookOpen,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Legend,
} from 'recharts';

interface DashboardModuleProps {
  state: EduFlowState;
  onNavigateTab: (tab: string, extraParam?: string) => void;
  onOpenNewBehavior: () => void;
  onOpenNewLessonPlan: () => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  state,
  onNavigateTab,
  onOpenNewBehavior,
  onOpenNewLessonPlan,
}) => {
  const { teacher, classes, students, schedules, attendanceSessions, behaviorLogs } = state;

  // Compute key stats
  const totalClasses = classes.length;
  const totalStudents = students.length;
  const todaySchedules = schedules.filter((s) => s.dayOfWeek === 'Senin' || s.isToday);

  // Today's attendance calculation
  const latestSession = attendanceSessions[0];
  let hadirCount = 11;
  let sakitCount = 1;
  let izinCount = 1;
  let alpaCount = 1;
  let attendanceRate = 95.8;

  if (latestSession && latestSession.records.length > 0) {
    hadirCount = latestSession.records.filter((r) => r.status === 'H').length;
    sakitCount = latestSession.records.filter((r) => r.status === 'S').length;
    izinCount = latestSession.records.filter((r) => r.status === 'I').length;
    alpaCount = latestSession.records.filter((r) => r.status === 'A').length;
    const totalRecs = latestSession.records.length;
    attendanceRate = Math.round((hadirCount / totalRecs) * 1000) / 10;
  }

  // Pending grading count & details
  const pendingGrading = [
    { title: 'Formatif 1: Dekomposisi Algoritma', class: 'Kelas X-A', count: '12 Siswa', priority: 'high' },
    { title: 'Praktik 1: Struktur Data Graf', class: 'Kelas XI-MIPA 1', count: '8 Siswa', priority: 'medium' },
  ];

  // Recharts Data: Ringkasan Ketuntasan Nilai vs KKTP (Kriteria Ketercapaian TP)
  const kktpTarget = 75;
  const gradeSummaryData = [
    { name: 'Kelas X-A', rataRata: 83.4, kktp: kktpTarget, tuntas: 92, remedial: 8 },
    { name: 'Kelas X-B', rataRata: 79.2, kktp: kktpTarget, tuntas: 80, remedial: 20 },
    { name: 'Kelas XI-MIPA 1', rataRata: 86.8, kktp: kktpTarget, tuntas: 96, remedial: 4 },
    { name: 'Kelas XI-MIPA 2', rataRata: 81.5, kktp: kktpTarget, tuntas: 85, remedial: 15 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 select-none">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <img
              src={teacher.avatarUrl}
              alt={teacher.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/20 shadow-sm shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'https://api.dicebear.com/7.x/initials/svg?seed=Ahmad+Ridho';
              }}
            />
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="text-emerald-700 font-semibold">{teacher.schoolName}</span>
                <span aria-hidden="true">·</span>
                <span>TA {teacher.academicYear} ({teacher.semester})</span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                Selamat Datang, {teacher.name}
              </h1>
              <p className="text-xs text-slate-600">
                Workspace Administrasi Guru Kurikulum Merdeka — Hari ini Anda memiliki{' '}
                <span className="font-semibold text-emerald-800">{todaySchedules.length} Sesi Mengajar</span> aktif.
              </p>
            </div>
          </div>

          {/* Quick Header Shortcuts */}
          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
            <button
              onClick={() => onNavigateTab('attendance')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Presensi Cepat</span>
            </button>
            <button
              onClick={onOpenNewLessonPlan}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Modul Ajar</span>
            </button>
            <button
              onClick={onOpenNewBehavior}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Jurnal Siswa</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Main Content Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Total Kelas & Siswa Hari Ini */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Beban Mengajar
              </span>
              <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                <Users className="w-4 h-4" />
              </span>
            </div>
            <div className="pt-2">
              <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
                {totalClasses} Kelas <span className="text-slate-400 font-normal">/</span> {totalStudents} Siswa
              </div>
              <p className="text-xs font-medium text-emerald-800 mt-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>{todaySchedules.length} Sesi KBM Terjadwal Hari Ini</span>
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Rombel Binaan Aktif</span>
            <button
              onClick={() => onNavigateTab('attendance')}
              className="text-emerald-700 hover:underline font-semibold"
            >
              Lihat Daftar Rombel →
            </button>
          </div>
        </div>

        {/* Card 2: Status Presensi Hari Ini (% Kehadiran) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Presensi Hari Ini
              </span>
              <span className="p-2 bg-teal-50 text-teal-700 rounded-xl">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>
            <div className="pt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
                  {attendanceRate}%
                </span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Kehadiran Baik
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                {hadirCount} Hadir · {izinCount} Izin · {sakitCount} Sakit · {alpaCount} Alpa
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Berdasarkan sesi terkini</span>
            <button
              onClick={() => onNavigateTab('attendance')}
              className="text-emerald-700 hover:underline font-semibold"
            >
              Buka Presensi Kelas →
            </button>
          </div>
        </div>

        {/* Card 3: Tugas Belum Dikoreksi (Badge Alert) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Tagihan Asesmen
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200/80 rounded-full text-[11px] font-bold animate-pulse">
                <AlertCircle className="w-3 h-3" />
                {pendingGrading.length} Tugas Menunggu
              </span>
            </div>
            <div className="pt-2">
              <div className="text-base font-bold text-slate-900">
                Perlu Koreksi Nilai
              </div>
              <ul className="text-xs text-slate-600 mt-1 space-y-0.5">
                {pendingGrading.map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between">
                    <span className="truncate max-w-[180px]">· {item.title}</span>
                    <span className="font-mono text-[11px] text-slate-400">{item.class}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Mempengaruhi E-Rapor</span>
            <button
              onClick={() => onNavigateTab('gradebook')}
              className="text-emerald-700 hover:underline font-semibold"
            >
              Koreksi Sekarang →
            </button>
          </div>
        </div>
      </div>

      {/* 2 Main Interactive Sections: Jadwal Mengajar & Ringkasan Nilai */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Section 1: "Jadwal Mengajar Hari Ini" with direct "Buka Presensi" (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Jadwal Mengajar Hari Ini
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Senin — Akses presensi 1-klik untuk setiap jam pelajaran aktif
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('attendance')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Semua Presensi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {todaySchedules.map((schedule, idx) => {
              const targetClass = classes.find((c) => c.id === schedule.classId);
              const isCurrentSession = idx === 0; // First slot simulated as ongoing

              return (
                <div
                  key={schedule.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrentSession
                      ? 'bg-gradient-to-r from-emerald-50/60 to-white border-emerald-300 ring-1 ring-emerald-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900">
                          {targetClass?.name || 'Kelas'}
                        </span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                          {schedule.subject}
                        </span>
                        {isCurrentSession ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white animate-pulse">
                            Sedang Berlangsung
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-400">
                            Berikutnya
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-700 font-medium line-clamp-1">
                        {schedule.topicSummary}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-slate-500 pt-0.5">
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {schedule.startTime} - {schedule.endTime} ({schedule.hourSlot})
                        </span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="flex items-center gap-1 text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {schedule.room}
                        </span>
                      </div>
                    </div>

                    {/* Direct Action Button: "Buka Presensi" */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <button
                        onClick={() => onNavigateTab('attendance', schedule.classId)}
                        className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg shadow-xs transition-colors whitespace-nowrap ${
                          isCurrentSession
                            ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        <ClipboardList className="w-3.5 h-3.5" />
                        <span>Buka Presensi</span>
                      </button>

                      <button
                        onClick={() => onNavigateTab('gradebook', schedule.classId)}
                        className="text-[11px] text-slate-500 hover:text-emerald-700 font-medium underline-offset-2 hover:underline"
                      >
                        Input Nilai Kelas
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Section 2: "Ringkasan Ketuntasan Nilai" (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Ringkasan Ketuntasan Nilai
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rata-rata kelas dibandingkan ambang batas KKTP ({kktpTarget})
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                Target: {kktpTarget}
              </span>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-60 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={gradeSummaryData}
                  margin={{ top: 15, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickFormatter={(val) => val.replace('Kelas ', '')}
                  />
                  <YAxis
                    domain={[60, 100]}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                            <p className="font-bold text-emerald-400">{data.name}</p>
                            <p className="font-mono">Rata-rata: <span className="font-bold">{data.rataRata}</span></p>
                            <p className="font-mono text-slate-300">Ambang KKTP: {data.kktp}</p>
                            <div className="pt-1 border-t border-slate-800 text-[11px] text-emerald-300">
                              Ketuntasan: {data.tuntas}% Siswa Tuntas
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {/* Reference line for KKTP passing score */}
                  <ReferenceLine
                    y={kktpTarget}
                    stroke="#D97706"
                    strokeDasharray="4 4"
                    label={{
                      value: `KKTP (${kktpTarget})`,
                      fill: '#D97706',
                      fontSize: 10,
                      position: 'top',
                    }}
                  />
                  <Bar
                    dataKey="rataRata"
                    name="Rata-rata Nilai"
                    fill="#059669"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Footnote on KKTP */}
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
            <div className="flex items-center justify-between font-semibold text-slate-800">
              <span>Status Ketuntasan Belajar</span>
              <span className="text-emerald-700 font-mono">4 dari 4 Kelas Tuntas</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Semua rombel berada di atas standar ketercapaian tujuan pembelajaran (KKTP). Kelas XI-MIPA 1 mencatatkan capaian tertinggi (86.8).
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Insights & Quick Guides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Kurikulum Merdeka Siap Cetak</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Modul Ajar, Rubrik KKTP, dan Jurnal Harian terintegrasi otomatis.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Deskripsi E-Rapor Otomatis</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Narasi capaian tertinggi & ruang bimbingan terisi tanpa manual input.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Sinkronisasi Jurnal Siswa</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Pencatatan 6 dimensi Profil Pelajar Pancasila & kirim pesan wali via WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
