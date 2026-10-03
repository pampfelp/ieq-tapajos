(function () {
  'use strict';
  const content = window.IEQ_CONTENT || {};
  const config = window.IEQ_CONFIG || {};
  const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="./assets/icons.svg#${name}"></use></svg>`;
  const nav = [
    ['index.html','A igreja','home','house'],['horarios.html','Horários','horarios','calendar'],
    ['ministerios.html','Ministérios','ministerios','people'],['localizacao.html','Localização','localizacao','pin'],
    ['contato.html','Contato','contato','message'],['visita.html','Visita','visita','door']
  ];
  const page = document.body.dataset.page || '';
  const header = document.querySelector('[data-site-header]');
  if (header) {
    header.innerHTML = `<a class="skip-link" href="#main">Pular para o conteúdo</a><div class="nav-shell"><a class="brand" href="./index.html" aria-label="IEQ Tapajós, página inicial"><img src="./assets/logo-original.png" width="1254" height="1254" alt=""><span class="brand-copy"><strong>TAPAJÓS</strong><small>Pr. Manoel &amp; Pra. Nete Siqueira</small></span></a><a class="btn btn-primary header-cta" href="./visita.html">Venha nos visitar</a></div>`;
    const dock = document.createElement('nav');
    dock.className = 'site-dock';
    dock.setAttribute('aria-label','Páginas do site');
    dock.innerHTML = nav.map(([href,label,key,symbol]) => `<a href="./${href}"${page===key?' aria-current="page"':''} aria-label="${label}">${icon(symbol)}<span>${label}</span></a>`).join('');
    document.body.append(dock);
  }
  const footer = document.querySelector('[data-site-footer]');
  if (footer) footer.innerHTML = `<div class="container footer-grid"><div><a class="brand" href="./index.html"><img src="./assets/logo-original.png" width="1254" height="1254" alt=""><span class="brand-copy"><strong>TAPAJÓS</strong><small>Pr. Manoel &amp; Pra. Nete Siqueira</small></span></a><p>Uma casa para viver a fé no Conjunto Tapajós.</p><p>Pr. Manoel e Pra. Nete Siqueira</p></div><div><h3>Encontre seu caminho</h3><a href="./horarios.html">Horários</a><a href="./ministerios.html">Ministérios</a><a href="./localizacao.html">Localização</a><a href="./visita.html">Primeira visita</a></div><div><h3>Fale com a gente</h3><p data-content="address">${content.address}</p><a data-whatsapp href="#">WhatsApp</a><a data-instagram href="#">Instagram</a><a href="./contato.html">Deixe seu contato</a></div></div><div class="container footer-bottom"><span>© <span data-year></span> IEQ Tapajós. Todos os direitos reservados.</span><a href="./privacidade.html">Privacidade e cookies</a></div>`;
  document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
  const params = new URLSearchParams(location.search);
  const previewMode=params.get('preview')==='1';
  const pageOrder=nav.map(([href,,key])=>[href,key]);
  const pageIndex=pageOrder.findIndex(([,key])=>key===page);
  if(pageIndex>=0&&!previewMode){
    document.body.classList.add('page-swipe-enabled');
    const root=document.documentElement;
    const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
    const headSelector='title,meta[name="description"],link[rel="canonical"],meta[property^="og:"]';
    const indexOf=url=>{const file=new URL(url,location.href).pathname.split('/').pop()||'index.html';return pageOrder.findIndex(([href])=>href===file);};
    const hrefFor=index=>new URL(pageOrder[index][0],location.href).href;
    const pageWidth=()=>root.clientWidth;
    const headNodes=doc=>[...doc.head.querySelectorAll(headSelector)].map(node=>node.cloneNode(true));
    // O site troca de página sem recarregar: cada página vira um <main> guardado numa moldura fixa ao lado da tela.
    // O deslize mostra a moldura; ao fim, o <main> dela entra no lugar do atual e o endereço muda com pushState.
    const pages=new Map();
    const loading=new Map();
    const htmlCache=new Map();
    const scrollByEntry=new Map();
    let current=pageIndex,liveMain=document.querySelector('body>main'),activePeek=null,activeIndex=-1,busy=false,drag=null,pendingSync=false;
    liveMain.tabIndex=-1;
    pages.set(current,{main:liveMain,head:headNodes(document),frame:null});
    function makeFrame(){
      const frame=document.createElement('div');
      frame.className='page-peek';
      frame.setAttribute('aria-hidden','true');
      frame.inert=true;
      const top=header.cloneNode(true);top.removeAttribute('data-site-header');
      const bottom=footer.cloneNode(true);bottom.removeAttribute('data-site-footer');
      frame.append(top,bottom);
      document.body.append(frame);
      return frame;
    }
    function loadHtml(index){
      if(!htmlCache.has(index))htmlCache.set(index,fetch(hrefFor(index)).then(response=>response.ok?response.text():null).catch(()=>null));
      return htmlCache.get(index);
    }
    function loadPage(index){
      if(pages.has(index))return Promise.resolve(pages.get(index));
      if(!loading.has(index))loading.set(index,loadHtml(index).then(html=>{
        loading.delete(index);
        const doc=html&&new DOMParser().parseFromString(html,'text/html');
        const main=doc&&doc.querySelector('main');
        if(!main||main.dataset.mainPage!==pageOrder[index][1]){htmlCache.delete(index);return null;}
        main.removeAttribute('id');
        main.tabIndex=-1;
        const entry={main:document.adoptNode(main),head:headNodes(doc),frame:makeFrame()};
        entry.frame.insertBefore(entry.main,entry.frame.lastElementChild);
        pages.set(index,entry);
        applyValues({});
        watchImages();
        bindForms();
        return entry;
      }));
      return loading.get(index);
    }
    function showPeek(index){
      const frame=pages.get(index)?.frame||null;
      if(frame===activePeek)return;
      activePeek?.classList.remove('is-active');
      activePeek=frame;activeIndex=frame?index:-1;
      frame?.classList.add('is-active');
    }
    function place(offset){
      const transform=offset?`translate3d(${offset}px,0,0)`:'';
      [header,liveMain,footer].forEach(el=>{if(el)el.style.transform=transform;});
      if(activePeek)activePeek.style.transform=`translate3d(${offset+(activeIndex>current?pageWidth():-pageWidth())}px,0,0)`;
    }
    function settle(offset){
      root.classList.add('is-paging','is-paging-settle');
      place(offset);
      return new Promise(resolve=>setTimeout(resolve,reducedMotion.matches?0:360));
    }
    function reset(){
      root.classList.remove('is-paging','is-paging-settle');
      place(0);
      if(activePeek){activePeek.style.transform='';activePeek.scrollTop=0;}
      showPeek(-1);
    }
    function anchorTop(frame,hash){
      const target=hash&&frame.querySelector(`[id="${CSS.escape(decodeURIComponent(hash.slice(1)))}"]`);
      if(!target)return 0;
      return target.getBoundingClientRect().top-frame.getBoundingClientRect().top+frame.scrollTop-(parseFloat(getComputedStyle(target).scrollMarginTop)||0);
    }
    function prepare(entry,url){
      const subject=new URL(url,location.href).searchParams.get('assunto');
      const message=entry.main.querySelector('[data-contact-form] [name="message"]');
      if(message&&subject&&/^(Kids|Casais|Jovens|Mulheres)$/.test(subject))message.value=`Olá! Gostaria de saber mais sobre ${subject}.`;
      const hash=new URL(url,location.href).hash;
      entry.main.querySelectorAll('.is-target').forEach(el=>el.classList.remove('is-target'));
      if(hash)entry.main.querySelector(`[id="${CSS.escape(decodeURIComponent(hash.slice(1)))}"]`)?.classList.add('is-target');
    }
    function waitImages(container){
      const pending=[...container.querySelectorAll('img[src]')].filter(img=>!img.complete).map(img=>img.decode().catch(()=>{}));
      return Promise.race([Promise.all(pending),new Promise(resolve=>setTimeout(resolve,450))]);
    }
    const entryId=()=>history.state&&history.state.ieqt;
    function saveScroll(){
      const id=entryId();
      if(!id)return;
      scrollByEntry.set(id,window.scrollY);
      history.replaceState({...history.state,scrollY:window.scrollY},'');
    }
    function swapTo(index,url,top,push){
      saveScroll();
      const leaving=pages.get(current),entering=pages.get(index);
      leaving.frame=leaving.frame||makeFrame();
      liveMain.removeAttribute('id');
      liveMain.style.transform='';
      liveMain.replaceWith(entering.main);
      leaving.frame.insertBefore(liveMain,leaving.frame.lastElementChild);
      liveMain=entering.main;
      liveMain.id='main';
      document.head.querySelectorAll(headSelector).forEach(node=>node.remove());
      document.head.append(...entering.head.map(node=>node.cloneNode(true)));
      document.body.dataset.page=pageOrder[index][1];
      document.querySelectorAll('.site-dock a').forEach((link,i)=>{if(i===index)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
      current=index;
      if(push)history.pushState({ieqt:Math.random().toString(36).slice(2),scrollY:top},'',url);
      reset();
      window.scrollTo({top,left:0,behavior:'instant'});
      liveMain.focus({preventScroll:true});
      if(window.fbq)window.fbq('track','PageView');
      warmUp();
    }
    async function go(index,url,{push=true,scroll=null,animate=!reducedMotion.matches}={}){
      if(busy||index<0||index>=pageOrder.length)return;
      busy=true;
      const entry=await Promise.race([loadPage(index),new Promise(resolve=>setTimeout(()=>resolve(null),1500))]);
      if(!entry){if(push)location.assign(url);else location.reload();return;}
      prepare(entry,url);
      entry.frame.scrollTop=0;
      const top=scroll??anchorTop(entry.frame,new URL(url,location.href).hash);
      if(animate&&index!==current){
        await waitImages(entry.frame);
        root.classList.remove('is-paging-settle');
        root.classList.add('is-paging');
        showPeek(index);
        place(0);
        entry.frame.scrollTop=top;
        entry.frame.getBoundingClientRect();
        await settle(index>current?-pageWidth():pageWidth());
      }
      swapTo(index,url,top,push);
      busy=false;
      if(pendingSync){pendingSync=false;syncToLocation();}
    }
    function scrollFor(state){return state&&state.ieqt?(scrollByEntry.get(state.ieqt)??state.scrollY??0):0;}
    function syncToLocation(event){
      const index=indexOf(location.href);
      if(index<0){location.reload();return;}
      if(index===current)return;
      if(busy){pendingSync=true;return;}
      go(index,location.href,{push:false,scroll:scrollFor(history.state),animate:!reducedMotion.matches&&!(event&&event.hasUAVisualTransition)});
    }
    function warmUp(){
      [current-1,current+1].forEach(index=>{if(index>=0&&index<pageOrder.length)loadPage(index);});
      pageOrder.forEach((_,index)=>{if(!pages.has(index))loadHtml(index);});
    }
    history.scrollRestoration='manual';
    if(!entryId())history.replaceState({...(history.state||{}),ieqt:Math.random().toString(36).slice(2),scrollY:window.scrollY},'');
    else if(performance.getEntriesByType('navigation')[0]?.type!=='navigate')window.scrollTo({top:history.state.scrollY||0,left:0,behavior:'instant'});
    prepare(pages.get(current),location.href);
    let scrollTimer=0;
    window.addEventListener('scroll',()=>{
      if(busy||drag)return;
      const id=entryId();
      if(!id)return;
      scrollByEntry.set(id,window.scrollY);
      clearTimeout(scrollTimer);
      scrollTimer=setTimeout(()=>{if(!busy&&entryId()===id)history.replaceState({...history.state,scrollY:window.scrollY},'');},200);
    },{passive:true});
    window.addEventListener('popstate',syncToLocation);
    window.addEventListener('hashchange',()=>prepare(pages.get(current),location.href));
    window.addEventListener('pageshow',event=>{if(event.persisted){busy=false;drag=null;reset();syncToLocation();}});
    if(document.readyState==='complete')setTimeout(warmUp,300);else window.addEventListener('load',()=>setTimeout(warmUp,300),{once:true});
    document.addEventListener('keydown',event=>{
      if(window.innerWidth<=800||event.repeat||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey||!['ArrowLeft','ArrowRight'].includes(event.key))return;
      if(event.target instanceof Element&&event.target.closest('input,textarea,select,button,[contenteditable],[role="textbox"]'))return;
      const next=current+(event.key==='ArrowRight'?1:-1);
      if(next<0||next>=pageOrder.length)return;
      event.preventDefault();
      go(next,hrefFor(next));
    });
    document.addEventListener('touchstart',event=>{
      drag=null;
      if(busy||window.innerWidth>800||event.touches.length!==1||event.target.closest('button,input,textarea,select,label,[contenteditable],iframe'))return;
      const touch=event.touches[0];
      if(touch.clientX<25||touch.clientX>window.innerWidth-25)return;
      drag={x:touch.clientX,y:touch.clientY,axis:null,offset:0,lastX:touch.clientX,lastTime:event.timeStamp,speed:0};
    },{passive:true});
    document.addEventListener('touchmove',event=>{
      if(!drag||event.touches.length!==1)return;
      const touch=event.touches[0];
      const deltaX=touch.clientX-drag.x,deltaY=touch.clientY-drag.y;
      if(!drag.axis){
        if(Math.abs(deltaX)<10&&Math.abs(deltaY)<10)return;
        drag.axis=Math.abs(deltaX)>Math.abs(deltaY)*1.2?'x':'y';
        if(drag.axis==='x'){root.classList.remove('is-paging-settle');root.classList.add('is-paging');}
      }
      if(drag.axis!=='x')return;
      if(event.cancelable)event.preventDefault();
      const elapsed=event.timeStamp-drag.lastTime;
      if(elapsed>0)drag.speed=(touch.clientX-drag.lastX)/elapsed;
      drag.lastX=touch.clientX;drag.lastTime=event.timeStamp;
      const target=current+(deltaX<0?1:-1);
      const inRange=target>=0&&target<pageOrder.length;
      if(inRange&&pages.has(target)&&activeIndex!==target){prepare(pages.get(target),hrefFor(target));pages.get(target).frame.scrollTop=0;}
      showPeek(inRange?target:-1);
      drag.offset=inRange?deltaX:deltaX*.25;
      place(drag.offset);
    },{passive:false});
    function endDrag(cancelled){
      const done=drag;drag=null;
      if(!done||done.axis!=='x')return;
      const width=pageWidth();
      const target=current+(done.offset<0?1:-1);
      const fast=Math.abs(done.offset)>40&&Math.abs(done.speed)>.45&&Math.sign(done.speed)===Math.sign(done.offset);
      busy=true;
      if(!cancelled&&activePeek&&activeIndex===target&&(Math.abs(done.offset)>width*.3||fast)){
        settle(done.offset<0?-width:width).then(()=>{swapTo(target,hrefFor(target),0,true);busy=false;if(pendingSync){pendingSync=false;syncToLocation();}});
      }else settle(0).then(()=>{reset();busy=false;if(pendingSync){pendingSync=false;syncToLocation();}});
    }
    document.addEventListener('touchend',()=>endDrag(false),{passive:true});
    document.addEventListener('touchcancel',()=>endDrag(true),{passive:true});
    document.addEventListener('click',event=>{
      if(busy){event.preventDefault();return;}
      if(event.defaultPrevented||event.button!==0||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
      const anchor=event.target.closest('a[href]');
      if(!anchor||anchor.target||anchor.hasAttribute('download'))return;
      const destination=new URL(anchor.href);
      if(destination.origin!==location.origin)return;
      const index=indexOf(destination.href);
      if(index<0)return;
      if(index===current){
        if(destination.hash)return;
        event.preventDefault();
        window.scrollTo({top:0,behavior:reducedMotion.matches?'instant':'smooth'});
        return;
      }
      event.preventDefault();
      go(index,destination.href);
    });
  }
  let values = content;
  if (params.get('preview') === '1') {
    try { values={...content,...JSON.parse(localStorage.getItem('ieqt_draft')||'{}')}; } catch (_) {}
  }
  function safeImageSource(src) {
    if (typeof src !== 'string') return '';
    if (/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(src) && src.length <= 330000) return src;
    if (/^\.\/assets\/[A-Za-z0-9_/-]+\.(?:jpe?g|png|webp|svg)$/.test(src)) return src;
    return '';
  }
  function applyValues(data) {
    const safeData={...data};
    for(const key of ['home_photo','kids_photo','casais_photo','jovens_photo','mulheres_photo','culto_photo','comunidade_photo','fachada_photo','visita_photo','contato_photo']){
      if(key in safeData&&!safeData[key])safeData[key]=content[key];
    }
    values={...values,...safeData};
    document.querySelectorAll('[data-content]').forEach(el=>{const key=el.dataset.content;if(key in values)el.textContent=values[key];});
    document.querySelectorAll('[data-image]').forEach(el=>{const src=safeImageSource(values[el.dataset.image]);const img=el.querySelector('img');if(img&&src){img.dataset.realAlt ||= img.alt;img.alt=src.startsWith('./assets/ilustracao-')?`Imagem ilustrativa provisória: ${img.dataset.realAlt}`:img.dataset.realAlt;img.src=src;el.dataset.hasImage='true';}else if(img){img.removeAttribute('src');el.dataset.hasImage='false';}});
    const number=String(values.whatsapp||content.whatsapp).replace(/\D/g,'');
    document.querySelectorAll('[data-phone-label]').forEach(el=>{el.textContent=number==='5591982808543'?'+55 91 98280-8543':`+${number}`;});
    document.querySelectorAll('[data-whatsapp]').forEach(el=>{el.href=`https://wa.me/${number}`;el.target='_blank';el.rel='noopener noreferrer';});
    document.querySelectorAll('[data-instagram]').forEach(el=>{el.href=`https://www.instagram.com/${encodeURIComponent(values.instagram||content.instagram)}/`;el.target='_blank';el.rel='noopener noreferrer';if(el.hasAttribute('data-edit-target'))el.textContent=`@${values.instagram||content.instagram}`;});
    document.querySelectorAll('[data-route]').forEach(el=>{el.href=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(values.address||content.address)}`;el.target='_blank';el.rel='noopener noreferrer';});
    document.querySelectorAll('[data-map]').forEach(el=>{el.src=`https://www.google.com/maps?q=${encodeURIComponent(values.address||content.address)}&output=embed`;});
  }
  applyValues(values);
  window.IEQ_APPLY_VALUES = applyValues;
  window.addEventListener('message', event=>{if(event.origin===location.origin&&event.data?.type==='ieqt-preview'&&event.data.values)applyValues(event.data.values);});
  let watchImages=()=>{};
  if (config.firebase && config.firebase.projectId) {
    import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js').then(async ({initializeApp})=>{
      const {getFirestore,doc,onSnapshot}=await import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js');
      const db=getFirestore(initializeApp(config.firebase));
      onSnapshot(doc(db,'site','publico'), snapshot=>{if(snapshot.exists())applyValues(snapshot.data());},()=>{});
      const watched=new Set();
      watchImages=()=>document.querySelectorAll('[data-image]').forEach(el=>{const key=el.dataset.image;if(watched.has(key))return;watched.add(key);onSnapshot(doc(db,'site_images',key),snapshot=>{applyValues({[key]:snapshot.exists()?snapshot.data().src:content[key]});},()=>{});});
      watchImages();
    }).catch(()=>{});
  }
  document.querySelector('[data-floating-contact]')?.remove();
  const consentKey='ieqt_analytics_consent_v1';
  const trackingConfigured=Boolean(config.analyticsId||config.metaPixelId);
  const consent=localStorage.getItem(consentKey);
  let banner=document.querySelector('.cookie-banner');
  function loadTracking() {
    if(config.analyticsId){const script=document.createElement('script');script.async=true;script.src=`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.analyticsId)}`;document.head.append(script);window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config',config.analyticsId);}
    if(config.metaPixelId){!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};n.queue=[];t=b.createElement(e);t.async=true;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',config.metaPixelId);fbq('track','PageView');}
  }
  if(consent==='yes'&&!previewMode)loadTracking();
  if(!banner&&trackingConfigured&&document.body.dataset.page!=='admin'&&!previewMode){banner=document.createElement('div');banner.className='cookie-banner';banner.innerHTML='<p><strong>Medição de visitas</strong><br>Podemos usar Google Analytics e Meta Pixel para entender como este site é usado. Esses serviços só serão carregados se você aceitar.</p><div class="button-row"><button class="btn btn-primary" type="button" data-consent-yes>Aceitar medição</button><button class="btn btn-outline" type="button" data-consent-no>Continuar sem medição</button></div>';document.body.append(banner);}
  if(banner&&!consent){banner.classList.add('is-visible');banner.querySelector('[data-consent-yes]').addEventListener('click',()=>{localStorage.setItem(consentKey,'yes');banner.classList.remove('is-visible');loadTracking();window.dispatchEvent(new Event('ieqt-consent-changed'));});banner.querySelector('[data-consent-no]').addEventListener('click',()=>{localStorage.setItem(consentKey,'no');banner.classList.remove('is-visible');window.dispatchEvent(new Event('ieqt-consent-changed'));});}
  if(!previewMode){
    let installPrompt=null;
    const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent);
    const standalone=window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
    const installBanner=document.createElement('div');installBanner.className='install-banner';
    installBanner.innerHTML='<p><strong>IEQ Tapajós no seu celular</strong><br>Adicione o site à tela inicial para encontrar horários, rota e contato com um toque.</p><div class="button-row"><button class="btn btn-primary" type="button" data-install>Adicionar</button><button class="btn btn-outline" type="button" data-install-close>Agora não</button></div>';
    document.body.append(installBanner);
    function showInstall(){if(!standalone&&(installPrompt||isIOS)&&(!trackingConfigured||localStorage.getItem(consentKey))&&!localStorage.getItem('ieqt_install_dismissed_v1'))installBanner.classList.add('is-visible');}
    window.addEventListener('ieqt-consent-changed',()=>setTimeout(showInstall,5000));
    window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;setTimeout(showInstall,8000);});
    if(isIOS)setTimeout(showInstall,8000);
    installBanner.querySelector('[data-install]').addEventListener('click',async()=>{if(installPrompt){installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;installBanner.classList.remove('is-visible');}else{installBanner.querySelector('p').innerHTML='<strong>Como adicionar no iPhone</strong><br>No Safari, toque em Compartilhar e depois em Adicionar à Tela de Início.';installBanner.querySelector('[data-install]').remove();}});
    installBanner.querySelector('[data-install-close]').addEventListener('click',()=>{localStorage.setItem('ieqt_install_dismissed_v1','1');installBanner.classList.remove('is-visible');});
    if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
  }
  // Liga o formulário de contato onde ele estiver, inclusive quando a página entra sem recarregar.
  function bindForms(){
    document.querySelectorAll('[data-contact-form]').forEach(form=>{
      if(form.dataset.bound)return;
      form.dataset.bound='1';
      const status=form.querySelector('.form-status');
      const endpoint=config.formEndpoint;
      form.addEventListener('submit',async event=>{
        event.preventDefault();
        status.textContent='';status.dataset.kind='';
        if(!form.reportValidity())return;
        const contactValue=form.elements.contact.value.trim();
        if(!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactValue)||/^\+?[\d\s()-]{8,20}$/.test(contactValue))){status.textContent='Informe um telefone ou e-mail válido.';status.dataset.kind='error';form.elements.contact.focus();return;}
        if(form.elements.website.value)return;
        if(!endpoint){status.textContent='O envio pelo site ainda está sendo configurado. Fale com a gente pelo WhatsApp.';status.dataset.kind='error';return;}
        const button=form.querySelector('button[type=submit]');button.disabled=true;button.textContent='Enviando...';
        const payload={name:form.elements.name.value.trim(),contact:form.elements.contact.value.trim(),message:form.elements.message.value.trim(),consent:form.elements.consent.checked,website:form.elements.website.value,startedAt:Number(form.elements.startedAt.value),token:form.elements['cf-turnstile-response']?.value||''};
        try{const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});const result=await response.json();if(!response.ok||!result.ok)throw new Error(result.error||'Falha no envio');status.textContent='Mensagem enviada. A igreja entrará em contato pelo dado informado.';status.dataset.kind='ok';form.reset();form.elements.startedAt.value=Date.now();}
        catch(_){status.textContent='Não foi possível enviar agora. Tente o WhatsApp da igreja.';status.dataset.kind='error';}
        finally{button.disabled=false;button.textContent='Enviar mensagem';}
      });
      form.elements.startedAt.value=Date.now();
      if(config.turnstileSiteKey){const slot=form.querySelector('[data-turnstile]');if(slot){slot.className='cf-turnstile';slot.dataset.sitekey=config.turnstileSiteKey;if(window.turnstile)window.turnstile.render(slot);else if(!document.querySelector('script[src*="challenges.cloudflare.com"]')){const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js';script.async=true;document.head.append(script);}}}
    });
  }
  bindForms();
})();
