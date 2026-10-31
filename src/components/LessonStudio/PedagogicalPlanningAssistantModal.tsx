import React, { useState, useMemo } from 'react';
import {
  Brain,
  Users,
  Compass,
  CheckCircle2,
  Sparkles,
  Layers,
  Clock,
  ArrowRight,
  BookOpen,
  Target,
  FileCheck,
  ChevronRight,
  Plus,
  Copy,
  Check,
  HelpCircle,
  Lightbulb,
  Award,
  ShieldCheck,
  ExternalLink,
  Zap,
  RotateCcw,
  Sliders,
  Flame,
  Search,
  Eye
} from 'lucide-react';
import { GeneratedLesson, OmanVision2040Goal, PedagogicalTheoryItem } from '../../types/index.ts';

interface PedagogicalPlanningAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLesson: GeneratedLesson | null;
  availableVisionGoals: OmanVision2040Goal[];
  onApplyTemplateToCurrent: (template: Partial<GeneratedLesson>) => void;
  onCreateNewFromTemplate: (newLesson: GeneratedLesson) => void;
  onInsertProcedure: (procedure: {
    stepNumber: number;
    title: string;
    durationMinutes: number;
    teacherActivity: string;
    studentActivity: string;
    strategy: string;
  }) => void;
  initialTab?: 'templates' | 'think-pair-share' | 'vision2040' | 'guide';
}

interface ConstructivistTemplateDef {
  id: string;
  title: string;
  subjectName: string;
  gradeName: string;
  stageName: string;
  unitTitle: string;
  lessonTitle: string;
  durationMinutes: number;
  tagline: string;
  constructivistJustification: string;
  fiveEsBreakdown: {
    engage: { title: string; duration: number; teacher: string; student: string };
    explore: { title: string; duration: number; teacher: string; student: string };
    explain: { title: string; duration: number; teacher: string; student: string };
    elaborate: { title: string; duration: number; teacher: string; student: string };
    evaluate: { title: string; duration: number; teacher: string; student: string };
  };
  thinkPairShareScenario: {
    prompt: string;
    thinkMinutes: number;
    pairMinutes: number;
    shareMinutes: number;
    focusOutcome: string;
  };
  vision2040Outcomes: Array<{
    code: string;
    goalTitle: string;
    applicationInLesson: string;
  }>;
  objectives: {
    cognitive: string[];
    affective: string[];
    psychomotor: string[];
  };
  conceptsAndTerms: Array<{ term: string; definition: string }>;
  toolsAndResources: string[];
  homework: string;
  hook: string;
}

