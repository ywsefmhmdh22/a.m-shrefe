 'use client';

import React, { useEffect, useState, useMemo } from 'react';
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
  CreditCard, // ✅ تم إضافة أيقونة البطاقة الائتمانية للتقسيط هنا
} from 'lucide-react';

// ✅ استيراد مكتبات تسجيل الدخول بجوجل
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { app } from './lib/firebaseConfig';

// ✅ نوع البيانات
interface Ad {
  id: string;
  name: string;
  price: string;
  category: string;
  image: string;
  description: string;
}

// ✅ قائمة الفئات (تمت إضافة فئة التقسيط)
const CATEGORIES = [
  { name: 'الكل', key: 'all', icon: Zap },
  { name: 'هواتف', key: 'هواتف', icon: Smartphone },
  { name: 'لابتوبات', key: 'لابتوبات', icon: Laptop },
  { name: 'كمبيوترات', key: 'كمبيوترات', icon: Monitor },
  { name: 'كاميرات مراقبة', key: 'كاميرات مراقبة', icon: Camera },
  { name: 'شاشات', key: 'شاشات', icon: Monitor },
  { name: 'اكسسوارات', key: 'اكسسوارات', icon: Zap },
  // 🆕 السطر الجديد لفئة الأجهزة المتاحة للتقسيط
  { name: 'أجهزة متاحة للتقسيط', key: 'اجهزه متاحه للتقسيط', icon: CreditCard }, 
];

