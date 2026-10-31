import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { exportUnifiedPdf } from '../../utils/pdfExport.ts';
import { useSchoolProfile } from '../../hooks/useSchoolProfile.ts';
import {
  EducationalCalendarEvent,
  CalendarEventType,
  CalendarEventPriority,
  CalendarEventStatus,
  Grade,
  Subject
} from '../../types/index.ts';
import {
  CalendarCheck, Calendar as CalendarIcon, Clock, MapPin, Plus, Printer,
  Download, Share2, CheckCircle2, Circle, AlertCircle, Trash2, Edit3,
  Filter, ChevronRight, ChevronLeft, Sparkles, MessageSquare, Send,
  Bookmark, Check, ExternalLink, School, Compass, Layers, AlertTriangle,
  RefreshCw, FileText
} from 'lucide-react';

const EVENT_TYPE_CONFIG: Record<CalendarEventType, { label: string; color: string; bgLight: string; borderColor: string; icon: string }> = {
  exam: {
    label: 'اختبار مقنن / تقويم',
    color: 'text-rose-700 dark:text-rose-300',
    bgLight: 'bg-rose-50 dark:bg-rose-950/40',
    borderColor: 'border-rose-200 dark:border-rose-800',
    icon: '📝'
  },
  activity: {
    label: 'نشاط / تطبيق عملي',
    color: 'text-sky-700 dark:text-sky-300',
    bgLight: 'bg-sky-50 dark:bg-sky-950/40',
    borderColor: 'border-sky-200 dark:border-sky-800',
    icon: '🎨'
  },
  task: {
    label: 'مهمة / تسليم مشروع',
    color: 'text-amber-700 dark:text-amber-300',
    bgLight: 'bg-amber-50 dark:bg-amber-950/40',
    borderColor: 'border-amber-200 dark:border-amber-800',
    icon: '📌'
  },
  ministry_event: {
    label: 'مناسبة وزارية / وطنية',
    color: 'text-emerald-700 dark:text-emerald-300',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    icon: '🏛️'
  },
  lesson: {
    label: 'حصة دراسية معتمدة',
    color: 'text-teal-700 dark:text-teal-300',
    bgLight: 'bg-teal-50 dark:bg-teal-950/40',
    borderColor: 'border-teal-200 dark:border-teal-800',
    icon: '📖'
  }
};

const PRIORITY_CONFIG: Record<CalendarEventPriority, { label: string; badgeClass: string }> = {
  urgent: { label: 'عاجل جداً', badgeClass: 'bg-rose-600 text-white font-bold' },
  high: { label: 'أولوية مرتفعة', badgeClass: 'bg-orange-500 text-white font-medium' },
  medium: { label: 'أولوية متوسطة', badgeClass: 'bg-blue-500 text-white font-medium' },
  low: { label: 'عادية', badgeClass: 'bg-slate-400 text-white font-normal' }
};

