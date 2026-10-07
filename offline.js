/* Installation and offline readiness for Matter Lab. No external dependencies. */
(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const installed = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const expectedScope = new URL('./', location.href).href;
  const expectedScript = new URL('sw.js', expectedScope).href;
  const ourController = () => navigator.serviceWorker?.controller?.scriptURL === expectedScript;
  let registration, installPrompt, ready = false, waiting = false, reloadAfterUpdate = false, working = false;
  let message = 'Saving the game for offline play…';
  const banner = document.createElement('aside');
  banner.id = 'offlineBanner';
  banner.className = 'offline-banner';
  banner.setAttribute('aria-label', 'Offline app installation');
  banner.innerHTML = '<div><b id="offlineStatus" role="status"></b><small>Install once. Play without internet.</small></div><button id="installAppButton">Install app</button>';
  document.body.insertBefore(banner, document.querySelector('main'));
  const style = document.createElement('style');
  style.textContent = '.offline-banner{max-width:1130px;margin:14px auto 0;padding:10px 15px;display:flex;align-items:center;justify-content:space-between;gap:10px;background:#fff6d6;border:2px solid #243943;border-radius:14px;font-size:14px}.offline-banner b,.offline-banner small{display:block}.offline-banner small{font-size:12px;margin-top:3px}.offline-banner button{font-size:14px;white-space:nowrap;flex-shrink:0}.offline-banner[hidden]{display:none}.offline-state{padding:12px;background:#eaf5f4;border:1px solid #76a2af;border-radius:10px}.offline-state.ready{background:#ecf5d7}.install-actions{display:flex;gap:10px;flex-wrap:wrap;margin:18px 0}.install-actions button{flex:1;min-width:130px}@media(max-width:760px){.offline-banner{margin:8px 10px 10px;font-size:12px;padding:9px}.offline-banner small{font-size:11px}.offline-banner button{font-size:12px;padding:7px 9px}}';
  document.head.append(style);
  function updateUI() {
    byId('offlineStatus').textContent = message;
    banner.hidden = installed() && ready;
    byId('installAppButton').textContent = ready ? 'Install app' : 'Offline setup';
    const status = byId('installDialogStatus');
    if (status) {
      status.textContent = message;
      status.classList.toggle('ready', ready);
    }
    if (byId('installNative')) byId('installNative').disabled = !ready || !installPrompt;
    if (byId('retryOffline')) {
      byId('retryOffline').disabled = working;
      byId('retryOffline').hidden = ready;
    }
    if (byId('updateOffline')) byId('updateOffline').hidden = !waiting;
  }
  function tellWorker(type) {
    return new Promise((resolve, reject) => {
      const worker = navigator.serviceWorker.controller;
      if (!ourController()) return reject(new Error('The offline worker is not controlling this page yet.'));
      const channel = new MessageChannel();
      const timer = setTimeout(() => { channel.port1.close(); reject(new Error('Offline check timed out.')); }, 12000);
      channel.port1.onmessage = event => {
        clearTimeout(timer);
        channel.port1.close();
        if (event.data?.error) reject(new Error(event.data.error)); else resolve(event.data);
      };
      worker.postMessage({type}, [channel.port2]);
    });
  }
  async function verify() {
    try {
      const result = await tellWorker('CHECK_OFFLINE');
      ready = result.ready === true;
      message = ready ? 'Ready to play offline ✓' : 'Not saved yet. Connect to the internet and tap Retry.';
    } catch {
      ready = false;
      message = 'Not saved yet. Connect once, then tap Retry.';
    }
    updateUI();
    return ready;
  }
  async function waitForController() {
    if (ourController()) return;
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => { navigator.serviceWorker.removeEventListener('controllerchange', changed); reject(new Error('Offline setup is not active.')); }, 15000);
      function changed() { if (ourController()) { clearTimeout(timer); navigator.serviceWorker.removeEventListener('controllerchange', changed); resolve(); } }
      navigator.serviceWorker.addEventListener('controllerchange', changed);
      changed();
    });
  }
  function watchUpdate(reg) {
    waiting = !!reg.waiting;
    reg.addEventListener('updatefound', () => {
      const next = reg.installing;
      next?.addEventListener('statechange', () => {
        if (next.state === 'installed' && navigator.serviceWorker.controller) { waiting = !!reg.waiting; updateUI(); }
      });
    });
  }
  async function setup(repair = false) {
    if (working) return;
    if (!['https:', 'http:'].includes(location.protocol) || !('serviceWorker' in navigator) || !isSecureContext) {
      message = 'Use the HTTPS installation link to install this app.';
      ready = false;
      updateUI();
      return;
    }
    working = true;
    message = 'Saving the game for offline play…';
    updateUI();
    try {
      registration = await navigator.serviceWorker.getRegistration('./');
      if (!registration || registration.scope !== expectedScope || (registration.active && registration.active.scriptURL !== expectedScript)) registration = await navigator.serviceWorker.register('./sw.js', {scope:'./', updateViaCache:'none'});
      else if (navigator.onLine) registration.update().catch(() => {});
      watchUpdate(registration);
      await waitForController();
      if (repair) await tellWorker('REPAIR_OFFLINE');
      await verify();
    } catch {
      ready = false;
      message = 'Not saved yet. Connect to the internet, then tap Retry.';
    } finally {
      working = false;
      updateUI();
    }
  }
  async function protectStorage() {
    try { if (navigator.storage?.persist) await navigator.storage.persist(); } catch {}
  }
  function showInstall() {
    const instructions = installed()
      ? '<p>The app is already open from your home screen. Once the check below says <b>Ready to play offline</b>, you can close it and reopen it without internet.</p>'
      : isIOS()
      ? '<ol><li>Open this link in <b>Safari</b>.</li><li>Tap <b>Share</b>, then <b>Add to Home Screen</b>. Enable <b>Open as Web App</b> if offered.</li><li>Tap <b>Add</b>, then launch the new <b>Matter Lab</b> icon while still online.</li><li>Wait for <b>Ready to play offline</b> in the installed app.</li></ol>'
      : '<ol><li>Wait for <b>Ready to play offline</b> below.</li><li>Tap <b>Install</b> below if available. Otherwise use your browser menu → <b>Install app</b> or <b>Add to Home screen</b>.</li><li>Launch the <b>Matter Lab</b> icon once while online and confirm it is ready.</li></ol>';
    openDialog('Install Matter Lab', '<h2>Take the lab with you.</h2>'+instructions+'<p class="offline-state" id="installDialogStatus" role="status"></p><div class="install-actions"><button class="primary" id="installNative" '+(isIOS()||installed()?'hidden':'')+'>Install</button><button id="retryOffline">Retry download</button><button id="updateOffline" hidden>Get new version</button></div><p>After setup, all nine levels, drawings, sounds, quizzes, and teacher notes work offline. Science links open other websites and need internet.</p><p style="font-size:13px">If you clear browser/app data or your phone removes stored website files, open the app online again to restore its offline copy. Uninstalling or clearing its data can remove saved stars.</p>');
    byId('installNative').onclick = async () => {
      if (!ready || !installPrompt) return;
      const prompt = installPrompt;
      installPrompt = null;
      try {
        await prompt.prompt();
        await protectStorage();
        await prompt.userChoice;
      } catch {
        toast('Use your browser menu to install or add to your home screen.');
      }
      updateUI();
    };
    byId('retryOffline').onclick = () => setup(true);
    byId('updateOffline').onclick = () => {
      if (!registration?.waiting) return;
      reloadAfterUpdate = true;
      registration.waiting.postMessage({type:'ACTIVATE_UPDATE'});
    };
    updateUI();
    if (ready) protectStorage();
  }
  byId('installAppButton').onclick = showInstall;
  byId('menu').addEventListener('click', () => {
    const grid = document.querySelector('#dialogBody .menugrid');
    if (!grid) return;
    const button = document.createElement('button');
    button.textContent = installed() ? 'Offline app status' : 'Install offline app';
    button.onclick = () => closeDialog(showInstall);
    grid.prepend(button);
  });
  window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event; updateUI(); });
  window.addEventListener('appinstalled', () => { installPrompt = null; protectStorage(); updateUI(); });
  if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('controllerchange', () => { if (reloadAfterUpdate && ourController()) location.reload(); else verify(); });
  window.addEventListener('online', () => { if (navigator.serviceWorker?.controller) verify(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && navigator.serviceWorker?.controller) verify(); });
  matchMedia('(display-mode: standalone)').addEventListener?.('change', updateUI);
  updateUI();
  setup();
})();
