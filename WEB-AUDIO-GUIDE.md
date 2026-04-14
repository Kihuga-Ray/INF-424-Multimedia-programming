# Web Audio API Architecture Guide

## Complete Audio Signal Processing Flow

### 1. AudioContext Creation
```javascript
// Created lazily on first user interaction (browser autoplay policy)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
```

### 2. Source Nodes
- **OscillatorNode**: Generates waveforms (sine, square, sawtooth, triangle)
- **MediaElementAudioSourceNode**: Used for audio/video elements (not in this project)
- **MediaStreamAudioSourceNode**: Used for live microphone input

### 3. Processing Nodes
- **GainNode**: Volume control and ADSR envelope implementation
- **BiquadFilterNode**: Low-pass, high-pass, bandpass filtering
- **ConvolverNode**: Reverb and acoustic simulation (shimmer effects)
- **DelayNode**: Echo and delay effects
- **StereoPannerNode**: Left/right stereo positioning
- **AnalyserNode**: Real-time frequency analysis for visualization

### 4. Destination
- **AudioContext.destination**: Speakers/headphones (final output)

## ADSR Envelope Deep Dive

### Why ADSR Prevents Artifacts?

**Problem without ramping:**
```
Oscillator at full amplitude suddenly starts → Click
Oscillator at full amplitude suddenly stops → Click
```

**Solution with ADSR:**
```javascript
const now = audioContext.currentTime;
gainNode.gain.setValueAtTime(0, now);                    // Start at 0
gainNode.gain.linearRampToValueAtTime(1, now + 0.01);   // Attack: 10ms ramp to 1
gainNode.gain.setValueAtTime(1, now + duration - 0.6);  // Sustain full volume
gainNode.gain.linearRampToValueAtTime(0, now + duration);// Release: 600ms ramp to 0
```

### Why linearRampToValueAtTime Works
- Gradually changes amplitude over time
- Browser calculates intermediate values between start/end
- Total of 600ms provides time for speaker to reach zero volume
- Prevents audible "pop" or "click" sound

## Musical Notes as Frequencies

### Western 12-Tone Equal Temperament
```
Frequency = 440 * 2^((n - 69) / 12)  where 440Hz is A4
```

### Implementation in Project
```javascript
const notes = {
  'C4': 261.63,   // Middle C (piano key C)
  'D4': 293.66,
  'E4': 329.63,
  'F4': 349.23,
  'G4': 392.00,
  'A4': 440.00,   // Concert pitch reference
  'B4': 493.88,
  'C5': 523.25    // High C (one octave up)
};
```

## Waveform Characteristics

### Sine Wave
- Smoothest, purest tone
- Only fundamental frequency, no harmonics
- Used for subtractive synthesis base
- Mathematically: y = sin(2π * frequency * time)

### Square Wave
- 50% duty cycle, brightness
- Contains only odd harmonics (1st, 3rd, 5th, 7th...)
- Digital/retro sound character
- Uses Fourier series: sum of sine waves at odd multiples

### Sawtooth Wave
- Contains all harmonics (odd and even)
- Brightest waveform available
- Very "buzzy" and raw sound
- Rich harmonic content makes it perfect for subtractive synthesis

### Triangle Wave  
- Between sine and square
- Contains odd harmonics, but with less high-frequency content
- Hollow, mellow sound
- Good for warm pads and smooth leads

## Frequency Analysis & Visualization

### Analyser Node Setup
```javascript
analyser = audioContext.createAnalyser();
analyser.fftSize = 2048;  // Fast Fourier Transform size
analyser.connect(destination);
```

### FFT (Fast Fourier Transform)
- Converts time-domain audio to frequency domain
- Shows which frequencies are present and their amplitudes
- The more bins (higher fftSize), clearer the visualization

### Real-Time Frequency Visualization
```javascript
const dataArray = new Uint8Array(analyser.frequencyBinCount);
analyser.getByteFrequencyData(dataArray);
// dataArray contains frequency magnitudes 0-255
// Plot on canvas: x-axis = frequency, y-axis = magnitude
```

## Digital Audio Concepts

### Sample Rate
- 44,100 Hz most common (CD quality)
- 48,000 Hz for professional audio
- Higher = more accurate representation of high frequencies
- Nyquist frequency = sample_rate / 2 (maximum representable frequency)

### Bit Depth
- 16 bits = 65,536 levels of amplitude quantization
- 24 bits = 16,777,216 levels (higher fidelity)
- Web Audio API typically uses 32-bit floating point internally

### Latency
- AudioContext.currentTime provides high-precision timing
- Sub-millisecond accuracy for scheduling note onset/offset
- Critical for musical timing and synchronization

## Connection Patterns

### Series Connection (Effects Chain)
```javascript
source → filter → delay → reverb → gain → destination
```

### Parallel Connection (Mixing)
```javascript
source1 → gain1 ┐
                 → output → destination
source2 → gain2 ┘
```

### Feedback Loop (Caution!)
```javascript
source → filter → output
     ←---← (can cause runaway/distortion)
```

## Oscillator Node Advanced

### Creating and Using
```javascript
const osc = audioContext.createOscillator();
osc.frequency.value = 440;      // Base frequency
osc.detune.value = 50;          // ±100 cents detuning
osc.type = 'sine';              // 'sine', 'square', 'sawtooth', 'triangle'

// Envelope frequency modulation
osc.frequency.setValueAtTime(440, now);
osc.frequency.linearRampToValueAtTime(880, now + 2);  // Frequency sweep

osc.start(now);
osc.stop(now + 2);
```

### Multiple Oscillators (Polyphony)
```javascript
// Create multiple oscillators for chords
const c4 = createOsc(261.63);
const e4 = createOsc(329.63);
const g4 = createOsc(392.00);
// All connected to same gainNode for unified volume control
```

## Browser Compatibility

### AudioContext
- Chrome/Edge: Standard `AudioContext`
- Firefox: Standard `AudioContext`
- Safari: Webkit-prefixed `webkitAudioContext`
- Implementation: `new (window.AudioContext || window.webkitAudioContext)()`

### API Stability
- Web Audio API is W3C standard since 2021
- All major browsers support all nodes used in this project
- Minor API differences mostly in initialization

## References

- W3C Web Audio API Specification: https://www.w3.org/TR/webaudio/
- MDN Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- "Designing Audio Objects for Interactive Systems" - Victor Zappi et al.
- "Introduction to Digital Audio" - Huber & Runstein
