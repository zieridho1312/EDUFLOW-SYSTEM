'use client';

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { SchoolClass, Student, EducationLevel } from '../../types/database';
import {
  Users,
  Plus,
  FileSpreadsheet,
  Upload,
  Download,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  School,
  GraduationCap,
  Calendar,
  Layers,
  ArrowRight,
  ClipboardList,
  Calculator,
  HeartHandshake,
  UserCheck,
  Phone,
  FileDown,
  X,
} from 'lucide-react';

interface ClassStudentManagerProps {
  classes: SchoolClass[];
  students: Student[];
  onAddClass: (classData: Omit<SchoolClass, 'id' | 'totalStudents'> & { id?: string }) => SchoolClass;
  onDeleteClass: (id: string) => void;
  onAddStudent: (studentData: Omit<Student, 'id'> & { id?: string }) => Student;
  onDeleteStudent: (id: string) => void;
  onImportClassesAndStudents: (
    classes: Array<{ name: string; level: EducationLevel; grade: number; major: string; room?: string }>,
    students: Array<{ name: string; nisn: string; nis?: string; gender: 'L' | 'P'; parentName?: string; parentPhone?: string; className: string }>
  ) => { success: boolean; classesAdded: number; studentsAdded: number; message: string };
  onNavigateTab: (tab: string, classId?: string) => void;
}

