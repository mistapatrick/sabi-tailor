// Sabi Tailor service worker: saved copy first (instant, works offline), refreshed quietly in the background.
const C="sabi-v7",SHELL=["./","index.html","manifest.webmanifest","logo.svg","icon-192.png"],TOOLS=["vendor/write-excel-file.min.js","vendor/read-excel-file.min.js"];   // TOOLS are saved too, so backup and restore work offline from the first visit
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(SHELL).then(()=>Promise.all(TOOLS.map(u=>c.add(u).catch(()=>null))))))});
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
