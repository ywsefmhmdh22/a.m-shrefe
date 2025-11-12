"use client";
import React from "react";
import { motion } from "framer-motion";
import { Wrench, Package, Shield, Truck, Headset } from "lucide-react";

// تعريف البيانات لبطاقات الخدمات لتسهيل التعديل
const servicesData = [
    {
        icon: Wrench,
        title: "الصيانة والضمان الممتد",
        description: "نوفر خدمة صيانة متكاملة لجميع الأجهزة الإلكترونية التي يتم شراؤها من متجرنا. نقدم ضمانًا ممتدًا يصل إلى سنتين على منتجات مختارة، يشمل تغطية الأعطال المصنعية والتقنية. فريقنا من المهندسين المعتمدين يستخدم قطع غيار أصلية فقط لضمان عودة جهازك للعمل بأعلى كفاءة. لدينا فحص دقيق للجودة بعد كل عملية صيانة.",
        color: "text-red-500",
    },
    {
        icon: Truck,
        title: "التوصيل والشحن السريع والمؤمن",
        description: "نلتزم بتوصيل طلباتكم في أسرع وقت ممكن بفضل شراكاتنا مع كبرى شركات الشحن المحلية والدولية. يتم تغليف جميع الأجهزة بعناية فائقة لضمان وصولها سليمة 100%. نقدم خيار الشحن المؤمن الذي يحمي طلبك بالكامل ضد أي تلف أو فقدان أثناء عملية النقل. يمكنك تتبع شحنتك خطوة بخطوة من مستودعاتنا حتى عتبة بابك.",
        color: "text-green-500",
    },
    {
        icon: Headset,
        title: "الدعم الفني والتدريب",
        description: "لا يقتصر عملنا على البيع، بل نقدم دعمًا فنيًا مستمرًا بعد الشراء. يمكنك التواصل مع فريق الخبراء لدينا عبر الهاتف أو الدردشة المباشرة للحصول على إرشادات حول الإعداد، الاستخدام، واستكشاف الأخطاء وإصلاحها. كما نوفر جلسات تدريبية قصيرة ومجانية للمنتجات المعقدة لضمان استخدامك لكامل إمكانيات جهازك الجديد.",
        color: "text-blue-500",
    },
    {
        icon: Package,
        title: "خدمة استرجاع واستبدال مرنة",
        description: "نحن نثق في جودة منتجاتنا، ولذلك نقدم سياسة استرجاع واستبدال مرنة وسهلة خلال فترة تصل إلى 14 يومًا من تاريخ الشراء. إذا لم يكن المنتج مطابقًا لتوقعاتك أو وجدت به أي عيب، يمكنك إعادته أو استبداله دون تعقيدات، بشرط أن يكون في حالته الأصلية. تفاصيل السياسة موضحة بالكامل في قسم الشروط والأحكام.",
        color: "text-yellow-500",
    },
];

export default function OurServicesPage() {

    // النص التعريفي الطويل (لتلبية متطلبات أدسنس)
    const longIntroText = (
        <div className="text-right text-lg text-gray-700 dark:text-gray-300 space-y-4 mb-16 leading-relaxed">
            <h2 className="text-3xl font-bold mb-4 text-blue-600 dark:text-blue-400">مقدمة عن محفظة خدماتنا المتكاملة</h2>
            <p>
                في متجرنا **[a.m Shreif ]**، نؤمن بأن عملية شراء الأجهزة الإلكترونية هي مجرد البداية. إن القيمة الحقيقية التي نقدمها لعملائنا تكمن في **محفظة الخدمات المتكاملة** التي تحيط بالمنتج من لحظة التصفح حتى سنوات من الاستخدام. تم تصميم كل خدمة من خدماتنا بعناية لضمان راحة بالك، وزيادة عمر جهازك الافتراضي، وتقديم تجربة عملاء لا تُنسى. نحن نسعى لنتجاوز مجرد تلبية التوقعات، لنصبح شريكك التقني الموثوق على المدى الطويل.
            </p>
            <p>
                نحن ندرك التحديات التي قد تواجهها عند التعامل مع التكنولوجيا، بدءًا من اختيار المنتج المناسب ووصولًا إلى الحاجة للدعم الفني السريع والموثوق. لذلك، قمنا ببناء نظام دعم فعال يضمن لك أن تكون عملية الشراء خالية من المتاعب. من خلال تركيزنا على **الشفافية، السرعة، والجودة المطلقة** في كل خدمة نقدمها، نضمن لك استثماراً آمناً وفعّالاً في عالم الإلكترونيات الحديثة.
            </p>
            <p className="font-semibold text-gray-800 dark:text-gray-200">
                في الأقسام التالية، ستجد تفصيلاً دقيقاً لكل خدمة من خدماتنا وكيف يمكن أن تضيف قيمة حقيقية لتجربتك:
            </p>
        </div>
    );

    return (
        <main 
            className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 py-16 px-6"
            dir="rtl" // تطبيق الاتجاه العربي
        >
            <div className="max-w-6xl mx-auto">
                
                {/* ========================================================== */}
                {/* سكريبت Google AdSense - لا يلزم تعديل */}
                {/* ========================================================== */}
                <script 
                    async 
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2620230909210931"
                    crossOrigin="anonymous" 
                ></script>
                {/* ========================================================== */}
                
                <motion.div
                    className="text-center mb-10"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                >
                    <Wrench className="w-16 h-16 mx-auto text-purple-600 mb-4" />
                    <h1 className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                        خدماتنا
                    </h1>
                    <p className="text-xl max-w-3xl mx-auto text-gray-600 dark:text-gray-400">
                        تجربة الشراء لا تنتهي عند الدفع؛ نحن نقدم دعماً شاملاً لرحلتك التقنية.
                    </p>
                </motion.div>

                {/* ========================================================== */}
                {/* قسم النص الطويل المخصص لتوافق أدسنس */}
                {longIntroText}
                {/* ========================================================== */}

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {servicesData.map((service, index) => (
                        <motion.div
                            key={index}
                            className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border-t-4 border-b-4 border-transparent hover:border-blue-500 transform hover:scale-[1.02] text-right"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index, duration: 0.6 }}
                            whileHover={{ y: -5 }}
                        >
                            <service.icon className={`w-12 h-12 mb-4 ${service.color}`} />
                            <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                {service.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                <div className="text-center mt-20 p-8 bg-blue-50 dark:bg-gray-700 rounded-2xl shadow-inner">
                    <h3 className="text-2xl font-bold mb-4 text-blue-800 dark:text-blue-300">
                        لأي استفسار أو طلب خدمة خاصة
                    </h3>
                    <p className="text-lg text-gray-700 dark:text-gray-200 mb-6">
                        فريقنا جاهز دائمًا لتقديم حلول مخصصة تناسب احتياجاتك التقنية الفريدة.
                    </p>
                    <motion.a
                        href="/contact-us" // استبدلها بمسار صفحة التواصل الخاصة بك
                        className="inline-block bg-blue-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300"
                        whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(59, 130, 246, 0.4)" }}
                        whileTap={{ scale: 0.95 }}
                    >
                        تواصل مع فريق الدعم الآن
                    </motion.a>
                </div>
            </div>
        </main>
    );
}