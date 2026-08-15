/* public/ohaeng/track.js
 * 오행 성격 진단(단일 HTML 앱)용 계측 스니펫.
 * 빌드 도구 없이 <script src="./track.js"></script> 한 줄로 동작한다.
 *
 * ── 붙이는 법 ────────────────────────────────────────────
 * 1) 아래 SUPABASE_URL / SUPABASE_ANON_KEY 두 줄을 실제 값으로 채운다.
 * 2) 오행 앱 index.html 의 </body> 바로 위에 다음 한 줄을 넣는다.
 *      <script src="./track.js"></script>
 * 3) 앱 코드 안에서 아래 지점에 한 줄씩 호출을 넣는다.
 *      진단 시작 버튼      → AJ.track('ohaeng_start')
 *      각 문항 응답 직후   → AJ.track('ohaeng_answer', {step: 현재문항번호})
 *      보정(STEP2) 시작    → AJ.track('ohaeng_calibration_start')
 *      결과 화면 표시      → AJ.track('ohaeng_complete', {props:{type:'봄 소나무', balance:64}})
 *      결과 저장/공유      → AJ.track('ohaeng_share', {props:{how:'image'}})
 *      상담 버튼           → AJ.track('consult_open', {props:{from:'ohaeng_result'}})
 * ────────────────────────────────────────────────────────*/
(function (w, d) {
  var SUPABASE_URL = 'https://urazdkvkanjnquqhnrvo.supabase.co';
  var SUPABASE_ANON_KEY = 'sb_publishable_fSG-HqZrC9GVTT5FOprPnA_sDiFoiD2';

  function rid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
  function sid() {
    var v = sessionStorage.getItem('aisaju_sid');
    if (!v) { v = rid(); sessionStorage.setItem('aisaju_sid', v); }
    return v;
  }
  function vid() {
    var v = localStorage.getItem('aisaju_vid');
    if (!v) { v = rid(); localStorage.setItem('aisaju_vid', v); }
    return v;
  }
  function device() {
    var x = w.innerWidth;
    return x < 768 ? 'mobile' : x < 1024 ? 'tablet' : 'desktop';
  }
  function utms() {
    var q = new URLSearchParams(w.location.search);
    var now = {
      utm: q.get('utm') || undefined,
      utm_source: q.get('utm_source') || undefined,
      utm_medium: q.get('utm_medium') || undefined,
      utm_campaign: q.get('utm_campaign') || undefined
    };
    var has = false, k;
    for (k in now) { if (now[k]) has = true; }
    if (has) { localStorage.setItem('aisaju_utm', JSON.stringify(now)); return now; }
    try { return JSON.parse(localStorage.getItem('aisaju_utm') || '{}'); } catch (e) { return {}; }
  }

  function track(name, opts) {
    opts = opts || {};
    var u = utms();
    var body = {
      session_id: sid(), visitor_id: vid(), name: name,
      step: (opts.step === undefined ? null : opts.step),
      props: opts.props || {},
      utm: u.utm || null, utm_source: u.utm_source || null,
      utm_medium: u.utm_medium || null, utm_campaign: u.utm_campaign || null,
      referrer: d.referrer || null,
      path: w.location.pathname,
      device: device(),
      lang: d.documentElement.lang || 'ko'
    };
    try {
      fetch(SUPABASE_URL + '/rest/v1/events', {
        method: 'POST', keepalive: true,
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: 'Bearer ' + SUPABASE_ANON_KEY,
          Prefer: 'return=minimal'
        },
        body: JSON.stringify(body)
      })['catch'](function () {});
    } catch (e) { /* 계측 실패가 앱 동작을 막지 않도록 무시 */ }
  }

  w.AJ = { track: track };

  // 진입 자동 기록
  track('ohaeng_view');
})(window, document);
