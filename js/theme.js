/**
 * Theme Toggle Manager
 * Handles dark/light mode switching with theme persistence
 */

class ThemeManager {
  constructor() {
    this.STORAGE_KEY = 'edustream-theme';
    this.LIGHT = 'light';
    this.DARK = 'dark';
    this.init();
  }

  init() {
    // Restore saved theme or default to dark
    const savedTheme = localStorage.getItem(this.STORAGE_KEY) || this.DARK;
    this.setTheme(savedTheme);
    
    // Setup toggle button
    this.setupToggleButton();
  }

  setTheme(theme) {
    const html = document.documentElement;
    
    if (theme === this.LIGHT) {
      html.setAttribute('data-theme', this.LIGHT);
      document.body.style.colorScheme = 'light';
    } else {
      html.removeAttribute('data-theme');
      document.body.style.colorScheme = 'dark';
    }
    
    localStorage.setItem(this.STORAGE_KEY, theme);
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || this.DARK;
    const newTheme = currentTheme === this.LIGHT ? this.DARK : this.LIGHT;
    this.setTheme(newTheme);
  }

  setupToggleButton() {
    const toggleBtn = document.querySelector('.theme-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleTheme());
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
  });
} else {
  window.themeManager = new ThemeManager();
}
