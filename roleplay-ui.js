/**
 * Roleplay UI Module
 * Hub de simulation, chat roleplay, evaluation
 */
import { ROLEPLAY_SCENARIOS, getScenarioResponse } from './roleplay.js?v=81';
import { isSpeechSupported, initSpeechRecognition, startListening, stopListening, isCurrentlyListening, speakText, unlockTTS } from './speech.js?v=81';
import { $, sanitize, escapeHtml } from './utils.js?v=81';
import { addXP } from './notifications.js?v=81';

// Cross-module dependency: navigateTo
let _navigateTo = null;
export function setRoleplayNavigateTo(fn) { _navigateTo = fn; }
let activeRoleplayState = null;

// ============================================================
// 10. ROLEPLAY ENGINE
// ============================================================
export function renderRoleplayHub(main) {
  let html = `
    <div class="breadcrumb"><i class="fas fa-masks-theater"></i> Simulations</div>
    <h1 class="view-title">Jeux de R\u00f4le</h1>
    <p class="view-subtitle">Entra\u00eenez-vous \u00e0 travers des sc\u00e9narios de vente r\u00e9alistes. Chaque simulation vous met face \u00e0 un prospect virtuel.</p>
    <div class="rp-grid">
  `;

  ROLEPLAY_SCENARIOS.forEach((s, i) => {
    html += `
      <div class="rp-card fade-in" data-scenario="${s.id}" style="animation-delay:${.06 * i}s">
        <div class="rp-card-header">
          <div class="rp-card-icon ${s.color}"><i class="fas ${s.icon}"></i></div>
          <div class="rp-card-diff">${s.difficulty}</div>
        </div>
        <h3 class="rp-card-title">${s.title}</h3>
        <p class="rp-card-desc">${s.desc}</p>
        <div class="rp-card-meta">
          <span class="rp-card-client"><i class="fas fa-user-tie"></i> ${s.clientName} - ${s.clientRole}</span>
          <span class="rp-card-xp"><i class="fas fa-bolt"></i> ${s.xpReward} XP</span>
        </div>
        <button class="btn btn-primary rp-card-btn">Lancer la simulation <i class="fas fa-play"></i></button>
      </div>
    `;
  });

  html += `</div>`;
  main.innerHTML = html;

  main.querySelectorAll('.rp-card').forEach(card => {
    card.querySelector('.rp-card-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      _navigateTo(`roleplay-${card.dataset.scenario}`);
    });
    card.addEventListener('click', () => {
      _navigateTo(`roleplay-${card.dataset.scenario}`);
    });
  });
}

