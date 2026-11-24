// CIHUY - logika WebGIS. Data fallback di bawah HANYA DEMO; bukan hasil ERA5/ArcGIS.
const FB=[
 {id:1,name:'Bayah',region:'Lebak',latitude:-7.05,longitude:106.1,kw:18.5,s:[5,3.5,4,3],ex:0},
 {id:2,name:'Sawarna',region:'Lebak',latitude:-6.98,longitude:106.28,kw:16,s:[4.5,4,3,3],ex:0},
 {id:3,name:'Binuangeun',region:'Lebak',latitude:-7.12,longitude:105.9,kw:14.2,s:[4,3,3,2.67],ex:0},
 {id:4,name:'Panimbang',region:'Pandeglang',latitude:-6.65,longitude:105.65,kw:6.8,s:[2,4.5,3,2.33],ex:0},
 {id:5,name:'Cikeusik / Ujung Kulon',region:'Pandeglang',latitude:-7.2,longitude:105.6,kw:17,s:[4.5,3,4,3.33],ex:1}];
const MF=[.95,.95,.85,.8,.9,1.1,1.2,1.2,1.1,.95,.85,.9];
const BLN=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const SEA={thn:['Tahunan',[0,1,2,3,4,5,6,7,8,9,10,11]],djf:['Barat (DJF)',[11,0,1]],mam:['Peralihan (MAM)',[2,3,4]],jja:['Timur (JJA)',[5,6,7]],son:['Peralihan (SON)',[8,9,10]]};
const DEF={daya:.4,eko:.3,ked:.15,jar:.15},KEY=['daya','eko','ked','jar'];
const NAMA={daya:'Daya Gelombang',eko:'Ekosistem (dibalik)',ked:'Kedalaman',jar:'Jarak Infrastruktur'};
const KLS=[[4.2,'Sangat Layak','#16a34a'],[3.4,'Layak','#86efac'],[2.6,'Cukup Layak','#facc15'],[1.8,'Kurang Layak','#fb923c']];
let D=FB,W={...DEF},EX=true,SA='thn',cmp=[],cur=null,c1,c2;
const $=i=>document.getElementById(i),f2=(x,n=2)=>Number(x).toFixed(n);
const kelas=s=>{if(s<=0)return{n:'Gugur',c:'#9ca3af'};for(const[k,n,c]of KLS)if(s>=k)return{n,c};return{n:'Tidak Layak',c:'#ef4444'}};
const sc=(l,w=W)=>w.daya*l.s[0]+w.eko*l.s[1]+w.ked*l.s[2]+w.jar*l.s[3];
const fin=l=>(EX&&l.ex)?0:sc(l);
const rank=()=>[...D].sort((a,b)=>fin(b)-fin(a));
const hav=(a,b,c,d)=>{const r=Math.PI/180,x=Math.sin((c-a)*r/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin((d-b)*r/2)**2;return 12742*Math.asin(Math.sqrt(x))};
const sf=()=>SEA[SA][1].reduce((a,m)=>a+MF[m]**2,0)/SEA[SA][1].length/.978;
const monthly=l=>l.monthly||MF.map(f=>+(l.kw*f*f/.978).toFixed(2));
const warna=p=>{const t=Math.min(1,p/22),h=t<.5,a=h?[96,165,250]:[250,204,21],b=h?[250,204,21]:[220,38,38],u=h?t*2:(t-.5)*2;return`rgb(${a.map((v,i)=>Math.round(v+(b[i]-v)*u))})`};

// ===== PETA - UDAH DIBENERIN =====
const map=L.map('map').setView([-7,106],9);
const TL=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors'});
const TD=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',{attribution:'© Esri, © OpenStreetMap contributors © CARTO'});
TL.addTo(map);
const G={pow:L.layerGroup(),score:L.layerGroup()};
const ECO={lMang:['#15803d',[[-6.62,105.7,4000],[-7.08,105.95,3500]]],lKar:['#ec4899',[[-7.06,106.14,3000],[-6.99,106.25,2500]]],lLam:['#0d9488',[[-7.15,105.88,3000]]]};
for(const k in ECO)G[k]=L.layerGroup(ECO[k][1].map(([a,b,r])=>L.circle([a,b],{radius:r,color:ECO[k][0],fillOpacity:.5})));
G.lKon=L.layerGroup([L.rectangle([[-7.3,105.5],[-7.1,105.7]],{color:'#6b7280',fillOpacity:.35}).bindTooltip('TN Ujung Kulon (eksklusi)')]);

function gambarDaya(){G.pow.clearLayers();
 for(let la=-7.4;la<-6.5;la+=.06)for(let ln=105.4;ln<106.5;ln+=.06){let n=0,d=0;
  D.forEach(l=>{const w=1/(hav(la,ln,l.latitude,l.longitude)**2+100);n+=w*l.kw;d+=w});
  const p=n/d*sf();L.rectangle([[la,ln],[la+.06,ln+.06]],{stroke:false,fillColor:warna(p),fillOpacity:.45,interactive:false}).addTo(G.pow)}}
function gambarSkor(){G.score.clearLayers();
 D.forEach(l=>{const s=fin(l);L.circleMarker([l.latitude,l.longitude],{radius:13,color:'#fff',weight:2,fillColor:kelas(s).c,fillOpacity:.95,interactive:false})
  .bindTooltip(f2(s),{permanent:true,direction:'center',className:'!bg-transparent !border-0 !shadow-none font-bold'}).addTo(G.score)})}
const lay={lPow:'pow',lScore:'score',lMang:'lMang',lKar:'lKar',lLam:'lLam',lKon:'lKon'};
for(const id in lay)$(id).onchange=e=>{e.target.checked?G[lay[id]].addTo(map):map.removeLayer(G[lay[id]]);legenda()};

// ===== UI =====
function legenda(){let h='';
 if($('lPow').checked)h+=`<div>Daya gelombang (kW/m) — ${SEA[SA][0]}</div><div style="height:10px;border-radius:5px;background:linear-gradient(90deg,rgb(96,165,250),rgb(250,204,21),rgb(220,38,38))"></div><div class="flex justify-between"><span>kecil</span><span>sedang</span><span>besar</span></div>`;
 if($('lScore').checked)h+='<div class="mt-1">Skor kelayakan (merah=jelek, hijau=bagus)</div>'+[...KLS.map(([k,n,c])=>[n,c]),['Tidak Layak','#ef4444'],['Gugur','#9ca3af']].map(([n,c])=>`<div><i style="background:${c}" class="inline-block w-3 h-3 rounded-full"></i> ${n}</div>`).join('');
 for(const[id,[c]]of Object.entries(ECO))if($(id).checked)h+=`<div><i style="background:${c}" class="inline-block w-3 h-3"></i> ${$(id).parentNode.textContent.trim()}</div>`;
 $('legenda').innerHTML=h||'Aktifkan layer.'}
$('musim').innerHTML=Object.entries(SEA).map(([k,[n]])=>`<button class="chip ${k==SA?'on':''}" data-k="${k}">${n}</button>`).join('');
$('musim').onclick=e=>{if(!e.target.dataset.k)return;SA=e.target.dataset.k;[...$('musim').children].forEach(b=>b.classList.toggle('on',b.dataset.k==SA));gambarDaya();legenda()};
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

function segarkan(){gambarSkor();const r=rank();
 $('top3').innerHTML=r.filter(l=>!(EX&&l.ex)).slice(0,3).map((l,i)=>{const s=fin(l),k=kelas(s);return`<div class="card lift"><div class="text-xs opacity-60">Peringkat ${i+1} • ${l.region}</div><div class="text-xl font-extrabold">${l.name}</div>
  <div class="text-3xl font-extrabold" style="color:${k.c}">${f2(s)}</div><div class="text-sm mb-2">${k.n} • ${f2(l.kw,1)} kW/m</div><button class="btn !py-1" onclick="fokus(${l.id})">Lihat di Peta</button></div>`}).join('');
 const mx=Math.max(...D.map(l=>l.kw)),lay=D.filter(l=>fin(l)>=3.4).length;
 $('kpi').innerHTML=[[f2(mx,1)+' kW/m','Daya Maks'],[Math.round(lay/D.length*100)+'%','Titik Layak'],['3','Lokasi Prioritas'],[D.filter(l=>l.ex).length,'Zona Eksklusi']].map(([a,b])=>`<div class="card kpi text-center"><div class="kn font-extrabold text-[#00A8A8]">${a}</div><div class="text-xs">${b}</div></div>`).join('');
 if(!cur)$('insight').innerHTML=`<b>${r[0].name}</b> juara 1 dengan skor <b>${f2(fin(r[0]))}</b> (${kelas(fin(r[0])).n}). Klik peta untuk melihat skor titik lain.`;
 else tampil(cur);
 if(cmp.length)tabel()}
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
 c1=new Chart($('cLine'),{type:'line',data:{labels:BLN,datasets:[{label:'Daya (kW/m)',data:m,borderColor:'#0d9488',backgroundColor:'#0d948822',fill:true,tension:.3}]},options:{plugins:{legend:{display:false},title:{display:true,text:'Daya per bulan'}}}});
 c2=new Chart($('cBar'),{type:'bar',data:{labels:['Daya','Ekosistem','Kedalaman','Jarak'],datasets:[{label:'Skor kriteria (1-5)',data:l.s,backgroundColor:'#00A8A8'}]},options:{plugins:{legend:{display:false}},scales:{y:{min:0,max:5}}}});
 $('detail').classList.add('open');
 const no=rank().findIndex(x=>x.id==l.id)+1;
 $('insight').innerHTML=`${jarak!=null?`Titik terdekat: <b>${l.name}</b> (${jarak} km). `:''}<b>${l.name}</b>: skor ${f2(s)} (${k.n}), peringkat ${no}/${D.length}. ${jelaskan(l)}`}
