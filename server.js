const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use(express.static(path.join(__dirname, './')));

const getMediaInfo = (url) => {
    return new Promise((resolve, reject) => {
        const ytdlpPath = path.join(__dirname, 'yt-dlp');
        
        // التأكد من وجود الأداة أولاً
        if (!fs.existsSync(ytdlpPath)) {
            return reject('أداة yt-dlp غير موجودة في السيرفر. تأكد من اكتمال الـ Build.');
        }

        // تشغيل باستخدام python3 لضمان التوافق في Render
        const command = `python3 ${ytdlpPath} -j --no-playlist "${url}"`;
        
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('YT-DLP Error:', stderr);
                return reject(`خطأ في الأداة: ${stderr || error.message}`);
            }
            try {
                const info = JSON.parse(stdout);
                resolve(info);
            } catch (e) {
                reject('فشل في تحليل بيانات المقطع (JSON Error)');
            }
        });
    });
};

app.get('/api/download', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).json({ error: 'URL is required' });

    try {
        const info = await getMediaInfo(videoUrl);
        res.json({
            success: true,
            title: info.title,
            thumbnail: info.thumbnail,
            url: info.url,
            duration: info.duration_string
        });
    } catch (err) {
        // إرسال الخطأ الحقيقي للمتصفح لنعرف المشكلة
        res.status(500).json({ success: false, error: err.toString() });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
