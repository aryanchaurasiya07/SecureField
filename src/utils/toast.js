/**
 * Toast Notification Utility
 * Lightweight in-app toast system — no external dependencies
 */

let toastContainer = null;

function getContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.style.cssText = `
      position: fixed; top: 70px; left: 50%; transform: translateX(-50%);
      z-index: 9999; display: flex; flex-direction: column; gap: 8px;
      width: calc(100% - 32px); max-width: 400px; pointer-events: none;
    `;
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

const ICONS = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
const COLORS = {
  success: 'background:#166534;border-color:#16a34a;',
  error:   'background:#7f1d1d;border-color:#dc2626;',
  warning: 'background:#78350f;border-color:#d97706;',
  info:    'background:#1e3a5f;border-color:#3b82f6;',
};

export function toast(message, type = 'info', duration = 3000) {
  const container = getContainer();
  const el = document.createElement('div');
  el.style.cssText = `
    display: flex; align-items: center; gap: 10px;
    padding: 12px 16px; border-radius: 12px; border: 1px solid;
    color: white; font-size: 14px; font-family: sans-serif;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    pointer-events: all; cursor: pointer;
    opacity: 0; transition: opacity 0.2s ease;
    ${COLORS[type] || COLORS.info}
  `;
  el.innerHTML = `<span style="font-size:18px">${ICONS[type]}</span><span>${message}</span>`;
  container.appendChild(el);

  requestAnimationFrame(() => { el.style.opacity = '1'; });

  const remove = () => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 200);
  };
  el.addEventListener('click', remove);
  setTimeout(remove, duration);
}
