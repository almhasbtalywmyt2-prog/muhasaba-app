// ============================================
// إعداد Firebase - قاعدة البيانات السحابية
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue, child } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBrV4dyw5FUQYWDlma4_7rk4f8TdVCtAQ4",
    authDomain: "add-project-18724.firebaseapp.com",
    databaseURL: "https://add-project-18724-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "add-project-18724",
    storageBucket: "add-project-18724.firebasestorage.app",
    messagingSenderId: "1084230096527",
    appId: "1:1084230096527:web:fa1a57df9b7dbba089c2fa"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- وظائف المساعدة ---

// حفظ مصفوفة في Firebase
export async function fbSet(path, data) {
    try {
        await set(ref(db, path), data);
    } catch (e) {
        console.error("Firebase write error:", e);
    }
}

// قراءة مرة واحدة من Firebase
export async function fbGet(path, defaultVal = null) {
    try {
        const snap = await get(child(ref(db), path));
        if (snap.exists()) {
            const val = snap.val();
            // Firebase يحوّل المصفوفات إلى objects أحياناً
            if (Array.isArray(defaultVal) && val && typeof val === 'object' && !Array.isArray(val)) {
                return Object.values(val);
            }
            return val;
        }
        return defaultVal;
    } catch (e) {
        console.error("Firebase read error:", e);
        return defaultVal;
    }
}

// الاستماع للتغييرات في الوقت الفعلي
export function fbListen(path, callback) {
    onValue(ref(db, path), (snap) => {
        const val = snap.val();
        callback(val);
    });
}

export { db, ref, set, get, onValue };