function fokus(id){const l=D.find(x=>x.id==id);map.flyTo([l.latitude,l.longitude],11);tampil(l);location.hash='peta'}
$('tutup').onclick=()=>{$('detail').classList.remove('open');cur=null;segarkan()};
function nearest(la,ln){return D.map(l=>({l,d:hav(la,ln,l.latitude,l.longitude)})).sort((a,b)=>a.d-b.d)[0]}
map.on('click',async e=>{const{lat,lng}=e.latlng;let l,jk;
 try{const r=await fetch(`api/get_location.php?lat=${lat}&lng=${lng}`);if(!r.ok)throw 0;const j=await r.json();l=D.find(x=>x.id==j.id)||j;l.monthly=j.monthly;jk=j.jarak_km}
 catch{const n=nearest(lat,lng);l=n.l;jk=+f2(n.d,1)}
 const s=fin(l);L.popup().setLatLng(e.latlng).setContent(`<b>${l.name}</b><br>Skor <b>${f2(s)}</b> — ${kelas(s).n}<br><small>Titik kandidat terdekat ${jk} km</small>`).openOn(map);tampil(l,jk)});
$('cari').onchange=e=>{const q=e.target.value.toLowerCase(),l=D.find(x=>x.name.toLowerCase().includes(q));if(l)fokus(l.id)};
$('bBand').onclick=()=>{if(!cur)return;if(!cmp.includes(cur.id))cmp.push(cur.id);cmp=cmp.slice(-2);tabel();$('bandingkan').scrollIntoView({behavior:'smooth'})};
function tabel(){const a=cmp.map(i=>D.find(l=>l.id==i)),b=$('bandingkan');b.classList.remove('hidden');
 if(a.length<2){b.innerHTML='Pilih satu lokasi lagi (klik peta → Bandingkan).';return}
 const rows=[['Daya rata-rata',l=>f2(l.kw,1)+' kW/m'],...KEY.map((k,i)=>[NAMA[k],l=>f2(l.s[i],1)]),['Eksklusi',l=>l.ex?'Ya':'Tidak'],['Skor akhir',l=>f2(fin(l))],['Kelas',l=>kelas(fin(l)).n]];
 b.innerHTML=`<b>Bandingkan Lokasi</b><table class="w-full text-sm mt-2"><tr><th></th>${a.map(l=>`<th>${l.name}</th>`).join('')}</tr>${rows.map(([n,f])=>`<tr class="border-t"><td>${n}</td>${a.map(l=>`<td class="text-center">${f(l)}</td>`).join('')}</tr>`).join('')}</table>`}