export const ClassStudentManagerModule: React.FC<ClassStudentManagerProps> = ({
  classes,
  students,
  onAddClass,
  onDeleteClass,
  onAddStudent,
  onDeleteStudent,
  onImportClassesAndStudents,
  onNavigateTab,
}) => {
  // Filter & Selected Class state
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<'ALL' | EducationLevel>('ALL');
  const [activeClassId, setActiveClassId] = useState<string>(classes[0]?.id || '');
  const [studentSearch, setStudentSearch] = useState<string>('');

  // Modals & Panels
  const [showAddClassModal, setShowAddClassModal] = useState<boolean>(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);

  // Add Class Form State (SD s/d SMA)
  const [newClassName, setNewClassName] = useState<string>('');
  const [newClassLevel, setNewClassLevel] = useState<EducationLevel>('SMA');
  const [newClassGrade, setNewClassGrade] = useState<number>(10);
  const [newClassMajor, setNewClassMajor] = useState<string>('Fase E (Umum)');
  const [newClassRoom, setNewClassRoom] = useState<string>('Ruang Kelas');

  // Add Student Form State
  const [newStudentName, setNewStudentName] = useState<string>('');
  const [newStudentNisn, setNewStudentNisn] = useState<string>('');
  const [newStudentNis, setNewStudentNis] = useState<string>('');
  const [newStudentGender, setNewStudentGender] = useState<'L' | 'P'>('L');
  const [newStudentParent, setNewStudentParent] = useState<string>('');
  const [newStudentPhone, setNewStudentPhone] = useState<string>('');

  // Import Preview State
  const [importingFile, setImportingFile] = useState<boolean>(false);
  const [importPreview, setImportPreview] = useState<{
    classes: Array<{ name: string; level: EducationLevel; grade: number; major: string; room?: string }>;
    students: Array<{ name: string; nisn: string; nis?: string; gender: 'L' | 'P'; parentName?: string; parentPhone?: string; className: string }>;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status Alerts
  const [toastMsg, setToastMsg] = useState<{ success: boolean; text: string } | null>(null);

  const showToast = (text: string, success: boolean = true) => {
    setToastMsg({ text, success });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Filtered Classes based on Education Level
  const filteredClasses = classes.filter((c) => {
    if (selectedLevelFilter === 'ALL') return true;
    return c.level === selectedLevelFilter;
  });

  // Currently active class object
  const currentClass = classes.find((c) => c.id === activeClassId) || filteredClasses[0] || classes[0];

  // Students of current class filtered by search
  const classStudents = students
    .filter((s) => s.classId === currentClass?.id)
    .filter((s) => {
      if (!studentSearch.trim()) return true;
      const q = studentSearch.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.nisn.includes(q) || s.nis.includes(q);
    });

  // Handle changing level to update grade & curriculum suggestions
  const handleLevelChange = (lvl: EducationLevel) => {
    setNewClassLevel(lvl);
    if (lvl === 'SD') {
      setNewClassGrade(4);
      setNewClassMajor('Fase B (Kurikulum Merdeka SD)');
      setNewClassName('Kelas 4-A');
    } else if (lvl === 'SMP') {
      setNewClassGrade(7);
      setNewClassMajor('Fase D (Kurikulum Merdeka SMP)');
      setNewClassName('Kelas 7-A');
    } else {
      setNewClassGrade(10);
      setNewClassMajor('Fase E (Umum)');
      setNewClassName('Kelas X-1');
    }
  };

  // Submit New Class
  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const created = onAddClass({
      name: newClassName.trim(),
      level: newClassLevel,
      grade: Number(newClassGrade),
      major: newClassMajor,
      room: newClassRoom || 'Ruang Kelas',
    });

    setActiveClassId(created.id);
    setShowAddClassModal(false);
    setNewClassName('');
    showToast(`Kelas ${created.name} (${created.level}) berhasil ditambahkan dan siap digunakan!`);
  };

  // Submit New Student
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !currentClass) return;

    onAddStudent({
      classId: currentClass.id,
      name: newStudentName.trim(),
      nisn: newStudentNisn.trim() || `00${Math.floor(10000000 + Math.random() * 90000000)}`,
      nis: newStudentNis.trim() || `${Math.floor(1000 + Math.random() * 9000)}`,
      gender: newStudentGender,
      parentName: newStudentParent.trim() || 'Orang Tua Siswa',
      parentPhone: newStudentPhone.trim() || '0812-0000-0000',
      address: 'Alamat Siswa',
    });

    setShowAddStudentModal(false);
    setNewStudentName('');
    setNewStudentNisn('');
    setNewStudentNis('');
    setNewStudentParent('');
    setNewStudentPhone('');
    showToast(`Siswa baru berhasil didaftarkan ke ${currentClass.name}!`);
  };

  // Download Sample Excel Template (.xlsx)
  const handleDownloadTemplate = () => {
    const headers = [
      'Nama Kelas',
      'Jenjang (SD/SMP/SMA)',
      'Tingkat (1-12)',
      'Fase / Jurusan',
      'NISN',
      'NIS',
      'Nama Siswa',
      'Jenis Kelamin (L/P)',
      'Nama Wali Murid',
      'No WhatsApp Wali',
    ];

    const sampleRows = [
      // Contoh SD
      ['Kelas 4-A', 'SD', 4, 'Fase B (SD)', '0091234561', '1041', 'Aditya Pratama', 'L', 'Bambang Pratama', '081234567890'],
      ['Kelas 4-A', 'SD', 4, 'Fase B (SD)', '0091234562', '1042', 'Alya Putri Lestari', 'P', 'Rina Wulandari', '081234567891'],
      // Contoh SMP
      ['Kelas 7-B', 'SMP', 7, 'Fase D (SMP)', '0082345671', '2071', 'Bagus Nugroho', 'L', 'Joko Nugroho', '081398765432'],
      ['Kelas 7-B', 'SMP', 7, 'Fase D (SMP)', '0082345672', '2072', 'Cantika Dewi', 'P', 'Siti Rahayu', '081398765433'],
      // Contoh SMA
      ['Kelas X-1', 'SMA', 10, 'Fase E (Umum)', '0073456781', '3001', 'Dimas Satria', 'L', 'Hendro Satria', '085712345678'],
      ['Kelas X-1', 'SMA', 10, 'Fase E (Umum)', '0073456782', '3002', 'Elvira Maharani', 'P', 'Ratna Dewi', '085712345679'],
      ['Kelas XI-MIPA 1', 'SMA', 11, 'Fase F (Sains)', '0064567891', '3101', 'Fajar Ramadhan', 'L', 'Agus Ramadhan', '087812345670'],
      ['Kelas XI-MIPA 1', 'SMA', 11, 'Fase F (Sains)', '0064567892', '3102', 'Gita Permatasari', 'P', 'Indah Permata', '087812345671'],
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    ws['!cols'] = [
      { wch: 18 }, // Kelas
      { wch: 20 }, // Jenjang
      { wch: 14 }, // Tingkat
      { wch: 22 }, // Fase
      { wch: 15 }, // NISN
      { wch: 12 }, // NIS
      { wch: 24 }, // Nama
      { wch: 18 }, // JK
      { wch: 22 }, // Wali
      { wch: 20 }, // No WA
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Siswa');
    XLSX.writeFile(wb, 'Template_Import_Kelas_Siswa_EduFlow.xlsx');
  };

  // Handle Excel File Upload & Parse
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportingFile(true);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (rawJson.length < 2) {
          showToast('File Excel kosong atau format kolom tidak ditemukan.', false);
          setImportingFile(false);
          return;
        }

        const headerRow = (rawJson[0] as any[]).map((h) => String(h || '').trim().toLowerCase());
        
        // Find column indexes
        const classIdx = headerRow.findIndex((h) => h.includes('kelas') || h.includes('rombel'));
        const levelIdx = headerRow.findIndex((h) => h.includes('jenjang'));
        const gradeIdx = headerRow.findIndex((h) => h.includes('tingkat') || h.includes('grade'));
        const majorIdx = headerRow.findIndex((h) => h.includes('fase') || h.includes('jurusan'));
        const nisnIdx = headerRow.findIndex((h) => h.includes('nisn'));
        const nisIdx = headerRow.findIndex((h) => h === 'nis' || h.includes('induk'));
        const nameIdx = headerRow.findIndex((h) => h.includes('nama') && !h.includes('wali'));
        const genderIdx = headerRow.findIndex((h) => h.includes('kelamin') || h === 'jk' || h === 'gender');
        const parentIdx = headerRow.findIndex((h) => h.includes('wali') || h.includes('orang tua'));
        const phoneIdx = headerRow.findIndex((h) => h.includes('hp') || h.includes('telepon') || h.includes('wa'));

        const parsedClassesMap = new Map<string, { name: string; level: EducationLevel; grade: number; major: string }>();
        const parsedStudents: Array<{
          name: string;
          nisn: string;
          nis?: string;
          gender: 'L' | 'P';
          parentName?: string;
          parentPhone?: string;
          className: string;
        }> = [];

        for (let i = 1; i < rawJson.length; i++) {
          const row = rawJson[i];
          if (!row || row.length === 0) continue;

          const rawClassName = classIdx >= 0 && row[classIdx] ? String(row[classIdx]).trim() : '';
          const rawStudentName = nameIdx >= 0 && row[nameIdx] ? String(row[nameIdx]).trim() : '';

          if (!rawClassName || !rawStudentName) continue;

          // Determine education level
          let rawLevelStr = levelIdx >= 0 && row[levelIdx] ? String(row[levelIdx]).trim().toUpperCase() : '';
          let level: EducationLevel = 'SMA';
          if (rawLevelStr.includes('SD')) level = 'SD';
          else if (rawLevelStr.includes('SMP')) level = 'SMP';
          else if (rawLevelStr.includes('SMK')) level = 'SMK';
          else if (rawLevelStr.includes('SMA')) level = 'SMA';
          else {
            // infer from class name
            if (/^(kelas\s*)?[1-6]([-A-Za-z]|$)/i.test(rawClassName)) level = 'SD';
            else if (/^(kelas\s*)?[7-9]([-A-Za-z]|$)/i.test(rawClassName)) level = 'SMP';
          }

          let grade = gradeIdx >= 0 && row[gradeIdx] ? parseInt(String(row[gradeIdx])) : 10;
          if (isNaN(grade)) {
            grade = level === 'SD' ? 4 : level === 'SMP' ? 7 : 10;
          }

          let major = majorIdx >= 0 && row[majorIdx] ? String(row[majorIdx]).trim() : '';
          if (!major) {
            major = level === 'SD' ? 'Kurikulum Merdeka SD' : level === 'SMP' ? 'Fase D (SMP)' : 'Fase E (Umum)';
          }

          if (!parsedClassesMap.has(rawClassName.toLowerCase())) {
            parsedClassesMap.set(rawClassName.toLowerCase(), {
              name: rawClassName,
              level,
              grade,
              major,
            });
          }

          const nisn = nisnIdx >= 0 && row[nisnIdx] ? String(row[nisnIdx]).trim() : '';
          const nis = nisIdx >= 0 && row[nisIdx] ? String(row[nisIdx]).trim() : '';
          const genderRaw = genderIdx >= 0 && row[genderIdx] ? String(row[genderIdx]).trim().toUpperCase() : 'L';
          const gender: 'L' | 'P' = genderRaw.startsWith('P') ? 'P' : 'L';
          const parentName = parentIdx >= 0 && row[parentIdx] ? String(row[parentIdx]).trim() : '';
          const parentPhone = phoneIdx >= 0 && row[phoneIdx] ? String(row[phoneIdx]).trim() : '';

          parsedStudents.push({
            name: rawStudentName,
            nisn,
            nis,
            gender,
            parentName,
            parentPhone,
            className: rawClassName,
          });
        }

        if (parsedStudents.length === 0) {
          showToast('Tidak ada data siswa yang valid ditemukan dalam file Excel.', false);
          setImportingFile(false);
          return;
        }

        setImportPreview({
          classes: Array.from(parsedClassesMap.values()),
          students: parsedStudents,
        });
        setShowImportModal(true);
      } catch (err: any) {
        showToast(`Gagal membaca file: ${err.message}`, false);
      } finally {
        setImportingFile(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsBinaryString(file);
  };

  // Confirm Import
  const handleConfirmImport = () => {
    if (!importPreview) return;

    const res = onImportClassesAndStudents(importPreview.classes, importPreview.students);
    setShowImportModal(false);
    setImportPreview(null);
    showToast(res.message, res.success);

    // If a class was created, select it
    if (importPreview.classes.length > 0) {
      const match = classes.find((c) => c.name.toLowerCase() === importPreview.classes[0].name.toLowerCase());
      if (match) setActiveClassId(match.id);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 select-none">
      {/* Toast Alert */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold text-white animate-in fade-in slide-in-from-bottom-2 max-w-md ${
            toastMsg.success ? 'bg-emerald-900 border border-emerald-500' : 'bg-rose-900 border border-rose-500'
          }`}
        >
          {toastMsg.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="p-1 rounded-md bg-emerald-100 text-emerald-800 font-bold">Basis Data Rombel</span>
              <span aria-hidden="true">·</span>
              <span>SD, SMP, dan SMA Terintegrasi Otomatis</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Kelola Kelas & Peserta Didik
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              Atur seluruh rombel yang Anda ampu dari jenjang SD hingga SMA. Data kelas dan siswa yang Anda buat di sini langsung terhubung secara otomatis ke menu <strong>Presensi</strong>, <strong>Buku Nilai</strong>, dan <strong>Jurnal Siswa</strong>.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
              title="Unduh format spreadsheet contoh"
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-600" />
              <span>Unduh Template Excel</span>
            </button>

            <label
              htmlFor="excelUploadInput"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{importingFile ? 'Membaca Excel...' : 'Import File Excel (.xls / .xlsx)'}</span>
            </label>
            <input
              id="excelUploadInput"
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xls,.xlsx,.csv"
              className="hidden"
            />

            <button
              onClick={() => setShowAddClassModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Kelas Baru</span>
            </button>
          </div>
        </div>

        {/* Education Level Quick Filter (SD / SMP / SMA) */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 mr-1">Filter Jenjang:</span>
            {(['ALL', 'SD', 'SMP', 'SMA'] as const).map((lvl) => {
              const isSelected = selectedLevelFilter === lvl;
              const count = lvl === 'ALL' ? classes.length : classes.filter((c) => c.level === lvl).length;
              return (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevelFilter(lvl)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{lvl === 'ALL' ? 'Semua Jenjang' : lvl}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-500 font-mono">
            Total Siswa Terdaftar: <strong className="text-emerald-700 font-bold">{students.length} Siswa</strong>
          </div>
        </div>
      </div>

      {/* Main Grid: Class Sidebar Selector & Student Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Class Cards List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
            <span>Daftar Kelas Binaan ({filteredClasses.length})</span>
            <span className="text-[11px] text-slate-400">Pilih untuk mengelola</span>
          </div>

          {filteredClasses.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-2">
              <School className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">Belum ada kelas untuk jenjang ini.</p>
              <button
                onClick={() => setShowAddClassModal(true)}
                className="text-xs text-emerald-700 font-bold hover:underline"
              >
                + Buat Kelas Sekarang
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredClasses.map((cls) => {
                const isSelected = cls.id === currentClass?.id;
                const studentCount = students.filter((s) => s.classId === cls.id).length;

                return (
                  <div
                    key={cls.id}
                    onClick={() => setActiveClassId(cls.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-emerald-50/70 to-white border-emerald-300 ring-1 ring-emerald-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-bold text-slate-900 truncate">{cls.name}</span>
                          <span
                            className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                              cls.level === 'SD'
                                ? 'bg-amber-100 text-amber-800'
                                : cls.level === 'SMP'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {cls.level || 'SMA'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{cls.major}</p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1 font-mono">
                          <span>{studentCount} Siswa</span>
                          <span>·</span>
                          <span className="truncate">{cls.room}</span>
                        </div>
                      </div>

                      {/* Direct Quick Shortcuts */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Hapus kelas "${cls.name}" beserta data siswanya?`)) {
                              onDeleteClass(cls.id);
                              showToast(`Kelas ${cls.name} telah dihapus.`);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                          title="Hapus kelas"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Integrated Navigation Links to Presensi, Nilai, Jurnal */}
                    {isSelected && (
                      <div className="pt-3 mt-3 border-t border-emerald-200/60 flex items-center justify-between gap-1 text-[11px]">
                        <button
                          onClick={() => onNavigateTab('attendance', cls.id)}
                          className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-semibold"
                        >
                          <ClipboardList className="w-3 h-3" />
                          <span>Presensi</span>
                        </button>
                        <span className="text-slate-300">·</span>
                        <button
                          onClick={() => onNavigateTab('gradebook', cls.id)}
                          className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-semibold"
                        >
                          <Calculator className="w-3 h-3" />
                          <span>Buku Nilai</span>
                        </button>
                        <span className="text-slate-300">·</span>
                        <button
                          onClick={() => onNavigateTab('behavior', cls.id)}
                          className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-semibold"
                        >
                          <HeartHandshake className="w-3 h-3" />
                          <span>Jurnal</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Students of Selected Class (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          {currentClass ? (
            <>
              {/* Header for Active Class */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">
                      Daftar Siswa {currentClass.name}
                    </h2>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {classStudents.length} Siswa
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Jenjang {currentClass.level} · {currentClass.major} · {currentClass.room}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddStudentModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Siswa Manual</span>
                  </button>
                </div>
              </div>

              {/* Search Toolbar */}
              <div className="flex items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari nama atau NISN siswa..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="text-[11px] text-slate-500 font-mono">
                  Laki-laki: {classStudents.filter((s) => s.gender === 'L').length} | Perempuan: {classStudents.filter((s) => s.gender === 'P').length}
                </div>
              </div>

              {/* Student Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 text-center w-10">No</th>
                      <th className="p-2.5 text-left">Nama Siswa</th>
                      <th className="p-2.5 text-center">NISN / NIS</th>
                      <th className="p-2.5 text-center">L/P</th>
                      <th className="p-2.5 text-left">Orang Tua / Wali</th>
                      <th className="p-2.5 text-center w-12">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {classStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400">
                          Belum ada siswa di kelas ini. Klik "+ Tambah Siswa Manual" atau gunakan "Import File Excel".
                        </td>
                      </tr>
                    ) : (
                      classStudents.map((st, idx) => (
                        <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-2.5 text-center font-mono text-slate-400">{idx + 1}</td>
                          <td className="p-2.5 font-bold text-slate-900">{st.name}</td>
                          <td className="p-2.5 text-center font-mono text-[11px] text-slate-600">
                            <div>{st.nisn}</div>
                            {st.nis && <div className="text-[10px] text-slate-400">NIS: {st.nis}</div>}
                          </td>
                          <td className="p-2.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                                st.gender === 'L' ? 'bg-sky-50 text-sky-700' : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {st.gender}
                            </span>
                          </td>
                          <td className="p-2.5">
                            <div className="text-slate-800">{st.parentName || '-'}</div>
                            {st.parentPhone && (
                              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                <Phone className="w-2.5 h-2.5 text-emerald-600" />
                                <span>{st.parentPhone}</span>
                              </div>
                            )}
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              onClick={() => {
                                if (window.confirm(`Hapus siswa "${st.name}"?`)) {
                                  onDeleteStudent(st.id);
                                  showToast(`Siswa ${st.name} dihapus.`);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                              title="Hapus siswa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <School className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs">Silakan pilih atau tambahkan kelas terlebih dahulu.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Tambah Kelas Baru (SD s/d SMA) */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                  <School className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900">Buat Rombongan Belajar (Kelas)</h3>
              </div>
              <button onClick={() => setShowAddClassModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Pilih Jenjang Sekolah</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['SD', 'SMP', 'SMA'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleLevelChange(lvl)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-colors ${
                        newClassLevel === lvl
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Nama Kelas / Rombel</label>
                <input
                  type="text"
                  required
                  placeholder={newClassLevel === 'SD' ? 'Contoh: Kelas 4-A' : newClassLevel === 'SMP' ? 'Contoh: Kelas 7-B' : 'Contoh: Kelas X-1'}
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Tingkat Kelas</label>
                  <select
                    value={newClassGrade}
                    onChange={(e) => setNewClassGrade(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {newClassLevel === 'SD' && [1, 2, 3, 4, 5, 6].map((g) => <option key={g} value={g}>Kelas {g} (SD)</option>)}
                    {newClassLevel === 'SMP' && [7, 8, 9].map((g) => <option key={g} value={g}>Kelas {g} (SMP)</option>)}
                    {newClassLevel === 'SMA' && [10, 11, 12].map((g) => <option key={g} value={g}>Kelas {g} (SMA)</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Ruangan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Lab Komputer 1"
                    value={newClassRoom}
                    onChange={(e) => setNewClassRoom(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Fase Kurikulum Merdeka / Jurusan</label>
                <input
                  type="text"
                  value={newClassMajor}
                  onChange={(e) => setNewClassMajor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                >
                  Simpan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Tambah Siswa Manual */}
      {showAddStudentModal && currentClass && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                  <Users className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900">Tambah Siswa ke {currentClass.name}</h3>
              </div>
              <button onClick={() => setShowAddStudentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Farhan"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">NISN</label>
                  <input
                    type="text"
                    placeholder="0081234567"
                    value={newStudentNisn}
                    onChange={(e) => setNewStudentNisn(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">NIS / Nomor Induk</label>
                  <input
                    type="text"
                    placeholder="1234"
                    value={newStudentNis}
                    onChange={(e) => setNewStudentNis(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Jenis Kelamin</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      checked={newStudentGender === 'L'}
                      onChange={() => setNewStudentGender('L')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Laki-laki (L)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      checked={newStudentGender === 'P'}
                      onChange={() => setNewStudentGender('P')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Perempuan (P)</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    placeholder="Nama Orang Tua"
                    value={newStudentParent}
                    onChange={(e) => setNewStudentParent(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">No. WhatsApp Wali</label>
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={newStudentPhone}
                    onChange={(e) => setNewStudentPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Preview Hasil Import Excel */}
      {showImportModal && importPreview && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                  <FileSpreadsheet className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Konfirmasi Import Data dari Excel</h3>
                  <p className="text-[11px] text-slate-500">
                    Ditemukan {importPreview.classes.length} kelas dan {importPreview.students.length} siswa siap dimasukkan.
                  </p>
                </div>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 flex-1 pr-1 text-xs">
              {/* Kelas yang akan dibuat */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  Kelas Terdeteksi ({importPreview.classes.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {importPreview.classes.map((c, i) => (
                    <span key={i} className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-semibold">
                      {c.name} ({c.level})
                    </span>
                  ))}
                </div>
              </div>

              {/* Tabel Sampel Siswa */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  Contoh Siswa Terbaca:
                </span>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2 text-left">Kelas</th>
                        <th className="p-2 text-left">Nama Siswa</th>
                        <th className="p-2 text-center">NISN</th>
                        <th className="p-2 text-center">JK</th>
                        <th className="p-2 text-left">Wali Murid</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {importPreview.students.slice(0, 8).map((st, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 font-semibold text-emerald-800">{st.className}</td>
                          <td className="p-2 font-bold text-slate-900">{st.name}</td>
                          <td className="p-2 text-center font-mono text-[11px] text-slate-600">{st.nisn || '-'}</td>
                          <td className="p-2 text-center font-mono">{st.gender}</td>
                          <td className="p-2 text-slate-600">{st.parentName || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {importPreview.students.length > 8 && (
                  <p className="text-[11px] text-slate-400 italic text-center">
                    ...dan {importPreview.students.length - 8} siswa lainnya
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Data akan otomatis terintegrasi ke Presensi & Buku Nilai.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmImport}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Konfirmasi & Simpan ke Sistem</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Copyright Footer */}
      <div className="pt-6 border-t border-slate-200/70 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
        <span>EduFlow — Manajemen Rombongan Belajar Kurikulum Merdeka</span>
        <span className="font-medium text-slate-600">
          Copyright &copy; 2026 EduFlow by <strong className="text-emerald-700 font-bold">@zieridho13</strong>. All rights reserved.
        </span>
      </div>
    </div>
  );
};
