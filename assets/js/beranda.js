// ECO-WAVE - halaman Beranda: semua angka dibaca dari sumber yang sama dengan Peta/Kalkulator/Hasil (data.js, ecowave.js, database,
// bobot & parameter bersama lewat SINKRON) dan diperbarui langsung (lintas tab, interval, dan BMKG).
const n1=(x,d=1)=>Number(x).toLocaleString((window.ECOWAVE_LOC||'id-ID'),{minimumFractionDigits:d,maximumFractionDigits:d});
const setT=(id,t)=>{const e=$(id);if(e)e.textContent=t};
let kd=0;
let RZ=null;   // ringkasan grid zona (assets/data/ringkasan_zona.json, dihitung offline oleh scripts/hitung_kandidat.js)
async function muatRingkasan(){try{const r=await fetch('assets/data/ringkasan_zona.json');if(r.ok)RZ=await r.json()}catch(e){}}
function renderKPI(animasi){
 const mx=Math.max(...CMEMS.titik.map(t=>t.p)),aktif=D.filter(l=>!(EX&&l.ex)).length,idn=v=>Number(v).toLocaleString((window.ECOWAVE_LOC||'id-ID'));
 // Angka utama dari grid zona nyata (bobot bawaan); bila berkasnya tidak ada, jatuh ke 5 kandidat dengan label yang jujur.
 const kartu=RZ?[[Math.round(RZ.layak/(RZ.sel-RZ.tereksklusi)*100)+'%','Sel Pesisir Layak (dari '+idn(RZ.sel-RZ.tereksklusi)+' sel)'],[Math.min(3,aktif)+'','Lokasi Prioritas'],[RZ.tereksklusi+'','Sel Tereksklusi (dari '+idn(RZ.sel)+' sel)']]
  :[[Math.round(D.filter(l=>fin(l)>=3.4).length/D.length*100)+'%','Kandidat Layak (dari '+D.length+')'],[Math.min(3,aktif)+'','Lokasi Prioritas'],[D.filter(l=>EX&&l.ex).length+'','Kandidat Tereksklusi']];
 $('kpi').innerHTML=[[f2(mx,1)+' kW/m','Daya Rata-rata Tertinggi (CMEMS)'],...kartu].map(([a,b])=>`<div class="card kpi text-center"><div class="kn font-extrabold text-[#00A8A8]">${a}</div><div class="text-xs">${b}</div></div>`).join('');
 if(animasi)animKPI()}
function animKPI(){if(kd)return;kd=1;document.querySelectorAll('#kpi .kn').forEach(el=>{const t=el.textContent,n=parseFloat(t),sfx=t.replace(/^[\d.]+/,''),d=t.includes('.')?1:0;let st=null;
 const step=ts=>{st=st||ts;const p=Math.min(1,(ts-st)/1100);el.textContent=(n*(1-Math.pow(1-p,3))).toFixed(d)+sfx;if(p<1)requestAnimationFrame(step)};requestAnimationFrame(step)})}

// ----- hero + langkah cara kerja: titik terbaik CMEMS dan parameter perangkat dari Kalkulator -----
function renderHero(){
 const P=paramEco(),p0=CMEMS.titik.reduce((a,b)=>b.p>a.p?b:a),en=ECOWAVE.energi(p0.p,P),r=en.rumah,id=v=>Number(v).toLocaleString((window.ECOWAVE_LOC||'id-ID'));
 renderPuncak();setT('rTahun',CMEMS.tahunan.label.length);setT('rRumah',id(r[450].puncak));
 setT('aKode3',`${n1(p0.p,2)} x ${P.lebar}${P.unit>1?' x '+P.unit:''} x ${Math.round(P.efisiensi*100)}% = ${n1(en.pKw,1)} kW`);
 setT('aKode4',`${id(r[450].puncak)} / ${id(r[900].puncak)} / ${id(r[1300].puncak)} rumah (${p0.nama.split(' ')[0]})`);
 renderAnim(p0,P)}

