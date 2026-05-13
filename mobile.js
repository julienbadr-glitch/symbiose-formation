/**
 * Mobile Module
 * Gestion responsive : hamburger menu, sidebar mobile, overlay
 */

export function isMobile() {
    return window.innerWidth <= 768;
}

export function initMobile() {
    var header = document.getElementById('topHeader');
    if (!header) return;

    // Create hamburger
    var btn = document.createElement('button');
    btn.id = 'hamburgerBtn';
    btn.textContent = '\u2630';
    btn.setAttribute('aria-label', 'Menu');
    btn.style.cssText = 'display:none;align-items:center;justify-content:center;background:none;border:none;color:#1e293b;font-size:24px;cursor:pointer;padding:6px;width:38px;height:38px;border-radius:8px;flex-shrink:0;font-family:system-ui,sans-serif;-webkit-tap-highlight-color:transparent;';
    header.insertBefore(btn, header.firstChild);

    // Create overlay
    var overlay = document.createElement('div');
    overlay.id = 'mobileOverlay';
    overlay.style.cssText = 'display:none;position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.5);z-index:999;';
    document.body.appendChild(overlay);

    var isOpen = false;

    function setSidebarStyle(sb, left) {
        sb.style.setProperty('position', 'fixed', 'important');
        sb.style.setProperty('top', '0', 'important');
        sb.style.setProperty('left', left, 'important');
        sb.style.setProperty('width', '100vw', 'important');
        sb.style.setProperty('height', '100vh', 'important');
        sb.style.setProperty('max-height', '100vh', 'important');
        sb.style.setProperty('min-height', '100vh', 'important');
        sb.style.setProperty('z-index', '1000', 'important');
        sb.style.setProperty('overflow-y', 'auto', 'important');
        sb.style.setProperty('transform', 'none', 'important');
        sb.style.setProperty('transition', 'left 0.3s ease', 'important');
        sb.style.setProperty('min-width', '100vw', 'important');
        sb.style.setProperty('max-width', '100vw', 'important');
        sb.style.setProperty('padding-bottom', '40px', 'important');
    }

    function ensureCloseBtn(sb) {
        var existing = sb.querySelector('#mobileCloseBtn');
        if (existing) return;
        var closeBtn = document.createElement('button');
        closeBtn.id = 'mobileCloseBtn';
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = 'position:absolute;top:12px;right:16px;background:none;border:none;color:#94a3b8;font-size:32px;cursor:pointer;z-index:1001;width:44px;height:44px;display:flex;align-items:center;justify-content:center;border-radius:8px;-webkit-tap-highlight-color:transparent;';
        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            closeMenu();
        });
        sb.style.setProperty('position', 'relative', '');
        sb.insertBefore(closeBtn, sb.firstChild);
        sb.style.setProperty('position', 'fixed', 'important');
    }

    function applyMobile() {
        if (!isMobile()) return;
        var sb = document.getElementById('sidebar');
        var mw = document.querySelector('.main-wrapper');
        var uh = document.getElementById('unifiedHeader');
        if (sb && !isOpen) {
            setSidebarStyle(sb, '-105vw');
        }
        if (mw) {
            mw.style.setProperty('margin-left', '0', 'important');
            mw.style.setProperty('width', '100%', 'important');
        }
        if (uh) uh.style.setProperty('display', 'none', 'important');
        btn.style.display = 'flex';
        header.style.cssText = 'padding:0 8px;height:50px;display:flex;align-items:center;gap:4px;overflow:hidden;';
    }

    function resetDesktop() {
        if (isMobile()) return;
        var sb = document.getElementById('sidebar');
        var mw = document.querySelector('.main-wrapper');
        var uh = document.getElementById('unifiedHeader');
        if (sb) sb.style.cssText = '';
        if (mw) {
            mw.style.cssText = '';
        }
        if (uh) uh.style.display = '';
        btn.style.display = 'none';
        header.style.cssText = '';
        overlay.style.display = 'none';
        isOpen = false;
        var closeBtn = sb && sb.querySelector('#mobileCloseBtn');
        if (closeBtn) closeBtn.remove();
    }

    function openMenu() {
        var sb = document.getElementById('sidebar');
        if (!sb) return;
        ensureCloseBtn(sb);
        setSidebarStyle(sb, '0px');
        overlay.style.display = 'block';
        isOpen = true;
    }

    function closeMenu() {
        var sb = document.getElementById('sidebar');
        if (!sb) return;
        setSidebarStyle(sb, '-105vw');
        overlay.style.display = 'none';
        isOpen = false;
    }

    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (isOpen) closeMenu(); else openMenu();
    });

    overlay.addEventListener('click', closeMenu);

    document.addEventListener('click', function(e) {
        if (isOpen && e.target.closest('#sidebar .nav-item, #sidebar a, #sidebar [data-view]')) {
            setTimeout(closeMenu, 150);
        }
    });

    window.addEventListener('resize', function() {
        if (isMobile()) applyMobile(); else resetDesktop();
    });

    if (isMobile()) applyMobile();
}
