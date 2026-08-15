/* AIsajuLab — 2026-08-15: 8월 페스티벌 이벤트 종료.
 * 하단 바·공유 버튼·페스티벌 팝업을 모두 제거했습니다.
 * (홈은 v6로 개편되어 서비스 안내가 본문에 포함됩니다.
 *  9월 이벤트는 오행 앱 결과 화면의 크로스셀로 안내합니다.)
 * 캐시에 옛 버전이 남아 있어도 무력화되도록, 안전차원에서 기존 요소를 정리합니다. */
(function () {
  try {
    ['sjpbar', 'sjpfab'].forEach(function (id) {
      var e = document.getElementById(id); if (e && e.parentNode) e.parentNode.removeChild(e);
    });
    document.querySelectorAll('.ajp-dim').forEach(function (e) { if (e.parentNode) e.parentNode.removeChild(e); });
    document.documentElement.style.overflow = '';
  } catch (e) {}
})();
