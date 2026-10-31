import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { Bookmark, Resource } from '../../types/index.ts';
import {
  Bookmark as BookmarkIcon, BookOpen, Trash2,
  ExternalLink, Plus, Star, X
} from 'lucide-react';

export const BookmarksView: React.FC = () => {
  const { currentUser, showToast, setSelectedResourceIdForPreview, setActiveView } = useApp();

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newResourceId, setNewResourceId] = useState('');
  const [newPageNum, setNewPageNum] = useState(1);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    loadBookmarksAndResources();
  }, []);

  const loadBookmarksAndResources = async () => {
    try {
      const [bmRes, recRes] = await Promise.all([
        api.getBookmarks(currentUser.id),
        api.getResources()
      ]);
      if (bmRes.success && bmRes.bookmarks) {
        setBookmarks(bmRes.bookmarks);
      }
      if (recRes.success && recRes.resources) {
        setResources(recRes.resources);
        if (recRes.resources.length > 0) {
          setNewResourceId(recRes.resources[0].id);
        }
      }
    } catch (e) {
      console.warn('Bookmarks load error:', e);
    }
  };

  const handleAddBookmark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newResourceId) return;

    try {
      const res = await api.addBookmark({
        userId: currentUser.id,
        resourceId: newResourceId,
        pageNumber: newPageNum,
        title: newTitle.trim(),
        note: newNote.trim() || undefined,
        color: '#0d9488'
      });

      if (res.success && res.bookmark) {
        setBookmarks(prev => [res.bookmark, ...prev]);
        setShowAddModal(false);
        setNewTitle('');
        setNewNote('');
        showToast('تمت إضافة الإشارة المرجعية بنجاح!', 'success');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteBookmark(id);
      setBookmarks(prev => prev.filter(b => b.id !== id));
      showToast('تم حذف الإشارة المرجعية', 'info');
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
            <BookmarkIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span>المفضلة والإشارات المرجعية والملاحظات</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            صفحات الكتب المميزة وملاحظات المعلم السريعة مع إمكانية الانتقال المباشر للمصدر
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة إشارة مرجعية</span>
        </button>
      </div>

      {bookmarks.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <BookmarkIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">لا توجد إشارات مرجعية محفوظة</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            احفظ الصفحات الهامة وأفكار الأنشطة أثناء تصفح الكتب للرجوع إليها بضغطة زر.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {bookmarks.map(bm => {
            const res = resources.find(r => r.id === bm.resourceId);

            return (
              <div
                key={bm.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 transition shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[10px] font-bold">
                      صفحة {bm.pageNumber}
                    </span>
                    <button
                      onClick={() => handleDelete(bm.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                    {bm.title}
                  </h3>

                  {res && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      الكتاب: {res.title}
                    </p>
                  )}

                  {bm.note && (
                    <p className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {bm.note}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                  <button
                    onClick={() => {
                      if (bm.resourceId) {
                        setSelectedResourceIdForPreview(bm.resourceId);
                        setActiveView('library');
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-bold transition"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>فتح الصفحة الآن</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-right space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">إضافة إشارة مرجعية جديدة</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBookmark} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">عنوان الملاحظة</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: تعريف الغلاف الموري وأسئلة الاختبار"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الكتاب المصدر</label>
                <select
                  value={newResourceId}
                  onChange={(e) => setNewResourceId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                >
                  {resources.map(r => (
                    <option key={r.id} value={r.id}>{r.title.slice(0, 40)}...</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">رقم الصفحة</label>
                <input
                  type="number"
                  min={1}
                  value={newPageNum}
                  onChange={(e) => setNewPageNum(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ملاحظة المعلم</label>
                <textarea
                  rows={3}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="تدوين فكرة نشاط أو معلومة إثرائية..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-500">
                  إلغاء
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition">
                  حفظ الإشارة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
