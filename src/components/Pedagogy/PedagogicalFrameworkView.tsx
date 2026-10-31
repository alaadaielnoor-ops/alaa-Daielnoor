import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Brain, Lightbulb, Compass, BookOpen, Layers, Target, CheckCircle2,
  Sparkles, Award, ArrowRight, Printer, Copy, Check, Users, MapPin,
  Share2, Eye, ShieldCheck, HelpCircle, FileText, Globe, Search
} from 'lucide-react';

export interface PedagogicalTheoryDetail {
  id: string;
  name: string;
  englishName: string;
  pioneers: string;
  coreConcept: string;
  geographyApplication: string;
  classroomHook: string;
  proceduresImplementation: string;
  assessmentTechnique: string;
  omanVisionLink: string;
  exampleTopic: string;
  keywords: string[];
}

export interface TeachingStrategyDetail {
  id: string;
  name: string;
  category: 'inquiry' | 'problem_solving' | 'active_learning' | 'spatial_gis' | 'visual_thinking';
  steps: string[];
  geographyExample: string;
  teacherRole: string;
  studentRole: string;
  advantages: string[];
}

export const OMAN_PEDAGOGICAL_THEORIES: PedagogicalTheoryDetail[] = [
  {
    id: 'constructivism',
    name: 'النظرية البنائية',
    englishName: 'Constructivism (Piaget, Bruner, Vygotsky)',
    pioneers: 'جان بياجيه، جيروم برونر، جون ديوي',
    coreConcept: 'المتعلم يبني معرفته بنفسه بنشاط من خلال التفاعل مع بيئته وخبراته السابقة؛ فالمعرفة ليست نقلاً آلياً للمعلومات بل هي عملية تشكيل مستمرة للبنى المعرفية عبر الاستكشاف وحل المشكلات.',
    geographyApplication: 'تطبيق الاستكشاف الجغرافي الميداني والرقمي؛ حيث يقوم الطالب بملاحظة التضاريس (مثل الأودية والكثبان الرملية والخلجان في سلطنة عمان)، واستنتاج أسباب تشكلها وتطورها من خلال الملاحظة والتجريب والربط بين السبب والنتيجة.',
    classroomHook: 'طرح صورة لظاهرة جغرافية مجهولة (مثل هوية نجم أو وادٍ جاف تحول لمجرى مائي هادر) وسؤال الطلاب: "ما الذي جعل هذا المكان يبدو هكذا؟ وكيف نفسر هذا التغير؟"',
    proceduresImplementation: 'يقوم المعلم بدور الميسر (Facilitator)؛ يقدم معطيات أولية (خرائط كنتورية، صور جوية) ويكلف الطلاب بمهام استكشافية ضمن دورة التعلم الخماسية (5Es: التهيئة، الاستكشاف، الشرح، التوسع، التقويم).',
    assessmentTechnique: 'التقويم البنائي القائم على الأداء؛ تحليل قدرة الطالب على تفسير الظواهر الجديدة وربط العلاقات المكانية بدلاً من مجرد سرد التعاريف.',
    omanVisionLink: 'تنمي استقلالية الفكر والبحث العلمي والاستكشاف، وهي ركيزة أساسية في محور التعليم والتعلّم والبحث العلمي لرؤية عمان 2040.',
    exampleTopic: 'درس: العوامل الخارجية المؤثرة في تشكيل سطح الأرض في سلطنة عمان (الصف الحادي عشر)',
    keywords: ['الاستكشاف', 'التعلم ذو المعنى', 'دورة التعلم', 'حل المشكلات', 'بناء المعرفة']
  },
  {
    id: 'socio_constructivism',
    name: 'النظرية السوسيو-بنائية (البنائية الاجتماعية)',
    englishName: 'Socio-Constructivism / Social Constructivism (Vygotsky, Bruner, Doise & Mugny)',
    pioneers: 'ليف فيجوتسكي، جيروم برونر، ويليم دويس وغابرييل موني (مدرسة جنيف للصراع المعرفي الاجتماعي)',
    coreConcept: 'المعرفة ليست نتاجاً فردياً منعزلاً، بل هي بناء اجتماعي تشاركي يتولد عبر التفاعل مع الأقران، والتفاوض حول المعنى، وحل الصراعات المعرفية الاجتماعية (Socio-Cognitive Conflict) في سياق مجتمعي وبيئي واقعي.',
    geographyApplication: 'إدارة المناظرات وحلقات النقاش الجغرافي التفاعلي حول قضايا التنمية والبيئة العمانية المعاصرة (المفاضلة المكانية للمشاريع، إدارة شح المياه وحوكمة الأفلاج، التوسع العمراني مقابل الأراضي الزراعية في الباطنة، تنمية ميناء الدقم والمحميات البحرية) وبناء حلول توافقية مستدامة عبر الصراع المعرفي الاجتماعي والتفاوض حول المعنى.',
    classroomHook: 'طرح سيناريو واقعي مثير للجدل التخطيطي في ولاية عمانية: "هل نخصص هذا الشريط الساحلي لمنتجع سياحي استثماري أم لمحمية طبيعية لأشجار القرم وصون الثروة السمكية؟" وتقسيم الصف لفرق عمل متفاوضة تمثل المجلس البلدي والمستثمرين وحماة البيئة.',
    proceduresImplementation: 'تنظيم محاكاة للمجالس البلدية ولعب الأدوار وتوجيه الصراع المعرفي الاجتماعي بين المجموعات لبلورة بدائل تخطيطية مبتكرة بالاستعانة بالخرائط والأطالس، مع تفعيل السقالات والتفاوض الجماعي للوصول إلى قرار مكاني متوازن.',
    assessmentTechnique: 'تقييم مهارات الحوار والتفاوض المكاني، وملاحظة الصراع المعرفي الإيجابي، وقدرة المجموعة على صياغة حل تركيبي يوفق بين صون البيئة ومستهدفات التنمية في رؤية عمان 2040.',
    omanVisionLink: 'ترسيخ قيم المواطنة التشاركية المسؤولة، وحل المشكلات المجتمعية بالتشاور والتوافق، وإكساب مهارات التفاوض والتفكير التكاملي في التخطيط المستدام للمدن والمحافظات.',
    exampleTopic: 'درس: المشكلات البيئية والتنمية المستدامة في سلطنة عمان / التخطيط الإقليمي والمحافظات (الصف الحادي عشر والثاني عشر)',
    keywords: ['الصراع المعرفي الاجتماعي', 'السوسيو-بنائية', 'البنائية الاجتماعية', 'التفاوض حول المعنى', 'مجتمعات الممارسة', 'المحاكاة المكانية', 'المجالس البلدية']
  },
  {
    id: 'multiple_intelligences',
    name: 'نظرية الذكاءات المتعددة',
    englishName: 'Multiple Intelligences (Howard Gardner)',
    pioneers: 'هوارد جاردنر',
    coreConcept: 'يمتلك كل طالب مزيجاً فريداً من ثمانية ذكاءات على الأقل؛ مما يتطلب تنويع استراتيجيات التدريس والوسائل وأساليب التقويم لتفريد التعليم وتلبية الفروق الفردية وتمكين كل متعلم من إبراز تميزه.',
    geographyApplication: 'تعد الجغرافيا الميدان الأرحب لتطبيق الذكاءات المتعددة: الذكاء البصري المكاني لقراءة الخرائط ونماذج الارتفاع الرقمية، والذكاء المنطقي الرياضي لحساب المقاييس والإحصاءات، والذكاء الطبيعي لدراسة المحميات والأفلاج والتربة، والذكاء اللغوي لكتابة التقارير الجغرافية، والحركي لبناء مجسمات التضاريس.',
    classroomHook: 'عرض خريطة رقمية ثلاثية الأبعاد مصحوبة بإحصاءات مناخية وصور حية لطبيعة محافظة ظفار في موسم الخريف؛ لمخاطبة الذكاءات المكانية والطبيعية والمنطقية معاً.',
    proceduresImplementation: 'تصميم أنشطة متمايزة في محطات تعليمية؛ محطة لتحليل البيانات الرقمية، ومحطة لكتابة وصف جغرافي أدبي، ومحطة لرسم خريطة صماء، ومحطة لتصنيف عينات من الصخور العمانية.',
    assessmentTechnique: 'حقائب الإنجاز المتنوعة (Portfolios) وتخيير الطالب بين تقديم تقرير كتابي، أو عرض خرائطي رقمي، أو مجسم جغرافي يوضح الفكرة.',
    omanVisionLink: 'تحقيق الشمولية والعدالة وتكافؤ الفرص التعليمية ورعاية المواهب المتنوعة لبناء رأس مال بشري عالي التنافسية وفق رؤية 2040.',
    exampleTopic: 'درس: المناخ والنبات الطبيعي في سلطنة عمان (الصف العاشر / التاسع)',
    keywords: ['الفروق الفردية', 'تفريد التعليم', 'الذكاء المكاني', 'الذكاء الطبيعي', 'الذكاء المنطقي']
  },
  {
    id: 'sociocultural_zpd',
    name: 'النظرية الاجتماعية - الثقافية ومنطقة التطوير القريبة',
    englishName: 'Socio-Cultural Theory & ZPD (Lev Vygotsky)',
    pioneers: 'ليف فيجوتسكي',
    coreConcept: 'يحدث التعلم الأمثل من خلال التفاعل الاجتماعي والمشاركة الثقافية واستخدام الأدوات الرمزية؛ حيث ينتقل المتعلم بمساعدة المعلم أو الأقران الأكثر خبرة من مستواه الحالي إلى مستواه الكامن (منطقة التطوير القريبة ZPD) عبر السقالات التعليمية (Scaffolding).',
    geographyApplication: 'توظيف التعلم التعاوني في قراءة أطلس سلطنة عمان وحل ألغاز الخرائط الصماء، وتدرج السقالات في قراءة خطوط الكنتور وحساب درجات الانحدار، مع ربط المفاهيم بالتراث الجغرافي العماني مثل هندسة الأفلاج وتاريخ الملاحة البحرية لأحمد بن ماجد.',
    classroomHook: 'طرح لغز جغرافي مكاني حول مسار تجاري بحري عماني قديم ومطالبة المجموعات الطلابية بالتعاون لفك شفرة المسار عبر السقالات الإرشادية.',
    proceduresImplementation: 'تنظيم الطلاب في مجموعات غير متجانسة وتوزيع أدوار التعلم التعاوني، وتقديم المعلم للمساعدة والدعم التدريجي (سحب السقالات تدريجياً مع تصاعد تمكن الطالب).',
    assessmentTechnique: 'تقويم الأداء التعاوني، وملاحظة تطور مهارة الطالب المستقلة بعد انتهاء مرحلة الدعم والإسناد في مجموعات العمل.',
    omanVisionLink: 'تعزيز قيم العمل الجماعي، والمواطنة الصالحة، ومهارات التواصل المجتمعي، والاعتزاز بالهوية الوطنية العمانية الأصيلة.',
    exampleTopic: 'درس: نظام الأفلاج العماني وإدارته المستدامة للمياه (الصف الثاني عشر - هذا وطني)',
    keywords: ['ZPD', 'السقالات التعليمية', 'التعلم التعاوني', 'الأقران', 'التفاعل الاجتماعي']
  },
  {
    id: 'cognitivism',
    name: 'النظرية المعرفية ونظرية معالجة المعلومات',
    englishName: 'Cognitive Learning & Information Processing (Ausubel, Gagne)',
    pioneers: 'ديفيد أوزوبل، روبرت جانييه، جورج ميلر',
    coreConcept: 'التركيز على العمليات العقلية الداخلية للمتعلم (الانتباه، الإدراك، الذاكرة العاملة والذاكرة طويلة المدى، والتشفير الدلالي). يتم التعلم ذو المعنى عندما ترتبط المفاهيم الجديدة بمفاهيم سابقة من خلال المنظمات التخطيطية المتقدمة (Advance Organizers).',
    geographyApplication: 'استخدام خرائط المفاهيم الهيكلية والمنظمات التخطيطية لتنظيم بنية المعرفة الجغرافية المجردة؛ مثل مفاهيم الدورة الهيدرولوجية، وأنظمة الضغط الجوي والرياح، وتصنيف الأقاليم المناخية والنباتية، مع تقليل العبء المعرفي الزائد (Cognitive Load).',
    classroomHook: 'تقديم منظم متقدم بصري يعرض شجرة العائلة للأنظمة الصخرية في عمان، وربط الصخور الرسوبية بوجود النفط والمياه الجوفية.',
    proceduresImplementation: 'تسلسل خطوات الدرس وفق خطوات جانييه التسع (جذب الانتباه، إعلان الأهداف، استدعاء المتطلبات السابقة، تقديم المثيرات المنظمة، توجيه التعلم، استخراج الأداء، تقديم التغذية الراجعة، تقييم الأداء، تعزيز الاستبقاء ونقل أثر التعلم).',
    assessmentTechnique: 'اختبارات المفاهيم، ومخططات فن (Venn Diagrams) للمقارنة بين الظواهر الجغرافية، وتحليل أسباب الظواهر ونواتجها.',
    omanVisionLink: 'بناء العقلية التحليلية المنظمة القادرة على تصنيف ومعالجة البيانات الضخمة في عصر اقتصاد المعرفة الرقمي.',
    exampleTopic: 'درس: الغلاف الجوي والطقس والمناخ (الصف العاشر / الحادي عشر)',
    keywords: ['معالجة المعلومات', 'المنظمات المتقدمة', 'الذاكرة العاملة', 'العبء المعرفي', 'أوزوبل']
  },
  {
    id: 'spatial_brain_learning',
    name: 'نظرية التعلم المستند إلى الدماغ والتفكير البصري المكاني',
    englishName: 'Brain-Based Learning & Spatial Thinking (Dual Coding & Spatial Cognition)',
    pioneers: 'آلان بايفيو (التشفير المزدوج)، إريك جنسن، هوارد إيرليش',
    coreConcept: 'يعمل الدماغ البشري بصورة تكاملية عبر نصفي الكرة المخية (النصف الأيسر اللغوي والمنطقي، والنصف الأيمن البصري والمكاني)؛ والتعلم الجغرافي يرتكز على التفكير المكاني (Spatial Thinking) والقدرة على قراءة العلاقات البينية بين الموقع والشكل والامتداد والحركة.',
    geographyApplication: 'توظيف تقنيات التشفير المزدوج بالجمع الدائم بين النص المكتوب والخريطة أو الصورة الجوية؛ واستخدام نظم المعلومات الجغرافية (GIS)، والمحاكاة ثلاثية الأبعاد (3D)، واستقراء التوزيع المكاني للأعاصير المدارية والملاحة البحرية.',
    classroomHook: 'عرض مرئية فضائية مباشرة لحركة الغيوم والمنخفضات الجوية فوق بحر العرب وسلطنة عمان باستخدام منصات الأقمار الاصطناعية الحية.',
    proceduresImplementation: 'تدريب الطلاب على تحويل النصوص الوصفية إلى خرائط ورسوم توضيحية، واستنتاج المسافات والاتجاهات، وتحليل تراكب الطبقات الجغرافية (Overlaying) في نظم المعلومات الجغرافية.',
    assessmentTechnique: 'مهام قراءة وتفسير الخرائط الكنتورية والصور الفضائية، ورسم المخططات البصرية والخرائط الذهنية الرقمية ثلاثية الأبعاد.',
    omanVisionLink: 'تعزيز مهارات التحول الرقمي وتوظيف تقنيات الثورة الصناعية الرابعة والذكاء الاصطناعي الجغرافي (Geo-AI) المنصوص عليها في رؤية عمان 2040.',
    exampleTopic: 'درس: نظم المعلومات الجغرافية والاستشعار عن بعد (الصف الحادي عشر - الجغرافيا والتقنيات الحديثة)',
    keywords: ['التفكير المكاني', 'التشفير المزدوج', 'التعلم المستند إلى الدماغ', 'GIS', 'النمذجة ثلاثية الأبعاد']
  }
];

