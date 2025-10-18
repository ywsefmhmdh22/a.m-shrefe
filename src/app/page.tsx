 'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
// ✅ استيراد مكون Image
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
} from 'lucide-react';

// ✅ نوع البيانات لتفادي Error: Unexpected any (تم إضافتها هنا)
interface Ad {
  id: string;
  name: string;
  price: string;
  category: string;
  image: string;
  description: string;
  // يمكن إضافة حقول أخرى مثل createdAt إذا كانت موجودة
}

// ✅ قائمة الفئات الثابتة
const CATEGORIES = [
  { name: 'الكل', key: 'all', icon: Zap },
  { name: 'هواتف', key: 'هواتف', icon: Smartphone },
  { name: 'لابتوبات', key: 'لابتوبات', icon: Laptop },
  { name: 'كمبيوترات', key: 'كمبيوترات', icon: Monitor },
  { name: 'اكسسوارات', key: 'اكسسوارات', icon: Zap },
];

// ✅ القائمة الجانبية
const SideMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const staticLinks = [
    { name: 'تواصل معنا', href: '/contact-us', icon: MessageSquare },
    { name: 'من نحن', href: '/about-us', icon: Users },
    { name: 'سياسة الخصوصية', href: '/privacy-policy', icon: BookOpen },
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
                <Link href={link.href}>
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
  // ✅ تم استبدال any[] بـ Ad[] لحل خطأ TypeScript
  const [allAds, setAllAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedAdId, setExpandedAdId] = useState<string | null>(null);

  const whatsappNumber = '01019287315';
  const whatsappLink = `https://wa.me/+2${whatsappNumber}?text=مرحباً، أرغب بالاستفسار عن إعلان شاهدته في الموقع.`;

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, 'ads'));
        // ✅ تم استخدام Omit<Ad, 'id'> لتعريف نوع البيانات بشكل صحيح
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

  const filteredAds = useMemo(() => {
    if (selectedCategory === 'all') return allAds;
    const filterKey = selectedCategory.toLowerCase().trim();
    return allAds.filter((ad) => ad.category === filterKey);
  }, [allAds, selectedCategory]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#050014] via-[#0d0024] to-[#18003a] pb-24 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,200,255,0.15),transparent_60%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,0,200,0.15),transparent_60%)] pointer-events-none"></div>

      <SideMenu />

      <div className="absolute top-6 left-6 flex flex-col items-center space-y-2">
        {/* ✅ استبدال img بـ Image وحل مشكلة السطر 229 */}
        <Image
          src="/logo.jpg"
          alt="Logo"
          width={144} // تعادل w-36
          height={144} // تعادل h-36
          className="rounded-full shadow-[0_0_50px_rgba(0,200,255,0.7)] border-4 border-blue-500 object-cover"
        />
        <span className="text-base font-semibold text-blue-200 tracking-widest">
          A.M <span className="text-pink-400">Shreif</span>
        </span>
      </div>

      <header className="pt-28 pb-12 text-center max-w-4xl mx-auto px-4">
        <h1 className="text-6xl font-extrabold leading-tight bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,255,255,0.25)]">
          🛠️ A.M Shreif - عالمك للتقنيات والإلكترونيات
        </h1>
        <p className="text-lg text-gray-300 mt-5 max-w-2xl mx-auto">
          كل ما تحتاجه من أجهزة وعروض حصرية، مقدمة من المالك والمشرف A.M Shreif.
        </p>
      </header>

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-t border-blue-700/50 shadow-[0_0_30px_rgba(0,200,255,0.4)] p-3">
        <div className="max-w-7xl mx-auto flex justify-center space-x-2 space-x-reverse overflow-x-auto pb-1">
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category.key.toLowerCase();
            return (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key.toLowerCase())}
                className={`flex items-center text-sm font-semibold whitespace-nowrap px-4 py-2 rounded-full transition-all duration-300 shadow-lg ${
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

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 mt-24">
        {loading ? (
          <p className="text-center text-gray-400 animate-pulse">جارٍ تحميل الإعلانات...</p>
        ) : filteredAds.length === 0 ? (
          <p className="text-center text-gray-400">لا توجد إعلانات حالياً في فئة: **{CATEGORIES.find((c) => c.key.toLowerCase() === selectedCategory)?.name || selectedCategory}**.</p>
        ) : (
          filteredAds.map((ad, index) => (
            <React.Fragment key={ad.id}>
              {/* بطاقة الإعلان الرئيسية */}
              <div
                className="relative rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,200,255,0.3)] group transform transition-all duration-700 hover:scale-[1.03] hover:shadow-[0_0_80px_rgba(255,0,255,0.5)]"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* ✅ استبدال img بـ Image وحل مشكلة السطر 339 */}
                <Image
                  src={ad.image || '/default.jpg'} // استخدام صورة افتراضية
                  alt={ad.name}
                  width={800} // عرض مناسب للتحسين
                  height={320} // ارتفاع مناسب (h-80 = 320px)
                  className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white backdrop-blur-sm bg-gradient-to-r from-blue-900/60 to-transparent flex flex-col sm:flex-row justify-between items-start sm:items-end">
                  <div>
                    <span className="text-sm opacity-90 text-blue-300">{ad.category}</span>
                    <h3 className="text-3xl font-bold mt-1 mb-2">{ad.name}</h3>
                    <p className="text-2xl font-semibold text-pink-300">{ad.price}</p>
                  </div>
                  <div className="flex flex-col space-y-3 mt-4 sm:mt-0 sm:items-end">
                    {/* زر شاهد التفاصيل */}
                    <button
                      onClick={() => setExpandedAdId(expandedAdId === ad.id ? null : ad.id)}
                      className="flex items-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold text-base shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-pink-500/50 cursor-pointer"
                    >
                      <ExternalLink className="w-5 h-5 ml-2" />
                      شاهد التفاصيل
                    </button>
                    {/* زر واتساب */}
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                      <div className="flex items-center bg-green-600 text-white px-6 py-3 rounded-full font-semibold text-base shadow-lg transition-all duration-500 hover:scale-105 hover:bg-green-700 cursor-pointer">
                        <MessageCircle className="w-5 h-5 ml-2" />
                        تواصل واتساب
                      </div>
                    </a>
                  </div>
                </div>
              </div>

              {/* تفاصيل الإعلان تظهر كعنصر منفصل أسفل الإعلان */}
              {expandedAdId === ad.id && (
                <div className="p-6 bg-[#2c004e] border border-blue-500/50 text-white rounded-3xl shadow-[0_0_30px_rgba(0,200,255,0.4)] transition-all duration-500 transform -mt-4 z-10 relative">
                  <h4 className="text-2xl font-bold text-pink-400 mb-4">✨ تفاصيل الإعلان:</h4>
                  <div className='bg-gray-900/50 p-4 rounded-xl mb-4'>
                    <p className="text-lg leading-relaxed text-gray-200">{ad.description}</p>
                  </div>
                  <p className='text-base'><span className="font-semibold text-blue-300">الفئة:</span> {ad.category}</p>
                  <p className='text-base'><span className="font-semibold text-blue-300">السعر:</span> {ad.price}</p>
                </div>
              )}
            </React.Fragment>
          ))
        )}
      </section>
    </main>
  );
};

export default HomePage;