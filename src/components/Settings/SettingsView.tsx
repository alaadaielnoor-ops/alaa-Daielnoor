import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { AuditLog, User, SchoolProfile } from '../../types/index.ts';
import {
  Settings, Shield, Users, Database, Clock, Building2, School,
  CheckCircle2, Key, Sun, Moon, HardDrive, MessageSquare, Sparkles,
  UserCheck, MapPin, RefreshCw, Check, ArrowRight, BookOpen, Layers
} from 'lucide-react';

import { EditUserModal } from '../Users/EditUserModal.tsx';
import { WhatsAppIntegrationHub } from './WhatsAppIntegrationHub.tsx';

export const SettingsView: React.FC = () => {
  const {
    currentUser,
    switchUser,
    isDarkMode,
    toggleDarkMode,
    stats,
    setActiveView,
    schoolProfile,
    updateSchoolProfile,
    showToast
  } = useApp();

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs: 'school_profile' | 'whatsapp' | 'general'
  const [activeSection, setActiveSection] = useState<'school_profile' | 'whatsapp' | 'general'>('school_profile');

  // School Profile Form State
  const [profileForm, setProfileForm] = useState<SchoolProfile>({
    schoolName: '',
    teacherName: '',
    supervisorName: '',
    governorateName: 'شمال الباطنة',
    directorateName: 'المديرية العامة للتربية والتعليم بمحافظة شمال الباطنة',
    ministryName: 'وزارة التربية والتعليم',
    countryName: 'سلطنة عمان',
    academicYear: '2026 / 2027 م',
    semester: 'الفصل الدراسي الأول',
    principalName: '',
    firstTeacherName: '',
    subjectName: 'الدراسات الاجتماعية والجغرافيا',
    stampText: ''
  });
  const [cascadeToAll, setCascadeToAll] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  // User editing modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isNewUserModal, setIsNewUserModal] = useState(false);

  useEffect(() => {
    loadSettingsData();
  }, []);

  useEffect(() => {
    if (schoolProfile) {
      setProfileForm({
        schoolName: schoolProfile.schoolName || '',
        teacherName: schoolProfile.teacherName || 'أ. علاءالدين ضي النور محمد خليفة',
        supervisorName: schoolProfile.supervisorName || 'أ. أحمد بن سالم البلوشي',
        governorateName: schoolProfile.governorateName || 'شمال الباطنة',
        directorateName: schoolProfile.directorateName || 'المديرية العامة للتربية والتعليم بمحافظة شمال الباطنة',
        ministryName: schoolProfile.ministryName || 'وزارة التربية والتعليم',
        countryName: schoolProfile.countryName || 'سلطنة عمان',
        academicYear: schoolProfile.academicYear || '2026 / 2027 م',
        semester: schoolProfile.semester || 'الفصل الدراسي الأول',
        principalName: schoolProfile.principalName || 'أ. سالم بن خميس البلوشي',
        firstTeacherName: schoolProfile.firstTeacherName || 'أ. مريم المعمرية',
        subjectName: schoolProfile.subjectName || 'الدراسات الاجتماعية والجغرافيا',
        stampText: schoolProfile.stampText || 'مدرسة كعب بن برشة • سلطنة عمان'
      });
    }
  }, [schoolProfile]);

  const loadSettingsData = async () => {
    setLoading(true);
    try {
      const [audRes, usrRes] = await Promise.all([
        api.getAuditLogs(),
        api.getUsers()
      ]);
      if (audRes.success && audRes.auditLogs) {
        setAuditLogs(audRes.auditLogs);
      }
      if (usrRes.success && usrRes.users) {
        setUsers(usrRes.users);
      }
    } catch (e) {
      console.warn('Settings load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleGovernorateChange = (gov: string) => {
    const cleanGov = gov.trim().replace(/^محافظة\s+/, '');
    setProfileForm(prev => ({
      ...prev,
      governorateName: cleanGov,
      directorateName: cleanGov ? `المديرية العامة للتربية والتعليم بمحافظة ${cleanGov}` : prev.directorateName
    }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.schoolName.trim()) {
      showToast('يرجى إدخال اسم المدرسة', 'error');
      return;
    }
    if (!profileForm.teacherName?.trim()) {
      showToast('يرجى إدخال اسم الأستاذ / المعلم', 'error');
      return;
    }

    setSavingProfile(true);
    try {
      const ok = await updateSchoolProfile(profileForm, cascadeToAll);
      if (ok) {
        showToast('تم حفظ وتعميم البيانات الموحدة على كامل أقسام المنصة بنجاح! 🚀', 'success');
      }
    } catch (err: any) {
      showToast('خطأ أثناء الحفظ: ' + err.message, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Section Switcher */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <span>إعدادات المنصة الموحدة والترويسة المدرسية</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            التحكم الشامل في اسم المدرسة، المعلم، المشرف، المحافظة، وربط الواتساب وسجل العمليات
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-wrap">
          <button
            onClick={() => setActiveSection('school_profile')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeSection === 'school_profile'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-amber-300" />
            <span>بيانات المدرسة والترويسة الموحدة</span>
          </button>

          <button
            onClick={() => setActiveSection('whatsapp')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeSection === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>ربط الواتساب (WhatsApp API)</span>
          </button>

          <button
            onClick={() => setActiveSection('general')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeSection === 'general'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>المستخدمون والأمان والتدقيق</span>
          </button>
        </div>
      </div>

      {/* TAB 1: UNIFIED SCHOOL, TEACHER, SUPERVISOR & GOVERNORATE SETTINGS */}
      {activeSection === 'school_profile' && (
        <div className="space-y-6">
          {/* Information & Cascade Highlight Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-950 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10 max-w-3xl space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>التعميم الموحد والشامل لكافة وثائق وجداول المنظومة</span>
              </div>
              <h3 className="text-xl md:text-2xl font-black">
                إعدادات اسم المدرسة والمعلم والمشرف والمحافظة
              </h3>
              <p className="text-slate-200 text-xs md:text-sm leading-relaxed">
                أي تعديل تدخله هنا على: <strong>اسم المدرسة</strong>، <strong>اسم الأستاذ</strong>، <strong>اسم المشرف التربوي</strong>، و<strong>اسم المحافظة</strong>، يتم تعميمه تلقائياً وفورياً على: جدول الحصص الأسبوعي، جميع الخطابات والمراسلات الرسمية، خطط وتحضير الدروس، الخطط السنوية والفصلية، وأوراق العمل والاختبارات المدرسية.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Live Visual Letterhead Preview */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>معاينة حية لشكل الترويسة الرسمية (Header) المعتمدة عند الطباعة والتصدير:</span>
                </h4>
                <span className="text-[10px] text-teal-700 dark:text-teal-300 font-bold bg-teal-50 dark:bg-teal-950 px-2.5 py-1 rounded-xl border border-teal-200 dark:border-teal-800">
                  تتحدث تلقائياً مع مدخلاتك ⚡
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 border-2 border-dashed border-teal-500/40 space-y-3">
                <div className="text-center font-serif text-[11px] font-bold text-slate-600 dark:text-slate-300 tracking-widest">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </div>

                <div className="flex items-start justify-between text-xs font-semibold leading-relaxed border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="text-right space-y-0.5">
                    <p className="font-black text-slate-900 dark:text-white text-sm">{profileForm.countryName || 'سلطنة عمان'}</p>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px]">{profileForm.ministryName || 'وزارة التربية والتعليم'}</p>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                      {profileForm.directorateName || `المديرية العامة للتربية والتعليم بمحافظة ${profileForm.governorateName}`}
                    </p>
                    <p className="text-teal-700 dark:text-teal-400 font-black text-base mt-0.5">
                      {profileForm.schoolName || 'اسم مدرستك يظهر هنا'}
                    </p>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-teal-800 text-amber-300 flex items-center justify-center shadow-md">
                      <School className="w-8 h-8" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 mt-1">ترويسة معتمدة</span>
                  </div>

                  <div className="text-left space-y-0.5 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                    <p>العام: <span className="font-sans font-semibold text-slate-700 dark:text-slate-300">{profileForm.academicYear}</span></p>
                    <p>الفصل: <span className="font-sans text-slate-700 dark:text-slate-300">{profileForm.semester}</span></p>
                    <p>التاريخ: <span className="font-sans">{new Date().toLocaleDateString('ar-OM')}</span></p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs pt-1">
                  <div className="p-2.5 rounded-xl bg-teal-50/80 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800">
                    <span className="text-slate-400 block text-[10px]">الأستاذ / المعلم:</span>
                    <strong className="text-teal-900 dark:text-teal-100 truncate block">
                      {profileForm.teacherName || 'أ. علاءالدين ضي النور'}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-sky-50/80 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800">
                    <span className="text-slate-400 block text-[10px]">المشرف التربوي:</span>
                    <strong className="text-sky-900 dark:text-sky-100 truncate block">
                      {profileForm.supervisorName || 'أ. أحمد بن سالم البلوشي'}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800">
                    <span className="text-slate-400 block text-[10px]">المحافظة:</span>
                    <strong className="text-amber-900 dark:text-amber-100 truncate block">
                      {profileForm.governorateName ? `محافظة ${profileForm.governorateName}` : 'شمال الباطنة'}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-purple-50/80 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800">
                    <span className="text-slate-400 block text-[10px]">ختم المدرسة المعتمد:</span>
                    <strong className="text-purple-900 dark:text-purple-100 truncate block text-[11px]">
                      {profileForm.stampText || 'مدرسة كعب بن برشة • سلطنة عمان'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* The 4 Core Requested Settings Fields */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <School className="w-5 h-5 text-teal-600" />
                  <span>البيانات الأساسية الأربعة (المدرسة، الأستاذ، المشرف، المحافظة)</span>
                </h3>
                <span className="text-xs text-rose-500 font-bold">* حقول إلزامية للتعميم</span>
              </div>

              {/* 1. اسم المدرسة */}
              <div>
                <label className="block font-black text-slate-900 dark:text-white mb-1.5 text-xs flex items-center gap-1.5">
                  <School className="w-4 h-4 text-teal-600" />
                  <span>1. اسم المدرسة كاملاً:</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.schoolName}
                  onChange={e => setProfileForm(prev => ({ ...prev, schoolName: e.target.value }))}
                  placeholder="مثال: مدرسة كعب بن برشة للتعليم ما بعد الأساسي (11 - 12)"
                  className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 transition"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  يسمع في أعلى كل وثيقة، جدول الحصص، وأعلى الخطابات الرسمية، والخطط السنوية وأوراق العمل.
                </span>
              </div>

              {/* 2 & 3. اسم الأستاذ واسم المشرف */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block font-black text-slate-900 dark:text-white mb-1.5 text-xs flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-teal-600" />
                    <span>2. اسم الأستاذ / المعلم:</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.teacherName || ''}
                    onChange={e => setProfileForm(prev => ({ ...prev, teacherName: e.target.value }))}
                    placeholder="مثال: أ. علاءالدين ضي النور محمد خليفة"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-xs font-black text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    يسمع في جدول الحصص كمعلم المادة، وفي صفة الراسل بالخطابات الرسمية، وخانة المعلم في خطط الدروس والخطط السنوية.
                  </span>
                </div>

                <div>
                  <label className="block font-black text-slate-900 dark:text-white mb-1.5 text-xs flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-sky-600" />
                    <span>3. اسم المشرف التربوي / المعلم الأول:</span>
                  </label>
                  <input
                    type="text"
                    value={profileForm.supervisorName || ''}
                    onChange={e => setProfileForm(prev => ({ ...prev, supervisorName: e.target.value }))}
                    placeholder="مثال: أ. أحمد بن سالم البلوشي"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-xs font-black text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    يسمع في خانة "المشرف التربوي" في خطط الدروس والخطط السنوية والفصلية واعتمادات الخطابات الرسمية.
                  </span>
                </div>
              </div>

              {/* 4. اسم المحافظة والمديرية */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block font-black text-slate-900 dark:text-white mb-1.5 text-xs flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    <span>4. اسم المحافظة التعليمية:</span>
                  </label>
                  <input
                    type="text"
                    value={profileForm.governorateName || ''}
                    onChange={e => handleGovernorateChange(e.target.value)}
                    placeholder="مثال: شمال الباطنة أو مسقط أو ظفار أو الداخلية"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-xs font-black text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    يحدث ترويسة المديرية فوراً (مثال: المديرية العامة للتربية والتعليم بمحافظة شمال الباطنة).
                  </span>
                </div>

                <div>
                  <label className="block font-black text-slate-900 dark:text-white mb-1.5 text-xs flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-slate-500" />
                    <span>نص ترويسة المديرية العامة:</span>
                  </label>
                  <input
                    type="text"
                    value={profileForm.directorateName}
                    onChange={e => setProfileForm(prev => ({ ...prev, directorateName: e.target.value }))}
                    placeholder="مثال: المديرية العامة للتربية والتعليم بمحافظة شمال الباطنة"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Complementary fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-xs">
                    العام الدراسي:
                  </label>
                  <input
                    type="text"
                    value={profileForm.academicYear}
                    onChange={e => setProfileForm(prev => ({ ...prev, academicYear: e.target.value }))}
                    placeholder="2026 / 2027 م"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-xs">
                    الفصل الدراسي:
                  </label>
                  <input
                    type="text"
                    value={profileForm.semester || 'الفصل الدراسي الأول'}
                    onChange={e => setProfileForm(prev => ({ ...prev, semester: e.target.value }))}
                    placeholder="الفصل الدراسي الأول"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-xs">
                    نص ختم المدرسة المعتمد:
                  </label>
                  <input
                    type="text"
                    value={profileForm.stampText || ''}
                    onChange={e => setProfileForm(prev => ({ ...prev, stampText: e.target.value }))}
                    placeholder="مدرسة كعب بن برشة • سلطنة عمان"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                  />
                </div>
              </div>

              {/* Cascade Checkbox */}
              <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-300 dark:border-teal-800 space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="cascadeToAllSettings"
                    checked={cascadeToAll}
                    onChange={e => setCascadeToAll(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded-md focus:ring-teal-500 cursor-pointer"
                  />
                  <label htmlFor="cascadeToAllSettings" className="text-xs font-black text-teal-950 dark:text-teal-200 cursor-pointer">
                    تعميم هذه البيانات وتحديثها فورياً في جميع أقسام المنظومة
                  </label>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px] text-teal-900 dark:text-teal-300 pt-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>جدول الحصص الأسبوعي</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>المراسلات والخطابات الرسمية</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>خطط وتحضير الدروس</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>الخطط السنوية والفصلية</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>أوراق العمل والأنشطة</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>سجل وتقارير الطلاب</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full py-3.5 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-sm transition shadow-md shadow-teal-700/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {savingProfile ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>جاري تعميم البيانات على جميع الأقسام...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      <span>حفظ وتعميم البيانات على جدول الحصص والخطابات والخطط وأوراق العمل فوراً 🚀</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: WHATSAPP INTEGRATION */}
      {activeSection === 'whatsapp' && (
        <WhatsAppIntegrationHub />
      )}

      {/* TAB 3: USERS, SECURITY & AUDIT LOGS */}
      {activeSection === 'general' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Roles & Users Management Card */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs md:col-span-1">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-teal-600" />
                  <span>إدارة المستخدمين والصلاحيات ({users.length})</span>
                </h3>
                <button
                  onClick={() => {
                    setUserToEdit(null);
                    setIsNewUserModal(true);
                    setEditModalOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[11px] font-extrabold hover:bg-teal-100 transition border border-teal-200 dark:border-teal-800 flex items-center gap-1"
                >
                  <span>+ إضافة مستخدم</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                💡 <strong>لتعديل اسم المستخدم أو صورته أو دوره:</strong> اضغط على أيقونة التعديل (✏️) بجانب أي حساب.
              </div>

              <div className="space-y-2.5">
                {users.map(u => (
                  <div
                    key={u.id}
                    className={`p-3 rounded-2xl text-xs border transition flex items-center justify-between gap-3 ${
                      currentUser.id === u.id
                        ? 'bg-teal-50/70 dark:bg-teal-950/60 border-teal-500 text-teal-950 dark:text-teal-100 font-bold shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div
                      onClick={() => switchUser(u.id)}
                      className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                      title="انقر للتبديل إلى هذا الحساب"
                    >
                      {u.avatarUrl ? (
                        <img
                          src={u.avatarUrl}
                          alt={u.name}
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-teal-600 shadow-xs shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-bold flex items-center justify-center text-xs shrink-0">
                          {u.name.slice(0, 1)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold truncate text-slate-900 dark:text-white">{u.name}</span>
                          {currentUser.id === u.id && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-teal-600 text-white font-extrabold shrink-0">
                              الحالي
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                          <span className="truncate">{u.email}</span>
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold shrink-0">
                            {u.role === 'admin' ? 'مالك المكتبة' : u.role === 'teacher' ? 'معلم ومؤلف' : 'مطلع'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setUserToEdit(u);
                        setIsNewUserModal(false);
                        setEditModalOpen(true);
                      }}
                      className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-teal-600 hover:border-teal-500 transition shrink-0 shadow-xs cursor-pointer"
                      title="تعديل اسم وبيانات المستخدم"
                    >
                      <span className="text-xs font-bold px-1">✏️ تعديل</span>
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setActiveView('users')}
                className="w-full py-2.5 px-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/40 text-teal-800 dark:text-teal-200 text-xs font-bold transition flex items-center justify-center gap-2 border border-teal-200 dark:border-teal-800 cursor-pointer shadow-xs"
              >
                <Users className="w-4 h-4 text-teal-600" />
                <span>الانتقال لشاشة إدارة المستخدمين الكاملة</span>
              </button>
            </div>

            {/* Security & System Info */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-teal-600" />
                  <span>محددات الأمان والتخزين</span>
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">فحص أمان الملفات:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>مفعل (تجزئة SHA-256)</span>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">حماية الذكاء الاصطناعي:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>عزل مستندات المستخدم</span>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">تطبيق الويب التقدمي (PWA):</span>
                  <span className="font-bold text-teal-600">
                    جاهز للتثبيت دون اتصال
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">السمة البصرية:</span>
                  <button
                    onClick={toggleDarkMode}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold cursor-pointer"
                  >
                    {isDarkMode ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3" />}
                    <span>{isDarkMode ? 'الوضع الداكن' : 'الوضع الفاتح'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Database Status */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-teal-600" />
                  <span>إحصاءات المستودع الرقمي</span>
                </h3>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">إجمالي الكتب والمراجع:</span>
                  <span className="font-bold">{stats?.totalResources || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">الصفحات المفهرسة:</span>
                  <span className="font-bold">{stats?.indexedPages || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">الدروس والأنشطة:</span>
                  <span className="font-bold">{(stats?.totalLessons || 0) + (stats?.totalWorksheets || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">مساحة التخزين المستهلكة:</span>
                  <span className="font-bold text-teal-600">{((stats?.totalStorageBytes || 0) / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>سجل تدقيق العمليات (Audit Trail)</span>
              </h3>
              <span className="text-xs text-slate-400 font-bold">{auditLogs.length} عملية مسجلة</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 font-bold text-slate-500">
                    <th className="pb-2.5">التوقيت</th>
                    <th className="pb-2.5">المستخدم</th>
                    <th className="pb-2.5">نوع الإجراء</th>
                    <th className="pb-2.5">الهدف</th>
                    <th className="pb-2.5">الوصف والبيان</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleTimeString('ar-SA')} - {new Date(log.timestamp).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="py-2.5 font-bold text-slate-700 dark:text-slate-300">{log.userName}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-500">{log.targetType}</td>
                      <td className="py-2.5 text-slate-800 dark:text-slate-200 leading-relaxed">{log.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={userToEdit}
        isNewUser={isNewUserModal}
        onSuccess={loadSettingsData}
      />
    </div>
  );
};
