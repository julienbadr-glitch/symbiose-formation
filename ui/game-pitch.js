import { getState, saveState } from '../state.js?v=81';
import { addXP, triggerConfetti } from '../notifications.js?v=81';

const PROSPECTS = [
  {
    id: 'marc',
    name: 'Marc Dupont',
    role: 'Dirigeant BTP',
    company: 'BTP Dupont',
    employees: 22,
    sites: 3,
    color: '#ea580c',
    colorLight: '#fff7ed',
    icon: 'fa-hard-hat',
    avatar: 'MD',
    trait: 'Direct, veut une vision globale et pas de jargon.',
    emoji: { small: '\ud83c\udfd7\ufe0f', medium: '\ud83c\udfe2', big: '\ud83c\udfe0' },
    initKpi: { conviction: 20, confiance: 30, closing: 10 },
  },
  {
    id: 'claire',
    name: 'Claire Morel',
    role: 'DRH Services',
    company: 'Morel Services',
    employees: 85,
    sites: 1,
    color: '#2563eb',
    colorLight: '#eff6ff',
    icon: 'fa-users-gear',
    avatar: 'CM',
    trait: 'Analytique, attend des fonctionnalites detaillees et du ROI.',
    emoji: { small: '\ud83d\udcca', medium: '\ud83d\udcc8', big: '\ud83c\udfc6' },
    initKpi: { conviction: 15, confiance: 25, closing: 5 },
  },
  {
    id: 'philippe',
    name: 'Philippe Renaud',
    role: 'DAF Multi-sites',
    company: 'Renaud R\u00e9seau',
    employees: 150,
    sites: 5,
    color: '#059669',
    colorLight: '#f0fdf4',
    icon: 'fa-chart-pie',
    avatar: 'PR',
    trait: 'Prudent, focus conformite et maitrise des couts.',
    emoji: { small: '\ud83d\udee1\ufe0f', medium: '\ud83d\udd12', big: '\u2705' },
    initKpi: { conviction: 10, confiance: 20, closing: 5 },
  },
];

const PHASES = [
  { label: 'Pitch', icon: 'fa-bullhorn', desc: 'Adapter le discours au profil' },
  { label: 'Approfondissement', icon: 'fa-magnifying-glass', desc: 'Prix, modules, details' },
  { label: 'Closing', icon: 'fa-handshake', desc: 'Lever les objections' },
];

