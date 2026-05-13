import { BADGES } from '../data.js?v=81';
import { getState } from '../state.js?v=81';

/**
 * Renders the badges gallery page.
 * @param {HTMLElement} main - The main content container.
 */
export function renderBadges(main) {
  const state = getState();
  main.innerHTML = `
    <div class="breadcrumb"><i class="fas fa-award"></i> Badges</div>
    <h1 class="view-title">Vos Badges</h1>
    <p class="view-subtitle">Collectionnez les 8 badges en progressant dans la formation.</p>
    <div class="badges-grid">
      ${BADGES.map((b, i) => {
        const unlocked = state.unlockedBadges.includes(b.id);
        return `<div class="badge-card ${unlocked ? 'unlocked' : 'locked'} fade-in" style="animation-delay:${.04 * i}s"><span class="badge-card-icon">${b.icon}</span><div class="badge-card-name">${b.name}</div><div class="badge-card-desc">${b.desc}</div></div>`;
      }).join('')}
    </div>
  `;
}
