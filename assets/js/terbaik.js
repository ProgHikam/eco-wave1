// ECO-WAVE - halaman Lokasi Terbaik: peringkat dihitung ulang dari DATA NYATA (layer PLTGL + CMEMS) dengan bobot MCA, musim, mode eksklusi,
// parameter perangkat, dan daftar kandidat yang AKTIF saat ini. Semuanya ikut berubah seketika (lintas tab) bila Peta, Kalkulator, atau Kelola mengubahnya.
const nf=(x,d=2)=>Number(x).toLocaleString((window.ECOWAVE_LOC||'id-ID'),{minimumFractionDigits:d,maximumFractionDigits:d});
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const TB={tok:0,timer:null,sig:'',terbaik:null};
async function validasi(l){const E=ECOWAVE;await Promise.all([E.muat(Object.keys(E.LAYER_META),'assets/data/pltgl/'),E.muatRaster('assets/data/pltgl/')]);
 const P=paramEco(),sp=E.analisisSpasial(l.latitude,l.longitude,{P,desa:DESA}),m=E.mcda(sp,l.kw,W,EX,P);return{sp,m}}
const jam=()=>new Date().toLocaleTimeString((window.ECOWAVE_LOC||'id-ID'),{hour:'2-digit',minute:'2-digit',second:'2-digit'});
const persen=s=>Math.max(0,Math.min(100,s/5*100)).toFixed(1);

// Bilah status: menunjukkan masukan apa yang sedang dipakai & analisis terakhir dari Peta/Kalkulator.
function barLive(){const el=$('tbLive');if(!el)return;
 const w=['daya','eko','ked','jar'].map(k=>Math.round(W[k]*100)).join(' / '),musim=(SEA[SA]||[SA])[0],t=SINKRON.baca().terakhir,tb=TB.terbaik;
 let last='<div class="tb-last tb-last-kosong"><span>Analisis terakhir</span><small>Belum ada. Klik titik di Peta atau hitung di Kalkulator; hasilnya muncul di sini.</small></div>';
 if(t&&isFinite(t.fin)){const k=(t.ex&&EX)?{n:'Gugur',c:'#9ca3af'}:kelas(t.fin),d=tb?t.fin-tb.fin:null;
  last='<div class="tb-last"><span>Analisis terakhir</span><b>'+nf(t.lat,3)+', '+nf(t.lng,3)+'</b><em style="background:'+k.c+'">'+nf((t.ex&&EX)?0:t.fin)+'</em><small>'+esc(k.n)+'</small>'+
   (d!=null?'<small class="tb-sel">'+(d>=0?'+':'−')+nf(Math.abs(d))+' <span>dari peringkat 1</span></small>':'')+
   '<a href="kalkulator.php?lat='+(+t.lat).toFixed(4)+'&lng='+(+t.lng).toFixed(4)+'">Buka di Kalkulator →</a></div>'}
 el.innerHTML='<div class="tb-live-h"><span class="tb-dot"></span><b>Terhubung langsung</b><small>Berubah otomatis saat bobot, parameter, atau data di Peta, Kalkulator, dan Kelola berubah.</small></div>'+
  '<div class="tb-chips"><span class="tb-chip"><i>Bobot</i><b>'+w+'</b></span><span class="tb-chip"><i>Musim</i><b>'+esc(musim)+'</b></span>'+
  '<span class="tb-chip"><i>Mode eksklusi</i><b>'+(EX?'Aktif':'Nonaktif')+'</b></span><span class="tb-chip"><i>Kandidat</i><b>'+D.length+'</b></span>'+
  '<span class="tb-chip"><i>Diperbarui</i><b>'+jam()+'</b></span></div>'+last}

function catatan(x){const sp=x.sp,kd=sp.kedalaman,lg=[];
 if(kd&&kd.daratan)lg.push('<div class="bad"><b>Titik berada di DARATAN menurut ETOPO1 ('+nf(kd.z,0)+' m).</b></div>');
 else if(kd&&kd.z!=null&&kd.z<-100)lg.push('<div class="warn"><b>Kedalaman ETOPO1 '+nf(kd.z,0)+' m — terlalu dalam untuk PLTGL dekat pantai, padahal skor Kedalaman tersimpan '+nf(x.l.s[2],1)+'.</b></div>');
 if(sp.ex.length)lg.push('<div class="bad"><b>Eksklusi (data nyata):</b> <span>'+esc(sp.ex.map(e=>e.teks).join('; '))+'</span></div>');
 if(sp.luarCakupan)lg.push('<div class="warn"><span>Di luar cakupan data karang/lamun.</span></div>');
 return lg}
