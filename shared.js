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
    const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
    const transitionKey='ieqt_page_transition_v1';
    const currentFile=location.pathname.split('/').pop()||'index.html';
    let navigating=false;
    try{
      const incoming=JSON.parse(sessionStorage.getItem(transitionKey)||'null');
      sessionStorage.removeItem(transitionKey);
      if(incoming?.file===currentFile&&Date.now()-incoming.at<5000&&!reducedMotion.matches){
        document.documentElement.classList.add('page-transitioning');
        document.body.classList.add(`page-enter-${incoming.direction}`);
        setTimeout(()=>document.documentElement.classList.remove('page-transitioning'),420);
      }
    }catch(_){}
    function navigateTo(index,href){
      if(navigating||index<0||index>=pageOrder.length)return;
      navigating=true;
      const direction=index>pageIndex?'forward':'backward';
      if(reducedMotion.matches){location.assign(href);return;}
      try{sessionStorage.setItem(transitionKey,JSON.stringify({file:pageOrder[index][0],direction,at:Date.now()}));}catch(_){}
      document.documentElement.classList.add('page-transitioning');
      document.body.classList.add(`page-leave-${direction}`);
      setTimeout(()=>location.assign(href),280);
    }
    document.addEventListener('keydown',event=>{
      if(window.innerWidth<=800||event.repeat||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey||!['ArrowLeft','ArrowRight'].includes(event.key))return;
      if(event.target instanceof Element&&event.target.closest('input,textarea,select,button,[contenteditable],[role="textbox"]'))return;
      const next=pageIndex+(event.key==='ArrowRight'?1:-1);
      if(next<0||next>=pageOrder.length)return;
      event.preventDefault();
      navigateTo(next,new URL(pageOrder[next][0],location.href).href);
    });
    let touchStart=null;
    document.addEventListener('touchstart',event=>{
      touchStart=null;
      if(window.innerWidth>800||event.touches.length!==1||event.target.closest('button,input,textarea,select,label,[contenteditable],iframe'))return;
      const touch=event.touches[0];
      if(touch.clientX<25||touch.clientX>window.innerWidth-25)return;
      touchStart={x:touch.clientX,y:touch.clientY};
    },{passive:true});
    document.addEventListener('touchend',event=>{
      if(!touchStart||event.changedTouches.length!==1)return;
      const deltaX=event.changedTouches[0].clientX-touchStart.x;
      const deltaY=event.changedTouches[0].clientY-touchStart.y;
      touchStart=null;
      if(Math.abs(deltaX)<72||Math.abs(deltaX)<Math.abs(deltaY)*1.4)return;
      const next=pageIndex+(deltaX<0?1:-1);
      navigateTo(next,new URL(pageOrder[next]?.[0]||currentFile,location.href).href);
    },{passive:true});
    document.addEventListener('touchcancel',()=>{touchStart=null;},{passive:true});
    document.addEventListener('click',event=>{
      if(navigating){event.preventDefault();return;}
      if(event.defaultPrevented||event.button!==0||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
      const anchor=event.target.closest('a[href]');
      if(!anchor||anchor.target||anchor.hasAttribute('download'))return;
      const destination=new URL(anchor.href);
      if(destination.origin!==location.origin)return;
      const file=destination.pathname.split('/').pop()||'index.html';
      const index=pageOrder.findIndex(([href])=>href===file);
      if(index<0||index===pageIndex)return;
      event.preventDefault();
      navigateTo(index,destination.href);
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
  if (config.firebase && config.firebase.projectId) {
    import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js').then(async ({initializeApp})=>{
      const {getFirestore,doc,onSnapshot}=await import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js');
      const db=getFirestore(initializeApp(config.firebase));
      onSnapshot(doc(db,'site','publico'), snapshot=>{if(snapshot.exists())applyValues(snapshot.data());},()=>{});
      const imageKeys=[...new Set([...document.querySelectorAll('[data-image]')].map(el=>el.dataset.image))];
      imageKeys.forEach(key=>onSnapshot(doc(db,'site_images',key),snapshot=>{applyValues({[key]:snapshot.exists()?snapshot.data().src:content[key]});},()=>{}));
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
  const form=document.querySelector('[data-contact-form]');
  if(form){
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
    if(config.turnstileSiteKey){const slot=form.querySelector('[data-turnstile]');if(slot){slot.className='cf-turnstile';slot.dataset.sitekey=config.turnstileSiteKey;const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js';script.async=true;document.head.append(script);}}
  }
})();
