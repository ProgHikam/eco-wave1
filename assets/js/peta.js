// ECO-WAVE - halaman Peta: peta Leaflet, layer, bobot MCA, detail lokasi, Windy, klik peta
const map=L.map('map',{zoomSnap:.25,wheelPxPerZoomLevel:90}).setView([-7.05,106],9);
const PG=ECOWAVE_PETA;
const ecoApi=window.ECOWAVE;
const BM=PG.pasangBasemap(map,{awal:'gelap',posisi:'topright'});     // pilihan peta dasar (Gelap/Laut/Satelit/Jalan/Topografi/OSM), diingat antar halaman
PG.kontrolUmum(map,{layarPenuh:document.getElementById('peta'),titik:()=>window.__titikPeta&&window.__titikPeta()});
let studyLayer=PG.batasStudi(map,ecoApi.batasAreaStudi());
const studyBoundInputs=['studyBoundSouth','studyBoundWest','studyBoundNorth','studyBoundEast'].map(id=>document.getElementById(id));
const studyBoundary=document.getElementById('studyBoundary');
const studyBoundApply=document.getElementById('studyBoundApply'),studyBoundReset=document.getElementById('studyBoundReset'),studyBoundStatus=document.getElementById('studyBoundStatus');
function setInputAreaStudi(b){studyBoundInputs[0].value=b[1].toFixed(4);studyBoundInputs[1].value=b[0].toFixed(4);studyBoundInputs[2].value=b[3].toFixed(4);studyBoundInputs[3].value=b[2].toFixed(4)}
function gambarAreaStudi(b){if(studyLayer)map.removeLayer(studyLayer);studyLayer=PG.batasStudi(map,b);if(studyBoundary&&!studyBoundary.checked)map.removeLayer(studyLayer)}
if(studyBoundary)studyBoundary.onchange=()=>{if(!studyLayer)return;if(studyBoundary.checked)studyLayer.addTo(map);else map.removeLayer(studyLayer)};
setInputAreaStudi(ecoApi.batasAreaStudi());
if(studyBoundReset)studyBoundReset.disabled=!ecoApi.batasAreaStudiKustom();
if(studyBoundApply)studyBoundApply.onclick=()=>{
 const vals=studyBoundInputs.map(i=>Number(i.value)),[south,west,north,east]=vals;
 if(vals.some(v=>!Number.isFinite(v))||south < -8||north > -6||west < 104.5||east > 107||south>=north||west>=east){studyBoundStatus.textContent='Koordinat tidak valid. Gunakan area studi maksimum (lat −8…−6, bujur 104,5…107) dan pastikan batas selatan < utara serta barat < timur.';return}
 try{const b=[west,south,east,north];ecoApi.simpanBatasAreaStudi(b);gambarAreaStudi(b);studyBoundReset.disabled=false;studyBoundStatus.textContent='Kotak area studi diperbarui. Titik dan zona di luar kotak tidak dihitung.'}
 catch(err){studyBoundStatus.textContent='Gagal menyimpan area studi: '+err.message}
};
if(studyBoundReset)studyBoundReset.onclick=()=>{
 try{ecoApi.simpanBatasAreaStudi(null);const b=ecoApi.batasAreaStudi();setInputAreaStudi(b);gambarAreaStudi(b);studyBoundReset.disabled=true;studyBoundStatus.textContent='Area studi dikembalikan ke batas awal.'}
 catch(err){studyBoundStatus.textContent='Gagal mengembalikan area studi: '+err.message}
};
const ecoBoundary=document.getElementById('ecoBoundary');
const ecoBoundInputs=['ecoBoundSouth','ecoBoundWest','ecoBoundNorth','ecoBoundEast'].map(id=>document.getElementById(id));
const ecoBoundaryApply=document.getElementById('ecoBoundaryApply'),ecoBoundaryReset=document.getElementById('ecoBoundaryReset'),ecoBoundaryStatus=document.getElementById('ecoBoundaryStatus');
let ecoBoundaryLayer=null,ecoCoverage=null;
if(ecoBoundary)ecoBoundary.addEventListener('change',()=>{if(!ecoBoundaryLayer)return;if(ecoBoundary.checked)ecoBoundaryLayer.addTo(map);else map.removeLayer(ecoBoundaryLayer)});
function gambarBatasCakupan(batas){
 if(ecoBoundaryLayer)map.removeLayer(ecoBoundaryLayer);
 ecoBoundaryLayer=PG.batasCakupan(map,ecoCoverage,batas);
 if(ecoBoundaryLayer&&ecoBoundary&&!ecoBoundary.checked)map.removeLayer(ecoBoundaryLayer);
}
function setInputBatas(b){ecoBoundInputs[0].value=b[1].toFixed(4);ecoBoundInputs[1].value=b[0].toFixed(4);ecoBoundInputs[2].value=b[3].toFixed(4);ecoBoundInputs[3].value=b[2].toFixed(4)}
if(ecoBoundaryApply)ecoBoundaryApply.onclick=()=>{
 const vals=ecoBoundInputs.map(i=>Number(i.value)),[south,west,north,east]=vals;
 if(vals.some(v=>!Number.isFinite(v))||south < -8||north > -6||west < 104.5||east > 107||south>=north||west>=east){ecoBoundaryStatus.textContent='Koordinat tidak valid. Gunakan area studi (lat −8…−6, bujur 104,5…107) dan pastikan batas selatan < utara serta barat < timur.';return}
 try{const b=[west,south,east,north];ecoApi.simpanBatasAnalisisHabitat(b);gambarBatasCakupan(b);ecoBoundaryStatus.textContent='Batas area analisis diperbarui dan disimpan.'}
 catch(err){ecoBoundaryStatus.textContent='Gagal menyimpan batas: '+err.message}
};
if(ecoBoundaryReset)ecoBoundaryReset.onclick=()=>{
 if(!ecoCoverage)return;
 try{ecoApi.simpanBatasAnalisisHabitat(null);setInputBatas(ecoCoverage);gambarBatasCakupan(null);ecoBoundaryStatus.textContent='Batas analisis dikembalikan ke cakupan data asli.'}
 catch(err){ecoBoundaryStatus.textContent='Gagal mengembalikan batas: '+err.message}
};
// Layer "Mangrove/Karang/Lamun/Konservasi" berupa lingkaran & kotak tebakan DIHAPUS (celah P5); layer nyata ada di kartu "Data PLTGL (ECO-WAVE)".
const G={pow:L.layerGroup(),score:L.layerGroup()};
function gambarDaya(){G.pow.clearLayers();
 for(let la=-7.4;la<-6.5;la+=.06)for(let ln=105.4;ln<106.5;ln+=.06){let n=0,d=0;
  D.forEach(l=>{const w=1/(hav(la,ln,l.latitude,l.longitude)**2+100);n+=w*l.kw;d+=w});
  const p=n/d*sf();L.rectangle([[la,ln],[la+.06,ln+.06]],{stroke:false,fillColor:warna(p),fillOpacity:.45,interactive:false}).addTo(G.pow)}}
