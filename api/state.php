<?php
require_once __DIR__.'/config.php';
require_once __DIR__ . '/rate_limit.php';
require_once __DIR__.'/db.php';
setApiHeaders();
$token=getTokenFromHeader();
$rawBody=file_get_contents('php://input');
$input=json_decode($rawBody,true);
if(!$token&&$_SERVER['REQUEST_METHOD']==='POST'&&$input&&isset($input['_token']))$token=$input['_token'];
if(!$token)jsonError('Token manquant',401);
$user=validateToken($token);
if(!$user)jsonError('Token invalide',401);

$email=strtolower($user['email']);

if($_SERVER['REQUEST_METHOD']==='GET'){
    $s=dbGetState($email);
    jsonResponse(['success'=>true,'state'=>$s,'user'=>['email'=>$user['email'],'firstName'=>$user['firstName'],'lastName'=>$user['lastName']]]);
}

if($_SERVER['REQUEST_METHOD']==='POST'){
    if($input&&isset($input['_action'])&&$input['_action']==='restore'){$s=dbGetState($email);jsonResponse(['success'=>true,'state'=>$s,'user'=>['email'=>$user['email'],'firstName'=>$user['firstName'],'lastName'=>$user['lastName']]]);}
    if(!$input||!isset($input['state']))jsonError('State requis');
    $s=$input['state'];

    // --- PROTECTION ANTI-ECRASEMENT ---
    $existing = dbGetState($email);
    if ($existing) {
        $exXP    = isset($existing['xp']) ? (int)$existing['xp'] : 0;
        $newXP   = isset($s['xp']) ? (int)$s['xp'] : 0;
        $exSteps = isset($existing['completedSteps']) && is_array($existing['completedSteps']) ? count($existing['completedSteps']) : 0;
        $newSteps= isset($s['completedSteps']) && is_array($s['completedSteps']) ? count($s['completedSteps']) : 0;
        $exBadges= isset($existing['badges']) && is_array($existing['badges']) ? count($existing['badges']) : 0;
        $newBadges=isset($s['badges']) && is_array($s['badges']) ? count($s['badges']) : 0;
        $exExam  = !empty($existing['examPassed']);
        $newExam = !empty($s['examPassed']);

        // Rejeter si le nouveau state est clairement degrade
        if ($exXP > 0 && $newXP < $exXP && $newSteps < $exSteps) {
            jsonResponse(['success'=>false,'message'=>'Save rejected: would overwrite better progress','existing_xp'=>$exXP,'new_xp'=>$newXP], 409);
        }
        // Ne jamais perdre examPassed
        if ($exExam && !$newExam) {
            $s['examPassed'] = true;
        }
        // Ne jamais perdre des completedSteps
        if ($exSteps > $newSteps) {
            $merged = array_values(array_unique(array_merge($existing['completedSteps'], $s['completedSteps'] ?? [])));
            $s['completedSteps'] = $merged;
        }
        // Ne jamais perdre des badges
        if ($exBadges > $newBadges) {
            $merged = array_values(array_unique(array_merge($existing['badges'], $s['badges'] ?? [])));
            $s['badges'] = $merged;
        }
        // Garder le XP le plus haut
        if ($exXP > $newXP) {
            $s['xp'] = $exXP;
        }
    }
    // --- FIN PROTECTION ---

    $s['_lastSaved']=date('c');
    $s['_email']=$email;
    $json=json_encode($s,JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE);
    $ok=dbSaveState(getDB(),$email,$json,$s['_lastSaved']);
    if(!$ok)jsonError('Erreur sauvegarde',500);
    jsonResponse(['success'=>true,'message'=>'OK','savedAt'=>$s['_lastSaved']]);
}

jsonError('Method not allowed',405);
