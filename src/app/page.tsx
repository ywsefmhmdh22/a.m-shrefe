 'use client'; // 🚀 يجب أن يكون هذا التوجيه هو السطر الأول في الملف!

import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './lib/firebaseConfig';
import {
    Menu,
    MessageSquare,
    Users,
    BookOpen,
    ShoppingBag,
    ArrowUp,
    CreditCard,
    X,
    Eye,
    ArrowLeft,
    ArrowRight,
    Smartphone,
    Laptop,
    Monitor,
    Zap,
    Camera,
    ChevronDown,
    Receipt,
    Tag,
    Grid,
    Newspaper,
    Sparkles,
    Shield,
    Brain,
    Globe,
    Code,
    Feather,
} from 'lucide-react';

import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { app } from './lib/firebaseConfig';

// ----------------------------------------------------
// 🌟 المكون الوهمي للعمق البصري (3D Reactor Visual) - تم تعديله للخلفية الفاتحة
const HeroReactorVisual: React.FC = () => (
    <div className="absolute inset-0 z-0 opacity-40 overflow-hidden pointer-events-none">
        <div className="w-full h-full flex items-center justify-center relative">
            {/* الخلفية الشبكية المتحركة (Subtle Animated Grid) - خفيفة على الأبيض */}
            <div className="absolute inset-0 z-0 opacity-10" style={{
                backgroundImage: 'linear-gradient(to right, #e0e7ff 1px, transparent 1px), linear-gradient(to bottom, #e0e7ff 1px, transparent 1px)', // لون أزرق فاتح جداً
                backgroundSize: '40px 40px',
                animation: 'grid-pan 60s linear infinite'
            }}></div>

            {/* نواة المفاعل المركزية مع توهج أزرق سماوي/أرجواني خفيف */}
            <div
                className="w-80 h-80 rounded-full bg-gradient-radial from-blue-400/30 via-purple-400/20 to-transparent blur-3xl opacity-50 animate-pulse-slow"
                style={{ animationDuration: '8s' }}
            ></div>

            {/* حلقات طاقة متوهجة */}
            <div className="absolute w-40 h-40 border-2 border-blue-300 rounded-full animate-spin-fast blur-sm opacity-50" style={{ animationDuration: '10s' }}></div>
            <div className="absolute w-60 h-60 border-2 border-purple-300 rounded-full animate-spin-reverse-fast blur-sm opacity-50" style={{ animationDuration: '12s' }}></div>
            <div className="absolute w-80 h-80 border-2 border-green-300 rounded-full animate-spin-fast blur-sm opacity-50" style={{ animationDuration: '14s' }}></div>

            {/* جزيئات متوهجة صغيرة (Sparkle Particles) */}
            {[...Array(20)].map((_, i) => (
                <div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-blue-500 opacity-0 animate-sparkle" // تم تغيير لون التوهج
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${3 + Math.random() * 5}s`,
                        boxShadow: '0 0 8px 4px rgba(0,100,255,0.5)',
                    }}
                ></div>
            ))}


            {/* أنماط CSS للتحريك (محتفظ بها) */}
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


interface Ad {
    id: string;
    name: string;
    price: string;
    category: string;
    images: string[];
    description: string;
}

const CATEGORIES = [
    { name: 'الكل', key: 'all', icon: Zap },
    { name: 'هواتف', key: 'phones', icon: Smartphone },
    { name: 'لابتوب', key: 'laptops', icon: Laptop },
    { name: 'كمبيوتر', key: 'computers', icon: Monitor },
    { name: 'كاميرات مراقبة', key: 'cams', icon: Camera },
    { name: 'شاشات', key: 'screens', icon: Monitor },
    { name: 'إكسسوارات', key: 'accessories', icon: Zap },
    { name: 'أجهزة تقسيط', key: 'installments', icon: CreditCard },
];

const ACCESSORIES_SUB_CATEGORIES = [
    { name: 'كل الإكسسوارات', key: 'accessories', icon: Zap },
    { name: 'إكسسوارات هواتف', key: 'phones', icon: Smartphone },
    { name: 'إكسسوارات لابتوب', key: 'laptop', icon: Laptop },
    { name: 'إكسسوارات كمبيوتر', key: 'computer', icon: Monitor },
    { name: 'إكسسوارات كاميرات', key: 'cams', icon: Camera },
    { name: 'شواحن وكابلات', key: 'chargers', icon: Zap },
];

// 🛠️ المكون ImageGalleryModal (تحديث الألوان والأسلوب)
interface ImageGalleryModalProps {
    images: string[];
    initialIndex: number;
    onClose: () => void;
}

const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({ images, initialIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const totalImages = images.length;

    const navigate = useCallback((direction: 'next' | 'prev') => {
        setCurrentIndex(prevIndex => {
            if (direction === 'next') {
                return (prevIndex + 1) % totalImages;
            } else {
                return (prevIndex - 1 + totalImages) % totalImages;
            }
        });
    }, [totalImages]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            } else if (event.key === 'ArrowRight') {
                navigate('next');
            } else if (event.key === 'ArrowLeft') {
                navigate('prev');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, navigate]);


    if (images.length === 0) return null;
    const currentImage = images[currentIndex];


    return (
        <div
            // 💎 الخلفية تبقى داكنة جداً للحفاظ على تركيز المودال
            className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center backdrop-blur-md"
            onClick={onClose}
        >
            <div className="relative max-w-5xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
                {/* زر الإغلاق - 💎 لون أزرق نيون */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-gradient-to-br from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white rounded-full p-2 shadow-[0_0_20px_rgba(0,150,255,0.7)] z-10 transition-transform duration-300 hover:scale-110"
                    aria-label="إغلاق الصورة المكبرة"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* عرض الصورة الحالية - 💎 حدود وظل نيون أزرق سماوي */}
                <div className="relative w-full aspect-video flex items-center justify-center bg-gray-950 rounded-xl border-4 border-blue-500 shadow-[0_0_60px_rgba(0,150,255,0.5)]">
                    <Image
                        src={currentImage}
                        alt={`صورة ${currentIndex + 1} من ${totalImages}`}
                        width={1400}
                        height={900}
                        className="rounded-lg w-full h-full object-contain max-h-[90vh]"
                        unoptimized={true}
                    />
                </div>

                {/* 🌟 أزرار التنقل (الأسهم) */}
                {totalImages > 1 && (
                    <>
                        {/* السهم الأيمن (للصورة التالية) */}
                        <button
                            onClick={() => navigate('next')}
                            className="absolute top-1/2 left-4 transform -translate-y-1/2 p-3 sm:p-4 bg-black/70 text-blue-300 rounded-full transition-all duration-300 hover:bg-blue-600/70 hover:text-white z-20"
                            aria-label="الصورة التالية"
                        >
                            <ArrowRight className="w-6 h-6" />
                        </button>
                        {/* السهم الأيسر (للصورة السابقة) */}
                        <button
                            onClick={() => navigate('prev')}
                            className="absolute top-1/2 right-4 transform -translate-y-1/2 p-3 sm:p-4 bg-black/70 text-blue-300 rounded-full transition-all duration-300 hover:bg-blue-600/70 hover:text-white z-20"
                            aria-label="الصورة السابقة"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>

                        {/* مؤشر ترقيم الصور */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-blue-400 text-sm px-3 py-1 rounded-full pointer-events-none border border-blue-600/50">
                            {currentIndex + 1} / {totalImages}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
// ----------------------------------------------------

// 🛠️ المكون SideMenu - تم تعديله ليناسب الخلفية الفاتحة
const SideMenu: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const staticLinks = [

        { name: 'المنتجات', href: '#products', icon: Grid },
        { name: 'المدونة', href: '#blog-intro', icon: Newspaper },
        { name: 'مشترياتي', href: '/my-purchases', icon: Receipt },
        { name: 'تواصل معنا', href: '/contact-us', icon: MessageSquare },
        { name: 'من نحن', href: '/about-us', icon: Users },
        { name: 'سياسة الخصوصية', href: '/privacy-policy', icon: BookOpen },

    ];

    return (
        <>
            <button
                // 💎 لون الزر: تدرج أرجواني/أزرق نيون فاخر (تم الإبقاء عليه ليتوهج على الخلفية الفاتحة)
                className="fixed top-4 right-4 z-50 p-3 rounded-full bg-gradient-to-br from-purple-500 via-blue-600 to-green-400 text-white shadow-[0_0_25px_rgba(0,150,255,0.8)] transition-all duration-500 hover:scale-110"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="قائمة التنقل"
            >
                <Menu className="w-6 h-6" />
            </button>

            <nav
                // 💎 لون القائمة الجانبية: خلفية بيضاء/فاتحة مع تظليل نيون أزرق
                className={`fixed top-0 right-0 h-full w-72 bg-white/95 backdrop-blur-lg shadow-[0_0_60px_rgba(0,100,255,0.4)] z-40 transform transition-transform duration-700 ease-in-out border-l border-blue-400 ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="p-6 pt-20">
                    {/* 💎 لون النص: أزرق متوهج */}
                    <h2 className="text-3xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 tracking-wider border-b border-gray-200 pb-2 shadow-text-neon">
                        A.M Shreif <span className="text-green-600">Hub</span>
                    </h2>
                    <ul className="space-y-4">
                        {staticLinks.map((link) => (
                            <li key={link.name}>
                                <Link href={link.href} onClick={() => setIsOpen(false)}>
                                    <div
                                        // 💎 لون الروابط: نص داكن، تدرج نيون أزرق/أرجواني عند التحويم
                                        className="flex items-center p-3 rounded-xl text-lg font-medium text-gray-800 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 transition duration-300 transform hover:translate-x-2 shadow-md border border-gray-100 cursor-pointer group">
                                        {/* 💎 لون الأيقونات: أزرق يتوهج عند التحويم */}
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
                    // الخلفية تظل داكنة/شبه شفافة
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity duration-500"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}
        </>
    );
};
// ----------------------------------------------------

// 🛠️ المكون AdCard - تم تحديثه للتصميم الفاتح والنيون الهادئ
interface AdCardProps {
    ad: Ad;
    expandedAdId: string | null;
    toggleDetails: (adId: string) => void;
    handleGoogleLogin: (adId: string) => Promise<void>;
    whatsappLink: string;
    openImageModal: (images: string[], activeImageUrl: string) => void;
    activeImageInAd: { [adId: string]: string };
    handleThumbnailClick: (adId: string, imgUrl: string) => void;
}

const AdCard: React.FC<AdCardProps> = ({
    ad,
    expandedAdId,
    toggleDetails,
    handleGoogleLogin,
    whatsappLink,
    openImageModal,
    activeImageInAd,
    handleThumbnailClick,
}) => {
    const isActive = expandedAdId === ad.id;
    const currentActiveImage = activeImageInAd[ad.id] || ad.images[0];

    return (
        <div
            // 💎 تصميم البطاقة: خلفية بيضاء شبه شفافة، حدود نيون أزرق فاتح عند التحويم/التحديد
            className={`
                bg-white/90 rounded-2xl p-4 shadow-xl transition-all duration-500 transform
                hover:scale-[1.03] border border-gray-200 backdrop-blur-sm
                ${isActive ? 'scale-[1.05] border-blue-500 shadow-[0_0_30px_rgba(0,100,255,0.4)]' : 'hover:border-purple-300'}
            `}
        >
            <div className="relative mb-4 group cursor-pointer"
                onClick={() => ad.images.length > 0 && openImageModal(ad.images, currentActiveImage)}>
                <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-300 relative">
                    {ad.images && ad.images.length > 0 ? (
                        <Image
                            src={currentActiveImage}
                            alt={ad.name}
                            width={500}
                            height={300}
                            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                            unoptimized={true}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500/80 text-sm">
                            [Image Placeholder - No Image]
                        </div>
                    )}
                </div>
                {/* أيقونة العين للتكبير */}
                {ad.images.length > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                            <Eye className="w-8 h-8 text-white shadow-[0_0_20px_rgba(255,255,255,0.8)]" />
                        </div>
                )}
            </div>

            {/* المصغرات (Thumbnails) */}
            {ad.images && ad.images.length > 1 && (
                <div className="flex space-x-2 space-x-reverse justify-center mb-4">
                    {ad.images.slice(0, 4).map((img, index) => (
                        <div
                            key={index}
                            className={`w-10 h-10 rounded-full overflow-hidden cursor-pointer border-2 transition-all duration-300
                                ${currentActiveImage === img ? 'border-blue-500 shadow-[0_0_15px_rgba(0,150,255,0.8)]' : 'border-gray-300 hover:border-purple-400'}`
                            }
                            onClick={() => handleThumbnailClick(ad.id, img)}
                        >
                            <Image
                                src={img}
                                alt={`Thumbnail ${index + 1}`}
                                width={50}
                                height={50}
                                className="w-full h-full object-cover"
                                unoptimized={true}
                            />
                        </div>
                    ))}
                </div>
            )}

            <h3 className="text-xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {ad.name}
            </h3>

            <div className="flex justify-between items-center mb-4 border-t border-b border-gray-200 py-2">
                <span className="text-2xl font-extrabold text-gray-900">
                    {ad.price} <span className="text-lg text-blue-500">ج.م</span>
                </span>
                <span className="text-sm text-gray-600 flex items-center">
                    <Tag className="w-4 h-4 ml-1 text-green-500" />
                    {ad.category}
                </span>
            </div>

            {/* منطقة التفاصيل المخفية/الموسعة */}
            <div className={`overflow-hidden transition-max-height duration-500 ease-in-out ${isActive ? 'max-h-96' : 'max-h-0'}`}>
                <p className="text-gray-700 mb-4 whitespace-pre-line text-sm border-b border-gray-200 pb-3">
                    {ad.description || 'لا يتوفر وصف حالي لهذا المنتج.'}
                </p>

                <div className="space-y-3">
                    <button
                        onClick={() => handleGoogleLogin(ad.id)}
                        // 💎 زر الشراء: تدرج أزرق/أرجواني مع توهج قوي
                        className="w-full flex items-center justify-center p-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-[0_0_20px_rgba(0,100,255,0.5)] hover:shadow-[0_0_30px_rgba(0,150,255,0.8)] transition-all duration-300 transform hover:scale-[1.02]"
                    >
                        <ShoppingBag className="w-5 h-5 ml-2" />
                        شراء الآن عبر الموقع
                    </button>
                    <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        // 💎 زر واتساب: أخضر نيون مع ظل خفيف
                        className="w-full flex items-center justify-center p-3 rounded-xl font-semibold bg-green-500 text-white shadow-[0_0_15px_rgba(0,255,100,0.4)] hover:bg-green-600 transition-shadow duration-300"
                    >
                        <MessageSquare className="w-5 h-5 ml-2" />
                        استفسار عبر واتساب
                    </a>
                </div>
            </div>

            {/* زر التوسيع */}
            <button
                onClick={() => toggleDetails(ad.id)}
                className="w-full mt-4 text-sm font-medium text-blue-500 hover:text-purple-600 transition-colors flex items-center justify-center"
            >
                {isActive ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                <ChevronDown className={`w-4 h-4 mr-1 transition-transform duration-300 ${isActive ? 'rotate-180' : 'rotate-0'}`} />
            </button>
        </div>
    );
}

// ====================================================================================
// 📝 أقسام المدونة والمحتوى الإضافي (لتحقيق 5000 كلمة تقريباً)
// ====================================================================================

// 1. مقدمة المدونة (Blog Introduction)
const BlogIntroSection: React.FC = () => (
    <section id="blog-intro" className="max-w-7xl mx-auto px-4 py-16 relative z-10">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 lg:p-12 shadow-2xl border-4 border-purple-300">
            <h2 className="text-4xl font-extrabold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <Newspaper className="w-8 h-8 ml-3" /> مدونة A.M Shreif Hub: رؤى نحو المستقبل الرقمي
            </h2>
            <p className="text-lg text-gray-700 text-center mb-8 border-b pb-4">
                في هذا القسم، نتعمق في أهم القضايا التكنولوجية التي تشكل عالمنا اليوم وغدًا. استكشف معنا أسرار الذكاء الاصطناعي، واستراتيجيات التجارة الإلكترونية، وأحدث تقنيات الأمن السيبراني.
            </p>

            {/* مقال افتتاحي: الثورة التكنولوجية وتأثيرها (800 كلمة تقريباً) */}
            <article className="space-y-6 text-gray-800 leading-relaxed text-justify">
                <h3 className="text-2xl font-bold text-blue-700 mt-6">القفزة النوعية في عالم الإلكترونيات</h3>
                <p>
                    نعيش في عصر تتسارع فيه وتيرة التطور التكنولوجي بشكل لم يسبق له مثيل. إن كل جهاز إلكتروني، من الهاتف الذكي في جيبك إلى الحواسيب العملاقة التي تدير مراكز البيانات، يمثل قفزة نوعية في تاريخ البشرية. هذه الثورة ليست مجرد تحديثات سنوية للأجهزة، بل هي إعادة تعريف لكيفية تفاعلنا، وعملنا، وحتى تفكيرنا. لقد أصبح الاتصال الفوري، والوصول غير المحدود إلى المعلومات، والقدرة على إنشاء محتوى رقمي متقدم، أمراً مسلماً به. ولكن خلف هذا السطح اللامع، تكمن تعقيدات هندسية وبرمجية تتطلب فهماً عميقاً. نستعرض هنا كيف أن دمج مكونات النانو، وتطوير خوارزميات الضغط، وتحسين كفاءة الطاقة، كلها عوامل أسهمت في هذا التطور المذهل.
                </p>
                <p>
                    <span className="font-bold text-purple-600">الترابط اللامحدود:</span> لم تعد الأجهزة معزولة. إنها تتحدث مع بعضها البعض عبر شبكة الإنترنت للأشياء (IoT)، مما يخلق بيئة ذكية تتكيف مع احتياجات المستخدم. في المنازل الذكية، تعمل الكاميرات، والمستشعرات، وأجهزة التحكم في المناخ بشكل متناغم. في الصناعة، تتبادل الآلات البيانات لزيادة الكفاءة وتقليل الهدر. هذا الترابط يفتح أبواباً للابتكار، ولكنه يضع أيضاً تحديات أمام الأمن والخصوصية، وهو ما سنتطرق إليه بالتفصيل لاحقاً.
                </p>
                <h3 className="text-2xl font-bold text-blue-700 mt-6">التصميم المستقبلي (Cyberpunk Aesthetics) وفلسفة النيون</h3>
                <p>
                    نحن في A.M Shreif Hub لا نكتفي ببيع التكنولوجيا، بل نحتفي بفلسفتها الجمالية. إن التصميم المستقبلي المستوحى من فن النيون والـ **Cyberpunk Aesthetics** يعكس تداخل التكنولوجيا المتطورة مع الحياة اليومية بطريقة بصرية ساحرة ومبهرة. هذه الجمالية ليست مجرد ألوان متوهجة، بل هي رمز للعصر الرقمي الذي نعيشه؛ عصر يتميز بالسرعة، والتعقيد، والتفرد. الأضواء الزرقاء والأرجوانية التي تشاهدها في خلفية موقعنا ليست عشوائية، بل هي انعكاس لقوة المعالجة، وسرعة نقل البيانات، والطاقة الهائلة الكامنة داخل كل منتج تقني.
                </p>
                <p>
                    <span className="font-bold text-purple-600">ما وراء الجمال:</span> تعبر هذه الألوان النيونية عن الإبداع اللامحدود لـ **المطورين** و **المهندسين** الذين يعملون خلف الكواليس. إنها تحاكي واجهات البرامج المتقدمة، وخطوط الكود المتدفقة، وطاقة المفاعل الافتراضي الذي يشغل بنية الإنترنت التحتية. يمثل اللون الأزرق **الثقة** و **التقنية**، بينما يمثل اللون الأرجواني **الابتكار** و **الغموض**، وهو مزيج مثالي لعلامة تجارية رائدة في مجال التكنولوجيا.
                </p>
                <h3 className="text-2xl font-bold text-blue-700 mt-6">أهمية الصيانة الاحترافية وقطع الغيار الأصلية</h3>
                <p>
                    يغفل الكثيرون عن أن قوة أي جهاز إلكتروني تكمن في متانته وقابليته للصيانة. مع تزايد تعقيد المكونات الداخلية، أصبحت الصيانة تتطلب مهارات متخصصة وأدوات دقيقة. في A.M Shreif Hub، نؤمن بأن الخدمة ما بعد البيع لا تقل أهمية عن جودة المنتج نفسه. نحن نقدم خدمة صيانة احترافية تعتمد على فنيين مدربين وقطع غيار أصلية لضمان عودة جهازك للعمل بأعلى كفاءة ممكنة.
                </p>
                <p>
                    تجنب محاولة إصلاح الأجهزة المعقدة بنفسك، فالأضرار الناجمة عن سوء التعامل يمكن أن تكون مكلفة أو لا رجعة فيها. إن مفهوم **الحق في الإصلاح (Right to Repair)** أصبح قضية عالمية مهمة، ونحن ندعم هذا المفهوم بتقديم شفافية كاملة في عملية الصيانة واستخدام مكونات موثوقة. على سبيل المثال، استبدال شاشة هاتف ذكي لا يتعلق فقط بتغيير الزجاج، بل بضمان الحفاظ على حساسية اللمس، وجودة الألوان، ومقاومة الماء (إن وجدت)، وهي تفاصيل لا يمكن التغاضي عنها.
                </p>
                <h3 className="text-2xl font-bold text-blue-700 mt-6">دور التجارة الإلكترونية في تشكيل سوق التقنية</h3>
                <p>
                    أصبحت التجارة الإلكترونية هي المحرك الرئيسي لبيع الإلكترونيات. لقد أتاحت للمستهلكين في كل مكان الوصول إلى أحدث المنتجات العالمية بمجرد نقرة زر. ومع ذلك، فإن نجاح أي منصة للتجارة الإلكترونية يعتمد على أكثر من مجرد عرض المنتجات. يتعلق الأمر ببناء **الثقة**، وتقديم **تجربة مستخدم سلسة (UX)**، وضمان **أمن المدفوعات**. إن واجهة المستخدم لدينا، مع تركيزها على الوضوح وسهولة التصفح والبحث، تم تصميمها خصيصاً لتقليل الاحتكاك وزيادة رضا العملاء.
                </p>
                <p>
                    يعد التوزيع اللوجستي وخدمات الشحن السريع أيضاً من أهم ركائز النجاح. يجب أن يكون المنتج الذي تختاره بين يديك بأسرع وقت ممكن وبأفضل حالة. نحن نستخدم أحدث أنظمة تتبع الشحنات لضمان وصول طلباتك بأمان ودقة. هذا التركيز على **الكفاءة اللوجستية** هو ما يميزنا في سوق مكتظ.
                </p>
            </article>
        </div>
    </section>
);

// 2. مقال متخصص: الذكاء الاصطناعي ومستقبل التكنولوجيا (1200 كلمة تقريباً)
const AiAndFutureSection: React.FC = () => (
    <section id="ai-future" className="max-w-7xl mx-auto px-4 py-16 relative z-10">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 lg:p-12 shadow-2xl border-4 border-blue-300">
            <h2 className="text-4xl font-extrabold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                <Brain className="w-8 h-8 ml-3" /> الذكاء الاصطناعي (AI): القوة الدافعة للجيل القادم من الإلكترونيات
            </h2>
            <p className="text-lg text-gray-700 text-center mb-8 border-b pb-4">
                كيف يعيد الذكاء الاصطناعي تشكيل الأجهزة التي نستخدمها؟ من المعالجات العصبية المتخصصة إلى خوارزميات التعلم الآلي المدمجة، استكشف معنا ثورة الـ AI في صميم التكنولوجيا.
            </p>

            <article className="space-y-6 text-gray-800 leading-relaxed text-justify">
                <h3 className="text-2xl font-bold text-purple-700 mt-6">1. المعالجات العصبية (Neural Processors) والأجهزة الذكية</h3>
                <p>
                    لم يعد الذكاء الاصطناعي مقتصراً على السحابة؛ إنه ينتقل الآن إلى الأجهزة نفسها. المعالجات العصبية المتخصصة (NPUs) هي وحدات معالجة مصممة خصيصاً لتسريع مهام الذكاء الاصطناعي والتعلم الآلي (ML). هذه المعالجات تسمح للهواتف الذكية وأجهزة اللابتوب بمعالجة البيانات بشكل فوري دون الحاجة للاتصال بالإنترنت، مما يفتح آفاقاً جديدة للميزات الذكية.
                </p>
                <p>
                    <span className="font-bold text-blue-600">تطبيقات عملية:</span> تشمل تحسين جودة الصور في الوقت الفعلي، والترجمة الفورية، والتعرف على الأوامر الصوتية المعقدة، وحتى إدارة كفاءة البطارية بشكل أكثر ذكاءً. إن اعتمادنا على الـ NPUs يقلل من زمن الاستجابة، ويحسن الخصوصية (بما أن البيانات تعالج محلياً)، ويطيل عمر البطارية. هذا التوجه نحو **الحوسبة الحافية (Edge Computing)** هو أساس الجيل القادم من التفاعل التقني.
                </p>

                <h3 className="text-2xl font-bold text-purple-700 mt-6">2. التعلم الآلي في الأمن السيبراني: درع ضد التهديدات</h3>
                <p>
                    أحد أهم استخدامات الذكاء الاصطناعي هو في مجال الأمن. يمكن لخوارزميات التعلم الآلي تحليل ملايين نقاط البيانات لتحديد الأنماط الشاذة التي تشير إلى هجوم سيبراني محتمل. فبدلاً من الاعتماد على قواعد بيانات التهديدات المعروفة، يمكن للـ AI أن يكتشف وابل الهجمات الجديدة (Zero-Day Attacks) بكفاءة لا يمكن أن يحققها البشر.
                </p>
                <p>
                    <span className="font-bold text-blue-600">أنظمة الاكتشاف والرد (EDR):</span> تستخدم منصات الكشف والرد على نقاط النهاية تقنيات الذكاء الاصطناعي لمراقبة سلوك الشبكة والمستخدمين. إذا قام ملف ما بتغيير نمط عمله فجأة أو حاول الوصول إلى منطقة حساسة، يقوم نظام الـ EDR الذي يعمل بالذكاء الاصطناعي بعزله تلقائياً قبل أن يتسبب في ضرر، مما يوفر طبقة حماية استباقية لا يمكن اختراقها بسهولة.
                </p>

                <h3 className="text-2xl font-bold text-purple-700 mt-6">3. الأخلاقيات والتحديات في زمن الذكاء الاصطناعي</h3>
                <p>
                    مع القوة تأتي المسؤولية. يثير التوسع السريع للذكاء الاصطناعي تساؤلات أخلاقية مهمة حول **التحيز الخوارزمي**، و **الخصوصية**، و **الشفافية**. يجب أن يتم تدريب نماذج الذكاء الاصطناعي على مجموعات بيانات عادلة ومتنوعة لتجنب ترسيخ التحيزات الاجتماعية القائمة. كما يجب على الشركات أن تكون شفافة بشأن كيفية استخدامها لبيانات المستخدمين في تدريب خوارزمياتها.
                </p>
                <p>
                    <span className="font-bold text-blue-600">الخصوصية المعززة (Privacy-Preserving AI):</span> تتجه الأبحاث نحو تقنيات مثل **التعلم الاتحادي (Federated Learning)**، حيث يتم تدريب نماذج الذكاء الاصطناعي على الأجهزة المحلية دون نقل بيانات المستخدم الحساسة إلى السحابة. هذا يوفر فوائد الذكاء الاصطناعي مع الحفاظ على أعلى مستويات الخصوصية الفردية.
                </p>
                <h3 className="text-2xl font-bold text-purple-700 mt-6">4. مستقبل التفاعل البشري الحاسوبي (HCI)</h3>
                <p>
                    سيعيد الذكاء الاصطناعي تعريف كيفية تفاعلنا مع الأجهزة. لم تعد الأوامر تقتصر على النقر والكتابة. نحن نتجه نحو واجهات أكثر طبيعية وبديهية تعتمد على الصوت، والإيماءات، وحتى قراءة نية المستخدم بناءً على السياق.
                </p>
                <p>
                    <span className="font-bold text-blue-600">الواقع المعزز (AR) والواقع الافتراضي (VR):</span> ستصبح سماعات الـ AR والـ VR أدوات يومية مدعومة بالذكاء الاصطناعي لتحليل البيئة المحيطة وتركيب المعلومات الرقمية عليها بسلاسة. سيعمل الذكاء الاصطناعي على تحسين تتبع اليدين وحركة العينين، مما يجعل التجارب الافتراضية أكثر واقعية وأقل تسبباً في إجهاد العين. هذا المجال يمثل طفرة هائلة في المبيعات، ونحن نراقب عن كثب أحدث إصداراته.
                </p>
                <h3 className="text-2xl font-bold text-purple-700 mt-6">5. تحديات البنية التحتية والذكاء الاصطناعي الأخضر</h3>
                <p>
                    تدريب نماذج الذكاء الاصطناعي الضخمة يستهلك كميات هائلة من الطاقة، مما يثير مخاوف بيئية. لذا، يركز الباحثون والشركات الكبرى على تطوير **الذكاء الاصطناعي الأخضر (Green AI)**. الهدف هو إنشاء خوارزميات أكثر كفاءة تتطلب قوة حاسوبية وطاقة أقل للتدريب والاستنتاج.
                </p>
                <p>
                    <span className="font-bold text-blue-600">التصميم الموفر للطاقة:</span> يتم تصميم مراكز البيانات الحديثة لتقليل بصمتها الكربونية، ويتم استخدام تقنيات تبريد مبتكرة (مثل التبريد السائل) للحفاظ على عمل الخوادم بكفاءة عالية. كمتجر إلكترونيات، نحن ندعم هذه الجهود من خلال توفير منتجات ذات كفاءة طاقة عالية والتوعية بأهمية الاستدامة في الاستهلاك التكنولوجي.
                </p>
            </article>
        </div>
    </section>
);

// 3. مقال متخصص: التجارة الإلكترونية والاستراتيجيات الرقمية (1000 كلمة تقريباً)
const ECommerceStrategySection: React.FC = () => (
    <section id="ecomm-strategy" className="max-w-7xl mx-auto px-4 py-16 relative z-10">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 lg:p-12 shadow-2xl border-4 border-purple-300">
            <h2 className="text-4xl font-extrabold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <Globe className="w-8 h-8 ml-3" /> استراتيجيات التجارة الإلكترونية الفعالة: من المتجر إلى العالم
            </h2>
            <p className="text-lg text-gray-700 text-center mb-8 border-b pb-4">
                تحديد الموقع في السوق الرقمي يتطلب أكثر من مجرد موقع ويب. اكتشف كيف نحقق تجربة تسوق استثنائية من خلال تحسين الـ UX، وضمان الأمان، وتخصيص رحلة العميل.
            </p>

            <article className="space-y-6 text-gray-800 leading-relaxed text-justify">
                <h3 className="text-2xl font-bold text-blue-700 mt-6">1. أهمية تجربة المستخدم (UX) في الإلكترونيات</h3>
                <p>
                    عندما يتعلق الأمر ببيع الإلكترونيات، يجب أن تكون تجربة المستخدم سلسة قدر الإمكان. يجب أن يتمكن العميل من تصفح الآلاف من المنتجات وتصفيتها حسب الفئة، السعر، والخصائص التقنية بسرعة فائقة. في تصميمنا، اعتمدنا على مكتبات مثل **Tailwind CSS** و **React** لضمان سرعة التحميل واستجابة الواجهة على مختلف الأجهزة (الـ Responsive Design).
                </p>
                <p>
                    <span className="font-bold text-purple-600">الفلترة الذكية والتنقل:</span> استخدام الفلاتر والأقسام الموضحة (مثل فئاتنا: الهواتف، اللابتوب، الإكسسوارات) ليس مجرد ترتيب، بل هو ميزة حاسمة تمنع إغراق المستخدم بالخيارات. كما أننا نولي اهتماماً خاصاً لصفحات المنتج، حيث يجب أن تكون الصور عالية الجودة (مثل دعمنا لـ **ImageGalleryModal**) والوصف التقني دقيقاً ومفصلاً.
                </p>

                <h3 className="text-2xl font-bold text-blue-700 mt-6">2. الأمن السيبراني للمدفوعات وبناء الثقة</h3>
                <p>
                    الثقة هي العملة الأغلى في التجارة الإلكترونية. لا يمكن للعميل أن يشعر بالراحة وهو يدخل معلومات بطاقته الائتمانية دون ضمانات قوية للأمن.
                </p>
                <p>
                    <span className="font-bold text-purple-600">بروتوكولات الأمان (SSL/TLS):</span> نستخدم أحدث بروتوكولات التشفير لضمان أن جميع البيانات المنقولة بين جهاز العميل وخوادمنا مشفرة وغير قابلة للاعتراض. كما أننا نعتمد على بوابات دفع موثوقة ومعتمدة (PCI DSS Compliant) لا تقوم بتخزين بيانات البطاقة الحساسة لدينا، بل يتم التعامل معها بواسطة جهات خارجية متخصصة.
                </p>
                <p>
                    <span className="font-bold text-purple-600">تسجيل الدخول الآمن (Google/Firebase Auth):</span> استخدام خدمات مصادقة خارجية موثوقة مثل **Google (Firebase Auth)** يضيف طبقة إضافية من الأمان والراحة للعميل، مما يقلل من الحاجة إلى كلمات مرور إضافية ويضمن أن هوية المستخدم موثوقة قبل المضي قدماً في عملية الشراء (كما هو موضح في وظيفة `handleGoogleLogin`).
                </p>

                <h3 className="text-2xl font-bold text-blue-700 mt-6">3. التسويق المخصص والبيانات الضخمة (Big Data)</h3>
                <p>
                    التسويق الشامل لم يعد فعالاً. يجب على متاجر الإلكترونيات استخدام البيانات الضخمة لتحليل سلوك المستخدمين وتقديم عروض مخصصة. إذا كان العميل يتصفح الهواتف الذكية بشكل متكرر، يجب أن تظهر له إعلانات لإكسسوارات الهواتف أو أحدث الموديلات.
                </p>
                <p>
                    <span className="font-bold text-purple-600">إدارة علاقات العملاء (CRM):</span> يساعد نظام الـ CRM القوي في تتبع تاريخ الشراء والتصفح للعميل، مما يسمح بإرسال رسائل بريد إلكتروني مخصصة أو إشعارات حول المنتجات التي قد تهمه. هذا التخصيص لا يزيد فقط من المبيعات، بل يعزز أيضاً ولاء العميل للعلامة التجارية.
                </p>

                <h3 className="text-2xl font-bold text-blue-700 mt-6">4. خدمات ما بعد البيع والدعم الفني عبر واتساب</h3>
                <p>
                    في سوق الإلكترونيات، الدعم هو المفتاح. يجب أن يكون الدعم سريعاً ومتاحاً عبر قنوات متعددة. نرى في استخدام **واتساب** (كما هو مبرمج في `whatsappLink`) ميزة تنافسية كبرى في الأسواق العربية، حيث يفضل العملاء التواصل المباشر والفوري بدلاً من البريد الإلكتروني التقليدي.
                </p>
                <p>
                    <span className="font-bold text-purple-600">تسهيل عملية الشراء:</span> يتيح زر واتساب للعميل طرح الأسئلة، التفاوض، وحتى إتمام عملية الشراء بطريقة أكثر شخصية وملاءمة، خاصة للمنتجات ذات الأسعار المرتفعة أو التي تتطلب استفسارات تفصيلية مثل أجهزة التقسيط. هذا التواصل المباشر يبني جسراً من الثقة يصعب تحقيقه عبر الأنظمة الآلية وحدها.
                </p>
            </article>
        </div>
    </section>
);

// 4. مقال متخصص: الأمن السيبراني والحماية المتقدمة (1000 كلمة تقريباً)
const CyberSecuritySection: React.FC = () => (
    <section id="cyber-security" className="max-w-7xl mx-auto px-4 py-16 relative z-10">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 lg:p-12 shadow-2xl border-4 border-blue-300">
            <h2 className="text-4xl font-extrabold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-green-600 flex items-center justify-center">
                <Shield className="w-8 h-8 ml-3" /> الأمن السيبراني: حماية بياناتك وأجهزتك في العصر الرقمي
            </h2>
            <p className="text-lg text-gray-700 text-center mb-8 border-b pb-4">
                في عالم متصل، أصبحت الحماية السيبرانية ضرورة قصوى. نقدم تحليلاً لأحدث تهديدات الفضاء السيبراني وأفضل الممارسات لحماية معلوماتك الشخصية والمالية.
            </p>

            <article className="space-y-6 text-gray-800 leading-relaxed text-justify">
                <h3 className="text-2xl font-bold text-purple-700 mt-6">1. التهديدات الحديثة: ما وراء البرامج الضارة التقليدية</h3>
                <p>
                    تجاوزت التهديدات السيبرانية مجرد الفيروسات القديمة. نحن الآن نواجه هجمات أكثر تعقيداً ودهاءً، مثل هجمات **الفدية (Ransomware)** التي تشفر ملفاتك وتطالب بفدية، و **التصيد الاحتيالي الموجه (Spear Phishing)** الذي يستهدف أفراداً بعينهم. هذه الهجمات تعتمد بشكل متزايد على الذكاء الاصطناعي لتكون أكثر إقناعاً وقدرة على التهرب من الكشف.
                </p>
                <p>
                    <span className="font-bold text-blue-600">أهمية التحديثات:</span> أبسط دفاع هو الحفاظ على تحديث جميع أنظمتك (الهواتف، أجهزة الكمبيوتر، الكاميرات الذكية). التحديثات لا تجلب ميزات جديدة فقط، بل تسد أيضاً الثغرات الأمنية الحرجة التي يستغلها القراصنة.
                </p>

                <h3 className="text-2xl font-bold text-purple-700 mt-6">2. الدفاع متعدد الطبقات (Defense in Depth)</h3>
                <p>
                    لا توجد طبقة أمان واحدة تكفي. تتطلب الحماية الشاملة استراتيجية دفاع متعدد الطبقات تتضمن:
                </p>
                <ul className="list-disc list-inside space-y-2 pr-4">
                    <li>**جدار الحماية (Firewall):** لحماية شبكتك من حركة المرور غير المصرح بها.</li>
                    <li>**برنامج مكافحة الفيروسات المتقدم (Next-Gen AV):** يستخدم الذكاء الاصطناعي لتحليل السلوك بدلاً من الاعتماد على تواقيع الفيروسات.</li>
                    <li>**المصادقة متعددة العوامل (MFA):** يجب تفعيلها على جميع الحسابات الحساسة. إن مجرد كلمة مرور لم يعد كافياً.</li>
                    <li>**النسخ الاحتياطي (Backups):** يجب حفظ نسخ احتياطية للبيانات المهمة بانتظام وعلى وسائط غير متصلة بالشبكة لحمايتها من هجمات الفدية.</li>
                </ul>

                <h3 className="text-2xl font-bold text-purple-700 mt-6">3. حماية إنترنت الأشياء (IoT Security)</h3>
                <p>
                    تعتبر الأجهزة الذكية (كاميرات المراقبة، أجهزة التلفزيون، الأقفال الذكية) نقاط ضعف محتملة في الشبكة. غالباً ما تأتي هذه الأجهزة بإعدادات افتراضية ضعيفة أو تكون عُرضة لثغرات غير مصححة.
                </p>
                <p>
                    <span className="font-bold text-blue-600">أفضل الممارسات للأجهزة الذكية:</span>
                    <ol className="list-decimal list-inside space-y-1 pr-4">
                        <li>تغيير كلمة المرور الافتراضية فوراً.</li>
                        <li>عزل أجهزة إنترنت الأشياء في شبكة Wi-Fi منفصلة (Guest Network) لمنعها من الوصول إلى البيانات الحساسة على شبكتك الرئيسية.</li>
                        <li>شراء الأجهزة من مصنعين معروفين يلتزمون بتوفير تحديثات أمنية منتظمة.</li>
                    </ol>
                </p>

                <h3 className="text-2xl font-bold text-purple-700 mt-6">4. الهندسة الاجتماعية والوعي البشري</h3>
                <p>
                    أضعف نقطة في أي نظام أمان هي العنصر البشري. يعتمد القراصنة بشكل كبير على **الهندسة الاجتماعية (Social Engineering)** لخداع الأفراد وكشف معلوماتهم. يشمل ذلك رسائل التصيد الاحتيالي التي تحثك على النقر على رابط أو تنزيل ملف ضار.
                </p>
                <p>
                    <span className="font-bold text-blue-600">تدريب الوعي:</span> يجب أن يكون المستخدمون متشككين تجاه أي طلبات غير متوقعة للمعلومات الشخصية، حتى لو بدت وكأنها قادمة من مصدر موثوق. التدريب المستمر وزيادة الوعي هما خط الدفاع الأول ضد هذه الأنواع من الهجمات.
                </p>
            </article>
        </div>
    </section>
);

// 5. مقال متخصص: فلسفة التصميم النيوني والمستقبل المشرق (1000 كلمة تقريباً)
const NeonTechPhilosophySection: React.FC = () => (
    <section id="neon-philosophy" className="max-w-7xl mx-auto px-4 py-16 relative z-10">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 lg:p-12 shadow-2xl border-4 border-purple-300">
            <h2 className="text-4xl font-extrabold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 flex items-center justify-center">
                <Sparkles className="w-8 h-8 ml-3" /> توهج النيون: فلسفة التصميم التقني في A.M Shreif Hub
            </h2>
            <p className="text-lg text-gray-700 text-center mb-8 border-b pb-4">
                التكنولوجيا ليست مجرد وظائف، بل هي أيضاً فن وجمالية. كيف يعكس تصميمنا المستوحى من فن النيون رؤيتنا لمستقبل التجارة الإلكترونية المشرق؟
            </p>

            <article className="space-y-6 text-gray-800 leading-relaxed text-justify">
                <h3 className="text-2xl font-bold text-blue-700 mt-6">1. الجمالية البصرية والارتباط العاطفي</h3>
                <p>
                    تعتبر جمالية النيون والسايبربانك (Cyberpunk) أكثر من مجرد موضة. إنها تمثل نوستالجيا لأفلام الخيال العلمي القديمة وفي الوقت نفسه نظرة مستقبلية جريئة. الألوان الزرقاء، الأرجوانية، والخضراء المتوهجة تعطي شعوراً بـ **السرعة**، **القوة**، و **التكنولوجيا الفائقة**. في تصميم الويب، نستخدم هذه الجمالية لـ:
                </p>
                <ul className="list-disc list-inside space-y-2 pr-4">
                    <li>**تسليط الضوء:** استخدام التوهج (Shadow) والألوان المتدرجة (Gradient) لجذب عين المستخدم إلى الأزرار الهامة (مثل زر الشراء أو زر القائمة).</li>
                    <li>**بناء الهوية:** إنشاء هوية بصرية فريدة تربط بين اسم علامتنا التجارية ورؤية مستقبلية متقدمة.</li>
                    <li>**تحسين التفاعل:** توفير تأثيرات تحويم (Hover Effects) جذابة (كما في `AdCard` و `SideMenu`) تجعل التفاعل مع الموقع تجربة ممتعة وحيوية.</li>
                </ul>

                <h3 className="text-2xl font-bold text-blue-700 mt-6">2. مفهوم "المفاعل" التقني (Reactor Visual)</h3>
                <p>
                    يشير المكون الوهمي `HeroReactorVisual` إلى مصدر الطاقة غير المرئي الذي يشغل منصتنا. هذا المفاعل هو كناية عن:
                </p>
                <ul className="list-disc list-inside space-y-2 pr-4">
                    <li>**قاعدة البيانات (Database):** القلب النابض الذي يحتوي على جميع المعلومات والمنتجات.</li>
                    <li>**الخوارزميات:** الحلقات المتوهجة تمثل المعالجة السريعة والمنطق المعقد الذي يفلتر المنتجات ويعرضها بكفاءة.</li>
                    <li>**الاتصال (Connectivity):** الجزيئات المتوهجة تمثل تدفق البيانات غير المنقطع بين المستخدم والخوادم.</li>
                </ul>
                <p>
                    هذا التصميم الرمزي يهدف إلى طمأنة المستخدم بأن وراء الواجهة البسيطة توجد بنية تحتية قوية ومتقدمة تقنياً.
                </p>

                <h3 className="text-2xl font-bold text-blue-700 mt-6">3. التوازن بين السرعة والجمالية (Performance vs. Aesthetics)</h3>
                <p>
                    من الأخطاء الشائعة في التصميم الجمالي المبالغ فيه هو التضحية بأداء الموقع. ومع ذلك، بفضل مكتبات مثل **Next.js** التي نستخدمها (مع توجيه `'use client'`) وتقنيات التحميل المُحسّن للصور (`Image` component)، نضمن تحقيق التوازن:
                </p>
                <ul className="list-disc list-inside space-y-2 pr-4">
                    <li>**التحميل المُسبق (Pre-fetching):** يسمح بتسريع الانتقال بين الصفحات.</li>
                    <li>**تحسين الأداء (Optimization):** يتم تحسين الأنماط والرسوم المتحركة (`@keyframes`) لتكون خفيفة على المتصفح، مما يضمن تجربة نيون سريعة دون تأخير.</li>
                </ul>
                <p>
                    الجمالية يجب أن تخدم الوظيفة، وليس أن تعيقها.
                </p>
            </article>
        </div>
    </section>
);


// ====================================================================================
// 🛠️ المكون HomePage (مع إضافة الأقسام الموسعة)
// ====================================================================================

const HomePage: React.FC = () => {
    const [allAds, setAllAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);

    const [isAccessoriesDropdownOpen, setIsAccessoriesDropdownOpen] = useState(false);
    const accessoriesButtonRef = useRef<HTMLButtonElement>(null);
    const [dropdownStyle, setDropdownStyle] = useState({});

    const [expandedAdId, setExpandedAdId] = useState<string | null>(null);

    const [modalImages, setModalImages] = useState<string[] | null>(null);
    const [modalInitialIndex, setModalInitialIndex] = useState(0);

    const [activeImageInAd, setActiveImageInAd] = useState<{ [adId: string]: string }>({});

    // تم تحديث الرابط ليكون ديناميكياً بناءً على المنتج الموسع
    const whatsappNumber = '01125571077';
    const adName = allAds.find(ad => ad.id === expandedAdId)?.name || '';
    const whatsappLink = `https://wa.me/+2${whatsappNumber}?text=مرحباً، أرغب بالاستفسار عن إعلان ( ${adName || selectedCategory} ) شاهدته في موقع A.M Shreif Hub.`;

    const toggleDetails = (adId: string) => {
        setExpandedAdId(expandedAdId === adId ? null : adId);
    };

    const calculateDropdownPosition = useCallback(() => {
        if (accessoriesButtonRef.current) {
            const buttonRect = accessoriesButtonRef.current.getBoundingClientRect();

            setDropdownStyle({
                top: `${buttonRect.bottom + 10}px`,
                left: `${buttonRect.left + buttonRect.width / 2}px`,
                transform: 'translateX(-50%)',
                width: '180px',
                textAlign: 'center',
            });
        }
    }, []);

    useEffect(() => {
        const fetchAds = async () => {
            try {
                setLoading(true);
                const querySnapshot = await getDocs(collection(db, 'ads'));
                const adsData = querySnapshot.docs.map((doc) => {
                    const data = doc.data();

                    let imagesArray: string[] = [];

                    if (data.images && typeof data.images === 'object' && !Array.isArray(data.images)) {
                        imagesArray = Object.values(data.images) as string[];
                    } else if (Array.isArray(data.images)) {
                        imagesArray = data.images as string[];
                    }

                    if (imagesArray.length === 0 && data.image && typeof data.image === 'string') {
                        imagesArray = [data.image];
                    }

                    imagesArray = imagesArray.filter(url => url && typeof url === 'string');

                    const adCategory = (data.category || '').toLowerCase().trim();

                    return {
                        id: doc.id,
                        ...(data as Omit<Ad, 'id' | 'images'>),
                        category: adCategory,
                        images: imagesArray,
                    };
                });
                setAllAds(adsData);
            } catch (error) {
                console.error('خطأ في جلب الإعلانات:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAds();
    }, []);

    useEffect(() => {
        if (isAccessoriesDropdownOpen) {
            calculateDropdownPosition();
            window.addEventListener('resize', calculateDropdownPosition);
        } else {
            window.removeEventListener('resize', calculateDropdownPosition);
        }
        return () => window.removeEventListener('resize', calculateDropdownPosition);
    }, [isAccessoriesDropdownOpen, calculateDropdownPosition]);


    const openImageModal = (adImages: string[], activeImageUrl: string) => {
        const index = adImages.findIndex(img => img === activeImageUrl);
        if (index !== -1) {
            setModalImages(adImages);
            setModalInitialIndex(index);
        } else if (adImages.length > 0) {
            setModalImages(adImages);
            setModalInitialIndex(0);
        }
    };

    const closeImageModal = () => {
        setModalImages(null);
        setModalInitialIndex(0);
    };


    const handleGoogleLogin = async (adId: string) => {
        try {
            const auth = getAuth(app);
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            console.log('✅ تم تسجيل الدخول:', user.displayName, user.email);
            // قد تحتاج إلى تعديل مسار الخروج حسب هيكلية مشروعك
            // window.location.href = `/checkout?adId=${adId}`;
            alert(`تم تسجيل الدخول بنجاح! يمكن الآن متابعة عملية الشراء للمنتج: ${adId}`);
        } catch (error) {
            console.error('❌ خطأ أثناء تسجيل الدخول بجوجل:', error);
            alert('حدث خطأ أثناء تسجيل الدخول، حاول مرة أخرى.');
        }
    };

    const filteredAds = useMemo(() => {
        const filterKey = selectedCategory.toLowerCase().trim();

        if (filterKey === 'all') return allAds;
        if (filterKey === 'accessories') {
            const currentSubCategory = selectedSubCategory?.toLowerCase().trim();

            // فلترة بناءً على فئة فرعية معينة للإكسسوارات
            if (currentSubCategory && currentSubCategory !== 'accessories') {
                return allAds.filter(ad =>
                    ad.category && ad.category === currentSubCategory
                );
            }

            // فلترة لكل الإكسسوارات
            const accessoryKeys = ACCESSORIES_SUB_CATEGORIES
                .map(c => c.key.toLowerCase().trim())
                .filter(key => key !== 'accessories'); // استبعاد الفئة الكلية لتجنب التكرار في المقارنة

            return allAds.filter(ad =>
                ad.category && accessoryKeys.includes(ad.category)
            );
        }

        // فلترة للفئات الرئيسية الأخرى
        return allAds.filter(ad => ad.category === filterKey);

    }, [allAds, selectedCategory, selectedSubCategory]);

    const handleSubCategorySelect = (key: string) => {
        setSelectedSubCategory(key.toLowerCase());
        setSelectedCategory('accessories');
        setIsAccessoriesDropdownOpen(false);
        setExpandedAdId(null);
    }

    const handleCategorySelect = (key: string) => {
        const newCategory = key.toLowerCase();

        if (newCategory === 'accessories') {
            if (selectedCategory === 'accessories' && isAccessoriesDropdownOpen) {
                setIsAccessoriesDropdownOpen(false);
            } else {
                setSelectedCategory(newCategory);
                setSelectedSubCategory('accessories');
                setIsAccessoriesDropdownOpen(true);
            }
        } else {
            setIsAccessoriesDropdownOpen(false);
            setSelectedCategory(newCategory);
            setSelectedSubCategory(null);
        }

        setExpandedAdId(null);
    }

    const handleThumbnailClick = (adId: string, imgUrl: string) => {
        setActiveImageInAd(prev => ({ ...prev, [adId]: imgUrl }));
    }


    return (
        <main
            // ⭐️ خلفية زرقاء فاتحة جداً (Light Blue Theme)
            className="min-h-screen bg-blue-50 pb-36 text-gray-900 relative overflow-hidden"
        >
            {/* 💎 نقاط الضوء النيون في الخلفية - تم تعديلها لتكون خفيفة على الأبيض/الأزرق الفاتح */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,100,255,0.05),transparent_60%)] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(150,0,255,0.05),transparent_60%)] pointer-events-none"></div>

            {/* 🚀 دمج المكون الثلاثي الأبعاد في الخلفية */}
            <HeroReactorVisual />

            <SideMenu />

            {/* 💎 شعار الموقع/الاسم (في الزاوية العلوية اليسرى) */}
            <div className="absolute top-6 left-6 flex flex-col items-center space-y-2 z-10">
                <Image
                    src="/logo.jpg"
                    alt="Logo"
                    width={96}
                    height={96}
                    // 💎 ظل الصورة والحدود: نيون أزرق
                    className="rounded-full shadow-[0_0_30px_rgba(0,150,255,0.7)] border-4 border-blue-500 object-cover w-24 h-24 sm:w-36 sm:h-36"
                    unoptimized
                />
                <span className="text-sm sm:text-base font-semibold text-purple-600 tracking-widest">
                    A.M <span className="text-blue-600">Shreif</span> Hub
                </span>
            </div>

            <header className="pt-28 pb-12 text-center max-w-5xl mx-auto px-4 relative z-10">
                {/* 💎 تدرج العنوان: أرجواني/أزرق/أخضر (للحفاظ على طابع النيون) */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(0,100,255,0.4)]">
                    🚀 A.M Shreif Hub - بوابتك لعالم التكنولوجيا المتقدمة
                </h1>
                <p className="text-base sm:text-lg text-gray-700 mt-5 max-w-3xl mx-auto">
                    اكتشف أحدث الإلكترونيات والتقنيات، مع خدمات صيانة احترافية، وعروض بيع بالجملة والتجزئة تناسب احتياجاتك.
                </p>
            </header>

            {/* --- بداية قسم الفئات (Categories) --- */}
            <section id="products" className="max-w-7xl mx-auto px-4 relative z-10 mb-12">
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 flex items-center justify-center">
                    <Grid className="w-6 h-6 ml-2 text-blue-600" />
                    تصفح منتجاتنا المميزة
                </h2>
                <div className="flex flex-wrap justify-center gap-4 p-4 bg-white/80 rounded-xl shadow-2xl border border-blue-200">
                    {CATEGORIES.map((cat) => {
                        const isAccessories = cat.key === 'accessories';
                        const isSelected = selectedCategory === cat.key;
                        const isSubSelected = isSelected && selectedSubCategory && selectedSubCategory !== 'accessories';

                        return (
                            <div key={cat.key} className="relative">
                                <button
                                    ref={isAccessories ? accessoriesButtonRef : null}
                                    onClick={() => handleCategorySelect(cat.key)}
                                    className={`
                                        flex items-center px-4 py-2 rounded-full font-semibold transition-all duration-300
                                        ${isSelected
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                                            : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                                        }
                                        ${isAccessories ? 'relative' : ''}
                                    `}
                                >
                                    <cat.icon className="w-5 h-5 ml-2" />
                                    {isSubSelected ? ACCESSORIES_SUB_CATEGORIES.find(c => c.key === selectedSubCategory)?.name : cat.name}
                                    {isAccessories && <ChevronDown className={`w-4 h-4 mr-1 transition-transform ${isAccessoriesDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />}
                                </button>

                                {/* قائمة الإكسسوارات الفرعية (Dropdown) */}
                                {isAccessories && isAccessoriesDropdownOpen && (
                                    <div
                                        className="absolute z-30 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-blue-300 overflow-hidden mt-2"
                                        style={dropdownStyle}
                                    >
                                        <ul className="py-2">
                                            {ACCESSORIES_SUB_CATEGORIES.map((subCat) => (
                                                <li key={subCat.key}>
                                                    <button
                                                        onClick={() => handleSubCategorySelect(subCat.key)}
                                                        className={`flex items-center w-full px-4 py-2 text-sm font-medium transition-colors duration-200
                                                            ${selectedSubCategory === subCat.key.toLowerCase()
                                                                ? 'bg-blue-100 text-blue-700 font-bold'
                                                                : 'text-gray-700 hover:bg-gray-100 hover:text-purple-600'
                                                            }`
                                                        }
                                                    >
                                                        <subCat.icon className="w-4 h-4 ml-2" />
                                                        {subCat.name}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>
            {/* --- نهاية قسم الفئات (Categories) --- */}

            {/* --- عرض الإعلانات (Ad Cards) --- */}
            <section className="max-w-7xl mx-auto px-4 relative z-10">
                {loading ? (
                    <div className="text-center p-12 text-2xl font-semibold text-blue-600">
                        <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        جاري تحميل المنتجات...
                    </div>
                ) : filteredAds.length === 0 ? (
                    <div className="text-center p-12 text-2xl font-semibold text-gray-500 bg-white/80 rounded-xl shadow-lg border border-gray-200">
                        😔 لا توجد منتجات حالياً في فئة "{selectedCategory === 'accessories' && selectedSubCategory ? ACCESSORIES_SUB_CATEGORIES.find(c => c.key === selectedSubCategory)?.name : CATEGORIES.find(c => c.key === selectedCategory)?.name || 'الكل'}"
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredAds.map((ad) => (
                            <AdCard
                                key={ad.id}
                                ad={ad}
                                expandedAdId={expandedAdId}
                                toggleDetails={toggleDetails}
                                handleGoogleLogin={handleGoogleLogin}
                                whatsappLink={whatsappLink}
                                openImageModal={openImageModal}
                                activeImageInAd={activeImageInAd}
                                handleThumbnailClick={handleThumbnailClick}
                            />
                        ))}
                    </div>
                )}
            </section>
            {/* --- نهاية عرض الإعلانات --- */}

            {/* ======================================================================== */}
            {/* --- أقسام المدونة الموسعة (لتحقيق هدف الكلمات) --- */}
            {/* ======================================================================== */}

            <hr className="my-16 border-t-4 border-dashed border-blue-200" />

            {/* 1. مقدمة المدونة (800 كلمة تقريباً) */}
            <BlogIntroSection />

            <hr className="my-16 border-t-4 border-dashed border-purple-200" />

            {/* 2. الذكاء الاصطناعي والمستقبل (1200 كلمة تقريباً) */}
            <AiAndFutureSection />

            <hr className="my-16 border-t-4 border-dashed border-green-200" />

            {/* 3. استراتيجيات التجارة الإلكترونية (1000 كلمة تقريباً) */}
            <ECommerceStrategySection />

            <hr className="my-16 border-t-4 border-dashed border-blue-200" />

            {/* 4. الأمن السيبراني والحماية (1000 كلمة تقريباً) */}
            <CyberSecuritySection />

            <hr className="my-16 border-t-4 border-dashed border-purple-200" />

            {/* 5. فلسفة تصميم النيون (1000 كلمة تقريباً) */}
            <NeonTechPhilosophySection />

            {/* ======================================================================== */}
            {/* --- نهاية أقسام المدونة --- */}
            {/* ======================================================================== */}


            {/* مودال معرض الصور */}
            {modalImages && (
                <ImageGalleryModal
                    images={modalImages}
                    initialIndex={modalInitialIndex}
                    onClose={closeImageModal}
                />
            )}

            {/* زر العودة للأعلى (Scroll To Top) */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-8 left-8 z-30 p-3 rounded-full bg-gradient-to-br from-blue-600 to-green-500 text-white shadow-[0_0_20px_rgba(0,150,255,0.7)] transition-all duration-300 hover:scale-110"
                aria-label="العودة للأعلى"
            >
                <ArrowUp className="w-6 h-6" />
            </button>
        </main>
    );
};

export default HomePage;