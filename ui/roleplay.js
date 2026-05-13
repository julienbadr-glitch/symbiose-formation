import { ROLEPLAY_SCENARIOS, getScenarioResponse } from '../roleplay.js?v=81_15';
import { isSpeechSupported, initSpeechRecognition, startListening, stopListening, isCurrentlyListening, speakText, unlockSpeechSynthesis } from '../speech.js?v=81';
import { getState } from '../state.js?v=81';
import { addXP, triggerConfetti } from '../notifications.js?v=81';
import { updateSidebar } from './sidebar.js?v=81';
import { getNextStep } from './home.js?v=81';
import { navigateTo, $ } from '../router.js?v=81';

const MAX_TURNS = { debutant: 8, intermediaire: 10, expert: 12 };
const EVAL_TURN = 5;
const BOT_DELAY_BASE = 800;
const BOT_DELAY_VARIANCE = 1200;
const GREETING_DELAY = 600;
const FINISH_DELAY = 1000;

let activeRoleplayState = null;
let selectedDifficulty = 'intermediaire';
let usedResponseIndices = new Set();

/**
 * Returns the display label for a difficulty level.
 * @param {string} diff - Difficulty code.
 * @returns {string} Human-readable label.
 */
function getDifficultyLabel(diff) {
  const labels = { debutant: 'Debutant', intermediaire: 'Intermediaire', expert: 'Expert' };
  return labels[diff] || 'Intermediaire';
}

/**
 * Escapes HTML special characters in user input.
 * @param {string} str - Raw string.
 * @returns {string} Escaped string.
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Adds a user message to the chat display and roleplay state.
 */
function addUserMessage(text) {
  const container = $('#rpMessages');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'rp-msg rp-msg-user fade-in';
  div.innerHTML = `
    <div class="rp-msg-bubble user">
      <div class="rp-msg-text">${escapeHtml(text)}</div>
    </div>
    <div class="rp-msg-avatar user">CD</div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  if (activeRoleplayState) {
    activeRoleplayState.messages.push({ role: 'user', text });
    activeRoleplayState.started = true;
  }
}

/**
 * Adds a bot/NPC message to chat, triggers text-to-speech if roleplay started.
 */
function addBotMessage(text, scenario) {
  const container = $('#rpMessages');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'rp-msg rp-msg-bot fade-in';
  div.innerHTML = `
    <div class="rp-msg-avatar bot ${scenario.color}">${scenario.clientAvatar}</div>
    <div class="rp-msg-bubble bot">
      <div class="rp-msg-text">${text}</div>
    </div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  if (activeRoleplayState) {
    activeRoleplayState.messages.push({ role: 'bot', text });
    if (activeRoleplayState.started) {
      speakText(text);
    }
  }
}

/**
 * Shows animated typing indicator while bot formulates response.
 */
function showTypingIndicator(scenario) {
  const container = $('#rpMessages');
  if (!container) return null;
  const div = document.createElement('div');
  div.className = 'rp-msg rp-msg-bot rp-typing-msg';
  div.innerHTML = `
    <div class="rp-msg-avatar bot ${scenario.color}">${scenario.clientAvatar}</div>
    <div class="rp-msg-bubble bot">
      <div class="rp-typing">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

/**
 * Ends roleplay session, awards XP, shows completion card.
 */

/**
 * Shows a choice popup at turn 5: continue or get evaluation
 */
function showTurn5ChoicePopup(scenario) {
  const container = $('#rpMessages');
  if (!container) return;
  const inputArea = document.querySelector('.rp-input-area');
  if (inputArea) inputArea.style.display = 'none';

  const div = document.createElement('div');
  div.className = 'rp-eval-choice';
  div.innerHTML = `
    <div class="rp-eval-choice-card">
      <div class="rp-eval-choice-icon"><i class="fas fa-trophy"></i></div>
      <h3>Tour 5 atteint !</h3>
      <p>Vous avez complete 5 tours d'echange. Que souhaitez-vous faire ?</p>
      <div class="rp-eval-choice-buttons">
        <button class="btn btn-primary" id="rpContinueBtn"><i class="fas fa-comments"></i> Continuer l'echange</button>
        <button class="btn btn-success" id="rpEvaluateBtn"><i class="fas fa-star"></i> Voir mon evaluation</button>
      </div>
    </div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;

  document.getElementById('rpContinueBtn').addEventListener('click', () => {
    div.remove();
    if (inputArea) inputArea.style.display = '';
    // Continue normally - the next send will proceed past turn 5
  });

  document.getElementById('rpEvaluateBtn').addEventListener('click', () => {
    div.remove();
    requestEvaluation(scenario);
  });
}

