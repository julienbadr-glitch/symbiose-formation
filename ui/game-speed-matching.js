import { getState, saveState } from '../state.js?v=81';
import { addXP, triggerConfetti } from '../notifications.js?v=81';

const ROUNDS = [
  {
    id: 1,
    title: 'Les Modules',
    icon: 'fa-puzzle-piece',
    color: '#3b82f6',
    cards: [
      {
        question: 'G\u00e9rer les demandes de cong\u00e9s et suivre les absences',
        icon: 'fa-umbrella-beach',
        correct: 1,
        options: ['\u00c9quipe', 'Cong\u00e9s & Absences', 'Entretiens', 'Contrats'],
      },
      {
        question: 'Planifier et suivre les entretiens professionnels',
        icon: 'fa-comments',
        correct: 1,
        options: ['Recrutement', 'Entretiens', 'Humeur', '\u00c9quipe'],
      },
      {
        question: 'Publier des offres d\u2019emploi et suivre les candidatures',
        icon: 'fa-bullseye',
        correct: 1,
        options: ['CVth\u00e8que', 'Recrutement', 'Int\u00e9grations', '\u00c9quipe'],
      },
      {
        question: 'Consulter l\u2019organigramme et les fiches collaborateurs',
        icon: 'fa-sitemap',
        correct: 1,
        options: ['Documents', '\u00c9quipe', 'Contrats', 'Humeur'],
      },
      {
        question: 'Mesurer le bien-\u00eatre avec des sondages r\u00e9guliers',
        icon: 'fa-face-smile',
        correct: 1,
        options: ['Entretiens', 'Humeur', '\u00c9quipe', 'Obligations'],
      },
    ],
  },
  {
    id: 2,
    title: 'Les Packs',
    icon: 'fa-box-open',
    color: '#f59e0b',
    cards: [
      {
        question: 'TPE de 15 salari\u00e9s : digitaliser cong\u00e9s et entretiens',
        icon: 'fa-seedling',
        correct: 0,
        options: ['Pack Essentiel', 'Pack Acquisition', 'Pack Conformit\u00e9', 'Pack Int\u00e9gral'],
      },
      {
        question: 'PME de 80 personnes : recruter et onboarder',
        icon: 'fa-rocket',
        correct: 1,
        options: ['Pack Essentiel', 'Pack Acquisition', 'Pack Conformit\u00e9', 'Pack Int\u00e9gral'],
      },
      {
        question: 'BTP : obligations r\u00e9glementaires et registre du personnel',
        icon: 'fa-shield-halved',
        correct: 2,
        options: ['Pack Essentiel', 'Pack Acquisition', 'Pack Conformit\u00e9', 'Pack Int\u00e9gral'],
      },
      {
        question: 'ETI de 200 salari\u00e9s : solution RH compl\u00e8te',
        icon: 'fa-building',
        correct: 3,
        options: ['Pack Essentiel', 'Pack Acquisition', 'Pack Conformit\u00e9', 'Pack Int\u00e9gral'],
      },
      {
        question: 'Contient \u00c9quipe, Cong\u00e9s/Absences, Entretiens et Humeur',
        icon: 'fa-cubes',
        correct: 0,
        options: ['Pack Essentiel', 'Pack Acquisition', 'Pack Conformit\u00e9', 'Pack Int\u00e9gral'],
      },
    ],
  },
  {
    id: 3,
    title: 'L\u2019Architecture',
    icon: 'fa-layer-group',
    color: '#10b981',
    cards: [
      {
        question: '\u00c0 quel niveau appartient le module Recrutement ?',
        icon: 'fa-layer-group',
        correct: 1,
        options: ['Niveau Essentiel', 'Niveau Acquisition', 'Niveau Conformit\u00e9', 'Niveau Administratif'],
      },
      {
        question: 'Stocker et rechercher des CV dans une base centralis\u00e9e',
        icon: 'fa-database',
        correct: 1,
        options: ['Recrutement', 'CVth\u00e8que', 'Documents', 'Int\u00e9grations'],
      },
      {
        question: 'G\u00e9rer contrats de travail, avenants et DPAE',
        icon: 'fa-file-contract',
        correct: 1,
        options: ['Documents', 'Contrats', 'Obligations', '\u00c9quipe'],
      },
      {
        question: 'Suivre DUERP, registre du personnel, affichage obligatoire',
        icon: 'fa-clipboard-list',
        correct: 1,
        options: ['Contrats', 'Obligations', 'Documents', 'Conformit\u00e9'],
      },
      {
        question: 'Connecter Symbiose avec les outils existants (paie, compta)',
        icon: 'fa-plug',
        correct: 1,
        options: ['Documents', 'Int\u00e9grations', '\u00c9quipe', 'CVth\u00e8que'],
      },
    ],
  },
];

