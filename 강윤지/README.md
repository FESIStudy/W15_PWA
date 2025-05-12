# PWA

## PWA란?

- 웹 애플리케이션이 네이티브 앱과 같은 사용자 경험을 제공할 수 있도록 해주는 현대적인 웹 개발 방식
- 웹 표준 기술만으로도 앱스토어 설치 없이 모바일 홈 화면에 설치할 수 있고, 오프라인에서도 동작하는 강력한 기능을 제공
- Service Worker와 Web App Manifest를 활용하여 네이티브 앱과 같은 고급 기능들을 웹앱에 추가할 수 있음

## 장점

- 빠른 성능을 제공한다.
- 앱 스토어를 거치지 않아도 웹 브라우저에서 바로 앱을 사용할 수 있다.
- 앱 스토어를 거치지 않아도 앱 업데이트가 자동으로 이루어진다.
- 오프라인에서도 작동이 가능하다.
- 검색 엔진 최적화(SEO)에 유리하다.
- 모바일 앱과 웹의 장점을 모두 활용할 수 있다.

## 단점

- 아직 모든 기능이 네이티브 앱과 같지는 않다. OS에서 지원하지 않는 경우 하드웨어 접근이나 네이티브 기능에 대한 제한이 있을 수 있다. 따라서 사용자 경험이 모든 디바이스에서 동일하지 않을 수 있다.
- 브라우저에서 실행되기 때문에 네이티브 앱에 비해서 지연 속도가 크고 배터리 소모량이 더 많을 수 있다.

## 핵심 파일 및 기술

1. Web App Manifest

- `manifest.json` 파일은 브라우저에게 **"이 웹앱은 설치 가능한 앱이다!"** 라고 알려주는 설정 파일.
- 화면에 앱을 추가할 수 있게 하고, 앱의 이름, 아이콘, 시작 경로 등을 정의
  ```html
  <!-- index.html에 연결 -->
  <link rel="manifest" href="manifest.json" />
  ```
  ***
  ## ✅ 필수/선택 속성 설명
  ```json
  {
    "name": "My Progressive Web App",
    "short_name": "MyPWA",
    "icons": [...],
    "start_url": "./index.html",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#000000"
  }
  ```
  | 속성               | 설명                                                                 | 필수 여부               |
  | ------------------ | -------------------------------------------------------------------- | ----------------------- |
  | `name`             | 전체 앱 이름 (홈화면에서 설치 안내, 앱 스플래시 화면에 사용됨)       | ✅                      |
  | `short_name`       | 아이콘 아래 표시될 짧은 이름                                         | ✅                      |
  | `start_url`        | 앱을 실행할 때 시작할 URL                                            | ✅                      |
  | `display`          | 앱 실행 시 어떤 화면 모드로 보여줄지 (`standalone`, `fullscreen` 등) | ✅                      |
  | `icons`            | 앱 아이콘 목록 (여러 크기로 제공해야 함)                             | ✅                      |
  | `background_color` | 앱 로딩 중 배경 색상                                                 | ⭕️ (스플래시에 사용됨) |
  | `theme_color`      | 브라우저 툴바/상단바 색상                                            | ⭕️                     |
  ***
  ## 🎨 주요 속성 자세히 보기
  ### `icons`
  - 홈 화면에 추가될 때 사용되는 앱 아이콘
  - 다양한 해상도 제공 필요 (192x192, 512x512 등)
  ```json
  "icons": [
    { "src": "icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
  ```
  ***
  ### `display`
  | 값           | 설명                                    |
  | ------------ | --------------------------------------- |
  | `standalone` | 네이티브 앱처럼 상단 주소창 없이 표시됨 |
  | `fullscreen` | 완전한 전체화면 (게임 등에서 사용)      |
  | `minimal-ui` | 주소창만 남기고 나머지 숨김             |
  | `browser`    | 일반 웹사이트처럼 브라우저에서 열림     |
  ***
  ### `start_url`
  - 앱 실행 시 어디서부터 시작할지 결정
  - 상대 경로도 가능 (`./index.html` 또는 `/`)
  ***
  ### `background_color` & `theme_color`
  - **스플래시 화면**의 배경색(`background_color`)
  - **브라우저 툴바**나 앱 테마 색(`theme_color`)
  ***
  ## 🌟 고급 속성들
  ### `shortcuts`
  - **앱 아이콘 길게 눌렀을 때 나타나는 메뉴**
  ```json
  "shortcuts": [
    {
      "name": "내 피드",
      "url": "/feed",
      "icons": [{ "src": "/icons/feed.png", "sizes": "96x96" }]
    }
  ]
  ```
  ***
  ### `categories`
  - 앱의 **카테고리**를 지정
  ```json
  "categories": ["education", "productivity"]
  ```
  ***
  ### `screenshots`
  - 앱 설명에 표시할 **미리보기 스크린샷**
  ```json
  "screenshots": [
    {
      "src": "/screenshots/main.png",
      "sizes": "540x720",
      "type": "image/png"
    }
  ]
  ```
  📌 실제로는 **앱스토어나 설치 안내 화면 등에서 활용**됨.
  ***
  ## 🛠 앱 설치 프로세스: `beforeinstallprompt`
  브라우저는 PWA 조건을 만족하면 설치 안내를 띄우려 준비합니다.
  하지만 요즘은 자동으로 띄우지 않고, **개발자가 직접 띄워야 해요.**
  ```jsx
  let deferredPrompt;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // 기본 이벤트 막기
    deferredPrompt = e;

    // 버튼을 보여주는 등 사용자에게 직접 설치 요청할 수 있음
    showInstallButton();
  });
  ```
  → 사용자가 클릭하면:
  ```jsx
  installButton.addEventListener("click", () => {
    deferredPrompt.prompt(); // 설치 안내 띄우기
  });
  ```
  ***
  ## 📱 브라우저별 지원 상태
  | 브라우저          | manifest 지원  | Service Worker 지원 | iOS 설치 지원 |
  | ----------------- | -------------- | ------------------- | ------------- |
  | Chrome (Android)  | ✅             | ✅                  | ✅            |
  | Firefox (Android) | ✅             | ✅                  | ✅            |
  | Safari (iOS)      | ✅ (제한 있음) | ✅ (부분 지원)      | ✅            |
  | Safari (macOS)    | ❌             | ❌                  | ❌            |
  | Chrome (Desktop)  | ✅             | ✅                  | ✅            |
  ### ❗ iOS 주요 제약
  - **푸시 알림 불가** (iOS 16.4부터 제한적 가능)
  - **백그라운드 동기화 불가**
  - `beforeinstallprompt` 이벤트 없음
    → 사용자가 직접 ‘홈 화면에 추가’ 선택해야 함
  ***
  ## ✅ 요약
  | 항목           | 내용                                                        |
  | -------------- | ----------------------------------------------------------- |
  | 역할           | 앱의 메타 정보 및 설치 지원 설정                            |
  | 필수 구성 요소 | `name`, `short_name`, `icons`, `start_url`, `display`       |
  | 고급 옵션      | `shortcuts`, `categories`, `screenshots` 등                 |
  | 주의사항       | 설치 안내를 띄우려면 `beforeinstallprompt` 이벤트 활용 필요 |
  | 브라우저 이슈  | iOS는 기능 제한 있음, Safari는 일부 미지원                  |

