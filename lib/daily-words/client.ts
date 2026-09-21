/**
 * 동작 모듈 — 12초마다 다음 오행 문구로(1분에 한 바퀴).
 *  · 오행 진단 기록(기기의 ohaeng_last)이 있으면 가장 약한 오행 = 보완 오행 문구를 굵게, 그 문구부터 시작
 *  · 마우스를 올리면 멈춤, 화면을 만지면 12초를 새로 셈, 점을 누르면 그 문구로 이동
 *  · '동작 줄이기' 설정이면 자동으로 넘기지 않음 / 탭이 숨겨지면 멈춤
 *  · 한국어 화면에서만 보이고, 다른 언어에서는 원래 VOC 문구를 보여 준다
 */
const INTERVAL = 12_000;
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

  dots.forEach((d) => d.addEventListener("click", onDot));
  box.addEventListener("mouseenter", onEnter);
  box.addEventListener("mouseleave", onLeave);
  box.addEventListener("touchstart", onTouch, { passive: true });
  document.addEventListener("visibilitychange", onVis);

  return {
    setLang(lang: string) {
      const ko = lang === "ko";
      box.hidden = !ko;
      if (voc) voc.hidden = ko;
      start();
    },
    destroy() {
      stop();
      dots.forEach((d) => d.removeEventListener("click", onDot));
      box.removeEventListener("mouseenter", onEnter);
      box.removeEventListener("mouseleave", onLeave);
      box.removeEventListener("touchstart", onTouch);
      document.removeEventListener("visibilitychange", onVis);
    },
  };
}
