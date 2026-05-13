import { getState, saveState } from '../state.js?v=81';
import { addXP, triggerConfetti } from '../notifications.js?v=81';

const CARDS = [
  { id: 'humeur', label: 'Barom\u00e8tre Humeur', icon: 'fa-face-smile', color: '#ef4444', bg: '#fef2f2' },
  { id: 'conges', label: 'Cong\u00e9s', icon: 'fa-umbrella-beach', color: '#0891b2', bg: '#ecfeff' },
  { id: 'entretiens', label: 'Entretiens', icon: 'fa-comments', color: '#7c3aed', bg: '#f5f3ff' },
  { id: 'equipe', label: 'Mon \u00c9quipe', icon: 'fa-users', color: '#059669', bg: '#f0fdf4' },
  { id: 'documents', label: 'Documents', icon: 'fa-folder-open', color: '#d97706', bg: '#fffbeb' },
  { id: 'annuaire', label: 'Annuaire', icon: 'fa-address-book', color: '#6366f1', bg: '#eef2ff' },
];

const SUSPECTS = [
  {
    id: 'lucas',
    name: 'Lucas Moreau',
    role: 'D\u00e9veloppeur Senior',
    seniority: '4 ans',
    age: 34,
    initials: 'LM',
    color: '#3B82F6',
    colorLight: '#eff6ff',
    guilty: false,
    clues: {
      humeur: {
        title: 'Humeur en chute... mais expliqu\u00e9e',
        text: 'Humeur stable \u00e0 7/10 puis chute brutale \u00e0 3/10 il y a 2 mois. Corr\u00e9lation avec un \u00e9v\u00e9nement personnel (s\u00e9paration) not\u00e9 en commentaire par son manager.',
        severity: 'medium',
      },
      conges: {
        title: '15 jours non pris \u2014 habitude connue',
        text: '15 jours non pris. Mais c\u2019est habituel chez lui \u2014 il prend toujours ses cong\u00e9s en \u00e9t\u00e9 d\u2019un bloc. Rien d\u2019anormal.',
        severity: 'low',
      },
      entretiens: {
        title: '\u00c9volution demand\u00e9e... et relanc\u00e9e',
        text: 'Dernier entretien il y a 14 mois. A demand\u00e9 une \u00e9volution tech lead. R\u00e9ponse\u202f: \u00ab\u2009on verra\u2009\u00bb. Frustrant MAIS il a relanc\u00e9 la semaine derni\u00e8re \u2192 signe qu\u2019il y croit encore.',
        severity: 'medium',
      },
      equipe: {
        title: 'Tr\u00e8s actif et engag\u00e9 socialement',
        text: 'Tr\u00e8s actif\u202f! Organise les d\u00e9jeuners tech, mentor des juniors. Fort lien social avec l\u2019\u00e9quipe.',
        severity: 'low',
      },
      documents: {
        title: 'Convention collective consult\u00e9e \u2014 PI\u00c8GE',
        text: 'A consult\u00e9 la convention collective (article pr\u00e9avis). MAIS il aide un coll\u00e8gue qui part et voulait v\u00e9rifier les conditions pour lui.',
        severity: 'medium',
      },
      annuaire: {
        title: 'Consultation annuaire normale',
        text: 'Consulte r\u00e9guli\u00e8rement l\u2019annuaire par d\u00e9partement pour contacter des coll\u00e8gues sur des projets transverses. Aucun comportement inhabituel.',
        severity: 'low',
      },
    },
  },
  {
    id: 'amira',
    name: 'Amira Benali',
    role: 'Chef de projet',
    seniority: '2 ans',
    age: 29,
    initials: 'AB',
    color: '#10B981',
    colorLight: '#f0fdf4',
    guilty: true,
    clues: {
      humeur: {
        title: 'D\u00e9sengagement silencieux',
        text: 'Humeur fluctuante 5-7/10, pas de tendance alarmante en apparence. Mais elle a arr\u00eat\u00e9 de r\u00e9pondre au barom\u00e8tre depuis 3 semaines. D\u00e9sengagement silencieux.',
        severity: 'high',
      },
      conges: {
        title: '3 demi-journ\u00e9es suspectes',
        text: 'Pose r\u00e9guli\u00e8rement, tout valid\u00e9. MAIS a pos\u00e9 3 demi-journ\u00e9es \u00ab\u2009perso\u2009\u00bb les mardis matin le mois dernier. Entretiens d\u2019embauche ailleurs\u202f?',
        severity: 'high',
      },
      entretiens: {
        title: 'Projet IA refus\u00e9 \u2014 d\u00e9\u00e7ue en silence',
        text: 'Entretien il y a 3 mois, feedback positif. MAIS elle avait demand\u00e9 \u00e0 piloter le nouveau projet IA \u2014 refus\u00e9 sans explication. Note interne\u202f: \u00ab\u2009d\u00e9\u00e7ue mais ne le montre pas\u2009\u00bb.',
        severity: 'high',
      },
      equipe: {
        title: 'Participation en baisse',
        text: 'Participation correcte mais en baisse. N\u2019a pas particip\u00e9 au dernier afterwork \u2014 elle qui ne rate jamais rien.',
        severity: 'medium',
      },
      documents: {
        title: 'SIGNAL FORT \u2014 Dossier de candidature',
        text: 'A t\u00e9l\u00e9charg\u00e9 son attestation employeur + fiches de paie des 3 derniers mois + certificat de travail. On t\u00e9l\u00e9charge ces documents quand on pr\u00e9pare un dossier de candidature ailleurs.',
        severity: 'critical',
      },
      annuaire: {
        title: 'Recherches cibl\u00e9es dans l\u2019annuaire',
        text: 'A consult\u00e9 plusieurs fois les fiches de coll\u00e8gues d\u2019autres d\u00e9partements sans lien avec ses projets. Filtre par d\u00e9partement Direction utilis\u00e9 r\u00e9cemment \u2014 inhabituel pour son r\u00f4le.',
        severity: 'high',
      },
    },
  },
  {
    id: 'thomas',
    name: 'Thomas Rivi\u00e8re',
    role: 'Commercial terrain',
    seniority: '6 ans',
    age: 41,
    initials: 'TR',
    color: '#F59E0B',
    colorLight: '#fffbeb',
    guilty: false,
    clues: {
      humeur: {
        title: 'Ne remplit jamais le barom\u00e8tre',
        text: 'Ne remplit JAMAIS le barom\u00e8tre (0 entr\u00e9es). Mais c\u2019est son caract\u00e8re depuis toujours \u2014 les anciens coll\u00e8gues confirment.',
        severity: 'low',
      },
      conges: {
        title: 'Refus li\u00e9s au contexte, arr\u00eats justifi\u00e9s',
        text: '3 demandes refus\u00e9es d\u2019affil\u00e9e + 2 arr\u00eats courts. MAIS les refus sont li\u00e9s \u00e0 la cl\u00f4ture commerciale Q4, et les arr\u00eats \u00e0 une grippe confirm\u00e9e.',
        severity: 'low',
      },
      entretiens: {
        title: 'Ras-le-bol... mais envie de bouger EN INTERNE',
        text: 'Entretien il y a 2 mois, dit \u00ab\u2009ras-le-bol\u2009\u00bb et envie de changement. MAIS en creusant\u202f: il veut changer de SECTEUR commercial en interne, pas quitter l\u2019entreprise.',
        severity: 'medium',
      },
      equipe: {
        title: 'Isol\u00e9... mais normal pour le poste',
        text: 'Isol\u00e9, peu d\u2019interactions. Mais c\u2019est un terrain \u2014 il est chez les clients toute la journ\u00e9e. Normal pour le poste.',
        severity: 'low',
      },
      documents: {
        title: 'Aucune activit\u00e9 suspecte',
        text: 'Aucune activit\u00e9 documents r\u00e9cente. Z\u00e9ro t\u00e9l\u00e9chargement suspect.',
        severity: 'low',
      },
      annuaire: {
        title: 'Annuaire peu utilis\u00e9',
        text: 'Utilisation tr\u00e8s ponctuelle de l\u2019annuaire, uniquement pour retrouver les coordonn\u00e9es de son \u00e9quipe directe. Rien de suspect.',
        severity: 'low',
      },
    },
  },
];

