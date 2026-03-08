// ============================================
// ملف الإعدادات - غير القيم هنا حسب مشروعك
// ============================================

const CONFIG = {
    // 🔥 غير هذا الرابط لتغيير الصورة الكبيرة في الخلفية
    heroBackground: "https://i.ibb.co/d4DfRnH2/Pookie-Spide-WEBP-0.jpg",
    
    // صورة احتياطية لو ما اشتغلت الأولى
    fallbackImage: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    
    // معلومات الموقع
    siteName: "Idleb X IA",
    siteDescription: "منصة الذكاء الاصطناعي لتعديل الفيديوهات",
    
    // روابط التواصل
    socialLinks: {
        twitter: "https://twitter.com/idlebxia",
        instagram: "https://instagram.com/xlb_me",
        youtube: "https://youtube.com/abnadlep"
    },
    
    // إعدادات الفيديو
    maxVideoSize: 100 * 1024 * 1024, // 100 ميجابايت
    maxVideoDuration: 300, // 5 دقائق بالثواني
    supportedFormats: ["mp4", "mov", "avi", "mkv"],
    
    // أسعار الباقات (بالدولار)
    pricing: {
        free: {
            monthlyCredits: 3,
            maxDuration: 180, // 3 دقائق
            maxSize: 50 * 1024 * 1024 // 50 ميجابايت
        },
        pro: {
            price: 19,
            monthlyCredits: 50,
            maxDuration: 900, // 15 دقيقة
            maxSize: 500 * 1024 * 1024 // 500 ميجابايت
        },
        unlimited: {
            price: 49,
            monthlyCredits: -1, // -1 يعني غير محدود
            maxDuration: 3600, // 60 دقيقة
            maxSize: 2 * 1024 * 1024 * 1024 // 2 جيجابايت
        }
    }
};

// جعل الإعدادات متاحة عالمياً
window.CONFIG = CONFIG;