function gambarSkor(){G.score.clearLayers();
 D.forEach(l=>{const s=fin(l),k=kelas(s),gugur=EX&&l.ex;
  L.marker([l.latitude,l.longitude],{icon:PG.ikonSkor(s,k.c,l.name,gugur),riseOnHover:true,keyboard:false})
   .on('click',ev=>{L.DomEvent.stopPropagation(ev);tampil(l)}).addTo(G.score)})}
function popupKandidat(l,ll){const s=fin(l),k=kelas(s);
 L.popup(PG.OPS_POPUP).setLatLng(ll||[l.latitude,l.longitude]).setContent(PG.kartu({judul:l.name,sub:l.region+' · kandidat (data nyata)',skor:f2(s),warna:k.c,kelas:k.n,
  baris:[['Daya rata-rata',f2(l.kw,1)+' kW/m'],...KEY.map((x,i)=>[NAMA[x],f2(l.s[i],1)+' / 5'])],alert:(EX&&l.ex)?'Gugur oleh eksklusi (mask ON)':'',
  tip:'Skor kandidat dari data nyata (penapisan awal). Rinciannya ada di Kalkulator.',aksi:[{teks:'Hitung di Kalkulator',href:`kalkulator.php?lat=${l.latitude}&lng=${l.longitude}`}]})).openOn(map)}
const lay={lPow:'pow',lScore:'score'};
for(const id in lay)$(id).onchange=e=>{e.target.checked?G[lay[id]].addTo(map):map.removeLayer(G[lay[id]]);legenda()};

