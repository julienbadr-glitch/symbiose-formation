<?php
require_once __DIR__ . '/api/config.php';
setApiHeaders();
if($_SERVER['REQUEST_METHOD']!=='POST'){http_response_code(405);echo json_encode(['error'=>'Method not allowed']);exit;}
$token=getTokenFromHeader();$user=validateToken($token);if(!$user){http_response_code(401);echo json_encode(['error'=>'Unauthorized']);exit;}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['messages']) || !isset($input['scenario'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing messages or scenario']);
    exit;
}

$scenario = $input['scenario'];
$scenario['clientName'] = sanitizeInput($scenario['clientName'] ?? '', 200);
$scenario['clientRole'] = sanitizeInput($scenario['clientRole'] ?? '', 200);
$scenario['clientCompany'] = sanitizeInput($scenario['clientCompany'] ?? '', 200);
$scenario['context'] = sanitizeInput($scenario['context'] ?? '', 2000);
$scenario['objective'] = sanitizeInput($scenario['objective'] ?? '', 500);
$messages = sanitizeMessages($input['messages'] ?? [], 50);
$difficulty = isset($input['difficulty']) ? $input['difficulty'] : 'debutant';
$turnCount = isset($input['turnCount']) ? intval($input['turnCount']) : 5;

$systemPrompt = "Tu es un EVALUATEUR EXPERT en techniques de vente et formation commerciale pour le reseau Symbiose / Mercato de l'Emploi.

Tu dois evaluer la performance d'un commercial en formation qui vient de realiser un jeu de role de simulation de vente.

CONTEXTE DU SCENARIO :
- Client simule : {$scenario['clientName']}, {$scenario['clientRole']} chez {$scenario['clientCompany']}
- Contexte : {$scenario['context']}
- Objectif du commercial : {$scenario['objective']}
- Niveau de difficulte : {$difficulty}
- Nombre de tours joues : {$turnCount}

Tu dois analyser l'echange et fournir une evaluation STRUCTUREE au format JSON strict suivant :
{
  \"score\": <nombre entre 0 et 100>,
  \"xpEarned\": <nombre entre 5 et 50>,
  \"grade\": \"<A, B, C, D ou E>\",
  \"summary\": \"<resume en 1-2 phrases de la performance globale>\",
  \"strengths\": [\"<point fort 1>\", \"<point fort 2>\", \"<point fort 3>\"],
  \"improvements\": [\"<axe d'amelioration 1>\", \"<axe d'amelioration 2>\", \"<axe d'amelioration 3>\"],
  \"tip\": \"<un conseil concret et actionnable pour la prochaine fois>\"
}

BAREME DE NOTATION :
- 80-100 (Grade A) : Excellent - Le commercial maitrise parfaitement l'echange, pose les bonnes questions, ecoute active, propose des solutions pertinentes
- 60-79 (Grade B) : Bien - Bonne prestation avec quelques axes d'amelioration
- 40-59 (Grade C) : Moyen - Des bases mais manque de technique ou de structure
- 20-39 (Grade D) : Insuffisant - Beaucoup d'erreurs, manque de preparation
- 0-19 (Grade E) : Tres insuffisant - Comportement inapproprie ou totalement hors sujet

CALCUL DES XP :
- Grade A : 40-50 XP
- Grade B : 30-39 XP
- Grade C : 20-29 XP
- Grade D : 10-19 XP
- Grade E : 5-9 XP

CRITERES D'EVALUATION :
1. Qualite de l'ecoute active (reformulation, questions ouvertes)
2. Identification des besoins et douleurs du client
3. Pertinence des arguments et propositions
4. Structure de l'entretien (introduction, decouverte, argumentation)
5. Professionnalisme et politesse
6. Capacite a gerer les objections
7. Proposition de prochaine etape concrete

IMPORTANT : Reponds UNIQUEMENT avec le JSON, sans texte avant ou apres. Sois juste mais bienveillant dans ton evaluation. Adapte ton exigence au niveau de difficulte.";

$apiMessages = [];
foreach ($messages as $m) {
    $role = ($m['role'] === 'bot') ? 'user' : 'assistant';
    $prefix = ($m['role'] === 'bot') ? "[CLIENT] " : "[COMMERCIAL] ";
    $content = isset($m['text']) ? $m['text'] : (isset($m['content']) ? $m['content'] : '');
    $apiMessages[] = ['role' => 'user', 'content' => $prefix . $content];
}
$apiMessages[] = ['role' => 'user', 'content' => 'Maintenant, evalue cette conversation commerciale. Reponds UNIQUEMENT en JSON valide.'];

$data = [
    'model' => 'claude-sonnet-4-20250514',
    'max_tokens' => 1024,
    'system' => $systemPrompt,
    'messages' => $apiMessages
];

$ch = curl_init('https://api.anthropic.com/v1/messages');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'x-api-key: ' . ANTHROPIC_API_KEY,
        'anthropic-version: 2023-06-01'
    ],
    CURLOPT_POSTFIELDS => json_encode($data),
    CURLOPT_TIMEOUT => 30
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    http_response_code(502);
    echo json_encode(['error' => 'API error', 'status' => $httpCode]);
    exit;
}

$result = json_decode($response, true);
$text = $result['content'][0]['text'] ?? '';

$jsonStart = strpos($text, '{');
$jsonEnd = strrpos($text, '}');
if ($jsonStart !== false && $jsonEnd !== false) {
    $jsonStr = substr($text, $jsonStart, $jsonEnd - $jsonStart + 1);
    $evaluation = json_decode($jsonStr, true);
    if ($evaluation) {
        echo json_encode(['evaluation' => $evaluation]);
    } else {
        echo json_encode(['evaluation' => [
            'score' => 50,
            'xpEarned' => 20,
            'grade' => 'C',
            'summary' => 'Evaluation en cours de traitement.',
            'strengths' => ['Participation active'],
            'improvements' => ['Continuer a pratiquer'],
            'tip' => 'Essayez de poser plus de questions ouvertes.'
        ]]);
    }
} else {
    echo json_encode(['evaluation' => [
        'score' => 50,
        'xpEarned' => 20,
        'grade' => 'C',
        'summary' => 'Evaluation en cours de traitement.',
        'strengths' => ['Participation active'],
        'improvements' => ['Continuer a pratiquer'],
        'tip' => 'Essayez de poser plus de questions ouvertes.'
    ]]);
}
