# Accessibility & Performance Optimization Guide

## Introduction

Accessibility and performance are core requirements of modern web applications. EduStream prioritizes both to ensure the application is usable by everyone and performs smoothly on all devices.

## Web Accessibility (A11Y)

### Semantic HTML

**Good: Semantic Structure**
```html
<header>
  <nav role="navigation">
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/about">About</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h1>Title</h1>
    <p>Content...</p>
  </article>
</main>

<footer>
  <p>© 2024</p>
</footer>
```

**Bad: Non-Semantic Structure**
```html
<div class="header">
  <div class="nav">
    <div>
      <div><a href="/">Home</a></div>
      <div><a href="/about">About</a></div>
    </div>
  </div>
</div>

<div class="content">
  <div class="article">
    <div class="title">Title</div>
    <div class="paragraph">Content...</div>
  </div>
</div>

<div class="footer">
  <div>© 2024</div>
</div>
```

**Why It Matters:**
- Screen readers understand document structure
- Keyboard navigation works properly
- Search engines better understand content
- Developer intent is clear

### Image Accessibility

**Good: Descriptive Alt Text**
```html
<!-- Clear description of image content -->
<img 
  src="forest.jpg" 
  alt="Dense green forest with sunlight filtering through tall trees" 
  width="800" 
  height="600"
>

<!-- Icon with hidden text if needed -->
<button aria-label="Play audio">
  <span class="material-icons">play_arrow</span>
</button>

<!-- Complex image with extended description -->
<figure>
  <img src="flowchart.png" alt="System architecture diagram">
  <figcaption>Architecture showing three layers: UI, API, Database</figcaption>
</figure>
```

**Bad: Missing or Vague Alt Text**
```html
<!-- No alt text -->
<img src="forest.jpg">

<!-- Useless alt text -->
<img src="forest.jpg" alt="image">

<!-- Alt text that repeats filename -->
<img src="forest.jpg" alt="forest.jpg">

<!-- Alt text only in visible caption -->
<img src="diagram.png">
<p>This is a diagram</p>
```

