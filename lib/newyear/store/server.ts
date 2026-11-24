/**
 * 2027 새해운 — 주문 저장소 (서버 전용).
 *
 * 운영: Supabase `newyear_orders` 표 (service_role 키로만 읽고 쓴다 — 표에는 공개 정책을 두지 않는다).
 * 개발: Supabase 관리자 키가 없으면 메모리에 담아 둔다(서버를 끄면 사라진다). 운영 환경에서는 메모리 저장을 쓰지 않는다.
 * 다른 모듈은 이 파일의 함수만 부른다 — 저장 방식을 바꿔도 나머지 코드는 그대로다.
 */
import { getSupabaseAdminClient } from "@/lib/supabase";
import type { OrderRow } from "../types";

const TABLE = "newyear_orders";
type Patch = Partial<Omit<OrderRow, "id" | "created_at">>;

const mem = (): Map<string, OrderRow> => {
  const g = globalThis as unknown as { __nyOrders?: Map<string, OrderRow> };
  if (!g.__nyOrders) g.__nyOrders = new Map();
  return g.__nyOrders;
};

export class StoreError extends Error {}

function db() {
  const client = getSupabaseAdminClient();
  if (client) return client;
  if (process.env.NODE_ENV === "production" && process.env.NY_ALLOW_MEMORY_STORE !== "1") throw new StoreError("서버에 Supabase 관리자 키가 없습니다.");
  return null;
}
export const storeMode = (): "supabase" | "memory" => (getSupabaseAdminClient() ? "supabase" : "memory");

export async function insertOrder(row: OrderRow): Promise<OrderRow> {
  const client = db();
  if (!client) { mem().set(row.id, row); return row; }
  const { data, error } = await client.from(TABLE).insert(row).select("*").single();
  if (error) throw new StoreError(error.message);
  return data as OrderRow;
}

export async function getByToken(token: string): Promise<OrderRow | null> {
  if (!/^[0-9a-f-]{36}$/i.test(token)) return null;
  const client = db();
  if (!client) return [...mem().values()].find((o) => o.share_token === token) ?? null;
  const { data, error } = await client.from(TABLE).select("*").eq("share_token", token).maybeSingle();
  if (error) throw new StoreError(error.message);
  return (data as OrderRow | null) ?? null;
}

export async function getById(id: string): Promise<OrderRow | null> {
  const client = db();
  if (!client) return mem().get(id) ?? null;
  const { data, error } = await client.from(TABLE).select("*").eq("id", id).maybeSingle();
  if (error) throw new StoreError(error.message);
  return (data as OrderRow | null) ?? null;
}

export async function updateById(id: string, patch: Patch): Promise<OrderRow> {
  const next = { ...patch, updated_at: new Date().toISOString() };
  const client = db();
  if (!client) {
    const cur = mem().get(id);
    if (!cur) throw new StoreError("주문을 찾지 못했습니다.");
    const row = { ...cur, ...next } as OrderRow;
    mem().set(id, row);
    return row;
  }
  const { data, error } = await client.from(TABLE).update(next).eq("id", id).select("*").single();
  if (error) throw new StoreError(error.message);
  return data as OrderRow;
}

export async function listRecent(days: number): Promise<OrderRow[]> {
  const since = new Date(Date.now() - days * 86400_000).toISOString();
  const client = db();
  if (!client) return [...mem().values()].filter((o) => o.created_at >= since).sort((a, b) => b.created_at.localeCompare(a.created_at));
  const { data, error } = await client.from(TABLE).select("*").gte("created_at", since).order("created_at", { ascending: false }).limit(500);
  if (error) throw new StoreError(error.message);
  return (data ?? []) as OrderRow[];
}

/**
 * 생성 시작 — 한 주문에 한 번만 성공한다(동시에 두 번 눌러도, 결제 알림이 겹쳐도 결과는 한 번만 만든다).
 * 대기(queued)·실패(failed)이거나, 생성 중인데 90초 넘게 멈춰 있을 때만 잡는다.
 */
/** 한 주문에서 자동 생성을 시도할 수 있는 횟수 — 넘으면 더 만들지 않고 관리자 확인으로 넘긴다 (DB 함수 newyear_gen_begin 과 같은 값) */
export const MAX_GEN_ATTEMPTS = 4;

export async function beginGeneration(token: string): Promise<OrderRow | null> {
  const client = db();
  if (!client) {
    const cur = [...mem().values()].find((o) => o.share_token === token);
    if (!cur) return null;
    const stale = cur.status === "generating" && !!cur.gen_started_at && Date.now() - Date.parse(cur.gen_started_at) > 90_000;
    if (!(cur.status === "queued" || cur.status === "failed" || stale) || cur.gen_attempts >= MAX_GEN_ATTEMPTS) return null;
    const row: OrderRow = { ...cur, status: "generating", gen_started_at: new Date().toISOString(), gen_attempts: cur.gen_attempts + 1, gen_error: null };
    mem().set(row.id, row);
    return row;
  }
  const { data, error } = await client.rpc("newyear_gen_begin", { p_token: token });
  if (error) throw new StoreError(error.message);
  const row = Array.isArray(data) ? data[0] : data;
  return (row as OrderRow | null) ?? null;
}

/** 같은 기기에서 최근 n시간 안에 만든 주문 수 — 무료 카드 남용과 「입금 완료」 남발을 막는 데 쓴다 */
export async function countByDevice(device: string | null, hours: number, productKey?: string): Promise<number> {
  if (!device) return 0;
  const since = new Date(Date.now() - hours * 3600_000).toISOString();
  const client = db();
  if (!client) return [...mem().values()].filter((o) => o.device_code === device && o.created_at >= since && (!productKey || o.product_key === productKey)).length;
  let q = client.from(TABLE).select("id", { count: "exact", head: true }).eq("device_code", device).gte("created_at", since);
  if (productKey) q = q.eq("product_key", productKey);
  const { count, error } = await q;
  if (error) throw new StoreError(error.message);
  return count ?? 0;
}

/** 최근 n시간 안에 「입금 완료」만 누르고 아직 입금 확인이 안 된 주문 수 — 미확인 건이 쌓이면 자동 생성을 멈추는 데 쓴다 */
export async function countUnconfirmedClaims(hours: number, productKeys: string[]): Promise<number> {
  const since = new Date(Date.now() - hours * 3600_000).toISOString();
  const client = db();
  if (!client) return [...mem().values()].filter((o) => o.payment_status === "claimed" && productKeys.includes(o.product_key) && (o.paid_claimed_at ?? "") >= since).length;
  const { count, error } = await client.from(TABLE).select("id", { count: "exact", head: true }).eq("payment_status", "claimed").in("product_key", productKeys).gte("paid_claimed_at", since);
  if (error) throw new StoreError(error.message);
  return count ?? 0;
}

export async function bumpView(id: string, viewCount: number): Promise<void> {
  const client = db();
  const patch = { view_count: viewCount + 1, viewed_at: new Date().toISOString() };
  if (!client) { const cur = mem().get(id); if (cur) mem().set(id, { ...cur, ...patch }); return; }
  await client.from(TABLE).update(patch).eq("id", id);
}
