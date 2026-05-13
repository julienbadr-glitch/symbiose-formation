<?php
/**
 * login.php - SECURISE le 09/04/2026
 * Le login par email seul est DESACTIVE pour des raisons de securite.
 * Toute authentification doit passer par Google OAuth (google-auth.php).
 * 
 * Cet endpoint est conserve uniquement pour compatibilite et retourne
 * une erreur 403 avec instruction de passer par Google.
 */
require_once __DIR__.'/config.php';
require_once __DIR__ . '/rate_limit.php';
setApiHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed', 405);
}

// SECURITE: Le login par email seul est desactive
// Toutes les connexions doivent passer par Google OAuth
jsonError('Authentification par email desactivee. Veuillez utiliser la connexion Google.', 403);
