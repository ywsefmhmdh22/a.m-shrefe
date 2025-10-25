 "use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";

// ==========================================================
// ** الأماكن التي تحتاج تعديلها لوضع بياناتك **
// ==========================================================
const FACEBOOK_LINK = "https://www.facebook.com/share/19yXYVR7Um/ "; 
// مثال: "https://www.facebook.com/YourFacebookPage"

const WHATSAPP_NUMBER = "01125571077"; 
// ملاحظة: تأكد من إضافة رمز الدولة (مثل +20) ليتم التوجيه بشكل صحيح.
// مثال صحيح لمصر: "+201125571077"
// ==========================================================


// Inline SVG for Facebook (Official Logo - High Fidelity)
// أيقونة الفيسبوك الرسمية (حرف F داخل مربع أزرق مستدير)
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
  >
    {/* Background shape and color */}
    <path
      fill="#1877F2"
      d="M12 2C6.477 2 2 6.477 2 12c0 5.014 3.65 9.184 8.441 9.949v-7.042H8.093v-2.907h2.348V9.894c0-2.31 1.397-3.578 3.473-3.578 1.002 0 1.954.178 2.219.257V8.92h-1.317c-1.149 0-1.373.545-1.373 1.346v1.76H16l-.41 2.907h-2.179V21.95C18.35 21.184 22 17.014 22 12c0-5.523-4.477-10-10-10z"
    />
  </svg>
);

// Inline SVG for WhatsApp (Official Logo - Final Corrected High Fidelity)
// أيقونة الواتساب الرسمية المصححة والنهائية
const WhatsappIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
  >
    {/* WhatsApp Green Background Circle */}
    <path
      fill="#25D366"
      d="M12 2C6.477 2 2 6.477 2 12c0 2.276.67 4.417 1.94 6.273L2 22l3.96-1.04C7.818 21.678 9.87 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"
    />
    {/* WhatsApp Icon (White) - Phone inside a chat bubble (Corrected path) */}
    <path
      fill="#fff"
      d="M17.47 14.28c-.22-.38-.86-.77-1.28-.95-.42-.18-.93-.27-1.46-.27-.52 0-1.02.1-.96.22.05.11.2.22.28.34.08.12.15.28.16.42s-.01.3-.15.48c-.14.18-.32.36-.58.55-.26.19-.57.37-.92.54-.34.17-.68.27-1.03.3-.35.03-.7-.04-1.05-.15-.35-.11-.69-.3-.99-.54-.3-.24-.58-.55-.83-.93-.25-.38-.42-.83-.42-1.36 0-.5.12-.9.37-1.28.25-.38.58-.69.95-.94.37-.25.79-.4.81-.43.02-.03.01-.11-.05-.24s-.18-.46-.28-.7c-.1-.24-.2-.55-.25-.79-.06-.24-.01-.45.03-.63.04-.18.11-.34.2-.47.1-.13.25-.26.4-.39s.34-.23.5-.32c.16-.09.32-.15.48-.15.15 0 .3.02.43.05.13.03.25.1.37.23s.2.28.28.46c.07.18.11.37.07.57s-.11.4-.23.63c-.12.23-.27.48-.46.73zM12 22c-2.07 0-4.04-.54-5.8-.97l-3.2 1.05 1.04-3.15C3.7 15.8 3 14 3 12c0-5.46 4.44-9.9 9.9-9.9s9.9 4.44 9.9 9.9-4.44 9.9-9.9 9.9z"
      transform="translate(0 0) scale(.9)"
    />
  </svg>
);


export default function ContactUsPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // يمكنك لاحقًا استبدال هذا بإرسال حقيقي عبر Email API أو Firebase Functions
    setStatus("تم إرسال رسالتك بنجاح ✅");
    setEmail("");
    setMessage("");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-100 flex items-center justify-center px-6 py-20">
      <motion.div
        className="bg-white dark:bg-gray-900 p-10 rounded-3xl shadow-2xl w-full max-w-2xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <Mail className="w-12 h-12 mx-auto text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold mb-2">تواصل معنا</h1>
          <p className="text-gray-500 dark:text-gray-400">
            يسعدنا تواصلك معنا عبر البريد الإلكتروني لأي استفسار أو اقتراح ❤️
          </p>
        </div>

        {/* ========================================================== */}
        {/* قسم أيقونات التواصل الاجتماعي الجديدة */}
        {/* تم تحسين الأسلوب البصري لتبدو الأيقونات أجمل ومطابقة للهوية */}
        {/* ========================================================== */}
        <div className="flex justify-center gap-8 mb-10 mt-6">
          {/* أيقونة فيسبوك */}
          <a
            href={FACEBOOK_LINK}
            target="_blank"
            rel="noopener noreferrer"
            title="تواصل معنا عبر فيسبوك"
            // تم تغيير لون الأيقونة إلى اللون الأبيض لكي تظهر أيقونة الفيسبوك الزرقاء بالخلفية
            className="transition-all duration-300 transform hover:scale-125 text-white dark:text-gray-100"
          >
            <FacebookIcon 
              className="w-10 h-10 rounded-lg 
              hover:drop-shadow-lg hover:shadow-2xl 
              hover:shadow-blue-500/80 
              transition-all duration-300"
            />
          </a>

          {/* أيقونة واتساب */}
          <a
            // يتم إزالة علامة + في الرابط لضمان التوجيه الصحيح
            href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\+/g, '').replace(/^0/, '')}`} 
            target="_blank"
            rel="noopener noreferrer"
            title="تواصل معنا عبر واتساب"
            // تم تغيير لون الأيقونة إلى اللون الأبيض لكي تظهر أيقونة الواتساب الخضراء بالخلفية
            className="transition-all duration-300 transform hover:scale-125 text-white dark:text-gray-100"
          >
            <WhatsappIcon 
              className="w-10 h-10 rounded-full
              hover:drop-shadow-lg hover:shadow-2xl 
              hover:shadow-green-500/80 
              transition-all duration-300"
            />
          </a>
        </div>
        {/* ========================================================== */}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-semibold">البريد الإلكتروني</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="ahmedsherife888@gmail.com"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold">الرسالة</label>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="اكتب رسالتك هنا..."
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-all duration-300"
          >
            إرسال الرسالة
            
          </motion.button>
        </form>

        {status && (
          <p className="text-center mt-6 text-green-600 dark:text-green-400 font-semibold">
            {status}
          </p>
        )}
      </motion.div>
    </main>
  );
}
