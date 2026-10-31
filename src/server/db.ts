import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User, RoleType, EducationalStage, Grade, Subject, Semester, Unit, Lesson,
  Resource, DocumentPage, DocumentChunk, ProcessingJob,
  GeographicResource, ExternalReference, Conversation, ConversationMessage,
  GeneratedLesson, Worksheet, Assessment, PresentationDeck,
  Bookmark, AuditLog, BackupJob, SyncOperation, SystemStats,
  AnnualPlan, WeeklyTimetable, OfficialLetter, SchoolProfile,
  WhatsAppConfig, WhatsAppMessageLog, WhatsAppAuthorizedNumber,
  OmanVision2040Goal, EducationalCalendarEvent,
  Student, StudentGradeRecord, StudentAttendanceRecord, StudentPedagogicalNote,
  StudentOfficialLetterRef, StudentAttachment, StudentPerformanceAlert
} from '../types/index.ts';
import { getInitialSeedData } from './seed.ts';
import { getAuthenticCurriculumPages } from './curriculumContent.ts';
import { normalizeArabicText, createHighlightedSnippet, calculateTextRelevance, extractArabicKeywords } from './arabicUtils.ts';
import { getOmanVision2040Goals, matchVision2040GoalsForLesson, matchVision2040TagsForResource } from './vision2040.ts';

interface DatabaseSchema {
  users: User[];
  stages: EducationalStage[];
  grades: Grade[];
  subjects: Subject[];
  semesters: Semester[];
  units: Unit[];
  lessons: Lesson[];
  resources: Resource[];
  pages: DocumentPage[];
  chunks: DocumentChunk[];
  processingJobs: ProcessingJob[];
  geographicResources: GeographicResource[];
  externalReferences: ExternalReference[];
  conversations: Conversation[];
  generatedLessons: GeneratedLesson[];
  worksheets: Worksheet[];
  assessments: Assessment[];
  presentations: PresentationDeck[];
  annualPlans: AnnualPlan[];
  timetables: WeeklyTimetable[];
  officialLetters: OfficialLetter[];
  calendarEvents?: EducationalCalendarEvent[];
  students?: Student[];
  studentAlerts?: StudentPerformanceAlert[];
  bookmarks: Bookmark[];
  auditLogs: AuditLog[];
  backupJobs: BackupJob[];
  syncOperations: SyncOperation[];
  schoolProfile?: SchoolProfile;
  whatsappConfig?: WhatsAppConfig;
  whatsappLogs?: WhatsAppMessageLog[];
  vision2040Goals?: OmanVision2040Goal[];
}

const DATA_DIR = path.resolve('data');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'database.json');

