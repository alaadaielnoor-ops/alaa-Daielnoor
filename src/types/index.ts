export type RoleType = 'admin' | 'teacher' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: RoleType;
  avatarUrl?: string;
  createdAt: string;
}

export interface EducationalStage {
  id: string;
  name: string; // e.g. "المرحلة المتوسطة", "المرحلة الثانوية"
  order: number;
}

export interface Grade {
  id: string;
  stageId: string;
  name: string; // e.g. "الصف الأول المتوسط", "الصف الثاني الثانوي"
  order: number;
}

export interface Subject {
  id: string;
  name: string; // e.g. "الجغرافيا", "الدراسات الاجتماعية", "الجيولوجيا"
  code: string;
  color: string;
  description?: string;
}

export interface Semester {
  id: string;
  name: string; // "الفصل الدراسي الأول", "الفصل الدراسي الثاني"
  order: number;
}

export interface Unit {
  id: string;
  subjectId: string;
  gradeId: string;
  semesterId: string;
  title: string; // e.g. "الوحدة الأولى: كوكب الأرض وتضاريسه"
  order: number;
  description?: string;
}

export interface Lesson {
  id: string;
  unitId: string;
  title: string; // e.g. "الدرس الثالث: الصفائح التكتونية والزلازل"
  order: number;
  objectives?: string[];
  concepts?: string[];
}

export type ResourceType = 'textbook' | 'teacher_guide' | 'reference' | 'map' | 'atlas' | 'article' | 'research' | 'external_link';
export type FileFormat = 'pdf' | 'docx' | 'pptx' | 'xlsx' | 'txt' | 'image' | 'link';
export type ProcessingStatus = 'pending' | 'processing' | 'indexed' | 'failed' | 'needs_ocr';
export type ReliabilityLevel = 'official' | 'academic' | 'enrichment' | 'unverified';

