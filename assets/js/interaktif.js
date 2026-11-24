/* ECO-WAVE - interaksi UI saja (animasi muncul kartu, miring saat hover, bar scroll, scrollspy).
   Tidak menyentuh data, hitungan, atau fitur lain. */
(function(){
  'use strict';
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var page=document.body.getAttribute('data-page')||'';
  var SEL=['.card','.cp-card','.info-card','.dt-card','.qcard','.fitur-card','.live-card','.alur-step','.ind','.menu a',
    '.kelas-leg>*','.ringkas-akhir article','.page-head.band','#kpi .kpi','.kpi','.catatan-awal>*','.sec-head','.lit-card','.tabpanel>*'].join(',');
  var HOVER='.card,.live-card,.alur-step,.ind,.fitur-card,.info-card,.dt-card,.menu a,.qcard,#kpi .kpi';

  /* bar progres scroll */
  var bar=document.createElement('div');bar.className='rv-prog';bar.setAttribute('aria-hidden','true');document.body.appendChild(bar);
  function prog(){var h=document.documentElement,t=h.scrollHeight-h.clientHeight;bar.style.transform='scaleX('+(t>0?h.scrollTop/t:0)+')'}
  addEventListener('scroll',prog,{passive:true});prog();

  /* animasi muncul (tidak di halaman Peta agar peta/HUD tidak terganggu) */
  var io=null;
  if(!reduce&&'IntersectionObserver' in window&&page!=='peta'&&page!=='kalkulator'&&page!=='admin'){
    document.documentElement.classList.add('rv-on');
    io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('rv-in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  }
  function tandai(root){
    if(!io)return;
    var els=(root||document).querySelectorAll(SEL);
    for(var i=0;i<els.length;i++){
      var el=els[i];
      if(el.__rv||el.closest('.leaflet-container,.hud-dock,nav,.ax-panel,dialog'))continue;
      el.__rv=1;
      var sib=el.parentElement?Array.prototype.indexOf.call(el.parentElement.children,el):0;
      el.style.setProperty('--rv-d',Math.min(sib,6)*60+'ms');
      el.classList.add('rv');
      if(el.matches(HOVER))el.classList.add('rv-hover');
      io.observe(el);
    }
  }
  function mulai(){
    tandai();
    /* kartu yang dibuat JS belakangan (hasil, peringkat, dll.) */
    if(io&&'MutationObserver' in window){
      var t=0;new MutationObserver(function(){clearTimeout(t);t=setTimeout(tandai,120)}).observe(document.body,{childList:true,subtree:true});
    }
    /* jaring pengaman: jangan pernah biarkan kartu tersembunyi */
    setTimeout(function(){var h=document.querySelectorAll('.rv:not(.rv-in)');for(var i=0;i<h.length;i++){var r=h[i].getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0)h[i].classList.add('rv-in')}},2500);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mulai);else mulai();

  /* miring 3D halus mengikuti kursor */
  if(!reduce&&page!=='kalkulator'&&page!=='admin'&&matchMedia('(hover:hover)').matches){
    document.addEventListener('pointermove',function(e){
      var c=e.target.closest&&e.target.closest('.rv-hover');if(!c)return;
      var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      c.style.setProperty('--rx',(x*7).toFixed(2)+'deg');c.style.setProperty('--ry',(-y*7).toFixed(2)+'deg');
    },{passive:true});
    document.addEventListener('pointerout',function(e){var c=e.target.closest&&e.target.closest('.rv-hover');if(c&&!c.contains(e.relatedTarget)){c.style.setProperty('--rx','0deg');c.style.setProperty('--ry','0deg')}});
  }

  /* scrollspy sub-nav beranda */
  var links=[].slice.call(document.querySelectorAll('.sub-nav a[href^="#"],.info-toc a[href^="#"]'));
  /* Tombol aktif = bagian terakhir (yang punya tombol) yang judulnya sudah melewati 40% tinggi layar.
     Bagian tanpa tombol (subbagian tak bernomor) ikut ke tombol sebelumnya; scroll cepat tidak membuat penanda tertinggal. */
  if(links.length){
    var pasang=[];links.forEach(function(a){var s=null;try{s=document.querySelector(a.getAttribute('href'))}catch(e){}if(s)pasang.push([s,a])});
    var aktif=null,antri=false;
    var tandai=function(){antri=false;var batas=innerHeight*0.4,pilih=null;
      pasang.forEach(function(p){if(p[0].offsetParent!==null&&p[0].getBoundingClientRect().top<=batas)pilih=p[1]});
      if(innerHeight+scrollY>=document.documentElement.scrollHeight-4)pasang.forEach(function(p){var t=p[0].getBoundingClientRect().top;if(p[0].offsetParent!==null&&t<innerHeight-60)pilih=p[1]});   /* mentok bawah: bagian terakhir yang tampak */
      if(pilih===aktif)return;aktif=pilih;
      links.forEach(function(a){a.classList.remove('on');a.removeAttribute('aria-current')});
      if(pilih){pilih.classList.add('on');pilih.setAttribute('aria-current','true')}};
    var minta=function(){if(!antri){antri=true;requestAnimationFrame(tandai)}};
    addEventListener('scroll',minta,{passive:true});addEventListener('resize',minta);addEventListener('load',minta);minta();
  }
})();
