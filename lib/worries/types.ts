/**
 * 고민 랜딩(/q/[slug]) 데이터 형식 — 2026-10-11
 *
 * 한 줄(=고민 1개)이 페이지 1개가 된다. 화면 코드는 건드리지 않고
 * data.ts 에 한 줄을 더하면 새 고민 페이지가 생긴다.
 * 원본 관리는 엑셀 「고민랜딩_데이터시트」 → data.ts 로 옮겨 적는다.
 *
 * 체크 3문항은 각 보기가 0·1·2점. 합계(0~6)로 결과 3유형(A·B·C)을 고른다.
 *   A: 0~2점 · B: 3~4점 · C: 5~6점  (경계는 RESULT_CUTS 에서 한 번에 조정)
 */

export type WorryOption = { label: string; score: 0 | 1 | 2 };

export type WorryQuestion = { q: string; options: [WorryOption, WorryOption, WorryOption] };

export type WorryResult = {
  /** 결과 카드 상단 작은 라벨 (예: "타이밍형") */
  tag: string;
  /** 결과 한 줄 — 단정형 금지, 상태 서술형 */
  headline: string;
  /** 설명 2줄 */
  body: string;
  /** 바로 해볼 것 3가지 */
  points: [string, string, string];
};

export type Worry = {
  /** 주소 꼬리 — 영문 소문자·하이픈 (예: quit → aisajulab.com/q/quit) */
  slug: string;
  /** 엑셀 「고객 고민 제목 44」의 실험 우선순위 번호 */
  no: number;
  /** 분야 (연애·취업·이직 …) — 목록 묶음과 칩 라벨 */
  category: string;
  emoji: string;
  /** 대상·상황 */
  target: string;
  /** 훅 제목 (게시글 제목 그대로) */
  title: string;
  /** 제목 아래 한 줄 */
  sub: string;
  /** 검색·카톡 미리보기 설명 */
  metaDesc: string;
  /** "이런 마음이죠?" 공감 3줄 */
  empathy: [string, string, string];
  /** 30초 체크 3문항 */
  questions: [WorryQuestion, WorryQuestion, WorryQuestion];
  results: { A: WorryResult; B: WorryResult; C: WorryResult };
  /** 「사주로 더 보면」 — 전문가가 1문 1답에서 무엇을 보는지 */
  sajuLens: string;
  /** 1문 1답 질문 칸에 미리 채울 문장 */
  askPrefill: string;
  /** 페이지별 추가 안내(선택) — 예: 궁합의 상대 정보 동의 문구 */
  note?: string;
  /** 하단 「이런 고민도 있어요」 */
  related: string[];
  /** 게시 여부 — false 면 목록·사이트맵에서 빠지고 주소로도 열리지 않음 */
  live: boolean;
};

export type ResultKey = "A" | "B" | "C";

/** 합계 점수 → 결과 유형. 경계를 바꾸려면 여기만 고친다. */
export const RESULT_CUTS = { A: 2, B: 4 } as const;

export function resultKey(total: number): ResultKey {
  if (total <= RESULT_CUTS.A) return "A";
  if (total <= RESULT_CUTS.B) return "B";
  return "C";
}
