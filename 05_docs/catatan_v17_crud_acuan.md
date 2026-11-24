# Catatan v17 - CRUD data acuan + hasil klik peta yang bersih

## Data acuan (admin.php > Kelola)
- Tabel baru `cmems_titik` dan `desa` (database_referensi.sql). CRUD lewat api/referensi.php (admin + CSRF).
- Titik CMEMS boleh dihapus/diganti; minimal 1 titik tersisa (tambah yang baru dulu, baru hapus yang lama).
- core.js `muatReferensi()` mengganti isi CMEMS.titik / DESA di tempat; halaman memakai `onRef(fn)` untuk menggambar ulang.
- Pola bulanan/musiman memakai `CMEMS.klimRata` (klimatologi tetap di data.js), tidak lagi terikat ke titik P0.
- Rentang skor Daya (`dayaRef`) otomatis = min-maks daya titik CMEMS yang ada, kecuali diubah manual di Kalkulator.

## Peta: hasil klik
- Satu klik = satu kartu (#hasilKlik): 4 angka ringkas + tab Skor / Gelombang / Bulanan / Listrik & rumah / Ekosistem & infrastruktur / Live.
- Tidak ada lagi popup ganda, laci detail kandidat, dan teks Windy tambahan saat klik di area kosong.
- Klik marker kandidat tetap membuka laci detail kandidat (grafik ada di panel kanan, dilipat).
- Berkas: assets/js/peta_hasil.js, assets/css/peta-bersih.css.
