const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, './')));

const getMediaInfo = (url) => {
    return new Promise((resolve, reject) => {
        const ytdlpPath = path.join(__dirname, 'yt-dlp');
        
        if (!fs.existsSync(ytdlpPath)) {
            return reject('yt-dlp binary missing. Wait for build to complete.');
        }

        // محاولة التشغيل المباشر أولاً (أكثر استقراراً في Render)
        const command = `chmod +x ${ytdlpPath} && ${ytdlpPath} -j --no-playlist "${url}"`;
        
        exec(command, (error, stdout, stderr) => {
            if (error) {
                // محاولة بديلة باستخدام python3 إذا فشل التشغيل المباشر
                const altCommand = `python3 ${ytdlpPath} -j --no-playlist "${url}"`;
                exec(altCommand, (err2, stdout2, stderr2) => {
                    if (err2) {
                        return reject(`Error: ${stderr2 || err2.message}`);
                    }
                    try {
                        resolve(JSON.parse(stdout2));
                    } catch (e) {
                        reject('JSON Parse Error');
                    }
                });
                return;
            }
            try {
                const info = JSON.parse(stdout);
                resolve(info);
            } catch (e) {
                reject('JSON Parse Error');
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
        res.status(500).json({ success: false, error: err.toString() });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
