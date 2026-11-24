// ECO-WAVE - halaman Hasil CMEMS: grafik + urut tabel
function mk(id,cfg){const c=document.getElementById(id);if(c)new Chart(c,cfg)}
function gambarChartCMEMS(){
  if(typeof Chart==='undefined') return;
  Chart.defaults.color='#8db3c9';Chart.defaults.borderColor='rgba(94,226,255,.12)';
  mk('chartTren',{type:'line',data:{labels:CMEMS.tahunan.label,datasets:[{label:'Rata-rata (kW/m)',data:CMEMS.tahunan.rata,borderColor:'#22d3ee',backgroundColor:'rgba(34,211,238,.16)',fill:true,tension:.35,pointBackgroundColor:'#facc15',pointRadius:4},{label:'Median (kW/m)',data:CMEMS.tahunan.median,borderColor:'#facc15',borderDash:[6,4],fill:false,tension:.35,pointRadius:0}]},options:{responsive:true,plugins:{legend:{display:true}}}});
  const opt={responsive:true,plugins:{legend:{display:true}}};
  mk('chBulanan',{type:'bar',data:{labels:CMEMS.bulanan.label,datasets:[{label:'P (kW/m)',data:CMEMS.bulanan.p,backgroundColor:'#00A8A8'},{label:'Hs (m) x10',data:CMEMS.bulanan.hs.map(v=>v*10),type:'line',borderColor:'#f59e0b',fill:false}]},options:opt});
  mk('chMusiman',{type:'bar',data:{labels:CMEMS.musiman.label,datasets:[{label:'Rata-rata (kW/m)',data:CMEMS.musiman.p,backgroundColor:['#94a3b8','#38bdf8','#0ea5e9','#f59e0b']}]},options:opt});
  mk('chTahunan',{type:'line',data:{labels:CMEMS.tahunan.label,datasets:[{label:'Rata-rata',data:CMEMS.tahunan.rata,borderColor:'#00A8A8',fill:false},{label:'Median',data:CMEMS.tahunan.median,borderColor:'#f59e0b',fill:false}]},options:opt});
  mk('chDistribusi',{type:'bar',data:{labels:CMEMS.distribusi.label,datasets:[{label:'% Waktu',data:CMEMS.distribusi.waktu,backgroundColor:'#38bdf8'},{label:'% Energi',data:CMEMS.distribusi.energi,backgroundColor:'#0ea5e9'}]},options:opt});
}
let sortAsc=true; function sortTitik(kolom){ const tb=document.querySelector('#tblTitik tbody'); const rows=Array.from(tb.rows); sortAsc=!sortAsc; rows.sort((a,b)=>{ if(kolom==='nama'){let va=a.cells[0].innerText,vb=b.cells[0].innerText; return sortAsc?va.localeCompare(vb):vb.localeCompare(va);} let va=parseFloat(a.cells[3].innerText.replace(',','.')); let vb=parseFloat(b.cells[3].innerText.replace(',','.')); return sortAsc?va-vb:vb-va; }); rows.forEach(r=>tb.appendChild(r)); }
function resizeCharts(){['chBulanan','chMusiman','chTahunan','chDistribusi'].forEach(id=>{try{const c=Chart.getChart(document.getElementById(id));c&&c.resize()}catch(e){}})}
window.onTab=g=>{if(g==='hasil')resizeCharts()};
gambarChartCMEMS();

