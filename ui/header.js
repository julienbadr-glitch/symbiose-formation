import { LEVELS, BADGES } from '../data.js?v=81';
import { getState, getLevel, getNextLevel, getProgressPercent } from '../state.js?v=81';
import { $, $$ } from '../router.js?v=81';

const HEADER_TITLES = {
  home: 'Accueil',
  dashboard: 'Tableau de bord',
  badges: 'Badges',
  leaderboard: 'Classement',
  exam: 'Examen Final',
  certificate: 'Certificat',
  roleplay: 'Jeux de R\u00f4le',
};

/**
 * Renders the level progression bar in the header.
 */
function updateHeaderLevelBar() {
  const state = getState();
  const lv = getLevel(state.xp);
  const container = $('#headerLevelBar');
  if (!container) return;
  container.innerHTML = LEVELS.map((level, i) => {
    const active = state.xp >= level.min;
    const current = lv === level;
    let html = `<span class="header-level-icon ${active ? 'active' : ''} ${current ? 'current' : ''}" data-tooltip="${level.name}">${level.icon}</span>`;
    if (i < LEVELS.length - 1) {
      html += `<span class="header-level-connector ${state.xp >= LEVELS[i + 1].min ? 'filled' : ''}"></span>`;
    }
    return html;
  }).join('');
}

/**
 * Renders the earned/locked badge icons in the header.
 */
function updateHeaderBadges() {
  const state = getState();
  const container = $('#headerBadgesRow');
  if (!container) return;
  let html = BADGES.map(b => {
    const unlocked = state.unlockedBadges.includes(b.id);
    return `<span class="header-badge-icon ${unlocked ? 'earned' : 'locked'}" data-tooltip="${b.name}"><span class="header-badge-emoji">${b.icon}</span></span>`;
  }).join('');
  container.innerHTML = html;
}

/**
 * Updates the navigation dots showing step progress status.
 */
export function updateNavDots() {
  const state = getState();
  $$('.nav-status-dot').forEach(dot => {
    const stepId = parseInt(dot.dataset.stepDot);
    if (!stepId) return;
    let pct = 0;
    let status = 'not-started';
    if (state.completedSteps.includes(stepId)) {
      pct = 100;
      status = 'completed';
    } else if (state.quizAnswered[stepId]) {
      pct = 75;
      status = 'in-progress';
    }
    const r = 6;
    const c = 2 * Math.PI * r;
    const offset = c - (pct / 100) * c;
    const strokeColor = status === 'completed' ? 'var(--success)' : status === 'in-progress' ? 'var(--accent)' : 'rgba(100,116,139,.25)';
    dot.className = `nav-status-dot ${status}`;
    dot.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="${r}" fill="none" stroke="rgba(100,116,139,.15)" stroke-width="2"/><circle cx="8" cy="8" r="${r}" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${offset}" transform="rotate(-90 8 8)" style="transition:stroke-dashoffset .6s ease"/></svg>${status === 'completed' ? '<i class="fas fa-check nav-ring-check"></i>' : ''}`;
  });
}

/**
 * Orchestrates all header UI updates (progress ring, level bar, badges, dots, profile).
 */
export function updateHeader() {
  const state = getState();
  const pct = getProgressPercent();
  const lv = getLevel(state.xp);
  const nxt = getNextLevel(state.xp);

  const ring = $('#headerRing');
  if (ring) {
    const r = 18;
    const c = 2 * Math.PI * r;
    ring.style.strokeDasharray = c;
    ring.style.strokeDashoffset = c - (pct / 100) * c;
  }

  const ringText = $('.header-ring-text');
  if (ringText) ringText.textContent = `${pct}%`;

  const headerTitle = state.currentView;
  const stepMatch = headerTitle.match(/^step-(\d+)$/);
  const titleEl = $('#headerViewTitle');
  if (titleEl) {
    titleEl.textContent = stepMatch
      ? `\u00c9tape ${stepMatch[1]}/8`
      : (HEADER_TITLES[headerTitle] || '');
  }

  const xpBadge = $('#headerXpBadge');
  if (xpBadge) xpBadge.innerHTML = `<i class="fas fa-bolt"></i> ${state.xp} XP`;

  const profileLevel = $('.header-profile-level');
  if (profileLevel) profileLevel.textContent = `${lv.icon} ${lv.name}${nxt ? ` \u2022 ${state.xp}/${nxt.min} XP` : ' (MAX)'}`;

  updateHeaderLevelBar();
  updateHeaderBadges();
  updateNavDots();
}
