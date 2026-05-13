<?php
require_once __DIR__.'/config.php';
require_once('/home/clients/b47a3b1be781d76927e33dac8ed7bd8f/private/secrets.php');

$clientId = GOOGLE_CLIENT_ID;
$redirectUri = 'https://mercato-formation.fr/api/google-callback.php';
$scope = 'openid email profile';
$state = bin2hex(random_bytes(16));

$params = http_build_query([
    'client_id'     => $clientId,
    'redirect_uri'  => $redirectUri,
    'response_type' => 'code',
    'scope'         => $scope,
    'state'         => $state,
    'access_type'   => 'online',
    'prompt'        => 'select_account',
    'hd'            => 'mercato-emploi.com'
]);

header('Location: https://accounts.google.com/o/oauth2/v2/auth?' . $params);
exit;
