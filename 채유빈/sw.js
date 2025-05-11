// 캐시 이름 지정
const cacheName = "cache-v1";

// 사전 캐싱할 리소스 목록
const precacheResources = ["/", "/index.html"];

// 서비스워커가 설치되면, 캐시를 열고 미리 캐싱할 리소스를 추가
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => cache.addAll(precacheResources))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request);
    })
  );
});
