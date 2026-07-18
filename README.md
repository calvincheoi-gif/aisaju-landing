# AI사주 Lab

Next.js 14 + Tailwind CSS. 랜딩페이지 + AI 사주 리포트 자동 생성 기능.

브랜드: **AI사주 Lab**(플랫폼) — 전문 상담·리포트는 **최형철 사주명리 연구소**가 제공.
공식 도메인: **aisajulab.com**

## 기능 구성

1. **랜딩페이지** (`/`) — 브랜드 소개, 서비스 8종, 연구소 소개, 상담 안내, 채널 연결
2. **AI 사주 리포트** (`/report`) — 생년월일시 입력 → 사주팔자 계산 → AI가 리포트 자동 생성
   - 사주 계산: `manseryeok` 라이브러리 (KASI 한국천문연구원 만세력 데이터 기반, 진태양시 보정 지원)
   - 리포트 생성: Claude API (`@anthropic-ai/sdk`)
   - API: `POST /api/report`

## 로컬 실행

```bash
npm install
cp .env.example .env.local   # ANTHROPIC_API_KEY 값을 채워주세요
npm run dev                  # http://localhost:3000
```

## ⚠️ 배포 방식이 바뀌었습니다

AI 리포트 기능은 서버에서 실행되는 API 라우트(`/api/report`)를 사용합니다. 이전 랜딩페이지 단독 버전처럼 **정적 파일을 드래그 앤 드롭하는 방식으로는 배포할 수 없습니다.** 대신 아래 방법을 사용해야 합니다.

### 배포 방법: GitHub 연동 (권장)

1. 이 프로젝트 폴더를 GitHub 저장소로 올립니다. (GitHub 계정이 없다면 무료로 생성 — github.com)
   - GitHub 웹사이트에서 "New repository" → 파일을 웹 화면에 그대로 드래그해서 업로드 가능합니다 (git 명령어 몰라도 가능).
2. https://app.netlify.com/projects/aisaju-landing → **Site configuration → Build & deploy → Link repository** 에서 방금 만든 GitHub 저장소를 연결합니다.
3. Netlify가 자동으로 Next.js를 감지해 빌드하고, `/api/report`는 자동으로 서버리스 함수로 배포됩니다.
4. **Site configuration → Environment variables** 에서 `ANTHROPIC_API_KEY`를 등록합니다. (이 키는 제가 대신 입력해드릴 수 없습니다 — 보안상 반드시 직접 입력해 주세요)

이 저장소 연결 이후로는 GitHub에 새 파일을 올릴 때마다 Netlify가 자동으로 재배포합니다.

## 확정된 브랜드 방향
- 브랜드명: AI사주 Lab (플랫폼) / 최형철 사주명리 연구소 (전문 상담·리포트 제공 주체)
- 로고: 워드마크 — `AI`(Indigo 600) + `사주`(Ink 900) + `Lab`(보조 텍스트)
- 메인 컬러: Indigo 600 `#4338CA` 단일 액센트
- 폰트: Pretendard(본문), JetBrains Mono(사주 원국·데이터 표기용)

## 프로젝트 구조
```
app/
  page.tsx              랜딩페이지
  report/page.tsx        AI 리포트 신청 페이지
  api/report/route.ts    AI 리포트 생성 API
components/
  Header, Hero, ServiceMenu, About, ConsultGuide, Channels, Footer
  ReportForm.tsx          리포트 입력 폼 + 결과 표시
  MarkdownReport.tsx      AI 리포트 텍스트 렌더링
lib/
  site-config.ts          브랜드명·상담 URL·채널 URL 등 전역 설정
  saju.ts                 사주 계산 래퍼 (manseryeok)
  prompt.ts               AI 리포트 프롬프트 구성
```

## 검증 상태
- `tsc --noEmit` 타입체크 통과
- `next build` 전체 빌드 성공 (랜딩페이지 + /report + /api/report 모두 정상 컴파일)
- `/api/report` 실제 요청 테스트 완료: 정상 입력, 필수값 누락(400), 출생시간 미상, 음력 입력 케이스 모두 확인
- API 키 미설정 시 500 에러 대신 안내 메시지를 반환하도록 처리(503)
- 실제 Claude API 호출(리포트 문장 생성)은 API 키가 있어야 확인 가능 — 배포 후 키 등록하고 테스트 필요

## 반영 상태
- `consultUrl` — 반영 완료 (기존 상담 신청 웹앱: kaleidoscopic-fudge-a78803.netlify.app)
- `channels.*` — 아직 TODO. 당근 비즈프로필, 네이버 블로그, 카카오톡 채널, 인스타그램, 카페 실제 URL 필요

## 로드맵
1. ~~Landing Page — 브랜드 소개~~ 완료
2. ~~AI 명리 리포트 (자동 생성)~~ 완료 — 배포 및 API 키 등록만 남음
3. 블로그 / 콘텐츠 / 후기 / FAQ
4. 회원 기능 + AI 자동 상담