/**
 * Calls api-evaluate.php and displays the AI evaluation
 */
function requestEvaluation(scenario) {
  const container = $('#rpMessages');
  if (!container) return;
  const inputArea = document.querySelector('.rp-input-area');
  if (inputArea) inputArea.style.display = 'none';
  activeRoleplayState.finished = true;

  // Show loading
  const loadDiv = document.createElement('div');
  loadDiv.className = 'rp-eval-loading';
  loadDiv.innerHTML = '<div class="rp-eval-loading-spinner"><i class="fas fa-spinner fa-spin"></i> Analyse de votre performance en cours...</div>';
  container.appendChild(loadDiv);
  container.scrollTop = container.scrollHeight;

  let _token = "";
  try { const _s = JSON.parse(localStorage.getItem("symbiose_session") || "{}"); _token = _s.token || ""; } catch(e){}

  fetch("/api-evaluate.php", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + _token },
    body: JSON.stringify({
      messages: activeRoleplayState.messages.map(m => ({ role: m.role === "bot" ? "assistant" : "user", content: m.text })),
      difficulty: activeRoleplayState.difficulty || "debutant",
      turnCount: activeRoleplayState.turnCount,
      scenario: { clientName: scenario.clientName, clientRole: scenario.clientRole, clientCompany: scenario.clientCompany, context: scenario.context, objective: scenario.objective }
    })
  })
  .then(r => r.json())
  .then(data => {
    loadDiv.remove();
    if (data.evaluation) {
      displayEvaluation(data.evaluation, scenario);
    } else {
      displayEvaluation({ score: 50, xpEarned: 20, grade: 'C', summary: 'Evaluation non disponible.', strengths: ['Participation'], improvements: ['Reessayez'], tip: 'Continuez a pratiquer.' }, scenario);
    }
  })
  .catch(err => {
    console.error("Eval error:", err);
    loadDiv.remove();
    displayEvaluation({ score: 50, xpEarned: 20, grade: 'C', summary: 'Evaluation non disponible.', strengths: ['Participation'], improvements: ['Reessayez'], tip: 'Continuez a pratiquer.' }, scenario);
  });
}

/**
 * Displays the evaluation results with XP, grade, strengths, improvements
 */
