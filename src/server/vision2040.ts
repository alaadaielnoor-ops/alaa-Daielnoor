import { OmanVision2040Goal } from '../types/index.ts';

export const OMAN_VISION_2040_GOALS: OmanVision2040Goal[] = [
  {
    id: 'v2040-g-1',
    code: 'V2040-EDU-01',
    title: 'مناهج تعليمية معززة للقيم والمهارات والاعتزاز بالهوية الوطنية العمانية',
    pillar: 'الإنسان والمجتمع',
    priority: 'التعليم والتعلم والبحث العلمي والقدرات الوطنية',
    description: 'تطوير مناهج دراسية مرنة تعزز الهوية الوطنية العمانية والتراث الحضاري، وتكسب المتعلمين مهارات المستقبل (التفكير الناقد، الإبداع، وريادة الأعمال وحل المشكلات).',
    targetCompetencies: [
      'التفكير الناقد والتحليلي',
      'الاعتزاز بالهوية والتراث العماني',
      'التفكير الإبداعي وحل المشكلات',
      'المواطنة الإيجابية والمسؤولية المدنية',
      'القيم الأخلاقية والاجتماعية الأصيلة'
    ],
    classroomApplications: [
      'استقصاء الشواهد التاريخية والجغرافية والحضارية لسلطنة عمان في كل وحدة دراسية.',
      'ربط النصوص والأنشطة بالقيم العمانية والموروث الثقافي العريق للمحافظات.',
      'توظيف استراتيجيات التعلم النشط القائم على المشروعات والتفكير التوليدي.'
    ],
    relatedSubjectCodes: ['geo', 'soc', 'hist', 'ped']
  },
  {
    id: 'v2040-g-2',
    code: 'V2040-EDU-02',
    title: 'تمكين الكفاءات الوطنية وبناء مهارات اقتصاد المعرفة والتنافسية العالمية',
    pillar: 'الاقتصاد والتنمية',
    priority: 'التعليم والتعلم وبناء القدرات الوطنية',
    description: 'إعداد كوادر طلابية مؤهلة تمتلك المعارف والمهارات الرقمية والتطبيقية المعاصرة لمواكبة متطلبات التنمية الشاملة وسوق العمل المتغير واقتصاد المعرفة المستدام.',
    targetCompetencies: [
      'المهارات الرقمية وتطبيقات نظم المعلومات',
      'ريادة الأعمال والتفكير الاقتصادي',
      'التحليل المكاني والإحصائي للبيانات',
      'التنافسية الدولية والإنتاجية العالية',
      'التعلم الذاتي والمستمر'
    ],
    classroomApplications: [
      'استخدام تقنيات نظم المعلومات الجغرافية (GIS) والاستشعار عن بعد في قراءة وتحليل الظواهر.',
      'ربط مخرجات الدرس بقطاعات التنويع الاقتصادي العماني والموانئ والمناطق الاقتصادية (الدقم، صحار، صلالة).',
      'تكليف الطلاب بتحليل الجداول الإحصائية والرسوم البيانية التنموية واستنتاج دلالاتها.'
    ],
    relatedSubjectCodes: ['geo', 'econ', 'soc']
  },
  {
    id: 'v2040-g-3',
    code: 'V2040-EDU-03',
    title: 'بيئة تعليمية محفزة للبحث العلمي والابتكار واستشراف المستقبل والذكاء الاصطناعي',
    pillar: 'الإنسان والمجتمع',
    priority: 'البحث العلمي والابتكار والذكاء الاصطناعي',
    description: 'ترسيخ ثقافة البحث والاستكشاف والتجريب العلمي لدى الطلبة والمعلمين، وتوظيف التقنيات الذكية ومصادر المعرفة المتعددة في معالجة القضايا المعاصرة.',
    targetCompetencies: [
      'البحث العلمي والاستقصاء المنهجي',
      'التفكير الاستشرافي وصناعة البدائل',
      'توظيف أدوات الذكاء الاصطناعي والتقنيات الذكية',
      'العمل التعاوني التكاملي في فرق بحثية'
    ],
    classroomApplications: [
      'تدريب الطلاب على صياغة الفرضيات واختبارها عبر الاستقصاء الجغرافي والبيئي الميداني والمكتبي.',
      'الاستعانة بالمصادر والمراجع الرقمية المعتمدة في المكتبة المدرسية والأطالس الإلكترونية.',
      'إعداد بحوث ودراسات حالة لمعالجة ظواهر واقعية واقتراح حلول ابتكارية قابلة للتطبيق.'
    ],
    relatedSubjectCodes: ['geo', 'sci', 'ped']
  },
  {
    id: 'v2040-g-4',
    code: 'V2040-ENV-01',
    title: 'الاستدامة البيئية وصون الموارد الطبيعية والمائية والتنوع الجغرافي',
    pillar: 'البيئة المستدامة',
    priority: 'البيئة والموارد الطبيعية',
    description: 'تنمية الوعي البيئي والمناخي لدى الأجيال الناشئة، والحفاظ على الموارد المائية ونظام الأفلاج التاريخي، وحماية السواحل والتنوع الأحيائي العماني لتحقيق التنمية المستدامة.',
    targetCompetencies: [
      'الوعي البيئي والتكيف المناخي',
      'ترشيد الموارد وحماية الثروة المائية',
      'صون التنوع الأحيائي والمحميات الطبيعية',
      'التفكير النظمي الإيكولوجي'
    ],
    classroomApplications: [
      'دراسة عبقرية هندسة الأفلاج العمانية والإدارة المائية الرشيدة كتراث عالمي لليونسكو.',
      'مناقشة مشروعات الطاقة النظيفة والهيدروجين الأخضر ومبادرات الحياد الصفري الكربوني 2050.',
      'تصميم مبادرات مدرسية استقصائية حول ترشيد الاستهلاك وحماية البيئات الساحلية والجبلية.'
    ],
    relatedSubjectCodes: ['geo', 'env', 'soc']
  },
  {
    id: 'v2040-g-5',
    code: 'V2040-CIT-01',
    title: 'المواطنة المسؤولة والشراكة المجتمعية والاعتزاز بالريادة التاريخية العمانية',
    pillar: 'الإنسان والمجتمع',
    priority: 'المواطنة والهوية والتراث والثقافة الوطنية',
    description: 'تعزيز قيم الانتماء والولاء للوطن، وتقدير المسيرة الحضارية والنهضة العمانية، وتأكيد دور سلطنة عمان الريادي كجسر للتواصل والسلام والتعاون الإنساني.',
    targetCompetencies: [
      'المواطنة الفاعلة والمسؤولية المجتمعية',
      'الحوار الحضاري والتسامح الإنساني',
      'الوعي الجيوسياسي لموقع عمان الاستراتيجي',
      'القيادة والمبادرة المجتمعية'
    ],
    classroomApplications: [
      'استعراض تاريخ الأسطول البحري العماني والموانئ ودورها التاريخي في نشر السلام والتجارة العالمية.',
      'إبراز الشخصيات العمانية الملهمة في الملاحة والجغرافيا والعلوم (كأحمد بن ماجد والإدريسي).',
      'ممارسة قيم التسامح والشورى والعمل التطوعي في المهام والأنشطة الصفية واللاصفية.'
    ],
    relatedSubjectCodes: ['soc', 'hist', 'geo']
  },
  {
    id: 'v2040-g-6',
    code: 'V2040-TECH-01',
    title: 'التحول الرقمي وتوظيف نظم المعلومات الجغرافية وتقنيات المستقبل في التعليم',
    pillar: 'الاقتصاد والتنمية',
    priority: 'تقنية المعلومات والاتصالات والتحول الرقمي التعليمي',
    description: 'تمكين المتعلمين والمعلمين من توظيف تقنيات نظم المعلومات الجغرافية (GIS)، الخرائط الرقمية التفاعلية، والاستشعار عن بعد والذكاء الاصطناعي في بيئة التعليم النشط.',
    targetCompetencies: [
      'التحليل الرقمي للخرائط ونظم GIS',
      'التعامل الذكي مع البيانات والمنصات السحابية',
      'التفكير الحسابي واستقراء البيانات الرقمية',
      'الاستخدام المسؤول للتقنيات والذكاء الاصطناعي'
    ],
    classroomApplications: [
      'توظيف الخرائط الرقمية والصور الفضائية في تعيين المواقع وتفسير الظواهر التضاريسية والبشرية.',
      'تدريب الطلاب على استخراج الإحداثيات والبيانات الجغرافية من تطبيقات الأطالس الرقمية.',
      'استخدام العروض التفاعلية والمحاكاة الحاسوبية لتمثيل التغيرات البيئية والمناخية.'
    ],
    relatedSubjectCodes: ['geo', 'tech', 'sci']
  },
  {
    id: 'v2040-g-7',
    code: 'V2040-GOV-01',
    title: 'حوكمة الأداء المدرسي وجودة التعليم الشامل وتكافؤ الفرص التعليمية',
    pillar: 'التشريع والقضاء والرقابة',
    priority: 'حوكمة الجهاز الإداري وتطوير الأداء المدرسي',
    description: 'ترسيخ ممارسات الحوكمة والتقويم المستمر وضمان تكافؤ الفرص التعليمية لكافة الطلبة مع مراعاة الفروق الفردية ودعم الموهوبين والطلبة ذوي صعوبات التعلم.',
    targetCompetencies: [
      'التقييم الذاتي والتطوير المهني المستمر',
      'العدالة والإنصاف وتكافؤ الفرص',
      'مراعاة الفروق الفردية وأنماط التعلم المتنوعة',
      'المسؤولية والالتزام بمعايير الجودة التربوية'
    ],
    classroomApplications: [
      'تطبيق استراتيجيات التمايز وتفريد التعليم لتلبية احتياجات مختلف مستويات الطلاب.',
      'تفعيل بطاقات التقويم الذاتي وتقويم الأقران لبناء شخصية متعلم مسؤول ومستقل.',
      'إتاحة مصادر تعلم متعددة الوسائط تراعي الطلاب البصريين والسمعيين والحركيين.'
    ],
    relatedSubjectCodes: ['ped', 'all']
  }
];

