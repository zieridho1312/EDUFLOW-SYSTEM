import {
  TeacherProfile,
  SchoolClass,
  Student,
  TeachingSchedule,
  AttendanceSession,
  LessonPlan,
  GradeItem,
  StudentGradeEntry,
  BehaviorLog,
  DailyTeachingJournal,
  StudentAttendanceStatus,
  AuthAccount,
} from '../types/database';
import {
  initialTeacherProfile,
  initialClasses,
  initialStudents,
  initialSchedules,
  initialAttendanceSessions,
  initialLessonPlans,
  initialGradeItems,
  initialStudentGrades,
  initialBehaviorLogs,
  initialTeachingJournals,
} from '../data/initialData';

const STORAGE_KEY = 'eduflow_state_v1';
const AUTH_SESSION_KEY = 'eduflow_auth_session_v1';

export const initialAccounts: AuthAccount[] = [
  {
    id: 'acc-01',
    email: 'ahmadridho32@guru.sma.belajar.id',
    password: 'password123',
    name: 'Ahmad Ridho, S.Pd., Gr.',
    nip: '19880412 201403 1 003',
    schoolName: 'SMA Negeri 1 Nusantara',
    createdAt: '2026-01-01T00:00:00Z',
  },
];

export interface EduFlowState {
  teacher: TeacherProfile;
  classes: SchoolClass[];
  students: Student[];
  schedules: TeachingSchedule[];
  attendanceSessions: AttendanceSession[];
  lessonPlans: LessonPlan[];
  gradeItems: GradeItem[];
  studentGrades: StudentGradeEntry[];
  behaviorLogs: BehaviorLog[];
  journals: DailyTeachingJournal[];
  accounts: AuthAccount[];
  currentUser: AuthAccount | null;
}

function loadInitialState(): EduFlowState {
  let savedSession: AuthAccount | null = null;
  if (typeof window !== 'undefined') {
    try {
      const sess = localStorage.getItem(AUTH_SESSION_KEY);
      if (sess) {
        savedSession = JSON.parse(sess);
      }
    } catch (e) {
      console.warn('Failed to parse auth session:', e);
    }
  }

  if (typeof window === 'undefined') {
    return {
      teacher: initialTeacherProfile,
      classes: initialClasses,
      students: initialStudents,
      schedules: initialSchedules,
      attendanceSessions: initialAttendanceSessions,
      lessonPlans: initialLessonPlans,
      gradeItems: initialGradeItems,
      studentGrades: initialStudentGrades,
      behaviorLogs: initialBehaviorLogs,
      journals: initialTeachingJournals,
      accounts: initialAccounts,
      currentUser: savedSession || null,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const accounts = parsed.accounts && parsed.accounts.length > 0 ? parsed.accounts : initialAccounts;
      const loadedClasses: SchoolClass[] = (parsed.classes || initialClasses).map((c: any) => ({
        ...c,
        level: c.level || (c.grade <= 6 ? 'SD' : c.grade <= 9 ? 'SMP' : 'SMA'),
      }));
      return {
        teacher: parsed.teacher || initialTeacherProfile,
        classes: loadedClasses,
        students: parsed.students || initialStudents,
        schedules: parsed.schedules || initialSchedules,
        attendanceSessions: parsed.attendanceSessions || initialAttendanceSessions,
        lessonPlans: parsed.lessonPlans || initialLessonPlans,
        gradeItems: parsed.gradeItems || initialGradeItems,
        studentGrades: parsed.studentGrades || initialStudentGrades,
        behaviorLogs: parsed.behaviorLogs || initialBehaviorLogs,
        journals: parsed.journals || initialTeachingJournals,
        accounts,
        currentUser: savedSession || null,
      };
    }
  } catch (err) {
    console.error('Failed to load state from localStorage:', err);
  }

  return {
    teacher: initialTeacherProfile,
    classes: initialClasses,
    students: initialStudents,
    schedules: initialSchedules,
    attendanceSessions: initialAttendanceSessions,
    lessonPlans: initialLessonPlans,
    gradeItems: initialGradeItems,
    studentGrades: initialStudentGrades,
    behaviorLogs: initialBehaviorLogs,
    journals: initialTeachingJournals,
    accounts: initialAccounts,
    currentUser: savedSession || null,
  };
}

