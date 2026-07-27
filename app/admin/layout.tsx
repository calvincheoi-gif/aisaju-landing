import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "관리자 | AI사주 Lab",
  robots: { index: false, follow: false },
};

const ADMIN_NAV = [
  { label: "상담 신청 내역", href: "/admin" },
  { label: "상담 사례 관리", href: "/admin/cases" },
  { label: "가격 관리", href: "/admin/pricing" },
  { label: "Q&A 관리", href: "/admin/qna" },
];

/**
 * 모든 /admin/* 하위 페이지에 공통으로 표시되는 관리자 내비게이션.
 * 상담 신청 내역(/admin)은 Supabase 계정 로그인이 필요하고,
 * 상담 사례/가격/Q&A 관리는 공용 관리자 비밀번호(ADMIN_PASSWORD)로 보호됩니다.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav className="flex flex-wrap gap-2 border-b border-border bg-bg-alt px-6 py-3">
        {ADMIN_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-pill bg-white px-3 py-1.5 text-[13px] font-medium text-body shadow-1 hover:text-indigo-600"
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/"
          className="ml-auto rounded-pill px-3 py-1.5 text-[13px] font-medium text-body hover:text-indigo-600"
        >
          ← 홈으로
        </Link>
      </nav>
      {children}
    </div>
  );
}
