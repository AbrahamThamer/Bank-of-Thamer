// يحفظ ملفات الواجهة لتفتح الصفحة بسرعة. البيانات نفسها تتزامن عبر Firebase.
const CACHE = "family-fund-v6";
const SHELL = ["./", "index.html", "config.js", "manifest.webmanifest", "lib/qrgen.js"];
self.addEventListener("install", e => {
  // كل ملف على حدة، فلا يفشل التثبيت إن نقص ملف
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(SHELL.map(u => c.add(new Request(u, { cache: "reload" })).catch(() => {})))));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  // من الشبكة دائماً وبلا ذاكرة مؤقتة، ثم النسخة المحفوظة عند انقطاع الإنترنت
  e.respondWith(fetch(e.request, { cache: "no-store" }).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request)));
});
