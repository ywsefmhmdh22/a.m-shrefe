 'use client';
import React from "react";
import { motion } from "framer-motion";
// ✅ تم إضافة أيقونة Facebook إلى قائمة المستوردات
import { Store, Zap, Heart, Facebook } from "lucide-react"; 

export default function AboutUsPage() {
    const facebookUrl = "https://www.facebook.com/share/19yXYVR7Um/";

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
                
                {/* ======================= قسم أيقونة فيسبوك (متوهجة) ======================= */}
                <motion.div 
                    className="mt-16"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                >
                    <h2 className="text-2xl font-bold mb-4 text-gray-700 dark:text-gray-300">تابعنا على فيسبوك</h2>
                    <a 
                        href={facebookUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        aria-label="صفحتنا على فيسبوك"
                    >
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            className="inline-flex p-4 rounded-full bg-blue-600 shadow-xl transition-all duration-300 
                            // ✅ إضافة تأثير التوهج الأزرق
                            shadow-[0_0_20px_rgba(29,78,216,0.8)] hover:shadow-[0_0_40px_rgba(29,78,216,1)]"
                        >
                            <Facebook className="w-10 h-10 text-white" />
                        </motion.div>
                    </a>
                </motion.div>
                {/* ======================= نهاية قسم أيقونة فيسبوك ======================= */}

            </section>
        </main>
    );
}