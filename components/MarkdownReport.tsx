/**
 * AI가 생성한 리포트(간단한 마크다운: ## 헤더 + 문단)를 렌더링합니다.
 * 별도 마크다운 라이브러리 없이 가벼운 파서로 처리합니다.
 */
export default function MarkdownReport({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).filter((b) => b.trim().length > 0);

  return (
    <div className="space-y-5">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (trimmed.startsWith("## ")) {
          const [heading, ...rest] = trimmed.split("\n");
          return (
            <div key={i}>
              <h3 className="mb-2 text-[16px] font-bold text-indigo-600">
                {heading.replace(/^##\s*/, "")}
              </h3>
              {rest.length > 0 && (
                <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink-700">
                  {rest.join("\n")}
                </p>
              )}
            </div>
          );
        }
        return (
          <p key={i} className="whitespace-pre-line text-[15px] leading-relaxed text-ink-700">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}
