import { getState, saveState } from '../state.js?v=81';
import { addXP, triggerConfetti } from '../notifications.js?v=81';

const CLIENTS = [
  {
    id: 'sophie',
    plantName: 'La Pousse Dynamique',
    name: 'Sophie Martin',
    role: 'Dirigeante TPE',
    company: 'Martin Conseil',
    employees: 8,
    pack: 'Essentiel (99\u00a0\u20ac/mois)',
    color: '#10B981',
    colorLight: '#ECFDF5',
    trait: 'Enthousiaste mais oublie d\u2019activer les fonctionnalit\u00e9s',
    upsellTarget: 'Pack Int\u00e9gral (99\u00a0\u20ac/mois)',
    emoji: { small: '\ud83c\udf31', medium: '\ud83c\udf3f', big: '\ud83c\udf33', dead: '\ud83e\udeb5' },
    initKpi: { adoption: 45, satisfaction: 70, upsell: 10 },
  },
  {
    id: 'marc',
    plantName: 'Le Ch\u00eane R\u00e9sistant',
    name: 'Marc Duval',
    role: 'DRH PME',
    company: 'Duval Industries',
    employees: 45,
    pack: 'Acquisition seul (180\u00a0\u20ac/mois)',
    color: '#2563EB',
    colorLight: '#EFF6FF',
    trait: 'Tr\u00e8s satisfait du recrutement, ne conna\u00eet pas les autres modules',
    upsellTarget: 'Pack Int\u00e9gral (495\u00a0\u20ac/mois, \u00e9conomie 27%)',
    emoji: { small: '\ud83c\udf31', medium: '\ud83c\udf3e', big: '\ud83c\udf33', dead: '\ud83e\udeb5' },
    initKpi: { adoption: 60, satisfaction: 80, upsell: 15 },
  },
  {
    id: 'camille',
    plantName: 'La Fleur Fragile',
    name: 'Camille Rousseau',
    role: 'RH Junior',
    company: 'Rousseau & Co',
    employees: 25,
    pack: 'Essentiel (125\u00a0\u20ac/mois)',
    color: '#EC4899',
    colorLight: '#FDF2F8',
    trait: 'Adoption faible (30% connexion), les salari\u00e9s ne se connectent pas',
    upsellTarget: 'Pack Conformit\u00e9 (6\u00a0\u20ac/salari\u00e9)',
    emoji: { small: '\ud83c\udf31', medium: '\ud83c\udf3a', big: '\ud83c\udf38', dead: '\ud83e\udeb5' },
    initKpi: { adoption: 30, satisfaction: 50, upsell: 5 },
  },
  {
    id: 'philippe',
    plantName: 'Le Baobab Ancien',
    name: 'Philippe Renard',
    role: 'DAF',
    company: 'Renard Group',
    employees: 80,
    pack: 'Conformit\u00e9 seul (480\u00a0\u20ac/mois)',
    color: '#F59E0B',
    colorLight: '#FFFBEB',
    trait: 'Utilise Symbiose uniquement pour la conformit\u00e9, ignore le reste',
    upsellTarget: 'Pack Int\u00e9gral (880\u00a0\u20ac/mois)',
    emoji: { small: '\ud83c\udf31', medium: '\ud83c\udf35', big: '\ud83c\udf34', dead: '\ud83e\udeb5' },
    initKpi: { adoption: 55, satisfaction: 65, upsell: 10 },
  },
];

const PHASES = [
  { label: 'J+7 \u2014 Semis', icon: 'fa-seedling', desc: 'Les premi\u00e8res racines' },
  { label: 'J+30 \u2014 Croissance', icon: 'fa-leaf', desc: 'Entretien et d\u00e9veloppement' },
  { label: 'J+90 \u2014 R\u00e9colte', icon: 'fa-sun', desc: 'Upsell & Recommandation' },
];

