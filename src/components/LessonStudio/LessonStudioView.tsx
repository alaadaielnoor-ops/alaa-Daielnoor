import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { GeneratedLesson, Subject, Grade, Unit, EducationalStage, OmanVision2040Goal } from '../../types/index.ts';
import { exportUnifiedPdf, exportElementToPdf, generatePdfBlob } from '../../utils/pdfExport.ts';
import {
  GraduationCap, Plus, Sparkles, Printer, Download,
  Save, Trash2, Edit3, CheckCircle2, BookOpen, Clock,
  Layers, ChevronRight, X, ArrowRight, Search, Copy, Check,
  AlertTriangle, RefreshCw, FileText, ShieldCheck, Award,
  Send, Share2, ExternalLink, Eye, School, MessageSquare, Brain, Target, Users, Zap
} from 'lucide-react';
import { PedagogicalPlanningAssistantModal } from './PedagogicalPlanningAssistantModal.tsx';
import { TextbookCurriculumIndex } from '../Curriculum/TextbookCurriculumIndex.tsx';

export const LessonStudioView: React.FC = () => {
  const { currentUser, showToast } = useApp();

  const [lessons, setLessons] = useState<GeneratedLesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<GeneratedLesson | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [copied, setCopied] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Lesson Printable Sheet Ref & PDF Export
  const lessonSheetRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // WhatsApp Share Modal & PDF State
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [recipientPhone, setRecipientPhone] = useState(
    () => localStorage.getItem('om_edu_wa_recipient_phone') || '+96877394680'
  );
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
  const [isPreparingPdf, setIsPreparingPdf] = useState(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);

  // Edit Header Modal State
  const [editHeaderModalOpen, setEditHeaderModalOpen] = useState(false);
  const [savingHeader, setSavingHeader] = useState(false);
  const [headerForm, setHeaderForm] = useState({
    title: '',
    schoolName: '',
    directorateName: '',
    teacherName: '',
    supervisorName: '',
    academicYear: '',
    semesterName: '',
    dateStr: '',
    sectionName: '',
    subjectName: '',
    gradeName: '',
    stageName: '',
    unitTitle: '',
    lessonTitle: '',
    durationMinutes: 45,
    cascadeToProfile: true
  });

  // Vision 2040 Goals State
  const [availableVisionGoals, setAvailableVisionGoals] = useState<OmanVision2040Goal[]>([]);
  const [selectedGenVisionGoals, setSelectedGenVisionGoals] = useState<string[]>([]);
  const [editVisionModalOpen, setEditVisionModalOpen] = useState(false);
  const [editingVisionGoals, setEditingVisionGoals] = useState<Array<{ code: string; goalTitle: string; applicationInLesson: string }>>([]);
  const [isSavingVision, setIsSavingVision] = useState(false);

  // Taxonomy for generation
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [stages, setStages] = useState<EducationalStage[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  // Generator form
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genSubject, setGenSubject] = useState('');
  const [genStage, setGenStage] = useState('');
  const [genGrade, setGenGrade] = useState('');
  const [genUnit, setGenUnit] = useState('');
  const [genLessonTitle, setGenLessonTitle] = useState('');
  const [genStrategy, setGenStrategy] = useState('الاستقصاء الجغرافي والتعلم التعاوني');
  const [genTheory, setGenTheory] = useState('النظرية البنائية (Constructivism)');
  const [genDuration, setGenDuration] = useState(45);

  // Pedagogical Planning Assistant Modal State
  const [showPedagogicalAssistant, setShowPedagogicalAssistant] = useState(false);
  const [pedagogicalAssistantTab, setPedagogicalAssistantTab] = useState<'templates' | 'think-pair-share' | 'vision2040' | 'guide'>('templates');

  // Textbook Curriculum Index Modal State
  const [showTextbookIndexModal, setShowTextbookIndexModal] = useState(false);

  const normalizeLesson = (lsn: any): GeneratedLesson => {
    if (!lsn) return lsn;

    // Normalize procedures from timeline if needed
    let procedures = lsn.procedures;
    if ((!procedures || procedures.length === 0) && lsn.timeline && Array.isArray(lsn.timeline)) {
      procedures = lsn.timeline.map((t: any, idx: number) => ({
        stepNumber: t.stepNumber || idx + 1,
        title: t.phase || t.title || `الخطوة ${idx + 1}`,
        durationMinutes: t.durationMinutes || 10,
        teacherActivity: t.teacherActivity || '',
        studentActivity: t.studentActivity || '',
        strategy: t.strategy || 'الاستقصاء والمناقشة'
      }));
    }

    // Normalize objectives
    let objectives = lsn.objectives;
    if (Array.isArray(objectives)) {
      objectives = {
        cognitive: objectives,
        affective: [],
        psychomotor: []
      };
    } else if (!objectives || typeof objectives !== 'object') {
      objectives = {
        cognitive: ['أن يكتسب الطالب المفاهيم الأساسية للدرس بدقة.'],
        affective: ['أن يقدر الطالب القيمة الوطنية والمعرفية لموضوع الدرس.'],
        psychomotor: ['أن يطبق الطالب الأنشطة العملية والتطبيقات الخرائطية.']
      };
    } else {
      objectives = {
        cognitive: Array.isArray(objectives.cognitive) ? objectives.cognitive : [],
        affective: Array.isArray(objectives.affective) ? objectives.affective : [],
        psychomotor: Array.isArray(objectives.psychomotor) ? objectives.psychomotor : []
      };
    }

    // Normalize conceptsAndTerms
    let conceptsAndTerms = lsn.conceptsAndTerms;
    if (!conceptsAndTerms && Array.isArray(lsn.concepts)) {
      conceptsAndTerms = lsn.concepts.map((c: string) => ({ term: c, definition: '' }));
    } else if (!Array.isArray(conceptsAndTerms)) {
      conceptsAndTerms = [];
    }

    // Normalize differentiation
    let differentiation = lsn.differentiation;
    if (!differentiation || typeof differentiation !== 'object') {
      differentiation = { supportLevel: [], enrichmentLevel: [] };
    } else {
      differentiation = {
        supportLevel: Array.isArray(differentiation.supportLevel) ? differentiation.supportLevel : [],
        enrichmentLevel: Array.isArray(differentiation.enrichmentLevel) ? differentiation.enrichmentLevel : []
      };
    }

    return {
      ...lsn,
      procedures: procedures || [],
      objectives,
      conceptsAndTerms,
      differentiation,
      referencedSources: Array.isArray(lsn.referencedSources) ? lsn.referencedSources : [],
      toolsAndResources: Array.isArray(lsn.toolsAndResources)
        ? lsn.toolsAndResources
        : Array.isArray(lsn.materials)
        ? lsn.materials
        : [],
      prerequisites: Array.isArray(lsn.prerequisites) ? lsn.prerequisites : [],
      assessmentMethods: {
        formative: Array.isArray(lsn.assessmentMethods?.formative) ? lsn.assessmentMethods.formative : [],
        summative: Array.isArray(lsn.assessmentMethods?.summative) ? lsn.assessmentMethods.summative : []
      },
      hook: lsn.hook || 'مناقشة استطلاعية وعصف ذهني لربط موضوع الدرس بالبيئة العمانية الواقعية.',
      homework: lsn.homework || 'حل أنشطة التقويم الختامي في دفتر الطالب.',
      vision2040Goals: Array.isArray(lsn.vision2040Goals) ? lsn.vision2040Goals : []
    };
  };

  const loadLessonsAndTaxonomy = async () => {
    setLoading(true);
    try {
      const [lesRes, taxRes, visRes] = await Promise.all([
        api.getLessons(),
        api.getTaxonomy(),
        api.getVision2040Goals()
      ]);

      if (visRes.success && visRes.goals) {
        setAvailableVisionGoals(visRes.goals);
      }

      if (lesRes.success && lesRes.lessons) {
        const normalized = lesRes.lessons.map(normalizeLesson);
        setLessons(normalized);
        if (normalized.length > 0) {
          setSelectedLesson(normalized[0]);
        }
      }

      if (taxRes.success && taxRes.taxonomy) {
        setSubjects(taxRes.taxonomy.subjects || []);
        setStages(taxRes.taxonomy.stages || []);
        setGrades(taxRes.taxonomy.grades || []);
        setUnits(taxRes.taxonomy.units || []);

        if (taxRes.taxonomy.subjects?.length > 0) setGenSubject(taxRes.taxonomy.subjects[0].name);
        if (taxRes.taxonomy.stages?.length > 0) setGenStage(taxRes.taxonomy.stages[0].name);
        if (taxRes.taxonomy.grades?.length > 0) setGenGrade(taxRes.taxonomy.grades[0].name);
        if (taxRes.taxonomy.units?.length > 0) setGenUnit(taxRes.taxonomy.units[0].title);
      }
    } catch (e: any) {
      console.warn('Error loading lessons:', e);
      showToast('تعذر تحميل الدروس: ' + (e.message || 'خطأ في الشبكة'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLessonsAndTaxonomy();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genLessonTitle.trim()) {
      showToast('يرجى كتابة عنوان الدرس', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await api.generateLesson({
        subjectName: genSubject,
        stageName: genStage,
        gradeName: genGrade,
        unitTitle: genUnit,
        lessonTitle: genLessonTitle,
        durationMinutes: genDuration,
        teachingStrategy: genStrategy,
        pedagogicalTheory: genTheory,
        userId: currentUser.id
      });

      if (res.success && res.lesson) {
        let norm = normalizeLesson(res.lesson);

        // If specific vision goals were selected by teacher, apply them
        if (selectedGenVisionGoals.length > 0 && availableVisionGoals.length > 0) {
          const customGoals = selectedGenVisionGoals.map(code => {
            const g = availableVisionGoals.find(item => item.code === code);
            return {
              code,
              goalTitle: g?.title || 'أولوية تعليمية في رؤية عمان 2040',
              applicationInLesson: `تطبيق مخرجات الهدف (${g?.title || code}) من خلال الأنشطة الصفية والاستقصاء في درس (${norm.lessonTitle}).`
            };
          });
          norm.vision2040Goals = customGoals;
          await api.updateLessonVision2040(norm.id, customGoals, currentUser.id);
        }

        setLessons(prev => [norm, ...prev]);
        setSelectedLesson(norm);
        setShowGenerateModal(false);
        setGenLessonTitle('');
        setSelectedGenVisionGoals([]);
        showToast(`تم توليد خطة درس "${norm.title}" وتوثيقها برؤية عُمان 2040 بنجاح!`, 'success');
      }
    } catch (err: any) {
      showToast(`فشل توليد الدرس: ${err.message}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenEditVision = () => {
    if (!selectedLesson) return;
    setEditingVisionGoals(
      selectedLesson.vision2040Goals && selectedLesson.vision2040Goals.length > 0
        ? [...selectedLesson.vision2040Goals]
        : []
    );
    setEditVisionModalOpen(true);
  };

  const handleSaveVisionGoals = async () => {
    if (!selectedLesson) return;
    setIsSavingVision(true);
    try {
      const res = await api.updateLessonVision2040(selectedLesson.id, editingVisionGoals, currentUser.id);
      if (res.success && res.lesson) {
        const norm = normalizeLesson(res.lesson);
        setSelectedLesson(norm);
        setLessons(prev => prev.map(l => l.id === norm.id ? norm : l));
        setEditVisionModalOpen(false);
        showToast('تم تحديث مواءمة رؤية عُمان 2040 للدرس بنجاح!', 'success');
      }
    } catch (err: any) {
      showToast(`تعذر حفظ أهداف الرؤية: ${err.message}`, 'error');
    } finally {
      setIsSavingVision(false);
    }
  };

  const handleAutoSuggestVisionGoals = () => {
    if (!selectedLesson || availableVisionGoals.length === 0) return;
    const combined = `${selectedLesson.lessonTitle} ${selectedLesson.unitTitle} ${selectedLesson.subjectName}`.toLowerCase();
    const suggested: Array<{ code: string; goalTitle: string; applicationInLesson: string }> = [];

    // Core Education Goal V2040-EDU-01
    const gEdu = availableVisionGoals.find(g => g.code === 'V2040-EDU-01');
    if (gEdu) {
      suggested.push({
        code: gEdu.code,
        goalTitle: gEdu.title,
        applicationInLesson: `إكساب الطلبة مهارات التفكير الناقد والتحليلي والتفكير الجغرافي والاعتزاز بالهوية الوطنية العمانية من خلال أنشطة درس (${selectedLesson.lessonTitle}).`
      });
    }

    // Technology / Maps
    if (combined.includes('خريط') || combined.includes('أطلس') || combined.includes('تقني') || combined.includes('gis') || combined.includes('رقمي') || combined.includes('بيانات')) {
      const gTech = availableVisionGoals.find(g => g.code === 'V2040-TECH-01');
      if (gTech) {
        suggested.push({
          code: gTech.code,
          goalTitle: gTech.title,
          applicationInLesson: `توظيف تقنيات الخرائط الرقمية ونظم المعلومات الجغرافية والاستشعار في تنفيذ أنشطة درس (${selectedLesson.lessonTitle}) وتنمية المهارات الرقمية.`
        });
      }
    }

    // Environment
    if (combined.includes('بيئ') || combined.includes('ماء') || combined.includes('فلج') || combined.includes('مناخ') || combined.includes('استدامة') || combined.includes('سواحل')) {
      const gEnv = availableVisionGoals.find(g => g.code === 'V2040-ENV-01');
      if (gEnv) {
        suggested.push({
          code: gEnv.code,
          goalTitle: gEnv.title,
          applicationInLesson: `تطبيق مبادئ الاستدامة البيئية وصون الموارد العمانية عبر مناقشة موضوع (${selectedLesson.lessonTitle}) وتوعية الطلاب بأهمية المحافظة على البيئة والتنوع الطبيعي.`
        });
      }
    }

    // Economy
    if (combined.includes('اقتصاد') || combined.includes('ميناء') || combined.includes('دقم') || combined.includes('تجارة') || combined.includes('تنمي') || combined.includes('صحار')) {
      const gEcon = availableVisionGoals.find(g => g.code === 'V2040-EDU-02');
      if (gEcon) {
        suggested.push({
          code: gEcon.code,
          goalTitle: gEcon.title,
          applicationInLesson: `مواءمة الدرس مع متطلبات اقتصاد المعرفة من خلال ربط موضوع (${selectedLesson.lessonTitle}) بمشاريع رؤية عمان 2040 والتنويع الاقتصادي والتحليل المكاني.`
        });
      }
    }

    // Citizenship / National Identity
    if (combined.includes('عمان') || combined.includes('وطن') || combined.includes('تاريخ') || combined.includes('هوية') || combined.includes('حضار') || combined.includes('نهضة')) {
      const gCit = availableVisionGoals.find(g => g.code === 'V2040-CIT-01');
      if (gCit && !suggested.some(s => s.code === gCit.code)) {
        suggested.push({
          code: gCit.code,
          goalTitle: gCit.title,
          applicationInLesson: `غرس قيم المواطنة والاعتزاز بالريادة التاريخية العمانية عبر استقراء المنجزات الوطنية وموقع عمان الاستراتيجي في سياق درس (${selectedLesson.lessonTitle}).`
        });
      }
    }

    if (suggested.length < 2) {
      const gRes = availableVisionGoals.find(g => g.code === 'V2040-EDU-03');
      if (gRes) {
        suggested.push({
          code: gRes.code,
          goalTitle: gRes.title,
          applicationInLesson: `تحفيز مهارات البحث والاستقصاء العلمي لدى الطلبة باستخدام أدوات المكتبة الرقمية والأطالس المعتمدة في دراسة (${selectedLesson.lessonTitle}).`
        });
      }
    }

    setEditingVisionGoals(suggested.slice(0, 3));
    showToast('تم الاقتراح الذكي لأهداف رؤية عُمان 2040 بناءً على محتوى الدرس', 'info');
  };

  const handleSaveLesson = async () => {
    if (!selectedLesson) return;
    try {
      const res = await api.saveLesson(selectedLesson);
      if (res.success) {
        const norm = normalizeLesson(res.lesson);
        setIsEditing(false);
        showToast('تم حفظ خطة الدرس بنجاح', 'success');
        setLessons(prev => prev.map(l => l.id === norm.id ? norm : l));
        setSelectedLesson(norm);
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteLesson = async (id: string) => {
    try {
      await api.deleteLesson(id);
      const remaining = lessons.filter(l => l.id !== id);
      setLessons(remaining);
      setSelectedLesson(remaining.length > 0 ? remaining[0] : null);
      setDeleteConfirmId(null);
      showToast('تم حذف الخطة الدراسية بنجاح', 'info');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleApplyConstructivistTemplate = async (templateData: Partial<GeneratedLesson>) => {
    if (!selectedLesson) return;
    const updated: GeneratedLesson = {
      ...selectedLesson,
      ...templateData,
      updatedAt: new Date().toISOString()
    };
    setSelectedLesson(updated);
    setLessons(prev => prev.map(l => l.id === updated.id ? updated : l));
    try {
      await api.saveLesson(updated);
      showToast('تم تطبيق القالب البنائي وتحديث مواءمة رؤية 2040 بنجاح!', 'success');
    } catch (err: any) {
      showToast('تم تطبيق القالب محلياً على خطة الدرس الحالية', 'info');
    }
  };

  const handleCreateNewLessonFromTemplate = async (newLesson: GeneratedLesson) => {
    try {
      const res = await api.saveLesson(newLesson);
      const saved = res.lesson ? normalizeLesson(res.lesson) : newLesson;
      setLessons(prev => [saved, ...prev]);
      setSelectedLesson(saved);
      showToast(`تم إنشاء وحفظ درس "${saved.title}" وفق النظرية البنائية بنجاح!`, 'success');
    } catch (err: any) {
      setLessons(prev => [newLesson, ...prev]);
      setSelectedLesson(newLesson);
      showToast(`تم إنشاء الخطة النموذجية محلياً: ${err.message}`, 'info');
    }
  };

  const handleInsertTpsProcedure = async (procedure: {
    stepNumber: number;
    title: string;
    durationMinutes: number;
    teacherActivity: string;
    studentActivity: string;
    strategy: string;
  }) => {
    if (!selectedLesson) {
      showToast('يرجى تحديد درس لإدراج النشاط فيه', 'error');
      return;
    }
    const currentProcedures = selectedLesson.procedures || [];
    const newProcedures = [
      ...currentProcedures,
      {
        ...procedure,
        stepNumber: currentProcedures.length + 1
      }
    ];
    const updated: GeneratedLesson = {
      ...selectedLesson,
      procedures: newProcedures,
      durationMinutes: (selectedLesson.durationMinutes || 45) + procedure.durationMinutes,
      updatedAt: new Date().toISOString()
    };
    setSelectedLesson(updated);
    setLessons(prev => prev.map(l => l.id === updated.id ? updated : l));
    try {
      await api.saveLesson(updated);
      showToast('تم إدراج نشاط "فكر - زاوج - شارك" في سير الدرس بنجاح!', 'success');
    } catch (err: any) {
      showToast('تمت إضافة النشاط في الخطة المعروضة', 'info');
    }
  };

  const generateLessonHtml = (lesson: GeneratedLesson) => {
    const cognitiveList = (lesson.objectives?.cognitive || []).map((o) => `<li>${o}</li>`).join('');
    const affectiveList = (lesson.objectives?.affective || []).map((o) => `<li>${o}</li>`).join('');
    const psychomotorList = (lesson.objectives?.psychomotor || []).map((o) => `<li>${o}</li>`).join('');

    const proceduresRows = (lesson.procedures || []).map(p => `
      <tr>
        <td style="text-align: center; font-weight: bold; width: 45px;">${p.stepNumber}</td>
        <td style="font-weight: bold; width: 140px;">${p.title}</td>
        <td style="text-align: center; width: 60px;">${p.durationMinutes} د</td>
        <td>${p.teacherActivity}</td>
        <td>${p.studentActivity}</td>
        <td style="font-weight: bold; width: 120px;">${p.strategy}</td>
      </tr>
    `).join('');

    const visionRows = (lesson.vision2040Goals || []).map(v => `
      <tr>
        <td style="font-weight: bold; width: 85px; text-align: center; color: #0d9488;">[${v.code}]</td>
        <td style="font-weight: bold; width: 220px;">${v.goalTitle}</td>
        <td>${v.applicationInLesson}</td>
      </tr>
    `).join('');

    const conceptsRows = (lesson.conceptsAndTerms || []).map(c => `
      <tr>
        <td style="font-weight: bold; width: 150px; color: #0f766e;">${c.term}</td>
        <td>${c.definition}</td>
      </tr>
    `).join('');

    return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <title>خطة درس: ${lesson.title}</title>
  <style>
    @page { size: A4; margin: 12mm 10mm; }
    * { box-sizing: border-box; font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; }
    body { direction: rtl; color: #0f172a; margin: 0; padding: 15px; font-size: 10.5pt; background: #fff; line-height: 1.5; }
    .header { border-bottom: 3px double #0d9488; padding-bottom: 10px; margin-bottom: 12px; }
    .header-top { display: flex; justify-content: space-between; align-items: center; font-size: 9.5pt; color: #334155; margin-bottom: 8px; }
    .header h1 { margin: 6px 0 0 0; font-size: 17pt; color: #0f766e; text-align: center; }
    .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; background: #f0fdfa; }
    .meta-table td { border: 1px solid #ccfbf1; padding: 6px 10px; font-size: 9.5pt; }
    .meta-table strong { color: #0f766e; }
    .section { margin-bottom: 12px; }
    .section-title { background: #0f766e; color: white; padding: 4px 8px; font-size: 10.5pt; font-weight: bold; border-radius: 4px; margin-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; margin-top: 4px; margin-bottom: 8px; }
    th, td { border: 1px solid #94a3b8; padding: 5px 8px; text-align: right; font-size: 9pt; vertical-align: top; }
    th { background: #f1f5f9; color: #0f172a; font-weight: bold; }
    ul { margin: 3px 0; padding-right: 18px; }
    li { margin-bottom: 2px; }
    .footer-signatures { display: flex; justify-content: space-between; margin-top: 25px; text-align: center; font-size: 9.5pt; border-top: 1px dashed #cbd5e1; padding-top: 10px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-top">
      <div>
        <strong>سلطنة عُمان</strong><br>
        وزارة التربية والتعليم<br>
        ${lesson.directorateName || 'المديرية العامة للتربية والتعليم بمحافظة مسقط'}<br>
        <span style="color: #0f766e; font-weight: bold;">${lesson.schoolName || 'مدرسة كعب بن برشة للتعليم ما بعد الأساسي (11 - 12)'}</span>
      </div>
      <div style="text-align: center;">
        <strong style="color: #0f766e; font-size: 11pt;">المكتبة الذكية والتربوية 🇴🇲</strong><br>
        <span>استمارة تحضير درس نموذجي معتمد</span>
      </div>
      <div style="text-align: left; font-size: 9pt;">
        العام الدراسي: <strong>${lesson.academicYear || '2026/2027 م - 1448 هـ'}</strong><br>
        الفصل: <strong>${lesson.semesterName || 'الفصل الدراسي الأول'}</strong><br>
        التاريخ: <strong>${lesson.dateStr || new Date().toLocaleDateString('ar-OM')}</strong><br>
        زمن الحصة: <strong>${lesson.durationMinutes || 45} دقيقة</strong>
      </div>
    </div>
    <h1>خطة درس: ${lesson.lessonTitle || lesson.title}</h1>
  </div>

  <table class="meta-table">
    <tr>
      <td><strong>المادة:</strong> ${lesson.subjectName}</td>
      <td><strong>الصف والشعبة:</strong> ${lesson.gradeName} (${lesson.sectionName || 'الشعبة 1'})</td>
      <td><strong>الوحدة التعليمية:</strong> ${lesson.unitTitle}</td>
      <td><strong>عنوان الدرس:</strong> ${lesson.lessonTitle || lesson.title}</td>
    </tr>
    <tr>
      <td><strong>معلم المادة:</strong> ${lesson.teacherName || 'أ. مريم بنت عبدالله المعمرية'}</td>
      <td><strong>المعلم الأول / المشرف:</strong> ${lesson.supervisorName || 'أحمد بن سالم البلوشي'}</td>
      <td><strong>المرحلة الدراسية:</strong> ${lesson.stageName || 'التعليم ما بعد الأساسي'}</td>
      <td><strong>الزمن المخصص:</strong> ${lesson.durationMinutes || 45} دقيقة</td>
    </tr>
  </table>

  ${lesson.pedagogicalFramework && lesson.pedagogicalFramework.theories && lesson.pedagogicalFramework.theories.length > 0 ? `
  <div class="section">
    <div class="section-title">الإطار التربوي واستراتيجيات التدريس المعتمدة</div>
    <table>
      <thead>
        <tr>
          <th style="width: 28%;">النظرية التربوية المعتمدة</th>
          <th style="width: 36%;">المبرر التربوي وعلاقة النظرية بالدرس</th>
          <th style="width: 36%;">طرق واستراتيجيات التدريس والتطبيق الميداني</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            ${lesson.pedagogicalFramework.theories.map(t => `<strong style="color: #0f766e; font-size: 10pt;">${t.name}</strong>`).join('<br>')}
            <div style="font-size: 8pt; color: #64748b; margin-top: 4px;">مرجع: دليل المعلم - مناهج سلطنة عمان</div>
          </td>
          <td style="font-size: 9pt; line-height: 1.4;">
            ${lesson.pedagogicalFramework.theories.map(t => t.justification).join('<br><br>')}
          </td>
          <td style="font-size: 8.5pt; line-height: 1.4;">
            <strong>الاستراتيجيات:</strong> ${(lesson.pedagogicalFramework.selectedStrategies || []).join(' • ')}<br>
            <div style="margin-top: 4px; color: #334155;">${lesson.pedagogicalFramework.theories[0]?.classroomApplication || ''}</div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>` : ''}

  ${lesson.vision2040Goals && lesson.vision2040Goals.length > 0 ? `
  <div class="section">
    <div class="section-title">مواءمة نواتج التعلم مع أولويات رؤية عُمان 2040</div>
    <table>
      <thead>
        <tr>
          <th style="width: 85px; text-align: center;">رمز الأولوية</th>
          <th>أولوية الرؤية الوطنية</th>
          <th>التطبيق والتوظيف الصفي</th>
        </tr>
      </thead>
      <tbody>${visionRows}</tbody>
    </table>
  </div>` : ''}

  <div class="section">
    <div class="section-title">الأهداف التعليمية التعلمية (النواتج)</div>
    <table>
      <thead>
        <tr>
          <th style="width: 33%;">الأهداف المعرفية (Cognitive)</th>
          <th style="width: 33%;">الأهداف الوجدانية والوطنية (Affective)</th>
          <th style="width: 34%;">الأهداف المهارية والعملية (Psychomotor)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><ul>${cognitiveList || '<li>تحديد المفاهيم الجغرافية المرتبطة بموضوع الدرس.</li>'}</ul></td>
          <td><ul>${affectiveList || '<li>الاعتزاز بالهوية الوطنية العمانية وصون المكتسبات.</li>'}</ul></td>
          <td><ul>${psychomotorList || '<li>رسم خريطة مفاهيم واستخراج معلومات من الأطلس.</li>'}</ul></td>
        </tr>
      </tbody>
    </table>
  </div>

  ${lesson.conceptsAndTerms && lesson.conceptsAndTerms.length > 0 ? `
  <div class="section">
    <div class="section-title">المفاهيم والمصطلحات الأساسية</div>
    <table>
      <thead><tr><th style="width: 150px;">المصطلح / المفهوم</th><th>التعريف التربوي والدلالة</th></tr></thead>
      <tbody>${conceptsRows}</tbody>
    </table>
  </div>` : ''}

  <div class="section">
    <div class="section-title">التهيئة الحافزة والمقدمة الاستكشافية</div>
    <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px;">
      ${lesson.hook || 'عرض وسيلة تعليمية حافزة وطرح تساؤل استقصائي يثير تفكير الطلاب ويحفزهم لاكتشاف موضوع الدرس.'}
    </div>
  </div>

  <div class="section">
    <div class="section-title">إجراءات وسير التدريس والأنشطة الصفية</div>
    <table>
      <thead>
        <tr>
          <th style="text-align: center;">م</th>
          <th>المرحلة والنشاط</th>
          <th style="text-align: center;">الزمن</th>
          <th>دور المعلم والتوجيه</th>
          <th>دور الطالب والتفاعل</th>
          <th>الاستراتيجية</th>
        </tr>
      </thead>
      <tbody>${proceduresRows}</tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">التقويم المستمر ومراعاة الفروق الفردية</div>
    <table>
      <thead>
        <tr>
          <th style="width: 50%;">أساليب التقويم التكويني والختامي</th>
          <th style="width: 50%;">الفروق الفردية (الدعم والإثراء)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>التقويم التكويني:</strong>
            <ul>${(lesson.assessmentMethods?.formative || ['الملاحظة الصفية وأسئلة الفحص السريع']).map(f => `<li>${f}</li>`).join('')}</ul>
            <strong>التقويم الختامي:</strong>
            <ul>${(lesson.assessmentMethods?.summative || ['بطاقات الخروج وحل التدريبات']).map(s => `<li>${s}</li>`).join('')}</ul>
          </td>
          <td>
            <strong>أنشطة الدعم والمساندة:</strong>
            <ul>${(lesson.differentiation?.supportLevel || ['توفير خرائط مبسطة وتجزئة المهام']).map(d => `<li>${d}</li>`).join('')}</ul>
            <strong>أنشطة الإثراء والتحدي:</strong>
            <ul>${(lesson.differentiation?.enrichmentLevel || ['ربط الدرس بمشروعات رؤية عمان 2040']).map(e => `<li>${e}</li>`).join('')}</ul>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">الواجب والتكليفات المنزلية ومصادر التعلم</div>
    <p style="margin: 4px 0;"><strong>التكليف المنزلي:</strong> ${lesson.homework || 'حل أنشطة كتاب الطالب وتلخيص أهم الأفكار.'}</p>
    <p style="margin: 4px 0; color: #475569; font-size: 9pt;"><strong>المصادر والمراجع:</strong> ${(lesson.referencedSources || [{ resourceTitle: 'كتاب الدراسات الاجتماعية المعتمد', pages: 'ص 24-28' }]).map(s => `${s.resourceTitle} (${s.pages})`).join(' | ')}</p>
  </div>

  <div class="footer-signatures">
    <div><strong>معلم المادة:</strong> .....................................</div>
    <div><strong>المعلم الأول:</strong> .....................................</div>
    <div><strong>المشرف التربوي / مدير المدرسة:</strong> .....................................</div>
  </div>
</body>
</html>`;
  };

  const handlePrint = () => {
    if (!selectedLesson) return;
    setShowPrintModal(true);
  };

  const handleExecutePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.warn('Direct print blocked:', e);
      showToast('⚠️ المتصفح يمنع الطباعة المباشرة داخل الإطار. اضغط على زر "تحميل صفحة الطباعة المستقلة (HTML)" لفتحها وطباعتها بدون أي قيود.', 'info');
    }
  };

  const handleDownloadPrintableHtml = () => {
    if (!selectedLesson) return;
    const html = generateLessonHtml(selectedLesson);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanTitle = (selectedLesson.lessonTitle || selectedLesson.title).replace(/[/\\?%*:|"<>]/g, '_');
    a.download = `خطة_درس_${cleanTitle}_للطباعة_الرسمية.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('📄 تم تنزيل صفحة الطباعة الرسمية بنجاح! يمكنك فتحها في أي متصفح والضغط على (Ctrl + P) للطباعة بأعلى جودة.', 'success');
  };

  const handleOpenEditHeader = () => {
    if (!selectedLesson) return;
    setHeaderForm({
      title: selectedLesson.title || '',
      schoolName: selectedLesson.schoolName || 'مدرسة كعب بن برشة للتعليم ما بعد الأساسي (11 - 12)',
      directorateName: selectedLesson.directorateName || 'المديرية العامة للتربية والتعليم بمحافظة مسقط',
      teacherName: selectedLesson.teacherName || 'أ. مريم بنت عبدالله المعمرية',
      supervisorName: selectedLesson.supervisorName || 'أحمد بن سالم البلوشي',
      academicYear: selectedLesson.academicYear || '2026/2027 م - 1448 هـ',
      semesterName: selectedLesson.semesterName || 'الفصل الدراسي الأول',
      dateStr: selectedLesson.dateStr || new Date().toLocaleDateString('ar-OM', { year: 'numeric', month: 'long', day: 'numeric' }),
      sectionName: selectedLesson.sectionName || '12/1',
      subjectName: selectedLesson.subjectName || 'الدراسات الاجتماعية',
      gradeName: selectedLesson.gradeName || 'الصف الثاني عشر',
      stageName: selectedLesson.stageName || 'التعليم ما بعد الأساسي',
      unitTitle: selectedLesson.unitTitle || '',
      lessonTitle: selectedLesson.lessonTitle || selectedLesson.title || '',
      durationMinutes: selectedLesson.durationMinutes || 45,
      cascadeToProfile: true
    });
    setEditHeaderModalOpen(true);
  };

  const handleSaveHeader = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLesson) return;
    setSavingHeader(true);
    try {
      const updated: GeneratedLesson = {
        ...selectedLesson,
        title: headerForm.title.trim() || selectedLesson.title,
        schoolName: headerForm.schoolName.trim(),
        directorateName: headerForm.directorateName.trim(),
        teacherName: headerForm.teacherName.trim(),
        supervisorName: headerForm.supervisorName.trim(),
        academicYear: headerForm.academicYear.trim(),
        semesterName: headerForm.semesterName.trim(),
        dateStr: headerForm.dateStr.trim(),
        sectionName: headerForm.sectionName.trim(),
        subjectName: headerForm.subjectName.trim(),
        gradeName: headerForm.gradeName.trim(),
        stageName: headerForm.stageName.trim(),
        unitTitle: headerForm.unitTitle.trim(),
        lessonTitle: headerForm.lessonTitle.trim(),
        durationMinutes: Number(headerForm.durationMinutes) || 45,
        updatedAt: new Date().toISOString()
      };

      const res = await api.saveLesson(updated);
      if (res.success) {
        setSelectedLesson(updated);
        setLessons(prev => prev.map(l => l.id === updated.id ? updated : l));
        showToast('تم تحديث وحفظ بيانات ترويسة تحضير الدرس بنجاح! 🏫', 'success');

        if (headerForm.cascadeToProfile) {
          try {
            await api.updateSchoolProfile({
              schoolName: headerForm.schoolName.trim(),
              directorateName: headerForm.directorateName.trim(),
              academicYear: headerForm.academicYear.trim()
            });
          } catch (_) {}
        }
        setEditHeaderModalOpen(false);
      }
    } catch (err: any) {
      showToast('تعذر حفظ بيانات الترويسة: ' + err.message, 'error');
    } finally {
      setSavingHeader(false);
    }
  };

  const handleExportLessonToPdf = async () => {
    if (!lessonSheetRef.current || !selectedLesson) return;
    setIsExportingPdf(true);
    try {
      const cleanTitle = (selectedLesson.lessonTitle || selectedLesson.title).replace(/[/\\?%*:|"<>]/g, '_');
      const filename = `تحضير_درس_${cleanTitle}.pdf`;
      const res = await exportUnifiedPdf(lessonSheetRef.current, {
        filename,
        orientation: 'portrait',
        scale: 2,
        addPageNumbers: true,
        title: `خطة درس: ${selectedLesson.title}`,
        hideSelectors: ['.no-print', '[data-no-print]', 'button', '.action-toolbar']
      });
      if (res.success) {
        if (res.viewerUrl || res.fullUrl) {
          setGeneratedPdfUrl(res.viewerUrl || res.fullUrl || null);
        }
        showToast('📄 تم تصدير خطة الدرس كملف PDF رسمي عالي الدقة بنجاح!', 'success');
      } else {
        showToast('تعذر تصدير الدرس إلى PDF: ' + (res.error || ''), 'error');
      }
    } catch (err: any) {
      showToast('خطأ أثناء تصدير PDF: ' + err.message, 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const preparePdfForWhatsApp = async (): Promise<string | null> => {
    if (!lessonSheetRef.current || !selectedLesson) return null;
    setIsPreparingPdf(true);
    try {
      const cleanTitle = (selectedLesson.lessonTitle || selectedLesson.title).replace(/[/\\?%*:|"<>]/g, '_');
      const filename = `تحضير_درس_${cleanTitle}.pdf`;
      const pdfRes = await generatePdfBlob(lessonSheetRef.current, { filename, orientation: 'portrait', scale: 2 });
      if (pdfRes.success && pdfRes.base64) {
        const uploadRes = await api.uploadDocumentPdf(pdfRes.base64, filename);
        if (uploadRes.success) {
          const directPdfUrl = uploadRes.fullUrl.startsWith('/')
            ? `${window.location.origin}${uploadRes.fullUrl}`
            : uploadRes.fullUrl;
          const previewViewerUrl = (uploadRes as any).viewerUrl
            ? ((uploadRes as any).viewerUrl.startsWith('/') ? `${window.location.origin}${(uploadRes as any).viewerUrl}` : (uploadRes as any).viewerUrl)
            : directPdfUrl;

          setGeneratedPdfUrl(previewViewerUrl);
          showToast('📄 تم توليد وتجهيز ملف الدرس بصيغة PDF للمشاركة!', 'success');
          return previewViewerUrl;
        }
      } else if (pdfRes.error) {
        showToast('تنبيه أثناء إعداد PDF: ' + pdfRes.error, 'error');
      }
    } catch (err: any) {
      console.warn('Could not generate PDF for WhatsApp:', err);
      showToast('تعذر تجهيز ملف PDF للواتساب: ' + (err.message || ''), 'error');
    } finally {
      setIsPreparingPdf(false);
    }
    return null;
  };

  const getLessonWhatsAppText = (customPdfUrl?: string) => {
    if (!selectedLesson) return '';
    const activePdfLink = customPdfUrl || generatedPdfUrl;
    const cleanTitle = selectedLesson.lessonTitle || selectedLesson.title;

    let text = `📚 *استمارة تحضير درس نموذجي - سلطنة عمان* 🇴🇲\n`;
    text += `🏛️ *وزارة التربية والتعليم*\n`;
    text += `📍 *${selectedLesson.directorateName || 'المديرية العامة للتربية والتعليم بمحافظة مسقط'}*\n`;
    text += `🏫 *${selectedLesson.schoolName || 'مدرسة كعب بن برشة للتعليم ما بعد الأساسي'}*\n`;
    text += `📖 *المادة:* ${selectedLesson.subjectName} | 🎓 *الصف:* ${selectedLesson.gradeName} (${selectedLesson.sectionName || 'الشعبة 1'})\n`;
    text += `🗓️ *العام الدراسي:* ${selectedLesson.academicYear || '2026/2027 م'} | *الفصل:* ${selectedLesson.semesterName || 'الأول'}\n`;
    text += `👩‍🏫 *معلم المادة:* ${selectedLesson.teacherName || 'أ. مريم المعمرية'} | 🕵️ *المشرف:* ${selectedLesson.supervisorName || 'معتمد'}\n`;
    text += `⏱️ *زمن الحصة:* ${selectedLesson.durationMinutes || 45} دقيقة | 📅 *التاريخ:* ${selectedLesson.dateStr || new Date().toLocaleDateString('ar-OM')}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    text += `📋 *عنوان الدرس:* ${cleanTitle}\n`;
    text += `📂 *الوحدة التعليمية:* ${selectedLesson.unitTitle}\n\n`;

    const cleanObjectives = [
      ...(selectedLesson.objectives?.cognitive || []),
      ...(selectedLesson.objectives?.affective || []),
      ...(selectedLesson.objectives?.psychomotor || [])
    ];
    if (cleanObjectives.length > 0) {
      text += `🎯 *أهداف ومخرجات التعلم:*\n`;
      cleanObjectives.slice(0, 4).forEach(obj => {
        text += `• ${obj}\n`;
      });
      text += `\n`;
    }

    if (selectedLesson.pedagogicalFramework && selectedLesson.pedagogicalFramework.theories && selectedLesson.pedagogicalFramework.theories.length > 0) {
      const th = selectedLesson.pedagogicalFramework.theories[0];
      text += `🧠 *الإطار التربوي واستراتيجيات التدريس:*\n`;
      text += `• النظرية: ${th.name}\n`;
      text += `• المبرر: ${th.justification}\n`;
      if (selectedLesson.pedagogicalFramework.selectedStrategies?.length > 0) {
        text += `• الاستراتيجيات: ${selectedLesson.pedagogicalFramework.selectedStrategies.join(' | ')}\n`;
      }
      text += `\n`;
    }

    if (selectedLesson.vision2040Goals && selectedLesson.vision2040Goals.length > 0) {
      text += `🇴🇲 *مواءمة أولويات رؤية عُمان 2040:*\n`;
      selectedLesson.vision2040Goals.slice(0, 2).forEach(vg => {
        text += `• [${vg.code}] ${vg.goalTitle}\n   ↳ ${vg.applicationInLesson}\n`;
      });
      text += `\n`;
    }

    const hookText = selectedLesson.hook || 'عرض وسيلة تعليمية حافزة وطرح تساؤل استقصائي يثير تفكير الطلاب.';
    text += `💡 *التهيئة الحافزة والمقدمة:*\n${hookText}\n\n`;

    if (selectedLesson.procedures && selectedLesson.procedures.length > 0) {
      text += `📖 *سير التدريس والأنشطة الصفية:*\n`;
      selectedLesson.procedures.slice(0, 4).forEach(p => {
        text += `• *${p.title}* (${p.durationMinutes} د) [${p.strategy}]:\n  - دور المعلم: ${p.teacherActivity.slice(0, 75)}...\n`;
      });
      text += `\n`;
    }

    if (selectedLesson.homework) {
      text += `📝 *الواجب المنزلي:*\n${selectedLesson.homework}\n\n`;
    }

    if (activePdfLink) {
      text += `📄 *رابط فتح وتحميل وثيقة تحضير الدرس المنسقة بصيغة PDF كاملة:*\n🔗 ${activePdfLink}\n`;
    }

    text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    text += `✨ تم التصدير عبر نظام تحضير المناهج العمانية - المكتبة الذكية 🇴🇲`;
    return text;
  };

  const handleOpenDirectWhatsApp = async () => {
    let pdfLink = generatedPdfUrl;
    if (!pdfLink) {
      pdfLink = await preparePdfForWhatsApp();
    }
    const text = getLessonWhatsAppText(pdfLink || undefined);
    let url = '';
    const cleanNumber = recipientPhone.replace(/\D/g, '');
    if (cleanNumber) {
      url = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(text)}`;
    } else {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    }
    window.open(url, '_blank');
  };

  const handleSendLessonViaCloudApi = async () => {
    if (!recipientPhone) {
      showToast('يرجى كتابة رقم الهاتف المستلم', 'info');
      return;
    }
    setIsSendingWhatsApp(true);
    try {
      localStorage.setItem('om_edu_wa_recipient_phone', recipientPhone.trim());

      let pdfUrlToUse = generatedPdfUrl;
      if (!pdfUrlToUse) {
        pdfUrlToUse = await preparePdfForWhatsApp();
      }

      const cleanTitle = (selectedLesson?.lessonTitle || selectedLesson?.title || 'خطة_درس').replace(/[/\\?%*:|"<>]/g, '_');
      const res = await api.dispatchLessonToWhatsApp({
        toPhone: recipientPhone.trim(),
        lessonTitle: cleanTitle,
        grade: selectedLesson?.gradeName,
        subject: selectedLesson?.subjectName,
        pdfUrl: pdfUrlToUse || undefined,
        pdfFilename: `تحضير_درس_${cleanTitle}.pdf`
      });

      if (res.success) {
        showToast('تم إرسال تحضير الدرس كملف PDF رسمي إلى الواتساب بنجاح 📲', 'success');
        setWhatsappModalOpen(false);
      } else {
        showToast('تنبيه: ' + (res.error || res.message || 'تعذر الإرسال السحابي، يمكنك استخدام زر فتح واتساب المباشر'), 'info');
      }
    } catch (err: any) {
      showToast('تعذر الإرسال الآلي: ' + err.message + ' (يمكنك استخدام زر فتح واتساب المباشر)', 'info');
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  const handleSendLessonToWhatsApp = () => {
    if (!selectedLesson) return;
    setWhatsappModalOpen(true);
  };

  const handleExportWord = () => {
    if (!selectedLesson) return;
    const html = generateLessonHtml(selectedLesson);
    const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanTitle = (selectedLesson.lessonTitle || selectedLesson.title).replace(/[/\\?%*:|"<>]/g, '_');
    a.download = `خطة_درس_${cleanTitle}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('تم تحميل الخطة بنجاح كملف Word قابل للتعديل والطباعة! 📄', 'success');
  };

  const handleCopyText = () => {
    if (!selectedLesson) return;

    const objectivesCognitive = selectedLesson.objectives?.cognitive?.join('\n- ') || '';
    const objectivesAffective = selectedLesson.objectives?.affective?.join('\n- ') || '';
    const objectivesPsychomotor = selectedLesson.objectives?.psychomotor?.join('\n- ') || '';

    const proceduresText = (selectedLesson.procedures || []).map(p =>
      `• ${p.title} (${p.durationMinutes} دقيقة) [الاستراتيجية: ${p.strategy}]\n  نشاط المعلم: ${p.teacherActivity}\n  نشاط الطالب: ${p.studentActivity}`
    ).join('\n\n');

    const sourcesText = (selectedLesson.referencedSources || []).map(s =>
      `- ${s.resourceTitle} (${s.pages})`
    ).join('\n');

    const visionText = (selectedLesson.vision2040Goals || []).map(v =>
      `• [${v.code}] ${v.goalTitle}\n  التطبيق والتوظيف الصفي: ${v.applicationInLesson}`
    ).join('\n\n');

    const fullText = `خطة درس نموذجي: ${selectedLesson.title}
المادة: ${selectedLesson.subjectName} | الصف: ${selectedLesson.gradeName} | الزمن: ${selectedLesson.durationMinutes} دقيقة
الوحدة: ${selectedLesson.unitTitle} | الدرس: ${selectedLesson.lessonTitle}

مواءمة الدرس مع أولويات رؤية عُمان 2040:
${visionText || 'مناهج معززة للقيم والمهارات الوطنية وكفاءات اقتصاد المعرفة'}

التهيئة الحافزة:
${selectedLesson.hook}

الأهداف التعليمية:
المعرفية:
- ${objectivesCognitive}
الوجدانية:
- ${objectivesAffective}
المهارية:
- ${objectivesPsychomotor}

إجراءات وسير التدريس:
${proceduresText}

الفروق الفردية والدعم:
- دعم الطلاب: ${(selectedLesson.differentiation?.supportLevel || []).join('، ')}
- الأنشطة الإثرائية: ${(selectedLesson.differentiation?.enrichmentLevel || []).join('، ')}

الواجب المنزلي:
${selectedLesson.homework}

المراجع المعتمدة من المكتبة:
${sourcesText}
`;

    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      showToast('تم نسخ خطة الدرس بالكامل إلى الحافظة', 'success');
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Filter lessons
  const filteredLessons = useMemo(() => {
    return lessons.filter(lsn => {
      if (gradeFilter !== 'all' && lsn.gradeName !== gradeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = lsn.title.toLowerCase().includes(q);
        const matchSubject = (lsn.subjectName || '').toLowerCase().includes(q);
        const matchUnit = (lsn.unitTitle || '').toLowerCase().includes(q);
        return matchTitle || matchSubject || matchUnit;
      }
      return true;
    });
  }, [lessons, gradeFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span>استوديو إعداد الخطط والدروس النموذجية</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            توليد واستعراض خطط تدريس متكاملة تشمل الأهداف، المفاهيم، الإجراءات، والتقويم وموثقة بالمناهج العمانية
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowTextbookIndexModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-teal-950 text-xs font-black transition shadow-sm cursor-pointer border border-amber-300"
            title="تصفح فهرس الكتب المدرسية لجميع الصفوف واختيار أي درس لتحضيره فوراً"
          >
            <Zap className="w-4 h-4 text-teal-950 fill-teal-950" />
            <span>فهرس الكتب والتحضير الفوري ⚡📚</span>
          </button>

          <button
            onClick={() => {
              setPedagogicalAssistantTab('templates');
              setShowPedagogicalAssistant(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-700 via-teal-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white text-xs font-extrabold transition shadow-sm cursor-pointer border border-emerald-500/40"
          >
            <Brain className="w-4 h-4 text-amber-300" />
            <span>مساعد التخطيط التربوي (البنائية & فكر-زاوج-شارك)</span>
          </button>

          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>توليد خطة درس جديدة بالذكاء الاصطناعي</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar List + Lesson Viewer/Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Lesson Plans List */}
        <div className="lg:col-span-1 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3 no-print shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              الدروس المحضرة والخطط ({filteredLessons.length})
            </span>
            <button
              onClick={loadLessonsAndTaxonomy}
              className="text-slate-400 hover:text-teal-600 transition"
              title="تحديث القائمة"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="بحث في الدروس..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-8 pl-2 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* Grade Filter Pill List */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
            <button
              onClick={() => setGradeFilter('all')}
              className={`px-2 py-1 rounded-lg font-bold transition whitespace-nowrap ${
                gradeFilter === 'all'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              الكل ({lessons.length})
            </button>
            {Array.from(new Set(lessons.map(l => l.gradeName).filter(Boolean))).map(grd => (
              <button
                key={grd}
                onClick={() => setGradeFilter(grd)}
                className={`px-2 py-1 rounded-lg font-bold transition whitespace-nowrap ${
                  gradeFilter === grd
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {grd}
              </button>
            ))}
          </div>

          {/* Lessons Scrollable List */}
          <div className="space-y-2 max-h-[650px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">
                <RefreshCw className="w-5 h-5 mx-auto animate-spin text-teal-600 mb-2" />
                <span>جاري تحميل الدروس المحضرة...</span>
              </div>
            ) : filteredLessons.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                <FileText className="w-8 h-8 mx-auto text-slate-300" />
                <p>لا توجد دروس تطابق البحث</p>
              </div>
            ) : (
              filteredLessons.map(lsn => (
                <div
                  key={lsn.id}
                  onClick={() => {
                    setSelectedLesson(lsn);
                    setIsEditing(false);
                    setDeleteConfirmId(null);
                  }}
                  className={`p-3 rounded-2xl cursor-pointer text-xs transition border ${
                    selectedLesson?.id === lsn.id
                      ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-950 dark:text-teal-100 font-bold shadow-xs'
                      : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <h4 className="font-bold line-clamp-2 leading-snug">{lsn.title}</h4>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                    <span className="truncate max-w-[120px]">{lsn.gradeName || lsn.subjectName}</span>
                    <span>{lsn.durationMinutes} دقيقة</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Detailed Lesson Plan Sheet */}
        <div className="lg:col-span-3">
          {selectedLesson ? (
            <div className="space-y-4">
              {/* Action Toolbar */}
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 no-print">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-bold">
                    {selectedLesson.subjectName}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                    {selectedLesson.gradeName}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-medium">
                    {selectedLesson.durationMinutes} دقيقة
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleExportLessonToPdf}
                    disabled={isExportingPdf}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition cursor-pointer shadow-md disabled:opacity-50"
                    title="تصدير خطة الدرس كملف PDF عالي الجودة"
                  >
                    {isExportingPdf ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    <span>تصدير PDF</span>
                  </button>

                  {generatedPdfUrl && (
                    <a
                      href={generatedPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition cursor-pointer shadow-md"
                      title="فتح ومعاينة ملف PDF المحفوظ في نافذة مستقلة"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>معاينة ملف PDF 📥</span>
                    </a>
                  )}

                  <button
                    onClick={handleOpenEditHeader}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 text-xs font-bold transition cursor-pointer shadow-xs"
                    title="تعديل بيانات المدرسة، المديرية، المعلم، والتاريخ أعلى التحضير"
                  >
                    <Edit3 className="w-4 h-4 text-teal-600" />
                    <span>تعديل الترويسة ✏️</span>
                  </button>

                  <button
                    onClick={handleSendLessonToWhatsApp}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer shadow-md"
                    title="إرسال الخطة كملف PDF رسمي إلى الواتساب"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>إرسال إلى واتساب 📲</span>
                  </button>

                  <button
                    onClick={handleExportWord}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition cursor-pointer shadow-xs"
                    title="تحميل الخطة كاملة كملف Word رسمي للتعديل والطباعة"
                  >
                    <FileText className="w-4 h-4 text-teal-600" />
                    <span>Word (.doc)</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer shadow-xs"
                    title="معاينة وطباعة الخطة بتنسيق وزارة التربية والتعليم العمانية المعتمد"
                  >
                    <Printer className="w-4 h-4 text-teal-600" />
                    <span>طباعة رسمية 🖨️</span>
                  </button>

                  <button
                    onClick={handleCopyText}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
                    title="نسخ الخطة بالكامل كنص"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
                  </button>

                  {/* Delete with inline confirmation */}
                  {deleteConfirmId === selectedLesson.id ? (
                    <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/50 p-1 rounded-xl border border-rose-300">
                      <span className="text-[10px] text-rose-600 font-bold px-1">تأكيد؟</span>
                      <button
                        onClick={() => handleDeleteLesson(selectedLesson.id)}
                        className="px-2 py-0.5 rounded-lg bg-rose-600 text-white text-[11px] font-bold hover:bg-rose-700"
                      >
                        نعم
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px]"
                      >
                        إلغاء
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(selectedLesson.id)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition cursor-pointer"
                      title="حذف الخطة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Printable Document Sheet (Captured for PDF and Printing) */}
              <div
                ref={lessonSheetRef}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-10 space-y-6 shadow-sm print:p-0 print:border-none print:shadow-none text-right"
              >
                {/* Quick Edit Header Bar (Interactive above official document, hidden in print) */}
                <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-200 dark:border-slate-800 print:hidden text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                    <span className="font-bold">الترويسة الرسمية المعتمدة لوزارة التربية والتعليم - استمارة تحضير درس</span>
                  </div>
                  <button
                    onClick={handleOpenEditHeader}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold transition cursor-pointer"
                    title="تعديل بيانات المدرسة، المديرية، المعلم، والتاريخ أعلى التحضير"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-teal-600" />
                    <span>تعديل بيانات الترويسة العلوية ✏️</span>
                  </button>
                </div>

                {/* Official Omani Ministerial Letterhead Header */}
                <div className="border-b-2 border-slate-900 dark:border-slate-700 pb-5">
                  <div className="flex items-start justify-between text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                    <div className="text-right space-y-0.5">
                      <p className="font-extrabold text-sm md:text-base text-slate-900 dark:text-white">سلطنة عُمان</p>
                      <p>وزارة التربية والتعليم</p>
                      <p>{selectedLesson.directorateName || 'المديرية العامة للتربية والتعليم بمحافظة مسقط'}</p>
                      <p className="text-teal-700 dark:text-teal-400 font-bold">{selectedLesson.schoolName || 'مدرسة كعب بن برشة للتعليم ما بعد الأساسي (11 - 12)'}</p>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-2xl bg-teal-800 text-amber-300 flex items-center justify-center shadow-md">
                        <School className="w-8 h-8" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 mt-1">استمارة تحضير معتمدة</span>
                    </div>

                    <div className="text-left space-y-1 font-mono text-xs">
                      <p>العام الدراسي: <span className="font-sans font-semibold">{selectedLesson.academicYear || '2026/2027 م - 1448 هـ'}</span></p>
                      <p>الفصل: <span className="font-sans font-semibold">{selectedLesson.semesterName || 'الفصل الدراسي الأول'}</span></p>
                      <p>التاريخ: <span className="font-sans font-semibold">{selectedLesson.dateStr || new Date().toLocaleDateString('ar-OM')}</span></p>
                      <p>زمن الحصة: <span className="font-bold text-teal-700 dark:text-teal-400">{selectedLesson.durationMinutes || 45} دقيقة</span></p>
                    </div>
                  </div>

                  {/* Detailed Metadata Grid Bar */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-4 p-3.5 bg-teal-50/70 dark:bg-teal-950/40 rounded-2xl border border-teal-100 dark:border-teal-900/60 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">المادة الدراسية:</span>
                      <strong className="text-teal-800 dark:text-teal-300 font-bold">{selectedLesson.subjectName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">الصف والشعبة:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{selectedLesson.gradeName} ({selectedLesson.sectionName || 'الشعبة 1'})</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">معلم المادة:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{selectedLesson.teacherName || 'أ. مريم بنت عبدالله المعمرية'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">المعلم الأول / المشرف:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{selectedLesson.supervisorName || 'أحمد بن سالم البلوشي'}</strong>
                    </div>
                  </div>
                </div>

                {/* Title and Metadata Header */}
                <div className="space-y-2">
                  <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                    {selectedLesson.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span>الوحدة: <strong>{selectedLesson.unitTitle}</strong></span>
                    <span>الدرس: <strong>{selectedLesson.lessonTitle}</strong></span>
                    <span>المرحلة: <strong>{selectedLesson.stageName}</strong></span>
                  </div>
                </div>

              {/* Oman Vision 2040 Educational Alignment Section */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-amber-50/30 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-900 border border-emerald-200 dark:border-emerald-800/70 space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-emerald-200/60 dark:border-emerald-900/40">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                      🇴🇲
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                        <span>مواءمة الدرس مع أولويات رؤية عُمان 2040 التعليمية</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                          التعليم والتعلم والقدرات الوطنية
                        </span>
                      </h3>
                      <p className="text-[11px] text-emerald-800/90 dark:text-emerald-300/80">
                        الربط الوطني المعتمد مع مهارات المستقبل، اقتصاد المعرفة، الاستدامة البيئية، والهوية
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 no-print flex-wrap">
                    <button
                      onClick={() => {
                        setPedagogicalAssistantTab('vision2040');
                        setShowPedagogicalAssistant(true);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-100/70 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 text-xs font-bold transition cursor-pointer"
                      title="فتح مصفوفة تتبع مخرجات رؤية عمان 2040"
                    >
                      <Target className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>مصفوفة تتبع الرؤية 📊</span>
                    </button>
                    <button
                      onClick={handleAutoSuggestVisionGoals}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-bold transition cursor-pointer"
                      title="اقتراح أهداف الرؤية الملائمة لمحتوى الدرس تلقائياً"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>اقتراح ذكي</span>
                    </button>
                    <button
                      onClick={handleOpenEditVision}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                      title="تعديل أو تخصيص أهداف الرؤية لهذا الدرس"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>تعديل المواءمة</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedLesson.vision2040Goals && selectedLesson.vision2040Goals.length > 0 ? (
                    selectedLesson.vision2040Goals.map((vg, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-emerald-100 dark:border-emerald-900/60 shadow-xs space-y-2 hover:border-emerald-300 transition"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-extrabold text-xs text-emerald-900 dark:text-emerald-200 leading-snug">
                            {vg.goalTitle}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono font-bold shrink-0">
                            {vg.code}
                          </span>
                        </div>
                        <div className="text-xs text-slate-700 dark:text-slate-300 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-100/70 dark:border-emerald-900/40">
                          <strong className="text-emerald-800 dark:text-emerald-300 block mb-1">
                            🎯 التوظيف والتطبيق الصفي العملي في الحصة:
                          </strong>
                          <p className="leading-relaxed">{vg.applicationInLesson}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-4 text-xs text-emerald-800 dark:text-emerald-300 bg-white/70 dark:bg-slate-900/70 rounded-xl border border-emerald-100 dark:border-emerald-900/40 space-y-2">
                      <p>لم يتم تخصيص أهداف رؤية عُمان 2040 لهذا الدرس بعد.</p>
                      <button
                        onClick={handleAutoSuggestVisionGoals}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>مواءمة الدرس تلقائياً الآن مع رؤية عمان 2040</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ---------------------------------------------------- */}
              {/* الإطار التربوي واستراتيجيات التدريس (Pedagogical Framework) */}
              {/* ---------------------------------------------------- */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-teal-50/40 to-slate-50 dark:from-slate-800/90 dark:via-indigo-950/30 dark:to-teal-950/20 border-2 border-indigo-200/90 dark:border-indigo-800/60 shadow-xs space-y-4">
                <div className="flex items-center justify-between gap-3 border-b border-indigo-100 dark:border-indigo-900/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                      <Brain className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        الإطار التربوي واستراتيجيات التدريس المعتمدة
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        المنطلقات النظرية وتطبيقاتها الميدانية وفق وثيقة معايير مناهج الدراسات الاجتماعية العمانية
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-300/60">
                    رؤية عمان 2040 ودليل المعلم
                  </span>
                </div>

                {selectedLesson.pedagogicalFramework?.theories && selectedLesson.pedagogicalFramework.theories.length > 0 ? (
                  <div className="space-y-3 text-xs">
                    {/* Theory Details */}
                    {selectedLesson.pedagogicalFramework.theories.map((th, tIdx) => (
                      <div key={tIdx} className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-xs text-indigo-900 dark:text-indigo-200">
                            النظرية التربوية المعتمدة:
                          </span>
                          <span className="px-3 py-1 rounded-xl bg-indigo-600 text-white font-black text-xs shadow-xs">
                            {th.name}
                          </span>
                        </div>

                        {/* Justification */}
                        <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-indigo-100 dark:border-indigo-900/50 space-y-1">
                          <strong className="text-indigo-800 dark:text-indigo-300 block text-[11px]">
                            💡 المبرر التربوي لاختيار هذه النظرية لهذا الدرس:
                          </strong>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                            {th.justification}
                          </p>
                        </div>

                        {/* Classroom Field Application */}
                        {th.classroomApplication && (
                          <div className="p-3 rounded-xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-900/50 space-y-1">
                            <strong className="text-teal-900 dark:text-teal-200 block text-[11px]">
                              🎯 التطبيق الميداني في خطوات الدرس (التمهيد، سير الأنشطة، والتقويم):
                            </strong>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                              {th.classroomApplication}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Strategies Pills */}
                    {selectedLesson.pedagogicalFramework.selectedStrategies && selectedLesson.pedagogicalFramework.selectedStrategies.length > 0 && (
                      <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900/40 space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                          طرق واستراتيجيات التدريس المقترنة بالدرس:
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {selectedLesson.pedagogicalFramework.selectedStrategies.map((st, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2.5 py-1 rounded-lg bg-teal-100/80 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold text-[11px] border border-teal-200"
                            >
                              ✓ {st}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs bg-white/80 dark:bg-slate-900/80 rounded-xl border border-indigo-100 dark:border-indigo-900/40 space-y-2">
                    <p className="text-slate-600 dark:text-slate-400">
                      يمكنك تأطير هذا الدرس بالنظرية التربوية واستراتيجيات التدريس المعتمدة بضغطة واحدة:
                    </p>
                    <button
                      onClick={async () => {
                        const framework = {
                          theories: [{
                            theoryId: 'constructivism',
                            name: 'النظرية البنائية (Constructivism)',
                            justification: `تعتمد طبيعة درس "${selectedLesson.lessonTitle}" على استكشاف الظواهر الجغرافية وبناء الفهم المكاني ذاتياً عبر الملاحظة والتحليل التضاريسي والكارتوجرافي.`,
                            classroomApplication: 'التمهيد: استثارة دافعية الطلاب بتساؤل مكاني محفز؛ سير الأنشطة: مجموعات استقصائية وخرائط مفاهيم؛ التقويم: قياس مهارات قراءة الخرائط وحل المشكلات المكانية.'
                          }],
                          selectedStrategies: [
                            'الاستقصاء الجغرافي الخماسي (Geographic Inquiry)',
                            'خرائط المفاهيم والخرائط الرقمية',
                            'استراتيجيات التعلم النشط (فكر-زاوج-شارك)'
                          ],
                          activeLearningMechanisms: 'مراعاة الفروق الفردية عبر تمايز الأنشطة والتدرج في قراءة المعطيات الكارتوجرافية.',
                          vision2040PedagogicalLink: 'المواءمة مع أولويات التعليم والبحث العلمي وبناء المهارات التنافسية لرؤية عمان 2040.',
                          teachersGuideReference: 'دليل المعلم المعتمد لمناهج الدراسات الاجتماعية والجغرافيا بسلطنة عمان.'
                        };
                        const updated = { ...selectedLesson, pedagogicalFramework: framework };
                        setSelectedLesson(updated);
                        setLessons(prev => prev.map(l => l.id === updated.id ? updated : l));
                        await api.saveLesson(updated);
                        showToast('تم اعتماد الإطار التربوي واستراتيجيات التدريس للدرس بنجاح', 'success');
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-sm transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>توليد وتأطير الدرس تربوياً الآن</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Hook (التهيئة والإثارة) */}
              {selectedLesson.hook && (
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs space-y-1.5">
                  <span className="font-extrabold text-amber-900 dark:text-amber-200 block text-xs">
                    🌟 التمهيد والإثارة (التهيئة الحافزة وسؤال التحدي):
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {selectedLesson.hook}
                  </p>
                </div>
              )}

              {/* Learning Objectives (Cognitive, Affective, Psychomotor) */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>الأهداف التعليمية والسلوكية المعتمدة</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900/40 space-y-1.5">
                    <span className="font-bold text-teal-700 dark:text-teal-400 block border-b pb-1">
                      الأهداف المعرفية:
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 leading-relaxed">
                      {(selectedLesson.objectives?.cognitive || []).map((obj, i) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/40 space-y-1.5">
                    <span className="font-bold text-blue-700 dark:text-blue-400 block border-b pb-1">
                      الأهداف الوجدانية:
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 leading-relaxed">
                      {(selectedLesson.objectives?.affective || []).map((obj, i) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40 space-y-1.5">
                    <span className="font-bold text-purple-700 dark:text-purple-400 block border-b pb-1">
                      الأهداف المهارية:
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 leading-relaxed">
                      {(selectedLesson.objectives?.psychomotor || []).map((obj, i) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Concepts & Terminology */}
              {selectedLesson.conceptsAndTerms && selectedLesson.conceptsAndTerms.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    المفاهيم والمصطلحات الجغرافية المحورية
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {selectedLesson.conceptsAndTerms.map((ct, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
                        <span className="font-extrabold text-teal-700 dark:text-teal-300 block mb-0.5">{ct.term}:</span>
                        <span className="text-slate-600 dark:text-slate-300 leading-relaxed">{ct.definition}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step-by-Step Procedures Table */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-teal-600" />
                    <span>خطوات تنفيذ الدرس وسير التدريس والأنشطة</span>
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        setPedagogicalAssistantTab('think-pair-share');
                        setShowPedagogicalAssistant(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-xs font-bold transition shadow-2xs cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                      <span>إدراج نشاط "فكر - زاوج - شارك" 👥</span>
                    </button>
                    <button
                      onClick={() => {
                        setPedagogicalAssistantTab('templates');
                        setShowPedagogicalAssistant(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 hover:bg-teal-100 dark:hover:bg-teal-900/40 text-xs font-bold transition shadow-2xs cursor-pointer"
                    >
                      <Brain className="w-3.5 h-3.5 text-teal-600" />
                      <span>قوالب البنائية (5Es) 🧠</span>
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      <tr>
                        <th className="p-3">الخطوة / المرحلة</th>
                        <th className="p-3 whitespace-nowrap">الزمن</th>
                        <th className="p-3">نشاط ودور المعلم</th>
                        <th className="p-3">نشاط ودور الطالب</th>
                        <th className="p-3 whitespace-nowrap">استراتيجية التدريس</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {(selectedLesson.procedures || []).map((step, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-bold text-slate-900 dark:text-white">{step.title}</td>
                          <td className="p-3 whitespace-nowrap font-mono text-teal-600">{step.durationMinutes} د</td>
                          <td className="p-3 leading-relaxed">{step.teacherActivity}</td>
                          <td className="p-3 leading-relaxed">{step.studentActivity}</td>
                          <td className="p-3 font-semibold text-teal-700 dark:text-teal-400 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800">
                              {step.strategy}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Differentiation & Remedial/Enrichment */}
              {selectedLesson.differentiation && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/40 space-y-1.5">
                    <span className="font-bold text-teal-900 dark:text-teal-200 block">
                      دعم الطلاب والفروق الفردية (مستوى الدعم):
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 leading-relaxed">
                      {(selectedLesson.differentiation.supportLevel || []).map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 space-y-1.5">
                    <span className="font-bold text-purple-900 dark:text-purple-200 block">
                      الأنشطة الإثرائية للموهوبين (مستوى التحدي):
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 leading-relaxed">
                      {(selectedLesson.differentiation.enrichmentLevel || []).map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Homework and Assessment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {selectedLesson.homework && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">التكليف والواجب المنزلي:</span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedLesson.homework}</p>
                  </div>
                )}

                {selectedLesson.toolsAndResources && selectedLesson.toolsAndResources.length > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">الوسائل التعليمية المستخدمة:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {selectedLesson.toolsAndResources.map((tool, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Referenced Sources Footer */}
              {selectedLesson.referencedSources && selectedLesson.referencedSources.length > 0 && (
                <div className="p-4 rounded-2xl bg-teal-50/40 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900 text-xs space-y-2">
                  <div className="font-extrabold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-teal-600" />
                    <span>المصادر والمراجع المعتمدة من المكتبة في إعداد هذه الخطة:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedLesson.referencedSources.map((ref, idx) => (
                      <div key={idx} className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-teal-100 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                        <strong className="text-teal-800 dark:text-teal-300">{ref.resourceTitle}</strong> ({ref.pages}) {ref.notes ? `• ${ref.notes}` : ''}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              </div>
            </div>
          ) : (
            <div className="p-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <GraduationCap className="w-12 h-12 mx-auto text-slate-300" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">اختر خطة درس أو أنشئ خطة جديدة</h3>
              <p className="text-xs text-slate-500">
                يمكنك توليد خطة درس كاملة وموثقة بضغطة زر بناءً على محتوى كتب المكتبة.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Generator Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-right my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600" />
                <span>إعداد درس جديد بالذكاء الاصطناعي</span>
              </h3>
              <button onClick={() => setShowGenerateModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان الدرس <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={genLessonTitle}
                  onChange={(e) => setGenLessonTitle(e.target.value)}
                  placeholder="مثال: مضيق هرمز والتجارة البحرية لسلطنة عمان"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">المادة</label>
                  <select
                    value={genSubject}
                    onChange={(e) => setGenSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الصف</label>
                  <select
                    value={genGrade}
                    onChange={(e) => setGenGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  >
                    {grades.map(g => (
                      <option key={g.id} value={g.name}>{g.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الوحدة الدراسية</label>
                <select
                  value={genUnit}
                  onChange={(e) => setGenUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                >
                  {units.map(u => (
                    <option key={u.id} value={u.title}>{u.title}</option>
                  ))}
                </select>
              </div>

              {/* Pedagogical Theory Selection */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  النظرية التربوية المعتمدة للدرس:
                </label>
                <select
                  value={genTheory}
                  onChange={(e) => setGenTheory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold"
                >
                  <option value="النظرية البنائية (Constructivism)">النظرية البنائية (التعلم القائم على الاستكشاف وحل المشكلات)</option>
                  <option value="النظرية السوسيو-بنائية (البنائية الاجتماعية)">النظرية السوسيو-بنائية (البنائية الاجتماعية - الصراع المعرفي والتفاوض الاجتماعي)</option>
                  <option value="نظرية الذكاءات المتعددة (Multiple Intelligences - Gardner)">نظرية الذكاءات المتعددة (لتفريد التعليم وتلبية الفروق الفردية)</option>
                  <option value="النظرية الاجتماعية-الثقافية (Vygotsky) ومنطقة التطوير القريبة (ZPD)">النظرية الاجتماعية-الثقافية ومنطقة التطوير القريبة (التعلم التعاوني والتراث)</option>
                  <option value="النظرية المعرفية ونظرية معالجة المعلومات (Cognitivism)">النظرية المعرفية ونظرية معالجة المعلومات (المنظمات المتقدمة)</option>
                  <option value="نظرية التعلم المستند إلى الدماغ والتفكير البصري المكاني (Spatial Thinking)">نظرية التعلم المستند إلى الدماغ والتفكير المكاني (GIS ونمذجة 3D)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    استراتيجية التدريس المقترحة
                  </label>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">
                    انقر للاختيار السريع ⚡
                  </span>
                </div>
                <input
                  type="text"
                  value={genStrategy}
                  onChange={(e) => setGenStrategy(e.target.value)}
                  placeholder="مثال: الاستقصاء الجغرافي، حل المشكلات، التعلم التعاوني"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
                {/* Quick strategy chips */}
                <div className="flex items-center gap-1 flex-wrap mt-1.5">
                  {[
                    'الاستقصاء الجغرافي الخماسي',
                    'التعلم القائم على المشكلات (PBL)',
                    'خرائط المفاهيم والخرائط الرقمية',
                    'نظم GIS والخرائط التفاعلية',
                    'فكر-زاوج-شارك',
                    'الرؤوس المرقمة'
                  ].map((chip) => (
                    <button
                      type="button"
                      key={chip}
                      onClick={() => setGenStrategy(chip)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 hover:bg-teal-100 cursor-pointer"
                    >
                      +{chip}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الزمن المقترح (بالدقائق)</label>
                <input
                  type="number"
                  min="20"
                  max="90"
                  value={genDuration}
                  onChange={(e) => setGenDuration(parseInt(e.target.value) || 45)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Oman Vision 2040 Priority Focus in Generator */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/40 dark:from-emerald-950/30 dark:to-slate-900 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-emerald-950 dark:text-emerald-200 text-xs flex items-center gap-1.5">
                    <span>🇴🇲 أولويات رؤية عُمان 2040 المستهدفة</span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-normal">(اختيار حر أو تلقائي بالذكاء الاصطناعي)</span>
                  </label>
                  {selectedGenVisionGoals.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedGenVisionGoals([])}
                      className="text-[10px] text-rose-600 hover:underline cursor-pointer"
                    >
                      إعادة التعيين للوضع التلقائي
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  حدد الأولويات التي ترغب في التركيز عليها في هذا الدرس، أو اتركها فارغة ليحددها الذكاء الاصطناعي تلقائياً بناءً على محتوى الدرس:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pt-1">
                  {availableVisionGoals.map(g => {
                    const isSelected = selectedGenVisionGoals.includes(g.code);
                    return (
                      <button
                        type="button"
                        key={g.code}
                        onClick={() => {
                          setSelectedGenVisionGoals(prev =>
                            prev.includes(g.code)
                              ? prev.filter(c => c !== g.code)
                              : [...prev, g.code]
                          );
                        }}
                        className={`p-2 rounded-xl text-right text-[11px] border transition flex items-start gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 mt-0.5 rounded flex items-center justify-center shrink-0 border text-[9px] font-bold ${
                          isSelected ? 'bg-white text-emerald-700 border-white' : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {isSelected ? '✓' : ''}
                        </span>
                        <div className="min-w-0">
                          <span className="font-bold block truncate">{g.title}</span>
                          <span className={`text-[9px] block ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                            {g.code} • {g.priority}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>جاري إعداد الخطة...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>توليد وحفظ الخطة</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Editing Vision 2040 Alignment for Selected Lesson */}
      {editVisionModalOpen && selectedLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-right my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">🇴🇲</span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    تعديل مواءمة الدرس مع رؤية عُمان 2040
                  </h3>
                  <p className="text-xs text-slate-500">
                    الدرس: {selectedLesson.lessonTitle} • {selectedLesson.subjectName} ({selectedLesson.gradeName})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditVisionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1 text-xs">
              <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <span className="text-emerald-900 dark:text-emerald-200 font-bold">
                  اختر الأهداف من منظومة رؤية عُمان 2040 وعدّل كيفية تطبيقها في الحصة:
                </span>
                <button
                  type="button"
                  onClick={handleAutoSuggestVisionGoals}
                  className="flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>اقتراح ذكي</span>
                </button>
              </div>

              {/* Goal selector chips */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  الأولويات الوطنية المتاحة (انقر لإضافة / إزالة الهدف من الخطة):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableVisionGoals.map(g => {
                    const isAdded = editingVisionGoals.some(item => item.code === g.code);
                    return (
                      <button
                        type="button"
                        key={g.code}
                        onClick={() => {
                          if (isAdded) {
                            setEditingVisionGoals(prev => prev.filter(item => item.code !== g.code));
                          } else {
                            setEditingVisionGoals(prev => [
                              ...prev,
                              {
                                code: g.code,
                                goalTitle: g.title,
                                applicationInLesson: `تطبيق مخرجات الهدف (${g.title}) في أنشطة درس (${selectedLesson.lessonTitle}).`
                              }
                            ]);
                          }
                        }}
                        className={`p-2.5 rounded-xl text-right transition border flex items-start gap-2 cursor-pointer ${
                          isAdded
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-950 dark:text-emerald-100 font-bold shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-emerald-300'
                        }`}
                      >
                        <span className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center shrink-0 border text-[10px] font-bold ${
                          isAdded ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {isAdded ? '✓' : '+'}
                        </span>
                        <div className="min-w-0">
                          <span className="block font-bold truncate">{g.title}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">{g.code} • {g.priority}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Editable applications for each active goal */}
              <div className="space-y-3 pt-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  صياغة التوظيف والتطبيق الصفي العملي لكل هدف في الحصة:
                </label>
                {editingVisionGoals.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                    لم يتم اختيار أي هدف بعد. اختر من القائمة أعلاه أو اضغط "اقتراح ذكي".
                  </div>
                ) : (
                  editingVisionGoals.map((eg, idx) => (
                    <div key={eg.code} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">
                          {eg.goalTitle}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono font-bold text-[10px]">
                            {eg.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => setEditingVisionGoals(prev => prev.filter(item => item.code !== eg.code))}
                            className="text-rose-500 hover:text-rose-700 cursor-pointer"
                            title="حذف الهدف من الدرس"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <textarea
                        rows={2}
                        value={eg.applicationInLesson}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingVisionGoals(prev => prev.map((item, i) => i === idx ? { ...item, applicationInLesson: val } : item));
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs focus:ring-1 focus:ring-emerald-500"
                        placeholder="اكتب التوظيف والتطبيق الصفي العملي للهدف في هذا الدرس..."
                      />
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditVisionModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveVisionGoals}
                disabled={isSavingVision}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSavingVision ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>حفظ مواءمة الرؤية</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Lesson Plan Print & Export Modal */}
      {showPrintModal && selectedLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    معاينة وطباعة الخطة التدريسية الرسمية
                  </h3>
                  <p className="text-xs text-slate-500">
                    وفق النموذج المعتمد لوزارة التربية والتعليم بسلطنة عمان 🇴🇲
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowPrintModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Buttons Toolbar */}
            <div className="p-4 bg-teal-50/60 dark:bg-teal-950/30 border-b border-teal-100 dark:border-teal-900/50 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold text-teal-900 dark:text-teal-200">
                اختر طريقة الطباعة أو التصدير المناسبة لك:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleExportLessonToPdf}
                  disabled={isExportingPdf}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-sm transition cursor-pointer disabled:opacity-50"
                  title="تصدير خطة الدرس كملف PDF عالي الجودة"
                >
                  {isExportingPdf ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span>تصدير PDF</span>
                </button>

                <button
                  onClick={handleExecutePrint}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold shadow-sm transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة المستند مباشرة</span>
                </button>

                <button
                  onClick={handleDownloadPrintableHtml}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition cursor-pointer shadow-xs"
                  title="تنزيل صفحة HTML مستقلة تفتح في المتصفح وتطبع بدون قيود"
                >
                  <Download className="w-4 h-4 text-sky-600" />
                  <span>تحميل صفحة الطباعة المستقلة (HTML)</span>
                </button>

                <button
                  onClick={handleExportWord}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition cursor-pointer shadow-xs"
                >
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>تصدير Word (.doc)</span>
                </button>

                <button
                  onClick={handleSendLessonToWhatsApp}
                  disabled={isSendingWhatsApp}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-extrabold shadow-sm transition cursor-pointer"
                >
                  {isSendingWhatsApp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>إرسال إلى واتسابي 📲</span>
                </button>
              </div>
            </div>

            {/* Document Preview Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-100/70 dark:bg-slate-950/60">
              <div 
                className="printable-document bg-white text-slate-900 p-8 rounded-2xl shadow-md border border-slate-200 max-w-3xl mx-auto text-xs leading-relaxed"
                dangerouslySetInnerHTML={{ __html: generateLessonHtml(selectedLesson) }}
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                💡 نصيحة: إذا حظر المتصفح الطباعة المباشرة داخل نافذة المعاينة، استخدم زر <strong>"تحميل صفحة الطباعة المستقلة (HTML)"</strong> وافتحها في Chrome للطباعة الفورية.
              </span>
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Lesson Header Data (الترويسة العلوية لتحضير الدرس) */}
      {editHeaderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 text-right text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    تعديل البيانات والترويسة أعلى الصفحة لتحضير الدرس
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    تخصيص المدرسة، المديرية التعليمية، المعلم، المشرف، التاريخ، والشعبة
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditHeaderModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveHeader} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم المدرسة (School Name):
                </label>
                <input
                  type="text"
                  required
                  value={headerForm.schoolName}
                  onChange={e => setHeaderForm(prev => ({ ...prev, schoolName: e.target.value }))}
                  placeholder="مدرسة كعب بن برشة للتعليم ما بعد الأساسي"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  المديرية العامة للتربية والتعليم بمحافظة:
                </label>
                <input
                  type="text"
                  required
                  value={headerForm.directorateName}
                  onChange={e => setHeaderForm(prev => ({ ...prev, directorateName: e.target.value }))}
                  placeholder="المديرية العامة للتربية والتعليم بمحافظة مسقط"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    معلم المادة:
                  </label>
                  <input
                    type="text"
                    required
                    value={headerForm.teacherName}
                    onChange={e => setHeaderForm(prev => ({ ...prev, teacherName: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    المعلم الأول / المشرف التربوي:
                  </label>
                  <input
                    type="text"
                    required
                    value={headerForm.supervisorName}
                    onChange={e => setHeaderForm(prev => ({ ...prev, supervisorName: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    العام الدراسي:
                  </label>
                  <input
                    type="text"
                    required
                    value={headerForm.academicYear}
                    onChange={e => setHeaderForm(prev => ({ ...prev, academicYear: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الفصل الدراسي:
                  </label>
                  <input
                    type="text"
                    required
                    value={headerForm.semesterName}
                    onChange={e => setHeaderForm(prev => ({ ...prev, semesterName: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    تاريخ الحصة:
                  </label>
                  <input
                    type="text"
                    required
                    value={headerForm.dateStr}
                    onChange={e => setHeaderForm(prev => ({ ...prev, dateStr: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الشعبة الدراسية:
                  </label>
                  <input
                    type="text"
                    required
                    value={headerForm.sectionName}
                    onChange={e => setHeaderForm(prev => ({ ...prev, sectionName: e.target.value }))}
                    placeholder="12/1"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    المادة:
                  </label>
                  <input
                    type="text"
                    required
                    value={headerForm.subjectName}
                    onChange={e => setHeaderForm(prev => ({ ...prev, subjectName: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الصف:
                  </label>
                  <input
                    type="text"
                    required
                    value={headerForm.gradeName}
                    onChange={e => setHeaderForm(prev => ({ ...prev, gradeName: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الوحدة التعليمية:
                  </label>
                  <input
                    type="text"
                    value={headerForm.unitTitle}
                    onChange={e => setHeaderForm(prev => ({ ...prev, unitTitle: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الزمن (دقيقة):
                  </label>
                  <input
                    type="number"
                    value={headerForm.durationMinutes}
                    onChange={e => setHeaderForm(prev => ({ ...prev, durationMinutes: Number(e.target.value) || 45 }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان الدرس:
                </label>
                <input
                  type="text"
                  required
                  value={headerForm.lessonTitle}
                  onChange={e => setHeaderForm(prev => ({ ...prev, lessonTitle: e.target.value, title: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                />
              </div>

              <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="cascadeLessonToProfile"
                  checked={headerForm.cascadeToProfile}
                  onChange={e => setHeaderForm(prev => ({ ...prev, cascadeToProfile: e.target.checked }))}
                  className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <label htmlFor="cascadeLessonToProfile" className="text-[11px] text-teal-900 dark:text-teal-200 cursor-pointer select-none">
                  اعتماد وتحديث اسم المدرسة والمديرية كترويسة موحدة لسائر وثائق المنصة
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditHeaderModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={savingHeader}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {savingHeader ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>حفظ وتطبيق الترويسة فوراً</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: WhatsApp Share with High-Quality PDF Attachment */}
      {whatsappModalOpen && selectedLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    إرسال تحضير الدرس عبر واتساب 📲
                  </h3>
                  <p className="text-xs text-slate-500">
                    تصلك في الواتساب كملف PDF معتمد بنفس تنسيق وألوان المكتبة الذكية ورابط التحميل المباشر
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWhatsappModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Smart Library Format Assurance Badge */}
            <div className="p-3 rounded-2xl bg-linear-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>مرفق ملف PDF معتمد يحمل نفس الجداول والألوان والترويسة العمانية</span>
              </div>
              <button
                onClick={preparePdfForWhatsApp}
                disabled={isPreparingPdf}
                className="text-[11px] font-bold text-teal-700 hover:underline shrink-0 flex items-center gap-1 cursor-pointer"
              >
                {isPreparingPdf ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-amber-500" />}
                <span>{generatedPdfUrl ? 'الـ PDF جاهز 📄' : 'تجهيز الـ PDF الآن'}</span>
              </button>
            </div>

            {/* Recipient Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                رقم هاتف المستلم (هاتفك الشخصي / الإدارة):
              </label>
              <input
                type="text"
                value={recipientPhone}
                onChange={e => setRecipientPhone(e.target.value)}
                placeholder="+96877394680"
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold"
              />
              <span className="text-[11px] text-slate-400">
                يمكنك تركه فارغاً والضغط على (فتح في واتساب) لاختيار أي محادثة أو جهة اتصال مباشرة.
              </span>
            </div>

            {/* Preview of Formatted WhatsApp Message */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  معاينة نص الخطة بصيغة الواتساب:
                </label>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(getLessonWhatsAppText());
                    setCopiedWhatsApp(true);
                    showToast('تم نسخ نص الخطة إلى الحافظة', 'success');
                    setTimeout(() => setCopiedWhatsApp(false), 2000);
                  }}
                  className="text-xs text-teal-600 hover:text-teal-700 font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedWhatsApp ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedWhatsApp ? 'تم النسخ' : 'نسخ النص'}</span>
                </button>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 max-h-48 overflow-y-auto text-xs font-sans text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed select-all">
                {getLessonWhatsAppText()}
              </div>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleOpenDirectWhatsApp}
                className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>فتح في واتساب فوراً (مع رابط الـ PDF المنسق)</span>
              </button>

              <button
                onClick={handleSendLessonViaCloudApi}
                disabled={isSendingWhatsApp || isPreparingPdf}
                className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSendingWhatsApp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-emerald-400" />}
                <span>إرسال سحابي كملف PDF مباشر عبر Cloud API</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pedagogical Planning Assistant Modal */}
      <PedagogicalPlanningAssistantModal
        isOpen={showPedagogicalAssistant}
        onClose={() => setShowPedagogicalAssistant(false)}
        selectedLesson={selectedLesson}
        availableVisionGoals={availableVisionGoals}
        onApplyTemplateToCurrent={handleApplyConstructivistTemplate}
        onCreateNewFromTemplate={handleCreateNewLessonFromTemplate}
        onInsertProcedure={handleInsertTpsProcedure}
        initialTab={pedagogicalAssistantTab}
      />

      {/* Textbook Curriculum Index Modal */}
      {showTextbookIndexModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-right">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <TextbookCurriculumIndex
                isModal={true}
                onClose={() => setShowTextbookIndexModal(false)}
                onSelectLessonForPreparation={(preparedLesson) => {
                  setSelectedLesson(preparedLesson);
                  setLessons(prev => [preparedLesson, ...prev]);
                  setShowTextbookIndexModal(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
