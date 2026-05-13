import { STEPS } from '../data.js?v=81';
import { EXAM_QUESTIONS } from '../exam-data.js?v=81';
import { getState, saveState } from '../state.js?v=81';
import { addXP, triggerConfetti } from '../notifications.js?v=81';
import { updateSidebar } from './sidebar.js?v=81';
import { navigateTo, $ } from '../router.js?v=81';
import { LETTERS } from '../quiz.js?v=83';

const EXAM_DURATION_SECONDS = 25 * 60;
const EXAM_QUESTION_COUNT = EXAM_QUESTIONS.length;
const PASS_PERCENT = 77;
const EXAM_PASS_COUNT = Math.ceil(EXAM_QUESTION_COUNT * PASS_PERCENT / 100);
const EXAM_PASS_XP = 200;
const WARNING_THRESHOLD = 60;

let examTimerId = null;
let examTimeLeft = 0;
let examAnswers = [];
let examStartTime = 0;

export function cleanupExam() {
  if (examTimerId) {
    clearInterval(examTimerId);
    examTimerId = null;
  }
}

/**
 * Renders the exam view (start page, in-progress, or results).
 * @param {HTMLElement} main - The main content container.
 */
export function renderExam(main) {
  if (examTimerId) { renderExamInProgress(main); return; }
  const state = getState();
  if (state.examScore !== null) { renderExamResults(main); return; }

  // === MODULE COMPLETION GATE ===
  const completedIds = state.completedSteps || [];
  const allModuleIds = STEPS.map(s => s.id);
  const missingIds = allModuleIds.filter(id => !completedIds.includes(id));
  if (missingIds.length > 0) {
    const missingList = missingIds.map(id => {
      const step = STEPS.find(s => s.id === id);
      return `<div class="exam-missing-module" onclick="document.querySelector('.nav-item[data-view=step-${id}]').click()" style="cursor:pointer" title="Aller au module ${id}"><i class="fas fa-times-circle"></i> <span>Module ${id} : ${step ? step.title : 'Inconnu'}</span></div>`;
    }).join('');
    const doneCount = allModuleIds.length - missingIds.length;
    const progressPct = Math.round((doneCount / allModuleIds.length) * 100);
    main.innerHTML = `
      <div class="breadcrumb"><i class="fas fa-clipboard-check"></i> Examen</div>
      <h1 class="view-title">Examen Final</h1>
      <p class="view-subtitle">Testez vos connaissances sur l'ensemble de la formation.</p>
      <style>
.exam-locked-card{background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);border-radius:20px;padding:48px 40px;text-align:center;color:#fff;max-width:600px;margin:30px auto;box-shadow:0 20px 60px rgba(0,0,0,.3)}
.exam-locked-icon{width:90px;height:90px;border-radius:50%;background:linear-gradient(135deg,#e94560,#c23152);display:flex;align-items:center;justify-content:center;margin:0 auto 24px;font-size:36px;box-shadow:0 10px 30px rgba(233,69,96,.4);animation:pulse-lock 2s infinite}
@keyframes pulse-lock{0%,100%{transform:scale(1);box-shadow:0 10px 30px rgba(233,69,96,.4)}50%{transform:scale(1.05);box-shadow:0 15px 40px rgba(233,69,96,.6)}}
.exam-locked-card h2{font-size:28px;margin-bottom:12px;color:#fff}
.exam-locked-desc{font-size:16px;line-height:1.6;color:rgba(255,255,255,.85);margin-bottom:24px}
.exam-locked-desc strong{color:#e94560}
.exam-locked-progress{background:rgba(255,255,255,.15);border-radius:12px;height:12px;overflow:hidden;margin-bottom:8px}
.exam-locked-progress-bar{height:100%;background:linear-gradient(90deg,#e94560,#ff6b6b);border-radius:12px;transition:width .6s ease}
.exam-locked-progress-text{font-size:14px;color:rgba(255,255,255,.7);margin-bottom:24px}
.exam-locked-subtitle{font-size:15px;font-weight:600;color:rgba(255,255,255,.9);margin-bottom:12px;text-transform:uppercase;letter-spacing:1px}
.exam-missing-list{display:flex;flex-direction:column;gap:8px;margin-bottom:8px}
.exam-missing-module{display:flex;align-items:center;gap:10px;background:rgba(233,69,96,.15);border:1px solid rgba(233,69,96,.3);border-radius:10px;padding:10px 16px;font-size:14px;color:rgba(255,255,255,.9)}
.exam-missing-module i{color:#e94560;font-size:16px;flex-shrink:0}
.exam-missing-module:hover{background:rgba(233,69,96,.25);transform:translateX(4px);transition:all .2s ease}
</style>
      <div class="exam-locked-card">
        <div class="exam-locked-icon"><i class="fas fa-lock"></i></div>
        <h2>Examen verrouill\u00e9</h2>
        <p class="exam-locked-desc">Vous devez <strong>valider tous les modules</strong> avant de pouvoir passer l'examen final et obtenir votre <strong>certification Symbiose</strong>.</p>
        <div class="exam-locked-progress">
          <div class="exam-locked-progress-bar" style="width:${progressPct}%"></div>
        </div>
        <div class="exam-locked-progress-text">${doneCount} / ${allModuleIds.length} modules valid\u00e9s</div>
        <div class="exam-locked-subtitle">Modules restants :</div>
        <div class="exam-missing-list">${missingList}</div>
        <button class="btn btn-primary" onclick="document.querySelector('.nav-item[data-view=step-'+${missingIds[0]}+']').click()" style="margin-top:20px">
          <i class="fas fa-arrow-right"></i> Aller au module ${missingIds[0]}
        </button>
      </div>
    `;
    return;
  }
  // === END MODULE GATE ===


  main.innerHTML = `
    <div class="breadcrumb"><i class="fas fa-clipboard-check"></i> Examen</div>
    <h1 class="view-title">Examen Final</h1>
    <p class="view-subtitle">Testez vos connaissances sur l'ensemble de la formation.</p>
    <div class="exam-start-card">
      <div class="exam-hero">
        <div class="exam-hero-icon exam"><i class="fas fa-clipboard-check"></i></div>
        <h2>Pr\u00eat pour l'examen final ?</h2>
        <div class="exam-tags">
          <span class="exam-tag"><i class="fas fa-list-ol"></i> ${EXAM_QUESTION_COUNT} questions</span>
          <span class="exam-tag"><i class="fas fa-clock"></i> 25 minutes</span>
          <span class="exam-tag"><i class="fas fa-percent"></i> ${EXAM_PASS_COUNT}/${EXAM_QUESTION_COUNT} requis</span>
        </div>
        <p>R\u00e9pondez \u00e0 ${EXAM_QUESTION_COUNT} questions sur l'ensemble de la formation. Obtenez au moins <strong>${EXAM_PASS_COUNT}/${EXAM_QUESTION_COUNT}</strong> pour devenir <strong>Certifi\u00e9 Symbiose</strong> !</p>
        <button class="btn btn-primary" id="btnStartExam" style="font-size:16px;padding:16px 32px">
          <i class="fas fa-play"></i> Commencer l'examen
        </button>
      </div>
    </div>
  `;
  $('#btnStartExam').addEventListener('click', startExam);
}

