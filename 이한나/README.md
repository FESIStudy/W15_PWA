## 1. PWA(Progressive Web App)란?

- 웹 기술을 가지고 모바일 네이티브 앱과 비슷하게 만들 수 있는 기술
- 모바일 웹 사이트와 네이티브 앱의 중간 형태
- 앱스토어나 플레이스토어에서 다운로드하지 않고 모바일 홈 화면에 추가할 수 있는 웹 사이트

### PWA 장점

- 빠른 성능을 제공하며, 오프라인에서도 작동이 가능
- 검색 엔진 최적화에 유리
- 모바일 앱과 웹의 장점을 모두 활용 가능

### PWA 단점

- 모든 기능이 네이티브 앱과 같지 않음
- 사용자 경험이 모든 디바이스에서 동일하지 않음
- 브라우저에서 실행되어 네이티브 앱에 비해 지연속도가 크고 배터리 소모량이 많음

## 2. PWA 핵심원칙 3가지

### Reliable (신뢰성)

- 네트워크 상태와 관계 없이 항상 작동하는 앱
- 서비스 워커를 활용해 오프라인 상태에서도 콘텐츠를 보여주거나, 이전에 방문한 데이터를 캐시해서 빠르게 로딩

### Fast (속도)

- 초기 로딩이 빠르고, 사용자 인터랙션에 지연 없이 반응할 것

### Engaging(몰입감)

- 푸시 알림, 홈 화면에 추가, 전체화면 모드 같은 기능을 제공해 몰입감을 높임
- 마치 네이티브 앱처럼 동작해 사용자에게 더 친숙하고 적극적인 경험 제공

## 3. Web App Manifest

- 웹 앱이 설치 가능하도록 브라우저에 정보를 제공하는 JSON 파일

### 필수 속성

- `name` 또는 `short_name`
- `icons`
- `start_url`
- `display`

### 선택 속성

- `background_color`, `theme_color`
- `description`, `lang`, `orientation`, `scope` 등

### 주요 속성 설명

- `icons`: 앱 설치 시 홈 화면/런처에 표시될 아이콘들 (해상도별 이미지 제공)
- `display`: 앱이 실행될 때 UI 스타일 (e.g. `standalone`, `fullscreen`, `minimal-ui`, `browser`)
- `start_url`: 앱 실행 시 열릴 URL
- `background_color`: 앱 로딩 시 배경 색상 (스플래시 스크린 등에 사용)
- `theme_color`: 브라우저 UI 색상(탭, 툴바 등)

### 고급 설정

- `shortcuts`: 앱 아이콘 길게 누를 때 나오는 빠른 액션들 (Android 홈 화면에서 지원)
- `categories`: 앱 분류 (예: `["education", "productivity"]`)
- `screenshots`: 앱 스토어 스타일 설치 화면에 표시할 스크린샷

### 앱 설치 프로세스

- 브라우저는 조건이 충족되면 `beforeinstallprompt` 이벤트를 발생시켜 설치 프롬프트를 표시 할 수 있게 해줌

```jsx
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  // 사용자 동작 후 e.prompt() 호출로 설치 유도 가능
});
```

### 브라우저별 지원 상태

- **Chrome(Android, 데스크탑)**: 대부분의 manifest 속성과 설치 지원
- **Safari(iOS)**: manifest.json 지원 X, `beforeinstallprompt` 이벤트 없음
    - 대신 iOS에서는 사용자가 수동으로 "홈 화면에 추가"를 눌러야 함
- **iOS의 이슈**:
    - 푸시 알림 늦게 지원 시작
    - 제한적인 서비스워커 및 백그라운드 기능
    - Web App Manifest의 일부 속성 무시됨

## **4. Service Worker**

- PWA에서 오프라인 사용, 캐싱, 빠른 로딩, 백그라운드 동작 등을 가능하게 해주는 역할

### **Service Worker 생명주기: install → activate → fetch**

- **install**: 초기 캐싱 (앱 쉘, 정적 리소스 등)
- **activate**: 이전 캐시 정리, 클린업
- **fetch**: 네트워크 요청 가로채기 → 캐시나 네트워크에서 응답 제공