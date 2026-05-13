import { LEVELS, BADGES } from '../data.js?v=81';
import { getState, getLevel, getNextLevel } from '../state.js?v=81';
import { updateHeader, updateNavDots } from './header.js?v=81';
import { $ } from '../router.js?v=81';

/**
 * Renders the level shield progression bar in the sidebar.
 */
function updateShieldBar() {
  const state = getState();
  const lv = getLevel(state.xp);
  const container = $('#levelShieldBar');
  if (!container) return;
  container.innerHTML = LEVELS.map((level, i) => {
    const active = lv === level;
    let html = `<span class="shield-icon ${active ? 'active' : ''}">${level.icon}</span>`;
    if (i < LEVELS.length - 1) {
      html += `<span class="shield-connector ${state.xp >= LEVELS[i + 1].min ? 'filled' : ''}"></span>`;
    }
    return html;
  }).join('');
}

/**
 * Renders earned/locked badge icons in the sidebar.
 */
function updateSidebarBadges() {
  const state = getState();
  const container = $('#sidebarBadges');
  if (!container) return;
  container.innerHTML = BADGES.map(b =>
    `<span class="sidebar-badge ${state.unlockedBadges.includes(b.id) ? 'earned' : 'locked'}">${b.icon}</span>`
  ).join('');
}

/**
 * Updates all sidebar content: level, XP bar, badges, progress dots, and header.
 */
export function updateSidebar() {
  const state = getState();
  const lv = getLevel(state.xp);
  const nxt = getNextLevel(state.xp);

  const levelEl = $('#userLevel');
  if (levelEl) levelEl.textContent = `${lv.icon} ${lv.name}`;

  let xpPct = 0;
  if (nxt) {
    xpPct = Math.round(((state.xp - lv.min) / (nxt.min - lv.min)) * 100);
  } else {
    xpPct = 100;
  }

  const xpFill = $('#xpBarFill');
  if (xpFill) xpFill.style.width = `${xpPct}%`;

  const xpText = $('#xpText');
  if (xpText) xpText.textContent = nxt ? `${state.xp} / ${nxt.min} XP` : `${state.xp} XP (MAX)`;

  const xpLevelText = $('#xpLevelText');
  if (xpLevelText) xpLevelText.textContent = lv.name;

  const badgeCount = $('#badgeCount');
  if (badgeCount) badgeCount.textContent = `${state.unlockedBadges.length}/8`;

  updateShieldBar();
  updateSidebarBadges();
  updateNavDots();
  updateHeader();
}
