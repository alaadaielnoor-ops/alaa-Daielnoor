import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import {
  Student,
  StudentGradeRecord,
  StudentAttendanceRecord,
  StudentPedagogicalNote,
  StudentOfficialLetterRef,
  Grade,
  StudentPerformanceAlert
} from '../../types/index.ts';
import { exportUnifiedPdf } from '../../utils/pdfExport.ts';
import { useSchoolProfile } from '../../hooks/useSchoolProfile.ts';
import {
  UserCheck, Users, Search, Plus, Printer, Edit3, Trash2,
  CheckCircle2, AlertCircle, Clock, Award, FileText, Send,
  MessageSquare, Compass, School, Sparkles, Filter, ChevronLeft,
  Calendar, Layers, Phone, MapPin, Heart, BookOpen, AlertTriangle,
  Check, X, Eye, FileSpreadsheet, Upload, Download, TrendingUp, BarChart3,
  TrendingDown, Bell, RefreshCw, ShieldAlert, BookCheck, Share2
} from 'lucide-react';
import { StudentAnalyticsChart } from './StudentAnalyticsChart.tsx';


const ACADEMIC_STATUS_CONFIG = {
  excellent: { label: 'ممتاز / متفوق', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300' },
  good: { label: 'جيد جداً', badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300' },
  average: { label: 'متوسط', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300' },
  needs_support: { label: 'يحتاج دعم علاجي', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300' },
};

const NOTE_CATEGORY_CONFIG = {
  positive: { label: 'إشادة وتميز', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  academic: { label: 'مستوى أكاديمي', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  behavioral: { label: 'سلوك ومواظبة', color: 'text-purple-700 bg-purple-50 border-purple-200' },
  support_needed: { label: 'خطة علاجية', color: 'text-rose-700 bg-rose-50 border-rose-200' },
  special_talent: { label: 'موهبة خاصة', color: 'text-amber-700 bg-amber-50 border-amber-200' },
};

export const StudentsManagementView: React.FC = () => {
  const {
    showToast,
    currentUser,
    setActiveView,
    studentAlerts,
    unreadStudentAlertsCount,
    studentAlertStats,
    refreshStudentAlerts,
    markAlertAsRead,
    markAllAlertsAsRead
  } = useApp();

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

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Management Mode (Students Directory vs Performance Alerts)
  const [managementMode, setManagementMode] = useState<'students' | 'alerts'>('students');

  // Filters for Students Directory
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Filters for Performance Alerts
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<string>('all');
  const [alertSectionFilter, setAlertSectionFilter] = useState<string>('all');
  const [alertOnlyUnread, setAlertOnlyUnread] = useState(false);
  const [generatingRemedialAlertId, setGeneratingRemedialAlertId] = useState<string | null>(null);
  const [isRecomputingAlerts, setIsRecomputingAlerts] = useState(false);

  // WhatsApp Alert Modal
  const [whatsappAlertModalOpen, setWhatsappAlertModalOpen] = useState(false);
  const [selectedAlertForWhatsApp, setSelectedAlertForWhatsApp] = useState<StudentPerformanceAlert | null>(null);
  const [customWhatsAppMsg, setCustomWhatsAppMsg] = useState('');
  const [isSendingWhatsAppAlert, setIsSendingWhatsAppAlert] = useState(false);

  // Selected Student for Detailed Profile Modal
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'grades' | 'attendance' | 'notes' | 'letters' | 'custom' | 'report_card' | 'analytics'>('profile');

  // PDF Export State & Refs
  const reportCardRef = useRef<HTMLDivElement>(null);
  const classReportRef = useRef<HTMLDivElement>(null);
  const [isExportingReportCard, setIsExportingReportCard] = useState(false);
  const [isExportingClassReport, setIsExportingClassReport] = useState(false);

  const handleExportStudentReportCard = async () => {
    if (!reportCardRef.current || !selectedStudent) return;
    setIsExportingReportCard(true);
    try {
      const cleanName = selectedStudent.fullName.replace(/[/\\?%*:|"<>]/g, '_');
      const filename = `بطاقة_تقرير_الطالب_${cleanName}.pdf`;
      const res = await exportUnifiedPdf(reportCardRef.current, {
        filename,
        orientation: 'portrait',
        scale: 2,
        title: `بطاقة تقرير الطالب: ${selectedStudent.fullName}`,
        addPageNumbers: true,
        hideSelectors: ['.no-print', '[data-no-print]', 'button']
      });
      if (res.success) {
        showToast('📄 تم تصدير بطاقة تقرير الطالب كملف PDF رسمي بنجاح!', 'success');
      } else {
        showToast('تعذر تصدير تقرير الطالب: ' + (res.error || ''), 'error');
      }
    } catch (err: any) {
      showToast('خطأ أثناء تصدير PDF: ' + err.message, 'error');
    } finally {
      setIsExportingReportCard(false);
    }
  };

  const handleExportClassReport = async () => {
    if (!classReportRef.current) return;
    setIsExportingClassReport(true);
    try {
      const gradeLabel = selectedGrade === 'all' ? 'جميع_الصفوف' : selectedGrade.replace(/[/\\?%*:|"<>]/g, '_');
      const filename = `كشف_تقرير_الطلاب_${gradeLabel}.pdf`;
      const res = await exportUnifiedPdf(classReportRef.current, {
        filename,
        orientation: 'landscape',
        scale: 2,
        title: 'كشف درجات وسجل متابعة التحصيل الدراسي للطلاب',
        addPageNumbers: true,
        hideSelectors: ['.no-print', '[data-no-print]', 'button']
      });
      if (res.success) {
        showToast('📄 تم تصدير كشف وسجل تقرير الطلاب كملف PDF رسمي بنجاح!', 'success');
      } else {
        showToast('تعذر تصدير كشف الطلاب: ' + (res.error || ''), 'error');
      }
    } catch (err: any) {
      showToast('خطأ أثناء تصدير PDF: ' + err.message, 'error');
    } finally {
      setIsExportingClassReport(false);
    }
  };

  // Modals
  const [studentFormModalOpen, setStudentFormModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [bulkImportModalOpen, setBulkImportModalOpen] = useState(false);
  const [bulkNamesText, setBulkNamesText] = useState('');
  const [bulkGrade, setBulkGrade] = useState('الصف الثاني عشر (دبلوم التعليم العام)');
  const [bulkSection, setBulkSection] = useState('12/1');

  // Sub-forms inside student dossier
  const [newGradeForm, setNewGradeForm] = useState({
    assessmentName: 'الاختبار القصير الثاني: جغرافية سلطنة عمان',
    category: 'short_exam' as StudentGradeRecord['category'],
    maxScore: 10,
    obtainedScore: 9,
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [newAttendanceForm, setNewAttendanceForm] = useState({
    date: new Date().toISOString().split('T')[0],
    status: 'present' as StudentAttendanceRecord['status'],
    reason: ''
  });

  const [newNoteForm, setNewNoteForm] = useState({
    category: 'positive' as StudentPedagogicalNote['category'],
    title: 'تفاعل متميز في حصة الجغرافيا',
    content: 'أظهر الطالب استيعاباً ممتازاً للتضاريس العمانية وشارك في توضيح مواقع الأفلاج.',
    actionTaken: 'تسجيل نقطة إيجابية في سجل التعزيز المدرسي'
  });

  const [newCustomFieldForm, setNewCustomFieldForm] = useState({
    name: '',
    value: ''
  });

  // Main student form state
  const [studentFormData, setStudentFormData] = useState<Partial<Student>>({
    fullName: '',
    nationalId: '',
    studentNumber: '',
    gender: 'male',
    gradeName: 'الصف الثاني عشر (دبلوم التعليم العام)',
    gradeId: 'grd-12',
    section: '12/1',
    parentName: '',
    parentPhone: '',
    address: 'محافظة شمال الباطنة',
    academicStatus: 'good',
    medicalNotes: '',
    specialTalents: []
  });

  const [talentsInput, setTalentsInput] = useState('');

  // Load students
  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await api.getStudents();
      if (res.success && res.students) {
        setStudents(res.students);
      }
    } catch (err) {
      showToast('تعذر تحميل سجل الطلاب', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (selectedGrade !== 'all' && s.gradeName && !s.gradeName.includes(selectedGrade)) return false;
      if (selectedSection !== 'all' && s.section !== selectedSection) return false;
      if (selectedStatus !== 'all' && s.academicStatus !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = s.fullName.toLowerCase().includes(q);
        const matchNumber = (s.studentNumber || '').includes(q);
        const matchNat = (s.nationalId || '').includes(q);
        const matchParent = (s.parentName || '').toLowerCase().includes(q);
        if (!matchName && !matchNumber && !matchNat && !matchParent) return false;
      }
      return true;
    });
  }, [students, selectedGrade, selectedSection, selectedStatus, searchQuery]);

  // Available Sections
  const availableSections = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => {
      if (s.section) set.add(s.section);
    });
    return Array.from(set).sort();
  }, [students]);

  // Overall Statistics
  const stats = useMemo(() => {
    const total = students.length;
    const excellent = students.filter(s => s.academicStatus === 'excellent').length;
    const needsSupport = students.filter(s => s.academicStatus === 'needs_support').length;

    // Average attendance rate
    let totalAtt = 0;
    let presentAtt = 0;
    students.forEach(s => {
      if (s.attendance && s.attendance.length > 0) {
        totalAtt += s.attendance.length;
        presentAtt += s.attendance.filter(a => a.status === 'present').length;
      }
    });
    const avgAttendance = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 100;

    return { total, excellent, needsSupport, avgAttendance };
  }, [students]);

  // Open Create Student Modal
  const openCreateModal = () => {
    setEditingStudent(null);
    setStudentFormData({
      fullName: '',
      nationalId: '',
      studentNumber: `${new Date().getFullYear()}${Math.floor(100000 + Math.random() * 900000)}`,
      gender: 'male',
      gradeName: selectedGrade !== 'all' ? selectedGrade : 'الصف الثاني عشر (دبلوم التعليم العام)',
      gradeId: 'grd-12',
      section: selectedSection !== 'all' ? selectedSection : '12/1',
      parentName: '',
      parentPhone: '+968',
      address: 'محافظة شمال الباطنة',
      academicStatus: 'good',
      medicalNotes: '',
      specialTalents: []
    });
    setTalentsInput('');
    setStudentFormModalOpen(true);
  };

  // Open Edit Student Modal
  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setStudentFormData({ ...student });
    setTalentsInput((student.specialTalents || []).join('، '));
    setStudentFormModalOpen(true);
  };

  // Save Student
  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentFormData.fullName?.trim()) {
      showToast('يرجى إدخال اسم الطالب الرباعي', 'error');
      return;
    }

    const talents = talentsInput
      .split(/[،,]/)
      .map(t => t.trim())
      .filter(Boolean);

    const payload = {
      ...studentFormData,
      specialTalents: talents
    };

    try {
      if (editingStudent) {
        const res = await api.updateStudent(editingStudent.id, payload);
        if (res.success) {
          setStudents(prev => prev.map(s => s.id === editingStudent.id ? res.student : s));
          if (selectedStudent?.id === editingStudent.id) {
            setSelectedStudent(res.student);
          }
          showToast('تم تحديث ملف الطالب بنجاح', 'success');
        }
      } else {
        const res = await api.saveStudent(payload);
        if (res.success) {
          setStudents(prev => [res.student, ...prev]);
          showToast('تمت إضافة الطالب الجديد بنجاح', 'success');
        }
      }
      setStudentFormModalOpen(false);
      setEditingStudent(null);
    } catch (err) {
      showToast('فشل حفظ بيانات الطالب', 'error');
    }
  };

  // Delete Student
  const handleDeleteStudent = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف ملف الطالب "${name}" وكافة درجاته وملاحظاته؟`)) return;
    try {
      const res = await api.deleteStudent(id);
      if (res.success) {
        setStudents(prev => prev.filter(s => s.id !== id));
        if (selectedStudent?.id === id) setSelectedStudent(null);
        showToast('تم حذف ملف الطالب بنجاح', 'info');
      }
    } catch (err) {
      showToast('تعذر حذف ملف الطالب', 'error');
    }
  };

  // Add Grade to Student
  const handleAddGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      const res = await api.addStudentGrade(selectedStudent.id, newGradeForm);
      if (res.success && res.student) {
        setSelectedStudent(res.student);
        setStudents(prev => prev.map(s => s.id === res.student.id ? res.student : s));
        showToast('تم رصد الدرجة في ملف الطالب بنجاح', 'success');
        setNewGradeForm(prev => ({ ...prev, notes: '' }));
        refreshStudentAlerts();
      }
    } catch (err) {
      showToast('فشل حفظ الدرجة', 'error');
    }
  };

  // Delete Grade
  const handleDeleteGrade = async (gradeId: string) => {
    if (!selectedStudent) return;
    try {
      const res = await api.deleteStudentGrade(selectedStudent.id, gradeId);
      if (res.success && res.student) {
        setSelectedStudent(res.student);
        setStudents(prev => prev.map(s => s.id === res.student.id ? res.student : s));
        showToast('تم حذف الدرجة', 'info');
        refreshStudentAlerts();
      }
    } catch (err) {
      showToast('فشل حذف الدرجة', 'error');
    }
  };

  // Add Attendance
  const handleAddAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      const res = await api.addStudentAttendance(selectedStudent.id, newAttendanceForm);
      if (res.success && res.student) {
        setSelectedStudent(res.student);
        setStudents(prev => prev.map(s => s.id === res.student.id ? res.student : s));
        showToast('تم تسجيل الحضور/الغياب بنجاح', 'success');
      }
    } catch (err) {
      showToast('فشل تسجيل الحضور', 'error');
    }
  };

  // Add Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      const res = await api.addStudentNote(selectedStudent.id, {
        ...newNoteForm,
        date: new Date().toISOString().split('T')[0],
        authorName: currentUser.name || 'معلم المادة'
      });
      if (res.success && res.student) {
        setSelectedStudent(res.student);
        setStudents(prev => prev.map(s => s.id === res.student.id ? res.student : s));
        showToast('تمت إضافة الملاحظة التربوية إلى ملف الطالب', 'success');
      }
    } catch (err) {
      showToast('فشل إضافة الملاحظة', 'error');
    }
  };

  // Add Custom Field
  const handleAddCustomField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !newCustomFieldForm.name.trim()) return;
    try {
      const res = await api.addStudentCustomField(selectedStudent.id, newCustomFieldForm.name.trim(), newCustomFieldForm.value.trim());
      if (res.success && res.student) {
        setSelectedStudent(res.student);
        setStudents(prev => prev.map(s => s.id === res.student.id ? res.student : s));
        showToast(`تمت إضافة البند "${newCustomFieldForm.name}" بنجاح`, 'success');
        setNewCustomFieldForm({ name: '', value: '' });
      }
    } catch (err) {
      showToast('فشل إضافة البند المخصص', 'error');
    }
  };

  // Dispatch WhatsApp Report Card
  const handleSendWhatsAppReport = async (student: Student) => {
    const targetPhone = student.parentPhone || '+96877394680';
    try {
      const res = await api.dispatchStudentReportToWhatsApp(student.id, targetPhone);
      if (res.success) {
        showToast(res.message || 'تم إرسال تقرير الطالب لولي الأمر بنجاح عبر الواتساب!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'فشل إرسال التقرير عبر الواتساب', 'error');
    }
  };

  // Generate AI Remedial Plan for an alert
  const handleGenerateRemedialPlan = async (alertId: string) => {
    try {
      setGeneratingRemedialAlertId(alertId);
      const res = await api.generateStudentAlertRemedialPlan(alertId);
      if (res.success) {
        await refreshStudentAlerts();
        showToast('تم توليد وتحديث الخطة العلاجية الذكية المقترحة بنجاح! ⚡', 'success');
      }
    } catch (err: any) {
      showToast('فشل توليد الخطة العلاجية: ' + err.message, 'error');
    } finally {
      setGeneratingRemedialAlertId(null);
    }
  };

  // Recompute alerts comparing with class averages
  const handleRecomputeAlerts = async () => {
    try {
      setIsRecomputingAlerts(true);
      const res = await api.computeStudentAlerts();
      if (res.success) {
        await refreshStudentAlerts();
        showToast(`تم فحص وتحليل درجات الطلاب ومقارنتها بمتوسط الشعبة (${res.alerts.length} تنبيه مسجل)`, 'success');
      }
    } catch (err: any) {
      showToast('فشل إعادة تحليل التنبيهات: ' + err.message, 'error');
    } finally {
      setIsRecomputingAlerts(false);
    }
  };

  // Open WhatsApp Modal for parent
  const handleOpenWhatsAppAlertModal = (alert: StudentPerformanceAlert) => {
    setSelectedAlertForWhatsApp(alert);
    const defaultText = `📢 *إشعار متابعة مستوى دراسي من ${schoolName}* 🇴🇲\n` +
      `🏢 *${directorateName}*\n\n` +
      `السلام عليكم ورحمة الله وبركاته،\n` +
      `الفاضل ولي أمر الطالب / *${alert.studentName}* (${alert.gradeName} - الشعبة ${alert.section}) المحترم،،\n\n` +
      `حرصاً على المتابعة المستمرة للأداء التعليمي، نود إحاطتكم بأنه في تقييم (*${alert.assessmentName}*):\n` +
      `• درجة الطالب: *${alert.studentScore} من ${alert.maxScore}* (${alert.studentPercentage}%)\n` +
      `• متوسط درجات الشعبة: *${alert.classAverageScore} من ${alert.maxScore}* (${alert.classAveragePercentage}%)\n` +
      `• فارق الانخفاض: *${Math.abs(alert.deviationPercentage)}%*\n\n` +
      `📌 *الإجراء التربوي والخطة العلاجية المتخذة من قبل المعلم:*\n` +
      `${alert.remedialPlanSuggested || 'تم إدراج الطالب في برنامج الدعم العلاجي الصفي وتزويده بتمارين تدريبية لتعزيز مهاراته.'}\n\n` +
      `شاكرين ومقدرين تعاونكم ومساندتكم الدائمة لأبنائنا الطلبة في المتابعة المنزلية.\n` +
      `مع تحيات: *معلم المادة وإدارة المدرسة*`;
    setCustomWhatsAppMsg(defaultText);
    setWhatsappAlertModalOpen(true);
  };

  // Send WhatsApp Alert
  const handleSendWhatsAppAlert = async () => {
    if (!selectedAlertForWhatsApp) return;
    try {
      setIsSendingWhatsAppAlert(true);
      const res = await api.notifyStudentAlertViaWhatsApp(selectedAlertForWhatsApp.id, customWhatsAppMsg);
      if (res.success) {
        await refreshStudentAlerts();
        showToast(res.sendResult?.message || 'تم إرسال إشعار ولي الأمر بنجاح عبر الواتساب! 📲', 'success');
        setWhatsappAlertModalOpen(false);
      }
    } catch (err: any) {
      showToast('تعذر إرسال إشعار الواتساب: ' + err.message, 'error');
    } finally {
      setIsSendingWhatsAppAlert(false);
    }
  };

  // Filtered Alerts calculation
  const filteredAlerts = useMemo(() => {
    let list = studentAlerts || [];
    if (alertOnlyUnread) {
      list = list.filter(a => !a.isRead);
    }
    if (alertSeverityFilter !== 'all') {
      list = list.filter(a => a.severity === alertSeverityFilter);
    }
    if (alertSectionFilter !== 'all') {
      list = list.filter(a => a.section === alertSectionFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a =>
        a.studentName.toLowerCase().includes(q) ||
        a.assessmentName.toLowerCase().includes(q) ||
        a.section.toLowerCase().includes(q)
      );
    }
    return list;
  }, [studentAlerts, alertOnlyUnread, alertSeverityFilter, alertSectionFilter, searchQuery]);

  // Bulk Import Students
  const handleBulkImport = async () => {
    const lines = bulkNamesText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      showToast('يرجى لصق أو كتابة أسماء الطلاب (اسم في كل سطر)', 'error');
      return;
    }

    try {
      setLoading(true);
      let addedCount = 0;
      for (const name of lines) {
        const payload: Partial<Student> = {
          fullName: name,
          gradeName: bulkGrade,
          section: bulkSection,
          studentNumber: `${new Date().getFullYear()}${Math.floor(100000 + Math.random() * 900000)}`,
          academicStatus: 'good',
          gender: 'male',
          grades: [],
          attendance: [],
          notes: []
        };
        await api.saveStudent(payload);
        addedCount++;
      }
      showToast(`تمت إضافة ${addedCount} طالباً بنجاح إلى شعبة ${bulkSection}`, 'success');
      setBulkImportModalOpen(false);
      setBulkNamesText('');
      await loadStudents();
    } catch (err) {
      showToast('حدث خطأ أثناء استيراد الأسماء', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Seed Default Students
  const handleSeedDefaults = async () => {
    if (!confirm('هل ترغب في استعادة سجلات وقوائم الطلاب الافتراضية المعتمدة؟')) return;
    try {
      setLoading(true);
      const res = await api.seedDefaultStudents();
      if (res.success && res.students) {
        setStudents(res.students);
        showToast('تمت استعادة سجلات الطلاب بنجاح', 'success');
      }
    } catch (err) {
      showToast('فشل استعادة السجلات', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Calculate Student Cumulative Statistics
  const getStudentStats = (student: Student) => {
    const grades = student.grades || [];
    const totalMax = grades.reduce((acc, g) => acc + (g.maxScore || 0), 0);
    const totalObtained = grades.reduce((acc, g) => acc + (g.obtainedScore || 0), 0);
    const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;

    const attendance = student.attendance || [];
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const absentDays = attendance.filter(a => a.status === 'absent').length;
    const attRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    return { totalMax, totalObtained, percentage, totalDays, presentDays, absentDays, attRate };
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
              <UserCheck className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                  سجل وقوائم الطلاب والملف التراكمي الشامل
                </h1>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300">
                  سلطنة عمان • وزارة التربية والتعليم 🇴🇲
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300">
                  شؤون وتقويم الطلاب
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
                إدارة أسماء وتوزيع الطلاب لكل صف وشعبة، رصد الدرجات، تسجيل الحضور والغياب، الملاحظات السلوكية، وإصدار الخطابات والمراسلات الرسمية لولي الأمر.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={handleExportClassReport}
              disabled={isExportingClassReport}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-900/10 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              title="تصدير كشف درجات وسجل تقرير الطلاب كملف PDF رسمي معتمد"
            >
              {isExportingClassReport ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>تصدير PDF</span>
            </button>

            <button
              onClick={openCreateModal}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs shadow-md shadow-teal-900/20 flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة طالب جديد</span>
            </button>

            <button
              onClick={() => setBulkImportModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-bold text-xs flex items-center gap-1.5 transition"
              title="إضافة قائمة أسماء كاملة للشعبة بضغطة زر واحدة"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>استيراد قائمة أسماء</span>
            </button>

            <button
              onClick={handleSeedDefaults}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs transition"
              title="استعادة قوائم الطلاب والدرجات النموذجية المعتمدة"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
            </button>
          </div>
        </div>

        {/* School Profile Ribbon */}
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
            className="text-[11px] text-teal-700 dark:text-teal-300 hover:underline font-bold"
          >
            ✏️ تعديل ترويسة المدرسة والختم
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TOP TABS: STUDENTS DIRECTORY vs PERFORMANCE DROP ALERTS */}
      {/* ---------------------------------------------------- */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
        <button
          onClick={() => setManagementMode('students')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs md:text-sm font-black transition flex items-center justify-center gap-2.5 ${
            managementMode === 'students'
              ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm border border-slate-200/60 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-white/50 dark:hover:bg-slate-900/40'
          }`}
        >
          <Users className="w-4 h-4 text-teal-600" />
          <span>سجل وقوائم الطلاب والملف التراكمي</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300">
            {students.length} طالب
          </span>
        </button>

        <button
          onClick={() => setManagementMode('alerts')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs md:text-sm font-black transition flex items-center justify-center gap-2.5 ${
            managementMode === 'alerts'
              ? 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-400 shadow-sm border border-rose-200/60 dark:border-rose-900/60'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-white/50 dark:hover:bg-slate-900/40'
          }`}
        >
          <div className="relative">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            {unreadStudentAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
            )}
          </div>
          <span>تنبيهات انحدار الأداء ومقارنة متوسط الصف</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              unreadStudentAlertsCount > 0
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {unreadStudentAlertsCount > 0 ? `${unreadStudentAlertsCount} تنبيه جديد ⚠️` : `${studentAlerts.length} تنبيه`}
          </span>
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* MODE 1: STUDENTS DIRECTORY */}
      {/* ---------------------------------------------------- */}
      {managementMode === 'students' && (
        <div className="space-y-6">
          {/* STATS OVERVIEW CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي الطلاب المسجلين</span>
            <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</span>
            <span className="text-[11px] text-slate-400">طالب وطالبة</span>
          </div>
          <p className="mt-2 text-[10px] text-teal-600 font-bold">بمختلف الصفوف والشعب</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-950/60 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">الطلاب المتفوقون</span>
            <span className="text-base">⭐</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.excellent}</span>
            <span className="text-[11px] text-slate-400">أوائل المادة</span>
          </div>
          <p className="mt-2 text-[10px] text-emerald-600 font-medium">مستوى ممتاز في التحصيل</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950/60 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400">يحتاجون دعم علاجي</span>
            <span className="text-base">📌</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{stats.needsSupport}</span>
            <span className="text-[11px] text-slate-400">طالب</span>
          </div>
          <p className="mt-2 text-[10px] text-rose-600 font-medium">خطة علاجية ومتابعة ولي أمر</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-sky-950/60 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-700 dark:text-sky-400">نسبة الانضباط والحضور</span>
            <span className="text-base">✓</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-sky-600 dark:text-sky-400">{stats.avgAttendance}%</span>
            <span className="text-[11px] text-slate-400">متوسط الحضور</span>
          </div>
          <p className="mt-2 text-[10px] text-sky-600 font-medium">وفق السجلات اليومية</p>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* FILTER & SEARCH BAR */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم، الرقم الأكاديمي، أو الرقم المدني..."
            className="w-full text-xs pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 font-medium"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Grade */}
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold"
          >
            <option value="all">كافة الصفوف الدراسية</option>
            <option value="الصف التاسع">الصف التاسع</option>
            <option value="الصف العاشر">الصف العاشر</option>
            <option value="الصف الحادي عشر">الصف الحادي عشر</option>
            <option value="الصف الثاني عشر">الصف الثاني عشر</option>
          </select>

          {/* Section */}
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold"
          >
            <option value="all">كافة الشعب</option>
            {availableSections.map(sec => (
              <option key={sec} value={sec}>شعبة {sec}</option>
            ))}
          </select>

          {/* Academic Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold"
          >
            <option value="all">كافة المستويات الأكاديمية</option>
            <option value="excellent">ممتاز / متفوق ⭐</option>
            <option value="good">جيد جداً</option>
            <option value="needs_support">يحتاج دعم علاجي 📌</option>
          </select>

          {/* Toggle View Mode */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition ${viewMode === 'table' ? 'bg-white dark:bg-slate-900 text-teal-700 shadow-xs' : 'text-slate-500'}`}
              title="عرض الجدول"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-bold transition ${viewMode === 'cards' ? 'bg-white dark:bg-slate-900 text-teal-700 shadow-xs' : 'text-slate-500'}`}
              title="عرض البطاقات"
            >
              <Users className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* STUDENTS LIST (TABLE VIEW) */}
      {/* ---------------------------------------------------- */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Users className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-sm font-bold">لا يوجد طلاب مسجلون يطابقون خيارات البحث أو التصفية</p>
              <button
                onClick={openCreateModal}
                className="mt-3 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700"
              >
                + إضافة طالب جديد الآن
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-extrabold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3.5 px-3 text-center w-10">م</th>
                    <th className="py-3.5 px-4">اسم الطالب الرباعي</th>
                    <th className="py-3.5 px-3">الرقم الأكاديمي</th>
                    <th className="py-3.5 px-3">الصف والشعبة</th>
                    <th className="py-3.5 px-3 text-center">المستوى</th>
                    <th className="py-3.5 px-4 text-center">الدرجات المرصودة</th>
                    <th className="py-3.5 px-3 text-center">نسبة الحضور</th>
                    <th className="py-3.5 px-4 text-center">الإجراءات والملف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredStudents.map((st, idx) => {
                    const stStats = getStudentStats(st);
                    const statusCfg = ACADEMIC_STATUS_CONFIG[st.academicStatus] || ACADEMIC_STATUS_CONFIG.good;

                    return (
                      <tr key={st.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-3 text-center font-bold text-slate-400">{idx + 1}</td>

                        {/* Name & Civil ID */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-extrabold flex items-center justify-center text-xs shrink-0 border border-teal-200">
                              {st.fullName.charAt(0)}
                            </div>
                            <div>
                              <button
                                onClick={() => { setSelectedStudent(st); setActiveTab('profile'); }}
                                className="font-extrabold text-slate-900 dark:text-white hover:text-teal-600 transition text-right"
                              >
                                {st.fullName}
                              </button>
                              <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                                {st.nationalId && <span>الرقم المدني: {st.nationalId}</span>}
                                {st.parentPhone && <span>📞 {st.parentPhone}</span>}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Student Number */}
                        <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-600 dark:text-slate-300 font-semibold">
                          {st.studentNumber}
                        </td>

                        {/* Grade & Section */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-bold text-slate-800 dark:text-slate-200">{st.gradeName}</div>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-bold text-teal-700 dark:text-teal-300">
                            شعبة {st.section}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCfg.badgeClass}`}>
                            {statusCfg.label}
                          </span>
                        </td>

                        {/* Grades Progress */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-black text-slate-900 dark:text-white">
                              {stStats.totalObtained} / {stStats.totalMax || 10}
                            </span>
                            <span className="text-[10px] text-teal-600 font-bold">({stStats.percentage}%)</span>
                          </div>
                          <div className="w-24 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mx-auto mt-1 overflow-hidden">
                            <div
                              className="bg-teal-600 h-full rounded-full transition-all"
                              style={{ width: `${Math.min(100, stStats.percentage)}%` }}
                            />
                          </div>
                        </td>

                        {/* Attendance Rate */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {stStats.attRate}%
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {stStats.presentDays} حضور / {stStats.absentDays} غياب
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Open Full Dossier */}
                            <button
                              onClick={() => { setSelectedStudent(st); setActiveTab('profile'); }}
                              className="px-2.5 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold text-xs hover:bg-teal-100 transition flex items-center gap-1"
                              title="فتح الملف التراكمي الشامل"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>الملف التراكمي</span>
                            </button>

                            {/* Open Visual Analytics Charts */}
                            <button
                              onClick={() => { setSelectedStudent(st); setActiveTab('analytics'); }}
                              className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 hover:bg-indigo-100 transition"
                              title="التقارير والرسوم البيانية وتطور الدرجات والمشاركات"
                            >
                              <TrendingUp className="w-3.5 h-3.5" />
                            </button>

                            {/* WhatsApp Direct Dispatch */}
                            <button
                              onClick={() => handleSendWhatsAppReport(st)}
                              className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 hover:bg-emerald-100 transition"
                              title="إرسال تقرير الطالب لولي الأمر عبر الواتساب"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => openEditModal(st)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200 transition"
                              title="تعديل البيانات الأساسية"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteStudent(st.id, st.fullName)}
                              className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 hover:bg-rose-100 transition"
                              title="حذف ملف الطالب"
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
      {/* STUDENTS LIST (CARDS VIEW) */}
      {/* ---------------------------------------------------- */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((st) => {
            const stStats = getStudentStats(st);
            const statusCfg = ACADEMIC_STATUS_CONFIG[st.academicStatus] || ACADEMIC_STATUS_CONFIG.good;

            return (
              <div
                key={st.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:border-teal-400 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-extrabold flex items-center justify-center text-sm border border-teal-200">
                        {st.fullName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">
                          {st.fullName}
                        </h4>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          رقم أكاديمي: {st.studentNumber}
                        </div>
                      </div>
                    </div>

                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusCfg.badgeClass}`}>
                      {statusCfg.label}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">الصف والشعبة:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{st.section} ({st.gradeName})</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">هاتف ولي الأمر:</span>
                      <span className="font-mono text-[11px] text-slate-700 dark:text-slate-200">{st.parentPhone || 'غير مسجل'}</span>
                    </div>
                  </div>

                  {/* Grades & Attendance Stats */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-around text-center text-xs">
                    <div>
                      <div className="font-black text-slate-900 dark:text-white">{stStats.percentage}%</div>
                      <div className="text-[10px] text-slate-400">الدرجات ({stStats.totalObtained}/{stStats.totalMax || 10})</div>
                    </div>
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
                    <div>
                      <div className="font-black text-slate-900 dark:text-white">{stStats.attRate}%</div>
                      <div className="text-[10px] text-slate-400">نسبة الحضور</div>
                    </div>
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
                    <div>
                      <div className="font-black text-slate-900 dark:text-white">{st.notes?.length || 0}</div>
                      <div className="text-[10px] text-slate-400">ملاحظات</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => { setSelectedStudent(st); setActiveTab('profile'); }}
                    className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>الملف التراكمي</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setSelectedStudent(st); setActiveTab('analytics'); }}
                      className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 hover:bg-indigo-100 transition"
                      title="التقارير البيانية وتطور الأداء"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleSendWhatsAppReport(st)}
                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                      title="تقرير واتساب"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openEditModal(st)}
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                      title="تعديل"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(st.id, st.fullName)}
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODE 2: PERFORMANCE DROP ALERTS & CLASS COMPARISON */}
      {/* ---------------------------------------------------- */}
      {managementMode === 'alerts' && (
        <div className="space-y-6 animate-fade-in">
          {/* Alert Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">إجمالي التنبيهات المرصودة</span>
                <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600">
                  <Bell className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{studentAlertStats.total}</span>
                <span className="text-[11px] text-slate-400">حالة انحدار</span>
              </div>
              <p className="mt-2 text-[10px] text-teal-600 font-bold">مقارنة بمتوسطات الشعب</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-950/70 rounded-2xl p-4 shadow-xs bg-rose-50/20 dark:bg-rose-950/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-700 dark:text-rose-400">انحدار حرج (≥ 25%)</span>
                <span className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600">
                  <AlertTriangle className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{studentAlertStats.critical}</span>
                <span className="text-[11px] text-rose-500">فارق حاد</span>
              </div>
              <p className="mt-2 text-[10px] text-rose-600 font-medium">يتطلب تدخلاً علاجياً فورياً</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-950/70 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400">تحذير انخفاض (≥ 15%)</span>
                <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600">
                  <TrendingDown className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{studentAlertStats.warning}</span>
                <span className="text-[11px] text-amber-500">حالة متابعة</span>
              </div>
              <p className="mt-2 text-[10px] text-amber-600 font-medium">أقل من متوسط الصف</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-sky-950/60 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-700 dark:text-sky-400">تنبيهات غير مقروءة</span>
                <span className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600">
                  <ShieldAlert className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-sky-600 dark:text-sky-400">{studentAlertStats.unread}</span>
                <span className="text-[11px] text-slate-400">بانتظار المراجعة</span>
              </div>
              <p className="mt-2 text-[10px] text-sky-600 font-medium">إشعار جديد للمعلم</p>
            </div>
          </div>

          {/* Filter & Action Toolbar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في التنبيهات باسم الطالب، التقييم، أو الشعبة..."
                className="w-full text-xs pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Severity Filter */}
              <select
                value={alertSeverityFilter}
                onChange={(e) => setAlertSeverityFilter(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold"
              >
                <option value="all">كافة مستويات الخطورة</option>
                <option value="critical">انحدار حرج ⚠️ (فارق ≥ 25%)</option>
                <option value="warning">تحذير انخفاض ⚡ (فارق ≥ 15%)</option>
                <option value="notice">تنبيه ومتابعة 📌</option>
              </select>

              {/* Section Filter */}
              <select
                value={alertSectionFilter}
                onChange={(e) => setAlertSectionFilter(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold"
              >
                <option value="all">كافة الشعب</option>
                {availableSections.map(sec => (
                  <option key={sec} value={sec}>شعبة {sec}</option>
                ))}
              </select>

              {/* Unread Only Toggle */}
              <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={alertOnlyUnread}
                  onChange={(e) => setAlertOnlyUnread(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-teal-600 focus:ring-teal-500"
                />
                <span>غير المقروء فقط</span>
              </label>

              {/* Recompute button */}
              <button
                onClick={handleRecomputeAlerts}
                disabled={isRecomputingAlerts}
                className="px-3 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 text-xs font-bold flex items-center gap-1.5 transition"
                title="إعادة حساب ومقارنة درجات جميع الطلاب مع متوسطات شعبهم الآن"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRecomputingAlerts ? 'animate-spin' : ''}`} />
                <span>إعادة التحليل</span>
              </button>

              {/* Mark All Read */}
              {unreadStudentAlertsCount > 0 && (
                <button
                  onClick={() => markAllAlertsAsRead()}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>تحديد الكل كمقروء</span>
                </button>
              )}
            </div>
          </div>

          {/* Alerts Cards List */}
          <div className="space-y-4">
            {filteredAlerts.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center text-2xl mx-auto mb-3">
                  🌟
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  لا توجد تنبيهات انحدار تطابق خيارات التصفية
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  مستوى الطلاب متوافق مع متوسط الأداء الصفي، أو تم حل ومعالجة التنبيهات السابقة بنجاح.
                </p>
                <button
                  onClick={handleRecomputeAlerts}
                  className="mt-4 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition"
                >
                  إعادة فحص واحتساب متوسطات الشعب الآن
                </button>
              </div>
            ) : (
              filteredAlerts.map(alert => {
                const isCritical = alert.severity === 'critical';
                const studentObj = students.find(s => s.id === alert.studentId);
                const isGeneratingThis = generatingRemedialAlertId === alert.id;

                return (
                  <div
                    key={alert.id}
                    className={`bg-white dark:bg-slate-900 rounded-2xl border transition shadow-xs overflow-hidden ${
                      isCritical
                        ? 'border-rose-200 dark:border-rose-900/60 hover:border-rose-400'
                        : 'border-amber-200 dark:border-amber-900/60 hover:border-amber-400'
                    } ${!alert.isRead ? 'ring-1.5 ring-rose-400/50' : ''}`}
                  >
                    {/* Card Header Banner */}
                    <div
                      className={`p-4 md:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b ${
                        isCritical
                          ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-100 dark:border-rose-950/60'
                          : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-100 dark:border-amber-950/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-2xl font-black text-sm flex items-center justify-center text-white shadow-xs ${
                            isCritical
                              ? 'bg-gradient-to-br from-rose-600 to-red-700'
                              : 'bg-gradient-to-br from-amber-500 to-orange-600'
                          }`}
                        >
                          {alert.studentName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">
                              {alert.studentName}
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 border border-slate-200 dark:border-slate-700">
                              {alert.gradeName} • الشعبة {alert.section}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              #{alert.studentNumber}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>📅 تاريخ الرصد: {alert.date}</span>
                            {alert.parentName && <span>• ولي الأمر: {alert.parentName}</span>}
                            {alert.parentPhone && <span>• 📞 {alert.parentPhone}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <span
                          className={`text-[11px] font-black px-2.5 py-1 rounded-xl flex items-center gap-1.5 ${
                            isCritical
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-amber-500 text-white shadow-xs'
                          }`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{isCritical ? 'انحدار حرج في الأداء ⚠️' : 'تحذير انخفاض ⚡'}</span>
                        </span>

                        <button
                          onClick={() => markAlertAsRead(alert.id, !alert.isRead)}
                          className={`text-xs px-2.5 py-1 rounded-xl font-bold border transition ${
                            alert.isRead
                              ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                              : 'bg-white text-teal-700 dark:bg-slate-800 dark:text-teal-300 border-teal-300'
                          }`}
                          title={alert.isRead ? 'تحديد كغير مقروء' : 'تحديد كمقروء'}
                        >
                          {alert.isRead ? 'تمت القراءة ✓' : 'جديد'}
                        </button>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 md:p-6 space-y-5">
                      {/* Title & Assessment Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                            {alert.category === 'short_exam' ? '📝 اختبار قصير' : alert.category === 'activity' ? '🎨 تطبيق عملي' : alert.category === 'project' ? '📐 مشروع بحثي' : '📊 تقييم'}
                          </span>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">
                            {alert.assessmentName}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                          {alert.description}
                        </p>
                      </div>

                      {/* Comparative Analytics Meter (Visual Comparison) */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <BarChart3 className="w-4 h-4 text-teal-600" />
                            <span>المقارنة التحليلية مع متوسط أداء الشعبة ({alert.section}):</span>
                          </span>
                          <span className="text-rose-600 font-black flex items-center gap-1">
                            <TrendingDown className="w-4 h-4" />
                            <span>انحدار بنسبة {Math.abs(alert.deviationPercentage)}%</span>
                          </span>
                        </div>

                        {/* Student Score Bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-rose-700 dark:text-rose-400">
                              درجة الطالب: {alert.studentScore} من {alert.maxScore}
                            </span>
                            <span className="font-mono font-black text-rose-600">
                              {alert.studentPercentage}%
                            </span>
                          </div>
                          <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-rose-500 to-red-600 transition-all duration-500"
                              style={{ width: `${Math.min(100, Math.max(5, alert.studentPercentage))}%` }}
                            />
                          </div>
                        </div>

                        {/* Class Average Bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-teal-700 dark:text-teal-300">
                              متوسط درجات الشعبة: {alert.classAverageScore} من {alert.maxScore}
                            </span>
                            <span className="font-mono font-black text-teal-600">
                              {alert.classAveragePercentage}%
                            </span>
                          </div>
                          <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 transition-all duration-500"
                              style={{ width: `${Math.min(100, Math.max(5, alert.classAveragePercentage))}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* AI Remedial Plan Box */}
                      <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-900/40 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span className="text-xs font-black text-teal-900 dark:text-teal-200">
                              الخطة العلاجية المقترحة وفق وثيقة التقويم العمانية:
                            </span>
                          </div>

                          <button
                            onClick={() => handleGenerateRemedialPlan(alert.id)}
                            disabled={isGeneratingThis}
                            className="px-3 py-1 rounded-xl bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 hover:bg-teal-100 text-[11px] font-bold border border-teal-300 dark:border-teal-700 flex items-center gap-1.5 transition shadow-xs"
                            title="توليد توصيات إجرائية إضافية بالذكاء الاصطناعي"
                          >
                            <Sparkles className={`w-3.5 h-3.5 text-amber-500 ${isGeneratingThis ? 'animate-spin' : ''}`} />
                            <span>{isGeneratingThis ? 'جارٍ التوليد...' : 'توليد/تحديث بالذكاء الاصطناعي'}</span>
                          </button>
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed bg-white/70 dark:bg-slate-900/60 p-3 rounded-xl border border-teal-100 dark:border-teal-950">
                          {alert.remedialPlanSuggested || 'لم يتم توليد خطة علاجية بعد. انقر على زر "توليد بالذكاء الاصطناعي" للحصول على توصيات علاجية فورية.'}
                        </p>
                      </div>

                      {/* Action Buttons Toolbar */}
                      <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Send WhatsApp to Parent */}
                          <button
                            onClick={() => handleOpenWhatsAppAlertModal(alert)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>إشعار ولي الأمر عبر الواتساب</span>
                            {alert.notifiedViaWhatsApp && (
                              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-800 rounded-full font-normal">
                                تم الإرسال ✓
                              </span>
                            )}
                          </button>

                          {/* Open Dossier */}
                          {studentObj && (
                            <button
                              onClick={() => {
                                setSelectedStudent(studentObj);
                                setActiveTab('grades');
                              }}
                              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition"
                            >
                              <Eye className="w-3.5 h-3.5 text-teal-600" />
                              <span>عرض سجل درجات الطالب</span>
                            </button>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-400">
                          {alert.notifiedAt ? `آخر إشعار لولي الأمر: ${new Date(alert.notifiedAt).toLocaleDateString('ar-OM')}` : 'لم يتم إشعار ولي الأمر بعد'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* DETAILED STUDENT DOSSIER MODAL / DRAWER */}
      {/* ---------------------------------------------------- */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 md:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full p-5 md:p-6 shadow-2xl animate-scale-up my-6 max-h-[92vh] flex flex-col">
            {/* Dossier Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white font-black text-lg flex items-center justify-center shadow-md">
                  {selectedStudent.fullName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white">
                      {selectedStudent.fullName}
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                      شعبة {selectedStudent.section}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    الرقم الأكاديمي: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{selectedStudent.studentNumber}</span> • {selectedStudent.gradeName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                    activeTab === 'analytics'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                  }`}
                  title="عرض التقارير والرسوم البيانية وتطور الدرجات"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">التقارير والرسوم البيانية</span>
                </button>

                <button
                  onClick={() => handleSendWhatsAppReport(selectedStudent)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center gap-1.5 transition"
                  title="إرسال التقرير لولي الأمر"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">إرسال تقرير واتساب</span>
                </button>

                <button
                  onClick={() => setActiveTab('report_card')}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">بطاقة التقرير A4</span>
                </button>

                <button
                  onClick={() => setSelectedStudent(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Dossier Tabs */}
            <div className="flex items-center gap-1.5 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800 overflow-x-auto text-xs shrink-0">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-3 py-1.5 rounded-lg font-extrabold whitespace-nowrap transition ${
                  activeTab === 'profile' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                }`}
              >
                👤 البيانات والملف الشخصي
              </button>
              <button
                onClick={() => setActiveTab('grades')}
                className={`px-3 py-1.5 rounded-lg font-extrabold whitespace-nowrap transition ${
                  activeTab === 'grades' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                }`}
              >
                📝 سجل الدرجات والتقويم ({selectedStudent.grades?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('attendance')}
                className={`px-3 py-1.5 rounded-lg font-extrabold whitespace-nowrap transition ${
                  activeTab === 'attendance' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                }`}
              >
                🗓️ الحضور والانصراف ({selectedStudent.attendance?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-3 py-1.5 rounded-lg font-extrabold whitespace-nowrap transition ${
                  activeTab === 'notes' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                }`}
              >
                💬 الملاحظات السلوكية والتربوية ({selectedStudent.notes?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('letters')}
                className={`px-3 py-1.5 rounded-lg font-extrabold whitespace-nowrap transition ${
                  activeTab === 'letters' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                }`}
              >
                📨 الخطابات والمراسلات ({selectedStudent.letters?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                className={`px-3 py-1.5 rounded-lg font-extrabold whitespace-nowrap transition ${
                  activeTab === 'custom' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                }`}
              >
                ⚙️ بنود وملاحظات إضافية
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-1.5 rounded-lg font-extrabold whitespace-nowrap transition flex items-center gap-1.5 ${
                  activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-xs' : 'text-indigo-700 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40 hover:bg-indigo-100/70'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>التقارير والرسوم البيانية (Recharts)</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto py-4">
              {/* TAB 1: PROFILE OVERVIEW */}
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                      <h4 className="font-extrabold text-xs text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        <span>البيانات الأكاديمية والمدرسية</span>
                      </h4>
                      <div className="text-xs space-y-2">
                        <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                          <span className="text-slate-500">الرقم المدني العماني:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{selectedStudent.nationalId || 'غير مدخل'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                          <span className="text-slate-500">الرقم الأكاديمي:</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedStudent.studentNumber}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                          <span className="text-slate-500">المرحلة والصف:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{selectedStudent.gradeName}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                          <span className="text-slate-500">الشعبة الصفية:</span>
                          <span className="font-bold text-teal-600">{selectedStudent.section}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">المستوى العام:</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200">
                            {ACADEMIC_STATUS_CONFIG[selectedStudent.academicStatus]?.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                      <h4 className="font-extrabold text-xs text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                        <Phone className="w-4 h-4" />
                        <span>بيانات ولي الأمر والتواصل</span>
                      </h4>
                      <div className="text-xs space-y-2">
                        <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                          <span className="text-slate-500">اسم ولي الأمر:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{selectedStudent.parentName || 'سعيد المعمري'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                          <span className="text-slate-500">رقم الهاتف (واتساب):</span>
                          <span className="font-mono font-bold text-teal-600">{selectedStudent.parentPhone || 'غير مدخل'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                          <span className="text-slate-500">صلة القرابة:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{selectedStudent.parentRelation || 'الأب'}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">العنوان والولاية:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{selectedStudent.address || 'شمال الباطنة'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Talents & Medical Notes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                      <h4 className="font-extrabold text-xs text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-2">
                        <Award className="w-4 h-4 text-amber-600" />
                        <span>المواهب والاهتمامات الجغرافية</span>
                      </h4>
                      {selectedStudent.specialTalents && selectedStudent.specialTalents.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {selectedStudent.specialTalents.map((tal, i) => (
                            <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-200 font-bold border border-amber-200">
                              ✨ {tal}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">لم يتم تدوين مواهب خاصة بعد</p>
                      )}
                    </div>

                    <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                      <h4 className="font-extrabold text-xs text-rose-800 dark:text-rose-300 flex items-center gap-1.5 mb-2">
                        <Heart className="w-4 h-4 text-rose-600" />
                        <span>ملاحظات صحية وخاصة</span>
                      </h4>
                      <p className="text-xs text-slate-700 dark:text-slate-300">
                        {selectedStudent.medicalNotes || 'سليم ولله الحمد، لا توجد إعاقات أو حساسيات مسجلة.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: GRADES & ASSESSMENTS */}
              {activeTab === 'grades' && (
                <div className="space-y-4">
                  {/* Summary Bar */}
                  {(() => {
                    const stStats = getStudentStats(selectedStudent);
                    return (
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-teal-950/40 border border-teal-200 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-teal-800 dark:text-teal-300">المجموع التراكمي للدرجات</div>
                          <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                            {stStats.totalObtained} من {stStats.totalMax || 10} درجة ({stStats.percentage}%)
                          </div>
                        </div>

                        <div className="text-left">
                          <span className="text-xs px-3 py-1 rounded-full bg-teal-600 text-white font-extrabold">
                            التقدير: {stStats.percentage >= 90 ? 'ممتاز (أ)' : stStats.percentage >= 80 ? 'جيد جداً (ب)' : stStats.percentage >= 65 ? 'جيد (ج)' : 'يحتاج تعزيز (د)'}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Add Grade Form */}
                  <form onSubmit={handleAddGrade} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-5 gap-2.5 items-end">
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">اسم الاختبار / التقويم</label>
                      <input
                        type="text"
                        required
                        value={newGradeForm.assessmentName}
                        onChange={(e) => setNewGradeForm({ ...newGradeForm, assessmentName: e.target.value })}
                        placeholder="الاختبار القصير الأول / نشاط خريطة"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">الدرجة المستحقة</label>
                      <input
                        type="number"
                        step="0.5"
                        required
                        value={newGradeForm.obtainedScore}
                        onChange={(e) => setNewGradeForm({ ...newGradeForm, obtainedScore: parseFloat(e.target.value) || 0 })}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 font-bold text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">الدرجة العظمى</label>
                      <input
                        type="number"
                        step="1"
                        required
                        value={newGradeForm.maxScore}
                        onChange={(e) => setNewGradeForm({ ...newGradeForm, maxScore: parseFloat(e.target.value) || 10 })}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 font-bold text-center"
                      />
                    </div>
                    <div>
                      <button
                        type="submit"
                        className="w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>رصد الدرجة</span>
                      </button>
                    </div>
                  </form>

                  {/* Grades Table */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold">
                        <tr>
                          <th className="p-3">اسم الاختبار أو الاستحقاق</th>
                          <th className="p-3 text-center">الدرجة المرصودة</th>
                          <th className="p-3 text-center">النسبة</th>
                          <th className="p-3">التاريخ</th>
                          <th className="p-3">ملاحظات المعلم</th>
                          <th className="p-3 text-center w-12">إجراء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {(selectedStudent.grades || []).map((g) => (
                          <tr key={g.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="p-3 font-extrabold text-slate-900 dark:text-white">{g.assessmentName}</td>
                            <td className="p-3 text-center font-black text-teal-700 dark:text-teal-300 text-sm">
                              {g.obtainedScore} / {g.maxScore}
                            </td>
                            <td className="p-3 text-center font-bold text-slate-500">
                              {Math.round((g.obtainedScore / g.maxScore) * 100)}%
                            </td>
                            <td className="p-3 text-slate-400 whitespace-nowrap">{g.date}</td>
                            <td className="p-3 text-slate-600 dark:text-slate-300">{g.notes || '-'}</td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleDeleteGrade(g.id)}
                                className="p-1 rounded text-rose-500 hover:bg-rose-50"
                                title="حذف"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: ATTENDANCE & ABSENCES */}
              {activeTab === 'attendance' && (
                <div className="space-y-4">
                  {/* Attendance Form */}
                  <form onSubmit={handleAddAttendance} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">التاريخ</label>
                      <input
                        type="date"
                        required
                        value={newAttendanceForm.date}
                        onChange={(e) => setNewAttendanceForm({ ...newAttendanceForm, date: e.target.value })}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">حالة الحضور</label>
                      <select
                        value={newAttendanceForm.status}
                        onChange={(e) => setNewAttendanceForm({ ...newAttendanceForm, status: e.target.value as any })}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 font-bold"
                      >
                        <option value="present">حاضر ✓</option>
                        <option value="absent">غائب ❌</option>
                        <option value="late">متأخر ⏳</option>
                        <option value="excused">مستأذن بعذر 🏥</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">السبب أو الملاحظة</label>
                      <input
                        type="text"
                        value={newAttendanceForm.reason}
                        onChange={(e) => setNewAttendanceForm({ ...newAttendanceForm, reason: e.target.value })}
                        placeholder="عذر طبي / تأخر صباحي"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 font-bold"
                      />
                    </div>
                    <div>
                      <button
                        type="submit"
                        className="w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs"
                      >
                        تسجيل الحالة
                      </button>
                    </div>
                  </form>

                  {/* Attendance Log List */}
                  <div className="space-y-2">
                    {(selectedStudent.attendance || []).map((att) => (
                      <div
                        key={att.id}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            att.status === 'present' ? 'bg-emerald-100 text-emerald-700' :
                            att.status === 'absent' ? 'bg-rose-100 text-rose-700' :
                            att.status === 'late' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {att.status === 'present' ? '✓' : att.status === 'absent' ? '✕' : '⏳'}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {att.status === 'present' ? 'حضور تام' : att.status === 'absent' ? 'غياب' : att.status === 'late' ? 'تأخر' : 'استئذان بعذر'}
                            </span>
                            {att.reason && <span className="text-slate-400 mr-2 text-[11px]">({att.reason})</span>}
                          </div>
                        </div>

                        <span className="text-slate-500 font-mono text-[11px]">{att.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: PEDAGOGICAL NOTES */}
              {activeTab === 'notes' && (
                <div className="space-y-4">
                  {/* Add Note Form */}
                  <form onSubmit={handleAddNote} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">تصنيف الملاحظة</label>
                        <select
                          value={newNoteForm.category}
                          onChange={(e) => setNewNoteForm({ ...newNoteForm, category: e.target.value as any })}
                          className="w-full text-xs px-3 py-2 rounded-xl border bg-white dark:bg-slate-900 font-bold"
                        >
                          <option value="positive">إشادة وتميز جغرافيا ⭐</option>
                          <option value="academic">مستوى أكاديمي وتحصيل</option>
                          <option value="support_needed">خطة دعم وعلاج تربوي 📌</option>
                          <option value="behavioral">سلوك وانضباط مدرسي</option>
                          <option value="special_talent">موهبة ومهارات خاصة 🎨</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">عنوان الملاحظة</label>
                        <input
                          type="text"
                          required
                          value={newNoteForm.title}
                          onChange={(e) => setNewNoteForm({ ...newNoteForm, title: e.target.value })}
                          className="w-full text-xs px-3 py-2 rounded-xl border bg-white dark:bg-slate-900 font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">نص الملاحظة والمشاهدات</label>
                      <textarea
                        rows={2}
                        required
                        value={newNoteForm.content}
                        onChange={(e) => setNewNoteForm({ ...newNoteForm, content: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-xl border bg-white dark:bg-slate-900 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">الإجراء المتخذ أو التوصية</label>
                      <input
                        type="text"
                        value={newNoteForm.actionTaken}
                        onChange={(e) => setNewNoteForm({ ...newNoteForm, actionTaken: e.target.value })}
                        placeholder="تكريم في الإذاعة / تزويده ببطاقات خريطة صماء"
                        className="w-full text-xs px-3 py-2 rounded-xl border bg-white dark:bg-slate-900 font-medium"
                      />
                    </div>

                    <div className="text-left">
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs"
                      >
                        + تدوين الملاحظة في الملف
                      </button>
                    </div>
                  </form>

                  {/* Notes List */}
                  <div className="space-y-3">
                    {(selectedStudent.notes || []).map((not) => {
                      const catCfg = NOTE_CATEGORY_CONFIG[not.category] || NOTE_CATEGORY_CONFIG.academic;
                      return (
                        <div
                          key={not.id}
                          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${catCfg.color}`}>
                              {catCfg.label}
                            </span>
                            <span className="text-slate-400 text-[11px]">{not.date}</span>
                          </div>
                          <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">{not.title}</h5>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{not.content}</p>
                          {not.actionTaken && (
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-teal-700 dark:text-teal-300 font-semibold flex items-center gap-1">
                              <span>📌 الإجراء المتخذ:</span>
                              <span>{not.actionTaken}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 5: OFFICIAL LETTERS */}
              {activeTab === 'letters' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-xs text-teal-900 dark:text-teal-200">الخطابات والمراسلات الموجهة لولي الأمر</h4>
                      <p className="text-[11px] text-teal-700 dark:text-teal-400 mt-0.5">
                        ربط مباشر بمركز الخطابات الرسمية المعتمدة لوزارة التربية والتعليم
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveView('letters')}
                      className="px-3 py-1.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 flex items-center gap-1"
                    >
                      <span>+ كتابة خطاب جديد</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {(selectedStudent.letters || []).length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-xs">
                        لا توجد خطابات أو استدعاءات رسمية محررة لهذا الطالب حالياً
                      </div>
                    ) : (
                      (selectedStudent.letters || []).map((letRef) => (
                        <div
                          key={letRef.id}
                          className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <span className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600">
                              <FileText className="w-4 h-4" />
                            </span>
                            <div>
                              <div className="font-extrabold text-xs text-slate-900 dark:text-white">{letRef.title}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{letRef.type} • {letRef.date}</div>
                            </div>
                          </div>

                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            معتمد ومرسل ✓
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: CUSTOM FIELDS (وأي شيء أحتاج أضيفه في ملف الطالب) */}
              {activeTab === 'custom' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                      إضافة أي حقل أو ملاحظة خاصة في ملف الطالب
                    </h4>
                    <p className="text-[11px] text-slate-500 mb-3">
                      يمكنك هنا تخصيص ملف الطالب بإضافة أي بند تريده (مثل: رقم الحافلة، اسم المستشفى، شهادات التكريم، مشروع التخرج، أو النادي المدرسي).
                    </p>

                    <form onSubmit={handleAddCustomField} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">اسم البند / الحقل</label>
                        <input
                          type="text"
                          required
                          value={newCustomFieldForm.name}
                          onChange={(e) => setNewCustomFieldForm({ ...newCustomFieldForm, name: e.target.value })}
                          placeholder="مثال: رقم الحافلة المدرسية"
                          className="w-full text-xs px-3 py-2 rounded-xl border bg-white dark:bg-slate-900 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">القيمة أو التفاصيل</label>
                        <input
                          type="text"
                          required
                          value={newCustomFieldForm.value}
                          onChange={(e) => setNewCustomFieldForm({ ...newCustomFieldForm, value: e.target.value })}
                          placeholder="مثال: حافلة رقم 14 - خط صحم الداخلي"
                          className="w-full text-xs px-3 py-2 rounded-xl border bg-white dark:bg-slate-900 font-bold"
                        />
                      </div>
                      <div>
                        <button
                          type="submit"
                          className="w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs"
                        >
                          + حفظ في ملف الطالب
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Existing Custom Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedStudent.customFields && Object.keys(selectedStudent.customFields).length > 0 ? (
                      Object.entries(selectedStudent.customFields).map(([k, v]) => (
                        <div
                          key={k}
                          className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center text-xs"
                        >
                          <span className="font-extrabold text-slate-600 dark:text-slate-400">{k}:</span>
                          <span className="font-bold text-slate-900 dark:text-white">{v}</span>
                        </div>
                      ))
                    ) : (
                      <p className="col-span-2 text-center text-slate-400 py-6 text-xs">
                        لم يتم إضافة بنود مخصصة إضافية لهذا الطالب بعد
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 7: OFFICIAL A4 REPORT CARD PREVIEW */}
              {activeTab === 'report_card' && (
                <div ref={reportCardRef} className="bg-white text-slate-900 p-6 rounded-2xl border-2 border-slate-800 max-w-2xl mx-auto shadow-md">
                  {/* Action Buttons */}
                  <div className="mb-4 flex items-center justify-between pb-3 border-b border-slate-300 no-print">
                    <span className="text-xs font-bold text-slate-600">معاينة بطاقة الأداء الأكاديمي والتقويم المعتمدة</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleExportStudentReportCard}
                        disabled={isExportingReportCard}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow transition disabled:opacity-50 cursor-pointer"
                        title="تصدير بطاقة التقرير كملف PDF عالي الجودة"
                      >
                        {isExportingReportCard ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                        <span>تصدير PDF</span>
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="px-3.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>طباعة A4</span>
                      </button>
                    </div>
                  </div>

                  {/* Ministerial Header */}
                  <div className="text-center border-b-2 border-slate-900 pb-3 mb-4 space-y-1">
                    <p className="text-xs font-bold">{countryName || 'سلطنة عمان'} • {ministryName || 'وزارة التربية والتعليم'}</p>
                    <p className="text-xs">{directorateName}</p>
                    <p className="text-sm font-black text-teal-900">{schoolName}</p>
                    <h3 className="text-sm font-extrabold text-slate-900 mt-2">
                      بطاقة تقرير الطالب الشاملة - مادة الدراسات الاجتماعية والجغرافيا
                    </h3>
                  </div>

                  {/* Student Details Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs border border-slate-800 p-2.5 mb-4">
                    <div><span className="font-bold">اسم الطالب:</span> {selectedStudent.fullName}</div>
                    <div><span className="font-bold">الرقم الأكاديمي:</span> {selectedStudent.studentNumber}</div>
                    <div><span className="font-bold">الصف والشعبة:</span> {selectedStudent.gradeName} ({selectedStudent.section})</div>
                    <div><span className="font-bold">العام الدراسي:</span> {academicYear}</div>
                  </div>

                  {/* Grades Table */}
                  <table className="w-full text-right text-xs border-collapse border border-slate-800 mb-4">
                    <thead>
                      <tr className="bg-slate-100 font-bold border-b border-slate-800">
                        <th className="border border-slate-800 p-1.5">مفردات التقويم المستمر</th>
                        <th className="border border-slate-800 p-1.5 text-center">الدرجة</th>
                        <th className="border border-slate-800 p-1.5 text-center">العظمى</th>
                        <th className="border border-slate-800 p-1.5">ملاحظات التحصيل</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedStudent.grades || []).map((g) => (
                        <tr key={g.id} className="border-b border-slate-400">
                          <td className="border border-slate-400 p-1.5 font-bold">{g.assessmentName}</td>
                          <td className="border border-slate-400 p-1.5 text-center font-black">{g.obtainedScore}</td>
                          <td className="border border-slate-400 p-1.5 text-center">{g.maxScore}</td>
                          <td className="border border-slate-400 p-1.5 text-[10px]">{g.notes || 'مستوفي المعايير'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Signatures */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t-2 border-slate-800 text-center text-xs">
                    <div>
                      <p className="font-bold text-slate-700">معلم المادة:</p>
                      <p className="font-black text-slate-900 mt-1">{teacherName || currentUser.name || 'أ. المعلم'}</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full border border-dashed border-teal-800 flex items-center justify-center text-[8px] font-bold text-teal-900 text-center p-1">
                        {stampText || 'ختم المدرسة المعتمد'}
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-slate-700">يعتمد مدير المدرسة:</p>
                      <p className="font-black text-slate-900 mt-1">{principalName || 'أ. سالم البلوشي'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8: INTERACTIVE RECHARTS ANALYTICS & TIMELINE */}
              {activeTab === 'analytics' && (
                <StudentAnalyticsChart student={selectedStudent} />
              )}
            </div>

            {/* Dossier Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs shrink-0">
              <button
                onClick={() => openEditModal(selectedStudent)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold transition flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>تعديل البيانات الأساسية للطالب</span>
              </button>

              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-xl bg-teal-600 text-white font-extrabold hover:bg-teal-700 transition"
              >
                إغلاق الملف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: ADD / EDIT STUDENT FORM */}
      {/* ---------------------------------------------------- */}
      {studentFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-scale-up my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-600">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {editingStudent ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد إلى الصف'}
                  </h3>
                  <p className="text-xs text-slate-500">سلطنة عمان • السجل الأكاديمي المعتمد</p>
                </div>
              </div>

              <button
                onClick={() => setStudentFormModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="mt-4 space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-200 mb-1">
                  اسم الطالب الرباعي والقبيلة *
                </label>
                <input
                  type="text"
                  required
                  value={studentFormData.fullName || ''}
                  onChange={(e) => setStudentFormData({ ...studentFormData, fullName: e.target.value })}
                  placeholder="مثال: أحمد بن سعيد بن ناصر المعمري"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              {/* National ID & Student Number */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">الرقم المدني العماني</label>
                  <input
                    type="text"
                    value={studentFormData.nationalId || ''}
                    onChange={(e) => setStudentFormData({ ...studentFormData, nationalId: e.target.value })}
                    placeholder="11984521"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">الرقم الأكاديمي</label>
                  <input
                    type="text"
                    value={studentFormData.studentNumber || ''}
                    onChange={(e) => setStudentFormData({ ...studentFormData, studentNumber: e.target.value })}
                    placeholder="2026120101"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Grade & Section */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">الصف الدراسي</label>
                  <select
                    value={studentFormData.gradeName || 'الصف الثاني عشر (دبلوم التعليم العام)'}
                    onChange={(e) => setStudentFormData({ ...studentFormData, gradeName: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value="الصف التاسع الأساسي">الصف التاسع الأساسي</option>
                    <option value="الصف العاشر الأساسي">الصف العاشر الأساسي</option>
                    <option value="الصف الحادي عشر (ما بعد الأساسي)">الصف الحادي عشر (ما بعد الأساسي)</option>
                    <option value="الصف الثاني عشر (دبلوم التعليم العام)">الصف الثاني عشر (دبلوم التعليم العام)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">الشعبة الصفية</label>
                  <input
                    type="text"
                    value={studentFormData.section || '12/1'}
                    onChange={(e) => setStudentFormData({ ...studentFormData, section: e.target.value })}
                    placeholder="مثال: 12/1 أو 11/2"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-center"
                  />
                </div>
              </div>

              {/* Parent Name & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">اسم ولي الأمر</label>
                  <input
                    type="text"
                    value={studentFormData.parentName || ''}
                    onChange={(e) => setStudentFormData({ ...studentFormData, parentName: e.target.value })}
                    placeholder="سعيد بن ناصر المعمري"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">هاتف ولي الأمر (واتساب)</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={studentFormData.parentPhone || ''}
                    onChange={(e) => setStudentFormData({ ...studentFormData, parentPhone: e.target.value })}
                    placeholder="+96877394680"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-center"
                  />
                </div>
              </div>

              {/* Address & Academic Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">المحافظة والولاية</label>
                  <input
                    type="text"
                    value={studentFormData.address || ''}
                    onChange={(e) => setStudentFormData({ ...studentFormData, address: e.target.value })}
                    placeholder="شمال الباطنة - ولاية صحم"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">المستوى الأكاديمي</label>
                  <select
                    value={studentFormData.academicStatus || 'good'}
                    onChange={(e) => setStudentFormData({ ...studentFormData, academicStatus: e.target.value as any })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value="excellent">ممتاز / متفوق ⭐</option>
                    <option value="good">جيد جداً</option>
                    <option value="average">متوسط</option>
                    <option value="needs_support">يحتاج دعم علاجي 📌</option>
                  </select>
                </div>
              </div>

              {/* Talents */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  المواهب الجغرافية والاهتمامات (مفصولة بفاصلة)
                </label>
                <input
                  type="text"
                  value={talentsInput}
                  onChange={(e) => setTalentsInput(e.target.value)}
                  placeholder="مثال: رسم الخرائط الصماء، تحليل الطقس، الخط العربي"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStudentFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md shadow-teal-900/20"
                >
                  {editingStudent ? 'حفظ التعديلات' : 'إضافة الطالب الآن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: BULK STUDENTS IMPORT */}
      {/* ---------------------------------------------------- */}
      {bulkImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-teal-600" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  استيراد قائمة طلاب سريعة للشعبة 📋
                </h3>
              </div>
              <button
                onClick={() => setBulkImportModalOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs text-slate-500 leading-relaxed">
                الصق قائمة بأسماء الطلاب (اسم الطالب في كل سطر)، وسيتم توليد الأرقام الأكاديمية وإنشاء ملفاتهم فوراً في الشعبة المحددة.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">الصف</label>
                  <select
                    value={bulkGrade}
                    onChange={(e) => setBulkGrade(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value="الصف التاسع الأساسي">الصف التاسع الأساسي</option>
                    <option value="الصف العاشر الأساسي">الصف العاشر الأساسي</option>
                    <option value="الصف الحادي عشر (ما بعد الأساسي)">الصف الحادي عشر</option>
                    <option value="الصف الثاني عشر (دبلوم التعليم العام)">الصف الثاني عشر</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">الشعبة</label>
                  <input
                    type="text"
                    value={bulkSection}
                    onChange={(e) => setBulkSection(e.target.value)}
                    placeholder="12/1"
                    className="w-full text-xs px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 font-bold text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  قائمة الأسماء (اسم واحد لكل سطر):
                </label>
                <textarea
                  rows={6}
                  value={bulkNamesText}
                  onChange={(e) => setBulkNamesText(e.target.value)}
                  placeholder="أحمد بن سعيد المعمري&#10;محمد بن راشد البلوشي&#10;سيف بن حمد الحارثي&#10;خالد بن سلطان المقبالي"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                />
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setBulkImportModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleBulkImport}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md"
              >
                استيراد القائمة فوراً
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* WHATSAPP PERFORMANCE ALERT MODAL */}
      {/* ---------------------------------------------------- */}
      {whatsappAlertModalOpen && selectedAlertForWhatsApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-5 md:p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    إرسال إشعار ولي الأمر عبر الواتساب
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    متابعة انحدار مستوى الطالب مقارنة بمتوسط الصف • سلطنة عمان 🇴🇲
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWhatsappAlertModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-slate-500">الطالب: </span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedAlertForWhatsApp.studentName}</span>
                  <span className="text-[10px] text-slate-400 mr-2">({selectedAlertForWhatsApp.section})</span>
                </div>
                <div>
                  <span className="text-slate-500">رقم الهاتف: </span>
                  <span className="font-mono font-bold text-teal-600">{selectedAlertForWhatsApp.parentPhone || '+96877394680'}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  نص الإشعار الرسمي لولي الأمر (يمكنك مراجعته والتعديل عليه قبل الإرسال):
                </label>
                <textarea
                  rows={9}
                  value={customWhatsAppMsg}
                  onChange={(e) => setCustomWhatsAppMsg(e.target.value)}
                  className="w-full text-xs p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium leading-relaxed"
                />
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setWhatsappAlertModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleSendWhatsAppAlert}
                disabled={isSendingWhatsAppAlert}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2 transition"
              >
                <Send className={`w-3.5 h-3.5 ${isSendingWhatsAppAlert ? 'animate-spin' : ''}`} />
                <span>{isSendingWhatsAppAlert ? 'جارٍ الإرسال...' : 'إرسال الإشعار لولي الأمر فوراً 📲'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* HIDDEN PRINTABLE CONTAINER FOR WHOLE CLASS REPORT PDF */}
      {/* ---------------------------------------------------- */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div
          ref={classReportRef}
          className="bg-white text-slate-900 p-8 w-[1100px] border border-slate-300 text-right font-sans"
          dir="rtl"
        >
          {/* Official Letterhead */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-4">
            <div className="text-right space-y-1">
              <p className="font-extrabold text-sm text-slate-900">سلطنة عمان</p>
              <p className="text-xs">وزارة التربية والتعليم</p>
              <p className="text-xs">{schoolProfile.directorateName}</p>
              <p className="text-sm font-black text-teal-900">{schoolProfile.schoolName}</p>
            </div>

            <div className="text-center space-y-1">
              <div className="inline-block p-2 rounded-2xl bg-teal-50 border border-teal-200">
                <School className="w-8 h-8 text-teal-800 mx-auto" />
              </div>
              <h2 className="text-base font-black text-slate-900">
                كشف وسجل تقرير الطلاب والتقويم المستمر
              </h2>
              <p className="text-xs text-slate-600">
                مادة الدراسات الاجتماعية والجغرافيا • العام الدراسي {schoolProfile.academicYear}
              </p>
            </div>

            <div className="text-left text-xs space-y-1 font-mono">
              <p>الصف: <span className="font-sans font-bold">{selectedGrade === 'all' ? 'جميع الصفوف' : selectedGrade}</span></p>
              <p>الشعبة: <span className="font-sans font-bold">{selectedSection === 'all' ? 'جميع الشُعب' : selectedSection}</span></p>
              <p>تاريخ الاستخراج: <span className="font-sans">{new Date().toLocaleDateString('ar-OM')}</span></p>
              <p>معلم المادة: <span className="font-sans font-bold">{currentUser.name || 'أ. المعلم'}</span></p>
            </div>
          </div>

          {/* Students Table */}
          <table className="w-full border-collapse border border-slate-800 text-xs mb-6">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-extrabold border-b-2 border-slate-800">
                <th className="border border-slate-800 p-2 text-center w-10">م</th>
                <th className="border border-slate-800 p-2 text-right">اسم الطالب الرباعي</th>
                <th className="border border-slate-800 p-2 text-center">الرقم الأكاديمي</th>
                <th className="border border-slate-800 p-2 text-center">الصف والشعبة</th>
                <th className="border border-slate-800 p-2 text-center">الدرجة المرصودة</th>
                <th className="border border-slate-800 p-2 text-center">النسبة %</th>
                <th className="border border-slate-800 p-2 text-center">التقدير</th>
                <th className="border border-slate-800 p-2 text-center">المواظبة %</th>
                <th className="border border-slate-800 p-2 text-right">الحالة الأكاديمية</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((st, idx) => {
                const stats = getStudentStats(st);
                const statusCfg = ACADEMIC_STATUS_CONFIG[st.academicStatus] || ACADEMIC_STATUS_CONFIG.good;
                return (
                  <tr key={st.id} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                    <td className="border border-slate-400 p-2 text-center font-bold">{idx + 1}</td>
                    <td className="border border-slate-400 p-2 font-black text-slate-900">{st.fullName}</td>
                    <td className="border border-slate-400 p-2 text-center font-mono">{st.studentNumber || '-'}</td>
                    <td className="border border-slate-400 p-2 text-center">{st.gradeName} ({st.section})</td>
                    <td className="border border-slate-400 p-2 text-center font-bold text-teal-800">
                      {stats.totalObtained} / {stats.totalMax || 10}
                    </td>
                    <td className="border border-slate-400 p-2 text-center font-black">
                      {stats.percentage}%
                    </td>
                    <td className="border border-slate-400 p-2 text-center font-extrabold text-teal-900">
                      {stats.percentage >= 90 ? 'ممتاز (أ)' : stats.percentage >= 80 ? 'جيد جداً (ب)' : stats.percentage >= 65 ? 'جيد (ج)' : 'يحتاج تعزيز (د)'}
                    </td>
                    <td className="border border-slate-400 p-2 text-center font-mono">
                      {stats.attRate}%
                    </td>
                    <td className="border border-slate-400 p-2 font-bold text-[11px]">
                      {statusCfg.label}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Statistical Summary */}
          <div className="grid grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-400 rounded-xl mb-6 text-xs text-center">
            <div>
              <span className="text-slate-500 block">إجمالي الطلاب المسجلين:</span>
              <strong className="text-base text-slate-900">{filteredStudents.length} طالب</strong>
            </div>
            <div>
              <span className="text-slate-500 block">نسبة النجاح والاجتياز:</span>
              <strong className="text-base text-emerald-700">
                {filteredStudents.length > 0
                  ? Math.round((filteredStudents.filter(s => getStudentStats(s).percentage >= 50).length / filteredStudents.length) * 100)
                  : 100}%
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">الطلاب المتفوقون (ممتاز):</span>
              <strong className="text-base text-teal-700">
                {filteredStudents.filter(s => getStudentStats(s).percentage >= 90).length} طالب
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">بحاجة لدعم ومتابعة:</span>
              <strong className="text-base text-rose-700">
                {filteredStudents.filter(s => getStudentStats(s).percentage < 65).length} طالب
              </strong>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t-2 border-slate-900 text-center text-xs">
            <div>
              <p className="font-bold text-slate-700">معلم المادة:</p>
              <p className="font-black text-slate-900 mt-2">{currentUser.name || 'أ. المعلم'}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-teal-900 flex items-center justify-center text-[9px] font-black text-teal-900 text-center p-2">
                ختم المدرسة المعتمد
              </div>
            </div>
            <div>
              <p className="font-bold text-slate-700">يعتمد مدير المدرسة:</p>
              <p className="font-black text-slate-900 mt-2">{schoolProfile.principalName || 'أ. سالم البلوشي'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
