<?php
/**
 * MySQL Database Layer for Symbiose Formation
 * Migrated from SQLite to MySQL/MariaDB via PDO
 */

require_once __DIR__ . '/../db-config.php';

function initSchema($pdo) {
    $pdo->exec('CREATE TABLE IF NOT EXISTS users (
        email VARCHAR(255) PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');

    $pdo->exec('CREATE TABLE IF NOT EXISTS user_states (
        email VARCHAR(255) PRIMARY KEY,
        state_json LONGTEXT NOT NULL,
        last_saved VARCHAR(50) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');

    // Seed authorized users if table is empty
    $count = $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
    if ($count == 0 && defined('AUTHORIZED_USERS')) {
        $stmt = $pdo->prepare('INSERT IGNORE INTO users (email, first_name, last_name) VALUES (:e, :f, :l)');
        foreach (AUTHORIZED_USERS as $u) {
            $stmt->execute([':e' => strtolower($u['email']), ':f' => $u['firstName'], ':l' => $u['lastName']]);
        }
    }
}

function dbGetUser($email) {
    $pdo = getDB();
    $stmt = $pdo->prepare('SELECT email, first_name, last_name FROM users WHERE email = :e');
    $stmt->execute([':e' => strtolower(trim($email))]);
    $r = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$r) return null;
    return ['email' => $r['email'], 'firstName' => $r['first_name'], 'lastName' => $r['last_name']];
}

function dbGetState($email) {
    $pdo = getDB();
    $stmt = $pdo->prepare('SELECT state_json FROM user_states WHERE email = :e');
    $stmt->execute([':e' => strtolower(trim($email))]);
    $r = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$r) return null;
    return json_decode($r['state_json'], true);
}

function dbSaveState($db, $email, $stateJson, $lastSaved) {
    $stmt = $db->prepare('REPLACE INTO user_states (email, state_json, last_saved) VALUES (:e, :s, :l)');
    $stmt->execute([':e' => strtolower(trim($email)), ':s' => $stateJson, ':l' => $lastSaved]);
    return true;
}
