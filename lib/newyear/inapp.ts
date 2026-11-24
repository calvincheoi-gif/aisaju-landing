/**
 * 인앱 브라우저(카카오톡·인스타·네이버 등) 대응.
 *
 * 카카오톡 안 브라우저는 화면에서 만든 파일(blob:)을 내려받지 못한다 —
 * 「다운로드를 시작합니다」 뒤 「지원하지 않는 파일 형식입니다」로 끝난다(2026-11-24 소장님 폰에서 확인).
 * 그래서 저장 단추를 누르면 기본 브라우저(크롬·사파리)로 같은 주소를 열어 거기서 저장하게 한다.
 *   · 카카오톡: kakaotalk://web/openExternal?url=…  (안드로이드·아이폰 모두)
 *   · 그 밖의 인앱(안드로이드): intent:// 로 크롬을 연다
 *   · 그 밖의 인앱(아이폰): 강제로 열 방법이 없다 → 그림을 화면에 띄워 길게 눌러 저장하게 한다
 */
export type InAppKind = "kakao" | "other" | null;

export function inAppKind(ua: string = typeof navigator === "undefined" ? "" : navigator.userAgent): InAppKind {
  if (/KAKAOTALK/i.test(ua)) return "kakao";
  if (/Instagram|NAVER\(inapp|FBAN|FBAV|FB_IAB|Line\/|DaumApps|Whale\/.*inapp|everytimeApp|BAND\//i.test(ua)) return "other";
  return null;
}

export function isAndroid(ua: string = typeof navigator === "undefined" ? "" : navigator.userAgent) {
  return /Android/i.test(ua);
}

/** 기본 브라우저로 주소를 연다. 열 방법이 없으면 false */
export function openExternal(url: string): boolean {
  const kind = inAppKind();
  if (kind === "kakao") {
    window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(url)}`;
    return true;
  }
  if (kind === "other" && isAndroid()) {
    const bare = url.replace(/^https?:\/\//, "");
    window.location.href = `intent://${bare}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url)};end`;
    return true;
  }
  return false;
}

/** 주소에 저장 안내 표시(?save=png|pdf)를 붙인다 — 기본 브라우저에서 열리면 그 단추를 강조한다 */
export function withSaveHint(href: string, kind: "png" | "pdf"): string {
  const u = new URL(href);
  u.searchParams.set("save", kind);
  return u.toString();
}