export interface Resource {
  id: string;
  title: string;
  author: string;
  publisher?: string;
  publicationYear?: number;
  language: string;
  type: ResourceType;
  format: FileFormat;
  sourceUrl?: string;
  license?: string;
  description?: string;
  coverImageUrl?: string;
  aiCategory?: string; // e.g. 'جغرافية طبيعية وبيئية', 'جغرافية بشرية واقتصادية', 'استراتيجيات تدريس'
  aiSubCategories?: string[]; // e.g. ['تضاريس', 'مناخ', 'أفلاج']
  aiConfidence?: number; // 0.0 - 1.0
  aiSummary?: string; // AI generated pedagogical abstract
  aiKeyTopics?: string[]; // Key topics identified by AI
  subjectId?: string;
  stageId?: string;
  gradeId?: string;
  unitId?: string;
  lessonId?: string;
  reliability: ReliabilityLevel;
  tags: string[];
  keywords: string[];
  vision2040Tags?: string[]; // ارتباط الكتاب أو المرجع بمحاور وأهداف رؤية عمان 2040
  fileSize?: number;
  fileName?: string;
  fileHash?: string; // SHA-256 for duplicate detection
  filePath?: string;
  pageCount?: number;
  processingStatus: ProcessingStatus;
  processingError?: string;
  ocrApplied?: boolean;
  ocrConfidence?: number;
  isArchived: boolean;
  isDeleted: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentPage {
  id: string;
  resourceId: string;
  pageNumber: number; // PDF 1-based index
  printedPageNumber?: number; // In-book page number (e.g. 45)
  content: string;
  confidence: number;
  isOcr: boolean;
  chapterOrUnitTitle?: string;
}

export interface DocumentChunk {
  id: string;
  resourceId: string;
  pageId: string;
  pageNumber: number;
  printedPageNumber?: number;
  chunkIndex: number;
  content: string;
  charLength: number;
  heading?: string;
  keywords: string[];
  embedding?: number[];
  subjectName?: string;
  gradeName?: string;
  unitTitle?: string;
}

export interface ProcessingJob {
  id: string;
  resourceId: string;
  fileName: string;
  status: ProcessingStatus;
  progress: number; // 0-100
  pagesProcessed: number;
  totalPages: number;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
}

export interface GeographicResource {
  id: string;
  resourceId?: string;
  title: string;
  category: 'physical_map' | 'political_map' | 'topographic' | 'satellite' | 'climate_chart' | 'demographic' | 'field_photo';
  regionName: string;
  country?: string;
  coordinates?: {
    lat: number;
    lng: number;
    zoom?: number;
  };
  scale?: string; // e.g. "1:50,000"
  projection?: string; // e.g. "Mercator"
  year?: number;
  imageUrl: string;
  description: string;
  educationalApplications: string[];
  license: string;
  tags: string[];
  createdAt: string;
}

export interface ExternalReference {
  id: string;
  title: string;
  url: string;
  authorOrEntity?: string;
  publishDate?: string;
  accessDate: string;
  topic: string;
  reliability: ReliabilityLevel;
  license?: string;
  teacherNotes?: string;
  tags: string[];
  isAccessible?: boolean;
  lastChecked?: string;
  createdAt: string;
}

export interface GroundedPlace {
  title: string;
  uri: string;
  address?: string;
  reviewSnippets?: string[];
  types?: string[];
}

export interface GroundedWebSource {
  title: string;
  uri: string;
}

export type ChatbotPersonaId =
  | 'curriculum_supervisor'
  | 'gis_geographer'
  | 'activity_designer'
  | 'vision2040_mentor';

export interface ChatbotPersona {
  id: ChatbotPersonaId;
  name: string;
  roleTitle: string;
  description: string;
  badge: string;
  suggestedPrompts: string[];
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: Array<{
    resourceId: string;
    resourceTitle: string;
    pageNumber: number;
    printedPageNumber?: number;
    snippet: string;
    confidence?: number;
  }>;
  groundedPlaces?: GroundedPlace[];
  isMapsGrounded?: boolean;
  groundedWebSources?: GroundedWebSource[];
  isSearchGrounded?: boolean;
  searchQueries?: string[];
  modelUsed?: string;
  personaId?: ChatbotPersonaId;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  userId: string;
  scopeResourceIds?: string[];
  personaId?: ChatbotPersonaId;
  model?: 'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-4-argon';
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedLesson {
  id: string;
  title: string;
  subjectName: string;
  stageName: string;
  gradeName: string;
  unitTitle: string;
  lessonTitle: string;
  durationMinutes: number;
  objectives: {
    cognitive: string[]; // معرفية
    affective: string[]; // وجدانية
    psychomotor: string[]; // مهارية
  };
  conceptsAndTerms: Array<{ term: string; definition: string }>;
  prerequisites: string[];
  toolsAndResources: string[];
  hook: string; // التمهيد والإثارة
  procedures: Array<{
    stepNumber: number;
    title: string;
    durationMinutes: number;
    teacherActivity: string;
    studentActivity: string;
    strategy: string;
  }>;
  assessmentMethods: {
    formative: string[];
    summative: string[];
  };
  differentiation: {
    supportLevel: string[]; // الطلاب الذين يحتاجون دعماً
    enrichmentLevel: string[]; // الطلاب الموهوبون
  };
  homework: string;
  referencedSources: Array<{
    resourceTitle: string;
    pages: string;
    notes?: string;
  }>;
  vision2040Goals?: Array<{
    code: string;
    goalTitle: string;
    applicationInLesson: string; // التوظيف والتطبيق الصفي العملي للهدف في الحصة
  }>;
  pedagogicalFramework?: PedagogicalFramework;
  // Official Omani Ministry Header fields
  schoolName?: string;
  directorateName?: string;
  teacherName?: string;
  supervisorName?: string;
  academicYear?: string;
  semesterName?: string;
  dateStr?: string;
  sectionName?: string;
  isTemplate: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface PedagogicalTheoryItem {
  theoryId: string;
  name: string; // e.g. "النظرية البنائية (Constructivism)"
  justification: string; // مبرر تربوي موجز يبين سبب اختيار هذه النظرية لهذا الدرس تحديداً
  classroomApplication: string; // التطبيق الميداني في خطوات الدرس (التمهيد، سير الحصة، التقويم)
}

export interface PedagogicalFramework {
  theories: PedagogicalTheoryItem[];
  selectedStrategies: string[]; // e.g. ["الاستقصاء الجغرافي (Geographic Inquiry)", "خرائط المفاهيم والخرائط الرقمية", "التعلم القائم على المشكلات (PBL)", "فكر-زاوج-شارك"]
  activeLearningMechanisms?: string; // آليات التعلم النشط وتمايز التعليم
  vision2040PedagogicalLink?: string; // الارتباط بمحددات رؤية عمان 2040 (مهارات القرن 21، التفكير المكاني، الابتكار)
  teachersGuideReference?: string; // الاستناد إلى دليل المعلم المعتمد لوزارة التربية والتعليم
}

export interface Worksheet {
  id: string;
  title: string;
  subjectName: string;
  gradeName: string;
  unitTitle?: string;
  targetObjective: string;
  timeMinutes: number;
  instructions: string;
  difficultyLevels: 'mixed' | 'beginner' | 'intermediate' | 'advanced';
  activities: Array<{
    id: string;
    type: 'individual' | 'pair' | 'collaborative' | 'critical_thinking' | 'map_exercise';
    title: string;
    prompt: string;
    guidelines?: string;
    rubric?: string;
  }>;
  referencedSources?: string[];
  createdById: string;
  createdAt: string;
}

export interface AssessmentQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'short_answer' | 'essay' | 'map_interpretation' | 'data_analysis';
  prompt: string;
  options?: string[]; // for MCQ
  correctAnswer: string;
  explanation?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  objectiveTarget?: string;
  isDirectFromTextbook: boolean;
  sourceCitation?: {
    resourceTitle: string;
    pageNumber: number;
  };
}

export interface Assessment {
  id: string;
  title: string;
  subjectName: string;
  gradeName: string;
  unitTitle?: string;
  totalPoints: number;
  timeLimitMinutes: number;
  instructions: string;
  questions: AssessmentQuestion[];
  gradingRubric: Array<{ criteria: string; points: number; description: string }>;
  createdById: string;
  createdAt: string;
}

export interface PresentationSlide {
  id: string;
  slideNumber: number;
  title: string;
  bulletPoints: string[];
  conceptBox?: { term: string; explanation: string };
  mapOrImageDescription?: string;
  embeddedMapType?: '3d_earth' | 'open_topo' | 'windy' | 'osm_political' | 'oman_vector';
  embeddedMapQuery?: string;
  mapCoordinates?: { lat: number; lng: number; zoom?: number };
  transition?: 'slide' | 'fade' | 'convex' | 'zoom' | 'slide-up';
  vision2040Goal?: string;
  highlightWords?: string[];
  speakerNotes: string;
}


export interface PresentationDeck {
  id: string;
  title: string;
  subjectName: string;
  gradeName: string;
  unitTitle: string;
  slides: PresentationSlide[];
  summaryCards: Array<{ title: string; points: string[] }>;
  comparisonTables?: Array<{
    title: string;
    columns: string[];
    rows: string[][];
  }>;
  createdById: string;
  createdAt: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  resourceId: string;
  pageNumber: number;
  title: string;
  note?: string;
  color?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete' | 'restore' | 'archive' | 'ocr_run' | 'backup' | 'restore_backup' | 'sync';
  targetType: 'resource' | 'lesson' | 'assessment' | 'worksheet' | 'taxonomy' | 'system' | 'user';
  targetId: string;
  description: string;
  timestamp: string;
}

export interface BackupJob {
  id: string;
  filename: string;
  sizeBytes: number;
  itemCounts: {
    resources: number;
    pages: number;
    chunks: number;
    lessons: number;
    worksheets: number;
    assessments: number;
    geographic: number;
  };
  status: 'completed' | 'failed' | 'restored';
  checksum: string;
  createdAt: string;
}

export interface SyncOperation {
  id: string;
  entityType: string;
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  payload: any;
  clientTimestamp: string;
  status: 'pending' | 'applied' | 'conflict';
}

export interface SystemStats {
  totalResources: number;
  totalFiles: number;
  totalStorageBytes: number;
  totalLessons: number;
  totalWorksheets: number;
  totalAssessments: number;
  totalGeographicResources: number;
  totalExternalReferences: number;
  totalAnnualPlans?: number;
  totalTimetables?: number;
  totalOfficialLetters?: number;
  totalCalendarEvents?: number;
  totalStudents?: number;
  indexedPages: number;
  pendingJobs: number;
  failedJobs: number;
  lastBackupDate?: string;
  resourcesBySubject: Record<string, number>;
  resourcesByFormat: Record<string, number>;
}

// ----------------------------------------------------
// الخطط السنوية والفصلية (Annual & Semester Curriculum Plans)
// ----------------------------------------------------
export interface AnnualPlanWeek {
  weekNumber: number;
  dateRange?: string; // e.g. "الأسبوع 1: 1 - 5 سبتمبر"
  unitTitle: string;
  lessonTitle: string;
  periodsCount: number;
  learningOutcomes: string[];
  teachingStrategies: string[];
  assessmentMethods: string[];
  teachingAids: string[];
  notes?: string;
}

export interface AnnualPlan {
  id: string;
  title: string;
  academicYear: string; // e.g. "2026/2027 م - 1448 هـ"
  stageId: string;
  stageName: string;
  gradeId: string;
  gradeName: string;
  subjectId: string;
  subjectName: string;
  semesterId: string;
  semesterName: string;
  teacherName: string;
  supervisorName?: string;
  schoolName: string;
  directorateName: string; // e.g. "المديرية العامة للتربية والتعليم بمحافظة مسقط"
  totalWeeks: number;
  periodsPerWeek: number;
  generalObjectives: string[];
  weeklyDistribution: AnnualPlanWeek[];
  notes?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------
// جدول الحصص الأسبوعي (Weekly Timetable)
// ----------------------------------------------------
export type SchoolDay = 'الأحد' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس';

export interface TimetablePeriod {
  periodNumber: number; // 1 to 8
  name: string; // e.g. "الحصة الأولى"
  startTime: string; // e.g. "07:30"
  endTime: string; // e.g. "08:15"
  isBreak?: boolean;
}

export interface TimetableEntry {
  id: string;
  day: SchoolDay;
  periodNumber: number; // 1 to 8
  gradeId: string;
  gradeName: string;
  section: string; // e.g. "12/1" أو "شعبة 2"
  subject: string;
  room: string; // e.g. "قاعة الجغرافيا" أو "مختبر الحاسوب"
  color: string; // Hex or Tailwind color
  notes?: string;
}

export interface WeeklyTimetable {
  id: string;
  title: string;
  academicYear: string;
  semester: string;
  teacherName: string;
  schoolName: string;
  directorateName: string;
  periods: TimetablePeriod[];
  entries: TimetableEntry[];
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------
// كتابة الخطابات والمراسلات الرسمية (Official Letters & Correspondence)
// ----------------------------------------------------
export type LetterRecipientType = 'directorate' | 'school_admin' | 'parent';

export interface OfficialLetter {
  id: string;
  letterType: LetterRecipientType; // 'directorate' = مديرية التربية والتعليم | 'school_admin' = إدارة المدرسة | 'parent' = ولي أمر الطالب
  category: string; // e.g. "طلب تجهيزات", "رحلة استكشافية", "تفوق دراسي", "تأخر أو غياب", "استئذان قاعة"
  title: string;
  referenceNumber: string; // الرقم الإشاري، e.g. ع/م/1448/25
  dateHijri: string;
  dateMiladi: string;
  schoolName: string;
  directorateName: string;
  senderName: string;
  senderRole: string; // e.g. "معلم أول مادة الجغرافيا والدراسات الاجتماعية"
  recipientName: string; // e.g. "الفاضل / مدير عام المديرية العامة للتربية والتعليم" أو "الفاضل / مدير المدرسة" أو "الفاضل / ولي أمر الطالب"
  recipientTitle: string; // "المحترم / حفظه الله ورعاه"
  subject: string; // موضوع الخطاب
  salutation: string; // "السلام عليكم ورحمة الله وبركاته، وبعد:"
  studentName?: string;
  gradeName?: string;
  sectionName?: string;
  bodyParagraphs: string[];
  actionRequired?: string; // التوصية أو الإجراء المطلوب
  attachments?: string[]; // المرفقات
  closing: string; // "وتفضلوا بقبول فائق الاحترام والتقدير،،،"
  supervisorApproval?: boolean;
  principalApproval?: boolean;
  status: 'draft' | 'approved' | 'sent';
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------
// الملف التعريفي والترويسة المدرسية الموحدة (School Profile & Official Letterhead)
// ----------------------------------------------------
export interface SchoolProfile {
  schoolName: string; // اسم المدرسة
  teacherName?: string; // اسم الأستاذ / المعلم
  supervisorName?: string; // اسم المشرف التربوي / المعلم الأول
  governorateName?: string; // اسم المحافظة (مسقط، شمال الباطنة، الداخلية...)
  directorateName: string; // المديرية العامة للتربية والتعليم
  ministryName: string; // وزارة التربية والتعليم
  countryName: string; // سلطنة عمان
  academicYear: string; // العام الدراسي
  semester?: string; // الفصل الدراسي (الأول / الثاني)
  principalName?: string; // مدير المدرسة
  firstTeacherName?: string; // المعلم الأول
  subjectName?: string; // المادة الدراسية والتخصص
  stampText?: string; // نص الختم المعتمد
  phone?: string;
  email?: string;
  updatedAt?: string;
}

// ----------------------------------------------------
// تكامل الواتساب الذكي (WhatsApp Webhook & Assistant API)
// ----------------------------------------------------
export interface WhatsAppAuthorizedNumber {
  id: string;
  phone: string; // e.g. "+96891234567"
  name: string;
  role: RoleType;
  active: boolean;
  notes?: string;
}

export interface WhatsAppConfig {
  enabled: boolean;
  provider: 'cloud_api' | 'twilio' | 'qr_local' | 'mock_simulator';
  phoneNumber: string; // الرقم المفعل في واتساب
  phoneNumberId?: string; // معرف رقم الهاتف في Meta Cloud API
  wabaId?: string; // WhatsApp Business Account ID
  displayName: string;
  accountId?: string;
  apiKey?: string; // Access Token
  webhookVerifyToken: string;
  webhookUrl?: string;
  authorizedNumbers: WhatsAppAuthorizedNumber[];
  autoReplySettings: {
    allowLessonGeneration: boolean;
    allowTimetableLookup: boolean;
    allowLibrarySearch: boolean;
    welcomeMessage: string;
    fallbackMessage: string;
  };
  termsAccepted: boolean;
  termsAcceptedAt?: string;
  activatedAt?: string;
  lastPingAt?: string;
}

export interface WhatsAppMessageLog {
  id: string;
  direction: 'inbound' | 'outbound';
  fromPhone: string;
  toPhone: string;
  senderName?: string;
  messageText: string;
  intent: 'lesson_request' | 'timetable_request' | 'library_search' | 'help' | 'greeting' | 'unknown' | 'official_letter_request';
  status: 'received' | 'processing' | 'replied' | 'failed';
  responseSummary?: string;
  generatedLessonId?: string;
  letterId?: string;
  createdAt: string;
}

// ----------------------------------------------------
// أهداف ومحاور رؤية عُمان 2040 في التعليم والتعلم (Oman Vision 2040 Education Framework)
// ----------------------------------------------------
export interface OmanVision2040Goal {
  id: string;
  code: string; // e.g. "V2040-EDU-01", "V2040-EDU-02"
  title: string;
  pillar: string; // 'الإنسان والمجتمع' | 'الاقتصاد والتنمية' | 'البيئة المستدامة'
  priority: string; // 'التعليم والتعلم والبحث العلمي والقدرات الوطنية' | 'المواطنة والهوية والتراث' | 'البيئة والموارد الطبيعية'
  description: string;
  targetCompetencies: string[]; // مهارات المستقبل المرتبطة
  classroomApplications: string[]; // أمثلة التوظيف الصفي في تدريس المواد الجغرافية والتربوية
  relatedSubjectCodes?: string[];
}

// ----------------------------------------------------
// التقويم التربوي وجدولة الاختبارات والأنشطة (Educational Calendar & Deadlines)
// ----------------------------------------------------
export type CalendarEventType = 'exam' | 'activity' | 'task' | 'ministry_event' | 'lesson';
export type CalendarEventPriority = 'low' | 'medium' | 'high' | 'urgent';
export type CalendarEventStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface EducationalCalendarEvent {
  id: string;
  title: string; // e.g. "الاختبار القصير الأول: جغرافية سلطنة عمان"
  type: CalendarEventType;
  subjectId?: string;
  subjectName?: string; // e.g. "الجغرافيا", "هذا وطني", "الدراسات الاجتماعية"
  gradeId?: string;
  gradeName?: string; // e.g. "الصف الثاني عشر", "الصف التاسع"
  section?: string; // e.g. "12/1", "12/2"
  startDate: string; // "YYYY-MM-DD"
  startTime?: string; // "08:00"
  endDate: string; // "YYYY-MM-DD"
  endTime?: string; // "09:00"
  allDay?: boolean;
  location?: string; // e.g. "قاعة الجغرافيا", "مختبر الحاسوب"
  description?: string; // تفاصيل الاختبار أو النشاط ومحاوره
  priority: CalendarEventPriority;
  status: CalendarEventStatus;
  reminderMinutes?: number; // e.g. 15, 60, 1440
  linkedAssessmentId?: string; // ربط باختبار موجود في استوديو الاختبارات
  linkedWorksheetId?: string; // ربط بورقة عمل من استوديو الأنشطة
  vision2040Pillar?: string; // e.g. "جودة التعليم", "البيئة والموارد المستدامة"
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------
// سجل الطلاب والملف التراكمي الشامل (Student Records & Profiles)
// ----------------------------------------------------
export interface StudentGradeRecord {
  id: string;
  assessmentName: string; // e.g. "الاختبار القصير الأول", "الواجب الصفي", "التقرير الميداني", "الامتحان النهائي"
  category: 'short_exam' | 'activity' | 'project' | 'participation' | 'final_exam' | 'other';
  maxScore: number;
  obtainedScore: number;
  date: string;
  notes?: string;
}

export interface StudentAttendanceRecord {
  id: string;
  date: string; // "YYYY-MM-DD"
  status: 'present' | 'absent' | 'late' | 'excused';
  periodNumber?: number; // الحصة (1-8) أو اليوم الكامل
  reason?: string; // عذر طبي، غياب بدون عذر، تأخر صباحي
}

export interface StudentPedagogicalNote {
  id: string;
  date: string;
  category: 'positive' | 'academic' | 'behavioral' | 'support_needed' | 'special_talent'; // تفوق في الجغرافيا، يحتاج تعزيز في رسم الخرائط، إشادة بالمشاركة
  title: string;
  content: string;
  authorName?: string;
  actionTaken?: string;
}

export interface StudentOfficialLetterRef {
  id: string;
  letterId?: string;
  title: string;
  type: string; // استدعاء ولي أمر، إشعار تدني مستوى، شكر وتقدير، إشعار غياب
  date: string;
  status: 'draft' | 'approved' | 'sent';
  pdfUrl?: string;
}

export interface StudentAttachment {
  id: string;
  title: string;
  date: string;
  fileUrl?: string;
  category: 'medical' | 'certificate' | 'worksheet' | 'other';
  notes?: string;
}

export interface Student {
  id: string;
  nationalId?: string; // الرقم المدني العماني
  studentNumber: string; // الرقم الأكاديمي للطالب
  fullName: string; // الاسم الرباعي والقبيلة (e.g. "أحمد بن سعيد بن ناصر المعمري")
  gender: 'male' | 'female';
  gradeId: string; // e.g. "grd-12"
  gradeName: string; // e.g. "الصف الثاني عشر (دبلوم التعليم العام)"
  section: string; // e.g. "12/1", "12/2", "11/1", "10/1"
  dateOfBirth?: string;
  parentName?: string; // اسم ولي الأمر
  parentPhone?: string; // رقم هاتف ولي الأمر (واتساب)
  parentRelation?: string; // الأب، الأم، الولي
  address?: string; // المحافظة والولاية والقرية (e.g. "محافظة شمال الباطنة - ولاية صحم")
  avatarUrl?: string;
  academicStatus: 'excellent' | 'good' | 'average' | 'needs_support';
  medicalNotes?: string; // حساسية، حالات خاصة
  specialTalents?: string[]; // مهارات رسم الخرائط، حب الاستكشاف، الخط، الإلقاء
  grades: StudentGradeRecord[];
  attendance: StudentAttendanceRecord[];
  notes: StudentPedagogicalNote[];
  letters: StudentOfficialLetterRef[];
  attachments: StudentAttachment[];
  customFields?: Record<string, string>; // أي بند إضافي يرغب المعلم بإضافته في ملف الطالب
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------
// تنبيهات وإشعارات انحدار مستوى الطالب مقارنة بمتوسط الصف (Student Performance Alerts)
// ----------------------------------------------------
export interface StudentPerformanceAlert {
  id: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  gradeName: string;
  section: string;
  parentPhone?: string;
  parentName?: string;
  assessmentName: string;
  category: 'short_exam' | 'activity' | 'project' | 'participation' | 'final_exam' | 'other';
  studentScore: number;
  maxScore: number;
  studentPercentage: number;
  classAverageScore: number;
  classAveragePercentage: number;
  deviationPercentage: number; // e.g. -24.5 (24.5% below class average)
  severity: 'critical' | 'warning' | 'notice';
  title: string;
  description: string;
  date: string;
  isRead: boolean;
  remedialPlanSuggested?: string;
  notifiedViaWhatsApp?: boolean;
  notifiedAt?: string;
  createdAt: string;
}

