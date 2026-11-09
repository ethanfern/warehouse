// Keeps the page and reader files on the phone so it works offline.
const V = 'belt-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
function save(req, res) {
  if (res && res.ok) { const c = res.clone(); caches.open(V).then(ca => ca.put(req, c)); }
  return res;
}
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  if (u.pathname.includes('/vendor/')) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => save(e.request, res))));
  } else {
    e.respondWith(fetch(e.request).then(res => save(e.request, res)).catch(() => caches.match(e.request)));
  }
});
