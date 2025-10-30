 'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { Card, CardContent } from '../ui/card';
import { Users, ShoppingBag, BarChart3, DollarSign } from 'lucide-react';
import { db } from '@/app/lib/firebaseConfig';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';

interface Order {
  id: string;
  price: number;
  createdAt: string;
  status?: string; // ⬅️ حالة الطلب (مثلاً: completed أو cancelled)
}

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    adsCount: 0,
    ordersCount: 0,
    usersCount: 0,
    totalRevenue: 0,
  });

  const [salesData, setSalesData] = useState<{ month: string; sales: number }[]>([]);

  // 🟣 تسجيل زيارة المستخدم لمرة واحدة فقط
  useEffect(() => {
    const registerUserOnce = async () => {
      try {
        const visitorId = localStorage.getItem('unique_visitor_id');
        if (!visitorId) {
          const newUser = await addDoc(collection(db, 'users'), {
            createdAt: new Date().toISOString(),
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screen: `${window.screen.width}x${window.screen.height}`,
          });
          localStorage.setItem('unique_visitor_id', newUser.id);
        }
      } catch (error) {
        console.error('❌ خطأ أثناء تسجيل المستخدم:', error);
      }
    };

    registerUserOnce();
  }, []);

  // 🟢 متابعة البيانات من Firestore في الوقت الفعلي
  useEffect(() => {
    const unsubAds = onSnapshot(collection(db, 'ads'), (adsSnapshot) => {
      setStats((prev) => ({ ...prev, adsCount: adsSnapshot.size }));
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (usersSnapshot) => {
      setStats((prev) => ({ ...prev, usersCount: usersSnapshot.size }));
    });

    const unsubOrders = onSnapshot(collection(db, 'orders'), (ordersSnapshot) => {
      let totalRevenue = 0;
      const salesByMonth: Record<string, number> = {};
      let validOrdersCount = 0;

      ordersSnapshot.forEach((doc) => {
        const data = doc.data() as Order;

        // 🧩 نتجاهل الطلبات الملغاة
        if (data.status === 'cancelled') return;

        const price = Number(data.price) || 0;
        totalRevenue += price;
        validOrdersCount++;

        const month = new Date(data.createdAt || '').toLocaleString('ar-EG', {
          month: 'short',
        });

        salesByMonth[month] = (salesByMonth[month] || 0) + price;
      });

      const formattedSales = Object.entries(salesByMonth).map(([month, sales]) => ({
        month,
        sales,
      }));

      setStats((prev) => ({
        ...prev,
        ordersCount: validOrdersCount,
        totalRevenue,
      }));

      setSalesData(formattedSales);
    });

    // 🧹 تنظيف الاشتراكات عند الخروج
    return () => {
      unsubAds();
      unsubUsers();
      unsubOrders();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050014] to-[#12002a] text-white p-6">
      <motion.h1
        className="text-4xl font-extrabold mb-10 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-blue-400"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        📊 لوحة التحليلات والإحصائيات
      </motion.h1>

      {/* 🟢 الكروت العلوية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { title: 'الإعلانات', value: stats.adsCount, icon: ShoppingBag, color: 'from-purple-500 to-pink-500' },
          { title: 'الطلبات', value: stats.ordersCount, icon: BarChart3, color: 'from-blue-500 to-cyan-500' },
          { title: 'المستخدمين', value: stats.usersCount, icon: Users, color: 'from-green-500 to-emerald-500' },
          { title: 'الإيرادات', value: `${stats.totalRevenue} ج.م`, icon: DollarSign, color: 'from-yellow-500 to-orange-500' },
        ].map(({ title, value, icon: Icon, color }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-[#1a0035] border border-purple-800/50 shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-6 flex items-center space-x-4 space-x-reverse">
                <div
                  className={`p-4 rounded-full bg-gradient-to-r ${color} flex items-center justify-center shadow-lg`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-gray-400">{title}</p>
                  <h3 className="text-2xl font-bold text-white">{value}</h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* 🔵 الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 🔹 المبيعات الشهرية */}
        <Card className="bg-[#1a0035] border border-blue-800/50 rounded-2xl shadow-xl">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-blue-300">المبيعات الشهرية</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d006b" />
                <XAxis dataKey="month" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip contentStyle={{ backgroundColor: '#1a0035', border: '1px solid #444' }} />
                <Bar dataKey="sales" fill="#a855f7" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 🔹 نمو الإيرادات */}
        <Card className="bg-[#1a0035] border border-pink-800/50 rounded-2xl shadow-xl">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-pink-300">نمو الإيرادات</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d006b" />
                <XAxis dataKey="month" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip contentStyle={{ backgroundColor: '#1a0035', border: '1px solid #444' }} />
                <Line type="monotone" dataKey="sales" stroke="#ec4899" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