$('bPdf').onclick=()=>print();
$('bPng').onclick=()=>html2canvas($('detail')).then(c=>{const a=document.createElement('a');a.download=`cihuy-${cur.name}.png`;a.href=c.toDataURL();a.click()});

(async()=>{try{const r=await fetch('api/calculate.php');if(!r.ok)throw 0;const j=await r.json();if(j.locations.length)D=j.locations;
  if(j.weights)W={daya:+j.weights.daya,eko:+j.weights.eko,ked:+j.weights.ked,jar:+j.weights.jar};
  }catch{console.warn('DB belum siap, pakai data DEMO');}
 G.pow.addTo(map);G.score.addTo(map);gambarDaya();sinkron();legenda();segarkan()})();

// ===== LOGIN & CRUD ADMIN =====
let ME=null,tunda=null;
async function api(u,b){const r=await fetch(u,b?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}:{});
 const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'Gagal terhubung ke server');return j}
function uiAuth(){const adm=ME&&ME.role=='admin';
 $('nLogin').classList.toggle('hidden',!!ME);$('nUser').classList.toggle('hidden',!ME);
 if(ME)$('nUser').textContent=`${ME.name} (${ME.role}) • Keluar`;
 $('nAdmin').classList.toggle('hidden',!adm);$('admin').classList.toggle('hidden',!adm);if(adm)tabelAdmin()}