const ACTIONS = {
  marc: [
    {
      phase: 0,
      situation: 'Marc est dirigeant d\u2019une bo\u00eete de BTP de 22 salari\u00e9s sur 3 chantiers. Il g\u00e8re tout seul. Quel pitch choisir\u202f?',
      prospectSays: 'On est une bo\u00eete de BTP, 22 salari\u00e9s sur 3 chantiers. J\u2019ai pas de RH, c\u2019est moi qui g\u00e8re tout. Montrez-moi ce que vous avez.',
      options: [
        { text: 'Symbiose, c\u2019est votre copilote RH. En une seule plateforme, vous visualisez votre \u00e9quipe, validez les cong\u00e9s en un clic, suivez vos recrutements et restez conforme. D\u00e9ploy\u00e9 en quelques jours, sans engagement. Un de nos clients, Thomas M., g\u00e9rant de 22 salari\u00e9s, dit que Symbiose est devenu son copilote.', quality: 'good', points: 10, feedback: 'Parfait\u202f! Pitch Dirigeant adapt\u00e9\u202f: vision globale, simplicit\u00e9, t\u00e9moignage pertinent.', reply: 'OK, int\u00e9ressant. Un copilote RH, c\u2019est exactement ce qu\u2019il me faut.', kpi: { conviction: 30, confiance: 20, closing: 15 } },
        { text: 'Symbiose centralise toute votre gestion RH\u202f: entretiens assist\u00e9s par IA, barom\u00e8tre d\u2019engagement en temps r\u00e9el, ATS complet avec CVth\u00e8que. Vous gagnerez 40% de temps sur l\u2019administratif.', quality: 'medium', points: 5, feedback: 'Correct mais c\u2019est le pitch DRH. Un dirigeant veut une vision globale, pas le d\u00e9tail des fonctionnalit\u00e9s.', reply: 'Mouais, c\u2019est un peu technique pour moi tout \u00e7a\u2026', kpi: { conviction: 10, confiance: 5, closing: 5 } },
        { text: 'Symbiose g\u00e8re les risques professionnels et anticipe les contr\u00f4les. Le DUERP se met \u00e0 jour automatiquement, le registre du personnel est toujours pr\u00eat.', quality: 'bad', points: 0, feedback: 'C\u2019est le pitch DAF/Conformit\u00e9. Marc est dirigeant, il veut un copilote RH, pas un outil de conformit\u00e9 en premier.', reply: 'DUERP, registre\u2026 moi je veux juste g\u00e9rer mes gars.', kpi: { conviction: 0, confiance: -10, closing: -5 } },
      ],
    },
    {
      phase: 1,
      situation: 'Marc est convaincu par le concept. Il demande le prix pour ses 22 salari\u00e9s.',
      prospectSays: 'OK \u00e7a a l\u2019air pas mal. Combien \u00e7a co\u00fbte pour mes 22 salari\u00e9s\u202f?',
      options: [
        { text: 'Pack Int\u00e9gral \u00e0 11\u202f\u20ac HT par salari\u00e9 par mois, soit 242\u202f\u20ac/mois tout compris. Vous avez gestion d\u2019\u00e9quipe, recrutement, conformit\u00e9. Sans engagement, vous testez sans risque.', quality: 'good', points: 10, feedback: 'Excellent\u202f! 22 salari\u00e9s = +20 donc 11\u202f\u20ac/salari\u00e9/mois. Calcul exact et arguments cl\u00e9s.', reply: '242\u202f\u20ac par mois, c\u2019est raisonnable. Et sans engagement en plus\u202f?', kpi: { conviction: 20, confiance: 25, closing: 20 } },
        { text: 'Le Pack Int\u00e9gral est \u00e0 99\u202f\u20ac/mois pour les TPE de moins de 20 salari\u00e9s. Pour vous avec 22, c\u2019est 11\u202f\u20ac/salari\u00e9/mois.', quality: 'medium', points: 5, feedback: 'Le tarif est juste mais vous avez mentionn\u00e9 le tarif TPE qui ne s\u2019applique pas \u00e0 lui. Restez focus sur SON tarif.', reply: 'Hmm OK, et je perds quoi par rapport au forfait TPE\u202f?', kpi: { conviction: 10, confiance: 5, closing: 5 } },
        { text: 'C\u2019est 5\u202f\u20ac par salari\u00e9 par mois pour le Pack Essentiel, soit 110\u202f\u20ac/mois. On peut commencer par l\u00e0.', quality: 'bad', points: 0, feedback: 'Erreur de strat\u00e9gie\u202f! Ne proposez pas un pack partiel \u00e0 un dirigeant qui veut tout g\u00e9rer. Le Pack Int\u00e9gral est la meilleure option.', reply: 'Essentiel\u2026 donc il manque des trucs\u202f? Non merci.', kpi: { conviction: -5, confiance: -10, closing: -10 } },
      ],
    },
  ],
  claire: [
    {
      phase: 0,
      situation: 'Claire est DRH depuis 3 ans, g\u00e8re 85 salari\u00e9s avec Excel et emails. Quel pitch choisir\u202f?',
      prospectSays: 'Je suis DRH depuis 3 ans. On g\u00e8re tout sur Excel et par email. Je perds un temps fou. Qu\u2019est-ce que Symbiose peut faire pour moi\u202f?',
      options: [
        { text: 'Symbiose centralise toute votre gestion RH\u202f: entretiens assist\u00e9s par IA, barom\u00e8tre d\u2019engagement en temps r\u00e9el, ATS complet avec CVth\u00e8que, et conformit\u00e9 automatis\u00e9e. Vos 85 collaborateurs auront chacun leur espace. Sophie L., DRH de 85 salari\u00e9s, a r\u00e9duit de 40% le temps pass\u00e9 sur l\u2019administratif.', quality: 'good', points: 10, feedback: 'Parfait\u202f! Pitch DRH\u202f: fonctionnalit\u00e9s d\u00e9taill\u00e9es, gain de temps chiffr\u00e9, t\u00e9moignage DRH pertinent.', reply: 'Entretiens par IA et barom\u00e8tre d\u2019engagement\u2026 c\u2019est exactement ce qui me manque.', kpi: { conviction: 30, confiance: 20, closing: 15 } },
        { text: 'Symbiose, c\u2019est votre copilote RH. En une plateforme, vous visualisez votre \u00e9quipe, validez les cong\u00e9s, suivez les recrutements. Plus de 500 entreprises nous font confiance.', quality: 'medium', points: 5, feedback: 'Trop g\u00e9n\u00e9rique pour une DRH. Elle veut des fonctionnalit\u00e9s concr\u00e8tes et du gain de temps mesurable.', reply: 'C\u2019est un peu vague. Vous avez des chiffres concrets\u202f?', kpi: { conviction: 10, confiance: 5, closing: 5 } },
        { text: 'Pour 85 salari\u00e9s, le Pack Int\u00e9gral revient \u00e0 11\u202f\u20ac par salari\u00e9 par mois. C\u2019est sans engagement.', quality: 'bad', points: 0, feedback: 'Vous avez saut\u00e9 directement au prix sans pr\u00e9senter la valeur\u202f! Une DRH veut d\u2019abord comprendre ce que l\u2019outil fait.', reply: 'Attendez, vous me parlez prix alors que je ne sais m\u00eame pas ce que \u00e7a fait\u2026', kpi: { conviction: -5, confiance: -10, closing: -5 } },
      ],
    },
    {
      phase: 1,
      situation: 'Claire veut comprendre l\u2019organisation de l\u2019outil. Combien de modules, comment c\u2019est structur\u00e9\u202f?',
      prospectSays: 'Comment c\u2019est organis\u00e9 concr\u00e8tement\u202f? Il y a combien de modules\u202f?',
      options: [
        { text: '10 modules en 3 cat\u00e9gories. Collaborateurs\u202f: \u00c9quipe, Cong\u00e9s/Absences, Entretiens, Humeur. Acquisition\u202f: Recrutement, CVth\u00e8que, Int\u00e9grations. Administratif\u202f: Contrats, Obligations, Documents. Plus le Tableau de bord central qui donne une vue 360.', quality: 'good', points: 10, feedback: 'Parfait\u202f! Les 10 modules, les 3 cat\u00e9gories, et le tableau de bord. Connaissance produit impeccable.', reply: '10 modules, c\u2019est complet\u202f! Et le tableau de bord central, c\u2019est exactement ce qu\u2019il me faut.', kpi: { conviction: 20, confiance: 25, closing: 20 } },
        { text: 'Il y a des modules pour les collaborateurs, le recrutement et l\u2019administratif, organis\u00e9s autour d\u2019un tableau de bord central.', quality: 'medium', points: 5, feedback: 'C\u2019est vague. Une DRH veut le d\u00e9tail. Nommez les 10 modules et les 3 cat\u00e9gories pour montrer votre ma\u00eetrise.', reply: 'Oui mais concr\u00e8tement, il y a quoi dans chaque cat\u00e9gorie\u202f?', kpi: { conviction: 10, confiance: 5, closing: 5 } },
        { text: 'Il y a beaucoup de fonctionnalit\u00e9s. Le mieux c\u2019est que je vous montre en d\u00e9mo, vous verrez tout.', quality: 'bad', points: 0, feedback: 'R\u00e9ponse \u00e9vasive\u202f! Vous devez conna\u00eetre l\u2019\u00e9cosyst\u00e8me par c\u0153ur. 10 modules, 3 cat\u00e9gories.', reply: 'Vous ne connaissez m\u00eame pas votre propre produit\u202f? C\u2019est pas rassurant.', kpi: { conviction: -5, confiance: -15, closing: -10 } },
      ],
    },
  ],
  philippe: [
    {
      phase: 0,
      situation: 'Philippe est DAF, 150 salari\u00e9s, alerte inspection du travail r\u00e9cente. Quel pitch choisir\u202f?',
      prospectSays: 'Je suis DAF. Ce qui m\u2019int\u00e9resse c\u2019est la conformit\u00e9 et le contr\u00f4le des co\u00fbts. On a eu une alerte de l\u2019inspection du travail r\u00e9cemment.',
      options: [
        { text: 'Symbiose, c\u2019est de la visibilit\u00e9 et de la conformit\u00e9. Le Pack Int\u00e9gral \u00e0 11\u202f\u20ac/salari\u00e9/mois couvre les cong\u00e9s, entretiens, recrutement ET la conformit\u00e9. Le DUERP est suivi dans l\u2019outil, le registre est toujours pr\u00eat. Sans engagement, votre risque est z\u00e9ro. Nadia B., DAF de 150 salari\u00e9s, a \u00e9vit\u00e9 un probl\u00e8me majeur lors d\u2019un contr\u00f4le gr\u00e2ce au module Conformit\u00e9.', quality: 'good', points: 10, feedback: 'Parfait\u202f! Pitch DAF\u202f: conformit\u00e9, visibilit\u00e9, ROI, t\u00e9moignage DAF pertinent, et risque z\u00e9ro.', reply: 'Le suivi du DUERP et le risque z\u00e9ro, c\u2019est parlant.', kpi: { conviction: 30, confiance: 20, closing: 15 } },
        { text: 'Symbiose automatise votre conformit\u00e9. DUERP, registre du personnel, tout est g\u00e9r\u00e9. Et c\u2019est 11\u202f\u20ac par salari\u00e9 par mois.', quality: 'medium', points: 5, feedback: 'Bon angle mais trop court. Ajoutez le t\u00e9moignage de Nadia B. et l\u2019argument sans engagement/risque z\u00e9ro.', reply: '11\u202f\u20ac par salari\u00e9, OK. Mais qu\u2019est-ce qui me prouve que \u00e7a marche\u202f?', kpi: { conviction: 10, confiance: 5, closing: 5 } },
        { text: 'Symbiose, c\u2019est votre copilote RH. Vos salari\u00e9s auront chacun leur espace personnel pour poser leurs cong\u00e9s et suivre leurs entretiens.', quality: 'bad', points: 0, feedback: 'C\u2019est le pitch Dirigeant. Philippe est DAF, il veut conformit\u00e9 et ROI, pas l\u2019espace collaborateur en premier.', reply: 'Les cong\u00e9s\u202f? J\u2019ai parl\u00e9 de conformit\u00e9 et de contr\u00f4le des co\u00fbts\u2026', kpi: { conviction: -5, confiance: -10, closing: -5 } },
      ],
    },
    {
      phase: 2,
      situation: 'Philippe a d\u00e9j\u00e0 un outil en place et craint un changement long et complexe. Comment lever cette objection\u202f?',
      prospectSays: 'On a d\u00e9j\u00e0 un outil en place. Changer, \u00e7a me fait peur. \u00c7a va prendre des mois.',
      options: [
        { text: 'Je comprends tout \u00e0 fait. Justement, Symbiose se d\u00e9ploie en quelques jours, pas en quelques mois. L\u2019interface est intuitive, adopt\u00e9e naturellement sans formation. Et sans engagement, vous pouvez tester en parall\u00e8le de votre outil actuel. Nadia B., DAF de 150 salari\u00e9s, a fait la transition sans difficult\u00e9.', quality: 'good', points: 10, feedback: 'Excellent\u202f! D\u00e9ploiement rapide, sans formation, sans engagement, t\u00e9moignage. Toutes les objections lev\u00e9es.', reply: 'Tester en parall\u00e8le, sans engagement\u2026 OK, \u00e7a me rassure.', kpi: { conviction: 20, confiance: 25, closing: 25 } },
        { text: 'Le d\u00e9ploiement est rapide et l\u2019interface est simple. Vous pouvez tester gratuitement.', quality: 'medium', points: 5, feedback: 'Vrai mais trop court. D\u00e9taillez\u202f: quelques jours, sans formation, sans engagement, et citez un t\u00e9moignage.', reply: 'Rapide comment\u202f? Et c\u2019est gratuit ou pas\u202f?', kpi: { conviction: 10, confiance: 5, closing: 5 } },
        { text: 'Notre outil est bien meilleur que ce que vous avez actuellement. Vous verrez la diff\u00e9rence.', quality: 'bad', points: 0, feedback: 'Jamais critiquer l\u2019outil actuel du prospect\u202f! \u00c7a cr\u00e9e de la r\u00e9sistance. Focalisez sur la facilit\u00e9 de transition.', reply: '\u00c7a commence mal si vous critiquez notre choix actuel\u2026', kpi: { conviction: -10, confiance: -15, closing: -10 } },
      ],
    },
  ],
};

