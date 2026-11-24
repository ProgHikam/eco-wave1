// ECO-WAVE - perilaku tampilan HUD halaman peta (jam, dock, gauge, panel).
// Tidak mengubah logika hitung; hanya membaca hasil dari peta.js lewat window.hudUpdate().
(function(){
  var $=function(i){return document.getElementById(i)};
  var root=$('peta'); if(!root) return;

  // teks chart terang (peta.js memilih warna chart berdasar class "dark")
  document.documentElement.classList.add('dark');
  try{ Chart.defaults.color='#9fd4ff'; Chart.defaults.borderColor='rgba(60,150,255,.2)'; }catch(e){}

  var fmt=function(n,d){ return Number(n).toLocaleString((window.ECOWAVE_LOC||'id-ID'),{minimumFractionDigits:d,maximumFractionDigits:d}); };
  var set=function(id,v){ var e=$(id); if(e) e.textContent=v; };

  // ---- jam header
  function tick(){
    var d=new Date();
    set('hudClock', d.toLocaleDateString((window.ECOWAVE_LOC||'id-ID'),{day:'2-digit',month:'2-digit',year:'numeric'})+'  '+d.toLocaleTimeString((window.ECOWAVE_LOC||'id-ID'),{hour:'2-digit',minute:'2-digit',second:'2-digit'}));
  }
  tick(); setInterval(tick,1000);

  // ---- gauge
  function warnaFin(f,ex){ return ex?'#9ca3af':f>=4?'#34d399':f>=3?'#c8e6b0':f>=2?'#facc15':'#ef4444'; }
  function gauge(pct,label,color){
    pct=Math.max(0,Math.min(100,pct));
    var g=$('hudGauge'); if(g) g.style.setProperty('--p',pct);
    var a=$('hudArc'); if(a) a.style.stroke=color||'';
    set('hudPct',Math.round(pct)+'%'); set('hudPctLbl',label);
  }
  function rumah(est){
    set('hudElec',fmt(est.pListrikKw,1)+' kW');
    set('hudR450',est.rumah450+' Rumah'); set('hudR900',est.rumah900+' Rumah'); set('hudR1300',est.rumah1300+' Rumah');
  }

  // ---- dipanggil peta.js setelah klik peta
  window.hudUpdate=function(o){
    window.__klikAda=true;
    try{
      set('hudKw',fmt(o.kw,2)); set('hudKwLbl','Titik klik '+o.lat.toFixed(3)+', '+o.lng.toFixed(3));
      set('hudHsTe',fmt(o.hs,2)+' m / '+fmt(o.te,2)+' s');
      rumah(o.est);
      set('hudS0',fmt(o.s[0],1)); set('hudS1',fmt(o.s[1],1)); set('hudS3',fmt(o.s[3],1));
      gauge(o.fin/5*100, o.ex?'Eksklusi':'Final Score', warnaFin(o.fin,o.ex));
      set('hudChipA', fmt(o.kw,2)+' kW/m');
      $('hudInfo').classList.add('open');
    }catch(e){}
  };

  // ---- dipanggil saat lokasi kandidat dipilih (tampil di peta.js)
  function dariLokasi(l){
    window.__klikAda=true;
    try{
      var f=fin(l), est=hitungEstimasiListrik(l.kw);
      set('hudKw',fmt(l.kw,2)); set('hudKwLbl',l.name+(l.region?', '+l.region:''));
      set('hudHsTe',l.hs?fmt(l.hs,2)+' m':'CMEMS 2015-2024');
      rumah(est);
      set('hudS0',l.s[0]); set('hudS1',l.s[1]); set('hudS3',l.s[3]);
      gauge(f/5*100,(EX&&l.ex)?'Eksklusi':'Final Score',warnaFin(f,EX&&l.ex));
      set('hudChipA',l.name+' - '+fmt(l.kw,2)+' kW/m');
    }catch(e){}
  }
  try{ var _t=tampil; tampil=function(l,j){ _t(l,j); dariLokasi(l); }; }catch(e){}

  // ---- nilai awal (titik acuan terkuat dari data CMEMS); ikut diperbarui saat data DB masuk
  function nilaiAwal(){
    if(window.__klikAda) return;
    try{
      var p0=CMEMS.titik.reduce(function(a,b){ return b.p>a.p?b:a; }), est0=hitungEstimasiListrik(p0.p);
      set('hudKw',fmt(p0.p,2)); set('hudKwLbl','Titik acuan terkuat - '+p0.nama);
      set('hudHsTe',fmt(p0.hs,2)+' m / '+fmt(p0.te,2)+' s'); rumah(est0);
      gauge(p0.persen,'Daya relatif','#c8e6b0');
      set('hudChipA',p0.nama.split(' ')[0]+' - '+fmt(p0.p,2)+' kW/m');
    }catch(e){}
  }
  nilaiAwal(); try{ onRef(nilaiAwal); }catch(e){}

  // ---- tombol close (x) di tiap kotak panel; buka lagi lewat dock (Panel / tab)
  root.querySelectorAll('.hud-box').forEach(function(box){
    var b=document.createElement('button');
    b.type='button'; b.className='hud-x'; b.title='Tutup panel'; b.setAttribute('aria-label','Tutup panel'); b.innerHTML='&times;';
    b.addEventListener('click',function(e){
      e.stopPropagation(); box.classList.add('closed');
      setTimeout(function(){ try{ map.invalidateSize(); }catch(_){} },50);
    });
    box.appendChild(b);
  });
  // ---- tombol "Perlebar" panel kiri (tabel jadi lebih lega); pilihan diingat per-browser
  (function(){
    var box=$('hudTabTitle'); box=box&&box.closest('.hud-box'); if(!box) return;
    var b=document.createElement('button');
    b.type='button'; b.className='hud-lebar';
    function label(){ var on=root.classList.contains('lebar'); b.innerHTML=(on?'&#8676; Ciutkan':'&#8596; Perlebar'); b.title=on?'Kembalikan lebar panel':'Perlebar panel supaya tabel lebih lega'; b.setAttribute('aria-pressed',on); }
    try{ if(localStorage.getItem('ecowavePanelLebar')==='1') root.classList.add('lebar'); }catch(_){}
    label();
    b.addEventListener('click',function(e){
      e.stopPropagation(); var on=root.classList.toggle('lebar'); label();
      try{ localStorage.setItem('ecowavePanelLebar',on?'1':'0'); }catch(_){}
      setTimeout(function(){ try{ map.invalidateSize(); }catch(_){} },330);
    });
    box.appendChild(b);
  })();
  function bukaSemuaBox(){ root.querySelectorAll('.hud-box.closed').forEach(function(x){ x.classList.remove('closed'); }); }

  // ---- dock bawah
  var dock=$('hudDock'), mobile=function(){ return matchMedia('(max-width:900px)').matches; };
  dock.addEventListener('click',function(e){
    var b=e.target.closest('button'); if(!b) return;
    var tab=b.getAttribute('data-tab'), act=b.getAttribute('data-act');
    if(tab){
      dock.querySelectorAll('button[data-tab]').forEach(function(x){ x.classList.toggle('on',x===b); });
      root.querySelectorAll('#hudLeft .tabpanel').forEach(function(p){ p.classList.toggle('on',p.getAttribute('data-panel')===tab); });
      var h=$('hudTabTitle'); if(h) h.innerHTML=b.querySelector('i').outerHTML+' '+b.querySelector('span').textContent;
      root.classList.remove('panels-off');
      var lb=$('hudTabTitle'); if(lb&&lb.parentNode) lb.parentNode.classList.remove('closed');
      if(mobile()){ root.classList.add('show-left'); root.classList.remove('show-right'); }
    }else if(act==='info'){
      $('hudInfo').classList.toggle('open');
    }else if(act==='panels'){
      if(root.querySelector('.hud-box.closed')){
        bukaSemuaBox(); root.classList.remove('panels-off');
      }else if(mobile()){
        var r=root.classList.toggle('show-right'); root.classList.remove('show-left'); void r;
      }else root.classList.toggle('panels-off');
    }
    setTimeout(function(){ try{ map.invalidateSize(); }catch(_){} },380);
  });

  // pusatkan tampilan awal di zona bebas antara panel kiri & kanan (bukan di tengah layar penuh)
  function pusatkan(){
    try{
      if(mobile()) return;
      var a=$('hudLeft').getBoundingClientRect(), b=$('hudRight').getBoundingClientRect();
      var kiri=root.classList.contains('panels-off')?0:a.right, kanan=root.classList.contains('panels-off')?0:(innerWidth-b.left);
      map.panBy([-(kiri-kanan)/2,0],{animate:false});
    }catch(_){}
  }
  setTimeout(pusatkan,250);

  // peta diklik -> tutup panel mobile supaya peta kelihatan
  try{ map.on('click',function(){ if(mobile()){ root.classList.remove('show-left','show-right'); } $('hudInfo').classList.add('open'); }); }catch(e){}
  try{ addEventListener('resize',function(){ map.invalidateSize(); }); }catch(e){}
})();
