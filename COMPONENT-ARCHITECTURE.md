# Component Architecture & Design Patterns

## Introduction

EduStream demonstrates modern web architecture through component-based design. This guide explains the architectural decisions, design patterns used, and how the component approach scales to frameworks like React and Vue.js.

## Component Hierarchy

```
RootComponent (Window/Document)
├── Navigation (Shared across all pages)
├── PageComponent
│   ├── Header Section
│   ├── Main Content
│   └── Footer
└── Theme Manager (Global state)
```

### Page Structure

**index.html (Landing):**
- Hero component
- Features grid component
- Navigation component

**audio-player.html:**
- Audio player component
- Tone generator component
- Visualizer component
- Navigation component

**video-player.html:**
- Video player component
- Controls component
- Info panel component
- Navigation component

**animations.html:**
- Loading spinner component
- Animation card component
- SVG animation component
- Camera capture component
- Navigation component

**gallery.html:**
- Search input component
- Media gallery component (renderMediaCard × N)
- Navigation component

## Component Patterns

### 1. Pure Function Components

**renderMediaCard(item) Pattern:**

Function Signature:
```javascript
function renderMediaCard(item) {
  // Input: Object with {id, title, type, thumbnail, description, duration}
  // Output: HTML string
  // Side Effects: None
  // Pure: Always same output for same input
}
```

**Implementation:**
```javascript
function renderMediaCard(item) {
  const durationText = item.duration ? 
    `<span class="media-duration">${getFormattedDuration(item.duration)}</span>` : 
    '';
  
  return `
    <article class="media-card" data-id="${item.id}" data-type="${item.type}" data-title="${item.title}">
      <img src="${item.thumbnail}" alt="${item.title}" class="media-thumbnail">
      <div class="media-content">
        <h3 class="media-title">${item.title}</h3>
        <p class="media-description">${item.description}</p>
        <span class="media-badge badge-${item.type}">${item.type}</span>
        ${durationText}
      </div>
    </article>
  `;
}
```

**Usage:**
```javascript
const mediaItems = [
  { id: '001', title: 'Big Buck Bunny', type: 'video', duration: 596, ... },
  { id: '002', title: 'Forest Sounds', type: 'audio', duration: 180, ... },
];

const html = mediaItems.map(renderMediaCard).join('');
gallery.innerHTML = html;
```

**Advantages:**
- ✓ Reusable across multiple pages
- ✓ Testable (no side effects)
- ✓ Composable (pipeline: filter → map → join)
- ✓ Data-driven (single source of truth)

**Disadvantages:**
- ✗ No internal state
- ✗ No lifecycle hooks
- ✗ String concatenation less type-safe than JSX

### 2. Class-Based Components

**AudioPlayer Class Pattern:**

```javascript
class AudioPlayer {
  constructor(audioElementId) {
    this.audio = document.getElementById(audioElementId);
    this.status = null;
    this.attachEventListeners();
  }

  attachEventListeners() {
    this.audio.addEventListener('play', () => this.onPlay());
    this.audio.addEventListener('pause', () => this.onPause());
    // ... 6 more events
  }

  onPlay() {
    this.updateStatus('Playing');
    this.updateUI();
  }

  updateStatus(status) {
    this.status = status;
    this.renderStatus();
  }

  renderStatus() {
    const statusEl = document.querySelector('.player-status');
    if (statusEl) statusEl.textContent = this.status;
  }
}
```

**Advantages:**
- ✓ Encapsulation (state inside class)
- ✓ Lifecycle management (constructor/methods)
- ✓ Event delegation pattern
- ✓ Instance isolation (multiple players work independently)

**Disadvantages:**
- ✗ More boilerplate than functions
- ✗ `this` binding complexity
- ✗ Memory overhead per instance

### 3. Event Delegation Pattern

**Without Delegation (Inefficient):**
```javascript
const gallery = document.querySelector('.gallery');
const cards = gallery.querySelectorAll('.media-card');

// Individual listeners for 9 items
cards.forEach(card => {
  card.addEventListener('click', (e) => {
    console.log('Clicked:', e.currentTarget.dataset.id);
  });
});
// Memory: 9 listeners allocated
// Problem: New cards added later won't have listeners
```

