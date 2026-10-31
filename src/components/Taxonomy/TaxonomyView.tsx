import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { Subject, EducationalStage, Grade, Unit, Lesson, OmanVision2040Goal } from '../../types/index.ts';
import {
  Layers, Plus, BookOpen, GraduationCap,
  Download, Upload, CheckCircle2, ChevronLeft, X,
  Award, Sparkles, Compass, ShieldCheck, ChevronDown, ChevronUp, Zap
} from 'lucide-react';
import { TextbookCurriculumIndex } from '../Curriculum/TextbookCurriculumIndex.tsx';

export const TaxonomyView: React.FC = () => {
  const { showToast, currentUser, setActiveView } = useApp();

  const [activeTab, setActiveTab] = useState<'index' | 'curriculum' | 'vision2040'>('index');
  const [stages, setStages] = useState<EducationalStage[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  // Vision 2040 State
  const [visionGoals, setVisionGoals] = useState<OmanVision2040Goal[]>([]);
  const [visionStats, setVisionStats] = useState<any>(null);
  const [expandedGoalCode, setExpandedGoalCode] = useState<string | null>('V2040-EDU-01');

  // Active selections
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedGradeId, setSelectedGradeId] = useState<string>('');

  // Modals
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);

  // Form states
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjCode, setNewSubjCode] = useState('');
  const [newSubjColor, setNewSubjColor] = useState('#0d9488');
  const [newUnitTitle, setNewUnitTitle] = useState('');
  const [newLessonTitle, setNewLessonTitle] = useState('');

  useEffect(() => {
    loadTaxonomy();
  }, []);

  const loadTaxonomy = async () => {
    setLoading(true);
    try {
      const [taxRes, visRes] = await Promise.all([
        api.getTaxonomy(),
        api.getVision2040Goals()
      ]);

      if (visRes.success && visRes.goals) {
        setVisionGoals(visRes.goals);
        setVisionStats(visRes.stats || null);
      }

      if (taxRes.success && taxRes.taxonomy) {
        setStages(taxRes.taxonomy.stages || []);
        setGrades(taxRes.taxonomy.grades || []);
        setSubjects(taxRes.taxonomy.subjects || []);
        setUnits(taxRes.taxonomy.units || []);
        setLessons(taxRes.taxonomy.lessons || []);

        if (taxRes.taxonomy.subjects?.length > 0 && !selectedSubjectId) {
          setSelectedSubjectId(taxRes.taxonomy.subjects[0].id);
        }
        if (taxRes.taxonomy.grades?.length > 0 && !selectedGradeId) {
          setSelectedGradeId(taxRes.taxonomy.grades[0].id);
        }
      }
    } catch (e) {
      console.warn('Taxonomy load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjName.trim()) return;
    try {
      const res = await api.addSubject(newSubjName.trim(), newSubjCode.trim() || 'SUBJ', newSubjColor);
      if (res.success) {
        showToast('تمت إضافة المادة الدراسية بنجاح!', 'success');
        setShowAddSubjectModal(false);
        setNewSubjName('');
        loadTaxonomy();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitTitle.trim() || !selectedSubjectId || !selectedGradeId) return;
    try {
      const res = await api.addUnit(selectedSubjectId, selectedGradeId, 'sem-1', newUnitTitle.trim(), units.length + 1);
      if (res.success) {
        showToast('تمت إضافة الوحدة الدراسية بنجاح!', 'success');
        setShowAddUnitModal(false);
        setNewUnitTitle('');
        loadTaxonomy();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleAddLesson = async (e: React.FormEvent, unitId: string) => {
    e.preventDefault();
    if (!newLessonTitle.trim()) return;
    try {
      const res = await api.addLesson(unitId, newLessonTitle.trim(), 1);
      if (res.success) {
        showToast('تمت إضافة الدرس بنجاح!', 'success');
        setShowAddLessonModal(false);
        setNewLessonTitle('');
        loadTaxonomy();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const currentUnits = units.filter(u =>
    (!selectedSubjectId || u.subjectId === selectedSubjectId) &&
    (!selectedGradeId || u.gradeId === selectedGradeId)
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>التصنيف التربوي ومصفوفة أهداف رؤية عُمان 2040</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            مواءمة المناهج والمراجع وخطط التدريس مع مستهدفات وأولويات التعليم في رؤية عُمان 2040
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser.role !== 'viewer' && activeTab === 'curriculum' && (
            <button
              onClick={() => setShowAddSubjectModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مادة جديدة</span>
            </button>
          )}
          {activeTab === 'vision2040' && (
            <button
              onClick={() => setActiveView('lesson_studio')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              <span>تحضير درس مرتبط بالرؤية</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher: Index vs Vision 2040 vs Curriculum Hierarchy */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('index')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-black transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'index'
              ? 'bg-amber-400 text-teal-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4 text-teal-900 fill-teal-900" />
          <span>🌳 الهيكل الشجري وفهرس الكتب والتحضير الفوري ⚡</span>
        </button>

        <button
          onClick={() => setActiveTab('vision2040')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-black transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'vision2040'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>🇴🇲 مصفوفة أهداف رؤية عُمان 2040</span>
        </button>

        <button
          onClick={() => setActiveTab('curriculum')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-black transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'curriculum'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>هيكلية وتصنيف المناهج</span>
        </button>
      </div>

      {/* 1. Textbook Curriculum Index & Instant Preparation */}
      {activeTab === 'index' && (
        <TextbookCurriculumIndex />
      )}

      {/* Vision 2040 Education Matrix View */}
      {activeTab === 'vision2040' && (
        <div className="space-y-6">
          {/* Executive Hero Banner */}
          <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-800 to-emerald-950 text-white shadow-lg space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white font-bold text-xs backdrop-blur-xs">
                  <span>🇴🇲 سلطنة عُمان</span>
                  <span>•</span>
                  <span>وثيقة رؤية عُمان 2040</span>
                  <span>•</span>
                  <span>أولوية التعليم والتعلم وبناء القدرات الوطنية</span>
                </div>
                <h3 className="text-xl md:text-2xl font-black">
                  مصفوفة أولويات وأهداف رؤية عُمان 2040 في التعليم والتعلم
                </h3>
                <p className="text-xs text-emerald-100 leading-relaxed max-w-3xl">
                  ترتكز المنظومة على المواءمة الوطنية المباشرة لجميع خطط الدروس، المناهج المدرسية، والأطالس والمراجع الرقمية مع مستهدفات رؤية عُمان 2040، لتمكين المتعلمين من مهارات المستقبل واقتصاد المعرفة والاعتزاز بالهوية والاستدامة البيئية.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActiveView('lesson_studio')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-900 text-xs font-black hover:bg-emerald-50 transition shadow-sm cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4 text-emerald-700" />
                  <span>تحضير درس مرتبط بالرؤية</span>
                </button>
              </div>
            </div>

            {/* Quick KPI stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
                <span className="text-[11px] text-emerald-100 font-bold block">الأولويات المعتمدة</span>
                <span className="text-2xl font-black">{visionGoals.length || 7} أهداف</span>
                <span className="text-[10px] text-emerald-200 mt-0.5 block">تغطي 4 محاور وطنية</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
                <span className="text-[11px] text-emerald-100 font-bold block">مواءمة خطط الدروس</span>
                <span className="text-2xl font-black">{visionStats?.lessonAlignmentRate || 100}%</span>
                <span className="text-[10px] text-emerald-200 mt-0.5 block">{visionStats?.alignedLessons || 0} خطة درس موثقة</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
                <span className="text-[11px] text-emerald-100 font-bold block">مواءمة كتب المكتبة</span>
                <span className="text-2xl font-black">{visionStats?.resourceAlignmentRate || 100}%</span>
                <span className="text-[10px] text-emerald-200 mt-0.5 block">{visionStats?.alignedResources || 0} مرجع ومنهج مفهرس</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
                <span className="text-[11px] text-emerald-100 font-bold block">المحور الاستراتيجي</span>
                <span className="text-base font-black truncate block">الإنسان والمجتمع</span>
                <span className="text-[10px] text-emerald-200 mt-0.5 block">واقتصاد المعرفة المستدام</span>
              </div>
            </div>
          </div>

          {/* Goals Matrix Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>أهداف ومستهدفات الرؤية الوطنية في البيئة الصفية والمكتبية:</span>
              </h4>
              <span className="text-xs text-slate-500">
                انقر على أي أولوية للاطلاع على الكفايات المستهدفة وتطبيقاتها الصفية
              </span>
            </div>

            <div className="space-y-3">
              {visionGoals.map(goal => {
                const isExpanded = expandedGoalCode === goal.code;
                const stat = visionStats?.goalStats?.find((s: any) => s.code === goal.code);

                return (
                  <div
                    key={goal.code}
                    className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs transition"
                  >
                    <div
                      onClick={() => setExpandedGoalCode(isExpanded ? null : goal.code)}
                      className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-mono font-black text-xs shrink-0 border border-emerald-200 dark:border-emerald-800">
                          {goal.code.replace('V2040-', '')}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                              المحور: {goal.pillar}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-200 dark:border-emerald-800">
                              الأولوية: {goal.priority}
                            </span>
                          </div>
                          <h5 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                            {goal.title}
                          </h5>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {stat && (
                          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500">
                            <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold">
                              {stat.lessonCount} دروس
                            </span>
                            <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold">
                              {stat.resourceCount} مراجع
                            </span>
                          </div>
                        )}
                        <button
                          type="button"
                          className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800 space-y-4 text-xs bg-slate-50/40 dark:bg-slate-950/20">
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium pt-3">
                          {goal.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Competencies */}
                          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                            <span className="font-extrabold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>الكفايات ومهارات المستقبل المستهدفة:</span>
                            </span>
                            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                              {goal.targetCompetencies.map((comp, idx) => (
                                <li key={idx}>{comp}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Classroom applications */}
                          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                            <span className="font-extrabold text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                              <GraduationCap className="w-4 h-4 text-teal-600" />
                              <span>نماذج التطبيق والتوظيف الصفي:</span>
                            </span>
                            <ul className="list-disc list-inside space-y-1.5 text-slate-600 dark:text-slate-300 leading-relaxed">
                              {goal.classroomApplications.map((app, idx) => (
                                <li key={idx}>{app}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Quick actions for this goal */}
                        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setActiveView('lesson_studio')}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>إعداد درس يركز على هذه الأولوية</span>
                            </button>
                            <button
                              onClick={() => setActiveView('library')}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                              <span>استعراض مراجع هذا الهدف في المكتبة</span>
                            </button>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">الرمز المعتمد: {goal.code}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Taxonomy Hierarchy Explorer */}
      {activeTab === 'curriculum' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Subjects Column */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">المواد الدراسية المعتمدة</h3>
            <span className="text-[10px] text-slate-400 font-bold">{subjects.length} مواد</span>
          </div>

          <div className="space-y-2">
            {subjects.map(subj => {
              const isSelected = selectedSubjectId === subj.id;
              return (
                <div
                  key={subj.id}
                  onClick={() => setSelectedSubjectId(subj.id)}
                  className={`p-3 rounded-2xl cursor-pointer text-xs transition border flex items-center justify-between ${
                    isSelected
                      ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-950 dark:text-teal-100 font-bold shadow-xs'
                      : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: subj.color }} />
                    <span>{subj.name}</span>
                  </div>
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Grades Column */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">المراحل والصفوف الدراسية</h3>
            <span className="text-[10px] text-slate-400 font-bold">{grades.length} صفوف</span>
          </div>

          <div className="space-y-2">
            {grades.map(grd => {
              const isSelected = selectedGradeId === grd.id;
              return (
                <div
                  key={grd.id}
                  onClick={() => setSelectedGradeId(grd.id)}
                  className={`p-3 rounded-2xl cursor-pointer text-xs transition border flex items-center justify-between ${
                    isSelected
                      ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-950 dark:text-teal-100 font-bold shadow-xs'
                      : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-slate-400" />
                    <span>{grd.name}</span>
                  </div>
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Units & Lessons Tree */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">الوحدات والدروس المرتبطة</h3>
            {currentUser.role !== 'viewer' && (
              <button
                onClick={() => setShowAddUnitModal(true)}
                className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>إضافة وحدة</span>
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-[550px] overflow-y-auto">
            {currentUnits.length === 0 ? (
              <div className="text-center text-slate-400 py-8 text-xs">
                لا توجد وحدات دراسية مدخلة لهذا الاختيار. انقر على "إضافة وحدة" لإنشائها.
              </div>
            ) : (
              currentUnits.map(unit => {
                const unitLessons = lessons.filter(l => l.unitId === unit.id);
                return (
                  <div
                    key={unit.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2"
                  >
                    <h4 className="text-xs font-bold text-teal-800 dark:text-teal-300">
                      {unit.title}
                    </h4>

                    {/* Lessons list */}
                    <div className="space-y-1.5 mr-3 pt-1 border-r border-slate-200 dark:border-slate-700 pr-3">
                      {unitLessons.map(lsn => (
                        <div key={lsn.id} className="text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                          <span>{lsn.title}</span>
                        </div>
                      ))}
                      {currentUser.role !== 'viewer' && (
                        <button
                          onClick={() => {
                            const title = prompt('أدخل عنوان الدرس الجديد:');
                            if (title) handleAddLesson({ preventDefault: () => {} } as any, unit.id);
                          }}
                          className="text-[10px] text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 pt-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>إضافة درس في هذه الوحدة</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      )}

      {/* Add Subject Modal */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-right space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">إضافة مادة دراسية جديدة</h3>
              <button onClick={() => setShowAddSubjectModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubject} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">اسم المادة</label>
                <input
                  type="text"
                  required
                  value={newSubjName}
                  onChange={(e) => setNewSubjName(e.target.value)}
                  placeholder="مثال: الجيولوجيا وعلم البيئة"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">رمز المادة</label>
                <input
                  type="text"
                  value={newSubjCode}
                  onChange={(e) => setNewSubjCode(e.target.value)}
                  placeholder="GEOL"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowAddSubjectModal(false)} className="px-4 py-2 text-slate-500">
                  إلغاء
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition">
                  إضافة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Unit Modal */}
      {showAddUnitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-right space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">إضافة وحدة دراسية جديدة</h3>
              <button onClick={() => setShowAddUnitModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUnit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">عنوان الوحدة</label>
                <input
                  type="text"
                  required
                  value={newUnitTitle}
                  onChange={(e) => setNewUnitTitle(e.target.value)}
                  placeholder="الوحدة الخامسة: الموارد البيئية"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowAddUnitModal(false)} className="px-4 py-2 text-slate-500">
                  إلغاء
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition">
                  إضافة الوحدة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
