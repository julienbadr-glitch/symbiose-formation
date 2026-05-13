import { getState, saveState } from '../state.js?v=81';
import { addXP, triggerConfetti } from '../notifications.js?v=81';

const MODELS = {
  autonome: { label: 'Mode Autonome', color: '#059669', bg: '#f0fdf4', icon: 'fa-user-check' },
  corecrutement: { label: 'Mode Co-recrutement', color: '#2563eb', bg: '#eff6ff', icon: 'fa-handshake' },
  delegation: { label: 'Mode D\u00e9l\u00e9gation', color: '#ea580c', bg: '#fff7ed', icon: 'fa-hand-holding-hand' },
};

const PROSPECTS = [
  {
    id: 'techvibe',
    name: 'TechVibe',
    role: 'Startup SaaS',
    company: '40 salari\u00e9s',
    icon: 'fa-microchip',
    color: '#2563eb',
    colorLight: '#eff6ff',
    avatar: 'TV',
    emoji: { small: '\ud83d\udcbb', medium: '\ud83d\ude80', big: '\ud83c\udfaf' },
    initKpi: { diagnostic: 20, confiance: 30, closing: 10 },
    steps: [
      {
        title: 'Diagnostic : Le bon mod\u00e8le',
        speakerRole: 'RH',
        speakerIcon: 'fa-user-tie',
        situation: 'Le RH junior de TechVibe veut recruter seul ses 3 devs par an. Quel mod\u00e8le recommander\u202f?',
        prospectSays: 'On recrute 3 devs par an. Je veux \u00eatre autonome, j\u2019ai le temps de g\u00e9rer \u00e7a. Montrez-moi comment faire.',
        recommendedModel: 'corecrutement',
        options: [
          { text: 'Mode Co-recrutement \u2014 On travaille ensemble\u202f: Mercato source les profils tech, vous validez dans le pipeline ATS. L\u2019IA r\u00e9dige vos offres en 30 secondes, et votre CVth\u00e8que se remplit automatiquement. Pour des profils dev, la double approche est id\u00e9ale.', points: 10, quality: 'good', feedback: 'Excellent diagnostic\u202f! Les profils dev sont souvent p\u00e9nuriques. Le co-recrutement combine l\u2019expertise sourcing de Mercato avec l\u2019implication du RH. La CVth\u00e8que s\u2019enrichit des deux c\u00f4t\u00e9s pour les futurs recrutements.', model: 'corecrutement', kpi: { diagnostic: 25, confiance: 15, closing: 10 } },
          { text: 'Mode Autonome \u2014 On vous installe l\u2019ATS, vous publiez vos offres \u00e0 1\u202f490\u202f\u20ac/offre en ponctuel.', points: 5, quality: 'medium', feedback: 'Le RH veut \u00eatre autonome, mais les profils dev sont comp\u00e9titifs. En mode autonome, il risque de passer \u00e0 c\u00f4t\u00e9 des meilleurs candidats. Le co-recrutement lui donne un acc\u00e9l\u00e9rateur sans lui retirer le pilotage.', model: 'autonome', kpi: { diagnostic: 10, confiance: 5, closing: 5 } },
          { text: 'Mode D\u00e9l\u00e9gation \u2014 Confiez-nous tout, on s\u2019occupe de vos 3 recrutements.', points: 0, quality: 'bad', feedback: 'Erreur\u202f! Le RH veut explicitement \u00eatre impliqu\u00e9 dans le processus. Lui proposer la d\u00e9l\u00e9gation compl\u00e8te, c\u2019est ignorer son besoin d\u2019autonomie et risquer de le braquer.', model: 'delegation', kpi: { diagnostic: 0, confiance: -10, closing: -5 } },
        ],
      },
      {
        title: 'Fonctionnalit\u00e9 ATS cl\u00e9',
        speakerRole: 'RH',
        speakerIcon: 'fa-user-tie',
        situation: 'TechVibe veut aussi automatiser le tri des candidatures tech. Quelle fonctionnalit\u00e9 ATS mettre en avant\u202f?',
        prospectSays: 'On re\u00e7oit 200 CV par offre dev. Je passe des heures \u00e0 trier. Comment votre ATS peut m\u2019aider\u202f?',
        recommendedModel: null,
        options: [
          { text: 'Le parsing CV intelligent analyse chaque candidature et fait un matching automatique avec les comp\u00e9tences recherch\u00e9es. Pour vos postes dev, l\u2019IA d\u00e9tecte les langages ma\u00eetris\u00e9s, les ann\u00e9es d\u2019exp\u00e9rience, et classe les profils par pertinence. Vous passez de 200 CV \u00e0 lire \u00e0 un top 20 qualifi\u00e9 en quelques minutes.', points: 10, quality: 'good', feedback: 'Parfait\u202f! Le parsing CV intelligent avec matching de comp\u00e9tences est LA fonctionnalit\u00e9 cl\u00e9 pour une startup tech qui re\u00e7oit beaucoup de candidatures. Le gain de temps est imm\u00e9diat et mesurable\u202f: de 200 CV \u00e0 un top 20, c\u2019est l\u2019argument qui fait mouche.', model: null, kpi: { diagnostic: 20, confiance: 15, closing: 10 } },
          { text: 'L\u2019ATS stocke tous les CV dans une base organis\u00e9e, vous pouvez les retrouver facilement avec des filtres.', points: 5, quality: 'medium', feedback: 'Le stockage organis\u00e9 est utile, mais c\u2019est le minimum attendu d\u2019un ATS. TechVibe a un probl\u00e8me de volume\u202f: 200 CV par offre. La fonctionnalit\u00e9 qui r\u00e9pond vraiment \u00e0 ce besoin, c\u2019est le parsing intelligent qui trie et classe automatiquement.', model: null, kpi: { diagnostic: 8, confiance: 5, closing: 3 } },
          { text: 'L\u2019ATS diffuse vos offres sur plusieurs jobboards en un clic pour maximiser la visibilit\u00e9.', points: 0, quality: 'bad', feedback: 'TechVibe re\u00e7oit d\u00e9j\u00e0 200 CV par offre\u202f! Le probl\u00e8me n\u2019est pas la visibilit\u00e9 mais le tri. Proposer plus de diffusion va aggraver le probl\u00e8me. \u00c9coutez le besoin\u202f: automatiser le tri, pas multiplier les sources.', model: null, kpi: { diagnostic: -5, confiance: -8, closing: -5 } },
        ],
      },
      {
        title: 'Convaincre le DG',
        speakerRole: 'DG',
        speakerIcon: 'fa-user-shield',
        situation: 'Le DG de TechVibe h\u00e9site car il a d\u00e9j\u00e0 un tableur Excel pour suivre les candidats. Comment convaincre\u202f?',
        prospectSays: 'On a un tableur Excel qui fait le job pour suivre nos candidats. Pourquoi je paierais un ATS en plus\u202f?',
        recommendedModel: null,
        options: [
          { text: 'Calculons ensemble\u202f: votre RH passe environ 2h par semaine \u00e0 maintenir ce tableur, relancer les candidats, chercher les infos. 2h \u00d7 52 semaines = 104h par an, soit 2,5 semaines de travail perdues. Avec l\u2019ATS, tout est automatis\u00e9\u202f: relances, suivi pipeline, reporting. Votre RH r\u00e9cup\u00e8re ces 104h pour faire du vrai recrutement.', points: 10, quality: 'good', feedback: 'Brillant\u202f! Le ROI chiffr\u00e9 est l\u2019argument massue face \u00e0 un DG. 104h/an perdues en gestion manuelle, c\u2019est concret et parlant. Vous ne critiquez pas son Excel, vous montrez ce qu\u2019il perd en productivit\u00e9. C\u2019est du closing intelligent.', model: null, kpi: { diagnostic: 20, confiance: 20, closing: 20 } },
          { text: 'Votre tableur Excel ne peut pas faire ce que fait un ATS\u202f: il est limit\u00e9, pas collaboratif, et source d\u2019erreurs.', points: 0, quality: 'bad', feedback: 'Ne critiquez jamais l\u2019outil actuel du prospect\u202f! Dire que son Excel est \u00ab\u2009limit\u00e9\u2009\u00bb et \u00ab\u2009source d\u2019erreurs\u2009\u00bb, c\u2019est attaquer son choix et cr\u00e9er de la r\u00e9sistance. Montrez plut\u00f4t le gain concret avec un ROI chiffr\u00e9.', model: null, kpi: { diagnostic: -5, confiance: -15, closing: -10 } },
          { text: 'Je vous propose un essai gratuit de l\u2019ATS, vous verrez par vous-m\u00eame la diff\u00e9rence.', points: 5, quality: 'medium', feedback: 'L\u2019essai gratuit est une bonne id\u00e9e en fin de conversation, mais vous n\u2019avez pas r\u00e9pondu \u00e0 l\u2019objection. Le DG veut une justification rationnelle\u202f: un ROI chiffr\u00e9 (104h/an gagn\u00e9es) est bien plus convaincant qu\u2019un \u00ab\u2009essayez et vous verrez\u2009\u00bb.', model: null, kpi: { diagnostic: 5, confiance: 5, closing: 5 } },
        ],
      },
    ],
  },
  {
    id: 'metalpro',
    name: 'MetalPro Industries',
    role: 'Usine / Industrie',
    company: '80 salari\u00e9s',
    icon: 'fa-industry',
    color: '#ea580c',
    colorLight: '#fff7ed',
    avatar: 'MP',
    emoji: { small: '\ud83c\udfed', medium: '\ud83d\udd27', big: '\u2699\ufe0f' },
    initKpi: { diagnostic: 15, confiance: 20, closing: 5 },
    steps: [
      {
        title: 'Diagnostic : Le bon mod\u00e8le',
        speakerRole: 'Dirigeant',
        speakerIcon: 'fa-hard-hat',
        situation: 'Urgence chez MetalPro : 5 d\u00e9parts, pas de RH, profils p\u00e9nuriques. Quel mod\u00e8le\u202f?',
        prospectSays: 'J\u2019ai perdu 5 op\u00e9rateurs qualifi\u00e9s en 2 mois. Le turnover me tue. J\u2019ai besoin de quelqu\u2019un qui g\u00e8re \u00e7a pour moi, je n\u2019ai pas de RH.',
        recommendedModel: 'delegation',
        options: [
          { text: 'Mode Autonome \u2014 On installe l\u2019ATS, vous publiez vos offres et vous g\u00e9rez le pipeline.', points: 0, quality: 'bad', feedback: 'Impossible\u202f! Il n\u2019a pas de RH et il est en urgence. Lui donner un outil sans personne pour l\u2019utiliser, c\u2019est le laisser couler. Pas de RH + urgence = D\u00e9l\u00e9gation, sans h\u00e9sitation.', model: 'autonome', kpi: { diagnostic: 0, confiance: -10, closing: -5 } },
          { text: 'Mode Co-recrutement \u2014 On source les candidats ensemble, vous validez les profils.', points: 5, quality: 'medium', feedback: 'Pas mal, mais il n\u2019a pas de RH pour co-piloter au quotidien\u202f! Il a besoin que Mercato prenne les r\u00eanes compl\u00e8tement. Le co-recrutement pourra venir plus tard, quand l\u2019\u00e9quipe sera stabilis\u00e9e.', model: 'corecrutement', kpi: { diagnostic: 10, confiance: 5, closing: 5 } },
          { text: 'Mode D\u00e9l\u00e9gation \u2014 Mercato prend en charge vos 5 recrutements. Vous suivez l\u2019avancement dans le tableau de bord ATS en temps r\u00e9el. On cible les op\u00e9rateurs qualifi\u00e9s dans notre vivier. Et une fois stabilis\u00e9, on pourra passer en co-recrutement.', points: 10, quality: 'good', feedback: 'Parfait\u202f! Urgence + pas de RH + profils p\u00e9nuriques = D\u00e9l\u00e9gation compl\u00e8te. Le tableau de bord lui donne la visibilit\u00e9 sans lui imposer la charge. Et vous posez d\u00e9j\u00e0 la suite\u202f: le co-recrutement une fois stabilis\u00e9.', model: 'delegation', kpi: { diagnostic: 25, confiance: 20, closing: 15 } },
        ],
      },
      {
        title: 'KPI de performance',
        speakerRole: 'Dirigeant',
        speakerIcon: 'fa-hard-hat',
        situation: 'Le directeur veut mesurer l\u2019efficacit\u00e9 du recrutement. Quel KPI ATS proposer en priorit\u00e9\u202f?',
        prospectSays: 'Si je vous confie mes recrutements, comment je sais si \u00e7a avance\u202f? Je veux des chiffres, pas des promesses.',
        recommendedModel: null,
        options: [
          { text: 'Le KPI prioritaire pour vous, c\u2019est le d\u00e9lai moyen de recrutement par poste. Aujourd\u2019hui sans ATS, vous ne le mesurez probablement pas. Avec le tableau de bord, vous verrez en temps r\u00e9el\u202f: poste ouvert le X, shortlist le Y, embauche le Z. Objectif\u202f: passer de 45 jours \u00e0 25 jours par recrutement. C\u2019est la preuve que \u00e7a fonctionne.', points: 10, quality: 'good', feedback: 'Excellent\u202f! Le d\u00e9lai moyen de recrutement est LE KPI roi pour un dirigeant en urgence. C\u2019est concret, mesurable, et directement li\u00e9 \u00e0 son probl\u00e8me de turnover. L\u2019objectif 45j \u2192 25j donne une promesse de r\u00e9sultat.', model: null, kpi: { diagnostic: 15, confiance: 20, closing: 15 } },
          { text: 'On va suivre le nombre de CV re\u00e7us par offre pour mesurer l\u2019attractivit\u00e9 de vos annonces.', points: 5, quality: 'medium', feedback: 'Le nombre de CV re\u00e7us mesure l\u2019attractivit\u00e9, pas l\u2019efficacit\u00e9. Un dirigeant en urgence veut savoir QUAND ses postes seront pourvus, pas combien de CV arrivent. Le d\u00e9lai de recrutement par poste est bien plus pertinent pour son contexte.', model: null, kpi: { diagnostic: 8, confiance: 5, closing: 5 } },
          { text: 'On va optimiser le co\u00fbt des annonces pour maximiser votre budget recrutement.', points: 0, quality: 'bad', feedback: 'MetalPro est en urgence avec 5 postes vacants\u202f! Le co\u00fbt des annonces est secondaire quand le turnover co\u00fbte bien plus cher. Il perd de la production chaque jour. Le KPI urgent, c\u2019est la vitesse de recrutement, pas le budget pub.', model: null, kpi: { diagnostic: -5, confiance: -8, closing: -5 } },
        ],
      },
      {
        title: 'Strat\u00e9gie sourcing',
        speakerRole: 'Dirigeant',
        speakerIcon: 'fa-hard-hat',
        situation: 'MetalPro recrute des profils p\u00e9nuriques (soudeurs, usineurs). Quelle strat\u00e9gie sourcing ATS\u202f?',
        prospectSays: 'Soudeurs, usineurs\u2026 personne ne r\u00e9pond \u00e0 mes annonces. C\u2019est des profils introuvables. Votre ATS peut changer \u00e7a\u202f?',
        recommendedModel: null,
        options: [
          { text: 'Pour les profils p\u00e9nuriques, on active le tripl\u00e9 gagnant\u202f: la CVth\u00e8que Symbiose qui cumule tous les profils d\u00e9j\u00e0 sourc\u00e9s, le vivier interne pour r\u00e9activer d\u2019anciens candidats, et la cooptation digitale qui transforme vos 80 salari\u00e9s en recruteurs. Un op\u00e9rateur qualifi\u00e9 conna\u00eet d\u2019autres op\u00e9rateurs\u202f: la cooptation, c\u2019est votre arme secr\u00e8te dans l\u2019industrie.', points: 10, quality: 'good', feedback: 'Magistral\u202f! Le tripl\u00e9 CVth\u00e8que + vivier + cooptation est la strat\u00e9gie id\u00e9ale pour les profils p\u00e9nuriques. La cooptation digitale via les 80 salari\u00e9s est particuli\u00e8rement pertinente\u202f: dans l\u2019industrie, les meilleurs profils viennent souvent par le r\u00e9seau.', model: null, kpi: { diagnostic: 20, confiance: 20, closing: 20 } },
          { text: 'On va publier vos offres sur Indeed et les jobboards sp\u00e9cialis\u00e9s industrie pour toucher plus de candidats.', points: 0, quality: 'bad', feedback: 'Il vient de vous dire que personne ne r\u00e9pond \u00e0 ses annonces\u202f! Republier sur plus de jobboards ne va pas r\u00e9soudre le probl\u00e8me. Les profils p\u00e9nuriques ne sont pas sur les jobboards\u202f: ils sont dans les viviers, les CVth\u00e8ques, et dans le r\u00e9seau des salari\u00e9s actuels.', model: null, kpi: { diagnostic: -5, confiance: -10, closing: -8 } },
          { text: 'On va d\u2019abord regarder dans la CVth\u00e8que s\u2019il y a des profils d\u00e9j\u00e0 qualifi\u00e9s, puis publier si besoin.', points: 5, quality: 'medium', feedback: 'Bon r\u00e9flexe de chercher d\u2019abord dans la CVth\u00e8que\u202f! Mais vous oubliez deux leviers cl\u00e9s\u202f: le vivier interne pour r\u00e9activer d\u2019anciens candidats, et surtout la cooptation digitale. Dans l\u2019industrie, les 80 salari\u00e9s sont votre meilleur canal de sourcing.', model: null, kpi: { diagnostic: 8, confiance: 5, closing: 5 } },
        ],
      },
    ],
  },
  {
    id: 'greenservices',
    name: 'GreenServices',
    role: 'R\u00e9seau de services',
    company: '120 salari\u00e9s',
    icon: 'fa-sitemap',
    color: '#059669',
    colorLight: '#f0fdf4',
    avatar: 'GS',
    emoji: { small: '\ud83c\udf31', medium: '\ud83c\udf33', big: '\ud83c\udf3f' },
    initKpi: { diagnostic: 10, confiance: 20, closing: 5 },
    steps: [
      {
        title: 'Diagnostic : Le bon mod\u00e8le',
        speakerRole: 'DRH',
        speakerIcon: 'fa-users-gear',
        situation: 'GreenServices a 15 recrutements/an, 4 sites, DRH d\u00e9bord\u00e9e, managers impliqu\u00e9s. Quel mod\u00e8le\u202f?',
        prospectSays: 'On a 15 recrutements par an. Je n\u2019arrive plus \u00e0 tout g\u00e9rer seule. Et mes directeurs de site veulent avoir leur mot \u00e0 dire sur les recrutements.',
        recommendedModel: 'autonome',
        options: [
          { text: 'Mode Autonome \u2014 L\u2019ATS Symbiose vous donne la structure pour g\u00e9rer vos 15 recrutements. Chaque directeur a un acc\u00e8s au pipeline de son site, vous gardez la vue globale. \u00c0 499\u202f\u20ac/mois en abo ou 1\u202f490\u202f\u20ac/offre, vous restez ma\u00eetre de vos recrutements avec un outil professionnel.', points: 10, quality: 'good', feedback: 'Excellent\u202f! Avec une DRH exp\u00e9riment\u00e9e, 15 recrutements/an et des managers motiv\u00e9s, le mode autonome est parfait. L\u2019ATS structure le processus, chaque site a son acc\u00e8s, et la DRH pilote l\u2019ensemble. Pas besoin de d\u00e9l\u00e9guer ce qu\u2019elle sait faire.', model: 'autonome', kpi: { diagnostic: 25, confiance: 15, closing: 10 } },
          { text: 'Mode Co-recrutement \u2014 Mercato source et pr\u00e9-qualifie les candidats. Vous gardez le pilotage.', points: 5, quality: 'medium', feedback: 'Le co-recrutement n\u2019est pas un mauvais choix, mais la DRH est comp\u00e9tente et ses managers veulent participer. Le probl\u00e8me est l\u2019organisation, pas le sourcing. L\u2019ATS en mode autonome r\u00e9sout son vrai besoin\u202f: structurer et d\u00e9l\u00e9guer en interne.', model: 'corecrutement', kpi: { diagnostic: 10, confiance: 5, closing: 5 } },
          { text: 'Mode D\u00e9l\u00e9gation \u2014 Confiez-nous tout, vos directeurs n\u2019ont pas besoin de s\u2019en m\u00ealer.', points: 0, quality: 'bad', feedback: 'Erreur grave\u202f! Les directeurs de site VEULENT participer au recrutement. Les exclure, c\u2019est garantir des recrutements rat\u00e9s et une DRH frustr\u00e9e. Elle a les comp\u00e9tences, il lui faut l\u2019outil pour structurer.', model: 'delegation', kpi: { diagnostic: -5, confiance: -15, closing: -10 } },
        ],
      },
      {
        title: 'Fonctionnalit\u00e9 multi-sites',
        speakerRole: 'DRH',
        speakerIcon: 'fa-users-gear',
        situation: 'La DRH veut que chaque agence puisse recruter localement mais avec une vision nationale. Quelle fonctionnalit\u00e9\u202f?',
        prospectSays: 'J\u2019ai 4 agences qui recrutent chacune. Je veux voir tout d\u2019un coup, mais chaque directeur ne doit voir que son site. C\u2019est possible\u202f?',
        recommendedModel: null,
        options: [
          { text: 'L\u2019ATS Symbiose g\u00e8re exactement ce cas\u202f: acc\u00e8s multi-sites avec des droits par agence. Chaque directeur voit et g\u00e8re uniquement les recrutements de son site. Vous, en tant que DRH, avez la vue consolid\u00e9e sur les 4 sites\u202f: combien de postes ouverts, o\u00f9 en sont les recrutements, quels sites recrutent. Le reporting national se g\u00e9n\u00e8re automatiquement.', points: 10, quality: 'good', feedback: 'Parfait\u202f! La fonctionnalit\u00e9 multi-sites avec droits granulaires par agence et reporting consolid\u00e9 est exactement ce dont une DRH de r\u00e9seau a besoin. Chacun voit ce qui le concerne, la DRH pilote l\u2019ensemble. C\u2019est du sur-mesure organisationnel.', model: null, kpi: { diagnostic: 20, confiance: 20, closing: 15 } },
          { text: 'On configure un seul compte centralis\u00e9 au si\u00e8ge, et la DRH dispatche les candidatures aux bons sites.', points: 0, quality: 'bad', feedback: 'Un compte unique centralis\u00e9 reproduit exactement le probl\u00e8me actuel\u202f: tout passe par la DRH qui est d\u00e9j\u00e0 d\u00e9bord\u00e9e. Les directeurs de site veulent \u00eatre autonomes sur LEUR p\u00e9rim\u00e8tre. Le multi-sites avec droits par agence est la seule r\u00e9ponse.', model: null, kpi: { diagnostic: -5, confiance: -10, closing: -8 } },
          { text: 'On cr\u00e9e des comptes s\u00e9par\u00e9s pour chaque site, chacun g\u00e8re ind\u00e9pendamment.', points: 5, quality: 'medium', feedback: 'Des comptes s\u00e9par\u00e9s donnent l\u2019autonomie locale, mais la DRH perd toute visibilit\u00e9 nationale. Elle devrait jongler entre 4 comptes pour avoir une vue d\u2019ensemble. Le multi-sites avec droits par agence ET reporting consolid\u00e9 est la vraie solution.', model: null, kpi: { diagnostic: 8, confiance: 5, closing: 3 } },
        ],
      },
      {
        title: 'Positionner face au SIRH',
        speakerRole: 'DRH',
        speakerIcon: 'fa-users-gear',
        situation: 'GreenServices utilise d\u00e9j\u00e0 un SIRH basique. Comment positionner l\u2019ATS Symbiose\u202f?',
        prospectSays: 'On a d\u00e9j\u00e0 un SIRH pour la paie et les cong\u00e9s. J\u2019ai pas envie de remplacer tout. \u00c7a se passe comment avec votre outil\u202f?',
        recommendedModel: null,
        options: [
          { text: 'Symbiose ne remplace pas votre SIRH, il le compl\u00e8te. Votre SIRH g\u00e8re la paie et les cong\u00e9s, excellent. Symbiose ajoute la brique recrutement qui vous manque\u202f: pipeline de candidats, CVth\u00e8que, collaboration avec les managers, reporting. Les deux outils cohabitent\u202f: quand un candidat est embauch\u00e9 dans Symbiose, vous le basculez dans votre SIRH pour la paie.', points: 10, quality: 'good', feedback: 'Parfait\u202f! L\u2019argument de compl\u00e9mentarit\u00e9 est la cl\u00e9\u202f: le SIRH g\u00e8re l\u2019apr\u00e8s-embauche (paie, cong\u00e9s), l\u2019ATS g\u00e8re l\u2019avant-embauche (sourcing, pipeline, CVth\u00e8que). Pas de conflit, pas de remplacement, juste un enrichissement du workflow RH.', model: null, kpi: { diagnostic: 20, confiance: 20, closing: 20 } },
          { text: 'Symbiose est bien plus complet que votre SIRH actuel. \u00c0 terme, vous pourriez tout centraliser chez nous et abandonner votre outil actuel.', points: 0, quality: 'bad', feedback: 'Ne proposez jamais de remplacer l\u2019outil existant\u202f! La DRH a dit qu\u2019elle ne veut pas tout changer. Proposer un remplacement cr\u00e9e de la r\u00e9sistance et de l\u2019anxi\u00e9t\u00e9. La compl\u00e9mentarit\u00e9 est bien plus rassurante et r\u00e9aliste.', model: null, kpi: { diagnostic: -5, confiance: -15, closing: -10 } },
          { text: 'On peut s\u2019int\u00e9grer \u00e0 votre SIRH. Les deux outils peuvent fonctionner ensemble.', points: 5, quality: 'medium', feedback: 'Bonne direction, mais trop vague. La DRH veut comprendre concr\u00e8tement comment les deux outils cohabitent. D\u00e9taillez\u202f: le SIRH g\u00e8re paie/cong\u00e9s, Symbiose ajoute le pipeline recrutement et la CVth\u00e8que. Le candidat embauch\u00e9 bascule de l\u2019un \u00e0 l\u2019autre.', model: null, kpi: { diagnostic: 8, confiance: 5, closing: 5 } },
        ],
      },
    ],
  },
];

