import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { useSchoolProfile } from '../../hooks/useSchoolProfile.ts';
import { api } from '../../services/api.ts';
import { OfficialLetter, LetterRecipientType, Grade } from '../../types/index.ts';
import { exportUnifiedPdf, exportElementToPdf, generatePdfBlob } from '../../utils/pdfExport.ts';
import {
  Mail, Plus, Search, Filter, Printer, Copy, Download, Edit3,
  Trash2, CheckCircle2, School, Building2, UserCheck,
  FileText, Check, ChevronRight, X, Sparkles, Send,
  MessageSquare, Smartphone, ExternalLink, RefreshCw
} from 'lucide-react';

const RECIPIENT_TABS: Array<{ id: LetterRecipientType; label: string; icon: React.ElementType; description: string }> = [
  {
    id: 'directorate',
    label: 'مديرية التربية والتعليم',
    icon: Building2,
    description: 'المراسلات الرسمية الموجهة إلى المدير العام، دوائر الإشراف التربوي، تقنية المعلومات، والأنشطة'
  },
  {
    id: 'school_admin',
    label: 'إدارة المدرسة',
    icon: School,
    description: 'الطلبات والتقارير الموجهة لمدير المدرسة، حجز المرافق والقاعات، وخطط التحصيل'
  },
  {
    id: 'parent',
    label: 'ولي أمر الطالب',
    icon: UserCheck,
    description: 'خطابات الشكر والتفوق، إشعارات التحصيل الدراسي والمتابعة، واستمارات موافقات الرحلات'
  }
];

