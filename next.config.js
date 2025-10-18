// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // تفعيل إعدادات الصور
  images: {
    // تحديد النطاقات الخارجية الموثوق بها
    remotePatterns: [
      {
        protocol: 'https',
        // ⬅️ هذا النطاق يسمح بتحميل صور Firebase Storage
        hostname: 'firebasestorage.googleapis.com', 
        port: '',
        pathname: '/**', 
      },
      // إذا كان لديك صور محلية في مجلد public/logo.jpg
      // لن تحتاج لإضافة أي إعدادات خاصة لها هنا، Next.js يتعامل معها تلقائياً.
    ],
  },
};

module.exports = nextConfig;