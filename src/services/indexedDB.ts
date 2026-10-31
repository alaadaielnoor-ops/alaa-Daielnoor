/**
 * Client-Side IndexedDB Storage & Offline Sync Engine
 * Provides persistent offline access to resources, lessons, worksheets,
 * and queues mutations created while disconnected.
 */

const DB_NAME = 'SmartLibraryOfflineDB';
const DB_VERSION = 2;

export interface OfflineSyncItem {
  id: string;
  entityType: 'lesson' | 'worksheet' | 'assessment' | 'bookmark' | 'resource';
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  payload: any;
  clientTimestamp: string;
  status: 'pending' | 'syncing' | 'failed';
}

class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private isReadyPromise: Promise<IDBDatabase>;

  constructor() {
    this.isReadyPromise = this.initDB();
  }

  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB not supported in this environment'));
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Offline resources store
        if (!db.objectStoreNames.contains('resources')) {
          db.createObjectStore('resources', { keyPath: 'id' });
        }
        // Offline lessons store
        if (!db.objectStoreNames.contains('lessons')) {
          db.createObjectStore('lessons', { keyPath: 'id' });
        }
        // Offline worksheets store
        if (!db.objectStoreNames.contains('worksheets')) {
          db.createObjectStore('worksheets', { keyPath: 'id' });
        }
        // Offline assessments store
        if (!db.objectStoreNames.contains('assessments')) {
          db.createObjectStore('assessments', { keyPath: 'id' });
        }
        // Offline sync queue
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          syncStore.createIndex('status', 'status', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB open error:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  private async getStore(storeName: string, mode: IDBTransactionMode): Promise<IDBObjectStore> {
    const db = await this.isReadyPromise;
    const tx = db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  }

  // --- Generic Store Operations ---
  public async setItem(storeName: string, item: any): Promise<void> {
    try {
      const store = await this.getStore(storeName, 'readwrite');
      return new Promise((resolve, reject) => {
        const req = store.put(item);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn(`IndexedDB setItem error on ${storeName}:`, e);
    }
  }

  public async getItem(storeName: string, key: string): Promise<any> {
    try {
      const store = await this.getStore(storeName, 'readonly');
      return new Promise((resolve, reject) => {
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn(`IndexedDB getItem error on ${storeName}:`, e);
      return null;
    }
  }

  public async getAll(storeName: string): Promise<any[]> {
    try {
      const store = await this.getStore(storeName, 'readonly');
      return new Promise((resolve, reject) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn(`IndexedDB getAll error on ${storeName}:`, e);
      return [];
    }
  }

  // --- Sync Queue Operations ---
  public async queueMutation(
    entityType: OfflineSyncItem['entityType'],
    entityId: string,
    operation: OfflineSyncItem['operation'],
    payload: any
  ): Promise<OfflineSyncItem> {
    const item: OfflineSyncItem = {
      id: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      entityType,
      entityId,
      operation,
      payload,
      clientTimestamp: new Date().toISOString(),
      status: 'pending'
    };
    await this.setItem('syncQueue', item);
    return item;
  }

  public async getPendingSyncQueue(): Promise<OfflineSyncItem[]> {
    const all = await this.getAll('syncQueue');
    return all.filter(item => item.status === 'pending');
  }

  public async removeSyncItem(id: string): Promise<void> {
    try {
      const store = await this.getStore('syncQueue', 'readwrite');
      return new Promise((resolve, reject) => {
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('IndexedDB removeSyncItem error:', e);
    }
  }

  public async clearSyncQueue(): Promise<void> {
    try {
      const store = await this.getStore('syncQueue', 'readwrite');
      return new Promise((resolve, reject) => {
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('IndexedDB clearSyncQueue error:', e);
    }
  }
}

export const offlineDB = new IndexedDBManager();
