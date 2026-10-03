'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table';
import * as XLSX from 'xlsx';
import {
  SchoolClass,
  Student,
  GradeItem,
  StudentGradeEntry,
} from '../../types/database';
import {
  Calculator,
  Download,
  Printer,
  Search,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  ArrowUpDown,
  FileSpreadsheet,
  Sparkles,
  TrendingUp,
  Percent,
} from 'lucide-react';

export interface StudentScores {
  tugas: number;
  uts: number;
  uas: number;
  finalScore?: number;
}

/**
 * Auto-Generated Narrative Logic for Kurikulum Merdeka & E-Rapor
 */
export function generateReportNarrative(
  studentName: string,
  scores: { tugas: number; uts: number; uas: number; finalScore?: number },
  subjectName: string = 'Informatika'
): string {
  const final =
    scores.finalScore !== undefined
      ? scores.finalScore
      : Math.round((scores.tugas * 0.3 + scores.uts * 0.3 + scores.uas * 0.4) * 10) / 10;

  if (final >= 85) {
    return `Ananda ${studentName} menunjukkan penguasaan yang sangat baik dalam memahami materi ${subjectName}. Memiliki ketelitian tinggi dalam pengerjaan tugas dan asesmen, serta konsisten mempertahankan prestasi belajarnya.`;
  } else if (final >= 75) {
    return `Ananda ${studentName} menunjukkan pemahaman yang cukup baik dan telah mencapai KKM pada mata pelajaran ${subjectName}. Disarankan untuk terus mempertahankan ketekunan belajar dan keaktifan di kelas.`;
  } else {
    return `Ananda ${studentName} telah berusaha, namun memerlukan bimbingan lebih lanjut pada materi ${subjectName}. Disarankan mengikuti program remedial dan pendampingan belajar intensif di rumah.`;
  }
}

export interface GradeRow {
  id: string;
  studentId: string;
  nisn: string;
  name: string;
  tugas: number; // 30%
  uts: number;   // 30%
  uas: number;   // 40%
  finalScore: number;
  status: 'Lulus' | 'Remedial';
  narrative: string;
}

interface GradebookModuleProps {
  classes: SchoolClass[];
  students: Student[];
  gradeItems: GradeItem[];
  studentGrades: StudentGradeEntry[];
  onUpdateScore: (studentId: string, gradeItemId: string, score: number) => void;
  onAddGradeItem?: (item: Omit<GradeItem, 'id'>) => void;
  onDeleteGradeItem?: (id: string) => void;
  defaultClassId?: string;
  onOpenClassManager?: () => void;
}

const columnHelper = createColumnHelper<GradeRow>();

