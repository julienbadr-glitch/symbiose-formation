<?php
require_once('/home/clients/b47a3b1be781d76927e33dac8ed7bd8f/private/secrets.php');
require_once __DIR__.'/db.php';
define('AUTHORIZED_USERS',[['email'=>'julien.badr@mercato-emploi.com','firstName'=>'Julien','lastName'=>'Badr'],['email'=>'jenny.gaultier@mercato-emploi.com','firstName'=>'Jenny','lastName'=>'Gaultier'],['email'=>'laure.leleu@mercato-emploi.com','firstName'=>'Laure','lastName'=>'Leleu'],['email'=>'christophe.lecrivain@mercato-emploi.com','firstName'=>'Christophe','lastName'=>'Lecrivain'],['email'=>'joshua.versier@mercato-emploi.com','firstName'=>'Joshua','lastName'=>'Versier']]);
define('DATA_DIR',__DIR__.'/../data/users/');
define('TOKEN_EXPIRY',30*24*3600);
define('ANTHROPIC_API_URL','https://api.anthropic.com/v1/messages');
define('ANTHROPIC_MODEL','claude-sonnet-4-20250514');
define('ANTHROPIC_MAX_TOKENS',1024);
function setApiHeaders(){header('Content-Type:application/json;charset=utf-8');header('Access-Control-Allow-Origin:https://mercato-formation.fr');header('Access-Control-Allow-Methods:GET,POST,OPTIONS');header('Access-Control-Allow-Headers:Content-Type,Authorization');header('X-Content-Type-Options:nosniff');if($_SERVER['REQUEST_METHOD']==='OPTIONS'){http_response_code(204);exit;}}
function sanitizeInput($s,$max=2000){if(!is_string($s))return'';return trim(mb_substr(strip_tags($s),0,$max));}
function sanitizeMessages($msgs,$maxN=50){if(!is_array($msgs))return[];$c=[];foreach(array_slice($msgs,0,$maxN) as $m){if(!isset($m['role'])||!isset($m['content'])&&!isset($m['text']))continue;$r=in_array($m['role'],['user','assistant'])?$m['role']:($m['role']==='bot'?'assistant':'user');$t=isset($m['text'])?$m['text']:(isset($m['content'])?$m['content']:'');$c[]=['role'=>$r,'content'=>sanitizeInput($t,4000)];}return $c;}
function findUser($e){$e=strtolower(trim($e));foreach(AUTHORIZED_USERS as $u){if(strtolower($u['email'])===$e)return $u;}return dbGetUser($e);}
function generateToken($e){$p=$e.'|'.time().'|'.bin2hex(random_bytes(16));$s=hash_hmac('sha256',$p,SECRET_KEY);return base64_encode($p.'|'.$s);}
function validateToken($t){if($t===null||$t==='')return null;$d=base64_decode($t);if(!$d)return null;$p=explode('|',$d);if(count($p)!==4)return null;list($e,$ts,$r,$sig)=$p;if((time()-intval($ts))>TOKEN_EXPIRY)return null;$pay=$e.'|'.$ts.'|'.$r;$exp=hash_hmac('sha256',$pay,SECRET_KEY);if(!hash_equals($exp,$sig))return null;$u=findUser($e);return $u;}
function getTokenFromHeader(){$h=getallheaders();$a=isset($h['Authorization'])?$h['Authorization']:'';if(strpos($a,'Bearer ')===0){$raw=substr($a,7);$j=json_decode($raw,true);if($j&&isset($j['token']))return $j['token'];return $raw;}if(isset($h['X-Auth-Token']))return $h['X-Auth-Token'];return null;}
function ensureDataDir(){if(!is_dir(DATA_DIR))mkdir(DATA_DIR,0750,true);}
function userDataPath($e){$s=preg_replace('/[^a-z0-9@.\\-_]/','',strtolower($e));return DATA_DIR.md5($s).'.json';}
function jsonResponse($d,$c=200){http_response_code($c);echo json_encode($d,JSON_UNESCAPED_UNICODE);exit;}
function jsonError($m,$c=400){jsonResponse(['error'=>$m],$c);}