function displayEvaluation(ev, scenario) {
  try{const _bs=JSON.parse(localStorage.getItem('symbiose_best_scores')||'{}');const _k=scenario.id||scenario.title;if(!_bs[_k]||ev.score>_bs[_k].score){_bs[_k]={score:ev.score,grade:ev.grade,xpEarned:ev.score,xpMax:scenario.xpReward};}localStorage.setItem('symbiose_best_scores',JSON.stringify(_bs));}catch(e){console.warn('Save err',e);}
  const msgArea = document.getElementById('rpMessages');
  const inputArea = document.querySelector('.rp-input-area');
  if (inputArea) inputArea.style.display = 'none';
  const scoreOffset = 283 - (283 * ev.score / 100);
  const gradeColors = {A:'#34d399',B:'#60a5fa',C:'#fbbf24',D:'#fb923c',E:'#f87171'};
  const gaugeColor = gradeColors[ev.grade] || '#6366f1';
  const strengthsHtml = (ev.strengths||[]).map(s => '<li>' + escapeHtml(s) + '</li>').join('');
  const improvHtml = (ev.improvements||[]).map(i => '<li>' + escapeHtml(i) + '</li>').join('');
  const card = document.createElement('div');
  card.className = 'rp-eval-overlay';
  card.innerHTML = '<div class="rp-eval-card">'
    + '<button class="rp-eval-close" onclick="window.resumeAfterEval()">&times;</button>'
    + '<div class="rp-eval-hero">'
    + '<h2>Votre Performance</h2>'
    + '<div class="rp-eval-gauge">'
    + '<svg viewBox="0 0 100 100"><circle class="gauge-bg" cx="50" cy="50" r="45"/>'
    + '<circle class="gauge-fill" cx="50" cy="50" r="45" style="stroke:' + gaugeColor + ';--score-offset:' + scoreOffset + ';stroke-dashoffset:' + scoreOffset + '"/></svg>'
    + '<div class="rp-eval-gauge-center"><span class="rp-eval-gauge-score">' + ev.score + '</span><span class="rp-eval-gauge-label">/ 100</span></div>'
    + '</div>'
    + '<div class="rp-eval-grade-badge"><span class="rp-eval-grade-letter">Grade ' + ev.grade + '</span><span class="rp-eval-grade-xp">+' + ev.xpEarned + ' XP</span></div>'
    + '</div>'
    + '<div class="rp-eval-summary">' + escapeHtml(ev.summary) + '</div>'
    + '<div class="rp-eval-body">'
    + '<div class="rp-eval-grid">'
    + '<div class="rp-eval-section strengths"><div class="rp-eval-section-title">Points forts</div><ul>' + strengthsHtml + '</ul></div>'
    + '<div class="rp-eval-section improvements"><div class="rp-eval-section-title">Axes de progres</div><ul>' + improvHtml + '</ul></div>'
    + '</div>'
    + '<div class="rp-eval-tip-section"><div class="rp-eval-tip-title">Conseil du coach</div><div class="rp-eval-tip-text">' + escapeHtml(ev.tip) + '</div></div>'
    + '</div>'
    + '<div class="rp-eval-actions">'
      + '<button class="btn-continue" onclick="window.resumeAfterEval()">Continuer l\'\u00e9change</button>'
    + '<button class="btn-restart" onclick="document.querySelector(\'.rp-eval-overlay\').remove();startRoleplay(\'' + scenario.id + '\')">Recommencer</button>'
    + '<button class="btn-other" onclick="document.querySelector(\'.rp-eval-overlay\').remove();showRoleplayList()">Autres simulations</button>'
    + '</div></div>';
  msgArea.appendChild(card);
  // XP added in roleplay-ui.js
  if (typeof triggerConfetti === 'function') triggerConfetti();
}
// Global function to resume conversation after evaluation
window.resumeAfterEval = function() {
  const overlay = document.querySelector('.rp-eval-overlay');
  if (overlay) overlay.remove();
  const ia = document.querySelector('.rp-input-area');
  if (ia) ia.style.display = '';
  activeRoleplayState.finished = false;
};

