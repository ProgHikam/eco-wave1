<?php
// CRUD lokasi (khusus admin). POST JSON: {aksi: create|update|delete|from_click, ...}
header('Content-Type: application/json; charset=utf-8');
require __DIR__.'/../config/db.php'; require __DIR__.'/../config/auth.php';
function gagal($m, $c = 400) { http_response_code($c); echo json_encode(['error'=>$m]); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || strpos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) gagal('Gunakan POST JSON', 405);
if (!is_admin()) gagal('Hanya admin yang boleh mengubah data lokasi', 403);
$in = json_decode(file_get_contents('php://input'), true) ?: [];
$aksi = $in['aksi'] ?? '';
// Bentuk musiman = klimatologi bulanan CMEMS (assets/js/data.js, CMEMS.bulanan.p) dinormalkan ke rata-rata 1.
// Hasilnya PERKIRAAN skala musiman dari satu nilai kW/m, bukan deret pengukuran per lokasi.
function buat_wave(PDO $pdo, int $id, float $kw) {
    $pm = [18.54,17.51,18.23,22.84,27.94,34.01,39.14,35.84,30.92,25.10,18.14,18.09];
    $rata = array_sum($pm) / count($pm);
    $mu = ['DJF','DJF','MAM','MAM','MAM','JJA','JJA','JJA','SON','SON','SON','DJF'];
    $pdo->prepare("DELETE FROM wave_data WHERE location_id=?")->execute([$id]);
    $st = $pdo->prepare("INSERT INTO wave_data(location_id,month,season,hs,tp,te,power_kw) VALUES(?,?,?,?,?,?,?)");
    foreach ($pm as $i => $p) {
        $kwb = $kw * $p / $rata;                       // kW/m bulan ini
        $hs = sqrt($kwb / (0.49 * 9.9));               // Te dianggap 9,9 s (0,9 x Tp 11 s), seperti sebelumnya
        $st->execute([$id, $i+1, $mu[$i], round($hs,2), 11, 9.9, round($kwb,2)]);
    }
}

// Aturan eksklusi LAMA (kotak TN Ujung Kulon, lingkaran mangrove/karang tebakan) DIHAPUS (celah P5).
// Satu sumber kebenaran: poligon nyata di assets/js/ecowave.js. Browser admin menghitung skor Eko/Kedalaman/Jarak + eksklusi
// dari data PLTGL nyata lalu mengirim s[] dan ex ke endpoint ini; server memvalidasi rentang dan menyimpan.
function skor_daya_server(float $kw): float {
    // Skala relatif min-max antar titik CMEMS (20,48-25,57 kW/m) -> 1..5, sama dengan ecowave.js (dayaMode 'relatif').
    $lo = 20.48; $hi = 25.57; $t = ($kw - $lo) / ($hi - $lo);
    return round(1 + 4 * max(0, min(1, $t)), 2);
}

