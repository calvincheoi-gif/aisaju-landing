/* AIsajuLab 최소 서비스워커
   목적: 「홈 화면에 추가」 설치 프롬프트 조건을 충족시키는 것 하나뿐이다.
   캐시를 쓰지 않는다 — 캐시를 두면 배포한 새 화면이 옛 화면으로 덮여
   "안 고쳐졌다"는 오인이 생긴다. 필요해지면 그때 캐시 전략을 따로 설계할 것. */

const OFFLINE_HTML =
  '<!doctype html><html lang="ko" translate="no"><head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<title>AI사주랩</title><style>' +
  'body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;' +
  'background:#F5F9FF;color:#12224A;font-family:-apple-system,"Apple SD Gothic Neo",sans-serif;' +
  'text-align:center;padding:24px}' +
  'b{display:block;font-size:17px;margin-bottom:8px}p{font-size:13px;color:#64748B;margin:0}' +
  '</style></head><body><div><b>연결이 끊겼습니다</b>' +
  '<p>네트워크를 확인한 뒤 다시 열어주세요.</p></div></body></html>';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

/* 네트워크를 그대로 통과시키고, 화면 이동이 오프라인으로 실패할 때만 안내를 보여준다 */
self.addEventListener('fetch', (e) => {
  if (e.request.mode !== 'navigate') return;
  e.respondWith(
    fetch(e.request).catch(() =>
      new Response(OFFLINE_HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
    )
  );
});