export function getOmanVision2040Goals(): OmanVision2040Goal[] {
  return OMAN_VISION_2040_GOALS;
}

export function getVision2040GoalByCode(code: string): OmanVision2040Goal | undefined {
  return OMAN_VISION_2040_GOALS.find(g => g.code === code);
}

/**
 * Intelligent matching of Oman Vision 2040 goals to any lesson topic
 */
export function matchVision2040GoalsForLesson(
  lessonTitle: string,
  unitTitle: string,
  subjectName: string
): Array<{ code: string; goalTitle: string; applicationInLesson: string }> {
  const combined = `${lessonTitle} ${unitTitle} ${subjectName}`.toLowerCase();
  const selected: Array<{ code: string; goalTitle: string; applicationInLesson: string }> = [];

  // 1. Check for Environmental / Water / Geography / Climate
  if (
    combined.includes('فلج') || combined.includes('أفلاج') || combined.includes('ماء') ||
    combined.includes('مياه') || combined.includes('بيئة') || combined.includes('مناخ') ||
    combined.includes('تضاريس') || combined.includes('جبال') || combined.includes('نبات') ||
    combined.includes('حياد') || combined.includes('استدامة') || combined.includes('سواحل')
  ) {
    const goal = OMAN_VISION_2040_GOALS.find(g => g.code === 'V2040-ENV-01')!;
    selected.push({
      code: goal.code,
      goalTitle: goal.title,
      applicationInLesson: `تطبيق مبادئ الاستدامة البيئية وصون الموارد العمانية عبر مناقشة موضوع (${lessonTitle}) وتوعية الطلاب بأهمية المحافظة على البيئة والتنوع الطبيعي.`
    });
  }

  // 2. Check for Economy / Ports / 2040 / Logistics / Resources / GIS
  if (
    combined.includes('اقتصاد') || combined.includes('ميناء') || combined.includes('دقم') ||
    combined.includes('صحار') || combined.includes('صلالة') || combined.includes('تجارة') ||
    combined.includes('تعدين') || combined.includes('صناعة') || combined.includes('نفط') ||
    combined.includes('غاز') || combined.includes('هيدروجين') || combined.includes('سكان') ||
    combined.includes('عمران') || combined.includes('تقنيات') || combined.includes('خريطة')
  ) {
    const goal = OMAN_VISION_2040_GOALS.find(g => g.code === 'V2040-EDU-02')!;
    selected.push({
      code: goal.code,
      goalTitle: goal.title,
      applicationInLesson: `مواءمة الدرس مع متطلبات اقتصاد المعرفة من خلال ربط موضوع (${lessonTitle}) بمشاريع رؤية عمان 2040 والتنويع الاقتصادي والتحليل المكاني.`
    });
  }

  // 3. Check for History / Heritage / National identity / Citizenship
  if (
    combined.includes('عمان') || combined.includes('وطني') || combined.includes('تاريخ') ||
    combined.includes('حضار') || combined.includes('هرمز') || combined.includes('هوية') ||
    combined.includes('موقع') || combined.includes('نهضة') || combined.includes('دولة') ||
    combined.includes('أحمد بن ماجد') || combined.includes('تراث') || combined.includes('قلعة') ||
    combined.includes('حصن')
  ) {
    const goal = OMAN_VISION_2040_GOALS.find(g => g.code === 'V2040-CIT-01')!;
    selected.push({
      code: goal.code,
      goalTitle: goal.title,
      applicationInLesson: `غرس قيم المواطنة والاعتزاز بالريادة التاريخية العمانية عبر استقراء المنجزات الوطنية وموقع عمان الاستراتيجي في سياق درس (${lessonTitle}).`
    });
  }

  // 4. Check for Digital Transformation, Maps, GIS, Tech
  if (
    combined.includes('خريطة') || combined.includes('خرائط') || combined.includes('gis') ||
    combined.includes('نظم') || combined.includes('تقني') || combined.includes('رقمي') ||
    combined.includes('استشعار') || combined.includes('أطلس') || combined.includes('فضاء') ||
    combined.includes('ذكاء') || combined.includes('بيانات')
  ) {
    const techGoal = OMAN_VISION_2040_GOALS.find(g => g.code === 'V2040-TECH-01')!;
    if (!selected.some(s => s.code === techGoal.code)) {
      selected.push({
        code: techGoal.code,
        goalTitle: techGoal.title,
        applicationInLesson: `توظيف تقنيات الخرائط الرقمية ونظم المعلومات الجغرافية والاستشعار في تنفيذ أنشطة درس (${lessonTitle}) وتنمية المهارات الرقمية.`
      });
    }
  }

  // 5. Always ensure Core Education Goal (V2040-EDU-01) is represented
  const eduGoal = OMAN_VISION_2040_GOALS.find(g => g.code === 'V2040-EDU-01')!;
  if (!selected.some(s => s.code === eduGoal.code)) {
    selected.unshift({
      code: eduGoal.code,
      goalTitle: eduGoal.title,
      applicationInLesson: `إكساب الطلبة مهارات التفكير الناقد والتحليلي والتفكير الجغرافي والاعتزاز بالهوية الوطنية العمانية من خلال أنشطة درس (${lessonTitle}).`
    });
  }

  // 6. If research / investigation oriented, add V2040-EDU-03
  if (selected.length < 2) {
    const resGoal = OMAN_VISION_2040_GOALS.find(g => g.code === 'V2040-EDU-03')!;
    selected.push({
      code: resGoal.code,
      goalTitle: resGoal.title,
      applicationInLesson: `تحفيز مهارات البحث والاستقصاء العلمي لدى الطلبة باستخدام أدوات المكتبة الرقمية والأطالس المعتمدة في دراسة (${lessonTitle}).`
    });
  }

  // 7. If pedagogy/differentiation, add V2040-GOV-01
  if (selected.length < 3 && (combined.includes('طرق') || combined.includes('تقويم') || combined.includes('تمايز') || combined.includes('مهارات'))) {
    const govGoal = OMAN_VISION_2040_GOALS.find(g => g.code === 'V2040-GOV-01')!;
    selected.push({
      code: govGoal.code,
      goalTitle: govGoal.title,
      applicationInLesson: `تحقيق جودة التعلم وتكافؤ الفرص من خلال تنويع استراتيجيات التدريس والتقويم الصفي في درس (${lessonTitle}).`
    });
  }

  return selected.slice(0, 3);
}

