# 9. 배포 및 버전 관리

## Service Worker 업데이트 전략

### 기본 흐름

1. 새로운 SW 등록 시, 브라우저는 기존 SW와 비교하여 **파일 내용이 변경되었을 경우** 새로 설치
2. 설치 후에도 기존 SW가 클라이언트를 점유하고 있으면 **즉시 적용되지 않음**
3. 모든 클라이언트가 종료되거나 `skipWaiting()` 호출 시 새로운 SW가 적용

```ts
// 신규 서비스 워커 내부에서
self.addEventListener('install', (event) => {
  self.skipWaiting(); // 즉시 활성화 시도
});

self.addEventListener('activate', (event) => {
  clients.claim(); // 기존 페이지에 새 SW 적용
});
```

> 실무에서는 사용자의 데이터 손실을 막기 위해 즉시 업데이트 여부는 사용자에게 알리고 수동 적용하는 것이 안전하다.

#### 실전 예시 (프론트에서)

```
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then((reg) => {
    reg.onupdatefound = () => {
      const newWorker = reg.installing;
      newWorker?.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // 새 버전 설치됨 - 사용자에게 새로고침 안내
          showUpdateBanner();
        }
      });
    };
  });
}
```

## Cache Busting 전략

브라우저는 정적 자산을 강하게 캐싱하는 성격이 있어, 변경된 파일이 있어도 이전 리소스를 사용할 수 있다. 이를 방지하기 위해 파일 해시 기반 캐시 무효화(Cache Busting) 전략이 필요하다.

### 예시 (Webpack, Vite)

```
// Webpack
output: {
  filename: '[name].[contenthash].js'
}

// Vite
build: {
  assetsDir: 'assets',
  rollupOptions: {
    output: {
      entryFileNames: `assets/[name].[hash].js`,
      chunkFileNames: `assets/[name].[hash].js`,
      assetFileNames: `assets/[name].[hash].[ext]`
    }
  }
}
```

-	파일명에 해시가 포함되면 브라우저는 새로운 파일로 인식 → 자동 갱신 유도

## 버전별 캐시 분리

Service Worker에서 캐시를 저장할 때 캐시명을 명시적으로 버전 관리하는 것이 중요하다.

### 예시: cache-v1, cache-v2 전략

```
const CACHE_NAME = 'cache-v2';
const URLS_TO_CACHE = ['/', '/index.html', '/main.js'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
});
```

> 이렇게 하면 새 버전의 Service Worker가 등록될 때 구 버전 캐시가 자동으로 삭제되며, 불필요한 리소스 낭비를 방지할 수 있다.

## Netlify / Vercel / Firebase Hosting 설정 팁

### Netlify
-	netlify.toml로 캐시 정책 및 헤더 설정 가능

```
[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
-	서비스 워커는 /sw.js처럼 루트 경로에 위치하도록 조정

### Vercel
-	자동 캐시 적용되므로, vercel.json 또는 meta 태그로 cache-control을 명시적으로 override

```
{
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }
      ]
    }
  ]
}
```
-	SPA 리다이렉트 설정은 rewrites로 /index.html 지정

## Firebase Hosting

```
{
  "hosting": {
    "public": "dist",
    "rewrites": [{ "source": "**", "destination": "/index.html" }],
    "headers": [
      {
        "source": "/sw.js",
        "headers": [{ "key": "Cache-Control", "value": "no-cache" }]
      }
    ]
  }
}
```
-	firebase.json에서 SPA fallback과 SW 캐시 비활성화 정책 적용

# 10. PWA를 활용한 실제 프로젝트 사례 분석

## 1. 유명 PWA 사례 분석

### Twitter Lite

- **목표**: 데이터 사용량 절감, 전 세계 어디서든 빠른 접근
- **성과**:
  - 3%의 데이터만 사용하여 전체 앱 제공
  - 평균 페이지 로드 시간 30% 개선
  - 세션당 전환율 65% 증가
- **기술 요소**:
  - Service Worker + App Shell
  - Web Push Notification
  - Lazy Load + Prefetch 전략
  - Home Screen 설치 안내 및 오프라인 캐싱

### Spotify Web Player (mobile)

- **목표**: 앱 설치 없이도 Spotify를 사용할 수 있도록 브라우저 기반 앱 구현
- **성과**:
  - 설치 없이 iOS에서도 앱과 유사한 UI/UX 제공
  - 데스크톱 Chrome에서도 독립 실행 가능
- **기술 요소**:
  - App Shell + Media Session API
  - iOS 대응을 위한 UI/UX 튜닝
  - 오프라인 음악 재생은 미지원 (기술적 한계 고려)

### AliExpress

- **목표**: 글로벌 유저 확보를 위한 가벼운 쇼핑 경험 제공
- **성과**:
  - 신규 유저 전환율 104% 증가
  - iOS 유저 참여율 82% 향상
- **기술 요소**:
  - Web App Manifest + Service Worker 기반 캐싱
  - Push Notification
  - Low-end 기기 최적화 (경량화된 렌더링 구조)
  - 동적 이미지 최적화 (CDN + responsive image)

## 2. 각 사례의 기술 적용 방식 비교

| 항목               | Twitter Lite         | Spotify              | AliExpress           |
|--------------------|----------------------|----------------------|----------------------|
| 캐시 전략          | App Shell + Dynamic  | Static + streaming UI| App Shell + Dynamic  |
| Push 알림          | 지원               | 미지원 (음악 특성)| 지원               |
| 오프라인 기능      | 읽기 전용 지원     | 음악 스트리밍 한계| 제품 목록 가능     |
| 설치 안내 UX       | 적극적으로 유도       | 부분 지원             | 설치 안내 배너 제공  |
| iOS 대응           | 설치 가이드 제공     | 커스텀 UI 구성        | fallback UI 구현     |


## 3. 우리 프로젝트에서 적용해볼 수 있는 PWA 전략 설계

### 프로젝트 특성 고려

- **SPA 구조**로 구성되어 있으며, 동적 콘텐츠(채팅, 대시보드, 알림 등)를 포함
- **네트워크 상태에 따라 데이터 가용성 저하 우려**
- **모바일 사용자 비중 높음**

### 적용 가능한 전략

| 전략                           | 설명 |
|--------------------------------|------|
| App Shell Architecture        | 공통 레이아웃(사이드바, 헤더 등)은 정적 캐시로 분리, 동적 콘텐츠만 fetch |
| Stale-while-revalidate 전략   | 알림 목록, 대시보드 등의 API 응답은 오래된 데이터라도 우선 표시 후 갱신 |
| 오프라인 fallback 페이지       | `/offline.html` 또는 상태에 따라 로딩 컴포넌트 fallback 구성 |
| Push Notification + Badge API | 알림 기능을 PWA에 통합하여 사용자 리인게이지 강화 |
| IndexedDB + Background Sync   | 오프라인 상태에서도 메시지 임시 저장 후 복구 처리 |
| Platform별 조건부 전략 분기    | iOS Safari의 제약 고려해 안내 배너 or fallback UX 제공 |
| TWA 연동 (Android 대상)        | 웹앱을 Android 네이티브 앱처럼 배포 (Play Store 등록) |
