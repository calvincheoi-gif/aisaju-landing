import { NextRequest, NextResponse } from "next/server";
import { getAiClient } from "@/lib/ai-client";

export const maxDuration = 26;

const SUPA = "https://urazdkvkanjnquqhnrvo.supabase.co";
const ANON = "sb_publishable_fSG-HqZrC9GVTT5FOprPnA_sDiFoiD2";
const IPCHUN: Record<number, number> = {1930:4,1931:5,1932:5,1933:4,1934:4,1935:5,1936:5,1937:4,1938:4,1939:5,1940:5,1941:4,1942:4,1943:5,1944:5,1945:4,1946:4,1947:4,1948:5,1949:4,1950:4,1951:4,1952:5,1953:4,1954:4,1955:4,1956:5,1957:4,1958:4,1959:4,1960:5,1961:4,1962:4,1963:4,1964:5,1965:4,1966:4,1967:4,1968:5,1969:4,1970:4,1971:4,1972:5,1973:4,1974:4,1975:4,1976:5,1977:4,1978:4,1979:4,1980:5,1981:4,1982:4,1983:4,1984:4,1985:4,1986:4,1987:4,1988:4,1989:4,1990:4,1991:4,1992:4,1993:4,1994:4,1995:4,1996:4,1997:4,1998:4,1999:4,2000:4,2001:4,2002:4,2003:4,2004:4,2005:4,2006:4,2007:4,2008:4,2009:4,2010:4,2011:4,2012:4,2013:4,2014:4,2015:4,2016:4,2017:3,2018:4,2019:4,2020:4,2021:3,2022:4,2023:4,2024:4,2025:3,2026:4,2027:4,2028:4,2029:3,2030:4,2031:4};
const GAN = ["갑","을","병","정","무","기","경","신","임","계"];
const GAN_H = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const JI = ["자","축","인","묘","진","사","오","미","신","유","술","해"];
const JI_H = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const STEM_ELEM = [0,0,1,1,2,2,3,3,4,4];
const BRANCH_ELEM = [4,2,0,0,2,1,1,2,3,3,2,4];
const ELEM = ["목","화","토","금","수"];

function jdn(y: number, m: number, d: number) {
  const a = Math.floor((14 - m) / 12), yy = y + 4800 - a, mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}
