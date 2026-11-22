/* Cache the whole release before activation. Never erase device saves. */
const CACHE='slimefall-eternal-v5.0.0';
const FILES=['./','./index.html','./style.css','./engine.js','./app.js','./manifest.json','./enemies.webp','./icons.webp','./frame.webp','./forest.webp','./icon192.png','./icon512.png','./enemies2.webp','./icons2.webp','./effects.webp','./biomes.webp','./enemies3.webp','./icons3.webp','./haven.js','./haven.webp','./moonframe.webp','./havenicons.webp','./forge.js','./expedition.js','./expedition-icons.webp'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(url=>new Request(url,{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
 e.respondWith(caches.open(CACHE).then(async c=>await c.match(e.request)||fetch(e.request)));
});
