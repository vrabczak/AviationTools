/**
 * Aviation Tools - Main Entry Point
 * Single-page application for aviation calculations
 */

import './styles/main.css';
import './styles/menu.css';
import './styles/tools.css';
import { App } from './App';

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

function initApp(): void {
  try {
    const app = new App();
    app.init();
  } catch (error) {
    console.error('Failed to initialize app:', error);
    document.body.innerHTML = `
      <div style="padding: 20px; text-align: center; color: #e74c3c;">
        <h1>⚠️ Error</h1>
        <p>Failed to load Aviation Tools. Please refresh the page.</p>
        <p><small>${error}</small></p>
      </div>
    `;
  }
}

// Register service worker for offline support (production only)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    const serviceWorkerUrl = new URL('service-worker.js', window.location.href);

    navigator.serviceWorker
      .register(serviceWorkerUrl)
      .then(registration => {
        console.log('Service Worker registered:', registration);
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  });
}