const TIMER_DURATION = 15000;
const POINTS_PER_CARD = 100;
const TOTAL_CARDS = 15;
const MAX_SCORE = 1500;
const FEEDBACK_DELAY = 1500;

export function initSpeedMatching(container) {
  let phase = 'intro';
  let currentRound = 0;
  let currentCard = 0;
  let globalCardIndex = 0;
  let score = 0;
  let combo = 0;
  let bestCombo = 0;
  let correctCount = 0;
  let timerId = null;
  let timerStart = 0;
  let timerRemaining = TIMER_DURATION;
  let timerAnimFrame = null;
  let totalTimeMs = 0;
  let cardTimes = [];
  let cardResults = [];
  let answered = false;
  let gameStartTime = 0;

  function cleanup() {
    if (timerId) { clearTimeout(timerId); timerId = null; }
    if (timerAnimFrame) { cancelAnimationFrame(timerAnimFrame); timerAnimFrame = null; }
  }

  function render() {
    cleanup();
    switch (phase) {
      case 'intro': renderIntro(); break;
      case 'round-intro': renderRoundIntro(); break;
      case 'play': renderPlay(); break;
      case 'results': renderResults(); break;
    }
  }

  function renderIntro() {
    container.innerHTML = `
      <div class="sm-wrapper">
        <div class="sm-intro-banner fade-in">
          <div class="sm-intro-badge"><i class="fas fa-bolt"></i></div>
          <div class="sm-intro-titles">
            <span class="sm-intro-tag">Speed Matching</span>
            <h2>Ma\u00eetrisez l\u2019\u00e9cosyst\u00e8me Symbiose</h2>
            <p>3 rounds &bull; 15 cartes &bull; Score max : 1 500 pts</p>
          </div>
        </div>

        <div class="sm-intro-narrator fade-in" style="animation-delay:0.1s">
          <div class="sm-narrator-avatar">SF</div>
          <div class="sm-narrator-speech">
            <div class="sm-narrator-name">Sophie Faure <span>Responsable P\u00e9dagogique</span></div>
            <p>Vous pensez conna\u00eetre Symbiose sur le bout des doigts\u202f? Prouvez-le\u202f! Associez chaque carte \u00e0 la bonne r\u00e9ponse avant que le temps ne s\u2019\u00e9coule. Attention, la vitesse compte autant que la pr\u00e9cision\u202f!</p>
          </div>
        </div>

        <div class="sm-rounds-preview fade-in" style="animation-delay:0.15s">
          ${ROUNDS.map((r, i) => `
            <div class="sm-round-preview-card" style="--rp-color:${r.color}">
              <div class="sm-round-num">Round ${i + 1}</div>
              <div class="sm-round-icon"><i class="fas ${r.icon}"></i></div>
              <div class="sm-round-title">${r.title}</div>
              <div class="sm-round-desc">${r.cards.length} cartes</div>
            </div>
          `).join('')}
        </div>

        <div class="sm-intro-stats fade-in" style="animation-delay:0.2s">
          <div class="sm-intro-stat"><i class="fas fa-layer-group"></i> 15 cartes</div>
          <div class="sm-intro-stat"><i class="fas fa-clock"></i> ~3 min</div>
          <div class="sm-intro-stat"><i class="fas fa-star"></i> 1 500 pts max</div>
        </div>

        <div class="sm-intro-start fade-in" style="animation-delay:0.25s">
          <button class="btn btn-primary sm-start-btn" id="smStart">
            <i class="fas fa-bolt"></i> C'est parti !
          </button>
        </div>
      </div>
    `;
    container.querySelector('#smStart').addEventListener('click', () => {
      gameStartTime = Date.now();
      phase = 'round-intro';
      render();
    });
  }

  function renderRoundIntro() {
    const round = ROUNDS[currentRound];
    container.innerHTML = `
      <div class="sm-wrapper">
        <div class="sm-round-splash fade-in" style="--splash-color:${round.color}">
          <div class="sm-splash-num">Round ${currentRound + 1}</div>
          <div class="sm-splash-icon"><i class="fas ${round.icon}"></i></div>
          <h2>${round.title}</h2>
          <p>${round.cards.length} cartes</p>
        </div>
      </div>
    `;
    setTimeout(() => {
      currentCard = 0;
      phase = 'play';
      render();
    }, 1800);
  }

  function renderPlay() {
    const round = ROUNDS[currentRound];
    const card = round.cards[currentCard];
    answered = false;

    const cardsBeforeThisRound = ROUNDS.slice(0, currentRound).reduce((s, r) => s + r.cards.length, 0);
    globalCardIndex = cardsBeforeThisRound + currentCard;

    container.innerHTML = `
      <div class="sm-wrapper">
        <div class="sm-play-topbar fade-in">
          <div class="sm-play-topbar-left">
            <span class="sm-play-round-badge" style="--rb-color:${round.color}">
              <i class="fas ${round.icon}"></i> ${round.title}
            </span>
            <span class="sm-play-card-count">Carte ${globalCardIndex + 1}/${TOTAL_CARDS}</span>
          </div>
          <div class="sm-play-topbar-right">
            ${combo >= 2 ? `<div class="sm-combo-badge sm-combo-pulse"><i class="fas fa-fire"></i> x${combo}</div>` : ''}
            <div class="sm-score-display"><i class="fas fa-star"></i> ${score}</div>
          </div>
        </div>

        <div class="sm-play-progress">
          <div class="sm-play-progress-fill" style="width:${(globalCardIndex / TOTAL_CARDS) * 100}%"></div>
        </div>

        <div class="sm-card-area">
          <div class="sm-question-card sm-card-enter" id="smCard">
            <div class="sm-question-icon" style="color:${round.color}"><i class="fas ${card.icon}"></i></div>
            <p class="sm-question-text">${card.question}</p>
          </div>

          <div class="sm-timer-bar" id="smTimerBar">
            <div class="sm-timer-fill" id="smTimerFill"></div>
          </div>
          <div class="sm-timer-label" id="smTimerLabel">15.0s</div>

          <div class="sm-options" id="smOptions">
            ${card.options.map((opt, i) => `
              <button class="sm-option-btn" data-idx="${i}">
                <span class="sm-option-letter">${String.fromCharCode(65 + i)}</span>
                <span>${opt}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="sm-floating-points hidden" id="smFloatingPts"></div>
      </div>
    `;

    startTimer();

    container.querySelectorAll('.sm-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (answered) return;
        handleAnswer(parseInt(btn.dataset.idx));
      });
    });
  }

  function startTimer() {
    timerStart = Date.now();
    timerRemaining = TIMER_DURATION;

    function tick() {
      const elapsed = Date.now() - timerStart;
      timerRemaining = Math.max(0, TIMER_DURATION - elapsed);
      const pct = (timerRemaining / TIMER_DURATION) * 100;

      const fill = container.querySelector('#smTimerFill');
      const label = container.querySelector('#smTimerLabel');
      if (fill) {
        fill.style.width = pct + '%';
        if (pct > 50) fill.className = 'sm-timer-fill sm-timer-green';
        else if (pct > 25) fill.className = 'sm-timer-fill sm-timer-yellow';
        else fill.className = 'sm-timer-fill sm-timer-red';
      }
      if (label) label.textContent = (timerRemaining / 1000).toFixed(1) + 's';

      if (timerRemaining <= 0) {
        handleTimeout();
        return;
      }
      timerAnimFrame = requestAnimationFrame(tick);
    }
    timerAnimFrame = requestAnimationFrame(tick);
  }

  function handleAnswer(idx) {
    answered = true;
    cleanup();
    const round = ROUNDS[currentRound];
    const card = round.cards[currentCard];
    const isCorrect = idx === card.correct;
    const cardTime = TIMER_DURATION - timerRemaining;
    cardTimes.push(cardTime);
    totalTimeMs += cardTime;

    const btns = container.querySelectorAll('.sm-option-btn');
    btns.forEach(b => b.disabled = true);

    cardResults.push(isCorrect);

    if (isCorrect) {
      combo++;
      if (combo > bestCombo) bestCombo = combo;
      correctCount++;
      const multiplier = Math.max(1, combo);
      const pts = POINTS_PER_CARD * multiplier;
      score += pts;

      btns[idx].classList.add('sm-option-correct');
      showFloatingPoints(pts);
    } else {
      combo = 0;
      btns[idx].classList.add('sm-option-wrong', 'sm-shake');
      btns[card.correct].classList.add('sm-option-correct', 'sm-blink');
    }

    setTimeout(advanceCard, isCorrect ? 800 : FEEDBACK_DELAY);
  }

  function handleTimeout() {
    if (answered) return;
    answered = true;
    cleanup();
    const round = ROUNDS[currentRound];
    const card = round.cards[currentCard];
    cardTimes.push(TIMER_DURATION);
    cardResults.push(false);
    totalTimeMs += TIMER_DURATION;
    combo = 0;

    const btns = container.querySelectorAll('.sm-option-btn');
    btns.forEach(b => b.disabled = true);

    const cardEl = container.querySelector('#smCard');
    if (cardEl) cardEl.classList.add('sm-card-timeout');

    btns[card.correct].classList.add('sm-option-correct', 'sm-blink');

    setTimeout(advanceCard, FEEDBACK_DELAY);
  }

  function showFloatingPoints(pts) {
    const el = container.querySelector('#smFloatingPts');
    if (!el) return;
    el.textContent = `+${pts}`;
    el.className = 'sm-floating-points sm-float-up';
    setTimeout(() => { el.className = 'sm-floating-points hidden'; }, 1000);
  }

  function advanceCard() {
    const round = ROUNDS[currentRound];
    currentCard++;
    if (currentCard >= round.cards.length) {
      currentRound++;
      if (currentRound >= ROUNDS.length) {
        phase = 'results';
      } else {
        phase = 'round-intro';
      }
    } else {
      phase = 'play';
    }
    render();
  }

  function renderResults() {
    const totalGameTime = Date.now() - gameStartTime;
    const totalSec = Math.round(totalGameTime / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    const avgTime = cardTimes.length > 0 ? (cardTimes.reduce((a, b) => a + b, 0) / cardTimes.length / 1000).toFixed(1) : '0.0';

    const stars = score > 1200 ? 3 : score > 900 ? 2 : score > 500 ? 1 : 0;
    const starIcons = Array.from({ length: 3 }, (_, i) =>
      `<span class="sm-star ${i < stars ? 'sm-star-active' : ''}"><i class="fas fa-star"></i></span>`
    ).join('');

    let message, messageIcon, messageColor;
    if (score > 1200) {
      message = 'Impressionnant ! Vous \u00eates un expert Symbiose !';
      messageIcon = 'fa-trophy';
      messageColor = 'gold';
    } else if (score > 900) {
      message = 'Excellent ! Vous ma\u00eetrisez bien l\u2019\u00e9cosyst\u00e8me Symbiose.';
      messageIcon = 'fa-medal';
      messageColor = 'blue';
    } else if (score > 500) {
      message = 'Bien jou\u00e9 ! Vous connaissez les bases. Quelques r\u00e9visions et vous serez au top.';
      messageIcon = 'fa-thumbs-up';
      messageColor = 'blue';
    } else {
      message = 'Pas mal pour un d\u00e9but ! Revoyez la th\u00e9orie et retentez votre chance.';
      messageIcon = 'fa-rotate-right';
      messageColor = 'orange';
    }

    // no-op, round detail computed inline below

    const state = getState();
    const gameKey = 'game_speed_2';
    const prevBest = state[gameKey] || 0;
    const isNewBest = score > prevBest;
    if (isNewBest) {
      state[gameKey] = score;
      saveState();
    }
    if (score >= 500) addXP(Math.min(score, 100), 'games');
    if (score >= 1200) triggerConfetti();

    container.innerHTML = `
      <div class="sm-wrapper">
        <div class="sm-results-hero fade-in sm-results-${messageColor}">
          <div class="sm-results-icon-wrap"><i class="fas ${messageIcon}"></i></div>
          <div class="sm-results-stars">${starIcons}</div>
          <div class="sm-results-score">${score}<span>/${MAX_SCORE}</span></div>
          <p class="sm-results-message">${message}</p>
          ${isNewBest ? '<div class="sm-results-best"><i class="fas fa-arrow-up"></i> Nouveau record !</div>' : ''}
        </div>

        <div class="sm-results-stats fade-in" style="animation-delay:0.1s">
          <div class="sm-stat-card">
            <div class="sm-stat-icon" style="background:#dcfce7;color:#16a34a"><i class="fas fa-check"></i></div>
            <div class="sm-stat-value">${correctCount}/${TOTAL_CARDS}</div>
            <div class="sm-stat-label">Bonnes r\u00e9ponses</div>
          </div>
          <div class="sm-stat-card">
            <div class="sm-stat-icon" style="background:#fff7ed;color:#ea580c"><i class="fas fa-fire"></i></div>
            <div class="sm-stat-value">x${bestCombo}</div>
            <div class="sm-stat-label">Meilleur combo</div>
          </div>
          <div class="sm-stat-card">
            <div class="sm-stat-icon" style="background:#eff6ff;color:#2563eb"><i class="fas fa-clock"></i></div>
            <div class="sm-stat-value">${min}:${String(sec).padStart(2, '0')}</div>
            <div class="sm-stat-label">Temps total</div>
          </div>
          <div class="sm-stat-card">
            <div class="sm-stat-icon" style="background:#fdf4ff;color:#a855f7"><i class="fas fa-gauge-high"></i></div>
            <div class="sm-stat-value">${avgTime}s</div>
            <div class="sm-stat-label">Temps moyen</div>
          </div>
        </div>

        <div class="sm-results-rounds fade-in" style="animation-delay:0.15s">
          <h3><i class="fas fa-chart-bar"></i> D\u00e9tail par round</h3>
          ${ROUNDS.map((r, ri) => {
            const startIdx = ROUNDS.slice(0, ri).reduce((s, rr) => s + rr.cards.length, 0);
            const rCorrect = r.cards.filter((c, ci) => cardResults[startIdx + ci] === true).length;
            return `
              <div class="sm-round-result" style="--rr-color:${r.color}">
                <div class="sm-rr-icon"><i class="fas ${r.icon}"></i></div>
                <div class="sm-rr-info">
                  <div class="sm-rr-title">Round ${ri + 1} \u2014 ${r.title}</div>
                  <div class="sm-rr-bar"><div class="sm-rr-bar-fill" style="width:${(rCorrect / r.cards.length) * 100}%"></div></div>
                </div>
                <div class="sm-rr-score">${rCorrect}/${r.cards.length}</div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="sm-results-actions fade-in" style="animation-delay:0.2s">
          <button class="btn btn-primary" id="smRetry"><i class="fas fa-rotate-right"></i> Rejouer</button>
        </div>
      </div>
    `;

    container.querySelector('#smRetry').addEventListener('click', () => {
      phase = 'intro';
      currentRound = 0;
      currentCard = 0;
      globalCardIndex = 0;
      score = 0;
      combo = 0;
      bestCombo = 0;
      correctCount = 0;
      totalTimeMs = 0;
      cardTimes = [];
      cardResults = [];
      render();
    });
  }

  render();
}
