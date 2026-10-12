"use client";

import { useEffect, useState } from "react";
import type { Worry, ResultKey } from "@/lib/worries/types";
import { resultKey } from "@/lib/worries/types";
import { track } from "@/lib/worries/links";
import WorryCheck from "./WorryCheck";
import WorryResult from "./WorryResult";
import WorrySajuLens from "./WorrySajuLens";
import WorryNextStep from "./WorryNextStep";

/**
 * 체크 → 결과 → 사주로 더 보면 → 다음 단계 를 잇는 조립 블록.
 * 결과가 나오기 전에는 「바로 질문하기」 작은 링크만 보여 줘, 체크를 먼저 하도록 이끈다.
 *
 * 계측(events): q_view · q_answer(step, choice) · q_result(key, total) · q_cta_ask · q_cta_ohaeng · q_skip
 */
export default function WorryLanding({ w }: { w: Worry }) {
  const [res, setRes] = useState<{ key: ResultKey; total: number } | null>(null);

  useEffect(() => { track("q_view", { slug: w.slug }); }, [w.slug]);

  function done(total: number) {
    const key = resultKey(total);
    setRes({ key, total });
    track("q_result", { slug: w.slug, key, total });
    setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  }

  return (
    <>
      <WorryCheck w={w} onAnswer={(step, choice) => track("q_answer", { slug: w.slug, step, choice })} onDone={done} />

      {!res && (
        <p className="mt-3 text-center text-[12.5px] text-[#64748B]">
          체크는 건너뛰고 바로 묻고 싶다면?{" "}
          <a href="#next" onClick={() => track("q_skip", { slug: w.slug })} className="font-bold text-[#2563EB] underline underline-offset-2">
            무료 1문 1답으로
          </a>
        </p>
      )}

      {res && <WorryResult r={w.results[res.key]} />}
      {res && <WorrySajuLens text={w.sajuLens} />}

      <div id="next" className={res ? "" : "mt-6 opacity-95"}>
        <WorryNextStep w={w} resultTag={res ? w.results[res.key].tag : undefined} />
      </div>
    </>
  );
}
