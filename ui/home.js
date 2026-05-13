import { STEPS, STEP_META, BADGES } from '../data.js?v=87';
import { getState, getLevel, getNextLevel, TOTAL_STEPS } from '../state.js?v=81';
import { navigateTo, $ } from '../router.js?v=81';

const MAX_XP = 1500;

const AVG_MINUTES = [14, 17, 19, 17, 17, 14, 17, 14];

/**
 * @returns {string} Estimated remaining training time as a human-readable string.
 */
function getTimeRemaining() {
  const state = getState();
  const remaining = TOTAL_STEPS - state.completedSteps.length;
  if (remaining <= 0) return '0 min';
  let total = 0;
  for (let i = 0; i < TOTAL_STEPS; i++) {
    if (!state.completedSteps.includes(i + 1)) total += AVG_MINUTES[i];
  }
  return total >= 60 ? `${Math.floor(total / 60)}h ${total % 60}min` : `${total} min`;
}

/**
 * @returns {object|null} The next incomplete step object, or null if all done.
 */
export function getNextStep() {
  const state = getState();
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    if (!state.completedSteps.includes(i)) return STEPS[i - 1];
  }
  return null;
}

/**
 * @returns {Array} List of up to 5 recent activity items.
 */
function getRecentActivity() {
  const state = getState();
  const activities = [];
  const badgeMap = Object.fromEntries(BADGES.map(b => [b.id, b.name]));
  state.unlockedBadges.slice(-3).reverse().forEach(id => {
    activities.push({ icon: 'fa-award', color: 'amber', text: `Badge "${badgeMap[id] || id}" d\u00e9bloqu\u00e9` });
  });
  Object.keys(state.quizAnswered).slice(-3).reverse().forEach(k => {
    const step = STEPS[parseInt(k) - 1];
    if (step) {
      const answers = state.quizAnswered[k];
      const quizArr = Array.isArray(step.quiz) ? step.quiz : [step.quiz];
      if (typeof answers === 'object' && answers !== null) {
        const total = quizArr.length;
        const correct = Object.keys(answers).filter(qi => answers[qi] === quizArr[parseInt(qi)].correct).length;
        if (correct > 0) {
          activities.push({ icon: 'fa-check-circle', color: 'green', text: `Quiz "${step.title}" : ${correct}/${total}` });
        }
      }
    }
  });
  state.completedSteps.slice(-3).reverse().forEach(id => {
    activities.push({ icon: 'fa-flag-checkered', color: 'blue', text: `Module ${id} termin\u00e9` });
  });
  return activities.slice(0, 5);
}

/**
 * Renders the home page with KPI cards, next step, activity feed, and resume banner.
 * @param {HTMLElement} main - The main content container.
 */
