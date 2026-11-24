/* ECO-WAVE - pembantu data Peta & Kalkulator: gambar layer GeoJSON PLTGL di Leaflet + legenda.
   Bergantung pada ecowave.js dan Leaflet (L). Tidak mengubah layer lama. */
(function (root) {
  'use strict';
  const E = root.ECOWAVE;
  const GAYA = {
    mangrove:        { color: '#15803d', weight: 1, fillColor: '#22c55e', fillOpacity: .55 },
    karang:          { color: '#be185d', weight: 1, fillColor: '#ec4899', fillOpacity: .55 },
    reef:            { color: '#db2777', weight: 1, fillColor: '#f9a8d4', fillOpacity: .30, dashArray: '3,3' },
    lamun:           { color: '#0f766e', weight: 1, fillColor: '#14b8a6', fillOpacity: .50 },
    konservasi:      { color: '#4f46e5', weight: 2, fillColor: '#6366f1', fillOpacity: .20 },
    perairan5km:     { color: '#38bdf8', weight: 1, fillColor: '#38bdf8', fillOpacity: .08, dashArray: '5,5' },
    jalur_listrik:   { color: '#facc15', weight: 2, opacity: .9 },
    jalur_pelayaran: { color: '#ef4444', weight: 2, opacity: .85, dashArray: '6,5' }
  };
  const BATI_WARNA = { 1: '#08306b', 2: '#08519c', 3: '#2171b5', 4: '#4292c6', 5: '#6baed6', 6: '#c6dbef' };
  const POPUP = {
    mangrove: () => '<b>Mangrove</b>', karang: () => '<b>Terumbu karang</b><br>Allen Coral Atlas (Coral/Algae)', reef: () => '<b>Reef extent</b>',
    lamun: () => '<b>Lamun</b>', konservasi: () => '<b>Kawasan konservasi</b><br>Zona eksklusi',
    perairan5km: () => '<b>Perairan pesisir 5 km</b>',
    jalur_listrik: p => '<b>Jalur listrik</b>' + (p.voltage ? '<br>' + String(p.voltage).replace(/;/g, ' / ').replace(/(\d+)/g, v => (+v >= 1000 ? (+v / 1000) + ' kV' : v)) : '') + (p.name ? '<br>' + p.name : ''),
    jalur_pelayaran: p => '<b>Jalur pelayaran / feri</b>' + (p.name ? '<br>' + p.name : '')
  };
  const ikon = (warna, html) => L.divIcon({ className: '', iconSize: [18, 18], iconAnchor: [9, 9],
    html: '<div style="width:18px;height:18px;border-radius:5px;background:' + warna + ';border:2px solid #fff;box-shadow:0 0 6px rgba(0,0,0,.5);display:grid;place-items:center;font-size:11px;color:#111">' + html + '</div>' });

  // buatLayer('karang') -> Promise<L.Layer> (data dimuat saat pertama dibutuhkan)
  async function buatLayer(nama, base) {
    await E.muat([nama], base);
    const gj = E.RAWGJ[nama], meta = E.LAYER_META[nama];
    if (nama === 'batimetri') return L.geoJSON(gj, { style: f => ({ color: BATI_WARNA[f.properties.class_id], weight: .4, fillColor: BATI_WARNA[f.properties.class_id], fillOpacity: .45 }),
      onEachFeature: (f, l) => l.bindPopup('<b>Batimetri</b><br>' + f.properties.depth_range) });
    if (nama === 'gardu') return L.geoJSON(gj, { pointToLayer: (f, ll) => L.marker(ll, { icon: ikon('#f59e0b', '⚡') }),
      onEachFeature: (f, l) => l.bindPopup('<b>Gardu listrik</b>' + (f.properties.operator ? '<br>' + f.properties.operator : '') + (f.properties.name ? '<br>' + f.properties.name : '')) });
    if (nama === 'pelabuhan') return L.geoJSON(gj, { pointToLayer: (f, ll) => L.marker(ll, { icon: ikon('#a855f7', '⚓') }),
      onEachFeature: (f, l) => l.bindPopup('<b>' + (f.properties.name || 'Pelabuhan') + '</b><br>' + (f.properties.amenity || '')) });
    return L.geoJSON(gj, { style: () => GAYA[nama], interactive: nama !== 'perairan5km', onEachFeature: (f, l) => l.bindPopup((POPUP[nama] || (() => '<b>' + meta.label + '</b>'))(f.properties || {})) });
  }

  // Pasang daftar kotak centang ke sebuah wadah. Layer dimuat malas saat dicentang.
  // opsi: { wadah: Element, map, layers: ['mangrove',...], onChange: fn }
  function panelLayer(opsi) {
    const hidup = {};
    opsi.layers.forEach(n => {
      const meta = E.LAYER_META[n], lb = document.createElement('label');
      lb.style.cssText = 'display:flex;align-items:center;gap:6px;font-size:12.5px;cursor:pointer';
      lb.innerHTML = '<input type="checkbox" data-eco="' + n + '"><i style="width:11px;height:11px;border-radius:3px;background:' + meta.warna + ';display:inline-block"></i><span>' + meta.label + '</span><em style="margin-left:auto;font-style:normal;opacity:.55;font-size:11px"></em>';
      opsi.wadah.appendChild(lb);
      const cb = lb.querySelector('input'), st = lb.querySelector('em');
      cb.addEventListener('change', async () => {
        if (cb.checked) {
          try { st.textContent = 'memuat…'; if (!hidup[n]) hidup[n] = await buatLayer(n, opsi.base); hidup[n].addTo(opsi.map); st.textContent = ''; if (n === 'perairan5km' || n === 'batimetri') hidup[n].bringToBack(); }
          catch (e) { cb.checked = false; st.textContent = 'gagal'; console.warn(e); }
        } else if (hidup[n]) { opsi.map.removeLayer(hidup[n]); }
        opsi.onChange && opsi.onChange();
      });
    });
    return hidup;
  }

  root.ECOWAVE_UI = { buatLayer, panelLayer, GAYA, BATI_WARNA };
})(window);
