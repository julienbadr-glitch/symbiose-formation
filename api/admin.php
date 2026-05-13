<?php
/**
 * Admin API for Symbiose Formation
 * Requires admin authentication
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

setApiHeaders();

// Verify admin token
$user = validateToken(getTokenFromHeader());
if (!$user) {
    jsonError('Non autorise', 401);
}

// Check admin flag
$pdo = getDB();
$stmt = $pdo->prepare('SELECT is_admin FROM users WHERE email = :e');
$stmt->execute([':e' => strtolower($user['email'])]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$row || !$row['is_admin']) {
    jsonError('Acces admin requis', 403);
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {

    case 'dashboard':
        // Get all users with their progress summary
        $users = $pdo->query('SELECT u.email, u.first_name, u.last_name, u.is_admin, u.created_at,
            us.state_json, us.last_saved
            FROM users u LEFT JOIN user_states us ON u.email = us.email
            ORDER BY u.last_name ASC')->fetchAll(PDO::FETCH_ASSOC);

        $totalSteps = 8; // 8 modules in the training
        $result = [];
        $totalXp = 0;
        $totalProgress = 0;
        $activeUsers = 0;
        $completedFormation = 0;
        $passedExam = 0;

        foreach ($users as $u) {
            $state = $u['state_json'] ? json_decode($u['state_json'], true) : null;
            $xp = $state['xp'] ?? 0;
            $completedSteps = $state['completedSteps'] ?? [];
            $badges = $state['unlockedBadges'] ?? [];
            $examPassed = $state['examPassed'] ?? false;
            $examScore = $state['examScore'] ?? null;
            $xpQuiz = $state['xpQuiz'] ?? 0;
            $xpGames = $state['xpGames'] ?? 0;
            $xpSimulations = $state['xpSimulations'] ?? 0;
            $quizAnswered = $state['quizAnswered'] ?? [];
            $comboStreak = $state['comboStreak'] ?? 0;
            $lastSaved = $state['_lastSaved'] ?? $u['last_saved'] ?? null;

            $stepsCompleted = is_array($completedSteps) ? count($completedSteps) : 0;
            $progress = $totalSteps > 0 ? round(($stepsCompleted / $totalSteps) * 100) : 0;

            if ($state) {
                $activeUsers++;
                $totalXp += $xp;
                $totalProgress += $progress;
                if ($progress >= 100) { $completedFormation++; }
                if ($examPassed) { $passedExam++; }
            }

            $result[] = [
                'email' => $u['email'],
                'firstName' => $u['first_name'],
                'lastName' => $u['last_name'],
                'isAdmin' => (bool)$u['is_admin'],
                'createdAt' => $u['created_at'],
                'xp' => $xp,
                'xpQuiz' => $xpQuiz,
                'xpGames' => $xpGames,
                'xpSimulations' => $xpSimulations,
                'completedSteps' => $stepsCompleted,
                'totalSteps' => $totalSteps,
                'progress' => $progress,
                'badges' => $badges,
                'badgeCount' => is_array($badges) ? count($badges) : 0,
                'quizAnswered' => is_array($quizAnswered) ? count($quizAnswered) : 0,
                'comboStreak' => $comboStreak,
                'examPassed' => $examPassed,
                'examScore' => $examScore,
                'lastActivity' => $lastSaved,
                'hasStarted' => $state !== null
            ];
        }

        $avgXp = $activeUsers > 0 ? round($totalXp / $activeUsers) : 0;
        $avgProgress = $activeUsers > 0 ? round($totalProgress / $activeUsers) : 0;

        jsonResponse([
            'stats' => [
                'totalUsers' => count($users),
                'activeUsers' => $activeUsers,
                'avgXp' => $avgXp,
                'avgProgress' => $avgProgress,
                'completedFormation' => $completedFormation,
                'passedExam' => $passedExam
            ],
            'users' => $result
        ]);
        break;

    case 'user-detail':
        $email = $_GET['email'] ?? '';
        if (!$email) jsonError('Email requis', 400);

        $stmt = $pdo->prepare('SELECT u.*, us.state_json, us.last_saved FROM users u LEFT JOIN user_states us ON u.email = us.email WHERE u.email = :e');
        $stmt->execute([':e' => strtolower($email)]);
        $u = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$u) jsonError('Utilisateur non trouve', 404);

        $state = $u['state_json'] ? json_decode($u['state_json'], true) : null;
        jsonResponse([
            'email' => $u['email'],
            'firstName' => $u['first_name'],
            'lastName' => $u['last_name'],
            'isAdmin' => (bool)$u['is_admin'],
            'createdAt' => $u['created_at'],
            'lastSaved' => $u['last_saved'],
            'state' => $state
        ]);
        break;

    case 'add-user':
        if ($method !== 'POST') jsonError('POST requis', 405);
        $input = json_decode(file_get_contents('php://input'), true);
        $email = strtolower(trim($input['email'] ?? ''));
        $firstName = trim($input['firstName'] ?? '');
        $lastName = trim($input['lastName'] ?? '');

        if (!$email || !$firstName || !$lastName) {
            jsonError('Email, prenom et nom requis', 400);
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            jsonError('Email invalide', 400);
        }

        // Check if already exists
        $check = $pdo->prepare('SELECT email FROM users WHERE email = :e');
        $check->execute([':e' => $email]);
        if ($check->fetch()) {
            jsonError('Cet utilisateur existe deja', 409);
        }

        $stmt = $pdo->prepare('INSERT INTO users (email, first_name, last_name, is_admin) VALUES (:e, :f, :l, 0)');
        $stmt->execute([':e' => $email, ':f' => $firstName, ':l' => $lastName]);

        jsonResponse(['success' => true, 'message' => 'Utilisateur ajoute']);
        break;

    case 'remove-user':
        if ($method !== 'POST') jsonError('POST requis', 405);
        $input = json_decode(file_get_contents('php://input'), true);
        $email = strtolower(trim($input['email'] ?? ''));

        if (!$email) jsonError('Email requis', 400);
        if ($email === strtolower($user['email'])) {
            jsonError('Impossible de supprimer votre propre compte', 400);
        }

        $pdo->prepare('DELETE FROM user_states WHERE email = :e')->execute([':e' => $email]);
        $pdo->prepare('DELETE FROM users WHERE email = :e')->execute([':e' => $email]);

        jsonResponse(['success' => true, 'message' => 'Utilisateur supprime']);
        break;

    case 'reset-progress':
        if ($method !== 'POST') jsonError('POST requis', 405);
        $input = json_decode(file_get_contents('php://input'), true);
        $email = strtolower(trim($input['email'] ?? ''));

        if (!$email) jsonError('Email requis', 400);

        $pdo->prepare('DELETE FROM user_states WHERE email = :e')->execute([':e' => $email]);

        jsonResponse(['success' => true, 'message' => 'Progression reintialisee']);
        break;

    default:
        jsonError('Action non reconnue', 400);
}
