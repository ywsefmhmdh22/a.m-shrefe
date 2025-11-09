 "use client"; // ✅ تم تثبيت هذا التوجيه لحل مشكلة Client Component

import React, { useEffect, useState, useCallback } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithCustomToken,
  signInAnonymously,
  Auth,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  Firestore,
} from "firebase/firestore";
// 🌟 استيراد Firebase Storage
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  FirebaseStorage,
} from "firebase/storage";
import {
  Trash2,
  ArrowLeftCircle,
  CheckCircle,
  Clock,
  RotateCw,
  RefreshCw,
  X,
  Image, // أيقونة الصورة
} from "lucide-react";

// =========================================================
// 🔑 الإعدادات الثابتة
const YOUR_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBURbl944GjbkDvlp16L9xnoJ4m0uGKqpU",
  authDomain: "ertq-74b99.firebaseapp.com",
  projectId: "ertq-74b99",
  storageBucket: "ertq-74b99.appspot.com",
  messagingSenderId: "882908229895",
  appId: "1:882908229895:web:ca61b3cbeacdb8ad88d5a2",
  measurementId: "G-NH5DK3KYB8",
};

// =========================================================
// ✅ إصلاح خطأ TypeScript الأول
const appId = YOUR_FIREBASE_CONFIG.appId;
const firebaseConfig = YOUR_FIREBASE_CONFIG;
const initialAuthToken = null; // 🌟 تم التبسيط لإصلاح الخطأ

// ✅ نوع بيانات الإعلان
interface Ad {
  id: string;
  name: string;
  price: string;
  category: string;
  images: string[];
  description: string;
  isSold: boolean;
  date: string;
}

