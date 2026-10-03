import React, { useState, useEffect } from 'react';
import {
  SchoolClass,
  Student,
  AttendanceSession,
  AttendanceRecord,
  StudentAttendanceStatus,
} from '../../types/database';
import {
  UserCheck,
  CheckCircle2,
  Calendar,
  Clock,
  Save,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  Users,
  Search,
  Check,
  Sparkles,
  Phone,
} from 'lucide-react';

interface AttendanceModuleProps {
  classes: SchoolClass[];
  students: Student[];
  sessions: AttendanceSession[];
  onSaveSession: (session: AttendanceSession) => void;
  defaultClassId?: string;
  onOpenClassManager?: () => void;
}

export const AttendanceModule: React.FC<AttendanceModuleProps> = ({
  classes,
  students,
  sessions,
  onSaveSession,
  defaultClassId,
  onOpenClassManager,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(
    defaultClassId || classes[0]?.id || ''
  );
  const [sessionDate, setSessionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [hourSlot, setHourSlot] = useState<string>('JP 1 - 2 (07.30 - 09.00)');
  const [subject, setSubject] = useState<string>('Informatika');
  const [topicDelivered, setTopicDelivered] = useState<string>(
    'Struktur Data: Implementasi Stack & Queue pada Pemrograman'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);

  // Filter students by selected class
  const classStudents = students.filter((s) => s.classId === selectedClassId);

  // Check if session already exists for this class & date & hourSlot
  const existingSession = sessions.find(
    (s) => s.classId === selectedClassId && s.date === sessionDate && s.hourSlot === hourSlot
  );

  // Current session records state: map studentId -> { status, note }
  const [records, setRecords] = useState<Record<string, AttendanceRecord>>({});

  useEffect(() => {
    if (existingSession) {
      const map: Record<string, AttendanceRecord> = {};
      existingSession.records.forEach((r) => {
        map[r.studentId] = r;
      });
      // ensure any students not in record default to H
      classStudents.forEach((st) => {
        if (!map[st.id]) {
          map[st.id] = { studentId: st.id, status: 'H' };
        }
      });
      setRecords(map);
      setTopicDelivered(existingSession.topicDelivered || '');
    } else {
      // Default all to 'H'
      const map: Record<string, AttendanceRecord> = {};
      classStudents.forEach((st) => {
        map[st.id] = { studentId: st.id, status: 'H' };
      });
      setRecords(map);
    }
  }, [selectedClassId, sessionDate, hourSlot]);

  const handleStatusChange = (studentId: string, status: StudentAttendanceStatus) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        studentId,
        status,
      },
    }));
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        studentId,
        status: prev[studentId]?.status || 'H',
        note,
      },
    }));
  };

  const handleMarkAllHadir = () => {
    const map: Record<string, AttendanceRecord> = {};
    classStudents.forEach((st) => {
      map[st.id] = {
        studentId: st.id,
        status: 'H',
        note: records[st.id]?.note || '',
      };
    });
    setRecords(map);
  };

  const handleSave = () => {
    const recordList: AttendanceRecord[] = classStudents.map((st) => {
      return (
        records[st.id] || {
          studentId: st.id,
          status: 'H',
        }
      );
    });

    const newSession: AttendanceSession = {
      id: existingSession ? existingSession.id : `att-${Date.now()}`,
      classId: selectedClassId,
      subject,
      date: sessionDate,
      hourSlot,
      topicDelivered,
      records: recordList,
      createdAt: existingSession ? existingSession.createdAt : new Date().toISOString(),
    };

    onSaveSession(newSession);
    setNotification('Data presensi berhasil disimpan & disinkronkan ke Jurnal Harian!');
    setTimeout(() => setNotification(null), 3000);
  };

  // Compute live statistics
  const total = classStudents.length;
  let hadirCount = 0;
  let sakitCount = 0;
  let izinCount = 0;
  let alpaCount = 0;

  classStudents.forEach((st) => {
    const rec = records[st.id];
    const stVal = rec?.status || 'H';
    if (stVal === 'H') hadirCount++;
    else if (stVal === 'S') sakitCount++;
    else if (stVal === 'I') izinCount++;
    else if (stVal === 'A') alpaCount++;
  });

  const presentPercent = total > 0 ? Math.round((hadirCount / total) * 100) : 0;

  const filteredStudents = classStudents.filter((st) =>
    st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    st.nisn.includes(searchQuery)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Config Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Presensi Kelas Terintegrasi</span>
              <span aria-hidden="true">·</span>
              <span>Otomatis Masuk Jurnal Harian Guru</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Presensi Cepat Pembelajaran
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllHadir}
              className="px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Tandai Semua Hadir</span>
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Presensi</span>
            </button>
          </div>
        </div>

        {/* Filters & Session Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-600">Rombel / Kelas</label>
              {onOpenClassManager && (
                <button
                  type="button"
                  onClick={onOpenClassManager}
                  className="text-[10px] text-emerald-700 hover:underline font-bold"
                >
                  + Kelola / Import (.xls)
                </button>
              )}
            </div>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} [{c.level || 'SMA'}] ({c.major})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600">Tanggal Mengajar</label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600">Jam Pelajaran (JP)</label>
            <select
              value={hourSlot}
              onChange={(e) => setHourSlot(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="JP 1 - 2 (07.30 - 09.00)">JP 1 - 2 (07.30 - 09.00)</option>
              <option value="JP 3 - 5 (09.15 - 11.30)">JP 3 - 5 (09.15 - 11.30)</option>
              <option value="JP 4 - 6 (10.00 - 12.15)">JP 4 - 6 (10.00 - 12.15)</option>
              <option value="JP 7 - 8 (13.00 - 14.30)">JP 7 - 8 (13.00 - 14.30)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600">Mata Pelajaran</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4 space-y-1">
            <label className="text-[11px] font-semibold text-slate-600">
              Materi / Topik Pembelajaran yang Disampaikan Hari Ini
            </label>
            <input
              type="text"
              value={topicDelivered}
              onChange={(e) => setTopicDelivered(e.target.value)}
              placeholder="Contoh: Pembahasan Berpikir Komputasional dan Algoritma Pencarian"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Real-time Summary Counters Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl">
          <div className="text-[11px] font-medium text-slate-500">Tingkat Kehadiran</div>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
            {presentPercent}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {hadirCount} dari {total} siswa
          </div>
        </div>

        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
          <div className="text-[11px] font-semibold text-emerald-800">Hadir (H)</div>
          <div className="text-xl font-bold text-emerald-900 font-mono tabular-nums mt-0.5">
            {hadirCount}
          </div>
          <div className="text-[10px] text-emerald-700 mt-1">Mengikuti KBM</div>
        </div>

        <div className="p-3.5 bg-sky-50/70 border border-sky-200 rounded-xl">
          <div className="text-[11px] font-semibold text-sky-800">Sakit (S)</div>
          <div className="text-xl font-bold text-sky-900 font-mono tabular-nums mt-0.5">
            {sakitCount}
          </div>
          <div className="text-[10px] text-sky-700 mt-1">Surat / Keterangan</div>
        </div>

        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl">
          <div className="text-[11px] font-semibold text-amber-800">Izin (I)</div>
          <div className="text-xl font-bold text-amber-900 font-mono tabular-nums mt-0.5">
            {izinCount}
          </div>
          <div className="text-[10px] text-amber-700 mt-1">Kegiatan / Keluarga</div>
        </div>

        <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl col-span-2 sm:col-span-1">
          <div className="text-[11px] font-semibold text-rose-800">Alpa (A)</div>
          <div className="text-xl font-bold text-rose-900 font-mono tabular-nums mt-0.5">
            {alpaCount}
          </div>
          <div className="text-[10px] text-rose-700 mt-1">Tanpa Keterangan</div>
        </div>
      </div>

      {/* Student List & Attendance Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {/* Search & Actions Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama siswa atau NISN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Petunjuk:</span>
            <span className="font-semibold text-emerald-700">H: Hadir</span> ·
            <span className="font-semibold text-sky-700">S: Sakit</span> ·
            <span className="font-semibold text-amber-700">I: Izin</span> ·
            <span className="font-semibold text-rose-700">A: Alpa</span>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-3 text-center w-12">No</th>
                <th className="p-3 text-left">Nama Siswa</th>
                <th className="p-3 text-left w-32 hidden sm:table-cell">NISN / NIS</th>
                <th className="p-3 text-center w-60">Status Kehadiran</th>
                <th className="p-3 text-left">Catatan Khusus (Alasan / Keterangan)</th>
                <th className="p-3 text-center w-28">Hubungi Wali</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Tidak ada siswa ditemukan di kelas ini.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st, index) => {
                  const rec = records[st.id] || { studentId: st.id, status: 'H' };
                  const currentStatus = rec.status;

                  return (
                    <tr
                      key={st.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        currentStatus === 'A'
                          ? 'bg-rose-50/30'
                          : currentStatus === 'S'
                          ? 'bg-sky-50/20'
                          : currentStatus === 'I'
                          ? 'bg-amber-50/20'
                          : ''
                      }`}
                    >
                      <td className="p-3 text-center font-mono text-slate-400">
                        {index + 1}
                      </td>

                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{st.name}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 sm:hidden">
                          <span>{st.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                          <span>·</span>
                          <span className="font-mono">{st.nisn}</span>
                        </div>
                      </td>

                      <td className="p-3 font-mono text-slate-500 hidden sm:table-cell">
                        <div>{st.nisn}</div>
                        <div className="text-[10px] text-slate-400">{st.nis}</div>
                      </td>

                      {/* 1-Click Status Toggles */}
                      <td className="p-3 text-center">
                        <div className="inline-flex p-0.5 bg-slate-100 rounded-lg gap-0.5">
                          {(['H', 'S', 'I', 'A'] as StudentAttendanceStatus[]).map((stKey) => {
                            const isSelected = currentStatus === stKey;
                            let activeClass = '';
                            if (isSelected) {
                              if (stKey === 'H') activeClass = 'bg-emerald-600 text-white shadow-xs font-bold';
                              if (stKey === 'S') activeClass = 'bg-sky-600 text-white shadow-xs font-bold';
                              if (stKey === 'I') activeClass = 'bg-amber-600 text-white shadow-xs font-bold';
                              if (stKey === 'A') activeClass = 'bg-rose-600 text-white shadow-xs font-bold';
                            } else {
                              activeClass = 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50';
                            }

                            return (
                              <button
                                key={stKey}
                                type="button"
                                onClick={() => handleStatusChange(st.id, stKey)}
                                className={`w-8 h-7 text-xs rounded-md transition-all flex items-center justify-center ${activeClass}`}
                              >
                                {stKey}
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      {/* Quick Note */}
                      <td className="p-3">
                        <input
                          type="text"
                          placeholder={currentStatus !== 'H' ? 'Contoh: Izin acara keluarga, demam...' : 'Catatan opsional...'}
                          value={rec.note || ''}
                          onChange={(e) => handleNoteChange(st.id, e.target.value)}
                          className={`w-full text-xs px-2.5 py-1.5 rounded-md border focus:outline-none transition-colors ${
                            currentStatus !== 'H'
                              ? 'border-slate-300 bg-white font-medium text-slate-800'
                              : 'border-transparent hover:border-slate-200 focus:border-slate-300 bg-transparent focus:bg-white text-slate-600'
                          }`}
                        />
                      </td>

                      {/* Contact Parent */}
                      <td className="p-3 text-center">
                        {st.parentPhone ? (
                          <a
                            href={`https://wa.me/${st.parentPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Yth. Bapak/Ibu ${st.parentName} (Wali dari Ananda ${st.name}). Kami dari sekolah menginformasikan status presensi hari ini: ${
                                currentStatus === 'H'
                                  ? 'Hadir'
                                  : currentStatus === 'S'
                                  ? 'Sakit'
                                  : currentStatus === 'I'
                                  ? 'Izin'
                                  : 'Belum hadir / Alpa'
                              }. Mohon konfirmasi jika ada kekeliruan. Terima kasih.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title={`Kirim WA ke Orang Tua (${st.parentName})`}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
