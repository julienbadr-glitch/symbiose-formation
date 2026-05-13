
import { STEPS } from './data.js?v=97';
import { getState, loadState, saveState } from './state.js?v=81';
import { setNavigator, $$ } from './router.js?v=81';
import { stopSpeaking } from './speech.js?v=81';

import { updateHeader } from './ui/header.js?v=81';
import { updateSidebar } from './ui/sidebar.js?v=81';
import { renderHome } from './ui/home.js?v=88';
import { renderStep } from './ui/step.js?v=87';
import { renderDashboard } from './ui/dashboard.js?v=81';
import { renderBadges } from './ui/badges.js?v=81';
import { renderLeaderboard } from './ui/leaderboard.js?v=81';
import { renderExam, cleanupExam } from './ui/exam.js?v=83';
import { renderCertificate } from './ui/certificate.js?v=82';
import { renderRoleplayHub, renderRoleplayChat } from './ui/roleplay.js?v=81';

/**
 * Routes to the appropriate render function based on view name.
 * @param {string} view - The view identifier.
 */
function renderView(view) {
  const main = document.getElementById('mainContent');
  if (!main) return;

  const stepMatch = view.match(/^step-(\d+)$/);
  const roleplayMatch = view.match(/^roleplay-(.+)$/);

  if (stepMatch) {
    const step = STEPS[parseInt(stepMatch[1]) - 1];
    if (step) renderStep(main, step);
    return;
  }

  if (roleplayMatch && roleplayMatch[1] !== '') {
    renderRoleplayChat(main, roleplayMatch[1]);
    return;
  }

  const views = {
    home: renderHome,
    dashboard: renderDashboard,
    badges: renderBadges,
    leaderboard: renderLeaderboard,
    exam: renderExam,
    certificate: renderCertificate,
    roleplay: renderRoleplayHub,
  };

  const renderer = views[view];
  if (renderer) renderer(main);
}

/**
 * Navigates to a named view, updates state, and triggers re-render.
 * @param {string} view - The view identifier.
 */
function closeMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
}

function navigateTo(view) {
  const state = getState();
  stopSpeaking();
  cleanupExam();
  state.currentView = view;
  renderView(view);
  updateHeader();
  saveState();
  closeMobileSidebar();

  $$('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.view === view);
  });
}

/**
 * Initializes the application: loads state, sets up navigation, and renders initial view.
 */
function init() {
  loadState();
  setNavigator(navigateTo);
  updateSidebar();
  $$('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const view = item.dataset.view;
      if (view) navigateTo(view);
    });
  });
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
  const sidebar = document.getElementById('sidebar');

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
      sidebar.classList.add('open');
      sidebarOverlay.classList.add('open');
    });
  }
  if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeMobileSidebar);
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeMobileSidebar);

  const logo = document.querySelector('.sidebar-header .logo');
  if (logo) {
    logo.style.cursor = 'pointer';
    logo.addEventListener('click', () => navigateTo('home'));
  }

  navigateTo(getState().currentView || 'home');
}

init();
