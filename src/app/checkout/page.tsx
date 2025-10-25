 'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { db, app } from '@/app/lib/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Image from 'next/image';
import {
  ShoppingCart,
  User,
  Smartphone,
  MapPin,
  CreditCard,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

interface Ad {
  id: string;
  name: string;
  price: string;
  category: string;
  image: string;
  description: string;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const adId = searchParams.get('adId');

  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null); // ✅ لحفظ إيميل المستخدم
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    address: '',
    paymentMethod: 'cashOnDelivery',
  });
  const [submissionStatus, setSubmissionStatus] = useState<
    'idle' | 'loading' | 'success' | 'failed'
  >('idle');

  // ✅ متابعة المستخدم الحالي (علشان نجيب الإيميل بتاعه)
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email) setUserEmail(user.email);
      else setUserEmail(null);
    });
    return () => unsubscribe();
  }, []);

  // 🟣 جلب بيانات الإعلان من Firestore
  useEffect(() => {
    if (!adId) {
      setError('❌ لم يتم تحديد رقم الإعلان.');
      setLoading(false);
      return;
    }

    const fetchAd = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, 'ads', adId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setAd({ id: docSnap.id, ...(docSnap.data() as Omit<Ad, 'id'>) });
        } else {
          setError('❌ الإعلان المطلوب غير موجود.');
        }
      } catch (err) {
        console.error('خطأ في جلب الإعلان:', err);
        setError('❌ حدث خطأ أثناء جلب تفاصيل الإعلان.');
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [adId]);

  // 🟣 تحديث حقول النموذج
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 🟣 إرسال الطلب إلى API Route
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ad) return;

    setSubmissionStatus('loading');
    setError('');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adId: ad.id,
          adName: ad.name,
          adPrice: ad.price,
          ...formData,
          orderDate: new Date().toISOString(),
          status: 'Pending',
          userEmail, // ✅ هنا أضفنا البريد الإلكتروني للمستخدم
        }),
      });

      if (!response.ok) throw new Error('فشل في إرسال الطلب');

      setSubmissionStatus('success');
    } catch (err) {
      console.error('خطأ في تأكيد الشراء:', err);
      setError('فشل في تأكيد الشراء. يرجى المحاولة مرة أخرى.');
      setSubmissionStatus('failed');
    }
  };

  // 🟡 شاشة التحميل
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#050014] to-[#18003a] text-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400 ml-2" />
        <p className="text-lg">جارٍ تحميل بيانات الإعلان...</p>
      </div>
    );
  }

  // 🟡 شاشة الخطأ
  if (error || !ad) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#050014] to-[#18003a] text-white p-6 text-center">
        <p className="text-xl text-red-500 mb-4">{error}</p>
        <Link
          href="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-full transition duration-300"
        >
          العودة للصفحة الرئيسية
        </Link>
      </div>
    );
  }

  // 🟢 شاشة نجاح الطلب
  if (submissionStatus === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#050014] to-[#18003a] text-white p-6 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400">
          تم تأكيد طلبك بنجاح!
        </h2>
        <p className="text-lg text-gray-300 mb-8 max-w-lg">
          سنتواصل معك قريباً على رقم{' '}
          <span className="font-bold text-yellow-300">
            {formData.phone}
          </span>{' '}
          لتأكيد تفاصيل الشراء وعملية الدفع. شكراً لثقتك بنا.
        </p>
        <Link
          href="/"
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-full transition duration-300 shadow-lg"
        >
          العودة للمتجر
        </Link>
      </div>
    );
  }

  // 🟣 واجهة صفحة الدفع الرئيسية
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050014] to-[#18003a] text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto py-12">
        <h1 className="text-4xl font-extrabold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-400">
          🛒 صفحة تأكيد الشراء
        </h1>

        {/* 🟣 تفاصيل المنتج */}
        <div className="bg-[#1a0035] p-6 rounded-2xl shadow-xl mb-8 border border-purple-700/50">
          <h2 className="text-2xl font-bold mb-4 text-blue-300 border-b border-blue-500/50 pb-2 flex items-center">
            <ShoppingCart className="w-6 h-6 ml-2" /> تفاصيل المنتج
          </h2>
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 sm:space-x-reverse">
            <Image
              src={ad.image || '/default.jpg'}
              alt={ad.name}
              width={120}
              height={120}
              className="rounded-lg object-cover shadow-lg border-2 border-pink-500"
            />
            <div>
              <p className="text-xl font-semibold">{ad.name}</p>
              <p className="text-lg font-bold text-pink-400 mt-1">
                السعر: {ad.price}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                الفئة: {ad.category}
              </p>
            </div>
          </div>
        </div>

        {/* 🟣 نموذج بيانات العميل */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#1a0035] p-6 rounded-2xl shadow-xl border border-blue-700/50"
        >
          <h2 className="text-2xl font-bold mb-6 text-pink-300 border-b border-pink-500/50 pb-2">
            بيانات العميل وطريقة الدفع
          </h2>

          {/* 🟡 الحقول */}
          <div className="space-y-6 mb-8">
            <div className="relative">
              <User className="absolute top-3 right-3 w-5 h-5 text-blue-400" />
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="الاسم كاملاً"
                required
                className="w-full p-3 pr-10 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-gray-400 transition"
              />
            </div>

            <div className="relative">
              <Smartphone className="absolute top-3 right-3 w-5 h-5 text-blue-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="رقم الهاتف للتواصل"
                required
                className="w-full p-3 pr-10 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-gray-400 transition"
              />
            </div>

            <div className="relative">
              <MapPin className="absolute top-3 right-3 w-5 h-5 text-blue-400" />
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="العنوان التفصيلي (المحافظة، المنطقة، الشارع، رقم المنزل)"
                required
                rows={3}
                className="w-full p-3 pr-10 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-gray-400 transition resize-none"
              />
            </div>
          </div>

          {/* 🟣 طرق الدفع */}
          <h3 className="text-xl font-semibold mb-4 text-blue-200 flex items-center">
            <CreditCard className="w-5 h-5 ml-2" /> اختيار وسيلة الدفع:
          </h3>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8 sm:space-x-reverse mb-8">
            <label
              className={`flex items-center p-4 rounded-xl cursor-pointer transition duration-300 w-full ${
                formData.paymentMethod === 'cashOnDelivery'
                  ? 'bg-green-600/50 border-2 border-green-500 shadow-lg'
                  : 'bg-gray-700/50 border border-gray-600 hover:bg-gray-600/70'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="cashOnDelivery"
                checked={formData.paymentMethod === 'cashOnDelivery'}
                onChange={handleChange}
                className="form-radio h-5 w-5 text-green-500 ml-3"
              />
              <span className="text-lg font-medium">
                💰 الدفع عند الاستلام
              </span>
            </label>

            <label
              className={`flex items-center p-4 rounded-xl cursor-pointer transition duration-300 w-full ${
                formData.paymentMethod === 'prepaid'
                  ? 'bg-blue-600/50 border-2 border-blue-500 shadow-lg'
                  : 'bg-gray-700/50 border border-gray-600 hover:bg-gray-600/70'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="prepaid"
                checked={formData.paymentMethod === 'prepaid'}
                onChange={handleChange}
                className="form-radio h-5 w-5 text-blue-500 ml-3"
              />
              <span className="text-lg font-medium">
                💳 الدفع المسبق (سيتم التواصل لتفاصيل الدفع)
              </span>
            </label>
          </div>

          {/* 🟢 زر تأكيد الشراء */}
          <button
            type="submit"
            disabled={submissionStatus === 'loading'}
            className="w-full py-3 mt-4 text-lg font-semibold rounded-full transition-all duration-300 shadow-xl disabled:opacity-60 disabled:cursor-not-allowed
                       bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white flex items-center justify-center"
          >
            {submissionStatus === 'loading' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin ml-2" />
                جارٍ تأكيد الطلب...
              </>
            ) : (
              '🚀 تأكيد الشراء الآن'
            )}
          </button>

          {error && <p className="text-red-400 text-center mt-4">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#050014] to-[#18003a] text-white">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 ml-2" />
          <p className="text-lg">جاري تحميل الصفحة...</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
