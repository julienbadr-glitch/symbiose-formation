<?php
require_once __DIR__.'/config.php';
require_once __DIR__.'/db.php';
setApiHeaders();
if($_SERVER['REQUEST_METHOD']!=='POST') jsonError('Method not allowed',405);
$input=json_decode(file_get_contents('php://input'),true);
if(!$input||empty($input['email'])||empty($input['firstname'])||empty($input['lastname'])) jsonError('Donnees Spider incompletes');
$email=strtolower(trim($input['email']));
$firstName=trim($input['firstname']);
$lastName=trim($input['lastname']);
$profilePicture=isset($input['profilePicture'])?trim($input['profilePicture']):null;
$pdo=getDB();
$stmt=$pdo->prepare('SELECT email FROM users WHERE email=:e');
$stmt->execute([':e'=>$email]);
$exists=$stmt->fetch();
if($exists){
    $stmt=$pdo->prepare('UPDATE users SET first_name=:f,last_name=:l,profile_picture=:p WHERE email=:e');
    $stmt->execute([':f'=>$firstName,':l'=>$lastName,':p'=>$profilePicture,':e'=>$email]);
}else{
    $stmt=$pdo->prepare('INSERT INTO users(email,first_name,last_name,profile_picture) VALUES(:e,:f,:l,:p)');
    $stmt->execute([':e'=>$email,':f'=>$firstName,':l'=>$lastName,':p'=>$profilePicture]);
}
$token=generateToken($email);
$state=dbGetState($email);
$adminStmt=$pdo->prepare('SELECT is_admin FROM users WHERE email=:e');
$adminStmt->execute([':e'=>$email]);
$adminRow=$adminStmt->fetch(PDO::FETCH_ASSOC);
$isAdmin=(bool)($adminRow['is_admin']??false);
jsonResponse(['success'=>true,'token'=>$token,'user'=>['email'=>$email,'firstName'=>$firstName,'lastName'=>$lastName,'profilePicture'=>$profilePicture],'isAdmin'=>$isAdmin,'state'=>$state]);