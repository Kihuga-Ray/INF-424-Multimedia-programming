/**
 * Component-Based Media Gallery
 * Part D1 - Pure Function Component Pattern
 */

/**
 * Pure function to render a single media card
 * @param {Object} item - Media item data
 * @returns {string} HTML string for the card
 */
function renderMediaCard(item) {
  const durationHtml = item.duration ? `
    <div class="media-card__duration">
      <span>${getFormattedDuration(item.duration)}</span>
    </div>
  ` : '';

  const badgeClass = `badge-${item.type}`;
  const buttonText = item.type === 'image' ? '🖼 View' : '▶ Play';
  const buttonClass = item.type === 'image' ? 'btn-secondary' : 'btn';

  return `
    <div class="media-card glass-card" data-id="${item.id}" data-type="${item.type}" data-title="${item.title}">
      <div class="media-card__thumbnail">
        <img 
          src="${item.thumbnail}" 
          alt="${item.title}" 
          width="260" 
          height="150"
          loading="lazy"
        />
        ${durationHtml}
      </div>
      
      <div class="media-card__content">
        <h3 class="media-card__title">${item.title}</h3>
        
        <p class="media-card__description">${item.description}</p>
        
        <div class="media-card__footer">
          <span class="badge ${badgeClass}">${item.type}</span>
          <button class="btn btn-small" data-action="play-media">
            ${buttonText}
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Media Gallery Manager
 */
class MediaGallery {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.gallery = this.container.querySelector('[data-component="gallery"]');
    this.searchInput = this.container.querySelector('[data-action="search"]');

    // Sample media library
    this.mediaLibrary = [
      {
        id: 'video-001',
        title: 'Introduction to HTML5 Media',
        type: 'video',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=400&h=300&fit=crop',
        duration: 1200,
        description: 'Learn the fundamentals of HTML5 media elements and how to embed audio and video.'
      },
      {
        id: 'audio-001',
        title: 'Web Audio API Concepts',
        type: 'audio',
        thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=300&fit=crop',
        duration: 1500,
        description: 'Deep dive into the Web Audio API architecture and signal processing fundamentals.'
      },
      {
        id: 'image-001',
        title: 'Modern CSS Techniques',
        type: 'image',
        thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop',
        duration: null,
        description: 'Explore glassmorphism, gradients, and responsive design principles with CSS.'
      },
      {
        id: 'video-002',
        title: 'Canvas API for Graphics',
        type: 'video',
        thumbnail: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop',
        duration: 2400,
        description: 'Master 2D canvas drawing, image manipulation, and creating visual effects.'
      },
      {
        id: 'audio-002',
        title: 'Sound Design and Synthesis',
        type: 'audio',
        thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
        duration: 1800,
        description: 'Understanding oscillators, envelopes, and creating musical instruments with JavaScript.'
      },
      {
        id: 'image-002',
        title: 'SVG Vector Graphics',
        type: 'image',
        thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
        duration: null,
        description: 'Learn to create scalable vector graphics and animate SVG paths programmatically.'
      },
      {
        id: 'video-003',
        title: 'Component Architecture',
        type: 'video',
        thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
        duration: 1950,
        description: 'Building scalable, maintainable applications with component-based design patterns.'
      },
      {
        id: 'audio-003',
        title: 'Advanced Audio Processing',
        type: 'audio',
        thumbnail: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=300&fit=crop',
        duration: 2100,
        description: 'Real-time audio analysis, frequency visualization, and effects processing techniques.'
      },
      {
        id: 'image-003',
        title: 'Accessibility Best Practices',
        type: 'image',
        thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop',
        duration: null,
        description: 'Creating inclusive digital experiences with WCAG compliance and semantic HTML.'
      }
    ];

    this.filteredLibrary = [...this.mediaLibrary];
    this.init();
  }

  init() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    // Use Array.map() to transform each item to HTML, then join
    const cardsHtml = this.filteredLibrary
      .map(item => renderMediaCard(item))
      .join('');

    this.gallery.innerHTML = cardsHtml;
  }

  setupEventListeners() {
    // Search functionality
    if (this.searchInput) {
      this.searchInput.addEventListener(
        'input',
        debounce((e) => this.handleSearch(e), 300)
      );
    }

    // Event delegation for card clicks
    this.gallery.addEventListener('click', (e) => this.handleCardClick(e));
  }

  handleSearch(e) {
    const query = e.target.value.toLowerCase();

    // Use Array.filter() to filter by title
    this.filteredLibrary = this.mediaLibrary.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query)
    );

    this.render();
  }

  handleCardClick(e) {
    // Event delegation: find closest card element
    const card = e.target.closest('.media-card');
    if (!card) return;

    const id = card.dataset.id;
    const type = card.dataset.type;
    const title = card.dataset.title;

    if (e.target.dataset.action === 'play-media') {
      this.handleMediaAction(id, type, title);
    }
  }

  handleMediaAction(id, type, title) {
    const message = `Playing ${type}: "${title}"`;
    console.log(message);

    // Show notification
    showNotification(message, 'info', 2000);

    // In a real application, this would navigate to or open the full player
  }
}

// Initialize gallery when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const galleryContainer = document.getElementById('gallery-container');
    if (galleryContainer) {
      window.mediaGallery = new MediaGallery('gallery-container');
    }
  });
}