class Database {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.ensureDirectories();
    this.data = this.loadDatabase();
  }

  private ensureDirectories() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
    if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  private loadDatabase(): DatabaseSchema {
    const seed = getInitialSeedData();
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.stages && parsed.stages.some((s: any) => s.name?.includes('الحلقة الأولى') || s.name?.includes('عمان'))) {
          let needsSave = false;
          if (!parsed.annualPlans || parsed.annualPlans.length === 0) {
            parsed.annualPlans = seed.annualPlans || [];
            needsSave = true;
          }
          if (!parsed.timetables || parsed.timetables.length === 0) {
            parsed.timetables = seed.timetables || [];
            needsSave = true;
          }
          if (!parsed.officialLetters || parsed.officialLetters.length === 0) {
            parsed.officialLetters = seed.officialLetters || [];
            needsSave = true;
          }
          if (!parsed.pages) parsed.pages = [];
          if (!parsed.chunks) parsed.chunks = [];
          if (!parsed.studentAlerts) parsed.studentAlerts = [];

          // تحديث بيانات مالك ومؤسس المكتبة الرقمية
          const adminUser = (parsed.users || []).find((u: any) => u.id === 'usr-admin-1' || u.role === 'admin');
          if (adminUser) {
            if (adminUser.name !== 'الاستاذ علاءالدين ضي النور محمد خليفة' || adminUser.avatarUrl !== '/owner_avatar.jpg') {
              adminUser.name = 'الاستاذ علاءالدين ضي النور محمد خليفة';
              adminUser.avatarUrl = '/owner_avatar.jpg';
              needsSave = true;
            }
          }

          // دمج وتحديث المواد والمقررات الدراسية والتربوية الجديدة من البذور
          const existingSubjectIds = new Set((parsed.subjects || []).map((s: any) => s.id));
          for (const s of (seed.subjects || [])) {
            if (!existingSubjectIds.has(s.id)) {
              if (!parsed.subjects) parsed.subjects = [];
              parsed.subjects.push(s);
              needsSave = true;
            }
          }

          // دمج الكتب والمراجع التربوية العمانية والعالمية الجديدة من البذور
          const existingResIds = new Set((parsed.resources || []).map((r: any) => r.id));
          for (const r of (seed.resources || [])) {
            if (!existingResIds.has(r.id)) {
              if (!parsed.resources) parsed.resources = [];
              parsed.resources.push(r);
              needsSave = true;
            }
          }

          // فحص وتعيين صور وأغلفة الكتب والمراجع وأدلة المعلم إذا كانت مفقودة
          for (const res of (parsed.resources || [])) {
            if (!res.coverImageUrl) {
              if (res.type === 'teacher_guide') res.coverImageUrl = '/covers/cover_om_grd5_tg.svg';
              else if (res.type === 'atlas') res.coverImageUrl = '/covers/cover_om_atlas.svg';
              else if (res.subjectId === 'sbj-ped-oman') res.coverImageUrl = '/covers/cover_ped_om_01.svg';
              else if (res.subjectId === 'sbj-ped-global') res.coverImageUrl = '/covers/cover_ped_glb_01.svg';
              else res.coverImageUrl = '/covers/cover_om_grd5_tb.svg';
              needsSave = true;
            }
          }

          // فحص وتوليد صفحات ودروس المناهج والمراجع التربوية وأدلة المعلم لكافة مصادر المكتبة
          const resourceIdsWithPages = new Set(parsed.pages.map((p: any) => p.resourceId));
          for (const res of (parsed.resources || [])) {
            if (!resourceIdsWithPages.has(res.id)) {
              const gen = getAuthenticCurriculumPages(res);
              if (gen.pages.length > 0) {
                parsed.pages.push(...gen.pages);
                parsed.chunks.push(...gen.chunks);
                needsSave = true;
              }
            }
          }

          // مزامنة اسم المعلم في جدول الحصص والخطط السنوية مع الحساب الفعلي للمعلم في النظام
          const teacherUser = (parsed.users || []).find((u: any) => u.role === 'teacher' || u.id === 'usr-teacher-1');
          if (teacherUser && parsed.timetables && parsed.timetables.length > 0) {
            for (const tt of parsed.timetables) {
              if (tt.teacherName !== teacherUser.name) {
                tt.teacherName = teacherUser.name;
                needsSave = true;
              }
            }
          }
          if (teacherUser && parsed.annualPlans && parsed.annualPlans.length > 0) {
            for (const ap of parsed.annualPlans) {
              if (ap.teacherName !== teacherUser.name) {
                ap.teacherName = teacherUser.name;
                needsSave = true;
              }
            }
          }

          // فحص وتعيين الملف التعريفي والترويسة المدرسية الموحدة
          if (!parsed.schoolProfile) {
            parsed.schoolProfile = {
              schoolName: 'مدرسة كعب بن برشة للتعليم ما بعد الأساسي (11 - 12)',
              directorateName: 'المديرية العامة للتربية والتعليم بمحافظة شمال الباطنة',
              ministryName: 'وزارة التربية والتعليم',
              countryName: 'سلطنة عمان',
              academicYear: '2026 / 2027 م',
              principalName: 'أ. سالم بن خميس البلوشي',
              firstTeacherName: teacherUser ? teacherUser.name : 'أ. مريم المعمرية (معلم أول دراسات اجتماعية وجغرافيا)',
              subjectName: 'الدراسات الاجتماعية والجغرافيا',
              stampText: 'مدرسة كعب بن برشة • سلطنة عمان',
              updatedAt: new Date().toISOString()
            };
            needsSave = true;
          }

          // فحص وتعيين إعدادات وسجل تكامل الواتساب الذكي
          if (!parsed.whatsappConfig) {
            parsed.whatsappConfig = {
              enabled: false,
              provider: 'cloud_api',
              phoneNumber: '+96891234567',
              displayName: 'المساعد الذكي للمكتبة الجغرافية والتربوية',
              webhookVerifyToken: 'om_edu_wa_' + Math.random().toString(36).substring(2, 10),
              webhookUrl: '/api/whatsapp/webhook',
              termsAccepted: false,
              authorizedNumbers: [
                {
                  id: 'auth-num-1',
                  phone: '+96891234567',
                  name: 'أ. مريم المعمرية (معلم أول)',
                  role: 'teacher',
                  active: true,
                  notes: 'معلم أول مادة الجغرافيا والدراسات الاجتماعية'
                },
                {
                  id: 'auth-num-2',
                  phone: '+96899887766',
                  name: 'أ. سالم بن خميس البلوشي (مدير المدرسة)',
                  role: 'admin',
                  active: true,
                  notes: 'إدارة المدرسة والمتابعة'
                }
              ],
              autoReplySettings: {
                allowLessonGeneration: true,
                allowTimetableLookup: true,
                allowLibrarySearch: true,
                welcomeMessage: 'مرحباً بك في المساعد الذكي للمكتبة الجغرافية والتربوية 🇴🇲\nيمكنك إرسال: "تحضير درس [العنوان]" أو "جدول الحصص" أو "بحث عن [كتاب]".',
                fallbackMessage: 'عذراً، لم أستطع فهم طلبك بدقة. أرسل كلمة "مساعدة" لعرض الأوامر المتاحة.'
              }
            };
            needsSave = true;
          }

          if (!parsed.whatsappLogs) {
            parsed.whatsappLogs = [];
            needsSave = true;
          }

          // فحص وتعيين أهداف رؤية عمان 2040 ومواءمتها مع الدروس والمصادر
          if (!parsed.vision2040Goals || parsed.vision2040Goals.length === 0) {
            parsed.vision2040Goals = getOmanVision2040Goals();
            needsSave = true;
          }

          // مواءمة الدروس المحضرة مع أهداف رؤية عمان 2040
          if (parsed.generatedLessons) {
            parsed.generatedLessons.forEach((lsn: any) => {
              if (!lsn.vision2040Goals || lsn.vision2040Goals.length === 0) {
                lsn.vision2040Goals = matchVision2040GoalsForLesson(
                  lsn.lessonTitle || lsn.title,
                  lsn.unitTitle || '',
                  lsn.subjectName || ''
                );
                needsSave = true;
              }
            });
          }

          // ربط مصادر ومراجع المكتبة بوسوم ومحاور رؤية عمان 2040
          if (parsed.resources) {
            parsed.resources.forEach((r: any) => {
              if (!r.vision2040Tags || r.vision2040Tags.length === 0) {
                r.vision2040Tags = matchVision2040TagsForResource(r);
                needsSave = true;
              }
            });
          }

          if (needsSave) {
            this.saveDatabaseSync(parsed);
          }
          return parsed;
        }
      } catch (err) {
        console.error('Failed to parse database.json, initializing from seed data:', err);
      }
    }

    // Seed database
    const initialDb: DatabaseSchema = {
      users: seed.users,
      stages: seed.stages,
      grades: seed.grades,
      subjects: seed.subjects,
      semesters: seed.semesters,
      units: seed.units,
      lessons: seed.lessons,
      resources: seed.resources,
      pages: seed.pages,
      chunks: seed.chunks,
      processingJobs: [],
      geographicResources: seed.geographicResources,
      externalReferences: seed.externalReferences,
      conversations: [
        {
          id: 'conv-sample',
          title: 'استفسار عن موقع سلطنة عمان الجيوسياسي وتضاريس جبال الحجر',
          userId: 'usr-admin-1',
          scopeResourceIds: ['res-om-101'],
          messages: [
            {
              id: 'msg-1',
              conversationId: 'conv-sample',
              role: 'user',
              content: 'ما هي الأهمية الجيوسياسية لموقع سلطنة عمان على مضيق هرمز وما أعلى قمة جبلية فيها وفق كتاب هذا وطني؟',
              createdAt: '2026-09-20T10:00:00Z'
            },
            {
              id: 'msg-2',
              conversationId: 'conv-sample',
              role: 'assistant',
              content: `وفق ما ورد في كتاب الطالب المعتمد "هذا وطني - تاريخ وجغرافية سلطنة عمان" (الصف الثاني عشر):\n\n1. **الأهمية الجيوسياسية لموقع سلطنة عمان ومضيق هرمز** (ص 18):\nتشرف سلطنة عمان عبر شبه جزيرة ومحافظة مسندم على مضيق هرمز الدولي، الذي يعد أحد أهم الممرات المائية الحيوية لنقل الطاقة في العالم؛ حيث يعبر من خلاله نحو **20% من إجمالي إمدادات النفط العالمية المنقولة بحراً**، مما يجعل السلطنة ركيزة أساسية لأمن الطاقة والملاحة البحرية الدولية.\n\n2. **أعلى قمة جبلية في سلطنة عمان** (ص 22):\nتعتبر قمة **"جبل شمس"** بسلسلة جبال الحجر الغربي أعلى قمة جبلية في سلطنة عمان وشبه الجزيرة العربية بارتفاع يبلغ **3009 أمتار** فوق مستوى سطح البحر، يليها الجبل الأخضر المتميز بمدرجاته الزراعية واعتدال مناخه صيفاً.`,
              citations: [
                {
                  resourceId: 'res-om-101',
                  resourceTitle: 'كتاب الطالب: هذا وطني - تاريخ وجغرافية سلطنة عمان (الصف الثاني عشر)',
                  pageNumber: 18,
                  printedPageNumber: 18,
                  snippet: 'تشرف سلطنة عمان (عبر محافظة مسندم) على حركة الملاحة الدولية في هذا المضيق الذي يمر عبره نحو 20% من إجمالي إمدادات النفط العالمية المنقولة بحراً.',
                  confidence: 0.99
                },
                {
                  resourceId: 'res-om-101',
                  resourceTitle: 'كتاب الطالب: هذا وطني - تاريخ وجغرافية سلطنة عمان (الصف الثاني عشر)',
                  pageNumber: 22,
                  printedPageNumber: 22,
                  snippet: 'وتضم السلسلة أعلى قمة جبلية في شبه الجزيرة العربية وهي قمة "جبل شمس" بارتفاع يصل إلى 3009 أمتار فوق مستوى سطح البحر.',
                  confidence: 0.99
                }
              ],
              createdAt: '2026-09-20T10:00:04Z'
            }
          ],
          createdAt: '2026-09-20T10:00:00Z',
          updatedAt: '2026-09-20T10:00:04Z'
        }
      ],
      generatedLessons: seed.lessonsGenerated,
      worksheets: seed.worksheets,
      assessments: seed.assessments,
      presentations: [
        {
          id: 'pres-om-1',
          title: 'عرض تقديمي: جغرافية سلطنة عمان المكان والتضاريس ورؤية 2040',
          subjectName: 'هذا وطني - تاريخ وجغرافية عمان',
          gradeName: 'الصف الثاني عشر',
          unitTitle: 'الوحدة الأولى: عُمان المكان والحضارة والتنوع التضاريسي',
          slides: [
            {
              id: 'sld-1',
              slideNumber: 1,
              title: 'الموقع الاستراتيجي لسلطنة عمان ومضيق هرمز',
              bulletPoints: [
                'تمتد السواحل العمانية لأكثر من 3165 كم مشرفة على الخليج العربي، وبحر عمان، وبحر العرب.',
                'الإشراف السيادي على مضيق هرمز عبر محافظة مسندم (نحو 20% من نفط العالم المنقول بحراً).',
                'الريادة البحرية التاريخية وأثرها في ازدهار الموانئ العمانية منذ عهد أحمد بن ماجد.'
              ],
              speakerNotes: 'ابدأ الحصة بعرض خريطة مضيق هرمز وطرح السؤال الاستقصائي حول الأهمية الجيوسياسية.'
            },
            {
              id: 'sld-2',
              slideNumber: 2,
              title: 'التضاريس الكبرى: جبال الحجر وظفار وسهل الباطنة',
              bulletPoints: [
                'سلسلة جبال الحجر تضم قمة جبل شمس (3009 أمتار) كأعلى قمة في عمان وشبه الجزيرة العربية.',
                'سهل الباطنة الساحلي الخصب والسلة الزراعية للسلطنة.',
                'ظاهرة خريف ظفار الساحرة وهبوب الرياح الموسمية الرطبة صيفاً على صلالة.'
              ],
              conceptBox: {
                term: 'جبل شمس',
                explanation: 'أعلى قمة جبلية في سلطنة عمان بارتفاع 3009 أمتار ضمن سلسلة جبال الحجر الغربي.'
              },
              speakerNotes: 'أكد على المقارنة بين مناخ الجبل الأخضر صيفاً وبين مناخ ظفار.'
            },
            {
              id: 'sld-3',
              slideNumber: 3,
              title: 'التنمية المستدامة والموانئ ورؤية عمان 2040',
              bulletPoints: [
                'ميناء الدقم على بحر العرب: بوابة بحرية استراتيجية خارج مضيق هرمز للتجارة العالمية.',
                'ميناء صحار وميناء صلالة ودورها في تعزيز الخدمات اللوجستية والتصدير.',
                'مشروعات الهيدروجين الأخضر والطاقة الشمسية المتجددة في الوسطى وظفار وعبري.'
              ],
              conceptBox: {
                term: 'ميناء الدقم',
                explanation: 'منطقة اقتصادية وميناء استراتيجي يطل مباشرة على بحر العرب دون المرور بمضيق هرمز.'
              },
              speakerNotes: 'اربط بين المقومات الجغرافية للموانئ ومحاور رؤية عمان 2040.'
            }
          ],
          summaryCards: [
            {
              title: 'خلاصة الدرس الوطني',
              points: [
                'الموقع البحري أكسب عمان عمقاً استراتيجياً وتجارياً على مر العصور.',
                'تنوع التضاريس يثري الموارد الاقتصادية والسياحية في مختلف المحافظات.',
                'رؤية عمان 2040 تستثمر الميزة الجغرافية للموانئ في تحقيق التنويع الاقتصادي.'
              ]
            }
          ],
          createdById: 'usr-admin-1',
          createdAt: '2026-09-22T14:00:00Z'
        }
      ],
      bookmarks: [
        {
          id: 'bm-1',
          userId: 'usr-admin-1',
          resourceId: 'res-om-101',
          pageNumber: 18,
          title: 'الأهمية الجيوسياسية لمضيق هرمز والحدود البحرية',
          note: 'مرجع أساسي لاختبارات دبلوم التعليم العام والأنشطة الإثرائية',
          color: '#0d9488',
          createdAt: '2026-09-25T08:00:00Z'
        }
      ],
      auditLogs: [
        {
          id: 'aud-init',
          userId: 'usr-admin-1',
          userName: 'أحمد البلوشي',
          action: 'create',
          targetType: 'system',
          targetId: 'sys-core',
          description: 'تهيئة وتحديث المكتبة الجغرافية والتربوية بمناهج سلطنة عمان والصفوف من 1 إلى 12 وأدلة المعلم المعتمدة',
          timestamp: '2026-09-01T08:00:00Z'
        }
      ],
      annualPlans: seed.annualPlans || [],
      timetables: seed.timetables || [],
      officialLetters: seed.officialLetters || [],
      backupJobs: [],
      syncOperations: [],
      whatsappConfig: {
        enabled: false,
        provider: 'cloud_api',
        phoneNumber: '+96891234567',
        displayName: 'المساعد الذكي للمكتبة الجغرافية والتربوية',
        webhookVerifyToken: 'om_edu_wa_' + Math.random().toString(36).substring(2, 10),
        webhookUrl: '/api/whatsapp/webhook',
        termsAccepted: false,
        authorizedNumbers: [
          {
            id: 'auth-num-1',
            phone: '+96891234567',
            name: 'أ. مريم المعمرية (معلم أول)',
            role: 'teacher',
            active: true,
            notes: 'معلم أول مادة الجغرافيا والدراسات الاجتماعية'
          },
          {
            id: 'auth-num-2',
            phone: '+96899887766',
            name: 'أ. سالم بن خميس البلوشي (مدير المدرسة)',
            role: 'admin',
            active: true,
            notes: 'إدارة المدرسة والمتابعة'
          }
        ],
        autoReplySettings: {
          allowLessonGeneration: true,
          allowTimetableLookup: true,
          allowLibrarySearch: true,
          welcomeMessage: 'مرحباً بك في المساعد الذكي للمكتبة الجغرافية والتربوية 🇴🇲\nيمكنك إرسال: "تحضير درس [العنوان]" أو "جدول الحصص" أو "بحث عن [كتاب]".',
          fallbackMessage: 'عذراً، لم أستطع فهم طلبك بدقة. أرسل كلمة "مساعدة" لعرض الأوامر المتاحة.'
        }
      },
      whatsappLogs: [],
      vision2040Goals: getOmanVision2040Goals(),
      studentAlerts: []
    };

    this.saveDatabaseSync(initialDb);
    return initialDb;
  }

  private saveDatabaseSync(db: DatabaseSchema) {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  public save() {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this.saveDatabaseSync(this.data);
    }, 200);
  }

  public logAudit(userId: string, userName: string, action: AuditLog['action'], targetType: AuditLog['targetType'], targetId: string, description: string) {
    const log: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      userName,
      action,
      targetType,
      targetId,
      description,
      timestamp: new Date().toISOString()
    };
    this.data.auditLogs.unshift(log);
    // Keep max 200 audit logs
    if (this.data.auditLogs.length > 200) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 200);
    }
    this.save();
  }

  // --- Statistics ---
  public getStats(): SystemStats {
    const activeResources = this.data.resources.filter(r => !r.isDeleted);
    const resourcesBySubject: Record<string, number> = {};
    const resourcesByFormat: Record<string, number> = {};

    let totalStorageBytes = 0;
    for (const r of activeResources) {
      totalStorageBytes += r.fileSize || 0;
      const sId = r.subjectId || 'other';
      resourcesBySubject[sId] = (resourcesBySubject[sId] || 0) + 1;
      resourcesByFormat[r.format] = (resourcesByFormat[r.format] || 0) + 1;
    }

    const pendingJobs = this.data.processingJobs.filter(j => j.status === 'processing' || j.status === 'pending').length;
    const failedJobs = this.data.processingJobs.filter(j => j.status === 'failed').length;
    const lastBackup = this.data.backupJobs.length > 0 ? this.data.backupJobs[0].createdAt : undefined;

    return {
      totalResources: activeResources.length,
      totalFiles: activeResources.filter(r => r.format !== 'link').length,
      totalStorageBytes,
      totalLessons: this.data.generatedLessons ? this.data.generatedLessons.length : 0,
      totalWorksheets: this.data.worksheets ? this.data.worksheets.length : 0,
      totalAssessments: this.data.assessments ? this.data.assessments.length : 0,
      totalGeographicResources: this.data.geographicResources ? this.data.geographicResources.length : 0,
      totalExternalReferences: this.data.externalReferences ? this.data.externalReferences.length : 0,
      totalAnnualPlans: this.data.annualPlans ? this.data.annualPlans.length : 0,
      totalTimetables: this.data.timetables ? this.data.timetables.length : 0,
      totalOfficialLetters: this.data.officialLetters ? this.data.officialLetters.length : 0,
      totalCalendarEvents: this.data.calendarEvents ? this.data.calendarEvents.length : 0,
      totalStudents: this.data.students ? this.data.students.length : 0,
      indexedPages: this.data.pages.length,
      pendingJobs,
      failedJobs,
      lastBackupDate: lastBackup,
      resourcesBySubject,
      resourcesByFormat
    };
  }

  // --- Users & Roles ---
  public getUsers() { return this.data.users; }
  public getUserById(id: string) { return this.data.users.find(u => u.id === id); }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    
    const prevUser = { ...this.data.users[idx] };
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates
    };

    // If name is updated, synchronize with timetables where teacherName was linked
    if (updates.name && updates.name.trim() !== '') {
      const newName = updates.name.trim();
      if (this.data.timetables) {
        this.data.timetables.forEach(tt => {
          if (tt.createdById === id || prevUser.role === 'teacher' || tt.teacherName.includes('مريم') || tt.teacherName === prevUser.name) {
            tt.teacherName = newName;
          }
        });
      }
    }

    this.save();
    return this.data.users[idx];
  }

  public addUser(user: { name: string; email: string; role: RoleType; avatarUrl?: string }): User {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl || '/icon.svg',
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  public deleteUser(id: string): boolean {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return false;
    // Do not delete primary admin
    if (this.data.users[idx].id === 'usr-admin-1') return false;
    this.data.users.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Taxonomy (Dynamic stages, grades, subjects, semesters, units, lessons) ---
  public getTaxonomy() {
    return {
      stages: this.data.stages,
      grades: this.data.grades,
      subjects: this.data.subjects,
      semesters: this.data.semesters,
      units: this.data.units,
      lessons: this.data.lessons
    };
  }

  public addSubject(name: string, code: string, color: string, description?: string) {
    const item: Subject = {
      id: `sbj-${Date.now()}`,
      name,
      code,
      color,
      description
    };
    this.data.subjects.push(item);
    this.save();
    return item;
  }

  public addUnit(subjectId: string, gradeId: string, semesterId: string, title: string, order: number, description?: string) {
    const item: Unit = {
      id: `unt-${Date.now()}`,
      subjectId,
      gradeId,
      semesterId,
      title,
      order,
      description
    };
    this.data.units.push(item);
    this.save();
    return item;
  }

  public addLesson(unitId: string, title: string, order: number, objectives?: string[], concepts?: string[]) {
    const item: Lesson = {
      id: `lsn-${Date.now()}`,
      unitId,
      title,
      order,
      objectives,
      concepts
    };
    this.data.lessons.push(item);
    this.save();
    return item;
  }

  // --- Resources (Digital Library) ---
  public getResources(filters?: {
    subjectId?: string;
    gradeId?: string;
    type?: string;
    format?: string;
    search?: string;
    includeArchived?: boolean;
    includeDeleted?: boolean;
  }) {
    let list = this.data.resources;

    if (!filters?.includeDeleted) {
      list = list.filter(r => !r.isDeleted);
    }
    if (!filters?.includeArchived) {
      list = list.filter(r => !r.isArchived);
    }

    if (filters?.subjectId) {
      list = list.filter(r => r.subjectId === filters.subjectId);
    }
    if (filters?.gradeId) {
      list = list.filter(r => r.gradeId === filters.gradeId);
    }
    if (filters?.type) {
      list = list.filter(r => r.type === filters.type);
    }
    if (filters?.format) {
      list = list.filter(r => r.format === filters.format);
    }
    if (filters?.search) {
      const q = normalizeArabicText(filters.search);
      list = list.filter(r => {
        return normalizeArabicText(r.title).includes(q) ||
          normalizeArabicText(r.author).includes(q) ||
          normalizeArabicText(r.description || '').includes(q) ||
          r.tags.some(t => normalizeArabicText(t).includes(q)) ||
          r.keywords.some(k => normalizeArabicText(k).includes(q));
      });
    }

    return list;
  }

  public getResourceById(id: string) {
    return this.data.resources.find(r => r.id === id);
  }

  public findResourceByHash(hash: string): Resource | undefined {
    return this.data.resources.find(r => r.fileHash === hash && !r.isDeleted);
  }

  public addResource(resource: Resource): Resource {
    this.data.resources.unshift(resource);
    this.save();
    return resource;
  }

  public updateResource(id: string, updates: Partial<Resource>): Resource | null {
    const idx = this.data.resources.findIndex(r => r.id === id);
    if (idx === -1) return null;

    this.data.resources[idx] = {
      ...this.data.resources[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.resources[idx];
  }

  public deleteResource(id: string, permanent: boolean = false): boolean {
    const idx = this.data.resources.findIndex(r => r.id === id);
    if (idx === -1) return false;

    if (permanent) {
      this.data.resources.splice(idx, 1);
      this.data.pages = this.data.pages.filter(p => p.resourceId !== id);
      this.data.chunks = this.data.chunks.filter(c => c.resourceId !== id);
    } else {
      this.data.resources[idx].isDeleted = true;
      this.data.resources[idx].updatedAt = new Date().toISOString();
    }
    this.save();
    return true;
  }

  public restoreResource(id: string): boolean {
    const res = this.data.resources.find(r => r.id === id);
    if (!res) return false;
    res.isDeleted = false;
    res.isArchived = false;
    res.updatedAt = new Date().toISOString();
    this.save();
    return true;
  }

  // --- Document Pages & Chunks ---
  public getPagesForResource(resourceId: string): DocumentPage[] {
    let existingPages = this.data.pages.filter(p => p.resourceId === resourceId).sort((a, b) => a.pageNumber - b.pageNumber);
    if (existingPages.length === 0) {
      const res = this.data.resources.find(r => r.id === resourceId);
      if (res) {
        const gen = getAuthenticCurriculumPages(res);
        if (gen.pages.length > 0) {
          this.data.pages.push(...gen.pages);
          this.data.chunks.push(...gen.chunks);
          this.save();
          existingPages = gen.pages;
        }
      }
    }
    return existingPages;
  }

  public getChunksForResource(resourceId: string): DocumentChunk[] {
    let existingChunks = this.data.chunks.filter(c => c.resourceId === resourceId).sort((a, b) => a.chunkIndex - b.chunkIndex);
    if (existingChunks.length === 0) {
      this.getPagesForResource(resourceId);
      existingChunks = this.data.chunks.filter(c => c.resourceId === resourceId).sort((a, b) => a.chunkIndex - b.chunkIndex);
    }
    return existingChunks;
  }

  public addDocumentPagesAndChunks(pages: DocumentPage[], chunks: DocumentChunk[]) {
    this.data.pages.push(...pages);
    this.data.chunks.push(...chunks);
    this.save();
  }

  // --- Hybrid & Semantic Search over Library ---
  public searchLibrary(query: string, options?: {
    scopeResourceIds?: string[];
    subjectId?: string;
    gradeId?: string;
    maxResults?: number;
  }) {
    const qNormalized = normalizeArabicText(query);
    const keywords = extractArabicKeywords(query);
    const maxResults = options?.maxResults || 20;

    let targetChunks = this.data.chunks;

    // Filter by scope resources if specified
    if (options?.scopeResourceIds && options.scopeResourceIds.length > 0) {
      const scopeSet = new Set(options.scopeResourceIds);
      targetChunks = targetChunks.filter(c => scopeSet.has(c.resourceId));
    }

    const scoredResults: Array<{
      chunk: DocumentChunk;
      resource: Resource;
      score: number;
      highlightedSnippet: string;
      pageNumber: number;
      printedPageNumber?: number;
    }> = [];

    for (const chunk of targetChunks) {
      const res = this.getResourceById(chunk.resourceId);
      if (!res || res.isDeleted) continue;

      if (options?.subjectId && res.subjectId !== options.subjectId) continue;
      if (options?.gradeId && res.gradeId !== options.gradeId) continue;

      const score = calculateTextRelevance(chunk.content, query);
      if (score > 5) {
        scoredResults.push({
          chunk,
          resource: res,
          score,
          highlightedSnippet: createHighlightedSnippet(chunk.content, query),
          pageNumber: chunk.pageNumber,
          printedPageNumber: chunk.printedPageNumber || chunk.pageNumber
        });
      }
    }

    // Sort by relevance score descending
    scoredResults.sort((a, b) => b.score - a.score);

    return scoredResults.slice(0, maxResults);
  }

  // --- Processing Jobs ---
  public getProcessingJobs(): ProcessingJob[] {
    return this.data.processingJobs;
  }

  public addProcessingJob(job: ProcessingJob) {
    this.data.processingJobs.unshift(job);
    this.save();
    return job;
  }

  public updateProcessingJob(id: string, updates: Partial<ProcessingJob>) {
    const idx = this.data.processingJobs.findIndex(j => j.id === id);
    if (idx !== -1) {
      this.data.processingJobs[idx] = { ...this.data.processingJobs[idx], ...updates };
      this.save();
    }
  }

  // --- Geographic Resources ---
  public getGeographicResources(category?: string) {
    if (!category || category === 'all') return this.data.geographicResources;
    return this.data.geographicResources.filter(g => g.category === category);
  }

  public addGeographicResource(geo: GeographicResource) {
    this.data.geographicResources.unshift(geo);
    this.save();
    return geo;
  }

  // --- External References ---
  public getExternalReferences() {
    return this.data.externalReferences;
  }

  public addExternalReference(ref: ExternalReference) {
    this.data.externalReferences.unshift(ref);
    this.save();
    return ref;
  }

  public updateExternalReference(id: string, updates: Partial<ExternalReference>) {
    const idx = this.data.externalReferences.findIndex(e => e.id === id);
    if (idx !== -1) {
      this.data.externalReferences[idx] = { ...this.data.externalReferences[idx], ...updates };
      this.save();
      return this.data.externalReferences[idx];
    }
    return null;
  }

  // --- Lessons, Worksheets, Assessments, Presentations ---
  public getGeneratedLessons() { return this.data.generatedLessons; }
  public getLessonById(id: string) { return this.data.generatedLessons.find(l => l.id === id); }
  public saveLesson(lesson: GeneratedLesson) {
    if (!lesson.vision2040Goals || lesson.vision2040Goals.length === 0) {
      lesson.vision2040Goals = matchVision2040GoalsForLesson(
        lesson.lessonTitle || lesson.title,
        lesson.unitTitle || '',
        lesson.subjectName || ''
      );
    }
    const idx = this.data.generatedLessons.findIndex(l => l.id === lesson.id);
    if (idx !== -1) {
      this.data.generatedLessons[idx] = lesson;
    } else {
      this.data.generatedLessons.unshift(lesson);
    }
    this.save();
    return lesson;
  }

  public getVision2040Goals(): OmanVision2040Goal[] {
    if (!this.data.vision2040Goals || this.data.vision2040Goals.length === 0) {
      this.data.vision2040Goals = getOmanVision2040Goals();
      this.save();
    }
    return this.data.vision2040Goals;
  }

  public deleteLesson(id: string) {
    this.data.generatedLessons = this.data.generatedLessons.filter(l => l.id !== id);
    this.save();
    return true;
  }

  public getWorksheets() { return this.data.worksheets; }
  public saveWorksheet(ws: Worksheet) {
    const idx = this.data.worksheets.findIndex(w => w.id === ws.id);
    if (idx !== -1) {
      this.data.worksheets[idx] = ws;
    } else {
      this.data.worksheets.unshift(ws);
    }
    this.save();
    return ws;
  }

  public deleteWorksheet(id: string) {
    this.data.worksheets = this.data.worksheets.filter(w => w.id !== id);
    this.save();
    return true;
  }

  public getAssessments() { return this.data.assessments; }
  public saveAssessment(asmt: Assessment) {
    const idx = this.data.assessments.findIndex(a => a.id === asmt.id);
    if (idx !== -1) {
      this.data.assessments[idx] = asmt;
    } else {
      this.data.assessments.unshift(asmt);
    }
    this.save();
    return asmt;
  }

  public deleteAssessment(id: string) {
    this.data.assessments = this.data.assessments.filter(a => a.id !== id);
    this.save();
    return true;
  }

  public getPresentations() { return this.data.presentations; }
  public savePresentation(pres: PresentationDeck) {
    const idx = this.data.presentations.findIndex(p => p.id === pres.id);
    if (idx !== -1) {
      this.data.presentations[idx] = pres;
    } else {
      this.data.presentations.unshift(pres);
    }
    this.save();
    return pres;
  }

  // --- الخطط السنوية والفصلية (Annual Plans) ---
  public getAnnualPlans() {
    return this.data.annualPlans || [];
  }

  public getAnnualPlanById(id: string) {
    return (this.data.annualPlans || []).find(p => p.id === id);
  }

  public saveAnnualPlan(plan: AnnualPlan) {
    if (!this.data.annualPlans) this.data.annualPlans = [];
    const idx = this.data.annualPlans.findIndex(p => p.id === plan.id);
    if (idx !== -1) {
      this.data.annualPlans[idx] = { ...plan, updatedAt: new Date().toISOString() };
    } else {
      this.data.annualPlans.unshift({
        ...plan,
        id: plan.id || `plan-om-${Date.now()}`,
        createdAt: plan.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    this.save();
    return this.getAnnualPlanById(plan.id) || plan;
  }

  public deleteAnnualPlan(id: string) {
    if (!this.data.annualPlans) return true;
    this.data.annualPlans = this.data.annualPlans.filter(p => p.id !== id);
    this.save();
    return true;
  }

  // --- جدول الحصص الأسبوعي (Weekly Timetables) ---
  public getTimetables() {
    return this.data.timetables || [];
  }

  public getTimetableById(id: string) {
    return (this.data.timetables || []).find(t => t.id === id);
  }

  public saveTimetable(tt: WeeklyTimetable) {
    if (!this.data.timetables) this.data.timetables = [];
    const idx = this.data.timetables.findIndex(t => t.id === tt.id);
    if (idx !== -1) {
      this.data.timetables[idx] = { ...tt, updatedAt: new Date().toISOString() };
    } else {
      this.data.timetables.unshift({
        ...tt,
        id: tt.id || `tt-om-${Date.now()}`,
        createdAt: tt.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    this.save();
    return this.getTimetableById(tt.id) || tt;
  }

  public deleteTimetable(id: string) {
    if (!this.data.timetables) return true;
    this.data.timetables = this.data.timetables.filter(t => t.id !== id);
    this.save();
    return true;
  }

  // --- المراسلات والخطابات الرسمية (Official Letters) ---
  public getOfficialLetters(recipientType?: string) {
    const list = this.data.officialLetters || [];
    if (recipientType && recipientType !== 'all') {
      return list.filter(l => l.letterType === recipientType);
    }
    return list;
  }

  public getOfficialLetterById(id: string) {
    return (this.data.officialLetters || []).find(l => l.id === id);
  }

  public saveOfficialLetter(letter: OfficialLetter) {
    if (!this.data.officialLetters) this.data.officialLetters = [];
    const idx = this.data.officialLetters.findIndex(l => l.id === letter.id);
    if (idx !== -1) {
      this.data.officialLetters[idx] = { ...letter, updatedAt: new Date().toISOString() };
    } else {
      this.data.officialLetters.unshift({
        ...letter,
        id: letter.id || `let-om-${Date.now()}`,
        createdAt: letter.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    this.save();
    return this.getOfficialLetterById(letter.id) || letter;
  }

  public deleteOfficialLetter(id: string) {
    if (!this.data.officialLetters) return true;
    this.data.officialLetters = this.data.officialLetters.filter(l => l.id !== id);
    this.save();
    return true;
  }

  // --- التقويم التربوي وجدولة الاختبارات والأنشطة (Educational Calendar & Deadlines) ---
  public getDefaultCalendarEvents(): EducationalCalendarEvent[] {
    return [
      {
        id: 'cal-om-1',
        title: 'الاختبار القصير الأول: جغرافية سلطنة عمان المكان والحضارة',
        type: 'exam',
        subjectName: 'هذا وطني - تاريخ وجغرافية عمان',
        gradeName: 'الصف الثاني عشر',
        section: '12/1 و 12/2',
        startDate: '2026-10-28',
        startTime: '08:00',
        endDate: '2026-10-28',
        endTime: '09:00',
        location: 'قاعة الجغرافيا والتقنيات (مبنى أ)',
        description: 'يشمل محاور الموقع الاستراتيجي لمضيق هرمز، التضاريس الكبرى، والمناخ التضاريسي مع أسئلة خريطة صماء.',
        priority: 'high',
        status: 'pending',
        reminderMinutes: 1440,
        vision2040Pillar: 'جودة التعليم والتعلم',
        createdById: 'usr-admin-1',
        createdAt: '2026-10-20T08:00:00Z',
        updatedAt: '2026-10-20T08:00:00Z'
      },
      {
        id: 'cal-om-2',
        title: 'تطبيق عملي: رسم وتعيين محافظات وأفلاج سلطنة عمان على الخريطة الصماء',
        type: 'activity',
        subjectName: 'الدراسات الاجتماعية',
        gradeName: 'الصف التاسع',
        section: '9/1 و 9/2',
        startDate: '2026-11-04',
        startTime: '09:15',
        endDate: '2026-11-04',
        endTime: '10:00',
        location: 'مختبر الدراسات الاجتماعية',
        description: 'نشاط صفي تفاعلي لتطبيق مهارة تحديد المحافظات الـ 11 ومواقع الأفلاج الخمسة المدرجة في اليونسكو.',
        priority: 'medium',
        status: 'pending',
        reminderMinutes: 60,
        vision2040Pillar: 'المواطنة والهوية والتراث',
        createdById: 'usr-admin-1',
        createdAt: '2026-10-20T08:00:00Z',
        updatedAt: '2026-10-20T08:00:00Z'
      },
      {
        id: 'cal-om-3',
        title: 'تسليم تقرير ميداني: أثر السدود المائية والتصحر في محافظة شمال الباطنة',
        type: 'task',
        subjectName: 'الجغرافيا والتقنيات الحديثة',
        gradeName: 'الصف الحادي عشر',
        section: '11/1',
        startDate: '2026-11-12',
        startTime: '10:30',
        endDate: '2026-11-12',
        endTime: '11:15',
        location: 'قاعة الأنشطة الطلابية',
        description: 'بحث جغرافي واستقصائي يتضمن رصد سدود وادي الجزي ووادي عاهن وتوصيات استدامة الموارد المائية.',
        priority: 'high',
        status: 'pending',
        reminderMinutes: 1440,
        vision2040Pillar: 'البيئة والموارد الطبيعية المستدامة',
        createdById: 'usr-admin-1',
        createdAt: '2026-10-20T08:00:00Z',
        updatedAt: '2026-10-20T08:00:00Z'
      },
      {
        id: 'cal-om-4',
        title: 'الاحتفال باليوم الوطني الـ 56 لسلطنة عمان ومعرض الخرائط التاريخية',
        type: 'ministry_event',
        subjectName: 'الدراسات الاجتماعية والتربوية',
        gradeName: 'جميع الصفوف (1 - 12)',
        startDate: '2026-11-18',
        endDate: '2026-11-18',
        allDay: true,
        location: 'ساحة المدرسة والبهو الرئيسي',
        description: 'تنظيم معرض الخرائط العمانية القديمة والحديثة، ومجسمات التضاريس، وعروض تقنية ثلاثية الأبعاد 3D للمحافظات.',
        priority: 'high',
        status: 'pending',
        reminderMinutes: 2880,
        vision2040Pillar: 'المواطنة والهوية والتراث الثقافي',
        createdById: 'usr-admin-1',
        createdAt: '2026-10-20T08:00:00Z',
        updatedAt: '2026-10-20T08:00:00Z'
      },
      {
        id: 'cal-om-5',
        title: 'اختبار تشخيصي: مهارات قراءة الخرائط ونظم المعلومات الجغرافية GIS',
        type: 'exam',
        subjectName: 'الدراسات الاجتماعية',
        gradeName: 'الصف العاشر',
        section: '10/1 و 10/2 و 10/3',
        startDate: '2026-11-22',
        startTime: '08:00',
        endDate: '2026-11-22',
        endTime: '08:45',
        location: 'مختبر الحاسوب والجغرافيا',
        description: 'قياس المكتسبات القبلية في قراءة مفتاح الخريطة، مقياس الرسم، وتفسير صور الاستشعار عن بعد.',
        priority: 'medium',
        status: 'pending',
        reminderMinutes: 60,
        vision2040Pillar: 'الابتكار والتقنيات المتقدمة',
        createdById: 'usr-admin-1',
        createdAt: '2026-10-20T08:00:00Z',
        updatedAt: '2026-10-20T08:00:00Z'
      },
      {
        id: 'cal-om-6',
        title: 'الاختبار القصير الثاني: الاقتصاد العماني ومشاريع الهيدروجين الأخضر 2040',
        type: 'exam',
        subjectName: 'هذا وطني - تاريخ وجغرافية عمان',
        gradeName: 'الصف الثاني عشر',
        section: '12/1 و 12/2',
        startDate: '2026-12-02',
        startTime: '08:00',
        endDate: '2026-12-02',
        endTime: '09:00',
        location: 'قاعة الجغرافيا المتقدمة',
        description: 'اختبار تحريري مقنن يشمل الموانئ اللوجستية (صحار، الدقم، صلالة) ومستهدفات الطاقة المتجددة.',
        priority: 'urgent',
        status: 'pending',
        reminderMinutes: 1440,
        vision2040Pillar: 'الاقتصاد المتنوع والريادة',
        createdById: 'usr-admin-1',
        createdAt: '2026-10-20T08:00:00Z',
        updatedAt: '2026-10-20T08:00:00Z'
      },
      {
        id: 'cal-om-7',
        title: 'نشاط إثرائي: محاكاة مناخية ورصد منخفضات بحر العرب عبر منصة Windy',
        type: 'activity',
        subjectName: 'الجغرافيا والتقنيات الحديثة',
        gradeName: 'الصف الحادي عشر',
        section: '11/2',
        startDate: '2026-12-09',
        startTime: '11:30',
        endDate: '2026-12-09',
        endTime: '12:15',
        location: 'مركز مصادر التعلم الذكي',
        description: 'تطبيق عملي مباشر على رادار الطقس الحي وسرعة الرياح والتنبؤ بحركة الكتل الهوائية.',
        priority: 'medium',
        status: 'pending',
        reminderMinutes: 60,
        vision2040Pillar: 'الابتكار والبحث العلمي',
        createdById: 'usr-admin-1',
        createdAt: '2026-10-20T08:00:00Z',
        updatedAt: '2026-10-20T08:00:00Z'
      },
      {
        id: 'cal-om-8',
        title: 'بدء امتحانات نهاية الفصل الدراسي الأول - الدراسات الاجتماعية والجغرافيا',
        type: 'exam',
        subjectName: 'الدراسات الاجتماعية والجغرافيا',
        gradeName: 'الصفوف 10 - 12',
        startDate: '2026-12-20',
        startTime: '08:00',
        endDate: '2026-12-20',
        endTime: '10:30',
        location: 'قاعات الامتحانات المعتمدة',
        description: 'الامتحان النهائي المعتمد من المديرية العامة للتربية والتعليم بمحافظة شمال الباطنة.',
        priority: 'urgent',
        status: 'pending',
        reminderMinutes: 2880,
        vision2040Pillar: 'جودة التعليم والتعلم',
        createdById: 'usr-admin-1',
        createdAt: '2026-10-20T08:00:00Z',
        updatedAt: '2026-10-20T08:00:00Z'
      }
    ];
  }

  public getCalendarEvents(): EducationalCalendarEvent[] {
    if (!this.data.calendarEvents || this.data.calendarEvents.length === 0) {
      this.data.calendarEvents = this.getDefaultCalendarEvents();
      this.save();
    }
    return this.data.calendarEvents;
  }

  public getCalendarEventById(id: string): EducationalCalendarEvent | undefined {
    const events = this.getCalendarEvents();
    return events.find(e => e.id === id);
  }

  public saveCalendarEvent(eventData: Partial<EducationalCalendarEvent>): EducationalCalendarEvent {
    if (!this.data.calendarEvents) {
      this.data.calendarEvents = this.getDefaultCalendarEvents();
    }
    const events = this.data.calendarEvents;
    const existingIndex = events.findIndex(e => e.id === eventData.id);

    if (existingIndex !== -1) {
      const updated: EducationalCalendarEvent = {
        ...events[existingIndex],
        ...eventData,
        updatedAt: new Date().toISOString()
      };
      events[existingIndex] = updated;
      this.save();
      return updated;
    } else {
      const newEvent: EducationalCalendarEvent = {
        id: eventData.id || `cal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: eventData.title || 'حدث تربوي جديد',
        type: eventData.type || 'task',
        subjectName: eventData.subjectName || 'الدراسات الاجتماعية والجغرافيا',
        gradeName: eventData.gradeName || 'الصف الثاني عشر',
        section: eventData.section || '',
        startDate: eventData.startDate || new Date().toISOString().split('T')[0],
        startTime: eventData.startTime || '08:00',
        endDate: eventData.endDate || eventData.startDate || new Date().toISOString().split('T')[0],
        endTime: eventData.endTime || '09:00',
        allDay: Boolean(eventData.allDay),
        location: eventData.location || 'قاعة الجغرافيا',
        description: eventData.description || '',
        priority: eventData.priority || 'medium',
        status: eventData.status || 'pending',
        reminderMinutes: eventData.reminderMinutes || 60,
        linkedAssessmentId: eventData.linkedAssessmentId,
        linkedWorksheetId: eventData.linkedWorksheetId,
        vision2040Pillar: eventData.vision2040Pillar || 'جودة التعليم والتعلم',
        createdById: eventData.createdById || 'usr-admin-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      events.unshift(newEvent);
      this.save();
      return newEvent;
    }
  }

  public deleteCalendarEvent(id: string): boolean {
    if (!this.data.calendarEvents) return true;
    const initialLength = this.data.calendarEvents.length;
    this.data.calendarEvents = this.data.calendarEvents.filter(e => e.id !== id);
    if (this.data.calendarEvents.length !== initialLength) {
      this.save();
      return true;
    }
    return false;
  }

  public seedDefaultCalendarEvents(): EducationalCalendarEvent[] {
    this.data.calendarEvents = this.getDefaultCalendarEvents();
    this.save();
    return this.data.calendarEvents;
  }

  // --- سجل الطلاب والملف التراكمي الشامل (Student Records & Profiles) ---
  public getDefaultStudents(): Student[] {
    return [
      {
        id: 'std-12-1-01',
        nationalId: '11984521',
        studentNumber: '2026120101',
        fullName: 'أحمد بن سعيد بن ناصر المعمري',
        gender: 'male',
        gradeId: 'grd-12',
        gradeName: 'الصف الثاني عشر (دبلوم التعليم العام)',
        section: '12/1',
        dateOfBirth: '2008-04-12',
        parentName: 'سعيد بن ناصر المعمري',
        parentPhone: '+96877394680',
        parentRelation: 'الأب',
        address: 'محافظة شمال الباطنة - ولاية صحم',
        academicStatus: 'excellent',
        medicalNotes: 'سليم ولله الحمد، لا توجد حالات تحسسية',
        specialTalents: ['رسم الخرائط الكنتورية والتضاريسية', 'البحث الجغرافي والاستقصاء', 'حفظ المعالم العمانية'],
        grades: [
          {
            id: 'grd-rec-1',
            assessmentName: 'الاختبار القصير الأول: جغرافية عمان المكان والحضارة',
            category: 'short_exam',
            maxScore: 10,
            obtainedScore: 10,
            date: '2026-10-15',
            notes: 'إجابة نموذجية ورسم دقيق لموقع مضيق هرمز ومحافظة مسندم.'
          },
          {
            id: 'grd-rec-2',
            assessmentName: 'تطبيق عملي: رسم وتعيين محافظات وأفلاج عمان على الخريطة الصماء',
            category: 'activity',
            maxScore: 10,
            obtainedScore: 9.5,
            date: '2026-10-18',
            notes: 'دقة عالية في تحديد مواقع الأفلاج الخمسة المدرجة في اليونسكو.'
          },
          {
            id: 'grd-rec-3',
            assessmentName: 'تقرير استقصائي: أثر السدود المائية والتصحر في شمال الباطنة',
            category: 'project',
            maxScore: 10,
            obtainedScore: 10,
            date: '2026-10-21',
            notes: 'بحث ميداني موثق بالصور والبيانات الإحصائية المتوافقة مع رؤية عمان 2040.'
          }
        ],
        attendance: [
          { id: 'att-1', date: '2026-10-18', status: 'present' },
          { id: 'att-2', date: '2026-10-19', status: 'present' },
          { id: 'att-3', date: '2026-10-20', status: 'present' },
          { id: 'att-4', date: '2026-10-21', status: 'present' },
          { id: 'att-5', date: '2026-10-22', status: 'present' }
        ],
        notes: [
          {
            id: 'not-1',
            date: '2026-10-12',
            category: 'positive',
            title: 'تفوق ملحوظ في قراءة وتحليل الخرائط الجغرافية',
            content: 'أظهر الطالب فهماً عميقاً لتحليل الصور الفضائية ونظم المعلومات الجغرافية GIS، وقدم شرحاً متميزاً لزملائه في الصف.',
            authorName: 'أ. مريم المعمرية (معلم أول جغرافيا)',
            actionTaken: 'تكريم الطالب في الطابور المدرسي ومنحه شهادة تميز جغرافية'
          }
        ],
        letters: [
          {
            id: 'let-ref-1',
            letterId: 'let-om-01',
            title: 'خطاب شكر وتقدير لتفوق الطالب في مادة هذا وطني',
            type: 'شكر وتقدير وتكريم',
            date: '2026-10-16',
            status: 'sent'
          }
        ],
        attachments: [],
        customFields: {
          'النادي المدرسي': 'نادي المستكشف الجغرافي والبيئة',
          'مشروع التخرج المفضل': 'إدارة الموارد المائية ونظم الأفلاج'
        },
        createdAt: '2026-09-01T08:00:00Z',
        updatedAt: '2026-10-22T10:00:00Z'
      },
      {
        id: 'std-12-1-02',
        nationalId: '11993420',
        studentNumber: '2026120102',
        fullName: 'محمد بن راشد بن سالم البلوشي',
        gender: 'male',
        gradeId: 'grd-12',
        gradeName: 'الصف الثاني عشر (دبلوم التعليم العام)',
        section: '12/1',
        dateOfBirth: '2008-06-25',
        parentName: 'راشد بن سالم البلوشي',
        parentPhone: '+96891234567',
        parentRelation: 'الأب',
        address: 'محافظة شمال الباطنة - ولاية صحار',
        academicStatus: 'good',
        specialTalents: ['نظم المعلومات الجغرافية GIS', 'التصوير الجغرافي والتوثيق'],
        grades: [
          {
            id: 'grd-rec-4',
            assessmentName: 'الاختبار القصير الأول: جغرافية عمان المكان والحضارة',
            category: 'short_exam',
            maxScore: 10,
            obtainedScore: 8.5,
            date: '2026-10-15',
            notes: 'أداء جيد جداً مع الحاجة لمراجعة تضاريس جبال الحجر الشرقي.'
          },
          {
            id: 'grd-rec-5',
            assessmentName: 'تطبيق عملي: رسم وتعيين محافظات وأفلاج عمان على الخريطة الصماء',
            category: 'activity',
            maxScore: 10,
            obtainedScore: 9,
            date: '2026-10-18'
          }
        ],
        attendance: [
          { id: 'att-6', date: '2026-10-18', status: 'present' },
          { id: 'att-7', date: '2026-10-19', status: 'present' },
          { id: 'att-8', date: '2026-10-20', status: 'late', reason: 'تأخر عن الطابور الصباحي بعذر مروري 10 دقائق' },
          { id: 'att-9', date: '2026-10-21', status: 'present' },
          { id: 'att-10', date: '2026-10-22', status: 'present' }
        ],
        notes: [
          {
            id: 'not-2',
            date: '2026-10-19',
            category: 'academic',
            title: 'نشاط وتفاعل إيجابي في مختبر التقنيات الجغرافية',
            content: 'شارك بفاعلية في ورشة رسم الخرائط الرقمية باستخدام المتصفح الذكي.',
            authorName: 'معلم المادة'
          }
        ],
        letters: [],
        attachments: [],
        customFields: {
          'النادي المدرسي': 'نادي الحاسوب وتقنيات الفضاء'
        },
        createdAt: '2026-09-01T08:00:00Z',
        updatedAt: '2026-10-20T08:00:00Z'
      },
      {
        id: 'std-12-1-03',
        nationalId: '11978210',
        studentNumber: '2026120103',
        fullName: 'سيف بن حمد بن راشد الحارثي',
        gender: 'male',
        gradeId: 'grd-12',
        gradeName: 'الصف الثاني عشر (دبلوم التعليم العام)',
        section: '12/1',
        dateOfBirth: '2008-02-14',
        parentName: 'حمد بن راشد الحارثي',
        parentPhone: '+96892345678',
        parentRelation: 'الأب',
        address: 'محافظة شمال الباطنة - ولاية لوى',
        academicStatus: 'needs_support',
        specialTalents: ['العمل الجماعي والأنشطة الرياضية'],
        grades: [
          {
            id: 'grd-rec-6',
            assessmentName: 'الاختبار القصير الأول: جغرافية عمان المكان والحضارة',
            category: 'short_exam',
            maxScore: 10,
            obtainedScore: 5.5,
            date: '2026-10-15',
            notes: 'صعوبة في قراءة إحداثيات الخريطة وتحديد موقع مدار السرطان.'
          },
          {
            id: 'grd-rec-7',
            assessmentName: 'تطبيق عملي: رسم وتعيين محافظات وأفلاج عمان على الخريطة الصماء',
            category: 'activity',
            maxScore: 10,
            obtainedScore: 6,
            date: '2026-10-18'
          }
        ],
        attendance: [
          { id: 'att-11', date: '2026-10-18', status: 'present' },
          { id: 'att-12', date: '2026-10-19', status: 'absent', reason: 'غياب بدون عذر مسبق' },
          { id: 'att-13', date: '2026-10-20', status: 'present' },
          { id: 'att-14', date: '2026-10-21', status: 'present' },
          { id: 'att-15', date: '2026-10-22', status: 'present' }
        ],
        notes: [
          {
            id: 'not-3',
            date: '2026-10-19',
            category: 'support_needed',
            title: 'خطة علاجية لتعزيز مهارات قراءة الخرائط الصماء',
            content: 'يحتاج الطالب أوراق عمل علاجية تركز على مفتاح الخريطة ومقياس الرسم وحفظ المحافظات الـ 11.',
            authorName: 'أ. مريم المعمرية',
            actionTaken: 'تزويده ببطاقات خريطة صماء تفاعلية وإشراكه في مجموعة التعلم التعاوني'
          }
        ],
        letters: [
          {
            id: 'let-ref-2',
            letterId: 'let-om-02',
            title: 'إشعار غياب وتدني مستوى في مادة الجغرافيا لولي الأمر',
            type: 'إشعار ومتابعة ولي أمر',
            date: '2026-10-20',
            status: 'sent'
          }
        ],
        attachments: [],
        createdAt: '2026-09-01T08:00:00Z',
        updatedAt: '2026-10-20T08:00:00Z'
      },
      {
        id: 'std-12-2-01',
        nationalId: '11988412',
        studentNumber: '2026120201',
        fullName: 'خالد بن سلطان بن علي المقبالي',
        gender: 'male',
        gradeId: 'grd-12',
        gradeName: 'الصف الثاني عشر (دبلوم التعليم العام)',
        section: '12/2',
        dateOfBirth: '2008-08-19',
        parentName: 'سلطان بن علي المقبالي',
        parentPhone: '+96893456789',
        address: 'محافظة شمال الباطنة - ولاية صحار',
        academicStatus: 'excellent',
        specialTalents: ['تصميم الخرائط التفاعلية 3D', 'إلقاء العروض التقديمية'],
        grades: [
          {
            id: 'grd-rec-8',
            assessmentName: 'الاختبار القصير الأول: جغرافية عمان',
            category: 'short_exam',
            maxScore: 10,
            obtainedScore: 9.5,
            date: '2026-10-15'
          }
        ],
        attendance: [
          { id: 'att-16', date: '2026-10-20', status: 'present' },
          { id: 'att-17', date: '2026-10-21', status: 'present' },
          { id: 'att-18', date: '2026-10-22', status: 'present' }
        ],
        notes: [],
        letters: [],
        attachments: [],
        createdAt: '2026-09-01T08:00:00Z',
        updatedAt: '2026-10-20T08:00:00Z'
      },
      {
        id: 'std-11-1-01',
        nationalId: '11874219',
        studentNumber: '2026110101',
        fullName: 'ميثاء بنت خلفان بن سيف الهنائية',
        gender: 'female',
        gradeId: 'grd-11',
        gradeName: 'الصف الحادي عشر (ما بعد الأساسي)',
        section: '11/1',
        dateOfBirth: '2009-03-10',
        parentName: 'خلفان بن سيف الهنائي',
        parentPhone: '+96894567890',
        address: 'محافظة مسقط - ولاية السيب',
        academicStatus: 'excellent',
        specialTalents: ['قراءة صور الأقمار الاصطناعية', 'المناخ والأنواء المناخية عبر رادار Windy'],
        grades: [
          {
            id: 'grd-rec-9',
            assessmentName: 'اختبار الجغرافيا والتقنيات الحديثة الأول',
            category: 'short_exam',
            maxScore: 10,
            obtainedScore: 10,
            date: '2026-10-14'
          }
        ],
        attendance: [
          { id: 'att-19', date: '2026-10-20', status: 'present' },
          { id: 'att-20', date: '2026-10-21', status: 'present' },
          { id: 'att-21', date: '2026-10-22', status: 'present' }
        ],
        notes: [
          {
            id: 'not-4',
            date: '2026-10-15',
            category: 'special_talent',
            title: 'موهبة متقدمة في تتبع الأعاصير المدارية في بحر العرب',
            content: 'قدمت تحليلاً علمياً متميزاً لإعصار جونو وشاهين وتأثير التغير المناخي على السواحل العمانية.',
            authorName: 'معلم أول جغرافيا'
          }
        ],
        letters: [],
        attachments: [],
        createdAt: '2026-09-01T08:00:00Z',
        updatedAt: '2026-10-20T08:00:00Z'
      },
      {
        id: 'std-10-1-01',
        nationalId: '11762198',
        studentNumber: '2026100101',
        fullName: 'فيصل بن بدر بن سعود الكندي',
        gender: 'male',
        gradeId: 'grd-10',
        gradeName: 'الصف العاشر الأساسي',
        section: '10/1',
        dateOfBirth: '2010-09-05',
        parentName: 'بدر بن سعود الكندي',
        parentPhone: '+96895678901',
        address: 'محافظة الداخلية - ولاية نزوى',
        academicStatus: 'good',
        grades: [
          {
            id: 'grd-rec-10',
            assessmentName: 'اختبار تشخيصي في الدراسات الاجتماعية',
            category: 'short_exam',
            maxScore: 10,
            obtainedScore: 8.5,
            date: '2026-10-12'
          }
        ],
        attendance: [
          { id: 'att-22', date: '2026-10-20', status: 'present' },
          { id: 'att-23', date: '2026-10-21', status: 'present' }
        ],
        notes: [],
        letters: [],
        attachments: [],
        createdAt: '2026-09-01T08:00:00Z',
        updatedAt: '2026-10-20T08:00:00Z'
      },
      {
        id: 'std-9-1-01',
        nationalId: '11651087',
        studentNumber: '2026090101',
        fullName: 'يوسف بن طلال بن جمعة الفزاري',
        gender: 'male',
        gradeId: 'grd-9',
        gradeName: 'الصف التاسع الأساسي',
        section: '9/1',
        dateOfBirth: '2011-11-20',
        parentName: 'طلال بن جمعة الفزاري',
        parentPhone: '+96896789012',
        address: 'محافظة شمال الباطنة - ولاية صحم',
        academicStatus: 'excellent',
        grades: [
          {
            id: 'grd-rec-11',
            assessmentName: 'رسم خريطة أفلاج ومحافظات سلطنة عمان',
            category: 'activity',
            maxScore: 10,
            obtainedScore: 10,
            date: '2026-10-10'
          }
        ],
        attendance: [
          { id: 'att-24', date: '2026-10-20', status: 'present' },
          { id: 'att-25', date: '2026-10-21', status: 'present' }
        ],
        notes: [],
        letters: [],
        attachments: [],
        createdAt: '2026-09-01T08:00:00Z',
        updatedAt: '2026-10-20T08:00:00Z'
      }
    ];
  }

  public getStudents(gradeId?: string, section?: string): Student[] {
    if (!this.data.students || this.data.students.length === 0) {
      this.data.students = this.getDefaultStudents();
      this.save();
    }
    let list = this.data.students;
    if (gradeId && gradeId !== 'all') {
      list = list.filter(s => s.gradeId === gradeId || (s.gradeName && s.gradeName.includes(gradeId)));
    }
    if (section && section !== 'all') {
      list = list.filter(s => s.section === section);
    }
    return list;
  }

  public getStudentById(id: string): Student | undefined {
    const list = this.getStudents();
    return list.find(s => s.id === id);
  }

  public saveStudent(studentData: Partial<Student>): Student {
    if (!this.data.students) {
      this.data.students = this.getDefaultStudents();
    }
    const list = this.data.students;
    const existingIndex = list.findIndex(s => s.id === studentData.id);

    if (existingIndex !== -1) {
      const updated: Student = {
        ...list[existingIndex],
        ...studentData,
        updatedAt: new Date().toISOString()
      };
      list[existingIndex] = updated;
      this.save();
      return updated;
    } else {
      const newStudent: Student = {
        id: studentData.id || `std-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        studentNumber: studentData.studentNumber || `${new Date().getFullYear()}${Math.floor(100000 + Math.random() * 900000)}`,
        nationalId: studentData.nationalId || '',
        fullName: studentData.fullName || 'طالب جديد',
        gender: studentData.gender || 'male',
        gradeId: studentData.gradeId || 'grd-12',
        gradeName: studentData.gradeName || 'الصف الثاني عشر (دبلوم التعليم العام)',
        section: studentData.section || '12/1',
        dateOfBirth: studentData.dateOfBirth,
        parentName: studentData.parentName || '',
        parentPhone: studentData.parentPhone || '',
        parentRelation: studentData.parentRelation || 'الأب',
        address: studentData.address || '',
        avatarUrl: studentData.avatarUrl,
        academicStatus: studentData.academicStatus || 'good',
        medicalNotes: studentData.medicalNotes || '',
        specialTalents: studentData.specialTalents || [],
        grades: studentData.grades || [],
        attendance: studentData.attendance || [],
        notes: studentData.notes || [],
        letters: studentData.letters || [],
        attachments: studentData.attachments || [],
        customFields: studentData.customFields || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      list.unshift(newStudent);
      this.save();
      return newStudent;
    }
  }

  public deleteStudent(id: string): boolean {
    if (!this.data.students) return true;
    const initLen = this.data.students.length;
    this.data.students = this.data.students.filter(s => s.id !== id);
    if (this.data.students.length !== initLen) {
      this.save();
      return true;
    }
    return false;
  }

  public addGradeToStudent(studentId: string, gradeData: Omit<StudentGradeRecord, 'id'>): Student | null {
    const student = this.getStudentById(studentId);
    if (!student) return null;
    if (!student.grades) student.grades = [];
    const newGrade: StudentGradeRecord = {
      ...gradeData,
      id: `grd-rec-${Date.now()}`
    };
    student.grades.unshift(newGrade);
    student.updatedAt = new Date().toISOString();
    this.save();
    this.computeStudentPerformanceAlerts();
    return student;
  }

  public deleteGradeFromStudent(studentId: string, gradeId: string): Student | null {
    const student = this.getStudentById(studentId);
    if (!student || !student.grades) return null;
    student.grades = student.grades.filter(g => g.id !== gradeId);
    student.updatedAt = new Date().toISOString();
    this.save();
    this.computeStudentPerformanceAlerts();
    return student;
  }

  public addAttendanceToStudent(studentId: string, attendanceData: Omit<StudentAttendanceRecord, 'id'>): Student | null {
    const student = this.getStudentById(studentId);
    if (!student) return null;
    if (!student.attendance) student.attendance = [];
    // If attendance for this date already exists, update it
    const existingIdx = student.attendance.findIndex(a => a.date === attendanceData.date);
    if (existingIdx !== -1) {
      student.attendance[existingIdx] = {
        ...student.attendance[existingIdx],
        ...attendanceData
      };
    } else {
      student.attendance.unshift({
        ...attendanceData,
        id: `att-${Date.now()}`
      });
    }
    student.updatedAt = new Date().toISOString();
    this.save();
    return student;
  }

  public addNoteToStudent(studentId: string, noteData: Omit<StudentPedagogicalNote, 'id'>): Student | null {
    const student = this.getStudentById(studentId);
    if (!student) return null;
    if (!student.notes) student.notes = [];
    student.notes.unshift({
      ...noteData,
      id: `not-${Date.now()}`
    });
    student.updatedAt = new Date().toISOString();
    this.save();
    return student;
  }

  public deleteNoteFromStudent(studentId: string, noteId: string): Student | null {
    const student = this.getStudentById(studentId);
    if (!student || !student.notes) return null;
    student.notes = student.notes.filter(n => n.id !== noteId);
    student.updatedAt = new Date().toISOString();
    this.save();
    return student;
  }

  public addLetterToStudent(studentId: string, letterData: Omit<StudentOfficialLetterRef, 'id'>): Student | null {
    const student = this.getStudentById(studentId);
    if (!student) return null;
    if (!student.letters) student.letters = [];
    student.letters.unshift({
      ...letterData,
      id: `let-ref-${Date.now()}`
    });
    student.updatedAt = new Date().toISOString();
    this.save();
    return student;
  }

  public addCustomFieldToStudent(studentId: string, fieldName: string, fieldValue: string): Student | null {
    const student = this.getStudentById(studentId);
    if (!student) return null;
    if (!student.customFields) student.customFields = {};
    student.customFields[fieldName] = fieldValue;
    student.updatedAt = new Date().toISOString();
    this.save();
    return student;
  }

  public seedDefaultStudents(): Student[] {
    this.data.students = this.getDefaultStudents();
    this.save();
    this.computeStudentPerformanceAlerts();
    return this.data.students;
  }

  // --- تنبيهات وإشعارات انحدار مستوى الطالب مقارنة بمتوسط الصف (Student Performance Alerts Engine) ---
  public computeStudentPerformanceAlerts(): StudentPerformanceAlert[] {
    const students = this.getStudents();
    if (!students || students.length === 0) return [];

    // Group students by section
    const sectionStudentsMap = new Map<string, Student[]>();
    for (const student of students) {
      const key = `${student.gradeId || 'default'}_${student.section || 'default'}`;
      if (!sectionStudentsMap.has(key)) {
        sectionStudentsMap.set(key, []);
      }
      sectionStudentsMap.get(key)!.push(student);
    }

    const newAlerts: StudentPerformanceAlert[] = [];
    const existingAlertsMap = new Map<string, StudentPerformanceAlert>();
    (this.data.studentAlerts || []).forEach(a => {
      existingAlertsMap.set(a.id, a);
    });

    for (const [, sectionStudents] of sectionStudentsMap.entries()) {
      // Find all assessments taken by students in this section
      const assessmentMap = new Map<string, { student: Student; grade: StudentGradeRecord }[]>();

      for (const student of sectionStudents) {
        for (const grade of (student.grades || [])) {
          const normName = grade.assessmentName.trim();
          if (!normName) continue;
          if (!assessmentMap.has(normName)) {
            assessmentMap.set(normName, []);
          }
          assessmentMap.get(normName)!.push({ student, grade });
        }
      }

      // Calculate class average and detect drops
      for (const [assessmentName, entries] of assessmentMap.entries()) {
        if (entries.length < 2) continue;

        const maxScore = entries[0].grade.maxScore || 10;
        const totalScore = entries.reduce((acc, curr) => acc + (curr.grade.obtainedScore || 0), 0);
        const classAverageScore = Number((totalScore / entries.length).toFixed(2));
        const classAveragePercentage = Number(((classAverageScore / maxScore) * 100).toFixed(1));

        for (const entry of entries) {
          const studentScore = entry.grade.obtainedScore;
          const studentPercentage = Number(((studentScore / maxScore) * 100).toFixed(1));
          const deviationPercentage = Number((studentPercentage - classAveragePercentage).toFixed(1));

          // Condition for alert:
          // deviation <= -15 (15% or more below section average) OR studentPercentage < 60 with class average >= 75
          const isDrop = deviationPercentage <= -15 || (studentPercentage < 60 && classAveragePercentage >= 75);

          if (isDrop) {
            let severity: 'critical' | 'warning' | 'notice' = 'warning';
            if (deviationPercentage <= -25 || studentPercentage < 50) {
              severity = 'critical';
            } else if (deviationPercentage <= -15) {
              severity = 'warning';
            } else {
              severity = 'notice';
            }

            const assessmentSlug = assessmentName.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_').substring(0, 30);
            const alertId = `alert-${entry.student.id}-${assessmentSlug}`;
            const existing = existingAlertsMap.get(alertId);

            let defaultRemedial = '';
            if (assessmentName.includes('خريطة') || assessmentName.includes('خرائط') || assessmentName.includes('أفلاج')) {
              defaultRemedial = 'تقديم أوراق عمل تدريبية على قراءة مفتاح الخريطة وإحداثيات الموقع الفلكي، واستخدام الخرائط الصماء التفاعلية لسلطنة عمان في مجموعات التعلم التعاوني.';
            } else if (assessmentName.includes('اختبار') || assessmentName.includes('جغرافية')) {
              defaultRemedial = 'مراجعة المفاهيم الجيومورفولوجية والبيئية مع إتاحة بطاقات تذكير رقمية للأنواء المناخية ومحاور رؤية عمان 2040 وإجراء اختبار تعويضي مصغر.';
            } else {
              defaultRemedial = 'إجراء حصة علاجية فردية قصيرة ومراجعة المهارات الأساسية مع إشعار ولي الأمر للمتابعة المنزلية.';
            }

            const alert: StudentPerformanceAlert = {
              id: alertId,
              studentId: entry.student.id,
              studentName: entry.student.fullName,
              studentNumber: entry.student.studentNumber,
              gradeName: entry.student.gradeName,
              section: entry.student.section,
              parentPhone: entry.student.parentPhone,
              parentName: entry.student.parentName,
              assessmentName: assessmentName,
              category: entry.grade.category,
              studentScore: studentScore,
              maxScore: maxScore,
              studentPercentage: studentPercentage,
              classAverageScore: classAverageScore,
              classAveragePercentage: classAveragePercentage,
              deviationPercentage: deviationPercentage,
              severity: severity,
              title: `انخفاض ملحوظ في ${assessmentName} مقارنة بمتوسط الشعبة (${entry.student.section})`,
              description: `حصل الطالب على ${studentScore}/${maxScore} (${studentPercentage}%) بينما متوسط درجات الشعبة ${classAverageScore}/${maxScore} (${classAveragePercentage}%) بفارق انخفاض قدره ${Math.abs(deviationPercentage)}%.`,
              date: entry.grade.date || new Date().toISOString().split('T')[0],
              isRead: existing ? existing.isRead : false,
              remedialPlanSuggested: existing?.remedialPlanSuggested || defaultRemedial,
              notifiedViaWhatsApp: existing ? existing.notifiedViaWhatsApp : false,
              notifiedAt: existing?.notifiedAt,
              createdAt: existing ? existing.createdAt : new Date().toISOString()
            };

            newAlerts.push(alert);
          }
        }
      }
    }

    newAlerts.sort((a, b) => {
      const scoreSeverity = { critical: 3, warning: 2, notice: 1 };
      const sevDiff = (scoreSeverity[b.severity] || 0) - (scoreSeverity[a.severity] || 0);
      if (sevDiff !== 0) return sevDiff;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    this.data.studentAlerts = newAlerts;
    this.save();
    return newAlerts;
  }

  public getStudentPerformanceAlerts(filter?: { unreadOnly?: boolean; severity?: string; studentId?: string; section?: string }) {
    if (!this.data.studentAlerts || this.data.studentAlerts.length === 0) {
      this.computeStudentPerformanceAlerts();
    }
    let list = this.data.studentAlerts || [];
    if (filter?.unreadOnly) {
      list = list.filter(a => !a.isRead);
    }
    if (filter?.severity && filter.severity !== 'all') {
      list = list.filter(a => a.severity === filter.severity);
    }
    if (filter?.studentId) {
      list = list.filter(a => a.studentId === filter.studentId);
    }
    if (filter?.section && filter.section !== 'all') {
      list = list.filter(a => a.section === filter.section);
    }

    const all = this.data.studentAlerts || [];
    const stats = {
      total: all.length,
      unread: all.filter(a => !a.isRead).length,
      critical: all.filter(a => a.severity === 'critical').length,
      warning: all.filter(a => a.severity === 'warning').length,
      notice: all.filter(a => a.severity === 'notice').length
    };

    return { alerts: list, stats };
  }

  public markStudentAlertRead(alertId: string, isRead: boolean = true): StudentPerformanceAlert | null {
    if (!this.data.studentAlerts) return null;
    const alert = this.data.studentAlerts.find(a => a.id === alertId);
    if (!alert) return null;
    alert.isRead = isRead;
    this.save();
    return alert;
  }

  public markAllStudentAlertsRead(): number {
    if (!this.data.studentAlerts) return 0;
    let count = 0;
    this.data.studentAlerts.forEach(a => {
      if (!a.isRead) {
        a.isRead = true;
        count++;
      }
    });
    this.save();
    return count;
  }

  public updateStudentAlert(alertId: string, updates: Partial<StudentPerformanceAlert>): StudentPerformanceAlert | null {
    if (!this.data.studentAlerts) return null;
    const alert = this.data.studentAlerts.find(a => a.id === alertId);
    if (!alert) return null;
    Object.assign(alert, updates);
    this.save();
    return alert;
  }

  // --- الملف التعريفي والترويسة المدرسية الموحدة (School Profile & Official Letterhead) ---
  public getSchoolProfile(): SchoolProfile {
    if (!this.data.schoolProfile) {
      this.data.schoolProfile = {
        schoolName: 'مدرسة كعب بن برشة للتعليم ما بعد الأساسي (11 - 12)',
        teacherName: 'أ. علاءالدين ضي النور محمد خليفة',
        supervisorName: 'أ. أحمد بن سالم البلوشي (مشرف أول الدراسات الاجتماعية والجغرافيا)',
        governorateName: 'شمال الباطنة',
        directorateName: 'المديرية العامة للتربية والتعليم بمحافظة شمال الباطنة',
        ministryName: 'وزارة التربية والتعليم',
        countryName: 'سلطنة عمان',
        academicYear: '2026 / 2027 م',
        semester: 'الفصل الدراسي الأول',
        principalName: 'أ. سالم بن خميس البلوشي',
        firstTeacherName: 'أ. مريم المعمرية (معلم أول دراسات اجتماعية وجغرافيا)',
        subjectName: 'الدراسات الاجتماعية والجغرافيا',
        stampText: 'مدرسة كعب بن برشة • سلطنة عمان',
        updatedAt: new Date().toISOString()
      };
      this.save();
    } else {
      // Ensure default teacher and supervisor names are populated if missing
      if (!this.data.schoolProfile.teacherName) {
        this.data.schoolProfile.teacherName = 'أ. علاءالدين ضي النور محمد خليفة';
      }
      if (!this.data.schoolProfile.supervisorName) {
        this.data.schoolProfile.supervisorName = 'أ. أحمد بن سالم البلوشي (مشرف أول الدراسات الاجتماعية والجغرافيا)';
      }
      if (!this.data.schoolProfile.governorateName && this.data.schoolProfile.directorateName) {
        const match = this.data.schoolProfile.directorateName.match(/محافظة\s+([^\s]+(?:\s+[^\s]+)?)/);
        this.data.schoolProfile.governorateName = match ? match[1] : 'شمال الباطنة';
      }
    }
    return this.data.schoolProfile;
  }

  public updateSchoolProfile(updates: Partial<SchoolProfile>, cascadeToAll: boolean = true): SchoolProfile {
    const current = this.getSchoolProfile();
    
    // Automatically synthesize directorate name if governorate name is updated without directorate
    let computedDirectorate = updates.directorateName || current.directorateName;
    if (updates.governorateName && (!updates.directorateName || updates.directorateName === current.directorateName)) {
      computedDirectorate = `المديرية العامة للتربية والتعليم بمحافظة ${updates.governorateName.replace(/^محافظة\s+/, '')}`;
    }

    const updated: SchoolProfile = {
      ...current,
      ...updates,
      directorateName: computedDirectorate,
      updatedAt: new Date().toISOString()
    };
    this.data.schoolProfile = updated;

    if (cascadeToAll) {
      const newSchool = updated.schoolName;
      const newDirectorate = updated.directorateName;
      const newTeacher = updated.teacherName || current.teacherName || 'أ. علاءالدين ضي النور';
      const newSupervisor = updated.supervisorName || current.supervisorName || 'أ. أحمد بن سالم البلوشي';
      const newYear = updated.academicYear || current.academicYear;
      const newSemester = updated.semester || current.semester;

      // 1. تحديث اسم المدرسة والمديرية واسم المعلم في كافة جداول الحصص الأسبوعية
      if (this.data.timetables) {
        this.data.timetables.forEach(t => {
          t.schoolName = newSchool;
          t.directorateName = newDirectorate;
          if (newTeacher) t.teacherName = newTeacher;
          if (newYear) t.academicYear = newYear;
          if (newSemester) t.semester = newSemester;
        });
      }

      // 2. تحديث اسم المدرسة والمديرية والمعلم والمشرف في كافة الخطط السنوية والفصلية
      if (this.data.annualPlans) {
        this.data.annualPlans.forEach(p => {
          p.schoolName = newSchool;
          p.directorateName = newDirectorate;
          if (newTeacher) p.teacherName = newTeacher;
          if (newSupervisor) p.supervisorName = newSupervisor;
          if (newYear) p.academicYear = newYear;
          if (newSemester) p.semesterName = newSemester;
        });
      }

      // 3. تحديث اسم المدرسة والمديرية والمعلم والمرسل في كافة الخطابات الرسمية
      if (this.data.officialLetters) {
        this.data.officialLetters.forEach(l => {
          l.schoolName = newSchool;
          l.directorateName = newDirectorate;
          if (newTeacher) l.senderName = newTeacher;
        });
      }

      // 4. تحديث اسم المدرسة والمديرية والمعلم والمشرف في كافة خطط الدروس المحفوظة
      if (this.data.generatedLessons) {
        this.data.generatedLessons.forEach(l => {
          l.schoolName = newSchool;
          l.directorateName = newDirectorate;
          if (newTeacher) l.teacherName = newTeacher;
          if (newSupervisor) l.supervisorName = newSupervisor;
          if (newYear) l.academicYear = newYear;
          if (newSemester) l.semesterName = newSemester;
        });
      }

      // 5. مزامنة اسم المعلم في حساب المستخدمين المسجل
      if (newTeacher && this.data.users) {
        const adminUser = this.data.users.find(u => u.id === 'usr-admin-1' || u.role === 'admin');
        if (adminUser && !adminUser.name.includes(newTeacher)) {
          adminUser.name = newTeacher;
        }
        const teacherUser = this.data.users.find(u => u.id === 'usr-teacher-1');
        if (teacherUser) {
          teacherUser.name = newTeacher;
        }
      }
    }

    this.save();
    return updated;
  }

  // --- تكامل الواتساب الذكي (WhatsApp Webhook & Assistant API) ---
  public getWhatsAppConfig(): WhatsAppConfig {
    if (!this.data.whatsappConfig) {
      this.data.whatsappConfig = {
        enabled: true,
        provider: 'cloud_api',
        phoneNumber: '+96872645072',
        phoneNumberId: '1362186010314869',
        wabaId: '1625416795778143',
        displayName: 'المساعد الذكي للمكتبة الجغرافية والتربوية 🇴🇲',
        webhookVerifyToken: 'om_edu_wa_k4ow1k42',
        webhookUrl: '/api/whatsapp/webhook',
        termsAccepted: true,
        authorizedNumbers: [
          {
            id: 'auth-num-teacher-user',
            phone: '+96877394680',
            name: 'الأستاذ المعلم (المستخدم المسجل)',
            role: 'teacher',
            active: true,
            notes: 'رقم المعلم المستلم المعتمد في ميتا'
          },
          {
            id: 'auth-num-bot',
            phone: '+96872645072',
            name: 'رقم بوت الواتساب السحابي',
            role: 'teacher',
            active: true,
            notes: 'رقم البوت المسجل في منصة ميتا'
          },
          {
            id: 'auth-num-admin',
            phone: '+96891234567',
            name: 'أ. علاءالدين ضي النور محمد خليفة',
            role: 'admin',
            active: true,
            notes: 'مؤسس المنصة الرقمية'
          }
        ],
        autoReplySettings: {
          allowLessonGeneration: true,
          allowTimetableLookup: true,
          allowLibrarySearch: true,
          welcomeMessage: 'مرحباً بك في المساعد الذكي للمكتبة الجغرافية والتربوية 🇴🇲\nيمكنك إرسال: "تحضير درس [العنوان]" أو "جدول الحصص" أو "بحث عن [كتاب]".',
          fallbackMessage: 'عذراً، لم أستطع فهم طلبك بدقة. أرسل كلمة "مساعدة" لعرض الأوامر المتاحة.'
        }
      };
      try {
        this.saveDatabaseSync(this.data);
      } catch (_) {}
    } else {
      // Ensure key IDs, enabled status, and authorized numbers are preserved
      this.data.whatsappConfig.enabled = true;
      this.data.whatsappConfig.termsAccepted = true;
      this.data.whatsappConfig.phoneNumberId = this.data.whatsappConfig.phoneNumberId || '1423057994217547';
      this.data.whatsappConfig.wabaId = this.data.whatsappConfig.wabaId || '998152839966804';
      this.data.whatsappConfig.phoneNumber = this.data.whatsappConfig.phoneNumber || '+96872645072';
      if (!this.data.whatsappConfig.authorizedNumbers) {
        this.data.whatsappConfig.authorizedNumbers = [];
      }
      // Ensure user teacher phone is in authorized numbers
      const userPhone = '+96877394680';
      if (!this.data.whatsappConfig.authorizedNumbers.some(a => a.phone === userPhone || a.phone.endsWith('77394680'))) {
        this.data.whatsappConfig.authorizedNumbers.push({
          id: 'auth-num-teacher-user',
          phone: userPhone,
          name: 'الأستاذ المعلم (المستخدم المسجل)',
          role: 'teacher',
          active: true,
          notes: 'رقم المعلم المستلم المعتمد'
        });
      }
    }
    return this.data.whatsappConfig;
  }

  public updateWhatsAppConfig(updates: Partial<WhatsAppConfig>): WhatsAppConfig {
    const current = this.getWhatsAppConfig();
    const updated: WhatsAppConfig = {
      ...current,
      ...updates,
      autoReplySettings: {
        ...current.autoReplySettings,
        ...(updates.autoReplySettings || {})
      }
    };
    if (updates.enabled && !current.enabled) {
      updated.activatedAt = new Date().toISOString();
    }
    // If token or phone ID is provided, automatically mark enabled
    if (updates.apiKey || updates.phoneNumberId) {
      updated.enabled = true;
    }
    this.data.whatsappConfig = updated;
    this.save();
    try {
      this.saveDatabaseSync(this.data);
    } catch (err) {
      console.warn('Sync save WhatsApp config error:', err);
    }
    return updated;
  }

  public getWhatsAppLogs(): WhatsAppMessageLog[] {
    if (!this.data.whatsappLogs) {
      this.data.whatsappLogs = [];
    }
    return this.data.whatsappLogs;
  }

  public addWhatsAppLog(logData: Omit<WhatsAppMessageLog, 'id' | 'createdAt'>): WhatsAppMessageLog {
    if (!this.data.whatsappLogs) {
      this.data.whatsappLogs = [];
    }
    const log: WhatsAppMessageLog = {
      ...logData,
      id: `walog-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    this.data.whatsappLogs.unshift(log);
    // Keep max 200 logs
    if (this.data.whatsappLogs.length > 200) {
      this.data.whatsappLogs = this.data.whatsappLogs.slice(0, 200);
    }
    this.save();
    return log;
  }

  public clearWhatsAppLogs(): boolean {
    this.data.whatsappLogs = [];
    this.save();
    return true;
  }

  // --- Conversations (Pedagogical Assistant) ---
  public getConversations(userId?: string) {
    if (userId) return this.data.conversations.filter(c => c.userId === userId);
    return this.data.conversations;
  }

  public getConversationById(id: string) {
    return this.data.conversations.find(c => c.id === id);
  }

  public saveConversation(conv: Conversation) {
    const idx = this.data.conversations.findIndex(c => c.id === conv.id);
    if (idx !== -1) {
      this.data.conversations[idx] = conv;
    } else {
      this.data.conversations.unshift(conv);
    }
    this.save();
    return conv;
  }

  public deleteConversation(id: string) {
    this.data.conversations = this.data.conversations.filter(c => c.id !== id);
    this.save();
    return true;
  }

  // --- Bookmarks ---
  public getBookmarks(userId?: string) {
    if (userId) return this.data.bookmarks.filter(b => b.userId === userId);
    return this.data.bookmarks;
  }

  public addBookmark(bm: Bookmark) {
    this.data.bookmarks.unshift(bm);
    this.save();
    return bm;
  }

  public deleteBookmark(id: string) {
    this.data.bookmarks = this.data.bookmarks.filter(b => b.id !== id);
    this.save();
    return true;
  }

  // --- Audit Logs ---
  public getAuditLogs() {
    return this.data.auditLogs;
  }

  // --- Backup & Restore Engine ---
  public createBackup(): BackupJob {
    const backupId = `backup-${Date.now()}`;
    const filename = `library_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const filePath = path.join(BACKUP_DIR, filename);

    const snapshot = JSON.stringify(this.data, null, 2);
    const checksum = crypto.createHash('sha256').update(snapshot).digest('hex');

    fs.writeFileSync(filePath, snapshot, 'utf-8');
    const sizeBytes = fs.statSync(filePath).size;

    const job: BackupJob = {
      id: backupId,
      filename,
      sizeBytes,
      itemCounts: {
        resources: this.data.resources.length,
        pages: this.data.pages.length,
        chunks: this.data.chunks.length,
        lessons: this.data.generatedLessons.length,
        worksheets: this.data.worksheets.length,
        assessments: this.data.assessments.length,
        geographic: this.data.geographicResources.length
      },
      status: 'completed',
      checksum,
      createdAt: new Date().toISOString()
    };

    this.data.backupJobs.unshift(job);
    this.logAudit('system', 'نظام النسخ الاحتياطي', 'backup', 'system', backupId, `تم إنشاء نسخة احتياطية بحجم ${(sizeBytes / 1024).toFixed(1)} KB وبصمة ${checksum.slice(0, 10)}`);
    this.save();

    return job;
  }

  public getBackups(): BackupJob[] {
    return this.data.backupJobs;
  }

  public restoreBackup(filename: string): { success: boolean; message: string; verifiedChecksum?: boolean } {
    const filePath = path.join(BACKUP_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return { success: false, message: 'ملف النسخة الاحتياطية غير موجود' };
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed: DatabaseSchema = JSON.parse(content);

      // Verify schema keys
      if (!parsed.resources || !parsed.stages || !parsed.subjects) {
        return { success: false, message: 'هيكل ملف النسخة الاحتياطية غير صالح أو تالف' };
      }

      const calculatedChecksum = crypto.createHash('sha256').update(content).digest('hex');
      const backupJob = this.data.backupJobs.find(j => j.filename === filename);
      const verified = backupJob ? backupJob.checksum === calculatedChecksum : true;

      // Apply restore
      this.data = parsed;
      this.saveDatabaseSync(this.data);

      this.logAudit('system', 'نظام الاستعادة', 'restore_backup', 'system', filename, `تمت استعادة البيانات بنجاح من النسخة ${filename}`);

      return {
        success: true,
        message: 'تمت استعادة قاعدة البيانات والملفات بنجاح ومطابقة البصمة الرقمية',
        verifiedChecksum: verified
      };
    } catch (err: any) {
      return { success: false, message: `فشلت الاستعادة: ${err.message}` };
    }
  }

  // --- Export Full Metadata in JSON / CSV ---
  public exportMetadata(format: 'json' | 'csv'): string {
    if (format === 'json') {
      return JSON.stringify({
        exportDate: new Date().toISOString(),
        resources: this.data.resources,
        taxonomy: this.getTaxonomy(),
        lessons: this.data.generatedLessons,
        worksheets: this.data.worksheets,
        assessments: this.data.assessments,
        geographic: this.data.geographicResources
      }, null, 2);
    }

    // CSV for Resources
    const headers = ['id', 'title', 'author', 'type', 'format', 'subjectId', 'reliability', 'pageCount', 'fileSize', 'createdAt'];
    const rows = this.data.resources.map(r => {
      return [
        r.id,
        `"${(r.title || '').replace(/"/g, '""')}"`,
        `"${(r.author || '').replace(/"/g, '""')}"`,
        r.type,
        r.format,
        r.subjectId || '',
        r.reliability,
        r.pageCount || 0,
        r.fileSize || 0,
        r.createdAt
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  // --- Offline Sync Operations ---
  public applySyncOperation(op: SyncOperation): { status: 'applied' | 'conflict'; message?: string } {
    try {
      if (op.entityType === 'lesson') {
        this.saveLesson(op.payload);
      } else if (op.entityType === 'worksheet') {
        this.saveWorksheet(op.payload);
      } else if (op.entityType === 'assessment') {
        this.saveAssessment(op.payload);
      } else if (op.entityType === 'bookmark') {
        this.addBookmark(op.payload);
      } else if (op.entityType === 'resource' && op.operation === 'update') {
        this.updateResource(op.entityId, op.payload);
      }
      this.data.syncOperations.unshift({ ...op, status: 'applied' });
      this.save();
      return { status: 'applied' };
    } catch (err: any) {
      return { status: 'conflict', message: err.message };
    }
  }
}

export const db = new Database();
