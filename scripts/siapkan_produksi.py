#!/usr/bin/env python3
"""Cek kesiapan ECO-WAVE sebelum presentasi / dipasang di server publik.

    python3 scripts/siapkan_produksi.py                 hanya memeriksa (tidak mengubah apa pun)
    python3 scripts/siapkan_produksi.py --hapus-setup   juga menghapus config/setup_admin.php dan config/reset_admin.php
                                                         (jalankan HANYA di server publik; di komputer sendiri berkas itu masih berguna)
"""
import os, re, sys, glob

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ok = lambda t: print('  [OK]    ' + t)
bad = lambda t: print('  [PERIKSA] ' + t)
info = lambda t: print('  [info]  ' + t)
masalah = 0

print('1. Pengguna database')
lp = os.path.join(R, 'config', 'config.local.php')
if not os.path.isfile(lp):
    bad('config/config.local.php belum ada -> aplikasi memakai root tanpa kata sandi. Jalankan database_pengguna.sql lalu salin config.local.example.php.'); masalah += 1
else:
    t = open(lp, encoding='utf-8').read()
    u = re.search(r"'user'\s*=>\s*'([^']*)'", t); p = re.search(r"'pass'\s*=>\s*'([^']*)'", t)
    if not u or u.group(1) in ('', 'root'): bad("'user' di config.local.php masih root/kosong."); masalah += 1
    elif not p or p.group(1) in ('', 'GANTI_DENGAN_KATA_SANDI_KUAT'): bad("'pass' di config.local.php belum diisi kata sandi kuat."); masalah += 1
    else: ok("config.local.php memakai pengguna '%s' dengan kata sandi terisi." % u.group(1))

print('2. Pustaka lokal (peta tetap jalan tanpa internet)')
V = ['assets/vendor/leaflet/leaflet.js', 'assets/vendor/leaflet/leaflet.css', 'assets/vendor/chart.umd.min.js', 'assets/vendor/bootstrap-icons/bootstrap-icons.min.css']
hilang = [v for v in V if not os.path.isfile(os.path.join(R, v))]
if hilang: bad('belum ada: ' + ', '.join(hilang) + '  -> jalankan  python scripts/unduh_vendor.py  sekali dengan internet.'); masalah += 1
else: ok('Leaflet, Chart.js, dan ikon tersedia lokal.')

print('3. Indeks pencarian')
ix = os.path.join(R, 'assets', 'data', 'cari_indeks.json')
hal = [os.path.join(R, h + '.php') for h in ('index', 'peta', 'kalkulator', 'terbaik', 'tentang_web', 'tentang', 'teknologi')]
if not os.path.isfile(ix): bad('cari_indeks.json belum ada -> python3 scripts/bangun_indeks_cari.py'); masalah += 1
elif any(os.path.getmtime(h) > os.path.getmtime(ix) + 1 for h in hal if os.path.isfile(h)): bad('ada halaman yang lebih baru dari indeks -> python3 scripts/bangun_indeks_cari.py'); masalah += 1
else: ok('indeks pencarian lebih baru dari semua halaman.')

print('4. Berkas pemasangan admin')
sisa = [f for f in ('setup_admin.php', 'reset_admin.php') if os.path.isfile(os.path.join(R, 'config', f))]
if '--hapus-setup' in sys.argv:
    for f in sisa: os.remove(os.path.join(R, 'config', f)); ok('dihapus config/' + f)
    if not sisa: ok('sudah tidak ada.')
elif sisa: info('masih ada: ' + ', '.join(sisa) + ' (aman di komputer sendiri; di server publik jalankan dengan --hapus-setup).')
else: ok('tidak ada.')

print('5. Windy')
w = os.path.join(R, 'config', 'windy.php')
if os.path.isfile(w) and 'ISI_KUNCI_WINDY_DI_SINI' in open(w, encoding='utf-8').read(): info('kunci Windy kosong -> otomatis memakai Open-Meteo (tidak apa-apa).')
else: ok('kunci Windy terisi.')

print('6. Perlindungan berkas (.htaccess root)')
ht = os.path.join(R, '.htaccess')
if not os.path.isfile(ht): bad('.htaccess di root hilang -> berkas .sql (berisi kata sandi) bisa diunduh lewat browser.'); masalah += 1
else: ok('.htaccess root ada (memblokir .sql, folder internal, dan daftar isi folder).')
sq = os.path.join(R, 'database_pengguna.sql')
if os.path.isfile(sq) and 'GANTI_DENGAN_KATA_SANDI_KUAT' not in open(sq, encoding='utf-8').read():
    info('database_pengguna.sql sudah berisi kata sandi asli -> setelah dijalankan di phpMyAdmin, hapus kata sandinya dari berkas itu atau pindahkan berkasnya ke luar htdocs.')

print('\n' + ('Semua pemeriksaan wajib lolos.' if not masalah else '%d hal perlu dibereskan (lihat [PERIKSA]).' % masalah))
sys.exit(1 if masalah else 0)
