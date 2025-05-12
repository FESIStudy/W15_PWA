# PWA
PWA(Progressive Web App)는 웹 앱의 장점을 유지하면서 네이티브 앱과 유사한 사용자 경험을 제공하기 위해 고안된 웹 기술입니다.

## ✅ 1. PWA의 개요와 철학

📌 개요
PWA는 기존 웹 앱에 오프라인 지원, 푸시 알림, 홈 화면 설치 등 네이티브 앱 기능을 부여하는 기술 및 접근 방식입니다.

🎯 철학 (Google의 PWA 3대 철학)
1. Reliable (신뢰성)
- 불안정한 네트워크 상태에서도 앱이 동작해야 함
- 오프라인 지원 (Service Worker 사용)
2. Fast (속도)
- 빠른 로딩과 부드러운 인터랙션
- 첫 로딩 이후 캐시를 통한 빠른 화면 전환
3. Engaging (몰입감)
- 설치, 푸시 알림, 전체화면 등 네이티브 앱 같은 경험
- 홈 화면 아이콘, 전체 화면 실행

## ✅ 2. 일반 웹앱과의 차이점
|항목	|일반 웹앱|	PWA|
|-|-|-|
|설치	|불가능|	가능 (홈 화면에 설치)|
|오프라인 지원|	없음|	가능 (Service Worker)|
|푸시 알림|	일부만 가능|	가능 (서비스 워커 활용)|
|앱처럼 동작|	제한적|	앱과 유사한 UX|
|성능 최적화|	수동 적용|	자동 캐싱으로 빠른 로딩|

## ✅ 3. webapp manifest 구조 및 속성
### 📁 Manifest란?
브라우저에 앱 메타정보(이름, 아이콘, 시작 URL 등)를 제공하는 JSON 파일입니다.
파일 이름은 일반적으로 manifest.json.

### ✍️ 구조 예시
```json
{
  "name": "My React PWA",
  "short_name": "ReactPWA",
  "start_url": ".",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#317EFB",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```
### 🧩 필수 속성
- name: 앱 이름
- short_name: 짧은 이름 (홈 화면 등에서 사용)
- start_url: 앱 시작 시 로딩될 URL
- display: 표시 방식 (standalone, fullscreen, minimal-ui, browser)
- icons: 앱 아이콘 목록

### 🧪 선택 속성
- theme_color: 상태바 색상
- background_color: 스플래시 배경
- orientation, description, categories, 등


## ✅ 4. Service Worker 기본기
### 📦 개념
서비스 워커는 브라우저와 서버 사이에 존재하는 프록시로, 요청 가로채기, 캐싱, 오프라인 동작 등을 가능하게 함.

### 🔄 생명 주기
1. 등록 (register): 웹 앱에서 서비스 워커 등록
1. 설치 (install): 캐시할 리소스 정의
1. 활성화 (activate): 이전 캐시 정리 등 초기화 작업
1. 이벤트 리스닝: fetch, push, sync 등

### ✍️ 기본 코드
```js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/styles.css',
        '/main.js',
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
```
