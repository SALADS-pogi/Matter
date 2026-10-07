'use strict';
const VERSION = 'a70033fb2dd3186a';
const PREFIX = 'matter-lab-offline:' + self.registration.scope + ':';
const CACHE = PREFIX + VERSION;
const FILES = ['index.html','offline.js','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'];
const URLS = FILES.map(file => new URL(file, self.registration.scope).href);
const INDEX = new URL('index.html', self.registration.scope).href;
async function cacheApp() {
  const cache = await caches.open(CACHE);
  await cache.addAll(URLS.map(url => new Request(url, {cache:'reload'})));
}
async function status() {
  const cache = await caches.open(CACHE);
  const matches = await Promise.all(URLS.map(url => cache.match(url)));
  return {ready:matches.every(response => response?.ok), version:VERSION, files:matches.filter(Boolean).length};
}
self.addEventListener('install', event => { event.waitUntil(cacheApp()); });
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith(PREFIX) && key !== CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const saved = await cache.match(INDEX);
      if (saved) return saved;
      try { return await fetch(request); } catch { return new Response('Matter Lab is not saved on this device yet. Connect once and reopen the installation link.', {status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}}); }
    })());
    return;
  }
  url.search = '';
  if (!URLS.includes(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    return await cache.match(url.href) || fetch(request);
  })());
});
self.addEventListener('message', event => {
  const type = event.data?.type;
  if (type === 'ACTIVATE_UPDATE') { event.waitUntil(self.skipWaiting()); return; }
  if (type !== 'CHECK_OFFLINE' && type !== 'REPAIR_OFFLINE') return;
  event.waitUntil((async () => {
    try {
      if (type === 'REPAIR_OFFLINE') await cacheApp();
      event.ports[0]?.postMessage(await status());
    } catch { event.ports[0]?.postMessage({ready:false,error:'Offline download did not finish. Reconnect and retry.'}); }
  })());
});
