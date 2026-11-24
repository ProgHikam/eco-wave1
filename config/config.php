<?php
// Memuat config.local.php hanya jika ada (untuk di laptop XAMPP)
if (file_exists(__DIR__ . '/config.local.php')) {
    require_once __DIR__ . '/config.local.php';
}

if (!defined('DB_HOST')) define('DB_HOST', getenv('DB_HOST') ?: ($_ENV['DB_HOST'] ?? '127.0.0.1'));
if (!defined('DB_PORT')) define('DB_PORT', getenv('DB_PORT') ?: ($_ENV['DB_PORT'] ?? '3306'));
if (!defined('DB_NAME')) define('DB_NAME', getenv('DB_NAME') ?: ($_ENV['DB_NAME'] ?? 'ecowave_db'));
if (!defined('DB_USER')) define('DB_USER', getenv('DB_USER') ?: ($_ENV['DB_USER'] ?? 'root'));
if (!defined('DB_PASS')) define('DB_PASS', getenv('DB_PASS') ?: ($_ENV['DB_PASS'] ?? ''));