import { getState, saveState } from '../state.js?v=81';
import { addXP, triggerConfetti } from '../notifications.js?v=81';

const PROSPECT = {
  name: 'Sophie Martin',
  role: 'Dirigeante',
  company: 'GreenTech Solutions',
  sector: 'Conseil en environnement',
  employees: 35,
  sites: 3,
};

const STEPS = [
  {
    id: 1,
    title: 'Ouverture',
    situation: 'Sophie d\u00e9croche le t\u00e9l\u00e9phone. Comment ouvrir l\u2019\u00e9change\u202f?',
    sophieIntro: null,
    options: [
      {
        text: 'Bonjour Sophie, merci d\u2019avoir pris le temps. L\u2019objectif est simple\u202f: comprendre comment vous g\u00e9rez vos \u00e9quipes et voir si on peut vous faire gagner du temps.',
        points: 10,
        quality: 'good',
        feedback: 'Parfait\u202f! Vous centrez l\u2019\u00e9change sur elle, pas sur vous. Sophie se sent \u00e9cout\u00e9e.',
      },
      {
        text: 'Bonjour, je vous appelle pour vous pr\u00e9senter Symbiose, notre logiciel SIRH.',
        points: 5,
        quality: 'medium',
        feedback: 'Correct mais trop centr\u00e9 sur le produit. Sophie attend qu\u2019on s\u2019int\u00e9resse \u00e0 elle d\u2019abord.',
      },
      {
        text: 'Bonjour, est-ce que vous avez 30 minutes\u202f? J\u2019ai beaucoup de choses \u00e0 vous montrer.',
        points: 0,
        quality: 'bad',
        feedback: 'Mauvais d\u00e9but. 30 minutes fait peur et \u00ab\u202fbeaucoup de choses\u202f\u00bb n\u2019est pas cibl\u00e9.',
      },
    ],
    sophieReply: null,
    painLabel: null,
  },
  {
    id: 2,
    title: 'Question Contexte',
    situation: 'Sophie dit \u00ab\u202fOui, allez-y, j\u2019ai un quart d\u2019heure\u202f\u00bb. Quelle premi\u00e8re question poser\u202f?',
    sophieIntro: 'Oui, allez-y, j\u2019ai un quart d\u2019heure.',
    options: [
      {
        text: 'Combien de salari\u00e9s avez-vous et qui g\u00e8re les RH chez vous aujourd\u2019hui\u202f?',
        points: 10,
        quality: 'good',
        feedback: 'Excellent\u202f! Vous identifiez la taille et le responsable RH \u2014 deux infos cl\u00e9s du QQOQCP.',
      },
      {
        text: 'Vous utilisez quel logiciel RH actuellement\u202f?',
        points: 5,
        quality: 'medium',
        feedback: 'Pas mal, mais vous sautez directement aux outils sans comprendre le contexte d\u2019abord.',
      },
      {
        text: 'Connaissez-vous d\u00e9j\u00e0 Symbiose\u202f?',
        points: 0,
        quality: 'bad',
        feedback: 'Non\u202f! On ne parle pas du produit, on \u00e9coute le prospect. On est en phase de d\u00e9couverte.',
      },
    ],
    sophieReply: 'On est 35 sur 3 sites. C\u2019est moi qui g\u00e8re tout, avec ma comptable qui m\u2019aide un peu.',
    painLabel: null,
  },
  {
    id: 3,
    title: 'Douleur 1 \u2014 Surcharge admin',
    situation: 'Sophie soupire\u202f: \u00ab\u202fEntre les cong\u00e9s, les contrats, les entretiens\u2026 je passe mes soir\u00e9es l\u00e0-dessus.\u202f\u00bb Quelle r\u00e9action\u202f?',
    sophieIntro: 'Entre les cong\u00e9s, les contrats, les entretiens\u2026 je passe mes soir\u00e9es l\u00e0-dessus.',
    options: [
      {
        text: 'Je comprends. Concr\u00e8tement, combien de temps par semaine passez-vous sur ces t\u00e2ches admin RH\u202f?',
        points: 10,
        quality: 'good',
        feedback: 'Parfait\u202f! Vous creusez la douleur avec une question chiffr\u00e9e. Sophie dira \u00ab\u202f2 soir\u00e9es par semaine\u202f\u00bb \u2014 c\u2019est de la surcharge admin.',
      },
      {
        text: 'C\u2019est exactement pour \u00e7a que Symbiose existe\u202f!',
        points: 5,
        quality: 'medium',
        feedback: 'Trop t\u00f4t pour vendre\u202f! Vous n\u2019avez pas encore quantifi\u00e9 la douleur.',
      },
      {
        text: 'Vous devriez embaucher un DRH.',
        points: 0,
        quality: 'bad',
        feedback: 'Vous jugez au lieu d\u2019\u00e9couter. Sophie se ferme.',
      },
    ],
    sophieReply: 'Au moins 2 soir\u00e9es par semaine\u2026 c\u2019est \u00e9puisant.',
    painLabel: 'SURCHARGE ADMINISTRATIVE',
  },
  {
    id: 4,
    title: 'Douleur 2 \u2014 Turnover',
    situation: 'Sophie continue\u202f: \u00ab\u202fEt avec la croissance, j\u2019ai perdu 3 personnes en 6 mois. Je ne les vois pas venir, les d\u00e9parts.\u202f\u00bb Comment r\u00e9agir\u202f?',
    sophieIntro: 'Et avec la croissance, j\u2019ai perdu 3 personnes en 6 mois. Je ne les vois pas venir, les d\u00e9parts.',
    options: [
      {
        text: '3 d\u00e9parts sur 35, c\u2019est significatif. Avez-vous un moyen de savoir comment se sentent vos \u00e9quipes au quotidien\u202f?',
        points: 10,
        quality: 'good',
        feedback: 'Bravo\u202f! Vous chiffrez l\u2019impact et orientez vers le barom\u00e8tre Humeur. Sophie r\u00e9v\u00e8le qu\u2019elle n\u2019a aucun outil de suivi.',
      },
      {
        text: 'C\u2019est fr\u00e9quent dans les PME en croissance.',
        points: 5,
        quality: 'medium',
        feedback: 'Vous banalisez sa douleur au lieu de la creuser. Occasion rat\u00e9e.',
      },
      {
        text: 'Vous leur offrez quoi comme avantages\u202f?',
        points: 0,
        quality: 'bad',
        feedback: 'Hors sujet et potentiellement vexant. Restez sur l\u2019identification de la douleur.',
      },
    ],
    sophieReply: 'Non, aucun outil. Je le d\u00e9couvre quand ils posent leur d\u00e9mission\u2026',
    painLabel: 'TURNOVER SUBI + D\u00c9SENGAGEMENT',
  },
  {
    id: 5,
    title: 'Douleur 3 \u2014 Cong\u00e9s',
    situation: 'Sophie ajoute\u202f: \u00ab\u202fEn plus, les cong\u00e9s c\u2019est la gal\u00e8re. SMS, emails, Post-it\u2026 Je ne sais jamais qui est l\u00e0.\u202f\u00bb Quelle question\u202f?',
    sophieIntro: 'En plus, les cong\u00e9s c\u2019est la gal\u00e8re. SMS, emails, Post-it\u2026 Je ne sais jamais qui est l\u00e0.',
    options: [
      {
        text: 'Donc pas de tra\u00e7abilit\u00e9. Comment faites-vous pour valider et suivre les soldes de cong\u00e9s\u202f?',
        points: 10,
        quality: 'good',
        feedback: 'Excellent\u202f! Vous reformulez la douleur et creusez. Sophie confirme qu\u2019elle utilise un fichier Excel partag\u00e9.',
      },
      {
        text: 'Je vois, c\u2019est un probl\u00e8me classique.',
        points: 5,
        quality: 'medium',
        feedback: 'Vous minimisez. Creusez plut\u00f4t pour quantifier le probl\u00e8me.',
      },
      {
        text: 'Attendez, je vais vous montrer comment Symbiose g\u00e8re les cong\u00e9s.',
        points: 0,
        quality: 'bad',
        feedback: 'Trop t\u00f4t pour la d\u00e9mo\u202f! Vous \u00eates encore en phase de d\u00e9couverte.',
      },
    ],
    sophieReply: 'Un fichier Excel partag\u00e9\u2026 enfin quand il n\u2019est pas perdu.',
    painLabel: 'CONG\u00c9S MAL G\u00c9R\u00c9S',
  },
  {
    id: 6,
    title: 'Mapping Douleurs \u2192 Packs',
    situation: 'Merci Sophie. J\u2019ai bien compris vos 3 priorit\u00e9s. Pour votre structure de 35 salari\u00e9s sur 3 sites, quelle recommandation\u202f?',
    sophieIntro: null,
    options: [
      {
        text: 'Pack Int\u00e9gral \u00e0 11\u202f\u20ac/salari\u00e9/mois \u2014 il couvre la gestion d\u2019\u00e9quipe, le suivi humeur, les cong\u00e9s et la conformit\u00e9. Pour 35 salari\u00e9s\u202f: 385\u202f\u20ac/mois.',
        points: 10,
        quality: 'good',
        feedback: 'Parfait\u202f! Le Pack Int\u00e9gral est le plus adapt\u00e9 pour +20 salari\u00e9s avec des besoins multiples. Vous chiffrez imm\u00e9diatement.',
      },
      {
        text: 'Pack Essentiel \u00e0 5\u202f\u20ac/salari\u00e9 pour commencer, vous pourrez \u00e9voluer ensuite.',
        points: 5,
        quality: 'medium',
        feedback: 'Pas optimal \u2014 le Pack Essentiel ne couvre pas tout ce dont Sophie a besoin. Le Pack Int\u00e9gral est plus pertinent pour 35 salari\u00e9s.',
      },
      {
        text: 'Je vous envoie la documentation par email, vous regarderez.',
        points: 0,
        quality: 'bad',
        feedback: 'Erreur fatale\u202f! Vous perdez le momentum. Sophie ne lira probablement pas l\u2019email.',
      },
    ],
    sophieReply: null,
    painLabel: null,
  },
];

