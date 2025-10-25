 "use client"; // ✅ تم تثبيت هذا التوجيه لحل مشكلة Client Component

import React, { useEffect, useState, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    signInWithCustomToken, 
    signInAnonymously,
    Auth // استيراد نوع Auth
} from 'firebase/auth'; 
import { 
    getFirestore, 
    collection, 
    query, 
    onSnapshot, 
    doc, 
    updateDoc, 
    deleteDoc, 
    Firestore 
} from 'firebase/firestore';
import { Trash2, ArrowLeftCircle, CheckCircle, Clock, RotateCw, RefreshCw, X } from 'lucide-react'; 

// =========================================================
// 🔑 الإعدادات الثابتة
const YOUR_FIREBASE_CONFIG = {
    apiKey: "AIzaSyBURbl944GjbkDvlp16L9xnoJ4m0uGKqpU", 
    authDomain: "ertq-74b99.firebaseapp.com", 
    projectId: "ertq-74b99", 
    storageBucket: "ertq-74b99.appspot.com", 
    messagingSenderId: "882908229895",
    appId: "1:882908229895:web:ca61b3cbeacdb8ad88d5a2", 
    measurementId: "G-NH5DK3KYB8"
};

// تعريف المتغيرات العالمية لـ TypeScript (تم تركها كما هي لضمان التوافق)
declare const __app_id: string | undefined;
declare const __firebase_config: string | undefined;
declare const __initial_auth_token: string | undefined;
// =========================================================

// 🟢 يتم سحب القيم هنا
const appId = YOUR_FIREBASE_CONFIG.appId;
const firebaseConfig = YOUR_FIREBASE_CONFIG; 
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// ✅ تعريف نوع بيانات الإعلان
interface Ad {
    id: string;
    name: string;
    price: string;
    category: string;
    image: string;
    description: string;
    isSold: boolean; 
    date: string; 
}