const LETTER_TEMPLATES: Record<LetterRecipientType, Array<{
  category: string;
  title: string;
  recipientName: string;
  recipientTitle: string;
  subject: string;
  bodyParagraphs: string[];
  actionRequired?: string;
  attachments?: string[];
}>> = {
  directorate: [
    {
      category: 'طلب تجهيزات وتقنيات جغرافية',
      title: 'طلب تزويد المدرسة بأجهزة ونظم معلومات جغرافية (GIS) وأطالس حديثة',
      recipientName: 'الفاضل / مدير عام المديرية العامة للتربية والتعليم بمحافظة مسقط',
      recipientTitle: 'المحترم / حفظه الله ورعاه',
      subject: 'طلب تزويد المدرسة بأجهزة حاسوب مخصصة لتطبيقات نظم المعلومات الجغرافية (GIS) والخرائط الرقمية',
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
      ]
    },
    {
      category: 'رحلة علمية واستكشافية',
      title: 'إشعار وتنسيق رحلة علمية استكشافية لطلبة الجغرافيا إلى كهف الهوتة والجبل الأخضر',
      recipientName: 'الفاضل / مدير دائرة الإشراف التربوي - المديرية العامة للتربية والتعليم',
      recipientTitle: 'المحترم / حفظه الله ورعاه',
      subject: 'إشعار بتنظيم رحلة علمية جغرافية استكشافية لطلبة الصف الثاني عشر إلى محافظة الداخلية',
      bodyParagraphs: [
        'نرفع إليكم أطيب التحيات والتقدير، راجين لكم دوام التوفيق والنجاح المستمر في دعم الأنشطة التعليمية الهادفة.',
        'يسر أسرة الدراسات الاجتماعية والجغرافيا بالمدرسة إشعاركم بعزمنا تنظيم رحلة تعليمية وميدانية استكشافية لطلبة الصف الثاني عشر (مادة هذا وطني والجغرافيا) إلى محافظة الداخلية، تشمل زيارة كهف الهوتة، وتكوينات جبال الحجر الغربي، ونظام فلج دارس بنزوى، والمدرجات الزراعية بالجبل الأخضر، وذلك يوم الخميس القادم.',
        'تهدف هذه الزيارة إلى الربط العملي الميداني بين ما درسه الطلبة في وحدة "عمان المكان والحضارة" ونظام تصريف المياه الجوفية والأفلاج المسجلة باليونسكو، والتعرف المباشر على التكوينات الكارستية والصخور الأفيوليتية الفريدة في عمان.',
        'نؤكد لكم استيفاء جميع الموافقات الخطية من أولياء الأمور، والتنسيق الكامل مع إدارة الدفاع المدني والإسعاف، وتوفير حافلات مدرسية حديثة ومجهزة بإشراف (4) معلمين ومشرف صحي معتمد.'
      ],
      actionRequired: 'الموافقة واعتماد برنامج الرحلة الميدانية ومخاطبة الجهات المعنية للتسهيل والتنسيق.',
      attachments: [
        'برنامج الرحلة الزمني ومسار التحرك',
        'كشف بأسماء الطلبة المشاركين وأرقام التواصل مع أولياء الأمور'
      ]
    },
    {
      category: 'طلب مشغل تدريبي إنمائي',
      title: 'طلب استضافة مشغل تدريبي لمعلمي الجغرافيا حول توظيف الذكاء الاصطناعي في التدريس',
      recipientName: 'الفاضل / رئيس قسم التدريب والإنماء المهني بالمديرية التعليمية',
      recipientTitle: 'المحترم / حفظه الله ورعاه',
      subject: 'طلب اعتماد واستضافة حلقة عمل تدريبية بعنوان "تطبيقات الذكاء الاصطناعي ونظم المعلومات في تدريس الدراسات الاجتماعية"',
      bodyParagraphs: [
        'يطيب لنا أن نثمن دوركم الريادي في الارتقاء بكفايات الهيئات التدريسية والوظائف المرتبطة بها في مدارس المحافظة.',
        'وسعياً لمواكبة التحول الرقمي ومستهدفات رؤية عمان 2040 في قطاع التعليم، ترغب أسرة مادة الدراسات الاجتماعية بمدرستنا في تنفيذ مشغل تدريبي لمعلمي ومعلمات قطاع الولاية بعنوان "توظيف أدوات الذكاء الاصطناعي والمصادر الرقمية في إعداد الدروس الجغرافية".',
        'نلتمس من فضيلتكم التكرم بالموافقة على اعتماد المشغل المقترح ضمن خطة الإنماء المهني اللامركزي، وإتاحة الفرصة لحضور معلمي المدارس المجاورة.'
      ],
      actionRequired: 'اعتماد موعد المشغل التدريبي وتزويدنا بشهادات المشاركة المعتمدة للمعلمين المشاركين.'
    }
  ],
  school_admin: [
    {
      category: 'طلب حجز مرافق مدرسية',
      title: 'طلب حجز وتخصيص قاعة الحاسوب ومصادر التعلم لتطبيقات الجغرافيا ونظم المعلومات (GIS)',
      recipientName: 'الفاضل / مدير مدرسة كعب بن برشة للتعليم ما بعد الأساسي',
      recipientTitle: 'المحترم / حفظه الله ورعاه',
      subject: 'طلب حجز قاعة الحاسوب رقم (2) لتنفيذ الحصص التطبيقية لمادة الجغرافيا والتقنيات الحديثة',
      bodyParagraphs: [
        'يسرني أن أتقدم لإدارتكم الموقرة بأسمى آيات الشكر والعرفان على جهودكم المتواصلة في تذليل الصعاب وتوفير البيئة التعليمية المحفزة للطلبة والمعلمين بالمدرسة.',
        'نظراً لبدء تطبيق الجانب العملي لمقرر الجغرافيا والتقنيات الحديثة للصف الحادي عشر، والذي يتطلب استخدام أجهزة الحاسوب والاتصال بالإنترنت لتحميل وتحليل المرئيات الفضائية ونمذجة الارتفاعات الرقمية.',
        'نرجو من إدارتكم الكريمة الموافقة على تخصيص قاعة الحاسوب رقم (2) يومي الأحد والثلاثاء من كل أسبوع خلال الحصتين (الخامسة والأولى) لصالح شعبتي (11/1) و (11/2) طوال الفصل الدراسي الأول.',
        'ونفيدكم بأننا سنلتزم بالمحافظة التامة على الأجهزة والملحقات، والتنسيق المستمر مع أخصائي مصادر التعلم وفني الحاسوب المدرسي.'
      ],
      actionRequired: 'التكرم باعتماد تخصيص القاعة وإدراجها ضمن الجدول العام لحجوزات المختبرات.',
      attachments: ['جدول الحصص الأسبوعية المقترحة لمختبر الحاسوب']
    },
    {
      category: 'تقرير تحصيلي وتوصيات',
      title: 'تقرير نتائج الاختبار القصير الأول لمادة الدراسات الاجتماعية والتوصيات العلاجية والإثرائية',
      recipientName: 'الفاضل / مدير المدرسة ورئيس مجلس إدارة المدرسة',
      recipientTitle: 'المحترم / حفظه الله ورعاه',
      subject: 'تقرير الأداء التحصيلي للاختبار القصير الأول وخطة الدعم والرعاية الأكاديمية',
      bodyParagraphs: [
        'يطيب لنا أن نضع بين أيديكم الموقرة تقرير نتائج الاختبار القصير الأول في مادة هذا وطني ومادة الجغرافيا والتقنيات الحديثة للفصل الدراسي الأول 2026/2027 م.',
        'أظهرت النتائج العامة تحقيق نسبة نجاح بلغت (94.2%)، مع تميز ملحوظ في الأسئلة المرتبطة بالمفاهيم التضاريسية والجيوسياسية لسلطنة عمان، حيث حصل (42%) من الطلبة على الدرجة النهائية (10/10).',
        'ومع ذلك، لوحظ وجود تفاوت في مهارة قراءة مقاييس الرسم والتحليل الإحصائي لبعض طلبة الصف الحادي عشر، وعليه قامت أسرة المادة بوضع خطة علاجية فورية تتضمن: حصص مساندة صباحية مرتين أسبوعياً، وأوراق عمل تدريبية ذات مستويات متدرجة، وتكليف الطلبة المتميزين ببرنامج "المعلم الصغير" لمساندة زملائهم.'
      ],
      actionRequired: 'الاطلاع واعتماد خطة الرعاية الأكاديمية وإشعار الأخصائي الاجتماعي لمتابعة الحالات التي تتطلب توجيهاً سلوكياً أو أسرياً.',
      attachments: [
        'جدول الإحصاء البياني لنتائج الاختبار حسب الشعب',
        'قائمة بأسماء الطلبة الأوائل والمتميزين لتكريمهم في طابور الصباح'
      ]
    },
    {
      category: 'مقترح معرض ومسابقة وطنية',
      title: 'مقترح إقامة معرض اليوم الجغرافي العماني بمناسبة احتفالات العيد الوطني',
      recipientName: 'الفاضل / مدير المدرسة ولجنة الأنشطة المدرسية',
      recipientTitle: 'المحترم / حفظه الله ورعاه',
      subject: 'مقترح تنظيم معرض "عمان المكان والمستقبل" تزامناً مع احتفالات العيد الوطني المجيد',
      bodyParagraphs: [
        'تزامناً مع احتفالات سلطنة عمان بالعيد الوطني المجيد، يسر أسرة مادة الدراسات الاجتماعية والجغرافيا أن تتقدم بمقترح تنظيم معرض مدرسي تفاعلي تحت شعار "عمان المكان والمستقبل".',
        'يتضمن المعرض 4 أركان رئيسية: ركن مجسمات التضاريس والأفلاج العمانية، ركن المرئيات الفضائية واستكشاف الفضاء مع القمر (أمان-1)، ركن مشاريع الطاقة المتجددة والهيدروجين الأخضر برؤية عمان 2040، وركن المسابقات الجغرافية والتراثية للطلبة وأولياء الأمور.',
        'نأمل التكرم بالاطلاع والموافقة لتشكيل فريق العمل وتجهيز الصالة الرياضية المدرسية للمعرض.'
      ],
      actionRequired: 'الموافقة المبدئية وتخصيص ميزانية الأنشطة المعتمدة لإعداد الأجنحة والمطبوعات.'
    }
  ],
  parent: [
    {
      category: 'شكر وتقدير وتفوق دراسي',
      title: 'خطاب شكر وتقدير لتفوق الطالب وتميزه الأكاديمي في مادة هذا وطني والجغرافيا',
      recipientName: 'الفاضل / ولي أمر الطالب المحترم',
      recipientTitle: 'المحترم / حفظه الله ورعاه',
      subject: 'شكر وتقدير لتفوق نجلكم المتميز في مادة هذا وطني والمشاريع الجغرافية',
      bodyParagraphs: [
        'يسر إدارة المدرسة وهيئتها التدريسية أن تزف إليكم أسمى آيات التهاني والتبريكات، معربين عن فخرنا واعتزازنا بما حققه نجلكم الطالب النجيب من مستوى استثنائي وتميز خلقي وأكاديمي في مادة هذا وطني.',
        'لقد حقق نجلكم الدرجة الكاملة في الاختبارات التقويمية، وتميز بمشاركته الإيجابية ومبادرته المتميزة في تقديم بحث علمي رائع حول "المقومات الجيواقتصادية لميناء الدقم ومناطق الهيدروجين الأخضر بسلطنة عمان".',
        'إن هذا التميز والتفوق هو ثمرة مباركة لرعايتكم الكريمة ومتابعتكم المستمرة في البيت، ونحن إذ نشكركم جزيل الشكر على هذا التعاون المثمر، نرجو لنجلكم استمرار هذا التألق ليكون أحد بناة عمان الأوفياء والمساهمين في تحقيق رؤية عمان 2040.'
      ],
      actionRequired: 'نقل تحيات وتقدير إدارة المدرسة لنجلكم وتشجيعه لمواصلة الصدارة والتفوق.'
    },
    {
      category: 'إشعار بمستوى دراسي ومتابعة',
      title: 'إشعار بمستوى التحصيل الدراسي وطلب التعاون المشترك لمتابعة الواجبات والمشروع',
      recipientName: 'الفاضل / ولي أمر الطالب المحترم',
      recipientTitle: 'المحترم / حفظه الله ورعاه',
      subject: 'إشعار بمستوى التحصيل الدراسي في مادة الدراسات الاجتماعية وطلب التعاون لمساندته',
      bodyParagraphs: [
        'تهديكم إدارة المدرسة وهيئة التدريس أطيب التحيات والتقدير، ونؤكد لكم حرصنا البالغ والمستمر على مستقبل ابننا العزيز ونجاحه التعليمي.',
        'نود إحاطتكم علماً بأن نجلكم قد واجه بعض الصعوبات في اجتياز الاختبار القصير لمادة الدراسات الاجتماعية، بالإضافة إلى عدم تسليم بعض الواجبات المنزلية والأنشطة الصفية المقررة في دفتر المادة.',
        'انطلاقاً من مبدأ الشراكة التربوية الوثيقة بين البيت والمدرسة، نأمل منكم حث نجلكم على تنظيم أوقات استذكاره اليومية، والالتزام بحضور حصص الدعم المدرسي التي تنظمها المدرسة في الفسحة المدرسية، مع متابعة الواجبات عبر البوابة التعليمية.',
        'كما يسعدنا جداً استقبالكم في المدرسة لمناقشة الخطة المشتركة للارتقاء بمستواه التحصيلي.'
      ],
      actionRequired: 'التكرم بالتوقيع على إشعار الاستلام وإعادته مع الطالب، والتنسيق لزيارة المدرسة لمقابلة معلم المادة.'
    },
    {
      category: 'موافقة وإقرار رحلة مدرسية',
      title: 'استمارة موافقة وإقرار ولي الأمر للمشاركة في الرحلة التعليمية الميدانية (كهف الهوتة والجبل الأخضر)',
      recipientName: 'الفاضل / ولي أمر الطالب المحترم',
      recipientTitle: 'المحترم / حفظه الله ورعاه',
      subject: 'طلب موافقة وإقرار ولي الأمر للمشاركة في الرحلة الميدانية التعليمية لمحافظة الداخلية',
      bodyParagraphs: [
        'تهديكم إدارة المدرسة خالص التحيات والتقدير لتعاونكم الدائم مع برامج المدرسة وأنشطتها التعليمية.',
        'تعتزم المدرسة تسيير رحلة تعليمية استكشافية لطلبة المدرسة إلى محافظة الداخلية (كهف الهوتة، جبال الحجر، فلج دارس، الجبل الأخضر) يوم الخميس القادم، بهدف الربط التطبيقي مع منهج "هذا وطني" لدراسة التضاريس والأفلاج ونظم البيئة الطبيعية.',
        'التحرك من فناء المدرسة في تمام الساعة 06:45 صباحاً بحافلات سياحية مجهزة ومكيفة وبرفقة معلمين ومشرف صحي، والعودة المتوقعة للمدرسة بمشيئة الله في تمام الساعة 04:30 مساءً.',
        'برجاء التكرم بتعبئة نموذج الإقرار أدناه وإعادته مع نجلكم في موعد أقصاه يوم الأحد القادم.'
      ],
      actionRequired: 'إقرار ولي الأمر: (أوافق / لا أوافق) على مشاركة ابني في الرحلة الميدانية، وأقر بسلامته الصحية وقدرته على المشاركة.\nاسم ولي الأمر: ....................................... التوقيع: .................................... الهاتف: ....................................'
    }
  ]
};

export const OfficialLettersView: React.FC = () => {
  const { showToast, schoolProfile, updateSchoolProfile, openSchoolProfileModal } = useApp();
  const {
    schoolName,
    teacherName,
    supervisorName,
    governorateName,
    directorateName,
    academicYear,
    semester,
    principalName,
    getOfficialLetterDefaults,
    openEditModal
  } = useSchoolProfile();

  const [activeTab, setActiveTab] = useState<LetterRecipientType>('directorate');
  const [letters, setLetters] = useState<OfficialLetter[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<OfficialLetter | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const letterRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Edit Header Modal State
  const [editHeaderModalOpen, setEditHeaderModalOpen] = useState(false);
  const [headerForm, setHeaderForm] = useState({
    schoolName: '',
    directorateName: '',
    dateMiladi: '',
    dateHijri: '',
    referenceNumber: '',
    senderName: '',
    senderRole: '',
    cascadeToProfile: true
  });
  const [savingHeader, setSavingHeader] = useState(false);

  // WhatsApp Share Modal & PDF State
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [recipientPhone, setRecipientPhone] = useState(
    () => localStorage.getItem('om_edu_wa_recipient_phone') || '+96877394680'
  );
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
  const [isPreparingPdf, setIsPreparingPdf] = useState(false);

  const handleOpenEditHeader = () => {
    if (!selectedLetter) return;
    setHeaderForm({
      schoolName: selectedLetter.schoolName || schoolName,
      directorateName: selectedLetter.directorateName || directorateName,
      dateMiladi: selectedLetter.dateMiladi || new Date().toLocaleDateString('ar-OM', { year: 'numeric', month: 'long', day: 'numeric' }),
      dateHijri: selectedLetter.dateHijri || '15 ربيع الأول 1448 هـ',
      referenceNumber: selectedLetter.referenceNumber || `م/ت/ع/1448/${Math.floor(Math.random() * 900 + 100)}`,
      senderName: selectedLetter.senderName || teacherName,
      senderRole: selectedLetter.senderRole || 'معلم أول مادة الجغرافيا والدراسات الاجتماعية',
      cascadeToProfile: true
    });
    setEditHeaderModalOpen(true);
  };

  const handleSaveHeader = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLetter) return;
    setSavingHeader(true);
    try {
      const updated: OfficialLetter = {
        ...selectedLetter,
        schoolName: headerForm.schoolName.trim(),
        directorateName: headerForm.directorateName.trim(),
        dateMiladi: headerForm.dateMiladi.trim(),
        dateHijri: headerForm.dateHijri.trim(),
        referenceNumber: headerForm.referenceNumber.trim(),
        senderName: headerForm.senderName.trim(),
        senderRole: headerForm.senderRole.trim(),
        updatedAt: new Date().toISOString()
      };
      const res = await api.saveOfficialLetter(updated);
      if (res.success) {
        setSelectedLetter(updated);
        setLetters(prev => prev.map(l => l.id === updated.id ? updated : l));
        showToast('تم حفظ وتحديث بيانات ترويسة الخطاب وتعميمها بنجاح! 🏫', 'success');

        if (headerForm.cascadeToProfile) {
          try {
            await updateSchoolProfile({
              schoolName: headerForm.schoolName.trim(),
              directorateName: headerForm.directorateName.trim(),
              teacherName: headerForm.senderName.trim()
            }, true);
          } catch (_) {}
        }
        setEditHeaderModalOpen(false);
      }
    } catch (err: any) {
      showToast('تعذر حفظ بيانات الترويسة: ' + err.message, 'error');
    } finally {
      setSavingHeader(false);
    }
  };

  const handleExportToPdf = async () => {
    if (!letterRef.current || !selectedLetter) return;
    setIsExportingPdf(true);
    try {
      const cleanRef = (selectedLetter.referenceNumber || 'خطاب_رسمي').replace(/[/\\?%*:|"<>]/g, '_');
      const filename = `خطاب_رسمي_${cleanRef}.pdf`;
      const res = await exportUnifiedPdf(letterRef.current, {
        filename,
        orientation: 'portrait',
        scale: 2,
        addPageNumbers: true,
        title: selectedLetter.title || selectedLetter.subject,
        hideSelectors: ['.no-print', '[data-no-print]', 'button']
      });
      if (res.success) {
        if (res.viewerUrl || res.fullUrl) {
          setGeneratedPdfUrl(res.viewerUrl || res.fullUrl || null);
        }
        showToast('📄 تم تصدير الخطاب كملف PDF رسمي فائق الجودة بنجاح!', 'success');
      } else {
        showToast('تعذر تصدير الملف إلى PDF: ' + (res.error || ''), 'error');
      }
    } catch (err: any) {
      showToast('خطأ أثناء تصدير PDF: ' + err.message, 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const generateLetterPrintableHtml = (letter: OfficialLetter) => {
    const paragraphsHtml = (letter.bodyParagraphs || []).map(p => `<p style="margin: 0 0 14px 0; text-align: justify; line-height: 1.8;">${p}</p>`).join('');
    const attachmentsHtml = (letter.attachments && letter.attachments.length > 0)
      ? `<div style="margin-top: 15px; font-size: 9.5pt;"><strong>المرفقات:</strong><ul style="margin: 4px 0; padding-right: 20px;">${letter.attachments.map(a => `<li>${a}</li>`).join('')}</ul></div>`
      : '';
    const actionHtml = letter.actionRequired
      ? `<div style="margin: 15px 0; padding: 10px; background: #f8fafc; border: 1px solid #cbd5e1; border-right: 4px solid #0d9488; font-size: 9.5pt;"><strong>الإجراء والتوصية:</strong> ${letter.actionRequired}</div>`
      : '';

    return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <title>${letter.title || letter.subject} - ${letter.referenceNumber}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Cairo', Tahoma, sans-serif; direction: rtl; margin: 0; padding: 20px; background: white; color: #0f172a; font-size: 11pt; line-height: 1.6; }
    .basmala { text-align: center; font-weight: bold; font-size: 11pt; margin-bottom: 15px; letter-spacing: 2px; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
    .header-side { font-size: 9.5pt; line-height: 1.5; }
    .header-center { text-align: center; }
    .header-center .emblem { width: 55px; height: 55px; border-radius: 12px; background: #0f766e; color: #fde047; display: flex; align-items: center; justify-content: center; font-size: 24pt; margin: 0 auto 5px auto; }
    .recipient { margin-bottom: 20px; font-weight: bold; font-size: 11.5pt; }
    .subject { font-weight: 900; margin: 15px 0; font-size: 12pt; border-bottom: 2px solid #0f766e; display: inline-block; padding-bottom: 3px; }
    .salutation { margin: 15px 0; font-weight: bold; }
    .body-content { font-size: 11pt; }
    .closing { margin: 25px 0 35px 0; font-weight: bold; }
    .signatures { margin-top: 40px; display: flex; justify-content: space-around; text-align: center; font-size: 9.5pt; border-top: 1px solid #cbd5e1; padding-top: 20px; }
    .signatures > div { width: 30%; }
    .signatures p { margin: 4px 0; }
    .no-print-bar { background: #0f172a; color: white; padding: 10px 16px; border-radius: 8px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
    .no-print-bar button { padding: 6px 14px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-family: inherit; font-size: 9pt; margin-left: 6px; }
    @media print {
      .no-print-bar { display: none !important; }
      body { padding: 0 !important; }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <span>🖨️ معاينة الخطاب الرسمي المعتمد A4</span>
    <div>
      <button onclick="window.print()" style="background: #14b8a6; color: #0f172a;">طباعة فورية (Ctrl+P)</button>
      <button onclick="window.close()" style="background: #475569; color: white;">إغلاق</button>
    </div>
  </div>

  <div class="basmala">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>

  <div class="header">
    <div class="header-side" style="text-align: right;">
      <div style="font-weight: 900; font-size: 11pt;">سلطنة عمان</div>
      <div style="font-weight: bold;">وزارة التربية والتعليم</div>
      <div>${letter.directorateName}</div>
      <div style="font-weight: bold; color: #0f766e;">${letter.schoolName}</div>
    </div>
    <div class="header-center">
      <div class="emblem">🏛️</div>
      <div style="font-size: 8.5pt; color: #64748b; font-weight: bold;">مراسلة رسمية</div>
    </div>
    <div class="header-side" style="text-align: left;">
      <div><strong>التاريخ:</strong> ${letter.dateMiladi}</div>
      <div><strong>الموافق:</strong> ${letter.dateHijri}</div>
      <div><strong>الرقم الإشاري:</strong> <span style="color: #0f766e; font-weight: bold;">${letter.referenceNumber}</span></div>
    </div>
  </div>

  <div class="recipient">
    <div>${letter.recipientName} ${letter.recipientTitle}</div>
    ${letter.studentName ? `<div style="font-size: 10pt; color: #0f766e; margin-top: 3px;">بشأن الطالب: ${letter.studentName} - ${letter.gradeName || ''} (${letter.sectionName || ''})</div>` : ''}
  </div>

  <div>
    <span class="subject">الموضوع: ${letter.subject}</span>
  </div>

  <div class="salutation">${letter.salutation}</div>

  <div class="body-content">
    ${paragraphsHtml}
    ${actionHtml}
    ${attachmentsHtml}
  </div>

  <div class="closing">${letter.closing}</div>

  <div class="signatures">
    <div>
      <p style="font-weight: bold;">معد الخطاب / مقدم الطلب</p>
      <p style="color: #0f766e; font-weight: bold; margin-top: 15px;">${letter.senderName}</p>
      <p style="font-size: 8pt; color: #64748b;">${letter.senderRole}</p>
      <p style="font-size: 8pt; color: #94a3b8; margin-top: 6px;">التوقيع: .....................</p>
    </div>
    <div>
      <p style="font-weight: bold;">المعلم الأول للمادة</p>
      <p style="color: #64748b; margin-top: 15px;">إشراف وتدقيق</p>
      <p style="font-size: 8pt; color: #94a3b8; margin-top: 15px;">التوقيع: .....................</p>
    </div>
    <div>
      <p style="font-weight: bold;">يعتمد / مدير المدرسة</p>
      <p style="color: #64748b; margin-top: 15px;">الختم الرسمي للمدرسة</p>
      <p style="font-size: 8pt; color: #94a3b8; margin-top: 15px;">التوقيع: .....................</p>
    </div>
  </div>
</body>
</html>`;
  };

  const handleDownloadPrintableHtmlLetter = () => {
    if (!selectedLetter) return;
    const html = generateLetterPrintableHtml(selectedLetter);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanRef = (selectedLetter.referenceNumber || 'خطاب').replace(/[/\\?%*:|"<>]/g, '_');
    a.download = `خطاب_رسمي_${cleanRef}_للطباعة.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('📄 تم تنزيل صفحة الخطاب الرسمية للطباعة! يمكنك فتحها والضغط على Ctrl+P للطباعة المباشرة بأعلى جودة.', 'success');
  };

  const handlePrintLetter = async () => {
    if (!selectedLetter) return;
    let printSuccess = false;
    try {
      window.print();
      printSuccess = true;
      showToast('تم إرسال أمر الطباعة. إذا لم تظهر نافذة الطابعة، يمكنك استخدام زر "تصدير PDF" أو "تنزيل صفحة للطباعة"', 'info');
    } catch (err) {
      console.warn('Direct print blocked by iframe environment:', err);
    }
    if (!printSuccess) {
      showToast('تعذر فتح أمر الطباعة من المتصفح مباشرة، جاري تجهيز وتنزيل ملف PDF للطباعة تلقائياً...', 'info');
      await handleExportToPdf();
    }
  };

  const preparePdfForWhatsApp = async (): Promise<string | null> => {
    if (!letterRef.current || !selectedLetter) return null;
    setIsPreparingPdf(true);
    try {
      const cleanRef = (selectedLetter.referenceNumber || 'خطاب_رسمي').replace(/[/\\?%*:|"<>]/g, '_');
      const filename = `خطاب_${cleanRef}.pdf`;
      const pdfRes = await generatePdfBlob(letterRef.current, { filename, orientation: 'portrait', scale: 2 });
      if (pdfRes.success && pdfRes.base64) {
        const uploadRes = await api.uploadDocumentPdf(pdfRes.base64, filename);
        if (uploadRes.success) {
          const directPdfUrl = uploadRes.fullUrl.startsWith('/')
            ? `${window.location.origin}${uploadRes.fullUrl}`
            : uploadRes.fullUrl;
          const previewViewerUrl = (uploadRes as any).viewerUrl
            ? ((uploadRes as any).viewerUrl.startsWith('/') ? `${window.location.origin}${(uploadRes as any).viewerUrl}` : (uploadRes as any).viewerUrl)
            : directPdfUrl;

          setGeneratedPdfUrl(previewViewerUrl);
          showToast('📄 تم تجهيز مستند الخطاب بصيغة PDF الرسمية للمشاركة!', 'success');
          return previewViewerUrl;
        }
      } else if (pdfRes.error) {
        showToast('تنبيه أثناء إعداد PDF: ' + pdfRes.error, 'error');
      }
    } catch (err: any) {
      console.warn('Could not generate PDF for WhatsApp:', err);
      showToast('تعذر تجهيز ملف PDF للواتساب: ' + (err.message || ''), 'error');
    } finally {
      setIsPreparingPdf(false);
    }
    return null;
  };

  const getLetterWhatsAppText = (customPdfUrl?: string) => {
    if (!selectedLetter) return '';
    const activePdfLink = customPdfUrl || generatedPdfUrl;

    let text = `🏛️ *خطاب ومراسلة رسمية - سلطنة عمان* 🇴🇲\n`;
    text += `🏢 *وزارة التربية والتعليم*\n`;
    text += `📍 *${selectedLetter.directorateName}*\n`;
    text += `🏫 *${selectedLetter.schoolName}*\n`;
    text += `📅 *التاريخ:* ${selectedLetter.dateMiladi} (الموافق ${selectedLetter.dateHijri})\n`;
    text += `🔢 *الرقم الإشاري:* ${selectedLetter.referenceNumber}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    text += `👤 *إلى:* ${selectedLetter.recipientName} ${selectedLetter.recipientTitle}\n`;
    if (selectedLetter.studentName) {
      text += `🎓 *بشأن الطالب:* ${selectedLetter.studentName} - ${selectedLetter.gradeName} (${selectedLetter.sectionName || ''})\n`;
    }
    text += `📋 *الموضوع:* ${selectedLetter.subject}\n\n`;
    text += `_${selectedLetter.salutation}_\n\n`;

    selectedLetter.bodyParagraphs.forEach(para => {
      text += `${para}\n\n`;
    });

    if (selectedLetter.actionRequired) {
      text += `📌 *الإجراء والتوصية المطلوبة:*\n${selectedLetter.actionRequired}\n\n`;
    }

    if (selectedLetter.attachments && selectedLetter.attachments.length > 0) {
      text += `📎 *المرفقات:*\n`;
      selectedLetter.attachments.forEach(att => {
        text += `• ${att}\n`;
      });
      text += `\n`;
    }

    text += `_${selectedLetter.closing}_\n\n`;
    text += `✍️ *مقدم الخطاب:* ${selectedLetter.senderName} (${selectedLetter.senderRole})\n`;

    if (activePdfLink) {
      text += `\n📄 *رابط فتح وتحميل وثيقة الخطاب الأصلية المنسقة بصيغة PDF:*\n🔗 ${activePdfLink}\n`;
    }

    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `✨ صادر عبر نظام المراسلات المدرسية والتحضير العماني - المكتبة الذكية 🇴🇲`;
    return text;
  };

  const handleOpenDirectWhatsApp = async () => {
    let pdfLink = generatedPdfUrl;
    if (!pdfLink) {
      pdfLink = await preparePdfForWhatsApp();
    }
    const text = getLetterWhatsAppText(pdfLink || undefined);
    let url = '';
    const cleanNumber = recipientPhone.replace(/\D/g, '');
    if (cleanNumber) {
      url = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(text)}`;
    } else {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    }
    window.open(url, '_blank');
  };

  const handleSendViaCloudApi = async () => {
    if (!recipientPhone) {
      showToast('يرجى كتابة رقم الهاتف المستلم', 'info');
      return;
    }
    setSendingWhatsApp(true);
    try {
      localStorage.setItem('om_edu_wa_recipient_phone', recipientPhone.trim());

      // Prepare official PDF document to attach
      let pdfUrlToUse = generatedPdfUrl;
      if (!pdfUrlToUse) {
        pdfUrlToUse = await preparePdfForWhatsApp();
      }

      const cleanRef = (selectedLetter?.referenceNumber || 'خطاب_رسمي').replace(/[/\\?%*:|"<>]/g, '_');
      const res = await api.dispatchLetterToWhatsApp({
        toPhone: recipientPhone.trim(),
        letterId: selectedLetter?.id,
        letterData: selectedLetter,
        pdfUrl: pdfUrlToUse || undefined,
        pdfFilename: `خطاب_رسمي_${cleanRef}.pdf`
      });

      if (res.success) {
        showToast('تم إرسال الخطاب كملف PDF رسمي إلى الواتساب بنجاح 📲', 'success');
        setWhatsappModalOpen(false);
      } else {
        showToast('تنبيه: ' + (res.error || res.message || 'تعذر الإرسال السحابي، يمكنك استخدام زر فتح واتساب المباشر'), 'info');
      }
    } catch (err: any) {
      showToast('تعذر الإرسال الآلي: ' + err.message + ' (يمكنك استخدام زر فتح واتساب المباشر)', 'info');
    } finally {
      setSendingWhatsApp(false);
    }
  };

  const handleCopyWhatsAppText = () => {
    const text = getLetterWhatsAppText();
    navigator.clipboard.writeText(text);
    setCopiedWhatsApp(true);
    showToast('تم نسخ نص الخطاب كاملاً للحافظة', 'success');
    setTimeout(() => setCopiedWhatsApp(false), 2500);
  };

  // New Letter Modal & Form State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [letterForm, setLetterForm] = useState(() => ({
    ...getOfficialLetterDefaults({ letterType: 'directorate' }),
    letterType: 'directorate' as LetterRecipientType,
    category: 'طلب تجهيزات وتقنيات جغرافية',
    title: '',
    schoolName,
    directorateName,
    senderName: teacherName,
    senderRole: 'معلم أول مادة الجغرافيا والدراسات الاجتماعية',
    recipientName: '',
    recipientTitle: 'المحترم / حفظه الله ورعاه',
    studentName: '',
    gradeName: 'الصف الثاني عشر',
    sectionName: '12/1',
    subject: '',
    salutation: 'السلام عليكم ورحمة الله وبركاته،،، وبعد:',
    bodyText: '',
    actionRequired: '',
    attachmentsText: '',
    closing: 'وتفضلوا بقبول فائق الاحترام والتقدير،،،'
  }));

  // Auto-sync letter form when schoolProfile changes in settings
  useEffect(() => {
    setLetterForm(prev => ({
      ...prev,
      schoolName,
      directorateName,
      senderName: teacherName
    }));
  }, [schoolName, directorateName, teacherName]);

  const loadLetters = async () => {
    try {
      setLoading(true);
      const res = await api.getOfficialLetters();
      if (res.success && res.letters) {
        setLetters(res.letters);
        // Default select first for active tab
        const tabLetters = res.letters.filter(l => l.letterType === activeTab);
        if (tabLetters.length > 0) {
          setSelectedLetter(tabLetters[0]);
        }
      }
    } catch (err: any) {
      showToast('تعذر تحميل الخطابات: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLetters();
  }, []);

  useEffect(() => {
    // When activeTab changes, select first letter in that tab if available
    const tabLetters = letters.filter(l => l.letterType === activeTab);
    if (tabLetters.length > 0) {
      setSelectedLetter(tabLetters[0]);
    } else {
      setSelectedLetter(null);
    }
  }, [activeTab, letters]);

  const handleApplyTemplate = (tpl: typeof LETTER_TEMPLATES['directorate'][0]) => {
    setLetterForm(prev => ({
      ...prev,
      schoolName,
      directorateName,
      senderName: teacherName,
      letterType: activeTab,
      category: tpl.category,
      title: tpl.title,
      recipientName: tpl.recipientName,
      recipientTitle: tpl.recipientTitle,
      subject: tpl.subject,
      bodyText: tpl.bodyParagraphs.join('\n\n'),
      actionRequired: tpl.actionRequired || '',
      attachmentsText: tpl.attachments ? tpl.attachments.join('\n') : ''
    }));
  };

  const handleSaveNewLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!letterForm.title.trim() || !letterForm.recipientName.trim() || !letterForm.bodyText.trim()) {
      showToast('يرجى تعبئة الحقول الأساسية للخطاب', 'error');
      return;
    }

    const paragraphs = letterForm.bodyText
      .split('\n\n')
      .map(p => p.trim())
      .filter(Boolean);

    const attachments = letterForm.attachmentsText
      .split('\n')
      .map(a => a.trim())
      .filter(Boolean);

    const newLetter: Partial<OfficialLetter> = {
      letterType: letterForm.letterType,
      category: letterForm.category,
      title: letterForm.title,
      referenceNumber: letterForm.referenceNumber,
      dateHijri: letterForm.dateHijri,
      dateMiladi: letterForm.dateMiladi,
      schoolName: letterForm.schoolName,
      directorateName: letterForm.directorateName,
      senderName: letterForm.senderName,
      senderRole: letterForm.senderRole,
      recipientName: letterForm.recipientName,
      recipientTitle: letterForm.recipientTitle,
      studentName: letterForm.studentName || undefined,
      gradeName: letterForm.gradeName || undefined,
      sectionName: letterForm.sectionName || undefined,
      subject: letterForm.subject,
      salutation: letterForm.salutation,
      bodyParagraphs: paragraphs,
      actionRequired: letterForm.actionRequired || undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
      closing: letterForm.closing,
      status: 'approved'
    };

    try {
      const res = await api.saveOfficialLetter(newLetter);
      if (res.success) {
        showToast('تم حفظ الخطاب الرسمي بنجاح!', 'success');
        setCreateModalOpen(false);
        await loadLetters();
        setSelectedLetter(res.letter);
      }
    } catch (err: any) {
      showToast('خطأ أثناء حفظ الخطاب: ' + err.message, 'error');
    }
  };

  const handleDeleteLetter = async (id: string) => {
    try {
      const res = await api.deleteOfficialLetter(id);
      if (res.success) {
        showToast('تم حذف الخطاب بنجاح', 'info');
        if (selectedLetter?.id === id) {
          setSelectedLetter(null);
        }
        await loadLetters();
      }
    } catch (err: any) {
      showToast('تعذر حذف الخطاب: ' + err.message, 'error');
    }
  };

  const handleCopyLetter = () => {
    if (!selectedLetter) return;
    const fullText = `
سلطنة عمان - وزارة التربية والتعليم
${selectedLetter.directorateName}
${selectedLetter.schoolName}
التاريخ: ${selectedLetter.dateMiladi} الموافق ${selectedLetter.dateHijri}
الرقم الإشاري: ${selectedLetter.referenceNumber}

إلى: ${selectedLetter.recipientName} ${selectedLetter.recipientTitle}
الموضوع: ${selectedLetter.subject}

${selectedLetter.salutation}

${selectedLetter.bodyParagraphs.join('\n\n')}

${selectedLetter.actionRequired ? `الإجراء والتوصية: ${selectedLetter.actionRequired}\n` : ''}
${selectedLetter.attachments && selectedLetter.attachments.length > 0 ? `المرفقات:\n- ${selectedLetter.attachments.join('\n- ')}\n` : ''}
${selectedLetter.closing}

معد الخطاب: ${selectedLetter.senderName} (${selectedLetter.senderRole})
    `.trim();

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    showToast('تم نسخ نص الخطاب الرسمي إلى الحافظة', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const currentTabLetters = letters.filter(l => l.letterType === activeTab);
  const filteredLetters = currentTabLetters.filter(l => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.title.toLowerCase().includes(q) ||
      l.subject.toLowerCase().includes(q) ||
      l.recipientName.toLowerCase().includes(q) ||
      (l.studentName && l.studentName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-indigo-950 via-teal-900 to-slate-900 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 text-xs font-semibold mb-3">
            <Mail className="w-3.5 h-3.5 text-amber-300" />
            <span>نظام المراسلات والخطابات المدرسية - سلطنة عمان</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black mb-2 tracking-tight">
            استوديو صياغة المراسلات والخطابات الرسمية
          </h1>
          <p className="text-slate-200 text-sm md:text-base leading-relaxed">
            نماذج وصياغة معتمدة للمراسلات التربوية الموجهة إلى <strong>مديرية التربية والتعليم</strong>، و<strong>إدارة المدرسة</strong>، و<strong>أولياء أمور الطلبة</strong>، بصياغة رسمية وفق بروتوكول وزارة التربية والتعليم العمانية مع الترويسة والختم وإمكانية الطباعة الفورية.
          </p>

          <div className="flex flex-wrap gap-3 mt-5">
            <button
              onClick={() => {
                // Pre-populate with first template of active tab
                const tpl = LETTER_TEMPLATES[activeTab][0];
                handleApplyTemplate(tpl);
                setCreateModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>كتابة خطاب رسمي جديد</span>
            </button>
            {selectedLetter && (
              <>
                <button
                  onClick={handleExportToPdf}
                  disabled={isExportingPdf}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md transition cursor-pointer disabled:opacity-50"
                  title="تحويل الخطاب الرسمي إلى ملف PDF عالي الجودة"
                >
                  {isExportingPdf ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span>{isExportingPdf ? 'جاري التصدير...' : 'تصدير PDF 📄'}</span>
                </button>
                <button
                  onClick={handlePrintLetter}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-sm shadow-md transition cursor-pointer"
                  title="طباعة الخطاب الرسمي"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة رسمية 🖨️</span>
                </button>
                <button
                  onClick={handleDownloadPrintableHtmlLetter}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-xs transition cursor-pointer"
                  title="تنزيل صفحة مستقلة تفتح وتطبع بـ Ctrl+P في أي متصفح"
                >
                  <FileText className="w-4 h-4 text-sky-300" />
                  <span>ملف طباعة مستقل</span>
                </button>
                <button
                  onClick={handleOpenEditHeader}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-xs transition cursor-pointer"
                  title="تعديل ترويسة الخطاب واسم المدرسة والمديرية والتاريخ"
                >
                  <Edit3 className="w-4 h-4 text-teal-300" />
                  <span>تعديل الترويسة ✏️</span>
                </button>
                <button
                  onClick={handleCopyLetter}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-xs transition cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
                </button>
                <button
                  onClick={() => setWhatsappModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>إرسال عبر واتساب 📲</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Ambient watermark background */}
        <div className="absolute left-6 -bottom-8 opacity-10 pointer-events-none">
          <Mail className="w-64 h-64 text-teal-300" />
        </div>
      </div>

      {/* Recipient Target Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 print:hidden">
        {RECIPIENT_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = letters.filter(l => l.letterType === tab.id).length;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-4 rounded-2xl border text-right transition flex items-start gap-3.5 ${
                isActive
                  ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-900/20'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-teal-400'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-white/20 text-white' : 'bg-teal-50 dark:bg-teal-950 text-teal-600'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm truncate">{tab.label}</h3>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {count} خطابات
                  </span>
                </div>
                <p
                  className={`text-[11px] mt-1 line-clamp-1 ${
                    isActive ? 'text-teal-100' : 'text-slate-400'
                  }`}
                >
                  {tab.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Letters Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List (4 cols) */}
        <div className="lg:col-span-4 space-y-4 print:hidden">
          {/* Search Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="بحث في المراسلات..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pr-9 pl-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>خطابات هذه الفئة: {filteredLetters.length}</span>
              <button
                onClick={() => {
                  const tpl = LETTER_TEMPLATES[activeTab][0];
                  handleApplyTemplate(tpl);
                  setCreateModalOpen(true);
                }}
                className="text-teal-600 hover:text-teal-500 font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>خطاب جديد</span>
              </button>
            </div>
          </div>

          {/* Letters List */}
          <div className="space-y-2.5">
            {filteredLetters.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800">
                <Mail className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">لا توجد خطابات مسجلة في هذا القسم</p>
                <button
                  onClick={() => {
                    const tpl = LETTER_TEMPLATES[activeTab][0];
                    handleApplyTemplate(tpl);
                    setCreateModalOpen(true);
                  }}
                  className="mt-3 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 text-xs font-bold inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>صياغة خطاب الآن</span>
                </button>
              </div>
            ) : (
              filteredLetters.map(letter => {
                const isSelected = selectedLetter?.id === letter.id;
                return (
                  <div
                    key={letter.id}
                    onClick={() => setSelectedLetter(letter)}
                    className={`p-4 rounded-2xl border cursor-pointer transition text-right ${
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {letter.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {letter.referenceNumber}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">
                      {letter.subject}
                    </h3>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">
                      إلى: {letter.recipientName}
                    </p>

                    {letter.studentName && (
                      <div className="inline-block px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-[10px] font-medium mb-1">
                        الطالب: {letter.studentName} ({letter.gradeName})
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span>{letter.dateMiladi}</span>
                      <span className="text-teal-600 font-semibold">{letter.senderRole}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Detail / Official Printable Letter View (8 cols) */}
        <div className="lg:col-span-8">
          {selectedLetter ? (
            <div ref={letterRef} className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-sm print:p-0 print:border-none print:shadow-none space-y-6 text-right printable-document">
              {/* Quick Edit Header Bar (Interactive above official document) */}
              <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-200 dark:border-slate-800 print:hidden text-xs">
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                  <span className="font-bold">الترويسة الرسمية المعتمدة لوزارة التربية والتعليم</span>
                </div>
                <button
                  onClick={handleOpenEditHeader}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold transition cursor-pointer"
                  title="تعديل بيانات المدرسة، المديرية، التاريخ والرقم الإشاري أعلى الصفحة"
                >
                  <Edit3 className="w-3.5 h-3.5 text-teal-600" />
                  <span>تعديل بيانات الترويسة العلوية ✏️</span>
                </button>
              </div>

              {/* Official Ministerial Header */}
              <div className="border-b-2 border-slate-900 dark:border-slate-600 pb-6">
                {/* Basmala */}
                <div className="text-center font-serif text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 tracking-widest">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </div>

                <div className="flex items-start justify-between text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                  <div className="text-right">
                    <p className="font-extrabold text-sm md:text-base text-slate-900 dark:text-white">سلطنة عمان</p>
                    <p>وزارة التربية والتعليم</p>
                    <p>{selectedLetter.directorateName}</p>
                    <p className="text-teal-700 dark:text-teal-400 font-bold">{selectedLetter.schoolName}</p>
                  </div>

                  {/* Coat of Arms / Ministry Seal Placeholder */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-teal-800 text-amber-300 flex items-center justify-center shadow-md">
                      <School className="w-9 h-9" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 mt-1">مراسلة رسمية</span>
                  </div>

                  <div className="text-left space-y-1 font-mono text-xs">
                    <p>التاريخ: <span className="font-sans font-semibold">{selectedLetter.dateMiladi}</span></p>
                    <p>الموافق: <span className="font-sans font-semibold">{selectedLetter.dateHijri}</span></p>
                    <p>الرقم الإشاري: <span className="font-bold text-teal-700 dark:text-teal-400">{selectedLetter.referenceNumber}</span></p>
                  </div>
                </div>
              </div>

              {/* Recipient Line */}
              <div className="pt-2 space-y-1.5 text-sm md:text-base">
                <p className="font-extrabold text-slate-900 dark:text-white">
                  {selectedLetter.recipientName} {selectedLetter.recipientTitle}
                </p>
                {selectedLetter.studentName && (
                  <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                    بشأن الطالب / {selectedLetter.studentName} - {selectedLetter.gradeName} ({selectedLetter.sectionName || ''})
                  </p>
                )}
                <div className="pt-2">
                  <p className="font-bold text-slate-900 dark:text-white inline-block border-b-2 border-teal-600 pb-0.5">
                    الموضوع: {selectedLetter.subject}
                  </p>
                </div>
              </div>

              {/* Salutation */}
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 pt-1">
                {selectedLetter.salutation}
              </p>

              {/* Body Paragraphs */}
              <div className="space-y-4 text-xs md:text-sm text-slate-800 dark:text-slate-200 leading-relaxed text-justify font-normal">
                {selectedLetter.bodyParagraphs.map((para, i) => (
                  <p key={i} className="indent-6">
                    {para}
                  </p>
                ))}
              </div>

              {/* Action Required / Recommendation Box */}
              {selectedLetter.actionRequired && (
                <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/50 text-xs md:text-sm">
                  <h4 className="font-bold text-teal-900 dark:text-teal-300 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span>التوصية والإجراء المطلوب:</span>
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {selectedLetter.actionRequired}
                  </p>
                </div>
              )}

              {/* Attachments */}
              {selectedLetter.attachments && selectedLetter.attachments.length > 0 && (
                <div className="pt-2 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">المرفقات:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400 pr-2">
                    {selectedLetter.attachments.map((att, idx) => (
                      <li key={idx}>{att}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Closing */}
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 pt-3">
                {selectedLetter.closing}
              </p>

              {/* Signatures & Seal Block */}
              <div className="pt-10 border-t border-slate-200 dark:border-slate-700 grid grid-cols-3 gap-6 text-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                <div className="space-y-6">
                  <p className="font-bold">معد الخطاب / مقدم الطلب</p>
                  <div>
                    <p className="text-slate-900 dark:text-white font-extrabold">{selectedLetter.senderName}</p>
                    <p className="text-[10px] text-slate-500">{selectedLetter.senderRole}</p>
                  </div>
                  <p className="text-[10px] text-slate-400">التوقيع: .....................</p>
                </div>

                <div className="space-y-6">
                  <p className="font-bold">المعلم الأول للمادة</p>
                  <div>
                    <p className="text-slate-500 font-normal">.................................</p>
                    <p className="text-[10px] text-slate-400">إشراف وتدقيق</p>
                  </div>
                  <p className="text-[10px] text-slate-400">التوقيع: .....................</p>
                </div>

                <div className="space-y-6">
                  <p className="font-bold">يعتمد / مدير المدرسة</p>
                  <div>
                    <p className="text-slate-500 font-normal">.................................</p>
                    <p className="text-[10px] text-slate-400">الختم الرسمي للمدرسة</p>
                  </div>
                  <p className="text-[10px] text-slate-400">التوقيع: .....................</p>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800 print:hidden text-xs">
                <button
                  onClick={() => handleDeleteLetter(selectedLetter.id)}
                  className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700 font-bold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف هذا الخطاب</span>
                </button>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={handleExportToPdf}
                    disabled={isExportingPdf}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="تحويل وتصدير الخطاب إلى ملف PDF رسمي عالي الدقة"
                  >
                    {isExportingPdf ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    <span>{isExportingPdf ? 'جاري التحويل...' : 'تحويل إلى PDF 📄'}</span>
                  </button>
                  <button
                    onClick={handlePrintLetter}
                    className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition shadow-md flex items-center gap-1.5 cursor-pointer"
                    title="طباعة الخطاب الرسمي"
                  >
                    <Printer className="w-4 h-4" />
                    <span>طباعة رسمية 🖨️</span>
                  </button>
                  <button
                    onClick={handleDownloadPrintableHtmlLetter}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 font-bold transition flex items-center gap-1.5 cursor-pointer"
                    title="تنزيل صفحة مستقلة تفتح وتطبع بـ Ctrl+P في أي متصفح"
                  >
                    <FileText className="w-3.5 h-3.5 text-sky-600" />
                    <span>ملف مستقل للطباعة</span>
                  </button>
                  <button
                    onClick={handleCopyLetter}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 transition cursor-pointer"
                  >
                    {copied ? 'تم النسخ' : 'نسخ النص'}
                  </button>
                  <button
                    onClick={() => setWhatsappModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold transition shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>إرسال الخطاب إلى واتساب 📲</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
              <Mail className="w-16 h-16 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">اختر خطاباً لعرضه أو طباعته</h3>
              <p className="text-xs text-slate-400 mt-1">أو اضغط على زر "كتابة خطاب رسمي جديد" للاستفادة من النماذج المعتمدة.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create / Compose Official Letter */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5 text-right text-xs">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-teal-600" />
                <span>صياغة خطاب ومراسلة رسمية جديدة</span>
              </h3>
              <button onClick={() => setCreateModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Quick Templates Selector */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-bold text-[11px] text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                نماذج جاهزة سريعة الصياغة لمراسلات سلطنة عمان:
              </span>
              <div className="flex flex-wrap gap-2">
                {LETTER_TEMPLATES[activeTab].map((tpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-teal-500 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition"
                  >
                    {tpl.category}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveNewLetter} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">الجهة الموجه إليها الخطاب:</label>
                  <select
                    value={letterForm.letterType}
                    onChange={e => {
                      const newType = e.target.value as LetterRecipientType;
                      setLetterForm(prev => ({ ...prev, letterType: newType }));
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  >
                    <option value="directorate">المديرية العامة للتربية والتعليم</option>
                    <option value="school_admin">إدارة المدرسة</option>
                    <option value="parent">ولي أمر الطالب</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">تصنيف الخطاب:</label>
                  <input
                    type="text"
                    required
                    value={letterForm.category}
                    onChange={e => setLetterForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">عنوان الخطاب وموضوعه الرئيسي: *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: طلب تزويد المدرسة بأجهزة ونظم معلومات جغرافية (GIS)"
                  value={letterForm.title}
                  onChange={e => setLetterForm(prev => ({ ...prev, title: e.target.value, subject: prev.subject || e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">الموجه إليه (الاسم واللقب): *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: الفاضل / مدير عام المديرية العامة للتربية والتعليم"
                    value={letterForm.recipientName}
                    onChange={e => setLetterForm(prev => ({ ...prev, recipientName: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">اللقب والتحية التشريفية:</label>
                  <input
                    type="text"
                    value={letterForm.recipientTitle}
                    onChange={e => setLetterForm(prev => ({ ...prev, recipientTitle: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  />
                </div>
              </div>

              {letterForm.letterType === 'parent' && (
                <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-medium mb-1">اسم الطالب:</label>
                    <input
                      type="text"
                      placeholder="اسم الطالب كاملاً"
                      value={letterForm.studentName}
                      onChange={e => setLetterForm(prev => ({ ...prev, studentName: e.target.value }))}
                      className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">الصف الدراسي:</label>
                    <input
                      type="text"
                      placeholder="الصف الثاني عشر"
                      value={letterForm.gradeName}
                      onChange={e => setLetterForm(prev => ({ ...prev, gradeName: e.target.value }))}
                      className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">الشعبة:</label>
                    <input
                      type="text"
                      placeholder="12/1"
                      value={letterForm.sectionName}
                      onChange={e => setLetterForm(prev => ({ ...prev, sectionName: e.target.value }))}
                      className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border text-xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1">الموضوع (كما يظهر بعد التحية): *</label>
                <input
                  type="text"
                  required
                  value={letterForm.subject}
                  onChange={e => setLetterForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">نص ومتن الخطاب (افصل بين الفقرات بسطر فارغ): *</label>
                <textarea
                  rows={5}
                  required
                  value={letterForm.bodyText}
                  onChange={e => setLetterForm(prev => ({ ...prev, bodyText: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">التوصية أو الإجراء المطلوب (اختياري):</label>
                <textarea
                  rows={2}
                  placeholder="مثال: التكرم بالموافقة واعتماد برنامج الزيارة الميدانية..."
                  value={letterForm.actionRequired}
                  onChange={e => setLetterForm(prev => ({ ...prev, actionRequired: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">المرفقات (سطر لكل مرفق):</label>
                  <textarea
                    rows={2}
                    value={letterForm.attachmentsText}
                    onChange={e => setLetterForm(prev => ({ ...prev, attachmentsText: e.target.value }))}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">الرقم الإشاري والتاريخ:</label>
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={letterForm.referenceNumber}
                      onChange={e => setLetterForm(prev => ({ ...prev, referenceNumber: e.target.value }))}
                      className="w-full p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border text-xs font-mono"
                    />
                    <input
                      type="text"
                      value={letterForm.dateMiladi}
                      onChange={e => setLetterForm(prev => ({ ...prev, dateMiladi: e.target.value }))}
                      className="w-full p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition shadow-md"
                >
                  حفظ الخطاب الرسمي
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Document Header (الترويسة العلوية للخطاب) */}
      {editHeaderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 text-right text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    تعديل البيانات والترويسة أعلى الصفحة للخطاب الرسمي
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    تخصيص اسم المدرسة، المديرية التعليمية، التواريخ، والرقم الإشاري
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditHeaderModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveHeader} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم المدرسة (School Name):
                </label>
                <input
                  type="text"
                  required
                  value={headerForm.schoolName}
                  onChange={e => setHeaderForm(prev => ({ ...prev, schoolName: e.target.value }))}
                  placeholder="مدرسة كعب بن برشة للتعليم ما بعد الأساسي"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  المديرية العامة للتربية والتعليم بمحافظة:
                </label>
                <input
                  type="text"
                  required
                  value={headerForm.directorateName}
                  onChange={e => setHeaderForm(prev => ({ ...prev, directorateName: e.target.value }))}
                  placeholder="المديرية العامة للتربية والتعليم بمحافظة شمال الباطنة"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    التاريخ الميلادي:
                  </label>
                  <input
                    type="text"
                    required
                    value={headerForm.dateMiladi}
                    onChange={e => setHeaderForm(prev => ({ ...prev, dateMiladi: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    التاريخ الهجري:
                  </label>
                  <input
                    type="text"
                    required
                    value={headerForm.dateHijri}
                    onChange={e => setHeaderForm(prev => ({ ...prev, dateHijri: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الرقم الإشاري (Reference No.):
                </label>
                <input
                  type="text"
                  required
                  value={headerForm.referenceNumber}
                  onChange={e => setHeaderForm(prev => ({ ...prev, referenceNumber: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-teal-700 dark:text-teal-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    اسم معد الخطاب:
                  </label>
                  <input
                    type="text"
                    required
                    value={headerForm.senderName}
                    onChange={e => setHeaderForm(prev => ({ ...prev, senderName: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الصفة / المسمى الوظيفي:
                  </label>
                  <input
                    type="text"
                    required
                    value={headerForm.senderRole}
                    onChange={e => setHeaderForm(prev => ({ ...prev, senderRole: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="cascadeToProfile"
                  checked={headerForm.cascadeToProfile}
                  onChange={e => setHeaderForm(prev => ({ ...prev, cascadeToProfile: e.target.checked }))}
                  className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <label htmlFor="cascadeToProfile" className="text-[11px] text-teal-900 dark:text-teal-200 cursor-pointer select-none">
                  اعتماد اسم المدرسة والمديرية كترويسة موحدة لجميع أقسام المنصة (الخطط والجدول)
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditHeaderModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={savingHeader}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {savingHeader ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>حفظ وتطبيق الترويسة فوراً</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Share Modal with PDF Attachment */}
      {whatsappModalOpen && selectedLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    إرسال الخطاب الرسمي عبر واتساب 📲
                  </h3>
                  <p className="text-xs text-slate-500">
                    يصلك في الواتساب كملف PDF رسمي بنفس تنسيق وألوان المكتبة الذكية بالإضافة إلى النص المنسق
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWhatsappModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Smart Library Format Assurance Badge */}
            <div className="p-3 rounded-2xl bg-linear-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>مرفق ملف PDF أصلي بنفس ترويسة وختم وتنسيق المكتبة الذكية</span>
              </div>
              <button
                onClick={preparePdfForWhatsApp}
                disabled={isPreparingPdf}
                className="text-[11px] font-bold text-teal-700 hover:underline shrink-0 flex items-center gap-1 cursor-pointer"
              >
                {isPreparingPdf ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-amber-500" />}
                <span>{generatedPdfUrl ? 'الـ PDF جاهز 📄' : 'تجهيز الـ PDF الآن'}</span>
              </button>
            </div>

            {/* Recipient Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                رقم هاتف المستلم (ولي الأمر / الإدارة / هاتفك الشخصي):
              </label>
              <input
                type="text"
                value={recipientPhone}
                onChange={e => setRecipientPhone(e.target.value)}
                placeholder="+96877394680"
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold"
              />
              <span className="text-[11px] text-slate-400">
                يمكنك تركه فارغاً والضغط على (فتح في واتساب) لتحديد أي جهة اتصال أو مجموعة مباشرة من التطبيق.
              </span>
            </div>

            {/* Preview of Formatted WhatsApp Message */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  معاينة نص الخطاب بصيغة الواتساب:
                </label>
                <button
                  onClick={handleCopyWhatsAppText}
                  className="text-xs text-teal-600 hover:text-teal-700 font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedWhatsApp ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedWhatsApp ? 'تم النسخ' : 'نسخ النص'}</span>
                </button>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 max-h-48 overflow-y-auto text-xs font-sans text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed select-all">
                {getLetterWhatsAppText()}
              </div>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Option 1: Direct Open in WhatsApp (100% works without any tokens) */}
              <button
                onClick={handleOpenDirectWhatsApp}
                className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>فتح في واتساب فوراً (مع رابط الـ PDF المنسق)</span>
              </button>

              {/* Option 2: Send via Cloud API (if configured) */}
              <button
                onClick={handleSendViaCloudApi}
                disabled={sendingWhatsApp || isPreparingPdf}
                className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {sendingWhatsApp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-emerald-400" />}
                <span>{sendingWhatsApp ? 'جاري إرسال المستند...' : 'إرسال كملف PDF عبر Meta Cloud API 🚀'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
