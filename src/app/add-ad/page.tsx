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

interface FormData {
  title: string;
  description: string;
  price: string;
  category: string; // الفئة الرئيسية المختارة
  subCategory: string; // 🌟 الفئة الفرعية (مهمة للإكسسوارات)
}

interface ImageFileWithPreview {
  file: File;
  preview: string;
}

// 🌟 تعريف الفئات الفرعية للإكسسوارات
const ACCESSORIES_SUB_CATEGORIES = [
  { value: "phones", label: "📱 إكسسوارات هواتف" },
  { value: "laptop", label: "💻 إكسسوارات لابتوب" },
  { value: "computer", label: "🖥 إكسسوارات كمبيوتر" },
  { value: "cams", label: "📹 إكسسوارات كاميرات" },
  { value: "screens", label: "📺 إكسسوارات شاشات" },
  // يمكنك إضافة فئات فرعية أخرى هنا
];

export default function AddAdPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    price: "",
    category: "phones", // الافتراضية
    subCategory: ACCESSORIES_SUB_CATEGORIES[0].value, // 🌟 الافتراضية للفرعية
  });

  const [images, setImages] = useState<ImageFileWithPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const MAX_IMAGES = 4;

  // 🌟 هل الفئة الرئيسية المختارة حالياً هي إكسسوارات؟
  const isAccessories = formData.category === "accessories";

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "price") {
      const numericValue = value.replace(/[^0-9.]/g, "");
      setFormData({ ...formData, [name]: numericValue });
    } else if (name === "category") {
      // عند تغيير الفئة الرئيسية
      setFormData({ 
          ...formData, 
          [name]: value,
          // 💡 إعادة تعيين الفئة الفرعية: إذا كانت الفئة الجديدة هي 'accessories'، نترك قيمة subCategory الحالية،
          // وإلا نقوم بمسحها لضمان عدم وجود فئة فرعية لفئة رئيسية أخرى.
          subCategory: value === 'accessories' ? formData.subCategory : '', 
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // دالة تغيير الفئة الفرعية
  const handleSubCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, subCategory: e.target.value });
  };


  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isClient) return;
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files)
        .slice(0, MAX_IMAGES - images.length)
        .map((file) => ({
          file: file,
          preview: URL.createObjectURL(file),
        }));

      setImages((prevImages) => [...prevImages, ...newFiles]);
      e.target.value = ''; // 🌟 مسح الحقل للسماح برفع نفس الملفات مرة أخرى إذا لزم الأمر
    }
  };

  const handleRemoveImage = (index: number) => {
    if (!isClient) return;
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🎯 التعديل الحاسم: تحديد الفئة التي سيتم حفظها في قاعدة البيانات
    // إذا كانت الفئة الرئيسية هي إكسسوارات، نحفظ الفئة الفرعية. وإلا، نحفظ الفئة الرئيسية.
    const finalCategory = isAccessories ? formData.subCategory : formData.category;

    if (!formData.title || !formData.description || !finalCategory || images.length === 0) {
      toast.error("من فضلك املأ جميع الحقول الأساسية (بما في ذلك الفئة التفصيلية) وأضف صورة واحدة على الأقل");
      return;
    }

    try {
      setLoading(true);
      toast.loading("جاري رفع الصور...", { id: "uploading" });

      const uploadedImageUrls: string[] = [];

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const storageRef = ref(storage, `ads/${Date.now()}_${img.file.name}`);
        await uploadBytes(storageRef, img.file);
        const downloadURL = await getDownloadURL(storageRef);
        uploadedImageUrls.push(downloadURL);
      }

      toast.dismiss("uploading");
      toast.success("✅ تم رفع جميع الصور بنجاح!");
      toast.loading("⏳ جاري حفظ بيانات الإعلان...");

      const priceToSave = formData.price ? Number(formData.price) : null;

      await addDoc(collection(db, "ads"), {
        name: formData.title,
        description: formData.description,
        price: priceToSave,
        images: uploadedImageUrls,
        // 💡 حفظ الفئة التفصيلية في حقل category
        category: finalCategory.toLowerCase().trim(), 
        createdAt: serverTimestamp(),
      });

      toast.dismiss();
      toast.success("🎉 تمت إضافة الإعلان بنجاح!");

      images.forEach((img) => URL.revokeObjectURL(img.preview));
      setTimeout(() => router.push("/"), 1500);

    } catch (error) {
      toast.dismiss("uploading");
      console.error("💥 خطأ أثناء الإضافة:", error);
      toast.error("❌ حدث خطأ أثناء رفع الصور أو حفظ الإعلان.");
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        جاري التحميل...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-6">
      <Toaster position="top-center" />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-800/70 backdrop-blur-lg shadow-2xl rounded-2xl p-8 w-full max-w-lg border border-gray-700"
      >
        <h1 className="text-3xl font-bold text-center mb-6 text-amber-400">🛍 إضافة إعلان جديد</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
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
          <div className="relative">
            <input
              type="text"
              name="price"
              placeholder="السعر (جنيه مصري - اختياري)"
              value={formData.price}
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-amber-400 outline-none pl-16"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 bg-gray-700 py-1 px-2 rounded-lg pointer-events-none">
              ج.م
            </span>
          </div>
          
          {/* 🌟 حقل الفئة الرئيسية */}
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-amber-400 outline-none"
            required
          >
            <option value="phones">📱 هواتف</option>
            <option value="laptops">💻 لابتوب</option>
            <option value="computers">🖥 كمبيوتر</option>
            <option value="screens">📺 شاشات</option>
            <option value="cams">📹 كاميرات مراقبة</option>
            <option value="installments">💳 أجهزة متاحة للتقسيط</option>
            <option value="accessories">🎧 إكسسوارات</option> {/* 🎯 فئة الإكسسوارات */}
          </select>
          
          {/* 🌟 حقل الفئة الفرعية للإكسسوارات (يظهر فقط عند اختيار "إكسسوارات") */}
          {isAccessories && (
            <motion.select
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              name="subCategory"
              value={formData.subCategory}
              onChange={handleSubCategoryChange}
              className="w-full p-3 rounded-xl bg-gray-700 border border-amber-400 focus:ring-2 focus:ring-amber-400 outline-none mt-4"
              required
            >
              <option value="">-- اختر الفئة التفصيلية للإكسسوارات --</option>
              {ACCESSORIES_SUB_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </motion.select>
          )}


          <hr className="border-gray-700" />

          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-amber-400">🖼 صور المنتج</h2>
            <div className="flex flex-wrap gap-3">
              {images.map((img, index) => (
                <div key={index} className="relative w-20 h-20" suppressHydrationWarning>
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
                  <input type="file" accept="image/*" onChange={handleImages} hidden multiple />
                </label>
              )}
            </div>
          </div>

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