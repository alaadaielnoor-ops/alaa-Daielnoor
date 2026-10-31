import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { WeeklyTimetable, TimetableEntry, SchoolDay, Grade } from '../../types/index.ts';
import { exportUnifiedPdf } from '../../utils/pdfExport.ts';
import { useSchoolProfile } from '../../hooks/useSchoolProfile.ts';
import {
  CalendarDays, Plus, Printer, Edit, Trash2, Clock,
  School, CheckCircle2, AlertCircle, X, Sparkles, BookOpen, User, Layers,
  Edit3, RefreshCw, Check, MessageSquare, Send, Smartphone, Copy, ExternalLink, Share2,
  Download, FileText
} from 'lucide-react';

const DAYS: SchoolDay[] = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];

const SUBJECT_COLORS = [
  { name: 'فيروزي / هذا وطني', color: '#0d9488' },
  { name: 'أزرق / الجغرافيا والتقنيات', color: '#0284c7' },
  { name: 'أخضر / الدراسات الاجتماعية', color: '#16a34a' },
  { name: 'كهرماني / نشاط وبحث', color: '#d97706' },
  { name: 'بنفسجي / ريادة وتوجيه', color: '#7c3aed' },
  { name: 'وردي / مشروع جماعي', color: '#db2777' },
];