**Alt Text Guidelines:**
- Describe CONTENT not PRESENCE ("Mountain landscape" not "Picture of mountain")
- Keep under 125 characters
- Don't start with "Image of..." or "Picture of..."
- For complex images, provide extended description in caption
- For decorative images, use empty alt="" (don't omit)

### Color Contrast

**WCAG Standard: Text Contrast Ratio**
- **AA (minimum):** 4.5:1 for normal text, 3:1 for large text
- **AAA (enhanced):** 7:1 for normal text, 4.5:1 for large text

**Example: Good Contrast**
```css
/* Dark text on light background */
.light-mode {
  color: #1a1d23;        /* Very dark gray (100:1 ratio with white) */
  background: #ffffff;   /* White */
  /* Ratio: ~20:1 - Excellent ✓ */
}

/* Light text on dark background */
.dark-mode {
  color: #f8f9fa;       /* Very light gray */
  background: #1a1d23;  /* Very dark gray */
  /* Ratio: ~20:1 - Excellent ✓ */
}
```

**Example: Poor Contrast**
```css
/* Very difficult to read */
.poor-contrast {
  color: #888888;       /* Medium gray */
  background: #aaaaaa;  /* Light gray */
  /* Ratio: ~1.4:1 - Too low ✗ */
}
```

**Testing Contrast:**
- Chrome DevTools: DevTools → Inspect → Accessibility → Contrast ratio
- Online: https://webaim.org/resources/contrastchecker/

### Keyboard Navigation

**Good: Keyboard Support**
```html
<!-- Tab order preserved -->
<button id="play">Play</button>
<button id="pause">Pause</button>
<input type="range" id="volume">

<!-- Keyboard event handling -->
<script>
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();  // Prevent page scroll
      togglePlayPause();
    }
    if (e.code === 'ArrowLeft') {
      seekBackward();
    }
  });
</script>
```

**Bad: No Keyboard Support**
```html
<!-- No tab navigation -->
<div class="play-button" onclick="play()">Play</div>

<!-- No keyboard shortcuts -->
<input type="range" id="volume">
<!-- Can't adjust with keyboard if range not focused -->
```

**Keyboard A11Y Checklist:**
- ✓ All interactive elements reachable via Tab key
- ✓ Tab order logical (left-to-right, top-to-bottom)
- ✓ Focus indication visible (default or custom)
- ✓ Can dismiss modals with Escape
- ✓ Can complete tasks without mouse
- ✓ Unintended scrolling prevented

### ARIA Attributes

**Accessible Rich Internet Applications (ARIA):**

```html
<!-- Describe button purpose -->
<button aria-label="Toggle theme">🌙</button>

<!-- State indication -->
<button aria-pressed="false" onclick="toggleTheme()">
  Dark Mode
</button>

<!-- Indicate busy state -->
<div aria-busy="true" aria-label="Loading gallery...">
  <span class="spinner"></span>
</div>

<!-- Describe complex relationships -->
<div role="region" aria-labelledby="instructions">
  <h2 id="instructions">Camera Controls</h2>
  <p>Press start to enable camera...</p>
</div>

<!-- Hide decorative elements from screen readers -->
<span class="material-icons" aria-hidden="true">settings</span>
```

**Common ARIA Roles:**
- `role="button"` - For clickable non-button elements
- `role="navigation"` - For nav sections
- `role="main"` - For main content area
- `role="status"` - For status messages
- `role="alert"` - For alerts/errors
- `role="dialog"` - For modal dialogs

### Reduced Motion Support

**Good: Respects Prefers-Reduced-Motion**
```css
/* Animation enabled by default */
.card {
  transition: transform 0.3s ease;
  animation: fadeIn 0.5s ease;
}

/* Disable for users with motion sensitivity */
@media (prefers-reduced-motion: reduce) {
  .card,
  .card * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**JavaScript:**
```javascript
// Check if user prefers reduced motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  // Enable animations
  element.classList.add('animate');
} else {
  // Animations disabled
  element.style.animation = 'none';
}
```

## Performance Optimization

### Core Web Vitals

**Metric Targets:**
1. **Largest Contentful Paint (LCP):** < 2.5 seconds
2. **First Input Delay (FID):** < 100 milliseconds
3. **Cumulative Layout Shift (CLS):** < 0.1

**Measuring:**
```javascript
// Chrome DevTools Performance tab
// Lighthouse tab (embedded or standalone)
// https://pagespeed.web.dev/

// JavaScript API
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('LCP:', entry.renderTime || entry.loadTime);
  }
});
observer.observe({entryTypes: ['largest-contentful-paint']});
```

### Image Optimization

**Responsive Images Using Picture Element**
```html
<!-- Serve different formats to different browsers -->
<picture>
  <source srcset="hero.avif" type="image/avif">
  <source srcset="hero.webp" type="image/webp">
  <img src="hero.jpg" alt="Hero image">
</picture>

<!-- Responsive sizing -->
<img 
  srcset="small.jpg 480w, medium.jpg 768w, large.jpg 1200w"
  sizes="(max-width: 600px) 480px, (max-width: 1000px) 768px, 1200px"
  src="large.jpg"
  alt="Responsive image"
>
```

**Format Comparison:**
| Format | Lossy | Transparent | Browser Support | Size (typical) |
|--------|-------|-------------|-----------------|----------------|
| JPEG   | Yes   | No          | All             | 100% (baseline) |
| PNG    | No    | Yes         | All             | 120-200% |
| WebP   | Yes   | Yes         | Modern (90%)    | 70-90% of JPEG |
| AVIF   | Yes   | Yes         | Very Modern     | 50-70% of JPEG |

### CSS Optimization

**Good: Efficient Selectors**
```css
/* Specific (fast) */
.gallery .media-card { }
#player .play-button { }

/* More efficient (avoids universal selector) */
.button { }  /* Not *[role="button"] */

/* CSS Grid (no layout recalc) */
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  /* Items size automatically, no breakpoints needed */
}
```

**Bad: Inefficient Selectors**
```css
/* Universal selector (slow) */
* { color: inherit; }

