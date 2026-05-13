let _navigateTo = null;

/**
 * Registers the navigation function. Called once from main.js during init.
 * @param {Function} fn - The navigateTo function.
 */
export function setNavigator(fn) {
  _navigateTo = fn;
}

/**
 * Navigates to a named view.
 * @param {string} view - The view identifier (e.g. 'home', 'step-1', 'exam').
 */
export function navigateTo(view) {
  if (_navigateTo) _navigateTo(view);
}

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

export { $, $$ };
