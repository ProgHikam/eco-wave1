/* ECO-WAVE di halaman Peta: layer data PLTGL nyata, zona ECO-WAVE, dan ringkasan MCDA data nyata saat peta diklik.
   Hanya MENAMBAH; tidak mengubah layer/handler lama. Bergantung: peta.js (map, W, EX, sf), data.js, ecowave.js, ecowave_data.js. */
(function () {
  'use strict';
  if (typeof map === 'undefined' || !window.ECOWAVE) return;
  const E = ECOWAVE, UI = ECOWAVE_UI, g = id => document.getElementById(id), ALL = Object.keys(E.LAYER_META), BASE = 'assets/data/pltgl/';
  const n2 = (x, d = 2) => Number(x).toLocaleString((window.ECOWAVE_LOC||'id-ID'), { minimumFractionDigits: d, maximumFractionDigits: d });
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const paramTersimpan = () => paramEco();      // parameter bersama (Kalkulator -> Peta -> Beranda)

  // ---- kotak centang layer PLTGL
  const wadah = g('ecoLayers');
  if (wadah) UI.panelLayer({ wadah, map, base: BASE, layers: ['mangrove', 'karang', 'reef', 'lamun', 'konservasi', 'batimetri', 'perairan5km', 'gardu', 'jalur_listrik', 'jalur_pelayaran', 'pelabuhan'] });

  // ---- layer ArcGIS tambahan; visualisasi saja, tidak dipakai dalam perhitungan MCA
  const asikWadah = g('asikLayers');
  if (asikWadah) {
    const tegangan = v => {
      if (v == null || v === '') return '';
      const n = parseFloat(String(v).split(';')[0]);
      return isFinite(n) ? (n >= 1000 ? (n / 1000) + ' kV' : n + ' V') : v;
    };
    const asikLayers = [
      { file: 'jalur_listrik.geojson', nama: 'Jalur listrik', warna: '#f97316', pola: '3,5',
        baris: p => [['Nama', p.name], ['Tegangan', tegangan(p.voltage)], ['Operator', p.operator], ['Sumber atribut', p.source]] },
      { file: 'jalur_kapal.geojson', nama: 'Jalur kapal / feri', warna: '#e879f9', pola: '6,5',
        baris: p => [['Rute', p.name || 'Rute feri'], ['Operator', p.operator], ['Jenis', p.route], ['Status', p.operational_status]] },
      { file: 'perairan.geojson', nama: 'Perairan pesisir 5 km', warna: '#38bdf8', isi: '#38bdf8', isiOpasitas: .12,
        baris: p => [['Perairan', p.nama || 'Perairan pesisir 5 km']] },
      { file: 'gardu.geojson', nama: 'Gardu', warna: '#f59e0b', titik: true,
        baris: p => [['Nama', p.name], ['Jenis', p.substation || p.power], ['Operator', p.operator], ['Sumber', p.source]] },
      { file: 'pelabuhan.geojson', nama: 'Dermaga', warna: '#a855f7', titik: true,
        baris: p => [['Nama', p.name], ['Jenis', p.amenity]] }
    ];
    asikLayers.forEach(spec => {
      const label = document.createElement('label');
      label.style.cssText = 'display:flex;align-items:center;gap:6px;font-size:12.5px;cursor:pointer';
      const check = document.createElement('input');
      check.type = 'checkbox';
      const swatch = document.createElement('i');
      swatch.style.cssText = 'width:11px;height:8px;border-radius:3px;display:inline-block;background:' + spec.warna;
      if (spec.pola) swatch.style.borderTop = '2px dashed ' + spec.warna;
      const text = document.createElement('span');
      text.textContent = spec.nama;
      const status = document.createElement('em');
      status.style.cssText = 'margin-left:auto;font-style:normal;opacity:.65;font-size:10px';
      status.setAttribute('aria-live', 'polite');
      label.append(check, swatch, text, status);
      asikWadah.appendChild(label);
      let layer = null;
      check.addEventListener('change', async () => {
        if (!check.checked) {
          if (layer) map.removeLayer(layer);
          return;
        }
        try {
          status.textContent = 'memuat…';
          if (!layer) {
            const response = await fetch('assets/data/pltgl/asik/' + spec.file);
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const gj = await response.json();
            if (!gj || gj.type !== 'FeatureCollection' || !Array.isArray(gj.features)) throw new Error('GeoJSON tidak valid');
            layer = L.geoJSON(gj, {
              style: () => ({ color: spec.warna, weight: 2, opacity: .9, fillColor: spec.isi || spec.warna, fillOpacity: spec.isiOpasitas || .15, dashArray: spec.pola }),
              pointToLayer: spec.titik ? (feature, latlng) => L.circleMarker(latlng, { radius: 6, color: '#fff', weight: 1.5, fillColor: spec.warna, fillOpacity: .95 }) : undefined,
              onEachFeature: (feature, item) => {
                const rows = spec.baris(feature.properties || {}).filter(r => r[1] != null && r[1] !== '');
                const popup = '<div class="cp-card"><h4>' + esc(spec.nama) + '</h4>' +
                  rows.map(r => '<dl><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></dl>').join('') +
                  '<div class="tip">Ekspor proyek ArcGIS; ditampilkan sebagai layer tambahan.</div></div>';
                item.bindPopup(popup, PG.OPS_POPUP);
              }
            });
          }
          layer.addTo(map);
          status.textContent = '(' + layer.getLayers().length + ')';
        } catch (e) {
          check.checked = false;
          status.textContent = 'gagal dimuat';
          status.title = e.message || String(e);
          console.warn('Gagal memuat layer ArcGIS ' + spec.file, e);
        }
      });
    });
  }

  // ---- zona ECO-WAVE (grid)
  let zona = null;
  const btn = g('ecoZona'), info = g('ecoZonaInfo');
  function hapusZona() { if (zona) { map.removeLayer(zona); zona = null; } if (btn) btn.textContent = 'Zona ECO-WAVE'; }
  if (btn) btn.onclick = async () => {
    if (zona) { hapusZona(); info.textContent = ''; return; }
    btn.disabled = true; info.textContent = 'Memuat data & menghitung zona… 0%';
    try {
      await Promise.all([E.muat(ALL, BASE), E.muatRaster(BASE)]);
      const P = paramTersimpan(), f = typeof sf === 'function' ? sf() : 1; P.dayaSkala = f;
      const cells = await E.zonaGrid({ step: 0.01, P, W, mask: EX, desa: DESA, latMaks: P.zonaLatMaks, kwFn: (la, ln) => interpolasiCMEMS(la, ln).p * f, onProgress: p => info.textContent = 'Menghitung zona… ' + Math.round(p * 100) + '%' });
      const grp = L.layerGroup(); let ex = 0;
      cells.forEach(c => {
        const gugur = EX && c.ex; if (gugur) ex++; const h = c.step / 2;
        L.rectangle([[c.lat - h, c.lng - h], [c.lat + h, c.lng + h]], { stroke: false, fillColor: gugur ? '#9ca3af' : c.kelas.c, fillOpacity: gugur ? .45 : .62 })
          .bindPopup('<b>' + (gugur ? 'Tereksklusi' : c.kelas.n) + '</b> • skor ' + n2(c.fin) + '<br>Daya ' + n2(c.kw) + ' kW/m' + (c.alasan.length ? '<br><small>' + esc(c.alasan.join('; ')) + '</small>' : '') + (c.luarCakupan ? '<br><small>Di luar cakupan data habitat; hasil perlu diverifikasi.</small>' : '') +
            '<br><a href="kalkulator.php?lat=' + c.lat.toFixed(4) + '&lng=' + c.lng.toFixed(4) + '">Hitung di Kalkulator</a>').addTo(grp);
      });
      zona = grp.addTo(map); btn.textContent = 'Hapus zona';
      info.innerHTML = '<b>' + cells.length.toLocaleString((window.ECOWAVE_LOC||'id-ID')) + '</b> sel (±1 km) dinilai; tereksklusi <b>' + ex + '</b>. Warna = kelas MCDA data nyata (bobot & eksklusi sama dengan panel MCA). Sel utara lintang ' + n2(P.zonaLatMaks, 2) + ' dilewati.';
    } catch (e) { info.textContent = 'Gagal: ' + e.message; }
    finally { btn.disabled = false; }
  };


  // ---- layer buatan admin (Impor Layer GeoJSON di admin.php; daftar ada di layer_pengguna.json)
  (async () => {
    if (!wadah) return; let reg = [];
    try { const r = await fetch(BASE + 'layer_pengguna.json', { cache: 'no-store' }); if (r.ok) reg = await r.json(); } catch (e) {}
    if (!Array.isArray(reg) || !reg.length) return;
    const h = document.createElement('div'); h.style.cssText = 'font-size:11px;opacity:.7;margin-top:6px'; h.textContent = 'Layer buatan admin'; wadah.appendChild(h);
    reg.forEach(ly => {
      const warna = /^#[0-9a-fA-F]{6}$/.test(ly.warna || '') ? ly.warna : '#22d3ee', lb = document.createElement('label');
      lb.style.cssText = 'display:flex;align-items:center;gap:6px;font-size:12.5px;cursor:pointer';
      lb.innerHTML = '<input type="checkbox"><i style="width:11px;height:11px;border-radius:3px;background:' + warna + ';display:inline-block"></i><span>' + esc(ly.label) + ' <small style="opacity:.6">(' + (+ly.fitur || 0) + ')</small></span><em style="font-size:11px;opacity:.6"></em>';
      wadah.appendChild(lb);
      const cb = lb.querySelector('input'), st = lb.querySelector('em'); let lap = null;
      cb.addEventListener('change', async () => {
        if (!cb.checked) { if (lap) map.removeLayer(lap); return; }
        try {
          st.textContent = 'memuat…';
          if (!lap) {
            if (!/^pengguna\/[a-z0-9_]+\.geojson$/.test(ly.file || '')) throw new Error('berkas tidak valid');
            const r = await fetch(BASE + ly.file); if (!r.ok) throw new Error('HTTP ' + r.status); const gj = await r.json();
            lap = L.geoJSON(gj, { style: () => ({ color: warna, weight: 2, fillColor: warna, fillOpacity: .25 }), pointToLayer: (f, ll) => L.circleMarker(ll, { radius: 5, color: '#fff', weight: 1, fillColor: warna, fillOpacity: .9 }),
              onEachFeature: (f, l) => { const p = f.properties || {}, ks = Object.keys(p).slice(0, 8);
                l.bindPopup('<b>' + esc(ly.label) + '</b>' + ks.map(k => '<br>' + esc(k) + ': ' + esc(typeof p[k] === 'object' ? JSON.stringify(p[k]) : p[k])).join('') + (ly.sumber ? '<br><small>Sumber: ' + esc(ly.sumber) + '</small>' : '')); } });
          }
          lap.addTo(map); st.textContent = '';
        } catch (e) { cb.checked = false; st.textContent = 'gagal'; console.warn(e); }
      });
    });
  })();

})();
