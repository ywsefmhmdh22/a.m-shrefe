"use client";
import React from "react";
import { motion } from "framer-motion";
import { Store, Zap, Heart } from "lucide-react";

export default function AboutUsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100">
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <motion.h1
          className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          من نحن
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          نحن متجر إلكترونيات حديث نسعى لتقديم أحدث الأجهزة والتقنيات العالمية بجودة عالية وسعر منافس.  
          رؤيتنا هي أن نكون وجهتك الأولى في عالم الإلكترونيات — حيث التكنولوجيا تلتقي بالثقة.
        </motion.p>

        <div className="grid md:grid-cols-3 gap-8 mt-12">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-lg"
          >
            <Store className="w-12 h-12 mx-auto text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">منتجات أصلية</h3>
            <p className="text-gray-600 dark:text-gray-300">
              نحرص على توفير منتجات أصلية 100% من أشهر الماركات العالمية.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-lg"
          >
            <Zap className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">سرعة في التوصيل</h3>
            <p className="text-gray-600 dark:text-gray-300">
              نسعى لتوصيل طلباتكم في أسرع وقت وبأفضل تغليف ممكن.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-lg"
          >
            <Heart className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">رضا العملاء</h3>
            <p className="text-gray-600 dark:text-gray-300">
              رضا العميل هو هدفنا الأول — دعم متواصل وخدمة مميزة بعد البيع.
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
