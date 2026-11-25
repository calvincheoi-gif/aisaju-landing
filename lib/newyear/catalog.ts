/**
 * 2027 새해운 — 상품 5종 (확정 사항: 이름·가격·형식·장수).
 *
 * 가격·장수·형식은 인수인계 문서(2026-11-23)의 확정값이다. 임의로 바꾸지 않는다.
 * 결제·전달 방식(pay)만 운영 결정에 따라 바뀔 수 있어 한곳에 모아 두었다:
 *   free    결제 없음 — 신청 즉시 생성
 *   claim   송금 후 「입금 완료」 → 관리자가 입금 확인하면 그때 바로 생성(2026-11-26~, NY_AUTO_ON_CLAIM=1이면 옛 방식: 누르면 바로 생성)
 *   confirm 소장님이 입금을 확인한 뒤 초안 → 감수 → 승인 후 전달
 */
import type { TemplateKey } from "./render/spec";

export type ProductKey = TemplateKey;
export type PayMode = "free" | "claim" | "confirm";
export type Need = "question" | "birth" | "time" | "gender" | "name" | "contact" | "place" | "concern";

export interface Product {
  key: ProductKey;
  no: string;
  family: "iching" | "tojeong" | "saju";
  name: string;
  tagline: string;
  price: number;
  format: string;
  pages: number;
  kind: "card" | "detail";
  pay: PayMode;
  /** 소장님 감수 후 전달하는 상품인가 */
  review: boolean;
  needs: Need[];
  points: string[];
  /** 결과 화면에서 이어서 안내할 상품 */
  next?: ProductKey;
}

export const NEWYEAR = { year: 2027, ganji: "丁未", ganjiKo: "정미년", path: "/2027" };

export const PRODUCTS: Product[] = [
  {
    key: "iching-card", no: "①", family: "iching", name: "주역 새해 방향 카드", tagline: "질문으로 여는 한 해",
    price: 0, format: "스마트폰 세로 한 장 · PNG·PDF", pages: 1, kind: "card", pay: "free", review: false,
    needs: ["question"],
    points: ["질문 하나에 괘 하나", "올해의 방향 · 힘을 실을 것 · 멈출 것", "나의 첫 행동 한 줄"],
    next: "saju-card",
  },
  {
    key: "tojeong-card", no: "②", family: "tojeong", name: "토정비결 한 장 요약", tagline: "새해 신수를 한눈에",
    price: 990, format: "스마트폰 세로 한 장 · PNG·PDF", pages: 1, kind: "card", pay: "claim", review: false,
    needs: ["birth"],
    points: ["2027 총운 한 문장", "음력 12개월 키워드와 실천", "올해의 한 문장"],
    next: "tojeong-detail",
  },
  {
    key: "saju-card", no: "③", family: "saju", name: "사주명리 한 장 요약", tagline: "나의 기질로 읽는 한 해",
    price: 990, format: "스마트폰 세로 한 장 · PNG·PDF", pages: 1, kind: "card", pay: "claim", review: false,
    needs: ["birth", "time", "gender"],
    points: ["일간과 태어난 계절", "절기 12개월 키워드와 실천", "올해의 한 문장"],
    next: "saju-premium",
  },
  {
    key: "tojeong-detail", no: "④", family: "tojeong", name: "토정비결 상세본", tagline: "총운 · 상반기 · 하반기 · 인사이트",
    price: 2990, format: "A4 세로 4쪽 · PDF", pages: 4, kind: "detail", pay: "confirm", review: true,
    needs: ["name", "birth", "contact"],
    points: ["총운과 한 해의 큰 흐름", "음력 12개월 흐름·해석·실천", "선택 기준과 첫 실천"],
  },
  {
    key: "saju-premium", no: "⑤", family: "saju", name: "사주명리 2027 새해운 프리미엄", tagline: "명식 · 대운과 세운 · 분야별 · 12개월 · 실행",
    price: 19900, format: "16:9 가로 15쪽 · PDF", pages: 15, kind: "detail", pay: "confirm", review: true,
    needs: ["name", "birth", "time", "gender", "place", "contact", "concern"],
    points: ["명식 여덟 글자와 오행의 균형", "대운 속 2026·2027·2028", "일·재물·관계·생활 + 12개월 + 실행 계획"],
  },
];

export function getProduct(key: string): Product | undefined {
  return PRODUCTS.find((p) => p.key === key);
}

export const won = (v: number) => (v === 0 ? "무료" : `${v.toLocaleString("ko-KR")}원`);
