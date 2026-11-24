<?php
// ECO-WAVE - Auth + Role. Satu konfigurasi database (config/config.php), tanpa akun bawaan di kode.
// Admin pertama dibuat lewat config/setup_admin.php (hanya bisa dipakai selama belum ada admin).
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'httponly' => true, 'samesite' => 'Lax',
        'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')]);
    session_start();
}
require_once __DIR__ . '/config.php';
$conn = null;
try {
    mysqli_report(MYSQLI_REPORT_OFF);
    $conn = @new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) $conn = null; else $conn->set_charset('utf8mb4');
} catch (Throwable $e) { $conn = null; }
function sesi() { return $_SESSION['user'] ?? null; }
function is_admin() { $u = sesi(); return $u && ($u['role'] ?? '') === 'admin'; }
function is_user() { $u = sesi(); return $u && ($u['role'] ?? '') === 'user'; }
function wajib_login() { if (!sesi()) { header("Location: index.php?need_login=1"); exit; } }
function wajib_admin() { if (!is_admin()) { header("Location: index.php?need_admin=1"); exit; } }
function bisa($aksi) {
    $u = sesi();
    if (!$u) return false;
    if (($u['role'] ?? '') === 'admin') return true;
    $boleh_user = ['lihat_peta','lihat_hasil','lihat_terbaik','lihat_tentang','lihat_beranda'];
    return in_array($aksi, $boleh_user, true);
}
function csrf_token() {
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
    return $_SESSION['csrf'];
}
function csrf_field() { return '<input type="hidden" name="csrf" value="'.htmlspecialchars(csrf_token()).'">'; }
function cek_csrf() {
    if (($_POST['csrf'] ?? '') === '' || !hash_equals($_SESSION['csrf'] ?? '', $_POST['csrf'])) {
        http_response_code(403); die('CSRF token tidak valid.');
    }
}
function pastikan_tabel_users() {
    global $conn; static $beres = false;
    if (!$conn) return false;
    if ($beres) return true; $beres = true;
    $conn->query("CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, username VARCHAR(60) NOT NULL UNIQUE, email VARCHAR(120) NULL UNIQUE, password VARCHAR(255) NOT NULL, role ENUM('admin','user') NOT NULL DEFAULT 'user', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
    // migrasi tabel lama (database.sql versi sebelumnya memakai kolom password_hash tanpa email/created_at)
    $kolom = function ($n) use ($conn) { $r = $conn->query("SHOW COLUMNS FROM users LIKE '" . $conn->real_escape_string($n) . "'"); return $r && $r->num_rows > 0; };
    if (!$kolom('password') && $kolom('password_hash')) $conn->query("ALTER TABLE users CHANGE password_hash password VARCHAR(255) NOT NULL");
    if (!$kolom('email')) $conn->query("ALTER TABLE users ADD email VARCHAR(120) NULL UNIQUE");
    if (!$kolom('created_at')) $conn->query("ALTER TABLE users ADD created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
    return true;
}
function list_users() {
    global $conn;
    if (!$conn) return [];
    pastikan_tabel_users();
    $res = $conn->query("SELECT id,name,username,email,role,created_at FROM users ORDER BY role DESC, name ASC");
    return $res ? $res->fetch_all(MYSQLI_ASSOC) : [];
}
function buat_user($name, $username, $email, $pass, $role = 'user') {
    global $conn;
    if (!$conn) return 'Database tidak tersambung.';
    pastikan_tabel_users();
    $role = in_array($role, ['admin','user'], true) ? $role : 'user';
    $hash = password_hash($pass, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO users (name,username,email,password,role) VALUES (?,?,?,?,?)");
    if (!$stmt) return 'Gagal siapkan query.';
    $email = ($email === null || $email === '') ? null : $email;
    $stmt->bind_param("sssss", $name, $username, $email, $hash, $role);
    if (!$stmt->execute()) {
        $err = $stmt->error; $stmt->close();
        return (strpos($err, 'Duplicate') !== false) ? 'Username / email sudah dipakai.' : 'Gagal simpan: '.$err;
    }
    $stmt->close();
    return true;
}
function ubah_role_user($id, $role) {
    global $conn;
    if (!$conn) return false;
    $role = in_array($role, ['admin','user'], true) ? $role : 'user';
    $stmt = $conn->prepare("UPDATE users SET role=? WHERE id=?");
    $stmt->bind_param("si", $role, $id);
    $ok = $stmt->execute(); $stmt->close(); return $ok;
}
function hapus_user($id) {
    global $conn;
    if (!$conn) return false;
    $me = sesi();
    if ($me && (int)($me['id'] ?? -1) === (int)$id) return false;
    $stmt = $conn->prepare("DELETE FROM users WHERE id=?");
    $stmt->bind_param("i", $id);
    $ok = $stmt->execute(); $stmt->close(); return $ok;
}
// ---------- pembatasan percobaan login (per alamat IP, disimpan di folder sementara) ----------
const LOGIN_MAKS = 5;        // gagal berturut-turut
const LOGIN_JENDELA = 600;   // detik
function login_berkas() { return sys_get_temp_dir() . '/ecowave_login_' . md5($_SERVER['REMOTE_ADDR'] ?? 'x') . '.json'; }
function login_gagal_list() {
    $f = login_berkas(); $a = is_file($f) ? json_decode((string)@file_get_contents($f), true) : [];
    if (!is_array($a)) $a = [];
    return array_values(array_filter($a, fn($t) => is_int($t) && $t > time() - LOGIN_JENDELA));
}
function login_terkunci() { return count(login_gagal_list()) >= LOGIN_MAKS; }
// sisa menit sampai kunci login terbuka (dibulatkan ke atas, minimal 1)
function login_sisa_menit() {
    $a = login_gagal_list(); sort($a);
    if (count($a) < LOGIN_MAKS) return 0;
    $sisa = $a[count($a) - LOGIN_MAKS] + LOGIN_JENDELA - time();
    return max(1, (int)ceil($sisa / 60));
}
function db_tersambung() { global $conn; return $conn instanceof mysqli; }
// true bila permintaan datang dari komputer server itu sendiri (tidak mempercayai header proxy)
function dari_lokal() {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    return in_array($ip, ['127.0.0.1', '::1', '::ffff:127.0.0.1'], true);
}
function login_catat_gagal() { $a = login_gagal_list(); $a[] = time(); @file_put_contents(login_berkas(), json_encode($a), LOCK_EX); }
function login_bersihkan() { @unlink(login_berkas()); }
function ada_admin() {
    global $conn;
    if (!$conn) return null;                       // null = database tidak tersambung
    pastikan_tabel_users();
    $r = $conn->query("SELECT COUNT(*) c FROM users WHERE role='admin'");
    return $r ? ((int)$r->fetch_assoc()['c'] > 0) : null;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && isset($_POST['user'])) {
    $inputUser = trim((string)($_POST['user'] ?? ''));
    $inputPass = (string)($_POST['pass'] ?? '');
    $sebagai = (string)($_POST['sebagai'] ?? ''); if (!in_array($sebagai, ['admin', 'user'], true)) $sebagai = '';   // "masuk sebagai": admin | user
    $tokenOk = ($_POST['csrf'] ?? '') !== '' && hash_equals($_SESSION['csrf'] ?? '', (string)$_POST['csrf']);
    if (!$tokenOk) { header("Location: ../index.php?login=csrf"); exit; }
    if (!db_tersambung()) { header("Location: ../index.php?login=db"); exit; }          // bukan salah sandi: jangan dihitung sebagai percobaan gagal
    if (login_terkunci()) { header("Location: ../index.php?login=terkunci&m=" . login_sisa_menit()); exit; }
    $found = null;
    pastikan_tabel_users();                                   // tabel users belum ada (database baru) -> dibuat, bukan gagal diam-diam
    if ($conn) {
        $stmt = $conn->prepare("SELECT id, name, username, email, password, role FROM users WHERE username=? OR email=? LIMIT 1");
        if ($stmt) {
            $stmt->bind_param("ss", $inputUser, $inputUser);
            $stmt->execute();
            $res = $stmt->get_result();
            $row = $res ? $res->fetch_assoc() : null;
            // password_verify selalu dipanggil (hash tiruan bila akun tidak ada) agar waktu respons tidak membocorkan nama akun
            $hash = $row['password'] ?? password_hash(bin2hex(random_bytes(8)), PASSWORD_DEFAULT);
            $ok = password_verify($inputPass, $hash) && $row;
            if ($ok && $sebagai !== '' && ($row['role'] ?: 'user') !== $sebagai) {   // sandi benar tetapi peran yang dipilih tidak sesuai akun
                $stmt->close();
                login_bersihkan();
                header("Location: ../index.php?login=" . ($sebagai === 'admin' ? 'peran_admin' : 'peran_user')); exit;
            }
            if ($ok) {
                if (password_needs_rehash($hash, PASSWORD_DEFAULT)) {
                    $nh = password_hash($inputPass, PASSWORD_DEFAULT);
                    $u2 = $conn->prepare("UPDATE users SET password=? WHERE id=?");
                    if ($u2) { $u2->bind_param("si", $nh, $row['id']); $u2->execute(); $u2->close(); }
                }
                $found = ['id' => (int)$row['id'], 'name' => $row['name'] ?: $row['username'], 'user' => $row['username'], 'role' => $row['role'] ?: 'user'];
            }
            $stmt->close();
        }
    }
    if ($found) {
        login_bersihkan();
        session_regenerate_id(true);
        $_SESSION['user'] = $found;
        $_SESSION['last_activity'] = time();
        csrf_token();
        header("Location: " . ($found['role'] === 'admin' ? "../admin.php" : "../index.php"));
        exit;
    }
    login_catat_gagal();
    header("Location: ../index.php?login=gagal");
    exit;
}
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && isset($_POST['aksi'])) {
    $aksi = $_POST['aksi'];
    if (!is_admin()) { header("Location: ../index.php?need_admin=1"); exit; }
    cek_csrf();
    if ($aksi === 'buat_user') {
        $r = buat_user(trim($_POST['name'] ?? ''), trim($_POST['username'] ?? ''), trim($_POST['email'] ?? ''), $_POST['password'] ?? '', $_POST['role'] ?? 'user');
        header("Location: ../admin.php?user=" . ($r === true ? 'ok' : 'gagal&msg=' . urlencode($r))); exit;
    }
    if ($aksi === 'ubah_role') { ubah_role_user((int)($_POST['id'] ?? 0), $_POST['role'] ?? 'user'); header("Location: ../admin.php?user=role_ok"); exit; }
    if ($aksi === 'hapus_user') { hapus_user((int)($_POST['id'] ?? 0)); header("Location: ../admin.php?user=hapus_ok"); exit; }
}
if (sesi() && isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > 8*3600)) {
    $_SESSION = []; session_destroy();
    header("Location: index.php?login=expired"); exit;
}
if (sesi()) $_SESSION['last_activity'] = time();