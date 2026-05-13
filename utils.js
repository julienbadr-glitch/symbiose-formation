/**
 * Utils Module
 * Selecteurs DOM, constantes UI et fonctions utilitaires
 */

export const $ = (sel) => document.querySelector(sel);
export const $$ = (sel) => document.querySelectorAll(sel);

export const HEADER_TITLES = {
    'home': 'Accueil',
    'step-1': 'Contexte Client',
    'step-2': 'Identifier les Douleurs',
    'step-3': 'Pr\u00e9sentation Symbiose',
    'step-4': 'D\u00e9roul\u00e9 de la D\u00e9mo',
    'step-5': 'Objections',
    'step-6': 'Proposition Commerciale',
    'step-7': 'Closing',
    'step-8': 'Bonnes Pratiques',
    'dashboard': 'Tableau de bord',
    'badges': 'Badges',
    'leaderboard': 'Leaderboard',
    'exam': 'Examen Final',
    'certificate': 'Certificat',
    'roleplay': 'Simulations',
};

export function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

export function sanitize(str) {
    if (!str) return '';
    if (typeof DOMPurify !== 'undefined') {
        return DOMPurify.sanitize(str, {
            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p', 'ul', 'ol', 'li', 'span'],
            ALLOWED_ATTR: ['style']
        });
    }
    return escapeHtml(String(str));
}


export function buildStepRingSVG(pct, showText = false) {
    const r = 18;
    const c = 2 * Math.PI * r;
    const offset = c - (pct / 100) * c;
    const color = pct === 100 ? '#10b981' : '#2563eb';
    const textEl = showText ? `<text x="24" y="24" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="600" fill="${color}">${pct}%</text>` : '';
    return `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="${r}" fill="none" stroke="#e2e8f0" stroke-width="3"/><circle cx="24" cy="24" r="${r}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${offset}" transform="rotate(-90 24 24)"/>${textEl}</svg>`;
}
