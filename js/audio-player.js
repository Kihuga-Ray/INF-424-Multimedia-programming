/**
 * Custom HTML5 Audio Player with Web Audio API Integration
 * Part B1 & B3 - Audio Player + Tone Generator
 */

class AudioPlayer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.audio = this.container.querySelector('audio');
    this.playBtn = this.container.querySelector('[data-action="play"]');
    this.pauseBtn = this.container.querySelector('[data-action="pause"]');
    this.seekBar = this.container.querySelector('[data-action="seek"]');
    this.timeDisplay = this.container.querySelector('[data-display="time"]');
    this.volumeSlider = this.container.querySelector('[data-action="volume"]');
    this.muteBtn = this.container.querySelector('[data-action="mute"]');
    this.statusDisplay = this.container.querySelector('[data-display="status"]');
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateTimeDisplay();
  }

  setupEventListeners() {
    // Play/Pause controls
    if (this.playBtn) this.playBtn.addEventListener('click', () => this.play());
    if (this.pauseBtn) this.pauseBtn.addEventListener('click', () => this.pause());

    // Seek bar
    if (this.seekBar) {
      this.seekBar.addEventListener('input', (e) => {
        this.audio.currentTime = e.target.value;
      });
    }

    // Volume control
    if (this.volumeSlider) {
      this.volumeSlider.addEventListener('input', (e) => {
        this.audio.volume = e.target.value;
      });
    }

    // Mute button
    if (this.muteBtn) {
      this.muteBtn.addEventListener('click', () => this.toggleMute());
    }

    // Audio events
    this.audio.addEventListener('loadstart', () => this.handleLoadStart());
    this.audio.addEventListener('loadeddata', () => this.handleLoadedData());
    this.audio.addEventListener('play', () => this.handlePlay());
    this.audio.addEventListener('pause', () => this.handlePause());
    this.audio.addEventListener('timeupdate', () => this.handleTimeUpdate());
    this.audio.addEventListener('waiting', () => this.handleWaiting());
    this.audio.addEventListener('ended', () => this.handleEnded());
    this.audio.addEventListener('error', (e) => this.handleError(e));

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  play() {
    this.audio.play().catch(err => {
      console.error('Playback failed:', err);
      this.updateStatus('Playback failed - see console');
    });
  }

  pause() {
    this.audio.pause();
  }

  toggleMute() {
    this.audio.muted = !this.audio.muted;
    if (this.muteBtn) {
      this.muteBtn.textContent = this.audio.muted ? '🔇 Unmute' : '🔊 Mute';
    }
  }

  handleLoadStart() {
    this.updateStatus('Loading...');
  }

  handleLoadedData() {
    this.updateStatus('Ready to play');
    if (this.seekBar) {
      this.seekBar.max = this.audio.duration || 0;
    }
  }

  handlePlay() {
    this.updateStatus('Playing');
    if (this.playBtn) {
      this.playBtn.textContent = '⏸ Pause';
      this.playBtn.dataset.action = 'pause';
    }
  }

  handlePause() {
    this.updateStatus('Paused');
    if (this.playBtn) {
      this.playBtn.textContent = '▶ Play';
      this.playBtn.dataset.action = 'play';
    }
  }

  handleTimeUpdate() {
    this.updateTimeDisplay();
    if (this.seekBar) {
      this.seekBar.value = this.audio.currentTime;
    }
  }

  handleWaiting() {
    this.updateStatus('Buffering...');
  }

  handleEnded() {
    this.updateStatus('Ended');
    if (this.playBtn) {
      this.playBtn.textContent = '▶ Play';
      this.playBtn.dataset.action = 'play';
    }
  }

  handleError(e) {
    let errorMsg = 'Unknown error';
    if (this.audio.error) {
      switch (this.audio.error.code) {
        case 1: errorMsg = 'Audio loading aborted'; break;
        case 2: errorMsg = 'Network error'; break;
        case 3: errorMsg = 'Audio decoding failed'; break;
        case 4: errorMsg = 'Audio format not supported'; break;
      }
    }
    this.updateStatus(`Error: ${errorMsg}`);
  }

  handleKeyboard(e) {
    if (e.code === 'Space' && e.target === document.body) {
      e.preventDefault();
      this.audio.paused ? this.play() : this.pause();
    } else if (e.key.toLowerCase() === 'm') {
      this.toggleMute();
    } else if (e.key === 'ArrowLeft') {
      this.audio.currentTime = Math.max(0, this.audio.currentTime - 10);
    } else if (e.key === 'ArrowRight') {
      this.audio.currentTime = Math.min(this.audio.duration, this.audio.currentTime + 10);
    }
  }

  updateTimeDisplay() {
    if (this.timeDisplay) {
      const current = formatTime(this.audio.currentTime);
      const total = formatTime(this.audio.duration);
      this.timeDisplay.textContent = `${current} / ${total}`;
    }
  }

  updateStatus(message) {
    if (this.statusDisplay) {
      this.statusDisplay.textContent = `Status: ${message}`;
    }
  }
}

