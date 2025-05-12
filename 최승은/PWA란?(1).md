# 1. PWA 개요와 철학

## PWA란 무엇인가?

PWA(PWA, Progressive Web App)는 웹 기술을 활용하여 네이티브 앱과 유사한 사용자 경험을 제공하는 웹 애플리케이션이다. 브라우저에서 동작하지만, 설치 및 오프라인 사용이 가능하고, 푸시 알림 등의 기능도 지원한다.

### PWA vs 네이티브 앱

| 항목              | PWA                              | 네이티브 앱                           |
|-------------------|----------------------------------|----------------------------------------|
| 설치 방식         | 브라우저에서 설치 (앱스토어 무관) | 앱스토어를 통해 설치                  |
| 플랫폼 의존성     | 없음 (웹 표준 기반)              | 있음 (Android/iOS 별도 개발 필요)     |
| 업데이트          | 자동 반영                         | 앱스토어 심사 및 수동 업데이트 필요   |
| 접근성            | URL로 접근 가능                  | 설치 필요                              |
| 저장 용량         | 적음                             | 상대적으로 큼                         |
| 배포/유통         | 자유로움                          | 앱스토어 정책의 제약 존재              |

## PWA의 핵심 3요소: Reliable, Fast, Engaging

### Reliable - 신뢰성

- **네트워크가 불안정하거나 오프라인에서도 동작 가능**
- Service Worker를 통해 캐시를 미리 저장하고, 네트워크 상태에 따라 적절히 대응
- 사용자가 앱을 사용할 수 없게 되는 상황을 최소화

### Fast - 빠른 응답성

- **앱이 빠르게 로드되고, 사용자와 즉각적으로 상호작용**
- 캐싱, lazy loading, prefetching 등으로 초기 로딩 속도 개선
- TTI (Time To Interactive) 최적화가 핵심

### Engaging - 몰입도

- **앱처럼 느껴지는 경험 제공**
- 홈 화면에 설치 가능 (Add to Home Screen)
- 전체화면, 푸시 알림, 백그라운드 동작 등 네이티브 수준의 기능
- 사용자와 지속적인 관계 형성 가능 (리인게이지먼트 전략 가능)

## 웹앱과의 차이점

| 항목              | 전통적인 웹앱                    | PWA                                 |
|-------------------|----------------------------------|--------------------------------------|
| 오프라인 사용      | 불가능                            | 가능 (Service Worker 기반)           |
| 앱 설치           | 불가능                            | 가능 (홈화면에 설치)                |
| 푸시 알림         | 불가능 또는 제한적                | 가능 (푸시 API + Notification API)   |
| UI/UX             | 웹 페이지 느낌                    | 앱처럼 작동 (전체화면 등 지원)       |
| 성능 최적화       | 제한적                            | 적극적 (캐싱, 프리페치, 컴프레션 등) |

## 대표적인 PWA 사례

### 📱 Twitter Lite
- 네트워크 환경이 느린 지역을 고려해 개발
- 3%의 데이터만 사용하며, 앱보다 30% 더 빠르게 로드
- Android 기기에서 홈화면에 설치 가능, 푸시 알림 및 오프라인 사용 지원

### ☕ Starbucks
- 고객이 저사양 기기와 느린 네트워크에서도 원활하게 주문 가능하도록 개발
- PWA가 기존 iOS 앱 대비 99.84% 적은 저장 공간 사용
- 오프라인에서도 메뉴 탐색 및 주문 가능


물론입니다. 아래는 2. Web App Manifest에 대한 심화 정리입니다. 기술 면접 및 발표에서도 활용 가능하도록 실무 중심으로 작성했습니다.

# 2. Web App Manifest

## Web App Manifest란?

Web App Manifest는 PWA의 설치 가능성과 앱 같은 경험을 가능하게 해주는 JSON 파일로, 브라우저가 앱의 이름, 아이콘, 시작 URL, 테마 색상 등을 인식할 수 있게 해준다. 사용자가 브라우저에서 홈 화면에 앱을 추가할 수 있도록 도와주는 핵심 파일이다.

```json
{
  "name": "My PWA App",
  "short_name": "PWAApp",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0d47a1",
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

## 필수 및 선택 속성 정리

속성명 |	필수 |	설명
--|--|--
name |	○ |	설치 후 표시될 앱의 전체 이름
short_name |	○	| 홈 화면 아이콘 아래에 표시될 짧은 이름
start_url |	○ |	앱 실행 시 로딩할 URL (상대/절대 가능)
display |	○ |	앱 표시 모드 (fullscreen, standalone, minimal-ui, browser)
background_color |	△ |	앱 로딩 스크린 배경색
theme_color |	△ |	브라우저 툴바 및 OS UI의 색상 설정
icons |	○ |	다양한 해상도의 앱 아이콘 리스트

#### 참고: display: standalone은 주소창 없이 앱처럼 보여지게 해주는 모드이며, PWA 특유의 UX를 구현할 때 핵심 옵션이다.

## 고급 속성 설명

### icons
	•	다양한 해상도 제공으로 디바이스/브라우저 호환성 보장
	•	보통 192x192, 512x512를 필수로 포함

### display

값 |	설명
--|--
fullscreen |	브라우저 UI 없이 전체화면 표시
standalone |	앱처럼 보이나, 상태바는 존재
minimal-ui |	일부 UI만 보여줌 (iOS 미지원)
browser |	일반 브라우저와 동일하게 작동

### shortcuts
	•	특정 기능으로 바로 진입할 수 있는 바로가기 메뉴

```
"shortcuts": [
  {
    "name": "최근 항목",
    "short_name": "최근",
    "url": "/recent",
    "icons": [{ "src": "/icons/recent.png", "sizes": "192x192" }]
  }
]
```

### categories
	•	앱 분류를 브라우저가 인식할 수 있도록 함
```
"categories": ["productivity", "utilities"]
```

### screenshots
	•	설치 안내 화면에서 앱의 UI 미리보기를 보여줄 수 있음

```
"screenshots": [
  {
    "src": "/screenshots/home.png",
    "sizes": "540x720",
    "type": "image/png"
  }
]
```

## 앱 설치 프로세스 (beforeinstallprompt)

브라우저가 PWA 설치 조건을 충족하면 beforeinstallprompt 이벤트를 발생시킴. 이를 통해 설치 버튼을 커스터마이징할 수 있음.

```
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); // 자동 프롬프트 방지
  deferredPrompt = e;

  // 사용자에게 설치 버튼 제공
  showInstallButton();
});

installButton.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`사용자 응답: ${outcome}`);
    deferredPrompt = null;
  }
});
```

### 브라우저별 지원 현황

브라우저 |	manifest 지원 |	홈화면 설치 |	Service Worker |	푸시 알림
Chrome (Android) |	O	| O |	O	| O
Firefox (Android) |	O |	O |	O |	O
Safari (iOS) |	제한적 지원 |	O |	X (부분) |	X
Edge (Chromium) |	O |	O |	O |	O
Safari (macOS) |	O |	X |	X |	X

#### iOS는 manifest.json을 인식하지만, 일부 속성을 무시하거나 Service Worker를 지원하지 않으므로, 완전한 PWA 경험을 제공하기 어렵다.
