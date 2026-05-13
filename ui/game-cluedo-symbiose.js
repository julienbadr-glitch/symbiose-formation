import { getState, saveState } from '../state.js?v=81';
import { addXP, triggerConfetti } from '../notifications.js?v=81';

const CARDS = [
  { id: 'profil', label: 'Profil Entreprise', icon: 'fa-chart-bar', color: '#3b82f6', bg: '#eff6ff' },
  { id: 'besoins', label: 'Besoins RH', icon: 'fa-briefcase', color: '#0891b2', bg: '#ecfeff' },
  { id: 'modules', label: 'Modules Utilis\u00e9s', icon: 'fa-puzzle-piece', color: '#7c3aed', bg: '#f5f3ff' },
  { id: 'budget', label: 'Budget & ROI', icon: 'fa-coins', color: '#d97706', bg: '#fffbeb' },
  { id: 'legal', label: 'Contraintes L\u00e9gales', icon: 'fa-clipboard-list', color: '#059669', bg: '#f0fdf4' },
];

const SUSPECTS = [
  {
    id: 'essentiel',
    name: 'Pack Essentiel',
    role: 'TPE/PME en digitalisation',
    seniority: 'Entr\u00e9e de gamme',
    age: null,
    initials: 'PE',
    color: '#10B981',
    colorLight: '#f0fdf4',
    guilty: false,
    clues: {
      profil: {
        title: 'Micro-entreprise en croissance douce',
        text: 'TPE de 12 salari\u00e9s, secteur services. Croissance mod\u00e9r\u00e9e (+5%/an). Aucun outil RH digitalis\u00e9 \u00e0 ce jour, tout est g\u00e9r\u00e9 sur Excel.',
        severity: 'low',
      },
      besoins: {
        title: 'Besoin basique de structuration',
        text: 'Douleur principale\u202f: les cong\u00e9s sont g\u00e9r\u00e9s par email et les entretiens ne sont jamais r\u00e9alis\u00e9s. Priorit\u00e9\u202f: structurer le pilotage RH au quotidien.',
        severity: 'medium',
      },
      modules: {
        title: 'Int\u00e9ress\u00e9 par les fondamentaux',
        text: 'A test\u00e9 le module Cong\u00e9s et le module Documents. N\u2019a pas regard\u00e9 les modules avanc\u00e9s (Entretiens, Humeur).',
        severity: 'low',
      },
      budget: {
        title: 'Budget tr\u00e8s serr\u00e9',
        text: 'Enveloppe max de 200\u20ac/mois. Attend un ROI rapide sur le temps administratif gagn\u00e9. Budget tr\u00e8s limit\u00e9.',
        severity: 'low',
      },
      legal: {
        title: 'Aucune pression r\u00e9glementaire',
        text: 'Pas de CSE (< 11 salari\u00e9s au d\u00e9marrage), convention collective simple. Aucun audit pr\u00e9vu. RGPD\u202f: basique.',
        severity: 'low',
      },
    },
  },
  {
    id: 'acquisition',
    name: 'Pack Acquisition',
    role: 'PME en forte croissance',
    seniority: 'Recrutement & Onboarding',
    age: null,
    initials: 'PC',
    color: '#3B82F6',
    colorLight: '#eff6ff',
    guilty: true,
    clues: {
      profil: {
        title: 'PME en hyper-croissance',
        text: 'PME de 65 salari\u00e9s, secteur tech/SaaS. Croissance de +40% sur 18 mois. 3 sites en France. Pr\u00e9voit 30 recrutements dans les 6 prochains mois.',
        severity: 'high',
      },
      besoins: {
        title: 'Recrutement et onboarding en urgence',
        text: 'Douleur n\u00b01\u202f: le recrutement est chaotique, pas de suivi candidat. Douleur n\u00b02\u202f: l\u2019onboarding est inexistant, 2 d\u00e9parts en p\u00e9riode d\u2019essai le mois dernier. Urgence absolue.',
        severity: 'critical',
      },
      modules: {
        title: 'A test\u00e9 les modules strat\u00e9giques',
        text: 'A test\u00e9 Recrutement, Int\u00e9grations (Onboarding) et Entretiens. Tr\u00e8s int\u00e9ress\u00e9 par la CVth\u00e8que pour constituer un vivier de talents. Veut une vision compl\u00e8te.',
        severity: 'high',
      },
      budget: {
        title: 'Budget ambitieux avec ROI attendu',
        text: 'Enveloppe de 800\u20ac/mois n\u00e9gociable. Attend un ROI sur la r\u00e9duction du turnover (co\u00fbt estim\u00e9\u202f: 15K\u20ac par d\u00e9part). Le DAF veut des KPIs concrets.',
        severity: 'high',
      },
      legal: {
        title: 'Enjeux li\u00e9s \u00e0 la croissance',
        text: 'Passage du seuil des 50 salari\u00e9s\u202f: obligation CSE, BDESE, entretiens professionnels obligatoires. Audit social pr\u00e9vu au S2. RGPD\u202f: DPO nomm\u00e9 r\u00e9cemment.',
        severity: 'medium',
      },
    },
  },
  {
    id: 'conformite',
    name: 'Pack Conformit\u00e9',
    role: 'Entreprise r\u00e9glement\u00e9e',
    seniority: 'Sp\u00e9cialis\u00e9',
    age: null,
    initials: 'PF',
    color: '#F59E0B',
    colorLight: '#fffbeb',
    guilty: false,
    clues: {
      profil: {
        title: 'Structure stabilis\u00e9e mais r\u00e9gul\u00e9e',
        text: 'Entreprise de 120 salari\u00e9s, secteur BTP. Croissance stable (+3%/an). Multi-sites (5 chantiers). Effectif constant, peu de turnover.',
        severity: 'low',
      },
      besoins: {
        title: 'Conformit\u00e9 avant tout',
        text: 'Douleur principale\u202f: mise en conformit\u00e9 suite \u00e0 un avertissement de l\u2019inspection du travail. Priorit\u00e9\u202f: document unique, affichage obligatoire, suivi m\u00e9decine du travail.',
        severity: 'medium',
      },
      modules: {
        title: 'Focus modules r\u00e9glementaires',
        text: 'A test\u00e9 uniquement le module Documents et le module Obligations. Pas int\u00e9ress\u00e9 par le Recrutement ni la CVth\u00e8que pour le moment.',
        severity: 'low',
      },
      budget: {
        title: 'Budget cibl\u00e9 compliance',
        text: 'Enveloppe de 400\u20ac/mois fl\u00e9ch\u00e9e "conformit\u00e9". Le DAF ne veut pas financer des modules hors p\u00e9rim\u00e8tre l\u00e9gal. ROI attendu\u202f: \u00e9viter les amendes.',
        severity: 'low',
      },
      legal: {
        title: 'SIGNAL FORT \u2014 Pression r\u00e9glementaire maximale',
        text: 'Avertissement inspection du travail re\u00e7u il y a 2 mois. Convention collective BTP tr\u00e8s contraignante. Audit RGPD planifi\u00e9. Obligation BDESE + rapport \u00e9galit\u00e9 H/F en retard.',
        severity: 'critical',
      },
    },
  },
];

