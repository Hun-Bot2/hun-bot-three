// Minimal application bootstrap
// This file intentionally avoids importing heavy runtimes until dependencies are installed.

import './styles/global.css';

function supportsWebGL2(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext && canvas.getContext('webgl2'));
  } catch (e) {
    return false;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const fallback = document.getElementById('webgl-fallback');
  const loadingOverlay = document.getElementById('loading-overlay');

  if (!supportsWebGL2()) {
    if (fallback) fallback.style.display = 'flex';
    if (loadingOverlay) loadingOverlay.style.display = 'none';
    console.warn('WebGL 2.0 not supported in this browser.');
    return;
  }

  // If dependencies are installed later, the real bootstrap will replace this behavior
  if (loadingOverlay) {
    loadingOverlay.classList.add('hidden');
    setTimeout(() => {
      if (loadingOverlay) loadingOverlay.style.display = 'none';
    }, 900);
  }

  console.log('Minimal bootstrap loaded. Install dependencies to enable full experience.');
});