const TIPS = [
  'Adaptez toujours votre pitch au profil\u202f: Dirigeant = vision, DRH = fonctionnalit\u00e9s, DAF = ROI',
  'Un dirigeant veut un copilote, pas un outil technique',
  'Citez toujours un t\u00e9moignage adapt\u00e9 au profil du prospect',
  'Ne proposez jamais un pack r\u00e9duit \u00e0 un prospect qui veut tout g\u00e9rer',
  'Ne critiquez jamais l\u2019outil actuel du prospect',
  'Annoncez toujours le prix avec la valeur associ\u00e9e',
  'Connaissez les 10 modules et les 3 cat\u00e9gories par c\u0153ur',
];

const SCORE_TIERS = [
  { min: 55, label: 'Expert Pitch', icon: 'fa-crown', color: 'gold', emoji: '\ud83c\udfc6' },
  { min: 35, label: 'Bon d\u00e9but', icon: 'fa-thumbs-up', color: 'blue', emoji: '\ud83d\udcca' },
  { min: 0, label: '\u00c0 am\u00e9liorer', icon: 'fa-book-open', color: 'orange', emoji: '\ud83d\udcdd' },
];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }

export function renderPitchGame(container) {
  let gameState = null;

  function getEmoji(prospect, kpis) {
    const avg = (kpis.conviction + kpis.confiance + kpis.closing) / 3;
    if (avg < 20) return prospect.emoji.small;
    if (avg < 55) return prospect.emoji.medium;
    return prospect.emoji.big;
  }

  function getEmojiSize(kpis) {
    const avg = (kpis.conviction + kpis.confiance + kpis.closing) / 3;
    if (avg < 20) return 48;
    if (avg < 55) return 64;
    return 80;
  }

  function renderIntro() {
    container.innerHTML = `
      <div class="ep-garden-bg fade-in">
        <div class="ep-header">
          <div class="ep-header-icon"><i class="fas fa-bullhorn"></i></div>
          <div>
            <h2>Ecosysteme Symbiose</h2>
            <p>Adaptez votre pitch au profil du prospect et faites grandir sa conviction.</p>
          </div>
        </div>

        <div class="ep-intro-grid">
          ${PROSPECTS.map(p => `
            <div class="ep-intro-card" style="border-color:${p.color}">
              <div class="ep-intro-emoji">${p.emoji.small}</div>
              <div class="ep-intro-role-badge" style="background:${p.colorLight};color:${p.color}">
                <i class="fas ${p.icon}"></i> ${p.role.split(' ')[0]}
              </div>
              <div class="ep-intro-name">${p.name}</div>
              <div class="ep-intro-meta">${p.role} \u2014 ${p.employees} sal.</div>
              <div class="ep-intro-trait">${p.trait}</div>
            </div>
          `).join('')}
        </div>

        <div class="ep-intro-rules">
          <div class="ep-intro-rules-title"><i class="fas fa-info-circle"></i> Regles du jeu</div>
          <p>Rencontrez 3 prospects avec des profils differents. Choisissez le bon pitch, le bon prix, les bons arguments. Chaque bon choix fait grandir la conviction du prospect\u202f!</p>
        </div>

        <div style="text-align:center;padding:8px 0">
          <button class="btn btn-primary ep-start-btn" id="epStartBtn"><i class="fas fa-play"></i> Lancer les pitchs</button>
        </div>
      </div>
    `;

    container.querySelector('#epStartBtn').addEventListener('click', startGame);
  }

  function startGame() {
    gameState = {
      currentPhase: 0,
      score: 0,
      answers: {},
      prospectKpis: {},
    };
    PROSPECTS.forEach(p => {
      gameState.prospectKpis[p.id] = { ...p.initKpi };
      gameState.answers[p.id] = [];
    });
    renderGarden();
  }

  function getPhaseActions(prospectId, phase) {
    return (ACTIONS[prospectId] || []).filter(a => a.phase === phase);
  }

  function getAllActions() {
    const all = [];
    for (let p = 0; p <= 2; p++) {
      PROSPECTS.forEach(pr => {
        getPhaseActions(pr.id, p).forEach(a => all.push({ prospectId: pr.id, action: a, phase: p }));
      });
    }
    return all;
  }

  function getCompletedCount() {
    let count = 0;
    Object.values(gameState.answers).forEach(arr => { count += arr.length; });
    return count;
  }

  function getTotalActions() {
    return getAllActions().length;
  }

  function renderGarden() {
    const phase = PHASES[gameState.currentPhase];
    const completedActions = getCompletedCount();
    const totalActions = getTotalActions();
    const progressPct = (completedActions / totalActions) * 100;

    container.innerHTML = `
      <div class="ep-garden-bg fade-in">
        <div class="ep-season-bar">
          <div class="ep-season-track">
            ${PHASES.map((p, i) => `
              <div class="ep-season-step ${i < gameState.currentPhase ? 'done' : ''} ${i === gameState.currentPhase ? 'active' : ''}">
                <div class="ep-season-dot"><i class="fas ${p.icon}"></i></div>
                <span>${p.label}</span>
              </div>
              ${i < PHASES.length - 1 ? `<div class="ep-season-connector ${i < gameState.currentPhase ? 'done' : ''}"></div>` : ''}
            `).join('')}
          </div>
          <div class="ep-score-pill">
            <i class="fas fa-bolt"></i>
            <span id="epScore">${gameState.score}</span>
            <span class="ep-score-max">/ 60</span>
          </div>
        </div>

        <div class="ep-progress-bar">
          <div class="ep-progress-fill" style="width:${progressPct}%"></div>
        </div>

        <div class="ep-plots-grid" id="epPlots">
          ${PROSPECTS.map((p, pi) => {
            const kpis = gameState.prospectKpis[p.id];
            const phaseActions = getPhaseActions(p.id, gameState.currentPhase);
            const answeredInPhase = gameState.answers[p.id].filter(a => a.phase === gameState.currentPhase).length;
            const allDone = answeredInPhase >= phaseActions.length;
            const isClickable = !allDone && phaseActions.length > 0;
            const noActions = phaseActions.length === 0;

            return `
              <div class="ep-plot ${isClickable ? 'ep-plot-clickable' : ''} ${allDone && !noActions ? 'ep-plot-done' : ''} ${noActions ? 'ep-plot-waiting' : ''}" style="border-color:${p.color}" data-prospect="${pi}">
                <div class="ep-plot-emoji" style="font-size:${getEmojiSize(kpis)}px">${getEmoji(p, kpis)}</div>
                <div class="ep-plot-badge" style="background:${p.colorLight};color:${p.color}">
                  <i class="fas ${p.icon}"></i> ${p.role.split(' ')[0]}
                </div>
                <div class="ep-plot-name">${p.name}</div>
                <div class="ep-plot-meta">${p.company} \u2014 ${p.employees} sal.</div>

                <div class="ep-gauges">
                  <div class="ep-gauge">
                    <div class="ep-gauge-label"><span>Conviction</span><span>${Math.round(kpis.conviction)}%</span></div>
                    <div class="ep-gauge-track"><div class="ep-gauge-fill" style="width:${kpis.conviction}%;background:${p.color}"></div></div>
                  </div>
                  <div class="ep-gauge">
                    <div class="ep-gauge-label"><span>Confiance</span><span>${Math.round(kpis.confiance)}%</span></div>
                    <div class="ep-gauge-track"><div class="ep-gauge-fill" style="width:${kpis.confiance}%;background:#3B82F6"></div></div>
                  </div>
                  <div class="ep-gauge">
                    <div class="ep-gauge-label"><span>Closing</span><span>${Math.round(kpis.closing)}%</span></div>
                    <div class="ep-gauge-track"><div class="ep-gauge-fill" style="width:${kpis.closing}%;background:#F59E0B"></div></div>
                  </div>
                </div>

                <div class="ep-plot-badges">
                  ${allDone && !noActions ? '<span class="ep-badge-check"><i class="fas fa-check"></i></span>' : ''}
                </div>

                ${isClickable ? `<button class="ep-plot-action-btn" style="background:${p.color}" data-prospect-idx="${pi}"><i class="fas fa-comments"></i> Pitcher</button>` : ''}
                ${noActions ? '<span class="ep-plot-waiting-label">Pas d\u2019action cette phase</span>' : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    const allDoneThisPhase = PROSPECTS.every(p => {
      const phaseActions = getPhaseActions(p.id, gameState.currentPhase);
      const answeredInPhase = gameState.answers[p.id].filter(a => a.phase === gameState.currentPhase).length;
      return answeredInPhase >= phaseActions.length;
    });

    if (allDoneThisPhase) {
      if (gameState.currentPhase < 2) {
        const nextArea = document.createElement('div');
        nextArea.className = 'ep-phase-complete fade-in';
        nextArea.innerHTML = `
          <div class="ep-phase-complete-inner">
            <i class="fas fa-check-circle"></i>
            <span>${PHASES[gameState.currentPhase].label} termin\u00e9\u202f!</span>
            <button class="btn btn-primary" id="epNextPhase">Phase suivante <i class="fas fa-arrow-right"></i></button>
          </div>
        `;
        container.querySelector('.ep-garden-bg').appendChild(nextArea);
        nextArea.querySelector('#epNextPhase').addEventListener('click', () => {
          gameState.currentPhase++;
          renderGarden();
        });
      } else {
        renderResults();
      }
      return;
    }

    container.querySelectorAll('.ep-plot-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openActionModal(parseInt(btn.dataset.prospectIdx));
      });
    });

    container.querySelectorAll('.ep-plot-clickable').forEach(plot => {
      plot.addEventListener('click', () => {
        openActionModal(parseInt(plot.dataset.prospect));
      });
    });
  }

  function openActionModal(prospectIdx) {
    const prospect = PROSPECTS[prospectIdx];
    const kpis = gameState.prospectKpis[prospect.id];
    const phaseActions = getPhaseActions(prospect.id, gameState.currentPhase);
    const answeredInPhase = gameState.answers[prospect.id].filter(a => a.phase === gameState.currentPhase).length;
    if (answeredInPhase >= phaseActions.length) return;

    const action = phaseActions[answeredInPhase];
    const shuffledOpts = shuffleArray(action.options.map((o, i) => ({ ...o, origIdx: i })));

    const overlay = document.createElement('div');
    overlay.className = 'ep-modal-overlay fade-in';
    overlay.innerHTML = `
      <div class="ep-modal">
        <button class="game-modal-close" id="epModalClose"><i class="fas fa-times"></i></button>
        <div class="ep-modal-header" style="border-color:${prospect.color}">
          <div class="ep-modal-emoji" style="font-size:48px">${getEmoji(prospect, kpis)}</div>
          <div>
            <div class="ep-modal-name">${prospect.name}</div>
            <div class="ep-modal-meta">${prospect.role} \u2014 ${prospect.company} \u2014 ${prospect.employees} sal.</div>
            <div class="ep-modal-phase-badge" style="background:${prospect.colorLight};color:${prospect.color}">
              <i class="fas ${PHASES[gameState.currentPhase].icon}"></i> ${PHASES[gameState.currentPhase].label}
            </div>
          </div>
        </div>

        <div class="ep-modal-prospect-says">
          <div class="ep-modal-prospect-avatar" style="background:linear-gradient(135deg, ${prospect.color}, ${prospect.color}cc)">${prospect.avatar}</div>
          <div class="ep-modal-prospect-bubble">
            <div class="ep-modal-prospect-bubble-name">${prospect.name}</div>
            <p>${action.prospectSays}</p>
          </div>
        </div>

        <div class="ep-modal-situation">
          <i class="fas fa-lightbulb"></i>
          <p>${action.situation}</p>
        </div>

        <div class="ep-modal-choices" id="epModalChoices">
          ${shuffledOpts.map((opt, i) => `
            <button class="ep-choice-card" data-idx="${i}">
              <span class="ep-choice-letter">${['A', 'B', 'C'][i]}</span>
              <span class="ep-choice-text">${opt.text}</span>
            </button>
          `).join('')}
        </div>

        <div class="ep-modal-feedback" id="epModalFeedback"></div>
      </div>
    `;

    document.body.appendChild(overlay);

    function closeModal() {
      overlay.remove();
      renderGarden();
    }

    overlay.querySelector('#epModalClose').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    overlay.querySelectorAll('.ep-choice-card').forEach(btn => {
      btn.addEventListener('click', () => {
        handleActionChoice(prospectIdx, action, shuffledOpts, parseInt(btn.dataset.idx), overlay);
      });
    });
  }

  function handleActionChoice(prospectIdx, action, shuffledOpts, choiceIdx, overlay) {
    const prospect = PROSPECTS[prospectIdx];
    const chosen = shuffledOpts[choiceIdx];

    gameState.score += chosen.points;
    const kpis = gameState.prospectKpis[prospect.id];
    kpis.conviction = clamp(kpis.conviction + chosen.kpi.conviction, 0, 100);
    kpis.confiance = clamp(kpis.confiance + chosen.kpi.confiance, 0, 100);
    kpis.closing = clamp(kpis.closing + chosen.kpi.closing, 0, 100);

    gameState.answers[prospect.id].push({
      phase: gameState.currentPhase,
      quality: chosen.quality,
      points: chosen.points,
    });

    const buttons = overlay.querySelectorAll('.ep-choice-card');
    buttons.forEach((btn, i) => {
      btn.disabled = true;
      btn.classList.add('ep-choice-disabled');
      const opt = shuffledOpts[i];
      if (i === choiceIdx) {
        btn.classList.add(`ep-chosen-${opt.quality}`);
      }
      if (opt.quality === 'good' && i !== choiceIdx) {
        btn.classList.add('ep-reveal-good');
      }
    });

    const qualityLabels = { good: 'Excellent choix', medium: 'Choix moyen', bad: 'Mauvais choix' };
    const qualityIcons = { good: 'fa-check-circle', medium: 'fa-exclamation-circle', bad: 'fa-times-circle' };

    const feedbackEl = overlay.querySelector('#epModalFeedback');
    let fbHtml = `
      <div class="ep-fb ep-fb-${chosen.quality} fade-in">
        <div class="ep-fb-header">
          <i class="fas ${qualityIcons[chosen.quality]}"></i>
          <span>${qualityLabels[chosen.quality]} (+${chosen.points} pts)</span>
        </div>
        <p>${chosen.feedback}</p>
      </div>
    `;

    if (chosen.reply) {
      fbHtml += `
        <div class="ep-fb-reply fade-in" style="animation-delay:0.2s;border-color:${prospect.color}">
          <div class="ep-fb-reply-avatar" style="background:${prospect.color}">${prospect.avatar}</div>
          <div>
            <div class="ep-fb-reply-name">${prospect.name}</div>
            <p>${chosen.reply}</p>
          </div>
        </div>
      `;
    }

    if (chosen.quality === 'good') {
      fbHtml += `
        <div class="ep-fb-growth fade-in" style="animation-delay:0.3s">
          <span style="font-size:32px">${getEmoji(prospect, kpis)}</span>
          <span>Conviction en hausse\u202f!</span>
        </div>
      `;
    }

    fbHtml += `
      <button class="btn btn-primary ep-fb-continue fade-in" style="animation-delay:0.4s" id="epContinue">
        Continuer <i class="fas fa-arrow-right"></i>
      </button>
    `;

    feedbackEl.innerHTML = fbHtml;

    feedbackEl.querySelector('#epContinue').addEventListener('click', () => {
      overlay.remove();
      renderGarden();
    });

    const scoreEl = document.getElementById('epScore');
    if (scoreEl) scoreEl.textContent = gameState.score;
  }

  function renderResults() {
    const tier = SCORE_TIERS.find(t => gameState.score >= t.min) || SCORE_TIERS[SCORE_TIERS.length - 1];
    const maxScore = 60;

    const state = getState();
    const gameKey = 'game_pitch_2';
    const prevBest = state[gameKey] || 0;
    const isNewBest = gameState.score > prevBest;
    if (isNewBest) {
      state[gameKey] = gameState.score;
      saveState();
    }

    if (gameState.score >= 40) addXP(gameState.score);
    if (gameState.score >= 55) triggerConfetti();

    const wrongTips = [];
    Object.entries(gameState.answers).forEach(([pId, answers]) => {
      answers.forEach(a => {
        if (a.quality !== 'good') {
          const tip = TIPS[Math.floor(Math.random() * TIPS.length)];
          if (!wrongTips.includes(tip)) wrongTips.push(tip);
        }
      });
    });

    container.innerHTML = `
      <div class="ep-garden-bg fade-in">
        <div class="ep-results">
          <div class="ep-result-header ep-result-${tier.color}">
            <div class="ep-result-emoji">${tier.emoji}</div>
            <div class="ep-result-score-big">${gameState.score}<span>/${maxScore}</span></div>
            <h2>${tier.label}</h2>
            ${isNewBest ? '<div class="ep-new-best"><i class="fas fa-arrow-up"></i> Nouveau record</div>' : ''}
          </div>

          <div class="ep-results-garden">
            <h3><i class="fas fa-bullhorn"></i> Vos prospects</h3>
            <div class="ep-results-plots">
              ${PROSPECTS.map(p => {
                const kpis = gameState.prospectKpis[p.id];
                const answers = gameState.answers[p.id];
                const prospectScore = answers.reduce((s, a) => s + a.points, 0);
                return `
                  <div class="ep-result-plot" style="border-color:${p.color}">
                    <div class="ep-result-plot-emoji" style="font-size:56px">${getEmoji(p, kpis)}</div>
                    <div class="ep-result-plot-badge" style="background:${p.colorLight};color:${p.color}">
                      <i class="fas ${p.icon}"></i> ${p.role.split(' ')[0]}
                    </div>
                    <div class="ep-result-plot-name">${p.name}</div>
                    <div class="ep-result-plot-score" style="color:${p.color}">${prospectScore}/20</div>
                    <div class="ep-result-plot-stats">
                      <div class="ep-result-stat"><span>Conviction</span><strong style="color:${p.color}">${Math.round(kpis.conviction)}%</strong></div>
                      <div class="ep-result-stat"><span>Confiance</span><strong style="color:#3B82F6">${Math.round(kpis.confiance)}%</strong></div>
                      <div class="ep-result-stat"><span>Closing</span><strong style="color:#F59E0B">${Math.round(kpis.closing)}%</strong></div>
                    </div>
                    <div class="ep-result-plot-steps">
                      ${answers.map(a => `
                        <div class="ep-result-step-row">
                          <span class="ep-result-dot ep-dot-${a.quality}"></span>
                          <span class="ep-result-step-label">${PHASES[a.phase].label}</span>
                          <span class="ep-result-step-pts">+${a.points}</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          ${wrongTips.length > 0 ? `
          <div class="ep-results-tips">
            <h3><i class="fas fa-lightbulb"></i> Conseils de coaching</h3>
            <ul>
              ${wrongTips.slice(0, 4).map(t => `<li>${t}</li>`).join('')}
            </ul>
          </div>
          ` : ''}

          <div class="ep-result-actions">
            <button class="btn btn-primary" id="epRetry"><i class="fas fa-rotate-right"></i> Recommencer</button>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#epRetry').addEventListener('click', () => {
      gameState = null;
      renderIntro();
    });
  }

  renderIntro();
}
