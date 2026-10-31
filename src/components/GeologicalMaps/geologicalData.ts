import {
  RockDistributionItem,
  GeologicalPolygon,
  GeographicRegion,
  MineralDepositMarker,
  GeologicalMapTheme
} from './types.ts';

// 1. Curated Geological Map Themes in the Exhibition
export const GEOLOGICAL_MAP_THEMES: GeologicalMapTheme[] = [
  {
    id: 'comprehensive',
    titleAr: 'الخريطة الجيولوجية العامة الشاملة لسلطنة عُمان',
    titleEn: 'Comprehensive Geological Map of the Sultanate of Oman',
    subtitleAr: 'توزيع التكاوين الصخرية الكبرى (النارية، الرسوبية، المتحولة، والغطاء الرباعي)',
    scaleRatio: '1:1,000,000',
    legendTitle: 'دليل الوحدات الصخرية التكتونية والرسوبية',
    description: 'خريطة شاملة تمثل التوزيع الجغرافي للوحدات الليثولوجية الكبرى في سلطنة عمان وفق المسوحات الجيولوجية المعتمدة لوزارة الطاقة والمعادن، تبرز تراكب صخور أفيوليت سمائل فوق صخور كربونات الحجر الجيري ومجموعة حواسينا.'
  },
  {
    id: 'ophiolite_belt',
    titleAr: 'خريطة حزام أفيوليت سمائل والقشرة المحيطية القديمة',
    titleEn: 'Semail Ophiolite & Oceanic Lithosphere Belt',
    subtitleAr: 'أكبر شريحة قشرة محيطية وغطاء صخري فوق قاعدي مكشوف في كوكب الأرض',
    scaleRatio: '1:500,000',
    legendTitle: 'تتابع قطاع الأفيوليت (الوشاح العلوي -> القشرة المحيطية)',
    description: 'تركز على تتبع حزام الأفيوليت الممتد على طول 600 كم في جبال الحجر من دبا شمالاً إلى صور جنوباً، مع إبراز صخور البيريدوتيت والجابرو ومناجم النحاس والكروم التابعة لبحر التيثس القديم.',
    highlightedRockIds: ['ophiolite']
  },
  {
    id: 'economic_minerals',
    titleAr: 'خريطة الثروات المعدنية والمحاجر والصخور الصناعية',
    titleEn: 'Mineral Resources & Industrial Rocks Map',
    subtitleAr: 'توزيع مكامن النحاس، الكروم، الرخام العماني، الحجر الجيري، الجبس، ورمل السيليكا',
    scaleRatio: '1:750,000',
    legendTitle: 'دليل المكامن والخامات التعدينية',
    description: 'تربط بين الأنواع الصخرية ومواقع الاستغلال الاقتصادي، مثل مناجم النحاس في وادي الجزي، ومحاجر الرخام في عبري ونزوى، ومصانع الإسمنت المعتمدة على الحجر الجيري النقي، ومكامن الجبس في ظفار.'
  },
  {
    id: 'karst_limestone',
    titleAr: 'خريطة كربونات الحجر الجيري والظواهر الكارستية والكهوف',
    titleEn: 'Carbonate Platform, Karst Systems & Caves',
    subtitleAr: 'توزيع الحجر الجيري العملاق في جبال الحجر وظفار، وأشهر الكهوف والعيون المائية',
    scaleRatio: '1:500,000',
    legendTitle: 'تكوينات الحجر الجيري والظواهر الجيومورفولوجية',
    description: 'توضح ترسبات بحر التيثس من الحجر الجيري والدولوميت التي تشكل جبل شمس والجبل الأخضر وجبال مسندم وظفار، مع مواقع الكهوف العالمية الشهيرة (مجلس الجن، الهوتة، طيق).'
  },
  {
    id: 'stratigraphy',
    titleAr: 'خريطة العصور الجيولوجية وحقبات الترسيب',
    titleEn: 'Chronostratigraphic & Geological Eras Map',
    subtitleAr: 'التسلسل الزمني للطبقات من صخور ما قبل الكامبري حتى العصر الرباعي الحديث',
    scaleRatio: '1:1,000,000',
    legendTitle: 'الحقبات والعصور الجيولوجية (العمود الطباقي)',
    description: 'توزع الأراضي العمانية بحسب الحقبات الجيولوجية: صخور ما قبل الكامبري في مرباط، الحقبة القديمة والمتوسطة في الحجر، والحقبة الحديثة في نجد، والرباعية في الكثبان والسهول الساحلية.'
  }
];

