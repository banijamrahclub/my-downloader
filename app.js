document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('downloadBtn');
    const videoUrl = document.getElementById('videoUrl');
    const loader = document.getElementById('loader');
    const resultSection = document.getElementById('result');
    const hdDownload = document.getElementById('hdDownload');
    const resultPreview = document.getElementById('resultPreview');

    // سنستخدم مفتاحك الخاص مع أقوى API متاح حالياً لتجاوز الحظر
    const RAPID_API_KEY = 'cc320dc747msh9b89da69c13d6d8p103876jsn618b2aa88e0d';
    const RAPID_API_HOST = 'social-media-video-downloader.p.rapidapi.com';

    if (window.lucide) lucide.createIcons();

    const processDownload = async () => {
        const url = videoUrl.value.trim();
        if (!url) {
            alert('من فضلك ضع رابط المقطع أولاً');
            return;
        }

        setLoading(true);

        try {
            // استخدام الـ API السحابي القوي
            const response = await fetch(`https://${RAPID_API_HOST}/smvd/get/all?url=${encodeURIComponent(url)}`, {
                headers: {
                    'x-rapidapi-key': RAPID_API_KEY,
                    'x-rapidapi-host': RAPID_API_HOST
                }
            });

            const data = await response.json();
            console.log('API Response:', data);

            if (data && data.links && data.links.length > 0) {
                // العثور على أفضل جودة (تيك توك بدون علامة مائية أو يوتيوب HD)
                const bestLink = data.links.find(l => l.quality === 'hd' || l.quality === 'original') || data.links[0];
                showResult(data, bestLink.link);
                alert('تم تجاوز الحظر وجلب الرابط بنجاح!');
            } else {
                throw new Error('الرابط غير مدعوم أو غير متاح حالياً');
            }

        } catch (error) {
            console.error('Download Error:', error);
            alert(`فشل التحميل عبر السحابة: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    function showResult(data, finalUrl) {
        resultSection.style.display = 'block';
        resultSection.scrollIntoView({ behavior: 'smooth' });

        const thumb = data.picture || data.thumbnail || 'https://via.placeholder.com/400x225/6366f1/ffffff?text=Video+Ready';

        resultPreview.innerHTML = `
            <img src="${thumb}" alt="preview" style="width:100%; height:100%; object-fit:cover; border-radius:15px;">
            <div style="position:absolute; bottom:10px; left:10px; background:#00f2ea; color:#000; padding:4px 8px; border-radius:5px; font-weight:bold; font-size:12px;">Premium Link</div>
        `;

        hdDownload.onclick = async (e) => {
            e.preventDefault();
            hdDownload.textContent = 'جاري التحميل المباشر...';
            
            try {
                // محاولة التحميل القسري عبر Blob
                const res = await fetch(finalUrl);
                const blob = await res.blob();
                const bUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = bUrl;
                a.download = `DownloaderPro_${Date.now()}.mp4`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                hdDownload.textContent = 'تم التحميل!';
            } catch (err) {
                // حل بديل إذا كان السيرفر يمنع الـ CORS
                window.open(finalUrl, '_blank');
                hdDownload.textContent = 'تحميل الفيديو الآن';
            }
        };
        
        hdDownload.textContent = 'تحميل الفيديو الآن (HD)';
    }

    function setLoading(isLoading) {
        if (!downloadBtn) return;
        const btnText = downloadBtn.querySelector('.btn-text');
        if (isLoading) {
            btnText.textContent = 'جاري سحب المقطع...';
            loader.style.display = 'block';
            downloadBtn.disabled = true;
        } else {
            btnText.textContent = 'تحميل';
            loader.style.display = 'none';
            downloadBtn.disabled = false;
        }
    }

    if (downloadBtn) {
        downloadBtn.addEventListener('click', processDownload);
        videoUrl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') processDownload();
        });
    }

    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (header) {
            header.style.background = window.scrollY > 50 ? 'rgba(15, 23, 42, 0.98)' : 'rgba(15, 23, 42, 0.9)';
        }
    });
});
