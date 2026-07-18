import { siteConfig } from "@/lib/site-config";

const CHANNELS = [
  { label: "당근 비즈프로필", href: siteConfig.channels.daangn },
  { label: "네이버 블로그", href: siteConfig.channels.naverBlog },
  { label: "카카오톡 채널", href: siteConfig.channels.kakaoChannel },
  { label: "인스타그램", href: siteConfig.channels.instagram },
  { label: "명리학 Self-study 카페", href: siteConfig.channels.cafe },
];

export default function Channels() {
  return (
    <section id="channels" className="bg-bg-alt">
      <div className="section">
        <div className="mb-10 text-center">
          <span className="eyebrow">Channels</span>
          <h2 className="mt-3 text-[28px] font-bold tracking-[-0.02em] text-ink-900">
            기존 채널에서도 만나보세요
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {CHANNELS.map((c) => (
            <a key={c.label} href={c.href} className="btn-ghost bg-white">
              {c.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
