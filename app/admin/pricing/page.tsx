"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import type { SimplePackage, PricedItem } from "@/lib/pricing";

const STORAGE_KEY = "aisaju_admin_password";

interface PricingConfig {
  member_discount_rate: number;
  simple_packages: SimplePackage[];
  detail_purposes: PricedItem[];
  detail_addons: PricedItem[];
}

const rowInput = "w-full rounded-sm border border-border bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-indigo-600";

export default function AdminPricingPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function fetchConfig(pw: string) {
    setChecking(true);
    try {
      const res = await fetch("/api/admin/pricing", { headers: { "x-admin-password": pw }, cache: "no-store" });
      if (res.status === 401) {
        setAuthed(false);
        setAuthError("비밀번호가 올바르지 않습니다.");
        sessionStorage.removeItem(STORAGE_KEY);
        return;
      }
      const json = await res.json();
      if (!res.ok) {
        setAuthError(json.error ?? "가격 정보를 불러오지 못했습니다.");
        return;
      }
      setConfig({
        member_discount_rate: json.config.member_discount_rate,
        simple_packages: json.config.simple_packages,
        detail_purposes: json.config.detail_purposes,
        detail_addons: json.config.detail_addons,
      });
      setAuthed(true);
      setAuthError(null);
    } catch {
      setAuthError("네트워크 오류가 발생했습니다.");
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      setPassword(saved);
      fetchConfig(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleLogin(e: FormEvent) {
    e.preventDefault();
    sessionStorage.setItem(STORAGE_KEY, password);
    fetchConfig(password);
  }

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({
          memberDiscountRate: config.member_discount_rate,
          simplePackages: config.simple_packages,
          detailPurposes: config.detail_purposes,
          detailAddons: config.detail_addons,
        }),
      });
      const json = await res.json();
      setNotice(res.ok ? "저장되었습니다. 사이트에 바로 반영됩니다." : json.error ?? "저장에 실패했습니다.");
    } catch {
      setNotice("네트워크 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  if (!authed || !config) {
    return (
      <main className="section max-w-sm">
        <h1 className="mb-6 text-[22px] font-bold text-ink-900">가격 관리자</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            type="password"
            placeholder="관리자 비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-border px-4 py-3 text-[14px]"
            autoFocus
          />
          <button type="submit" disabled={checking} className="btn-primary">
            {checking ? "확인 중..." : "확인"}
          </button>
          {authError && <p className="text-[13px] text-red-600">{authError}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="section max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-[22px] font-bold text-ink-900">가격 관리자</h1>
        <Link href="/admin" className="text-[13px] text-body underline">
          ← 관리자 허브
        </Link>
      </div>

      <section className="card mb-6">
        <h2 className="mb-3 text-[15px] font-bold text-ink-900">단골(멤버십) 할인율</h2>
        <div className="flex items-center gap-2">
          <input
            type="number"
            step="0.01"
            min="0"
            max="1"
            className={rowInput + " max-w-[120px]"}
            value={config.member_discount_rate}
            onChange={(e) =>
              setConfig({ ...config, member_discount_rate: Number(e.target.value) })
            }
          />
          <span className="text-[13px] text-body">
            (0.3 = 30% 할인, 현재 {Math.round(config.member_discount_rate * 100)}%)
          </span>
        </div>
      </section>

      <section className="card mb-6">
        <h2 className="mb-3 text-[15px] font-bold text-ink-900">간편 신청 패키지</h2>
        <div className="space-y-3">
          {config.simple_packages.map((pkg, i) => (
            <div key={pkg.key} className="grid grid-cols-[1fr_1fr_110px] gap-2">
              <input
                className={rowInput}
                value={pkg.label}
                onChange={(e) => {
                  const next = [...config.simple_packages];
                  next[i] = { ...pkg, label: e.target.value };
                  setConfig({ ...config, simple_packages: next });
                }}
              />
              <input
                className={rowInput}
                value={pkg.desc}
                onChange={(e) => {
                  const next = [...config.simple_packages];
                  next[i] = { ...pkg, desc: e.target.value };
                  setConfig({ ...config, simple_packages: next });
                }}
              />
              <input
                type="number"
                className={rowInput}
                value={pkg.price}
                onChange={(e) => {
                  const next = [...config.simple_packages];
                  next[i] = { ...pkg, price: Number(e.target.value) };
                  setConfig({ ...config, simple_packages: next });
                }}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="card mb-6">
        <h2 className="mb-3 text-[15px] font-bold text-ink-900">디테일 신청 - 상담 목적</h2>
        <div className="space-y-2">
          {config.detail_purposes.map((p, i) => (
            <div key={p.key} className="grid grid-cols-[1fr_110px] gap-2">
              <input
                className={rowInput}
                value={p.label}
                onChange={(e) => {
                  const next = [...config.detail_purposes];
                  next[i] = { ...p, label: e.target.value };
                  setConfig({ ...config, detail_purposes: next });
                }}
              />
              <input
                type="number"
                className={rowInput}
                value={p.price}
                onChange={(e) => {
                  const next = [...config.detail_purposes];
                  next[i] = { ...p, price: Number(e.target.value) };
                  setConfig({ ...config, detail_purposes: next });
                }}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="card mb-6">
        <h2 className="mb-3 text-[15px] font-bold text-ink-900">디테일 신청 - 추가 옵션</h2>
        <div className="space-y-2">
          {config.detail_addons.map((a, i) => (
            <div key={a.key} className="grid grid-cols-[1fr_110px] gap-2">
              <input
                className={rowInput}
                value={a.label}
                onChange={(e) => {
                  const next = [...config.detail_addons];
                  next[i] = { ...a, label: e.target.value };
                  setConfig({ ...config, detail_addons: next });
                }}
              />
              <input
                type="number"
                className={rowInput}
                value={a.price}
                onChange={(e) => {
                  const next = [...config.detail_addons];
                  next[i] = { ...a, price: Number(e.target.value) };
                  setConfig({ ...config, detail_addons: next });
                }}
              />
            </div>
          ))}
        </div>
      </section>

      <button onClick={handleSave} disabled={saving} className="btn-primary w-full justify-center">
        {saving ? "저장 중..." : "저장하기"}
      </button>
      {notice && <p className="mt-3 text-center text-[13px] text-indigo-600">{notice}</p>}
    </main>
  );
}