// ---- Roleplay: Chat Interface ----
export function renderRoleplayChat(main, scenarioId) {
  const scenario = ROLEPLAY_SCENARIOS.find(s => s.id === scenarioId);
  if (!scenario) { renderRoleplayHub(main); return; }

  activeRoleplayState = {
    scenarioId,
    messages: [],
    turnCount: 0,
      evalThreshold: 5,
    started: false,
    finished: false,
    helpUsed: 0,
    choiceScore: 0,
  };

  let html = `
    <div class="rp-chat-layout">
      <div class="rp-chat-sidebar">
        <button class="btn btn-secondary rp-back-btn" id="rpBackBtn"><i class="fas fa-arrow-left"></i> Retour</button>
        <div class="rp-info-card">
          <div class="rp-info-icon ${scenario.color}"><i class="fas ${scenario.icon}"></i></div>
          <h3>${scenario.title}</h3>
          <span class="rp-info-diff">${scenario.difficulty}</span>
        </div>
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
        <div class="rp-info-section">
          <div class="rp-info-label">Contexte</div>
          <p class="rp-info-text">${scenario.context}</p>
        </div>
        <div class="rp-info-section">
          <div class="rp-info-label">Objectif</div>
          <p class="rp-info-text">${scenario.objective}</p>
        </div>
        <div class="rp-info-section">
          <div class="rp-info-label">R\u00e9compense</div>
          <p class="rp-info-text"><i class="fas fa-bolt" style="color:var(--accent)"></i> ${scenario.xpReward} XP</p>
        </div>
      </div>
      <div class="rp-chat-main">
        <div class="rp-chat-header">
          <div class="rp-avatar ${scenario.color} small">${scenario.clientAvatar}</div>
          <div>
            <div class="rp-chat-header-name">${scenario.clientName}</div>
            <div class="rp-chat-header-status"><span class="rp-status-dot"></span> En ligne</div>
          </div>
          <div class="rp-turn-counter" id="rpTurnCounter">Tour 0</div>
        </div>
        <div class="rp-messages" id="rpMessages"></div>
        <div class="rp-input-bar" id="rpInputBar">
          <textarea class="rp-input" id="rpInput" placeholder="Tapez votre r\u00e9ponse..." rows="1"></textarea>
          ${isSpeechSupported() ? '<button class="rp-mic-btn" id="rpMicBtn" title="Parler au micro"><i class="fas fa-microphone"></i></button>' : ''}
          <button id="rpHelpBtn" style="width:44px;height:44px;border-radius:50%;border:none;background:linear-gradient(135deg,#ff9800,#ff5722);color:#fff;font-size:1.3rem;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(255,152,0,0.3);transition:all 0.3s ease;flex-shrink:0;" onmouseover="this.style.transform='scale(1.1)';this.style.boxShadow='0 4px 15px rgba(255,152,0,0.5)'" onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 2px 8px rgba(255,152,0,0.3)'" title="Aide - Obtenir un conseil"><i class="fas fa-question"></i></button>
            <button class="rp-send-btn" id="rpSendBtn"><i class="fas fa-paper-plane"></i></button>
        </div>
      </div>
    </div>
  `;

  main.innerHTML = html;

  $('#rpBackBtn').addEventListener('click', () => _navigateTo('roleplay'));

    showDifficultyPicker(scenario);

  const input = $('#rpInput');
  const sendBtn = $('#rpSendBtn');

  let rpIsSending = false;
  function handleSend() {
    const text = input.value.trim();
    if (!text || !activeRoleplayState || activeRoleplayState.finished || rpIsSending) return;
    rpIsSending = true;

    addUserMessage(text);
    // Remove choice buttons if present
    const existingChoices = document.querySelector('.rp-choices-container');
    if (existingChoices) existingChoices.remove();
    // Free text counts as intermediaire level
    activeRoleplayState.choiceScore = (activeRoleplayState.choiceScore || 0) + 25;
    updateScoreDisplay();
    input.value = '';
    input.style.height = 'auto';

    activeRoleplayState.turnCount++;
    const counter = $('#rpTurnCounter');
    if (counter) counter.textContent = `Tour ${activeRoleplayState.turnCount}`;

    if (activeRoleplayState.turnCount >= activeRoleplayState.evalThreshold) {
      rpIsSending = false;
      setTimeout(() => {
        showEvalChoiceButtons(scenario);
      }, 1000);
      return;
    }

      const typingEl = showTypingIndicator(scenario);
      // Appel IA Claude via proxy PHP
      fetch('/api-chat.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (authToken || '') },
        body: JSON.stringify({
          messages: activeRoleplayState.messages,
                difficulty: activeRoleplayState.difficulty || 'debutant',
          scenario: {
            clientName: scenario.clientName,
            clientRole: scenario.clientRole,
            clientCompany: scenario.clientCompany,
            context: scenario.context,
            objective: scenario.objective
          }
        })
      })
      .then(r => r.json())
      .then(data => {
        if (typingEl && typingEl.parentNode) typingEl.remove();
        rpIsSending = false;
        const reply = data.reply || 'Desole, je n\'ai pas pu repondre.';
        addBotMessage(reply, scenario);

      })
      .catch(err => {
        rpIsSending = false;
        if (typingEl && typingEl.parentNode) typingEl.remove();

        const response = getScenarioResponse(scenario, text);
        addBotMessage(response, scenario);

      });
  }

  sendBtn.addEventListener('click', handleSend);

  // Help button handler
  const helpBtn = $('#rpHelpBtn');
  if (helpBtn) {
    helpBtn.addEventListener('click', async () => {
      if (!activeRoleplayState || activeRoleplayState.finished) return;
      if (activeRoleplayState.messages.length === 0) return;

      helpBtn.disabled = true;
      helpBtn.style.opacity = '0.5';
      helpBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

      try {
        const scenario = ROLEPLAY_SCENARIOS.find(s => s.id === activeRoleplayState.scenarioId);
        const res = await fetch('/api-help.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (authToken || '') },
          body: JSON.stringify({
            messages: activeRoleplayState.messages,
            scenario: { title: scenario.title, context: scenario.context, objective: scenario.objective }
          })
        });
        const data = await res.json();
        if (data.tip) {
          activeRoleplayState.helpUsed = (activeRoleplayState.helpUsed || 0) + 1;
          const tipDiv = document.createElement('div');
          tipDiv.style.cssText = 'background:linear-gradient(135deg,#fff3e0,#ffe0b2);border-left:4px solid #ff9800;border-radius:12px;padding:14px 16px;margin:10px 0;font-size:0.92rem;color:#e65100;line-height:1.5;box-shadow:0 2px 8px rgba(255,152,0,0.15);';
          tipDiv.innerHTML = '<div style="font-weight:700;margin-bottom:6px;display:flex;align-items:center;gap:6px;"><i class="fas fa-lightbulb" style="color:#ff9800;"></i> Conseil du coach</div><div>' + sanitize(data.tip) + '</div>';
          const chatArea = document.getElementById('rpMessages');
          if (chatArea) { chatArea.appendChild(tipDiv); chatArea.scrollTop = chatArea.scrollHeight; }
        }
      } catch (e) {

      } finally {
        helpBtn.disabled = false;
        helpBtn.style.opacity = '1';
        helpBtn.innerHTML = '<i class="fas fa-question"></i>';
      }
    });
  }
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
        if (done && final) {
          handleSend();
        }
      },
      onStateChange: (listening) => {
        micBtn.classList.toggle('recording', listening);
        micBtn.querySelector('i').className = listening ? 'fas fa-stop' : 'fas fa-microphone';
      }
    });

    micBtn.addEventListener('click', () => {
        unlockTTS();
      if (isCurrentlyListening()) {
        stopListening();
      } else {
        input.value = '';
        startListening();
      }
    });
  }
}

