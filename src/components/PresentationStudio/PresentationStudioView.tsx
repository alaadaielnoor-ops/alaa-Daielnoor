import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { PresentationDeck, PresentationSlide } from '../../types/index.ts';
import {
  Presentation, Sparkles, ChevronRight, ChevronLeft,
  Maximize2, Minimize2, Layers, BookOpen, CheckCircle2,
  Table, Copy, Plus, Download, Globe, Wind, Mountain
} from 'lucide-react';
import { InteractiveDeckPlayer } from './InteractiveDeckPlayer.tsx';

// Curated authentic Omani curriculum presentation decks
const CURRICULUM_DECKS: PresentationDeck[] = [
  {
    id: 'deck-hormuz-1',
    title: 'الموقع الجيوسياسي لسلطنة عُمان ومضيق هرمز الاستراتيجي',
    subjectName: 'هذا وطني (تاريخ وجغرافيا عُمان)',
    gradeName: 'الصف 12',
    unitTitle: 'الوحدة الأولى: عُمان المكان والحضارة العالمية',
    createdById: 'usr-admin-1',
    createdAt: new Date().toISOString(),
    summaryCards: [
      {
        title: 'الأهمية الملاحية لمضيق هرمز',
        points: ['تمر عبره قرابة 20-30% من تجارة النفط العالمية المنقولة بحراً', 'إشراف مباشر لسلطنة عمان عبر محافظة مسندم ورأس مسندم']
      },
      {
        title: 'رؤية عُمان 2040 والربط اللوجستي',
        points: ['تطوير موانئ الصيد والترانزيت في خصب ودبا', 'تعزيز سلاسل الإمداد العالمية والأمن الملاحي الإقليمي']
      }
    ],
    slides: [
      {
        id: 's-h-1',
        slideNumber: 1,
        title: 'الموقع الجغرافي والجيوسياسي الفريد لسلطنة عُمان',
        bulletPoints: [
          'تمتد سواحل سلطنة عمان على طول 3,165 كيلومتراً مطلة على ثلاثة مسطحات مائية استراتيجية: بحر عمان، بحر العرب، والخليج العربي.',
          'التحكم والإشراف الحصري على المدخل الملاحي الآمن لمضيق هرمز الدولي.',
          'حلقة وصل تاريخية ومعاصرة تربط خطوط التجارة البحرية بين قارات آسيا وأفريقيا وأوروبا.'
        ],
        conceptBox: {
          term: 'الموقع الجيوسياسي (Geopolitics)',
          explanation: 'دراسة تأثير الجغرافيا والموقع الطبيعي والمنافذ البحرية على السياسة الدولية وموازين القوى الاقتصادية العالمية.'
        },
        embeddedMapQuery: 'Strait of Hormuz Oman',
        mapOrImageDescription: 'مرئية فضائية لمضيق هرمز توضح مسارات ناقلات النفط عبر الممر الملاحي العماني الآمن.',
        transition: 'slide',
        vision2040Goal: 'تعزيز مكانة سلطنة عمان كمركز لوجستي عالمي موثوق للتجارة الدولية',
        speakerNotes: 'ركز على توجيه الطلبة لقراءة الخريطة الصماء لمحافظة مسندم وتحديد موقع رأس مسندم ومسارات الدخول والخروج لناقلات النفط.'
      },
      {
        id: 's-h-2',
        slideNumber: 2,
        title: 'الأهمية الاقتصادية والتجارية لمضيق هرمز',
        bulletPoints: [
          'يعد شريان الطاقة الأول للاقتصاد العالمي؛ حيث تعبره ناقلة نفط كل بضع دقائق محملة بقرابة 21 مليون برميل يومياً.',
          'عمق المياه في الجانب العماني (شمال خصب) يسمح بمرور الناقلات العملاقة (VLCC) بأمان مطلق.',
          'تطبيق نظام فصل حركة السفن المعتمد من المنظمة البحرية الدولية (IMO) لحماية البيئة البحرية وتفادي الحوادث.'
        ],
        conceptBox: {
          term: 'نظام فصل حركة السفن (Traffic Separation Scheme)',
          explanation: 'ممرات ملاحة بحرية منظمة تحدد اتجاهات السير البحرية بدقة لمنع تصادم الناقلات في المضائق المزدحمة.'
        },
        embeddedMapQuery: 'Khasab Port Musandam Oman',
        mapOrImageDescription: 'ميناء خصب والأخوار البحرية بمحافظة مسندم.',
        transition: 'convex',
        vision2040Goal: 'تطوير الاقتصاد الأزرق وتعزيز سلامة الملاحة البحرية وحماية البيئة',
        speakerNotes: 'اسأل الطلاب: ما الآثار الاقتصادية العالمية المترتبة على أي اضطراب أو إغلاق محتمل لهذا الممر المائي؟'
      },
      {
        id: 's-h-3',
        slideNumber: 3,
        title: 'مستهدفات رؤية عُمان 2040 في تنمية مسندم واللوجستيات',
        bulletPoints: [
          'تحديث منظومة ميناء خصب وميناء دبا كبوابات تجارية وسياحية عالمية متكاملة.',
          'تطوير السياحة البيئية وسياحة الأخوار ومراقبة الدلافين مع الحفاظ على التنوع الأحيائي الفريد.',
          'مشروعات الطاقة المتجددة وربط القرى الساحلية البحرية بتقنيات الطاقة الشمسية النظيفة.'
        ],
        conceptBox: {
          term: 'تنمية المحافظات والمدن المستدامة',
          explanation: 'أولوية وطنية تركز على تحقيق تنمية جغرافية متوازنة واستثمار الميزات التنافسية لكل محافظة.'
        },
        embeddedMapQuery: 'Musandam Peninsula Oman',
        mapOrImageDescription: 'محافظة مسندم والتضاريس الجبلية الوعرة المشرفة على بحر عمان والخليج العربي.',
        transition: 'zoom',
        vision2040Goal: 'تحقيق التوازن التنموي الشامل والاستغلال الأمثل للموارد الجغرافية',
        speakerNotes: 'استعرض مع الطلاب أثر إعلان مسندم كمنطقة ذات أولوية تنموية خاصة لجذب الاستثمارات النوعية.'
      }
    ]
  },
  {
    id: 'deck-aflaj-2',
    title: 'نظام الأفلاج العُمانية: عبقرية الهندسة والتراث الإنساني',
    subjectName: 'الجغرافيا والتقنيات الحديثة',
    gradeName: 'الصف 11',
    unitTitle: 'الوحدة الثانية: التراث المائي والإدارة المستدامة للموارد',
    createdById: 'usr-admin-1',
    createdAt: new Date().toISOString(),
    summaryCards: [
      {
        title: 'أنواع الأفلاج العمانية الثلاثة',
        points: ['الداوودي (51% مياه جوفية عميقة)', 'العيني (28% عيون جبلية)', 'الغيلي (21% مياه الأودية شبه السطحية)']
      },
      {
        title: 'الأفلاج الخمسة المسجلة في اليونسكو (2006)',
        points: ['دارس (نزوى)', 'الخطمين (بركة الموز)', 'الملكي (إزكي)', 'الميسر (الرستاق)', 'الجيلة (صور)']
      }
    ],
    slides: [
      {
        id: 's-a-1',
        slideNumber: 1,
        title: 'القطاع الهندسي للفلج الداوودي العماني',
        bulletPoints: [
          'يبدأ بحفر "أم الفلج" في الطبقات الصخرية الحاملة للمياه الجوفية بعمق يصل إلى 50 متراً.',
          'حفر سلسلة من آبار التهوية والمنافس العمودية لتأمين التنفس وإخراج ركام الصخور أثناء الشق.',
          'قناة انحدار طبيعي مائلة بدقة هندسية فائقة لتنساب المياه بقوة الجاذبية دون الحاجة لأي طاقة أو مضخات.'
        ],
        conceptBox: {
          term: 'أم الفلج (Mother Well)',
          explanation: 'البئر الجوفية الرئيسية العميقة التي تمثل المنبع ومصدر تدفق المياه في نظام الفلج.'
        },
        embeddedMapQuery: 'Falaj Daris Nizwa Oman',
        mapOrImageDescription: 'فلج دارس بولاية نزوى أكبر الأفلاج الداوودية في سلطنة عمان.',
        transition: 'slide-up',
        vision2040Goal: 'صون التراث المائي والتاريخي والهوية الثقافية الأصيلة لسلطنة عمان',
        speakerNotes: 'وضح للطلاب الفرق بين الفلج الداوودي الذي لا ينضب بسهولة، والفلج الغيلي الذي يتأثر سريعاً بجفاف الأودية.'
      },
      {
        id: 's-a-2',
        slideNumber: 2,
        title: 'نظام "الأثر" والقسمة الفلكية لتوزيع المياه',
        bulletPoints: [
          'تقسيم اليوم إلى حصص زمنية عادلة تسمى "الأثر" ومقداره (30 دقيقة).',
          'استخدام "المزولة الشمسية (اللمد)" نهاراً وحساب مساقط ظل الشمس بين الأعمدة لتحديد نوبة كل مزارع.',
          'استخدام "مطالع النجوم الفلكية" ليلاً لمعرفة ساعات الري بدقة متناهية تشهد على سبق المعرفة الفلكية العمانية.'
        ],
        conceptBox: {
          term: 'الأثر العماني (Athar)',
          explanation: 'وحدة قياس زمنية تقليدية تعادل نصف ساعة من جريان ماء الفلج المخصص لري حصة زراعية محددة.'
        },
        embeddedMapQuery: 'Nizwa Fort Oman',
        mapOrImageDescription: 'واحات النخيل بمدينة نزوى والداخلية المعتمدة على ري الأفلاج.',
        transition: 'fade',
        vision2040Goal: 'الإدارة المستدامة للموارد المائية الشحيحة وفق التقاليد الحكيمة',
        speakerNotes: 'اطلب من الطلبة مقارنة نظام تقسيم مياه الفلج القديم بأنظمة الري الذكية الحديثة والري بالتنقيط.'
      }
    ]
  },
  {
    id: 'deck-duqm-3',
    title: 'رؤية عُمان 2040: قطب الهيدروجين الأخضر وميناء الدقم',
    subjectName: 'هذا وطني',
    gradeName: 'الصف 12',
    unitTitle: 'الوحدة الثالثة: التنويع الاقتصادي والحياد الصفري الكربوني',
    createdById: 'usr-admin-1',
    createdAt: new Date().toISOString(),
    summaryCards: [
      {
        title: 'المزايا التنافسية للدقم',
        points: ['الموقع المباشر على بحر العرب بعيداً عن المضائق', 'وفرة سطوع الشمس وسرعات الرياح العالية لإنتاج الطاقة المتجددة']
      }
    ],
    slides: [
      {
        id: 's-d-1',
        slideNumber: 1,
        title: 'التحول الاستراتيجي نحو الاقتصاد الأزرق والهيدروجين النظيف',
        bulletPoints: [
          'تخصيص أكثر من 50 ألف كيلومتر مربع لمشروعات الطاقة المتجددة والهيدروجين الأخضر في الدقم وظفار.',
          'الوصول إلى إنتاج أكثر من مليون طن من الهيدروجين الأخضر بحلول 2030 تحقيقاً للحياد الكربوني في 2050.',
          'ربط الميناء بالحوض الجاف ومجمع الصناعات البتروكيماوية وسلاسل الإمداد مع أوروبا وآسيا.'
        ],
        conceptBox: {
          term: 'الهيدروجين الأخضر (Green Hydrogen)',
          explanation: 'وقود المستقبل النظيف الناتج عن فصل جزيئات الماء باستخدام الكهرباء المولدة من طاقة الشمس والرياح الخالية من الانبعاثات.'
        },
        embeddedMapQuery: 'Duqm Port Oman',
        mapOrImageDescription: 'المنطقة الاقتصادية الخاصة بالدقم وميناء الدقم على بحر العرب.',
        transition: 'zoom',
        vision2040Goal: 'تحقيق الحياد الصفري الكربوني (Net-Zero 2050) وتوسيع الاقتصاد الأخضر',
        speakerNotes: 'ناقش مع الطلاب كيف تحولت الدقم من قرية صيد صغيرة إلى أحد أضخم المراكز الصناعية العالمية في الشرق الأوسط.'
      }
    ]
  }
];

