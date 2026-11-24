# Catatan v14 (16 Nov 2026)

Pembaruan menu **Informasi** di navbar (Tentang Web, Tentang Data, Teknologi & Metode) agar sesuai kode sekarang dan lebih mudah dibaca.

- **Tentang Data**
  - Bagian baru "Asal data: siapa yang menyiapkan?" (hasil manual kelompok / sumber luar / layanan langsung / belum dipakai).
  - Data yang disiapkan kelompok (mangrove, kawasan konservasi, perairan 5 km, 12 desa acuan, 5 kandidat contoh, bobot dan asumsi) kini ditulis sebagai **hasil manual dari kelompok kami**, dengan penanda `src-manual` di tabel sumber (gaya di `tema.css`).
  - Perbaikan angka: atribut jalur listrik, gardu (hanya `name`, `power`), dan jalur pelayaran disesuaikan dengan berkas web; luas perairan 5 km 1.614,8 km2; jalur pelayaran sampai 107,63°BT; perairan 5 km sampai 106,40°BT; gardu hanya 1 titik.
  - Dihapus: rujukan ke halaman Hasil (sudah dihapus) dan baris "Zona eksklusi lama" (kode lama sudah dihapus dari `data.js`).
  - Daftar "Data & metode estimasi" ditulis ulang: skor Daya relatif, skor Jarak berbasis jaringan listrik (desa hanya cadangan), kelas MCDA, dan eksklusi.
- **Tentang Web**: tabel peran disesuaikan dengan kode (fitur yang butuh login: bandingkan, PDF, PNG, uji sensitivitas di Peta, Eksklusi OFF), deskripsi dock Peta, pilihan peta dasar, langkah pasang (reset admin, vendor lokal), FAQ baru.
- **Teknologi & Metode**: ringkasan 1 menit, baris "Fitur yang butuh login", koreksi deskripsi `prepare_pltgl.py` (memilih fitur yang menyentuh kotak studi, tidak memotong geometri).
- Indeks pencarian dibangun ulang; `tests/test_engine.js`, `test_cari.js`, `test_aksesibilitas.js` lolos.
