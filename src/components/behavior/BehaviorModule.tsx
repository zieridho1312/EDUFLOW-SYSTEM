import React, { useState } from 'react';
import {
  SchoolClass,
  Student,
  BehaviorLog,
} from '../../types/database';
import {
  HeartHandshake,
  Plus,
  Trash2,
  Search,
  MessageSquare,
  Award,
  AlertCircle,
  CheckCircle2,
  Calendar,
  User,
  Filter,
  Share2,
} from 'lucide-react';

interface BehaviorModuleProps {
  classes: SchoolClass[];
  students: Student[];
  logs: BehaviorLog[];
  onAddLog: (log: Omit<BehaviorLog, 'id' | 'createdAt'>) => void;
  onDeleteLog: (id: string) => void;
  defaultClassId?: string;
  onOpenNewModalDirect?: boolean;
  onOpenClassManager?: () => void;
}

const P3_DIMENSIONS = [
  'Semua Dimensi',
  'Beriman & Bertakwa',
  'Berkebinekaan Global',
  'Gotong Royong',
  'Mandiri',
  'Bernalar Kritis',
  'Kreatif',
];

export const BehaviorModule: React.FC<BehaviorModuleProps> = ({
  classes,
  students,
  logs,
  onAddLog,
  onDeleteLog,
  defaultClassId,
  onOpenNewModalDirect,
  onOpenClassManager,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDimension, setSelectedDimension] = useState<string>('Semua Dimensi');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(Boolean(onOpenNewModalDirect));
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);

  // New Log Form State
  const [formStudentId, setFormStudentId] = useState<string>(students[0]?.id || '');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formCategory, setFormCategory] = useState<'positif' | 'prestasi' | 'perhatian' | 'pelanggaran'>('positif');
  const [formDimension, setFormDimension] = useState<'Beriman & Bertakwa' | 'Berkebinekaan Global' | 'Gotong Royong' | 'Mandiri' | 'Bernalar Kritis' | 'Kreatif'>('Bernalar Kritis');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formActionTaken, setFormActionTaken] = useState<string>('');
  const [formParentNotified, setFormParentNotified] = useState<boolean>(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === formStudentId);
    if (!st) return;
    const cls = classes.find((c) => c.id === st.classId);

    onAddLog({
      studentId: st.id,
      studentName: st.name,
      classId: st.classId,
      className: cls?.name || 'Kelas',
      date: formDate,
      category: formCategory,
      dimensionP3: formDimension,
      title: formTitle,
      description: formDescription,
      actionTaken: formActionTaken || 'Dicatat dalam rekap perkembangan karakter murid.',
      parentNotified: formParentNotified,
      parentPhone: st.parentPhone,
    });

    setShowAddModal(false);
    setFormTitle('');
    setFormDescription('');
    setFormActionTaken('');
  };

  // Filter logs
  const filteredLogs = logs.filter((item) => {
    if (selectedClassId !== 'all' && item.classId !== selectedClassId) return false;
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedDimension !== 'Semua Dimensi' && item.dimensionP3 !== selectedDimension) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = item.studentName.toLowerCase().includes(q);
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      if (!matchName && !matchTitle && !matchDesc) return false;
    }
    return true;
  });

  const getWaLink = (log: BehaviorLog) => {
    const phone = log.parentPhone ? log.parentPhone.replace(/[^0-9]/g, '') : '';
    const st = students.find((s) => s.id === log.studentId);
    const parentName = st ? st.parentName : 'Wali Murid';
    const isPositive = log.category === 'positif' || log.category === 'prestasi';

    const text = isPositive
      ? `Assalamu'alaikum Wr. Wb. Yth. Bapak/Ibu ${parentName} (Wali dari Ananda ${log.studentName}). Kami dari pihak sekolah dengan bangga mengabarkan bahwa ananda menunjukkan prestasi/karakter positif dalam KBM: "${log.title}". Terima kasih atas dukungan Bapak/Ibu di rumah.`
      : `Assalamu'alaikum Wr. Wb. Yth. Bapak/Ibu ${parentName} (Wali dari Ananda ${log.studentName}). Kami dari pihak sekolah menginformasikan catatan perkembangan ananda terkait: "${log.title}" (${log.description}). Tindak lanjut pembinaan: ${log.actionTaken}. Mohon sinergi Bapak/Ibu untuk pendampingan ananda di rumah.`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Penguatan Profil Pelajar Pancasila (P3)</span>
              <span aria-hidden="true">·</span>
              <span>Dokumentasi Sikap & Refleksi Pembinaan</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Jurnal Sikap & Perilaku Murid
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Perilaku Baru</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-600">Filter Rombel</label>
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
              <option value="all">Semua Rombel / Kelas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} [{c.level || 'SMA'}]
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600">Kategori Perilaku</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Semua Kategori</option>
              <option value="prestasi">Prestasi & Inisiatif</option>
              <option value="positif">Perilaku Positif / Baik</option>
              <option value="perhatian">Perlu Perhatian / Bimbingan</option>
              <option value="pelanggaran">Pelanggaran Disiplin</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600">Dimensi P3</label>
            <select
              value={selectedDimension}
              onChange={(e) => setSelectedDimension(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {P3_DIMENSIONS.map((dim) => (
                <option key={dim} value={dim}>
                  {dim}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600">Pencarian Cepat</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari siswa atau topik..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Feed of Logs */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
            <HeartHandshake className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">Belum Ada Catatan Perilaku</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tidak ada log perilaku yang cocok dengan kriteria filter yang Anda pilih.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Catatan Baru</span>
            </button>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isPositive = log.category === 'positif' || log.category === 'prestasi';
            return (
              <div
                key={log.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{log.studentName}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-xs text-slate-600">{log.className}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      Dimensi {log.dimensionP3}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                        isPositive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {log.category.toUpperCase()}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">{log.date}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-800">{log.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{log.description}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-slate-700">Tindak Lanjut Guru: </span>
                    <span className="text-slate-600">{log.actionTaken}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {log.parentPhone && (
                      <a
                        href={getWaLink(log)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                        title="Kirim pesan WhatsApp ke orang tua"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Kirim WA ke Wali</span>
                      </a>
                    )}
                    <button
                      onClick={() => onDeleteLog(log.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Hapus log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Behavior Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Catat Sikap / Perilaku Murid</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Pilih Siswa</label>
                  <select
                    value={formStudentId}
                    onChange={(e) => setFormStudentId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({classes.find((c) => c.id === st.classId)?.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Tanggal Kejadian</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Kategori</label>
                  <select
                    value={formCategory}
                    onChange={(e: any) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="positif">Perilaku Positif / Baik</option>
                    <option value="prestasi">Prestasi / Inisiatif Khusus</option>
                    <option value="perhatian">Perlu Perhatian / Bimbingan</option>
                    <option value="pelanggaran">Pelanggaran Tata Tertib</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Dimensi Karakter P3</label>
                  <select
                    value={formDimension}
                    onChange={(e: any) => setFormDimension(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {P3_DIMENSIONS.filter((d) => d !== 'Semua Dimensi').map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Judul Catatan Singkat</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Tutor sebaya bagi teman yang kesulitan koding"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Uraian Kejadian / Perilaku</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan situasi, waktu, dan perilaku yang diamati secara objektif..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Tindak Lanjut / Solusi Guru</label>
                <input
                  type="text"
                  placeholder="Contoh: Diberikan poin apresiasi karakter / Dialog personal pasca kelas"
                  value={formActionTaken}
                  onChange={(e) => setFormActionTaken(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="parentNotif"
                  checked={formParentNotified}
                  onChange={(e) => setFormParentNotified(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="parentNotif" className="text-slate-700">
                  Siapkan pesan notifikasi WhatsApp untuk wali murid
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
