<?php
// Terima lat,lng -> lokasi kandidat terdekat (Haversine) + daya bulanan
header('Content-Type: application/json; charset=utf-8');
require __DIR__.'/../config/db.php';
$lat = filter_input(INPUT_GET, 'lat', FILTER_VALIDATE_FLOAT);
$lng = filter_input(INPUT_GET, 'lng', FILTER_VALIDATE_FLOAT);
if ($lat === null || $lat === false || $lng === null || $lng === false ||
    $lat < -90 || $lat > 90 || $lng < -180 || $lng > 180) {
    http_response_code(400); echo json_encode(['error'=>'lat/lng tidak valid']); exit;
}
try {
    $pdo = koneksi();
    $st = $pdo->prepare(SQL_LOKASI." ORDER BY 6371*ACOS(LEAST(1,COS(RADIANS(:a))*COS(RADIANS(l.latitude))
        *COS(RADIANS(l.longitude)-RADIANS(:b))+SIN(RADIANS(:c))*SIN(RADIANS(l.latitude)))) LIMIT 1");
    $st->execute([':a'=>$lat, ':b'=>$lng, ':c'=>$lat]);
    $r = $st->fetch();
    if (!$r) { http_response_code(404); echo json_encode(['error'=>'Belum ada titik kandidat']); exit; }
    $out = bentuk($r); $d = M_PI/180;
    $out['jarak_km'] = round(6371*acos(min(1, cos($lat*$d)*cos($r['latitude']*$d)*cos(($r['longitude']-$lng)*$d)
        + sin($lat*$d)*sin($r['latitude']*$d))), 1);
    $m = $pdo->prepare("SELECT power_kw FROM wave_data WHERE location_id=? ORDER BY month");
    $m->execute([$r['id']]);
    $out['monthly'] = array_map('floatval', $m->fetchAll(PDO::FETCH_COLUMN));
    echo json_encode($out);
} catch (Throwable $e) { http_response_code(503); echo json_encode(['error'=>'DB belum siap']); }