// kartu hero "Gelombang puncak": bulan dengan daya gelombang rata-rata tertinggi (klimatologi CMEMS 2015-2024), bukan nama lokasi
function renderPuncak(){
 const B=CMEMS.bulanan,i=B.p.indexOf(Math.max(...B.p)),loc=window.ECOWAVE_LOC||'id-ID';
 let nama=B.label[i];try{nama=new Date(2020,i,1).toLocaleString(loc,{month:'long'})}catch(e){}
 setT('rPuncak',nama);setT('rPuncakP',n1(B.p[i],1)+' kW/m')}
document.addEventListener('ecowave:lang',()=>{try{renderHero()}catch(e){try{renderPuncak()}catch(_){}}});

// ----- animasi PLTGL di hero: kecepatan & kartu parameter dibaca dari data situs (CMEMS, parameter Kalkulator, manifest layer) -----
let HM=null;                       // manifest layer PLTGL (jumlah fitur tiap berkas data)
const kl=(v,a,b)=>Math.max(a,Math.min(b,v));
function renderAnim(p0,P){
 const art=document.querySelector('.hero-art'); if(!art)return;
 // data utama animasi = peringkat 1 di Lokasi Terbaik (rank() yang sama dengan halaman Lokasi Terbaik); CMEMS = parameter tambahan
 const top=rank().filter(l=>!(EX&&l.ex))[0],ada=!!top,l=top||{name:p0.nama,kw:p0.p,latitude:p0.lat,longitude:p0.lng},
  cm=interpolasiCMEMS(l.latitude,l.longitude),hs=cm.hs,te=cm.te,en=ECOWAVE.energi(l.kw,P),r=en.rumah,
  sv=(k,v)=>art.style.setProperty(k,v),id=v=>Number(v).toLocaleString((window.ECOWAVE_LOC||'id-ID'));
 sv('--ha-bob',kl(te*.47,3,9).toFixed(2)+'s');          // periode ayunan pelampung ~ Te (CMEMS di lokasi terbaik)
 sv('--ha-amp',kl(hs*6.6,6,24).toFixed(1)+'px');         // amplitudo ayunan ~ Hs (CMEMS di lokasi terbaik)
 sv('--ha-w1',kl(te*.47,3,9).toFixed(2)+'s');sv('--ha-w2',kl(te*.75,5,14).toFixed(2)+'s');
 sv('--ha-alir',kl(84/Math.max(en.pKw,1),.5,2.5).toFixed(2)+'s');                             // aliran kabel ~ daya listrik lokasi terbaik
 const s=ada?fin(l):0,k=kelas(s);
 setT('haGelT','TERBAIK · '+l.name.toUpperCase().slice(0,17));
 setT('haSkor',ada?`Skor ${n1(s,2)} · ${k.n} · penapisan awal`:'Belum ada kandidat layak');
 setT('haHs',n1(hs,2)+' m');setT('haTe',n1(te,1)+' s');setT('haP',n1(l.kw,1)+' kW/m');setT('haCm',' · P0 '+n1(p0.p,1));
 setT('haKw',n1(en.pKw,1)+' kW');setT('haPar',` · ${P.unit} × ${P.lebar} m · ${Math.round(P.efisiensi*100)}%`);setT('haRumah',id(r[450].puncak));
 setT('haEko3',`Penyangga: karang ${n1(P.buf.karang,P.buf.karang%1?1:0)} km · lamun ${n1(P.buf.lamun,1)} km`);
 setT('rRumah',id(r[450].puncak));setT('rRumahP',`${P.unit} unit · ${n1(en.pKw,1)} kW`);
 renderEko()}
function renderEko(){
 if(!HM)return;const id=v=>Number(v).toLocaleString((window.ECOWAVE_LOC||'id-ID')),f=k=>HM[k]?id(HM[k].fitur):'–';
 setT('haEko1',`Karang ${f('karang')} · Lamun ${f('lamun')} poligon`);setT('haEko2',`Reef ${f('reef')} · Mangrove ${f('mangrove')} poligon`);
 setT('haJar',`Gardu ${f('gardu')} · jalur listrik ${f('jalur_listrik')}`)}
async function muatManifest(){try{const m=await(await fetch('assets/data/pltgl/manifest.json')).json();HM=m.layer||null;renderEko()}catch(e){}}


