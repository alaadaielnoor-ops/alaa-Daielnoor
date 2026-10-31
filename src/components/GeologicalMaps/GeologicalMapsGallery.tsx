import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { useSchoolProfile } from '../../hooks/useSchoolProfile.ts';
import { exportUnifiedPdf } from '../../utils/pdfExport.ts';
import { playGeologySound } from '../Geology3D/audioSynthesizer.ts';
import {
  GEOLOGICAL_MAP_THEMES,
  ROCK_DISTRIBUTION_DATA,
  GEOGRAPHIC_REGIONS,
  GEOLOGICAL_POLYGONS,
  MINERAL_DEPOSITS,
  OMAN_STRATIGRAPHIC_COLUMN
} from './geologicalData.ts';
import {
  RockDistributionItem,
  GeographicRegion,
  GeologicalMapThemeId,
  RockTypeCategory,
  GeologicalEpoch,
  MineralDepositMarker
} from './types.ts';
import {
  Map, ZoomIn, ZoomOut, RotateCcw, Compass, Search, Filter,
  Layers, Download, Printer, Box, CheckCircle2,
  HelpCircle, Eye, EyeOff, Sparkles, X, ChevronLeft, ChevronRight,
  Maximize2, Crosshair, Award, FileText, Check, Info, MapPin, Pickaxe
} from 'lucide-react';

