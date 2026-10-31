import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { Subject, EducationalStage, Grade, Unit, Resource } from '../../types/index.ts';
import {
  Upload, X, FileText, CheckCircle2, AlertTriangle,
  RefreshCw, Layers, ShieldCheck
} from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser, showToast } = useApp();

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [type, setType] = useState<Resource['type']>('textbook');
  const [subjectId, setSubjectId] = useState('');
  const [gradeId, setGradeId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [description, setDescription] = useState('');

  // Taxonomy selects
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [duplicateAlert, setDuplicateAlert] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadTaxonomy();
      setFile(null);
      setTitle('');
      setAuthor('');
      setDescription('');
      setProgress(0);
      setDuplicateAlert(null);
    }
  }, [isOpen]);

  const loadTaxonomy = async () => {
    try {
      const res = await api.getTaxonomy();
      if (res.success && res.taxonomy) {
        setSubjects(res.taxonomy.subjects || []);
        setGrades(res.taxonomy.grades || []);
        setUnits(res.taxonomy.units || []);
        if (res.taxonomy.subjects?.length > 0) setSubjectId(res.taxonomy.subjects[0].id);
        if (res.taxonomy.grades?.length > 0) setGradeId(res.taxonomy.grades[0].id);
      }
    } catch (e) {
      console.warn('Taxonomy load error in upload modal:', e);
    }
  };

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ''));
      }
      setDuplicateAlert(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      showToast('يرجى اختيار ملف لرفعه', 'error');
      return;
    }

    setIsUploading(true);
    setProgress(15);
    setStatusText('قراءة الملف وحساب البصمة الرقمية (SHA-256)...');

    try {
      // Read file as base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);

      const base64Content = await base64Promise;
      setProgress(40);
      setStatusText('نقل البيانات إلى الخادم الآمن...');

      const res = await api.uploadResource({
        filename: file.name,
        base64Content,
        title: title || file.name,
        author: author || 'غير محدد',
        type,
        subjectId: subjectId || undefined,
        gradeId: gradeId || undefined,
        unitId: unitId || undefined,
        userId: currentUser.id
      });

      setProgress(85);
      setStatusText('استخراج النصوص وفهرسة الصفحات والمقاطع...');

      if (res.success) {
        setProgress(100);
        if (res.isDuplicate) {
          setDuplicateAlert('تم اكتشاف تطابق هذا الملف مع كتاب موجود مسبقاً بالمكتبة (بصمة رقمية متطابقة). تم منع التكرار وتحديث الربط.');
          showToast('هذا الملف موجود بالفعل في المكتبة الرقمية', 'info');
        } else {
          showToast(`تم رفع وفهرسة "${res.resource.title}" بنجاح!`, 'success');
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 1200);
        }
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      showToast(`فشل رفع الملف: ${err.message}`, 'error');
      setStatusText(`خطأ: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-right my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span>إضافة مصدر أو كتاب جديد للمكتبة</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              يدعم ملفات PDF، DOCX، PPTX، الصور والكتب مع الفهرسة الآلية
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {duplicateAlert && (
          <div className="mt-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">تنبيه فحص التكرار (Duplicate Detection):</p>
              <p className="mt-0.5">{duplicateAlert}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* File Picker Zone */}
          <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-950/30">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.docx,.doc,.pptx,.txt,.png,.jpg,.jpeg,.webp"
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-xs">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {file ? file.name : 'اسحب الملف إلى هنا أو انقر للاختيار'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'PDF، Word، PowerPoint، أو صور الخرائط والوثائق التعليمية'}
                </p>
              </div>
            </div>
          </div>

          {/* Metadata Fields */}
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                عنوان الكتاب أو المصدر <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: كتاب الجغرافيا الطبيعية - الصف الثاني الثانوي"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">المؤلف / الجهة</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="وزارة التعليم / مؤلف"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">نوع المصدر</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                >
                  <option value="textbook">كتاب طالب رسمي</option>
                  <option value="teacher_guide">دليل معلم</option>
                  <option value="atlas">أطلس جغرافي وخرائط</option>
                  <option value="research">بحث علمي محكم</option>
                  <option value="reference">مرجع عام</option>
                </select>
              </div>
            </div>

            {/* Classification: Subject, Grade, Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">المادة الدراسية</label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                >
                  <option value="">بدون تحديد</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الصف الدراسي</label>
                <select
                  value={gradeId}
                  onChange={(e) => setGradeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                >
                  <option value="">بدون تحديد</option>
                  {grades.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Progress Bar during upload */}
          {isUploading && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
                  <span>{statusText}</span>
                </span>
                <span className="font-bold">{progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-l from-teal-500 to-emerald-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isUploading || !file}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{isUploading ? 'جارٍ الرفع والمعالجة...' : 'بدء الرفع والفهرسة'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
