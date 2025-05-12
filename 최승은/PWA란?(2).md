# 3. Service Worker 기본기

## Service Worker란?

Service Worker는 브라우저의 백그라운드에서 동작하는 **프록시 형태의 스크립트**로, 네트워크 요청을 가로채고 응답을 제어하거나, 캐싱, 푸시 알림, 백그라운드 동기화 등을 가능하게 하는 핵심 기술이다. 사용자의 네트워크 상태와 무관하게 안정적인 앱 경험을 제공하는 데 핵심 역할을 한다.

## Service Worker 생명주기

Service Worker의 생명주기는 다음 3단계를 따른다:

### 1. `install`

- 최초 등록 시 실행
- 필요한 정적 파일을 미리 캐시에 저장 (pre-caching)
- `self.skipWaiting()` 호출 시 activate 단계로 즉시 이동 가능

```ts
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll(['/index.html', '/main.css', '/logo.png']);
    })
  );
});
```

### 2. activate
-	설치 후 활성화 단계
-	이전 캐시 정리, 클라이언트 통제 등 수행
-	self.clients.claim()으로 현재 클라이언트를 즉시 통제 가능

```
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== 'v1').map((key) => caches.delete(key)))
    )
  );
});
```

### 3. fetch
-	실제 네트워크 요청 가로채기
-	캐시 응답, 네트워크 응답, 혼합 전략 등을 구현

```
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
```

## Cache API 사용법

Service Worker에서 브라우저 캐시를 직접 제어할 수 있게 해주는 API.

### 주요 메서드

메서드 |	설명
--|--
caches.open(name) |	이름으로 캐시 스토리지 열기
cache.add(url) |	단일 파일을 캐시에 추가
cache.addAll(urls[]) |	다수 파일을 캐시에 추가
cache.match(request) |	요청에 대응되는 캐시 검색
cache.put(request, response) |	수동으로 캐시에 넣기
caches.delete(name) |	특정 캐시 제거

```
caches.open('v1').then((cache) => {
  return cache.addAll(['/index.html', '/style.css']);
});
```

## fetch 이벤트 인터셉트와 response 전략

### 1. Cache-first (캐시 우선)

가장 빠른 응답 속도, 오프라인 우선 경험에 유리

```
event.respondWith(
  caches.match(event.request).then((cachedResponse) => {
    return cachedResponse || fetch(event.request);
  })
);
```

### 2. Network-first (네트워크 우선)

최신 데이터 유지에 유리, 네트워크 실패 시 캐시 fallback

```
event.respondWith(
  fetch(event.request)
    .then((networkResponse) => {
      return caches.open('v1').then((cache) => {
        cache.put(event.request, networkResponse.clone());
        return networkResponse;
      });
    })
    .catch(() => caches.match(event.request))
);
```

### 3. Stale-while-revalidate (구버전 즉시 제공 + 비동기 업데이트)

사용자 UX와 데이터 최신성을 모두 확보

```
event.respondWith(
  caches.open('v1').then((cache) => {
    return cache.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        cache.put(event.request, networkResponse.clone());
        return networkResponse;
      });
      return cachedResponse || fetchPromise;
    });
  })
);
```

## IndexedDB 연동 (비동기 데이터 저장)

Service Worker는 비동기 저장소인 IndexedDB와도 연동 가능하여, 복잡한 구조의 데이터를 캐싱하거나 오프라인 상태에서도 사용자가 입력한 데이터를 임시 저장하는 데 유용하다.

```
// IndexedDB에 저장
const saveData = async (key, data) => {
  const db = await idb.openDB('app-store', 1, {
    upgrade(db) {
      db.createObjectStore('cache');
    },
  });
  await db.put('cache', data, key);
};

// IndexedDB에서 불러오기
const getData = async (key) => {
  const db = await idb.openDB('app-store', 1);
  return db.get('cache', key);
};
```

#### 주의: IndexedDB는 비동기 Promise 기반 API이며, idb 라이브러리를 사용하면 API를 더 직관적으로 다룰 수 있다.

# 4. 오프라인 경험 구성하기

## 오프라인 UI/UX 설계 방법론

PWA의 중요한 목표 중 하나는 **네트워크가 불안정하거나 완전히 끊긴 상태에서도 사용자가 기능을 일부 이용할 수 있도록 만드는 것**이다. 이를 위해 다음과 같은 UI/UX 전략이 필요하다.

### 핵심 전략

1. **중단 없는 흐름 (Seamless Fallback)**
   - 연결 실패 시 무반응이 아닌, 친숙한 fallback UI 제공
2. **명확한 피드백**
   - "네트워크 연결이 불안정합니다" 등 사용자에게 현 상태를 알려주는 메시지 제공
3. **로컬 데이터 사용**
   - IndexedDB나 캐시된 데이터로 최소한의 기능이라도 작동하도록 구성
4. **행동 유도**
   - "다시 시도", "저장 후 나중에 전송" 등 사용자 선택지를 제공하여 혼란을 줄임

## 오프라인 fallback page 구성

네트워크 오류 시 보여질 전용 fallback 페이지를 별도로 구성해 캐싱해두는 것이 일반적이다.

### 구성 방식 예시

```ts
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match('/offline.html');
    })
  );
});
```

### 고려 요소
-	/offline.html을 install 시 미리 캐시해둬야 함
-	fallback 페이지는 기본 구조와 스타일을 유지하되, 읽기 전용 콘텐츠 또는 안내 메시지를 제공하는 용도로 사용

## dynamic caching vs static caching

오프라인 경험의 핵심인 캐싱 전략은 크게 두 가지로 나뉜다.

### Static Caching (정적 캐싱)
-	앱의 핵심 리소스들을 미리 캐싱
-	앱의 틀과 로딩 속도 확보에 중점
-	예: /index.html, /main.js, /styles.css, 아이콘 등

```
caches.open('static-v1').then((cache) => {
  return cache.addAll([
    '/',
    '/index.html',
    '/main.js',
    '/offline.html',
    '/logo.png'
  ]);
});
```

### Dynamic Caching (동적 캐싱)
-	사용자가 요청한 데이터를 캐시에 저장
-	API 응답, 이미지, 글 목록 등 동적 리소스를 캐싱
-	보통 네트워크 우선 or stale-while-revalidate 전략과 결합

```
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).then((response) => {
          return caches.open('dynamic-v1').then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
      );
    })
  );
});
```

## App Shell Architecture

### 개념

App Shell은 앱의 UI 구조(네비게이션, 헤더, 사이드바 등)를 구성하는 기본적인 정적 리소스 세트를 말하며, 한 번만 네트워크에서 받아온 뒤 캐시를 통해 빠르게 재사용하는 방식이다.

핵심은 콘텐츠보다 앱 구조를 먼저 로드하는 방식으로 사용자에게 “앱이 즉시 로드되는 것처럼 보이게” 한다는 점이다.

### 특징
-	UI 프레임을 정적으로 캐싱 (Static Shell)
-	콘텐츠만 비동기 로딩 (Dynamic Content)
-	React, Vue, Angular와 같이 컴포넌트 기반 프레임워크에 적합

### 예시

```
// App Shell 구조 캐싱
caches.open('shell-v1').then((cache) => {
  return cache.addAll([
    '/',
    '/index.html',
    '/app.js',
    '/style.css'
  ]);
});
```
-	이후 콘텐츠는 API로 불러오고, fallback이나 skeleton UI를 사용해 로딩 경험을 개선
