 /** @type {import('next').NextConfig} */
const nextConfig = {
  // تفعيل إعدادات الصور
  images: {
    // تحديد النطاقات الخارجية الموثوق بها
    remotePatterns: [
      {
        protocol: 'https',
        // ✅ هذا النطاق هو الخاص بـ Firebase Storage
        hostname: 'firebasestorage.googleapis.com', 
        port: '',
        pathname: '/**', // السماح بأي مسار ضمن هذا النطاق
      },
      {
        protocol: 'https',
        // ✅ هذا النطاق ضروري لظهور الصور الاحتياطية (Placeholders)
        hostname: 'placehold.co', 
        port: '',
        pathname: '/**', 
      },
      // أضف أي نطاقات أخرى تستضيف عليها الصور هنا
    ],
  },
};

module.exports = nextConfig;
