const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// عرض سجلات الطلبات في Render لرؤية الأخطاء
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// جعل السيرفر يعرض ملفات الموقع (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, './')));

// دالة لتشغيل أمر yt-dlp وجلب البيانات
const getMediaInfo = (url) => {
    return new Promise((resolve, reject) => {
        // نستخدم ./yt-dlp للإشارة للملف المحمل في نفس المجلد
        const command = `./yt-dlp -j --no-playlist "${url}"`;
        
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('Error executing yt-dlp:', stderr);
                return reject(stderr);
            }
            try {
                const info = JSON.parse(stdout);
                resolve(info);
            } catch (e) {
                reject('Failed to parse video info');
            }
        });
    });
};

// الـ API الخاص بالتحميل
app.get('/api/download', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).json({ error: 'URL is required' });

    try {
        console.log(`Processing: ${videoUrl}`);
        const info = await getMediaInfo(videoUrl);
        
        res.json({
            success: true,
            title: info.title,
            thumbnail: info.thumbnail,
            url: info.url,
            duration: info.duration_string,
            source: info.extractor_key
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'تعذر جلب بيانات المقطع، تأكد من صحة الرابط' });
    }
});

// عند فتح الرابط الرئيسي، سيظهر الموقع (index.html) تلقائياً
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
