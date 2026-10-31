import {
  LayerConfig,
  GovernorateInfo,
  WaterFeature,
  WaterQuizQuestion
} from './types.ts';

// 1. Definition of the 10 Independent Geographic Water Layers
export const WATER_LAYER_CONFIGS: LayerConfig[] = [
  {
    id: 'aflaj',
    nameAr: 'الأفلاج العُمانية',
    nameEn: 'Omani Aflaj Systems',
    iconName: 'Droplet',
    color: '#0284c7', // Sky Blue
    badgeBg: 'bg-sky-50 dark:bg-sky-950/80',
    badgeText: 'text-sky-700 dark:text-sky-300',
    descriptionAr: 'منظومة الري التراثية الفريدة في عُمان (داوودية، عينية، غيلية)، تشمل 5 أفلاج مدرجة على قائمة التراث العالمي لليونسكو.',
    defaultVisible: true
  },
  {
    id: 'springs',
    nameAr: 'العيون والينابيع المائية',
    nameEn: 'Natural Springs & Geothermal',
    iconName: 'Sparkles',
    color: '#0d9488', // Teal
    badgeBg: 'bg-teal-50 dark:bg-teal-950/80',
    badgeText: 'text-teal-700 dark:text-teal-300',
    descriptionAr: 'العيون الحارة والكبريتية والينابيع العذبة الصادرة من شقوق الحجر الجيري والأفيوليت في الحجر وظفار.',
    defaultVisible: true
  },
  {
    id: 'wadis',
    nameAr: 'الأودية والمجاري المائية',
    nameEn: 'Wadis & Riverbeds',
    iconName: 'Waves',
    color: '#2563eb', // Royal Blue
    badgeBg: 'bg-blue-50 dark:bg-blue-950/80',
    badgeText: 'text-blue-700 dark:text-blue-300',
    descriptionAr: 'شبكات الأودية الدائمة والموسمية التي تشق سلاسل الجبال وتغذي السهول الساحلية والمياه الجوفية.',
    defaultVisible: true
  },
  {
    id: 'dams',
    nameAr: 'السدود والحواجز المائية',
    nameEn: 'Dams & Reservoirs',
    iconName: 'Shield',
    color: '#ea580c', // Orange
    badgeBg: 'bg-orange-50 dark:bg-orange-950/80',
    badgeText: 'text-orange-700 dark:text-orange-300',
    descriptionAr: 'سدود التغذية الجوفية، وسدود التخزين السطحي، وسدود الحماية من مخاطر الفيضانات والأنواء المناخية.',
    defaultVisible: true
  },
  {
    id: 'wells',
    nameAr: 'الآبار وحقول الإمداد',
    nameEn: 'Wells & Wellfields',
    iconName: 'Disc',
    color: '#7c3aed', // Purple
    badgeBg: 'bg-purple-50 dark:bg-purple-950/80',
    badgeText: 'text-purple-700 dark:text-purple-300',
    descriptionAr: 'حقول الآبار الإستراتيجية والآبار الاستكشافية ومشاريع التغذية الاصطناعية للخزانات الجوفية.',
    defaultVisible: true
  },
  {
    id: 'coastal_marine',
    nameAr: 'البحار والسواحل والأخوار',
    nameEn: 'Coastal, Bays & Ramsar Sites',
    iconName: 'Anchor',
    color: '#0891b2', // Cyan
    badgeBg: 'bg-cyan-50 dark:bg-cyan-950/80',
    badgeText: 'text-cyan-700 dark:text-cyan-300',
    descriptionAr: 'السواحل البحرية بطول 3165 كم، والخلجان، وأخوار ظفار المحمية بموجب اتفاقية رامسار الدولية.',
    defaultVisible: true
  },
  {
    id: 'groundwater_basins',
    nameAr: 'الأحواض والمياه الجوفية',
    nameEn: 'Groundwater Basins',
    iconName: 'Layers',
    color: '#16a34a', // Green
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/80',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    descriptionAr: 'الأحواض المائية الإستراتيجية (حوض النجد، حوض الباطنة، حوض المسرات، حوض رمال الشرقية).',
    defaultVisible: false
  },
  {
    id: 'desalination',
    nameAr: 'محطات تحلية مياه البحر',
    nameEn: 'Desalination Plants',
    iconName: 'Factory',
    color: '#f59e0b', // Amber
    badgeBg: 'bg-amber-50 dark:bg-amber-950/80',
    badgeText: 'text-amber-700 dark:text-amber-300',
    descriptionAr: 'محطات التحلية بتقنية التناضح العكسي (RO) التي تؤمن أكثر من 85% من مياه الشرب الحضرية بالسلطنة.',
    defaultVisible: true
  },
  {
    id: 'treatment_plants',
    nameAr: 'محطات معالجة مياه الصرف',
    nameEn: 'Wastewater Treatment (MBR)',
    iconName: 'RefreshCw',
    color: '#4f46e5', // Indigo
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/80',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    descriptionAr: 'محطات التنقية المتقدمة (MBR) لإعادة استخدام المياه المعالجة ثلاثياً في التشجير والحدائق والصناعة.',
    defaultVisible: false
  },
  {
    id: 'lakes_reservoirs',
    nameAr: 'البحيرات والخزانات المائية',
    nameEn: 'Lakes, Reservoirs & Wetlands',
    iconName: 'CircleDot',
    color: '#065f46', // Deep Green
    badgeBg: 'bg-teal-50 dark:bg-teal-950/80',
    badgeText: 'text-teal-700 dark:text-teal-300',
    descriptionAr: 'البحيرات الاصطناعية خلف السدود الكبرى، والأراضي الرطبة، والخزانات المائية الإستراتيجية للطوارئ.',
    defaultVisible: false
  }
];