function kartu(x,i){const l=x.l,m=x.m,sp=x.sp,k=m.kelas,no='0'+(i+1),big=i===0;
 const sub=big?['Daya','Ekosistem','Kedalaman','Jarak'].map((n,j)=>'<li><span>'+n+'</span><i><u style="width:'+persen(m.s[j])+'%"></u></i><b>'+nf(m.s[j],1)+'</b></li>').join(''):'';
 const kd=sp.kedalaman,cat=catatan(x).slice(0,big?4:2).join('');
 return '<article class="tb-k'+(big?' tb-k1':'')+'" style="--kc:'+k.c+'"><div class="tb-k-top"><span class="tb-no">'+no+'</span>'+(big?'<span class="tb-tag">Terbaik</span>':'')+'<span class="tb-reg">'+esc(l.region)+'</span></div>'+
  '<h3>'+esc(l.name)+'</h3><div class="tb-skor"><b>'+nf(m.fin)+'</b><small>/ 5</small><em>'+esc(k.n)+'</em></div><div class="tb-bar"><i style="width:'+persen(m.fin)+'%"></i></div>'+
  '<ul class="tb-meta"><li><span>Daya gelombang</span><b>'+nf(l.kw,1)+' kW/m</b></li>'+(kd?'<li><span>Kedalaman</span><b>'+esc(kd.rentang)+'</b></li>':'')+'</ul>'+
  (sub?'<ul class="tb-sub">'+sub+'</ul>':'')+(cat?'<div class="tb-cat">'+cat+'</div>':'')+
  '<div class="tb-act"><button class="btn" onclick="location.href=\'peta.php?fokus='+encodeURIComponent(l.id)+'\'">Lihat di Peta</button><a class="btn2" href="kalkulator.php?lat='+l.latitude+'&lng='+l.longitude+'">Kalkulator</a></div></article>'}

function tabel(urut,semua){const kunciT=[...D].sort((a,b)=>fin(b)-fin(a)).map(l=>l.id);
 return '<div class="tb-tabel-h"><b>Peringkat ulang dengan data nyata (semua kandidat)</b><small>Skor dihitung ulang dari layer PLTGL pada setiap perubahan; kolom Perubahan membandingkan dengan urutan skor tersimpan.</small></div>'+
 '<div class="table-wrap"><table class="w-full text-sm tb-tbl"><thead><tr><th>#</th><th>Lokasi</th><th>Skor nyata</th><th>Skor tersimpan</th><th>Perubahan</th><th>Catatan</th></tr></thead><tbody>'+
 urut.map((x,i)=>{const d=kunciT.indexOf(x.l.id)-i,c=x.m.kelas,ch=d>0?'<span class="tb-up">▲ '+d+'</span>':d<0?'<span class="tb-dn">▼ '+(-d)+'</span>':'<span class="tb-eq">—</span>';
  return '<tr><td>'+(i+1)+'</td><td>'+esc(x.l.name)+'</td><td><div class="tb-sc"><i><u style="width:'+persen(x.m.fin)+'%;background:'+c.c+'"></u></i><b>'+nf(x.m.fin)+'</b><small>'+esc(c.n)+'</small></div></td><td>'+nf(fin(x.l))+'</td><td>'+ch+'</td>'+
  '<td class="text-xs">'+(x.sp.ex.length?esc(x.sp.ex[0].teks):esc(x.sp.peringatan[0]||''))+'</td></tr>'}).join('')+'</tbody></table></div>'}

async function gambar(){const my=++TB.tok;await muatData();if(my!==TB.tok)return;
 TB.sig=JSON.stringify([W,EX,SA,paramEco(),D.length]);barLive();
 const hasil=await Promise.all(D.map(async l=>{try{return{l,...await validasi(l)}}catch(e){return{l,galat:e.message}}}));if(my!==TB.tok)return;
 const ok=hasil.filter(x=>x.m).sort((a,b)=>b.m.fin-a.m.fin),top=ok.filter(x=>!(EX&&x.m.ex)).slice(0,3);
 TB.terbaik=top[0]?{fin:top[0].m.fin,id:top[0].l.id}:null;
 $('top3').innerHTML=top.length?top.map(kartu).join(''):'<div class="card">Semua kandidat tereksklusi pada pengaturan saat ini.</div>';
 $('validasi').innerHTML=ok.length?tabel(ok,hasil)+hasil.filter(x=>x.galat).map(x=>'<div class="vd"><span class="bad">Validasi gagal: '+esc(x.l.name)+' — '+esc(x.galat)+'</span></div>').join(''):'';
 barLive()}
function jadwal(){clearTimeout(TB.timer);TB.timer=setTimeout(gambar,180)}
gambar();
window.onSinkron=()=>{let s='';try{s=JSON.stringify([W,EX,SA,paramEco(),D.length])}catch{}
 if(s!==TB.sig)jadwal();else barLive()};              // hanya analisis terakhir yang berubah -> cukup segarkan bilah status
addEventListener('ecowave:ref',jadwal);                 // Kelola menambah/mengubah titik -> kandidat dimuat ulang
document.addEventListener('visibilitychange',()=>{if(!document.hidden)jadwal()});
