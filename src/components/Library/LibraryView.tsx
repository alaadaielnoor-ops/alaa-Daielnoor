import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { Resource, DocumentPage, DocumentChunk, Subject, EducationalStage, Grade } from '../../types/index.ts';
import {
  BookOpen, Plus, Search, Filter, Download, Trash2,
  Archive, RotateCcw, Eye, FileText, CheckCircle2,
  AlertTriangle, RefreshCw, X, ChevronLeft, ChevronRight,
  ExternalLink, Layers, Sparkles, GraduationCap,
  Copy, Printer, Check, List, Maximize2, Minimize2,
  ZoomIn, ZoomOut, Compass, ArrowRight, Bookmark,
  Image as ImageIcon, Award, Building2, School
} from 'lucide-react';
import { EditBookCoverModal } from './EditBookCoverModal.tsx';

export const LibraryView: React.FC<{ onOpenUpload: () => void }> = ({ onOpenUpload }) => {
  const {
    currentUser,
    showToast,
    selectedResourceIdForPreview,
    setSelectedResourceIdForPreview,
    setActiveView,
    schoolProfile,
    openSchoolProfileModal
  } = useApp();

  const [resources, setResources] = useState<Resource[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [stages, setStages] = useState<EducationalStage[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedVisionPriority, setSelectedVisionPriority] = useState<string>('all');
  const [quickPill, setQuickPill] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  // Document Detail / Reader Drawer
  const [inspectingResource, setInspectingResource] = useState<Resource | null>(null);
  const [docPages, setDocPages] = useState<DocumentPage[]>([]);
  const [docChunks, setDocChunks] = useState<DocumentChunk[]>([]);
  const [selectedPageNum, setSelectedPageNum] = useState<number>(1);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [generatingPages, setGeneratingPages] = useState(false);
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [readerTab, setReaderTab] = useState<'read' | 'toc' | 'chunks' | 'actions' | 'vision2040'>('read');
  const [readerFontSize, setReaderFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [copiedPage, setCopiedPage] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Edit Metadata Modal state
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editPublisher, setEditPublisher] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Edit Book Cover Modal state
  const [coverModalOpen, setCoverModalOpen] = useState(false);
  const [resourceForCoverEdit, setResourceForCoverEdit] = useState<Resource | null>(null);

  useEffect(() => {
    loadTaxonomyAndResources();
  }, [showArchived, showDeleted]);

  useEffect(() => {
    if (selectedResourceIdForPreview) {
      handleInspect(selectedResourceIdForPreview);
      setSelectedResourceIdForPreview(null);
    }
  }, [selectedResourceIdForPreview]);

  const loadTaxonomyAndResources = async () => {
    setLoading(true);
    try {
      const tax = await api.getTaxonomy();
      if (tax.success && tax.taxonomy) {
        setSubjects(tax.taxonomy.subjects || []);
        setStages(tax.taxonomy.stages || []);
        setGrades(tax.taxonomy.grades || []);
      }
      const res = await api.getResources({
        includeArchived: showArchived,
        includeDeleted: showDeleted
      });
      if (res.success && res.resources) {
        setResources(res.resources);
      }
    } catch (e) {
      console.warn('Error loading library:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleInspect = async (id: string) => {
    setLoadingDetails(true);
    setReaderTab('read');
    try {
      const res = await api.getResourceDetails(id);
      if (res.success) {
        setInspectingResource(res.resource);
        let pages = res.pages || [];
        let chunks = res.chunks || [];

        // إذا لم تكن هناك صفحات مفهرسة مسبقاً، استدعاء التوليد الفوري لضمان ظهور المحتوى كاملاً
        if (pages.length === 0) {
          try {
            const gen = await api.generateResourcePages(id);
            if (gen.success && gen.pages && gen.pages.length > 0) {
              pages = gen.pages;
              chunks = gen.chunks || [];
            }
          } catch (e) {
            console.warn('Auto-generation fallback warning:', e);
          }
        }

        setDocPages(pages);
        setDocChunks(chunks);
        setSelectedPageNum(pages && pages.length > 0 ? pages[0].pageNumber : 1);
      }
    } catch (err: any) {
      showToast(`تعذر فتح المستند: ${err.message}`, 'error');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleGeneratePages = async (id: string) => {
    setGeneratingPages(true);
    try {
      const gen = await api.generateResourcePages(id);
      if (gen.success && gen.pages) {
        setDocPages(gen.pages);
        setDocChunks(gen.chunks || []);
        setSelectedPageNum(gen.pages.length > 0 ? gen.pages[0].pageNumber : 1);
        showToast('تم استخراج وتوليد صفحات وفهرس الكتاب بنجاح', 'success');
      }
    } catch (err: any) {
      showToast(`فشل توليد الصفحات: ${err.message}`, 'error');
    } finally {
      setGeneratingPages(false);
    }
  };

  const handleCopyPageText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPage(true);
    showToast('تم نسخ نص الصفحة إلى الحافظة بنجاح', 'success');
    setTimeout(() => setCopiedPage(false), 2000);
  };

  const handleArchive = async (res: Resource) => {
    try {
      const result = await api.archiveResource(res.id, currentUser.id);
      if (result.success) {
        showToast(result.isArchived ? 'تمت أرشفة المصدر بنجاح' : 'تم إلغاء أرشفة المصدر', 'info');
        loadTaxonomyAndResources();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (res: Resource, permanent: boolean = false) => {
    try {
      const result = await api.deleteResource(res.id, permanent, currentUser.id);
      if (result.success) {
        showToast(result.message, 'success');
        if (inspectingResource?.id === res.id) setInspectingResource(null);
        loadTaxonomyAndResources();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleRestore = async (res: Resource) => {
    try {
      const result = await api.restoreResource(res.id, currentUser.id);
      if (result.success) {
        showToast(result.message, 'success');
        loadTaxonomyAndResources();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleOpenEdit = (res: Resource) => {
    setEditingResource(res);
    setEditTitle(res.title);
    setEditAuthor(res.author || '');
    setEditPublisher(res.publisher || '');
    setEditDescription(res.description || '');
  };

  const handleSaveEdit = async () => {
    if (!editingResource) return;
    try {
      const res = await api.updateResource(editingResource.id, {
        title: editTitle,
        author: editAuthor,
        publisher: editPublisher,
        description: editDescription
      }, currentUser.id);

      if (res.success) {
        showToast('تم حفظ التعديلات بنجاح ومزامنتها في قاعدة البيانات', 'success');
        setEditingResource(null);
        loadTaxonomyAndResources();
      }
    } catch (err: any) {
      showToast(`فشل حفظ التعديلات: ${err.message}`, 'error');
    }
  };

  // Filtered resources
  const filtered = resources.filter(r => {
    if (selectedSubject !== 'all' && r.subjectId !== selectedSubject) return false;
    if (selectedStage !== 'all' && r.stageId !== selectedStage) return false;
    if (selectedGrade !== 'all' && r.gradeId !== selectedGrade) return false;
    if (selectedFormat !== 'all' && r.format !== selectedFormat) return false;
    if (selectedType !== 'all' && r.type !== selectedType) return false;

    // Vision 2040 Priority Filter
    if (selectedVisionPriority !== 'all') {
      const matchVision = (r.vision2040Tags || []).some(t =>
        t.toLowerCase().includes(selectedVisionPriority.toLowerCase())
      );
      if (!matchVision) return false;
    }

    // Quick pills
    if (quickPill === 'vision2040' && (!r.vision2040Tags || r.vision2040Tags.length === 0)) return false;
    if (quickPill === 'ped_all' && r.type !== 'reference' && r.subjectId !== 'sbj-ped-oman' && r.subjectId !== 'sbj-ped-global' && !r.tags.some(t => t.includes('تربوي') || t.includes('مراجع'))) return false;
    if (quickPill === 'ped_oman' && r.subjectId !== 'sbj-ped-oman' && !r.tags.includes('كتب تربوية عمانية')) return false;
    if (quickPill === 'ped_global' && r.subjectId !== 'sbj-ped-global' && !r.tags.includes('مراجع عالمية بالعربية')) return false;
    if (quickPill === 'teacher_guide' && r.type !== 'teacher_guide') return false;
    if (quickPill === 'textbook' && r.type !== 'textbook') return false;
    if (quickPill === 'atlas' && r.type !== 'atlas') return false;
    if (quickPill === 'stage_1' && r.stageId !== 'stg-1') return false;
    if (quickPill === 'stage_2' && r.stageId !== 'stg-2') return false;
    if (quickPill === 'stage_3' && r.stageId !== 'stg-3') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchAuthor = (r.author || '').toLowerCase().includes(q);
      const matchTags = r.tags.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchAuthor && !matchTags) return false;
    }
    return true;
  });

  const currentPage = docPages.find(p => p.pageNumber === selectedPageNum);

  return (
    <div className="space-y-6">
      {/* Top Header & Actions with Owner Spotlight */}
      <div className="p-4 md:p-5 rounded-3xl bg-gradient-to-r from-teal-50 via-emerald-50/50 to-white dark:from-slate-900 dark:via-slate-900/90 dark:to-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 text-right">
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative shrink-0">
            <img
              src="/owner_avatar.jpg"
              alt="الاستاذ علاءالدين ضي النور محمد خليفة"
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover ring-2 ring-teal-600 shadow-md"
              referrerPolicy="no-referrer"
            />
            <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-md bg-teal-600 text-white font-black text-[9px] shadow-sm">
              مالك المنظومة
            </span>
          </div>
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 text-[10px] font-bold border border-teal-300 dark:border-teal-800 mb-1">
              <span>سلطنة عُمان • وزارة التربية والتعليم</span>
              <span>•</span>
              <span>الصفوف 1 - 12</span>
            </div>
            <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white truncate">
              المكتبة الرقمية والمناهج المدرسية وأدلة المعلم
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-teal-700 dark:text-teal-300">
                مالك ومؤسس المكتبة:
              </span>
              <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                الاستاذ علاءالدين ضي النور محمد خليفة
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              الكتب الدراسية المعتمدة، أدلة المعلم، الأطالس والوثائق الرسمية لجميع الصفوف الدراسية في سلطنة عمان
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={openSchoolProfileModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-slate-950 text-xs font-black transition shadow-sm cursor-pointer"
            title="تعديل اسم المدرسة، الأستاذ، المشرف، والمحافظة للتعميم الفوري على جميع الوثائق والخطط"
          >
            <Building2 className="w-4 h-4 text-slate-950" />
            <span>⚙️ إعدادات المدرسة والمعلم والمشرف</span>
          </button>
          <button
            onClick={() => setActiveView('taxonomy')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white text-xs font-black transition shadow-sm cursor-pointer"
          >
            <Layers className="w-4 h-4 text-amber-300" />
            <span>الهيكل الشجري والتحضير الفوري 🌳⚡</span>
          </button>
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>رفع ملفات ومناهج جديدة</span>
          </button>
        </div>
      </div>

      {/* Unified School, Teacher, Supervisor & Governorate Quick Settings Banner */}
      <div className="p-3.5 md:p-4 rounded-2xl bg-gradient-to-r from-teal-50 via-emerald-50 to-sky-50 dark:from-slate-900/90 dark:via-slate-900 dark:to-teal-950/70 border border-teal-200/80 dark:border-teal-800/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <School className="w-5 h-5 text-amber-300" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-slate-900 dark:text-white truncate text-sm">
                🏫 {schoolProfile.schoolName || 'مدرسة كعب بن برشة للتعليم ما بعد الأساسي'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-600/15 text-teal-800 dark:text-teal-200 font-extrabold border border-teal-300/40">
                تعميم فوري نشط ✅
              </span>
            </div>
            <div className="flex items-center gap-2 md:gap-3 text-[11px] text-slate-600 dark:text-slate-300 mt-1 flex-wrap">
              <span>👨‍🏫 <strong>الأستاذ:</strong> {schoolProfile.teacherName || 'أ. علاءالدين ضي النور'}</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span>🧑‍🏫 <strong>المشرف التربوي:</strong> {schoolProfile.supervisorName || 'أ. أحمد بن سالم البلوشي'}</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span>📍 <strong>المحافظة:</strong> {schoolProfile.governorateName ? `محافظة ${schoolProfile.governorateName}` : 'شمال الباطنة'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <button
            onClick={openSchoolProfileModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            title="تعديل اسم المدرسة، المعلم، المشرف، أو المحافظة فوراً"
          >
            <span>✏️ تعديل وتعميم فوري</span>
          </button>
          <button
            onClick={() => setActiveView('settings')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title="الانتقال لصفحة الإعدادات الشاملة"
          >
            <span>الإعدادات الشاملة</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </button>
        </div>
      </div>

      {/* Quick Filter Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        {[
          { id: 'all', label: `كافة المصادر (${resources.length})` },
          { id: 'vision2040', label: `🇴🇲 مواءمة رؤية عُمان 2040 (${resources.filter(r => r.vision2040Tags && r.vision2040Tags.length > 0).length})` },
          { id: 'ped_all', label: `📚 الكتب والمراجع التربوية (${resources.filter(r => r.type === 'reference' || r.subjectId?.includes('ped') || r.tags.some(t => t.includes('تربوي') || t.includes('مراجع'))).length})` },
          { id: 'ped_oman', label: `🇴🇲 مراجع تربوية عُمانية (${resources.filter(r => r.subjectId === 'sbj-ped-oman' || r.tags.includes('كتب تربوية عمانية')).length})` },
          { id: 'ped_global', label: `🌍 مراجع عالمية بالعربية (${resources.filter(r => r.subjectId === 'sbj-ped-global' || r.tags.includes('مراجع عالمية بالعربية')).length})` },
          { id: 'teacher_guide', label: `📘 أدلة المعلم العمانية (${resources.filter(r => r.type === 'teacher_guide').length})` },
          { id: 'textbook', label: `📗 كتب الطالب المعتمدة (${resources.filter(r => r.type === 'textbook').length})` },
          { id: 'stage_1', label: 'الحلقة الأولى (1-4)' },
          { id: 'stage_2', label: 'الحلقة الثانية (5-10)' },
          { id: 'stage_3', label: 'ما بعد الأساسي (11-12)' },
          { id: 'atlas', label: '🗺️ الأطالس والخرائط' },
        ].map((pill) => {
          const isActive = quickPill === pill.id;
          return (
            <button
              key={pill.id}
              onClick={() => {
                setQuickPill(pill.id);
                if (pill.id === 'all') {
                  setSelectedStage('all');
                  setSelectedGrade('all');
                  setSelectedType('all');
                  setSelectedVisionPriority('all');
                }
              }}
              className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer text-xs border ${
                isActive
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
          <div className="relative md:col-span-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالعنوان، الكاتب أو الوسم..."
              className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>

          <div>
            <select
              value={selectedVisionPriority}
              onChange={(e) => setSelectedVisionPriority(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-950 dark:text-emerald-200 font-bold focus:outline-none focus:border-emerald-500"
            >
              <option value="all">🇴🇲 كافة أولويات رؤية 2040</option>
              <option value="مناهج معززة للقيم والمهارات">مناهج معززة للقيم والمهارات</option>
              <option value="كفاءات وطنية">كفاءات وطنية واقتصاد المعرفة</option>
              <option value="البحث العلمي والابتكار">البحث العلمي والابتكار</option>
              <option value="الاستدامة البيئية">الاستدامة البيئية وصون الموارد</option>
              <option value="الهوية الوطنية">الهوية والتراث العماني</option>
              <option value="المواطنة المسؤولة">المواطنة المسؤولة</option>
              <option value="التحول الرقمي">التحول الرقمي والتقنيات</option>
              <option value="حوكمة الأداء">حوكمة الأداء والجودة المدرسية</option>
            </select>
          </div>

          <div>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500"
            >
              <option value="all">كافة المراحل التعليمية</option>
              {stages.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500"
            >
              <option value="all">كافة الصفوف (من 1 إلى 12)</option>
              {grades.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500"
            >
              <option value="all">جميع المواد والمناهج</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500"
            >
              <option value="all">جميع أنواع الوثائق</option>
              <option value="textbook">كتاب طالب معتمد</option>
              <option value="teacher_guide">دليل المعلم واستراتيجيات التدريس</option>
              <option value="atlas">أطلس وخرائط معتمدة</option>
              <option value="reference">الكتب والمراجع التربوية (عمانية وعالمية)</option>
            </select>
          </div>
        </div>

        {/* Toggles for Archived / Trash */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500"
              />
              <span>عرض المصادر المؤرشفة</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showDeleted}
                onChange={(e) => setShowDeleted(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500"
              />
              <span>سلة المهملات</span>
            </label>
          </div>

          <div className="text-slate-400">
            تم العثور على <strong className="text-teal-600 dark:text-teal-400">{filtered.length}</strong> مصدر تعليمي
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-500 mb-2" />
          <span>جارٍ تحميل المصادر الرقمية...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">لم يتم العثور على مصادر تطابق هذا التحديد</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            جرب اختيار مرحلة دراسية أخرى أو إلغاء بعض فلاتر الصفوف أو نوع المستند.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((res) => {
            const subj = subjects.find(s => s.id === res.subjectId);
            const grd = grades.find(g => g.id === res.gradeId);
            const isTG = res.type === 'teacher_guide';
            const isTB = res.type === 'textbook';
            const isAtlas = res.type === 'atlas';
            const isOmanPed = res.subjectId === 'sbj-ped-oman' || res.tags.includes('كتب تربوية عمانية');
            const isGlobalPed = res.subjectId === 'sbj-ped-global' || res.tags.includes('مراجع عالمية بالعربية');

            return (
              <div
                key={res.id}
                className={`group rounded-2xl bg-white dark:bg-slate-900 border transition flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                  res.isDeleted
                    ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20'
                    : res.isArchived
                    ? 'border-slate-300 dark:border-slate-700 bg-slate-50/50'
                    : isOmanPed
                    ? 'border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-500'
                    : isGlobalPed
                    ? 'border-indigo-200 dark:border-indigo-900/60 hover:border-indigo-500'
                    : isTG
                    ? 'border-purple-200 dark:border-purple-900/60 hover:border-purple-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-teal-500'
                }`}
              >
                <div className="p-5 space-y-3">
                  {/* Card top badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 text-[10px] font-extrabold uppercase border border-teal-200 dark:border-teal-800">
                        {res.format}
                      </span>

                      {/* Type badge */}
                      {isOmanPed ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                          <span>🇴🇲 مرجع تربوي عماني</span>
                        </span>
                      ) : isGlobalPed ? (
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold border border-indigo-300 dark:border-indigo-800 flex items-center gap-1">
                          <span>🌍 مرجع عالمي بالعربية</span>
                        </span>
                      ) : isTG ? (
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-extrabold border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" />
                          <span>دليل المعلم</span>
                        </span>
                      ) : isTB ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          <span>كتاب طالب</span>
                        </span>
                      ) : isAtlas ? (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                          <span>🗺️ أطلس خرائط</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-[10px] font-bold border border-teal-200 dark:border-teal-800">
                          مرجع تربوي
                        </span>
                      )}

                      {/* Grade badge */}
                      {grd && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold border border-amber-200 dark:border-amber-800">
                          {grd.name}
                        </span>
                      )}
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      res.processingStatus === 'indexed'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        : res.processingStatus === 'processing'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 animate-pulse'
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                    }`}>
                      {res.processingStatus === 'indexed' ? 'مفهرس وجاهز' : res.processingStatus === 'processing' ? 'قيد الفهرسة' : 'فشل الفهرسة'}
                    </span>
                  </div>

                  {/* Book Cover + Title & Author & Subject Row */}
                  <div className="flex items-start gap-3.5 pt-1">
                    {/* Book Cover Graphic Thumbnail */}
                    <div
                      onClick={() => handleInspect(res.id)}
                      className="relative w-20 h-28 sm:w-22 sm:h-32 shrink-0 rounded-xl overflow-hidden shadow-md ring-1 ring-slate-200 dark:ring-slate-700 bg-slate-100 dark:bg-slate-800 cursor-pointer group/cover"
                      title="انقر لتصفح وقراءة الكتاب"
                    >
                      <img
                        src={res.coverImageUrl || (isTG ? '/covers/cover_om_grd5_tg.svg' : isAtlas ? '/covers/cover_om_atlas.svg' : isOmanPed ? '/covers/cover_ped_om_01.svg' : isGlobalPed ? '/covers/cover_ped_glb_01.svg' : '/covers/cover_om_grd5_tb.svg')}
                        alt={res.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover/cover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/covers/cover_om_grd5_tb.svg';
                        }}
                      />
                      {/* Realistic Spine shadow */}
                      <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/40 via-black/10 to-transparent pointer-events-none" />

                      {/* Hover action to change cover */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setResourceForCoverEdit(res);
                          setCoverModalOpen(true);
                        }}
                        className="absolute inset-0 bg-black/70 opacity-0 group-hover/cover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-black gap-1 p-1 text-center"
                        title="تعديل صورة الغلاف"
                      >
                        <ImageIcon className="w-4 h-4 text-amber-300" />
                        <span>تغيير الغلاف</span>
                      </button>
                    </div>

                    {/* Book Info Column */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <h3
                          onClick={() => handleInspect(res.id)}
                          className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-2 hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer transition leading-snug"
                        >
                          {res.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                          {res.author} {res.publisher ? `• ${res.publisher}` : ''}
                        </p>
                      </div>

                      {/* Subject Tag */}
                      {subj && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 max-w-full truncate">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: subj.color }} />
                          <span className="truncate">{subj.name}</span>
                        </div>
                      )}

                      {/* Oman Vision 2040 Badge */}
                      {res.vision2040Tags && res.vision2040Tags.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap pt-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300">
                            <span>🇴🇲</span>
                            <span>رؤية 2040</span>
                          </span>
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium truncate max-w-[130px]" title={res.vision2040Tags.join(' • ')}>
                            {res.vision2040Tags.find(t => t !== 'رؤية عُمان 2040') || res.vision2040Tags[0]}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{res.pageCount || 1} صفحة</span>
                    <span>{((res.fileSize || 0) / (1024 * 1024)).toFixed(1)} MB</span>
                    <span>{new Date(res.createdAt).toLocaleDateString('ar-SA')}</span>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleInspect(res.id)}
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-teal-600 transition"
                      title="معاينة الصفحات والنصوص"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Change Cover Button */}
                    {currentUser.role !== 'viewer' && (
                      <button
                        onClick={() => {
                          setResourceForCoverEdit(res);
                          setCoverModalOpen(true);
                        }}
                        className="px-2 py-1 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-teal-600 transition flex items-center gap-1 text-[11px] font-bold border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                        title="إضافة أو تعديل صورة الغلاف"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        <span className="hidden sm:inline">الغلاف</span>
                      </button>
                    )}

                    {res.filePath && (
                      <a
                        href={`/api/resources/${res.id}/download`}
                        download
                        className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-teal-600 transition"
                        title="تنزيل الملف الأصلي"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}

                    {currentUser.role !== 'viewer' && (
                      <button
                        onClick={() => handleOpenEdit(res)}
                        className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-teal-600 transition"
                        title="تعديل البيانات الوصفية"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {res.isDeleted ? (
                      <>
                        <button
                          onClick={() => handleRestore(res)}
                          className="px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1 hover:bg-emerald-200 transition"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>استعادة</span>
                        </button>
                        {currentUser.role === 'admin' && (
                          <button
                            onClick={() => handleDelete(res, true)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition"
                            title="حذف نهائي"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        {currentUser.role !== 'viewer' && (
                          <button
                            onClick={() => handleArchive(res)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                            title={res.isArchived ? 'إلغاء الأرشفة' : 'أرشفة المصدر'}
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                        {currentUser.role !== 'viewer' && (
                          <button
                            onClick={() => handleDelete(res, false)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition"
                            title="نقل لسلة المهملات"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Document Reader & Inspector Modal (قارئ المناهج وأدلة المعلم التفاعلي) */}
      {inspectingResource && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 md:p-5 ${isFullscreen ? 'p-0' : ''}`}>
          <div className={`w-full ${isFullscreen ? 'h-full max-h-screen rounded-none' : 'max-w-6xl max-h-[94vh] rounded-3xl'} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden text-right transition-all`}>
            {/* Modal Header */}
            <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/70 dark:bg-slate-950/60 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {/* Book Cover Thumbnail in Reader Header */}
                <div
                  onClick={() => {
                    setResourceForCoverEdit(inspectingResource);
                    setCoverModalOpen(true);
                  }}
                  className="w-12 h-16 rounded-xl overflow-hidden shrink-0 shadow-md ring-2 ring-teal-500/30 bg-slate-100 dark:bg-slate-800 cursor-pointer group/readcover relative"
                  title="انقر لتعديل صورة الغلاف"
                >
                  <img
                    src={inspectingResource.coverImageUrl || '/covers/cover_om_grd5_tb.svg'}
                    alt={inspectingResource.title}
                    className="w-full h-full object-cover group-hover/readcover:scale-105 transition"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/covers/cover_om_grd5_tb.svg';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/readcover:opacity-100 transition flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      inspectingResource.subjectId === 'sbj-ped-oman' || inspectingResource.tags.includes('كتب تربوية عمانية')
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : inspectingResource.subjectId === 'sbj-ped-global' || inspectingResource.tags.includes('مراجع عالمية بالعربية')
                        ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                        : inspectingResource.type === 'teacher_guide'
                        ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                        : inspectingResource.type === 'atlas'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        : 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                    }`}>
                      {inspectingResource.subjectId === 'sbj-ped-oman' || inspectingResource.tags.includes('كتب تربوية عمانية')
                        ? '🇴🇲 مرجع تربوي عُماني معتمد'
                        : inspectingResource.subjectId === 'sbj-ped-global' || inspectingResource.tags.includes('مراجع عالمية بالعربية')
                        ? '🌍 مرجع تربوي عالمي (مترجم بالعربية)'
                        : inspectingResource.type === 'teacher_guide' ? '📘 دليل المعلم المعتمد' : inspectingResource.type === 'atlas' ? '🗺️ الأطلس المدرسي المعتمد' : '📗 كتاب الطالب والأنشطة'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {inspectingResource.subjectId === 'sbj-ped-global' || inspectingResource.tags.includes('مراجع عالمية بالعربية')
                        ? 'المكتبة التربوية العالمية'
                        : 'سلطنة عمان • وثيقة تربوية ومناهج معتمدة'}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                    {inspectingResource.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {inspectingResource.author || 'المديرية العامة لتطوير المناهج'} • {docPages.length} صفحة متاحة • {docChunks.length} مقطع استرجاع
                  </p>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-1.5 shrink-0">
                {currentUser.role !== 'viewer' && (
                  <button
                    onClick={() => {
                      setResourceForCoverEdit(inspectingResource);
                      setCoverModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold transition shadow-xs cursor-pointer"
                    title="تعديل صورة غلاف هذا الكتاب"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>تعديل الغلاف</span>
                  </button>
                )}
                {currentPage && (
                  <button
                    onClick={() => handleCopyPageText(currentPage.content)}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="نسخ نص الصفحة"
                  >
                    {copiedPage ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="طباعة الصفحة المفتوحة"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsFullscreen(prev => !prev)}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title={isFullscreen ? 'تصغير الشاشة' : 'ملء الشاشة'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                {inspectingResource.filePath && (
                  <a
                    href={`/api/resources/${inspectingResource.id}/download`}
                    download
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-bold hover:bg-teal-100 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">تحميل الأصل</span>
                  </a>
                )}
                <button
                  onClick={() => {
                    setInspectingResource(null);
                    setIsFullscreen(false);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Reader Tab Navigation Bar */}
            <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 text-xs shrink-0 overflow-x-auto">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setReaderTab('read')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition ${
                    readerTab === 'read'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>تصفح وقراءة الصفحات</span>
                </button>

                <button
                  onClick={() => setReaderTab('toc')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition ${
                    readerTab === 'toc'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span>فهرس الوحدات والدروس ({docPages.length})</span>
                </button>

                <button
                  onClick={() => setReaderTab('chunks')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition ${
                    readerTab === 'chunks'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>مقاطع الاسترجاع الذكي ({docChunks.length})</span>
                </button>

                <button
                  onClick={() => setReaderTab('actions')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition ${
                    readerTab === 'actions'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>استثمار الدرس في التحضير</span>
                </button>

                <button
                  onClick={() => setReaderTab('vision2040')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition ${
                    readerTab === 'vision2040'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>🇴🇲 مواءمة رؤية 2040</span>
                </button>
              </div>

              {/* Font Size Adjuster (for active reading) */}
              {readerTab === 'read' && (
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
                  <span className="text-[11px] text-slate-400 px-1 font-bold">حجم الخط:</span>
                  <button
                    onClick={() => setReaderFontSize('sm')}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold transition ${
                      readerFontSize === 'sm' ? 'bg-white dark:bg-slate-700 shadow-xs text-teal-600' : 'text-slate-500'
                    }`}
                  >
                    صغير
                  </button>
                  <button
                    onClick={() => setReaderFontSize('base')}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold transition ${
                      readerFontSize === 'base' ? 'bg-white dark:bg-slate-700 shadow-xs text-teal-600' : 'text-slate-500'
                    }`}
                  >
                    متوسط
                  </button>
                  <button
                    onClick={() => setReaderFontSize('lg')}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold transition ${
                      readerFontSize === 'lg' ? 'bg-white dark:bg-slate-700 shadow-xs text-teal-600' : 'text-slate-500'
                    }`}
                  >
                    كبير
                  </button>
                </div>
              )}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Tab 1: Reader Active Page View */}
              {readerTab === 'read' && (
                <div className="flex-1 overflow-hidden flex flex-col">
                  {/* Page Navigation Sub-Bar */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs shrink-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedPageNum(prev => Math.max(1, prev - 1))}
                        disabled={selectedPageNum <= 1}
                        className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 transition shadow-xs"
                        title="الصفحة السابقة"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      {/* Direct Page Selector Dropdown */}
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                        <span>الصفحة</span>
                        <select
                          value={selectedPageNum}
                          onChange={(e) => setSelectedPageNum(Number(e.target.value))}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-teal-700 dark:text-teal-400 focus:outline-hidden"
                        >
                          {docPages.map((p) => (
                            <option key={p.id} value={p.pageNumber}>
                              {p.pageNumber} {p.printedPageNumber ? `(ص ${p.printedPageNumber})` : ''} - {p.chapterOrUnitTitle ? p.chapterOrUnitTitle.substring(0, 35) + '...' : ''}
                            </option>
                          ))}
                        </select>
                        <span className="text-slate-400">من {docPages.length || 1}</span>
                      </div>

                      <button
                        onClick={() => setSelectedPageNum(prev => Math.min(docPages.length, prev + 1))}
                        disabled={selectedPageNum >= docPages.length}
                        className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 transition shadow-xs"
                        title="الصفحة التالية"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {currentPage?.printedPageNumber && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-[11px] border border-amber-200 dark:border-amber-800">
                          رقم الصفحة المطبوعة في الكتاب: ص {currentPage.printedPageNumber}
                        </span>
                      )}

                      {inspectingResource.subjectId === 'sbj-ped-oman' || inspectingResource.tags.includes('كتب تربوية عمانية') ? (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <span>🇴🇲 مرجع تربوي عُماني معتمد</span>
                        </span>
                      ) : inspectingResource.subjectId === 'sbj-ped-global' || inspectingResource.tags.includes('مراجع عالمية بالعربية') ? (
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                          <span>🌍 مرجع تربوي عالمي بالعربية</span>
                        </span>
                      ) : inspectingResource.type === 'teacher_guide' ? (
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>إرشادات وخطوات تنفيذ الدرس للمعلم</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 text-[11px] font-bold border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>كتاب الطالب والأنشطة المعتمد</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Page Content Display Area */}
                  <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-50/30 dark:bg-slate-950/30">
                    {loadingDetails ? (
                      <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
                        <RefreshCw className="w-8 h-8 animate-spin text-teal-600" />
                        <p className="text-sm font-bold">جارٍ تحميل صفحات الكتاب ومحتوياته التربوية...</p>
                      </div>
                    ) : currentPage ? (
                      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
                        {/* Official Header Ribbon */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 text-xs">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${
                              inspectingResource.subjectId === 'sbj-ped-oman'
                                ? 'bg-emerald-500'
                                : inspectingResource.subjectId === 'sbj-ped-global'
                                ? 'bg-indigo-500'
                                : 'bg-teal-500'
                            }`}></span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {inspectingResource.subjectId === 'sbj-ped-global' || inspectingResource.tags.includes('مراجع عالمية بالعربية')
                                ? 'المكتبة التربوية العالمية • مرجع مترجم باللغة العربية'
                                : inspectingResource.subjectId === 'sbj-ped-oman' || inspectingResource.tags.includes('كتب تربوية عمانية')
                                ? 'سلطنة عمان • مرجع تربوي ووثيقة معتمدة'
                                : 'سلطنة عمان • وزارة التربية والتعليم'}
                            </span>
                          </div>
                          <span className="text-slate-400 font-medium">
                            {inspectingResource.title}
                          </span>
                        </div>

                        {/* Chapter / Unit Banner */}
                        {currentPage.chapterOrUnitTitle && (
                          <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 ${
                            inspectingResource.subjectId === 'sbj-ped-oman' || inspectingResource.tags.includes('كتب تربوية عمانية')
                              ? 'bg-gradient-to-r from-emerald-50 to-emerald-100/60 dark:from-emerald-950/40 dark:to-emerald-900/30 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
                              : inspectingResource.subjectId === 'sbj-ped-global' || inspectingResource.tags.includes('مراجع عالمية بالعربية')
                              ? 'bg-gradient-to-r from-indigo-50 to-indigo-100/60 dark:from-indigo-950/40 dark:to-indigo-900/30 border border-indigo-200 dark:border-indigo-800/60 text-indigo-900 dark:text-indigo-200'
                              : inspectingResource.type === 'teacher_guide'
                              ? 'bg-gradient-to-r from-indigo-50 to-indigo-100/60 dark:from-indigo-950/40 dark:to-indigo-900/30 border border-indigo-200 dark:border-indigo-800/60 text-indigo-900 dark:text-indigo-200'
                              : 'bg-gradient-to-r from-teal-50 to-teal-100/60 dark:from-teal-950/40 dark:to-teal-900/30 border border-teal-200 dark:border-teal-800/60 text-teal-900 dark:text-teal-200'
                          }`}>
                            <div className="flex items-center gap-2.5 font-extrabold text-sm md:text-base">
                              <BookOpen className="w-5 h-5 shrink-0" />
                              <span>{currentPage.chapterOrUnitTitle}</span>
                            </div>
                            <span className="px-2.5 py-1 rounded-xl bg-white/80 dark:bg-slate-800/80 text-xs font-bold shadow-xs shrink-0">
                              صفحة {currentPage.printedPageNumber || currentPage.pageNumber}
                            </span>
                          </div>
                        )}

                        {/* Text Content */}
                        <div className={`leading-relaxed text-slate-800 dark:text-slate-100 whitespace-pre-wrap select-text font-normal space-y-3 ${
                          readerFontSize === 'sm' ? 'text-xs' : readerFontSize === 'lg' ? 'text-base md:text-lg' : 'text-sm md:text-base'
                        }`}>
                          {currentPage.content}
                        </div>

                        {currentPage.isOcr && (
                          <div className="mt-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs border border-amber-200 dark:border-amber-900/50 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>تمت معالجة نص هذه الصفحة عبر تقنية التعرف الضوئي (OCR) بدرجة دقة {Math.round((currentPage.confidence || 0.85) * 100)}%.</span>
                          </div>
                        )}

                        {/* Page Bottom Quick Action Footer */}
                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="text-slate-400">
                            الصفحة رقم {currentPage.pageNumber} من أصل {docPages.length} صفحة في هذا المنهج
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setInspectingResource(null);
                                setActiveView('lesson_studio');
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition flex items-center gap-1.5 shadow-xs"
                            >
                              <GraduationCap className="w-3.5 h-3.5" />
                              <span>تحضير هذا الدرس</span>
                            </button>
                            <button
                              onClick={() => {
                                setInspectingResource(null);
                                setActiveView('worksheets');
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition flex items-center gap-1.5"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>إنشاء ورقة عمل</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-md mx-auto text-center py-16 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                        <div className="w-16 h-16 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto">
                          <BookOpen className="w-8 h-8" />
                        </div>
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                          استخراج صفحات ومحتوى المنهج المعتمد
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          اضغط على الزر أدناه لتوليد وتجهيز فهرس وصفحات هذا الكتاب أو دليل المعلم بكامل نصوصها وتطبيقاتها التربوية المعتمدة في سلطنة عمان.
                        </p>
                        <button
                          onClick={() => handleGeneratePages(inspectingResource.id)}
                          disabled={generatingPages}
                          className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                        >
                          {generatingPages ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>جارٍ الفهرسة واستخراج الصفحات...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              <span>استخراج وتوليد محتوى الكتاب كاملاً</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Table of Contents (فهرس الكتاب والوحدات) */}
              {readerTab === 'toc' && (
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50 dark:bg-slate-950/30">
                  <div className="max-w-4xl mx-auto space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                      <div>
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <List className="w-5 h-5 text-teal-600" />
                          <span>فهرس موضوعات ووحدات الكتاب</span>
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          انقر على أي درس أو صفحة للانتقال الفوري وقراءتها في المتصفح.
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold text-xs">
                        {docPages.length} موضوع وصفحة
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {docPages.map((page, idx) => (
                        <div
                          key={page.id}
                          onClick={() => {
                            setSelectedPageNum(page.pageNumber);
                            setReaderTab('read');
                          }}
                          className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between gap-3 ${
                            selectedPageNum === page.pageNumber
                              ? 'bg-teal-50/90 dark:bg-teal-950/70 border-teal-400 dark:border-teal-700 shadow-sm'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-300 hover:shadow-xs'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[11px]">
                                صفحة {page.printedPageNumber || page.pageNumber}
                              </span>
                              <span className="text-[11px] text-teal-600 dark:text-teal-400 font-bold flex items-center gap-1">
                                <span>قراءة الصفحة</span>
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </span>
                            </div>
                            <h5 className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-2">
                              {page.chapterOrUnitTitle || `الصفحة رقم ${page.pageNumber}`}
                            </h5>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                              {page.content.substring(0, 180)}...
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: RAG Chunks (مقاطع الاسترجاع الدلالي) */}
              {readerTab === 'chunks' && (
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50 dark:bg-slate-950/30">
                  <div className="max-w-4xl mx-auto space-y-4">
                    <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800/60 text-teal-900 dark:text-teal-200 text-xs leading-relaxed flex items-center gap-3">
                      <Sparkles className="w-6 h-6 shrink-0 text-teal-600" />
                      <div>
                        <span className="font-bold">المقاطع المفهرسة لمنظومة الاسترجاع الدلالي (RAG):</span> هذه المقاطع مقسمة بدقة ومربوطة بأرقام الصفحات الصريحة لتمكين المساعد التربوي الذكي واستوديوهات التحضير من استحضار أدق تفاصيل المنهاج العماني ومراجعته.
                      </div>
                    </div>

                    <div className="space-y-3">
                      {docChunks.map((chunk, idx) => (
                        <div
                          key={chunk.id}
                          onClick={() => {
                            setSelectedPageNum(chunk.pageNumber);
                            setReaderTab('read');
                          }}
                          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-300 transition cursor-pointer space-y-2 shadow-xs"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-extrabold text-teal-700 dark:text-teal-400">
                              {chunk.heading || `المقطع رقم ${idx + 1}`}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-[11px] font-bold">
                              صفحة {chunk.printedPageNumber || chunk.pageNumber} • {chunk.charLength} حرف
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                            {chunk.content}
                          </p>
                          {chunk.keywords && chunk.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {chunk.keywords.map((kw, i) => (
                                <span key={i} className="text-[10px] px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold border border-teal-100 dark:border-teal-900/40">
                                  #{kw}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Investment / Actions (استثمار المحتوى) */}
              {readerTab === 'actions' && (
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50 dark:bg-slate-950/30">
                  <div className="max-w-4xl mx-auto space-y-6">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-teal-600" />
                        <span>استثمار وتوظيف محتوى المنهاج العماني في المنصة</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        يمكنك نقل أهداف ومفاهيم هذا الكتاب أو دليل المعلم مباشرة إلى استوديوهات التحضير والتقويم بخطوة واحدة:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        onClick={() => {
                          setInspectingResource(null);
                          setActiveView('lesson_studio');
                        }}
                        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-400 hover:shadow-md transition cursor-pointer space-y-3"
                      >
                        <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center font-bold">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <h5 className="text-sm font-extrabold text-slate-900 dark:text-white">
                          تحضير درس نموذجي في استوديو الدروس
                        </h5>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          استيراد نواتج التعلم وتوليد خطة درس نموذجية بالاستراتيجيات العمانية المعتمدة والأنشطة التفاعلية.
                        </p>
                        <div className="text-xs font-bold text-teal-600 flex items-center gap-1">
                          <span>فتح استوديو التحضير</span>
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div
                        onClick={() => {
                          setInspectingResource(null);
                          setActiveView('worksheets');
                        }}
                        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-400 hover:shadow-md transition cursor-pointer space-y-3"
                      >
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold">
                          <FileText className="w-5 h-5" />
                        </div>
                        <h5 className="text-sm font-extrabold text-slate-900 dark:text-white">
                          إنشاء أوراق عمل وأنشطة صفية
                        </h5>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          صياغة أوراق عمل مطابقة لأسئلة الكتاب المدرسي وتفكير ناقد وتطبيقات خرائط صماء جاهزة للطباعة.
                        </p>
                        <div className="text-xs font-bold text-blue-600 flex items-center gap-1">
                          <span>فتح استوديو أوراق العمل</span>
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div
                        onClick={() => {
                          setInspectingResource(null);
                          setActiveView('annual_plans');
                        }}
                        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-400 hover:shadow-md transition cursor-pointer space-y-3"
                      >
                        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold">
                          <Bookmark className="w-5 h-5" />
                        </div>
                        <h5 className="text-sm font-extrabold text-slate-900 dark:text-white">
                          إدراج في الخطة السنوية والفصلية
                        </h5>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          مزامنة وحدات ودروس هذا المنهج مع توزيع الأسابيع الدراسية المعتمد في سلطنة عمان للعام 2024/2025.
                        </p>
                        <div className="text-xs font-bold text-purple-600 flex items-center gap-1">
                          <span>فتح الخطط السنوية</span>
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div
                        onClick={() => {
                          setInspectingResource(null);
                          setActiveView('assistant');
                        }}
                        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-400 hover:shadow-md transition cursor-pointer space-y-3"
                      >
                        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <h5 className="text-sm font-extrabold text-slate-900 dark:text-white">
                          اسأل المساعد التربوي الذكي
                        </h5>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          حوار تفاعلي حول هذا الكتاب ودليل المعلم للإجابة عن التساؤلات وطرح أفكار إبداعية في التدريس.
                        </p>
                        <div className="text-xs font-bold text-amber-600 flex items-center gap-1">
                          <span>بدء محادثة ذكية</span>
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Oman Vision 2040 Alignment Showcase & Tag Manager */}
              {readerTab === 'vision2040' && (
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50 dark:bg-slate-950/30">
                  <div className="max-w-4xl mx-auto space-y-6">
                    {/* Header Banner */}
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-950 text-white shadow-md space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white font-bold text-xs backdrop-blur-xs">
                        <span>🇴🇲 سلطنة عُمان</span>
                        <span>•</span>
                        <span>رؤية عُمان 2040</span>
                        <span>•</span>
                        <span>أولوية التعليم والتعلم والقدرات الوطنية</span>
                      </div>
                      <h4 className="text-xl font-black">
                        مواءمة هذا المرجع مع أولويات ومستهدفات رؤية عُمان 2040
                      </h4>
                      <p className="text-xs text-emerald-100 leading-relaxed max-w-2xl">
                        يرتبط هذا المنهج/المرجع ارتباطاً استراتيجياً بمحاور تنمية القدرات الوطنية العمانية، إكساب الطلبة مهارات اقتصاد المعرفة، الاستدامة البيئية، وترسيخ الهوية الوطنية العمانية الأصيلة.
                      </p>
                    </div>

                    {/* Active Vision 2040 Tags for this Resource */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h5 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <Award className="w-4 h-4 text-emerald-600" />
                            <span>المحاور والأولويات الوطنية المربوطة بهذا المرجع:</span>
                          </h5>
                          <p className="text-xs text-slate-500 mt-0.5">
                            الوسوم والسمات المعتمدة التي تصنف هذا المرجع ضمن أولويات الرؤية الوطنية
                          </p>
                        </div>
                        {currentUser.role !== 'viewer' && (
                          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                            يمكنك تعديل الوسوم أدناه
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {(inspectingResource.vision2040Tags || ['رؤية عُمان 2040', 'مناهج معززة للقيم والمهارات']).map((tag, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold shadow-2xs"
                          >
                            <span>🎯</span>
                            <span>{tag}</span>
                            {currentUser.role !== 'viewer' && (
                              <button
                                type="button"
                                onClick={async () => {
                                  const updatedTags = (inspectingResource.vision2040Tags || []).filter(t => t !== tag);
                                  const res = await api.updateResourceVision2040(inspectingResource.id, updatedTags, currentUser.id);
                                  if (res.success) {
                                    setInspectingResource(res.resource);
                                    setResources(prev => prev.map(r => r.id === res.resource.id ? res.resource : r));
                                    showToast('تم تحديث وسوم رؤية عُمان 2040', 'info');
                                  }
                                }}
                                className="text-emerald-700 dark:text-emerald-400 hover:text-rose-600 transition"
                                title="إزالة هذا الوسم"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Quick Add Preset Vision 2040 Tags */}
                      {currentUser.role !== 'viewer' && (
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                            إضافة أولوية / وسم وطني جديد من قائمة رؤية عُمان 2040:
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              'رؤية عُمان 2040',
                              'مناهج معززة للقيم والمهارات',
                              'كفاءات وطنية منافسة',
                              'الهوية الوطنية والتراث العماني',
                              'المواطنة المسؤولة',
                              'الاستدامة البيئية وصون الموارد',
                              'اقتصاد المعرفة والتنويع',
                              'مهارات المستقبل والابتكار',
                              'التحول الرقمي والتقنيات الذكية',
                              'حوكمة الأداء والجودة المدرسية'
                            ].filter(t => !(inspectingResource.vision2040Tags || []).includes(t)).map((presetTag, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={async () => {
                                  const updatedTags = Array.from(new Set([...(inspectingResource.vision2040Tags || []), presetTag]));
                                  const res = await api.updateResourceVision2040(inspectingResource.id, updatedTags, currentUser.id);
                                  if (res.success) {
                                    setInspectingResource(res.resource);
                                    setResources(prev => prev.map(r => r.id === res.resource.id ? res.resource : r));
                                    showToast(`تم ربط المرجع بأولوية "${presetTag}" بنجاح!`, 'success');
                                  }
                                }}
                                className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold border border-slate-200 dark:border-slate-700 transition flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>{presetTag}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Educational Dimensions Guide Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-extrabold text-sm">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>كفايات ومهارات المستقبل المستهدفة:</span>
                        </div>
                        <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
                          <li>التفكير التحليلي والناقد والاستقصاء العلمي للمعلومات.</li>
                          <li>التحليل الجغرافي واستخدام نظم المعلومات الجغرافية والخرائط الرقمية.</li>
                          <li>المواطنة الإيجابية والاعتزاز بالتراث والريادة الحضارية العمانية.</li>
                          <li>الوعي بالاستدامة وحماية الموارد المائية والبيئية في السلطنة.</li>
                        </ul>
                      </div>

                      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-extrabold text-sm">
                          <GraduationCap className="w-4 h-4" />
                          <span>التطبيق الصفي في استوديو إعداد الدروس:</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          عند استخدام هذا المرجع في استوديو الدروس، يقوم الذكاء الاصطناعي بربط الخطة التدريسية تلقائياً بأولويات رؤية 2040 مع تحديد دور المعلم والطالب واستراتيجيات التدريس المتوافقة.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setInspectingResource(null);
                            setActiveView('lesson_studio');
                          }}
                          className="mt-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <span>الانتقال لإعداد درس بهذا المرجع الآن</span>
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Metadata Modal */}
      {editingResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-right space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">تعديل بيانات المصدر</h3>
              <button onClick={() => setEditingResource(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">عنوان المصدر</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">المؤلف / الجهة المعدة</label>
                <input
                  type="text"
                  value={editAuthor}
                  onChange={(e) => setEditAuthor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الناشر / المركز</label>
                <input
                  type="text"
                  value={editPublisher}
                  onChange={(e) => setEditPublisher(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الوصف والملاحظات التربوية</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Cover Image Quick Action in Edit Modal */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src={editingResource.coverImageUrl || '/covers/cover_om_grd5_tb.svg'}
                    alt={editingResource.title}
                    className="w-10 h-14 object-cover rounded-md shadow-xs ring-1 ring-slate-300 dark:ring-slate-600"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/covers/cover_om_grd5_tb.svg';
                    }}
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">صورة غلاف الكتاب</span>
                    <span className="text-[10px] text-slate-400">يمكنك رفع صورة جديدة أو اختيار من المعرض</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const target = editingResource;
                    setEditingResource(null);
                    setResourceForCoverEdit(target);
                    setCoverModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>تعديل صورة الغلاف</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setEditingResource(null)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-sm"
              >
                حفظ التعديلات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Book Cover Modal */}
      <EditBookCoverModal
        isOpen={coverModalOpen}
        onClose={() => {
          setCoverModalOpen(false);
          setResourceForCoverEdit(null);
        }}
        resource={resourceForCoverEdit}
        onSuccess={() => {
          loadTaxonomyAndResources();
        }}
      />
    </div>
  );
};
