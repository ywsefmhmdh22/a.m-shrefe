 // src/app/admin-orders/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Zap, User, Smartphone, MapPin, CreditCard, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';

// تعريف أنواع الطلبات
interface Order {
    id: string;
    adId: string;
    adName: string;
    adPrice: string;
    customerName: string;
    phone: string;
    address: string;
    paymentMethod: 'cashOnDelivery' | 'prepaid';
    orderDate: string;
    status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled'; 
}

const AdminOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null); 

    // ------------------------- الدوال المساعدة -------------------------
    
    const getPaymentMethodLabel = (method: string) => {
        switch (method) {
            case 'cashOnDelivery':
                return <span className="text-green-400 font-bold flex items-center"><CreditCard className='w-4 h-4 ml-1'/> الدفع عند الاستلام</span>;
            case 'prepaid':
                return <span className="text-blue-400 font-bold flex items-center"><CheckCircle className='w-4 h-4 ml-1'/> الدفع المسبق</span>;
            default:
                return method;
        }
    };

    const getStatusStyle = (status: Order['status']) => {
        switch (status) {
            case 'Pending':
                return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500';
            case 'Confirmed':
                return 'bg-green-600/20 text-green-300 border border-green-600';
            case 'Shipped': 
                return 'bg-blue-600/20 text-blue-300 border border-blue-600';
            case 'Delivered': 
                return 'bg-purple-600/20 text-purple-300 border border-purple-600';
            case 'Cancelled': 
                return 'bg-red-600/20 text-red-300 border border-red-600';
            default:
                return 'bg-gray-500/20 text-gray-300 border border-gray-500';
        }
    };

    const getStatusLabel = (status: Order['status']) => {
        switch (status) {
            case 'Pending': return 'قيد الانتظار';
            case 'Confirmed': return 'تم التأكيد (جاهز للشحن)';
            case 'Shipped': return 'جاري التوصيل 🚚';
            case 'Delivered': return 'تم التوصيل بنجاح ✅';
            case 'Cancelled': return 'ملغي 🚫';
            default: return status;
        }
    };
    
    // ------------------------- منطق جلب وتحديث الطلبات -------------------------

    const fetchOrders = useCallback(async () => {
        try {
            if(orders.length === 0) setLoading(true); 
            
            const response = await fetch('/api/orders'); 
            if (!response.ok) {
                throw new Error('فشل في جلب الطلبات');
            }
            const data: Order[] = await response.json();
            const sortedOrders = data.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
            setOrders(sortedOrders);
            setError('');
        } catch (err) {
            console.error('خطأ في جلب طلبات الأدمن:', err);
            setError('❌ فشل في تحميل الطلبات. تأكد من عمل Firebase و API Route بشكل صحيح.');
        } finally {
            setLoading(false);
        }
    }, [orders.length]);

    useEffect(() => {
        fetchOrders();
        const intervalId = setInterval(fetchOrders, 30000);

        // ===================================================================
        // 🎯 إضافة كود AdSense هنا لضمان تنفيذه على جهة العميل بعد التحميل
        // ===================================================================
        if (typeof window !== 'undefined') {
            const script = document.createElement('script');
            script.async = true;
            script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2620230909210931";
            script.crossOrigin = "anonymous"; 
            document.head.appendChild(script);
            
            // دالة التنظيف
            return () => {
                clearInterval(intervalId);
                if (document.head.contains(script)) {
                    document.head.removeChild(script);
                }
            };
        }
        // ===================================================================

        return () => clearInterval(intervalId);
    }, [fetchOrders]); 

    const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
        if (updatingOrderId) return;
        
        setUpdatingOrderId(orderId);
        setError('');

        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('فشل في تحديث الحالة');
            }

            setOrders(prevOrders => prevOrders.map(order => 
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
            
            fetchOrders(); 

        } catch (err) {
            console.error(`خطأ في تحديث الطلب ${orderId}:`, err);
            setError(`❌ فشل في تحديث حالة الطلب ${orderId}.`);
        } finally {
            setUpdatingOrderId(null);
        }
    };

    // ------------------------- تصميم الواجهة -------------------------

    if (loading && orders.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#050014] to-[#18003a] text-white">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400 ml-2" />
                <p className='text-lg'>جارٍ تحميل قائمة الطلبات...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#050014] to-[#18003a] text-white p-4 sm:p-8">
            <div className="max-w-7xl mx-auto py-12">
                <h1 className="text-4xl font-extrabold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-yellow-400 flex items-center justify-center">
                    <Zap className='w-8 h-8 ml-3 text-red-500' /> لوحة إشعارات طلبات الأدمن
                </h1>
                
                {error && <p className="text-red-400 text-center mb-6 p-3 bg-red-900/20 rounded-lg max-w-lg mx-auto">{error}</p>}
                
                <p className="text-lg text-gray-300 mb-8 text-center">
                    إجمالي الطلبات الواردة: <span className="font-bold text-yellow-400">{orders.length}</span> طلب.
                </p>

                {orders.length === 0 && !loading ? (
                    <p className="text-center text-xl text-gray-400 mt-20">لا توجد طلبات شراء جديدة حالياً. 😴</p>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order, index) => (
                            <div 
                                key={order.id} 
                                className={`p-6 rounded-2xl shadow-2xl transition-all duration-500 transform hover:scale-[1.01] ${getStatusStyle(order.status).replace('20', '30')}`} 
                            >
                                <div className="flex justify-between items-start mb-4 border-b border-gray-700 pb-3">
                                    <h2 className="text-xl font-bold text-pink-400 flex items-center">
                                        طلب رقم: <span className='text-blue-300 mr-1'>{orders.length - index}</span>
                                        {order.status === 'Pending' && <span className="mr-2 text-red-500 text-sm animate-pulse">(جديد)</span>}
                                    </h2>
                                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${getStatusStyle(order.status)}`}>
                                        {getStatusLabel(order.status)}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-300">
                                    {/* بيانات المنتج */}
                                    <div className='border-l border-gray-700 pl-4'>
                                        <p className="font-bold text-blue-300 mb-1">المنتج:</p>
                                        <p className="text-lg font-semibold">{order.adName}</p>
                                        <p className="text-sm">السعر: <span className='text-yellow-300 font-bold'>{order.adPrice}</span></p>
                                    </div>

                                    {/* بيانات العميل */}
                                    <div className='border-l border-gray-700 pl-4'>
                                        <p className="font-bold text-blue-300 mb-1">العميل:</p>
                                        <div className="flex items-center text-sm"><User className='w-4 h-4 ml-1'/> {order.customerName}</div>
                                        <div className="flex items-center text-sm"><Smartphone className='w-4 h-4 ml-1'/> <a href={`tel:+2${order.phone}`} className='hover:underline'>{order.phone}</a></div>
                                        <div className="flex items-center text-sm"><MapPin className='w-4 h-4 ml-1'/> {order.address}</div>
                                    </div>
                                    
                                    {/* التوقيت والدفع */}
                                    <div>
                                        <p className="font-bold text-blue-300 mb-1">التوقيت والدفع:</p>
                                        <span className="flex items-center text-gray-400 text-sm"><Clock className='w-4 h-4 ml-1'/> {new Date(order.orderDate).toLocaleString('ar-EG')}</span>
                                        <span className='text-sm mt-1 block'>{getPaymentMethodLabel(order.paymentMethod)}</span>
                                    </div>
                                </div>
                                
                                {/* ------------------------- أزرار الإجراءات ------------------------- */}
                                <div className="mt-6 pt-4 border-t border-gray-700 flex flex-wrap gap-3 justify-end">
                                    
                                    {/* 1. زر تأكيد الطلب (Pending -> Confirmed) */}
                                    {order.status === 'Pending' && (
                                        <button 
                                            onClick={() => updateOrderStatus(order.id, 'Confirmed')}
                                            disabled={updatingOrderId === order.id}
                                            className='flex items-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-full text-sm transition duration-300 shadow-md disabled:bg-gray-500'
                                        >
                                            {updatingOrderId === order.id ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <CheckCircle className='w-4 h-4 ml-2'/>}
                                            تأكيد الطلب
                                        </button>
                                    )}

                                    {/* 2. زر جاري التوصيل (Confirmed -> Shipped) - تم حل التحذير هنا */}
                                    {(order.status === 'Confirmed' || order.status === 'Shipped') && (
                                        <button 
                                            onClick={() => updateOrderStatus(order.id, 'Shipped')}
                                            disabled={updatingOrderId === order.id}
                                            className='flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-full text-sm transition duration-300 shadow-md disabled:bg-gray-500'
                                        >
                                            {updatingOrderId === order.id ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Truck className='w-4 h-4 ml-2'/>}
                                            جاري التوصيل
                                        </button>
                                    )}

                                    {/* 3. زر تم التوصيل (Shipped -> Delivered) */}
                                    {order.status === 'Shipped' && (
                                        <button 
                                            onClick={() => updateOrderStatus(order.id, 'Delivered')}
                                            disabled={updatingOrderId === order.id}
                                            className='flex items-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-full text-sm transition duration-300 shadow-md disabled:bg-gray-500'
                                        >
                                            {updatingOrderId === order.id ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <CheckCircle className='w-4 h-4 ml-2'/>}
                                            تم التوصيل
                                        </button>
                                    )}

                                    {/* 4. زر إلغاء الطلب (يظهر طالما لم يتم التوصيل أو الإلغاء بالفعل) */}
                                    {(order.status !== 'Delivered' && order.status !== 'Cancelled') && (
                                        <button 
                                            onClick={() => updateOrderStatus(order.id, 'Cancelled')}
                                            disabled={updatingOrderId === order.id}
                                            className='flex items-center bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-full text-sm transition duration-300 shadow-md disabled:bg-gray-500'
                                        >
                                            {updatingOrderId === order.id ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <XCircle className='w-4 h-4 ml-2'/>}
                                            إلغاء الطلب
                                        </button>
                                    )}
                                    
                                    {/* زر التواصل عبر واتساب */}
                                    <a 
                                        href={`https://wa.me/+2${order.phone}?text=مرحباً ${order.customerName}، نود تأكيد طلبك للمنتج: ${order.adName}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className='bg-green-700 hover:bg-green-800 text-white font-semibold py-2 px-4 rounded-full text-sm transition duration-300 shadow-md'
                                    >
                                        تواصل واتساب
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrdersPage;