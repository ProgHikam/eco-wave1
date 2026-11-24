<?php $page='kalkulator'; $title='ECO-WAVE - Kalkulator Zona PLTGL'; $libs=['leaflet','chart']; $js=['data','peta_gaya','ecowave','ecowave_data','ekspor','kalkulator','deeplink']; include __DIR__.'/includes/head.php'; ?>
<link rel="stylesheet" href="assets/css/peta-gaya.css?v=<?= @filemtime(__DIR__.'/assets/css/peta-gaya.css') ?: 1 ?>">
<style>
#ek .ek-grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:16px;align-items:start}
#ek .ek-stack{display:grid;gap:16px}
#ek #ekMap{height:430px;border-radius:14px;overflow:hidden;border:1px solid var(--o-line-hi);background:var(--space-cadet)}
#ek .ek-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:10px}
#ek .ek-row label{font-size:12px;color:var(--o-mut);display:flex;flex-direction:column;gap:3px}
#ek input[type=number],#ek input[type=text],#ek select{background:var(--space-cadet);color:var(--cream);border:1px solid var(--o-line-hi);border-radius:10px;padding:7px 10px;font:inherit;font-size:13px;min-width:0}
#ek input[type=number]{width:104px}
#ek input[type=text]{width:120px}
#ek .ek-layers{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:6px 14px;margin-top:12px;padding-top:10px;border-top:1px solid var(--o-line)}
#ek .ek-h{display:flex;align-items:center;gap:8px;margin:0 0 10px;font-weight:800;color:var(--cream)}
#ek .ek-h i{color:var(--o-bolt)}
#ek .ek-radio{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}
#ek .ek-radio label{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;border:1px solid var(--o-line-hi);background:rgba(var(--slate-gray-rgb),.07);cursor:pointer;font-size:12.5px;font-weight:700;color:var(--cream)}
#ek .ek-radio input{accent-color:var(--slate-gray)}
#ek .ek-radio label:has(input:checked){background:rgba(var(--slate-gray-rgb),.22);border-color:var(--o-cyan);color:var(--cream)}
#ek .ek-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
#ek .ek-form label{font-size:12px;color:var(--o-mut);display:flex;flex-direction:column;gap:4px}
#ek .ek-form input,#ek .ek-form select{width:100%}
#ek .ek-form .full{grid-column:1/-1}
#ek .ek-note{font-size:12px;color:var(--o-mut);margin:8px 0 0;padding-left:10px;border-left:2px solid var(--o-bolt)}
#ek .ek-warn{background:rgba(var(--tan-rgb),.10);border:1px solid rgba(var(--tan-rgb),.35);color:var(--tan);border-radius:10px;padding:8px 12px;font-size:12.5px;margin-top:8px}
#ek .ek-bad{background:rgba(var(--tan-rgb),.12);border:1px solid rgba(var(--tan-rgb),.4);color:var(--cream);border-radius:10px;padding:8px 12px;font-size:12.5px;margin-top:8px}
#ek .ek-ok{background:rgba(var(--slate-gray-rgb),.10);border:1px solid rgba(var(--slate-gray-rgb),.35);color:var(--cream);border-radius:10px;padding:8px 12px;font-size:12.5px;margin-top:8px}
#ek .ek-kpi{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin-bottom:16px}
#ek .ek-kpi .card{padding:.9rem 1rem}
#ek .ek-kpi small{display:block;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--o-mut);font-weight:800}
#ek .ek-kpi strong{display:block;font-size:1.65rem;line-height:1.15;margin:.3rem 0 .1rem;color:var(--cream);letter-spacing:-.02em}
#ek .ek-kpi span{font-size:12px;color:var(--o-mut)}
#ek .ek-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:16px}
#ek .ek-sec{margin-top:16px}
#ek .tbl{overflow:auto}
#ek table{font-size:13px}
#ek td.num,#ek th.num{text-align:right;white-space:nowrap}
#ek .pill{display:inline-block;padding:2px 10px;border-radius:999px;font-size:11.5px;font-weight:800;color:var(--space-cadet)}
#ek .sld{display:grid;grid-template-columns:150px 1fr 46px;gap:10px;align-items:center;font-size:13px;margin:6px 0}
#ek .sld input{width:100%;accent-color:var(--slate-gray)}
#ek details>summary{cursor:pointer;font-weight:800;color:var(--cream);margin-bottom:8px}
#ek .adv{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px}
#ek .adv label{font-size:12px;color:var(--o-mut);display:flex;flex-direction:column;gap:4px}
#ek .adv input,#ek .adv select{width:100%}
#ek .ek-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
#ek .ek-actions .btn,#ek .ek-actions .btn2{padding:.55rem 1.1rem;font-size:13px}
#ek .ek-prog{height:6px;border-radius:6px;background:rgba(var(--slate-gray-rgb),.15);overflow:hidden;margin-top:8px}
#ek .ek-prog i{display:block;height:100%;width:0;background:var(--o-grad);transition:width .15s}
#ek .bar{height:6px;border-radius:5px;background:rgba(var(--cream-rgb),.12);overflow:hidden}#ek .bar i{display:block;height:100%}
@media(max-width:1000px){#ek .ek-grid,#ek .ek-two{grid-template-columns:1fr}#ek #ekMap{height:360px}#ek .sld{grid-template-columns:110px 1fr 42px}}
</style>
<link rel="stylesheet" href="assets/css/kalkulator.css?v=<?= @filemtime(__DIR__.'/assets/css/kalkulator.css') ?: 1 ?>">
<div class="wrap" id="ek">
  <div class="page-head band ek-hero">
    <h1>ECO-WAVE &mdash; Kalkulator Zona PLTGL Ramah Ekosistem</h1>
    <p>Pilih satu titik di pesisir selatan Banten, lalu lihat <b>berapa listrik yang bisa dihasilkan</b>, <b>berapa rumah yang terlayani</b>, dan <b>seberapa layak</b> titik itu secara lingkungan dan teknis.</p>
    <ol class="ek-langkah" aria-label="Cara memakai kalkulator">
      <li><span>1</span><div><b>Pilih titik</b><small>Klik peta atau isi koordinat</small></div></li>
      <li><span>2</span><div><b>Pilih sumber gelombang</b><small>CMEMS, BMKG, atau manual</small></div></li>
      <li><span>3</span><div><b>Atur perangkat</b><small>Lebar, efisiensi, jumlah unit</small></div></li>
      <li><span>4</span><div><b>Tekan Hitung</b><small>Hasil muncul di bawah</small></div></li>
    </ol>
    <details class="ek-info">
      <summary><i class="bi bi-info-circle"></i> Data apa yang dipakai kalkulator ini?</summary>
      <p>Skor ekosistem, kedalaman, dan jarak jaringan dihitung dari <b>data PLTGL nyata</b> (mangrove, karang, lamun, konservasi, batimetri, gardu, jalur listrik, jalur pelayaran). Data gelombang dapat memakai <b>CMEMS 2015&ndash;2024</b>, <b>prakiraan BMKG Maritim</b>, atau input manual.</p>
    </details>
  </div>

  <div class="ek-grid">
    <div class="card ek-card" id="k-titik">
      <div class="ek-h"><span class="ek-no">1</span><div><b>Pilih titik analisis</b><small>Klik di peta, atau ketik koordinat di bawah</small></div></div>
      <div id="ekMap"></div>
      <div class="ek-row">
        <label>Latitude<input type="number" id="ekLat" step="0.0001" placeholder="-7.0500"></label>
        <label>Longitude<input type="number" id="ekLng" step="0.0001" placeholder="106.1000"></label>
        <button class="btn2" id="ekPakai" type="button"><i class="bi bi-crosshair"></i> Pakai koordinat</button>
      </div>
      <div class="ek-row">
        <label>Kandidat lokasi<select id="ekKand"><option value="">- pilih -</option></select></label>
        <label>Titik CMEMS<select id="ekCm"><option value="">- pilih -</option></select></label>
      </div>
      <p class="ek-hint"><i class="bi bi-hand-index-thumb"></i> Dua garis putus-putus di peta menentukan area hitung: biru = kotak area studi, kuning = batas area analisis. Titik di luar garis tidak dapat dihitung. Pengaturannya sama dengan halaman Peta.</p>
      <details class="ek-lay" id="ekBatas">
        <summary><i class="bi bi-bounding-box"></i> Garis batas di peta <small>(atur manual)</small></summary>
        <div class="ek-bt">
          <label class="ek-bt-cek"><input type="checkbox" id="ekStudyOn" checked><i class="ek-gr ek-gr-biru"></i><span>Kotak batas area studi <small>(biru)</small></span></label>
          <div class="ek-bt-isi">
            <label>Lintang selatan<input id="ekStudyS" type="number" step="0.01" min="-8" max="-6"></label>
            <label>Bujur barat<input id="ekStudyW" type="number" step="0.01" min="104.5" max="107"></label>
            <label>Lintang utara<input id="ekStudyN" type="number" step="0.01" min="-8" max="-6"></label>
            <label>Bujur timur<input id="ekStudyE" type="number" step="0.01" min="104.5" max="107"></label>
          </div>
          <div class="ek-bt-aksi"><button id="ekStudyApply" type="button" class="btn2">Terapkan</button><button id="ekStudyReset" type="button" class="btn2">Kembali ke batas awal</button></div>
          <p id="ekStudyStatus" class="ek-bt-st" aria-live="polite"></p>
        </div>
        <div class="ek-bt">
          <label class="ek-bt-cek"><input type="checkbox" id="ekAnalOn" checked><i class="ek-gr ek-gr-kuning"></i><span>Batas area analisis / cakupan data karang-lamun <small>(kuning)</small></span></label>
          <div class="ek-bt-isi">
            <label>Lintang selatan<input id="ekAnalS" type="number" step="0.01" min="-8" max="-6"></label>
            <label>Bujur barat<input id="ekAnalW" type="number" step="0.01" min="104.5" max="107"></label>
            <label>Lintang utara<input id="ekAnalN" type="number" step="0.01" min="-8" max="-6"></label>
            <label>Bujur timur<input id="ekAnalE" type="number" step="0.01" min="104.5" max="107"></label>
          </div>
          <div class="ek-bt-aksi"><button id="ekAnalApply" type="button" class="btn2" disabled>Terapkan</button><button id="ekAnalReset" type="button" class="btn2" disabled>Kembali ke batas asli</button></div>
          <p id="ekAnalStatus" class="ek-bt-st" aria-live="polite"></p>
          <p class="ek-bt-cat">Area di luar data habitat asli tetap diberi peringatan.</p>
        </div>
      </details>
      <details class="ek-lay" open>
        <summary><i class="bi bi-layers"></i> Lapisan data di peta <small>(centang untuk menampilkan)</small></summary>
        <div class="ek-layers" id="ekLayers"></div>
      </details>
    </div>

    <div class="ek-stack">
      <div class="card ek-card" id="k-sumber">
        <div class="ek-h"><span class="ek-no">2</span><div><b>Sumber data gelombang</b><small>Dari mana tinggi &amp; periode gelombang diambil</small></div></div>
        <div class="ek-radio" id="ekSumber">
          <label><input type="radio" name="ekSumber" value="cmems" checked><span><b>CMEMS 2015&ndash;2024</b><small>Rata-rata 10 tahun (disarankan)</small></span></label>
          <label><input type="radio" name="ekSumber" value="bmkg"><span><b>BMKG Maritim</b><small>Prakiraan 4 hari ke depan</small></span></label>
          <label><input type="radio" name="ekSumber" value="manual"><span><b>Manual</b><small>Isi Hs &amp; Te sendiri</small></span></label>
        </div>
        <div id="pCmems" class="ek-form">
          <label class="full">Musim<select id="ekMusim"><option value="thn">Tahunan</option><option value="djf">Barat (DJF)</option><option value="mam">Peralihan I (MAM)</option><option value="jja">Timur (JJA)</option><option value="son">Peralihan II (SON)</option></select></label>
          <p class="ek-note full">Hs, Te, dan P diinterpolasi IDW dari titik acuan <b data-ref-rentang>P0&ndash;P3</b> (sumber tiap titik tertera di popup penanda). Nilai musiman diskalakan dari rata-rata tahunan.</p>
        </div>
        <div id="pBmkg" class="ek-form hidden">
          <label class="full">Perairan BMKG<select id="ekPerairan"><option value="M.09">Samudra Hindia selatan Jawa Barat (M.09)</option><option value="P.I.04">Selat Sunda Barat Pandeglang (P.I.04)</option><option value="P.I.05">Perairan Selatan Pandeglang (P.I.05)</option><option value="P.I.06">Perairan Selatan Lebak (P.I.06)</option><option value="M.19">Laut Jawa bagian barat (M.19)</option><option value="custom">Kode lain&hellip;</option></select></label>
          <label class="full hidden" id="ekKodeWrap">Kode perairan<input type="text" id="ekKode" placeholder="mis. P.AC.01"></label>
          <label>Statistik<select id="ekStat"><option value="rata">Rata-rata prakiraan (4 hari)</option><option value="sekarang">Saat ini (langkah terdekat)</option><option value="maks">Maksimum prakiraan</option></select></label>
          <label>Periode Te (detik)<input type="number" id="ekTeB" step="0.1" min="3" max="20" value="10.9"></label>
          <button class="btn2 full" id="ekMuatBmkg" type="button"><i class="bi bi-cloud-arrow-down"></i> Muat prakiraan BMKG</button>
          <div id="ekBmStat" class="ek-note full">Belum dimuat.</div>
          <p class="ek-note full">JSON BMKG hanya memuat tinggi gelombang (Hs), <b>tanpa periode</b>. Te diisi sendiri (awal: hasil IDW CMEMS), sehingga P = 0,49&middot;Hs&sup2;&middot;Te adalah <b>estimasi campuran</b>, bukan pengukuran. Prakiraan berlaku untuk seluruh zona perairan BMKG, bukan titik tunggal.</p>
        </div>
        <div id="pManual" class="ek-form hidden">
          <label>Hs &mdash; tinggi gelombang (m)<input type="number" id="ekHs" step="0.01" min="0" value="2.13"></label>
          <label>Te &mdash; periode energi (detik)<input type="number" id="ekTeM" step="0.1" min="1" value="10.76"></label>
        </div>
      </div>

      <div class="card ek-card" id="k-perangkat">
        <div class="ek-h"><span class="ek-no">3</span><div><b>Perangkat PLTGL</b><small>Ukuran &amp; kinerja alat pembangkit</small></div></div>
        <div class="ek-form">
          <label>Lebar tangkap (m)<input type="number" id="ekLebar" step="1" min="1" value="10"><small>Lebar alat yang menghadap gelombang</small></label>
          <label>Efisiensi (%)<input type="number" id="ekEf" step="1" min="1" max="100" value="30"><small>Bagian energi gelombang yang jadi listrik</small></label>
          <label>Faktor kapasitas (%)<input type="number" id="ekCf" step="1" min="1" max="100" value="15"><small>Energi nyata ÷ energi maksimum. Rujukan: sekitar 6–22% (lihat Teknologi &amp; Metode)</small></label>
          <label>Jumlah perangkat<input type="number" id="ekUnit" step="1" min="1" max="1000" value="1"><small>Unit yang dipasang di titik ini</small></label>
        </div>
        <div class="ek-actions"><button class="btn ek-go" id="ekHitung" type="button"><i class="bi bi-calculator"></i> Hitung ECO-WAVE</button><button class="btn2" id="ekReset" type="button"><i class="bi bi-arrow-counterclockwise"></i> Reset parameter</button></div>
        <div id="ekMsg"></div>
      </div>
    </div>
  </div>

  <div id="ekHasil" class="hidden">
    <div id="ekCakup"></div>
    <div id="k-ringkas" class="ek-ringkas"></div>

    <nav class="ek-nav" aria-label="Loncat ke bagian hasil">
      <a href="#k-ringkas"><i class="bi bi-speedometer2"></i>Ringkasan</a>
      <a href="#k-mcda"><i class="bi bi-sliders"></i>Skor MCDA</a>
      <a href="#k-jarak"><i class="bi bi-geo"></i>Jarak</a>
      <a href="#k-energi"><i class="bi bi-house-heart"></i>Listrik &amp; rumah</a>
      <a href="#k-rank"><i class="bi bi-trophy"></i>Peringkat</a>
      <a href="#k-zona"><i class="bi bi-grid-3x3-gap"></i>Zona</a>
      <a href="#k-lanjutan"><i class="bi bi-gear"></i>Parameter</a>
    </nav>

    <div class="ek-sec ek-kpi" id="ekKpi"></div>

    <div class="ek-two">
      <div class="card ek-card" id="k-mcda"><div class="ek-h"><i class="bi bi-sliders ek-ic"></i><div><b>Skor kelayakan titik (MCDA)</b><small>Empat kriteria dinilai 1&ndash;5, lalu digabung dengan bobot</small></div></div>
        <div class="ek-bobot">
          <div class="ek-sub">Atur seberapa penting tiap kriteria</div>
          <div id="ekSliders"></div>
          <label class="ek-cek"><input type="checkbox" id="ekMask" checked><span><b>Eksklusi aktif</b><small>Titik yang melanggar aturan eksklusi otomatis mendapat skor 0</small></span></label>
        </div>
        <div id="ekMcda"></div>
      </div>
      <div class="card ek-card" id="k-jarak"><div class="ek-h"><i class="bi bi-geo ek-ic"></i><div><b>Jarak ke data PLTGL</b><small>Seberapa jauh titik dari ekosistem &amp; infrastruktur</small></div></div><div id="ekJarak"></div></div>
    </div>

    <div class="ek-two">
      <div class="card ek-card"><div class="ek-h"><i class="bi bi-graph-up ek-ic"></i><div><b id="ekChartT">Gelombang</b><small>Pola gelombang di titik ini</small></div></div><canvas id="ekChart" height="200"></canvas><div id="ekChartNote" class="ek-note"></div></div>
      <div class="card ek-card" id="k-energi"><div class="ek-h"><i class="bi bi-house-heart ek-ic"></i><div><b>Listrik &amp; rumah terlayani</b><small>Dari gelombang sampai jumlah rumah</small></div></div><div id="ekEnergi"></div></div>
    </div>

    <div class="card ek-card ek-sec" id="k-rank"><div class="ek-h"><i class="bi bi-trophy ek-ic"></i><div><b>Peringkat kandidat dengan data nyata</b><small>Bandingkan kandidat dalam batas area analisis (jika diatur)</small></div></div>
      <p class="ek-desc">Skor Ekosistem, Kedalaman, dan Jarak setiap kandidat di dalam batas area analisis dihitung ulang dari data PLTGL nyata (bobot &amp; eksklusi sama dengan panel MCDA di atas), lalu dibandingkan dengan skor yang tersimpan di database. Kolom Daya, Eko, Ked, dan Jar adalah skor kriteria (1&ndash;5). Jika batas diperlebar melewati cakupan data habitat asli, hasil tetap diberi peringatan data tidak tersedia.</p>
      <div class="ek-actions"><button class="btn2" id="ekRank" type="button"><i class="bi bi-list-ol"></i> Hitung peringkat kandidat</button><button class="btn2" id="ekUji" type="button"><i class="bi bi-activity"></i> Uji &plusmn;10% bobot</button><button class="btn2 hidden" id="ekRankCsv" type="button"><i class="bi bi-filetype-csv"></i> Unduh peringkat (CSV)</button></div>
      <div id="ekUjiHasil" class="ek-uji"></div><div class="tbl" id="ekRankTbl"></div>
    </div>

    <div class="card ek-card ek-sec" id="k-zona"><div class="ek-h"><i class="bi bi-grid-3x3-gap ek-ic"></i><div><b>Zona ECO-WAVE</b><small>Grid &plusmn;1 km di perairan pesisir 5 km, dibatasi garis kuning jika diatur</small></div></div>
      <p class="ek-desc">Menilai setiap sel grid di dalam batas area analisis dengan MCDA yang sama dan menggambarnya di peta di atas. Daya diambil dari CMEMS (IDW) sesuai musim yang dipilih. Sel abu-abu = tereksklusi. Sel di luar batas manual tidak dihitung; jika area diperluas melewati cakupan data habitat asli, sel tetap ditandai sebagai di luar cakupan data. Sel di utara lintang &minus;6,60 (Selat Sunda / Teluk Banten) dilewati karena daya CMEMS di sana hanya ekstrapolasi dari titik lepas pantai; batas ini dapat diubah di Parameter lanjutan.</p>
      <div class="ek-actions"><button class="btn" id="ekZona" type="button"><i class="bi bi-grid-3x3-gap"></i> Hitung zona</button><button class="btn2 hidden" id="ekZonaHapus" type="button"><i class="bi bi-eraser"></i> Hapus zona dari peta</button><button class="btn2 hidden" id="ekZonaGj" type="button"><i class="bi bi-filetype-json"></i> Unduh zona (GeoJSON)</button></div>
      <div class="ek-prog hidden" id="ekProg"><i></i></div><div id="ekZonaInfo" class="ek-uji"></div><div class="tbl" id="ekZonaTbl"></div>
    </div>

    <details class="card ek-card ek-sec" id="k-lanjutan"><summary><i class="bi bi-gear"></i> Parameter lanjutan <small>(asumsi skor, buffer, ambang)</small></summary>
      <p class="ek-note" style="margin:0 0 10px">Nilai awal adalah asumsi tim dan <b>bukan fakta</b>; skor, buffer, dan ambang belum divalidasi. Ubah di sini untuk uji sensitivitas.</p>
      <div class="adv" id="ekAdv"></div>
    </details>

    <div class="ek-actions ek-foot" id="k-csv"><button class="btn" id="ekPdf" type="button"><i class="bi bi-file-earmark-pdf"></i> Export PDF</button><button class="btn2" id="ekPng" type="button"><i class="bi bi-image"></i> Export PNG</button><button class="btn2" id="ekCsv" type="button"><i class="bi bi-download"></i> Unduh CSV hasil</button><a class="btn2" href="peta.php"><i class="bi bi-map"></i> Buka Peta Analisis</a></div>
    <p class="ek-batas"><i class="bi bi-exclamation-triangle"></i><span><b>Batasan:</b> daya gelombang berasal dari titik acuan lepas pantai (<span data-ref-rentang>P0&ndash;P3</span>) dan tidak memodelkan refraksi/shoaling di dekat pantai; kedalaman dari ETOPO1 (~1,85 km) kasar di pesisir; potensi gelombang (kW/m) bukan daya listrik terbangkit. Hasil adalah <b>penapisan awal</b>, bukan studi kelayakan.</span></p>
  </div>
</div>
<?php include __DIR__.'/includes/foot.php'; ?>