// ===== UI =====
function legenda(){let h='';
 if($('lPow').checked)h+=`<div>Daya gelombang (kW/m) — ${SEA[SA][0]}</div><div style="height:10px;border-radius:5px;background:linear-gradient(90deg,rgb(96,165,250),rgb(250,204,21),rgb(220,38,38))"></div><div class="flex justify-between"><span>kecil</span><span>sedang</span><span>besar</span></div>`;
 if($('lScore').checked)h+='<div class="mt-1">Skor kelayakan kandidat (merah=jelek, hijau=bagus)</div>'+[...KLS.map(([k,n,c])=>[n,c]),['Tidak Layak','#ef4444'],['Gugur','#9ca3af']].map(([n,c])=>`<div><i style="background:${c}" class="inline-block w-3 h-3 rounded-full"></i> ${n}</div>`).join('');
 $('legenda').innerHTML=h||'Aktifkan layer.';
 if(LEG)LEG.segarkan()}
let LEG=PG.kontrolLegenda(map,'Legenda',()=>{let h='';
 if($('lPow')&&$('lPow').checked)h+=`<div class="li" style="margin-top:8px;color:#fff;font-weight:700">Daya gelombang · ${SEA[SA][0]}</div><div class="bar"></div><div class="ket"><span>kecil</span><span>sedang</span><span>besar</span></div>`;
 if($('lScore')&&$('lScore').checked)h+=[...KLS.map(([k,n,c])=>[n,c]),['Tidak Layak','#ef4444'],['Gugur (eksklusi)','#9ca3af']].map(([n,c])=>PG.li(c,n,'c')).join('');
 h+=PG.li('#facc15','Titik CMEMS (acuan gelombang)','c')+PG.li('#60a5fa','Desa acuan','c')+PG.li('#22d3ee','Titik klik','c');
 return h},'topright');
$('musim').innerHTML=Object.entries(SEA).map(([k,[n]])=>`<button class="chip ${k==SA?'on':''}" data-k="${k}">${n}</button>`).join('');
$('musim').onclick=e=>{if(!e.target.dataset.k)return;SA=e.target.dataset.k;[...$('musim').children].forEach(b=>b.classList.toggle('on',b.dataset.k==SA));gambarDaya();legenda();simpanMCA()};
$('sliders').innerHTML=KEY.map(k=>`<div><div class="flex justify-between"><span>${NAMA[k]}</span><b id="v_${k}"></b></div><input type="range" min="0" max="100" id="w_${k}" class="w-full accent-teal-600"></div>`).join('');
function sinkron(){KEY.forEach(k=>{$('w_'+k).value=Math.round(W[k]*100);$('v_'+k).textContent=Math.round(W[k]*100)+'%'})}
KEY.forEach(k=>$('w_'+k).oninput=e=>{const v=e.target.value/100,sisa=1-v,lain=KEY.filter(x=>x!=k),so=lain.reduce((a,x)=>a+W[x],0);
 lain.forEach(x=>W[x]=so?W[x]/so*sisa:sisa/3);W[k]=v;sinkron();segarkan()});
$('reset').onclick=()=>{W={...DEF};sinkron();segarkan()};
$('mask').onchange=e=>{EX=e.target.checked;segarkan()};
$('uji').onclick=()=>{const base=rank()[0].name;let ok=0,t=0;
 KEY.forEach(k=>[.1,-.1].forEach(dl=>{const w={...W};w[k]=Math.min(1,Math.max(0,W[k]+dl));const so=KEY.filter(x=>x!=k).reduce((a,x)=>a+W[x],0);
  KEY.forEach(x=>{if(x!=k)w[x]=so?W[x]/so*(1-w[k]):(1-w[k])/3});
  const top=D.filter(l=>!(EX&&l.ex)).sort((a,b)=>sc(b,w)-sc(a,w))[0].name;t++;if(top==base)ok++}));
 $('ujiHasil').innerHTML=`Peringkat 1 (<b>${base}</b>) bertahan di <b>${ok}/${t}</b> skenario (bobot ±10 poin). ${ok==t?'Robust.':'Ranking berubah di sebagian skenario.'}`};

