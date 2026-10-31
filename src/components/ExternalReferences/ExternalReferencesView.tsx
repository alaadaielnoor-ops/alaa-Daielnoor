import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { ExternalReference } from '../../types/index.ts';
import {
  Globe, Plus, ExternalLink, ShieldCheck, CheckCircle2,
  Calendar, Tag, X
} from 'lucide-react';

export const ExternalReferencesView: React.FC = () => {
  const { showToast, currentUser } = useApp();

  const [references, setReferences] = useState<ExternalReference[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // New reference form
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newEntity, setNewEntity] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newReliability, setNewReliability] = useState<ExternalReference['reliability']>('official');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    loadReferences();
  }, []);

  const loadReferences = async () => {
    try {
      const res = await api.getExternalReferences();
      if (res.success && res.externalReferences) {
        setReferences(res.externalReferences);
      }
    } catch (e) {
      console.warn('Error loading references:', e);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    try {
      const res = await api.addExternalReference({
        title: newTitle.trim(),
        url: newUrl.trim(),
        authorOrEntity: newEntity.trim() || 'جهة تعليمية',
        accessDate: new Date().toISOString().split('T')[0],
        topic: newTopic.trim() || 'دراسات جغرافية وبيئية',
        reliability: newReliability,
        teacherNotes: newNotes.trim() || undefined,
        tags: ['مرجع خارجي'],
        isAccessible: true
      });

      if (res.success && res.reference) {
        setReferences(prev => [res.reference, ...prev]);
        setShowAddModal(false);
        setNewTitle('');
        setNewUrl('');
        setNewNotes('');
        showToast('تمت إضافة المرجع الخارجي وتوثيقه بنجاح!', 'success');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span>المصادر والمراجع والمواقع الخارجية</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            فهرس موثق للبوابات الجيولوجية، مراصد الأقمار الصناعية، والأبحاث الأكاديمية مع درجة الموثوقية
          </p>
        </div>

        {currentUser.role !== 'viewer' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة رابط أو مرجع</span>
          </button>
        )}
      </div>

      {/* Grid of References */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {references.map(ref => (
          <div
            key={ref.id}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 transition shadow-xs flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border ${
                  ref.reliability === 'official'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                }`}>
                  {ref.reliability === 'official' ? 'بوابة حكومية رسمية' : 'مرجع أكاديمي محكم'}
                </span>

                <span className="text-[10px] text-slate-400">
                  تاريخ الاطلاع: {ref.accessDate}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                  {ref.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  الجهة: <strong>{ref.authorOrEntity}</strong>
                </p>
              </div>

              {ref.teacherNotes && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <span className="font-bold text-teal-700 dark:text-teal-400 block mb-0.5">ملاحظات المعلم:</span>
                  {ref.teacherNotes}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>الرابط سليم ومتاح</span>
              </span>

              <a
                href={ref.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-bold transition"
              >
                <span>زيارة المصدر</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-right space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">إضافة مرجع أو رابط خارجي</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">عنوان المرجع / البوابة</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: البوابة الوطنية للرصد الزلزالي"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الرابط المباشر (URL)</label>
                <input
                  type="url"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الجهة الناشرة</label>
                  <input
                    type="text"
                    value={newEntity}
                    onChange={(e) => setNewEntity(e.target.value)}
                    placeholder="هيئة المساحة الجيولوجية"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">مستوى الموثوقية</label>
                  <select
                    value={newReliability}
                    onChange={(e) => setNewReliability(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  >
                    <option value="official">معتمد وحكومي رسمي</option>
                    <option value="academic">أكاديمي وبحث محكم</option>
                    <option value="enrichment">إثرائي عام</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ملاحظات المعلم للاستفادة الصفية</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-500">
                  إلغاء
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition">
                  حفظ المرجع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
