import { useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { SchoolProfile } from '../types/index.ts';

/**
 * Custom Hook: useSchoolProfile
 * يوفر وصولاً تفاعلياً وموحداً لبيانات المدرسة، المعلم، المشرف، والمحافظة
 * مع دوال ربط تلقائية بكافة النماذج والتقارير والمستندات والخطابات والخطط وأوراق العمل.
 */
export interface OfficialHeaderInfo {
  countryName: string;
  ministryName: string;
  governorateName: string;
  directorateName: string;
  schoolName: string;
  teacherName: string;
  supervisorName: string;
  academicYear: string;
  semester: string;
  principalName: string;
  stampText: string;
  formattedHeaderLine: string;
}

export function useSchoolProfile() {
  const {
    schoolProfile,
    updateSchoolProfile,
    refreshSchoolProfile,
    openSchoolProfileModal,
    closeSchoolProfileModal,
    isSchoolProfileModalOpen,
    currentUser
  } = useApp();

  // Resolved dynamic fields with safe ministry-standard fallbacks
  const schoolName = schoolProfile.schoolName || 'مدرسة كعب بن برشة للتعليم ما بعد الأساسي (11 - 12)';
  const teacherName = schoolProfile.teacherName || currentUser.name || 'أ. علاءالدين ضي النور محمد خليفة';
  const supervisorName = schoolProfile.supervisorName || schoolProfile.firstTeacherName || 'أ. أحمد بن سالم البلوشي (مشرف أول الدراسات الاجتماعية والجغرافيا)';
  const governorateName = schoolProfile.governorateName || 'شمال الباطنة';
  const directorateName = schoolProfile.directorateName || `المديرية العامة للتربية والتعليم بمحافظة ${governorateName}`;
  const ministryName = schoolProfile.ministryName || 'وزارة التربية والتعليم';
  const countryName = schoolProfile.countryName || 'سلطنة عمان';
  const academicYear = schoolProfile.academicYear || '2026 / 2027 م';
  const semester = schoolProfile.semester || 'الفصل الدراسي الأول';
  const principalName = schoolProfile.principalName || 'أ. سالم بن خميس البلوشي';
  const stampText = schoolProfile.stampText || `${schoolName} • سلطنة عمان`;
  const subjectName = schoolProfile.subjectName || 'الدراسات الاجتماعية والجغرافيا';

  // Structured official header metadata
  const officialHeader: OfficialHeaderInfo = useMemo(() => ({
    countryName,
    ministryName,
    governorateName,
    directorateName,
    schoolName,
    teacherName,
    supervisorName,
    academicYear,
    semester,
    principalName,
    stampText,
    formattedHeaderLine: `${countryName} • ${ministryName} • ${directorateName} • ${schoolName}`
  }), [
    countryName,
    ministryName,
    governorateName,
    directorateName,
    schoolName,
    teacherName,
    supervisorName,
    academicYear,
    semester,
    principalName,
    stampText
  ]);

  /**
   * Helper: bindToForm
   * يدمج بيانات المدرسة والمعلم والمشرف والمحافظة تلقائياً في أي كائن نموذج أو مدخلات مستند
   */
  const bindToForm = useCallback(<T extends Record<string, any>>(formState: T = {} as T): T => {
    return {
      ...formState,
      schoolName: formState.schoolName || schoolName,
      directorateName: formState.directorateName || directorateName,
      governorateName: formState.governorateName || governorateName,
      teacherName: formState.teacherName || teacherName,
      senderName: formState.senderName || teacherName,
      supervisorName: formState.supervisorName || supervisorName,
      academicYear: formState.academicYear || academicYear,
      semester: formState.semester || semester,
      semesterName: formState.semesterName || semester
    };
  }, [schoolName, directorateName, governorateName, teacherName, supervisorName, academicYear, semester]);

  /**
   * Helper: generateOfficialLetterInitialState
   * يجهز الحالة الافتراضية لأي خطاب أو مراسلة رسمية جديدة بمعلومات المدرسة والمعلم والمشرف الحالية
   */
  const getOfficialLetterDefaults = useCallback((options?: {
    letterType?: string;
    category?: string;
    subject?: string;
    recipientName?: string;
    recipientTitle?: string;
  }) => {
    const randomRef = Math.floor(Math.random() * 900 + 100);
    return {
      schoolName,
      directorateName,
      governorateName,
      senderName: teacherName,
      senderRole: 'معلم أول مادة الجغرافيا والدراسات الاجتماعية',
      referenceNumber: `م/ت/ع/1448/${randomRef}`,
      dateHijri: '15 ربيع الأول 1448 هـ',
      dateMiladi: new Date().toLocaleDateString('ar-OM', { year: 'numeric', month: 'long', day: 'numeric' }),
      recipientName: options?.recipientName || '',
      recipientTitle: options?.recipientTitle || 'المحترم / حفظه الله ورعاه',
      subject: options?.subject || '',
      salutation: 'السلام عليكم ورحمة الله وبركاته،،، وبعد:',
      closing: 'وتفضلوا بقبول فائق الاحترام والتقدير،،،',
      bodyText: '',
      actionRequired: '',
      attachmentsText: ''
    };
  }, [schoolName, directorateName, governorateName, teacherName]);

  /**
   * Helper: generatePrintableHeaderHtml
   * ينتج كود HTML للترويسة الوزارية المعتمدة للطباعة والتصدير بجودة A4 عالية
   */
  const generatePrintableHeaderHtml = useCallback((title: string, options?: {
    subtitle?: string;
    referenceNumber?: string;
    date?: string;
    showStamp?: boolean;
    additionalLeftMeta?: string;
  }) => {
    return `
      <div class="ministerial-header" style="border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start; direction: rtl; text-align: right; font-family: 'Cairo', Tahoma, sans-serif;">
        <div style="font-size: 9.5pt; line-height: 1.5; width: 34%;">
          <div style="font-weight: 900; font-size: 11pt; color: #0f172a;">${countryName}</div>
          <div style="font-weight: bold; color: #334155;">${ministryName}</div>
          <div style="color: #475569;">${directorateName}</div>
          <div style="font-weight: 800; color: #0d9488; margin-top: 2px;">${schoolName}</div>
          ${governorateName ? `<div style="font-size: 8pt; color: #64748b;">محافظة ${governorateName}</div>` : ''}
        </div>

        <div style="text-align: center; width: 32%;">
          <div style="width: 50px; height: 50px; margin: 0 auto 6px auto; border-radius: 12px; background: #0f766e; color: #fde047; display: flex; align-items: center; justify-content: center; font-size: 20pt; font-weight: bold;">
            🇴🇲
          </div>
          <h1 style="margin: 0; font-size: 13pt; font-weight: 900; color: #0f172a;">${title}</h1>
          ${options?.subtitle ? `<p style="margin: 2px 0 0 0; font-size: 8.5pt; color: #475569;">${options.subtitle}</p>` : ''}
        </div>

        <div style="font-size: 9pt; line-height: 1.5; text-align: left; width: 34%;">
          <div><strong>العام الدراسي:</strong> ${academicYear}</div>
          <div><strong>الفصل الدراسي:</strong> ${semester}</div>
          <div><strong>المعلم:</strong> <span style="font-weight: bold; color: #0d9488;">${teacherName}</span></div>
          <div><strong>المشرف:</strong> <span style="font-weight: 600; color: #475569;">${supervisorName}</span></div>
          ${options?.referenceNumber ? `<div><strong>الرقم الإشاري:</strong> <span style="font-family: monospace; font-weight: bold;">${options.referenceNumber}</span></div>` : ''}
          ${options?.date ? `<div><strong>التاريخ:</strong> ${options.date}</div>` : ''}
          ${options?.additionalLeftMeta || ''}
        </div>
      </div>
    `;
  }, [countryName, ministryName, directorateName, schoolName, governorateName, academicYear, semester, teacherName, supervisorName]);

  /**
   * Helper: generatePrintableSignaturesHtml
   * ينتج كود HTML المعتمد لخانات التوقيع الثلاثية (المعد، المشرف، مدير المدرسة مع الختم)
   */
  const generatePrintableSignaturesHtml = useCallback((options?: {
    teacherTitle?: string;
    supervisorTitle?: string;
    principalTitle?: string;
  }) => {
    return `
      <div class="official-signatures" style="margin-top: 30px; display: flex; justify-content: space-around; text-align: center; font-size: 9pt; font-family: 'Cairo', Tahoma, sans-serif; border-top: 1px solid #cbd5e1; padding-top: 18px; direction: rtl;">
        <div style="width: 30%;">
          <p style="font-weight: bold; margin: 0 0 6px 0; color: #334155;">${options?.teacherTitle || 'معلم المادة / معد الوثيقة'}</p>
          <p style="font-weight: 900; color: #0d9488; margin: 12px 0 6px 0;">${teacherName}</p>
          <p style="font-size: 8pt; color: #94a3b8; margin: 4px 0 0 0;">التوقيع: .....................</p>
        </div>

        <div style="width: 30%;">
          <p style="font-weight: bold; margin: 0 0 6px 0; color: #334155;">${options?.supervisorTitle || 'المعلم الأول / المشرف التربوي'}</p>
          <p style="font-weight: 800; color: #475569; margin: 12px 0 6px 0;">${supervisorName}</p>
          <p style="font-size: 8pt; color: #94a3b8; margin: 4px 0 0 0;">التوقيع: .....................</p>
        </div>

        <div style="width: 30%;">
          <p style="font-weight: bold; margin: 0 0 6px 0; color: #334155;">${options?.principalTitle || 'يعتمد مدير / مديرة المدرسة'}</p>
          <p style="font-weight: 800; color: #475569; margin: 12px 0 6px 0;">${principalName}</p>
          <div style="margin: 6px auto; width: 80px; height: 35px; border: 1px dashed #0d9488; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 7.5pt; color: #0d9488; font-weight: bold;">
            الختم الرسمي
          </div>
          <p style="font-size: 8pt; color: #94a3b8; margin: 2px 0 0 0;">التوقيع: .....................</p>
        </div>
      </div>
    `;
  }, [teacherName, supervisorName, principalName]);

  return {
    // Raw profile object
    profile: schoolProfile,
    schoolProfile,

    // Extracted individual variables
    schoolName,
    teacherName,
    supervisorName,
    governorateName,
    directorateName,
    ministryName,
    countryName,
    academicYear,
    semester,
    principalName,
    stampText,
    subjectName,

    // Structured metadata
    officialHeader,

    // Practical binding helpers
    bindToForm,
    getOfficialLetterDefaults,
    generatePrintableHeaderHtml,
    generatePrintableSignaturesHtml,

    // Mutation & Modal Controls
    updateProfile: updateSchoolProfile,
    updateSchoolProfile,
    refreshProfile: refreshSchoolProfile,
    refreshSchoolProfile,
    openEditModal: openSchoolProfileModal,
    openSchoolProfileModal,
    closeEditModal: closeSchoolProfileModal,
    closeSchoolProfileModal,
    isEditModalOpen: isSchoolProfileModalOpen,
    isSchoolProfileModalOpen
  };
}
