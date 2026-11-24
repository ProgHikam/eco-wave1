<?php
// Salin menjadi config.local.php lalu isi. Berkas config.local.php tidak boleh dipublikasikan.
// Buat pengguna MySQL khusus (bukan root) dengan hak SELECT/INSERT/UPDATE/DELETE pada database aplikasi saja.
return [
    'host' => 'localhost',
    'name' => 'ecowave_db',
    'user' => 'ecowave_app',
    'pass' => 'GANTI_DENGAN_KATA_SANDI_KUAT',
];
