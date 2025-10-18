 // firebaseConfig.ts

// ✅ استيراد المكتبات المطلوبة
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// 💡 قم باستيراد النوع 'Analytics' من 'firebase/analytics'
import { getAnalytics, isSupported, Analytics } from "firebase/analytics"; 

// ✅ إعدادات Firebase الخاصة بمشروعك
const firebaseConfig = {
  apiKey: "AIzaSyBURbl944GjbkDvlp16L9xnoJ4m0uGKqpU",
  authDomain: "ertq-74b99.firebaseapp.com",
  projectId: "ertq-74b99",
  storageBucket: "ertq-74b99.firebasestorage.app",
  messagingSenderId: "882908229895",
  appId: "1:882908229895:web:ca61b3cbeacdb8ad88d5a2",
  measurementId: "G-NH5DK3KYB8"
};

// ✅ تهيئة التطبيق وتصديره
export const app = initializeApp(firebaseConfig);

// ✅ Firestore Database
export const db = getFirestore(app);

// 💡 تم استبدال 'any' بالنوع المحدد 'Analytics | null'
export let analytics: Analytics | null = null; 

// ✅ Analytics (فقط في المتصفح)
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// ✅ تم حل مشكلة 'Unexpected any'