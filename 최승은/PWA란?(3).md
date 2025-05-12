# 5. 백그라운드 동작 및 고급 기능

## Background Sync API

### 목적

네트워크가 끊겼을 때 사용자 동작(예: 글쓰기, 댓글 작성 등)을 임시 저장하고, **네트워크가 복구되었을 때 자동으로 서버와 동기화**하는 기능을 제공하는 API.

### 사용 흐름

1. 사용자가 오프라인 상태에서 요청 시도
2. 요청을 IndexedDB 등에 임시 저장
3. `sync` 이벤트 등록 후 등록명으로 대기
4. 온라인 복귀 시 `sync` 이벤트 발생 → 등록된 작업 수행

```js
// 등록
navigator.serviceWorker.ready.then((reg) => {
  return reg.sync.register('post-comment');
});

// 수신
self.addEventListener('sync', (event) => {
  if (event.tag === 'post-comment') {
    event.waitUntil(sendCommentToServer());
  }
});
```
- 단점: iOS Safari는 지원하지 않음. Chrome, Edge, Firefox (일부)에서만 가능.

## Push Notification

### 구성 요소
- 권한 요청 (Notification.requestPermission)
- 알림 표시 (self.registration.showNotification)
- 서비스 워커 수신 (push 이벤트)

### 권한 요청

```
Notification.requestPermission().then((permission) => {
  if (permission === 'granted') {
    console.log('알림 허용됨');
  }
});
```

### 푸시 알림 수신 및 표시

```
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge.png',
  };
  event.waitUntil(
    self.registration.showNotification(data.title || '알림', options)
  );
});
```

## Web Push 구현

Web Push는 서버 → 브라우저로 직접 메시지를 보내기 위한 표준 프로토콜로, VAPID와 Push Subscription 개념을 기반으로 한다.

### 1. VAPID (Voluntary Application Server Identification)
   - 서버를 인증하기 위한 공개/비공개 키 쌍
   - 주로 web-push 라이브러리(Node.js)로 관리

```
npx web-push generate-vapid-keys
```

### 2. 브라우저 구독 정보 등록

```
navigator.serviceWorker.ready.then(async (reg) => {
  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: '<Base64PublicKey>'
  });

  // 이 subscription을 서버에 저장
});
```

### 3. 서버에서 Web Push 전송

```
const webpush = require('web-push');

webpush.setVapidDetails(
  'mailto:admin@example.com',
  PUBLIC_KEY,
  PRIVATE_KEY
);

webpush.sendNotification(subscription, JSON.stringify({
  title: '새 메시지 도착!',
  body: '누군가가 당신에게 메시지를 보냈습니다.'
}));
```

## Firebase Cloud Messaging (FCM) 연동

Google의 Firebase를 사용하면 Web Push를 보다 쉽게 구현할 수 있다. Service Worker에 Firebase 메시징 SDK를 연동하는 방식으로 구성.

### 예시 (firebase-messaging-sw.js)

```
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: '...',
  projectId: '...',
  messagingSenderId: '...',
  appId: '...'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, { body });
});
```

## Periodic Background Sync

Background Sync의 고급 버전으로, 정기적으로 네트워크 요청을 보내 최신 상태를 유지하는 기능이다.

> 예: 6시간마다 서버에서 알림/콘텐츠 목록을 동기화

### 설정 (등록은 브라우저 설정 필요, Chrome 기반)

```
navigator.serviceWorker.ready.then((reg) => {
  reg.periodicSync.register('sync-alerts', {
    minInterval: 6 * 60 * 60 * 1000 // 6시간
  });
});
```

### 수신 처리
```
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'sync-alerts') {
    event.waitUntil(syncLatestAlerts());
  }
});

navigator.permissions.query({ name: 'periodic-background-sync' })로 지원 여부 확인 필요
```

# 6. 보안과 인증

## HTTPS 필수 요구사항과 그 이유

PWA에서 Service Worker 및 Push Notification을 사용하려면 **HTTPS 환경이 필수**이다.

### 왜 HTTPS가 필수인가?

| 이유 | 설명 |
|------|------|
| 중간자 공격(MITM) 방지 | 네트워크 상에서 요청이 탈취되거나 조작되는 것 방지 |
| Service Worker 보호 | 강력한 네트워크 인터셉트 기능이 있기 때문에, 신뢰할 수 있는 환경에서만 허용됨 |
| 푸시 알림 및 Background Sync 동작 | 해당 기능들은 보안 채널(HTTPS)에서만 허용됨 |
| 사용자 정보 보호 | 인증, 결제, 개인정보 처리 시 기본 요건 |

> 로컬 개발 시 `localhost`는 예외적으로 HTTPS 없이도 허용됨.

## Service Worker 보안 이슈

### 1. Scope 오용

- Service Worker는 등록 시 지정한 `scope` 내의 모든 요청을 가로챌 수 있음.
- 잘못된 scope 설정 시, **원하지 않는 URL 경로까지 제어**하게 되어 보안상 취약점이 생길 수 있음.

```js
// 비추천: overly broad scope
navigator.serviceWorker.register('/sw.js', { scope: '/' });

// 추천: 도메인 또는 기능별로 세분화된 scope
navigator.serviceWorker.register('/chat/sw.js', { scope: '/chat/' });
```

### 2. CSRF (Cross-Site Request Forgery)
-	캐시된 HTML 내의 <form> 요청이 사용자의 의도와 무관하게 서버로 전송될 수 있음
-	토큰 기반 인증을 사용할 경우 CSRF 대비가 반드시 필요

#### 예방 방법
-	API 요청 시 반드시 same-origin 및 credentials: 'include' 설정
-	서버는 CORS 정책 + Origin, Referer 검사
-	CSRF 토큰을 매 요청마다 함께 전송하거나, SameSite 쿠키 설정 활용

## 인증 토큰 저장 위치

PWA에서는 로그인 후 발급받은 인증 정보를 브라우저에 저장해야 한다. 다음 3가지 옵션은 각각 장단점을 지닌다.

저장소 |	장점 |	단점 |	사용 시 주의사항
--|--|--|--
localStorage |	구현 간편, 직관적 |	XSS 공격에 매우 취약 |	사용자 입력 기반 페이지 조심
cookie (HttpOnly) |	XSS 보호, 서버 전송 자동 |	CSRF에 취약 |	SameSite=Strict 또는 CSRF 토큰 필요
IndexedDB |	구조적 데이터 저장에 적합 |	복잡한 구현, 접근성 문제 |	서비스워커와 연계해 사용 가능

#### 보안 중심 설계에서는 HttpOnly + Secure 쿠키 + SameSite=Strict 조합이 가장 안전한 방식.
