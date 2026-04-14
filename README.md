# EduStream - Multimedia Learning Hub

**Student:** Raymond Kihuga Maina (INF/027/2020)  
**Course:** INF 424 - Multimedia Programming  
**Institution:** School of Information, Communication & Media Studies, BSc Informatics Year 4  
**Academic Year:** 2025/2026  

## 🌐 Live Deployment

- **GitHub Repository:** [inf424-multimedia-hub](https://github.com/Kihuga-Ray/INF-424-Multimedia-programming)
- **Live GitHub Pages:** https://kihuga-ray.github.io/INF-424-Multimedia-programming/

## 📋 Project Overview

EduStream is a comprehensive web-based multimedia learning platform demonstrating advanced multimedia programming concepts from INF 424 Weeks 1-7. The application integrates HTML5 media APIs, Web Audio synthesis, Canvas image processing, and component-based architecture principles.

## 📁 Repository Structure

```
inf424-multimedia-hub/
├── index.html                 # Part A1: Landing page with SVG
├── audio-player.html          # Part B1 & B3: Audio player + Web Audio API
├── video-player.html          # Part B2: Custom video player
├── animations.html            # Part C1 & C2: CSS animations + camera capture
├── gallery.html               # Part D1: Component gallery
├── css/
│   ├── style.css             # Global styles + glassmorphism
│   ├── audio-player.css      # Audio player styling
│   ├── video-player.css      # Video player styling
│   ├── animations.css        # Animation and camera styling
│   └── gallery.css           # Gallery styling
├── js/
│   ├── theme.js              # Dark/light mode toggle
│   ├── utils.js              # Shared utility functions
│   ├── audio-player.js       # Audio player + tone generator
│   ├── video-player.js       # Video player implementation
│   ├── camera.js             # Camera capture + filters
│   └── gallery.js            # Gallery component + search
├── assets/
│   ├── images/               # Responsive image formats (AVIF, WebP, JPEG)
│   ├── audio/                # Audio clip for player
│   └── video/                # Video clip for player
├── report.pdf                # Part D3: Technical report (1,500-3,000 words)
├── media-audit.pdf           # Part A2: DevTools audit snapshots
├── credits.txt               # Attribution for all external media
└── README.md                 # This file
```

## 🎯 Learning Outcomes Demonstrated

1. **HTML5 Media Integration** - Audio, video, and SVG elements
2. **Event-Driven Programming** - Complete HTMLMediaElement event lifecycle
3. **Web Audio API** - Oscillators, gain envelopes, frequency analysis
4. **Canvas API** - Image capture, pixel manipulation, filters
5. **Responsive Design** - CSS Grid, flexbox, mobile-first approach
6. **Component Architecture** - Pure functions, event delegation, data separation
7. **Glassmorphism UI** - Modern CSS effects with dark/light theme support
8. **Git Version Control** - Feature branches, meaningful commits

## 🚀 Key Features

### Part A: HTML5 Foundations
- ✓ Valid HTML5 with semantic markup
- ✓ `<picture>` element with AVIF/WebP/JPEG fallback chain
- ✓ Inline SVG with 10+ elements and accessibility attributes
- ✓ Google Fonts with fallback stack (Segoe UI, Helvetica, sans-serif)
- ✓ DevTools media audit with network analysis

### Part B: Temporal Media
- ✓ **Custom Audio Player:** Play/pause, seek bar, volume, mute, keyboard shortcuts
- ✓ **Audio Events:** loadstart, loadeddata, play, pause, timeupdate, waiting, ended, error
- ✓ **Web Audio API:** Oscillators (sine, square, sawtooth, triangle), gain envelopes, frequency analysis
- ✓ **ADSR Envelope:** Attack 10ms + Release 600ms for artifact-free synthesis
- ✓ **Custom Video Player:** Playback speed (0.75x-2x), fullscreen, transcript panel
- ✓ **Video Events:** play vs playing distinction, complete state tracking

### Part C: Animation & Interactivity
- ✓ **CSS Animations:** Loading spinner with @keyframes, hover transitions
- ✓ **SVG Draw Animation:** stroke-dasharray/dashoffset technique
- ✓ **Animated SVG:** Pulse, bounce, and opacity animations
- ✓ **Camera Capture:** Real-time MediaDevices API + canvas filters
- ✓ **Canvas Filters:** Greyscale (ITU-R BT.601), Sepia, Invert with pixel manipulation

### Part D: Component Architecture
- ✓ **8-Item Media Library:** Video, audio, and image assets
- ✓ **renderMediaCard():** Pure function component pattern
- ✓ **Responsive Grid:** CSS Grid auto-fill without media queries
- ✓ **Live Search:** Array.filter() + Array.map() pattern
- ✓ **Event Delegation:** Single listener on gallery with e.target.closest()
- ✓ **Navigation:** Consistent 5-page hub with active state tracking
- ✓ **Technical Report:** 1,500+ words with code evidence and references

## 🎨 Design System: Glassmorphism

The application uses modern glassmorphism effects with:
- **Backdrop blur:** 10px (normal), 20px (strong)
- **Transparency:** 70-80% opacity with rgba colors
- **Color Variables:** CSS custom properties for theming
- **Smooth Transitions:** 0.3s cubic-bezier timing function
- **Dark/Light Toggle:** Theme persistence via localStorage

### Color Palette
- **Primary:** #6366f1 (Indigo)
- **Secondary:** #8b5cf6 (Violet)
- **Accent:** #ec4899 (Pink)
- **Success:** #10b981 (Green)
- **Warning:** #f59e0b (Amber)
- **Danger:** #ef4444 (Red)

## 🔧 Technologies Used

### Frontend
- **HTML5** - Semantic markup, media elements, form elements
- **CSS3** - Flexbox, Grid, animations, transforms, backdrop-filter
- **JavaScript (ES6+)** - Classes, arrow functions, destructuring, template literals

### APIs
- **Web Audio API** - AudioContext, OscillatorNode, GainNode, AnalyserNode
- **Canvas API** - 2D context, getImageData, putImageData
- **MediaDevices API** - getUserMedia for real-time camera access
- **HTMLMediaElement** - Comprehensive audio/video control

### Development
- **Version Control** - Git with feature branches
- **Package Management** - npm / GitHub Pages deployment
- **Development Server** - Live Server (5 Server extension)

## 📊 Event Tracking

### Audio Player Events (8 events)
```
loadstart → loadeddata → [play → playing ↔ pause ↔ waiting] → ended
```

### Video Player Events (6 events)
```
play | playing | pause | waiting | ended | error
Key distinction: 'play' (request) vs 'playing' (actual playback)
```

## 🎵 Web Audio Architecture

```
[OscillatorNode] 
    ↓
[GainNode (ADSR Envelope)]
    ↓
[AnalyserNode] 
    ↓
[AudioContext.destination (speakers)]
```

**Envelope:** 10ms attack + 600ms release prevents audio clicking artifacts

## 🖼️ Image Format Selection

- **AVIF** - Primary (modern compression, ~50% smaller than JPEG)
- **WebP** - Secondary (better browser support, ~30% smaller than JPEG)
- **JPEG** - Fallback (universal support)
- **SVG** - Vector graphics (scalable, animated)
- **PNG** - Lossless (transparency support)

## ♿ Accessibility Features

- ✓ WCAG 2.1 Level AA compliance
- ✓ Semantic HTML headings hierarchy
- ✓ Alt text on all images
- ✓ ARIA labels on SVG elements
- ✓ Keyboard navigation throughout
- ✓ Focus visible states
- ✓ Color contrast ratio 4.5:1+
- ✓ Prefers-reduced-motion support

## 🚗 Performance Optimizations

- Responsive images with `<picture>` element
- Lazy loading on gallery images
- Debounced search input (300ms)
- Event delegation (single listener, 9+ cards)
- CSS animations on GPU (transform, opacity)
- Efficient array operations (filter + map)
- CSS custom properties for dynamic theming

## 📝 Git Practice

**Minimum 10 commits required:**
```bash
git log --oneline | head -20
√ Initial project setup
√ Add HTML5 landing page with picture element
√ Create audio player with Web Audio synthesizer
√ Implement custom video player with event tracking
√ Add CSS animations and SVG graphics
√ Build camera capture with canvas filters
√ Create component gallery with live search
√ Add responsive navigation and theme toggle
√ Write technical documentation
√ Final refinements and testing
```

**Feature Branch Example:**
```bash
git checkout -b feature/web-audio-synthesizer
# ... implement tone generator ...
git commit -m "feat: add Web Audio tone generator with ADSR envelope"
git push origin feature/web-audio-synthesizer
# Create Pull Request and merge
```

## 🧪 Testing Checklist

- [ ] All HTML pages validate with W3C Validator
- [ ] No console errors in Chrome DevTools
- [ ] Audio player: all 8 events fire correctly
- [ ] Video player: 'play' vs 'playing' distinction visible
- [ ] Web Audio: all 4 waveforms audible with smooth ramping
- [ ] Camera capture: 3 error types handled correctly
- [ ] Gallery search: real-time filtering functional
- [ ] Gallery grid: responsive across 480px, 768px, 1024px breakpoints
- [ ] All pages: dark/light theme toggle persists
- [ ] Keyboard shortcuts: Space, M, arrow keys functional on audio/video
- [ ] Lighthouse score: Performance >90, Accessibility >90

## 📚 References

All implementations follow these course references:

- **Teaching Notes Week 1:** Digital media representations, non-temporal vs temporal media
- **Teaching Notes Week 2:** Image formats, raster vs vector, accessibility
- **Teaching Notes Week 3:** HTML5 Media State Machine, event-driven programming
- **Teaching Notes Week 5:** Web Audio API architecture, ADSR envelope
- **Teaching Notes Week 6:** Canvas API, MediaDevices, pixel manipulation
- **Teaching Notes Week 7:** Component architecture, event delegation

- **Lab Guide Week 1-7:** Complete working examples

- **MDN Web Docs:**
  - HTMLMediaElement: https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement
  - Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
  - Canvas API: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
  - MediaDevices: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia

## 📄 Attribution & Licensing

All external resources are listed in `credits.txt` with source URLs and CC0/CC BY licenses.

## 💡 Learning Reflections

This project provided hands-on experience with:
- Building temporal media players with complete event handling
- Real-time audio synthesis and frequency visualization
- Canvas-based image processing and pixel manipulation
- Component-based architecture patterns that scale
- Modern CSS layout techniques (Grid, Flexbox, backdrop-filter)
- Responsive design without media queries where possible
- Accessibility as a core feature, not an afterthought

The component pattern implemented here (pure functions + data separation) directly parallels React and Vue.js systems, providing a foundation for professional frontend development.

---

**Submission Date:** Friday, End of Week 8 (Before CAT 2 Examination)  
**Repository URL:** https://github.com/Kihuga-Ray/INF-424-Multimedia-programming  
**GitHub Pages URL:** https://kihuga-ray.github.io/INF-424-Multimedia-programming/
