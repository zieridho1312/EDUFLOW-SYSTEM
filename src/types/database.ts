export type StudentAttendanceStatus = 'H' | 'I' | 'S' | 'A'; // Hadir, Izin, Sakit, Alpa

export type EducationLevel = 'SD' | 'SMP' | 'SMA' | 'SMK';

export interface AuthAccount {
  id: string;
  email: string;
  password: string;
  name: string;
  nip: string;
  schoolName: string;
  createdAt: string;
}

export interface TeacherProfile {
  id: string;
  name: string;
  nip: string;
  email: string;
  phone: string;
  schoolName: string;
  schoolAddress: string;
  principalName: string;
  principalNip: string;
  academicYear: string;
  semester: 'Ganjil' | 'Genap';
  avatarUrl: string;
}

export interface SchoolClass {
  id: string;
  name: string; // e.g. "Kelas 4-A", "Kelas 7-B", "Kelas X-A", "Kelas XI-MIPA 1"
  level: EducationLevel; // 'SD' | 'SMP' | 'SMA' | 'SMK'
  grade: number; // 1 to 12
  major: string; // "Fase A", "Fase B", "Fase C", "Fase D", "Fase E", "Fase F"
  totalStudents: number;
  room: string;
}

export interface Student {
  id: string;
  classId: string;
  nisn: string;
  nis: string;
  name: string;
  gender: 'L' | 'P';
  parentName: string;
  parentPhone: string;
  address: string;
  avatarUrl?: string;
}

export interface TeachingSchedule {
  id: string;
  classId: string;
  subject: string;
  dayOfWeek: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat';
  startTime: string; // "07:30"
  endTime: string;   // "09:00"
  hourSlot: string;  // "JP 1 - 2"
  room: string;
  topicSummary: string;
  isToday?: boolean;
}

export interface AttendanceRecord {
  studentId: string;
  status: StudentAttendanceStatus;
  note?: string;
}

export interface AttendanceSession {
  id: string;
  classId: string;
  subject: string;
  date: string; // YYYY-MM-DD
  hourSlot: string;
  topicDelivered: string;
  records: AttendanceRecord[];
  createdAt: string;
}

export interface LessonPlan {
  id: string;
  title: string;
  subject: string;
  gradeLevel: string; // "Kelas X (Fase E)"
  phase: string;      // "Fase E"
  semester: 'Ganjil' | 'Genap';
  alokasiWaktu: string; // "2 JP (2 x 45 Menit)"
  elemen: string;
  capaianPembelajaran: string;
  tujuanPembelajaran: string[];
  profilPelajarPancasila: string[]; // ['Bernalar Kritis', 'Gotong Royong', 'Mandiri']
  targetPesertaDidik: string; // "Reguler / Umum (36 Siswa)"
  modelPembelajaran: string; // "Problem Based Learning (PBL)"
  saranaPrasarana: string;
  pemahamanBermakna: string;
  pertanyaanPemantik: string[];
  kegiatanPembelajaran: {
    pendahuluan: { duration: string; description: string }[];
    inti: { duration: string; description: string; diferensiasi: string }[];
    penutup: { duration: string; description: string }[];
  };
  asesmen: {
    diagnostik: string;
    formatif: string;
    sumatif: string;
    kktpDeskripsi: string;
  };
  remedialPengayaan: {
    remedial: string;
    pengayaan: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GradeItem {
  id: string;
  classId: string;
  subject: string;
  code: string; // "TP 1", "TP 2", "STS", "SAS"
  title: string;
  category: 'formatif' | 'tugas' | 'kuis' | 'sts' | 'sas';
  weight: number; // percentage, e.g. 20
  kktp: number; // default 75
  maxScore: number; // default 100
}

export interface StudentGradeEntry {
  studentId: string;
  scores: Record<string, number>; // gradeItemId -> score
}

export interface BehaviorLog {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  date: string;
  category: 'positif' | 'prestasi' | 'perhatian' | 'pelanggaran';
  dimensionP3: 'Beriman & Bertakwa' | 'Berkebinekaan Global' | 'Gotong Royong' | 'Mandiri' | 'Bernalar Kritis' | 'Kreatif';
  title: string;
  description: string;
  actionTaken: string; // Tindak lanjut guru
  parentNotified: boolean;
  parentPhone?: string;
  createdAt: string;
}

export interface DailyTeachingJournal {
  id: string;
  date: string;
  classId: string;
  className: string;
  subject: string;
  hourSlot: string;
  topicDelivered: string;
  presentCount: number;
  absentCount: number;
  sickCount: number;
  permitCount: number;
  totalStudents: number;
  studentIssues: string;
  reflectionNotes: string;
  verifiedByPrincipal: boolean;
}
