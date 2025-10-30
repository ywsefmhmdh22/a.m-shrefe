 'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
  MessageCircle,
  Smartphone,
  Laptop,
  Monitor,
  Zap,
  Camera,
  ShoppingBag,
  ArrowUp,
  CreditCard,
  X,
  Eye,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { app } from './lib/firebaseConfig';

// 🛠️ تحديث الواجهة لاستخدام مصفوفة صور
interface Ad {
  id: string;
  name: string;
  price: string;
  category: string;
  images: string[]; // 💡 أصبح مصفوفة من الروابط
  description: string;
}

const CATEGORIES = [
  { name: 'الكل', key: 'all', icon: Zap },
  { name: 'هواتف', key: 'phones', icon: Smartphone },
  { name: 'لابتوب', key: 'laptop', icon: Laptop },
  { name: 'كمبيوتر', key: 'computer', icon: Monitor },
  { name: 'كاميرات مراقبة', key: 'cams', icon: Camera },
  { name: 'شاشات', key: 'screens', icon: Monitor },
  { name: 'إكسسوارات', key: 'accessories', icon: Zap }, // 🎯 الفئة الهدف
  { name: 'أجهزة متاحة للتقسيط', key: 'installments', icon: CreditCard },
];

// 🌟 تعريف الفئات الفرعية للإكسسوارات
const ACCESSORIES_SUB_CATEGORIES = [
  { name: 'كل الإكسسوارات', key: 'accessories', icon: Zap }, // 💡 الافتراضي: يعرض كل الإكسسوارات
  { name: 'إكسسوارات هواتف', key: 'phones', icon: Smartphone },
  { name: 'إكسسوارات لابتوب', key: 'laptop', icon: Laptop },
  { name: 'إكسسوارات كمبيوتر', key: 'computer', icon: Monitor },
  { name: 'إكسسوارات كاميرات', key: 'cams', icon: Camera }, // تم التعديل من 'cam' إلى 'cams' للتوافق
  { name: 'شواحن وكابلات', key: 'chargers', icon: Zap },
];

