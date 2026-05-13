import { getState, saveState } from './state.js?v=81';
import { showComboOverlay, triggerConfetti, addXP, tryUnlockBadge } from './notifications.js?v=81';
import { updateHeader } from './ui/header.js?v=81';
import { updateSidebar } from './ui/sidebar.js?v=81';
import { $, $$ } from './router.js?v=81';

const QUIZ_TRANSITION_DELAY = 1500;
const SLIDE_ANIM_DURATION = 350;
const LETTERS = ['A', 'B', 'C', 'D'];
const XP_PER_CORRECT = 6;
const COMBO_THRESHOLD = 2;
const QUIZ_PASS_RATE = 0.7;
const GAME_MAX_SCORES = {
  1: { key: 'game_discovery_1', max: 60 },
  2: { key: 'game_speed_2', max: 1500 },
  3: { key: 'game_stratege_3', max: 90 },
  4: { key: 'game_cluedo_4', max: 60 },
  5: { key: 'game_demo_mixer_5', max: 120 },
  6: null,
  7: null,
  8: { key: 'game_jardin_8', max: 100 },
};
const MODULE_PASS_RATE = 0.7;

/**
 * Checks if a module is validated (70% quiz required, game score is bonus).
 * Game score is displayed but not required for validation.
 */
export function checkModuleValidation(stepId, quizQuestions) {
  const state = getState();
  const stepAnswers = state.quizAnswered[stepId] || {};
  const totalQ = quizQuestions.length;
  const correctQ = Object.keys(stepAnswers).filter(
    k => stepAnswers[k] === quizQuestions[parseInt(k)].correct
  ).length;
  const quizPct = totalQ > 0 ? correctQ / totalQ : 0;
  const quizPassed = quizPct >= MODULE_PASS_RATE;

  const gameInfo = GAME_MAX_SCORES[stepId];
  let gamePassed = true;
  let gamePct = 1;

  if (gameInfo) {
    const gameScore = state[gameInfo.key] || 0;
    gamePct = gameInfo.max > 0 ? gameScore / gameInfo.max : 0;
    gamePassed = gamePct >= MODULE_PASS_RATE;
  }

  return {
    validated: quizPassed,
    quizPassed,
    gamePassed,
    quizPct: Math.round(quizPct * 100),
    gamePct: Math.round(gamePct * 100),
    hasGame: !!gameInfo,
  };
}

/**
 * Processes a quiz answer: shows feedback, manages combo, awards XP.
 * No longer auto-advances - shows nav buttons instead.
 */
export function handleQuizAnswer(step, qi, idx) {
  const state = getState();
  if (!state.quizAnswered[step.id]) state.quizAnswered[step.id] = {};
  if (state.quizAnswered[step.id][qi] !== undefined) return;

  const quizQuestions = Array.isArray(step.quiz) ? step.quiz : [step.quiz];
  const q = quizQuestions[qi];
  state.quizAnswered[step.id][qi] = idx;
  const isCorrect = idx === q.correct;
  const totalQ = quizQuestions.length;
  const answeredQ = Object.keys(state.quizAnswered[step.id]).length;

  // Visual feedback on options
  const opts = $$(`#quizOptions-${step.id} .quiz-option`);
  opts.forEach((o, i) => {
    if (i === q.correct) o.classList.add('correct');
    if (i === idx && !isCorrect) o.classList.add('incorrect');
    o.style.pointerEvents = 'none';
  });

  // Feedback text
  const feedbackEl = $(`#quizFeedback-${step.id}`);
  feedbackEl.innerHTML = `<div class="quiz-feedback ${isCorrect ? 'correct pulse-in' : 'incorrect shake'}">
        <i class="fas ${isCorrect ? 'fa-check-circle' : 'fa-times-circle'}"></i>
        <div>${isCorrect ? '<strong>Excellent !</strong><br>' + q.feedback : '<strong>Pas tout \u00e0 fait.</strong><br>La bonne r\u00e9ponse est : ' + q.options[q.correct]}</div>
    </div>`;

  // Progress bar
  const progressFill = $(`#quizCard-${step.id} .quiz-progress-fill`);
  if (progressFill) progressFill.style.width = `${Math.round((answeredQ / totalQ) * 100)}%`;
  // Also update inline progress
  const inlineFill = $(`#quizSlide-${step.id} .quiz-progress-inline-fill`);
  if (inlineFill) inlineFill.style.width = `${Math.round((answeredQ / totalQ) * 100)}%`;
  const inlinePct = $(`#quizSlide-${step.id} .quiz-progress-pct`);
  if (inlinePct) inlinePct.textContent = `${Math.round((answeredQ / totalQ) * 100)}%`;

  if (isCorrect) {
    state.comboStreak++;
    if (state.comboStreak >= COMBO_THRESHOLD) showComboOverlay(state.comboStreak);
    triggerConfetti();
    addXP(XP_PER_CORRECT, 'quiz');
  } else {
    state.comboStreak = 0;
  }

  saveState();
  updateHeader();

  // Show navigation buttons (no auto-advance)
  showQuizNav(feedbackEl, step, qi, quizQuestions, answeredQ);
}

