/**
 * 홈 「바로가기 6칸」·「전체 메뉴(≡)」 모듈 공개 창구 (v7, 2026-11-20)
 *   items.ts  무엇을 올릴지(이름·순서·아이콘)   ← 바꿀 일이 있으면 대개 여기만
 *   i18n.ts   영·일·중·불 문구
 *   view.ts   HTML · CSS
 *   client.ts 눌렀을 때의 이동 · 기록
 */
export { quickBlockHtml, navSheetHtml, NAV_CSS } from "./view";
export { mountHomeNav } from "./client";
export type { HomeNavHandle } from "./client";
export { NAV_I18N } from "./i18n";
export { QUICK, QUICK_LINKS, MENU } from "./items";
export type { NavTo, QuickItem, QuickLink, MenuItem, MenuGroup } from "./items";
