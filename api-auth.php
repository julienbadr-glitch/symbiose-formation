<?php
error_reporting(0);
ini_set('display_errors', '0');
header('Content-Type: application/json');
// Sanitize user input
function sanitize($str) { return htmlspecialchars(trim($str), ENT_QUOTES, 'UTF-8'); }

header('Access-Control-Allow-Origin: https://mercato-formation.fr');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once __DIR__ . '/db-config.php';

$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? $_GET['action'] ?? '';

try {
    $db = getDB();
    switch ($action) {
        case 'register':
            $email = trim($input['email'] ?? '');
            if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                echo json_encode(['success'=>false,'error'=>'Format email invalide']);
                exit;
            }
            $password = $input['password'] ?? '';
            $firstName = trim($input['firstName'] ?? '');
            $lastName = trim($input['lastName'] ?? '');
            if (!$email || !$password) { echo json_encode(['success'=>false,'error'=>'Email et mot de passe requis']); exit; }
            if (strlen($password) < 6) { echo json_encode(['success'=>false,'error'=>'Mot de passe trop court (min 6 caracteres)']); exit; }
            $check = $db->prepare('SELECT id FROM users WHERE email = ?');
            $check->execute([$email]);
            if ($check->fetch()) { echo json_encode(['success'=>false,'error'=>'Cet email est deja utilise']); exit; }
            $hash = password_hash($password, PASSWORD_BCRYPT);
            $stmt = $db->prepare('INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)');
            $stmt->execute([$email, $hash, $firstName, $lastName]);
            $userId = $db->lastInsertId();
            $db->prepare('INSERT INTO user_progress (user_id, xp, completed_steps, unlocked_badges, combo_streak, quiz_scores, roleplay_history) VALUES (?, 0, ?, ?, 0, ?, ?)')->execute([$userId, '[]', '[]', '{}', '{}']);
            $token = bin2hex(random_bytes(32));
            $expires = date('Y-m-d H:i:s', strtotime('+30 days'));
            $db->prepare('INSERT INTO auth_tokens (user_id, token, expires_at) VALUES (?, ?, ?)')->execute([$userId, $token, $expires]);
            echo json_encode(['success'=>true,'token'=>$token,'user'=>['id'=>$userId,'email'=>$email,'firstName'=>$firstName,'lastName'=>$lastName,'role'=>'apprenant']]);
            break;

        case 'login':
            $email = trim($input['email'] ?? '');
            if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                echo json_encode(['success'=>false,'error'=>'Format email invalide']);
                exit;
            }
            $password = $input['password'] ?? '';
            $stmt = $db->prepare('SELECT * FROM users WHERE email = ?');
            $stmt->execute([$email]);
            $user = $stmt->fetch();
            if (!$user || !password_verify($password, $user['password_hash'])) { echo json_encode(['success'=>false,'error'=>'Email ou mot de passe incorrect']); exit; }
            $token = bin2hex(random_bytes(32));
            $expires = date('Y-m-d H:i:s', strtotime('+30 days'));
            $db->prepare('INSERT INTO auth_tokens (user_id, token, expires_at) VALUES (?, ?, ?)')->execute([$user['id'], $token, $expires]);
            echo json_encode(['success'=>true,'token'=>$token,'user'=>['id'=>$user['id'],'email'=>$user['email'],'firstName'=>$user['first_name'],'lastName'=>$user['last_name'],'role'=>$user['role']]]);
            break;

        case 'verify':
            $token = $input['token'] ?? '';
            $stmt = $db->prepare('SELECT u.* FROM auth_tokens t JOIN users u ON t.user_id = u.id WHERE t.token = ? AND t.expires_at > NOW()');
            $stmt->execute([$token]);
            $user = $stmt->fetch();
            if (!$user) { echo json_encode(['success'=>false,'error'=>'Token invalide ou expire']); exit; }
            echo json_encode(['success'=>true,'user'=>['id'=>$user['id'],'email'=>$user['email'],'firstName'=>$user['first_name'],'lastName'=>$user['last_name'],'role'=>$user['role']]]);
            break;

        case 'logout':
            $token = $input['token'] ?? '';
            $db->prepare('DELETE FROM auth_tokens WHERE token = ?')->execute([$token]);
            echo json_encode(['success'=>true]);
            break;

        case 'save_progress':
            $token = $input['token'] ?? '';
            $stmt = $db->prepare('SELECT user_id FROM auth_tokens WHERE token = ? AND expires_at > NOW()');
            $stmt->execute([$token]);
            $row = $stmt->fetch();
            if (!$row) { echo json_encode(['success'=>false,'error'=>'Non authentifie']); exit; }
            $userId = $row['user_id'];
            $state = $input['state'] ?? [];
            $stmt = $db->prepare('UPDATE user_progress SET xp=?, completed_steps=?, unlocked_badges=?, combo_streak=?, quiz_scores=?, roleplay_history=? WHERE user_id=?');
            $stmt->execute([
                $state['xp'] ?? 0,
                json_encode($state['completedSteps'] ?? []),
                json_encode($state['unlockedBadges'] ?? []),
                $state['comboStreak'] ?? 0,
                json_encode($state['quizScores'] ?? new \stdClass),
                json_encode($state['roleplayHistory'] ?? new \stdClass),
                $userId
            ]);
            echo json_encode(['success'=>true]);
            break;

        case 'load_progress':
            $token = $input['token'] ?? '';
            $stmt = $db->prepare('SELECT user_id FROM auth_tokens WHERE token = ? AND expires_at > NOW()');
            $stmt->execute([$token]);
            $row = $stmt->fetch();
            if (!$row) { echo json_encode(['success'=>false,'error'=>'Non authentifie']); exit; }
            $stmt = $db->prepare('SELECT * FROM user_progress WHERE user_id = ?');
            $stmt->execute([$row['user_id']]);
            $progress = $stmt->fetch();
            if (!$progress) { echo json_encode(['success'=>true,'state'=>['xp'=>0,'completedSteps'=>[],'unlockedBadges'=>[],'comboStreak'=>0,'quizScores'=>new \stdClass,'roleplayHistory'=>new \stdClass]]); exit; }
            echo json_encode(['success'=>true,'state'=>[
                'xp'=>(int)$progress['xp'],
                'completedSteps'=>json_decode($progress['completed_steps'],true),
                'unlockedBadges'=>json_decode($progress['unlocked_badges'],true),
                'comboStreak'=>(int)$progress['combo_streak'],
                'quizScores'=>json_decode($progress['quiz_scores'],true),
                'roleplayHistory'=>json_decode($progress['roleplay_history'],true)
            ]]);
            break;

        default:
            echo json_encode(['success'=>false,'error'=>'Action inconnue']);
    }
} catch (Exception $e) {
    http_response_code(500);
    error_log('Auth error: ' . $e->getMessage());
    echo json_encode(['success'=>false,'error'=>'Erreur serveur interne']);
}