function showQuizNav(feedbackEl, step, qi, quizQuestions, answeredQ) {
  const totalQ = quizQuestions.length;
  let navHtml = '<div class="quiz-nav-buttons">';

  if (qi > 0) {
    navHtml += `<button class="btn btn-secondary quiz-nav-prev"><i class="fas fa-arrow-left"></i> Pr\u00e9c\u00e9dent</button>`;
  }

  if (answeredQ >= totalQ && qi === totalQ - 1) {
    navHtml += `<button class="btn btn-primary quiz-nav-next quiz-nav-results"><i class="fas fa-poll"></i> Voir les r\u00e9sultats</button>`;
  } else if (qi < totalQ - 1) {
    navHtml += `<button class="btn btn-primary quiz-nav-next">Suivant <i class="fas fa-arrow-right"></i></button>`;
  }

  navHtml += '</div>';
  feedbackEl.innerHTML += navHtml;

  const prevBtn = feedbackEl.querySelector('.quiz-nav-prev');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => navigateToQuestion(step, qi - 1, quizQuestions));
  }

  const nextBtn = feedbackEl.querySelector('.quiz-nav-next');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (nextBtn.classList.contains('quiz-nav-results')) {
        showResultsWithAnim(step, quizQuestions);
      } else {
        navigateToQuestion(step, qi + 1, quizQuestions);
      }
    });
  }
}

function navigateToQuestion(step, targetQi, quizQuestions) {
  const slide = $(`#quizSlide-${step.id}`);
  if (!slide) return;
  slide.classList.add('quiz-slide-out');

  setTimeout(() => {
    const carousel = $(`#quizCarousel-${step.id}`);
    if (!carousel) return;
    renderQuestion(carousel, step, targetQi, quizQuestions);
  }, SLIDE_ANIM_DURATION);
}

function renderQuestion(carousel, step, qi, quizQuestions) {
  const state = getState();
  const nq = quizQuestions[qi];
  const stepAnswers = state.quizAnswered[step.id] || {};
  const totalQ = quizQuestions.length;
  const answeredQ = Object.keys(stepAnswers).length;
  const alreadyAnswered = stepAnswers[qi] !== undefined;

  carousel.innerHTML = `
    <div class="quiz-slide quiz-slide-in active" id="quizSlide-${step.id}">
      <div class="quiz-header-bar">
        <span class="quiz-q-label">Question ${qi + 1} sur ${totalQ}</span>
        <div class="quiz-progress-inline"><div class="quiz-progress-inline-fill" style="width:${Math.round((answeredQ / totalQ) * 100)}%"></div><span class="quiz-progress-pct">${Math.round((answeredQ / totalQ) * 100)}%</span></div>
      </div>
      <div class="quiz-question">${nq.question}</div>
      <div class="quiz-options" id="quizOptions-${step.id}">
        ${nq.options.map((o, i) => `
          <div class="quiz-option${alreadyAnswered && i === nq.correct ? ' correct' : ''}${alreadyAnswered && i === stepAnswers[qi] && stepAnswers[qi] !== nq.correct ? ' incorrect' : ''}" data-idx="${i}" ${alreadyAnswered ? 'style="pointer-events:none"' : ''}>
            <div class="opt-letter">${LETTERS[i]}</div>
            <div>${o}</div>
          </div>
        `).join('')}
      </div>
      <div id="quizFeedback-${step.id}"></div>
    </div>`;

  if (alreadyAnswered) {
    const isCorrect = stepAnswers[qi] === nq.correct;
    const feedbackEl = $(`#quizFeedback-${step.id}`);
    feedbackEl.innerHTML = `<div class="quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}">
        <i class="fas ${isCorrect ? 'fa-check-circle' : 'fa-times-circle'}"></i>
        <div>${isCorrect ? '<strong>Excellent !</strong><br>' + nq.feedback : '<strong>Pas tout \u00e0 fait.</strong><br>La bonne r\u00e9ponse est : ' + nq.options[nq.correct]}</div>
    </div>`;
    showQuizNav(feedbackEl, step, qi, quizQuestions, answeredQ);
  } else {
    $$(`#quizOptions-${step.id} .quiz-option`).forEach(opt => {
      opt.addEventListener('click', () => handleQuizAnswer(step, qi, parseInt(opt.dataset.idx)));
    });
  }
}

function showResultsWithAnim(step, quizQuestions) {
  const slide = $(`#quizSlide-${step.id}`);
  if (slide) slide.classList.add('quiz-slide-out');

  setTimeout(() => {
    const carousel = $(`#quizCarousel-${step.id}`);
    if (!carousel) return;
    renderQuizResults(carousel, step, quizQuestions);
  }, SLIDE_ANIM_DURATION);
}

