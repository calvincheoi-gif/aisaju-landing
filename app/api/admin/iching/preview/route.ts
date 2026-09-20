import { NextResponse } from "next/server";
import { addDays, kstDate, selectDailyIching } from "@/lib/iching";

/**
 * 선정 엔진 미리보기 — DB에 쓰지 않고 계산 결과만 돌려준다(검증용).
 *   GET /api/admin/iching/preview?from=2026-09-21&days=7
 *   헤더 x-admin-password 필요
 */
export const dynamic = "force-dynamic";

function checkPassword(provided: string | null) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return provided === expected;
}

export async function GET(req: Request) {
  if (!checkPassword(req.headers.get("x-admin-password"))) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }
  const url = new URL(req.url);
  const from = url.searchParams.get("from") ?? kstDate(1);
  const days = Math.min(Math.max(Number(url.searchParams.get("days") ?? 7), 1), 62);
  try {
    const rows = Array.from({ length: days }, (_, i) => {
      const s = selectDailyIching(addDays(from, i));
      return {
        date: s.date,
        dayGanji: s.dayGanji,
        monthBranch: s.monthBranch,
        isJeolip: s.isJeolip,
        hexagram: `${s.hexagram.no} ${s.hexagram.full_ko}(${s.hexagram.full_hanja})`,
        line: `${s.line.pos}효 ${s.line.name}`,
        energyState: s.energyState,
        tone: s.tone,
        reason: s.reason,
      };
    });
    return NextResponse.json({ engineVersion: rows.length ? selectDailyIching(from).engineVersion : "", rows });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
