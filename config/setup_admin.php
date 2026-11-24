<?php
// Pembuatan admin pertama. Halaman ini HANYA berfungsi selama belum ada akun admin di database.
// Setelah admin ada, halaman menolak semua permintaan (hapus berkas ini dari server produksi bila mau).
require_once __DIR__ . '/auth.php';
$pesan = ''; $ok = false;
$status = ada_admin();                         // true | false | null (DB tidak tersambung)
if ($status === true) { http_response_code(403); $pesan = 'Admin sudah ada. Halaman ini dinonaktifkan.'; }
elseif ($status === null) { $pesan = 'Database tidak tersambung. Periksa config/config.php (atau config.local.php) dan pastikan database sudah diimport dari database.sql.'; }
elseif (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    cek_csrf();
    $nama = trim((string)($_POST['name'] ?? '')); $user = trim((string)($_POST['username'] ?? ''));
    $pw = (string)($_POST['password'] ?? ''); $pw2 = (string)($_POST['password2'] ?? '');
    if (!preg_match('/^[A-Za-z0-9_.-]{3,40}$/', $user)) $pesan = 'Username 3-40 karakter: huruf, angka, titik, garis bawah, atau strip.';
    elseif (strlen($pw) < 10) $pesan = 'Kata sandi minimal 10 karakter.';
    elseif ($pw !== $pw2) $pesan = 'Konfirmasi kata sandi tidak sama.';
    else {
        $r = buat_user($nama !== '' ? $nama : $user, $user, null, $pw, 'admin');
        if ($r === true) { $ok = true; $pesan = 'Admin dibuat. Silakan login dari beranda.'; } else $pesan = (string)$r;
    }
}
?><!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ECO-WAVE - Buat admin pertama</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#020d1a;color:#e8f4fb;font:15px/1.6 system-ui,sans-serif}
.k{width:min(420px,92vw);background:#08213a;border:1px solid #16415f;border-radius:18px;padding:26px}
h1{margin:0 0 4px;font-size:20px}p{color:#8db3c9;margin:0 0 14px;font-size:13.5px}
input{width:100%;box-sizing:border-box;margin:0 0 10px;padding:10px 12px;border-radius:10px;border:1px solid #1d4d70;background:#061a2f;color:#fff;font:inherit}
button{width:100%;padding:11px;border:0;border-radius:10px;background:linear-gradient(135deg,#22d3ee,#3b82f6);color:#02101d;font-weight:800;cursor:pointer}
.m{padding:10px 12px;border-radius:10px;margin-bottom:12px;font-size:13.5px;background:rgba(251,113,133,.12);border:1px solid rgba(251,113,133,.4);color:#fecdd3}
.m.ok{background:rgba(45,212,191,.12);border-color:rgba(45,212,191,.4);color:#99f6e4}a{color:#67e8f9}</style></head><body><div class="k">
<h1>Buat admin pertama</h1><p>Akun ini menggantikan akun bawaan yang sebelumnya tertulis di kode. Kata sandi disimpan sebagai hash.</p>
<?php if ($pesan): ?><div class="m <?= $ok ? 'ok' : '' ?>"><?= htmlspecialchars($pesan) ?></div><?php endif; ?>
<?php if ($status === true && dari_lokal()): ?><p>Lupa kata sandi admin? <a href="reset_admin.php">Atur ulang akun admin</a> (hanya dari komputer server).</p><?php endif; ?>
<?php if ($status === false && !$ok): ?>
<form method="post"><?= csrf_field() ?>
<input name="name" placeholder="Nama lengkap" autocomplete="name">
<input name="username" placeholder="Username" required autocomplete="username">
<input name="password" type="password" placeholder="Kata sandi (min. 10 karakter)" required autocomplete="new-password">
<input name="password2" type="password" placeholder="Ulangi kata sandi" required autocomplete="new-password">
<button type="submit">Buat admin</button></form>
<?php endif; ?>
<p style="margin-top:14px"><a href="../index.php">&larr; Kembali ke beranda</a></p></div></body></html>
