 'use client';

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
    ExternalLink,
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
    ChevronDown, // 💡 أيقونة جديدة للقائمة المنسدلة
} from 'lucide-react';

import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { app } from './lib/firebaseConfig';

// 🛠️ تحديث الواجهة لاستخدام مصفوفة صور
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
    { name: 'اجهزه متاحه للتقسيط ', key: 'installments', icon: CreditCard },
];

// 🌟 تعريف الفئات الفرعية للإكسسوارات
const ACCESSORIES_SUB_CATEGORIES = [
    { name: 'كل الإكسسوارات', key: 'accessories', icon: Zap },
    { name: 'إكسسوارات هواتف', key: 'phones', icon: Smartphone },
    { name: 'إكسسوارات لابتوب', key: 'laptop', icon: Laptop },
    { name: 'إكسسوارات كمبيوتر', key: 'computer', icon: Monitor },
    { name: 'إكسسوارات كاميرات', key: 'cams', icon: Camera },
    { name: 'شواحن وكابلات', key: 'chargers', icon: Zap },
];

// 🛠️ المكون ImageGalleryModal
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
            className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center backdrop-blur-sm"
            onClick={onClose}
        >
            <div className="relative max-w-4xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
                {/* زر الإغلاق - 💎 اللون الأزرق الداكن */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-blue-800 hover:bg-blue-900 text-white rounded-full p-2 shadow-lg z-10 transition-transform duration-300 hover:scale-110"
                    aria-label="إغلاق الصورة المكبرة"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* عرض الصورة الحالية - 💎 حدود وظل نيون أزرق سماوي */}
                <div className="relative w-full aspect-video flex items-center justify-center bg-gray-900 rounded-2xl border-4 border-sky-500 shadow-[0_0_40px_rgba(0,191,255,0.4)]">
                    <Image
                        src={currentImage}
                        alt={`صورة ${currentIndex + 1} من ${totalImages}`}
                        width={1200}
                        height={800}
                        className="rounded-2xl w-full h-full object-contain max-h-[90vh]"
                        unoptimized={true}
                    />
                </div>

                {/* 🌟 أزرار التنقل (الأسهم) */}
                {totalImages > 1 && (
                    <>
                        {/* السهم الأيمن (للصورة التالية) */}
                        <button
                            onClick={() => navigate('next')}
                            className="absolute top-1/2 left-0 transform -translate-y-1/2 p-3 sm:p-4 bg-black/50 text-white rounded-full transition-all duration-300 hover:bg-black/80 z-20"
                            aria-label="الصورة التالية"
                        >
                            <ArrowRight className="w-6 h-6" />
                        </button>
                        {/* السهم الأيسر (للصورة السابقة) */}
                        <button
                            onClick={() => navigate('prev')}
                            className="absolute top-1/2 right-0 transform -translate-y-1/2 p-3 sm:p-4 bg-black/50 text-white rounded-full transition-all duration-300 hover:bg-black/80 z-20"
                            aria-label="الصورة السابقة"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>

                        {/* مؤشر ترقيم الصور */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-sm px-3 py-1 rounded-full pointer-events-none">
                            {currentIndex + 1} / {totalImages}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
// ----------------------------------------------------

const SideMenu: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const staticLinks = [
        { name: 'تواصل معنا', href: '/contact-us', icon: MessageSquare },
        { name: 'من نحن', href: '/about-us', icon: Users },
        { name: 'سياسة الخصوصية', href: '/privacy-policy', icon: BookOpen },
        { name: 'مشترياتي', href: '/my-purchases', icon: ShoppingBag },
    ];

    return (
        <>
            <button
                // 💎 لون الزر: تدرج أزرق/سماوي
                className="fixed top-4 right-4 z-50 p-3 rounded-full bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-600 text-black shadow-[0_0_25px_rgba(0,191,255,0.8)] transition-all duration-500 hover:scale-110"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="قائمة التنقل"
            >
                <Menu className="w-6 h-6" />
            </button>

            <nav
                // 💎 لون القائمة الجانبية: خلفية داكنة جداً / حدود وظل نيون أزرق
                className={`fixed top-0 right-0 h-full w-64 bg-black/95 backdrop-blur-xl shadow-[0_0_40px_rgba(0,191,255,0.4)] z-40 transform transition-transform duration-500 ease-in-out border-l border-sky-500 ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="p-6 pt-20">
                    {/* 💎 لون النص: سماوي */}
                    <h2 className="text-2xl font-bold mb-6 text-sky-400 tracking-wider border-b border-gray-700 pb-2">روابط سريعة</h2>
                    <ul className="space-y-4">
                        {staticLinks.map((link) => (
                            <li key={link.name}>
                                <Link href={link.href} onClick={() => setIsOpen(false)}>
                                    <div
                                        // 💎 لون الروابط: تدرج أنيق عند التحويم (أزرق داكن/سماوي)
                                        className="flex items-center p-3 rounded-xl text-lg font-medium text-gray-200 hover:bg-gradient-to-r hover:from-blue-800 hover:to-sky-600 hover:text-white transition duration-300 transform hover:translate-x-1 shadow-md border border-gray-800 cursor-pointer">
                                        {/* 💎 لون الأيقونات: أزرق فاتح */}
                                        <link.icon className="w-5 h-5 ml-3 text-sky-400" />
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
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 transition-opacity duration-500"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}
        </>
    );
};

const HomePage: React.FC = () => {
    const [allAds, setAllAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);

    // 🎯 التعديل رقم 1: حالة جديدة للتحكم في ظهور العمود المنسدل للإكسسوارات
    const [isAccessoriesDropdownOpen, setIsAccessoriesDropdownOpen] = useState(false);
    // 💡 إضافة useRef لتحديد موقع زر الإكسسوارات
    const accessoriesButtonRef = useRef<HTMLButtonElement>(null);
    const [dropdownStyle, setDropdownStyle] = useState({});


    const [expandedAdId, setExpandedAdId] = useState<string | null>(null);

    // 🛠️ التعديل الجديد 2: حالات نافذة المعاينة
    const [modalImages, setModalImages] = useState<string[] | null>(null);
    const [modalInitialIndex, setModalInitialIndex] = useState(0);

    // 🛠️ التعديل رقم 3 (جزء أ): حالة لتتبع الصورة النشطة في كل إعلان
    const [activeImageInAd, setActiveImageInAd] = useState<{ [adId: string]: string }>({});

    const whatsappNumber = '01125571077';
    const whatsappLink = `https://wa.me/+2${whatsappNumber}?text=مرحباً، أرغب بالاستفسار عن إعلان شاهدته في الموقع.`;

    const toggleDetails = (adId: string) => {
        setExpandedAdId(expandedAdId === adId ? null : adId);
    };

    // 💡 دالة لحساب وتعيين موقع القائمة المنسدلة بناءً على زر الإكسسوارات
    const calculateDropdownPosition = useCallback(() => {
        if (accessoriesButtonRef.current) {
            const buttonRect = accessoriesButtonRef.current.getBoundingClientRect();
            
            // تحديد الارتفاع التقريبي للقائمة المنسدلة (لتظهر فوق الزر)
            const dropdownHeightEstimate = 280; 
            const topPosition = buttonRect.top - dropdownHeightEstimate;
            
            // تحديد ما إذا كان الزر على الجانب الأيمن من الشاشة
            const isRightSide = buttonRect.left > (window.innerWidth / 2);
            
            setDropdownStyle({
                // إذا كان هناك مساحة كافية، تظهر القائمة فوق الزر؛ وإلا تظهر تحته
                top: topPosition > 100 ? topPosition : buttonRect.top + buttonRect.height + 10,
                // تحديد ما إذا كانت القائمة تظهر من اليمين أو اليسار بناءً على موقع الزر
                right: isRightSide ? (window.innerWidth - buttonRect.right) : 'auto', 
                left: isRightSide ? 'auto' : buttonRect.left,
                transform: isRightSide ? 'translateX(0)' : 'translateX(0)',
                width: '180px', 
                textAlign: 'center',
            });
        } else {
             setDropdownStyle({
                bottom: '80px',
                left: '50%',
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

                    // 🛠️🛠️🛠️ التعديل الرئيسي لحل مشكلة ظهور الصور 🛠️🛠️🛠️
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
                    // 🛠️🛠️🛠️ نهاية التعديل 🛠️🛠️🛠️

                    // 💡 التعديل لحل مشكلة اللابتوب/الكمبيوتر: التأكد من أن الفئة المحفوظة صغيرة وبدون مسافات
                    const adCategory = (data.category || '').toLowerCase().trim();

                    return {
                        id: doc.id,
                        ...(data as Omit<Ad, 'id' | 'images'>),
                        category: adCategory, // استخدام القيمة النظيفة
                        images: imagesArray, // 💡 استخدام مصفوفة الصور الموحدة
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

    // 💡 حساب موقع القائمة المنسدلة عند الفتح/الإغلاق وتغير حجم الشاشة
    useEffect(() => {
        if (isAccessoriesDropdownOpen) {
            calculateDropdownPosition();
            window.addEventListener('resize', calculateDropdownPosition);
        } else {
            window.removeEventListener('resize', calculateDropdownPosition);
        }
        return () => window.removeEventListener('resize', calculateDropdownPosition);
    }, [isAccessoriesDropdownOpen, calculateDropdownPosition]);


    // 🛠️ التعديل الجديد 3: دالة فتح نافذة المعاينة
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

    // 🛠️ التعديل الجديد 4: دالة إغلاق نافذة المعاينة
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
            window.location.href = `/checkout?adId=${adId}`;
        } catch (error) {
            console.error('❌ خطأ أثناء تسجيل الدخول بجوجل:', error);
            alert('حدث خطأ أثناء تسجيل الدخول، حاول مرة أخرى.');
        }
    };

    // 🌟 منطق الفلترة المحدث لحل مشكلة اللابتوب والكمبيوتر
    const filteredAds = useMemo(() => {
        // 💡 توحيد مفتاح الفلترة ليتطابق مع القيمة النظيفة في ad.category
        const filterKey = selectedCategory.toLowerCase().trim();

        if (filterKey === 'all') return allAds;
        if (filterKey === 'accessories' && selectedSubCategory === 'accessories') {
            const accessoryKeys = ACCESSORIES_SUB_CATEGORIES
                .map(c => c.key.toLowerCase().trim())
                .filter(k => k !== 'accessories');
            
            // فلترة الإعلانات التي فئتها (category) تندرج تحت أي فئة إكسسوارات فرعية
            return allAds.filter(ad =>
                ad.category && accessoryKeys.includes(ad.category)
            );
        }

        if (filterKey === 'accessories' && selectedSubCategory && selectedSubCategory !== 'accessories') {
            // فلترة بناءً على فئة فرعية محددة
            return allAds.filter(ad =>
                ad.category && ad.category === selectedSubCategory.toLowerCase().trim()
            );
        }

        // 💡 لأي فئة رئيسية عادية (بما في ذلك اللابتوب والكمبيوتر)
        return allAds.filter(ad => ad.category === filterKey);

    }, [allAds, selectedCategory, selectedSubCategory]);

    // 🌟 دالة لاختيار الفئة الفرعية للإكسسوارات وتغلق القائمة
    const handleSubCategorySelect = (key: string) => {
        setSelectedSubCategory(key.toLowerCase());
        setSelectedCategory('accessories'); // التأكد من أن الفئة الرئيسية تبقى 'accessories'
        setIsAccessoriesDropdownOpen(false); // إغلاق القائمة بعد الاختيار
    }


    // 🎯 دالة اختيار الفئة الرئيسية
    const handleCategorySelect = (key: string) => {
        const newCategory = key.toLowerCase();

        // إذا تم الضغط على 'accessories':
        if (newCategory === 'accessories') {
            // إذا كانت 'accessories' مختارة بالفعل، نقلب حالة القائمة المنسدلة
            if (selectedCategory === 'accessories') {
                 // إذا لم تكن القائمة المنسدلة مفتوحة، نختار تلقائياً "كل الإكسسوارات" قبل الفتح
                if (!isAccessoriesDropdownOpen) {
                    setSelectedSubCategory('accessories'); 
                }
                setIsAccessoriesDropdownOpen(prev => !prev);
            } else {
                // إذا لم تكن 'accessories' مختارة، نختارها ونفتح القائمة المنسدلة على "كل الإكسسوارات"
                setSelectedCategory(newCategory);
                setSelectedSubCategory('accessories'); // اختيار 'كل الإكسسوارات' كافتراضي
                setIsAccessoriesDropdownOpen(true);
            }
        } else {
            // لأي فئة أخرى: نغلق القائمة المنسدلة ونختار الفئة
            setIsAccessoriesDropdownOpen(false);
            setSelectedCategory(newCategory);
            setSelectedSubCategory(null); // مسح الفئة الفرعية
        }

        setExpandedAdId(null);
    }


    return (
        <main
            // ⭐️ التعديل المطلوب: تغيير الخلفية إلى الأزرق السماوي الفاتح (bg-sky-100) والنص إلى الأسود (text-black)
            className="min-h-screen bg-sky-100 pb-24 text-black relative overflow-hidden"
        >
            {/* 💎 نقاط الضوء النيون: تم تعديلها لتناسب الخلفية الفاتحة */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(12,255,255,0.15),transparent_60%)] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(0,100,255,0.15),transparent_60%)] pointer-events-none"></div>

            <SideMenu />

            <div className="absolute top-6 left-6 flex flex-col items-center space-y-2">
                <Image
                    src="/logo.jpg"
                    alt="Logo"
                    width={96}
                    height={96}
                    // 💎 ظل الصورة والحدود: أزرق سماوي
                    className="rounded-full shadow-[0_0_50px_rgba(0,191,255,0.7)] border-4 border-sky-600 object-cover w-24 h-24 sm:w-36 sm:h-36"
                    unoptimized
                />
                <span className="text-sm sm:text-base font-semibold text-blue-600 tracking-widest">
                    A.M <span className="text-sky-800">Shreif</span>
                </span>
            </div>

            <header className="pt-28 pb-12 text-center max-w-4xl mx-auto px-4">
                {/* 💎 تدرج العنوان: أزرق/سماوي */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight bg-gradient-to-r from-sky-400 via-blue-600 to-cyan-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(0,191,255,0.5)]">
                    🛠️ A.M Shreif - عالمك للتقنيات والإلكترونيات
                </h1>
                <p className="text-base sm:text-lg text-gray-700 mt-5 max-w-2xl mx-auto">
                    متاح صيانه جميع الاجهزه الالكترونيه A.M Shreif
                </p>
            </header>

            {/* 🎯 العمود المنسدل لفئات الإكسسوارات (الموقع المباشر والمصغر) */}
            {isAccessoriesDropdownOpen && selectedCategory === 'accessories' && (
                <div
                    // 💡 الموقع المخصص ليظهر فوق زر الإكسسوارات مباشرة
                    // 💎 ظل نيون أزرق (الجديد) - تم تعديل الظل ليتناسب مع الخلفية
                    className="fixed z-50 p-2 bg-white/95 rounded-lg border border-sky-500 shadow-[0_0_20px_rgba(0,150,255,0.5)] animate-slideUp transform"
                    style={dropdownStyle} // استخدام الموقع المحسوب
                    // إغلاق القائمة عند النقر خارجها
                    onMouseLeave={() => setIsAccessoriesDropdownOpen(false)}
                >
                    {/* 💎 لون النص: الأزرق الداكن (الجديد) */}
                    <h4 className="text-center text-sm font-bold text-blue-800 border-b border-gray-300 pb-1 mb-1">فئات الإكسسوارات</h4>
                    <div className="flex flex-col space-y-1">
                        {ACCESSORIES_SUB_CATEGORIES.map((subCategory) => {
                            const isActive = selectedSubCategory === subCategory.key.toLowerCase();
                            return (
                                <button
                                    key={subCategory.key}
                                    onClick={() => handleSubCategorySelect(subCategory.key)}
                                    // 💡 تصغير الخط والحجم
                                    className={`flex items-center text-xs font-medium px-2 py-1 rounded-md transition-all duration-300 shadow-sm ${
                                        // 💎 لون النشط: أزرق داكن
                                        isActive
                                            ? 'bg-blue-800 text-white border border-sky-400'
                                            // 💎 لون التحويم: أزرق فاتح/سماوي
                                            : 'bg-gray-100/80 text-gray-700 hover:bg-sky-500/50 hover:text-blue-900'
                                    }`}
                                >
                                    <subCategory.icon className="w-4 h-4 ml-1.5" />
                                    {subCategory.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}


            {/* ✅ أزرار الفئات الرئيسية (الشريط السفلي) */}
            <div
                // 💎 الشريط السفلي: خلفية فاتحة وظل نيون أزرق
                className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-t border-sky-500/50 shadow-[0_0_30px_rgba(0,150,255,0.4)] p-3">

                {/* الشريط السفلي للفئات الرئيسية */}
                <div className="max-w-7xl mx-auto flex justify-start sm:justify-center space-x-2 space-x-reverse overflow-x-auto pb-1 px-2">
                    {CATEGORIES.map((category) => {
                        const isKeyMatch = selectedCategory === category.key.toLowerCase();
                        // تحديد الحالة النشطة: إما أن الفئة الرئيسية مختارة مباشرة أو فئة فرعية تابعة للإكسسوارات مختارة
                        const isActive = isKeyMatch || (selectedCategory === 'accessories' && category.key.toLowerCase() === 'accessories');
                        const isAccessoriesButton = category.key.toLowerCase() === 'accessories';

                        return (
                            <button
                                key={category.key}
                                // 💡 ربط الزر بـ useRef لتموضع القائمة المنسدلة
                                ref={isAccessoriesButton ? accessoriesButtonRef : null}
                                onClick={() => handleCategorySelect(category.key)}
                                onMouseEnter={isAccessoriesButton ? () => {
                                    handleCategorySelect(category.key); // لتحديد الفئة عند التحويم
                                    setIsAccessoriesDropdownOpen(true); // لفتح القائمة عند التحويم
                                } : undefined}
                                onMouseLeave={isAccessoriesButton ? () => {} : undefined} 
                                className={`flex items-center text-xs sm:text-sm font-semibold whitespace-nowrap px-3 sm:px-4 py-2 rounded-full transition-all duration-300 shadow-lg relative ${
                                    isAccessoriesButton && isAccessoriesDropdownOpen
                                        ? 'bg-blue-800 text-white transform scale-105 shadow-blue-700/50' // لون أزرق داكن للملحقات النشطة/المفتوحة
                                        // 💎 لون الأزرار النشطة: تدرج نيون أزرق/سماوي فاخر
                                        : isActive
                                            ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white transform scale-105 shadow-[0_0_15px_rgba(0,191,255,0.5)]'
                                            : 'bg-gray-200/50 text-gray-700 hover:bg-gray-300/70 hover:text-blue-900'
                                }`}
                            >
                                <category.icon className="w-4 h-4 ml-1" />
                                {category.name}
                                {isAccessoriesButton && <ChevronDown className={`w-4 h-4 mr-1 transition-transform duration-300 ${isAccessoriesDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />}
                            </button>
                        );
                    })}
                </div>
            </div>


            {/* ✅ الإعلانات */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 mt-6">
                {loading ? (
                    <p className="text-center text-gray-700 animate-pulse">جارٍ تحميل الإعلانات...</p>
                ) : filteredAds.length === 0 ? (
                    <p className="text-center text-gray-700">لا توجد إعلانات حالياً في هذه الفئة.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {filteredAds.map((ad, index) => {
                            const isExpanded = expandedAdId === ad.id;
                            const mainImageSrc = activeImageInAd[ad.id] || ad.images[0] || '/default.jpg';
                            const hasImagesToShowStrip = ad.images && ad.images.length > 1; // تعديل لظهور الشريط فقط عند وجود أكثر من صورة

                            return (
                                <div key={ad.id} className="col-span-1 flex flex-col space-y-3">
                                    <div
                                        // 💎 ظل بطاقة الإعلان: نيون أزرق/سماوي
                                        className={`relative rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,191,255,0.3)] group transform transition-all duration-700 hover:scale-[1.03] hover:shadow-[0_0_80px_rgba(0,100,255,0.5)] ${
                                            isExpanded ? 'shadow-[0_0_80px_rgba(0,100,255,0.5)]' : ''
                                        }`}
                                    >
                                        {/* 💡 الصورة الرئيسية (الكبيرة) */}
                                        <Image
                                            src={mainImageSrc}
                                            alt={ad.name}
                                            width={500}
                                            height={200}
                                            className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110 cursor-pointer"
                                            priority={index < 3}
                                            unoptimized={true}
                                            onClick={() => openImageModal(ad.images, mainImageSrc)}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>

                                        <div
                                            // 💎 خلفية أسفل الإعلان: أزرق داكن مع تأثير تمويه
                                            className="absolute bottom-0 left-0 right-0 p-6 text-white backdrop-blur-sm bg-gradient-to-r from-blue-900/70 to-transparent flex flex-col sm:flex-row justify-between items-start sm:items-end">

                                            {/* تفاصيل المنتج */}
                                            <div>
                                                {/* 💎 نص الفئة: نيون سماوي */}
                                                <span className="text-sm opacity-90 text-sky-300">{ad.category}</span>
                                                <h3 className="text-xl sm:text-2xl font-bold mt-1 mb-2">{ad.name}</h3>
                                                {/* 💎 نص السعر: نيون أزرق فاتح */}
                                                <p className="text-xl sm:text-2xl font-semibold text-blue-300">{ad.price}</p>
                                            </div>

                                            {/* 🌟 مجموعة الأزرار */}
                                            <div className="flex flex-col space-y-3 mt-4 sm:mt-0 sm:items-end">

                                                {/* 🌟 الزر الجديد: معاينة المنتج */}
                                                <button
                                                    // 💎 خلفية زر المعاينة: أزرق سماوي
                                                    onClick={() => openImageModal(ad.images, mainImageSrc)}
                                                    className="flex items-center bg-sky-600 text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow-lg transition-all duration-500 hover:scale-105 hover:bg-sky-700 cursor-pointer justify-center"
                                                >
                                                    <Eye className="w-4 h-4 ml-2" />
                                                    معاينة المنتج
                                                </button>

                                                {/* زر اشتري الآن */}
                                                <button
                                                    // 💎 خلفية زر الشراء: أزرق فاتح/أبيض
                                                    onClick={() => handleGoogleLogin(ad.id)}
                                                    className="flex items-center bg-blue-400 text-black px-5 py-2.5 rounded-full font-semibold text-sm shadow-lg transition-all duration-500 hover:scale-105 hover:bg-blue-500 cursor-pointer justify-center"
                                                >
                                                    <ShoppingBag className="w-4 h-4 ml-2" />
                                                    اشتري الآن
                                                </button>

                                                {/* زر شاهد/إخفاء التفاصيل */}
                                                <button onClick={() => toggleDetails(ad.id)} className="w-full sm:w-auto">
                                                    <span
                                                        // 💎 لون نص الزر: أزرق داكن
                                                        className="flex items-center text-sm font-semibold text-blue-700 hover:text-blue-900 transition duration-300 mt-2 sm:mt-0"
                                                    >
                                                        {isExpanded ? 'إخفاء التفاصيل' : 'شاهد التفاصيل'}
                                                        <ExternalLink className={`w-4 h-4 mr-1 transition-transform duration-500 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} />
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {/* 💡 شريط الصور المصغرة */}
                                        {hasImagesToShowStrip && (
                                            <div className="absolute top-2 right-2 flex flex-col space-y-2 p-2 bg-black/50 rounded-lg backdrop-blur-sm">
                                                {ad.images.map((imageUrl, imgIndex) => (
                                                    <div
                                                        key={imgIndex}
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // منع فتح التفاصيل عند الضغط على الصورة المصغرة
                                                            setActiveImageInAd({ ...activeImageInAd, [ad.id]: imageUrl });
                                                        }}
                                                        // 💎 حدود الصور المصغرة: أزرق سماوي
                                                        className={`w-12 h-12 rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-300 ${
                                                            imageUrl === mainImageSrc ? 'border-sky-400 scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                                                        }`}
                                                    >
                                                        <Image
                                                            src={imageUrl}
                                                            alt={`صورة مصغرة ${imgIndex + 1}`}
                                                            width={50}
                                                            height={50}
                                                            className="w-full h-full object-cover"
                                                            unoptimized
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {/* 💡 زر التواصل المباشر (Whatsapp) */}
                                        <a 
                                            href={`${whatsappLink} ${ad.name} بسعر ${ad.price}`}
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            // 💎 زر الواتساب: أخضر داكن (لتجنب التداخل مع الأزرق/السماوي)
                                            className="absolute top-2 left-2 p-3 bg-green-600 hover:bg-green-700 text-white rounded-full transition-transform duration-300 hover:scale-110 shadow-lg z-10"
                                            aria-label={`تواصل واتساب للاستفسار عن ${ad.name}`}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <MessageSquare className="w-5 h-5" />
                                        </a>

                                    </div>
                                    
                                    {/* تفاصيل موسعة (الوصف) */}
                                    <div
                                        // 💎 خلفية التفاصيل الموسعة: أزرق فاتح/سماوي
                                        className={`overflow-hidden transition-all duration-500 ease-in-out bg-sky-50 rounded-2xl shadow-xl p-4 border border-sky-300 ${
                                            isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 p-0'
                                        }`}
                                        style={{ padding: isExpanded ? '1rem' : '0' }}
                                    >
                                        <p className="text-gray-800 leading-relaxed whitespace-pre-line text-sm">
                                            {ad.description || 'لا يوجد وصف مفصل لهذا المنتج حالياً.'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
            
            {/* 🌟 نافذة معاينة الصور (المودال) */}
            {modalImages && (
                <ImageGalleryModal 
                    images={modalImages}
                    initialIndex={modalInitialIndex}
                    onClose={closeImageModal}
                />
            )}
            
        </main>
    );
};

export default HomePage;