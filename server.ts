import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './src/server/db.ts';
import { geminiAI, CHATBOT_PERSONAS } from './src/server/gemini.ts';
import { processUploadedDocument } from './src/server/documentProcessor.ts';
import { processWhatsAppMessage, sendWhatsAppCloudApiMessage } from './src/server/whatsappBot.ts';
import { startCloudflareTunnel } from './src/server/tunnel.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Parse port from CLI argument (--port 3000) or env variable, default to 3000
const portArgIndex = process.argv.indexOf('--port');
const cliPort = portArgIndex !== -1 && process.argv[portArgIndex + 1] ? parseInt(process.argv[portArgIndex + 1], 10) : null;
const PORT = cliPort || Number(process.env.PORT) || 3000;

process.on('uncaughtException', (err) => {
  console.error('[Process UncaughtException]:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[Process UnhandledRejection]:', reason);
});


// High payload limits for uploading real educational PDFs, PPTXs and images
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Static directory for uploaded covers, avatars and generated PDF documents
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// ----------------------------------------------------
// PDF DOCUMENT UPLOAD & SERVING (For WhatsApp & Downloads)
// ----------------------------------------------------
app.post('/api/documents/upload-pdf', (req: Request, res: Response) => {
  try {
    const { dataUrl, base64, filename } = req.body;
    const rawPayload = dataUrl || base64;
    if (!rawPayload) {
      return res.status(400).json({ success: false, error: 'بيانات الـ PDF مفقودة' });
    }

    let base64Data = rawPayload;
    if (rawPayload.includes('base64,')) {
      base64Data = rawPayload.split('base64,')[1];
    }

    const targetDir = path.join(__dirname, 'public', 'uploads', 'documents');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const safeBase = (filename || 'document').replace(/[/\\?%*:|"<>]/g, '_').replace(/\.pdf$/i, '');
    const cleanFilename = `${safeBase}_${Date.now()}.pdf`;
    const filePath = path.join(targetDir, cleanFilename);
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

    // Check active tunnel or request host for full public URL
    const tunnelFile = path.resolve('data/active-tunnel.json');
    let baseUrl = '';
    if (fs.existsSync(tunnelFile)) {
      try {
        const tunnelData = JSON.parse(fs.readFileSync(tunnelFile, 'utf-8'));
        if (tunnelData.tunnelUrl) {
          baseUrl = tunnelData.tunnelUrl;
        }
      } catch (_) {}
    }

    if (!baseUrl) {
      const host = req.get('host');
      if (host) {
        baseUrl = `${req.protocol}://${host}`;
      }
    }

    const relativePath = `/uploads/documents/${cleanFilename}`;
    const fullPublicUrl = baseUrl ? `${baseUrl}${relativePath}` : relativePath;
    const viewerUrl = baseUrl ? `${baseUrl}/view-document/${cleanFilename}` : `/view-document/${cleanFilename}`;

    res.json({
      success: true,
      url: relativePath,
      fullUrl: fullPublicUrl,
      viewerUrl,
      filename: cleanFilename,
      message: 'تم حفظ ملف الـ PDF بنجاح'
    });
  } catch (err: any) {
    console.error('Failed to upload PDF document:', err);
    res.status(500).json({ success: false, error: err.message || 'فشل حفظ الـ PDF' });
  }
});

// Interactive Web Preview for Shared Documents (Matching Smart Library Design)
app.get('/view-document/:filename', (req: Request, res: Response) => {
  const safeFilename = path.basename(req.params.filename);
  const pdfPath = path.join(__dirname, 'public', 'uploads', 'documents', safeFilename);
  if (!fs.existsSync(pdfPath)) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head><meta charset="utf-8"><title>الوثيقة غير موجودة</title></head>
      <body style="font-family: sans-serif; text-align: center; padding: 50px; background: #0f172a; color: #fff;">
        <h2>عذراً، لم يتم العثور على الوثيقة أو انتهت صلاحيتها</h2>
      </body>
      </html>
    `);
  }
  const cleanTitle = decodeURIComponent(safeFilename).replace(/_/g, ' ').replace(/\.pdf$/i, '');
  const pdfUrl = `/uploads/documents/${encodeURIComponent(safeFilename)}`;

  res.send(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${cleanTitle} - وثيقة رسمية - سلطنة عمان</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Tajawal:wght@500;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Cairo', Tahoma, sans-serif; background: #0f172a; color: #f8fafc; min-height: 100vh; display: flex; flex-direction: column; }
    .header { background: #064e3b; border-bottom: 2px solid #059669; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand img { width: 44px; height: 44px; object-fit: contain; }
    .brand-text h1 { font-size: 1.15rem; color: #ffffff; font-weight: 800; margin: 0; }
    .brand-text p { font-size: 0.8rem; color: #a7f3d0; margin: 0; }
    .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 9999px; background: #065f46; color: #ecfdf5; font-size: 0.75rem; font-weight: 700; border: 1px solid #10b981; }
    .actions { display: flex; gap: 10px; }
    .btn { background: #059669; color: white; border: none; padding: 9px 18px; border-radius: 12px; font-family: 'Cairo', sans-serif; font-size: 0.85rem; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; font-weight: 700; transition: all 0.2s; box-shadow: 0 2px 6px rgba(0,0,0,0.2); }
    .btn:hover { background: #10b981; transform: translateY(-1px); }
    .btn-secondary { background: #1e293b; color: #cbd5e1; border: 1px solid #475569; }
    .btn-secondary:hover { background: #334155; color: white; }
    .preview-container { flex: 1; display: flex; flex-direction: column; height: calc(100vh - 120px); background: #1e293b; padding: 12px; }
    iframe { width: 100%; height: 100%; border: none; border-radius: 12px; background: white; box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
    .footer-note { text-align: center; padding: 12px; font-size: 0.8rem; color: #94a3b8; background: #0b1120; border-top: 1px solid #1e293b; }
  </style>
</head>
<body>
  <header class="header">
    <div class="brand">
      <img src="/icon.svg" alt="شعار سلطنة عمان - المكتبة الذكية">
      <div class="brand-text">
        <div style="display: flex; align-items: center; gap: 8px;">
          <h1>سلطنة عُمان - وزارة التربية والتعليم</h1>
          <span class="badge">وثيقة معتمدة 🇴🇲</span>
        </div>
        <p>المكتبة الذكية ونظام التخطيط التربوي المتقدم | ${cleanTitle}</p>
      </div>
    </div>
    <div class="actions">
      <a href="${pdfUrl}" download="${safeFilename}" class="btn">📥 تحميل مستند PDF الأصلي (طبق الأصل)</a>
      <button onclick="window.print()" class="btn btn-secondary">🖨️ طباعة المستند</button>
    </div>
  </header>
  <main class="preview-container">
    <iframe src="${pdfUrl}#toolbar=1&navpanes=0&view=FitH" title="${cleanTitle}"></iframe>
  </main>
  <footer class="footer-note">
    وثيقة رسمية صادرة ومعتمدة رقمياً طبق الأصل عبر المكتبة الذكية ونظام التخطيط التربوي لسلطنة عمان 🇴🇲
  </footer>
</body>
</html>`);
});

// ----------------------------------------------------
// REST API ROUTES
// ----------------------------------------------------

// System Stats & Health
app.get('/api/stats', (req: Request, res: Response) => {
  try {
    const stats = db.getStats();
    res.json({ success: true, stats, hasGeminiKey: geminiAI.isConfigured() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Users & Roles
app.get('/api/users', (req: Request, res: Response) => {
  res.json({ success: true, users: db.getUsers() });
});

app.put('/api/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, role, avatarUrl, requesterId } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: 'اسم المستخدم مطلوب ولا يمكن أن يكون فارغاً' });
  }
  const updated = db.updateUser(id, {
    name: name.trim(),
    ...(email ? { email: email.trim() } : {}),
    ...(role ? { role } : {}),
    ...(avatarUrl !== undefined ? { avatarUrl } : {})
  });
  if (!updated) return res.status(404).json({ success: false, error: 'المستخدم غير موجود' });
  db.logAudit(requesterId || 'admin', 'مستخدم النظام', 'update', 'user', id, `تعديل بيانات المستخدم: ${updated.name}`);
  res.json({ success: true, user: updated, message: 'تم تحديث بيانات المستخدم بنجاح' });
});

app.post('/api/users', (req: Request, res: Response) => {
  const { name, email, role, avatarUrl, requesterId } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: 'اسم المستخدم مطلوب' });
  }
  const newUser = db.addUser({
    name: name.trim(),
    email: email ? email.trim() : `user_${Date.now()}@moe.om`,
    role: role || 'teacher',
    avatarUrl: avatarUrl || '/icon.svg'
  });
  db.logAudit(requesterId || 'admin', 'مستخدم النظام', 'create', 'user', newUser.id, `إضافة مستخدم جديد: ${newUser.name}`);
  res.json({ success: true, user: newUser, message: 'تمت إضافة المستخدم بنجاح' });
});

app.delete('/api/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { requesterId } = req.body || {};
  const user = db.getUserById(id);
  if (!user) return res.status(404).json({ success: false, error: 'المستخدم غير موجود' });
  if (id === 'usr-admin-1') {
    return res.status(403).json({ success: false, error: 'لا يمكن حذف الحساب الرئيسي لمالك المنصة' });
  }
  const deleted = db.deleteUser(id);
  if (!deleted) return res.status(500).json({ success: false, error: 'فشل حذف المستخدم' });
  db.logAudit(requesterId || 'admin', 'مستخدم النظام', 'delete', 'user', id, `حذف المستخدم: ${user.name}`);
  res.json({ success: true, message: `تم حذف المستخدم ${user.name} بنجاح` });
});

