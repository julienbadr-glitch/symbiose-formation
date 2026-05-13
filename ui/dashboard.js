import { STEPS, STEP_META, BADGES } from '../data.js?v=81';
import { getState, getLevel, getStepProgress } from '../state.js?v=81';
import { navigateTo } from '../router.js?v=81';

const RING_RADIUS = 18;

/**
 * Generates an SVG progress ring for a step card.
 * @param {number} pct - Completion percentage (0-100).
 * @returns {string} SVG markup string.
 */
function buildStepRingSVG(pct) {
  const c = 2 * Math.PI * RING_RADIUS;
  const offset = c - (pct / 100) * c;
  const color = pct === 100 ? '#10b981' : '#2563eb';
  return `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="${RING_RADIUS}" fill="none" stroke="#e2e8f0" stroke-width="3"/><circle cx="24" cy="24" r="${RING_RADIUS}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${offset}" transform="rotate(-90 24 24)"/></svg>`;
}

/**
 * Renders the dashboard with stats grid and step cards.
 * @param {HTMLElement} main - The main content container.
 */
export function renderDashboard(main) {
  const state = getState();
  const lv = getLevel(state.xp);
  let totalQuizCorrect = 0;
  Object.keys(state.quizAnswered).forEach(k => {
    const step = STEPS[parseInt(k) - 1];
    if (!step) return;
    const answers = state.quizAnswered[k];
    const quizArr = Array.isArray(step.quiz) ? step.quiz : [step.quiz];
    if (typeof answers === 'object' && answers !== null) {
      const correct = Object.keys(answers).filter(qi => answers[qi] === quizArr[parseInt(qi)].correct).length;
      if (correct === quizArr.length) totalQuizCorrect++;
    }
  });

  let html = `
    <div class="breadcrumb"><i class="fas fa-chart-line"></i> Progression</div>
    <h1 class="view-title">Tableau de bord</h1>
    <p class="view-subtitle">Suivez votre progression dans la formation Symbiose.</p>
    <div class="dash-grid">
      <div class="dash-stat fade-in">
        <div class="dash-stat-icon blue"><i class="fas fa-bolt"></i></div>
        <div class="dash-stat-value">${state.xp}</div>
        <div class="dash-stat-label">Points XP</div>
      </div>
      <div class="dash-stat fade-in" style="animation-delay:.05s">
        <div class="dash-stat-icon green"><i class="fas fa-check-circle"></i></div>
        <div class="dash-stat-value">${state.completedSteps.length}/8</div>
        <div class="dash-stat-label">\u00c9tapes compl\u00e9t\u00e9es</div>
      </div>
      <div class="dash-stat fade-in" style="animation-delay:.1s">
        <div class="dash-stat-icon purple"><i class="fas fa-star"></i></div>
        <div class="dash-stat-value">${lv.name}</div>
        <div class="dash-stat-label">Niveau actuel</div>
      </div>
      <div class="dash-stat fade-in" style="animation-delay:.15s">
        <div class="dash-stat-icon amber"><i class="fas fa-graduation-cap"></i></div>
        <div class="dash-stat-value">${totalQuizCorrect}/8</div>
        <div class="dash-stat-label">Quiz r\u00e9ussis</div>
      </div>
    </div>
    <h2 style="margin-bottom:16px">\u00c9tapes de la formation</h2>
    <div class="steps-grid">
  `;

  STEPS.forEach((step, i) => {
    const completed = state.completedSteps.includes(step.id);
    const pct = getStepProgress(step.id);
    const meta = STEP_META[i];
    html += `
      <div class="step-card ${completed ? 'completed' : ''} fade-in" data-step="${step.id}" style="animation-delay:${.05 * i}s">
        <div class="step-card-top">
          <div class="step-card-num">${step.id}</div>
          <div class="step-card-ring">
            ${buildStepRingSVG(pct)}
            <span class="step-card-ring-text">${pct}%</span>
          </div>
        </div>
        <div class="step-card-title">${step.title}</div>
        <div class="step-card-desc">${step.subtitle}</div>
        <div class="step-card-footer">
          <div class="step-card-time"><i class="fas fa-clock"></i> ${meta.time}</div>
          <div class="step-card-xp"><i class="fas fa-bolt"></i> ${meta.xp} XP</div>
          <span class="step-card-chevron"><i class="fas fa-chevron-right"></i></span>
        </div>
      </div>
    `;
  });

  html += `</div>
    <div class="card fade-in">
      <div class="card-header">
        <div class="card-icon amber"><i class="fas fa-award"></i></div>
        <h2 class="card-title">Badges : ${state.unlockedBadges.length}/8</h2>
      </div>
      <div class="badges-grid">
        ${BADGES.map(b => `<div class="badge-card ${state.unlockedBadges.includes(b.id) ? 'unlocked' : 'locked'}"><span class="badge-card-icon">${b.icon}</span><div class="badge-card-name">${b.name}</div></div>`).join('')}
      </div>
    </div>
    ${state.examPassed ? `<div class="card fade-in"><div class="card-header"><div class="card-icon green"><i class="fas fa-clipboard-check"></i></div><h2 class="card-title">Examen r\u00e9ussi : ${state.examScore}%</h2></div></div>` : ''}
  `;

  main.innerHTML = html;
  main.querySelectorAll('.step-card').forEach(card => {
    card.addEventListener('click', () => navigateTo(`step-${card.dataset.step}`));
  });
}
