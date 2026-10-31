import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Folder, FolderOpen, BookOpen, ChevronRight, ChevronDown,
  Sparkles, Award, Zap, Eye, FileText, CheckCircle2,
  Search, X, Layers, Compass, School, Bookmark,
  BookMarked, HelpCircle, ArrowRight
} from 'lucide-react';
import {
  IndexedBookItem, IndexedUnitItem, IndexedLessonItem, OMANI_TEXTBOOKS_CATALOG
} from './TextbookCurriculumIndex.tsx';

interface CurriculumTreeViewProps {
  onSelectLessonForPreparation?: (book: IndexedBookItem, unit: IndexedUnitItem, lesson: IndexedLessonItem) => void;
  onOpenLessonReader?: (book: IndexedBookItem, unit: IndexedUnitItem, lesson: IndexedLessonItem) => void;
  isPreparingId?: string | null;
}

interface TreeStageGroup {
  id: string;
  name: string;
  iconName: string;
  badge: string;
  grades: {
    gradeId: string;
    gradeName: string;
    books: IndexedBookItem[];
  }[];
}

export const CurriculumTreeView: React.FC<CurriculumTreeViewProps> = ({
  onSelectLessonForPreparation,
  onOpenLessonReader,
  isPreparingId
}) => {
  const { setActiveView, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState('all');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('all');

  // Track expanded nodes
  // Keys can be: stage-{id}, grade-{id}, book-{id}, unit-{id}
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'stage-post_basic': true,
    'grade-grd-12': true,
    'book-book-om-grd12-watani-tb': true,
    'unit-u-grd12-1': true,
    'stage-cycle2': true,
    'grade-grd-5': true,
    'book-book-om-grd5-tb': true,
    'unit-u-grd5-1': true
  });

  // Track currently selected/focused lesson for quick sidebar preview
  const [activeLessonContext, setActiveLessonContext] = useState<{
    book: IndexedBookItem;
    unit: IndexedUnitItem;
    lesson: IndexedLessonItem;
  } | null>(() => {
    const defaultBook = OMANI_TEXTBOOKS_CATALOG.find(b => b.id === 'book-om-grd12-watani-tb') || OMANI_TEXTBOOKS_CATALOG[0];
    if (defaultBook && defaultBook.units.length > 0 && defaultBook.units[0].lessons.length > 0) {
      return {
        book: defaultBook,
        unit: defaultBook.units[0],
        lesson: defaultBook.units[0].lessons[0]
      };
    }
    return null;
  });

  const toggleNode = (nodeKey: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeKey]: !prev[nodeKey]
    }));
  };

  // Group catalog into hierarchical stages -> grades -> books -> units -> lessons
  const treeStages: TreeStageGroup[] = useMemo(() => {
    const stagesMap: Record<string, TreeStageGroup> = {
      'stage-cycle1': {
        id: 'stage-cycle1',
        name: 'التعليم الأساسي (الحلقة الأولى: الصفوف 1 - 4)',
        iconName: 'school',
        badge: 'الحلقة الأولى',
        grades: []
      },
      'stage-cycle2': {
        id: 'stage-cycle2',
        name: 'التعليم الأساسي (الحلقة الثانية: الصفوف 5 - 10)',
        iconName: 'layers',
        badge: 'الحلقة الثانية',
        grades: []
      },
      'stage-post_basic': {
        id: 'stage-post_basic',
        name: 'التعليم ما بعد الأساسي (الصفين 11 و 12)',
        iconName: 'award',
        badge: 'ما بعد الأساسي',
        grades: []
      },
      'stage-references': {
        id: 'stage-references',
        name: 'المراجع الجغرافية التخصصية وأطالس سلطنة عُمان',
        iconName: 'compass',
        badge: 'أطالس ومراجع',
        grades: []
      }
    };

    OMANI_TEXTBOOKS_CATALOG.forEach(book => {
      let stageKey = 'stage-cycle2';
      if (book.stageName.includes('الحلقة الأولى') || book.gradeId === 'grd-1' || book.gradeId === 'grd-2' || book.gradeId === 'grd-3' || book.gradeId === 'grd-4') {
        stageKey = 'stage-cycle1';
      } else if (book.stageName.includes('ما بعد الأساسي') || book.gradeId === 'grd-11' || book.gradeId === 'grd-12') {
        stageKey = 'stage-post_basic';
      } else if (book.type === 'atlas' || book.type === 'pedagogical_reference') {
        stageKey = 'stage-references';
      }

      const stage = stagesMap[stageKey];
      let grade = stage.grades.find(g => g.gradeId === book.gradeId);
      if (!grade) {
        grade = {
          gradeId: book.gradeId,
          gradeName: book.gradeName,
          books: []
        };
        stage.grades.push(grade);
      }
      grade.books.push(book);
    });

    return Object.values(stagesMap).filter(s => s.grades.length > 0);
  }, []);

  // Filtered Tree Structure
  const filteredTreeStages = useMemo(() => {
    return treeStages.map(stage => {
      if (selectedStageFilter !== 'all' && stage.id !== selectedStageFilter) {
        return null;
      }

      const matchingGrades = stage.grades.map(grade => {
        if (selectedGradeFilter !== 'all' && grade.gradeId !== selectedGradeFilter) {
          return null;
        }

        const matchingBooks = grade.books.filter(book => {
          if (!searchQuery.trim()) return true;
          const q = searchQuery.toLowerCase();
          const matchBook = book.title.toLowerCase().includes(q) || book.subjectName.toLowerCase().includes(q);
          const matchLesson = book.units.some(u =>
            u.title.toLowerCase().includes(q) ||
            u.lessons.some(l =>
              l.title.toLowerCase().includes(q) ||
              l.concepts.some(c => c.toLowerCase().includes(q)) ||
              l.vision2040Title.toLowerCase().includes(q)
            )
          );
          return matchBook || matchLesson;
        });

        if (matchingBooks.length === 0) return null;
        return {
          ...grade,
          books: matchingBooks
        };
      }).filter(Boolean) as TreeStageGroup['grades'];

      if (matchingGrades.length === 0) return null;
      return {
        ...stage,
        grades: matchingGrades
      };
    }).filter(Boolean) as TreeStageGroup[];
  }, [treeStages, selectedStageFilter, selectedGradeFilter, searchQuery]);

  // Expand all tree branches
  const expandAllTree = () => {
    const newExpanded: Record<string, boolean> = {};
    treeStages.forEach(stage => {
      newExpanded[stage.id] = true;
      stage.grades.forEach(grade => {
        newExpanded[`grade-${grade.gradeId}`] = true;
        grade.books.forEach(book => {
          newExpanded[`book-${book.id}`] = true;
          book.units.forEach(unit => {
            newExpanded[`unit-${unit.id}`] = true;
          });
        });
      });
    });
    setExpandedNodes(newExpanded);
  };

  // Collapse all tree branches
  const collapseAllTree = () => {
    setExpandedNodes({});
  };

  // Calculate statistics
  const totalLessonsInTree = useMemo(() => {
    let count = 0;
    filteredTreeStages.forEach(s => {
      s.grades.forEach(g => {
        g.books.forEach(b => {
          b.units.forEach(u => {
            count += u.lessons.length;
          });
        });
      });
    });
    return count;
  }, [filteredTreeStages]);

  return (
    <div className="space-y-5 text-right">
      {/* Tree Controls Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Field */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث في الهيكل الشجري (الدرس، الوحدة، الكتاب، المفاهيم، رؤية 2040)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-teal-500 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Stage Filter */}
          <div className="w-full md:w-56">
            <select
              value={selectedStageFilter}
              onChange={(e) => setSelectedStageFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 font-bold focus:ring-1 focus:ring-teal-500"
            >
              <option value="all">جميع المراحل التعليمية</option>
              <option value="stage-cycle1">الحلقة الأولى (1 - 4)</option>
              <option value="stage-cycle2">الحلقة الثانية (5 - 10)</option>
              <option value="stage-post_basic">ما بعد الأساسي (11 - 12)</option>
              <option value="stage-references">المراجع والأطالس التخصصية</option>
            </select>
          </div>

          {/* Grade Filter */}
          <div className="w-full md:w-52">
            <select
              value={selectedGradeFilter}
              onChange={(e) => setSelectedGradeFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 font-bold focus:ring-1 focus:ring-teal-500"
            >
              <option value="all">جميع الصفوف الدراسية</option>
              <option value="grd-1">الصف الأول</option>
              <option value="grd-5">الصف الخامس</option>
              <option value="grd-6">الصف السادس</option>
              <option value="grd-7">الصف السابع</option>
              <option value="grd-8">الصف الثامن</option>
              <option value="grd-9">الصف التاسع</option>
              <option value="grd-10">الصف العاشر</option>
              <option value="grd-11">الصف الحادي عشر</option>
              <option value="grd-12">الصف الثاني عشر</option>
            </select>
          </div>

          {/* Expand/Collapse All Buttons */}
          <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
            <button
              onClick={expandAllTree}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
              title="توسيع كل الفروع في الهيكل الشجري"
            >
              توسيع الشجرة (+)
            </button>
            <button
              onClick={collapseAllTree}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
              title="طي كامل الهيكل الشجري"
            >
              طي الشجرة (-)
            </button>
          </div>
        </div>

        {/* Tree Overview Sub-bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span>الهيكل الشجري: <strong>{totalLessonsInTree} درساً</strong> معتمداً</span>
            <span>•</span>
            <span className="text-teal-700 dark:text-teal-400 font-bold">
              انقر على أي درس لعرض خيارات التحضير الفوري وقراءة النص المنهجي ⚡
            </span>
          </div>

          {activeLessonContext && (
            <span className="text-slate-400 font-mono text-[10px]">
              الدرس المحدد: <strong>{activeLessonContext.lesson.title}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Tree View Column + Inspector Preview Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left/Main Column: Hierarchical Tree Structure (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          {filteredTreeStages.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
              <Compass className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                لا توجد نتائج تطابق بحثك في الهيكل الشجري
              </h4>
              <p className="text-[11px] text-slate-500">
                يرجى تجربة كلمات بحث أخرى أو إلغاء تصفية المراحل والصفوف.
              </p>
            </div>
          ) : (
            filteredTreeStages.map((stage) => {
              const isStageExpanded = expandedNodes[stage.id] ?? true;
              const stageLessonsCount = stage.grades.reduce(
                (sum, g) => sum + g.books.reduce(
                  (bSum, b) => bSum + b.units.reduce((uSum, u) => uSum + u.lessons.length, 0),
                  0
                ),
                0
              );

              return (
                <div
                  key={stage.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden"
                >
                  {/* LEVEL 1: STAGE NODE HEADER */}
                  <div
                    onClick={() => toggleNode(stage.id)}
                    className="p-3.5 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition cursor-pointer flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-2.5">
                      <button className="p-1 rounded-md text-slate-400 hover:text-slate-600">
                        {isStageExpanded ? <ChevronDown className="w-4 h-4 text-teal-600" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <div className="w-7 h-7 rounded-xl bg-teal-700 text-white flex items-center justify-center text-xs font-black shadow-2xs">
                        <School className="w-4 h-4 text-amber-300" />
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                          {stage.name}
                        </h3>
                        <span className="text-[10px] text-slate-500">
                          {stage.grades.length} صفوف • {stageLessonsCount} دروس
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[10px] font-black">
                        {stage.badge}
                      </span>
                    </div>
                  </div>

                  {/* LEVEL 1 CHILDREN: GRADES */}
                  {isStageExpanded && (
                    <div className="p-2 sm:p-3 space-y-2 border-r-2 border-teal-600/30 mr-3.5 my-1">
                      {stage.grades.map((grade) => {
                        const gradeNodeKey = `grade-${grade.gradeId}`;
                        const isGradeExpanded = expandedNodes[gradeNodeKey] ?? true;
                        const gradeLessonsCount = grade.books.reduce(
                          (sum, b) => sum + b.units.reduce((uSum, u) => uSum + u.lessons.length, 0),
                          0
                        );

                        return (
                          <div
                            key={grade.gradeId}
                            className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-800/30 overflow-hidden"
                          >
                            {/* LEVEL 2: GRADE NODE HEADER */}
                            <div
                              onClick={() => toggleNode(gradeNodeKey)}
                              className="p-2.5 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 transition cursor-pointer flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2">
                                <button className="p-0.5 text-slate-400">
                                  {isGradeExpanded ? <ChevronDown className="w-3.5 h-3.5 text-teal-600" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                </button>
                                <div className="w-6 h-6 rounded-lg bg-teal-600/10 text-teal-700 dark:text-teal-400 flex items-center justify-center text-xs font-black">
                                  <Layers className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                  {grade.gradeName}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                                  {grade.books.length} كتب • {gradeLessonsCount} دروس
                                </span>
                              </div>
                            </div>

                            {/* LEVEL 2 CHILDREN: BOOKS */}
                            {isGradeExpanded && (
                              <div className="p-2 space-y-2 border-r-2 border-teal-500/30 mr-3 my-1">
                                {grade.books.map((book) => {
                                  const bookNodeKey = `book-${book.id}`;
                                  const isBookExpanded = expandedNodes[bookNodeKey] ?? true;
                                  const bookLessonsCount = book.units.reduce((s, u) => s + u.lessons.length, 0);

                                  return (
                                    <div
                                      key={book.id}
                                      className="rounded-xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900/90 overflow-hidden shadow-2xs"
                                    >
                                      {/* LEVEL 3: BOOK NODE HEADER */}
                                      <div
                                        onClick={() => toggleNode(bookNodeKey)}
                                        className="p-3 bg-linear-to-r from-teal-50/50 to-emerald-50/30 dark:from-slate-800/50 dark:to-teal-950/20 hover:bg-slate-100/60 transition cursor-pointer flex items-center justify-between gap-3"
                                      >
                                        <div className="flex items-center gap-2.5">
                                          <button className="p-0.5 text-slate-400">
                                            {isBookExpanded ? <ChevronDown className="w-3.5 h-3.5 text-teal-600" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                          </button>
                                          <div className="w-7 h-7 rounded-lg bg-teal-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
                                            <BookOpen className="w-4 h-4 text-amber-300" />
                                          </div>
                                          <div>
                                            <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">
                                              {book.title}
                                            </h4>
                                            <p className="text-[10px] text-slate-500 line-clamp-1">
                                              {book.subjectName} • {book.semesterName} • {book.pageCount} صفحة
                                            </p>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                          <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-[10px] font-black border border-amber-200/60">
                                            {book.units.length} وحدات
                                          </span>
                                        </div>
                                      </div>

                                      {/* LEVEL 3 CHILDREN: UNITS */}
                                      {isBookExpanded && (
                                        <div className="p-2 space-y-2 border-r-2 border-emerald-500/30 mr-3 my-1">
                                          {book.units.map((unit) => {
                                            const unitNodeKey = `unit-${unit.id}`;
                                            const isUnitExpanded = expandedNodes[unitNodeKey] ?? true;

                                            return (
                                              <div
                                                key={unit.id}
                                                className="rounded-lg border border-slate-200/70 dark:border-slate-800/70 bg-slate-50/30 dark:bg-slate-800/20 overflow-hidden"
                                              >
                                                {/* LEVEL 4: UNIT NODE HEADER */}
                                                <div
                                                  onClick={() => toggleNode(unitNodeKey)}
                                                  className="p-2.5 bg-slate-100/60 dark:bg-slate-800/40 hover:bg-slate-200/50 transition cursor-pointer flex items-center justify-between gap-2"
                                                >
                                                  <div className="flex items-center gap-2">
                                                    <button className="p-0.5 text-slate-400">
                                                      {isUnitExpanded ? <ChevronDown className="w-3 h-3 text-teal-600" /> : <ChevronRight className="w-3 h-3" />}
                                                    </button>
                                                    <span className="w-5 h-5 rounded-md bg-teal-700 text-white flex items-center justify-center text-[10px] font-black">
                                                      {unit.order}
                                                    </span>
                                                    <div>
                                                      <h5 className="text-[11px] font-black text-slate-900 dark:text-white">
                                                        {unit.title}
                                                      </h5>
                                                    </div>
                                                  </div>

                                                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] font-bold border border-slate-200 dark:border-slate-700">
                                                    {unit.lessons.length} دروس
                                                  </span>
                                                </div>

                                                {/* LEVEL 4 CHILDREN: LESSONS (TREE LEAVES) */}
                                                {isUnitExpanded && (
                                                  <div className="p-2 space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800/60 border-r-2 border-amber-400/40 mr-2.5 my-1">
                                                    {unit.lessons.map((lesson) => {
                                                      const isPreparingThis = isPreparingId === lesson.id;
                                                      const isSelected = activeLessonContext?.lesson.id === lesson.id;

                                                      return (
                                                        <div
                                                          key={lesson.id}
                                                          onClick={() => setActiveLessonContext({ book, unit, lesson })}
                                                          className={`pt-1.5 first:pt-0 p-2 rounded-xl transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                                                            isSelected
                                                              ? 'bg-teal-50 dark:bg-teal-950/40 border border-teal-300 dark:border-teal-700'
                                                              : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/60 border border-transparent'
                                                          }`}
                                                        >
                                                          {/* Lesson Info */}
                                                          <div className="space-y-1 max-w-md">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                              <span className="font-mono text-[10px] font-bold text-teal-700 dark:text-teal-400 bg-teal-100/70 dark:bg-teal-950 px-1.5 py-0.5 rounded-md border border-teal-200 dark:border-teal-800">
                                                                ص {lesson.pageNumber}
                                                              </span>
                                                              <span className="text-xs font-black text-slate-900 dark:text-white">
                                                                {lesson.title}
                                                              </span>
                                                              <span className="px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[9px] font-bold">
                                                                {lesson.vision2040Code}
                                                              </span>
                                                            </div>

                                                            <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-slate-500">
                                                              <span className="font-bold text-slate-400">المفاهيم:</span>
                                                              {lesson.concepts.slice(0, 3).map((c, i) => (
                                                                <span key={i} className="bg-white dark:bg-slate-800 px-1.5 py-0.2 rounded border border-slate-200 dark:border-slate-700">
                                                                  {c}
                                                                </span>
                                                              ))}
                                                              {lesson.concepts.length > 3 && (
                                                                <span>+{lesson.concepts.length - 3}</span>
                                                              )}
                                                            </div>
                                                          </div>

                                                          {/* Action Buttons for this Tree Lesson Node */}
                                                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                                            {/* Read Textbook Content */}
                                                            <button
                                                              onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (onOpenLessonReader) {
                                                                  onOpenLessonReader(book, unit, lesson);
                                                                }
                                                              }}
                                                              className="px-2.5 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                                                              title="قراءة نص الدرس كاملاً كما ورد في كتاب الوزارة"
                                                            >
                                                              <Eye className="w-3.5 h-3.5 text-teal-600" />
                                                              <span>نص الدرس 📖</span>
                                                            </button>

                                                            {/* Instant Prepare Lesson */}
                                                            <button
                                                              onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (onSelectLessonForPreparation) {
                                                                  onSelectLessonForPreparation(book, unit, lesson);
                                                                }
                                                              }}
                                                              disabled={isPreparingThis}
                                                              className="px-3 py-1.5 rounded-lg bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-[11px] font-black transition shadow-2xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                                              title="تحضير خطة هذا الدرس فوراً بالبنائية ودورة 5Es"
                                                            >
                                                              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                                                              <span>{isPreparingThis ? 'جاري التحضير...' : 'تحضير فوري ⚡'}</span>
                                                            </button>
                                                          </div>
                                                        </div>
                                                      );
                                                    })}
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Quick Inspector Preview Card (4 cols) */}
        <div className="lg:col-span-4">
          <div className="sticky top-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-teal-600" />
                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                  معاينة الدرس المحدد من الشجرة
                </h4>
              </div>
              <span className="text-[10px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-md">
                فحص فوري 🔍
              </span>
            </div>

            {activeLessonContext ? (
              <div className="space-y-4 text-xs">
                {/* Lesson Title & Book info */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] text-teal-700 dark:text-teal-400 font-bold block">
                    {activeLessonContext.book.title} • {activeLessonContext.book.gradeName}
                  </span>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                    {activeLessonContext.lesson.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-1">
                    <span className="font-mono font-bold bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      ص {activeLessonContext.lesson.pageNumber}
                    </span>
                    <span>{activeLessonContext.unit.title}</span>
                  </div>
                </div>

                {/* Cognitive & Skill Objectives */}
                <div className="space-y-1.5">
                  <h5 className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    مخرجات التعلم الأساسية:
                  </h5>
                  <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400 list-disc pr-4">
                    {activeLessonContext.lesson.objectives.cognitive.slice(0, 2).map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                    {activeLessonContext.lesson.objectives.affective.slice(0, 1).map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>

                {/* Think Pair Share Prompt */}
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1">
                  <span className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 block">
                    نشاط (فكر - زاوج - شارك):
                  </span>
                  <p className="text-[11px] text-emerald-950 dark:text-emerald-100 font-medium">
                    "{activeLessonContext.lesson.thinkPairShareScenario.prompt}"
                  </p>
                </div>

                {/* Vision 2040 Link */}
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-1">
                  <span className="text-[10px] font-black text-amber-800 dark:text-amber-300 block">
                    {activeLessonContext.lesson.vision2040Code} • رؤية عُمان 2040:
                  </span>
                  <p className="text-[11px] text-amber-950 dark:text-amber-100">
                    {activeLessonContext.lesson.vision2040Title}
                  </p>
                </div>

                {/* Big Action Buttons */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      if (onSelectLessonForPreparation) {
                        onSelectLessonForPreparation(
                          activeLessonContext.book,
                          activeLessonContext.unit,
                          activeLessonContext.lesson
                        );
                      }
                    }}
                    disabled={isPreparingId === activeLessonContext.lesson.id}
                    className="w-full py-3 rounded-xl bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span>
                      {isPreparingId === activeLessonContext.lesson.id ? 'جاري التحضير...' : 'تحضير هذا الدرس فوراً ⚡'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      if (onOpenLessonReader) {
                        onOpenLessonReader(
                          activeLessonContext.book,
                          activeLessonContext.unit,
                          activeLessonContext.lesson
                        );
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-teal-600" />
                    <span>قراءة نص الدرس كاملاً من الكتاب 📖</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        showToast(`الانتقال للمكتبة الرقمية لمطالعة: ${activeLessonContext.book.title}`, 'info');
                        setActiveView('library');
                      }}
                      className="py-2 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                      <span>المكتبة 📚</span>
                    </button>

                    <button
                      onClick={() => {
                        showToast(`توليد ورقة عمل لدرس: ${activeLessonContext.lesson.title}`, 'info');
                        setActiveView('worksheets');
                      }}
                      className="py-2 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>ورقة عمل 📝</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                انقر على أي درس في الشجرة لمعاينته وتحضيره
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