let wd=0;
function segarkan(){gambarSkor();const r=rank();
 if(!cur)$('insight').innerHTML=`<b>${r[0].name}</b> juara 1 dengan skor <b>${f2(fin(r[0]))}</b> (${kelas(fin(r[0])).n}). Klik peta untuk melihat skor titik lain.`;
 else tampil(cur);
 if(cmp.length)tabel();denyut();simpanMCA();if(!wd){wd=1;muatWindy()}}

function jelaskan(l){if(EX&&l.ex)return`${l.name} gugur karena eksklusi (TN Ujung Kulon / buffer ekosistem). Skor tanpa mask ${f2(sc(l))} tidak dipakai.`;
 const i=l.s.indexOf(Math.max(...l.s)),j=l.s.indexOf(Math.min(...l.s)),no=rank().findIndex(x=>x.id==l.id)+1;
 return`${l.name} peringkat ${no}/${D.length}: unggul di ${NAMA[KEY[i]]} (${l.s[i]}), terlemah di ${NAMA[KEY[j]]} (${l.s[j]}).`}
function tampil(l,jarak){cur=l;const s=fin(l),k=kelas(s);
 $('dName').textContent=l.name+', '+l.region;$('dCoord').textContent=`${f2(l.latitude,4)}, ${f2(l.longitude,4)} • daya rata-rata ${f2(l.kw,1)} kW/m`;
 $('dScore').textContent=f2(s);$('dScore').style.color=k.c;$('dBadge').textContent=k.n;$('dBadge').style.cssText=`background:${k.c};color:${s>=4.2?'#fff':'#06121f'}`;
 $('dBars').innerHTML=KEY.map((x,i)=>`<div><div class="flex justify-between"><span>${NAMA[x]}</span><b>${f2(l.s[i],1)}/5</b></div><div class="bar"><i style="width:${l.s[i]*20}%;background:hsl(${l.s[i]*24},70%,45%)"></i></div></div>`).join('')+'<p class="text-[11px] opacity-60">Ekosistem: tinggi = jauh dari ekosistem sensitif.</p>';
 $('dExp').textContent=jelaskan(l);
 const m=monthly(l),dk=document.documentElement.classList.contains('dark');Chart.defaults.color=dk?'#cbd5e1':'#475569';
 c1&&c1.destroy();c2&&c2.destroy();
 c1=new Chart($('cLine'),{type:'line',data:{labels:BLN,datasets:[{label:'Daya (kW/m)',data:m,borderColor:'#0d9488',backgroundColor:'#0d948822',fill:true,tension:.3}]},options:{plugins:{legend:{display:false},title:{display:true,text:'Daya per bulan (perkiraan skala musiman)'}}}});
 c2=new Chart($('cBar'),{type:'bar',data:{labels:['Daya','Ekosistem','Kedalaman','Jarak'],datasets:[{label:'Skor kriteria (1-5)',data:l.s,backgroundColor:'#00A8A8'}]},options:{plugins:{legend:{display:false}},scales:{y:{min:0,max:5}}}});
 $('detail').classList.add('open');$('insight').classList.remove('hidden');$('hasilKlik').classList.add('hidden');
 const no=rank().findIndex(x=>x.id==l.id)+1;
 $('insight').innerHTML=`${jarak!=null?`Titik terdekat: <b>${l.name}</b> (${jarak} km). `:''}<b>${l.name}</b>: skor ${f2(s)} (${k.n}), peringkat ${no}/${D.length}. ${jelaskan(l)}`}
function fokus(id){const l=D.find(x=>x.id==id);map.flyTo([l.latitude,l.longitude],11);tampil(l)}
$('tutup').onclick=()=>{$('detail').classList.remove('open');cur=null;segarkan()};
function nearest(la,ln){return D.map(l=>({l,d:hav(la,ln,l.latitude,l.longitude)})).sort((a,b)=>a.d-b.d)[0]}
$('cari').onchange=e=>{const q=e.target.value.toLowerCase(),l=D.find(x=>x.name.toLowerCase().includes(q));if(l)fokus(l.id)};
$('bBand').onclick=()=>{if(!cur)return;if(!cmp.includes(cur.id))cmp.push(cur.id);cmp=cmp.slice(-2);tabel();$('bandingkan').scrollIntoView({behavior:'smooth'})};
function tabel(){const a=cmp.map(i=>D.find(l=>l.id==i)),b=$('bandingkan');b.classList.remove('hidden');
 if(a.length<2){b.innerHTML='Pilih satu lokasi lagi (klik peta → Bandingkan).';return}
 const rows=[['Daya rata-rata',l=>f2(l.kw,1)+' kW/m'],...KEY.map((k,i)=>[NAMA[k],l=>f2(l.s[i],1)]),['Eksklusi',l=>l.ex?'Ya':'Tidak'],['Skor akhir',l=>f2(fin(l))],['Kelas',l=>kelas(fin(l)).n]];
 b.innerHTML=`<b>Bandingkan Lokasi</b><table class="w-full text-sm mt-2"><tr><th></th>${a.map(l=>`<th>${l.name}</th>`).join('')}</tr>${rows.map(([n,f])=>`<tr class="border-t"><td>${n}</td>${a.map(l=>`<td class="text-center">${f(l)}</td>`).join('')}</tr>`).join('')}</table>`}