function startExam() {
  examTimeLeft = EXAM_DURATION_SECONDS;
  examAnswers = new Array(EXAM_QUESTION_COUNT).fill(null);
  examStartTime = Date.now();
  const state = getState();
  state.examScore = null;
  state.examPassed = false;
  state.examDuration = null;
  saveState();
  examTimerId = setInterval(() => {
    examTimeLeft--;
    updateExamTimer();
    if (examTimeLeft <= 0) { clearInterval(examTimerId); examTimerId = null; submitExam(); }
  }, 1000);
  renderExamInProgress($('#mainContent'));
}

function renderExamInProgress(main) {
  const mins = Math.floor(examTimeLeft / 60);
  const secs = examTimeLeft % 60;
  let html = `
    <div class="exam-bar">
      <div class="exam-timer ${examTimeLeft <= WARNING_THRESHOLD ? 'warning' : ''}" id="examTimerEl">
        <i class="fas fa-clock"></i>
        <span id="timerDisplay">${mins}:${secs.toString().padStart(2, '0')}</span>
      </div>
      <div class="exam-progress-text" id="examProgText">${examAnswers.filter(a => a !== null).length}/${EXAM_QUESTION_COUNT} r\u00e9pondues</div>
    </div>
  `;
  EXAM_QUESTIONS.forEach((q, qi) => {
    html += `
      <div class="eq-card fade-in" style="animation-delay:${.02 * qi}s">
        <div class="eq-header"><div class="eq-num">${qi + 1}</div><div class="eq-text">${q.q}</div></div>
        <div class="quiz-options" data-eq="${qi}">
          ${q.o.map((o, oi) => `
            <div class="quiz-option ${examAnswers[qi] === oi ? 'selected' : ''}" data-qi="${qi}" data-oi="${oi}">
              <div class="opt-letter">${LETTERS[oi]}</div>
              <div>${o}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  });
  html += `
    <div class="button-row" style="justify-content:center;padding-bottom:40px">
      <button class="btn btn-success" id="btnSubmitExam" style="font-size:16px;padding:16px 32px">
        <i class="fas fa-check"></i> Soumettre l'examen
      </button>
    </div>
  `;
  main.innerHTML = html;
  main.querySelectorAll('.quiz-option[data-qi]').forEach(opt => {
    opt.addEventListener('click', () => {
      const qi = parseInt(opt.dataset.qi);
      const oi = parseInt(opt.dataset.oi);
      examAnswers[qi] = oi;
      main.querySelectorAll(`[data-eq="${qi}"] .quiz-option`).forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      const prog = $('#examProgText');
      if (prog) prog.textContent = `${examAnswers.filter(a => a !== null).length}/${EXAM_QUESTION_COUNT} r\u00e9pondues`;
    });
  });
  $('#btnSubmitExam').addEventListener('click', () => { clearInterval(examTimerId); examTimerId = null; submitExam(); });
}