const ACTIONS = {
  sophie: [
    {
      phase: 0,
      situation: 'Sophie a sign\u00e9 le Pack Essentiel pour ses 8 salari\u00e9s. C\u2019est sa 1\u00e8re semaine. Comment l\u2019accompagner\u202f?',
      options: [
        { text: 'V\u00e9rifier que les 8 salari\u00e9s sont connect\u00e9s et que les premiers cong\u00e9s sont pos\u00e9s', quality: 'good', points: 8, feedback: 'Parfait\u202f! Suivi proactif, v\u00e9rification concr\u00e8te de l\u2019adoption.', reply: 'Super, merci pour le suivi\u202f! Effectivement 3 salari\u00e9s ne s\u2019\u00e9taient pas encore connect\u00e9s.', kpi: { adoption: 20, satisfaction: 10, upsell: 5 } },
        { text: 'Envoyer un email g\u00e9n\u00e9rique de bienvenue', quality: 'medium', points: 4, feedback: 'Correct mais trop impersonnel. Un appel cibl\u00e9 serait plus efficace.', reply: 'Merci pour le mail, j\u2019ai not\u00e9.', kpi: { adoption: 8, satisfaction: 5, upsell: 0 } },
        { text: 'Proposer directement le Pack Int\u00e9gral', quality: 'bad', points: 0, feedback: 'Beaucoup trop t\u00f4t\u202f! Elle vient de signer. Accompagnez d\u2019abord l\u2019adoption.', reply: 'Euh\u2026 je viens de signer, laissez-moi d\u2019abord utiliser ce que j\u2019ai\u2026', kpi: { adoption: 0, satisfaction: -10, upsell: -5 } },
      ],
    },
    {
      phase: 1,
      situation: '1 mois plus tard. Sophie utilise les cong\u00e9s mais n\u2019a pas activ\u00e9 les entretiens ni le barom\u00e8tre Humeur.',
      options: [
        { text: 'Montrer les fonctionnalit\u00e9s non activ\u00e9es\u202f: entretiens IA et barom\u00e8tre Humeur', quality: 'good', points: 8, feedback: 'Excellent\u202f! Vous montrez la valeur des modules inutilis\u00e9s au bon moment.', reply: 'Ah je ne savais m\u00eame pas que c\u2019\u00e9tait inclus\u202f! Les entretiens IA, c\u2019est g\u00e9nial.', kpi: { adoption: 20, satisfaction: 10, upsell: 10 } },
        { text: 'Demander si tout va bien', quality: 'medium', points: 4, feedback: 'Trop passif. Montrez proactivement les fonctionnalit\u00e9s qu\u2019elle n\u2019utilise pas.', reply: 'Oui oui, tout va bien, les cong\u00e9s marchent.', kpi: { adoption: 5, satisfaction: 5, upsell: 0 } },
        { text: 'Proposer d\u2019ajouter le Pack Acquisition', quality: 'bad', points: 0, feedback: 'Sophie n\u2019a pas de recrutements en cours. Proposition hors-sujet.', reply: 'Je ne recrute pas en ce moment, \u00e7a ne m\u2019int\u00e9resse pas.', kpi: { adoption: 0, satisfaction: -5, upsell: -10 } },
      ],
    },
    {
      phase: 2,
      situation: 'J+90. Sophie est fan de Symbiose mais reste sur le Pack Essentiel. Comment proposer l\u2019upsell\u202f?',
      options: [
        { text: 'Proposer le Pack Int\u00e9gral au m\u00eame prix (99\u00a0\u20ac) avec toutes les fonctionnalit\u00e9s', quality: 'good', points: 8, feedback: 'Parfait\u202f! M\u00eame prix, plus de valeur. Argument imparable pour une TPE.', reply: 'M\u00eame prix avec plus de fonctionnalit\u00e9s\u202f? \u00c7a ne se refuse pas\u202f!', kpi: { adoption: 10, satisfaction: 15, upsell: 30 } },
        { text: 'Pr\u00e9senter les tarifs de tous les packs disponibles', quality: 'medium', points: 4, feedback: 'Trop g\u00e9n\u00e9rique. Ciblez le Pack Int\u00e9gral au m\u00eame prix.', reply: 'OK, je vais y r\u00e9fl\u00e9chir, il y a beaucoup d\u2019options.', kpi: { adoption: 5, satisfaction: 0, upsell: 10 } },
        { text: 'Lui dire qu\u2019elle a besoin du Pack Int\u00e9gral pour \u00eatre conforme', quality: 'bad', points: 0, feedback: 'Ne cr\u00e9ez pas de la peur\u202f! Argument de conformit\u00e9 non pertinent pour une TPE de 8 salari\u00e9s.', reply: 'Conforme \u00e0 quoi\u202f? On est 8, pas 150\u2026', kpi: { adoption: 0, satisfaction: -10, upsell: -5 } },
      ],
    },
    {
      phase: 2,
      isRecommandation: true,
      situation: 'Sophie est ravie. C\u2019est le moment de demander une recommandation.',
      options: [
        { text: 'Sophie, vous \u00eates parmi nos meilleurs utilisateurs. Connaissez-vous un dirigeant qui pourrait b\u00e9n\u00e9ficier de Symbiose\u202f? Je vous offre un mois gratuit pour chaque parrainage.', quality: 'good', points: 9, feedback: 'Excellent\u202f! Valorisation + incentive + demande naturelle.', reply: 'C\u2019est gentil\u202f! Oui, j\u2019ai une amie qui galere avec ses RH, je vous mets en contact.', kpi: { adoption: 0, satisfaction: 5, upsell: 0 } },
        { text: 'Est-ce que vous pourriez me recommander aupr\u00e8s de vos contacts\u202f?', quality: 'medium', points: 4, feedback: 'Trop vague. Pr\u00e9cisez le profil et offrez un incentive.', reply: 'Euh\u2026 oui pourquoi pas, je vais y penser.', kpi: { adoption: 0, satisfaction: 0, upsell: 0 } },
        { text: 'Ne rien demander \u2014 elle est contente, pas besoin de forcer', quality: 'bad', points: 0, feedback: 'Erreur\u202f! Un client satisfait est votre meilleur ambassadeur. Ne manquez pas cette opportunit\u00e9.', reply: '', kpi: { adoption: 0, satisfaction: 0, upsell: 0 } },
      ],
    },
  ],
  marc: [
    {
      phase: 0,
      situation: 'Marc utilise Symbiose pour le recrutement (ATS). C\u2019est sa 1\u00e8re semaine. Comment l\u2019accompagner\u202f?',
      options: [
        { text: 'Appeler pour v\u00e9rifier que les recrutements en cours sont bien dans le pipeline ATS', quality: 'good', points: 8, feedback: 'Parfait\u202f! Suivi cibl\u00e9 sur son usage r\u00e9el.', reply: 'Oui, j\u2019ai mis mes 3 postes ouverts. L\u2019interface est claire\u202f!', kpi: { adoption: 15, satisfaction: 10, upsell: 5 } },
        { text: 'Envoyer un guide d\u2019utilisation par email', quality: 'medium', points: 4, feedback: 'Utile mais impersonnel. Un appel personnalis\u00e9 aurait plus d\u2019impact.', reply: 'Merci, je regarderai quand j\u2019aurai le temps.', kpi: { adoption: 8, satisfaction: 5, upsell: 0 } },
        { text: 'Attendre qu\u2019il appelle s\u2019il a un probl\u00e8me', quality: 'bad', points: 0, feedback: 'Erreur\u202f! Ne soyez jamais passif. Le suivi proactif fait la diff\u00e9rence.', reply: '', kpi: { adoption: 0, satisfaction: -5, upsell: 0 } },
      ],
    },
    {
      phase: 1,
      situation: 'Marc est tr\u00e8s content du recrutement. Mais il ne conna\u00eet pas les modules Cong\u00e9s, Entretiens, Humeur.',
      options: [
        { text: 'Pr\u00e9senter les chiffres d\u2019utilisation ATS et proposer de d\u00e9couvrir le barom\u00e8tre Humeur et les cong\u00e9s', quality: 'good', points: 8, feedback: 'Excellent\u202f! Vous capitalisez sur sa satisfaction pour \u00e9largir l\u2019usage.', reply: 'Ah int\u00e9ressant, le barom\u00e8tre Humeur \u00e7a pourrait vraiment m\u2019aider.', kpi: { adoption: 20, satisfaction: 10, upsell: 15 } },
        { text: 'V\u00e9rifier la satisfaction g\u00e9n\u00e9rale', quality: 'medium', points: 4, feedback: 'Trop passif. Il est d\u00e9j\u00e0 satisfait, montrez-lui de la valeur suppl\u00e9mentaire.', reply: 'Oui tout va bien, le recrutement marche super.', kpi: { adoption: 5, satisfaction: 5, upsell: 0 } },
        { text: 'Ne pas appeler \u2014 il est content, pas besoin de le d\u00e9ranger', quality: 'bad', points: 0, feedback: 'Erreur\u202f! Un client content est une opportunit\u00e9 d\u2019upsell, pas un pr\u00e9texte pour l\u2019ignorer.', reply: '', kpi: { adoption: 0, satisfaction: -5, upsell: -5 } },
      ],
    },
    {
      phase: 2,
      situation: 'Marc est fan de l\u2019ATS et int\u00e9ress\u00e9 par les autres modules. Comment proposer l\u2019upsell\u202f?',
      options: [
        { text: 'Proposer le Pack Int\u00e9gral \u00e0 11\u00a0\u20ac/salari\u00e9 au lieu de 15\u00a0\u20ac s\u00e9par\u00e9s \u2014 \u00e9conomie 27%', quality: 'good', points: 8, feedback: 'Parfait\u202f! Argument financier clair + plus de valeur.', reply: '27% d\u2019\u00e9conomie\u202f? Et j\u2019ai tout en plus\u202f? Sign\u00e9.', kpi: { adoption: 10, satisfaction: 15, upsell: 30 } },
        { text: 'Proposer d\u2019ajouter les modules un par un', quality: 'medium', points: 4, feedback: 'Complexe et plus cher. Le Pack Int\u00e9gral est une meilleure offre.', reply: 'OK, mais c\u2019est compliqu\u00e9 de choisir module par module\u2026', kpi: { adoption: 5, satisfaction: 0, upsell: 10 } },
        { text: 'Augmenter le prix sans justification claire', quality: 'bad', points: 0, feedback: 'Jamais d\u2019augmentation sans valeur ajout\u00e9e d\u00e9montr\u00e9e\u202f!', reply: 'Pourquoi je paierais plus pour la m\u00eame chose\u202f?', kpi: { adoption: 0, satisfaction: -15, upsell: -10 } },
      ],
    },
    {
      phase: 2,
      isRecommandation: true,
      situation: 'Marc est un ambassadeur convaincu. Demandez une recommandation.',
      options: [
        { text: 'Marc, vos r\u00e9sultats recrutement sont impressionnants. Connaissez-vous un DRH qui cherche \u00e0 am\u00e9liorer ses process\u202f? Je vous organise un d\u00e9jeuner \u00e0 trois.', quality: 'good', points: 9, feedback: 'Excellent\u202f! Valorisation des r\u00e9sultats + format convivial + cibl\u00e9.', reply: 'Oui\u202f! Mon ancien coll\u00e8gue chez Nexus cherche un ATS. Un d\u00e9jeuner c\u2019est parfait.', kpi: { adoption: 0, satisfaction: 5, upsell: 0 } },
        { text: 'Vous pourriez parler de Symbiose autour de vous\u202f?', quality: 'medium', points: 4, feedback: 'Trop vague et peu engageant. Proposez un format concret.', reply: 'Oui, si l\u2019occasion se pr\u00e9sente.', kpi: { adoption: 0, satisfaction: 0, upsell: 0 } },
        { text: 'Ne pas demander de recommandation', quality: 'bad', points: 0, feedback: 'Un DRH satisfait est un canal de recommandation en or. Ne le gaspillez pas.', reply: '', kpi: { adoption: 0, satisfaction: 0, upsell: 0 } },
      ],
    },
  ],
  camille: [
    {
      phase: 0,
      situation: 'Camille a 25 salari\u00e9s mais seulement 30% se connectent \u00e0 Symbiose. Que faire en J+7\u202f?',
      options: [
        { text: 'Identifier les salari\u00e9s non connect\u00e9s et proposer un email d\u2019invitation personnalis\u00e9 centr\u00e9 sur les cong\u00e9s', quality: 'good', points: 8, feedback: 'Parfait\u202f! Action concr\u00e8te cibl\u00e9e sur le probl\u00e8me d\u2019adoption.', reply: 'Bonne id\u00e9e\u202f! Si on parle cong\u00e9s, les salari\u00e9s vont s\u2019y int\u00e9resser.', kpi: { adoption: 25, satisfaction: 10, upsell: 5 } },
        { text: 'Appeler pour v\u00e9rifier que tout fonctionne', quality: 'medium', points: 4, feedback: 'Correct mais ne r\u00e9sout pas le probl\u00e8me d\u2019adoption. Soyez plus pr\u00e9cis.', reply: 'Oui \u00e7a fonctionne, mais les salari\u00e9s ne se connectent pas beaucoup\u2026', kpi: { adoption: 8, satisfaction: 5, upsell: 0 } },
        { text: 'Ignorer \u2014 elle vient de signer, laissons-la tranquille', quality: 'bad', points: 0, feedback: 'Dangereux\u202f! 30% d\u2019adoption \u00e0 J+7 = risque de churn \u00e9lev\u00e9.', reply: '', kpi: { adoption: -5, satisfaction: -10, upsell: 0 } },
      ],
    },
    {
      phase: 1,
      situation: 'L\u2019adoption a progress\u00e9 mais reste fragile. Camille a besoin d\u2019aide pour engager son \u00e9quipe.',
      options: [
        { text: 'Analyser les KPIs\u202f: identifier les salari\u00e9s non connect\u00e9s et proposer des invitations personnalis\u00e9es', quality: 'good', points: 8, feedback: 'Excellent\u202f! Analyse data + plan d\u2019action concret.', reply: 'Top, vous avez les stats pr\u00e9cises\u202f? On peut cibler les r\u00e9calcitrants.', kpi: { adoption: 20, satisfaction: 15, upsell: 10 } },
        { text: 'Demander si l\u2019\u00e9quipe utilise bien l\u2019outil', quality: 'medium', points: 4, feedback: 'Trop vague. Proposez des actions concr\u00e8tes bas\u00e9es sur les donn\u00e9es.', reply: 'Bof, certains l\u2019utilisent, d\u2019autres pas trop\u2026', kpi: { adoption: 5, satisfaction: 5, upsell: 0 } },
        { text: 'Proposer directement un pack suppl\u00e9mentaire', quality: 'bad', points: 0, feedback: 'L\u2019adoption est fragile\u202f! Consolidez d\u2019abord avant de vendre plus.', reply: 'Ajouter un pack\u202f? On n\u2019arrive d\u00e9j\u00e0 pas \u00e0 utiliser ce qu\u2019on a\u2026', kpi: { adoption: -5, satisfaction: -10, upsell: -10 } },
      ],
    },
    {
      phase: 2,
      situation: 'L\u2019adoption s\u2019est am\u00e9lior\u00e9e. Camille d\u00e9couvre les risques de conformit\u00e9. Comment proposer l\u2019upsell\u202f?',
      options: [
        { text: 'Proposer le Pack Conformit\u00e9 \u00e0 6\u00a0\u20ac/salari\u00e9 \u2014 DUERP et tranquillit\u00e9 inspections', quality: 'good', points: 8, feedback: 'Parfait\u202f! Upsell cibl\u00e9 sur un vrai besoin \u00e9mergent.', reply: 'C\u2019est vrai qu\u2019on n\u2019a pas de DUERP \u00e0 jour\u2026 150\u00a0\u20ac/mois c\u2019est raisonnable.', kpi: { adoption: 10, satisfaction: 10, upsell: 30 } },
        { text: 'Proposer le Pack Int\u00e9gral directement', quality: 'medium', points: 4, feedback: 'Trop ambitieux. Commencez par la conformit\u00e9 qui est un besoin imm\u00e9diat.', reply: 'C\u2019est un gros saut de prix\u2026 je vais en parler \u00e0 ma direction.', kpi: { adoption: 5, satisfaction: 0, upsell: 10 } },
        { text: 'Proposer un module IA avanc\u00e9', quality: 'bad', points: 0, feedback: 'Hors sujet. Camille a besoin de conformit\u00e9, pas de fonctionnalit\u00e9s avanc\u00e9es.', reply: 'De l\u2019IA\u202f? On est 25, pas une startup tech\u2026', kpi: { adoption: 0, satisfaction: -5, upsell: -5 } },
      ],
    },
    {
      phase: 2,
      isRecommandation: true,
      situation: 'Camille a progress\u00e9 et g\u00e8re mieux ses RH. Comment obtenir une recommandation\u202f?',
      options: [
        { text: 'Camille, votre adoption est pass\u00e9e de 30% \u00e0 plus de 80%. C\u2019est impressionnant\u202f! Connaissez-vous une RH qui gal\u00e8re avec l\u2019adoption\u202f? Votre t\u00e9moignage serait tr\u00e8s utile.', quality: 'good', points: 9, feedback: 'Excellent\u202f! Valorisation du parcours + demande cibl\u00e9e sur une douleur identique.', reply: 'Oh oui, ma copine L\u00e9a est dans le m\u00eame cas\u202f! Je peux t\u00e9moigner.', kpi: { adoption: 0, satisfaction: 5, upsell: 0 } },
        { text: 'Vous avez des contacts RH qui pourraient \u00eatre int\u00e9ress\u00e9s\u202f?', quality: 'medium', points: 4, feedback: 'Correct mais manque de personnalisation et de contexte.', reply: 'Peut-\u00eatre, je vais y r\u00e9fl\u00e9chir.', kpi: { adoption: 0, satisfaction: 0, upsell: 0 } },
        { text: 'Ne pas demander \u2014 son adoption \u00e9tait fragile', quality: 'bad', points: 0, feedback: 'Elle a progress\u00e9\u202f! C\u2019est justement le meilleur moment pour demander.', reply: '', kpi: { adoption: 0, satisfaction: 0, upsell: 0 } },
      ],
    },
  ],
  philippe: [
    {
      phase: 0,
      situation: 'Philippe n\u2019utilise Symbiose que pour la conformit\u00e9. J+7, comment l\u2019accompagner\u202f?',
      options: [
        { text: 'V\u00e9rifier que le DUERP est g\u00e9n\u00e9r\u00e9 et que le registre du personnel est rempli', quality: 'good', points: 8, feedback: 'Parfait\u202f! Suivi cibl\u00e9 sur son usage principal.', reply: 'Oui, le DUERP est g\u00e9n\u00e9r\u00e9 automatiquement, c\u2019est exactement ce qu\u2019il me fallait.', kpi: { adoption: 15, satisfaction: 15, upsell: 5 } },
        { text: 'Envoyer un r\u00e9sum\u00e9 des fonctionnalit\u00e9s conformit\u00e9', quality: 'medium', points: 4, feedback: 'Utile mais un appel de v\u00e9rification serait plus efficace.', reply: 'Merci, j\u2019ai d\u00e9j\u00e0 explor\u00e9 la plupart.', kpi: { adoption: 8, satisfaction: 5, upsell: 0 } },
        { text: 'Ne pas appeler \u2014 un DAF n\u2019aime pas \u00eatre d\u00e9rang\u00e9', quality: 'bad', points: 0, feedback: 'Pr\u00e9jug\u00e9\u202f! Un DAF appr\u00e9cie un suivi structur\u00e9 et professionnel.', reply: '', kpi: { adoption: 0, satisfaction: -5, upsell: 0 } },
      ],
    },
    {
      phase: 1,
      situation: 'Philippe est satisfait de la conformit\u00e9. Il ne conna\u00eet pas les modules RH (cong\u00e9s, recrutement).',
      options: [
        { text: 'Montrer les rapports de conformit\u00e9 g\u00e9n\u00e9r\u00e9s et pr\u00e9senter les fonctionnalit\u00e9s RH qu\u2019il n\u2019utilise pas', quality: 'good', points: 8, feedback: 'Excellent\u202f! Vous cr\u00e9ez un pont entre sa satisfaction actuelle et de nouveaux usages.', reply: 'Les cong\u00e9s et le recrutement int\u00e9gr\u00e9s\u202f? Montrez-moi.', kpi: { adoption: 20, satisfaction: 10, upsell: 15 } },
        { text: 'V\u00e9rifier que le DUERP est \u00e0 jour', quality: 'medium', points: 4, feedback: 'C\u2019est bien mais vous restez dans la zone de confort. Montrez-lui plus.', reply: 'Oui, tout est en ordre. Merci.', kpi: { adoption: 5, satisfaction: 5, upsell: 0 } },
        { text: 'Ne rien faire \u2014 il paie, c\u2019est l\u2019essentiel', quality: 'bad', points: 0, feedback: 'Erreur\u202f! Un client qui n\u2019utilise qu\u2019un module = risque de churn et opportunit\u00e9 rat\u00e9e.', reply: '', kpi: { adoption: -5, satisfaction: -5, upsell: -5 } },
      ],
    },
    {
      phase: 2,
      situation: 'Philippe voit la valeur globale de Symbiose. Comment proposer le Pack Int\u00e9gral\u202f?',
      options: [
        { text: 'Proposer le Pack Int\u00e9gral \u00e0 11\u00a0\u20ac/salari\u00e9 \u2014 cong\u00e9s + recrutement pour seulement 5\u00a0\u20ac de plus', quality: 'good', points: 8, feedback: 'Parfait\u202f! Argument de co\u00fbt marginal + valeur ajout\u00e9e \u00e9norme.', reply: '5\u00a0\u20ac de plus par salari\u00e9 pour tout avoir\u202f? C\u2019est logique financ\u00e8rement.', kpi: { adoption: 10, satisfaction: 15, upsell: 30 } },
        { text: 'Pr\u00e9senter un comparatif d\u00e9taill\u00e9 des packs', quality: 'medium', points: 4, feedback: 'Trop analytique. Un DAF veut un chiffre cl\u00e9, pas un tableau complet.', reply: 'OK, je vais \u00e9tudier \u00e7a avec mon \u00e9quipe.', kpi: { adoption: 5, satisfaction: 0, upsell: 10 } },
        { text: 'Dire que la conformit\u00e9 seule ne suffit pas', quality: 'bad', points: 0, feedback: 'Ne d\u00e9valorisez jamais le choix actuel du client\u202f!', reply: 'Pardon\u202f? C\u2019est ce que je vous paie 480\u00a0\u20ac par mois\u2026', kpi: { adoption: 0, satisfaction: -15, upsell: -10 } },
      ],
    },
    {
      phase: 2,
      isRecommandation: true,
      situation: 'Philippe est convaincu. Comment obtenir une recommandation\u202f?',
      options: [
        { text: 'Philippe, vous \u00eatre DAF de 80 salari\u00e9s et votre conformit\u00e9 est exemplaire. Connaissez-vous un DAF qui a des enjeux similaires\u202f? Je vous propose un webinar t\u00e9moignage avec nos experts.', quality: 'good', points: 9, feedback: 'Excellent\u202f! Valorisation du profil + format professionnel adapt\u00e9 au DAF.', reply: 'Un webinar, pourquoi pas. J\u2019ai 2-3 DAF dans mon r\u00e9seau qui pourraient \u00eatre int\u00e9ress\u00e9s.', kpi: { adoption: 0, satisfaction: 5, upsell: 0 } },
        { text: 'Vous pouvez nous recommander \u00e0 vos contacts\u202f?', quality: 'medium', points: 4, feedback: 'Trop direct et impersonnel pour un DAF. Proposez un cadre formel.', reply: 'Je verrai si l\u2019occasion se pr\u00e9sente.', kpi: { adoption: 0, satisfaction: 0, upsell: 0 } },
        { text: 'Ne pas demander \u2014 un DAF ne recommande pas des outils', quality: 'bad', points: 0, feedback: 'Faux\u202f! Les DAF recommandent tr\u00e8s souvent dans leur r\u00e9seau professionnel.', reply: '', kpi: { adoption: 0, satisfaction: 0, upsell: 0 } },
      ],
    },
  ],
};

