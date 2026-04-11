/**
 * ProxiSafe ML Camera - OpenCV backend integration
 * Overview: "Explore this with a demo" -> Open Camera | Upload Video
 */

const ML_DETECT_API = 'http://localhost:5000/api/detect-frame';
const ML_HEALTH_API = 'http://localhost:5000/health';

class MLCameraView {
    constructor() {
        this.video = null;
        this.canvas = null;
        this.ctx = null;
        this.isRunning = false;
        this.animationId = null;
        this.mode = 'camera';
        this.uploadedVideoUrl = null;
        this.processing = false;
        this.frameInterval = 500;
        this.lastFrameTime = 0;
    }

    resetSession() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.processing = false;
        this.lastFrameTime = 0;
        this.video = document.getElementById('ml-camera-video');
        if (this.video) {
            if (this.video.srcObject) {
                this.video.srcObject.getTracks().forEach(t => t.stop());
                this.video.srcObject = null;
            }
            if (this.uploadedVideoUrl) {
                URL.revokeObjectURL(this.uploadedVideoUrl);
                this.uploadedVideoUrl = null;
            }
            this.video.removeAttribute('src');
            this.video.load();
        }
        this.updateViolationCount(0);
        this.updatePeopleCount(null);
        this.setDetectHint('');
        this.setDetectorLine('');
        const status = document.getElementById('ml-status');
        if (status) status.textContent = 'Ready';
    }

    setDetectorLine(html) {
        const el = document.getElementById('ml-detector-line');
        if (!el) return;
        if (!html) {
            el.innerHTML = '';
            el.classList.add('hidden');
            return;
        }
        el.innerHTML = html;
        el.classList.remove('hidden');
    }

    async fetchDetectorHealth() {
        try {
            const res = await fetch(ML_HEALTH_API, { signal: AbortSignal.timeout(4000) });
            if (!res.ok) return;
            const data = await res.json();
            const d = data.detector || {};
            const be = d.backend || 'unknown';
            const model = d.yolo_model || '';
            if (be === 'yolo') {
                this.setDetectorLine(
                    '<strong>Detector:</strong> YOLO' +
                        (model ? ` (${model})` : '') +
                        ' — tiled inference on large frames when enabled on server.'
                );
            } else {
                this.setDetectorLine(
                    '<strong>Detector:</strong> OpenCV HOG — often <strong>0 people</strong> on wide crowd shots. ' +
                        'Install YOLO: <code>pip install -r requirements-yolo.txt</code> in <code>ml-model/</code>, restart the server, ' +
                        'and remove <code>DETECTOR_BACKEND=hog</code> from <code>.env</code> if set.'
                );
            }
        } catch (_) {
            this.setDetectorLine('');
        }
    }

    updatePeopleCount(n) {
        const el = document.getElementById('ml-people-count');
        if (!el) return;
        if (n === null || n === undefined) {
            el.textContent = '—';
            return;
        }
        el.textContent = String(n);
    }

    setDetectHint(message) {
        const hint = document.getElementById('ml-detect-hint');
        if (!hint) return;
        if (!message) {
            hint.classList.add('hidden');
            hint.textContent = '';
            return;
        }
        hint.textContent = message;
        hint.classList.remove('hidden');
    }

    drawDetections(detections) {
        if (!this.ctx || !this.canvas) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        (detections || []).forEach(d => {
            const [x, y, w, h] = d.bbox;
            const color = d.is_violation ? '#ef4444' : '#10b981';
            const label = d.is_violation ? 'VIOLATION' : 'OK';
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(x, y, w, h);
            this.ctx.fillStyle = color;
            this.ctx.font = 'bold 14px Inter, sans-serif';
            this.ctx.fillText(label, x, y - 5);
        });
    }

    updateViolationCount(count) {
        const el = document.getElementById('ml-violation-count');
        if (el) {
            el.textContent = count ?? 0;
            el.className = 'ml-violation-count' + ((count ?? 0) > 0 ? ' has-violations' : '');
        }
    }

    async sendFrameAndDraw() {
        if (!this.isRunning || !this.video || !this.canvas) return;
        if (this.video.readyState < 2) {
            this.animationId = requestAnimationFrame(() => this.sendFrameAndDraw());
            return;
        }
        const now = Date.now();
        if (now - this.lastFrameTime < this.frameInterval || this.processing) {
            this.animationId = requestAnimationFrame(() => this.sendFrameAndDraw());
            return;
        }
        this.processing = true;
        this.lastFrameTime = now;
        try {
            const blob = await this.captureFrame();
            if (!blob) {
                this.processing = false;
                this.animationId = requestAnimationFrame(() => this.sendFrameAndDraw());
                return;
            }
            const formData = new FormData();
            formData.append('file', blob, 'frame.jpg');
            const res = await fetch(ML_DETECT_API, {
                method: 'POST',
                body: formData,
            });
            if (!res.ok) throw new Error('API error');
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            const total = data.total_persons ?? 0;
            this.updatePeopleCount(total);
            this.drawDetections(data.detections || []);
            this.updateViolationCount(data.violation_count ?? 0);
            if (total === 0) {
                const yoloHint =
                    backend === 'yolo'
                        ? ' Try lowering YOLO_CONF or using a clip where people are larger in frame.'
                        : ' For stadium/crowd scenes, use YOLO (pip install ultralytics in ml-model venv) and avoid DETECTOR_BACKEND=hog in .env.';
                this.setDetectHint(
                    'No people detected in this frame, so violations stay 0. ' +
                        'Very wide shots with tiny figures are challenging.' +
                        yoloHint
                );
            } else {
                this.setDetectHint('');
            }
        } catch (e) {
            this.updateViolationCount(0);
            this.updatePeopleCount(null);
            this.setDetectHint('');
            const statusEl = document.getElementById('ml-status');
            if (statusEl) {
                statusEl.innerHTML = '<i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i> ML API offline — run: cd ml-model && python app.py';
            }
        }
        this.processing = false;
        this.animationId = requestAnimationFrame(() => this.sendFrameAndDraw());
    }

    captureFrame() {
        return new Promise(resolve => {
            if (!this.video || !this.canvas) {
                resolve(null);
                return;
            }
            const w = this.video.videoWidth;
            const h = this.video.videoHeight;
            if (w === 0 || h === 0) {
                resolve(null);
                return;
            }
            this.canvas.width = w;
            this.canvas.height = h;
            this.ctx = this.canvas.getContext('2d');
            this.ctx.drawImage(this.video, 0, 0);
            const q = this.mode === 'video' ? 0.95 : 0.9;
            this.canvas.toBlob(blob => resolve(blob), 'image/jpeg', q);
        });
    }

    async startCamera() {
        const modal = document.getElementById('ml-camera-modal');
        if (!modal) return;
        modal.classList.add('show');
        this.resetSession();
        this.mode = 'camera';
        this.frameInterval = 500;
        this.video = document.getElementById('ml-camera-video');
        this.video.controls = false;
        this.canvas = document.getElementById('ml-camera-canvas');
        this.ctx = this.canvas.getContext('2d');
        document.getElementById('ml-violation-count').textContent = '0';
        document.getElementById('ml-status').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Starting camera...';

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
            });
            this.video.srcObject = stream;
            this.video.onloadedmetadata = () => {
                this.canvas.width = this.video.videoWidth;
                this.canvas.height = this.video.videoHeight;
                document.getElementById('ml-status').innerHTML = '<i class="fas fa-check-circle" style="color: #10b981;"></i> OpenCV ML active';
                this.isRunning = true;
                this.fetchDetectorHealth();
                this.sendFrameAndDraw();
            };
            await this.video.play();
        } catch (e) {
            document.getElementById('ml-status').textContent = 'Camera access denied';
            console.error(e);
        }
    }

    startVideoPlayback(file) {
        const modal = document.getElementById('ml-camera-modal');
        if (!modal) return;
        modal.classList.add('show');
        this.resetSession();
        this.mode = 'video';
        this.frameInterval = 200;
        this.video = document.getElementById('ml-camera-video');
        this.canvas = document.getElementById('ml-camera-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.uploadedVideoUrl = URL.createObjectURL(file);
        this.video.muted = true;
        this.video.playsInline = true;
        this.video.controls = true;
        this.video.src = this.uploadedVideoUrl;
        document.getElementById('ml-violation-count').textContent = '0';
        document.getElementById('ml-status').innerHTML = '<i class="fas fa-check-circle" style="color: #10b981;"></i> OpenCV ML processing';
        this.fetchDetectorHealth();

        this.video.onloadedmetadata = () => {
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
            // Do not rely on onplay alone: autoplay can fail silently and then isRunning never becomes true.
            this.isRunning = true;
            this.sendFrameAndDraw();
        };
        this.video.play().catch(() => {});
    }

    closeModal() {
        this.resetSession();
        document.getElementById('ml-camera-modal')?.classList.remove('show');
        document.getElementById('ml-demo-landing')?.classList.remove('hidden');
        document.getElementById('ml-demo-content')?.classList.add('hidden');
        document.getElementById('ml-video-upload')?.classList.add('hidden');
    }
}