const SCORE_TIERS = [
  { min: 60, max: 60, label: 'Expert Symbiose', desc: 'Vous ma\u00eetrisez la d\u00e9couverte client.', icon: 'fa-crown', color: 'gold' },
  { min: 40, max: 55, label: 'Bon d\u00e9but', desc: 'Revoyez les techniques de creusage de douleur.', icon: 'fa-thumbs-up', color: 'blue' },
  { min: 20, max: 35, label: '\u00c0 am\u00e9liorer', desc: 'Relisez le cours et le script avant de r\u00e9essayer.', icon: 'fa-book-open', color: 'orange' },
  { min: 0, max: 15, label: 'Recommencez', desc: 'Focus sur l\u2019\u00e9coute active et le QQOQCP.', icon: 'fa-rotate-right', color: 'red' },
];

function getScoreTier(score) {
  return SCORE_TIERS.find(t => score >= t.min && score <= t.max) || SCORE_TIERS[SCORE_TIERS.length - 1];
}

function shuffleOptions(options) {
  const indexed = options.map((o, i) => ({ ...o, originalIndex: i }));
  for (let i = indexed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
  }
  return indexed;
}

export function renderDiscoveryGame(container) {
  let currentStep = 0;
  let score = 0;
  let answers = [];
  let pains = [];
  let shuffledOptions = [];
  let isTransitioning = false;

  function render() {
    if (currentStep >= STEPS.length) {
      renderResults();
      return;
    }
    const step = STEPS[currentStep];
    shuffledOptions = shuffleOptions(step.options);

    container.innerHTML = `
      <div class="dg-wrapper">
        <div class="dg-top-bar">
          <div class="dg-progress-info">
            <span class="dg-step-label">\u00c9tape ${currentStep + 1}/${STEPS.length}</span>
            <span class="dg-step-title">${step.title}</span>
          </div>
          <div class="dg-score-badge">
            <i class="fas fa-star"></i>
            <span id="dgScore">${score}</span>
            <span class="dg-score-max">/ 60</span>
          </div>
        </div>
        <div class="dg-progress-bar">
          <div class="dg-progress-fill" style="width:${((currentStep) / STEPS.length) * 100}%"></div>
        </div>
        <div class="dg-scene fade-in">
          ${step.sophieIntro ? `
            <div class="dg-bubble-row">
              <div class="dg-avatar-col">
                <div class="dg-avatar">
                  <i class="fas fa-user-tie"></i>
                </div>
                <span class="dg-avatar-name">${PROSPECT.name.split(' ')[0]}</span>
              </div>
              <div class="dg-speech-bubble">
                <p>${step.sophieIntro}</p>
              </div>
            </div>
          ` : ''}
          <div class="dg-situation">
            <div class="dg-situation-icon"><i class="fas fa-lightbulb"></i></div>
            <p>${step.situation}</p>
          </div>
          <div class="dg-choices" id="dgChoices">
            ${shuffledOptions.map((opt, i) => `
              <button class="dg-choice-btn" data-idx="${i}">
                <span class="dg-choice-letter">${['A', 'B', 'C'][i]}</span>
                <span class="dg-choice-text">${opt.text}</span>
              </button>
            `).join('')}
          </div>
          <div class="dg-feedback-area" id="dgFeedback"></div>
        </div>
      </div>
    `;

    container.querySelectorAll('.dg-choice-btn').forEach(btn => {
      btn.addEventListener('click', () => handleChoice(parseInt(btn.dataset.idx)));
    });
  }

  function handleChoice(idx) {
    if (isTransitioning) return;
    isTransitioning = true;

    const step = STEPS[currentStep];
    const chosen = shuffledOptions[idx];
    score += chosen.points;
    answers.push({ stepId: step.id, quality: chosen.quality, points: chosen.points });
    if (step.painLabel && chosen.quality !== 'bad') {
      pains.push(step.painLabel);
    }

    const scoreEl = document.getElementById('dgScore');
    if (scoreEl) scoreEl.textContent = score;

    const buttons = container.querySelectorAll('.dg-choice-btn');
    buttons.forEach((btn, i) => {
      btn.disabled = true;
      const opt = shuffledOptions[i];
      if (i === idx) {
        btn.classList.add(`dg-selected-${opt.quality}`);
      }
      if (opt.quality === 'good' && i !== idx) {
        btn.classList.add('dg-reveal-good');
      }
    });

    const feedbackArea = document.getElementById('dgFeedback');
    const qualityLabel = { good: 'Excellent choix', medium: 'Choix moyen', bad: 'Mauvais choix' };
    const qualityIcon = { good: 'fa-check-circle', medium: 'fa-exclamation-circle', bad: 'fa-times-circle' };

    let feedbackHtml = `
      <div class="dg-feedback dg-feedback-${chosen.quality} fade-in">
        <div class="dg-feedback-header">
          <i class="fas ${qualityIcon[chosen.quality]}"></i>
          <span>${qualityLabel[chosen.quality]} (+${chosen.points} pts)</span>
        </div>
        <p>${chosen.feedback}</p>
      </div>
    `;

    if (step.sophieReply) {
      feedbackHtml += `
        <div class="dg-bubble-row dg-reply-bubble fade-in" style="animation-delay:0.3s">
          <div class="dg-avatar-col">
            <div class="dg-avatar">
              <i class="fas fa-user-tie"></i>
            </div>
            <span class="dg-avatar-name">Sophie</span>
          </div>
          <div class="dg-speech-bubble">
            <p>${step.sophieReply}</p>
          </div>
        </div>
      `;
    }

    if (step.painLabel && chosen.quality !== 'bad') {
      feedbackHtml += `
        <div class="dg-pain-tag fade-in" style="animation-delay:0.5s">
          <i class="fas fa-check"></i>
          Douleur identifi\u00e9e\u202f: ${step.painLabel}
        </div>
      `;
    }

    feedbackHtml += `
      <button class="btn btn-primary dg-next-btn fade-in" style="animation-delay:0.6s" id="dgNextBtn">
        ${currentStep < STEPS.length - 1 ? '\u00c9tape suivante <i class="fas fa-arrow-right"></i>' : 'Voir les r\u00e9sultats <i class="fas fa-trophy"></i>'}
      </button>
    `;

    feedbackArea.innerHTML = feedbackHtml;
    feedbackArea.querySelector('#dgNextBtn').addEventListener('click', () => {
      currentStep++;
      isTransitioning = false;
      render();
    });

    const progressFill = container.querySelector('.dg-progress-fill');
    if (progressFill) {
      progressFill.style.width = `${((currentStep + 1) / STEPS.length) * 100}%`;
    }
  }

  function renderResults() {
    const tier = getScoreTier(score);
    const state = getState();
    const gameKey = 'game_discovery_1';
    const prevBest = state[gameKey] || 0;
    const isNewBest = score > prevBest;
    if (isNewBest) {
      state[gameKey] = score;
      saveState();
    }

    if (score >= 40) {
      addXP(score, 'games');
    }
    if (score === 60) {
      triggerConfetti();
    }

    const painMapping = [
      { pain: 'SURCHARGE ADMINISTRATIVE', pack: 'Pack Int\u00e9gral', module: 'Gestion admin & conformit\u00e9', icon: 'fa-folder-open' },
      { pain: 'TURNOVER SUBI + D\u00c9SENGAGEMENT', pack: 'Pack Int\u00e9gral', module: 'Barom\u00e8tre Humeur', icon: 'fa-heart-pulse' },
      { pain: 'CONG\u00c9S MAL G\u00c9R\u00c9S', pack: 'Pack Essentiel+', module: 'Module Cong\u00e9s', icon: 'fa-calendar-check' },
    ];

    container.innerHTML = `
      <div class="dg-wrapper">
        <div class="dg-results fade-in">
          <div class="dg-result-header dg-result-${tier.color}">
            <div class="dg-result-icon-wrap">
              <i class="fas ${tier.icon}"></i>
            </div>
            <div class="dg-result-score-big">${score}<span>/60</span></div>
            <h2>${tier.label}</h2>
            <p>${tier.desc}</p>
            ${isNewBest ? '<div class="dg-new-best"><i class="fas fa-arrow-up"></i> Nouveau record</div>' : ''}
          </div>

          <div class="dg-result-breakdown">
            <h3><i class="fas fa-list-check"></i> R\u00e9capitulatif des \u00e9tapes</h3>
            <div class="dg-steps-recap">
              ${answers.map((a, i) => {
                const step = STEPS[i];
                const dotClass = a.quality === 'good' ? 'dg-dot-good' : a.quality === 'medium' ? 'dg-dot-medium' : 'dg-dot-bad';
                return `
                  <div class="dg-recap-row">
                    <span class="dg-recap-dot ${dotClass}"></span>
                    <span class="dg-recap-label">${step.title}</span>
                    <span class="dg-recap-pts">+${a.points}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          ${pains.length > 0 ? `
            <div class="dg-result-pains">
              <h3><i class="fas fa-crosshairs"></i> Douleurs identifi\u00e9es \u2192 Solutions</h3>
              <div class="dg-pain-grid">
                ${painMapping.filter(p => pains.includes(p.pain)).map(p => `
                  <div class="dg-pain-card">
                    <div class="dg-pain-card-icon"><i class="fas ${p.icon}"></i></div>
                    <div class="dg-pain-card-body">
                      <div class="dg-pain-card-name">${p.pain}</div>
                      <div class="dg-pain-card-solution"><i class="fas fa-arrow-right"></i> ${p.pack} \u2014 ${p.module}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <div class="dg-result-prospect">
            <h3><i class="fas fa-user-tie"></i> Fiche prospect</h3>
            <div class="dg-prospect-card">
              <div class="dg-prospect-row"><span>Nom</span><strong>${PROSPECT.name}</strong></div>
              <div class="dg-prospect-row"><span>Poste</span><strong>${PROSPECT.role}</strong></div>
              <div class="dg-prospect-row"><span>Entreprise</span><strong>${PROSPECT.company}</strong></div>
              <div class="dg-prospect-row"><span>Secteur</span><strong>${PROSPECT.sector}</strong></div>
              <div class="dg-prospect-row"><span>Salari\u00e9s</span><strong>${PROSPECT.employees} personnes, ${PROSPECT.sites} sites</strong></div>
            </div>
          </div>

          <div class="dg-result-actions">
            <button class="btn btn-primary" id="dgRetry"><i class="fas fa-rotate-right"></i> Recommencer</button>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#dgRetry').addEventListener('click', () => {
      currentStep = 0;
      score = 0;
      answers = [];
      pains = [];
      isTransitioning = false;
      render();
    });
  }

  render();
}