// ----- kartu pantauan langsung -----
const ago=t=>{const m=Math.round((Date.now()-t)/60000);return m<1?'baru saja':m<60?m+' menit lalu':Math.round(m/60)+' jam lalu'};
function spark(seri){if(!seri||seri.length<2)return'';const w=240,h=46,ys=seri.map(x=>x[1]),mn=Math.min(...ys),mx=Math.max(...ys),sp=mx-mn||1,now=Date.now();
 const pts=seri.map((x,i)=>[i/(seri.length-1)*w,h-4-(x[1]-mn)/sp*(h-10)]),d=pts.map((q,i)=>(i?'L':'M')+q[0].toFixed(1)+' '+q[1].toFixed(1)).join(' ');
 let k=0,b=Infinity;seri.forEach((x,i)=>{const dd=Math.abs(x[0]-now);if(dd<b){b=dd;k=i}});
 return`<svg class="lv-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-label="Hs prakiraan 4 hari"><path d="${d} L${w} ${h} L0 ${h}Z" fill="rgba(34,211,238,.14)"/><path d="${d}" fill="none" stroke="#22d3ee" stroke-width="1.8"/><circle cx="${pts[k][0]}" cy="${pts[k][1]}" r="3.5" fill="#facc15" stroke="#fff"/></svg>`}
let bm=null;
function renderBmkg(){
 const st=$('lvBmkgStat'),body=document.querySelector('#lvBmkg .lv-body');
 if(!bm){return}
 if(bm.galat)setT('haBmkg','BMKG: offline');else if(bm.now)setT('haBmkg','BMKG kini: Hs '+n1(bm.now.hs)+' m ('+(bm.now.kat||'live')+')');
 if(bm.galat){st.textContent='offline';st.className='lv-stat bad';body.innerHTML='BMKG tidak terjangkau: '+bm.galat+'<br><span class="lv-note">Tidak ada angka pengganti yang ditampilkan.</span>';return}
 const te=SINKRON.baca().teBmkg>0?SINKRON.baca().teBmkg:ECOWAVE?interpolasiCMEMS(-7.1,105.9).te:10.9,p=ECOWAVE.dayaGelombang(bm.now.hs,te);
 st.textContent=bm.sumber==='langsung'?'live':bm.sumber;st.className='lv-stat '+(bm.sumber==='cache lama'?'bad':'ok');
 body.innerHTML=`<div class="lv-big">${n1(bm.now.hs)}<small>m · Hs ${bm.now.kat||''}</small></div>${spark(bm.seri)}
  <div class="lv-row"><span>Zona</span><b>${bm.nama||bm.kode} (${bm.kode})</b></div><div class="lv-row"><span>Cuaca / angin</span><b>${bm.now.cuaca||'-'} · ${n1(bm.now.angin,0)} kn</b></div>
  <div class="lv-row"><span>Hs 4 hari</span><b>${n1(bm.hsMin)}–${n1(bm.hsMaks)} m</b></div><div class="lv-row"><span>Daya estimasi</span><b>${n1(p,1)} kW/m</b></div>
  <div class="lv-note">Terbit ${bm.terbit||'-'} · diambil ${ago(bm.diambil)}. Daya = 0,49·Hs²·Te dengan Te ${n1(te,1)} s (parameter Kalkulator; BMKG tidak memberi periode). Prakiraan, bukan klimatologi.</div><a class="lv-link" href="peta.php">Buka di Peta →</a>`}
function renderParam(){
 const P=paramEco(),w=ECOWAVE.normBobot(W),b=document.querySelector('#lvParam .lv-body');
 b.innerHTML=`<div class="lv-row"><span>Bobot D/E/K/J</span><b>${ECOWAVE.KEY.map(k=>Math.round(w[k]*100)).join(' / ')}%</b></div><div class="lv-row"><span>Eksklusi</span><b>${EX?'ON':'OFF'}</b></div>
  <div class="lv-row"><span>Musim</span><b>${SEA[SA][0]}</b></div><div class="lv-row"><span>Perangkat</span><b>${P.unit} × ${P.lebar} m · ${Math.round(P.efisiensi*100)}% · CF ${Math.round(P.cf*100)}%</b></div>
  <div class="lv-row"><span>Skor Daya</span><b>${P.dayaMode==='relatif'?'relatif (min–maks)':'absolut'}</b></div>
  <a class="lv-link" href="peta.php">Ubah bobot di Peta →</a> <a class="lv-link" href="kalkulator.php">Ubah perangkat →</a>`}
