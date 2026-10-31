import { PedagogicalFramework, PedagogicalTheoryItem } from '../types/index.ts';

export function matchPedagogicalFrameworkForLesson(params: {
  lessonTitle: string;
  unitTitle?: string;
  subjectName?: string;
  teachingStrategy?: string;
  pedagogicalTheory?: string;
}): PedagogicalFramework {
  const { lessonTitle, unitTitle = '', subjectName = '', teachingStrategy, pedagogicalTheory } = params;
  const lower = `${lessonTitle} ${unitTitle} ${subjectName} ${pedagogicalTheory || ''}`.toLowerCase();

  let theoryItem: PedagogicalTheoryItem;
  let strategies: string[] = [];

  if (pedagogicalTheory?.includes('سوسيو') || pedagogicalTheory?.includes('socio') || lower.includes('سوسيو') || lower.includes('سوسيوبنائية') || lower.includes('بنائية اجتماعية') || lower.includes('صراع معرفي') || lower.includes('مناظرة') || lower.includes('مجلس بلدي') || lower.includes('تخطيط إقليمي')) {
    theoryItem = {
      theoryId: 'socio_constructivism',
      name: 'النظرية السوسيو-بنائية (البنائية الاجتماعية - Socio-Constructivism)',
      justification: `تستند معالجة درس "${lessonTitle}" إلى مبدأ الصراع المعرفي الاجتماعي (Socio-Cognitive Conflict) والتفاوض حول المعنى؛ حيث يتجاوز المتعلم الفهم الفردي عبر الحوار التفاعلي وبناء قرارات مكانية توافقية توازن بين أولويات البيئة والتنمية المستدامة في سلطنة عمان.`,
      classroomApplication: 'التمهيد: طرح سيناريو تخطيطي تفاوضي مثير للجدل حول استخدامات الأراضي والموارد في المحافظات العمانية؛ سير الأنشطة: محاكاة أدوار المجالس البلدية وتوليد الصراع المعرفي البناء بين فرق العمل؛ التقويم: تقويم مهارات الإقناع المكاني والتفاوض والوصول إلى حلول تخطيطية مستدامة تتفق مع رؤية عمان 2040.'
    };
    strategies = [
      'استراتيجيات التعلم النشط (لعب الأدوار، المناظرات المكانية، محطات التعلم)',
      'التعلم القائم على المشكلات والمشاريع (PBL)',
      'الاستقصاء الجغرافي الخماسي (Geographic Inquiry)'
    ];
  } else if (lower.includes('gis') || lower.includes('استشعار') || lower.includes('تقنيات') || lower.includes('خريطة') || lower.includes('خرائط') || lower.includes('كنتور')) {
    theoryItem = {
      theoryId: 'spatial_brain_learning',
      name: 'نظرية التعلم المستند إلى الدماغ والتفكير البصري المكاني (Spatial Thinking)',
      justification: `تتطلب طبيعة درس "${lessonTitle}" تفعيل التفكير البصري المكاني والتشفير المزدوج (Dual Coding) لتمكين الطالب من الربط الدلالي بين الرموز الكارتوغرافية والامتداد التضاريسي على أرض الواقع في سلطنة عمان.`,
      classroomApplication: 'التمهيد: عرض مرئية فضائية مباشرة أو نموذج ارتفاع رقمي (DEM) ثلاثي الأبعاد لجبال الحجر أو سواحل عمان؛ سير الأنشطة: تحليل الطبقات الجغرافية واستخراج القياسات الكارتوجرافية؛ التقويم: مهمة قراءة وتحليل خريطة كنتورية أو رقمية.'
    };
    strategies = [
      'استخدام نظم المعلومات الجغرافية (GIS) والتقنيات الرقمية والخرائط التفاعلية',
      'الاستقصاء الجغرافي الخماسي (Geographic Inquiry)',
      'استراتيجية خرائط المفاهيم والخرائط الذهنية والرقمية'
    ];
  } else if (lower.includes('فلج') || lower.includes('أفلاج') || lower.includes('هذا وطني') || lower.includes('حضارة') || lower.includes('سكان') || lower.includes('تاريخ') || lower.includes('مجتمع')) {
    theoryItem = {
      theoryId: 'sociocultural_zpd',
      name: 'النظرية الاجتماعية - الثقافية (Vygotsky) ومنطقة التطوير القريبة (ZPD)',
      justification: `يستند درس "${lessonTitle}" إلى التراث الجغرافي والاجتماعي العماني الحي، مما يجعل التعلم التعاوني والتفاعل الثقافي عبر السقالات التعليمية (Scaffolding) السبيل الأمثل لانتقال الطالب من المعرفة العفوية إلى الفهم العلمي الرصين.`,
      classroomApplication: 'التمهيد: استثارة الحصيلة الثقافية للطلاب حول إدارة الأفلاج والتجارة البحرية العمانية؛ سير الأنشطة: مجموعات تعلم تعاوني غير متجانسة مع تقديم سقالات متدرجة؛ التقويم: تقييم أداء الفريق في تقديم حلول لاستدامة الموارد التراثية.'
    };
    strategies = [
      'استراتيجيات التعلم النشط (فكر-زاوج-شارك، الرؤوس المرقمة، لعب الأدوار)',
      'التعلم القائم على المشكلات والمشاريع (PBL)',
      'استراتيجية خرائط المفاهيم لتنظيم العلاقات المؤسسية والاجتماعية'
    ];
  } else if (lower.includes('مناخ') || lower.includes('طقس') || lower.includes('غلاف') || lower.includes('رياح') || lower.includes('أمطار') || lower.includes('ضغط')) {
    theoryItem = {
      theoryId: 'cognitivism',
      name: 'النظرية المعرفية ونظرية معالجة المعلومات (Cognitivism - Ausubel)',
      justification: `يحتوي درس "${lessonTitle}" على مفاهيم فيزيائية وجغرافية مجردة تحتاج إلى منظمات متقدمة (Advance Organizers) لتنظيم البنية المعرفية في الذاكرة طويلة المدى وتفادي العبء المعرفي الزائد.`,
      classroomApplication: 'التمهيد: تقديم منظم تخطيطي متقدم يربط بين زاوية سقوط أشعة الشمس والضغط الجوي؛ سير الأنشطة: مقارنة الأقاليم المناخية العمانية بواسطة مخططات فن (Venn)؛ التقويم: اختبار بنائي يقيس الفهم العميق لشبكة المفاهيم.'
    };
    strategies = [
      'استراتيجية خرائط المفاهيم والخرائط الذهنية والرقمية',
      'الاستقصاء الجغرافي الخماسي (Geographic Inquiry)',
      'استراتيجيات التفكير الناقد وحل المشكلات المكانية'
    ];
  } else if (lower.includes('بيئة') || lower.includes('موارد') || lower.includes('تعدين') || lower.includes('صناعة') || lower.includes('مياه') || lower.includes('تصحر')) {
    theoryItem = {
      theoryId: 'problem_based_learning',
      name: 'النظرية البنائية وتطبيقاتها في التعلم القائم على حل المشكلات (PBL)',
      justification: `يتناول درس "${lessonTitle}" تحديات بيئية وتنموية واقعية تمس المجتمع العماني؛ مما يقتضي أن يبني المتعلم معارفه ذاتياً من خلال استقصاء المشكلة واقتراح بدائل مستدامة تتواءم مع مستهدفات رؤية عمان 2040.`,
      classroomApplication: 'التمهيد: عرض مقطع مرئي أو صورة توثق تحدياً بيئياً محلياً (مثل تملح التربة أو إدارة المخاطر المناخية)؛ سير الأنشطة: دراسة حالة استقصائية وفرق عمل لوضع خطة طوارئ؛ التقويم: تقييم مقترحات الحلول وفق معايير الجدوى البيئية والاقتصادية.'
    };
    strategies = [
      'التعلم القائم على المشكلات والمشاريع (PBL)',
      'الاستقصاء الجغرافي الخماسي (Geographic Inquiry)',
      'استراتيجيات التفكير الناقد وحل المشكلات البيئية والمكانية'
    ];
  } else {
    // Default high-level Constructivism & Multiple Intelligences
    theoryItem = {
      theoryId: 'constructivism',
      name: 'النظرية البنائية (Constructivism)',
      justification: `ينطلق درس "${lessonTitle}" من مبدأ أن المعرفة الجغرافية لا تُلقن بل تُكتشف وتُبنى نشطاً من خلال الملاحظة الكارتوجرافية والتحليل المكاني وتفسير الظواهر الجغرافية في سلطنة عمان.`,
      classroomApplication: 'التمهيد: طرح سؤال استقصائي محفز يربط الدرس بالحياة اليومية للمتعلم العماني؛ سير الأنشطة: أنشطة استكشافية قائمة على دورة التعلم الخماسية (5Es)؛ التقويم: مهام أدائية تقيس المهارات الكارتوجرافية والقدرة على الاستنتاج.'
    };
    strategies = [
      'الاستقصاء الجغرافي الخماسي (Geographic Inquiry)',
      'استراتيجية خرائط المفاهيم والخرائط الذهنية',
      'استراتيجيات التعلم النشط (فكر-زاوج-شارك ومحطات التعلم)'
    ];
  }

  // If a custom teaching strategy was selected by user, ensure it is highlighted
  if (teachingStrategy && !strategies.includes(teachingStrategy)) {
    strategies.unshift(teachingStrategy);
  }

  return {
    theories: [theoryItem],
    selectedStrategies: strategies,
    activeLearningMechanisms: 'تطبيق التمايز الصفي ومراعاة الفروق الفردية عبر تنويع الوسائل (خرائط رقمية، مجسمات ثلاثية الأبعاد، نصوص تحليلية)، واستخدام تقنيات التعلم التعاوني الموجه.',
    vision2040PedagogicalLink: 'المواءمة مع محور "الإنسان والمجتمع" والتعليم الشامل والبحث العلمي والابتكار لرؤية عمان 2040، وإكساب الطالب مهارات القرن الـ 21 والمواطنة البيئية المسؤولة.',
    teachersGuideReference: 'مستند إلى دليل المعلم المعتمد لمناهج الدراسات الاجتماعية والجغرافيا بسلطنة عمان (وزارة التربية والتعليم).'
  };
}