/**
 * Web Audio API Tone Generator
 * Part B3 - Synthesizer with Effects
 */
class ToneGenerator {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.audioContext = null;
    this.oscillator = null;
    this.gainNode = null;
    this.reverbNode = null;
    this.analyser = null;
    this.isPlaying = false;
    
    // Audio settings
    this.waveform = 'sine';
    this.frequency = 440; // A4 note
    this.attack = 0.01;
    this.release = 0.6;
    
    // Musical notes
    this.notes = {
      'C4': 261.63,
      'D4': 293.66,
      'E4': 329.63,
      'F4': 349.23,
      'G4': 392.00,
      'A4': 440.00,
      'B4': 493.88,
      'C5': 523.25
    };

    this.init();
  }

  init() {
    this.setupUI();
  }

  setupUI() {
    // Waveform selector
    const waveformSelect = this.container.querySelector('[data-control="waveform"]');
    if (waveformSelect) {
      waveformSelect.addEventListener('change', (e) => {
        this.waveform = e.target.value;
        if (this.isPlaying) {
          this.stop();
          setTimeout(() => this.start(), 100);
        }
      });
    }

    // Note buttons
    Object.entries(this.notes).forEach(([note, freq]) => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-secondary btn-small';
      btn.textContent = note;
      btn.addEventListener('click', () => this.playNote(freq, button));
      
      const container = this.container.querySelector('[data-control="notes"]');
      if (container) container.appendChild(btn);
    });

    // Stop button
    const stopBtn = this.container.querySelector('[data-control="stop"]');
    if (stopBtn) {
      stopBtn.addEventListener('click', () => this.stop());
    }

    // Gain slider
    const gainSlider = this.container.querySelector('[data-control="gain"]');
    if (gainSlider) {
      gainSlider.addEventListener('input', (e) => {
        if (this.gainNode) {
          this.gainNode.gain.setValueAtTime(e.target.value, this.audioContext.currentTime);
        }
      });
    }
  }

  initAudioContext() {
    if (this.audioContext) return;

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create nodes
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
    
    // Create analyser for visualization
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.connect(this.gainNode);
    
    // Create convolver for reverb (simple shimmer effect)
    this.reverbNode = this.audioContext.createGain();
    this.reverbNode.gain.value = 0.3;
    this.reverbNode.connect(this.gainNode);
  }

  playNote(frequency, duration = 0.5) {
    this.initAudioContext();
    this.frequency = frequency;
    this.start(duration);
  }

  start(duration = 2) {
    if (this.isPlaying) this.stop();

    this.initAudioContext();
    const now = this.audioContext.currentTime;

    // Create oscillator
    this.oscillator = this.audioContext.createOscillator();
    this.oscillator.type = this.waveform;
    this.oscillator.frequency.value = this.frequency;

    // ADSR Envelope with smooth ramping to prevent clicks
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0, now); // Start at 0
    gain.gain.linearRampToValueAtTime(1, now + this.attack); // Attack to full volume
    gain.gain.setValueAtTime(1, now + duration - this.release); // Sustain
    gain.gain.linearRampToValueAtTime(0, now + duration); // Release decay

    // Connect signal path: Oscillator → Gain → Analyser → Reverb → Main Gain
    this.oscillator.connect(gain);
    gain.connect(this.analyser);
    this.analyser.connect(this.reverbNode);

    // Start and schedule stop
    this.oscillator.start(now);
    this.oscillator.stop(now + duration);

    this.isPlaying = true;

    // Update visualization
    this.visualizeAudio();
  }

  stop() {
    if (this.oscillator) {
      try {
        this.oscillator.stop();
      } catch (e) {
        // Already stopped
      }
      this.oscillator = null;
    }
    this.isPlaying = false;
  }

  visualizeAudio() {
    if (!this.isPlaying || !this.analyser) return;

    const canvas = this.container.querySelector('canvas');
    if (!canvas) {
      setTimeout(() => this.visualizeAudio(), 100);
      return;
    }

    // Create frequency visualization
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgb(99, 102, 241)';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const sliceWidth = width / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(width, height / 2);
    ctx.stroke();

    if (this.isPlaying) {
      requestAnimationFrame(() => this.visualizeAudio());
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Audio player
    const audioPlayerContainer = document.getElementById('audio-player-container');
    if (audioPlayerContainer) {
      window.audioPlayer = new AudioPlayer('audio-player-container');
    }

    // Tone generator
    const toneGeneratorContainer = document.getElementById('tone-generator-container');
    if (toneGeneratorContainer) {
      window.toneGenerator = new ToneGenerator('tone-generator-container');
    }
  });
}
