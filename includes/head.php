<?php
require_once __DIR__.'/../config/auth.php';
$page = $page ?? '';
$u = sesi();
$isAdmin = $u && ($u['role'] ?? '') === 'admin';
$statusAdmin = $u ? true : ada_admin();                // true = ada admin | false = belum ada admin | null = database tidak tersambung
$tanpaAdmin = ($statusAdmin === false);                // database ada tetapi belum ada akun admin -> tampilkan tautan setup
$dbMati = ($statusAdmin === null);
$LOGIN_PESAN = ['gagal'=>'Username atau kata sandi salah.','csrf'=>'Formulir kedaluwarsa. Muat ulang halaman lalu coba lagi.',
  'terkunci'=>'Terlalu banyak percobaan gagal. Coba lagi sekitar '.max(1, min(10, (int)($_GET['m'] ?? 10))).' menit.','expired'=>'Sesi berakhir. Silakan login lagi.',
  'peran_admin'=>'Akun ini bukan admin. Pilih "Pengguna" lalu masuk lagi.','peran_user'=>'Akun ini adalah admin. Pilih "Admin" lalu masuk lagi.',
  'db'=>'Database tidak tersambung, jadi login belum bisa dipakai. Nyalakan MySQL, import database.sql, lalu periksa config/config.php.'];
