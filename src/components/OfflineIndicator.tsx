import React, { useState, useEffect } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus.ts';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { offlineDB } from '../services/indexedDB.ts';
import { api } from '../services/api.ts';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedRecently, setSyncedRecently] = useState(false);

  // Check pending queue regularly
  useEffect(() => {
    const checkQueue = async () => {
      const pending = await offlineDB.getPendingSyncQueue();
      setPendingCount(pending.length);
    };

    checkQueue();
    const interval = setInterval(checkQueue, 4000);
    return () => clearInterval(interval);
  }, []);

  // When coming back online, auto-sync queue
  useEffect(() => {
    if (isOnline && pendingCount > 0 && !isSyncing) {
      handleManualSync();
    }
  }, [isOnline, pendingCount]);

  const handleManualSync = async () => {
    if (!isOnline) return;
    setIsSyncing(true);
    try {
      const res = await api.syncOfflineQueue();
      if (res.appliedCount > 0) {
        setSyncedRecently(true);
        setTimeout(() => setSyncedRecently(false), 4000);
      }
      const pending = await offlineDB.getPendingSyncQueue();
      setPendingCount(pending.length);
    } catch (e) {
      console.warn('Sync failed:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isOnline && pendingCount === 0 && !syncedRecently) return null;

  if (!isOnline) {
    return (
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-3 rounded-xl bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold shadow-xl border border-amber-600/30 animate-pulse">
        <WifiOff className="w-4 h-4 shrink-0 text-slate-950" />
        <div>
          <span>وضع عدم الاتصال — يمكنك تصفح الكتب المحفوظة وإعداد الدروس محلياً.</span>
          {pendingCount > 0 && (
            <span className="mr-1.5 px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 text-[10px]">
              {pendingCount} تعديلات في الانتظار
            </span>
          )}
        </div>
      </div>
    );
  }

  if (syncedRecently) {
    return (
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-4 py-2 text-xs font-semibold shadow-xl border border-emerald-500/30">
        <CheckCircle2 className="w-4 h-4" />
        <span>تمت مزامنة جميع التعديلات المحلية مع الخادم بنجاح!</span>
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2 text-xs font-semibold shadow-xl border border-slate-700">
        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          className="flex items-center gap-2 hover:text-teal-400 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-teal-400' : ''}`} />
          <span>لديك {pendingCount} تعديلات تنتظر المزامنة (اضغط هنا للمزامنة الآن)</span>
        </button>
      </div>
    );
  }

  return null;
};
