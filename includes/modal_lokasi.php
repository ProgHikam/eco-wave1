<?php /* Formulir tambah/ubah lokasi + pilih titik CMEMS (dipakai peta.php dan admin.php) */ ?>
<div id="modalForm" class="hidden fixed inset-0 z-[3000] bg-black/50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Data Lokasi"><div class="card w-full max-w-lg max-h-[90vh] overflow-auto"><button type="button" class="mdl-x" aria-label="Tutup" title="Tutup" onclick="$('modalForm').classList.add('hidden')">&times;</button>
  <h3 class="font-extrabold text-lg mb-2">Data Lokasi <span id="fMode" class="text-xs font-normal opacity-70"></span></h3><input type="hidden" id="fId">
  <div class="grid grid-cols-2 gap-2 text-sm">
   <label>Nama<input id="fName" class="w-full p-2 border rounded dark:bg-slate-800" placeholder="Contoh: Bayah"></label><label>Wilayah<input id="fReg" class="w-full p-2 border rounded dark:bg-slate-800" placeholder="Lebak / Pandeglang"></label>
   <label>Latitude<input id="fLat" type="number" step="any" class="w-full p-2 border rounded dark:bg-slate-800" placeholder="-7.05"></label><label>Longitude<input id="fLng" type="number" step="any" class="w-full p-2 border rounded dark:bg-slate-800" placeholder="106.1"></label>
   <label>Hs (m)<input id="fHs" type="number" step="any" class="w-full p-2 border rounded dark:bg-slate-800" placeholder="Dari CMEMS"></label>
   <label>Te (detik)<input id="fTp" type="number" step="any" class="w-full p-2 border rounded dark:bg-slate-800" placeholder="10.76 - CMEMS VTM10"></label>
   <label class="col-span-2">Daya (kW/m) - dari interpolasi CMEMS<input id="fKw" type="number" step="any" class="w-full p-2 border rounded dark:bg-slate-800"></label>
   <button type="button" class="btn2 !py-1 col-span-2" onclick="hitungDariHsTp()">Hitung Daya + Skor Otomatis dari Hs / Te</button>
   <button type="button" class="btn2 !py-1 col-span-2" onclick="cekEksklusiManual()">Cek Eksklusi & Sensitivitas Titik Ini</button>
   <p id="fCek" class="col-span-2 text-xs p-2 rounded bg-slate-100 dark:bg-slate-800 hidden"></p>
   <button type="button" class="btn2 !py-1 col-span-2" onclick="isiWindy()">Isi daya dari Windy</button><p id="fWin" class="col-span-2 text-xs"></p>
   <label>Skor Daya (1-5)<input id="fS0" type="number" step="any" min="1" max="5" class="w-full p-2 border rounded dark:bg-slate-800"></label><label>Skor Ekosistem (1-5)<input id="fS1" type="number" step="any" min="1" max="5" class="w-full p-2 border rounded dark:bg-slate-800"></label>
   <label>Skor Kedalaman (1-5)<input id="fS2" type="number" step="any" min="1" max="5" class="w-full p-2 border rounded dark:bg-slate-800"></label><label>Skor Jarak (1-5)<input id="fS3" type="number" step="any" min="1" max="5" class="w-full p-2 border rounded dark:bg-slate-800"></label>
   <label class="col-span-2"><input type="checkbox" id="fEx"> Zona eksklusi (mask = 0)</label></div>
  <p id="fErr" class="text-red-500 text-sm mt-1"></p>
  <p class="text-xs opacity-60 mt-2">CMEMS: Te = VTM10 langsung. Klik peta: otomatis interpolasi CMEMS + estimasi rumah 450/900/1300 VA.</p>
  <div class="flex gap-2 mt-3"><button class="btn" onclick="simpan()">Simpan</button><button class="btn2" onclick="$('modalForm').classList.add('hidden')">Batal</button></div></div></div>
<div id="modalCMEMS" class="hidden fixed inset-0 z-[3000] bg-black/50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Tambah dari titik CMEMS"><div class="card w-full max-w-md"><button type="button" class="mdl-x" aria-label="Tutup" title="Tutup" onclick="$('modalCMEMS').classList.add('hidden')">&times;</button>
  <h3 class="font-extrabold text-lg">Tambah dari titik CMEMS</h3>
  <p class="text-sm opacity-70">Pilih titik, form langsung keisi Hs, Te, kW dari CMEMS 2015-2024.</p>
  <div id="cmemsList" class="grid gap-2 mt-3 text-sm"></div>
  <button class="btn2 mt-3" onclick="$('modalCMEMS').classList.add('hidden')">Batal</button>
</div></div>
<script>(function(){var ids=["modalForm","modalCMEMS"];function tutup(e){e.classList.add("hidden")}ids.forEach(function(i){var e=document.getElementById(i);if(e&&e.parentNode!==document.body)document.body.appendChild(e);if(e)e.addEventListener("mousedown",function(ev){if(ev.target===e)tutup(e)})});document.addEventListener("keydown",function(ev){if(ev.key!=="Escape")return;ids.forEach(function(i){var e=document.getElementById(i);if(e&&!e.classList.contains("hidden"))tutup(e)})})})();</script>