function finishRoleplay(scenario) {
  if (!activeRoleplayState) return;
  activeRoleplayState.finished = true;

  const inputBar = $('#rpInputBar');
  if (inputBar) inputBar.style.display = 'none';

  // XP now added in roleplay-ui.js only

  const container = $('#rpMessages');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'rp-end-card fade-in';
  div.innerHTML = `
    <div class="rp-end-icon"><i class="fas fa-flag-checkered"></i></div>
    <h3>Simulation termin\u00e9e</h3>
    <p>Vous avez compl\u00e9t\u00e9 le sc\u00e9nario "${scenario.title}" en ${activeRoleplayState.turnCount} tours.</p>
    <div class="rp-end-xp"><i class="fas fa-bolt"></i> +${scenario.xpReward} XP gagn\u00e9s</div>
    <div class="rp-end-tips">
      <div class="rp-end-tip-title"><i class="fas fa-lightbulb"></i> Conseils pour progresser</div>
      <ul>
        <li>Posez des questions ouvertes pour faire parler le client</li>
        <li>Reformulez pour montrer votre compr\u00e9hension</li>
        <li>Identifiez les douleurs avant de proposer des solutions</li>
        <li>Concluez toujours avec une prochaine \u00e9tape claire</li>
      </ul>
    </div>
    <div class="rp-end-actions">
      <button class="btn btn-secondary" id="rpRetryBtn"><i class="fas fa-rotate-right"></i> Recommencer</button>
      <button class="btn btn-primary" id="rpBackHubBtn"><i class="fas fa-masks-theater"></i> Autres simulations</button>
    </div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;

  triggerConfetti();

  div.querySelector('#rpRetryBtn').addEventListener('click', () => navigateTo(`roleplay-${scenario.id}`));
  div.querySelector('#rpBackHubBtn').addEventListener('click', () => navigateTo('roleplay'));
}

/**
 * Renders the roleplay scenarios gallery.
 * @param {HTMLElement} main - The main content container.
 */
export function renderRoleplayHub(main) {
  let html = `
    <div class="breadcrumb"><i class="fas fa-masks-theater"></i> Simulations</div>
    <h1 class="view-title">Jeux de R\u00f4le</h1>
    <p class="view-subtitle">Entra\u00eenez-vous \u00e0 travers des sc\u00e9narios de vente r\u00e9alistes. Chaque simulation vous met face \u00e0 un prospect virtuel.</p>
    <div class="rp-grid">
  `;

  ROLEPLAY_SCENARIOS.forEach((s, i) => {
    const diffNorm = s.difficulty.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const diffClass = diffNorm.startsWith('deb') ? 'diff-easy' : diffNorm.startsWith('inter') ? 'diff-medium' : 'diff-hard';
    html += `
      <div class="rp-card fade-in" data-scenario="${s.id}" style="animation-delay:${.06 * i}s">
        <div class="rp-card-header">
          <div class="rp-card-icon ${s.color}"><i class="fas ${s.icon}"></i></div>
          <div class="rp-card-diff ${diffClass}"><i class="fas ${diffClass === 'diff-easy' ? 'fa-seedling' : diffClass === 'diff-medium' ? 'fa-fire' : 'fa-bolt'}"></i> ${s.difficulty}</div>
        </div>
        <h3 class="rp-card-title">${s.title}</h3>
        <p class="rp-card-desc">${s.desc}</p>
        <div class="rp-card-meta">
          <span class="rp-card-client"><i class="fas fa-user-tie"></i> ${s.clientName} - ${s.clientRole}</span>
          ${(()=>{try{const _b=JSON.parse(localStorage.getItem("symbiose_best_scores")||"{}");const d=_b[s.id];if(d&&d.score!==undefined){const pct=Math.round(d.score/s.xpReward*100);return '<div class="rp-xp-block"><div class="rp-xp-top"><i class="fas fa-bolt rp-xp-icon"></i><span class="rp-xp-text">'+d.score+' / '+s.xpReward+' XP</span></div><div class="rp-xp-bar"><div class="rp-xp-fill" style="width:'+pct+'%"></div></div></div>';}}catch(e){}return '<div class="rp-xp-block"><div class="rp-xp-top"><i class="fas fa-bolt rp-xp-icon"></i><span class="rp-xp-text">'+s.xpReward+' XP</span></div></div>';})()}
        </div>
          ${(()=>{try{const _bs=JSON.parse(localStorage.getItem("symbiose_best_scores")||"{}");if(_bs[s.id]){const sc=_bs[s.id].score;const gr=_bs[s.id].grade;const gc={A:"#10b981",B:"#3b82f6",C:"#f59e0b",D:"#ef4444",E:"#6b7280"}[gr]||"#6b7280";const off=Math.round(88-(88*sc/100));return '<div class="rp-score-badge"><svg class="rp-score-ring" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="3"/><circle cx="16" cy="16" r="14" fill="none" stroke="'+gc+'" stroke-width="3" stroke-dasharray="88" stroke-dashoffset="'+off+'" stroke-linecap="round" transform="rotate(-90 16 16)"/></svg><div class="rp-score-info"><span class="rp-score-label">Meilleur score</span><span class="rp-score-value" style="color:'+gc+'">'+sc+'/100</span></div></div>';}}catch(e){}return "";})()}
        <button class="btn btn-primary rp-card-btn">Lancer la simulation <i class="fas fa-arrow-right rp-btn-arrow"></i></button>
      </div>
    `;
  });

  html += `</div>`;
  main.innerHTML = html;

  main.querySelectorAll('.rp-card').forEach(card => {
    const launchWithPicker = () => showDifficultyPicker(card.dataset.scenario);
    card.querySelector('.rp-card-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      launchWithPicker();
    });
    card.addEventListener('click', launchWithPicker);
  });
}

/**
 * Shows modal overlay to select difficulty before starting roleplay.
 * @param {string} scenarioId - The scenario identifier.
 */
function showDifficultyPicker(scenarioId) {
  const scenario = ROLEPLAY_SCENARIOS.find(s => s.id === scenarioId);
  if (!scenario) return;

  const existing = document.getElementById('difficultyOverlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'difficultyOverlay';
  overlay.className = 'diff-overlay fade-in';
  overlay.innerHTML = `
    <div class="diff-modal">
      <button class="diff-close" id="diffCloseBtn"><i class="fas fa-times"></i></button>
      <div class="diff-modal-header">
        <div class="rp-card-icon ${scenario.color}"><i class="fas ${scenario.icon}"></i></div>
        <h2 class="diff-modal-title">${scenario.title}</h2>
        <p class="diff-modal-sub">Choisissez votre niveau de difficulte</p>
      </div>
      <div class="diff-options">
        <button class="diff-option" data-diff="debutant">
          <div class="diff-option-icon debutant"><i class="fas fa-seedling"></i></div>
          <div class="diff-option-info">
            <span class="diff-option-name">Debutant</span>
            <span class="diff-option-desc">Le prospect est bienveillant et guide la conversation. Ideal pour apprendre.</span>
          </div>
          <div class="diff-option-dots">
            <span class="diff-dot active"></span>
            <span class="diff-dot"></span>
            <span class="diff-dot"></span>
          </div>
        </button>
        <button class="diff-option" data-diff="intermediaire">
          <div class="diff-option-icon intermediaire"><i class="fas fa-fire"></i></div>
          <div class="diff-option-info">
            <span class="diff-option-name">Intermediaire</span>
            <span class="diff-option-desc">Le prospect est realiste : il pose des questions pointues et attend du concret.</span>
          </div>
          <div class="diff-option-dots">
            <span class="diff-dot active"></span>
            <span class="diff-dot active"></span>
            <span class="diff-dot"></span>
          </div>
        </button>
        <button class="diff-option" data-diff="expert">
          <div class="diff-option-icon expert"><i class="fas fa-skull-crossbones"></i></div>
          <div class="diff-option-info">
            <span class="diff-option-name">Expert</span>
            <span class="diff-option-desc">Le prospect est froid, press\u00e9 et sceptique. Chaque mot compte.</span>
          </div>
          <div class="diff-option-dots">
            <span class="diff-dot active"></span>
            <span class="diff-dot active"></span>
            <span class="diff-dot active"></span>
          </div>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('#diffCloseBtn').addEventListener('click', () => {
    overlay.classList.add('diff-closing');
    setTimeout(() => overlay.remove(), 250);
  });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.add('diff-closing');
      setTimeout(() => overlay.remove(), 250);
    }
  });

  overlay.querySelectorAll('.diff-option').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedDifficulty = btn.dataset.diff;
      overlay.classList.add('diff-closing');
      setTimeout(() => {
        overlay.remove();
        navigateTo(`roleplay-${scenarioId}`);
      }, 200);
    });
  });
}