export const WeeklyTimetableView: React.FC = () => {
  const { showToast, users, refreshUsers, currentUser } = useApp();
  const {
    schoolProfile,
    schoolName,
    teacherName,
    supervisorName,
    governorateName,
    directorateName,
    academicYear,
    semester,
    principalName,
    stampText,
    updateProfile,
    openEditModal: openSchoolProfileModal
  } = useSchoolProfile();

  const [timetables, setTimetables] = useState<WeeklyTimetable[]>([]);
  const [currentTimetable, setCurrentTimetable] = useState<WeeklyTimetable | null>(null);
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState<Grade[]>([]);

  // Cell editing modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ day: SchoolDay; periodNumber: number; entry?: TimetableEntry } | null>(null);
  const [cellForm, setCellForm] = useState({
    gradeId: 'grd-12',
    gradeName: 'الصف الثاني عشر',
    section: '12/1',
    subject: 'هذا وطني (تاريخ وجغرافية عمان)',
    room: 'قاعة الجغرافيا رقم 4',
    color: '#0d9488',
    notes: ''
  });

  // Timetable Metadata modal (Teacher name, School name, Academic year)
  const [metaModalOpen, setMetaModalOpen] = useState(false);
  const [metaForm, setMetaForm] = useState({
    teacherName: '',
    schoolName: '',
    directorateName: '',
    academicYear: '',
    semester: '',
    syncWithUser: true
  });
  const [savingMeta, setSavingMeta] = useState(false);

  // WhatsApp Share Modal
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [recipientPhone, setRecipientPhone] = useState(
    () => localStorage.getItem('om_edu_wa_recipient_phone') || '+96877394680'
  );
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  // Print and PDF Export states & ref
  const timetableCardRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const generateTimetableHtml = (tt: WeeklyTimetable) => {
    const teacher = tt.teacherName || teacherName || teacherUser?.name || 'أ. علاءالدين ضي النور محمد خليفة';
    const school = tt.schoolName || schoolName;
    const directorate = tt.directorateName || directorateName;
    const year = tt.academicYear || academicYear;
    const sem = tt.semester || semester;
    const totalQuota = tt.entries.length;

    const periodsHeader = tt.periods.map(p => `
      <th style="padding: 6px; border: 1px solid #94a3b8; background: ${p.isBreak ? '#fef3c7' : '#f1f5f9'}; font-size: 8.5pt;">
        <div>${p.name}</div>
        <div style="font-size: 7.5pt; color: #64748b; font-weight: normal;">${p.startTime} - ${p.endTime}</div>
      </th>
    `).join('');

    const rowsHtml = DAYS.map(day => {
      const cells = tt.periods.map(period => {
        if (period.isBreak) {
          return `<td style="padding: 4px; border: 1px solid #94a3b8; background: #fffbeb; color: #92400e; font-size: 8pt; text-align: center;">استراحة</td>`;
        }
        const entry = tt.entries.find(e => e.day === day && e.periodNumber === period.periodNumber);
        if (!entry) {
          return `<td style="padding: 4px; border: 1px solid #94a3b8; background: #ffffff; text-align: center; color: #cbd5e1;">-</td>`;
        }
        return `
          <td style="padding: 5px; border: 1px solid #94a3b8; background: #f0fdfa; border-right: 3px solid #0d9488; vertical-align: top; text-align: right;">
            <div style="font-weight: bold; font-size: 8.5pt; color: #0f172a;">${entry.gradeName} (${entry.section})</div>
            <div style="font-size: 7.5pt; color: #0d9488; font-weight: 600; margin-top: 2px;">${entry.subject}</div>
            ${entry.room ? `<div style="font-size: 7pt; color: #64748b;">${entry.room}</div>` : ''}
          </td>
        `;
      }).join('');

      return `
        <tr>
          <td style="padding: 6px; border: 1px solid #94a3b8; background: #f8fafc; font-weight: bold; text-align: center; font-size: 9pt;">${day}</td>
          ${cells}
        </tr>
      `;
    }).join('');

    return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <title>جدول الحصص الأسبوعي - ${teacher} - ${school}</title>
  <style>
    @page { size: A4 landscape; margin: 8mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Cairo', Tahoma, sans-serif; direction: rtl; margin: 0; padding: 12px; background: white; color: #0f172a; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
    .header-center { text-align: center; }
    .header-center h1 { margin: 2px 0; font-size: 14pt; color: #0f172a; font-weight: 900; }
    .header-center p { margin: 1px 0; font-size: 8.5pt; color: #475569; }
    .header-side { font-size: 8.5pt; line-height: 1.4; }
    .table-container { width: 100%; border-collapse: collapse; margin-top: 8px; }
    .signatures { margin-top: 25px; display: flex; justify-content: space-around; text-align: center; font-size: 9pt; }
    .signatures > div { width: 28%; }
    .signatures p { margin: 4px 0; }
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
    <span>🖨️ معاينة جدول الحصص الأسبوعي الرسمي المعتمد A4</span>
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
      <h1>جدول الحصص الأسبوعي للمعلم</h1>
      <p>نظام التخطيط المدرسي المعتمد - سلطنة عمان</p>
    </div>
    <div class="header-side" style="text-align: left;">
      <div><strong>العام الدراسي:</strong> ${year}</div>
      <div><strong>الفصل الدراسي:</strong> ${semester}</div>
      <div><strong>المعلم:</strong> <span style="font-weight: bold; color: #0d9488;">${teacher}</span></div>
      <div><strong>نصاب الحصص:</strong> ${totalQuota} حصة أسبوعياً</div>
    </div>
  </div>

  <table class="table-container">
    <thead>
      <tr>
        <th style="padding: 6px; border: 1px solid #94a3b8; background: #e2e8f0; font-size: 9pt; width: 85px;">اليوم / الحصة</th>
        ${periodsHeader}
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="signatures">
    <div>
      <p style="font-weight: bold;">معلم المادة</p>
      <p style="color: #0d9488; font-weight: bold; margin-top: 15px;">${teacher}</p>
      <p style="font-size: 8pt; color: #94a3b8; margin-top: 8px;">التوقيع: .....................</p>
    </div>
    <div>
      <p style="font-weight: bold;">المعلم الأول للمادة</p>
      <p style="color: #64748b; margin-top: 15px;">إشراف وتدقيق</p>
      <p style="font-size: 8pt; color: #94a3b8; margin-top: 8px;">التوقيع: .....................</p>
    </div>
    <div>
      <p style="font-weight: bold;">مدير / مديرة المدرسة</p>
      <p style="color: #64748b; margin-top: 15px;">الاعتماد والختم الرسمي</p>
      <p style="font-size: 8pt; color: #94a3b8; margin-top: 8px;">التوقيع والختم: .....................</p>
    </div>
  </div>
</body>
</html>`;
  };

  const handleExportTimetablePdf = async () => {
    if (!timetableCardRef.current || !currentTimetable) {
      showToast('الجدول غير جاهز للتصدير حالياً', 'error');
      return;
    }
    setIsExportingPdf(true);
    try {
      const cleanTeacher = (currentTimetable.teacherName || 'المعلم').replace(/[/\\?%*:|"<>]/g, '_');
      const filename = `جدول_الحصص_الأسبوعي_${cleanTeacher}.pdf`;
      const res = await exportUnifiedPdf(timetableCardRef.current, {
        filename,
        orientation: 'landscape',
        scale: 2,
        addPageNumbers: false,
        title: 'جدول الحصص الأسبوعي المعتمد',
        hideSelectors: ['.no-print', '[data-no-print]', 'button']
      });
      if (res.success) {
        showToast('📄 تم تصدير جدول الحصص بنجاح كملف PDF عالي الجودة والوضوح!', 'success');
      } else {
        showToast('تعذر تصدير الجدول إلى PDF: ' + (res.error || ''), 'error');
      }
    } catch (err: any) {
      showToast('خطأ أثناء تصدير PDF: ' + err.message, 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadPrintableHtmlTimetable = () => {
    if (!currentTimetable) return;
    const html = generateTimetableHtml(currentTimetable);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanTeacher = (currentTimetable.teacherName || 'المعلم').replace(/[/\\?%*:|"<>]/g, '_');
    a.download = `جدول_الحصص_الأسبوعي_${cleanTeacher}_للطباعة.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('📄 تم تنزيل صفحة الجدول الرسمية للطباعة! يمكنك فتحها والضغط على Ctrl+P للطباعة المباشرة بأعلى جودة.', 'success');
  };

  const handlePrintTimetable = async () => {
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
      await handleExportTimetablePdf();
    }
  };

  const getTimetableWhatsAppText = () => {
    if (!currentTimetable) return '';
    const teacher = currentTimetable.teacherName || teacherUser?.name || 'أ. مريم المعمرية';
    const school = currentTimetable.schoolName || 'مدرسة كعب بن برشة للتعليم الأساسي';
    const totalClasses = currentTimetable.entries.length;

    let text = `🗓️ *جدول الحصص الأسبوعي* 🇴🇲\n`;
    text += `🏫 *المدرسة:* ${school}\n`;
    text += `👩‍🏫 *المعلم/ـة:* ${teacher}\n`;
    text += `📊 *إجمالي الحصص:* ${totalClasses} حصة أسبوعياً\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    DAYS.forEach(day => {
      const dayEntries = currentTimetable.entries
        .filter(e => e.day === day)
        .sort((a, b) => a.periodNumber - b.periodNumber);
      
      text += `📌 *يوم ${day}* (${dayEntries.length} حصص):\n`;
      if (dayEntries.length === 0) {
        text += `   _لا توجد حصص مسجلة_\n\n`;
      } else {
        dayEntries.forEach(ent => {
          text += `   • الحصة ${ent.periodNumber}: ${ent.gradeName} (${ent.section}) - ${ent.subject}`;
          if (ent.room) text += ` [${ent.room}]`;
          text += `\n`;
        });
        text += `\n`;
      }
    });

    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `✨ تم تصديره عبر نظام تحضير المناهج العمانية`;
    return text;
  };

  const handleOpenDirectWhatsApp = () => {
    const text = getTimetableWhatsAppText();
    let url = '';
    const cleanNumber = recipientPhone.replace(/\D/g, '');
    if (cleanNumber) {
      url = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(text)}`;
    } else {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    }
    window.open(url, '_blank');
  };

  const handleSendViaCloudApi = async () => {
    const text = getTimetableWhatsAppText();
    if (!recipientPhone) {
      showToast('يرجى كتابة رقم الهاتف المستلم', 'info');
      return;
    }
    setSendingWhatsApp(true);
    try {
      localStorage.setItem('om_edu_wa_recipient_phone', recipientPhone.trim());
      const res = await api.sendCustomWhatsAppMessage({
        toPhone: recipientPhone.trim(),
        messageText: text
      });
      if (res.success) {
        showToast('تم إرسال جدول الحصص إلى واتساب هاتفك بنجاح 📲', 'success');
        setWhatsappModalOpen(false);
      } else {
        showToast('تنبيه: ' + (res.error || res.message || 'تعذر الإرسال السحابي، يمكنك استخدام زر فتح واتساب المباشر'), 'info');
      }
    } catch (err: any) {
      showToast('تعذر الإرسال الآلي: ' + err.message + ' (يمكنك استخدام زر فتح واتساب المباشر)', 'info');
    } finally {
      setSendingWhatsApp(false);
    }
  };

  const handleCopyWhatsAppText = () => {
    const text = getTimetableWhatsAppText();
    navigator.clipboard.writeText(text);
    setCopiedWhatsApp(true);
    showToast('تم نسخ نص الجدول كاملاً للحافظة', 'success');
    setTimeout(() => setCopiedWhatsApp(false), 2500);
  };

  // Find active teacher user from registered users
  const teacherUser = users.find(u => u.role === 'teacher') || users.find(u => u.id === 'usr-teacher-1');

  const loadData = async () => {
    try {
      setLoading(true);
      const [ttRes, taxRes] = await Promise.all([
        api.getTimetables(),
        api.getTaxonomy()
      ]);
      if (ttRes.success && ttRes.timetables) {
        setTimetables(ttRes.timetables);
        if (ttRes.timetables.length > 0) {
          const tt = ttRes.timetables[0];
          // Auto-sync if teacherUser name is available and updated
          if (teacherUser && teacherUser.name && tt.teacherName !== teacherUser.name) {
            tt.teacherName = teacherUser.name;
          }
          setCurrentTimetable(tt);
        }
      }
      if (taxRes.success && taxRes.taxonomy?.grades) {
        setGrades(taxRes.taxonomy.grades);
      }
    } catch (err: any) {
      showToast('تعذر تحميل جدول الحصص: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [teacherUser?.name]);

  const openMetaModal = () => {
    if (!currentTimetable) return;
    setMetaForm({
      teacherName: currentTimetable.teacherName || teacherName || teacherUser?.name || 'أ. علاءالدين ضي النور محمد خليفة',
      schoolName: currentTimetable.schoolName || schoolName,
      directorateName: currentTimetable.directorateName || directorateName,
      academicYear: currentTimetable.academicYear || academicYear,
      semester: currentTimetable.semester || semester,
      syncWithUser: true
    });
    setMetaModalOpen(true);
  };

  const handleSaveMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTimetable) return;

    setSavingMeta(true);
    const newTeacherName = metaForm.teacherName.trim() || currentTimetable.teacherName || teacherName || 'أ. علاءالدين ضي النور محمد خليفة';

    const updatedTT: WeeklyTimetable = {
      ...currentTimetable,
      teacherName: newTeacherName,
      schoolName: metaForm.schoolName.trim() || currentTimetable.schoolName || schoolName,
      directorateName: metaForm.directorateName.trim() || currentTimetable.directorateName || directorateName,
      academicYear: metaForm.academicYear.trim() || currentTimetable.academicYear || academicYear,
      semester: metaForm.semester.trim() || currentTimetable.semester || semester,
      updatedAt: new Date().toISOString()
    };

    try {
      const res = await api.saveTimetable(updatedTT);
      if (res.success) {
        setCurrentTimetable(res.timetable);
        setTimetables(prev => prev.map(t => t.id === res.timetable.id ? res.timetable : t));

        // Cascade to global school profile and user profile so other sections reflect it
        if (metaForm.syncWithUser) {
          await updateProfile({
            schoolName: updatedTT.schoolName,
            directorateName: updatedTT.directorateName,
            teacherName: newTeacherName,
            academicYear: updatedTT.academicYear,
            semester: updatedTT.semester
          }, true);
        }

        setMetaModalOpen(false);
        showToast(`تم تعميم وحفظ اسم الأستاذ "${newTeacherName}" والمدرسة في جدول الحصص وكافة وثائق المنصة! 🏫`, 'success');
      }
    } catch (err: any) {
      showToast('تعذر حفظ بيانات الجدول: ' + err.message, 'error');
    } finally {
      setSavingMeta(false);
    }
  };

  const handleSyncFromTeacherUser = async () => {
    if (!currentTimetable || !teacherUser) return;
    const updatedTT: WeeklyTimetable = {
      ...currentTimetable,
      teacherName: teacherUser.name,
      updatedAt: new Date().toISOString()
    };

    try {
      const res = await api.saveTimetable(updatedTT);
      if (res.success) {
        setCurrentTimetable(res.timetable);
        setTimetables(prev => prev.map(t => t.id === res.timetable.id ? res.timetable : t));
        showToast(`تمت مزامنة اسم المعلم في الجدول فورياً مع: "${teacherUser.name}"`, 'success');
      }
    } catch (err: any) {
      showToast('فشلت المزامنة: ' + err.message, 'error');
    }
  };

  const handleCellClick = (day: SchoolDay, periodNumber: number, existingEntry?: TimetableEntry) => {
    setSelectedCell({ day, periodNumber, entry: existingEntry });
    if (existingEntry) {
      setCellForm({
        gradeId: existingEntry.gradeId,
        gradeName: existingEntry.gradeName,
        section: existingEntry.section,
        subject: existingEntry.subject,
        room: existingEntry.room,
        color: existingEntry.color || '#0d9488',
        notes: existingEntry.notes || ''
      });
    } else {
      setCellForm({
        gradeId: 'grd-12',
        gradeName: 'الصف الثاني عشر',
        section: '12/1',
        subject: 'هذا وطني (تاريخ وجغرافية عمان)',
        room: 'قاعة الجغرافيا رقم 4',
        color: '#0d9488',
        notes: ''
      });
    }
    setEditModalOpen(true);
  };

  const handleSaveCell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTimetable || !selectedCell) return;

    let updatedEntries = [...currentTimetable.entries];

    if (selectedCell.entry) {
      // Update existing
      updatedEntries = updatedEntries.map(ent =>
        ent.id === selectedCell.entry?.id
          ? {
              ...ent,
              ...cellForm
            }
          : ent
      );
    } else {
      // Create new entry
      const newEntry: TimetableEntry = {
        id: `ent-${Date.now()}`,
        day: selectedCell.day,
        periodNumber: selectedCell.periodNumber,
        ...cellForm
      };
      updatedEntries.push(newEntry);
    }

    const updatedTT: WeeklyTimetable = {
      ...currentTimetable,
      entries: updatedEntries
    };

    try {
      const res = await api.saveTimetable(updatedTT);
      if (res.success) {
        setCurrentTimetable(res.timetable);
        setTimetables(prev => prev.map(t => t.id === res.timetable.id ? res.timetable : t));
        setEditModalOpen(false);
        showToast('تم تحديث الحصة في الجدول بنجاح', 'success');
      }
    } catch (err: any) {
      showToast('تعذر حفظ الحصة: ' + err.message, 'error');
    }
  };

  const handleDeleteEntry = async () => {
    if (!currentTimetable || !selectedCell?.entry) return;

    const updatedEntries = currentTimetable.entries.filter(ent => ent.id !== selectedCell.entry?.id);
    const updatedTT: WeeklyTimetable = {
      ...currentTimetable,
      entries: updatedEntries
    };

    try {
      const res = await api.saveTimetable(updatedTT);
      if (res.success) {
        setCurrentTimetable(res.timetable);
        setTimetables(prev => prev.map(t => t.id === res.timetable.id ? res.timetable : t));
        setEditModalOpen(false);
        showToast('تم إخلاء الحصة من الجدول', 'info');
      }
    } catch (err: any) {
      showToast('تعذر حذف الحصة: ' + err.message, 'error');
    }
  };

  // Metrics
  const activeEntriesCount = currentTimetable ? currentTimetable.entries.length : 0;
  const maxQuota = 24; // Standard quota in Oman
  const quotaPercentage = Math.min(100, Math.round((activeEntriesCount / maxQuota) * 100));

  const uniqueClassesCount = currentTimetable
    ? new Set(currentTimetable.entries.map(e => `${e.gradeName} - ${e.section}`)).size
    : 0;

  // Active teacher name to display (synchronized)
  const displayTeacherName = currentTimetable?.teacherName || teacherName || teacherUser?.name || 'أ. علاءالدين ضي النور محمد خليفة';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-sky-950 via-teal-900 to-slate-900 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/30 text-xs font-semibold mb-3">
            <School className="w-3.5 h-3.5 text-amber-300" />
            <span>نظام الجداول المدرسية - سلطنة عمان</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black mb-2 tracking-tight">
            جدول الحصص الأسبوعي التفاعلي
          </h1>
          <p className="text-slate-200 text-sm md:text-base leading-relaxed">
            تنظيم وتوزيع جدول الحصص الأسبوعي (من الأحد إلى الخميس) وفق مواعيد اليوم الدراسي في مدارس سلطنة عمان، مع احتساب نصاب الحصص للمعلم والصفوف المخدومة وإمكانية الطباعة الرسمية للإدارة والطلاب.
          </p>

          <div className="flex flex-wrap gap-2.5 mt-5">
            <button
              onClick={openMetaModal}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>تعديل اسم الأستاذة وبيانات الجدول</span>
            </button>

            <button
              onClick={handleExportTimetablePdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-xs shadow-md transition cursor-pointer disabled:opacity-60"
              title="تصدير جدول الحصص إلى ملف PDF عالي الجودة"
            >
              {isExportingPdf ? <RefreshCw className="w-4 h-4 animate-spin text-slate-950" /> : <Download className="w-4 h-4" />}
              <span>{isExportingPdf ? 'جاري تجهيز PDF...' : 'تصدير PDF رسمي 📄'}</span>
            </button>

            <button
              onClick={handlePrintTimetable}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 backdrop-blur-xs shadow-md transition cursor-pointer"
              title="طباعة الجدول المدرسي أو حفظه كـ PDF"
            >
              <Printer className="w-4 h-4 text-teal-300" />
              <span>طباعة الجدول المدرسي 🖨️</span>
            </button>

            <button
              onClick={handleDownloadPrintableHtmlTimetable}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 backdrop-blur-xs transition cursor-pointer"
              title="تنزيل صفحة HTML رسمية مستقلة تفتح وتطبع بـ Ctrl+P في أي متصفح"
            >
              <FileText className="w-4 h-4 text-sky-300" />
              <span>ملف طباعة مستقل 🌐</span>
            </button>

            <button
              onClick={() => setWhatsappModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md transition cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-emerald-950" />
              <span>مشاركة عبر واتساب 📲</span>
            </button>
          </div>
        </div>

        {/* Ambient watermark background */}
        <div className="absolute left-6 -bottom-8 opacity-10 pointer-events-none">
          <CalendarDays className="w-64 h-64 text-sky-300" />
        </div>
      </div>

      {/* Sync Alert if teacher user name differs from timetable name */}
      {teacherUser && currentTimetable && currentTimetable.teacherName !== teacherUser.name && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-extrabold block">ملاحظة مزامنة اسم المعلم:</span>
              <span>
                اسم المعلم في ملف المستخدمين هو: <strong>"{teacherUser.name}"</strong> بينما يظهر في الجدول كـ: <strong>"{currentTimetable.teacherName}"</strong>.
              </span>
            </div>
          </div>
          <button
            onClick={handleSyncFromTeacherUser}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shrink-0 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>مزامنة اسم المعلم في الجدول فوراً</span>
          </button>
        </div>
      )}

      {/* Teacher Workload Stats Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:hidden">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500">نصاب الحصص الأسبوعي:</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-teal-600 dark:text-teal-400">{activeEntriesCount}</span>
              <span className="text-xs text-slate-400 font-semibold">/ {maxQuota} حصة</span>
            </div>
            <div className="w-28 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-teal-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${quotaPercentage}%` }}
              />
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500">الصفوف والشعب المخدومة:</span>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-0.5">{uniqueClassesCount}</p>
            <p className="text-[10px] text-slate-400 mt-1">توزيع على شعب العاشر والحادي عشر والثاني عشر</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500">أيام التدريس الأسبوعية:</span>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-0.5">5 أيام (الأحد - الخميس)</p>
            <p className="text-[10px] text-emerald-600 font-medium mt-1">نظام التعليم بسلطنة عمان</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>

        {/* Teacher Profile Card with Quick Edit */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between group">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-500">معلم المادة:</span>
              <button
                onClick={openMetaModal}
                className="text-[10px] text-teal-600 hover:text-teal-700 font-bold inline-flex items-center gap-0.5 cursor-pointer"
                title="تعديل اسم المعلم"
              >
                <Edit3 className="w-3 h-3" />
                <span>تعديل</span>
              </button>
            </div>
            <p className="text-sm font-black text-slate-800 dark:text-slate-100 mt-0.5 truncate">
              {displayTeacherName}
            </p>
            <p className="text-[10px] text-slate-400 mt-1 truncate">{currentTimetable?.schoolName || schoolName || 'مدرسة كعب بن برشة'}</p>
          </div>
          <div
            onClick={openMetaModal}
            className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 hover:bg-purple-100 transition flex items-center justify-center shrink-0 cursor-pointer"
            title="انقر لتعديل بيانات المعلم"
          >
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Timetable Card */}
      {currentTimetable && (
        <div ref={timetableCardRef} className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm print:p-0 print:border-none print:shadow-none space-y-6 printable-document">
          {/* Quick Action Toolbar directly inside timetable card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-dashed border-slate-200 dark:border-slate-800 print:hidden text-xs gap-3">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
              <span className="font-bold">جدول الحصص المعتمد - جاهز للطباعة المباشرة والتصدير A4</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleExportTimetablePdf}
                disabled={isExportingPdf}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                title="تصدير جدول الحصص إلى ملف PDF عالي الجودة"
              >
                {isExportingPdf ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>{isExportingPdf ? 'جاري تجهيز PDF...' : 'تصدير PDF 📄'}</span>
              </button>
              <button
                onClick={handlePrintTimetable}
                className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="طباعة الجدول عبر المتصفح"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة الجدول 🖨️</span>
              </button>
              <button
                onClick={handleDownloadPrintableHtmlTimetable}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="تنزيل ملف HTML رسمي يفتح في نافذة مستقلة للطباعة الفورية بـ Ctrl+P"
              >
                <FileText className="w-3.5 h-3.5 text-sky-600" />
                <span>ملف طباعة مستقل</span>
              </button>
              <button
                onClick={openMetaModal}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="تعديل ترويسة الجدول والمدرسة والمعلم"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                <span>تعديل البيانات</span>
              </button>
            </div>
          </div>
          {/* Print/Official Header */}
          <div className="border-b-2 border-slate-800 pb-4 text-center">
            <div className="flex items-center justify-between text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300">
              <div className="text-right">
                <p className="text-slate-900 dark:text-white font-extrabold text-sm md:text-base">سلطنة عمان</p>
                <p>وزارة التربية والتعليم</p>
                <p>{currentTimetable.directorateName}</p>
                <p className="text-teal-700 dark:text-teal-400 font-semibold">{currentTimetable.schoolName}</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-sky-800 text-amber-300 flex items-center justify-center shadow-md">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white mt-1">
                  جدول الحصص الأسبوعي للمعلم
                </h2>
              </div>

              <div className="text-left">
                <p>العام الدراسي: <span className="font-semibold">{currentTimetable.academicYear}</span></p>
                <p>الفصل الدراسي: <span className="font-semibold">{currentTimetable.semester}</span></p>
                <p className="flex items-center gap-1 justify-end">
                  <span>المعلم:</span>
                  <span className="font-bold text-teal-700 dark:text-teal-300">{displayTeacherName}</span>
                  <button
                    onClick={openMetaModal}
                    className="no-print p-0.5 text-slate-400 hover:text-teal-600 transition"
                    title="تعديل اسم المعلم"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </p>
                <p>نصاب الحصص: <span className="font-semibold text-teal-600">{activeEntriesCount} حصة</span></p>
              </div>
            </div>
          </div>

          {/* Interactive Grid Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse border border-slate-300 dark:border-slate-700 text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-300 dark:border-slate-700">
                  <th className="p-3 border border-slate-300 dark:border-slate-700 w-24">اليوم / الحصة</th>
                  {currentTimetable.periods.map(period => (
                    <th
                      key={period.periodNumber}
                      className={`p-2.5 border border-slate-300 dark:border-slate-700 ${
                        period.isBreak ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 w-20' : ''
                      }`}
                    >
                      <span className="block font-bold">{period.name}</span>
                      <span className="block text-[10px] font-normal text-slate-400 mt-0.5">
                        {period.startTime} - {period.endTime}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map(day => (
                  <tr key={day} className="border-b border-slate-200 dark:border-slate-800">
                    <td className="p-3 bg-slate-50 dark:bg-slate-800/80 font-bold text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                      {day}
                    </td>

                    {currentTimetable.periods.map(period => {
                      if (period.isBreak) {
                        return (
                          <td
                            key={period.periodNumber}
                            className="p-2 border border-slate-300 dark:border-slate-700 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 font-semibold text-[11px] select-none"
                          >
                            استراحة
                          </td>
                        );
                      }

                      const entry = currentTimetable.entries.find(
                        e => e.day === day && e.periodNumber === period.periodNumber
                      );

                      return (
                        <td
                          key={period.periodNumber}
                          onClick={() => handleCellClick(day, period.periodNumber, entry)}
                          className={`p-2 border border-slate-300 dark:border-slate-700 h-20 transition cursor-pointer relative group ${
                            entry
                              ? 'hover:brightness-95'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                          style={{
                            backgroundColor: entry?.color ? `${entry.color}15` : undefined,
                            borderRight: entry?.color ? `4px solid ${entry.color}` : undefined
                          }}
                        >
                          {entry ? (
                            <div className="flex flex-col justify-between h-full text-right p-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-[11px] text-slate-900 dark:text-white">
                                  {entry.gradeName} ({entry.section})
                                </span>
                                <Edit className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition no-print" />
                              </div>
                              <p className="text-[10px] text-slate-600 dark:text-slate-300 line-clamp-1 font-medium">
                                {entry.subject}
                              </p>
                              <div className="flex items-center justify-between text-[9px] text-slate-400">
                                <span className="truncate max-w-[80px]">{entry.room}</span>
                                {entry.notes && <span className="w-1.5 h-1.5 rounded-full bg-teal-500" title={entry.notes} />}
                              </div>
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-slate-400 no-print">
                              <Plus className="w-4 h-4" />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Official Signatures Block (For Print) */}
          <div className="pt-8 border-t border-slate-300 dark:border-slate-700 grid grid-cols-3 gap-6 text-center text-xs font-semibold text-slate-700 dark:text-slate-300">
            <div className="space-y-6">
              <p>معلم المادة</p>
              <p className="text-slate-800 dark:text-slate-200 font-bold">{displayTeacherName}</p>
              <p className="text-[10px] text-slate-400">التوقيع: .....................</p>
            </div>
            <div className="space-y-6">
              <p>المعلم الأول لمادة الدراسات الاجتماعية</p>
              <p className="text-slate-500 font-normal">.................................</p>
              <p className="text-[10px] text-slate-400">التوقيع: .....................</p>
            </div>
            <div className="space-y-6">
              <p>مدير / مديرة المدرسة (الاعتماد الرسمي)</p>
              <p className="text-slate-500 font-normal">.................................</p>
              <p className="text-[10px] text-slate-400">الختم والتوقيع: .....................</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Timetable Metadata Modal (Teacher, School, Directorate) */}
      {metaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-right my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-teal-600" />
                <span>تعديل اسم الأستاذة وبيانات الجدول الرسمي</span>
              </h3>
              <button
                onClick={() => setMetaModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMeta} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم المعلم / الأستاذة <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={metaForm.teacherName}
                  onChange={e => setMetaForm(prev => ({ ...prev, teacherName: e.target.value }))}
                  placeholder="مثال: أ. مريم بنت عبدالله المعمرية"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                />

                {/* Quick Pick Chips */}
                <div className="mt-2 space-y-1">
                  <span className="text-[10px] text-slate-400 font-medium">اقتراحات سريعة من حسابات النظام:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {users.map(u => (
                      <button
                        type="button"
                        key={u.id}
                        onClick={() => setMetaForm(prev => ({ ...prev, teacherName: u.name }))}
                        className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 hover:text-teal-700 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                      >
                        {u.name} {u.role === 'teacher' ? '(معلم)' : u.role === 'admin' ? '(مالك)' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم المدرسة:
                </label>
                <input
                  type="text"
                  value={metaForm.schoolName}
                  onChange={e => setMetaForm(prev => ({ ...prev, schoolName: e.target.value }))}
                  placeholder="مثال: مدرسة كعب بن برشة للتعليم الأساسي"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  المديرية التعليمية:
                </label>
                <input
                  type="text"
                  value={metaForm.directorateName}
                  onChange={e => setMetaForm(prev => ({ ...prev, directorateName: e.target.value }))}
                  placeholder="المديرية العامة للتربية والتعليم بمحافظة شمال الباطنة"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    العام الدراسي:
                  </label>
                  <input
                    type="text"
                    value={metaForm.academicYear}
                    onChange={e => setMetaForm(prev => ({ ...prev, academicYear: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الفصل الدراسي:
                  </label>
                  <input
                    type="text"
                    value={metaForm.semester}
                    onChange={e => setMetaForm(prev => ({ ...prev, semester: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Sync Checkbox */}
              <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="syncTeacherUser"
                  checked={metaForm.syncWithUser}
                  onChange={e => setMetaForm(prev => ({ ...prev, syncWithUser: e.target.checked }))}
                  className="w-4 h-4 text-teal-600 rounded-md focus:ring-teal-500"
                />
                <label htmlFor="syncTeacherUser" className="text-xs text-teal-950 dark:text-teal-200 font-bold cursor-pointer">
                  مزامنة هذا الاسم وتحديثه فورياً في حساب المعلم في سجل المستخدمين
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setMetaModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={savingMeta}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {savingMeta ? 'جاري الحفظ...' : 'حفظ وتحديث البيانات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Single Period Cell Modal */}
      {editModalOpen && selectedCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-right my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-600" />
                <span>
                  {selectedCell.entry ? 'تعديل بيانات الحصة' : 'إضافة حصة دراسية جديدة'}
                </span>
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
              <span>اليوم: <strong>{selectedCell.day}</strong></span>
              <span>الحصة: <strong>{currentTimetable?.periods.find(p => p.periodNumber === selectedCell.periodNumber)?.name}</strong></span>
            </div>

            <form onSubmit={handleSaveCell} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">الصف الدراسي:</label>
                <select
                  value={cellForm.gradeId}
                  onChange={e => {
                    const selectedG = grades.find(g => g.id === e.target.value);
                    setCellForm(prev => ({
                      ...prev,
                      gradeId: e.target.value,
                      gradeName: selectedG ? selectedG.name : prev.gradeName
                    }));
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                >
                  {grades.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">الشعبة:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: 12/1"
                    value={cellForm.section}
                    onChange={e => setCellForm(prev => ({ ...prev, section: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">القاعة / المختبر:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: قاعة الجغرافيا 4"
                    value={cellForm.room}
                    onChange={e => setCellForm(prev => ({ ...prev, room: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">المادة الدراسية:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: هذا وطني (تاريخ وجغرافية عمان)"
                  value={cellForm.subject}
                  onChange={e => setCellForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">تمييز اللون:</label>
                <div className="flex items-center gap-2">
                  {SUBJECT_COLORS.map(c => (
                    <button
                      type="button"
                      key={c.color}
                      onClick={() => setCellForm(prev => ({ ...prev, color: c.color }))}
                      className={`w-7 h-7 rounded-full border-2 transition ${
                        cellForm.color === c.color ? 'border-slate-900 dark:border-white scale-110 shadow-md' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.color }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">ملاحظات إضافية على الحصة (اختياري):</label>
                <input
                  type="text"
                  placeholder="مثال: تطبيق عملي على الخرائط الطبوغرافية"
                  value={cellForm.notes}
                  onChange={e => setCellForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                {selectedCell.entry ? (
                  <button
                    type="button"
                    onClick={handleDeleteEntry}
                    className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-bold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>إخلاء الحصة</span>
                  </button>
                ) : <span />}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-slate-500 font-semibold cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold cursor-pointer"
                  >
                    حفظ في الجدول
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Share Modal */}
      {whatsappModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    مشاركة جدول الحصص عبر واتساب 📲
                  </h3>
                  <p className="text-xs text-slate-500">
                    إرسال الجدول منسقاً بلمسة واحدة إلى هاتفك أو مجموعات المدرسة
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

            {/* Recipient Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                رقم الهاتف المستلم (اختياري - يمكنك تركه فارغاً لاختيار المحادثة من الواتساب مباشرة):
              </label>
              <input
                type="text"
                value={recipientPhone}
                onChange={e => setRecipientPhone(e.target.value)}
                placeholder="+96877394680"
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
              />
              <span className="text-[11px] text-slate-400">
                إذا تركت الرقم فارغاً وضغطت (فتح في واتساب)، سيفتح تطبيق الواتساب لتختار أي شخص أو مجموعة مدرسية تشاء.
              </span>
            </div>

            {/* Preview of Formatted WhatsApp Message */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  معاينة الرسالة كما ستصل في الواتساب:
                </label>
                <button
                  onClick={handleCopyWhatsAppText}
                  className="text-xs text-teal-600 hover:text-teal-700 font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedWhatsApp ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedWhatsApp ? 'تم النسخ' : 'نسخ النص'}</span>
                </button>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 max-h-48 overflow-y-auto text-xs font-sans text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed select-all">
                {getTimetableWhatsAppText()}
              </div>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Option 1: Direct Open in WhatsApp (100% works without any tokens) */}
              <button
                onClick={handleOpenDirectWhatsApp}
                className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>فتح في واتساب فوراً (ويب / تطبيق)</span>
              </button>

              {/* Option 2: Send via Cloud API (if configured) */}
              <button
                onClick={handleSendViaCloudApi}
                disabled={sendingWhatsApp}
                className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {sendingWhatsApp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-emerald-400" />}
                <span>{sendingWhatsApp ? 'جاري الإرسال...' : 'إرسال آلي عبر Meta Cloud API'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
