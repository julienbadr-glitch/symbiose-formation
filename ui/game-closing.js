import { ROLEPLAY_SCENARIOS, getScenarioResponse } from '../roleplay.js?v=81';
import { trackUsedResponse, getHintForScenario } from './roleplay.js?v=81';
import { isSpeechSupported, initSpeechRecognition, startListening, stopListening, isCurrentlyListening, speakText } from '../speech.js?v=81';
import { addXP, triggerConfetti } from '../notifications.js?v=81';
import { navigateTo } from '../router.js?v=81';

const SCENARIO_ID = 'closing';
const MAX_TURNS = { debutant: 8, intermediaire: 10, expert: 12 };
const BOT_DELAY_BASE = 800;
const BOT_DELAY_VARIANCE = 1200;
const GREETING_DELAY = 600;

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function getDifficultyLabel(diff) {
  return { debutant: 'Debutant', intermediaire: 'Intermediaire', expert: 'Expert' }[diff] || 'Intermediaire';
}

export function initGameClosing(container) {
  const scenario = ROLEPLAY_SCENARIOS.find(s => s.id === SCENARIO_ID);
  if (!scenario) return;

  let rpState = null;
  let clUsedIndices = new Set();

  function renderIntro() {
    container.innerHTML = `
      <div class="cl-intro fade-in">
        <div class="rp-card cl-intro-card" style="cursor:default">
          <div class="rp-card-header">
            <div class="rp-card-icon ${scenario.color}"><i class="fas ${scenario.icon}"></i></div>
            <div class="rp-card-diff">${scenario.difficulty}</div>
          </div>
          <h3 class="rp-card-title">${scenario.title}</h3>
          <p class="rp-card-desc">${scenario.desc}</p>
          <div class="rp-card-meta">
            <span class="rp-card-client"><i class="fas fa-user-tie"></i> ${scenario.clientName} - ${scenario.clientRole}</span>
            <span class="rp-card-xp"><i class="fas fa-bolt"></i> ${scenario.xpReward} XP</span>
          </div>
        </div>

        <div class="cl-intro-context fade-in" style="animation-delay:0.1s">
          <div class="rp-info-section">
            <div class="rp-info-label">Client</div>
            <div class="rp-info-client">
              <div class="rp-avatar ${scenario.color}">${scenario.clientAvatar}</div>
              <div>
                <div class="rp-client-name">${scenario.clientName}</div>
                <div class="rp-client-role">${scenario.clientRole}</div>
                <div class="rp-client-company">${scenario.clientCompany}</div>
              </div>
            </div>
          </div>
          <div class="rp-info-section" style="margin-top:16px">
            <div class="rp-info-label">Contexte</div>
            <p class="rp-info-text">${scenario.context}</p>
          </div>
          <div class="rp-info-section" style="margin-top:16px">
            <div class="rp-info-label">Objectif</div>
            <p class="rp-info-text">${scenario.objective}</p>
          </div>
        </div>

        <div class="cl-intro-diff fade-in" style="animation-delay:0.15s">
          <div class="diff-modal-header" style="margin-bottom:20px">
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
                <span class="diff-option-desc">Le prospect est froid, presse et sceptique. Chaque mot compte.</span>
              </div>
              <div class="diff-option-dots">
                <span class="diff-dot active"></span>
                <span class="diff-dot active"></span>
                <span class="diff-dot active"></span>
              </div>
            </button>
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll('.diff-option').forEach(btn => {
      btn.addEventListener('click', () => startChat(btn.dataset.diff));
    });
  }

  function startChat(difficulty) {
    clUsedIndices = new Set();
    rpState = {
      difficulty,
      messages: [],
      turnCount: 0,
      started: false,
      finished: false,
    };

    container.innerHTML = `
      <div class="rp-chat-layout rp-chat-fullwidth">
        <div class="rp-chat-main">
          <div class="rp-chat-topbar">
            <button class="rp-topbar-back" id="clBackBtn" title="Retour"><i class="fas fa-arrow-left"></i></button>
            <div class="rp-topbar-avatar">
              <div class="rp-avatar ${scenario.color} small">${scenario.clientAvatar}</div>
              <span class="rp-topbar-status-dot"></span>
            </div>
            <div class="rp-topbar-info">
              <div class="rp-topbar-name">${scenario.clientName} <span class="rp-topbar-role">${scenario.clientRole}</span></div>
              <div class="rp-topbar-scenario"><i class="fas ${scenario.icon}"></i> ${scenario.title}</div>
            </div>
            <div class="rp-topbar-pills">
              <span class="rp-chat-diff-badge diff-${difficulty}">${getDifficultyLabel(difficulty)}</span>
              <div class="rp-turn-counter" id="clTurnCounter">Tour 0</div>
              <span class="rp-topbar-xp"><i class="fas fa-bolt"></i> ${scenario.xpReward} XP</span>
            </div>
            <button class="rp-topbar-context-toggle" id="clContextToggle" title="Voir le briefing"><i class="fas fa-clipboard-list"></i></button>
          </div>
          <div class="rp-context-drawer" id="clContextDrawer">
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
          <div class="rp-messages" id="clMessages"></div>
          <div class="rp-input-bar" id="clInputBar">
            <button class="rp-hint-btn" id="clHintBtn" title="Obtenir une aide"><i class="fas fa-lightbulb"></i></button>
            <textarea class="rp-input" id="clInput" placeholder="Tapez votre reponse..." rows="1"></textarea>
            ${isSpeechSupported() ? '<button class="rp-mic-btn" id="clMicBtn" title="Parler au micro"><i class="fas fa-microphone"></i></button>' : ''}
            <button class="rp-send-btn" id="clSendBtn"><i class="fas fa-paper-plane"></i></button>
          </div>
        </div>
      </div>
    `;

    const messagesEl = container.querySelector('#clMessages');
    const inputEl = container.querySelector('#clInput');
    const sendBtn = container.querySelector('#clSendBtn');

    const clBackBtn = container.querySelector('#clBackBtn');
    if (clBackBtn) clBackBtn.addEventListener('click', () => renderIntro());

    const clContextToggle = container.querySelector('#clContextToggle');
    const clContextDrawer = container.querySelector('#clContextDrawer');
    if (clContextToggle && clContextDrawer) {
      clContextToggle.addEventListener('click', () => {
        clContextDrawer.classList.toggle('open');
        clContextToggle.classList.toggle('active');
      });
    }

    const greetingByDiff = {
      debutant: scenario.greeting,
      intermediaire: scenario.greeting,
      expert: scenario.greeting + " Et soyez bref, j'ai peu de temps.",
    };
    setTimeout(() => addBotMsg(greetingByDiff[difficulty] || scenario.greeting), GREETING_DELAY);

    function addBotMsg(text) {
      const div = document.createElement('div');
      div.className = 'rp-msg rp-msg-bot fade-in';
      div.innerHTML = `
        <div class="rp-msg-avatar bot ${scenario.color}">${scenario.clientAvatar}</div>
        <div class="rp-msg-bubble bot">
          <div class="rp-msg-text">${text}</div>
        </div>
      `;
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      if (rpState) {
        rpState.messages.push({ role: 'bot', text });
        if (rpState.started) speakText(text);
      }
    }

    function addUserMsg(text) {
      const div = document.createElement('div');
      div.className = 'rp-msg rp-msg-user fade-in';
      div.innerHTML = `
        <div class="rp-msg-bubble user">
          <div class="rp-msg-text">${escapeHtml(text)}</div>
        </div>
        <div class="rp-msg-avatar user">CD</div>
      `;
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      if (rpState) {
        rpState.messages.push({ role: 'user', text });
        rpState.started = true;
      }
    }

    function showTyping() {
      const div = document.createElement('div');
      div.className = 'rp-msg rp-msg-bot rp-typing-msg';
      div.innerHTML = `
        <div class="rp-msg-avatar bot ${scenario.color}">${scenario.clientAvatar}</div>
        <div class="rp-msg-bubble bot">
          <div class="rp-typing"><span></span><span></span><span></span></div>
        </div>
      `;
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return div;
    }

    function finishChat() {
      if (!rpState) return;
      rpState.finished = true;

      const inputBar = container.querySelector('#clInputBar');
      if (inputBar) inputBar.style.display = 'none';

      addXP(scenario.xpReward, 'games');

      const div = document.createElement('div');
      div.className = 'rp-end-card fade-in';
      div.innerHTML = `
        <div class="rp-end-icon"><i class="fas fa-flag-checkered"></i></div>
        <h3>Simulation terminee</h3>
        <p>Vous avez complete le scenario "${scenario.title}" en ${rpState.turnCount} tours.</p>
        <div class="rp-end-xp"><i class="fas fa-bolt"></i> +${scenario.xpReward} XP gagnes</div>
        <div class="rp-end-tips">
          <div class="rp-end-tip-title"><i class="fas fa-lightbulb"></i> Conseils pour progresser</div>
          <ul>
            <li>Differenciez-vous en valorisant l'accompagnement humain</li>
            <li>Creez un sentiment d'urgence legitime base sur des faits</li>
            <li>Proposez un pilote pour reduire le risque percu</li>
            <li>Concluez toujours avec une prochaine etape concrete</li>
          </ul>
        </div>
        <div class="rp-end-actions">
          <button class="btn btn-secondary" id="clRetryBtn"><i class="fas fa-rotate-right"></i> Recommencer</button>
          <button class="btn btn-primary" id="clHubBtn"><i class="fas fa-masks-theater"></i> Autres simulations</button>
        </div>
      `;
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      triggerConfetti();

      div.querySelector('#clRetryBtn').addEventListener('click', () => renderIntro());
      div.querySelector('#clHubBtn').addEventListener('click', () => navigateTo('roleplay'));
    }

    function handleSend() {
      const text = inputEl.value.trim();
      if (!text || !rpState || rpState.finished) return;

      addUserMsg(text);
      inputEl.value = '';
      inputEl.style.height = 'auto';

      rpState.turnCount++;
      const counter = container.querySelector('#clTurnCounter');
      if (counter) counter.textContent = `Tour ${rpState.turnCount}`;

      const maxTurns = MAX_TURNS[rpState.difficulty] || MAX_TURNS.intermediaire;
      if (rpState.turnCount >= maxTurns) {
        setTimeout(() => finishChat(), 1000);
        return;
      }

      const typingEl = showTyping();
      const delay = BOT_DELAY_BASE + Math.random() * BOT_DELAY_VARIANCE;
      setTimeout(() => {
        if (typingEl && typingEl.parentNode) typingEl.remove();
        const response = getScenarioResponse(scenario, text, rpState.difficulty);
        trackUsedResponse(scenario, text, clUsedIndices);
        addBotMsg(response);
      }, delay);
    }

    const hintBtn = container.querySelector('#clHintBtn');
    if (hintBtn) {
      hintBtn.addEventListener('click', () => {
        if (!rpState || rpState.finished) return;
        const hint = getHintForScenario(scenario, clUsedIndices);
        const existing = messagesEl.querySelector('.rp-hint-msg');
        if (existing) existing.remove();
        const div = document.createElement('div');
        div.className = 'rp-hint-msg fade-in';
        div.innerHTML = `<i class="fas fa-lightbulb"></i> <strong>Aide :</strong> ${hint}`;
        messagesEl.appendChild(div);
        messagesEl.scrollTop = messagesEl.scrollHeight;
      });
    }

    sendBtn.addEventListener('click', handleSend);
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });
    inputEl.addEventListener('input', () => {
      inputEl.style.height = 'auto';
      inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
    });

    const micBtn = container.querySelector('#clMicBtn');
    if (micBtn && isSpeechSupported()) {
      initSpeechRecognition({
        onResult: ({ final, interim, done }) => {
          const text = final || interim;
          if (text) {
            inputEl.value = text;
            inputEl.style.height = 'auto';
            inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
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
          inputEl.value = '';
          startListening();
        }
      });
    }
  }

  renderIntro();
}
