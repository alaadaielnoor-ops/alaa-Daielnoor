import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { Resource } from '../../types/index.ts';
import {
  X, Image as ImageIcon, Upload, Check, Sparkles,
  BookOpen, GraduationCap, Compass, Globe, RefreshCw,
  AlertCircle, Link as LinkIcon
} from 'lucide-react';

interface EditBookCoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: Resource | null;
  onSuccess?: () => void;
}

export const EditBookCoverModal: React.FC<EditBookCoverModalProps> = ({
  isOpen,
  onClose,
  resource,
  onSuccess
}) => {
  const { currentUser, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'upload' | 'presets' | 'url'>('upload');
  const [coverUrl, setCoverUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Curated gallery of preset official covers
  const PRESET_COVERS = [
    {
      category: 'كتب الطالب العمانية (المناهج الدراسية)',
      covers: [
        { name: 'كتاب الطالب - الصف الأول الأساسي', url: '/covers/cover_om_grd1_tb.svg' },
        { name: 'كتاب الطالب - الصف الثاني الأساسي', url: '/covers/cover_om_grd2_tb.svg' },
        { name: 'كتاب الطالب - الصف الثالث الأساسي', url: '/covers/cover_om_grd3_tb.svg' },
        { name: 'كتاب الطالب - الصف الرابع الأساسي', url: '/covers/cover_om_grd4_tb.svg' },
        { name: 'كتاب الطالب - الصف الخامس الأساسي', url: '/covers/cover_om_grd5_tb.svg' },
        { name: 'كتاب الطالب - الصف السادس الأساسي', url: '/covers/cover_om_grd6_tb.svg' },
        { name: 'كتاب الطالب - الصف السابع الأساسي', url: '/covers/cover_om_grd7_tb.svg' },
        { name: 'كتاب الطالب - الصف الثامن الأساسي', url: '/covers/cover_om_grd8_tb.svg' },
        { name: 'كتاب الطالب - الصف التاسع الأساسي', url: '/covers/cover_om_grd9_tb.svg' },
        { name: 'كتاب الطالب - الصف العاشر الأساسي', url: '/covers/cover_om_grd10_tb.svg' },
        { name: 'كتاب الجغرافيا والتقنيات الحديثة - الصف 11', url: '/covers/cover_om_grd11_tb.svg' },
        { name: 'كتاب هذا وطني - الصف الثاني عشر', url: '/covers/cover_om_grd12_tb.svg' },
        { name: 'كتاب الجغرافيا الاقتصادية - الصف 12', url: '/covers/cover_om_econ12_tb.svg' },
      ]
    },
    {
      category: 'أدلة المعلم العمانية المعتمدة',
      covers: [
        { name: 'دليل المعلم - الصف الأول الأساسي', url: '/covers/cover_om_grd1_tg.svg' },
        { name: 'دليل المعلم - الصف الثاني الأساسي', url: '/covers/cover_om_grd2_tg.svg' },
        { name: 'دليل المعلم - الصف الثالث الأساسي', url: '/covers/cover_om_grd3_tg.svg' },
        { name: 'دليل المعلم - الصف الرابع الأساسي', url: '/covers/cover_om_grd4_tg.svg' },
        { name: 'دليل المعلم - الصف الخامس الأساسي', url: '/covers/cover_om_grd5_tg.svg' },
        { name: 'دليل المعلم - الصف السادس الأساسي', url: '/covers/cover_om_grd6_tg.svg' },
        { name: 'دليل المعلم - الصف السابع الأساسي', url: '/covers/cover_om_grd7_tg.svg' },
        { name: 'دليل المعلم - الصف الثامن الأساسي', url: '/covers/cover_om_grd8_tg.svg' },
        { name: 'دليل المعلم - الصف التاسع الأساسي', url: '/covers/cover_om_grd9_tg.svg' },
        { name: 'دليل المعلم - الصف العاشر الأساسي', url: '/covers/cover_om_grd10_tg.svg' },
        { name: 'دليل المعلم - الجغرافيا ونظم GIS (الصف 11)', url: '/covers/cover_om_grd11_tg.svg' },
        { name: 'دليل المعلم - هذا وطني (الصف 12)', url: '/covers/cover_om_grd12_tg.svg' },
        { name: 'دليل المعلم - الجغرافيا الاقتصادية (الصف 12)', url: '/covers/cover_om_econ12_tg.svg' },
      ]
    },
    {
      category: 'الأطلس والخرائط الجغرافية',
      covers: [
        { name: 'أطلس سلطنة عمان المدرسي المصور والخرائط', url: '/covers/cover_om_atlas.svg' },
      ]
    },
    {
      category: 'المراجع والكتب التربوية العمانية',
      covers: [
        { name: 'فلسفة التعليم في سلطنة عُمان وتطبيقاتها الحديثة', url: '/covers/cover_ped_om_01.svg' },
        { name: 'دليل استراتيجيات التدريس والتعلم النشط', url: '/covers/cover_ped_om_02.svg' },
        { name: 'المعايير المهنية الوطنية للمعلمين وقادة المدارس', url: '/covers/cover_ped_om_03.svg' },
        { name: 'دليل التقويم التربوي الشامل والمستمر في التعليم', url: '/covers/cover_ped_om_04.svg' },
        { name: 'تاريخ التعليم في عُمان: مسيرة التطوير والنهضة', url: '/covers/cover_ped_om_05.svg' },
      ]
    },
    {
      category: 'المراجع التربوية العالمية باللغة العربية',
      covers: [
        { name: 'نظريات التعلم الحديثة وتطبيقاتها الصفية', url: '/covers/cover_ped_glb_01.svg' },
        { name: 'تصميم التدريس الفعال: مدخل النظم ومنهجية ADDIE', url: '/covers/cover_ped_glb_02.svg' },
        { name: 'بيداغوجيا التفكير: تصنيف بلوم المطور لمهارات التفكير', url: '/covers/cover_ped_glb_03.svg' },
        { name: 'الإدارة الصفية الفعالة وبناء بيئة التعلم الإيجابية', url: '/covers/cover_ped_glb_04.svg' },
        { name: 'الفهم عن طريق التصميم (UbD) والتقويم البديل', url: '/covers/cover_ped_glb_05.svg' },
        { name: 'دمج التقنية والذكاء الاصطناعي في التعليم: نموذج SAMR', url: '/covers/cover_ped_glb_06.svg' },
      ]
    }
  ];

  useEffect(() => {
    if (isOpen && resource) {
      setCoverUrl(resource.coverImageUrl || '');
      setPreviewUrl(resource.coverImageUrl || '');
      setTitle(resource.title || '');
      setAuthor(resource.author || '');
      setError(null);
    }
  }, [isOpen, resource]);

  if (!isOpen || !resource) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('يرجى اختيار ملف صورة صالح (JPEG, PNG, WEBP, SVG)');
      return;
    }

    setUploading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        setPreviewUrl(base64);

        // Upload to server
        const res = await api.uploadImage(base64, file.name, 'cover');
        if (res.success && res.url) {
          setCoverUrl(res.url);
          setPreviewUrl(res.url);
          showToast('تم تحميل صورة الغلاف بنجاح', 'success');
        } else {
          // Fallback to base64 dataUrl
          setCoverUrl(base64);
        }
      } catch (err: any) {
        console.warn('Upload error, using local base64 preview:', err);
        setCoverUrl(reader.result as string);
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => {
      setError('فشلت قراءة ملف الصورة');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await api.updateResource(
        resource.id,
        {
          coverImageUrl: coverUrl.trim() || undefined,
          title: title.trim() || resource.title,
          author: author.trim() || resource.author
        },
        currentUser.id
      );

      if (res.success) {
        showToast(`تم تحديث صورة غلاف "${res.resource.title}" بنجاح`, 'success');
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'فشل حفظ صورة الغلاف');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 md:p-6 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-right">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-xs">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                تعديل وإضافة صورة الغلاف للكتاب / المرجع
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-sm">
                {resource.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* Main Book Preview & Selector Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Book 3D Mockup Preview */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-bold text-slate-500 mb-2">معاينة الغلاف الحالي</span>
              <div className="relative w-36 h-52 rounded-xl overflow-hidden shadow-xl ring-2 ring-teal-500/30 bg-slate-200 dark:bg-slate-800 transition transform hover:scale-105 duration-200">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={title || 'غلاف الكتاب'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={() => {
                      // Fallback if image load errors
                      setPreviewUrl('/covers/cover_om_grd5_tb.svg');
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center text-slate-400 bg-slate-100 dark:bg-slate-800">
                    <BookOpen className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-[11px]">لا يوجد غلاف محدد</span>
                  </div>
                )}
                <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/30 to-transparent pointer-events-none" />
              </div>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold mt-3">
                {previewUrl ? 'غلاف مفعل ومطابق' : 'اختر صورة من الخيارات'}
              </span>
            </div>

            {/* Methods Tabs & Controls */}
            <div className="md:col-span-2 space-y-4">
              {/* Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'upload'
                      ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>رفع من الجهاز</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('presets')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'presets'
                      ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>معرض الأغلفة المعتمدة</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('url')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'url'
                      ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>رابط خارجي</span>
                </button>
              </div>

              {/* Tab 1: Upload */}
              {activeTab === 'upload' && (
                <div className="space-y-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-teal-400/50 hover:border-teal-500 dark:border-teal-800 rounded-2xl p-6 text-center cursor-pointer bg-teal-50/40 dark:bg-teal-950/20 hover:bg-teal-50/70 transition"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 flex items-center justify-center mx-auto mb-3 shadow-xs">
                      {uploading ? (
                        <RefreshCw className="w-6 h-6 animate-spin" />
                      ) : (
                        <Upload className="w-6 h-6" />
                      )}
                    </div>
                    <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                      {uploading ? 'جاري رفع صورة الغلاف...' : 'اضغط لاختيار صورة غلاف من جهازك'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      يدعم صور الكتب والأغلفة بصيغ PNG, JPEG, WEBP, SVG حتى 50 ميجابايت
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 2: Presets */}
              {activeTab === 'presets' && (
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {PRESET_COVERS.map((cat, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <span className="text-[11px] font-black text-slate-500 block">
                        {cat.category}
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {cat.covers.map((c, i) => (
                          <button
                            type="button"
                            key={i}
                            onClick={() => {
                              setCoverUrl(c.url);
                              setPreviewUrl(c.url);
                            }}
                            className={`p-2 rounded-xl border text-right flex items-center gap-2 transition text-xs font-bold ${
                              coverUrl === c.url
                                ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-800 dark:text-teal-200 shadow-xs ring-1 ring-teal-500'
                                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-400'
                            }`}
                          >
                            <img
                              src={c.url}
                              alt={c.name}
                              className="w-7 h-10 object-cover rounded-sm shadow-xs shrink-0"
                            />
                            <span className="truncate text-[11px]">{c.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: URL */}
              {activeTab === 'url' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    أدخل رابط الصورة المباشر:
                  </label>
                  <input
                    type="text"
                    value={coverUrl}
                    onChange={(e) => {
                      setCoverUrl(e.target.value);
                      setPreviewUrl(e.target.value);
                    }}
                    placeholder="https://example.com/cover.jpg أو /covers/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500 font-mono text-[11px]"
                  />
                  <p className="text-[10px] text-slate-400">
                    يمكنك إدخال رابط لأي صورة من الإنترنت وسيتم ربطها مباشرة كغلاف لهذا الكتاب.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Metadata quick edits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                عنوان الكتاب / المرجع
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                المؤلف / الجهة
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black transition flex items-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'جاري الحفظ...' : 'حفظ وتثبيت الغلاف'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
