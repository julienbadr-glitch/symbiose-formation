import { getState, saveState } from '../state.js?v=81';
import { addXP, triggerConfetti } from '../notifications.js?v=81';

const DEMO_BLOCKS = [
  { id: 'dashboard', label: 'Dashboard Admin', icon: 'fa-chart-line', duration: '2 min', color: '#94a3b8', bg: '#f8fafc', fixed: true },
  { id: 'ats', label: 'ATS en Live', icon: 'fa-rocket', duration: '6 min', color: '#3b82f6', bg: '#eff6ff', wow: true },
  { id: 'collab', label: 'Univers Collaborateur', icon: 'fa-users', duration: '5 min', color: '#10b981', bg: '#f0fdf4', wow: true },
  { id: 'conges', label: 'Cong\u00e9s, Entretiens & Humeur', icon: 'fa-calendar-days', duration: '5 min', color: '#eab308', bg: '#fefce8', wow: false },
  { id: 'conformite', label: 'Obligations & Conformit\u00e9', icon: 'fa-shield-halved', duration: '4 min', color: '#ef4444', bg: '#fef2f2', wow: false },
  { id: 'recap', label: 'R\u00e9cap Personnalis\u00e9', icon: 'fa-bullseye', duration: '3 min', color: '#94a3b8', bg: '#f8fafc', fixed: true },
];

const MOVABLE_IDS = ['ats', 'collab', 'conges', 'conformite'];

