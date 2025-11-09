 "use client";
import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-100 py-16 px-6">
      
      {/* ========================================================== */}
      {/* سكريبت Google AdSense - تم إضافته هنا */}
      {/* ========================================================== */}
      <script 
        async 
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2620230909210931"
        crossOrigin="anonymous" 
      ></script>
      {/* ========================================================== */}
      
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ShieldCheck className="w-16 h-16 mx-auto text-blue-600 mb-4" />
          <h1 className="text-4xl font-extrabold mb-3">سياسة الخصوصية</h1>
          <p className="text-gray-500 dark:text-gray-400">
            نُقدّر ثقتك ونسعى لحماية خصوصيتك بأقصى قدر ممكن.
          </p>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 space-y-6 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p>
            عند استخدامك لموقعنا، قد نقوم بجمع بعض المعلومات الأساسية مثل البريد الإلكتروني أو رقم الهاتف فقط
            لغرض التواصل أو إتمام عمليات الشراء.
          </p>

          <p>
            لا نقوم بمشاركة معلوماتك الشخصية مع أي طرف ثالث دون إذنك، ونلتزم بأعلى معايير الأمان
            لحماية بياناتك من الوصول غير المصرح به.
          </p>

          <p>
            يمكنك التواصل معنا في أي وقت لطلب حذف بياناتك أو الاستفسار عن كيفية استخدامها.
          </p>

          <p className="text-blue-600 dark:text-blue-400 font-semibold">
            شكراً لثقتك بنا 💙 — نحن نعمل من أجلك.
          </p>
        </motion.div>
      </div>
    </main>
  );
}