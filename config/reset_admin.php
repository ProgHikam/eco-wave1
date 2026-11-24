<?php
// ECO-WAVE - Pemulihan akses admin (lupa kata sandi / admin lama tidak bisa login).
// Hanya bisa dibuka dari komputer server itu sendiri (localhost). Dari internet halaman ini selalu ditolak.
// Fungsi: membuat admin baru, atau mengganti kata sandi akun yang sudah ada dan menjadikannya admin,
// sekaligus membuka kunci "terlalu banyak percobaan gagal". Setelah selesai, hapus berkas ini dari server produksi.
require_once __DIR__ . '/auth.php';
$pesan = ''; $ok = false; $boleh = true;
if (!dari_lokal()) { http_response_code(403); $boleh = false; $pesan = 'Halaman ini hanya bisa dibuka dari komputer server (alamat localhost).'; }
elseif (!db_tersambung()) { $boleh = false; $pesan = 'Database tidak tersambung. Nyalakan MySQL, import database.sql, lalu periksa config/config.php (atau config.local.php).'; }
elseif (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    cek_csrf();
    pastikan_tabel_users();
    $nama = trim((string)($_POST['name'] ?? '')); $user = trim((string)($_POST['username'] ?? ''));
    $pw = (string)($_POST['password'] ?? ''); $pw2 = (string)($_POST['password2'] ?? '');
    if (!preg_match('/^[A-Za-z0-9_.-]{3,40}$/', $user)) $pesan = 'Username 3-40 karakter: huruf, angka, titik, garis bawah, atau strip.';
    elseif (strlen($pw) < 10) $pesan = 'Kata sandi minimal 10 karakter.';
    elseif ($pw !== $pw2) $pesan = 'Konfirmasi kata sandi tidak sama.';
    else {
        $st = $conn->prepare("SELECT id FROM users WHERE username=? LIMIT 1");
        $st->bind_param("s", $user); $st->execute();
        $res = $st->get_result(); $baris = $res ? $res->fetch_assoc() : null; $st->close();
        if ($baris) {
            $hash = password_hash($pw, PASSWORD_DEFAULT); $id = (int)$baris['id'];
            $up = $conn->prepare("UPDATE users SET password=?, role='admin' WHERE id=?");
            $up->bind_param("si", $hash, $id);
            if ($up->execute()) { $ok = true; $pesan = 'Kata sandi akun "' . $user . '" diganti dan akunnya menjadi admin.'; }
            else $pesan = 'Gagal menyimpan: ' . $up->error;
            $up->close();
        } else {
            $r = buat_user($nama !== '' ? $nama : $user, $user, null, $pw, 'admin');
            if ($r === true) { $ok = true; $pesan = 'Admin "' . $user . '" dibuat.'; } else $pesan = (string)$r;
        }
        if ($ok) login_bersihkan();     // buka kunci percobaan login untuk alamat ini
    }
}
$daftar = ($boleh && db_tersambung()) ? list_users() : [];
?><!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ECO-WAVE - Atur ulang akun admin</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#020d1a;color:#e8f4fb;font:15px/1.6 system-ui,sans-serif;padding:20px 0}
.k{width:min(460px,92vw);background:#08213a;border:1px solid #16415f;border-radius:18px;padding:26px}
h1{margin:0 0 4px;font-size:20px}p{color:#8db3c9;margin:0 0 14px;font-size:13.5px}
input{width:100%;box-sizing:border-box;margin:0 0 10px;padding:10px 12px;border-radius:10px;border:1px solid #1d4d70;background:#061a2f;color:#fff;font:inherit}
button{width:100%;padding:11px;border:0;border-radius:10px;background:linear-gradient(135deg,#22d3ee,#3b82f6);color:#02101d;font-weight:800;cursor:pointer}
.m{padding:10px 12px;border-radius:10px;margin-bottom:12px;font-size:13.5px;background:rgba(251,113,133,.12);border:1px solid rgba(251,113,133,.4);color:#fecdd3}
.m.ok{background:rgba(45,212,191,.12);border-color:rgba(45,212,191,.4);color:#99f6e4}a{color:#67e8f9}
table{width:100%;border-collapse:collapse;font-size:13px;margin:0 0 14px}td,th{padding:5px 6px;border-bottom:1px solid #16415f;text-align:left}th{color:#8db3c9;font-weight:600}</style></head><body><div class="k">
<h1>Atur ulang akun admin</h1><p>Hanya untuk komputer server. Isi username yang sudah ada untuk mengganti kata sandinya, atau username baru untuk membuat admin baru.</p>
<?php if ($pesan): ?><div class="m <?= $ok ? 'ok' : '' ?>"><?= htmlspecialchars($pesan) ?></div><?php endif; ?>
<?php if ($boleh): ?>
<?php if ($daftar): ?><table><tr><th>Akun saat ini</th><th>Username</th><th>Peran</th></tr>
<?php foreach ($daftar as $d): ?><tr><td><?= htmlspecialchars($d['name']) ?></td><td><?= htmlspecialchars($d['username']) ?></td><td><?= htmlspecialchars($d['role']) ?></td></tr><?php endforeach; ?></table><?php endif; ?>
<form method="post"><?= csrf_field() ?>
<input name="name" placeholder="Nama lengkap (untuk akun baru)" autocomplete="name">
<input name="username" placeholder="Username" required autocomplete="username">
<input name="password" type="password" placeholder="Kata sandi baru (min. 10 karakter)" required autocomplete="new-password">
<input name="password2" type="password" placeholder="Ulangi kata sandi" required autocomplete="new-password">
<button type="submit">Simpan</button></form>
<?php endif; ?>
<p style="margin-top:14px"><a href="../index.php">&larr; Kembali ke beranda</a></p></div></body></html>