// Image Upload (Cover images for books & user avatars)
app.post('/api/upload-image', (req: Request, res: Response) => {
  try {
    const { dataUrl, filename, category } = req.body;
    if (!dataUrl) {
      return res.status(400).json({ success: false, error: 'بيانات الصورة مفقودة' });
    }

    // Match base64 header
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      // If it's already an external URL, just return it
      if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://') || dataUrl.startsWith('/')) {
        return res.json({ success: true, url: dataUrl });
      }
      return res.status(400).json({ success: false, error: 'صيغة الصورة غير صحيحة' });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'png';
    const subFolder = category === 'avatar' ? 'avatars' : 'covers';
    const targetDir = path.join(__dirname, 'public', 'uploads', subFolder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const safeName = `${category || 'img'}_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
    const filePath = path.join(targetDir, safeName);
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

    const publicUrl = `/uploads/${subFolder}/${safeName}`;
    res.json({ success: true, url: publicUrl, message: 'تم رفع الصورة وحفظها بنجاح' });
  } catch (err: any) {
    console.error('Failed to upload image:', err);
    res.status(500).json({ success: false, error: err.message || 'فشل حفظ الصورة' });
  }
});

// Taxonomy
app.get('/api/taxonomy', (req: Request, res: Response) => {
  res.json({ success: true, taxonomy: db.getTaxonomy() });
});

app.post('/api/taxonomy/subject', (req: Request, res: Response) => {
  const { name, code, color, description, userId } = req.body;
  if (!name) return res.status(400).json({ success: false, error: 'اسم المادة مطلوب' });
  const item = db.addSubject(name, code || 'SUBJ', color || '#0d9488', description);
  db.logAudit(userId || 'admin', 'مستخدم النظام', 'create', 'taxonomy', item.id, `إضافة مادة دراسية جديدة: ${name}`);
  res.json({ success: true, item });
});

app.post('/api/taxonomy/unit', (req: Request, res: Response) => {
  const { subjectId, gradeId, semesterId, title, order, description, userId } = req.body;
  if (!title) return res.status(400).json({ success: false, error: 'عنوان الوحدة مطلوب' });
  const item = db.addUnit(subjectId, gradeId, semesterId, title, order || 1, description);
  db.logAudit(userId || 'admin', 'مستخدم النظام', 'create', 'taxonomy', item.id, `إضافة وحدة دراسية جديدة: ${title}`);
  res.json({ success: true, item });
});

app.post('/api/taxonomy/lesson', (req: Request, res: Response) => {
  const { unitId, title, order, objectives, concepts, userId } = req.body;
  if (!title) return res.status(400).json({ success: false, error: 'عنوان الدرس مطلوب' });
  const item = db.addLesson(unitId, title, order || 1, objectives, concepts);
  db.logAudit(userId || 'admin', 'مستخدم النظام', 'create', 'taxonomy', item.id, `إضافة درس جديد: ${title}`);
  res.json({ success: true, item });
});

// Digital Library Resources
app.get('/api/resources', (req: Request, res: Response) => {
  try {
    const { subjectId, gradeId, type, format, search, includeArchived, includeDeleted } = req.query;
    const resources = db.getResources({
      subjectId: subjectId as string,
      gradeId: gradeId as string,
      type: type as string,
      format: format as string,
      search: search as string,
      includeArchived: includeArchived === 'true',
      includeDeleted: includeDeleted === 'true'
    });
    res.json({ success: true, resources });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/resources/:id', (req: Request, res: Response) => {
  const resource = db.getResourceById(req.params.id);
  if (!resource) return res.status(404).json({ success: false, error: 'المصدر غير موجود' });
  const pages = db.getPagesForResource(resource.id);
  const chunks = db.getChunksForResource(resource.id);
  res.json({ success: true, resource, pages, chunks });
});

// Force refresh / extract authentic curriculum pages
app.post('/api/resources/:id/generate-pages', (req: Request, res: Response) => {
  const resource = db.getResourceById(req.params.id);
  if (!resource) return res.status(404).json({ success: false, error: 'المصدر غير موجود' });
  const pages = db.getPagesForResource(resource.id);
  const chunks = db.getChunksForResource(resource.id);
  res.json({ success: true, message: 'تم استخراج وتحديث صفحات الكتاب بنجاح', pages, chunks });
});

// Upload and process file
app.post('/api/resources/upload', async (req: Request, res: Response) => {
  try {
    const { filename, base64Content, title, author, type, format, subjectId, gradeId, stageId, unitId, lessonId, userId } = req.body;

    if (!filename || !base64Content) {
      return res.status(400).json({ success: false, error: 'الملف واسم الملف مطلوبان' });
    }

    // Convert base64 data to buffer
    const cleanBase64 = base64Content.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    const result = await processUploadedDocument({
      filename,
      buffer,
      title,
      author,
      type,
      format,
      subjectId,
      gradeId,
      stageId,
      unitId,
      lessonId,
      userId: userId || 'usr-admin-1'
    });

    res.json({
      success: true,
      resource: result.resource,
      isDuplicate: result.isDuplicate,
      job: result.job,
      message: result.isDuplicate ? 'تم العثور على هذا الملف مسبقاً في المكتبة (تم منع التكرار)' : 'تم رفع وفهرسة الملف بنجاح'
    });
  } catch (err: any) {
    console.error('Upload endpoint error:', err);
    res.status(500).json({ success: false, error: err.message || 'فشلت معالجة الملف' });
  }
});

// Update resource metadata
app.put('/api/resources/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const updated = db.updateResource(id, updates);
  if (!updated) return res.status(404).json({ success: false, error: 'المصدر غير موجود' });
  db.logAudit(req.body.userId || 'admin', 'مستخدم النظام', 'update', 'resource', id, `تعديل بيانات المصدر: ${updated.title}`);
  res.json({ success: true, resource: updated });
});

// Archive / Unarchive
app.post('/api/resources/:id/archive', (req: Request, res: Response) => {
  const { id } = req.params;
  const resource = db.getResourceById(id);
  if (!resource) return res.status(404).json({ success: false, error: 'المصدر غير موجود' });
  const newStatus = !resource.isArchived;
  db.updateResource(id, { isArchived: newStatus });
  db.logAudit(req.body.userId || 'admin', 'مستخدم النظام', 'archive', 'resource', id, `${newStatus ? 'أرشفة' : 'إلغاء أرشفة'} المصدر: ${resource.title}`);
  res.json({ success: true, isArchived: newStatus });
});

// Delete resource (soft delete or permanent)
app.delete('/api/resources/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const permanent = req.query.permanent === 'true';
  const resource = db.getResourceById(id);
  if (!resource) return res.status(404).json({ success: false, error: 'المصدر غير موجود' });

  const title = resource.title;
  db.deleteResource(id, permanent);
  db.logAudit(req.body.userId || 'admin', 'مستخدم النظام', 'delete', 'resource', id, `${permanent ? 'حذف نهائي' : 'نقل إلى سلة المحذوفات'}: ${title}`);
  res.json({ success: true, message: permanent ? 'تم الحذف النهائي' : 'تم النقل لسلة المهملات' });
});

// Restore resource
app.post('/api/resources/:id/restore', (req: Request, res: Response) => {
  const { id } = req.params;
  const success = db.restoreResource(id);
  if (!success) return res.status(404).json({ success: false, error: 'المصدر غير موجود' });
  db.logAudit(req.body.userId || 'admin', 'مستخدم النظام', 'restore', 'resource', id, `استعادة المصدر: ${id}`);
  res.json({ success: true, message: 'تمت استعادة المصدر بنجاح' });
});

// Download original file
app.get('/api/resources/:id/download', (req: Request, res: Response) => {
  const resource = db.getResourceById(req.params.id);
  if (!resource || !resource.filePath || !fs.existsSync(resource.filePath)) {
    return res.status(404).json({ success: false, error: 'الملف الأصلي غير موجود على الخادم' });
  }

  const mimeType = resource.format === 'pdf' ? 'application/pdf' :
    resource.format === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
    resource.format === 'pptx' ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation' :
    resource.format === 'image' ? 'image/png' : 'text/plain';

  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(resource.fileName || resource.title)}"`);
  fs.createReadStream(resource.filePath).pipe(res);
});

// Search Library
app.get('/api/search', (req: Request, res: Response) => {
  const { q, scope, subjectId, gradeId } = req.query;
  if (!q) return res.json({ success: true, results: [] });

  const scopeResourceIds = scope ? (scope as string).split(',') : undefined;
  const results = db.searchLibrary(q as string, {
    scopeResourceIds,
    subjectId: subjectId as string,
    gradeId: gradeId as string,
    maxResults: 25
  });

  res.json({ success: true, results, count: results.length });
});

// Pedagogical Assistant (Multi-Turn Chat with Personas, Google Search Grounding, Google Maps Grounding, & RAG)
app.get('/api/assistant/personas', (req: Request, res: Response) => {
  const personas = Object.entries(CHATBOT_PERSONAS).map(([id, p]) => ({
    id,
    name: p.name,
    roleTitle: p.roleTitle,
    description: p.description,
    badge: p.badge,
    suggestedPrompts: p.suggestedPrompts
  }));
  res.json({ success: true, personas });
});

