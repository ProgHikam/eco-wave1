<?php
// Server-side ke Windy Point Forecast API v2 (model gfsWave). Kunci tidak terlihat di browser. Cache 3 jam.
// Rumus tetap sama dengan proyek: Te = 0.9*Tp (asumsi), P = 0.49*Hs^2*Te (kW/m)
header('Content-Type: application/json; charset=utf-8');
require __DIR__.'/../config/windy.php';
function gagal($m, $c = 503) { http_response_code($c); echo json_encode(['error'=>$m]); exit; }
$lat = filter_input(INPUT_GET, 'lat', FILTER_VALIDATE_FLOAT);
$lng = filter_input(INPUT_GET, 'lng', FILTER_VALIDATE_FLOAT);
if ($lat === null || $lat === false || $lng === null || $lng === false) gagal('lat/lng tidak valid', 400);
// Hanya wilayah studi (kotak unduhan data) agar tidak jadi proxy terbuka & hemat kuota 500/hari
if ($lat < -8 || $lat > -6 || $lng < 104.5 || $lng > 107) gagal('Di luar wilayah studi', 400);
$tanpaKunci = (WINDY_KEY === '' || WINDY_KEY === 'ISI_KUNCI_WINDY_DI_SINI');
$lat = round($lat, 2); $lng = round($lng, 2);
$f = sys_get_temp_dir().'/ecowave_windy_'.md5(($tanpaKunci?'om':'wd')."$lat,$lng").'.json';
if (is_file($f) && time() - filemtime($f) < 10800) { echo file_get_contents($f); exit; }

// Cadangan tanpa kunci: GFS Wave via Open-Meteo Marine (model yang sama dengan lapisan gelombang Windy). Format keluaran sama.
if ($tanpaKunci) {
    $url = 'https://marine-api.open-meteo.com/v1/marine?latitude='.$lat.'&longitude='.$lng
         .'&hourly=wave_height,wave_period,wave_direction&forecast_days=3&timezone=GMT&timeformat=unixtime';
    $ctx2 = stream_context_create(['http'=>['timeout'=>12,'ignore_errors'=>true]]);
    $j = json_decode(@file_get_contents($url, false, $ctx2) ?: '', true);
    if (!$j || !isset($j['hourly']['time'], $j['hourly']['wave_height'])) gagal('Open-Meteo: respon tidak valid / tidak ada koneksi');
    $h = $j['hourly']; $ser = [];
    foreach ($h['time'] as $i => $t) {
        $hs = $h['wave_height'][$i] ?? null; $tp = $h['wave_period'][$i] ?? null;
        if ($hs === null || $tp === null) continue;
        $ser[] = ['t'=>$t*1000,'hs'=>round($hs,2),'tp'=>round($tp,1),'dir'=>$h['wave_direction'][$i] ?? 0,'p'=>round(0.49*$hs*$hs*0.9*$tp,2)];
    }
    if (!$ser) gagal('Data gelombang kosong (titik di daratan?)');
    $k = 0; $best = PHP_INT_MAX; $now = time()*1000;
    foreach ($ser as $i => $x) { $d = abs($x['t'] - $now); if ($d < $best) { $best = $d; $k = $i; } }
    $out = json_encode(['trial'=>false,'src'=>'open-meteo','now'=>$ser[$k],'series'=>array_slice($ser,$k,24),'mean_p'=>round(array_sum(array_column($ser,'p'))/count($ser),2)]);
    @file_put_contents($f, $out);
    echo $out; exit;
}
$ctx = stream_context_create(['http'=>['method'=>'POST','header'=>"Content-Type: application/json\r\n",'timeout'=>12,'ignore_errors'=>true,
  'content'=>json_encode(['lat'=>$lat,'lon'=>$lng,'model'=>'gfsWave','parameters'=>['waves'],'levels'=>['surface'],'key'=>WINDY_KEY])]]);
$raw = @file_get_contents('https://api.windy.com/api/point-forecast/v2', false, $ctx);
$j = json_decode($raw ?: '', true);
if (!$j || !isset($j['ts'], $j['waves_height-surface'])) gagal('Windy: '.($j['message'] ?? 'respon tidak valid / kuota habis'));
$H = $j['waves_height-surface']; $T = $j['waves_period-surface'] ?? []; $Dr = $j['waves_direction-surface'] ?? [];
$ser = [];
foreach ($j['ts'] as $i => $t) {
    $hs = $H[$i] ?? null; $tp = $T[$i] ?? null;
    if ($hs === null || $tp === null) continue;
    $ser[] = ['t'=>$t,'hs'=>round($hs,2),'tp'=>round($tp,1),'dir'=>$Dr[$i] ?? 0,'p'=>round(0.49*$hs*$hs*0.9*$tp,2)];
}
if (!$ser) gagal('Data gelombang kosong (titik di daratan?)');
$k = 0; $best = PHP_INT_MAX; $now = time()*1000;
foreach ($ser as $i => $x) { $d = abs($x['t'] - $now); if ($d < $best) { $best = $d; $k = $i; } }
$out = json_encode(['trial'=>WINDY_PLAN==='trial','now'=>$ser[$k],'series'=>array_slice($ser,$k,24),'mean_p'=>round(array_sum(array_column($ser,'p'))/count($ser),2)]);
@file_put_contents($f, $out);
echo $out;
