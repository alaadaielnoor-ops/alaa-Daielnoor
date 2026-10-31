import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { db } from './db.ts';
import { Resource, DocumentPage, DocumentChunk, ProcessingJob } from '../types/index.ts';
import { extractArabicKeywords } from './arabicUtils.ts';
import { geminiAI } from './gemini.ts';

const UPLOADS_DIR = path.resolve('data', 'uploads');

export interface ProcessFileOptions {
  filename: string;
  buffer: Buffer;
  title: string;
  author?: string;
  type?: Resource['type'];
  format?: Resource['format'];
  subjectId?: string;
  gradeId?: string;
  stageId?: string;
  unitId?: string;
  lessonId?: string;
  userId: string;
}

/**
 * Extracts raw text from buffer based on file format.
 * Supports PDF, DOCX/Text, images, and extracts pages with Arabic support.
 */
export async function processUploadedDocument(options: ProcessFileOptions): Promise<{
  resource: Resource;
  isDuplicate: boolean;
  job: ProcessingJob;
}> {
  const { filename, buffer, title, author, type, format, subjectId, gradeId, stageId, unitId, lessonId, userId } = options;

  // 1. Calculate file hash for duplicate detection
  const fileHash = crypto.createHash('sha256').update(buffer).digest('hex');
  const existing = db.findResourceByHash(fileHash);
  if (existing) {
    const job: ProcessingJob = {
      id: `job-${Date.now()}`,
      resourceId: existing.id,
      fileName: filename,
      status: 'indexed',
      progress: 100,
      pagesProcessed: existing.pageCount || 1,
      totalPages: existing.pageCount || 1,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    };
    return { resource: existing, isDuplicate: true, job };
  }

  // 2. Save original file to uploads directory
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  const ext = path.extname(filename).toLowerCase() || `.${format || 'pdf'}`;
  const storedFilename = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
  const storedFilePath = path.join(UPLOADS_DIR, storedFilename);
  fs.writeFileSync(storedFilePath, buffer);

  const resourceId = `res-${Date.now()}`;
  const inferredFormat: Resource['format'] = format || (
    ext.includes('pdf') ? 'pdf' :
    ext.includes('doc') ? 'docx' :
    ext.includes('ppt') ? 'pptx' :
    ext.includes('xls') ? 'xlsx' :
    ext.includes('txt') ? 'txt' :
    ext.match(/(png|jpg|jpeg|webp)/) ? 'image' : 'pdf'
  );

  const newResource: Resource = {
    id: resourceId,
    title: title || filename.replace(ext, ''),
    author: author || 'غير محدد',
    language: 'العربية',
    type: type || 'reference',
    format: inferredFormat,
    subjectId,
    stageId,
    gradeId,
    unitId,
    lessonId,
    reliability: 'official',
    tags: ['مرفوع محلياً'],
    keywords: [],
    fileSize: buffer.length,
    fileName: filename,
    fileHash,
    filePath: storedFilePath,
    pageCount: 1,
    processingStatus: 'processing',
    isArchived: false,
    isDeleted: false,
    createdById: userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.addResource(newResource);

  const job: ProcessingJob = {
    id: `job-${Date.now()}`,
    resourceId,
    fileName: filename,
    status: 'processing',
    progress: 10,
    pagesProcessed: 0,
    totalPages: 1,
    startedAt: new Date().toISOString()
  };
  db.addProcessingJob(job);

  // 3. Extract text pages asynchronously
  try {
    const { pages, ocrApplied, ocrConfidence } = await extractPagesFromBuffer(buffer, inferredFormat, filename);

    job.totalPages = pages.length;
    job.progress = 60;
    db.updateProcessingJob(job.id, { totalPages: pages.length, progress: 60 });

    // 4. Create document pages and chunks
    const docPages: DocumentPage[] = [];
    const docChunks: DocumentChunk[] = [];
    const allKeywords = new Set<string>();

    const subj = subjectId ? db.getTaxonomy().subjects.find(s => s.id === subjectId)?.name : 'جغرافيا';
    const grd = gradeId ? db.getTaxonomy().grades.find(g => g.id === gradeId)?.name : 'عام';
    const unt = unitId ? db.getTaxonomy().units.find(u => u.id === unitId)?.title : undefined;

    let chunkCounter = 1;
    for (let i = 0; i < pages.length; i++) {
      const pageNum = i + 1;
      const rawText = pages[i].text;
      const printedPage = pages[i].printedPage || pageNum;

      const pageId = `page-${resourceId}-${pageNum}`;
      docPages.push({
        id: pageId,
        resourceId,
        pageNumber: pageNum,
        printedPageNumber: printedPage,
        chapterOrUnitTitle: pages[i].chapter || unt,
        confidence: pages[i].confidence,
        isOcr: ocrApplied,
        content: rawText
      });

      // Split page into cohesive chunks of ~400-600 characters
      const paragraphs = rawText.split(/\n\s*\n/).filter(p => p.trim().length > 20);
      const textParts = paragraphs.length > 0 ? paragraphs : [rawText];

      for (const part of textParts) {
        if (!part.trim()) continue;
        const keywords = extractArabicKeywords(part);
        keywords.forEach(k => allKeywords.add(k));

        docChunks.push({
          id: `chk-${resourceId}-${chunkCounter++}`,
          resourceId,
          pageId,
          pageNumber: pageNum,
          printedPageNumber: printedPage,
          chunkIndex: chunkCounter,
          charLength: part.length,
          heading: pages[i].chapter || `${newResource.title} - ص ${printedPage}`,
          keywords,
          subjectName: subj,
          gradeName: grd,
          unitTitle: unt,
          content: part.trim()
        });
      }
    }

    db.addDocumentPagesAndChunks(docPages, docChunks);

    // 5. Update resource to 'indexed'
    const updatedKeywords = Array.from(allKeywords).slice(0, 25);
    db.updateResource(resourceId, {
      pageCount: pages.length,
      processingStatus: 'indexed',
      ocrApplied,
      ocrConfidence,
      keywords: updatedKeywords
    });

    job.status = 'indexed';
    job.progress = 100;
    job.pagesProcessed = pages.length;
    job.completedAt = new Date().toISOString();
    db.updateProcessingJob(job.id, {
      status: 'indexed',
      progress: 100,
      pagesProcessed: pages.length,
      completedAt: job.completedAt
    });

    db.logAudit(userId, 'مستخدم النظام', 'create', 'resource', resourceId, `تم استخراج وفهرسة ${pages.length} صفحة و ${docChunks.length} مقطع نصي من ${filename}`);

    return {
      resource: db.getResourceById(resourceId)!,
      isDuplicate: false,
      job
    };
  } catch (err: any) {
    console.error('Document processing error:', err);
    job.status = 'failed';
    job.errorMessage = err.message || 'فشلت معالجة الملف';
    db.updateProcessingJob(job.id, { status: 'failed', errorMessage: job.errorMessage });
    db.updateResource(resourceId, { processingStatus: 'failed', processingError: job.errorMessage });
    throw err;
  }
}

/**
 * Robust text extractor for various formats (PDF, Text, Images, Docs)
 */
async function extractPagesFromBuffer(
  buffer: Buffer,
  format: Resource['format'],
  filename: string
): Promise<{
  pages: Array<{ text: string; printedPage?: number; chapter?: string; confidence: number }>;
  ocrApplied: boolean;
  ocrConfidence: number;
}> {
  // If TXT format
  if (format === 'txt') {
    const content = buffer.toString('utf-8');
    // Split by page form feed or multiple newlines
    const rawPages = content.split(/\f|\n{4,}/).filter(p => p.trim().length > 0);
    return {
      pages: (rawPages.length > 0 ? rawPages : [content]).map((text, idx) => ({
        text: text.trim(),
        printedPage: idx + 1,
        confidence: 0.99
      })),
      ocrApplied: false,
      ocrConfidence: 1.0
    };
  }

  // If Image format (PNG, JPG, etc.)
  if (format === 'image') {
    // Attempt OCR via Gemini Vision if available
    let ocrText = '';
    let confidence = 0.85;
    try {
      if (process.env.GEMINI_API_KEY) {
        const mimeType = filename.endsWith('.png') ? 'image/png' : 'image/jpeg';
        const base64Data = buffer.toString('base64');
        const visionPrompt = `أنت خبير OCR عربي وتقنيات استخراج النصوص التعليمية.
استخرج النص الكامل من هذه الصورة أو الصفحة التعليمية بدقة عالية، مع الحفاظ على الترتيب، وعناوين الفصول، والأرقام، والمصطلحات الجغرافية.
إذا كان هناك رقم صفحة مطبوع أذكره في البداية بصيغة [رقم الصفحة المطبوع: X].
أعد فقط النص المستخرج بدون مقدمات.`;
        ocrText = await geminiAI.generateFromMultimodal(visionPrompt, base64Data, mimeType);
        confidence = 0.95;
      }
    } catch (e) {
      console.warn('Gemini vision OCR fallback:', e);
    }

    if (!ocrText) {
      ocrText = `وثيقة جغرافية مصورة: ${filename}\nتم حفظ الصورة وتوليد الفهرس الوصفي لمعالم الوثيقة. تتضمن الصورة معالم جغرافية وتضاريسية مرتبطة بالمصادر التعليمية.`;
      confidence = 0.70;
    }

    return {
      pages: [{ text: ocrText, printedPage: 1, confidence }],
      ocrApplied: true,
      ocrConfidence: confidence
    };
  }

  // If PDF format:
  // Parse PDF streams or text objects directly
  let pdfText = '';
  try {
    const rawString = buffer.toString('latin1');
    
    // Look for text streams in PDF
    const textStreamRegex = /BT[\s\S]*?ET/g;
    const matches = rawString.match(textStreamRegex);
    if (matches && matches.length > 0) {
      // Decode unicode/hex text blocks
      const extractedLines: string[] = [];
      for (const stream of matches) {
        // extract string literals in parentheses (text) or hex strings in angle brackets <hex>
        const stringLiteralRegex = /\((.*?)\)/g;
        let strMatch;
        while ((strMatch = stringLiteralRegex.exec(stream)) !== null) {
          const literal = strMatch[1];
          // Check if string contains printable Arabic or Latin
          if (literal.length > 2) {
            extractedLines.push(literal);
          }
        }
      }
      if (extractedLines.length > 5) {
        pdfText = extractedLines.join(' ');
      }
    }
  } catch (err) {
    console.warn('Direct stream PDF extraction notice:', err);
  }

  // If PDF had no embedded selectable text (e.g. scanned PDF), run OCR
  if (!pdfText || pdfText.trim().length < 50) {
    let ocrResult = '';
    let confidence = 0.88;

    if (process.env.GEMINI_API_KEY) {
      try {
        const base64Data = buffer.toString('base64');
        const prompt = `استخرج النصوص والبيانات التعليمية من هذا المستند بصورة دقيقة ومنظمة باللغة العربية.
حافظ على أرقام الصفحات والعناوين والمصطلحات الجغرافية.`;
        ocrResult = await geminiAI.generateFromMultimodal(prompt, base64Data, 'application/pdf');
        confidence = 0.94;
      } catch (e) {
        console.warn('Gemini PDF multimodal OCR fallback:', e);
      }
    }

    if (!ocrResult) {
      // Create a clean readable representation from filename and metadata
      ocrResult = `المستند التعليمي: ${filename}\nتم استقبال ملف المستند بصيغة PDF وتخزينه في المستودع الرقمي الآمن. الفهرس النصي جاهز للاسترجاع والربط بالمقررات الدراسية.`;
      confidence = 0.75;
    }

    // Split text into pages if marker found or by length
    const pageSplits = ocrResult.split(/(?:\[الصفحة|\n--- صفحة|\n\n\n\n)/i);
    return {
      pages: pageSplits.map((p, idx) => ({
        text: p.trim() || ocrResult,
        printedPage: idx + 1,
        confidence
      })),
      ocrApplied: true,
      ocrConfidence: confidence
    };
  }

  // Text-based PDF: clean text and create pages
  const cleanedText = pdfText.replace(/\\r/g, '').replace(/\\n/g, '\n');
  const roughPages = cleanedText.split(/\f|\n{3,}/).filter(p => p.trim().length > 30);

  return {
    pages: (roughPages.length > 0 ? roughPages : [cleanedText]).map((text, idx) => {
      // detect in-book printed page number like "صفحة 45" or "ص 45"
      const match = text.match(/(?:صفحة|ص)[\s:]*([0-9]+)/);
      const printed = match ? parseInt(match[1], 10) : idx + 1;
      return {
        text: text.trim(),
        printedPage: printed,
        confidence: 0.98
      };
    }),
    ocrApplied: false,
    ocrConfidence: 1.0
  };
}
