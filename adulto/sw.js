const CACHE = 'guitarra-adulto-v1';

// Solo borramos cachés de ESTA app. La app de Feli vive en el mismo dominio
// y comparte el almacenamiento: si borráramos todo, la dejaríamos sin offline.
const CACHE_PREFIX = 'guitarra-adulto-';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Al instalar, guardamos la app entera (si falta un archivo, no rompe la instalación)
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(
        ASSETS.map(url => c.add(url).catch(() => null))
      ))
      .then(() => self.skipWaiting())
  );
});

// Al activar, limpiamos solo las versiones viejas de esta app
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k.startsWith(CACHE_PREFIX) && k !== CACHE)
            .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Primero la red, y si no hay internet, lo guardado
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if(res && res.status === 200){
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
