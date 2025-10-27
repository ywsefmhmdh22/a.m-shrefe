 "use client"; // ✅ تم تثبيت هذا التوجيه لحل مشكلة Client Component

import React, { useEffect, useState, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    signInWithCustomToken, 
    signInAnonymously,
    Auth 
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

// تعريف المتغيرات العالمية لـ TypeScript
declare const __app_id: string | undefined;
declare const __firebase_config: string | undefined;
declare const __initial_auth_token: string | undefined;
// =========================================================

const appId = YOUR_FIREBASE_CONFIG.appId;
const firebaseConfig = YOUR_FIREBASE_CONFIG; 
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// ✅ نوع بيانات الإعلان
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

// 🟣 مكون Modal مخصص
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

// =========================================================
// 🔵 المكون الرئيسي
// =========================================================
const UploadedAdsPage = () => {
    const [db, setDb] = useState<Firestore | null>(null);
    const [authInstance, setAuthInstance] = useState<Auth | null>(null);
    
    const [userId, setUserId] = useState<string | null>(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isUpdating, setIsUpdating] = useState<string | null>(null); 
    
    // Modal التأكيد
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalTitle, setModalTitle] = useState('');
    const [modalIsAlert, setModalIsAlert] = useState(false);
    const [actionToConfirm, setActionToConfirm] = useState<(() => Promise<void>) | null>(null);

    // 🟣 حالات تعديل الإعلان
    const [editingAd, setEditingAd] = useState<Ad | null>(null);
    const [editForm, setEditForm] = useState({ name: "", price: "", category: "", description: "" });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const ADS_COLLECTION_PATH = 'ads'; 
    
    const openConfirmationModal = useCallback((message: string, title: string, action: () => Promise<void>, isAlert = false) => {
        setModalMessage(message);
        setModalTitle(title);
        setModalIsAlert(isAlert);
        setActionToConfirm(() => action);
        setShowModal(true);
    }, []);

    // 🔹 فتح نافذة التعديل
    const handleEdit = (ad: Ad) => {
        setEditingAd(ad);
        setEditForm({
            name: ad.name,
            price: ad.price,
            category: ad.category,
            description: ad.description
        });
        setIsEditModalOpen(true);
    };

    // 🔹 تأكيد التعديل
    const handleConfirmEdit = async () => {
        if (!db || !editingAd) return;
        try {
            await updateDoc(doc(db, ADS_COLLECTION_PATH, editingAd.id), {
                name: editForm.name,
                price: editForm.price,
                category: editForm.category,
                description: editForm.description
            });
            openConfirmationModal('تم تعديل الإعلان بنجاح ✅', 'نجاح', async () => {}, true);
            setIsEditModalOpen(false);
            setEditingAd(null);
        } catch (error) {
            console.error("Error updating ad:", error);
            openConfirmationModal('حدث خطأ أثناء تعديل الإعلان.', 'خطأ', async () => {}, true);
        }
    };

    // 🔹 تحديث الحقول أثناء الكتابة
    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    // =========================================================
    // 🔥 Firebase Auth
    // =========================================================
    useEffect(() => {
        const app = initializeApp(firebaseConfig); 
        const dbInstance = getFirestore(app);
        const authInstance = getAuth(app);
        setDb(dbInstance);
        setAuthInstance(authInstance);

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
                console.error("Firebase auth error:", err);
                setError('فشل في المصادقة. يرجى تفعيل "Anonymous" في Firebase.');
                setLoading(false);
            }
        };
        authenticate();
    }, []); 

    // =========================================================
    // 🔍 جلب البيانات
    // =========================================================
    useEffect(() => {
        if (!isAuthReady || !db) return;
        const adsCollectionRef = collection(db, ADS_COLLECTION_PATH);
        const adsQuery = query(adsCollectionRef);
        const unsubscribe = onSnapshot(adsQuery, (snapshot) => {
            const adsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as Omit<Ad, 'id' | 'date'>),
                date: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate().toLocaleDateString('ar-EG') : 'غير متوفر'
            }));
            setAds(adsData as Ad[]);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching ads: ", err);
            setError('فشل في تحميل الإعلانات.');
            setLoading(false);
        });
        return () => unsubscribe();
    }, [isAuthReady, db]); 

    // =========================================================
    // 🔴 الحذف + تغيير الحالة
    // =========================================================
    const executeDelete = async (adId: string) => {
        if (!db) return;
        setIsUpdating(adId);
        try {
            await deleteDoc(doc(db, ADS_COLLECTION_PATH, adId));
        } catch (e) {
            console.error("Error deleting:", e);
            openConfirmationModal('فشل في حذف الإعلان.', 'خطأ', async () => {}, true);
        } finally {
            setIsUpdating(null);
        }
    };

    const handleDelete = (adId: string) => {
        openConfirmationModal("هل أنت متأكد من حذف هذا الإعلان نهائياً؟", 'تأكيد الحذف', () => executeDelete(adId));
    };

    const handleToggleStatus = async (adId: string, currentStatus: boolean) => {
        if (!db) return;
        setIsUpdating(adId);
        try {
            await updateDoc(doc(db, ADS_COLLECTION_PATH, adId), { isSold: !currentStatus });
        } catch (e) {
            console.error("Error updating status:", e);
            openConfirmationModal('فشل في تحديث الحالة.', 'خطأ', async () => {}, true);
        } finally {
            setIsUpdating(null);
        }
    };

    // =========================================================
    // 🖼️ واجهة العرض
    // =========================================================
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
        <div className="min-h-screen bg-gradient-to-b from-[#0a0022] to-[#150035] p-4 sm:p-8 text-right text-white">
            
            <header className="max-w-7xl mx-auto mb-10 pt-10 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">
                        🗂️ إدارة الإعلانات المنشورة
                    </h1>
                    <p className="text-gray-300 text-lg">عرض وتعديل ({ads.length}) إعلان</p>
                </div>
                <a href="#dashboard" className="flex items-center text-blue-400 hover:text-blue-300 transition-colors">
                    <ArrowLeftCircle className="w-5 h-5 mr-2" />
                    العودة للوحة التحكم
                </a>
            </header>
            
            <section className="max-w-7xl mx-auto space-y-4">
                {ads.length === 0 ? (
                    <div className='p-10 text-center bg-gray-800/50 rounded-xl'>
                        <p className='text-xl text-yellow-400'>لا توجد إعلانات حالياً.</p>
                    </div>
                ) : (
                    ads.map(ad => {
                        const isUpdatingThis = isUpdating === ad.id;
                        return (
                            <div key={ad.id} className="p-5 rounded-2xl bg-gray-800 border border-blue-500/50 flex flex-col md:flex-row items-start md:items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold">{ad.name}</h3>
                                    <p className="text-pink-400">{ad.price}</p>
                                    <p className="text-gray-400 text-sm">الفئة: {ad.category}</p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
                                    {/* زر تعديل */}
                                    <button
                                        onClick={() => handleEdit(ad)}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full font-semibold text-sm"
                                    >
                                        ✏️ تعديل الإعلان
                                    </button>

                                    {/* زر الحالة */}
                                    <button
                                        onClick={() => handleToggleStatus(ad.id, ad.isSold)}
                                        disabled={isUpdatingThis}
                                        className={`px-4 py-2 rounded-full font-semibold text-sm ${ad.isSold ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}
                                    >
                                        {ad.isSold ? 'إعادة تفعيل' : 'انتهت الكمية/بيع'}
                                    </button>

                                    {/* زر حذف */}
                                    <button
                                        onClick={() => handleDelete(ad.id)}
                                        disabled={isUpdatingThis}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-full font-semibold text-sm"
                                    >
                                        حذف الإعلان
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </section>

            {/* 🟣 نافذة تعديل الإعلان */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={() => setIsEditModalOpen(false)}>
                    <div className="bg-gray-900 text-white p-6 rounded-xl shadow-2xl w-full max-w-lg border border-blue-500/50" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold text-blue-400 mb-4 text-center">✏️ تعديل الإعلان</h2>
                        <div className="space-y-3 text-right">
                            <div>
                                <label className="block text-sm mb-1">اسم الإعلان</label>
                                <input type="text" name="name" value={editForm.name} onChange={handleEditInputChange} className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-400" />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">السعر</label>
                                <input type="text" name="price" value={editForm.price} onChange={handleEditInputChange} className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-400" />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">الفئة</label>
                                <input type="text" name="category" value={editForm.category} onChange={handleEditInputChange} className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-400" />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">الوصف</label>
                                <textarea name="description" value={editForm.description} onChange={handleEditInputChange} className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-400 h-24" />
                            </div>
                        </div>
                        <div className="flex justify-between mt-6">
                            <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 rounded-full bg-gray-600 hover:bg-gray-700 font-semibold">
                                إلغاء
                            </button>
                            <button onClick={handleConfirmEdit} className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 font-semibold">
                                تأكيد التعديل
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal التأكيد */}
            <ConfirmationModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={async () => { if (actionToConfirm) await actionToConfirm(); }}
                message={modalMessage}
                title={modalTitle}
                isAlert={modalIsAlert}
            />
        </div>
    );
};

export default UploadedAdsPage;
