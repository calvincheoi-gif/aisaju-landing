(function () {
  var SUPA = "https://urazdkvkanjnquqhnrvo.supabase.co";
  var ANON = "sb_publishable_fSG-HqZrC9GVTT5FOprPnA_sDiFoiD2";
  var TITLES = ["개인사주", "궁합", "직업·진로", "사업운", "재물운", "대운·세운", "작명", "AI", "命理", "최형철 사주명리 연구소"];
  var cards = {};

  var css = document.createElement("style");
  css.textContent =
    "#scOverlay{position:fixed;inset:0;background:rgba(30,27,75,.55);z-index:99990;display:flex;align-items:flex-end;justify-content:center;}" +
    "#scSheet{background:#fff;border-radius:22px 22px 0 0;max-width:560px;width:100%;max-height:86vh;overflow-y:auto;padding:18px 22px 30px;font-family:inherit;animation:scUp .25s ease;}" +
    "@keyframes scUp{from{transform:translateY(40px);opacity:.4}to{transform:none;opacity:1}}" +
    "#scSheet .g{width:44px;height:5px;border-radius:3px;background:#E0E7FF;margin:0 auto 14px;}" +
    "#scSheet img{width:100%;border-radius:14px;display:block;}" +
    "#scSheet .t{font-size:20px;font-weight:800;color:#1E1B4B;text-align:center;margin:14px 0 2px;}" +
    "#scSheet .h{font-size:16px;font-weight:800;color:#312E81;margin:18px 0 6px;}" +
    "#scSheet .h:before{content:'✦ ';color:#4338CA;}" +
    "#scSheet .p{font-size:14.5px;color:#374151;line-height:1.75;}" +
    "#scSheet .tip{margin-top:14px;background:#EEF2FF;border:1.5px solid #C7D2FE;border-radius:12px;padding:12px 14px;font-size:13.5px;color:#3730A3;line-height:1.6;}" +
    "#scSheet .tip:before{content:'💡 ';}" +
    "#scSheet .cta{display:block;margin-top:20px;background:#4338CA;color:#fff;font-weight:800;font-size:15.5px;text-align:center;padding:15px;border-radius:12px;text-decoration:none;}" +
    "#scSheet .x{display:block;width:100%;margin-top:6px;background:none;border:none;color:#6B7280;font-size:13px;text-decoration:underline;cursor:pointer;padding:8px;}" +
    ".sc-clickable{cursor:pointer;}";
  document.head.appendChild(css);

  function close() {
    var o = document.getElementById("scOverlay");
    if (o) o.remove();
  }
  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : s;
    return d.innerHTML;
  }
  function open(title) {
    var c = cards[title];
    if (!c) return;
    close();
    var html = '<div class="g"></div>';
    html += '<div class="t">' + esc(c.title) + "</div>";
    (c.content || []).forEach(function (b) {
      if (b.t === "img") html += '<img src="' + b.src + '" alt="">';
      else if (b.t === "h") html += '<div class="h">' + esc(b.x) + "</div>";
      else if (b.t === "p") html += '<div class="p">' + esc(b.x) + "</div>";
      else if (b.t === "tip") html += '<div class="tip">' + esc(b.x) + "</div>";
    });
    if (c.cta_label && c.cta_href) html += '<a class="cta" href="' + c.cta_href + '">' + esc(c.cta_label) + "</a>";
    html += '<button class="x">닫기</button>';
    var o = document.createElement("div");
    o.id = "scOverlay";
    o.innerHTML = '<div id="scSheet">' + html + "</div>";
    o.addEventListener("click", function (e) {
      if (e.target === o || e.target.className === "x") close();
    });
    document.body.appendChild(o);
  }

  function attach() {
    var els = document.querySelectorAll("h1,h2,h3,h4,h5,strong,b,p,span,div");
    els.forEach(function (el) {
      if (el.dataset.scDone) return;
      if (el.children.length > 0) return;
      var txt = (el.textContent || "").trim();
      if (TITLES.indexOf(txt) === -1) return;
      var fs = parseFloat(getComputedStyle(el).fontSize || "16");
      if (fs > 34) return; // 섹션 대제목 제외
      el.dataset.scDone = "1";
      var target = el.closest("div") || el;
      target.classList.add("sc-clickable");
      target.addEventListener("click", function (e) {
        if (e.target.closest("a") || e.target.closest("button")) return;
        open(txt);
      });
    });
  }

  fetch(SUPA + "/rest/v1/site_cards?select=*&visible=eq.true&order=sort", { headers: { apikey: ANON } })
    .then(function (r) { return r.json(); })
    .then(function (rows) {
      (rows || []).forEach(function (r) { cards[r.title] = r; });
      attach();
      setTimeout(attach, 1200);
      setTimeout(attach, 3500);
    })
    .catch(function () {});
})();