const PHASES = [
  { label: 'Diagnostic', icon: 'fa-stethoscope', desc: 'Choisir le bon mod\u00e8le' },
  { label: 'Fonctionnalit\u00e9s', icon: 'fa-puzzle-piece', desc: 'Ma\u00eetriser l\u2019ATS' },
  { label: 'Closing', icon: 'fa-handshake', desc: 'Lever les objections' },
];

const MAX_SCORE = 90;

const SCORE_TIERS = [
  { min: 80, label: 'Strat\u00e8ge confirm\u00e9', icon: 'fa-crown', color: 'gold', emoji: '\ud83c\udfc6' },
  { min: 50, label: 'Bon instinct', icon: 'fa-thumbs-up', color: 'blue', emoji: '\ud83d\udcca' },
  { min: 0, label: '\u00c0 am\u00e9liorer', icon: 'fa-book-open', color: 'orange', emoji: '\ud83d\udcdd' },
];

const TIPS = [
  'Adaptez toujours le mod\u00e8le au profil\u202f: Autonome = DRH comp\u00e9tente, D\u00e9l\u00e9gation = urgence/pas de RH, Co-recrutement = profils p\u00e9nuriques',
  'Ne proposez jamais un outil sans personne pour l\u2019utiliser',
  'La CVth\u00e8que est un actif qui prend de la valeur\u202f: exploitez-la avant de republier',
  'Ne critiquez jamais l\u2019outil actuel du prospect',
  'Connaissez les tarifs par c\u0153ur\u202f: 1\u202f490\u20ac/offre, 499\u20ac/mois abo',
  'Un ROI chiffr\u00e9 est toujours plus convaincant qu\u2019une promesse vague',
  'La cooptation digitale est l\u2019arme secr\u00e8te pour les profils p\u00e9nuriques',
  'Compl\u00e9mentarit\u00e9 > Remplacement\u202f: ne proposez jamais de remplacer un outil existant',
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

function renderModelBadge(modelKey) {
  if (!modelKey) return '';
  const m = MODELS[modelKey];
  return `<span class="sg-model-badge" style="background:${m.bg};color:${m.color};border:1px solid ${m.color}20"><i class="fas ${m.icon}"></i> ${m.label}</span>`;
}

export function renderStrategeGame(container) {
  let gameState = null;

  function getEmoji(prospect, kpis) {
    const avg = (kpis.diagnostic + kpis.confiance + kpis.closing) / 3;
    if (avg < 20) return prospect.emoji.small;
    if (avg < 55) return prospect.emoji.medium;
    return prospect.emoji.big;
  }

  function getEmojiSize(kpis) {
    const avg = (kpis.diagnostic + kpis.confiance + kpis.closing) / 3;
    if (avg < 20) return 48;
    if (avg < 55) return 64;
    return 80;
  }

  function renderIntro() {
    container.innerHTML = `
      <div class="ep-garden-bg fade-in">
        <div class="ep-header">
          <div class="ep-header-icon" style="background:linear-gradient(135deg,#059669,#047857);box-shadow:0 4px 14px rgba(5,150,105,0.3)"><i class="fas fa-chess-knight"></i></div>
          <div>
            <h2 style="color:#064e3b">Strat\u00e8ge ATS</h2>
            <p style="color:#059669">Diagnostiquez, conseillez et convainquez chaque prospect.</p>
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
              <div class="ep-intro-meta">${p.role} \u2014 ${p.company}</div>
              <div class="ep-intro-trait">${p.steps[0].prospectSays.substring(0, 60)}\u2026</div>
            </div>
          `).join('')}
        </div>

        <div class="ep-intro-rules" style="border-color:#a7f3d0">
          <div class="ep-intro-rules-title" style="color:#064e3b"><i class="fas fa-info-circle" style="color:#059669"></i> R\u00e8gles du jeu</div>
          <p>Rencontrez 3 entreprises, 3 questions chacune (9 au total). Diagnostic, fonctionnalit\u00e9s cl\u00e9s, puis closing. Chaque bon choix rapporte 10 points et fait grandir la confiance du prospect\u202f!</p>
        </div>

        <div class="sg-models-intro">
          ${Object.entries(MODELS).map(([, m]) => `
            <div class="sg-model-intro-pill" style="background:${m.bg};border-color:${m.color}30;color:${m.color}">
              <i class="fas ${m.icon}"></i>
              <span>${m.label}</span>
            </div>
          `).join('')}
        </div>

        <div style="text-align:center;padding:8px 0">
          <button class="btn btn-primary ep-start-btn" style="background:linear-gradient(135deg,#059669,#047857)!important;box-shadow:0 4px 16px rgba(5,150,105,0.3)" id="sgStartBtn"><i class="fas fa-play"></i> Lancer les diagnostics</button>
        </div>
      </div>
    `;

    container.querySelector('#sgStartBtn').addEventListener('click', startGame);
  }

  function startGame() {
    gameState = {
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

  function getCompletedCount() {
    let count = 0;
    Object.values(gameState.answers).forEach(arr => { count += arr.length; });
    return count;
  }

  function renderGarden() {
    const completedActions = getCompletedCount();
    const totalActions = 9;
    const progressPct = (completedActions / totalActions) * 100;
    const completedProspects = PROSPECTS.filter(p => gameState.answers[p.id].length >= 3).length;

    container.innerHTML = `
      <div class="ep-garden-bg fade-in" style="background:linear-gradient(165deg,#F0FDF4 0%,#EFF6FF 50%,#FFF7ED 100%)">
        <div class="ep-season-bar">
          <div class="ep-season-track">
            ${PROSPECTS.map((p, i) => {
              const done = gameState.answers[p.id].length >= 3;
              const active = !done && gameState.answers[p.id].length > 0;
              return `
              <div class="ep-season-step ${done ? 'done' : ''} ${active ? 'active' : ''}">
                <div class="ep-season-dot" style="${active ? 'background:linear-gradient(135deg,#059669,#047857);box-shadow:0 3px 12px rgba(5,150,105,0.35)' : done ? 'background:#059669' : ''}"><i class="fas ${p.icon}"></i></div>
                <span>${p.name}</span>
              </div>
              ${i < PROSPECTS.length - 1 ? `<div class="ep-season-connector ${done ? 'done' : ''}" style="${done ? 'background:#059669' : ''}"></div>` : ''}
            `}).join('')}
          </div>
          <div class="ep-score-pill" style="background:linear-gradient(135deg,#d1fae5,#a7f3d0)">
            <i class="fas fa-bolt" style="color:#059669"></i>
            <span id="sgScore" style="color:#064e3b">${gameState.score}</span>
            <span class="ep-score-max" style="color:#064e3b">/ ${MAX_SCORE}</span>
          </div>
        </div>

        <div class="ep-progress-bar">
          <div class="ep-progress-fill" style="width:${progressPct}%;background:linear-gradient(90deg,#059669,#047857)"></div>
        </div>

        <div class="ep-plots-grid" id="sgPlots">
          ${PROSPECTS.map((p, pi) => {
            const kpis = gameState.prospectKpis[p.id];
            const answeredCount = gameState.answers[p.id].length;
            const allDone = answeredCount >= 3;
            const isClickable = !allDone;
            const nextPhase = answeredCount < 3 ? PHASES[answeredCount] : null;

            return `
              <div class="ep-plot ${isClickable ? 'ep-plot-clickable' : ''} ${allDone ? 'ep-plot-done' : ''}" style="border-color:${p.color}" data-prospect="${pi}">
                <div class="ep-plot-emoji" style="font-size:${getEmojiSize(kpis)}px">${getEmoji(p, kpis)}</div>
                <div class="ep-plot-badge" style="background:${p.colorLight};color:${p.color}">
                  <i class="fas ${p.icon}"></i> ${p.role.split(' ')[0]}
                </div>
                <div class="ep-plot-name">${p.name}</div>
                <div class="ep-plot-meta">${p.role} \u2014 ${p.company}</div>

                <div class="ep-gauges">
                  <div class="ep-gauge">
                    <div class="ep-gauge-label"><span>Diagnostic</span><span>${Math.round(kpis.diagnostic)}%</span></div>
                    <div class="ep-gauge-track"><div class="ep-gauge-fill" style="width:${kpis.diagnostic}%;background:${p.color}"></div></div>
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
                  ${answeredCount > 0 ? `<span class="sg-step-counter">${answeredCount}/3</span>` : ''}
                  ${allDone ? '<span class="ep-badge-check"><i class="fas fa-check"></i></span>' : ''}
                </div>

                ${isClickable ? `<button class="ep-plot-action-btn" style="background:${p.color}" data-prospect-idx="${pi}"><i class="fas ${nextPhase.icon}"></i> ${nextPhase.label}</button>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    if (completedActions >= 9) {
      renderResults();
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
    const answeredCount = gameState.answers[prospect.id].length;
    if (answeredCount >= 3) return;

    const step = prospect.steps[answeredCount];
    const shuffledOpts = shuffleArray(step.options.map((o, i) => ({ ...o, origIdx: i })));
    const questionNum = answeredCount + 1;

    const overlay = document.createElement('div');
    overlay.className = 'ep-modal-overlay fade-in';
    overlay.innerHTML = `
      <div class="ep-modal">
        <button class="game-modal-close" id="sgModalClose"><i class="fas fa-times"></i></button>
        <div class="ep-modal-header" style="border-color:${prospect.color}">
          <div class="ep-modal-emoji" style="font-size:48px">${getEmoji(prospect, kpis)}</div>
          <div>
            <div class="ep-modal-name">${prospect.name}</div>
            <div class="ep-modal-meta">${prospect.role} \u2014 ${prospect.company}</div>
            <div class="ep-modal-phase-badge" style="background:${prospect.colorLight};color:${prospect.color}">
              <i class="fas ${PHASES[answeredCount].icon}"></i> Q${questionNum}/3 \u2014 ${step.title}
            </div>
          </div>
        </div>

        <div class="sg-question-progress">
          ${[1, 2, 3].map(q => `
            <div class="sg-qprog-dot ${q < questionNum ? 'done' : ''} ${q === questionNum ? 'active' : ''}" style="${q === questionNum ? `background:${prospect.color};color:white` : q < questionNum ? 'background:#059669;color:white' : ''}">
              ${q < questionNum ? '<i class="fas fa-check" style="font-size:10px"></i>' : q}
            </div>
            ${q < 3 ? `<div class="sg-qprog-line ${q < questionNum ? 'done' : ''}" style="${q < questionNum ? 'background:#059669' : ''}"></div>` : ''}
          `).join('')}
        </div>

        <div class="ep-modal-prospect-says">
          <div class="ep-modal-prospect-avatar" style="background:linear-gradient(135deg,${prospect.color},${prospect.color}cc)">${prospect.avatar}</div>
          <div class="ep-modal-prospect-bubble">
            <div class="ep-modal-prospect-bubble-name">${step.speakerRole} \u2014 ${prospect.name}</div>
            <p>${step.prospectSays}</p>
          </div>
        </div>

        <div class="ep-modal-situation" style="background:#F0FDF4;border-color:#A7F3D0">
          <i class="fas fa-lightbulb" style="color:#059669"></i>
          <p style="color:#064e3b">${step.situation}</p>
        </div>

        <div class="ep-modal-choices" id="sgModalChoices">
          ${shuffledOpts.map((opt, i) => `
            <button class="ep-choice-card" data-idx="${i}">
              <span class="ep-choice-letter">${['A', 'B', 'C'][i]}</span>
              <span class="ep-choice-text">${opt.text}</span>
            </button>
          `).join('')}
        </div>

        <div class="ep-modal-feedback" id="sgModalFeedback"></div>
      </div>
    `;

    document.body.appendChild(overlay);

    function closeModal() {
      overlay.remove();
      renderGarden();
    }

    overlay.querySelector('#sgModalClose').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    overlay.querySelectorAll('.ep-choice-card').forEach(btn => {
      btn.addEventListener('click', () => {
        handleChoice(prospectIdx, step, shuffledOpts, parseInt(btn.dataset.idx), overlay);
      });
    });
  }

  function handleChoice(prospectIdx, step, shuffledOpts, choiceIdx, overlay) {
    const prospect = PROSPECTS[prospectIdx];
    const chosen = shuffledOpts[choiceIdx];
    const answeredCount = gameState.answers[prospect.id].length;

    gameState.score += chosen.points;
    const kpis = gameState.prospectKpis[prospect.id];
    if (chosen.kpi) {
      kpis.diagnostic = clamp(kpis.diagnostic + chosen.kpi.diagnostic, 0, 100);
      kpis.confiance = clamp(kpis.confiance + chosen.kpi.confiance, 0, 100);
      kpis.closing = clamp(kpis.closing + chosen.kpi.closing, 0, 100);
    }

    gameState.answers[prospect.id].push({
      phase: answeredCount,
      quality: chosen.quality,
      points: chosen.points,
      model: chosen.model,
      title: step.title,
    });

    const buttons = overlay.querySelectorAll('.ep-choice-card');
    buttons.forEach((btn, i) => {
      btn.disabled = true;
      btn.classList.add('ep-choice-disabled');
      const opt = shuffledOpts[i];
      if (i === choiceIdx) btn.classList.add(`ep-chosen-${opt.quality}`);
      if (opt.quality === 'good' && i !== choiceIdx) btn.classList.add('ep-reveal-good');
    });

    const feedbackEl = overlay.querySelector('#sgModalFeedback');
    const isGood = chosen.quality === 'good';
    const isBad = chosen.quality === 'bad';
    const newCompleted = getCompletedCount();
    const progressPct = Math.round((newCompleted / 9) * 100);
    const newAnsweredCount = answeredCount + 1;
    const allNineDone = getCompletedCount() >= 9;
    const prospectDone = newAnsweredCount >= 3;

    let btnLabel;
    if (allNineDone) {
      btnLabel = 'Voir les r\u00e9sultats <i class="fas fa-trophy"></i>';
    } else if (prospectDone) {
      btnLabel = 'Prospect suivant <i class="fas fa-arrow-right"></i>';
    } else {
      btnLabel = 'Question suivante <i class="fas fa-arrow-right"></i>';
    }

    let fbHtml = `
      <div class="sg-feedback-modal fade-in sg-fb-scale-in">
        <div class="sg-fb-header ${isGood ? 'sg-fb-header-good' : isBad ? 'sg-fb-header-bad' : 'sg-fb-header-medium'}">
          <div class="sg-fb-header-icon">${isGood ? '\u2705' : isBad ? '\u274c' : '\u26a0\ufe0f'}</div>
          <div class="sg-fb-header-title">${isGood ? 'Excellent\u202f!' : isBad ? 'Pas tout \u00e0 fait...' : 'Pas mal, mais...'}</div>
          <div class="sg-fb-header-points ${isGood ? 'sg-fb-pts-good' : isBad ? 'sg-fb-pts-bad' : 'sg-fb-pts-medium'}">+${chosen.points} pts</div>
        </div>

        <div class="sg-fb-body">
          <p class="sg-fb-explanation">${chosen.feedback}</p>
          ${step.recommendedModel ? `<div style="margin-top:10px">${renderModelBadge(step.recommendedModel)}</div>` : ''}
        </div>

        <div class="sg-fb-progress-section">
          <div class="sg-fb-progress-label">
            <span>Progression globale</span>
            <span>${newCompleted}/9 questions</span>
          </div>
          <div class="sg-fb-progress-track">
            <div class="sg-fb-progress-fill" style="width:${progressPct}%"></div>
          </div>
        </div>

        ${isGood ? `
          <div class="ep-fb-growth fade-in" style="animation-delay:0.2s;background:linear-gradient(135deg,#F0FDF4,#D1FAE5)">
            <span style="font-size:32px">${getEmoji(prospect, kpis)}</span>
            <span style="color:#064e3b">Confiance en hausse\u202f!</span>
          </div>
        ` : ''}

        <button class="btn btn-primary ep-fb-continue fade-in" style="animation-delay:0.3s;background:linear-gradient(135deg,#059669,#047857)!important" id="sgContinue">
          ${btnLabel}
        </button>
      </div>
    `;

    feedbackEl.innerHTML = fbHtml;

    feedbackEl.querySelector('#sgContinue').addEventListener('click', () => {
      overlay.remove();
      if (allNineDone) {
        renderResults();
      } else if (!prospectDone) {
        renderGarden();
        openActionModal(prospectIdx);
      } else {
        renderGarden();
      }
    });

    const scoreEl = document.getElementById('sgScore');
    if (scoreEl) scoreEl.textContent = gameState.score;
  }

  function renderResults() {
    const tier = SCORE_TIERS.find(t => gameState.score >= t.min) || SCORE_TIERS[SCORE_TIERS.length - 1];

    const state = getState();
    const gameKey = 'game_stratege_3';
    const prevBest = state[gameKey] || 0;
    const isNewBest = gameState.score > prevBest;
    if (isNewBest) {
      state[gameKey] = gameState.score;
      saveState();
    }

    if (gameState.score >= 60) addXP(gameState.score, 'games');
    if (gameState.score >= 80) triggerConfetti();

    const wrongTips = [];
    Object.values(gameState.answers).forEach(answers => {
      answers.forEach(a => {
        if (a.quality !== 'good') {
          const tip = TIPS[Math.floor(Math.random() * TIPS.length)];
          if (!wrongTips.includes(tip)) wrongTips.push(tip);
        }
      });
    });

    container.innerHTML = `
      <div class="ep-garden-bg fade-in" style="background:linear-gradient(165deg,#F0FDF4 0%,#EFF6FF 50%,#FFF7ED 100%)">
        <div class="ep-results">
          <div class="ep-result-header ep-result-${tier.color}">
            <div class="ep-result-emoji">${tier.emoji}</div>
            <div class="ep-result-score-big">${gameState.score}<span>/${MAX_SCORE}</span></div>
            <h2>${tier.label}</h2>
            ${isNewBest ? '<div class="ep-new-best"><i class="fas fa-arrow-up"></i> Nouveau record</div>' : ''}
          </div>

          <div class="ep-results-garden" style="border-color:#a7f3d0">
            <h3 style="color:#064e3b"><i class="fas fa-chess-knight" style="color:#059669"></i> Vos prospects</h3>
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
                    <div class="ep-result-plot-score" style="color:${p.color}">${prospectScore}/30</div>
                    <div class="ep-result-plot-stats">
                      <div class="ep-result-stat"><span>Diagnostic</span><strong style="color:${p.color}">${Math.round(kpis.diagnostic)}%</strong></div>
                      <div class="ep-result-stat"><span>Confiance</span><strong style="color:#3B82F6">${Math.round(kpis.confiance)}%</strong></div>
                      <div class="ep-result-stat"><span>Closing</span><strong style="color:#F59E0B">${Math.round(kpis.closing)}%</strong></div>
                    </div>
                    <div class="ep-result-plot-steps">
                      ${answers.map(a => `
                        <div class="ep-result-step-row">
                          <span class="ep-result-dot ep-dot-${a.quality}"></span>
                          <span class="ep-result-step-label">${a.title}</span>
                          <span class="ep-result-step-pts">+${a.points}</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div class="ep-results-garden" style="border-color:#a7f3d0">
            <h3 style="color:#064e3b"><i class="fas fa-diagram-project" style="color:#059669"></i> Les 3 mod\u00e8les</h3>
            <div class="sg-models-grid">
              ${Object.entries(MODELS).map(([key, m]) => `
                <div class="sg-model-card" style="border-color:${m.color}">
                  <div class="sg-model-card-icon" style="background:${m.color}"><i class="fas ${m.icon}"></i></div>
                  <div class="sg-model-card-label" style="color:${m.color}">${m.label}</div>
                  <div class="sg-model-card-desc">${
                    key === 'autonome' ? 'Le client g\u00e8re seul via l\u2019ATS' :
                    key === 'corecrutement' ? 'Mercato source, le client pilote' :
                    'Mercato g\u00e8re 100%, le client suit'
                  }</div>
                </div>
              `).join('')}
            </div>
          </div>

          ${wrongTips.length > 0 ? `
          <div class="ep-results-tips" style="border-color:#a7f3d0">
            <h3 style="color:#064e3b"><i class="fas fa-lightbulb" style="color:#059669"></i> Conseils de coaching</h3>
            <ul>
              ${wrongTips.slice(0, 4).map(t => `<li>${t}</li>`).join('')}
            </ul>
          </div>
          ` : ''}

          <div class="ep-result-actions">
            <button class="btn btn-primary" style="background:linear-gradient(135deg,#059669,#047857)!important" id="sgRetry"><i class="fas fa-rotate-right"></i> Recommencer</button>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#sgRetry').addEventListener('click', () => {
      gameState = null;
      renderIntro();
    });
  }

  renderIntro();
}