function renderQuizResults(carousel, step, quizQuestions) {
  const state = getState();
  const totalQ = quizQuestions.length;
  const answeredQ = Object.keys(state.quizAnswered[step.id]).length;
  const correctQ = Object.keys(state.quizAnswered[step.id]).filter(k =>
    state.quizAnswered[step.id][k] === quizQuestions[parseInt(k)].correct
  ).length;
  const passed = correctQ >= Math.ceil(totalQ * QUIZ_PASS_RATE);
  const xpEarned = correctQ * XP_PER_CORRECT;

  carousel.innerHTML = `
    <div class="quiz-slide quiz-slide-in active">
      <div class="quiz-result-panel">
        <div class="quiz-result-icon ${passed ? 'success' : 'fail'}">
          <i class="fas ${passed ? 'fa-trophy' : 'fa-rotate-right'}"></i>
        </div>
        <div class="quiz-result-score">${correctQ}/${totalQ}</div>
        <div class="quiz-result-label">${passed ? 'Quiz r\u00e9ussi !' : 'Quiz non valid\u00e9'}</div>
        <div class="quiz-result-sub">${passed ? 'Vous ma\u00eetrisez ce module.' : 'Il faut au moins ' + Math.ceil(totalQ * QUIZ_PASS_RATE) + '/' + totalQ + ' bonnes r\u00e9ponses.'}</div>
        <div class="quiz-result-stats">
          <div class="quiz-result-stat correct"><i class="fas fa-check"></i> ${correctQ} correcte${correctQ > 1 ? 's' : ''}</div>
          <div class="quiz-result-stat incorrect"><i class="fas fa-times"></i> ${answeredQ - correctQ} incorrecte${(answeredQ - correctQ) > 1 ? 's' : ''}</div>
          <div class="quiz-result-stat xp"><i class="fas fa-bolt"></i> ${xpEarned} XP gagn\u00e9s</div>
        </div>
        <div class="quiz-restart-wrap"><button class="btn btn-primary quiz-restart-btn"><i class="fas fa-redo"></i> Recommencer le quiz</button></div>
      </div>
    </div>`;
  // Check full module validation (game + quiz)
  const validation = checkModuleValidation(step.id, quizQuestions);

  if (passed) {
    triggerConfetti();
    if (validation.validated) {
      tryUnlockBadge('b' + step.id);
      // Mark module as completed in sidebar
      const _st = getState();
      if (!_st.completedSteps.includes(step.id)) {
        _st.completedSteps.push(step.id);
        saveState();
        updateSidebar();
      }
    }
  }

  // Show game score status if game exists for this module
  if (validation.hasGame && validation.gamePct > 0) {
    const gameStatusEl = carousel.querySelector('.quiz-result-panel');
    if (gameStatusEl) {
      const gameHtml = document.createElement('div');
      gameHtml.className = 'quiz-game-status';
      gameHtml.innerHTML = '<div class="quiz-game-status-title"><i class="fas fa-gamepad"></i> Score du Jeu (bonus)</div>' +
        '<div class="quiz-game-status-bar"><div class="quiz-game-status-fill" style="width:' + validation.gamePct + '%;background:' + (validation.gamePassed ? 'var(--success,#10b981)' : 'var(--warning,#f59e0b)') + '"></div></div>' +
        '<div class="quiz-game-status-text">' + validation.gamePct + '% ' + (validation.gamePassed ? '<i class="fas fa-check"></i>' : '') + '</div>';
      gameStatusEl.appendChild(gameHtml);
    }
  }

  // Show validation summary
  if (passed) {
    const panel = carousel.querySelector('.quiz-result-panel');
    if (panel) {
      const summaryEl = document.createElement('div');
      summaryEl.className = 'quiz-validation-summary ' + (validation.validated ? 'validated' : 'not-validated');
      if (validation.validated) {
        summaryEl.innerHTML = '<i class="fas fa-award"></i> Module valid\u00e9 ! Badge d\u00e9bloqu\u00e9';
      } else if (!validation.gamePassed) {
        summaryEl.innerHTML = '<i class="fas fa-gamepad"></i> Jouez au Jeu pour am\u00e9liorer votre score !';
      }
      panel.appendChild(summaryEl);
    }
  }

  const restartBtn = carousel.querySelector('.quiz-restart-btn');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      state.quizAnswered[step.id] = {};
      state.comboStreak = 0;
      saveState();
      updateHeader();
      const progressFill = $(`#quizCard-${step.id} .quiz-progress-fill`);
      if (progressFill) progressFill.style.width = '0%';
      renderQuestion(carousel, step, 0, quizQuestions);
    });
  }
}

export { LETTERS, XP_PER_CORRECT, QUIZ_PASS_RATE, MODULE_PASS_RATE, GAME_MAX_SCORES };