// 2. All 11 Governorates & 63 Wilayats of the Sultanate of Oman
export const GOVERNORATES_DATA: GovernorateInfo[] = [
  {
    id: 'gov_muscat',
    nameAr: 'محافظة مسقط',
    nameEn: 'Muscat Governorate',
    capitalAr: 'مسقط',
    centerCoords: { lat: 23.5880, lng: 58.3829, heightM: 70000 },
    descriptionAr: 'عاصمة السلطنة ومركزها الإداري، تتميز بسد وادي ضيقة العملاق في ولاية قريات، ومحطة الغبرة لتحلية المياه، ومحطة الأنصب لمعالجة المياه.',
    stats: { totalAflaj: 68, totalDams: 8, totalSprings: 14, totalWadis: 19, totalDesalination: 3 },
    wilayats: [
      { id: 'wil_muscat_city', governorateId: 'gov_muscat', nameAr: 'ولاية مسقط', nameEn: 'Muscat', centerCoords: { lat: 23.6139, lng: 58.5922, heightM: 25000 }, descriptionAr: 'القلب التاريخي للمحافظة، تشرف على بحر عمان بموانئها التاريخية.' },
      { id: 'wil_mutrah', governorateId: 'gov_muscat', nameAr: 'ولاية مطرح', nameEn: 'Mutrah', centerCoords: { lat: 23.6200, lng: 58.5600, heightM: 22000 }, descriptionAr: 'ميناء السلطان قابوس التاريخي وسوق مطرح القديم والواجهة البحرية.' },
      { id: 'wil_bawshar', governorateId: 'gov_muscat', nameAr: 'ولاية بوشر', nameEn: 'Bawshar', centerCoords: { lat: 23.5400, lng: 58.4100, heightM: 25000 }, descriptionAr: 'تضم فلج الحمام الحار وعيون بوشر الطبيعية ومحطة الأنصب لمعالجة المياه.' },
      { id: 'wil_seeb', governorateId: 'gov_muscat', nameAr: 'ولاية السيب', nameEn: 'Seeb', centerCoords: { lat: 23.6700, lng: 58.1800, heightM: 30000 }, descriptionAr: 'تحتضن سد وادي الخوض للتغذية الجوفية ومجرى وادي الخوض العظيم.' },
      { id: 'wil_amrat', governorateId: 'gov_muscat', nameAr: 'ولاية العامرات', nameEn: 'Al-Amrat', centerCoords: { lat: 23.4900, lng: 58.4900, heightM: 28000 }, descriptionAr: 'وادي السرين ومحمية الوعل العربي وسدود حماية العامرات من الفيضانات.' },
      { id: 'wil_qurayyat', governorateId: 'gov_muscat', nameAr: 'ولاية قريات', nameEn: 'Qurayyat', centerCoords: { lat: 23.2600, lng: 58.9100, heightM: 35000 }, descriptionAr: 'موقع سد وادي ضيقة أضخم سد مائي في عُمان ومحطة قريات لتحلية المياه.' }
    ]
  },
  {
    id: 'gov_dhofar',
    nameAr: 'محافظة ظفار',
    nameEn: 'Dhofar Governorate',
    capitalAr: 'صلالة',
    centerCoords: { lat: 17.0151, lng: 54.0924, heightM: 140000 },
    descriptionAr: 'تشهد ظاهرة خريف صلالة الاستثنائية التي تغذي عيون دربات وجرزيز وصحلنوت وأخوار اللبان المصنفة بموجب اتفاقية رامسار وحوض النجد المائي العملاق.',
    stats: { totalAflaj: 45, totalDams: 6, totalSprings: 92, totalWadis: 34, totalDesalination: 4 },
    wilayats: [
      { id: 'wil_salalah', governorateId: 'gov_dhofar', nameAr: 'ولاية صلالة', nameEn: 'Salalah', centerCoords: { lat: 17.0150, lng: 54.0924, heightM: 35000 }, descriptionAr: 'حاضرة ظفار وعين جرزيز وعين صحلنوت وسد حماية صلالة وسهل صلالة الزراعي.' },
      { id: 'wil_taqah', governorateId: 'gov_dhofar', nameAr: 'ولاية طاقة', nameEn: 'Taqah', centerCoords: { lat: 17.0400, lng: 54.3900, heightM: 30000 }, descriptionAr: 'وادي دربات وشلالاته الشهيرة، عين دربات، وخور طاقة الطبيعي المحمي.' },
      { id: 'wil_mirbat', governorateId: 'gov_dhofar', nameAr: 'ولاية مرباط', nameEn: 'Mirbat', centerCoords: { lat: 16.9900, lng: 54.6900, heightM: 30000 }, descriptionAr: 'ساحل صخري بديع وعيون جبل سمحان وصخور ما قبل الكامبري المتبلورة.' },
      { id: 'wil_rakhyut', governorateId: 'gov_dhofar', nameAr: 'ولاية رخيوت', nameEn: 'Rakhyut', centerCoords: { lat: 16.7500, lng: 53.4200, heightM: 30000 }, descriptionAr: 'جبال القمر الساحلية وأودية المياه المنحدرة نحو بحر العرب.' },
      { id: 'wil_thumrait', governorateId: 'gov_dhofar', nameAr: 'ولاية ثمريت', nameEn: 'Thumrait', centerCoords: { lat: 17.6500, lng: 54.0300, heightM: 40000 }, descriptionAr: 'بوابة النجد ومزارع النجد المعتمدة على حوض المياه الجوفية العميق.' },
      { id: 'wil_dalkut', governorateId: 'gov_dhofar', nameAr: 'ولاية ضلكوت', nameEn: 'Dalkut', centerCoords: { lat: 16.7000, lng: 53.2400, heightM: 30000 }, descriptionAr: 'أقصى الجنوب الغربي، تمتاز بالعيون الجبلية وأشجار التبلدي النادرة.' },
      { id: 'wil_mazunah', governorateId: 'gov_dhofar', nameAr: 'ولاية المزيونة', nameEn: 'Al-Mazyunah', centerCoords: { lat: 17.8400, lng: 52.6500, heightM: 40000 }, descriptionAr: 'المنطقة الحرة والواحات الصحراوية على الحدود الغربية.' },
      { id: 'wil_muqshin', governorateId: 'gov_dhofar', nameAr: 'ولاية مقشن', nameEn: 'Muqshin', centerCoords: { lat: 19.5500, lng: 54.8800, heightM: 45000 }, descriptionAr: 'واحات مقشن الطبيعية ونخيل الصحراء على مشارف الربع الخالي.' },
      { id: 'wil_shlim', governorateId: 'gov_dhofar', nameAr: 'ولاية شليم وجزر الحلانيات', nameEn: 'Shalim & Hallaniyat', centerCoords: { lat: 17.9200, lng: 55.5300, heightM: 50000 }, descriptionAr: 'شواطئ النجد وجزر الحلانيات العذبة في بحر العرب.' },
      { id: 'wil_sadah', governorateId: 'gov_dhofar', nameAr: 'ولاية سدح', nameEn: 'Sadah', centerCoords: { lat: 17.0500, lng: 55.0700, heightM: 35000 }, descriptionAr: 'حاسك وشلالات عين فوشي وأخوار اللبان وأودية جبل سمحان الشرقية.' }
    ]
  },
  {
    id: 'gov_musandam',
    nameAr: 'محافظة مسندم',
    nameEn: 'Musandam Governorate',
    capitalAr: 'خصب',
    centerCoords: { lat: 26.1800, lng: 56.2400, heightM: 60000 },
    descriptionAr: 'بوابة مضيق هرمز الاستراتيجية، تشتهر بالخلجان المائية الصخرية العميقة الشبيهة بالفيوردات والسدود الجبلية ومحطات تحلية المياه الشاطئية.',
    stats: { totalAflaj: 24, totalDams: 4, totalSprings: 18, totalWadis: 15, totalDesalination: 4 },
    wilayats: [
      { id: 'wil_khasab', governorateId: 'gov_musandam', nameAr: 'ولاية خصب', nameEn: 'Khasab', centerCoords: { lat: 26.1800, lng: 56.2500, heightM: 25000 }, descriptionAr: 'حاضرة مسندم، تضم سد وادي خصب ومحطة التحلية ومضيق هرمز الدولي.' },
      { id: 'wil_diba', governorateId: 'gov_musandam', nameAr: 'ولاية دبا', nameEn: 'Diba', centerCoords: { lat: 25.6200, lng: 56.2700, heightM: 25000 }, descriptionAr: 'الساحل الشرقي لمسندم وميناء دبا والعيون والأودية الجبلية.' },
      { id: 'wil_bukha', governorateId: 'gov_musandam', nameAr: 'ولاية بخاء', nameEn: 'Bukha', centerCoords: { lat: 26.1400, lng: 56.1500, heightM: 20000 }, descriptionAr: 'الساحل الغربي المطل على الخليج العربي وقلعة بخاء الأثرية.' },
      { id: 'wil_madha', governorateId: 'gov_musandam', nameAr: 'ولاية مدحاء', nameEn: 'Madha', centerCoords: { lat: 25.2900, lng: 56.3300, heightM: 20000 }, descriptionAr: 'واحة جبلية خصبة تشتهر بأفلاج الصاروج والعيون الجبلية العذبة.' }
    ]
  },
  {
    id: 'gov_dakhiliyah',
    nameAr: 'محافظة الداخلية',
    nameEn: 'Al-Dakhiliyah Governorate',
    capitalAr: 'نزوى',
    centerCoords: { lat: 22.9333, lng: 57.5333, heightM: 80000 },
    descriptionAr: 'مهد الأفلاج الداوودية الكبرى في سلطنة عمان؛ تحتضن فلج دارس (أكبر فلج في عمان) وفلج الخطمين وفلج الملكي المدرجة باليونسكو وسدود تنوف وبهلاء.',
    stats: { totalAflaj: 742, totalDams: 18, totalSprings: 48, totalWadis: 42, totalDesalination: 0 },
    wilayats: [
      { id: 'wil_nizwa', governorateId: 'gov_dakhiliyah', nameAr: 'ولاية نزوى', nameEn: 'Nizwa', centerCoords: { lat: 22.9333, lng: 57.5333, heightM: 28000 }, descriptionAr: 'عاصمة الثقافة والتاريخ، موقع فلج دارس وفلج الخطمين وسد وادي تنوف وسد الأبيض.' },
      { id: 'wil_bahla', governorateId: 'gov_dakhiliyah', nameAr: 'ولاية بهلاء', nameEn: 'Bahla', centerCoords: { lat: 22.9667, lng: 57.3000, heightM: 28000 }, descriptionAr: 'واحة بهلاء المسجلة باليونسكو، قلعة بهلاء، وفلج الميتا وفلج بهلاء.' },
      { id: 'wil_manah', governorateId: 'gov_dakhiliyah', nameAr: 'ولاية منح', nameEn: 'Manah', centerCoords: { lat: 22.7800, lng: 57.5800, heightM: 25000 }, descriptionAr: 'فلج الفيقين وحارة البلاد التاريخية وسد وادي المعيدن.' },
      { id: 'wil_hamra', governorateId: 'gov_dakhiliyah', nameAr: 'ولاية الحمراء', nameEn: 'Al-Hamra', centerCoords: { lat: 23.1200, lng: 57.2800, heightM: 30000 }, descriptionAr: 'سفوح جبل شمس، مسفاة العبريين بنظام مدرجاتها المائية، وبحيرة كهف الهوتة.' },
      { id: 'wil_adam', governorateId: 'gov_dakhiliyah', nameAr: 'ولاية أدم', nameEn: 'Adam', centerCoords: { lat: 22.3800, lng: 57.5200, heightM: 35000 }, descriptionAr: 'بوابة الصحراء والواحات الجنوبية وأفلاج الفليج وحارة بني وائل.' },
      { id: 'wil_izki', governorateId: 'gov_dakhiliyah', nameAr: 'ولاية إزكي', nameEn: 'Izki', centerCoords: { lat: 22.9300, lng: 57.7700, heightM: 25000 }, descriptionAr: 'موقع فلج الملكي الأثري (أقدم الأفلاج الداوودية في عمان).' },
      { id: 'wil_samail', governorateId: 'gov_dakhiliyah', nameAr: 'ولاية سمائل', nameEn: 'Samail', centerCoords: { lat: 23.3100, lng: 57.9500, heightM: 30000 }, descriptionAr: 'وادي سمائل (الفاصل الجيولوجي للحجر) وأفلاج الفلجين وسد الجيلة.' },
      { id: 'wil_bidbid', governorateId: 'gov_dakhiliyah', nameAr: 'ولاية بدبد', nameEn: 'Bidbid', centerCoords: { lat: 23.4100, lng: 58.1200, heightM: 25000 }, descriptionAr: 'ملتقى الأودية الرئيسية وسد وادي فنجاء وعيون فنجاء الحارة.' }
    ]
  },
  {
    id: 'gov_south_batinah',
    nameAr: 'محافظة جنوب الباطنة',
    nameEn: 'South Al-Batinah Governorate',
    capitalAr: 'الرستاق',
    centerCoords: { lat: 23.3900, lng: 57.4200, heightM: 75000 },
    descriptionAr: 'تجمع بين أشهر العيون الكبريتية الحارة (عين الكسفة وعين الثوارة) وفلج الميسر المدرج باليونسكو، ومحطة تحلية بركاء الإستراتيجية.',
    stats: { totalAflaj: 412, totalDams: 12, totalSprings: 54, totalWadis: 28, totalDesalination: 2 },
    wilayats: [
      { id: 'wil_rustaq', governorateId: 'gov_south_batinah', nameAr: 'ولاية الرستاق', nameEn: 'Al-Rustaq', centerCoords: { lat: 23.3900, lng: 57.4200, heightM: 28000 }, descriptionAr: 'تضم عين الكسفة الكبريتية الحارة (45°C)، فلج الميسر اليونسكو، ووادي بني عوف وسايق.' },
      { id: 'wil_awabi', governorateId: 'gov_south_batinah', nameAr: 'ولاية العوابي', nameEn: 'Al-Awabi', centerCoords: { lat: 23.3100, lng: 57.5200, heightM: 25000 }, descriptionAr: 'وادي بني خروص الشهير بوفاض المطر ومدرجات النخيل والأفلاج الحية.' },
      { id: 'wil_nakhal', governorateId: 'gov_south_batinah', nameAr: 'ولاية نخل', nameEn: 'Nakhal', centerCoords: { lat: 23.3900, lng: 57.8300, heightM: 25000 }, descriptionAr: 'عين الثوارة الدافئة المتدفقة من الجبل وقلعة نخل وسد وادي مستل.' },
      { id: 'wil_wadi_maawil', governorateId: 'gov_south_batinah', nameAr: 'ولاية وادي المعاول', nameEn: 'Wadi Al-Maawil', centerCoords: { lat: 23.4700, lng: 57.8700, heightM: 22000 }, descriptionAr: 'أفلاج الواسط وأفلاج الشلي وحصن حبراء.' },
      { id: 'wil_barka', governorateId: 'gov_south_batinah', nameAr: 'ولاية بركاء', nameEn: 'Barka', centerCoords: { lat: 23.7100, lng: 57.8800, heightM: 28000 }, descriptionAr: 'محطة تحلية مياه البحر الكبرى في بركاء وخزان بركاء الإستراتيجي.' },
      { id: 'wil_musanaah', governorateId: 'gov_south_batinah', nameAr: 'ولاية المصنعة', nameEn: 'Al-Musanaah', centerCoords: { lat: 23.7400, lng: 57.5700, heightM: 26000 }, descriptionAr: 'شواطئ زراعية وسدود التغذية على مصبات أودية الحجر.' }
    ]
  },
  {
    id: 'gov_north_batinah',
    nameAr: 'محافظة شمال الباطنة',
    nameEn: 'North Al-Batinah Governorate',
    capitalAr: 'صحار',
    centerCoords: { lat: 24.3400, lng: 56.7000, heightM: 80000 },
    descriptionAr: 'الشريط الزراعي والصناعي الأكبر، يضم وادي الجزي وسد وادي الجزي ومحطة صحار لتحلية مياه البحر وشبكة سدود التغذية الجوفية للسهل الخصيب.',
    stats: { totalAflaj: 298, totalDams: 15, totalSprings: 29, totalWadis: 35, totalDesalination: 2 },
    wilayats: [
      { id: 'wil_sohar', governorateId: 'gov_north_batinah', nameAr: 'ولاية صحار', nameEn: 'Sohar', centerCoords: { lat: 24.3400, lng: 56.7000, heightM: 28000 }, descriptionAr: 'حاضرة شمال الباطنة، وادي الجزي، سد وادي الجزي، ومحطة صحار للتحلية.' },
      { id: 'wil_shinas', governorateId: 'gov_north_batinah', nameAr: 'ولاية شناص', nameEn: 'Shinas', centerCoords: { lat: 24.9000, lng: 56.3300, heightM: 26000 }, descriptionAr: 'أقصى شمال الباطنة، سدود التغذية وقنوات الري والشواطئ.' },
      { id: 'wil_liwa', governorateId: 'gov_north_batinah', nameAr: 'ولاية لوى', nameEn: 'Liwa', centerCoords: { lat: 24.5200, lng: 56.5700, heightM: 24000 }, descriptionAr: 'عين العزم والعيون الجبلية وسد وادي الزهيمي.' },
      { id: 'wil_saham', governorateId: 'gov_north_batinah', nameAr: 'ولاية صحم', nameEn: 'Saham', centerCoords: { lat: 24.1700, lng: 56.8800, heightM: 28000 }, descriptionAr: 'وادي عاهن وسد وادي عاهن للتغذية الجوفية وسهل صحم الزراعي.' },
      { id: 'wil_khaburah', governorateId: 'gov_north_batinah', nameAr: 'ولاية الخابورة', nameEn: 'Al-Khaburah', centerCoords: { lat: 23.9800, lng: 57.1000, heightM: 28000 }, descriptionAr: 'وادي الحواسنة وسد وادي الحواسنة وأفلاج السهول.' },
      { id: 'wil_suwaiq', governorateId: 'gov_north_batinah', nameAr: 'ولاية السويق', nameEn: 'Al-Suwaiq', centerCoords: { lat: 23.8500, lng: 57.4400, heightM: 30000 }, descriptionAr: 'أكبر ولايات الباطنة مساحة وسكاناً، سهول مروية وسدود أودية الجهاور.' }
    ]
  },
  {
    id: 'gov_south_sharqiyah',
    nameAr: 'محافظة جنوب الشرقية',
    nameEn: 'South Al-Sharqiyah Governorate',
    capitalAr: 'صور',
    centerCoords: { lat: 22.5600, lng: 59.5200, heightM: 85000 },
    descriptionAr: 'تحتضن فلج الجيلة المدرج باليونسكو ووادي شاب ووادي طيوي الساحليين، ومحمية السلاحف برأس الحد، ومحطة تحلية صور الإستراتيجية وجزيرة مصيرة.',
    stats: { totalAflaj: 310, totalDams: 9, totalSprings: 31, totalWadis: 25, totalDesalination: 3 },
    wilayats: [
      { id: 'wil_sur', governorateId: 'gov_south_sharqiyah', nameAr: 'ولاية صور', nameEn: 'Sur', centerCoords: { lat: 22.5600, lng: 59.5200, heightM: 30000 }, descriptionAr: 'موقع فلج الجيلة باليونسكو، وادي شاب ووادي طيوي، ومحطة صور للتحلية.' },
      { id: 'wil_jalan_hasan', governorateId: 'gov_south_sharqiyah', nameAr: 'ولاية جعلان بني بو حسن', nameEn: 'Jalan Bani Bu Hassan', centerCoords: { lat: 22.0800, lng: 59.4200, heightM: 28000 }, descriptionAr: 'أفلاج داوودية غنية بالماء وعين جبل قهوان وسد وادي سال.' },
      { id: 'wil_jalan_ali', governorateId: 'gov_south_sharqiyah', nameAr: 'ولاية جعلان بني بو علي', nameEn: 'Jalan Bani Bu Ali', centerCoords: { lat: 22.0200, lng: 59.5300, heightM: 32000 }, descriptionAr: 'الأشخرة وسواحل بحر العرب وسد وادي البطحاء والأودية الرملية.' },
      { id: 'wil_kamil_wafi', governorateId: 'gov_south_sharqiyah', nameAr: 'ولاية الكامل والوافي', nameEn: 'Al-Kamil Wa Al-Wafi', centerCoords: { lat: 22.2500, lng: 59.2000, heightM: 25000 }, descriptionAr: 'واحة مائية محاطة بفلج الكامل وفلج الوافي وسد التغذية الجوفية.' },
      { id: 'wil_masirah', governorateId: 'gov_south_sharqiyah', nameAr: 'ولاية مصيرة', nameEn: 'Masirah Island', centerCoords: { lat: 20.4700, lng: 58.8800, heightM: 45000 }, descriptionAr: 'أكبر جزر السلطنة، عيون ماء دافئة ومحطة تحلية مصيرة والمياه البحرية العميقة.' }
    ]
  },
  {
    id: 'gov_north_sharqiyah',
    nameAr: 'محافظة شمال الشرقية',
    nameEn: 'North Al-Sharqiyah Governorate',
    capitalAr: 'إبراء',
    centerCoords: { lat: 22.6900, lng: 58.5300, heightM: 80000 },
    descriptionAr: 'تتميز بواحة وادي بني خالد الدائمة الجريان وبركها المائية الفيروزية، وحقل آبار رمال الشرقية الإستراتيجي، وأفلاج إبراء والمضيبي.',
    stats: { totalAflaj: 520, totalDams: 11, totalSprings: 38, totalWadis: 30, totalDesalination: 0 },
    wilayats: [
      { id: 'wil_ibra', governorateId: 'gov_north_sharqiyah', nameAr: 'ولاية إبراء', nameEn: 'Ibra', centerCoords: { lat: 22.6900, lng: 58.5300, heightM: 28000 }, descriptionAr: 'حاضرة شمال الشرقية، أفلاج المنزفة التاريخية والقناطر وسد إبراء.' },
      { id: 'wil_mudhaibi', governorateId: 'gov_north_sharqiyah', nameAr: 'ولاية المضيبي', nameEn: 'Al-Mudhaibi', centerCoords: { lat: 22.5800, lng: 58.1300, heightM: 35000 }, descriptionAr: 'وادي عندام أطول أودية عمان وسد وادي عندام وأفلاج سمد الشأن وسناو.' },
      { id: 'wil_bidiya', governorateId: 'gov_north_sharqiyah', nameAr: 'ولاية بدية', nameEn: 'Bidiya', centerCoords: { lat: 22.4500, lng: 58.8000, heightM: 28000 }, descriptionAr: 'الواحات النخيلية في رمال الشرقية، فلج المنترب وحقل آبار الرمال.' },
      { id: 'wil_qabil', governorateId: 'gov_north_sharqiyah', nameAr: 'ولاية القابل', nameEn: 'Al-Qabil', centerCoords: { lat: 22.5800, lng: 58.6900, heightM: 25000 }, descriptionAr: 'فلج المضيرب وفلج الدريز وسدود التغذية الجوفية بالأودية.' },
      { id: 'wil_wadi_bani_khalid', governorateId: 'gov_north_sharqiyah', nameAr: 'ولاية وادي بني خالد', nameEn: 'Wadi Bani Khalid', centerCoords: { lat: 22.6200, lng: 59.0900, heightM: 25000 }, descriptionAr: 'أشهر برك مائية طبيعية دائمة الجريان في السلطنة وعين الصاروج وعين دوه.' },
      { id: 'wil_dima_taiin', governorateId: 'gov_north_sharqiyah', nameAr: 'ولاية دماء والطائيين', nameEn: 'Dima W’attayeen', centerCoords: { lat: 23.0500, lng: 58.7400, heightM: 30000 }, descriptionAr: 'وادي ضيقة ووادي الطائيين وشلالات مقطع والأفلاج الغيلية الجارية.' },
      { id: 'wil_sinaw', governorateId: 'gov_north_sharqiyah', nameAr: 'ولاية سناو', nameEn: 'Sinaw', centerCoords: { lat: 22.4800, lng: 58.0300, heightM: 26000 }, descriptionAr: 'الواحة التجارية العريقة وأفلاج سناو والعيون الصحراوية.' }
    ]
  },
  {
    id: 'gov_dhahirah',
    nameAr: 'محافظة الظاهرة',
    nameEn: 'Al-Dhahirah Governorate',
    capitalAr: 'عبري',
    centerCoords: { lat: 23.2300, lng: 56.5100, heightM: 90000 },
    descriptionAr: 'تحتضن حوض المسرات المائي (أكبر مشروع إمداد مائي جوفي بالسلطنة) وأفلاج عبري التاريخية وسد وادي سرور وسد السليف.',
    stats: { totalAflaj: 395, totalDams: 10, totalSprings: 22, totalWadis: 22, totalDesalination: 0 },
    wilayats: [
      { id: 'wil_ibri', governorateId: 'gov_dhahirah', nameAr: 'ولاية عبري', nameEn: 'Ibri', centerCoords: { lat: 23.2300, lng: 56.5100, heightM: 35000 }, descriptionAr: 'حاضرة الظاهرة، حقل آبار حوض المسرات المائي، سد وادي الكبير، وأفلاج السليف.' },
      { id: 'wil_yanqul', governorateId: 'gov_dhahirah', nameAr: 'ولاية ينقل', nameEn: 'Yanqul', centerCoords: { lat: 23.5900, lng: 56.5500, heightM: 28000 }, descriptionAr: 'أفلاج الوقبة وفلج ينقل وسد وادي بيح والعيون الجبلية.' },
      { id: 'wil_dhank', governorateId: 'gov_dhahirah', nameAr: 'ولاية ضنك', nameEn: 'Dhank', centerCoords: { lat: 23.5300, lng: 56.2800, heightM: 26000 }, descriptionAr: 'وادي فدا الدائم ومساقط وادي ضنك وأفلاج دوت والمحاريق.' }
    ]
  },
  {
    id: 'gov_buraimi',
    nameAr: 'محافظة البريمي',
    nameEn: 'Al-Buraimi Governorate',
    capitalAr: 'البريمي',
    centerCoords: { lat: 24.2500, lng: 55.7600, heightM: 70000 },
    descriptionAr: 'بوابة الشمال الغربي، تضم فلج الصعراني (أقدم فلج جرى ترميمه وإحياؤه)، وفلج البريمي وسد وادي مصيق وسد وادي الجزي الغربي.',
    stats: { totalAflaj: 142, totalDams: 8, totalSprings: 16, totalWadis: 14, totalDesalination: 0 },
    wilayats: [
      { id: 'wil_buraimi', governorateId: 'gov_buraimi', nameAr: 'ولاية البريمي', nameEn: 'Al-Buraimi', centerCoords: { lat: 24.2500, lng: 55.7600, heightM: 26000 }, descriptionAr: 'فلج الصعراني الأثري وفلج البرانكة وواحات النخيل المروية القديمة.' },
      { id: 'wil_mahdah', governorateId: 'gov_buraimi', nameAr: 'ولاية محضة', nameEn: 'Mahdah', centerCoords: { lat: 24.4000, lng: 55.9800, heightM: 30000 }, descriptionAr: 'سد وادي محضة ووادي القحفي وأفلاج الجويف وشرم.' },
      { id: 'wil_sunaynah', governorateId: 'gov_buraimi', nameAr: 'ولاية السنينة', nameEn: 'Al-Sunaynah', centerCoords: { lat: 23.8500, lng: 55.7700, heightM: 28000 }, descriptionAr: 'الواحات الرملية والآبار ومشاريع الزراعة الحديثة على المياه الجوفية.' }
    ]
  },
  {
    id: 'gov_wusta',
    nameAr: 'محافظة الوسطى',
    nameEn: 'Al-Wusta Governorate',
    capitalAr: 'هيما',
    centerCoords: { lat: 19.9500, lng: 56.2700, heightM: 130000 },
    descriptionAr: 'المحافظة الأوسع جغرافياً، تشتهر ببحيرة ومحمية الأراضي الرطبة في محوت (بر الحكمان) ومحطة تحلية الدقم ومكامن المياه العميقة لجدة الحراسيس.',
    stats: { totalAflaj: 8, totalDams: 2, totalSprings: 11, totalWadis: 18, totalDesalination: 3 },
    wilayats: [
      { id: 'wil_hayma', governorateId: 'gov_wusta', nameAr: 'ولاية هيما', nameEn: 'Hayma', centerCoords: { lat: 19.9500, lng: 56.2700, heightM: 35000 }, descriptionAr: 'حاضرة الوسطى ومكامن مياه جدة الحراسيس ومحطة تحلية هيما المركزية.' },
      { id: 'wil_mahout', governorateId: 'gov_wusta', nameAr: 'ولاية محوت', nameEn: 'Mahout', centerCoords: { lat: 20.7300, lng: 58.0700, heightM: 32000 }, descriptionAr: 'محمية الأراضي الرطبة، بر الحكمان، وخليج مصيرة وبحيرات الملح والطيور.' },
      { id: 'wil_duqm', governorateId: 'gov_wusta', nameAr: 'ولاية الدقم', nameEn: 'Duqm', centerCoords: { lat: 19.6600, lng: 57.7000, heightM: 32000 }, descriptionAr: 'ميناء الدقم العالمي ومحطة تحلية مياه البحر بسعة 36 ألف م³/يوم وسد وادي جرف وسد وادي صاي.' },
      { id: 'wil_jazer', governorateId: 'gov_wusta', nameAr: 'ولاية الجازر', nameEn: 'Al-Jazer', centerCoords: { lat: 18.7200, lng: 56.5500, heightM: 35000 }, descriptionAr: 'الساحل الجنوبي للوسطى ومحمية صخرية ومحطة تحلية الكحل واللكبي.' }
    ]
  }
];

