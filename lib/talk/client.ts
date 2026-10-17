/**
 * 「오늘 한 줄」 동작 모듈 — 홈 1줄 롤링 (2026-10-17)
 *   · 3.5초마다 한 줄씩 위로. 끝(복제한 첫 줄)에 닿으면 소리 없이 처음으로
 *   · 손을 대거나 마우스를 올리면 멈춤, 탭이 숨겨지면 멈춤
 *   · 줄을 누르면 /talk 로 — 누른 글 id 를 계측(trk)으로 남긴다
 */
import { TALK_ROW_H } from "./view";

const INTERVAL = 3500;

export interface TalkHandle { destroy(): void }

export function mountTalk(root: HTMLElement, trk: (name: string, props?: Record<string, unknown>) => void): TalkHandle {
  const box = root.querySelector<HTMLElement>("#talk");
  const ul = root.querySelector<HTMLElement>("#talk-ul");
  if (!box || !ul) return { destroy() {} };

  const onClick = (e: Event) => {
    const a = (e.target as HTMLElement).closest("a[data-talk]") as HTMLElement | null;
    if (a) trk("home_talk_click", { id: a.dataset.talk, n: box.dataset.n });
  };
  ul.addEventListener("click", onClick);

  let timer: ReturnType<typeof setInterval> | null = null;
  let hold = false;
  const pause = () => { hold = true; }, go = () => { hold = false; };
  if (box.dataset.roll === "1") {
    const n = parseInt(box.dataset.n || "0", 10);
    let i = 0;
    const step = () => {
      if (hold || document.visibilityState === "hidden") return;
      i += 1; ul.classList.add("anim"); ul.style.transform = `translateY(-${i * TALK_ROW_H}px)`;
      if (i >= n) setTimeout(() => { ul.classList.remove("anim"); i = 0; ul.style.transform = "translateY(0)"; }, 460);
    };
    timer = setInterval(step, INTERVAL);
    box.addEventListener("touchstart", pause, { passive: true }); box.addEventListener("touchend", go);
    box.addEventListener("mouseenter", pause); box.addEventListener("mouseleave", go);
  }
  return {
    destroy() {
      ul.removeEventListener("click", onClick);
      if (timer) clearInterval(timer);
      box.removeEventListener("touchstart", pause); box.removeEventListener("touchend", go);
      box.removeEventListener("mouseenter", pause); box.removeEventListener("mouseleave", go);
    },
  };
}