// ===== Semua angka dihitung dari CMEMS (data.js) + parameter bersama; tidak ada angka yang ditulis manual (celah K1) =====
(function(){
 const f=(x,d=1)=>Number(x).toLocaleString((window.ECOWAVE_LOC||'id-ID'),{minimumFractionDigits:d,maximumFractionDigits:d});
 function regresi(y){const n=y.length,xs=y.map((_,i)=>i),mx=(n-1)/2,my=y.reduce((a,b)=>a+b,0)/n;let sxy=0,sxx=0;xs.forEach((x,i)=>{sxy+=(x-mx)*(y[i]-my);sxx+=(x-mx)*(x-mx)});const b=sxy/sxx;return{lereng:b,persen:b/my*100,rata:my}}
 function render(){
  const P=paramEco(),T=CMEMS.titik,p0=T[0],maks=T.filter(t=>t.maks!=null).reduce((a,b)=>b.maks>a.maks?b:a,{maks:null,nama:'(tidak ada data)'}),dist=CMEMS.distribusi,di10=dist.waktu.slice(2).reduce((a,b)=>a+b,0);
  const tr=regresi(CMEMS.tahunan.rata),prio=D.filter(l=>!(EX&&l.ex)&&fin(l)>=3.4).length,exN=D.filter(l=>EX&&l.ex).length;
  const k=(ikon,lab,num,sub,kls)=>`<div class="card kpi-big"><span class="kpi-label ${kls||''}"><i class="bi ${ikon}"></i> ${lab}</span><div class="kpi-num ${kls||''}">${num}</div><p>${sub}</p></div>`;
  document.getElementById('hasilKpi').innerHTML=
   k('bi-lightning-charge','Daya Maks',(maks.maks==null?'–':f(maks.maks,2))+' <small>kW/m</small>','Nilai maksimum seri 2015-2024 di '+maks.nama+'. Rata-rata '+p0.nama+': '+f(p0.p,2)+' kW/m')+
   k('bi-clock-history','Waktu di atas 10 kW/m',f(di10,0)+'%','Dari distribusi klimatologi titik acuan (bukan luas area)','teal')+
   k('bi-geo-alt','Lokasi Prioritas',prio,'Kandidat DEMO dengan skor ≥ 3,4 (bobot aktif di Peta)')+
   k('bi-x-circle','Zona Eksklusi',exN,'Kandidat DEMO tereksklusi (mask '+(EX?'ON':'OFF')+')','red');
  document.getElementById('trenNote').textContent='*Regresi linear data tahunan: '+(tr.lereng>=0?'+':'')+f(tr.lereng,2)+' kW/m per tahun ('+(tr.persen>=0?'+':'')+f(tr.persen,1)+'%/tahun) — '+(Math.abs(tr.persen)<1?'praktis datar; 10 tahun terlalu pendek untuk menyimpulkan tren.':tr.persen<0?'cenderung menurun.':'cenderung naik.')+' Puncak musiman Jun-Agu.';
  const pk=CMEMS.bulanan,iMaks=pk.p.indexOf(Math.max(...pk.p));
  document.getElementById('tblBulan').innerHTML=pk.label.map((b,i)=>`<tr${i===iMaks?' class="hl"':''}><td>${b}</td><td>${f(pk.hs[i],2)}</td><td>${f(pk.p[i],2)}</td><td>${f(pk.p[i]*P.lebar*P.efisiensi*P.unit,1)}</td></tr>`).join('');
  document.getElementById('bulanNote').textContent='Listrik = daya × lebar '+P.lebar+' m × efisiensi '+Math.round(P.efisiensi*100)+'% × '+P.unit+' perangkat (parameter dari Kalkulator). Baris tertinggi: '+pk.label[iMaks]+'.';
  const mus=CMEMS.musiman;
  document.getElementById('interpretasi').innerHTML=(T.length>1?(()=>{const hi=T.reduce((a,b)=>b.p>a.p?b:a),lo=T.reduce((a,b)=>b.p<a.p?b:a);return hi.nama+' memiliki daya rata-rata tertinggi ('+f(hi.p,2)+' kW/m) dan '+lo.nama+' terendah ('+f(lo.p,2)+' kW/m), selisih '+f((hi.p-lo.p)/hi.p*100,0)+'%'})():'Hanya ada satu titik acuan ('+p0.nama+', '+f(p0.p,2)+' kW/m)')+'. Daya musim timur (JJA, '+f(mus.p[2],1)+' kW/m) sekitar '+f(mus.p[2]/mus.p[0],1)+'× musim barat (DJF, '+f(mus.p[0],1)+' kW/m). Titik CMEMS berada lepas pantai; daya di dekat pantai belum dimodelkan (refraksi/shoaling).';
 }
 const awal=async()=>{await muatData();render()};awal();
 window.onSinkron=()=>render();
})();