// 2. Comprehensive Rock Distribution Dataset for Oman
export const ROCK_DISTRIBUTION_DATA: Record<string, RockDistributionItem> = {
  ophiolite: {
    id: 'ophiolite',
    nameAr: 'أفيوليت سمائل (صخور القشرة المحيطية والوشاح)',
    nameEn: 'Semail Ophiolite Complex',
    scientificName: 'Obducted Oceanic Lithosphere (Peridotite, Gabbro, Basalt)',
    category: 'igneous',
    color: '#047857', // Emerald green
    hatchPatternId: 'pattern-ophiolite',
    areaKm2: 12500,
    percentageInOman: 4.1,
    agePeriod: 'العصر الطباشيري المتأخر (قبل 95 - 70 مليون سنة)',
    geologicalEpoch: 'mesozoic',
    tectonicOrigin: 'انزلاق تكتوني (Obduction) لشريحة من قاع بحر التيثس القديم فوق الحافة القارية لشبه الجزيرة العربية نتيجة تصادم الصفائح.',
    mainFormations: ['تكوين سمائل الأفيوليتي', 'وحدة البيريدوتيت والهارزبورجايت', 'وحدة الجابرو الطباقي', 'قواطع ديابيز الصفائحية', 'وسائد البازلت المحيطي'],
    mainGovernorates: ['الداخلية (سمائل، بدبد، نزوى)', 'شمال الباطنة (صحار، صحم، الخابورة)', 'جنوب الباطنة (الرستاق، نخل)', 'الظاهرة (ينقل، عبري)', 'شمال وجنوب الشرقية'],
    famousSites: ['وادي سمائل', 'وادي الجزي ومناجم الأسيل', 'عقبة الجزي', 'وادي فج الملح', 'وادي بني خروص (حد التماس)'],
    mineralComposition: [
      { nameAr: 'أوليفين (Olivine)', nameEn: 'Olivine', percent: 45, color: '#65a30d' },
      { nameAr: 'بيروكسين (Pyroxene)', nameEn: 'Pyroxene', percent: 30, color: '#15803d' },
      { nameAr: 'سربنتين (Serpentine)', nameEn: 'Serpentine', percent: 15, color: '#059669' },
      { nameAr: 'كروميت وماجنتيت', nameEn: 'Chromite/Magnetite', percent: 10, color: '#334155' }
    ],
    densityGcm3: '3.1 - 3.4 جم/سم³ (عالية جداً)',
    mohsHardness: '6.0 - 7.0',
    economicUses: [
      'استخراج خامات النحاس التاريخية والحديثة (مجان القديمة)',
      'استخراج خام الكروميت عالي الجودة',
      'احتجاز وتخزين ثاني أكسيد الكربون طبيعياً عبر صخور البيريدوتيت (Carbon Mineralization)'
    ],
    primaryMineralsFound: ['النحاس', 'الكروميت', 'الذهب المصاحب', 'الأسبستوس الطبيعي', 'عروق الماغنسيت'],
    pedagogicalQuestions: [
      {
        question: 'علل: تعتبر صخور أفيوليت سمائل في سلطنة عمان من أشهر الظواهر الجيولوجية العالمية؟',
        answer: 'لأنها تمثل أكبر وأكمل قطاع لقشرة محيطية ووشاح علوي مكشوف على اليابسة في العالم بشكل سليم وغير مشوه، مما يسمح للعلماء بدراسة قاع المحيطات دون الحاجة للغوص السحيق.',
        gradeLevel: 'الصف العاشر / الثاني عشر',
        curriculumTopic: 'هذا وطني - البيئة الجيولوجية في عمان'
      },
      {
        question: 'ما العلاقة بين صخور الأفيوليت وشهرة عمان القديمة باسم (أرض مجان)؟',
        answer: 'مجان تعني أرض النحاس، حيث تتواجد خامات النحاس الغنية في صخور وسائد البازلت (Pillow Basalts) التابعة للأفيوليت في وادي الجزي، وصدرها العمانيون لحضارات بلاد الرافدين.',
        gradeLevel: 'الصف التاسع والعاشر',
        curriculumTopic: 'الدراسات الاجتماعية - تاريخ عمان القديم'
      }
    ],
    threeModelSpecimenId: 'ophiolite',
    fieldCharacteristics: 'صخور داكنة خضراء مائلة للسواد والبني المحروق، تظهر عليها عروق السربنتين الحريرية، شديدة الصلابة وتصدر رنيناً معدنياً عند الطرق.',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80'
  },

  limestone: {
    id: 'limestone',
    nameAr: 'الحجر الجيري والدولوميت (كربونات بحر التيثس)',
    nameEn: 'Hajar Supergroup Limestone & Dolomite',
    scientificName: 'Autochthonous Platform Carbonates (CaCO3 & CaMg(CO3)2)',
    category: 'sedimentary',
    color: '#0284c7', // Sky / Deep blue
    hatchPatternId: 'pattern-limestone',
    areaKm2: 118000,
    percentageInOman: 38.2,
    agePeriod: 'من الحقبة المتوسطة حتى الحقب الحديث (الترياسي حتى السينوزوي)',
    geologicalEpoch: 'mesozoic',
    tectonicOrigin: 'ترسبات كيميائية وحيوية في بحر التيثس الضحل الدافئ الغني بالكائنات المرجانية والأصداف على مدى أكثر من 150 مليون سنة.',
    mainFormations: ['مجموعة الحجر الكبرى', 'تكوين ناطح (Natih)', 'تكوين شعيبة (Shuaiba)', 'تكوين خريج والمحريش', 'تكوين دم (Dammam) في الجنوب'],
    mainGovernorates: ['الداخلية (الجبل الأخضر، جبل شمس)', 'مسندم (رؤوس الجبال بالكامل)', 'الظاهرة (جبل المصلة، ينقل)', 'مسقط (حلبان، العامرات)', 'ظفار (سلسلة جبال سمحان والقمر)'],
    famousSites: ['شرفة مسفاة العبريين وجبل شمس', 'شلالات وادي دربات (ترافرتين الحجر الجيري)', 'كهف الهوتة', 'كهف مجلس الجن (ثاني أكبر تجويف كهفي بالعالم)', 'مضيق مسندم'],
    mineralComposition: [
      { nameAr: 'كالسيت (Calcite CaCO3)', nameEn: 'Calcite', percent: 80, color: '#38bdf8' },
      { nameAr: 'دولوميت (Dolomite)', nameEn: 'Dolomite', percent: 14, color: '#0284c7' },
      { nameAr: 'طين وسيليكا ناعمة', nameEn: 'Clay & Silica', percent: 6, color: '#cbd5e1' }
    ],
    densityGcm3: '2.5 - 2.7 جم/سم³',
    mohsHardness: '3.0 - 4.0',
    economicUses: [
      'صناعة الإسمنت في مصانع الرسيل وصحار وصلالة',
      'حجر البناء والتشييد وإنتاج الجير الحي والمطفأ',
      'خزانات جوفية عملاقة للنفط والغاز والمياه الجوفية العذبة (أهم مكمن نفطي في عمان)'
    ],
    primaryMineralsFound: ['كربونات الكالسيوم النقية', 'الدولوميت الصناعي', 'أحافير الروديست والأمونيت المتحجرة'],
    pedagogicalQuestions: [
      {
        question: 'كيف تشكلت الكهوف الكارستية الضخمة في الحجر الجيري العماني مثل كهف الهوتة ومجلس الجن؟',
        answer: 'بفعل التجوية الكيميائية (الإذابة الكارستية) حيث يتفاعل ماء المطر المحمل بثاني أكسيد الكربون (حمض الكربونيك المخفف) مع كربونات الكالسيوم ويذيبها مشكلاً تجاويف وسواقط وصواعد.',
        gradeLevel: 'الصف الحادي عشر والثاني عشر',
        curriculumTopic: 'الجيولوجيا والعمليات الجيومورفولوجية'
      },
      {
        question: 'ما أهمية تكوين ناطح وشعيبه الجيري في الاقتصاد الوطني العماني؟',
        answer: 'يمثلان أهم المكامن الصخرية الخازنة للنفط والغاز الطبيعي في حقول فهود والخوير والقرن في السلطنة بفضل مساميتهما العالية ونفاذيتهما الترسيبية.',
        gradeLevel: 'الصف الثاني عشر',
        curriculumTopic: 'الجغرافيا الاقتصادية ومصادر الطاقة'
      }
    ],
    threeModelSpecimenId: 'limestone',
    fieldCharacteristics: 'صخور رسوبية طبقية ذات ألوان رمادية وبيضاء وبيج، تتضمن طبقاتها حفريات بحرية مرئية، وتحدث فوراناً شديداً عند ملامسة حمض الهيدروكلوريك المخفف.',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'
  },

  granite: {
    id: 'granite',
    nameAr: 'الجرانيت وصخور القاعدة المتبلورة (درع ما قبل الكامبري)',
    nameEn: 'Precambrian Crystalline Basement Granite',
    scientificName: 'Plutonic Igneous Granite & Gneiss (Qtz-Fsp-Biotite)',
    category: 'igneous',
    color: '#e11d48', // Crimson red
    hatchPatternId: 'pattern-granite',
    areaKm2: 3200,
    percentageInOman: 1.0,
    agePeriod: 'حقبة ما قبل الكامبري (أكثر من 750 - 820 مليون سنة)',
    geologicalEpoch: 'precambrian',
    tectonicOrigin: 'تبريد بطيء جداً للصهير الصخري الحمضي في أعماق القشرة القارية للدرع العربي النوبي قبل تجزؤ القارات القديمة.',
    mainFormations: ['مجموعة صخور مرباط المتبلورة', 'صخور جبل جاشم النارية', 'قاعدة قلهات القديمة', 'جرانيت جزر الحلانيات'],
    mainGovernorates: ['ظفار (مرباط وسدح وحاسك)', 'الوسطى (بر الحكمان وجبل جاشم)', 'جنوب الشرقية (قلهات، صور)'],
    famousSites: ['شواطئ مرباط الصخرية', 'عقبة حاسك', 'جزر الحلانيات (كوريا موريا)'],
    mineralComposition: [
      { nameAr: 'فلسبار بوتاسي (Orthoclase)', nameEn: 'K-Feldspar', percent: 42, color: '#f43f5e' },
      { nameAr: 'كوارتز (Quartz)', nameEn: 'Quartz', percent: 35, color: '#f8fafc' },
      { nameAr: 'بلاغيوكليز (Plagioclase)', nameEn: 'Plagioclase', percent: 13, color: '#e2e8f0' },
      { nameAr: 'بيوتيت وميكا سوداء', nameEn: 'Biotite', percent: 10, color: '#0f172a' }
    ],
    densityGcm3: '2.65 - 2.75 جم/سم³',
    mohsHardness: '6.5 - 7.0',
    economicUses: [
      'صخور زينة وتكسية معمارية فاخرة تدوم لمئات السنين',
      'حواجز كواسر الأمواج للموانئ البحرية (ميناء صلالة والصحاري)',
      'دراسات التاريخ الجيولوجي وتأريخ عمر القارات'
    ],
    primaryMineralsFound: ['بلورات الفلسبار الوردية', 'الكوارتز الشفاف', 'رقائق البيوتيت اللامعة'],
    pedagogicalQuestions: [
      {
        question: 'ما الدليل الجيولوجي الذي تقدمه صخور مرباط على قدم التاريخ الصخري لسلطنة عمان؟',
        answer: 'تحتوي على صخور جرانيت ونيس متبلورة تعود لما قبل الكامبري (أكثر من 800 مليون سنة)، وتعتبر أقدم صخرة مسجلة في عُمان تفصلها أسطح عدم توافق كبرى عن الطبقات الرسوبية اللاحقة.',
        gradeLevel: 'الصف الثاني عشر',
        curriculumTopic: 'الجيولوجيا التاريخية والعمود الطباقي'
      }
    ],
    threeModelSpecimenId: 'granite',
    fieldCharacteristics: 'نسيج بلوري خشن متداخل ومرئي بالعين المجردة، حبيباته تجمع بين الوردي الفاقع والأبيض والرمادي مع بقع ميكا سوداء براقة، عالي المقاومة للتجوية.',
    imageUrl: 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=800&q=80'
  },

  marble: {
    id: 'marble',
    nameAr: 'الرخام العماني (الصخور المتحولة فائقة الجودة)',
    nameEn: 'Omani Metamorphic Marble',
    scientificName: 'Recrystallized Metamorphic Carbonate (Calcite/Dolomite)',
    category: 'metamorphic',
    color: '#d97706', // Warm amber
    hatchPatternId: 'pattern-marble',
    areaKm2: 4800,
    percentageInOman: 1.5,
    agePeriod: 'تحول إقليمي وتماسي في الحقبة المتوسطة (قبل 90 مليون سنة)',
    geologicalEpoch: 'mesozoic',
    tectonicOrigin: 'تعرض الحجر الجيري النقي لضغط تكتوني شديد وحرارة متصاعدة ناجمة عن انغراس شريحة الأفيوليت الحارة أدت لإعادة تبلور الكالسيت إلى نسيج رخامي سكري متماسك.',
    mainFormations: ['تكوين رخام جما (Jamma)', 'رخام عبري وعملا', 'رخام نزوى وصحار'],
    mainGovernorates: ['الظاهرة (عبري - عاصمة الرخام العماني)', 'الداخلية (نزوى، إزكي)', 'جنوب الباطنة (الرستاق، جما)'],
    famousSites: ['محاجر عملا ووادي الجزي', 'محاجر الدريز والجبية في عبري', 'وادي حلفين'],
    mineralComposition: [
      { nameAr: 'كالسيت معاد تبلوره', nameEn: 'Recrystallized Calcite', percent: 92, color: '#fef08a' },
      { nameAr: 'أكاسيد حديد وعروق ناعمة', nameEn: 'Iron Oxides (Veins)', percent: 5, color: '#b45309' },
      { nameAr: 'سيليكات وسربنتين', nameEn: 'Silicates', percent: 3, color: '#047857' }
    ],
    densityGcm3: '2.7 - 2.85 جم/سم³',
    mohsHardness: '3.5 - 4.5',
    economicUses: [
      'تصدير الرخام العماني لأكثر من 50 دولة حول العالم كمنتج وطني استراتيجي (Omani Beige)',
      'الأرضيات والواجهات المعمارية للمساجد والقصور والمطارات (جامع السلطان قابوس الأكبر)',
      'أعمال النحت والزخرفة الدقيقة'
    ],
    primaryMineralsFound: ['بلورات الكالسيت السكرية', 'عروق الليمونيت والهيماتيت الملونة'],
    pedagogicalQuestions: [
      {
        question: 'ما العامل الجيولوجي الذي جعل الرخام العماني يتحول من الحجر الجيري؟',
        answer: 'الحرارة والضغط العاليان المصاحبان لاندساس وانزلاق صخور أفيوليت سمائل المحيطية فوق منصة الحجر الجيري مما تسبب في إعادة تبلور حبيبات الكالسيت إلى بلورات رخامية متماسكة.',
        gradeLevel: 'الصف العاشر والحادي عشر',
        curriculumTopic: 'الصخور المتحولة والموارد الاقتصادية'
      }
    ],
    threeModelSpecimenId: 'marble',
    fieldCharacteristics: 'صخر متبلور متماسك ذو بريق شمعي سكري، يتميز بعروقه الجمالية ذات اللون البيج والذهبي والرمادي، يقبل الصقل والتلميع الفائق.',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
  },

  sandstone: {
    id: 'sandstone',
    nameAr: 'الحجر الرملي وتكاوين الكثبان الصحراوية',
    nameEn: 'Sedimentary Sandstone & Aeolian Erg Dunes',
    scientificName: 'Clastic Quartz Sandstone & Aeolian Quartz Arenite',
    category: 'sedimentary',
    color: '#ca8a04', // Golden yellow
    hatchPatternId: 'pattern-sandstone',
    areaKm2: 89000,
    percentageInOman: 28.8,
    agePeriod: 'من الحقبة القديمة (تكوين الغبار) حتى الرباعي المعاصر (الكثبان)',
    geologicalEpoch: 'quaternary',
    tectonicOrigin: 'تفتت الصخور بفعل الرياح وتعرية الكوارتز، ثم إعادة ترسبها عبر أحواض نهرية قديمة أو بواسطة حركة الرياح الموسمية مشكلة عروقاً وكثباناً طولية عملاقة.',
    mainFormations: ['رمال الشرقية (وهيبة)', 'تكوين الغبار وجدة الحراسيس', 'عروق الربع الخالي', 'تكوين مرباط الرملي'],
    mainGovernorates: ['شمال وجنوب الشرقية (رمال الشرقية)', 'الوسطى (هيما، الجوبة)', 'ظفار (النجد ومقشن والمزيونة)'],
    famousSites: ['كثبان رمال الشرقية الشاهقة (تصل إلى 100م ارتفاعاً)', 'حوض أم السميم الملحي والرمال المتحركة', 'صحراء جدة الحراسيس (أشهر موقع عالمي للنيازك)'],
    mineralComposition: [
      { nameAr: 'كوارتز نقي (Quartz SiO2)', nameEn: 'Quartz', percent: 85, color: '#fef9c3' },
      { nameAr: 'فتات فلسبار ومعادن ثقيلة', nameEn: 'Feldspar & Heavy Minerals', percent: 10, color: '#ca8a04' },
      { nameAr: 'حبيبات كربونات الكالسيوم', nameEn: 'Carbonate Grains', percent: 5, color: '#e2e8f0' }
    ],
    densityGcm3: '2.2 - 2.4 جم/سم³',
    mohsHardness: '6.0 - 7.0 (لحبيبات الكوارتز)',
    economicUses: [
      'استخراج رمال السيليكا عالية النقاوة لصناعة الزجاج والخلايا الشمسية',
      'طبقات الحجر الرملي العميقة تمثل خزانات هيدروكربونية كبرى (حقل خزان للغاز المحكم)',
      'السياحة البيئية وسياحة المغامرات والتزلج على الرمال'
    ],
    primaryMineralsFound: ['حبيبات الكوارتز المستديرة والمصقولة بالرياح', 'أكسيد الحديد الرقيق الذي يعطي اللون الأحمر الذهبي'],
    pedagogicalQuestions: [
      {
        question: 'علل: اكتساب رمال الشرقية اللون الأحمر البرتقالي الجذاب؟',
        answer: 'بسبب تغليف حبيبات الكوارتز بغشاء مجهري رقيق من أكاسيد الحديد (الهيماتيت والليمونيت) ناتج عن التجوية الكيميائية الطويلة في البيئة الجافة.',
        gradeLevel: 'الصف التاسع والعاشر',
        curriculumTopic: 'التضاريس الصحراوية والرمال في عمان'
      }
    ],
    threeModelSpecimenId: 'sandstone',
    fieldCharacteristics: 'صخر فتاتي حبيبي ذو مسامية عالية وملمس خشن كورق السنفرة، تتدرج ألوانه بين الأصفر الخردلي، البرتقالي المحروق، والأحمر الصحراوي.',
    imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80'
  },

  hawasina: {
    id: 'hawasina',
    nameAr: 'مجموعة حواسينا (صخور قاع المحيط السحيق والشيرت)',
    nameEn: 'Hawasina Complex Deep Marine Sediments & Chert',
    scientificName: 'Pelagic Turbidites, Radiolarite Chert & Exotic Blocks',
    category: 'sedimentary',
    color: '#8b5cf6', // Violet
    hatchPatternId: 'pattern-hawasina',
    areaKm2: 18500,
    percentageInOman: 6.0,
    agePeriod: 'الترياسي حتى الطباشيري الأوسط (قبل 220 - 95 مليون سنة)',
    geologicalEpoch: 'mesozoic',
    tectonicOrigin: 'رواسب طميية وتيارية وتجمعات من هياكل أحافير الراديولاريا السيليكية التي استقرت في قاع الخنادق المحيطية العميقة لبحر التيثس قبل أن تجرفها الصفائح نحو القارة.',
    mainFormations: ['تكوين حمراء الدروع (Hamrat Duru)', 'تكوين عمر الراديولاري (Umar Group)', 'تكوين كتل حواسينا الجيرية الغريبة (Hawasina Exotics)'],
    mainGovernorates: ['الظاهرة (حمراء الدروع، ينقل)', 'الداخلية (بهلاء، الحمراء، أفي)', 'شمال الشرقية (المضيبي، إبراء)'],
    famousSites: ['جبل كاوت وجبل مسفاة', 'مرتفعات حمراء الدروع', 'تلال وادي حواسينا'],
    mineralComposition: [
      { nameAr: 'سيليكا خفية التبلور (Chert)', nameEn: 'Microcrystalline Silica', percent: 65, color: '#a78bfa' },
      { nameAr: 'أطيان بحرية سحيقة وراديولاريا', nameEn: 'Pelagic Clay & Radiolarites', percent: 25, color: '#6d28d9' },
      { nameAr: 'كربونات وبقايا كلسية', nameEn: 'Carbonates', percent: 10, color: '#ddd6fe' }
    ],
    densityGcm3: '2.55 - 2.65 جم/سم³',
    mohsHardness: '6.5 - 7.0',
    economicUses: [
      'أحجار الصوان والشيرت استخدمها الإنسان العماني القديم لصناعة رؤوس السهام والأدوات الحجرية الحادة',
      'مؤشرات استكشافية حاسمة لتحديد امتدادات الصدوع وأحزمة المعادن'
    ],
    primaryMineralsFound: ['الشيرت الأحمر والأسود والأخضر', 'الراديولاريا المتحجرة', 'كتل الحجر الجيري العائمة (Exotics)'],
    pedagogicalQuestions: [
      {
        question: 'ما هي كتل الحجر الجيري الغريبة (Hawasina Exotics) في جيولوجيا عمان؟',
        answer: 'هي كتل جيرية ضخمة تابعة للشعاب المرجانية التي كانت تعلو قمم البراكين الغارقة في بحر التيثس القديم، ثم انفصلت وانزلقت مع رواسب الحواسينا لتظهر اليوم كأبراج جبلية منعزلة بارزة.',
        gradeLevel: 'الصف الثاني عشر',
        curriculumTopic: 'التكتونيات وجبال الحجر'
      }
    ],
    fieldCharacteristics: 'طبقات رقيقة جداً متعرجة ومتطوية بألوان حمراء داكنة وبنفسجية وخضراء، شديدة التكسر بحواف حادة زجاجية ومقاومة للتآكل.',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'
  },

  alluvial: {
    id: 'alluvial',
    nameAr: 'السهول الغرينية والساحلية (الرواسب الرباعية)',
    nameEn: 'Quaternary Coastal Alluvial & Gravel Plains',
    scientificName: 'Fluvial Gravel Fans, Silt & Sabkha Deposits',
    category: 'quaternary',
    color: '#10b981', // Emerald light
    hatchPatternId: 'pattern-alluvial',
    areaKm2: 44000,
    percentageInOman: 14.2,
    agePeriod: 'العصر الرباعي الحديث (خلال الـ 2.5 مليون سنة الماضية)',
    geologicalEpoch: 'quaternary',
    tectonicOrigin: 'نتاج التعرية المائية السريعة لجبال الحجر وظفار ونقل الرواسب عبر الأودية العملاقة وترسيبها عند مصبات السهول الساحلية لتشكل مراوح طميية خصبة.',
    mainFormations: ['سهل الباطنة الزراعي', 'سهل صلالة الساحلي', 'رواسب سبخة أم السميم', 'سبخات بر الحكمان'],
    mainGovernorates: ['شمال وجنوب الباطنة', 'مسقط (السهول الساحلية السيب وقريات)', 'ظفار (سهل صلالة الساحلي)'],
    famousSites: ['بساتين النخيل في سهل الباطنة', 'مزارع النارجيل والموز في صلالة', 'سبخة بر الحكمان الشهيرة بتجمع الطيور'],
    mineralComposition: [
      { nameAr: 'طمي وغرين نهري خصب', nameEn: 'Silt & River Alluvium', percent: 50, color: '#34d399' },
      { nameAr: 'حصى وجلاميد أفيوليت وحجر جيري', nameEn: 'Ophiolite & Limestone Gravel', percent: 35, color: '#059669' },
      { nameAr: 'رمال وأملاح ساحلية (هاليت وجبس)', nameEn: 'Salts & Sand', percent: 15, color: '#a7f3d0' }
    ],
    densityGcm3: '1.8 - 2.2 جم/سم³',
    mohsHardness: 'مفكك - ضعيف التماسك',
    economicUses: [
      'الأراضي الزراعية الرئيسية لإنتاج الخضار والتمور والحمضيات في عمان',
      'خزانات المياه الجوفية الضحلة المغذية لآلاف الأفلاج والآبار',
      'مواد الردم وركام الخرسانة في المشاريع العمرانية'
    ],
    primaryMineralsFound: ['حبيبات الغرين الخصبة', 'حصى الأودية المتنوع', 'بلورات الجبس والملح في السبخات'],
    pedagogicalQuestions: [
      {
        question: 'ما العلاقة الجيولوجية بين ارتفاع جبال الحجر وخصوبة سهل الباطنة؟',
        answer: 'الأمطار الغزيرة على جبال الحجر تنحت صخور الأفيوليت والحجر الجيري وتحمل عناصر المغنيسيوم والكالسيوم والحديد الذائبة وتفرشها كطبقات غرينية غنية جداً بالمعادن في سهل الباطنة.',
        gradeLevel: 'الصف العاشر',
        curriculumTopic: 'هذا وطني - الموارد الطبيعية وسهل الباطنة'
      }
    ],
    fieldCharacteristics: 'سهول منبسطة مستوية تتخللها مجاري الأودية العريضة المكسوة بالحصى المستدير الأملس والرواسب الطينية الرطبة ذات اللون البني الفاتح.',
    imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'
  },

  evaporite: {
    id: 'evaporite',
    nameAr: 'القباب الملحية ومتبخرات الجبس (سلسلة أرا القديمة)',
    nameEn: 'Ara Group Salt Domes & Evaporites',
    scientificName: 'Precambrian-Cambrian Halite, Anhydrite & Gypsum Diapirs',
    category: 'sedimentary',
    color: '#ec4899', // Pink
    hatchPatternId: 'pattern-evaporite',
    areaKm2: 18000,
    percentageInOman: 5.8,
    agePeriod: 'أواخر العصر الإدياكاري إلى بداية الكامبري (قبل 545 مليون سنة)',
    geologicalEpoch: 'precambrian',
    tectonicOrigin: 'تبخر مياه البحار المقفلة في أحواض داخلية ضخمة، وحين تراكمت طبقات رسوبية أثقل فوق الملح طفا الملح لأعلى مكوناً قباباً وأعمدة اختراقية (Salt Diapirs).',
    mainFormations: ['مجموعة أرا (Ara Salt Group)', 'قباب قرن علم', 'قباب قرن نيهيدة', 'متبخرات ثمريت في الجنوب'],
    mainGovernorates: ['الوسطى (قرن علم، حوض حيمار)', 'الداخلية (فهود)', 'ظفار (مقالع الجبس في ثمريت)'],
    famousSites: ['قبة قرن علم التكتونية', 'مناجم الجبس في ثمريت (أكبر مصدر للجبس بالعالم)', 'منخفض أم السميم'],
    mineralComposition: [
      { nameAr: 'هاليت وملح صخري (NaCl)', nameEn: 'Halite', percent: 60, color: '#f472b6' },
      { nameAr: 'أنهيدريت وجبس (CaSO4·2H2O)', nameEn: 'Anhydrite & Gypsum', percent: 35, color: '#db2777' },
      { nameAr: 'كربونات سحيقة وسوائل هيدروكربونية', nameEn: 'Stringers', percent: 5, color: '#831843' }
    ],
    densityGcm3: '2.1 - 2.3 جم/سم³ (أقل كثافة من الصخور المجاورة)',
    mohsHardness: '2.0 - 2.5',
    economicUses: [
      'إنشاء أهم المصائد الهيدروكربونية للنفط والغاز في جنوب ووسط عمان',
      'تصدير خام الجبس العماني الرائد عالمياً لصناعة ألواح الجبس والإسمنت',
      'الصناعات الكيميائية وأملاح كلوريد الصوديوم'
    ],
    primaryMineralsFound: ['بلورات الهاليت الشفافة المكعبة', 'خام الجبس الأبيض الحليبي', 'كتل الدولوميت المحبوسة بالملح'],
    pedagogicalQuestions: [
      {
        question: 'كيف تسهم القباب الملحية التكتونية في سلطنة عمان في حبس وتراكم النفط؟',
        answer: 'نظراً لأن الملح الصخري غير منفذ ولديه قدرة على التدفق اللدن للأعلى، فإنه يشكل سداً طبيعياً يمنع هجرة النفط الصاعد للأعلى ويحبسه في صخور الخزان المحيطة بالقبة.',
        gradeLevel: 'الصف الثاني عشر',
        curriculumTopic: 'جيولوجيا النفط والمصائد التركيبية'
      }
    ],
    fieldCharacteristics: 'صخور بيضاء ووردية ناعمة قابلة للخدش بالظفر، تظهر في صورة مرتفعات قبابية مخروطية منعزلة محاطة بطبقات رسوبية أحدث عمراً.',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'
  }
};