class EduFlowStore {
  private state: EduFlowState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = loadInitialState();
  }

  public getState(): EduFlowState {
    return this.state;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        console.warn('Could not persist state to localStorage:', e);
      }
    }
    this.listeners.forEach((listener) => listener());
  }

  // Teacher Profile
  public updateTeacher(partial: Partial<TeacherProfile>) {
    this.state = {
      ...this.state,
      teacher: { ...this.state.teacher, ...partial },
    };
    this.notify();
  }

  // Authentication Methods
  public login(email: string, password: string): { success: boolean; message: string } {
    const trimmedEmail = email.trim().toLowerCase();
    const account = this.state.accounts.find(
      (a) => a.email.toLowerCase() === trimmedEmail && a.password === password
    );

    if (!account) {
      return {
        success: false,
        message: 'Email atau kata sandi tidak cocok. Silakan periksa kembali atau daftar akun baru.',
      };
    }

    this.state = {
      ...this.state,
      currentUser: account,
      teacher: {
        ...this.state.teacher,
        name: account.name,
        nip: account.nip || this.state.teacher.nip,
        email: account.email,
        schoolName: account.schoolName || this.state.teacher.schoolName,
      },
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(account));
      } catch (e) {
        console.warn('Could not save auth session:', e);
      }
    }

    this.notify();
    return { success: true, message: `Selamat datang kembali, ${account.name}!` };
  }

  public signup(data: {
    name: string;
    email: string;
    nip: string;
    schoolName: string;
    password: string;
  }): { success: boolean; message: string } {
    const trimmedEmail = data.email.trim().toLowerCase();
    const exists = this.state.accounts.some((a) => a.email.toLowerCase() === trimmedEmail);

    if (exists) {
      return {
        success: false,
        message: 'Email ini sudah terdaftar. Silakan langsung masuk dengan kata sandi Anda.',
      };
    }

    const newAccount: AuthAccount = {
      id: `acc-${Date.now()}`,
      email: trimmedEmail,
      password: data.password,
      name: data.name,
      nip: data.nip || 'Belum diatur',
      schoolName: data.schoolName || 'SMA Negeri 1 Nusantara',
      createdAt: new Date().toISOString(),
    };

    const updatedAccounts = [...this.state.accounts, newAccount];

    this.state = {
      ...this.state,
      accounts: updatedAccounts,
      currentUser: newAccount,
      teacher: {
        ...this.state.teacher,
        name: newAccount.name,
        nip: newAccount.nip,
        email: newAccount.email,
        schoolName: newAccount.schoolName,
      },
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(newAccount));
      } catch (e) {
        console.warn('Could not save auth session:', e);
      }
    }

    this.notify();
    return { success: true, message: 'Pendaftaran berhasil! Akun guru Anda siap digunakan.' };
  }

  public logout(): void {
    this.state = {
      ...this.state,
      currentUser: null,
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(AUTH_SESSION_KEY);
      } catch (e) {
        console.warn('Could not remove auth session:', e);
      }
    }

    this.notify();
  }

  // Classes & Students Management (SD, SMP, SMA)
  public addClass(classData: Omit<SchoolClass, 'id' | 'totalStudents'> & { id?: string }): SchoolClass {
    const newClass: SchoolClass = {
      id: classData.id || `cls-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: classData.name.trim(),
      level: classData.level || (classData.grade <= 6 ? 'SD' : classData.grade <= 9 ? 'SMP' : 'SMA'),
      grade: classData.grade,
      major: classData.major,
      totalStudents: 0,
      room: classData.room || 'Ruang Kelas',
    };
    this.state = {
      ...this.state,
      classes: [...this.state.classes, newClass],
    };
    this.notify();
    return newClass;
  }

  public updateClass(id: string, partial: Partial<SchoolClass>) {
    this.state = {
      ...this.state,
      classes: this.state.classes.map((c) => (c.id === id ? { ...c, ...partial } : c)),
    };
    this.notify();
  }

  public deleteClass(id: string) {
    this.state = {
      ...this.state,
      classes: this.state.classes.filter((c) => c.id !== id),
      students: this.state.students.filter((s) => s.classId !== id),
      attendanceSessions: this.state.attendanceSessions.filter((a) => a.classId !== id),
    };
    this.notify();
  }

  public addStudent(studentData: Omit<Student, 'id'> & { id?: string }): Student {
    const newStudent: Student = {
      id: studentData.id || `st-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      classId: studentData.classId,
      name: studentData.name.trim(),
      nisn: studentData.nisn || `00${Math.floor(10000000 + Math.random() * 90000000)}`,
      nis: studentData.nis || `${Math.floor(1000 + Math.random() * 9000)}`,
      gender: studentData.gender,
      parentName: studentData.parentName || 'Orang Tua / Wali',
      parentPhone: studentData.parentPhone || '0812-0000-0000',
      address: studentData.address || 'Alamat Siswa',
      avatarUrl: studentData.avatarUrl,
    };

    const updatedStudents = [...this.state.students, newStudent];
    const classCount = updatedStudents.filter((s) => s.classId === newStudent.classId).length;

    this.state = {
      ...this.state,
      students: updatedStudents,
      classes: this.state.classes.map((c) =>
        c.id === newStudent.classId ? { ...c, totalStudents: classCount } : c
      ),
    };
    this.notify();
    return newStudent;
  }

  public deleteStudent(id: string) {
    const target = this.state.students.find((s) => s.id === id);
    const updatedStudents = this.state.students.filter((s) => s.id !== id);
    const targetClassId = target?.classId;
    const classCount = targetClassId
      ? updatedStudents.filter((s) => s.classId === targetClassId).length
      : 0;

    this.state = {
      ...this.state,
      students: updatedStudents,
      classes: this.state.classes.map((c) =>
        c.id === targetClassId ? { ...c, totalStudents: classCount } : c
      ),
    };
    this.notify();
  }

  public importClassesAndStudents(
    incomingClasses: Array<{ name: string; level: 'SD' | 'SMP' | 'SMA' | 'SMK'; grade: number; major: string; room?: string }>,
    incomingStudents: Array<{ name: string; nisn: string; nis?: string; gender: 'L' | 'P'; parentName?: string; parentPhone?: string; className: string }>
  ): { success: boolean; classesAdded: number; studentsAdded: number; message: string } {
    let classesAddedCount = 0;
    let studentsAddedCount = 0;

    const classMap = new Map<string, SchoolClass>();
    this.state.classes.forEach((c) => {
      classMap.set(c.name.trim().toLowerCase(), c);
    });

    const updatedClasses = [...this.state.classes];

    // Ensure classes from incomingClasses exist
    incomingClasses.forEach((ic) => {
      const key = ic.name.trim().toLowerCase();
      if (!classMap.has(key)) {
        const newClass: SchoolClass = {
          id: `cls-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: ic.name.trim(),
          level: ic.level,
          grade: ic.grade,
          major: ic.major,
          totalStudents: 0,
          room: ic.room || 'Ruang Kelas',
        };
        classMap.set(key, newClass);
        updatedClasses.push(newClass);
        classesAddedCount++;
      }
    });

    // Also check if any student's className needs auto-creating a class
    incomingStudents.forEach((st) => {
      const key = st.className.trim().toLowerCase();
      if (!classMap.has(key) && st.className.trim() !== '') {
        const inferredName = st.className.trim();
        let inferredLevel: 'SD' | 'SMP' | 'SMA' | 'SMK' = 'SMA';
        let inferredGrade = 10;
        let inferredMajor = 'Kurikulum Merdeka';

        if (/^(kelas\s*)?[1-6]([-A-Za-z]|$)/i.test(inferredName)) {
          inferredLevel = 'SD';
          const match = inferredName.match(/[1-6]/);
          inferredGrade = match ? parseInt(match[0]) : 1;
          inferredMajor = `Fase ${inferredGrade <= 2 ? 'A' : inferredGrade <= 4 ? 'B' : 'C'} (SD)`;
        } else if (/^(kelas\s*)?[7-9]([-A-Za-z]|$)/i.test(inferredName)) {
          inferredLevel = 'SMP';
          const match = inferredName.match(/[7-9]/);
          inferredGrade = match ? parseInt(match[0]) : 7;
          inferredMajor = 'Fase D (SMP)';
        } else if (/^(kelas\s*)?(1[0-2]|X|XI|XII)([-A-Za-z]|$)/i.test(inferredName)) {
          inferredLevel = 'SMA';
          inferredGrade = /12|XII/i.test(inferredName) ? 12 : /11|XI/i.test(inferredName) ? 11 : 10;
          inferredMajor = inferredGrade === 10 ? 'Fase E (Umum)' : 'Fase F (Peminatan)';
        }

        const newClass: SchoolClass = {
          id: `cls-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: inferredName,
          level: inferredLevel,
          grade: inferredGrade,
          major: inferredMajor,
          totalStudents: 0,
          room: 'Ruang Kelas',
        };
        classMap.set(key, newClass);
        updatedClasses.push(newClass);
        classesAddedCount++;
      }
    });

    // Create students
    const updatedStudents = [...this.state.students];
    const existingNisns = new Set(this.state.students.map((s) => s.nisn));

    incomingStudents.forEach((st) => {
      const key = st.className.trim().toLowerCase();
      const targetClass = classMap.get(key);
      if (targetClass) {
        const studentId = `st-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const studentNisn = st.nisn ? st.nisn.trim() : `00${Math.floor(10000000 + Math.random() * 90000000)}`;

        if (!existingNisns.has(studentNisn)) {
          existingNisns.add(studentNisn);
          updatedStudents.push({
            id: studentId,
            classId: targetClass.id,
            name: st.name.trim(),
            nisn: studentNisn,
            nis: st.nis ? st.nis.trim() : `${Math.floor(1000 + Math.random() * 9000)}`,
            gender: st.gender === 'P' ? 'P' : 'L',
            parentName: st.parentName ? st.parentName.trim() : 'Orang Tua Siswa',
            parentPhone: st.parentPhone ? st.parentPhone.trim() : '0812-3456-7890',
            address: 'Alamat Siswa',
          });
          studentsAddedCount++;
        }
      }
    });

    // Recalculate totalStudents for all updated classes
    const finalClasses = updatedClasses.map((c) => {
      const count = updatedStudents.filter((s) => s.classId === c.id).length;
      return { ...c, totalStudents: count };
    });

    this.state = {
      ...this.state,
      classes: finalClasses,
      students: updatedStudents,
    };
    this.notify();

    return {
      success: true,
      classesAdded: classesAddedCount,
      studentsAdded: studentsAddedCount,
      message: `Berhasil mengimpor ${classesAddedCount} kelas dan ${studentsAddedCount} siswa ke dalam sistem!`,
    };
  }

  // Attendance
  public saveAttendanceSession(session: AttendanceSession) {
    const existingIndex = this.state.attendanceSessions.findIndex((s) => s.id === session.id);
    let updatedSessions: AttendanceSession[];
    if (existingIndex >= 0) {
      updatedSessions = [...this.state.attendanceSessions];
      updatedSessions[existingIndex] = session;
    } else {
      updatedSessions = [session, ...this.state.attendanceSessions];
    }

    // Also auto-update / create teaching journal entry if not present
    const classObj = this.state.classes.find((c) => c.id === session.classId);
    const present = session.records.filter((r) => r.status === 'H').length;
    const sick = session.records.filter((r) => r.status === 'S').length;
    const permit = session.records.filter((r) => r.status === 'I').length;
    const absent = session.records.filter((r) => r.status === 'A').length;

    const existingJournalIndex = this.state.journals.findIndex(
      (j) => j.date === session.date && j.classId === session.classId && j.hourSlot === session.hourSlot
    );

    const issues: string[] = [];
    session.records.forEach((rec) => {
      if (rec.status !== 'H') {
        const student = this.state.students.find((s) => s.id === rec.studentId);
        const name = student ? student.name : 'Siswa';
        const stLabel = rec.status === 'S' ? 'Sakit' : rec.status === 'I' ? 'Izin' : 'Alpa';
        issues.push(`${name} (${stLabel}${rec.note ? `: ${rec.note}` : ''})`);
      }
    });

    const journalEntry: DailyTeachingJournal = {
      id: existingJournalIndex >= 0 ? this.state.journals[existingJournalIndex].id : `jrn-${Date.now()}`,
      date: session.date,
      classId: session.classId,
      className: classObj?.name || 'Kelas',
      subject: session.subject,
      hourSlot: session.hourSlot,
      topicDelivered: session.topicDelivered || 'Pembelajaran Reguler',
      presentCount: present,
      absentCount: absent,
      sickCount: sick,
      permitCount: permit,
      totalStudents: session.records.length,
      studentIssues: issues.length > 0 ? issues.join(', ') : 'Semua siswa hadir dan berpartisipasi dengan baik.',
      reflectionNotes: existingJournalIndex >= 0 ? this.state.journals[existingJournalIndex].reflectionNotes : 'Sesi berjalan sesuai rancangan Modul Ajar.',
      verifiedByPrincipal: true,
    };

    let updatedJournals = [...this.state.journals];
    if (existingJournalIndex >= 0) {
      updatedJournals[existingJournalIndex] = journalEntry;
    } else {
      updatedJournals = [journalEntry, ...updatedJournals];
    }

    this.state = {
      ...this.state,
      attendanceSessions: updatedSessions,
      journals: updatedJournals,
    };
    this.notify();
  }

  // Gradebook
  public updateStudentScore(studentId: string, gradeItemId: string, score: number) {
    const existingEntryIndex = this.state.studentGrades.findIndex((g) => g.studentId === studentId);
    let updatedGrades = [...this.state.studentGrades];

    if (existingEntryIndex >= 0) {
      const entry = { ...updatedGrades[existingEntryIndex] };
      entry.scores = { ...entry.scores, [gradeItemId]: score };
      updatedGrades[existingEntryIndex] = entry;
    } else {
      updatedGrades.push({
        studentId,
        scores: { [gradeItemId]: score },
      });
    }

    this.state = {
      ...this.state,
      studentGrades: updatedGrades,
    };
    this.notify();
  }

  public addGradeItem(item: Omit<GradeItem, 'id'>) {
    const newItem: GradeItem = {
      ...item,
      id: `gi-${Date.now()}`,
    };
    this.state = {
      ...this.state,
      gradeItems: [...this.state.gradeItems, newItem],
    };
    this.notify();
    return newItem;
  }

  public deleteGradeItem(id: string) {
    this.state = {
      ...this.state,
      gradeItems: this.state.gradeItems.filter((g) => g.id !== id),
    };
    this.notify();
  }

  // Lesson Plans
  public saveLessonPlan(plan: LessonPlan) {
    const index = this.state.lessonPlans.findIndex((p) => p.id === plan.id);
    let updated = [...this.state.lessonPlans];
    if (index >= 0) {
      updated[index] = { ...plan, updatedAt: new Date().toISOString() };
    } else {
      updated = [{ ...plan, id: plan.id || `lp-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...updated];
    }
    this.state = {
      ...this.state,
      lessonPlans: updated,
    };
    this.notify();
  }

  public deleteLessonPlan(id: string) {
    this.state = {
      ...this.state,
      lessonPlans: this.state.lessonPlans.filter((p) => p.id !== id),
    };
    this.notify();
  }

  // Behavior Logs
  public addBehaviorLog(log: Omit<BehaviorLog, 'id' | 'createdAt'>) {
    const newLog: BehaviorLog = {
      ...log,
      id: `beh-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.state = {
      ...this.state,
      behaviorLogs: [newLog, ...this.state.behaviorLogs],
    };
    this.notify();
    return newLog;
  }

  public deleteBehaviorLog(id: string) {
    this.state = {
      ...this.state,
      behaviorLogs: this.state.behaviorLogs.filter((b) => b.id !== id),
    };
    this.notify();
  }

  // Daily Journals
  public saveJournal(journal: DailyTeachingJournal) {
    const index = this.state.journals.findIndex((j) => j.id === journal.id);
    let updated = [...this.state.journals];
    if (index >= 0) {
      updated[index] = journal;
    } else {
      updated = [journal, ...updated];
    }
    this.state = {
      ...this.state,
      journals: updated,
    };
    this.notify();
  }

  public deleteJournal(id: string) {
    this.state = {
      ...this.state,
      journals: this.state.journals.filter((j) => j.id !== id),
    };
    this.notify();
  }

  // Backup & Restore for Google Drive & Local Storage
  public exportBackup(): string {
    const backupPayload = {
      app: 'EduFlow',
      version: '2.4.0',
      exportedAt: new Date().toISOString(),
      teacherName: this.state.teacher.name,
      schoolName: this.state.teacher.schoolName,
      data: this.state,
    };
    return JSON.stringify(backupPayload, null, 2);
  }

  public importBackup(jsonString: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonString);
      const stateToLoad = parsed.data || parsed;

      if (!stateToLoad.teacher || !stateToLoad.classes || !stateToLoad.students) {
        return { success: false, message: 'Format file tidak sesuai standar cadangan EduFlow.' };
      }

      this.state = {
        teacher: stateToLoad.teacher,
        classes: stateToLoad.classes || [],
        students: stateToLoad.students || [],
        schedules: stateToLoad.schedules || [],
        attendanceSessions: stateToLoad.attendanceSessions || [],
        lessonPlans: stateToLoad.lessonPlans || [],
        gradeItems: stateToLoad.gradeItems || [],
        studentGrades: stateToLoad.studentGrades || [],
        behaviorLogs: stateToLoad.behaviorLogs || [],
        journals: stateToLoad.journals || [],
        accounts: stateToLoad.accounts || this.state.accounts,
        currentUser: this.state.currentUser,
      };
      this.notify();
      return { success: true, message: 'Data cadangan berhasil dipulihkan dengan sempurna!' };
    } catch (err: any) {
      return { success: false, message: `Gagal membaca file: ${err.message || 'File rusak'}` };
    }
  }

  // Reset to initial demo state
  public resetToDefault() {
    this.state = {
      teacher: initialTeacherProfile,
      classes: initialClasses,
      students: initialStudents,
      schedules: initialSchedules,
      attendanceSessions: initialAttendanceSessions,
      lessonPlans: initialLessonPlans,
      gradeItems: initialGradeItems,
      studentGrades: initialStudentGrades,
      behaviorLogs: initialBehaviorLogs,
      journals: initialTeachingJournals,
      accounts: initialAccounts,
      currentUser: initialAccounts[0],
    };
    this.notify();
  }
}

export const store = new EduFlowStore();

// Helper calculation functions
export function calculateWeightedAverage(
  studentScores: Record<string, number>,
  items: GradeItem[]
): number {
  if (items.length === 0) return 0;
  let totalScoreWeight = 0;
  let totalWeight = 0;

  items.forEach((item) => {
    const score = studentScores[item.id];
    if (typeof score === 'number' && !isNaN(score)) {
      totalScoreWeight += score * item.weight;
      totalWeight += item.weight;
    }
  });

  if (totalWeight === 0) return 0;
  return Math.round((totalScoreWeight / totalWeight) * 10) / 10;
}

// Generate automated narrative description for Kurikulum Merdeka (E-Rapor format)
export function generateERaporNarrative(
  studentName: string,
  scores: Record<string, number>,
  items: GradeItem[],
  kktp: number = 75
): string {
  const validEvaluations: { item: GradeItem; score: number }[] = [];
  items.forEach((item) => {
    const s = scores[item.id];
    if (typeof s === 'number') {
      validEvaluations.push({ item, score: s });
    }
  });

  if (validEvaluations.length === 0) {
    return `Ananda ${studentName} belum memiliki rekaman nilai asesmen pada periode ini.`;
  }

  validEvaluations.sort((a, b) => b.score - a.score);
  const highest = validEvaluations[0];
  const lowest = validEvaluations[validEvaluations.length - 1];

  let positivePart = '';
  if (highest.score >= 88) {
    positivePart = `menunjukkan penguasaan yang sangat istimewa dalam ${highest.item.title.toLowerCase().replace(/^(formatif|praktik|kuis|tugas)\s*\d*:\s*/i, '')}`;
  } else if (highest.score >= kktp) {
    positivePart = `menunjukkan pemahaman yang baik dalam ${highest.item.title.toLowerCase().replace(/^(formatif|praktik|kuis|tugas)\s*\d*:\s*/i, '')}`;
  } else {
    positivePart = `cukup memahami konsep dasar ${highest.item.title.toLowerCase().replace(/^(formatif|praktik|kuis|tugas)\s*\d*:\s*/i, '')}`;
  }

  let improvementPart = '';
  if (lowest.score < kktp) {
    improvementPart = `, namun masih memerlukan bimbingan intensif dan penguatan pada materi ${lowest.item.title.toLowerCase().replace(/^(formatif|praktik|kuis|tugas)\s*\d*:\s*/i, '')}.`;
  } else if (lowest.score <= 80 && validEvaluations.length > 1) {
    improvementPart = `, serta perlu terus mengasah penalaran kritis dalam ${lowest.item.title.toLowerCase().replace(/^(formatif|praktik|kuis|tugas)\s*\d*:\s*/i, '')}.`;
  } else {
    improvementPart = `, serta konsisten mempertahankan prestasi belajarnya.`;
  }

  return `Ananda ${studentName} ${positivePart}${improvementPart}`;
}