export const OMAN_TEACHING_STRATEGIES: TeachingStrategyDetail[] = [
  {
    id: 'geographic_inquiry',
    name: 'الاستقصاء الجغرافي الخماسي (Geographic Inquiry)',
    category: 'inquiry',
    steps: [
      '1. طرح السؤال الجغرافي (Ask Geographic Questions): تحديد المشكلة المكانية وصياغة تساؤلات حول أين؟ ولماذا هناك؟ وما الآثار؟',
      '2. جمع البيانات الجغرافية (Acquire Geographic Data): البحث في الخرائط والأطالس والمسوح الإحصائية والمرئيات الفضائية المعتمدة.',
      '3. تنظيم المعطيات كارتوجرافياً (Organize Geographic Data): رسم خرائط وجداول ومخططات بيانية لتبويب المعلومات المكانية.',
      '4. تحليل الأنماط والعلاقات المكانية (Analyze Geographic Information): تفسير دلالات التوزيع الجغرافي والربط السببي بين الظواهر.',
      '5. اتخاذ القرار والفعل الميداني (Act on Geographic Knowledge): اقتراح حلول واقعية أو صياغة توصيات تخطيطية مستدامة.'
    ],
    geographyExample: 'استقصاء أسباب تملح المياه الجوفية وتراجع المساحات الزراعية في سهل الباطنة واقتراح تدابير لحماية التربة.',
    teacherRole: 'موجه وميسر، يطرح التساؤلات المحورية ويدرب الطلاب على التفكير الناقد واستنطاق الخرائط.',
    studentRole: 'باحث استقصائي نشط يجمع الأدلة الجغرافية ويحلل الخرائط ويقدم استنتاجات مبرهنة علمياً.',
    advantages: ['بناء التفكير العلمي الاستقصائي', 'ترسيخ المهارات الكارتوجرافية', 'الربط المباشر بقضايا البيئة العمانية']
  },
  {
    id: 'problem_based_learning',
    name: 'التعلم القائم على المشكلات والمشاريع (PBL)',
    category: 'problem_solving',
    steps: [
      '1. الشعور بالمشكلة وتحديد أبعادها الجغرافية والبيئية.',
      '2. جمع البيانات وحصر العوامل الطبيعية والبشرية المساهمة.',
      '3. صياغة الفرضيات والبدائل الممكنة لحل المشكلة.',
      '4. اختبار الحلول والمقارنة بينها وفق معايير الاستدامة والتكلفة.',
      '5. تقديم تقرير المشروع والمخرجات الميدانية أو التوصيات التخطيطية.'
    ],
    geographyExample: 'مشروع: "التكيف مع الأنواء المناخية الاستثنائية وتصريف مياه السيول في المدن الساحلية العمانية".',
    teacherRole: 'مرشد استشاري ومزود بالمراجع والبيانات الحكومية والدراسات البيئية.',
    studentRole: 'عضو في فريق عمل استشاري يحلل المشكلة ويصمم حلولاً مكانية مبتكرة.',
    advantages: ['تنمية مهارات التفكير العليا وحل المشكلات', 'العمل الجماعي', 'خدمة المجتمع المحلي العماني']
  },
  {
    id: 'concept_mind_mapping',
    name: 'خرائط المفاهيم والخرائط الذهنية والرقمية',
    category: 'visual_thinking',
    steps: [
      '1. تحديد المفهوم الرئيسي العام للدرس في رأس الخريطة.',
      '2. استخراج المفاهيم الفرعية وترتيبها هرمياً من العام إلى الخاص.',
      '3. كتابة كلمات الربط الدلالية بين المفاهيم (مثل: يتكون من، يؤدي إلى، ينقسم إلى).',
      '4. تفرع الأمثلة التطبيقية من البيئة العمانية في المستوى الأدنى.',
      '5. تلوين وإضافة أيقونات ورسوم دلالية لتعزيز التذكر البصري.'
    ],
    geographyExample: 'خريطة مفاهيم لتصنيف التضاريس العمانية: (سلاسل الجبال، السهول الساحلية والداخلية، الهضاب، الرمال والصحاري).',
    teacherRole: 'مدرب على قواعد بناء خرائط المفاهيم الصحيحة والتنظيم الهرمي للمعرفة.',
    studentRole: 'مصمم للمخطط المعرفي ينظم أفكاره ويربط المفاهيم الجديدة بمخزونه السابق.',
    advantages: ['معالجة سريعة للمفاهيم المجردة', 'تسهيل المراجعة وتثبيت المعلومات', 'إبراز العلاقات الهرمية الدقيقة']
  },
  {
    id: 'gis_interactive_maps',
    name: 'توظيف نظم المعلومات الجغرافية (GIS) والتقنيات الرقمية',
    category: 'spatial_gis',
    steps: [
      '1. اختيار المنطقة الجغرافية في سلطنة عمان وفتح المنصة الرقمية (Google Earth / ArcGIS / Windy).',
      '2. تفعيل وإلغاء الطبقات المكانية (Layers: الحدود، الارتفاعات، المياه، الطرق، السكان).',
      '3. استخدام أدوات القياس المكاني لحساب المسافات والمساحات ودرجات الارتفاع والانحدار.',
      '4. مقارنة الصور الفضائية التاريخية لرصد التوسع العمراني أو التغيرات الساحلية.',
      '5. استخلاص النتائج المكانية وصياغة تقرير تقني مدعم بالخرائط المنتجة.'
    ],
    geographyExample: 'رصد تدرج الارتفاعات من سواحل مسقط وصور صعوداً إلى قمة جبل شمس في الجبل الأخضر باستخدام نماذج الارتفاع الرقمي.',
    teacherRole: 'خبير تقني تربوي يوجه التعامل مع البرمجيات والمنصات الجغرافية الرقمية.',
    studentRole: 'محلل جغرافي رقمي يستخدم أدوات القرن الـ 21 لاستكشاف المكان واتخاذ القرار.',
    advantages: ['المواءمة مع التوجه الرقمي لرؤية 2040', 'الإثارة والدافعية العالية', 'إتقان مهارات سوق العمل والجيوماتكس']
  },
  {
    id: 'active_learning_cooperative',
    name: 'استراتيجيات التعلم النشط (فكر-زاوج-شارك، الرؤوس المرقمة، محطات التعلم)',
    category: 'active_learning',
    steps: [
      '1. فكر - زاوج - شارك (Think-Pair-Share): تفكير فردي لمدة دقيقة، نقاش ثنائي للوصول لحل مشترك، ثم مشاركة الصف ككل.',
      '2. الرؤوس المرقمة (Numbered Heads Together): إعطاء رقم لكل طالب في المجموعة، التباحث لحل مسألة الخريطة، واختيار رقم عشوائي للإجابة باسم الفريق.',
      '3. محطات التعلم (Learning Stations): دوران الطلاب بين 4 محطات (محطة الخرائط، محطة الأطلس، محطة المناخ، محطة التفكير البيئي).',
      '4. لعب الأدوار (Role Playing): محاكاة جلسة تخطيط للمجلس البلدي لاختيار أفضل موقع لإنشاء مشروع سياحي أو محمية طبيعية.'
    ],
    geographyExample: 'استخدام الرؤوس المرقمة في استخراج إحداثيات ومواقع الموانئ العمانية الرئيسية (الدقم، صحار، صلالة) من الأطلس المدرسي.',
    teacherRole: 'مدير للصف التفاعلي، يضبط الوقت ويحفز المشاركة المتكافئة بين جميع المتعلمين.',
    studentRole: 'متعلم متفاعل ومشارك بإيجابية، يعبر عن آرائه ويستمع لأقرانه ويتعلم بالتعاون.',
    advantages: ['كسر جمود التلقين التقليدي', 'رفع معدل الاستيعاب والمشاركة الصفية', 'تعزيز الثقة بالنفس والتواصل']
  }
];

