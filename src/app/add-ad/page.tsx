 "use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../lib/firebaseConfig";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
// ✅ استيراد مكون Image
import Image from "next/image"; 

const db = getFirestore(app);
const storage = getStorage(app);

export default function AddAdPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "phones",
  });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.category || !image) {
      toast.error("من فضلك املأ جميع الحقول وأضف صورة");
      return;
    }

    try {
      setLoading(true);

      // 1. رفع الصورة إلى Firebase Storage
      const storageRef = ref(storage, `ads/${Date.now()}_${image.name}`);
      await uploadBytes(storageRef, image);
      const imageUrl = await getDownloadURL(storageRef);

      // 2. حفظ بيانات الإعلان في Firestore
      await addDoc(collection(db, "ads"), {
        ...formData,
        // تم التأكد من أن حقل العنوان هو title وليس name في FormData
        // لكن تم تعديل هذا هنا ليتوافق مع كود صفحة العرض الذي يستخدم ad.name
        // إذا كنت تستخدم `ad.name` في صفحة العرض، يجب تعديل الـ title إلى name هنا أيضاً ليتوافقا.
        // تم افتراض أنك تحتاج إلى title في الإدخال ويجب تخزينه كـ name في Firestore ليظهر في صفحة العرض.
        name: formData.title, 
        price: Number(formData.price),
        image: imageUrl,
        category: formData.category.toLowerCase().trim(),
        createdAt: serverTimestamp(),
      });

      toast.success("تمت إضافة الإعلان بنجاح!");
      setTimeout(() => router.push("/"), 1500);
    } catch (error) {
      console.error("خطأ أثناء الإضافة:", error);
      toast.error("حدث خطأ أثناء حفظ الإعلان.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-6">
      <Toaster position="top-center" />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-800/70 backdrop-blur-lg shadow-2xl rounded-2xl p-8 w-full max-w-lg border border-gray-700"
      >
        <h1 className="text-3xl font-bold text-center mb-6 text-amber-400">🛍️ إضافة إعلان جديد</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="عنوان الإعلان"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-amber-400 outline-none"
          />
          <textarea
            name="description"
            placeholder="وصف الإعلان"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-amber-400 outline-none h-28 resize-none"
          />
          <input
            type="number"
            name="price"
            placeholder="السعر (اختياري)"
            value={formData.price}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-amber-400 outline-none"
          />
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-amber-400 outline-none"
          >
            <option value="هواتف">📱 هواتف</option>
            <option value="لابتوبات">💻 لابتوبات</option>
            <option value="كمبيوترات">🖥️ كمبيوترات</option>
            <option value="اكسسوارات">🎧 إكسسوارات</option>
          </select>

          <div className="text-center">
            {/* ✅ تم استبدال img بـ Image من Next.js */}
            {preview && (
              <div className="mx-auto mb-3 w-56 h-56 relative">
                <Image
                  src={preview}
                  alt="Preview"
                  fill // استخدام fill لملء العنصر الأب
                  sizes="(max-width: 600px) 224px, 224px" 
                  className="rounded-xl object-cover shadow-md"
                  unoptimized // ✅ ضرورية لأن preview هو رابط محلي مؤقت
                />
              </div>
            )}
            <label className="cursor-pointer bg-amber-500 hover:bg-amber-400 transition-all text-black py-2 px-4 rounded-xl font-semibold">
              اختر صورة
              <input type="file" accept="image/*" onChange={handleImage} hidden />
            </label>
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