# Implementation Details

## Part B1: Custom Audio Player

### Events Handled
1. **loadstart** - Browser begins loading the audio resource
2. **loadeddata** - Current playframe loaded, seeking enabled
3. **play** - Play request initiated (may wait for data)
4. **pause** - Playback paused
5. **timeupdate** - ~250ms interval, updates UI with current time
6. **waiting** - Buffering (network stall)
7. **ended** - Playback complete
8. **error** - Decode or format error

### Keyboard Shortcuts
- Space: Toggle play/pause
- M: Toggle mute
- Left/Right Arrow: Seek ±10 seconds

## Part B3: Web Audio API Tone Generator

### Signal Graph
```
OscillatorNode (sine, square, sawtooth, triangle)
    ↓
GainNode (ADSR Envelope)
    ↓
AnalyserNode (frequency visualization)
    ↓
AudioContext.destination (speakers)
```

### ADSR Envelope
- Attack: 10ms (smooth fade-in)
- Release: 600ms (smooth fade-out)
- Prevents audio clicking artifacts

### Waveforms
- Sine: Smooth, pure fundamental frequency
- Square: Bright, digital, even harmonics only
- Sawtooth: Harsh, rich harmonics, all frequencies
- Triangle: Hollow, mellowness, odd harmonics

## Part B2: Custom Video Player

### Events - Play vs Playing Distinction
- **play event**: Fires when play() called but before buffering complete
- **playing event**: Fires when playback actually begins after buffering

### Player Features
- Seek bar with real-time position tracking
- Volume control slider
- Playback speed selector (0.75x to 2x)
- Fullscreen request via requestFullscreen()
- Responsive aspect ratio (16:9) using padding-bottom trick

## Part C1: CSS Animations

### Loading Spinner
- CSS @keyframes animation
- border-radius: 50% for circle
- border-top-color technique for rotation effect
- animation: spin 1s linear infinite

### Card Hover Effects
- Transform: translateY(-8px) with scale(1.02)
- Smooth cubic-bezier timing
- Color transitions on border and background

### SVG Draw Animation
- stroke-dasharray equal to path length
- stroke-dashoffset animated to 0
- Creates drawing effect from start to finish

## Part C2: Camera Capture

### Error Handling
1. **NotAllowedError**: Permission denied by user
2. **NotFoundError**: No camera hardware available
3. **NotReadableError**: Camera in use by another app

### Canvas Filters
1. **Greyscale**: ITU-R BT.601 luminance (0.299R + 0.587G + 0.114B)
2. **Sepia**: Historical photo tone using RGB matrix transformation
3. **Invert**: Simple RGB inversion (255 - R, 255 - G, 255 - B)

## Part D1: Component Gallery

### Pure Function Component
```javascript
function renderMediaCard(item) {
  // Returns HTML string, called via Array.map()
  // Benefits: Single source of truth, scalable, testable
}
```

### Data Processing Pipeline
```
mediaLibrary 
  → Array.filter() (search query) 
  → Array.map(renderMediaCard) 
  → Array.join('') 
  → innerHTML
```

### Event Delegation
- Single click listener on gallery container
- e.target.closest('.media-card') finds clicked card
- dataset attributes (data-id, data-type) store metadata
- Lower memory, works with dynamic cards

### Responsive Grid
```css
grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
```
- auto-fill: Creates columns as space allows
- minmax(260px, 1fr): Min 260px, max equal share
- No media queries needed
