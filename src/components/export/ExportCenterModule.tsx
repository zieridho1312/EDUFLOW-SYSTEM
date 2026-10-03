import React, { useState } from 'react';
import {
  EduFlowState,
  calculateWeightedAverage,
  generateERaporNarrative,
} from '../../services/storage';
import {
  Printer,
  FileText,
  Download,
  Copy,
  Check,
  Calendar,
  School,
  UserCheck,
  CheckCircle2,
  Share2,
  MessageSquare,
  Sparkles,
  Database,
} from 'lucide-react';

interface ExportCenterModuleProps {
  state: EduFlowState;
}

export const ExportCenterModule: React.FC<ExportCenterModuleProps> = ({ state }) => {
  const { teacher, classes, students, attendanceSessions, journals, gradeItems, studentGrades, behaviorLogs } = state;
  const [selectedDoc, setSelectedDoc] = useState<'journal' | 'attendance' | 'grades' | 'parent_slip'>('journal');
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [copied, setCopied] = useState<boolean>(false);

  const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter((s) => s.classId === selectedClass?.id);
  const classGradeItems = gradeItems.filter((g) => g.classId === selectedClass?.id);
  const classJournals = journals.filter((j) => j.classId === selectedClass?.id);

  // For parent slip
  const targetStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const studentScores = studentGrades.find((sg) => sg.studentId === targetStudent?.id)?.scores || {};
  const studentFinalScore = calculateWeightedAverage(studentScores, classGradeItems);
  const studentNarrative = generateERaporNarrative(targetStudent?.name || '', studentScores, classGradeItems);
  const studentBehaviorList = behaviorLogs.filter((b) => b.studentId === targetStudent?.id);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Control Navigation Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Pusat Arsip Administrasi & Pelaporan</span>
              <span aria-hidden="true">·</span>
              <span>Format Standar Dinas Pendidikan</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Pusat Cetak & Administrasi Guru
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Dokumen Terpilih</span>
            </button>
          </div>
        </div>

        {/* Tab & Class Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <div className="sm:col-span-2 space-y-1">
            <label className="text-[11px] font-semibold text-slate-600">Pilih Jenis Dokumen</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setSelectedDoc('journal')}
                className={`py-2 px-2 rounded-md transition-colors truncate text-center ${
                  selectedDoc === 'journal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Jurnal Harian
              </button>
              <button
                onClick={() => setSelectedDoc('attendance')}
                className={`py-2 px-2 rounded-md transition-colors truncate text-center ${
                  selectedDoc === 'attendance' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Rekap Presensi
              </button>
              <button
                onClick={() => setSelectedDoc('grades')}
                className={`py-2 px-2 rounded-md transition-colors truncate text-center ${
                  selectedDoc === 'grades' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Buku Nilai
              </button>
              <button
                onClick={() => setSelectedDoc('parent_slip')}
                className={`py-2 px-2 rounded-md transition-colors truncate text-center ${
                  selectedDoc === 'parent_slip' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Slip Wali Murid
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600">Pilih Rombel</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.major})
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedDoc === 'parent_slip' && (
          <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
              Pilih Siswa:
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="text-xs font-medium px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 max-w-xs"
            >
              {classStudents.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.nisn})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Printable Document Sheet */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-xs print:p-0 print:border-none print:shadow-none space-y-6">
        {/* Kop Surat Resmi */}
        <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            PEMERINTAH PROVINSI DKI JAKARTA — DINAS PENDIDIKAN
          </p>
          <h2 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight">
            {teacher.schoolName.toUpperCase()}
          </h2>
          <p className="text-[11px] text-slate-600">
            {teacher.schoolAddress} — Email: info@sman1nusantara.sch.id
          </p>
        </div>

        {/* 1. DOCUMENT: JURNAL HARIAN MENGAJAR GURU */}
        {selectedDoc === 'journal' && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 underline uppercase">
                JURNAL HARIAN KEGIATAN MENGAJAR GURU
              </h3>
              <p className="text-xs text-slate-600">
                Tahun Ajaran {teacher.academicYear} — Semester {teacher.semester}
              </p>
            </div>

            <div className="grid grid-cols-2 text-xs">
              <div className="space-y-1">
                <p><strong>Nama Guru:</strong> {teacher.name}</p>
                <p><strong>NIP:</strong> {teacher.nip}</p>
              </div>
              <div className="space-y-1 text-right">
                <p><strong>Kelas / Rombel:</strong> {selectedClass?.name}</p>
                <p><strong>Mata Pelajaran:</strong> Informatika</p>
              </div>
            </div>

            <table className="w-full text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                  <th className="border border-slate-300 p-2 text-center w-10">No</th>
                  <th className="border border-slate-300 p-2 text-left w-24">Hari/Tgl</th>
                  <th className="border border-slate-300 p-2 text-left w-28">Jam Pelajaran</th>
                  <th className="border border-slate-300 p-2 text-left">Materi / Kegiatan Pembelajaran</th>
                  <th className="border border-slate-300 p-2 text-center w-28">Presensi (H/S/I/A)</th>
                  <th className="border border-slate-300 p-2 text-left">Catatan Khusus / Refleksi</th>
                </tr>
              </thead>
              <tbody>
                {classJournals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-4 text-slate-400">
                      Belum ada sesi jurnal yang terekam untuk kelas ini.
                    </td>
                  </tr>
                ) : (
                  classJournals.map((j, idx) => (
                    <tr key={j.id} className="border-b border-slate-200">
                      <td className="border border-slate-300 p-2 text-center font-mono">{idx + 1}</td>
                      <td className="border border-slate-300 p-2 font-mono">{j.date}</td>
                      <td className="border border-slate-300 p-2">{j.hourSlot}</td>
                      <td className="border border-slate-300 p-2 font-medium">{j.topicDelivered}</td>
                      <td className="border border-slate-300 p-2 text-center font-mono">
                        <span className="text-emerald-700 font-bold">{j.presentCount}H</span> /{' '}
                        <span className="text-sky-700">{j.sickCount}S</span> /{' '}
                        <span className="text-amber-700">{j.permitCount}I</span> /{' '}
                        <span className="text-rose-700">{j.absentCount}A</span>
                      </td>
                      <td className="border border-slate-300 p-2 text-slate-600">
                        {j.studentIssues}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. DOCUMENT: REKAPITULASI PRESENSI KELAS */}
        {selectedDoc === 'attendance' && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 underline uppercase">
                REKAPITULASI KEHADIRAN SISWA BULANAN
              </h3>
              <p className="text-xs text-slate-600">
                Kelas: {selectedClass?.name} ({selectedClass?.major}) — Mata Pelajaran Informatika
              </p>
            </div>

            <table className="w-full text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                  <th className="border border-slate-300 p-2 text-center w-10">No</th>
                  <th className="border border-slate-300 p-2 text-left w-28">NISN</th>
                  <th className="border border-slate-300 p-2 text-left">Nama Siswa</th>
                  <th className="border border-slate-300 p-2 text-center w-12">L/P</th>
                  <th className="border border-slate-300 p-2 text-center w-14">Hadir</th>
                  <th className="border border-slate-300 p-2 text-center w-14">Sakit</th>
                  <th className="border border-slate-300 p-2 text-center w-14">Izin</th>
                  <th className="border border-slate-300 p-2 text-center w-14">Alpa</th>
                  <th className="border border-slate-300 p-2 text-center w-16">% Hadir</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((st, idx) => {
                  return (
                    <tr key={st.id} className="border-b border-slate-200">
                      <td className="border border-slate-300 p-2 text-center font-mono">{idx + 1}</td>
                      <td className="border border-slate-300 p-2 font-mono text-slate-600">{st.nisn}</td>
                      <td className="border border-slate-300 p-2 font-semibold text-slate-900">{st.name}</td>
                      <td className="border border-slate-300 p-2 text-center">{st.gender}</td>
                      <td className="border border-slate-300 p-2 text-center font-mono">18</td>
                      <td className="border border-slate-300 p-2 text-center font-mono">1</td>
                      <td className="border border-slate-300 p-2 text-center font-mono">1</td>
                      <td className="border border-slate-300 p-2 text-center font-mono">0</td>
                      <td className="border border-slate-300 p-2 text-center font-mono font-bold text-emerald-800">
                        95%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. DOCUMENT: BUKU NILAI & E-RAPOR */}
        {selectedDoc === 'grades' && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 underline uppercase">
                DAFTAR NILAI & CAPAIAN KOMPETENSI SISWA (E-RAPOR)
              </h3>
              <p className="text-xs text-slate-600">
                Rombel: {selectedClass?.name} — Semester {teacher.semester} TA {teacher.academicYear}
              </p>
            </div>

            <table className="w-full text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                  <th className="border border-slate-300 p-2 text-center w-10">No</th>
                  <th className="border border-slate-300 p-2 text-left w-36">Nama Siswa</th>
                  {classGradeItems.map((g) => (
                    <th key={g.id} className="border border-slate-300 p-2 text-center font-mono">
                      {g.code}
                    </th>
                  ))}
                  <th className="border border-slate-300 p-2 text-center w-16 bg-slate-200">Nilai Akhir</th>
                  <th className="border border-slate-300 p-2 text-left">Deskripsi Capaian Kompetensi (E-Rapor)</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((st, idx) => {
                  const scores = studentGrades.find((sg) => sg.studentId === st.id)?.scores || {};
                  const avg = calculateWeightedAverage(scores, classGradeItems);
                  const narrative = generateERaporNarrative(st.name, scores, classGradeItems);
                  return (
                    <tr key={st.id} className="border-b border-slate-200">
                      <td className="border border-slate-300 p-2 text-center font-mono">{idx + 1}</td>
                      <td className="border border-slate-300 p-2 font-semibold text-slate-900">{st.name}</td>
                      {classGradeItems.map((g) => (
                        <td key={g.id} className="border border-slate-300 p-2 text-center font-mono">
                          {scores[g.id] ?? '-'}
                        </td>
                      ))}
                      <td className="border border-slate-300 p-2 text-center font-mono font-bold bg-slate-50">
                        {avg}
                      </td>
                      <td className="border border-slate-300 p-2 text-slate-700 italic">
                        "{narrative}"
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. DOCUMENT: SLIP WALI MURID */}
        {selectedDoc === 'parent_slip' && targetStudent && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 underline uppercase">
                LEMBAR LAPORAN PERKEMBANGAN BELAJAR SISWA
              </h3>
              <p className="text-xs text-slate-600">
                Pemberitahuan Tengah Semester untuk Orang Tua / Wali Murid
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs space-y-1">
              <div className="grid grid-cols-2">
                <p><strong>Nama Siswa:</strong> {targetStudent.name}</p>
                <p><strong>Kelas / Rombel:</strong> {selectedClass?.name}</p>
              </div>
              <div className="grid grid-cols-2">
                <p><strong>NISN / NIS:</strong> {targetStudent.nisn} / {targetStudent.nis}</p>
                <p><strong>Wali Murid:</strong> Bapak/Ibu {targetStudent.parentName}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                A. Rekap Capaian Asesmen (Mata Pelajaran Informatika)
              </h4>
              <table className="w-full text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 p-2 text-left">Asesmen / Materi Pokok</th>
                    <th className="border border-slate-300 p-2 text-center w-24">Skor Siswa</th>
                    <th className="border border-slate-300 p-2 text-center w-24">KKTP Target</th>
                    <th className="border border-slate-300 p-2 text-center w-24">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {classGradeItems.map((g) => {
                    const score = studentScores[g.id] ?? 0;
                    const pass = score >= g.kktp;
                    return (
                      <tr key={g.id}>
                        <td className="border border-slate-300 p-2">{g.title} ({g.code})</td>
                        <td className="border border-slate-300 p-2 text-center font-mono font-bold">{score}</td>
                        <td className="border border-slate-300 p-2 text-center font-mono">{g.kktp}</td>
                        <td className="border border-slate-300 p-2 text-center font-semibold">
                          {pass ? 'Tuntas' : 'Remedial'}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-slate-50 font-bold">
                    <td className="border border-slate-300 p-2 text-right">Rata-rata Terbobot:</td>
                    <td className="border border-slate-300 p-2 text-center font-mono text-emerald-800">{studentFinalScore}</td>
                    <td className="border border-slate-300 p-2 text-center font-mono">75</td>
                    <td className="border border-slate-300 p-2 text-center">
                      {studentFinalScore >= 75 ? 'Tuntas KKTP' : 'Perlu Pendampingan'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                B. Narasi Deskripsi Capaian Kompetensi Guru
              </h4>
              <div className="p-3.5 bg-slate-50 rounded-lg text-xs leading-relaxed text-slate-800 italic border border-slate-200">
                "{studentNarrative}"
              </div>
            </div>

            {studentBehaviorList.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  C. Catatan Karakter & Sikap Profil Pelajar Pancasila
                </h4>
                <ul className="text-xs text-slate-700 list-disc list-inside space-y-1">
                  {studentBehaviorList.map((b) => (
                    <li key={b.id}>
                      <strong>[{b.dimensionP3}]</strong> {b.title}: {b.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Tanda Tangan Resmi Dinas */}
        <div className="pt-8 grid grid-cols-2 text-xs text-slate-800 text-center">
          <div className="space-y-16">
            <p>Mengetahui,<br/>Kepala {teacher.schoolName}</p>
            <div>
              <p className="font-bold underline">{teacher.principalName}</p>
              <p className="text-slate-500 font-mono text-[11px]">NIP. {teacher.principalNip}</p>
            </div>
          </div>
          <div className="space-y-16">
            <p>Jakarta, Oktober 2026<br/>Guru Mata Pelajaran</p>
            <div>
              <p className="font-bold underline">{teacher.name}</p>
              <p className="text-slate-500 font-mono text-[11px]">NIP. {teacher.nip}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