const PREBUILT_CONSTRUCTIVIST_TEMPLATES: ConstructivistTemplateDef[] = [
  {
    id: 'tmpl-const-01',
    title: 'الاستقصاء الجغرافي البنائي: مناخ سلطنة عُمان والأنواء المناخية',
    subjectName: 'الدراسات الاجتماعية',
    gradeName: 'الصف العاشر',
    stageName: 'التعليم الأساسي (الحلقة الثانية)',
    unitTitle: 'الغلاف الجوي وعناصره المناخية في سلطنة عُمان',
    lessonTitle: 'العوامل المؤثرة في مناخ سلطنة عُمان والأنواء المناخية المدارية',
    durationMinutes: 45,
    tagline: 'نموذج بنائي خماسي (5Es) يربط بين تحليل الخرائط المناخية وظواهر الأعاصير في بحر العرب وفق رؤية 2040',
    constructivistJustification: 'تنطلق هذه الخطة من بناء المعرفة الجغرافية الذاتية للمتعلم من خلال استثارة معارفه السابقة عن الأعاصير المدارية في السلطنة، ثم تمكينه من استكشاف الخرائط السطحية والأطلس المدرسي ذاتياً قبل تقديم التأطير العلمي.',
    fiveEsBreakdown: {
      engage: {
        title: '1. التهيئة والتنشيط الاستكشافي (Engage)',
        duration: 5,
        teacher: 'عرض مقطع مصور قصير (دقيقة واحدة) للأقمار الاصطناعية يرصد حركة منخفض مداري في بحر العرب، وطرح تساؤل استقصائي: "لماذا تشهد سواحل السلطنة الشرقية والجنوبية نشاطاً مدارياً بينما يسود الجفاف في الأجزاء الداخلية؟"',
        student: 'مشاهدة المقطع، وتدوين انطباعات أولية في بطاقة عصف ذهني سريعة، وربط المشاهدات بالخبرات الحياتية السابقة دون إصدار أحكام قطعية.'
      },
      explore: {
        title: '2. الاستكشاف والتجريب التعاوني (Explore)',
        duration: 12,
        teacher: 'توزيع بطاقات نشاط واستدعاء خريطة التوزيع المطرية ومسارات الرياح بالأطلس المدرسي، والتجول لتقديم السقالات التعليمية للطلبة دون تقديم إجابات مباشرة.',
        student: 'العمل في مجموعات ثنائية عبر استراتيجية (فكر-زاوج-شارك) لتحليل خريطة درجات حرارة المسطحات المائية في بحر العرب وعلاقتها بظاهرة خط التلاقي المداري (ITCZ).'
      },
      explain: {
        title: '3. التفسير وبناء المفهوم العلمي (Explain)',
        duration: 10,
        teacher: 'إدارة نقاش صفي استنتاجي، وتوجيه ممثلي المجموعات لتوضيح تفسيراتهم، وتأطير المصطلحات العلمية (الكتل الهوائية، التضاريس، التيارات البحرية، المدى الحراري).',
        student: 'صياغة المفاهيم الجغرافية بأسلوبهم الخاص، وتدوين التعميمات المستنتجة على المخطط الشمسي التفاعلي، وتصحيح أي مفاهيم بديلة كانت لديهم.'
      },
      elaborate: {
        title: '4. التوسيع والتطبيق المعمق (Elaborate)',
        duration: 12,
        teacher: 'طرح مسألة واقعية مرتبطة برؤية عُمان 2040: "كيف يسهم المركز الوطني للإنذار المبكر في صون الأرواح والمنشآت البيئية والاقتصادية؟"',
        student: 'تطبيق المفاهيم المدروسة على تدابير إدارة الطوارئ المناخية في السلطنة، واقتراح أفكار ابتكارية مجتمعية للحد من أثر السيول وجريان الأودية.'
      },
      evaluate: {
        title: '5. التقويم والتأمل الذاتي (Evaluate)',
        duration: 6,
        teacher: 'توزيع بطاقة خروج تفاعلية (Exit Ticket 3-2-1) واستعراض نموذج الإجابة التقويمية عبر الشاشة الذكية.',
        student: 'إنجاز بطاقة الخروج: 3 مفاهيم مكتسبة، أثران مناخيان على الأنشطة الاقتصادية، وتساؤل واحد للبحث الذاتي الإثرائي.'
      }
    },
    thinkPairShareScenario: {
      prompt: 'بالاعتماد على خريطة التيارات البحرية في المحيط الهندي: كيف يسهم تيار الصومال البارد صيفاً في خفض درجات الحرارة وتشكل سحب الخريف على سواحل ظفار؟',
      thinkMinutes: 2,
      pairMinutes: 3,
      shareMinutes: 5,
      focusOutcome: 'تفسير الظواهر المناخية الإقليمية وربط التضاريس والبحار بالطقس المحلي.'
    },
    vision2040Outcomes: [
      {
        code: 'V2040-ENV-01',
        goalTitle: 'نظم بيئية فاعلة ومتزنة ومرنة لحماية البيئة واستدامة مواردها الطبيعية',
        applicationInLesson: 'توعية الطلبة بالمرونة المناخية وإدارة الموارد المائية ومواجهة الكوارث الطبيعية عبر تحليل خرائط الرصد المداري في بحر العرب.'
      },
      {
        code: 'V2040-EDU-01',
        goalTitle: 'تعليم شامل وتعلم مستدام وبحث علمي يقود إلى مجتمع معرفي وقدرات وطنية منافسة',
        applicationInLesson: 'إكساب الطلبة مهارات التفكير العلمي والاستقصاء الجغرافي والتحليل المكاني للظواهر المناخية بدلاً من التلقين السردي.'
      }
    ],
    objectives: {
      cognitive: [
        'أن يحلل الطالب العوامل الجغرافية المؤثرة في مناخ سلطنة عُمان (الموقع الفلكي، التضاريس، المسطحات المائية).',
        'أن يفسر أسباب تكون السحب الخريفية في محافظة ظفار ونشاط الأعاصير في بحر العرب استناداً للخرائط المناخية.',
        'أن يستنتج دور التقنيات الحديثة والإنذار المبكر في الحد من مخاطر الأنواء المناخية في سلطنة عُمان.'
      ],
      affective: [
        'أن يقدّر الطالب جهود المركز الوطني للإنذار المبكر والدفاع المدني في حماية الأرواح والممتلكات الوطنية.',
        'أن يبدي الطالب وعياً مجتمعياً بأهمية الاستعداد للأزمات والتقيد بتعليمات السلامة العامة.'
      ],
      psychomotor: [
        'أن يقرأ الطالب خريطة الضغط الجوي والرياح في سلطنة عُمان بدقة مستعيناً بدليل الرموز والمفتاح الجغرافي.',
        'أن يرسم الطالب مخططاً انسيابياً يبين مراحل تطور المنخفض الجوي المداري إلى إعصار مداري.'
      ]
    },
    conceptsAndTerms: [
      { term: 'خط التلاقي المداري (ITCZ)', definition: 'نطاق منخفض الضغط يلتقي فيه الهواء المداري من نصفي الكرة الأرضية ويتسبب بحالات عدم الاستقرار الجوي.' },
      { term: 'تيار الصومال البارد', definition: 'تيار بحري موسمي ينشأ صيفاً في المحيط الهندي ويسهم في تبريد المياه الساحلية وتكون ضباب خريف ظفار.' },
      { term: 'الأنواء المناخية الاستثنائية', definition: 'حالات جوية غير معتادة كالعواصف والأعاصير المدارية المرافقة لرياح شديدة وأمطار طوفانية.' }
    ],
    toolsAndResources: [
      'الأطلس المدرسي لسلطنة عُمان والعالم (الصفحات المناخية)',
      'السبورة التفاعلية / شاشة العرض الرقمية لعرض صور الأقمار الاصطناعية',
      'أوراق عمل نشاط (فكر-زاوج-شارك) وبطاقات الاستقصاء الثنائي',
      'بطاقات الخروج التكوينية (Exit Tickets)'
    ],
    homework: 'توثيق تقرير موجز من صفحة واحدة حول أبرز إعصار مداري أثر على سلطنة عُمان ودروس إدارة المخاطر المستفادة منه.',
    hook: 'عرض مقطع سريع لحركة السحب المدارية عبر رادارات الطقس العمانية مع تساؤل استقصائي يثير الفضول والتأمل.'
  },
  {
    id: 'tmpl-const-02',
    title: 'التحليل المكاني البنائي: نظم المعلومات الجغرافية (GIS) والخرائط الذكية',
    subjectName: 'الجغرافيا والتقنيات الحديثة',
    gradeName: 'الصف الحادي عشر',
    stageName: 'التعليم ما بعد الأساسي',
    unitTitle: 'نظم المعلومات الجغرافية وتطبيقاتها المكانية',
    lessonTitle: 'بناء النماذج المكانية وتحليل الطبقات الرقمية في بيئة GIS',
    durationMinutes: 45,
    tagline: 'نموذج بنائي رقمي يدمج التعلم القائم على الاستكشاف الذاتي لطبقات الخريطة الرقمية مع نشاط فكر-زاوج-شارك لمهارات المستقبل',
    constructivistJustification: 'يتيح للطلبة بناء المفاهيم الرقمية من خلال الممارسة المباشرة لدمج الطبقات الخرائطية واكتشاف التراكب المكاني بأنفسهم، مما يحول الطالب من متلقٍ للتقنية إلى منتج ومحلل للمعرفة الجغرافية.',
    fiveEsBreakdown: {
      engage: {
        title: '1. التهيئة والتنشيط (Engage)',
        duration: 5,
        teacher: 'طرح مشكلة تخطيط واقعية: "ترغب وزارة الصحة في اختيار الموقع الأمثل لإنشاء مركز صحي للطوارئ في مسقط يخدم 5 أحياء سكنية دون أن يتأثر بمجاري الأودية. ما البيانات التي تحتاجونها لاتخاذ القرار؟"',
        student: 'تفكير تأملي حر ومناقشة المتطلبات المكانية، وتحديد أنواع البيانات (مخططات السكان، شبكات الطرق، مجاري الأودية، المستشفيات الحالية).'
      },
      explore: {
        title: '2. الاستكشاف والنمذجة (Explore)',
        duration: 12,
        teacher: 'تزويد المجموعات بنموذج رقمي مبسط يحتوي على 3 طبقات مكانية شفافة وموجهة (مواقع الأودية، الطرق الرئيسية، الكثافة السكانية).',
        student: 'ممارسة استراتيجية فكر-زاوج-شارك في مطابقة الطبقات يدوياً أو رقمياً على الأجهزة اللوحية لاستكشاف مناطق التقاطع ومساحات الحظر.'
      },
      explain: {
        title: '3. التفسير والمفاهيم (Explain)',
        duration: 10,
        teacher: 'تنظيم عرض المجموعات لمواقعهم المقترحة، واستنتاج مفهوم التحليل المكاني بالتراكب (Overlay Analysis) ونماذج البيانات النقطية والخطية والمساحية.',
        student: 'شرح مبررات اختيار الموقع أمام الزملاء، وربط القرار بمفاهيم دقة البيانات وصلاحية المعايير المعتمدة.'
      },
      elaborate: {
        title: '4. التوسيع والتطبيق في الواقع العماني (Elaborate)',
        duration: 12,
        teacher: 'ربط التدريب بمبادرة "البنية الوطنية للبيانات الجغرافية والمكانية (NSDI)" والمدن الذكية في رؤية عمان 2040.',
        student: 'اقتراح تطبيق مماثل لإدارة النفايات أو مسارات النقل المدرسي الذكي في ولايتهم بناءً على تحليل الطبقات المكانية.'
      },
      evaluate: {
        title: '5. التقويم والتأمل (Evaluate)',
        duration: 6,
        teacher: 'طرح سؤال تقويمي فوري عبر بطاقة استجابة ذكية لقياس فهم الفارق بين البيانات المكانية والبيانات الوصفية.',
        student: 'تصنيف 4 عناصر بيانات جغرافية معطاة إلى (مكانية / وصفية) وتحديد دور كل منها في اتخاذ القرار.'
      }
    },
    thinkPairShareScenario: {
      prompt: 'إذا طُلب منك إضافة طبقة رابعة لخريطة تخطيط المركز الصحي، ما هي الطبقة الأكثر إلحاحاً؟ ولماذا؟ فكر دقيقتين بمفردك، ثم ناقش زميلك، ثم جهز إجابة مجموعتكم.',
      thinkMinutes: 2,
      pairMinutes: 3,
      shareMinutes: 5,
      focusOutcome: 'التفكير التحليلي الناقد في معايير اتخاذ القرار التخطيطي المكاني.'
    },
    vision2040Outcomes: [
      {
        code: 'V2040-TECH-01',
        goalTitle: 'منظومة ابتكار وتقنية وطنية متكاملة ومجتمع معرفي رقمي',
        applicationInLesson: 'تدريب الطلبة على توظيف التقنيات الجيومكانية والخرائط الذكية لبناء قدرات وطنية قادرة على مواكبة الثورة الصناعية الرابعة.'
      },
      {
        code: 'V2040-EDU-01',
        goalTitle: 'تعليم شامل وتعلم مستدام وبحث علمي يقود إلى مجتمع معرفي وقدرات وطنية منافسة',
        applicationInLesson: 'تنمية مهارات التفكير الحسابي والمكاني وحل المشكلات التخطيطية الحقيقية.'
      }
    ],
    objectives: {
      cognitive: [
        'أن يشرح الطالب مفهوم تراكب الطبقات المكانية (Spatial Overlay) في برمجيات نظم المعلومات الجغرافية.',
        'أن يميز الطالب بين البيانات المكانية (Spatial Data) والبيانات الوصفية (Attribute Data).',
        'أن يحدد الطالب المعايير المكانية المثلى لتوطين الخدمات العامة في المدن العمانية.'
      ],
      affective: [
        'أن يقدر الطالب دور التقنيات الحديثة في التخطيط العمراني السليم ودعم اتخاذ القرار الوطني.',
        'أن يتحمس الطالب لتعلم أدوات التحليل الجغرافي الرقمي بوصفها مهارات واعدة لسوق العمل.'
      ],
      psychomotor: [
        'أن يركب الطالب طبقات رقمية متعددة لاستخلاص خريطة ملائمة مكانية بدقة.',
        'أن يقرأ جدول البيانات الوصفية المرتبط بظاهرة جغرافية ويستخرج المعلومات المطلوبة بسرعة.'
      ]
    },
    conceptsAndTerms: [
      { term: 'تراكب الطبقات (Spatial Overlay)', definition: 'عملية دمج طبقتين جغرافيتين أو أكثر لإنشاء طبقة جديدة تحتوي على السمات المشتركة وفق معايير محددة.' },
      { term: 'البيانات الوصفية (Attribute Data)', definition: 'معلومات غير مكانية تصف خصائص الظاهرة الجغرافية مثل اسم المستشفى، عدد الأسرة، والمالك.' },
      { term: 'البنية الوطنية للبيانات المكانية (NSDI)', definition: 'منظومة وطنية متكاملة في عُمان لمشاركة ونشر البيانات والخرائط الجغرافية بين المؤسسات الحكومية.' }
    ],
    toolsAndResources: [
      'برمجيات ونماذج GIS تفاعلية أو طبقات شفافة لتمثيل الخرائط الرقمية',
      'أجهزة لوحية ذكية متصلة بالبوابة التعليمية',
      'دليل الطالب للتطبيقات المكانية الحديثة',
      'بطاقات مصفوفة اتخاذ القرار التخطيطي'
    ],
    homework: 'إعداد قائمة بـ 5 طبقات مكانية تلزم لإنشاء محطة لتوليد الطاقة الشمسية في محافظة الظاهرة.',
    hook: 'تحدي تخطيط مكاني مشوق لعلاج أزمة مرورية أو توطين مرفق خدمي عبر شاشة الخريطة الذكية.'
  },
  {
    id: 'tmpl-const-03',
    title: 'التنمية المستدامة والتنويع الاقتصادي: مقومات الاستثمار في سلطنة عُمان',
    subjectName: 'هذا وطني',
    gradeName: 'الصف الثاني عشر',
    stageName: 'التعليم ما بعد الأساسي',
    unitTitle: 'عُمان والتنمية المستدامة واستشراف المستقبل',
    lessonTitle: 'آفاق التنويع الاقتصادي والقطاعات الواعدة في ظل رؤية عُمان 2040',
    durationMinutes: 45,
    tagline: 'نموذج بنائي اجتماعي تفاعلي يبني وعي الطالب بمسارات الاقتصاد الوطني (اللوجستيات، الهيدروجين الأخضر، السياحة)',
    constructivistJustification: 'يرتكز على النظرية البنائية الاجتماعية (Vygotsky) حيث يتشارك الطلبة في استكشاف مؤشرات التنمية العمانية ومحاكاة دور المستشارين الاقتصاديين في بيئة تعلم تعاونية ثنائية وجماعية.',
    fiveEsBreakdown: {
      engage: {
        title: '1. التهيئة وعصف الأفكار (Engage)',
        duration: 5,
        teacher: 'عرض مقارنة إحصائية تفاعلية لمساهمة القطاعات غير النفطية بين عامي 2010 و2024 وسؤال الطلبة: "كيف تحقق السلطنة الاستدامة المالية دون الاعتماد الأحادي على النفط؟"',
        student: 'تأمل الأرقام، وتوليد أفكار أولية حول القطاعات البديلة التي تمتلك فيها عُمان ميزة نسبية وتنافسية عالمية.'
      },
      explore: {
        title: '2. الاستكشاف والبحث التعاوني (Explore)',
        duration: 12,
        teacher: 'توزيع ملفات دراسة حالة لمشاريع وطنية كبرى (المنطقة الاقتصادية الخاصة بالدقم، مجمعات الهيدروجين الأخضر بمحوت وظفار، الموانئ اللوجستية).',
        student: 'تطبيق نشاط فكر-زاوج-شارك لاستخراج المقومات الطبيعية والموقع الجغرافي الذي جعل هذه المشاريع واعدة عالمياً.'
      },
      explain: {
        title: '3. التفسير والمفاهيم الاقتصادية (Explain)',
        duration: 10,
        teacher: 'مساعدة الطلبة على صياغة مفهوم "سلاسل القيمة المضافة"، و"التنويع الاقتصادي"، و"الميزة النسبية الجغرافية" وتثبيتها.',
        student: 'ربط المعارف الجديدة بالبيئة العمانية وعرض استنتاجات المجموعات الثنائية ومناقشتها بحجج علمية موثقة.'
      },
      elaborate: {
        title: '4. التوسيع والتطبيق المستقبلي (Elaborate)',
        duration: 12,
        teacher: 'تكليف الفرق بابتكار فكرة مشروع شبابي عماني مستدام يخدم أحد القطاعات الواعدة ويتكامل مع رؤية عمان 2040.',
        student: 'تصميم بطاقة نموذج عمل مختصرة للمشروع المقترح تراعي الحفاظ على البيئة واستثمار الموارد المحلية.'
      },
      evaluate: {
        title: '5. التقويم والتأمل الختامي (Evaluate)',
        duration: 6,
        teacher: 'تقييم العروض بموجب سلم تقدير لفظي (Rubric) يتضمن: الجدة، مواءمة الرؤية، والاستدامة البيئية.',
        student: 'تقييم ذاتي وتقييم أقران للمشروعات المعروضة واختيار الفكرة الأكثر جاهزية للتنفيذ.'
      }
    },
    thinkPairShareScenario: {
      prompt: 'ما الميزة الجغرافية الاستراتيجية التي تجعل موانئ سلطنة عُمان (الدقم، صحار، صلالة) بديلاً تجارياً عالمياً متفوقاً يتجنب مضيق هرمز ومخاطره الملاحية؟',
      thinkMinutes: 2,
      pairMinutes: 3,
      shareMinutes: 5,
      focusOutcome: 'إدراك القيمة الجيوسياسية والاقتصادية لموقع السلطنة في حركة التجارة العالمية.'
    },
    vision2040Outcomes: [
      {
        code: 'V2040-ECON-01',
        goalTitle: 'اقتصاد متنوع ومرن يقوده القطاع الخاص ويقوم على المعرفة والتكنولوجيا',
        applicationInLesson: 'تمكين الطلبة من فهم محركات النمو الاقتصادي الجديد والقطاعات الواعدة ودور الشباب في قيادة الابتكار الاستثماري.'
      },
      {
        code: 'V2040-CIT-01',
        goalTitle: 'مواطنة وهُوِيّة واعتزاز بالتراث وثقافة وقيم وطنية راسخة',
        applicationInLesson: 'غرس روح المبادرة الوطنية والمسؤولية المجتمعية تجاه تنمية الوطن والاعتزاز بمنجزات النهضة المتجددة.'
      }
    ],
    objectives: {
      cognitive: [
        'أن يحلل الطالب ركائز التنويع الاقتصادي في سلطنة عُمان ومستهدفات رؤية عُمان 2040.',
        'أن يربط الطالب بين المقومات الجغرافية الطبيعية ومشاريع الهيدروجين الأخضر والطاقة المتجددة في عُمان.',
        'أن يوضح دور الموانئ العمانية والمناطق الحرة في ربط الأسواق الآسيوية والأوروبية والأفريقية.'
      ],
      affective: [
        'أن ينمي الطالب مشاعر الفخر بالنهضة المتجددة والمشاريع الاستراتيجية العملاقة في السلطنة.',
        'أن يتبنى الطالب سلوكيات ترشيد الاستهلاك والاستدامة الاقتصادية في حياته اليومية.'
      ],
      psychomotor: [
        'أن يحدد الطالب على خريطة السلطنة الاقتصادية مواقع الموانئ الحرة والمناطق الصناعية بدقة.',
        'أن يرسم الطالب مخططاً هيكلياً يوضح علاقة سلاسل الإمداد اللوجستي بالصناعات التحويلية.'
      ]
    },
    conceptsAndTerms: [
      { term: 'التنويع الاقتصادي', definition: 'استراتيجية تنموية تهدف إلى توسيع مصادر الدخل القومي وتقليل الاعتماد على مورد أحادي كالنفط.' },
      { term: 'الهيدروجين الأخضر', definition: 'طاقة نظيفة تُنتج عبر فصل الماء باستخدام الكهرباء المولدة من مصادر متجددة (الشمس والرياح) وتعتبر عُمان رائدة عالمياً فيها.' },
      { term: 'الميزة التنافسية الجغرافية', definition: 'الخصائص الفريدة للموقع الجغرافي التي تجعل الدولة قادرة على تقديم خدمات لوجستية وتجارية بتكلفة وأمان أعلى.' }
    ],
    toolsAndResources: [
      'وثيقة محاور وأولويات رؤية عُمان 2040 الاقتصادية المعتمدة',
      'خريطة سلطنة عُمان الاستثمارية واللوجستية',
      'فيديوهات قصيرة من جهاز الاستثمار العماني والمناطق الاقتصادية',
      'مصفوفة بطاقات نشاط فكر-زاوج-شارك الاقتصادية'
    ],
    homework: 'كتابة مقال تحليلي موجز حول دور الطاقة المتجددة في تحقيق الحياد الصفري الكربوني لعُمان بحلول عام 2050.',
    hook: 'مقارنة إحصائية ملهمة لأسرع القطاعات نمواً في عُمان تثير طموح الطلبة وتوجهاتهم المستقبلية.'
  },
  {
    id: 'tmpl-const-04',
    title: 'الهوية والتراث الحضاري: الريادة البحرية والتواصل الحضاري العماني',
    subjectName: 'الدراسات الاجتماعية',
    gradeName: 'الصف التاسع',
    stageName: 'التعليم الأساسي (الحلقة الثانية)',
    unitTitle: 'عُمان عبر التاريخ: التواصل الحضاري والريادة البحرية',
    lessonTitle: 'عُمان وحضارات الشرق القديم ودور الملاحة البحرية في نشر السلام والتجارة',
    durationMinutes: 45,
    tagline: 'نموذج بنائي أصيل ينمي التفكير التاريخي الناقد وتحليل المصادر الأولية والمواطنة العمانية عبر التعلم التعاوني الثنائي',
    constructivistJustification: 'ينطلق من فحص الشواهد الأثرية والنصوص والخرائط التاريخية واستخلاص الدلائل، ليعيد المتعلم بناء قصة النهضة البحرية العمانية وتكوين وعيه الوطني استناداً إلى أدلة مادية ملموسة.',
    fiveEsBreakdown: {
      engage: {
        title: '1. التهيئة والتحفيز (Engage)',
        duration: 5,
        teacher: 'عرض صورة لقطعة أثرية (فخار عماني وعملات قديمة وُجدت في الصين وسواحل شرق أفريقيا) وسؤال الصف: "ما الذي أوصل هذه الآثار العمانية لآلاف الكيلومترات قبل أكثر من ألف عام؟"',
        student: 'تأمل الصورة وتدوين فرضيات أولية حول الوسائل والمسارات وطبيعة العلاقات الدبلوماسية والتجارية للأسلاف.'
      },
      explore: {
        title: '2. استكشاف الوثائق والخرائط الملاحية (Explore)',
        duration: 12,
        teacher: 'تزويد أزواج الطلبة بنصوص مقتبسة من كتابات الرحالة ومخططات خطوط الملاحة وموسوعة "أحمد بن ماجد".',
        student: 'تطبيق نشاط فكر-زاوج-شارك لدراسة مواعيد الرياح الموسمية (المونسون) وكيف طوعها الملاحون العمانيون لصالح رحلاتهم.'
      },
      explain: {
        title: '3. التفسير وبناء المفاهيم الحضارية (Explain)',
        duration: 10,
        teacher: 'إرشاد الطلبة لاستنتاج مفاهيم: (التواصل الحضاري، الدبلوماسية البحرية، سفينة صحار، ريادة مجان في تجارة النحاس واللبان).',
        student: 'تقديم قراءات تاريخية معللة، وتفنيد الصور النمطية، والاعتزاز بأخلاق التجار العمانيين ودورهم في نشر الإسلام بالتسامح وحسن التعامل.'
      },
      elaborate: {
        title: '4. التوسيع والمواطنة المعاصرة (Elaborate)',
        duration: 12,
        teacher: 'ربط التاريخ بالواقع: "كيف تعزز الدبلوماسية العمانية المعاصرة سياسة الحياد الإيجابي وصنع السلام المستلهمة من إرثنا التاريخي؟"',
        student: 'مناقشة دور المواطن العماني المعاصر سفيراً لبلاده بأخلاقه واعتزازه بهويته، وكتابة ميثاق مصغر لسفير عُمان الطلابي.'
      },
      evaluate: {
        title: '5. التقويم والتأمل التاريخي (Evaluate)',
        duration: 6,
        teacher: 'تطبيق بطاقة تقويم مفاهيمي تتضمن سؤال اختيار من متعدد وسؤالاً تفسيرياً مفتوحاً.',
        student: 'إجابة الأسئلة وتقديم تأمل ذاتي حول ما يعنيه الانتماء لأمة بحرية عظيمة كعُمان.'
      }
    },
    thinkPairShareScenario: {
      prompt: 'استنتج من النصوص التاريخية: ما القيم الإنسانية والأخلاقية التي جعلت أهالي كانتون والموانئ الهندية يثقون في التجار العمانيين دون غيرهم؟',
      thinkMinutes: 2,
      pairMinutes: 3,
      shareMinutes: 5,
      focusOutcome: 'ربط الريادة الاقتصادية والتجارية بالمنظومة القيمية والأخلاقية للمواطنة العمانية.'
    },
    vision2040Outcomes: [
      {
        code: 'V2040-CIT-01',
        goalTitle: 'مواطنة وهُوِيّة واعتزاز بالتراث وثقافة وقيم وطنية راسخة',
        applicationInLesson: 'ترسيخ الفخر بالهوية الوطنية العمانية المستندة إلى تاريخ بحري عريق وقيم إنسانية متسامحة تبرز مكانة السلطنة عالمياً.'
      },
      {
        code: 'V2040-EDU-01',
        goalTitle: 'تعليم شامل وتعلم مستدام وبحث علمي يقود إلى مجتمع معرفي وقدرات وطنية منافسة',
        applicationInLesson: 'تطوير مهارات التفكير التاريخي الناقد وتحليل الوثائق ومقارنة المصادر الأولية والثانوية.'
      }
    ],
    objectives: {
      cognitive: [
        'أن يستدل الطالب على ريادة عُمان البحرية عبر العصور من خلال الشواهد الأثرية والمصادر التاريخية المكتوبة.',
        'أن يوضح دور الرياح الموسمية في تنظيم حركة الأساطيل التجارية العمانية نحو الهند وسواحل أفريقيا والصين.',
        'أن يبين أثر التجار العمانيين في نشر القيم الإسلامية السمحة في البلدان التي وصلوا إليها.'
      ],
      affective: [
        'أن يعتز الطالب بالموروث الحضاري والتاريخي العماني ودوره في إثراء الحضارة الإنسانية.',
        'أن يلتزم الطالب بالقيم الأخلاقية الرفيعة التي مثلت السمة البارزة للشخصية العمانية عبر التاريخ.'
      ],
      psychomotor: [
        'أن يرسم الطالب على خريطة صماء للمحيط الهندي المسارات البحرية التاريخية للسفن العمانية وموانئها الرئيسية.',
        'أن يحلل الطالب نصاً تاريخياً مقتبساً ويستخلص منه 3 دلائل على الازدهار التجاري العماني.'
      ]
    },
    conceptsAndTerms: [
      { term: 'التواصل الحضاري', definition: 'عملية التأثير والتأثر المتبادل بين الحضارات الإنسانية في شتى المجالات الفكرية والتجارية والعمرانية.' },
      { term: 'ريادة مجان البحرية', definition: 'النشاط الملاحي البارز لحضارة عُمان القديمة في تصدير النحاس واللبان لحضارات ما بين النهرين ووادي السند.' },
      { term: 'سفينة صحار التاريخية', definition: 'رمز للريادة الملاحية أعيد بناؤها والإبحار بها عام 1980 لإحياء ذكرى رحلة الملاحين العمانيين إلى ميناء كانتون الصيني.' }
    ],
    toolsAndResources: [
      'صور رقمية ووثائق تاريخية من هيئة الوثائق والمحفوظات الوطنية',
      'أطلس التاريخ العماني المعتمد لوزارة التربية والتعليم',
      'نموذج خريطة الملاحة في المحيط الهندي صماء للتدريب العملي',
      'بطاقات التعلم الثنائي (فكر-زاوج-شارك)'
    ],
    homework: 'إعداد إنفوجرافيك أو بطاقة تعريفية لأحد الموانئ العمانية التاريخية (سمهرم، قلهات، صحار) وأهميته التجارية.',
    hook: 'عرض وثيقة تاريخية نادرة تكشف عن رسالة تجارية قديمة وتحدي الطلبة لفك أسرار محتواها.'
  }
];