function perlu(fn,pesan){if(ME)return fn();tunda=fn;$('loginMsg').textContent=pesan||'Fitur ini hanya untuk pengguna yang sudah login.';$('loginErr').textContent='';$('modalLogin').classList.remove('hidden');$('lUser').focus()}
$('nLogin').onclick=()=>perlu(()=>{},'Masuk sebagai admin atau user.');
$('lBatal').onclick=()=>{tunda=null;$('modalLogin').classList.add('hidden')};
async function masuk(){try{const j=await api('api/auth.php?aksi=login',{username:$('lUser').value,password:$('lPass').value});
 ME=j.user;$('lPass').value='';$('modalLogin').classList.add('hidden');uiAuth();const f=tunda;tunda=null;f&&f()}catch(e){$('loginErr').textContent=e.message}}
$('lGo').onclick=masuk;$('lPass').onkeydown=e=>e.key=='Enter'&&masuk();
$('nUser').onclick=async()=>{await api('api/auth.php?aksi=logout',{}).catch(()=>{});ME=null;uiAuth();location.hash='beranda'};
api('api/auth.php?aksi=me').then(j=>{ME=j.user;uiAuth()}).catch(()=>{});

['bBand','bPdf','bPng','uji'].forEach(id=>{const o=$(id).onclick;$(id).onclick=e=>perlu(()=>o(e))});
const omask=$('mask').onchange;
$('mask').onchange=e=>{if(!e.target.checked&&!ME){e.target.checked=true;
 perlu(()=>{$('mask').checked=false;omask({target:$('mask')})},'Mode Eksklusi OFF perlu login.');return}omask(e)};

async function muat(){try{const j=await api('api/calculate.php');if(j.locations.length)D=j.locations}catch{}
 cur=null;$('detail').classList.remove('open');gambarDaya();segarkan();tabelAdmin();muatWindy()}
function tabelAdmin(){$('aTbl').innerHTML=D.map(l=>`<tr class="border-t"><td>${l.name}</td><td>${l.region}</td><td>${f2(l.kw,1)}</td><td>${l.s.join(' / ')}</td><td>${l.ex?'Ya':'-'}</td>
 <td class="whitespace-nowrap"><button class="chip" onclick="formLok(${l.id})">Edit</button> <button class="chip" onclick="hapusLok(${l.id})">Hapus</button></td></tr>`).join('')}
function formLok(id){const l=id?D.find(x=>x.id==id):{name:'',region:'',latitude:'',longitude:'',kw:'',s:['','','',''],ex:0};
 $('fId').value=id||'';$('fName').value=l.name;$('fReg').value=l.region;$('fLat').value=l.latitude;$('fLng').value=l.longitude;$('fKw').value=l.kw;
 l.s.forEach((v,i)=>$('fS'+i).value=v);$('fEx').checked=!!l.ex;$('fErr').textContent='';$('modalForm').classList.remove('hidden')}
async function simpan(){const b={aksi:$('fId').value?'update':'create',id:$('fId').value,name:$('fName').value,region:$('fReg').value,
 latitude:$('fLat').value,longitude:$('fLng').value,kw:$('fKw').value,s:[0,1,2,3].map(i=>$('fS'+i).value),ex:$('fEx').checked};
 try{await api('api/locations.php',b);$('modalForm').classList.add('hidden');await muat()}catch(e){$('fErr').textContent=e.message}}