2. Service Worker

- 브라우저가 **백그라운드에서 실행**하는 스크립트
- 페이지와는 별도로 실행되며, 다음 기능 제공:
  - 오프라인 지원
  - 리소스 캐싱
  - 푸시 알림
  - 백그라운드 동기화 등

> PWA의 핵심 엔진 역할을 하며, https:// 환경(또는 localhost)에서만 동작함

---

## 🔁 생명주기: `install → activate → fetch`

### 1. `install`

- 서비스워커가 처음 등록될 때 실행
- 이때 **필요한 리소스를 캐시에 저장 (precache)**

```
self.addEventListener('install', (event) => {
    event.waitUntil(
    caches.open('cache-v1').then((cache) => {
        return cache.addAll(['/', '/index.html', '/style.css']);
    })
    );
});

```

---

### 2. `activate`

- 이전 버전의 캐시 정리 등 **초기화 작업**을 수행

```
self.addEventListener('activate', (event) => {
    const cacheWhitelist = ['cache-v1'];
    event.waitUntil(
    caches.keys().then((keys) =>
        Promise.all(
        keys.map((key) => {
            if (!cacheWhitelist.includes(key)) {
            return caches.delete(key);
            }
        })
        )
    )
    );
});

```

---

### 3. `fetch`

- **모든 네트워크 요청을 가로채서** 캐시 여부에 따라 응답

```
self.addEventListener('fetch', (event) => {
    event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
    })
    );
});

```

---

## 💾 Cache API 사용법

- 브라우저의 캐시를 직접 조작 가능
- 자주 사용하는 메서드:

```
// 캐시 열기
const cache = await caches.open('my-cache');

// 파일 캐싱
await cache.add('/index.html');

// 캐시 가져오기
const response = await cache.match('/index.html');

```

---

## 🛠 fetch 이벤트 전략 비교

