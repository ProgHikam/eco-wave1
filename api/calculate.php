<?php
// GET: skor menggunakan bobot tersimpan; POST JSON: hitung dengan bobot pilihan pengguna.
header('Content-Type: application/json; charset=utf-8');
require __DIR__.'/../config/db.php';
try {
    $pdo = koneksi();
    $w = ['daya'=>.40,'eko'=>.30,'ked'=>.15,'jar'=>.15];
    $stored = $pdo->query("SELECT criteria_name, weight FROM mca_weights")->fetchAll();
    $map = ['Daya'=>'daya','Ekosistem'=>'eko','Kedalaman'=>'ked','Jarak Infrastruktur'=>'jar'];
    foreach ($stored as $row) {
        $key = $map[$row['criteria_name']] ?? null;
        if ($key !== null && is_numeric($row['weight']) && $row['weight'] >= 0) $w[$key] = (float)$row['weight'];
    }
    $mask = true;
    $in = json_decode(file_get_contents('php://input'), true);
    if (is_array($in)) {
        foreach ($w as $k => $v) {
            if (array_key_exists($k, $in)) {
                if (!is_numeric($in[$k]) || (float)$in[$k] < 0) {
                    http_response_code(400); echo json_encode(['error'=>"Bobot $k tidak valid"]); exit;
                }
                $w[$k] = (float)$in[$k];
            }
        }
        $mask = filter_var($in['mask'] ?? true, FILTER_VALIDATE_BOOLEAN);
    }
    $sum = array_sum($w);
    if ($sum <= 0) { http_response_code(400); echo json_encode(['error'=>'Total bobot harus lebih dari nol']); exit; }
    foreach ($w as $k=>$v) $w[$k] = $v/$sum;

    $out = [];
    foreach ($pdo->query(SQL_LOKASI)->fetchAll() as $r) {
        $o = bentuk($r);
        $raw = $w['daya']*$o['s'][0] + $w['eko']*$o['s'][1] +
               $w['ked']*$o['s'][2] + $w['jar']*$o['s'][3];
        $o['raw'] = round($raw, 3);
        $o['fin'] = ($mask && $o['ex']) ? 0.0 : round($raw, 3);
        $out[] = $o;
    }
    usort($out, fn($a,$b)=>$b['fin']<=>$a['fin']);
    echo json_encode(['weights'=>$w,'mask'=>$mask,'locations'=>$out], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(503); echo json_encode(['error'=>'DB belum siap atau struktur tabel belum sesuai']);
}