window.MLCameraView = MLCameraView;
window.mlCameraView = new MLCameraView();

function openMLDemo() {
    window.mlCameraView.resetSession();
    document.getElementById('ml-demo-landing')?.classList.remove('hidden');
    document.getElementById('ml-demo-content')?.classList.add('hidden');
    document.getElementById('ml-video-upload')?.classList.add('hidden');
    document.getElementById('ml-camera-modal')?.classList.add('show');
    document.getElementById('ml-camera-title').textContent = 'ML demo — social distancing detection';
}

/** Overview (and shortcuts): same popup as Camera Management — go straight to live camera */
function openOverviewMLCamera() {
    window.mlCameraView.resetSession();
    startMLDemoCamera();
}

/** Overview: same popup — go straight to upload video step */
function openOverviewMLVideo() {
    window.mlCameraView.resetSession();
    startMLDemoVideo();
}

function startMLDemoCamera() {
    document.getElementById('ml-camera-modal')?.classList.add('show');
    document.getElementById('ml-demo-landing')?.classList.add('hidden');
    document.getElementById('ml-demo-content')?.classList.remove('hidden');
    document.getElementById('ml-video-upload')?.classList.add('hidden');
    document.querySelectorAll('.ml-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('.ml-tab[data-mode="camera"]')?.classList.add('active');
    document.getElementById('ml-camera-title').textContent = 'ML demo — social distancing detection';
    window.mlCameraView.startCamera();
}

function startMLDemoVideo() {
    document.getElementById('ml-camera-modal')?.classList.add('show');
    document.getElementById('ml-demo-landing')?.classList.add('hidden');
    document.getElementById('ml-demo-content')?.classList.remove('hidden');
    document.querySelectorAll('.ml-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('.ml-tab[data-mode="video"]')?.classList.add('active');
    document.getElementById('ml-video-upload')?.classList.remove('hidden');
    document.getElementById('ml-video-file').value = '';
    document.getElementById('ml-status').textContent = 'Upload a video file';
    document.getElementById('ml-camera-title').textContent = 'ML demo — social distancing detection';
}

function backToMLDemoChoice() {
    window.mlCameraView.resetSession();
    document.getElementById('ml-demo-landing')?.classList.remove('hidden');
    document.getElementById('ml-demo-content')?.classList.add('hidden');
    document.getElementById('ml-video-upload')?.classList.add('hidden');
}

function switchMLMode(mode) {
    window.mlCameraView.resetSession();
    document.querySelectorAll('.ml-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.ml-tab[data-mode="${mode}"]`)?.classList.add('active');
    const uploadZone = document.getElementById('ml-video-upload');
    if (mode === 'video') {
        uploadZone?.classList.remove('hidden');
        document.getElementById('ml-status').textContent = 'Upload a video file';
        document.getElementById('ml-video-file').value = '';
    } else {
        uploadZone?.classList.add('hidden');
        window.mlCameraView.startCamera();
    }
    window.mlCameraView.mode = mode;
}

function handleVideoUpload(input) {
    const file = input?.files?.[0];
    if (!file || !file.type.startsWith('video/')) {
        if (typeof showNotification === 'function') showNotification('Please select a video file', 'error');
        else alert('Select a video file');
        return;
    }
    document.getElementById('ml-video-upload')?.classList.add('hidden');
    document.querySelector('.ml-tab[data-mode="video"]')?.classList.add('active');
    document.querySelector('.ml-tab[data-mode="camera"]')?.classList.remove('active');
    window.mlCameraView.startVideoPlayback(file);
}

/** Direct camera start (skips landing) — same as Camera Management flow */
function openMLCamera() {
    window.mlCameraView.resetSession();
    startMLDemoCamera();
}

function closeMLCamera() {
    window.mlCameraView.closeModal();
}

// Explicit globals + Overview button wiring (onclick + listeners for reliability)
window.openMLDemo = openMLDemo;
window.openOverviewMLCamera = openOverviewMLCamera;
window.openOverviewMLVideo = openOverviewMLVideo;
window.startMLDemoCamera = startMLDemoCamera;
window.startMLDemoVideo = startMLDemoVideo;
window.openMLCamera = openMLCamera;
window.closeMLCamera = closeMLCamera;
window.switchMLMode = switchMLMode;
window.handleVideoUpload = handleVideoUpload;
window.backToMLDemoChoice = backToMLDemoChoice;

(function bindMLOverviewButtons() {
    function bind() {
        var cam = document.getElementById('ml-overview-open-camera');
        var vid = document.getElementById('ml-overview-upload-video');
        var menu = document.getElementById('ml-overview-open-menu');
        if (cam) {
            cam.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                openOverviewMLCamera();
            });
        }
        if (vid) {
            vid.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                openOverviewMLVideo();
            });
        }
        if (menu) {
            menu.addEventListener('click', function (e) {
                e.preventDefault();
                openMLDemo();
            });
        }
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bind);
    } else {
        bind();
    }
})();
