/* AIsajuLab PWA 준비 스크립트
   · 서비스워커를 등록한다 (설치 프롬프트의 전제 조건)
   · beforeinstallprompt 는 React 가 붙기 전에 먼저 터지는 경우가 많다.
     놓치면 안드로이드에서 「추가」 버튼이 영영 동작하지 않으므로
     여기서 먼저 잡아 window.__pwaPrompt 에 보관해 둔다.
   · 화면을 그리지 않는다 — 표시는 HomeV6 쪽에서 담당한다. */
(function () {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () { /* 등록 실패는 무시 */ });
    });
  }

  window.__pwaPrompt = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    window.__pwaPrompt = e;
    /* 이미 화면이 그려진 뒤라면 그쪽에 알려준다 */
    window.dispatchEvent(new Event('pwa-ready'));
  });

  window.addEventListener('appinstalled', function () {
    window.__pwaPrompt = null;
    try { localStorage.setItem('pwa_hide', '1'); } catch (err) { /* noop */ }
    window.dispatchEvent(new Event('pwa-installed'));
  });
})();
