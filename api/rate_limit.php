<?php
/**
 * Rate Limiting middleware
 * Limite les requetes API par IP pour prevenir les abus
 * Stockage fichier dans data/rate_limits/
 */

define('RATE_LIMIT_DIR', __DIR__ . '/../data/rate_limits/');
define('RATE_LIMIT_MAX_REQUESTS', 30);  // max requetes
define('RATE_LIMIT_WINDOW', 60);         // par minute (en secondes)
define('RATE_LIMIT_CLEANUP_PROB', 10);   // 10% chance de cleanup

function getRateLimitDir() {
    $dir = RATE_LIMIT_DIR;
    if (!is_dir($dir)) {
        mkdir($dir, 0700, true);
    }
    return $dir;
}

function getClientIP() {
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        return trim($ips[0]);
    }
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

function checkRateLimit() {
    $ip = getClientIP();
    $ipHash = md5($ip);
    $dir = getRateLimitDir();
    $file = $dir . $ipHash . '.json';
    $now = time();
    $windowStart = $now - RATE_LIMIT_WINDOW;

    // Read existing requests
    $requests = [];
    if (file_exists($file)) {
        $data = @json_decode(file_get_contents($file), true);
        if (is_array($data)) {
            // Filter out expired entries
            $requests = array_filter($data, function($ts) use ($windowStart) {
                return $ts > $windowStart;
            });
        }
    }

    // Check if over limit
    if (count($requests) >= RATE_LIMIT_MAX_REQUESTS) {
        $retryAfter = max(1, min($requests) - $windowStart);
        header('Retry-After: ' . $retryAfter);
        header('X-RateLimit-Limit: ' . RATE_LIMIT_MAX_REQUESTS);
        header('X-RateLimit-Remaining: 0');
        http_response_code(429);
        echo json_encode(['error' => 'Too Many Requests', 'retry_after' => $retryAfter]);
        exit;
    }

    // Add current request
    $requests[] = $now;
    $requests = array_values($requests);
    file_put_contents($file, json_encode($requests), LOCK_EX);

    // Set rate limit headers
    $remaining = RATE_LIMIT_MAX_REQUESTS - count($requests);
    header('X-RateLimit-Limit: ' . RATE_LIMIT_MAX_REQUESTS);
    header('X-RateLimit-Remaining: ' . max(0, $remaining));

    // Probabilistic cleanup of old files
    if (mt_rand(1, 100) <= RATE_LIMIT_CLEANUP_PROB) {
        cleanupRateLimitFiles($dir, $windowStart);
    }
}

function cleanupRateLimitFiles($dir, $windowStart) {
    $files = glob($dir . '*.json');
    foreach ($files as $f) {
        if (filemtime($f) < $windowStart) {
            @unlink($f);
        }
    }
}

// Execute rate limit check
checkRateLimit();