const PROSPECTS = [
  {
    id: 'marc',
    name: 'Marc Dupont',
    role: 'Dirigeant PME industrielle',
    company: '45 salari\u00e9s',
    icon: 'fa-user-tie',
    color: '#3b82f6',
    colorLight: '#eff6ff',
    avatar: 'MD',
    emoji: { low: '\ud83c\udfe2', mid: '\ud83c\udfd7\ufe0f', high: '\ud83c\udfaf' },
    painMain: 'On recrute 5 postes techniques et on gal\u00e8re depuis 6 mois.',
    painSecondary: 'La conformit\u00e9 et les documents RH, c\u2019est le comptable qui g\u00e8re tant bien que mal.',
    optimalOrder: ['dashboard', 'ats', 'collab', 'conges', 'conformite', 'recap'],
    wows: [
      {
        blockId: 'ats',
        question: 'Quel argument WOW pour l\u2019ATS en Live\u202f?',
        options: [
          { text: 'Je cr\u00e9e un recrutement sous vos yeux. L\u2019IA r\u00e9dige l\u2019offre en 30 secondes, on la diffuse sur 6 jobboards. Fini les 6 mois sans r\u00e9sultat.', points: 10, quality: 'good' },
          { text: 'Notre ATS est le plus complet du march\u00e9 avec 50 fonctionnalit\u00e9s.', points: 0, quality: 'bad' },
          { text: 'Avec Symbiose, le recrutement devient facile.', points: 5, quality: 'medium' },
        ],
      },
      {
        blockId: 'collab',
        question: 'Quel argument WOW pour l\u2019Univers Collaborateur\u202f?',
        options: [
          { text: 'Et quand votre nouveau recrut\u00e9 arrive, il a son espace d\u00e8s le J1. Cong\u00e9s, entretiens, \u00e9quipe \u2014 l\u2019int\u00e9gration est imm\u00e9diate.', points: 10, quality: 'good' },
          { text: 'Le barom\u00e8tre Humeur permet de suivre le bien-\u00eatre.', points: 5, quality: 'medium' },
          { text: 'Chaque salari\u00e9 a un compte Symbiose.', points: 0, quality: 'bad' },
        ],
      },
    ],
  },
  {
    id: 'sophie',
    name: 'Sophie Lemaire',
    role: 'DRH groupe retail',
    company: '120 salari\u00e9s',
    icon: 'fa-user-tie',
    color: '#10b981',
    colorLight: '#f0fdf4',
    avatar: 'SL',
    emoji: { low: '\ud83d\udcca', mid: '\ud83d\udcc8', high: '\ud83c\udfc6' },
    painMain: 'On a un turnover de 25%, je ne comprends pas pourquoi les gens partent.',
    painSecondary: 'Le recrutement va bien, on a un cabinet. Mais l\u2019int\u00e9gration est catastrophique.',
    optimalOrder: ['dashboard', 'collab', 'conges', 'ats', 'conformite', 'recap'],
    wows: [
      {
        blockId: 'collab',
        question: 'Quel argument WOW pour l\u2019Univers Collaborateur\u202f?',
        options: [
          { text: 'Le barom\u00e8tre Humeur vous aurait alert\u00e9 avant ces d\u00e9parts. Vous voyez l\u2019humeur agr\u00e9g\u00e9e sur 6 mois \u2014 les signaux faibles remontent avant qu\u2019il soit trop tard. Un d\u00e9part co\u00fbte 6 \u00e0 9 mois de salaire.', points: 10, quality: 'good' },
          { text: 'Vos salari\u00e9s peuvent poser leurs cong\u00e9s en 3 clics.', points: 0, quality: 'bad' },
          { text: 'L\u2019Univers Collaborateur am\u00e9liore l\u2019exp\u00e9rience salari\u00e9.', points: 5, quality: 'medium' },
        ],
      },
      {
        blockId: 'ats',
        question: 'Quel argument WOW pour l\u2019ATS en Live\u202f?',
        options: [
          { text: 'Et pour remplacer ceux qui partent en attendant de r\u00e9duire le turnover, l\u2019ATS structure votre pipeline. Vous gardez les CV de chaque candidature \u2014 votre CVth\u00e8que se constitue.', points: 10, quality: 'good' },
          { text: 'L\u2019IA r\u00e9dige vos offres en 30 secondes.', points: 5, quality: 'medium' },
          { text: 'Vous n\u2019aurez plus besoin de cabinet.', points: 0, quality: 'bad' },
        ],
      },
    ],
  },
  {
    id: 'philippe',
    name: 'Philippe Renaud',
    role: 'DAF PME BTP',
    company: '85 salari\u00e9s',
    icon: 'fa-user-tie',
    color: '#f59e0b',
    colorLight: '#fefce8',
    avatar: 'PR',
    emoji: { low: '\ud83d\udee1\ufe0f', mid: '\ud83d\udd12', high: '\u2705' },
    painMain: 'On a eu un contr\u00f4le URSSAF, on n\u2019\u00e9tait pas pr\u00eats. Plus jamais \u00e7a.',
    painSecondary: 'Les entretiens professionnels obligatoires, personne ne les fait.',
    optimalOrder: ['dashboard', 'conformite', 'conges', 'collab', 'ats', 'recap'],
    wows: [
      {
        blockId: 'conformite',
        question: 'Quel argument WOW pour Obligations & Conformit\u00e9\u202f?',
        options: [
          { text: 'Le DUERP se met \u00e0 jour automatiquement, le registre du personnel est toujours pr\u00eat. En cas de contr\u00f4le, tout est accessible en 2 clics. Plus de stress, plus de dossier papier.', points: 10, quality: 'good' },
          { text: 'Symbiose g\u00e8re aussi le recrutement.', points: 0, quality: 'bad' },
          { text: 'La conformit\u00e9 est importante pour une entreprise.', points: 0, quality: 'medium' },
        ],
      },
      {
        blockId: 'conges',
        question: 'Quel argument WOW pour Cong\u00e9s, Entretiens & Humeur\u202f?',
        options: [
          { text: 'Pour les entretiens professionnels obligatoires, Symbiose planifie, envoie les rappels et archive tout. Vous \u00eates en conformit\u00e9 automatiquement, sans effort suppl\u00e9mentaire.', points: 10, quality: 'good' },
          { text: 'Les salari\u00e9s peuvent pr\u00e9parer leurs entretiens dans l\u2019outil.', points: 5, quality: 'medium' },
          { text: 'Le barom\u00e8tre Humeur d\u00e9tecte les probl\u00e8mes.', points: 0, quality: 'bad' },
        ],
      },
    ],
  },
];