const ACCUSATION_REASONS = [
  { text: 'Frustration li\u00e9e \u00e0 l\u2019\u00e9volution bloqu\u00e9e et d\u00e9sengagement silencieux', correct: true },
  { text: 'Probl\u00e8mes personnels affectant le moral', correct: false },
  { text: 'Mauvaises conditions de travail et cong\u00e9s refus\u00e9s', correct: false },
  { text: 'Manque d\u2019int\u00e9gration dans l\u2019\u00e9quipe', correct: false },
];

const ACCUSATION_ACTIONS = [
  { text: 'Lui confier le projet IA demand\u00e9 + entretien d\u2019\u00e9coute proactif', correct: true },
  { text: 'Augmentation de salaire', correct: false },
  { text: 'Team building et afterworks', correct: false },
  { text: 'Entretien disciplinaire pour d\u00e9sengagement', correct: false },
];

const MAX_INVESTIGATIONS = 9;
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

export function initGameCluedo(container) {
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
            <span class="cl-brief-tag">Enqu\u00eate RH</span>
            <h2>Qui va d\u00e9missionner\u202f?</h2>
            <p>NovaTech Solutions &bull; ESN &bull; 52 salari\u00e9s</p>
          </div>
        </div>

        <div class="cl-brief-context fade-in" style="animation-delay:0.1s">
          <div class="cl-brief-avatar">
            <span>ID</span>
          </div>
          <div class="cl-brief-speech">
            <div class="cl-brief-speaker">Isabelle Dumont <span>DRH</span></div>
            <p>Merci d\u2019\u00eatre venu si vite. J\u2019ai <strong>3 collaborateurs</strong> qui m\u2019inqui\u00e8tent. L\u2019un d\u2019eux va partir, j\u2019en suis s\u00fbre. Vous avez acc\u00e8s \u00e0 l\u2019Univers Collaborateur Symbiose &mdash; utilisez les outils pour mener l\u2019enqu\u00eate.</p>
          </div>
        </div>

        <div class="cl-brief-suspects fade-in" style="animation-delay:0.15s">
          <div class="cl-brief-suspects-label"><i class="fas fa-users"></i> Les suspects</div>
          <div class="cl-brief-suspects-grid">
            ${SUSPECTS.map(s => `
              <div class="cl-brief-suspect-card">
                <div class="cl-avatar-circle" style="background:${s.color}">${s.initials}</div>
                <div class="cl-brief-suspect-info">
                  <div class="cl-brief-suspect-name">${s.name}</div>
                  <div class="cl-brief-suspect-role">${s.role}</div>
                  <div class="cl-brief-suspect-meta">${s.seniority} &bull; ${s.age} ans</div>
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
              <strong>Appliquez-le</strong> sur un suspect pour r\u00e9v\u00e9ler un indice
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
          <button class="btn btn-primary cl-start-btn" id="clStart">
            <i class="fas fa-magnifying-glass"></i> Lancer l\u2019enqu\u00eate
          </button>
        </div>
      </div>
    `;
    container.querySelector('#clStart').addEventListener('click', () => {
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
            <span class="cl-inv-instruction">${selectedCard ? `Cliquez sur un suspect pour appliquer <strong>${CARDS.find(c => c.id === selectedCard).label}</strong>` : 'S\u00e9lectionnez un outil ci-dessous'}</span>
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
                  <div class="cl-inv-dossier-role">${s.role} &bull; ${s.seniority}</div>
                </div>
                <div class="cl-suspicion-meter" title="Niveau de suspicion">
                  <div class="cl-suspicion-dots">
                    ${[1,2,3,4,5].map(i => `<span class="cl-suspicion-dot ${i <= suspicion ? 'active' : ''}" data-suspect="${s.id}" data-level="${i}" style="--dot-active-color:${suspicion >= 4 ? '#ef4444' : suspicion >= 2 ? '#f59e0b' : '#94a3b8'}"></span>`).join('')}
                  </div>
                  <span class="cl-suspicion-label">${suspicion === 0 ? 'Aucun soupc\u0327on' : suspicion <= 2 ? 'L\u00e9ger' : suspicion <= 3 ? 'Mod\u00e9r\u00e9' : 'Fort'}</span>
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
          <button class="btn btn-primary cl-accuse-btn" id="clAccuse" ${investigationsUsed === 0 ? 'disabled' : ''}>
            <i class="fas fa-gavel"></i> Accusation
          </button>
        </div>

        <div id="clToast" class="cl-toast hidden"></div>
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
          showToast(`S\u00e9lectionnez l'outil "${CARDS.find(c => c.id === selectedCard).label}" chez ce suspect.`);
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

    container.querySelector('#clAccuse').addEventListener('click', () => {
      phase = 'accusation';
      accusationStep = 0;
      render();
    });
  }

  function showToast(msg) {
    const toast = container.querySelector('#clToast');
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
        <button class="game-modal-close" id="clRevealClose"><i class="fas fa-times"></i></button>
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
          <button class="btn btn-primary" id="clRevealContinue" style="width:100%">
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

    overlay.querySelector('#clRevealClose').addEventListener('click', closeReveal);
    overlay.querySelector('#clRevealContinue').addEventListener('click', closeReveal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeReveal();
    });
  }

  function renderAccusation() {
    const steps = [
      { label: 'Suspect', icon: 'fa-user-secret' },
      { label: 'Mobile', icon: 'fa-lightbulb' },
      { label: 'Action', icon: 'fa-hand-holding-heart' },
    ];

    let content = '';

    if (accusationStep === 0) {
      content = `
        <div class="cl-acc-question fade-in">
          <div class="cl-acc-question-icon" style="background:#dc2626"><i class="fas fa-user-secret"></i></div>
          <h3>Qui va d\u00e9missionner\u202f?</h3>
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
                  ${suspicion > 0 ? `<span class="cl-acc-stat cl-acc-stat-hot"><i class="fas fa-fire"></i> Suspicion ${suspicion}/5</span>` : ''}
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
          <div class="cl-acc-question-icon" style="background:#7c3aed"><i class="fas fa-lightbulb"></i></div>
          <h3>Pourquoi cette personne va-t-elle partir\u202f?</h3>
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
          <div class="cl-acc-question-icon" style="background:#059669"><i class="fas fa-hand-holding-heart"></i></div>
          <h3>Quelle action aurait pu la retenir\u202f?</h3>
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
        ${accusationStep > 0 ? `<button class="cl-acc-back" id="clAccBack"><i class="fas fa-arrow-left"></i> Retour</button>` : ''}
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

    const backBtn = container.querySelector('#clAccBack');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        accusationStep--;
        render();
      });
    }
  }

  function renderResults() {
    const suspectCorrect = chosenSuspect === 'amira';
    const reasonCorrect = ACCUSATION_REASONS[chosenReason]?.correct === true;
    const actionCorrect = ACCUSATION_ACTIONS[chosenAction]?.correct === true;
    const score = (suspectCorrect ? SCORE_SUSPECT : 0) + (reasonCorrect ? SCORE_REASON : 0) + (actionCorrect ? SCORE_ACTION : 0);
    const maxScore = SCORE_SUSPECT + SCORE_REASON + SCORE_ACTION;

    const tier = score >= 50
      ? { label: 'Profiler RH d\u2019\u00e9lite', icon: 'fa-crown', color: 'gold', desc: 'Vous avez identifi\u00e9 le d\u00e9part silencieux et la bonne action pr\u00e9ventive.' }
      : score >= 30
        ? { label: 'Enqu\u00eateur prometteur', icon: 'fa-magnifying-glass', color: 'blue', desc: 'Bon instinct, mais affinez votre lecture des signaux faibles.' }
        : { label: 'Stagiaire aux affaires class\u00e9es', icon: 'fa-folder-open', color: 'orange', desc: 'Les signaux faibles vous ont \u00e9chapp\u00e9. Relisez le cours sur l\u2019Univers Collaborateur.' };

    const state = getState();
    const gameKey = 'game_cluedo_4';
    const prevBest = state[gameKey] || 0;
    const isNewBest = score > prevBest;
    if (isNewBest) {
      state[gameKey] = score;
      saveState();
    }
    if (score >= 30) addXP(score, 'games');
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
                <div class="cl-verdict-label">Suspect identifi\u00e9</div>
                <div class="cl-verdict-value">${chosenSuspectData?.name || '?'}</div>
                ${!suspectCorrect ? '<div class="cl-verdict-correct">R\u00e9ponse : Amira Benali</div>' : ''}
              </div>
              <div class="cl-verdict-pts ${suspectCorrect ? 'correct' : 'wrong'}">${suspectCorrect ? `+${SCORE_SUSPECT}` : '+0'}</div>
            </div>
            <div class="cl-verdict-row">
              <div class="cl-verdict-check ${reasonCorrect ? 'correct' : 'wrong'}">
                <i class="fas ${reasonCorrect ? 'fa-check' : 'fa-xmark'}"></i>
              </div>
              <div class="cl-verdict-content">
                <div class="cl-verdict-label">Mobile du d\u00e9part</div>
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
                <div class="cl-verdict-label">Action pr\u00e9ventive</div>
                <div class="cl-verdict-value">${ACCUSATION_ACTIONS[chosenAction]?.text || '?'}</div>
                ${!actionCorrect ? `<div class="cl-verdict-correct">R\u00e9ponse : ${ACCUSATION_ACTIONS[0].text}</div>` : ''}
              </div>
              <div class="cl-verdict-pts ${actionCorrect ? 'correct' : 'wrong'}">${actionCorrect ? `+${SCORE_ACTION}` : '+0'}</div>
            </div>
          </div>
        </div>

        <div class="cl-results-reveal fade-in" style="animation-delay:0.2s">
          <h3><i class="fas fa-user-secret"></i> R\u00e9v\u00e9lation : C\u2019est Amira Benali</h3>
          <div class="cl-reveal-profile">
            <div class="cl-avatar-circle" style="background:#10B981">AB</div>
            <div>
              <div style="font-weight:700;color:var(--text-primary)">Amira Benali</div>
              <div style="font-size:13px;color:var(--text-muted)">Chef de projet &bull; 2 ans &bull; 29 ans</div>
            </div>
          </div>
          <div class="cl-reveal-timeline">
            <div class="cl-reveal-event cl-sev-critical">
              <div class="cl-reveal-event-dot"></div>
              <div class="cl-reveal-event-content">
                <div class="cl-reveal-event-tag"><i class="fas fa-folder-open"></i> Documents</div>
                <p>A t\u00e9l\u00e9charg\u00e9 attestation employeur, fiches de paie et certificat de travail. <strong>Signal le plus fort</strong> d\u2019un d\u00e9part imminent.</p>
              </div>
            </div>
            <div class="cl-reveal-event cl-sev-high">
              <div class="cl-reveal-event-dot"></div>
              <div class="cl-reveal-event-content">
                <div class="cl-reveal-event-tag"><i class="fas fa-comments"></i> Entretiens</div>
                <p>Projet IA refus\u00e9 sans explication. D\u00e9\u00e7ue mais silencieuse &mdash; un classique du d\u00e9sengagement.</p>
              </div>
            </div>
            <div class="cl-reveal-event cl-sev-high">
              <div class="cl-reveal-event-dot"></div>
              <div class="cl-reveal-event-content">
                <div class="cl-reveal-event-tag"><i class="fas fa-umbrella-beach"></i> Cong\u00e9s</div>
                <p>3 demi-journ\u00e9es \u00ab perso \u00bb les mardis matin = probable entretiens d\u2019embauche.</p>
              </div>
            </div>
            <div class="cl-reveal-event cl-sev-high">
              <div class="cl-reveal-event-dot"></div>
              <div class="cl-reveal-event-content">
                <div class="cl-reveal-event-tag"><i class="fas fa-face-smile"></i> Humeur</div>
                <p>Arr\u00eat du barom\u00e8tre depuis 3 semaines = d\u00e9sengagement silencieux.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="cl-results-lesson fade-in" style="animation-delay:0.3s">
          <div class="cl-lesson-header"><i class="fas fa-graduation-cap"></i> Le\u00e7on cl\u00e9</div>
          <p>Les collaborateurs qui partent sont souvent ceux qui ne font pas de bruit. Le Barom\u00e8tre Humeur, les Entretiens et surtout les Documents sont vos meilleurs alli\u00e9s pour d\u00e9tecter les d\u00e9parts silencieux.</p>
          <div class="cl-lesson-kpi">
            <i class="fas fa-chart-line"></i>
            <span>Un turnover co\u00fbte entre <strong>6 et 9 mois de salaire</strong>. D\u00e9tecter un d\u00e9part 1 mois avant = \u00e9conomiser des milliers d\u2019euros.</span>
          </div>
        </div>

        <div class="cl-results-actions fade-in" style="animation-delay:0.35s">
          <button class="btn btn-primary" id="clRetry"><i class="fas fa-rotate-right"></i> Recommencer</button>
        </div>
      </div>
    `;

    container.querySelector('#clRetry').addEventListener('click', () => {
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
