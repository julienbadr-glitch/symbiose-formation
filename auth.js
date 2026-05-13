// ============================================
// Symbiose Formation — Authentification + Sync
// ============================================

const API_BASE = '/api';
let currentUser = null;
var authToken = null;
let saveTimer = null;
let _retryCount = 0;
let _syncFailed = false;


// --- LOGIN SCREEN ---
function showLoginScreen() {
    window.location.href = '/login.html';
}

// --- HANDLE LOGIN (via API) ---
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const errorEl = document.getElementById('loginError');
    const btn = document.querySelector('.login-btn');
    errorEl.classList.add('hidden');
    btn.textContent = 'Connexion...';
    btn.disabled = true;

    try {
        const res = await fetch(API_BASE + '/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
            errorEl.textContent = data.error || 'Adresse non autorisee. Contactez votre responsable.';
            errorEl.classList.remove('hidden');
            btn.textContent = 'Acceder a ma formation';
            btn.disabled = false;
            return;
        }

        currentUser = data.user;
        authToken = data.token;
        localStorage.setItem('symbiose_session', JSON.stringify({
            email: data.user.email,
            token: data.token,
            isAdmin: data.isAdmin || false
        }));
        if (data.state) {
            localStorage.setItem('symbiose_state', JSON.stringify(data.state));
        }
        startApp();
    } catch (err) {
        errorEl.textContent = 'Erreur de connexion au serveur. Reessayez.';
        errorEl.classList.remove('hidden');
        btn.textContent = 'Acceder a ma formation';
        btn.disabled = false;
    }
}

// --- RESTORE SESSION ---
async function restoreSession() {
    const raw = localStorage.getItem('symbiose_session');
    if (!raw) return false;
    try {
        const session = JSON.parse(raw);
        if (!session.token) return false;

        const res = await fetch(API_BASE + '/state.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-Token': session.token
            },
            body: JSON.stringify({ _action: 'restore' })
        });

        if (!res.ok) {
            localStorage.removeItem('symbiose_session');
            return false;
        }

        const data = await res.json();
        currentUser = data.user;
        authToken = session.token;
        if (data.state) {
            localStorage.setItem('symbiose_state', JSON.stringify(data.state));
        }
        return true;
    } catch (err) {
        // Fallback : session locale minimale
        try {
            const session = JSON.parse(raw);
            if (session.email && session.token) {
                authToken = session.token;
                currentUser = { email: session.email };
                return true;
            }
        } catch (e) {}
        return false;
    }
}
// --- SAVE STATE TO SERVER ---
async function saveStateToServer(attempt = 1) {
    if (!authToken) return;
    const stateRaw = localStorage.getItem('symbiose_state');
    if (!stateRaw) return;

    try {
        const state = JSON.parse(stateRaw);

        // Try to refresh token from localStorage in case it was updated in another tab
        if (attempt > 1) {
            const sess = localStorage.getItem('symbiose_session');
            if (sess) {
                try {
                    const parsedSess = JSON.parse(sess);
                    if (parsedSess.token) {
                        authToken = parsedSess.token;
                    }
                } catch (e) { /* silent */ }
            }
        }

        const res = await fetch(API_BASE + '/state.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-Token': authToken
            },
            body: JSON.stringify({ state })
        });

        if (!res.ok) {
            const status = res.status;

            // 401 means token expired — try to restore session once
            if (status === 401 && attempt === 1) {
                console.warn('[Sync] Token expired (401). Attempting to refresh from localStorage.');
                await saveStateToServer(2);
                return;
            }

            // Retry on network/server errors, but not on 401 after refresh
            if (attempt < 3 && status !== 401) {
                const backoffMs = Math.pow(2, attempt) * 1000;
                console.warn('[Sync] Save failed (' + status + '). Retrying in ' + backoffMs + 'ms (attempt ' + attempt + '/3)');
                setTimeout(() => saveStateToServer(attempt + 1), backoffMs);
                return;
            }

            // Give up after 3 attempts or on 401
            console.warn('[Sync] Save failed after ' + attempt + ' attempt(s). Status: ' + status + '. Data persisted locally.');
            _syncFailed = true;
            _retryCount = attempt;
            updateSyncStatus();
            return;
        }

        // Success
        _syncFailed = false;
        _retryCount = 0;
        updateSyncStatus();
    } catch (err) {
        // Network error or JSON parse error
        if (attempt < 3) {
            const backoffMs = Math.pow(2, attempt) * 1000;
            console.warn('[Sync] Error during save: ' + err.message + '. Retrying in ' + backoffMs + 'ms (attempt ' + attempt + '/3)');
            setTimeout(() => saveStateToServer(attempt + 1), backoffMs);
            return;
        }

        console.warn('[Sync] Save failed after ' + attempt + ' attempt(s): ' + err.message + '. Data persisted locally.');
        _syncFailed = true;
        _retryCount = attempt;
        updateSyncStatus();
    }
}

