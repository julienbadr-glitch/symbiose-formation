import { getState, saveState } from '../state.js?v=81';
import { TAB3_LABELS } from '../data.js?v=97';
import { addXP, tryUnlockBadge } from '../notifications.js?v=81';
import { updateSidebar } from './sidebar.js?v=81';
import { updateHeader } from './header.js?v=81';
import { handleQuizAnswer, LETTERS, QUIZ_PASS_RATE, XP_PER_CORRECT } from '../quiz.js?v=83';
import { navigateTo, $, $$ } from '../router.js?v=81';
import { renderDiscoveryGame } from './game-discovery.js?v=81';
import { renderPitchGame } from './game-pitch.js?v=81';
import { initSpeedMatching } from './game-speed-matching.js?v=81';
import { renderStrategeGame } from './game-stratege.js?v=81';
import { initGameCluedo } from './game-cluedo.js?v=82';
import { initGameDemoMixer } from './game-demo-mixer.js?v=81';
import { initGameObjections } from './game-objections.js?v=81';
import { initGameClosing } from './game-closing.js?v=81';
import { initGameJardin } from './game-jardin.js?v=81';

function completeStep(num) {
  const state = getState();
  if (!state.completedSteps.includes(num)) {
    state.completedSteps.push(num);
    // Badge now unlocked via quiz validation (70% quiz required)
    saveState();
    updateSidebar();
  }
  navigateTo(num < 8 ? `step-${num + 1}` : 'exam');
}

const MODULE_ROLEPLAY = { 1: 'decouverte-client', 6: 'objection', 7: 'closing' };

