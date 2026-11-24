<?php
// ECO-WAVE - SATU sumber konfigurasi (database, dll).
// Menimpa nilai: (1) variabel lingkungan DB_HOST / _NAME / _USER / _PASS / _PORT di Wasmer, atau
//                (2) berkas config/config.local.php (untuk lokal, JANGAN di-commit).
$__cfg = [
    'host' => getenv('DB_HOST') ?: 'mysql-3ef4f218-hikamabdulsalam04-63af.f.aivencloud.com',
    'name' => getenv('DB_NAME') ?: 'ecowave_db',
    'user' => getenv('DB_USER') ?: 'avnadmin',
    'pass' => getenv('DB_PASS') !== false ? getenv('DB_PASS') : '',
    'port' => getenv('DB_PORT') ?: '18834',
];

if (is_file(__DIR__ . '/config.local.php')) {
    $__l = require __DIR__ . '/config.local.php';
    if (is_array($__l)) $__cfg = array_merge($__cfg, $__l);
}

foreach ([
    'host' => 'DB_HOST',
    'name' => 'DB_NAME',
    'user' => 'DB_USER',
    'pass' => 'DB_PASS',
    'port' => 'DB_PORT',
] as $k => $c) {
    if (!defined($c)) define($c, (string)$__cfg[$k]);
}

unset($__cfg, $__l, $k, $c);