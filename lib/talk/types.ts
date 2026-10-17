/** 「오늘 한 줄」 — 홈 1줄 소통 (2026-10-17) 공통 타입 */

/** 화면에 보여 주는 글 (게시된 것만) */
export interface TalkItem {
  id: string;
  created_at: string;
  text: string;
  nick: string;      // 없으면 "익명" (DB 뷰 talk_public 이 채워 준다)
}

export const TALK_MAX_LEN = 40;      // 한 줄 롤링에 들어가는 길이
export const TALK_NICK_MAX = 10;
export const TALK_HOME_N = 10;       // 홈 롤링은 최신 10개까지
export const TALK_DAILY_LIMIT = 3;   // 같은 기기 하루 3개 (DB 함수와 같은 값 — 안내 문구용)