export async function renderHome(main) {
  const state = getState();
  const lv = getLevel(state.xp);
  const nxt = getNextLevel(state.xp);
  const nextStep = getNextStep();
  const activities = getRecentActivity();

  let xpPct = nxt ? Math.round(((state.xp - lv.min) / (nxt.min - lv.min)) * 100) : 100;
  const completedPct = Math.round((state.completedSteps.length / TOTAL_STEPS) * 100);
    const _session = JSON.parse(localStorage.getItem('symbiose_session') || '{}');
    const _userEmail = _session.email || '';
    const userName = (_userEmail.split('@')[0] || 'Apprenant').split('.')[0].replace(/^./, c => c.toUpperCase());

  let html = '';

  if (nextStep) {
    html += `
    <div class="resume-banner fade-in" id="resumeBanner">
      <div class="resume-banner-content">
        <span class="resume-banner-label">Reprendre la formation</span>
        <span class="resume-banner-module">Module ${nextStep.id} &rarr;</span>
      </div>
      <button class="resume-banner-arrow" id="resumeBannerBtn"><i class="fas fa-arrow-right"></i></button>
    </div>`;
  }

  html += `
    <div class="home-welcome fade-in">
      <h1 class="home-greeting">Bienvenue, ${userName} <span class="wave">&#128075;</span></h1>
      <p class="home-subtitle">Votre progression Symbiose</p>
    </div>
    <div class="home-kpi-grid">
      <div class="home-kpi fade-in" style="animation-delay:.05s">
        <div class="home-kpi-icon fire"><i class="fas fa-fire"></i></div>
        <div class="home-kpi-content">
          <div class="home-kpi-label">Niveau actuel</div>
          <div class="home-kpi-value">${lv.name}</div>
          <div class="home-kpi-bar"><div class="home-kpi-bar-fill" style="width:${xpPct}%"></div></div>
          <div class="home-kpi-sub">${state.xp} XP${nxt ? ` / ${nxt.min} XP` : ' (MAX)'}</div>
        </div>
      </div>
      <div class="home-kpi fade-in" style="animation-delay:.1s">
        <div class="home-kpi-icon check"><i class="fas fa-check-circle"></i></div>
        <div class="home-kpi-content">
          <div class="home-kpi-label">Modules compl\u00e9t\u00e9s</div>
          <div class="home-kpi-value">${state.completedSteps.length} / 8</div>
          <div class="home-kpi-bar"><div class="home-kpi-bar-fill green" style="width:${completedPct}%"></div></div>
          <div class="home-kpi-sub">${completedPct}% de la formation</div>
        </div>
      </div>
      <div class="home-kpi fade-in" style="animation-delay:.15s">
        <div class="home-kpi-icon trophy"><i class="fas fa-trophy"></i></div>
        <div class="home-kpi-content">
          <div class="home-kpi-label">Badges obtenus</div>
          <div class="home-kpi-value">${state.unlockedBadges.length} / 8</div>
          <div class="home-kpi-badges">${BADGES.map(b => `<span class="home-badge ${state.unlockedBadges.includes(b.id) ? 'earned' : 'locked'}">${b.icon}</span>`).join('')}</div>
        </div>
      </div>
      <div class="home-kpi fade-in" style="animation-delay:.2s">
        <div class="home-kpi-icon clock"><i class="fas fa-clock"></i></div>
        <div class="home-kpi-content">
          <div class="home-kpi-label">Temps estim\u00e9 restant</div>
          <div class="home-kpi-value">${getTimeRemaining()}</div>
          <div class="home-kpi-sub">${TOTAL_STEPS - state.completedSteps.length} module${TOTAL_STEPS - state.completedSteps.length > 1 ? 's' : ''} restant${TOTAL_STEPS - state.completedSteps.length > 1 ? 's' : ''}</div>
        </div>
      </div>
    </div>
  `;

  html += `
    <div class="home-section fade-in" style="animation-delay:.22s">
      <h2 class="home-section-title"><i class="fas fa-award"></i> Badges : ${state.unlockedBadges.length}/8</h2>
      <div class="home-badges-grid">
        ${BADGES.map((b, i) => {
          const unlocked = state.unlockedBadges.includes(b.id);
          return `
            <div class="home-badge-card ${unlocked ? 'home-badge-earned' : 'home-badge-locked'} fade-in" style="animation-delay:${0.25 + i * 0.04}s">
              <span class="home-badge-card-icon">${b.icon}</span>
              <span class="home-badge-card-name">${b.name}</span>
            </div>`;
        }).join('')}
      </div>
    </div>
  `;
    // Leaderboard dynamique depuis l'API
    let leaderboardEntries = [];
    try {
        const lbRes = await fetch('/api/leaderboard.php');
        const lbData = await lbRes.json();
        if (lbData.success && lbData.leaderboard) {
            leaderboardEntries = lbData.leaderboard.map(u => ({
                ...u,
                me: u.email === _userEmail,
                level: u.xp >= 975 ? 'Maitre Symbiose' : u.xp >= 650 ? 'Expert' : u.xp >= 400 ? 'Stratege' : u.xp >= 200 ? 'Explorateur' : 'Recrue'
            }));
        }
    } catch(e) { console.log('Leaderboard fetch error:', e); }
  const rankIcons = ['fa-crown', 'fa-medal', 'fa-award'];
  const rankColors = ['gold', 'silver', 'bronze'];

  html += `
    <div class="home-section fade-in" style="animation-delay:.3s">
      <div class="home-leaderboard-header">
        <h2 class="home-section-title"><i class="fas fa-ranking-star"></i> Classement</h2>
        <button class="home-leaderboard-link" id="homeLbLink">Voir tout <i class="fas fa-arrow-right"></i></button>
      </div>
      <div class="home-leaderboard">
        ${leaderboardEntries.slice(0, 5).map((u, i) => `
          <div class="home-lb-row ${u.me ? 'home-lb-me' : ''} fade-in" style="animation-delay:${0.32 + i * 0.04}s">
            <div class="home-lb-rank ${rankColors[i] || ''}">${i < 3 ? `<i class="fas ${rankIcons[i]}"></i>` : i + 1}</div>
            <div class="home-lb-avatar">${u.initials}</div>
            <div class="home-lb-info">
              <span class="home-lb-name">${u.name}${u.me ? '<span class="home-lb-you">Vous</span>' : ''}</span>
              <span class="home-lb-level">${u.level}</span>
            </div>
            <div class="home-lb-bar-wrap">
              <div class="home-lb-bar"><div class="home-lb-bar-fill" style="width:${Math.round((u.xp / MAX_XP) * 100)}%"></div></div>
            </div>
            <div class="home-lb-xp">${u.xp} XP</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  if (nextStep) {
    const meta = STEP_META[nextStep.id - 1];
    html += `
    <div class="home-section fade-in" style="animation-delay:.45s">
      <h2 class="home-section-title"><i class="fas fa-arrow-right"></i> Prochaine \u00e9tape recommand\u00e9e</h2>
      <div class="home-next-card" id="homeNextCard">
        <div class="home-next-num">${nextStep.id}</div>
        <div class="home-next-body">
          <h3>${nextStep.title}</h3>
          <p>${nextStep.subtitle}</p>
          <div class="home-next-meta">
            <span><i class="fas fa-clock"></i> ${AVG_MINUTES[nextStep.id - 1]} min</span>
            <span><i class="fas fa-bolt"></i> ${meta.xp} XP</span>
          </div>
        </div>
        <button class="btn btn-primary home-next-btn" id="homeStartBtn">Commencer <i class="fas fa-arrow-right"></i></button>
      </div>
    </div>`;
  } else {
    html += `
    <div class="home-section fade-in" style="animation-delay:.35s">
      <h2 class="home-section-title"><i class="fas fa-check-double"></i> Formation compl\u00e9t\u00e9e</h2>
      <div class="home-next-card completed-card">
        <div class="home-next-body">
          <h3>Bravo ! Tous les modules sont termin\u00e9s.</h3>
          <p>Passez l'examen final pour obtenir votre certificat.</p>
        </div>
        <button class="btn btn-success" id="homeExamBtn"><i class="fas fa-clipboard-check"></i> Passer l'examen</button>
      </div>
    </div>`;
  }

  if (activities.length > 0) {
    html += `
    <div class="home-section fade-in" style="animation-delay:.4s">
      <h2 class="home-section-title"><i class="fas fa-clock-rotate-left"></i> Activit\u00e9 r\u00e9cente</h2>
      <div class="home-activity-list">
        ${activities.map(a => `
          <div class="home-activity-item">
            <div class="home-activity-icon ${a.color}"><i class="fas ${a.icon}"></i></div>
            <span>${a.text}</span>
          </div>
        `).join('')}
      </div>
    </div>`;
  }

  if (state.completedSteps.length === TOTAL_STEPS) {
    html += `
    <div class="formation-complete-banner fade-in" style="animation-delay:.45s">
      <div class="formation-complete-left">
        <div class="formation-complete-check"><i class="fas fa-check-circle"></i></div>
        <div>
          <h3 class="formation-complete-title">Formation compl&eacute;t&eacute;e</h3>
          <p class="formation-complete-sub">Bravo ! Tous les modules sont termin&eacute;s. Passez l'examen final pour obtenir votre certificat.</p>
        </div>
      </div>
      <button class="btn btn-success formation-complete-btn" id="homeExamBtnBottom"><i class="fas fa-check"></i> Passer l'examen &rarr;</button>
    </div>`;
  }

  main.innerHTML = html;

  const resumeBtn = $('#resumeBannerBtn');
  const resumeBanner = $('#resumeBanner');
  if (resumeBtn && nextStep) resumeBtn.addEventListener('click', () => navigateTo(`step-${nextStep.id}`));
  if (resumeBanner && nextStep) resumeBanner.addEventListener('click', (e) => { if (e.target.id !== 'resumeBannerBtn') navigateTo(`step-${nextStep.id}`); });

  const startBtn = $('#homeStartBtn');
  if (startBtn && nextStep) startBtn.addEventListener('click', () => navigateTo(`step-${nextStep.id}`));
  const nextCard = $('#homeNextCard');
  if (nextCard && nextStep) nextCard.addEventListener('click', (e) => { if (e.target.id !== 'homeStartBtn') navigateTo(`step-${nextStep.id}`); });
  const examBtn = $('#homeExamBtn');
  if (examBtn) examBtn.addEventListener('click', () => navigateTo('exam'));
  const examBtnBottom = $('#homeExamBtnBottom');
  if (examBtnBottom) examBtnBottom.addEventListener('click', () => navigateTo('exam'));
  const lbLink = $('#homeLbLink');
  if (lbLink) lbLink.addEventListener('click', () => navigateTo('leaderboard'));
}
