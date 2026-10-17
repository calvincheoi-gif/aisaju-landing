/**
 * 「오늘 한 줄」 화면 모듈 — 홈 1줄 블록의 HTML·CSS (2026-10-17)
 * HomeV6 는 talkBlockHtml() 결과를 <!--TALK_SLOT--> 자리에 끼워 넣기만 한다.
 *
 *   · 글 0개 → "첫 한 줄을 남겨 보세요" 한 줄 (블록은 항상 보인다 — 비어 있어도 입구는 있어야 한다)
 *   · 글 1개 → 그대로
 *   · 글 2개 이상 → 고민 주제 롤링과 같은 방식으로 한 줄씩 위로 순환 (최신 10개)
 *   · 긴 글(칸보다 길면)은 그 줄이 보이는 동안 왼쪽으로 흘러 40자를 다 보여 준다 — client.ts
 *   · 한 줄 끝 「+ 한 줄 남기기」 → /talk (작성 + 전체 누적 목록). 홈 줄에는 닉네임만, 시각은 /talk 에서
 */
import type { TalkItem } from "./types";

function esc(s: string) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}

/** "방금 · 12분 전 · 3시간 전 · 어제 · 10/15" — 서버 렌더라 KST 기준으로 계산 */
export function talkAgo(iso: string, now = Date.now()): string {
  const t = new Date(iso).getTime();
  const m = Math.max(0, Math.round((now - t) / 60000));
  if (m < 1) return "방금";
  if (m < 60) return `${m}분 전`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.round(h / 24);
  if (d === 1) return "어제";
  if (d < 7) return `${d}일 전`;
  const dt = new Date(t + 9 * 3600 * 1000);
  return `${dt.getUTCMonth() + 1}/${dt.getUTCDate()}`;
}

export const TALK_ROW_H = 38;

export function talkBlockHtml(items: TalkItem[] | null | undefined): string {
  const list = (items || []).slice(0, 10);
  const btn = `<span class="tgo">＋ 한 줄 남기기</span>`;
  const li = (t: TalkItem) =>
    `<li><a href="/talk?utm=home_talk" data-talk="${esc(t.id)}"><span class="tq">💬</span><span class="tx"><span class="txi">${esc(t.text)}</span></span><span class="tn">${esc(t.nick)}</span>${btn}</a></li>`;
  if (list.length === 0) {
    return `<div class="talk" id="talk" data-n="0" data-roll="0" aria-label="오늘 한 줄"><ul id="talk-ul"><li><a href="/talk?utm=home_talk" data-talk="new"><span class="tq">💬</span><span class="tx"><span class="txi">오늘 한 줄 — 첫 한 줄을 남겨 보세요</span></span>${btn}</a></li></ul></div>`;
  }
  const roll = list.length > 1;
  const rows = roll ? [...list, list[0]] : list;   /* 끝에 첫 줄을 한 번 더 붙여 끊김 없이 순환 */
  return `<div class="talk" id="talk" data-n="${list.length}" data-roll="${roll ? 1 : 0}" aria-label="오늘 한 줄"><ul id="talk-ul">${rows.map(li).join("")}</ul></div>`;
}

export const TALK_CSS = `
.talk{position:relative;margin:0 0 8px;height:${TALK_ROW_H}px;overflow:hidden;border-radius:12px;background:#EEF3FF;border:1.5px solid rgba(37,99,235,.22)}
.talk ul{list-style:none;margin:0;padding:0;will-change:transform}
.talk ul.anim{transition:transform .42s cubic-bezier(.4,0,.2,1)}
.talk li{height:${TALK_ROW_H}px}
.talk a{display:flex;align-items:center;gap:5px;height:${TALK_ROW_H}px;padding:0 5px 0 9px;text-decoration:none;color:var(--navy)}
.talk a:active{background:rgba(37,99,235,.06)}
.talk .tq{flex:none;font-size:14px}
.talk .tx{flex:1;min-width:0;overflow:hidden;white-space:nowrap;line-height:1.2;text-align:left}
.talk .txi{display:inline-block;font-size:14px;font-weight:800;letter-spacing:-.03em;color:#1D4ED8;white-space:nowrap;will-change:transform}
.talk .txi.flow{transition:transform var(--flow-t,4s) linear;transform:translateX(var(--flow-x,0))}
.talk .tn{flex:none;max-width:52px;font-size:10.5px;font-weight:600;color:#64748B;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.talk .tgo{flex:none;font-size:12px;font-weight:900;color:#fff;background:var(--blue);border-radius:999px;padding:6px 9px;letter-spacing:-.02em;box-shadow:0 2px 6px rgba(37,99,235,.28);white-space:nowrap}
.talk .tx *,.talk .tn *,.talk .tgo{white-space:nowrap;text-wrap:nowrap}
`;
