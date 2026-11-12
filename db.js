// =====================================================
// OUR LOVE STORY - DATABASE ADAPTER (FIRESTORE + INDEXEDDB)
// =====================================================
// Firestore is used for all memories & settings (synced across devices)
// IndexedDB is retained for local media/audio caching

const DB_NAME = 'OurLoveStoryDB';
const DB_VERSION = 2;
const STORE_NAME = 'memories';
const SETTINGS_STORE = 'settings';
const MEDIA_STORE = 'media';

class LoveStoryDB {
  constructor() {
    this.indexedDb = null;
  }

  async init() {
    if (this.indexedDb) return this.indexedDb;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
          db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains(MEDIA_STORE)) {
          db.createObjectStore(MEDIA_STORE, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        this.indexedDb = event.target.result;
        resolve(this.indexedDb);
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  // --- Local Media (Large MP3 audio blobs) ---
  async saveMedia(id, blobOrData) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.indexedDb.transaction([MEDIA_STORE], 'readwrite');
      const store = tx.objectStore(MEDIA_STORE);
      const request = store.put({ id, data: blobOrData });

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async getMedia(id) {
    await this.init();
    return new Promise((resolve) => {
      const tx = this.indexedDb.transaction([MEDIA_STORE], 'readonly');
      const store = tx.objectStore(MEDIA_STORE);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result ? request.result.data : null);
      };
      request.onerror = () => resolve(null);
    });
  }

  // --- Memories (Firestore Backend) ---
  async getAllMemories() {
    if (window.firestoreDb) {
      try {
        const firestoreMemories = await window.firestoreDb.getAllMemories();
        if (firestoreMemories && firestoreMemories.length > 0) {
          return firestoreMemories;
        }
      } catch (err) {
        console.warn('Firestore getAllMemories error, falling back to local cache:', err);
      }
    }

    // Fallback to local IndexedDB if offline or Firestore empty
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.indexedDb.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveMemory(memory) {
    // 1. Save to Firestore
    if (window.firestoreDb) {
      try {
        await window.firestoreDb.saveMemory(memory);
      } catch (err) {
        console.warn('Firestore saveMemory error:', err);
      }
    }

    // 2. Also cache locally in IndexedDB
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.indexedDb.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(memory);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteMemory(id) {
    // 1. Delete from Firestore
    if (window.firestoreDb) {
      try {
        await window.firestoreDb.deleteMemory(id);
      } catch (err) {
        console.warn('Firestore deleteMemory error:', err);
      }
    }

    // 2. Delete locally in IndexedDB
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.indexedDb.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  // --- Settings (Firestore Backend) ---
  async getSetting(key, defaultValue = null) {
    if (window.firestoreDb) {
      try {
        const val = await window.firestoreDb.getSetting(key);
        if (val !== null && val !== undefined) {
          return val;
        }
      } catch (err) {
        console.warn(`Firestore getSetting ${key} error:`, err);
      }
    }

    // Fallback to IndexedDB
    await this.init();
    return new Promise((resolve) => {
      const tx = this.indexedDb.transaction([SETTINGS_STORE], 'readonly');
      const store = tx.objectStore(SETTINGS_STORE);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result ? request.result.value : defaultValue);
      };
      request.onerror = () => resolve(defaultValue);
    });
  }

  async saveSetting(key, value) {
    // 1. Save to Firestore
    if (window.firestoreDb) {
      try {
        await window.firestoreDb.saveSetting(key, value);
      } catch (err) {
        console.warn(`Firestore saveSetting ${key} error:`, err);
      }
    }

    // 2. Save locally in IndexedDB
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.indexedDb.transaction([SETTINGS_STORE], 'readwrite');
      const store = tx.objectStore(SETTINGS_STORE);
      const request = store.put({ key, value });

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async clearAll() {
    if (window.firestoreDb) {
      try {
        await window.firestoreDb.clearAll();
      } catch (err) {
        console.warn('Firestore clearAll error:', err);
      }
    }

    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.indexedDb.transaction([STORE_NAME, SETTINGS_STORE], 'readwrite');
      tx.objectStore(STORE_NAME).clear();
      tx.objectStore(SETTINGS_STORE).clear();
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }
}

const db = new LoveStoryDB();
window.db = db;