const ACCUSATION_REASONS = [
  { text: 'Hyper-croissance avec besoins massifs en recrutement et onboarding', correct: true },
  { text: 'Pression r\u00e9glementaire et conformit\u00e9 obligatoire', correct: false },
  { text: 'Budget limit\u00e9 n\u00e9cessitant une solution \u00e9conomique', correct: false },
  { text: 'Besoin de digitaliser les processus administratifs basiques', correct: false },
];

const ACCUSATION_ACTIONS = [
  { text: 'D\u00e9mo des modules Recrutement + Int\u00e9grations + CVth\u00e8que avec calcul ROI turnover', correct: true },
  { text: 'Pr\u00e9sentation du module Documents et conformit\u00e9', correct: false },
  { text: 'Proposition du pack le moins cher pour s\u00e9curiser la signature', correct: false },
  { text: 'Audit complet de tous les 10 modules sans prioriser', correct: false },
];

const MAX_INVESTIGATIONS = 8;
const SCORE_SUSPECT = 25;
const SCORE_REASON = 20;
const SCORE_ACTION = 15;

function sevLabel(sev) {
  if (sev === 'critical') return 'Critique';
  if (sev === 'high') return '\u00c9lev\u00e9';
  if (sev === 'medium') return 'Mod\u00e9r\u00e9';
  return 'Faible';
}

function sevIcon(sev) {
  if (sev === 'critical') return 'fa-circle-exclamation';
  if (sev === 'high') return 'fa-triangle-exclamation';
  if (sev === 'medium') return 'fa-minus-circle';
  return 'fa-check-circle';
}