export const PedagogicalPlanningAssistantModal: React.FC<PedagogicalPlanningAssistantModalProps> = ({
  isOpen,
  onClose,
  selectedLesson,
  availableVisionGoals,
  onApplyTemplateToCurrent,
  onCreateNewFromTemplate,
  onInsertProcedure,
  initialTab = 'templates'
}) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'think-pair-share' | 'vision2040' | 'guide'>(initialTab);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(PREBUILT_CONSTRUCTIVIST_TEMPLATES[0].id);
  const [copiedText, setCopiedText] = useState(false);

  // Think-Pair-Share interactive builder state
  const [tpsPhaseTopic, setTpsPhaseTopic] = useState('تهيئة استكشافية وعصف ذهني');
  const [tpsQuestion, setTpsQuestion] = useState(
    'بالاعتماد على الخريطة المعروضة: ما العلاقة المكانية بين تضاريس عُمان وتوزيع الكثافة السكانية والأنشطة الاقتصادية؟'
  );
  const [tpsThinkTime, setTpsThinkTime] = useState(2);
  const [tpsPairTime, setTpsPairTime] = useState(3);
  const [tpsShareTime, setTpsShareTime] = useState(5);
  const [tpsRecordMethod, setTpsRecordMethod] = useState('تدوين فردي ثم ورقة ثنائية مشتركة ثم متحدث الزوج');
  const [tpsOutcomeTarget, setTpsOutcomeTarget] = useState('بناء التفكير المكاني وتدريب الطلبة على الحوار التعاوني المسند بالدليل');

  const selectedTemplate = useMemo(() => {
    return PREBUILT_CONSTRUCTIVIST_TEMPLATES.find(t => t.id === selectedTemplateId) || PREBUILT_CONSTRUCTIVIST_TEMPLATES[0];
  }, [selectedTemplateId]);

  // Compute Vision 2040 Audit for active lesson or template
  const visionAudit = useMemo(() => {
    const target = selectedLesson || {
      title: selectedTemplate.title,
      lessonTitle: selectedTemplate.lessonTitle,
      unitTitle: selectedTemplate.unitTitle,
      subjectName: selectedTemplate.subjectName,
      vision2040Goals: selectedTemplate.vision2040Outcomes,
      procedures: Object.values(selectedTemplate.fiveEsBreakdown).map((p, idx) => ({
        stepNumber: idx + 1,
        title: p.title,
        durationMinutes: p.duration,
        teacherActivity: p.teacher,
        studentActivity: p.student,
        strategy: 'النظرية البنائية'
      }))
    };

    const combinedText = `
      ${target.lessonTitle || ''} 
      ${target.unitTitle || ''} 
      ${target.subjectName || ''} 
      ${(target.vision2040Goals || []).map((g: any) => g.code + ' ' + g.goalTitle + ' ' + g.applicationInLesson).join(' ')}
      ${(target.procedures || []).map((p: any) => p.teacherActivity + ' ' + p.studentActivity + ' ' + p.title).join(' ')}
    `.toLowerCase();

    const indicators = [
      {
        code: 'V2040-EDU-01',
        title: 'التعليم الشامل وبناء مهارات القرن الـ21',
        description: 'إكساب الطلبة مهارات البحث والاستقصاء والتفكير التحليلي والتعاون الصفي',
        matched: combinedText.includes('استقصاء') || combinedText.includes('تفكير') || combinedText.includes('تعلم') || combinedText.includes('فكر') || combinedText.includes('edu'),
        actionAdvice: 'تم التحقق: يتضمن الدرس أنشطة استقصائية وتفكير مهارات عليا.'
      },
      {
        code: 'V2040-TECH-01',
        title: 'الابتكار والتحول الرقمي والتقنيات المكانية',
        description: 'توظيف الخرائط الرقمية ونظم المعلومات الجغرافية والأجهزة الذكية في التعلم',
        matched: combinedText.includes('خريط') || combinedText.includes('رقمي') || combinedText.includes('gis') || combinedText.includes('أطلس') || combinedText.includes('تقني') || combinedText.includes('tech'),
        actionAdvice: 'توظيف التقنيات الجغرافية والخرائط الذكية لتعزيز الابتكار المعرفي.'
      },
      {
        code: 'V2040-ENV-01',
        title: 'الاستدامة البيئية وصون الموارد الطبيعية',
        description: 'توعية المتعلمين بالمناخ، الأنواء المدارية، الموارد المائية، والطاقة النظيفة في عُمان',
        matched: combinedText.includes('بيئ') || combinedText.includes('مناخ') || combinedText.includes('ماء') || combinedText.includes('طبيع') || combinedText.includes('طاقة') || combinedText.includes('env'),
        actionAdvice: 'التركيز على حماية النظم البيئية العمانية ومواجهة التغيرات المناخية.'
      },
      {
        code: 'V2040-CIT-01',
        title: 'المواطنة والاعتزاز بالهوية والتراث العماني',
        description: 'ترسيخ الانتماء الوطني والافتخار بتاريخ عُمان البحري والحضاري وقيم التسامح',
        matched: combinedText.includes('عمان') || combinedText.includes('وطن') || combinedText.includes('تاريخ') || combinedText.includes('هوي') || combinedText.includes('تراث') || combinedText.includes('cit'),
        actionAdvice: 'ربط مخرجات الدرس بالقيم الوطنية والتراث العماني الأصيل.'
      },
      {
        code: 'V2040-ECON-01',
        title: 'التنويع الاقتصادي والنمو المستدام',
        description: 'فهم مقومات الاستثمار، اللوجستيات، والمزايا التنافسية الاقتصادية للسلطنة',
        matched: combinedText.includes('اقتصاد') || combinedText.includes('تنوع') || combinedText.includes('ميناء') || combinedText.includes('لوجست') || combinedText.includes('استثمار') || combinedText.includes('صناع'),
        actionAdvice: 'إبراز الميزة التنافسية لموقع عُمان الجغرافي والفرص الاقتصادية الواعدة.'
      }
    ];

    const matchedCount = indicators.filter(i => i.matched).length;
    const scorePercent = Math.round((matchedCount / indicators.length) * 100);

    return {
      indicators,
      matchedCount,
      totalCount: indicators.length,
      scorePercent
    };
  }, [selectedLesson, selectedTemplate]);

  if (!isOpen) return null;

  const handleApplyTemplate = () => {
    const procedures = [
      {
        stepNumber: 1,
        title: selectedTemplate.fiveEsBreakdown.engage.title,
        durationMinutes: selectedTemplate.fiveEsBreakdown.engage.duration,
        teacherActivity: selectedTemplate.fiveEsBreakdown.engage.teacher,
        studentActivity: selectedTemplate.fiveEsBreakdown.engage.student,
        strategy: 'النظرية البنائية: التهيئة والتنشيط (Engage)'
      },
      {
        stepNumber: 2,
        title: selectedTemplate.fiveEsBreakdown.explore.title,
        durationMinutes: selectedTemplate.fiveEsBreakdown.explore.duration,
        teacherActivity: selectedTemplate.fiveEsBreakdown.explore.teacher,
        studentActivity: selectedTemplate.fiveEsBreakdown.explore.student,
        strategy: 'النظرية البنائية: الاستكشاف (Explore) عبر فكر-زاوج-شارك'
      },
      {
        stepNumber: 3,
        title: selectedTemplate.fiveEsBreakdown.explain.title,
        durationMinutes: selectedTemplate.fiveEsBreakdown.explain.duration,
        teacherActivity: selectedTemplate.fiveEsBreakdown.explain.teacher,
        studentActivity: selectedTemplate.fiveEsBreakdown.explain.student,
        strategy: 'النظرية البنائية: التفسير وبناء المفهوم (Explain)'
      },
      {
        stepNumber: 4,
        title: selectedTemplate.fiveEsBreakdown.elaborate.title,
        durationMinutes: selectedTemplate.fiveEsBreakdown.elaborate.duration,
        teacherActivity: selectedTemplate.fiveEsBreakdown.elaborate.teacher,
        studentActivity: selectedTemplate.fiveEsBreakdown.elaborate.student,
        strategy: 'النظرية البنائية: التوسيع والتطبيق (Elaborate)'
      },
      {
        stepNumber: 5,
        title: selectedTemplate.fiveEsBreakdown.evaluate.title,
        durationMinutes: selectedTemplate.fiveEsBreakdown.evaluate.duration,
        teacherActivity: selectedTemplate.fiveEsBreakdown.evaluate.teacher,
        studentActivity: selectedTemplate.fiveEsBreakdown.evaluate.student,
        strategy: 'النظرية البنائية: التقويم والتأمل (Evaluate)'
      }
    ];

    const pedagogicalFramework = {
      theories: [
        {
          theoryId: 'constructivism',
          name: 'النظرية البنائية (Constructivism - دورة 5Es)',
          justification: selectedTemplate.constructivistJustification,
          classroomApplication: 'تفعيل مراحل دورة التعلم الخماسية: التهيئة الاستكشافية، الاستقصاء التعاوني، التفسير الصفي، التوسيع، والتقويم التكويني الذاتي.'
        }
      ],
      selectedStrategies: [
        'النظرية البنائية (Constructivism)',
        'التعلم التعاوني: فكر - زاوج - شارك (Think-Pair-Share)',
        'الاستقصاء الجغرافي وحل المشكلات',
        'تحليل الخرائط والمصادر الرقمية'
      ],
      activeLearningMechanisms: 'الحوار الثنائي المنظم، السقالات التعليمية، التدريب بالأقران، والتقويم التكويني ببطاقات الخروج.',
      vision2040PedagogicalLink: 'تحقيق مخرجات رؤية عمان 2040 عبر الربط المباشر بين المفاهيم ومستهدفات الاستدامة والابتكار والمواطنة الفاعلة.',
      teachersGuideReference: 'دليل المعلم المعتمد لوزارة التربية والتعليم بسلطنة عُمان لمناهج الدراسات الاجتماعية والجغرافيا.'
    };

    onApplyTemplateToCurrent({
      procedures,
      objectives: selectedTemplate.objectives,
      conceptsAndTerms: selectedTemplate.conceptsAndTerms,
      toolsAndResources: selectedTemplate.toolsAndResources,
      homework: selectedTemplate.homework,
      hook: selectedTemplate.hook,
      vision2040Goals: selectedTemplate.vision2040Outcomes,
      pedagogicalFramework
    });
    onClose();
  };

  const handleCreateNewFromTemplate = () => {
    const newLesson: GeneratedLesson = {
      id: `lesson-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: selectedTemplate.title,
      subjectName: selectedTemplate.subjectName,
      stageName: selectedTemplate.stageName,
      gradeName: selectedTemplate.gradeName,
      unitTitle: selectedTemplate.unitTitle,
      lessonTitle: selectedTemplate.lessonTitle,
      durationMinutes: selectedTemplate.durationMinutes,
      objectives: selectedTemplate.objectives,
      conceptsAndTerms: selectedTemplate.conceptsAndTerms,
      prerequisites: ['المعارف القبلية والخبرات السابقة للمتعلم ذات الصلة بموضوع الدرس'],
      toolsAndResources: selectedTemplate.toolsAndResources,
      hook: selectedTemplate.hook,
      procedures: [
        {
          stepNumber: 1,
          title: selectedTemplate.fiveEsBreakdown.engage.title,
          durationMinutes: selectedTemplate.fiveEsBreakdown.engage.duration,
          teacherActivity: selectedTemplate.fiveEsBreakdown.engage.teacher,
          studentActivity: selectedTemplate.fiveEsBreakdown.engage.student,
          strategy: 'النظرية البنائية: التهيئة والتنشيط (Engage)'
        },
        {
          stepNumber: 2,
          title: selectedTemplate.fiveEsBreakdown.explore.title,
          durationMinutes: selectedTemplate.fiveEsBreakdown.explore.duration,
          teacherActivity: selectedTemplate.fiveEsBreakdown.explore.teacher,
          studentActivity: selectedTemplate.fiveEsBreakdown.explore.student,
          strategy: 'النظرية البنائية: الاستكشاف (Explore) عبر فكر-زاوج-شارك'
        },
        {
          stepNumber: 3,
          title: selectedTemplate.fiveEsBreakdown.explain.title,
          durationMinutes: selectedTemplate.fiveEsBreakdown.explain.duration,
          teacherActivity: selectedTemplate.fiveEsBreakdown.explain.teacher,
          studentActivity: selectedTemplate.fiveEsBreakdown.explain.student,
          strategy: 'النظرية البنائية: التفسير وبناء المفهوم (Explain)'
        },
        {
          stepNumber: 4,
          title: selectedTemplate.fiveEsBreakdown.elaborate.title,
          durationMinutes: selectedTemplate.fiveEsBreakdown.elaborate.duration,
          teacherActivity: selectedTemplate.fiveEsBreakdown.elaborate.teacher,
          studentActivity: selectedTemplate.fiveEsBreakdown.elaborate.student,
          strategy: 'النظرية البنائية: التوسيع والتطبيق (Elaborate)'
        },
        {
          stepNumber: 5,
          title: selectedTemplate.fiveEsBreakdown.evaluate.title,
          durationMinutes: selectedTemplate.fiveEsBreakdown.evaluate.duration,
          teacherActivity: selectedTemplate.fiveEsBreakdown.evaluate.teacher,
          studentActivity: selectedTemplate.fiveEsBreakdown.evaluate.student,
          strategy: 'النظرية البنائية: التقويم والتأمل (Evaluate)'
        }
      ],
      assessmentMethods: {
        formative: [
          'ملاحظة تفاعل المجموعات الثنائية في نشاط فكر-زاوج-شارك',
          'بطاقة الخروج التكوينية (3-2-1 Exit Ticket)',
          'أسئلة التحليل المكاني واستقراء الخريطة'
        ],
        summative: [
          'الواجب المنزلي التطبيقي المدعم بالأدلة',
          'سؤال التقويم الختامي المتدرج لقياس مستويات بلوم'
        ]
      },
      differentiation: {
        supportLevel: [
          'تقديم بطاقات مساعدة تتضمن خرائط ملونة ودليل مصطلحات مبسط مع إقران الطالب بزميل متمكن في نشاط المزاوجة.'
        ],
        enrichmentLevel: [
          'تكليف الطلبة الموهوبين بإعداد سيناريو تحليلي إضافي أو ربط معطيات الخريطة بمشروع تنموي مستقبلي ضمن رؤية 2040.'
        ]
      },
      homework: selectedTemplate.homework,
      referencedSources: [
        {
          resourceTitle: 'كتاب الدراسات الاجتماعية المعتمد - وزارة التربية والتعليم سلطنة عُمان',
          pages: 'الوحدة المقررة كاملة',
          notes: 'مواءمة مع دليل المعلم وأولويات رؤية عُمان 2040'
        }
      ],
      vision2040Goals: selectedTemplate.vision2040Outcomes,
      pedagogicalFramework: {
        theories: [
          {
            theoryId: 'constructivism',
            name: 'النظرية البنائية (Constructivism - دورة 5Es)',
            justification: selectedTemplate.constructivistJustification,
            classroomApplication: 'تفعيل استراتيجيات بناء المعرفة وتوليد الحلول والمفاهيم الجغرافية ذاتياً عبر التعلم النشط.'
          }
        ],
        selectedStrategies: [
          'النظرية البنائية (Constructivism)',
          'التعلم التعاوني: فكر - زاوج - شارك (Think-Pair-Share)',
          'الاستقصاء الجغرافي وحل المشكلات المكانية'
        ],
        activeLearningMechanisms: 'التفكير الفردي المتأمل، الحوار الثنائي، العرض الصفي، وسقالات التعلم.',
        vision2040PedagogicalLink: 'توثيق ارتباط الدرس بأولويات التعليم والتكنولوجيا والبيئة في رؤية عمان 2040.',
        teachersGuideReference: 'دليل المعلم المعتمد لوزارة التربية والتعليم سلطنة عُمان.'
      },
      isTemplate: true,
      createdById: 'pedagogical_assistant',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onCreateNewFromTemplate(newLesson);
    onClose();
  };

  const handleInsertTpsProcedure = () => {
    const totalTime = tpsThinkTime + tpsPairTime + tpsShareTime;
    const procedure = {
      stepNumber: (selectedLesson?.procedures?.length || 0) + 1,
      title: `نشاط تعاوني بنائي: فكر - زاوج - شارك (${tpsPhaseTopic})`,
      durationMinutes: totalTime,
      teacherActivity: `إدارة نشاط فكر-زاوج-شارك حول التساؤل: "${tpsQuestion}".
1. التفكير الفردي (${tpsThinkTime} د): تفعيل المؤقت، ضبط الصمت، والتجوال لملاحظة محاولات الطلبة.
2. المزاوجة الثنائية (${tpsPairTime} د): توجيه الطلبة لمقارنة ملاحظاتهم مع الزميل المجاور وبناء إجابة مشتركة مدعمة بالدليل.
3. المشاركة الصفية (${tpsShareTime} د): دعوة ممثلي الأزواج لعرض الاستنتاجات وتدوين الأفكار الجوهرية على السبورة وتصويب المفاهيم البديلة.`,
      studentActivity: `1. فكّر (${tpsThinkTime} د - فردي): قراءة السؤال بدقة وتدوين أفكار وملاحظات سريعة دون تحدث.
2. زاوِج (${tpsPairTime} د - ثنائي): حوار منظم مع الزميل المجاور، تبادل الملاحظات، والاتفاق على أهم نقطتين مشتركتين.
3. شارِك (${tpsShareTime} د - صفي): عرض نتيجة الحوار الثنائي عند استدعاء الزوج، والاستماع النشط للأزواج الأخرى وإبداء التغذية الراجعة.`,
      strategy: 'التعلم التعاوني: فكر - زاوج - شارك (Think-Pair-Share)'
    };

    onInsertProcedure(procedure);
    onClose();
  };

  const copyTpsText = () => {
    const text = `نشاط فكر - زاوج - شارك (Think-Pair-Share)
سياق النشاط: ${tpsPhaseTopic}
السؤال الاستقصائي: ${tpsQuestion}
التوقيت الإجمالي: ${tpsThinkTime + tpsPairTime + tpsShareTime} دقائق
1. فكّر (${tpsThinkTime} د - فردي): تفكير صامت وتدوين ملاحظات.
2. زاوِج (${tpsPairTime} د - ثنائي): نقاش مع الزميل وبناء إجابة موحدة.
3. شارِك (${tpsShareTime} د - صفي): عرض جماعي أمام الصف وإدارة التغذية الراجعة.
الهدف والمخرج التربوي: ${tpsOutcomeTarget}`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-right">
        {/* Top Header Banner */}
        <div className="p-4 sm:p-6 bg-linear-to-l from-teal-800 via-teal-700 to-emerald-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
              <Brain className="w-7 h-7 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">
                  مساعد التخطيط التربوي الذكي
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-teal-950 shadow-xs">
                  النظرية البنائية & رؤية عُمان 2040
                </span>
              </div>
              <p className="text-xs text-teal-100 mt-1">
                تخطيط تدريس معياري قائم على دورة التعلم الخماسية (5Es)، أنشطة "فكر-زاوج-شارك"، وتتبع مخرجات الرؤية الوطنية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition text-xs font-bold"
              title="إغلاق النافذة"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'templates'
                ? 'border-teal-600 text-teal-700 dark:text-teal-400 font-extrabold bg-white dark:bg-slate-900 rounded-t-xl'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-teal-600'
            }`}
          >
            <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>القوالب البنائية الجاهزة (دورة 5Es)</span>
            <span className="px-1.5 py-0.2 rounded-md bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 text-[10px]">
              {PREBUILT_CONSTRUCTIVIST_TEMPLATES.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('think-pair-share')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'think-pair-share'
                ? 'border-teal-600 text-teal-700 dark:text-teal-400 font-extrabold bg-white dark:bg-slate-900 rounded-t-xl'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-teal-600'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>منشئ نشاط "فكر - زاوج - شارك"</span>
            <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-[10px]">
              تفاعلي
            </span>
          </button>

          <button
            onClick={() => setActiveTab('vision2040')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'vision2040'
                ? 'border-teal-600 text-teal-700 dark:text-teal-400 font-extrabold bg-white dark:bg-slate-900 rounded-t-xl'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-teal-600'
            }`}
          >
            <Target className="w-4 h-4 text-amber-500" />
            <span>تتبع مخرجات رؤية عُمان 2040</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
              visionAudit.scorePercent >= 60 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800'
            }`}>
              {visionAudit.scorePercent}% مواءمة
            </span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'guide'
                ? 'border-teal-600 text-teal-700 dark:text-teal-400 font-extrabold bg-white dark:bg-slate-900 rounded-t-xl'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-teal-600'
            }`}
          >
            <Compass className="w-4 h-4 text-indigo-500" />
            <span>دليل المعلم للبنائية التربوية</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: CONSTRUCTIVIST READY TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              {/* Template Selector Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {PREBUILT_CONSTRUCTIVIST_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => setSelectedTemplateId(tmpl.id)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                      selectedTemplateId === tmpl.id
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    <span>{tmpl.subjectName} ({tmpl.gradeName})</span>
                    <span className="text-[10px] opacity-80 border-r border-white/20 pr-1 mr-1">
                      {tmpl.lessonTitle.slice(0, 24)}...
                    </span>
                  </button>
                ))}
              </div>

              {/* Template Overview Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-teal-700 text-white text-[11px] font-bold">
                      {selectedTemplate.gradeName}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-bold border border-slate-200 dark:border-slate-700">
                      {selectedTemplate.subjectName}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[11px] font-bold">
                      {selectedTemplate.durationMinutes} دقيقة
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
                      دورة التعلم الخماسية (5Es)
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {selectedTemplate.lessonTitle}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {selectedTemplate.tagline}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  {selectedLesson && (
                    <button
                      onClick={handleApplyTemplate}
                      className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      title="استبدال إجراءات وأهداف الدرس المفتوح حالياً بمحتوى هذا القالب"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>تطبيق القالب على الدرس الحالي</span>
                    </button>
                  )}
                  <button
                    onClick={handleCreateNewFromTemplate}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    title="حفظ وإضافة درس جديد تماماً في قائمة الدروس المحضرة"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إنشاء درس جديد من هذا القالب</span>
                  </button>
                </div>
              </div>

              {/* Constructivist 5Es Stages Accordion/Timeline */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-teal-600" />
                    <span>خطوات سير الدرس وفق دورة التعلم البنائية الخماسية (5Es Model)</span>
                  </h5>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    إجمالي الزمن: {selectedTemplate.durationMinutes} دقيقة
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(selectedTemplate.fiveEsBreakdown).map(([phaseKey, phaseData], idx) => {
                    const colors = [
                      { bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-200 dark:border-amber-800/50', badge: 'bg-amber-500 text-white' },
                      { bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-800/50', badge: 'bg-blue-600 text-white' },
                      { bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-200 dark:border-emerald-800/50', badge: 'bg-emerald-600 text-white' },
                      { bg: 'bg-purple-50 dark:bg-purple-950/20', border: 'border-purple-200 dark:border-purple-800/50', badge: 'bg-purple-600 text-white' },
                      { bg: 'bg-rose-50 dark:bg-rose-950/20', border: 'border-rose-200 dark:border-rose-800/50', badge: 'bg-rose-600 text-white' }
                    ][idx % 5];

                    return (
                      <div
                        key={phaseKey}
                        className={`p-4 rounded-2xl border ${colors.border} ${colors.bg} space-y-3 transition`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded-lg ${colors.badge} flex items-center justify-center text-xs font-black`}>
                              {idx + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                              {phaseData.title}
                            </span>
                          </div>
                          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-800/70 px-2 py-0.5 rounded-lg border border-slate-200/50 dark:border-slate-700">
                            <Clock className="w-3 h-3 text-teal-600" />
                            <span>{phaseData.duration} دقيقة</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
                          <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800">
                            <span className="block font-bold text-teal-700 dark:text-teal-400 mb-1 text-[11px]">
                              👨‍🏫 دور المعلم (توجيه، سقالات، وطرح تساؤلات):
                            </span>
                            <p className="text-slate-700 dark:text-slate-300">
                              {phaseData.teacher}
                            </p>
                          </div>
                          <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800">
                            <span className="block font-bold text-emerald-700 dark:text-emerald-400 mb-1 text-[11px]">
                              🧑‍🎓 دور الطالب (بحث، حوار، وبناء مفهوم ذاتي):
                            </span>
                            <p className="text-slate-700 dark:text-slate-300">
                              {phaseData.student}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Incorporated Think-Pair-Share in Template */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-extrabold text-amber-900 dark:text-amber-200">
                      نشاط "فكر - زاوج - شارك" المدمج في هذا القالب
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
                    {selectedTemplate.thinkPairShareScenario.thinkMinutes + selectedTemplate.thinkPairShareScenario.pairMinutes + selectedTemplate.thinkPairShareScenario.shareMinutes} دقيقة
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-amber-200/70 dark:border-slate-800 text-xs space-y-2">
                  <p className="font-bold text-slate-800 dark:text-slate-100">
                    السؤال الاستقصائي للنشاط: "{selectedTemplate.thinkPairShareScenario.prompt}"
                  </p>
                  <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                      <span className="block font-bold text-teal-600">1. فكّر ({selectedTemplate.thinkPairShareScenario.thinkMinutes} د)</span>
                      <span className="text-slate-500 dark:text-slate-400 text-[10px]">تفكير تأملي فردي صامت</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                      <span className="block font-bold text-emerald-600">2. زاوِج ({selectedTemplate.thinkPairShareScenario.pairMinutes} د)</span>
                      <span className="text-slate-500 dark:text-slate-400 text-[10px]">حوار ثنائي ومقارنة إجابات</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                      <span className="block font-bold text-amber-600">3. شارِك ({selectedTemplate.thinkPairShareScenario.shareMinutes} د)</span>
                      <span className="text-slate-500 dark:text-slate-400 text-[10px]">عرض صفي وتغذية راجعة</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    🎯 مخرج التعلم المستهدف: {selectedTemplate.thinkPairShareScenario.focusOutcome}
                  </p>
                </div>
              </div>

              {/* Vision 2040 Outcomes Aligned */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <h5 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Target className="w-4 h-4 text-teal-600" />
                  <span>مخرجات التعلم وفق رؤية عُمان 2040 المحققة في هذا القالب:</span>
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {selectedTemplate.vision2040Outcomes.map((v, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold text-[10px]">
                          {v.code}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-100 truncate">
                          {v.goalTitle}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        {v.applicationInLesson}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: THINK-PAIR-SHARE INTERACTIVE BUILDER */}
          {activeTab === 'think-pair-share' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-linear-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/60">
                <h4 className="text-sm font-extrabold text-emerald-900 dark:text-emerald-200 flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>منشئ ومقترح أنشطة "فكر - زاوج - شارك" (Think-Pair-Share)</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  استراتيجية بنائية للتعلم التعاوني تتيح لكل طالب فرصة التفكير الفردي الصامت أولاً، ثم التحقق من الفكرة في بيئة آمنة مع الزميل، ثم تعميم الفكرة على الصف، مما يعزز مشاركة 100% من المتعلمين.
                </p>
              </div>

              {/* Form Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    مرحلة النشاط داخل سير الدرس:
                  </label>
                  <select
                    value={tpsPhaseTopic}
                    onChange={(e) => setTpsPhaseTopic(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 font-medium focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="تهيئة استكشافية وعصف ذهني">تهيئة استكشافية وعصف ذهني (Engage)</option>
                    <option value="استكشاف خريطة أو جدول إحصائي">استكشاف خريطة أو جدول إحصائي (Explore)</option>
                    <option value="تفسير ظاهرة وبناء مفهوم جغرافي">تفسير ظاهرة وبناء مفهوم جغرافي (Explain)</option>
                    <option value="حل مشكلة واقعية ونقل أثر التعلم">حل مشكلة واقعية ونقل أثر التعلم (Elaborate)</option>
                    <option value="تقويم ختامي وتأمل ذاتي">تقويم ختامي وتأمل ذاتي (Evaluate)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    مخرج التعلم / الهدف المهارى المستهدف:
                  </label>
                  <input
                    type="text"
                    value={tpsOutcomeTarget}
                    onChange={(e) => setTpsOutcomeTarget(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-teal-500"
                    placeholder="مثال: التفكير المكاني، التحليل الناقد للخرائط..."
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      نص السؤال أو التحدي الاستقصائي (سؤال التعلم المفتوح):
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setTpsQuestion('بالاعتماد على خريطة المحميات الطبيعية في عُمان: ما المعايير البيئية لتحديد مناطق صون المها العربي وسلاحف رأس الجنز؟')}
                        className="text-[10px] text-teal-600 hover:underline"
                      >
                        [اقتراح: بيئة ومحميات]
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => setTpsQuestion('قارن بين الموقع الجغرافي لميناء الدقم وميناء صلالة من حيث القرب من خطوط الملاحة الدولية ومجالات الاستثمار.')}
                        className="text-[10px] text-teal-600 hover:underline"
                      >
                        [اقتراح: موانئ واقتصاد]
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={tpsQuestion}
                    onChange={(e) => setTpsQuestion(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-teal-500 leading-relaxed"
                  />
                </div>

                {/* Timing configuration */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    توزيع الأزمنة (دقائق):
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">فكر (Think)</span>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={tpsThinkTime}
                        onChange={(e) => setTpsThinkTime(Number(e.target.value) || 1)}
                        className="w-full text-center py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-teal-600"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">زاوج (Pair)</span>
                      <input
                        type="number"
                        min={1}
                        max={8}
                        value={tpsPairTime}
                        onChange={(e) => setTpsPairTime(Number(e.target.value) || 1)}
                        className="w-full text-center py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-emerald-600"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">شارك (Share)</span>
                      <input
                        type="number"
                        min={2}
                        max={15}
                        value={tpsShareTime}
                        onChange={(e) => setTpsShareTime(Number(e.target.value) || 2)}
                        className="w-full text-center py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-amber-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    آلية تسجيل ومشاركة الإجابات:
                  </label>
                  <select
                    value={tpsRecordMethod}
                    onChange={(e) => setTpsRecordMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 font-medium focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="تدوين فردي ثم ورقة ثنائية مشتركة ثم متحدث الزوج">تدوين فردي ثم ورقة ثنائية مشتركة ثم متحدث الزوج</option>
                    <option value="ألواح بيضاء صغيرة فردية (Mini Whiteboards)">ألواح بيضاء صغيرة فردية (Mini Whiteboards)</option>
                    <option value="بطاقات استجابة ملونة أو أرقام ثنائية عشوائية">بطاقات استجابة ملونة أو أرقام ثنائية عشوائية</option>
                    <option value="حائط رقمي تفاعلي عبر البوابة التعليمية">حائط رقمي تفاعلي عبر البوابة التعليمية</option>
                  </select>
                </div>
              </div>

              {/* Live Card Preview */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 font-bold text-xs">
                      معاينة الإجراء التدريسي
                    </span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                      نشاط تعاوني بنائي: فكر - زاوج - شارك ({tpsThinkTime + tpsPairTime + tpsShareTime} دقائق)
                    </span>
                  </div>
                  <button
                    onClick={copyTpsText}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-teal-600 transition"
                  >
                    {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedText ? 'تم النسخ!' : 'نسخ النص'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-teal-800 dark:text-teal-300">1. فكّر (Think)</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-teal-200/60 dark:bg-teal-900 text-teal-900 dark:text-teal-200">
                        {tpsThinkTime} دقيقة
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                      <strong>الطالب:</strong> صمت تأملي، قراءة السؤال، وتدوين الأفكار الأولية.
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      <strong>المعلم:</strong> ضبط المؤقت والتجوال الصامت لرصد التفاعل.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-emerald-800 dark:text-emerald-300">2. زاوِج (Pair)</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-200/60 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200">
                        {tpsPairTime} دقائق
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                      <strong>الطالب:</strong> حوار مع الزميل المجاور، مقارنة الملاحظات، والاتفاق على حل موحد.
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      <strong>المعلم:</strong> تقديم سقالات وتوجيه للمجموعات المتعثرة.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-amber-800 dark:text-amber-300">3. شارِك (Share)</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-200/60 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                        {tpsShareTime} دقائق
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                      <strong>الطالب:</strong> متحدث الزوج يعرض الإجابة أمام الصف ويتقبل الملاحظات.
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      <strong>المعلم:</strong> تسجيل النقاط وتصويب المفاهيم البديلة على السبورة.
                    </p>
                  </div>
                </div>

                {/* Action button */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={handleInsertTpsProcedure}
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إدراج نشاط "فكر-زاوج-شارك" في خطوات سير الدرس الحالي</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OMAN VISION 2040 OUTCOMES TRACKER */}
          {activeTab === 'vision2040' && (
            <div className="space-y-6">
              {/* Score header */}
              <div className="p-5 rounded-2xl bg-linear-to-l from-slate-900 via-teal-950 to-slate-900 text-white border border-teal-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-amber-400" />
                    <h4 className="text-base font-extrabold">
                      مصفوفة تتبع مخرجات التعلم وفق رؤية عُمان 2040
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300">
                    تدقيق فوري لمدى مواءمة عناصر الدرس (الأهداف، الاستراتيجيات، والأنشطة) مع الأولويات الوطنية
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-white/10 px-4 py-2.5 rounded-2xl border border-white/10 shrink-0">
                  <div className="text-center">
                    <span className="block text-2xl font-black text-amber-300">
                      {visionAudit.scorePercent}%
                    </span>
                    <span className="text-[10px] text-slate-300 font-bold">
                      نسبة التغطية الوطنية
                    </span>
                  </div>
                  <div className="border-r border-white/20 h-8"></div>
                  <div className="text-xs font-bold text-teal-200">
                    {visionAudit.matchedCount} من أصل {visionAudit.totalCount} أولويات
                  </div>
                </div>
              </div>

              {/* Indicators list */}
              <div className="space-y-3">
                <h5 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  مؤشرات الأولويات الوطنية وتطبيقاتها في التدريس الصفي:
                </h5>

                <div className="grid grid-cols-1 gap-3">
                  {visionAudit.indicators.map((ind) => (
                    <div
                      key={ind.code}
                      className={`p-4 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                        ind.matched
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="space-y-1 max-w-2xl">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            ind.matched
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}>
                            {ind.code}
                          </span>
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                            {ind.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {ind.description}
                        </p>
                        <p className="text-[11px] text-teal-700 dark:text-teal-400 font-medium pt-0.5">
                          💡 التوجيه الصفي: {ind.actionAdvice}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {ind.matched ? (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>متحقق في الخطة</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold">
                            <span>غير مفعل حالياً</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action recommendation box */}
              <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-teal-900 dark:text-teal-200 block">
                    هل ترغب في رفع درجة مواءمة الدرس الحالي مع رؤية عُمان 2040 تلقائياً؟
                  </span>
                  <span className="text-slate-600 dark:text-slate-400 text-[11px]">
                    يقوم المساعد بإضافة مخرجات التقنية، الاستدامة، والمواطنة وتطبيقاتها الصفية داخل جدول الأهداف والرؤية.
                  </span>
                </div>
                {selectedLesson && (
                  <button
                    onClick={handleApplyTemplate}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition whitespace-nowrap cursor-pointer shrink-0"
                  >
                    تطبيق مصفوفة الرؤية 2040 كاملة
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CONSTRUCTIVIST TEACHER'S PEDAGOGICAL GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/60 space-y-1.5">
                <h4 className="text-sm font-extrabold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-600" />
                  <span>النظرية البنائية (Constructivism) في تدريس الدراسات الاجتماعية والجغرافيا</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  تؤكد النظرية البنائية (بياجيه، فيجوتسكي، برونر) أن المتعلم لا يستقبل المعرفة بشكل سلبي كوعاء فارغ، بل يبنيها بنشاط من خلال التفاعل مع بيئته، الخبرات السابقة، والحوار الصفي البناء.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center font-black text-sm">
                    1
                  </div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    كشف المفاهيم البديلة (Alternative Conceptions)
                  </h5>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    يبدأ الدرس البنائي دائماً بطرح تساؤل يظهر المعرفة القبلية للطالب وتصحيح أي أفكار خاطئة شائعة (مثل الخلط بين الطقس والمناخ أو بين الخريطة والصورة الجوية).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black text-sm">
                    2
                  </div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    السقالات التعليمية (Instructional Scaffolding)
                  </h5>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    يقدم المعلم دعماً مؤقتاً وموجهاً (مثل نماذج الخرائط، إطارات التفكير، أدلة الملاحظة) ثم يسحب الدعم تدريجياً ليتولى الطالب زمام تعلمه واستنتاجه.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-black text-sm">
                    3
                  </div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    التعلم التعاوني النشط (Social Interaction)
                  </h5>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    استراتيجيات مثل "فكر-زاوج-شارك" تتيح للمتعلم صقل أفكاره عبر منطقة النمو الوشيك (ZPD) من خلال النقاش مع الزميل والأقران قبل التعميم الصفي.
                  </p>
                </div>
              </div>

              {/* Rubric and Best Practices */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <h5 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  قائمة تحقق التخطيط البنائي لوزارة التربية والتعليم بسلطنة عُمان:
                </h5>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>التمهيد المثير:</strong> هل يبدأ الدرس بمشكلة أو ظاهرة حقيقية من البيئة العمانية بدلاً من السرد النظري؟</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>دور الطالب المحوري:</strong> هل يتحدث الطالب ويستكشف بنسبة لا تقل عن 60% من وقت الحصة؟</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>التعلم الثنائي والجماعي:</strong> هل تم إدراج أنشطة "فكر-زاوج-شارك" لتحقيق المشاركة المتكافئة لكافة المستويات؟</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>المواءمة الوطنية:</strong> هل تم ربط مخرجات التعلم بأولويات رؤية عمان 2040 والمواطنة الصالحة؟</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>متوافق مع المعايير التربوية لوزارة التربية والتعليم بسلطنة عُمان ومستهدفات رؤية 2040</span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 font-bold transition cursor-pointer"
            >
              إغلاق
            </button>
            {activeTab === 'templates' && (
              <button
                onClick={handleCreateNewFromTemplate}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إنشاء درس جديد من القالب</span>
              </button>
            )}
            {activeTab === 'think-pair-share' && (
              <button
                onClick={handleInsertTpsProcedure}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إدراج في الدرس الحالي</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