**With Delegation (Efficient):**
```javascript
const gallery = document.querySelector('.gallery');

// Single listener for entire gallery
gallery.addEventListener('click', (e) => {
  const card = e.target.closest('.media-card');
  if (card) {
    console.log('Clicked:', card.dataset.id);
  }
});
// Memory: 1 listener allocated
// Benefit: New cards automatically work
// Benefit: e.target.closest() safely matches nested elements
```

**When to Use:**
- ✓ Many similar elements (gallery with 9+ cards)
- ✓ Dynamic content (elements added/removed)
- ✗ Single elements (create individual listeners)
- ✗ Different event behaviors per element (individual listeners cleaner)

### 4. State Management Pattern

**Theme Manager (Centralized State):**

```javascript
class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('edustream-theme') || 'light';
    this.listeners = [];
    this.init();
  }

  init() {
    this.setTheme(this.currentTheme);
    this.setupToggleButton();
  }

  setTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('edustream-theme', theme);
    this.notifyListeners(theme);
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  onThemeChange(callback) {
    this.listeners.push(callback);
  }

  notifyListeners(theme) {
    this.listeners.forEach(callback => callback(theme));
  }
}

// Global instance
const themeManager = new ThemeManager();

// Subscribe to theme changes
themeManager.onThemeChange((theme) => {
  console.log('Theme changed to:', theme);
});
```

**State Flow:**
```
User clicks toggle
    ↓
toggleTheme() called
    ↓
currentTheme updated
    ↓
DOM attribute set (data-theme)
    ↓
localStorage persisted
    ↓
CSS updates (via [data-theme] selector)
    ↓
Listeners notified
```

**Advantages:**
- ✓ Single source of truth (one class manages theme)
- ✓ Persistence (localStorage)
- ✓ Notification system (subscribers)
- ✓ Reactive (changes cascade)

## Data Processing Pipelines

### Gallery Search Pipeline

**Step 1: Filter**
```javascript
const query = 'video';
const filtered = mediaLibrary.filter(item => {
  return item.title.toLowerCase().includes(query) ||
         item.description.toLowerCase().includes(query) ||
         item.type.toLowerCase().includes(query);
});
```

**Step 2: Map**
```javascript
const html = filtered.map(item => {
  return renderMediaCard(item);
});
```

**Step 3: Join**
```javascript
const result = html.join('');
```

**Combined Pipeline:**
```javascript
gallery.innerHTML = mediaLibrary
  .filter(item => 
    item.title.toLowerCase().includes(query) ||
    item.description.toLowerCase().includes(query) ||
    item.type.toLowerCase().includes(query)
  )
  .map(renderMediaCard)
  .join('');
```

**Benefits:**
- Clear data transformation steps
- Functional approach (no mutations)
- Easy to add/remove steps
- Example: Add `.slice(0, 5)` to limit results

## Comparison: Component vs Hardcoded

### Hardcoded Approach (❌ Not Recommended)
```html
<div class="gallery">
  <article class="media-card" data-id="001">
    <img src="thumbnail1.jpg">
    <h3>Big Buck Bunny</h3>
    <p>3D animation test video</p>
    <span class="media-badge badge-video">video</span>
    <span class="media-duration">9:56</span>
  </article>
  <article class="media-card" data-id="002">
    <img src="thumbnail2.jpg">
    <h3>Forest Sounds</h3>
    <p>Ambient forest background</p>
    <span class="media-badge badge-audio">audio</span>
    <span class="media-duration">3:00</span>
  </article>
  <!-- ... 7 more cards hardcoded -->
</div>
```

**Problems:**
- ✗ Change card layout → Edit HTML 9 times
- ✗ Add description field → Update every card
- ✗ Add new card → Duplicate code
- ✗ Bug fix → Apply to each card individually
- ✗ Not maintainable at scale

### Component Approach (✅ Recommended)
```javascript
const mediaLibrary = [
  { id: '001', title: 'Big Buck Bunny', type: 'video', duration: 596, ... },
  { id: '002', title: 'Forest Sounds', type: 'audio', duration: 180, ... },
  // ... 7 more items
];

const html = mediaLibrary.map(renderMediaCard).join('');
gallery.innerHTML = html;
```

**Benefits:**
- ✓ Change layout → Update renderMediaCard() once
- ✓ Add field → Update function and data
- ✓ Add card → Add item to mediaLibrary array
- ✓ Bug fix → Fix in one place
- ✓ Testable and maintainable

## Scaling: From Vanilla Components to React

