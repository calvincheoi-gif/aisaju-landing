(function () {
  if (location.hostname.indexOf("popup.") === 0) return; // 팝업스토어는 자체 처리
  var SUPA = "https://urazdkvkanjnquqhnrvo.supabase.co";
  var ANON = "sb_publishable_fSG-HqZrC9GVTT5FOprPnA_sDiFoiD2";

  function getCookie(n) {
    var m = document.cookie.match(new RegExp("(?:^|; )" + n + "=([^;]*)"));
    return m ? m[1] : null;
  }
  function setCookie(n, v) {
    document.cookie = n + "=" + v + ";domain=.aisajulab.com;path=/;max-age=31536000;SameSite=Lax";
  }
  function deviceCode() {
    var c = getCookie("sp_device");
    if (!c) {
      try { c = localStorage.getItem("sp_device"); } catch (e) {}
      if (!c) c = (crypto.randomUUID ? crypto.randomUUID().replace(/-/g, "") : String(Math.random()).slice(2) + Date.now()).slice(0, 32);
      setCookie("sp_device", c);
    }
    try { localStorage.setItem("sp_device", c); } catch (e) {}
    return c;
  }
  function toast(msg) {
    var t = document.createElement("div");
    t.innerHTML = msg;
    t.style.cssText = "position:fixed;top:18px;left:50%;transform:translateX(-50%) translateY(-8px);background:#1E1B4B;color:#fff;border:1.5px solid #F59E0B;border-radius:30px;padding:11px 22px;font-size:13.5px;font-weight:700;z-index:99991;box-shadow:0 6px 18px rgba(30,27,75,.35);opacity:0;transition:.4s;font-family:inherit;white-space:nowrap;max-width:92vw;overflow:hidden;text-overflow:ellipsis;";
    document.body.appendChild(t);
    setTimeout(function () { t.style.opacity = "1"; t.style.transform = "translateX(-50%)"; }, 60);
    setTimeout(function () { t.style.opacity = "0"; }, 3800);
    setTimeout(function () { t.remove(); }, 4400);
  }
  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : s;
    return d.innerHTML;
  }

  async function run() {
    if (sessionStorage.getItem("sv_done")) return;
    var dc = deviceCode();

    // 채널(utm) 읽기 — URL 파라미터 우선, 없으면 저장된 값
    var _q = new URLSearchParams(location.search);
    var _u = _q.get("utm") || _q.get("utm_source");
    if (_u) { try { localStorage.setItem("sp_utm", _u); } catch (e) {} }
    if (!_u) { try { _u = localStorage.getItem("sp_utm"); } catch (e) {} }

    // 메인 홈페이지 자체 방문 로그 (main_events) — 통합 KPI용, 실패해도 무시
    try {
      var _src = _u || (document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : null);
      fetch(SUPA + "/rest/v1/main_events", {
        method: "POST",
        headers: { apikey: ANON, Authorization: "Bearer " + ANON, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({
          kind: "visit",
          device_code: dc,
          source: _src ? String(_src).slice(0, 60) : null,
          path: location.pathname.slice(0, 200)
        }),
        keepalive: true
      }).catch(function () {});
    } catch (e) {}

    try {
      var r = await fetch(SUPA + "/rest/v1/rpc/popup_visit", {
        method: "POST",
        headers: { apikey: ANON, Authorization: "Bearer " + ANON, "Content-Type": "application/json" },
        body: JSON.stringify({ p_device_code: dc, p_nickname: null, p_source: _u || "main" }),
      });
      if (!r.ok) return;
      var v = await r.json();
      sessionStorage.setItem("sv_done", "1");
      // 방문 활동 기록 (사이트 구분)
      fetch(SUPA + "/rest/v1/popup_activities", {
        method: "POST",
        headers: { apikey: ANON, Authorization: "Bearer " + ANON, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ visitor_id: v.id, type: "visit", meta: { site: "main" } }),
      }).catch(function () {});
      // 오늘 방문자 수
      var todayTxt = "";
      try {
        var s = await fetch(SUPA + "/rest/v1/rpc/popup_public_stats", {
          method: "POST", headers: { apikey: ANON, Authorization: "Bearer " + ANON, "Content-Type": "application/json" }, body: "{}",
        }).then(function (x) { return x.json(); });
        if (s && s.today_visits) todayTxt = ' · 오늘 <b style="color:#F59E0B">' + s.today_visits + "명</b>이 함께했어요";
      } catch (e) {}
      if (v.nickname) {
        toast("🔮 <b style=\"color:#F59E0B\">" + esc(v.nickname) + "</b>님, " + (v.visit_count <= 1 ? "첫 방문을 환영해요!" : "<b style=\"color:#F59E0B\">" + v.visit_count + "번째</b> 방문 환영해요!") + todayTxt);
      } else if (todayTxt) {
        toast("🔮 어서 오세요!" + todayTxt);
      }
    } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
