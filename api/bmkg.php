<?php
// Proxy server-side prakiraan perairan BMKG Maritim (JSON). Browser tidak memanggil BMKG langsung (menghindari CORS).
// Sumber: https://maritim.bmkg.go.id/marine2026-data/perairan/<KODE>.json   contoh KODE: M.09 (Samudra Hindia selatan Jawa Barat)
// Cache berkas 30 menit di folder temp; bila BMKG tidak terjangkau dipakai cache lama (ditandai "stale").
header('Content-Type: application/json; charset=utf-8');
// Alamat BMKG memuat tahun (marine<TAHUN>-data). Dicoba tahun berjalan lalu tahun sebelumnya, supaya tidak putus saat pergantian tahun.
function bmkg_basis() { $y = (int)gmdate('Y'); return ['https://maritim.bmkg.go.id/marine'.$y.'-data/perairan/', 'https://maritim.bmkg.go.id/marine'.($y-1).'-data/perairan/']; }
const BMKG_TTL  = 1800;
function gagal($m, $c = 503) { http_response_code($c); echo json_encode(['error'=>$m], JSON_UNESCAPED_UNICODE); exit; }

$kode = $_GET['code'] ?? 'M.09';
// format kode BMKG: M.09 | M.TL.01 | P.AC.01 | P.A.01  (hanya huruf kapital + angka, mencegah proxy terbuka)
if (!is_string($kode) || !preg_match('/^[MP](\.[A-Z]{1,2})?\.[0-9]{2}$/', $kode)) gagal('Kode perairan tidak valid (contoh: M.09, P.AC.01)', 400);

$f = sys_get_temp_dir().'/ecowave_bmkg_'.preg_replace('/[^A-Za-z0-9]/', '_', $kode).'.json';
if (is_file($f) && time() - filemtime($f) < BMKG_TTL) {
    $c = json_decode((string)file_get_contents($f), true);
    if (is_array($c)) { $c['cache'] = true; echo json_encode($c, JSON_UNESCAPED_UNICODE); exit; }
}

function ambil($url) {
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER=>true, CURLOPT_TIMEOUT=>12, CURLOPT_CONNECTTIMEOUT=>6, CURLOPT_FOLLOWLOCATION=>true,
            CURLOPT_USERAGENT=>'ECOWAVE/1.0', CURLOPT_HTTPHEADER=>['Accept: application/json']]);
        $r = curl_exec($ch); $http = curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
        return ($r !== false && $http === 200) ? $r : null;
    }
    $ctx = stream_context_create(['http'=>['timeout'=>12, 'header'=>"User-Agent: ECOWAVE/1.0\r\nAccept: application/json\r\n", 'ignore_errors'=>true]]);
    $r = @file_get_contents($url, false, $ctx);
    return $r === false ? null : $r;
}

$raw = null; $j = null; $sumber = '';
foreach (bmkg_basis() as $b) {
    $raw = ambil($b.$kode.'.json'); $j = $raw ? json_decode($raw, true) : null;
    if (is_array($j) && isset($j['forecast_day1'])) { $sumber = $b.$kode.'.json'; break; }
}
if (!is_array($j) || !isset($j['forecast_day1'])) {
    if (is_file($f)) { $c = json_decode((string)file_get_contents($f), true); if (is_array($c)) { $c['cache'] = true; $c['stale'] = true; echo json_encode($c, JSON_UNESCAPED_UNICODE); exit; } }
    gagal('BMKG tidak terjangkau atau kode perairan tidak ditemukan');
}
$j['fetched_at'] = gmdate('c'); $j['cache'] = false; $j['sumber_url'] = $sumber;
@file_put_contents($f, json_encode($j, JSON_UNESCAPED_UNICODE));
echo json_encode($j, JSON_UNESCAPED_UNICODE);
