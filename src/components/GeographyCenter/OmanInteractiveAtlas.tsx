import React, { useState } from 'react';
import {
  Compass, MapPin, Award, CheckCircle2, XCircle, RotateCcw,
  Printer, Eye, HelpCircle, Sparkles, Layers, ChevronRight,
  TrendingUp, TreePine, Droplets, Sun, Wind, Anchor, Mountain
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

export interface GovernorateData {
  id: string;
  name: string;
  capital: string;
  wilayatsCount: number;
  wilayats: string[];
  areaKm2: string;
  populationEstimate: string;
  landscape: string;
  keyFeatures: string[];
  vision2040Projects: string[];
  color: string;
  path: string; // SVG path
  labelPos: { x: number; y: number };
  quizClues: string[];
}

export const OMAN_GOVERNORATES: GovernorateData[] = [
  {
    id: 'musandam',
    name: 'محافظة مسندم',
    capital: 'خصب',
    wilayatsCount: 4,
    wilayats: ['خصب', 'بخاء', 'دبا', 'مدحاء'],
    areaKm2: '1,800 كم²',
    populationEstimate: '45,000 نسمة',
    landscape: 'سلاسل جبلية وعرة وأخوار بحرية طبيعية ومضائق استراتيجية',
    keyFeatures: ['الإشراف المباشر على مضيق هرمز الدولي', 'خور نجد وخور شم', 'صناعة وصيد الأسماك والسياحة البحرية'],
    vision2040Projects: ['تطوير ميناء خصب كبوابة لوجستية وسياحية دولية', 'مشروعات الاقتصاد الأزرق وتطوير القرى البحرية المستدامة'],
    color: '#0284c7',
    path: 'M 290 20 L 320 25 L 330 50 L 310 70 L 290 60 L 285 35 Z',
    labelPos: { x: 305, y: 45 },
    quizClues: [
      'تتحكم في الممر المائي الاستراتيجي الأهم لتجارة النفط العالمية (مضيق هرمز).',
      'تتميز بأخوارها البحرية العميقة التي تشبه الفجوردات وطبيعتها الجبلية الشاهقة.',
      'عاصمتها الإدارية هي ولاية خصب.'
    ]
  },
  {
    id: 'al_buraimi',
    name: 'محافظة البريمي',
    capital: 'البريمي',
    wilayatsCount: 3,
    wilayats: ['البريمي', 'محضة', 'السنينة'],
    areaKm2: '7,000 كم²',
    populationEstimate: '120,000 نسمة',
    landscape: 'سهول صحراوية رملية وواحات خضراء وتلال صخرية غربية',
    keyFeatures: ['واحات النخيل والأفلاج التاريخية', 'بوابة التجارة البرية الغربية', 'حصن الحلة وحصن الخندق'],
    vision2040Projects: ['المنطقة الاقتصادية بالروضة والتكامل اللوجستي التجاري', 'مشاريع الزراعة الذكية والمزارع النموذجية المحمية'],
    color: '#eab308',
    path: 'M 240 100 L 275 90 L 280 130 L 250 145 L 230 120 Z',
    labelPos: { x: 255, y: 118 },
    quizClues: [
      'تشكل البوابة التجارية الشمالية الغربية لسلطنة عمان وتضم واحات نخيل عريقة.',
      'تحتضن حصني الخندق والحلة التاريخيين وتضم ولايات محضة والسنينة.',
      'تعد مركزاً حيوياً للتبادل التجاري والزراعي والترانزيت.'
    ]
  },
  {
    id: 'al_batinah_north',
    name: 'محافظة شمال الباطنة',
    capital: 'صحار',
    wilayatsCount: 6,
    wilayats: ['صحار', 'شناص', 'لوى', 'صحم', 'الخابورة', 'السويق'],
    areaKm2: '12,500 كم²',
    populationEstimate: '780,000 نسمة',
    landscape: 'سهل ساحلي خصب ممتد بين جبال الحجر الغربي وبحر عمان',
    keyFeatures: ['ميناء صحار الصناعي والمنطقة الحرة', 'مركز صناعي وتعديني تاريخي وحديث', 'سلة عمان الغذائية الزراعية والسمكية'],
    vision2040Projects: ['مشاريع الصناعات الثقيلة والهيدروجين النظيف في صحار', 'تحديث الأسطول الزراعي والتقنيات البحرية الذكية'],
    color: '#10b981',
    path: 'M 285 90 L 330 110 L 350 145 L 310 160 L 280 130 Z',
    labelPos: { x: 312, y: 130 },
    quizClues: [
      'تضم مدينة صحار التاريخية والميناء الصناعي والمنطقة الحرة العملاقة.',
      'تمثل الامتداد الشمالي لسهل الباطنة الزراعي الخصب وتعد كثيفة السكان.',
      'اشتهرت قديماً بتعدين وتصدير النحاس (أرض مجان).'
    ]
  },
  {
    id: 'al_batinah_south',
    name: 'محافظة جنوب الباطنة',
    capital: 'الرستاق',
    wilayatsCount: 6,
    wilayats: ['الرستاق', 'العوابي', 'نخل', 'وادي المعاول', 'بركاء', 'المصنعة'],
    areaKm2: '5,300 كم²',
    populationEstimate: '470,000 نسمة',
    landscape: 'تدرج طبيعي من شواطئ بحر عمان حتى سفوح الحجر الغربي والأودية الخلابة',
    keyFeatures: ['حصن الرستاق وقلعة نخل وعين الكسفة الكبريتية', 'سوق بركاء ووادي بني عوف ووادي السحتن', 'مشاريع الأمن الغذائي وسوق الخضار المركزي'],
    vision2040Projects: ['تطوير مدينة خزائن الاقتصادية كمركز لوجستي وصناعي متكامل', 'المسارات السياحية الجبلية والتراث المعماري المستدام'],
    color: '#06b6d4',
    path: 'M 350 145 L 390 165 L 380 200 L 330 185 L 310 160 Z',
    labelPos: { x: 350, y: 175 },
    quizClues: [
      'عاصمتها ولاية الرستاق العريقة وتضم قلعة نخل وعين الكسفة الكبريتية الشهيرة.',
      'تحتضن مدينة "خزائن" اللوجستية وتجمع بين السهل الساحلي وسفوح الجبال.',
      'تتميز بأوديتها الشهيرة كوادي بني عوف ووادي السحتن.'
    ]
  },
  {
    id: 'muscat',
    name: 'محافظة مسقط',
    capital: 'مسقط',
    wilayatsCount: 6,
    wilayats: ['مسقط', 'مطرح', 'بوشر', 'السيب', 'العامرات', 'قريات'],
    areaKm2: '3,500 كم²',
    populationEstimate: '1,450,000 نسمة',
    landscape: 'شريط ساحلي صخري خلاب تحيط به الجبال والخلجان والمدن الحديثة',
    keyFeatures: ['عاصمة سلطنة عمان والمركز السياسي والمالي والإداري', 'جامعة السلطان قابوس، ميناء السلطان قابوس، وسوق مطرح التراثي', 'محمية جزر الديمانيات الطبيعية وسد وادي ضيقة'],
    vision2040Projects: ['مشروع الواجهة البحرية لميناء السلطان قابوس', 'تطوير مسقط كمدينة ذكية ومستدامة محايدة كربونياً'],
    color: '#f43f5e',
    path: 'M 390 165 L 435 180 L 440 215 L 400 210 L 380 200 Z',
    labelPos: { x: 410, y: 195 },
    quizClues: [
      'العاصمة السياسية والمركز الإداري والاقتصادي الأول لسلطنة عمان.',
      'تحتضن سوق مطرح التراثي وقصر العلم وجامعة السلطان قابوس.',
      'تقع بين خليج عمان وسلاسل الجبال الصخرية وتعد الأكثر كثافة سكانية.'
    ]
  },
  {
    id: 'adh_dhahirah',
    name: 'محافظة الظاهرة',
    capital: 'عبري',
    wilayatsCount: 3,
    wilayats: ['عبري', 'ينقل', 'ضنك'],
    areaKm2: '37,000 كم²',
    populationEstimate: '220,000 نسمة',
    landscape: 'سهول صحراوية مفتوحة تحاذي صحراء الربع الخالي وسفوح الحجر',
    keyFeatures: ['مواقع بات والخطم والعين المدرجة في التراث العالمي (اليونسكو)', 'حقول النفط والغاز الكبرى (جبال، الخوير)', 'سوق عبري التاريخي وزراعة النخيل'],
    vision2040Projects: ['مشروع ربط منفذ الربع الخالي مع السعودية لتعزيز التجارة', 'مشاريع الطاقة الشمسية الكهروضوئية في عبري (محطة عبري للطاقة الشمسية)'],
    color: '#f97316',
    path: 'M 250 145 L 310 160 L 300 240 L 220 220 L 230 160 Z',
    labelPos: { x: 265, y: 190 },
    quizClues: [
      'تحتضن موقع "بات والخطم والعين" الأثري المسجل عالمياً في اليونسكو وعاصمتها عبري.',
      'تضم أكبر محطات الطاقة الشمسية النظيفة وميادين النفط والغاز ومشاريع الطاقة المتجددة.',
      'تشترك بحدود برية واسعة مع صحراء الربع الخالي ومنفذ الربع الخالي الحدودي.'
    ]
  },
  {
    id: 'ad_dakhiliyah',
    name: 'محافظة الداخلية',
    capital: 'نزوى',
    wilayatsCount: 8,
    wilayats: ['نزوى', 'بهلاء', 'منح', 'الحمراء', 'أدم', 'إزكي', 'سمائل', 'بدبد'],
    areaKm2: '31,900 كم²',
    populationEstimate: '490,000 نسمة',
    landscape: 'قلب عمان التضاريسي والتاريخي، سفوح الجبل الأخضر وجبل شمس والأفلاج',
    keyFeatures: ['نزوى عاصمة الثقافة الإسلامية التاريخية وقلعتها الشهباء', 'فلج دارس والخطمين وقلعة بهلاء المسجلة في اليونسكو', 'الجبل الأخضر وجبل شمس (أعلى قمة في عمان 3009 م)'],
    vision2040Projects: ['تطوير متحف عمان عبر الزمان في ولاية منح', 'مشاريع السياحة البيئية والزراعية المستدامة في الجبل الأخضر'],
    color: '#8b5cf6',
    path: 'M 310 160 L 380 200 L 360 270 L 290 260 L 300 240 Z',
    labelPos: { x: 335, y: 220 },
    quizClues: [
      'تعد المعقل التاريخي والحضاري لعمان وعاصمتها مدينة نزوى الشهيرة بقلعتها.',
      'تحتضن أعلى قمة جبلية في عمان (جبل شمس) وفلج دارس التاريخي ومتحف عمان عبر الزمان.',
      'تضم قلعة بهلاء وواحتها أول موقع عماني يدرج في لائحة التراث العالمي.'
    ]
  },
  {
    id: 'ash_sharqiyah_north',
    name: 'محافظة شمال الشرقية',
    capital: 'إبراء',
    wilayatsCount: 6,
    wilayats: ['إبراء', 'المضيبي', 'سناو', 'بدية', 'القابل', 'وادي بني خالد'],
    areaKm2: '21,100 كم²',
    populationEstimate: '290,000 نسمة',
    landscape: 'تنوع جغرافي فريد يجمع رمال الشرقية الشاسعة والأودية العذبة والواحات',
    keyFeatures: ['وادي بني خالد ببركه المائية الدائمة', 'رمال بدية ومهرجانات سياحة الصحراء والمغامرات', 'سوق الأربعاء للنساء بإبراء والأفلاج العينية التاريخية'],
    vision2040Projects: ['مشاريع السياحة الصحراوية البيئية والرياضات التراثية', 'تطوير مشاريع التعدين الحديثة وسوق سناو التجاري المركزي'],
    color: '#ec4899',
    path: 'M 380 200 L 440 215 L 430 280 L 360 270 Z',
    labelPos: { x: 395, y: 245 },
    quizClues: [
      'تتميز برمال بدية الذهبية الساحرة ووادي بني خالد ذي البرك المائية الرقراقة.',
      'عاصمتها ولاية إبراء وتشتهر بسوق الأربعاء النسائي والبيوت الأثرية الشامخة.',
      'تعد ملتقى القوافل القديمة وتجمع بين الواحات الخضراء والكثبان الرملية.'
    ]
  },
  {
    id: 'ash_sharqiyah_south',
    name: 'محافظة جنوب الشرقية',
    capital: 'صور',
    wilayatsCount: 5,
    wilayats: ['صور', 'الكامل والوافي', 'جعلان بني بو حسن', 'جعلان بني بو علي', 'مصيرة'],
    areaKm2: '12,000 كم²',
    populationEstimate: '330,000 نسمة',
    landscape: 'سواحل بحرية نقية، أخوار طبيعية، جزيرة مصيرة، ورأس الحد الشرقي',
    keyFeatures: ['مدينة صور العريقة رائدة صناعة السفن الخشبية (الغنجة)', 'محمية السلاحف الخضراء برأس الجنز (أول بقعة تشرق عليها الشمس بالوطن العربي)', 'جزيرة مصيرة السياحية ومحطة توليد طاقة الرياح'],
    vision2040Projects: ['مجمع الغاز الطبيعي المسال وميناء الصيد البحري بصور', 'تطوير جزيرة مصيرة ورأس الحد كوجهات سياحية بيئية عالمية'],
    color: '#14b8a6',
    path: 'M 440 215 L 485 240 L 450 310 L 430 280 Z',
    labelPos: { x: 450, y: 260 },
    quizClues: [
      'تحتضن ولاية صور المشهورة بصناعة السفن الخشبية والغنجة عبر القرون.',
      'تضم "رأس الجنز" أول بقعة تشرق عليها الشمس في الوطن العربي ومحمية السلاحف الخضراء.',
      'تتبع لها "جزيرة مصيرة" الاستراتيجية وتطل على بحر العرب وبحر عمان.'
    ]
  },
  {
    id: 'al_wusta',
    name: 'محافظة الوسطى',
    capital: 'هيماء',
    wilayatsCount: 4,
    wilayats: ['هيماء', 'الدقم', 'محوت', 'الجازر'],
    areaKm2: '79,700 كم²',
    populationEstimate: '65,000 نسمة',
    landscape: 'سهول منبسطة شاسعة، سواحل بكر على بحر العرب، وجروف صخرية بيضاء',
    keyFeatures: ['المنطقة الاقتصادية الخاصة بالدقم والحوض الجاف وميناء الدقم', 'محمية المها العربي (جدة الحراسيس) ومحمية الأراضي الرطبة بمحوت', 'حقول النفط والغاز وثروة سمكية فائقة الغنى'],
    vision2040Projects: ['القطب العالمي للهيدروجين الأخضر والطاقة المتجددة بالدقم', 'مصفاة الدقم ومجمع الصناعات البتروكيماوية وسلاسل الإمداد العالمية'],
    color: '#6366f1',
    path: 'M 220 220 L 360 270 L 450 310 L 390 420 L 250 390 L 190 300 Z',
    labelPos: { x: 300, y: 340 },
    quizClues: [
      'تحتضن "المنطقة الاقتصادية الخاصة بالدقم" ومشروعات الهيدروجين الأخضر الكبرى.',
      'تضم محمية المها العربي ومحمية الأراضي الرطبة وسواحل بحر العرب الغنية.',
      'تعد ثاني أكبر المحافظات مساحة وتمثل قلب رؤية عمان 2040 اللوجستي والتنموي.'
    ]
  },
  {
    id: 'dhofar',
    name: 'محافظة ظفار',
    capital: 'صلالة',
    wilayatsCount: 10,
    wilayats: ['صلالة', 'طاقة', 'مرباط', 'سدح', 'شليم وجزر الحلانيات', 'رخيوت', 'ضلكوت', 'ثمريت', 'مقشن', 'المزيونة'],
    areaKm2: '99,300 كم²',
    populationEstimate: '460,000 نسمة',
    landscape: 'جبال شاهقة (سمحان والقمر والقرا) تكتسي بالخضار صيفاً وصحراء نجد وسواحل بحر العرب',
    keyFeatures: ['ظاهرة خريف صلالة الموسمية المناخية الفريدة في شبه الجزيرة العربية', 'شجرة اللبان التاريخية ومواقع أرض اللبان المسجلة في اليونسكو (سمهرم، البليد، وبار)', 'ميناء صلالة العالمي للحاويات والمنطقة الحرة'],
    vision2040Projects: ['تطوير منظومة الطاقة المتجددة (مزرعة رياح ظفار بالفتك ومشاريع الهيدروجين)', 'تطوير صلالة كمركز سياحي وتجاري إقليمي يعمل على مدار العام'],
    color: '#059669',
    path: 'M 100 370 L 250 390 L 280 480 L 150 490 L 80 430 Z',
    labelPos: { x: 175, y: 440 },
    quizClues: [
      'تنفرد بظاهرة "خريف صلالة" المناخية الاستوائية في فصل الصيف وتحتضن شجرة اللبان.',
      'تعد أكبر محافظات سلطنة عمان مساحة وتضم ميناء صلالة العالمي للحاويات.',
      'تضم مواقع "أرض اللبان" المدرجة في اليونسكو وجبال سمحان والقرا والقمر.'
    ]
  }
];

export const OmanInteractiveAtlas: React.FC = () => {
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'explore' | 'quiz' | 'print'>('explore');
  const [selectedGov, setSelectedGov] = useState<GovernorateData>(OMAN_GOVERNORATES[0]);
  const [hoveredGov, setHoveredGov] = useState<GovernorateData | null>(null);

  // Quiz state
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnsweredCount, setQuizAnsweredCount] = useState(0);
  const [lastAnswerStatus, setLastAnswerStatus] = useState<'correct' | 'wrong' | null>(null);
  const [streak, setStreak] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Filter / Layer toggles
  const [showWaterways, setShowWaterways] = useState(true);
  const [showVisionProjects, setShowVisionProjects] = useState(true);
  const [showCoordinates, setShowCoordinates] = useState(true);

  // Current target for quiz question
  const currentQuizGov = OMAN_GOVERNORATES[quizQuestionIndex % OMAN_GOVERNORATES.length];
  const currentClueIndex = quizQuestionIndex % currentQuizGov.quizClues.length;
  const currentClue = currentQuizGov.quizClues[currentClueIndex];

  const handleGovClick = (gov: GovernorateData) => {
    if (activeTab === 'explore') {
      setSelectedGov(gov);
    } else if (activeTab === 'quiz' && !quizCompleted) {
      handleQuizAnswer(gov);
    }
  };

  const handleQuizAnswer = (gov: GovernorateData) => {
    const isCorrect = gov.id === currentQuizGov.id;
    setQuizAnsweredCount(prev => prev + 1);

    if (isCorrect) {
      setQuizScore(prev => prev + 10);
      setStreak(prev => prev + 1);
      setLastAnswerStatus('correct');
      showToast(`إجابة صحيحة وممتازة! 🎉 هذه بالفعل ${gov.name}`, 'success');
    } else {
      setStreak(0);
      setLastAnswerStatus('wrong');
      showToast(`إجابة غير صحيحة. نقرت على (${gov.name})، بينما المطلوب كان (${currentQuizGov.name}).`, 'error');
    }

    setTimeout(() => {
      setLastAnswerStatus(null);
      if (quizQuestionIndex + 1 >= 10) {
        setQuizCompleted(true);
      } else {
        setQuizQuestionIndex(prev => prev + 1);
      }
    }, 1200);
  };

  const resetQuiz = () => {
    setQuizQuestionIndex(0);
    setQuizScore(0);
    setQuizAnsweredCount(0);
    setLastAnswerStatus(null);
    setStreak(0);
    setQuizCompleted(false);
  };

  const handlePrintBlankMap = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'explore'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>استكشاف المحافظات ورؤية عمان 2040</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('quiz');
              resetQuiz();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'quiz'
                ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span>اختبار الخرائط الصماء التفاعلي 🇴🇲</span>
            <span className="text-[10px] bg-amber-400/20 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded-md font-bold">
              تفاعلي
            </span>
          </button>

          <button
            onClick={() => setActiveTab('print')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'print'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>طباعة خريطة صماء مع أسئلة وزارية</span>
          </button>
        </div>

        {/* Layer Controls */}
        <div className="flex items-center gap-2 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={showWaterways}
              onChange={e => setShowWaterways(e.target.checked)}
              className="accent-teal-600 rounded"
            />
            <span>الممرات البحرية ومضيق هرمز</span>
          </label>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={showVisionProjects}
              onChange={e => setShowVisionProjects(e.target.checked)}
              className="accent-teal-600 rounded"
            />
            <span>مشاريع 2040</span>
          </label>
        </div>
      </div>

      {/* QUIZ BANNER (If Quiz Tab Active) */}
      {activeTab === 'quiz' && (
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 text-white p-4 md:p-5 rounded-2xl shadow-md border border-emerald-500/30">
          {!quizCompleted ? (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-900 text-[11px] font-extrabold">
                    السؤال {quizQuestionIndex + 1} من 10
                  </span>
                  <span className="text-xs text-emerald-200">
                    الدرجة: {quizScore} نقطة • المتتالية: {streak} 🔥
                  </span>
                </div>
                <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                  <span>🎯 انقر على الخريطة الصماء لتحديد:</span>
                  <span className="text-amber-300 underline underline-offset-4 font-black">
                    {currentQuizGov.name}
                  </span>
                </h3>
                <p className="text-xs md:text-sm text-emerald-100/90 leading-relaxed bg-black/20 p-2.5 rounded-xl border border-white/10">
                  💡 <span className="font-semibold text-amber-200">المؤشر الجغرافي:</span> {currentClue}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={resetQuiz}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة البدء</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-black text-xl shadow-lg">
                🏆
              </div>
              <h3 className="text-lg md:text-xl font-black text-white">
                أحسنت صنعاً! أتممت اختبار الخريطة الصماء لسلطنة عمان
              </h3>
              <p className="text-sm text-emerald-100">
                النتيجة النهائية: <strong className="text-amber-300 text-base">{quizScore} / 100</strong> ({quizScore >= 80 ? 'مستوى كارتوجرافي استثنائي 🌟' : quizScore >= 50 ? 'مستوى جيد ومتقن 👍' : 'تحتاج للمزيد من التدريب على المحافظات 📚'})
              </p>
              <button
                onClick={resetQuiz}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs shadow-md transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة الاختبار لتعزيز الحفظ المكاني</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* MAIN ATLAS INTERACTIVE WORKSPACE */}
      {activeTab !== 'print' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* MAP CANVAS (7 COLS) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
            {/* Map Header & Legend */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
                <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                  {activeTab === 'quiz' ? 'خريطة سلطنة عمان الصماء (انقر لتحديد الإجابة)' : 'الخريطة التفاعلية لمحافظات سلطنة عُمان'}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                <span>المقياس التقريبي: 1:2,500,000</span>
                <span>•</span>
                <span>الإحداثيات: 16° - 26° N</span>
              </div>
            </div>

            {/* SVG Interactive Map Container */}
            <div className="relative aspect-[4/3] w-full bg-gradient-to-b from-sky-50/70 via-slate-50/40 to-emerald-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/30 rounded-2xl border border-sky-100 dark:border-slate-800/80 flex items-center justify-center p-2">
              {/* Compass Rose */}
              <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs p-2 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col items-center pointer-events-none">
                <div className="text-[10px] font-black text-rose-600">شمال (N) ▲</div>
                <div className="text-[8px] text-slate-400">اتجاه الخريطة</div>
              </div>

              {/* Waterway Indicators */}
              {showWaterways && (
                <>
                  {/* Strait of Hormuz */}
                  <div className="absolute top-6 right-24 md:right-32 text-center pointer-events-none">
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-blue-600/90 text-white shadow-xs flex items-center gap-1">
                      <Anchor className="w-2.5 h-2.5 text-amber-300" />
                      مضيق هرمز الاستراتيجي
                    </span>
                    <span className="text-[8px] text-blue-700 dark:text-blue-300 block mt-0.5">شريان الطاقة العالمي</span>
                  </div>

                  {/* Gulf of Oman */}
                  <div className="absolute top-28 right-8 text-center pointer-events-none rotate-12">
                    <span className="text-[10px] font-black text-sky-600/80 dark:text-sky-400/80 tracking-wider">
                      خـلـيـج عُــمــان
                    </span>
                  </div>

                  {/* Arabian Sea */}
                  <div className="absolute bottom-16 right-10 text-center pointer-events-none -rotate-12">
                    <span className="text-[11px] font-black text-cyan-600/80 dark:text-cyan-400/80 tracking-widest">
                      بـحـر الـعـرب والـمـحـيـط الـهـنـدي
                    </span>
                  </div>

                  {/* Empty Quarter */}
                  <div className="absolute bottom-28 left-8 text-center pointer-events-none opacity-60">
                    <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-400 tracking-wider">
                      صـحـراء الـربـع الـخـالـي
                    </span>
                  </div>
                </>
              )}

              {/* SVG MAP */}
              <svg
                viewBox="50 0 460 520"
                className="w-full h-full max-h-[500px] select-none filter drop-shadow-md"
              >
                {/* Background outline or subtle grids */}
                {showCoordinates && (
                  <g stroke="#94a3b8" strokeWidth="0.4" strokeDasharray="3 3" opacity="0.3">
                    <line x1="50" y1="100" x2="500" y2="100" />
                    <line x1="50" y1="200" x2="500" y2="200" />
                    <line x1="50" y1="300" x2="500" y2="300" />
                    <line x1="50" y1="400" x2="500" y2="400" />
                    <line x1="150" y1="0" x2="150" y2="520" />
                    <line x1="250" y1="0" x2="250" y2="520" />
                    <line x1="350" y1="0" x2="350" y2="520" />
                  </g>
                )}

                {/* Governorates Paths */}
                {OMAN_GOVERNORATES.map(gov => {
                  const isSelected = selectedGov?.id === gov.id;
                  const isHovered = hoveredGov?.id === gov.id;
                  const isQuizTarget = activeTab === 'quiz' && currentQuizGov.id === gov.id;

                  // Dynamic fill color depending on mode
                  let fillColor = gov.color;
                  if (activeTab === 'quiz') {
                    // Blank map mode
                    fillColor = '#cbd5e1'; // neutral slate
                    if (lastAnswerStatus && isQuizTarget) {
                      fillColor = '#10b981'; // highlight correct on answer
                    }
                  }

                  return (
                    <g key={gov.id} className="cursor-pointer transition-all duration-200">
                      <path
                        d={gov.path}
                        fill={fillColor}
                        fillOpacity={activeTab === 'quiz' ? (isHovered ? 0.9 : 0.6) : isSelected ? 0.95 : isHovered ? 0.85 : 0.7}
                        stroke={isSelected ? '#ffffff' : '#475569'}
                        strokeWidth={isSelected ? '2.5' : '1.2'}
                        strokeLinejoin="round"
                        onClick={() => handleGovClick(gov)}
                        onMouseEnter={() => setHoveredGov(gov)}
                        onMouseLeave={() => setHoveredGov(null)}
                        className="hover:filter hover:brightness-110 transition-all duration-150"
                      />

                      {/* Governorate Name Labels (Hidden in Quiz Mode) */}
                      {activeTab !== 'quiz' && (
                        <text
                          x={gov.labelPos.x}
                          y={gov.labelPos.y}
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                          pointerEvents="none"
                          className="select-none filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                        >
                          {gov.name.replace('محافظة ', '')}
                        </text>
                      )}

                      {/* Vision 2040 Landmark Pin Icons */}
                      {showVisionProjects && activeTab !== 'quiz' && (
                        <circle
                          cx={gov.labelPos.x}
                          cy={gov.labelPos.y + 11}
                          r="3"
                          fill="#facc15"
                          stroke="#1e293b"
                          strokeWidth="1"
                        />
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Quick Helper / Map Footer */}
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
                <span>
                  {activeTab === 'quiz'
                    ? 'انقر على القطاع الجغرافي المطابق للسؤال أعلاه لتسجيل النتيجة.'
                    : 'انقر على أي محافظة لعرض بطاقتها التنموية وأهداف رؤية عمان 2040.'}
                </span>
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                11 محافظة معتمدة 🇴🇲
              </span>
            </div>
          </div>

          {/* INSPECTOR & PEDAGOGICAL CARD (5 COLS) */}
          <div className="lg:col-span-5 space-y-4">
            {selectedGov ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-md shrink-0 shadow-xs"
                        style={{ backgroundColor: selectedGov.color }}
                      />
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        {selectedGov.name}
                      </h3>
                    </div>
                    <p className="text-xs text-teal-600 dark:text-teal-400 font-bold mt-1">
                      المركز الإداري: {selectedGov.capital} • {selectedGov.wilayatsCount} ولايات
                    </p>
                  </div>

                  <span className="text-[10px] font-extrabold px-2 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    رؤية عُمان 2040 🇴🇲
                  </span>
                </div>

                {/* Quick Spatial Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">المساحة الإجمالية</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-black">{selectedGov.areaKm2}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">تقدير السكان</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-black">{selectedGov.populationEstimate}</strong>
                  </div>
                </div>

                {/* Landscape description */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Mountain className="w-3.5 h-3.5 text-teal-600" />
                    <span>البيئة والتضاريس الطبيعية:</span>
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-teal-50/40 dark:bg-teal-950/20 p-2.5 rounded-xl border border-teal-100 dark:border-teal-900/40 leading-relaxed">
                    {selectedGov.landscape}
                  </p>
                </div>

                {/* Key Geographic Features */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-teal-600" />
                    <span>أهم المعالم والظواهر الجغرافية:</span>
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {selectedGov.keyFeatures.map((kf, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{kf}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Vision 2040 Projects */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>مشروعات رؤية عُمان 2040 والتنمية المستدامة:</span>
                  </span>
                  <div className="space-y-1.5">
                    {selectedGov.vision2040Projects.map((vp, i) => (
                      <div
                        key={i}
                        className="text-xs p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 text-slate-800 dark:text-slate-200 flex items-start gap-2"
                      >
                        <TrendingUp className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{vp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Wilayats List Chips */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400">ولايات المحافظة:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedGov.wilayats.map(w => (
                      <span
                        key={w}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        /* PRINTABLE BLANK MAP VIEW */
        <div className="bg-white text-slate-900 p-8 rounded-3xl border border-slate-300 shadow-lg space-y-6 max-w-4xl mx-auto print:p-0 print:border-none print:shadow-none">
          {/* Official Ministry Header */}
          <div className="text-center border-b-2 border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <div className="text-right text-xs">
                <p className="font-bold">سلطنة عُمان</p>
                <p>وزارة التربية والتعليم</p>
                <p>مادة: الدراسات الاجتماعية والجغرافيا</p>
              </div>
              <div className="text-center">
                <h2 className="text-lg font-black">نشاط تطبيقي: خريطة سلطنة عُمان الصماء</h2>
                <p className="text-xs text-slate-600">الصف: ................... • اسم الطالب: ...........................................</p>
              </div>
              <div className="text-left text-xs">
                <p>العام الدراسي: 2026 / 2027 م</p>
                <p>الدرجة: ( ..... / 10 )</p>
                <p>المشرف: ....................</p>
              </div>
            </div>
          </div>

          {/* Action Buttons (Hidden on print) */}
          <div className="flex items-center justify-end gap-3 print:hidden">
            <button
              onClick={handlePrintBlankMap}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs flex items-center gap-2 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة ورقة الاختبار فوراً</span>
            </button>
          </div>

          {/* Blank Map SVG for Print */}
          <div className="aspect-[4/3] w-full max-h-[420px] mx-auto border-2 border-dashed border-slate-400 p-4 rounded-xl flex items-center justify-center relative">
            {/* Compass */}
            <div className="absolute top-2 left-2 text-xs font-bold border border-slate-800 p-1">
              شمال (N) ▲
            </div>

            <svg viewBox="50 0 460 520" className="w-full h-full max-h-[380px]">
              {OMAN_GOVERNORATES.map((gov, idx) => (
                <g key={gov.id}>
                  <path
                    d={gov.path}
                    fill="#ffffff"
                    stroke="#1e293b"
                    strokeWidth="1.5"
                  />
                  <text
                    x={gov.labelPos.x}
                    y={gov.labelPos.y}
                    fill="#000000"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    ({idx + 1})
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Exam Questions Section */}
          <div className="space-y-3 pt-2 text-xs">
            <h4 className="font-black text-sm">الأسئلة التطبيقية: استعن بالخريطة الصماء أعلاه وأجب عما يلي:</h4>
            <ol className="list-decimal list-inside space-y-2.5 leading-relaxed text-slate-800">
              <li>
                اكتب في الجدول أدناه اسم المحافظة المشار إليها بالأرقام التالية:
                <div className="grid grid-cols-4 gap-2 mt-2 font-mono text-[11px]">
                  <div className="p-1 border border-slate-400">الرقم (1): ...................</div>
                  <div className="p-1 border border-slate-400">الرقم (5): ...................</div>
                  <div className="p-1 border border-slate-400">الرقم (7): ...................</div>
                  <div className="p-1 border border-slate-400">الرقم (11): ..................</div>
                </div>
              </li>
              <li>
                ظلل أو ضع دائرة حول المحافظة التي تشهد ظاهرة <strong>"خريف صلالة"</strong> وتعد أكبر المحافظات مساحة.
              </li>
              <li>
                بيّن على الخريطة بسهم موقع <strong>مضيق هرمز</strong> الاستراتيجي موضحاً أهميته الجيوسياسية.
              </li>
              <li>
                صل بخط بين المحافظة رقم (10) وأهم المشاريع الاقتصادية لرؤية عُمان 2040 القائمة بها (المنطقة الاقتصادية الخاصة بالدقم).
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};
