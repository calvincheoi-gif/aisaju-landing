/** 「오늘 한 줄」 — 화면(HTML/CSS)·동작 모듈 공개 창구 (서버 모듈은 ./server 에서 직접 import) */
export { talkBlockHtml, talkAgo, TALK_CSS } from "./view";
export { mountTalk } from "./client";
export type { TalkItem } from "./types";
export { TALK_MAX_LEN, TALK_NICK_MAX, TALK_HOME_N, TALK_DAILY_LIMIT } from "./types";