// Export PNG/PDF untuk lokasi kandidat terpilih: dihitung ulang dengan model bersama (bobot, musim, eksklusi yang sedang aktif).
async function srcKandidat(){if(!cur)return null;const EW=window.ECOWAVE,B='assets/data/pltgl/';await Promise.all([EW.muat(Object.keys(EW.LAYER_META),B),EW.muatRaster(B)]);
 const h=hitungModel(cur.latitude,cur.longitude);return{halaman:'peta',lat:h.lat,lng:h.lng,musim:SA,gel:h.gel,pTahunan:h.gel.inter&&h.gel.inter.p,sp:h.sp,m:h.m,en:h.en,P:h.P,EX,map}}
['bPdf','bPng'].forEach(id=>{const b=$(id);b.innerHTML=id==='bPdf'?'<i class="bi bi-file-earmark-pdf"></i> Export PDF':'<i class="bi bi-image"></i> Export PNG';
 b.onclick=async()=>{try{const src=await srcKandidat();window.ECOWAVE_EKSPOR.ekspor(id==='bPdf'?'pdf':'png',src,b)}catch(e){window.ECOWAVE_EKSPOR.toast('Gagal menyiapkan data: '+e.message,'galat')}}});


window.onDataBerubah=()=>{cur=null;$('detail').classList.remove('open');gambarDaya();segarkan();muatWindy()};
(async()=>{await muatData();$('mask').checked=EX;
 G.pow.addTo(map);G.score.addTo(map);gambarDaya();sinkron();legenda();segarkan();
 const f=new URLSearchParams(location.search).get('fokus');if(f&&D.find(x=>x.id==f))fokus(f)})();

['bBand','uji'].forEach(id=>{const o=$(id).onclick;$(id).onclick=e=>perlu(()=>o(e))});
const omask=$('mask').onchange;
$('mask').onchange=e=>{if(!e.target.checked&&!ME){e.target.checked=true;
 perlu(()=>{$('mask').checked=false;omask({target:$('mask')})},'Mode Eksklusi OFF perlu login.');return}omask(e)};


function denyut(){}   // lencana skor sudah berdenyut sendiri (peta_gaya.css)

async function muatWindy(){await Promise.all(D.map(l=>windy(l.latitude,l.longitude,l).then(j=>l.live=j)));
 const sim=D.some(l=>l.live.sim);const uji=!sim&&D.some(l=>l.live.trial),w=$('wWarn');const om=!sim&&D.some(l=>l.live.src==='open-meteo');$('wStat').textContent=sim?'SIMULASI':uji?'DATA UJI • Trial':om?'LIVE • GFS Wave (Open-Meteo)':'LIVE • Windy';$('wStat').style.background=(sim||uji)?'#fbbf24':'';w.classList.toggle('hidden',!(sim||uji||om));w.innerHTML=sim?'<b>SIMULASI</b> — gagal mengambil data (cek koneksi internet).':om?'<b>Prakiraan GFS Wave</b> via Open-Meteo Marine (gratis, tanpa registrasi). Prakiraan jangka pendek, bukan pengukuran dan bukan pengganti klimatologi.':'<b>DATA UJI</b> — kunci Trial Windy mengacak data. Jangan dikutip di laporan; angka resmi memakai ERA5.';
 $('wNote').textContent=sim?`Simulasi: ${D[0].live.err||''}`:'';
 if(sim){$('wTbl').innerHTML='<tr><td colspan="5">Data live tidak tersedia (Windy/GFS tidak terjangkau). Angka simulasi sengaja tidak ditampilkan.</td></tr>';c3&&c3.destroy();$('dLive').textContent='';return}
 const mx=Math.max(...D.map(l=>l.live.now.p))||1;
 $('wTbl').innerHTML=[...D].sort((a,b)=>b.live.now.p-a.live.now.p).map((l,i)=>`<tr class="border-t"><td>${i+1}</td><td>${l.name}<div class="bar"><i style="width:${l.live.now.p/mx*100}%;background:linear-gradient(90deg,#60a5fa,#facc15,#dc2626)"></i></div></td><td>${f2(l.live.now.hs,1)} m</td><td>${f2(l.live.now.tp,0)} s</td><td><b>${f2(l.live.now.p,1)}</b></td></tr>`).join('');
 if(cur)gambarWindy(cur)}