export function renderStep(main, step) {
  const state = getState();
  updateHeader();

  const activeTab = 'cours';
  const coursItems = step.cours || [];
  const scriptItems = step.script || [];
  const tab3Label = TAB3_LABELS[step.id] || 'Jeu';
  const tab3Icon = tab3Label.includes('Simulation') && !tab3Label.includes('Jeu')
    ? 'fa-masks-theater' : 'fa-gamepad';

  const quizQuestions = Array.isArray(step.quiz) ? step.quiz : [step.quiz];
  const stepAnswers = state.quizAnswered[step.id] || {};
  const totalQ = quizQuestions.length;
  const answeredQ = Object.keys(stepAnswers).length;
  const allDone = answeredQ === totalQ;
  const correctQ = Object.keys(stepAnswers).filter(qi => stepAnswers[qi] === quizQuestions[parseInt(qi)].correct).length;
  const currentQi = allDone ? totalQ - 1 : answeredQ;
  const passed = correctQ >= Math.ceil(totalQ * QUIZ_PASS_RATE);

  const visitedTabs = state.activeTabs[step.id] ? Object.keys(state.activeTabs).length > 0 : false;
  const quizDone = allDone;
  const isCompleted = state.completedSteps.includes(step.id);
    // Auto-revalidate: if quiz done + passed but step not completed, complete it now
    if (allDone && passed) {
      tryUnlockBadge('b' + step.id);
      completeStep(step.id);
    }
  function tabIndicator(tabKey) {
    if (isCompleted) return '<span class="tab-indicator tab-done"><i class="fas fa-check"></i></span>';
    if (tabKey === 'quiz' && quizDone) return '<span class="tab-indicator tab-done"><i class="fas fa-check"></i></span>';
    if (tabKey === activeTab) return '<span class="tab-indicator tab-current"></span>';
    return '<span class="tab-indicator tab-pending"></span>';
  }

  let html = `
    <div class="breadcrumb"><i class="fas fa-${step.icon}"></i> Module ${step.id}</div>
    <h1 class="view-title">${step.title}</h1>
    <p class="view-subtitle">${step.subtitle}</p>
    `;
  html += `<div class="module-tabs" id="moduleTabs-${step.id}">
      <button class="module-tab ${activeTab === 'cours' ? 'active' : ''}" data-tab="cours"><i class="fas fa-book-open"></i> Théorie${tabIndicator('cours')}</button>
      <button class="module-tab ${activeTab === 'script' ? 'active' : ''}" data-tab="script"><i class="fas fa-comments"></i> Script${tabIndicator('script')}</button>
      <button class="module-tab ${activeTab === 'jeu' ? 'active' : ''}" data-tab="jeu"><i class="fas ${tab3Icon}"></i> ${tab3Label}${tabIndicator('jeu')}</button>
      <button class="module-tab ${activeTab === 'quiz' ? 'active' : ''}" data-tab="quiz"><i class="fas fa-question-circle"></i> Quiz${tabIndicator('quiz')}</button>
    </div>
    <div class="module-tab-panels">
  `;

  html += `<div class="module-tab-panel ${activeTab === 'cours' ? 'active' : ''}" data-panel="cours">`;
  // Video section
  if (step.videoId && step.videoId !== 'coming-soon') {
      html += `<div class="card fade-in video-card" style="animation-delay:0s"><div class="card-header"><div class="card-icon purple"><i class="fas fa-video"></i></div><h2 class="card-title">Vidéo du module</h2></div><div class="card-body"><div class="video-container"><iframe src="https://player.vimeo.com/video/${step.videoId}?badge=0&amp;autopause=0&amp;player_id=0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" loading="lazy" allowfullscreen title="Module ${step.id}"></iframe></div></div></div>`;
  } else if (step.videoId === 'coming-soon') {
      html += `<div class="card fade-in video-card" style="animation-delay:0s"><div class="card-header"><div class="card-icon purple"><i class="fas fa-video"></i></div><h2 class="card-title">Vidéo du module</h2></div><div class="card-body"><div style="display:flex;align-items:center;justify-content:center;min-height:200px;border-radius:12px;background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4c1d95 100%)"><div style="text-align:center"><i class="fas fa-film" style="font-size:3rem;color:rgba(255,255,255,0.3);margin-bottom:1rem;display:block"></i><span style="color:rgba(255,255,255,0.7);font-size:1.1rem;font-weight:500">Vidéo à venir</span></div></div></div></div>`;
  }
  coursItems.forEach((sec, i) => {
    html += `<div class="card fade-in" style="animation-delay:${.04 * i}s"><div class="card-header"><div class="card-icon blue"><i class="fas ${sec.icon}"></i></div><h2 class="card-title">${sec.title}</h2></div><div class="card-body">${sec.body}</div></div>`;
  });
  html += `</div>`;

  html += `<div class="module-tab-panel ${activeTab === 'script' ? 'active' : ''}" data-panel="script">`;
  scriptItems.forEach((sec, i) => {
    html += `<div class="card fade-in" style="animation-delay:${.04 * i}s"><div class="card-header"><div class="card-icon green"><i class="fas ${sec.icon}"></i></div><h2 class="card-title">${sec.title}</h2></div><div class="card-body">${sec.body}</div></div>`;
  });
  html += `</div>`;

  html += `<div class="module-tab-panel ${activeTab === 'jeu' ? 'active' : ''}" data-panel="jeu">`;
  const roleplayId = MODULE_ROLEPLAY[step.id];
  if (roleplayId) {
    html += `<div class="card fade-in"><div class="card-header"><div class="card-icon amber"><i class="fas fa-users-cog"></i></div><h2 class="card-title">${tab3Label}</h2></div><div class="card-body" style="text-align:center;padding:40px 20px"><p style="font-size:16px;margin-bottom:20px;color:#64748b">Entraînez-vous avec notre IA dans une mise en situation réaliste.</p><button id="launchSim-${step.id}" class="btn-primary" style="display:inline-flex;align-items:center;gap:8px;padding:14px 28px;font-size:16px;border-radius:12px;cursor:pointer;border:none;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;font-weight:600;box-shadow:0 4px 14px rgba(245,158,11,0.4);transition:transform 0.2s"><i class="fas fa-play-circle"></i> Lancer la simulation</button></div></div>`;
  } else if (step.id >= 1 && step.id <= 8) {
    html += `<div id="gameContainer-${step.id}" class="fade-in"></div>`;
  } else {
    html += `<div class="card fade-in"><div class="card-header"><div class="card-icon amber"><i class="fas ${tab3Icon}"></i></div><h2 class="card-title">${tab3Label}</h2></div><div class="card-body"><div class="hbox blue" style="text-align:center;padding:40px 20px;font-size:16px"><i class="fas fa-gamepad" style="font-size:32px;margin-bottom:12px;display:block"></i> Bientôt disponible — Ce module interactif est en cours de développement.</div></div></div>`;
  }
  html += `</div>`;

  html += `<div class="module-tab-panel ${activeTab === 'quiz' ? 'active' : ''}" data-panel="quiz">`;
  html += `
    <div class="card fade-in" id="quizCard-${step.id}">
      <div class="card-header">
        <div class="card-icon amber"><i class="fas fa-question-circle"></i></div>
        <h2 class="card-title">Quiz</h2>
      </div>
      <div class="quiz-progress-bar">
        <div class="quiz-progress-fill" style="width:${Math.round((answeredQ / totalQ) * 100)}%"></div>
      </div>
      <div class="quiz-carousel" id="quizCarousel-${step.id}">`;

  if (allDone) {
    const xpEarned = correctQ * XP_PER_CORRECT;
    html += `
        <div class="quiz-slide active">
          <div class="quiz-result-panel">
            <div class="quiz-result-icon ${passed ? 'success' : 'fail'}"><i class="fas ${passed ? 'fa-trophy' : 'fa-rotate-right'}"></i></div>
            <div class="quiz-result-score">${correctQ}/${totalQ}</div>
            <div class="quiz-result-label">${passed ? 'Quiz r\u00e9ussi !' : 'Quiz non valid\u00e9'}</div>
            <div class="quiz-result-sub">${passed ? 'Vous ma\u00eetrisez ce module.' : 'Il faut au moins ' + Math.ceil(totalQ * QUIZ_PASS_RATE) + '/' + totalQ + ' bonnes r\u00e9ponses.'}</div>
            <div class="quiz-result-stats">
              <div class="quiz-result-stat correct"><i class="fas fa-check"></i> ${correctQ} correcte${correctQ > 1 ? 's' : ''}</div>
              <div class="quiz-result-stat incorrect"><i class="fas fa-times"></i> ${answeredQ - correctQ} incorrecte${(answeredQ - correctQ) > 1 ? 's' : ''}</div>
              <div class="quiz-result-stat xp"><i class="fas fa-bolt"></i> ${xpEarned} XP gagn\u00e9s</div>
            </div>
          </div>
        </div>`;
  } else {
    const q = quizQuestions[currentQi];
    html += `
        <div class="quiz-slide active" id="quizSlide-${step.id}">
          <div class="quiz-header-bar">
            <span class="quiz-q-label">Question ${currentQi + 1} sur ${totalQ}</span>
            <div class="quiz-progress-inline"><div class="quiz-progress-inline-fill" style="width:${Math.round((answeredQ / totalQ) * 100)}%"></div><span class="quiz-progress-pct">${Math.round((answeredQ / totalQ) * 100)}%</span></div>
          </div>
          <div class="quiz-question">${q.question}</div>
          <div class="quiz-options" id="quizOptions-${step.id}">
            ${q.options.map((o, i) => `
              <div class="quiz-option" data-idx="${i}">
                <div class="opt-letter">${LETTERS[i]}</div>
                <div>${o}</div>
              </div>
            `).join('')}
          </div>
          <div id="quizFeedback-${step.id}"></div>
        </div>`;
  }

  html += `</div></div>`;
  html += `</div></div>`;

  const tabOrder = ['cours', 'script', 'jeu', 'quiz'];
  const tabLabels = { cours: 'Théorie', script: 'Script', jeu: tab3Label, quiz: 'Quiz' };
  const tabIdx = tabOrder.indexOf(activeTab);

  html += `<div class="button-row" ${activeTab === 'quiz' ? 'style="display:none"' : ''}>`;

  if (tabIdx > 0) {
    const prevTab = tabOrder[tabIdx - 1];
    html += `<button class="btn btn-secondary" id="btnPrev"><i class="fas fa-arrow-left"></i> ${tabLabels[prevTab]}</button>`;
  } else if (step.id > 1) {
    html += `<button class="btn btn-secondary" id="btnPrevModule"><i class="fas fa-arrow-left"></i> Quiz Module ${step.id - 1}</button>`;
  }

  if (tabIdx < tabOrder.length - 1) {
    const nextTab = tabOrder[tabIdx + 1];
    html += `<button class="btn btn-primary" id="btnNext">${tabLabels[nextTab]} <i class="fas fa-arrow-right"></i></button>`;
  } else if (step.id < 8) {
    html += `<button class="btn btn-primary" id="btnNextModule">Module ${step.id + 1} <i class="fas fa-arrow-right"></i></button>`;
  } else {
    html += `<button class="btn btn-success" id="btnNextModule"><i class="fas fa-trophy"></i> Examen final</button>`;
  }

  html += `</div>`;

  main.innerHTML = html;

  const gameContainer = $(`#gameContainer-${step.id}`);
  if (step.id === 1 && gameContainer) renderDiscoveryGame(gameContainer);
  if (step.id === 2 && gameContainer) initSpeedMatching(gameContainer);
  if (step.id === 3 && gameContainer) renderStrategeGame(gameContainer);
  if (step.id === 4 && gameContainer) initGameCluedo(gameContainer);
  if (step.id === 5 && gameContainer) initGameDemoMixer(gameContainer);
  if (step.id === 6 && gameContainer) initGameObjections(gameContainer);
  if (step.id === 7 && gameContainer) initGameClosing(gameContainer);
  if (step.id === 8 && gameContainer) initGameJardin(gameContainer);

  $$(`#moduleTabs-${step.id} .module-tab`).forEach(tab => {
    tab.addEventListener('click', () => { switchToTab(tab.dataset.tab); });
  });

  // Simulation launch button
  const simRoleplayId = MODULE_ROLEPLAY[step.id];
  if (simRoleplayId) {
    const launchBtn = main.querySelector('#launchSim-' + step.id);
    if (launchBtn) {
      launchBtn.addEventListener('click', () => {
        navigateTo('roleplay-' + simRoleplayId);
      });
      launchBtn.addEventListener('mouseenter', () => { launchBtn.style.transform = 'scale(1.05)'; });
      launchBtn.addEventListener('mouseleave', () => { launchBtn.style.transform = 'scale(1)'; });
    }
  }

  if (!allDone) {
    $$(`#quizOptions-${step.id} .quiz-option`).forEach(opt => {
      opt.addEventListener('click', () => handleQuizAnswer(step, currentQi, parseInt(opt.dataset.idx)));
    });
  }

  function switchToTab(tabId) {
    state.activeTabs[step.id] = tabId;
    saveState();
    main.querySelectorAll('.module-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));
    main.querySelectorAll('.module-tab-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === tabId));
    const mainContent = main.closest('.main-content') || main;
    mainContent.scrollTop = 0;
      const newIdx = tabOrder.indexOf(tabId);
      let bHtml = '';
      if (tabId !== 'quiz') {
      if (newIdx > 0) { const pt = tabOrder[newIdx-1]; bHtml += `<button class="btn btn-secondary" id="btnPrev"><i class="fas fa-arrow-left"></i> ${tabLabels[pt]}</button>`; } else if (step.id > 1) { bHtml += `<button class="btn btn-secondary" id="btnPrevModule"><i class="fas fa-arrow-left"></i> Quiz Module ${step.id-1}</button>`; }
      if (newIdx < tabOrder.length-1) { const nt = tabOrder[newIdx+1]; bHtml += `<button class="btn btn-primary" id="btnNext">${tabLabels[nt]} <i class="fas fa-arrow-right"></i></button>`; } else if (step.id < 8) { bHtml += `<button class="btn btn-primary" id="btnNextModule">Module ${step.id+1} <i class="fas fa-arrow-right"></i></button>`; } else { bHtml += `<button class="btn btn-success" id="btnNextModule"><i class="fas fa-trophy"></i> Examen final</button>`; }
      }
        const btnRow = main.querySelector('.button-row'); if(btnRow){btnRow.style.display=tabId==='quiz'?'none':'';btnRow.innerHTML=bHtml; const pb=$('#btnPrev');if(pb)pb.addEventListener('click',()=>switchToTab(tabOrder[newIdx-1])); const pmb=$('#btnPrevModule');if(pmb)pmb.addEventListener('click',()=>{state.activeTabs[step.id-1]='quiz';saveState();navigateTo(`step-${step.id-1}`);}); const nb=$('#btnNext');if(nb)nb.addEventListener('click',()=>switchToTab(tabOrder[newIdx+1])); const nm=$('#btnNextModule');if(nm)nm.addEventListener('click',()=>completeStep(step.id));}
  }

  const prevBtn = $('#btnPrev');
  if (prevBtn) {
    const prevTab = tabOrder[tabIdx - 1];
    prevBtn.addEventListener('click', () => switchToTab(prevTab));
  }

  const prevModBtn = $('#btnPrevModule');
  if (prevModBtn) {
    prevModBtn.addEventListener('click', () => {
      state.activeTabs[step.id - 1] = 'quiz';
      saveState();
      navigateTo(`step-${step.id - 1}`);
    });
  }

  const nextBtn = $('#btnNext');
  if (nextBtn) {
    const nextTab = tabOrder[tabIdx + 1];
    nextBtn.addEventListener('click', () => switchToTab(nextTab));
  }

  const nextModBtn = $('#btnNextModule');
  if (nextModBtn) {
    nextModBtn.addEventListener('click', () => completeStep(step.id));
  }
}