// 3. Scientifically Verified & Official Omani Water Features Database
export const INITIAL_WATER_FEATURES: WaterFeature[] = [
  // --- 1. AFLAJ (UNESCO & Major) ---
  {
    id: 'falaj_daris',
    nameAr: 'فلج دارس (التراث العالمي لليونسكو)',
    nameEn: 'Falaj Daris (UNESCO World Heritage)',
    category: 'aflaj',
    subTypeAr: 'فلج داوودي (نفق باطني عميق)',
    governorateId: 'gov_dakhiliyah',
    wilayatId: 'wil_nizwa',
    villageOrLocationAr: 'مدينة نزوى - شريعة فلج دارس',
    coordinates: { lat: 22.9460, lng: 57.5400, altitudeM: 485 },
    descriptionAr: 'أكبر فلج في سلطنة عُمان على الإطلاق من حيث كمية التدفق ومساحة البساتين المروية، أدرجته منظمة اليونسكو عام 2006 ضمن قائمة التراث العالمي كأحد خمسة أفلاج عمانية تمثل عبقرية إدارة المياه.',
    hydrologicalProperties: {
      waterTypeAr: 'داوودي (قناة جوفية محفورة)',
      flowRateLps: 215, // تدفق متوسط باللتر/ثانية
      salinityPpm: 320, // مياه عذبة جداً
      distributionNetworkKm: 12.5,
      temperatureC: 26.5
    },
    historicalSignificanceAr: 'يعود حفره إلى عهود تاريخية ضاربة في القدم قبل الإسلام، ويرتبط ارتباطاً وثيقاً بدور نزوى التاريخي كعاصمة سياسية وعلمية لعمان.',
    economicSignificanceAr: 'يروي أكثر من 170 ألف نخلة وبساتين الموز والليمون، ويعتمد عليه اقتصاد الواحة الزراعية والسكاني بالكامل.',
    agriculturalSignificanceAr: 'نظام تقسيم زمني صارم للمياه بالأثر والبادورة وحصص الوقف والملك الفردي.',
    ecologicalSignificanceAr: 'يوفر بيئة مائية مستدامة للمنتزه الطبيعي المحيط بشريعة الفلج والطيور المقيمة.',
    unescoListed: true,
    documentationStatus: 'officially_verified',
    officialSource: 'وزارة الثروة الزراعية والسمكية وموارد المياه - دائرة الأفلاج / ملف اليونسكو 1207',
    lastUpdatedDate: '2026-03-15',
    imageUrls: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80'],
    model3DType: 'falaj_channel',
    referenceCitations: [
      'سجل التراث العالمي لليونسكو (Ref: 1207: The Aflaj Irrigation Systems of Oman)',
      'الأطلس المائي لسلطنة عمان - وزارة موارد المياه',
      'دراسات جامعة السلطان قابوس في الهيدرولوجيا التراثية'
    ],
    educationalNotesAr: 'منهاج الصف العاشر (هذا وطني): الأفلاج العمانية نظام هندسي مائي متكامل يقسم الماء بالعدل والتراضي، ومنهاج الصف الحادي عشر (الجغرافيا وتقنيات المياه).'
  },
  {
    id: 'falaj_khatmeen',
    nameAr: 'فلج الخطمين (التراث العالمي لليونسكو)',
    nameEn: 'Falaj Al-Khatmeen (UNESCO World Heritage)',
    category: 'aflaj',
    subTypeAr: 'فلج داوودي',
    governorateId: 'gov_dakhiliyah',
    wilayatId: 'wil_nizwa',
    villageOrLocationAr: 'نيابة بركة الموز - أمام حصن بيت الرديدة',
    coordinates: { lat: 22.9220, lng: 57.6710, altitudeM: 520 },
    descriptionAr: 'أحد الأفلاج الخمسة المدرجة على قائمة التراث العالمي، يمر مساره التاريخي داخل حصن بيت الرديدة وبركة الموز، ويشتهر بتقسيم مياهه الهندسي المتقن إلى ثلاثة أفرع متساوية التدفق عند نقطة التوزيع.',
    hydrologicalProperties: {
      waterTypeAr: 'داوودي',
      flowRateLps: 85,
      salinityPpm: 290,
      distributionNetworkKm: 4.8
    },
    historicalSignificanceAr: 'بناه اليعاربة وأصلحه أئمة عُمان في القرن السابع عشر الميلادي كجزء من ازدهار الزراعة والعمارة العسكرية في بركة الموز.',
    economicSignificanceAr: 'يسقي بساتين النخيل والموز والمدرجات الخضراء في مدخل الجبل الأخضر.',
    agriculturalSignificanceAr: 'نظام الشريعة المزدوجة لتأمين الاستخدام المنزلي والزراعي دون تلوث المياه.',
    ecologicalSignificanceAr: 'يحافظ على واحة النخيل الوارفة عند ملتقى سفوح جبال الحجر.',
    unescoListed: true,
    documentationStatus: 'officially_verified',
    officialSource: 'وزارة الثروة الزراعية وموارد المياه - منظمة اليونسكو',
    lastUpdatedDate: '2026-02-10',
    imageUrls: ['https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80'],
    model3DType: 'falaj_channel',
    referenceCitations: ['ملف ترشيح أفلاج عمان لليونسكو 2006', 'كتاب شريان الحياة: الأفلاج في عمان'],
    educationalNotesAr: 'منهاج الدراسات الاجتماعية الصف التاسع: العمارة الدفاعية وشبكات المياه المرتبطة بالحصون.'
  },
  {
    id: 'falaj_malki',
    nameAr: 'فلج الملكي (التراث العالمي لليونسكو)',
    nameEn: 'Falaj Al-Malki (UNESCO World Heritage)',
    category: 'aflaj',
    subTypeAr: 'فلج داوودي (متعدد السواعد)',
    governorateId: 'gov_dakhiliyah',
    wilayatId: 'wil_izki',
    villageOrLocationAr: 'ولاية إزكي - النزار واليمن',
    coordinates: { lat: 22.9350, lng: 57.7730, altitudeM: 540 },
    descriptionAr: 'من أقدم وأعظم الأفلاج الداوودية في عُمان، يضم 17 ساعداً (قناة تغذية جوفية) تمتد لأميال في باطن الأرض لتجميع مياه وادي حلفين ووادي إزكي، مدرج على لائحة اليونسكو.',
    hydrologicalProperties: {
      waterTypeAr: 'داوودي متعدد السواعد',
      flowRateLps: 110,
      salinityPpm: 340,
      distributionNetworkKm: 15.2
    },
    historicalSignificanceAr: 'تنسب الروايات التاريخية حفر أصوله لمالك بن فهم الأزدي، ويعد شاهداً حياً على حضارة الري واستقرار القبائل العربية في عُمان.',
    economicSignificanceAr: 'يروي أراضي ولاية إزكي التاريخية وحارتي اليمن والنزار.',
    agriculturalSignificanceAr: 'شبكة قنوات متفرعة تعتمد على الجاذبية الأرضية البحتة دون أي طاقة ميكانيكية.',
    ecologicalSignificanceAr: 'مستودع أثري وبيئي لتاريخ الري في شبه الجزيرة العربية.',
    unescoListed: true,
    documentationStatus: 'officially_verified',
    officialSource: 'وزارة الثروة الزراعية وموارد المياه - التراث العالمي',
    lastUpdatedDate: '2026-01-20',
    imageUrls: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80'],
    model3DType: 'falaj_channel',
    referenceCitations: ['وزارة البلديات الإقليمية وموارد المياه (2006) - ملف اليونسكو'],
    educationalNotesAr: 'هذا وطني الصف الثاني عشر: دور الأفلاج في نشأة المدن والقرى العمانية واستقرارها.'
  },
  {
    id: 'falaj_muyassar',
    nameAr: 'فلج الميسر (التراث العالمي لليونسكو)',
    nameEn: 'Falaj Al-Muyassar (UNESCO World Heritage)',
    category: 'aflaj',
    subTypeAr: 'فلج عيني / داوودي',
    governorateId: 'gov_south_batinah',
    wilayatId: 'wil_rustaq',
    villageOrLocationAr: 'ولاية الرستاق - حارة الميسر',
    coordinates: { lat: 23.3980, lng: 57.4320, altitudeM: 320 },
    descriptionAr: 'فلج عميق مدرج باليونسكو، يمتاز بقوة تدفقه وموقعه الإستراتيجي قرب قلعة الرستاق، وقد تميز مهندسوه بقدرتهم على استخراج الماء من عمق يصل إلى 50 متراً تحت سطح الأرض.',
    hydrologicalProperties: {
      waterTypeAr: 'عيني / داوودي',
      flowRateLps: 160,
      salinityPpm: 310,
      distributionNetworkKm: 8.4
    },
    historicalSignificanceAr: 'لعب دوراً حاسماً في إمداد قلعة الرستاق وعاصمة أئمة اليعاربة بالمياه أثناء الحصارات التاريخية.',
    economicSignificanceAr: 'شريان بساتين النخيل والليمون الرستاقي الأصيل.',
    agriculturalSignificanceAr: 'توزيع المياه بنظام النجوم الفلكية ليلاً والمزولة الشمسية نهاراً.',
    ecologicalSignificanceAr: 'مصدر للمياه المتجددة النقية من صخور جبال الحجر الغربي.',
    unescoListed: true,
    documentationStatus: 'officially_verified',
    officialSource: 'دائرة الأفلاج - وزارة الثروة الزراعية وموارد المياه',
    lastUpdatedDate: '2026-02-15',
    imageUrls: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80'],
    model3DType: 'falaj_channel',
    referenceCitations: ['منظمة اليونسكو - وثائق التراث الثقافي 2006'],
    educationalNotesAr: 'العلوم والفيزياء الصف العاشر: التطبيقات الفلكية في قياس وقت الأفلاج العمانية.'
  },
  {
    id: 'falaj_jeela',
    nameAr: 'فلج الجيلة (التراث العالمي لليونسكو)',
    nameEn: 'Falaj Al-Jeela (UNESCO World Heritage)',
    category: 'aflaj',
    subTypeAr: 'فلج عيني جبلي معلق',
    governorateId: 'gov_south_sharqiyah',
    wilayatId: 'wil_sur',
    villageOrLocationAr: 'قرية الجيلة الجبلية - طيوي (جبال الحجر الشرقي)',
    coordinates: { lat: 22.7840, lng: 59.1830, altitudeM: 1040 },
    descriptionAr: 'معجزة معمارية فريدة تقع على ارتفاع يتجاوز 1000 متر في جبال الحجر الشرقي؛ نحتت قنواته في حافة الجرف الصخري الصلب شاهق الانحدار لإيصال مياه العين الجبلية إلى المدرجات الزراعية.',
    hydrologicalProperties: {
      waterTypeAr: 'عيني جبلي منحوت بالصخر',
      flowRateLps: 42,
      salinityPpm: 180, // عذوبة فائقة كالمياه المقطرة
      distributionNetworkKm: 2.2
    },
    historicalSignificanceAr: 'وثيقة حية على قدرة العماني القديم على قهر الطبيعة الجبلية الوعرة واستيطان قمم الجبال.',
    economicSignificanceAr: 'مصدر الحياة الوحيد لقرية الجيلة الأثرية ومزارعها المعلقة.',
    agriculturalSignificanceAr: 'ري مدرجات زراعية ضيقة محفورة في الصخور الجيرية.',
    ecologicalSignificanceAr: 'نظام بيئي منعزل يحافظ على نقاوة المياه الطبيعية.',
    unescoListed: true,
    documentationStatus: 'officially_verified',
    officialSource: 'ملف اليونسكو المعتمد 2006 / وزارة الثروة الزراعية وموارد المياه',
    lastUpdatedDate: '2026-03-01',
    imageUrls: ['https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1000&q=80'],
    model3DType: 'falaj_channel',
    referenceCitations: ['اليونسكو - تقارير الحفاظ على الأفلاج الجبلية'],
    educationalNotesAr: 'الجغرافيا الصف الحادي عشر: التكيف البشري مع البيئات الجبلية شديدة الوعورة.'
  },

  // --- 2. DAMS (Major Surface & Recharge Dams) ---
  {
    id: 'dam_wadi_dayqah',
    nameAr: 'سد وادي ضيقة (أضخم سد مائي في سلطنة عُمان)',
    nameEn: 'Wadi Dayqah Dam (Largest Dam in Oman)',
    category: 'dams',
    subTypeAr: 'سد تخزيني خرساني مدكوك (RCC)',
    governorateId: 'gov_muscat',
    wilayatId: 'wil_qurayyat',
    villageOrLocationAr: 'ولاية قريات - قرية المزارع',
    coordinates: { lat: 23.0900, lng: 58.8500, altitudeM: 135 },
    descriptionAr: 'أضخم مشروع هندسي مائي في تاريخ سلطنة عُمان، تبلغ سعته التخزينية 100 مليون متر مكعب من المياه، يرتفع السد الرئيسي 75 متراً بطول 400 متر، ويسهم في تزويد ولايتي قريات ومسقط بمياه الشرب والري.',
    hydrologicalProperties: {
      waterTypeAr: 'سد تخزين سطحي وتغذية',
      capacityMillionM3: 100, // 100 مليون م³
      storageCapacityM3: 100000000,
      damHeightM: 75,
      damLengthM: 400,
      catchmentAreaKm2: 1700,
      spillwayTypeAr: 'مفيض متدرج مدرج خرساني ذو تصريف حر'
    },
    historicalSignificanceAr: 'افتتح عام 2012 كأحد المشاريع الاستراتيجية الكبرى للأمن المائي الوطني في عُمان.',
    economicSignificanceAr: 'يضخ ما يقارب 35 مليون م³ سنوياً من مياه الشرب النظيفة لمحافظة مسقط وقريات، مما يقلل الاعتماد على الطاقة في التحلية.',
    agriculturalSignificanceAr: 'تأمين المياه لقرى وادي ضيقة وبساتين النخيل في قريات.',
    ecologicalSignificanceAr: 'شكل بحيرة مائية ساحرة تحتضن طيوراً مهاجرة ومتنزهاً وطنياً يزوره مئات الآلاف سنوياً.',
    documentationStatus: 'officially_verified',
    officialSource: 'الشركة العمانية لخدمات المياه والصرف الصحي (نماء) / وزارة الثروة الزراعية وموارد المياه',
    lastUpdatedDate: '2026-03-20',
    imageUrls: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80'],
    model3DType: 'dam',
    referenceCitations: [
      'التقارير السنوية لوزارة الثروة الزراعية والسمكية وموارد المياه',
      'دليل السدود المائية في سلطنة عمان (نماء لخدمات المياه)'
    ],
    educationalNotesAr: 'منهاج هذا وطني الصف الثاني عشر: الأمن المائي العماني ومشروعات السدود الإستراتيجية الكبرى.'
  },
  {
    id: 'dam_wadi_khoudh',
    nameAr: 'سد وادي الخوض (سد التغذية الجوفية الإستراتيجي)',
    nameEn: 'Wadi Al-Khoudh Recharge Dam',
    category: 'dams',
    subTypeAr: 'سد ركامي ذو قلب ترابي للتغذية الجوفية',
    governorateId: 'gov_muscat',
    wilayatId: 'wil_seeb',
    villageOrLocationAr: 'ولاية السيب - منطقة الخوض القديمة',
    coordinates: { lat: 23.5900, lng: 58.1500, altitudeM: 65 },
    descriptionAr: 'أحد أقدم وأهم سدود التغذية الجوفية في محافظة مسقط، شيد عام 1985 بسعة تخزينية تبلغ 11.6 مليون متر مكعب لاحتجاز فيضانات وادي الخوض وحقنها في الخزان الجوفي لسهل الباطنة لمنع تداخل مياه البحر.',
    hydrologicalProperties: {
      waterTypeAr: 'سد تغذية جوفية وحماية',
      capacityMillionM3: 11.6,
      storageCapacityM3: 11600000,
      damHeightM: 11,
      damLengthM: 7100, // سد ترابي طويل
      catchmentAreaKm2: 1800
    },
    historicalSignificanceAr: 'من أوائل السدود التي دشنت حقبة مشاريع الأمن المائي الحديثة في عهد النهضة المباركة.',
    economicSignificanceAr: 'حماية المنشآت الحضرية في السيب وجامعة السلطان قابوس من الفيضانات العارمة.',
    agriculturalSignificanceAr: 'رفع منسوب المياه الجوفية في آبار مزارع السيب والخابورة والشرادي.',
    ecologicalSignificanceAr: 'إعادة إحياء واحة الخوض القديمة ومجاري الأفلاج والعيون المجاورة.',
    documentationStatus: 'officially_verified',
    officialSource: 'دائرة السدود - وزارة الثروة الزراعية وموارد المياه',
    lastUpdatedDate: '2026-02-18',
    imageUrls: ['https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80'],
    model3DType: 'dam',
    referenceCitations: ['كتاب السدود في سلطنة عمان 1985-2020'],
    educationalNotesAr: 'الجغرافيا الصف التاسع: ظاهرة تداخل مياه البحر (Saline Intrusion) ودور سدود التغذية في مكافحتها.'
  },
  {
    id: 'dam_salalah_protection',
    nameAr: 'سد وادي عدونب وحماية صلالة',
    nameEn: 'Wadi Adonib Flood Protection Dam (Salalah)',
    category: 'dams',
    subTypeAr: 'سد حماية من مخاطر الفيضانات والأنواء المناخية',
    governorateId: 'gov_dhofar',
    wilayatId: 'wil_salalah',
    villageOrLocationAr: 'ولاية صلالة - منطقة ريسوت',
    coordinates: { lat: 16.9800, lng: 53.9700, altitudeM: 95 },
    descriptionAr: 'شيد ضمن منظومة الحماية من مخاطر الأعاصير المدارية (مثل إعصار مكونو وإعصار تيج)، تبلغ سعته التخزينية أكثر من 83 مليون متر مكعب لدرء مخاطر الفيضانات عن ميناء صلالة والمنطقة الحرة وسكان المدينة.',
    hydrologicalProperties: {
      waterTypeAr: 'سد حماية من الفيضانات وتخزين',
      capacityMillionM3: 83.3,
      damHeightM: 68,
      damLengthM: 386
    },
    historicalSignificanceAr: 'مشروع إستراتيجي نفذ استجابة للتغيرات المناخية وتواتر الأعاصير في بحر العرب.',
    economicSignificanceAr: 'يحمي ميناء صلالة أحد أهم الموانئ المحورية في العالم واستثمارات بمليارات الريالات.',
    agriculturalSignificanceAr: 'تصريف المياه الفائضة تدريجياً لترشيحها في خزان صلالة الساحلي.',
    ecologicalSignificanceAr: 'الحد من جرف التربة الزراعية والغطاء النباتي أثناء الأنواء الاستثنائية.',
    documentationStatus: 'officially_verified',
    officialSource: 'وزارة الثروة الزراعية وموارد المياه / محافظة ظفار',
    lastUpdatedDate: '2026-03-05',
    imageUrls: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80'],
    model3DType: 'dam',
    referenceCitations: ['المكتب الفني لإدارة الطوارئ ومخاطر الفيضانات بظفار'],
    educationalNotesAr: 'هذا وطني الصف الثاني عشر: استجابة سلطنة عمان للتغيرات المناخية وإدارة الطوارئ الوطنية.'
  },

  // --- 3. SPRINGS & GEOTHERMAL (العيون والينابيع) ---
  {
    id: 'spring_ain_kasfa',
    nameAr: 'عين الكسفة (الينبوع الكبريتي الحار)',
    nameEn: 'Ain Al-Kasfa Geothermal Sulfur Spring',
    category: 'springs',
    subTypeAr: 'عين كبريتية حارة جيوحرارية (45°C)',
    governorateId: 'gov_south_batinah',
    wilayatId: 'wil_rustaq',
    villageOrLocationAr: 'وسط مدينة الرستاق',
    coordinates: { lat: 23.3910, lng: 57.4260, altitudeM: 310 },
    descriptionAr: 'أشهر عين كبريتية حارة طبيعية في سلطنة عُمان، تتدفق مياهها الجوفية العميقة بدرجة حرارة ثابتة تبلغ 45 درجة مئوية على مدار العام، غنية بالأملاح الكبريتية والمعادن الاستشفائية، وتسهم في ري بساتين الرستاق عبر عدة أفلاج أشهرها فلج الحمام.',
    hydrologicalProperties: {
      waterTypeAr: 'مياه كبريتية جيوحرارية قلوية خفيفة',
      temperatureC: 45, // 45°C ثابتة
      flowRateLps: 90,
      salinityPpm: 1250
    },
    historicalSignificanceAr: 'موقع استشفائي وتاريخي شهير زاره المؤرخون والرحالة منذ مئات السنين.',
    economicSignificanceAr: 'مركز جذب للسياحة العلاجية والبيئية في جنوب الباطنة.',
    agriculturalSignificanceAr: 'تبرد مياهها في قنوات خاصة وتستخدم في ري أشجار النخيل والحمضيات.',
    ecologicalSignificanceAr: 'دلالة جيولوجية على عمق الدوران المائي عبر صدوع صخور الأفيوليت وجبال الحجر.',
    documentationStatus: 'officially_verified',
    officialSource: 'دائرة الموارد المائية بجنوب الباطنة / وزارة التراث والسياحة',
    lastUpdatedDate: '2026-03-12',
    imageUrls: ['https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80'],
    model3DType: 'spring',
    referenceCitations: ['الخصائص الهيدروكيميائية للعيون الحارة في سلطنة عمان - جامعة السلطان قابوس'],
    educationalNotesAr: 'العلوم والجيولوجيا الصف العاشر: الطاقة الجيوحرارية وتيارات المياه الصاعدة عبر الصدوع التكتونية.'
  },
  {
    id: 'spring_ain_thawarah',
    nameAr: 'عين الثوارة (نبع نخل الطبيعي)',
    nameEn: 'Ain Ath-Thawarah Natural Spring',
    category: 'springs',
    subTypeAr: 'عين مائية معدنية دافئة',
    governorateId: 'gov_south_batinah',
    wilayatId: 'wil_nakhal',
    villageOrLocationAr: 'ولاية نخل - قرية الثوارة عند سفح جبل نخل',
    coordinates: { lat: 23.3780, lng: 57.8290, altitudeM: 335 },
    descriptionAr: 'نبع مائي دافئ دائم الجريان ينبثق بغزارة من بين صخور وادي الأبيض عند أقدام جبل نخل، يتميز بنقاوة مياهه المعدنية وتدفقه المستمر الذي يغذي وادي الثوارة وبساتين نخيل ولاية نخل العريقة.',
    hydrologicalProperties: {
      waterTypeAr: 'معدنية دافئة كربوناتية',
      temperatureC: 38.5,
      flowRateLps: 75,
      salinityPpm: 420
    },
    historicalSignificanceAr: 'شريان واحة نخل المائية وقلعتها التاريخية وحصونها الدفاعية.',
    economicSignificanceAr: 'أحد أكثر المواقع السياحية ارتياداً في عطلات نهاية الأسبوع ومقصد سياحي عائلي رئيسي.',
    agriculturalSignificanceAr: 'تغذي مباشرة فلج الثوارة وفلج العالي لري النخيل والفاكهة.',
    ecologicalSignificanceAr: 'واحة طبيعية دائمة الخضرة وموئل للأسماك النهرية العمانية الصغيرة.',
    documentationStatus: 'officially_verified',
    officialSource: 'وزارة الثروة الزراعية والسمكية وموارد المياه',
    lastUpdatedDate: '2026-02-25',
    imageUrls: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80'],
    model3DType: 'spring',
    referenceCitations: ['دراسة هيدرولوجية نبع عين الثوارة - وزارة الموارد المائية'],
    educationalNotesAr: 'الجغرافيا الصف الثامن: توزيع الواحات والينابيع المائية في سفوح جبال عمان.'
  },
  {
    id: 'spring_ain_darbat',
    nameAr: 'عين وشلالات وادي دربات',
    nameEn: 'Ain Darbat & Waterfalls (Dhofar)',
    category: 'springs',
    subTypeAr: 'عين كارستية دائمة تتفجر شلالاتها في الخريف',
    governorateId: 'gov_dhofar',
    wilayatId: 'wil_taqah',
    villageOrLocationAr: 'ولاية طاقة - وادي دربات بجبل سمحان',
    coordinates: { lat: 17.1000, lng: 54.4500, altitudeM: 260 },
    descriptionAr: 'من أعظم الظواهر المائية في شبه الجزيرة العربية؛ تنبع المياه من تجاويف الحجر الجيري الكارستي في جبل سمحان لتشكل نهراً وبحيرة عذبة تمتد لكيلومترات وسط الغابات، وتنحدر في موسم الخريف لتشكل شلالات دربات المهيبة بارتفاع يفوق 100 متر.',
    hydrologicalProperties: {
      waterTypeAr: 'كارستية عذبة جيرية',
      flowRateLps: 350,
      salinityPpm: 210,
      temperatureC: 24.0
    },
    historicalSignificanceAr: 'شكلت مقصداً تاريخياً لتجارة اللبان القديمة حيث تنحدر مياهها نحو ميناء سمهرم التاريخي (خور روري).',
    economicSignificanceAr: 'الوجهة السياحية البيئية الأولى في سلطنة عُمان خلال موسم الخريف السياحي.',
    agriculturalSignificanceAr: 'ري المراعي الطبيعية الشاسعة للثروة الحيوانية والإبل والأبقار الظفارية.',
    ecologicalSignificanceAr: 'نظام بيئي فريد لشبه الجزيرة العربية يضم غابات خضراء استوائية وشلالات الترافرتين الجيري.',
    documentationStatus: 'officially_verified',
    officialSource: 'وزارة الثروة الزراعية وموارد المياه - المديرية العامة بظفار',
    lastUpdatedDate: '2026-03-22',
    imageUrls: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80'],
    model3DType: 'spring',
    referenceCitations: ['الدراسات الهيدرولوجية لحوض وادي دربات - وزارة موارد المياه'],
    educationalNotesAr: 'هذا وطني الصف العاشر: المناخ الموسمي في ظفار وأثره على التدفق المائي والغطاء النباتي.'
  },

  // --- 4. WADIS (الأودية الكبرى) ---
  {
    id: 'wadi_bani_khalid',
    nameAr: 'وادي بني خالد (واحة البرك المائية الفيروزية)',
    nameEn: 'Wadi Bani Khalid Permanent Stream & Pools',
    category: 'wadis',
    subTypeAr: 'مجرى مائي دائم الجريان في خوانق الحجر الجيري',
    governorateId: 'gov_north_sharqiyah',
    wilayatId: 'wil_wadi_bani_khalid',
    villageOrLocationAr: 'ولاية وادي بني خالد - مقل',
    coordinates: { lat: 22.5850, lng: 59.0880, altitudeM: 610 },
    descriptionAr: 'من أشهر وأجمل أودية سلطنة عُمان، يتميز بجريانه المائي الدائم طوال شهور العام عبر برك مائية طبيعية فيروزية عميقة محاطة بجدران الحجر الجيري الأبيض وكهف مقل الشهير.',
    hydrologicalProperties: {
      waterTypeAr: 'مجرى سطحي دائم من ينابيع كلسية',
      flowRateLps: 180,
      salinityPpm: 260
    },
    historicalSignificanceAr: 'مركز استيطان قديم اشتهر بنظام الأفلاج الغيلية واستصلاح المدرجات الصخرية.',
    economicSignificanceAr: 'موقع سياحي عالمي يستقبل مئات الآلاف من الزوار ومصدر دخل رئيسي للمجتمع المحلي.',
    agriculturalSignificanceAr: 'يسقي بساتين النخيل والمانجو والموز في قرى مقل وبضعة وحارة الصوار.',
    ecologicalSignificanceAr: 'بيئة مائية نقية تحتضن الأسماك الطبيعية والتكوينات الكارستية النشطة.',
    documentationStatus: 'officially_verified',
    officialSource: 'وزارة الثروة الزراعية وموارد المياه / وزارة التراث والسياحة',
    lastUpdatedDate: '2026-03-10',
    imageUrls: ['https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1000&q=80'],
    referenceCitations: ['أطلس المواقع السياحية الطبيعية في سلطنة عمان'],
    educationalNotesAr: 'الجغرافيا الصف التاسع: الأودية الدائمة والموسمية والفارق الهيدرولوجي بينها في عمان.'
  },
  {
    id: 'wadi_shab',
    nameAr: 'وادي شاب (أخدود المياه العذبة الساحلي)',
    nameEn: 'Wadi Shab Coastal Canyon',
    category: 'wadis',
    subTypeAr: 'أخدود وادي ساحلي يصب في بحر عمان',
    governorateId: 'gov_south_sharqiyah',
    wilayatId: 'wil_sur',
    villageOrLocationAr: 'نيابة طيوي - مصب وادي شاب',
    coordinates: { lat: 22.8400, lng: 59.2450, altitudeM: 15 },
    descriptionAr: 'أخدود مائي ساحلي مبهر يلتقي فيه لسان البحر المالح ببرك المياه العذبة المنسابة من أعالي جبال الحجر الشرقي، ويشتهر بمسار المشي الجبلي والكهف المائي الغارق مع الشلال الداخلي.',
    hydrologicalProperties: {
      waterTypeAr: 'عذب ساحلي مع تدرج ملوحة عند المصب',
      catchmentAreaKm2: 320
    },
    historicalSignificanceAr: 'شكل مع وادي طيوي محطات إمداد مائي تاريخية للسفن التجارية العابرة لبحر عمان.',
    economicSignificanceAr: 'أحد أشهر معالم سياحة المغامرات عالمياً ومصنف في كبرى مجلات السفر العالمية.',
    agriculturalSignificanceAr: 'بساتين نخيل وليمون معلقة تروى بالأفلاج والبرك العلوية.',
    ecologicalSignificanceAr: 'تنوع أحيائي شاطئي ونهري فريد في منطقة التقاء المياه العذبة بالمالحة.',
    documentationStatus: 'officially_verified',
    officialSource: 'وزارة الثروة الزراعية والسمكية وموارد المياه',
    lastUpdatedDate: '2026-02-28',
    imageUrls: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80'],
    referenceCitations: ['المسح الجيومورفولوجي لسواحل الشرقية - مجلة العلوم الجغرافية'],
    educationalNotesAr: 'الدراسات الاجتماعية: أشكال التضاريس الساحلية والأخاديد المائية في عمان.'
  },

  // --- 5. DESALINATION PLANTS (محطات تحلية مياه البحر الكبرى) ---
  {
    id: 'desal_barka',
    nameAr: 'مجمع محطات تحلية مياه البحر ببركاء',
    nameEn: 'Barka Sea Water Desalination Complex',
    category: 'desalination',
    subTypeAr: 'محطة تحلية مياه البحر بالتناضح العكسي (SWRO)',
    governorateId: 'gov_south_batinah',
    wilayatId: 'wil_barka',
    villageOrLocationAr: 'ساحل ولاية بركاء',
    coordinates: { lat: 23.7050, lng: 57.9250, altitudeM: 5 },
    descriptionAr: 'أكبر مجمع لإنتاج مياه الشرب المحلاة في سلطنة عُمان، يضم محطات بركاء (1، 2، 4، 5) بطاقة إنتاجية إجمالية تتجاوز 650 ألف متر مكعب يومياً، يغذي شبكة نقل المياه الموحدة لمحافظات مسقط وجنوب وشمال الباطنة والداخلية.',
    hydrologicalProperties: {
      waterTypeAr: 'مياه شرب محلاة بمواصفات عمانية ودولية',
      dailyProductionM3: 650000, // 650 ألف م³/يوم
      salinityPpm: 150 // مياه منخفضة الأملاح مضاف لها المعادن المفيدة
    },
    historicalSignificanceAr: 'عماد الثورة المائية الحديثة في السلطنة مع التحول لمحطات التناضح العكسي الموفرة للطاقة.',
    economicSignificanceAr: 'تأمين إمدادات الشرب لأكثر من 2.5 مليون نسمة وكبرى المناطق الصناعية والتجارية.',
    agriculturalSignificanceAr: 'تخفيف الضغط على الآبار والمياه الجوفية الزراعية في سهل الباطنة.',
    ecologicalSignificanceAr: 'تعتمد على أحدث تقنيات السحب البحري واسترجاع الطاقة للحد من الأثر البيئي.',
    documentationStatus: 'officially_verified',
    officialSource: 'نماء لخدمات المياه (NAMA Water Services) / هيئة تنظيم الخدمات العامة',
    lastUpdatedDate: '2026-03-18',
    imageUrls: ['https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1000&q=80'],
    referenceCitations: ['التقرير السنوي لهيئة تنظيم الخدمات العامة (APSR) 2025'],
    educationalNotesAr: 'هذا وطني الصف العاشر: مشروعات تحلية مياه البحر والتحول إلى الطاقة النظيفة ضمن رؤية عمان 2040.'
  },
  {
    id: 'desal_ghubrah',
    nameAr: 'محطة تحلية الغبرة المستقلة (مسقط)',
    nameEn: 'Al-Ghubrah Desalination Plant (Muscat)',
    category: 'desalination',
    subTypeAr: 'تحلية مياه البحر بالتناضح العكسي (RO)',
    governorateId: 'gov_muscat',
    wilayatId: 'wil_bawshar',
    villageOrLocationAr: 'ولاية بوشر - شاطئ الغبرة',
    coordinates: { lat: 23.5950, lng: 58.4050, altitudeM: 6 },
    descriptionAr: 'شريان العاصمة مسقط التاريخي لتحلية المياه منذ السبعينات، تم تحديثها بمشروع الغبرة 3 الحديث بتقنية التناضح العكسي لتنتج 300 ألف متر مكعب يومياً لتلبية الطلب السكاني المتزايد في العاصمة.',
    hydrologicalProperties: {
      waterTypeAr: 'مياه شرب محلاة نقية',
      dailyProductionM3: 300000
    },
    historicalSignificanceAr: 'أول محطة تحلية كبرى أنشئت في عهد النهضة لتوفير مياه الشرب للعاصمة مسقط عام 1976.',
    economicSignificanceAr: 'تأمين المياه للمستشفيات والوزارات والمؤسسات السيادية وسكان محافظة مسقط.',
    agriculturalSignificanceAr: 'توفير المياه الحضرية يحمي المياه الجوفية في أحواض العاصمة.',
    ecologicalSignificanceAr: 'مطابقة للمعايير البيئية العمانية لهيئة البيئة لمياه الرجيع الملحي.',
    documentationStatus: 'officially_verified',
    officialSource: 'الشركة العمانية لشراء الطاقة والمياه (OPWP) / نماء لخدمات المياه',
    lastUpdatedDate: '2026-02-20',
    imageUrls: ['https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1000&q=80'],
    referenceCitations: ['خطة سعة توليد الكهرباء والمياه 2024-2030 (نماء لشراء الطاقة)'],
    educationalNotesAr: 'الجغرافيا الصف الثاني عشر: إدارة الموارد الحضرية وتأمين مياه الشرب في المدن الكبرى.'
  },

  // --- 6. GROUNDWATER BASINS & WELLFIELDS (الأحواض المائية وحقول الآبار) ---
  {
    id: 'basin_najd',
    nameAr: 'حوض النجد المائي الجوفي العميق',
    nameEn: 'Al-Najd Deep Groundwater Basin',
    category: 'groundwater_basins',
    subTypeAr: 'خزان مائي جوفي أحفوري عميق متجدد جزئياً',
    governorateId: 'gov_dhofar',
    wilayatId: 'wil_thumrait',
    villageOrLocationAr: 'منطقة نجد ظفار - ثمريت ومقشن والنجد',
    coordinates: { lat: 17.8000, lng: 54.1000, altitudeM: 450 },
    descriptionAr: 'أكبر حوض مائي جوفي عميق في جنوب سلطنة عُمان، يمتد على مساحة شاسعة تقدر بـ 40 ألف كم²، يمثل الركيزة الأساسية لمشاريع الأمن الغذائي وزراعة القمح والأعلاف والبيوت المحمية في السلطنة.',
    hydrologicalProperties: {
      waterTypeAr: 'مياه جوفية عميقة عذبة وشبه عذبة',
      depthMeters: 600,
      salinityPpm: 850,
      catchmentAreaKm2: 40000
    },
    historicalSignificanceAr: 'خزان أحفوري تشكل خلال العصور المطيرة القديمة في شبه الجزيرة العربية.',
    economicSignificanceAr: 'المقر الرئيسي للمشاريع الوطنية لإنتاج القمح العماني والأعلاف والتمور في مزارع شركة النجد.',
    agriculturalSignificanceAr: 'توفير مئات الملايين من الأمتار المكعبة لمشاريع الاكتفاء الذاتي الزراعي.',
    ecologicalSignificanceAr: 'تخضع الآبار لرقابة مشددة عبر العدادات الرقمية لضمان الاستدامة للأجيال القادمة.',
    documentationStatus: 'officially_verified',
    officialSource: 'المديرية العامة لإدارة الموارد المائية - وزارة الثروة الزراعية وموارد المياه',
    lastUpdatedDate: '2026-03-01',
    imageUrls: ['https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80'],
    referenceCitations: ['مشروع النجد للمياه والزراعة - وزارة موارد المياه (دراسات استدامة الحوض)'],
    educationalNotesAr: 'هذا وطني الصف الحادي عشر: مشروع زراعة القمح بنجد ظفار وتحقيق الأمن الغذائي والمائي المستدام.'
  },
  {
    id: 'wellfield_massarrat',
    nameAr: 'مشروع حوض حقل آبار المسرات المائي',
    nameEn: 'Al-Massarrat Wellfield Water Supply Scheme',
    category: 'wells',
    subTypeAr: 'مشروع إمداد مائي جوفي إقليمي متكامل',
    governorateId: 'gov_dhahirah',
    wilayatId: 'wil_ibri',
    villageOrLocationAr: 'محافظة الظاهرة - ولايات عبري وينقل وضنك',
    coordinates: { lat: 23.3500, lng: 56.4500, altitudeM: 320 },
    descriptionAr: 'أحد أهم المشاريع المائية الإستراتيجية في سلطنة عُمان، يتألف من حقل آبار استراتيجي يضم عشرات الآبار العميقة المزودة بمحطات الضخ وخزانات التجميع الإقليمية لتزويد ولايات محافظة الظاهرة بمياه الشرب النقية.',
    hydrologicalProperties: {
      waterTypeAr: 'مياه جوفية خازنة عذبة',
      dailyProductionM3: 45000,
      salinityPpm: 380,
      depthMeters: 180
    },
    historicalSignificanceAr: 'دشن عام 2001 لحل مشكلة شح المياه في محافظة الظاهرة وحماية الأهالي من الجفاف.',
    economicSignificanceAr: 'يخدم أكثر من 180 ألف نسمة في مدن وقرى عبري وضنك وينقل.',
    agriculturalSignificanceAr: 'يحافظ على استقرار مستويات المياه الجوفية في الأفلاج المحيطة عبر ضبط الاستنزاف.',
    ecologicalSignificanceAr: 'مراقبة دائمة لخطوط الملوحة عبر آبار المراقبة المنتشرة في الحوض.',
    documentationStatus: 'officially_verified',
    officialSource: 'نماء لخدمات المياه / وزارة الثروة الزراعية وموارد المياه',
    lastUpdatedDate: '2026-02-14',
    imageUrls: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80'],
    referenceCitations: ['كتاب مشروعي حوض المسرات ورملة الشرقية - التقرير الوطني للمياه'],
    educationalNotesAr: 'الجغرافيا والتقنيات الحديثة الصف الحادي عشر: نظم المراقبة الهيدرولوجية عن بعد (SCADA) في آبار المياه.'
  },

  // --- 7. COASTAL, BAYS & RAMSAR WETLANDS (البحار والأخوار المحمية) ---
  {
    id: 'coastal_khawr_rori',
    nameAr: 'خور روري (سمهرم - موقع رامسار الدولي)',
    nameEn: 'Khawr Rori / Sumhuram (Ramsar Wetland Site)',
    category: 'coastal_marine',
    subTypeAr: 'خور مائي ساحلي ومحمية أراضٍ رطبة مسجلة دولياً',
    governorateId: 'gov_dhofar',
    wilayatId: 'wil_taqah',
    villageOrLocationAr: 'ولاية طاقة - موقع سمهرم الأثري',
    coordinates: { lat: 17.0350, lng: 54.4340, altitudeM: 2 },
    descriptionAr: 'أكبر أخوار محميات ساحل ظفار، تنتهي عنده مياه شلالات وادي دربات العذبة ليلتقي برمال بحر العرب، يحتضن موقع سمهرم الأثري الشهير بتصدير اللبان عبر التاريخ، ومصنف كمحمية أراض رطبة ذات أهمية دولية بموجب اتفاقية رامسار.',
    hydrologicalProperties: {
      waterTypeAr: 'مياه مصبات خلط شاطئية عذبة/مالحة (Brackish/Fresh)',
      salinityPpm: 3200,
      catchmentAreaKm2: 1200
    },
    historicalSignificanceAr: 'ميناء سمهرم التاريخي عاصمة تصدير اللبان لملكة سبأ والفراعنة وحضارات روما والصين.',
    economicSignificanceAr: 'موقع سياحي ثقافي وبيئي يجمع التراث الإنساني بالبيئة المائية الطبيعية.',
    agriculturalSignificanceAr: 'تغذية بساتين طاقة والمزارع الساحلية القديمة.',
    ecologicalSignificanceAr: 'ملاذ دولي رئيسي للطيور المهاجرة (النورس، الفلامنجو، البلشون) والأسماك النادرة.',
    unescoListed: true,
    documentationStatus: 'officially_verified',
    officialSource: 'هيئة البيئة / وزارة التراث والسياحة / سكرتارية اتفاقية رامسار (Ramsar Site No. 2145)',
    lastUpdatedDate: '2026-03-08',
    imageUrls: ['https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1000&q=80'],
    referenceCitations: [
      'قائمة مواقع رامسار للأراضي الرطبة في سلطنة عمان',
      'أطلس محميات الأخوار بمحافظة ظفار - مكتب حفظ البيئة'
    ],
    educationalNotesAr: 'هذا وطني الصف العاشر: المحميات الطبيعية العمانية واتفاقية رامسار الدولية لحماية الأراضي الرطبة.'
  },
  {
    id: 'coastal_khawr_najd',
    nameAr: 'خور نجد وخور الشم (فيوردات مسندم)',
    nameEn: 'Khawr Najd & Khawr Ash-Sham Fjords',
    category: 'coastal_marine',
    subTypeAr: 'خلجان وأخوار بحرية غارقة (Fjords / Rias)',
    governorateId: 'gov_musandam',
    wilayatId: 'wil_khasab',
    villageOrLocationAr: 'ولاية خصب - شبه جزيرة مسندم',
    coordinates: { lat: 26.1100, lng: 56.3300, altitudeM: 0 },
    descriptionAr: 'من أروع المعالم الجغرافية الساحلية في العالم؛ أخوار وخلجان بحرية عميقة تحيط بها جبال الحجر الجيري العمودية الشاهقة، تشكل ملاذاً آمناً للسفن وموطناً دائماً للدلافين وأشجار القرم.',
    hydrologicalProperties: {
      waterTypeAr: 'مياه بحرية نقية عميقة تيارات قوية',
      depthMeters: 60,
      salinityPpm: 38000
    },
    historicalSignificanceAr: 'شكلت ملاذاً طبيعياً تاريخياً للسفن التجارية العابرة لمضيق هرمز أثناء العواصف.',
    economicSignificanceAr: 'سياحة بحرية عالمية ورحلات السفن الشراعية التقليدية ومشاهدة الدلافين والغطس.',
    agriculturalSignificanceAr: 'مصايد أسماك غنية جداً تمد أسواق السلطنة والخليج.',
    ecologicalSignificanceAr: 'بيئة للشعاب المرجانية الحساسة وتكاثر الدلافين الحدباء ودلافين المحيط الهندي.',
    documentationStatus: 'officially_verified',
    officialSource: 'وزارة الثروة الزراعية والسمكية وموارد المياه / وزارة التراث والسياحة',
    lastUpdatedDate: '2026-02-12',
    imageUrls: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80'],
    referenceCitations: ['الدراسات الأوقيانوغرافية لمضيق هرمز وبحر عمان - جامعة السلطان قابوس'],
    educationalNotesAr: 'الجغرافيا الصف الحادي عشر: السواحل الغارقة (Ria Coasts) وظاهرة الفيوردات التكتونية في مسندم.'
  },

  // --- 8. WASTEWATER RECLAMATION (محطات معالجة الصرف الصحي وإعادة الاستخدام) ---
  {
    id: 'treatment_ansab',
    nameAr: 'محطة الأنصب لمعالجة مياه الصرف الصحي (MBR)',
    nameEn: 'Al-Ansab MBR Advanced Wastewater Treatment Plant',
    category: 'treatment_plants',
    subTypeAr: 'محطة تنقية ثلاثية بالمفاعلات الحيوية الغشائية (MBR)',
    governorateId: 'gov_muscat',
    wilayatId: 'wil_bawshar',
    villageOrLocationAr: 'ولاية بوشر - منطقة الأنصب',
    coordinates: { lat: 23.5500, lng: 58.3700, altitudeM: 55 },
    descriptionAr: 'واحدة من أحدث وأكبر محطات معالجة مياه الصرف الصحي بتقنية المفاعلات الحيوية الغشائية (MBR) في الشرق الأوسط، تنتج أكثر من 125 ألف متر مكعب يومياً من المياه المعالجة ثلاثياً فائقة النقاوة لإعادة استخدامها في تشجير محافظة مسقط والمشاريع الصناعية.',
    hydrologicalProperties: {
      waterTypeAr: 'مياه معالجة ثلاثياً بتقنية الأغشية النانوية المتقدمة',
      dailyProductionM3: 125000,
      salinityPpm: 600
    },
    historicalSignificanceAr: 'مشروع ريادي أطلقته شركة حيا للمياه (نماء لخدمات المياه) لترسيخ مفهوم الاقتصاد الدائري وإعادة تدوير المياه.',
    economicSignificanceAr: 'توفر ملايين الأمتار المكعبة سنوياً من المياه لغابات مسقط والحدائق العامة وتبريد المحطات الصناعية.',
    agriculturalSignificanceAr: 'ري ملايين أشجار الظل والنخيل والمسطحات الخضراء في شوارع ومتنزهات مسقط.',
    ecologicalSignificanceAr: 'تغذية بحيرات الأنصب الاصطناعية التي تحولت إلى أهم محمية طيور مهاجرة في قلب العاصمة تضم 300 نوع من الطيور.',
    documentationStatus: 'officially_verified',
    officialSource: 'نماء لخدمات المياه (Haya / NAMA) / هيئة البيئة',
    lastUpdatedDate: '2026-03-24',
    imageUrls: ['https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1000&q=80'],
    referenceCitations: ['تقرير الاستدامة لشركة نماء لخدمات المياه - تقنية MBR في الأنصب'],
    educationalNotesAr: 'العلوم والبيئة الصف الثاني عشر: معالجة مياه الصرف الصحي وإعادة الاستخدام في دعم الغطاء النباتي ومكافحة التصحر.'
  },

  // --- 9. LAKES, RESERVOIRS & WETLANDS (البحيرات والخزانات) ---
  {
    id: 'wetland_ansab_lakes',
    nameAr: 'بحيرات ومحمية الأراضي الرطبة بالأنصب',
    nameEn: 'Al-Ansab Wetland Lakes Bird Sanctuary',
    category: 'lakes_reservoirs',
    subTypeAr: 'بحيرات مائية اصطناعية بيئية ومحمية أراض رطبة',
    governorateId: 'gov_muscat',
    wilayatId: 'wil_bawshar',
    villageOrLocationAr: 'محافظة مسقط - الأنصب',
    coordinates: { lat: 23.5550, lng: 58.3750, altitudeM: 52 },
    descriptionAr: 'سلسلة من 5 بحيرات اصطناعية عذبة شكلتها المياه المنقاة من محطة الأنصب، تحولت إلى واحة طبيعية محمية عالمياً تستقطب أكثر من 305 أنواع من الطيور المهاجرة والمقيمة مثل النسر العقاب واللقلق والفلامنجو، ومختبر تعليمي مفتوح للطلبة والباحثين.',
    hydrologicalProperties: {
      waterTypeAr: 'مياه بحيرات عذبة معالجة ثلاثياً عالية الجودة',
      storageCapacityM3: 450000,
      salinityPpm: 650
    },
    historicalSignificanceAr: 'أنشئت عام 2005 كنموذج تطبيقي رائد لربط معالجة المياه الحضرية بالاستدامة البيئية.',
    economicSignificanceAr: 'مركز للسياحة البيئية وسياحة مراقبة الطيور والتعليم المدرسي التفاعلي.',
    agriculturalSignificanceAr: 'تحتضن مشتلاً للنباتات البرية العمانية النادرة والأشجار المحلية (الغاف، السدر، السمر).',
    ecologicalSignificanceAr: 'ملاذ بيئي معتمد لطيور مسار الهجرة بين آسيا وإفريقيا.',
    documentationStatus: 'officially_verified',
    officialSource: 'نماء لخدمات المياه / جمعية البيئة العمانية',
    lastUpdatedDate: '2026-03-02',
    imageUrls: ['https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1000&q=80'],
    referenceCitations: ['دليل طيور بحيرات الأنصب - نماء لخدمات المياه وهيئة البيئة'],
    educationalNotesAr: 'الأحياء والبيئة الصف العاشر: الأراضي الرطبة الاصطناعية ودورها في حفظ التنوع الأحيائي ومسارات هجرة الطيور.'
  }
];