export const GradebookModule: React.FC<GradebookModuleProps> = ({
  classes,
  students,
  gradeItems,
  studentGrades,
  onUpdateScore,
  defaultClassId,
  onOpenClassManager,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(
    defaultClassId || classes[0]?.id || ''
  );
  const [subjectName, setSubjectName] = useState<string>('Informatika');
  const [kkmThreshold, setKkmThreshold] = useState<number>(75);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [exportNotification, setExportNotification] = useState<string | null>(null);

  // Filter students by selected class
  const classStudents = useMemo(() => {
    return students.filter((s) => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  // Build reactive local state for table rows
  const [tableData, setTableData] = useState<GradeRow[]>([]);

  useEffect(() => {
    const gradesMap: Record<string, Record<string, number>> = {};
    studentGrades.forEach((g) => {
      gradesMap[g.studentId] = g.scores;
    });

    const rows: GradeRow[] = classStudents.map((st) => {
      const s = gradesMap[st.id] || {};
      // Map existing score inputs or default realistic values
      const tugas = s['tugas'] ?? s['gi-01'] ?? 80;
      const uts = s['uts'] ?? s['gi-04'] ?? 78;
      const uas = s['uas'] ?? s['gi-05'] ?? 82;

      const finalScore = Math.round((tugas * 0.3 + uts * 0.3 + uas * 0.4) * 10) / 10;
      const status: 'Lulus' | 'Remedial' = finalScore >= kkmThreshold ? 'Lulus' : 'Remedial';
      const narrative = generateReportNarrative(st.name, { tugas, uts, uas, finalScore }, subjectName);

      return {
        id: st.id,
        studentId: st.id,
        nisn: st.nisn,
        name: st.name,
        tugas,
        uts,
        uas,
        finalScore,
        status,
        narrative,
      };
    });

    setTableData(rows);
  }, [classStudents, studentGrades, kkmThreshold, subjectName]);

  // Handle score cell edits
  const handleScoreChange = (
    studentId: string,
    field: 'tugas' | 'uts' | 'uas',
    valueStr: string
  ) => {
    const numericValue = valueStr === '' ? 0 : Math.min(100, Math.max(0, parseFloat(valueStr) || 0));

    setTableData((prevRows) =>
      prevRows.map((row) => {
        if (row.studentId === studentId) {
          const updatedRow = { ...row, [field]: numericValue };
          const finalScore =
            Math.round(
              (updatedRow.tugas * 0.3 + updatedRow.uts * 0.3 + updatedRow.uas * 0.4) * 10
            ) / 10;
          const status: 'Lulus' | 'Remedial' = finalScore >= kkmThreshold ? 'Lulus' : 'Remedial';
          const narrative = generateReportNarrative(
            updatedRow.name,
            { tugas: updatedRow.tugas, uts: updatedRow.uts, uas: updatedRow.uas, finalScore },
            subjectName
          );

          return {
            ...updatedRow,
            finalScore,
            status,
            narrative,
          };
        }
        return row;
      })
    );

    // Sync to store
    onUpdateScore(studentId, field, numericValue);
  };

  // Copy narrative to clipboard
  const handleCopyNarrative = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export to Excel (.xlsx) using SheetJS (xlsx)
  const handleExportExcel = () => {
    const selectedClass = classes.find((c) => c.id === selectedClassId);
    const className = selectedClass ? selectedClass.name : 'Kelas';

    // Build worksheet data array of arrays (AOA)
    const headers = [
      'No',
      'NISN',
      'Nama Siswa',
      'Tugas (30%)',
      'UTS (30%)',
      'UAS (40%)',
      'Nilai Akhir',
      `Status (KKM >= ${kkmThreshold})`,
      'Deskripsi Narasi E-Rapor',
    ];

    const dataRows = tableData.map((row, idx) => [
      idx + 1,
      row.nisn,
      row.name,
      row.tugas,
      row.uts,
      row.uas,
      row.finalScore,
      row.status,
      row.narrative,
    ]);

    // Create workbook & worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([
      [`BUKU NILAI & AUTO-NARASI RAPOR - ${subjectName.toUpperCase()}`],
      [`Kelas: ${className} | Standar KKM: ${kkmThreshold} | Tanggal Ekspor: ${new Date().toLocaleDateString('id-ID')}`],
      [], // blank line
      headers,
      ...dataRows,
    ]);

    // Auto column widths
    worksheet['!cols'] = [
      { wch: 5 },  // No
      { wch: 14 }, // NISN
      { wch: 28 }, // Nama
      { wch: 14 }, // Tugas
      { wch: 14 }, // UTS
      { wch: 14 }, // UAS
      { wch: 14 }, // Nilai Akhir
      { wch: 12 }, // Status
      { wch: 75 }, // Narasi
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Buku Nilai');

    const fileName = `Buku_Nilai_${className.replace(/\s+/g, '_')}_${subjectName}_${Date.now()}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    setExportNotification(`File Excel berhasil diunduh: ${fileName}`);
    setTimeout(() => setExportNotification(null), 3500);
  };

  // Print PDF action
  const handlePrintPDF = () => {
    window.print();
  };

  // TanStack Table Column Definitions
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'index',
        header: 'No',
        cell: (info) => (
          <span className="font-mono text-slate-400 text-xs">{info.row.index + 1}</span>
        ),
      }),
      columnHelper.accessor('name', {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1.5 font-semibold text-slate-700 hover:text-slate-900"
          >
            <span>Nama Siswa</span>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        ),
        cell: (info) => (
          <div>
            <div className="font-semibold text-slate-900 text-xs">{info.getValue()}</div>
            <div className="font-mono text-[10px] text-slate-400">{info.row.original.nisn}</div>
          </div>
        ),
      }),
      columnHelper.accessor('tugas', {
        header: () => (
          <div className="text-center">
            <span className="font-bold text-slate-800">Tugas</span>
            <span className="block text-[10px] text-emerald-700 font-mono">Bobot 30%</span>
          </div>
        ),
        cell: (info) => {
          const val = info.getValue();
          return (
            <div className="flex justify-center">
              <input
                type="number"
                min={0}
                max={100}
                value={val === 0 ? '' : val}
                onChange={(e) =>
                  handleScoreChange(info.row.original.studentId, 'tugas', e.target.value)
                }
                className={`w-16 text-center font-mono font-bold text-xs py-1.5 px-1 rounded-md border transition-colors ${
                  val < kkmThreshold
                    ? 'bg-rose-50 border-rose-300 text-rose-700 focus:ring-rose-500'
                    : 'bg-white border-slate-200 text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                }`}
              />
            </div>
          );
        },
      }),
      columnHelper.accessor('uts', {
        header: () => (
          <div className="text-center">
            <span className="font-bold text-slate-800">UTS</span>
            <span className="block text-[10px] text-emerald-700 font-mono">Bobot 30%</span>
          </div>
        ),
        cell: (info) => {
          const val = info.getValue();
          return (
            <div className="flex justify-center">
              <input
                type="number"
                min={0}
                max={100}
                value={val === 0 ? '' : val}
                onChange={(e) =>
                  handleScoreChange(info.row.original.studentId, 'uts', e.target.value)
                }
                className={`w-16 text-center font-mono font-bold text-xs py-1.5 px-1 rounded-md border transition-colors ${
                  val < kkmThreshold
                    ? 'bg-rose-50 border-rose-300 text-rose-700 focus:ring-rose-500'
                    : 'bg-white border-slate-200 text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                }`}
              />
            </div>
          );
        },
      }),
      columnHelper.accessor('uas', {
        header: () => (
          <div className="text-center">
            <span className="font-bold text-slate-800">UAS</span>
            <span className="block text-[10px] text-emerald-700 font-mono">Bobot 40%</span>
          </div>
        ),
        cell: (info) => {
          const val = info.getValue();
          return (
            <div className="flex justify-center">
              <input
                type="number"
                min={0}
                max={100}
                value={val === 0 ? '' : val}
                onChange={(e) =>
                  handleScoreChange(info.row.original.studentId, 'uas', e.target.value)
                }
                className={`w-16 text-center font-mono font-bold text-xs py-1.5 px-1 rounded-md border transition-colors ${
                  val < kkmThreshold
                    ? 'bg-rose-50 border-rose-300 text-rose-700 focus:ring-rose-500'
                    : 'bg-white border-slate-200 text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                }`}
              />
            </div>
          );
        },
      }),
      columnHelper.accessor('finalScore', {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center justify-center gap-1 font-bold text-slate-900 w-full"
          >
            <span>Nilai Akhir</span>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        ),
        cell: (info) => (
          <div className="text-center">
            <span className="text-sm font-extrabold font-mono text-slate-900 tabular-nums">
              {info.getValue()}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const isLulus = info.getValue() === 'Lulus';
          return (
            <div className="text-center">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  isLulus
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                    : 'bg-rose-50 text-rose-700 border border-rose-200/80'
                }`}
              >
                {isLulus ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-rose-600" />
                )}
                <span>{info.getValue()}</span>
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor('narrative', {
        header: 'Deskripsi Narasi Rapor (Auto E-Rapor)',
        cell: (info) => {
          const text = info.getValue();
          const rowId = info.row.original.id;
          const isCopied = copiedId === rowId;
          return (
            <div className="space-y-1 py-1 max-w-md">
              <p className="text-xs text-slate-700 italic leading-relaxed line-clamp-2 hover:line-clamp-none transition-all">
                "{text}"
              </p>
              <div className="no-print">
                <button
                  type="button"
                  onClick={() => handleCopyNarrative(rowId, text)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                >
                  {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                  <span>{isCopied ? 'Tersalin ke Clipboard!' : 'Salin Narasi'}</span>
                </button>
              </div>
            </div>
          );
        },
      }),
    ],
    [kkmThreshold, copiedId]
  );

  // Initialize TanStack Table instance
  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Summary Metrics
  const totalStudentsInTable = tableData.length;
  const lulusCount = tableData.filter((r) => r.status === 'Lulus').length;
  const remedialCount = totalStudentsInTable - lulusCount;
  const passingRate =
    totalStudentsInTable > 0 ? Math.round((lulusCount / totalStudentsInTable) * 100) : 0;
  const averageFinal =
    totalStudentsInTable > 0
      ? Math.round(
          (tableData.reduce((acc, r) => acc + r.finalScore, 0) / totalStudentsInTable) * 10
        ) / 10
      : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 select-none">
      {/* Toast Notification */}
      {exportNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{exportNotification}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Kurikulum Merdeka & E-Rapor Engine</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 font-semibold">Tugas (30%) + UTS (30%) + UAS (40%)</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Buku Nilai & Auto-Narasi Rapor
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Tabel interaktif TanStack dengan kalkulasi terbobot instan dan deskripsi capaian rapor otomatis siap ekspor.
            </p>
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintPDF}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="Cetak format kertas atau simpan ke PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Cetak / PDF</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors"
              title="Unduh seluruh tabel dan narasi dalam format Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Unduh Excel (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Filter & Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-600">Pilih Rombel / Kelas</label>
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
            <label className="text-[11px] font-semibold text-slate-600">Mata Pelajaran</label>
            <input
              type="text"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600">
              Ambang Batas Kelulusan (KKM / KKTP)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={50}
                max={95}
                value={kkmThreshold}
                onChange={(e) => setKkmThreshold(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-xs text-slate-500 whitespace-nowrap">Poin Min.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 no-print">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-medium">Rata-rata Kelas</span>
            <Calculator className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {averageFinal}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Target KKM: {kkmThreshold}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-medium">Tingkat Kelulusan</span>
            <Percent className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
            {passingRate}%
          </div>
          <div className="text-[10px] text-emerald-600 mt-0.5">{lulusCount} dari {totalStudentsInTable} siswa tuntas</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-medium">Siswa Lulus</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {lulusCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Mencapai KKM ({'>='} {kkmThreshold})</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-medium">Siswa Remedial</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-700 mt-1 tabular-nums">
            {remedialCount}
          </div>
          <div className="text-[10px] text-rose-500 mt-0.5">Memerlukan bimbingan (&lt; {kkmThreshold})</div>
        </div>
      </div>

      {/* TanStack Table View */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs print:border-none print:shadow-none">
        {/* Search Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60 no-print">
          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari siswa atau NISN..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
            <span>Rumus Bobot:</span>
            <span className="font-mono text-slate-800 bg-slate-200/70 px-2 py-0.5 rounded">
              NA = (Tugas × 0.3) + (UTS × 0.3) + (UAS × 0.4)
            </span>
          </div>
        </div>

        {/* Printable Kop Header (Appears only during browser print) */}
        <div className="print-only text-center pb-4 mb-4 border-b-2 border-slate-900 space-y-1">
          <p className="text-xs font-semibold uppercase">PEMERINTAH PROVINSI DKI JAKARTA — DINAS PENDIDIKAN</p>
          <h2 className="text-base font-bold">DAFTAR NILAI DAN CAPAIAN RAPOR SISWA</h2>
          <p className="text-xs">Mata Pelajaran: {subjectName} | Standar KKM: {kkmThreshold}</p>
        </div>

        {/* Table Markup */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="p-3 text-left first:text-center first:w-12 align-middle border-r border-slate-200/50 last:border-r-0"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-8 text-slate-400">
                    Tidak ada data siswa ditemukan untuk kelas ini.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => {
                  const isRemedial = row.original.status === 'Remedial';
                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isRemedial ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="p-3 align-middle border-r border-slate-100/80 last:border-r-0"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Row Counts */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500 no-print">
          <span>Menampilkan {table.getRowModel().rows.length} siswa</span>
          <span>Ambang KKM: {kkmThreshold} Poin</span>
        </div>
      </div>
    </div>
  );
};
