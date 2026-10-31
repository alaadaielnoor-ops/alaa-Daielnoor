import {
  EducationalStage, Grade, Subject, Semester, Unit, Lesson,
  Resource, DocumentPage, DocumentChunk, GeographicResource,
  ExternalReference, GeneratedLesson, Worksheet, Assessment, User,
  AnnualPlan, WeeklyTimetable, OfficialLetter
} from '../types/index.ts';

export function getInitialSeedData() {
  const users: User[] = [
    {
      id: 'usr-admin-1',
      name: 'الاستاذ علاءالدين ضي النور محمد خليفة',
      email: 'arzag111@gmail.com',
      role: 'admin',
      avatarUrl: '/owner_avatar.jpg',
      createdAt: '2026-09-01T08:00:00Z',
    },
    {
      id: 'usr-teacher-1',
      name: 'أ. مريم المعمرية (معلم أول دراسات اجتماعية وجغرافيا)',
      email: 'mariam.teacher@moe.om',
      role: 'teacher',
      createdAt: '2026-09-05T09:30:00Z',
    },
    {
      id: 'usr-viewer-1',
      name: 'سالم الحارثي (متدرب / باحث)',
      email: 'salim.intern@moe.om',
      role: 'viewer',
      createdAt: '2026-09-10T11:00:00Z',
    }
  ];

  // مراحل التعليم المعتمدة في سلطنة عمان (3 مراحل رئيسية)
  const stages: EducationalStage[] = [
    { id: 'stg-1', name: 'التعليم الأساسي - الحلقة الأولى (الصفوف 1 - 4)', order: 1 },
    { id: 'stg-2', name: 'التعليم الأساسي - الحلقة الثانية (الصفوف 5 - 10)', order: 2 },
    { id: 'stg-3', name: 'التعليم ما بعد الأساسي (الصفوف 11 - 12)', order: 3 },
  ];

  // الصفوف الدراسية المعتمدة من الصف الأول إلى الصف الثاني عشر (1 إلى 12)
  const grades: Grade[] = [
    { id: 'grd-1', stageId: 'stg-1', name: 'الصف الأول الأساسي', order: 1 },
    { id: 'grd-2', stageId: 'stg-1', name: 'الصف الثاني الأساسي', order: 2 },
    { id: 'grd-3', stageId: 'stg-1', name: 'الصف الثالث الأساسي', order: 3 },
    { id: 'grd-4', stageId: 'stg-1', name: 'الصف الرابع الأساسي', order: 4 },
    { id: 'grd-5', stageId: 'stg-2', name: 'الصف الخامس الأساسي', order: 5 },
    { id: 'grd-6', stageId: 'stg-2', name: 'الصف السادس الأساسي', order: 6 },
    { id: 'grd-7', stageId: 'stg-2', name: 'الصف السابع الأساسي', order: 7 },
    { id: 'grd-8', stageId: 'stg-2', name: 'الصف الثامن الأساسي', order: 8 },
    { id: 'grd-9', stageId: 'stg-2', name: 'الصف التاسع الأساسي', order: 9 },
    { id: 'grd-10', stageId: 'stg-2', name: 'الصف العاشر الأساسي', order: 10 },
    { id: 'grd-11', stageId: 'stg-3', name: 'الصف الحادي عشر (ما بعد الأساسي)', order: 11 },
    { id: 'grd-12', stageId: 'stg-3', name: 'الصف الثاني عشر (دبلوم التعليم العام)', order: 12 },
  ];

  // المواد الدراسية وفق مناهج وزارة التربية والتعليم في سلطنة عمان
  const subjects: Subject[] = [
    {
      id: 'sbj-cycle1',
      name: 'المهارات الحياتية والبيئة (الحلقة الأولى 1-4)',
      code: 'LIFE-OM-14',
      color: '#0284c7',
      description: 'مفاهيم البيئة المحلية العمانية، الأسرة والمجتمع، والمهارات الشخصية والوطنية للحلقة الأولى'
    },
    {
      id: 'sbj-soc',
      name: 'الدراسات الاجتماعية (الصفوف من 3 إلى 10)',
      code: 'SOC-OM',
      color: '#0d9488',
      description: 'منهج سلطنة عمان المتكامل في الجغرافيا والتاريخ والمواطنة والبيئة العمانية والأفلاج'
    },
    {
      id: 'sbj-gis',
      name: 'الجغرافيا والتقنيات الحديثة (الصف الحادي عشر)',
      code: 'GEO-GIS-11',
      color: '#2563eb',
      description: 'علم الخرائط، ونظم المعلومات الجغرافية (GIS)، والاستشعار عن بعد، والتحليل المكاني'
    },
    {
      id: 'sbj-watani',
      name: 'هذا وطني - تاريخ وجغرافية عمان (الصف الثاني عشر)',
      code: 'WATANI-12',
      color: '#e11d48',
      description: 'المقرر الوطني الشامل لتاريخ وجغرافية سلطنة عمان والتنمية ورؤية عمان 2040'
    },
    {
      id: 'sbj-econ',
      name: 'الجغرافيا الاقتصادية والموارد (الصف الثاني عشر)',
      code: 'GEO-ECON-12',
      color: '#d97706',
      description: 'دراسة الموارد الطبيعية والبشرية والتجارة العالمية والملاحة الدولية'
    },
    {
      id: 'sbj-pedagogy',
      name: 'أدلة المعلم واستراتيجيات التدريس والتقويم - سلطنة عمان',
      code: 'PEDAGOGY-OM',
      color: '#7c3aed',
      description: 'أدلة المعلم الوزارية، مصفوفات المدى والتتابع، استراتيجيات التدريس وجداول المواصفات الامتحانية'
    },
    {
      id: 'sbj-ped-oman',
      name: 'كتب ومراجع تربوية عمانية',
      code: 'PED-OMAN',
      color: '#059669',
      description: 'كتب ومراجع تربوية متخصصة وفلسفة التعليم واستراتيجيات التدريس والتقويم في سلطنة عُمان'
    },
    {
      id: 'sbj-ped-global',
      name: 'مراجع تربوية عالمية (مترجمة بالعربية)',
      code: 'PED-GLOBAL',
      color: '#4f46e5',
      description: 'أمهات المراجع التربوية العالمية ونظريات التعلم وتصميم التدريس وإدارة الصف باللغة العربية'
    },
  ];

  const semesters: Semester[] = [
    { id: 'sem-1', name: 'الفصل الدراسي الأول', order: 1 },
    { id: 'sem-2', name: 'الفصل الدراسي الثاني', order: 2 },
  ];

  // الوحدات الدراسية ممثلة لجميع الصفوف من 1 إلى 12
  const units: Unit[] = [
    // الحلقة الأولى (1 - 4)
    {
      id: 'unt-grd1-1',
      subjectId: 'sbj-cycle1',
      gradeId: 'grd-1',
      semesterId: 'sem-1',
      title: 'الوحدة الأولى: بيئتي ومدرستي في وطني عُمان',
      order: 1,
      description: 'التعرف على البيئة المدرسية، معالم ولايتي في عمان، والنظافة وحماية البيئة'
    },
    {
      id: 'unt-grd2-1',
      subjectId: 'sbj-cycle1',
      gradeId: 'grd-2',
      semesterId: 'sem-1',
      title: 'الوحدة الأولى: مجتمعي العماني وترشيد الموارد',
      order: 1,
      description: 'التعرف على الماء والشجرة في البيئة العمانية، والعادات والتقاليد الأصيلة'
    },
    {
      id: 'unt-grd3-1',
      subjectId: 'sbj-soc',
      gradeId: 'grd-3',
      semesterId: 'sem-1',
      title: 'الوحدة الأولى: وطني عُمان معالم وحضارة',
      order: 1,
      description: 'علم سلطنة عمان، خريطة وطني، البحر والصحراء والجبل في بيئة عمان'
    },
    {
      id: 'unt-grd4-1',
      subjectId: 'sbj-soc',
      gradeId: 'grd-4',
      semesterId: 'sem-1',
      title: 'الوحدة الأولى: جغرافية بيئتي العمانية وثرواتها',
      order: 1,
      description: 'القرية والمدينة العمانية، الحرف التقليدية، وصون الموارد المائية والشاطئية'
    },
    // الحلقة الثانية (5 - 10)
    {
      id: 'unt-soc5-1',
      subjectId: 'sbj-soc',
      gradeId: 'grd-5',
      semesterId: 'sem-1',
      title: 'الوحدة الأولى: محافظات سلطنة عمان وتضاريسها',
      order: 1,
      description: 'المحافظات الإحدى عشرة، سلسلة جبال الحجر (جبل شمس والجبل الأخضر)، سهل الباطنة، وجبال ظفار'
    },
    {
      id: 'unt-soc6-1',
      subjectId: 'sbj-soc',
      gradeId: 'grd-6',
      semesterId: 'sem-1',
      title: 'الوحدة الأولى: الموارد المائية ونظام الأفلاج في سلطنة عمان',
      order: 1,
      description: 'أنواع الأفلاج العمانية (الداوودية، الغيلية، العينية)، توزيعها الجغرافي، وأفلاج عمان المدرجة في اليونسكو'
    },
    {
      id: 'unt-soc7-1',
      subjectId: 'sbj-soc',
      gradeId: 'grd-7',
      semesterId: 'sem-1',
      title: 'الوحدة الأولى: جغرافية شبه الجزيرة العربية والوطن العربي',
      order: 1,
      description: 'موقع شبه الجزيرة العربية، سواحل سلطنة عمان المشرفة على بحر العرب وبحر عمان، والتكامل الاقتصادي'
    },
    {
      id: 'unt-soc8-1',
      subjectId: 'sbj-soc',
      gradeId: 'grd-8',
      semesterId: 'sem-1',
      title: 'الوحدة الأولى: قارات العالم والتواصل الملاحي والتجاري العماني',
      order: 1,
      description: 'طرق التجارة البحرية العمانية التاريخية إلى الصين والهند وشرق إفريقيا (زنجبار وممباسا)، واكتشافات أحمد بن ماجد'
    },
    {
      id: 'unt-soc9-1',
      subjectId: 'sbj-soc',
      gradeId: 'grd-9',
      semesterId: 'sem-1',
      title: 'الوحدة الأولى: الجغرافيا العامة والغلاف الصخري والمناخي',
      order: 1,
      description: 'طبقات الأرض، الحركات التكتونية وتشكل الجبال في عمان، والأنماط المناخية والأنواء المدارية في بحر العرب'
    },
    {
      id: 'unt-soc10-1',
      subjectId: 'sbj-soc',
      gradeId: 'grd-10',
      semesterId: 'sem-1',
      title: 'الوحدة الأولى: جغرافية سلطنة عمان الحديثة والبيئة والتنمية المستدامة',
      order: 1,
      description: 'النمو السكاني، التوزيع الجغرافي للمدن، المحميات الطبيعية العمانية (المها، الديمانيات، السلاحف برأس الحد)'
    },
    // ما بعد الأساسي (11 - 12)
    {
      id: 'unt-gis-1',
      subjectId: 'sbj-gis',
      gradeId: 'grd-11',
      semesterId: 'sem-1',
      title: 'الوحدة الأولى: علم الخرائط ومساقط التمثيل الكارتوغرافي',
      order: 1,
      description: 'مبادئ علم الخرائط، مقاييس الرسم، مساقط الخرائط وتطبيقاتها في سلطنة عمان، ونظام الإحداثيات العالمي (UTM)'
    },
    {
      id: 'unt-gis-2',
      subjectId: 'sbj-gis',
      gradeId: 'grd-11',
      semesterId: 'sem-2',
      title: 'الوحدة الثانية: الاستشعار عن بعد ونظم المعلومات الجغرافية (GIS)',
      order: 2,
      description: 'أسس الاستشعار عن بعد، الصور الفضائية والجوية، بنية نظم المعلومات الجغرافية (الطبقات والتحليل المكاني)، وإدارة الأزمات والمخاطر'
    },
    {
      id: 'unt-watani-1',
      subjectId: 'sbj-watani',
      gradeId: 'grd-12',
      semesterId: 'sem-1',
      title: 'الوحدة الأولى: عُمان المكان والحضارة والتنوع التضاريسي',
      order: 1,
      description: 'الموقع الاستراتيجي لسلطنة عمان على مضيق هرمز وبحر عمان وبحر العرب، التضاريس وسلاسل جبال الحجر وظفار، والتراث الحضاري'
    },
    {
      id: 'unt-watani-2',
      subjectId: 'sbj-watani',
      gradeId: 'grd-12',
      semesterId: 'sem-2',
      title: 'الوحدة الثانية: التنمية المستدامة ورؤية عُمان 2040',
      order: 2,
      description: 'محاور رؤية عمان 2040، التنويع الاقتصادي، الموانئ والمناطق الحرة (صحار والدقم وصلالة)، وحماية البيئة وصون الموارد'
    },
    {
      id: 'unt-econ12-1',
      subjectId: 'sbj-econ',
      gradeId: 'grd-12',
      semesterId: 'sem-1',
      title: 'الوحدة الأولى: الموارد الطبيعية والملاحة والتجارة الدولية',
      order: 1,
      description: 'مصادر الطاقة والهيدروجين الأخضر، الممرات الملاحية الدولية وموقع عمان على خطوط التجارة العالمية'
    }
  ];

  // الدروس التعليمية
  const lessons: Lesson[] = [
    {
      id: 'lsn-grd1-1',
      unitId: 'unt-grd1-1',
      title: 'الدرس الأول: معالم بيئتي المدرسية والمحلية في عُمان',
      order: 1,
      objectives: [
        'أن يتعرف الطالب على مكونات بيئته المدرسية والمحلية',
        'أن يلاحظ مظاهر الطبيعة في ولايته العمانية (الجبل، الشاطئ، النخلة)',
        'أن يمارس سلوكيات إيجابية في الحفاظ على النظافة وترشيد الماء'
      ],
      concepts: ['البيئة المحلية', 'الولاية العمانية', 'النخلة', 'ترشيد المياه']
    },
    {
      id: 'lsn-grd3-1',
      unitId: 'unt-grd3-1',
      title: 'الدرس الأول: معالم وطني عمان وألوان العلم الوطني',
      order: 1,
      objectives: [
        'أن يفسر الطالب دلالات ألوان العلم العماني وشعار السيفين والخنجر',
        'أن يحدد موقع سلطنة عمان على خريطة مبسطة',
        'أن يعبر عن حبه واعتزازه بوطنه وسلطانه'
      ],
      concepts: ['العلم العماني', 'الخنجر والسيفان', 'خريطة عمان', 'مسقط']
    },
    {
      id: 'lsn-soc5-1',
      unitId: 'unt-soc5-1',
      title: 'الدرس الأول: محافظات سلطنة عمان الإحدى عشرة',
      order: 1,
      objectives: [
        'أن يعدد الطالب المحافظات الإحدى عشرة في سلطنة عمان',
        'أن يحدد على الخريطة الإدارية موقع محافظة مسقط وظفار ومسندم والداخلية',
        'أن يستنتج التنوع الجغرافي والبيئي بين محافظات السلطنة'
      ],
      concepts: ['المحافظات الإحدى عشرة', 'محافظة مسقط', 'ظفار', 'مسندم', 'التقسيم الإداري']
    },
    {
      id: 'lsn-soc6-1',
      unitId: 'unt-soc6-1',
      title: 'الدرس الأول: نظام الأفلاج العمانية وإدارة الموارد المائية',
      order: 1,
      objectives: [
        'أن يقارن الطالب بين الأفلاج الداوودية والأفلاج الغيلية والأفلاج العينية',
        'أن يذكر أسماء الأفلاج العمانية الخمسة المدرجة في قائمة التراث العالمي باليونسكو',
        'أن يشرح النظام الاجتماعي التقليدي لتوزيع مياه الأفلاج (الأثر، الطاسة، والعوامد)'
      ],
      concepts: ['الأفلاج الداوودية', 'الأفلاج الغيلية', 'الأفلاج العينية', 'فلج دارس', 'فلج الخطمين', 'اليونسكو', 'قسمة المياه (الأثر)']
    },
    {
      id: 'lsn-soc7-1',
      unitId: 'unt-soc7-1',
      title: 'الدرس الأول: موقع شبه الجزيرة العربية وسواحل سلطنة عمان',
      order: 1,
      objectives: [
        'أن يحدد الموقع الفلكي والجغرافي لشبه الجزيرة العربية',
        'أن يبرز أهمية السواحل العمانية المطلة على بحر العرب وبحر عمان',
        'أن يوضح أثر الموقع الجغرافي في تنوع الأنشطة الاقتصادية والملاحة'
      ],
      concepts: ['شبه الجزيرة العربية', 'بحر العرب', 'بحر عمان', 'الملاحة الساحلية']
    },
    {
      id: 'lsn-soc8-1',
      unitId: 'unt-soc8-1',
      title: 'الدرس الأول: الريادة البحرية العمانية والملاح أحمد بن ماجد',
      order: 1,
      objectives: [
        'أن يتتبع مسارات الأسطول البحري العماني إلى الصين وشرق إفريقيا',
        'أن يثمن إسهامات أسد البحار الملاح العماني أحمد بن ماجد في علوم الملاحة والبوصلة',
        'أن يربط بين التجارة التاريخية وازدهار موانئ صحار ومسقط وقلهات'
      ],
      concepts: ['أحمد بن ماجد', 'الأسد البحار', 'حاوية السلوقي', 'طريق الحرير البحري', 'قلهات']
    },
    {
      id: 'lsn-soc10-1',
      unitId: 'unt-soc10-1',
      title: 'الدرس الأول: المحميات الطبيعية والتنوع الإحيائي في سلطنة عمان',
      order: 1,
      objectives: [
        'أن يحدد مواقع المحميات الطبيعية العمانية الرئيسية على الخريطة',
        'أن يفسر أسباب إنشاء محمية المها العربية ومحمية جزر الديمانيات ومحمية رأس الحد للسلاحف',
        'أن يقترح مبادرات لتعزيز السياحة البيئية المستدامة في السلطنة'
      ],
      concepts: ['المحميات الطبيعية', 'محمية جزر الديمانيات', 'محمية السلاحف برأس الحد', 'المها العربية', 'السياحة البيئية']
    },
    {
      id: 'lsn-gis-1',
      unitId: 'unt-gis-2',
      title: 'الدرس الأول: نظم المعلومات الجغرافية (GIS) وتطبيقاتها في التخطيط العماني',
      order: 1,
      objectives: [
        'أن يوضح الطالب مكونات نظام المعلومات الجغرافي (الأجهزة، البرمجيات، البيانات المكانية، الأفراد)',
        'أن يشرح مفهوم الطبقات الرقمية (Layers) وتمثيل المعالم النقطية والخطية والمساحية',
        'أن يقدر دور الهيئة الوطنية للمساحة ونظم المعلومات الجغرافية في دعم التخطيط العمراني وإدارة الكوارث في سلطنة عمان'
      ],
      concepts: ['نظم المعلومات الجغرافية (GIS)', 'الطبقات الجغرافية', 'البيانات النقطية والخطية', 'التحليل المكاني', 'الهيئة الوطنية للمساحة']
    },
    {
      id: 'lsn-watani-1',
      unitId: 'unt-watani-1',
      title: 'الدرس الأول: الموقع الجغرافي لسلطنة عمان وأهميته الاستراتيجية',
      order: 1,
      objectives: [
        'أن يحدد الطالب إحداثيات موقع سلطنة عمان الفلكي والجغرافي بدقة',
        'أن يفسر الأهمية الجيوسياسية لمضيق هرمز وبحر عمان وبحر العرب عبر العصور',
        'أن يستنتج أثر الموقع البحري في ازدهار الملاحة والتجارة العمانية مع الهند وشرق إفريقيا'
      ],
      concepts: ['الموقع الاستراتيجي', 'مضيق هرمز', 'بحر عمان', 'بحر العرب', 'رأس الحد', 'الملاحة العمانية']
    },
    {
      id: 'lsn-watani-2',
      unitId: 'unt-watani-1',
      title: 'الدرس الثاني: التنوع الجيومورفولوجي وتضاريس سلطنة عمان الكبرى',
      order: 2,
      objectives: [
        'أن يصف الطالب المعالم التضاريسية لسلسلة جبال الحجر (الغربي والشرقي) وقمة جبل شمس',
        'أن يحدد على الخريطة امتداد سهل الباطنة وجبال ظفار وصحراء رمال آل وهيبة',
        'أن يوضح أثر التضاريس في تنوع المناخ والأنشطة الاقتصادية في سلطنة عمان'
      ],
      concepts: ['جبال الحجر', 'جبل شمس (3009 أمتار)', 'الجبل الأخضر', 'جبال ظفار', 'سهل الباطنة', 'رمال آل وهيبة']
    },
    {
      id: 'lsn-watani-3',
      unitId: 'unt-watani-2',
      title: 'الدرس الثالث: رؤية عُمان 2040 والموانئ الاستراتيجية',
      order: 3,
      objectives: [
        'أن يحلل الطالب محاور رؤية عمان 2040 في التنويع الاقتصادي المستدام',
        'أن يحدد المزايا الجيواقتصادية لموانئ الدقم وصحار وصلالة',
        'أن يستكشف المشروعات المستقبلية في الهيدروجين الأخضر والطاقة النظيفة'
      ],
      concepts: ['رؤية عمان 2040', 'ميناء الدقم', 'ميناء صحار', 'ميناء صلالة', 'الهيدروجين الأخضر', 'التنويع الاقتصادي']
    }
  ];

  // الكتب المدرسية وأدلة المعلم الصادرة عن وزارة التربية والتعليم بسلطنة عمان (تغطي الصفوف من 1 إلى 12)
  const resources: Resource[] = [
    // --- الصف الأول الأساسي ---
    {
      id: 'res-om-grd1-tb',
      title: 'كتاب الطالب والأنشطة: المهارات الحياتية والبيئة (الصف الأول الأساسي)',
      author: 'المديرية العامة لتطوير المناهج - وزارة التربية والتعليم - سلطنة عمان',
      publisher: 'مطابع وزارة التربية والتعليم - مسقط',
      publicationYear: 2024,
      language: 'العربية',
      type: 'textbook',
      format: 'pdf',
      sourceUrl: 'https://home.moe.gov.om/curricula/grade1/life-skills',
      license: 'حقوق الطبع محفوظة لوزارة التربية والتعليم بسلطنة عمان',
      description: 'كتاب أنشطة الحلقة الأولى للصف الأول الأساسي. يتضمن مفاهيم البيئة العمانية، الولاية والمدرسة، المحافظة على المياه والشجرة والنظافة العامة.',
      subjectId: 'sbj-cycle1',
      stageId: 'stg-1',
      gradeId: 'grd-1',
      unitId: 'unt-grd1-1',
      lessonId: 'lsn-grd1-1',
      reliability: 'official',
      tags: ['الصف الأول', 'سلطنة عمان', 'كتاب الطالب', 'المهارات الحياتية', 'الحلقة الأولى', 'البيئة المدرسية'],
      keywords: ['الصف الأول عمان', 'البيئة المدرسية', 'ترشيد المياه', 'النخلة العمانية', 'النظافة'],
      fileSize: 11200000,
      fileName: 'grade1_life_skills_oman_moe.pdf',
      fileHash: 'h01a1b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef',
      pageCount: 84,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-admin-1',
      createdAt: '2026-09-01T08:30:00Z',
      updatedAt: '2026-09-01T08:30:00Z'
    },
    {
      id: 'res-om-grd1-tg',
      title: 'دليل المعلم: المهارات الحياتية والأنشطة المتكاملة (الصف الأول الأساسي)',
      author: 'المديرية العامة لتطوير المناهج - وزارة التربية والتعليم - سلطنة عمان',
      publisher: 'وزارة التربية والتعليم - مسقط',
      publicationYear: 2024,
      language: 'العربية',
      type: 'teacher_guide',
      format: 'pdf',
      sourceUrl: 'https://home.moe.gov.om/curricula/grade1/teacher-guide',
      license: 'ترخيص المعلمين الرسمي - وزارة التربية والتعليم بسلطنة عمان',
      description: 'دليل المعلم للصف الأول الأساسي متضمناً مصفوفة المدى والتتابع، استراتيجيات التعلم باللعب والملاحظة، وبطاقات الملاحظة السلوكية والتقويم التكويني.',
      subjectId: 'sbj-pedagogy',
      stageId: 'stg-1',
      gradeId: 'grd-1',
      unitId: 'unt-grd1-1',
      reliability: 'official',
      tags: ['دليل المعلم', 'الصف الأول', 'سلطنة عمان', 'استراتيجيات الحلقة الأولى', 'تقويم تكويني'],
      keywords: ['دليل المعلم صف أول', 'نواتج التعلم', 'التعلم باللعب', 'بطاقة الملاحظة العمانية'],
      fileSize: 9800000,
      fileName: 'teacher_guide_grade1_oman_moe.pdf',
      fileHash: 'h01b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef',
      pageCount: 102,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-admin-1',
      createdAt: '2026-09-01T08:45:00Z',
      updatedAt: '2026-09-01T08:45:00Z'
    },

    // --- الصف الثاني الأساسي ---
    {
      id: 'res-om-grd2-tb',
      title: 'كتاب الطالب: بيئتي ومجتمعي العماني (الصف الثاني الأساسي)',
      author: 'المديرية العامة لتطوير المناهج - وزارة التربية والتعليم - سلطنة عمان',
      publisher: 'مطابع وزارة التربية والتعليم - مسقط',
      publicationYear: 2024,
      language: 'العربية',
      type: 'textbook',
      format: 'pdf',
      sourceUrl: 'https://home.moe.gov.om/curricula/grade2/social-environment',
      license: 'حقوق الطبع محفوظة لوزارة التربية والتعليم بسلطنة عمان',
      description: 'كتاب الطالب للصف الثاني، يتناول الأسرة والمجتمع والتعرف على مظاهر الطبيعة والموارد المائية والعادات العمانية.',
      subjectId: 'sbj-cycle1',
      stageId: 'stg-1',
      gradeId: 'grd-2',
      unitId: 'unt-grd2-1',
      reliability: 'official',
      tags: ['الصف الثاني', 'سلطنة عمان', 'كتاب الطالب', 'بيئتي ومجتمعي', 'الحلقة الأولى'],
      keywords: ['الصف الثاني الأساسي', 'المجتمع العماني', 'الأسرة العمانية', 'ترشيد الموارد'],
      fileSize: 12500000,
      fileName: 'grade2_environment_oman_moe.pdf',
      fileHash: 'h02a1b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef',
      pageCount: 92,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-admin-1',
      createdAt: '2026-09-01T09:00:00Z',
      updatedAt: '2026-09-01T09:00:00Z'
    },
    {
      id: 'res-om-grd2-tg',
      title: 'دليل المعلم: منهج الحلقة الأولى والأنشطة الاستقصائية (الصف الثاني الأساسي)',
      author: 'المديرية العامة لتطوير المناهج - سلطنة عمان',
      publisher: 'وزارة التربية والتعليم - مسقط',
      publicationYear: 2024,
      language: 'العربية',
      type: 'teacher_guide',
      format: 'pdf',
      sourceUrl: 'https://home.moe.gov.om/curricula/grade2/teacher-guide',
      license: 'ترخيص المعلمين الرسمي - سلطنة عمان',
      description: 'إرشادات تدريسية للمعلم، استراتيجيات الاستقصاء البسيط وتفعيل مسرح الدمى واللوحات المصورة لطلبة الصف الثاني.',
      subjectId: 'sbj-pedagogy',
      stageId: 'stg-1',
      gradeId: 'grd-2',
      unitId: 'unt-grd2-1',
      reliability: 'official',
      tags: ['دليل المعلم', 'الصف الثاني', 'سلطنة عمان', 'استراتيجيات تدريس'],
      keywords: ['دليل المعلم صف ثاني عمان', 'الأنشطة الاستقصائية', 'التقويم التكويني'],
      fileSize: 10400000,
      fileName: 'teacher_guide_grade2_oman_moe.pdf',
      fileHash: 'h02b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef',
      pageCount: 110,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-admin-1',
      createdAt: '2026-09-01T09:15:00Z',
      updatedAt: '2026-09-01T09:15:00Z'
    },

    // --- الصف الثالث الأساسي ---
    {
      id: 'res-om-grd3-tb',
      title: 'كتاب الطالب: الدراسات الاجتماعية - وطني عمان ومعالم بيئتي (الصف الثالث الأساسي)',
      author: 'المديرية العامة لتطوير المناهج - وزارة التربية والتعليم - سلطنة عمان',
      publisher: 'مطابع وزارة التربية والتعليم - مسقط',
      publicationYear: 2024,
      language: 'العربية',
      type: 'textbook',
      format: 'pdf',
      sourceUrl: 'https://home.moe.gov.om/curricula/grade3/social-studies',
      license: 'حقوق الطبع محفوظة لوزارة التربية والتعليم بسلطنة عمان',
      description: 'كتاب دراسات اجتماعية مبسط يتناول علم السلطنة، الخريطة البسيطة، البحار العمانية، والجبال والواحات.',
      subjectId: 'sbj-soc',
      stageId: 'stg-1',
      gradeId: 'grd-3',
      unitId: 'unt-grd3-1',
      lessonId: 'lsn-grd3-1',
      reliability: 'official',
      tags: ['الصف الثالث', 'سلطنة عمان', 'دراسات اجتماعية', 'كتاب الطالب', 'وطني عمان'],
      keywords: ['الصف الثالث دراسات اجتماعية', 'علم عمان', 'خريطة سلطنة عمان', 'مسقط'],
      fileSize: 14200000,
      fileName: 'grade3_social_studies_oman_moe.pdf',
      fileHash: 'h03a1b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef',
      pageCount: 104,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-admin-1',
      createdAt: '2026-09-01T09:30:00Z',
      updatedAt: '2026-09-01T09:30:00Z'
    },
    {
      id: 'res-om-grd3-tg',
      title: 'دليل المعلم: الدراسات الاجتماعية للصف الثالث الأساسي',
      author: 'المديرية العامة لتطوير المناهج - سلطنة عمان',
      publisher: 'وزارة التربية والتعليم - مسقط',
      publicationYear: 2024,
      language: 'العربية',
      type: 'teacher_guide',
      format: 'pdf',
      sourceUrl: 'https://home.moe.gov.om/curricula/grade3/teacher-guide',
      license: 'ترخيص المعلمين الرسمي - سلطنة عمان',
      description: 'دليل المعلم لمنهج الدراسات الاجتماعية للصف الثالث، يتضمن نواتج التعلم، معايير الأداء والأنشطة الإثرائية.',
      subjectId: 'sbj-pedagogy',
      stageId: 'stg-1',
      gradeId: 'grd-3',
      unitId: 'unt-grd3-1',
      reliability: 'official',
      tags: ['دليل المعلم', 'الصف الثالث', 'سلطنة عمان', 'دراسات اجتماعية'],
      keywords: ['دليل معلم صف ثالث عمان', 'معايير الأداء', 'التقويم المستمر'],
      fileSize: 11100000,
      fileName: 'teacher_guide_grade3_social_oman.pdf',
      fileHash: 'h03b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef',
      pageCount: 118,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-teacher-1',
      createdAt: '2026-09-01T09:45:00Z',
      updatedAt: '2026-09-01T09:45:00Z'
    },

    // --- الصف الرابع الأساسي ---
    {
      id: 'res-om-grd4-tb',
      title: 'كتاب الطالب: الدراسات الاجتماعية - مجتمعي وبيئتي العمانية (الصف الرابع الأساسي)',
      author: 'المديرية العامة لتطوير المناهج - وزارة التربية والتعليم - سلطنة عمان',
      publisher: 'مطابع وزارة التربية والتعليم - مسقط',
      publicationYear: 2024,
      language: 'العربية',
      type: 'textbook',
      format: 'pdf',
      sourceUrl: 'https://home.moe.gov.om/curricula/grade4/social-studies',
      license: 'حقوق الطبع محفوظة لوزارة التربية والتعليم بسلطنة عمان',
      description: 'كتاب الدراسات الاجتماعية للصف الرابع، يتناول التضاريس والمهن التراثية العمانية (صيد الأسماك والزراعة) وحماية البيئة الساحلية.',
      subjectId: 'sbj-soc',
      stageId: 'stg-1',
      gradeId: 'grd-4',
      unitId: 'unt-grd4-1',
      reliability: 'official',
      tags: ['الصف الرابع', 'سلطنة عمان', 'دراسات اجتماعية', 'كتاب الطالب', 'بيئتي العمانية'],
      keywords: ['الصف الرابع دراسات اجتماعية', 'المهن العمانية', 'صيد الأسماك', 'البيئة الساحلية'],
      fileSize: 15600000,
      fileName: 'grade4_social_studies_oman_moe.pdf',
      fileHash: 'h04a1b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef',
      pageCount: 112,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-admin-1',
      createdAt: '2026-09-01T10:00:00Z',
      updatedAt: '2026-09-01T10:00:00Z'
    },
    {
      id: 'res-om-grd4-tg',
      title: 'دليل المعلم: الدراسات الاجتماعية للصف الرابع الأساسي (استراتيجيات وتقويم)',
      author: 'المديرية العامة لتطوير المناهج - سلطنة عمان',
      publisher: 'وزارة التربية والتعليم - مسقط',
      publicationYear: 2024,
      language: 'العربية',
      type: 'teacher_guide',
      format: 'pdf',
      sourceUrl: 'https://home.moe.gov.om/curricula/grade4/teacher-guide',
      license: 'ترخيص المعلمين المعتمد - سلطنة عمان',
      description: 'دليل المعلم للصف الرابع الأساسي يتضمن نماذج تحضير الدروس، استراتيجيات خرائط المفاهيم والرحلات الميدانية الافتراضية.',
      subjectId: 'sbj-pedagogy',
      stageId: 'stg-1',
      gradeId: 'grd-4',
      unitId: 'unt-grd4-1',
      reliability: 'official',
      tags: ['دليل المعلم', 'الصف الرابع', 'سلطنة عمان', 'خرائط مفاهيم'],
      keywords: ['دليل المعلم صف رابع عمان', 'تحضير الدروس', 'أنشطة لا صفية'],
      fileSize: 12200000,
      fileName: 'teacher_guide_grade4_social_oman.pdf',
      fileHash: 'h04b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef',
      pageCount: 126,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-teacher-1',
      createdAt: '2026-09-01T10:15:00Z',
      updatedAt: '2026-09-01T10:15:00Z'
    },

    // --- الصف الخامس الأساسي ---
    {
      id: 'res-om-grd5-tb',
      title: 'كتاب الطالب: الدراسات الاجتماعية - محافظات عمان وتضاريسها (الصف الخامس الأساسي)',
      author: 'المديرية العامة لتطوير المناهج - وزارة التربية والتعليم - سلطنة عمان',
      publisher: 'مطابع وزارة التربية والتعليم - مسقط',
      publicationYear: 2024,
      language: 'العربية',
      type: 'textbook',
      format: 'pdf',
      sourceUrl: 'https://home.moe.gov.om/curricula/grade5/social-studies',
      license: 'حقوق الطبع محفوظة لوزارة التربية والتعليم بسلطنة عمان',
      description: 'دراسة تفصيلية للمحافظات الإحدى عشرة، المعالم الجغرافية الكبرى (سلاسل جبال الحجر، جبل شمس، سهل الباطنة، جبال ظفار).',
      subjectId: 'sbj-soc',
      stageId: 'stg-2',
      gradeId: 'grd-5',
      unitId: 'unt-soc5-1',
      lessonId: 'lsn-soc5-1',
      reliability: 'official',
      tags: ['الصف الخامس', 'سلطنة عمان', 'دراسات اجتماعية', 'المحافظات الإحدى عشرة', 'جبال الحجر'],
      keywords: ['محافظات سلطنة عمان', 'جبل شمس', 'الجبل الأخضر', 'سهل الباطنة', 'ظفار'],
      fileSize: 17800000,
      fileName: 'grade5_social_studies_oman_moe.pdf',
      fileHash: 'h05a1b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef',
      pageCount: 130,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-admin-1',
      createdAt: '2026-09-02T10:00:00Z',
      updatedAt: '2026-09-02T10:00:00Z'
    },
    {
      id: 'res-om-grd5-tg',
      title: 'دليل المعلم: الدراسات الاجتماعية للصف الخامس الأساسي',
      author: 'المديرية العامة لتطوير المناهج - سلطنة عمان',
      publisher: 'وزارة التربية والتعليم - مسقط',
      publicationYear: 2024,
      language: 'العربية',
      type: 'teacher_guide',
      format: 'pdf',
      sourceUrl: 'https://home.moe.gov.om/curricula/grade5/teacher-guide',
      license: 'ترخيص المعلمين الرسمي - سلطنة عمان',
      description: 'دليل تدريس محافظات وتضاريس عمان، توظيف الخرائط الصماء، وتطبيقات التعلم التعاوني وأسئلة مستويات بلوم العليا.',
      subjectId: 'sbj-pedagogy',
      stageId: 'stg-2',
      gradeId: 'grd-5',
      unitId: 'unt-soc5-1',
      reliability: 'official',
      tags: ['دليل المعلم', 'الصف الخامس', 'سلطنة عمان', 'خرائط صماء'],
      keywords: ['دليل المعلم صف خامس عمان', 'توزيع المحافظات', 'تقويم تكويني'],
      fileSize: 13500000,
      fileName: 'teacher_guide_grade5_social_oman.pdf',
      fileHash: 'h05b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef',
      pageCount: 138,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-teacher-1',
      createdAt: '2026-09-02T10:15:00Z',
      updatedAt: '2026-09-02T10:15:00Z'
    },

    // --- الصف السادس الأساسي ---
    {
      id: 'res-om-105',
      title: 'كتاب الطالب: الدراسات الاجتماعية - الموارد والأفلاج العمانية (الصف السادس الأساسي)',
      author: 'المديرية العامة لتطوير المناهج - وزارة التربية والتعليم - سلطنة عمان',
      publisher: 'مطابع وزارة التربية والتعليم - مسقط',
      publicationYear: 2024,
      language: 'العربية',
      type: 'textbook',
      format: 'pdf',
      sourceUrl: 'https://home.moe.gov.om/curricula/grade6/social-studies',
      license: 'حقوق الطبع محفوظة لوزارة التربية والتعليم بسلطنة عمان',
      description: 'يتضمن دراسة المياه والأفلاج العمانية (الداوودية والغيلية والعينية)، الغلاف الجوي، الطقس والمناخ، وخريف ظفار.',
      subjectId: 'sbj-soc',
      stageId: 'stg-2',
      gradeId: 'grd-6',
      unitId: 'unt-soc6-1',
      lessonId: 'lsn-soc6-1',
      reliability: 'official',
      tags: ['دراسات اجتماعية', 'الصف السادس', 'سلطنة عمان', 'الأفلاج', 'المياه الجوفية', 'خريف ظفار'],
      keywords: ['فلج دارس', 'فلج الخطمين', 'الأفلاج الداوودية', 'الغيلية', 'العينية', 'صلالة'],
      fileSize: 18900000,
      fileName: 'social_studies_grade6_oman_moe.pdf',
      fileHash: 'e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef04',
      pageCount: 122,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-admin-1',
      createdAt: '2026-09-02T11:00:00Z',
      updatedAt: '2026-09-02T11:00:00Z'
    },
    {
      id: 'res-om-grd6-tg',
      title: 'دليل المعلم: الدراسات الاجتماعية للصف السادس الأساسي (أنشطة وتجارب تدريسية)',
      author: 'المديرية العامة لتطوير المناهج - سلطنة عمان',
      publisher: 'وزارة التربية والتعليم - مسقط',
      publicationYear: 2024,
      language: 'العربية',
      type: 'teacher_guide',
      format: 'pdf',
      sourceUrl: 'https://home.moe.gov.om/curricula/grade6/teacher-guide',
      license: 'ترخيص المعلمين الرسمي - سلطنة عمان',
      description: 'دليل إرشادي لمعلمي الصف السادس يركز على استراتيجيات تدريس الموارد المائية، شرح هندسة الأفلاج وتطبيقات الخرائط الصماء وأفلاج اليونسكو.',
      subjectId: 'sbj-pedagogy',
      stageId: 'stg-2',
      gradeId: 'grd-6',
      unitId: 'unt-soc6-1',
      reliability: 'official',
      tags: ['دليل المعلم', 'الصف السادس', 'سلطنة عمان', 'أفلاج عمان', 'اليونسكو'],
      keywords: ['دليل المعلم صف سادس عمان', 'أفلاج التراث العالمي', 'توزيع المياه'],
      fileSize: 13900000,
      fileName: 'teacher_guide_grade6_social_oman.pdf',
      fileHash: 'h06b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef',
      pageCount: 142,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-teacher-1',
      createdAt: '2026-09-02T11:15:00Z',
      updatedAt: '2026-09-02T11:15:00Z'
    },

    // --- الصف السابع الأساسي ---
    {
      id: 'res-om-grd7-tb',
      title: 'كتاب الطالب: الدراسات الاجتماعية - شبه الجزيرة العربية والوطن العربي (الصف السابع)',
      author: 'المديرية العامة لتطوير المناهج - وزارة التربية والتعليم - سلطنة عمان',
      publisher: 'مطابع وزارة التربية والتعليم - مسقط',
      publicationYear: 2024,
      language: 'العربية',
      type: 'textbook',
      format: 'pdf',
      sourceUrl: 'https://home.moe.gov.om/curricula/grade7/social-studies',
      license: 'حقوق الطبع محفوظة لوزارة التربية والتعليم بسلطنة عمان',
      description: 'دراسة الموقع الفلكي والجغرافي لشبه الجزيرة العربية، السواحل العمانية والممرات المائية، والموارد الطبيعية المشتركة.',
      subjectId: 'sbj-soc',
      stageId: 'stg-2',
      gradeId: 'grd-7',
      unitId: 'unt-soc7-1',
      lessonId: 'lsn-soc7-1',
      reliability: 'official',
      tags: ['الصف السابع', 'سلطنة عمان', 'دراسات اجتماعية', 'شبه الجزيرة العربية', 'الوطن العربي'],
      keywords: ['الصف السابع عمان', 'بحر العرب', 'بحر عمان', 'شبه الجزيرة العربية'],
      fileSize: 19400000,
      fileName: 'grade7_social_studies_oman_moe.pdf',
      fileHash: 'h07a1b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef',
      pageCount: 136,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-admin-1',
      createdAt: '2026-09-02T12:00:00Z',
      updatedAt: '2026-09-02T12:00:00Z'
    },
    {
      id: 'res-om-grd7-tg',
      title: 'دليل المعلم: الدراسات الاجتماعية للصف السابع الأساسي',
      author: 'المديرية العامة لتطوير المناهج - سلطنة عمان',
      publisher: 'وزارة التربية والتعليم - مسقط',
      publicationYear: 2024,
      language: 'العربية',
      type: 'teacher_guide',
      format: 'pdf',
      sourceUrl: 'https://home.moe.gov.om/curricula/grade7/teacher-guide',
      license: 'ترخيص المعلمين المعتمد - سلطنة عمان',
      description: 'دليل المعلم لمنهج الدراسات الاجتماعية للصف السابع، متضمناً جدول المواصفات ونماذج الاختبارات القصيرة وأوراق العمل.',
      subjectId: 'sbj-pedagogy',
      stageId: 'stg-2',
      gradeId: 'grd-7',
      unitId: 'unt-soc7-1',
      reliability: 'official',
      tags: ['دليل المعلم', 'الصف السابع', 'سلطنة عمان', 'جدول المواصفات'],
      keywords: ['دليل المعلم صف سابع عمان', 'الاختبارات القصيرة', 'استراتيجيات التدريس'],
      fileSize: 12800000,
      fileName: 'teacher_guide_grade7_social_oman.pdf',
      fileHash: 'h07b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef',
      pageCount: 130,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-teacher-1',
      createdAt: '2026-09-02T12:15:00Z',
      updatedAt: '2026-09-02T12:15:00Z'
    },

    // --- الصف الثامن الأساسي ---
    {
      id: 'res-om-grd8-tb',
      title: 'كتاب الطالب: الدراسات الاجتماعية - قارات العالم والتواصل العماني (الصف الثامن)',
      author: 'المديرية العامة لتطوير المناهج - وزارة التربية والتعليم - سلطنة عمان',
      publisher: 'مطابع وزارة التربية والتعليم - مسقط',
      publicationYear: 2024,
      language: 'العربية',
      type: 'textbook',
      format: 'pdf',
      sourceUrl: 'https://home.moe.gov.om/curricula/grade8/social-studies',
      license: 'حقوق الطبع محفوظة لوزارة التربية والتعليم بسلطنة عمان',
      description: 'دراسة قارات العالم، والتواصل الحضاري والتجاري العماني البحري مع آسيا وإفريقيا، وأعلام الملاحة كأحمد بن ماجد.',
      subjectId: 'sbj-soc',
      stageId: 'stg-2',
      gradeId: 'grd-8',
      unitId: 'unt-soc8-1',
      lessonId: 'lsn-soc8-1',
      reliability: 'official',
      tags: ['الصف الثامن', 'سلطنة عمان', 'قارات العالم', 'الملاحة العمانية', 'أحمد بن ماجد'],
      keywords: ['أحمد بن ماجد', 'التواصل الملاحي العماني', 'شرق إفريقيا', 'زنجبار', 'طريق الحرير'],
      fileSize: 20500000,
      fileName: 'grade8_social_studies_oman_moe.pdf',
      fileHash: 'h08a1b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef',
      pageCount: 144,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-admin-1',
      createdAt: '2026-09-02T13:00:00Z',
      updatedAt: '2026-09-02T13:00:00Z'
    },
    {
      id: 'res-om-grd8-tg',
      title: 'دليل المعلم: الدراسات الاجتماعية للصف الثامن الأساسي',
      author: 'المديرية العامة لتطوير المناهج - سلطنة عمان',
      publisher: 'وزارة التربية والتعليم - مسقط',
      publicationYear: 2024,
      language: 'العربية',
      type: 'teacher_guide',
      format: 'pdf',
      sourceUrl: 'https://home.moe.gov.om/curricula/grade8/teacher-guide',
      license: 'ترخيص المعلمين الرسمي - سلطنة عمان',
      description: 'دليل المعلم للصف الثامن متضمناً معايير الاستقصاء التاريخي والجغرافي وتصميم المشاريع الطلابية حول التراث البحري العماني.',
      subjectId: 'sbj-pedagogy',
      stageId: 'stg-2',
      gradeId: 'grd-8',
      unitId: 'unt-soc8-1',
      reliability: 'official',
      tags: ['دليل المعلم', 'الصف الثامن', 'سلطنة عمان', 'مشاريع طلابية'],
      keywords: ['دليل المعلم صف ثامن عمان', 'المشاريع الجغرافية', 'التراث البحري'],
      fileSize: 13100000,
      fileName: 'teacher_guide_grade8_social_oman.pdf',
      fileHash: 'h08b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef',
      pageCount: 134,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-teacher-1',
      createdAt: '2026-09-02T13:15:00Z',
      updatedAt: '2026-09-02T13:15:00Z'
    },

    // --- الصف التاسع الأساسي ---
    {
      id: 'res-om-grd9-tb',
      title: 'كتاب الطالب: الدراسات الاجتماعية - الجغرافيا العامة والغلاف المناخي (الصف التاسع)',
      author: 'المديرية العامة لتطوير المناهج - وزارة التربية والتعليم - سلطنة عمان',
      publisher: 'مطابع وزارة التربية والتعليم - مسقط',
      publicationYear: 2024,
      language: 'العربية',
      type: 'textbook',
      format: 'pdf',
      sourceUrl: 'https://home.moe.gov.om/curricula/grade9/social-studies',
      license: 'حقوق الطبع محفوظة لوزارة التربية والتعليم بسلطنة عمان',
      description: 'دراسة الغلاف الصخري، الحركات التكتونية، الأنواء المناخية في بحر العرب والأعاصير المدارية وطرق إدارة مخاطرها في السلطنة.',
      subjectId: 'sbj-soc',
      stageId: 'stg-2',
      gradeId: 'grd-9',
      unitId: 'unt-soc9-1',
      reliability: 'official',
      tags: ['الصف التاسع', 'سلطنة عمان', 'جغرافيا عامة', 'الأعاصير المدارية', 'بحر العرب'],
      keywords: ['الصف التاسع عمان', 'الأعاصير المدارية', 'الغلاف المناخي', 'الإنذار المبكر'],
      fileSize: 21800000,
      fileName: 'grade9_social_studies_oman_moe.pdf',
      fileHash: 'h09a1b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef',
      pageCount: 150,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-admin-1',
      createdAt: '2026-09-02T14:00:00Z',
      updatedAt: '2026-09-02T14:00:00Z'
    },
    {
      id: 'res-om-grd9-tg',
      title: 'دليل المعلم: الدراسات الاجتماعية للصف التاسع الأساسي',
      author: 'المديرية العامة لتطوير المناهج - سلطنة عمان',
      publisher: 'وزارة التربية والتعليم - مسقط',
      publicationYear: 2024,
      language: 'العربية',
      type: 'teacher_guide',
      format: 'pdf',
      sourceUrl: 'https://home.moe.gov.om/curricula/grade9/teacher-guide',
      license: 'ترخيص المعلمين الرسمي - سلطنة عمان',
      description: 'دليل المعلم للصف التاسع مع التركيز على تدريس الظواهر المناخية والاستعانة بتقارير هيئة الطيران المدني والمركز الوطني للإنذار المبكر.',
      subjectId: 'sbj-pedagogy',
      stageId: 'stg-2',
      gradeId: 'grd-9',
      unitId: 'unt-soc9-1',
      reliability: 'official',
      tags: ['دليل المعلم', 'الصف التاسع', 'سلطنة عمان', 'الإنذار المبكر'],
      keywords: ['دليل المعلم صف تاسع عمان', 'إدارة المخاطر', 'الأرصاد العمانية'],
      fileSize: 14000000,
      fileName: 'teacher_guide_grade9_social_oman.pdf',
      fileHash: 'h09b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef',
      pageCount: 140,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-teacher-1',
      createdAt: '2026-09-02T14:15:00Z',
      updatedAt: '2026-09-02T14:15:00Z'
    },

    // --- الصف العاشر الأساسي ---
    {
      id: 'res-om-grd10-tb',
      title: 'كتاب الطالب: الدراسات الاجتماعية - جغرافية عمان والبيئة والتنمية (الصف العاشر)',
      author: 'المديرية العامة لتطوير المناهج - وزارة التربية والتعليم - سلطنة عمان',
      publisher: 'مطابع وزارة التربية والتعليم - مسقط',
      publicationYear: 2024,
      language: 'العربية',
      type: 'textbook',
      format: 'pdf',
      sourceUrl: 'https://home.moe.gov.om/curricula/grade10/social-studies',
      license: 'حقوق الطبع محفوظة لوزارة التربية والتعليم بسلطنة عمان',
      description: 'دراسة سكان سلطنة عمان والتنمية الحضرية، المحميات الطبيعية الكبرى، وصون التنوع الحيوي ومكافحة التصحر.',
      subjectId: 'sbj-soc',
      stageId: 'stg-2',
      gradeId: 'grd-10',
      unitId: 'unt-soc10-1',
      lessonId: 'lsn-soc10-1',
      reliability: 'official',
      tags: ['الصف العاشر', 'سلطنة عمان', 'دراسات اجتماعية', 'المحميات الطبيعية', 'التنمية المستدامة'],
      keywords: ['الصف العاشر عمان', 'محمية جزر الديمانيات', 'المها العربية', 'رأس الحد'],
      fileSize: 22100000,
      fileName: 'grade10_social_studies_oman_moe.pdf',
      fileHash: 'h10a1b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef',
      pageCount: 156,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-admin-1',
      createdAt: '2026-09-03T09:00:00Z',
      updatedAt: '2026-09-03T09:00:00Z'
    },
    {
      id: 'res-om-grd10-tg',
      title: 'دليل المعلم: الدراسات الاجتماعية للصف العاشر الأساسي (الأنشطة والتقويم)',
      author: 'المديرية العامة لتطوير المناهج - سلطنة عمان',
      publisher: 'وزارة التربية والتعليم - مسقط',
      publicationYear: 2024,
      language: 'العربية',
      type: 'teacher_guide',
      format: 'pdf',
      sourceUrl: 'https://home.moe.gov.om/curricula/grade10/teacher-guide',
      license: 'ترخيص المعلمين الرسمي - سلطنة عمان',
      description: 'دليل المعلم للصف العاشر الأساسي مع إرشادات شاملة لتطبيق دراسات الحالة البيئية وتحليل أهرامات السكان في السلطنة.',
      subjectId: 'sbj-pedagogy',
      stageId: 'stg-2',
      gradeId: 'grd-10',
      unitId: 'unt-soc10-1',
      reliability: 'official',
      tags: ['دليل المعلم', 'الصف العاشر', 'سلطنة عمان', 'دراسة حالة بيئية'],
      keywords: ['دليل المعلم صف عاشر عمان', 'الهرم السكاني العماني', 'المحميات الطبيعية'],
      fileSize: 14500000,
      fileName: 'teacher_guide_grade10_social_oman.pdf',
      fileHash: 'h10b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef',
      pageCount: 146,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-teacher-1',
      createdAt: '2026-09-03T09:15:00Z',
      updatedAt: '2026-09-03T09:15:00Z'
    },

    // --- الصف الحادي عشر (ما بعد الأساسي) ---
    {
      id: 'res-om-103',
      title: 'كتاب الطالب: الجغرافيا والتقنيات الحديثة (الصف الحادي عشر)',
      author: 'المديرية العامة لتطوير المناهج - وزارة التربية والتعليم - سلطنة عمان',
      publisher: 'مطابع وزارة التربية والتعليم - مسقط',
      publicationYear: 2024,
      language: 'العربية',
      type: 'textbook',
      format: 'pdf',
      sourceUrl: 'https://home.moe.gov.om/curricula/geography-gis-grade11',
      license: 'حقوق الطبع محفوظة لوزارة التربية والتعليم بسلطنة عمان',
      description: 'كتاب تخصصي حديث يدرس علم الخرائط ومقاييس الرسم، الاستشعار عن بعد وتفسير المرئيات الفضائية، ونظم المعلومات الجغرافية (GIS) وتطبيقاتها الميدانية في سلطنة عمان.',
      subjectId: 'sbj-gis',
      stageId: 'stg-3',
      gradeId: 'grd-11',
      unitId: 'unt-gis-1',
      lessonId: 'lsn-gis-1',
      reliability: 'official',
      tags: ['جغرافيا وتقنيات حديثة', 'الصف الحادي عشر', 'سلطنة عمان', 'GIS', 'استشعار عن بعد', 'خرائط رقمية'],
      keywords: ['الاستشعار عن بعد', 'GIS عمان', 'الطبقات الرقمية', 'التحليل المكاني', 'الهيئة الوطنية للمساحة'],
      fileSize: 26500000,
      fileName: 'geography_technologies_grade11_oman_moe.pdf',
      fileHash: 'c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef02',
      pageCount: 148,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-admin-1',
      createdAt: '2026-09-03T10:00:00Z',
      updatedAt: '2026-09-03T10:00:00Z'
    },
    {
      id: 'res-om-104',
      title: 'دليل المعلم: الجغرافيا والتقنيات الحديثة (الصف الحادي عشر)',
      author: 'المديرية العامة لتطوير المناهج - وزارة التربية والتعليم - سلطنة عمان',
      publisher: 'وزارة التربية والتعليم - مسقط',
      publicationYear: 2024,
      language: 'العربية',
      type: 'teacher_guide',
      format: 'pdf',
      sourceUrl: 'https://home.moe.gov.om/curricula/teacher-guide-geo-11',
      license: 'ترخيص المعلمين المعتمد - وزارة التربية والتعليم',
      description: 'دليل المعلم الإرشادي لتدريس التقنيات الكارتوغرافية وبرمجيات نظم المعلومات الجغرافية، والأنشطة المعملية والحاسوبية للمدارس العمانية.',
      subjectId: 'sbj-pedagogy',
      stageId: 'stg-3',
      gradeId: 'grd-11',
      unitId: 'unt-gis-1',
      reliability: 'official',
      tags: ['دليل المعلم', 'جغرافيا 11', 'تقنيات حديثة', 'سلطنة عمان', 'معمل الجغرافيا'],
      keywords: ['معمل الجغرافيا الرقمي', 'تطبيقات عملية GIS', 'دليل المعلم العماني'],
      fileSize: 13200000,
      fileName: 'teacher_guide_geography_grade11_oman.pdf',
      fileHash: 'd4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef03',
      pageCount: 136,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-teacher-1',
      createdAt: '2026-09-03T10:15:00Z',
      updatedAt: '2026-09-03T10:15:00Z'
    },

    // --- الصف الثاني عشر (دبلوم التعليم العام) ---
    {
      id: 'res-om-101',
      title: 'كتاب الطالب: هذا وطني - تاريخ وجغرافية سلطنة عمان (الصف الثاني عشر)',
      author: 'المديرية العامة لتطوير المناهج - وزارة التربية والتعليم - سلطنة عمان',
      publisher: 'مطابع وزارة التربية والتعليم - مسقط',
      publicationYear: 2024,
      language: 'العربية',
      type: 'textbook',
      format: 'pdf',
      sourceUrl: 'https://home.moe.gov.om/curricula/hatha-watani-grade12',
      license: 'حقوق الطبع محفوظة لوزارة التربية والتعليم بسلطنة عمان',
      description: 'الكتاب المعتمد لطلاب الصف الثاني عشر في مادة هذا وطني. يتضمن دراسة جغرافيا عمان الطبيعية والبشرية، التضاريس، التنمية المستدامة، رؤية عمان 2040، والموقع الجيوسياسي لمضيق هرمز والمحافظات.',
      subjectId: 'sbj-watani',
      stageId: 'stg-3',
      gradeId: 'grd-12',
      unitId: 'unt-watani-1',
      lessonId: 'lsn-watani-1',
      reliability: 'official',
      tags: ['هذا وطني', 'الصف الثاني عشر', 'سلطنة عمان', 'وزارة التربية والتعليم', 'مضيق هرمز', 'جبال الحجر', 'رؤية عمان 2040'],
      keywords: ['سلطنة عمان', 'مضيق هرمز', 'جبل شمس', 'الأفلاج', 'رؤية عمان 2040', 'محافظة مسقط', 'ظفار', 'مسندم'],
      fileSize: 22400000,
      fileName: 'hatha_watani_grade12_oman_moe_2024.pdf',
      fileHash: 'a1b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef',
      pageCount: 168,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-admin-1',
      createdAt: '2026-09-01T10:00:00Z',
      updatedAt: '2026-09-01T10:00:00Z'
    },
    {
      id: 'res-om-102',
      title: 'دليل المعلم: مادة هذا وطني - استراتيجيات التدريس والتقويم المستمر (الصف الثاني عشر)',
      author: 'فريق الإشراف والتأليف التخصصي - المديرية العامة لتطوير المناهج - سلطنة عمان',
      publisher: 'وزارة التربية والتعليم - مسقط',
      publicationYear: 2024,
      language: 'العربية',
      type: 'teacher_guide',
      format: 'pdf',
      sourceUrl: 'https://home.moe.gov.om/curricula/teacher-guide-watani-12',
      license: 'ترخيص المعلمين الرسمي - وزارة التربية والتعليم بسلطنة عمان',
      description: 'دليل شامل لمعلمي الصف الثاني عشر، يوضح مصفوفة المدى والتتابع، استراتيجيات الاستقصاء وحل المشكلات، جدول المواصفات للامتحانات العامة، ونماذج التقويم المستمر، وأنشطة تعزيز الهوية الوطنية العمانية.',
      subjectId: 'sbj-pedagogy',
      stageId: 'stg-3',
      gradeId: 'grd-12',
      unitId: 'unt-watani-1',
      reliability: 'official',
      tags: ['دليل المعلم', 'هذا وطني', 'سلطنة عمان', 'جدول المواصفات', 'استراتيجيات التدريس', 'تقويم مستمر'],
      keywords: ['دليل المعلم عمان', 'نواتج التعلم', 'الاستقصاء التاريخي والجغرافي', 'جدول المواصفات العماني', 'الأنشطة الإثرائية'],
      fileSize: 14800000,
      fileName: 'teacher_guide_hatha_watani_grade12_oman.pdf',
      fileHash: 'b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef01',
      pageCount: 154,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-admin-1',
      createdAt: '2026-09-03T11:20:00Z',
      updatedAt: '2026-09-03T11:20:00Z'
    },
    {
      id: 'res-om-econ12-tb',
      title: 'كتاب الطالب: الجغرافيا الاقتصادية والموارد العالمية (الصف الثاني عشر)',
      author: 'المديرية العامة لتطوير المناهج - وزارة التربية والتعليم - سلطنة عمان',
      publisher: 'مطابع وزارة التربية والتعليم - مسقط',
      publicationYear: 2024,
      language: 'العربية',
      type: 'textbook',
      format: 'pdf',
      sourceUrl: 'https://home.moe.gov.om/curricula/grade12/economic-geography',
      license: 'حقوق الطبع محفوظة لوزارة التربية والتعليم بسلطنة عمان',
      description: 'كتاب تخصصي في الجغرافيا الاقتصادية، دراسة الموانئ وسلاسل الإمداد العالمية، الطاقة المتجددة والهيدروجين الأخضر في الدقم وصحار.',
      subjectId: 'sbj-econ',
      stageId: 'stg-3',
      gradeId: 'grd-12',
      unitId: 'unt-econ12-1',
      reliability: 'official',
      tags: ['الصف الثاني عشر', 'سلطنة عمان', 'جغرافيا اقتصادية', 'ميناء الدقم', 'الهيدروجين الأخضر'],
      keywords: ['جغرافيا اقتصادية 12', 'سلاسل الإمداد', 'الطاقة المتجددة عمان', 'ميناء صلالة'],
      fileSize: 24100000,
      fileName: 'economic_geography_grade12_oman.pdf',
      fileHash: 'h12econ1b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef',
      pageCount: 160,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-admin-1',
      createdAt: '2026-09-04T10:00:00Z',
      updatedAt: '2026-09-04T10:00:00Z'
    },
    {
      id: 'res-om-econ12-tg',
      title: 'دليل المعلم: مادة الجغرافيا الاقتصادية (الصف الثاني عشر)',
      author: 'المديرية العامة لتطوير المناهج - سلطنة عمان',
      publisher: 'وزارة التربية والتعليم - مسقط',
      publicationYear: 2024,
      language: 'العربية',
      type: 'teacher_guide',
      format: 'pdf',
      sourceUrl: 'https://home.moe.gov.om/curricula/grade12/teacher-guide-econ',
      license: 'ترخيص المعلمين الرسمي - سلطنة عمان',
      description: 'دليل المعلم للجغرافيا الاقتصادية متضمناً جدول مواصفات الامتحانات العامة، نماذج أسئلة تحليل البيانات والخرائط الاقتصادية.',
      subjectId: 'sbj-pedagogy',
      stageId: 'stg-3',
      gradeId: 'grd-12',
      unitId: 'unt-econ12-1',
      reliability: 'official',
      tags: ['دليل المعلم', 'الصف الثاني عشر', 'جغرافيا اقتصادية', 'جدول المواصفات'],
      keywords: ['دليل معلم جغرافيا اقتصادية', 'تحليل البيانات', 'امتحانات دبلوم التعليم العام'],
      fileSize: 13700000,
      fileName: 'teacher_guide_economic_geography_grade12.pdf',
      fileHash: 'h12econtg2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef',
      pageCount: 142,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-teacher-1',
      createdAt: '2026-09-04T10:15:00Z',
      updatedAt: '2026-09-04T10:15:00Z'
    },

    // --- الأطلس المدرسي المعتمد ---
    {
      id: 'res-om-106',
      title: 'أطلس سلطنة عمان المدرسي المصور والخرائط المعتمدة',
      author: 'المديرية العامة لتطوير المناهج بالتعاون مع الهيئة الوطنية للمساحة - سلطنة عمان',
      publisher: 'وزارة التربية والتعليم - مسقط',
      publicationYear: 2023,
      language: 'العربية',
      type: 'atlas',
      format: 'pdf',
      license: 'ترخيص الاستخدام المدرسي والأكاديمي الرسمي',
      description: 'أطلس خرائط معتمد يتضمن الخرائط الإدارية الرسمية لمحافظات سلطنة عمان الإحدى عشرة، وخرائط التضاريس، وشبكات الطرق، ومواقع الأفلاج والقلاع والحصون التاريخية.',
      subjectId: 'sbj-soc',
      stageId: 'stg-2',
      gradeId: 'grd-5',
      unitId: 'unt-soc5-1',
      reliability: 'official',
      tags: ['أطلس سلطنة عمان', 'خرائط المحافظات', 'الهيئة الوطنية للمساحة', 'جبال الحجر', 'ظفار', 'مسندم'],
      keywords: ['محافظة مسقط', 'ظفار', 'مسندم', 'الداخلية', 'الباطنة', 'الشرقية', 'الظاهرة', 'البريمي', 'الوسطى'],
      fileSize: 31000000,
      fileName: 'oman_school_atlas_official.pdf',
      fileHash: 'f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef05',
      pageCount: 88,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-teacher-1',
      createdAt: '2026-09-05T11:00:00Z',
      updatedAt: '2026-09-05T11:00:00Z'
    },

    // ========================================================
    // الكتب والمراجع التربوية الخاصة بسلطنة عمان (Omani Pedagogy)
    // ========================================================
    {
      id: 'res-ped-om-01',
      title: 'فلسفة التعليم في سلطنة عُمان وتطبيقاتها التربوية الحديثة',
      author: 'مجلس التعليم بالتعاون مع وزارة التربية والتعليم - سلطنة عُمان',
      publisher: 'سلطنة عُمان - مسقط',
      publicationYear: 2023,
      language: 'العربية',
      type: 'reference',
      format: 'pdf',
      license: 'وثيقة تربوية وطنية معتمدة',
      description: 'المرجع الوطني الأساسي لفلسفة التعليم في سلطنة عُمان، يرتكز على الهوية الوطنية العمانية، تنمية مهارات القرن الحادي والعشرين، واقتصاد المعرفة والابتكار واستشراف المستقبل وفق رؤية عُمان 2040.',
      subjectId: 'sbj-ped-oman',
      reliability: 'official',
      tags: ['كتب تربوية عمانية', 'فلسفة التعليم', 'سلطنة عمان', 'رؤية عمان 2040', 'الهوية الوطنية'],
      keywords: ['فلسفة التعليم عمان', 'كفايات المتعلم العماني', 'الهوية العمانية', 'رؤية 2040', 'مجلس التعليم'],
      fileSize: 16800000,
      fileName: 'philosophy_of_education_oman_2023.pdf',
      fileHash: 'ped_om_01_hash_9876543210abcdef1234567890abcdef1234567890',
      pageCount: 184,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-admin-1',
      createdAt: '2026-09-06T08:00:00Z',
      updatedAt: '2026-09-06T08:00:00Z'
    },
    {
      id: 'res-ped-om-02',
      title: 'دليل استراتيجيات التدريس والتعلم النشط في المدارس العُمانية',
      author: 'المديرية العامة للإشراف التربوي وتطوير المناهج - مسقط',
      publisher: 'وزارة التربية والتعليم - سلطنة عُمان',
      publicationYear: 2024,
      language: 'العربية',
      type: 'reference',
      format: 'pdf',
      license: 'دليل تدريبي وتطبيقي معتمد للمعلمين',
      description: 'دليل منهجي تطبيقي موجه لمعلمي المدارس العمانية، يركز على استراتيجيات حل المشكلات، الاستقصاء الجغرافي والعلمي، التعلم القائم على المشاريع، خرائط المفاهيم، والتدريس المتمايز.',
      subjectId: 'sbj-ped-oman',
      reliability: 'official',
      tags: ['كتب تربوية عمانية', 'استراتيجيات التدريس', 'التعلم النشط', 'البيئة الصفية العمانية', 'التفكير الناقد'],
      keywords: ['استراتيجيات التدريس عمان', 'التعلم القائم على المشاريع', 'حل المشكلات', 'الاستقصاء التربوي'],
      fileSize: 19400000,
      fileName: 'teaching_strategies_active_learning_oman.pdf',
      fileHash: 'ped_om_02_hash_9876543210abcdef1234567890abcdef1234567891',
      pageCount: 210,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-admin-1',
      createdAt: '2026-09-06T08:30:00Z',
      updatedAt: '2026-09-06T08:30:00Z'
    },
    {
      id: 'res-ped-om-03',
      title: 'المعايير المهنية الوطنية للمعلمين وقادة المدارس بسلطنة عُمان',
      author: 'المكتب الفني لتطوير الأداء المدرسي - وزارة التربية والتعليم',
      publisher: 'سلطنة عُمان - مسقط',
      publicationYear: 2023,
      language: 'العربية',
      type: 'reference',
      format: 'pdf',
      license: 'وثيقة المعايير المهنية الرسمية',
      description: 'الوثيقة التوجيهية الرسمية لكفايات المعلم العُماني المتميز؛ تغطي مجالات المعرفة المهنية والتربوية، والممارسة والتدريس الصفي، وأخلاقيات المهنة، والتطوير المهني المستمر والشراكة المجتمعية.',
      subjectId: 'sbj-ped-oman',
      reliability: 'official',
      tags: ['كتب تربوية عمانية', 'المعايير المهنية للمعلمين', 'التطوير المهني', 'الكفايات التربوية'],
      keywords: ['المعايير المهنية عمان', 'كفايات المعلم', 'التخطيط الفعال', 'أخلاقيات المهنة', 'التقييم الذاتي'],
      fileSize: 15200000,
      fileName: 'national_professional_standards_teachers_oman.pdf',
      fileHash: 'ped_om_03_hash_9876543210abcdef1234567890abcdef1234567892',
      pageCount: 168,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-admin-1',
      createdAt: '2026-09-06T09:00:00Z',
      updatedAt: '2026-09-06T09:00:00Z'
    },
    {
      id: 'res-ped-om-04',
      title: 'دليل التقويم التربوي الشامل والمستمر في التعليم المدرسي العُماني',
      author: 'المديرية العامة للتقويم التربوي - وزارة التربية والتعليم',
      publisher: 'سلطنة عُمان - مسقط',
      publicationYear: 2024,
      language: 'العربية',
      type: 'reference',
      format: 'pdf',
      license: 'دليل التقويم الرسمي المعتمد',
      description: 'مرجع تطبيقي شامل لآليات وأدوات التقويم الصفي المستمر، وبناء شبكات وموازين التقدير اللفظية (Rubrics)، وسجلات الملاحظة، وتصميم الاختبارات القصيرة ومعالجة الفاقد التعليمي.',
      subjectId: 'sbj-ped-oman',
      reliability: 'official',
      tags: ['كتب تربوية عمانية', 'التقويم المستمر', 'سلالم التقدير', 'سلطنة عمان', 'الاختبارات القصيرة'],
      keywords: ['دليل التقويم التربوي عمان', 'التقويم التكويني', 'روبريك التقييم', 'الفاقد التعليمي', 'أدوات القياس'],
      fileSize: 17800000,
      fileName: 'comprehensive_educational_assessment_guide_oman.pdf',
      fileHash: 'ped_om_04_hash_9876543210abcdef1234567890abcdef1234567893',
      pageCount: 196,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-admin-1',
      createdAt: '2026-09-06T09:30:00Z',
      updatedAt: '2026-09-06T09:30:00Z'
    },
    {
      id: 'res-ped-om-05',
      title: 'تاريخ التعليم في عُمان: مسيرة التطوير والنهضة التعليمية المباركة ورؤية 2040',
      author: 'د. عبد الله بن حمد المحروقي ونخبة من المؤرخين والتربويين العمانيين',
      publisher: 'دار مسقط للدراسات والطباعة والنشر - سلطنة عمان',
      publicationYear: 2022,
      language: 'العربية',
      type: 'reference',
      format: 'pdf',
      license: 'مرجع تاريخي وتربوي أصيل',
      description: 'دراسة تاريخية تربوية توثق تطور التعليم في عُمان من الكتاتيب والمدارس التقليدية بالمساجد، مروراً بانطلاق النهضة عام 1970 وحتى المدارس الرقمية ورؤية عُمان 2040.',
      subjectId: 'sbj-ped-oman',
      reliability: 'academic',
      tags: ['كتب تربوية عمانية', 'تاريخ التعليم', 'النهضة المباركة', 'كتاتيب عمان', 'رؤية عمان 2040'],
      keywords: ['تاريخ التعليم في عمان', 'المدارس في عمان', 'مسقط', 'النهضة التعليمية 1970', 'السلطان قابوس', 'السلطان هيثم'],
      fileSize: 22600000,
      fileName: 'history_of_education_in_oman_comprehensive.pdf',
      fileHash: 'ped_om_05_hash_9876543210abcdef1234567890abcdef1234567894',
      pageCount: 240,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-admin-1',
      createdAt: '2026-09-06T10:00:00Z',
      updatedAt: '2026-09-06T10:00:00Z'
    },

    // ========================================================
    // الكتب والمراجع التربوية العالمية المترجمة باللغة العربية
    // ========================================================
    {
      id: 'res-ped-glb-01',
      title: 'نظريات التعلم الحديثة وتطبيقاتها في الغرفة الصفية (مرجع عالمي مترجم)',
      author: 'أ.د. ديل شانك (Dale H. Schunk) - ترجمة: د. علي بن سعود البلوشي',
      publisher: 'دار الفكر التربوي الحديث للنشر والترجمة',
      publicationYear: 2023,
      language: 'العربية',
      type: 'reference',
      format: 'pdf',
      license: 'ترجمة عربية معتمدة أكاديمياً',
      description: 'المرجع الأكاديمي الدولي الأكثر شمولاً في نظريات التعلم (البنائية، السلوكية، المعرفية، والتعلم الاجتماعي لباندورا ومعالجة المعلومات) مصحوباً بنماذج تطبيقية للمعلمين داخل الفصل.',
      subjectId: 'sbj-ped-global',
      reliability: 'academic',
      tags: ['مراجع عالمية بالعربية', 'نظريات التعلم', 'بياجيه', 'فيجوتسكي', 'علم النفس التربوي', 'باندورا'],
      keywords: ['نظريات التعلم', 'النظرية البنائية', 'النمذجة السلوكية', 'معالجة المعلومات', 'بياجيه', 'فيجوتسكي'],
      fileSize: 32400000,
      fileName: 'learning_theories_educational_perspective_arabic.pdf',
      fileHash: 'ped_glb_01_hash_9876543210abcdef1234567890abcdef1234567895',
      pageCount: 380,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-admin-1',
      createdAt: '2026-09-07T08:00:00Z',
      updatedAt: '2026-09-07T08:00:00Z'
    },
    {
      id: 'res-ped-glb-02',
      title: 'تصميم التدريس الفعال: مدخل النظم ومنهجية دِك وكاري (Dick & Carey)',
      author: 'والتر دِك ولو كاري (Walter Dick & Lou Carey) - ترجمة ومراجعة عربية متخصصة',
      publisher: 'دار الكتب الجامعية والترجمة الأكاديمية',
      publicationYear: 2022,
      language: 'العربية',
      type: 'reference',
      format: 'pdf',
      license: 'ترجمة عربية معتمدة',
      description: 'الكتاب المرجعي الرائد في هندسة التدريس وتصميم المناهج؛ يوضح خطوات تحليل الأهداف التعليمية، وتحليل خصائص المتعلمين، وبناء استراتيجيات التدريس والتقويم التكويني والختامي.',
      subjectId: 'sbj-ped-global',
      reliability: 'academic',
      tags: ['مراجع عالمية بالعربية', 'تصميم التدريس', 'نموذج دك وكاري', 'تحليل الأهداف', 'استراتيجيات التدريس'],
      keywords: ['تصميم التدريس دك وكاري', 'تحليل المحتوى التعليمي', 'الأهداف السلوكية', 'استراتيجيات التعليم'],
      fileSize: 28100000,
      fileName: 'systematic_design_of_instruction_dick_carey_arabic.pdf',
      fileHash: 'ped_glb_02_hash_9876543210abcdef1234567890abcdef1234567896',
      pageCount: 320,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-admin-1',
      createdAt: '2026-09-07T08:30:00Z',
      updatedAt: '2026-09-07T08:30:00Z'
    },
    {
      id: 'res-ped-glb-03',
      title: 'بيداغوجيا التفكير: تصنيف بلوم المطور لمهارات التفكير العليا والابتكار',
      author: 'لورين أندرسون وديفيد كراثوول (Anderson & Krathwohl) - ترجمة عربية معتمدة',
      publisher: 'المركز القومي للترجمة والبحوث التربوية',
      publicationYear: 2023,
      language: 'العربية',
      type: 'reference',
      format: 'pdf',
      license: 'ترجمة علمية مرخصة',
      description: 'الدليل العالمي المعتمد للتصنيف المحدث لأهداف التعليم؛ يفكك مصفوفة البعد المعرفي والعمليات العقلية (التذكر، الفهم، التطبيق، التحليل، التقييم، والابتكار) مع أمثلة صياغة أسئلة امتحانية.',
      subjectId: 'sbj-ped-global',
      reliability: 'academic',
      tags: ['مراجع عالمية بالعربية', 'تصنيف بلوم المطور', 'مهارات التفكير العليا', 'التحليل والتقييم', 'الابتكار والابداع'],
      keywords: ['تصنيف بلوم المحدث', 'مهارات التفكير العليا', 'أسئلة التفكير الناقد', 'بلوم أندرسون', 'التقييم والابتكار'],
      fileSize: 24500000,
      fileName: 'taxonomy_for_learning_teaching_assessing_bloom_arabic.pdf',
      fileHash: 'ped_glb_03_hash_9876543210abcdef1234567890abcdef1234567897',
      pageCount: 260,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-admin-1',
      createdAt: '2026-09-07T09:00:00Z',
      updatedAt: '2026-09-07T09:00:00Z'
    },
    {
      id: 'res-ped-glb-04',
      title: 'الإدارة الصفية الفعالة: استراتيجيات قيادة الفصل وبناء المناخ الإيجابي',
      author: 'د. روبرت مارزانو (Robert J. Marzano) - ترجمة وإعداد عربي: د. ناصر التميمي',
      publisher: 'مكتبة التربية الحديثة',
      publicationYear: 2023,
      language: 'العربية',
      type: 'reference',
      format: 'pdf',
      license: 'ترخيص دار النشر العربية',
      description: 'المرجع التطبيقي العالمي الأوسع انتشاراً لإدارة البيئة الصفية بنجاح؛ يرتكز على الأبحاث الإمبريقية لوضع القواعد، بناء العلاقات الإيجابية، التدخل السلوكي الهادئ، وتنمية الانضباط الذاتي لدى الطلبة.',
      subjectId: 'sbj-ped-global',
      reliability: 'academic',
      tags: ['مراجع عالمية بالعربية', 'إدارة الصف', 'روبرت مارزانو', 'السلوك الصفي', 'بيئة التعلم الإيجابية'],
      keywords: ['الإدارة الصفية مارزانو', 'الانضباط الإيجابي', 'قواعد الفصل', 'تعديل السلوك الصفي', 'المناخ الصفي'],
      fileSize: 26900000,
      fileName: 'classroom_management_that_works_marzano_arabic.pdf',
      fileHash: 'ped_glb_04_hash_9876543210abcdef1234567890abcdef1234567898',
      pageCount: 280,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-admin-1',
      createdAt: '2026-09-07T09:30:00Z',
      updatedAt: '2026-09-07T09:30:00Z'
    },
    {
      id: 'res-ped-glb-05',
      title: 'الفهم عن طريق التصميم (UbD) والتقويم البديل في التعليم المدرسي',
      author: 'جرانت ويجينز وجاي مَكتاي (Grant Wiggins & Jay McTighe) - ترجمة تربوية عربية',
      publisher: 'مكتب التربية العربي لدول الخليج والترجمة',
      publicationYear: 2023,
      language: 'العربية',
      type: 'reference',
      format: 'pdf',
      license: 'ترجمة تربوية معتمدة',
      description: 'الدليل المرجعي العالمي للتخطيط العكسي (Backward Design)؛ يوضح كيفية تحديد نواتج التعلم الكبرى، والأسئلة الجوهرية المحفزة للبحث، وتصميم المهمات الأدائية الأصيلة وسلالم التقدير اللفظية.',
      subjectId: 'sbj-ped-global',
      reliability: 'academic',
      tags: ['مراجع عالمية بالعربية', 'التصميم العكسي UbD', 'الفهم العميق', 'التقويم البديل', 'المهمات الأدائية'],
      keywords: ['الفهم عن طريق التصميم', 'التخطيط العكسي UbD', 'الأسئلة الجوهرية', 'مهمات الأداء', 'ويجينز مكتاي'],
      fileSize: 29800000,
      fileName: 'understanding_by_design_ubd_arabic.pdf',
      fileHash: 'ped_glb_05_hash_9876543210abcdef1234567890abcdef1234567899',
      pageCount: 310,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-admin-1',
      createdAt: '2026-09-07T10:00:00Z',
      updatedAt: '2026-09-07T10:00:00Z'
    },
    {
      id: 'res-ped-glb-06',
      title: 'دمج التقنية والذكاء الاصطناعي في التعليم: وفق نموذج SAMR ونموذج TPACK',
      author: 'د. روبن بوينتدورا ود. ماثيو كولر - إشراف وترجمة: أ.د. سامية العامرية',
      publisher: 'دار تكنولوجيا التعليم الرقمي والمعرفة',
      publicationYear: 2024,
      language: 'العربية',
      type: 'reference',
      format: 'pdf',
      license: 'ترجمة ومراجعة علمية حديثة',
      description: 'مرجع حديث يقدم خارطة طريق عملية لدمج الأدوات الرقمية والذكاء الاصطناعي في الفصول المدرسية عبر نموذج SAMR (الاستبدال، التحسين، التعديل، وإعادة التعريف) وإطار TPACK التكاملي.',
      subjectId: 'sbj-ped-global',
      reliability: 'academic',
      tags: ['مراجع عالمية بالعربية', 'تكنولوجيا التعليم', 'نموذج SAMR', 'نموذج TPACK', 'الذكاء الاصطناعي في التعليم'],
      keywords: ['نموذج SAMR', 'إطار TPACK', 'الذكاء الاصطناعي في التعليم', 'التحول الرقمي المدرسي', 'كفايات المعلم الرقمي'],
      fileSize: 27500000,
      fileName: 'technology_integration_ai_education_samr_tpack_arabic.pdf',
      fileHash: 'ped_glb_06_hash_9876543210abcdef1234567890abcdef123456789a',
      pageCount: 290,
      processingStatus: 'indexed',
      isArchived: false,
      isDeleted: false,
      createdById: 'usr-admin-1',
      createdAt: '2026-09-07T10:30:00Z',
      updatedAt: '2026-09-07T10:30:00Z'
    }
  ];

  // صفحات المستندات الحقيقية الموثقة بأرقام الصفحات الصريحة
  const pages: DocumentPage[] = [
    {
      id: 'page-om-101-18',
      resourceId: 'res-om-101',
      pageNumber: 18,
      printedPageNumber: 18,
      chapterOrUnitTitle: 'الوحدة الأولى: عُمان المكان والحضارة',
      confidence: 0.99,
      isOcr: false,
      content: `الوحدة الأولى: عُمان المكان والحضارة
الدرس الأول: الموقع الجغرافي لسلطنة عمان وأهميته الاستراتيجية
تقع سلطنة عمان في أقصى الجنوب الشرقي لشبه الجزيرة العربية، وتمتد سواحلها لمسافة تزيد عن 3165 كيلومتراً تطل على ثلاثة مسطحات مائية هامة: الخليج العربي، وبحر عمان، وبحر العرب المشرف على المحيط الهندي.
يمثل موقع سلطنة عمان نقطة التقاء تاريخية وجغرافية بين قارات آسيا وإفريقيا وأوروبا.
ويبرز مضيق هرمز كأحد أهم الممرات المائية الحيوية في العالم؛ حيث تشرف سلطنة عمان (عبر محافظة مسندم) على حركة الملاحة الدولية في هذا المضيق الذي يمر عبره نحو 20% من إجمالي إمدادات النفط العالمية المنقولة بحراً.
وقد أتاح هذا الامتداد الساحلي للعمانيين عبر العصور بناء أسطول بحري تجاري وحربي رائد، وصل إلى موانئ الصين والهند وشرق إفريقيا (زنجبار وممباسا)، مما رسخ مكانة عمان كمركز تجاري وبحري عالمي.`
    },
    {
      id: 'page-om-101-22',
      resourceId: 'res-om-101',
      pageNumber: 22,
      printedPageNumber: 22,
      chapterOrUnitTitle: 'الوحدة الأولى: عُمان المكان والحضارة',
      confidence: 0.99,
      isOcr: false,
      content: `الدرس الثاني: التنوع الجيومورفولوجي وتضاريس سلطنة عمان الكبرى
تتميز سلطنة عمان بتنوع تضاريسي فريد يعكس تاريخها الجيولوجي العريق؛ حيث تنقسم التضاريس إلى الأقسام الرئيسية التالية:
1. سلاسل جبال الحجر: تمتد على شكل قوس عظيم من رأس مسندم شمالاً حتى رأس الحد شرقاً بطول يقارب 600 كيلومتر. وتنقسم إلى الحجر الغربي والحجر الشرقي ويفصل بينهما وادي سمائل. وتضم السلسلة أعلى قمة جبلية في شبه الجزيرة العربية وهي قمة "جبل شمس" بارتفاع يصل إلى 3009 أمتار فوق مستوى سطح البحر، يليه "الجبل الأخضر" المتميز باعتدال مناخه صيفاً ومدرجاته الزراعية للرمان والجوز والورد.
2. سهل الباطنة: سهل فيضي خصب ينحصر بين جبال الحجر وبحر عمان، ويعد السلة الزراعية الرئيسية للسلطنة وموطن كثافة سكانية وحضرية عالية.
3. هضبة نجد وصحراء رمال آل وهيبة (رمال الشرقية): كثبان رملية ساحرة تمتد حتى بحر العرب.
4. سلاسل جبال ظفار: تمتد في الجنوب وتتميز بظاهرة "خريف ظفار" حيث تهب الرياح الموسمية الجنوبية الغربية المحملة بالضباب والأمطار الرذاذية من يونيو إلى سبتمبر لتتحول الجبال إلى بساط أخضر بديع.`
    },
    {
      id: 'page-om-101-54',
      resourceId: 'res-om-101',
      pageNumber: 54,
      printedPageNumber: 54,
      chapterOrUnitTitle: 'الوحدة الثانية: التنمية المستدامة ورؤية عمان 2040',
      confidence: 0.99,
      isOcr: false,
      content: `الوحدة الثانية: التنمية المستدامة واستشراف المستقبل
الدرس الثالث: رؤية عُمان 2040 والتنويع الاقتصادي المستدام
انطلقت رؤية "عُمان 2040" كبوابة لمستقبل مشرق يرتكز على أربعة محاور رئيسية:
1. الإنسان والمجتمع: تعزيز التعليم المبتكر والرعاية الصحية وبناء الكفاءات الوطنية.
2. الاقتصاد والتنمية: تنويع مصادر الدخل غير النفطية من خلال قطاعات اللوجستيات، السياحة البيئية، الصناعات التحويلية، الثروة السمكية، والتعدين.
3. الحوكمة والأداء المؤسسي: كفاءة الأداء الحكومي والتحول الرقمي الشامل.
4. بيئة عناصرها مستدامة: صون الموارد الطبيعية، التوسع في مشروعات الطاقة المتجددة (الهيدروجين الأخضر ومحطات الطاقة الشمسية في منح وعبري)، وحماية المحميات الطبيعية كـ "محمية المها العربية" و"محمية جزر الديمانيات".
كما تمثل الموانئ الاستراتيجية (ميناء صحار، ميناء الدقم، وميناء صلالة) عصب التجارة الدولية وربط خطوط الملاحة الشرقية بالغربية.`
    },
    {
      id: 'page-om-103-34',
      resourceId: 'res-om-103',
      pageNumber: 34,
      printedPageNumber: 34,
      chapterOrUnitTitle: 'الوحدة الثانية: الاستشعار عن بعد ونظم المعلومات الجغرافية',
      confidence: 0.98,
      isOcr: false,
      content: `كتاب الجغرافيا والتقنيات الحديثة - الصف الحادي عشر
الوحدة الثانية: تطبيقات نظم المعلومات الجغرافية (GIS) في التخطيط الوطني
يُعرَّف نظام المعلومات الجغرافي (Geographic Information System) بأنه منظومة حاسوبية متكاملة لجمع، وإدخال، ومعالجة، وتخزين، وتحليل، واسترجاع البيانات المكانية (Spatial Data) والوصفية (Attribute Data).
وتعتمد بنية GIS على مفهوم "الطبقات الرقمية" (Layers)؛ حيث تفصل البيانات إلى طبقة التضاريس، طبقة شبكة الطرق، طبقة استخدامات الأراضي، وطبقة مصادر المياه.
تطبيقات GIS في سلطنة عمان:
1. التخطيط الحضري والعمراني: تحديد المواقع الملائمة للمدن والمخططات السكنية الجديدة بعيداً عن مجاري الأودية النشطة.
2. إدارة مخاطر الأعاصير والأنواء المناخية: مثل التعامل مع الأنواء الاستثنائية وتحديد نطاقات فيضان الأودية في محافظات مسقط والباطنة والشرقية بالتنسيق مع المركز الوطني للإنذار المبكر.
3. إدارة الموارد الطبيعية: مراقبة الغطاء النباتي في جبال ظفار وتتبع مستويات المياه الجوفية والأفلاج.`
    },
    {
      id: 'page-om-105-24',
      resourceId: 'res-om-105',
      pageNumber: 24,
      printedPageNumber: 24,
      chapterOrUnitTitle: 'الوحدة الأولى: الموارد المائية في وطني عمان',
      confidence: 0.99,
      isOcr: false,
      content: `كتاب الدراسات الاجتماعية - الصف السادس الأساسي
الوحدة الأولى: الأفلاج العمانية إرث حضاري وهندسة مائية فريدة
تعد الأفلاج (جمع فلج) النظام المائي التاريخي الأصيل الذي اعتمده العمانيون منذ آلاف السنين لتوزيع المياه الجوفية والسطحية على المزارع والبيوت بدقة هندسية بالغة.
وتنقسم الأفلاج في سلطنة عمان إلى ثلاثة أنواع رئيسية:
1. الأفلاج الداوودية: تشكل نحو 24% من أفلاج عمان، وهي أفلاج حفرت قنواتها في أعماق الأرض وتعتمد على ينابيع المياه الجوفية العميقة. تتميز بجريان مياهها المستمر طوال العام، ومن أشهرها "فلج دارس" في ولاية نزوى، و"فلج الخطمين" في بركة الموز.
2. الأفلاج الغيلية: تشكل نحو 48%، وتعتمد على المياه الجارية وشبه السطحية في مجاري الأودية، ويزداد تدفقها بعد هطول الأمطار مباشرة.
3. الأفلاج العينية: تشكل نحو 28%، وتستمد مياهها مباشرة من عيون المياه الطبيعية المتفجرة، كـ "فلج الجيلة" في ولاية صور.
وقد أدرجت منظمة اليونسكو عام 2006 خمسة أفلاج عمانية ضمن قائمة التراث العالمي اعترافاً بعبقرية الإنسان العماني في الإدارة المستدامة للمياه.`
    },
    {
      id: 'page-om-102-16',
      resourceId: 'res-om-102',
      pageNumber: 16,
      printedPageNumber: 16,
      chapterOrUnitTitle: 'دليل المعلم: مادة هذا وطني - استراتيجيات التدريس الموصى بها',
      confidence: 0.99,
      isOcr: false,
      content: `دليل المعلم: مادة هذا وطني - الصف الثاني عشر
استراتيجيات تدريس درس "الموقع الاستراتيجي والتضاريس لسلطنة عمان":
التهيئة الحافزة (5 دقائق):
عرض صورة فضائية لشبه الجزيرة العربية ومضيق هرمز وطرح السؤال الاستقصائي: "لماذا سعت القوى الاستعمارية الكبرى تاريخياً للسيطرة على السواحل العمانية ومضيق هرمز، وما دلالة ذلك في العصر الراهن؟"
خطوات النشاط الصفي التعاوني (20 دقيقة):
- تقسيم الصف إلى مجموعات متجانسة من 4 إلى 5 طلاب.
- تزويد كل مجموعة بخريطة صماء لسلطنة عمان ومحيطها البحري.
- تكليف المجموعات بتحديد: المسطحات المائية الثلاثة، مضيق هرمز، سلسلة جبال الحجر وجبل شمس، ورأس الحد.
- توجيه الطلاب للربط بين تنوع التضاريس وبين التنوع البيئي والسياحي وفق مستهدفات رؤية عمان 2040.
التقويم التكويني (10 دقائق):
استخدام استراتيجية التفكير الناقد وطرح سؤال: "كيف يسهم الموقع الجغرافي لميناء الدقم في تعزيز الملاحة والتجارة الدولية خارج مضيق هرمز؟"`
    },
    {
      id: 'page-om-grd5-12',
      resourceId: 'res-om-grd5-tb',
      pageNumber: 12,
      printedPageNumber: 12,
      chapterOrUnitTitle: 'الوحدة الأولى: محافظات سلطنة عمان',
      confidence: 0.99,
      isOcr: false,
      content: `كتاب الدراسات الاجتماعية - الصف الخامس الأساسي
الدرس الأول: محافظات وطني عُمان الإحدى عشرة
تتكون سلطنة عمان من إحدى عشرة محافظة، وتضم كل محافظة عدداً من الولايات.
1. محافظة مسقط: العاصمة السياسية والاقتصادية للسلطنة، وتضم ولايات: مسقط، مطرح، بوشر، السيب، العامرات، وقريات.
2. محافظة ظفار: درة الجنوب، وتشتهر بزراعة اللبان وظاهرة خريف ظفار الساحرة، ومركزها الإداري مدينة صلالة.
3. محافظة مسندم: تقع في أقصى الشمال العماني وتشرف على مضيق هرمز الاستراتيجي وتمتاز بأخوارها البحرية الخلابة كخور نجد.
4. محافظتا شمال وجنوب الباطنة: شريط زراعي وبحري خصب على ساحل بحر عمان، ويضم موانئ وقلاعاً عريقة كقلعة صحار ونخل والرستاق.
5. محافظة الداخلية: مهد التاريخ والحضارة العمانية، عاصمتها نزوى مدينة العلم وموطن قلعة بهلاء وفلج دارس وجبل شمس والجبل الأخضر.
6. محافظتا شمال وجنوب الشرقية، والظاهرة، والبريمي، ومحافظة الوسطى التي تضم ميناء الدقم الواعد ومحمية المها العربية.`
    }
  ];

  // مقاطع الاسترجاع الدلالي (RAG Chunks) الموثقة بالصفحة والمادة العمانية
  const chunks: DocumentChunk[] = [
    {
      id: 'chk-om-1',
      resourceId: 'res-om-101',
      pageId: 'page-om-101-18',
      pageNumber: 18,
      printedPageNumber: 18,
      chunkIndex: 1,
      charLength: 850,
      heading: 'الموقع الجغرافي لسلطنة عمان وأهمية مضيق هرمز الاستراتيجية',
      keywords: ['سلطنة عمان', 'مضيق هرمز', 'بحر عمان', 'بحر العرب', 'محافظة مسندم', 'الملاحة الدولية', 'الموقع الجيوسياسي'],
      subjectName: 'هذا وطني - تاريخ وجغرافية عمان',
      gradeName: 'الصف الثاني عشر',
      unitTitle: 'الوحدة الأولى: عُمان المكان والحضارة',
      content: `تقع سلطنة عمان في الجنوب الشرقي لشبه الجزيرة العربية بسواحل تتجاوز 3165 كم تطل على الخليج العربي وبحر عمان وبحر العرب. تشرف السلطنة عبر محافظة مسندم على مضيق هرمز الحيوي الذي يعبره نحو 20% من إمدادات النفط المنقولة بحراً في العالم. مكّن هذا الموقع البحري العمانيين من تأسيس أسطول بحري تاريخي وصل إلى موانئ الصين والهند وشرق إفريقيا (زنجبار وممباسا).`
    },
    {
      id: 'chk-om-2',
      resourceId: 'res-om-101',
      pageId: 'page-om-101-22',
      pageNumber: 22,
      printedPageNumber: 22,
      chunkIndex: 2,
      charLength: 880,
      heading: 'تضاريس سلطنة عمان: جبال الحجر وجبل شمس وظفار وسهل الباطنة',
      keywords: ['جبال الحجر', 'جبل شمس', 'الجبل الأخضر', 'سهل الباطنة', 'جبال ظفار', 'خريف ظفار', 'رمال آل وهيبة'],
      subjectName: 'هذا وطني - تاريخ وجغرافية عمان',
      gradeName: 'الصف الثاني عشر',
      unitTitle: 'الوحدة الأولى: عُمان المكان والحضارة',
      content: `تضاريس سلطنة عمان: 1. سلاسل جبال الحجر (الغربي والشرقي) وتمتد بطول 600 كم تضم جبل شمس (3009 أمتار وهو أعلى قمة في عمان) والجبل الأخضر المتميز بمدرجاته الزراعية واعتدال مناخه. 2. سهل الباطنة الفيضي الخصب على بحر عمان. 3. صحراء رمال آل وهيبة. 4. سلاسل جبال ظفار في الجنوب المتأثرة بظاهرة خريف ظفار والرياح الموسمية الرطبة صيفاً.`
    },
    {
      id: 'chk-om-3',
      resourceId: 'res-om-101',
      pageId: 'page-om-101-54',
      pageNumber: 54,
      printedPageNumber: 54,
      chunkIndex: 3,
      charLength: 860,
      heading: 'محاور رؤية عمان 2040 والتنويع الاقتصادي والموانئ',
      keywords: ['رؤية عمان 2040', 'ميناء الدقم', 'ميناء صحار', 'ميناء صلالة', 'الهيدروجين الأخضر', 'التنويع الاقتصادي'],
      subjectName: 'هذا وطني - تاريخ وجغرافية عمان',
      gradeName: 'الصف الثاني عشر',
      unitTitle: 'الوحدة الثانية: التنمية المستدامة ورؤية عمان 2040',
      content: `ترتكز رؤية عمان 2040 على أربعة محاور: الإنسان والمجتمع، الاقتصاد والتنمية، الحوكمة والأداء، وبيئة عناصرها مستدامة. تسعى الرؤية إلى تنويع مصادر الدخل عبر قطاعات اللوجستيات، السياحة البيئية، الصناعات، والاستثمار في موانئ الدقم وصحار وصلالة، والتوسع في الطاقة المتجددة كالهيدروجين الأخضر ومحطات الطاقة الشمسية وصون المحميات كجزر الديمانيات والمها العربية.`
    },
    {
      id: 'chk-om-4',
      resourceId: 'res-om-103',
      pageId: 'page-om-103-34',
      pageNumber: 34,
      printedPageNumber: 34,
      chunkIndex: 4,
      charLength: 820,
      heading: 'تطبيقات نظم المعلومات الجغرافية GIS في سلطنة عمان',
      keywords: ['نظم المعلومات الجغرافية', 'GIS', 'الطبقات الرقمية', 'التخطيط العمراني', 'الإنذار المبكر', 'الهيئة الوطنية للمساحة'],
      subjectName: 'الجغرافيا والتقنيات الحديثة',
      gradeName: 'الصف الحادي عشر',
      unitTitle: 'الوحدة الثانية: الاستشعار عن بعد ونظم المعلومات الجغرافية',
      content: `يعتمد نظام المعلومات الجغرافي (GIS) على دمج البيانات المكانية بالوصفية من خلال طبقات رقمية (Layers). تشمل تطبيقاته في سلطنة عمان: التخطيط العمراني وتجنب مجاري الأودية، إدارة مخاطر الأعاصير والأنواء المناخية بالتعاون مع المركز الوطني للإنذار المبكر، وإدارة الموارد المائية ومراقبة الغطاء النباتي في ظفار.`
    },
    {
      id: 'chk-om-5',
      resourceId: 'res-om-105',
      pageId: 'page-om-105-24',
      pageNumber: 24,
      printedPageNumber: 24,
      chunkIndex: 5,
      charLength: 890,
      heading: 'أنظمة الأفلاج العمانية الثلاثة وأفلاج التراث العالمي',
      keywords: ['الأفلاج', 'الأفلاج الداوودية', 'فلج دارس', 'الأفلاج الغيلية', 'الأفلاج العينية', 'فلج الجيلة', 'اليونسكو'],
      subjectName: 'الدراسات الاجتماعية',
      gradeName: 'الصف السادس الأساسي',
      unitTitle: 'الوحدة الأولى: الموارد المائية ونظام الأفلاج في سلطنة عمان',
      content: `تنقسم الأفلاج العمانية إلى: 1. الأفلاج الداوودية (24%) تعتمد على مياه جوفية عميقة وتجري طوال العام كفلج دارس وفلج الخطمين. 2. الأفلاج الغيلية (48%) تستمد مياهها من المياه شبه السطحية في مجاري الأودية بعد الأمطار. 3. الأفلاج العينية (28%) تستمد مياهها من العيون الطبيعية كفلج الجيلة. أدرجت منظمة اليونسكو 5 أفلاج عمانية في قائمة التراث العالمي.`
    },
    {
      id: 'chk-om-6',
      resourceId: 'res-om-102',
      pageId: 'page-om-102-16',
      pageNumber: 16,
      printedPageNumber: 16,
      chunkIndex: 6,
      charLength: 810,
      heading: 'استراتيجيات تدريس الجغرافيا الوطنية وفق دليل المعلم العماني',
      keywords: ['دليل المعلم عمان', 'الاستقصاء الجغرافي', 'خريطة صماء', 'ميناء الدقم', 'مضيق هرمز'],
      subjectName: 'أدلة المعلم واستراتيجيات التدريس',
      gradeName: 'الصف الثاني عشر',
      unitTitle: 'الوحدة الأولى: عُمان المكان والحضارة',
      content: `توجيهات دليل المعلم لتدريس موقع وتضاريس عمان: التهيئة الحافزة بسؤال استقصائي حول الأهمية الجيوسياسية لمضيق هرمز، ثم عمل مجموعات على خريطة صماء لتحديد المسطحات المائية وسلسلة جبال الحجر، وتقويم تكويني يناقش الأثر الاستراتيجي لميناء الدقم خارج مضيق هرمز.`
    },
    {
      id: 'chk-om-7',
      resourceId: 'res-om-grd5-tb',
      pageId: 'page-om-grd5-12',
      pageNumber: 12,
      printedPageNumber: 12,
      chunkIndex: 7,
      charLength: 820,
      heading: 'محافظات سلطنة عمان الإحدى عشرة ومراكزها الإدارية',
      keywords: ['محافظات سلطنة عمان', 'محافظة مسقط', 'ظفار', 'مسندم', 'الداخلية', 'شمال الباطنة', 'جنوب الباطنة'],
      subjectName: 'الدراسات الاجتماعية',
      gradeName: 'الصف الخامس الأساسي',
      unitTitle: 'الوحدة الأولى: محافظات سلطنة عمان وتضاريسها',
      content: `تضم سلطنة عمان 11 محافظة: مسقط (العاصمة)، ظفار (صلالة وخريف ظفار واللبان)، مسندم (مضيق هرمز والأخوار)، شمال الباطنة (صحار)، جنوب الباطنة (الرستاق ونخل)، الداخلية (نزوى، فلج دارس، جبل شمس)، شمال الشرقية (إبراء)، جنوب الشرقية (صور، رأس الحد)، الظاهرة (عبري)، البريمي، والوسطى (هيماء، ميناء الدقم، محمية المها).`
    }
  ];

  // الموارد والخرائط الجغرافية المتخصصة في سلطنة عمان (المحافظات الـ 11 والمعالم)
  const geographicResources: GeographicResource[] = [
    {
      id: 'geo-om-1',
      title: 'خريطة التقسيم الإداري والمحافظات الإحدى عشرة لسلطنة عمان',
      category: 'political_map',
      regionName: 'سلطنة عمان (المحافظات الإحدى عشرة)',
      country: 'سلطنة عمان',
      coordinates: { lat: 21.5, lng: 57.0, zoom: 6 },
      scale: '1:1,000,000',
      projection: 'UTM Zone 40N',
      year: 2024,
      imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
      description: 'خريطة إدارية رسمية معتمدة توضح حدود المحافظات الإحدى عشرة: مسقط، ظفار، مسندم، الداخلية، شمال الباطنة، جنوب الباطنة، شمال الشرقية، جنوب الشرقية، الظاهرة، البريمي، والوسطى.',
      educationalApplications: [
        'تدريب الطلاب على تحديد المحافظات ومراكزها الإدارية والولايات',
        'مقارنة الكثافة السكانية بين محافظة مسقط وسهل الباطنة ومحافظة الوسطى',
        'التعرف على الموقع المتميز لمحافظة مسندم على مضيق هرمز وموانئ السلطنة'
      ],
      license: 'ترخيص وزارة التربية والتعليم والهيئة الوطنية للمساحة',
      tags: ['محافظات سلطنة عمان', 'خريطة إدارية', 'مسقط', 'ظفار', 'مسندم', 'الداخلية'],
      createdAt: '2026-09-02T12:00:00Z'
    },
    {
      id: 'geo-om-2',
      title: 'خريطة التضاريس وسلاسل جبال الحجر وظفار وسهل الباطنة',
      category: 'physical_map',
      regionName: 'شمال وجنوب سلطنة عمان',
      country: 'سلطنة عمان',
      coordinates: { lat: 23.2, lng: 57.3, zoom: 7 },
      scale: '1:500,000',
      projection: 'Lambert Conformal Conic',
      year: 2024,
      imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      description: 'خريطة كنتورية وطبيعية تبين قوس سلاسل جبال الحجر، وقمة جبل شمس (3009 م)، والجبل الأخضر، وسهل الباطنة الساحلي، ورمال آل وهيبة، وجبال ظفار في الجنوب.',
      educationalApplications: [
        'تحديد أعلى قمة جبلية في عمان وشبه الجزيرة العربية (جبل شمس 3009 م)',
        'استنتاج دور جبال الحجر كحاجز تضاريسي يؤثر في كميات الأمطار والغيوم',
        'ربط التضاريس بمسارات الأودية وتغذية المياه الجوفية والأفلاج العمانية'
      ],
      license: 'ترخيص الاستخدام المدرسي الحر',
      tags: ['تضاريس عمان', 'جبال الحجر', 'جبل شمس', 'الجبل الأخضر', 'سهل الباطنة'],
      createdAt: '2026-09-05T09:00:00Z'
    },
    {
      id: 'geo-om-3',
      title: 'صورة قمر صناعي عالية الوضوح: شبه جزيرة مسندم ومضيق هرمز الدولي',
      category: 'satellite',
      regionName: 'محافظة مسندم ومضيق هرمز',
      country: 'سلطنة عمان',
      coordinates: { lat: 26.2, lng: 56.4, zoom: 9 },
      scale: '1:100,000',
      year: 2024,
      imageUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80',
      description: 'صورة فضائية مأخوذة عبر القمر الصناعي توضح المضايق البحرية والخلجان والخوانق الشبيهة بالفيوردات في محافظة مسندم وممر الملاحة لناقلات النفط في مضيق هرمز.',
      educationalApplications: [
        'دراسة السواحل الصخرية والخلجان في مسندم',
        'تحليل الأهمية الجيوسياسية لمضيق هرمز في التجارة الدولية',
        'تطبيق مهارات الاستشعار عن بعد في التعرف على المعالم المكانية'
      ],
      license: 'المشاع الإبداعي التعليمي',
      tags: ['مسندم', 'مضيق هرمز', 'أقمار صناعية', 'استشعار عن بعد', 'ملاحة دولية'],
      createdAt: '2026-09-08T15:30:00Z'
    },
    {
      id: 'geo-om-4',
      title: 'رسم بياني مناخي (كلايموتوغراف): ظاهرة خريف ظفار ومقارنة الأمطار والحرارة',
      category: 'climate_chart',
      regionName: 'محافظة ظفار (صلالة والجبال المجاورة)',
      country: 'سلطنة عمان',
      year: 2024,
      imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
      description: 'مخطط مناخي يبين انخفاض درجات الحرارة وازدياد كميات الأمطار والضباب في صلالة وجبال ظفار خلال أشهر الصيف (يونيو - سبتمبر) نتيجة الرياح الموسمية الجنوبية الغربية مقارنة بباقي مناطق شبه الجزيرة العربية.',
      educationalApplications: [
        'تفسير أسباب ظاهرة خريف ظفار الفريدة ومقارنتها بمناخ الصحراء الجاف',
        'تدريب الطلاب على قراءة منحنيات الحرارة وأعمدة الأمطار الشهرية',
        'مناقشة الأثر الاقتصادي والسياحي لموسم الخريف في السلطنة'
      ],
      license: 'ترخيص المشاع الإبداعي',
      tags: ['خريف ظفار', 'صلالة', 'مناخ عمان', 'كلايموتوغراف', 'رياح موسمية'],
      createdAt: '2026-09-10T11:00:00Z'
    }
  ];

  // المراجع والمواقع الخارجية الرسمية لسلطنة عمان
  const externalReferences: ExternalReference[] = [
    {
      id: 'ext-om-1',
      title: 'بوابة سلطنة عمان التعليمية (وزارة التربية والتعليم)',
      url: 'https://home.moe.gov.om',
      authorOrEntity: 'وزارة التربية والتعليم - سلطنة عمان',
      publishDate: '2024-08-01',
      accessDate: '2026-10-12',
      topic: 'المناهج الدراسية، الكتب الرقمية، وأدلة المعلم لجميع الصفوف من 1 إلى 12',
      reliability: 'official',
      license: 'حقوق النشر الرسمية لوزارة التربية والتعليم العمانية',
      teacherNotes: 'المرجع الرسمي الأول لتحميل كتب الطالب وأدلة المعلم المعتمدة وجداول المواصفات الامتحانية لكافة المراحل.',
      tags: ['وزارة التربية والتعليم عمان', 'بوابة سلطنة عمان التعليمية', 'كتب دراسية', 'أدلة المعلم'],
      isAccessible: true,
      createdAt: '2026-09-01T10:00:00Z'
    },
    {
      id: 'ext-om-2',
      title: 'بوابة الهيئة الوطنية للمساحة (سلطنة عمان)',
      url: 'https://nsa.gov.om',
      authorOrEntity: 'الهيئة الوطنية للمساحة - وزارة الدفاع',
      publishDate: '2024-05-15',
      accessDate: '2026-10-10',
      topic: 'البيانات الجغرافية المكانية الوطنية والخرائط الطبوغرافية المعتمدة',
      reliability: 'official',
      license: 'بيانات حكومية جغرافية معتمدة',
      teacherNotes: 'مصدر رئيسي للخرائط الطبوغرافية والإحداثيات والمساقط الكارتوغرافية المعتمدة في منهج الجغرافيا والتقنيات الحديثة للصف الحادي عشر.',
      tags: ['الهيئة الوطنية للمساحة', 'خرائط رسمية', 'GIS عمان', 'كارتوغرافيا'],
      isAccessible: true,
      createdAt: '2026-09-03T11:00:00Z'
    },
    {
      id: 'ext-om-3',
      title: 'الموقع الرسمي لوحدة متابعة تنفيذ رؤية عُمان 2040',
      url: 'https://www.oman2040.om',
      authorOrEntity: 'وحدة متابعة تنفيذ رؤية عمان 2040',
      publishDate: '2024-01-10',
      accessDate: '2026-10-11',
      topic: 'المحاور الاستراتيجية والأولويات الوطنية والمشروعات التنموية الكبرى',
      reliability: 'official',
      license: 'بيانات حكومية رسمية',
      teacherNotes: 'مرجع ضروري لمعلمي مادة "هذا وطني" للصف الثاني عشر لربط المشروعات الاقتصادية (الدقم وصحار وصلالة) بمستهدفات الرؤية الوطنية.',
      tags: ['رؤية عمان 2040', 'تنمية مستدامة', 'هذا وطني', 'اقتصاد عمان'],
      isAccessible: true,
      createdAt: '2026-09-04T12:00:00Z'
    },
    {
      id: 'ext-om-4',
      title: 'المركز الوطني للإحصاء والمعلومات (NCSI Oman)',
      url: 'https://www.ncsi.gov.om',
      authorOrEntity: 'المركز الوطني للإحصاء والمعلومات - سلطنة عمان',
      publishDate: '2024-06-01',
      accessDate: '2026-10-12',
      topic: 'المؤشرات السكانية والاقتصادية والبيانات الجغرافية والمكانية لمحافظات عمان',
      reliability: 'official',
      license: 'إحصاءات وطنية مفتوحة',
      teacherNotes: 'بيانات حية وموثوقة لاستخدامها في إعداد دروس التوزيع السكاني والهرم السكاني العماني والاقتصاد.',
      tags: ['إحصاءات عمان', 'NCSI', 'بيانات سكانية', 'محافظات عمان'],
      isAccessible: true,
      createdAt: '2026-09-05T12:00:00Z'
    }
  ];

  // خطة درس نموذجي وفق الطريقة المعتمدة في سلطنة عمان
  const lessonsGenerated: GeneratedLesson[] = [
    {
      id: 'gen-lsn-om-1',
      title: 'خطة درس نموذجي: نظام الأفلاج العمانية وإدارة الموارد المائية (الصف السادس)',
      subjectName: 'الدراسات الاجتماعية',
      stageName: 'التعليم الأساسي - الحلقة الثانية',
      gradeName: 'الصف السادس الأساسي',
      unitTitle: 'الوحدة الأولى: الموارد المائية ونظام الأفلاج في سلطنة عمان',
      lessonTitle: 'نظام الأفلاج العمانية وإدارة الموارد المائية',
      durationMinutes: 45,
      objectives: {
        cognitive: [
          'أن يوضح الطالب مفهوم الفلج وأهميته التاريخية في استقرار المجتمع العماني بدقة',
          'أن يقارن بين أنواع الأفلاج الثلاثة (الداوودية، الغيلية، العينية) من حيث مصدر المياه ونسبة انتشارها',
          'أن يعدد الأفلاج العمانية الخمسة المدرجة في قائمة التراث العالمي لمنظمة اليونسكو'
        ],
        affective: [
          'أن يعتز الطالب بالعبقرية الهندسية للأجداد العمانيين في الإدارة المستدامة للثروة المائية',
          'أن يبدي حرصاً على ترشيد استهلاك المياه والمحافظة على سلامة قنوات الأفلاج'
        ],
        psychomotor: [
          'أن يعين الطالب مواقع أشهر الأفلاج (فلج دارس في نزوى وفلج الخطمين في بركة الموز) على خريطة عمان الصماء',
          'أن يرسم قطاعاً تخطيطياً مبسطاً لمسار الفلج من أم الفلج حتى الشريعة والمزارع'
        ]
      },
      conceptsAndTerms: [
        { term: 'الفلج', definition: 'قناة مائية تاريخية أصيلة لنقل المياه الجوفية أو السطحية وتوزيعها بنظام هندسي دقيق.' },
        { term: 'الأفلاج الداوودية', definition: 'أفلاج تعتمد على ينابيع مياه جوفية عميقة وتمتاز بجريانها المستمر طوال العام كفلج دارس.' },
        { term: 'أفلاج اليونسكو', definition: 'خمسة أفلاج عمانية أدرجت ضمن قائمة التراث العالمي عام 2006.' }
      ],
      prerequisites: [
        'معرفة مصادر المياه الطبيعية في سلطنة عمان',
        'القدرة على قراءة الخريطة الصماء واستخدام الرموز الجغرافية'
      ],
      toolsAndResources: [
        'كتاب الدراسات الاجتماعية - الصف السادس (ص 24 - 26)',
        'خريطة صماء لمحافظات سلطنة عمان وتوزيع الموارد المائية',
        'عرض مرئي لصور فلج دارس وفلج الجيلة وفلج الخطمين',
        'نموذج مجسم مبسط لمسار الفلج'
      ],
      hook: 'عرض مقطع مرئي قصير لمدة دقيقة لفلج دارس وهو ينساب بين بساتين النخيل في نزوى، وطرح سؤال التحدي: كيف استطاع الأجداد العمانيون قبل آلاف السنين شق قنوات مائية تحت الأرض بدقة متناهية دون آلات حديثة؟',
      procedures: [
        {
          stepNumber: 1,
          title: 'التهيئة الحافزة والعصف الذهني',
          durationMinutes: 5,
          teacherActivity: 'عرض مقطع مرئي قصير وطرح السؤال الاستقصائي حول هندسة شق الأفلاج.',
          studentActivity: 'مشاهدة المقطع، التفكير في السؤال، وطرح فرضيات حول مصادر مياه الأفلاج.',
          strategy: 'العصف الذهني والتساؤل الاستقصائي'
        },
        {
          stepNumber: 2,
          title: 'الاستكشاف والتعلم التعاوني',
          durationMinutes: 20,
          teacherActivity: 'توزيع جدول مقارنة ثلاثي الأبعاد وتوجيه الطلاب لاستخراج الفروق بين الأفلاج الداوودية والغيلية والعينية من الكتاب ص 24.',
          studentActivity: 'العمل في مجموعات، قراءة النص واستخراج مصادر المياه والنسب المئوية والأمثلة (فلج دارس، فلج الجيلة).',
          strategy: 'التعلم التعاوني (مجموعات الخبراء)'
        },
        {
          stepNumber: 3,
          title: 'التطبيق والتمثيل المكاني',
          durationMinutes: 10,
          teacherActivity: 'توزيع خريطة سلطنة عمان الصماء ومطالبة الطلاب بتوقيع ولايات نزوى وبركة الموز وصور وتحديد نوع الفلج في كل منها.',
          studentActivity: 'توقيع المواقع الجغرافية بدقة على الخريطة ومقارنة العمل مع المجموعة الزميلة.',
          strategy: 'الخرائط التفاعلية'
        },
        {
          stepNumber: 4,
          title: 'الغلق والتقويم الختامي',
          durationMinutes: 10,
          teacherActivity: 'تطبيق لعبة تعليمية سريعة (بطاقات التقييم) ومراجعة المفاهيم وتحديد الواجب المنزلي.',
          studentActivity: 'إكمال بطاقة الخروج وكتابة الفرق الجوهري بين الفلج الداوودي والفلج الغيلي.',
          strategy: 'تقويم بطاقات الخروج (Exit Tickets)'
        }
      ],
      assessmentMethods: {
        formative: [
          'الملاحظة المباشرة لمشاركة الطلاب في مجموعات التعلم التعاوني',
          'تصحيح جدول المقارنة بين أنواع الأفلاج',
          'متابعة دقة التعيين المكاني على الخريطة الصماء'
        ],
        summative: [
          'ورقة عمل تقويمية بنهاية الحصة',
          'سؤال تطبيقي في الاختبار القصير الأول'
        ]
      },
      differentiation: {
        supportLevel: [
          'توفير بطاقات مصورة مدعومة بالأسهم توضح أجزاء الفلج للطلاب المحتاجين للدعم',
          'تحديد الفروق الأساسية في جدول مبسط مسبق التجهيز'
        ],
        enrichmentLevel: [
          'تكليف الطلاب المتميزين بالبحث عن نظام "الأثر والعوامد" في قسمة مياه الفلج وتقديمه في دقيقتين',
          'إعداد تقرير مصور عن أحد الأفلاج القريبة من ولايتهم'
        ]
      },
      homework: 'بالاستعانة بأحد كبار السن في منطقتك أو بالبوابة التعليمية، اكتب فقرة من 4 أسطر تصف فيها كيف كان أهالي عمان يحافظون على نظافة فلجهم.',
      referencedSources: [
        {
          resourceTitle: 'كتاب الطالب: الدراسات الاجتماعية - الصف السادس (وزارة التربية والتعليم - سلطنة عمان)',
          pages: 'ص 24، ص 25، ص 26',
          notes: 'النص المعتمد لتعريف الأفلاج وأنواعها وأفلاج اليونسكو الخمسة'
        },
        {
          resourceTitle: 'دليل المعلم: مادة الدراسات الاجتماعية - الصف السادس',
          pages: 'ص 18، ص 19',
          notes: 'خطوات الاستقصاء ونواتج التعلم وجدول التقويم المستمر'
        }
      ],
      isTemplate: false,
      createdById: 'usr-admin-1',
      createdAt: '2026-09-15T10:00:00Z',
      updatedAt: '2026-09-15T10:00:00Z'
    }
  ];

  // ورقة عمل عمانية نموذجية
  const worksheets: Worksheet[] = [
    {
      id: 'ws-om-1',
      title: 'ورقة عمل وتطبيق خرائط صماء: جغرافية سلطنة عمان والأفلاج المائية',
      subjectName: 'الدراسات الاجتماعية',
      gradeName: 'الصف السادس الأساسي',
      unitTitle: 'الوحدة الأولى: الموارد المائية ونظام الأفلاج في سلطنة عمان',
      targetObjective: 'قياس قدرة الطالب على التمييز بين أنواع الأفلاج وتعيين المعالم الجغرافية على خريطة سلطنة عمان',
      timeMinutes: 20,
      instructions: 'أجب عن الأسئلة بدقة بالاعتماد على دراستك لمقرر الدراسات الاجتماعية واستعن بالخريطة الصماء المرفقة.',
      difficultyLevels: 'mixed',
      activities: [
        {
          id: 'act-om-1',
          type: 'individual',
          title: 'النشاط الأول: المصطلحات الجغرافية والتصنيف',
          prompt: 'صنف الأفلاج الآتية وفق نوعها (داوودي، غيلي، عيني):\n1. فلج دارس في ولاية نزوى: ( ................................... )\n2. فلج الجيلة في ولاية صور: ( ................................... )\n3. فلج الخطمين في بركة الموز: ( ................................... )\n4. فلج يعتمد على المياه الجارية في بطون الأودية بعد المطر: ( ................................... )',
          guidelines: 'اعتمد على التصنيفات الواردة في كتاب الطالب ص 24.',
          rubric: 'درجة واحدة لكل إجابة صحيحة (المجموع 4 درجات).'
        },
        {
          id: 'act-om-2',
          type: 'map_exercise',
          title: 'النشاط الثاني: تطبيق الخريطة الصماء لسلطنة عمان',
          prompt: 'على خريطة سلطنة عمان الصماء المرفقة:\n1. عيّن محافظة مسندم وموقع مضيق هرمز.\n2. ارسم باللون البني امتداد سلسلة جبال الحجر الغربي وسلسلة جبال الحجر الشرقي.\n3. حدد موقع ولاية نزوى (موطن فلج دارس).\n4. ظلل باللون الأخضر نطاق محافظة ظفار المتأثرة بخريف ظفار.',
          guidelines: 'استخدم الألوان المحددة واحرص على دقة التوقيع المكاني.',
          rubric: 'درجة لكل معلم جغرافي صحيح (المجموع 4 درجات).'
        },
        {
          id: 'act-om-3',
          type: 'critical_thinking',
          title: 'النشاط الثالث: التفكير الناقد وصون الموارد',
          prompt: 'علل: لماذا تعد الأفلاج الداوودية أكثر أماناً واستقراراً للزراعة في سلطنة عمان مقارنة بالأفلاج الغيلية أثناء سنوات الجفاف؟',
          guidelines: 'اربط إجابتك بمصدر تغذية المياه الجوفية العميقة.',
          rubric: 'درجتان للإجابة العلمية المتسلسلة منطقياً.'
        }
      ],
      referencedSources: [
        'كتاب الطالب: الدراسات الاجتماعية - الصف السادس (ص 24 - 26)',
        'أطلس سلطنة عمان المدرسي'
      ],
      createdById: 'usr-admin-1',
      createdAt: '2026-09-16T11:00:00Z'
    }
  ];

  // اختبار تحصيلي عماني مطابق لجدول المواصفات
  const assessments: Assessment[] = [
    {
      id: 'asmt-om-1',
      title: 'الاختبار التحصيلي الفصلي: مادة هذا وطني - الصف الثاني عشر (الفصل الدراسي الأول)',
      subjectName: 'هذا وطني - تاريخ وجغرافية عمان',
      gradeName: 'الصف الثاني عشر',
      unitTitle: 'الوحدة الأولى: عُمان المكان والحضارة والتنوع التضاريسي',
      totalPoints: 20,
      timeLimitMinutes: 45,
      instructions: 'أجب عن جميع الأسئلة الآتية. الاختبار يتضمن أسئلة اختيار من متعدد، وأسئلة مقالية، وتفسير خرائط وتحليل بيانات.',
      questions: [
        {
          id: 'q-om-1',
          type: 'multiple_choice',
          prompt: 'تقع أعلى قمة جبلية في سلطنة عمان وشبه الجزيرة العربية في سلسلة جبال الحجر وهي قمة:',
          options: [
            'أ) جبل سمحان (1800 م)',
            'ب) جبل شمس (3009 م)',
            'ج) الجبل الأخضر (2400 م)',
            'د) جبل حفيت (1160 م)'
          ],
          correctAnswer: 'ب) جبل شمس (3009 م)',
          explanation: 'قمة جبل شمس بسلسلة جبال الحجر الغربي ترتفع 3009 أمتار فوق مستوى سطح البحر وهي أعلى قمة في عمان (كتاب هذا وطني ص 22).',
          points: 2,
          difficulty: 'easy',
          objectiveTarget: 'استرجاع الحقائق والبيانات التضاريسية العمانية',
          isDirectFromTextbook: true,
          sourceCitation: {
            resourceTitle: 'كتاب الطالب: هذا وطني - تاريخ وجغرافية سلطنة عمان',
            pageNumber: 22
          }
        },
        {
          id: 'q-om-2',
          type: 'multiple_choice',
          prompt: 'المضيق المائي الاستراتيجي الذي تشرف عليه سلطنة عمان عبر محافظة مسندم ويمر عبره نحو 20% من نفط العالم هو:',
          options: [
            'أ) مضيق باب المندب',
            'ب) مضيق هرمز',
            'ج) مضيق البوسفور',
            'د) مضيق ملقا'
          ],
          correctAnswer: 'ب) مضيق هرمز',
          explanation: 'تشرف سلطنة عمان عبر شبه جزيرة مسندم على مضيق هرمز الذي يربط الخليج العربي ببحر عمان والمحيط الهندي (كتاب هذا وطني ص 18).',
          points: 2,
          difficulty: 'easy',
          objectiveTarget: 'التعرف على الموقع الجيوسياسي لسلطنة عمان',
          isDirectFromTextbook: true,
          sourceCitation: {
            resourceTitle: 'كتاب الطالب: هذا وطني - تاريخ وجغرافية سلطنة عمان',
            pageNumber: 18
          }
        },
        {
          id: 'q-om-3',
          type: 'true_false',
          prompt: 'تتميز جبال ظفار في جنوب سلطنة عمان بهبوب الرياح الموسمية الجنوبية الغربية الرطبة صيفاً وتعرف هذه الظاهرة بـ "خريف ظفار".',
          options: ['صح', 'خطأ'],
          correctAnswer: 'صح',
          explanation: 'تهب الرياح الموسمية الجنوبية الغربية المحملة بالضباب والأمطار الرذاذية في أشهر الصيف لتخلق ظاهرة خريف ظفار (كتاب هذا وطني ص 23).',
          points: 2,
          difficulty: 'easy',
          objectiveTarget: 'فهم الظواهر المناخية الخاصة بسلطنة عمان',
          isDirectFromTextbook: true,
          sourceCitation: {
            resourceTitle: 'كتاب الطالب: هذا وطني - تاريخ وجغرافية سلطنة عمان',
            pageNumber: 23
          }
        },
        {
          id: 'q-om-4',
          type: 'fill_blank',
          prompt: 'يفصل وادي ............................ بين سلسلتي جبال الحجر الغربي وجبال الحجر الشرقي في سلطنة عمان.',
          correctAnswer: 'سمائل',
          explanation: 'وادي سمائل يمثل الممر الطبيعي الفاصل بين الحجر الغربي والحجر الشرقي في جبال عمان (كتاب هذا وطني ص 22).',
          points: 2,
          difficulty: 'medium',
          objectiveTarget: 'تحديد الممرات والأودية التضاريسية الفاصلة في عمان',
          isDirectFromTextbook: true,
          sourceCitation: {
            resourceTitle: 'كتاب الطالب: هذا وطني - تاريخ وجغرافية سلطنة عمان',
            pageNumber: 22
          }
        },
        {
          id: 'q-om-5',
          type: 'map_interpretation',
          prompt: 'بالنظر إلى خريطة سلطنة عمان ومواقع الموانئ الاستراتيجية: فسر لماذا يمثل "ميناء الدقم" وموقعه على بحر العرب ميزة جيو-اقتصادية واستراتيجية فريدة مقارنة بالموانئ الواقعة داخل الخليج العربي؟',
          correctAnswer: 'لأن ميناء الدقم يقع مباشرة على بحر العرب المفتوح على المحيط الهندي خارج مضيق هرمز، مما يجعله مأمونا ومتاحا للملاحة الدولية وتجارة النفط والحاويات دون التأثر بأي توترات أو اختناقات ملاحية في المضيق.',
          explanation: 'الموقع الاستراتيجي لميناء الدقم خارج مضيق هرمز يمنح سلطنة عمان ميزة لوجستية وتنافسية كبرى ضمن رؤية عمان 2040 (كتاب هذا وطني ص 55).',
          points: 4,
          difficulty: 'hard',
          objectiveTarget: 'تفسير الخرائط والمواقع الجيوسياسية والتفكير الاستراتيجي المستقبلي',
          isDirectFromTextbook: false,
          sourceCitation: {
            resourceTitle: 'كتاب الطالب: هذا وطني - تاريخ وجغرافية سلطنة عمان',
            pageNumber: 55
          }
        },
        {
          id: 'q-om-6',
          type: 'essay',
          prompt: 'ما هي المقومات الجغرافية والبيئية التي تمتلكها سلطنة عمان وتؤهلها لتكون مركزاً عالمياً لإنتاج وتصدير "الهيدروجين الأخضر" والطاقة المتجددة وفق رؤية عمان 2040؟',
          correctAnswer: '1. وفرة الإشعاع الشمسي والسطوع العالي طوال العام. 2. سرعات الرياح القوية والمستمرة في محافظات الوسطى وظفار. 3. توافر مساحات شاسعة من الأراضي المنبسطة غير المأهولة الملائمة للمحطات. 4. الإطلالة على مسطحات مائية مفتوحة وقرب الموانئ العالمية (الدقم وصلالة وصحار) لتسهيل تصدير الهيدروجين إلى الأسواق الأوروبية والآسيوية.',
          explanation: 'المقومات الطبيعية لإنتاج الطاقة المتجددة في سلطنة عمان الموثقة في محاور رؤية عمان 2040 (كتاب هذا وطني ص 56).',
          points: 4,
          difficulty: 'hard',
          objectiveTarget: 'تحليل مقومات التنمية المستدامة واستثمار الموارد الجغرافية',
          isDirectFromTextbook: false
        },
        {
          id: 'q-om-7',
          type: 'data_analysis',
          prompt: 'إذا كان إجمالي أطوال السواحل العمانية يبلغ نحو 3165 كم، وعدد المحافظات الإحدى عشرة، ما المحافظات الساحلية التي تطل على بحر العرب مباشرة؟',
          correctAnswer: 'محافظة ظفار، ومحافظة الوسطى، ومحافظة جنوب الشرقية.',
          explanation: 'التحليل المكاني للواجهات البحرية لسلطنة عمان؛ حيث تطل هذه المحافظات الثلاث على بحر العرب والمحيط الهندي.',
          points: 4,
          difficulty: 'medium',
          objectiveTarget: 'الربط المكاني بين المحافظات الإدارية والمسطحات البحرية العمانية',
          isDirectFromTextbook: true
        }
      ],
      gradingRubric: [
        { criteria: 'الأسئلة الموضوعية (الخيارات، الصح والخطأ، الإكمال)', points: 8, description: 'دقة الاسترجاع ومطابقة نص الكتاب الوزاري العماني.' },
        { criteria: 'سؤال الخريطة وميناء الدقم (س 5)', points: 4, description: 'ذكر الوقوع على بحر العرب خارج مضيق هرمز والملاحة الآمنة.' },
        { criteria: 'المقومات الجغرافية للهيدروجين الأخضر (س 6)', points: 4, description: 'ذكر 3 مقومات على الأقل (الشمس، الرياح، الأراضي، الموانئ والتصدير).' },
        { criteria: 'المحافظات المطلة على بحر العرب (س 7)', points: 4, description: 'تحديد المحافظات الثلاث بدقة (ظفار، الوسطى، جنوب الشرقية).' }
      ],
      createdById: 'usr-admin-1',
      createdAt: '2026-09-18T14:00:00Z'
    }
  ];

  // ----------------------------------------------------
  // الخطط السنوية والفصلية لتوزيع المناهج (وفق وزارة التربية والتعليم بسلطنة عمان)
  // ----------------------------------------------------
  const annualPlans: AnnualPlan[] = [
    {
      id: 'plan-om-12-hatha-watani',
      title: 'الخطة الفصلية لتوزيع منهاج: هذا وطني (تاريخ وجغرافية عمان والمواطنة)',
      academicYear: '2026/2027 م - 1448 هـ',
      stageId: 'stg-3',
      stageName: 'التعليم ما بعد الأساسي (الصفوف 11 - 12)',
      gradeId: 'grd-12',
      gradeName: 'الصف الثاني عشر',
      subjectId: 'subj-om-1',
      subjectName: 'هذا وطني - تاريخ وجغرافية عمان',
      semesterId: 'sem-1',
      semesterName: 'الفصل الدراسي الأول',
      teacherName: 'أ. مريم بنت عبدالله المعمرية',
      supervisorName: 'أحمد بن سالم البلوشي',
      schoolName: 'مدرسة كعب بن برشة للتعليم ما بعد الأساسي (11 - 12)',
      directorateName: 'المديرية العامة للتربية والتعليم بمحافظة مسقط',
      totalWeeks: 16,
      periodsPerWeek: 4,
      generalObjectives: [
        'ترسيخ الهوية الوطنية العمانية والاعتزاز بالإرث الحضاري والموقع الجغرافي الفريد لسلطنة عمان.',
        'إدراك الأهمية الجيوسياسية لموقع سلطنة عمان وإشرافها على مضيق هرمز وبحر العرب والمحيط الهندي.',
        'استيعاب المرتكزات الأساسية لرؤية عمان 2040 ودور الجغرافيا الاقتصادية في تنويع مصادر الدخل.',
        'إكساب الطلبة مهارات قراءة الخرائط والتحليل المكاني وتفسير الظواهر البيئية والتنموية.',
        'تقدير جهود الدولة في صون البيئة العمانية وإدارة الموارد المائية (الأفلاج والسدود).'
      ],
      weeklyDistribution: [
        {
          weekNumber: 1,
          dateRange: 'الأسبوع 1: 1 - 5 سبتمبر',
          unitTitle: 'الوحدة الأولى: عمان المكان والحضارة',
          lessonTitle: 'التهيئة وتوزيع خطة المنهاج والتقويم المستمر + مراجعة المفاهيم الجغرافية الأساسية',
          periodsCount: 4,
          learningOutcomes: [
            'يتعرف الطالب على مفردات وثيقة تقويم مادة هذا وطني والمشاريع الفصلية.',
            'يسترجع مهارات قراءة الخريطة الطبوغرافية والإحداثيات الجغرافية.'
          ],
          teachingStrategies: ['المناقشة والحوار', 'العصف الذهني', 'خرائط المفاهيم'],
          assessmentMethods: ['التقويم التشخيصي المبدئي', 'الملاحظة الصفية'],
          teachingAids: ['خريطة سلطنة عمان الطبيعية', 'شاشة العرض التفاعلية', 'دليل المعلم ص 12-15'],
          notes: 'تسليم استمارة متابعة الأنشطة للطلبة والتعريف برابط المنهاج الإلكتروني.'
        },
        {
          weekNumber: 2,
          dateRange: 'الأسبوع 2: 8 - 12 سبتمبر',
          unitTitle: 'الوحدة الأولى: عمان المكان والحضارة',
          lessonTitle: 'الدرس الأول: الموقع الجغرافي والجيوسياسي لسلطنة عمان وأهميته الاستراتيجية',
          periodsCount: 4,
          learningOutcomes: [
            'يحدد الموقع الفلكي والجغرافي لسلطنة عمان على خريطة العالم والشرق الأوسط.',
            'يحلل الأهمية الاستراتيجية لإشراف عمان على مضيق هرمز وبحر عمان وبحر العرب.',
            'يستنتج أبعاد السياسة الخارجية العمانية المبنية على التوازن والملاحة الآمنة.'
          ],
          teachingStrategies: ['الاستقصاء الجغرافي', 'تحليل الخرائط', 'التعلم التعاوني'],
          assessmentMethods: ['سؤال تطبيقي على الخريطة الصماء', 'المناقشة الصفية'],
          teachingAids: ['أطلس سلطنة عمان', 'مرئيات فضائية لمضيق هرمز وبحر العرب', 'كتاب الطالب ص 14-22'],
          notes: 'ربط الدرس بالدور التاريخي للأسطول العماني في القرنين الثامن عشر والتاسع عشر.'
        },
        {
          weekNumber: 3,
          dateRange: 'الأسبوع 3: 15 - 19 سبتمبر',
          unitTitle: 'الوحدة الأولى: عمان المكان والحضارة',
          lessonTitle: 'الدرس الثاني: تضاريس سلطنة عمان (سلسلة جبال الحجر الغربي والشرقي، جبل شمس والجبل الأخضر)',
          periodsCount: 4,
          learningOutcomes: [
            'يقارن بين قطاعي جبال الحجر الغربي والحجر الشرقي من حيث الامتداد والخصائص الجيولوجية.',
            'يحدد موقع جبل شمس (3009 م) والجبل الأخضر والقمم الرئيسية.',
            'يوضح الأثر المناخي والبيئي لتضاريس جبال الحجر على الهطول المطري وتغذية المياه الجوفية.'
          ],
          teachingStrategies: ['التعلم الاستكشافي', 'النمذجة ثلاثية الأبعاد', 'جدول المقارنة'],
          assessmentMethods: ['ورقة عمل تحليل قطاع تضاريسي', 'الملاحظة المنظمة'],
          teachingAids: ['نموذج تضاريسي ثلاثي الأبعاد لجبال الحجر', 'Google Earth 3D', 'كتاب الطالب ص 23-31'],
          notes: 'تكليف الطلاب بجمع عينات صخرية أو صور للمدرجات الزراعية في الجبل الأخضر.'
        },
        {
          weekNumber: 4,
          dateRange: 'الأسبوع 4: 22 - 26 سبتمبر',
          unitTitle: 'الوحدة الأولى: عمان المكان والحضارة',
          lessonTitle: 'الدرس الثالث: السهول الساحلية والصحاري (سهل الباطنة، رمال الشرقية، جدة الحراسيس، صحراء الربع الخالي)',
          periodsCount: 4,
          learningOutcomes: [
            'يبرز الأهمية الزراعية والكثافة السكانية لسهل الباطنة.',
            'يميز بين النظم البيئية الصحراوية والكثبان الرملية في رمال الشرقية.',
            'يقدر التنوع الحيوي ومحمية المها العربية بجدة الحراسيس بمحافظة الوسطى.'
          ],
          teachingStrategies: ['رحلة افتراضية (Virtual Tour)', 'العمل في مجموعات', 'حل المشكلات'],
          assessmentMethods: ['بطاقة خروج', 'واجب منزلي على المنصة التعليمية'],
          teachingAids: ['مرئيات الاستشعار عن بعد لرمال الشرقية', 'مقاطع وثائقية للمحميات الطبيعية العمانية'],
          notes: 'التنسيق مع مشرف النادي البيئي لمعرض مصور عن التنوع الإحيائي بالسلطنة.'
        },
        {
          weekNumber: 5,
          dateRange: 'الأسبوع 5: 29 سبتمبر - 3 أكتوبر',
          unitTitle: 'الوحدة الأولى: عمان المكان والحضارة',
          lessonTitle: 'الدرس الرابع: جبال ظفار ومناخ الخريف والتأثيرات الموسمية',
          periodsCount: 4,
          learningOutcomes: [
            'يفسر ظاهرة موسم الخريف والرياح الموسمية الجنوبية الغربية (Monsoon) على جبال ظفار.',
            'يحدد السلاسل الجبلية (جبل سمحان، جبل القرا، جبل القمر).',
            'يحلل الأثر الاقتصادي والسياحي لموسم اللبان وخريف ظفار.'
          ],
          teachingStrategies: ['دراسة الحالة', 'تحليل الرسوم البيانية المناخية', 'المناقشة الموجهة'],
          assessmentMethods: ['رسم منحنى بياني للمطر ودرجات الحرارة', 'اختبار قصير تجريبي'],
          teachingAids: ['صور الأقمار الاصطناعية لحركة السحب الموسمية', 'عينات من لبان الحوجري العماني'],
          notes: 'تطبيق الاختبار القصير الأول (الفترة الأولى).'
        },
        {
          weekNumber: 6,
          dateRange: 'الأسبوع 6: 6 - 10 أكتوبر',
          unitTitle: 'الوحدة الأولى: عمان المكان والحضارة',
          lessonTitle: 'مراجعة الوحدة الأولى + تطبيق الاختبار القصير الأول (10 درجات)',
          periodsCount: 4,
          learningOutcomes: [
            'يثبت المفاهيم التضاريسية والجيوسياسية للوحدة الأولى.',
            'يظهر تمكناً عالياً في التعامل مع أسئلة الخرائط ونواتج التعلم التحليلية.'
          ],
          teachingStrategies: ['المراجعة المركزة', 'محطات التعلم', 'التغذية الراجعة الفورية'],
          assessmentMethods: ['الاختبار القصير الأول المعتمد (10 درجات)', 'مصفوفة تصحيح الأداء'],
          teachingAids: ['نماذج اختبارات سابقة من البوابة التعليمية', 'شبكة تحليل نتائج الاختبار'],
          notes: 'رصد درجات الاختبار القصير الأول وإعداد خطة دعم للطلبة المحتاجين لمساندة.'
        },
        {
          weekNumber: 7,
          dateRange: 'الأسبوع 7: 13 - 17 أكتوبر',
          unitTitle: 'الوحدة الثانية: الموارد الطبيعية والتنمية المستدامة',
          lessonTitle: 'الدرس الأول: الموارد المائية في عمان وإدارة الأفلاج والسدود المائية',
          periodsCount: 4,
          learningOutcomes: [
            'يصنف أنواع الأفلاج في عمان (داوودية، غيلية، عينية) والخصائص الهيدرولوجية لكل نوع.',
            'يشرح نظام "الأثر والعوامد" في قسمة مياه الأفلاج كنظام اجتماعي تراثي فريد.',
            'يبين دور سدود التغذية الجوفية وسدود الحماية من الفيضانات بسلطنة عمان.'
          ],
          teachingStrategies: ['التعلم القائم على المشروعات', 'لعب الأدوار (وكيل الفلج)', 'العصف الذهني'],
          assessmentMethods: ['جدول مقارنة الأفلاج الثلاثة', 'المناقشة التفاعلية'],
          teachingAids: ['مخطط هندسي توضيحي لأجزاء الفلج', 'قائمة أفلاج عمان المسجلة باليونسكو'],
          notes: 'إعداد خطاب لإدارة المدرسة لتنظيم زيارة لأحد الأفلاج القريبة.'
        },
        {
          weekNumber: 8,
          dateRange: 'الأسبوع 8: 20 - 24 أكتوبر',
          unitTitle: 'الوحدة الثانية: الموارد الطبيعية والتنمية المستدامة',
          lessonTitle: 'الدرس الثاني: الموارد الهيدروكربونية والتعدين (النفط، الغاز، المعادن وصخور الأفيوليت)',
          periodsCount: 4,
          learningOutcomes: [
            'يتتبع مراحل استكشاف النفط والغاز في سلطنة عمان وأهم الحقول البرية والبحرية.',
            'يحدد حزام صخور الأفيوليت في عمان وأهميتها الجيولوجية العالمية كقشرة محيطية ظاهرة.',
            'يناقش جهود شركة تنمية نفط عمان (PDO) في استخلاص النفط المعزز واستخدام الطاقة الشمسية (مشروع مرآة).'
          ],
          teachingStrategies: ['العرض الاستقرائي', 'تحليل الإنفوجرافيك', 'التعلم الذاتي'],
          assessmentMethods: ['ورقة عمل تحليل حقول الطاقة', 'سؤال التفكير الناقد'],
          teachingAids: ['خريطة حقول النفط والغاز وخطوط الأنابيب بالسلطنة', 'عينات صخرية للأفيوليت والكروم'],
          notes: 'عرض فيلم قصير عن مشروع مرآة للطاقة الشمسية في حقل أمل.'
        },
        {
          weekNumber: 9,
          dateRange: 'الأسبوع 9: 27 - 31 أكتوبر',
          unitTitle: 'الوحدة الثانية: الموارد الطبيعية والتنمية المستدامة',
          lessonTitle: 'الدرس الثالث: الطاقة المتجددة في سلطنة عمان (مشروع عبري للطاقة الشمسية ومزارع الرياح بظفار)',
          periodsCount: 4,
          learningOutcomes: [
            'يقيم الإمكانات العالية للإشعاع الشمسي وسرعات الرياح في سلطنة عمان.',
            'يشرح تفاصيل محطة عبري للطاقة الشمسية الكهروضوئية (500 ميجاواط).',
            'يوضح دور محطة ظفار لطاقة الرياح بفوت (50 ميجاواط) في خفض الانبعاثات الكربونية.'
          ],
          teachingStrategies: ['حل المشكلات البيئية', 'المناقشة الثنائية', 'التعلم المبني على الأدلة'],
          assessmentMethods: ['سؤال تحليلي في كراسة الأنشطة', 'التقويم الختامي للدرس'],
          teachingAids: ['بيانات الأطلس الوطني لمصادر الرياح والشمس', 'صور محطة عبري ومحطة ظفار'],
          notes: 'ربط الدرس بالهدف الوطني للحياد الصفري الكربوني لعام 2050.'
        },
        {
          weekNumber: 10,
          dateRange: 'الأسبوع 10: 3 - 7 نوفمبر',
          unitTitle: 'الوحدة الثانية: الموارد الطبيعية والتنمية المستدامة',
          lessonTitle: 'الدرس الرابع: الهيدروجين الأخضر ومستقبل الطاقة النظيفة في رؤية عمان 2040',
          periodsCount: 4,
          learningOutcomes: [
            'يعرف الهيدروجين الأخضر ويميزه عن الهيدروجين الرمادي والأزرق.',
            'يحلل المقومات التنافسية لسلطنة عمان كمركز عالمي لإنتاج وتصدير الهيدروجين الأخضر.',
            'يحدد مناطق امتياز الهيدروجين في الدقم ومحوت وجنوب عمان التي تشرف عليها شركة هايدروم (Hydrom).'
          ],
          teachingStrategies: ['الاستقصاء الموجه', 'تحليل السياسات الاقتصادية', 'العمل الجماعي'],
          assessmentMethods: ['إعداد ملصق علمي (Poster)', 'ملاحظة الأداء الشفوي'],
          teachingAids: ['خريطة مناطق امتياز شركة هايدروم', 'تقرير وزارة الطاقة والمعادن حول الهيدروجين الأخضر'],
          notes: 'متابعة إنجاز الطلاب للمشروع الفصلي (تسليم المسودة الأولى).'
        },
        {
          weekNumber: 11,
          dateRange: 'الأسبوع 11: 10 - 14 نوفمبر',
          unitTitle: 'الوحدة الثالثة: الاقتصاد العماني واللوجستيات والموانئ',
          lessonTitle: 'الدرس الأول: الموانئ العمانية الاستراتيجية (ميناء صحار، ميناء الدقم، ميناء صلالة)',
          periodsCount: 4,
          learningOutcomes: [
            'يقارن بين موانئ سلطنة عمان الكبرى من حيث الموقع والعمق والميزات التنافسية.',
            'يبرز القيمة الجيواقتصادية لميناء الدقم وموقعه المفتوح على بحر العرب وطرق التجارة الدولية.',
            'يحلل أهمية ميناء صلالة كأحد أفضل موانئ إعادة الشحن ومناولة الحاويات عالمياً.'
          ],
          teachingStrategies: ['المقارنة البصرية', 'تحليل دراسة جدوى مبسطة', 'المناظرة التعليمية'],
          assessmentMethods: ['جدول مقارنة الموانئ الثلاثة', 'سؤال الخريطة الصماء'],
          teachingAids: ['خرائط الملاحة البحرية الدولية', 'بيانات مجموعة أسياد (ASYAD Group) اللوجستية'],
          notes: 'تطبيق الاختبار القصير الثاني (الفترة الثانية).'
        },
        {
          weekNumber: 12,
          dateRange: 'الأسبوع 12: 17 - 21 نوفمبر',
          unitTitle: 'الوحدة الثالثة: الاقتصاد العماني واللوجستيات والموانئ',
          lessonTitle: 'الدرس الثاني: المناطق الحرة والاقتصادية الخاصة (الدقم، صحار، صلالة، المزيونة)',
          periodsCount: 4,
          learningOutcomes: [
            'يميز بين مفهوم المنطقة الاقتصادية الخاصة والمناطق الحرة.',
            'يعدد الحوافز والتسهيلات الاستثمارية التي تقدمها سلطنة عمان للمستثمرين.',
            'يقيم أثر المناطق الاقتصادية في توطين الصناعات وتوفير فرص العمل للشباب العماني.'
          ],
          teachingStrategies: ['العصف الذهني', 'لعب الأدوار (مستثمر اقتصادي)', 'التعلم التعاوني'],
          assessmentMethods: ['ورقة عمل تحليل الحوافز الاستثمارية', 'التقويم البنائي المستمر'],
          teachingAids: ['كتيب الهيئة العامة للمناطق الاقتصادية الخاصة والمناطق الحرة (OPAZ)'],
          notes: 'احتفالات العيد الوطني المجيد الـ 56 وربطه بالمنجزات التنموية الحديثة.'
        },
        {
          weekNumber: 13,
          dateRange: 'الأسبوع 13: 24 - 28 نوفمبر',
          unitTitle: 'الوحدة الرابعة: عمان ورؤية 2040 والمواطنة الفاعلة',
          lessonTitle: 'الدرس الأول: محاور وأهداف رؤية عمان 2040 (الإنسان والمجتمع، الاقتصاد والتنمية، البيئة المستدامة، الحوكمة والأداء المؤسسي)',
          periodsCount: 4,
          learningOutcomes: [
            'يحدد المحاور الأربعة الرئيسية لرؤية عمان 2040.',
            'يربط بين الأولويات الوطنية وأهداف التنمية المستدامة بالأمم المتحدة.',
            'يستشعر مسؤوليته الفردية والمجتمعية في تحقيق مستهدفات الرؤية الوطنية.'
          ],
          teachingStrategies: ['خرائط التفكير', 'المناقشة الجماعية', 'تحليل الوثائق الوطنية'],
          assessmentMethods: ['سؤال تحليلي تطبيقي', 'تقييم العروض الطلابية السريعة'],
          teachingAids: ['وثيقة رؤية عمان 2040 الرسمية', 'إنفوجرافيك المحاور والأولويات الوطنية'],
          notes: 'تسليم ومناقشة المشاريع البحثية والعملية للطلبة ورصد درجاتها النهائية.'
        },
        {
          weekNumber: 14,
          dateRange: 'الأسبوع 14: 1 - 5 ديسمبر',
          unitTitle: 'الوحدة الرابعة: عمان ورؤية 2040 والمواطنة الفاعلة',
          lessonTitle: 'الدرس الثاني: التحول الرقمي والذكاء الاصطناعي وتقنيات الفضاء في سلطنة عمان',
          periodsCount: 4,
          learningOutcomes: [
            'يستعرض البرنامج الوطني للاقتصاد الرقمي وبرامج الذكاء الاصطناعي في سلطنة عمان.',
            'يتعرف على إطلاق القمر الاصطناعي العماني (أمان-1) وأهميته في الاستشعار عن بعد ومراقبة الموارد.',
            'يناقش دور منصة إجادة والبوابة التعليمية في تحسين كفاءة العمل والتعليم.'
          ],
          teachingStrategies: ['التعلم الرقمي', 'التحليل التقني', 'حلقات النقاش المصغرة'],
          assessmentMethods: ['كتابة فقرة تحليلية نقدية', 'الملاحظة الصفية'],
          teachingAids: ['فيديو إطلاق القمر الاصطناعي أمان-1', 'منصة عين والبوابة التعليمية'],
          notes: 'إعداد قوائم الطلبة المتميزين لإصدار شهادات التقدير وخطابات الشكر لأولياء الأمور.'
        },
        {
          weekNumber: 15,
          dateRange: 'الأسبوع 15: 8 - 12 ديسمبر',
          unitTitle: 'المراجعة الشاملة والتطبيقات العملية',
          lessonTitle: 'مراجعة عامة وتطبيقات مهارية على قراءة الخرائط وتحليل البيانات والجداول الإحصائية',
          periodsCount: 4,
          learningOutcomes: [
            'يتقن حل مختلف أنماط أسئلة الامتحانات الوزارية النهائية لدبلوم التعليم العام.',
            'يحلل قضايا ومواقف جغرافية وتاريخية عمانية بأسلوب منهجي وموضوعي.'
          ],
          teachingStrategies: ['حل الاختبارات النموذجية', 'المسابقات التعليمية التنافسية', 'التدريب المكثف'],
          assessmentMethods: ['امتحان تجريبي نهائي محاكي لامتحان الوزارة', 'استبانة التقييم الذاتي'],
          teachingAids: ['نماذج الامتحانات الوزارية للسنوات السابقة مع نماذج الإجابة المعتمدة'],
          notes: 'تنفيذ حصص تقوية ودعم للطلبة متوسطي التحصيل وتوجيههم للمنصات الرقمية.'
        },
        {
          weekNumber: 16,
          dateRange: 'الأسبوع 16: 15 - 19 ديسمبر',
          unitTitle: 'الختام ورصد الدرجات',
          lessonTitle: 'المراجعة الختامية ورصد أعمال الفصل وإغلاق ملفات الإنجاز المدرسي',
          periodsCount: 4,
          learningOutcomes: [
            'اكتمال ملف إنجاز الطالب والتحقق من رصد درجات التقويم المستمر على البوابة التعليمية.'
          ],
          teachingStrategies: ['التغذية الراجعة الفردية', 'التوجيه والإرشاد الأكاديمي'],
          assessmentMethods: ['التدقيق النهائي لأعمال الفصل (الدرجة الإجمالية للفصل الأول)'],
          teachingAids: ['سجل الدرجات الإلكتروني المعتمد'],
          notes: 'رفع تقرير الأداء الفصلي لإدارة المدرسة وللمديرية العامة للتربية والتعليم.'
        }
      ],
      notes: 'تم إعداد الخطة وفق الخطة الدراسية الصادرة من المديرية العامة لتطوير المناهج بوزارة التربية والتعليم للعام الدراسي 2026/2027.',
      createdById: 'usr-teacher-1',
      createdAt: '2026-09-02T08:00:00Z',
      updatedAt: '2026-09-02T08:00:00Z'
    },
    {
      id: 'plan-om-11-geography-tech',
      title: 'الخطة الفصلية لمادة: الجغرافيا والتقنيات الحديثة (الصف الحادي عشر)',
      academicYear: '2026/2027 م - 1448 هـ',
      stageId: 'stg-3',
      stageName: 'التعليم ما بعد الأساسي (الصفوف 11 - 12)',
      gradeId: 'grd-11',
      gradeName: 'الصف الحادي عشر',
      subjectId: 'subj-om-3',
      subjectName: 'الجغرافيا والتقنيات الحديثة',
      semesterId: 'sem-1',
      semesterName: 'الفصل الدراسي الأول',
      teacherName: 'أ. مريم بنت عبدالله المعمرية',
      supervisorName: 'أحمد بن سالم البلوشي',
      schoolName: 'مدرسة كعب بن برشة للتعليم ما بعد الأساسي (11 - 12)',
      directorateName: 'المديرية العامة للتربية والتعليم بمحافظة مسقط',
      totalWeeks: 16,
      periodsPerWeek: 4,
      generalObjectives: [
        'التعرف على مفهوم علم الجغرافيا وتطور أدوات المسح والتمثيل الخرائطي.',
        'إتقان المهارات العملية لنظم المعلومات الجغرافية (GIS) والاستشعار عن بعد (Remote Sensing).',
        'تطبيق نظام تحديد المواقع العالمي (GPS) واستخدام برمجيات التحليل المكاني.',
        'توظيف التقنيات الحديثة في دراسة الموارد الطبيعية والتخطيط العمراني في سلطنة عمان.'
      ],
      weeklyDistribution: [
        {
          weekNumber: 1,
          dateRange: 'الأسبوع 1: 1 - 5 سبتمبر',
          unitTitle: 'الوحدة الأولى: علم الخرائط وتطور التقنيات',
          lessonTitle: 'مدخل إلى علم الخرائط وتاريخ الخرائط في الحضارة العمانية والإسلامية',
          periodsCount: 4,
          learningOutcomes: ['يتعرف على إسهامات الجغرافيين والبحارة العمانيين (أحمد بن ماجد) في علم الملاحة ورسم المصورات البحرية.'],
          teachingStrategies: ['المحاضرة التفاعلية', 'تحليل المخطوطات'],
          assessmentMethods: ['الأسئلة الشفوية', 'بطاقة الملاحظة'],
          teachingAids: ['مخطوطات بحرية تاريخية لأحمد بن ماجد', 'دليل المعلم ص 10-14'],
          notes: 'تهيئة مختبر الحاسوب للتطبيقات العملية.'
        },
        {
          weekNumber: 2,
          dateRange: 'الأسبوع 2: 8 - 12 سبتمبر',
          unitTitle: 'الوحدة الأولى: علم الخرائط وتطور التقنيات',
          lessonTitle: 'عناصر الخريطة ومقاييس الرسم والإسقاطات الخرائطية',
          periodsCount: 4,
          learningOutcomes: ['يحسب المسافات والمساحات الحقيقية باستخدام مقياس الرسم ويفسر أنواع الإسقاطات.'],
          teachingStrategies: ['التدريب العملي وحل المسائل', 'التعلم التعاوني'],
          assessmentMethods: ['تمرين عملي على تحويل المقاييس', 'المناقشة الصفية'],
          teachingAids: ['مساطر قياس وخرائط طبوغرافية بمقاييس مختلفة'],
          notes: 'تطبيق عملي في قاعة الجغرافيا.'
        },
        {
          weekNumber: 3,
          dateRange: 'الأسبوع 3: 15 - 19 سبتمبر',
          unitTitle: 'الوحدة الثانية: الاستشعار عن بعد (Remote Sensing)',
          lessonTitle: 'مفهوم الاستشعار عن بعد، الطيف الكهرومغناطيسي، والأقمار الاصطناعية',
          periodsCount: 4,
          learningOutcomes: ['يفهم سلوك الموجات الكهرومغناطيسية وتفاعلها مع الغلاف الجوي وسطح الأرض.'],
          teachingStrategies: ['الاستقصاء الموجه', 'المحاكاة الحاسوبية'],
          assessmentMethods: ['سؤال تفسيري في كراسة الأنشطة'],
          teachingAids: ['برمجيات المحاكاة للطيف الكهرومغناطيسي', 'صور أقمار اصطناعية لبيئات عمان'],
          notes: 'حجز قاعة الحاسوب للتطبيق على المرئيات الفضائية.'
        },
        {
          weekNumber: 4,
          dateRange: 'الأسبوع 4: 22 - 26 سبتمبر',
          unitTitle: 'الوحدة الثانية: الاستشعار عن بعد (Remote Sensing)',
          lessonTitle: 'المرئيات الفضائية وتفسير الصور الجوية للأودية والسواحل العمانية',
          periodsCount: 4,
          learningOutcomes: ['يميز العناصر التفسيرية للمرئيات (اللون، النسيج، النمط، الحجم، الظل).'],
          teachingStrategies: ['التدريب العملي التحليلي', 'المقارنة الثنائية'],
          assessmentMethods: ['تفسير مرئية فضائية لخور جراما بمحافظة جنوب الشرقية'],
          teachingAids: ['مرئيات لاندسات وسنتينل متعددة الأطياف لمحافظات السلطنة'],
          notes: 'إعداد تقرير جماعي عن استخدام الاستشعار في رصد التصحر.'
        }
      ],
      createdById: 'usr-teacher-1',
      createdAt: '2026-09-03T09:00:00Z',
      updatedAt: '2026-09-03T09:00:00Z'
    }
  ];

  // ----------------------------------------------------
  // جدول الحصص الأسبوعي (وفق نظام التعليم في سلطنة عمان: الأحد - الخميس)
  // ----------------------------------------------------
  const timetables: WeeklyTimetable[] = [
    {
      id: 'tt-om-teacher-1',
      title: 'جدول الحصص الأسبوعي لمعلم الدراسات الاجتماعية والجغرافيا',
      academicYear: '2026/2027 م - 1448 هـ',
      semester: 'الفصل الدراسي الأول',
      teacherName: 'أ. مريم بنت عبدالله المعمرية',
      schoolName: 'مدرسة كعب بن برشة للتعليم ما بعد الأساسي (11 - 12)',
      directorateName: 'المديرية العامة للتربية والتعليم بمحافظة مسقط',
      periods: [
        { periodNumber: 1, name: 'الحصة الأولى', startTime: '07:30', endTime: '08:15' },
        { periodNumber: 2, name: 'الحصة الثانية', startTime: '08:20', endTime: '09:05' },
        { periodNumber: 3, name: 'الحصة الثالثة', startTime: '09:10', endTime: '09:55' },
        { periodNumber: 4, name: 'الاستراحة / الفسحة المدرسية', startTime: '09:55', endTime: '10:25', isBreak: true },
        { periodNumber: 5, name: 'الحصة الرابعة', startTime: '10:25', endTime: '11:10' },
        { periodNumber: 6, name: 'الحصة الخامسة', startTime: '11:15', endTime: '12:00' },
        { periodNumber: 7, name: 'الحصة السادسة', startTime: '12:05', endTime: '12:50' },
        { periodNumber: 8, name: 'الحصة السابعة', startTime: '12:55', endTime: '01:35' }
      ],
      entries: [
        // الأحد
        {
          id: 'ent-1',
          day: 'الأحد',
          periodNumber: 1,
          gradeId: 'grd-12',
          gradeName: 'الصف الثاني عشر',
          section: '12/1',
          subject: 'هذا وطني (تاريخ وجغرافية عمان)',
          room: 'قاعة الجغرافيا رقم 4',
          color: '#0d9488',
          notes: 'درس: الموقع الجيوسياسي ومضيق هرمز'
        },
        {
          id: 'ent-2',
          day: 'الأحد',
          periodNumber: 2,
          gradeId: 'grd-12',
          gradeName: 'الصف الثاني عشر',
          section: '12/2',
          subject: 'هذا وطني (تاريخ وجغرافية عمان)',
          room: 'الصف 12/2',
          color: '#0d9488',
          notes: 'تطبيقات على الخرائط الطبوغرافية'
        },
        {
          id: 'ent-3',
          day: 'الأحد',
          periodNumber: 5,
          gradeId: 'grd-11',
          gradeName: 'الصف الحادي عشر',
          section: '11/1',
          subject: 'الجغرافيا والتقنيات الحديثة',
          room: 'مختبر الحاسوب ونظم المعلومات (GIS)',
          color: '#0284c7',
          notes: 'تطبيق عملي على Google Earth Pro'
        },
        {
          id: 'ent-4',
          day: 'الأحد',
          periodNumber: 7,
          gradeId: 'grd-10',
          gradeName: 'الصف العاشر',
          section: '10/3',
          subject: 'الدراسات الاجتماعية',
          room: 'الصف 10/3',
          color: '#16a34a',
          notes: 'نشاط بيئي واستدامة الموارد'
        },

        // الإثنين
        {
          id: 'ent-5',
          day: 'الإثنين',
          periodNumber: 2,
          gradeId: 'grd-11',
          gradeName: 'الصف الحادي عشر',
          section: '11/2',
          subject: 'الجغرافيا والتقنيات الحديثة',
          room: 'قاعة الجغرافيا رقم 4',
          color: '#0284c7',
          notes: 'الاستشعار عن بعد وتفسير المرئيات الفضائية'
        },
        {
          id: 'ent-6',
          day: 'الإثنين',
          periodNumber: 3,
          gradeId: 'grd-12',
          gradeName: 'الصف الثاني عشر',
          section: '12/1',
          subject: 'هذا وطني (تاريخ وجغرافية عمان)',
          room: 'الصف 12/1',
          color: '#0d9488',
          notes: 'تضاريس جبال الحجر الغربي والشرقي'
        },
        {
          id: 'ent-7',
          day: 'الإثنين',
          periodNumber: 6,
          gradeId: 'grd-12',
          gradeName: 'الصف الثاني عشر',
          section: '12/3',
          subject: 'هذا وطني (تاريخ وجغرافية عمان)',
          room: 'الصف 12/3',
          color: '#0d9488',
          notes: 'الموقع الجغرافي والواجهات البحرية'
        },

        // الثلاثاء
        {
          id: 'ent-8',
          day: 'الثلاثاء',
          periodNumber: 1,
          gradeId: 'grd-11',
          gradeName: 'الصف الحادي عشر',
          section: '11/1',
          subject: 'الجغرافيا والتقنيات الحديثة',
          room: 'مختبر الحاسوب ونظم المعلومات (GIS)',
          color: '#0284c7',
          notes: 'طبقات الخرائط والبيانات المكانية في GIS'
        },
        {
          id: 'ent-9',
          day: 'الثلاثاء',
          periodNumber: 3,
          gradeId: 'grd-10',
          gradeName: 'الصف العاشر',
          section: '10/3',
          subject: 'الدراسات الاجتماعية',
          room: 'الصف 10/3',
          color: '#16a34a',
          notes: 'نظام الأفلاج وسدود التغذية الجوفية'
        },
        {
          id: 'ent-10',
          day: 'الثلاثاء',
          periodNumber: 5,
          gradeId: 'grd-12',
          gradeName: 'الصف الثاني عشر',
          section: '12/2',
          subject: 'هذا وطني (تاريخ وجغرافية عمان)',
          room: 'الصف 12/2',
          color: '#0d9488',
          notes: 'موسم خريف ظفار وتأثير الرياح الموسمية'
        },
        {
          id: 'ent-11',
          day: 'الثلاثاء',
          periodNumber: 7,
          gradeId: 'grd-12',
          gradeName: 'الصف الثاني عشر',
          section: '12/1',
          subject: 'هذا وطني (تاريخ وجغرافية عمان)',
          room: 'قاعة مصادر التعلم',
          color: '#0d9488',
          notes: 'بحث واستقصاء حول مشاريع رؤية عمان 2040'
        },

        // الأربعاء
        {
          id: 'ent-12',
          day: 'الأربعاء',
          periodNumber: 1,
          gradeId: 'grd-12',
          gradeName: 'الصف الثاني عشر',
          section: '12/3',
          subject: 'هذا وطني (تاريخ وجغرافية عمان)',
          room: 'الصف 12/3',
          color: '#0d9488',
          notes: 'الموارد الطبيعية ومحطة عبري للطاقة الشمسية'
        },
        {
          id: 'ent-13',
          day: 'الأربعاء',
          periodNumber: 2,
          gradeId: 'grd-11',
          gradeName: 'الصف الحادي عشر',
          section: '11/2',
          subject: 'الجغرافيا والتقنيات الحديثة',
          room: 'مختبر الحاسوب ونظم المعلومات (GIS)',
          color: '#0284c7',
          notes: 'تطبيقات نظام التموضع العالمي GPS'
        },
        {
          id: 'ent-14',
          day: 'الأربعاء',
          periodNumber: 6,
          gradeId: 'grd-10',
          gradeName: 'الصف العاشر',
          section: '10/3',
          subject: 'الدراسات الاجتماعية',
          room: 'الصف 10/3',
          color: '#16a34a',
          notes: 'مناقشة أوراق عمل وأنشطة التعلم التعاوني'
        },

        // الخميس
        {
          id: 'ent-15',
          day: 'الخميس',
          periodNumber: 2,
          gradeId: 'grd-12',
          gradeName: 'الصف الثاني عشر',
          section: '12/2',
          subject: 'هذا وطني (تاريخ وجغرافية عمان)',
          room: 'الصف 12/2',
          color: '#0d9488',
          notes: 'الهيدروجين الأخضر وميناء الدقم اللوجستي'
        },
        {
          id: 'ent-16',
          day: 'الخميس',
          periodNumber: 3,
          gradeId: 'grd-11',
          gradeName: 'الصف الحادي عشر',
          section: '11/1',
          subject: 'الجغرافيا والتقنيات الحديثة',
          room: 'قاعة الجغرافيا رقم 4',
          color: '#0284c7',
          notes: 'تقويم المشروعات الخرائطية للطلاب'
        },
        {
          id: 'ent-17',
          day: 'الخميس',
          periodNumber: 5,
          gradeId: 'grd-12',
          gradeName: 'الصف الثاني عشر',
          section: '12/1',
          subject: 'هذا وطني (تاريخ وجغرافية عمان)',
          room: 'الصف 12/1',
          color: '#0d9488',
          notes: 'مراجعة ختامية وحل أسئلة الامتحانات الوزارية'
        },
        {
          id: 'ent-18',
          day: 'الخميس',
          periodNumber: 6,
          gradeId: 'grd-12',
          gradeName: 'الصف الثاني عشر',
          section: '12/3',
          subject: 'هذا وطني (تاريخ وجغرافية عمان)',
          room: 'الصف 12/3',
          color: '#0d9488',
          notes: 'تطبيق الاختبار القصير ورصد الدرجات'
        }
      ],
      createdById: 'usr-teacher-1',
      createdAt: '2026-09-01T10:00:00Z',
      updatedAt: '2026-09-01T10:00:00Z'
    }
  ];

  // ----------------------------------------------------
  // خطابات ومراسلات رسمية (وفق البروتوكول المعتمد في سلطنة عمان)
  // ----------------------------------------------------
  const officialLetters: OfficialLetter[] = [
    // 1. خطاب إلى مديرية التربية والتعليم: طلب تجهيزات مختبر GIS
    {
      id: 'let-dir-01',
      letterType: 'directorate',
      category: 'طلب تجهيزات وتقنيات جغرافية',
      title: 'طلب دعم وتزويد المدرسة بأجهزة ونظم معلومات جغرافية (GIS) وأطالس حديثة',
      referenceNumber: 'م/ت/ع/1448/087',
      dateHijri: '15 ربيع الأول 1448 هـ',
      dateMiladi: '28 سبتمبر 2026 م',
      schoolName: 'مدرسة كعب بن برشة للتعليم ما بعد الأساسي (11 - 12)',
      directorateName: 'المديرية العامة للتربية والتعليم بمحافظة مسقط',
      senderName: 'أ. مريم بنت عبدالله المعمرية',
      senderRole: 'معلم أول مادة الجغرافيا والدراسات الاجتماعية',
      recipientName: 'الفاضل / مدير عام المديرية العامة للتربية والتعليم بمحافظة مسقط',
      recipientTitle: 'المحترم / حفظه الله ورعاه',
      subject: 'طلب تزويد المدرسة بأجهزة حاسوب مخصصة لتطبيقات نظم المعلومات الجغرافية (GIS) والخرائط الرقمية',
      salutation: 'السلام عليكم ورحمة الله وبركاته،،، وبعد:',
      bodyParagraphs: [
        'يطيب لنا أن نهديكم خالص التحيات والتقدير لجهودكم المخلصة في دعم المسيرة التربوية والتعليمية بمدارس المحافظة، ونسأل الله لكم دوام التوفيق والسداد في خدمة وطننا العزيز سلطنة عمان.',
        'بالإشارة إلى خطة تطوير تدريس مادة الجغرافيا والتقنيات الحديثة للصفين الحادي عشر والثاني عشر، وانطلاقاً من توجيهات وزارة التربية والتعليم بتمكين الطلبة من المهارات العملية المكانية والتعامل مع برمجيات التحليل الجغرافي والاستشعار عن بعد ونظم المعلومات الجغرافية (GIS).',
        'نحيطكم علماً بأن المدرسة بحاجة ماسة إلى دعم مختبر الجغرافيا بعدد (15) جهاز حاسوب بمواصفات تقنية تدعم تشغيل برمجيات (ArcGIS Online & Google Earth Pro)، وتزويدنا بنسخ إضافية من "أطلس سلطنة عمان المدرسي" وخرائط طوبوغرافية وجيولوجية حديثة معتمدة من الهيئة الوطنية للمساحة.',
        'إن توفير هذه التجهيزات سيسهم بصورة جوهرية في رفع مستوى التحصيل الدراسي لدى الطلبة، وتمكينهم من إنجاز المشاريع والبحوث الميدانية الاستقصائية بكفاءة واقتدار.'
      ],
      actionRequired: 'التكرم بالتوجيه لدائرة تقنية المعلومات ودائرة الإشراف التربوي بالمديرية لتوفير الأجهزة والمصادر المطلوبة لمختبر الجغرافيا.',
      attachments: [
        'حصر الاحتياجات الفنية لمختبر الجغرافيا والتقنيات الحديثة',
        'كشف بأعداد طلبة الصفين الحادي عشر والثاني عشر المستفيدين من المختبر (180 طالباً)'
      ],
      closing: 'وتفضلوا بقبول فائق الاحترام والتقدير والامتنان،،،',
      supervisorApproval: true,
      principalApproval: true,
      status: 'approved',
      createdById: 'usr-teacher-1',
      createdAt: '2026-09-28T08:30:00Z',
      updatedAt: '2026-09-28T09:00:00Z'
    },

    // 2. خطاب إلى مديرية التربية والتعليم: إشعار وتنسيق رحلة استكشافية
    {
      id: 'let-dir-02',
      letterType: 'directorate',
      category: 'رحلة علمية واستكشافية',
      title: 'إشعار وتنسيق رحلة علمية استكشافية لطلبة الجغرافيا إلى كهف الهوتة والجبل الأخضر',
      referenceNumber: 'م/ت/ع/1448/112',
      dateHijri: '22 ربيع الأول 1448 هـ',
      dateMiladi: '5 أكتوبر 2026 م',
      schoolName: 'مدرسة كعب بن برشة للتعليم ما بعد الأساسي (11 - 12)',
      directorateName: 'المديرية العامة للتربية والتعليم بمحافظة مسقط',
      senderName: 'أ. مريم بنت عبدالله المعمرية',
      senderRole: 'معلم أول مادة الجغرافيا والدراسات الاجتماعية',
      recipientName: 'الفاضل / مدير دائرة الإشراف التربوي - المديرية العامة للتربية والتعليم',
      recipientTitle: 'المحترم / حفظه الله ورعاه',
      subject: 'إشعار بتنظيم رحلة علمية جغرافية استكشافية لطلبة الصف الثاني عشر إلى محافظة الداخلية',
      salutation: 'السلام عليكم ورحمة الله وبركاته،،، وبعد:',
      bodyParagraphs: [
        'نرفع إليكم أطيب التحيات والتقدير، راجين لكم دوام التوفيق والنجاح المستمر في دعم الأنشطة التعليمية الهادفة.',
        'يسر أسرة الدراسات الاجتماعية والجغرافيا بالمدرسة إشعاركم بعزمنا تنظيم رحلة تعليمية وميدانية استكشافية لطلبة الصف الثاني عشر (مادة هذا وطني والجغرافيا) إلى محافظة الداخلية، تشمل زيارة كهف الهوتة، وتكوينات جبال الحجر الغربي، ونظام فلج دارس بنزوى، والمدرجات الزراعية بالجبل الأخضر، وذلك يوم الخميس الموافق 29 أكتوبر 2026 م.',
        'تهدف هذه الزيارة إلى الربط العملي الميداني بين ما درسه الطلبة في وحدة "عمان المكان والحضارة" ونظام تصريف المياه الجوفية والأفلاج المسجلة باليونسكو، والتعرف المباشر على التكوينات الكارستية والصخور الأفيوليتية الفريدة في عمان.',
        'نؤكد لكم استيفاء جميع الموافقات الخطية من أولياء الأمور، والتنسيق الكامل مع إدارة الدفاع المدني والإسعاف، وتوفير حافلات مدرسية حديثة ومجهزة بإشراف (4) معلمين ومشرف صحي معتمد.'
      ],
      actionRequired: 'الموافقة واعتماد برنامج الرحلة الميدانية ومخاطبة الجهات المعنية للتسهيل والتنسيق.',
      attachments: [
        'برنامج الرحلة الزمني ومسار التحرك',
        'كشف بأسماء الطلبة المشاركين وأرقام التواصل مع أولياء الأمور',
        'كشف بأسماء المشرفين المرافقين والمسؤوليات الموكلة إليهم'
      ],
      closing: 'وتفضلوا بقبول وافر الشكر والتقدير والاحترام،،،',
      supervisorApproval: true,
      principalApproval: true,
      status: 'approved',
      createdById: 'usr-teacher-1',
      createdAt: '2026-10-05T10:00:00Z',
      updatedAt: '2026-10-05T10:00:00Z'
    },

    // 3. خطاب إلى إدارة المدرسة: طلب حجز قاعة الحاسوب لمعمل الجغرافيا
    {
      id: 'let-sch-01',
      letterType: 'school_admin',
      category: 'طلب استخدام مرافق مدرسية',
      title: 'طلب حجز وتخصيص قاعة الحاسوب ومصادر التعلم لتطبيقات الجغرافيا ونظم المعلومات (GIS)',
      referenceNumber: 'م/د/1448/043',
      dateHijri: '8 ربيع الأول 1448 هـ',
      dateMiladi: '21 سبتمبر 2026 م',
      schoolName: 'مدرسة كعب بن برشة للتعليم ما بعد الأساسي (11 - 12)',
      directorateName: 'المديرية العامة للتربية والتعليم بمحافظة مسقط',
      senderName: 'أ. مريم بنت عبدالله المعمرية',
      senderRole: 'معلم أول مادة الجغرافيا والدراسات الاجتماعية',
      recipientName: 'الفاضل / مدير مدرسة كعب بن برشة للتعليم ما بعد الأساسي',
      recipientTitle: 'المحترم / حفظه الله ورعاه',
      subject: 'طلب حجز قاعة الحاسوب رقم (2) لتنفيذ الحصص التطبيقية لمادة الجغرافيا والتقنيات الحديثة',
      salutation: 'السلام عليكم ورحمة الله وبركاته،،، وبعد:',
      bodyParagraphs: [
        'يسرني أن أتقدم لإدارتكم الموقرة بأسمى آيات الشكر والعرفان على جهودكم المتواصلة في تذليل الصعاب وتوفير البيئة التعليمية المحفزة للطلبة والمعلمين بالمدرسة.',
        'نظراً لبدء تطبيق الجانب العملي لمقرر الجغرافيا والتقنيات الحديثة للصف الحادي عشر، والذي يتطلب استخدام أجهزة الحاسوب والاتصال بالإنترنت لتحميل وتحليل المرئيات الفضائية ونمذجة الارتفاعات الرقمية.',
        'نرجو من إدارتكم الكريمة الموافقة على تخصيص قاعة الحاسوب رقم (2) يومي الأحد والثلاثاء من كل أسبوع خلال الحصتين (الخامسة والأولى) لصالح شعبتي (11/1) و (11/2) طوال الفصل الدراسي الأول.',
        'ونفيدكم بأننا سنلتزم بالمحافظة التامة على الأجهزة والملحقات، والتنسيق المستمر مع أخصائي مصادر التعلم وفني الحاسوب المدرسي.'
      ],
      actionRequired: 'التكرم باعتماد تخصيص القاعة وإدراجها ضمن الجدول العام لحجوزات المختبرات.',
      attachments: [
        'جدول الحصص الأسبوعية المقترحة لمختبر الحاسوب',
        'قائمة البرمجيات المجانية المفتوحة المطلوب تثبيتها على الأجهزة (QGIS & Google Earth)'
      ],
      closing: 'وتفضلوا بقبول خالص الشكر والتقدير والاحترام،،،',
      principalApproval: true,
      status: 'approved',
      createdById: 'usr-teacher-1',
      createdAt: '2026-09-21T07:45:00Z',
      updatedAt: '2026-09-21T08:00:00Z'
    },

    // 4. خطاب إلى إدارة المدرسة: تقرير تحصيلي وتوصيات
    {
      id: 'let-sch-02',
      letterType: 'school_admin',
      category: 'تقرير تحصيلي وتوصيات أكاديمية',
      title: 'تقرير نتائج الاختبار القصير الأول لمادة الدراسات الاجتماعية والتوصيات العلاجية والإثرائية',
      referenceNumber: 'م/د/1448/059',
      dateHijri: '28 ربيع الأول 1448 هـ',
      dateMiladi: '11 أكتوبر 2026 م',
      schoolName: 'مدرسة كعب بن برشة للتعليم ما بعد الأساسي (11 - 12)',
      directorateName: 'المديرية العامة للتربية والتعليم بمحافظة مسقط',
      senderName: 'أ. مريم بنت عبدالله المعمرية',
      senderRole: 'معلم أول مادة الجغرافيا والدراسات الاجتماعية',
      recipientName: 'الفاضل / مدير المدرسة ورئيس مجلس إدارة المدرسة',
      recipientTitle: 'المحترم / حفظه الله ورعاه',
      subject: 'تقرير الأداء التحصيلي للاختبار القصير الأول وخطة الدعم والرعاية الأكاديمية',
      salutation: 'السلام عليكم ورحمة الله وبركاته،،، وبعد:',
      bodyParagraphs: [
        'يطيب لنا أن نضع بين أيديكم الموقرة تقرير نتائج الاختبار القصير الأول في مادة هذا وطني ومادة الجغرافيا والتقنيات الحديثة للفصل الدراسي الأول 2026/2027 م.',
        'أظهرت النتائج العامة تحقيق نسبة نجاح بلغت (94.2%)، مع تميز ملحوظ في الأسئلة المرتبطة بالمفاهيم التضاريسية والجيوسياسية لسلطنة عمان، حيث حصل (42%) من الطلبة على الدرجة النهائية (10/10).',
        'ومع ذلك، لوحظ وجود تفاوت في مهارة قراءة مقاييس الرسم والتحليل الإحصائي لبعض طلبة الصف الحادي عشر، وعليه قامت أسرة المادة بوضع خطة علاجية فورية تتضمن: حصص مساندة صباحية مرتين أسبوعياً، وأوراق عمل تدريبية ذات مستويات متدرجة، وتكليف الطلبة المتميزين ببرنامج "المعلم الصغير" لمساندة زملائهم.'
      ],
      actionRequired: 'الاطلاع واعتماد خطة الرعاية الأكاديمية وإشعار الأخصائي الاجتماعي لمتابعة الحالات التي تتطلب توجيهياً سلوكياً أو أسرياً.',
      attachments: [
        'جدول الإحصاء البياني لنتائج الاختبار حسب الشعب',
        'قائمة بأسماء الطلبة الأوائل والمتميزين لتكريمهم في طابور الصباح',
        'جدول حصص التقوية والرعاية المساندة'
      ],
      closing: 'شاكرين لكم عظيم عنايتكم ودعمكم المستمر، وتفضلوا بقبول وافر الاحترام،،،',
      principalApproval: true,
      status: 'approved',
      createdById: 'usr-teacher-1',
      createdAt: '2026-10-11T09:15:00Z',
      updatedAt: '2026-10-11T09:30:00Z'
    },

    // 5. خطاب إلى ولي أمر الطالب: شهادة شكر وتفوق
    {
      id: 'let-par-01',
      letterType: 'parent',
      category: 'شكر وتقدير وتفوق دراسي',
      title: 'خطاب شكر وتقدير لتفوق الطالب وتميزه الأكاديمي في مادة هذا وطني والجغرافيا',
      referenceNumber: 'م/و/1448/104',
      dateHijri: '2 ربيع الآخر 1448 هـ',
      dateMiladi: '14 أكتوبر 2026 م',
      schoolName: 'مدرسة كعب بن برشة للتعليم ما بعد الأساسي (11 - 12)',
      directorateName: 'المديرية العامة للتربية والتعليم بمحافظة مسقط',
      senderName: 'أ. مريم بنت عبدالله المعمرية',
      senderRole: 'معلم أول مادة الجغرافيا والدراسات الاجتماعية',
      recipientName: 'الفاضل / ولي أمر الطالب: محمد بن خالد بن سيف البوسعيدي',
      recipientTitle: 'المحترم / حفظه الله ورعاه',
      studentName: 'محمد بن خالد بن سيف البوسعيدي',
      gradeName: 'الصف الثاني عشر',
      sectionName: 'شعبة 12/1',
      subject: 'شكر وتقدير لتفوق نجلكم المتميز في مادة هذا وطني والمشاريع الجغرافية',
      salutation: 'السلام عليكم ورحمة الله وبركاته،،، وبعد:',
      bodyParagraphs: [
        'يسر إدارة مدرسة كعب بن برشة وهيئتها التدريسية أن تزف إليكم أسمى آيات التهاني والتبريكات، معربين عن فخرنا واعتزازنا بما حققه نجلكم الطالب النجيب / محمد بن خالد البوسعيدي من مستوى استثنائي وتميز خلقي وأكاديمي في مادة هذا وطني.',
        'لقد حقق نجلكم الدرجة الكاملة في الاختبارات التقويمية، وتميز بمشاركته الإيجابية ومبادرته المتميزة في تقديم بحث علمي رائع حول "المقومات الجيواقتصادية لميناء الدقم ومناطق الهيدروجين الأخضر بسلطنة عمان".',
        'إن هذا التميز والتفوق هو ثمرة مباركة لرعايتكم الكريمة ومتابعتكم المستمرة في البيت، ونحن إذ نشكركم جزيل الشكر على هذا التعاون المثمر، نرجو لنجلكم استمرار هذا التألق ليكون أحد بناة عمان الأوفياء والمساهمين في تحقيق رؤية عمان 2040.'
      ],
      actionRequired: 'نقل تحيات وتقدير إدارة المدرسة لنجلكم وتشجيعه لمواصلة الصدارة والتفوق.',
      closing: 'ودمتم في حفظ الله ورعايته، وتفضلوا بقبول فائق الاحترام والتقدير،،،',
      status: 'approved',
      createdById: 'usr-teacher-1',
      createdAt: '2026-10-14T11:00:00Z',
      updatedAt: '2026-10-14T11:00:00Z'
    },

    // 6. خطاب إلى ولي أمر الطالب: إشعار بمستوى التحصيل وطلب المتابعة
    {
      id: 'let-par-02',
      letterType: 'parent',
      category: 'إشعار بمستوى دراسي ومتابعة واجبات',
      title: 'إشعار بمستوى التحصيل الدراسي وطلب التعاون المشترك لمتابعة الواجبات والمشروع',
      referenceNumber: 'م/و/1448/119',
      dateHijri: '6 ربيع الآخر 1448 هـ',
      dateMiladi: '18 أكتوبر 2026 م',
      schoolName: 'مدرسة كعب بن برشة للتعليم ما بعد الأساسي (11 - 12)',
      directorateName: 'المديرية العامة للتربية والتعليم بمحافظة مسقط',
      senderName: 'أ. مريم بنت عبدالله المعمرية',
      senderRole: 'معلم أول مادة الجغرافيا والدراسات الاجتماعية',
      recipientName: 'الفاضل / ولي أمر الطالب: سعيد بن ناصر بن خلفان الحارثي',
      recipientTitle: 'المحترم / حفظه الله ورعاه',
      studentName: 'سعيد بن ناصر بن خلفان الحارثي',
      gradeName: 'الصف العاشر',
      sectionName: 'شعبة 10/3',
      subject: 'إشعار بمستوى التحصيل الدراسي في مادة الدراسات الاجتماعية وطلب التعاون لمساندته',
      salutation: 'السلام عليكم ورحمة الله وبركاته،،، وبعد:',
      bodyParagraphs: [
        'تهديكم إدارة المدرسة وهيئة التدريس أطيب التحيات والتقدير، ونؤكد لكم حرصنا البالغ والمستمر على مستقبل ابننا العزيز ونجاحه التعليمي.',
        'نود إحاطتكم علماً بأن نجلكم الطالب / سعيد بن ناصر الحارثي قد واجه بعض الصعوبات في اجتياز الاختبار القصير الأول لمادة الدراسات الاجتماعية، بالإضافة إلى عدم تسليم بعض الواجبات المنزلية والأنشطة الصفية المقررة في دفتر المادة.',
        'انطلاقاً من مبدأ الشراكة التربوية الوثيقة بين البيت والمدرسة، نأمل منكم حث نجلكم على تنظيم أوقات استذكاره اليومية، والالتزام بحضور حصص الدعم المدرسي التي تنظمها المدرسة كل يوم ثلاثاء في الفسحة المدرسية، مع متابعة الواجبات عبر البوابة التعليمية.',
        'كما يسعدنا جداً استقبالكم في المدرسة يوم الخميس القادم بين الساعة 10:30 صباحاً و 11:30 صباحاً لمناقشة الخطة المشتركة للارتقاء بمستواه التحصيلي.'
      ],
      actionRequired: 'التكرم بالتوقيع على إشعار الاستلام وإعادته مع الطالب، والتنسيق لزيارة المدرسة لمقابلة معلم المادة.',
      closing: 'شاكرين لكم حسن تعاونكم وحرصكم الأبوي، وتفضلوا بقبول وافر الاحترام،،،',
      status: 'approved',
      createdById: 'usr-teacher-1',
      createdAt: '2026-10-18T08:30:00Z',
      updatedAt: '2026-10-18T08:30:00Z'
    },

    // 7. خطاب إلى ولي أمر الطالب: استمارة موافقة على رحلة مدرسية
    {
      id: 'let-par-03',
      letterType: 'parent',
      category: 'موافقة وإقرار رحلة مدرسية',
      title: 'استمارة موافقة وإقرار ولي الأمر للمشاركة في الرحلة التعليمية الميدانية (كهف الهوتة والجبل الأخضر)',
      referenceNumber: 'م/و/1448/132',
      dateHijri: '8 ربيع الآخر 1448 هـ',
      dateMiladi: '20 أكتوبر 2026 م',
      schoolName: 'مدرسة كعب بن برشة للتعليم ما بعد الأساسي (11 - 12)',
      directorateName: 'المديرية العامة للتربية والتعليم بمحافظة مسقط',
      senderName: 'أ. مريم بنت عبدالله المعمرية',
      senderRole: 'معلم أول مادة الجغرافيا والدراسات الاجتماعية',
      recipientName: 'الفاضل / ولي أمر الطالب المحترم',
      recipientTitle: 'المحترم / حفظه الله ورعاه',
      studentName: '..........................................................',
      gradeName: 'الصف الثاني عشر',
      sectionName: 'الشعبة: ............',
      subject: 'طلب موافقة وإقرار ولي الأمر للمشاركة في الرحلة الميدانية التعليمية لمحافظة الداخلية',
      salutation: 'السلام عليكم ورحمة الله وبركاته،،، وبعد:',
      bodyParagraphs: [
        'تهديكم إدارة مدرسة كعب بن برشة خالص التحيات والتقدير لتعاونكم الدائم مع برامج المدرسة وأنشطتها التعليمية.',
        'تعتزم المدرسة تسيير رحلة تعليمية استكشافية لطلبة الصف الثاني عشر إلى محافظة الداخلية (كهف الهوتة، جبال الحجر، فلج دارس، الجبل الأخضر) يوم الخميس الموافق 29 أكتوبر 2026 م، بهدف الربط التطبيقي مع منهج "هذا وطني" لدراسة التضاريس والأفلاج ونظم البيئة الطبيعية.',
        'التحرك من فناء المدرسة في تمام الساعة 06:45 صباحاً بحافلات سياحية مجهزة ومكيفة وبرفقة معلمين ومشرف صحي، والعودة المتوقعة للمدرسة بمشيئة الله في تمام الساعة 04:30 مساءً.',
        'برجاء التكرم بتعبئة نموذج الإقرار أدناه وإعادته مع نجلكم في موعد أقصاه الأحد القادم الموافق 25 أكتوبر 2026 م.'
      ],
      actionRequired: 'إقرار ولي الأمر: (أوافق / لا أوافق) على مشاركة ابني في الرحلة الميدانية، وأقر بسلامته الصحية وقدرته على المشاركة.\nاسم ولي الأمر: ....................................... التوقيع: .................................... الهاتف: ....................................',
      closing: 'شاكرين ومقدرين حسن تعاونكم الدائم معنا، وتفضلوا بقبول فائق الاحترام والتقدير،،،',
      status: 'approved',
      createdById: 'usr-teacher-1',
      createdAt: '2026-10-20T09:00:00Z',
      updatedAt: '2026-10-20T09:00:00Z'
    }
  ];

  return {
    users,
    stages,
    grades,
    subjects,
    semesters,
    units,
    lessons,
    resources,
    pages,
    chunks,
    geographicResources,
    externalReferences,
    lessonsGenerated,
    worksheets,
    assessments,
    annualPlans,
    timetables,
    officialLetters
  };
}
