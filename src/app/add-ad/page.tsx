 "use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../lib/firebaseConfig";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image"; 

const db = getFirestore(app);
const storage = getStorage(app);

// ----------------------------------------------------------------------------------
// تعريف أنواع (Types) مُحدثة للـ TypeScript
// ----------------------------------------------------------------------------------

interface FormData {
  title: string;
  description: string;
  // حقل السعر سيخزن كسلسلة نصية لتحكم أفضل في الإدخال
  price: string; 
  category: string;
  videoUrl: string; 
}

interface ImageFileWithPreview {
  file: File;
  preview: string;
}

// ----------------------------------------------------------------------------------
// المكون الرئيسي AddAdPage
// ----------------------------------------------------------------------------------

export default function AddAdPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    price: "",
    category: "phones",
    videoUrl: "", 
  });

  const [images, setImages] = useState<ImageFileWithPreview[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const MAX_IMAGES = 4; 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // التأكد من أن حقل السعر يقبل الأرقام فقط دون تغيير شكله
    if (name === 'price') {
      // يسمح فقط بالأرقام (0-9) والفواصل العشرية (اختياري)
      const numericValue = value.replace(/[^0-9.]/g, ''); 
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files)
        .slice(0, MAX_IMAGES - images.length)
        .map(file => ({
          file: file,
          preview: URL.createObjectURL(file),
        }));
        
      setImages(prevImages => [...prevImages, ...newFiles]);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };
  
  const handleVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      toast.success("تم اختيار ملف الفيديو بنجاح");
    } else {
      setVideoFile(null);
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      setVideoPreview(null);
    }
  };
  
  // ✅ عملية رفع الملفات بالتوازي (Promise.all) لسرعة فائقة
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.category || images.length === 0) {
      toast.error("من فضلك املأ جميع الحقول الأساسية وأضف صورة واحدة على الأقل");
      return;
    }

    try {
      setLoading(true);
      toast.loading("جاري رفع الملفات (صور وفيديو)... يرجى الانتظار", { id: 'uploading' });

      // 1. إعداد قائمة بمهام الرفع (Upload Promises)
      const uploadTasks: Promise<string>[] = [];
      
      images.forEach(img => {
        const storageRef = ref(storage, `ads/${Date.now()}_${img.file.name}`);
        const uploadPromise = uploadBytes(storageRef, img.file).then(() => getDownloadURL(storageRef));
        uploadTasks.push(uploadPromise);
      });
      
      if (videoFile) {
        const videoRef = ref(storage, `videos/${Date.now()}_${videoFile.name}`);
        const videoUploadPromise = uploadBytes(videoRef, videoFile).then(() => getDownloadURL(videoRef));
        uploadTasks.push(videoUploadPromise);
      }
      
      // 2. تنفيذ الرفع بالتوازي
      const urls = await Promise.all(uploadTasks);

      // 3. فصل روابط الصور عن رابط الفيديو
      let videoUrl: string | null = formData.videoUrl || null;
      const imageUrls: string[] = urls.slice(0, images.length); 

      if (videoFile) {
        videoUrl = urls[urls.length - 1];
      }
      
      toast.dismiss('uploading');
      toast.success("تم رفع جميع الملفات بنجاح!");
      toast.loading("جاري حفظ بيانات الإعلان...");
      
      // 4. حفظ بيانات الإعلان في Firestore
      const priceToSave = formData.price ? Number(formData.price) : null;
      
      await addDoc(collection(db, "ads"), {
        name: formData.title, 
        description: formData.description,
        price: priceToSave, 
        videoUrl: videoUrl,
        images: imageUrls, 
        category: formData.category.toLowerCase().trim(),
        createdAt: serverTimestamp(),
      });

      toast.dismiss();
      toast.success("تمت إضافة الإعلان بنجاح!");
      
      // إزالة روابط المعاينة من الذاكرة
      images.forEach(img => URL.revokeObjectURL(img.preview));
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      
      setTimeout(() => router.push("/"), 1500);
    } catch (error) {
      toast.dismiss('uploading');
      console.error("خطأ أثناء الإضافة:", error);
      toast.error("حدث خطأ أثناء حفظ الإعلان.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-6">
      <Toaster position="top-center" />
      {/* 🛠️ الحل: إضافة suppressHydrationWarning */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        suppressHydrationWarning={true} 
        className="bg-gray-800/70 backdrop-blur-lg shadow-2xl rounded-2xl p-8 w-full max-w-lg border border-gray-700"
      >
        <h1 className="text-3xl font-bold text-center mb-6 text-amber-400">🛍️ إضافة إعلان جديد</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* حقول العنوان والوصف */}
          <input
            type="text"
            name="title"
            placeholder="عنوان الإعلان"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-amber-400 outline-none"
            required
          />
          <textarea
            name="description"
            placeholder="وصف الإعلان"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-amber-400 outline-none h-28 resize-none"
            required
          />
          
          {/* ✅ حقل السعر المُصحح: تم تغيير pr-16 إلى pl-16 */}
          <div className="relative">
            <input
              type="text"
              name="price"
              placeholder="السعر (جنيه مصري - اختياري)"
              value={formData.price}
              onChange={handleChange}
              // ✅ التصحيح: استخدام pl-16 (Padding Left) لترك مساحة لرمز العملة
              className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-amber-400 outline-none pl-16"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 bg-gray-700 py-1 px-2 rounded-lg pointer-events-none">
              ج.م
            </span>
          </div>

          {/* قائمة الفئات المُحدثة */}
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-amber-400 outline-none"
            required
          >
            <option value="phones">📱 هواتف</option>
            <option value="laptops">💻 لابتوبات</option>
            <option value="computers">🖥️ كمبيوترات</option>
            <option value="accessories">🎧 إكسسوارات</option>
            <option value="screens">📺 شاشات</option>
            <option value="cams">📹 كاميرات مراقبة</option>
            <option value="installments">💳 أجهزة متاحة للتقسيط</option>
          </select>

          <hr className="border-gray-700" />
          
          {/* قسم الصور المتعددة */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-amber-400">🖼️ صور المنتج (1-{MAX_IMAGES})</h2>
            <div className="flex flex-wrap gap-3">
              {images.map((img, index) => (
                <div key={index} className="relative w-20 h-20">
                  <Image
                    src={img.preview}
                    alt={`Preview ${index + 1}`}
                    fill
                    sizes="80px" 
                    className="rounded-lg object-cover shadow-md border-2 border-amber-500"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <label className="cursor-pointer flex items-center justify-center w-20 h-20 bg-gray-700 border-2 border-dashed border-gray-500 rounded-lg hover:border-amber-400 transition-all">
                  <span className="text-2xl text-gray-400">+</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImages} 
                    hidden 
                    multiple 
                  />
                </label>
              )}
            </div>
            {images.length === 0 && (
              <p className="text-sm text-red-400">الرجاء اختيار صورة واحدة على الأقل.</p>
            )}
            {images.length === MAX_IMAGES && (
              <p className="text-sm text-green-400">وصلت للحد الأقصى من الصور ({MAX_IMAGES}).</p>
            )}
          </div>
          
          <hr className="border-gray-700" />

          {/* قسم الفيديو الاختياري */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-amber-400">🎥 فيديو المنتج (اختياري)</h2>
            
            {/* حقل لتحميل ملف فيديو */}
            <label className="block text-sm font-medium mb-1 text-gray-300">تحميل ملف فيديو (.mp4, .mov)</label>
            <div className="flex space-x-2">
              <input 
                type="file" 
                accept="video/*" 
                onChange={handleVideo} 
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
              />
            </div>
            {videoPreview && (
              <div className="mt-3 relative w-full h-48 rounded-xl overflow-hidden shadow-lg">
                <video 
                  src={videoPreview} 
                  controls 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* حقل رابط فيديو خارجي */}
            <label className="block text-sm font-medium mb-1 pt-3 text-gray-300">أو رابط فيديو خارجي (يوتيوب، إلخ)</label>
            <input
              type="url"
              name="videoUrl"
              placeholder="https://www.youtube.com/watch?v=..."
              value={formData.videoUrl}
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-amber-400 outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">إذا قمت بتحميل ملف فيديو، سيتم تجاهل الرابط الخارجي.</p>

          </div>
          
          <hr className="border-gray-700" />

          {/* زر الإرسال */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            disabled={loading}
            className={`w-full py-3 rounded-xl text-lg font-bold transition-all ${
              loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-amber-500 hover:bg-amber-400 text-black shadow-lg"
            }`}
          >
            {loading ? "جاري الإضافة..." : "➕ إضافة الإعلان"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}