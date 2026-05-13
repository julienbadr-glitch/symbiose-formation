// ============================================
// Symbiose Formation — UX Enhancement v1.0
// Réorganisation DOM, XP header, progress dots
// ============================================

(function() {
  'use strict';

  // Attendre que le DOM de l'app soit prêt
  function waitForApp(cb, maxTries) {
    maxTries = maxTries || 150;
    var tries = 0;
    var interval = setInterval(function() {
      tries++;
      var sidebar = document.querySelector('.sidebar nav');
      var header = document.querySelector('.top-header .header-right');
      if (sidebar && header) {
        clearInterval(interval);
        cb();
      } else if (tries >= maxTries) {
        clearInterval(interval);
      }
    }, 200);
  }

  function initEnhancements() {
    try {

      var sidebar = document.querySelector('.sidebar nav');
      var header = document.querySelector('.top-header .header-right');
      if (!sidebar || !header) {

        return false;
      }

      moveXpToHeader();
      addNavProgressDots();
      setupXpToast();
      setupBadgeToast();
      observeStateChanges();

      return true;
    } catch(e) {
      console.error('[UX] Error:', e);
      return false;
    }
  }

  // Permanent watcher: re-apply UX if DOM gets rebuilt (no limit)
  setInterval(function() {
    if (!document.getElementById('headerXpBar') && document.querySelector('.top-header .header-right')) {
      initEnhancements();
    }
  }, 800);

  // -------------------------------------------
  // 1. Déplacer la barre XP dans le header
  // -------------------------------------------
  function moveXpToHeader() {
    var headerRight = document.querySelector('.top-header .header-right');
    if (!headerRight || document.getElementById('headerXpBar')) return;

    var xpData = getXpData();

    var xpBar = document.createElement('div');
    xpBar.id = 'headerXpBar';
    xpBar.innerHTML =
      '<span class="hxp-label">' + xpData.current + ' XP</span>' +
      '<div class="hxp-track"><div class="hxp-fill" style="width:' + xpData.percent + '%"></div></div>' +
      '<span class="hxp-level">' + xpData.current + '/' + xpData.max + '</span>';

    headerRight.parentNode.insertBefore(xpBar, headerRight);
  }

  function getXpData() {
    var current = 275, max = 400;
    try {
      var state = JSON.parse(localStorage.getItem('symbiose_state'));
      if (state && typeof state.xp === 'number') current = state.xp;
      if (state && typeof state.xpMax === 'number') max = state.xpMax;
    } catch(e) {}

    var xpTexts = document.querySelectorAll('.xp-bar-header span, .xp-bar span');
    xpTexts.forEach(function(el) {
      var txt = el.textContent.trim();
      var m = txt.match(/(\d+)\s*XP/);
      if (m) {
        var n = parseInt(m[1]);
        if (txt.indexOf('/') === -1 && n < 1000) current = n;
      }
      var m2 = txt.match(/(\d+)\s*XP\s*$/);
      if (m2 && parseInt(m2[1]) > current) max = parseInt(m2[1]);
    });

    return {
      current: current,
      max: max,
      percent: Math.min(100, Math.round((current / max) * 100))
    };
  }

  function updateHeaderXp() {
    var xpBar = document.getElementById('headerXpBar');
    if (!xpBar) return;
    var xpData = getXpData();
    var label = xpBar.querySelector('.hxp-label');
    var fill = xpBar.querySelector('.hxp-fill');
    var level = xpBar.querySelector('.hxp-level');
    if (label) label.textContent = xpData.current + ' XP';
    if (fill) fill.style.width = xpData.percent + '%';
    if (level) level.textContent = xpData.current + '/' + xpData.max;
  }

  // -------------------------------------------
  // 2. Ajouter des indicateurs de progression aux nav items
  // -------------------------------------------
  function addNavProgressDots() {
    var navItems = document.querySelectorAll('.sidebar nav .nav-item');
    var state = getProgressState();

    navItems.forEach(function(item) {
      var text = item.textContent.trim();
      if (text === 'Accueil' || text.indexOf('Tableau') !== -1 ||
          text.indexOf('Badges') !== -1 || text.indexOf('Leaderboard') !== -1) return;

      var moduleMatch = text.match(/^(\d+)\./);
      if (!moduleMatch && text !== 'Simulations' && text !== 'Examen Final' && text !== 'Certificat') return;

      var old = item.querySelector('.nav-progress');
      if (old) old.remove();

      var dot = document.createElement('span');
      dot.className = 'nav-progress';

      var moduleIdx = moduleMatch ? parseInt(moduleMatch[1]) : null;
      var status = 'not-started';

      if (moduleIdx && state.completedModules && state.completedModules.indexOf(moduleIdx) !== -1) {
        status = 'completed';
      } else if (moduleIdx && state.currentModule === moduleIdx) {
        status = 'in-progress';
      } else if (text === 'Simulations' && state.completedModules && state.completedModules.length >= 8) {
        status = 'in-progress';
      } else if (text === 'Examen Final' && state.examCompleted) {
        status = 'completed';
      } else if (text === 'Examen Final' && state.completedModules && state.completedModules.length >= 8) {
        status = 'in-progress';
      }

      dot.classList.add(status);
      item.appendChild(dot);
    });
  }

  function getProgressState() {
    var result = {
      completedModules: [],
      currentModule: 1,
      examCompleted: false,
      quizScores: {}
    };

    try {
      var state = JSON.parse(localStorage.getItem('symbiose_state'));
      if (!state) return result;

      if (state.quizScores) {
        result.quizScores = state.quizScores;
        for (var key in state.quizScores) {
          var match = key.match(/module(\d+)/i) || key.match(/^(\d+)$/);
          if (match) {
            var idx = parseInt(match[1]);
            if (state.quizScores[key] >= 60 && result.completedModules.indexOf(idx) === -1) {
              result.completedModules.push(idx);
            }
          }
        }
      }

      if (state.completedModules && Array.isArray(state.completedModules)) {
        result.completedModules = state.completedModules;
      }

      if (typeof state.currentModule === 'number') {
        result.currentModule = state.currentModule;
      } else {
        result.currentModule = result.completedModules.length > 0 ?
          Math.max.apply(null, result.completedModules) + 1 : 1;
        if (result.currentModule > 8) result.currentModule = 8;
      }

      if (state.examCompleted) result.examCompleted = true;
    } catch(e) {}

    return result;
  }

  // -------------------------------------------
  // 3. Toast XP — Notification de gain
  // -------------------------------------------
  var lastKnownXp = null;

  function setupXpToast() {
    try {
      var state = JSON.parse(localStorage.getItem('symbiose_state'));
      if (state && typeof state.xp === 'number') {
        lastKnownXp = state.xp;
      }
    } catch(e) {}
  }

  function showXpToast(amount) {
    var existing = document.querySelector('.xp-toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.className = 'xp-toast';
    toast.innerHTML = '<span class="xp-toast-icon">⚡</span> +' + amount + ' XP';
    document.body.appendChild(toast);

    setTimeout(function() {
      toast.classList.add('hiding');
      setTimeout(function() { toast.remove(); }, 300);
    }, 2500);
  }

  // -------------------------------------------
  // 4. Toast Badge — Notification déverrouillage
  // -------------------------------------------
  var lastKnownBadges = 0;

  function setupBadgeToast() {
    try {
      var state = JSON.parse(localStorage.getItem('symbiose_state'));
      if (state && state.badges) {
        if (typeof state.badges === 'number') lastKnownBadges = state.badges;
        else if (Array.isArray(state.badges)) lastKnownBadges = state.badges.filter(Boolean).length;
      }
    } catch(e) {}
  }

  var badgeNames = {
    1: { icon: '🚀', title: 'Premier Pas', desc: 'Vous avez commencé la formation !' },
    2: { icon: '🎯', title: 'Précision', desc: 'Quiz parfait sur un module' },
    3: { icon: '⚡', title: 'Rapide', desc: '3 modules en une journée' },
    4: { icon: '🔥', title: 'En Feu', desc: 'Série de 5 jours consécutifs' },
    5: { icon: '💎', title: 'Expert', desc: 'Tous les quiz réussis à 100%' },
    6: { icon: '🎓', title: 'Diplômé', desc: 'Formation terminée' },
    7: { icon: '🏆', title: 'Champion', desc: 'Meilleur score du leaderboard' },
    8: { icon: '⭐', title: 'Étoile', desc: 'Tous les badges débloqués' }
  };

  function showBadgeToast(badgeIdx) {
    var info = badgeNames[badgeIdx] || { icon: '🏅', title: 'Badge', desc: 'Nouveau badge débloqué !' };

    var overlay = document.createElement('div');
    overlay.className = 'badge-overlay';

    var toast = document.createElement('div');
    toast.className = 'badge-toast';
    toast.innerHTML =
      '<div class="badge-icon">' + info.icon + '</div>' +
      '<div class="badge-title">' + info.title + '</div>' +
      '<div class="badge-desc">' + info.desc + '</div>';

    document.body.appendChild(overlay);
    document.body.appendChild(toast);

    var dismiss = function() {
      overlay.remove();
      toast.remove();
    };

    overlay.addEventListener('click', dismiss);
    toast.addEventListener('click', dismiss);
    setTimeout(dismiss, 4000);
  }

  // -------------------------------------------
  // 5. Observer les changements de state
  // -------------------------------------------
  function observeStateChanges() {
    var _origSet = localStorage.setItem.bind(localStorage);
    var currentSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      currentSetItem.call(localStorage, key, value);

      if (key === 'symbiose_state') {
        try {
          var state = JSON.parse(value);

          if (state && typeof state.xp === 'number' && lastKnownXp !== null) {
            var diff = state.xp - lastKnownXp;
            if (diff > 0 && diff < 500) {
              showXpToast(diff);
            }
            lastKnownXp = state.xp;
          } else if (state && typeof state.xp === 'number') {
            lastKnownXp = state.xp;
          }

          var currentBadges = 0;
          if (state && state.badges) {
            currentBadges = typeof state.badges === 'number' ? state.badges :
              Array.isArray(state.badges) ? state.badges.filter(Boolean).length : 0;
          }
          if (currentBadges > lastKnownBadges && lastKnownBadges >= 0) {
            showBadgeToast(currentBadges);
            lastKnownBadges = currentBadges;
          }

          updateHeaderXp();
          addNavProgressDots();
        } catch(e) {}
      }
    };

    var observer = new MutationObserver(function() {
      updateHeaderXp();
    });

    var xpBarEl = document.querySelector('.xp-bar-header');
    if (xpBarEl) {
      observer.observe(xpBarEl, { childList: true, subtree: true, characterData: true });
    }
  }

})();
/* ===== UX IMPROVEMENTS v45 ===== */
/* [REMOVED] initVideoFallback - broken CORS check replaced videos with invalid Loom links */,3000)})}
/* [REMOVED] replaceWithFallback */
var mainEl=document.getElementById('mainContent');
/* [REMOVED] MutationObserver for initVideoFallback */
/* [REMOVED] DOMContentLoaded for initVideoFallback */
/* Sidebar Progress */
function updateSidebarProgress(){var state=JSON.parse(localStorage.getItem('symbiose_state')||'{}');var cq=state.completedQuizzes||[];document.querySelectorAll('.nav-item[data-view^="step-"]').forEach(function(item){var sn=item.dataset.view.replace('step-','');var done=cq.includes(parseInt(sn));var chk=item.querySelector('.nav-check');if(chk)chk.classList.toggle('hidden',!done);var pb=item.querySelector('.step-progress-bar');if(!pb){pb=document.createElement('span');pb.className='step-progress-bar';pb.innerHTML='<span class="step-progress-fill"></span>';item.appendChild(pb)}var fill=pb.querySelector('.step-progress-fill');if(done){pb.style.display='none';fill.style.width='100%'}else{pb.style.display='block';var vt=(state.viewedTabs||{})[sn]||[];fill.style.width=Math.min(vt.length*20,80)+'%'}})}
document.addEventListener('DOMContentLoaded',function(){setTimeout(updateSidebarProgress,1000)});
if(mainEl){new MutationObserver(function(){setTimeout(updateSidebarProgress,300)}).observe(mainEl,{childList:true})}
/* Logout */
document.addEventListener('click',function(e){var lb=e.target.closest('#logoutBtn');if(lb){e.preventDefault();e.stopPropagation();localStorage.removeItem('symbiose_token');localStorage.removeItem('symbiose_state');localStorage.removeItem('symbiose_user');sessionStorage.clear();window.location.reload()}});
/* Mobile Toggle */
document.addEventListener('DOMContentLoaded',function(){var tog=document.getElementById('sidebarToggle');var sb=document.getElementById('sidebar');if(!tog||!sb)return;var ov=document.createElement('div');ov.className='sidebar-overlay';document.body.appendChild(ov);tog.addEventListener('click',function(){sb.classList.toggle('open');ov.classList.toggle('active')});ov.addEventListener('click',function(){sb.classList.remove('open');ov.classList.remove('active')});sb.addEventListener('click',function(e){if(e.target.closest('.nav-item')&&window.innerWidth<=768){sb.classList.remove('open');ov.classList.remove('active')}})});
/* Home Enhancement - Reprendre CTA */
function enhanceHomeView(){var mc=document.getElementById('mainContent');if(!mc)return;var ha=document.querySelector('.nav-item[data-view="home"].active');if(!ha)return;if(mc.querySelector('.resume-cta'))return;var st=JSON.parse(localStorage.getItem('symbiose_state')||'{}');var cq=st.completedQuizzes||[];var ns=cq.length+1;if(ns<=8){var cta=document.createElement('div');cta.className='resume-cta fade-in';cta.style.cssText='background:linear-gradient(135deg,var(--accent),#6366f1);border-radius:12px;padding:20px 24px;margin:16px 0;display:flex;align-items:center;justify-content:space-between;cursor:pointer;transition:transform .2s,box-shadow .2s';cta.innerHTML='<div><div style="font-size:13px;opacity:.8;margin-bottom:4px">Reprendre la formation</div><div style="font-size:16px;font-weight:700">Module '+ns+' \u2192</div></div><i class="fas fa-arrow-right" style="font-size:20px;opacity:.7"></i>';cta.onmouseenter=function(){cta.style.transform='translateY(-2px)';cta.style.boxShadow='0 8px 24px rgba(99,102,241,.3)'};cta.onmouseleave=function(){cta.style.transform='';cta.style.boxShadow=''};cta.onclick=function(){var ni=document.querySelector('.nav-item[data-view="step-'+ns+'"]');if(ni)ni.click()};var fc=mc.querySelector('.card,.dash-grid,.welcome-section');if(fc)fc.parentNode.insertBefore(cta,fc.nextSibling);else mc.prepend(cta)}}
if(mainEl){new MutationObserver(function(){setTimeout(enhanceHomeView,400)}).observe(mainEl,{childList:true})}
document.addEventListener('DOMContentLoaded',function(){setTimeout(enhanceHomeView,1500)});


