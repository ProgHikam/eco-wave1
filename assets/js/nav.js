/* ECO-WAVE - perilaku navbar: dropdown, menu ponsel, jam, status gelombang langsung (BMKG), modal login. Tanpa ketergantungan. */
(function(){
  'use strict';
  var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var nav=$('#nv'); if(!nav) return;

  /* ---- dropdown (hover di desktop, klik di mana saja) ---- */
  var tutupT=null, desktop=function(){return window.matchMedia('(min-width:941px)').matches};
  function tutupSemua(kecuali){ $$('.nv-dd',nav).forEach(function(d){ if(d!==kecuali){ d.classList.remove('open'); var b=$('button',d); b&&b.setAttribute('aria-expanded','false'); } }); }
  $$('.nv-dd',nav).forEach(function(d){
    var b=$('button',d);
    b.addEventListener('click',function(e){ e.stopPropagation(); var o=!d.classList.contains('open'); tutupSemua(d); d.classList.toggle('open',o); b.setAttribute('aria-expanded',o); });
    d.addEventListener('mouseenter',function(){ if(!desktop()) return; clearTimeout(tutupT); tutupSemua(d); d.classList.add('open'); b.setAttribute('aria-expanded','true'); });
    d.addEventListener('mouseleave',function(){ if(!desktop()) return; tutupT=setTimeout(function(){ d.classList.remove('open'); b.setAttribute('aria-expanded','false'); },160); });
  });
  document.addEventListener('click',function(e){ if(!e.target.closest('.nv-dd')) tutupSemua(); });

  /* ---- menu ponsel ---- */
  var burger=$('.nv-burger',nav);
  function menu(o){ nav.classList.toggle('nv-open',o); burger.setAttribute('aria-expanded',o); document.documentElement.style.overflow=o&&!desktop()?'hidden':''; }
  burger.addEventListener('click',function(e){ e.stopPropagation(); menu(!nav.classList.contains('nv-open')); });
  $$('.nv-links a',nav).forEach(function(a){ a.addEventListener('click',function(){ menu(false); }); });
  window.addEventListener('resize',function(){ if(desktop()) menu(false); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'){ menu(false); tutupSemua(); modal(false); } });

  /* ---- bayangan saat scroll ---- */
  function skrol(){ document.body.classList.toggle('nav-solid',(window.scrollY||0)>40); }
  window.addEventListener('scroll',skrol,{passive:true}); skrol();

  /* ---- jam ---- */
  var jam=$('#jam');
  function tick(){ if(!jam) return; var d=new Date(); jam.textContent=d.toLocaleTimeString((window.ECOWAVE_LOC||'id-ID'),{hour:'2-digit',minute:'2-digit',hour12:false}).replace('.',':')+' WIB'; jam.title=d.toLocaleDateString((window.ECOWAVE_LOC||'id-ID'),{weekday:'long',day:'numeric',month:'long',year:'numeric'}); }
  tick(); setInterval(tick,30000);

  /* ---- latar video: versi 720p untuk layar kecil, jeda bila pengguna meminta gerak dikurangi ---- */
  (function(){ var v=$('#bgVideo video'); if(!v) return;
    if(window.matchMedia('(max-width:700px)').matches){ $$('source',v).forEach(function(x){x.remove();}); v.src='assets/video/bg-samudra-720.mp4'; v.load(); }
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){ v.removeAttribute('autoplay'); v.pause(); } else { var p=v.play(); p&&p.catch&&p.catch(function(){}); } })();

  /* ---- modal login ---- */
  var lm=document.getElementById('loginModal');
  function modal(o){ if(!lm) return; lm.classList.toggle('is-open',o); if(o){ var i=lm.querySelector('input[name=user]'); i&&setTimeout(function(){i.focus()},60); } }
  window.bukaLogin=function(){ modal(true); };
  document.addEventListener('click',function(e){
    if(e.target.closest&&e.target.closest('#nLogin')){ e.preventDefault(); menu(false); modal(true); return; }
    if(e.target===lm||(e.target.closest&&e.target.closest('.lm-x'))) modal(false);
  });

  /* ---- status gelombang langsung: nilai BMKG yang sama dengan Beranda/Peta/Kalkulator (cache bersama di core.js) ---- */
  var chip=$('#nvLive');
  function gambarChip(d,gagal){
    if(!chip) return;
    chip.classList.toggle('off',!!gagal);
    if(gagal||!d||!d.now){ chip.innerHTML='<i></i>BMKG <em>tidak terjangkau</em>'; return; }
    var hs=Number(d.now.hs).toLocaleString((window.ECOWAVE_LOC||'id-ID'),{minimumFractionDigits:1,maximumFractionDigits:1});
    chip.innerHTML='<i></i>Hs '+hs+' m <em>· '+(d.kode||'BMKG')+(d.sumber&&d.sumber!=='langsung'?' ('+d.sumber+')':'')+'</em>';
    chip.title='Prakiraan BMKG Maritim '+(d.nama||'')+' • terbit '+(d.terbit||'-')+' • klik untuk membuka Peta';
  }
  function muatChip(){ if(!chip||typeof window.bmkgLive!=='function') return; window.bmkgLive('P.I.06').then(function(d){ gambarChip(d,false); },function(){ gambarChip(null,true); }); }
  window.addEventListener('load',function(){ muatChip(); setInterval(muatChip,300000); if(typeof SINKRON!=='undefined') SINKRON.onUbah(function(s){ var c=(s.bmkg||{})['P.I.06']; if(c) gambarChip(c,false); }); });
})();
