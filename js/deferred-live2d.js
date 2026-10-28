/* Keep the mascot off the critical loading path and initialize it only once. */
(() => {
  'use strict';
  if (window.__live2dScheduled || !window.matchMedia('(min-width: 768px)').matches) return;
  if (navigator.connection && navigator.connection.saveData) return;
  window.__live2dScheduled = true;

  const cdn = 'https://cdn.jsdelivr.net/gh/letere-gzj/live2d-widget-v3@main';
  const load = (url, type) => new Promise((resolve, reject) => {
    const element = document.createElement(type === 'css' ? 'link' : 'script');
    if (type === 'css') {
      element.rel = 'stylesheet';
      element.href = url;
    } else {
      element.src = url;
      element.async = true;
    }
    element.onload = resolve;
    element.onerror = () => reject(new Error(`Unable to load ${url}`));
    document.head.appendChild(element);
  });

  const initialize = async () => {
    if (!window.matchMedia('(min-width: 768px)').matches) return;
    try {
      // The SDK depends on the core; preserve that order instead of racing both.
      await Promise.all([load('/live2d/waifu.css', 'css'), load(`${cdn}/Core/live2dcubismcore.js`, 'js')]);
      await load(`${cdn}/live2d-sdk.js`, 'js');
      await load('/live2d/waifu-tips.js', 'js');
      if (typeof window.initWidget === 'function') {
        window.initWidget({waifuPath: '/live2d/waifu-tips.json', cdnPath: '/live2d/',
          tools: ['hitokoto', 'express', 'info', 'quit'], dragEnable: false,
          dragDirection: ['x', 'y'], switchType: 'order'});
      }
    } catch (error) {
      console.warn('Live2D is temporarily unavailable:', error.message);
    }
  };

  const schedule = () => setTimeout(() => {
    if ('requestIdleCallback' in window) window.requestIdleCallback(initialize, {timeout: 3000});
    else initialize();
  }, 1500);
  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule, {once: true});
})();
