import { getState, getLevel } from '../state.js?v=81';
import { navigateTo, $ } from '../router.js?v=81';
import { BADGES } from '../data.js?v=81';

/**
 * Returns mention level based on exam score.
 */
function getMention(score) {
  if (score >= 90) return { text: 'Excellent', cls: 'excellent', stars: 3 };
  if (score >= 80) return { text: 'Tr\u00e8s Bien', cls: 'tres-bien', stars: 2 };
  return { text: 'Bien', cls: 'bien', stars: 1 };
}

/**
 * Generates a unique certificate ID.
 */
function generateCertId() {
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `SYMB-2026-${rand}`;
}

/**
 * Returns earned badges with their metadata.
 */
function getEarnedBadges(state) {
  const earned = state.unlockedBadges || state.badges || [];
  return BADGES.filter(b => earned.includes(b.id));
}

/**
 * Creates star SVGs for the mention.
 */
function starsHTML(count) {
  let s = '';
  for (let i = 0; i < 3; i++) {
    const filled = i < count;
    s += `<svg class="cert-star ${filled ? 'filled' : ''}" viewBox="0 0 24 24" width="28" height="28">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
        fill="${filled ? '#c5a028' : 'none'}" stroke="#c5a028" stroke-width="1.5"/>
    </svg>`;
  }
  return s;
}

/**
 * Launches confetti animation.
 */
function launchConfetti() {
  const colors = ['#c5a028', '#e8d48b', '#fff', '#f0c040', '#d4a017'];
  const container = document.getElementById('confetti-container');
  if (!container) return;
  for (let i = 0; i < 60; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.left = Math.random() * 100 + '%';
    el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    el.style.animationDelay = (Math.random() * 2) + 's';
    el.style.animationDuration = (2 + Math.random() * 3) + 's';
    el.style.width = (4 + Math.random() * 6) + 'px';
    el.style.height = (4 + Math.random() * 6) + 'px';
    container.appendChild(el);
  }
  setTimeout(() => { if (container) container.innerHTML = ''; }, 5000);
}

/**
 * Downloads certificate as PDF via print.
 */
function downloadPDF() {
  window.print();
}

/**
 * Renders the printable certificate page.
 * @param {HTMLElement} main - The main content container.
 */
