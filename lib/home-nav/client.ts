/**
 * 홈 바로가기·전체 메뉴 동작 모듈 — 브라우저 전용 (v7, 2026-11-20)
 *
 *   · open() / close()  전체 메뉴(≡) 여닫기. 열려 있는 동안 뒤 화면은 스크롤되지 않는다
 *   · go(to, from)      바로가기·메뉴·결과 카드 버튼 공통 이동. 어디서(from) 무엇을(item) 눌렀는지 nav_click 으로 남긴다
 *   · jump(id)          홈 안의 구간으로 이동. 접혀 있는 블록(궁합·작명)이면 먼저 펼친다
 *   · 접어 둔 블록을 펼치면 fold_open 으로 남긴다
 *   · 주소 끝에 #구간 이 붙어 들어오면(예: /#gunghap · /#naming) 접힌 블록을 펼치고 그 자리로 간다
 *
 * 새 목적지를 더하려면 items.ts 의 NavTo 에 이름을 넣고, 아래 OUT(다른 화면) 또는 IN(홈 안 구간)에 한 줄 더한다.
 */
import type { NavTo } from "./items";

type Track = (name: string, props?: Record<string, unknown>) => void;

/** 다른 화면으로 가는 곳 */
const OUT: Partial<Record<NavTo, string>> = {
  today: "/ohaeng/#today",
  ohaeng: "/ohaeng/",
  match: "/ohaeng/#match",
  me: "/ohaeng/#me",
  q: "/q?utm=home_nav",
  learn: "/learn?utm=home_nav",
  ask: "/ask?utm=home_nav",
};
/** 홈 안에서 그 구간으로 내려가는 곳 — 값은 그 구간의 id */
const IN: Partial<Record<NavTo, string>> = {
  price: "report",
  samples: "smpwrap",
  gunghap: "gunghap",
  naming: "naming",
  reviews: "rv-list",
};
const CHANNEL_ADD = "https://pf.kakao.com/_cERaX/friend";

export interface HomeNavHandle {
  open(): void;
  close(): void;
  jump(id: string): void;
  go(to: string, from: string): void;
  destroy(): void;
}

export function mountHomeNav(root: HTMLElement, track: Track, opts: { kakaoUrl: string }): HomeNavHandle {
  const sheet = root.querySelector<HTMLElement>("#navsheet");

  const open = () => {
    if (!sheet) return;
    sheet.classList.add("on"); sheet.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };
  const close = () => {
    if (!sheet || !sheet.classList.contains("on")) return;
    sheet.classList.remove("on"); sheet.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };
  /* 바깥(어두운 곳)이나 × 를 누르면 닫힌다 */
  const onSheet = (e: Event) => { const t = e.target as HTMLElement; if (t === sheet || t.closest("#ns-x")) close(); };
  sheet?.addEventListener("click", onSheet);

  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const fold = (el instanceof HTMLDetailsElement ? el : el.closest("details")) as HTMLDetailsElement | null;
    if (fold) fold.open = true;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const go = (to: string, from: string) => {
    track("nav_click", { item: to, from });
    close();
    const k = to as NavTo;
    if (k === "kakao") window.open(opts.kakaoUrl, "_blank");
    else if (k === "chadd") window.open(CHANNEL_ADD, "_blank");
    else if (OUT[k]) window.location.href = OUT[k] as string;
    else if (IN[k]) jump(IN[k] as string);
  };

  /* 접어 둔 궁합·작명을 펼친 횟수 — 어떤 길로 펼쳐지든(직접 누름·바로가기·메뉴·링크) 한 번 펼칠 때 한 번만 남긴다 */
  const folds = Array.from(root.querySelectorAll<HTMLDetailsElement>("details.fold"));
  const lastOpen = new WeakMap<HTMLDetailsElement, number>();
  const noteOpen = (d: HTMLDetailsElement) => {
    const now = Date.now();
    if (now - (lastOpen.get(d) || 0) < 1000) return;
    lastOpen.set(d, now);
    track("fold_open", { item: d.dataset.fold || d.id });
  };
  const onToggle = (e: Event) => {
    const d = e.currentTarget as HTMLDetailsElement;
    if (d.open) noteOpen(d);
  };
  folds.forEach((d) => d.addEventListener("toggle", onToggle));

  /* 다른 화면·바깥 링크에서 구간을 찍어 들어온 경우 (예: 오행 궁합 화면의 「궁합 리포트 20장 →」 = /#gunghap).
     그 구간이 접혀 있으면 브라우저가 자리를 찾지 못하므로(특히 아이폰), 펼친 다음 그 자리로 데려간다.
     바로가기·메뉴와 구분되도록 nav_click 의 from 을 "link" 로 남긴다 */
  let hashTimer = 0;
  const fromHash = () => {
    const id = (window.location.hash || "").slice(1);
    if (!/^[\w-]+$/.test(id)) return;
    const el = document.getElementById(id);
    const fold = el && root.contains(el) ? (el.closest("details.fold") as HTMLDetailsElement | null) : null;
    if (!el || !fold) return;
    track("nav_click", { item: fold.dataset.fold || id, from: "link" });
    /* 크롬은 화면이 준비되기 전에 스스로 펼쳐 두기도 한다 — 그때도 펼침 기록은 똑같이 남긴다 */
    if (fold.open) noteOpen(fold); else fold.open = true;
    const land = () => el.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "start" });
    requestAnimationFrame(() => {
      land();
      /* 그림·글꼴이 늦게 실려 자리가 밀렸으면 한 번 더 맞춘다 — 그 사이 방문자가 직접 움직였으면 건드리지 않는다 */
      const y = window.scrollY;
      hashTimer = window.setTimeout(() => { if (Math.abs(window.scrollY - y) < 4) land(); }, 500);
    });
  };
  fromHash();
  window.addEventListener("hashchange", fromHash);

  return {
    open, close, jump, go,
    destroy() {
      sheet?.removeEventListener("click", onSheet);
      folds.forEach((d) => d.removeEventListener("toggle", onToggle));
      window.removeEventListener("hashchange", fromHash);
      if (hashTimer) window.clearTimeout(hashTimer);
      close();
    },
  };
}
