/* ECO-WAVE - FAQ melayang (pojok kanan bawah, semua halaman). Hanya tampilan/bantuan; tidak menyentuh data atau hitungan.
   Esc menutup, kolom cari menyaring pertanyaan, mengikuti palet & pengaturan aksesibilitas. */
(function () {
  'use strict';
  if (document.getElementById('faqFab')) return;
  var FAQ = [
    ['Apa itu ECO-WAVE?', 'Peta interaktif untuk penapisan awal zona PLTGL (pembangkit listrik tenaga gelombang laut) yang ramah ekosistem di pesisir selatan Banten. Hasilnya membantu menyaring lokasi, bukan keputusan akhir pembangunan.'],
    ['Dari mana data gelombangnya?', 'Utama dari CMEMS rata-rata 2015–2024, dihitung pada titik acuan lalu diinterpolasi (IDW) ke titik yang dipilih. BMKG Maritim dipakai untuk prakiraan beberapa hari ke depan (bukan klimatologi), dan Windy sebagai pembanding. Rincian dan status tiap data ada di Informasi → Tentang Data.'],
    ['Kenapa belum memakai data ERA5?', 'ECO-WAVE masih di tahap awal (prototipe), jadi analisis dibangun dulu dengan data acuan CMEMS 2015–2024. ERA5 direncanakan masuk di tahap berikutnya untuk memperpanjang rentang data dan memeriksa ulang CMEMS. Rencana dan pemeliharaannya ada di Informasi → Tentang Data.'],
    ['Apa arti skor 1–5 (Final Score)?', 'Skor tertimbang dari empat faktor: Daya gelombang, Ekosistem, Kedalaman, dan Jarak infrastruktur, lalu dikalikan mask eksklusi (lokasi di zona terlarang jadi tidak layak). Skor Ekosistem dibalik: makin jauh dari ekosistem sensitif, makin tinggi skornya.'],
    ['Dari mana bobot Daya/Ekosistem/Kedalaman/Jarak?', 'Bobot awal 40/30/15/15 adalah asumsi tim, bukan angka dari satu jurnal, dan belum divalidasi dengan AHP pakar. Karena itu bobot bisa diubah di Peta (tab Bobot MCA), dan tersedia uji ±10% untuk melihat apakah peringkat berubah. Dasar pustakanya ada di Tentang Data bagian Studi Literatur.'],
    ['Mengapa skor Ekosistem Bayah dan Sawarna belum terverifikasi?', 'Data mangrove, lamun, dan karang yang kami olah belum mencakup pesisir timur, jadi di Bayah dan Sawarna tidak ada data ekosistem dan skor Ekosistemnya otomatis 5. Itu sebabnya poinnya tinggi: datanya belum ada, bukan berarti lokasinya pasti aman. Perlu data tambahan atau survei lapangan sebelum dijadikan dasar keputusan; penjelasannya ada di Informasi → Tentang Data.'],
    ['Bagaimana listrik dan jumlah rumah dihitung?', 'Daya gelombang per meter dihitung dari tinggi dan periode gelombang, lalu diubah ke listrik memakai asumsi perangkat (lebar tangkap, efisiensi, faktor kapasitas) dan dibagi kebutuhan rumah 450/900/1300 VA. Asumsi lengkapnya ada di Peta (tab Asumsi) dan bisa diatur di Kalkulator.'],
    ['Apakah Peta dan Kalkulator saling terhubung?', 'Ya. Bobot, parameter perangkat, dan analisis terakhir dibagikan antar halaman, bahkan lintas tab browser, sehingga angkanya selalu sama.'],
    ['Bagaimana menyimpan hasil?', 'Pilih titik di Peta atau hitung di Kalkulator, lalu gunakan tombol Simpan PNG atau Download PDF pada hasilnya.'],
    ['Apakah hasil ini bisa dipakai untuk keputusan investasi?', 'Tidak langsung. Ini penapisan awal berbasis data publik dan asumsi yang tercatat. Keputusan pembangunan tetap butuh survei lapangan, kajian lingkungan, dan validasi pakar.'],
    ['Bagaimana mengatur tampilan agar lebih mudah dibaca?', 'Klik ikon orang di navbar atau tekan Alt+A: ada ukuran teks, kontras tinggi, jenis font, pilihan palet warna, dan menghentikan animasi. Tekan Ctrl+K untuk mencari isi situs.']
  ];
  var terakhir = null, panel, tombol;
  function el(t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; }
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function bangun() {
    tombol = el('button', 'faq-fab', '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/><path d="M9.4 9.3a2.7 2.7 0 1 1 3.9 2.4c-.8.4-1.3 1-1.3 1.9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="17" r="1.1" fill="currentColor"/></svg><span>FAQ</span>');
    tombol.id = 'faqFab'; tombol.type = 'button';
    tombol.setAttribute('aria-expanded', 'false'); tombol.setAttribute('aria-controls', 'faqPanel'); tombol.setAttribute('aria-label', 'Pertanyaan yang sering diajukan (FAQ)');
    panel = el('section', 'faq-panel');
    panel.id = 'faqPanel'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-labelledby', 'faqJudul'); panel.hidden = true;
    panel.innerHTML =
      '<header class="faq-head"><div><span class="faq-kick">Bantuan</span><h2 id="faqJudul">Pertanyaan umum</h2></div><button type="button" class="faq-x" aria-label="Tutup FAQ">&times;</button></header>' +
      '<div class="faq-cari"><input type="search" id="faqCari" placeholder="Cari pertanyaan..." aria-label="Cari pertanyaan"></div>' +
      '<div class="faq-list" id="faqList">' + FAQ.map(function (q, i) {
        return '<details class="faq-q" data-t="' + esc((q[0] + ' ' + q[1]).toLowerCase()) + '"><summary>' + esc(q[0]) + '</summary><p>' + esc(q[1]) + '</p></details>';
      }).join('') + '<p class="faq-kosong" hidden>Tidak ada pertanyaan yang cocok.</p></div>' +
      '<footer class="faq-foot">Butuh rincian? Lihat <a href="tentang_web.php">Tentang Web</a> dan <a href="tentang.php">Tentang Data</a>.</footer>';
    document.body.appendChild(panel); document.body.appendChild(tombol);

    tombol.addEventListener('click', function () { panel.hidden ? buka() : tutup(); });
    panel.querySelector('.faq-x').addEventListener('click', tutup);
    var cari = panel.querySelector('#faqCari'), kosong = panel.querySelector('.faq-kosong');
    cari.addEventListener('input', function () {
      var k = cari.value.trim().toLowerCase(), n = 0;   /* cocokkan juga teks yang tampil (mis. sudah diterjemahkan) */
      Array.prototype.forEach.call(panel.querySelectorAll('.faq-q'), function (d) { var ok = !k || d.getAttribute('data-t').indexOf(k) > -1 || (d.textContent || '').toLowerCase().indexOf(k) > -1; d.hidden = !ok; if (ok) n++; });
      kosong.hidden = n > 0;
    });
    panel.addEventListener('toggle', function (e) {            /* satu jawaban terbuka pada satu waktu */
      if (!e.target.open) return;
      Array.prototype.forEach.call(panel.querySelectorAll('.faq-q[open]'), function (d) { if (d !== e.target) d.open = false; });
    }, true);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { tutup(); } });
    document.addEventListener('click', function (e) { if (!panel.hidden && !panel.contains(e.target) && !tombol.contains(e.target)) tutup(); });
  }
  function buka() { terakhir = document.activeElement; panel.hidden = false; tombol.setAttribute('aria-expanded', 'true'); requestAnimationFrame(function () { panel.classList.add('is-open'); }); setTimeout(function () { var c = document.getElementById('faqCari'); if (c) c.focus(); }, 30); }
  function tutup() { panel.classList.remove('is-open'); tombol.setAttribute('aria-expanded', 'false'); setTimeout(function () { panel.hidden = true; }, 180); try { tombol.focus(); } catch (_) {} }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bangun); else bangun();
})();
