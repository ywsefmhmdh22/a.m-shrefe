 // ✅ src/app/lib/firebaseConfig.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

// ✅ إعدادات Firebase الخاصة بمشروعك
const firebaseConfig = {
  apiKey: "AIzaSyBURbl944GjbkDvlp16L9xnoJ4m0uGKqpU",
  authDomain: "ertq-74b99.firebaseapp.com",
  projectId: "ertq-74b99",
  storageBucket: "ertq-74b99.appspot.com", // ✅ تم تصحيحها هنا
  messagingSenderId: "882908229895",
  appId: "1:882908229895:web:ca61b3cbeacdb8ad88d5a2",
  measurementId: "G-NH5DK3KYB8",
};

// ✅ منع التهيئة المكررة (مهم جدًا في Next.js)
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ Firestore Database
export const db = getFirestore(app);

// ✅ نظام تسجيل الدخول
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 💡 Analytics (فقط في المتصفح)
export let analytics: Analytics | null = null;

if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}
