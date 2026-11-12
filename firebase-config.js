// =====================================================
// FIREBASE CONFIGURATION & SERVICE MODULE
// =====================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  writeBatch,
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL 
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";

// Firebase web app configuration for our-love-story-427
export const firebaseConfig = {
  projectId: "our-love-story-427",
  appId: "1:481708926722:web:2464d4389cf7704f78041b",
  storageBucket: "our-love-story-427.firebasestorage.app",
  apiKey: "AIzaSyBnrgcwrqvurlJJEEPm0Gn9-2zSZSjkUWU",
  authDomain: "our-love-story-427.firebaseapp.com",
  messagingSenderId: "481708926722",
  measurementId: "G-2SV2GZPDXG"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

// Whitelisted email addresses allowed to access this private space
export const ALLOWED_EMAILS = [
  "ngkahxian@gmail.com"
  // Add partner's email here if needed:
  // "partner@gmail.com"
];

export function isAllowedEmail(email) {
  if (!email) return false;
  return ALLOWED_EMAILS.map(e => e.trim().toLowerCase()).includes(email.trim().toLowerCase());
}

// Authentication Service Wrapper
export const authService = {
  async login(email, password) {
    const trimmedEmail = email.trim();
    if (!isAllowedEmail(trimmedEmail)) {
      throw new Error(`Access Denied: "${trimmedEmail}" is not an authorized email address.`);
    }
    const cred = await signInWithEmailAndPassword(auth, trimmedEmail, password);
    if (!isAllowedEmail(cred.user.email)) {
      await signOut(auth);
      throw new Error(`Access Denied: "${cred.user.email}" is not authorized.`);
    }
    return cred.user;
  },

  async register(email, password) {
    const trimmedEmail = email.trim();
    if (!isAllowedEmail(trimmedEmail)) {
      throw new Error(`Access Denied: "${trimmedEmail}" is not an authorized email address.`);
    }
    const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
    return cred.user;
  },

  async logout() {
    return await signOut(auth);
  },

  onStateChanged(callback) {
    return onAuthStateChanged(auth, async (user) => {
      if (user && !isAllowedEmail(user.email)) {
        await signOut(auth);
        callback(null, new Error(`Access Denied: "${user.email}" is not authorized.`));
      } else {
        callback(user, null);
      }
    });
  },

  getCurrentUser() {
    return auth.currentUser;
  }
};

// Firestore Database Service Wrapper
export const firestoreDb = {
  async getAllMemories() {
    const colRef = collection(firestore, "memories");
    const snapshot = await getDocs(colRef);
    const memories = [];
    snapshot.forEach((docSnap) => {
      memories.push(docSnap.data());
    });
    return memories.sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  async saveMemory(memory) {
    if (!memory || !memory.id) return;
    const docRef = doc(firestore, "memories", memory.id);
    await setDoc(docRef, memory, { merge: true });
    return memory;
  },

  async deleteMemory(id) {
    if (!id) return;
    const docRef = doc(firestore, "memories", id);
    await deleteDoc(docRef);
    return true;
  },

  async getSetting(key, defaultValue = null) {
    try {
      const docRef = doc(firestore, "settings", key);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        return data.value !== undefined ? data.value : data;
      }
      return defaultValue;
    } catch (err) {
      console.warn(`Could not get setting ${key}:`, err);
      return defaultValue;
    }
  },

  async saveSetting(key, value) {
    const docRef = doc(firestore, "settings", key);
    await setDoc(docRef, { value }, { merge: true });
    return true;
  },

  listenSetting(key, callback) {
    const docRef = doc(firestore, "settings", key);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback(data.value !== undefined ? data.value : data);
      } else {
        callback(null);
      }
    }, (error) => {
      console.warn(`Error listening to setting ${key}:`, error);
    });
  },

  async clearAll() {
    const mems = await this.getAllMemories();
    const batch = writeBatch(firestore);
    mems.forEach(m => {
      batch.delete(doc(firestore, "memories", m.id));
    });
    batch.delete(doc(firestore, "settings", "coupleSettings"));
    await batch.commit();
    return true;
  }
};

// Cloud Storage Service Wrapper for Custom Audio & Media
export const storageService = {
  async uploadMusic(file, onProgress) {
    if (!file) throw new Error("No audio file selected.");
    
    // Create unique storage path for the music
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const musicRef = ref(storage, `music/${cleanFileName}`);

    const metadata = {
      contentType: file.type || 'audio/mpeg',
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }
    };

    const uploadTask = uploadBytesResumable(musicRef, file, metadata);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(progress);
        },
        (error) => {
          console.error("Storage upload error:", error);
          reject(error);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({ downloadUrl, fileName: file.name });
          } catch (urlErr) {
            reject(urlErr);
          }
        }
      );
    });
  }
};

// Expose globally so all app components can seamlessly access
window.authService = authService;
window.firestoreDb = firestoreDb;
window.storageService = storageService;
window.isAllowedEmail = isAllowedEmail;
window.ALLOWED_EMAILS = ALLOWED_EMAILS;
