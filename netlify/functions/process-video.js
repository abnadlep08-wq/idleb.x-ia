import { Client } from "magic-hour";
import { createClient } from '@supabase/supabase-js'

export default async (req) => {
    // التحقق من الطلب
    if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        // استخراج البيانات
        const formData = await req.formData();
        const videoFile = formData.get("video");
        const userId = formData.get("userId");
        const options = JSON.parse(formData.get("options") || "{}");

        if (!videoFile || !userId) {
            return new Response(JSON.stringify({ 
                error: "الملف ومعرف المستخدم مطلوبان" 
            }), { status: 400 });
        }

        // التحقق من رصيد المستخدم
        const supabase = createClient(
            Netlify.env.get("SUPABASE_URL"),
            Netlify.env.get("SUPABASE_SERVICE_KEY")
        );

        const { data: user, error: userError } = await supabase
            .from('users')
            .select('credits')
            .eq('id', userId)
            .single();

        if (userError || user.credits <= 0) {
            return new Response(JSON.stringify({ 
                error: "رصيدك غير كافٍ" 
            }), { status: 400 });
        }

        // تهيئة عميل Magic Hour الحقيقي
        const client = new Client({ 
            token: Netlify.env.get("MAGIC_HOUR_API_KEY") 
        });

        // رفع الملف إلى Magic Hour
        const uploadResult = await client.v1.files.upload({
            file: videoFile,
            purpose: "video-processing"
        });

        // تحضير التأثيرات المطلوبة
        const effects = [];
        if (options.enhance) effects.push("enhance");
        if (options.stabilize) effects.push("stabilize");
        if (options.upscale) effects.push("upscale");
        if (options.removeNoise) effects.push("denoise");

        // إنشاء مهمة معالجة
        const job = await client.v1.video.processing.create({
            file_id: uploadResult.id,
            effects: effects,
            output_format: "mp4"
        });

        // انتظار اكتمال المعالجة
        let result;
        let attempts = 0;
        const maxAttempts = 30; // دقيقة
        
        while (attempts < maxAttempts) {
            const status = await client.v1.jobs.get(job.id);
            
            if (status.status === "completed") {
                result = status;
                break;
            }
            
            if (status.status === "failed") {
                throw new Error("فشلت المعالجة");
            }
            
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        if (!result) {
            throw new Error("انتهت مهلة المعالجة");
        }

        // خصم رصيد من المستخدم
        await supabase
            .from('users')
            .update({ credits: user.credits - 1 })
            .eq('id', userId);

        // حفظ الفيديو في قاعدة البيانات
        const { error: dbError } = await supabase
            .from('videos')
            .insert({
                user_id: userId,
                original_url: uploadResult.url,
                processed_url: result.processedVideoUrl,
                status: 'completed',
                options: options,
                created_at: new Date()
            });

        if (dbError) {
            console.error("Database error:", dbError);
        }

        // إرجاع النتيجة
        return new Response(JSON.stringify({
            success: true,
            videoUrl: result.processedVideoUrl,
            message: "تمت المعالجة بنجاح"
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("Error:", error);
        
        return new Response(JSON.stringify({ 
            error: "فشل في معالجة الفيديو",
            details: error.message 
        }), { status: 500 });
    }
};