try {
    $pdo = koneksi();
    if ($aksi === 'from_click') {
        $re = '/^[\p{L}\p{N} \/\-.,()]{2,80}$/u';
        $name = trim($in['name'] ?? '');
        $region = trim($in['region'] ?? 'Klik Peta');
        if (!preg_match($re, $name) || !preg_match($re, $region)) gagal('Nama/wilayah tidak valid');
        $lat = filter_var($in['latitude'] ?? null, FILTER_VALIDATE_FLOAT);
        $lng = filter_var($in['longitude'] ?? null, FILTER_VALIDATE_FLOAT);
        $hs = filter_var($in['hs'] ?? null, FILTER_VALIDATE_FLOAT);
        $tp = filter_var($in['tp'] ?? null, FILTER_VALIDATE_FLOAT);
        if ($lat === false || $lng === false || $hs === false || $tp === false) gagal('Data klik tidak valid');
        if ($lat < -8 || $lat > -6 || $lng < 104.5 || $lng > 107) gagal('Koordinat berada di luar area studi Banten Selatan.');
        if ($hs < 0 || $hs > 10 || $tp < 0 || $tp > 20) gagal('Data gelombang tidak valid');
        $te = 0.9 * $tp;
        $kw = round(0.49 * $hs * $hs * $te, 2);
        $sk = $in['s'] ?? null;
        if (!is_array($sk) || count($sk) !== 4) gagal('Skor dari analisis data nyata tidak ikut terkirim');
        foreach ($sk as $v) if (!is_numeric($v) || $v < 1 || $v > 5) gagal('Skor harus 1-5');
        $s = array_map('floatval', $sk);
        $ex = !empty($in['ex']) ? 1 : 0;
        $cek = ['ex'=>$ex, 'alasan'=>(string)($in['alasan'] ?? '')];
        $sens = ['sumber'=>'poligon nyata (ecowave.js)'];
        $w = [.40,.30,.15,.15];
        $fin = $ex ? 0 : round($s[0]*$w[0]+$s[1]*$w[1]+$s[2]*$w[2]+$s[3]*$w[3], 2);

        $pdo->beginTransaction();
        $pdo->prepare("INSERT INTO locations(name,latitude,longitude,region) VALUES(?,?,?,?)")->execute([$name,$lat,$lng,$region]);
        $id = (int)$pdo->lastInsertId();
        $pdo->prepare("INSERT INTO site_scores(location_id,daya_score,ekosistem_score,kedalaman_score,jarak_infrastruktur_score,is_excluded,final_score) VALUES(?,?,?,?,?,?,?)")
            ->execute([$id,$s[0],$s[1],$s[2],$s[3],$ex,$fin]);
        buat_wave($pdo, $id, (float)$kw);
        $pdo->commit();
        echo json_encode(['ok'=>1,'id'=>$id,'kw'=>$kw,'s'=>[$s[0],$s[1],$s[2],$s[3]],'final_score'=>$fin,'kelayakan'=> $ex ? '0% - EXCLUDED' : round(($fin/5)*100,1).'%','ex'=>$ex,'alasan'=>$cek['alasan'],'sensitivitas'=>$sens]);
        exit;
    }
    if ($aksi === 'delete') {
        $id = (int)($in['id'] ?? 0);
        $pdo->beginTransaction();
        foreach (['wave_data','site_scores'] as $t) $pdo->prepare("DELETE FROM $t WHERE location_id=?")->execute([$id]);
        $pdo->prepare("DELETE FROM locations WHERE id=?")->execute([$id]);
        $pdo->commit(); echo json_encode(['ok'=>1]); exit;
    }
    if (!in_array($aksi, ['create','update'], true)) gagal('Aksi tidak dikenal');
    $re = '/^[\p{L}\p{N} \/\-.,()]{2,80}$/u';
    $name = trim($in['name'] ?? ''); $region = trim($in['region'] ?? '');
    if (!preg_match($re, $name) || !preg_match($re, $region)) gagal('Nama/wilayah tidak valid (huruf, angka, spasi, / - . , ( ) saja)');
    $lat = filter_var($in['latitude'] ?? null, FILTER_VALIDATE_FLOAT);
    $lng = filter_var($in['longitude'] ?? null, FILTER_VALIDATE_FLOAT);
    $kw  = filter_var($in['kw'] ?? null, FILTER_VALIDATE_FLOAT);
    if ($lat === false || $lat === null || abs($lat) > 90 || $lng === false || $lng === null || abs($lng) > 180 ||
        $kw === false || $kw === null || $kw < 0 || $kw > 200) gagal('Koordinat/daya tidak valid');
    if ($lat < -8 || $lat > -6 || $lng < 104.5 || $lng > 107) gagal('Koordinat berada di luar area studi Banten Selatan.');
    $rawScores = $in['s'] ?? [];
    if (!is_array($rawScores) || count($rawScores) !== 4) gagal('Skor harus 4 kriteria');
    foreach ($rawScores as $v) if (!is_numeric($v)) gagal('Skor harus berupa angka');
    $s = array_map('floatval', $rawScores);
    foreach ($s as $v) if ($v < 1 || $v > 5) gagal('Skor harus 1-5');
    // [BARU] Kalo admin centang eksklusi manual, tetep dihormatin. Kalo gak, cek otomatis dari koordinat.
    $ex = !empty($in['ex']) ? 1 : 0;           // ditentukan dari poligon nyata di browser admin; server tidak menebak dengan kotak/lingkaran
    $cek = ['ex'=>$ex, 'alasan'=>(string)($in['alasan'] ?? '')];
    $w = [.40,.30,.15,.15];
    $fin = $ex ? 0 : round(array_sum(array_map(fn($a,$b)=>$a*$b, $w, $s)), 2);
    $pdo->beginTransaction();
    if ($aksi === 'create') {
        $pdo->prepare("INSERT INTO locations(name,latitude,longitude,region) VALUES(?,?,?,?)")->execute([$name,$lat,$lng,$region]);
        $id = (int)$pdo->lastInsertId();
        $pdo->prepare("INSERT INTO site_scores(location_id,daya_score,ekosistem_score,kedalaman_score,jarak_infrastruktur_score,is_excluded,final_score) VALUES(?,?,?,?,?,?,?)")
            ->execute([$id,$s[0],$s[1],$s[2],$s[3],$ex,$fin]);
    } else {
        $id = (int)($in['id'] ?? 0);
        if ($id < 1) gagal('ID lokasi tidak valid');
        $check = $pdo->prepare("SELECT COUNT(*) FROM locations WHERE id=?");
        $check->execute([$id]);
        if (!(int)$check->fetchColumn()) gagal('Lokasi tidak ditemukan', 404);
        $pdo->prepare("UPDATE locations SET name=?,latitude=?,longitude=?,region=? WHERE id=?")->execute([$name,$lat,$lng,$region,$id]);
        $pdo->prepare("UPDATE site_scores SET daya_score=?,ekosistem_score=?,kedalaman_score=?,jarak_infrastruktur_score=?,is_excluded=?,final_score=? WHERE location_id=?")
            ->execute([$s[0],$s[1],$s[2],$s[3],$ex,$fin,$id]);
    }
    buat_wave($pdo, $id, (float)$kw);
    $pdo->commit();
    echo json_encode(['ok'=>1,'id'=>$id,'ex'=>$ex,'alasan'=>$cek['alasan']]);
} catch (Throwable $e) { if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack(); gagal('Kesalahan database', 503); }