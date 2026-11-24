/**
 * 2027 새해운 — 넘침 맞춤 (브라우저에서만 쓴다).
 *
 * 양식의 칸은 크기가 정해져 있다. 글이 칸보다 길면 ① 낱말 단위로 줄을 바꾸고 ② 그래도 넘치면 글자를 조금씩 줄인다.
 * 최소 배율(0.72)까지 줄여도 넘치면 data-over="1" 을 달아 둔다 — 관리자 미리보기에서 빨간 점선으로 보이고,
 * 넘친 칸의 열쇠 목록을 돌려주므로 「넘침 n칸」 검사를 자동으로 할 수 있다.
 * 넘치지는 않았지만 글자를 88% 아래로 줄인 칸에는 data-shrunk 를 단다(주황 점선) — 문장을 줄일지 감수자가 판단한다.
 */
const MIN_K = 0.72;
const STEP = 0.035;

function overflows(el: HTMLElement, maxH: number): boolean {
  const inner = el.classList.contains("ny-cell") ? (el.firstElementChild as HTMLElement | null) : el;
  if (!inner) return false;
  const h = inner.getBoundingClientRect().height / scaleOf(el);
  return h > maxH + 0.6 || inner.scrollWidth > el.clientWidth + 1;
}

/** 화면에 비율(transform: scale)로 줄여 놓았을 때도 원래 크기 기준으로 재기 위한 배율 */
function scaleOf(el: HTMLElement): number {
  const w = el.offsetWidth;
  return w ? el.getBoundingClientRect().width / w || 1 : 1;
}

/** root 안의 모든 칸을 맞추고, 끝내 넘친 칸의 열쇠(쪽 번호 포함)를 돌려준다. */
export function fitPages(root: HTMLElement): string[] {
  const over: string[] = [];
  root.querySelectorAll<HTMLElement>(".ny-fit").forEach((el) => {
    const maxH = Number(el.dataset.h || 0);
    if (!maxH) return;
    let k = 1;
    el.style.setProperty("--k", "1");
    while (k > MIN_K && overflows(el, maxH)) {
      k = Math.max(MIN_K, k - STEP);
      el.style.setProperty("--k", k.toFixed(3));
    }
    /* 첫 줄 기준선을 양식의 자리(data-bl)에 정확히 맞춘다 — 브라우저의 글꼴 높이 반올림 보정 */
    const probe = el.querySelector<HTMLElement>(".ny-bl");
    const page = el.closest<HTMLElement>(".ny-page");
    if (probe && page && el.dataset.bl) {
      const sc = scaleOf(page);
      const now = (probe.getBoundingClientRect().top - page.getBoundingClientRect().top) / sc;
      const delta = Number(el.dataset.bl) - now;
      if (el.classList.contains("ny-cell")) {
        /* 가운데 칸: 한 줄일 때만 기준선을 맞춘다 (두 줄 이상이면 세로 가운데가 기준) */
        const inner = el.firstElementChild as HTMLElement | null;
        if (inner) {
          inner.style.transform = "";
          const oneLine = inner.getBoundingClientRect().height / sc < parseFloat(getComputedStyle(inner).fontSize) * 1.6;
          const now2 = (probe.getBoundingClientRect().top - page.getBoundingClientRect().top) / sc;
          const d2 = Number(el.dataset.bl) - now2;
          if (oneLine && Math.abs(d2) > 0.05 && Math.abs(d2) < 4) inner.style.transform = `translateY(${d2.toFixed(2)}px)`;
        }
      } else if (Math.abs(delta) > 0.05 && Math.abs(delta) < 6) el.style.top = `${parseFloat(el.style.top) + delta}px`;
    }
    /* 글자를 눈에 띄게(88% 아래로) 줄여 맞춘 칸 — 감수 화면에서 주황 점선으로 보인다 */
    if (k < 0.88) el.dataset.shrunk = k.toFixed(2);
    else delete el.dataset.shrunk;
    if (overflows(el, maxH)) {
      el.dataset.over = "1";
      over.push(el.dataset.f || "?");
    } else {
      delete el.dataset.over;
    }
  });
  return over;
}

/**
 * 양식 글꼴이 준비될 때까지 기다린다 — 준비 전에 재면 줄바꿈이 달라진다.
 * 양식 글꼴(한글·한자 × 보통·굵게)만 기다린다. document.fonts.ready 는 사이트의 다른 글꼴(CDN)까지 기다리므로
 * 그쪽이 막힌 통신 환경에서는 끝나지 않는다. 그래서 쓰지 않고, 양식 글꼴도 정해진 시간(기본 3초)까지만 기다린다.
 */
export async function fontsReady(timeoutMs = 3000): Promise<void> {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  const fonts = (document as Document & { fonts: FontFaceSet }).fonts;
  const want = Promise.all([fonts.load("400 16px 'NY Noto Sans KR'", "가丁"), fonts.load("700 16px 'NY Noto Sans KR'", "가丁")]).catch(() => undefined);
  await Promise.race([want, new Promise((r) => setTimeout(r, timeoutMs))]);
}
