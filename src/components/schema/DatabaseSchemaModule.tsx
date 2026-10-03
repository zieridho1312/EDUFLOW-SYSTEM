import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, Table, CheckCircle2 } from 'lucide-react';

export const DatabaseSchemaModule: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'tables' | 'rls' | 'sql'>('tables');

  const schemaTables = [
    {
      name: 'profiles',
      description: 'Menyimpan profil guru dan peran pengguna yang terhubung ke auth.users.',
      columns: [
        { name: 'id', type: 'UUID (PK, FK)', desc: 'Primary key merujuk ke auth.users.id' },
        { name: 'role', type: 'VARCHAR(50)', desc: "teacher / admin / homeroom_teacher" },
        { name: 'full_name', type: 'VARCHAR(255)', desc: 'Nama lengkap beserta gelar' },
        { name: 'school_name', type: 'VARCHAR(255)', desc: 'Satuan pendidikan (SMA Negeri 1 Nusantara)' },
        { name: 'nip', type: 'VARCHAR(50)', desc: 'Nomor Induk Pegawai (Unique)' },
        { name: 'created_at', type: 'TIMESTAMPTZ', desc: 'Waktu pembuatan akun' },
        { name: 'updated_at', type: 'TIMESTAMPTZ', desc: 'Waktu pembaruan profil' },
      ],
    },
    {
      name: 'academic_years',
      description: 'Kalender tahun ajaran dan penanda semester aktif sekolah.',
      columns: [
        { name: 'id', type: 'UUID (PK)', desc: 'Identitas unik tahun ajaran' },
        { name: 'year_name', type: 'VARCHAR(20)', desc: "Format '2026/2027'" },
        { name: 'semester', type: 'VARCHAR(10)', desc: "'Ganjil' / 'Genap'" },
        { name: 'is_active', type: 'BOOLEAN', desc: 'Status semester aktif saat ini' },
        { name: 'created_at', type: 'TIMESTAMPTZ', desc: 'Waktu dibuat' },
        { name: 'updated_at', type: 'TIMESTAMPTZ', desc: 'Waktu diperbarui' },
      ],
    },
    {
      name: 'classes',
      description: 'Rombongan belajar yang dibina atau diampu oleh guru.',
      columns: [
        { name: 'id', type: 'UUID (PK)', desc: 'ID unik kelas' },
        { name: 'teacher_id', type: 'UUID (FK)', desc: 'Merujuk ke profiles.id' },
        { name: 'class_name', type: 'VARCHAR(50)', desc: "Nama rombel (cth. 'Kelas X-A')" },
        { name: 'grade_level', type: 'VARCHAR(20)', desc: "Tingkat kelas ('10', '11', 'Fase E')" },
        { name: 'created_at', type: 'TIMESTAMPTZ', desc: 'Waktu registrasi kelas' },
        { name: 'updated_at', type: 'TIMESTAMPTZ', desc: 'Waktu pembaruan' },
      ],
    },
    {
      name: 'students',
      description: 'Daftar peserta didik dalam masing-masing rombongan belajar.',
      columns: [
        { name: 'id', type: 'UUID (PK)', desc: 'ID unik peserta didik' },
        { name: 'class_id', type: 'UUID (FK)', desc: 'Merujuk ke classes.id' },
        { name: 'nisn', type: 'VARCHAR(20)', desc: 'Nomor Induk Siswa Nasional (Unique)' },
        { name: 'full_name', type: 'VARCHAR(255)', desc: 'Nama lengkap siswa' },
        { name: 'parent_phone_number', type: 'VARCHAR(30)', desc: 'Nomor WhatsApp wali murid untuk notifikasi' },
        { name: 'created_at', type: 'TIMESTAMPTZ', desc: 'Waktu pencatatan' },
        { name: 'updated_at', type: 'TIMESTAMPTZ', desc: 'Waktu pembaruan' },
      ],
    },
    {
      name: 'subjects',
      description: 'Mata pelajaran yang diajarkan pada kurikulum sekolah.',
      columns: [
        { name: 'id', type: 'UUID (PK)', desc: 'ID mata pelajaran' },
        { name: 'subject_name', type: 'VARCHAR(100)', desc: "Nama mapel (cth. 'Informatika')" },
        { name: 'code', type: 'VARCHAR(20)', desc: "Kode unik (cth. 'INF-10', 'MAT-10')" },
        { name: 'created_at', type: 'TIMESTAMPTZ', desc: 'Waktu pembuatan' },
        { name: 'updated_at', type: 'TIMESTAMPTZ', desc: 'Waktu pembaruan' },
      ],
    },
    {
      name: 'lesson_plans',
      description: 'Modul Ajar Kurikulum Merdeka terintegrasi Profil Pelajar Pancasila & Diferensiasi.',
      columns: [
        { name: 'id', type: 'UUID (PK)', desc: 'ID unik modul ajar' },
        { name: 'teacher_id', type: 'UUID (FK)', desc: 'Guru penyusun (profiles.id)' },
        { name: 'subject_id', type: 'UUID (FK)', desc: 'Mata pelajaran (subjects.id)' },
        { name: 'class_id', type: 'UUID (FK)', desc: 'Kelas target (classes.id opsional)' },
        { name: 'topic', type: 'VARCHAR(255)', desc: 'Topik materi pokok' },
        { name: 'grade_level', type: 'VARCHAR(20)', desc: 'Fase E / Kelas 10' },
        { name: 'content_json', type: 'JSONB', desc: 'Struktur TP, P3, Diferensiasi, Asesmen KKTP' },
        { name: 'created_at', type: 'TIMESTAMPTZ', desc: 'Waktu dibuat' },
        { name: 'updated_at', type: 'TIMESTAMPTZ', desc: 'Waktu pembaruan' },
      ],
    },
    {
      name: 'attendances',
      description: 'Rekaman presensi harian per siswa dan jam pelajaran (Hadir, Izin, Sakit, Alpa).',
      columns: [
        { name: 'id', type: 'UUID (PK)', desc: 'ID log presensi' },
        { name: 'student_id', type: 'UUID (FK)', desc: 'Merujuk ke students.id' },
        { name: 'class_id', type: 'UUID (FK)', desc: 'Merujuk ke classes.id' },
        { name: 'date', type: 'DATE', desc: 'Tanggal pelaksanaan KBM' },
        { name: 'status', type: 'VARCHAR(10)', desc: "'Hadir', 'Izin', 'Sakit', 'Alpa'" },
        { name: 'notes', type: 'TEXT', desc: 'Alasan izin, surat dokter, dll' },
        { name: 'created_at', type: 'TIMESTAMPTZ', desc: 'Waktu pencatatan' },
        { name: 'updated_at', type: 'TIMESTAMPTZ', desc: 'Waktu pembaruan' },
      ],
    },
    {
      name: 'grades',
      description: 'Skor asesmen (formatif, tugas, STS, SAS) beserta bobot perhitungan E-Rapor.',
      columns: [
        { name: 'id', type: 'UUID (PK)', desc: 'ID rekaman nilai' },
        { name: 'student_id', type: 'UUID (FK)', desc: 'Merujuk ke students.id' },
        { name: 'subject_id', type: 'UUID (FK)', desc: 'Merujuk ke subjects.id' },
        { name: 'assessment_type', type: 'VARCHAR(50)', desc: "Jenis asesmen ('TP 1', 'Kuis', 'STS', 'SAS')" },
        { name: 'score', type: 'NUMERIC(5,2)', desc: 'Skor nilai angka (0 - 100)' },
        { name: 'weight', type: 'NUMERIC(5,2)', desc: 'Bobot persentase perhitungan nilai' },
        { name: 'created_at', type: 'TIMESTAMPTZ', desc: 'Waktu entri nilai' },
        { name: 'updated_at', type: 'TIMESTAMPTZ', desc: 'Waktu koreksi nilai' },
      ],
    },
    {
      name: 'behavior_logs',
      description: 'Jurnal catatan sikap, apresiasi karakter P3, dan pembinaan siswa.',
      columns: [
        { name: 'id', type: 'UUID (PK)', desc: 'ID catatan perilaku' },
        { name: 'student_id', type: 'UUID (FK)', desc: 'Merujuk ke students.id' },
        { name: 'date', type: 'DATE', desc: 'Tanggal kejadian' },
        { name: 'point_type', type: 'VARCHAR(10)', desc: "'positive' / 'negative'" },
        { name: 'note', type: 'TEXT', desc: 'Uraian kejadian & tindak lanjut guru' },
        { name: 'created_at', type: 'TIMESTAMPTZ', desc: 'Waktu pencatatan' },
        { name: 'updated_at', type: 'TIMESTAMPTZ', desc: 'Waktu pembaruan' },
      ],
    },
  ];

  const rlsPolicies = [
    {
      table: 'profiles',
      policy: 'Users can view/update own profile',
      rule: 'USING (auth.uid() = id)',
      description: 'Guru hanya dapat mengakses dan mengedit data profil akun mereka sendiri.',
    },
    {
      table: 'classes',
      policy: 'Teachers manage assigned classes',
      rule: 'USING (teacher_id = auth.uid())',
      description: 'Guru hanya memiliki kendali penuh atas kelas yang ditugaskan kepada mereka.',
    },
    {
      table: 'students',
      policy: 'Teachers access students in assigned classes',
      rule: 'USING (class_id IN (SELECT id FROM classes WHERE teacher_id = auth.uid()))',
      description: 'Guru hanya dapat mengelola siswa yang terdaftar di kelas binaannya.',
    },
    {
      table: 'lesson_plans',
      policy: 'Teachers manage own lesson plans',
      rule: 'USING (teacher_id = auth.uid())',
      description: 'Modul ajar yang dibuat tersimpan secara privat untuk guru pemilik.',
    },
    {
      table: 'attendances',
      policy: 'Teachers manage attendance in assigned classes',
      rule: 'USING (class_id IN (SELECT id FROM classes WHERE teacher_id = auth.uid()))',
      description: 'Presensi kelas hanya bisa dilihat dan diubah oleh pengampu rombel bersangkutan.',
    },
    {
      table: 'grades & behavior_logs',
      policy: 'Teachers manage grades & behavior for assigned students',
      rule: 'USING (student_id IN (SELECT s.id FROM students s JOIN classes c ON s.class_id = c.id WHERE c.teacher_id = auth.uid()))',
      description: 'Buku nilai dan jurnal sikap murid terlindungi dengan isolasi multi-tenant antar guru.',
    },
  ];

  const fullSqlScript = `-- ====================================================================
-- EduFlow Database Schema for Supabase (PostgreSQL with Row Level Security)
-- Optimized for Teacher Administration & Kurikulum Merdeka Workspace
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'teacher' CHECK (role IN ('teacher', 'admin', 'homeroom_teacher', 'principal')),
    full_name VARCHAR(255) NOT NULL,
    school_name VARCHAR(255) NOT NULL DEFAULT 'SMA Negeri 1 Nusantara',
    nip VARCHAR(50) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. ACADEMIC_YEARS
CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year_name VARCHAR(20) NOT NULL,
    semester VARCHAR(10) NOT NULL CHECK (semester IN ('Ganjil', 'Genap')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(year_name, semester)
);

-- 3. CLASSES
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    class_name VARCHAR(50) NOT NULL,
    grade_level VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. STUDENTS
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    nisn VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    parent_phone_number VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. SUBJECTS
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. LESSON_PLANS
CREATE TABLE IF NOT EXISTS public.lesson_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE RESTRICT,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    topic VARCHAR(255) NOT NULL,
    grade_level VARCHAR(20) NOT NULL,
    content_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. ATTENDANCES
CREATE TABLE IF NOT EXISTS public.attendances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(10) NOT NULL CHECK (status IN ('Hadir', 'Izin', 'Sakit', 'Alpa', 'H', 'I', 'S', 'A')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(student_id, class_id, date)
);

-- 8. GRADES
CREATE TABLE IF NOT EXISTS public.grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE RESTRICT,
    assessment_type VARCHAR(50) NOT NULL,
    score NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
    weight NUMERIC(5,2) NOT NULL DEFAULT 20.00 CHECK (weight >= 0 AND weight <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(student_id, subject_id, assessment_type)
);

-- 9. BEHAVIOR_LOGS
CREATE TABLE IF NOT EXISTS public.behavior_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    point_type VARCHAR(10) NOT NULL CHECK (point_type IN ('positive', 'negative')),
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON public.classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON public.students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_nisn ON public.students(nisn);
CREATE INDEX IF NOT EXISTS idx_lesson_plans_teacher_id ON public.lesson_plans(teacher_id);
CREATE INDEX IF NOT EXISTS idx_attendances_class_date ON public.attendances(class_id, date);
CREATE INDEX IF NOT EXISTS idx_attendances_student_id ON public.attendances(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_student_subject ON public.grades(student_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_behavior_logs_student_date ON public.behavior_logs(student_id, date);

-- TRIGGERS
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_academic_years_updated_at BEFORE UPDATE ON public.academic_years FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_subjects_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_lesson_plans_updated_at BEFORE UPDATE ON public.lesson_plans FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_attendances_updated_at BEFORE UPDATE ON public.attendances FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_grades_updated_at BEFORE UPDATE ON public.grades FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_behavior_logs_updated_at BEFORE UPDATE ON public.behavior_logs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavior_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view academic years" ON public.academic_years FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view subjects" ON public.subjects FOR SELECT TO authenticated USING (true);

CREATE POLICY "Teachers can view own classes" ON public.classes FOR SELECT USING (teacher_id = auth.uid());
CREATE POLICY "Teachers can insert own classes" ON public.classes FOR INSERT WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "Teachers can update own classes" ON public.classes FOR UPDATE USING (teacher_id = auth.uid());
CREATE POLICY "Teachers can delete own classes" ON public.classes FOR DELETE USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can view students in assigned classes" ON public.students FOR SELECT USING (class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid()));
CREATE POLICY "Teachers can insert students in assigned classes" ON public.students FOR INSERT WITH CHECK (class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid()));
CREATE POLICY "Teachers can update students in assigned classes" ON public.students FOR UPDATE USING (class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid()));
CREATE POLICY "Teachers can delete students in assigned classes" ON public.students FOR DELETE USING (class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid()));

CREATE POLICY "Teachers can view own lesson plans" ON public.lesson_plans FOR SELECT USING (teacher_id = auth.uid());
CREATE POLICY "Teachers can insert own lesson plans" ON public.lesson_plans FOR INSERT WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "Teachers can update own lesson plans" ON public.lesson_plans FOR UPDATE USING (teacher_id = auth.uid());
CREATE POLICY "Teachers can delete own lesson plans" ON public.lesson_plans FOR DELETE USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can view attendance in assigned classes" ON public.attendances FOR SELECT USING (class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid()));
CREATE POLICY "Teachers can insert attendance in assigned classes" ON public.attendances FOR INSERT WITH CHECK (class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid()));
CREATE POLICY "Teachers can update attendance in assigned classes" ON public.attendances FOR UPDATE USING (class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid()));
CREATE POLICY "Teachers can delete attendance in assigned classes" ON public.attendances FOR DELETE USING (class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid()));

CREATE POLICY "Teachers can view grades in assigned classes" ON public.grades FOR SELECT USING (student_id IN (SELECT s.id FROM public.students s JOIN public.classes c ON s.class_id = c.id WHERE c.teacher_id = auth.uid()));
CREATE POLICY "Teachers can insert grades in assigned classes" ON public.grades FOR INSERT WITH CHECK (student_id IN (SELECT s.id FROM public.students s JOIN public.classes c ON s.class_id = c.id WHERE c.teacher_id = auth.uid()));
CREATE POLICY "Teachers can update grades in assigned classes" ON public.grades FOR UPDATE USING (student_id IN (SELECT s.id FROM public.students s JOIN public.classes c ON s.class_id = c.id WHERE c.teacher_id = auth.uid()));
CREATE POLICY "Teachers can delete grades in assigned classes" ON public.grades FOR DELETE USING (student_id IN (SELECT s.id FROM public.students s JOIN public.classes c ON s.class_id = c.id WHERE c.teacher_id = auth.uid()));

CREATE POLICY "Teachers can view behavior logs in assigned classes" ON public.behavior_logs FOR SELECT USING (student_id IN (SELECT s.id FROM public.students s JOIN public.classes c ON s.class_id = c.id WHERE c.teacher_id = auth.uid()));
CREATE POLICY "Teachers can insert behavior logs in assigned classes" ON public.behavior_logs FOR INSERT WITH CHECK (student_id IN (SELECT s.id FROM public.students s JOIN public.classes c ON s.class_id = c.id WHERE c.teacher_id = auth.uid()));
CREATE POLICY "Teachers can update behavior logs in assigned classes" ON public.behavior_logs FOR UPDATE USING (student_id IN (SELECT s.id FROM public.students s JOIN public.classes c ON s.class_id = c.id WHERE c.teacher_id = auth.uid()));
CREATE POLICY "Teachers can delete behavior logs in assigned classes" ON public.behavior_logs FOR DELETE USING (student_id IN (SELECT s.id FROM public.students s JOIN public.classes c ON s.class_id = c.id WHERE c.teacher_id = auth.uid()));`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullSqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Arsitektur PostgreSQL Supabase</span>
              <span aria-hidden="true">·</span>
              <span>Row Level Security (RLS) & Multi-Tenant Teacher Isolation</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Skema Basis Data Supabase EduFlow (9 Tabel Produksi)
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'SQL Tersalin!' : 'Salin Script DDL Supabase'}</span>
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg max-w-md">
          <button
            onClick={() => setActiveTab('tables')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'tables' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            9 Tabel & Relasi
          </button>
          <button
            onClick={() => setActiveTab('rls')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'rls' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Kebijakan RLS (Security)
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'sql' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Full SQL Editor Script
          </button>
        </div>
      </div>

      {/* Tab 1: 9 Tables */}
      {activeTab === 'tables' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schemaTables.map((tbl, idx) => (
            <div
              key={tbl.name}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <Table className="w-4 h-4 text-emerald-600" />
                  <span className="font-mono font-bold text-xs text-slate-900">{tbl.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">public.{tbl.name}</span>
              </div>

              <p className="text-xs text-slate-600">{tbl.description}</p>

              <div className="border border-slate-100 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="p-2 text-left">Kolom</th>
                      <th className="p-2 text-left">Tipe Data</th>
                      <th className="p-2 text-left">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tbl.columns.map((col) => (
                      <tr key={col.name}>
                        <td className="p-2 font-mono font-semibold text-slate-800">{col.name}</td>
                        <td className="p-2 font-mono text-[11px] text-emerald-700">{col.type}</td>
                        <td className="p-2 text-slate-500 text-[11px]">{col.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: RLS Policies */}
      {activeTab === 'rls' && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950 space-y-1">
              <span className="font-bold">Keamanan Tingkat Baris (Row Level Security / RLS)</span>
              <p className="leading-relaxed">
                Di lingkungan Supabase, RLS memastikan bahwa data peserta didik, riwayat presensi, modul ajar, dan nilai siswa hanya dapat diakses oleh guru yang bersangkutan berdasarkan token JWT dari <code>auth.uid()</code>. Guru dari rombel lain tidak dapat melihat atau memodifikasi data guru lain.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rlsPolicies.map((p) => (
              <div
                key={p.table}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-900">{p.table}</span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    RLS Active
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800">{p.policy}</h4>
                <div className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg overflow-x-auto">
                  {p.rule}
                </div>
                <p className="text-xs text-slate-600">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Full SQL */}
      {activeTab === 'sql' && (
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 shadow-xs space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-emerald-400 font-bold">src/services/schema.sql (Production Ready Supabase SQL)</span>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded text-slate-200 flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Semua'}</span>
            </button>
          </div>
          <pre className="overflow-x-auto p-2 text-slate-300 leading-relaxed max-h-[600px] overflow-y-auto">
            {fullSqlScript}
          </pre>
        </div>
      )}
    </div>
  );
};
