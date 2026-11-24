<?php
// ECO-WAVE - Impor data lewat berkas JSON (khusus admin, POST + CSRF).
//   mode=layer  : berkas GeoJSON (FeatureCollection/Feature/geometri) -> assets/data/pltgl/pengguna/<id>.geojson
//                 + dicatat di assets/data/pltgl/layer_pengguna.json -> otomatis muncul di panel Layer pada Peta.
//   mode=lokasi : berkas JSON daftar lokasi kandidat -> tabel locations, site_scores, wave_data (DB).
//   aksi=hapus_layer : hapus layer buatan admin.
// Tidak ada data yang dikarang: setiap berkas diperiksa, yang tidak valid ditolak dengan alasan.
require __DIR__.'/../config/auth.php';
$BASE = realpath(__DIR__.'/..').'/assets/data/pltgl/';
$DIR  = $BASE.'pengguna/'; $REG = $BASE.'layer_pengguna.json';
const MAKS_BYTE = 8 * 1024 * 1024;
function kembali($ok, $msg) { header('Location: ../admin.php?impor='.($ok ? 'ok' : 'gagal').'&msg='.urlencode($msg).'#'.($ok ? 'daftar-layer' : 'impor-layer')); exit; }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') { http_response_code(405); exit('Gunakan POST'); }
if (!is_admin()) { header('Location: ../index.php?need_admin=1'); exit; }
cek_csrf();
function baca_reg($f) { $a = is_file($f) ? json_decode((string)file_get_contents($f), true) : []; return is_array($a) ? $a : []; }
function tulis_reg($f, $a) { return file_put_contents($f, json_encode(array_values($a), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX) !== false; }
function koor_ok($c, $d = 0) {                       // memeriksa koordinat [lng,lat] bersarang; mengembalikan jumlah titik atau -1
    if (!is_array($c)) return -1;
    if (count($c) >= 2 && is_numeric($c[0]) && is_numeric($c[1])) return ($c[0] >= -180 && $c[0] <= 180 && $c[1] >= -90 && $c[1] <= 90) ? 1 : -1;
    if ($d > 5) return -1;
    $n = 0; foreach ($c as $x) { $r = koor_ok($x, $d + 1); if ($r < 0) return -1; $n += $r; } return $n;
}
function rapikan_geojson($j) {                       // -> FeatureCollection atau pesan galat (string)
    if (!is_array($j)) return 'Isi berkas bukan objek GeoJSON.';
    $tipe = $j['type'] ?? '';
    if ($tipe === 'FeatureCollection') $fs = $j['features'] ?? null;
    elseif ($tipe === 'Feature') $fs = [$j];
    elseif (in_array($tipe, ['Point','MultiPoint','LineString','MultiLineString','Polygon','MultiPolygon'], true)) $fs = [['type'=>'Feature','properties'=>new stdClass,'geometry'=>$j]];
    else return 'Bukan GeoJSON: "type" harus FeatureCollection, Feature, atau geometri.';
    if (!is_array($fs) || !$fs) return 'GeoJSON tidak punya fitur.';
    if (count($fs) > 20000) return 'Terlalu banyak fitur (maks. 20.000). Sederhanakan dulu datanya.';
    $ok = ['Point','MultiPoint','LineString','MultiLineString','Polygon','MultiPolygon'];
    $out = [];
    foreach ($fs as $i => $f) {
        $g = is_array($f) ? ($f['geometry'] ?? null) : null;
        if (!is_array($g) || !in_array($g['type'] ?? '', $ok, true)) return 'Fitur ke-'.($i+1).': jenis geometri tidak didukung/kosong.';
        if (koor_ok($g['coordinates'] ?? null) < 1) return 'Fitur ke-'.($i+1).': koordinat tidak valid. Urutan harus [bujur, lintang] (EPSG:4326/WGS84).';
        $p = (isset($f['properties']) && is_array($f['properties'])) ? $f['properties'] : new stdClass;
        $out[] = ['type'=>'Feature','properties'=>$p,'geometry'=>['type'=>$g['type'],'coordinates'=>$g['coordinates']]];
    }
    return ['type'=>'FeatureCollection','features'=>$out];
}
function unggahan() {
    $u = $_FILES['berkas'] ?? null;
    if (!$u || ($u['error'] ?? 4) !== UPLOAD_ERR_OK) return [null, 'Berkas belum dipilih atau gagal diunggah (cek batas upload_max_filesize di php.ini).'];
    if ($u['size'] > MAKS_BYTE) return [null, 'Berkas lebih dari 8 MB.'];
    $ext = strtolower(pathinfo($u['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, ['json','geojson'], true)) return [null, 'Hanya berkas .json atau .geojson.'];
    $teks = file_get_contents($u['tmp_name']);
    $teks = preg_replace('/^\xEF\xBB\xBF/', '', (string)$teks);
    $j = json_decode($teks, true);
    if ($j === null && json_last_error() !== JSON_ERROR_NONE) return [null, 'JSON tidak valid: '.json_last_error_msg().'.'];
    return [$j, null];
}

$aksi = $_POST['aksi'] ?? '';
if ($aksi === 'hapus_layer') {
    $id = preg_replace('/[^a-z0-9_]/', '', (string)($_POST['id'] ?? ''));
    $reg = baca_reg($REG); $baru = array_filter($reg, fn($r) => ($r['id'] ?? '') !== $id);
    if (count($baru) === count($reg)) kembali(false, 'Layer tidak ditemukan.');
    @unlink($DIR.$id.'.geojson'); tulis_reg($REG, $baru); kembali(true, 'Layer dihapus.');
}

if ($aksi === 'impor_layer') {
    [$j, $err] = unggahan(); if ($err) kembali(false, $err);
    $gj = rapikan_geojson($j); if (is_string($gj)) kembali(false, $gj);
    $label = trim((string)($_POST['label'] ?? ''));
    if (!preg_match('/^[\p{L}\p{N} \/\-.,()]{2,60}$/u', $label)) kembali(false, 'Nama layer 2-60 karakter (huruf, angka, spasi, / - . , ( )).');
    $warna = preg_match('/^#[0-9a-fA-F]{6}$/', (string)($_POST['warna'] ?? '')) ? $_POST['warna'] : '#22d3ee';
    if (!is_dir($DIR) && !@mkdir($DIR, 0775, true)) kembali(false, 'Folder assets/data/pltgl/pengguna tidak bisa dibuat. Beri izin tulis ke folder itu.');
    $id = 'u_'.substr(preg_replace('/[^a-z0-9]+/', '_', strtolower($label)), 0, 30).'_'.substr(bin2hex(random_bytes(3)), 0, 6);
    if (file_put_contents($DIR.$id.'.geojson', json_encode($gj, JSON_UNESCAPED_UNICODE), LOCK_EX) === false) kembali(false, 'Gagal menulis berkas. Periksa izin tulis folder assets/data/pltgl/pengguna.');
    $geo = []; foreach ($gj['features'] as $f) $geo[$f['geometry']['type']] = 1;
    $reg = baca_reg($REG);
    $reg[] = ['id'=>$id,'label'=>$label,'warna'=>$warna,'file'=>'pengguna/'.$id.'.geojson','fitur'=>count($gj['features']),
              'geom'=>implode(', ', array_keys($geo)),'sumber'=>mb_substr(trim((string)($_POST['sumber'] ?? '')), 0, 160),
              'oleh'=>sesi()['user'] ?? '-','tanggal'=>date('Y-m-d H:i')];
    if (!tulis_reg($REG, $reg)) kembali(false, 'Layer tersimpan tetapi daftar layer gagal ditulis (izin tulis layer_pengguna.json).');
    kembali(true, 'Layer "'.$label.'" ('.count($gj['features']).' fitur) ditambahkan. Buka Peta, tab Layer.');
}

if ($aksi === 'impor_lokasi') {
    [$j, $err] = unggahan(); if ($err) kembali(false, $err);
    $daftar = (is_array($j) && isset($j['lokasi']) && is_array($j['lokasi'])) ? $j['lokasi'] : $j;
    if (!is_array($daftar) || !$daftar || array_keys($daftar) !== range(0, count($daftar) - 1)) kembali(false, 'Isi harus berupa daftar (array) lokasi, atau objek {"lokasi":[...]}.');
    if (count($daftar) > 500) kembali(false, 'Maksimal 500 lokasi per berkas.');
    $re = '/^[\p{L}\p{N} \/\-.,()]{2,80}$/u'; $w = [.40,.30,.15,.15]; $baris = []; $galat = [];
    foreach ($daftar as $i => $r) {
        $n = $i + 1; $nm = trim((string)($r['name'] ?? '')); $rg = trim((string)($r['region'] ?? 'Impor JSON'));
        $la = filter_var($r['latitude'] ?? null, FILTER_VALIDATE_FLOAT); $lo = filter_var($r['longitude'] ?? null, FILTER_VALIDATE_FLOAT);
        $kw = filter_var($r['kw'] ?? null, FILTER_VALIDATE_FLOAT); $s = $r['s'] ?? null;
        if (!preg_match($re, $nm) || !preg_match($re, $rg)) { $galat[] = "#$n nama/wilayah tidak valid"; continue; }
        if ($la === false || $lo === false || $la < -8 || $la > -6 || $lo < 104.5 || $lo > 107) { $galat[] = "#$n koordinat kosong/di luar area studi (lintang -8..-6, bujur 104,5..107)"; continue; }
        if ($kw === false || $kw < 0 || $kw > 200) { $galat[] = "#$n kw (kW/m) harus 0-200"; continue; }
        if (!is_array($s) || count($s) !== 4) { $galat[] = "#$n butuh \"s\": 4 skor [daya, ekosistem, kedalaman, jarak] bernilai 1-5"; continue; }
        $sk = []; foreach ($s as $v) { if (!is_numeric($v) || $v < 1 || $v > 5) { $galat[] = "#$n skor harus 1-5"; continue 2; } $sk[] = (float)$v; }
        $ex = !empty($r['ex']) ? 1 : 0;
        $baris[] = [$nm, (float)$la, (float)$lo, $rg, (float)$kw, $sk, $ex, $ex ? 0.0 : round(array_sum(array_map(fn($a, $b) => $a * $b, $w, $sk)), 2)];
    }
    if ($galat) kembali(false, 'Tidak ada yang disimpan. '.implode('; ', array_slice($galat, 0, 5)).(count($galat) > 5 ? ' ...dan '.(count($galat) - 5).' masalah lain.' : ''));
    try {
        require_once __DIR__.'/../config/db.php'; $pdo = koneksi(); $pdo->beginTransaction();
        $pm = [18.54,17.51,18.23,22.84,27.94,34.01,39.14,35.84,30.92,25.10,18.14,18.09]; $mu = ['DJF','DJF','MAM','MAM','MAM','JJA','JJA','JJA','SON','SON','SON','DJF'];
        $rt = array_sum($pm) / 12;
        foreach ($baris as [$nm, $la, $lo, $rg, $kw, $sk, $ex, $fin]) {
            $pdo->prepare("INSERT INTO locations(name,latitude,longitude,region) VALUES(?,?,?,?)")->execute([$nm, $la, $lo, $rg]); $id = (int)$pdo->lastInsertId();
            $pdo->prepare("INSERT INTO site_scores(location_id,daya_score,ekosistem_score,kedalaman_score,jarak_infrastruktur_score,is_excluded,final_score) VALUES(?,?,?,?,?,?,?)")->execute([$id, $sk[0], $sk[1], $sk[2], $sk[3], $ex, $fin]);
            foreach ($pm as $m => $p) { $kb = $kw * $p / $rt; $pdo->prepare("INSERT INTO wave_data(location_id,month,season,hs,tp,te,power_kw) VALUES(?,?,?,?,?,?,?)")->execute([$id, $m + 1, $mu[$m], round(sqrt($kb / (0.49 * 9.9)), 2), 11, 9.9, round($kb, 2)]); }
        }
        $pdo->commit();
    } catch (Throwable $e) { if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack(); kembali(false, 'Database tidak bisa dipakai; tidak ada lokasi yang tersimpan.'); }
    header('Location: ../admin.php?impor=ok&msg='.urlencode(count($baris).' lokasi ditambahkan ke database.').'#impor-lokasi'); exit;
}
kembali(false, 'Aksi tidak dikenal.');
