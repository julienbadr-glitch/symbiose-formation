<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require_once __DIR__ . '/../db-config.php';

try {
    $pdo = getDB();
    $stmt = $pdo->prepare('SELECT u.first_name, u.last_name, u.email, us.state_json FROM users u LEFT JOIN user_states us ON u.email = us.email ORDER BY u.first_name');
    $stmt->execute();
    $rows = $stmt->fetchAll();

    $result = [];
    foreach ($rows as $u) {
        $state = $u['state_json'] ? json_decode($u['state_json'], true) : null;
        $xp = $state['xp'] ?? 0;
        $xpQuiz = $state['xpQuiz'] ?? 0;
        $xpGames = $state['xpGames'] ?? 0;
        $xpSimulations = $state['xpSimulations'] ?? 0;

        $first = $u['first_name'] ?? '';
        $last = $u['last_name'] ?? '';
        $initials = mb_strtoupper(mb_substr($first,0,1) . mb_substr($last,0,1));

        $result[] = [
            'name' => trim($first . ' ' . $last),
            'initials' => $initials,
            'email' => $u['email'],
            'xp' => $xp,
            'xpQuiz' => $xpQuiz,
            'xpGames' => $xpGames,
            'xpSimulations' => $xpSimulations
        ];
    }

    usort($result, function($a, $b) { return $b['xp'] - $a['xp']; });

    echo json_encode(['success' => true, 'leaderboard' => $result]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erreur serveur']);
}