// 3. Geographic Regions of Oman with Precise ViewBox & Zoom Data
export const GEOGRAPHIC_REGIONS: GeographicRegion[] = [
  {
    id: 'oman_all',
    nameAr: 'كامل سلطنة عُمان (نظرة استراتيجية شاملة)',
    nameEn: 'Sultanate of Oman (National Full Overview)',
    governorates: ['كافة المحافظات الـ 11 في السلطنة'],
    viewBox: { x: 0, y: 0, width: 1000, height: 1200 },
    zoomLevel: 1.0,
    center: { x: 500, y: 600 },
    description: 'استعراض بانورامي كامل لخريطة عمان الجيولوجية يبرز القوس الجبلي الشمالي (جبال الحجر)، والسهول الساحلية، والغطاء الصحراوي الرملي الأوسط، وجبال ظفار الجنوبية.',
    dominantRocks: ['الحجر الجيري', 'أفيوليت سمائل', 'الحجر الرملي والكثبان', 'السهول الرباعية'],
    geologicHighlights: [
      'حزام أفيوليت سمائل بطول 600 كم',
      'قوس جبال الحجر الغربي والشرقي',
      'بحر الرمال (الشرقية والربع الخالي)',
      'سلسلة جبال ظفار والسهل الساحلي'
    ],
    famousLandmarks: [
      { nameAr: 'جبل شمس (3,009 م)', coords: { x: 590, y: 350 }, elevationM: 3009, rockType: 'limestone', description: 'أعلى قمة في عمان، حجر جيري مكشوف يطل على الأخدود العظيم (جراند كانيون عمان).' },
      { nameAr: 'مضيق هرمز (مسندم)', coords: { x: 510, y: 60 }, rockType: 'limestone', description: 'ممر بحري عالمي تشكل عبر انغمار كتل الحجر الجيري التكتونية بالبحر.' },
      { nameAr: 'كهف مجلس الجن', coords: { x: 740, y: 410 }, rockType: 'limestone', description: 'أضخم تجويف كارستي في صخور كربونات الحجر الجيري.' },
      { nameAr: 'صخور مرباط البلورية', coords: { x: 380, y: 1060 }, rockType: 'granite', description: 'صخور نارية ومتحولة تمثل أقدم قاعدة في عمان تفوق 800 مليون عام.' }
    ],
    curriculumLinks: ['منهج هذا وطني (الصف 10، 11، 12)', 'الدراسات الاجتماعية - الصف الثامن والتاسع']
  },

  {
    id: 'musandam',
    nameAr: 'شبه جزيرة مسندم ومضيق هرمز',
    nameEn: 'Musandam Peninsula & Hormuz Strait',
    governorates: ['محافظة مسندم (خصب، بخاء، دبا، مدحاء)'],
    viewBox: { x: 440, y: 20, width: 220, height: 260 },
    zoomLevel: 3.5,
    center: { x: 540, y: 130 },
    description: 'منطقة استراتيجية وعرة تشتهر باسم "فيوردات العرب"، تتألف بالكامل تقريباً من كتل الحجر الجيري والدولوميت التابعة لمجموعة رؤوس الجبال التكتونية التي هبطت جزئياً وغمرتها مياه البحر.',
    dominantRocks: ['الحجر الجيري والدولوميت الترياسي والجوراسي', 'كتل أفيوليت حافة دبا'],
    geologicHighlights: [
      'ظاهرة السواحل الغارقة (Ria Coastline) والخلجان الشبيهة بالفيوردات',
      'الكسور والصدوع التكتونية المشرفة على مضيق هرمز',
      'انفصال جبال مسندم عن صخور الأفيوليت بخط تصادم تكتوني نشط'
    ],
    famousLandmarks: [
      { nameAr: 'خور نجد وخور الشم', coords: { x: 535, y: 110 }, rockType: 'limestone', description: 'أخوار بحرية غارقة محاطة بجدران حجر جيري عمودية شاهقة.' },
      { nameAr: 'جبل حارم (2,087 م)', coords: { x: 545, y: 145 }, elevationM: 2087, rockType: 'limestone', description: 'أعلى قمة في مسندم، غنية بالأحافير والأسماك المتحجرة في الصخور الجيرية.' },
      { nameAr: 'مضيق هرمز الدولي', coords: { x: 520, y: 55 }, rockType: 'limestone', description: 'البوابة الاستراتيجية لناقلات النفط العالمية.' }
    ],
    curriculumLinks: ['هذا وطني: مسندم البوابة الشمالية وعمقها الجغرافي والسياسي']
  },

  {
    id: 'western_hajar',
    nameAr: 'جبال الحجر الغربي والجبل الأخضر وجبل شمس',
    nameEn: 'Western Hajar Mountains, Jabal Akhdar & Jabal Shams',
    governorates: ['الداخلية (نزوى، الحمراء، بهلاء)', 'الظاهرة (عبري، ينقل)', 'جنوب الباطنة (الرستاق، العوابي)'],
    viewBox: { x: 480, y: 250, width: 260, height: 260 },
    zoomLevel: 3.0,
    center: { x: 610, y: 380 },
    description: 'القلب الجيولوجي لعمان؛ نافذة تكتونية مكشوفة يظهر فيها تراكب صخور أفيوليت سمائل الداكنة المغطية لطبقات الحجر الجيري العملاقة في قبتي الجبل الأخضر وجبل شمس.',
    dominantRocks: ['الحجر الجيري العملاق', 'أفيوليت سمائل (البيريدوتيت والجابرو)', 'الرخام العماني', 'مجموعة حواسينا'],
    geologicHighlights: [
      'قبة الجبل الأخضر التكتونية المعكوسة (Culmination Window)',
      'الأخدود العظيم بوادي النخر وجبل شمس بعمق يفوق 1,000 متر',
      'كهف الهوتة الكارستي تحت سفوح الجبل الأخضر',
      'صدع سمائل التكتوني الذي يفصل الحجر الغربي عن الشرقي'
    ],
    famousLandmarks: [
      { nameAr: 'قمة جبل شمس (3,009 م)', coords: { x: 585, y: 345 }, elevationM: 3009, rockType: 'limestone', description: 'سقف عمان الطبيعي وأبرد نقطة صيفاً وشتاءً.' },
      { nameAr: 'مدرجات الجبل الأخضر (2,000 م)', coords: { x: 630, y: 360 }, elevationM: 2000, rockType: 'limestone', description: 'صخور جيرية تحتضن بساتين الرمان والورد الجبلي بنظام الأفلاج.' },
      { nameAr: 'كهف الهوتة', coords: { x: 595, y: 375 }, rockType: 'limestone', description: 'كهف كارستي طبيعي يضم بحيرة جوفية وأسماك عمياء نادرة.' },
      { nameAr: 'محاجر رخام عبري وعملا', coords: { x: 520, y: 365 }, rockType: 'marble', description: 'أكبر مركز لاستخراج وتصنيع الرخام والجرانيت في السلطنة.' }
    ],
    curriculumLinks: ['الجيولوجيا: النوافذ التكتونية والأفيوليت', 'هذا وطني: جبل شمس والجبل الأخضر كمعالم وطنية وسياحية']
  },

  {
    id: 'batinah_coast',
    nameAr: 'سهل الباطنة وحزام وادي الجزي وصحار',
    nameEn: 'Al-Batinah Plain, Wadi Jizzi Copper Belt & Sohar',
    governorates: ['شمال الباطنة (صحار، شناص، لوى، صحم)', 'جنوب الباطنة (بركاء، المصنعة، السويق)'],
    viewBox: { x: 500, y: 150, width: 250, height: 230 },
    zoomLevel: 2.8,
    center: { x: 620, y: 260 },
    description: 'شريط ساحلي منبسط يمتد بطول 300 كم بين جبال الحجر وبحر عُمان، يمثل السهل الزراعي والسكاني الأكبر، وتحده جبال الأفيوليت الحاوية على مناجم النحاس التاريخية في وادي الجزي.',
    dominantRocks: ['الرواسب الغرينية الرباعية والطمي', 'أفيوليت سمائل (وسائد البازلت والديابيز)', 'السبخات الساحلية'],
    geologicHighlights: [
      'المراوح الفيضية للأودية المنحدرة من جبال الحجر نحو بحر عمان',
      'حزام النحاس الأفيوليتي في وادي الجزي والأسيل ومجان القديمة',
      'خزانات المياه الجوفية العذبة التي واجهت ظاهرة تداخل مياه البحر'
    ],
    famousLandmarks: [
      { nameAr: 'مناجم نحاس مجان (وادي الجزي)', coords: { x: 550, y: 220 }, rockType: 'ophiolite', description: 'مهد تعدين وصهر النحاس العماني التاريخي منذ الألف الثالث قبل الميلاد.' },
      { nameAr: 'مدينة صحار التاريخية والميناء', coords: { x: 575, y: 205 }, rockType: 'alluvial', description: 'بوابة التجارة البحرية والمركز الصناعي الحديث.' },
      { nameAr: 'سهل بركاء والمصنعة الزراعي', coords: { x: 660, y: 310 }, rockType: 'alluvial', description: 'مزارع النخيل والإنتاج الزراعي في الرواسب الطينية الخصبة.' }
    ],
    curriculumLinks: ['الدراسات الاجتماعية: أرض مجان وتجارة النحاس', 'الجغرافيا: إدارة المياه في سهل الباطنة']
  },

  {
    id: 'eastern_hajar',
    nameAr: 'الحجر الشرقي ووادي بني خالد ورأس الحد',
    nameEn: 'Eastern Hajar Mountains, Wadi Bani Khalid & Ras Al-Hadd',
    governorates: ['شمال الشرقية (إبراء، المضيبي، بدية)', 'جنوب الشرقية (صور، جعلان، مصيرة)'],
    viewBox: { x: 660, y: 340, width: 260, height: 280 },
    zoomLevel: 2.8,
    center: { x: 790, y: 460 },
    description: 'القسم الشرقي من جبال الحجر يفصله صدع سمائل، ينتهي عند رأس الحد في أقصى شرق الوطن العربي، ويضم كهف مجلس الجن وأودية المياه الدائمة وكثبان رمال الشرقية.',
    dominantRocks: ['الحجر الجيري', 'أفيوليت سمائل وقواطع الجابرو', 'رمال الكثبان في الشرقية', 'كتل صخور الشيرت'],
    geologicHighlights: [
      'كهف مجلس الجن: ثاني أضخم تجويف كارستي في العالم',
      'وادي بني خالد: واحة مائية جارية في تجاويف الحجر الجيري النقي',
      'رأس الحد: أول بقعة تشرق عليها الشمس في الوطن العربي',
      'جزيرة مصيرة: صخور أفيوليت بحرية وشواطئ تعشيش السلاحف'
    ],
    famousLandmarks: [
      { nameAr: 'كهف مجلس الجن (فجوة سلمى)', coords: { x: 745, y: 405 }, elevationM: 1300, rockType: 'limestone', description: 'تجويف طبيعي مساحته 58 ألف م²، يتسع لعشرات الطائرات.' },
      { nameAr: 'واحة وبرك وادي بني خالد', coords: { x: 755, y: 460 }, rockType: 'limestone', description: 'أحواض مائية عذبة جارية طوال العام بين جدران الحجر الجيري.' },
      { nameAr: 'محمية رأس الحد ورأس الجنز', coords: { x: 860, y: 465 }, rockType: 'limestone', description: 'محمية السلاحف الخضراء وشواطئ الأجراف البحرية الرسوبية.' },
      { nameAr: 'رمال الشرقية (بدية)', coords: { x: 730, y: 520 }, rockType: 'sandstone', description: 'كثبان رملية متموجة بارتفاع 100م تمتد جنوباً حتى بحر العرب.' }
    ],
    curriculumLinks: ['هذا وطني: رأس الحد والموقع الفلكي لعمان', 'الجيولوجيا: الكهوف والأنظمة الكارستية']
  },

  {
    id: 'wusta_desert',
    nameAr: 'محافظة الوسطى وحوض جدة الحراسيس والقباب الملحية',
    nameEn: 'Al-Wusta Plateau, Jiddat Al-Harasis & Salt Basins',
    governorates: ['محافظة الوسطى (هيما، الدقم، محوت، الجازر)'],
    viewBox: { x: 400, y: 550, width: 400, height: 350 },
    zoomLevel: 2.0,
    center: { x: 600, y: 720 },
    description: 'هضبة رسوبية منبسطة شاسعة تحتوي على صخور الحجر الجيري والطباشير ومكامن القباب الملحية التكتونية (سلسلة أرا) المسببة لاحتجاز أكبر حقول النفط في عمان.',
    dominantRocks: ['الحجر الجيري والمارل', 'القباب الملحية والمتبخرات', 'الحجر الرملي الحصوي', 'سبخات الملح في أم السميم'],
    geologicHighlights: [
      'جدة الحراسيس: أكبر موقع عالمي لاكتشاف وتوثيق النيازك القمرية والمريخية',
      'منطقة الدقم الاقتصادية: أجراف الحجر الجيري وحديقة الصخور الطبيعية',
      'حقل قرن علم التكتوني: قبة ملحية ساهمت في مصائد النفط العميقة',
      'سبخة أم السميم: أكبر سبخة ملحية رمال متحركة في الجزيرة العربية'
    ],
    famousLandmarks: [
      { nameAr: 'حديقة الصخور في الدقم', coords: { x: 720, y: 760 }, rockType: 'limestone', description: 'منحوتات طبيعية مبهرة شكلتها الرياح والتجوية في الحجر الجيري.' },
      { nameAr: 'قبة قرن علم الملحية', coords: { x: 570, y: 610 }, rockType: 'evaporite', description: 'قبة صخور متبخرة ترتفع فوقها خزانات النفط الثقيل.' },
      { nameAr: 'سهل جدة الحراسيس للنيازك', coords: { x: 560, y: 730 }, rockType: 'limestone', description: 'منطقة استثنائية لدراسة النيازك الفضائية المتساقطة على الصخور الجيرية.' }
    ],
    curriculumLinks: ['الجغرافيا: حديقة الصخور بالدقم وعوامل التجوية والنحت الهوائي', 'النفط والطاقة']
  },

  {
    id: 'dhofar_south',
    nameAr: 'محافظة ظفار وجبال سمحان والقمر وصخور مرباط القديمة',
    nameEn: 'Dhofar Mountains, Jabal Samhan & Mirbat Ancient Basement',
    governorates: ['محافظة ظفار (صلالة، طاقة، مرباط، سدح، رخيوت، ضلكوت، ثمريت)'],
    viewBox: { x: 200, y: 880, width: 380, height: 320 },
    zoomLevel: 2.3,
    center: { x: 380, y: 1040 },
    description: 'تنوع جيولوجي ومناخي فريد يجمع بين أقدم صخور نارية متبلورة في عمان (جرانيت مرباط)، وجبال الحجر الجيري الكارستي التي تغذيها أمطار الخريف المونسوني وشلالات دربات والعيون المائية.',
    dominantRocks: ['الجرانيت والنيس القديم (مرباط)', 'الحجر الجيري والدولوميت الكارستي', 'متبخرات الجبس (ثمريت)', 'رواسب الترافرتين والسهل الساحلي'],
    geologicHighlights: [
      'صخور قاعدة مرباط: صخور متبلورة عمرها يفوق 800 مليون عام تعود لما قبل الكامبري',
      'جرف جبل سمحان الباتيكي: انحدار عمودي صخري شاهق يطل على بحر العرب بارتفاع 2100م',
      'حفرة طوي أعتير وكهف طيق: من أضخم حفر الإذابة والانهيارات الكارستية في العالم',
      'شلالات وادي دربات وترافرتين الحجر الجيري الناتج عن ترسيب الكالسيت بفعل مياه العيون'
    ],
    famousLandmarks: [
      { nameAr: 'صخور شاطئ مرباط البلورية', coords: { x: 410, y: 1070 }, rockType: 'granite', description: 'جرانيت وردي قديم جداً يمثل أقدم وثيقة صخرية في سلطنة عُمان.' },
      { nameAr: 'حفرة طوي أعتير وكهف طيق', coords: { x: 395, y: 1045 }, rockType: 'limestone', description: 'حفرة إذابة طبيعية عملاقة تعرف بـ "بئر الطيور".' },
      { nameAr: 'شلالات ومجرى وادي دربات', coords: { x: 380, y: 1055 }, rockType: 'limestone', description: 'جدران حجر جيري وكربونات شكلت سداً وترسبات ترافرتين خضراء بديعة.' },
      { nameAr: 'جبل سمحان ومحمية النمر العربي', coords: { x: 420, y: 1025 }, elevationM: 2100, rockType: 'limestone', description: 'أجراف صخرية مهيبة تفصل ساحل بحر العرب عن نجد ظفار.' },
      { nameAr: 'مناجم جبس ثمريت الكبرى', coords: { x: 350, y: 960 }, rockType: 'evaporite', description: 'أكبر محاجر لإنتاج وتصدير الجبس عالي النقاوة على مستوى العالم.' }
    ],
    curriculumLinks: ['هذا وطني: ظاهرة الخريف وجغرافية ظفار', 'الجيولوجيا: التجوية المطرية والكارست في دربات']
  }
];