/**
 * Renders the roleplay chat interface.
 * @param {HTMLElement} main - The main content container.
 * @param {string} scenarioId - The scenario identifier.
 */
export function trackUsedResponse(scenario, userMessage, usedIndices) {
  const msg = userMessage.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (let i = 0; i < scenario.responses.length; i++) {
    for (const trigger of scenario.responses[i].triggers) {
      const t = trigger.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (msg.includes(t)) {
        usedIndices.add(i);
        break;
      }
    }
  }
}

export function getHintForScenario(scenario, usedIndices) {
  for (let i = 0; i < scenario.responses.length; i++) {
    if (usedIndices.has(i)) continue;
    const r = scenario.responses[i];
    const trigger = r.triggers[0];
    const hintPhrases = {
      'bonjour': 'Essayez de vous presenter et de saluer le client.',
      'entreprise': 'Demandez-lui de vous parler de son entreprise et de son activite.',
      'collaborateurs': 'Renseignez-vous sur la taille de l\'equipe et l\'organisation.',
      'recrutement': 'Abordez le sujet du recrutement et des postes ouverts.',
      'outil': 'Demandez quels outils ou logiciels ils utilisent actuellement.',
      'problème': 'Questionnez sur les difficultes ou defis rencontres.',
      'temps': 'Parlez du temps passe sur les taches administratives.',
      'coût': 'Abordez la question du budget et de l\'investissement.',
      'turnover': 'Demandez-lui quel est le taux de rotation du personnel.',
      'décision': 'Renseignez-vous sur le circuit de decision.',
      'rendez-vous': 'Proposez un prochain rendez-vous ou une prochaine etape.',
      'symbiose': 'Presentez votre solution et ce qu\'elle peut apporter.',
      'formation': 'Parlez de l\'onboarding et de l\'integration des nouveaux.',
      'merci': 'Remerciez et concluez l\'echange.',
      'reformul': 'Reformulez ce que le client vient de vous dire.',
      'comprends': 'Montrez de l\'empathie envers ses preoccupations.',
      'roi': 'Parlez du retour sur investissement concret.',
      'concurrent': 'Abordez la comparaison avec les solutions concurrentes.',
      'progressif': 'Proposez un demarrage progressif, par etapes.',
      'prix': 'Donnez des details sur le tarif et les couts.',
      'accompagnement': 'Rassurez sur l\'accompagnement et le support.',
      'référence': 'Proposez des references clients ou des temoignages.',
      'garantie': 'Parlez des garanties et de la periode d\'essai.',
      'pas le moment': 'Creez un sentiment d\'urgence en montrant le cout de l\'inaction.',
      'complex': 'Rassurez sur la simplicite de la migration et du deploiement.',
      'différence': 'Expliquez ce qui vous differencie de la concurrence.',
      'multi-site': 'Montrez comment gerer plusieurs sites.',
      'urgence': 'Soulignez l\'urgence et le cout de l\'attente.',
      'contrat': 'Proposez d\'envoyer le contrat pour avancer.',
      'déploiement': 'Detaillez le planning de mise en place.',
      'sécurité': 'Rassurez sur la securite des donnees.',
      'confiance': 'Proposez un pilote pour etablir la confiance.',
      'ok': 'Concluez la vente en proposant les prochaines etapes.',
      'btp': 'Montrez que vous connaissez les specificites de son secteur.',
      'intérim': 'Abordez la gestion des interimaires.',
      'absence': 'Parlez de la gestion des absences en temps reel.',
      'mobile': 'Mentionnez l\'accessibilite mobile pour le terrain.',
      'paie': 'Abordez l\'automatisation de la paie et des primes.',
      'simple': 'Insistez sur la facilite d\'utilisation de l\'outil.',
      'concret': 'Proposez de montrer une demonstration concrete.',
      'résultat': 'Partagez des resultats chiffres de clients existants.',
      'question': 'Demandez quelles sont ses priorites principales.',
    };
    const hint = hintPhrases[trigger];
    if (hint) return hint;
    return `Essayez de parler de : ${r.triggers.slice(0, 3).join(', ')}.`;
  }
  return 'Essayez de reformuler ou de proposer une prochaine etape.';
}

