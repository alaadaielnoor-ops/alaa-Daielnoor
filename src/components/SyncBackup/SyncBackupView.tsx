import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { BackupJob } from '../../types/index.ts';
import { offlineDB, OfflineSyncItem } from '../../services/indexedDB.ts';
import {
  Database, RefreshCw, Download, Upload, ShieldCheck,
  CheckCircle2, AlertTriangle, FileSpreadsheet, HardDrive,
  Clock, ArrowUpRight, Check
} from 'lucide-react';

export const SyncBackupView: React.FC = () => {
  const { showToast, refreshStats, currentUser } = useApp();

  const [backups, setBackups] = useState<BackupJob[]>([]);
  const [syncQueue, setSyncQueue] = useState<OfflineSyncItem[]>([]);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);

  useEffect(() => {
    loadBackupsAndQueue();
  }, []);

  const loadBackupsAndQueue = async () => {
    try {
      const [bRes, pendingItems] = await Promise.all([
        api.getBackups(),
        offlineDB.getPendingSyncQueue()
      ]);
      if (bRes.success && bRes.backups) {
        setBackups(bRes.backups);
      }
      setSyncQueue(pendingItems);
    } catch (e) {
      console.warn('Backup view load error:', e);
    }
  };

  const handleCreateBackup = async () => {
    setIsBackingUp(true);
    try {
      const res = await api.createBackup();
      if (res.success && res.backup) {
        setBackups(prev => [res.backup, ...prev]);
        showToast(`تم إنشاء النسخة الاحتياطية بنجاح (${(res.backup.sizeBytes / 1024).toFixed(1)} KB)`, 'success');
        await refreshStats();
      }
    } catch (err: any) {
      showToast(`فشل النسخ الاحتياطي: ${err.message}`, 'error');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreBackup = async (filename: string) => {
    setIsRestoring(true);
    setRestoreStatus('جارٍ فحص سلامة الملف ومطابقة البصمة الرقمية (Checksum)...');
    try {
      const res = await api.restoreBackup(filename);
      if (res.success) {
        setRestoreStatus(`تمت الاستعادة بنجاح! تم التحقق من البصمة الرقمية: ${res.verifiedChecksum ? 'سليمة ومطابقة 100%' : 'تنبيه'}`);
        showToast(res.message, 'success');
        await refreshStats();
        loadBackupsAndQueue();
      } else {
        setRestoreStatus(`فشل: ${res.message}`);
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      setRestoreStatus(`خطأ: ${err.message}`);
      showToast(err.message, 'error');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await api.syncOfflineQueue();
      showToast(`تمت مزامنة ${res.appliedCount} عملية مع الخادم المركزي`, 'success');
      loadBackupsAndQueue();
    } catch (err: any) {
      showToast(`فشلت المزامنة: ${err.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span>المزامنة والنسخ الاحتياطي والاستعادة</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            حماية بيانات المكتبة والكتب، فحص البصمة الرقمية SHA-256، ومزامنة التعديلات المحلية
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/api/backup/export?format=csv"
            download
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>تصدير CSV (Excel)</span>
          </a>

          <a
            href="/api/backup/export?format=json"
            download
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold transition"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>تصدير JSON شامل</span>
          </a>

          <button
            onClick={handleCreateBackup}
            disabled={isBackingUp}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isBackingUp ? 'animate-spin' : ''}`} />
            <span>{isBackingUp ? 'جارٍ النسخ...' : 'إنشاء نسخة احتياطية جديدة'}</span>
          </button>
        </div>
      </div>

      {restoreStatus && (
        <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-300 dark:border-teal-800 text-teal-900 dark:text-teal-100 text-xs flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
          <span>{restoreStatus}</span>
        </div>
      )}

      {/* Grid: Backup History + Offline Sync Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Backups List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-teal-600" />
              <span>سجل النسخ الاحتياطية المعتمدة (قاعدة البيانات والملفات)</span>
            </h3>
            <span className="text-xs text-slate-400 font-bold">{backups.length} نسخ محفوظة</span>
          </div>

          <div className="space-y-3">
            {backups.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <Database className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs text-slate-500">لا توجد نسخ احتياطية مسجلة. اضغط على الزر بالأعلى لإنشاء أول نسخة فورية.</p>
              </div>
            ) : (
              backups.map(b => (
                <div
                  key={b.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {b.filename}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                        مكتملة وموثقة
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                      <span>الحجم: <strong>{(b.sizeBytes / 1024).toFixed(1)} KB</strong></span>
                      <span>•</span>
                      <span>الكتب: <strong>{b.itemCounts.resources}</strong></span>
                      <span>•</span>
                      <span>الدروس: <strong>{b.itemCounts.lessons}</strong></span>
                      <span>•</span>
                      <span>التاريخ: {new Date(b.createdAt).toLocaleString('ar-SA')}</span>
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono pt-1 truncate max-w-md">
                      SHA-256: {b.checksum}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => handleRestoreBackup(b.filename)}
                        disabled={isRestoring}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition shadow-xs disabled:opacity-50"
                      >
                        {isRestoring ? 'جارٍ التحقق...' : 'استعادة واختبار'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Offline Sync Queue (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-teal-600" />
              <span>طابور المزامنة المحلية (IndexedDB)</span>
            </h3>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">العناصر في الانتظار:</span>
              <span className="font-extrabold text-slate-900 dark:text-white px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                {syncQueue.length} عمليات
              </span>
            </div>

            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
              عند انقطاع الإنترنت، يتم تخزين كافة الدروس والأنشطة والتعديلات محلياً في ذاكرة IndexedDB، وتتم المزامنة التلقائية فور توفر الاتصال دون استبدال أحدث بأقدم.
            </p>

            <button
              onClick={handleManualSync}
              disabled={isSyncing || syncQueue.length === 0}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition shadow-xs disabled:opacity-50"
            >
              {isSyncing ? 'جارٍ إرسال التعديلات...' : 'مزامنة الطابور الآن'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
