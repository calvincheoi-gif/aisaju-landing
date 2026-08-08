/**
 * AIsajuLab 이벤트 배너 / 팝업 스크립트
 *
 * 팝업은 반드시 "한 개"만 뜹니다. 이벤트가 여러 개면 아래 slides 배열에 추가해
 * 한 창에서 좌우로 넘겨 보는 슬라이드 방식으로 합칩니다.
 *
 * 구성
 *  - 하단 고정 바(#sjpbar)  : 8월 페스티벌 안내 (2026-09-01 자동 종료)
 *  - 좌측 공유 버튼(#sjpfab) : 카톡 공유 / 링크 복사
 *  - 중앙 슬라이드 팝업      : 오행 성격 진단 + (기간 내) 8월 페스티벌
 */
(function () {
  var S = 'https://popup.aisajulab.com/';
  var FEST_END = new Date('2026-09-01T00:00:00+09:00');
  var festOn = new Date() < FEST_END;

  /* ══════════ 슬라이드 팝업 부품 ══════════ */
  var POPUP_CSS =
    '.ajp-dim{position:fixed;inset:0;background:rgba(8,20,40,.62);backdrop-filter:blur(3px);z-index:99999;' +
    'display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;transition:opacity .28s}' +
    '.ajp-dim.on{opacity:1}' +
    '.ajp{position:relative;width:100%;max-width:520px;animation:ajpIn .34s cubic-bezier(.24,1,.32,1) both}' +
    '@keyframes ajpIn{from{opacity:0;transform:translateY(18px) scale(.97)}to{opacity:1;transform:none}}' +
    '@media(min-width:900px){.ajp{max-width:700px}.ajp-x{top:-19px;right:-19px;width:42px;height:42px}}' +
    '.ajp-view{position:relative;border-radius:18px;overflow:hidden;background:#fff;box-shadow:0 18px 50px rgba(6,20,45,.42)}' +
    '.ajp-track{display:flex;width:100%;transition:transform .38s cubic-bezier(.3,1,.4,1)}' +
    '.ajp-slide{flex:0 0 100%;width:100%;min-width:0;max-width:100%;display:block;cursor:pointer;border:none;padding:0;background:none;font:inherit;overflow:hidden}' +
    '.ajp-slide img{width:100%;height:auto;max-height:66vh;object-fit:contain;display:block}' +
    '.ajp-x{position:absolute;top:-15px;right:-10px;width:38px;height:38px;border-radius:50%;border:none;' +
    'background:#fff;color:#0C1A2E;font-size:19px;font-weight:900;line-height:1;cursor:pointer;' +
    'box-shadow:0 5px 16px rgba(6,20,45,.35);z-index:3;display:flex;align-items:center;justify-content:center}' +
    '.ajp-x:active{transform:scale(.92)}' +
    '.ajp-nav{position:absolute;top:50%;transform:translateY(-50%);width:34px;height:52px;border:none;cursor:pointer;' +
    'background:rgba(255,255,255,.82);color:#0B4FD1;font-size:19px;font-weight:900;z-index:2;display:flex;' +
    'align-items:center;justify-content:center;transition:.15s}' +
    '.ajp-nav.p{left:0;border-radius:0 12px 12px 0}' +
    '.ajp-nav.n{right:0;border-radius:12px 0 0 12px}' +
    '.ajp-nav:active{background:#fff}' +
    '.ajp-dots{position:absolute;left:0;right:0;bottom:9px;display:flex;justify-content:center;gap:6px;z-index:2}' +
    '.ajp-dots i{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.55);' +
    'box-shadow:0 1px 3px rgba(0,0,0,.3);transition:.2s;cursor:pointer}' +
    '.ajp-dots i.on{width:20px;border-radius:100px;background:#fff}' +
    '.ajp-cta{display:block;width:100%;margin-top:9px;border:none;border-radius:14px;padding:15px;cursor:pointer;' +
    'font-family:inherit;font-size:16px;font-weight:900;letter-spacing:-.03em;color:#fff;' +
    'background:linear-gradient(135deg,#25B9FF 0%,#058DFB 48%,#0B4FD1 100%);' +
    'box-shadow:0 8px 22px rgba(11,107,238,.42)}' +
    '.ajp-cta:active{transform:scale(.985)}' +
    '.ajp-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:9px;padding:0 2px}' +
    '.ajp-foot label{display:flex;align-items:center;gap:7px;cursor:pointer;font-size:13.4px;font-weight:700;color:#E4EEFB}' +
    '.ajp-foot input{width:17px;height:17px;accent-color:#25B9FF}' +
    '.ajp-foot button{border:none;background:none;font-family:inherit;font-size:13.4px;font-weight:800;' +
    'color:#E4EEFB;cursor:pointer;padding:6px 2px;opacity:.85}' +
    '@media(max-width:400px){.ajp-foot label,.ajp-foot button{font-size:12.6px}.ajp-cta{font-size:15px;padding:14px}}';

  var CFG = null, el = null, idx = 0, timer = null;

  function store(k, v) {
    try {
      if (v === undefined) return localStorage.getItem(k);
      localStorage.setItem(k, v);
    } catch (e) { return null }
  }
  function hidden() {
    var t = store('ajp_' + CFG.key);
    return t && Date.now() < +t;
  }
  function inPeriod() {
    if (!CFG.start && !CFG.end) return true;
    var n = new Date(),
      s = CFG.start ? new Date(CFG.start + 'T00:00:00') : null,
      e = CFG.end ? new Date(CFG.end + 'T23:59:59') : null;
    return (!s || n >= s) && (!e || n <= e);
  }
  function go(i, anim) {
    var n = CFG.slides.length;
    idx = (i + n) % n;
    var tr = el.querySelector('.ajp-track');
    tr.style.transition = anim === false ? 'none' : '';
    tr.style.transform = 'translateX(' + (-idx * 100) + '%)';
    el.querySelectorAll('.ajp-dots i').forEach(function (d, j) { d.classList.toggle('on', j === idx) });
    var s = CFG.slides[idx], cta = el.querySelector('.ajp-cta');
    if (cta) cta.textContent = s.cta || CFG.cta || '자세히 보기';
  }
  function auto() {
    clearInterval(timer);
    if (CFG.slides.length > 1 && CFG.autoplay !== false)
      timer = setInterval(function () { go(idx + 1) }, CFG.interval || 5000);
  }
  function open(href) {
    if (!href) return;
    try { window.open(href, CFG.target || '_blank', 'noopener') } catch (e) { location.href = href }
    if (CFG.closeOnClick !== false) close();
  }
  function close() {
    if (!el) return;
    var chk = el.querySelector('.ajp-hide');
    if (chk && chk.checked) store('ajp_' + CFG.key, String(Date.now() + (CFG.hideDays || 1) * 864e5));
    el.classList.remove('on');
    clearInterval(timer);
    setTimeout(function () { if (el && el.parentNode) el.parentNode.removeChild(el); el = null }, 300);
    document.documentElement.style.overflow = '';
    if (CFG.onClose) CFG.onClose();
  }
  function build() {
    var many = CFG.slides.length > 1;
    el = document.createElement('div');
    el.className = 'ajp-dim';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.innerHTML =
      '<div class="ajp">' +
        '<button class="ajp-x" aria-label="닫기">×</button>' +
        '<div class="ajp-view">' +
          '<div class="ajp-track">' +
            CFG.slides.map(function (s, i) {
              return '<button class="ajp-slide" data-i="' + i + '" aria-label="' + (s.alt || '이벤트 배너') + '">' +
                '<img src="' + s.img + '" alt="' + (s.alt || '이벤트 배너') + '" loading="eager"></button>';
            }).join('') +
          '</div>' +
          (many ? '<button class="ajp-nav p" aria-label="이전">‹</button><button class="ajp-nav n" aria-label="다음">›</button>' : '') +
          (many ? '<div class="ajp-dots">' + CFG.slides.map(function (_, i) { return '<i data-i="' + i + '"></i>' }).join('') + '</div>' : '') +
        '</div>' +
        (CFG.showCta === false ? '' : '<button class="ajp-cta"></button>') +
        '<div class="ajp-foot">' +
          '<label><input type="checkbox" class="ajp-hide"><span>' + (CFG.hideText || '오늘 하루 보지 않기') + '</span></label>' +
          '<button class="ajp-close2">닫기 ✕</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(el);
    document.documentElement.style.overflow = 'hidden';

    el.querySelector('.ajp-x').onclick = close;
    el.querySelector('.ajp-close2').onclick = close;
    el.onclick = function (e) { if (e.target === el) close() };
    el.querySelectorAll('.ajp-slide').forEach(function (b) {
      b.onclick = function () { open(CFG.slides[+b.dataset.i].href) };
    });
    var cta = el.querySelector('.ajp-cta');
    if (cta) cta.onclick = function () { open(CFG.slides[idx].href) };
    el.querySelectorAll('.ajp-dots i').forEach(function (d) {
      d.onclick = function () { go(+d.dataset.i); auto() };
    });
    var pv = el.querySelector('.ajp-nav.p'), nx = el.querySelector('.ajp-nav.n');
    if (pv) pv.onclick = function () { go(idx - 1); auto() };
    if (nx) nx.onclick = function () { go(idx + 1); auto() };

    /* 스와이프 */
    var x0 = null, vw = el.querySelector('.ajp-view');
    vw.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX }, { passive: true });
    vw.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) { go(idx + (dx < 0 ? 1 : -1)); auto() }
      x0 = null;
    }, { passive: true });

    document.addEventListener('keydown', function esc(e) {
      if (!el) { document.removeEventListener('keydown', esc); return }
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') { go(idx + 1); auto() }
      if (e.key === 'ArrowLeft') { go(idx - 1); auto() }
    });

    go(0, false);
    auto();
    requestAnimationFrame(function () { el.classList.add('on') });
  }
  function show(force) {
    if (el) return;
    if (!CFG || !CFG.slides || !CFG.slides.length) return;
    if (!force) { if (hidden() || !inPeriod()) return }
    build();
  }
  function initPopup(o) {
    CFG = Object.assign({ key: 'aisaju_popup', delay: 700, hideDays: 1, slides: [] }, o || {});
    setTimeout(show, CFG.delay);
  }
  window.AIsajuPopup = {
    init: initPopup,
    show: function () { show(true) },
    close: close,
    reset: function () { try { localStorage.removeItem('ajp_' + (CFG ? CFG.key : 'aisaju_popup')) } catch (e) {} }
  };
  /* ══════════ 슬라이드 팝업 부품 끝 ══════════ */

  /* ── 하단 바 / 공유 버튼 (8월 페스티벌 기간에만) ── */
  var BAR_CSS =
    '#sjpbar{position:fixed;left:0;right:0;bottom:0;z-index:99998;background:linear-gradient(90deg,#0f1830,#16213e);' +
    'color:#e8d5a3;font-size:14px;font-weight:700;text-align:center;padding:12px 44px 12px 14px;cursor:pointer;' +
    'font-family:sans-serif;line-height:1.4}' +
    '#sjpbar b{color:#c9a24b}' +
    '#sjpbar .x{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;color:#8892ab;font-size:18px;cursor:pointer}' +
    '#sjpfab{position:fixed;left:14px;top:88px;z-index:99998;width:46px;height:46px;border-radius:50%;background:#fff;' +
    'border:none;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(22,33,62,.28);cursor:pointer}';

  var st = document.createElement('style');
  st.textContent = POPUP_CSS + BAR_CSS;
  document.head.appendChild(st);

  var ICON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16213e" stroke-width="2" stroke-linecap="round">' +
    '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>' +
    '<line x1="8.6" y1="10.7" x2="15.4" y2="6.3"/><line x1="8.6" y1="13.3" x2="15.4" y2="17.7"/></svg>';

  function share() {
    var u = S + '?utm=share';
    if (navigator.share) {
      navigator.share({
        title: 'AI 운세 FESTIVAL',
        text: '30초 무료 미니풀이 + 하루 3번 행운 룰렛! 너도 해봐 🔮',
        url: u
      }).catch(function () {});
    } else {
      var t = document.createElement('textarea');
      t.value = u;
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      t.remove();
      var m = document.createElement('div');
      m.textContent = '링크가 복사됐어요! 카톡에 붙여넣어 공유하세요';
      m.style.cssText = 'position:fixed;top:144px;left:14px;background:#16213e;color:#e8d5a3;padding:10px 18px;' +
        'border-radius:20px;z-index:100000;font-size:13px;font-family:sans-serif';
      document.body.appendChild(m);
      setTimeout(function () { m.remove() }, 2500);
    }
  }
  function fab() {
    var f = document.createElement('button');
    f.id = 'sjpfab';
    f.innerHTML = ICON;
    f.title = '공유하기';
    f.addEventListener('click', share);
    document.body.appendChild(f);
  }
  function bar() {
    if (sessionStorage.getItem('sjpBarOff')) return;
    var b = document.createElement('div');
    b.id = 'sjpbar';
    b.innerHTML = '🎡 <b>8월 한정 이벤트</b> 무료 미니풀이 + 하루 3번 행운 룰렛! 참여하러 가기 →<button class="x">✕</button>';
    b.addEventListener('click', function (e) {
      if (e.target.className === 'x') {
        sessionStorage.setItem('sjpBarOff', '1');
        b.remove();
        return;
      }
      location.href = S + '?utm=main';
    });
    document.body.appendChild(b);
  }

  /* ── 팝업 슬라이드 구성 (한 창에 모두 담습니다) ── */
  var slides = [
    {
      img: 'https://aisajulab-ohaeng.netlify.app/popup.jpg',
      href: 'https://aisajulab-ohaeng.netlify.app/',
      alt: '그럼, 나의 (자연) 오행 성격은?',
      cta: '나의 (자연) 오행 성격 테스트 시작하기'
    }
  ];
  if (festOn) {
    slides.push({
      img: S + 'img/event-poster.jpg',
      href: S + '?utm=main#mini',
      alt: 'AI 운세 FESTIVAL — 8월 한정 이벤트',
      cta: '🎡 행운 룰렛 돌리러 가기'
    });
  }

  function boot() {
    if (festOn) { bar(); fab(); }
    AIsajuPopup.init({
      key: 'aisaju_2026_08_ohaeng',
      delay: 700,
      hideDays: 1,
      start: '2026-08-08',   // 노출 시작일
      end: '2026-08-31',     // 노출 종료일 — 이 날이 지나면 자동으로 안 뜸
      slides: slides
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
