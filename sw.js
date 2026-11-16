const CACHE='slimefall-wild-ascension-v1.0.0';
const FILES=['./','./index.html','./style.css','./engine.js','./app.js','./manifest.json','./enemies.webp','./icons.webp','./frame.webp','./forest.webp','./icon192.png','./icon512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
 e.respondWith(caches.open(CACHE).then(async c=>await c.match(e.request)||fetch(e.request)));
});
