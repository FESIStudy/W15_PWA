# 7. 성능 최적화

## Lighthouse를 통한 PWA 진단

[Lighthouse](https://developers.google.com/web/tools/lighthouse)는 Google에서 제공하는 웹 성능 측정 도구로, **PWA 품질을 포함한 성능, 접근성, SEO, Best Practice**까지 종합적으로 진단해준다.

### 실행 방법

- Chrome DevTools → Lighthouse 탭 → "Generate Report"
- 또는 CLI: `npx lighthouse https://yourdomain.com --view`

### 주요 측정 항목

| 항목            | 설명 |
|-----------------|------|
| **Performance** | TTI, LCP, CLS 등 로딩 성능 및 안정성 |
| **PWA**         | installable 여부, HTTPS, manifest, offline 대응 등 |
| **Best Practices** | HTTPS, JS 오류, 안전한 요청 여부 등 |
| **SEO**         | 검색 엔진에 최적화된 구조인지 여부 |
| **Accessibility** | 색 대비, 레이블 등 사용자 접근성 보장 여부 |

> ✅ PWA 항목이 100점이 되기 위해서는 `manifest.json`, `Service Worker`, `offline fallback`, `install prompt`가 정확히 구현되어야 함.

## Lazy Load, Prefetch, Preload 전략

### Lazy Loading (지연 로딩)

> 사용자가 실제로 **요소에 접근하기 전까지 로딩을 미루는 기법**

- 이미지, 컴포넌트, 라우터 등 적용 가능
- 예: `<img loading="lazy" />`, `React.lazy()`, `Vue defineAsyncComponent()`

### Prefetch

> 사용자가 **다음에 방문할 가능성이 높은 리소스**를 백그라운드에서 미리 받아놓기

```html
<link rel="prefetch" href="/dashboard.js" as="script">
```

-	저우선 순위, 유휴 시간 활용
-	SPA의 route-based code splitting에 유용

### Preload

현재 페이지 렌더링에 중요한 리소스를 가장 먼저 다운로드하도록 힌트 제공
```
<link rel="preload" href="/font.woff2" as="font" type="font/woff2" crossorigin="anonymous">
```
-	FCP, LCP 개선에 효과적
-	CSS, 폰트, 핵심 JS 등에 우선 적용

## 이미지 최적화

이미지는 PWA 전체 용량 중 가장 많은 비중을 차지하며, 성능에 미치는 영향이 크다.

### 1. WebP, AVIF 포맷 사용

포맷 |	장점 |	브라우저 지원
--|--|--
WebP |	JPG 대비 25~34% 용량 절감 |	거의 모든 브라우저 지원
AVIF |	WebP보다 30~50% 더 압축 |	Chrome, Firefox 등 최신 브라우저 지원

```
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="설명 텍스트">
</picture>
```

### 2. Responsive Images
```
<img 
  src="small.jpg"
  srcset="small.jpg 480w, medium.jpg 768w, large.jpg 1200w"
  sizes="(max-width: 768px) 100vw, 50vw"
  alt="설명 텍스트">
```
- 화면 해상도에 따라 알맞은 이미지 불러옴
-	데이터 낭비와 로딩 시간 최소화

## 앱 초기 구동 속도 개선 전략

### 1. App Shell + Lazy Hydration
-	정적 UI 구조를 먼저 로드
-	이후 동적 콘텐츠는 lazy load 또는 idle 시점에 주입

### 2. Code Splitting (코드 분할)
-	페이지/기능 단위로 번들 분리
-	Webpack, Vite 등에서 자동화 가능

```
const AboutPage = React.lazy(() => import('./AboutPage'));
```

### 3. Critical CSS 인라인
-	FCP, LCP 개선
-	Styled-components, Emotion 등에서 SSR 시 자동 추출 가능

### 4. HTTP/2, Brotli 압축
-	리소스 전송 효율 증가
-	Nginx, Netlify 등에서 간단히 설정 가능

### 5. Service Worker 기반 캐싱 전략 적용
-	초기 리소스를 미리 캐싱하고 빠르게 로드


# 8. iOS 및 다양한 플랫폼 대응

## iOS의 PWA 제약 사항

iOS(Safari)는 PWA 기능을 일부만 지원하며, 다른 플랫폼과 비교했을 때 많은 제약이 존재한다.

### ❗ 주요 제약 목록

| 기능                         | 지원 여부 | 비고 |
|------------------------------|-----------|------|
| Service Worker               | ✅        | 2017년 iOS 11.3부터 지원 |
| Web App Manifest             | ⚠️        | 부분 지원 (`display`, `theme_color` 무시) |
| Push Notification            | ❌        | iOS는 Web Push 미지원 (2025년 현재 기준) |
| Background Sync              | ❌        | `Background Sync API`, `Periodic Sync API` 미지원 |
| 홈 화면 설치 프로세스        | ⚠️        | 수동 설치만 가능 (팝업 제공 불가) |
| Storage 제한                 | ⚠️        | 캐시 및 IndexedDB 약 50MB 내외 제한 |
| Standalone UI                | ⚠️        | 완전한 `standalone` 모드 아님 (주소창 비노출은 되지만 iOS UI 일부 노출됨) |

> 최신 Safari에서 `add to home screen`으로 설치한 PWA는 앱처럼 동작하나, 여전히 Android보다 기능 제한이 있음.

## 홈 화면 추가 UX 제약 해결법

iOS는 `beforeinstallprompt` 이벤트를 지원하지 않으며, 자동 설치 안내 팝업도 불가능하다.

### 대안 UX 전략

1. **조건부 안내 배너 제공**
   - `navigator.standalone`과 `userAgent`를 통해 iOS Safari 여부 감지
   - 화면 상단에 "Safari 메뉴 → 홈 화면에 추가" 안내 배너 노출

```js
const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
const isInStandalone = ('standalone' in window.navigator) && window.navigator.standalone;

if (isIos && !isInStandalone) {
  // 홈화면 추가 안내 띄우기
  showAddToHomeBanner();
}
```

### Android와 비교해 고려해야 할 차이점

항목 |	Android (Chrome) |	iOS (Safari)
--|--|--
설치 안내 (beforeinstallprompt) | 지원 |	미지원
Push Notification |	지원 |	미지원
Background Sync |	지원 | 미지원
Web App Manifest |	전체 지원 |	부분 지원
Splash Screen |	지정 가능 |	iOS 스타일에 따라 제한적 사용
오프라인 대응 |	서비스 워커 완전 지원 |	캐시 제한적 지원 (용량 주의)

> Android는 Chrome의 표준 PWA 구현이 완성되어 있어 앱 설치, 백그라운드 동작, 푸시, manifest 기반 splash까지 완전 지원됨.

## 크로스 플랫폼 대응 전략: TWA (Trusted Web Activities)

**TWA (Trusted Web Activities)**는 웹 앱을 Android 네이티브 앱처럼 패키징하여 Play Store에 배포할 수 있는 기술이다.

### 장점
-	하나의 PWA 코드베이스로 Android 앱 배포 가능
-	WebView가 아닌 Chrome 엔진으로 구동
-	주소창 제거, 푸시 알림, splash screen 완전 지원
-	Play Store에 앱을 등록해 사용자 접근성 향상

### 기본 요건

항목 |	설명
--|--
PWA 구현 |	Service Worker, HTTPS, offline 대응 필수
Digital Asset Links |	웹과 앱 간 도메인 소유 증명 필요 (.well-known/assetlinks.json)
Android 앱 패키징 |	Custom Launcher Activity + Intent + manifest 구성 필요
play-pwa | 템플릿 사용 가능	Bubblewrap, pwabuilder.com 등에서 자동화 도구 제공

```
// assetlinks.json 예시
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.example.pwa",
      "sha256_cert_fingerprints": ["..."]
    }
  }
]
```