// ✅ القائمة الجانبية
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
        className="fixed top-4 right-4 z-50 p-3 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white shadow-[0_0_25px_rgba(0,200,255,0.6)] transition-all duration-500 hover:scale-110"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="قائمة التنقل"
      >
        <Menu className="w-6 h-6" />
      </button>

      <nav
        className={`fixed top-0 right-0 h-full w-64 bg-gradient-to-b from-[#0b0020] via-[#1a0035] to-[#2c004e] backdrop-blur-2xl shadow-[0_0_30px_rgba(0,200,255,0.4)] z-40 transform transition-transform duration-500 ease-in-out border-l border-blue-500 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 pt-20">
          <h2 className="text-2xl font-bold mb-6 text-white tracking-wide">روابط سريعة</h2>
          <ul className="space-y-4">
            {staticLinks.map((link) => (
              <li key={link.name}>
                <Link href={link.href} onClick={() => setIsOpen(false)}>
                  <div className="flex items-center p-3 rounded-xl text-lg font-medium text-gray-200 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white transition duration-300 transform hover:translate-x-1 shadow-md border border-transparent cursor-pointer">
                    <link.icon className="w-5 h-5 ml-3 text-blue-400" />
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

// ✅ الصفحة الرئيسية
const HomePage: React.FC = () => {
  const [allAds, setAllAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedAdId, setExpandedAdId] = useState<string | null>(null);

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
        const adsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Ad, 'id'>),
          category: (doc.data().category || '').toLowerCase().trim(),
        }));
        setAllAds(adsData);
      } catch (error) {
        console.error('خطأ في جلب الإعلانات:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  // ✅ دالة تسجيل الدخول بجوجل
  const handleGoogleLogin = async (adId: string) => {
    try {
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('✅ تم تسجيل الدخول:', user.displayName, user.email);

      // بعد التسجيل التلقائي يدخل المستخدم لصفحة الدفع
      window.location.href = `/checkout?adId=${adId}`;
    } catch (error) {
      console.error('❌ خطأ أثناء تسجيل الدخول بجوجل:', error);
      alert('حدث خطأ أثناء تسجيل الدخول، حاول مرة أخرى.');
    }
  };

  const filteredAds = useMemo(() => {
    if (selectedCategory === 'all') return allAds;
    const filterKey = selectedCategory.toLowerCase().trim();
    return allAds.filter((ad) => ad.category.toLowerCase().trim() === filterKey);
  }, [allAds, selectedCategory]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#050014] via-[#0d0024] to-[#18003a] pb-24 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,200,255,0.15),transparent_60%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,0,200,0.15),transparent_60%)] pointer-events-none"></div>

      <SideMenu />

      {/* ✅ الشعار والعنوان */}
      <div className="absolute top-6 left-6 flex flex-col items-center space-y-2">
        <Image
          src="/logo.jpg"
          alt="Logo"
          width={96}
          height={96}
          className="rounded-full shadow-[0_0_50px_rgba(0,200,255,0.7)] border-4 border-blue-500 object-cover w-24 h-24 sm:w-36 sm:h-36"
          unoptimized
        />
        <span className="text-sm sm:text-base font-semibold text-blue-200 tracking-widest">
          A.M <span className="text-pink-400">Shreif</span>
        </span>
      </div>

      <header className="pt-28 pb-12 text-center max-w-4xl mx-auto px-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,255,255,0.25)]">
          🛠️ A.M Shreif - عالمك للتقنيات والإلكترونيات
        </h1>
        <p className="text-base sm:text-lg text-gray-300 mt-5 max-w-2xl mx-auto">
          كل ما تحتاجه من أجهزة وعروض حصرية، مقدمة من المالك والمشرف A.M Shreif.
        </p>
      </header>

      {/* ✅ أزرار الفئات */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-t border-blue-700/50 shadow-[0_0_30px_rgba(0,200,255,0.4)] p-3">
        <div className="max-w-7xl mx-auto flex justify-start sm:justify-center space-x-2 space-x-reverse overflow-x-auto pb-1 px-2">
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category.key.toLowerCase();
            return (
              <button
                key={category.key}
                onClick={() => {
                  setSelectedCategory(category.key.toLowerCase());
                  setExpandedAdId(null);
                }}
                className={`flex items-center text-xs sm:text-sm font-semibold whitespace-nowrap px-3 sm:px-4 py-2 rounded-full transition-all duration-300 shadow-lg ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-pink-500 text-white transform scale-105 shadow-blue-500/50'
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

      {/* ✅ الإعلانات */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 mt-24">
        {loading ? (
          <p className="text-center text-gray-400 animate-pulse">جارٍ تحميل الإعلانات...</p>
        ) : filteredAds.length === 0 ? (
          <p className="text-center text-gray-400">لا توجد إعلانات حالياً في هذه الفئة.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredAds.map((ad, index) => {
              const isExpanded = expandedAdId === ad.id;
              return (
                <div key={ad.id} className="col-span-1 flex flex-col space-y-3">
                  {/* ✅ كارت الإعلان */}
                  <div
                    className={`relative rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,200,255,0.3)] group transform transition-all duration-700 hover:scale-[1.03] hover:shadow-[0_0_80px_rgba(255,0,255,0.5)] ${
                      isExpanded ? 'shadow-[0_0_80px_rgba(255,0,255,0.5)]' : ''
                    }`}
                  >
                    <Image
                      src={ad.image || '/default.jpg'}
                      alt={ad.name}
                      width={500}
                      height={200}
                      className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110"
                      priority={index < 3}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white backdrop-blur-sm bg-gradient-to-r from-blue-900/60 to-transparent flex flex-col sm:flex-row justify-between items-start sm:items-end">
                      <div>
                        <span className="text-sm opacity-90 text-blue-300">{ad.category}</span>
                        <h3 className="text-xl sm:text-2xl font-bold mt-1 mb-2">{ad.name}</h3>
                        <p className="text-xl sm:text-2xl font-semibold text-pink-300">{ad.price}</p>
                      </div>

                      {/* ✅ أزرار التحكم */}
                      <div className="flex flex-col space-y-3 mt-4 sm:mt-0 sm:items-end">
                        <button
                          onClick={() => handleGoogleLogin(ad.id)}
                          className="flex items-center bg-yellow-600 text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow-lg transition-all duration-500 hover:scale-105 hover:bg-yellow-700 cursor-pointer justify-center"
                        >
                          <ShoppingBag className="w-4 h-4 ml-2" />
                          اشتري الآن
                        </button>

                        <button onClick={() => toggleDetails(ad.id)} className="w-full sm:w-auto">
                          <div
                            className={`flex items-center text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow-lg transition-all duration-500 hover:scale-105 cursor-pointer justify-center ${
                              isExpanded
                                ? 'bg-red-600 hover:bg-red-700 shadow-red-500/50'
                                : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:shadow-pink-500/50'
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

                  {/* ✅ التفاصيل أسفل الكارت */}
                  {isExpanded && (
                    <div className="p-6 bg-[#1a0035] rounded-3xl border-2 border-purple-500 shadow-[0_0_40px_rgba(255,0,255,0.4)] animate-slideDown">
                      <h4 className="text-xl font-bold text-purple-400 mb-3 border-b border-purple-400/50 pb-2">
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
      `}</style>
    </main>
  );
};

export default HomePage;