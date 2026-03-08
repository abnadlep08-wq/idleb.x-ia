// ============================================
// لوحة التحكم - الكود الكامل
// ============================================

// تهيئة Supabase
const SUPABASE_URL = window.SUPABASE_URL || "https://dlspfrbtbcxwfjmidjnc.supabase.co";
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "sb_publishable_97g8HUlw4YHcIUZ6ciltsA_PkAGRr5W";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// متغيرات عامة
let currentUser = null;
let userVideos = [];
let currentVideoFile = null;

// تهيئة لوحة التحكم
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    initEventListeners();
    loadUserData();
});

// التحقق من تسجيل الدخول
async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        window.location.href = '/';
        return;
    }
    
    currentUser = user;
    displayUserInfo();
}

// عرض معلومات المستخدم
function displayUserInfo() {
    const userInfo = document.querySelector('.user-info');
    if (!userInfo) return;
    
    const name = currentUser.user_metadata?.full_name || 'مستخدم';
    const email = currentUser.email;
    const initial = name.charAt(0).toUpperCase();
    
    userInfo.innerHTML = `
        <div class="user-avatar">${initial}</div>
        <div class="user-name">${name}</div>
        <div class="user-email">${email}</div>
    `;
}

// تحميل بيانات المستخدم
async function loadUserData() {
    await loadUserStats();
    await loadUserVideos();
}

