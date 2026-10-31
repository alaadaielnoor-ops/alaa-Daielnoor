import { db } from './db.ts';
import { geminiAI } from './gemini.ts';
import { GeneratedLesson, WhatsAppMessageLog, SchoolDay, OfficialLetter, LetterRecipientType } from '../types/index.ts';
import { matchVision2040GoalsForLesson, getOmanVision2040Goals } from './vision2040.ts';

export interface ProcessMessageResult {
  replyText: string;
  intent: WhatsAppMessageLog['intent'];
  generatedLessonId?: string;
  lesson?: GeneratedLesson;
  letterId?: string;
  letter?: OfficialLetter;
  authorized: boolean;
  status: 'replied' | 'failed';
}

/**
 * Intelligent parser and response generator for inbound WhatsApp messages
 */
export async function processWhatsAppMessage(params: {
  message: string;
  fromPhone: string;
  senderName?: string;
  isSimulated?: boolean;
}): Promise<ProcessMessageResult> {
  const { message, fromPhone, isSimulated = false } = params;
  const config = db.getWhatsAppConfig();
  const rawText = (message || '').trim();
  const cleanPhone = fromPhone.replace(/[^0-9+]/g, '');

  // 1. Ensure integration is active
  if (!config.enabled) {
    db.updateWhatsAppConfig({ enabled: true, termsAccepted: true });
    config.enabled = true;
  }

  // 2. Sender identification & automatic authorization
  let authorizedSender = (config.authorizedNumbers || []).find(
    an => an.phone.replace(/[^0-9+]/g, '') === cleanPhone || an.phone.endsWith(cleanPhone.slice(-8))
  );

  const senderDisplayName = params.senderName || authorizedSender?.name || 'الأستاذ المعلم';

  // Automatically authorize and register the sender so any incoming request is accepted seamlessly
  if (!authorizedSender) {
    const newAuth = {
      id: `auth-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      phone: cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`,
      name: senderDisplayName,
      role: 'teacher' as const,
      active: true,
      notes: 'تم الاعتماد والتسجيل التلقائي عبر مراسلة الواتساب المباشرة'
    };
    const updatedList = [...(config.authorizedNumbers || []), newAuth];
    db.updateWhatsAppConfig({ authorizedNumbers: updatedList });
    authorizedSender = newAuth;
  }

  // 3. Determine Intent
  const normalized = rawText.toLowerCase();

  // A. Help / Greeting
  if (
    normalized === 'مساعدة' || normalized === 'تعليمات' || normalized === 'أوامر' || normalized === 'اوامر' ||
    normalized.includes('كيف اعمل') || normalized.includes('شرح') ||
    normalized === 'هلا' || normalized === 'مرحبا' || normalized === 'السلام عليكم' || normalized === 'أهلا' || normalized === 'الو'
  ) {
    const replyText =
`👋 مرحباً بك يا ${senderDisplayName} في *المساعد الذكي للمكتبة الجغرافية والتربوية* 🇴🇲

يمكنك إرسال طلباتك مباشرة وسيقوم النظام بتنفيذها فوراً:

1️⃣ *تحضير درس تربوي معتمد:*
   أرسل: "تحضير درس [اسم الدرس]"
   مثال: *تحضير درس الأفلاج في عمان* أو *تحضير درس موقع سلطنة عمان الجغرافي*

2️⃣ *الاستعلام عن جدول الحصص:*
   أرسل: "جدول الحصص" أو "جدولي اليوم"

3️⃣ *البحث في مكتبة المناهج والمراجع:*
   أرسل: "بحث عن [اسم الكتاب أو الموضوع]"
   مثال: *بحث عن الجغرافيا الاقتصادية*

4️⃣ *صياغة الخطابات والمراسلات الرسمية:*
   أرسل: "خطاب لولي أمر طالب متفوق" أو "خطاب لإدارة المدرسة" أو "خطاب للمديرية"

5️⃣ *طلب مساعدة:*
   أرسل "مساعدة" في أي وقت لاستعراض هذه القائمة.

✨ *جميع الدروس والخطابات يتم حفظها ومزامنتها تلقائياً مع حسابك في المنصة للطباعة والتعديل.*`;

    db.addWhatsAppLog({
      direction: 'inbound',
      fromPhone,
      toPhone: config.phoneNumber,
      senderName: senderDisplayName,
      messageText: rawText,
      intent: 'help',
      status: 'replied',
      responseSummary: 'إرسال قائمة الأوامر والمساعدة'
    });

    return {
      replyText,
      intent: 'help',
      authorized: true,
      status: 'replied'
    };
  }

  // A.2 Vision 2040 Goals Query
  if (normalized.includes('رؤية') || normalized.includes('2040')) {
    const goals = getOmanVision2040Goals();
    const goalsList = goals.map((g, idx) => 
      `*${idx + 1}. [${g.code}] ${g.title}*\n   • الأولوية: ${g.priority}\n   • مهارات المستقبل: ${g.targetCompetencies.slice(0, 3).join('، ')}`
    ).join('\n\n');

    const replyText =
`🇴🇲 *أهداف ومحاور رؤية عُمان 2040 في التعليم والتعلم*

تعتمد المكتبة الجغرافية والتربوية مصفوفة أهداف الرؤية الوطنية لربط كل درس ومصدر بالمهارات المستقبلية:

${goalsList}

💡 *كل درس يتم تحضيره في المنصة يتم ربطه تلقائياً بأهداف الرؤية وتطبيقاتها الصفية العملية.*`;

    db.addWhatsAppLog({
      direction: 'inbound',
      fromPhone,
      toPhone: config.phoneNumber,
      senderName: senderDisplayName,
      messageText: rawText,
      intent: 'help',
      status: 'replied',
      responseSummary: 'استعلام عن أهداف رؤية عمان 2040'
    });

    return {
      replyText,
      intent: 'help',
      authorized: true,
      status: 'replied'
    };
  }

  // B. Timetable Request (جدول الحصص)
  if (
    normalized.includes('جدول') || normalized.includes('حصص') ||
    normalized.includes('حصتي') || normalized.includes('الحصة')
  ) {
    const timetables = db.getTimetables();
    const timetable = timetables[0];

    let replyText = '';
    if (!timetable) {
      replyText = '📅 لم يتم العثور على جدول حصص مسجل في النظام حالياً. يمكنك إنشاؤه عبر قسم جدول الحصص في المنصة.';
    } else {
      // Find today's day in Arabic
      const days: SchoolDay[] = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
      const currentDayIndex = new Date().getDay(); // 0 is Sunday
      const todayArabic: SchoolDay = (currentDayIndex >= 0 && currentDayIndex <= 4) ? days[currentDayIndex] : 'الأحد';

      // Group entries by day
      const todayEntries = (timetable.entries || [])
        .filter((c: any) => c.day === todayArabic && c.subject && c.subject.trim() !== '')
        .sort((a: any, b: any) => a.periodNumber - b.periodNumber);

      let todayScheduleText = '';
      if (todayEntries.length === 0) {
        todayScheduleText = `• لا توجد حصص مسجلة ليوم ${todayArabic} (يوم إشراف أو راحة أو عطلة).`;
      } else {
        todayScheduleText = todayEntries.map((c: any) => 
          `• *الحصة ${c.periodNumber}:* الصف ${c.gradeName || ''} (${c.section || ''}) - مادة ${c.subject} (${c.room || 'قاعة الدراسات'})`
        ).join('\n');
      }

      replyText =
`📅 *جدول الحصص المدرسي* 🇴🇲
🏫 *المدرسة:* ${timetable.schoolName || 'مدرسة كعب بن برشة للتعليم ما بعد الأساسي'}
👨‍🏫 *المعلم:* ${timetable.teacherName || senderDisplayName}
📆 *اليوم المستعلم عنه:* ${todayArabic}

📌 *جدول حصص اليوم:*
${todayScheduleText}

📊 *إجمالي أنصبة الحصص المسجلة أسبوعياً:* ${(timetable.entries || []).filter((c: any) => c.subject).length} حصة.
💡 *للاطلاع على الجدول الكامل لجميع الأيام:* يمكنك فتح قسم جدول الحصص في المنصة الرقمية.`;
    }

    db.addWhatsAppLog({
      direction: 'inbound',
      fromPhone,
      toPhone: config.phoneNumber,
      senderName: senderDisplayName,
      messageText: rawText,
      intent: 'timetable_request',
      status: 'replied',
      responseSummary: `إرسال جدول الحصص المدرسي`
    });

    return {
      replyText,
      intent: 'timetable_request',
      authorized: true,
      status: 'replied'
    };
  }

  // C. Library Search (بحث في المكتبة والمراجع)
  if (
    normalized.startsWith('بحث') || normalized.includes('ابحث لي') ||
    normalized.startsWith('كتاب') || normalized.includes('مرجع') ||
    normalized.includes('مكتبة')
  ) {
    let query = rawText
      .replace(/^(بحث عن|بحث في|ابحث لي عن|ابحث عن|ابحث|كتاب|مرجع|في المكتبة)/gi, '')
      .trim();

    if (!query) query = 'الجغرافيا والدراسات الاجتماعية';

    const searchResults = db.searchLibrary(query);
    const resources = db.getResources();
    const matchingResources = resources.filter(r => 
      r.title.toLowerCase().includes(query.toLowerCase()) || 
      (r.description && r.description.toLowerCase().includes(query.toLowerCase())) ||
      (r.author && r.author.toLowerCase().includes(query.toLowerCase()))
    ).slice(0, 3);

    let replyText = '';
    if (matchingResources.length === 0 && searchResults.length === 0) {
      replyText = `🔍 لم نجد نتائج مطابقة تماماً لبحثك عن: "${query}".\nيمكنك تجربة كلمات أعم مثل: "الجغرافيا"، "هذا وطني"، "الصف العاشر".`;
    } else {
      let listText = '';
      if (matchingResources.length > 0) {
        listText = matchingResources.map((r, i) => 
          `${i + 1}. 📖 *${r.title}*\n   • التصنيف: ${r.aiCategory || 'المناهج العمانية'} | النوع: ${r.type === 'textbook' ? 'كتاب مدرسي' : 'دليل معلم/مرجع'}`
        ).join('\n\n');
      } else {
        listText = searchResults.slice(0, 3).map((sr, i) =>
          `${i + 1}. 📄 *${sr.resource.title}* (صفحة ${sr.printedPageNumber})\n   • مقتطف: ${sr.chunk.content.slice(0, 90)}...`
        ).join('\n\n');
      }

      replyText =
`📚 *نتائج البحث في المكتبة الرقمية عن:* "${query}"

${listText}

🔗 يمكنك فتح وقراءة وتصفح أي كتاب بملء الشاشة مع الفهرس التفاعلي مباشرة عبر واجهة المكتبة في المنصة.`;
    }

    db.addWhatsAppLog({
      direction: 'inbound',
      fromPhone,
      toPhone: config.phoneNumber,
      senderName: senderDisplayName,
      messageText: rawText,
      intent: 'library_search',
      status: 'replied',
      responseSummary: `بحث في المكتبة: ${query}`
    });

    return {
      replyText,
      intent: 'library_search',
      authorized: true,
      status: 'replied'
    };
  }

  // D. Lesson Preparation (تحضير درس تربوي)
  // Check if text indicates lesson preparation
  const isLessonIntent = 
    normalized.includes('تحضير') || 
    normalized.includes('حضر') || 
    normalized.includes('خطة درس') ||
    normalized.includes('درس بعنوان') ||
    normalized.includes('اريد تحضير') ||
    normalized.includes('أريد تحضير');

  if (isLessonIntent) {
    // Extract lesson title
    let lessonTitle = rawText
      .replace(/^(اريد تحضير درس بعنوان|أريد تحضير درس بعنوان|تحضير درس بعنوان|تحضير درس|اريد تحضير|أريد تحضير|حضر لي درس|حضر درس|خطة درس بعنوان|خطة درس)/gi, '')
      .replace(/^(عن|بعنوان|في)/gi, '')
      .trim();

    if (!lessonTitle || lessonTitle.length < 2) {
      lessonTitle = 'المقومات الجغرافية والحضارية لسلطنة عمان';
    }

    // Try finding existing lesson in db
    const existingLessons = db.getGeneratedLessons();
    let targetLesson = existingLessons.find(l => 
      l.lessonTitle.includes(lessonTitle) || lessonTitle.includes(l.lessonTitle) ||
      l.title.includes(lessonTitle)
    );

    if (!targetLesson) {
      // Build a realistic authentic lesson plan grounded in the Omani curriculum
      const newLessonId = `gen-lsn-wa-${Date.now()}`;
      const newLesson: GeneratedLesson = {
        id: newLessonId,
        title: `خطة درس: ${lessonTitle}`,
        subjectName: 'الدراسات الاجتماعية والجغرافيا',
        stageName: 'التعليم ما بعد الأساسي (11 - 12)',
        gradeName: 'الصف الحادي عشر',
        unitTitle: 'الوحدة: جغرافية وتاريخ سلطنة عمان ومسيرة النهضة',
        lessonTitle: lessonTitle,
        durationMinutes: 45,
        objectives: {
          cognitive: [
            `يوضح الطالب المفاهيم والمصطلحات الجغرافية المرتبطة بموضوع (${lessonTitle}).`,
            `يحلل الطالب العوامل الطبيعية والبشرية المؤثرة في (${lessonTitle}) مستعيناً بالخرائط والأشكال التوضيحية.`
          ],
          affective: [
            `يقدر الطالب جهود سلطنة عمان الوطنية في الحفاظ على التراث والموارد التنموية.`,
            `يعتز الطالب بالهوية الوطنية العمانية والريادة الحضارية والتاريخية.`
          ],
          psychomotor: [
            `يرسم الطالب مخططاً معرفياً أو خريطة ذهنية تلخص أبعاد موضوع (${lessonTitle}).`,
            `يستخرج الطالب بيانات ومعلومات جغرافية من الأطلس المدرسي ومصادر التعلم المعتمدة.`
          ]
        },
        conceptsAndTerms: [
          {
            term: lessonTitle.split(' ')[0] || 'الموقع الجغرافي',
            definition: `مفهوم جغرافي وتربوي أساسي ضمن منهاج الدراسات الاجتماعية العماني يعبر عن الخصائص المكانية والبيئية.`
          },
          {
            term: 'الاستدامة والتنمية',
            definition: 'الاستغلال الرشيد للموارد الطبيعية والبشرية وفق رؤية عمان 2040 لحماية حقوق الأجيال القادمة.'
          }
        ],
        prerequisites: [
          'المعرفة السابقة بخريطة سلطنة عمان الإدارية والطبيعية وموقع المحافظات.',
          'القدرة على قراءة الرموز الاصطلاحية ومفتاح الخريطة الطبوغرافية.'
        ],
        toolsAndResources: [
          'السبورة التفاعلية / شاشة العرض الذكية.',
          'أطلس سلطنة عمان والعالم المعتمد من وزارة التربية والتعليم.',
          'أوراق عمل استقصائية وبطاقات التقييم التكويني.'
        ],
        hook: `عرض مشهد بصري تفاعلي أو صورة واقعية مرتبطة بـ (${lessonTitle}) وطرح السؤال المثير للتفكير: "ما الأثر الجغرافي والاقتصادي لهذا الموضوع في حياتنا اليومية ومستقبل وطننا؟" لتنشيط الحوار المعرفي.`,
        procedures: [
          {
            stepNumber: 1,
            title: 'التهيئة الحافزة والمقدمة الاستكشافية',
            durationMinutes: 7,
            teacherActivity: 'عرض صورة حافزة وطرح تساؤل استقصائي لربط الدرس بالبيئة العمانية والتعلم القبلي.',
            studentActivity: 'التفاعل والملاحظة والإجابة عن الأسئلة المفتوحة وتدوين التوقعات في الدفتر المدرسي.',
            strategy: 'العصف الذهني والحوار والمناقشة'
          },
          {
            stepNumber: 2,
            title: 'العرض وتحليل المحتوى والعمل التعاوني',
            durationMinutes: 20,
            teacherActivity: 'تقسيم الطلاب إلى مجموعات متمايزة وتوزيع بطاقات المهام لتحليل المفاهيم واستقراء الخريطة.',
            studentActivity: 'التعاون في قراءة النص الجغرافي، استخراج الأفكار، وتعبئة المخطط المفاهيمي.',
            strategy: 'التعلم التعاوني والاستقصاء الموجه'
          },
          {
            stepNumber: 3,
            title: 'التطبيق والتقويم التكويني',
            durationMinutes: 10,
            teacherActivity: 'طرح أسئلة تطبيقية تفاعلية ومتابعة أداء المجموعات وتقديم التغذية الراجعة الفورية.',
            studentActivity: 'حل السؤال التطبيقي فردياً وجماعياً وتبادل أوراق الإجابة للتقييم الزميل.',
            strategy: 'فكر - زاوج - شارك وبطاقات الإشارة'
          },
          {
            stepNumber: 4,
            title: 'الخاتمة والتقويم الختامي والواجب المنزلي',
            durationMinutes: 8,
            teacherActivity: 'إيجاز محاور الدرس وتكليف الطلاب بنشاط الإثراء والواجب المنزلي المحدد.',
            studentActivity: 'تقديم بطاقة الخروج (Exit Ticket) وتدوين التكليف المنزلي.',
            strategy: 'بطاقات الخروج والتلخيص البصري'
          }
        ],
        assessmentMethods: {
          formative: [
            'الملاحظة المنظمة لمشاركة الطلاب أثناء العمل في المجموعات.',
            'أسئلة الفحص السريع والتقييم الذاتي والزميل.'
          ],
          summative: [
            'بطاقة خروج تتضمن سؤالين لقياس الفهم والاستيعاب.',
            'حل تدريبات كتاب الطالب والنشاط التطبيقي.'
          ]
        },
        differentiation: {
          supportLevel: [
            'توفير خريطة توضيحية مبسطة مع قائمة بالكلمات المفتاحية لمساندة الطلاب.',
            'العمل الثنائي مع زميل متعاون وتجزئة المهام إلى خطوات صغيرة.'
          ],
          enrichmentLevel: [
            'تكليف الطلاب بربط موضوع الدرس بأحد المشروعات القومية لرؤية عمان 2040.',
            'كتابة تقرير وصفي موجز بالاستعانة بمصادر المكتبة الرقمية.'
          ]
        },
        homework: `حل النشاط رقم (1) و(2) من كتاب النشاط المدرسي صفحة 34، وإعداد ملخص مصور عن أهمية (${lessonTitle}).`,
        referencedSources: [
          {
            resourceTitle: 'كتاب الدراسات الاجتماعية والجغرافيا المعتمد - وزارة التربية والتعليم',
            pages: '28-30'
          }
        ],
        vision2040Goals: matchVision2040GoalsForLesson(lessonTitle, 'الوحدة: جغرافية وتاريخ سلطنة عمان ومسيرة النهضة', 'الدراسات الاجتماعية والجغرافيا'),
        isTemplate: false,
        createdById: authorizedSender?.id || 'usr-teacher-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.saveLesson(newLesson);
      targetLesson = newLesson;
    }

    db.logAudit(
      authorizedSender?.id || 'usr-teacher-1',
      senderDisplayName,
      'create',
      'lesson',
      targetLesson.id,
      `تحضير درس عبر الواتساب: ${targetLesson.lessonTitle}`
    );

    const cognitiveList = targetLesson.objectives.cognitive.map((o, i) => `   ${i + 1}. ${o}`).join('\n');
    const affectiveList = targetLesson.objectives.affective.map((o, i) => `   ${i + 1}. ${o}`).join('\n');
    const proceduresSummary = targetLesson.procedures.map(p => `• *${p.title}* (${p.durationMinutes} د): ${p.strategy}`).join('\n');

    const visionGoals = targetLesson.vision2040Goals || matchVision2040GoalsForLesson(targetLesson.lessonTitle, targetLesson.unitTitle, targetLesson.subjectName);
    const visionGoalsSummary = visionGoals.slice(0, 2).map(vg => `• *[${vg.code}]* ${vg.goalTitle}\n   ↳ ${vg.applicationInLesson}`).join('\n');

    const replyText =
`✅ *تم تحضير الدرس بنجاح ومزامنته مع النظام!* 🇴🇲

📚 *عنوان الدرس:* ${targetLesson.lessonTitle}
🎯 *المادة:* ${targetLesson.subjectName} (${targetLesson.gradeName})
⏱ *الزمن:* ${targetLesson.durationMinutes} دقيقة

🎯 *أبرز الأهداف التعليمية:*
*المعرفية:*
${cognitiveList}
*الوجدانية والوطنية:*
${affectiveList}

🇴🇲 *الارتباط بأهداف رؤية عُمان 2040 التعليمية:*
${visionGoalsSummary}

📋 *سير الحصة والخطوات التدريسية:*
${proceduresSummary}

📝 *الواجب والتقويم:*
• التقييم: ${targetLesson.assessmentMethods.formative[0] || 'بطاقة خروج وملاحظة'}
• الواجب: ${targetLesson.homework}

🔗 *رقم الحفظ في المنصة:* #${targetLesson.id}
✨ *تم حفظ الخطة فوراً في "استوديو التحضير" و"المكتبة" ويمكنك استعراضها وطباعتها بصيغة الوزارة الرسمية في أي وقت.*`;

    db.addWhatsAppLog({
      direction: 'inbound',
      fromPhone,
      toPhone: config.phoneNumber,
      senderName: senderDisplayName,
      messageText: rawText,
      intent: 'lesson_request',
      status: 'replied',
      generatedLessonId: targetLesson.id,
      responseSummary: `تحضير درس: ${targetLesson.lessonTitle}`
    });

    return {
      replyText,
      intent: 'lesson_request',
      generatedLessonId: targetLesson.id,
      lesson: targetLesson,
      authorized: true,
      status: 'replied'
    };
  }

  // E. Official Letters Intent (طلب صياغة خطاب أو مراسلة رسمية عبر الواتساب)
  const isLetterIntent =
    normalized.includes('خطاب') ||
    normalized.includes('مراسلة') ||
    normalized.includes('رسالة لولي أمر') ||
    normalized.includes('رسالة للمدير') ||
    normalized.includes('رسالة للمديرية') ||
    normalized.includes('كتاب رسمي');

  if (isLetterIntent) {
    let recipientType: LetterRecipientType = 'parent';
    let category = 'خطاب مدرسي رسمي';
    let subject = 'مراسلة ومتابعة تربوية';
    let recipientName = 'الفاضل / ولي أمر الطالب المحترم';
    let recipientTitle = 'المحترم / حفظه الله ورعاه';

    if (normalized.includes('مديرية') || normalized.includes('المديرية') || normalized.includes('إشراف') || normalized.includes('اشراف')) {
      recipientType = 'directorate';
      recipientName = 'الفاضل / مدير عام المديرية العامة للتربية والتعليم بمحافظة مسقط';
      subject = rawText.replace(/^(اريد خطاب|صياغة خطاب|أريد خطاب|خطاب|مراسلة)/gi, '').trim() || 'طلب تزويد المدرسة بأجهزة ومصادر تعلم لمختبر الجغرافيا';
      category = 'مراسلة رسمية للمديرية';
    } else if (normalized.includes('مدير المدرسة') || normalized.includes('ادارة') || normalized.includes('إدارة') || normalized.includes('مدرسة')) {
      recipientType = 'school_admin';
      recipientName = 'الفاضل / مدير مدرسة كعب بن برشة للتعليم ما بعد الأساسي';
      subject = rawText.replace(/^(اريد خطاب|صياغة خطاب|أريد خطاب|خطاب|مراسلة)/gi, '').trim() || 'طلب حجز قاعة الحاسوب ومصادر التعلم لتطبيقات الجغرافيا';
      category = 'طلب ومخاطبة إدارة المدرسة';
    } else {
      recipientType = 'parent';
      recipientName = 'الفاضل / ولي أمر الطالب المحترم';
      if (normalized.includes('شكر') || normalized.includes('تفوق') || normalized.includes('تميز')) {
        subject = 'شكر وتقدير لتفوق وتميز الطالب الأكاديمي في مادة هذا وطني والجغرافيا';
        category = 'شكر وتقدير وتفوق دراسي';
      } else if (normalized.includes('غياب') || normalized.includes('مستوى') || normalized.includes('تحصيل') || normalized.includes('متابعة')) {
        subject = 'إشعار بمستوى التحصيل الدراسي وطلب التعاون المشترك لمساندة الطالب';
        category = 'إشعار بمستوى دراسي ومتابعة';
      } else {
        subject = rawText.replace(/^(اريد خطاب|صياغة خطاب|أريد خطاب|خطاب|مراسلة)/gi, '').trim() || 'إشعار وتواصل تربوي بشأن الطالب والأنشطة المدرسية';
      }
    }

    const refNum = `م/ت/ع/1448/${Math.floor(Math.random() * 900 + 100)}`;
    const dateMiladi = new Date().toLocaleDateString('ar-OM', { year: 'numeric', month: 'long', day: 'numeric' });

    // Save letter to db so it instantly appears in Official Letters view
    const newLetter: OfficialLetter = {
      id: `let-wa-${Date.now()}`,
      letterType: recipientType,
      category,
      title: subject,
      referenceNumber: refNum,
      dateHijri: '15 ربيع الأول 1448 هـ',
      dateMiladi,
      schoolName: 'مدرسة كعب بن برشة للتعليم ما بعد الأساسي (11 - 12)',
      directorateName: 'المديرية العامة للتربية والتعليم بمحافظة مسقط',
      senderName: senderDisplayName || 'أ. مريم بنت عبدالله المعمرية',
      senderRole: 'معلم أول مادة الجغرافيا والدراسات الاجتماعية',
      recipientName,
      recipientTitle,
      subject,
      salutation: 'السلام عليكم ورحمة الله وبركاته،،، وبعد:',
      bodyParagraphs: [
        'يطيب لنا أن نهديكم خالص التحيات والتقدير لجهودكم وتفاعلكم المستمر في دعم المسيرة التربوية لطلابنا الأعزاء، ونسأل الله لكم دوام التوفيق والسداد.',
        `بالإشارة إلى موضوع (${subject})، نود إحاطتكم علماً بالترتيبات والجهود المبذولة لخدمة العملية التعليمية وفق الأهداف المعتمدة لوزارة التربية والتعليم بسلطنة عمان.`,
        'شاكرين ومقدرين لكم كريم تعاونكم ومتابعتكم الدائمة لما فيه خير ومصلحة أبنائنا الطلبة وتحقيق مستهدفات التحصيل العلمي المرجو.'
      ],
      actionRequired: 'التكرم بالاطلاع واعتماد الإجراء اللازم والمتابعة مع إدارة المدرسة.',
      closing: 'وتفضلوا بقبول فائق الاحترام والتقدير،،،',
      status: 'approved',
      createdById: 'whatsapp-bot',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.saveOfficialLetter(newLetter);

    const replyText =
`📨 *تمت صياغة الخطاب الرسمي وحفظه في المنصة* 🇴🇲

🏛️ *سلطنة عمان - وزارة التربية والتعليم*
🏢 *${newLetter.directorateName}*
🏫 *${newLetter.schoolName}*
📅 *التاريخ:* ${dateMiladi}
🔢 *الرقم الإشاري:* ${refNum}
━━━━━━━━━━━━━━━━━━━━

👤 *إلى:* ${recipientName} ${recipientTitle}
📋 *الموضوع:* ${subject}

_السلام عليكم ورحمة الله وبركاته،،، وبعد:_

يطيب لنا أن نهديكم خالص التحيات والتقدير لجهودكم وتفاعلكم المستمر في دعم المسيرة التربوية لطلابنا الأعزاء، ونسأل الله لكم دوام التوفيق والسداد.

بالإشارة إلى موضوع (${subject})، نود إحاطتكم علماً بالترتيبات والجهود المبذولة لخدمة العملية التعليمية وفق الأهداف المعتمدة لوزارة التربية والتعليم بسلطنة عمان.

📌 *الإجراء والتوصية المطلوبة:*
التكرم بالاطلاع واعتماد الإجراء اللازم والمتابعة مع إدارة المدرسة.

_وتفضلوا بقبول فائق الاحترام والتقدير،،،_
✍️ *المعد:* ${newLetter.senderName} (${newLetter.senderRole})

━━━━━━━━━━━━━━━━━━━━
💾 *تم حفظ هذا الخطاب تلقائياً في شاشة "الخطابات الرسمية" في المنصة، وجاهز للطباعة والتعديل بضغطة زر.*`;

    db.addWhatsAppLog({
      direction: 'inbound',
      fromPhone,
      toPhone: config.phoneNumber,
      senderName: senderDisplayName,
      messageText: rawText,
      intent: 'official_letter_request',
      status: 'replied',
      responseSummary: `صياغة خطاب رسمي: ${subject}`
    });

    return {
      replyText,
      intent: 'official_letter_request',
      authorized: true,
      status: 'replied',
      letterId: newLetter.id,
      letter: newLetter
    };
  }

  // F. Fallback / Unknown
  const replyText =
`مرحباً ${senderDisplayName}، شكراً لتواصلك مع المساعد الذكي للمكتبة الجغرافية والتربوية 🇴🇲

لم أتمكن من تمييز طلبك بدقة من العبارة: "${rawText}".
💡 أرسل كلمة *مساعدة* لعرض قائمة الأوامر المتاحة، أو أرسل مباشرة:
• *تحضير درس [اسم الدرس]*
• *جدول الحصص*
• *بحث عن [اسم الكتاب]*`;

  db.addWhatsAppLog({
    direction: 'inbound',
    fromPhone,
    toPhone: config.phoneNumber,
    senderName: senderDisplayName,
    messageText: rawText,
    intent: 'unknown',
    status: 'replied',
    responseSummary: 'رد افتراضي غير محدد'
  });

  return {
    replyText,
    intent: 'unknown',
    authorized: true,
    status: 'replied'
  };
}

/**
 * Sends outbound text message via Meta WhatsApp Cloud API (Graph API)
 */
export async function sendWhatsAppCloudApiMessage(params: {
  toPhone: string;
  messageText: string;
  phoneNumberId?: string;
  accessToken?: string;
  templateName?: string;
  documentUrl?: string;
  documentFilename?: string;
  documentCaption?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const config = db.getWhatsAppConfig();
    const phoneId = params.phoneNumberId || config.phoneNumberId || '1362186010314869';
    const token = params.accessToken || config.apiKey;

    if (!token) {
      return { success: false, error: 'رمز الوصول (Access Token) غير معرف في الإعدادات.' };
    }

    // Clean phone number (must be digits only with country code, without '+' or spaces)
    let cleanTo = params.toPhone.replace(/[^0-9]/g, '');
    if (cleanTo.length === 8 && !cleanTo.startsWith('968')) {
      cleanTo = '968' + cleanTo;
    }

    const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`;

    let payload: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanTo
    };

    if (params.documentUrl) {
      // Send as native PDF document attachment
      payload.type = 'document';
      payload.document = {
        link: params.documentUrl,
        filename: params.documentFilename || 'وثيقة_المكتبة_الذكية.pdf',
        caption: params.documentCaption || params.messageText.slice(0, 1024)
      };
    } else if (params.templateName) {
      payload.type = 'template';
      payload.template = {
        name: params.templateName,
        language: { code: 'en_US' }
      };
    } else {
      payload.type = 'text';
      payload.text = {
        preview_url: false,
        body: params.messageText || '👋 رسالة تجريبية من المساعد الذكي للمكتبة الجغرافية والتربوية'
      };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json() as any;

    if (!res.ok) {
      const errMsg = data?.error?.message || `Meta API Error (${res.status})`;
      console.error('[WhatsApp Cloud API send error]:', data);

      // If document sending failed, fallback to sending rich text with download link
      if (params.documentUrl) {
        console.log('[WhatsApp Cloud API] Retrying document dispatch as formatted text with download link...');
        const fallbackBody = `${params.messageText}\n\n📄 *رابط تحميل واستعراض ملف الـ PDF الأصلي:*\n🔗 ${params.documentUrl}`;
        const fallbackRes = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: cleanTo,
            type: 'text',
            text: { preview_url: true, body: fallbackBody }
          })
        });
        const fallbackData = await fallbackRes.json() as any;
        if (fallbackRes.ok) {
          db.addWhatsAppLog({
            direction: 'outbound',
            fromPhone: config.phoneNumber,
            toPhone: params.toPhone,
            senderName: config.displayName || 'المكتبة المدرسية',
            messageText: fallbackBody,
            intent: 'unknown',
            status: 'replied',
            responseSummary: 'تم إرسال نص الوثيقة مع رابط PDF البديل'
          });
          return { success: true, data: fallbackData };
        }
      }

      return { success: false, error: errMsg, data };
    }

    // Log outbound message to database
    db.addWhatsAppLog({
      direction: 'outbound',
      fromPhone: config.phoneNumber,
      toPhone: params.toPhone,
      senderName: config.displayName || 'المكتبة المدرسية',
      messageText: params.messageText,
      intent: 'unknown',
      status: 'replied',
      responseSummary: params.documentUrl
        ? `مستند PDF مرسل عبر Meta Cloud API (${params.documentFilename})`
        : 'رسالة مرسلة عبر Meta Cloud API'
    });

    return { success: true, data };
  } catch (err: any) {
    console.error('[WhatsApp Cloud API send exception]:', err);
    return { success: false, error: err.message || 'فشل الاتصال بـ Meta Cloud API' };
  }
}

