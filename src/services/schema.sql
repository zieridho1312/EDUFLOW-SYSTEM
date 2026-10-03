-- ====================================================================
-- EduFlow Database Schema for Supabase (PostgreSQL with Row Level Security)
-- Optimized for Teacher Administration & Kurikulum Merdeka Workspace
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. HELPER FUNCTION: AUTO-UPDATE UPDATED_AT TIMESTAMP
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- 3. TABLES DEFINITION
-- ====================================================================

-- 1. PROFILES (Users/Teachers linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'teacher' CHECK (role IN ('teacher', 'admin', 'homeroom_teacher', 'principal')),
    full_name VARCHAR(255) NOT NULL,
    school_name VARCHAR(255) NOT NULL DEFAULT 'SMA Negeri 1 Nusantara',
    nip VARCHAR(50) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. ACADEMIC_YEARS (School Calendar & Active Semester)
CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year_name VARCHAR(20) NOT NULL, -- e.g. '2026/2027'
    semester VARCHAR(10) NOT NULL CHECK (semester IN ('Ganjil', 'Genap')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(year_name, semester)
);

-- 3. CLASSES (Rombongan Belajar assigned to Teachers)
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    class_name VARCHAR(50) NOT NULL, -- e.g. 'Kelas X-A', 'Kelas XI-MIPA 1'
    grade_level VARCHAR(20) NOT NULL, -- e.g. '10', '11', '12', 'Fase E', 'Fase F'
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. STUDENTS (Student Roster per Class)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    nisn VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    parent_phone_number VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. SUBJECTS (Course / Mata Pelajaran)
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_name VARCHAR(100) NOT NULL, -- e.g. 'Informatika', 'Matematika'
    code VARCHAR(20) NOT NULL UNIQUE,   -- e.g. 'INF-10', 'MAT-10'
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. LESSON_PLANS (Modul Ajar Kurikulum Merdeka)
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

-- 7. ATTENDANCES (Daily & Session Attendance Records)
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

-- 8. GRADES (Assessments, Weightings, & Auto E-Rapor Scores)
CREATE TABLE IF NOT EXISTS public.grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE RESTRICT,
    assessment_type VARCHAR(50) NOT NULL, -- e.g. 'TP 1 Formatif', 'Tugas', 'Kuis', 'STS', 'SAS'
    score NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
    weight NUMERIC(5,2) NOT NULL DEFAULT 20.00 CHECK (weight >= 0 AND weight <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(student_id, subject_id, assessment_type)
);

-- 9. BEHAVIOR_LOGS (P3 Character & Behavior Notes)
CREATE TABLE IF NOT EXISTS public.behavior_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    point_type VARCHAR(10) NOT NULL CHECK (point_type IN ('positive', 'negative')),
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- 4. PERFORMANCE & LOOKUP INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON public.classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON public.students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_nisn ON public.students(nisn);
CREATE INDEX IF NOT EXISTS idx_lesson_plans_teacher_id ON public.lesson_plans(teacher_id);
CREATE INDEX IF NOT EXISTS idx_attendances_class_date ON public.attendances(class_id, date);
CREATE INDEX IF NOT EXISTS idx_attendances_student_id ON public.attendances(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_student_subject ON public.grades(student_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_behavior_logs_student_date ON public.behavior_logs(student_id, date);

-- ====================================================================
-- 5. AUTOMATIC UPDATED_AT TRIGGERS
-- ====================================================================
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_academic_years_updated_at BEFORE UPDATE ON public.academic_years FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_subjects_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_lesson_plans_updated_at BEFORE UPDATE ON public.lesson_plans FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_attendances_updated_at BEFORE UPDATE ON public.attendances FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_grades_updated_at BEFORE UPDATE ON public.grades FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_behavior_logs_updated_at BEFORE UPDATE ON public.behavior_logs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ====================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- Strict multi-tenant isolation ensuring teachers only view/manage
-- classes, students, lesson plans, attendance, and grades they own.
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavior_logs ENABLE ROW LEVEL SECURITY;

-- 6.1 PROFILES POLICIES
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- 6.2 ACADEMIC_YEARS POLICIES (Read-only for teachers)
CREATE POLICY "Authenticated users can view academic years"
    ON public.academic_years FOR SELECT
    TO authenticated
    USING (true);

-- 6.3 SUBJECTS POLICIES (Read-only for teachers)
CREATE POLICY "Authenticated users can view subjects"
    ON public.subjects FOR SELECT
    TO authenticated
    USING (true);

-- 6.4 CLASSES POLICIES (Teachers manage own assigned classes)
CREATE POLICY "Teachers can view own classes"
    ON public.classes FOR SELECT
    USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can insert own classes"
    ON public.classes FOR INSERT
    WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update own classes"
    ON public.classes FOR UPDATE
    USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete own classes"
    ON public.classes FOR DELETE
    USING (teacher_id = auth.uid());

-- 6.5 STUDENTS POLICIES (Teachers access students in their assigned classes)
CREATE POLICY "Teachers can view students in assigned classes"
    ON public.students FOR SELECT
    USING (class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid()));

CREATE POLICY "Teachers can insert students in assigned classes"
    ON public.students FOR INSERT
    WITH CHECK (class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid()));

CREATE POLICY "Teachers can update students in assigned classes"
    ON public.students FOR UPDATE
    USING (class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid()));

