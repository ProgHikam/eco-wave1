/* ECO-WAVE UI - jam navbar, bayangan navbar saat scroll, tab (dipakai semua halaman) */
(function(){const $=id=>document.getElementById(id);
  addEventListener('scroll',()=>{const n=document.querySelector('nav');n&&n.classList.toggle('scrolled',scrollY>20)},{passive:true});
  document.querySelectorAll('[data-tabs]').forEach(g=>{const grp=g.dataset.tabs;
    g.addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(!b)return;const k=b.dataset.tab;
      g.querySelectorAll('[data-tab]').forEach(x=>{const on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-selected',on)});
      document.querySelectorAll('[data-group="'+grp+'"]').forEach(p=>p.classList.toggle('on',p.dataset.panel===k));
      window.onTab&&onTab(grp,k)})});
})();
