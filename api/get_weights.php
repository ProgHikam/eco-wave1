<?php
// Bobot MCA dari database
header('Content-Type: application/json; charset=utf-8');
require __DIR__.'/../config/db.php';
try { echo json_encode(koneksi()->query("SELECT criteria_name,weight FROM mca_weights")->fetchAll()); }
catch (Throwable $e) { http_response_code(503); echo json_encode(['error'=>'DB belum siap']); }