CREATE POLICY "Teachers can delete students in assigned classes"
    ON public.students FOR DELETE
    USING (class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid()));

-- 6.6 LESSON_PLANS POLICIES (Teachers manage own lesson plans)
CREATE POLICY "Teachers can view own lesson plans"
    ON public.lesson_plans FOR SELECT
    USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can insert own lesson plans"
    ON public.lesson_plans FOR INSERT
    WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update own lesson plans"
    ON public.lesson_plans FOR UPDATE
    USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete own lesson plans"
    ON public.lesson_plans FOR DELETE
    USING (teacher_id = auth.uid());

-- 6.7 ATTENDANCES POLICIES (Teachers manage attendance for their assigned classes)
CREATE POLICY "Teachers can view attendance in assigned classes"
    ON public.attendances FOR SELECT
    USING (class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid()));

CREATE POLICY "Teachers can insert attendance in assigned classes"
    ON public.attendances FOR INSERT
    WITH CHECK (class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid()));

CREATE POLICY "Teachers can update attendance in assigned classes"
    ON public.attendances FOR UPDATE
    USING (class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid()));

CREATE POLICY "Teachers can delete attendance in assigned classes"
    ON public.attendances FOR DELETE
    USING (class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid()));

-- 6.8 GRADES POLICIES (Teachers manage grades for students in their assigned classes)
CREATE POLICY "Teachers can view grades in assigned classes"
    ON public.grades FOR SELECT
    USING (student_id IN (
        SELECT s.id FROM public.students s
        JOIN public.classes c ON s.class_id = c.id
        WHERE c.teacher_id = auth.uid()
    ));

CREATE POLICY "Teachers can insert grades in assigned classes"
    ON public.grades FOR INSERT
    WITH CHECK (student_id IN (
        SELECT s.id FROM public.students s
        JOIN public.classes c ON s.class_id = c.id
        WHERE c.teacher_id = auth.uid()
    ));

CREATE POLICY "Teachers can update grades in assigned classes"
    ON public.grades FOR UPDATE
    USING (student_id IN (
        SELECT s.id FROM public.students s
        JOIN public.classes c ON s.class_id = c.id
        WHERE c.teacher_id = auth.uid()
    ));

CREATE POLICY "Teachers can delete grades in assigned classes"
    ON public.grades FOR DELETE
    USING (student_id IN (
        SELECT s.id FROM public.students s
        JOIN public.classes c ON s.class_id = c.id
        WHERE c.teacher_id = auth.uid()
    ));

-- 6.9 BEHAVIOR_LOGS POLICIES (Teachers manage behavior logs for students in their assigned classes)
CREATE POLICY "Teachers can view behavior logs in assigned classes"
    ON public.behavior_logs FOR SELECT
    USING (student_id IN (
        SELECT s.id FROM public.students s
        JOIN public.classes c ON s.class_id = c.id
        WHERE c.teacher_id = auth.uid()
    ));

CREATE POLICY "Teachers can insert behavior logs in assigned classes"
    ON public.behavior_logs FOR INSERT
    WITH CHECK (student_id IN (
        SELECT s.id FROM public.students s
        JOIN public.classes c ON s.class_id = c.id
        WHERE c.teacher_id = auth.uid()
    ));

CREATE POLICY "Teachers can update behavior logs in assigned classes"
    ON public.behavior_logs FOR UPDATE
    USING (student_id IN (
        SELECT s.id FROM public.students s
        JOIN public.classes c ON s.class_id = c.id
        WHERE c.teacher_id = auth.uid()
    ));

CREATE POLICY "Teachers can delete behavior logs in assigned classes"
    ON public.behavior_logs FOR DELETE
    USING (student_id IN (
        SELECT s.id FROM public.students s
        JOIN public.classes c ON s.class_id = c.id
        WHERE c.teacher_id = auth.uid()
    ));

-- ====================================================================
-- 7. OPTIONAL SEED DATA (For prototyping in Supabase SQL Editor)
-- ====================================================================
-- INSERT INTO public.academic_years (year_name, semester, is_active)
-- VALUES ('2026/2027', 'Ganjil', true) ON CONFLICT DO NOTHING;

-- INSERT INTO public.subjects (subject_name, code)
-- VALUES ('Informatika', 'INF-10'), ('Matematika', 'MAT-10') ON CONFLICT DO NOTHING;