/**
 * Assign appropriate Vision 2040 tags to a library resource based on content
 */
export function matchVision2040TagsForResource(resource: {
  title: string;
  description?: string;
  tags: string[];
}): string[] {
  const text = `${resource.title} ${resource.description || ''} ${resource.tags.join(' ')}`.toLowerCase();
  const tags: string[] = ['رؤية عُمان 2040'];

  if (text.includes('تربوي') || text.includes('تدريس') || text.includes('معلم') || text.includes('منهج') || text.includes('دليل')) {
    tags.push('مناهج معززة للقيم والمهارات');
    tags.push('كفاءات وطنية منافسة');
  }
  if (text.includes('عمان') || text.includes('حضار') || text.includes('تاريخ') || text.includes('وطن') || text.includes('مواطن')) {
    tags.push('الهوية الوطنية والتراث العماني');
    tags.push('المواطنة المسؤولة');
  }
  if (text.includes('بيئ') || text.includes('ماء') || text.includes('أفلاج') || text.includes('طبيع') || text.includes('مناخ') || text.includes('جغراف')) {
    tags.push('الاستدامة البيئية وصون الموارد');
  }
  if (text.includes('اقتصاد') || text.includes('موانئ') || text.includes('دقم') || text.includes('تنمي') || text.includes('صناع')) {
    tags.push('اقتصاد المعرفة والتنويع');
    tags.push('مهارات المستقبل والابتكار');
  }
  if (text.includes('تقني') || text.includes('خريط') || text.includes('أطلس') || text.includes('رقمي') || text.includes('gis')) {
    tags.push('التحول الرقمي والتقنيات الذكية');
  }
  if (text.includes('تقويم') || text.includes('إدارة') || text.includes('جودة') || text.includes('تطوير')) {
    tags.push('حوكمة الأداء والجودة المدرسية');
  }

  return Array.from(new Set(tags));
}
