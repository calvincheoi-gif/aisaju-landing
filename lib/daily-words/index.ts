/** 촌철활인 한마디 — 화면(HTML/CSS)·동작 모듈 공개 창구 (서버 모듈은 ./server 에서 직접 import) */
export { wordsBlockHtml, WORDS_CSS } from "./view";
export { mountDailyWords } from "./client";
export type { DailyWord, WordElement } from "./types";
