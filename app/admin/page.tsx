"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { formatKrw } from "@/lib/pricing";

type Status = "received" | "in_progress" | "completed";
type PaymentStatus = "pending" | "confirmed";

interface Consultation {
  id: string;
  name: string;
  gender: string | null;
  birth_info: string | null;
  contact: string | null;
  customer_type: "general" | "member";
  application_mode: "simple" | "detail";
  package_key: string | null;
  purposes: string[] | null;
  addons: string[] | null;
  concern: string | null;
  estimated_price: number | null;
  status: Status | null;
  payment_method: "bank" | "kakaopay" | null;
  payment_status: PaymentStatus | null;
  discount_rate: number | null;
  discount_source: "auto" | "manual" | "admin_adjusted" | "none" | null;
  expert_note: string | null;
  created_at: string;
  completed_at: string | null;
}

interface MembershipTier {
  id: number;
  name: string;
  discount_rate: number;
}

interface Member {
  id: string;
  phone: string;
  name: string | null;
  tier_id: number;
  note: string | null;
}

const STATUS_LABELS: Record<Status, string> = {
  received: "접수",
  in_progress: "진행중",
  completed: "완료",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bank: "계좌이체",
  kakaopay: "카카오페이",
};

const DISCOUNT_SOURCE_LABELS: Record<string, string> = {
  auto: "자동조회(회원등급)",
  manual: "고객 직접입력",
  admin_adjusted: "관리자 조정",
  none: "미확정",
};

const FILTERS: { key: "all" | Status; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "received", label: "접수" },
  { key: "in_progress", label: "진행중" },
  { key: "completed", label: "완료" },
];

const inputClass =
  "w-full rounded-sm border border-border bg-white px-3 py-2 text-[13px] text-ink-900 outline-none focus:border-indigo-600";