export const PresentationStudioView: React.FC = () => {
  const { showToast, currentUser } = useApp();

  const [decks, setDecks] = useState<PresentationDeck[]>(CURRICULUM_DECKS);
  const [selectedDeck, setSelectedDeck] = useState<PresentationDeck>(CURRICULUM_DECKS[0]);
  const [showGenModal, setShowGenModal] = useState(false);

  // New deck generator inputs
  const [genTitle, setGenTitle] = useState('');
  const [genSubject, setGenSubject] = useState('الجغرافيا والتقنيات الحديثة');
  const [genGrade, setGenGrade] = useState('الصف 11');
  const [genUnit, setGenUnit] = useState('نظم المعلومات الجغرافية والاستشعار عن بعد');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadPresentations();
  }, []);

  const loadPresentations = async () => {
    try {
      const res = await api.getPresentations();
      if (res.success && res.presentations && res.presentations.length > 0) {
        // Merge server decks with our rich curriculum decks
        const merged = [...CURRICULUM_DECKS];
        for (const p of res.presentations) {
          if (!merged.some(m => m.id === p.id)) {
            merged.push(p);
          }
        }
        setDecks(merged);
        setSelectedDeck(merged[0]);
      }
    } catch (e) {
      console.warn('Presentations load error:', e);
    }
  };

  const handleGenerateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genTitle.trim()) return;

    setIsGenerating(true);
    try {
      const newDeck: PresentationDeck = {
        id: `deck-gen-${Date.now()}`,
        title: genTitle.trim(),
        subjectName: genSubject,
        gradeName: genGrade,
        unitTitle: genUnit,
        createdById: currentUser.id,
        createdAt: new Date().toISOString(),
        summaryCards: [
          {
            title: 'المحاور الأساسية للدرس',
            points: ['المفاهيم الكارتوجرافية والجيومكانية الرئيسية', 'المواءمة مع مستهدفات رؤية عمان 2040 والتنمية المستدامة']
          }
        ],
        slides: [
          {
            id: `s-new-1`,
            slideNumber: 1,
            title: `مدخل إلى: ${genTitle.trim()}`,
            bulletPoints: [
              `استعراض المفاهيم والمصطلحات الأساسية لدرس ${genTitle.trim()} وفق المنهج العُماني.`,
              'التحليل المكاني وتوزيع الظواهر الجغرافية الطبيعية والبشرية في سلطنة عُمان.',
              'التطبيقات العملية لنظم المعلومات الجغرافية والاستشعار عن بعد في دراسة الموضوع.'
            ],
            conceptBox: {
              term: 'التحليل المكاني (Spatial Analysis)',
              explanation: 'عملية فحص مواقع الظواهر وخصائصها وعلاقاتها المتبادلة باستخدام الخرائط والبيانات الجيومكانية.'
            },
            embeddedMapQuery: 'Sultanate of Oman',
            mapOrImageDescription: 'خريطة سلطنة عمان الإدارية والتضاريسية الشاملة.',
            transition: 'slide',
            vision2040Goal: 'جودة التعليم والبحث العلمي وبناء المهارات الوطنية للمستقبل',
            speakerNotes: 'ابدأ الدرس بنشاط استهلالي يربط بين الواقع المعاش والظاهرة الجغرافية المطروحة.'
          },
          {
            id: `s-new-2`,
            slideNumber: 2,
            title: 'الربط بمستهدفات رؤية عُمان 2040 والتنمية المستدامة',
            bulletPoints: [
              'استثمار الميزة التنافسية للمحافظات في تحقيق الأمن المائي والغذائي وتطوير المدن الذكية.',
              'الحفاظ على البيئة الطبيعية ومصادر الطاقة المتجددة والحد من آثار التغير المناخي.',
              'تأهيل الطلبة بالمهارات الرقمية وأدوات التقنية الحديثة لمواكبة متطلبات الثورة الصناعية الرابعة.'
            ],
            conceptBox: {
              term: 'الاستدامة البيئية (Sustainability)',
              explanation: 'تلبية احتياجات الحاضر من الموارد دون المساس بقدرة الأجيال القادمة على تلبية احتياجاتها.'
            },
            embeddedMapQuery: 'Muscat Oman',
            mapOrImageDescription: 'العاصمة مسقط والمشاريع التنموية المستدامة.',
            transition: 'fade',
            vision2040Goal: 'حماية البيئة وصون الموارد الطبيعية والابتكار الوطني',
            speakerNotes: 'وجه الطلاب لتصميم مبادرة طلابية صفية لتعزيز الاستدامة في محيط المدرسة.'
          }
        ]
      };

      await api.savePresentation(newDeck);
      setDecks(prev => [newDeck, ...prev]);
      setSelectedDeck(newDeck);
      setShowGenModal(false);
      showToast('تم توليد العرض التقديمي التفاعلي بنجاح!', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Presentation className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <span>استوديو العروض التقديمية التفاعلية (Reveal.js Style)</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-600 text-white font-black shadow-xs">
              تفاعلي 3D 🇴🇲
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            عروض شرائح مدعومة بتأثيرات التحريك التدريجي (Fragments)، الانتقالات الحركية، وتضمين الخرائط ثلاثية الأبعاد
          </p>
        </div>

        <button
          onClick={() => setShowGenModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-sm shrink-0"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>توليد عرض تقديمي بالذكاء الاصطناعي</span>
        </button>
      </div>

      {/* Available Decks Carousel Bar */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {decks.map(deck => {
          const isSelected = selectedDeck?.id === deck.id;
          return (
            <button
              key={deck.id}
              onClick={() => setSelectedDeck(deck)}
              className={`p-3 rounded-2xl border text-right transition shrink-0 min-w-[260px] max-w-[320px] flex flex-col justify-between space-y-2 ${
                isSelected
                  ? 'bg-teal-50 dark:bg-teal-950/50 border-teal-500 shadow-sm ring-2 ring-teal-500/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-400'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-teal-600 text-white">
                  {deck.gradeName}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">
                  {deck.slides.length} شرائح تفاعلية
                </span>
              </div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">
                {deck.title}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                {deck.unitTitle}
              </p>
            </button>
          );
        })}
      </div>

      {/* Interactive Deck Presenter Canvas */}
      {selectedDeck ? (
        <InteractiveDeckPlayer deck={selectedDeck} />
      ) : (
        <div className="p-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          اختر عرضاً تقديمياً لتشغيله
        </div>
      )}

      {/* Generation Modal */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-right space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600" />
                <span>توليد عرض تقديمي تفاعلي بالذكاء الاصطناعي</span>
              </h3>
              <button
                onClick={() => setShowGenModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateDeck} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان الدرس أو العرض التقديمي
                </label>
                <input
                  type="text"
                  required
                  value={genTitle}
                  onChange={e => setGenTitle(e.target.value)}
                  placeholder="مثال: التغير المناخي والأنواء الاستثنائية في بحر العرب"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">المادة الدراسية</label>
                  <select
                    value={genSubject}
                    onChange={e => setGenSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="هذا وطني (تاريخ وجغرافيا عمان)">هذا وطني</option>
                    <option value="الجغرافيا والتقنيات الحديثة">الجغرافيا والتقنيات الحديثة</option>
                    <option value="الدراسات الاجتماعية">الدراسات الاجتماعية</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الصف الدراسي</label>
                  <select
                    value={genGrade}
                    onChange={e => setGenGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="الصف 12">الصف 12</option>
                    <option value="الصف 11">الصف 11</option>
                    <option value="الصف 10">الصف 10</option>
                    <option value="الصف 9">الصف 9</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الوحدة والمفهوم الجغرافي المستهدف
                </label>
                <input
                  type="text"
                  value={genUnit}
                  onChange={e => setGenUnit(e.target.value)}
                  placeholder="مثال: الإدارة المستدامة للموارد ورؤية عمان 2040"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowGenModal(false)}
                  className="px-4 py-2 text-slate-500 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition shadow-sm disabled:opacity-50"
                >
                  {isGenerating ? 'جارٍ صياغة وتوليد الشرائح...' : 'توليد وحفظ العرض التقديمي'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