function effYear(y: number, m: number, d: number) {
  const ip = IPCHUN[y] ?? 4;
  return m < 2 || (m === 2 && d < ip) ? y - 1 : y;
}
function yearGZ(y: number): [number, number] {
  return [(((y - 4) % 10) + 10) % 10, (((y - 4) % 12) + 12) % 12];
}
function tenGod(me: number, otherStem: number, otherElem: number) {
  const diff = ((otherElem - STEM_ELEM[me]) + 5) % 5;
  const names = [["비견","겁재"],["식신","상관"],["편재","정재"],["편관","정관"],["편인","정인"]];
  const same = otherStem >= 0 ? me % 2 === otherStem % 2 : true;
  return names[diff][same ? 0 : 1];
}
function cors() {
  return {
    "Access-Control-Allow-Origin": "https://popup.aisajulab.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors() });
}

export async function POST(req: NextRequest) {
  try {
    const token = process.env.POPUP_RPC_TOKEN;
    const ai = getAiClient();
    if (!token || !ai) {
      return NextResponse.json({ error: "not-configured" }, { status: 503, headers: cors() });
    }
    const body = await req.json();
    const deviceCode = String(body.device_code || "");
    const birth = String(body.birth_date || "");
    const gender = body.gender === "M" ? "M" : body.gender === "F" ? "F" : "";
    const question = String(body.question || "").trim().slice(0, 50);
    const contact = String(body.contact || "").slice(0, 60);
    const m1 = birth.match(new RegExp("^(\\d{4})-(\\d{2})-(\\d{2})$"));
    if (!deviceCode || !m1 || !gender || !question) {
      return NextResponse.json({ error: "bad-request" }, { status: 400, headers: cors() });
    }
    const by = +m1[1], bm = +m1[2], bd = +m1[3];
    if (by < 1930 || by > 2026) {
      return NextResponse.json({ error: "bad-birth" }, { status: 400, headers: cors() });
    }
    const j = jdn(by, bm, bd);
    const dg = (j + 9) % 10, dz = (j + 1) % 12;
    const kst = new Date(Date.now() + 9 * 3600 * 1000);
    const cy = effYear(kst.getUTCFullYear(), kst.getUTCMonth() + 1, kst.getUTCDate());
    const [cs, cz] = yearGZ(cy);
    const tgS = tenGod(dg, cs, STEM_ELEM[cs]);
    const tgB = tenGod(dg, -1, BRANCH_ELEM[cz]);
    const age = kst.getUTCFullYear() - by;

    const facts = "일간: " + GAN[dg] + GAN_H[dg] + "(" + ELEM[STEM_ELEM[dg]] + "), 일지: " + JI[dz] + JI_H[dz] +
      " / 올해(" + cy + "년) 세운: " + GAN[cs] + JI[cz] + "(" + GAN_H[cs] + JI_H[cz] + ")" +
      " — 세운 천간은 일간의 " + tgS + ", 세운 지지는 " + tgB + " 기운" +
      " / 질문자: " + (gender === "M" ? "남성" : "여성") + ", 만 " + age + "세 전후";

    const system = "너는 최형철 사주명리 연구소의 AI 삿갓이다. 자평진전 기반 명리 해석을 하되, 아래 원칙을 반드시 지켜라: " +
      "1) 운명 단정 금지, 공포 조장 금지, 과장 금지. 가능성과 방향만 제시. " +
      "2) MZ세대에게 친근한 구어체(현타, 각, 존버 같은 표현 가볍게 활용 가능하되 품위 유지). " +
      "3) 제공된 사주 데이터(일간, 세운, 십성)만 근거로 사용하고 새로운 사주 계산을 하지 마라. " +
      "4) 건강 관련 질문이면 마지막에 '사주 풀이는 의학적 진단이 아니며 건강 이상은 의료 전문가와 상담하세요' 취지의 문장을 넣어라. " +
      "5) 반드시 JSON만 출력: {\"intro\":\"서론(공감+사주 근거 도입)\",\"main\":\"본론(십성 구도 해석+구체 행동 제안)\",\"insight\":\"결론(방향 정리, 선택의 주도권은 본인에게 있음을 상기)\"} " +
      "6) intro+main+insight 합계 500자 이내. 코드블록 없이 순수 JSON만.";

    const userMsg = "질문: " + question + "\n사주 데이터: " + facts;

    const resp = await (ai.client as any).messages.create({
      model: ai.model,
      max_tokens: 900,
      system: system,
      messages: [{ role: "user", content: userMsg }],
    });
    let text = "";
    for (const blk of resp.content) if (blk.type === "text") text += blk.text;
    text = text.replace(/\u0060{3}[a-z]*/g, "").trim();
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    const answer = {
      intro: String(parsed.intro || "").slice(0, 250),
      main: String(parsed.main || "").slice(0, 350),
      insight: String(parsed.insight || "").slice(0, 250),
    };
    const chars = answer.intro.length + answer.main.length + answer.insight.length;

    const save = await fetch(SUPA + "/rest/v1/rpc/popup_submit_answered", {
      method: "POST",
      headers: { apikey: ANON, Authorization: "Bearer " + ANON, "Content-Type": "application/json" },
      body: JSON.stringify({
        p_token: token, p_device_code: deviceCode, p_birth: birth, p_gender: gender,
        p_question: question, p_contact: contact, p_answer: answer, p_chars: chars,
      }),
    });
    const qid = save.ok ? await save.json() : null;
    return NextResponse.json({ id: qid, answer: answer, chars: chars }, { headers: cors() });
  } catch (e) {
    return NextResponse.json({ error: "server-error" }, { status: 500, headers: cors() });
  }
}