export function initGameCluedoSymbiose(container) {
  let phase = 'briefing';
  let investigated = {};
  let investigationsUsed = 0;
  let selectedCard = null;
  let accusationStep = 0;
  let chosenSuspect = null;
  let chosenReason = null;
  let chosenAction = null;
  let notepad = {};

  SUSPECTS.forEach(s => {
    investigated[s.id] = {};
    notepad[s.id] = { suspicion: 0 };
  });

  function render() {
    switch (phase) {
      case 'briefing': renderBriefing(); break;
      case 'investigation': renderInvestigation(); break;
      case 'accusation': renderAccusation(); break;
      case 'results': renderResults(); break;
    }
  }

  function renderBriefing() {
    container.innerHTML = `
      <div class="cl-briefing">
        <div class="cl-brief-banner fade-in">
          <div class="cl-brief-badge">
            <i class="fas fa-magnifying-glass"></i>
          </div>
          <div class="cl-brief-titles">
            <span class="cl-brief-tag">Enqu\u00eate Commerciale</span>
            <h2>Quel pack pour quel client\u202f?</h2>
            <p>Cluedo Symbiose &bull; \u00c9cosyst\u00e8me &bull; 3 Packs</p>
          </div>
        </div>

        <div class="cl-brief-context fade-in" style="animation-delay:0.1s">
          <div class="cl-brief-avatar" style="background:#2563eb;box-shadow:0 4px 12px rgba(37,99,235,0.3)">
            <span>TM</span>
          </div>
          <div class="cl-brief-speech">
            <div class="cl-brief-speaker">Thomas Martin <span style="color:#2563eb;background:#eff6ff">Directeur Commercial</span></div>
            <p>Un nouveau prospect vient de nous contacter. Il a des besoins sp\u00e9cifiques mais je n\u2019arrive pas \u00e0 d\u00e9terminer quel pack lui recommander. <strong>Analysez les indices</strong> et trouvez le bon pack Symbiose\u202f!</p>
          </div>
        </div>

        <div class="cl-brief-suspects fade-in" style="animation-delay:0.15s">
          <div class="cl-brief-suspects-label"><i class="fas fa-box-open"></i> Les packs suspects</div>
          <div class="cl-brief-suspects-grid">
            ${SUSPECTS.map(s => `
              <div class="cl-brief-suspect-card">
                <div class="cl-avatar-circle" style="background:${s.color}">${s.initials}</div>
                <div class="cl-brief-suspect-info">
                  <div class="cl-brief-suspect-name">${s.name}</div>
                  <div class="cl-brief-suspect-role">${s.role}</div>
                  <div class="cl-brief-suspect-meta">${s.seniority}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="cl-brief-tools fade-in" style="animation-delay:0.2s">
          <div class="cl-brief-tools-label"><i class="fas fa-toolbox"></i> Vos outils d'investigation</div>
          <div class="cl-brief-tools-grid">
            ${CARDS.map(c => `
              <div class="cl-brief-tool" style="--tool-color:${c.color};--tool-bg:${c.bg}">
                <i class="fas ${c.icon}"></i>
                <span>${c.label}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="cl-brief-rules fade-in" style="animation-delay:0.25s">
          <div class="cl-brief-rule">
            <div class="cl-brief-rule-num">1</div>
            <div>
              <strong>Choisissez un outil</strong> dans votre barre d'investigation
            </div>
          </div>
          <div class="cl-brief-rule">
            <div class="cl-brief-rule-num">2</div>
            <div>
              <strong>Appliquez-le</strong> sur un pack pour r\u00e9v\u00e9ler un indice
            </div>
          </div>
          <div class="cl-brief-rule">
            <div class="cl-brief-rule-num">3</div>
            <div>
              <strong>8 investigations</strong> max sur 15 combinaisons &mdash; choisissez bien !
            </div>
          </div>
        </div>

        <div class="cl-brief-start fade-in" style="animation-delay:0.3s">
          <button class="btn btn-primary cl-start-btn" id="clSymStart">
            <i class="fas fa-magnifying-glass"></i> Lancer l\u2019enqu\u00eate
          </button>
        </div>
      </div>
    `;
    container.querySelector('#clSymStart').addEventListener('click', () => {
      phase = 'investigation';
      render();
    });
  }

  function renderInvestigation() {
    const remaining = MAX_INVESTIGATIONS - investigationsUsed;
    const totalRevealed = Object.values(investigated).reduce((sum, obj) => sum + Object.keys(obj).length, 0);

    container.innerHTML = `
      <div class="cl-inv-wrapper">
        <div class="cl-inv-topbar fade-in">
          <div class="cl-inv-topbar-left">
            <span class="cl-inv-phase-badge"><i class="fas fa-magnifying-glass"></i> Enqu\u00eate</span>
            <span class="cl-inv-instruction">${selectedCard ? `Cliquez sur un pack pour appliquer <strong>${CARDS.find(c => c.id === selectedCard).label}</strong>` : 'S\u00e9lectionnez un outil ci-dessous'}</span>
          </div>
          <div class="cl-inv-counters">
            <div class="cl-inv-counter">
              <i class="fas fa-search"></i>
              <span class="cl-inv-counter-value">${remaining}</span>
              <span class="cl-inv-counter-label">restantes</span>
            </div>
            <div class="cl-inv-counter cl-inv-counter-clues">
              <i class="fas fa-file-lines"></i>
              <span class="cl-inv-counter-value">${totalRevealed}</span>
              <span class="cl-inv-counter-label">indices</span>
            </div>
          </div>
        </div>

        <div class="cl-inv-progress">
          <div class="cl-inv-progress-fill" style="width:${(investigationsUsed / MAX_INVESTIGATIONS) * 100}%"></div>
        </div>

        <div class="cl-inv-board fade-in" style="animation-delay:0.05s">
          ${SUSPECTS.map(s => {
            const revealedCount = Object.keys(investigated[s.id]).length;
            const suspicion = notepad[s.id].suspicion;
            return `
            <div class="cl-inv-dossier ${selectedCard && !investigated[s.id][selectedCard] && remaining > 0 ? 'cl-inv-dossier-target' : ''}" data-suspect="${s.id}">
              <div class="cl-inv-dossier-header" style="--suspect-color:${s.color}">
                <div class="cl-avatar-circle sm" style="background:${s.color}">${s.initials}</div>
                <div class="cl-inv-dossier-identity">
                  <div class="cl-inv-dossier-name">${s.name}</div>
                  <div class="cl-inv-dossier-role">${s.role}</div>
                </div>
                <div class="cl-suspicion-meter" title="Niveau de conviction">
                  <div class="cl-suspicion-dots">
                    ${[1,2,3,4,5].map(i => `<span class="cl-suspicion-dot ${i <= suspicion ? 'active' : ''}" data-suspect="${s.id}" data-level="${i}" style="--dot-active-color:${suspicion >= 4 ? '#10b981' : suspicion >= 2 ? '#3b82f6' : '#94a3b8'}"></span>`).join('')}
                  </div>
                  <span class="cl-suspicion-label">${suspicion === 0 ? 'Aucune conviction' : suspicion <= 2 ? 'Possible' : suspicion <= 3 ? 'Probable' : 'Certain'}</span>
                </div>
              </div>
              <div class="cl-inv-dossier-clues">
                ${CARDS.map(c => {
                  const clue = investigated[s.id][c.id];
                  if (clue) {
                    return `
                      <div class="cl-clue-card cl-sev-${clue.severity}">
                        <div class="cl-clue-card-top">
                          <i class="fas ${c.icon}" style="color:${c.color}"></i>
                          <span class="cl-clue-card-title">${clue.title}</span>
                          <span class="cl-clue-sev-badge cl-sev-badge-${clue.severity}"><i class="fas ${sevIcon(clue.severity)}"></i> ${sevLabel(clue.severity)}</span>
                        </div>
                        <p class="cl-clue-card-text">${clue.text}</p>
                      </div>
                    `;
                  }
                  const canPlay = selectedCard === c.id && remaining > 0;
                  return `
                    <div class="cl-clue-slot ${canPlay ? 'cl-clue-slot-active' : ''}" data-suspect="${s.id}" data-card="${c.id}">
                      <i class="fas ${c.icon}" style="color:${c.color};opacity:${canPlay ? 1 : 0.25}"></i>
                      <span>${c.label}</span>
                      ${canPlay ? '<i class="fas fa-plus cl-slot-plus"></i>' : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;}).join('')}
        </div>

        <div class="cl-inv-toolbar fade-in" style="animation-delay:0.1s">
          <div class="cl-toolbar-section">
            <div class="cl-toolbar-label">Outils d'investigation</div>
            <div class="cl-toolbar-cards">
              ${CARDS.map(c => `
                <button class="cl-toolbar-card ${selectedCard === c.id ? 'selected' : ''}" data-card="${c.id}" style="--tc-color:${c.color};--tc-bg:${c.bg}" ${remaining === 0 ? 'disabled' : ''}>
                  <i class="fas ${c.icon}"></i>
                  <span>${c.label}</span>
                </button>
              `).join('')}
            </div>
          </div>
          <button class="btn btn-primary cl-accuse-btn" id="clSymAccuse" ${investigationsUsed === 0 ? 'disabled' : ''}>
            <i class="fas fa-gavel"></i> Verdict
          </button>
        </div>

        <div id="clSymToast" class="cl-toast hidden"></div>
      </div>
    `;

    container.querySelectorAll('.cl-toolbar-card').forEach(btn => {
      btn.addEventListener('click', () => {
        if (remaining === 0) return;
        selectedCard = selectedCard === btn.dataset.card ? null : btn.dataset.card;
        render();
      });
    });

    container.querySelectorAll('.cl-clue-slot').forEach(slot => {
      slot.addEventListener('click', () => {
        const cardId = slot.dataset.card;
        const suspectId = slot.dataset.suspect;
        if (!selectedCard) {
          showToast('S\u00e9lectionnez d\u2019abord un outil en bas\u202f!');
          return;
        }
        if (remaining === 0) return;
        if (selectedCard !== cardId) {
          showToast(`S\u00e9lectionnez l'outil "${CARDS.find(c => c.id === selectedCard).label}" chez ce pack.`);
          return;
        }
        playCard(suspectId, cardId);
      });
    });

    container.querySelectorAll('.cl-suspicion-dot').forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        const sId = dot.dataset.suspect;
        const level = parseInt(dot.dataset.level);
        notepad[sId].suspicion = notepad[sId].suspicion === level ? level - 1 : level;
        render();
      });
    });

    container.querySelector('#clSymAccuse').addEventListener('click', () => {
      phase = 'accusation';
      accusationStep = 0;
      render();
    });
  }

  function showToast(msg) {
    const toast = container.querySelector('#clSymToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove('hidden');
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); toast.classList.add('hidden'); }, 2500);
  }

  function playCard(suspectId, cardId) {
    const suspect = SUSPECTS.find(s => s.id === suspectId);
    const clue = suspect.clues[cardId];
    investigated[suspectId][cardId] = clue;
    investigationsUsed++;
    selectedCard = null;
    showClueReveal(suspect, CARDS.find(c => c.id === cardId), clue);
  }

  function showClueReveal(suspect, card, clue) {
    const overlay = document.createElement('div');
    overlay.className = 'cl-reveal-overlay fade-in';
    overlay.innerHTML = `
      <div class="cl-reveal-modal">
        <button class="game-modal-close" id="clSymRevealClose"><i class="fas fa-times"></i></button>
        <div class="cl-reveal-top" style="--reveal-color:${suspect.color}">
          <div class="cl-avatar-circle" style="background:${suspect.color}">${suspect.initials}</div>
          <div class="cl-reveal-who">
            <div class="cl-reveal-name">${suspect.name}</div>
            <div class="cl-reveal-tool"><i class="fas ${card.icon}" style="color:${card.color}"></i> ${card.label}</div>
          </div>
        </div>
        <div class="cl-reveal-body cl-sev-${clue.severity}">
          <div class="cl-reveal-sev">
            <i class="fas ${sevIcon(clue.severity)}"></i>
            <span>${sevLabel(clue.severity)}</span>
          </div>
          <h3>${clue.title}</h3>
          <p>${clue.text}</p>
        </div>
        <div class="cl-reveal-footer">
          <button class="btn btn-primary" id="clSymRevealContinue" style="width:100%">
            <i class="fas fa-arrow-right"></i> Continuer l'enqu\u00eate
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    function closeReveal() {
      overlay.remove();
      render();
    }

    overlay.querySelector('#clSymRevealClose').addEventListener('click', closeReveal);
    overlay.querySelector('#clSymRevealContinue').addEventListener('click', closeReveal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeReveal();
    });
  }

  function renderAccusation() {
    const steps = [
      { label: 'Pack', icon: 'fa-box-open' },
      { label: 'Raison', icon: 'fa-lightbulb' },
      { label: 'Action', icon: 'fa-rocket' },
    ];

    let content = '';

    if (accusationStep === 0) {
      content = `
        <div class="cl-acc-question fade-in">
          <div class="cl-acc-question-icon" style="background:#2563eb"><i class="fas fa-box-open"></i></div>
          <h3>Quel pack recommander \u00e0 ce prospect\u202f?</h3>
        </div>
        <div class="cl-acc-suspect-choices fade-in" style="animation-delay:0.1s">
          ${SUSPECTS.map(s => {
            const revealedCount = Object.keys(investigated[s.id]).length;
            const suspicion = notepad[s.id].suspicion;
            return `
              <button class="cl-acc-suspect-btn" data-suspect="${s.id}" style="--s-color:${s.color}">
                <div class="cl-avatar-circle sm" style="background:${s.color}">${s.initials}</div>
                <div class="cl-acc-suspect-info">
                  <div class="cl-acc-suspect-name">${s.name}</div>
                  <div class="cl-acc-suspect-role">${s.role}</div>
                </div>
                <div class="cl-acc-suspect-stats">
                  <span class="cl-acc-stat"><i class="fas fa-file-lines"></i> ${revealedCount} indice${revealedCount > 1 ? 's' : ''}</span>
                  ${suspicion > 0 ? `<span class="cl-acc-stat cl-acc-stat-hot" style="color:#10b981"><i class="fas fa-thumbs-up"></i> Conviction ${suspicion}/5</span>` : ''}
                </div>
                <i class="fas fa-chevron-right cl-acc-arrow"></i>
              </button>
            `;
          }).join('')}
        </div>
      `;
    } else if (accusationStep === 1) {
      content = `
        <div class="cl-acc-question fade-in">
          <div class="cl-acc-question-icon" style="background:#d97706"><i class="fas fa-lightbulb"></i></div>
          <h3>Pourquoi ce pack est-il le plus adapt\u00e9\u202f?</h3>
        </div>
        <div class="cl-acc-reason-choices fade-in" style="animation-delay:0.1s">
          ${ACCUSATION_REASONS.map((r, i) => `
            <button class="cl-acc-reason-btn" data-idx="${i}">
              <span class="cl-acc-letter">${['A', 'B', 'C', 'D'][i]}</span>
              <span>${r.text}</span>
            </button>
          `).join('')}
        </div>
      `;
    } else if (accusationStep === 2) {
      content = `
        <div class="cl-acc-question fade-in">
          <div class="cl-acc-question-icon" style="background:#059669"><i class="fas fa-rocket"></i></div>
          <h3>Quelle action commerciale proposer\u202f?</h3>
        </div>
        <div class="cl-acc-reason-choices fade-in" style="animation-delay:0.1s">
          ${ACCUSATION_ACTIONS.map((a, i) => `
            <button class="cl-acc-reason-btn" data-idx="${i}">
              <span class="cl-acc-letter">${['A', 'B', 'C', 'D'][i]}</span>
              <span>${a.text}</span>
            </button>
          `).join('')}
        </div>
      `;
    }

    container.innerHTML = `
      <div class="cl-accusation-wrapper">
        <div class="cl-acc-stepper fade-in">
          ${steps.map((st, i) => `
            <div class="cl-acc-step ${i < accusationStep ? 'done' : i === accusationStep ? 'active' : ''}">
              <div class="cl-acc-step-circle">
                ${i < accusationStep ? '<i class="fas fa-check"></i>' : `<i class="fas ${st.icon}"></i>`}
              </div>
              <span>${st.label}</span>
            </div>
            ${i < steps.length - 1 ? '<div class="cl-acc-step-line"></div>' : ''}
          `).join('')}
        </div>
        ${content}
        ${accusationStep > 0 ? `<button class="cl-acc-back" id="clSymAccBack"><i class="fas fa-arrow-left"></i> Retour</button>` : ''}
      </div>
    `;

    if (accusationStep === 0) {
      container.querySelectorAll('.cl-acc-suspect-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          chosenSuspect = btn.dataset.suspect;
          accusationStep = 1;
          render();
        });
      });
    } else if (accusationStep === 1) {
      container.querySelectorAll('.cl-acc-reason-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          chosenReason = parseInt(btn.dataset.idx);
          accusationStep = 2;
          render();
        });
      });
    } else if (accusationStep === 2) {
      container.querySelectorAll('.cl-acc-reason-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          chosenAction = parseInt(btn.dataset.idx);
          phase = 'results';
          render();
        });
      });
    }

    const backBtn = container.querySelector('#clSymAccBack');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        accusationStep--;
        render();
      });
    }
  }

  function renderResults() {
    const suspectCorrect = chosenSuspect === 'croissance';
    const reasonCorrect = ACCUSATION_REASONS[chosenReason]?.correct === true;
    const actionCorrect = ACCUSATION_ACTIONS[chosenAction]?.correct === true;
    const score = (suspectCorrect ? SCORE_SUSPECT : 0) + (reasonCorrect ? SCORE_REASON : 0) + (actionCorrect ? SCORE_ACTION : 0);
    const maxScore = SCORE_SUSPECT + SCORE_REASON + SCORE_ACTION;

    const tier = score >= 50
      ? { label: 'Expert \u00c9cosyst\u00e8me', icon: 'fa-crown', color: 'gold', desc: 'Vous ma\u00eetrisez l\u2019architecture Symbiose et savez matcher un prospect avec le bon pack.' }
      : score >= 30
        ? { label: 'Consultant prometteur', icon: 'fa-magnifying-glass', color: 'blue', desc: 'Bon instinct commercial, mais affinez votre analyse des signaux d\u2019achat.' }
        : { label: 'Stagiaire avant-vente', icon: 'fa-folder-open', color: 'orange', desc: 'Les indices vous ont \u00e9chapp\u00e9. Relisez le cours sur l\u2019\u00c9cosyst\u00e8me Symbiose.' };

    const state = getState();
    const gameKey = 'game_cluedo_2';
    const prevBest = state[gameKey] || 0;
    const isNewBest = score > prevBest;
    if (isNewBest) {
      state[gameKey] = score;
      saveState();
    }
    if (score >= 30) addXP(score);
    if (score === 60) triggerConfetti();

    const chosenSuspectData = SUSPECTS.find(s => s.id === chosenSuspect);

    container.innerHTML = `
      <div class="cl-results-wrapper">
        <div class="cl-results-hero fade-in cl-results-${tier.color}">
          <div class="cl-results-icon-wrap"><i class="fas ${tier.icon}"></i></div>
          <div class="cl-results-score">${score}<span>/${maxScore}</span></div>
          <h2>${tier.label}</h2>
          <p>${tier.desc}</p>
          ${isNewBest ? '<div class="cl-results-best"><i class="fas fa-arrow-up"></i> Nouveau record</div>' : ''}
        </div>

        <div class="cl-results-verdict fade-in" style="animation-delay:0.1s">
          <h3><i class="fas fa-clipboard-check"></i> Votre verdict</h3>
          <div class="cl-verdict-rows">
            <div class="cl-verdict-row">
              <div class="cl-verdict-check ${suspectCorrect ? 'correct' : 'wrong'}">
                <i class="fas ${suspectCorrect ? 'fa-check' : 'fa-xmark'}"></i>
              </div>
              <div class="cl-verdict-content">
                <div class="cl-verdict-label">Pack recommand\u00e9</div>
                <div class="cl-verdict-value">${chosenSuspectData?.name || '?'}</div>
                ${!suspectCorrect ? '<div class="cl-verdict-correct">R\u00e9ponse : Pack Acquisition</div>' : ''}
              </div>
              <div class="cl-verdict-pts ${suspectCorrect ? 'correct' : 'wrong'}">${suspectCorrect ? `+${SCORE_SUSPECT}` : '+0'}</div>
            </div>
            <div class="cl-verdict-row">
              <div class="cl-verdict-check ${reasonCorrect ? 'correct' : 'wrong'}">
                <i class="fas ${reasonCorrect ? 'fa-check' : 'fa-xmark'}"></i>
              </div>
              <div class="cl-verdict-content">
                <div class="cl-verdict-label">Raison principale</div>
                <div class="cl-verdict-value">${ACCUSATION_REASONS[chosenReason]?.text || '?'}</div>
                ${!reasonCorrect ? `<div class="cl-verdict-correct">R\u00e9ponse : ${ACCUSATION_REASONS[0].text}</div>` : ''}
              </div>
              <div class="cl-verdict-pts ${reasonCorrect ? 'correct' : 'wrong'}">${reasonCorrect ? `+${SCORE_REASON}` : '+0'}</div>
            </div>
            <div class="cl-verdict-row">
              <div class="cl-verdict-check ${actionCorrect ? 'correct' : 'wrong'}">
                <i class="fas ${actionCorrect ? 'fa-check' : 'fa-xmark'}"></i>
              </div>
              <div class="cl-verdict-content">
                <div class="cl-verdict-label">Action commerciale</div>
                <div class="cl-verdict-value">${ACCUSATION_ACTIONS[chosenAction]?.text || '?'}</div>
                ${!actionCorrect ? `<div class="cl-verdict-correct">R\u00e9ponse : ${ACCUSATION_ACTIONS[0].text}</div>` : ''}
              </div>
              <div class="cl-verdict-pts ${actionCorrect ? 'correct' : 'wrong'}">${actionCorrect ? `+${SCORE_ACTION}` : '+0'}</div>
            </div>
          </div>
        </div>

        <div class="cl-results-reveal fade-in" style="animation-delay:0.2s">
          <h3><i class="fas fa-box-open"></i> R\u00e9v\u00e9lation : C\u2019est le Pack Acquisition</h3>
          <div class="cl-reveal-profile">
            <div class="cl-avatar-circle" style="background:#3B82F6">PC</div>
            <div>
              <div style="font-weight:700;color:var(--text-primary)">Pack Acquisition</div>
              <div style="font-size:13px;color:var(--text-muted)">PME en hyper-croissance &bull; 65 salari\u00e9s &bull; +40% croissance</div>
            </div>
          </div>
          <div class="cl-reveal-timeline">
            <div class="cl-reveal-event cl-sev-critical">
              <div class="cl-reveal-event-dot"></div>
              <div class="cl-reveal-event-content">
                <div class="cl-reveal-event-tag"><i class="fas fa-briefcase"></i> Besoins RH</div>
                <p>Recrutement chaotique + onboarding inexistant = 2 d\u00e9parts en p\u00e9riode d\u2019essai. <strong>Signal le plus fort</strong> d\u2019un besoin Pack Acquisition.</p>
              </div>
            </div>
            <div class="cl-reveal-event cl-sev-high">
              <div class="cl-reveal-event-dot"></div>
              <div class="cl-reveal-event-content">
                <div class="cl-reveal-event-tag"><i class="fas fa-chart-bar"></i> Profil Entreprise</div>
                <p>+40% de croissance en 18 mois avec 30 recrutements pr\u00e9vus. Seul le Pack Acquisition couvre ce volume.</p>
              </div>
            </div>
            <div class="cl-reveal-event cl-sev-high">
              <div class="cl-reveal-event-dot"></div>
              <div class="cl-reveal-event-content">
                <div class="cl-reveal-event-tag"><i class="fas fa-puzzle-piece"></i> Modules Utilis\u00e9s</div>
                <p>A test\u00e9 Recrutement, Int\u00e9grations (Onboarding), Entretiens et CVth\u00e8que &mdash; tous les modules strat\u00e9giques du Pack Acquisition.</p>
              </div>
            </div>
            <div class="cl-reveal-event cl-sev-high">
              <div class="cl-reveal-event-dot"></div>
              <div class="cl-reveal-event-content">
                <div class="cl-reveal-event-tag"><i class="fas fa-coins"></i> Budget & ROI</div>
                <p>800\u20ac/mois avec un ROI attendu sur la r\u00e9duction du turnover. Budget align\u00e9 avec le Pack Acquisition.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="cl-results-lesson fade-in" style="animation-delay:0.3s">
          <div class="cl-lesson-header"><i class="fas fa-graduation-cap"></i> Le\u00e7on cl\u00e9</div>
          <p>Pour identifier le bon pack Symbiose, croisez toujours le <strong>profil de croissance</strong>, les <strong>besoins RH prioritaires</strong> et les <strong>modules test\u00e9s</strong>. Un prospect en hyper-croissance avec des douleurs recrutement ne se contentera jamais d\u2019un Pack Essentiel.</p>
          <div class="cl-lesson-kpi">
            <i class="fas fa-chart-line"></i>
            <span>Un mauvais matching pack/client entra\u00eene <strong>40% de churn \u00e0 12 mois</strong>. Le bon pack d\u00e8s le d\u00e9part = un client fid\u00e8le et un upsell naturel.</span>
          </div>
        </div>

        <div class="cl-results-actions fade-in" style="animation-delay:0.35s">
          <button class="btn btn-primary" id="clSymRetry"><i class="fas fa-rotate-right"></i> Recommencer</button>
        </div>
      </div>
    `;

    container.querySelector('#clSymRetry').addEventListener('click', () => {
      phase = 'briefing';
      investigationsUsed = 0;
      selectedCard = null;
      accusationStep = 0;
      chosenSuspect = null;
      chosenReason = null;
      chosenAction = null;
      SUSPECTS.forEach(s => {
        investigated[s.id] = {};
        notepad[s.id] = { suspicion: 0 };
      });
      render();
    });
  }

  render();
}
