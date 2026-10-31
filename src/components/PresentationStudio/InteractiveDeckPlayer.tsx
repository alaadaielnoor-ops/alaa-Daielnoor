import React, { useState, useEffect, useRef } from 'react';
import {
  Maximize2, Minimize2, ChevronRight, ChevronLeft, Globe,
  Map, Sparkles, Wind, Eye, EyeOff, Layers, Download,
  Volume2, Play, Pause, RotateCcw, Share2, Compass, Mountain
} from 'lucide-react';
import { PresentationDeck, PresentationSlide } from '../../types/index.ts';

interface InteractiveDeckPlayerProps {
  deck: PresentationDeck;
  initialSlideIndex?: number;
  onCloseFullscreen?: () => void;
}

export const InteractiveDeckPlayer: React.FC<InteractiveDeckPlayerProps> = ({
  deck,
  initialSlideIndex = 0,
  onCloseFullscreen
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(initialSlideIndex);
  const [revealedFragmentsCount, setRevealedFragmentsCount] = useState(0);
  const [transitionStyle, setTransitionStyle] = useState<'slide' | 'fade' | 'convex' | 'zoom' | 'slide-up'>('slide');
  const [showNotes, setShowNotes] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [slideTimerSeconds, setSlideTimerSeconds] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const currentSlide = deck.slides[currentSlideIndex] || deck.slides[0];
  const totalBullets = currentSlide?.bulletPoints?.length || 0;

  // Reset fragment reveal count when slide changes
  useEffect(() => {
    setRevealedFragmentsCount(0);
    setSlideTimerSeconds(0);
  }, [currentSlideIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === ' ' || e.key === 'PageDown') {
        handleNext();
      } else if (e.key === 'ArrowRight' || e.key === 'PageUp') {
        handlePrev();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, revealedFragmentsCount, totalBullets, isFullscreen]);

  // Auto-play timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlay) {
      interval = setInterval(() => {
        handleNext();
      }, 7000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlay, currentSlideIndex, revealedFragmentsCount]);

  const handleNext = () => {
    // If there are unrevealed fragments on current slide, reveal next fragment first
    if (revealedFragmentsCount < totalBullets) {
      setRevealedFragmentsCount(prev => prev + 1);
    } else {
      // Advance to next slide
      if (currentSlideIndex < deck.slides.length - 1) {
        setCurrentSlideIndex(prev => prev + 1);
      } else {
        setIsAutoPlay(false);
      }
    }
  };

  const handlePrev = () => {
    if (revealedFragmentsCount > 0) {
      setRevealedFragmentsCount(prev => prev - 1);
    } else {
      if (currentSlideIndex > 0) {
        setCurrentSlideIndex(prev => prev - 1);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Generate Standalone Reveal.js compatible HTML file
  const handleExportHTML = () => {
    const slidesHtml = deck.slides.map((s, idx) => `
      <section data-transition="${s.transition || transitionStyle}">
        <div style="text-align: right; direction: rtl; font-family: 'Cairo', sans-serif;">
          <h2 style="color: #facc15; font-size: 2rem; margin-bottom: 24px; font-weight: 800;">${s.title}</h2>
          <ul style="font-size: 1.25rem; line-height: 1.8; color: #f8fafc;">
            ${s.bulletPoints.map(bp => `<li class="fragment fade-up">${bp}</li>`).join('')}
          </ul>
          ${s.conceptBox ? `
            <div style="background: rgba(13,148,136,0.25); border: 1px solid #14b8a6; padding: 16px; border-radius: 12px; margin-top: 24px; font-size: 1rem;">
              <strong style="color: #5eead4;">مفهوم محوري: ${s.conceptBox.term}</strong>
              <p style="margin: 4px 0 0 0;">${s.conceptBox.explanation}</p>
            </div>
          ` : ''}
          ${s.embeddedMapQuery ? `
            <div style="margin-top: 20px; font-size: 0.9rem; color: #93c5fd;">
              🌍 موقع جغرافي مرتبط: <strong>${s.embeddedMapQuery}</strong>
            </div>
          ` : ''}
        </div>
        <aside class="notes">${s.speakerNotes || ''}</aside>
      </section>
    `).join('\n');

    const htmlContent = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <title>${deck.title} - عرض تقديمي تفاعلي 🇴🇲</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.5.0/reveal.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.5.0/theme/black.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    body, .reveal { font-family: 'Cairo', Tahoma, sans-serif; background: #090d16; }
    .reveal h1, .reveal h2, .reveal h3 { font-family: 'Cairo', sans-serif; }
    .badge { background: #0d9488; color: white; padding: 4px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: bold; }
  </style>
</head>
<body>
  <div class="reveal">
    <div class="slides">
      <!-- Title Slide -->
      <section data-transition="zoom">
        <div style="text-align: center; direction: rtl;">
          <span class="badge">سلطنة عُمان • وزارة التربية والتعليم 🇴🇲</span>
          <h1 style="color: #38bdf8; font-size: 2.5rem; margin-top: 16px; font-weight: 900;">${deck.title}</h1>
          <p style="color: #94a3b8; font-size: 1.2rem;">${deck.subjectName} | ${deck.gradeName}</p>
          <p style="color: #facc15; font-size: 1rem; margin-top: 20px;">${deck.unitTitle}</p>
        </div>
      </section>
      ${slidesHtml}
    </div>
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.5.0/reveal.min.js"></script>
  <script>
    Reveal.initialize({
      rtl: true,
      transition: '${transitionStyle}',
      controls: true,
      progress: true,
      center: true,
      hash: true
    });
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deck.title.replace(/[/\\?%*:|"<>]/g, '_')}_RevealJS_Presentation.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Determine transition CSS classes
  const getTransitionClass = () => {
    switch (transitionStyle) {
      case 'fade':
        return 'animate-in fade-in duration-300';
      case 'zoom':
        return 'animate-in zoom-in-95 duration-300';
      case 'slide-up':
        return 'animate-in slide-in-from-bottom-8 duration-300';
      case 'convex':
        return 'animate-in spin-in-1 duration-300';
      default:
        return 'animate-in slide-in-from-right-8 duration-300';
    }
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col bg-slate-950 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative select-none ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'min-h-[580px]'
      }`}
    >
      {/* Top HUD Control Bar */}
      <div className="p-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div className="min-w-0">
            <h3 className="font-black text-sm text-amber-300 truncate">
              {deck.title}
            </h3>
            <p className="text-[11px] text-slate-400 truncate">
              {deck.subjectName} • {deck.gradeName} • {deck.unitTitle}
            </p>
          </div>
        </div>

        {/* Transition Style Selector & Controls */}
        <div className="flex items-center gap-2">
          {/* Transition selector */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 text-[11px]">
            <span className="text-slate-400 px-1 font-bold">الحركة:</span>
            {(['slide', 'fade', 'zoom', 'slide-up', 'convex'] as const).map(style => (
              <button
                key={style}
                onClick={() => setTransitionStyle(style)}
                className={`px-2 py-0.5 rounded-lg font-bold transition ${
                  transitionStyle === style
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {style === 'slide' ? 'سحب' : style === 'fade' ? 'تلاشي' : style === 'zoom' ? 'تكبير' : style === 'slide-up' ? 'صعود' : 'مقعر'}
              </button>
            ))}
          </div>

          {/* Auto play toggle */}
          <button
            onClick={() => setIsAutoPlay(prev => !prev)}
            className={`p-2 rounded-xl transition flex items-center gap-1 font-bold text-xs ${
              isAutoPlay ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title={isAutoPlay ? 'إيقاف التشغيل التلقائي' : 'تشغيل تلقائي للشرائح'}
          >
            {isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          {/* Speaker notes toggle */}
          <button
            onClick={() => setShowNotes(prev => !prev)}
            className={`p-2 rounded-xl transition flex items-center gap-1 font-bold text-xs ${
              showNotes ? 'bg-teal-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="إظهار ملاحظات المعلم"
          >
            {showNotes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">ملاحظات المعلم</span>
          </button>

          {/* Export Reveal.js HTML */}
          <button
            onClick={handleExportHTML}
            className="p-2 rounded-xl bg-slate-800 hover:bg-teal-600 text-slate-300 hover:text-white transition flex items-center gap-1 font-bold text-xs"
            title="تصدير كملف HTML مستقل قابل للتشغيل أوفلاين مع Reveal.js"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">تصدير HTML</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="ملء الشاشة"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Slide Canvas */}
      <div className="flex-1 p-6 md:p-12 flex flex-col justify-between overflow-y-auto relative bg-gradient-to-br from-slate-950 via-teal-950/20 to-slate-950">
        <div className={`space-y-6 ${getTransitionClass()}`} key={currentSlideIndex}>
          {/* Slide Header & Metadata */}
          <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800">
            <span className="text-teal-400 font-bold flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>مخرجات التعلم: {deck.unitTitle}</span>
            </span>

            <span className="font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 font-bold">
              الشريحة {currentSlideIndex + 1} / {deck.slides.length}
            </span>
          </div>

          {/* Slide Title */}
          <h2 className="text-2xl md:text-3xl font-black text-amber-300 tracking-wide leading-snug">
            {currentSlide?.title}
          </h2>

          {/* Slide Bullet Points with Progressive Fragment Animation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className={currentSlide?.embeddedMapQuery ? 'lg:col-span-7 space-y-4' : 'lg:col-span-12 space-y-4'}>
              <ul className="space-y-3.5 text-base md:text-lg leading-relaxed">
                {currentSlide?.bulletPoints.map((bp, i) => {
                  const isRevealed = i < revealedFragmentsCount || revealedFragmentsCount === 0;
                  return (
                    <li
                      key={i}
                      className={`flex items-start gap-3 p-2.5 rounded-xl transition-all duration-300 ${
                        isRevealed
                          ? 'opacity-100 translate-x-0 bg-slate-900/40 border border-slate-800/80 text-slate-100'
                          : 'opacity-20 translate-x-3 pointer-events-none text-slate-500'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full bg-teal-400 mt-2 shrink-0 shadow-xs shadow-teal-400/50" />
                      <span className="font-semibold">{bp}</span>
                    </li>
                  );
                })}
              </ul>

              {/* Concept Focus Box */}
              {currentSlide?.conceptBox && (
                <div className="p-4 rounded-2xl bg-teal-950/40 border border-teal-500/40 text-xs text-teal-100 space-y-1">
                  <div className="flex items-center gap-2 text-amber-300 font-black">
                    <Sparkles className="w-4 h-4" />
                    <span>مفهوم محوري: {currentSlide.conceptBox.term}</span>
                  </div>
                  <p className="leading-relaxed text-slate-200">{currentSlide.conceptBox.explanation}</p>
                </div>
              )}
            </div>

            {/* Embedded Live 3D / Interactive Map Box inside Slide */}
            {currentSlide?.embeddedMapQuery && (
              <div className="lg:col-span-5 rounded-2xl border border-teal-500/30 bg-slate-900 p-4 space-y-3 shadow-lg">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                  <span className="font-black text-amber-300 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-teal-400" />
                    <span>الموقع الجغرافي والشاهد المكاني</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-600 text-white font-bold">
                    3D / Live Map
                  </span>
                </div>

                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 relative border border-slate-800 flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 mb-2">
                    <Globe className="w-6 h-6 animate-spin-slow" />
                  </div>
                  <h4 className="text-sm font-black text-white">{currentSlide.embeddedMapQuery}</h4>
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                    {currentSlide.mapOrImageDescription || 'معلم وموقع جغرافي يرتبط بمحتوى هذه الشريحة.'}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 justify-center">
                    <a
                      href={`https://earth.google.com/web/search/${encodeURIComponent(currentSlide.embeddedMapQuery)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
                    >
                      <span>Google Earth 3D</span>
                      <Globe className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(currentSlide.embeddedMapQuery)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
                    >
                      <span>OpenStreetMap</span>
                      <Map className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {currentSlide.vision2040Goal && (
                  <div className="text-[11px] text-amber-200/90 font-medium bg-amber-950/30 p-2 rounded-xl border border-amber-900/40">
                    🎯 <strong>رؤية عُمان 2040:</strong> {currentSlide.vision2040Goal}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Speaker Notes Drawer (Toggled) */}
        {showNotes && currentSlide?.speakerNotes && (
          <div className="mt-6 p-4 rounded-2xl bg-slate-900/90 border border-teal-500/30 text-xs space-y-1 animate-in fade-in">
            <span className="font-black text-teal-400 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>ملاحظات المعلم للشرح والأسئلة الصفية:</span>
            </span>
            <p className="text-slate-300 leading-relaxed font-sans">{currentSlide.speakerNotes}</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation & Slide Thumbnails Strip */}
      <div className="p-3 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between gap-4">
        {/* Prev Button */}
        <button
          onClick={handlePrev}
          disabled={currentSlideIndex === 0 && revealedFragmentsCount === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition disabled:opacity-30"
        >
          <ChevronRight className="w-4 h-4" />
          <span>السابق (المسافة / ◄)</span>
        </button>

        {/* Thumbnail Dots / Slide Navigator */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-md py-1">
          {deck.slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`h-2.5 rounded-full transition-all duration-200 ${
                currentSlideIndex === idx
                  ? 'w-7 bg-amber-400'
                  : 'w-2.5 bg-slate-700 hover:bg-slate-500'
              }`}
              title={`شريحة ${idx + 1}: ${s.title}`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={currentSlideIndex === deck.slides.length - 1 && revealedFragmentsCount >= totalBullets}
          className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs transition disabled:opacity-30 shadow-md shadow-teal-900/30"
        >
          <span>
            {revealedFragmentsCount < totalBullets ? `إظهار النقطة (${revealedFragmentsCount + 1}/${totalBullets})` : 'الشريحة التالية (►)'}
          </span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
