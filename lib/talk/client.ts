/**
 * 「오늘 한 줄」 동작 모듈 — 홈 1줄 롤링 (2026-10-17)
 *   · 줄마다 머무는 시간 = 기본 3.5초. 글이 칸보다 길면 그 줄이 보이는 동안 왼쪽으로 흘러 끝까지 보여 주고
 *     (초당 45px), 다 보인 뒤 1.6초 더 머문 다음 다음 줄로 — 그래서 40자도 끝까지 읽힌다
 *   · 끝(복제한 첫 줄)에 닿으면 소리 없이 처음으로
 *   · 손을 대거나 마우스를 올리면 멈춤, 탭이 숨겨지면 멈춤 (돌아오면 이어서)
 *   · 줄을 누르면 /talk 로 — 누른 글 id 를 계측(trk)으로 남긴다
 */
import { TALK_ROW_H } from "./view";

const DWELL = 3500;        // 짧은 글 한 줄에 머무는 시간
const FLOW_SPEED = 45;     // 긴 글이 흐르는 속도 px/s
const FLOW_TAIL = 1600;    // 다 흘러간 뒤 더 머무는 시간
const FLOW_LEAD = 900;     // 흐르기 시작 전 잠깐 멈춤 (읽기 시작할 틈)

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

  const rows = Array.from(ul.querySelectorAll<HTMLElement>("li"));
  const n = parseInt(box.dataset.n || "0", 10);
  const roll = box.dataset.roll === "1";
  let i = 0, hold = false, timer: ReturnType<typeof setTimeout> | null = null, dead = false;

  /** 이 줄의 글이 칸보다 길면 흘려 보내고, 머물 시간을 돌려준다 */
  const showRow = (li: HTMLElement): number => {
    const tx = li.querySelector<HTMLElement>(".tx"), txi = li.querySelector<HTMLElement>(".txi");
    if (!tx || !txi) return DWELL;
    txi.classList.remove("flow"); txi.style.setProperty("--flow-x", "0px"); txi.style.setProperty("--flow-t", "0s");
    const over = txi.scrollWidth - tx.clientWidth;
    if (over <= 4) return DWELL;
    const dist = over + 8, sec = dist / FLOW_SPEED;
    setTimeout(() => {
      if (dead) return;
      txi.style.setProperty("--flow-t", `${sec}s`); txi.classList.add("flow"); txi.style.setProperty("--flow-x", `-${dist}px`);
    }, FLOW_LEAD);
    return FLOW_LEAD + sec * 1000 + FLOW_TAIL;
  };
  const resetRow = (li: HTMLElement) => {
    const txi = li.querySelector<HTMLElement>(".txi");
    if (txi) { txi.classList.remove("flow"); txi.style.setProperty("--flow-x", "0px"); }
  };

  const schedule = (ms: number) => { if (timer) clearTimeout(timer); timer = setTimeout(tick, ms); };
  const tick = () => {
    if (dead) return;
    if (hold || document.visibilityState === "hidden") { schedule(800); return; }
    if (!roll) { schedule(showRow(rows[0])); return; }
    resetRow(rows[i]);
    i += 1; ul.classList.add("anim"); ul.style.transform = `translateY(-${i * TALK_ROW_H}px)`;
    if (i >= n) setTimeout(() => { ul.classList.remove("anim"); i = 0; ul.style.transform = "translateY(0)"; }, 460);
    const li = rows[i >= n ? 0 : i] ?? rows[0];
    schedule(460 + showRow(li));
  };
  schedule(showRow(rows[0]));   // 첫 줄도 길면 흘린다

  const pause = () => { hold = true; }, go = () => { hold = false; };
  box.addEventListener("touchstart", pause, { passive: true }); box.addEventListener("touchend", go);
  box.addEventListener("mouseenter", pause); box.addEventListener("mouseleave", go);

  return {
    destroy() {
      dead = true;
      if (timer) clearTimeout(timer);
      ul.removeEventListener("click", onClick);
      box.removeEventListener("touchstart", pause); box.removeEventListener("touchend", go);
      box.removeEventListener("mouseenter", pause); box.removeEventListener("mouseleave", go);
    },
  };
}