/* === NPC Avatar Patch Fix v1 === */
(function(){
  function getNpcInitials(){
    var tn=document.querySelector(".rp-topbar-name");
    if(!tn)return null;
    var fc=tn.childNodes[0];
    if(!fc)return null;
    var name=fc.textContent.trim();
    var parts=name.split(/\s+/);
    if(parts.length>=2)return(parts[0][0]+parts[parts.length-1][0]).toUpperCase();
    return parts[0]?parts[0].substring(0,2).toUpperCase():null;
  }
  function getUserInitials(){
    try{
      var s=JSON.parse(localStorage.getItem("symbiose_session")||"{}");
      if(s.email){
        var p=s.email.split("@")[0].split(".");
        if(p.length>=2)return(p[0][0]+p[1][0]).toUpperCase();
        return p[0].substring(0,2).toUpperCase();
      }
    }catch(e){}
    return null;
  }
  setInterval(function(){
    var npc=getNpcInitials();
    if(npc){
      document.querySelectorAll(".rp-msg-avatar.bot").forEach(function(el){
        if(el.textContent.trim()!==npc)el.textContent=npc;
      });
      var ta=document.querySelector(".rp-topbar-avatar");
      if(ta&&ta.textContent.trim()!==npc)ta.textContent=npc;
    }
    var ui=getUserInitials();
    if(ui){
      document.querySelectorAll(".rp-msg-avatar.user").forEach(function(el){
        if(el.textContent.trim()!==ui)el.textContent=ui;
      });
      var ha=document.querySelector(".header-avatar");
      if(ha&&ha.textContent.trim()!==ui)ha.textContent=ui;
    }
  },500);
})();
