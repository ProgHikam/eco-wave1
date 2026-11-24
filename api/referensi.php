<?php
// CRUD data acuan: titik CMEMS (P0-P3, dst), desa acuan, dan bobot MCA.
// GET ?jenis=titik|desa|bobot  -> publik (dibaca peta/kalkulator).
// POST JSON {jenis, aksi: create|update|delete, ...} -> khusus admin, wajib header X-CSRF-Token.
header('Content-Type: application/json; charset=utf-8'); header('Cache-Control: no-store');
require __DIR__.'/../config/db.php'; require __DIR__.'/../config/auth.php';
function gagal($m, $c = 400) { http_response_code($c); echo json_encode(['error'=>$m]); exit; }
function angka($v, $min, $max, $label) {
    $f = filter_var($v, FILTER_VALIDATE_FLOAT);
    if ($f === false || $f < $min || $f > $max) gagal("$label harus angka $min..$max");
    return (float)$f;
}
function opsional($v, $min, $max, $label) {          // kosong -> null (tidak dikarang); terisi -> harus angka dalam rentang
    if ($v === null || $v === '') return null;
    return angka($v, $min, $max, $label);
}
function info_kolom(PDO $pdo, string $tabel, string $kolom) {   // baris SHOW COLUMNS atau false bila kolom belum ada
    $st = $pdo->prepare('SHOW COLUMNS FROM `'.$tabel.'` LIKE ?'); $st->execute([$kolom]); return $st->fetch();
}
$RE = '/^[\p{L}\p{N} \/\-.,()]{2,80}$/u';
$SUMBER_OK = ['CMEMS','ERA5','BMKG','Windy','Pengukuran','Lainnya'];
try {
    $pdo = koneksi();
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $j = $_GET['jenis'] ?? '';
        if ($j === 'titik') $q = "SELECT id,nama,".(info_kolom($pdo,'cmems_titik','sumber') ? "sumber," : "")."lat,lng,p,med,p90,maks,cv,hs,te,persen FROM cmems_titik ORDER BY urutan,id";
        elseif ($j === 'desa') $q = "SELECT id,nama,lat,lng,kec,penduduk FROM desa ORDER BY nama";
        elseif ($j === 'bobot') $q = "SELECT criteria_name,weight FROM mca_weights";
        else gagal('jenis tidak dikenal');
        $rows = $pdo->query($q)->fetchAll();
        foreach ($rows as &$r) foreach ($r as $k => $v) if (is_numeric($v) && $k !== 'nama' && $k !== 'kec' && $k !== 'sumber' && $k !== 'criteria_name') $r[$k] = $v + 0;
        unset($r); echo json_encode($rows, JSON_UNESCAPED_UNICODE); exit;
    }
    if ($_SERVER['REQUEST_METHOD'] !== 'POST' || strpos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) gagal('Gunakan POST JSON', 405);
    if (!is_admin()) gagal('Hanya admin yang boleh mengubah data acuan', 403);
    if (!hash_equals($_SESSION['csrf'] ?? '', $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')) gagal('Token CSRF tidak valid. Muat ulang halaman.', 403);
    $in = json_decode(file_get_contents('php://input'), true) ?: [];
    $j = $in['jenis'] ?? ''; $aksi = $in['aksi'] ?? ''; $id = (int)($in['id'] ?? 0);
    if (!in_array($aksi, ['create','update','delete'], true)) gagal('Aksi tidak dikenal');

    if ($j === 'titik' && $aksi === 'impor') {                       // impor massal (hasil parse CSV/JSON/GeoJSON di browser)
        $rows = $in['rows'] ?? null; $timpa = !empty($in['timpa']);
        if (!is_array($rows) || !$rows) gagal('Tidak ada baris untuk diimpor');
        if (count($rows) > 200) gagal('Maksimal 200 titik per impor');
        $ada_sumber = (bool)info_kolom($pdo, 'cmems_titik', 'sumber');
        $kol_med = info_kolom($pdo, 'cmems_titik', 'med');
        $stat_boleh_null = $kol_med && strtoupper((string)$kol_med['Null']) === 'YES';
        $baris = []; $galat = [];
        foreach ($rows as $i => $r) {
            $n = $i + 1;
            try {
                $nama = trim((string)($r['nama'] ?? '')); if (!preg_match($RE, $nama)) throw new Exception('nama tidak valid (2-80 karakter: huruf, angka, spasi, / - . , ( ))');
                $sumber = (string)($r['sumber'] ?? 'Lainnya'); if (!in_array($sumber, $SUMBER_OK, true)) $sumber = 'Lainnya';
                $v = ['nama'=>$nama, 'sumber'=>$sumber,
                      'lat'=>angka($r['lat'] ?? null,-8.5,-5.5,'Lintang'), 'lng'=>angka($r['lng'] ?? null,104,108,'Bujur'),
                      'p'=>angka($r['p'] ?? null,0,500,'Daya rata-rata'), 'hs'=>angka($r['hs'] ?? null,0,15,'Hs'), 'te'=>angka($r['te'] ?? null,0,25,'Te'),
                      'med'=>opsional($r['med'] ?? null,0,500,'Median'), 'p90'=>opsional($r['p90'] ?? null,0,500,'P90'), 'maks'=>opsional($r['maks'] ?? null,0,2000,'Maks'),
                      'cv'=>opsional($r['cv'] ?? null,0,5,'CV'), 'persen'=>opsional($r['persen'] ?? null,0,100,'Persen')];
                if (!$stat_boleh_null && ($v['med'] === null || $v['p90'] === null || $v['maks'] === null || $v['cv'] === null || $v['persen'] === null))
                    throw new Exception('median/P90/maks/CV/persen kosong, padahal tabel belum diubah. Jalankan database_referensi_v18.sql dulu, atau isi semua kolom itu');
                $baris[] = $v;
            } catch (Exception $e) { $galat[] = "#$n ".$e->getMessage(); }
        }
        if ($galat) gagal('Tidak ada yang disimpan. '.implode('; ', array_slice($galat, 0, 5)).(count($galat) > 5 ? ' ...dan '.(count($galat) - 5).' masalah lain.' : ''));
        $tambah = 0; $ubah = 0; $lewat = 0;
        $pdo->beginTransaction();
        foreach ($baris as $v) {
            $st = $pdo->prepare("SELECT id FROM cmems_titik WHERE nama=?"); $st->execute([$v['nama']]); $id = (int)$st->fetchColumn();
            if ($id && !$timpa) { $lewat++; continue; }
            $kol = ['lat','lng','p','med','p90','maks','cv','hs','te','persen']; if ($ada_sumber) $kol[] = 'sumber';
            $nilai = array_map(fn($k) => $v[$k], $kol);
            if ($id) {
                $pdo->prepare("UPDATE cmems_titik SET ".implode(',', array_map(fn($k) => "$k=?", $kol))." WHERE id=?")->execute([...$nilai, $id]); $ubah++;
            } else {
                $urut = (int)$pdo->query("SELECT COALESCE(MAX(urutan),-1)+1 FROM cmems_titik")->fetchColumn();
                $pdo->prepare("INSERT INTO cmems_titik(nama,urutan,".implode(',', $kol).") VALUES(?,?,".implode(',', array_fill(0, count($kol), '?')).")")->execute([$v['nama'], $urut, ...$nilai]); $tambah++;
            }
        }
        $pdo->commit();
        echo json_encode(['ok'=>1,'ditambah'=>$tambah,'diperbarui'=>$ubah,'dilewati'=>$lewat,'sumber_disimpan'=>$ada_sumber], JSON_UNESCAPED_UNICODE); exit;
    }
    if ($j === 'titik') {
        if ($aksi === 'delete') {
            if ((int)$pdo->query("SELECT COUNT(*) FROM cmems_titik")->fetchColumn() <= 1) gagal('Minimal 1 titik CMEMS harus tersisa. Untuk mengganti semua titik: tambah titik baru dulu, baru hapus yang lama.');
            $pdo->prepare("DELETE FROM cmems_titik WHERE id=?")->execute([$id]); echo json_encode(['ok'=>1]); exit;
        }
        $nama = trim($in['nama'] ?? ''); if (!preg_match($RE, $nama)) gagal('Nama tidak valid');
        $kolMed = info_kolom($pdo, 'cmems_titik', 'med'); $boleh_null = $kolMed && strtoupper((string)$kolMed['Null']) === 'YES';
        $stat = fn($k, $min, $max, $lb) => $boleh_null ? opsional($in[$k] ?? null, $min, $max, $lb) : angka($in[$k] ?? null, $min, $max, $lb);
        $v = [$nama, angka($in['lat'] ?? null,-8.5,-5.5,'Lintang'), angka($in['lng'] ?? null,104,108,'Bujur'),
              angka($in['p'] ?? null,0,500,'Daya rata-rata'), $stat('med',0,500,'Median'), $stat('p90',0,500,'P90'),
              $stat('maks',0,2000,'Maks'), $stat('cv',0,5,'CV'), angka($in['hs'] ?? null,0,15,'Hs'),
              angka($in['te'] ?? null,0,25,'Te'), $stat('persen',0,100,'Persen')];
        if ($v[10] === null) {                                  // daya relatif = P titik ini / P tertinggi (konvensi data acuan)
            $mx = (float)$pdo->query("SELECT COALESCE(MAX(p),0) FROM cmems_titik")->fetchColumn();
            $v[10] = round($v[3] / max($v[3], $mx, 0.0001) * 100, 1);
        }
        $sumber = (string)($in['sumber'] ?? ''); $punya_sumber = (bool)info_kolom($pdo, 'cmems_titik', 'sumber');
        if ($aksi === 'create') {
            $urut = (int)$pdo->query("SELECT COALESCE(MAX(urutan),-1)+1 FROM cmems_titik")->fetchColumn();
            $pdo->prepare("INSERT INTO cmems_titik(nama,lat,lng,p,med,p90,maks,cv,hs,te,persen,urutan) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)")->execute([...$v,$urut]);
            if ($punya_sumber && in_array($sumber, $SUMBER_OK, true)) $pdo->prepare("UPDATE cmems_titik SET sumber=? WHERE nama=?")->execute([$sumber, $v[0]]);
        } else {
            if ($id < 1) gagal('ID tidak valid');
            $pdo->prepare("UPDATE cmems_titik SET nama=?,lat=?,lng=?,p=?,med=?,p90=?,maks=?,cv=?,hs=?,te=?,persen=? WHERE id=?")->execute([...$v,$id]);
            if ($punya_sumber && in_array($sumber, $SUMBER_OK, true)) $pdo->prepare("UPDATE cmems_titik SET sumber=? WHERE id=?")->execute([$sumber, $id]);
        }
        echo json_encode(['ok'=>1]); exit;
    }
    if ($j === 'desa') {
        if ($aksi === 'delete') { $pdo->prepare("DELETE FROM desa WHERE id=?")->execute([$id]); echo json_encode(['ok'=>1]); exit; }
        $nama = trim($in['nama'] ?? ''); $kec = trim($in['kec'] ?? '');
        if (!preg_match($RE, $nama) || !preg_match($RE, $kec)) gagal('Nama/kecamatan tidak valid');
        $v = [$nama, angka($in['lat'] ?? null,-9,-5,'Lintang'), angka($in['lng'] ?? null,104,108,'Bujur'), $kec, (int)angka($in['penduduk'] ?? null,0,5000000,'Penduduk')];
        if ($aksi === 'create') $pdo->prepare("INSERT INTO desa(nama,lat,lng,kec,penduduk) VALUES(?,?,?,?,?)")->execute($v);
        else { if ($id < 1) gagal('ID tidak valid'); $pdo->prepare("UPDATE desa SET nama=?,lat=?,lng=?,kec=?,penduduk=? WHERE id=?")->execute([...$v,$id]); }
        echo json_encode(['ok'=>1]); exit;
    }
    if ($j === 'bobot') {
        if ($aksi !== 'update') gagal('Bobot hanya bisa diubah');
        $w = $in['w'] ?? []; $nama = ['Daya','Ekosistem','Kedalaman','Jarak Infrastruktur']; $out = [];
        foreach ($nama as $n) $out[$n] = angka($w[$n] ?? null, 0, 1, "Bobot $n");
        if (abs(array_sum($out) - 1) > 0.001) gagal('Total bobot harus 1,00 (sekarang '.round(array_sum($out),3).')');
        $pdo->beginTransaction();
        $st = $pdo->prepare("REPLACE INTO mca_weights(criteria_name,weight) VALUES(?,?)");
        foreach ($out as $n => $b) $st->execute([$n,$b]);
        $pdo->commit(); echo json_encode(['ok'=>1]); exit;
    }
    gagal('jenis tidak dikenal');
} catch (Throwable $e) { if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    gagal(strpos($e->getMessage(),'Duplicate')!==false ? 'Nama sudah dipakai' : 'Kesalahan database (sudah import database_referensi.sql?)', 503); }
