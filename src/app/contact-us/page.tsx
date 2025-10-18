"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";

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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-semibold">البريد الإلكتروني</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="example@email.com"
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