// 🟣 مكون Modal مخصص (ConfirmationModal)
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
  isAlert = false,
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 text-white p-6 rounded-xl shadow-2xl w-full max-w-md border border-blue-500/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
          <h3 className="text-xl font-bold text-pink-400">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="mb-6 text-gray-300 text-right">{message}</p>

        <div
          className={`flex ${
            isAlert ? "justify-center" : "justify-between"
          } space-x-2 space-x-reverse`}
        >
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
              isAlert
                ? "bg-blue-600 hover:bg-blue-700 w-full"
                : "bg-red-600 hover:bg-red-700 w-1/2"
            }`}
          >
            {isAlert ? "حسناً" : "تأكيد الحذف"}
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
  const [storageInstance, setStorageInstance] = useState<FirebaseStorage | null>(
    null
  );

  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Modal التأكيد
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalIsAlert, setModalIsAlert] = useState(false);
  const [actionToConfirm, setActionToConfirm] =
    useState<(() => Promise<void>) | null>(null);

  // 🟣 حالات تعديل الإعلان
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
  });
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [currentImageUrls, setCurrentImageUrls] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const ADS_COLLECTION_PATH = "ads";

  const openConfirmationModal = useCallback(
    (
      message: string,
      title: string,
      action: () => Promise<void>,
      isAlert = false
    ) => {
      setModalMessage(message);
      setModalTitle(title);
      setModalIsAlert(isAlert);
      setActionToConfirm(() => action);
      setShowModal(true);
    },
    []
  );

  // 🔹 فتح نافذة التعديل
  const handleEdit = (ad: Ad) => {
    setEditingAd(ad);
    setEditForm({
      name: ad.name,
      price: ad.price,
      category: ad.category,
      description: ad.description,
    });
    setCurrentImageUrls(ad.images || []);
    setNewImageFiles([]);
    setIsEditModalOpen(true);
  };

  // 🌟 دالة حذف رابط صورة محدد من قائمة الصور الحالية
  const handleRemoveCurrentImage = (urlToRemove: string) => {
    setCurrentImageUrls((prev) => prev.filter((url) => url !== urlToRemove));
  };

  // 🌟 دالة إلغاء رفع ملف صورة جديد
  const handleRemoveNewImage = (fileName: string) => {
    setNewImageFiles((prev) => prev.filter((file) => file.name !== fileName));
  };

  // 🌟 دالة رفع الصورة إلى Firebase Storage
  const uploadImage = async (file: File, adId: string): Promise<string> => {
    if (!storageInstance) throw new Error("Firebase Storage not initialized.");

    // نستخدم UUID لضمان تفرد اسم الملف
    const uniqueFileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(
      storageInstance,
      `ads_images/${adId}/${uniqueFileName}`
    );

    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  };

  // 🔹 تأكيد التعديل
  const handleConfirmEdit = async () => {
    if (!db || !editingAd) return;

    setUploadingImage(true);

    try {
      // 1. رفع جميع الصور الجديدة
      const newUrlsPromises = newImageFiles.map((file) =>
        uploadImage(file, editingAd.id)
      );
      const uploadedUrls = await Promise.all(newUrlsPromises);

      // 2. دمج الروابط القديمة المتبقية مع الروابط الجديدة المرفوعة
      const finalImageUrls = [...currentImageUrls, ...uploadedUrls];

      // 3. تحديث بيانات الإعلان في Firestore
      await updateDoc(doc(db, ADS_COLLECTION_PATH, editingAd.id), {
        name: editForm.name,
        price: editForm.price,
        category: editForm.category,
        description: editForm.description,
        images: finalImageUrls, // 🌟 تحديث مصفوفة الصور
      });

      // 🆕 التعديل الأساسي: تحديث قائمة الإعلانات محلياً لعرض الصور الجديدة فوراً في القائمة
      setAds((prevAds) =>
        prevAds.map((ad) =>
          ad.id === editingAd.id
            ? {
                ...ad,
                name: editForm.name,
                price: editForm.price,
                category: editForm.category,
                description: editForm.description,
                images: finalImageUrls, // تحديث مصفوفة الصور الجديدة/المعدلة
              }
            : ad
        )
      );
      // 🔚 نهاية التعديل الأساسي
      
      // 🌟 التعديل الإضافي: إعادة ضبط حالات الصور بعد النجاح لضمان نظافة المودال وتحديث الروابط
      setNewImageFiles([]);
      setCurrentImageUrls(finalImageUrls);
      setIsEditModalOpen(false);
      setEditingAd(null);
      

      openConfirmationModal(
        "تم تعديل الإعلان والصور بنجاح ✅",
        "نجاح",
        async () => {},
        true
      );
    } catch (error) {
      console.error("Error updating ad:", error);
      openConfirmationModal(
        "حدث خطأ أثناء تعديل الإعلان، قد تكون مشكلة في الرفع.",
        "خطأ",
        async () => {},
        true
      );
    } finally {
      setUploadingImage(false);
    }
  };

  // 🔹 تحديث الحقول أثناء الكتابة
  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 تحديث ملفات الصور الجديدة (الإصلاح الجديد هنا)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // نستخدم متغير 'files' للتحقق من قيمته
    const files = e.target.files;

    if (files) {
      // الآن TypeScript يعرف أن 'files' هي FileList وليست null
      setNewImageFiles((prev) => [...prev, ...Array.from(files)]);
      // مسح القيمة من الحقل
      e.target.value = '';
    }
  };

  // =========================================================
  // 🔥 Firebase Auth + Init
  // =========================================================
  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    const dbInstance = getFirestore(app);
    const authInstance = getAuth(app);
    const storageInstance = getStorage(app);

    setDb(dbInstance);
    setAuthInstance(authInstance);
    setStorageInstance(storageInstance);

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
    const unsubscribe = onSnapshot(
      adsQuery,
      (snapshot) => {
        const adsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...(data as Omit<Ad, "id" | "date" | "images">),
            // التأكد من أن 'images' هي مصفوفة، واستبدال 'image' القديمة بـ 'images'
            images: Array.isArray(data.images) ? data.images as string[] : (data.image ? [data.image] : []),
            date: data.timestamp?.toDate
              ? data.timestamp.toDate().toLocaleDateString("ar-EG")
              : "غير متوفر",
          }
        });
        setAds(adsData as Ad[]);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching ads: ", err);
        setError("فشل في تحميل الإعلانات.");
        setLoading(false);
      }
    );
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
      openConfirmationModal("فشل في حذف الإعلان.", "خطأ", async () => {}, true);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDelete = (adId: string) => {
    openConfirmationModal(
      "هل أنت متأكد من حذف هذا الإعلان نهائياً؟",
      "تأكيد الحذف",
      () => executeDelete(adId)
    );
  };

  const handleToggleStatus = async (adId: string, currentStatus: boolean) => {
    if (!db) return;
    setIsUpdating(adId);
    try {
      await updateDoc(doc(db, ADS_COLLECTION_PATH, adId), {
        isSold: !currentStatus,
      });
    } catch (e) {
      console.error("Error updating status:", e);
      openConfirmationModal(
        "فشل في تحديث الحالة.",
        "خطأ",
        async () => {},
        true
      );
    } finally {
      setIsUpdating(null);
    }
  };

  // =========================================================
  // 🖼️ واجهة العرض
  // =========================================================
  if (error) {
    return (
      <div className="p-8 text-center text-red-500 bg-red-900/20 rounded-xl m-4">
        خطأ: {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
        <span className="text-xl text-blue-400 mr-3">
          جاري تحميل الإعلانات...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0022] to-[#150035] p-4 sm:p-8 text-right text-white">
      
      {/* ========================================================== */}
      {/* سكريبت Google AdSense - تم إضافته هنا */}
      {/* ========================================================== */}
      <script 
        async 
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2620230909210931"
        crossOrigin="anonymous" 
      ></script>
      {/* ========================================================== */}
      
      <header className="max-w-7xl mx-auto mb-10 pt-10 flex justify-between items-center">
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">
            🗂️ إدارة الإعلانات المنشورة
          </h1>
          <p className="text-gray-300 text-lg">
            عرض وتعديل ({ads.length}) إعلان
          </p>
        </div>
        <a
          href="#dashboard"
          className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ArrowLeftCircle className="w-5 h-5 mr-2" />
          العودة للوحة التحكم
        </a>
      </header>

      <section className="max-w-7xl mx-auto space-y-4">
        {ads.length === 0 ? (
          <div className="p-10 text-center bg-gray-800/50 rounded-xl">
            <p className="text-xl text-yellow-400">لا توجد إعلانات حالياً.</p>
          </div>
        ) : (
          ads.map((ad) => {
            const isUpdatingThis = isUpdating === ad.id;
            const firstImageUrl = ad.images && ad.images.length > 0 ? ad.images[0] : null; // للحصول على الصورة الأولى
            
            return (
              <div
                key={ad.id}
                className="p-5 rounded-2xl bg-gray-800 border border-blue-500/50 flex flex-col md:flex-row items-start md:items-center justify-between"
              >
                <div className="flex items-center w-full md:w-auto"> 
                  {/* 🆕 عرض الصورة الأولى */}
                  {firstImageUrl && (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-600 ml-4 flex-shrink-0">
                          <img
                              src={firstImageUrl}
                              alt={ad.name}
                              className="w-full h-full object-cover"
                          />
                      </div>
                  )}
                  
                  {/* بيانات الإعلان */}
                  <div>
                    <h3 className="text-xl font-bold">{ad.name}</h3>
                    <p className="text-pink-400">{ad.price}</p>
                    <p className="text-gray-400 text-sm">الفئة: {ad.category}</p>
                  </div>
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
                    className={`px-4 py-2 rounded-full font-semibold text-sm ${
                      ad.isSold
                        ? "bg-yellow-600 hover:bg-yellow-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {ad.isSold ? "إعادة تفعيل" : "انتهت الكمية/بيع"}
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
      {isEditModalOpen && editingAd && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="bg-gray-900 text-white p-6 rounded-xl shadow-2xl w-full max-w-2xl border border-blue-500/50"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-blue-400 mb-6 text-center">
              ✏️ تعديل الإعلان: {editingAd.name}
            </h2>
            <div className="space-y-4 text-right">
              {/* 🌟 قسم إدارة الصور */}
              <div className="border border-gray-700 p-4 rounded-lg bg-gray-800">
                <label className="block text-sm mb-3 font-bold text-pink-400 flex items-center">
                  <Image className="w-5 h-5 ml-2" />
                  إدارة صور المنتج (يمكن الحذف والإضافة)
                </label>

                {/* عرض الصور الحالية */}
                {currentImageUrls.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2 text-gray-400">الصور الحالية ({currentImageUrls.length})</h4>
                    <div className="flex flex-wrap gap-3">
                      {currentImageUrls.map((url, index) => (
                        <div key={url} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-600 group">
                          <img
                            src={url}
                            alt={`صورة ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => handleRemoveCurrentImage(url)}
                            className="absolute top-0 left-0 bg-red-600 bg-opacity-75 p-1 text-white hover:bg-opacity-100 transition rounded-tr-lg"
                            title="حذف هذه الصورة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* عرض الصور الجديدة التي تنتظر الرفع */}
                {newImageFiles.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2 text-yellow-400">صور جديدة للإضافة ({newImageFiles.length})</h4>
                    <div className="space-y-1">
                      {newImageFiles.map((file, index) => (
                        <div key={index} className="flex justify-between items-center bg-gray-700/50 p-2 rounded text-sm">
                          <span className="truncate max-w-[70%]">{file.name}</span>
                          <button
                            onClick={() => handleRemoveNewImage(file.name)}
                            className="text-red-400 hover:text-red-300 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* حقل رفع الملفات الجديد */}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mt-3"
                />
              </div>
              {/* نهاية قسم إدارة الصور */}

              {/* حقول البيانات النصية */}
              <div>
                <label className="block text-sm mb-1">اسم الإعلان</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditInputChange}
                  className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">السعر</label>
                <input
                  type="text"
                  name="price"
                  value={editForm.price}
                  onChange={handleEditInputChange}
                  className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">الفئة</label>
                <input
                  type="text"
                  name="category"
                  value={editForm.category}
                  onChange={handleEditInputChange}
                  className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">الوصف</label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditInputChange}
                  className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-400 h-24"
                />
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-full bg-gray-600 hover:bg-gray-700 font-semibold"
                disabled={uploadingImage}
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmEdit}
                className={`px-4 py-2 rounded-full font-semibold transition ${
                  uploadingImage
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <>
                    <RotateCw className="w-4 h-4 ml-2 animate-spin inline-block" />
                    جاري الرفع...
                  </>
                ) : (
                  "تأكيد التعديل"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal التأكيد */}
      <ConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={async () => {
          if (actionToConfirm) await actionToConfirm();
        }}
        message={modalMessage}
        title={modalTitle}
        isAlert={modalIsAlert}
      />
    </div>
  );
};

export default UploadedAdsPage;