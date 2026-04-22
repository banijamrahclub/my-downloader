document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('downloadBtn');
    const videoUrl = document.getElementById('videoUrl');
    const loader = document.getElementById('loader');
    const resultSection = document.getElementById('result');
    const hdDownload = document.getElementById('hdDownload');
    const resultPreview = document.getElementById('resultPreview');

    // رابط سيرفر Render الخاص بك (قم بتغييره بعد الرفع على Render)
    const RENDER_SERVER_URL = 'https://your-app-name.onrender.com';

    if (window.lucide) lucide.createIcons();

    const processDownload = async () => {
        const url = videoUrl.value.trim();
        if (!url) {
            alert('من فضلك ضع رابط المقطع أولاً');
            return;
        }

        setLoading(true);

        try {
            // الاتصال بمحركك الخاص في Render
            const response = await fetch(`${RENDER_SERVER_URL}/api/download?url=${encodeURIComponent(url)}`);
            const data = await response.json();

            if (data.success) {
                showResult(data);
                alert('تم جلب الرابط بنجاح من محركك السحابي!');
            } else {
                throw new Error(data.error);
            }

        } catch (error) {
            console.error('Download Error:', error);
            alert('حدث خطأ في الاتصال بسيرفر Render. تأكد من رفعه بشكل صحيح وتغيير الرابط في ملف app.js');
        } finally {
            setLoading(false);
        }
    };

    function showResult(data) {
        resultSection.style.display = 'block';
        resultSection.scrollIntoView({ behavior: 'smooth' });

        resultPreview.innerHTML = `
            <img src="${data.thumbnail}" alt="preview" style="width:100%; height:100%; object-fit:cover; border-radius:15px;">
            <div style="position:absolute; bottom:10px; left:10px; background:var(--primary); color:white; padding:4px 8px; border-radius:5px; font-weight:bold; font-size:12px;">HD Ready</div>
        `;

        hdDownload.onclick = async (e) => {
            e.preventDefault();
            hdDownload.textContent = 'جاري التحميل...';
            
            try {
                const res = await fetch(data.url);
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
                window.open(data.url, '_blank');
                hdDownload.textContent = 'تحميل الفيديو الآن';
            }
        };
        
        hdDownload.textContent = 'تحميل الفيديو الآن (HD)';
    }

    function setLoading(isLoading) {
        if (!downloadBtn) return;
        const btnText = downloadBtn.querySelector('.btn-text');
        if (isLoading) {
            btnText.textContent = 'جاري المعالجة...';
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