export const GeologicalMapsGallery: React.FC = () => {
  const { setActiveView, showToast } = useApp();
  const { schoolProfile } = useSchoolProfile();

  // Active Map Theme
  const [activeThemeId, setActiveThemeId] = useState<GeologicalMapThemeId>('comprehensive');

  // Selected Region for Deep Zoom
  const [selectedRegionId, setSelectedRegionId] = useState<string>('oman_all');

  // Selected Rock for inspection
  const [selectedRockId, setSelectedRockId] = useState<string | null>('ophiolite');

  // Selected Landmark / Mineral marker
  const [selectedMarker, setSelectedMarker] = useState<MineralDepositMarker | null>(null);

  // Filters
  const [rockCategoryFilter, setRockCategoryFilter] = useState<RockTypeCategory>('all');
  const [epochFilter, setEpochFilter] = useState<GeologicalEpoch>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Map Canvas Pan & Zoom State
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Quiz / Blind Map Mode
  const [isQuizMode, setIsQuizMode] = useState<boolean>(false);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const [quizFeedback, setQuizFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null);

  // Modals & Panels
  const [showStratigraphicModal, setShowStratigraphicModal] = useState<boolean>(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState<boolean>(true);
  const [showMineralsLayer, setShowMineralsLayer] = useState<boolean>(true);
  const [showLandmarksLayer, setShowLandmarksLayer] = useState<boolean>(true);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  // Sound toggle
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const mapSvgContainerRef = useRef<HTMLDivElement>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const activeTheme = useMemo(() => {
    return GEOLOGICAL_MAP_THEMES.find(t => t.id === activeThemeId) || GEOLOGICAL_MAP_THEMES[0];
  }, [activeThemeId]);

  const selectedRegion = useMemo(() => {
    return GEOGRAPHIC_REGIONS.find(r => r.id === selectedRegionId) || GEOGRAPHIC_REGIONS[0];
  }, [selectedRegionId]);

  const selectedRock = useMemo(() => {
    if (!selectedRockId) return null;
    return ROCK_DISTRIBUTION_DATA[selectedRockId] || null;
  }, [selectedRockId]);

  // Filtered rocks list
  const filteredRocks = useMemo(() => {
    return Object.values(ROCK_DISTRIBUTION_DATA).filter(rock => {
      if (rockCategoryFilter !== 'all' && rock.category !== rockCategoryFilter) return false;
      if (epochFilter !== 'all' && rock.geologicalEpoch !== epochFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = rock.nameAr.toLowerCase().includes(q) || rock.nameEn.toLowerCase().includes(q);
        const matchSites = rock.famousSites.some(s => s.toLowerCase().includes(q));
        const matchGov = rock.mainGovernorates.some(g => g.toLowerCase().includes(q));
        const matchForms = rock.mainFormations.some(f => f.toLowerCase().includes(q));
        if (!matchName && !matchSites && !matchGov && !matchForms) return false;
      }
      return true;
    });
  }, [rockCategoryFilter, epochFilter, searchQuery]);

  // Quiz Questions Pool
  const QUIZ_QUESTIONS = useMemo(() => [
    {
      prompt: 'انقر على المنطقة التي ينتشر فيها "أفيوليت سمائل" (صخور القشرة المحيطية الغنية بالنحاس والكروم):',
      expectedRockId: 'ophiolite',
      hint: 'يمتد كشريط جبلي داكن على طول جبال الحجر من وادي الجزي شمالاً وحتى سمائل والحجر الشرقي.'
    },
    {
      prompt: 'حدد موقع "الحجر الجيري والدولوميت" الضخم الذي يشكل قمة جبل شمس والجبل الأخضر:',
      expectedRockId: 'limestone',
      hint: 'ترسبات بحر التيثس الدافئ القديم التي تشكل النوافذ التكتونية العالية وأعظم الكهوف.'
    },
    {
      prompt: 'أين تقع أقدم صخور نارية متبلورة (الجرانيت والنيس) التي تعود لما قبل الكامبري في عمان؟',
      expectedRockId: 'granite',
      hint: 'تتواجد على ساحل بحر العرب في محافظة ظفار قرب مرباط، وعمرها أكثر من 800 مليون سنة.'
    },
    {
      prompt: 'انقر على "رمال الشرقية (وهيبة)" التي تتألف من كثبان الحجر الرملي الكوارتزية الشاهقة:',
      expectedRockId: 'sandstone',
      hint: 'بحر من الرمال الطولية الذهبية في جنوب وشمال الشرقية.'
    },
    {
      prompt: 'أين تتمركز القباب الملحية التكتونية (سلسلة أرا) المسببة لاحتجاز أضخم حقول النفط في عمان؟',
      expectedRockId: 'evaporite',
      hint: 'في منطقة قرن علم والوسطى، حيث يطفو الملح الصخري الخفيف للأعلى مكوناً مصائد نفطية.'
    }
  ], []);

  const currentQuiz = QUIZ_QUESTIONS[quizQuestionIndex % QUIZ_QUESTIONS.length];

  // Play audio safely
  const triggerAudio = (soundType: 'chime' | 'rock_tap' | 'explode_swoosh' | 'beacon_ping' | 'mode_switch') => {
    if (soundEnabled) {
      playGeologySound(soundType);
    }
  };

  // Switch region with smooth camera animation / transform
  const handleSelectRegion = (regionId: string) => {
    setSelectedRegionId(regionId);
    const reg = GEOGRAPHIC_REGIONS.find(r => r.id === regionId);
    if (!reg) return;

    triggerAudio('mode_switch');

    if (regionId === 'oman_all') {
      setZoomScale(1.0);
      setPanOffset({ x: 0, y: 0 });
    } else {
      // Calculate pan offset to center the region in the SVG
      const scale = reg.zoomLevel;
      const targetCenterX = reg.center.x;
      const targetCenterY = reg.center.y;
      
      // Compute pixel offsets relative to 1000x1200 base frame
      const offsetX = (500 - targetCenterX) * scale;
      const offsetY = (600 - targetCenterY) * scale;

      setZoomScale(scale);
      setPanOffset({ x: offsetX, y: offsetY });
    }
  };

  // Zoom handlers
  const handleZoomIn = () => {
    setZoomScale(prev => Math.min(prev * 1.3, 5.0));
    triggerAudio('beacon_ping');
  };

  const handleZoomOut = () => {
    setZoomScale(prev => {
      const next = Math.max(prev / 1.3, 0.9);
      if (next <= 1.0) setPanOffset({ x: 0, y: 0 });
      return next;
    });
    triggerAudio('beacon_ping');
  };

  const handleResetZoom = () => {
    setSelectedRegionId('oman_all');
    setZoomScale(1.0);
    setPanOffset({ x: 0, y: 0 });
    triggerAudio('rock_tap');
  };

  // Pan interaction handlers (Drag to pan)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale <= 1.0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomScale(prev => Math.min(prev * 1.15, 5.0));
    } else {
      setZoomScale(prev => Math.max(prev / 1.15, 0.9));
    }
  };

  // Polygon click handler (Quiz answer or inspection)
  const handlePolygonClick = (polygonRockId: string, zoneName: string) => {
    triggerAudio('rock_tap');

    if (isQuizMode) {
      const isCorrect = polygonRockId === currentQuiz.expectedRockId;
      setQuizFeedback({
        isCorrect,
        message: isCorrect
          ? `إجابة نموذجية ممتازة! هذه بالفعل منطقة (${zoneName}) التابعة لصخور (${ROCK_DISTRIBUTION_DATA[polygonRockId]?.nameAr}).`
          : `إجابة غير صحيحة. أنت نقرت على (${zoneName})، بينما المطلوب هو (${ROCK_DISTRIBUTION_DATA[currentQuiz.expectedRockId]?.nameAr}). تلميح: ${currentQuiz.hint}`
      });

      if (isCorrect) {
        triggerAudio('chime');
        setQuizScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
      } else {
        setQuizScore(prev => ({ ...prev, total: prev.total + 1 }));
      }
      return;
    }

    setSelectedRockId(polygonRockId);
    setIsDetailDrawerOpen(true);
    setSelectedMarker(null);
  };

  // Next quiz question
  const handleNextQuizQuestion = () => {
    setQuizQuestionIndex(prev => prev + 1);
    setQuizFeedback(null);
    triggerAudio('mode_switch');
  };

  // PDF Export
  const handleExportPdf = async () => {
    if (!printAreaRef.current) return;
    setIsExportingPdf(true);
    triggerAudio('explode_swoosh');

    try {
      const result = await exportUnifiedPdf(printAreaRef.current, {
        filename: `خريطة_جيولوجيا_عمان_${selectedRegion.nameAr.replace(/\s+/g, '_')}.pdf`,
        orientation: 'landscape',
        title: `الخريطة الجيولوجية لسلطنة عُمان - ${selectedRegion.nameAr}`,
        watermark: schoolProfile.schoolName || 'سلطنة عُمان - وزارة التربية والتعليم'
      });

      if (result.success) {
        showToast('تم تصدير الخريطة والبطاقة الجيولوجية إلى PDF بنجاح!', 'success');
      } else {
        showToast('تعذر تصدير ملف PDF، يرجى المحاولة مرة أخرى.', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'خطأ في التصدير', 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Jump to 3D Geological Lab with the selected specimen
  const handleOpenIn3DStudio = (specimenId?: string) => {
    triggerAudio('explode_swoosh');
    setActiveView('geological_3d');
    showToast(`جاري فتح مجسم (${selectedRock?.nameAr || 'الصخر'}) في المختبر ثلاثي الأبعاد...`, 'info');
  };

  return (
    <div className="space-y-6 select-none font-sans" dir="rtl">
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shrink-0">
              <Map className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>معرض الخرائط الجيولوجية وتوزيع الصخور</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800">
                  سلطنة عُمان 🇴🇲
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                استعراض كارتوغرافي متقدم لتوزيع التكاوين الصخرية، مع ميزة التكبير التفصيلي (Deep Zoom)، وربط المنهاج العماني بالمعالم الطبيعية.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* Mode Switch: Study vs Classroom Quiz */}
          <button
            onClick={() => {
              setIsQuizMode(!isQuizMode);
              setQuizFeedback(null);
              triggerAudio('mode_switch');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
              isQuizMode
                ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-400/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-200" />
            <span>{isQuizMode ? 'وضع الاختبار الصفي (مفعل)' : 'تفعيل الاختبار الصفي والخريطة الصماء'}</span>
          </button>

          {/* Stratigraphic Column Modal Button */}
          <button
            onClick={() => {
              setShowStratigraphicModal(true);
              triggerAudio('rock_tap');
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <Layers className="w-4 h-4 text-teal-600" />
            <span>العمود الطباقي والعصور</span>
          </button>

          {/* Export PDF Button */}
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-sm transition cursor-pointer disabled:opacity-50"
          >
            {isExportingPdf ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <Download className="w-4 h-4 text-amber-200" />
            )}
            <span>تصدير الخريطة PDF</span>
          </button>
        </div>
      </div>

      {/* Curated Map Themes Selector Bar */}
      <div className="bg-slate-100/90 dark:bg-slate-900/90 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {GEOLOGICAL_MAP_THEMES.map(theme => (
          <button
            key={theme.id}
            onClick={() => {
              setActiveThemeId(theme.id);
              triggerAudio('mode_switch');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer shrink-0 ${
              activeThemeId === theme.id
                ? 'bg-teal-600 text-white shadow-md shadow-teal-700/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Map className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>{theme.titleAr}</span>
            <span className="text-[10px] opacity-75 hidden sm:inline">({theme.scaleRatio})</span>
          </button>
        ))}
      </div>

      {/* Regional Quick-Zoom Carousel Bar */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <Crosshair className="w-4 h-4 text-teal-600" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            محدد التكبير الجغرافي السريع (Quick Regional Zoom):
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          {GEOGRAPHIC_REGIONS.map(region => (
            <button
              key={region.id}
              onClick={() => handleSelectRegion(region.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                selectedRegionId === region.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Compass className="w-3 h-3 text-teal-300" />
              <span>{region.nameAr}</span>
              {region.zoomLevel > 1.0 && (
                <span className="text-[10px] opacity-80 bg-black/20 px-1.5 rounded-md">
                  {region.zoomLevel}x
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Quiz Notification Banner (if Quiz Mode Active) */}
      {isQuizMode && (
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-600/10 to-amber-700/15 border-2 border-amber-500/30 p-4 rounded-2xl text-slate-900 dark:text-white space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <h3 className="text-sm font-black text-amber-700 dark:text-amber-400">
                السؤال {quizQuestionIndex + 1}:
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span>النقاط: {quizScore.correct} / {quizScore.total}</span>
              <button
                onClick={handleNextQuizQuestion}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                السؤال التالي ←
              </button>
            </div>
          </div>
          <p className="text-sm font-bold leading-relaxed">{currentQuiz.prompt}</p>

          {quizFeedback && (
            <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 mt-2 ${
              quizFeedback.isCorrect
                ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-200 border border-emerald-300'
                : 'bg-rose-100 text-rose-900 dark:bg-rose-950/80 dark:text-rose-200 border border-rose-300'
            }`}>
              <span>{quizFeedback.isCorrect ? '✅' : '❌'}</span>
              <span>{quizFeedback.message}</span>
            </div>
          )}
        </div>
      )}

      {/* Main Grid: Interactive Map Workspace + Rock Explorer & Inspection Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Vector Map Canvas (7 cols on lg, full on mobile) */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          <div
            ref={printAreaRef}
            className="relative bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-xl min-h-[580px] flex flex-col"
          >
            {/* Map Top Floating Overlay: Active Scale & Region Badge */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-auto">
              <div className="bg-slate-900/90 text-white backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-bold flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                <span>{selectedRegion.nameAr}</span>
                <span className="text-[10px] text-teal-300">({Math.round(zoomScale * 100)}%)</span>
              </div>

              {/* Layer Toggles */}
              <button
                onClick={() => setShowMineralsLayer(!showMineralsLayer)}
                title="إظهار/إخفاء مكامن المعادن"
                className={`p-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  showMineralsLayer
                    ? 'bg-teal-600 text-white border-teal-500'
                    : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                <Pickaxe className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowLandmarksLayer(!showLandmarksLayer)}
                title="إظهار/إخفاء المعالم البارزة والجبال"
                className={`p-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  showLandmarksLayer
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                <MapPin className="w-4 h-4" />
              </button>
            </div>

            {/* Map Floating Controls: Zoom In, Out, Reset */}
            <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700 shadow-2xl">
              <button
                onClick={handleZoomIn}
                title="تكبير (+)"
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-teal-600 text-white flex items-center justify-center transition cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                title="تصغير (-)"
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-teal-600 text-white flex items-center justify-center transition cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                title="إعادة ضبط العرض"
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-teal-600 text-white flex items-center justify-center transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Compass Rose Indicator (Top Left) */}
            <div className="absolute top-4 left-4 z-20 bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-700 flex items-center gap-2 text-slate-300 pointer-events-none">
              <Compass className="w-5 h-5 text-amber-400 animate-spin-slow" />
              <div className="text-[10px] leading-tight">
                <div className="font-black text-white">شمال (N)</div>
                <div className="text-slate-400">سلطنة عمان</div>
              </div>
            </div>

            {/* Interactive Vector SVG Canvas Container */}
            <div
              ref={mapSvgContainerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onWheel={handleWheel}
              className={`w-full flex-1 flex items-center justify-center overflow-hidden cursor-${
                zoomScale > 1.0 ? (isDragging ? 'grabbing' : 'grab') : 'default'
              }`}
            >
              <svg
                viewBox="0 0 1000 1200"
                className="w-full h-full max-h-[720px] transition-transform duration-300 ease-out"
                style={{
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
                  transformOrigin: '50% 50%'
                }}
              >
                {/* SVG Definitions: Gradients & Patterns */}
                <defs>
                  {/* Grid background pattern */}
                  <pattern id="carto-grid" width="100" height="100" patternUnits="userSpaceOnUse">
                    <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                  </pattern>

                  {/* Limestone brick hatch pattern */}
                  <pattern id="pattern-limestone" width="20" height="12" patternUnits="userSpaceOnUse">
                    <rect width="20" height="12" fill="#0284c7" fillOpacity="0.85" />
                    <line x1="0" y1="0" x2="20" y2="0" stroke="#bae6fd" strokeWidth="0.8" />
                    <line x1="0" y1="6" x2="20" y2="6" stroke="#bae6fd" strokeWidth="0.8" />
                    <line x1="10" y1="0" x2="10" y2="6" stroke="#bae6fd" strokeWidth="0.8" />
                    <line x1="0" y1="6" x2="0" y2="12" stroke="#bae6fd" strokeWidth="0.8" />
                    <line x1="20" y1="6" x2="20" y2="12" stroke="#bae6fd" strokeWidth="0.8" />
                  </pattern>

                  {/* Ophiolite crosshatch pattern */}
                  <pattern id="pattern-ophiolite" width="16" height="16" patternUnits="userSpaceOnUse">
                    <rect width="16" height="16" fill="#047857" fillOpacity="0.9" />
                    <line x1="0" y1="0" x2="16" y2="16" stroke="#6ee7b7" strokeWidth="0.75" />
                    <line x1="16" y1="0" x2="0" y2="16" stroke="#6ee7b7" strokeWidth="0.75" />
                  </pattern>

                  {/* Granite speckled dots pattern */}
                  <pattern id="pattern-granite" width="14" height="14" patternUnits="userSpaceOnUse">
                    <rect width="14" height="14" fill="#e11d48" fillOpacity="0.9" />
                    <circle cx="4" cy="4" r="1.5" fill="#fecdd3" />
                    <circle cx="11" cy="11" r="1.5" fill="#fecdd3" />
                    <circle cx="11" cy="4" r="1" fill="#4c0519" />
                  </pattern>

                  {/* Marble wavy veins pattern */}
                  <pattern id="pattern-marble" width="24" height="24" patternUnits="userSpaceOnUse">
                    <rect width="24" height="24" fill="#d97706" fillOpacity="0.85" />
                    <path d="M 0,12 Q 6,6 12,12 T 24,12" fill="none" stroke="#fef3c7" strokeWidth="1" />
                    <path d="M 0,20 Q 6,14 12,20 T 24,20" fill="none" stroke="#fde68a" strokeWidth="0.75" />
                  </pattern>

                  {/* Sandstone stippled pattern */}
                  <pattern id="pattern-sandstone" width="12" height="12" patternUnits="userSpaceOnUse">
                    <rect width="12" height="12" fill="#ca8a04" fillOpacity="0.85" />
                    <circle cx="3" cy="3" r="0.8" fill="#fef08a" />
                    <circle cx="9" cy="9" r="0.8" fill="#fef08a" />
                    <circle cx="9" cy="3" r="0.6" fill="#713f12" />
                  </pattern>

                  {/* Hawasina folded folds pattern */}
                  <pattern id="pattern-hawasina" width="18" height="18" patternUnits="userSpaceOnUse">
                    <rect width="18" height="18" fill="#8b5cf6" fillOpacity="0.85" />
                    <path d="M 0,9 Q 4.5,0 9,9 T 18,9" fill="none" stroke="#ede9fe" strokeWidth="1" />
                  </pattern>

                  {/* Alluvial gravel fans pattern */}
                  <pattern id="pattern-alluvial" width="16" height="16" patternUnits="userSpaceOnUse">
                    <rect width="16" height="16" fill="#10b981" fillOpacity="0.85" />
                    <circle cx="5" cy="5" r="1.8" fill="none" stroke="#a7f3d0" strokeWidth="0.75" />
                    <circle cx="12" cy="12" r="1.5" fill="none" stroke="#a7f3d0" strokeWidth="0.75" />
                  </pattern>

                  {/* Evaporite salt crystals pattern */}
                  <pattern id="pattern-evaporite" width="14" height="14" patternUnits="userSpaceOnUse">
                    <rect width="14" height="14" fill="#ec4899" fillOpacity="0.85" />
                    <rect x="2" y="2" width="4" height="4" fill="#fdf2f8" stroke="#be185d" strokeWidth="0.5" />
                    <rect x="8" y="8" width="4" height="4" fill="#fdf2f8" stroke="#be185d" strokeWidth="0.5" />
                  </pattern>

                  {/* Glow filter for highlighted rock polygons */}
                  <filter id="rock-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#38bdf8" floodOpacity="0.9" />
                  </filter>
                </defs>

                {/* Coordinate Grid Background */}
                <rect width="1000" height="1200" fill="#0b1120" />
                <rect width="1000" height="1200" fill="url(#carto-grid)" />

                {/* Ocean and Water Bodies with subtle wave shading */}
                {/* Arabian Gulf & Strait of Hormuz */}
                <path
                  d="M 400,0 L 520,0 L 490,90 L 505,140 L 450,180 L 400,180 Z"
                  fill="#0c4a6e"
                  opacity="0.3"
                />
                {/* Gulf of Oman */}
                <path
                  d="M 545,55 L 750,0 L 950,250 L 880,450 L 700,310 L 545,150 Z"
                  fill="#075985"
                  opacity="0.25"
                />
                {/* Arabian Sea */}
                <path
                  d="M 880,450 L 1000,550 L 1000,1200 L 200,1200 L 260,1065 L 450,1080 L 730,820 L 805,690 L 880,450 Z"
                  fill="#0369a1"
                  opacity="0.2"
                />

                {/* Ocean Names Text */}
                <text x="760" y="200" fill="#38bdf8" opacity="0.3" fontSize="24" fontWeight="bold" letterSpacing="4">
                  بحر عُـمـان
                </text>
                <text x="680" y="980" fill="#38bdf8" opacity="0.25" fontSize="26" fontWeight="bold" letterSpacing="4">
                  بـحـر الـعـرب
                </text>
                <text x="470" y="45" fill="#38bdf8" opacity="0.35" fontSize="16" fontWeight="bold">
                  مضيق هرمز
                </text>

                {/* Tropic of Cancer (مدار السرطان 23.5°N) Latitude Line */}
                <g opacity="0.6">
                  <line
                    x1="100"
                    y1="370"
                    x2="900"
                    y2="370"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeDasharray="6,4"
                  />
                  <text x="120" y="362" fill="#fbbf24" fontSize="13" fontWeight="bold">
                    مدار السرطان (23.5° N)
                  </text>
                </g>

                {/* Major Tectonic Fault Lines (e.g. Semail Fault Zone) */}
                <g opacity="0.7">
                  {/* Semail Fault Line */}
                  <path
                    d="M 660,285 Q 675,340 685,380 T 710,430"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    strokeDasharray="4,3"
                  />
                  <text x="690" y="350" fill="#f87171" fontSize="11" fontWeight="bold">
                    صدع سمائل التكتوني
                  </text>
                </g>

                {/* Geological Rock Polygons */}
                <g id="geological-strata-polygons">
                  {GEOLOGICAL_POLYGONS.map(polygon => {
                    const isSelected = selectedRockId === polygon.rockId;
                    const matchesCategory = rockCategoryFilter === 'all' || ROCK_DISTRIBUTION_DATA[polygon.rockId]?.category === rockCategoryFilter;
                    const matchesEpoch = epochFilter === 'all' || ROCK_DISTRIBUTION_DATA[polygon.rockId]?.geologicalEpoch === epochFilter;
                    const isHighlightedTheme = !activeTheme.highlightedRockIds || activeTheme.highlightedRockIds.includes(polygon.rockId);

                    const isActive = matchesCategory && matchesEpoch && isHighlightedTheme;
                    const patternFill = polygon.rockId ? `url(#pattern-${polygon.rockId})` : polygon.fillColor;

                    return (
                      <g
                        key={polygon.id}
                        className="transition-all duration-300 cursor-pointer"
                        onClick={() => handlePolygonClick(polygon.rockId, polygon.zoneName)}
                      >
                        <path
                          d={polygon.svgPath}
                          fill={patternFill}
                          fillOpacity={isActive ? (isSelected ? 1.0 : 0.88) : 0.15}
                          stroke={isSelected ? '#ffffff' : (isActive ? '#0f172a' : '#334155')}
                          strokeWidth={isSelected ? 3.5 : (isActive ? 1.5 : 0.5)}
                          strokeLinejoin="round"
                          filter={isSelected ? 'url(#rock-glow)' : undefined}
                          className="hover:brightness-125 transition-all"
                        />

                        {/* Polygon Label (visible when appropriate or hovered) */}
                        {!isQuizMode && (
                          <text
                            x={polygon.centerCoords.x}
                            y={polygon.centerCoords.y}
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize={isSelected ? "14" : "12"}
                            fontWeight="bold"
                            style={{
                              textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 5px rgba(0,0,0,0.8)',
                              pointerEvents: 'none'
                            }}
                            opacity={isActive ? (isSelected ? 1 : 0.9) : 0.2}
                          >
                            {polygon.label}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>

                {/* Mineral Deposit Markers (if layer enabled) */}
                {showMineralsLayer && (
                  <g id="mineral-markers-layer">
                    {MINERAL_DEPOSITS.map(marker => (
                      <g
                        key={marker.id}
                        transform={`translate(${marker.coords.x}, ${marker.coords.y})`}
                        onClick={() => {
                          setSelectedMarker(marker);
                          triggerAudio('beacon_ping');
                        }}
                        className="cursor-pointer group"
                      >
                        <circle r="7" fill="#fbbf24" stroke="#000000" strokeWidth="1.5" className="animate-ping opacity-40" />
                        <circle r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                        <text
                          x="8"
                          y="4"
                          fill="#fef08a"
                          fontSize="10"
                          fontWeight="bold"
                          style={{ textShadow: '0 1px 2px #000' }}
                          className="opacity-90 group-hover:opacity-100"
                        >
                          {marker.nameAr.replace('منجم ', '').replace('مكامن ', '')}
                        </text>
                      </g>
                    ))}
                  </g>
                )}

                {/* Prominent Geological Landmarks / Mountain Beacons (if layer enabled) */}
                {showLandmarksLayer && selectedRegion.famousLandmarks && (
                  <g id="landmarks-layer">
                    {selectedRegion.famousLandmarks.map((lm, idx) => (
                      <g
                        key={idx}
                        transform={`translate(${lm.coords.x}, ${lm.coords.y})`}
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedRockId(lm.rockType);
                          setIsDetailDrawerOpen(true);
                          triggerAudio('beacon_ping');
                        }}
                      >
                        <polygon
                          points="0,-12 9,4 -9,4"
                          fill="#38bdf8"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          filter="drop-shadow(0 2px 3px rgba(0,0,0,0.6))"
                        />
                        <text
                          x="0"
                          y="-16"
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="11"
                          fontWeight="black"
                          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                        >
                          ▲ {lm.nameAr}
                        </text>
                      </g>
                    ))}
                  </g>
                )}

                {/* Map Scale Bar (Bottom Left) */}
                <g transform="translate(60, 1140)" fill="#ffffff" opacity="0.8">
                  <rect x="0" y="0" width="120" height="4" fill="#ffffff" />
                  <rect x="0" y="0" width="40" height="4" fill="#0284c7" />
                  <rect x="80" y="0" width="40" height="4" fill="#0284c7" />
                  <text x="0" y="-6" fontSize="10" fontWeight="bold">0</text>
                  <text x="55" y="-6" fontSize="10" fontWeight="bold">50 كم</text>
                  <text x="110" y="-6" fontSize="10" fontWeight="bold">100 كم</text>
                  <text x="0" y="16" fontSize="10" fill="#94a3b8">مقياس الرسم {activeTheme.scaleRatio}</text>
                </g>
              </svg>
            </div>

            {/* Bottom Map Legend Footer */}
            <div className="bg-slate-900/95 border-t border-slate-800 p-3 flex items-center justify-between gap-3 text-xs text-slate-300 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="font-bold text-teal-400">دليل الخريطة:</span>
                <span className="text-slate-400">انقر على أي شريحة صخرية بالخريطة لعرض خصائصها وتكبيرها.</span>
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#047857] border border-white/40"></span>
                  <span>أفيوليت سمائل (ناري)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#0284c7] border border-white/40"></span>
                  <span>حجر جيري (رسوبي)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#e11d48] border border-white/40"></span>
                  <span>جرانيت مرباط (قديم)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#ca8a04] border border-white/40"></span>
                  <span>رمال وكثبان</span>
                </div>
              </div>
            </div>
          </div>

          {/* Region Overview Information Card */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-teal-600" />
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  معلومات المنطقة المحددة: {selectedRegion.nameAr}
                </h4>
              </div>
              <span className="text-xs text-slate-500 font-bold">
                {selectedRegion.governorates.join(' · ')}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
              {selectedRegion.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white block mb-1">
                  ⭐ أبرز الظواهر الجيولوجية:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-300">
                  {selectedRegion.geologicHighlights.map((gh, idx) => (
                    <li key={idx}>{gh}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white block mb-1">
                  📚 الربط بمنهاج (هذا وطني والدراسات):
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-teal-700 dark:text-teal-400">
                  {selectedRegion.curriculumLinks.map((cl, idx) => (
                    <li key={idx}>{cl}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Rock Types Browser, Percentage Distribution, and Detailed Factsheet (4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          {/* Rock Type Filter Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-teal-600" />
                <span>تصفية الصخور والتكاوين الجيولوجية</span>
              </h4>
              <span className="text-[11px] text-slate-400 font-bold">
                ({filteredRocks.length} صخرة)
              </span>
            </div>

            {/* Category Segmented Control */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'igneous', label: 'نارية' },
                { id: 'sedimentary', label: 'رسوبية' },
                { id: 'metamorphic', label: 'متحولة' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setRockCategoryFilter(cat.id as RockTypeCategory);
                    triggerAudio('rock_tap');
                  }}
                  className={`flex-1 px-2.5 py-1.5 text-xs font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
                    rockCategoryFilter === cat.id
                      ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="ابحث عن صخرة أو موقع أو تكوين..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-9 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-teal-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Rock Distribution Cards Carousel / List */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
              {filteredRocks.map(rock => {
                const isSelected = selectedRockId === rock.id;
                return (
                  <div
                    key={rock.id}
                    onClick={() => {
                      setSelectedRockId(rock.id);
                      setIsDetailDrawerOpen(true);
                      triggerAudio('rock_tap');
                    }}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/50 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-teal-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-4 h-4 rounded-md shrink-0 border border-black/20"
                        style={{ backgroundColor: rock.color }}
                      />
                      <div className="min-w-0">
                        <h5 className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {rock.nameAr}
                        </h5>
                        <p className="text-[10px] text-slate-500 truncate">
                          {rock.category === 'igneous' ? 'صخر ناري' : rock.category === 'sedimentary' ? 'صخر رسوبي' : 'صخر متحول'} · صلابة {rock.mohsHardness}
                        </p>
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      <span className="text-xs font-extrabold text-teal-700 dark:text-teal-400 block">
                        {rock.percentageInOman}%
                      </span>
                      <span className="text-[9px] text-slate-400">
                        {rock.areaKm2.toLocaleString()} كم²
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Rock Detailed Factsheet (Micro-Inspection Lens) */}
          {selectedRock && (
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-5 h-5 rounded-md border border-black/30"
                    style={{ backgroundColor: selectedRock.color }}
                  />
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      {selectedRock.nameAr}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {selectedRock.scientificName}
                    </span>
                  </div>
                </div>

                {/* Direct Button to open in 3D Geological Studio */}
                {selectedRock.threeModelSpecimenId && (
                  <button
                    onClick={() => handleOpenIn3DStudio(selectedRock.threeModelSpecimenId)}
                    title="استعراض مجسم ثلاثي الأبعاد 3D"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 text-white shadow-xs transition cursor-pointer"
                  >
                    <Box className="w-3.5 h-3.5 text-amber-300" />
                    <span>عرض 3D 🪐</span>
                  </button>
                )}
              </div>

              {/* Quick specs grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">العصر الجيولوجي:</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">{selectedRock.agePeriod}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">الكثافة والصلابة:</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">{selectedRock.densityGcm3}</span>
                </div>
              </div>

              {/* Tectonic Genesis */}
              <div>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white block mb-1">
                  🌋 المنشأ التكتوني والجيولوجي:
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedRock.tectonicOrigin}
                </p>
              </div>

              {/* Mineral Composition Progress Bars */}
              <div>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white block mb-2">
                  🔬 التركيب المعدني الدقيق:
                </span>
                <div className="space-y-1.5">
                  {selectedRock.mineralComposition.map((min, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        <span>{min.nameAr}</span>
                        <span>{min.percent}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${min.percent}%`, backgroundColor: min.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Economic Applications in Oman */}
              <div>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white block mb-1">
                  💰 الاستخدامات الاقتصادية والصناعية بالسلطنة:
                </span>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  {selectedRock.economicUses.map((use, idx) => (
                    <li key={idx}>{use}</li>
                  ))}
                </ul>
              </div>

              {/* Pedagogical Questions (Curriculum linkage) */}
              {selectedRock.pedagogicalQuestions && selectedRock.pedagogicalQuestions.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-800 dark:text-amber-300">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>تطبيق صفي لمعلم الجغرافيا ({selectedRock.pedagogicalQuestions[0].gradeLevel}):</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    س: {selectedRock.pedagogicalQuestions[0].question}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    ج: {selectedRock.pedagogicalQuestions[0].answer}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Marker Detail Popup (if mineral marker clicked) */}
          {selectedMarker && (
            <div className="bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-slate-900/10 border-2 border-amber-500/30 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-800 dark:text-amber-400 flex items-center gap-2">
                  <Pickaxe className="w-4 h-4 text-amber-600" />
                  <span>{selectedMarker.nameAr}</span>
                </span>
                <button onClick={() => setSelectedMarker(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                الموقع: {selectedMarker.siteName}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                السياق الصخري: {selectedMarker.rockContext}
              </p>
              <p className="text-xs text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 p-2 rounded-xl border border-amber-200/50">
                الأهمية الاقتصادية: {selectedMarker.economicStatus}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stratigraphic Column Modal (العصور والطبقات الجيولوجية) */}
      {showStratigraphicModal && (
        <div className="fixed inset-0 z-70 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    العمود الطباقي والتسلسل الزمني لعمان (Chronostratigraphic Column)
                  </h3>
                  <p className="text-xs text-slate-500">
                    تتابع العصور الجيولوجية والتكاوين الصخرية من ما قبل الكامبري حتى العصر الرباعي
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowStratigraphicModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Stratigraphic Column Table */}
            <div className="p-5 overflow-y-auto space-y-4">
              <div className="space-y-3">
                {OMAN_STRATIGRAPHIC_COLUMN.map((unit, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border transition hover:shadow-xs flex flex-col md:flex-row gap-4 items-start"
                    style={{ borderColor: `${unit.color}60`, backgroundColor: `${unit.color}08` }}
                  >
                    <div className="w-full md:w-56 shrink-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: unit.color }} />
                        <span className="text-xs font-black text-slate-900 dark:text-white">{unit.eraAr}</span>
                      </div>
                      <h4 className="text-sm font-extrabold" style={{ color: unit.color }}>{unit.periodAr}</h4>
                      <p className="text-[11px] text-slate-500 font-mono font-bold">{unit.epochMillionsYears}</p>
                    </div>

                    <div className="flex-1 space-y-2 text-xs">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">التكاوين الرئيسية:</span>
                        <p className="text-slate-600 dark:text-slate-300">{unit.mainFormationsAr}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">الصخور السائدة:</span>
                        <p className="text-slate-600 dark:text-slate-300">{unit.predominantRocksAr}</p>
                      </div>
                      <div className="bg-white/80 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="font-bold text-teal-700 dark:text-teal-400 block mb-0.5">الأهمية الاقتصادية:</span>
                        <p className="text-slate-600 dark:text-slate-300">{unit.economicOutput}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
              <button
                onClick={() => setShowStratigraphicModal(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-white transition cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