### 📌 Cache-first

- **오프라인 우선**: 캐시에 있으면 바로 사용, 없으면 네트워크 요청

```
caches.match(request).then((res) => res || fetch(request));

```

### 📡 Network-first

- **최신 데이터 우선**: 네트워크 응답 실패 시 캐시 fallback

```
fetch(request)
    .then((res) => {
    cache.put(request, res.clone());
    return res;
    })
    .catch(() => caches.match(request));

```

### ♻️ Stale-while-revalidate

- **캐시된 데이터 즉시 반환 + 백그라운드에서 최신 데이터 갱신**

```
caches.open('my-cache').then((cache) => {
    return cache.match(request).then((cachedRes) => {
    const networkFetch = fetch(request).then((res) => {
        cache.put(request, res.clone());
        return res;
    });
    return cachedRes || networkFetch;
    });
});

```

> 가장 사용자 경험이 좋은 전략으로 많이 사용됨

---

## 🧠 IndexedDB 연동

> 서비스워커 내부에서는 localStorage를 사용할 수 없고, 비동기 저장소인 IndexedDB를 사용해야 함

### 예시: 사용자 설정 저장

```
const request = indexedDB.open("MyDatabase", 1);

request.onupgradeneeded = (event) => {
    const db = event.target.result;
    db.createObjectStore("settings", { keyPath: "id" });
};

request.onsuccess = () => {
    const db = request.result;
    const tx = db.transaction("settings", "readwrite");
    const store = tx.objectStore("settings");
    store.put({ id: 1, darkMode: true });
};

```

> idb 라이브러리를 쓰면 더 간편하게 쓸 수 있어요

---

## 📌 요약 정리

| 항목          | 설명                                                     |
| ------------- | -------------------------------------------------------- |
| 생명주기      | `install → activate → fetch`                             |
| 핵심 기능     | 오프라인 캐시, 푸시 알림, 백그라운드 통신 등             |
| 캐시 전략     | `Cache-first`, `Network-first`, `Stale-while-revalidate` |
| 비동기 저장소 | IndexedDB (서비스워커 내부에서 사용 가능)                |

3.  아이콘 이미지 파일

- 앱처럼 사용하기 위해 앱아이콘 이미지 파일이 필요합니다.

4. HTTPS

- PWA 을 구현하기 위한 기술은 HTTPS 에서만 사용이 가능하고 브라우저의 보안정책인 CORS 등을 따르기 때문에 보안적인 이점이 있습니다.

## 실습 진행

```jsx
// index.html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#ffffff" />
    <link rel="manifest" href="manifest.json" />
    <link rel="icon" href="icon-192.png" />
    <title>PWA Demo</title>
  </head>
  <body>
    <h1>📱 PWA 예제 웹앱</h1>
    <p>이 앱은 오프라인에서도 동작합니다!</p>

    <script>
      if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
          navigator.serviceWorker
            .register("service-worker.js")
            .then((reg) =>
              console.log("✅ Service Worker 등록 완료:", reg.scope)
            )
            .catch((err) => console.log("❌ Service Worker 등록 실패:", err));
        });
      }
    </script>
  </body>
</html>
```

```jsx
// manifest.json
{
  "name": "PWA Demo App",
  "short_name": "PWA Demo",
  "start_url": "./index.html",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#ffffff",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

```jsx
// service-worker.js
const CACHE_NAME = "pwa-cache-v1";
const FILES_TO_CACHE = [
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

// 설치 이벤트
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 활성화 이벤트
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

// fetch 이벤트
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

- 실습 결과
  ![image.png](attachment:72125595-fc4d-41e5-a75e-ddb834e9dd0f:image.png)

![image.png](attachment:a939ea1b-8280-4c69-b764-567880ce5ee5:image.png)

### 참고

https://yozm.wishket.com/magazine/detail/1969/

https://sylagape1231.tistory.com/123

[https://wevus.net/it/it*terminology/pwa_progressive_web_apps란*사이트를어플화하는방법/](https://wevus.net/it/it_terminology/pwa_progressive_web_apps%EB%9E%80_%EC%82%AC%EC%9D%B4%ED%8A%B8%EB%A5%BC%EC%96%B4%ED%94%8C%ED%99%94%ED%95%98%EB%8A%94%EB%B0%A9%EB%B2%95/)

[https://velog.io/@foxrain_gg/PWAProgressive-Web-Apps란](https://velog.io/@foxrain_gg/PWAProgressive-Web-Apps%EB%9E%80)

https://velog.io/@qkrdkwl9090/PWAProgressive-Web-Application

https://progressier.com/pwa-manifest-generator
