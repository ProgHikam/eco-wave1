<?php
// ?aksi=me | logout. Login hanya lewat form POST ke config/auth.php (satu sistem login; sebelumnya ada
// jalur kedua yang memanggil seed_users() yang tidak pernah didefinisikan sehingga selalu gagal).
header('Content-Type: application/json; charset=utf-8');
require __DIR__.'/../config/auth.php';
$aksi = $_GET['aksi'] ?? '';
if ($aksi === 'me') { echo json_encode(['user'=>sesi(), 'csrf'=>sesi() ? csrf_token() : null]); exit; }
if ($aksi === 'logout') {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') { http_response_code(405); echo json_encode(['error'=>'Gunakan POST']); exit; }
    $_SESSION = []; session_destroy(); echo json_encode(['ok'=>1]); exit;
}
http_response_code(400); echo json_encode(['error'=>'aksi tidak dikenal. Login memakai form di navbar.']);