// ---- Roleplay: Messages & TTS ----
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

function addBotMessage(text, scenario) {
  const container = $('#rpMessages');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'rp-msg rp-msg-bot fade-in';
  div.innerHTML = `
    <div class="rp-msg-avatar bot ${scenario.color}">${scenario.clientAvatar}</div>
    <div class="rp-msg-bubble bot">
      <div class="rp-msg-text">${sanitize(text)}</div>
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


function showDifficultyPicker(scenario) {
    var container = document.querySelector('#rpMessages');
    if (!container) return;
    var pickerDiv = document.createElement('div');
    pickerDiv.className = 'rp-difficulty-picker';
    pickerDiv.style.cssText = 'padding:20px;margin:10px 0;';
    
    var title = document.createElement('div');
    title.style.cssText = 'text-align:center;font-size:1.1rem;font-weight:700;color:#1a1a2e;margin-bottom:6px;';
    title.innerHTML = '<i class="fas fa-gamepad" style="color:#7c3aed;"></i> Choisissez le niveau de votre client';
    pickerDiv.appendChild(title);
    
    var subtitle = document.createElement('div');
    subtitle.style.cssText = 'text-align:center;font-size:0.85rem;color:#888;margin-bottom:16px;';
    subtitle.textContent = 'Plus le client est exigeant, plus vous gagnez de points';
    pickerDiv.appendChild(subtitle);
    
    var levels = [
      { key: 'debutant', label: 'Debutant', desc: 'Client cooperatif et ouvert, facile a convaincre', mult: 'x1', color: '#4caf50', bg: 'linear-gradient(135deg,#e8f5e9,#c8e6c9)', icon: 'fas fa-smile' },
      { key: 'intermediaire', label: 'Intermediaire', desc: 'Client hesitant qui a besoin d etre rassure', mult: 'x2', color: '#ff9800', bg: 'linear-gradient(135deg,#fff3e0,#ffe0b2)', icon: 'fas fa-meh' },
      { key: 'expert', label: 'Expert', desc: 'Client sceptique et exigeant, plein d objections', mult: 'x3', color: '#f44336', bg: 'linear-gradient(135deg,#ffebee,#ffcdd2)', icon: 'fas fa-frown' }
    ];
    
    levels.forEach(function(level) {
      var btn = document.createElement('button');
      btn.style.cssText = 'display:block;width:100%;text-align:left;padding:16px 18px;margin-bottom:10px;background:' + level.bg + ';border:2px solid ' + level.color + '30;border-radius:14px;cursor:pointer;transition:all 0.3s ease;';
      var labelRow = document.createElement('div');
      labelRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;';
      labelRow.innerHTML = '<span style="font-weight:700;color:' + level.color + ';font-size:1rem;"><i class="' + level.icon + '"></i> ' + level.label + '</span><span style="background:' + level.color + ';color:#fff;padding:3px 12px;border-radius:20px;font-size:0.8rem;font-weight:700;">Points ' + level.mult + '</span>';
      var descDiv = document.createElement('div');
      descDiv.style.cssText = 'font-size:0.9rem;color:#555;line-height:1.4;';
      descDiv.textContent = level.desc;
      btn.appendChild(labelRow);
      btn.appendChild(descDiv);
      btn.addEventListener('mouseover', function() { this.style.borderColor = level.color; this.style.transform = 'translateY(-2px)'; this.style.boxShadow = '0 4px 15px ' + level.color + '30'; });
      btn.addEventListener('mouseout', function() { this.style.borderColor = level.color + '30'; this.style.transform = 'translateY(0)'; this.style.boxShadow = 'none'; });
      btn.addEventListener('click', function() {
        activeRoleplayState.difficulty = level.key;
        activeRoleplayState.difficultyMultiplier = level.key === 'debutant' ? 1 : level.key === 'intermediaire' ? 2 : 3;
        pickerDiv.remove();
        updateDifficultyBadge(level);
        setTimeout(function() { addBotMessage(scenario.greeting, scenario); }, 400);
      });
      pickerDiv.appendChild(btn);
    });
    container.appendChild(pickerDiv);
  }

  function updateDifficultyBadge(level) {
    var header = document.querySelector('.rp-chat-header');
    if (!header) return;
    var existing = header.querySelector('.rp-diff-badge');
    if (existing) existing.remove();
    var badge = document.createElement('div');
    badge.className = 'rp-diff-badge';
    badge.style.cssText = 'background:' + level.color + ';color:#fff;padding:4px 12px;border-radius:20px;font-size:0.75rem;font-weight:700;margin-left:auto;margin-right:8px;';
    badge.innerHTML = '<i class="' + level.icon + '"></i> ' + level.label;
    header.insertBefore(badge, header.querySelector('.rp-turn-counter'));
  }

  function showHelpSuggestions(scenario) {
    var chatArea = document.querySelector('#rpMessages');
    if (!chatArea) return;
    var existing = chatArea.querySelector('.rp-help-suggestions');
    if (existing) existing.remove();

    var helpDiv = document.createElement('div');
    helpDiv.className = 'rp-help-suggestions';
    helpDiv.style.cssText = 'padding:12px;margin:10px 0;text-align:center;';
    helpDiv.innerHTML = '<div style="color:#7c3aed;font-size:0.9rem;"><i class="fas fa-spinner fa-spin"></i> Generation des suggestions...</div>';
    chatArea.appendChild(helpDiv);
    chatArea.scrollTop = chatArea.scrollHeight;

    var conversationSummary = activeRoleplayState.messages.map(function(m) {
      return (m.role === 'bot' ? scenario.clientName : 'Vendeur') + ': ' + m.text;
    }).join('\n');

    var choiceRequest = [{ role: 'user', text: 'Voici une conversation de vente en cours:\n\n' + conversationSummary + '\n\n---\nGenere exactement 3 reponses possibles que le vendeur pourrait donner au dernier message du client. Les 3 niveaux:\n1. DEBUTANT: reponse basique mais acceptable (1-2 phrases)\n2. INTERMEDIAIRE: reponse correcte avec technique commerciale (2-3 phrases)\n3. EXPERT: reponse excellente, persuasive et professionnelle (2-3 phrases)\n\nReponds UNIQUEMENT en JSON valide:\n{"debutant":"la reponse","intermediaire":"la reponse","expert":"la reponse"}' }];

    fetch('/api-chat.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (authToken || '') },
      body: JSON.stringify({ messages: choiceRequest, scenario: { clientName: 'Coach Commercial', clientRole: 'Formateur en vente', clientCompany: 'Symbiose Formation', context: scenario.context, objective: 'Generer 3 suggestions de reponses pour aider le vendeur' } })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      helpDiv.innerHTML = '';
      var reply = data.reply || '';
      var choices;
      try { choices = JSON.parse(reply); } catch(e) {
        var jsonMatch = reply.match(/\{[\s\S]*"debutant"[\s\S]*"intermediaire"[\s\S]*"expert"[\s\S]*\}/);
        if (jsonMatch) { try { choices = JSON.parse(jsonMatch[0]); } catch(e2) {} }
      }
      if (!choices || !choices.debutant) {
        choices = { debutant: "Je comprends votre point de vue.", intermediaire: "Je comprends votre preoccupation. Permettez-moi de vous montrer comment nous repondons a ce besoin.", expert: "Excellente remarque. C est justement pour repondre a ce type d enjeu que notre solution a ete concue." };
      }
      var header = document.createElement('div');
      header.style.cssText = 'text-align:center;font-size:0.85rem;color:#888;font-weight:600;margin-bottom:8px;';
      header.innerHTML = '<i class="fas fa-lightbulb" style="color:#ff9800;"></i> Suggestions de reponses :';
      helpDiv.appendChild(header);

      var sugLevels = [
        { key: 'debutant', label: 'Debutant', color: '#4caf50', icon: 'fas fa-seedling' },
        { key: 'intermediaire', label: 'Intermediaire', color: '#1976d2', icon: 'fas fa-chart-line' },
        { key: 'expert', label: 'Expert', color: '#7c3aed', icon: 'fas fa-crown' }
      ];
      sugLevels.forEach(function(sl) {
        var btn = document.createElement('button');
        btn.style.cssText = 'display:block;width:100%;text-align:left;padding:10px 14px;margin-bottom:8px;background:#fff;border:1px solid ' + sl.color + '40;border-radius:10px;cursor:pointer;transition:all 0.2s;';
        btn.innerHTML = '<div style="font-weight:600;color:' + sl.color + ';font-size:0.8rem;margin-bottom:4px;"><i class="' + sl.icon + '"></i> ' + sl.label + '</div><div style="font-size:0.88rem;color:#333;line-height:1.4;">' + sanitize(choices[sl.key]) + '</div>';
        btn.addEventListener('mouseover', function() { this.style.borderColor = sl.color; this.style.background = sl.color + '08'; });
        btn.addEventListener('mouseout', function() { this.style.borderColor = sl.color + '40'; this.style.background = '#fff'; });
        btn.addEventListener('click', function() {
          helpDiv.remove();
          var input = document.querySelector('#rpInput');
          if (input) { input.value = choices[sl.key]; input.focus(); input.style.height = 'auto'; input.style.height = input.scrollHeight + 'px'; }
        });
        helpDiv.appendChild(btn);
      });
      chatArea.scrollTop = chatArea.scrollHeight;
    })
    .catch(function(err) {

      helpDiv.innerHTML = '<div style="color:#e65100;font-size:0.85rem;">Erreur lors de la generation. Reessayez.</div>';
    });
  }

  function updateScoreDisplay() {
    // Score display not needed in new difficulty mode
  }

  function showEvalChoiceButtons(scenario) {
  const messagesEl = document.getElementById("rpMessages");
  const inputArea = document.querySelector(".rp-input-bar");
  if (inputArea) inputArea.style.display = "none";
  
  const choiceDiv = document.createElement("div");
  choiceDiv.id = "rpEvalChoice";
  choiceDiv.style.cssText = "text-align:center;padding:24px 16px;margin:16px 0;background:linear-gradient(135deg,#f0f4ff,#e8f0fe);border-radius:16px;border:2px solid rgba(124,58,237,0.2);";
  
  const title = document.createElement("div");
  title.style.cssText = "font-size:1.1rem;font-weight:600;color:#1a1a2e;margin-bottom:6px;";
  title.textContent = "\u{1F3AF} Tour " + activeRoleplayState.turnCount + " atteint !";
  choiceDiv.appendChild(title);
  
  const subtitle = document.createElement("p");
  subtitle.style.cssText = "color:#555;margin-bottom:18px;font-size:0.95rem;";
  subtitle.textContent = "Que souhaitez-vous faire ?";
  choiceDiv.appendChild(subtitle);
  
  const btnContainer = document.createElement("div");
  btnContainer.style.cssText = "display:flex;gap:12px;justify-content:center;flex-wrap:wrap;";
  
  const evalBtn = document.createElement("button");
  evalBtn.style.cssText = "padding:12px 24px;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:white;border:none;border-radius:12px;font-size:1rem;font-weight:600;cursor:pointer;box-shadow:0 4px 12px rgba(124,58,237,0.3);";
  evalBtn.textContent = "\u{1F4CA} Voir l\u2019\u00e9valuation";
  evalBtn.addEventListener("click", function() {
    choiceDiv.remove();
    finishRoleplay(scenario);
  });
  btnContainer.appendChild(evalBtn);
  
  const contBtn = document.createElement("button");
  contBtn.style.cssText = "padding:12px 24px;background:white;color:#7c3aed;border:2px solid #7c3aed;border-radius:12px;font-size:1rem;font-weight:600;cursor:pointer;";
  contBtn.textContent = "\u{1F504} Continuer (5 tours)";
  contBtn.addEventListener("click", function() {
    choiceDiv.remove();
    activeRoleplayState.evalThreshold += 5;
    if (inputArea) inputArea.style.display = "";
  });
  btnContainer.appendChild(contBtn);
  
  choiceDiv.appendChild(btnContainer);
  messagesEl.appendChild(choiceDiv);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function finishRoleplay(scenario) {
  activeRoleplayState.finished = true;
  const chatArea = document.getElementById('rpMessages');
  const inputArea = document.querySelector('.rp-input-bar');
  if (inputArea) inputArea.style.display = 'none';

  // Show loading
  const loadingDiv = document.createElement('div');
  loadingDiv.style.cssText = 'text-align:center;padding:30px;';
  loadingDiv.innerHTML = '<div style="display:inline-block;width:40px;height:40px;border:4px solid #e0e0e0;border-top:4px solid #7c3aed;border-radius:50%;animation:spin 1s linear infinite;"></div><p style="margin-top:12px;color:#7c3aed;font-weight:600;">Analyse de votre performance en cours...</p><style>@keyframes spin{to{transform:rotate(360deg)}}</style>';
  if (chatArea) { chatArea.appendChild(loadingDiv); chatArea.scrollTop = chatArea.scrollHeight; }

  const mult = activeRoleplayState.difficultyMultiplier || 1;
  const diffLabel = activeRoleplayState.difficulty === 'expert' ? 'Expert' : activeRoleplayState.difficulty === 'intermediaire' ? 'Interm\u00e9diaire' : 'D\u00e9butant';

  fetch('/api-evaluate.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (authToken || '') },
    body: JSON.stringify({
      messages: activeRoleplayState.messages.map(function(m) { return { role: m.role === 'bot' ? 'assistant' : 'user', content: m.text }; }),
      conversation: activeRoleplayState.messages.map(function(m) { return (m.role === 'bot' ? scenario.clientName : 'Vendeur') + ': ' + m.text; }).join('\n'),
      scenario: { title: scenario.title, context: scenario.context, objective: scenario.objective },
      helpUsed: activeRoleplayState.helpUsed || 0,
      difficulty: activeRoleplayState.difficulty || 'debutant'
    })
  })
  .then(r => r.json())
  .then(data => {
    loadingDiv.remove();
    const score = data.score || 0;
    const baseXP = score;
    const finalXP = baseXP;
    // Persist roleplay XP to cumulative total
    addXP(finalXP, 'simulations');
    const scoreColor = score >= 80 ? '#4caf50' : score >= 60 ? '#ff9800' : '#f44336';
    const diffColor = activeRoleplayState.difficulty === 'expert' ? '#ef4444' : activeRoleplayState.difficulty === 'intermediaire' ? '#f59e0b' : '#22c55e';

    const evalDiv = document.createElement('div');
    evalDiv.style.cssText = 'background:linear-gradient(135deg,#f3e8ff,#e8d5ff);border-radius:16px;padding:24px;margin:16px 0;box-shadow:0 4px 15px rgba(124,58,237,0.2);';
    evalDiv.innerHTML = `
      <div style="text-align:center;margin-bottom:20px;">
        <div style="font-size:2.5rem;font-weight:800;color:${scoreColor};" id="animScore">0/100</div>
        <div style="font-size:0.9rem;color:#7c3aed;font-weight:600;">Score global</div>
        <div style="font-size:0.75rem;color:${diffColor};margin-top:4px;font-weight:600;">Difficult\u00e9 : ${diffLabel} (x${mult})</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;">
        <div style="background:rgba(255,255,255,0.7);border-radius:10px;padding:12px;text-align:center;">
          <div style="font-size:1.3rem;font-weight:700;color:#1976d2;">${data.ecoute || 0}/100</div>
          <div style="font-size:0.8rem;color:#666;">\u00c9coute</div>
        </div>
        <div style="background:rgba(255,255,255,0.7);border-radius:10px;padding:12px;text-align:center;">
          <div style="font-size:1.3rem;font-weight:700;color:#388e3c;">${data.argumentation || 0}/100</div>
          <div style="font-size:0.8rem;color:#666;">Argumentation</div>
        </div>
        <div style="background:rgba(255,255,255,0.7);border-radius:10px;padding:12px;text-align:center;">
          <div style="font-size:1.3rem;font-weight:700;color:#f57c00;">${data.gestionObjections || 0}/100</div>
          <div style="font-size:0.8rem;color:#666;">Objections</div>
        </div>
        <div style="background:rgba(255,255,255,0.7);border-radius:10px;padding:12px;text-align:center;">
          <div style="font-size:1.3rem;font-weight:700;color:#7b1fa2;">${data.closing || 0}/100</div>
          <div style="font-size:0.8rem;color:#666;">Closing</div>
        </div>
      </div>
      <div style="background:rgba(255,255,255,0.7);border-radius:10px;padding:14px;margin-bottom:12px;">
        <div style="font-weight:700;color:#333;margin-bottom:6px;"><i class="fas fa-comment-dots" style="color:#7c3aed;"></i> Feedback</div>
        <div style="font-size:0.9rem;color:#555;line-height:1.5;">${sanitize(data.feedback || '')}</div>
      </div>
      ${data.points_forts ? '<div style="background:rgba(76,175,80,0.1);border-radius:10px;padding:14px;margin-bottom:12px;"><div style="font-weight:700;color:#388e3c;margin-bottom:6px;"><i class="fas fa-check-circle"></i> Points forts</div><div style="font-size:0.9rem;color:#555;line-height:1.5;">' + sanitize(data.points_forts) + '</div></div>' : ''}
      ${data.axes_amelioration ? '<div style="background:rgba(255,152,0,0.1);border-radius:10px;padding:14px;margin-bottom:12px;"><div style="font-weight:700;color:#f57c00;margin-bottom:6px;"><i class="fas fa-arrow-up"></i> Axes d\x27am\u00e9lioration</div><div style="font-size:0.9rem;color:#555;line-height:1.5;">' + sanitize(data.axes_amelioration) + '</div></div>' : ''}
      <div style="text-align:center;margin-top:16px;padding:18px;background:linear-gradient(135deg,#7c3aed,#9c27b0);border-radius:12px;color:#fff;">
        <div style="font-size:2rem;font-weight:800;" id="animXP">+0 XP</div>
        <div style="font-size:0.85rem;opacity:0.9;">Points d'exp\u00e9rience gagn\u00e9s !</div>
        ${mult > 1 ? '<div style="font-size:0.75rem;opacity:0.8;margin-top:4px;">Bonus difficult\u00e9 x' + mult + ' appliqu\u00e9</div>' : ''}
      </div>
    `;
    chatArea.appendChild(evalDiv);
    chatArea.scrollTop = chatArea.scrollHeight;

    // Animate score and XP counters
    const animScoreEl = document.getElementById('animScore');
    const animXPEl = document.getElementById('animXP');
    let currentScore = 0;
    let currentXP = 0;
    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;
    const scoreStep = score / steps;
    const xpStep = finalXP / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      currentScore = Math.min(Math.round(scoreStep * step), score);
      currentXP = Math.min(Math.round(xpStep * step), finalXP);
      if (animScoreEl) animScoreEl.textContent = currentScore + '/100';
      if (animXPEl) animXPEl.textContent = '+' + currentXP + ' XP';
      if (step >= steps) {
        clearInterval(timer);
        if (animScoreEl) animScoreEl.textContent = score + '/100';
        if (animXPEl) animXPEl.textContent = '+' + finalXP + ' XP';
      }
    }, interval);

    // Add restart button
    const restartDiv = document.createElement('div');
    restartDiv.style.cssText = 'text-align:center;margin-top:16px;';
    restartDiv.innerHTML = '<button onclick="document.querySelector(\x27.rp-back-btn\x27).click()" style="background:linear-gradient(135deg,#7c3aed,#9c27b0);color:#fff;border:none;border-radius:12px;padding:12px 28px;font-size:1rem;font-weight:600;cursor:pointer;box-shadow:0 2px 10px rgba(124,58,237,0.3);"><i class="fas fa-redo"></i> Nouvel exercice</button>';
    chatArea.appendChild(restartDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
  })
  .catch(err => {
    loadingDiv.remove();

    const errDiv = document.createElement('div');
    errDiv.style.cssText = 'background:#ffebee;border-radius:12px;padding:16px;margin:10px 0;color:#c62828;text-align:center;';
    errDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Erreur lors de l\x27\u00e9valuation. <button onclick="finishRoleplay(window._lastScenario)" style="background:#7c3aed;color:#fff;border:none;border-radius:8px;padding:8px 16px;margin-top:8px;cursor:pointer;">R\u00e9essayer</button>';
    chatArea.appendChild(errDiv);
  });
  window._lastScenario = scenario;
}

// ============================================================
// 11. UTILITIES (escapeHtml, sanitize)
// ============================================================
// 12. INITIALIZATION
// ============================================================