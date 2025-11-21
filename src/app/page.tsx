 'use client'; // 🚀 يجب أن يكون هذا التوجيه هو السطر الأول في الملف!

import React, { useState } from 'react';
import Link from 'next/link';
import {
    Menu,
    MessageSquare,
    Users,
    BookOpen,
    Receipt,
    Grid,
    Newspaper,
    Brain,
    Globe,
    Shield, // بديل جيد للأيقونات المحذوفة
    Cpu,    // بديل آخر
} from 'lucide-react';

// ----------------------------------------------------
// 🌟 المكون الوهمي للعمق البصري (3D Reactor Visual)
const HeroReactorVisual: React.FC = () => (
    <div className="absolute inset-0 z-0 opacity-40 overflow-hidden pointer-events-none">
        <div className="w-full h-full flex items-center justify-center relative">
            {/* الخلفية الشبكية المتحركة */}
            <div className="absolute inset-0 z-0 opacity-10" style={{
                backgroundImage: 'linear-gradient(to right, #e0e7ff 1px, transparent 1px), linear-gradient(to bottom, #e0e7ff 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                animation: 'grid-pan 60s linear infinite'
            }}></div>

            {/* نواة المفاعل المركزية */}
            <div
                className="w-80 h-80 rounded-full bg-gradient-radial from-blue-400/30 via-purple-400/20 to-transparent blur-3xl opacity-50 animate-pulse-slow"
                style={{ animationDuration: '8s' }}
            ></div>

            {/* حلقات طاقة متوهجة */}
            <div className="absolute w-40 h-40 border-2 border-blue-300 rounded-full animate-spin-fast blur-sm opacity-50" style={{ animationDuration: '10s' }}></div>
            <div className="absolute w-60 h-60 border-2 border-purple-300 rounded-full animate-spin-reverse-fast blur-sm opacity-50" style={{ animationDuration: '12s' }}></div>
            <div className="absolute w-80 h-80 border-2 border-green-300 rounded-full animate-spin-fast blur-sm opacity-50" style={{ animationDuration: '14s' }}></div>

            {/* جزيئات متوهجة */}
            {[...Array(20)].map((_, i) => (
                <div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-blue-500 opacity-0 animate-sparkle"
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${3 + Math.random() * 5}s`,
                        boxShadow: '0 0 8px 4px rgba(0,100,255,0.5)',
                    }}
                ></div>
            ))}

            <style jsx global>{`
                @keyframes grid-pan {
                    from { background-position: 0 0; }
                    to { background-position: -4000px -4000px; }
                }
                @keyframes pulse-slow {
                    0%, 100% { transform: scale(0.95); opacity: 0.6; }
                    50% { transform: scale(1.05); opacity: 0.8; }
                }
                @keyframes spin-fast {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes spin-reverse-fast {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }
                @keyframes sparkle {
                    0% { transform: scale(0) translateY(0px); opacity: 0; }
                    20% { transform: scale(1) translateY(-10px); opacity: 1; }
                    80% { transform: scale(0.5) translateY(10px); opacity: 0.5; }
                    100% { transform: scale(0) translateY(20px); opacity: 0; }
                }
            `}</style>
        </div>
    </div>
);

// ----------------------------------------------------
// 🛠️ المكون SideMenu - تم تعديل الروابط لتناسب المدونة
const SideMenu: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const staticLinks = [
        { name: 'الرئيسية', href: '#hero', icon: Grid },
        { name: 'مستقبل التقنية', href: '#blog-intro', icon: Newspaper },
        { name: 'الذكاء الاصطناعي', href: '#ai-future', icon: Brain },
        { name: 'التجارة الإلكترونية', href: '#ecommerce-strategy', icon: Globe },
        { name: 'تواصل معنا', href: '/contact-us', icon: MessageSquare },
        { name: 'من نحن', href: '/about-us', icon: Users },
        { name: 'سياسة الخصوصية', href: '/privacy-policy', icon: BookOpen },
    ];

    return (
        <>
            <button
                className="fixed top-4 right-4 z-50 p-3 rounded-full bg-gradient-to-br from-purple-500 via-blue-600 to-green-400 text-white shadow-[0_0_25px_rgba(0,150,255,0.8)] transition-all duration-500 hover:scale-110"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="قائمة التنقل"
            >
                <Menu className="w-6 h-6" />
            </button>

            <nav
                className={`fixed top-0 right-0 h-full w-72 bg-white/95 backdrop-blur-lg shadow-[0_0_60px_rgba(0,100,255,0.4)] z-40 transform transition-transform duration-700 ease-in-out border-l border-blue-400 ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="p-6 pt-20">
                    <h2 className="text-3xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 tracking-wider border-b border-gray-200 pb-2 shadow-text-neon">
                        A.M Shreif <span className="text-green-600">Blog</span>
                    </h2>
                    <ul className="space-y-4">
                        {staticLinks.map((link) => (
                            <li key={link.name}>
                                <Link href={link.href} onClick={() => setIsOpen(false)}>
                                    <div className="flex items-center p-3 rounded-xl text-lg font-medium text-gray-800 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 transition duration-300 transform hover:translate-x-2 shadow-md border border-gray-100 cursor-pointer group">
                                        <link.icon className="w-5 h-5 ml-3 text-blue-500 group-hover:text-purple-600 transition-colors" />
                                        {link.name}
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity duration-500"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}
        </>
    );
};

// ====================================================================================
// 📝 أقسام المدونة والمحتوى (تم تحسين النصوص وإصلاح الرموز)
// ====================================================================================

// 1. مقدمة المدونة
const BlogIntroSection: React.FC = () => (
    <section id="blog-intro" className="max-w-6xl mx-auto px-4 py-16 relative z-10">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 lg:p-12 shadow-2xl border-t-4 border-purple-500">
            <h2 className="text-4xl font-extrabold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <Newspaper className="w-8 h-8 ml-3 text-purple-600" /> رؤى نحو المستقبل الرقمي
            </h2>
            <p className="text-lg text-gray-700 text-center mb-8 border-b pb-4 leading-relaxed">
                في هذا القسم، نتعمق في أهم القضايا التكنولوجية التي تشكل عالمنا اليوم وغدًا. استكشف معنا أسرار الذكاء الاصطناعي، واستراتيجيات التجارة الإلكترونية، وأحدث تقنيات الأمن السيبراني.
            </p>

            <article className="space-y-6 text-gray-800 leading-loose text-justify">
                <h3 className="text-2xl font-bold text-blue-700 mt-6">القفزة النوعية في عالم الإلكترونيات</h3>
                <p>
                    نعيش في عصر تتسارع فيه وتيرة التطور التكنولوجي بشكل لم يسبق له مثيل. إن كل جهاز إلكتروني، من الهاتف الذكي في جيبك إلى الحواسيب العملاقة التي تدير مراكز البيانات، يمثل قفزة نوعية في تاريخ البشرية. هذه الثورة ليست مجرد تحديثات سنوية للأجهزة، بل هي إعادة تعريف لكيفية تفاعلنا، وعملنا، وحتى تفكيرنا. لقد أصبح الاتصال الفوري، والوصول غير المحدود إلى المعلومات، والقدرة على إنشاء محتوى رقمي متقدم، أمراً مسلماً به.
                </p>
                <p>
                    <span className="font-bold text-purple-600">الترابط اللامحدود:</span> لم تعد الأجهزة معزولة. إنها تتحدث مع بعضها البعض عبر شبكة الإنترنت للأشياء (IoT)، مما يخلق بيئة ذكية تتكيف مع احتياجات المستخدم. في المنازل الذكية، تعمل الكاميرات، والمستشعرات، وأجهزة التحكم في المناخ بشكل متناغم.
                </p>

                <h3 className="text-2xl font-bold text-blue-700 mt-6">التصميم المستقبلي وفلسفة النيون</h3>
                <p>
                    نحن في A.M Shreif Hub نؤمن بأن التكنولوجيا فن. إن التصميم المستقبلي المستوحى من فن النيون والـ <strong>Cyberpunk Aesthetics</strong> يعكس تداخل التكنولوجيا المتطورة مع الحياة اليومية بطريقة بصرية ساحرة ومبهرة. هذه الجمالية ليست مجرد ألوان متوهجة، بل هي رمز للعصر الرقمي الذي نعيشه.
                </p>
                <p>
                    يمثل اللون الأزرق <strong>الثقة</strong> و <strong>التقنية</strong>، بينما يمثل اللون الأرجواني <strong>الابتكار</strong> و <strong>الغموض</strong>. هذه الألوان تحاكي واجهات البرامج المتقدمة وخطوط الكود المتدفقة.
                </p>
            </article>
        </div>
    </section>
);

// 2. مقال الذكاء الاصطناعي
const AiAndFutureSection: React.FC = () => (
    <section id="ai-future" className="max-w-6xl mx-auto px-4 py-16 relative z-10">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 lg:p-12 shadow-2xl border-t-4 border-blue-500">
            <h2 className="text-4xl font-extrabold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                <Brain className="w-8 h-8 ml-3 text-blue-600" /> الذكاء الاصطناعي: المحرك الجديد
            </h2>
            <p className="text-lg text-gray-700 text-center mb-8 border-b pb-4">
                كيف يعيد الذكاء الاصطناعي تشكيل الأجهزة التي نستخدمها؟ من المعالجات العصبية المتخصصة إلى خوارزميات التعلم الآلي المدمجة.
            </p>

            <article className="space-y-6 text-gray-800 leading-loose text-justify">
                <h3 className="text-2xl font-bold text-purple-700 mt-6">1. المعالجات العصبية (Neural Processors)</h3>
                <p>
                    لم يعد الذكاء الاصطناعي مقتصراً على السحابة؛ إنه ينتقل الآن إلى الأجهزة نفسها. المعالجات العصبية المتخصصة (NPUs) هي وحدات معالجة مصممة خصيصاً لتسريع مهام الذكاء الاصطناعي والتعلم الآلي (ML). هذه المعالجات تسمح للهواتف الذكية وأجهزة اللابتوب بمعالجة البيانات بشكل فوري دون الحاجة للاتصال بالإنترنت.
                </p>

                <h3 className="text-2xl font-bold text-purple-700 mt-6">2. التعلم الآلي في الأمن السيبراني</h3>
                <p>
                    أحد أهم استخدامات الذكاء الاصطناعي هو في مجال الأمن. يمكن لخوارزميات التعلم الآلي تحليل ملايين نقاط البيانات لتحديد الأنماط الشاذة التي تشير إلى هجوم سيبراني محتمل. فبدلاً من الاعتماد على قواعد بيانات التهديدات المعروفة، يمكن للـ AI أن يكتشف الهجمات الجديدة (Zero-Day Attacks) بكفاءة عالية.
                </p>

                <h3 className="text-2xl font-bold text-purple-700 mt-6">3. الأخلاقيات والتحديات</h3>
                <p>
                    مع القوة تأتي المسؤولية. يثير التوسع السريع للذكاء الاصطناعي تساؤلات أخلاقية مهمة حول <strong>التحيز الخوارزمي</strong> و <strong>الخصوصية</strong>. يجب أن يتم تدريب نماذج الذكاء الاصطناعي على مجموعات بيانات عادلة ومتنوعة لتجنب ترسيخ التحيزات الاجتماعية القائمة.
                </p>
            </article>
        </div>
    </section>
);

// 3. مقال التجارة الإلكترونية (تم إكماله)
const ECommerceStrategySection: React.FC = () => (
    <section id="ecommerce-strategy" className="max-w-6xl mx-auto px-4 py-16 relative z-10">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 lg:p-12 shadow-2xl border-t-4 border-green-500">
            <h2 className="text-4xl font-extrabold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600 flex items-center justify-center">
                <Globe className="w-8 h-8 ml-3 text-green-600" /> التجارة الإلكترونية: استراتيجيات النمو
            </h2>
            <p className="text-lg text-gray-700 text-center mb-8 border-b pb-4">
                تحليل شامل لكيفية تحول الأسواق التقليدية إلى منصات رقمية متكاملة وتأثير ذلك على المستهلك.
            </p>

            <article className="space-y-6 text-gray-800 leading-loose text-justify">
                <h3 className="text-2xl font-bold text-teal-700 mt-6">بناء الثقة الرقمية</h3>
                <p>
                    في عالم لا يلمس فيه العميل المنتج بيده قبل الشراء، تصبح &quot;الثقة&quot; هي العملة الأغلى. تعتمد المتاجر الإلكترونية الناجحة على الشفافية المطلقة في عرض المواصفات، واستخدام صور عالية الجودة (كما نفعل في معرض صورنا)، وتوفير سياسات إرجاع واضحة. إن وجود نظام مراجعات حقيقي وخدمة عملاء سريعة الاستجابة ليس مجرد كماليات، بل هو أساس البقاء في السوق الرقمي.
                </p>

                <h3 className="text-2xl font-bold text-teal-700 mt-6">تجربة المستخدم (UX) هي الملك</h3>
                <p>
                    لم يعد السعر هو العامل الوحيد المحدد لقرار الشراء. إن سهولة تصفح الموقع، وسرعة تحميل الصفحات، وتوافق التصميم مع الهواتف المحمولة، كلها عوامل حاسمة. تشير الإحصائيات إلى أن المستخدم يغادر الموقع إذا تأخر تحميله لأكثر من 3 ثوانٍ. لذلك، الاستثمار في البنية التحتية التقنية للمتجر هو استثمار مباشر في المبيعات.
                </p>

                <h3 className="text-2xl font-bold text-teal-700 mt-6">مستقبل المدفوعات الرقمية</h3>
                <p>
                    نشهد تحولاً جذرياً نحو المحافظ الرقمية والعملات المشفرة وأنظمة &quot;اشتري الآن وادفع لاحقاً&quot;. دمج بوابات دفع آمنة ومتنوعة يزيل الحواجز أمام العميل ويزيد من معدلات التحويل (Conversion Rates). الأمان في المعاملات المالية هو الخط الأحمر الذي لا يمكن التهاون فيه، واستخدام بروتوكولات التشفير المتقدمة يحمي بيانات العملاء ويعزز سمعة المتجر.
                </p>
            </article>
        </div>
    </section>
);

// 4. مقال إضافي: الأمن الرقمي (لزيادة المحتوى كما طلبت)
const CyberSecuritySection: React.FC = () => (
    <section id="cyber-security" className="max-w-6xl mx-auto px-4 py-16 relative z-10 pb-32">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 lg:p-12 shadow-2xl border-t-4 border-red-500">
            <h2 className="text-4xl font-extrabold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center">
                <Shield className="w-8 h-8 ml-3 text-red-600" /> حصون العالم الرقمي: الأمن السيبراني
            </h2>

            <article className="space-y-6 text-gray-800 leading-loose text-justify">
                <p>
                    في ظل تزايد الهجمات الإلكترونية، لم يعد الأمن السيبراني خياراً بل ضرورة قصوى. من برمجيات الفدية (Ransomware) التي تشفر بيانات المؤسسات وتطلب مبالغ طائلة لفكها، إلى هجمات التصيد الاحتيالي (Phishing) التي تستهدف الأفراد، المخاطر تحيط بنا من كل جانب.
                </p>
                <h3 className="text-2xl font-bold text-orange-700 mt-6">مفهوم انعدام الثقة (Zero Trust)</h3>
                <p>
                    النموذج الأمني التقليدي القائم على &quot;الثقة ولكن التحقق&quot; لم يعد كافياً. يتجه العالم الآن نحو نموذج &quot;انعدام الثقة&quot; (Zero Trust)، الذي يفترض أنه لا يوجد مستخدم أو جهاز موثوق به بشكل افتراضي، سواء كان داخل الشبكة أو خارجها. كل طلب وصول يجب أن يتم التحقق منه بشكل كامل وتشفيره قبل منحه الصلاحية. هذا النهج يقلل بشكل كبير من قدرة المهاجمين على التحرك داخل الشبكة في حال حدوث اختراق.
                </p>
            </article>
        </div>
    </section>
);

// ====================================================================================
// 🚀 المكون الرئيسي للصفحة (تجميع الأقسام)
// ====================================================================================

export default function Home() {
    return (
        <main className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-200 selection:text-blue-900 overflow-x-hidden relative">
            {/* الخلفية الجمالية */}
            <HeroReactorVisual />

            {/* القائمة الجانبية */}
            <SideMenu />

            {/* رأس الصفحة الترحيبي */}
            <div id="hero" className="relative z-10 pt-32 pb-12 text-center px-4">
                <div className="inline-block mb-4 p-3 rounded-full bg-blue-100 border border-blue-200 animate-bounce">
                    <Cpu className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-purple-600 to-blue-700 animate-gradient-x">
                    A.M Shreif <span className="text-gray-800">Blog</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    وجهتك الأولى للمعرفة التقنية. نغوص في أعماق التكنولوجيا لنأتيك بالمعلومة اليقينة والرؤية المستقبلية.
                </p>
            </div>

            {/* أقسام المقالات */}
            <div className="space-y-8 pb-20">
                <BlogIntroSection />
                <AiAndFutureSection />
                <ECommerceStrategySection />
                <CyberSecuritySection />
            </div>

            {/* تذييل الصفحة البسيط */}
            <footer className="relative z-10 bg-white border-t border-gray-200 py-10 text-center">
                <p className="text-gray-500 text-sm">
                    © {new Date().getFullYear()} A.M Shreif Hub. جميع الحقوق محفوظة للمحتوى المعرفي.
                </p>
            </footer>
        </main>
    );
}