// 🛠️ المكون ImageGalleryModal (دون تغيير)
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

  // 💡 إضافة دعم التنقل بلوحة المفاتيح
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
      className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative max-w-4xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow-lg z-10 transition-transform duration-300 hover:scale-110"
          aria-label="إغلاق الصورة المكبرة"
        >
          <X className="w-6 h-6" />
        </button>

        {/* عرض الصورة الحالية */}
        <div className="relative w-full aspect-video flex items-center justify-center bg-gray-900 rounded-2xl border-4 border-sky-500 shadow-[0_0_40px_rgba(0,255,200,0.6)]">
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
        // 🟢 التغيير هنا: bg-gradient-to-br from-green-400 via-sky-400 to-teal-500 | shadow-[0_0_25px_rgba(0,255,150,0.6)]
        className="fixed top-4 right-4 z-50 p-3 rounded-full bg-gradient-to-br from-green-400 via-sky-400 to-teal-500 text-white shadow-[0_0_25px_rgba(0,255,150,0.6)] transition-all duration-500 hover:scale-110"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="قائمة التنقل"
      >
        <Menu className="w-6 h-6" />
      </button>

      <nav
        // 🟢 التغيير هنا: الخلفية والحدود وظل النافذة
        // bg-gradient-to-b from-[#00140d] via-[#00281a] to-[#003c2c] | shadow-[0_0_30px_rgba(0,255,150,0.4)] | border-l border-green-500
        className={`fixed top-0 right-0 h-full w-64 bg-gradient-to-b from-[#00140d] via-[#00281a] to-[#003c2c] backdrop-blur-2xl shadow-[0_0_30px_rgba(0,255,150,0.4)] z-40 transform transition-transform duration-500 ease-in-out border-l border-green-500 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 pt-20">
          <h2 className="text-2xl font-bold mb-6 text-white tracking-wide">روابط سريعة</h2>
          <ul className="space-y-4">
            {staticLinks.map((link) => (
              <li key={link.name}>
                <Link href={link.href} onClick={() => setIsOpen(false)}>
                  <div 
                    // 🟢 التغيير هنا: hover:bg-gradient-to-r hover:from-green-600 hover:to-sky-600
                    className="flex items-center p-3 rounded-xl text-lg font-medium text-gray-200 hover:bg-gradient-to-r hover:from-green-600 hover:to-sky-600 hover:text-white transition duration-300 transform hover:translate-x-1 shadow-md border border-transparent cursor-pointer">
                    {/* 🟢 التغيير هنا: text-sky-400 */}
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
  // 🌟 حالة جديدة للفئة الفرعية للإكسسوارات
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  
  // 🎯 التعديل رقم 1: حالة جديدة للتحكم في ظهور العمود المنسدل للإكسسوارات
  const [isAccessoriesDropdownOpen, setIsAccessoriesDropdownOpen] = useState(false);


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

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, 'ads'));
        const adsData = querySnapshot.docs.map((doc) => {
          const data = doc.data();

          // 🛠️🛠️🛠️ التعديل الرئيسي لحل مشكلة ظهور الصور 🛠️🛠️🛠️
          let imagesArray: string[] = [];

          // 1. التعامل مع حقل 'images' (Map/Array) للإعلانات متعددة الصور
          if (data.images && typeof data.images === 'object' && !Array.isArray(data.images)) {
              // إذا كان الحقل Map كما في Firestore (مثلاً: {0: url1, 1: url2})
              // نحوله إلى مصفوفة من الروابط
              imagesArray = Object.values(data.images) as string[];
          } else if (Array.isArray(data.images)) {
              // إذا كان الحقل Array (افتراضياً أو بعد التحويل)
              imagesArray = data.images as string[];
          }
          
          // 2. التعامل مع حقل 'image' (String) للإعلانات ذات الصورة الواحدة
          // يتم إضافته فقط إذا كانت مصفوفة الصور فارغة لضمان عدم تكرار الصور
          if (imagesArray.length === 0 && data.image && typeof data.image === 'string') {
              imagesArray = [data.image];
          }
          
          // 3. فلترة الروابط الفارغة أو غير الصالحة
          imagesArray = imagesArray.filter(url => url && typeof url === 'string');
          // 🛠️🛠️🛠️ نهاية التعديل 🛠️🛠️🛠️

          return {
            id: doc.id,
            ...(data as Omit<Ad, 'id' | 'images'>), 
            category: (data.category || '').toLowerCase().trim(),
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

  // 🛠️ التعديل الجديد 3: دالة فتح نافذة المعاينة
  const openImageModal = (adImages: string[], activeImageUrl: string) => {
    // نجد مؤشر الصورة النشطة داخل مصفوفة الصور
    const index = adImages.findIndex(img => img === activeImageUrl);
    if (index !== -1) {
      setModalImages(adImages);
      setModalInitialIndex(index);
    } else if (adImages.length > 0) {
      // في حالة عدم العثور على الصورة، نعرض الأولى
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

  // 🌟 منطق الفلترة المحدث لتحقيق متطلبات الإكسسوارات
  const filteredAds = useMemo(() => {
    const filterKey = selectedCategory.toLowerCase().trim();

    if (filterKey === 'all') return allAds;

    // 1. فلترة على أساس الفئة الرئيسية أولاً
    let ads = allAds.filter(
      // بما أننا قمنا بتعديل صفحة الإضافة لحفظ الفئة الفرعية للإكسسوارات
      // في حقل ad.category، فإن الفلترة الأساسية هنا يجب أن تكون مطابقة لـ ad.category
      (ad) => ad.category && ad.category.toLowerCase() === filterKey
    );
    
    // 💡 الآن، يجب أن نأخذ في الاعتبار فئة الإكسسوارات بشكل خاص، حيث أن فئتها التفصيلية هي المخزنة في ad.category.
    // يجب أن نقوم بتحديث منطق الفلترة ليتوافق مع طريقة الحفظ الجديدة تماماً:

    // 💡 المنطق المعدل بالكامل:
    
    // 1. لأي فئة رئيسية عادية (phones, laptop, computer, installments)
    if (filterKey !== 'accessories') {
        return allAds.filter(ad => ad.category === filterKey);
    }
    
    // 2. إذا كانت الفئة الرئيسية المختارة هي 'accessories' (إكسسوارات)
    if (filterKey === 'accessories') {
        const subFilterKey = selectedSubCategory?.toLowerCase().trim();
        
        // 2.1 إذا تم اختيار "كل الإكسسوارات" (قيمة subFilterKey هي 'accessories' أو null)
        if (!subFilterKey || subFilterKey === 'accessories') {
            
            // قائمة بكل الفئات الفرعية الممكنة للإكسسوارات (التي تم حفظها في حقل category)
            const accessoryKeys = ACCESSORIES_SUB_CATEGORIES
                                    .map(c => c.key.toLowerCase().trim())
                                    .filter(k => k !== 'accessories'); // استثناء المفتاح الرئيسي

            // نعرض أي إعلان تم حفظ فئته كأحد مفاتيح الإكسسوارات الفرعية
            return allAds.filter(ad => 
                ad.category && accessoryKeys.includes(ad.category)
            );

        } else {
            // 2.2 إذا تم اختيار فئة فرعية محددة (مثل 'phones' أو 'laptop' التي تم حفظها في ad.category)
            // نعرض الإعلانات التي تم حفظها في قاعدة البيانات بحقل category يساوي subFilterKey
            return allAds.filter(ad => 
                ad.category && ad.category === subFilterKey
            );
        }
    }
    
    // إعادة كل شيء (للوقاية)
    return allAds;

  }, [allAds, selectedCategory, selectedSubCategory]);
  
  // 🌟 دالة لاختيار الفئة الفرعية للإكسسوارات وتغلق القائمة
  const handleSubCategorySelect = (key: string) => {
    setSelectedSubCategory(key.toLowerCase());
    setIsAccessoriesDropdownOpen(false); // إغلاق القائمة بعد الاختيار
  }


  // 🎯 التعديل رقم 2: تحديث دالة اختيار الفئة الرئيسية (تبسيط منطق الاختيار)
  const handleCategorySelect = (key: string) => {
    const newCategory = key.toLowerCase();
    
    // إذا تم الضغط على 'accessories':
    if (newCategory === 'accessories') {
        // إذا كانت هي الفئة الحالية: نغلق أو نفتح القائمة المنسدلة
        if (selectedCategory === 'accessories') {
          // إذا كانت القائمة مغلقة، نفتحها ونختار كل الإكسسوارات كافتراضي
            if (!isAccessoriesDropdownOpen) {
                setSelectedSubCategory('accessories');
            }
            setIsAccessoriesDropdownOpen(prev => !prev);
        } else {
            // إذا كانت فئة جديدة: نختارها ونفتح القائمة المنسدلة ونعيد تعيين الفئة الفرعية
            setSelectedCategory(newCategory);
            setSelectedSubCategory('accessories'); // اختيار 'كل الإكسسوارات' كافتراضي
            setIsAccessoriesDropdownOpen(true);
        }
    } else {
        // لأي فئة أخرى: نغلق القائمة المنسدلة ونختار الفئة
        setIsAccessoriesDropdownOpen(false);
        setSelectedCategory(newCategory);
        setSelectedSubCategory(null);
    }
    
    setExpandedAdId(null);
  }


  return (
    <main 
      // 🟢 التغيير هنا: الخلفية الرئيسية لـ main
      // from-[#03111b] via-[#051c27] to-[#072733]
      className="min-h-screen bg-gradient-to-b from-[#03111b] via-[#051c27] to-[#072733] pb-24 text-white relative overflow-hidden">
      {/* 🟢 التغيير هنا: نقاط الضوء في الخلفية - سماوي وأخضر فاتح */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,255,200,0.15),transparent_60%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(0,200,255,0.15),transparent_60%)] pointer-events-none"></div>

      <SideMenu />

      <div className="absolute top-6 left-6 flex flex-col items-center space-y-2">
        <Image
          src="/logo.jpg"
          alt="Logo"
          width={96}
          height={96}
          // 🟢 التغيير هنا: ظل الصورة والحدود - سماوي وأخضر فاتح
          className="rounded-full shadow-[0_0_50px_rgba(0,255,200,0.7)] border-4 border-green-500 object-cover w-24 h-24 sm:w-36 sm:h-36"
          unoptimized
        />
        <span className="text-sm sm:text-base font-semibold text-sky-200 tracking-widest">
          A.M <span className="text-green-400">Shreif</span>
        </span>
      </div>

      <header className="pt-28 pb-12 text-center max-w-4xl mx-auto px-4">
        {/* 🟢 التغيير هنا: تدرج العنوان - سماوي وأخضر فاتح */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight bg-gradient-to-r from-sky-400 via-teal-400 to-green-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,255,255,0.25)]">
          🛠️ A.M Shreif - عالمك للتقنيات والإلكترونيات
        </h1>
        <p className="text-base sm:text-lg text-gray-300 mt-5 max-w-2xl mx-auto">
          متاح صيانه جميع الاجهزه الالكترونيه A.M Shreif
        </p>
      </header>
      
      {/* 🎯 العمود المنسدل لفئات الإكسسوارات (الموقع الثابت الجديد) */}
      {isAccessoriesDropdownOpen && (
        <div 
          // الموقع الجديد: ثابت في أسفل الشاشة، ومتموضع في منتصفها (لأنه قد يكون الزر غير مرئي على الشاشات الصغيرة)
          // bottom-[80px] هي المسافة فوق الشريط السفلي (ارتفاع الشريط حوالي 60-70 بكسل)
          className="fixed bottom-[80px] left-1/2 transform -translate-x-1/2 z-50 w-64 md:w-80 p-3 bg-[#00140d] rounded-xl border border-sky-500 shadow-[0_0_20px_rgba(0,200,255,0.6)] animate-slideUp">
          <h4 className="text-center text-lg font-bold text-sky-400 border-b border-gray-700 pb-2 mb-2">فئات الإكسسوارات</h4>
          <div className="flex flex-col space-y-2">
              {ACCESSORIES_SUB_CATEGORIES.map((subCategory) => {
                  // المفتاح النشط هو الفئة الفرعية المخزنة
                  const isActive = selectedSubCategory === subCategory.key.toLowerCase();
                  return (
                      <button
                          key={subCategory.key}
                          onClick={() => handleSubCategorySelect(subCategory.key)}
                          className={`flex items-center text-sm font-medium px-3 py-2 rounded-lg transition-all duration-300 shadow-md ${
                              isActive
                                  ? 'bg-sky-600 text-white border border-green-400'
                                  : 'bg-gray-700/70 text-gray-300 hover:bg-sky-500/50'
                          }`}
                      >
                          <subCategory.icon className="w-5 h-5 ml-2" />
                          {subCategory.name}
                      </button>
                  );
              })}
          </div>
        </div>
      )}


      {/* ✅ أزرار الفئات الرئيسية (الشريط السفلي) */}
      <div 
        // 🟢 التغيير هنا: border-t border-green-700/50 | shadow-[0_0_30px_rgba(0,255,200,0.4)]
        className="fixed bottom-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-t border-green-700/50 shadow-[0_0_30px_rgba(0,255,200,0.4)] p-3">
        
        {/* الشريط السفلي للفئات الرئيسية */}
        <div className="max-w-7xl mx-auto flex justify-start sm:justify-center space-x-2 space-x-reverse overflow-x-auto pb-1 px-2">
          {CATEGORIES.map((category) => {
            // نستخدم isAccessoriesDropdownOpen لتمييز زر الإكسسوارات
            const isActive = selectedCategory === category.key.toLowerCase();
            const isAccessoriesButton = category.key.toLowerCase() === 'accessories';
            
            return (
              <button
                key={category.key}
                onClick={() => handleCategorySelect(category.key)}
                className={`flex items-center text-xs sm:text-sm font-semibold whitespace-nowrap px-3 sm:px-4 py-2 rounded-full transition-all duration-300 shadow-lg relative ${
                  isAccessoriesButton && isAccessoriesDropdownOpen
                    ? 'bg-red-600 text-white transform scale-105 shadow-red-500/50' // لون مختلف عند فتح القائمة المنسدلة
                    : isActive 
                    ? 'bg-gradient-to-r from-sky-500 to-green-500 text-white transform scale-105 shadow-green-500/50'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70'
                }`}
              >
                <category.icon className="w-4 h-4 ml-1" />
                {category.name}
              </button>
            );
          })}
        </div>
      </div>


      {/* ✅ الإعلانات (دون تغيير) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 mt-6">
        {loading ? (
          <p className="text-center text-gray-400 animate-pulse">جارٍ تحميل الإعلانات...</p>
        ) : filteredAds.length === 0 ? (
          <p className="text-center text-gray-400">لا توجد إعلانات حالياً في هذه الفئة.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredAds.map((ad, index) => {
              const isExpanded = expandedAdId === ad.id;
              
              // تحديد الصورة النشطة للعرض
              const mainImageSrc = activeImageInAd[ad.id] || ad.images[0] || '/default.jpg';
              
              // التحقق من وجود صور لعرض شريط المصغرات (حتى لو كانت صورة واحدة)
              const hasImagesToShowStrip = ad.images && ad.images.length > 0;

              return (
                <div key={ad.id} className="col-span-1 flex flex-col space-y-3">
                  <div
                    // 🟢 التغيير هنا: ظل بطاقة الإعلان - سماوي وأخضر
                    className={`relative rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,255,200,0.3)] group transform transition-all duration-700 hover:scale-[1.03] hover:shadow-[0_0_80px_rgba(0,200,255,0.5)] ${
                      isExpanded ? 'shadow-[0_0_80px_rgba(0,200,255,0.5)]' : ''
                    }`}
                  >
                    {/* 💡 الصورة الرئيسية (الكبيرة) */}
                    <Image
                      src={mainImageSrc} // 💡 استخدام الصورة النشطة (وهي الأولى إذا لم يتم اختيار غيرها)
                      alt={ad.name}
                      width={500}
                      height={200}
                      className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110 cursor-pointer"
                      priority={index < 3}
                      unoptimized={true}
                      onClick={() => openImageModal(ad.images, mainImageSrc)} // 💡 النقر على الصورة يفتح المعاينة مع كل الصور
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                    <div 
                      // 🟢 التغيير هنا: خلفية أسفل الإعلان - أزرق داكن
                      className="absolute bottom-0 left-0 right-0 p-6 text-white backdrop-blur-sm bg-gradient-to-r from-sky-900/60 to-transparent flex flex-col sm:flex-row justify-between items-start sm:items-end">
                      
                      {/* تفاصيل المنتج */}
                      <div>
                        {/* 🟢 التغيير هنا: نص الفئة - سماوي */}
                        <span className="text-sm opacity-90 text-green-300">{ad.category}</span>
                        <h3 className="text-xl sm:text-2xl font-bold mt-1 mb-2">{ad.name}</h3>
                        {/* 🟢 التغيير هنا: نص السعر - أخضر فاتح */}
                        <p className="text-xl sm:text-2xl font-semibold text-sky-300">{ad.price}</p>
                      </div>

                      {/* 🌟 مجموعة الأزرار */}
                      <div className="flex flex-col space-y-3 mt-4 sm:mt-0 sm:items-end">
                        
                        {/* 🌟 الزر الجديد: معاينة المنتج */}
                        <button
                          // 🟢 التغيير هنا: خلفية زر المعاينة - سماوي/أخضر
                          onClick={() => openImageModal(ad.images, mainImageSrc)} // 💡 يفتح المعاينة
                          className="flex items-center bg-teal-600 text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow-lg transition-all duration-500 hover:scale-105 hover:bg-teal-700 cursor-pointer justify-center"
                        >
                          <Eye className="w-4 h-4 ml-2" />
                          معاينة المنتج
                        </button>
                        
                        {/* زر اشتري الآن */}
                        <button
                          onClick={() => handleGoogleLogin(ad.id)}
                          className="flex items-center bg-yellow-600 text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow-lg transition-all duration-500 hover:scale-105 hover:bg-yellow-700 cursor-pointer justify-center"
                        >
                          <ShoppingBag className="w-4 h-4 ml-2" />
                          اشتري الآن
                        </button>

                        {/* زر شاهد/إخفاء التفاصيل */}
                        <button onClick={() => toggleDetails(ad.id)} className="w-full sm:w-auto">
                          <div
                            className={`flex items-center text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow-lg transition-all duration-500 hover:scale-105 cursor-pointer justify-center ${
                              isExpanded
                                ? 'bg-red-600 hover:bg-red-700 shadow-red-500/50'
                                // 🟢 التغيير هنا: تدرج زر التفاصيل - سماوي/أخضر
                                : 'bg-gradient-to-r from-sky-500 via-teal-500 to-green-500 hover:shadow-green-500/50'
                            }`}
                          >
                            {isExpanded ? (
                              <>
                                <ArrowUp className="w-4 h-4 ml-2" />
                                إخفاء التفاصيل
                              </>
                            ) : (
                              <>
                                <ExternalLink className="w-4 h-4 ml-2" />
                                شاهد التفاصيل
                              </>
                            )}
                          </div>
                        </button>

                        {/* زر تواصل واتساب */}
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto"
                        >
                          <div className="flex items-center bg-green-600 text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow-lg transition-all duration-500 hover:scale-105 hover:bg-green-700 cursor-pointer justify-center">
                            <MessageCircle className="w-4 h-4 ml-2" />
                            تواصل واتساب
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* 🛠️ شريط الصور المصغرة (يظهر إذا كان هناك صورة واحدة على الأقل) */}
                  {hasImagesToShowStrip && (
                    <div 
                      className="flex gap-2 justify-center py-2 px-1 bg-[#051c27] rounded-xl border border-gray-700/50 shadow-inner overflow-x-auto">
                      {ad.images.map((imgUrl, imgIndex) => (
                        <Image
                          key={`${ad.id}-${imgIndex}`}
                          src={imgUrl}
                          alt={`صورة مصغرة ${imgIndex + 1}`}
                          width={64}
                          height={64}
                          unoptimized
                          onClick={() => setActiveImageInAd({ ...activeImageInAd, [ad.id]: imgUrl })} // 💡 عند النقر، يعرض الصورة في الواجهة الرئيسية
                          className={`w-16 h-16 object-cover rounded-md cursor-pointer transition-all duration-300 ${
                            imgUrl === mainImageSrc ? 'border-2 border-green-500 p-[1px] scale-110 shadow-md' : 'border border-gray-600 hover:opacity-80'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {isExpanded && (
                    <div 
                        // 🟢 التغيير هنا: خلفية مربع الوصف وحدوده - أخضر/سماوي
                      className="p-6 bg-[#00281a] rounded-3xl border-2 border-green-500 shadow-[0_0_40px_rgba(0,255,200,0.4)] animate-slideDown">
                      {/* 🟢 التغيير هنا: عنوان الوصف والحد الفاصل - أخضر فاتح */}
                      <h4 className="text-xl font-bold text-green-400 mb-3 border-b border-green-400/50 pb-2">
                        الوصف التفصيلي
                      </h4>
                      <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                        {ad.description || 'لا يوجد وصف تفصيلي متوفر لهذا الإعلان حالياً.'}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 🛠️ استخدام المكون الجديد لنافذة المعاينة */}
      {modalImages && (
        <ImageGalleryModal
          images={modalImages}
          initialIndex={modalInitialIndex}
          onClose={closeImageModal}
        />
      )}

      <style jsx global>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.4s ease-out forwards;
        }
        
        /* 🎯 حركة ظهور العمود المنسدل */
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, 10px); /* يبدأ من أسفل قليلاً */
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
        }
      `}</style>
    </main>
  );
};

export default HomePage;