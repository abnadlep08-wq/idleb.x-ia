// ============================================
// نظام تسجيل الدخول الحقيقي باستخدام Supabase
// ============================================

// تهيئة Supabase (يجب إضافة الرابط والمفتاح في Netlify)
const SUPABASE_URL = window.SUPABASE_URL || "https://dlspfrbtbcxwfjmidjnc.supabase.co";
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "sb_publishable_97g8HUlw4YHcIUZ6ciltsA_PkAGRr5W";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// كائن المصادقة الشامل
window.auth = {
    // الحالة
    currentUser: null,
    
    // تهيئة المصادقة
    async init() {
        // التحقق من وجود مستخدم مسجل الدخول
        const { data: { user } } = await supabase.auth.getUser();
        this.currentUser = user;
        
        // تحديث الواجهة
        this.updateUI();
        
        // استماع لتغييرات حالة المصادقة
        supabase.auth.onAuthStateChange((event, session) => {
            this.currentUser = session?.user || null;
            this.updateUI();
        });
    },
    
    // تحديث واجهة المستخدم حسب حالة تسجيل الدخول
    updateUI() {
        const navButtons = document.getElementById('navButtons');
        if (!navButtons) return;
        
        if (this.currentUser) {
            // مستخدم مسجل الدخول
            navButtons.innerHTML = `
                <a href="/dashboard.html" class="btn btn-outline">
                    <i class="fas fa-user"></i>
                    ${this.currentUser.user_metadata?.full_name || 'حسابي'}
                </a>
                <button class="btn btn-primary" onclick="window.auth.logout()">
                    <i class="fas fa-sign-out-alt"></i>
                    تسجيل خروج
                </button>
            `;
        } else {
            // زائر
            navButtons.innerHTML = `
                <button class="btn btn-outline" onclick="window.auth.openLoginModal()">
                    <i class="fas fa-sign-in-alt"></i>
                    تسجيل الدخول
                </button>
                <button class="btn btn-primary" onclick="window.auth.openSignupModal()">
                    <i class="fas fa-user-plus"></i>
                    إنشاء حساب
                </button>
            `;
        }
    },
    
    // فتح نافذة تسجيل الدخول
    openLoginModal() {
        document.getElementById('authModal').style.display = 'block';
        this.showLoginTab();
    },
    
    // فتح نافذة إنشاء حساب
    openSignupModal() {
        document.getElementById('authModal').style.display = 'block';
        this.showSignupTab();
    },
    
    // إغلاق النافذة
    closeModal() {
        document.getElementById('authModal').style.display = 'none';
    },
    
    // إظهار تبويب تسجيل الدخول
    showLoginTab() {
        document.getElementById('loginTab').classList.add('active');
        document.getElementById('signupTab').classList.remove('active');
        document.getElementById('loginForm').classList.add('active');
        document.getElementById('signupForm').classList.remove('active');
    },
    
    // إظهار تبويب إنشاء حساب
    showSignupTab() {
        document.getElementById('signupTab').classList.add('active');
        document.getElementById('loginTab').classList.remove('active');
        document.getElementById('signupForm').classList.add('active');
        document.getElementById('loginForm').classList.remove('active');
    },
    
    // معالجة تسجيل الدخول
    async handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            
            // تسجيل دخول ناجح
            this.closeModal();
            
            // توجيه إلى لوحة التحكم
            window.location.href = '/dashboard.html';
            
        } catch (error) {
            alert('خطأ في تسجيل الدخول: ' + error.message);
        }
    },
    
    // معالجة إنشاء حساب
    async handleSignup(event) {
        event.preventDefault();
        
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                        credits: 3 // رصيد مجاني للمستخدمين الجدد
                    }
                }
            });
            
            if (error) throw error;
            
            alert('تم إنشاء الحساب بنجاح! يرجى تفعيل بريدك الإلكتروني');
            this.closeModal();
            
        } catch (error) {
            alert('خطأ في إنشاء الحساب: ' + error.message);
        }
    },
    
    // تسجيل الخروج
    async logout() {
        await supabase.auth.signOut();
        window.location.href = '/';
    }
};

// تهيئة المصادقة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.auth.init();
});
