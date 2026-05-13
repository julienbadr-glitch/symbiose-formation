import { LEVELS } from './data.js?v=81';

const STORAGE_KEY = 'symbiose_state';

const TOTAL_STEPS = 8;
const PASS_THRESHOLD = 0.8;

let state = {
  xp: 0,
  completedSteps: [],
  unlockedBadges: [],
  quizAnswered: {},
  comboStreak: 0,
  xpQuiz: 0,
  xpGames: 0,
  xpSimulations: 0,
  examScore: null,
  examPassed: false,
  examDuration: null,
  currentView: 'home',
  activeTabs: {},
};

/**
 * @returns {object} The current application state.
 */
export function getState() {
  return state;
}

/**
 * Loads state from localStorage, with backward-compatibility handling.
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = { ...state, ...parsed };
      if (typeof state.quizAnswered !== 'object' || state.quizAnswered === null) {
        state.quizAnswered = {};
      }
      Object.keys(state.quizAnswered).forEach(k => {
        if (typeof state.quizAnswered[k] === 'number') {
          state.quizAnswered[k] = { 0: state.quizAnswered[k] };
        }
      });
    // Migrate XP categories - recalculate total from categories
    if (!state.xpQuiz) state.xpQuiz = 0;
    if (!state.xpGames) state.xpGames = 0;
    if (!state.xpSimulations) state.xpSimulations = 0;
    state.xp = state.xpQuiz + state.xpGames + state.xpSimulations;
    }
  } catch {
    /* ignore corrupt storage */
  }
}

/**
 * Persists the current state to localStorage.
 */
export function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * @param {number} xp - Current XP amount.
 * @returns {object} The level object that matches the given XP.
 */
export function getLevel(xp) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].min) return LEVELS[i];
  }
  return LEVELS[0];
}

/**
 * @param {number} xp - Current XP amount.
 * @returns {object|null} The next level object, or null if at max level.
 */
export function getNextLevel(xp) {
  const current = getLevel(xp);
  const idx = LEVELS.indexOf(current);
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
}

/**
 * @returns {number} Overall training progress as a percentage (0-100).
 */
export function getProgressPercent() {
  return Math.round((state.completedSteps.length / TOTAL_STEPS) * 100);
}

/**
 * @param {number} stepId - The step ID to check.
 * @returns {number} Step completion percentage (0, 75, or 100).
 */
export function getStepProgress(stepId) {
  if (state.completedSteps.includes(stepId)) return 100;
  if (state.quizAnswered[stepId]) return 75;
  return 0;
}

export { TOTAL_STEPS, PASS_THRESHOLD };
