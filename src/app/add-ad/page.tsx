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
  category: string;
}

interface ImageFileWithPreview {
  file: File;
  preview: string;
}

export default function AddAdPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    price: "",
    category: "phones",
  });

  const [images, setImages] = useState<ImageFileWithPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const MAX_IMAGES = 4;

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
    } else {
      setFormData({ ...formData, [name]: value });
    }
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

    if (!formData.title || !formData.description || !formData.category || images.length === 0) {
      toast.error("من فضلك املأ جميع الحقول الأساسية وأضف صورة واحدة على الأقل");
      return;
    }

    try {
      setLoading(true);
      toast.loading("جاري رفع الصور...", { id: "uploading" });

      // ✅ رفع أول صورة فقط كصورة رئيسية
      const storageRef = ref(storage, `ads/${Date.now()}_${images[0].file.name}`);
      await uploadBytes(storageRef, images[0].file);
      const downloadURL = await getDownloadURL(storageRef);

      toast.dismiss("uploading");
      toast.success("تم رفع الصورة بنجاح!");
      toast.loading("جاري حفظ بيانات الإعلان...");

      const priceToSave = formData.price ? Number(formData.price) : null;

      // ✅ حفظ البيانات مع الصورة الواحدة (image وليس images)
      await addDoc(collection(db, "ads"), {
        name: formData.title,
        description: formData.description,
        price: priceToSave,
        image: downloadURL,
        category: formData.category.toLowerCase().trim(),
        createdAt: serverTimestamp(),
      });

      toast.dismiss();
      toast.success("تمت إضافة الإعلان بنجاح!");

      images.forEach((img) => URL.revokeObjectURL(img.preview));
      setTimeout(() => router.push("/"), 1500);
    } catch (error) {
      toast.dismiss("uploading");
      console.error("💥 خطأ أثناء الإضافة:", error);
      toast.error("حدث خطأ أثناء رفع الصورة أو حفظ الإعلان.");
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

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-amber-400 outline-none"
            required
          >
            <option value="phones">📱 هواتف</option>
            <option value="laptops">💻 لابتوبات</option>
            <option value="computers">🖥 كمبيوترات</option>
            <option value="accessories">🎧 إكسسوارات</option>
            <option value="screens">📺 شاشات</option>
            <option value="cams">📹 كاميرات مراقبة</option>
            <option value="installments">💳 أجهزة متاحة للتقسيط</option>
          </select>

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