$loginMsg = $LOGIN_PESAN[$_GET['login'] ?? ''] ?? (isset($_GET['need_login']) ? 'Login dulu untuk membuka fitur itu.' : (isset($_GET['need_admin']) ? 'Halaman itu khusus admin.' : ''));
$infoAktif = in_array($page, ['tentang_web','tentang','teknologi'], true);
// Pustaka pihak ketiga: pakai salinan lokal di assets/vendor/ bila ada (jalan tanpa internet), bila tidak pakai CDN.
// Unduh salinan lokal dengan: python scripts/unduh_vendor.py
if (!function_exists('lib_url')) {
    function lib_url($k) {
        static $peta = [
            'leaflet.css' => ['assets/vendor/leaflet/leaflet.css', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'],
            'leaflet'     => ['assets/vendor/leaflet/leaflet.js', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'],
            'chart'       => ['assets/vendor/chart.umd.min.js', 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js'],
            'html2canvas' => ['assets/vendor/html2canvas.min.js', 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'],
            'icons.css'   => ['assets/vendor/bootstrap-icons/bootstrap-icons.min.css', 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css'],
        ];
        [$lokal, $cdn] = $peta[$k];
        return is_file(__DIR__.'/../'.$lokal) ? $lokal : $cdn;
    }
}
?>
<!DOCTYPE html>
<html lang="id"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#25344F">
<title><?= htmlspecialchars($title ?? 'ECO-WAVE: Peta Interaktif Zona Pembangkit Listrik Tenaga Gelombang Ramah Ekosistem di Pesisir Selatan Banten') ?></title>
<link rel="stylesheet" href="<?= lib_url('leaflet.css') ?>">
<link rel="stylesheet" href="<?= lib_url('icons.css') ?>">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600&family=Sora:wght@200;300;400;600&family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css">
<link rel="stylesheet" href="assets/css/loading.css">
<script>/* transisi halaman: halaman baru langsung tertutup gelombang, lalu melanjutkan animasi dari titik terakhir halaman lama */
(function(){var h=document.documentElement,e=9999;h.classList.add("pl-boot");try{var t=+sessionStorage.getItem("pw_t");sessionStorage.removeItem("pw_t");if(t){var d=Date.now()-t;if(d>=0&&d<6000)e=d}}catch(x){}window.__pwE=e;window.__pwB=Date.now();h.style.setProperty("--pw-e",e+"ms")})();</script>
<style>
#splash,#bubbles{display:none!important;pointer-events:none!important;visibility:hidden!important;opacity:0!important}
.hero-shade,.hero-stage{pointer-events:none!important}
.hero-stage a,.hero-stage button{pointer-events:auto!important}
.page::before,.page::after,.hero::before,.hero::after{pointer-events:none!important}
main{position:relative!important;z-index:1!important}
</style>
<link rel="stylesheet" href="assets/css/tema.css?v=<?= @filemtime(__DIR__.'/../assets/css/tema.css') ?: 1 ?>">
<link rel="stylesheet" href="assets/css/bg-video.css?v=<?= @filemtime(__DIR__.'/../assets/css/bg-video.css') ?: 1 ?>">
<link rel="stylesheet" href="assets/css/cari.css?v=<?= @filemtime(__DIR__.'/../assets/css/cari.css') ?: 1 ?>">
<link rel="stylesheet" href="assets/css/navbar.css?v=<?= @filemtime(__DIR__.'/../assets/css/navbar.css') ?: 1 ?>">
<link rel="stylesheet" href="assets/css/navbar-plus.css?v=<?= @filemtime(__DIR__.'/../assets/css/navbar-plus.css') ?: 1 ?>">
<link rel="stylesheet" href="assets/css/aksesibilitas.css?v=<?= @filemtime(__DIR__.'/../assets/css/aksesibilitas.css') ?: 1 ?>">
<link rel="stylesheet" href="assets/css/faq.css?v=<?= @filemtime(__DIR__.'/../assets/css/faq.css') ?: 1 ?>">
<link rel="stylesheet" href="assets/css/rapi.css?v=<?= @filemtime(__DIR__.'/../assets/css/rapi.css') ?: 1 ?>">
<script>/* terapkan pengaturan aksesibilitas tersimpan sebelum halaman digambar (tanpa kedipan) */
(function(){try{var s=JSON.parse(localStorage.getItem("ecowave_a11y")||"null");if(!s)return;var h=document.documentElement,m={abu:"a11y-abu",baris:"a11y-baris",huruf:"a11y-huruf",tautan:"a11y-tautan",gerak:"a11y-gerak",fokus:"a11y-fokus",kursor:"a11y-kursor"};for(var k in m)if(s[k])h.classList.add(m[k]);if(s.kontras==="gelap")h.classList.add("a11y-kg");else if(s.kontras==="terang")h.classList.add("a11y-kt");var F={mudah:1,lexend:1,atkinson:1,disleksia:1,serif:1},f=s.font;if(f===true||f===1||f==="1")f="mudah";if(F[f])h.classList.add(f==="mudah"?"a11y-font":"a11y-font-"+f);if({ubur:1,pistasio:1,pantone:1,galaksi:1}[s.palet])h.classList.add("a11y-pal-"+s.palet)}catch(e){}})();</script>
<link rel="preload" as="image" href="assets/brand/pw-badan.png"><link rel="preload" as="image" href="assets/brand/pw-busur.png"><link rel="preload" as="image" href="assets/brand/pw-petir.png"><link rel="icon" type="image/png" sizes="48x48" href="assets/brand/png/ecowave-favicon-48.png">
<link rel="alternate icon" type="image/png" sizes="32x32" href="assets/brand/png/ecowave-favicon-32.png">
<link rel="apple-touch-icon" href="assets/brand/png/apple-touch-icon.png">
</head>
<body data-page="<?= htmlspecialchars($page) ?>">
<a href="#konten" class="skip-link">Lompat ke konten utama</a>
<div id="bgVideo" aria-hidden="true">
  <video muted loop playsinline autoplay preload="auto" poster="assets/video/bg-samudra.jpg" disablepictureinpicture>
    <source src="assets/video/bg-samudra.webm" type="video/webm">
    <source src="assets/video/bg-samudra.mp4" type="video/mp4">
  </video>
  <i class="bgv-tint"></i>
</div>
<div id="pageLoader" aria-hidden="true">
  <div class="pw-sheet">
    <div class="pw-crest pw-top"><svg class="pw-w pw-w1" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 62C120 22 240 22 360 62S600 102 720 62 960 22 1080 62 1320 102 1440 62V120H0Z"/></svg><svg class="pw-w pw-w2" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 62C120 22 240 22 360 62S600 102 720 62 960 22 1080 62 1320 102 1440 62V120H0Z"/></svg></div>
    <div class="pw-crest pw-bot"><svg class="pw-w pw-w1" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 62C120 22 240 22 360 62S600 102 720 62 960 22 1080 62 1320 102 1440 62V120H0Z"/></svg><svg class="pw-w pw-w2" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 62C120 22 240 22 360 62S600 102 720 62 960 22 1080 62 1320 102 1440 62V120H0Z"/></svg></div>
    <div class="pw-body">
      <div class="pw-logo">
        <div class="pw-mark" aria-hidden="true"><i class="pw-l pw-busur"></i><i class="pw-l pw-sp pw-sp1"></i><i class="pw-l pw-sp pw-sp2"></i><i class="pw-l pw-sp pw-sp3"></i><i class="pw-l pw-sp pw-sp4"></i><i class="pw-l pw-sp pw-sp5"></i><i class="pw-l pw-sp pw-sp6"></i><i class="pw-l pw-sp pw-sp7"></i><i class="pw-l pw-sp pw-sp8"></i><i class="pw-l pw-badan"></i><i class="pw-l pw-petir"></i></div>
        <b class="pw-name">ECO-WAVE</b>
        <span class="pw-sub">Ocean Wave Energy</span>
        <span class="pw-line"><i></i></span>
      </div>
    </div>
  </div>
</div>
<script src="assets/js/loading.js"></script>
<nav class="nv" id="nv" aria-label="Navigasi utama">
  <a href="index.php" class="nv-brand" aria-label="ECO-WAVE - Beranda"><span class="nv-lw"><img class="nv-logo" src="assets/brand/logo-web.png" width="36" height="36" alt="" decoding="async"></span><span><b>ECO-WAVE</b><small>Ecosystem-aware Wave Energy</small></span></a>
  <div class="nv-links" id="nvLinks">
    <a href="index.php" class="<?= $page==='beranda' ? 'on' : '' ?>"><i class="bi bi-house-door"></i>Beranda</a>
    <a href="peta.php" class="<?= $page==='peta' ? 'on' : '' ?>"><i class="bi bi-map"></i>Peta</a>
    <a href="kalkulator.php" class="<?= $page==='kalkulator' ? 'on' : '' ?>"><i class="bi bi-calculator"></i>Kalkulator</a>
    <a href="terbaik.php" class="<?= $page==='terbaik' ? 'on' : '' ?>"><i class="bi bi-trophy"></i>Lokasi Terbaik</a>
    <div class="nv-dd <?= $infoAktif ? 'on' : '' ?>">
      <button type="button" aria-haspopup="true" aria-expanded="false"><i class="bi bi-journal-text"></i>Informasi<i class="bi bi-chevron-down nv-caret"></i></button>
      <div class="nv-menu" role="menu">
        <a href="tentang_web.php" class="<?= $page==='tentang_web' ? 'on' : '' ?>"><i class="bi bi-info-circle"></i><div><b>Tentang Web</b><span>Tujuan, daftar fitur, cara memakai, dan batasan</span></div></a>
        <a href="tentang.php" class="<?= $page==='tentang' ? 'on' : '' ?>"><i class="bi bi-database-check"></i><div><b>Tentang Data</b><span>Sumber, keandalan, dan status tiap data</span></div></a>
        <a href="teknologi.php" class="<?= $page==='teknologi' ? 'on' : '' ?>"><i class="bi bi-cpu"></i><div><b>Teknologi &amp; Metode</b><span>Rumus, parameter, MCDA, dan glosarium</span></div></a>
      </div>
    </div>
    <?php if($isAdmin): ?><a href="admin.php" class="<?= $page==='admin' ? 'on' : '' ?>"><i class="bi bi-gear"></i>Kelola</a><?php endif; ?>
  </div>
  <div class="nv-right">
    <a href="peta.php" class="nv-live" id="nvLive" title="Prakiraan gelombang BMKG Maritim"><i></i>Gelombang <em>memuat…</em></a>
    <div class="nv-tools" role="group" aria-label="Alat bantu"><button type="button" class="nv-cari" data-cari title="Cari kata kunci (Ctrl+K)" aria-label="Cari kata kunci"><i class="bi bi-search" aria-hidden="true"></i></button><button type="button" class="nv-aks" data-aks title="Mode aksesibilitas (Alt+A)" aria-label="Buka pengaturan aksesibilitas" aria-haspopup="dialog" aria-expanded="false"><svg class="ax-ico" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="6.9" r="1.7" fill="currentColor"/><path d="M6.6 10.1c3.6 1 7.2 1 10.8 0M12 10.6v3.4m0 0-2.6 4.4m2.6-4.4 2.6 4.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>
    <span id="jam" class="nv-jam"></span>
    <?php if(!$u): ?>
      <button type="button" id="nLogin" class="nv-btn"><i class="bi bi-person-circle"></i><span class="nv-nama">Login</span></button>
    <?php else: ?>
      <a href="config/logout.php" class="nv-btn" title="Keluar" onclick="return confirm('Keluar dari akun <?= htmlspecialchars($u['name'], ENT_QUOTES) ?>?')"><span class="nv-av"><?= htmlspecialchars(mb_strtoupper(mb_substr($u['name'],0,1))) ?></span><span class="nv-nama"><?= htmlspecialchars($u['name']) ?> · Keluar</span></a>
    <?php endif; ?>
  </div>
  <button type="button" class="nv-burger" aria-label="Buka menu" aria-controls="nvLinks" aria-expanded="false"><span></span><span></span><span></span></button>
</nav>
<div id="loginModal" class="<?= ($loginMsg !== '' && !$u) ? 'is-open' : '' ?>" role="dialog" aria-modal="true" aria-labelledby="lmJudul">
  <div class="modal-box">
    <button type="button" class="lm-x" aria-label="Tutup">&times;</button>
    <img class="lm-logo" src="assets/brand/logo-web.png" width="56" height="56" alt="ECO-WAVE" decoding="async">
    <h3 id="lmJudul">Masuk</h3>
    <p class="lm-sub">Login diperlukan untuk menyimpan lokasi dan mengubah bobot/eksklusi.</p>
    <?php if($loginMsg !== ''): ?><div class="lm-msg"><?= htmlspecialchars($loginMsg) ?></div><?php endif; ?>
    <form method="post" action="config/auth.php" autocomplete="on">
      <?= csrf_field() ?>
      <div class="lm-peran" role="radiogroup" aria-label="Masuk sebagai">
        <span>Masuk sebagai</span>
        <label><input type="radio" name="sebagai" value="user" checked><b><i class="bi bi-person"></i> Pengguna</b></label>
        <label><input type="radio" name="sebagai" value="admin"><b><i class="bi bi-shield-lock"></i> Admin</b></label>
      </div>
      <input name="user" placeholder="Username atau email" required autocomplete="username">
      <input name="pass" type="password" placeholder="Kata sandi" required autocomplete="current-password">
      <button type="submit" class="btn-login">Masuk</button>
    </form>
    <?php if($dbMati): ?><p class="lm-hint">Database belum tersambung. Nyalakan MySQL dan import <code>database.sql</code>, lalu muat ulang halaman.</p>
    <?php elseif($tanpaAdmin): ?><p class="lm-hint">Belum ada akun admin. <a href="config/setup_admin.php">Buat admin pertama</a>.</p>
    <?php elseif(dari_lokal()): ?><p class="lm-hint">Lupa kata sandi? <a href="config/reset_admin.php">Atur ulang akun admin</a> (hanya dari komputer server).</p>
    <?php else: ?><p class="lm-hint">Lupa akun? Hubungi admin situs.</p><?php endif; ?>
  </div>
</div>
<script src="assets/js/nav.js"></script>
<main id="konten" tabindex="-1">