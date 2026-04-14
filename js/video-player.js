/**
 * Custom HTML5 Video Player with Advanced Controls
 * Part B2 - Video Player with Events Tracking
 */

class VideoPlayer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.video = this.container.querySelector('video');
    this.playBtn = this.container.querySelector('[data-action="play"]');
    this.seekBar = this.container.querySelector('[data-action="seek"]');
    this.timeDisplay = this.container.querySelector('[data-display="time"]');
    this.volumeSlider = this.container.querySelector('[data-action="volume"]');
    this.speedSelector = this.container.querySelector('[data-action="speed"]');
    this.fullscreenBtn = this.container.querySelector('[data-action="fullscreen"]');
    this.statusDisplay = this.container.querySelector('[data-display="status"]');
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupSpeedSelector();
  }

  setupEventListeners() {
    // Play/Pause
    if (this.playBtn) {
      this.playBtn.addEventListener('click', () => {
        if (this.video.paused) {
          this.video.play();
        } else {
          this.video.pause();
        }
      });
    }

    // Seek bar
    if (this.seekBar) {
      this.seekBar.addEventListener('input', (e) => {
        this.video.currentTime = e.target.value;
      });
    }

    // Volume control
    if (this.volumeSlider) {
      this.volumeSlider.addEventListener('input', (e) => {
        this.video.volume = e.target.value;
      });
    }

    // Fullscreen
    if (this.fullscreenBtn) {
      this.fullscreenBtn.addEventListener('click', () => this.requestFullscreen());
    }

    // Video events - tracking state transitions
    this.video.addEventListener('play', () => this.handlePlay());
    this.video.addEventListener('playing', () => this.handlePlaying());
    this.video.addEventListener('pause', () => this.handlePause());
    this.video.addEventListener('loadedmetadata', () => this.handleLoadedMetadata());
    this.video.addEventListener('timeupdate', () => this.handleTimeUpdate());
    this.video.addEventListener('waiting', () => this.handleWaiting());
    this.video.addEventListener('ended', () => this.handleEnded());
    this.video.addEventListener('error', (e) => this.handleError(e));
    this.video.addEventListener('fullscreenchange', () => this.handleFullscreenChange());

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  setupSpeedSelector() {
    if (this.speedSelector) {
      const speeds = [0.75, 1, 1.25, 1.5, 2];
      speeds.forEach(speed => {
        const option = document.createElement('option');
        option.value = speed;
        option.textContent = `${speed}x`;
        if (speed === 1) option.selected = true;
        this.speedSelector.appendChild(option);
      });

      this.speedSelector.addEventListener('change', (e) => {
        this.video.playbackRate = parseFloat(e.target.value);
      });
    }
  }

  handlePlay() {
    this.updateStatus('Play event fired');
    if (this.playBtn) {
      this.playBtn.textContent = '⏸ Pause';
    }
  }

  handlePlaying() {
    this.updateStatus('Playing (actively playing media)');
    // 'playing' event fires when playback actually starts (after buffering)
  }

  handlePause() {
    this.updateStatus('Paused');
    if (this.playBtn) {
      this.playBtn.textContent = '▶ Play';
    }
  }

  handleLoadedMetadata() {
    this.updateStatus('Metadata loaded');
    if (this.seekBar) {
      this.seekBar.max = this.video.duration;
    }
  }

  handleTimeUpdate() {
    if (this.seekBar) {
      this.seekBar.value = this.video.currentTime;
    }
    this.updateTimeDisplay();
  }

  handleWaiting() {
    this.updateStatus('Waiting (buffering...)');
  }

  handleEnded() {
    this.updateStatus('Ended');
    if (this.playBtn) {
      this.playBtn.textContent = '▶ Play';
    }
  }

  handleError(e) {
    let errorMsg = 'Unknown error';
    if (this.video.error) {
      switch (this.video.error.code) {
        case 1: errorMsg = 'Video loading aborted'; break;
        case 2: errorMsg = 'Network error'; break;
        case 3: errorMsg = 'Video decoding failed'; break;
        case 4: errorMsg = 'Video format not supported'; break;
      }
    }
    this.updateStatus(`Error: ${errorMsg}`);
  }

  handleFullscreenChange() {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      if (this.fullscreenBtn) this.fullscreenBtn.textContent = '⛶ Exit Fullscreen';
    } else {
      if (this.fullscreenBtn) this.fullscreenBtn.textContent = '⛶ Fullscreen';
    }
  }

  handleKeyboard(e) {
    if (e.code === 'Space' && e.target === document.body) {
      e.preventDefault();
      this.video.paused ? this.video.play() : this.video.pause();
    } else if (e.key === 'f') {
      this.requestFullscreen();
    } else if (e.key === 'ArrowLeft') {
      this.video.currentTime = Math.max(0, this.video.currentTime - 10);
    } else if (e.key === 'ArrowRight') {
      this.video.currentTime = Math.min(this.video.duration, this.video.currentTime + 10);
    } else if (e.key === 'ArrowUp') {
      this.video.volume = Math.min(1, this.video.volume + 0.1);
      if (this.volumeSlider) this.volumeSlider.value = this.video.volume;
    } else if (e.key === 'ArrowDown') {
      this.video.volume = Math.max(0, this.video.volume - 0.1);
      if (this.volumeSlider) this.volumeSlider.value = this.video.volume;
    }
  }

  requestFullscreen() {
    if (this.video.requestFullscreen) {
      this.video.requestFullscreen();
    } else if (this.video.webkitRequestFullscreen) {
      this.video.webkitRequestFullscreen();
    } else if (this.video.mozRequestFullScreen) {
      this.video.mozRequestFullScreen();
    }
  }

  updateTimeDisplay() {
    if (this.timeDisplay) {
      const current = formatTime(this.video.currentTime);
      const total = formatTime(this.video.duration);
      this.timeDisplay.textContent = `${current} / ${total}`;
    }
  }

  updateStatus(message) {
    if (this.statusDisplay) {
      this.statusDisplay.textContent = `Status: ${message}`;
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const videoPlayerContainer = document.getElementById('video-player-container');
    if (videoPlayerContainer) {
      window.videoPlayer = new VideoPlayer('video-player-container');
    }
  });
}