/* Overly specific */
body > main > div > article > p { }

/* Many levels of nesting */
.container .section .item .card .content .text { }
```

### JavaScript Optimization

**Good: Efficient DOM Updates**
```javascript
// Batch DOM updates (single reflow)
const fragment = document.createDocumentFragment();
items.forEach(item => {
  const card = document.createElement('article');
  card.innerHTML = renderMediaCard(item);
  fragment.appendChild(card);
});
gallery.appendChild(fragment);
// One reflow instead of N reflows
```

**Bad: Inefficient DOM Updates**
```javascript
// N reflows (one per appendChild)
items.forEach(item => {
  const card = document.createElement('article');
  card.innerHTML = renderMediaCard(item);
  gallery.appendChild(card);  // Reflow triggered N times
});
```

**Good: Debounced Event Handlers**
```javascript
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Only called once after 300ms of inactivity
const handleSearch = debounce((query) => {
  filterGallery(query);
}, 300);

searchInput.addEventListener('input', (e) => {
  handleSearch(e.target.value);
});
```

**Without Debounce:** 100 search calls per second
**With Debounce:** 1 search call every 300ms

### Network Optimization

**Good: Minimize Requests**
```html
<!-- Use CSS instead of image for simple shapes -->
<style>
  .spinner {
    border: 3px solid rgba(0,0,0,0.1);
    border-top-color: #333;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
</style>

<!-- Use async/defer for scripts -->
<script src="app.js" defer></script>  <!-- Load after DOM parsing -->
```

**Bad: Excessive Requests**
```html
<!-- Separate request for each image -->
<img src="icon-home.png">
<img src="icon-settings.png">
<img src="icon-menu.png">
<!-- Use sprite sheet or SVG instead -->

<!-- Synchronous scripts block parsing -->
<script src="vendor.js"></script>
<script src="app.js"></script>
```

### Caching Strategies

**HTTP Headers:**
```
# Cache static assets for 1 year
Cache-Control: max-age=31536000, immutable

# Cache HTML for 1 hour
Cache-Control: max-age=3600, must-revalidate

# Don't cache
Cache-Control: no-cache, no-store, must-revalidate
```

**Service Worker (Client-Side Cache):**
```javascript
// Cache API strategy: Cache first, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => caches.match('/offline.html'))
  );
});
```

## Lighthouse Audit

**Lighthouse Scores:**
- **Performance:** Technical metrics (LCP, FID, CLS)
- **Accessibility:** A11Y practices (alt text, contrast, etc.)
- **Best Practices:** Security and modern standards
- **SEO:** Search engine optimization
- **PWA:** Progressive Web App requirements

**Scoring:**
- 90-100: Green ✓ Good
- 50-89: Orange ⚠ Needs improvement
- 0-49: Red ✗ Poor

**How to Use:**
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Select categories to audit
4. Click "Analyze page load"
5. Review suggestions

## EduStream A11Y Status

### ✓ Implemented
- Semantic HTML (header, nav, main, footer, article)
- Descriptive alt text for all images and SVG
- High contrast colors (dark 20:1, light 20:1)
- Full keyboard navigation (Tab, Space, Arrow keys)
- Dark/light theme support
- Focus indicators visible on all interactive elements
- Accessible form labels and inputs
- Proper heading hierarchy (h1 > h2 > h3)

### 🔄 Should Be Added
- ARIA landmarks for complex regions
- Error messages with aria-label
- Loading states with aria-busy
- Prefers-reduced-motion support for animations
- Form validation feedback
- Skip navigation link
- Transcripts for audio content

### 📊 Performance Targets
- Lighthouse Performance: > 90
- Lighthouse Accessibility: > 95
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1

## References

- W3C WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- MDN Accessibility: https://developer.mozilla.org/en-US/docs/Web/Accessibility
- Core Web Vitals: https://web.dev/vitals/
- Lighthouse: https://developers.google.com/web/tools/lighthouse
- Images Best Practices: https://web.dev/image-optimization/
- Prefers-Reduced-Motion: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