// --- SYNC STATUS INDICATOR ---
function updateSyncStatus() {
    const indicatorId = 'syncStatusIndicator';
    let indicator = document.getElementById(indicatorId);

    if (_syncFailed) {
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = indicatorId;
            indicator.style.cssText = 'position:fixed;top:12px;right:12px;width:12px;height:12px;background-color:#ef4444;border-radius:50%;cursor:pointer;z-index:9999;box-shadow:0 2px 4px rgba(0,0,0,0.2);';
            indicator.title = 'Synchronisation echouee - vos donnees sont sauvegardees localement';
            document.body.appendChild(indicator);
        }
    } else {
        if (indicator) {
            indicator.remove();
        }
    }
}
// --- AUTO-SAVE : intercepter les ecritures localStorage ---
const _origSetItem = localStorage.setItem.bind(localStorage);
localStorage.setItem = function (key, value) {
    _origSetItem(key, value);
    if (key === 'symbiose_state' && authToken) {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => saveStateToServer(1), 2000);
    }
};

// --- PERIODIC SAVE (every 60 seconds) ---
setInterval(() => {
    if (authToken && localStorage.getItem('symbiose_state')) {
        saveStateToServer(1);
    }
}, 60000);

// --- LOGOUT ---
function clearSession() {
    localStorage.removeItem('symbiose_session');
    localStorage.removeItem('symbiose_state');
    currentUser = null;
    authToken = null;
    window.location.reload();
}

// --- RENDER USER INFO IN DOM ---
function renderUserUI() {
    if (!currentUser) return;

    const firstName = currentUser.firstName || currentUser.email.split('@')[0].split('.')[0].replace(/^./, c => c.toUpperCase());
    const lastName = currentUser.lastName || '';
    const fullName = (firstName + ' ' + lastName).trim();
    const shortName = firstName + (lastName ? ' ' + lastName[0] + '.' : '');
    const initials = (firstName[0] || '').toUpperCase() + (lastName ? lastName[0].toUpperCase() : '');

    // Observer pour mettre a jour le DOM quand le contenu change
    const updateUserElements = () => {
        // User name displays
        document.querySelectorAll('.user-name, #userName, [class*="user-name"], .header-profile-name').forEach(el => {
            if (!el.dataset.userPatched) {
                if (el.classList.contains('user-name') || el.classList.contains('header-profile-name')) {
                    el.textContent = shortName;
                } else {
                    el.textContent = fullName;
                }
                el.dataset.userPatched = 'true';
            }
        });

        // Avatars
        document.querySelectorAll('.user-avatar, .header-avatar, [class*="avatar"]:not(.home-lb-avatar)').forEach(el => {
            if (!el.dataset.userPatched && el.textContent.trim().length <= 3) {
                el.textContent = initials;
                el.dataset.userPatched = 'true';
            }
        });

        // Certificats
        document.querySelectorAll('[class*="certificate"], [class*="cert"]').forEach(el => {
            if (el.textContent && el.textContent.includes('Charlotte Danzon')) {
                el.textContent = el.textContent.replace(/Charlotte Danzon/g, fullName);
            }
        });
    };

    const observer = new MutationObserver(updateUserElements);
    observer.observe(document.body, { childList: true, subtree: true });

    // Injection sidebar : bouton logout + lien admin (une seule fois)
    setTimeout(() => {
        try {
            const sidebar = document.querySelector('.sidebar, [class*="sidebar"], nav');
            if (!sidebar) return;

            // Bouton logout
            if (!document.getElementById('logoutBtn')) {
                const btn = document.createElement('button');
                btn.id = 'logoutBtn';
                btn.textContent = 'Deconnexion';
                btn.style.cssText = 'display:block;margin-top:10px;text-align:center;background:#ef4444;color:#fff;border-radius:8px;padding:12px 16px;border:none;font-weight:600;font-size:14px;cursor:pointer;width:100%;';
                btn.onclick = clearSession;
                sidebar.appendChild(btn);
            }

            // Lien admin (base sur la session locale)
            if (!document.getElementById('adminPanelLink')) {
                try {
                    const sess = JSON.parse(localStorage.getItem('symbiose_session') || '{}');
                    if (sess.isAdmin) {
                        const link = document.createElement('a');
                        link.href = '/admin.html';
                        link.id = 'adminPanelLink';
                        link.style.cssText = 'display:block;margin-top:10px;text-align:center;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border-radius:8px;padding:12px 16px;text-decoration:none;font-weight:600;font-size:14px;cursor:pointer;';
                        link.textContent = 'Espace Admin';
                        sidebar.appendChild(link);setTimeout(function(){var _f=document.querySelector('.sidebar-footer');if(_f&&link.parentElement!==_f){_f.insertBefore(link,_f.firstChild)}},3000);
                    }
                } catch (e) { /* silent */ }
            }
        } catch (e) { /* silent */ }
    }, 1000);
}

// --- SAVE ON PAGE CLOSE ---
window.addEventListener('beforeunload', () => {
    if (authToken) {
        const stateRaw = localStorage.getItem('symbiose_state');
        if (stateRaw) {
            navigator.sendBeacon(
                API_BASE + '/state.php',
                new Blob(
                    [JSON.stringify({ state: JSON.parse(stateRaw), _token: authToken })],
                    { type: 'application/json' }
                )
            );
        }
    }
});

// --- START APP ---
function startApp() {
    const ls = document.getElementById('loginScreen');
    if (ls) ls.style.display = 'none';
    document.getElementById('app').style.display = '';
    renderUserUI();

    const script = document.createElement('script');
    script.type = 'module';
    script.src = '/main.js?v=100';
    document.body.appendChild(script);
}

// --- INIT ---
(async function init() {
    // Restaurer la session locale
    const restored = await restoreSession();
    if (restored) {
        startApp();
    } else {
        showLoginScreen();
    }
})();