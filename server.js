const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// دالة لتشغيل أمر yt-dlp وجلب البيانات
const getMediaInfo = (url) => {
    return new Promise((resolve, reject) => {
        // -j لجلب البيانات بصيغة JSON
        // -g لجلب الرابط المباشر فقط
        // --no-playlist لضمان عدم تحميل قائمة كاملة
        const command = `yt-dlp -j --no-playlist "${url}"`;
        
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
            url: info.url, // الرابط المباشر للفيديو
            duration: info.duration_string,
            source: info.extractor_key
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'تعذر جلب بيانات المقطع، تأكد من صحة الرابط' });
    }
});

// رسالة ترحيب للتأكد من عمل السيرفر
app.get('/', (req, res) => {
    res.send('Downloader Pro Engine is Running! 🚀');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
