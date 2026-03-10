const CACHE_NAME = 'easysharing-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
    // 今回は特に強力なキャッシュはせず、ネットワークリクエストを通すだけ
    event.respondWith(fetch(event.request).catch(() => {
        return new Response("オフラインです");
    }));
});
