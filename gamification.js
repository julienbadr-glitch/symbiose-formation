/**
 * Gamification Module
 * XP, niveaux, badges, notifications, effets visuels
 */
import { state, saveState } from './state.js?v=81';
import { $, $$, HEADER_TITLES, sanitize } from './utils.js?v=81';
import { LEVELS, BADGES, STEPS } from './data.js?v=81';
export function getLevel(xp) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].min) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getNextLevel(xp) {
  const cur = getLevel(xp);
  const idx = LEVELS.indexOf(cur);
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
}

export function getProgressPercent() {
  return Math.round((state.completedSteps.length / 8) * 100);
}

export function getStepProgress(stepId) {
  if (state.completedSteps.includes(stepId)) return 100;
  const answers = state.quizAnswered[stepId];
  if (answers && typeof answers === 'object' && Object.keys(answers).length > 0) return 75;
  return 0;
}

let examTimerId = null;
let examTimeLeft = 0;
let examAnswers = [];
let examStartTime = 0;
let comboTimerId = null;


export function updateShieldBar() {
  const bar = $('#levelShieldBar');
  if (!bar) return;
  const curLevel = getLevel(state.xp);
  const curIdx = LEVELS.findIndex(l => l.name === curLevel.name);
  let html = '';
  LEVELS.forEach((lv, i) => {
    const isActive = i <= curIdx;
    html += `<span class="shield-icon ${isActive ? 'active' : ''}">${lv.icon}</span>`;
    if (i < LEVELS.length - 1) {
      html += `<span class="shield-connector ${i < curIdx ? 'filled' : ''}"></span>`;
    }
  });
  bar.innerHTML = html;
}

export function updateSidebarBadges() {
  const row = $('#sidebarBadgesRow');
  if (!row) return;
  row.innerHTML = BADGES.map(b => {
    const earned = state.unlockedBadges.includes(b.id);
    return `<span class="sidebar-badge ${earned ? 'earned' : 'locked'}">${b.icon}</span>`;
  }).join('');
}

export function updateHeader() {
  const prog = getProgressPercent();
  const headerRing = $('#headerRing');
  if (headerRing) {
    const c = 2 * Math.PI * 18;
    headerRing.style.strokeDashoffset = c - (prog / 100) * c;
  }
  const ringText = $('#headerRingText');
  if (ringText) ringText.textContent = prog + '%';

  const streakEl = $('#streakCount');
  if (streakEl) streakEl.textContent = state.comboStreak;

  const titleEl = $('#headerTitle');
  if (titleEl) titleEl.textContent = HEADER_TITLES[state.currentView] || 'Formation';
}

export function updateSidebar() {
  const lv = getLevel(state.xp);
  const nxt = getNextLevel(state.xp);
  $('#userLevel').textContent = lv.name;
  $('#xpCurrent').textContent = `${state.xp} XP`;

  if (nxt) {
    $('#xpNext').textContent = `${nxt.min} XP`;
    const pct = ((state.xp - lv.min) / (nxt.min - lv.min)) * 100;
    $('#xpBarFill').style.width = Math.min(pct, 100) + '%';
  } else {
    $('#xpNext').textContent = 'MAX';
    $('#xpBarFill').style.width = '100%';
  }

  $('#badgesCount').textContent = `${state.unlockedBadges.length}/8`;

  for (let i = 1; i <= 8; i++) {
    const check = document.querySelector(`[data-check="${i}"]`);
    if (check) check.classList.toggle('hidden', !state.completedSteps.includes(i));
  }

  updateShieldBar();
  updateSidebarBadges();
  updateHeader();
}

// ============================================================
// 3. UI UPDATES & NOTIFICATIONS
// ============================================================
export function notify(text, type) {
  const el = document.createElement('div');
  el.className = `notif ${type}`;
  el.innerHTML = sanitize(text);
  $('#notifications').appendChild(el);
  setTimeout(() => el.remove(), type === 'xp' || type === 'combo' ? 3000 : 4000);
}

export function triggerConfetti() {
  const canvas = $('#confettiCanvas');
  const colors = ['#2563eb', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#06b6d4', '#8b5cf6', '#fbbf24'];
  const shapes = [
    'width:8px;height:8px;border-radius:2px;',
    'width:6px;height:10px;border-radius:50%;',
    'width:10px;height:4px;border-radius:1px;',
  ];
  for (let i = 0; i < 80; i++) {
    setTimeout(() => {
      const p = document.createElement('div');
      p.className = 'confetti-piece';
      p.style.cssText = shapes[Math.floor(Math.random() * shapes.length)];
      p.style.left = Math.random() * 100 + '%';
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      const dur = 1.5 + Math.random() * 2.5;
      p.style.setProperty('--duration', dur + 's');
      p.style.setProperty('--spin', (360 + Math.random() * 720) + 'deg');
      canvas.appendChild(p);
      setTimeout(() => p.remove(), dur * 1000 + 200);
    }, i * 20);
  }
}

export function showComboOverlay(streak) {
  const overlay = $('#comboOverlay');
  overlay.classList.remove('hidden');
  overlay.innerHTML = `
    <div class="combo-text">COMBO x${streak}!</div>
    <div class="combo-sub">XP x${streak}</div>
  `;
  if (comboTimerId) clearTimeout(comboTimerId);
  comboTimerId = setTimeout(() => {
    overlay.classList.add('hidden');
    overlay.innerHTML = '';
  }, 1500);
}

export function showBadgePopup(badge) {
  const popup = $('#badgePopup');
  popup.classList.remove('hidden');
  popup.innerHTML = `
    <div class="badge-popup-content">
      <div class="badge-popup-icon">${badge.icon}</div>
      <div class="badge-popup-title">Badge d\u00e9bloqu\u00e9</div>
      <div class="badge-popup-name">${badge.name}</div>
      <div class="badge-popup-desc">${badge.desc}</div>
      <button class="badge-popup-btn" id="closeBadgePopup">Continuer</button>
    </div>
  `;
  triggerConfetti();
  $('#closeBadgePopup').addEventListener('click', () => {
    popup.classList.add('hidden');
    popup.innerHTML = '';
  });
}

// ============================================================
// 4. GAMIFICATION (XP, Badges, Combos)
// ============================================================
export function addXP(amount) {
  const multiplier = state.comboStreak >= 2 ? state.comboStreak : 1;
  const finalAmount = amount * multiplier;
  const oldLevel = getLevel(state.xp).name;
  state.xp += finalAmount;
  const newLevel = getLevel(state.xp).name;

  if (multiplier > 1) {
    notify(`<i class="fas fa-bolt"></i> +${finalAmount} XP (x${multiplier})`, 'xp');
  } else {
    notify(`<i class="fas fa-bolt"></i> +${finalAmount} XP`, 'xp');
  }

  if (newLevel !== oldLevel) {
    notify(`<i class="fas fa-arrow-up"></i> Niveau : ${newLevel} !`, 'levelup');
    triggerConfetti();
  }
  saveState();
  updateSidebar();
}

export function tryUnlockBadge(id) {
  if (state.unlockedBadges.includes(id)) return;
  state.unlockedBadges.push(id);
  const badge = BADGES.find(b => b.id === id);
  saveState();
  updateSidebar();
  showBadgePopup(badge);
  addXP(100);
}

// ============================================================
// 5. NAVIGATION & ROUTING
// ============================================================