export function renderCertificate(main) {
  const state = getState();

  if (!state.examPassed) {
    main.innerHTML = `
      <div class="breadcrumb no-print"><i class="fas fa-certificate"></i> Certificat</div>
      <h1 class="view-title no-print">Certificat</h1>
      <div class="card">
        <div class="exam-hero">
          <div class="exam-hero-icon"><i class="fas fa-lock"></i></div>
          <h2>Certificat non disponible</h2>
          <p>Vous devez r\u00e9ussir l'examen final pour obtenir votre certificat.</p>
          <button class="btn btn-primary" id="goExam"><i class="fas fa-pen"></i> Passer l'examen</button>
        </div>
      </div>`;
    $('#goExam').addEventListener('click', () => navigateTo('exam'));
    return;
  }

  const session = JSON.parse(localStorage.getItem('symbiose_session') || '{}');
  const firstName = session.firstName || session.email?.split('@')[0]?.split('.')[0] || '';
  const lastName = session.lastName || session.email?.split('@')[0]?.split('.')[1] || '';
  const fullName = `${firstName.charAt(0).toUpperCase() + firstName.slice(1)} ${lastName.charAt(0).toUpperCase() + lastName.slice(1)}`;
  const score = state.examScore || 0;
  const mention = getMention(score);
  const certId = generateCertId();
  const earnedBadges = getEarnedBadges(state);
  const xp = state.xp || 0;

  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  const badgesHTML = earnedBadges.length > 0
    ? `<div class="cert2-badges">
         <div class="cert2-badges-title">Distinctions obtenues</div>
         <div class="cert2-badges-row">
           ${earnedBadges.map(b => `<div class="cert2-badge-item">
             <span class="cert2-badge-icon">${b.icon}</span>
             <span class="cert2-badge-name">${b.name}</span>
           </div>`).join('')}
         </div>
       </div>`
    : '';

  main.innerHTML = `
    <div id="confetti-container" class="no-print"></div>

    <style>
      /* === NEW CERTIFICATE V2 STYLES === */
      .cert2-page{display:flex;flex-direction:column;align-items:center;min-height:calc(100vh - 80px);padding:20px;background:radial-gradient(ellipse at center,#1a1a2e 0%,#0f0f1a 100%)}
      .cert2-card{position:relative;width:100%;max-width:720px;background:linear-gradient(145deg,#1c1c30 0%,#12121f 100%);border-radius:20px;padding:48px 40px;box-shadow:0 0 60px rgba(197,160,40,.12),0 20px 40px rgba(0,0,0,.4),inset 0 1px 0 rgba(197,160,40,.15);border:1px solid rgba(197,160,40,.2);overflow:hidden}
      .cert2-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,#c5a028,#e8d48b,#c5a028,transparent)}
      .cert2-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,#c5a028,#e8d48b,#c5a028,transparent)}
      .cert2-watermark{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:200px;color:rgba(197,160,40,.04);pointer-events:none;line-height:1;z-index:0}
      .cert2-content{position:relative;z-index:1}
      .cert2-header{text-align:center;margin-bottom:24px}
      .cert2-logo{width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,#c5a028,#e8d48b);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:26px;color:#fff;box-shadow:0 4px 20px rgba(197,160,40,.3)}
      .cert2-brand{font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;color:#e8e8e8;letter-spacing:1px}
      .cert2-brand-sub{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:2px;margin-top:2px}
      .cert2-divider{width:120px;height:2px;background:linear-gradient(90deg,transparent,#c5a028,transparent);margin:20px auto}
      .cert2-title-section{text-align:center;margin:20px 0}
      .cert2-certif-label{font-size:12px;text-transform:uppercase;letter-spacing:4px;color:#c5a028;font-weight:600;margin-bottom:8px}
      .cert2-title{font-family:'Space Grotesk',sans-serif;font-size:32px;font-weight:700;color:#c5a028;letter-spacing:3px;margin:0;line-height:1.2}
      .cert2-subtitle{font-size:14px;color:#999;margin-top:6px;font-style:italic}
      .cert2-name-section{text-align:center;margin:28px 0 20px}
      .cert2-awarded-to{font-size:12px;text-transform:uppercase;letter-spacing:3px;color:#888;margin-bottom:8px}
      .cert2-name{font-family:'Space Grotesk',sans-serif;font-size:36px;font-weight:700;color:#fff;letter-spacing:1px;text-shadow:0 2px 20px rgba(197,160,40,.2)}
      .cert2-mention-section{text-align:center;margin:20px 0}
      .cert2-stars{display:flex;justify-content:center;gap:8px;margin-bottom:8px}
      .cert2-star.filled{filter:drop-shadow(0 0 6px rgba(197,160,40,.5))}
      .cert2-mention-label{display:inline-block;padding:6px 24px;border:1px solid #c5a028;border-radius:30px;font-size:14px;color:#c5a028;font-weight:600;letter-spacing:2px;text-transform:uppercase;background:rgba(197,160,40,.06)}
      .cert2-score-row{display:flex;justify-content:center;gap:40px;margin:24px 0;flex-wrap:wrap}
      .cert2-score-item{text-align:center}
      .cert2-score-value{font-family:'Space Grotesk',sans-serif;font-size:28px;font-weight:700;color:#e8d48b}
      .cert2-score-label{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1.5px;margin-top:2px}
      .cert2-badges{margin:24px 0;text-align:center}
      .cert2-badges-title{font-size:11px;text-transform:uppercase;letter-spacing:3px;color:#888;margin-bottom:12px}
      .cert2-badges-row{display:flex;justify-content:center;gap:16px;flex-wrap:wrap}
      .cert2-badge-item{display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 14px;background:rgba(197,160,40,.06);border:1px solid rgba(197,160,40,.15);border-radius:12px;min-width:72px}
      .cert2-badge-icon{font-size:24px}
      .cert2-badge-name{font-size:10px;color:#ccc;text-transform:uppercase;letter-spacing:1px}
      .cert2-footer{display:flex;justify-content:space-between;align-items:flex-end;margin-top:28px;padding-top:20px;border-top:1px solid rgba(197,160,40,.1)}
      .cert2-footer-left{text-align:left}
      .cert2-footer-right{text-align:right}
      .cert2-footer-label{font-size:10px;color:#666;text-transform:uppercase;letter-spacing:1.5px}
      .cert2-footer-value{font-size:13px;color:#bbb;margin-top:2px}
      .cert2-sig{margin-top:8px}
      .cert2-sig-line{width:100px;height:1px;background:#c5a028;margin-bottom:4px;margin-left:auto}
      .cert2-sig-name{font-size:12px;color:#999;font-style:italic}
      .cert2-actions{display:flex;justify-content:center;gap:16px;margin-top:28px;flex-wrap:wrap}
      .cert2-btn{display:inline-flex;align-items:center;gap:8px;padding:12px 28px;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s;border:none}
      .cert2-btn-primary{background:linear-gradient(135deg,#c5a028,#e8d48b);color:#1a1a2e;box-shadow:0 4px 20px rgba(197,160,40,.3)}
      .cert2-btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(197,160,40,.4)}
      .cert2-btn-secondary{background:rgba(197,160,40,.1);color:#c5a028;border:1px solid rgba(197,160,40,.3)}
      .cert2-btn-secondary:hover{background:rgba(197,160,40,.15)}

      /* Confetti */
      #confetti-container{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden}
      .confetti-piece{position:absolute;top:-10px;border-radius:2px;animation:confetti-fall linear forwards}
      @keyframes confetti-fall{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}

      /* Print styles */
      @media print{
        .no-print{display:none!important}
        .cert2-page{background:#fff!important;padding:0!important;min-height:auto}
        .cert2-card{background:#fff!important;box-shadow:none!important;border:2px solid #c5a028!important;padding:40px!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
        .cert2-card::before,.cert2-card::after{background:#c5a028!important}
        .cert2-watermark{color:rgba(197,160,40,.08)!important}
        .cert2-name{color:#1a1a2e!important;text-shadow:none!important}
        .cert2-brand{color:#1a1a2e!important}
        .cert2-footer-value{color:#333!important}
        .cert2-badge-name{color:#333!important}
        .cert2-actions{display:none!important}
        body>*:not(#main){display:none!important}
        .sidebar,.header,.breadcrumb{display:none!important}
      }

      /* Responsive */
      @media(max-width:600px){
        .cert2-card{padding:28px 20px}
        .cert2-name{font-size:26px}
        .cert2-title{font-size:24px}
        .cert2-score-row{gap:24px}
        .cert2-footer{flex-direction:column;align-items:center;gap:16px;text-align:center}
        .cert2-footer-right{text-align:center}
        .cert2-sig-line{margin:0 auto}
      }

      /* Fade in animation */
      .cert2-fade{opacity:0;animation:cert2FadeIn .6s ease forwards}
      @keyframes cert2FadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    </style>

    <div class="breadcrumb no-print"><i class="fas fa-certificate"></i> Certificat</div>

    <div class="cert2-page">
      <div class="cert2-card cert2-fade">
        <div class="cert2-watermark">\u2727</div>
        <div class="cert2-content">

          <div class="cert2-header">
            <div class="cert2-logo">\u26A1</div>
            <div class="cert2-brand">Symbiose</div>
            <div class="cert2-brand-sub">Plateforme de formation</div>
          </div>

          <div class="cert2-divider"></div>

          <div class="cert2-title-section">
            <div class="cert2-certif-label">Certificat de r\u00e9ussite</div>
            <h1 class="cert2-title">FORMATION COMPL\u00c9T\u00c9E</h1>
            <div class="cert2-subtitle">D\u00e9livr\u00e9 avec succ\u00e8s pour l'ensemble du parcours</div>
          </div>

          <div class="cert2-divider"></div>

          <div class="cert2-name-section">
            <div class="cert2-awarded-to">D\u00e9cern\u00e9 \u00e0</div>
            <div class="cert2-name">${fullName}</div>
          </div>

          <div class="cert2-mention-section">
            <div class="cert2-stars">${starsHTML(mention.stars)}</div>
            <div class="cert2-mention-label">Mention ${mention.text}</div>
          </div>

          <div class="cert2-score-row">
            <div class="cert2-score-item">
              <div class="cert2-score-value">${score}%</div>
              <div class="cert2-score-label">Score examen</div>
            </div>
            <div class="cert2-score-item">
              <div class="cert2-score-value">${xp}</div>
              <div class="cert2-score-label">Points XP</div>
            </div>
            <div class="cert2-score-item">
              <div class="cert2-score-value">${earnedBadges.length}/${BADGES.length}</div>
              <div class="cert2-score-label">Badges</div>
            </div>
          </div>

          ${badgesHTML}

          <div class="cert2-footer">
            <div class="cert2-footer-left">
              <div class="cert2-footer-label">N\u00b0 Certificat</div>
              <div class="cert2-footer-value">${certId}</div>
            </div>
            <div class="cert2-footer-center" style="text-align:center">
              <div class="cert2-footer-label">Date</div>
              <div class="cert2-footer-value">${dateStr}</div>
            </div>
            <div class="cert2-footer-right">
              <div class="cert2-sig">
                <div class="cert2-sig-line"></div>
                <div class="cert2-sig-name">Direction Symbiose</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div class="cert2-actions no-print cert2-fade" style="animation-delay:.3s">
        <button class="cert2-btn cert2-btn-primary" id="btnDownloadPDF">
          <i class="fas fa-file-pdf"></i> T\u00e9l\u00e9charger en PDF
        </button>
        <button class="cert2-btn cert2-btn-secondary" id="btnPrint2">
          <i class="fas fa-print"></i> Imprimer
        </button>
      </div>
    </div>
  `;

  $('#btnDownloadPDF').addEventListener('click', downloadPDF);
  $('#btnPrint2').addEventListener('click', () => window.print());

  // Launch confetti after a short delay
  setTimeout(launchConfetti, 400);
}
