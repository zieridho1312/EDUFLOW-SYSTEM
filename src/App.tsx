import React, { useState } from 'react';
import { useEduFlowStore } from './hooks/useEduFlowStore';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardModule } from './components/dashboard/DashboardModule';
import { SmartPlannerModule } from './components/planner/SmartPlannerModule';
import { AttendanceModule } from './components/attendance/AttendanceModule';
import { GradebookModule } from './components/gradebook/GradebookModule';
import { BehaviorModule } from './components/behavior/BehaviorModule';
import { ExportCenterModule } from './components/export/ExportCenterModule';
import { DatabaseSchemaModule } from './components/schema/DatabaseSchemaModule';
import { SettingsModule } from './components/settings/SettingsModule';
import { TeacherGuideModule } from './components/guide/TeacherGuideModule';
import { QuickActionModal } from './components/modals/QuickActionModal';
import { Menu, X } from 'lucide-react';

export default function App() {
  const { state, store } = useEduFlowStore();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeClassParam, setActiveClassParam] = useState<string | undefined>(undefined);
  const [showQuickModal, setShowQuickModal] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleNavigateTab = (tab: string, extraParam?: string) => {
    setActiveTab(tab);
    if (extraParam) {
      setActiveClassParam(extraParam);
    }
    setMobileMenuOpen(false);
  };

  const handleOpenNewLessonPlan = () => {
    setActiveTab('planner');
  };

  const handleOpenNewBehavior = () => {
    setActiveTab('behavior');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <div className="no-print">
        <Header
          teacher={state.teacher}
          activeTab={activeTab}
          onOpenQuickAction={() => setShowQuickModal(true)}
          onOpenPrintCenter={() => setActiveTab('export')}
          onSelectAction={(tab, param) => handleNavigateTab(tab, param)}
          onOpenSettings={() => setActiveTab('settings')}
        />
      </div>

      {/* Mobile Menu Hamburger Bar (Small screens) */}
      <div className="md:hidden flex items-center justify-between px-4 py-2.5 bg-white border-b border-slate-200 no-print">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-700 p-1.5 rounded-lg border border-slate-200"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>Menu Navigasi Guru</span>
        </button>

        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
          {state.teacher.schoolName.split(' ')[0]} {state.teacher.schoolName.split(' ')[1]}
        </span>
      </div>

      {/* Main Layout Body */}
      <div className="flex-1 flex max-w-[1920px] w-full mx-auto">
        {/* Desktop Sidebar */}
        <div className="hidden md:block no-print">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            teacher={state.teacher}
            onResetData={() => store.resetToDefault()}
          />
        </div>

        {/* Mobile Drawer (When open on small devices) */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/40 md:hidden flex no-print">
            <div className="w-72 bg-white h-full shadow-2xl overflow-y-auto">
              <Sidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {
                  setActiveTab(tab);
                  setMobileMenuOpen(false);
                }}
                teacher={state.teacher}
                onResetData={() => {
                  store.resetToDefault();
                  setMobileMenuOpen(false);
                }}
              />
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardModule
              state={state}
              onNavigateTab={handleNavigateTab}
              onOpenNewBehavior={handleOpenNewBehavior}
              onOpenNewLessonPlan={handleOpenNewLessonPlan}
            />
          )}

          {activeTab === 'planner' && (
            <SmartPlannerModule
              plans={state.lessonPlans}
              teacher={state.teacher}
              onSavePlan={(plan) => store.saveLessonPlan(plan)}
              onDeletePlan={(id) => store.deleteLessonPlan(id)}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceModule
              classes={state.classes}
              students={state.students}
              sessions={state.attendanceSessions}
              onSaveSession={(sess) => store.saveAttendanceSession(sess)}
              defaultClassId={activeClassParam}
            />
          )}

          {activeTab === 'gradebook' && (
            <GradebookModule
              classes={state.classes}
              students={state.students}
              gradeItems={state.gradeItems}
              studentGrades={state.studentGrades}
              onUpdateScore={(studentId, itemId, score) =>
                store.updateStudentScore(studentId, itemId, score)
              }
              onAddGradeItem={(item) => store.addGradeItem(item)}
              onDeleteGradeItem={(id) => store.deleteGradeItem(id)}
              defaultClassId={activeClassParam}
            />
          )}

          {activeTab === 'behavior' && (
            <BehaviorModule
              classes={state.classes}
              students={state.students}
              logs={state.behaviorLogs}
              onAddLog={(log) => store.addBehaviorLog(log)}
              onDeleteLog={(id) => store.deleteBehaviorLog(id)}
              defaultClassId={activeClassParam}
            />
          )}

          {activeTab === 'guide' && (
            <TeacherGuideModule state={state} />
          )}

          {activeTab === 'settings' && (
            <SettingsModule
              teacher={state.teacher}
              onUpdateTeacher={(partial) => store.updateTeacher(partial)}
              onResetData={() => store.resetToDefault()}
            />
          )}

          {activeTab === 'export' && (
            <ExportCenterModule state={state} />
          )}

          {activeTab === 'schema' && (
            <DatabaseSchemaModule />
          )}
        </main>
      </div>

      {/* Quick Action Launcher Modal */}
      <QuickActionModal
        isOpen={showQuickModal}
        onClose={() => setShowQuickModal(false)}
        onSelectAction={(tab, extra) => {
          setActiveTab(tab);
        }}
      />
    </div>
  );
}
