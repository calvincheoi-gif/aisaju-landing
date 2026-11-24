/**
 * 카카오톡·문자·SNS 공유 미리보기 그림 — 한 곳에서 관리한다.
 *
 * 하위 페이지에서 openGraph 를 따로 적으면 images 가 부모(layout)에서 이어지지 않는다.
 * 그때 카톡이 페이지 안에서 아무 그림(오행 카드 줄 등)이나 골라 쓰므로,
 * openGraph 를 쓰는 페이지는 반드시 images: OG_IMAGES 를 함께 넣는다.
 *
 * 정사각(1:1) — 카톡에서 아담한 썸네일로 보인다.
 * 그림을 바꾸면 파일 이름도 바꾼다(카톡이 같은 주소의 옛 그림을 한동안 물고 있음).
 * 그래도 옛 그림이 보이면: https://developers.kakao.com/tool/debugger/sharing 에서 캐시 삭제.
 */
export const OG_BRAND = {
  url: "/og-brand-sq.jpg",
  width: 800,
  height: 800,
  alt: "AI사주랩 — AIsajuLab.com",
};

/** 소장님 얼굴이 함께 나오는 판 — 상담 신청처럼 '사람'이 신뢰를 주는 곳에 쓴다 */
export const OG_BRAND_CHOI = {
  url: "/og-brand-choi-sq.jpg",
  width: 800,
  height: 800,
  alt: "사주보는 경영지도사 AI사주랩 최형철",
};

export const OG_IMAGES = [OG_BRAND];