// مكون Modal مخصص لاستبدال confirm() و alert()
interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    message: string;
    title: string;
    isAlert?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    message, 
    title, 
    isAlert = false
}) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-gray-800 text-white p-6 rounded-xl shadow-2xl w-full max-w-md border border-blue-500/50"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                    <h3 className="text-xl font-bold text-pink-400">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <p className="mb-6 text-gray-300 text-right">{message}</p>
                
                <div className={`flex ${isAlert ? 'justify-center' : 'justify-between'} space-x-2 space-x-reverse`}>
                    {!isAlert && (
                        <button 
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-600 rounded-full font-semibold hover:bg-gray-700 transition w-1/2"
                        >
                            إلغاء
                        </button>
                    )}
                    <button 
                        onClick={handleConfirm}
                        className={`px-4 py-2 rounded-full font-semibold transition ${
                            isAlert ? 'bg-blue-600 hover:bg-blue-700 w-full' : 'bg-red-600 hover:bg-red-700 w-1/2'
                        }`}
                    >
                        {isAlert ? 'حسناً' : 'تأكيد الحذف'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// المكون الرئيسي لإدارة الإعلانات
const UploadedAdsPage = () => {
    
    const [db, setDb] = useState<Firestore | null>(null);
    const [authInstance, setAuthInstance] = useState<Auth | null>(null); // حفظ مثيل المصادقة
    
    const [userId, setUserId] = useState<string | null>(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isUpdating, setIsUpdating] = useState<string | null>(null); 
    
    // حالة Modal التأكيد
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalTitle, setModalTitle] = useState('');
    const [modalIsAlert, setModalIsAlert] = useState(false);
    const [actionToConfirm, setActionToConfirm] = useState<(() => Promise<void>) | null>(null);

    // 🔴 التعديل الأول: تصحيح مسار المجموعة ليتوافق مع مجموعة "ads" الرئيسية
    const ADS_COLLECTION_PATH = 'ads'; 
    
    // دالة لفتح Modal التأكيد
    const openConfirmationModal = useCallback((message: string, title: string, action: () => Promise<void>, isAlert = false) => {
        setModalMessage(message);
        setModalTitle(title);
        setModalIsAlert(isAlert);
        setActionToConfirm(() => action);
        setShowModal(true);
    }, []);

    // 1. تهيئة Firebase والمصادقة
    useEffect(() => {
        const app = initializeApp(firebaseConfig); 
        const dbInstance = getFirestore(app);
        const authInstance = getAuth(app);
        setDb(dbInstance);
        setAuthInstance(authInstance); // حفظ المثيل

        const authenticate = async () => {
            try {
                if (initialAuthToken) {
                    await signInWithCustomToken(authInstance, initialAuthToken);
                } else {
                    await signInAnonymously(authInstance); 
                }
                setUserId(authInstance.currentUser?.uid || crypto.randomUUID());
                setIsAuthReady(true);
            } catch (err) {
                console.error("Firebase auth error, attempting anonymous sign-in:", err);
                
                // 🔴 التعديل الثاني: إزالة محاولة المصادقة المكررة داخل الـ catch
                // تم إزالة الأسطر: 
                // await signInAnonymously(authInstance); 
                // setUserId(authInstance.currentUser?.uid || crypto.randomUUID());
                // setIsAuthReady(true);
                
                // إذا فشلت المصادقة المباشرة، نظهر خطأ
                setError('فشل في المصادقة. يرجى التأكد من تفعيل خاصية "Anonymous" في Firebase.');
                setLoading(false);
            }
        };
        authenticate();
    }, []); 

    // 2. جلب الإعلانات من Firestore باستخدام onSnapshot
    useEffect(() => {
        if (!isAuthReady || !db) return;

        const adsCollectionRef = collection(db, ADS_COLLECTION_PATH);
        const adsQuery = query(adsCollectionRef);

        const unsubscribe = onSnapshot(adsQuery, (snapshot) => {
            const adsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as Omit<Ad, 'id' | 'date'>),
                // تحويل timestamp إلى تاريخ مقروء
                date: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate().toLocaleDateString('ar-EG') : 'تاريخ غير متوفر'
            }));
            setAds(adsData as Ad[]);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching ads: ", err);
            setError('فشل في تحميل الإعلانات من قاعدة البيانات.');
            setLoading(false);
        });

        return () => unsubscribe();
    }, [isAuthReady, db, ADS_COLLECTION_PATH]); 

    // 3. دالة تنفيذ حذف الإعلان
    const executeDelete = async (adId: string) => {
        if (!db) return;
        setIsUpdating(adId);
        try {
            await deleteDoc(doc(db, ADS_COLLECTION_PATH, adId));
        } catch (e) {
            console.error("Error deleting document: ", e);
            openConfirmationModal('فشل في حذف الإعلان. يرجى المحاولة مرة أخرى.', 'خطأ في الحذف', async () => {}, true);
        } finally {
            setIsUpdating(null);
        }
    };

    // 3. دالة لحذف الإعلان (تفتح الـ Modal)
    const handleDelete = (adId: string) => {
        openConfirmationModal(
            "هل أنت متأكد من رغبتك في حذف هذا الإعلان نهائياً؟ لا يمكن التراجع عن هذا الإجراء.",
            'تأكيد الحذف',
            () => executeDelete(adId)
        );
    };

    // 4. دالة لتغيير حالة البيع (انتهت الكمية)
    const handleToggleStatus = async (adId: string, currentStatus: boolean) => {
        if (!db) return;
        setIsUpdating(adId);
        try {
            await updateDoc(doc(db, ADS_COLLECTION_PATH, adId), {
                isSold: !currentStatus
            });
        } catch (e) {
            console.error("Error updating document status: ", e);
            openConfirmationModal('فشل في تحديث حالة الإعلان. يرجى المحاولة مرة أخرى.', 'خطأ في التحديث', async () => {}, true);
        } finally {
            setIsUpdating(null);
        }
    };


    if (error) {
        return <div className="p-8 text-center text-red-500 bg-red-900/20 rounded-xl m-4">خطأ: {error}</div>;
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
                <span className="text-xl text-blue-400 mr-3">جاري تحميل الإعلانات...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0022] to-[#150035] p-4 sm:p-8 font-[Inter] text-right text-white">
            
            {/* رأس الصفحة */}
            <header className="max-w-7xl mx-auto mb-10 pt-10 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 text-white tracking-wider bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">
                        🗂️ إدارة الإعلانات المنشورة
                    </h1>
                    <p className="text-gray-300 text-lg">
                        عرض وتعديل ({ads.length} إعلان) وحذف إعلاناتك في الوقت الفعلي.
                    </p>
                </div>
                <a href="#dashboard" className="flex items-center text-blue-400 hover:text-blue-300 transition-colors text-base font-semibold">
                    <ArrowLeftCircle className="w-5 h-5 mr-2" />
                    العودة للوحة التحكم
                </a>
            </header>
            
            {/* قائمة الإعلانات */}
            <section className="max-w-7xl mx-auto space-y-4">
                {ads.length === 0 ? (
                    <div className='p-10 text-center bg-gray-800/50 rounded-xl'>
                        <p className='text-xl text-yellow-400'>لا توجد إعلانات منشورة حالياً.</p>
                        <p className='text-gray-400 mt-2'>يمكنك إضافة إعلان جديد من لوحة التحكم.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {ads.map((ad) => {
                            const statusText = ad.isSold ? 'انتهت الكمية/تم البيع' : 'متوفر حالياً';
                            const statusColor = ad.isSold ? 'bg-red-600' : 'bg-green-600';
                            const isUpdatingThis = isUpdating === ad.id;

                            return (
                                <div 
                                    key={ad.id} 
                                    className={`flex flex-col md:flex-row items-start md:items-center justify-between p-5 rounded-2xl shadow-xl transition-all duration-300 ${
                                        ad.isSold ? 'bg-gray-800/70 border border-red-500/50 opacity-70' : 'bg-gray-800 border border-blue-500/50 hover:shadow-blue-500/30'
                                    }`}
                                >
                                    
                                    {/* تفاصيل الإعلان */}
                                    <div className="flex-1 min-w-0 mb-4 md:mb-0">
                                        <div className="flex items-center mb-1">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full text-white ml-3 ${statusColor}`}>
                                                {statusText}
                                            </span>
                                            <h3 className="text-xl font-bold text-white truncate">{ad.name}</h3>
                                        </div>
                                        <p className="text-lg font-semibold text-pink-400 mb-2 mr-2">{ad.price}</p>
                                        <p className="text-sm text-gray-400">الفئة: {ad.category} | تاريخ النشر: {ad.date}</p>
                                    </div>

                                    {/* الأزرار */}
                                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 sm:space-x-reverse w-full md:w-auto">
                                        
                                        {/* زر تغيير الحالة */}
                                        <button
                                            onClick={() => handleToggleStatus(ad.id, ad.isSold)}
                                            disabled={isUpdatingThis}
                                            className={`flex items-center justify-center px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 w-full sm:w-auto
                                                ${ad.isSold 
                                                    ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                                                    : 'bg-green-600 text-white hover:bg-green-700'}
                                                ${isUpdatingThis && 'opacity-50 cursor-not-allowed'}`}
                                        >
                                            {isUpdatingThis ? (
                                                <>
                                                    <RotateCw className="w-4 h-4 ml-2 animate-spin" />
                                                    جاري التحديث...
                                                </>
                                            ) : ad.isSold ? (
                                                <>
                                                    <CheckCircle className="w-4 h-4 ml-2" />
                                                    إعادة تفعيل
                                                </>
                                            ) : (
                                                <>
                                                    <Clock className="w-4 h-4 ml-2" />
                                                    انتهت الكمية/بيع
                                                </>
                                            )}
                                        </button>

                                        {/* زر حذف الإعلان */}
                                        <button
                                            onClick={() => handleDelete(ad.id)}
                                            disabled={isUpdatingThis}
                                            className={`flex items-center justify-center px-4 py-2 rounded-full font-semibold text-sm bg-red-600 text-white transition-all duration-300 w-full sm:w-auto hover:bg-red-700
                                                ${isUpdatingThis && 'opacity-50 cursor-not-allowed'}`}
                                        >
                                            {isUpdatingThis ? (
                                                <>
                                                    <RotateCw className="w-4 h-4 ml-2 animate-spin" />
                                                    جاري الحذف...
                                                </>
                                            ) : (
                                                <>
                                                    <Trash2 className="w-4 h-4 ml-2" />
                                                    حذف الإعلان
                                                </>
                                            )}
                                        </button>

                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            <footer className='text-center mt-10 text-gray-500 text-xs'>
                <p>معرّف التطبيق: {appId} | معرّف المستخدم: {userId}</p>
            </footer>

            {/* Modal التأكيد المخصص */}
            <ConfirmationModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={async () => {
                    if (actionToConfirm) {
                        await actionToConfirm();
                    }
                }}
                message={modalMessage}
                title={modalTitle}
                isAlert={modalIsAlert}
            />
        </div>
    );
};

export default UploadedAdsPage;