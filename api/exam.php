<?php
error_reporting(0);
ini_set('display_errors', '0');
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://mercato-formation.fr');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require_once __DIR__ . '/rate_limit.php';

// Correct answers (0-indexed option index for each question)
$ANSWERS = [1, 1, 1, 2, 2, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1];

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['answers']) || !is_array($input['answers'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request']);
    exit;
}

$userAnswers = $input['answers'];
$total = count($ANSWERS);
$correct = 0;
for ($i = 0; $i < $total; $i++) {
    if (isset($userAnswers[$i]) && (int)$userAnswers[$i] === $ANSWERS[$i]) {
        $correct++;
    }
}

$pct = round(($correct / $total) * 100);
echo json_encode([
    'correct' => $correct,
    'total' => $total,
    'pct' => $pct,
    'passed' => $pct >= 77
]);