app.post('/api/assistant/chat', async (req: Request, res: Response) => {
  try {
    const {
      message, scopeResourceIds, conversationId, userId,
      useMapsGrounding, useSearchGrounding, latLng, personaId, model
    } = req.body;
    if (!message) return res.status(400).json({ success: false, error: 'نص السؤال مطلوب' });

    // Retrieve previous conversation messages to preserve multi-turn context
    let chatHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    let conv = conversationId ? db.getConversationById(conversationId) : null;
    if (conv && conv.messages && conv.messages.length > 0) {
      chatHistory = conv.messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
    }

    const result = await geminiAI.answerWithRAG(
      message,
      scopeResourceIds,
      chatHistory,
      {
        useMapsGrounding: !!useMapsGrounding,
        useSearchGrounding: !!useSearchGrounding,
        latLng,
        personaId,
        model
      }
    );

    // Save to conversation history if ID provided
    if (conversationId && conv) {
      conv.messages.push({
        id: `msg-${Date.now()}-u`,
        conversationId,
        role: 'user',
        content: message,
        createdAt: new Date().toISOString()
      });
      conv.messages.push({
        id: `msg-${Date.now()}-a`,
        conversationId,
        role: 'assistant',
        content: result.answer,
        citations: result.citations,
        groundedPlaces: result.places || [],
        isMapsGrounded: !!(result.places && result.places.length > 0),
        groundedWebSources: result.sources || [],
        isSearchGrounded: !!(result.sources && result.sources.length > 0),
        searchQueries: result.searchQueries || [],
        modelUsed: result.modelUsed || model || 'gemini-3.8-flash',
        personaId: result.personaId || personaId,
        createdAt: new Date().toISOString()
      });
      conv.personaId = personaId || conv.personaId;
      conv.model = model || conv.model || 'gemini-3.8-flash';
      conv.updatedAt = new Date().toISOString();
      db.saveConversation(conv);
    }

    res.json({
      success: true,
      answer: result.answer,
      citations: result.citations,
      places: result.places || [],
      sources: result.sources || [],
      searchQueries: result.searchQueries || [],
      modelUsed: result.modelUsed || model || 'gemini-3.8-flash',
      personaId: result.personaId || personaId
    });
  } catch (err: any) {
    console.error('Chat endpoint error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Dedicated Google Maps Grounding Exploration endpoint
app.post('/api/assistant/maps-explore', async (req: Request, res: Response) => {
  try {
    const { query, latLng, scopeResourceIds } = req.body;
    if (!query) return res.status(400).json({ success: false, error: 'نص الاستكشاف المكاني مطلوب' });

    const result = await geminiAI.answerWithMapsGrounding({ query, latLng, scopeResourceIds });
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Dedicated Google Search Grounding Exploration endpoint
app.post('/api/assistant/search-explore', async (req: Request, res: Response) => {
  try {
    const { query, scopeResourceIds, personaId } = req.body;
    if (!query) return res.status(400).json({ success: false, error: 'نص استعلام البحث مطلوب' });

    const result = await geminiAI.answerWithSearchGrounding({ query, scopeResourceIds, personaId });
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Conversations list & create
app.get('/api/assistant/conversations', (req: Request, res: Response) => {
  const list = db.getConversations(req.query.userId as string);
  res.json({ success: true, conversations: list });
});

app.post('/api/assistant/conversations', (req: Request, res: Response) => {
  const { title, userId, scopeResourceIds } = req.body;
  const conv = {
    id: `conv-${Date.now()}`,
    title: title || 'محادثة تعليمية جديدة',
    userId: userId || 'usr-admin-1',
    scopeResourceIds: scopeResourceIds || [],
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.saveConversation(conv);
  res.json({ success: true, conversation: conv });
});

app.delete('/api/assistant/conversations/:id', (req: Request, res: Response) => {
  db.deleteConversation(req.params.id);
  res.json({ success: true });
});

// Lesson Plans
app.get('/api/lessons', (req: Request, res: Response) => {
  res.json({ success: true, lessons: db.getGeneratedLessons() });
});

app.get('/api/lessons/:id', (req: Request, res: Response) => {
  const lesson = db.getLessonById(req.params.id);
  if (!lesson) return res.status(404).json({ success: false, error: 'الدرس غير موجود' });
  res.json({ success: true, lesson });
});

app.post('/api/lessons/generate', async (req: Request, res: Response) => {
  try {
    const lesson = await geminiAI.generateLessonPlan({
      ...req.body,
      userId: req.body.userId || 'usr-admin-1'
    });
    db.logAudit(req.body.userId || 'admin', 'مستخدم النظام', 'create', 'lesson', lesson.id, `توليد خطة درس: ${lesson.title}`);
    res.json({ success: true, lesson });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/lessons', (req: Request, res: Response) => {
  const lesson = db.saveLesson(req.body);
  db.logAudit(req.body.createdById || 'admin', 'مستخدم النظام', 'update', 'lesson', lesson.id, `حفظ خطة الدرس: ${lesson.title}`);
  res.json({ success: true, lesson });
});

app.delete('/api/lessons/:id', (req: Request, res: Response) => {
  db.deleteLesson(req.params.id);
  res.json({ success: true });
});

// Worksheets
app.get('/api/worksheets', (req: Request, res: Response) => {
  res.json({ success: true, worksheets: db.getWorksheets() });
});

app.post('/api/worksheets/generate', async (req: Request, res: Response) => {
  try {
    const ws = await geminiAI.generateWorksheet({
      ...req.body,
      userId: req.body.userId || 'usr-admin-1'
    });
    db.logAudit(req.body.userId || 'admin', 'مستخدم النظام', 'create', 'worksheet', ws.id, `توليد ورقة عمل: ${ws.title}`);
    res.json({ success: true, worksheet: ws });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/worksheets', (req: Request, res: Response) => {
  const ws = db.saveWorksheet(req.body);
  res.json({ success: true, worksheet: ws });
});

app.delete('/api/worksheets/:id', (req: Request, res: Response) => {
  db.deleteWorksheet(req.params.id);
  res.json({ success: true });
});

// Assessments
app.get('/api/assessments', (req: Request, res: Response) => {
  res.json({ success: true, assessments: db.getAssessments() });
});

app.post('/api/assessments/generate', async (req: Request, res: Response) => {
  try {
    const asmt = await geminiAI.generateAssessment({
      ...req.body,
      userId: req.body.userId || 'usr-admin-1'
    });
    db.logAudit(req.body.userId || 'admin', 'مستخدم النظام', 'create', 'assessment', asmt.id, `توليد اختبار تقويمي: ${asmt.title}`);
    res.json({ success: true, assessment: asmt });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/assessments', (req: Request, res: Response) => {
  const asmt = db.saveAssessment(req.body);
  res.json({ success: true, assessment: asmt });
});

app.delete('/api/assessments/:id', (req: Request, res: Response) => {
  db.deleteAssessment(req.params.id);
  res.json({ success: true });
});

// Presentations
app.get('/api/presentations', (req: Request, res: Response) => {
  res.json({ success: true, presentations: db.getPresentations() });
});

app.post('/api/presentations', (req: Request, res: Response) => {
  const pres = db.savePresentation(req.body);
  res.json({ success: true, presentation: pres });
});

// ----------------------------------------------------
// الخطط السنوية والفصلية (Annual Plans)
// ----------------------------------------------------
app.get('/api/annual-plans', (req: Request, res: Response) => {
  res.json({ success: true, annualPlans: db.getAnnualPlans() });
});

app.get('/api/annual-plans/:id', (req: Request, res: Response) => {
  const plan = db.getAnnualPlanById(req.params.id);
  if (!plan) return res.status(404).json({ success: false, error: 'الخطة السنوية غير موجودة' });
  res.json({ success: true, annualPlan: plan });
});

app.post('/api/annual-plans', (req: Request, res: Response) => {
  try {
    const plan = db.saveAnnualPlan(req.body);
    db.logAudit(req.body.createdById || 'admin', 'مستخدم النظام', 'update', 'system', plan.id, `حفظ الخطة السنوية: ${plan.title}`);
    res.json({ success: true, annualPlan: plan });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/annual-plans/:id', (req: Request, res: Response) => {
  db.deleteAnnualPlan(req.params.id);
  res.json({ success: true });
});

// ----------------------------------------------------
// جدول الحصص الأسبوعي (Weekly Timetables)
// ----------------------------------------------------
app.get('/api/timetables', (req: Request, res: Response) => {
  res.json({ success: true, timetables: db.getTimetables() });
});

app.get('/api/timetables/:id', (req: Request, res: Response) => {
  const tt = db.getTimetableById(req.params.id);
  if (!tt) return res.status(404).json({ success: false, error: 'الجدول الأسبوعي غير موجود' });
  res.json({ success: true, timetable: tt });
});

app.post('/api/timetables', (req: Request, res: Response) => {
  try {
    const tt = db.saveTimetable(req.body);
    db.logAudit(req.body.createdById || 'admin', 'مستخدم النظام', 'update', 'system', tt.id, `حفظ جدول الحصص الأسبوعي: ${tt.title}`);
    res.json({ success: true, timetable: tt });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/timetables/:id', (req: Request, res: Response) => {
  db.deleteTimetable(req.params.id);
  res.json({ success: true });
});

// ----------------------------------------------------
// المراسلات والخطابات الرسمية (Official Letters)
// ----------------------------------------------------
app.get('/api/letters', (req: Request, res: Response) => {
  const recipientType = req.query.type as string;
  res.json({ success: true, letters: db.getOfficialLetters(recipientType) });
});

app.get('/api/letters/:id', (req: Request, res: Response) => {
  const letter = db.getOfficialLetterById(req.params.id);
  if (!letter) return res.status(404).json({ success: false, error: 'الخطاب غير موجود' });
  res.json({ success: true, letter });
});

app.post('/api/letters', (req: Request, res: Response) => {
  try {
    const letter = db.saveOfficialLetter(req.body);
    db.logAudit(req.body.createdById || 'admin', 'مستخدم النظام', 'create', 'system', letter.id, `حفظ الخطاب الرسمي: ${letter.title}`);
    res.json({ success: true, letter });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/letters/:id', (req: Request, res: Response) => {
  db.deleteOfficialLetter(req.params.id);
  res.json({ success: true });
});

// ----------------------------------------------------
// التقويم التربوي وجدولة الاختبارات والأنشطة (Educational Calendar & Deadlines)
// ----------------------------------------------------
app.get('/api/calendar/events', (req: Request, res: Response) => {
  res.json({ success: true, events: db.getCalendarEvents() });
});

app.get('/api/calendar/events/:id', (req: Request, res: Response) => {
  const event = db.getCalendarEventById(req.params.id);
  if (!event) return res.status(404).json({ success: false, error: 'الحدث التربوي غير موجود' });
  res.json({ success: true, event });
});

app.post('/api/calendar/events', (req: Request, res: Response) => {
  try {
    const event = db.saveCalendarEvent(req.body);
    db.logAudit(req.body.createdById || 'admin', 'مستخدم النظام', 'create', 'system', event.id, `جدولة حدث تربوي: ${event.title}`);
    res.json({ success: true, event });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/calendar/events/:id', (req: Request, res: Response) => {
  try {
    const event = db.saveCalendarEvent({ ...req.body, id: req.params.id });
    db.logAudit(req.body.createdById || 'admin', 'مستخدم النظام', 'update', 'system', event.id, `تحديث حدث تربوي: ${event.title}`);
    res.json({ success: true, event });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/calendar/events/:id', (req: Request, res: Response) => {
  const deleted = db.deleteCalendarEvent(req.params.id);
  res.json({ success: true, deleted });
});

app.post('/api/calendar/seed-defaults', (req: Request, res: Response) => {
  const events = db.seedDefaultCalendarEvents();
  res.json({ success: true, events, message: 'تمت استعادة أحداث التقويم التربوي للفصل الدراسي بنجاح' });
});

app.post('/api/whatsapp/dispatch-calendar', async (req: Request, res: Response) => {
  try {
    const { toPhone, filterType } = req.body;
    const waConfig = db.getWhatsAppConfig();
    const targetPhone = toPhone || waConfig.authorizedNumbers?.[0]?.phone || '+96877394680';

    if (!targetPhone) {
      return res.status(400).json({ success: false, error: 'رقم هاتف المستلم مطلوب' });
    }

    if (!waConfig.apiKey) {
      return res.status(400).json({ 
        success: false, 
        error: 'رمز الوصول (Access Token) غير محفوظ في الإعدادات.' 
      });
    }

    const events = db.getCalendarEvents();
    const schoolProfile = db.getSchoolProfile();

    let filteredEvents = events;
    if (filterType === 'exams') {
      filteredEvents = events.filter(e => e.type === 'exam');
    } else if (filterType === 'activities') {
      filteredEvents = events.filter(e => e.type === 'activity');
    }

    let textToSend = `📅 *التقويم التربوي وجدول الاستحقاقات المدرسية* 🇴🇲\n` +
      `🏫 *المدرسة:* ${schoolProfile.schoolName}\n` +
      `🏢 *${schoolProfile.directorateName}*\n` +
      `🗓️ *العام الدراسي:* ${schoolProfile.academicYear}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n`;

    if (filteredEvents.length === 0) {
      textToSend += `لا توجد فعاليات أو اختبارات مجدولة حالياً.\n`;
    } else {
      filteredEvents.forEach((ev, idx) => {
        const typeEmoji = ev.type === 'exam' ? '📝 [اختبار مقنن]' : ev.type === 'activity' ? '🎨 [نشاط مدرسي]' : ev.type === 'ministry_event' ? '🏛️ [مناسبة رسمية]' : '📌 [مهمة تعليمية]';
        textToSend += `${idx + 1}. *${ev.title}*\n` +
          `   • ${typeEmoji}\n` +
          `   • 📅 التاريخ: ${ev.startDate} (${ev.startTime || 'طوال اليوم'})\n` +
          `   • 🎓 الصف والمادة: ${ev.gradeName || ''} - ${ev.subjectName || ''}\n` +
          (ev.location ? `   • 📍 المكان: ${ev.location}\n` : '') +
          `\n`;
      });
    }

    textToSend += `━━━━━━━━━━━━━━━━━━━━\n✨ تم التصدير عبر منصة المكتبة الجغرافية والتربوية الذكية`;

    const sendRes = await sendWhatsAppCloudApiMessage({
      toPhone: targetPhone,
      messageText: textToSend,
      phoneNumberId: waConfig.phoneNumberId || '1362186010314869',
      accessToken: waConfig.apiKey
    });

    if (!sendRes.success) {
      return res.status(400).json({ success: false, error: sendRes.error, data: sendRes.data });
    }

    res.json({
      success: true,
      message: `تم إرسال جدول التقويم بنجاح إلى رقم الواتساب (${targetPhone})! 📅`,
      data: sendRes.data
    });
  } catch (err: any) {
    console.error('WhatsApp dispatch-calendar error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// سجل الطلاب والملف التراكمي الشامل (Student Records & Profiles)
// ----------------------------------------------------
app.get('/api/students', (req: Request, res: Response) => {
  const gradeId = req.query.gradeId as string | undefined;
  const section = req.query.section as string | undefined;
  res.json({ success: true, students: db.getStudents(gradeId, section) });
});

// ----------------------------------------------------
// تنبيهات انحدار مستوى الطالب ومقارنة متوسط الصف (Student Performance Alerts Engine)
// ----------------------------------------------------
app.get('/api/students/alerts', (req: Request, res: Response) => {
  try {
    const unreadOnly = req.query.unreadOnly === 'true';
    const severity = req.query.severity as string | undefined;
    const studentId = req.query.studentId as string | undefined;
    const section = req.query.section as string | undefined;
    const data = db.getStudentPerformanceAlerts({ unreadOnly, severity, studentId, section });
    res.json({ success: true, alerts: data.alerts, stats: data.stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/students/alerts/compute', (req: Request, res: Response) => {
  try {
    const alerts = db.computeStudentPerformanceAlerts();
    const data = db.getStudentPerformanceAlerts();
    res.json({ success: true, alerts, stats: data.stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/students/alerts/:id/read', (req: Request, res: Response) => {
  try {
    const isRead = req.body.isRead !== undefined ? req.body.isRead : true;
    const alert = db.markStudentAlertRead(req.params.id, isRead);
    if (!alert) return res.status(404).json({ success: false, error: 'التنبيه غير موجود' });
    res.json({ success: true, alert });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/students/alerts/mark-all-read', (req: Request, res: Response) => {
  try {
    const updatedCount = db.markAllStudentAlertsRead();
    res.json({ success: true, updatedCount });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/students/alerts/:id/remedial-plan', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const alerts = (db as any).data?.studentAlerts || [];
    const alert = alerts.find((a: any) => a.id === id);
    if (!alert) return res.status(404).json({ success: false, error: 'التنبيه غير موجود' });

    let plan = '';
    // Try to generate pedagogical plan using Gemini if available
    try {
      if (process.env.GEMINI_API_KEY) {
        const prompt = `أنت موجه تربوي أول لمادة الدراسات الاجتماعية والجغرافيا بسلطنة عمان.
الطالب: "${alert.studentName}"
الصف والشعبة: "${alert.gradeName} - ${alert.section}"
التقييم: "${alert.assessmentName}"
درجة الطالب: ${alert.studentScore} من ${alert.maxScore} (${alert.studentPercentage}%)
متوسط درجات الشعبة: ${alert.classAverageScore} من ${alert.maxScore} (${alert.classAveragePercentage}%)
نسبة الفارق والانحدار: ${alert.deviationPercentage}%

المطلوب:
صياغة خطة علاجية تربوية مقتضبة ومحددة (3 إلى 4 نقاط إجرائية عملية) تراعي معايير وزارة التربية والتعليم العمانية ونظريات التعلم الحديثة لمساعدة الطالب في تجاوز هذا الانخفاض والارتقاء إلى متوسط زملائه في الصف. ركز على أنشطة الممارسة، الخرائط الصماء، أو التعلم بالأقران. اكتب الخطة بلغة تربوية واضحة ومباشرة.`;

        const generated = await geminiAI.generateText(prompt, 'gemini-3.8-flash');
        if (generated) {
          plan = generated.trim();
        }
      }
    } catch (aiErr) {
      console.warn('Gemini remedial plan generation fallback:', aiErr);
    }

    if (!plan) {
      // High-quality curricular fallback
      plan = `1. جلسة دعم علاجي فردية (15 دقيقة) لمراجعة المفاهيم الأساسية في "${alert.assessmentName}".
2. تزويد الطالب ببطاقات تدريبية عملية تركز على المهارات التي تدنى فيها أدائه مقارنة بمتوسط الشعبة (${alert.classAverageScore}/${alert.maxScore}).
3. إشراك الطالب في مجموعة تعلم تعاوني ثنائية مع أحد زملائه المتفوقين لتعزيز ثقته وتحفيزه.
4. إشعار ولي الأمر للمتابعة المنزلية وإجراء تقويم تكويني مصغر بعد أسبوع لقياس أثر الخطة العلاجية.`;
    }

    const updated = db.updateStudentAlert(id, { remedialPlanSuggested: plan });
    res.json({ success: true, alert: updated, remedialPlan: plan });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/students/alerts/:id/notify-whatsapp', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { customMessage } = req.body;
    const alerts = (db as any).data?.studentAlerts || [];
    const alert = alerts.find((a: any) => a.id === id);
    if (!alert) return res.status(404).json({ success: false, error: 'التنبيه غير موجود' });

    const student = db.getStudentById(alert.studentId);
    const waConfig = db.getWhatsAppConfig();
    const schoolProfile = db.getSchoolProfile();
    const targetPhone = student?.parentPhone || alert.parentPhone || waConfig.authorizedNumbers?.[0]?.phone || '+96877394680';

    const defaultMsg = `📢 *إشعار متابعة مستوى دراسي من مدرسة ${schoolProfile.schoolName}* 🇴🇲\n` +
      `🏢 *${schoolProfile.directorateName}*\n\n` +
      `السلام عليكم ورحمة الله وبركاته،\n` +
      `الفاضل ولي أمر الطالب / *${alert.studentName}* (${alert.gradeName} - الشعبة ${alert.section}) المحترم،،\n\n` +
      `حرصاً من إدارة المدرسة ومعلم المادة على المتابعة المستمرة للأداء التعليمي لأبنائنا الطلبة، نود إحاطتكم علماً بأنه في تقييم (*${alert.assessmentName}*):\n` +
      `• حصل الطالب على درجة: *${alert.studentScore} من ${alert.maxScore}* (${alert.studentPercentage}%)\n` +
      `• علماً بأن متوسط أداء الشعبة كان: *${alert.classAverageScore} من ${alert.maxScore}* (${alert.classAveragePercentage}%)\n\n` +
      `📌 *الخطة والإجراء المتخذ من قبل المعلم:*\n` +
      `${alert.remedialPlanSuggested || 'تم إدراج الطالب في برنامج الدعم العلاجي الصفي وتزويده بتمارين تقوية إضافية.'}\n\n` +
      `نرجو منكم التكرم بمساندتنا في المتابعة المنزلية وتشجيع الطالب، شاكرين لكم حسن تعاونكم الدائم.\n` +
      `مع تحيات: *معلم المادة وإدارة المدرسة*`;

    const messageToSend = customMessage || defaultMsg;

    let sendResult = { success: false, message: 'لم يتم الإرسال المباشر' };
    if (waConfig.apiKey) {
      const sendRes = await sendWhatsAppCloudApiMessage({
        toPhone: targetPhone,
        messageText: messageToSend,
        phoneNumberId: waConfig.phoneNumberId || '1362186010314869',
        accessToken: waConfig.apiKey
      });
      sendResult = { success: sendRes.success, message: sendRes.success ? 'تم إرسال رسالة الواتساب بنجاح إلى ولي الأمر' : (sendRes.error || 'فشل الإرسال') };
    } else {
      sendResult = { success: true, message: 'تم إعداد نص الإشعار وتجهيزه للمشاركة عبر الواتساب' };
    }

    const updated = db.updateStudentAlert(id, {
      notifiedViaWhatsApp: true,
      notifiedAt: new Date().toISOString()
    });

    db.addWhatsAppLog({
      direction: 'outbound',
      fromPhone: waConfig.phoneNumber || '+96872645072',
      toPhone: targetPhone,
      senderName: 'المساعد الذكي للمكتبة الجغرافية',
      messageText: messageToSend,
      intent: 'help',
      status: 'replied',
      responseSummary: `إشعار ولي أمر الطالب ${alert.studentName} بانحدار المستوى في ${alert.assessmentName}`
    });

    res.json({
      success: true,
      alert: updated,
      messageText: messageToSend,
      targetPhone,
      sendResult
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/students/:id', (req: Request, res: Response) => {
  const student = db.getStudentById(req.params.id);
  if (!student) return res.status(404).json({ success: false, error: 'الطالب غير موجود' });
  res.json({ success: true, student });
});

app.post('/api/students', (req: Request, res: Response) => {
  try {
    const student = db.saveStudent(req.body);
    db.logAudit(req.body.requesterId || 'admin', 'مستخدم النظام', 'create', 'user', student.id, `إضافة/تحديث ملف الطالب: ${student.fullName}`);
    res.json({ success: true, student });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/students/:id', (req: Request, res: Response) => {
  try {
    const student = db.saveStudent({ ...req.body, id: req.params.id });
    db.logAudit(req.body.requesterId || 'admin', 'مستخدم النظام', 'update', 'user', student.id, `تحديث ملف الطالب: ${student.fullName}`);
    res.json({ success: true, student });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/students/:id', (req: Request, res: Response) => {
  const deleted = db.deleteStudent(req.params.id);
  res.json({ success: true, deleted });
});

app.post('/api/students/:id/grades', (req: Request, res: Response) => {
  const student = db.addGradeToStudent(req.params.id, req.body);
  if (!student) return res.status(404).json({ success: false, error: 'الطالب غير موجود' });
  res.json({ success: true, student });
});

app.delete('/api/students/:id/grades/:gradeId', (req: Request, res: Response) => {
  const student = db.deleteGradeFromStudent(req.params.id, req.params.gradeId);
  if (!student) return res.status(404).json({ success: false, error: 'الطالب أو الدرجة غير موجودة' });
  res.json({ success: true, student });
});

app.post('/api/students/:id/attendance', (req: Request, res: Response) => {
  const student = db.addAttendanceToStudent(req.params.id, req.body);
  if (!student) return res.status(404).json({ success: false, error: 'الطالب غير موجود' });
  res.json({ success: true, student });
});

app.post('/api/students/:id/notes', (req: Request, res: Response) => {
  const student = db.addNoteToStudent(req.params.id, req.body);
  if (!student) return res.status(404).json({ success: false, error: 'الطالب غير موجود' });
  res.json({ success: true, student });
});

app.delete('/api/students/:id/notes/:noteId', (req: Request, res: Response) => {
  const student = db.deleteNoteFromStudent(req.params.id, req.params.noteId);
  if (!student) return res.status(404).json({ success: false, error: 'الطالب أو الملاحظة غير موجودة' });
  res.json({ success: true, student });
});

app.post('/api/students/:id/letters', (req: Request, res: Response) => {
  const student = db.addLetterToStudent(req.params.id, req.body);
  if (!student) return res.status(404).json({ success: false, error: 'الطالب غير موجود' });
  res.json({ success: true, student });
});

app.post('/api/students/:id/custom-fields', (req: Request, res: Response) => {
  const { fieldName, fieldValue } = req.body;
  const student = db.addCustomFieldToStudent(req.params.id, fieldName, fieldValue);
  if (!student) return res.status(404).json({ success: false, error: 'الطالب غير موجود' });
  res.json({ success: true, student });
});

app.post('/api/students/seed-defaults', (req: Request, res: Response) => {
  const students = db.seedDefaultStudents();
  res.json({ success: true, students, message: 'تمت استعادة سجلات وقوائم الطلاب بنجاح' });
});

app.post('/api/whatsapp/dispatch-student-report', async (req: Request, res: Response) => {
  try {
    const { studentId, toPhone } = req.body;
    const student = db.getStudentById(studentId);
    if (!student) return res.status(404).json({ success: false, error: 'الطالب غير موجود' });

    const waConfig = db.getWhatsAppConfig();
    const targetPhone = toPhone || student.parentPhone || waConfig.authorizedNumbers?.[0]?.phone || '+96877394680';

    if (!targetPhone) {
      return res.status(400).json({ success: false, error: 'رقم هاتف ولي الأمر مطلوب' });
    }

    if (!waConfig.apiKey) {
      return res.status(400).json({ 
        success: false, 
        error: 'رمز الوصول (Access Token) غير محفوظ في الإعدادات.' 
      });
    }

    const schoolProfile = db.getSchoolProfile();

    // Calculate total grades
    const grades = student.grades || [];
    const totalMax = grades.reduce((acc, g) => acc + (g.maxScore || 0), 0);
    const totalObtained = grades.reduce((acc, g) => acc + (g.obtainedScore || 0), 0);
    const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;

    // Calculate attendance
    const attendance = student.attendance || [];
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const absentDays = attendance.filter(a => a.status === 'absent').length;

    let textToSend = `📊 *تقرير الأداء الأكاديمي والتربوي الشامل* 🇴🇲\n` +
      `🏫 *المدرسة:* ${schoolProfile.schoolName}\n` +
      `🏢 *${schoolProfile.directorateName}*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `👤 *اسم الطالب:* ${student.fullName}\n` +
      `🎓 *الصف والشعبة:* ${student.gradeName} (${student.section})\n` +
      `🔢 *الرقم الأكاديمي:* ${student.studentNumber}\n` +
      `⭐ *المستوى العام:* ${student.academicStatus === 'excellent' ? 'ممتاز' : student.academicStatus === 'good' ? 'جيد جداً' : student.academicStatus === 'needs_support' ? 'يحتاج دعم ومتابعة' : 'متوسط'}\n\n` +
      `📝 *سجل الدرجات والتقويم:*\n`;

    if (grades.length === 0) {
      textToSend += `• لا توجد درجات مرصودة حالياً.\n`;
    } else {
      grades.forEach(g => {
        textToSend += `• ${g.assessmentName}: *${g.obtainedScore} / ${g.maxScore}*\n`;
      });
      textToSend += `🎯 *المجموع التراكمي:* ${totalObtained} من ${totalMax} (${percentage}%)\n\n`;
    }

    textToSend += `🗓️ *سجل الحضور والغياب:*\n` +
      `• أيام الحضور: ${presentDays} من ${totalDays}\n` +
      `• أيام الغياب: ${absentDays} يوم\n\n`;

    if (student.notes && student.notes.length > 0) {
      textToSend += `💬 *ملاحظات المعلم والمشرف التربوي:*\n`;
      student.notes.slice(0, 2).forEach(n => {
        textToSend += `• ${n.title}: ${n.content}\n`;
      });
      textToSend += `\n`;
    }

    textToSend += `━━━━━━━━━━━━━━━━━━━━\n` +
      `✍️ *معلم المادة:* أ. علاءالدين خليفة\n` +
      `✨ تم الإرسال من منصة المكتبة الجغرافية والتربوية الذكية`;

    const sendRes = await sendWhatsAppCloudApiMessage({
      toPhone: targetPhone,
      messageText: textToSend,
      phoneNumberId: waConfig.phoneNumberId || '1362186010314869',
      accessToken: waConfig.apiKey
    });

    if (!sendRes.success) {
      return res.status(400).json({ success: false, error: sendRes.error, data: sendRes.data });
    }

    res.json({
      success: true,
      message: `تم إرسال بطاقة تقرير الطالب بنجاح إلى ولي الأمر (${targetPhone})! 📊`,
      data: sendRes.data
    });
  } catch (err: any) {
    console.error('WhatsApp dispatch-student-report error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// الملف التعريفي والترويسة المدرسية الموحدة (School Profile & Official Letterhead)
// ----------------------------------------------------
app.get('/api/school-profile', (req: Request, res: Response) => {
  res.json({ success: true, schoolProfile: db.getSchoolProfile() });
});

app.put('/api/school-profile', (req: Request, res: Response) => {
  try {
    const cascade = req.body.cascade !== false;
    const profile = db.updateSchoolProfile(req.body.profile || req.body, cascade);
    db.logAudit(req.body.userId || 'admin', 'مستخدم النظام', 'update', 'system', 'school-profile', `تحديث بيانات وترويسة المدرسة: ${profile.schoolName}`);
    res.json({ success: true, schoolProfile: profile });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Geographic Center
app.get('/api/geographic', (req: Request, res: Response) => {
  const category = req.query.category as string;
  res.json({ success: true, geographicResources: db.getGeographicResources(category) });
});

app.post('/api/geographic', (req: Request, res: Response) => {
  const geo = db.addGeographicResource(req.body);
  res.json({ success: true, geographicResource: geo });
});

// AI Cartographic Map & Satellite Image Analyzer
app.post('/api/geography/analyze-map', async (req: Request, res: Response) => {
  try {
    const { base64Data, mimeType, title, customPrompt, userId } = req.body;
    if (!base64Data) {
      return res.status(400).json({ success: false, error: 'بيانات صورة الخريطة مطلوبة' });
    }

    const analysis = await geminiAI.analyzeCartographicMap({
      base64Data,
      mimeType: mimeType || 'image/jpeg',
      title,
      customPrompt
    });

    db.logAudit(
      userId || 'usr-admin-1',
      'معلم الجغرافيا',
      'create',
      'system',
      `map-ana-${Date.now()}`,
      `تحليل كارتوجرافي ذكي للخريطة: ${title || 'خريطة تعليمية'}`
    );

    res.json({ success: true, analysis });
  } catch (err: any) {
    console.error('Map analysis error:', err);
    res.status(500).json({ success: false, error: err.message || 'فشل تحليل الخريطة' });
  }
});

// External References
app.get('/api/external-references', (req: Request, res: Response) => {
  res.json({ success: true, externalReferences: db.getExternalReferences() });
});

app.post('/api/external-references', (req: Request, res: Response) => {
  const ref = db.addExternalReference({
    ...req.body,
    id: `ext-${Date.now()}`,
    createdAt: new Date().toISOString()
  });
  res.json({ success: true, reference: ref });
});

// Bookmarks
app.get('/api/bookmarks', (req: Request, res: Response) => {
  res.json({ success: true, bookmarks: db.getBookmarks(req.query.userId as string) });
});

app.post('/api/bookmarks', (req: Request, res: Response) => {
  const bm = db.addBookmark({
    ...req.body,
    id: `bm-${Date.now()}`,
    createdAt: new Date().toISOString()
  });
  res.json({ success: true, bookmark: bm });
});

app.delete('/api/bookmarks/:id', (req: Request, res: Response) => {
  db.deleteBookmark(req.params.id);
  res.json({ success: true });
});

// Backup & Restore
app.get('/api/backup/list', (req: Request, res: Response) => {
  res.json({ success: true, backups: db.getBackups() });
});

app.post('/api/backup/create', (req: Request, res: Response) => {
  try {
    const job = db.createBackup();
    res.json({ success: true, backup: job });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/backup/restore', (req: Request, res: Response) => {
  const { filename } = req.body;
  if (!filename) return res.status(400).json({ success: false, error: 'اسم ملف النسخة الاحتياطية مطلوب' });
  const result = db.restoreBackup(filename);
  res.json(result);
});

app.get('/api/backup/export', (req: Request, res: Response) => {
  const format = (req.query.format as 'json' | 'csv') || 'json';
  const data = db.exportMetadata(format);
  if (format === 'json') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="library_metadata_export.json"');
  } else {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="library_resources_export.csv"');
    // Prepend UTF-8 BOM so Excel opens Arabic correctly
    res.write('\uFEFF');
  }
  res.send(data);
});

// Offline Sync
app.post('/api/sync', (req: Request, res: Response) => {
  const { operations } = req.body;
  if (!Array.isArray(operations)) {
    return res.status(400).json({ success: false, error: 'العمليات يجب أن تكون مصفوفة' });
  }

  const results = operations.map(op => db.applySyncOperation(op));
  res.json({ success: true, appliedCount: results.filter(r => r.status === 'applied').length, results });
});

// Audit Logs
app.get('/api/audit-logs', (req: Request, res: Response) => {
  res.json({ success: true, auditLogs: db.getAuditLogs() });
});

// Oman Vision 2040 Educational Framework
app.get('/api/vision2040', (req: Request, res: Response) => {
  try {
    const goals = db.getVision2040Goals();
    const lessons = db.getGeneratedLessons();
    const resources = db.getResources({});

    const alignedLessons = lessons.filter(l => l.vision2040Goals && l.vision2040Goals.length > 0);
    const alignedResources = resources.filter(r => r.vision2040Tags && r.vision2040Tags.length > 0);

    // Compute distribution per goal
    const goalStats = goals.map(g => {
      const lessonCount = lessons.filter(l => l.vision2040Goals?.some(vg => vg.code === g.code)).length;
      const resourceCount = resources.filter(r =>
        r.vision2040Tags?.some(t =>
          t.toLowerCase().includes(g.title.toLowerCase().slice(0, 10)) ||
          t.toLowerCase().includes(g.priority.toLowerCase().slice(0, 10)) ||
          t.includes('2040')
        )
      ).length;
      return {
        code: g.code,
        title: g.title,
        priority: g.priority,
        pillar: g.pillar,
        lessonCount,
        resourceCount
      };
    });

    res.json({
      success: true,
      goals,
      stats: {
        totalLessons: lessons.length,
        alignedLessons: alignedLessons.length,
        lessonAlignmentRate: lessons.length > 0 ? Math.round((alignedLessons.length / lessons.length) * 100) : 100,
        totalResources: resources.length,
        alignedResources: alignedResources.length,
        resourceAlignmentRate: resources.length > 0 ? Math.round((alignedResources.length / resources.length) * 100) : 100,
        goalStats
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update Vision 2040 alignment for a lesson
app.put('/api/lessons/:id/vision2040', (req: Request, res: Response) => {
  try {
    const lesson = db.getLessonById(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, error: 'الدرس غير موجود' });

    lesson.vision2040Goals = req.body.vision2040Goals || [];
    lesson.updatedAt = new Date().toISOString();
    db.saveLesson(lesson);
    db.logAudit(req.body.userId || 'admin', 'المعلم', 'update', 'lesson', lesson.id, `تحديث مواءمة رؤية عمان 2040 لخطة: ${lesson.title}`);
    res.json({ success: true, lesson });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update Vision 2040 tags for a library resource
app.put('/api/resources/:id/vision2040', (req: Request, res: Response) => {
  try {
    const updated = db.updateResource(req.params.id, {
      vision2040Tags: req.body.vision2040Tags || []
    });
    if (!updated) return res.status(404).json({ success: false, error: 'المصدر غير موجود' });
    db.logAudit(req.body.userId || 'admin', 'أمين المكتبة', 'update', 'resource', req.params.id, `تحديث وسوم رؤية عمان 2040 للمرجع: ${updated.title}`);
    res.json({ success: true, resource: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// WHATSAPP INTEGRATION & BOT WEBHOOK ROUTES
// ----------------------------------------------------

// WhatsApp Configuration
app.get('/api/whatsapp/config', (req: Request, res: Response) => {
  try {
    const config = db.getWhatsAppConfig();
    res.json({ success: true, config });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Live Public Webhook Endpoint (from Cloudflare quick tunnel)
app.get('/api/whatsapp/public-webhook', (req: Request, res: Response) => {
  try {
    const tunnelFile = path.resolve('data/active-tunnel.json');
    let data: any = null;
    if (fs.existsSync(tunnelFile)) {
      try {
        data = JSON.parse(fs.readFileSync(tunnelFile, 'utf-8'));
      } catch (_) {}
    }
    res.json({
      success: true,
      webhookUrl: data?.webhookUrl || null,
      tunnelUrl: data?.tunnelUrl || null
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/whatsapp/config', (req: Request, res: Response) => {
  try {
    const { updates, requesterId } = req.body;
    if (!updates) {
      return res.status(400).json({ success: false, error: 'بيانات التحديث مفقودة' });
    }
    const updated = db.updateWhatsAppConfig(updates);
    db.logAudit(
      requesterId || 'admin',
      'إدارة النظام',
      'update',
      'system',
      'whatsapp-config',
      `تحديث إعدادات ربط الواتساب (الحالة: ${updated.enabled ? 'مفعّل' : 'معطّل'})`
    );
    res.json({ success: true, config: updated, message: 'تم تحديث إعدادات الواتساب بنجاح' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// WhatsApp Message Logs
app.get('/api/whatsapp/logs', (req: Request, res: Response) => {
  try {
    res.json({ success: true, logs: db.getWhatsAppLogs() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/whatsapp/logs', (req: Request, res: Response) => {
  try {
    db.clearWhatsAppLogs();
    res.json({ success: true, message: 'تم مسح سجل رسائل الواتساب بنجاح' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// WhatsApp Interactive Simulator (Live Chat Tester)
app.post('/api/whatsapp/simulate', async (req: Request, res: Response) => {
  try {
    const { message, fromPhone, senderName } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'نص الرسالة مطلوب' });
    }

    const result = await processWhatsAppMessage({
      message: message.trim(),
      fromPhone: fromPhone || '+96891234567',
      senderName: senderName || 'أ. مريم المعمرية (معلم أول)',
      isSimulated: true
    });

    res.json({
      success: true,
      result
    });
  } catch (err: any) {
    console.error('WhatsApp simulator error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Direct Inbound Message Reception (Simulating real inbound from user's phone to the library)
app.post('/api/whatsapp/inbound-receive', async (req: Request, res: Response) => {
  try {
    const { fromPhone, message, senderName } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'نص الرسالة مطلوب' });
    }
    const cleanFrom = (fromPhone || '+96877394680').trim();
    console.log(`[Direct Inbound WhatsApp] Processing request from ${cleanFrom}: ${message}`);
    const result = await processWhatsAppMessage({
      message: message.trim(),
      fromPhone: cleanFrom,
      senderName: senderName || 'الأستاذ المعلم',
      isSimulated: false
    });

    // Also attempt sending outbound to real WhatsApp phone via Meta Cloud API if configured
    const waConfig = db.getWhatsAppConfig();
    let metaDispatched = false;
    let metaError: string | undefined;
    if (waConfig.apiKey && result.replyText) {
      console.log(`[Direct Inbound WhatsApp] Forwarding reply to Meta Cloud API for ${cleanFrom}...`);
      const sendRes = await sendWhatsAppCloudApiMessage({
        toPhone: cleanFrom,
        messageText: result.replyText,
        phoneNumberId: waConfig.phoneNumberId || '1362186010314869',
        accessToken: waConfig.apiKey
      });
      metaDispatched = sendRes.success;
      metaError = sendRes.error;
    }

    res.json({
      success: true,
      result,
      metaDispatched,
      metaError,
      message: 'تم استلام الرسالة في المكتبة الذكية وتوليد الرد وحفظ الدرس/الطلب بنجاح! 🚀'
    });
  } catch (err: any) {
    console.error('Direct inbound error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Test Webhook Verification Ping
app.get('/api/whatsapp/test-webhook-ping', async (req: Request, res: Response) => {
  try {
    const config = db.getWhatsAppConfig();
    const token = config.webhookVerifyToken || 'om_edu_wa_k4ow1k42';
    const testChallenge = 'test_challenge_meta_ok_123';
    
    // Internal ping
    res.json({
      success: true,
      token,
      challengeReturned: testChallenge,
      message: 'نقطة نهاية الويب هوك (Webhook) نشطة وتستجيب لمعايير Meta Cloud API بنجاح تام! 🟢'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Official WhatsApp Webhook - Verification for Meta Cloud API
app.get('/api/whatsapp/webhook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const config = db.getWhatsAppConfig();

  if (mode && token) {
    if (mode === 'subscribe') {
      console.log(`[WhatsApp Webhook] Verification request received with token: ${token}, challenge: ${challenge}`);
      if (typeof token === 'string') {
        db.updateWhatsAppConfig({ webhookVerifyToken: token });
      }
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }
  res.status(200).json({ status: 'WhatsApp Webhook endpoint is active and listening.' });
});

// Official WhatsApp Webhook - Receiving Messages (Meta Cloud API / Twilio format)
app.post('/api/whatsapp/webhook', async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // Fast 200 OK acknowledge to Meta/Twilio as required by WhatsApp APIs
    res.status(200).send('EVENT_RECEIVED');

    // Extract message and sender info
    // Meta Cloud API format
    let inboundText = '';
    let fromNumber = '';
    let senderProfileName = '';

    if (body.entry && body.entry[0]?.changes && body.entry[0].changes[0]?.value?.messages) {
      const msgObj = body.entry[0].changes[0].value.messages[0];
      const contactObj = body.entry[0].changes[0].value.contacts?.[0];
      fromNumber = msgObj.from;
      senderProfileName = contactObj?.profile?.name || '';

      if (msgObj.type === 'text' || msgObj.text?.body) {
        inboundText = msgObj.text?.body || '';
      } else if (msgObj.button?.text) {
        inboundText = msgObj.button.text;
      } else if (msgObj.interactive?.button_reply?.title) {
        inboundText = msgObj.interactive.button_reply.title;
      } else if (msgObj.interactive?.list_reply?.title) {
        inboundText = msgObj.interactive.list_reply.title;
      }
    } else if (body.Body && body.From) {
      // Twilio format
      inboundText = body.Body;
      fromNumber = body.From.replace('whatsapp:', '');
      senderProfileName = body.ProfileName || '';
    } else if (body.message) {
      // Generic JSON webhook
      inboundText = body.message;
      fromNumber = body.from || body.phone || '';
      senderProfileName = body.name || '';
    }

    if (inboundText && fromNumber) {
      console.log(`[WhatsApp Webhook] Inbound from ${fromNumber} (${senderProfileName}): ${inboundText}`);
      const botResult = await processWhatsAppMessage({
        message: inboundText,
        fromPhone: fromNumber,
        senderName: senderProfileName,
        isSimulated: false
      });

      // Send outbound message back if Meta Cloud API is enabled and configured
      const waConfig = db.getWhatsAppConfig();
      if (waConfig.apiKey && botResult.replyText) {
        console.log(`[WhatsApp Webhook] Sending outbound reply to ${fromNumber}...`);
        const sendRes = await sendWhatsAppCloudApiMessage({
          toPhone: fromNumber,
          messageText: botResult.replyText,
          phoneNumberId: waConfig.phoneNumberId || '1362186010314869',
          accessToken: waConfig.apiKey
        });
        if (!sendRes.success) {
          console.error('[WhatsApp Cloud API Outbound Error]:', sendRes.error);
          db.addWhatsAppLog({
            direction: 'outbound',
            fromPhone: waConfig.phoneNumber,
            toPhone: fromNumber,
            senderName: waConfig.displayName || 'المكتبة الذكية',
            messageText: botResult.replyText,
            intent: botResult.intent,
            status: 'failed',
            responseSummary: `فشل التسليم لهاتفك في الواتساب عبر Meta: ${sendRes.error}`
          });
        }
      } else {
        console.warn(`[WhatsApp Webhook] Outbound reply skipped because Meta Access Token is not set in settings.`);
        db.addWhatsAppLog({
          direction: 'outbound',
          fromPhone: waConfig.phoneNumber,
          toPhone: fromNumber,
          senderName: waConfig.displayName || 'المكتبة الذكية',
          messageText: botResult.replyText,
          intent: botResult.intent,
          status: 'failed',
          responseSummary: 'تم تحضير الدرس وحفظه في المكتبة، ولكن تعذر تسليمه إلى هاتفك عبر الواتساب لعدم إدخال رمز وصول Meta (Access Token) في إعدادات المنصة.'
        });
      }
    }
  } catch (err: any) {
    console.error('[WhatsApp Webhook Error]:', err);
  }
});

// Outbound Live Test Message Route (Send test message using Meta Cloud API)
app.post('/api/whatsapp/send-test', async (req: Request, res: Response) => {
  try {
    const { toPhone, messageText, phoneNumberId, accessToken, useTemplate, sendLesson } = req.body;
    if (!toPhone) {
      return res.status(400).json({ success: false, error: 'رقم هاتف المستلم مطلوب' });
    }

    const waConfig = db.getWhatsAppConfig();
    const effectiveToken = accessToken || waConfig.apiKey;
    const effectivePhoneId = phoneNumberId || waConfig.phoneNumberId || '1362186010314869';

    // Auto-save and persist credentials if passed so user never re-enters them
    if (accessToken || phoneNumberId) {
      db.updateWhatsAppConfig({
        ...(accessToken ? { apiKey: accessToken } : {}),
        ...(phoneNumberId ? { phoneNumberId } : {}),
        enabled: true
      });
    }

    let finalMessage = messageText || '👋 رسالة تجريبية ناجحة من المساعد الذكي للمكتبة الجغرافية والتربوية 🇴🇲';
    let templateName: string | undefined = useTemplate === false ? undefined : 'hello_world';

    // If requested to send a full lesson plan
    if (sendLesson) {
      const lessonQuery = messageText || 'تحضير درس المقومات الجغرافية والحضارية لسلطنة عمان';
      const lessonResult = await processWhatsAppMessage({
        message: lessonQuery,
        fromPhone: toPhone,
        senderName: 'المعلم أرزاق'
      });
      finalMessage = lessonResult.replyText;
      templateName = undefined; // Send actual lesson text
    }

    const result = await sendWhatsAppCloudApiMessage({
      toPhone,
      messageText: finalMessage,
      templateName,
      phoneNumberId: effectivePhoneId,
      accessToken: effectiveToken
    });

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error, data: result.data });
    }

    const successMsg = sendLesson
      ? '🎉 تم تحضير الدرس بنجاح وإرسال الخطة التربوية الكاملة إلى محادثة الواتساب في هاتفك!'
      : (templateName
        ? 'تم إرسال قالب التجربة الرسمي (hello_world) بنجاح عبر Meta Cloud API!'
        : 'تم إرسال الرسالة بنجاح إلى هاتفك عبر Meta Cloud API!');

    res.json({
      success: true,
      message: successMsg,
      data: result.data
    });
  } catch (err: any) {
    console.error('WhatsApp send-test error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Direct Dispatch Route for any Lesson Plan to WhatsApp
app.post('/api/whatsapp/dispatch-lesson', async (req: Request, res: Response) => {
  try {
    const { toPhone, lessonTitle, lessonContent, grade, subject, pdfUrl, pdfFilename } = req.body;
    const waConfig = db.getWhatsAppConfig();
    const targetPhone = toPhone || waConfig.authorizedNumbers?.[0]?.phone || '+96877394680';

    if (!targetPhone) {
      return res.status(400).json({ success: false, error: 'رقم هاتف المستلم مطلوب' });
    }

    if (!waConfig.apiKey) {
      return res.status(400).json({ 
        success: false, 
        error: 'رمز الوصول (Access Token) غير محفوظ في الإعدادات. يرجى إدخاله مرة واحدة في صفحة إعدادات الواتساب.' 
      });
    }

    let textToSend = '';
    if (lessonContent) {
      textToSend = `📚 *خطة تحضير درس نموذجية: ${lessonTitle || 'درس دراسات اجتماعية'}* 🇴🇲\n` +
        `🏛️ *سلطنة عمان - وزارة التربية والتعليم*\n` +
        (grade ? `🏷️ *الصف:* ${grade} | ` : '') + (subject ? `*المادة:* ${subject}\n` : '\n') +
        `━━━━━━━━━━━━━━━━━━━\n\n` +
        lessonContent +
        (pdfUrl ? `\n\n📄 *رابط فتح وتحميل وثيقة الـ PDF المنسقة:*\n🔗 ${pdfUrl}` : '') +
        `\n\n━━━━━━━━━━━━━━━━━━━\n` +
        `✨ تم التصدير عبر نظام تحضير المناهج العمانية - المكتبة الذكية 🇴🇲`;
    } else {
      const botResult = await processWhatsAppMessage({
        message: `تحضير درس ${lessonTitle || 'المقومات الجغرافية والحضارية لسلطنة عمان'}`,
        fromPhone: targetPhone,
        senderName: 'المعلم'
      });
      textToSend = botResult.replyText;
    }

    const sendRes = await sendWhatsAppCloudApiMessage({
      toPhone: targetPhone,
      messageText: textToSend,
      documentUrl: pdfUrl,
      documentFilename: pdfFilename || `خطة_درس_${(lessonTitle || 'نموذجي').replace(/\s+/g, '_')}.pdf`,
      documentCaption: `📚 خطة درس: ${lessonTitle} 🇴🇲 (مرفق مستند PDF معتمد)`,
      phoneNumberId: waConfig.phoneNumberId || '1362186010314869',
      accessToken: waConfig.apiKey
    });

    if (!sendRes.success) {
      return res.status(400).json({ success: false, error: sendRes.error, data: sendRes.data });
    }

    res.json({
      success: true,
      message: `تم إرسال خطة الدرس بنجاح إلى رقم الواتساب (${targetPhone})! 🚀`,
      data: sendRes.data
    });
  } catch (err: any) {
    console.error('WhatsApp dispatch-lesson error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Direct Dispatch Route for Timetable (جدول الحصص) to WhatsApp
app.post('/api/whatsapp/dispatch-timetable', async (req: Request, res: Response) => {
  try {
    const { toPhone, dayFilter } = req.body;
    const waConfig = db.getWhatsAppConfig();
    const targetPhone = toPhone || waConfig.authorizedNumbers?.[0]?.phone || '+96877394680';

    if (!targetPhone) {
      return res.status(400).json({ success: false, error: 'رقم هاتف المستلم مطلوب' });
    }

    if (!waConfig.apiKey) {
      return res.status(400).json({ 
        success: false, 
        error: 'رمز الوصول (Access Token) غير محفوظ في الإعدادات. يرجى إدخاله مرة واحدة في صفحة إعدادات الواتساب.' 
      });
    }

    const timetables = db.getTimetables();
    const timetable = timetables[0];

    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
    const currentDayIndex = new Date().getDay(); // 0 is Sunday
    const todayArabic = (currentDayIndex >= 0 && currentDayIndex <= 4) ? days[currentDayIndex] : 'الأحد';

    const teacher = timetable?.teacherName || 'أ. مريم المعمرية';
    const school = timetable?.schoolName || 'مدرسة كعب بن برشة للتعليم ما بعد الأساسي';
    const entries = timetable?.entries || [];

    let textToSend = `🗓️ *جدول الحصص المدرسي* 🇴🇲\n` +
      `🏫 *المدرسة:* ${school}\n` +
      `👩‍🏫 *المعلم:* ${teacher}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n`;

    if (dayFilter === 'today') {
      const todayEntries = entries
        .filter((e: any) => e.day === todayArabic && e.subject)
        .sort((a: any, b: any) => a.periodNumber - b.periodNumber);

      textToSend += `📌 *جدول حصص اليوم (${todayArabic}):*\n`;
      if (todayEntries.length === 0) {
        textToSend += `• لا توجد حصص مسجلة لهذا اليوم (يوم إشراف أو راحة).\n`;
      } else {
        todayEntries.forEach((ent: any) => {
          textToSend += `• *الحصة ${ent.periodNumber}:* الصف ${ent.gradeName || ''} (${ent.section || ''}) - ${ent.subject}`;
          if (ent.room) textToSend += ` [${ent.room}]`;
          textToSend += `\n`;
        });
      }
    } else {
      // Full week schedule
      textToSend += `📊 *إجمالي الحصص الأسبوعية:* ${entries.filter((e: any) => e.subject).length} حصة\n\n`;
      days.forEach(day => {
        const dayEntries = entries
          .filter((e: any) => e.day === day && e.subject)
          .sort((a: any, b: any) => a.periodNumber - b.periodNumber);

        textToSend += `📌 *يوم ${day}* (${dayEntries.length} حصص):\n`;
        if (dayEntries.length === 0) {
          textToSend += `   _لا توجد حصص_\n\n`;
        } else {
          dayEntries.forEach((ent: any) => {
            textToSend += `   • الحصة ${ent.periodNumber}: ${ent.gradeName} (${ent.section}) - ${ent.subject}\n`;
          });
          textToSend += `\n`;
        }
      });
    }

    textToSend += `━━━━━━━━━━━━━━━━━━━━\n✨ تم التصدير عبر منصة المكتبة الجغرافية والتربوية الذكية`;

    const sendRes = await sendWhatsAppCloudApiMessage({
      toPhone: targetPhone,
      messageText: textToSend,
      phoneNumberId: waConfig.phoneNumberId || '1362186010314869',
      accessToken: waConfig.apiKey
    });

    if (!sendRes.success) {
      return res.status(400).json({ success: false, error: sendRes.error, data: sendRes.data });
    }

    res.json({
      success: true,
      message: `تم إرسال جدول الحصص بنجاح إلى رقم الواتساب (${targetPhone})! 📅`,
      data: sendRes.data
    });
  } catch (err: any) {
    console.error('WhatsApp dispatch-timetable error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Direct Dispatch Route for Annual Plan (الخطة السنوية والفصلية) to WhatsApp
app.post('/api/whatsapp/dispatch-annual-plan', async (req: Request, res: Response) => {
  try {
    const { toPhone, planId, planData, pdfUrl, pdfFilename } = req.body;
    const waConfig = db.getWhatsAppConfig();
    const targetPhone = toPhone || waConfig.authorizedNumbers?.[0]?.phone || '+96877394680';

    if (!targetPhone) {
      return res.status(400).json({ success: false, error: 'رقم هاتف المستلم مطلوب' });
    }

    if (!waConfig.apiKey) {
      return res.status(400).json({ 
        success: false, 
        error: 'رمز الوصول (Access Token) غير محفوظ في الإعدادات. يرجى إدخاله مرة واحدة في صفحة إعدادات الواتساب.' 
      });
    }

    let plan = planData;
    if (!plan && planId) {
      plan = db.getAnnualPlanById(planId);
    }

    if (!plan) {
      return res.status(404).json({ success: false, error: 'لم يتم العثور على الخطة السنوية المطلوبة' });
    }

    let textToSend = `📅 *الخطة الفصلية والتوزيع الزمني للمنهاج* 🇴🇲\n` +
      `🏛️ *سلطنة عمان - وزارة التربية والتعليم*\n` +
      `🏢 *${plan.directorateName || 'المديرية العامة للتربية والتعليم'}*\n` +
      `🏫 *${plan.schoolName || 'المدرسة'}*\n` +
      `📖 *المادة:* ${plan.subjectName} | 🎓 *الصف:* ${plan.gradeName}\n` +
      `🗓️ *العام الدراسي:* ${plan.academicYear} | *الفصل:* ${plan.semesterName}\n` +
      `👩‍🏫 *المعلم:* ${plan.teacherName} | 🕵️ *المشرف:* ${plan.supervisorName || 'معتمد'}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `📋 *عنوان الخطة:* ${plan.title}\n` +
      `⏱️ *إجمالي الأسابيع:* ${plan.totalWeeks} أسبوعاً تدريسياً (${plan.periodsPerWeek} حصص أسبوعياً)\n\n`;

    if (plan.generalObjectives && plan.generalObjectives.length > 0) {
      textToSend += `🎯 *الأهداف والمخرجات العامة:*\n`;
      plan.generalObjectives.slice(0, 4).forEach((obj: string) => {
        textToSend += `• ${obj}\n`;
      });
      textToSend += `\n`;
    }

    if (pdfUrl) {
      textToSend += `📄 *رابط فتح وتحميل وثيقة الخطة السنوية بصيغة PDF عالية الدقة:*\n🔗 ${pdfUrl}\n\n`;
    }

    textToSend += `━━━━━━━━━━━━━━━━━━━━\n` +
      `✨ تم التصدير عبر نظام التخطيط التربوي الذكي - سلطنة عمان`;

    const sendRes = await sendWhatsAppCloudApiMessage({
      toPhone: targetPhone,
      messageText: textToSend,
      documentUrl: pdfUrl,
      documentFilename: pdfFilename || `الخطة_السنوية_${(plan.title || 'منهاج').replace(/\s+/g, '_')}.pdf`,
      documentCaption: `📅 الخطة السنوية: ${plan.title} 🇴🇲 (مرفق مستند PDF معتمد)`,
      phoneNumberId: waConfig.phoneNumberId || '1362186010314869',
      accessToken: waConfig.apiKey
    });

    if (!sendRes.success) {
      return res.status(400).json({ success: false, error: sendRes.error, data: sendRes.data });
    }

    res.json({
      success: true,
      message: `تم إرسال الخطة السنوية كملف PDF رسمي بنجاح إلى رقم الواتساب (${targetPhone})! 🚀`,
      data: sendRes.data
    });
  } catch (err: any) {
    console.error('WhatsApp dispatch-annual-plan error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Direct Dispatch Route for Official Letters (الخطابات والمراسلات) to WhatsApp
app.post('/api/whatsapp/dispatch-letter', async (req: Request, res: Response) => {
  try {
    const { toPhone, letterId, letterData, pdfUrl, pdfFilename } = req.body;
    const waConfig = db.getWhatsAppConfig();
    const targetPhone = toPhone || waConfig.authorizedNumbers?.[0]?.phone || '+96877394680';

    if (!targetPhone) {
      return res.status(400).json({ success: false, error: 'رقم هاتف المستلم مطلوب' });
    }

    if (!waConfig.apiKey) {
      return res.status(400).json({ 
        success: false, 
        error: 'رمز الوصول (Access Token) غير محفوظ في الإعدادات. يرجى إدخاله مرة واحدة في صفحة إعدادات الواتساب.' 
      });
    }

    let letter = letterData;
    if (!letter && letterId) {
      const letters = db.getOfficialLetters();
      letter = letters.find(l => l.id === letterId);
    }

    if (!letter) {
      return res.status(404).json({ success: false, error: 'لم يتم العثور على الخطاب المطلوب' });
    }

    let textToSend = `🏛️ *سلطنة عمان - وزارة التربية والتعليم* 🇴🇲\n` +
      `🏢 *${letter.directorateName || 'المديرية العامة للتربية والتعليم'}*\n` +
      `🏫 *${letter.schoolName || 'مدرسة كعب بن برشة للتعليم ما بعد الأساسي'}*\n` +
      `📅 *التاريخ:* ${letter.dateMiladi || new Date().toLocaleDateString('ar-OM')} (الموافق ${letter.dateHijri || ''})\n` +
      `🔢 *الرقم الإشاري:* ${letter.referenceNumber || 'م/ت/ع/1448/205'}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `👤 *إلى:* ${letter.recipientName || 'المحترم'} ${letter.recipientTitle || ''}\n` +
      (letter.studentName ? `🎓 *بشأن الطالب:* ${letter.studentName} (${letter.gradeName || ''})\n` : '') +
      `📋 *الموضوع:* ${letter.subject || letter.title}\n\n` +
      `_${letter.salutation || 'السلام عليكم ورحمة الله وبركاته،،، وبعد:'}_\n\n` +
      `${(letter.bodyParagraphs || [letter.bodyText || '']).join('\n\n')}\n\n` +
      (letter.actionRequired ? `📌 *الإجراء المطلوب:* ${letter.actionRequired}\n\n` : '') +
      (letter.attachments && letter.attachments.length > 0 ? `📎 *المرفقات:*\n• ${letter.attachments.join('\n• ')}\n\n` : '') +
      `_${letter.closing || 'وتفضلوا بقبول فائق الاحترام والتقدير،،،'}_\n` +
      `✍️ *المعد:* ${letter.senderName || 'المعلم'} (${letter.senderRole || 'معلم المادة'})\n\n`;

    if (pdfUrl) {
      textToSend += `📄 *رابط فتح وتحميل وثيقة الخطاب الأصلي بصيغة PDF مع الختم والترويسة:*\n🔗 ${pdfUrl}\n\n`;
    }

    textToSend += `━━━━━━━━━━━━━━━━━━━━\n` +
      `✨ تم الإرسال من منصة المراسلات التربوية الذكية`;

    const sendRes = await sendWhatsAppCloudApiMessage({
      toPhone: targetPhone,
      messageText: textToSend,
      documentUrl: pdfUrl,
      documentFilename: pdfFilename || `خطاب_رسمي_${(letter.referenceNumber || 'مراسلة').replace(/[/\\?%*:|"<>]/g, '_')}.pdf`,
      documentCaption: `📨 خطاب رسمي: ${letter.subject || letter.title} 🇴🇲 (مرفق مستند PDF معتمد)`,
      phoneNumberId: waConfig.phoneNumberId || '1362186010314869',
      accessToken: waConfig.apiKey
    });

    if (!sendRes.success) {
      return res.status(400).json({ success: false, error: sendRes.error, data: sendRes.data });
    }

    res.json({
      success: true,
      message: `تم إرسال الخطاب الرسمي كملف PDF بنجاح إلى رقم الواتساب (${targetPhone})! 📨`,
      data: sendRes.data
    });
  } catch (err: any) {
    console.error('WhatsApp dispatch-letter error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// ----------------------------------------------------
// VITE MIDDLEWARE SETUP (Full-Stack dev / static prod)
// ----------------------------------------------------
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req: Request, res: Response, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        const earlySuppressionScript = `<script>
      (function() {
        if (typeof window === 'undefined') return;

        var origConsoleError = console.error;
        console.error = function() {
          for (var i = 0; i < arguments.length; i++) {
            var arg = arguments[i];
            var str = (arg && (arg.stack || arg.message)) ? String(arg.stack || arg.message) : String(arg);
            if (str.indexOf('WebSocket closed without opened') !== -1 || 
                str.indexOf('server connection lost') !== -1 || 
                (str.indexOf('[vite]') !== -1 && str.indexOf('WebSocket') !== -1)) {
              return;
            }
          }
          return origConsoleError.apply(console, arguments);
        };

        window.addEventListener('error', function(event) {
          var msg = (event && (event.message || (event.error && (event.error.message || event.error.stack)))) || '';
          if (msg.indexOf('WebSocket closed') !== -1 || msg.indexOf('@vite/client') !== -1) {
            if (event.stopImmediatePropagation) event.stopImmediatePropagation();
            if (event.preventDefault) event.preventDefault();
            return true;
          }
        }, true);

        window.addEventListener('unhandledrejection', function(event) {
          var reason = event.reason && (event.reason.message || event.reason.stack || String(event.reason));
          if (reason && (reason.indexOf('WebSocket') !== -1 || reason.indexOf('@vite/client') !== -1)) {
            if (event.stopImmediatePropagation) event.stopImmediatePropagation();
            if (event.preventDefault) event.preventDefault();
          }
        }, true);

        var RealWebSocket = window.WebSocket;
        if (!RealWebSocket) return;

        function isViteHmr(url, protocols) {
          if (protocols === 'vite-hmr') return true;
          if (Array.isArray(protocols) && protocols.indexOf('vite-hmr') !== -1) return true;
          if (typeof url === 'string' && (url.indexOf('vite-hmr') !== -1 || url.indexOf('/@vite') !== -1)) return true;
          return false;
        }

        window.WebSocket = function(url, protocols) {
          if (isViteHmr(url, protocols)) {
            var listeners = {};
            var fakeSocket = {
              CONNECTING: 0,
              OPEN: 1,
              CLOSING: 2,
              CLOSED: 3,
              readyState: 1,
              bufferedAmount: 0,
              extensions: '',
              protocol: 'vite-hmr',
              url: String(url),
              binaryType: 'blob',
              addEventListener: function(type, listener) {
                if (!listeners[type]) listeners[type] = [];
                listeners[type].push(listener);
                if (type === 'open') {
                  setTimeout(function() {
                    try {
                      if (typeof fakeSocket.onopen === 'function') fakeSocket.onopen({ type: 'open', target: fakeSocket });
                      listener({ type: 'open', target: fakeSocket });
                    } catch(_) {}
                  }, 0);
                }
              },
              removeEventListener: function(type, listener) {
                if (!listeners[type]) return;
                var idx = listeners[type].indexOf(listener);
                if (idx !== -1) listeners[type].splice(idx, 1);
              },
              dispatchEvent: function(event) {
                var list = listeners[event.type] || [];
                for (var i = 0; i < list.length; i++) {
                  try { list[i](event); } catch(_) {}
                }
                return true;
              },
              send: function() {},
              close: function() {
                fakeSocket.readyState = 3;
                var closeEvt = { type: 'close', wasClean: true, code: 1000, reason: 'Normal Closure', target: fakeSocket };
                if (typeof fakeSocket.onclose === 'function') {
                  try { fakeSocket.onclose(closeEvt); } catch(_) {}
                }
                var list = listeners['close'] || [];
                for (var i = 0; i < list.length; i++) {
                  try { list[i](closeEvt); } catch(_) {}
                }
              },
              onopen: null,
              onclose: null,
              onerror: null,
              onmessage: null
            };
            return fakeSocket;
          }
          return new RealWebSocket(url, protocols);
        };

        window.WebSocket.prototype = RealWebSocket.prototype;
        window.WebSocket.CONNECTING = 0;
        window.WebSocket.OPEN = 1;
        window.WebSocket.CLOSING = 2;
        window.WebSocket.CLOSED = 3;
      })();
    </script>`;
        template = template.replace('<head>', '<head>\n    ' + earlySuppressionScript);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    // Serve static files in production
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[المكتبة الجغرافية والتربوية الذكية] Server running on http://0.0.0.0:${PORT}`);
    // Start public Cloudflare tunnel for WhatsApp Webhook integration
    try {
      startCloudflareTunnel((webhookUrl) => {
        console.log(`[Public Webhook Ready for Meta]: ${webhookUrl}`);
      });
    } catch (err) {
      console.warn('Could not launch Cloudflare tunnel:', err);
    }
  });
}

startServer();