// تحميل إحصائيات المستخدم
async function loadUserStats() {
    try {
        const { data: videos, error } = await supabase
            .from('videos')
            .select('*')
            .eq('user_id', currentUser.id);
        
        if (error) throw error;
        
        const credits = currentUser.user_metadata?.credits || 3;
        const storageUsed = videos?.reduce((acc, v) => acc + (v.size || 0), 0) || 0;
        
        document.getElementById('videoCount').textContent = videos?.length || 0;
        document.getElementById('creditCount').textContent = credits;
        document.getElementById('storageUsed').textContent = formatBytes(storageUsed);
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// تحميل فيديوهات المستخدم
async function loadUserVideos() {
    try {
        const { data: videos, error } = await supabase
            .from('videos')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        userVideos = videos || [];
        displayRecentVideos();
        displayAllVideos();
        
    } catch (error) {
        console.error('Error loading videos:', error);
    }
}

// عرض آخر الفيديوهات
function displayRecentVideos() {
    const container = document.getElementById('recentVideosList');
    if (!container) return;
    
    const recent = userVideos.slice(0, 3);
    
    if (recent.length === 0) {
        container.innerHTML = '<p class="no-videos">لا توجد فيديوهات بعد</p>';
        return;
    }
    
    container.innerHTML = recent.map(video => `
        <div class="video-card">
            <video src="${video.processed_url}" controls></video>
            <div class="video-info">
                <div class="video-date">${new Date(video.created_at).toLocaleDateString('ar')}</div>
                <div class="video-actions">
                    <a href="${video.processed_url}" download class="btn-download">
                        <i class="fas fa-download"></i>
                    </a>
                    <button onclick="deleteVideo('${video.id}')" class="btn-delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// عرض جميع الفيديوهات
function displayAllVideos() {
    const container = document.getElementById('videosGrid');
    if (!container) return;
    
    if (userVideos.length === 0) {
        container.innerHTML = '<p class="no-videos">لا توجد فيديوهات بعد</p>';
        return;
    }
    
    container.innerHTML = userVideos.map(video => `
        <div class="video-card">
            <video src="${video.processed_url}" controls></video>
            <div class="video-info">
                <div class="video-date">${new Date(video.created_at).toLocaleDateString('ar')}</div>
                <div class="video-actions">
                    <a href="${video.processed_url}" download class="btn-download">
                        <i class="fas fa-download"></i> تحميل
                    </a>
                    <button onclick="deleteVideo('${video.id}')" class="btn-delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// حذف فيديو
async function deleteVideo(videoId) {
    if (!confirm('هل أنت متأكد من حذف هذا الفيديو؟')) return;
    
    try {
        const { error } = await supabase
            .from('videos')
            .delete()
            .eq('id', videoId);
        
        if (error) throw error;
        
        // تحديث القائمة
        await loadUserVideos();
        
    } catch (error) {
        alert('فشل في حذف الفيديو');
    }
}

// تهيئة الأحداث
function initEventListeners() {
    // رفع الفيديو
    const uploadArea = document.getElementById('uploadArea');
    const videoInput = document.getElementById('videoFile');
    
    if (uploadArea) {
        uploadArea.addEventListener('click', () => videoInput.click());
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);
    }
    
    if (videoInput) {
        videoInput.addEventListener('change', handleFileSelect);
    }
}

// معالجة سحب الملف
function handleDragOver(e) {
    e.preventDefault();
    document.getElementById('uploadArea').style.borderColor = 'var(--primary)';
}

function handleDragLeave(e) {
    e.preventDefault();
    document.getElementById('uploadArea').style.borderColor = '#E5E7EB';
}

function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
        handleVideoFile(file);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleVideoFile(file);
    }
}

// معالجة ملف الفيديو
function handleVideoFile(file) {
    // التحقق من الحجم
    if (file.size > CONFIG.maxVideoSize) {
        alert('حجم الملف كبير جداً. الحد الأقصى 100 ميجابايت');
        return;
    }
    
    currentVideoFile = file;
    document.querySelector('.upload-area').style.display = 'none';
    document.querySelector('.processing-options').style.display = 'block';
}

// رفع ومعالجة الفيديو
async function uploadVideo() {
    if (!currentVideoFile) return;
    
    // تجميع الخيارات
    const options = {
        enhance: document.getElementById('enhanceOption').checked,
        stabilize: document.getElementById('stabilizeOption').checked,
        upscale: document.getElementById('upscaleOption').checked,
        removeNoise: document.getElementById('removeNoiseOption').checked
    };
    
    // إظهار شريط التقدم
    document.querySelector('.processing-options').style.display = 'none';
    document.getElementById('progressContainer').style.display = 'block';
    
    // تجهيز البيانات
    const formData = new FormData();
    formData.append('video', currentVideoFile);
    formData.append('userId', currentUser.id);
    formData.append('options', JSON.stringify(options));
    
    try {
        // محاكاة التقدم
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 90) {
                clearInterval(progressInterval);
            }
            document.getElementById('progressFill').style.width = `${progress}%`;
            document.getElementById('progressStatus').textContent = 
                progress < 30 ? 'جاري رفع الملف...' :
                progress < 60 ? 'جاري المعالجة...' :
                'تطبيق التأثيرات...';
        }, 500);
        
        // إرسال للمعالجة
        const response = await fetch('/.netlify/functions/process-video', {
            method: 'POST',
            body: formData
        });
        
        clearInterval(progressInterval);
        
        if (!response.ok) {
            throw new Error('فشل في المعالجة');
        }
        
        const data = await response.json();
        
        // إكمال شريط التقدم
        document.getElementById('progressFill').style.width = '100%';
        document.getElementById('progressStatus').textContent = 'اكتملت المعالجة!';
        
        setTimeout(() => {
            showResult(data.videoUrl);
        }, 500);
        
    } catch (error) {
        alert('فشل في معالجة الفيديو: ' + error.message);
        resetUpload();
    }
}

// عرض النتيجة
function showResult(videoUrl) {
    document.getElementById('progressContainer').style.display = 'none';
    document.getElementById('resultContainer').style.display = 'block';
    document.getElementById('resultVideo').src = videoUrl;
    document.getElementById('downloadBtn').href = videoUrl;
}

// إعادة تعيين الرفع
function resetUpload() {
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('processing-options').style.display = 'none';
    document.getElementById('progressContainer').style.display = 'none';
    document.getElementById('resultContainer').style.display = 'none';
    document.getElementById('videoFile').value = '';
    currentVideoFile = null;
}

// تبديل أقسام لوحة التحكم
function showSection(section) {
    // تحديث الروابط النشطة
    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
    event.target.classList.add('active');
    
    // إظهار القسم المطلوب
    document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active'));
    document.getElementById(section + 'Section').classList.add('active');
    
    // تحميل بيانات القسم
    if (section === 'videos') {
        displayAllVideos();
    }
}

// تنسيق حجم الملف
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// تصدير الدوال
window.showSection = showSection;
window.uploadVideo = uploadVideo;
window.resetUpload = resetUpload;
window.deleteVideo = deleteVideo;