async function hapusLok(id){if(!confirm('Hapus lokasi ini beserta data gelombang & skornya?'))return;
 try{await api('api/locations.php',{aksi:'delete',id});await muat()}catch(e){alert(e.message)}}

// ===== EFEK VISUAL LAUT =====
(()=>{const b=$('bubbles');for(let i=0;i<26;i++){const s=document.createElement('i'),z=6+Math.random()*26;
 s.style.cssText=`left:${Math.random()*100}%;width:${z}px;height:${z}px;animation-duration:${8+Math.random()*12}s;animation-delay:${-Math.random()*15}s`;b.appendChild(s)}
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.06});
 document.querySelectorAll('#kpi,#terbaik,#peta,#admin,footer .max-w-6xl').forEach(e=>{e.classList.add('reveal');io.observe(e)});
 const h=$('beranda');h.onmousemove=e=>{h.style.setProperty('--mx',(e.clientX/innerWidth-.5)*30+'px');h.style.setProperty('--my',(e.clientY/innerHeight-.5)*20+'px')};
 addEventListener('scroll',()=>document.querySelector('nav').classList.toggle('scrolled',scrollY>20),{passive:true});
 setTimeout(()=>$('splash').classList.add('off'),1100)})();
let kd=0;function animKPI(){if(kd)return;kd=1;document.querySelectorAll('#kpi .kn').forEach(el=>{const t=el.textContent,n=parseFloat(t),sfx=t.replace(/^[\d.]+/,''),d=t.includes('.')?1:0;let st=null;
 const step=ts=>{st=st||ts;const p=Math.min(1,(ts-st)/1100);el.textContent=(n*(1-Math.pow(1-p,3))).toFixed(d)+sfx;if(p<1)requestAnimationFrame(step)};requestAnimationFrame(step)})}
G.pulse=L.layerGroup().addTo(map);let pk='';
function denyut(){const k=D.map(l=>l.id+kelas(fin(l)).c).join();if(k==pk)return;pk=k;G.pulse.clearLayers();
 D.forEach(l=>L.marker([l.latitude,l.longitude],{interactive:false,icon:L.divIcon({className:'',html:`<span class="pl" style="--c:${kelas(fin(l)).c}"></span>`,iconSize:[30,30],iconAnchor:[15,15]})}).addTo(G.pulse))}
const _sg=segarkan;let wd=0;segarkan=function(){_sg();animKPI();denyut();if(!wd){wd=1;muatWindy()}};
map.on('click',e=>{const s=document.createElement('span');s.className='rip';s.style.left=e.containerPoint.x+'px';s.style.top=e.containerPoint.y+'px';
 map.getContainer().appendChild(s);setTimeout(()=>s.remove(),900)});

// ===== WINDY LIVE =====
Chart.defaults.borderColor='#22e5f522';Chart.defaults.font.size=12;
function SIM(l){const h0=Math.sqrt(l.kw/(0.49*9.9)),n=Date.now(),s=[];
 for(let i=0;i<24;i++){const hs=h0*(1+.25*Math.sin(i/4+l.id)),tp=11+Math.sin(i/6);s.push({t:n+i*108e5/3*1,hs,tp,dir:200,p:.49*hs*hs*.9*tp})}
 return{sim:true,now:s[0],series:s,mean_p:s.reduce((a,x)=>a+x.p,0)/s.length}}
async function windy(lat,lng,l){try{const r=await fetch(`api/windy.php?lat=${lat}&lng=${lng}`),j=await r.json();if(!r.ok)throw new Error(j.error||'gagal');return j}
 catch(e){return l?{...SIM(l),err:e.message}:{error:e.message}}}