const PHASES = [
  { label: 'S\u00e9quen\u00e7age', icon: 'fa-arrows-up-down', desc: 'Ordonnez les \u00e9tapes de d\u00e9mo' },
  { label: 'Arguments WOW', icon: 'fa-star', desc: 'Choisissez les arguments percutants' },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getBlock(id) {
  return DEMO_BLOCKS.find(b => b.id === id);
}

function gaugeColor(val) {
  if (val > 70) return '#10b981';
  if (val >= 40) return '#f59e0b';
  return '#ef4444';
}

function getEmoji(prospect, gauge) {
  if (gauge >= 70) return prospect.emoji.high;
  if (gauge >= 40) return prospect.emoji.mid;
  return prospect.emoji.low;
}

function getEmojiSize(gauge) {
  if (gauge >= 70) return 64;
  if (gauge >= 40) return 48;
  return 36;
}

export function initGameDemoMixer(container) {
  let phase = 'intro';
  let currentProspect = 0;
  let prospectData = [];

  function initProspectData() {
    prospectData = PROSPECTS.map(() => ({
      slots: [null, null, null, null],
      availableBlocks: shuffle(MOVABLE_IDS),
      selectedBlock: null,
      gauge: 70,
      wowStep: 0,
      seqScore: 0,
      argScore: 0,
      seqDone: false,
      argsDone: false,
    }));
  }

  function render() {
    if (phase === 'intro') return renderIntro();
    if (phase === 'garden') return renderGarden();
    if (phase === 'results') return renderResults();
  }

  function renderIntro() {
    container.innerHTML = `
      <div class="ep-garden-bg fade-in">
        <div class="ep-header">
          <div class="ep-header-icon" style="background:linear-gradient(135deg,#0f172a,#1e293b);box-shadow:0 4px 14px rgba(15,23,42,0.3)"><i class="fas fa-sliders"></i></div>
          <div>
            <h2 style="color:#0f172a">Le D\u00e9mo Mixer</h2>
            <p style="color:#475569">Adaptez votre d\u00e9mo Symbiose \u00e0 chaque prospect</p>
          </div>
        </div>

        <div class="ep-intro-grid">
          ${PROSPECTS.map(p => `
            <div class="ep-intro-card" style="border-color:${p.color}">
              <div class="ep-intro-emoji">${p.emoji.mid}</div>
              <div class="ep-intro-role-badge" style="background:${p.colorLight};color:${p.color}">
                <i class="fas ${p.icon}"></i> ${p.role.split(' ')[0]}
              </div>
              <div class="ep-intro-name">${p.name}</div>
              <div class="ep-intro-meta">${p.role} \u2014 ${p.company}</div>
              <div class="ep-intro-trait">\u00ab ${p.painMain} \u00bb</div>
            </div>
          `).join('')}
        </div>

        <div class="ep-intro-rules" style="border-color:#bfdbfe">
          <div class="ep-intro-rules-title" style="color:#1e3a5f"><i class="fas fa-info-circle" style="color:#3b82f6"></i> R\u00e8gles du jeu</div>
          <p>Pour chaque prospect, vous devez d\u2019abord <strong>ordonner les 4 \u00e9tapes mobiles</strong> de la d\u00e9mo selon ses douleurs, puis choisir les <strong>arguments WOW</strong> les plus percutants. L\u2019attention du prospect d\u00e9pend de vos choix\u202f!</p>
        </div>

        <div class="dm-blocks-overview">
          <div class="dm-blocks-overview-title"><i class="fas fa-layer-group"></i> Les 6 \u00e9tapes</div>
          <div class="dm-blocks-overview-row">
            ${DEMO_BLOCKS.map(b => `
              <div class="dm-block-pill" style="background:${b.bg};border-color:${b.color}30;color:${b.color}">
                <i class="fas ${b.icon}"></i>
                <span>${b.label}</span>
                ${b.fixed ? '<span class="dm-pill-tag" style="background:#e2e8f0;color:#64748b">Fix\u00e9</span>' : ''}
                ${b.wow ? '<span class="dm-pill-tag" style="background:#fef3c7;color:#92400e">WOW</span>' : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <div style="text-align:center;padding:8px 0">
          <button class="btn btn-primary ep-start-btn" style="background:linear-gradient(135deg,#0f172a,#334155)!important;box-shadow:0 4px 16px rgba(15,23,42,0.3)" id="dmStart"><i class="fas fa-play"></i> Commencer</button>
        </div>
      </div>
    `;
    container.querySelector('#dmStart').addEventListener('click', () => {
      phase = 'garden';
      currentProspect = 0;
      initProspectData();
      render();
    });
  }

  function renderGarden() {
    const completedCount = prospectData.filter(d => d.seqDone && d.argsDone).length;
    const totalSteps = PROSPECTS.length * 2;
    let doneSteps = 0;
    prospectData.forEach(d => { if (d.seqDone) doneSteps++; if (d.argsDone) doneSteps++; });
    const progressPct = (doneSteps / totalSteps) * 100;
    const totalScore = prospectData.reduce((s, d) => s + d.seqScore + d.argScore, 0);

    container.innerHTML = `
      <div class="ep-garden-bg fade-in" style="background:linear-gradient(165deg,#EFF6FF 0%,#F0FDF4 50%,#FEFCE8 100%)">
        <div class="ep-season-bar">
          <div class="ep-season-track">
            ${PROSPECTS.map((p, i) => {
              const d = prospectData[i];
              const done = d.seqDone && d.argsDone;
              const active = i === currentProspect && !done;
              return `
                <div class="ep-season-step ${done ? 'done' : ''} ${active ? 'active' : ''}">
                  <div class="ep-season-dot" style="${active ? `background:linear-gradient(135deg,${p.color},${p.color}cc);box-shadow:0 3px 12px ${p.color}55` : done ? `background:${p.color}` : ''}"><i class="fas ${p.icon}"></i></div>
                  <span>${p.name.split(' ')[0]}</span>
                </div>
                ${i < PROSPECTS.length - 1 ? `<div class="ep-season-connector ${i < completedCount ? 'done' : ''}" style="${i < completedCount ? `background:${PROSPECTS[i].color}` : ''}"></div>` : ''}
              `;
            }).join('')}
          </div>
          <div class="ep-score-pill">
            <i class="fas fa-bolt"></i>
            <span>${totalScore}</span>
            <span class="ep-score-max">/ 120</span>
          </div>
        </div>

        <div class="ep-progress-bar">
          <div class="ep-progress-fill" style="width:${progressPct}%;background:linear-gradient(90deg,#3b82f6,#10b981)"></div>
        </div>

        <div class="ep-plots-grid" id="dmPlots">
          ${PROSPECTS.map((p, i) => {
            const d = prospectData[i];
            const done = d.seqDone && d.argsDone;
            const isCurrent = i === currentProspect;
            const canClick = isCurrent && !done;
            const nextStep = !d.seqDone ? 'S\u00e9quen\u00e7age' : !d.argsDone ? 'Arguments WOW' : '';
            const score = d.seqScore + d.argScore;

            return `
              <div class="ep-plot ${canClick ? 'ep-plot-clickable' : ''} ${done ? 'ep-plot-done' : ''} ${!isCurrent && !done ? 'ep-plot-waiting' : ''}" style="border-color:${p.color}" data-prospect="${i}">
                <div class="ep-plot-emoji" style="font-size:${getEmojiSize(d.gauge)}px">${getEmoji(p, d.gauge)}</div>
                <div class="ep-plot-badge" style="background:${p.colorLight};color:${p.color}">
                  <i class="fas ${p.icon}"></i> ${p.role.split(' ')[0]}
                </div>
                <div class="ep-plot-name">${p.name}</div>
                <div class="ep-plot-meta">${p.role} \u2014 ${p.company}</div>

                <div class="ep-gauges">
                  <div class="ep-gauge">
                    <div class="ep-gauge-label"><span>Attention</span><span style="color:${gaugeColor(d.gauge)}">${d.gauge}%</span></div>
                    <div class="ep-gauge-track"><div class="ep-gauge-fill" style="width:${d.gauge}%;background:${gaugeColor(d.gauge)}"></div></div>
                  </div>
                  <div class="ep-gauge">
                    <div class="ep-gauge-label"><span>Score</span><span style="color:${p.color}">${score}/40</span></div>
                    <div class="ep-gauge-track"><div class="ep-gauge-fill" style="width:${(score / 40) * 100}%;background:${p.color}"></div></div>
                  </div>
                </div>

                <div class="ep-plot-badges">
                  ${done ? '<span class="ep-badge-check"><i class="fas fa-check"></i></span>' : ''}
                </div>

                ${canClick ? `<button class="ep-plot-action-btn" style="background:${p.color}" data-pidx="${i}"><i class="fas fa-${!d.seqDone ? 'arrows-up-down' : 'star'}"></i> ${nextStep}</button>` : ''}
                ${!isCurrent && !done ? '<span class="ep-plot-waiting-label">En attente</span>' : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    const allDone = prospectData.every(d => d.seqDone && d.argsDone);
    if (allDone) {
      phase = 'results';
      render();
      return;
    }

    container.querySelectorAll('.ep-plot-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.pidx);
        const d = prospectData[idx];
        if (!d.seqDone) {
          openSequencingModal(idx);
        } else if (!d.argsDone) {
          openWowModal(idx, d.wowStep);
        }
      });
    });

    container.querySelectorAll('.ep-plot-clickable').forEach(plot => {
      plot.addEventListener('click', () => {
        const idx = parseInt(plot.dataset.prospect);
        const d = prospectData[idx];
        if (!d.seqDone) {
          openSequencingModal(idx);
        } else if (!d.argsDone) {
          openWowModal(idx, d.wowStep);
        }
      });
    });
  }

  function openSequencingModal(prospectIdx) {
    const prospect = PROSPECTS[prospectIdx];
    const data = prospectData[prospectIdx];

    const overlay = document.createElement('div');
    overlay.className = 'ep-modal-overlay fade-in';

    function renderModal() {
      const allPlaced = data.slots.every(s => s !== null);

      overlay.innerHTML = `
        <div class="ep-modal">
          <button class="game-modal-close" id="dmSeqClose"><i class="fas fa-times"></i></button>
          <div class="ep-modal-header" style="border-color:${prospect.color}">
            <div class="ep-modal-emoji" style="font-size:42px">${getEmoji(prospect, data.gauge)}</div>
            <div>
              <div class="ep-modal-name">${prospect.name}</div>
              <div class="ep-modal-meta">${prospect.role} \u2014 ${prospect.company}</div>
              <div class="ep-modal-phase-badge" style="background:${prospect.colorLight};color:${prospect.color}">
                <i class="fas fa-arrows-up-down"></i> S\u00e9quen\u00e7age
              </div>
            </div>
          </div>

          <div class="ep-modal-prospect-says">
            <div class="ep-modal-prospect-avatar" style="background:linear-gradient(135deg,${prospect.color},${prospect.color}cc)">${prospect.avatar}</div>
            <div class="ep-modal-prospect-bubble">
              <div class="ep-modal-prospect-bubble-name">${prospect.name}</div>
              <p>${prospect.painMain} ${prospect.painSecondary}</p>
            </div>
          </div>

          <div class="ep-modal-situation">
            <i class="fas fa-lightbulb"></i>
            <p>Ordonnez les 4 \u00e9tapes mobiles pour adapter la d\u00e9mo \u00e0 ce prospect. Le Dashboard ouvre toujours, le R\u00e9cap ferme toujours.</p>
          </div>

          <div class="dm-seq-area">
            <div class="dm-seq-timeline">
              ${[0, 1, 2, 3, 4, 5].map(i => {
                if (i === 0) {
                  const b = getBlock('dashboard');
                  return `<div class="dm-seq-station dm-seq-fixed"><div class="dm-seq-num">1</div><div class="dm-seq-card" style="background:${b.bg};border-color:${b.color}"><i class="fas ${b.icon}" style="color:${b.color}"></i><span>${b.label}</span></div></div>`;
                }
                if (i === 5) {
                  const b = getBlock('recap');
                  return `<div class="dm-seq-station dm-seq-fixed"><div class="dm-seq-num">6</div><div class="dm-seq-card" style="background:${b.bg};border-color:${b.color}"><i class="fas ${b.icon}" style="color:${b.color}"></i><span>${b.label}</span></div></div>`;
                }
                const slotIdx = i - 1;
                const placed = data.slots[slotIdx];
                if (placed) {
                  const b = getBlock(placed);
                  return `<div class="dm-seq-station dm-seq-filled" data-slot="${slotIdx}"><div class="dm-seq-num">${i + 1}</div><div class="dm-seq-card" style="background:${b.bg};border-color:${b.color}"><i class="fas ${b.icon}" style="color:${b.color}"></i><span>${b.label}</span>${b.wow ? '<span class="dm-pill-tag" style="background:#fef3c7;color:#92400e">WOW</span>' : ''}</div></div>`;
                }
                return `<div class="dm-seq-station dm-seq-empty" data-slot="${slotIdx}"><div class="dm-seq-num">${i + 1}</div><div class="dm-seq-card-empty"><i class="fas fa-plus"></i><span>Position ${i + 1}</span></div></div>`;
              }).join('')}
            </div>

            ${data.availableBlocks.length > 0 ? `
              <div class="dm-seq-hand">
                <div class="dm-seq-hand-label">\u00c9tapes \u00e0 placer</div>
                <div class="dm-seq-hand-cards">
                  ${data.availableBlocks.map(id => {
                    const b = getBlock(id);
                    return `<button class="dm-seq-hand-card ${data.selectedBlock === id ? 'selected' : ''}" data-block="${id}" style="--card-color:${b.color};--card-bg:${b.bg}"><i class="fas ${b.icon}"></i><span>${b.label}</span>${b.wow ? '<span class="dm-pill-tag" style="background:#fef3c7;color:#92400e">WOW</span>' : ''}</button>`;
                  }).join('')}
                </div>
              </div>
            ` : ''}
          </div>

          <div style="padding:0 20px 20px;text-align:right">
            <button class="btn btn-primary" id="dmSeqValidate" ${!allPlaced ? 'disabled' : ''} style="${allPlaced ? `background:${prospect.color}!important;border-color:${prospect.color}!important` : ''}">
              <i class="fas fa-check"></i> Valider l\u2019ordre
            </button>
          </div>
        </div>
      `;

      overlay.querySelector('#dmSeqClose').addEventListener('click', () => {
        overlay.remove();
        render();
      });

      overlay.querySelectorAll('.dm-seq-hand-card').forEach(btn => {
        btn.addEventListener('click', () => {
          data.selectedBlock = btn.dataset.block;
          renderModal();
        });
      });

      overlay.querySelectorAll('.dm-seq-empty').forEach(el => {
        el.addEventListener('click', () => {
          if (!data.selectedBlock) return;
          const slotIdx = parseInt(el.dataset.slot);
          data.slots[slotIdx] = data.selectedBlock;
          data.availableBlocks = data.availableBlocks.filter(id => id !== data.selectedBlock);
          data.selectedBlock = null;
          renderModal();
        });
      });

      overlay.querySelectorAll('.dm-seq-filled').forEach(el => {
        el.addEventListener('click', () => {
          const slotIdx = parseInt(el.dataset.slot);
          const removed = data.slots[slotIdx];
          if (data.selectedBlock) {
            data.slots[slotIdx] = data.selectedBlock;
            data.availableBlocks = data.availableBlocks.filter(id => id !== data.selectedBlock);
            data.availableBlocks.push(removed);
          } else {
            data.slots[slotIdx] = null;
            data.availableBlocks.push(removed);
          }
          data.selectedBlock = null;
          renderModal();
        });
      });

      const valBtn = overlay.querySelector('#dmSeqValidate');
      if (valBtn) {
        valBtn.addEventListener('click', () => {
          const playerOrder = ['dashboard', ...data.slots, 'recap'];
          const optimal = prospect.optimalOrder;
          data.seqScore = 0;
          for (let i = 1; i <= 4; i++) {
            if (playerOrder[i] === optimal[i]) {
              data.seqScore += 5;
            } else {
              data.gauge = Math.max(0, data.gauge - 10);
            }
          }
          data.seqDone = true;

          showSeqFeedback(overlay, prospectIdx);
        });
      }
    }

    renderModal();
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
        render();
      }
    });
  }

  function showSeqFeedback(overlay, prospectIdx) {
    const prospect = PROSPECTS[prospectIdx];
    const data = prospectData[prospectIdx];
    const playerOrder = ['dashboard', ...data.slots, 'recap'];
    const optimal = prospect.optimalOrder;

    overlay.innerHTML = `
      <div class="ep-modal">
        <button class="game-modal-close" id="dmFbClose"><i class="fas fa-times"></i></button>
        <div class="ep-modal-header" style="border-color:${prospect.color}">
          <div class="ep-modal-emoji" style="font-size:42px">${getEmoji(prospect, data.gauge)}</div>
          <div>
            <div class="ep-modal-name">${prospect.name}</div>
            <div class="ep-modal-meta">S\u00e9quen\u00e7age termin\u00e9</div>
            <div class="ep-modal-phase-badge" style="background:${prospect.colorLight};color:${prospect.color}">
              <i class="fas fa-arrows-up-down"></i> ${data.seqScore}/20 pts
            </div>
          </div>
        </div>

        <div class="dm-seq-compare">
          <div class="dm-seq-compare-grid">
            <div class="dm-seq-compare-col">
              <div class="dm-seq-compare-title">Votre choix</div>
              ${playerOrder.map((id, i) => {
                const b = getBlock(id);
                const isCorrect = id === optimal[i];
                return `<div class="dm-seq-compare-item ${isCorrect ? 'dm-seq-correct' : 'dm-seq-wrong'}"><span class="dm-seq-compare-num">${i + 1}</span><i class="fas ${b.icon}" style="color:${b.color}"></i><span>${b.label}</span><i class="fas ${isCorrect ? 'fa-check' : 'fa-xmark'}" style="margin-left:auto;color:${isCorrect ? '#10b981' : '#ef4444'}"></i></div>`;
              }).join('')}
            </div>
            <div class="dm-seq-compare-col">
              <div class="dm-seq-compare-title">Ordre optimal</div>
              ${optimal.map((id, i) => {
                const b = getBlock(id);
                return `<div class="dm-seq-compare-item dm-seq-optimal"><span class="dm-seq-compare-num">${i + 1}</span><i class="fas ${b.icon}" style="color:${b.color}"></i><span>${b.label}</span></div>`;
              }).join('')}
            </div>
          </div>
        </div>

        <div style="padding:0 20px 20px;display:flex;justify-content:flex-end">
          <button class="btn btn-primary" id="dmSeqContinue" style="background:${prospect.color}!important;border-color:${prospect.color}!important">
            Arguments WOW <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    `;

    overlay.querySelector('#dmSeqContinue').addEventListener('click', () => {
      overlay.remove();
      openWowModal(prospectIdx, 0);
    });

    overlay.querySelector('#dmFbClose').addEventListener('click', () => {
      overlay.remove();
      render();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
        render();
      }
    });
  }

  function openWowModal(prospectIdx, wowIdx) {
    const prospect = PROSPECTS[prospectIdx];
    const data = prospectData[prospectIdx];
    const wow = prospect.wows[wowIdx];
    const b = getBlock(wow.blockId);
    const shuffledOpts = shuffle(wow.options.map((o, i) => ({ ...o, origIdx: i })));

    const overlay = document.createElement('div');
    overlay.className = 'ep-modal-overlay fade-in';
    overlay.innerHTML = `
      <div class="ep-modal">
        <button class="game-modal-close" id="dmWowClose"><i class="fas fa-times"></i></button>
        <div class="ep-modal-header" style="border-color:${prospect.color}">
          <div class="ep-modal-emoji" style="font-size:42px">${getEmoji(prospect, data.gauge)}</div>
          <div>
            <div class="ep-modal-name">${prospect.name}</div>
            <div class="ep-modal-meta">Argument WOW ${wowIdx + 1}/2</div>
            <div class="ep-modal-phase-badge" style="background:${prospect.colorLight};color:${prospect.color}">
              <i class="fas fa-star"></i> ${b.label}
            </div>
          </div>
        </div>

        <div class="dm-wow-block-badge" style="background:${b.bg};border-color:${b.color}">
          <i class="fas ${b.icon}" style="color:${b.color};font-size:18px"></i>
          <div>
            <div style="font-weight:700;font-size:13px;color:var(--text-primary)">${b.label}</div>
            <div style="font-size:11px;color:var(--text-muted)">${b.duration}</div>
          </div>
          <span class="dm-pill-tag" style="background:#fef3c7;color:#92400e;margin-left:auto">WOW</span>
        </div>

        <div class="ep-modal-situation">
          <i class="fas fa-microphone"></i>
          <p>${wow.question}</p>
        </div>

        <div class="ep-modal-choices" id="dmWowChoices">
          ${shuffledOpts.map((opt, i) => `
            <button class="ep-choice-card" data-idx="${i}">
              <span class="ep-choice-letter">${['A', 'B', 'C'][i]}</span>
              <span class="ep-choice-text">${opt.text}</span>
            </button>
          `).join('')}
        </div>

        <div class="ep-modal-feedback" id="dmWowFeedback"></div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#dmWowClose').addEventListener('click', () => {
      overlay.remove();
      render();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
        render();
      }
    });

    overlay.querySelectorAll('#dmWowChoices .ep-choice-card').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        const chosen = shuffledOpts[idx];
        data.argScore += chosen.points;

        if (chosen.points === 10) data.gauge = Math.min(100, data.gauge + 15);
        else if (chosen.points === 0) data.gauge = Math.max(0, data.gauge - 10);

        const buttons = overlay.querySelectorAll('.ep-choice-card');
        buttons.forEach((b, i) => {
          b.disabled = true;
          b.classList.add('ep-choice-disabled');
          const opt = shuffledOpts[i];
          if (i === idx) b.classList.add(`ep-chosen-${opt.quality}`);
          if (opt.quality === 'good' && i !== idx) b.classList.add('ep-reveal-good');
        });

        const qualityLabels = { good: 'Excellent argument', medium: 'Argument moyen', bad: 'Mauvais argument' };
        const qualityIcons = { good: 'fa-check-circle', medium: 'fa-exclamation-circle', bad: 'fa-times-circle' };

        const feedbackEl = overlay.querySelector('#dmWowFeedback');
        let fbHtml = `
          <div class="ep-fb ep-fb-${chosen.quality} fade-in">
            <div class="ep-fb-header">
              <i class="fas ${qualityIcons[chosen.quality]}"></i>
              <span>${qualityLabels[chosen.quality]} (+${chosen.points} pts)</span>
            </div>
          </div>
        `;

        if (chosen.quality === 'good') {
          fbHtml += `
            <div class="ep-fb-growth fade-in" style="animation-delay:0.2s">
              <span style="font-size:32px">${getEmoji(prospect, data.gauge)}</span>
              <span>Attention en hausse\u202f!</span>
            </div>
          `;
        }

        fbHtml += `
          <button class="btn btn-primary ep-fb-continue fade-in" style="animation-delay:0.3s;background:${prospect.color}!important" id="dmWowNext">
            ${wowIdx < 1 ? 'Argument suivant <i class="fas fa-arrow-right"></i>' : 'Continuer <i class="fas fa-arrow-right"></i>'}
          </button>
        `;

        feedbackEl.innerHTML = fbHtml;

        feedbackEl.querySelector('#dmWowNext').addEventListener('click', () => {
          overlay.remove();
          if (wowIdx < 1) {
            data.wowStep = 1;
            openWowModal(prospectIdx, 1);
          } else {
            data.argsDone = true;
            if (currentProspect < PROSPECTS.length - 1) {
              currentProspect++;
            }
            render();
          }
        });
      });
    });
  }

  function renderResults() {
    const totalScore = prospectData.reduce((s, d) => s + d.seqScore + d.argScore, 0);
    const tier = totalScore >= 100
      ? { label: 'Ma\u00eetre de la D\u00e9mo', icon: 'fa-clapperboard', color: 'gold', emoji: '\ud83c\udfac' }
      : totalScore >= 60
        ? { label: 'D\u00e9monstrateur en progression', icon: 'fa-chart-line', color: 'blue', emoji: '\ud83d\udcca' }
        : { label: 'D\u00e9mo g\u00e9n\u00e9rique', icon: 'fa-clipboard-list', color: 'orange', emoji: '\ud83d\udccb' };

    const state = getState();
    const gameKey = 'game_demo_mixer_5';
    const prevBest = state[gameKey] || 0;
    const isNewBest = totalScore > prevBest;
    if (isNewBest) {
      state[gameKey] = totalScore;
      saveState();
    }
    if (totalScore >= 60) addXP(totalScore, 'games');
    if (totalScore >= 100) triggerConfetti();

    container.innerHTML = `
      <div class="ep-garden-bg fade-in" style="background:linear-gradient(165deg,#EFF6FF 0%,#F0FDF4 50%,#FEFCE8 100%)">
        <div class="ep-results">
          <div class="ep-result-header ep-result-${tier.color}">
            <div class="ep-result-emoji">${tier.emoji}</div>
            <div class="ep-result-score-big">${totalScore}<span>/120</span></div>
            <h2>${tier.label}</h2>
            ${isNewBest ? '<div class="ep-new-best"><i class="fas fa-arrow-up"></i> Nouveau record</div>' : ''}
          </div>

          <div class="ep-results-garden" style="border-color:#bfdbfe">
            <h3 style="color:#1e3a5f"><i class="fas fa-sliders" style="color:#3b82f6"></i> Score par prospect</h3>
            <div class="ep-results-plots">
              ${PROSPECTS.map((p, i) => {
                const d = prospectData[i];
                const score = d.seqScore + d.argScore;
                return `
                  <div class="ep-result-plot" style="border-color:${p.color}">
                    <div class="ep-result-plot-emoji" style="font-size:48px">${getEmoji(p, d.gauge)}</div>
                    <div class="ep-result-plot-badge" style="background:${p.colorLight};color:${p.color}">
                      <i class="fas ${p.icon}"></i> ${p.role.split(' ')[0]}
                    </div>
                    <div class="ep-result-plot-name">${p.name}</div>
                    <div class="ep-result-plot-score" style="color:${p.color}">${score}/40</div>
                    <div class="ep-result-plot-stats">
                      <div class="ep-result-stat"><span>S\u00e9quen\u00e7age</span><strong style="color:${p.color}">${d.seqScore}/20</strong></div>
                      <div class="ep-result-stat"><span>Arguments WOW</span><strong style="color:#f59e0b">${d.argScore}/20</strong></div>
                      <div class="ep-result-stat"><span>Attention</span><strong style="color:${gaugeColor(d.gauge)}">${d.gauge}%</strong></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div class="ep-results-tips" style="border-color:#bfdbfe">
            <h3 style="color:#1e3a5f"><i class="fas fa-graduation-cap" style="color:#3b82f6"></i> Le\u00e7on cl\u00e9</h3>
            <ul>
              <li>La cl\u00e9 d\u2019une d\u00e9mo r\u00e9ussie\u202f: adapter l\u2019ORDRE des \u00e9tapes aux DOULEURS du prospect.</li>
              <li>Le Dashboard ouvre toujours, le R\u00e9cap ferme toujours, mais entre les deux, tout d\u00e9pend de qui est en face de vous.</li>
              <li>La douleur principale du prospect d\u00e9termine l\u2019\u00e9tape n\u00b02. C\u2019est le moment o\u00f9 l\u2019attention est maximale.</li>
            </ul>
          </div>

          <div class="ep-result-actions">
            <button class="btn btn-primary" id="dmRetry" style="background:linear-gradient(135deg,#0f172a,#334155)!important"><i class="fas fa-rotate-right"></i> Recommencer</button>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#dmRetry').addEventListener('click', () => {
      phase = 'intro';
      currentProspect = 0;
      prospectData = [];
      render();
    });
  }

  render();
}