let c3;
function gambarWindy(l){const v=l.live;if(!v)return;
 if(v.sim){$('dLive').innerHTML='<b>Windy/GFS tidak terjangkau</b> — angka simulasi tidak ditampilkan.';c3&&c3.destroy();return}
 $('dLive').innerHTML=`<b>Live ${v.sim?'(SIMULASI)':v.trial?'(DATA UJI Windy)':'(Windy)'}</b>: Hs ${f2(v.now.hs)} m • Tp ${f2(v.now.tp,1)} s • arah ${Math.round(v.now.dir)}° → <b>${f2(v.now.p,1)} kW/m</b>`;
 c3&&c3.destroy();
 c3=new Chart($('cWin'),{type:'line',data:{labels:v.series.map(x=>new Date(x.t).toLocaleString((window.ECOWAVE_LOC||'id-ID'),{weekday:'short',hour:'2-digit'})),datasets:[{label:'kW/m',data:v.series.map(x=>+x.p.toFixed(2)),borderColor:'#2563eb',backgroundColor:'#2563eb22',fill:true,tension:.3}]},options:{plugins:{legend:{display:false},title:{display:true,text:'Prakiraan daya ±3 hari (kW/m)'+(v.sim?' - SIMULASI':v.trial?' - DATA UJI':'')}}}})}
const _tp=tampil;tampil=function(l,j){_tp(l,j);gambarWindy(l)};
function setWindy(la,ln){$('wIf').src=`https://embed.windy.com/embed2.html?lat=${la}&lon=${ln}&detailLat=${la}&detailLon=${ln}&zoom=8&level=surface&overlay=waves&product=ecmwf&menu=&message=true&marker=true&calendar=now&type=map&location=coordinates&metricWind=default&metricTemp=default`}
$('wBtn').onclick=()=>{const f=$('wFrame');f.classList.toggle('hidden');const on=!f.classList.contains('hidden');if(on)setWindy(-7,106);$('wBtn').textContent=on?'Sembunyikan peta Windy':'Tampilkan peta Windy'};
const _fk=fokus;fokus=function(id){_fk(id);const l=D.find(x=>x.id==id);if(l&&!$('wFrame').classList.contains('hidden'))setWindy(l.latitude,l.longitude)};

