<?php
require_once __DIR__.'/config.php';
require_once __DIR__.'/db.php';
require_once('/home/clients/b47a3b1be781d76927e33dac8ed7bd8f/private/secrets.php');

if (empty($_GET['code'])) { die('Erreur: code manquant'); }

$code = $_GET['code'];
$redirectUri = 'https://mercato-formation.fr/api/google-callback.php';

// 1. Echanger le code contre un access token
$tokenUrl = 'https://oauth2.googleapis.com/token';
$postData = [
    'code'          => $code,
    'client_id'     => GOOGLE_CLIENT_ID,
    'client_secret' => GOOGLE_CLIENT_SECRET,
    'redirect_uri'  => $redirectUri,
    'grant_type'    => 'authorization_code'
];

$ch = curl_init($tokenUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);
$tokenResp = json_decode(curl_exec($ch), true);
curl_close($ch);

if (empty($tokenResp['access_token'])) {
    die('Erreur Google: impossible d\'obtenir le token');
}

// 2. Recuperer le profil utilisateur
$ch = curl_init('https://www.googleapis.com/oauth2/v2/userinfo');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $tokenResp['access_token']]);
$userInfo = json_decode(curl_exec($ch), true);
curl_close($ch);

if (empty($userInfo['email'])) {
    die('Erreur: impossible de recuperer l\'email Google');
}

$email = strtolower(trim($userInfo['email']));

// 3. Verifier le domaine @mercato-emploi.com
$domain = substr($email, strpos($email, '@') + 1);
if ($domain !== 'mercato-emploi.com') {
    die('<!DOCTYPE html><html><body style="font-family:sans-serif;text-align:center;padding:60px"><h2>Acces refuse</h2><p>Seules les adresses @mercato-emploi.com sont autorisees.</p><a href="/login.html">Retour</a></body></html>');
}

// 4. Trouver ou creer l'utilisateur
$user = dbGetUser($email);
if (!$user) $user = findUser($email);
if (!$user) {
    // Auto-creer l'utilisateur dans la base
    $pdo = getDB();
    $firstName = $userInfo['given_name'] ?? '';
    $lastName = $userInfo['family_name'] ?? '';
    $stmt = $pdo->prepare('INSERT INTO users (email, first_name, last_name) VALUES (:e, :f, :l)');
    $stmt->execute([':e' => $email, ':f' => $firstName, ':l' => $lastName]);
    $user = ['email' => $email, 'firstName' => $firstName, 'lastName' => $lastName];
}

// 5. Generer le token d'auth
$token = generateToken($email);
$state = dbGetState($email);

// 6. Verifier admin
$pdo = getDB();
$adminStmt = $pdo->prepare('SELECT is_admin FROM users WHERE email = :e');
$adminStmt->execute([':e' => $email]);
$adminRow = $adminStmt->fetch(PDO::FETCH_ASSOC);
$isAdmin = (bool)($adminRow['is_admin'] ?? false);

// 7. Renvoyer une page HTML qui stocke en localStorage et redirige
$sessionData = json_encode([
    'email'   => $user['email'] ?? $email,
    'token'   => $token,
    'isAdmin' => $isAdmin
]);
$stateJson = $state ? json_encode($state) : 'null';
?>
<!DOCTYPE html>
<html>
<head><title>Connexion en cours...</title></head>
<body>
<p style="text-align:center;padding:60px;font-family:sans-serif">Connexion en cours...</p>
<script>
localStorage.setItem('symbiose_session', <?php echo json_encode($sessionData); ?>);
<?php if ($state): ?>
localStorage.setItem('symbiose_state', <?php echo json_encode($stateJson); ?>);
<?php endif; ?>
window.location.href = '/index.html';
</script>
</body>
</html>
