(()=>{
  document.documentElement.classList.add('js');
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];

  // mobile menu
  const burger=$('.burger'), menu=$('.menu');
  burger.addEventListener('click',()=>{const o=menu.classList.toggle('open');burger.setAttribute('aria-expanded',o)});
  $$('.menu a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('open');burger.setAttribute('aria-expanded',false)}));

  // element-level entrance: each heading, line of copy, button, card and image fades up on its own,
  // staggered among the elements that enter the viewport together. Replays on every load or refresh.
  const ATOMS=[
    '.hero h1','.hero .lead','.hero-cta > *',
    '.sec-head .kicker','.sec-head h2','.sec-head > p','.sec-head > div > p',
    '.rev-head .kicker','.rev-head h2','.rev-head .gbar',
    '.svcx-list .item','.svcx-stage',
    '.rev','.rev-more',
    '.gal-item','.gal-nav',
    '.about-img','.about-copy > *:not(.facts)','.facts li',
    '.cta .wrap > *',
    '.contact-grid .kicker','.contact-grid h2','.contact-grid > div > p','.reach a','#quote > *',
    '.qi','.pcard','.mt','.note-bar','.season','.trio figure','.step','.area-grid > div > *','.towns li','.faq-grid .sec-head > *','.faq-item','.hours','.f-brand > *','.f-col','.f-bot'
  ];
  const atoms=[...new Set(ATOMS.flatMap(s=>$$(s)))];
  atoms.forEach(el=>el.classList.add('fx'));
  const io=new IntersectionObserver(es=>{
    es.filter(e=>e.isIntersecting)
      .sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top||a.boundingClientRect.left-b.boundingClientRect.left)
      .forEach((e,i)=>{e.target.style.setProperty('--d',Math.min(i,8)*90+'ms');e.target.classList.add('in');io.unobserve(e.target)});
  },{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  atoms.forEach(el=>io.observe(el));
  // after a refresh the browser may restore a scrolled position: show whatever is already above the fold, no animation
  const settle=()=>atoms.forEach(el=>{if(!el.classList.contains('in')&&el.getBoundingClientRect().bottom<0){el.classList.add('in','static');io.unobserve(el)}});
  addEventListener('load',()=>setTimeout(settle,250));
  addEventListener('pageshow',e=>{if(e.persisted)settle()});

  // interactive gallery + photo viewer
  (()=>{
    const gal=$('.gal'); if(!gal) return;
    const items=$$('.gal-item',gal), dlg=$('#dlg'), img=$('img',dlg), cap=$('p',dlg), count=$('.gal-count');
    const n=items.length, pad=v=>String(v).padStart(2,'0');
    const hover=matchMedia('(hover:hover)');
    const car=matchMedia('(max-width:900px)');
    const goTo=i=>{
      const k=(i+n)%n;
      if(car.matches){const it=items[k];gal.scrollTo({left:it.offsetLeft-(gal.clientWidth-it.offsetWidth)/2,behavior:'smooth'})}
      setOn(k);
    };
    let cur=0, lb=0, timer=0;
    const setOn=i=>{
      cur=(i+n)%n;
      items.forEach((it,k)=>{it.classList.toggle('on',k===cur);it.setAttribute('aria-expanded',k===cur)});
      count.textContent=pad(cur+1)+' / '+pad(n);
    };
    const show=i=>{
      lb=(i+n)%n; const it=items[lb];
      img.src=it.dataset.full; img.alt=$('img',it).alt;
      cap.innerHTML='<b>'+pad(lb+1)+' / '+pad(n)+'</b>'+(it.dataset.cap?'<span>'+it.dataset.cap+'</span>':'');
    };
    const open=i=>{show(i);if(!dlg.open)dlg.showModal()};
    items.forEach((it,i)=>{
      it.addEventListener('mouseenter',()=>{if(car.matches||!hover.matches)return;clearTimeout(timer);timer=setTimeout(()=>setOn(i),90)});
      it.addEventListener('mouseleave',()=>clearTimeout(timer));
      it.addEventListener('focus',()=>{if(!car.matches)setOn(i)});
      it.addEventListener('click',()=>{if(car.matches||it.classList.contains('on'))open(i);else setOn(i)});
    });
    $('.gal-prev').addEventListener('click',()=>goTo(cur-1));
    $('.gal-next').addEventListener('click',()=>goTo(cur+1));
    let sraf=0;
    gal.addEventListener('scroll',()=>{
      if(!car.matches||sraf)return;
      sraf=requestAnimationFrame(()=>{
        sraf=0;
        const mid=gal.scrollLeft+gal.clientWidth/2;
        let best=0,bd=Infinity;
        items.forEach((it,k)=>{const d=Math.abs(it.offsetLeft+it.offsetWidth/2-mid);if(d<bd){bd=d;best=k}});
        if(best!==cur)setOn(best);
      });
    },{passive:true});
    $('.lb-prev',dlg).addEventListener('click',()=>show(lb-1));
    $('.lb-next',dlg).addEventListener('click',()=>show(lb+1));
    $('#dx').addEventListener('click',()=>dlg.close());
    dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});
    dlg.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')show(lb-1);if(e.key==='ArrowRight')show(lb+1)});
    dlg.addEventListener('close',()=>goTo(lb));
  })();

  // service cards preselect the form
  $$('[data-svc]').forEach(a=>a.addEventListener('click',()=>{const s=$('select[name=service]');[...s.options].forEach(o=>{if(o.text===a.dataset.svc){s.value=o.value;s.dispatchEvent(new Event('change'))}})}));

  // form -> email draft
  const form=$('#quote'), note=$('#note');
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const bad=$$('[required]',form).filter(i=>!i.value.trim()||!i.checkValidity());
    $$('input',form).forEach(i=>i.style.borderColor='');
    if(bad.length){bad.forEach(i=>i.style.borderColor='#CE3197');bad[0].focus();note.textContent='Please fill in the starred fields.';return}
    const d=Object.fromEntries(new FormData(form));
    const body=`Name: ${d.first} ${d.last}\nPhone: ${d.phone}\nEmail: ${d.email}\nInterested in: ${d.service}\n\n${d.msg||''}`;
    location.href='mailto:redbudpoolcompany@gmail.com?subject='+encodeURIComponent('Quote request — '+d.service)+'&body='+encodeURIComponent(body);
    note.textContent='Email draft opened — hit send there.';
  });
  // scroll-driven services: pool stays pinned, scroll progress picks the service
  (()=>{
    const root=$('.svcx'); if(!root) return;
    const track=$('.svcx-track'), sticky=$('.svcx-sticky');
    const items=$$('.item',root), dots=$$('.dots i',root);
    const states=['build','maint','season','repair'], labels=['Pool construction','Pool maintenance','Pool opening and closing','Pool repair'];
    let cur=-1;
    const set=i=>{
      if(i===cur) return; cur=i;
      root.dataset.state=states[i];
      items.forEach((it,k)=>{it.classList.toggle('on',k===i);$('.tab',it).setAttribute('aria-expanded',k===i)});
      dots.forEach((d,k)=>d.classList.toggle('on',k===i));
      $('#poolsvg').setAttribute('aria-label','Illustration of a pool: '+labels[i]);
    };
    const geom=()=>{
      const stk=parseFloat(getComputedStyle(sticky).top)||0;
      const total=Math.max(1,track.offsetHeight-sticky.offsetHeight);
      return {stk,total,top:track.getBoundingClientRect().top};
    };
    let raf=0;
    const pinned=()=>getComputedStyle(sticky).position==='sticky';
    const tick=()=>{raf=0;if(!pinned())return;const g=geom();const p=Math.min(.9999,Math.max(0,(g.stk-g.top)/g.total));set(Math.floor(p*4))};
    addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(tick)},{passive:true});
    addEventListener('resize',tick);
    items.forEach((it,i)=>$('.tab',it).addEventListener('click',()=>{
      if(!pinned()){set(i);return}
      const g=geom();
      scrollTo({top:scrollY+g.top-g.stk+g.total*((i+.5)/4),behavior:'smooth'});
    }));
    tick();
  })();
  // custom dropdown: replaces the system select menu so it matches the form
  $$('select').forEach(sel=>{
    const field=sel.closest('.field'), lbl=field&&$('.lbl',field);
    const wrap=document.createElement('div'); wrap.className='sel';
    sel.parentNode.insertBefore(wrap,sel); wrap.appendChild(sel);
    sel.tabIndex=-1; sel.setAttribute('aria-hidden','true');
    const btn=document.createElement('button'); btn.type='button'; btn.className='sel-btn';
    btn.setAttribute('aria-haspopup','listbox'); btn.setAttribute('aria-expanded','false');
    if(lbl){lbl.id=lbl.id||'lbl-'+Math.random().toString(36).slice(2,7); btn.setAttribute('aria-labelledby',lbl.id)}
    const txt=document.createElement('span'); btn.appendChild(txt);
    btn.insertAdjacentHTML('beforeend','<svg class="chev" viewBox="0 0 20 20" aria-hidden="true"><path d="m5 8 5 5 5-5"/></svg>');
    const list=document.createElement('ul'); list.className='sel-list'; list.setAttribute('role','listbox');
    const opts=[...sel.options].map((o,i)=>{const li=document.createElement('li');li.setAttribute('role','option');li.textContent=o.text;list.appendChild(li);return li});
    wrap.append(btn,list);
    let act=sel.selectedIndex;
    const isOpen=()=>wrap.classList.contains('open');
    const sync=()=>{txt.textContent=sel.options[sel.selectedIndex].text;opts.forEach((li,i)=>li.setAttribute('aria-selected',i===sel.selectedIndex))};
    const setAct=i=>{act=(i+opts.length)%opts.length;opts.forEach((li,k)=>li.classList.toggle('act',k===act))};
    const open=()=>{wrap.classList.add('open');btn.setAttribute('aria-expanded','true');setAct(sel.selectedIndex)};
    const close=focus=>{wrap.classList.remove('open');btn.setAttribute('aria-expanded','false');if(focus)btn.focus()};
    const choose=i=>{sel.selectedIndex=i;sel.dispatchEvent(new Event('change',{bubbles:true}));close(true)};
    btn.addEventListener('click',()=>isOpen()?close():open());
    btn.addEventListener('keydown',e=>{
      if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(!isOpen())open();else setAct(act+(e.key==='ArrowDown'?1:-1))}
      else if((e.key==='Enter'||e.key===' ')&&isOpen()){e.preventDefault();choose(act)}
      else if(e.key==='Escape'&&isOpen()){e.preventDefault();close(true)}
      else if(e.key==='Tab'&&isOpen()){close()}
    });
    list.addEventListener('mousedown',e=>e.preventDefault());
    opts.forEach((li,i)=>{li.addEventListener('click',()=>choose(i));li.addEventListener('mousemove',()=>setAct(i))});
    document.addEventListener('click',e=>{if(!wrap.contains(e.target))close()});
    sel.addEventListener('change',sync); sync();
  });
})();
