/**
 * 동작 모듈 — 12초마다 다음 오행 문구로(1분에 한 바퀴).
 *  · 오행 진단 기록(기기의 ohaeng_last)이 있으면 가장 약한 오행 = 보완 오행 문구를 굵게, 그 문구부터 시작
 *  · 마우스를 올리면 멈춤, 화면을 만지면 12초를 새로 셈, 점을 누르면 그 문구로 이동
 *  · '동작 줄이기' 설정이면 자동으로 넘기지 않음 / 탭이 숨겨지면 멈춤
 *  · 한국어 화면에서만 보이고, 다른 언어에서는 원래 VOC 문구를 보여 준다
 */
const INTERVAL = 12_000;
const FONT_MAX = 19;   /* 문구가 짧으면 크게 */
const FONT_MIN = 12;   /* 길어도 이 밑으로는 줄이지 않음 */

/** 문구마다 칸(높이 고정)에 꽉 차는 가장 큰 글자 크기를 찾는다 — 짧은 속담은 크게, 긴 경구는 작게 */
function fitWords(box: HTMLElement) {
  if (box.hidden) return;
  box.querySelectorAll<HTMLElement>(".dw-txt").forEach((t) => {
    const fits = (px: number) => { t.style.fontSize = px + "px"; return t.scrollHeight <= t.clientHeight + 1; };
    if (fits(FONT_MAX)) return;
    let lo = FONT_MIN, hi = FONT_MAX;
    while (hi - lo > 0.25) { const mid = (lo + hi) / 2; if (fits(mid)) lo = mid; else hi = mid; }
    t.style.fontSize = lo + "px";
  });
}
const ORDER = ["wood", "fire", "earth", "metal", "water"];

export interface DailyWordsHandle {
  setLang(lang: string): void;
  destroy(): void;
}

function weakestElement(): string | null {
  try {
    const raw = localStorage.getItem("ohaeng_last");
    if (!raw) return null;
    const s = JSON.parse(raw)?.s as Record<string, number> | undefined;
    if (!s) return null;
    let best: string | null = null;
    let min = Infinity;
    for (const k of ORDER) {
      const v = Number(s[k]);
      if (Number.isFinite(v) && v < min) { min = v; best = k; }
    }
    return best;
  } catch {
    return null;
  }
}

export function mountDailyWords(root: HTMLElement): DailyWordsHandle {
  const box = root.querySelector<HTMLElement>(".dw");
  const voc = root.querySelector<HTMLElement>(".voc.top");
  if (!box) {
    return { setLang() { if (voc) voc.hidden = false; }, destroy() {} };
  }
  const slides = Array.from(box.querySelectorAll<HTMLElement>(".dw-s"));
  const dots = Array.from(box.querySelectorAll<HTMLButtonElement>(".dw-dot"));
  const n = slides.length;

  const weak = weakestElement();
  const meIdx = weak ? slides.findIndex((s) => s.dataset.el === weak) : -1;
  if (meIdx >= 0) { slides[meIdx].classList.add("me"); dots[meIdx]?.classList.add("me"); }

  let cur = 0;
  const show = (i: number) => {
    cur = ((i % n) + n) % n;
    slides.forEach((s, k) => { s.classList.toggle("on", k === cur); s.setAttribute("aria-hidden", k === cur ? "false" : "true"); });
    dots.forEach((d, k) => d.classList.toggle("on", k === cur));
  };
  show(meIdx >= 0 ? meIdx : 0);

  const reduced = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  let timer: ReturnType<typeof setInterval> | null = null;
  let hovered = false;
  const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
  const start = () => {
    stop();
    if (reduced || hovered || document.hidden || box.hidden || n < 2) return;
    timer = setInterval(() => show(cur + 1), INTERVAL);
  };

  const onDot = (e: Event) => {
    const idx = Number((e.currentTarget as HTMLElement).dataset.idx);
    if (Number.isFinite(idx)) { show(idx); start(); }
  };
  const onEnter = () => { hovered = true; stop(); };
  const onLeave = () => { hovered = false; start(); };
  const onTouch = () => start();                       /* 만지면 12초를 새로 센다 */
  const onVis = () => (document.hidden ? stop() : start());

  let rz: ReturnType<typeof setTimeout> | null = null;
  const onResize = () => { if (rz) clearTimeout(rz); rz = setTimeout(() => fitWords(box), 150); };

  dots.forEach((d) => d.addEventListener("click", onDot));
  window.addEventListener("resize", onResize);
  /* 웹폰트가 늦게 들어오면 글자 폭이 바뀌므로 한 번 더 맞춘다 */
  try { (document as Document & { fonts?: FontFaceSet }).fonts?.ready.then(() => fitWords(box)); } catch {}
  box.addEventListener("mouseenter", onEnter);
  box.addEventListener("mouseleave", onLeave);
  box.addEventListener("touchstart", onTouch, { passive: true });
  document.addEventListener("visibilitychange", onVis);

  return {
    setLang(lang: string) {
      const ko = lang === "ko";
      box.hidden = !ko;
      if (voc) voc.hidden = ko;
      fitWords(box);
      start();
    },
    destroy() {
      stop();
      dots.forEach((d) => d.removeEventListener("click", onDot));
      window.removeEventListener("resize", onResize);
      if (rz) clearTimeout(rz);
      box.removeEventListener("mouseenter", onEnter);
      box.removeEventListener("mouseleave", onLeave);
      box.removeEventListener("touchstart", onTouch);
      document.removeEventListener("visibilitychange", onVis);
    },
  };
}
