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
$messages = sanitizeMessages($input['messages'] ?? [], 50);
$difficulty = isset($input['difficulty']) ? $input['difficulty'] : 'debutant';

$systemPrompt = "Tu es un COACH COMMERCIAL expert qui aide un stagiaire en formation a trouver la meilleure reponse possible dans une simulation de vente.

Le stagiaire est en conversation avec {$scenario['clientName']}, {$scenario['clientRole']} chez {$scenario['clientCompany']}.
Contexte : {$scenario['context']}
Niveau de difficulte : {$difficulty}

Le stagiaire vend la solution Symbiose, un ATS (logiciel de suivi des candidatures pour le recrutement) et un outil de gestion des collaborateurs. Ce n est PAS un CRM. Symbiose aide les entreprises a mieux recruter et gerer leurs equipes.

INSTRUCTIONS :
- Analyse la conversation en cours entre le stagiaire (user) et le client (assistant)
- Propose LA MEILLEURE reponse que le stagiaire devrait donner au client
- La reponse doit etre professionnelle, persuasive et adaptee au contexte
- Elle doit repondre aux objections ou preoccupations du client
- Elle doit faire avancer la vente vers l objectif
- Ecris UNIQUEMENT la reponse suggeree, sans explication ni commentaire
- La reponse doit etre naturelle et courte (2-4 phrases), comme dans une vraie conversation
- Vouvoie toujours le client";

$apiMessages = [];
foreach ($messages as $msg) {
    $role = ($msg['role'] === 'user') ? 'user' : 'assistant';
    $apiMessages[] = ['role' => $role, 'content' => $msg['content']];
}

// Add the coaching request
$apiMessages[] = ['role' => 'user', 'content' => 'Quelle est la meilleure reponse que je devrais donner maintenant au client ?'];

$payload = [
    'model' => 'claude-sonnet-4-20250514',
    'max_tokens' => 512,
    'system' => $systemPrompt,
    'messages' => $apiMessages
];

$ch = curl_init('https://api.anthropic.com/v1/messages');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'x-api-key: ' . ANTHROPIC_API_KEY,
        'anthropic-version: 2023-06-01'
    ],
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 30
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    http_response_code($httpCode);
    echo json_encode(['error' => 'API error', 'details' => json_decode($response, true), 'httpCode' => $httpCode]);
    exit;
}

$data = json_decode($response, true);
$suggestion = '';
if (isset($data['content']) && is_array($data['content'])) {
    foreach ($data['content'] as $block) {
        if ($block['type'] === 'text') {
            $suggestion .= $block['text'];
        }
    }
}

echo json_encode(['suggestion' => $suggestion]);
