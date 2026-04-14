/**
 * Camera Capture and Canvas Filters
 * Part C2 - MediaDevices API and Canvas API
 */

class CameraCapture {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.video = this.container.querySelector('video');
    this.canvas = this.container.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.mediaStream = null;
    this.frameData = null;

    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    const startBtn = this.container.querySelector('[data-action="start-camera"]');
    const stopBtn = this.container.querySelector('[data-action="stop-camera"]');
    const captureBtn = this.container.querySelector('[data-action="capture"]');
    const greyscaleBtn = this.container.querySelector('[data-action="greyscale"]');
    const downloadBtn = this.container.querySelector('[data-action="download"]');
    const invertBtn = this.container.querySelector('[data-action="invert"]');
    const sepiaBtn = this.container.querySelector('[data-action="sepia"]');

    if (startBtn) startBtn.addEventListener('click', () => this.startCamera());
    if (stopBtn) stopBtn.addEventListener('click', () => this.stopCamera());
    if (captureBtn) captureBtn.addEventListener('click', () => this.captureFrame());
    if (greyscaleBtn) greyscaleBtn.addEventListener('click', () => this.applyGreyscale());
    if (downloadBtn) downloadBtn.addEventListener('click', () => this.downloadFrame());
    if (invertBtn) invertBtn.addEventListener('click', () => this.applyInvert());
    if (sepiaBtn) sepiaBtn.addEventListener('click', () => this.applySepia());
  }

  async startCamera() {
    try {
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      };

      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.srcObject = this.mediaStream;
      this.updateStatus('Camera started successfully');
    } catch (error) {
      this.handleCameraError(error);
    }
  }

  stopCamera() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
      this.video.srcObject = null;
      this.updateStatus('Camera stopped');
    }
  }

  handleCameraError(error) {
    let errorMsg = 'Unknown camera error';

    if (error.name === 'NotAllowedError') {
      errorMsg = 'Camera permission denied. Please allow camera access in settings.';
    } else if (error.name === 'NotFoundError') {
      errorMsg = 'No camera device found. Check your hardware.';
    } else if (error.name === 'NotReadableError') {
      errorMsg = 'Camera is already in use by another application.';
    } else if (error.name === 'PermissionDeniedError') {
      errorMsg = 'Permission denied for camera access.';
    } else if (error.name === 'TypeError') {
      errorMsg = 'Invalid constraints specified for camera.';
    }

    this.updateStatus(`Error: ${errorMsg}`);
    console.error('Camera error:', error);
  }

  captureFrame() {
    if (!this.mediaStream) {
      this.updateStatus('Please start camera first');
      return;
    }

    // Size canvas to match video
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;

    // Draw current video frame to canvas
    this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

    // Store frame data for filters
    this.frameData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

    this.updateStatus('Frame captured');
  }

  applyGreyscale() {
    if (!this.frameData) {
      this.updateStatus('Please capture a frame first');
      return;
    }

    const data = this.frameData.data;

    // ITU-R BT.601 luminance formula: Y = 0.299R + 0.587G + 0.114B
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Calculate luminance
      const grey = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

      data[i] = grey;     // R
      data[i + 1] = grey; // G
      data[i + 2] = grey; // B
      // data[i + 3] is alpha, leave unchanged
    }

    this.ctx.putImageData(this.frameData, 0, 0);
    this.updateStatus('Greyscale filter applied');
  }

  applyInvert() {
    if (!this.frameData) {
      this.updateStatus('Please capture a frame first');
      return;
    }

    const data = this.frameData.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];         // R
      data[i + 1] = 255 - data[i + 1]; // G
      data[i + 2] = 255 - data[i + 2]; // B
      // data[i + 3] is alpha, leave unchanged
    }

    this.ctx.putImageData(this.frameData, 0, 0);
    this.updateStatus('Invert filter applied');
  }

  applySepia() {
    if (!this.frameData) {
      this.updateStatus('Please capture a frame first');
      return;
    }

    const data = this.frameData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);         // R
      data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);     // G
      data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);     // B
    }

    this.ctx.putImageData(this.frameData, 0, 0);
    this.updateStatus('Sepia filter applied');
  }

  downloadFrame() {
    const link = document.createElement('a');
    link.href = this.canvas.toDataURL('image/png');
    link.download = `capture-${Date.now()}.png`;
    link.click();

    this.updateStatus('Image downloaded');
  }

  updateStatus(message) {
    const statusDisplay = this.container.querySelector('[data-display="status"]');
    if (statusDisplay) {
      statusDisplay.textContent = `Status: ${message}`;
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const cameraCaptureContainer = document.getElementById('camera-capture-container');
    if (cameraCaptureContainer) {
      window.cameraCapture = new CameraCapture('camera-capture-container');
    }
  });
}
