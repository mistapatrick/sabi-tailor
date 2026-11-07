// Sabi Tailor service worker: saved copy first (instant, works offline), refreshed quietly in the background.
const C="sabi-v5",SHELL=["./","index.html","manifest.webmanifest","logo.svg","icon-192.png"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(SHELL)))});
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  const r=e.request;
  if(r.method!=="GET"||new URL(r.url).origin!==location.origin)return;
  e.respondWith(caches.open(C).then(async c=>{
    const hit=await c.match(r,{ignoreSearch:true});
    const net=fetch(r).then(res=>{if(res&&res.ok)c.put(r,res.clone());return res}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit}
    return (await net)||(r.mode==="navigate"?c.match("index.html"):Response.error());
  }));
});
