-- 2027 새해운 온라인 상품 5종 — 주문 표 (2026-11-23)
--   /2027 → /2027/<상품> → /api/newyear/order → newyear_orders → /2027/o/<share_token>
--
-- 접근 방식: 이 표에는 공개(anon) 정책을 두지 않는다. 읽기·쓰기는 서버(API 라우트)가 service_role 키로만 한다.
--   고객은 추측할 수 없는 share_token 이 든 주소로만 자기 주문을 본다(서버가 열람 가능한 상태일 때만 결과를 내려 준다).
--   관리자는 /admin/newyear (공용 관리자 비밀번호) 에서 입금 확인·초안·감수·승인을 한다.
-- 이 파일은 새 표·함수·트리거만 더한다. 기존 표와 함수는 건드리지 않는다.

create table if not exists public.newyear_orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  day_kst date not null default ((now() at time zone 'Asia/Seoul')::date),
  ref_no text not null unique,                              -- 접수번호 NY-YYMMDD-NNNN (입금 대조·문의용)
  share_token uuid not null unique default gen_random_uuid(), -- 고객 열람 주소의 열쇠
  product_key text not null check (product_key in ('iching-card','tojeong-card','saju-card','tojeong-detail','saju-premium')),
  target_year int not null default 2027,
  price int not null default 0,                             -- 부가세 포함가(원)
  name text,
  contact text,
  payer_name text,                                          -- 「입금 완료」 때 적은 입금자명
  input jsonb not null default '{}'::jsonb,                 -- 고객 입력(생년월일시·질문 등)
  computed jsonb,                                           -- 엔진 산출값 + AI 초안에 준 산출 요약(brief)
  content jsonb,                                            -- 양식의 칸 값(in.* · eng.* · sys.* · p쪽.번호)
  content_source text,                                      -- bank(문구 은행) / ai:direct / sample …
  template_version text,                                    -- 양식 버전 (사양을 다시 추출하면 올라간다)
  status text not null default 'awaiting_payment'
    check (status in ('awaiting_payment','queued','generating','failed','review','ready','cancelled')),
  payment_status text not null default 'pending'
    check (payment_status in ('none','pending','claimed','confirmed','rejected','refunded')),
  paid_claimed_at timestamptz,
  paid_confirmed_at timestamptz,
  gen_started_at timestamptz,
  gen_attempts int not null default 0,
  gen_error text,
  reviewer text,                                            -- 상세본 감수자
  reviewed_at timestamptz,
  review_note text,
  delivered_at timestamptz,
  viewed_at timestamptz,
  view_count int not null default 0,
  utm text,
  referrer text,
  device_code text
);
create index if not exists newyear_orders_created_idx on public.newyear_orders(created_at desc);
create index if not exists newyear_orders_device_idx on public.newyear_orders(device_code, created_at desc);
create index if not exists newyear_orders_status_idx on public.newyear_orders(status, payment_status);

alter table public.newyear_orders enable row level security;
-- 관리자 계정(Supabase 로그인)으로 대시보드·앱에서 조회만 할 수 있게 둔다. 그 밖의 접근 정책은 없다.
drop policy if exists "Admin can view newyear_orders" on public.newyear_orders;
create policy "Admin can view newyear_orders" on public.newyear_orders
  for select using ((auth.jwt() ->> 'email') = 'calvincheoi@gmail.com');

-- 생성 시작 — 한 주문에 한 번만 성공한다.
-- 「입금 완료」를 두 번 눌러도, 화면을 두 개 띄워도, 알림이 겹쳐도 결과는 한 번만 만든다.
-- 대기(queued)·실패(failed)이거나, 생성 중인데 90초 넘게 멈춰 있을 때만 잡는다.
-- 한 주문에서 4번까지만 시도한다 — 계속 실패하는 주문이 AI 호출을 끝없이 되풀이하지 않게 (lib/newyear/store/server.ts MAX_GEN_ATTEMPTS 와 같은 값).
create or replace function public.newyear_gen_begin(p_token uuid)
returns setof public.newyear_orders
language sql security definer set search_path = public as $$
  update public.newyear_orders
     set status = 'generating', gen_started_at = now(), gen_attempts = gen_attempts + 1, gen_error = null, updated_at = now()
   where share_token = p_token
     and gen_attempts < 4
     and (status in ('queued','failed') or (status = 'generating' and gen_started_at < now() - interval '90 seconds'))
  returning *;
$$;
revoke all on function public.newyear_gen_begin(uuid) from public, anon, authenticated;
grant execute on function public.newyear_gen_begin(uuid) to service_role;

-- 접수 알림 — 유료 주문에서 고객이 「입금 완료」를 눌렀을 때 한 번 (무료 주역 카드는 알리지 않는다).
-- 기존 접수 알림(notify_intake)과 같은 설정표(notify_config)·같은 웹훅을 쓴다. 알림이 실패해도 주문은 막지 않는다.
-- ※ Apps Script 가 새 표 이름(newyear_orders)을 모르면 메일 형식이 밋밋할 수 있다 — 테스트 신청 1건으로 확인한다.
create or replace function public.notify_newyear_claim()
returns trigger language plpgsql security definer set search_path = public, extensions as $$
declare v_url text; v_secret text; v_enabled text;
begin
  if not (new.payment_status = 'claimed' and old.payment_status is distinct from 'claimed') then return new; end if;
  select value into v_url     from public.notify_config where key = 'webhook_url';
  select value into v_secret  from public.notify_config where key = 'webhook_secret';
  select value into v_enabled from public.notify_config where key = 'enabled';
  if coalesce(v_enabled,'false') <> 'true' or coalesce(v_url,'') = '' then return new; end if;
  perform net.http_post(
    url     := v_url || '?key=' || v_secret,
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body    := jsonb_build_object('type','INSERT','table','newyear_orders','schema','public','record', jsonb_build_object(
                 'ref_no', new.ref_no, 'product_key', new.product_key, 'price', new.price, 'name', new.name, 'contact', new.contact,
                 'payer_name', new.payer_name, 'status', new.status, 'payment_status', new.payment_status, 'utm', new.utm, 'created_at', new.created_at)),
    timeout_milliseconds := 8000
  );
  return new;
exception when others then
  return new;
end $$;
drop trigger if exists trg_notify_newyear_claim on public.newyear_orders;
create trigger trg_notify_newyear_claim after update of payment_status on public.newyear_orders
  for each row execute function public.notify_newyear_claim();