const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export const EducationalCalendarView: React.FC = () => {
  const { showToast, currentUser } = useApp();
  const {
    schoolProfile,
    schoolName,
    teacherName,
    supervisorName,
    governorateName,
    directorateName,
    countryName,
    ministryName,
    academicYear,
    semester,
    principalName,
    stampText,
    openEditModal: openSchoolProfileModal
  } = useSchoolProfile();

  const [events, setEvents] = useState<EducationalCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'month' | 'agenda' | 'print'>('month');

  // Month navigation (current year & month)
  const [currentDate, setCurrentDate] = useState(() => new Date());

  // Filters
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EducationalCalendarEvent | null>(null);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [recipientPhone, setRecipientPhone] = useState(
    () => localStorage.getItem('om_edu_wa_recipient_phone') || '+96877394680'
  );
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<EducationalCalendarEvent>>({
    title: '',
    type: 'exam',
    subjectName: 'هذا وطني - تاريخ وجغرافية عمان',
    gradeName: 'الصف الثاني عشر',
    section: '12/1',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endDate: new Date().toISOString().split('T')[0],
    endTime: '09:00',
    allDay: false,
    location: 'قاعة الجغرافيا',
    description: '',
    priority: 'high',
    status: 'pending',
    reminderMinutes: 1440,
    vision2040Pillar: 'جودة التعليم والتعلم'
  });

  // Selected Day in Month View
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ dateStr: string; events: EducationalCalendarEvent[] } | null>(null);

  // Load calendar events
  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await api.getCalendarEvents();
      if (res.success && res.events) {
        setEvents(res.events);
      }
    } catch (err: any) {
      showToast('تعذر تحميل بيانات التقويم التربوي', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (selectedType !== 'all' && e.type !== selectedType) return false;
      if (selectedGrade !== 'all' && e.gradeName && !e.gradeName.includes(selectedGrade)) return false;
      if (selectedStatus !== 'all' && e.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = e.title.toLowerCase().includes(q);
        const matchDesc = (e.description || '').toLowerCase().includes(q);
        const matchSubject = (e.subjectName || '').toLowerCase().includes(q);
        const matchLocation = (e.location || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchSubject && !matchLocation) return false;
      }
      return true;
    });
  }, [events, selectedType, selectedGrade, selectedStatus, searchQuery]);

  // Print & PDF Export State & Ref
  const calendarPrintRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const generateCalendarPrintableHtml = () => {
    const school = schoolProfile.schoolName || 'مدرسة كعب بن برشة للتعليم الأساسي';
    const directorate = schoolProfile.directorateName || 'المديرية العامة للتربية والتعليم بمحافظة مسقط';
    const academicYear = schoolProfile.academicYear || '2026/2027 م - 1448 هـ';
    const teacher = currentUser.name || schoolProfile.teacherName || 'أ. المعلم';
    const supervisor = schoolProfile.supervisorName || schoolProfile.firstTeacherName || 'المعلم الأول';
    const principal = schoolProfile.principalName || 'مدير المدرسة';

    const rows = filteredEvents.map((ev, idx) => `
      <tr>
        <td style="text-align: center; font-weight: bold; padding: 6px; border: 1px solid #94a3b8;">${idx + 1}</td>
        <td style="padding: 6px; border: 1px solid #94a3b8; font-weight: bold; white-space: nowrap;">
          <div>${ev.startDate}</div>
          <div style="font-size: 7.5pt; color: #64748b;">${ev.startTime || '08:00'} - ${ev.endTime || '09:00'}</div>
        </td>
        <td style="padding: 6px; border: 1px solid #94a3b8; font-weight: bold;">${EVENT_TYPE_CONFIG[ev.type]?.label || ev.type}</td>
        <td style="padding: 6px; border: 1px solid #94a3b8;">
          <div style="font-weight: 900; color: #0f172a;">${ev.title}</div>
          ${ev.vision2040Pillar ? `<div style="font-size: 7.5pt; color: #0f766e; margin-top: 2px;">رؤية عمان 2040: ${ev.vision2040Pillar}</div>` : ''}
        </td>
        <td style="padding: 6px; border: 1px solid #94a3b8; font-weight: bold;">
          <div>${ev.gradeName || 'كافة الصفوف'}</div>
          ${ev.section ? `<div style="font-size: 7.5pt; color: #64748b;">${ev.section}</div>` : ''}
        </td>
        <td style="padding: 6px; border: 1px solid #94a3b8;">${ev.location || 'قاعة المدرسة'}</td>
        <td style="padding: 6px; border: 1px solid #94a3b8; font-size: 8pt; color: #334155;">${ev.description || 'وفق المعايير الوزارية'}</td>
      </tr>
    `).join('');

    return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <title>التقويم التربوي - ${school} - ${academicYear}</title>
  <style>
    @page { size: A4 landscape; margin: 8mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Cairo', Tahoma, sans-serif; direction: rtl; margin: 0; padding: 12px; background: white; color: #0f172a; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
    .header-center { text-align: center; }
    .header-center h1 { margin: 2px 0; font-size: 13pt; color: #0f172a; font-weight: 900; }
    .header-center p { margin: 1px 0; font-size: 8.5pt; color: #475569; }
    .header-side { font-size: 8.5pt; line-height: 1.4; }
    .table-container { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 8.5pt; }
    .table-container th { background: #f1f5f9; padding: 6px; border: 1px solid #94a3b8; font-weight: 900; }
    .signatures { margin-top: 25px; display: flex; justify-content: space-around; text-align: center; font-size: 9pt; }
    .signatures > div { width: 28%; }
    .no-print-bar { background: #0f172a; color: white; padding: 10px 16px; border-radius: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
    .no-print-bar button { padding: 6px 14px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-family: inherit; font-size: 9pt; margin-left: 6px; }
    @media print {
      .no-print-bar { display: none !important; }
      body { padding: 0 !important; }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <span>🖨️ معاينة جدول التقويم التربوي المعتمد A4</span>
    <div>
      <button onclick="window.print()" style="background: #14b8a6; color: #0f172a;">طباعة فورية (Ctrl+P)</button>
      <button onclick="window.close()" style="background: #475569; color: white;">إغلاق</button>
    </div>
  </div>

  <div class="header">
    <div class="header-side" style="text-align: right;">
      <div style="font-weight: 900; font-size: 10.5pt;">سلطنة عمان</div>
      <div style="font-weight: bold;">وزارة التربية والتعليم</div>
      <div>${directorate}</div>
      <div style="font-weight: bold; color: #0d9488;">${school}</div>
    </div>
    <div class="header-center">
      <h1>خطة التقويم التربوي وجدول الاختبارات والأنشطة</h1>
      <p>المناهج والتقويم التربوي - سلطنة عمان</p>
    </div>
    <div class="header-side" style="text-align: left;">
      <div><strong>العام الدراسي:</strong> ${academicYear}</div>
      <div><strong>المادة:</strong> الدراسات الاجتماعية والجغرافيا</div>
      <div><strong>إجمالي الاستحقاقات:</strong> ${filteredEvents.length} حدث</div>
      <div><strong>تاريخ التصدير:</strong> ${new Date().toLocaleDateString('ar-OM')}</div>
    </div>
  </div>

  <table class="table-container">
    <thead>
      <tr>
        <th style="width: 30px;">م</th>
        <th style="width: 100px;">التاريخ والوقت</th>
        <th style="width: 110px;">نوع الاستحقاق</th>
        <th>عنوان الاختبار / النشاط التربوي</th>
        <th style="width: 110px;">الصف والشعبة</th>
        <th style="width: 90px;">القاعة</th>
        <th>محاور التقويم والملاحظات</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <div class="signatures">
    <div>
      <p style="font-weight: bold;">معلم المادة والمعد</p>
      <p style="color: #0d9488; font-weight: bold; margin-top: 15px;">${teacher}</p>
      <p style="font-size: 8pt; color: #94a3b8; margin-top: 8px;">التوقيع: .....................</p>
    </div>
    <div>
      <p style="font-weight: bold;">المعلم الأول / المشرف</p>
      <p style="color: #64748b; margin-top: 15px;">${supervisor}</p>
      <p style="font-size: 8pt; color: #94a3b8; margin-top: 8px;">التوقيع: .....................</p>
    </div>
    <div>
      <p style="font-weight: bold;">يعتمد مدير المدرسة</p>
      <p style="color: #64748b; margin-top: 15px;">${principal}</p>
      <p style="font-size: 8pt; color: #94a3b8; margin-top: 8px;">الختم والتوقيع: .....................</p>
    </div>
  </div>
</body>
</html>`;
  };

  const handleExportCalendarPdf = async () => {
    if (!calendarPrintRef.current) {
      showToast('التقويم غير جاهز للتصدير حالياً', 'error');
      return;
    }
    setIsExportingPdf(true);
    try {
      const cleanYear = (schoolProfile.academicYear || '2026_2027').replace(/[/\\?%*:|"<>]/g, '_');
      const filename = `التقويم_التربوي_${cleanYear}.pdf`;
      const res = await exportUnifiedPdf(calendarPrintRef.current, {
        filename,
        orientation: 'landscape',
        scale: 2,
        addPageNumbers: true,
        title: `التقويم التربوي المعتمد - ${schoolProfile.schoolName}`,
        hideSelectors: ['.no-print', '[data-no-print]', 'button']
      });
      if (res.success) {
        showToast('📄 تم تصدير التقويم التربوي بنجاح كملف PDF عالي الجودة والوضوح!', 'success');
      } else {
        showToast('تعذر تصدير التقويم إلى PDF: ' + (res.error || ''), 'error');
      }
    } catch (err: any) {
      showToast('خطأ أثناء تصدير التقويم إلى PDF: ' + err.message, 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadPrintableHtmlCalendar = () => {
    const html = generateCalendarPrintableHtml();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanYear = (schoolProfile.academicYear || '2026_2027').replace(/[/\\?%*:|"<>]/g, '_');
    a.download = `التقويم_التربوي_${cleanYear}_للطباعة.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('📄 تم تنزيل صفحة التقويم الرسمية للطباعة! يمكنك فتحها والضغط على Ctrl+P للطباعة المباشرة بأعلى جودة.', 'success');
  };

  const handlePrintCalendar = async () => {
    let printSuccess = false;
    try {
      window.print();
      printSuccess = true;
      showToast('تم إرسال أمر الطباعة. إذا لم تظهر نافذة الطابعة، يمكنك استخدام زر "تصدير PDF" أو "تنزيل صفحة للطباعة"', 'info');
    } catch (err) {
      console.warn('Direct print blocked by iframe environment:', err);
    }
    if (!printSuccess) {
      showToast('تعذر فتح أمر الطباعة من المتصفح مباشرة، جاري تجهيز وتنزيل ملف PDF للطباعة تلقائياً...', 'info');
      await handleExportCalendarPdf();
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const total = events.length;
    const exams = events.filter(e => e.type === 'exam').length;
    const activities = events.filter(e => e.type === 'activity').length;
    const tasks = events.filter(e => e.type === 'task').length;
    const completed = events.filter(e => e.status === 'completed').length;
    const pending = events.filter(e => e.status === 'pending').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, exams, activities, tasks, completed, pending, completionRate };
  }, [events]);

  // Handle Event Saving
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      showToast('يرجى كتابة عنوان الحدث أو الاختبار', 'error');
      return;
    }

    try {
      if (editingEvent) {
        const res = await api.updateCalendarEvent(editingEvent.id, formData);
        if (res.success) {
          setEvents(prev => prev.map(ev => ev.id === editingEvent.id ? res.event : ev));
          showToast('تم تحديث موعد الحدث التربوي بنجاح', 'success');
        }
      } else {
        const res = await api.saveCalendarEvent(formData);
        if (res.success) {
          setEvents(prev => [res.event, ...prev]);
          showToast('تمت جدولة الحدث التربوي بنجاح', 'success');
        }
      }
      setEventModalOpen(false);
      setEditingEvent(null);
    } catch (err: any) {
      showToast('فشل حفظ الموعد في التقويم', 'error');
    }
  };

  // Handle Delete Event
  const handleDeleteEvent = async (id: string, title: string) => {
    if (!confirm(`هل أنت متأكد من حذف الحدث "${title}" من التقويم التربوي؟`)) return;
    try {
      const res = await api.deleteCalendarEvent(id);
      if (res.success) {
        setEvents(prev => prev.filter(e => e.id !== id));
        showToast('تم حذف الحدث من التقويم التربوي', 'info');
      }
    } catch (err) {
      showToast('تعذر حذف الحدث', 'error');
    }
  };

  // Toggle Status
  const handleToggleStatus = async (event: EducationalCalendarEvent) => {
    const nextStatus: CalendarEventStatus = event.status === 'completed' ? 'pending' : 'completed';
    try {
      const res = await api.updateCalendarEvent(event.id, { status: nextStatus });
      if (res.success) {
        setEvents(prev => prev.map(e => e.id === event.id ? { ...e, status: nextStatus } : e));
        showToast(nextStatus === 'completed' ? 'تم تعيين الحدث كمكتمل ومُنجز ✓' : 'تمت إعادة الحدث لقيد الانتظار', 'info');
      }
    } catch (err) {
      showToast('فشل تغيير حالة الحدث', 'error');
    }
  };

  // Seed Default Events
  const handleSeedDefaults = async () => {
    if (!confirm('هل ترغب في توليد أحداث التقويم التربوي والاختبارات للفصل الدراسي لسلطنة عمان؟')) return;
    try {
      setLoading(true);
      const res = await api.seedDefaultCalendarEvents();
      if (res.success && res.events) {
        setEvents(res.events);
        showToast('تم توليد أحداث واختبارات التقويم التربوي بنجاح', 'success');
      }
    } catch (err) {
      showToast('فشل توليد أحداث التقويم', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Open Create Modal
  const openCreateModal = (initialDate?: string) => {
    setEditingEvent(null);
    setFormData({
      title: '',
      type: 'exam',
      subjectName: 'هذا وطني - تاريخ وجغرافية عمان',
      gradeName: 'الصف الثاني عشر',
      section: '12/1',
      startDate: initialDate || new Date().toISOString().split('T')[0],
      startTime: '08:00',
      endDate: initialDate || new Date().toISOString().split('T')[0],
      endTime: '09:00',
      allDay: false,
      location: 'قاعة الجغرافيا رقم 4',
      description: '',
      priority: 'high',
      status: 'pending',
      reminderMinutes: 1440,
      vision2040Pillar: 'جودة التعليم والتعلم'
    });
    setEventModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (event: EducationalCalendarEvent) => {
    setEditingEvent(event);
    setFormData({
      ...event
    });
    setEventModalOpen(true);
  };

  // Apply Quick Template
  const applyTemplate = (type: 'exam' | 'map_activity' | 'field_report' | 'vision_project') => {
    if (type === 'exam') {
      setFormData(prev => ({
        ...prev,
        title: 'الاختبار القصير: جغرافية سلطنة عمان المكان والحضارة',
        type: 'exam',
        subjectName: 'هذا وطني - تاريخ وجغرافية عمان',
        gradeName: 'الصف الثاني عشر',
        startTime: '08:00',
        endTime: '09:00',
        priority: 'urgent',
        description: 'اختبار تحريري مقنن وفق وثيقة التقويم لوزارة التربية والتعليم، يتضمن سؤال خريطة صماء ومفاهيم جغرافية.',
        location: 'قاعة الجغرافيا رقم 4'
      }));
    } else if (type === 'map_activity') {
      setFormData(prev => ({
        ...prev,
        title: 'تطبيق عملي: رسم وتعيين محافظات وأفلاج سلطنة عمان على الخريطة الصماء',
        type: 'activity',
        subjectName: 'الدراسات الاجتماعية',
        gradeName: 'الصف التاسع',
        startTime: '09:15',
        endTime: '10:00',
        priority: 'medium',
        description: 'نشاط صفي تفاعلي لتطبيق مهارة تحديد المحافظات الـ 11 ومواقع الأفلاج الخمسة المدرجة في اليونسكو.',
        location: 'مختبر الجغرافيا والتقنيات'
      }));
    } else if (type === 'field_report') {
      setFormData(prev => ({
        ...prev,
        title: 'تسليم تقرير ميداني: أثر السدود المائية والتصحر في محافظة شمال الباطنة',
        type: 'task',
        subjectName: 'الجغرافيا والتقنيات الحديثة',
        gradeName: 'الصف الحادي عشر',
        startTime: '10:30',
        endTime: '11:15',
        priority: 'high',
        description: 'بحث جغرافي واستقصائي يتضمن رصد سدود وادي الجزي ووادي عاهن وتوصيات استدامة الموارد المائية.',
        location: 'قاعة مصادر التعلم'
      }));
    } else if (type === 'vision_project') {
      setFormData(prev => ({
        ...prev,
        title: 'مشروع جماعي: مبادرات الهيدروجين الأخضر والطاقة المتجددة ضمن رؤية عمان 2040',
        type: 'task',
        subjectName: 'هذا وطني',
        gradeName: 'الصف الثاني عشر',
        startTime: '11:30',
        endTime: '12:15',
        priority: 'high',
        description: 'عرض تقديمي ومجسم جغرافي لمحطات الطاقة الشمسية بالظاهرة ومشاريع الهيدروجين بالدقم وصحار.',
        location: 'قاعة المعارض المدرسية'
      }));
    }
  };

  // ----------------------------------------------------
  // GENERATE STANDARD iCALENDAR (.ics) FILE FOR DEVICE SYNC
  // Works with Apple Calendar (iOS/Mac), Google Calendar, Outlook, Android
  // ----------------------------------------------------
  const generateICS = (eventsToExport: EducationalCalendarEvent[]) => {
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

    const formatIcsDate = (dateStr: string, timeStr?: string) => {
      const d = new Date(dateStr);
      const year = d.getFullYear();
      const month = pad(d.getMonth() + 1);
      const day = pad(d.getDate());

      if (timeStr && timeStr.includes(':')) {
        const [h, m] = timeStr.split(':');
        return `${year}${month}${day}T${pad(parseInt(h, 10))}${pad(parseInt(m, 10))}00`;
      }
      return `${year}${month}${day}`;
    };

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Sultanate of Oman//Smart Educational Library//AR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:التقويم التربوي - سلطنة عمان',
      'X-WR-TIMEZONE:Asia/Muscat'
    ];

    eventsToExport.forEach(ev => {
      const dtStart = formatIcsDate(ev.startDate, ev.allDay ? undefined : (ev.startTime || '08:00'));
      const dtEnd = formatIcsDate(ev.endDate || ev.startDate, ev.allDay ? undefined : (ev.endTime || '09:00'));
      const uid = `om-edu-${ev.id}@smartlibrary.edu.om`;
      const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      const summary = ev.title.replace(/[,;\\]/g, ' ');
      const desc = `${ev.description || ''}\\nالمادة: ${ev.subjectName || ''}\\nالصف: ${ev.gradeName || ''} (${ev.section || ''})\\nالأولوية: ${PRIORITY_CONFIG[ev.priority]?.label || ''}`.replace(/[,;\\]/g, ' ');
      const location = (ev.location || schoolProfile.schoolName || 'سلطنة عمان').replace(/[,;\\]/g, ' ');

      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`UID:${uid}`);
      icsContent.push(`DTSTAMP:${now}`);
      if (ev.allDay) {
        icsContent.push(`DTSTART;VALUE=DATE:${dtStart}`);
        icsContent.push(`DTEND;VALUE=DATE:${dtEnd}`);
      } else {
        icsContent.push(`DTSTART:${dtStart}`);
        icsContent.push(`DTEND:${dtEnd}`);
      }
      icsContent.push(`SUMMARY:${summary}`);
      icsContent.push(`DESCRIPTION:${desc}`);
      icsContent.push(`LOCATION:${location}`);
      icsContent.push(`CATEGORIES:${EVENT_TYPE_CONFIG[ev.type]?.label || 'التقويم التربوي'}`);
      icsContent.push(`STATUS:${ev.status === 'completed' ? 'CONFIRMED' : 'TENTATIVE'}`);

      // Alarm / Reminder
      const reminderMin = ev.reminderMinutes || 60;
      icsContent.push('BEGIN:VALARM');
      icsContent.push('ACTION:DISPLAY');
      icsContent.push(`DESCRIPTION:تذكير: ${summary}`);
      icsContent.push(`TRIGGER:-PT${reminderMin}M`);
      icsContent.push('END:VALARM');

      icsContent.push('END:VEVENT');
    });

    icsContent.push('END:VCALENDAR');
    return icsContent.join('\r\n');
  };

  // Download .ics for all filtered events
  const handleDownloadFullCalendarICS = () => {
    if (filteredEvents.length === 0) {
      showToast('لا توجد أحداث لتصديرها في التقويم الحالي', 'info');
      return;
    }
    const icsData = generateICS(filteredEvents);
    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `التقويم_التربوي_${schoolProfile.schoolName.replace(/[/\\?%*:|"<>]/g, '_')}_2026.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('تم تنزيل ملف التقويم (.ics) بنجاح! يمكنك فتحه الآن لمزامنته مع تقويم هاتفك أو حاسوبك.', 'success');
  };

  // Download .ics for a single event
  const handleDownloadSingleEventICS = (event: EducationalCalendarEvent) => {
    const icsData = generateICS([event]);
    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `حدث_${event.title.replace(/[/\\?%*:|"<>]/g, '_')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`تم تنزيل موعد "${event.title}" لتقويم الجهاز بنجاح.`, 'success');
  };

  // Direct Google Calendar Web Intent Link
  const getGoogleCalendarUrl = (event: EducationalCalendarEvent) => {
    const formatGDate = (dateStr: string, timeStr?: string) => {
      const d = new Date(dateStr);
      const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
      const y = d.getFullYear();
      const m = pad(d.getMonth() + 1);
      const day = pad(d.getDate());
      if (timeStr && timeStr.includes(':')) {
        const [h, min] = timeStr.split(':');
        return `${y}${m}${day}T${pad(parseInt(h, 10))}${pad(parseInt(min, 10))}00`;
      }
      return `${y}${m}${day}`;
    };

    const start = formatGDate(event.startDate, event.allDay ? undefined : (event.startTime || '08:00'));
    const end = formatGDate(event.endDate || event.startDate, event.allDay ? undefined : (event.endTime || '09:00'));
    const text = encodeURIComponent(event.title);
    const details = encodeURIComponent(
      `${event.description || ''}\nالمادة: ${event.subjectName || ''}\nالصف: ${event.gradeName || ''} (${event.section || ''})\nالمدرسة: ${schoolProfile.schoolName}`
    );
    const location = encodeURIComponent(event.location || schoolProfile.schoolName);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;
  };

  // Send Calendar via WhatsApp
  const handleSendWhatsApp = async () => {
    if (!recipientPhone.trim()) {
      showToast('يرجى إدخال رقم هاتف المستلم', 'error');
      return;
    }
    try {
      setSendingWhatsApp(true);
      localStorage.setItem('om_edu_wa_recipient_phone', recipientPhone.trim());
      const res = await api.dispatchCalendarToWhatsApp(recipientPhone.trim(), selectedType === 'exam' ? 'exams' : selectedType === 'activity' ? 'activities' : 'all');
      if (res.success) {
        showToast(res.message || 'تم إرسال جدول التقويم التربوي بنجاح إلى الواتساب!', 'success');
        setWhatsappModalOpen(false);
      }
    } catch (err: any) {
      showToast(err.message || 'فشل إرسال جدول التقويم عبر الواتساب', 'error');
    } finally {
      setSendingWhatsApp(false);
    }
  };

  // Copy WhatsApp Formatted Message
  const handleCopyWhatsAppText = () => {
    let msg = `📅 *التقويم التربوي وجدول الاستحقاقات المدرسية* 🇴🇲\n` +
      `🏫 *المدرسة:* ${schoolProfile.schoolName}\n` +
      `🏢 *${schoolProfile.directorateName}*\n` +
      `🗓️ *العام الدراسي:* ${schoolProfile.academicYear}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n`;

    filteredEvents.slice(0, 15).forEach((ev, idx) => {
      const typeCfg = EVENT_TYPE_CONFIG[ev.type];
      msg += `${idx + 1}. *${ev.title}* ${typeCfg?.icon || '📌'}\n` +
        `   • 📅 التاريخ: ${ev.startDate} (${ev.startTime || 'طوال اليوم'})\n` +
        `   • 🎓 الصف والمادة: ${ev.gradeName || ''} - ${ev.subjectName || ''}\n` +
        (ev.location ? `   • 📍 القاعة: ${ev.location}\n` : '') +
        (ev.description ? `   • 📝 المحاور: ${ev.description}\n` : '') +
        `\n`;
    });

    msg += `━━━━━━━━━━━━━━━━━━━━\n✨ تم التصدير عبر منصة المكتبة الجغرافية والتربوية الذكية`;

    navigator.clipboard.writeText(msg);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2500);
    showToast('تم نسخ نص جدول الاستحقاقات والتقويم التربوي بنجاح!', 'success');
  };

  // ----------------------------------------------------
  // CALENDAR MONTH GRID COMPUTATION
  // ----------------------------------------------------
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: Array<{
      date: Date;
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isWeekend: boolean;
      events: EducationalCalendarEvent[];
    }> = [];

    const todayStr = new Date().toISOString().split('T')[0];

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const d = new Date(year, month - 1, dayNum);
      const dateStr = d.toISOString().split('T')[0];
      const dayEvents = events.filter(e => e.startDate === dateStr);
      const isWeekend = d.getDay() === 5 || d.getDay() === 6; // Fri & Sat

      days.push({
        date: d,
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isWeekend,
        events: dayEvents
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayEvents = events.filter(e => e.startDate === dateStr);
      const isWeekend = d.getDay() === 5 || d.getDay() === 6;

      days.push({
        date: d,
        dateStr,
        dayNumber: i,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isWeekend,
        events: dayEvents
      });
    }

    // Next month filler days to complete grid (multiples of 7)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const d = new Date(year, month + 1, i);
      const dateStr = d.toISOString().split('T')[0];
      const dayEvents = events.filter(e => e.startDate === dateStr);
      const isWeekend = d.getDay() === 5 || d.getDay() === 6;

      days.push({
        date: d,
        dateStr,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isWeekend,
        events: dayEvents
      });
    }

    return days;
  }, [currentDate, events]);

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* ---------------------------------------------------- */}
      {/* HEADER & BRANDING */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-900 flex items-center justify-center text-white shadow-md shadow-teal-900/20 shrink-0">
              <CalendarCheck className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                  التقويم التربوي وجدولة الاستحقاقات
                </h1>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-700">
                  سلطنة عمان • وزارة التربية والتعليم 🇴🇲
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  رؤية عمان 2040
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
                جدولة الاختبارات، الأنشطة، التطبيقات العملية والمهام التعليمية مع ميزة التصدير كـ PDF رسمي والمزامنة الفورية مع تقويم الجهاز (.ics / Google Calendar).
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={() => openCreateModal()}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs shadow-md shadow-teal-900/20 flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة استحقاق / اختبار</span>
            </button>

            <button
              onClick={handleDownloadFullCalendarICS}
              className="px-3 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-bold text-xs flex items-center gap-1.5 transition"
              title="تنزيل ملف .ics متوافق مع Apple Calendar و Google Calendar و Outlook"
            >
              <Download className="w-3.5 h-3.5" />
              <span>مزامنة تقويم الجهاز (.ics)</span>
            </button>

            <button
              onClick={() => setViewMode(viewMode === 'print' ? 'month' : 'print')}
              className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'print'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800'
              }`}
              title="معاينة وطباعة التقويم التربوي بصيغة A4 الرسمية وتصديره كـ PDF"
            >
              <Printer className="w-3.5 h-3.5 text-teal-600" />
              <span>{viewMode === 'print' ? 'العودة للتقويم ↩️' : 'معاينة وطباعة PDF 📄'}</span>
            </button>

            <button
              onClick={() => setWhatsappModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>إرسال واتساب</span>
            </button>

            <button
              onClick={handleSeedDefaults}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs transition"
              title="استعادة أحداث واختبارات التقويم التربوي المعتمدة للفصل الدراسي"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
            </button>
          </div>
        </div>

        {/* School Profile Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="font-bold text-slate-800 dark:text-slate-200">{schoolProfile.schoolName}</span>
            <span>•</span>
            <span>{schoolProfile.directorateName}</span>
            <span>•</span>
            <span className="text-teal-700 dark:text-teal-300 font-semibold">{schoolProfile.academicYear}</span>
          </div>

          <button
            onClick={openSchoolProfileModal}
            className="text-[11px] text-teal-700 dark:text-teal-300 hover:underline font-bold flex items-center gap-1"
          >
            <span>✏️ تعديل ترويسة المدرسة والختم</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* STATS OVERVIEW CARDS */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي الاستحقاقات</span>
            <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600">
              <CalendarIcon className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</span>
            <span className="text-[11px] text-slate-400">حدث ومهمة</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
            <span>معدل الإنجاز:</span>
            <span className="font-extrabold text-teal-600">{stats.completionRate}%</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950/60 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400">الاختبارات والتقويم</span>
            <span className="text-base">📝</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{stats.exams}</span>
            <span className="text-[11px] text-slate-400">اختبار مجدول</span>
          </div>
          <p className="mt-2 text-[10px] text-rose-600 dark:text-rose-400 font-medium">قصيرة، تشخيصية، ونهائية</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-sky-950/60 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-700 dark:text-sky-400">الأنشطة والخرائط</span>
            <span className="text-base">🎨</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-sky-600 dark:text-sky-400">{stats.activities}</span>
            <span className="text-[11px] text-slate-400">تطبيق عملي</span>
          </div>
          <p className="mt-2 text-[10px] text-sky-600 dark:text-sky-400 font-medium">خرائط صماء وتقارير ميدانية</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-950/60 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">المهام المنجزة</span>
            <span className="text-base">✓</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.completed}</span>
            <span className="text-[11px] text-slate-400">من أصل {stats.total}</span>
          </div>
          <p className="mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            متبقي: {stats.pending} استحقاق
          </p>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* FILTER & VIEW TOGGLES */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* View Mode Toggle Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition ${
              viewMode === 'month'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>التقويم الشهري</span>
          </button>

          <button
            onClick={() => setViewMode('agenda')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition ${
              viewMode === 'agenda'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>قائمة الاستحقاقات والأجندة</span>
          </button>

          <button
            onClick={() => setViewMode('print')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition ${
              viewMode === 'print'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>المعاينة الطباعية A4</span>
          </button>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">كافة أنواع الاستحقاقات</option>
            <option value="exam">الاختبارات والتقويم 📝</option>
            <option value="activity">الأنشطة والتطبيقات 🎨</option>
            <option value="task">المهام والمشاريع 📌</option>
            <option value="ministry_event">المناسبات الوزارية 🏛️</option>
          </select>

          {/* Grade Filter */}
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">كافة الصفوف الدراسية</option>
            <option value="الصف التاسع">الصف التاسع</option>
            <option value="الصف العاشر">الصف العاشر</option>
            <option value="الصف الحادي عشر">الصف الحادي عشر</option>
            <option value="الصف الثاني عشر">الصف الثاني عشر</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">كافة الحالات</option>
            <option value="pending">قيد الانتظار ⏳</option>
            <option value="completed">مكتمل ومُنجز ✓</option>
          </select>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* VIEW: MONTH GRID */}
      {/* ---------------------------------------------------- */}
      {viewMode === 'month' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 shadow-xs">
          {/* Month Header Switcher */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">
                {ARABIC_MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()} م
              </h2>
              <button
                onClick={goToToday}
                className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-bold hover:bg-teal-100 transition"
              >
                اليوم
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="الشهر السابق"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="الشهر التالي"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 text-center text-xs font-bold text-slate-500 dark:text-slate-400">
            {ARABIC_DAYS.map((day, idx) => (
              <div
                key={day}
                className={`py-2 rounded-lg ${
                  idx === 5 || idx === 6
                    ? 'text-slate-400 dark:text-slate-600 bg-slate-50/50 dark:bg-slate-900/50'
                    : 'bg-slate-100/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {calendarDays.map((dayItem, idx) => {
              const hasEvents = dayItem.events.length > 0;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDayEvents({ dateStr: dayItem.dateStr, events: dayItem.events })}
                  className={`min-h-[90px] md:min-h-[110px] p-1.5 md:p-2 rounded-xl border transition flex flex-col justify-between group cursor-pointer ${
                    dayItem.isToday
                      ? 'border-teal-500 bg-teal-50/30 dark:bg-teal-950/20 ring-1 ring-teal-500'
                      : dayItem.isCurrentMonth
                        ? 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-300 hover:shadow-xs'
                        : 'border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-950/40 opacity-40 hover:opacity-80'
                  }`}
                >
                  {/* Day Number & Quick Add Button */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                        dayItem.isToday
                          ? 'bg-teal-600 text-white font-extrabold'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {dayItem.dayNumber}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openCreateModal(dayItem.dateStr);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-teal-600 hover:bg-teal-50 dark:hover:bg-slate-800 transition"
                      title="إضافة موعد في هذا اليوم"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Day Events Badges */}
                  <div className="space-y-1 mt-1 overflow-hidden flex-1">
                    {dayItem.events.slice(0, 2).map((ev) => {
                      const cfg = EVENT_TYPE_CONFIG[ev.type];
                      return (
                        <div
                          key={ev.id}
                          className={`text-[10px] px-1.5 py-0.5 rounded-md truncate font-medium flex items-center gap-1 border ${
                            ev.status === 'completed'
                              ? 'line-through opacity-60 bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200'
                              : `${cfg.bgLight} ${cfg.color} ${cfg.borderColor}`
                          }`}
                          title={`${ev.title} (${ev.startTime || 'طوال اليوم'})`}
                        >
                          <span className="shrink-0">{cfg.icon}</span>
                          <span className="truncate">{ev.title}</span>
                        </div>
                      );
                    })}

                    {dayItem.events.length > 2 && (
                      <div className="text-[9px] font-bold text-teal-600 dark:text-teal-400 text-center">
                        +{dayItem.events.length - 2} استحقاقات أخرى
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* VIEW: AGENDA & LIST TABLE */}
      {/* ---------------------------------------------------- */}
      {viewMode === 'agenda' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600" />
              <span>جدول الاستحقاقات المجدولة ({filteredEvents.length} حدث)</span>
            </h3>

            <div className="text-xs text-slate-500">
              مرتبة حسب موعد الاستحقاق من الأقرب إلى الأبعد
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <CalendarCheck className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-sm font-bold">لا توجد فعاليات أو اختبارات تطابق الفلتر المحدد</p>
              <button
                onClick={() => { setSelectedType('all'); setSelectedGrade('all'); setSelectedStatus('all'); }}
                className="mt-3 px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 text-xs font-bold hover:bg-teal-100"
              >
                إعادة ضبط الفلاتر
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-extrabold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-3 text-center w-12">الحالة</th>
                    <th className="py-3 px-3">التاريخ واليوم</th>
                    <th className="py-3 px-3">النوع</th>
                    <th className="py-3 px-4">عنوان الاختبار / الحدث التربوي</th>
                    <th className="py-3 px-3">المادة والصف</th>
                    <th className="py-3 px-3">المكان / القاعة</th>
                    <th className="py-3 px-3 text-center">الأولوية</th>
                    <th className="py-3 px-4 text-center">المزامنة والإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredEvents.map((ev) => {
                    const cfg = EVENT_TYPE_CONFIG[ev.type];
                    const priorityCfg = PRIORITY_CONFIG[ev.priority];
                    const isDone = ev.status === 'completed';

                    return (
                      <tr
                        key={ev.id}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition ${
                          isDone ? 'bg-slate-50/40 dark:bg-slate-950/40 opacity-75' : ''
                        }`}
                      >
                        {/* Status Checkbox */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleToggleStatus(ev)}
                            className="p-1 rounded-md text-slate-400 hover:text-teal-600 transition"
                            title={isDone ? 'مكتمل - انقر للعودة' : 'قيد الانتظار - انقر للتحديد كمكتمل'}
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100 dark:fill-emerald-950" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-400 hover:text-teal-600" />
                            )}
                          </button>
                        </td>

                        {/* Date & Time */}
                        <td className="py-3 px-3 whitespace-nowrap font-bold text-slate-900 dark:text-slate-100">
                          <div>{ev.startDate}</div>
                          <div className="text-[10px] text-slate-400 font-normal flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{ev.allDay ? 'طوال اليوم' : `${ev.startTime || '08:00'} - ${ev.endTime || '09:00'}`}</span>
                          </div>
                        </td>

                        {/* Type Badge */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.bgLight} ${cfg.color} ${cfg.borderColor}`}
                          >
                            <span>{cfg.icon}</span>
                            <span>{cfg.label}</span>
                          </span>
                        </td>

                        {/* Title & Description */}
                        <td className="py-3 px-4 min-w-[200px]">
                          <div className={`font-extrabold text-slate-900 dark:text-white ${isDone ? 'line-through text-slate-500' : ''}`}>
                            {ev.title}
                          </div>
                          {ev.description && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                              {ev.description}
                            </p>
                          )}
                          {ev.vision2040Pillar && (
                            <span className="inline-block mt-1 text-[9px] px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold border border-amber-200">
                              رؤية 2040: {ev.vision2040Pillar}
                            </span>
                          )}
                        </td>

                        {/* Subject & Grade */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-bold text-slate-800 dark:text-slate-200">{ev.gradeName || 'كافة الصفوف'}</div>
                          <div className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                            {ev.subjectName || 'الدراسات الاجتماعية'} {ev.section ? `(${ev.section})` : ''}
                          </div>
                        </td>

                        {/* Location */}
                        <td className="py-3 px-3 whitespace-nowrap text-slate-500 text-[11px]">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{ev.location || 'قاعة المدرسة'}</span>
                          </div>
                        </td>

                        {/* Priority */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${priorityCfg.badgeClass}`}>
                            {priorityCfg.label}
                          </span>
                        </td>

                        {/* Actions & Calendar Sync */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Sync to Device .ics */}
                            <button
                              onClick={() => handleDownloadSingleEventICS(ev)}
                              className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 hover:bg-sky-100 transition"
                              title="تنزيل ملف .ics لمزامنة هذا الحدث مع تقويم الهاتف أو الحاسوب"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            {/* Direct Google Calendar Link */}
                            <a
                              href={getGoogleCalendarUrl(ev)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 hover:bg-teal-100 transition"
                              title="إضافة الموعد إلى تقويم Google بنقرة واحدة"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            {/* Edit */}
                            <button
                              onClick={() => openEditModal(ev)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
                              title="تعديل الحدث"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteEvent(ev.id, ev.title)}
                              className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 hover:bg-rose-100 transition"
                              title="حذف الحدث"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* VIEW: OFFICIAL PRINTABLE A4 PREVIEW */}
      {/* ---------------------------------------------------- */}
      {viewMode === 'print' && (
        <div ref={calendarPrintRef} className="bg-white text-slate-900 p-8 rounded-2xl shadow-lg border border-slate-300 print:border-none print:shadow-none print:p-0 max-w-5xl mx-auto printable-document">
          {/* Action Print Bar */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between print:hidden border-b pb-4 gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
              <span className="text-sm font-bold text-slate-700">معاينة جدول التقويم التربوي الرسمي المعتمد للطباعة A4</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleExportCalendarPdf}
                disabled={isExportingPdf}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                title="تصدير التقويم إلى ملف PDF عالي الجودة والوضوح"
              >
                {isExportingPdf ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>{isExportingPdf ? 'جاري تجهيز PDF...' : 'تصدير PDF رسمي 📄'}</span>
              </button>
              <button
                onClick={handlePrintCalendar}
                className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
                title="طباعة مباشرة عبر المتصفح"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة مباشرة 🖨️</span>
              </button>
              <button
                onClick={handleDownloadPrintableHtmlCalendar}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                title="تنزيل صفحة مستقلة تفتح في المتصفح وتطبع بـ Ctrl+P"
              >
                <FileText className="w-4 h-4 text-sky-600" />
                <span>ملف طباعة مستقل</span>
              </button>
              <button
                onClick={openSchoolProfileModal}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>✏️ تعديل الترويسة والختم</span>
              </button>
              <button
                onClick={() => setViewMode('month')}
                className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>العودة للتقويم ↩️</span>
              </button>
            </div>
          </div>

          {/* Ministerial Header */}
          <div className="border-b-2 border-slate-900 pb-5 mb-6 text-center relative">
            <div className="flex items-center justify-between">
              <div className="text-right text-xs leading-relaxed space-y-0.5">
                <p className="font-bold text-sm">{countryName || 'سلطنة عمان'}</p>
                <p className="font-bold">{ministryName || 'وزارة التربية والتعليم'}</p>
                <p>{directorateName}</p>
                <p className="font-extrabold text-teal-900">{schoolName}</p>
              </div>

              {/* Official Emblem */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full border-2 border-slate-800 flex items-center justify-center p-2 mb-1">
                  <Compass className="w-8 h-8 text-teal-800" />
                </div>
                <span className="text-[10px] font-bold text-slate-600">التقويم التربوي المعتمد</span>
              </div>

              <div className="text-left text-xs leading-relaxed space-y-0.5">
                <p><span className="font-bold">العام الدراسي:</span> {academicYear}</p>
                <p><span className="font-bold">المادة:</span> الدراسات الاجتماعية والجغرافيا</p>
                <p><span className="font-bold">تاريخ التصدير:</span> {new Date().toLocaleDateString('ar-OM')}</p>
                <p><span className="font-bold">المشرف المعتمد:</span> {supervisorName || 'المعلم الأول'}</p>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-slate-200">
              <h2 className="text-base font-black text-slate-900">
                خطة التقويم التربوي وجدول الاختبارات والأنشطة للفصل الدراسي
              </h2>
            </div>
          </div>

          {/* Printable Table */}
          <table className="w-full text-right text-xs border-collapse border border-slate-800 mb-8">
            <thead>
              <tr className="bg-slate-100 text-slate-900 border-b border-slate-800 font-black">
                <th className="border border-slate-800 p-2 text-center w-8">م</th>
                <th className="border border-slate-800 p-2 w-28">التاريخ واليوم</th>
                <th className="border border-slate-800 p-2 w-24">نوع الاستحقاق</th>
                <th className="border border-slate-800 p-2">عنوان الاختبار / النشاط التربوي</th>
                <th className="border border-slate-800 p-2 w-28">الصف والشعبة</th>
                <th className="border border-slate-800 p-2 w-24">القاعة</th>
                <th className="border border-slate-800 p-2 w-40">محاور التقويم والملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((ev, idx) => (
                <tr key={ev.id} className="border-b border-slate-400">
                  <td className="border border-slate-400 p-2 text-center font-bold">{idx + 1}</td>
                  <td className="border border-slate-400 p-2 whitespace-nowrap font-bold">
                    <div>{ev.startDate}</div>
                    <div className="text-[10px] text-slate-600">{ev.startTime || '08:00'} - {ev.endTime || '09:00'}</div>
                  </td>
                  <td className="border border-slate-400 p-2 whitespace-nowrap font-bold">
                    {EVENT_TYPE_CONFIG[ev.type]?.label || ev.type}
                  </td>
                  <td className="border border-slate-400 p-2">
                    <div className="font-black text-slate-900">{ev.title}</div>
                    {ev.vision2040Pillar && (
                      <div className="text-[9px] text-teal-800 mt-0.5">رؤية عمان: {ev.vision2040Pillar}</div>
                    )}
                  </td>
                  <td className="border border-slate-400 p-2 font-bold">
                    <div>{ev.gradeName || 'كافة الصفوف'}</div>
                    <div className="text-[10px] text-slate-600">{ev.section || ''}</div>
                  </td>
                  <td className="border border-slate-400 p-2 text-[11px]">{ev.location || 'قاعة المدرسة'}</td>
                  <td className="border border-slate-400 p-2 text-[10px] text-slate-700 leading-snug">
                    {ev.description || 'وفق المعايير الوزارية'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Official Signatures & Stamp */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t-2 border-slate-800 text-center text-xs">
            <div>
              <p className="font-bold text-slate-700 mb-1">معلم المادة والمعد:</p>
              <p className="font-black text-slate-900">{teacherName || currentUser.name || 'أ. المعلم'}</p>
              <div className="mt-6 border-b border-dashed border-slate-400 w-36 mx-auto"></div>
              <p className="text-[10px] text-slate-500 mt-1">التوقيع والتاريخ</p>
            </div>

            {/* School Stamp */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-full border-2 border-teal-800 border-dashed flex flex-col items-center justify-center p-2 text-[9px] font-bold text-teal-900 shadow-xs">
                <span>{stampText || 'ختم المدرسة المعتمد'}</span>
                <span className="text-[8px] text-teal-700 mt-0.5">{ministryName || 'وزارة التربية والتعليم'}</span>
                <span className="text-[7px] text-slate-500">{countryName || 'سلطنة عمان'}</span>
              </div>
            </div>

            <div>
              <p className="font-bold text-slate-700 mb-1">يعتمد مدير المدرسة:</p>
              <p className="font-black text-slate-900">{principalName || 'أ. سالم بن خميس البلوشي'}</p>
              <div className="mt-6 border-b border-dashed border-slate-400 w-36 mx-auto"></div>
              <p className="text-[10px] text-slate-500 mt-1">التوقيع والاعتماد</p>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: ADD / EDIT EDUCATIONAL EVENT */}
      {/* ---------------------------------------------------- */}
      {eventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl animate-scale-up my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-600">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {editingEvent ? 'تعديل موعد الاستحقاق التربوي' : 'جدولة حدث / اختبار تربوي جديد'}
                  </h3>
                  <p className="text-xs text-slate-500">سلطنة عمان • توثيق التقويم وفق المعايير الوزارية</p>
                </div>
              </div>

              <button
                onClick={() => setEventModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            {/* Quick Template Buttons */}
            {!editingEvent && (
              <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-2">
                  ⚡ قوالب استحقاقات سريعة للفصل الدراسي:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => applyTemplate('exam')}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 text-xs font-bold hover:bg-rose-100"
                  >
                    📝 اختبار قصير
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('map_activity')}
                    className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 text-xs font-bold hover:bg-sky-100"
                  >
                    🎨 نشاط خريطة صماء
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('field_report')}
                    className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 text-xs font-bold hover:bg-amber-100"
                  >
                    📊 تقرير ميداني
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('vision_project')}
                    className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 text-xs font-bold hover:bg-teal-100"
                  >
                    🌱 مشروع بيئي 2040
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveEvent} className="mt-4 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-200 mb-1">
                  عنوان الاختبار أو الاستحقاق التربوي *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: الاختبار القصير الأول: جغرافية سلطنة عمان"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 font-bold"
                />
              </div>

              {/* Type & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">نوع الحدث</label>
                  <select
                    value={formData.type || 'exam'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as CalendarEventType })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value="exam">اختبار مقنن / تقويم 📝</option>
                    <option value="activity">نشاط / تطبيق عملي 🎨</option>
                    <option value="task">مهمة / تسليم مشروع 📌</option>
                    <option value="ministry_event">مناسبة وزارية / وطنية 🏛️</option>
                    <option value="lesson">حصة دراسية معتمدة 📖</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">مستوى الأولوية</label>
                  <select
                    value={formData.priority || 'high'}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as CalendarEventPriority })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value="urgent">عاجل جداً (امتحانات حاسمة)</option>
                    <option value="high">مرتفعة (اختبارات قصيرة ومشاريع)</option>
                    <option value="medium">متوسطة (أنشطة وتطبيقات)</option>
                    <option value="low">عادية (مراجعات ومتابعة)</option>
                  </select>
                </div>
              </div>

              {/* Subject & Grade */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">الصف الدراسي</label>
                  <select
                    value={formData.gradeName || 'الصف الثاني عشر'}
                    onChange={(e) => setFormData({ ...formData, gradeName: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value="الصف التاسع">الصف التاسع</option>
                    <option value="الصف العاشر">الصف العاشر</option>
                    <option value="الصف الحادي عشر">الصف الحادي عشر</option>
                    <option value="الصف الثاني عشر">الصف الثاني عشر</option>
                    <option value="كافة الصفوف (1 - 12)">كافة الصفوف</option>
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">الشعبة</label>
                  <input
                    type="text"
                    value={formData.section || ''}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    placeholder="12/1 أو جميع الشعب"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                  </input>
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">المادة</label>
                  <input
                    type="text"
                    value={formData.subjectName || ''}
                    onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                    placeholder="هذا وطني / جغرافيا"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>
              </div>

              {/* Dates & Times */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">تاريخ الاستحقاق *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value, endDate: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">وقت البدء</label>
                  <input
                    type="time"
                    value={formData.startTime || '08:00'}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">وقت الانتهاء</label>
                  <input
                    type="time"
                    value={formData.endTime || '09:00'}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>
              </div>

              {/* Location & Vision 2040 Pillar */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">المكان / القاعة</label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="قاعة الجغرافيا رقم 4"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">ركيزة رؤية عمان 2040</label>
                  <select
                    value={formData.vision2040Pillar || 'جودة التعليم والتعلم'}
                    onChange={(e) => setFormData({ ...formData, vision2040Pillar: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value="جودة التعليم والتعلم">جودة التعليم والتعلم</option>
                    <option value="المواطنة والهوية والتراث">المواطنة والهوية والتراث</option>
                    <option value="البيئة والموارد الطبيعية المستدامة">البيئة والموارد الطبيعية المستدامة</option>
                    <option value="الابتكار والبحث العلمي">الابتكار والبحث العلمي</option>
                    <option value="الاقتصاد المتنوع والريادة">الاقتصاد المتنوع والريادة</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  المحاور وملاحظات التقويم التربوي
                </label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="حدد الدروس والمفاهيم المشمولة، وأدوات التقييم، أو التوصيات الخاصة للطلاب..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEventModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md shadow-teal-900/20"
                >
                  {editingEvent ? 'حفظ التعديلات' : 'جدولة الموعد الآن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: DAY EVENTS DETAIL POPUP */}
      {/* ---------------------------------------------------- */}
      {selectedDayEvents && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-teal-600" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  استحقاقات يوم: {selectedDayEvents.dateStr}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDayEvents(null)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-2.5 max-h-[350px] overflow-y-auto">
              {selectedDayEvents.events.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  لا توجد اختبارات أو فعاليات مجدولة في هذا اليوم
                </div>
              ) : (
                selectedDayEvents.events.map((ev) => {
                  const cfg = EVENT_TYPE_CONFIG[ev.type];
                  return (
                    <div
                      key={ev.id}
                      className={`p-3 rounded-2xl border ${cfg.bgLight} ${cfg.borderColor} flex items-start justify-between gap-3`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>{cfg.icon}</span>
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white">{ev.title}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          <span>{ev.gradeName}</span> • <span>{ev.subjectName}</span> • <span>{ev.startTime || '08:00'}</span>
                        </div>
                        {ev.location && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            📍 {ev.location}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setSelectedDayEvents(null);
                            openEditModal(ev);
                          }}
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border text-slate-600 text-xs"
                          title="تعديل"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  const targetDate = selectedDayEvents.dateStr;
                  setSelectedDayEvents(null);
                  openCreateModal(targetDate);
                }}
                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة موعد في هذا اليوم</span>
              </button>

              <button
                onClick={() => setSelectedDayEvents(null)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: WHATSAPP DISPATCH */}
      {/* ---------------------------------------------------- */}
      {whatsappModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  إرسال جدول التقويم عبر الواتساب 📱
                </h3>
              </div>
              <button
                onClick={() => setWhatsappModalOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs text-slate-500 leading-relaxed">
                سيتم إرسال جدول الاستحقاقات والاختبارات المعتمدة مع اسم المدرسة والمديرية ومواعيد الحصص مباشرة إلى هاتف المعلم أو ولي الأمر.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  رقم الهاتف المستلم (مع مفتاح الدولة، مثل +968)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="+96877394680"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-center font-bold"
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                <div className="font-bold text-teal-700 dark:text-teal-300">محتوى الرسالة المرسلة:</div>
                <div>• ترويسة {schoolProfile.schoolName}</div>
                <div>• قائمة بـ {filteredEvents.length} استحقاق واختبار مجدول</div>
                <div>• التوقيت، القاعة، ومحاور التقييم التربوي</div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={handleCopyWhatsAppText}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5"
              >
                {copiedWhatsApp ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>{copiedWhatsApp ? 'تم النسخ!' : 'نسخ النص'}</span>
              </button>

              <button
                onClick={handleSendWhatsApp}
                disabled={sendingWhatsApp}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-emerald-900/20 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sendingWhatsApp ? 'جاري الإرسال...' : 'إرسال مباشر للواتساب'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