### Vanilla JavaScript Component
```javascript
function renderMediaCard(item) {
  return `<article class="media-card">...</article>`;
}

gallery.innerHTML = mediaLibrary.map(renderMediaCard).join('');
```

### React Component (Equivalent)
```javascript
function MediaCard({item}) {
  return (
    <article className="media-card" data-id={item.id}>
      <img src={item.thumbnail} alt={item.title} />
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      <span className={`media-badge badge-${item.type}`}>{item.type}</span>
    </article>
  );
}

function Gallery() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filtered = mediaLibrary.filter(item =>
    item.title.toLowerCase().includes(searchQuery)
  );

  return (
    <div className="gallery">
      <input 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {filtered.map(item => <MediaCard key={item.id} item={item} />)}
    </div>
  );
}
```

**Differences:**
- React uses JSX (syntax sugar for createElement calls)
- React manages virtual DOM (diffing algorithm)
- React handles reactivity (state changes trigger re-render)
- Pattern is identical (map array → render component)

### Reactivity Comparison

**Vanilla: Manual DOM Updates**
```javascript
const input = document.querySelector('.search-input');
input.addEventListener('input', (e) => {
  const filtered = mediaLibrary.filter(item => 
    item.title.includes(e.target.value)
  );
  gallery.innerHTML = filtered.map(renderMediaCard).join('');
});
```

**React: Automatic Updates**
```javascript
const [query, setQuery] = useState('');

useEffect(() => {
  // Runs whenever query changes
  console.log('Query changed:', query);
}, [query]);

// JSX handles re-render automatically
return <Gallery query={query} />;
```

## Architecture Best Practices

### ✓ Do's
1. **Keep components small** - Single responsibility principle
2. **Use pure functions** - Predictable and testable
3. **Separate data from presentation** - Decoupled logic
4. **Use event delegation** - Reduces memory footprint
5. **Centralize state** - Single source of truth
6. **Document data structures** - MediaCard interface clear

### ✗ Don'ts
1. **Avoid global state** - Use modules/classes instead
2. **Don't hardcode content** - Use data-driven approach
3. **Avoid deep nesting** - Limits composability
4. **Don't mutate state directly** - Use setters/methods
5. **Avoid tight coupling** - Components should be independent

## File Organization

```
RayINF424/
├── index.html                 # Landing page
├── audio-player.html          # Audio component demo
├── video-player.html          # Video component demo
├── animations.html            # Animation component demo
├── gallery.html               # Gallery component demo
│
├── css/
│   ├── style.css              # Global styles
│   ├── audio-player.css       # Audio player styles
│   ├── video-player.css       # Video player styles
│   ├── animations.css         # Animation styles
│   └── gallery.css            # Gallery styles
│
├── js/
│   ├── theme.js               # Theme manager (state)
│   ├── utils.js               # Utility functions
│   ├── audio-player.js        # AudioPlayer class
│   ├── video-player.js        # VideoPlayer class
│   ├── camera.js              # CameraCapture class
│   └── gallery.js             # MediaGallery class
│
└── docs/
    ├── README.md
    ├── IMPLEMENTATION.md
    ├── TESTING.md
    ├── WEB-AUDIO-GUIDE.md
    ├── CANVAS-API-GUIDE.md
    ├── CSS-ARCHITECTURE.md
    ├── DEPLOYMENT-GUIDE.md
    └── COMPONENT-ARCHITECTURE.md
```

## Coupling & Cohesion Analysis

### Low Coupling (✓ Good)
- AudioPlayer doesn't know about VideoPlayer
- Theme manager doesn't require specific UI structure
- renderMediaCard doesn't depend on gallery state
- Each component can be used independently

### High Cohesion (✓ Good)
- AudioPlayer contains all audio-related functionality
- VideoPlayer handles all video player logic
- Gallery organizes all media-related code
- theme.js exclusively handles themes

### Result
- Components can be moved/reused without breaking others
- Testing individual components is straightforward
- Adding new features doesn't require refactoring existing code

## References

- Design Patterns: https://refactoring.guru/design-patterns
- Component-Based Architecture: https://www.freecodecamp.org/news/component-based-architecture/
- React Architecture: https://react.dev/learn/thinking-in-react
- Vanilla Component Patterns: https://gomakethings.com/component-based-javascript-patterns/
- Event Delegation: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#event_delegation