// 4. Accurate Geological Polygons representing the rock units across Oman
// SVG coordinate space: 0 to 1000 X, 0 to 1200 Y
export const GEOLOGICAL_POLYGONS: GeologicalPolygon[] = [
  // A. SEMAIL OPHIOLITE BELT (Northern & Central Mountain Flanks)
  {
    id: 'poly-ophiolite-north',
    rockId: 'ophiolite',
    zoneName: 'حزام أفيوليت سمائل الشمالي (وادي الجزي - صحار)',
    svgPath: 'M 530,160 L 565,190 L 585,220 L 570,250 L 540,240 L 520,200 Z',
    centerCoords: { x: 550, y: 210 },
    fillColor: '#047857',
    label: 'أفيوليت وادي الجزي',
    regionId: 'batinah_coast'
  },
  {
    id: 'poly-ophiolite-central',
    rockId: 'ophiolite',
    zoneName: 'حزام أفيوليت سمائل الأوسط (سمائل - نخل - الرستاق)',
    svgPath: 'M 585,220 L 635,260 L 665,295 L 675,340 L 640,350 L 610,320 L 590,270 Z',
    centerCoords: { x: 630, y: 290 },
    fillColor: '#047857',
    label: 'أفيوليت سمائل والرستاق',
    regionId: 'western_hajar'
  },
  {
    id: 'poly-ophiolite-east',
    rockId: 'ophiolite',
    zoneName: 'شريحة أفيوليت الحجر الشرقي (وادي بني خالد - صور)',
    svgPath: 'M 675,340 L 730,375 L 775,410 L 760,450 L 710,430 L 685,380 Z',
    centerCoords: { x: 730, y: 400 },
    fillColor: '#047857',
    label: 'أفيوليت الحجر الشرقي',
    regionId: 'eastern_hajar'
  },
  {
    id: 'poly-ophiolite-masirah',
    rockId: 'ophiolite',
    zoneName: 'شريحة أفيوليت جزيرة مصيرة المحيطية',
    svgPath: 'M 770,610 L 795,640 L 805,690 L 785,710 L 765,660 Z',
    centerCoords: { x: 785, y: 660 },
    fillColor: '#047857',
    label: 'أفيوليت مصيرة',
    regionId: 'wusta_desert'
  },

  // B. HAJAR CARBONATE PLATFORM & LIMESTONES
  {
    id: 'poly-limestone-musandam',
    rockId: 'limestone',
    zoneName: 'كربونات الحجر الجيري في رؤوس الجبال (مسندم)',
    svgPath: 'M 505,45 L 545,55 L 565,105 L 540,150 L 505,140 L 490,90 Z',
    centerCoords: { x: 530, y: 95 },
    fillColor: '#0284c7',
    label: 'جير مسندم ورؤوس الجبال',
    regionId: 'musandam'
  },
  {
    id: 'poly-limestone-jabal-akhdar',
    rockId: 'limestone',
    zoneName: 'نافذة الجبل الأخضر وجبل شمس الجيرية (الأوتوكتون)',
    svgPath: 'M 570,320 L 615,310 L 650,335 L 640,380 L 590,390 L 560,360 Z',
    centerCoords: { x: 605, y: 350 },
    fillColor: '#0284c7',
    label: 'جير الجبل الأخضر وشمس',
    regionId: 'western_hajar'
  },
  {
    id: 'poly-limestone-eastern-hajar',
    rockId: 'limestone',
    zoneName: 'هضبة الحجر الجيري في الحجر الشرقي وسلما',
    svgPath: 'M 720,380 L 780,385 L 830,430 L 810,470 L 750,450 Z',
    centerCoords: { x: 770, y: 430 },
    fillColor: '#0284c7',
    label: 'جير الحجر الشرقي والكهوف',
    regionId: 'eastern_hajar'
  },
  {
    id: 'poly-limestone-dhofar',
    rockId: 'limestone',
    zoneName: 'سلسلة جبال سمحان والقمر الرسوبية الجيرية (ظفار)',
    svgPath: 'M 240,1010 L 330,970 L 430,990 L 460,1050 L 370,1075 L 260,1065 Z',
    centerCoords: { x: 350, y: 1030 },
    fillColor: '#0284c7',
    label: 'حجر جير سمحان وظفار',
    regionId: 'dhofar_south'
  },
  {
    id: 'poly-limestone-duqm',
    rockId: 'limestone',
    zoneName: 'هضبة الحجر الجيري والمارل في الدقم والوسطى',
    svgPath: 'M 650,710 L 720,720 L 750,770 L 730,820 L 670,800 Z',
    centerCoords: { x: 700, y: 760 },
    fillColor: '#0284c7',
    label: 'صخور الدقم الرسوبية',
    regionId: 'wusta_desert'
  },

  // C. HAWASINA COMPLEX (Deep Sea Turbidites & Cherts)
  {
    id: 'poly-hawasina-inland',
    rockId: 'hawasina',
    zoneName: 'تلال حواسينا وحمراء الدروع (الظاهرة والداخلية)',
    svgPath: 'M 500,290 L 560,280 L 575,340 L 530,370 L 485,340 Z',
    centerCoords: { x: 530, y: 325 },
    fillColor: '#8b5cf6',
    label: 'مجموعة حواسينا والشيرت',
    regionId: 'western_hajar'
  },
  {
    id: 'poly-hawasina-sharqiyah',
    rockId: 'hawasina',
    zoneName: 'تكوينات حواسينا المتداخلة (المضيبي وإبراء)',
    svgPath: 'M 650,380 L 700,390 L 690,440 L 635,420 Z',
    centerCoords: { x: 670, y: 410 },
    fillColor: '#8b5cf6',
    label: 'حواسينا شمال الشرقية',
    regionId: 'eastern_hajar'
  },

  // D. PRECAMBRIAN BASEMENT (Granite & Gneiss)
  {
    id: 'poly-granite-mirbat',
    rockId: 'granite',
    zoneName: 'صخور قاعدة مرباط القديمة (جرانيت ونيس متبلور)',
    svgPath: 'M 390,1055 L 435,1050 L 450,1080 L 405,1090 Z',
    centerCoords: { x: 420, y: 1070 },
    fillColor: '#e11d48',
    label: 'جرانيت مرباط القديم',
    regionId: 'dhofar_south'
  },
  {
    id: 'poly-granite-jaalan',
    rockId: 'granite',
    zoneName: 'صخور قاعدة جبل جعلان القديمة (قبل الكامبري)',
    svgPath: 'M 800,460 L 830,465 L 825,490 L 795,485 Z',
    centerCoords: { x: 812, y: 475 },
    fillColor: '#e11d48',
    label: 'قاعدة جعلان المتبلورة',
    regionId: 'eastern_hajar'
  },

  // E. MARBLE FORMATIONS (Metamorphic Belts)
  {
    id: 'poly-marble-ibri',
    rockId: 'marble',
    zoneName: 'حزام محاجر الرخام العماني (عبري وعملا)',
    svgPath: 'M 480,360 L 525,355 L 530,395 L 490,405 Z',
    centerCoords: { x: 505, y: 380 },
    fillColor: '#d97706',
    label: 'رخام عبري وعملا',
    regionId: 'western_hajar'
  },
  {
    id: 'poly-marble-jamma',
    rockId: 'marble',
    zoneName: 'رخام جما ونخل المتصل بحافة الأفيوليت',
    svgPath: 'M 625,310 L 655,305 L 650,335 L 620,330 Z',
    centerCoords: { x: 638, y: 320 },
    fillColor: '#d97706',
    label: 'رخام جما والرستاق',
    regionId: 'western_hajar'
  },

  // F. ALLUVIAL PLAINS & GRAVELS (Quaternary)
  {
    id: 'poly-alluvial-batinah',
    rockId: 'alluvial',
    zoneName: 'سهل الباطنة الزراعي والساحلي الغريني',
    svgPath: 'M 545,150 L 600,195 L 670,265 L 700,310 L 685,335 L 635,275 L 565,200 L 520,165 Z',
    centerCoords: { x: 615, y: 240 },
    fillColor: '#10b981',
    label: 'سهل الباطنة الغريني',
    regionId: 'batinah_coast'
  },
  {
    id: 'poly-alluvial-salalah',
    rockId: 'alluvial',
    zoneName: 'سهل صلالة الساحلي الزراعي والرواسب النهرية',
    svgPath: 'M 320,1055 L 390,1050 L 385,1085 L 315,1080 Z',
    centerCoords: { x: 350, y: 1070 },
    fillColor: '#10b981',
    label: 'سهل صلالة الغريني',
    regionId: 'dhofar_south'
  },

  // G. DESERT ERGS & SANDSTONES
  {
    id: 'poly-sandstone-wahiba',
    rockId: 'sandstone',
    zoneName: 'بحر رمال الشرقية (وهيبة) والكثبان الطولية',
    svgPath: 'M 710,470 L 770,460 L 785,550 L 755,620 L 705,580 L 690,500 Z',
    centerCoords: { x: 740, y: 540 },
    fillColor: '#ca8a04',
    label: 'رمال الشرقية (وهيبة)',
    regionId: 'eastern_hajar'
  },
  {
    id: 'poly-sandstone-rubalkhali',
    rockId: 'sandstone',
    zoneName: 'كثبان الربع الخالي العماني وصحراء نجد',
    svgPath: 'M 200,680 L 400,650 L 460,780 L 380,920 L 220,880 Z',
    centerCoords: { x: 320, y: 780 },
    fillColor: '#ca8a04',
    label: 'رمال الربع الخالي والنجد',
    regionId: 'wusta_desert'
  },
  {
    id: 'poly-sandstone-wusta',
    rockId: 'sandstone',
    zoneName: 'سهول جدة الحراسيس والحجر الرملي القديم',
    svgPath: 'M 440,650 L 640,630 L 670,750 L 530,840 L 430,780 Z',
    centerCoords: { x: 540, y: 720 },
    fillColor: '#ca8a04',
    label: 'جدة الحراسيس الرسوبية',
    regionId: 'wusta_desert'
  },

  // H. EVAPORITES & SALT DOMES
  {
    id: 'poly-evaporite-qarn-alam',
    rockId: 'evaporite',
    zoneName: 'قباب قرن علم ونيهيدة الملحية التكتونية',
    svgPath: 'M 550,590 L 590,585 L 595,625 L 555,630 Z',
    centerCoords: { x: 572, y: 607 },
    fillColor: '#ec4899',
    label: 'قبة قرن علم الملحية',
    regionId: 'wusta_desert'
  },
  {
    id: 'poly-evaporite-thumrait',
    rockId: 'evaporite',
    zoneName: 'حزام مكامن الجبس والمتبخرات في ثمريت',
    svgPath: 'M 320,940 L 380,935 L 385,975 L 325,980 Z',
    centerCoords: { x: 352, y: 957 },
    fillColor: '#ec4899',
    label: 'مكامن جبس ثمريت الكبرى',
    regionId: 'dhofar_south'
  }
];

// 5. Mineral Deposits & Industrial Resource Markers
export const MINERAL_DEPOSITS: MineralDepositMarker[] = [
  {
    id: 'dep-copper-jizzi',
    nameAr: 'منجم نحاس وادي الجزي والأسيل',
    type: 'copper',
    coords: { x: 550, y: 220 },
    siteName: 'وادي الجزي - صحار',
    rockContext: 'صخور وسائد البازلت التابعة لأفيوليت سمائل',
    economicStatus: 'مستغل تاريخياً ومصدر النحاس العماني لحضارات سومر، ويجري استكشاف مكامن جديدة حديثاً.'
  },
  {
    id: 'dep-chromite-nakhal',
    nameAr: 'مكامن خام الكروميت',
    type: 'chromite',
    coords: { x: 635, y: 310 },
    siteName: 'نخل ووادي سمائل',
    rockContext: 'صخور البيريدوتيت والهارزبورجايت في وشاح الأفيوليت',
    economicStatus: 'تنتج عمان سنوياً آلاف الأطنان من خام الكروم عالي الجودة لصناعة الصلب والسبائك المقاومة للصدأ.'
  },
  {
    id: 'dep-marble-ibri',
    nameAr: 'محاجر الرخام العماني الإمبراطوري',
    type: 'marble',
    coords: { x: 505, y: 380 },
    siteName: 'عبري - عملا والدريز',
    rockContext: 'صخور كربونات متحولة فائقة النقاء (Omani Marble)',
    economicStatus: 'يتم تصديره لأكثر من 50 دولة كواحد من أرقى أنواع الرخام المعماري في العالم.'
  },
  {
    id: 'dep-limestone-rusayl',
    nameAr: 'محاجر الحجر الجيري الإسمنتي',
    type: 'limestone',
    coords: { x: 685, y: 350 },
    siteName: 'حلبان والرسيل - مسقط',
    rockContext: 'حجر جيري نقي غني بكربونات الكالسيوم (CaCO3 > 96%)',
    economicStatus: 'المغذي الرئيسي لمصانع الإسمنت الوطنية ومواد البناء والتشييد.'
  },
  {
    id: 'dep-oil-fahud',
    nameAr: 'حقل فهود النفطي العملاق',
    type: 'oil_gas',
    coords: { x: 510, y: 500 },
    siteName: 'فهود - الداخلية',
    rockContext: 'مكمن تكوين ناطح والشعيبة الجيري المغلق بالطفل',
    economicStatus: 'أول وأشهر حقل نفطي تجاري في سلطنة عمان اكتشف عام 1964 وما زال ينتج النفط الخام.'
  },
  {
    id: 'dep-gypsum-thumrait',
    nameAr: 'مناجم الجبس العماني الكبرى',
    type: 'limestone',
    coords: { x: 350, y: 960 },
    siteName: 'ثمريت - نجد ظفار',
    rockContext: 'متبخرات كبريتات الكالسيوم المائية في تكوينات العصر الثلاثي',
    economicStatus: 'تعد سلطنة عمان أكبر مصدر للجبس الخام في العالم، حيث تصدر ملايين الأطنان لمصانع آسيا وإفريقيا.'
  },
  {
    id: 'dep-silica-sharqiyah',
    nameAr: 'مكامن رمال السيليكا النقية',
    type: 'silica',
    coords: { x: 740, y: 530 },
    siteName: 'رمال الشرقية والوسطى',
    rockContext: 'حبيبات كوارتز نقية مصقولة بفعل الرياح الصحراوية',
    economicStatus: 'احتياطيات ضخمة تدخل في صناعة الزجاج المسطح والمواد العازلة والخلايا الشمسية الكهروضوئية.'
  }
];

