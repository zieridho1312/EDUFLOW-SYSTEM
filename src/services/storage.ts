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
}

function loadInitialState(): EduFlowState {
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
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        teacher: parsed.teacher || initialTeacherProfile,
        classes: parsed.classes || initialClasses,
        students: parsed.students || initialStudents,
        schedules: parsed.schedules || initialSchedules,
        attendanceSessions: parsed.attendanceSessions || initialAttendanceSessions,
        lessonPlans: parsed.lessonPlans || initialLessonPlans,
        gradeItems: parsed.gradeItems || initialGradeItems,
        studentGrades: parsed.studentGrades || initialStudentGrades,
        behaviorLogs: parsed.behaviorLogs || initialBehaviorLogs,
        journals: parsed.journals || initialTeachingJournals,
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
