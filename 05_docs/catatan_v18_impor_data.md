# Catatan v18 - titik P4 + impor data gelombang

## Kenapa titik tambahan (mis. P4) tidak tampil
- Titik acuan dibaca dari tabel `cmems_titik` (api/referensi.php). Isi `CMEMS.titik` di data.js HANYA cadangan: bila database terbaca, isinya diganti seluruhnya oleh isi database. Titik yang ditambah hanya di data.js tidak akan pernah tampil.
- Bila database tidak terbaca (tabel belum diimpor, MySQL mati), halaman diam-diam memakai data.js. Sekarang muncul pita merah kecil di Peta/Kalkulator/Hasil/Kelola yang menyebut penyebabnya.
- Teks "P0-P3" di Kalkulator kini dinamis (`data-ref-rentang`), mengikuti titik yang ada.
- Cek cepat: buka `api/referensi.php?jenis=titik` di browser. Harus berisi semua titik termasuk P4.

## Impor data (admin.php > Kelola)
- Titik gelombang: CSV / JSON / GeoJSON Point; format ringkas atau deret waktu (assets/js/impor_data.js). Pratinjau + validasi sebelum simpan. Disimpan lewat `api/referensi.php` (jenis=titik, aksi=impor), admin + CSRF, semua-atau-tidak-sama-sekali.
- NetCDF (ERA5/CMEMS) -> `python scripts/nc_ke_titik.py ... --titik "nama,lat,lng" --sumber ERA5 --keluar titik.csv`, lalu unggah CSV. (Skrip belum diuji pada berkas .nc asli; statistiknya sudah dicocokkan dengan parser JS.)
- Layer GeoJSON (poligon/garis/titik) dan lokasi kandidat JSON: formulir dipulihkan di admin.php (endpoint api/impor_json.php sudah ada). Layer buatan admin tampil di Peta > Layer.
- Migrasi: jalankan `database_referensi_v18.sql` SEKALI (kolom `sumber`; med/p90/maks/cv/persen boleh kosong). Tanpa migrasi, impor tetap jalan untuk data lengkap tetapi `sumber` tidak tersimpan.

## Aturan data
- Statistik yang tidak ada di berkas dibiarkan kosong (ditampilkan "-"), tidak dikarang. `persen` (daya relatif) dihitung otomatis = P / P tertinggi x 100, sesuai nilai P0-P3.
- Hs dan Te wajib (dipakai IDW). Bila hanya ada periode puncak Tp: Te = faktor x Tp (default 0,9, asumsi proyek).
- Peringatan metode: IDW mencampur semua titik. Titik CMEMS dan ERA5 berbeda resolusi, periode, dan definisi periode gelombang; jangan dicampur tanpa pertimbangan.
- Label kolom lama "% waktu >10 kW/m" pada form Kelola keliru (isinya daya relatif); sudah diganti.