async function muatWindy(){await Promise.all(D.map(l=>windy(l.latitude,l.longitude,l).then(j=>l.live=j)));
 const sim=D.some(l=>l.live.sim);const uji=!sim&&D.some(l=>l.live.trial),w=$('wWarn');$('wStat').textContent=sim?'SIMULASI':uji?'DATA UJI • Trial':'LIVE • Windy';$('wStat').style.background=(sim||uji)?'#fbbf24':'';w.classList.toggle('hidden',!(sim||uji));w.innerHTML=sim?'<b>SIMULASI</b> — bukan data Windy. Coba lagi saat online.':'<b>DATA UJI</b> — kunci Trial Windy mengacak data. Jangan dikutip di laporan; angka resmi memakai ERA5.';
 $('wNote').textContent=sim?`Simulasi: ${D[0].live.err||''}`:'';
 const mx=Math.max(...D.map(l=>l.live.now.p))||1;
 $('wTbl').innerHTML=[...D].sort((a,b)=>b.live.now.p-a.live.now.p).map((l,i)=>`<tr class="border-t"><td>${i+1}</td><td>${l.name}<div class="bar"><i style="width:${l.live.now.p/mx*100}%;background:linear-gradient(90deg,#60a5fa,#facc15,#dc2626)"></i></div></td><td>${f2(l.live.now.hs,1)} m</td><td>${f2(l.live.now.tp,0)} s</td><td><b>${f2(l.live.now.p,1)}</b></td></tr>`).join('');
 if(cur)gambarWindy(cur)}
let c3;
function gambarWindy(l){const v=l.live;if(!v)return;
 $('dLive').innerHTML=`<b>Live ${v.sim?'(SIMULASI)':v.trial?'(DATA UJI Windy)':'(Windy)'}</b>: Hs ${f2(v.now.hs)} m • Tp ${f2(v.now.tp,1)} s • arah ${Math.round(v.now.dir)}° → <b>${f2(v.now.p,1)} kW/m</b>`;
 c3&&c3.destroy();
 c3=new Chart($('cWin'),{type:'line',data:{labels:v.series.map(x=>new Date(x.t).toLocaleString((window.ECOWAVE_LOC||'id-ID'),{weekday:'short',hour:'2-digit'})),datasets:[{label:'kW/m',data:v.series.map(x=>+x.p.toFixed(2)),borderColor:'#2563eb',backgroundColor:'#2563eb22',fill:true,tension:.3}]},options:{plugins:{legend:{display:false},title:{display:true,text:'Prakiraan daya ±3 hari (kW/m)'+(v.sim?' - SIMULASI':v.trial?' - DATA UJI':'')}}}})}
const _tp=tampil;tampil=function(l,j){_tp(l,j);gambarWindy(l)};
map.on('click',async e=>{const{lat,lng}=e.latlng;$('dLive2').textContent='Memuat Windy untuk titik klik…';
 const v=await windy(lat,lng,cur||D[0]);
 $('dLive2').innerHTML=`<b>Titik klik ${f2(lat,3)}, ${f2(lng,3)}</b>${v.sim?' (SIMULASI)':v.trial?' (DATA UJI)':''}: Hs ${f2(v.now.hs)} m • Tp ${f2(v.now.tp,1)} s → <b>${f2(v.now.p,1)} kW/m</b>`});
async function isiWindy(){const la=$('fLat').value,ln=$('fLng').value;if(!la||!ln){$('fWin').textContent='Isi latitude & longitude dulu.';return}
 $('fWin').textContent='Mengambil data Windy…';const v=await windy(la,ln,null);
 if(v.error){$('fWin').textContent='Gagal: '+v.error;return}
 $('fKw').value=f2(v.mean_p,1);$('fWin').textContent=`${v.trial?'DATA UJI (Trial). ':''}Rata-rata prakiraan ≈ ${f2(v.mean_p,1)} kW/m — estimasi cepat, ganti dengan hasil ERA5 bila sudah ada.`}
function setWindy(la,ln){$('wIf').src=`https://embed.windy.com/embed2.html?lat=${la}&lon=${ln}&detailLat=${la}&detailLon=${ln}&zoom=8&level=surface&overlay=waves&product=ecmwf&menu=&message=true&marker=true&calendar=now&type=map&location=coordinates&metricWind=default&metricTemp=default`}
$('wBtn').onclick=()=>{const f=$('wFrame');f.classList.toggle('hidden');const on=!f.classList.contains('hidden');if(on)setWindy(-7,106);$('wBtn').textContent=on?'Sembunyikan peta Windy':'Tampilkan peta Windy'};
const _fk=fokus;fokus=function(id){_fk(id);const l=D.find(x=>x.id==id);if(l&&!$('wFrame').classList.contains('hidden'))setWindy(l.latitude,l.longitude)};