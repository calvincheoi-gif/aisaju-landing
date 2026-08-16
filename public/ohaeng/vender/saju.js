/* ═══════════════════════════════════════════════════════════
   AIsajuLab · 삼주(연·월·일) 오행 분포 계산기  v1.0  2026-08-16
   ───────────────────────────────────────────────────────────
   입력: 생년월일 + 양력/음력(윤달) — 태어난 시각은 받지 않는다.
   엔진: manseryeok-js(KASI 기반) + lunar-javascript 2종 교차검증.
        결과가 다르면 lunar-javascript를 우선한다(운영 확정).
   가중치: 연간·월간·일간 각 1.0 / 연지 1.0 / 월지 3.0 / 일지 1.5
          합계 8.5 → 자가진단과 같은 눈금인 20점으로 환산.
   ※ 시각을 받지 않으므로 절기 경계(입춘 등) 당일은 두 엔진이
     갈릴 수 있다. 그 경우 boundary:true 로 표시만 하고, 오행
     성격·990원 리포트에서는 시각을 되묻지 않는다(전문가 상담 유도).
   ═══════════════════════════════════════════════════════════ */
(function (root) {
  "use strict";

  var GAN = "갑을병정무기경신임계".split("");
  var JI  = "자축인묘진사오미신유술해".split("");
  var GAN_H = "甲乙丙丁戊己庚辛壬癸";
  var JI_H  = "子丑寅卯辰巳午未申酉戌亥";

  /* 천간 오행 */
  var GAN_EL = {
    "갑":"wood","을":"wood","병":"fire","정":"fire","무":"earth",
    "기":"earth","경":"metal","신":"metal","임":"water","계":"water"
  };
  /* 지지 본기(本氣) 오행 */
  var JI_EL = {
    "자":"water","축":"earth","인":"wood","묘":"wood","진":"earth","사":"fire",
    "오":"fire","미":"earth","신":"metal","유":"metal","술":"earth","해":"water"
  };

  /* 지장간(支藏干) — 지지 속에 숨은 천간과 그 배분 비율
     배분은 정기 50 : 중기 30 : 여기 20 으로 단순화(사장님 확정 2026-08-16).
     숨은 기운이 둘뿐이면 50:30을 정규화하고, 하나뿐이면 100으로 본다.
     배열은 [천간, 비율] — 정기를 앞에 둔다. */
  var JI_HIDDEN = {
    "자": [["계",1.00]],
    "축": [["기",0.50],["계",0.30],["신",0.20]],
    "인": [["갑",0.50],["병",0.30],["무",0.20]],
    "묘": [["을",1.00]],
    "진": [["무",0.50],["을",0.30],["계",0.20]],
    "사": [["병",0.50],["경",0.30],["무",0.20]],
    "오": [["정",0.625],["기",0.375]],
    "미": [["기",0.50],["정",0.30],["을",0.20]],
    "신": [["경",0.50],["임",0.30],["무",0.20]],
    "유": [["신",1.00]],
    "술": [["무",0.50],["신",0.30],["정",0.20]],
    "해": [["임",0.625],["갑",0.375]]
  };

  var ORDER = ["wood","fire","earth","metal","water"];

  /* 가중치 — 사장님 확정(2026-08-16) */
  var W = { yearGan:1.0, monthGan:1.0, dayGan:1.0,
            yearJi:1.0,  monthJi:3.0,  dayJi:1.5 };
  var W_SUM = 8.5;
  var SCALE = 20;        // 자가진단 총점과 동일한 눈금
  var FLOOR_RAW = 0.5;   // 오행별 최소 원점수(사장님 확정) — 0의 극단을 두지 않는다
  var BAL_MIN  = 10;     // 균형지수 하한(사장님 확정) — 「0」은 표시하지 않는다
  var BLEND_SAJU = 0.6;  // 보정 기본 비율 — 선천(사주) 6 : 후천(자가진단) 4

  /* ── 엔진 어댑터 ───────────────────────────────────────── */

  /* manseryeok-js: 한글 기둥("무신") 반환 */
  function engineManse(y, m, d) {
    try {
      var M = root.Manseryeok || root.manseryeok;
      if (!M || !M.calculateSajuSimple) return null;
      var r = M.calculateSajuSimple(y, m, d, 12);
      return { y: r.yearPillar, m: r.monthPillar, d: r.dayPillar };
    } catch (e) { return null; }
  }

  /* lunar-javascript: 한자 기둥("戊申") → 한글 변환 */
  function engineLunar(y, m, d) {
    try {
      if (!root.Solar) return null;
      var ec = root.Solar.fromYmdHms(y, m, d, 12, 0, 0).getLunar().getEightChar();
      var cv = function (p) {
        var gi = GAN_H.indexOf(p.charAt(0)), zi = JI_H.indexOf(p.charAt(1));
        if (gi < 0 || zi < 0) return null;
        return GAN[gi] + JI[zi];
      };
      var a = cv(ec.getYear()), b = cv(ec.getMonth()), c = cv(ec.getDay());
      if (!a || !b || !c) return null;
      return { y: a, m: b, d: c };
    } catch (e) { return null; }
  }

  /* ── 음력 → 양력 ──────────────────────────────────────── */
  function lunarToSolar(y, m, d, isLeap) {
    var M = root.Manseryeok || root.manseryeok;
    if (M && M.lunarToSolar) {
      try {
        var r = M.lunarToSolar(y, m, d, !!isLeap);
        if (r && r.solar) return { y: r.solar.year, m: r.solar.month, d: r.solar.day };
      } catch (e) {}
    }
    if (root.Lunar) {                       // 폴백: lunar-javascript (윤달은 음수 월)
      try {
        var s = root.Lunar.fromYmd(y, isLeap ? -m : m, d).getSolar();
        return { y: s.getYear(), m: s.getMonth(), d: s.getDay() };
      } catch (e) {}
    }
    return null;
  }

  /* ── 오행 분포 ────────────────────────────────────────── */
  function toScore(p) {
    var raw = { wood:0, fire:0, earth:0, metal:0, water:0 };
    function addGan(ch, w) {
      var el = GAN_EL[ch];
      if (el) raw[el] += w;
    }
    /* 지지는 본기만 보지 않고 지장간 비율대로 나눠 담는다.
       글자 수가 여섯뿐인 삼주에서 특정 오행이 통째로 비는 것을 줄이고,
       숨은 기운까지 읽는 명리학 관점에 맞춘다. */
    function addJi(ch, w) {
      var hid = JI_HIDDEN[ch];
      if (hid) {
        hid.forEach(function (h) {
          var el = GAN_EL[h[0]];
          if (el) raw[el] += w * h[1];
        });
      } else {
        var el2 = JI_EL[ch];
        if (el2) raw[el2] += w;
      }
    }
    addGan(p.y.charAt(0), W.yearGan);
    addGan(p.m.charAt(0), W.monthGan);
    addGan(p.d.charAt(0), W.dayGan);
    addJi(p.y.charAt(1), W.yearJi);
    addJi(p.m.charAt(1), W.monthJi);
    addJi(p.d.charAt(1), W.dayJi);

    /* 바닥값 — 지장간에도 없는 오행이라도 0으로 두지 않는다.
       "전혀 없다"는 극단은 해석에도 그래프에도 좋지 않다. */
    var floored = 0;
    ORDER.forEach(function (k) {
      if (raw[k] < FLOOR_RAW) { floored += (FLOOR_RAW - raw[k]); raw[k] = FLOOR_RAW; }
    });
    var denom = W_SUM + floored;

    var s = {}, sum = 0;
    ORDER.forEach(function (k) {
      s[k] = Math.round((raw[k] / denom) * SCALE * 100) / 100;
      sum += s[k];
    });
    /* 반올림 오차를 가장 큰 항목에 흡수시켜 합계를 정확히 20으로 */
    var diff = Math.round((SCALE - sum) * 100) / 100;
    if (diff !== 0) {
      var top = ORDER.slice().sort(function (a, b) { return s[b] - s[a]; })[0];
      s[top] = Math.round((s[top] + diff) * 100) / 100;
    }
    return { raw: raw, score: s };
  }

  /* ── 메인 ─────────────────────────────────────────────── */
  /* opt: { calendar:"solar"|"lunar", leap:true|false } */
  function compute(y, m, d, opt) {
    opt = opt || {};
    var input = { y: y, m: m, d: d, calendar: opt.calendar || "solar", leap: !!opt.leap };
    var sol = { y: y, m: m, d: d };

    if (input.calendar === "lunar") {
      var c = lunarToSolar(y, m, d, input.leap);
      if (!c) return { ok: false, reason: "lunar_convert_failed", input: input };
      sol = c;
    }

    var A = engineManse(sol.y, sol.m, sol.d);   // KASI 기반
    var B = engineLunar(sol.y, sol.m, sol.d);   // 우선 엔진

    if (!A && !B) return { ok: false, reason: "engine_unavailable", input: input, solar: sol };

    var pick = B || A;                           // 불일치 시 lunar-javascript 우선
    var agree = !!(A && B && A.y === B.y && A.m === B.m && A.d === B.d);
    var boundary = !!(A && B && !agree);         // 절기 경계 추정

    var out = toScore(pick);
    var sorted = ORDER.slice().sort(function (a, b) {
      return out.score[b] - out.score[a] || ORDER.indexOf(a) - ORDER.indexOf(b);
    });
    var mean = SCALE / 5;
    var sd = Math.sqrt(ORDER.reduce(function (t, k) {
      return t + Math.pow(out.score[k] - mean, 2);
    }, 0) / 5);
    var bal = Math.max(BAL_MIN, Math.min(100, Math.round(100 - (sd / mean) * 100)));

    return {
      ok: true,
      input: input,
      solar: sol,
      pillars: pick,
      engines: { manseryeok: A, lunar: B, agree: agree, used: B ? "lunar" : "manseryeok" },
      boundary: boundary,
      raw: out.raw,
      score: out.score,          // 합계 20점 — 자가진단과 동일 눈금
      strong: sorted[0],
      second: sorted[1],
      weak: sorted[4],
      balance: bal,
      dayGan: pick.d.charAt(0)   // 일간 — 향후 십신 확장용
    };
  }

  /* ═══════════ 2단계 · 보정 ═══════════
     사주 삼주 = 타고난 기질(선천), 자가진단 = 지금의 나(후천).
     앱의 STEP 2 영점 조정과 같은 구조로 둘을 섞어 최종 분포를 낸다.
     두 값의 차이(gap) 자체가 리포트에서 가장 할 말이 많은 재료다. */
  function blend(saju, self, ratio) {
    if (!saju || !saju.score) return null;
    if (!self) return saju;
    var w = (typeof ratio === "number") ? ratio : BLEND_SAJU;
    w = Math.max(0, Math.min(1, w));

    var selfSum = ORDER.reduce(function (t, k) { return t + (self[k] || 0); }, 0) || 1;
    var norm = {};
    ORDER.forEach(function (k) { norm[k] = (self[k] || 0) / selfSum * SCALE; });

    var s = {}, sum = 0;
    ORDER.forEach(function (k) {
      s[k] = Math.round((saju.score[k] * w + norm[k] * (1 - w)) * 100) / 100;
      sum += s[k];
    });
    var d = Math.round((SCALE - sum) * 100) / 100;
    if (d !== 0) {
      var top = ORDER.slice().sort(function (a, b) { return s[b] - s[a]; })[0];
      s[top] = Math.round((s[top] + d) * 100) / 100;
    }

    var gaps = ORDER.map(function (k) {
      return { el: k, saju: saju.score[k], self: Math.round(norm[k] * 100) / 100,
               gap: Math.round((norm[k] - saju.score[k]) * 100) / 100 };
    }).sort(function (a, b) { return Math.abs(b.gap) - Math.abs(a.gap); });

    var sorted = ORDER.slice().sort(function (a, b) {
      return s[b] - s[a] || ORDER.indexOf(a) - ORDER.indexOf(b);
    });
    var mean = SCALE / 5;
    var sd = Math.sqrt(ORDER.reduce(function (t, k) {
      return t + Math.pow(s[k] - mean, 2);
    }, 0) / 5);

    return {
      ok: true, mode: "blended", ratio: w,
      pillars: saju.pillars, solar: saju.solar,
      boundary: saju.boundary, engines: saju.engines,
      score: s, strong: sorted[0], second: sorted[1], weak: sorted[4],
      balance: Math.max(BAL_MIN, Math.min(100, Math.round(100 - (sd / mean) * 100))),
      dayGan: saju.dayGan,
      innate: saju.score, current: norm,
      gaps: gaps, topGap: gaps[0]
    };
  }

  root.AJSaju = {
    compute: compute,
    blend: blend,
    lunarToSolar: lunarToSolar,
    WEIGHTS: W,
    version: "1.0"
  };
})(typeof window !== "undefined" ? window : globalThis);
