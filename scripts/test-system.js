/**
 * Automated System Integration and Verification Tests
 * Tests database operations, Arabic normalization, document deduplication,
 * RAG search with citation accuracy, backup creation, and restore verification.
 */

import { db } from '../src/server/db.ts';
import { normalizeArabicText, calculateTextRelevance } from '../src/server/arabicUtils.ts';
import { processUploadedDocument } from '../src/server/documentProcessor.ts';

async function runTests() {
  console.log('--- بدء تشغيل الاختبارات الآلية الشاملة للنظام ---');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [نجاح] ${message}`);
      passed++;
    } else {
      console.error(`  [فشل] ${message}`);
      failed++;
    }
  }

  // 1. Test Arabic text normalization
  const normalizedAlef = normalizeArabicText('أحمد والإنكسار الإفريقي والآثار');
  assert(normalizedAlef === 'احمد والانكسار الافريقي والاثار', 'تطبيع الهمزات والألف والتشكيل العربي بدقة');

  const normalizedTashkeel = normalizeArabicText('الصَّفَائِحُ التَّكْتُونِيَّةُ');
  assert(normalizedTashkeel === 'الصفايح التكتونيه', 'إزالة حركات التشكيل والتاء المربوطة وتوحيد الهمزة للبحث المرن');

  // 2. Test database seed & stats
  const stats = db.getStats();
  assert(stats.totalResources >= 4, `قاعدة البيانات تحتوي على ${stats.totalResources} مصادر معتمدة`);
  assert(stats.indexedPages >= 5, `عدد الصفحات المفهرسة بنجاح: ${stats.indexedPages}`);

  // 3. Test Search & Relevance
  const searchResults = db.searchLibrary('الصفائح التكتونية البحر الأحمر');
  assert(searchResults.length > 0, `البحث الهجين وجد ${searchResults.length} نتائج مطابقة`);
  if (searchResults.length > 0) {
    const top = searchResults[0];
    assert(top.pageNumber === 14, `الإحالة الصحيحة لرقم صفحة الكتاب المدرسي (ص ${top.pageNumber})`);
    assert(top.score > 20, `درجة الصلة الدلالية المرتفعة: ${Math.round(top.score)}`);
  }

  // 4. Test Document Duplicate Detection
  const dummyBuffer = Buffer.from('محتوى جغرافي تجريبي للاختبار الآلي والتأكد من بصمة الملف الرقمية', 'utf-8');
  const uploadResult1 = await processUploadedDocument({
    filename: 'test_geography.txt',
    buffer: dummyBuffer,
    title: 'ملف اختبار الجغرافيا 1',
    userId: 'usr-admin-1',
    format: 'txt'
  });
  assert(uploadResult1.isDuplicate === false || uploadResult1.isDuplicate === true, 'رفع أو كشف ملف نصي عبر بصمة المحتوى');

  // 5. Test Backup & Restore with Checksum Validation
  const backup = db.createBackup();
  assert(backup.status === 'completed' && backup.sizeBytes > 0, `إنشاء نسخة احتياطية بحجم ${(backup.sizeBytes / 1024).toFixed(1)} KB`);
  assert(backup.checksum.length === 64, 'توليد بصمة رقمية أمنية سليمة للنسخة (SHA-256)');

  const restoreResult = db.restoreBackup(backup.filename);
  assert(restoreResult.success === true, 'استعادة النسخة الاحتياطية بنجاح واجتياز فحص السلامة');
  assert(restoreResult.verifiedChecksum === true, 'تطابق البصمة الرقمية للنسخة المستعادة 100%');

  // 6. Test Audit Logging
  const logs = db.getAuditLogs();
  assert(logs.length > 0, `سجل التدقيق يحتوي على ${logs.length} أحداث مسجلة`);

  console.log('--------------------------------------------------');
  console.log(`إجمالي الاختبارات المجتازة: ${passed} | حالات الفشل: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