// 4. Interactive Curriculum & Pedagogical Water Quiz Questions
export const WATER_QUIZ_QUESTIONS: WaterQuizQuestion[] = [
  {
    id: 'quiz_1',
    titleAr: 'تحديد موقع أضخم سد مائي في عُمان',
    targetFeatureId: 'dam_wadi_dayqah',
    governorateId: 'gov_muscat',
    promptAr: 'ما هو السد المائي الذي تبلغ سعته التخزينية 100 مليون متر مكعب ويقع في ولاية قريات؟',
    hintAr: 'يرتفع 75 متراً ويغذي محافظة مسقط وقريات بالمياه العذبة خلف بحيرة صناعية كبرى.',
    explanationAr: 'سد وادي ضيقة في قرية المزارع بولاية قريات هو أضخم سد مائي في سلطنة عمان بسعة تخزينية 100 مليون م³.',
    targetCoords: { lat: 23.0900, lng: 58.8500 },
    options: [
      { id: 'opt_1', labelAr: 'سد وادي ضيقة (قريات)', isCorrect: true },
      { id: 'opt_2', labelAr: 'سد وادي الخوض (السيب)', isCorrect: false },
      { id: 'opt_3', labelAr: 'سد وادي الجزي (صحار)', isCorrect: false },
      { id: 'opt_4', labelAr: 'سد وادي تنوف (نزوى)', isCorrect: false }
    ]
  },
  {
    id: 'quiz_2',
    titleAr: 'أكبر فلج داوودي مدرج على قائمة اليونسكو',
    targetFeatureId: 'falaj_daris',
    governorateId: 'gov_dakhiliyah',
    promptAr: 'أي فلج عُماني داوودي يعد الأكبر من حيث كمية التدفق ومسجل ضمن التراث العالمي لليونسكو في ولاية نزوى؟',
    hintAr: 'يتفرع إلى ساعدين شهيرين (الساعد الكبير والساعد الصغير) وتصل مياهه لقلب مدينة نزوى.',
    explanationAr: 'فلج دارس في ولاية نزوى بمحافظة الداخلية هو أكبر فلج في عمان وأحد الأفلاج الخمسة المسجلة في اليونسكو عام 2006.',
    targetCoords: { lat: 22.9460, lng: 57.5400 },
    options: [
      { id: 'opt_1', labelAr: 'فلج دارس (نزوى)', isCorrect: true },
      { id: 'opt_2', labelAr: 'فلج الخطمين (بركة الموز)', isCorrect: false },
      { id: 'opt_3', labelAr: 'فلج الجيلة (صور)', isCorrect: false },
      { id: 'opt_4', labelAr: 'فلج الحمام (بوشر)', isCorrect: false }
    ]
  },
  {
    id: 'quiz_3',
    titleAr: 'الينبوع الكبريتي الحار في الرستاق',
    targetFeatureId: 'spring_ain_kasfa',
    governorateId: 'gov_south_batinah',
    promptAr: 'ما اسم العين الكبريتية الحارة الشهيرة التي تتدفق مياهها بحرارة ثابتة 45°C في ولاية الرستاق؟',
    hintAr: 'تستخدم مياهها المعدنية الكبريتية في الاستشفاء الطبيعي وتغذي فلج الحمام بالرستاق.',
    explanationAr: 'عين الكسفة في الرستاق هي أشهر العيون الجيوحرارية الكبريتية في سلطنة عُمان بحرارة 45 مئوية ثابتة.',
    targetCoords: { lat: 23.3910, lng: 57.4260 },
    options: [
      { id: 'opt_1', labelAr: 'عين الكسفة (الرستاق)', isCorrect: true },
      { id: 'opt_2', labelAr: 'عين الثوارة (نخل)', isCorrect: false },
      { id: 'opt_3', labelAr: 'عين دربات (طاقة)', isCorrect: false },
      { id: 'opt_4', labelAr: 'عين صحلنوت (صلالة)', isCorrect: false }
    ]
  },
  {
    id: 'quiz_4',
    titleAr: 'أضخم حوض مائي جوفي عميق في الجنوب',
    targetFeatureId: 'basin_najd',
    governorateId: 'gov_dhofar',
    promptAr: 'أي حوض مائي جوفي عميق تبلغ مساحته 40 ألف كم² ويمثل ركيزة الأمن الغذائي وزراعة القمح بمحافظة ظفار؟',
    hintAr: 'يقع شمال سلسلة جبال ظفار في منطقة ثمريت ومقشن ويحتوي على مياه أحفورية عذبة.',
    explanationAr: 'حوض النجد المائي الجوفي في محافظة ظفار هو أكبر خزان مياه جوفي عميق في جنوب السلطنة لدعم زراعة القمح والأعلاف.',
    targetCoords: { lat: 17.8000, lng: 54.1000 },
    options: [
      { id: 'opt_1', labelAr: 'حوض النجد المائي (ظفار)', isCorrect: true },
      { id: 'opt_2', labelAr: 'حوض سهل الباطنة', isCorrect: false },
      { id: 'opt_3', labelAr: 'حوض رمال الشرقية', isCorrect: false },
      { id: 'opt_4', labelAr: 'حوض وادي المعيدن', isCorrect: false }
    ]
  },
  {
    id: 'quiz_5',
    titleAr: 'الفلج الجبلي المنحوت بالصخر في طيوي',
    targetFeatureId: 'falaj_jeela',
    governorateId: 'gov_south_sharqiyah',
    promptAr: 'فلج عيني جبلي مدرج باليونسكو نحتت قنواته في حافة الجرف الصخري على ارتفاع 1040م في ولاية صور؟',
    hintAr: 'يقع في قرية الجيلة الجبلية التابعة لنيابة طيوي ويتميز بعذوبة مياهه المنحدرة من كهوف الصخر.',
    explanationAr: 'فلج الجيلة في نيابة طيوي بولاية صور أدرج باليونسكو شاهداً على الإعجاز الهندسي العماني في قمم الجبال.',
    targetCoords: { lat: 22.7840, lng: 59.1830 },
    options: [
      { id: 'opt_1', labelAr: 'فلج الجيلة (طيوي - صور)', isCorrect: true },
      { id: 'opt_2', labelAr: 'فلج الملكي (إزكي)', isCorrect: false },
      { id: 'opt_3', labelAr: 'فلج الميسر (الرستاق)', isCorrect: false },
      { id: 'opt_4', labelAr: 'فلج الصعراني (البريمي)', isCorrect: false }
    ]
  }
];
