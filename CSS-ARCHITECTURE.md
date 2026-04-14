# CSS Architecture & Glassmorphism Design Guide

## Overview

EduStream uses a modern CSS architecture featuring glassmorphism effects, CSS Grid for responsive layouts, and CSS custom properties for theme management. This guide explains the design system and implementation patterns.

## Design Philosophy

### Glassmorphism
Glassmorphism is a modern design aesthetic that combines:
- **Translucency:** Semi-transparent backgrounds (rgba with 30-50% opacity)
- **Blur Effect:** CSS `backdrop-filter: blur()` creates frosted glass appearance
- **Depth:** Layered elements with subtle shadows suggest depth
- **Frosted Glass:** All elements appear to sit on a blurred backdrop

Benefits:
- Modern, premium aesthetic
- Improves visual hierarchy through layering
- Works on images and gradients
- Reduces visual "flatness" of plain backgrounds

Limitations:
- Requires modern browsers (Safari 9+, Chrome 76+, Firefox 103+)
- Performance impact on low-end devices
- Mobile browsers may struggle with complex filter combinations
- Fallback needed for older browsers

### Dark/Light Theme System
EduStream supports both dark and light themes:
- **Light Mode:** White backgrounds, dark text, pastel accents
- **Dark Mode:** Dark backgrounds, light text, vibrant accents
- **Persistence:** Theme preference saved to localStorage
- **Smooth Transition:** CSS transitions animate color changes

## CSS Custom Properties (Variables)

### Color System

**Global Colors (Always Available):**
```css
:root {
  /* Backgrounds */
  --bg-primary: #f8f9fa;
  --bg-secondary: #e9ecef;
  --bg-tertiary: #dee2e6;
  
  /* Text Colors */
  --text-primary: #1a1d23;
  --text-secondary: #495057;
  --text-tertiary: #6c757d;
  
  /* Accent Colors */
  --primary-color: #6366f1;      /* Indigo */
  --secondary-color: #a855f7;    /* Violet */
  --tertiary-color: #ec4899;     /* Pink */
  --success-color: #10b981;      /* Green */
  --warning-color: #f59e0b;      /* Amber */
  --danger-color: #ef4444;       /* Red */
  
  /* Glass Effect */
  --glass-bg: rgba(255, 255, 255, 0.25);
  --glass-backdrop: blur(10px);
  --glass-border: 1px solid rgba(255, 255, 255, 0.2);
}
```

**Dark Mode Overrides:**
```css
[data-theme="dark"] {
  --bg-primary: #1a1d23;
  --bg-secondary: #2d3139;
  --bg-tertiary: #3d424e;
  
  --text-primary: #f8f9fa;
  --text-secondary: #e9ecef;
  --text-tertiary: #b0b3ba;
  
  --glass-bg: rgba(30, 30, 40, 0.4);
  --glass-border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### Spacing Scale
```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */
```

### Typography Scale
```css
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-md: 1rem;       /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */
--font-size-3xl: 1.875rem;  /* 30px */
--font-size-4xl: 2.25rem;   /* 36px */

--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

## Responsive Design

### Mobile-First Breakpoints
```css
/* Mobile: 0px - 479px (default/no media query) */
.gallery { display: grid; grid-template-columns: 1fr; }

/* Tablet: 480px and up */
@media (min-width: 480px) {
  .gallery { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
}

/* Laptop: 768px and up */
@media (min-width: 768px) {
  .gallery { grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
}

/* Desktop: 1024px and up */
@media (min-width: 1024px) {
  .gallery { grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); }
}
```

### CSS Grid: Auto-Fill vs Auto-Fit

**auto-fill:** Creates implicit tracks for ghost cells
```css
grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
/* If 3 items fit in 900px container, creates 4th empty track */
```

**auto-fit:** Collapses empty tracks
```css
grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
/* Last item stretches to fill available space if only 1 item in last row */
```

For EduStream gallery: Use `auto-fill` to maintain consistent item sizing.

## Component Stylesheets

### Global Styles (style.css)
- **Lines 1-50:** CSS custom properties initialization
- **Lines 51-150:** Base element styles (html, body, typography)
- **Lines 151-250:** Layout utilities (container, grid, flexbox)
- **Lines 251-350:** Glassmorphism classes (.glass, .glass-card, .glass-input)
- **Lines 351-450:** Button variants (.btn, .btn-secondary, .btn-outline)
- **Lines 451-550:** Navigation bar (sticky positioning, active state)
- **Lines 551-650:** Form elements (input, textarea, select, label)
- **Lines 651-750:** Utility classes (spacing, text, colors)
- **Lines 751-850:** Animations (@keyframes spin, fadeIn, slideIn, bounce)
- **Lines 851-950:** Responsive utilities and breakpoints
- **Lines 951-2000:** Dark theme overrides and transitions

### Component-Specific Stylesheets

**audio-player.css (~150 lines):**
- `.player` container with glassmorphism
- `.player-controls` flexbox layout
- `.progress-bar` with ::before pseudo-element for track
- `.visualizer-canvas` positioning and sizing
- `.tone-grid` CSS Grid for note buttons
- `.tone-btn` individual note button styling with active state

**video-player.css (~180 lines):**
- `.video-wrapper` with aspect ratio padding-bottom trick (56.25% for 16:9)
- `.video-container` flex layout
- `.video-player` embedded video element
- `.player-controls` button layout and spacing
- `.player-info` grid layout for metadata
- `.transcript-panel` scrollable text area with glassmorphism
- Responsive adjustments for mobile

