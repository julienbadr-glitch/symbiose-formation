import { getState, getLevel } from '../state.js?v=81';

const MAX_XP = 1500;

/**
 * Renders the leaderboard with rankings from the database.
 * @param {HTMLElement} main - The main content container.
 */
export function renderLeaderboard(main) {
    const state = getState();
    const currentEmail = state.email || '';

    // Show loading state
    main.innerHTML = `
        <div class="breadcrumb"><i class="fas fa-ranking-star"></i> Classement</div>
        <h1 class="view-title">Leaderboard</h1>
        <p class="view-subtitle">Les meilleurs consultants du programme Symbiose.</p>
        <div class="card"><p style="text-align:center;padding:2rem;">Chargement...</p></div>
    `;

    fetch('/api/leaderboard.php')
        .then(r => r.json())
        .then(data => {
            if (!data.success || !data.leaderboard) throw new Error('API error');

            const entries = data.leaderboard.map(u => {
                const isMe = u.email === currentEmail;
                return {
                    name: u.name,
                    initials: u.initials,
                    xp: isMe ? state.xp : u.xp,
                    level: getLevel(isMe ? state.xp : u.xp).name,
                    me: isMe
                };
            });

            const sorted = entries.sort((a, b) => b.xp - a.xp);
            const rankColors = ['gold', 'silver', 'bronze'];

            main.innerHTML = `
                <div class="breadcrumb"><i class="fas fa-ranking-star"></i> Classement</div>
                <h1 class="view-title">Leaderboard</h1>
                <p class="view-subtitle">Les meilleurs consultants du programme Symbiose.</p>
                <div class="card">
                    ${sorted.map((u, i) => `
                        <div class="lb-item ${u.me ? 'me' : ''} fade-in" style="animation-delay:${.05 * i}s">
                            <div class="lb-rank ${rankColors[i] || ''}">${i + 1}</div>
                            <div class="lb-avatar">${u.initials}</div>
                            <div class="lb-info">
                                <div class="lb-name">${u.name}${u.me ? '<span class="lb-badge-you">Vous</span>' : ''}</div>
                                <div class="lb-level">${u.level}</div>
                            </div>
                            <div class="lb-progress"><div class="lb-progress-fill" style="width:${Math.round((u.xp / MAX_XP) * 100)}%"></div></div>
                            <div class="lb-xp">${u.xp} XP</div>
                        </div>
                    `).join('')}
                </div>
            `;
        })
        .catch(() => {
            // Fallback: use static data if API fails
            import('../data.js?v=81').then(({ LEADERBOARD }) => {
                const entries = LEADERBOARD.map(u => u.me ? { ...u, xp: state.xp, level: getLevel(state.xp).name } : u);
                const sorted = entries.sort((a, b) => b.xp - a.xp);
                const rankColors = ['gold', 'silver', 'bronze'];
                main.innerHTML = `
                    <div class="breadcrumb"><i class="fas fa-ranking-star"></i> Classement</div>
                    <h1 class="view-title">Leaderboard</h1>
                    <p class="view-subtitle">Les meilleurs consultants du programme Symbiose.</p>
                    <div class="card">
                        ${sorted.map((u, i) => `
                            <div class="lb-item ${u.me ? 'me' : ''} fade-in" style="animation-delay:${.05 * i}s">
                                <div class="lb-rank ${rankColors[i] || ''}">${i + 1}</div>
                                <div class="lb-avatar">${u.initials}</div>
                                <div class="lb-info">
                                    <div class="lb-name">${u.name}${u.me ? '<span class="lb-badge-you">Vous</span>' : ''}</div>
                                    <div class="lb-level">${u.level}</div>
                                </div>
                                <div class="lb-progress"><div class="lb-progress-fill" style="width:${Math.round((u.xp / MAX_XP) * 100)}%"></div></div>
                                <div class="lb-xp">${u.xp} XP</div>
                            </div>
                        `).join('')}
                    </div>
                `;
            });
        });
}