function renderTerakhir(){
 const t=SINKRON.baca().terakhir,b=document.querySelector('#lvTerakhir .lv-body');
 if(!t){b.innerHTML='Belum ada analisis. Klik titik di <a class="lv-link" href="peta.php">Peta</a> atau hitung di <a class="lv-link" href="kalkulator.php">Kalkulator</a>; hasilnya muncul di sini seketika.';return}
 b.innerHTML=`<div class="lv-big">${n1(t.fin,2)}<small>/ 5 · ${t.ex&&EX?'Eksklusi':t.kelas}</small></div>
  <div class="lv-row"><span>Titik</span><b>${t.lat.toFixed(3)}, ${t.lng.toFixed(3)}</b></div><div class="lv-row"><span>Daya</span><b>${n1(t.kw,2)} kW/m</b></div>
  <div class="lv-row"><span>Listrik</span><b>${n1(t.pKw,1)} kW · ${t.rumah450} rumah 450 VA</b></div><div class="lv-row"><span>Sumber</span><b>${t.sumber}</b></div>
  <div class="lv-note">${ago(t.waktu)}</div><a class="lv-link" href="kalkulator.php?lat=${t.lat.toFixed(4)}&lng=${t.lng.toFixed(4)}">Buka di Kalkulator →</a>`}
function renderTop(){
 const b=document.querySelector('#lvTop .lv-body'),r=rank().filter(l=>!(EX&&l.ex)).slice(0,3);
 b.innerHTML='<ol class="lv-top">'+r.map((l,i)=>{const s=fin(l),k=kelas(s);return`<li><span>${i+1}</span><b>${l.name}</b><em style="background:${k.c}">${f2(s)}</em></li>`}).join('')+'</ol><div class="lv-note">Skor dihitung dari data nyata (CMEMS + layer PLTGL) dengan bobot yang sama seperti Peta. Penapisan awal: kandidat Bayah dan Sawarna masih di luar cakupan data karang/lamun, jadi skor Ekosistemnya belum terverifikasi.</div><a class="lv-link" href="terbaik.php">Lihat peringkat →</a>'}
function semua(){renderKPI(false);renderHero();renderParam();renderTerakhir();renderTop();renderBmkg()}
async function muatBmkg(){try{bm=await bmkgLive('P.I.06',60000)}catch(e){bm={galat:e.message}}renderBmkg()}

window.onSinkron=s=>{if(s.bmkg&&s.bmkg['P.I.06']){bm=s.bmkg['P.I.06']}semua()};   // perubahan di tab lain
muatManifest();
(async()=>{await muatData();await muatRingkasan();renderKPI(true);renderHero();renderParam();renderTerakhir();renderTop();muatBmkg();
 setInterval(()=>{renderTerakhir();renderBmkg()},30000);setInterval(muatBmkg,300000)})();
(()=>{const b=$('bubbles');if(b)for(let i=0;i<26;i++){const s=document.createElement('i'),z=6+Math.random()*26;
 s.style.cssText=`left:${Math.random()*100}%;width:${z}px;height:${z}px;animation-duration:${8+Math.random()*12}s;animation-delay:${-Math.random()*15}s`;b.appendChild(s)}
 const h=$('beranda');if(h)h.onmousemove=e=>{h.style.setProperty('--mx',(e.clientX/innerWidth-.5)*30+'px');h.style.setProperty('--my',(e.clientY/innerHeight-.5)*20+'px')};
 const v=$('bgVideo');if(v&&typeof v.play==='function'){v.muted=true;if(matchMedia('(prefers-reduced-motion: reduce)').matches){v.removeAttribute('autoplay');v.pause()}else{v.play().catch(()=>{})}}
 const lv=document.querySelector('.lane-video'); if(lv){lv.muted=true; lv.play().catch(()=>{})}
 setTimeout(()=>{const s=$('splash');s&&s.classList.add('off')},1100)})();