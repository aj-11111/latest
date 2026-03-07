const CACHE_NAME = 'touch-v1';
const ASSETS = [
    './',
    './index.html',
    './styles.css',
    './transparent.css',
    './script.js',
    './manifest.json',
    './images/icon-512.png',
    './images/pj.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