const selectClass =
  "rounded-sm border border-border bg-white px-2 py-1.5 text-[13px] text-ink-900 outline-none focus:border-indigo-600";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});
  const [draftPricing, setDraftPricing] = useState<Record<string, { rate: string; price: string }>>({});

  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [phoneQuery, setPhoneQuery] = useState("");
  const [memberResult, setMemberResult] = useState<Member | null | "not_found">(null);
  const [memberSearching, setMemberSearching] = useState(false);
  const [memberSaving, setMemberSaving] = useState(false);
  const [memberDraft, setMemberDraft] = useState<{ name: string; tier_id: number; note: string }>({
    name: "",
    tier_id: 1,
    note: "",
  });

  const loadConsultations = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("consultations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      setLoadError(error.message);
    } else {
      setConsultations((data as Consultation[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/admin/login");
        return;
      }
      setUserEmail(data.user.email ?? null);
      setAuthChecked(true);
    });
  }, [router]);

  useEffect(() => {
    if (!authChecked) return;
    loadConsultations();
    const supabase = getSupabaseBrowserClient();
    supabase
      .from("membership_tiers")
      .select("*")
      .order("id", { ascending: true })
      .then(({ data }) => {
        if (data) setTiers(data as MembershipTier[]);
      });
  }, [authChecked, loadConsultations]);

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  async function handleSave(c: Consultation, changes: Partial<Consultation>) {
    setSavingId(c.id);
    const supabase = getSupabaseBrowserClient();
    const payload: Partial<Consultation> = { ...changes };
    if (changes.status === "completed" && c.status !== "completed") {
      payload.completed_at = new Date().toISOString();
    }
    const { error } = await supabase.from("consultations").update(payload).eq("id", c.id);
    if (!error) {
      setConsultations((prev) =>
        prev.map((item) => (item.id === c.id ? { ...item, ...payload } : item))
      );
    } else {
      alert("저장 실패: " + error.message);
    }
    setSavingId(null);
  }

  async function handleSearchMember() {
    const phone = phoneQuery.trim();
    if (!phone) return;
    setMemberSearching(true);
    setMemberResult(null);
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("phone", phone)
      .maybeSingle();
    if (error) {
      alert("조회 실패: " + error.message);
      setMemberSearching(false);
      return;
    }
    if (data) {
      setMemberResult(data as Member);
      setMemberDraft({
        name: (data as Member).name ?? "",
        tier_id: (data as Member).tier_id,
        note: (data as Member).note ?? "",
      });
    } else {
      setMemberResult("not_found");
      setMemberDraft({ name: "", tier_id: 2, note: "" });
    }
    setMemberSearching(false);
  }

  async function handleSaveMember() {
    const phone = phoneQuery.trim();
    if (!phone) return;
    setMemberSaving(true);
    const supabase = getSupabaseBrowserClient();
    if (memberResult && memberResult !== "not_found") {
      const { error } = await supabase
        .from("members")
        .update({
          name: memberDraft.name || null,
          tier_id: memberDraft.tier_id,
          note: memberDraft.note || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", memberResult.id);
      if (error) {
        alert("저장 실패: " + error.message);
      } else {
        alert("등급 정보가 저장되었습니다.");
      }
    } else {
      const { error } = await supabase.from("members").insert({
        phone,
        name: memberDraft.name || null,
        tier_id: memberDraft.tier_id,
        note: memberDraft.note || null,
      });
      if (error) {
        alert("등록 실패: " + error.message);
      } else {
        alert("신규 회원으로 등록되었습니다.");
        handleSearchMember();
      }
    }
    setMemberSaving(false);
  }

  if (!authChecked) {
    return (
      <main className="mx-auto max-w-content px-6 py-20 text-center text-[14px] text-body">
        로그인 확인 중...
      </main>
    );
  }

  const filtered =
    filter === "all" ? consultations : consultations.filter((c) => c.status === filter);

  const counts = {
    all: consultations.length,
    received: consultations.filter((c) => c.status === "received").length,
    in_progress: consultations.filter((c) => c.status === "in_progress").length,
    completed: consultations.filter((c) => c.status === "completed").length,
  };

  return (
    <main className="mx-auto max-w-content px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-ink-900">AI사주 Lab 관리자</h1>
          <p className="mt-1 text-[13px] text-body">{userEmail}로 로그인됨</p>
        </div>
        <button className="btn-ghost" onClick={handleLogout}>
          로그아웃
        </button>
      </div>

      <section className="card mb-8">
        <h2 className="text-[16px] font-semibold text-ink-900">회원 등급 관리</h2>
        <p className="mt-1 text-[13px] text-body">
          전화번호로 단골 여부와 등급을 조회·등록합니다. (신청서와 별개로 관리자가 직접 관리)
        </p>
        <div className="mt-4 flex gap-2">
          <input
            className={inputClass}
            placeholder="전화번호 (예: 010-1234-5678)"
            value={phoneQuery}
            onChange={(e) => setPhoneQuery(e.target.value)}
          />
          <button className="btn-secondary shrink-0" onClick={handleSearchMember} disabled={memberSearching}>
            {memberSearching ? "조회 중..." : "조회"}
          </button>
        </div>

        {memberResult !== null && (
          <div className="mt-4 rounded-md border border-border p-4">
            <p className="text-[13px] font-medium text-ink-900">
              {memberResult === "not_found" ? "등록되지 않은 번호입니다. 신규 등록할 수 있습니다." : "기존 회원 정보"}
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-[12px] text-body">이름</label>
                <input
                  className={inputClass}
                  value={memberDraft.name}
                  onChange={(e) => setMemberDraft((d) => ({ ...d, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-[12px] text-body">등급</label>
                <select
                  className={selectClass + " w-full"}
                  value={memberDraft.tier_id}
                  onChange={(e) => setMemberDraft((d) => ({ ...d, tier_id: Number(e.target.value) }))}
                >
                  {tiers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({Math.round(Number(t.discount_rate) * 100)}% 할인)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[12px] text-body">메모</label>
                <input
                  className={inputClass}
                  value={memberDraft.note}
                  onChange={(e) => setMemberDraft((d) => ({ ...d, note: e.target.value }))}
                />
              </div>
            </div>
            <button
              className="btn-primary mt-4"
              onClick={handleSaveMember}
              disabled={memberSaving}
            >
              {memberSaving ? "저장 중..." : memberResult === "not_found" ? "신규 등록" : "등급 저장"}
            </button>
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`rounded-pill px-4 py-1.5 text-[13px] font-medium ${
                filter === f.key ? "bg-indigo-600 text-white" : "bg-bg-alt text-ink-700"
              }`}
              onClick={() => setFilter(f.key)}
            >
              {f.label} ({counts[f.key]})
            </button>
          ))}
          <button className="btn-ghost ml-auto text-[13px]" onClick={loadConsultations}>
            새로고침
          </button>
        </div>

        {loading && <p className="text-[13px] text-body">불러오는 중...</p>}
        {loadError && <p className="text-[13px] text-red-600">불러오기 실패: {loadError}</p>}

        {!loading && !loadError && filtered.length === 0 && (
          <p className="text-[13px] text-body">해당 조건의 신청 내역이 없습니다.</p>
        )}

        <div className="space-y-3">
          {filtered.map((c) => {
            const expanded = expandedId === c.id;
            return (
              <div key={c.id} className="card">
                <button
                  className="flex w-full items-center justify-between text-left"
                  onClick={() => setExpandedId(expanded ? null : c.id)}
                >
                  <div>
                    <p className="text-[14px] font-semibold text-ink-900">
                      {c.name}{" "}
                      <span className="ml-1 text-[12px] font-normal text-body">
                        {c.customer_type === "member" ? "단골" : "일반"} ·{" "}
                        {c.application_mode === "detail" ? "디테일" : "간편"}
                      </span>
                    </p>
                    <p className="mt-1 text-[12px] text-body">
                      {c.contact} · {new Date(c.created_at).toLocaleString("ko-KR")}
                      {c.customer_type === "member" && (c.discount_rate ?? 0) > 0 && (
                        <> · 할인 {Math.round((c.discount_rate ?? 0) * 100)}%</>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-semibold text-ink-900">
                      {formatKrw(c.estimated_price ?? 0)}
                    </span>
                    <span className="rounded-pill bg-bg-alt px-3 py-1 text-[12px] text-ink-700">
                      {STATUS_LABELS[c.status ?? "received"]}
                    </span>
                  </div>
                </button>

                {expanded && (
                  <div className="mt-4 space-y-4 border-t border-border pt-4">
                    <div className="grid gap-3 text-[13px] md:grid-cols-2">
                      <p>
                        <span className="text-body">성별:</span> {c.gender === "female" ? "여성" : "남성"}
                      </p>
                      <p>
                        <span className="text-body">생년월일시:</span> {c.birth_info}
                      </p>
                      <p>
                        <span className="text-body">패키지:</span> {c.package_key ?? "-"}
                      </p>
                      <p>
                        <span className="text-body">목적/옵션:</span>{" "}
                        {[...(c.purposes ?? []), ...(c.addons ?? [])].join(", ") || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-[12px] text-body">고민 내용</p>
                      <p className="rounded-sm bg-bg-alt p-3 text-[13px] text-ink-900">{c.concern}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label className="text-[12px] text-body">상태</label>
                        <select
                          className={selectClass}
                          value={c.status ?? "received"}
                          onChange={(e) => handleSave(c, { status: e.target.value as Status })}
                        >
                          {Object.entries(STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-[12px] text-body">결제방법</label>
                        <span className="text-[13px] text-ink-900">
                          {c.payment_method ? PAYMENT_METHOD_LABELS[c.payment_method] ?? c.payment_method : "-"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-[12px] text-body">입금확인</label>
                        <select
                          className={selectClass}
                          value={c.payment_status ?? "pending"}
                          onChange={(e) =>
                            handleSave(c, { payment_status: e.target.value as PaymentStatus })
                          }
                        >
                          <option value="pending">미확인</option>
                          <option value="confirmed">확인완료</option>
                        </select>
                      </div>

                      {savingId === c.id && <span className="text-[12px] text-indigo-600">저장 중...</span>}
                    </div>

                    <div>
                      <label className="mb-1 block text-[12px] text-body">
                        할인율 / 최종금액 조정 · 현재 출처:{" "}
                        {DISCOUNT_SOURCE_LABELS[c.discount_source ?? "none"] ?? "미확정"}
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          className={selectClass + " w-20"}
                          value={draftPricing[c.id]?.rate ?? String(Math.round((c.discount_rate ?? 0) * 100))}
                          onChange={(e) =>
                            setDraftPricing((prev) => ({
                              ...prev,
                              [c.id]: {
                                rate: e.target.value,
                                price: prev[c.id]?.price ?? String(c.estimated_price ?? 0),
                              },
                            }))
                          }
                        />
                        <span className="text-[12px] text-body">% 할인</span>
                        <input
                          type="number"
                          min={0}
                          className={selectClass + " w-28"}
                          value={draftPricing[c.id]?.price ?? String(c.estimated_price ?? 0)}
                          onChange={(e) =>
                            setDraftPricing((prev) => ({
                              ...prev,
                              [c.id]: {
                                rate: prev[c.id]?.rate ?? String(Math.round((c.discount_rate ?? 0) * 100)),
                                price: e.target.value,
                              },
                            }))
                          }
                        />
                        <span className="text-[12px] text-body">원 (최종 확정 금액)</span>
                        <button
                          className="btn-secondary text-[12px]"
                          onClick={() => {
                            const draft = draftPricing[c.id];
                            const rate =
                              Number(draft?.rate ?? Math.round((c.discount_rate ?? 0) * 100)) / 100;
                            const price = Number(draft?.price ?? c.estimated_price ?? 0);
                            handleSave(c, {
                              discount_rate: rate,
                              discount_source: "admin_adjusted",
                              estimated_price: price,
                            });
                          }}
                        >
                          조정 저장
                        </button>
                      </div>
                      <p className="mt-1 text-[11px] text-body">
                        고객이 신청서에서 자동조회/직접입력한 할인율과 다르게 확정해야 하면 여기서 최종
                        조정하세요. 저장하면 할인 출처가 &quot;관리자 조정&quot;으로 기록됩니다.
                      </p>
                    </div>

                    <div>
                      <label className="mb-1 block text-[12px] text-body">관리자 메모</label>
                      <textarea
                        className={inputClass}
                        rows={2}
                        value={draftNotes[c.id] ?? c.expert_note ?? ""}
                        onChange={(e) =>
                          setDraftNotes((prev) => ({ ...prev, [c.id]: e.target.value }))
                        }
                      />
                      <button
                        className="btn-secondary mt-2 text-[12px]"
                        onClick={() => handleSave(c, { expert_note: draftNotes[c.id] ?? c.expert_note ?? "" })}
                      >
                        메모 저장
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