// ===== Titik acuan, desa, dan analisis klik peta (data nyata ECO-WAVE; satu sumber aturan eksklusi) =====
(function(){
  const E=window.ECOWAVE,ALL=Object.keys(E.LAYER_META),BASE='assets/data/pltgl/',n2=(x,d=2)=>Number(x).toLocaleString((window.ECOWAVE_LOC||'id-ID'),{minimumFractionDigits:d,maximumFractionDigits:d});
  const gAcuan=L.layerGroup().addTo(map);
  function gambarAcuan(){gAcuan.clearLayers();
    DESA.forEach(d=>L.marker([d.lat,d.lng],{icon:PG.ikonDesa(),keyboard:false}).addTo(gAcuan)
      .bindPopup(PG.kartu({judul:d.nama,sub:d.kec,baris:[['Penduduk (Data Simulasi)','~'+d.penduduk.toLocaleString((window.ECOWAVE_LOC||'id-ID'))+' jiwa']]}),PG.OPS_POPUP));
    CMEMS.titik.forEach((t,i)=>L.marker([t.lat,t.lng],{icon:PG.ikonCmems(labelTitik(t,i))}).addTo(gAcuan)
      .bindPopup(PG.kartu({judul:t.nama+' ('+(t.sumber||'CMEMS')+')',sub:(t.sumber&&t.sumber!=='CMEMS')?'Titik acuan gelombang ('+t.sumber+')':'Titik acuan gelombang 2015–2024',baris:[['Daya rata-rata',n2(t.p)+' kW/m'],['Median',t.med==null?'–':n2(t.med)+' kW/m'],['Maks',t.maks==null?'–':n2(t.maks)+' kW/m'],['Hs / Te',n2(t.hs)+' m / '+n2(t.te)+' s']],
        aksi:[{teks:'+ Tambah ke DB',klik:`pilihCMEMSdariPeta('${String(t.nama).replace(/'/g,"\\'")}')`},{teks:'Kalkulator',href:`kalkulator.php?lat=${t.lat}&lng=${t.lng}`,alt:1}]}),PG.OPS_POPUP))}
  gambarAcuan();onRef(gambarAcuan);
  window.pilihCMEMSdariPeta=function(nama){const i=CMEMS.titik.findIndex(t=>t.nama===nama);if(i>=0)pilihCMEMS(i)};
  // garis batas cakupan data karang/lamun (celah K5) digambar setelah data habitat termuat
  E.muat(['karang','lamun','reef'],BASE).then(()=>{
    ecoCoverage=E.cakupanHabitat();
    if(!ecoCoverage){if(ecoBoundaryStatus)ecoBoundaryStatus.textContent='Cakupan data tidak tersedia.';return}
    const batasKustom=E.batasAnalisisHabitatKustom();
    setInputBatas(batasKustom||ecoCoverage);
    if(ecoBoundaryApply)ecoBoundaryApply.disabled=false;
    if(ecoBoundaryReset)ecoBoundaryReset.disabled=false;
    gambarBatasCakupan(batasKustom);
  }).catch(()=>{});

  let markerKlik=null,klikTerakhir=null;
  window.__titikPeta=()=>markerKlik?markerKlik.getLatLng():null;
  map.on('click',async function(e){
    const lat=e.latlng.lat,lng=e.latlng.lng,box=document.getElementById('hasilKlik');
    if(!E.dalamAreaStudi(lat,lng)){const b=E.batasAreaStudi();L.popup(PG.OPS_POPUP).setLatLng(e.latlng).setContent(PG.kartu({judul:'Di luar area studi',sub:`Klik di dalam area aktif (lat ${b[1].toFixed(2)}…${b[3].toFixed(2)}, lng ${b[0].toFixed(2)}…${b[2].toFixed(2)})`})).openOn(map);return}
    if(!E.dalamAreaAnalisisHabitat(lat,lng)){L.popup(PG.OPS_POPUP).setLatLng(e.latlng).setContent(PG.kartu({judul:'Di luar area analisis',sub:'Geser batas kuning secara manual di panel Map / Layer untuk mengubah area analisis.'})).openOn(map);return}
    try{await E.muatRaster(BASE)}catch(_){}
    if(E.daratan(lat,lng)){L.popup(PG.OPS_POPUP).setLatLng(e.latlng).setContent(PG.kartu({judul:'Daratan',sub:'Titik ini berada di daratan, jadi tidak ada nilai gelombang maupun skor. Klik di perairan pesisir.'})).openOn(map);return}
    if(markerKlik)map.removeLayer(markerKlik);
    $('detail').classList.remove('open');cur=null;$('insight').classList.add('hidden');
    markerKlik=L.marker([lat,lng],{icon:PG.ikonTarget(),keyboard:false}).addTo(map);
    if(box){box.classList.remove('hidden');box.innerHTML='Memproses CMEMS, data PLTGL nyata, dan estimasi rumah…'}
    const inter=interpolasiCMEMS(lat,lng),f=sf(),kw=inter.p*f,hs=inter.hs,te=inter.te;
    let sp,m,est,P,galat='';
    try{await Promise.all([E.muat(ALL,BASE),E.muatRaster(BASE)]);
      P=paramEco();P.dayaSkala=f;sp=E.analisisSpasial(lat,lng,{P,desa:DESA});m=E.mcda(sp,kw,W,EX,P);est=E.energi(kw,P)}
    catch(err){galat=err.message}
    if(!m){if(box)box.innerHTML='<b>Data PLTGL gagal dimuat:</b> '+galat;return}
    const kd=sp.kedalaman,J=k=>sp.jarak[k]===undefined?'-':(sp.info[k].di_dalam?'di dalam':n2(sp.jarak[k])+' km'),kls=m.kelas;
    klikTerakhir={latitude:lat,longitude:lng,hs,tp:te,kw,s:m.s.map(v=>+v.toFixed(2)),ex:m.ex,alasan:sp.ex.map(x=>x.teks).join('; ')};
    const rm=est.rumah;
    window.hudUpdate&&window.hudUpdate({lat,lng,hs,te,kw,est:{pListrikKw:est.pKw,rumah450:rm[450].puncak,rumah900:rm[900].puncak,rumah1300:rm[1300].puncak},fin:m.fin,s:m.s,ex:m.ex});
    SINKRON.tulis({terakhir:{lat,lng,kw,hs,te,fin:m.fin,kelas:kls.n,ex:m.ex,pKw:est.pKw,rumah450:rm[450].puncak,musim:SA,sumber:'Peta · CMEMS IDW',waktu:Date.now()}});
    const eb=estimasiCMEMS(inter.p,P),kand=D.length?nearest(lat,lng):null;
    const html=window.petaHasilHTML({lat,lng,inter,hs,te,kw,musim:SEA[SA][0],sp,m,est,P,eb,W,KEY,NAMA,EX,kls,kd,J,kand,klim:CMEMS.klimRata});
    if(box){box.innerHTML=html;
      const bar=document.createElement('div');bar.className='ekspor-bar';bar.innerHTML='<button type="button" class="btn2 !py-1 text-sm" data-ek="png"><i class="bi bi-image"></i> Export PNG</button><button type="button" class="btn !py-1 text-sm" data-ek="pdf"><i class="bi bi-file-earmark-pdf"></i> Export PDF</button>';
      box.appendChild(bar);const srcK=()=>window.ANALISIS_TERAKHIR;
      window.ECOWAVE_EKSPOR.pasang({png:bar.querySelector('[data-ek=png]'),pdf:bar.querySelector('[data-ek=pdf]'),ambil:srcK})}
    window.ANALISIS_TERAKHIR={halaman:'peta',lat,lng,musim:SA,gel:{src:'cmems',kw,hs,te,faktor:f,label:'CMEMS 2015–2024 (IDW)'+(SA==='thn'?'':' • musim '+SA.toUpperCase())},pTahunan:inter.p,sp,m,en:est,P,EX,map};
    markerKlik.bindTooltip(n2(m.fin)+' · '+(m.ex&&EX?'Eksklusi':kls.n),{direction:'top',offset:[0,-12]}).openTooltip();
  });
  window.simpanKlikKeForm=function(){
    const g=i=>document.getElementById(i),nama=(g('namaKlik')||{}).value||'',region=(g('regionKlik')||{}).value||'Lebak';
    if(!klikTerakhir)return;if(!nama.trim()){alert('Isi nama lokasi terlebih dahulu.');return}
    if(klikTerakhir.ex&&EX){alert('Titik ini tereksklusi.');return}
    g('fId').value='';g('fName').value=nama.trim();g('fReg').value=region;g('fLat').value=klikTerakhir.latitude;g('fLng').value=klikTerakhir.longitude;
    g('fHs').value=klikTerakhir.hs.toFixed(2);g('fTp').value=klikTerakhir.tp.toFixed(2);g('fKw').value=klikTerakhir.kw.toFixed(2);
    klikTerakhir.s.forEach((v,i)=>g('fS'+i).value=Math.min(5,Math.max(1,v)));g('fEx').checked=!!klikTerakhir.ex;
    g('fMode').textContent='(Dari klik peta · skor dari data PLTGL nyata)';g('fWin').textContent='';g('modalForm').classList.remove('hidden');if(markerKlik)markerKlik.closePopup();
  };
})();
// Perubahan bobot/eksklusi/musim di tab lain (Kalkulator, Beranda) langsung ikut ke peta ini
window.onSinkron=()=>{try{$('mask').checked=EX;sinkron();[...$('musim').children].forEach(b=>b.classList.toggle('on',b.dataset.k==SA));gambarDaya();legenda();segarkan()}catch{}};
