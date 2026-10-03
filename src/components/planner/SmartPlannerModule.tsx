import React, { useState } from 'react';
import { LessonPlan, TeacherProfile } from '../../types/database';
import {
  BookOpen,
  Plus,
  Save,
  Printer,
  Copy,
  Check,
  Download,
  Trash2,
  Sparkles,
  FileText,
  ChevronRight,
  Eye,
  Edit3,
} from 'lucide-react';

interface SmartPlannerModuleProps {
  plans: LessonPlan[];
  teacher: TeacherProfile;
  onSavePlan: (plan: LessonPlan) => void;
  onDeletePlan: (id: string) => void;
  initialSelectedId?: string;
}

const P3_DIMENSIONS = [
  'Beriman & Bertakwa',
  'Berkebinekaan Global',
  'Gotong Royong',
  'Mandiri',
  'Bernalar Kritis',
  'Kreatif',
];

export const SmartPlannerModule: React.FC<SmartPlannerModuleProps> = ({
  plans,
  teacher,
  onSavePlan,
  onDeletePlan,
  initialSelectedId,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    initialSelectedId || (plans[0] ? plans[0].id : '')
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Active plan
  const activePlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  // Form State for editing / creating
  const [formData, setFormData] = useState<LessonPlan>(() => {
    return (
      activePlan || {
        id: `lp-${Date.now()}`,
        title: 'Modul Ajar Baru: Berpikir Komputasional',
        subject: 'Informatika',
        gradeLevel: 'Kelas X (Fase E)',
        phase: 'Fase E',
        semester: 'Ganjil',
        alokasiWaktu: '2 JP (2 x 45 Menit)',
        elemen: 'Berpikir Komputasional (BK)',
        capaianPembelajaran:
          'Peserta didik mampu menerapkan strategi algoritmik standar pada persoalan komputasi untuk menghasilkan solusi efisien.',
        tujuanPembelajaran: [
          'Memahami konsep dasar struktur data.',
          'Menerapkan algoritma pencarian pada data terstruktur.',
        ],
        profilPelajarPancasila: ['Bernalar Kritis', 'Gotong Royong', 'Mandiri'],
        targetPesertaDidik: 'Reguler / Umum (32 Siswa)',
        modelPembelajaran: 'Problem Based Learning (PBL)',
        saranaPrasarana: 'Laptop/Smartphone, LKPD, LCD Proyektor',
        pemahamanBermakna: 'Algoritma membantu menyelesaikan masalah sistematis secara terukur.',
        pertanyaanPemantik: [
          'Bagaimana cara tercepat mencari satu data di antara ribuan catatan?',
        ],
        kegiatanPembelajaran: {
          pendahuluan: [
            { duration: '10 Menit', description: 'Guru membuka dengan salam, doa, dan apersepsi kasus sehari-hari.' },
          ],
          inti: [
            {
              duration: '60 Menit',
              description: 'Peserta didik bekerja dalam kelompok menyelesaikan lembar studi kasus.',
              diferensiasi: 'Kelompok dapat memilih visualisasi bagan atau narasi kode.',
            },
          ],
          penutup: [
            { duration: '10 Menit', description: 'Refleksi pembelajaran dan tindak lanjut penugasan mandiri.' },
          ],
        },
        asesmen: {
          diagnostik: 'Kuis awal pemahaman konsep (3 soal)',
          formatif: 'Observasi keaktifan diskusi kelompok dan pengerjaan LKPD',
          sumatif: 'Uji pemahaman komprehensif tertulis di akhir materi',
          kktpDeskripsi: 'Tuntas jika skor evaluasi >= 75 dan mampu menjelaskan tahapan logika.',
        },
        remedialPengayaan: {
          remedial: 'Bimbingan terarah tutor sebaya bagi siswa yang belum tuntas.',
          pengayaan: 'Eksplorasi algoritma lanjutan tingkat kompetisi sains.',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
  });

  const handleSelectPlan = (plan: LessonPlan) => {
    setSelectedPlanId(plan.id);
    setFormData(plan);
    setIsEditing(false);
  };

  const handleCreateNew = () => {
    const newPlan: LessonPlan = {
      id: `lp-${Date.now()}`,
      title: 'Modul Ajar Baru (Kurikulum Merdeka)',
      subject: 'Informatika',
      gradeLevel: 'Kelas X (Fase E)',
      phase: 'Fase E',
      semester: 'Ganjil',
      alokasiWaktu: '2 JP (2 x 45 Menit)',
      elemen: 'Analisis Data & Pemrograman',
      capaianPembelajaran: 'Peserta didik mampu mengolah, menganalisis data, dan menyajikan simpulan secara sistematis.',
      tujuanPembelajaran: [
        'Menganalisis data angka menggunakan spreadsheet digital.',
        'Menyajikan visualisasi data yang informatif dan akurat.',
      ],
      profilPelajarPancasila: ['Bernalar Kritis', 'Mandiri'],
      targetPesertaDidik: 'Reguler / Umum (32 Siswa)',
      modelPembelajaran: 'Project Based Learning (PjBL)',
      saranaPrasarana: 'Komputer Lab, Dataset CSV, Lembar Kerja',
      pemahamanBermakna: 'Data yang dianalisis dengan baik menjadi dasar keputusan yang tepat.',
      pertanyaanPemantik: [
        'Mengapa angka mentah perlu diubah menjadi grafik yang mudah dipahami?',
      ],
      kegiatanPembelajaran: {
        pendahuluan: [
          { duration: '10 Menit', description: 'Salam, apersepsi berita grafik infografis, dan penyampaian target belajar.' },
        ],
        inti: [
          {
            duration: '60 Menit',
            description: 'Eksplorasi proyek analisis data tren konsumsi energi siswa di sekolah.',
            diferensiasi: 'Tersedia dataset terpandu bagi pemula dan dataset terbuka bagi mahir.',
          },
        ],
        penutup: [
          { duration: '10 Menit', description: 'Simpulan hasil data, asesmen diri, dan penutupan kelas.' },
        ],
      },
      asesmen: {
        diagnostik: 'Tes singkat literasi dasar membaca grafik.',
        formatif: 'Penilaian produk visualisasi data dan laporan singkat.',
        sumatif: 'Tes sumatif pemecahan masalah data terstruktur.',
        kktpDeskripsi: 'Peserta didik mampu membuat minimal 2 grafik representatif dengan deskripsi valid (Skor >= 75).',
      },
      remedialPengayaan: {
        remedial: 'Latihan membuat diagram batang terpandu dengan instruksi bertahap.',
        pengayaan: 'Menggunakan formula analisis multivariabel pada dataset kompleks.',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSavePlan(newPlan);
    setSelectedPlanId(newPlan.id);
    setFormData(newPlan);
    setIsEditing(true);
  };

  const handleSave = () => {
    onSavePlan(formData);
    setIsEditing(false);
  };

  const handleToggleP3 = (dim: string) => {
    const exists = formData.profilPelajarPancasila.includes(dim);
    let updated: string[];
    if (exists) {
      updated = formData.profilPelajarPancasila.filter((d) => d !== dim);
    } else {
      updated = [...formData.profilPelajarPancasila, dim];
    }
    setFormData({ ...formData, profilPelajarPancasila: updated });
  };

  const handleCopyText = () => {
    if (!activePlan) return;
    const text = `
MODUL AJAR KURIKULUM MERDEKA
${activePlan.title}
Satuan Pendidikan: ${teacher.schoolName}
Penyusun: ${teacher.name}
Mata Pelajaran: ${activePlan.subject}
Fase / Kelas: ${activePlan.phase} / ${activePlan.gradeLevel}
Alokasi Waktu: ${activePlan.alokasiWaktu}

A. CAPAIAN PEMBELAJARAN & ELEMEN
Elemen: ${activePlan.elemen}
Capaian: ${activePlan.capaianPembelajaran}

B. TUJUAN PEMBELAJARAN (TP)
${activePlan.tujuanPembelajaran.map((tp, i) => `${i + 1}. ${tp}`).join('\n')}

C. PROFIL PELAJAR PANCASILA
${activePlan.profilPelajarPancasila.join(', ')}

D. MODEL PEMBELAJARAN: ${activePlan.modelPembelajaran}
Target Peserta Didik: ${activePlan.targetPesertaDidik}
Sarana & Prasarana: ${activePlan.saranaPrasarana}

E. PEMAHAMAN BERMAKNA & PERTANYAAN PEMANTIK
Pemahaman Bermakna: ${activePlan.pemahamanBermakna}
Pertanyaan Pemantik:
${activePlan.pertanyaanPemantik.map((q, i) => `- ${q}`).join('\n')}

F. KEGIATAN PEMBELAJARAN
1. Pendahuluan:
${activePlan.kegiatanPembelajaran.pendahuluan.map((k) => `  - (${k.duration}) ${k.description}`).join('\n')}
2. Inti (Berdiferensiasi):
${activePlan.kegiatanPembelajaran.inti.map((k) => `  - (${k.duration}) ${k.description}\n    Diferensiasi: ${k.diferensiasi}`).join('\n')}
3. Penutup:
${activePlan.kegiatanPembelajaran.penutup.map((k) => `  - (${k.duration}) ${k.description}`).join('\n')}

G. ASESMEN & KRITERIA KETERCAPAIAN (KKTP)
- Diagnostik: ${activePlan.asesmen.diagnostik}
- Formatif: ${activePlan.asesmen.formatif}
- Sumatif: ${activePlan.asesmen.sumatif}
- Rubrik KKTP: ${activePlan.asesmen.kktpDeskripsi}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadDoc = () => {
    if (!activePlan) return;
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>${activePlan.title}</title>
      <style>
        body { font-family: 'Calibri', Arial, sans-serif; line-height: 1.5; font-size: 11pt; }
        h1, h2, h3 { color: #0f172a; margin-bottom: 4px; }
        .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .meta-table td { padding: 6px; border: 1px solid #cbd5e1; }
        .section-title { font-weight: bold; font-size: 12pt; background-color: #f1f5f9; padding: 6px; margin-top: 16px; }
      </style>
      </head>
      <body>
        <h2 style="text-align: center;">MODUL AJAR KURIKULUM MERDEKA</h2>
        <h3 style="text-align: center;">${activePlan.title}</h3>
        <p style="text-align: center; font-size: 10pt;">${teacher.schoolName} — ${teacher.name}</p>
        <hr/>
        <table class="meta-table">
          <tr><td><strong>Mata Pelajaran:</strong></td><td>${activePlan.subject}</td><td><strong>Fase / Kelas:</strong></td><td>${activePlan.phase} / ${activePlan.gradeLevel}</td></tr>
          <tr><td><strong>Elemen:</strong></td><td>${activePlan.elemen}</td><td><strong>Alokasi Waktu:</strong></td><td>${activePlan.alokasiWaktu}</td></tr>
          <tr><td><strong>Model Pembelajaran:</strong></td><td colspan="3">${activePlan.modelPembelajaran}</td></tr>
          <tr><td><strong>Profil Pelajar Pancasila:</strong></td><td colspan="3">${activePlan.profilPelajarPancasila.join(', ')}</td></tr>
        </table>
        
        <div class="section-title">A. TUJUAN PEMBELAJARAN (TP)</div>
        <ol>
          ${activePlan.tujuanPembelajaran.map((tp) => `<li>${tp}</li>`).join('')}
        </ol>

        <div class="section-title">B. PEMAHAMAN BERMAKNA & PERTANYAAN PEMANTIK</div>
        <p><strong>Pemahaman Bermakna:</strong> ${activePlan.pemahamanBermakna}</p>
        <p><strong>Pertanyaan Pemantik:</strong></p>
        <ul>
          ${activePlan.pertanyaanPemantik.map((q) => `<li>${q}</li>`).join('')}
        </ul>

        <div class="section-title">C. KEGIATAN PEMBELAJARAN BERDIFERENSIASI</div>
        <p><strong>1. Pendahuluan:</strong></p>
        <ul>${activePlan.kegiatanPembelajaran.pendahuluan.map((k) => `<li>(${k.duration}) ${k.description}</li>`).join('')}</ul>
        <p><strong>2. Inti:</strong></p>
        <ul>${activePlan.kegiatanPembelajaran.inti.map((k) => `<li>(${k.duration}) ${k.description}<br/><em>Diferensiasi: ${k.diferensiasi}</em></li>`).join('')}</ul>
        <p><strong>3. Penutup:</strong></p>
        <ul>${activePlan.kegiatanPembelajaran.penutup.map((k) => `<li>(${k.duration}) ${k.description}</li>`).join('')}</ul>

        <div class="section-title">D. ASESMEN & KRITERIA KETERCAPAIAN (KKTP)</div>
        <p><strong>Formatif:</strong> ${activePlan.asesmen.formatif}</p>
        <p><strong>Sumatif:</strong> ${activePlan.asesmen.sumatif}</p>
        <p><strong>Kriteria KKTP:</strong> ${activePlan.asesmen.kktpDeskripsi}</p>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activePlan.title.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Standar BSKAP No. 033/H/KR/2022</span>
            <span aria-hidden="true">·</span>
            <span>Kurikulum Merdeka Kemendikbudristek</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Smart Planner Modul Ajar
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Rancang rencana pembelajaran berdiferensiasi lengkap dengan dimensi Profil Pelajar Pancasila & rubrik KKTP
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Modul Baru</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Modul Selector on Left, Preview / Editor on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols): Modul List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
            <span>Daftar Modul Ajar ({plans.length})</span>
            <span>Fase E & F</span>
          </div>

          <div className="space-y-2">
            {plans.map((p) => {
              const isSelected = p.id === activePlan?.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectPlan(p)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                      {p.gradeLevel}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {p.alokasiWaktu.split('(')[0]}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 mt-2 line-clamp-2 leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                    Elemen: {p.elemen}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                    <span>{p.profilPelajarPancasila.length} Dimensi P3</span>
                    <span className="text-emerald-700 font-medium">Berdiferensiasi</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (8 cols): Plan Detail / Form Editor */}
        <div className="lg:col-span-8 space-y-4">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 p-3 rounded-xl">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setIsEditing(false)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                  !isEditing ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Pratinjau Resmi</span>
              </button>
              <button
                onClick={() => {
                  setFormData(activePlan);
                  setIsEditing(true);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                  isEditing ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Sunting / Edit</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyText}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1"
                title="Salin format teks"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>

              <button
                onClick={handleDownloadDoc}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1"
                title="Unduh file dokumen Word (.doc)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Word (.doc)</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1"
                title="Cetak atau simpan PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak PDF</span>
              </button>

              {plans.length > 1 && (
                <button
                  onClick={() => {
                    if (window.confirm(`Hapus modul "${activePlan.title}"?`)) {
                      onDeletePlan(activePlan.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Hapus modul"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* If Editing Mode */}
          {isEditing ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">Formulir Modul Ajar Berdiferensiasi</h2>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>

              {/* Bagian 1: Identitas */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  I. Identitas Modul
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Judul Modul Ajar</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Mata Pelajaran</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Fase & Kelas</label>
                    <input
                      type="text"
                      value={formData.gradeLevel}
                      onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Alokasi Waktu</label>
                    <input
                      type="text"
                      value={formData.alokasiWaktu}
                      onChange={(e) => setFormData({ ...formData, alokasiWaktu: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Elemen CP</label>
                    <input
                      type="text"
                      value={formData.elemen}
                      onChange={(e) => setFormData({ ...formData, elemen: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 2: Profil Pelajar Pancasila */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  II. Dimensi Profil Pelajar Pancasila (P3)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {P3_DIMENSIONS.map((dim) => {
                    const active = formData.profilPelajarPancasila.includes(dim);
                    return (
                      <button
                        type="button"
                        key={dim}
                        onClick={() => handleToggleP3(dim)}
                        className={`px-3 py-2 text-xs font-medium rounded-lg border text-left transition-colors flex items-center justify-between ${
                          active
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{dim}</span>
                        {active && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bagian 3: Capaian & Tujuan Pembelajaran */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  III. Capaian & Tujuan Pembelajaran (TP)
                </h3>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">Capaian Pembelajaran (CP)</label>
                  <textarea
                    rows={3}
                    value={formData.capaianPembelajaran}
                    onChange={(e) => setFormData({ ...formData, capaianPembelajaran: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">Tujuan Pembelajaran (1 baris per TP)</label>
                  <textarea
                    rows={3}
                    value={formData.tujuanPembelajaran.join('\n')}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tujuanPembelajaran: e.target.value.split('\n').filter((l) => l.trim().length > 0),
                      })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Bagian 4: Pemahaman Bermakna & Pemantik */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  IV. Pemahaman Bermakna & Model
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Model Pembelajaran</label>
                    <input
                      type="text"
                      value={formData.modelPembelajaran}
                      onChange={(e) => setFormData({ ...formData, modelPembelajaran: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Sarana & Prasarana</label>
                    <input
                      type="text"
                      value={formData.saranaPrasarana}
                      onChange={(e) => setFormData({ ...formData, saranaPrasarana: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Pemahaman Bermakna</label>
                  <textarea
                    rows={2}
                    value={formData.pemahamanBermakna}
                    onChange={(e) => setFormData({ ...formData, pemahamanBermakna: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  Simpan Modul Ajar
                </button>
              </div>
            </div>
          ) : (
            /* Official Preview Container */
            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6 shadow-xs print:p-0 print:border-none print:shadow-none">
              {/* Kop Header */}
              <div className="text-center pb-6 border-b-2 border-slate-800 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  PEMERINTAH PROVINSI DKI JAKARTA — DINAS PENDIDIKAN
                </p>
                <h2 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight">
                  {teacher.schoolName.toUpperCase()}
                </h2>
                <p className="text-[11px] text-slate-600">
                  {teacher.schoolAddress} — Telp. {teacher.phone}
                </p>
                <div className="pt-3">
                  <h3 className="text-base font-bold text-emerald-800 inline-block px-3 py-1 border-b-2 border-emerald-600">
                    MODUL AJAR KURIKULUM MERDEKA
                  </h3>
                </div>
              </div>

              {/* Identitas Table */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="w-1/4 p-2.5 font-semibold text-slate-600 bg-slate-100/60">Judul Modul</td>
                      <td className="w-3/4 p-2.5 font-bold text-slate-900">{activePlan.title}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold text-slate-600 bg-slate-100/60">Penyusun / NIP</td>
                      <td className="p-2.5 text-slate-800">{teacher.name} (NIP: {teacher.nip})</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold text-slate-600 bg-slate-100/60">Mata Pelajaran & Fase</td>
                      <td className="p-2.5 text-slate-800">{activePlan.subject} — {activePlan.phase} ({activePlan.gradeLevel})</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold text-slate-600 bg-slate-100/60">Elemen / Alokasi Waktu</td>
                      <td className="p-2.5 text-slate-800">{activePlan.elemen} · {activePlan.alokasiWaktu}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold text-slate-600 bg-slate-100/60">Model Pembelajaran</td>
                      <td className="p-2.5 text-slate-800">{activePlan.modelPembelajaran}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold text-slate-600 bg-slate-100/60">Dimensi P3 Terintegrasi</td>
                      <td className="p-2.5 text-emerald-800 font-medium">
                        {activePlan.profilPelajarPancasila.join(' · ')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Section 1: Capaian & Tujuan */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-l-4 border-emerald-600 pl-2">
                  A. Capaian & Tujuan Pembelajaran (TP)
                </h4>
                <div className="p-3.5 bg-slate-50 rounded-lg text-xs text-slate-700 leading-relaxed">
                  <strong>Capaian Pembelajaran:</strong> {activePlan.capaianPembelajaran}
                </div>
                <div className="space-y-1.5 pl-2">
                  <p className="text-xs font-semibold text-slate-800">Tujuan Pembelajaran Khusus:</p>
                  <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                    {activePlan.tujuanPembelajaran.map((tp, i) => (
                      <li key={i}>{tp}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Section 2: Pemahaman Bermakna & Pertanyaan Pemantik */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-l-4 border-emerald-600 pl-2">
                  B. Pemahaman Bermakna & Pertanyaan Pemantik
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 border border-slate-100">
                    <span className="font-bold text-slate-800">Pemahaman Bermakna:</span>
                    <p className="text-slate-600 leading-relaxed">{activePlan.pemahamanBermakna}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 border border-slate-100">
                    <span className="font-bold text-slate-800">Pertanyaan Pemantik:</span>
                    <ul className="list-disc list-inside text-slate-600 space-y-1">
                      {activePlan.pertanyaanPemantik.map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section 3: Langkah Kegiatan Pembelajaran */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-l-4 border-emerald-600 pl-2">
                  C. Kegiatan Pembelajaran Berdiferensiasi
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full">
                    <thead className="bg-slate-100 border-b border-slate-200 text-slate-700">
                      <tr>
                        <th className="p-2.5 text-left w-24">Tahap</th>
                        <th className="p-2.5 text-left">Deskripsi Skenario Pembelajaran</th>
                        <th className="p-2.5 text-left w-24">Waktu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {activePlan.kegiatanPembelajaran.pendahuluan.map((k, i) => (
                        <tr key={`p-${i}`} className="bg-white">
                          <td className="p-2.5 font-semibold text-slate-700">Pendahuluan</td>
                          <td className="p-2.5 text-slate-700">{k.description}</td>
                          <td className="p-2.5 font-mono text-slate-500">{k.duration}</td>
                        </tr>
                      ))}
                      {activePlan.kegiatanPembelajaran.inti.map((k, i) => (
                        <tr key={`i-${i}`} className="bg-slate-50/50">
                          <td className="p-2.5 font-semibold text-emerald-800">Kegiatan Inti</td>
                          <td className="p-2.5 text-slate-800">
                            <p>{k.description}</p>
                            {k.diferensiasi && (
                              <p className="mt-1 text-[11px] text-emerald-700 font-medium bg-emerald-50/80 p-1.5 rounded">
                                <strong>Diferensiasi:</strong> {k.diferensiasi}
                              </p>
                            )}
                          </td>
                          <td className="p-2.5 font-mono text-slate-500">{k.duration}</td>
                        </tr>
                      ))}
                      {activePlan.kegiatanPembelajaran.penutup.map((k, i) => (
                        <tr key={`c-${i}`} className="bg-white">
                          <td className="p-2.5 font-semibold text-slate-700">Penutup</td>
                          <td className="p-2.5 text-slate-700">{k.description}</td>
                          <td className="p-2.5 font-mono text-slate-500">{k.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 4: Asesmen & Rubrik KKTP */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-l-4 border-emerald-600 pl-2">
                  D. Asesmen & Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-1">Asesmen Diagnostik:</span>
                    <p className="text-slate-600">{activePlan.asesmen.diagnostik}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-1">Asesmen Formatif:</span>
                    <p className="text-slate-600">{activePlan.asesmen.formatif}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-1">Asesmen Sumatif:</span>
                    <p className="text-slate-600">{activePlan.asesmen.sumatif}</p>
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900">
                  <strong>Rubrik / Deskripsi KKTP:</strong> {activePlan.asesmen.kktpDeskripsi}
                </div>
              </div>

              {/* Signatures */}
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
          )}
        </div>
      </div>
    </div>
  );
};