// 6. Chronostratigraphic Column Summary for Oman
export interface StratigraphicUnit {
  eraAr: string;
  periodAr: string;
  epochMillionsYears: string;
  mainFormationsAr: string;
  predominantRocksAr: string;
  fossilAndGeologicalRecord: string;
  economicOutput: string;
  color: string;
}

export const OMAN_STRATIGRAPHIC_COLUMN: StratigraphicUnit[] = [
  {
    eraAr: 'حقبة الحياة الحديثة (السينوزوي)',
    periodAr: 'العصر الرباعي والنيوجيني (Quaternary & Neogene)',
    epochMillionsYears: 'منذ 23 مليون سنة حتى الآن',
    mainFormationsAr: 'السهول الساحلية (الباطنة، صلالة)، رمال الشرقية، سبخات أم السميم وبر الحكمان',
    predominantRocksAr: 'رواسب حصوية وطمي نهري، رمال كوارتزية هوائية، طبقات كلسية شاطئية وجبسية',
    fossilAndGeologicalRecord: 'تكون الكثبان الحديثة، عظام ثدييات وبقايا مرجانية شاطئية، حفر الإذابة والكهوف الكارستية النشطة',
    economicOutput: 'المياه الجوفية العذبة، الأراضي الزراعية الخصبة، رمال السيليكا والركام الإنشائي',
    color: '#10b981'
  },
  {
    eraAr: 'حقبة الحياة الحديثة (السينوزوي)',
    periodAr: 'العصر الباليوجيني (Paleogene: Paleocene - Oligocene)',
    epochMillionsYears: 'منذ 66 إلى 23 مليون سنة',
    mainFormationsAr: 'مجموعة حضرموت، تكوين الدمام وأم الرؤوس في ظفار والوسطى',
    predominantRocksAr: 'حجر جيري أبيض وأصفر نقي، مارل، دولوميت، طبقات جبسية وأنهيدريت سميكة',
    fossilAndGeologicalRecord: 'أحافير النيموليت (Nummulites) وقنافذ البحر والرخويات البحرية الضحلة',
    economicOutput: 'أضخم احتياطي ومناجم جبس في العالم (ثمريت)، حجر جيري لمصانع الإسمنت في ظفار',
    color: '#38bdf8'
  },
  {
    eraAr: 'حقبة الحياة المتوسطة (الميزوزوي)',
    periodAr: 'العصر الطباشيري (Cretaceous)',
    epochMillionsYears: 'منذ 145 إلى 66 مليون سنة',
    mainFormationsAr: 'شريحة أفيوليت سمائل (الاندساس المحيطي)، تكوين ناطح، تكوين شعيبة، صخور الحواسينا',
    predominantRocksAr: 'صخور نارية فوق قاعدية (بيريدوتيت، جابرو، بازلت)، كربونات حجر جيري عضوية، شيرت سيليكي',
    fossilAndGeologicalRecord: 'انزلاق قشرة المحيط فوق القارة، أحافير أصداف الروديست العملاقة، الأمونيتات، الراديولاريا',
    economicOutput: 'أكبر خزانات النفط والغاز في عمان (ناطح وشعيبة)، خامات النحاس والكروميت والرخام',
    color: '#047857'
  },
  {
    eraAr: 'حقبة الحياة المتوسطة (الميزوزوي)',
    periodAr: 'العصر الجوراسي والترياسي (Jurassic & Triassic)',
    epochMillionsYears: 'منذ 252 إلى 145 مليون سنة',
    mainFormationsAr: 'مجموعة الحجر الكبرى (Hajar Supergroup)، رؤوس الجبال في مسندم، تكوين سحتن وظاهر',
    predominantRocksAr: 'حجر جيري متماسك ودولوميت ضخم يشكل القمم الجبلية الشاهقة وجدران الأخاديد',
    fossilAndGeologicalRecord: 'بحر التيثس الدافئ، مرجان ترياسي، براكيوبودات، حفريات أسماك جبل حارم بمسندم',
    economicOutput: 'حجر البناء والرخام العماني عالي الصلابة، مجمعات الكهوف الكارستية السياحية العالمية',
    color: '#0284c7'
  },
  {
    eraAr: 'حقبة الحياة القديمة (الباليوزوي)',
    periodAr: 'العصر البرمي والكربوني والديفوني (Permian - Cambrian)',
    epochMillionsYears: 'منذ 541 إلى 252 مليون سنة',
    mainFormationsAr: 'مجموعة الحقف (Huqf)، تكوين الغبار، تكوين أم العجرم، تكوين الخلود الجليدي',
    predominantRocksAr: 'حجر رملي أحمر، كونجلوميرات، طمي بحري، صخور ترسبات جليدية قطبية قديمة',
    fossilAndGeologicalRecord: 'تغيرات مناخية جذرية شملت فترات جليدية قطبية في عمان، أحافير ثلاثيات الفصوص (Trilobites)',
    economicOutput: 'خزانات الغاز المحكم والنفط العميق، مكامن رملية خازنة للهيدروكربونات',
    color: '#ca8a04'
  },
  {
    eraAr: 'حقبة ما قبل الكامبري (البريكامبري)',
    periodAr: 'العصر الإدياكاري والنيوبروتيروزوي (Precambrian / Ediacaran)',
    epochMillionsYears: 'منذ أكثر من 850 إلى 541 مليون سنة',
    mainFormationsAr: 'صخور قاعدة مرباط البلورية، صخور جبل جاشم النارية، سلسلة قباب ملح أرا (Ara Salt)',
    predominantRocksAr: 'جرانيت جوفي، صخور نيس وشيست متحولة، قباب ملح صخري (هاليت) وأنهيدريت سميكة',
    fossilAndGeologicalRecord: 'أقدم تشكلات صخرية في سلطنة عمان تمثل نواة الدرع العربي، بدايات الحياة الخلوية (ستروماتولايت)',
    economicOutput: 'المصائد الهيدروكربونية المحبوسة بالقباب الملحية (قرن علم)، أحجار الزينة الجرانيتية الفاخرة',
    color: '#e11d48'
  }
];
