// ============================================
// الملف الرئيسي للصفحة الرئيسية
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // تهيئة الصفحة
    initHeroBackground();
    initPricingCards();
    initContactForm();
    initStatsCounter();
    initSmoothScroll();
});

// تهيئة خلفية القسم الرئيسي
function initHeroBackground() {
    const heroBg = document.getElementById('heroBackground');
    if (heroBg && CONFIG.heroBackground) {
        heroBg.style.backgroundImage = `url('${CONFIG.heroBackground}')`;
        
        // صورة احتياطية
        const img = new Image();
        img.onerror = () => {
            heroBg.style.backgroundImage = `url('${CONFIG.fallbackImage}')`;
        };
        img.src = CONFIG.heroBackground;
    }
}

// تهيئة بطاقات الباقات
function initPricingCards() {
    const pricingGrid = document.getElementById('pricingGrid');
    if (!pricingGrid) return;
    
    const plans = [
        {
            name: 'مجاني',
            price: '0',
            features: [
                '3 معالجات في الشهر',
                'مدة فيديو حتى 3 دقائق',
                'حجم ملف حتى 50 ميجابايت',
                'تأثيرات أساسية'
            ],
            disabled: ['معالجة أولوية', 'دعم فني متميز']
        },
        {
            name: 'احترافي',
            price: '19',
            features: [
                '50 معالجة في الشهر',
                'مدة فيديو حتى 15 دقيقة',
                'حجم ملف حتى 500 ميجابايت',
                'جميع التأثيرات المتاحة',
                'معالجة أولوية'
            ],
            disabled: ['دعم فني متميز'],
            popular: true
        },
        {
            name: 'غير محدود',
            price: '49',
            features: [
                'معالجة غير محدودة',
                'مدة فيديو حتى 60 دقيقة',
                'حجم ملف حتى 2 جيجابايت',
                'جميع التأثيرات المتاحة',
                'معالجة أولوية',
                'دعم فني متميز VIP'
            ],
            disabled: []
        }
    ];
    
    pricingGrid.innerHTML = plans.map(plan => `
        <div class="pricing-card ${plan.popular ? 'popular' : ''}">
            ${plan.popular ? '<div class="popular-badge">الأكثر شهرة</div>' : ''}
            <div class="pricing-header">
                <h3>${plan.name}</h3>
                <div class="price">$${plan.price}<span>/شهر</span></div>
            </div>
            <div class="pricing-features">
                <ul>
                    ${plan.features.map(f => `
                        <li><i class="fas fa-check"></i> ${f}</li>
                    `).join('')}
                    ${plan.disabled.map(f => `
                        <li class="disabled"><i class="fas fa-times"></i> ${f}</li>
                    `).join('')}
                </ul>
            </div>
            <button class="btn ${plan.popular ? 'btn-primary' : 'btn-outline'} btn-block" 
                    onclick="window.auth.openSignupModal()">
                اختر الخطة
            </button>
        </div>
    `).join('');
}

// تهيئة نموذج الاتصال
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('contactName').value,
            email: document.getElementById('contactEmail').value,
            message: document.getElementById('contactMessage').value
        };
        
        try {
            const response = await fetch('/.netlify/functions/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                alert('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.');
                form.reset();
            } else {
                throw new Error('فشل في الإرسال');
            }
        } catch (error) {
            alert('عذراً، حدث خطأ. الرجاء المحاولة لاحقاً');
        }
    });
}

// تهيئة عداد الإحصائيات
function initStatsCounter() {
    // جلب الإحصائيات من Supabase
    fetch('/.netlify/functions/get-stats')
        .then(res => res.json())
        .then(data => {
            animateNumber('statVideos', data.videos || 50000);
            animateNumber('statUsers', data.users || 10000);
            animateNumber('statSatisfaction', data.satisfaction || 98, '%');
        })
        .catch(() => {
            // بيانات افتراضية لو فشل الجلب
            animateNumber('statVideos', 50000);
            animateNumber('statUsers', 10000);
            animateNumber('statSatisfaction', 98, '%');
        });
}

// تحريك الأرقام
function animateNumber(elementId, target, suffix = '') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.round(current) + suffix;
    }, 30);
}

// التمرير السلس
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// روابط التواصل الاجتماعي
const socialLinks = document.getElementById('socialLinks');
if (socialLinks && CONFIG.socialLinks) {
    socialLinks.innerHTML = `
        <a href="${CONFIG.socialLinks.twitter}" target="_blank"><i class="fab fa-twitter"></i></a>
        <a href="${CONFIG.socialLinks.instagram}" target="_blank"><i class="fab fa-instagram"></i></a>
        <a href="${CONFIG.socialLinks.youtube}" target="_blank"><i class="fab fa-youtube"></i></a>
    `;
              }