function updateExamTimer() {
  const display = $('#timerDisplay');
  const timer = $('#examTimerEl');
  if (!display) return;
  const mins = Math.floor(examTimeLeft / 60);
  const secs = examTimeLeft % 60;
  display.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
  if (timer && examTimeLeft <= WARNING_THRESHOLD) timer.classList.add('warning');
}

function submitExam() {
    const duration = Math.round((Date.now() - examStartTime) / 1000);
    const btn = document.getElementById('btnSubmitExam');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Correction en cours...'; }
    fetch('/api/exam.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: examAnswers })
    })
    .then(r => r.json())
    .then(data => {
        const state = getState();
        state.examScore = data.pct;
        state.examPassed = data.passed;
        state.examCorrect = data.correct;
        state.examTotal = data.total;
        state.examDuration = duration;
        if (state.examPassed) {
            addXP(EXAM_PASS_XP);
            triggerConfetti();
        }
        saveState();
        updateSidebar();
        renderExamResults($('#mainContent'));
    })
    .catch(() => {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-check"></i> Soumettre l\'examen'; }
        alert('Erreur de connexion. Veuillez r\u00e9essayer.');
    });
}

function renderExamResults(main) {
  const state = getState();
  const passed = state.examPassed;
  const score = state.examScore;
  const correct = state.examCorrect || Math.round((score / 100) * EXAM_QUESTION_COUNT);
    const total = state.examTotal || EXAM_QUESTION_COUNT;
  main.innerHTML = `
    <div class="breadcrumb"><i class="fas fa-clipboard-check"></i> R\u00e9sultats</div>
    <h1 class="view-title">R\u00e9sultats de l'examen</h1>
    <div class="card">
      <div class="exam-hero">
        <div class="exam-hero-icon ${passed ? 'trophy' : 'fail'}"><i class="fas ${passed ? 'fa-trophy' : 'fa-times'}"></i></div>
        <h2>${passed ? 'F\u00e9licitations !' : 'Pas encore cette fois'}</h2>
        <div class="result-score" style="color:${passed ? 'var(--success)' : 'var(--danger)'}">${correct}/${total} (${score}%)</div>
        <p>${passed ? 'Vous avez r\u00e9ussi l\'examen ! Vous \u00eates d\u00e9sormais <strong>Certifi\u00e9 Symbiose</strong>. Votre certificat est disponible.' : `Score minimum requis : ${Math.ceil(total * PASS_PERCENT / 100)}/${total}. R\u00e9visez les \u00e9tapes et r\u00e9essayez !`}</p>
        <div class="button-row" style="justify-content:center">
          <button class="btn btn-secondary" id="btnRetake"><i class="fas fa-rotate-right"></i> Repasser</button>
          ${passed ? '<button class="btn btn-primary" id="btnCert"><i class="fas fa-certificate"></i> Voir le certificat</button>' : ''}
        </div>
      </div>
    </div>
  `;
  $('#btnRetake').addEventListener('click', () => {
    state.examScore = null; state.examPassed = false; state.examDuration = null;
    saveState(); renderExam(main);
  });
  const certBtn = $('#btnCert');
  if (certBtn) certBtn.addEventListener('click', () => navigateTo('certificate'));
}
