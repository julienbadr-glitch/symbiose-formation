import { getState, getLevel, saveState } from './state.js?v=81';
import { BADGES } from './data.js?v=81';

const CONFETTI_COLORS = ['#2563eb', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6', '#ef4444'];
const CONFETTI_COUNT = 60;
const COMBO_DISPLAY_DURATION = 1200;

let comboTimerId = null;

/**
 * Displays a floating notification that auto-dismisses.
 * @param {string} text - The notification text content.
 * @param {string} type - Notification type ('xp', 'combo', 'levelup', 'badge-notif').
 */
export function notify(text, type = 'xp') {
  const container = document.getElementById('notifications');
  if (!container) return;
  const el = document.createElement('div');
  el.className = `notif ${type}`;
  el.textContent = text;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

/**
 * Triggers a confetti animation across the screen.
 */
export function triggerConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  for (let i = 0; i < CONFETTI_COUNT; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const size = 6 + Math.random() * 8;
    piece.style.cssText = `
      left:${Math.random() * 100}%;
      width:${size}px;
      height:${size * (0.5 + Math.random())}px;
      background:${CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]};
      --duration:${1 + Math.random() * 2}s;
      --spin:${Math.random() * 720 - 360}deg;
      animation-delay:${Math.random() * 0.3}s;
    `;
    canvas.appendChild(piece);
    setTimeout(() => piece.remove(), 3500);
  }
}

/**
 * Displays a combo multiplier overlay.
 * @param {number} streak - Current combo streak count.
 */
export function showComboOverlay(streak) {
  if (comboTimerId) clearTimeout(comboTimerId);
  let overlay = document.querySelector('.combo-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'combo-overlay';
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `
    <div class="combo-text">x${streak}</div>
    <div class="combo-sub">COMBO</div>
  `;
  comboTimerId = setTimeout(() => {
    overlay.remove();
    comboTimerId = null;
  }, COMBO_DISPLAY_DURATION);
}

/**
 * Shows a popup when a badge is unlocked, with confetti effect.
 * @param {object} badge - Badge object with icon, name, and desc properties.
 */
export function showBadgePopup(badge) {
  const popup = document.createElement('div');
  popup.className = 'badge-popup';
  popup.innerHTML = `
    <div class="badge-popup-content">
      <div class="badge-popup-icon">${badge.icon}</div>
      <div class="badge-popup-title">Badge debloque</div>
      <div class="badge-popup-name">${badge.name}</div>
      <div class="badge-popup-desc">${badge.desc}</div>
      <button class="badge-popup-btn">Continuer</button>
    </div>
  `;
  document.body.appendChild(popup);
  triggerConfetti();
  popup.querySelector('.badge-popup-btn').addEventListener('click', () => popup.remove());
  popup.addEventListener('click', (e) => { if (e.target === popup) popup.remove(); });
}

/**
 * Attempts to unlock a badge by ID. Awards XP and shows popup if not already earned.
 * @param {string} id - Badge identifier.
 * @param {Function} [onUpdate] - Callback for UI update after unlocking.
 */
export function tryUnlockBadge(id, onUpdate) {
  const state = getState();
  if (state.unlockedBadges.includes(id)) return;

  const badge = BADGES.find(b => b.id === id);
  if (!badge) return;

  state.unlockedBadges.push(id);
  showBadgePopup(badge);
  saveState();
  if (onUpdate) onUpdate();
}

/**
 * Adds XP with combo multiplier, checks level up, and updates UI.
 * @param {number} amount - Base XP amount to add.
 * @param {Function} [onUpdate] - Optional callback for UI update.
 */
export function addXP(amount, category, onUpdate) {
  if (typeof category === 'function') { onUpdate = category; category = 'games'; }
  if (!category) category = 'games';
  const state = getState();
  const prevLevel = getLevel(state.xp);
  const caps = { quiz: 500, games: 500, simulations: 500 };
  const cap = caps[category] || 500;
  const key = 'xp' + category.charAt(0).toUpperCase() + category.slice(1);
  const current = state[key] || 0;
  const earned = Math.min(amount, cap - current);
  if (earned <= 0) { if (onUpdate) onUpdate(); return; }
  state[key] = current + earned;
  state.xp = (state.xpQuiz || 0) + (state.xpGames || 0) + (state.xpSimulations || 0);
  notify('+' + earned + ' XP', 'xp');
  const newLevel = getLevel(state.xp);
  if (newLevel !== prevLevel) {
    notify('Niveau ' + newLevel.icon + ' ' + newLevel.name + ' atteint !', 'levelup');
    triggerConfetti();
  }
  saveState();
  if (onUpdate) onUpdate();
}
