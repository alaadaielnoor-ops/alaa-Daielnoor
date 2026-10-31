import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { AnnualPlan, AnnualPlanWeek, EducationalStage, Grade, Subject, Semester } from '../../types/index.ts';
import { exportUnifiedPdf, exportElementToPdf, generatePdfBlob } from '../../utils/pdfExport.ts';
import { useSchoolProfile } from '../../hooks/useSchoolProfile.ts';
import {
  CalendarRange, Plus, Search, Filter, Printer, Download,
  Trash2, Edit3, CheckCircle2, ChevronRight, BookOpen,
  Calendar, School, User, Layers, Sparkles, X, Eye, FileText,
  Send, Share2, ExternalLink, RefreshCw, Copy, Check, MessageSquare
} from 'lucide-react';

export const AnnualPlansView: React.FC = () => {
  const { showToast } = useApp();
  const {
    schoolProfile,
    schoolName,
    teacherName,
    supervisorName,
    directorateName,
    governorateName,
    countryName,
    ministryName,
    academicYear,
    semester,
    principalName,
    stampText,
    updateProfile,
    openEditModal: openSchoolProfileModal
  } = useSchoolProfile();

  const [plans, setPlans] = useState<AnnualPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<AnnualPlan | null>(null);
  const [filterStage, setFilterStage] = useState('all');
  const [filterGrade, setFilterGrade] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);

  // Taxonomy for creating new plan
  const [stages, setStages] = useState<EducationalStage[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  // Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editWeekModalOpen, setEditWeekModalOpen] = useState(false);
  const [editingWeek, setEditingWeek] = useState<{ planId: string; weekIndex: number; week: AnnualPlanWeek } | null>(null);

  // Form State
  const [newPlanForm, setNewPlanForm] = useState(() => ({
    title: '',
    academicYear: academicYear || '2026/2027 م - 1448 هـ',
    stageId: 'stg-3',
    stageName: 'التعليم ما بعد الأساسي (الصفوف 11 - 12)',
    gradeId: 'grd-12',
    gradeName: 'الصف الثاني عشر',
    subjectId: 'subj-om-1',
    subjectName: 'هذا وطني - تاريخ وجغرافية عمان',
    semesterId: 'sem-1',
    semesterName: semester || 'الفصل الدراسي الأول',
    teacherName: teacherName || 'أ. علاءالدين ضي النور محمد خليفة',
    supervisorName: supervisorName || 'أ. أحمد بن سالم البلوشي',
    schoolName: schoolName || 'مدرسة كعب بن برشة للتعليم ما بعد الأساسي (11 - 12)',
    directorateName: directorateName || 'المديرية العامة للتربية والتعليم بمحافظة شمال الباطنة',
    totalWeeks: 16,
    periodsPerWeek: 4,
    generalObjectivesText: 'ترسيخ الهوية الوطنية العمانية والاعتزاز بالإرث الحضاري والموقع الجغرافي الفريد.\nإدراك الأهمية الجيوسياسية لموقع سلطنة عمان وإشرافها على مضيق هرمز وبحر العرب.\nاستيعاب مرتكزات رؤية عمان 2040 والتنمية المستدامة وصون البيئة.\nإكساب مهارات التحليل المكاني واستخدام نظم المعلومات الجغرافية (GIS).',
    notes: 'معتمد وفق الخطة الدراسية الصادرة من وزارة التربية والتعليم للعام 2026/2027.'
  }));

  // Keep form reactive when schoolProfile changes
  useEffect(() => {
    setNewPlanForm(prev => ({
      ...prev,
      schoolName: schoolName || prev.schoolName,
      teacherName: teacherName || prev.teacherName,
      supervisorName: supervisorName || prev.supervisorName,
      directorateName: directorateName || prev.directorateName,
      academicYear: academicYear || prev.academicYear,
      semesterName: semester || prev.semesterName
    }));
  }, [schoolName, teacherName, supervisorName, directorateName, academicYear, semester]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const [plansRes, taxRes] = await Promise.all([
        api.getAnnualPlans(),
        api.getTaxonomy()
      ]);
      if (plansRes.success) {
        setPlans(plansRes.annualPlans || []);
        if (plansRes.annualPlans && plansRes.annualPlans.length > 0 && !selectedPlan) {
          setSelectedPlan(plansRes.annualPlans[0]);
        }
      }
      if (taxRes.success && taxRes.taxonomy) {
        setStages(taxRes.taxonomy.stages || []);
        setGrades(taxRes.taxonomy.grades || []);
        setSubjects(taxRes.taxonomy.subjects || []);
        setSemesters(taxRes.taxonomy.semesters || []);
      }
    } catch (err: any) {
      showToast('تعذر تحميل الخطط السنوية: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowPrintModal(false);
        setWhatsappModalOpen(false);
        setCreateModalOpen(false);
        setEditWeekModalOpen(false);
        setEditHeaderModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanForm.title.trim()) {
      showToast('يرجى كتابة عنوان الخطة', 'error');
      return;
    }

    const objectives = newPlanForm.generalObjectivesText
      .split('\n')
      .map(o => o.trim())
      .filter(Boolean);

    // Generate template weekly distribution
    const weeklyDistribution: AnnualPlanWeek[] = [];
    for (let w = 1; w <= newPlanForm.totalWeeks; w++) {
      weeklyDistribution.push({
        weekNumber: w,
        dateRange: `الأسبوع ${w}`,
        unitTitle: w <= 6 ? 'الوحدة الأولى: عمان المكان والحضارة' : w <= 11 ? 'الوحدة الثانية: الموارد والتنمية المستدامة' : 'الوحدة الثالثة: الاقتصاد ورؤية 2040',
        lessonTitle: w === 1 ? 'التهيئة وتوزيع وثيقة التقويم والمنهاج' : w === 6 ? 'مراجعة وتطبيق الاختبار القصير الأول' : w === 11 ? 'مراجعة وتطبيق الاختبار القصير الثاني' : w === 16 ? 'المراجعة الختامية ورصد الدرجات' : `الدرس ${w - 1}: المفاهيم والأنشطة التطبيقية`,
        periodsCount: newPlanForm.periodsPerWeek,
        learningOutcomes: ['استيعاب المفاهيم والمصطلحات الأساسية للدرس', 'تحليل الخرائط وتطبيق مهارات التفكير الناقد'],
        teachingStrategies: ['التعلم بالاستقصاء', 'العصف الذهني', 'خرائط المفاهيم'],
        assessmentMethods: ['الأسئلة الشفوية', 'ورقة عمل تقويمية', 'الملاحظة الصفية'],
        teachingAids: ['أطلس سلطنة عمان', 'الخرائط الجدارية', 'شاشة العرض التفاعلية'],
        notes: 'متابعة كراسة الأنشطة للطلبة.'
      });
    }

    const newPlan: Partial<AnnualPlan> = {
      title: newPlanForm.title,
      academicYear: newPlanForm.academicYear,
      stageId: newPlanForm.stageId,
      stageName: newPlanForm.stageName,
      gradeId: newPlanForm.gradeId,
      gradeName: newPlanForm.gradeName,
      subjectId: newPlanForm.subjectId,
      subjectName: newPlanForm.subjectName,
      semesterId: newPlanForm.semesterId,
      semesterName: newPlanForm.semesterName,
      teacherName: newPlanForm.teacherName,
      supervisorName: newPlanForm.supervisorName,
      schoolName: newPlanForm.schoolName,
      directorateName: newPlanForm.directorateName,
      totalWeeks: Number(newPlanForm.totalWeeks),
      periodsPerWeek: Number(newPlanForm.periodsPerWeek),
      generalObjectives: objectives,
      weeklyDistribution,
      notes: newPlanForm.notes
    };

    try {
      const res = await api.saveAnnualPlan(newPlan);
      if (res.success) {
        showToast('تم حفظ الخطة السنوية بنجاح!', 'success');
        setCreateModalOpen(false);
        await loadPlans();
        setSelectedPlan(res.annualPlan);
      }
    } catch (err: any) {
      showToast('خطأ أثناء حفظ الخطة: ' + err.message, 'error');
    }
  };

  const handleDeletePlan = async (id: string) => {
    try {
      const res = await api.deleteAnnualPlan(id);
      if (res.success) {
        showToast('تم حذف الخطة السنوية بنجاح', 'info');
        if (selectedPlan?.id === id) {
          setSelectedPlan(null);
        }
        await loadPlans();
      }
    } catch (err: any) {
      showToast('تعذر حذف الخطة: ' + err.message, 'error');
    }
  };

  const handleSaveWeekEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWeek || !selectedPlan) return;

    const updatedWeeks = [...selectedPlan.weeklyDistribution];
    updatedWeeks[editingWeek.weekIndex] = editingWeek.week;

    const updatedPlan: AnnualPlan = {
      ...selectedPlan,
      weeklyDistribution: updatedWeeks
    };

    try {
      const res = await api.saveAnnualPlan(updatedPlan);
      if (res.success) {
        setSelectedPlan(res.annualPlan);
        setPlans(prev => prev.map(p => p.id === res.annualPlan.id ? res.annualPlan : p));
        setEditWeekModalOpen(false);
        showToast('تم تحديث أسبوع الخطة بنجاح', 'success');
      }
    } catch (err: any) {
      showToast('تعذر تحديث الأسبوع: ' + err.message, 'error');
    }
  };

  const filteredPlans = plans.filter(p => {
    if (filterStage !== 'all' && p.stageId !== filterStage) return false;
    if (filterGrade !== 'all' && p.gradeId !== filterGrade) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = p.title.toLowerCase().includes(q) ||
        p.gradeName.toLowerCase().includes(q) ||
        p.subjectName.toLowerCase().includes(q) ||
        p.schoolName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const generateAnnualPlanHtml = (plan: AnnualPlan) => {
    const weeksRows = (plan.weeklyDistribution || []).map((w, idx) => `
      <tr>
        <td style="text-align: center; font-weight: bold;">${w.weekNumber || (idx + 1)}</td>
        <td style="text-align: center;">${w.dateRange || `الأسبوع ${idx + 1}`}</td>
        <td><strong>${w.unitTitle || ''}</strong></td>
        <td>${w.lessonTitle || ''}</td>
        <td style="text-align: center;">${w.periodsCount || 2}</td>
        <td>${(w.learningOutcomes || []).join('، ')}</td>
        <td>${(w.teachingStrategies || []).join('، ')}</td>
        <td>${(w.teachingAids || []).join('، ')}</td>
        <td>${(w.assessmentMethods || []).join('، ')}</td>
        <td>${w.notes || ''}</td>
      </tr>
    `).join('');

    return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <title>${plan.title} - سلطنة عمان</title>
  <style>
    @page { size: A4 landscape; margin: 10mm; }
    body { font-family: 'Cairo', Tahoma, sans-serif; direction: rtl; margin: 0; padding: 12px; font-size: 9.5pt; color: #000; }
    .header { text-align: center; border-bottom: 2px solid #047857; padding-bottom: 8px; margin-bottom: 10px; }
    .header h3 { margin: 2px 0; font-size: 11pt; color: #334155; }
    .header h2 { margin: 4px 0; font-size: 13pt; color: #065f46; font-weight: bold; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 9pt; }
    .info-table td { padding: 4px 8px; border: 1px solid #cbd5e1; background: #f8fafc; }
    .main-table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 8.5pt; }
    .main-table th { background: #065f46; color: white; padding: 6px 4px; border: 1px solid #047857; text-align: center; }
    .main-table td { padding: 4px 5px; border: 1px solid #cbd5e1; vertical-align: top; }
    .footer { margin-top: 20px; display: flex; justify-content: space-around; font-weight: bold; font-size: 9.5pt; }
  </style>
</head>
<body>
  <div class="header">
    <h3>سلطنة عمان - وزارة التربية والتعليم</h3>
    <h3>${plan.directorateName || 'المديرية العامة للتربية والتعليم بمحافظة مسقط'} - ${plan.schoolName || 'مدرسة الإمام المهنا بن سلطان'}</h3>
    <h2>${plan.title}</h2>
  </div>
  <table class="info-table">
    <tr>
      <td><strong>المادة:</strong> ${plan.subjectName}</td>
      <td><strong>الصف:</strong> ${plan.gradeName}</td>
      <td><strong>الفصل الدراسي:</strong> ${plan.semesterName}</td>
      <td><strong>العام الدراسي:</strong> ${plan.academicYear}</td>
    </tr>
    <tr>
      <td><strong>معلم المادة:</strong> ${plan.teacherName}</td>
      <td><strong>المعلم الأول:</strong> ${plan.supervisorName || 'أ. أحمد بن سالم البلوشي'}</td>
      <td><strong>الحصص أسبوعياً:</strong> ${plan.periodsPerWeek} حصص</td>
      <td><strong>إجمالي الأسابيع:</strong> ${plan.totalWeeks} أسبوعاً</td>
    </tr>
  </table>
  <table class="main-table">
    <thead>
      <tr>
        <th style="width: 25px;">الأسبوع</th>
        <th style="width: 45px;">الشهر</th>
        <th style="width: 80px;">الوحدة</th>
        <th>عنوان الدرس / المحتوى</th>
        <th style="width: 30px;">الحصص</th>
        <th>نواتج التعلم</th>
        <th>استراتيجيات التدريس</th>
        <th>الوسائل ومصادر التعلم</th>
        <th>أدوات التقويم</th>
        <th>ملاحظات</th>
      </tr>
    </thead>
    <tbody>
      ${weeksRows}
    </tbody>
  </table>
  <div class="footer" style="margin-top: 25px; display: flex; justify-content: space-around;">
    <div><strong>معلم المادة:</strong> ${plan.teacherName}</div>
    <div><strong>المعلم الأول:</strong> .....................................</div>
    <div><strong>المشرف التربوي / مدير المدرسة:</strong> .....................................</div>
  </div>
</body>
</html>`;
  };

  const handlePrintPlan = () => {
    if (!selectedPlan) return;
    setShowPrintModal(true);
  };

  const handleExecutePrintPlan = () => {
    if (!selectedPlan) return;
    try {
      const html = generateAnnualPlanHtml(selectedPlan);
      const printWin = window.open('', '_blank');
      if (printWin) {
        printWin.document.open();
        printWin.document.write(html);
        printWin.document.close();
        printWin.focus();
        setTimeout(() => {
          try {
            printWin.print();
          } catch (_) {}
        }, 400);
      } else {
        handleDownloadPrintableHtmlPlan();
      }
    } catch (_) {
      handleDownloadPrintableHtmlPlan();
    }
  };

  const handleDownloadPrintableHtmlPlan = () => {
    if (!selectedPlan) return;
    const html = generateAnnualPlanHtml(selectedPlan);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanTitle = selectedPlan.title.replace(/[/\\?%*:|"<>]/g, '_');
    a.download = `الخطة_السنوية_${cleanTitle}_للطباعة.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('📄 تم تنزيل صفحة الخطة السنوية المستقلة! يمكنك فتحها والضغط على Ctrl+P للطباعة المباشرة.', 'success');
  };

  const handleExportWordPlan = () => {
    if (!selectedPlan) return;
    const html = generateAnnualPlanHtml(selectedPlan);
    const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanTitle = selectedPlan.title.replace(/[/\\?%*:|"<>]/g, '_');
    a.download = `الخطة_السنوية_${cleanTitle}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('تم تحميل الخطة السنوية بنجاح كملف Word قابل للتعديل والطباعة! 📄', 'success');
  };

  const planRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Edit Header Modal State
  const [editHeaderModalOpen, setEditHeaderModalOpen] = useState(false);
  const [headerForm, setHeaderForm] = useState({
    title: '',
    schoolName: '',
    directorateName: '',
    academicYear: '',
    semesterName: '',
    subjectName: '',
    gradeName: '',
    teacherName: '',
    supervisorName: '',
    cascadeToProfile: true
  });
  const [savingHeader, setSavingHeader] = useState(false);

  // WhatsApp Share Modal & PDF State
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [recipientPhone, setRecipientPhone] = useState(
    () => localStorage.getItem('om_edu_wa_recipient_phone') || '+96877394680'
  );
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
  const [isPreparingPdf, setIsPreparingPdf] = useState(false);

  const handleOpenEditHeader = () => {
    if (!selectedPlan) return;
    setHeaderForm({
      title: selectedPlan.title || '',
      schoolName: selectedPlan.schoolName || schoolName,
      directorateName: selectedPlan.directorateName || directorateName,
      academicYear: selectedPlan.academicYear || academicYear,
      semesterName: selectedPlan.semesterName || semester,
      subjectName: selectedPlan.subjectName || 'هذا وطني - تاريخ وجغرافية عمان',
      gradeName: selectedPlan.gradeName || 'الصف الثاني عشر',
      teacherName: selectedPlan.teacherName || teacherName,
      supervisorName: selectedPlan.supervisorName || supervisorName,
      cascadeToProfile: true
    });
    setEditHeaderModalOpen(true);
  };

  const handleSaveHeader = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setSavingHeader(true);
    try {
      const updated: AnnualPlan = {
        ...selectedPlan,
        title: headerForm.title.trim(),
        schoolName: headerForm.schoolName.trim(),
        directorateName: headerForm.directorateName.trim(),
        academicYear: headerForm.academicYear.trim(),
        semesterName: headerForm.semesterName.trim(),
        subjectName: headerForm.subjectName.trim(),
        gradeName: headerForm.gradeName.trim(),
        teacherName: headerForm.teacherName.trim(),
        supervisorName: headerForm.supervisorName.trim(),
        updatedAt: new Date().toISOString()
      };

      const res = await api.saveAnnualPlan(updated);
      if (res.success) {
        setSelectedPlan(updated);
        setPlans(prev => prev.map(p => p.id === updated.id ? updated : p));
        showToast('تم تحديث وحفظ بيانات ترويسة الخطة السنوية بنجاح! 📅', 'success');

        if (headerForm.cascadeToProfile) {
          try {
            await updateProfile({
              schoolName: headerForm.schoolName.trim(),
              directorateName: headerForm.directorateName.trim(),
              academicYear: headerForm.academicYear.trim(),
              teacherName: headerForm.teacherName.trim(),
              supervisorName: headerForm.supervisorName.trim(),
              semester: headerForm.semesterName.trim()
            }, true);
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

  const handleExportPlanToPdf = async () => {
    if (!planRef.current || !selectedPlan) return;
    setIsExportingPdf(true);
    try {
      const cleanTitle = selectedPlan.title.replace(/[/\\?%*:|"<>]/g, '_');
      const filename = `الخطة_السنوية_${cleanTitle}.pdf`;
      const res = await exportUnifiedPdf(planRef.current, {
        filename,
        orientation: 'landscape',
        scale: 2,
        addPageNumbers: true,
        title: selectedPlan.title,
        hideSelectors: ['.no-print', '[data-no-print]', 'button']
      });
      if (res.success) {
        if (res.viewerUrl || res.fullUrl) {
          setGeneratedPdfUrl(res.viewerUrl || res.fullUrl || null);
        }
        showToast('📄 تم تصدير الخطة السنوية كملف PDF عالي الدقة بنجاح!', 'success');
      } else {
        showToast('تعذر تصدير الخطة إلى PDF: ' + (res.error || ''), 'error');
      }
    } catch (err: any) {
      showToast('خطأ أثناء تصدير PDF: ' + err.message, 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const preparePdfForWhatsApp = async (): Promise<string | null> => {
    if (!planRef.current || !selectedPlan) return null;
    setIsPreparingPdf(true);
    try {
      const cleanTitle = selectedPlan.title.replace(/[/\\?%*:|"<>]/g, '_');
      const filename = `الخطة_السنوية_${cleanTitle}.pdf`;
      const pdfRes = await generatePdfBlob(planRef.current, { filename, orientation: 'landscape', scale: 2 });
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
          showToast('📄 تم توليد ملف الـ PDF وتجهيزه للمشاركة بجودة عالية!', 'success');
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

  const getPlanWhatsAppText = (customPdfUrl?: string) => {
    if (!selectedPlan) return '';
    const activePdfLink = customPdfUrl || generatedPdfUrl;

    let text = `🇴🇲 *سلطنة عُمان - وزارة التربية والتعليم*\n`;
    text += `🏛️ *${selectedPlan.directorateName || 'المديرية العامة للتربية والتعليم بمحافظة مسقط'}*\n`;
    text += `🏫 *${selectedPlan.schoolName || 'مدرسة كعب بن برشة للتعليم ما بعد الأساسي'}*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📅 *وثيقة معتمدة: الخطة الفصلية والتوزيع الزمني للمنهاج*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    text += `📋 *عنوان الخطة:* ${selectedPlan.title}\n`;
    text += `📖 *المادة:* ${selectedPlan.subjectName} | 🎓 *الصف:* ${selectedPlan.gradeName}\n`;
    text += `🗓️ *العام الدراسي:* ${selectedPlan.academicYear} | *الفصل:* ${selectedPlan.semesterName}\n`;
    text += `👩‍🏫 *معلم المادة:* ${selectedPlan.teacherName}\n`;
    text += `🕵️ *المشرف التربوي:* ${selectedPlan.supervisorName || 'معتمد'}\n`;
    text += `⏱️ *نصاب التدريس:* ${selectedPlan.totalWeeks} أسبوعاً (${selectedPlan.periodsPerWeek} حصص أسبوعياً)\n\n`;

    if (selectedPlan.generalObjectives && selectedPlan.generalObjectives.length > 0) {
      text += `🎯 *أبرز الأهداف والمخرجات العامة للمنهاج:*\n`;
      selectedPlan.generalObjectives.slice(0, 4).forEach((obj, idx) => {
        text += ` ${idx + 1}️⃣ ${obj}\n`;
      });
      text += `\n`;
    }

    text += `📑 *مصفوفة توزيع المنهاج والوحدات الدراسية:*\n`;
    selectedPlan.weeklyDistribution.slice(0, 7).forEach(w => {
      text += `▪️ *الأسبوع ${w.weekNumber}:* ${w.lessonTitle} (${w.periodsCount} حصص) - [${w.unitTitle}]\n`;
    });
    if (selectedPlan.weeklyDistribution.length > 7) {
      text += `▪️ ... وبقية أسابيع الفصل حتى الأسبوع ${selectedPlan.weeklyDistribution.length} كاملة في الوثيقة المرفقة.\n`;
    }

    if (activePdfLink) {
      text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
      text += `📄 *وثيقة الخطة الكاملة بصيغة PDF (تنسيق الجداول والألوان والترويسة طبق الأصل من المكتبة الذكية):*\n`;
      text += `📥 *اضغط للاستعراض والتحميل المباشر:*\n`;
      text += `🔗 ${activePdfLink}\n`;
    }

    text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    text += `✅ *معتمد رسمياً وفق المعايير والأنصبة الوزارية لسلطنة عُمان 🇴🇲*\n`;
    text += `✨ تم التصدير عبر نظام التخطيط التربوي الذكي - المكتبة الذكية`;
    return text;
  };

  const handleOpenDirectWhatsApp = async () => {
    let pdfLink = generatedPdfUrl;
    if (!pdfLink) {
      pdfLink = await preparePdfForWhatsApp();
    }
    const text = getPlanWhatsAppText(pdfLink || undefined);
    let url = '';
    const cleanNumber = recipientPhone.replace(/\D/g, '');
    if (cleanNumber) {
      url = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(text)}`;
    } else {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    }
    window.open(url, '_blank');
  };

  const handleSendPlanViaCloudApi = async () => {
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

      const cleanTitle = (selectedPlan?.title || 'خطة_سنوية').replace(/[/\\?%*:|"<>]/g, '_');
      const res = await api.dispatchAnnualPlanToWhatsApp({
        toPhone: recipientPhone.trim(),
        planId: selectedPlan?.id,
        planData: selectedPlan,
        pdfUrl: pdfUrlToUse || undefined,
        pdfFilename: `الخطة_السنوية_${cleanTitle}.pdf`
      });

      if (res.success) {
        showToast('تم إرسال الخطة كملف PDF رسمي إلى الواتساب بنجاح 📲', 'success');
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-emerald-900 via-teal-900 to-slate-900 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 text-xs font-semibold mb-3">
            <School className="w-3.5 h-3.5 text-amber-300" />
            <span>وزارة التربية والتعليم - سلطنة عمان</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black mb-2 tracking-tight">
            الخطط السنوية والفصلية لتوزيع المناهج
          </h1>
          <p className="text-slate-200 text-sm md:text-base leading-relaxed">
            إعداد وتوزيع مناهج الدراسات الاجتماعية والجغرافيا وفق الخطط الدراسية المعتمدة للمديريات التعليمية بسلطنة عمان، مع تحديد نواتج التعلم واستراتيجيات التدريس والوسائل وأدوات التقويم المستمر مع إمكانية التصدير والطباعة الرسمية.
          </p>

          <div className="flex flex-wrap gap-2.5 mt-5">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إعداد خطة سنوية جديدة</span>
            </button>
            {selectedPlan && (
              <>
                <button
                  onClick={handleExportPlanToPdf}
                  disabled={isExportingPdf}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
                  title="تحويل الخطة السنوية إلى ملف PDF عالي الدقة"
                >
                  {isExportingPdf ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span>تحويل إلى ملف PDF 📄</span>
                </button>
                <button
                  onClick={handleOpenEditHeader}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 backdrop-blur-xs transition cursor-pointer"
                  title="تعديل بيانات المدرسة والترويسة أعلى الخطة"
                >
                  <Edit3 className="w-4 h-4 text-teal-300" />
                  <span>تعديل الترويسة ✏️</span>
                </button>
                <button
                  onClick={handleExportPlanToPdf}
                  disabled={isExportingPdf}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition cursor-pointer disabled:opacity-50"
                  title="تصدير الخطة السنوية كملف PDF عالي الجودة"
                >
                  {isExportingPdf ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span>تصدير PDF</span>
                </button>
                <button
                  onClick={handlePrintPlan}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 backdrop-blur-xs transition cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-amber-300" />
                  <span>معاينة وطباعة الخطة 🖨️</span>
                </button>
                <button
                  onClick={handleExportWordPlan}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700/60 hover:bg-teal-700 text-white font-semibold text-xs border border-teal-500/30 transition cursor-pointer"
                >
                  <Download className="w-4 h-4 text-teal-200" />
                  <span>تصدير Word (.doc)</span>
                </button>
                <button
                  onClick={() => setWhatsappModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition cursor-pointer shadow-sm"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-200" />
                  <span>إرسال عبر واتساب 📲</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Ambient watermark background */}
        <div className="absolute left-6 -bottom-10 opacity-10 pointer-events-none">
          <CalendarRange className="w-64 h-64 text-teal-300" />
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Sidebar List (4 cols) */}
        <div className="lg:col-span-4 space-y-4 print:hidden">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="بحث في الخطط السنوية..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pr-9 pl-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">المرحلة:</label>
                <select
                  value={filterStage}
                  onChange={e => setFilterStage(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="all">جميع المراحل</option>
                  {stages.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">الصف:</label>
                <select
                  value={filterGrade}
                  onChange={e => setFilterGrade(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="all">جميع الصفوف (1 - 12)</option>
                  {grades.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Plans List */}
          <div className="space-y-2.5">
            {filteredPlans.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 text-center border border-slate-200 dark:border-slate-800">
                <CalendarRange className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">لا توجد خطط مطابقة لمعايير البحث</p>
              </div>
            ) : (
              filteredPlans.map(plan => {
                const isSelected = selectedPlan?.id === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`p-4 rounded-2xl border cursor-pointer transition text-right ${
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        {plan.gradeName}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500">
                        {plan.semesterName}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 line-clamp-2">
                      {plan.title}
                    </h3>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span>{plan.teacherName}</span>
                      <span className="font-semibold text-teal-600 dark:text-teal-400">
                        {plan.weeklyDistribution?.length || plan.totalWeeks} أسبوعاً
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Plan Detail (8 cols) - Printable view */}
        <div className="lg:col-span-8">
          {selectedPlan ? (
            <div ref={planRef} className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm print:p-0 print:border-none print:shadow-none space-y-6">
              {/* Quick Edit Header Bar (Interactive above official annual plan document) */}
              <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-200 dark:border-slate-800 print:hidden text-xs">
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-bold">ترويسة وثيقة التوزيع الزمني والمنهجي المعتمدة - سلطنة عمان</span>
                </div>
                <button
                  onClick={handleOpenEditHeader}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold transition cursor-pointer"
                  title="تعديل اسم المدرسة، المديرية، العام الدراسي، والمعلم أعلى الصفحة"
                >
                  <Edit3 className="w-3.5 h-3.5 text-teal-600" />
                  <span>تعديل بيانات الترويسة العلوية ✏️</span>
                </button>
              </div>

              {/* Official Ministry Header */}
              <div className="border-b-2 border-slate-800 pb-5 text-center">
                <div className="flex items-center justify-between mb-3 text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300">
                  <div className="text-right">
                    <p className="text-slate-900 dark:text-white font-extrabold text-sm md:text-base">سلطنة عمان</p>
                    <p>وزارة التربية والتعليم</p>
                    <p>{selectedPlan.directorateName}</p>
                    <p className="text-teal-700 dark:text-teal-400 font-semibold">{selectedPlan.schoolName}</p>
                  </div>

                  {/* Emblem / Logo */}
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-teal-800 text-amber-300 flex items-center justify-center shadow-md">
                      <School className="w-8 h-8" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 mt-1">وثيقة التوزيع المنهجي</span>
                  </div>

                  <div className="text-left">
                    <p>العام الدراسي: <span className="font-semibold">{selectedPlan.academicYear}</span></p>
                    <p>الفصل: <span className="font-semibold">{selectedPlan.semesterName}</span></p>
                    <p>المادة: <span className="font-semibold">{selectedPlan.subjectName}</span></p>
                    <p>الصف: <span className="font-semibold">{selectedPlan.gradeName}</span></p>
                  </div>
                </div>

                <h2 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                  {selectedPlan.title}
                </h2>
              </div>

              {/* Plan Metadata Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">معلم المادة:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedPlan.teacherName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">المشرف التربوي:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedPlan.supervisorName || 'أحمد بن سالم البلوشي'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">نصاب الحصص الأسبوعي:</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">{selectedPlan.periodsPerWeek} حصص أسبوعياً</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">إجمالي الأسابيع الفعلية:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedPlan.totalWeeks} أسبوعاً تدريسياً</span>
                </div>
              </div>

              {/* General Objectives */}
              {selectedPlan.generalObjectives && selectedPlan.generalObjectives.length > 0 && (
                <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/50 dark:border-teal-800/40">
                  <h4 className="text-xs font-bold text-teal-900 dark:text-teal-300 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    الأهداف والمخرجات العامة للمنهاج:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed pr-1">
                    {selectedPlan.generalObjectives.map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weekly Distribution Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right border-collapse border border-slate-200 dark:border-slate-700">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-300 dark:border-slate-700">
                      <th className="p-2.5 border border-slate-200 dark:border-slate-700 w-16 text-center">الأسبوع</th>
                      <th className="p-2.5 border border-slate-200 dark:border-slate-700 w-36">الوحدة الدراسية</th>
                      <th className="p-2.5 border border-slate-200 dark:border-slate-700">الدرس والمحتوى التعليمي</th>
                      <th className="p-2.5 border border-slate-200 dark:border-slate-700 w-14 text-center">الحصص</th>
                      <th className="p-2.5 border border-slate-200 dark:border-slate-700">مخرجات التعلم</th>
                      <th className="p-2.5 border border-slate-200 dark:border-slate-700">الاستراتيجيات</th>
                      <th className="p-2.5 border border-slate-200 dark:border-slate-700">أدوات التقويم</th>
                      <th className="p-2.5 border border-slate-200 dark:border-slate-700">الوسائل والتقنيات</th>
                      <th className="p-2.5 border border-slate-200 dark:border-slate-700 print:hidden w-12 text-center">تعديل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {(selectedPlan.weeklyDistribution || []).map((w, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="p-2 border border-slate-200 dark:border-slate-700 text-center font-bold text-teal-700 dark:text-teal-400">
                          {w.weekNumber}
                          {w.dateRange && (
                            <span className="block text-[9px] font-normal text-slate-400 mt-0.5">{w.dateRange}</span>
                          )}
                        </td>
                        <td className="p-2 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100">
                          {w.unitTitle}
                        </td>
                        <td className="p-2 border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200">
                          {w.lessonTitle}
                        </td>
                        <td className="p-2 border border-slate-200 dark:border-slate-700 text-center font-bold">
                          {w.periodsCount}
                        </td>
                        <td className="p-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                          <ul className="list-disc list-inside space-y-0.5">
                            {(Array.isArray(w.learningOutcomes) ? w.learningOutcomes : [w.learningOutcomes || '']).map((lo, i) => (
                              <li key={i}>{lo}</li>
                            ))}
                          </ul>
                        </td>
                        <td className="p-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                          {Array.isArray(w.teachingStrategies) ? w.teachingStrategies.join('، ') : (w.teachingStrategies || '')}
                        </td>
                        <td className="p-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                          {Array.isArray(w.assessmentMethods) ? w.assessmentMethods.join('، ') : (w.assessmentMethods || '')}
                        </td>
                        <td className="p-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                          {Array.isArray(w.teachingAids) ? w.teachingAids.join('، ') : (w.teachingAids || '')}
                        </td>
                        <td className="p-2 border border-slate-200 dark:border-slate-700 text-center print:hidden">
                          <button
                            onClick={() => {
                              setEditingWeek({ planId: selectedPlan.id, weekIndex: idx, week: { ...w } });
                              setEditWeekModalOpen(true);
                            }}
                            className="p-1 hover:bg-teal-50 text-teal-600 rounded-md"
                            title="تعديل مفردات الأسبوع"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Notes */}
              {selectedPlan.notes && (
                <div className="text-xs text-slate-500 italic p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <strong>ملاحظات وتوجيهات:</strong> {selectedPlan.notes}
                </div>
              )}

              {/* Official Signatures Block (Footer) */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-700 grid grid-cols-4 gap-4 text-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                <div className="space-y-6">
                  <p>معلم المادة</p>
                  <p className="text-slate-500 font-normal">{selectedPlan.teacherName}</p>
                  <p className="text-[10px] text-slate-400">التوقيع: .....................</p>
                </div>
                <div className="space-y-6">
                  <p>المعلم الأول للمادة</p>
                  <p className="text-slate-500 font-normal">.................................</p>
                  <p className="text-[10px] text-slate-400">التوقيع: .....................</p>
                </div>
                <div className="space-y-6">
                  <p>المشرف التربوي</p>
                  <p className="text-slate-500 font-normal">{selectedPlan.supervisorName || 'أحمد بن سالم البلوشي'}</p>
                  <p className="text-[10px] text-slate-400">التوقيع: .....................</p>
                </div>
                <div className="space-y-6">
                  <p>يعتمد مدير المدرسة</p>
                  <p className="text-slate-500 font-normal">.................................</p>
                  <p className="text-[10px] text-slate-400">الختم والتوقيع: .....................</p>
                </div>
              </div>

              {/* Delete / Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 print:hidden">
                <button
                  onClick={() => handleDeletePlan(selectedPlan.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف هذه الخطة</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
              <CalendarRange className="w-16 h-16 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">اختر خطة سنوية لعرضها</h3>
              <p className="text-xs text-slate-400 mt-1">أو اضغط على زر "إعداد خطة سنوية جديدة" للبدء في تصميم خطة دراسية معتمدة.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Plan */}
      {createModalOpen && (
        <div 
          onClick={e => { if (e.target === e.currentTarget) setCreateModalOpen(false); }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarRange className="w-5 h-5 text-teal-600" />
                إعداد وتوليد خطة سنوية وفصلية جديدة
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  عنوان الخطة السنوية / الفصلية: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: الخطة الفصلية لتوزيع منهاج الدراسات الاجتماعية - الصف التاسع"
                  value={newPlanForm.title}
                  onChange={e => setNewPlanForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">المرحلة الدراسية:</label>
                  <select
                    value={newPlanForm.stageId}
                    onChange={e => {
                      const st = stages.find(s => s.id === e.target.value);
                      setNewPlanForm(prev => ({ ...prev, stageId: e.target.value, stageName: st?.name || '' }));
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    {stages.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">الصف الدراسي (1 - 12):</label>
                  <select
                    value={newPlanForm.gradeId}
                    onChange={e => {
                      const gr = grades.find(g => g.id === e.target.value);
                      setNewPlanForm(prev => ({ ...prev, gradeId: e.target.value, gradeName: gr?.name || '' }));
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    {grades.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">المادة الدراسية:</label>
                  <select
                    value={newPlanForm.subjectId}
                    onChange={e => {
                      const sub = subjects.find(s => s.id === e.target.value);
                      setNewPlanForm(prev => ({ ...prev, subjectId: e.target.value, subjectName: sub?.name || '' }));
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    {subjects.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">الفصل الدراسي:</label>
                  <select
                    value={newPlanForm.semesterId}
                    onChange={e => {
                      const sem = semesters.find(s => s.id === e.target.value);
                      setNewPlanForm(prev => ({ ...prev, semesterId: e.target.value, semesterName: sem?.name || '' }));
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    {semesters.map(sem => (
                      <option key={sem.id} value={sem.id}>{sem.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">العام الدراسي:</label>
                  <input
                    type="text"
                    value={newPlanForm.academicYear}
                    onChange={e => setNewPlanForm(prev => ({ ...prev, academicYear: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">اسم المعلم:</label>
                  <input
                    type="text"
                    value={newPlanForm.teacherName}
                    onChange={e => setNewPlanForm(prev => ({ ...prev, teacherName: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">المدرسة:</label>
                  <input
                    type="text"
                    value={newPlanForm.schoolName}
                    onChange={e => setNewPlanForm(prev => ({ ...prev, schoolName: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">المديرية التعليمية:</label>
                  <input
                    type="text"
                    value={newPlanForm.directorateName}
                    onChange={e => setNewPlanForm(prev => ({ ...prev, directorateName: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">عدد أسابيع الفصل:</label>
                  <input
                    type="number"
                    min="8"
                    max="20"
                    value={newPlanForm.totalWeeks}
                    onChange={e => setNewPlanForm(prev => ({ ...prev, totalWeeks: Number(e.target.value) }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">الحصص أسبوعياً:</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newPlanForm.periodsPerWeek}
                    onChange={e => setNewPlanForm(prev => ({ ...prev, periodsPerWeek: Number(e.target.value) }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  الأهداف والمخرجات العامة (سطر لكل هدف):
                </label>
                <textarea
                  rows={3}
                  value={newPlanForm.generalObjectivesText}
                  onChange={e => setNewPlanForm(prev => ({ ...prev, generalObjectivesText: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">ملاحظات واعتماد:</label>
                <input
                  type="text"
                  value={newPlanForm.notes}
                  onChange={e => setNewPlanForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition"
                >
                  توليد وحفظ الخطة السنوية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Week */}
      {editWeekModalOpen && editingWeek && (
        <div 
          onClick={e => { if (e.target === e.currentTarget) setEditWeekModalOpen(false); }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4 text-right text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white">
                تعديل الأسبوع ({editingWeek.week.weekNumber})
              </h3>
              <button onClick={() => setEditWeekModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveWeekEdit} className="space-y-3">
              <div>
                <label className="block font-medium mb-1">عنوان الوحدة:</label>
                <input
                  type="text"
                  value={editingWeek.week.unitTitle}
                  onChange={e => setEditingWeek({
                    ...editingWeek,
                    week: { ...editingWeek.week, unitTitle: e.target.value }
                  })}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">الدرس والمحتوى:</label>
                <input
                  type="text"
                  value={editingWeek.week.lessonTitle}
                  onChange={e => setEditingWeek({
                    ...editingWeek,
                    week: { ...editingWeek.week, lessonTitle: e.target.value }
                  })}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">الفترة الزمنية / التاريخ:</label>
                  <input
                    type="text"
                    value={editingWeek.week.dateRange || ''}
                    onChange={e => setEditingWeek({
                      ...editingWeek,
                      week: { ...editingWeek.week, dateRange: e.target.value }
                    })}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">عدد الحصص:</label>
                  <input
                    type="number"
                    value={editingWeek.week.periodsCount}
                    onChange={e => setEditingWeek({
                      ...editingWeek,
                      week: { ...editingWeek.week, periodsCount: Number(e.target.value) }
                    })}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">مخرجات ونواتج التعلم (افصل بينها بفاصلة):</label>
                <input
                  type="text"
                  value={editingWeek.week.learningOutcomes.join('، ')}
                  onChange={e => setEditingWeek({
                    ...editingWeek,
                    week: {
                      ...editingWeek.week,
                      learningOutcomes: e.target.value.split('،').map(s => s.trim()).filter(Boolean)
                    }
                  })}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">الاستراتيجيات المقترحة (افصل بينها بفاصلة):</label>
                <input
                  type="text"
                  value={editingWeek.week.teachingStrategies.join('، ')}
                  onChange={e => setEditingWeek({
                    ...editingWeek,
                    week: {
                      ...editingWeek.week,
                      teachingStrategies: e.target.value.split('،').map(s => s.trim()).filter(Boolean)
                    }
                  })}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">أدوات وأساليب التقويم:</label>
                <input
                  type="text"
                  value={editingWeek.week.assessmentMethods.join('، ')}
                  onChange={e => setEditingWeek({
                    ...editingWeek,
                    week: {
                      ...editingWeek.week,
                      assessmentMethods: e.target.value.split('،').map(s => s.trim()).filter(Boolean)
                    }
                  })}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">الوسائل التعليمية والتقنيات:</label>
                <input
                  type="text"
                  value={editingWeek.week.teachingAids.join('، ')}
                  onChange={e => setEditingWeek({
                    ...editingWeek,
                    week: {
                      ...editingWeek.week,
                      teachingAids: e.target.value.split('،').map(s => s.trim()).filter(Boolean)
                    }
                  })}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditWeekModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-500 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-lg bg-teal-600 text-white font-bold"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Annual Plan Print & Export Modal */}
      {showPrintModal && selectedPlan && (
        <div 
          onClick={e => { if (e.target === e.currentTarget) setShowPrintModal(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
        >
          <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    معاينة وطباعة الخطة السنوية والفصلية
                  </h3>
                  <p className="text-xs text-slate-500">
                    النموذج الرسمي المعتمد لتوزيع المنهج بوزارة التربية والتعليم بسلطنة عمان 🇴🇲
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
                خيارات الطباعة والتصدير:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleExecutePrintPlan}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold shadow-sm transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة الخطة مباشرة</span>
                </button>

                <button
                  onClick={handleDownloadPrintableHtmlPlan}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition cursor-pointer shadow-xs"
                  title="تنزيل صفحة HTML مستقلة تفتح في المتصفح وتطبع بدون قيود"
                >
                  <Download className="w-4 h-4 text-sky-600" />
                  <span>تحميل صفحة الطباعة المستقلة (HTML)</span>
                </button>

                <button
                  onClick={handleExportWordPlan}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition cursor-pointer shadow-xs"
                >
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>تصدير Word (.doc)</span>
                </button>

                <button
                  onClick={() => {
                    setShowPrintModal(false);
                    setWhatsappModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>إرسال كملف PDF إلى واتسابي 📲</span>
                </button>
              </div>
            </div>

            {/* Document Preview Area (Isolated in Iframe) */}
            <div className="flex-1 overflow-hidden p-4 md:p-6 bg-slate-100/70 dark:bg-slate-950/60 flex flex-col min-h-[500px]">
              <iframe
                srcDoc={generateAnnualPlanHtml(selectedPlan)}
                title={selectedPlan.title}
                className="w-full flex-1 min-h-[480px] border border-slate-200 dark:border-slate-800 rounded-2xl bg-white shadow-md"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                💡 الخطة مهيأة للطباعة بالعرض (A4 Landscape) وفق اشتراطات التوجيه الفني بسلطنة عمان.
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

      {/* Modal: Edit Annual Plan Header (الترويسة العلوية للخطة السنوية) */}
      {editHeaderModalOpen && (
        <div 
          onClick={e => { if (e.target === e.currentTarget) setEditHeaderModalOpen(false); }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 text-right text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    تعديل بيانات وترويسة الخطة السنوية والفصلية
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    تخصيص اسم المدرسة، المديرية، العام الدراسي، والمعلم أعلى الصفحة
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
                  عنوان وثيقة الخطة:
                </label>
                <input
                  type="text"
                  required
                  value={headerForm.title}
                  onChange={e => setHeaderForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                />
              </div>

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
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
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
                    الصف الدراسي:
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
                    المشرف التربوي:
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

              <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="cascadePlanToProfile"
                  checked={headerForm.cascadeToProfile}
                  onChange={e => setHeaderForm(prev => ({ ...prev, cascadeToProfile: e.target.checked }))}
                  className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <label htmlFor="cascadePlanToProfile" className="text-[11px] text-teal-900 dark:text-teal-200 cursor-pointer select-none">
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

      {/* WhatsApp Share Modal with PDF Attachment */}
      {whatsappModalOpen && selectedPlan && (
        <div 
          onClick={e => { if (e.target === e.currentTarget) setWhatsappModalOpen(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    إرسال الخطة السنوية عبر واتساب 📲
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
                <span>مرفق ملف PDF معتمد يحمل نفس الجداول والألوان والترويسة</span>
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
                    navigator.clipboard.writeText(getPlanWhatsAppText());
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
                {getPlanWhatsAppText()}
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
                onClick={handleSendPlanViaCloudApi}
                disabled={isSendingWhatsApp || isPreparingPdf}
                className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSendingWhatsApp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-emerald-400" />}
                <span>{isSendingWhatsApp ? 'جاري إرسال المستند...' : 'إرسال كملف PDF عبر Meta Cloud API 🚀'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
