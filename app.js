document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('downloadBtn');
    const videoUrl = document.getElementById('videoUrl');
    const loader = document.getElementById('loader');
    const resultSection = document.getElementById('result');
    const hdDownload = document.getElementById('hdDownload');
    const resultPreview = document.getElementById('resultPreview');

    // سيقوم الموقع بالتعرف على السيرفر تلقائياً
    const API_BASE_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' 
        ? 'https://my-downloader-2i1g.onrender.com' // ضع رابطك هنا للعمل محلياً
        : ''; // عند الرفع على ريندر سيعرف نفسه تلقائياً

    if (window.lucide) lucide.createIcons();

    const processDownload = async () => {
        const url = videoUrl.value.trim();
        if (!url) {
            alert('من فضلك ضع رابط المقطع أولاً');
            return;
        }

        setLoading(true);

        try {
            // الاتصال بمحركك الخاص (سحابياً أو محلياً)
            const response = await fetch(`${API_BASE_URL}/api/download?url=${encodeURIComponent(url)}`);
            const data = await response.json();

            if (data.success) {
                showResult(data);
                alert('تم جلب الرابط بنجاح!');
            } else {
                throw new Error(data.error || 'خطأ غير معروف من السيرفر');
            }

        } catch (error) {
            console.error('Download Error:', error);
            const errorMsg = error.message || error;
            alert(`حدث خطأ! انظر إلى أسفل الصفحة لمشاهدة التفاصيل.`);
            
            // إنشاء صندوق لعرض الخطأ الطويل إذا لم يكن موجوداً
            let errorBox = document.getElementById('errorBox');
            if (!errorBox) {
                errorBox = document.createElement('textarea');
                errorBox.id = 'errorBox';
                errorBox.style = 'width:100%; height:200px; margin-top:20px; background:#1e293b; color:#ef4444; padding:10px; border-radius:10px; border:1px solid #ef4444; direction:ltr; text-align:left;';
                resultSection.parentElement.appendChild(errorBox);
            }
            errorBox.value = `Error Details:\n${errorMsg}`;
            errorBox.style.display = 'block';
            errorBox.scrollIntoView({ behavior: 'smooth' });
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