export const PedagogicalFrameworkView: React.FC = () => {
  const { setActiveView } = useApp();

  const [activeTab, setActiveTab] = useState<'theories' | 'strategies' | 'builder' | 'vision'>('theories');
  const [selectedTheoryId, setSelectedTheoryId] = useState<string>('constructivism');
  const [copiedText, setCopiedText] = useState(false);

  // Lesson Builder state
  const [builderLessonTitle, setBuilderLessonTitle] = useState('التضاريس العمانية وأثرها في التوزيع السكاني');
  const [builderTheory, setBuilderTheory] = useState('constructivism');
  const [builderSelectedStrategies, setBuilderSelectedStrategies] = useState<string[]>([
    'الاستقصاء الجغرافي الخماسي (Geographic Inquiry)',
    'خرائط المفاهيم والخرائط الذهنية والرقمية'
  ]);
  const [builderClassroomPhase, setBuilderClassroomPhase] = useState<'intro' | 'development' | 'assessment'>('development');

  const selectedTheory = OMAN_PEDAGOGICAL_THEORIES.find(t => t.id === selectedTheoryId) || OMAN_PEDAGOGICAL_THEORIES[0];

  const handleCopyFramework = () => {
    const textToCopy = `[الإطار التربوي واستراتيجيات التدريس - مادة الجغرافيا]
النظرية التربوية المعتمدة: ${selectedTheory.name} (${selectedTheory.englishName})
المبرر التربوي: ${selectedTheory.coreConcept}
التطبيق الميداني في خطوات الدرس:
- في التمهيد: ${selectedTheory.classroomHook}
- في سير الأنشطة: ${selectedTheory.proceduresImplementation}
- في التقويم: ${selectedTheory.assessmentTechnique}
الارتباط برؤية عمان 2040: ${selectedTheory.omanVisionLink}
مثال تطبيقي من مناهج سلطنة عمان: ${selectedTheory.exampleTopic}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleApplyToLessonStudio = () => {
    // Navigate directly to lesson studio with inspiration
    setActiveView('lesson_studio');
  };

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------- */}
      {/* HEADER BANNER */}
      {/* ---------------------------------------------------- */}
      <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-950 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -left-12 -top-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 text-xs font-bold flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-teal-300" />
                <span>المنظومة التربوية المعتمدة • سلطنة عمان</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30 text-xs font-bold flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-300" />
                <span>متوافق مع مستهدفات رؤية عمان 2040</span>
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              المرجع التربوي واستراتيجيات التدريس الحديثة
            </h1>
            <p className="text-sm text-teal-100/90 leading-relaxed">
              الدليل الشامل للنظريات التربوية الكبرى (البنائية، السوسيو-بنائية، الذكاءات المتعددة، الاجتماعية-الثقافية ZPD، المعرفية، والتفكير المكاني) وتطبيقاتها الميدانية في تدريس الدراسات الاجتماعية والجغرافيا وفق وثائق وزارة التربية والتعليم العمانية.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              onClick={handleApplyToLessonStudio}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-lg flex items-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>إعداد درس وفق هذا الإطار</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الدليل A4</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 pt-4 border-t border-teal-700/60 flex items-center gap-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('theories')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'theories'
                ? 'bg-white text-teal-950 shadow-md font-black'
                : 'text-teal-200 hover:bg-white/10'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>النظريات التربوية المعتمدة (Theories)</span>
          </button>

          <button
            onClick={() => setActiveTab('strategies')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'strategies'
                ? 'bg-white text-teal-950 shadow-md font-black'
                : 'text-teal-200 hover:bg-white/10'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>طرق واستراتيجيات تدريس الجغرافيا (Strategies)</span>
          </button>

          <button
            onClick={() => setActiveTab('builder')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'builder'
                ? 'bg-white text-teal-950 shadow-md font-black'
                : 'text-teal-200 hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>منشئ صياغة الإطار التربوي للدرس (Interactive Generator)</span>
          </button>

          <button
            onClick={() => setActiveTab('vision')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'vision'
                ? 'bg-white text-teal-950 shadow-md font-black'
                : 'text-teal-200 hover:bg-white/10'
            }`}
          >
            <Target className="w-4 h-4 text-emerald-400" />
            <span>المواءمة مع رؤية عمان 2040 ودليل المعلم</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: EDUCATIONAL THEORIES */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'theories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Theory Selector List */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
              النظريات التربوية الكبرى المعتمدة:
            </h3>

            <div className="space-y-2">
              {OMAN_PEDAGOGICAL_THEORIES.map((theory) => {
                const isSelected = theory.id === selectedTheoryId;
                return (
                  <button
                    key={theory.id}
                    onClick={() => setSelectedTheoryId(theory.id)}
                    className={`w-full text-right p-4 rounded-2xl border transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600 shadow-md'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-teal-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm">{theory.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${isSelected ? 'bg-teal-700 text-teal-100' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                        {theory.pioneers.split('،')[0]}
                      </span>
                    </div>
                    <span className={`text-xs line-clamp-1 ${isSelected ? 'text-teal-100' : 'text-slate-500 dark:text-slate-400'}`}>
                      {theory.englishName}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                      {theory.keywords.slice(0, 3).map((kw, i) => (
                        <span
                          key={i}
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            isSelected
                              ? 'bg-teal-700/60 text-white'
                              : 'bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                          }`}
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Consultation Callout */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 space-y-2">
              <div className="font-black flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>كيف تختار النظرية المناسبة لدرسك؟</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                إذا كان الدرس يعتمد على استكشاف الظواهر والخرائط، اختر <strong>البنائية</strong>. وإذا كان يغطي تنوعاً واسعاً في الأنشطة، اختر <strong>الذكاءات المتعددة</strong>. وفي دروس الأطلس والعمل الجماعي اختر <strong>البنائية الاجتماعية (ZPD)</strong>.
              </p>
            </div>
          </div>

          {/* Theory Deep Dive Content */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
            {/* Header of Selected Theory */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-5 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                    <Brain className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                      {selectedTheory.name}
                    </h2>
                    <p className="text-xs font-mono text-slate-500">
                      {selectedTheory.englishName} • أبرز الرواد: {selectedTheory.pioneers}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCopyFramework}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition"
                title="نسخ صيغة الإطار التربوي للدرس"
              >
                {copiedText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedText ? 'تم النسخ' : 'نسخ الصياغة'}</span>
              </button>
            </div>

            {/* Core Pedagogical Concept */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-teal-600" />
                <span>المنطلقات والمفهوم التربوي الأساسي:</span>
              </h3>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {selectedTheory.coreConcept}
              </div>
            </div>

            {/* Geography & Oman Application */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-teal-600" />
                <span>التطبيق التخصصي في تدريس الجغرافيا والدراسات الاجتماعية في سلطنة عمان:</span>
              </h3>
              <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200 leading-relaxed font-medium">
                {selectedTheory.geographyApplication}
              </div>
            </div>

            {/* 3 Step Classroom Field Application */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>التطبيق الميداني في خطوات الحصة الصفية (كيف تترجم النظرية عملياً؟):</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* 1. Hook */}
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 space-y-2">
                  <div className="font-extrabold text-amber-900 dark:text-amber-200 flex items-center gap-1">
                    <span>1. التمهيد والإثارة (Hook)</span>
                  </div>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                    {selectedTheory.classroomHook}
                  </p>
                </div>

                {/* 2. Development & Procedures */}
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 space-y-2">
                  <div className="font-extrabold text-blue-900 dark:text-blue-200 flex items-center gap-1">
                    <span>2. سير الأنشطة (Procedures)</span>
                  </div>
                  <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
                    {selectedTheory.proceduresImplementation}
                  </p>
                </div>

                {/* 3. Assessment */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 space-y-2">
                  <div className="font-extrabold text-emerald-900 dark:text-emerald-200 flex items-center gap-1">
                    <span>3. التقويم البنائي (Assessment)</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                    {selectedTheory.assessmentTechnique}
                  </p>
                </div>
              </div>
            </div>

            {/* Curriculum Example & Vision 2040 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">مثال تطبيقي من مناهج سلطنة عمان:</span>
                <span className="font-extrabold text-slate-900 dark:text-white block">
                  {selectedTheory.exampleTopic}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 space-y-1.5 text-xs">
                <span className="text-[10px] font-bold text-teal-600 block uppercase">المواءمة مع مستهدفات رؤية عمان 2040:</span>
                <span className="font-extrabold text-teal-900 dark:text-teal-200 block">
                  {selectedTheory.omanVisionLink}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: TEACHING STRATEGIES */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'strategies' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {OMAN_TEACHING_STRATEGIES.map((strat) => (
              <div
                key={strat.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:border-teal-400 hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 border border-teal-200">
                      <Compass className="w-4 h-4" />
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                      {strat.name}
                    </h3>
                  </div>

                  {/* Steps */}
                  <div className="space-y-1.5 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 block">خطوات التنفيذ المنهجية:</span>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                      {strat.steps.map((st, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-teal-600 font-bold">•</span>
                          <span>{st}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Geography Application Example */}
                  <div className="p-3 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 text-xs">
                    <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 block mb-1">
                      مثال تطبيقي في جغرافية عمان:
                    </span>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                      {strat.geographyExample}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 space-y-1">
                  <div><strong className="text-slate-700 dark:text-slate-300">دور المعلم:</strong> {strat.teacherRole}</div>
                  <div><strong className="text-slate-700 dark:text-slate-300">دور المتعلم:</strong> {strat.studentRole}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: INTERACTIVE LESSON FRAMEWORK BUILDER */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'builder' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>منشئ صياغة "الإطار التربوي واستراتيجيات التدريس" المعتمد</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                اختر معطيات درسك لتوليد صياغة تربوية نموذجية ومبررة يمكنك إدراجها فوراً في خطة التحضير اليومية أو استوديو الدروس.
              </p>
            </div>

            <button
              onClick={handleApplyToLessonStudio}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs flex items-center gap-1.5 shadow transition"
            >
              <span>فتح استوديو إعداد الدروس</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input 1: Lesson Title */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                عنوان الدرس الجغرافي:
              </label>
              <input
                type="text"
                value={builderLessonTitle}
                onChange={(e) => setBuilderLessonTitle(e.target.value)}
                placeholder="مثال: الأفلاج العمانية وإدارتها المائية المستدامة"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>

            {/* Input 2: Select Theory */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                النظرية التربوية المعتمدة للدرس:
              </label>
              <select
                value={builderTheory}
                onChange={(e) => setBuilderTheory(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              >
                {OMAN_PEDAGOGICAL_THEORIES.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.englishName})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Strategy Multi-Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
              استراتيجيات التدريس المقترنة (اختر ما يناسب الدرس):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
              {OMAN_TEACHING_STRATEGIES.map((s) => {
                const isChecked = builderSelectedStrategies.includes(s.name);
                return (
                  <label
                    key={s.id}
                    className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center gap-2 ${
                      isChecked
                        ? 'bg-teal-50 dark:bg-teal-950 text-teal-900 dark:text-teal-200 border-teal-300 font-bold'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBuilderSelectedStrategies(prev => [...prev, s.name]);
                        } else {
                          setBuilderSelectedStrategies(prev => prev.filter(x => x !== s.name));
                        }
                      }}
                      className="accent-teal-600 rounded"
                    />
                    <span className="line-clamp-1">{s.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Generated Result Box */}
          <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-slate-800/80 dark:to-teal-950/50 border-2 border-teal-200 dark:border-teal-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>نموذج "الإطار التربوي واستراتيجيات التدريس" الجاهز للإدراج في التحضير:</span>
              </span>

              <button
                onClick={() => {
                  const bTheory = OMAN_PEDAGOGICAL_THEORIES.find(t => t.id === builderTheory) || OMAN_PEDAGOGICAL_THEORIES[0];
                  const fullText = `【الإطار التربوي واستراتيجيات التدريس - مادة الدراسات الاجتماعية والجغرافيا】
1. النظرية التربوية المعتمدة: ${bTheory.name} (${bTheory.englishName})
   - المبرر التربوي لاختيار النظرية: يتطلب درس "${builderLessonTitle}" تمكين المتعلم من بناء المعرفة الجغرافية ذاتياً والربط السببي بين الظواهر الطبيعية والتوزيع المكاني.
   - مبرر الاختيار: ${bTheory.coreConcept}
2. استراتيجيات التدريس المحددة:
   ${builderSelectedStrategies.map((s, idx) => `   ${idx + 1}. ${s}`).join('\n')}
3. التطبيق الميداني في خطوات الدرس:
   - في التمهيد: ${bTheory.classroomHook}
   - في سير الأنشطة: ${bTheory.proceduresImplementation}
   - في التقويم البنائي: ${bTheory.assessmentTechnique}
4. الارتباط بمحددات رؤية عمان 2040 ودليل المعلم المعتمد:
   - ${bTheory.omanVisionLink}
   - مهارات القرن الـ 21: التفكير الناقد المكاني، التحليل الكارتوجرافي، واستدامة الموارد العمانية.`;

                  navigator.clipboard.writeText(fullText);
                  setCopiedText(true);
                  setTimeout(() => setCopiedText(false), 2500);
                }}
                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? 'تم نسخ النموذج' : 'نسخ النموذج للتحضير'}</span>
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-teal-200 dark:border-teal-800 text-xs font-mono space-y-2 text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
              {`【الإطار التربوي واستراتيجيات التدريس - مادة الدراسات الاجتماعية والجغرافيا】
1. النظرية التربوية المعتمدة: ${(OMAN_PEDAGOGICAL_THEORIES.find(t => t.id === builderTheory) || OMAN_PEDAGOGICAL_THEORIES[0]).name}
   - المبرر التربوي لاختيار النظرية: تمكين الطالب في درس "${builderLessonTitle}" من بناء الفهم المكاني العميق وربط الظاهرة ببيئته العمانية.
   - المبرر العلمي: ${(OMAN_PEDAGOGICAL_THEORIES.find(t => t.id === builderTheory) || OMAN_PEDAGOGICAL_THEORIES[0]).coreConcept}
2. استراتيجيات التدريس المحددة:
   ${builderSelectedStrategies.map((s, idx) => `${idx + 1}. ${s}`).join('   |   ')}
3. التطبيق الميداني في خطوات الدرس:
   - التمهيد: ${(OMAN_PEDAGOGICAL_THEORIES.find(t => t.id === builderTheory) || OMAN_PEDAGOGICAL_THEORIES[0]).classroomHook}
   - سير الأنشطة: ${(OMAN_PEDAGOGICAL_THEORIES.find(t => t.id === builderTheory) || OMAN_PEDAGOGICAL_THEORIES[0]).proceduresImplementation}
   - التقويم البنائي: ${(OMAN_PEDAGOGICAL_THEORIES.find(t => t.id === builderTheory) || OMAN_PEDAGOGICAL_THEORIES[0]).assessmentTechnique}
4. المواءمة مع رؤية عمان 2040 ودليل المعلم:
   - ${(OMAN_PEDAGOGICAL_THEORIES.find(t => t.id === builderTheory) || OMAN_PEDAGOGICAL_THEORIES[0]).omanVisionLink}`}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 4: VISION 2040 & TEACHER GUIDE */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'vision' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600" />
              <span>المحددات التربوية لرؤية عمان 2040 ودليل المعلم المعتمد</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              كيف يربط المعلم خطط الدروس اليومية والأنشطة الصفية بالأولويات الوطنية والتربوية المعتمدة لوزارة التربية والتعليم؟
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-2 text-xs">
              <h4 className="font-black text-sm text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-teal-600" />
                <span>1. مهارات القرن الـ 21 والتفكير الناقد</span>
              </h4>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                الانتقال من الحفظ والاسترجاع إلى مستويات التفكير العليا (التحليل، التركيب، والتقويم) عبر دراسة العلاقات المكانية، وحل المشكلات البيئية، وتفسير البيانات الإحصائية للخرائط.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2 text-xs">
              <h4 className="font-black text-sm text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>2. الاستدامة البيئية وصون الموارد العمانية</span>
              </h4>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                ربط كل درس جغرافيا بأبعاد الاستدامة وحماية الثروة المائية (كالأفلاج والسدود)، والغطاء النباتي، وترشيد استهلاك الطاقة، وتعزيز الاقتصاد الدائري والأخضر.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2 text-xs">
              <h4 className="font-black text-sm text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-blue-600" />
                <span>3. التحول الرقمي والجيوماتكس (Geo-Tech)</span>
              </h4>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                تمكين الطالب من استخدام منصات الاستشعار عن بعد ونظم المعلومات الجغرافية (GIS)، والملاحة عبر الأقمار الاصطناعية، لتأهيله لوظائف المستقبل واقتصاد المعرفة.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2 text-xs">
              <h4 className="font-black text-sm text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>4. الاعتزاز بالهوية والمواطنة المسؤولة</span>
              </h4>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                غرس الفخر بالإرث الحضاري والملاحي العماني، وإبراز الدور الاستراتيجي لموقع السلطنة كحلقة وصل عالمية وبوابة لوجستية تربط الشرق والغرب.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
