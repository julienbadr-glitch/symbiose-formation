#!/usr/bin/env python3
"""
Script pour enrichir le Module 1 (Découverte Client & Douleurs RH)
de la formation Symbiose sur mercato-formation.fr
- Enrichit la section théorie (cours) avec contenu aligné sur la vidéo
- Optimise les 10 questions de quiz (supprime doublons, améliore pertinence)
"""
import re, shutil

# Backup
shutil.copy('data.js', 'data.js.bak2')

with open('data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# ============================================================
# 1. NOUVELLE SECTION THEORIE (COURS) ENRICHIE
# ============================================================
# On remplace tout le bloc "cours:" du module 1
# Le cours actuel va de "cours: [" jusqu'au "]" fermant avant "script:"

new_cours = r'''cours: [
            {
                title: 'Les 7 douleurs RH des PME',
                icon: 'fa-heart-crack',
                body: `<p>Symbiose a \u00e9t\u00e9 cr\u00e9\u00e9e pour r\u00e9pondre aux besoins concrets des entreprises fran\u00e7aises. Chaque prospect est soumis \u00e0 <strong>une \u00e0 sept douleurs RH majeures</strong> qui d\u00e9terminent l\u2019achat de nos solutions\u00a0:</p>
                <ol>
                <li><strong>Surcharge administrative</strong> \u2014 Les dirigeants de PME consacrent jusqu\u2019\u00e0 <em>40\u00a0% de leur temps</em> aux t\u00e2ches RH manuelles (paie, cong\u00e9s, documents).</li>
                <li><strong>Turnover subi</strong> \u2014 D\u00e9parts non anticip\u00e9s faute d\u2019indicateurs de satisfaction et d\u2019engagement.</li>
                <li><strong>Entretiens non r\u00e9alis\u00e9s</strong> \u2014 <em>60\u00a0% des PME</em> ne r\u00e9alisent pas leurs entretiens professionnels obligatoires, s\u2019exposant \u00e0 des sanctions.</li>
                <li><strong>Cong\u00e9s mal g\u00e9r\u00e9s</strong> \u2014 Suivi par e-mail ou Excel, source d\u2019erreurs et de conflits.</li>
                <li><strong>Non-conformit\u00e9 l\u00e9gale</strong> \u2014 DUERP, registres obligatoires, affichages\u2026 autant de risques en cas de contr\u00f4le.</li>
                <li><strong>Recrutement d\u00e9sorganis\u00e9</strong> \u2014 Absence de pipeline structur\u00e9, CV \u00e9parpill\u00e9s, pas de suivi candidat.</li>
                <li><strong>Manque de visibilit\u00e9 RH</strong> \u2014 Aucun tableau de bord centralis\u00e9 pour piloter le capital humain.</li>
                </ol>
                <div class="hbox blue"><strong>Astuce terrain\u00a0:</strong> \u00ab\u00a0Identifiez d\u00e8s les premi\u00e8res minutes d\u2019\u00e9change la ou les douleurs dominantes de votre prospect. C\u2019est elles qui d\u00e9clencheront la d\u00e9cision d\u2019achat.\u00a0\u00bb</div>`
            },
            {
                title: 'Les 3 piliers de Symbiose',
                icon: 'fa-cubes',
                body: `<p>Comme pr\u00e9sent\u00e9 dans la vid\u00e9o, Symbiose repose sur <strong>trois grands modules</strong> compl\u00e9mentaires\u00a0:</p>
                <ol>
                <li><strong>Le module Essentiel (Collaborateur)</strong> \u2014 Vision globale de l\u2019\u00e9quipe, tra\u00e7abilit\u00e9 des donn\u00e9es collaborateurs, centralisation RH. Chaque salari\u00e9 dispose de son propre espace pour poser ses cong\u00e9s, consulter ses soldes et pr\u00e9parer ses entretiens.</li>
                <li><strong>Le module Recrutement (ATS)</strong> \u2014 Pipeline visuel de suivi des candidatures, multidiffusion des offres, CVth\u00e8que int\u00e9gr\u00e9e. R\u00e9duit le temps de recrutement de 40\u00a0%.</li>
                <li><strong>Le module Conformit\u00e9</strong> \u2014 Gestion des entretiens obligatoires, DUERP, registres l\u00e9gaux et alertes automatiques.</li>
                </ol>
                <div class="hbox green"><strong>Le Barom\u00e8tre Humeur\u00a0:</strong> Outil int\u00e9gr\u00e9 au module Essentiel, il alerte en temps r\u00e9el lorsqu\u2019un collaborateur d\u00e9croche, permettant au manager d\u2019agir avant qu\u2019il ne soit trop tard.</div>`
            },
            {
                title: 'Framework QQOQCP enrichi',
                icon: 'fa-clipboard-list',
                body: `<p>Le <strong>QQOQCP</strong> est votre grille syst\u00e9matique pour structurer chaque entretien de d\u00e9couverte\u00a0:</p>
                <table class="table-styled">
                <tr><td><strong>Q</strong>ui</td><td>Qui g\u00e8re les RH\u00a0? Un DRH, le dirigeant, un cabinet externe\u00a0?</td></tr>
                <tr><td><strong>Q</strong>uoi</td><td>Quels processus sont en place\u00a0? Recrutement, onboarding, entretiens\u00a0?</td></tr>
                <tr><td><strong>O</strong>\u00f9</td><td>Combien de sites\u00a0? T\u00e9l\u00e9travail\u00a0? Multi-\u00e9tablissements\u00a0?</td></tr>
                <tr><td><strong>Q</strong>uand</td><td>Depuis quand ces probl\u00e8mes existent\u00a0? Quelle urgence\u00a0?</td></tr>
                <tr><td><strong>C</strong>omment</td><td>Quels outils aujourd\u2019hui\u00a0? Excel, papier, logiciel\u00a0?</td></tr>
                <tr><td><strong>P</strong>ourquoi</td><td>Pourquoi changer maintenant\u00a0? Quel \u00e9l\u00e9ment d\u00e9clencheur\u00a0?</td></tr>
                </table>
                <div class="hbox blue"><strong>R\u00e8gle d\u2019or\u00a0:</strong> Posez des questions ouvertes (\u00ab\u00a0Comment g\u00e9rez-vous\u2026\u00a0\u00bb) plut\u00f4t que ferm\u00e9es (\u00ab\u00a0Avez-vous un outil\u00a0?\u00a0\u00bb). Cela r\u00e9v\u00e8le les vrais besoins.</div>`
            },
            {
                title: 'Checklist de qualification',
                icon: 'fa-check-double',
                body: `<p>Avant de proposer quoi que ce soit, assurez-vous d\u2019avoir identifi\u00e9 ces <strong>5 \u00e9l\u00e9ments cl\u00e9s</strong>\u00a0:</p>
                <ol>
                <li>\u2705 <strong>Nombre de salari\u00e9s</strong> et structure de l\u2019entreprise (croissance, multi-sites)</li>
                <li>\u2705 <strong>Outils actuels</strong> utilis\u00e9s pour la gestion RH (Excel, papier, logiciel concurrent)</li>
                <li>\u2705 <strong>Douleur(s) principale(s)</strong> parmi les 7 identifi\u00e9es</li>
                <li>\u2705 <strong>D\u00e9cideur et circuit de d\u00e9cision</strong> (qui signe, quel budget)</li>
                <li>\u2705 <strong>\u00c9l\u00e9ment d\u00e9clencheur</strong> du besoin actuel (contr\u00f4le URSSAF, d\u00e9part cl\u00e9, croissance\u2026)</li>
                </ol>
                <div class="hbox green"><strong>Conseil\u00a0:</strong> Si vous avez identifi\u00e9 au moins 2 douleurs et l\u2019\u00e9l\u00e9ment d\u00e9clencheur, vous \u00eates en bonne position pour proposer une d\u00e9mo Symbiose de 30 minutes.</div>`
            }
        ]'''

# ============================================================
# 2. NOUVEAU QUIZ OPTIMISE (10 questions, sans doublons)
# ============================================================

new_quiz = r'''quiz: [
            {
                question: 'Combien de douleurs RH principales la formation Symbiose identifie-t-elle pour les PME\u00a0?',
                options: ['5', '6', '7', '8'],
                correct: 2,
                feedback: 'Symbiose identifie 7 douleurs RH cl\u00e9s\u00a0: surcharge admin, turnover, entretiens non r\u00e9alis\u00e9s, cong\u00e9s mal g\u00e9r\u00e9s, non-conformit\u00e9, recrutement d\u00e9sorganis\u00e9, manque de visibilit\u00e9 RH.'
            },
            {
                question: 'Quel pourcentage de leur temps les dirigeants de PME consacrent-ils aux t\u00e2ches administratives RH\u00a0?',
                options: ['20\u00a0%', '30\u00a0%', '40\u00a0%', '50\u00a0%'],
                correct: 2,
                feedback: 'Les dirigeants de PME consacrent jusqu\u2019\u00e0 40\u00a0% de leur temps aux t\u00e2ches RH manuelles \u2014 c\u2019est l\u2019argument choc de la surcharge administrative.'
            },
            {
                question: 'Quel pourcentage de PME ne r\u00e9alise pas ses entretiens professionnels obligatoires\u00a0?',
                options: ['40\u00a0%', '50\u00a0%', '60\u00a0%', '70\u00a0%'],
                correct: 2,
                feedback: '60\u00a0% des PME ne r\u00e9alisent pas leurs entretiens obligatoires, ce qui les expose \u00e0 des sanctions financi\u00e8res.'
            },
            {
                question: 'Quelle question ouverte permet le mieux de d\u00e9tecter un besoin en ATS (recrutement)\u00a0?',
                options: ['Comment g\u00e9rez-vous vos recrutements aujourd\u2019hui\u00a0?', 'Avez-vous un logiciel de recrutement\u00a0?', 'Combien recrutez-vous par an\u00a0?', 'Utilisez-vous un jobboard\u00a0?'],
                correct: 0,
                feedback: 'La question ouverte \u00ab\u00a0Comment g\u00e9rez-vous vos recrutements aujourd\u2019hui\u00a0?\u00a0\u00bb r\u00e9v\u00e8le les vrais besoins sans orienter la r\u00e9ponse.'
            },
            {
                question: 'Quels sont les trois grands modules de Symbiose\u00a0?',
                options: ['Essentiel, Recrutement (ATS), Conformit\u00e9', 'Paie, Cong\u00e9s, Formation', 'Admin, Commercial, Support', 'RH, Finance, Juridique'],
                correct: 0,
                feedback: 'Symbiose repose sur 3 piliers\u00a0: le module Essentiel (collaborateur), le module Recrutement (ATS) et le module Conformit\u00e9.'
            },
            {
                question: 'Quel outil Symbiose alerte en temps r\u00e9el quand un collaborateur d\u00e9croche\u00a0?',
                options: ['Le Dashboard Admin', 'Le Barom\u00e8tre Humeur', 'L\u2019ATS', 'Le module Cong\u00e9s'],
                correct: 1,
                feedback: 'Le Barom\u00e8tre Humeur de Symbiose alerte en temps r\u00e9el sur le d\u00e9sengagement, permettant d\u2019agir avant un d\u00e9part.'
            },
            {
                question: 'Que signifie le framework QQOQCP utilis\u00e9 en d\u00e9couverte client\u00a0?',
                options: ['Qui, Quoi, O\u00f9, Quand, Comment, Pourquoi', 'Qualit\u00e9, Quantit\u00e9, Objectif, Question, Co\u00fbt, Performance', 'Question, Qualification, Offre, Quota, Closing, Proposition', 'Qui, Quoi, Organisation, Qualification, Conseil, Projet'],
                correct: 0,
                feedback: 'QQOQCP signifie Qui, Quoi, O\u00f9, Quand, Comment, Pourquoi \u2014 votre grille syst\u00e9matique d\u2019entretien de d\u00e9couverte.'
            },
            {
                question: 'Quel module Symbiose r\u00e9pond sp\u00e9cifiquement au d\u00e9sengagement des collaborateurs\u00a0?',
                options: ['Le module Recrutement', 'Le module Conformit\u00e9', 'Le module Essentiel (Univers Collaborateur)', 'Le module Formation'],
                correct: 2,
                feedback: 'Le module Essentiel avec l\u2019Univers Collaborateur centralise les donn\u00e9es, offre un espace personnel \u00e0 chaque salari\u00e9 et int\u00e8gre le Barom\u00e8tre Humeur.'
            },
            {
                question: 'Parmi ces \u00e9l\u00e9ments, lequel fait partie de la checklist de qualification\u00a0?',
                options: ['Le chiffre d\u2019affaires du prospect', 'L\u2019\u00e9l\u00e9ment d\u00e9clencheur du besoin', 'Le nombre de clients du prospect', 'La date de cr\u00e9ation de l\u2019entreprise'],
                correct: 1,
                feedback: 'L\u2019\u00e9l\u00e9ment d\u00e9clencheur (contr\u00f4le URSSAF, d\u00e9part cl\u00e9, croissance\u2026) est l\u2019un des 5 \u00e9l\u00e9ments cl\u00e9s \u00e0 identifier avant de proposer une d\u00e9mo.'
            },
            {
                question: 'De combien l\u2019ATS Symbiose r\u00e9duit-il le temps de recrutement selon l\u2019argument terrain\u00a0?',
                options: ['20\u00a0%', '30\u00a0%', '40\u00a0%', '50\u00a0%'],
                correct: 2,
                feedback: 'L\u2019ATS Symbiose r\u00e9duit le temps de recrutement de 40\u00a0% gr\u00e2ce au pipeline visuel, \u00e0 la multidiffusion et \u00e0 l\u2019IA qui r\u00e9dige les offres en 30 secondes.'
            }
        ]'''

# ============================================================
# 3. APPLIQUER LES MODIFICATIONS
# ============================================================

# Find the Module 1 block (id: 1)
# Strategy: find "cours: [" after the Module 1 header, replace up to the matching "]"
# Then find "quiz: [" and replace up to the matching "]"

lines = content.split('\n')

# Find the cours section of module 1
# Module 1 starts around line 52 (id: 1)
# We need to find the "cours: [" line and its closing "]"
in_module1 = False
cours_start = None
cours_end = None
quiz_start = None
quiz_end = None
bracket_depth = 0
looking_for = 'module1'

for i, line in enumerate(lines):
    stripped = line.strip()

    # Find Module 1 start
    if looking_for == 'module1' and 'id: 1,' == stripped:
        in_module1 = True
        looking_for = 'cours'
        continue

    # Find Module 2 start (to know where Module 1 ends)
    if in_module1 and 'id: 2,' == stripped:
        in_module1 = False
        break

    if not in_module1:
        continue

    # Find cours start
    if looking_for == 'cours' and stripped.startswith('cours:'):
        cours_start = i
        bracket_depth = 0
        for ch in line:
            if ch == '[':
                bracket_depth += 1
        looking_for = 'cours_end'
        continue

    # Find cours end
    if looking_for == 'cours_end':
        for ch in stripped:
            if ch == '[':
                bracket_depth += 1
            elif ch == ']':
                bracket_depth -= 1
        if bracket_depth <= 0:
            cours_end = i
            looking_for = 'quiz'
            continue

    # Find quiz start
    if looking_for == 'quiz' and stripped.startswith('quiz:'):
        quiz_start = i
        bracket_depth = 0
        for ch in line:
            if ch == '[':
                bracket_depth += 1
        looking_for = 'quiz_end'
        continue

    # Find quiz end
    if looking_for == 'quiz_end':
        for ch in stripped:
            if ch == '[':
                bracket_depth += 1
            elif ch == ']':
                bracket_depth -= 1
        if bracket_depth <= 0:
            quiz_end = i
            break

print(f"cours: lines {cours_start+1} to {cours_end+1}")
print(f"quiz: lines {quiz_start+1} to {quiz_end+1}")

if cours_start is None or cours_end is None or quiz_start is None or quiz_end is None:
    print("ERROR: Could not find all sections!")
    exit(1)

# Build the new content
indent = '        '  # 8 spaces for alignment
new_lines = []
new_lines.extend(lines[:cours_start])  # Everything before cours
new_lines.append(indent + new_cours.strip())
new_lines.extend(lines[cours_end+1:quiz_start])  # Between cours and quiz
new_lines.append(indent + new_quiz.strip())
new_lines.extend(lines[quiz_end+1:])  # Everything after quiz

new_content = '\n'.join(new_lines)

with open('data.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("SUCCESS: data.js updated with enriched Module 1 content!")
print(f"  - Cours: 4 sections (was 3)")
print(f"  - Quiz: 10 questions optimized (no duplicates)")
