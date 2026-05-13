<?php
require_once __DIR__.'/api/config.php';
require_once __DIR__.'/api/rate_limit.php';
error_reporting(0);
setApiHeaders();
if($_SERVER['REQUEST_METHOD']!=='POST'){http_response_code(405);echo json_encode(['error'=>'Method not allowed']);exit;}
$token=getTokenFromHeader();$user=validateToken($token);if(;user){http_response_code(401);echo json_encode(['error'=>'Unauthorized']);exit;}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['messages']) || !isset($input['scenario'])) {
    http_response_code(400); echo json_encode(['error' => 'Missing data']); exit;
}

$scenario = $input['scenario'];
$clientName = sanitizeInput($scenario['clientName'] ?? 'le prospect', 200);
$clientRole = sanitizeInput($scenario['clientRole'] ?? 'un deciseur', 200);
$clientCompany = sanitizeInput($scenario['clientCompany'] ?? 'une entreprise', 200);
$scenarioContext = sanitizeInput($scenario['context'] ?? '', 2000);
$scenarioObjective = sanitizeInput($scenario['objective'] ?? '', 2000);
$conversation = '';
foreach ($input['messages'] as $msg) {
    $role = $msg['role'] === 'user' ? 'Commercial' : 'Client';
    $conversation .= "$role: " . sanitizeInput($msg['content'] ?? '', 4000) . "\n";
}

$systemPrompt = "Tu es un coach commercial expert. Un commercial en formation s'entraine a vendre Symbiose (un ATS et outil de gestion des collaborateurs) a $clientName, $clientRole de $clientCompany.

Contexte du scenario: $scenarioContext
Objectif pedagogique: $scenarioObjective

Voici la conversation jusqu'a present:
$conversation

Le commercial est bloque et a besoin d'aide. Donne-lui UN SEUL conseil concret et actionnable (2-3 phrases max) pour sa prochaine reponse. Sois specifique au contexte de la conversation. Ne donne pas de reponse toute faite, mais guide-le.";

$apiMessages = [['role' => 'user', 'content' => 'Donne-moi un conseil pour continuer cette conversation commerciale.']];

$ch = curl_init(ANTHROPIC_API_URL);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'x-api-key: ' . ANTHROPIC_API_KEY, 'anthropic-version: 2023-06-01'],
    CURLOPT_POSTFIELDS => json_encode(['model' => 'claude-sonnet-4-20250514', 'max_tokens' => 200, 'system' => $systemPrompt, 'messages' => $apiMessages])
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) { echo json_encode(['tip' => 'Essayez de poser une question ouverte pour mieux comprendre les besoins du client.']); exit; }

$data = json_decode($response, true);
$tip = $data['content'][0]['text'] ?? 'Posez des questions ouvertes pour decouvrir les besoins.';
echo json_encode(['tip' => $tip]);