const TIPS = [
  'V\u00e9rifiez l\u2019activation des fonctionnalit\u00e9s dans les 7 premiers jours',
  'Un client qui n\u2019utilise qu\u2019un module est \u00e0 risque de churn',
  'Capitalisez sur la satisfaction pour \u00e9largir l\u2019usage',
  'L\u2019upsell est un service, pas une vente forc\u00e9e',
  'Un client satisfait est votre meilleur canal d\u2019acquisition',
  'Personnalisez chaque interaction selon le profil et les KPIs',
  'Ne proposez un upsell qu\u2019apr\u00e8s avoir d\u00e9montr\u00e9 la valeur',
];

const SCORE_TIERS = [
  { min: 90, label: 'Ma\u00eetre Jardinier', icon: 'fa-crown', color: 'gold', emoji: '\ud83c\udf1f' },
  { min: 60, label: 'Jardinier Confirm\u00e9', icon: 'fa-medal', color: 'blue', emoji: '\ud83c\udf31' },
  { min: 0, label: 'Apprenti Jardinier', icon: 'fa-seedling', color: 'orange', emoji: '\ud83e\udeb4' },
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

export function initGameJardin(container) {
  let gameState = null;

  function getPlantEmoji(client, kpis) {
    const avg = (kpis.adoption + kpis.satisfaction + kpis.upsell) / 3;
    if (avg < 30) return client.emoji.dead;
    if (!gameState) return client.emoji.small;
    const answered = gameState.answers[client.id].length;
    if (answered <= 1) return client.emoji.small;
    if (answered <= 2) return client.emoji.medium;
    return client.emoji.big;
  }

  function getPlantSize(answered) {
    if (answered <= 1) return 48;
    if (answered <= 2) return 64;
    return 80;
  }

  function renderIntro() {
    container.innerHTML = `
      <div class="gj-garden-bg fade-in">
        <div class="gj-header">
          <div class="gj-header-icon"><i class="fas fa-seedling"></i></div>
          <div>
            <h2>Le Jardin Symbiose</h2>
            <p>Faites grandir vos clients comme des plantes en les accompagnant aux bons moments.</p>
          </div>
        </div>

        <div class="gj-intro-grid">
          ${CLIENTS.map(c => `
            <div class="gj-intro-plant-card" style="border-color:${c.color}">
              <div class="gj-intro-plant-emoji">${c.emoji.small}</div>
              <div class="gj-intro-plant-name" style="color:${c.color}">${c.plantName}</div>
              <div class="gj-intro-client-name">${c.name}</div>
              <div class="gj-intro-client-role">${c.role} \u2014 ${c.employees} salari\u00e9s</div>
              <div class="gj-intro-client-pack"><i class="fas fa-box"></i> ${c.pack}</div>
              <div class="gj-intro-trait">${c.trait}</div>
            </div>
          `).join('')}
        </div>

        <div class="gj-intro-rules">
          <div class="gj-intro-rules-title"><i class="fas fa-info-circle"></i> R\u00e8gles du jeu</div>
          <p>Accompagnez 4 clients \u00e0 J+7, J+30 et J+90. Choisissez les bonnes actions pour maximiser l\u2019adoption, la satisfaction et r\u00e9ussir l\u2019upsell. Chaque bon choix fait grandir la plante\u202f!</p>
        </div>

        <div style="text-align:center;padding:8px 0">
          <button class="btn btn-primary gj-start-btn" id="gjStartBtn"><i class="fas fa-play"></i> Commencer \u00e0 jardiner</button>
        </div>
      </div>
    `;

    container.querySelector('#gjStartBtn').addEventListener('click', startGame);
  }

  function startGame() {
    gameState = {
      score: 0,
      answers: {},
      clientKpis: {},
      upsellSuccess: {},
      recoSuccess: {},
    };

    CLIENTS.forEach(c => {
      gameState.clientKpis[c.id] = { ...c.initKpi };
      gameState.answers[c.id] = [];
      gameState.upsellSuccess[c.id] = false;
      gameState.recoSuccess[c.id] = false;
    });

    renderGarden();
  }

  function getTotalActions() {
    let total = 0;
    CLIENTS.forEach(c => { total += ACTIONS[c.id].length; });
    return total;
  }

  function getCompletedCount() {
    let count = 0;
    Object.values(gameState.answers).forEach(arr => { count += arr.length; });
    return count;
  }

  function getClientActions(clientId) {
    return ACTIONS[clientId];
  }

  function renderGarden() {
    const completedActions = getCompletedCount();
    const totalActions = getTotalActions();
    const progressPct = (completedActions / totalActions) * 100;

    container.innerHTML = `
      <div class="gj-garden-bg fade-in">
        <div class="gj-season-bar">
          <div class="gj-season-track">
            ${CLIENTS.map((c, i) => {
              const totalForClient = getClientActions(c.id).length;
              const answered = gameState.answers[c.id].length;
              const done = answered >= totalForClient;
              const active = !done && answered > 0;
              return `
              <div class="gj-season-step ${done ? 'done' : ''} ${active ? 'active' : ''}">
                <div class="gj-season-dot"><i class="fas ${done ? 'fa-check' : active ? 'fa-seedling' : 'fa-circle'}"></i></div>
                <span>${c.name.split(' ')[0]}</span>
              </div>
              ${i < CLIENTS.length - 1 ? `<div class="gj-season-connector ${done ? 'done' : ''}"></div>` : ''}
            `}).join('')}
          </div>
          <div class="gj-score-pill">
            <i class="fas fa-star"></i>
            <span id="gjScore">${gameState.score}</span>
            <span class="gj-score-max">/ 100</span>
          </div>
        </div>

        <div class="gj-progress-bar">
          <div class="gj-progress-fill" style="width:${progressPct}%"></div>
        </div>

        <div class="gj-plots-grid" id="gjPlots">
          ${CLIENTS.map((c, ci) => {
            const kpis = gameState.clientKpis[c.id];
            const allActions = getClientActions(c.id);
            const answered = gameState.answers[c.id].length;
            const allDone = answered >= allActions.length;
            const isClickable = !allDone;
            const plantEmoji = getPlantEmoji(c, kpis);
            const plantSize = getPlantSize(answered);
            const upsellDone = gameState.upsellSuccess[c.id];
            const recoDone = gameState.recoSuccess[c.id];
            const nextAction = !allDone ? allActions[answered] : null;
            const nextPhaseLabel = nextAction ? (nextAction.isRecommandation ? 'Recommandation' : PHASES[nextAction.phase].label) : '';

            return `
              <div class="gj-plot ${isClickable ? 'gj-plot-clickable' : 'gj-plot-done'}" style="border-color:${c.color}" data-client="${ci}">
                <div class="gj-plot-plant" style="font-size:${plantSize}px">${plantEmoji}</div>
                <div class="gj-plot-plant-name" style="color:${c.color}">${c.plantName}</div>
                <div class="gj-plot-client">${c.name}</div>
                <div class="gj-plot-meta">${c.role} \u2014 ${c.employees} sal.</div>

                <div class="gj-gauges">
                  <div class="gj-gauge">
                    <div class="gj-gauge-label"><span>Adoption</span><span>${Math.round(kpis.adoption)}%</span></div>
                    <div class="gj-gauge-track"><div class="gj-gauge-fill" style="width:${kpis.adoption}%;background:#10B981"></div></div>
                  </div>
                  <div class="gj-gauge">
                    <div class="gj-gauge-label"><span>Satisfaction</span><span>${Math.round(kpis.satisfaction)}%</span></div>
                    <div class="gj-gauge-track"><div class="gj-gauge-fill" style="width:${kpis.satisfaction}%;background:#3B82F6"></div></div>
                  </div>
                  <div class="gj-gauge">
                    <div class="gj-gauge-label"><span>Upsell</span><span>${Math.round(kpis.upsell)}%</span></div>
                    <div class="gj-gauge-track"><div class="gj-gauge-fill" style="width:${kpis.upsell}%;background:#F59E0B"></div></div>
                  </div>
                </div>

                <div class="gj-plot-badges">
                  ${answered > 0 ? `<span class="sg-step-counter">${answered}/${allActions.length}</span>` : ''}
                  ${upsellDone ? '<span class="gj-badge-icon" title="Upsell r\u00e9ussi"><i class="fas fa-gem"></i></span>' : ''}
                  ${recoDone ? '<span class="gj-badge-icon" title="Recommandation obtenue"><i class="fas fa-star"></i></span>' : ''}
                  ${allDone ? '<span class="gj-badge-check"><i class="fas fa-check"></i></span>' : ''}
                </div>

                ${isClickable ? `<button class="gj-plot-action-btn" style="background:${c.color}" data-client-idx="${ci}"><i class="fas fa-hand-sparkles"></i> ${nextPhaseLabel}</button>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    if (completedActions >= totalActions) {
      renderResults();
      return;
    }

    container.querySelectorAll('.gj-plot-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.clientIdx);
        openActionModal(idx);
      });
    });

    container.querySelectorAll('.gj-plot-clickable').forEach(plot => {
      plot.addEventListener('click', () => {
        const idx = parseInt(plot.dataset.client);
        openActionModal(idx);
      });
    });
  }

  function openActionModal(clientIdx) {
    const client = CLIENTS[clientIdx];
    const kpis = gameState.clientKpis[client.id];
    const allActions = getClientActions(client.id);
    const answered = gameState.answers[client.id].length;
    if (answered >= allActions.length) return;

    const action = allActions[answered];
    const questionNum = answered + 1;
    const totalQ = allActions.length;
    const shuffledOpts = shuffleArray(action.options.map((o, i) => ({ ...o, origIdx: i })));

    const overlay = document.createElement('div');
    overlay.className = 'gj-modal-overlay fade-in';
    overlay.innerHTML = `
      <div class="gj-modal">
        <button class="game-modal-close" id="gjModalClose"><i class="fas fa-times"></i></button>
        <div class="gj-modal-header" style="border-color:${client.color}">
          <div class="gj-modal-plant" style="font-size:48px">${getPlantEmoji(client, kpis)}</div>
          <div>
            <div class="gj-modal-client-name">${client.name}</div>
            <div class="gj-modal-client-meta">${client.role} \u2014 ${client.company} \u2014 ${client.employees} sal.</div>
            <div class="gj-modal-phase-badge" style="background:${client.colorLight};color:${client.color}">
              ${action.isRecommandation ? '<i class="fas fa-star"></i> Recommandation' : `<i class="fas ${PHASES[action.phase].icon}"></i> ${PHASES[action.phase].label}`}
              <span style="margin-left:8px;opacity:0.7">Q${questionNum}/${totalQ}</span>
            </div>
          </div>
        </div>

        <div class="sg-question-progress" style="margin-bottom:12px">
          ${allActions.map((_, q) => `
            <div class="sg-qprog-dot ${q + 1 < questionNum ? 'done' : ''} ${q + 1 === questionNum ? 'active' : ''}" style="${q + 1 === questionNum ? `background:${client.color};color:white` : q + 1 < questionNum ? 'background:#10B981;color:white' : ''}">
              ${q + 1 < questionNum ? '<i class="fas fa-check" style="font-size:10px"></i>' : q + 1}
            </div>
            ${q < allActions.length - 1 ? `<div class="sg-qprog-line ${q + 1 < questionNum ? 'done' : ''}" style="${q + 1 < questionNum ? 'background:#10B981' : ''}"></div>` : ''}
          `).join('')}
        </div>

        <div class="gj-modal-situation">
          <i class="fas fa-lightbulb"></i>
          <p>${action.situation}</p>
        </div>

        <div class="gj-modal-choices" id="gjModalChoices">
          ${shuffledOpts.map((opt, i) => `
            <button class="gj-choice-card" data-idx="${i}">
              <span class="gj-choice-letter">${['A', 'B', 'C'][i]}</span>
              <span class="gj-choice-text">${opt.text}</span>
            </button>
          `).join('')}
        </div>

        <div class="gj-modal-feedback" id="gjModalFeedback"></div>
      </div>
    `;

    container.appendChild(overlay);

    function closeModal() {
      overlay.remove();
      renderGarden();
    }

    overlay.querySelector('#gjModalClose').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    overlay.querySelectorAll('.gj-choice-card').forEach(btn => {
      btn.addEventListener('click', () => {
        handleActionChoice(clientIdx, action, shuffledOpts, parseInt(btn.dataset.idx), overlay);
      });
    });
  }

  function handleActionChoice(clientIdx, action, shuffledOpts, choiceIdx, overlay) {
    const client = CLIENTS[clientIdx];
    const chosen = shuffledOpts[choiceIdx];

    gameState.score += chosen.points;
    const kpis = gameState.clientKpis[client.id];
    kpis.adoption = clamp(kpis.adoption + chosen.kpi.adoption, 0, 100);
    kpis.satisfaction = clamp(kpis.satisfaction + chosen.kpi.satisfaction, 0, 100);
    kpis.upsell = clamp(kpis.upsell + chosen.kpi.upsell, 0, 100);

    gameState.answers[client.id].push({
      phase: action.phase,
      quality: chosen.quality,
      points: chosen.points,
      isReco: !!action.isRecommandation,
    });

    if (action.isRecommandation && chosen.quality === 'good') {
      gameState.recoSuccess[client.id] = true;
    }
    if (!action.isRecommandation && action.phase === 2 && chosen.quality === 'good') {
      gameState.upsellSuccess[client.id] = true;
    }

    const buttons = overlay.querySelectorAll('.gj-choice-card');
    buttons.forEach((btn, i) => {
      btn.disabled = true;
      btn.classList.add('gj-choice-disabled');
      const opt = shuffledOpts[i];
      if (i === choiceIdx) {
        btn.classList.add(`gj-chosen-${opt.quality}`);
      }
      if (opt.quality === 'good' && i !== choiceIdx) {
        btn.classList.add('gj-reveal-good');
      }
    });

    const qualityLabels = { good: 'Excellent choix', medium: 'Choix moyen', bad: 'Mauvais choix' };
    const qualityIcons = { good: 'fa-check-circle', medium: 'fa-exclamation-circle', bad: 'fa-times-circle' };

    const allActions = getClientActions(client.id);
    const newAnswered = gameState.answers[client.id].length;
    const clientDone = newAnswered >= allActions.length;
    const allDone = getCompletedCount() >= getTotalActions();

    let btnLabel;
    if (allDone) {
      btnLabel = 'Voir les r\u00e9sultats <i class="fas fa-trophy"></i>';
    } else if (clientDone) {
      btnLabel = 'Client suivant <i class="fas fa-arrow-right"></i>';
    } else {
      btnLabel = 'Question suivante <i class="fas fa-arrow-right"></i>';
    }

    const feedbackEl = overlay.querySelector('#gjModalFeedback');
    let fbHtml = `
      <div class="gj-fb gj-fb-${chosen.quality} fade-in">
        <div class="gj-fb-header">
          <i class="fas ${qualityIcons[chosen.quality]}"></i>
          <span>${qualityLabels[chosen.quality]} (+${chosen.points} pts)</span>
        </div>
        <p>${chosen.feedback}</p>
      </div>
    `;

    if (chosen.reply) {
      fbHtml += `
        <div class="gj-fb-reply fade-in" style="animation-delay:0.2s;border-color:${client.color}">
          <div class="gj-fb-reply-avatar" style="background:${client.color}">${client.name.split(' ').map(w => w[0]).join('')}</div>
          <div>
            <div class="gj-fb-reply-name">${client.name}</div>
            <p>${chosen.reply}</p>
          </div>
        </div>
      `;
    }

    if (chosen.quality === 'good') {
      fbHtml += `
        <div class="gj-fb-plant-growth fade-in" style="animation-delay:0.3s">
          <span style="font-size:32px">${getPlantEmoji(client, kpis)}</span>
          <span>La plante grandit\u202f!</span>
        </div>
      `;
    }

    fbHtml += `
      <button class="btn btn-primary gj-fb-continue fade-in" style="animation-delay:0.4s" id="gjContinue">
        ${btnLabel}
      </button>
    `;

    feedbackEl.innerHTML = fbHtml;

    feedbackEl.querySelector('#gjContinue').addEventListener('click', () => {
      overlay.remove();
      if (allDone) {
        renderResults();
      } else if (!clientDone) {
        renderGarden();
        openActionModal(clientIdx);
      } else {
        renderGarden();
      }
    });

    const scoreEl = document.getElementById('gjScore');
    if (scoreEl) scoreEl.textContent = gameState.score;
  }

  function renderResults() {
    const tier = SCORE_TIERS.find(t => gameState.score >= t.min) || SCORE_TIERS[SCORE_TIERS.length - 1];

    const state = getState();
    const gameKey = 'game_jardin_8';
    const prevBest = state[gameKey] || 0;
    const isNewBest = gameState.score > prevBest;
    if (isNewBest) {
      state[gameKey] = gameState.score;
      saveState();
    }

    if (gameState.score >= 60) addXP(gameState.score, 'games');
    if (gameState.score >= 90) triggerConfetti();

    const upsellCount = Object.values(gameState.upsellSuccess).filter(Boolean).length;
    const recoCount = Object.values(gameState.recoSuccess).filter(Boolean).length;

    const wrongTips = [];
    Object.entries(gameState.answers).forEach(([cId, answers]) => {
      answers.forEach(a => {
        if (a.quality === 'bad' || a.quality === 'medium') {
          const tip = TIPS[Math.floor(Math.random() * TIPS.length)];
          if (!wrongTips.includes(tip)) wrongTips.push(tip);
        }
      });
    });

    container.innerHTML = `
      <div class="gj-garden-bg fade-in">
        <div class="gj-results">
          <div class="gj-result-header gj-result-${tier.color}">
            <div class="gj-result-emoji">${tier.emoji}</div>
            <div class="gj-result-score-big">${gameState.score}<span>/100</span></div>
            <h2>${tier.label}</h2>
            ${isNewBest ? '<div class="gj-new-best"><i class="fas fa-arrow-up"></i> Nouveau record</div>' : ''}
          </div>

          <div class="gj-results-garden">
            <h3><i class="fas fa-seedling"></i> Votre jardin final</h3>
            <div class="gj-results-plots">
              ${CLIENTS.map(c => {
                const kpis = gameState.clientKpis[c.id];
                const avg = Math.round((kpis.adoption + kpis.satisfaction + kpis.upsell) / 3);
                const upsellOk = gameState.upsellSuccess[c.id];
                const recoOk = gameState.recoSuccess[c.id];
                return `
                  <div class="gj-result-plot" style="border-color:${c.color}">
                    <div class="gj-result-plot-plant" style="font-size:64px">${getPlantEmoji(c, kpis)}</div>
                    <div class="gj-result-plot-name" style="color:${c.color}">${c.plantName}</div>
                    <div class="gj-result-plot-client">${c.name}</div>
                    <div class="gj-result-plot-stats">
                      <div class="gj-result-stat"><span>Adoption</span><strong style="color:#10B981">${Math.round(kpis.adoption)}%</strong></div>
                      <div class="gj-result-stat"><span>Satisfaction</span><strong style="color:#3B82F6">${Math.round(kpis.satisfaction)}%</strong></div>
                      <div class="gj-result-stat"><span>Upsell</span><strong style="color:#F59E0B">${Math.round(kpis.upsell)}%</strong></div>
                    </div>
                    <div class="gj-result-plot-icons">
                      ${upsellOk ? '<span class="gj-result-badge success"><i class="fas fa-gem"></i> Upsell</span>' : '<span class="gj-result-badge fail"><i class="fas fa-times"></i> Upsell</span>'}
                      ${recoOk ? '<span class="gj-result-badge success"><i class="fas fa-star"></i> Reco</span>' : '<span class="gj-result-badge fail"><i class="fas fa-times"></i> Reco</span>'}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div class="gj-results-breakdown">
            <h3><i class="fas fa-list-check"></i> D\u00e9tail par phase</h3>
            <div class="gj-breakdown-grid">
              <div class="gj-breakdown-phase">
                <div class="gj-breakdown-phase-label"><i class="fas fa-seedling"></i> J+7 Semis</div>
                <div class="gj-breakdown-phase-score">${getPhaseScore(0)}/32</div>
              </div>
              <div class="gj-breakdown-phase">
                <div class="gj-breakdown-phase-label"><i class="fas fa-leaf"></i> J+30 Croissance</div>
                <div class="gj-breakdown-phase-score">${getPhaseScore(1)}/32</div>
              </div>
              <div class="gj-breakdown-phase">
                <div class="gj-breakdown-phase-label"><i class="fas fa-sun"></i> J+90 Upsell</div>
                <div class="gj-breakdown-phase-score">${getUpsellPhaseScore()}/32</div>
              </div>
              <div class="gj-breakdown-phase">
                <div class="gj-breakdown-phase-label"><i class="fas fa-star"></i> Recommandations</div>
                <div class="gj-breakdown-phase-score">${getRecoScore()}/36</div>
              </div>
            </div>
            <div class="gj-breakdown-summary">
              <div class="gj-breakdown-kpi"><i class="fas fa-gem"></i> ${upsellCount}/4 upsells r\u00e9ussis</div>
              <div class="gj-breakdown-kpi"><i class="fas fa-star"></i> ${recoCount}/4 recommandations obtenues</div>
            </div>
          </div>

          ${wrongTips.length > 0 ? `
          <div class="gj-results-tips">
            <h3><i class="fas fa-lightbulb"></i> Conseils du Ma\u00eetre Jardinier</h3>
            <ul>
              ${wrongTips.slice(0, 4).map(t => `<li>${t}</li>`).join('')}
            </ul>
          </div>
          ` : ''}

          <div class="gj-result-actions">
            <button class="btn btn-primary" id="gjRetry"><i class="fas fa-rotate-right"></i> Recommencer</button>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#gjRetry').addEventListener('click', () => {
      gameState = null;
      renderIntro();
    });
  }

  function getPhaseScore(phase) {
    let total = 0;
    Object.values(gameState.answers).forEach(arr => {
      arr.forEach(a => {
        if (a.phase === phase && !a.isReco) total += a.points;
      });
    });
    return total;
  }

  function getUpsellPhaseScore() {
    let total = 0;
    Object.values(gameState.answers).forEach(arr => {
      arr.forEach(a => {
        if (a.phase === 2 && !a.isReco) total += a.points;
      });
    });
    return total;
  }

  function getRecoScore() {
    let total = 0;
    Object.values(gameState.answers).forEach(arr => {
      arr.forEach(a => {
        if (a.isReco) total += a.points;
      });
    });
    return total;
  }

  renderIntro();
}