export function renderRoleplayChat(main, scenarioId) {
  const scenario = ROLEPLAY_SCENARIOS.find(s => s.id === scenarioId);
  if (!scenario) { renderRoleplayHub(main); return; }

  usedResponseIndices = new Set();

  activeRoleplayState = {
    scenarioId,
    difficulty: selectedDifficulty,
    messages: [],
    turnCount: 0,
    evalShown: false,
    started: false,
    finished: false,
  };

  let html = `
    <div class="rp-chat-layout rp-chat-fullwidth">
      <div class="rp-chat-main">
        <div class="rp-chat-topbar">
          <button class="rp-topbar-back" id="rpBackBtn" title="Retour"><i class="fas fa-arrow-left"></i></button>
          <div class="rp-topbar-avatar">
            <div class="rp-avatar ${scenario.color} small">${scenario.clientAvatar}</div>
            <span class="rp-topbar-status-dot"></span>
          </div>
          <div class="rp-topbar-info">
            <div class="rp-topbar-name">${scenario.clientName} <span class="rp-topbar-role">${scenario.clientRole}</span></div>
            <div class="rp-topbar-scenario"><i class="fas ${scenario.icon}"></i> ${scenario.title}</div>
          </div>
          <div class="rp-topbar-pills">
            <span class="rp-chat-diff-badge diff-${activeRoleplayState.difficulty}">${getDifficultyLabel(activeRoleplayState.difficulty)}</span>
            <div class="rp-turn-counter" id="rpTurnCounter">Tour 0</div>
            <span class="rp-topbar-xp"><i class="fas fa-bolt"></i> ${scenario.xpReward} XP</span>
          </div>
          <button class="rp-topbar-context-toggle active" id="rpContextToggle" title="Voir le briefing"><i class="fas fa-clipboard-list"></i></button>
        </div>
        <div class="rp-context-drawer open" id="rpContextDrawer">
          <div class="rp-context-drawer-inner">
            <div class="rp-context-col">
              <div class="rp-context-label"><i class="fas fa-building"></i> Client</div>
              <div class="rp-context-value">${scenario.clientName} - ${scenario.clientRole}</div>
              <div class="rp-context-sub">${scenario.clientCompany}</div>
            </div>
            <div class="rp-context-col rp-context-col-wide">
              <div class="rp-context-label"><i class="fas fa-map"></i> Contexte</div>
              <div class="rp-context-value">${scenario.context}</div>
            </div>
            <div class="rp-context-col">
              <div class="rp-context-label"><i class="fas fa-bullseye"></i> Objectif</div>
              <div class="rp-context-value">${scenario.objective}</div>
            </div>
          </div>
        </div>
        <div class="rp-messages" id="rpMessages"></div>
        <div class="rp-input-bar" id="rpInputBar">
          <button class="rp-hint-btn" id="rpHintBtn" title="Obtenir une aide"><i class="fas fa-lightbulb"></i></button>
          <textarea class="rp-input" id="rpInput" placeholder="Tapez votre r\u00e9ponse..." rows="1"></textarea>
          ${isSpeechSupported() ? '<button class="rp-mic-btn" id="rpMicBtn" title="Parler au micro"><i class="fas fa-microphone"></i></button>' : ''}
          <button class="rp-send-btn" id="rpSendBtn"><i class="fas fa-paper-plane"></i></button>
        </div>
      </div>
    </div>
  `;

  main.innerHTML = html;

  $('#rpBackBtn').addEventListener('click', () => navigateTo('roleplay'));

  const contextToggle = $('#rpContextToggle');
  const contextDrawer = $('#rpContextDrawer');
  if (contextToggle && contextDrawer) {
    contextToggle.addEventListener('click', () => {
      contextDrawer.classList.toggle('open');
      contextToggle.classList.toggle('active');
    });
  }
    // Close context drawer on mobile by default
    if (window.innerWidth <= 768 && contextDrawer && contextToggle) {
      contextDrawer.classList.remove('open');
      contextToggle.classList.remove('active');
    }

    const greetingByDiff = {
    debutant: scenario.greeting,
    intermediaire: scenario.greeting,
    expert: scenario.greeting + ' Et soyez bref, j\'ai peu de temps.',
  };
  setTimeout(() => addBotMessage(greetingByDiff[activeRoleplayState.difficulty] || scenario.greeting, scenario), GREETING_DELAY);

  const input = $('#rpInput');
  const sendBtn = $('#rpSendBtn');

  function handleSend() {
    if (window._rpSending) return;
    window._rpSending = true;
    setTimeout(() => { window._rpSending = false; }, 2000);
    unlockSpeechSynthesis();
    const text = input.value.trim();
    if (!text || !activeRoleplayState || activeRoleplayState.finished) return;

    addUserMessage(text);
    input.value = '';
    input.style.height = 'auto';

    activeRoleplayState.turnCount++;
    const counter = $('#rpTurnCounter');
    if (counter) counter.textContent = `Tour ${activeRoleplayState.turnCount}`;

    const maxTurns = MAX_TURNS[activeRoleplayState.difficulty] || MAX_TURNS.intermediaire;
    if (activeRoleplayState.turnCount >= maxTurns) {
      setTimeout(() => finishRoleplay(scenario), FINISH_DELAY);
      return;
    }

    // At turn EVAL_TURN, show choice popup: continue or evaluate
    if (activeRoleplayState.turnCount === EVAL_TURN && !activeRoleplayState.evalShown) {
      activeRoleplayState.evalShown = true;
      showTurn5ChoicePopup(scenario);
      return;
    }

    const typingEl = showTypingIndicator(scenario);
    // Get auth token from localStorage
    let _token = "";
    try { const _s = JSON.parse(localStorage.getItem("symbiose_session") || "{}"); _token = _s.token || ""; } catch(e){}
    // Call Claude API via proxy
    fetch("/api-chat.php", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + _token },
      body: JSON.stringify({
        messages: activeRoleplayState.messages.map(m => ({ role: m.role === "bot" ? "assistant" : "user", content: m.text })),
        difficulty: activeRoleplayState.difficulty || "debutant",
        scenario: { clientName: scenario.clientName, clientRole: scenario.clientRole, clientCompany: scenario.clientCompany, context: scenario.context, objective: scenario.objective }
      })
    })
    .then(r => r.json())
    .then(data => {
      if (typingEl && typingEl.parentNode) typingEl.remove();
      const reply = data.reply || "Desole, je n'ai pas pu repondre.";
      addBotMessage(reply, scenario);
    })
    .catch(err => { console.error("API_CATCH:", err.message, err);
      if (typingEl && typingEl.parentNode) typingEl.remove();
      const response = getScenarioResponse(scenario, text, activeRoleplayState.difficulty);
      trackUsedResponse(scenario, text, usedResponseIndices);
      addBotMessage(response, scenario);
    });
  }

    const hintBtn = $('#rpHintBtn');
    if (hintBtn) {
      hintBtn.addEventListener('click', () => {
        if (!activeRoleplayState || activeRoleplayState.finished) return;
        const input = $('#rpInput');
        if (!input) return;
        hintBtn.disabled = true;
        hintBtn.style.opacity = '0.5';
        const container = $('#rpMessages');
        const existing = container ? container.querySelector('.rp-hint-msg') : null;
        if (existing) existing.remove();
        if (container) {
          const loadDiv = document.createElement('div');
          loadDiv.className = 'rp-hint-msg fade-in';
          loadDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <strong>Recherche de la meilleure reponse...</strong>';
          container.appendChild(loadDiv);
          container.scrollTop = container.scrollHeight;
        }
        let _token = "";
        try { const _s = JSON.parse(localStorage.getItem("symbiose_session") || "{}"); _token = _s.token || ""; } catch(e){}
        fetch("/api-hint.php", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + _token },
          body: JSON.stringify({
            messages: activeRoleplayState.messages.map(m => ({ role: m.role === "bot" ? "assistant" : "user", content: m.text })),
            difficulty: activeRoleplayState.difficulty || "debutant",
            scenario: { clientName: scenario.clientName, clientRole: scenario.clientRole, clientCompany: scenario.clientCompany, context: scenario.context, objective: scenario.objective }
          })
        })
        .then(r => r.json())
        .then(data => {
          hintBtn.disabled = false;
          hintBtn.style.opacity = '1';
          const loadMsg = container ? container.querySelector('.rp-hint-msg') : null;
          if (loadMsg) loadMsg.remove();
          if (data.suggestion) {
            input.value = data.suggestion;
            input.focus();
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 120) + 'px';
            if (container) {
              const div = document.createElement('div');
              div.className = 'rp-hint-msg fade-in';
              div.innerHTML = '<i class="fas fa-lightbulb"></i> <strong>Suggestion IA :</strong> Reponse pre-remplie. Modifiez-la si besoin puis envoyez !';
              container.appendChild(div);
              container.scrollTop = container.scrollHeight;
            }
          }
        })
        .catch(err => {
          hintBtn.disabled = false;
          hintBtn.style.opacity = '1';
          const loadMsg = container ? container.querySelector('.rp-hint-msg') : null;
          if (loadMsg) loadMsg.remove();
          const hint = getHintForScenario(scenario, usedResponseIndices);
          if (container) {
            const div = document.createElement('div');
            div.className = 'rp-hint-msg fade-in';
            div.innerHTML = '<i class="fas fa-lightbulb"></i> <strong>Aide :</strong> ' + hint;
            container.appendChild(div);
            container.scrollTop = container.scrollHeight;
          }
        });
      });
    }

  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });

  const micBtn = $('#rpMicBtn');
  if (micBtn && isSpeechSupported()) {
    initSpeechRecognition({
      onResult: ({ final, interim, done }) => {
        const text = final || interim;
        if (text) {
          input.value = text;
          input.style.height = 'auto';
          input.style.height = Math.min(input.scrollHeight, 120) + 'px';
        }
        if (done && final) handleSend();
      },
      onStateChange: (listening) => {
        micBtn.classList.toggle('recording', listening);
        micBtn.querySelector('i').className = listening ? 'fas fa-stop' : 'fas fa-microphone';
      }
    });

    micBtn.addEventListener('click', () => {
      if (isCurrentlyListening()) {
        stopListening();
      } else {
        input.value = '';
        startListening();
      }
    });
  }
}
