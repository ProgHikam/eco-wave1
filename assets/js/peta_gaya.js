/* ECO-WAVE - modul gaya peta bersama (Peta & Kalkulator): pilihan peta dasar, kontrol, penanda, popup kartu, legenda.
   Hanya tampilan; tidak berisi logika analisis. Memerlukan Leaflet (L). */
(function(root){
  'use strict';
  var ESRI='https://server.arcgisonline.com/ArcGIS/rest/services/', ATR_E='Tiles &copy; Esri &mdash; Esri, HERE, Garmin, USGS, NOAA, &copy; OpenStreetMap contributors';
  var BASEMAPS={
    gelap:   {nama:'Gelap',   ikon:'bi-moon-stars', url:ESRI+'Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', maxZoom:19, maxNativeZoom:16, attr:ATR_E,
              ref:ESRI+'Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}'},
    laut:    {nama:'Laut',    ikon:'bi-water',      url:ESRI+'Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}', maxZoom:19, maxNativeZoom:13, attr:ATR_E,
              ref:ESRI+'Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}'},
    satelit: {nama:'Satelit', ikon:'bi-globe-asia-australia', url:ESRI+'World_Imagery/MapServer/tile/{z}/{y}/{x}', maxZoom:19, maxNativeZoom:18, attr:ATR_E,
              ref:ESRI+'Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'},
    jalan:   {nama:'Jalan',   ikon:'bi-signpost-2', url:ESRI+'World_Street_Map/MapServer/tile/{z}/{y}/{x}', maxZoom:19, maxNativeZoom:19, attr:ATR_E},
    topo:    {nama:'Topografi',ikon:'bi-layers-half',url:ESRI+'World_Topo_Map/MapServer/tile/{z}/{y}/{x}', maxZoom:19, maxNativeZoom:19, attr:ATR_E},
    osm:     {nama:'OSM',     ikon:'bi-map',        url:'https://tile.openstreetmap.org/{z}/{x}/{y}.png', maxZoom:19, maxNativeZoom:19, attr:'&copy; OpenStreetMap contributors'}
  };
  var KUNCI='ecowave_basemap';
  function ambil(){ try{ var k=localStorage.getItem(KUNCI); return BASEMAPS[k]?k:null; }catch(e){ return null; } }

  /* ---- peta dasar + pemilih (tersimpan, dipakai bersama Peta & Kalkulator) ---- */
  function pasangBasemap(map,opsi){
    opsi=opsi||{}; var aktif=ambil()||opsi.awal||'gelap', lapis=null, ref=null, gagal=0, cadangan=false;
    function pasang(k){
      if(lapis) map.removeLayer(lapis); if(ref){ map.removeLayer(ref); ref=null; }
      var b=BASEMAPS[k]; aktif=k; gagal=0; cadangan=false;
      lapis=L.tileLayer(b.url,{maxZoom:b.maxZoom,maxNativeZoom:b.maxNativeZoom,attribution:b.attr,crossOrigin:true}).addTo(map); lapis.bringToBack();
      lapis.on('tileerror',function(){ if(cadangan||++gagal<5) return; cadangan=true; map.removeLayer(lapis);
        lapis=L.tileLayer(BASEMAPS.osm.url,{maxZoom:19,attribution:BASEMAPS.osm.attr}).addTo(map); lapis.bringToBack(); });
      if(b.ref){ ref=L.tileLayer(b.ref,{maxZoom:b.maxZoom,maxNativeZoom:Math.min(b.maxNativeZoom||13,13),opacity:k==='satelit'?.9:.85,pane:'shadowPane'}).addTo(map); }
      map.getContainer().setAttribute('data-basemap',k);
      try{ localStorage.setItem(KUNCI,k); }catch(e){}
      if(root.SINKRON) try{ SINKRON.tulis({basemap:k}); }catch(e){}
    }
    pasang(aktif);
    var C=L.Control.extend({options:{position:opsi.posisi||'topright'},onAdd:function(){
      var d=L.DomUtil.create('div','cp-ctl cp-base'); d.setAttribute('role','group'); d.setAttribute('aria-label','Peta dasar');
      Object.keys(BASEMAPS).forEach(function(k){
        var b=L.DomUtil.create('button','',d); b.type='button'; b.title='Peta dasar: '+BASEMAPS[k].nama; if(k===aktif) b.className='on';
        b.innerHTML='<i class="bi '+BASEMAPS[k].ikon+'"></i><span>'+BASEMAPS[k].nama+'</span>';
        b.onclick=function(){ pasang(k); [].forEach.call(d.children,function(x){ x.classList.remove('on'); }); b.classList.add('on'); };
      });
      L.DomEvent.disableClickPropagation(d); L.DomEvent.disableScrollPropagation(d); return d; }});
    new C().addTo(map);
    return {ganti:pasang,aktif:function(){return aktif;}};
  }

  /* ---- kontrol: koordinat, skala, layar penuh, pusatkan ---- */
  function kontrolKoordinat(map){
    var C=L.Control.extend({options:{position:'bottomleft'},onAdd:function(){
      var d=L.DomUtil.create('div','cp-ctl cp-koord'); d.innerHTML='<b>LAT</b>–  <b>LNG</b>–  <b>Z</b>'+map.getZoom();
      map.on('mousemove',function(e){ d.innerHTML='<b>LAT</b>'+e.latlng.lat.toFixed(4)+'  <b>LNG</b>'+e.latlng.lng.toFixed(4)+'  <b>Z</b>'+map.getZoom(); });
      map.on('zoomend',function(){ d.innerHTML=d.innerHTML.replace(/<b>Z<\/b>\d+/,'<b>Z</b>'+map.getZoom()); });
      return d; }});
    return new C().addTo(map);
  }
  function kontrolAksi(map,opsi){
    var C=L.Control.extend({options:{position:opsi.posisi||'topleft'},onAdd:function(){
      var d=L.DomUtil.create('div','leaflet-bar');
      (opsi.tombol||[]).forEach(function(t){ var a=L.DomUtil.create('a','',d); a.href='#'; a.title=t.judul; a.setAttribute('role','button'); a.innerHTML='<i class="bi '+t.ikon+'"></i>';
        L.DomEvent.on(a,'click',function(e){ L.DomEvent.preventDefault(e); L.DomEvent.stopPropagation(e); t.aksi(a); }); });
      L.DomEvent.disableClickPropagation(d); return d; }});
    return new C().addTo(map);
  }
  var STUDI=[[-8,104.5],[-6,107]];
  function kontrolUmum(map,opsi){
    opsi=opsi||{};
    L.control.scale({imperial:false,position:'bottomleft'}).addTo(map);
    kontrolKoordinat(map);
    var wadah=opsi.wadah||map.getContainer();
    kontrolAksi(map,{posisi:'topleft',tombol:[
      {ikon:'bi-arrows-move',judul:'Fokus ke seluruh area studi',aksi:function(){
        var b=root.ECOWAVE&&root.ECOWAVE.batasAreaStudi?root.ECOWAVE.batasAreaStudi():[104.5,-8,107,-6];
        map.flyToBounds([[b[1],b[0]],[b[3],b[2]]],{padding:[30,30],duration:.8});
      }},
      {ikon:'bi-crosshair',judul:'Fokus ke titik terpilih',aksi:function(){ var ll=opsi.titik&&opsi.titik();
        if(ll) map.flyTo(ll,Math.max(map.getZoom(),11),{duration:.8}); else L.popup({className:'cp-popup',closeButton:false,autoClose:true}).setLatLng(map.getCenter()).setContent(kartu({judul:'Belum ada titik',sub:'Klik peta untuk memilih titik analisis dulu.'})).openOn(map); }},
      {ikon:'bi-arrows-fullscreen',judul:'Layar penuh',aksi:function(){
        var el=opsi.layarPenuh||wadah; if(document.fullscreenElement){ document.exitFullscreen(); } else if(el.requestFullscreen){ el.requestFullscreen(); } }}
    ]});
    document.addEventListener('fullscreenchange',function(){ setTimeout(function(){ map.invalidateSize(); },200); });
    // riak kecil di titik klik
    map.on('click',function(e){ var s=document.createElement('span'); s.className='cp-ripple'; s.style.left=e.containerPoint.x+'px'; s.style.top=e.containerPoint.y+'px';
      map.getContainer().appendChild(s); setTimeout(function(){ s.remove(); },900); });
  }
  function batasStudi(map,batas){
    batas=batas||[104.5,-8,107,-6];
    var g=L.layerGroup(),s=[[batas[1],batas[0]],[batas[3],batas[2]]];
    L.rectangle(s,{color:'#22d3ee',weight:1.4,fill:false,dashArray:'6,8',opacity:.7,interactive:false}).addTo(g);
    L.marker([batas[3],batas[0]],{interactive:false,icon:L.divIcon({className:'',html:'<span class="cp-label studi">Area studi · Banten Selatan</span>',iconAnchor:[-4,-4]})}).addTo(g);
    return g.addTo(map);
  }
  // Garis batas timur cakupan data karang/lamun (celah K5). cakupan = [x0,y0,x1,y1] dari ECOWAVE.cakupanHabitat()
  function batasCakupan(map,cakupan,batasTampilan){
    if(!cakupan) return null; var g=L.layerGroup();
    var b=batasTampilan||cakupan;
    L.rectangle([[b[1],b[0]],[b[3],b[2]]],{color:'#facc15',weight:1.2,fill:false,dashArray:'3,7',opacity:.75,interactive:false}).addTo(g);
    var teks=batasTampilan?'Batas area analisis manual · '+b[2].toFixed(2)+'°BT<br>Jika di luar data habitat: <b>data tidak tersedia</b>':'Batas cakupan data karang/lamun · '+cakupan[2].toFixed(2)+'°BT →<br>di timur garis ini: <b>tidak ada data</b>';
    L.marker([-6.02,b[2]],{interactive:false,icon:L.divIcon({className:'',html:'<span class="cp-label">'+teks+'</span>',iconAnchor:[0,0]})}).addTo(g);
    return g.addTo(map);
  }

  /* ---- penanda ---- */
  function ikonSkor(skor,warna,nama,gugur){
    return L.divIcon({className:'',iconSize:[38,38],iconAnchor:[19,19],popupAnchor:[0,-22],
      html:'<div class="cp-pin"><div class="cp-badge'+(gugur?' gugur':'')+'" style="--c:'+warna+'">'+(gugur?'<i class="bi bi-slash-circle"></i>':Number(skor).toFixed(1))+'</div><span class="cp-nama">'+esc(nama)+'</span></div>'});
  }
  function ikonCmems(label){ return L.divIcon({className:'',iconSize:[24,24],iconAnchor:[12,12],html:'<div class="cp-cm">'+esc(label)+'</div>'}); }
  function ikonDesa(){ return L.divIcon({className:'cp-desa-ic',iconSize:[12,12],iconAnchor:[6,6],html:'<div class="cp-desa"></div>'}); }
  function ikonTarget(){ return L.divIcon({className:'',iconSize:[44,44],iconAnchor:[22,22],html:'<div class="cp-target"><i></i></div>'}); }

  /* ---- popup kartu ---- */
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  // kartu({judul,sub,skor,warna,kelas,baris:[[k,v]],alert,tip,aksi:[{teks,href|klik,alt}]}) -> HTML (nilai baris boleh berisi HTML sederhana)
  function kartu(o){
    var h='<div class="cp-card"><h4>'+esc(o.judul)+'</h4>'+(o.sub?'<div class="sub">'+esc(o.sub)+'</div>':'');
    if(o.skor!=null) h+='<div class="skor"><b style="color:'+(o.warna||'#fff')+'">'+esc(o.skor)+'</b>'+(o.kelas?'<span class="pill" style="background:'+(o.warna||'#94a3b8')+'">'+esc(o.kelas)+'</span>':'')+'</div>';
    if(o.baris&&o.baris.length) h+='<dl>'+o.baris.map(function(r){ return '<dt>'+r[0]+'</dt><dd>'+r[1]+'</dd>'; }).join('')+'</dl>';
    if(o.alert) h+='<div class="alert">'+o.alert+'</div>'; if(o.tip) h+='<div class="tip">'+o.tip+'</div>';
    if(o.aksi&&o.aksi.length) h+='<div class="aksi">'+o.aksi.map(function(a){ return a.href?'<a class="'+(a.alt?'alt':'')+'" href="'+esc(a.href)+'">'+esc(a.teks)+'</a>':'<button type="button" class="'+(a.alt?'alt':'')+'" onclick="'+a.klik+'">'+esc(a.teks)+'</button>'; }).join('')+'</div>';
    return h+'</div>';
  }
  var OPS_POPUP={className:'cp-popup',maxWidth:320,minWidth:220,autoPanPadding:[40,70]};

  /* ---- legenda kecil di peta (bisa dilipat) ---- */
  function kontrolLegenda(map,judul,itemsFn,posisi){
    var el=null;
    var C=L.Control.extend({options:{position:posisi||'bottomright'},onAdd:function(){
      el=L.DomUtil.create('details','cp-ctl cp-legenda'); el.open=false;
      L.DomEvent.disableClickPropagation(el); L.DomEvent.disableScrollPropagation(el); isi(); return el; }});
    function isi(){ if(!el) return; var items=itemsFn(); el.innerHTML='<summary><i class="bi bi-list-ul"></i>'+esc(judul)+'</summary>'+items; }
    var c=new C().addTo(map); c.segarkan=isi; return c;
  }
  var li=function(w,t,tipe){ return '<div class="li"><i class="sw '+(tipe||'')+'" style="background:'+w+'"></i>'+t+'</div>'; };

  root.ECOWAVE_PETA={BASEMAPS:BASEMAPS,STUDI:STUDI,pasangBasemap:pasangBasemap,kontrolUmum:kontrolUmum,kontrolAksi:kontrolAksi,batasStudi:batasStudi,batasCakupan:batasCakupan,
    ikonSkor:ikonSkor,ikonCmems:ikonCmems,ikonDesa:ikonDesa,ikonTarget:ikonTarget,kartu:kartu,OPS_POPUP:OPS_POPUP,kontrolLegenda:kontrolLegenda,li:li,esc:esc};
})(window);