**animations.css (~280 lines):**
- `.spinner` loading animation with @keyframes spin
- `.spinner::before` rotates infinitely
- `.animation-cards` container with grid layout
- `.animation-card:hover` transform (translateY, scale) with transition
- `.svg-container` for 20x20 SVG previews
- `.svg-draw` stroke-dasharray/dashoffset animation
- `.camera-section` two-column layout (video + canvas)
- `.camera-controls` button grid

**gallery.css (~280 lines):**
- `.gallery` CSS Grid with auto-fill and minmax
- `.media-card` glassmorphic card with hover effects
- `.media-card:hover { transform: translateY(-8px); }` for lift effect
- `.media-thumbnail` responsive image with object-fit
- `.media-badge` color-coded labels (video=blue, audio=green, image=amber)
- `.media-title` and `.media-description` typography
- `.media-duration` positioned with position: absolute
- `.search-input` glassmorphic input with focus states
- `.loading-spinner` for gallery async operations

## Animation Library

### Keyframe Definitions

**Spin (Loading):**
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.spinner { animation: spin 1s linear infinite; }
```

**Fade In:**
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.fade-enter { animation: fadeIn 0.3s ease-in; }
```

**Slide In (Left):**
```css
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
.slide-enter { animation: slideInLeft 0.3s ease-out; }
```

**Bounce:**
```css
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.bounce { animation: bounce 1s ease-in-out infinite; }
```

**Pulse:**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.pulse { animation: pulse 2s ease-in-out infinite; }
```

## Glassmorphism Implementation

### Basic Glass Card
```css
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop);
  -webkit-backdrop-filter: var(--glass-backdrop);  /* Safari support */
  border: var(--glass-border);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

### Advanced Glass with Color
```css
.glass-primary {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  backdrop-filter: blur(10px) saturate(200%);
  border: 1px solid rgba(99, 102, 241, 0.2);
}

[data-theme="dark"] .glass-primary {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2));
  border: 1px solid rgba(99, 102, 241, 0.3);
}
```

### Glass Input
```css
.glass-input {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop);
  border: var(--glass-border);
  color: var(--text-primary);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.glass-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
```

## Performance Optimization

### Reducing Repaints
- Use `transform` and `opacity` for animations (GPU-accelerated)
- Avoid animating `top`, `left`, `width`, `height` (causes layout recalculations)
- Use `will-change: transform;` for frequently animated elements

### CSS Containment
```css
.gallery-item {
  contain: layout style paint;  /* Isolates layout calculations */
}
```

### Backdrop Filter Performance
```css
/* Heavy backdrop-filter on large elements */
.gallery-item:hover {
  backdrop-filter: blur(20px);  /* Expensive operation */
}

/* Better: Blur only small portions */
.gallery-item::before {
  backdrop-filter: blur(20px);
  width: 100px;  /* Blurred area limited */
}
```

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| CSS Grid | 57+ | 52+ | 10.1+ | 16+ |
| CSS Custom Properties | 49+ | 31+ | 9.1+ | 15+ |
| Backdrop Filter | 76+ | 103+ | 9+ | 17+ |
| @supports | 28+ | 22+ | 9+ | 12+ |
| backdrop-filter (webkit) | 18+ | via flag | 9+ | 15+ |

### Fallback Strategy
```css
/* Fallback for browsers without backdrop-filter */
.glass-card {
  background: rgba(255, 255, 255, 0.8);
}

/* Override if supported */
@supports (backdrop-filter: blur(10px)) {
  .glass-card {
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(10px);
  }
}
```

## Best Practices

### 1. Use CSS Variables for Theme
✓ **Good:** `color: var(--text-primary);`
✗ **Bad:** `color: #1a1d23;`

### 2. Mobile-First Media Queries
✓ **Good:** Base styles for mobile, `@media (min-width: 768px)` for desktop
✗ **Bad:** Desktop styles first, `@media (max-width: 768px)` for mobile

### 3. Semantic Class Names
✓ **Good:** `.media-card`, `.gallery-search`, `.player-controls`
✗ **Bad:** `.card1`, `.search-box`, `.div-controls`

### 4. Avoid Deep Nesting (SCSS/LESS)
✓ **Good:** 2-3 levels max
✗ **Bad:** `.gallery { .section { .item { .text {} } } }`

### 5. Reuse Animation Classes
✓ **Good:** `.fade-enter` applied to multiple elements
✗ **Bad:** Unique animation for each element

## Future Enhancements

1. **CSS Containment:** Reduce layout recalculations for large galleries
2. **Aspect-Ratio:** Use CSS aspect-ratio instead of padding-bottom hack
3. **Container Queries:** Responsive components based on parent size
4. **View Transitions API:** Smooth page transitions (Stage 2 spec)
5. **CSS Scroll Snap:** Snap to sections while scrolling

## References

- CSS Grid: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout
- Custom Properties: https://developer.mozilla.org/en-US/docs/Web/CSS/--*
- Backdrop Filter: https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter
- Glassmorphism Design: https://uxdesign.cc/glassmorphism-in-user-interfaces-glazed-effect-with-css-glass-effect-guide-part-1-b96e0bcd77ab
- CSS Animations: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations
