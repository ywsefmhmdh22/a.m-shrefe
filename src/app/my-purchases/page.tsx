 'use client';

import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db, app } from '../lib/firebaseConfig';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingBag,
  ArrowLeft,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Zap,
} from 'lucide-react';

interface Order {
  id: string;
  adName: string;
  adPrice: string;
  adImage?: string;
  orderDate: string;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
}

const MyPurchasesPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email);
        try {
          setLoading(true);

          // 🔥 جلب الطلبات الخاصة بالمستخدم الحالي
          const q = query(
            collection(db, 'orders'),
            where('userEmail', '==', user.email),
            orderBy('orderDate', 'desc')
          );

          const snapshot = await getDocs(q);
          const userOrders = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Order, 'id'>),
          }));

          setOrders(userOrders);
        } catch (error) {
          console.error('❌ خطأ أثناء تحميل الطلبات:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setUserEmail(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'Confirmed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'Shipped':
        return <Truck className="w-5 h-5 text-blue-400" />;
      case 'Delivered':
        return <Zap className="w-5 h-5 text-purple-400" />;
      case 'Cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'Pending':
        return 'قيد الانتظار ⏳';
      case 'Confirmed':
        return 'تم التأكيد ✅';
      case 'Shipped':
        return 'جاري التوصيل 🚚';
      case 'Delivered':
        return 'تم التوصيل 🎉';
      case 'Cancelled':
        return 'ملغي ❌';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <p className="text-center text-gray-400 mt-20">
        جارٍ تحميل المشتريات...
      </p>
    );
  }

  if (!userEmail) {
    return (
      <div className="text-center mt-20 text-gray-300">
        <p>يجب تسجيل الدخول لعرض مشترياتك.</p>
        <Link href="/" className="text-blue-400 underline">
          العودة إلى الصفحة الرئيسية
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#050014] via-[#0d0024] to-[#18003a] text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-pink-400" /> مشترياتي
          </h1>
          <Link
            href="/"
            className="flex items-center text-blue-300 hover:text-blue-500 transition"
          >
            <ArrowLeft className="w-5 h-5 ml-2" /> عودة
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="text-center text-gray-400">
            لا توجد مشتريات حتى الآن.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {orders.map((order) => {
              // ✅ تأكد أن الصورة فعلاً رابط صالح
              const imageSrc =
                order.adImage && order.adImage.startsWith('http')
                  ? order.adImage
                  : '/default.jpg';

              return (
                <div
                  key={order.id}
                  className="bg-[#1a0035] rounded-3xl border border-purple-500 shadow-[0_0_25px_rgba(255,0,255,0.3)] p-5 flex flex-col justify-between"
                >
                  <div className="relative">
                    <Image
                      src={imageSrc}
                      alt={order.adName}
                      width={400}
                      height={200}
                      className="w-full h-48 object-cover rounded-xl mb-4 border border-purple-700"
                    />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-pink-400 mb-2">
                      {order.adName}
                    </h3>
                    <p className="text-gray-200 mb-2">
                      السعر: {order.adPrice} جنيه
                    </p>
                    <p className="text-gray-400 text-sm mb-4">
                      تاريخ الطلب:{' '}
                      {new Date(order.orderDate).toLocaleDateString('ar-EG')}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-purple-700 pt-3 mt-auto">
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      {getStatusIcon(order.status)}
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default MyPurchasesPage;
