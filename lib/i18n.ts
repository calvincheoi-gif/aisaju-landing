/**
 * 사이트 전역 다국어 사전.
 *
 * 정적 UI 문구(내비게이션, 버튼, 안내 문구 등)만 언어별로 번역합니다.
 * Supabase에 저장된 동적 콘텐츠(상담 사례 제목/설명, Q&A 질문·답변,
 * 후기, 관리자가 입력한 가격 항목명 등)는 자동 번역 대상이 아니며
 * 작성된 언어(한국어) 그대로 표시됩니다.
 */

export type Lang = "ko" | "en" | "ja" | "zh" | "fr";

export const LANGS: Lang[] = ["ko", "en", "ja", "zh", "fr"];

export const LANG_LABELS: Record<Lang, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
  zh: "中文",
  fr: "Français",
};

interface Dictionary {
  header: {
    nav: { services: string; about: string; guide: string; channels: string };
    consult: string;
    qna: string;
    admin: string;
  };
  visitCounter: { label: string };
  hero: { eyebrow: string; subtitle: string; cta1: string; cta2: string; cta3: string };
  serviceMenu: {
    eyebrow: string;
    title: string;
    items: { title: string; desc: string }[];
  };
  about: {
    eyebrow: string;
    tagline: string;
    body: string;
    dataCard: string;
    myeongriCard: string;
    orgCardDesc: string;
  };
  consultGuide: {
    eyebrow: string;
    title: string;
    steps: { title: string; desc: string }[];
    cta: string;
  };
  channels: { eyebrow: string; title: string };
  reviews: {
    eyebrow: string;
    title: string;
    writeBtn: string;
    cancelBtn: string;
    nameLabel: string;
    contentLabel: string;
    contentPlaceholder: string;
    submitBtn: string;
    submitting: string;
    empty: string;
    incentive: string;
    successMsg: string;
    errorMsg: string;
  };
  footer: { rights: string };
  scrollHint: { label: string };
  consultPage: { eyebrow: string; title: string; desc: string };
  consultWizard: {
    step1Title: string;
    generalTitle: string;
    generalDesc: string;
    memberTitle: string;
    memberDesc: string;
    step2Title: string;
    backToType: string;
    simpleTitle: string;
    simpleDesc: string;
    detailTitle: string;
    detailDesc: string;
    backToMode: string;
    badgeGeneral: string;
    badgeMember: string;
    badgeSimple: string;
    badgeDetail: string;
    packageLabel: string;
    purposeLabel: string;
    addonLabel: string;
    totalLabel: string;
    memberDiscountNote: string;
    nameLabel: string;
    genderLabel: string;
    male: string;
    female: string;
    birthLabel: string;
    birthPlaceholder: string;
    birthDateLabel: string;
    birthHourLabel: string;
    birthHourPlaceholder: string;
    birthTimeUnknownLabel: string;
    calendarTypeLabel: string;
    solarLabel: string;
    lunarLabel: string;
    leapMonthLabel: string;
    birthPreviewPrefix: string;
    birthDateRequired: string;
    birthTimeRequired: string;
    birthDateFuture: string;
    yearPlaceholder: string;
    monthPlaceholder: string;
    dayPlaceholder: string;
    manualEntryToggle: string;
    manualEntryBack: string;
    manualEntryPlaceholder: string;
    manualEntryHint: string;
    contactLabel: string;
    concernLabel: string;
    submitBtn: string;
    doneTitle: string;
    doneDesc: string;
    priceUnit: string;
    mostBadge: string;
    fastestBadge: string;
    saveDelayed: string;
    saveFailed: string;
    payTitle: string;
    payAmount: string;
    payRefNo: string;
    payRefNoHint: string;
    payStep1: string;
    payStep2: string;
    payStep3: string;
    payKakaoBtn: string;
    payBankTitle: string;
    payHolder: string;
    payDepositName: string;
    payAfter: string;
    payLawTitle: string;
    payLawBody: string;
    payRefundLink: string;
    payCopyBtn: string;
    payCopied: string;
    payVat: string;
    namingNoticeT: string;
    namingNoticeD: string;
  };
  reportPage: { eyebrow: string; title: string; desc: string };
  reportForm: {
    disclaimer: string;
    nameLabel: string;
    genderLabel: string;
    male: string;
    female: string;
    birthLabel: string;
    yearPh: string;
    monthPh: string;
    dayPh: string;
    lunar: string;
    leapMonth: string;
    timeLabel: string;
    hourPh: string;
    minutePh: string;
    timeUnknown: string;
    consultTypeLabel: string;
    contactLabel: string;
    concernLabel: string;
    submitBtn: string;
    loadingBtn: string;
    requiredError: string;
    pillars: { year: string; month: string; day: string; hour: string; unknown: string };
    resultDisclaimer: string;
    expertBtn: string;
    retryBtn: string;
    consultTypes: string[];
  };
  casesPage: { eyebrow: string; title: string; desc: string; empty: string; viewBtn: string };
  qnaPage: {
    eyebrow: string;
    title: string;
    desc: string;
    askBtn: string;
    cancelBtn: string;
    nameLabel: string;
    titleLabel: string;
    contentLabel: string;
    submitBtn: string;
    submitting: string;
    empty: string;
    repliedBadge: string;
    waitingBadge: string;
    successMsg: string;
    errorMsg: string;
  };
}

const ko: Dictionary = {
  header: {
    nav: { services: "서비스", about: "연구소 소개", guide: "상담 안내", channels: "채널" },
    consult: "상담 신청",
    qna: "Q&A",
    admin: "관리자",
  },
  visitCounter: { label: "누적 방문" },
  hero: {
    eyebrow: "AI × 명리학",
    subtitle: "AI와 명리학으로 인생과 비즈니스의\n중요한 의사결정을 돕습니다.",
    cta1: "상담 신청",
    cta2: "AI 리포트 보기",
    cta3: "상담 사례",
  },
  serviceMenu: {
    eyebrow: "Services",
    title: "어떤 고민이든, 사주로 방향을 찾습니다",
    items: [
      { title: "개인사주", desc: "타고난 기질과 인생 흐름을 정리해드립니다." },
      { title: "궁합", desc: "두 사람의 조화와 균형을 살펴봅니다." },
      { title: "직업·진로", desc: "적성에 맞는 방향과 시기를 제안합니다." },
      { title: "사업운", desc: "창업·확장의 타이밍을 짚어드립니다." },
      { title: "재물운", desc: "재물의 흐름과 관리 전략을 안내합니다." },
      { title: "대운·세운", desc: "장기·단기 운의 흐름을 함께 봅니다." },
      { title: "작명", desc: "이름에 담을 방향을 제안합니다." },
      { title: "AI 사주 리포트", desc: "AI가 정리한 나만의 분석 리포트를 받아보세요." },
    ],
  },
  about: {
    eyebrow: "About",
    tagline: "AI사주 Lab",
    body: "오랜 시간 명리학을 연구해 온 최형철 사주명리 연구소가 AI사주 Lab이라는 플랫폼을 통해 AI 기술을 더해, 더 정확하고 일관된 분석을 빠르게 전달합니다. 전통적인 사주풀이의 통찰에 AI의 데이터 정리 능력을 결합해, 인생과 비즈니스의 중요한 순간에 실질적인 도움을 드리는 것을 목표로 합니다.",
    dataCard: "데이터 기반 분석",
    myeongriCard: "전통 명리학 이론",
    orgCardDesc: "AI사주 Lab 운영",
  },
  consultGuide: {
    eyebrow: "How it works",
    title: "상담은 3단계면 충분합니다",
    steps: [
      { title: "상담 종류 선택", desc: "개인사주, 궁합, 사업운 등 필요한 상담을 선택합니다." },
      { title: "기본정보 입력", desc: "생년월일시 등 사주 분석에 필요한 정보를 입력합니다." },
      { title: "고민 입력", desc: "구체적인 고민을 남기면 AI와 연구소가 함께 분석합니다." },
    ],
    cta: "지금 상담 신청하기",
  },
  channels: { eyebrow: "Channels", title: "기존 채널에서도 만나보세요" },
  reviews: {
    eyebrow: "Reviews",
    title: "방문자·상담자 후기",
    writeBtn: "후기 남기기",
    cancelBtn: "취소",
    nameLabel: "이름",
    contentLabel: "후기 내용",
    contentPlaceholder: "상담 또는 리포트 경험을 남겨주세요",
    submitBtn: "등록하기",
    submitting: "등록 중...",
    empty: "아직 등록된 후기가 없습니다.",
    incentive: "지금 후기를 남겨주시면 다음 상담 시 50% 할인 혜택을 드립니다!",
    successMsg: "소중한 후기 감사합니다.",
    errorMsg: "등록 중 오류가 발생했습니다.",
  },
  footer: { rights: "All rights reserved." },
  scrollHint: { label: "스크롤" },
  consultPage: {
    eyebrow: "상담 신청",
    title: "나에게 맞는 상담을 선택하세요",
    desc: "고객 유형(일반/단골)과 신청 방식(간편/디테일)을 선택하면 맞춤 신청서가 열립니다.",
  },
  consultWizard: {
    step1Title: "먼저, 고객 유형을 선택해 주세요",
    generalTitle: "일반 고객",
    generalDesc: "처음 방문하셨거나 정가로 이용하시는 경우",
    memberTitle: "단골(멤버십) 고객",
    memberDesc: "기존 상담 이력이 있으신 분 · 등급별 할인 적용",
    step2Title: "신청서 방식을 선택해 주세요",
    backToType: "← 고객 유형 다시 선택",
    simpleTitle: "간편 신청",
    simpleDesc: "3가지 패키지 중 선택 (리포트만 / +톡·전화 / +대면)",
    detailTitle: "디테일 신청",
    detailDesc: "10개 상담 목적 + 옵션을 직접 조합",
    backToMode: "← 신청 방식 다시 선택",
    badgeGeneral: "일반",
    badgeMember: "단골(멤버십)",
    badgeSimple: "간편",
    badgeDetail: "디테일",
    packageLabel: "패키지 선택",
    purposeLabel: "상담 목적 (복수 선택 가능)",
    addonLabel: "추가 옵션",
    totalLabel: "예상 결제 금액",
    memberDiscountNote: "단골 할인 적용 (실제 등급별 할인율은 관리자 설정)",
    nameLabel: "이름",
    genderLabel: "성별",
    male: "남성",
    female: "여성",
    birthLabel: "생년월일시 (예: 1990-05-15 15시, 음력 여부 포함)",
    birthPlaceholder: "1990-05-15 15시 (양력)",
    birthDateLabel: "생년월일",
    birthHourLabel: "태어난 시간",
    birthHourPlaceholder: "시간 선택",
    birthTimeUnknownLabel: "태어난 시간 모름",
    calendarTypeLabel: "음력 / 양력",
    solarLabel: "양력",
    lunarLabel: "음력",
    leapMonthLabel: "윤달",
    birthPreviewPrefix: "입력하신 생년월일시: ",
    birthDateRequired: "생년월일을 선택해 주세요.",
    birthTimeRequired: "태어난 시간을 선택하거나 '시간 모름'을 체크해 주세요.",
    birthDateFuture: "생년월일은 오늘 이전 날짜여야 합니다.",
    yearPlaceholder: "연도",
    monthPlaceholder: "월",
    dayPlaceholder: "일",
    manualEntryToggle: "직접 입력",
    manualEntryBack: "선택 입력으로",
    manualEntryPlaceholder: "예: 1990년 5월 15일 15시",
    manualEntryHint: "연도-월-일 형식 또는 '1990년 5월 15일 15시'처럼 자유롭게 적어주세요. 아래 요약에 자동으로 반영됩니다.",
    contactLabel: "연락처",
    concernLabel: "고민 내용",
    submitBtn: "신청하기",
    doneTitle: "신청이 접수되었습니다",
    doneDesc: "이메일 클라이언트가 열리지 않았다면 아래 내용을 직접 보내주세요. 빠른 시일 내 연락드립니다.",
    priceUnit: "원",
    mostBadge: "대부분 여기",
    fastestBadge: "가장 빠른 방법",
    saveDelayed: "DB 응답이 지연되어 자동 저장은 확인되지 않았습니다. 이메일로 접수된 내용을 확인해 연락드리겠습니다.",
    saveFailed: "DB 저장 요청에 실패했습니다. 이메일로 접수된 내용을 확인해 연락드리겠습니다.",
    payTitle: "결제 안내",
    payAmount: "결제하실 금액",
    payRefNo: "접수번호",
    payRefNoHint: "입금 확인 시 대조에 쓰이니 그대로 보관해 주세요.",
    payStep1: "아래 버튼으로 <b>%A</b>을 송금해 주세요. 금액은 직접 입력하셔야 합니다.",
    payStep2: "입금자명은 <b>신청자 성함과 동일하게</b> 적어 주세요. 다르면 확인이 늦어집니다.",
    payStep3: "입금이 확인되면 <b>영업일 %D일 이내</b>에 연락드립니다.",
    payKakaoBtn: "카카오페이로 송금하기",
    payBankTitle: "계좌이체로 보내실 분",
    payHolder: "예금주",
    payDepositName: "입금자명",
    payAfter: "입금 후 별도로 알려주실 필요는 없습니다. 확인되는 대로 먼저 연락드립니다.",
    payLawTitle: "결제 전 꼭 확인해 주세요",
    payLawBody: "리포트는 발송이 시작된 뒤에는 전자상거래법 제17조 제2항 제5호에 따라 청약철회가 제한됩니다. 상담은 시작 전까지 전액 환불됩니다.",
    payRefundLink: "환불·청약철회 규정 보기",
    payCopyBtn: "신청 내용 복사",
    payCopied: "복사했습니다",
    payVat: "부가세 포함 금액입니다.",
    namingNoticeT: "작명 신청 전 꼭 확인해 주세요",
    namingNoticeD: "아기의 <b>성씨</b>가 있어야 작명이 가능합니다. 아래 「더 알려주실 내용」에 성씨를 적어 주세요. 아직 태어나기 전이라면 <b>예정일시</b>를 넣어 주시면 되고, 실제 출생일시가 확정되면 무료로 다시 검증해 드립니다.",
  },
  reportPage: {
    eyebrow: "AI 명리 리포트",
    title: "정보를 입력하면 AI가 사주를 분석합니다",
    desc: "KASI 만세력 기준으로 정밀하게 계산한 사주 데이터를 바탕으로 AI가 리포트를 작성합니다.",
  },
  reportForm: {
    disclaimer: "AI 무료 간편분석은 참고용이며, 드물게 오류가 있을 수 있습니다. 정밀한 해석이 필요하시면 리포트 확인 후 \"전문가에게 확인 요청\" 버튼을 이용해 주세요.",
    nameLabel: "이름",
    genderLabel: "성별",
    male: "남성",
    female: "여성",
    birthLabel: "생년월일",
    yearPh: "년(YYYY)",
    monthPh: "월",
    dayPh: "일",
    lunar: "음력",
    leapMonth: "윤달",
    timeLabel: "태어난 시간",
    hourPh: "시(0-23)",
    minutePh: "분",
    timeUnknown: "시간 모름",
    consultTypeLabel: "상담 종류",
    contactLabel: "연락처 (선택)",
    concernLabel: "고민 내용",
    submitBtn: "AI 리포트 생성하기",
    loadingBtn: "AI가 사주를 분석하고 있습니다...",
    requiredError: "필수 항목을 모두 입력해 주세요.",
    pillars: { year: "년주", month: "월주", day: "일주", hour: "시주", unknown: "미상" },
    resultDisclaimer: "이 리포트는 AI가 자동 생성한 무료 간편분석으로, 드물게 계산 오류나 부정확한 해석이 포함될 수 있습니다. 중요한 결정에 참고하시려면 전문가 확인을 요청해 주세요.",
    expertBtn: "전문가에게 확인 요청",
    retryBtn: "다시 작성하기",
    consultTypes: ["개인사주", "궁합", "직업·진로", "사업운", "재물운", "대운·세운", "작명", "종합 분석"],
  },
  casesPage: {
    eyebrow: "상담 사례",
    title: "실제 상담 리포트로 미리 만나보세요",
    desc: "실제로 작성한 AI 명리 리포트 사례입니다. 리포트를 열어보고 마음에 드는 방식으로 상담을 신청해 보세요.",
    empty: "아직 등록된 상담 사례가 없습니다. 곧 좋은 사례로 찾아뵙겠습니다.",
    viewBtn: "리포트 전체보기 →",
  },
  qnaPage: {
    eyebrow: "Q&A",
    title: "궁금한 점을 물어보세요",
    desc: "질문을 남겨주시면 연구소에서 확인 후 답변을 드립니다.",
    askBtn: "질문 남기기",
    cancelBtn: "취소",
    nameLabel: "이름",
    titleLabel: "제목",
    contentLabel: "내용",
    submitBtn: "등록하기",
    submitting: "등록 중...",
    empty: "아직 등록된 질문이 없습니다.",
    repliedBadge: "답변완료",
    waitingBadge: "답변대기",
    successMsg: "질문이 등록되었습니다.",
    errorMsg: "등록 중 오류가 발생했습니다.",
  },
};

const en: Dictionary = {
  header: {
    nav: { services: "Services", about: "About", guide: "How it works", channels: "Channels" },
    consult: "Book a consult",
    qna: "Q&A",
    admin: "Admin",
  },
  visitCounter: { label: "Total visits" },
  hero: {
    eyebrow: "AI × Myeongri (Korean BaZi)",
    subtitle: "AI and traditional myeongri come together\nto support your biggest life and business decisions.",
    cta1: "Book a consult",
    cta2: "View AI report",
    cta3: "Case studies",
  },
  serviceMenu: {
    eyebrow: "Services",
    title: "Whatever the question, your chart points the way",
    items: [
      { title: "Personal chart", desc: "A clear read on your natural temperament and life path." },
      { title: "Compatibility", desc: "How two people's charts balance and complement each other." },
      { title: "Career", desc: "Directions and timing suited to your aptitude." },
      { title: "Business luck", desc: "Timing for launching or expanding a business." },
      { title: "Wealth luck", desc: "How money flows for you, and how to manage it." },
      { title: "Long/short-term luck cycles", desc: "Your fortune over the years and seasons ahead." },
      { title: "Naming", desc: "Name directions chosen to suit your chart." },
      { title: "AI Saju Report", desc: "Get your own AI-generated analysis report." },
    ],
  },
  about: {
    eyebrow: "About",
    tagline: "AI Saju Lab",
    body: "Choi Hyung-cheol's Myeongri Research Institute, with years of study in traditional myeongri, delivers faster and more consistent analysis through the AI Saju Lab platform. By combining traditional insight with AI's data processing power, we aim to provide real, practical help at the important moments of your life and business.",
    dataCard: "Data-driven analysis",
    myeongriCard: "Traditional myeongri theory",
    orgCardDesc: "Operated by AI Saju Lab",
  },
  consultGuide: {
    eyebrow: "How it works",
    title: "Three steps are all it takes",
    steps: [
      { title: "Choose a consult type", desc: "Pick the topic you need — personal chart, compatibility, business luck, and more." },
      { title: "Enter your basic info", desc: "Provide your birth date and time for the chart analysis." },
      { title: "Describe your concern", desc: "Share your specific concern so our team and AI can analyze it together." },
    ],
    cta: "Book a consult now",
  },
  channels: { eyebrow: "Channels", title: "Find us on our other channels" },
  reviews: {
    eyebrow: "Reviews",
    title: "Visitor & client reviews",
    writeBtn: "Write a review",
    cancelBtn: "Cancel",
    nameLabel: "Name",
    contentLabel: "Review",
    contentPlaceholder: "Share your experience with the consult or report",
    submitBtn: "Submit",
    submitting: "Submitting...",
    empty: "No reviews yet.",
    incentive: "Leave a review now and get 50% off your next consultation!",
    successMsg: "Thank you for your review.",
    errorMsg: "Something went wrong while submitting.",
  },
  footer: { rights: "All rights reserved." },
  scrollHint: { label: "Scroll" },
  consultPage: {
    eyebrow: "Book a consult",
    title: "Choose the consult that fits you",
    desc: "Pick your customer type (general/regular) and application style (simple/detailed) to open a tailored form.",
  },
  consultWizard: {
    step1Title: "First, choose your customer type",
    generalTitle: "General customer",
    generalDesc: "First-time visitors, or those using standard pricing",
    memberTitle: "Regular (membership) customer",
    memberDesc: "Existing clients · tier discounts apply",
    step2Title: "Choose an application style",
    backToType: "← Back to customer type",
    simpleTitle: "Simple application",
    simpleDesc: "Choose from 3 packages (report only / +chat·call / +in-person)",
    detailTitle: "Detailed application",
    detailDesc: "Combine 10 consult purposes with add-on options",
    backToMode: "← Back to application style",
    badgeGeneral: "General",
    badgeMember: "Regular (membership)",
    badgeSimple: "Simple",
    badgeDetail: "Detailed",
    packageLabel: "Choose a package",
    purposeLabel: "Consult purpose (multiple choice)",
    addonLabel: "Add-on options",
    totalLabel: "Estimated price",
    memberDiscountNote: "Regular customer discount applied (exact tier rates set by admin)",
    nameLabel: "Name",
    genderLabel: "Gender",
    male: "Male",
    female: "Female",
    birthLabel: "Date & time of birth (e.g. 1990-05-15 3pm, note if lunar)",
    birthPlaceholder: "1990-05-15 3pm (solar calendar)",
    birthDateLabel: "Date of birth",
    birthHourLabel: "Time of birth",
    birthHourPlaceholder: "Select time",
    birthTimeUnknownLabel: "Unknown birth time",
    calendarTypeLabel: "Calendar type",
    solarLabel: "Solar",
    lunarLabel: "Lunar",
    leapMonthLabel: "Leap month",
    birthPreviewPrefix: "You entered: ",
    birthDateRequired: "Please select your date of birth.",
    birthTimeRequired: "Please select a birth time or check 'Unknown birth time'.",
    birthDateFuture: "Date of birth must be before today.",
    yearPlaceholder: "Year",
    monthPlaceholder: "Month",
    dayPlaceholder: "Day",
    manualEntryToggle: "Type it in",
    manualEntryBack: "Back to dropdowns",
    manualEntryPlaceholder: "e.g. May 15, 1990, 3pm",
    manualEntryHint: "Use YYYY-MM-DD or write it naturally, e.g. \"1990-05-15 3pm\". It's parsed automatically below.",
    contactLabel: "Contact",
    concernLabel: "Your concern",
    submitBtn: "Submit application",
    doneTitle: "Your application has been received",
    doneDesc: "If your email client didn't open, please send the details below directly. We'll contact you shortly.",
    priceUnit: "KRW",
    mostBadge: "Most people",
    fastestBadge: "Fastest way",
    saveDelayed: "The database was slow to respond, so we could not confirm the automatic save. We will check what came in by email and get back to you.",
    saveFailed: "The save request failed. We will check what came in by email and get back to you.",
    payTitle: "How to pay",
    payAmount: "Amount to pay",
    payRefNo: "Reference no.",
    payRefNoHint: "Please keep this — we use it to match your payment.",
    payStep1: "Send <b>%A</b> using the button below. You will need to enter the amount yourself.",
    payStep2: "Please use <b>the same name as on this request</b> as the sender name. A different name delays confirmation.",
    payStep3: "Once your payment is confirmed we will contact you <b>within %D business days</b>.",
    payKakaoBtn: "Pay with KakaoPay",
    payBankTitle: "If you prefer a bank transfer",
    payHolder: "Account holder",
    payDepositName: "Sender name",
    payAfter: "You do not need to notify us after paying. We will reach out as soon as it clears.",
    payLawTitle: "Please read before paying",
    payLawBody: "Once delivery of the report has begun, withdrawal is restricted under Article 17(2)5 of the Korean E-Commerce Act. Consultations are fully refundable until they begin.",
    payRefundLink: "See the refund policy",
    payCopyBtn: "Copy this request",
    payCopied: "Copied",
    payVat: "VAT included.",
    namingNoticeT: "Before you request a naming",
    namingNoticeD: "We need the child's <b>family name</b> to begin. Please write it in the box below. If the child has not been born yet, enter the <b>expected date and time</b> — we re-verify free of charge once the actual time is known.",
  },
  reportPage: {
    eyebrow: "AI Saju Report",
    title: "Enter your info and let AI analyze your chart",
    desc: "AI writes your report based on chart data precisely calculated using the KASI calendar standard.",
  },
  reportForm: {
    disclaimer: "The free AI quick analysis is for reference only and may rarely contain errors. For a precise interpretation, use the \"Request expert review\" button after viewing your report.",
    nameLabel: "Name",
    genderLabel: "Gender",
    male: "Male",
    female: "Female",
    birthLabel: "Date of birth",
    yearPh: "Year (YYYY)",
    monthPh: "Month",
    dayPh: "Day",
    lunar: "Lunar calendar",
    leapMonth: "Leap month",
    timeLabel: "Time of birth",
    hourPh: "Hour (0-23)",
    minutePh: "Minute",
    timeUnknown: "Unknown time",
    consultTypeLabel: "Consult type",
    contactLabel: "Contact (optional)",
    concernLabel: "Your concern",
    submitBtn: "Generate AI report",
    loadingBtn: "AI is analyzing your chart...",
    requiredError: "Please fill in all required fields.",
    pillars: { year: "Year", month: "Month", day: "Day", hour: "Hour", unknown: "Unknown" },
    resultDisclaimer: "This report was auto-generated by AI as a free quick analysis and may rarely contain calculation errors or inaccurate interpretation. Please request expert review before relying on it for important decisions.",
    expertBtn: "Request expert review",
    retryBtn: "Start over",
    consultTypes: ["Personal chart", "Compatibility", "Career", "Business luck", "Wealth luck", "Long/short-term luck", "Naming", "Comprehensive analysis"],
  },
  casesPage: {
    eyebrow: "Case Studies",
    title: "Preview real consult reports",
    desc: "These are real AI myeongri reports we've written. Open one to see the style, then book the consult that fits you.",
    empty: "No case studies published yet — check back soon.",
    viewBtn: "View full report →",
  },
  qnaPage: {
    eyebrow: "Q&A",
    title: "Ask us anything",
    desc: "Leave a question and our team will review and reply.",
    askBtn: "Ask a question",
    cancelBtn: "Cancel",
    nameLabel: "Name",
    titleLabel: "Title",
    contentLabel: "Content",
    submitBtn: "Submit",
    submitting: "Submitting...",
    empty: "No questions yet.",
    repliedBadge: "Answered",
    waitingBadge: "Awaiting reply",
    successMsg: "Your question has been posted.",
    errorMsg: "Something went wrong while submitting.",
  },
};

const ja: Dictionary = {
  header: {
    nav: { services: "サービス", about: "研究所紹介", guide: "相談案内", channels: "チャンネル" },
    consult: "相談申込み",
    qna: "Q&A",
    admin: "管理者",
  },
  visitCounter: { label: "累計訪問数" },
  hero: {
    eyebrow: "AI × 命理学",
    subtitle: "AIと命理学で人生とビジネスの\n重要な意思決定をサポートします。",
    cta1: "相談申込み",
    cta2: "AIレポートを見る",
    cta3: "相談事例",
  },
  serviceMenu: {
    eyebrow: "Services",
    title: "どんな悩みも、四柱推命で方向を見出します",
    items: [
      { title: "個人四柱", desc: "生まれ持った気質と人生の流れを整理します。" },
      { title: "相性", desc: "二人の調和とバランスを読み解きます。" },
      { title: "職業・進路", desc: "適性に合った方向と時期を提案します。" },
      { title: "事業運", desc: "起業・拡大のタイミングを見極めます。" },
      { title: "財運", desc: "お金の流れと管理戦略をご案内します。" },
      { title: "大運・歳運", desc: "長期・短期の運の流れを一緒に見ます。" },
      { title: "命名", desc: "名前に込める方向性を提案します。" },
      { title: "AI四柱レポート", desc: "AIがまとめたあなただけの分析レポートを。" },
    ],
  },
  about: {
    eyebrow: "About",
    tagline: "AI四柱 Lab",
    body: "長年命理学を研究してきたチェ・ヒョンチョル四柱命理研究所が、AI四柱Labというプラットフォームを通じてAI技術を融合し、より正確で一貫した分析を迅速にお届けします。伝統的な四柱推命の洞察とAIのデータ整理能力を組み合わせ、人生とビジネスの重要な瞬間に実質的な助けとなることを目指しています。",
    dataCard: "データに基づく分析",
    myeongriCard: "伝統命理学理論",
    orgCardDesc: "AI四柱 Lab 運営",
  },
  consultGuide: {
    eyebrow: "How it works",
    title: "相談はたった3ステップです",
    steps: [
      { title: "相談種類の選択", desc: "個人四柱、相性、事業運など必要な相談を選びます。" },
      { title: "基本情報の入力", desc: "生年月日時など四柱分析に必要な情報を入力します。" },
      { title: "悩みの入力", desc: "具体的な悩みを残すとAIと研究所が一緒に分析します。" },
    ],
    cta: "今すぐ相談申込み",
  },
  channels: { eyebrow: "Channels", title: "既存チャンネルでもお会いできます" },
  reviews: {
    eyebrow: "Reviews",
    title: "訪問者・相談者の口コミ",
    writeBtn: "口コミを書く",
    cancelBtn: "キャンセル",
    nameLabel: "お名前",
    contentLabel: "口コミ内容",
    contentPlaceholder: "相談やレポートのご感想をお聞かせください",
    submitBtn: "投稿する",
    submitting: "投稿中...",
    empty: "まだ口コミがありません。",
    incentive: "今口コミを書いていただくと、次回のご相談が50%割引になります！",
    successMsg: "貴重な口コミありがとうございます。",
    errorMsg: "投稿中にエラーが発生しました。",
  },
  footer: { rights: "All rights reserved." },
  scrollHint: { label: "スクロール" },
  consultPage: {
    eyebrow: "相談申込み",
    title: "自分に合った相談を選んでください",
    desc: "顧客タイプ（一般/常連）と申込み方式（簡単/詳細）を選ぶと専用フォームが開きます。",
  },
  consultWizard: {
    step1Title: "まず、顧客タイプを選択してください",
    generalTitle: "一般顧客",
    generalDesc: "初めて訪問された方、または正規価格をご利用の方",
    memberTitle: "常連（メンバーシップ）顧客",
    memberDesc: "既存の相談履歴がある方 · 等級別割引適用",
    step2Title: "申込み方式を選択してください",
    backToType: "← 顧客タイプを選び直す",
    simpleTitle: "簡単申込み",
    simpleDesc: "3種のパッケージから選択（レポートのみ／+トーク・電話／+対面）",
    detailTitle: "詳細申込み",
    detailDesc: "10種の相談目的とオプションを自由に組み合わせ",
    backToMode: "← 申込み方式を選び直す",
    badgeGeneral: "一般",
    badgeMember: "常連（メンバーシップ）",
    badgeSimple: "簡単",
    badgeDetail: "詳細",
    packageLabel: "パッケージ選択",
    purposeLabel: "相談目的（複数選択可）",
    addonLabel: "追加オプション",
    totalLabel: "お見積り金額",
    memberDiscountNote: "常連割引適用（等級別割引率は管理者が設定）",
    nameLabel: "お名前",
    genderLabel: "性別",
    male: "男性",
    female: "女性",
    birthLabel: "生年月日時（例：1990-05-15 15時、旧暦の場合はその旨も）",
    birthPlaceholder: "1990-05-15 15時（新暦）",
    birthDateLabel: "生年月日",
    birthHourLabel: "生まれた時間",
    birthHourPlaceholder: "時間を選択",
    birthTimeUnknownLabel: "生まれた時間が不明",
    calendarTypeLabel: "新暦 / 旧暦",
    solarLabel: "新暦",
    lunarLabel: "旧暦",
    leapMonthLabel: "閏月",
    birthPreviewPrefix: "入力内容: ",
    birthDateRequired: "生年月日を選択してください。",
    birthTimeRequired: "生まれた時間を選択するか、「生まれた時間が不明」にチェックしてください。",
    birthDateFuture: "生年月日は今日より前の日付にしてください。",
    yearPlaceholder: "年",
    monthPlaceholder: "月",
    dayPlaceholder: "日",
    manualEntryToggle: "直接入力",
    manualEntryBack: "選択入力に戻る",
    manualEntryPlaceholder: "例：1990年5月15日15時",
    manualEntryHint: "年-月-日の形式、または「1990年5月15日15時」のように自由に入力してください。下の要約に自動反映されます。",
    contactLabel: "連絡先",
    concernLabel: "お悩みの内容",
    submitBtn: "申込む",
    doneTitle: "お申込みを受け付けました",
    doneDesc: "メールクライアントが開かなかった場合は、以下の内容を直接お送りください。近日中にご連絡いたします。",
    priceUnit: "ウォン",
    mostBadge: "ほとんどの方はこちら",
    fastestBadge: "いちばん早い方法",
    saveDelayed: "データベースの応答が遅れたため、自動保存を確認できませんでした。メールで受け付けた内容を確認のうえご連絡します。",
    saveFailed: "保存の要求に失敗しました。メールで受け付けた内容を確認のうえご連絡します。",
    payTitle: "お支払いのご案内",
    payAmount: "お支払い金額",
    payRefNo: "受付番号",
    payRefNoHint: "入金確認の照合に使いますので、そのまま保管してください。",
    payStep1: "下のボタンから<b>%A</b>をお送りください。金額はご自身で入力していただきます。",
    payStep2: "振込名義は<b>お申込みのお名前と同じ</b>にしてください。異なると確認が遅れます。",
    payStep3: "入金が確認できましたら<b>営業日%D日以内</b>にご連絡します。",
    payKakaoBtn: "カカオペイで送金する",
    payBankTitle: "銀行振込をご希望の方",
    payHolder: "口座名義",
    payDepositName: "振込名義",
    payAfter: "入金後にご連絡いただく必要はありません。確認でき次第こちらからご連絡します。",
    payLawTitle: "お支払い前に必ずご確認ください",
    payLawBody: "レポートは発送が開始された後、韓国の電子商取引法第17条第2項第5号により申込みの撤回が制限されます。相談は開始前であれば全額返金いたします。",
    payRefundLink: "返金・撤回規定を見る",
    payCopyBtn: "申込内容をコピー",
    payCopied: "コピーしました",
    payVat: "消費税込みの金額です。",
    namingNoticeT: "命名のお申込み前にご確認ください",
    namingNoticeD: "お子さまの<b>姓</b>がないと命名を進められません。下の「ほかにお伝えいただきたいこと」に姓をお書きください。まだお生まれ前でしたら<b>予定日時</b>をご入力いただければ、実際の出生日時が確定した時点で無料で再検証いたします。",
  },
  reportPage: {
    eyebrow: "AI四柱レポート",
    title: "情報を入力するとAIが四柱を分析します",
    desc: "KASI（韓国天文研究院）の暦を基準に精密計算した四柱データをもとにAIがレポートを作成します。",
  },
  reportForm: {
    disclaimer: "無料のAI簡易分析は参考用であり、まれに誤りが含まれる場合があります。精密な解釈が必要な場合は、レポート確認後「専門家に確認を依頼」ボタンをご利用ください。",
    nameLabel: "お名前",
    genderLabel: "性別",
    male: "男性",
    female: "女性",
    birthLabel: "生年月日",
    yearPh: "年（YYYY）",
    monthPh: "月",
    dayPh: "日",
    lunar: "旧暦",
    leapMonth: "閏月",
    timeLabel: "生まれた時間",
    hourPh: "時（0-23）",
    minutePh: "分",
    timeUnknown: "時間不明",
    consultTypeLabel: "相談種類",
    contactLabel: "連絡先（任意）",
    concernLabel: "お悩みの内容",
    submitBtn: "AIレポートを生成",
    loadingBtn: "AIが四柱を分析しています...",
    requiredError: "必須項目をすべて入力してください。",
    pillars: { year: "年柱", month: "月柱", day: "日柱", hour: "時柱", unknown: "不明" },
    resultDisclaimer: "このレポートはAIが自動生成した無料簡易分析であり、まれに計算誤りや不正確な解釈が含まれる場合があります。重要な決定の参考にする場合は専門家の確認をご依頼ください。",
    expertBtn: "専門家に確認を依頼",
    retryBtn: "再入力する",
    consultTypes: ["個人四柱", "相性", "職業・進路", "事業運", "財運", "大運・歳運", "命名", "総合分析"],
  },
  casesPage: {
    eyebrow: "相談事例",
    title: "実際の相談レポートを先にご覧いただけます",
    desc: "実際に作成したAI命理レポートの事例です。レポートを開いて、お好きな方法で相談をお申し込みください。",
    empty: "まだ登録された事例がありません。近日中に良い事例をお届けします。",
    viewBtn: "レポート全体を見る →",
  },
  qnaPage: {
    eyebrow: "Q&A",
    title: "気になることを聞いてみてください",
    desc: "質問を残していただくと、研究所が確認の上お答えします。",
    askBtn: "質問する",
    cancelBtn: "キャンセル",
    nameLabel: "お名前",
    titleLabel: "タイトル",
    contentLabel: "内容",
    submitBtn: "投稿する",
    submitting: "投稿中...",
    empty: "まだ質問がありません。",
    repliedBadge: "回答済み",
    waitingBadge: "回答待ち",
    successMsg: "質問が投稿されました。",
    errorMsg: "投稿中にエラーが発生しました。",
  },
};

const zh: Dictionary = {
  header: {
    nav: { services: "服务", about: "研究所介绍", guide: "咨询指南", channels: "渠道" },
    consult: "预约咨询",
    qna: "问答",
    admin: "管理员",
  },
  visitCounter: { label: "累计访问" },
  hero: {
    eyebrow: "AI × 命理学",
    subtitle: "AI与传统命理学携手，\n为您人生与事业的重要决策提供支持。",
    cta1: "预约咨询",
    cta2: "查看AI报告",
    cta3: "咨询案例",
  },
  serviceMenu: {
    eyebrow: "Services",
    title: "无论什么困扰，八字都能指明方向",
    items: [
      { title: "个人八字", desc: "梳理与生俱来的气质与人生走向。" },
      { title: "合婚", desc: "解读两人八字的和谐与平衡。" },
      { title: "职业·前程", desc: "提出符合个人特质的方向与时机。" },
      { title: "事业运", desc: "把握创业、扩张的最佳时机。" },
      { title: "财运", desc: "解析财运走向与理财策略。" },
      { title: "大运·流年", desc: "一起分析长期与短期的运势走向。" },
      { title: "起名", desc: "提出适合命理的取名方向。" },
      { title: "AI八字报告", desc: "获取AI为您整理的专属分析报告。" },
    ],
  },
  about: {
    eyebrow: "About",
    tagline: "AI八字 Lab",
    body: "深耕命理学多年的崔亨哲四柱命理研究所，通过AI八字Lab平台融合AI技术，快速提供更精准、更一致的分析。将传统命理的洞察与AI的数据整理能力相结合，致力于在人生与事业的重要时刻提供切实的帮助。",
    dataCard: "数据驱动分析",
    myeongriCard: "传统命理学理论",
    orgCardDesc: "AI八字 Lab 运营",
  },
  consultGuide: {
    eyebrow: "How it works",
    title: "咨询只需三个步骤",
    steps: [
      { title: "选择咨询类型", desc: "选择个人八字、合婚、事业运等所需的咨询。" },
      { title: "输入基本信息", desc: "输入出生年月日时等八字分析所需信息。" },
      { title: "填写困扰内容", desc: "留下具体困扰，AI与研究所将共同为您分析。" },
    ],
    cta: "立即预约咨询",
  },
  channels: { eyebrow: "Channels", title: "也可通过其他渠道联系我们" },
  reviews: {
    eyebrow: "Reviews",
    title: "访客·客户评价",
    writeBtn: "写评价",
    cancelBtn: "取消",
    nameLabel: "姓名",
    contentLabel: "评价内容",
    contentPlaceholder: "请分享您的咨询或报告体验",
    submitBtn: "提交",
    submitting: "提交中...",
    empty: "暂无评价。",
    incentive: "现在留下评价，下次咨询即可享受5折优惠！",
    successMsg: "感谢您的宝贵评价。",
    errorMsg: "提交时发生错误。",
  },
  footer: { rights: "All rights reserved." },
  scrollHint: { label: "滚动" },
  consultPage: {
    eyebrow: "预约咨询",
    title: "选择最适合您的咨询方式",
    desc: "选择客户类型（普通/常客）与申请方式（简易/详细），即可打开专属申请表。",
  },
  consultWizard: {
    step1Title: "请先选择客户类型",
    generalTitle: "普通客户",
    generalDesc: "初次到访，或按标准价格使用服务",
    memberTitle: "常客（会员）客户",
    memberDesc: "已有咨询记录 · 适用等级折扣",
    step2Title: "请选择申请方式",
    backToType: "← 重新选择客户类型",
    simpleTitle: "简易申请",
    simpleDesc: "从3种套餐中选择（仅报告 / +聊天·电话 / +面谈）",
    detailTitle: "详细申请",
    detailDesc: "自由组合10种咨询目的与附加选项",
    backToMode: "← 重新选择申请方式",
    badgeGeneral: "普通",
    badgeMember: "常客（会员）",
    badgeSimple: "简易",
    badgeDetail: "详细",
    packageLabel: "选择套餐",
    purposeLabel: "咨询目的（可多选）",
    addonLabel: "附加选项",
    totalLabel: "预计费用",
    memberDiscountNote: "已应用常客折扣（具体等级折扣率由管理员设定）",
    nameLabel: "姓名",
    genderLabel: "性别",
    male: "男",
    female: "女",
    birthLabel: "出生年月日时（例：1990-05-15 15点，请注明是否为农历）",
    birthPlaceholder: "1990-05-15 15点（阳历）",
    birthDateLabel: "出生日期",
    birthHourLabel: "出生时间",
    birthHourPlaceholder: "选择时间",
    birthTimeUnknownLabel: "出生时间不详",
    calendarTypeLabel: "阳历 / 农历",
    solarLabel: "阳历",
    lunarLabel: "农历",
    leapMonthLabel: "闰月",
    birthPreviewPrefix: "已填写: ",
    birthDateRequired: "请选择出生日期。",
    birthTimeRequired: "请选择出生时间，或勾选“出生时间不详”。",
    birthDateFuture: "出生日期必须早于今天。",
    yearPlaceholder: "年",
    monthPlaceholder: "月",
    dayPlaceholder: "日",
    manualEntryToggle: "手动输入",
    manualEntryBack: "返回选择输入",
    manualEntryPlaceholder: "例如：1990年5月15日15点",
    manualEntryHint: "请输入年-月-日格式，或自由填写，如“1990年5月15日15点”。系统会自动解析并显示在下方摘要中。",
    contactLabel: "联系方式",
    concernLabel: "困扰内容",
    submitBtn: "提交申请",
    doneTitle: "申请已受理",
    doneDesc: "如果邮件客户端未打开，请直接发送以下内容。我们会尽快与您联系。",
    priceUnit: "韩元",
    mostBadge: "大多数人选这个",
    fastestBadge: "最快的方式",
    saveDelayed: "数据库响应延迟，未能确认自动保存。我们会核对通过邮件收到的内容后与你联系。",
    saveFailed: "保存请求失败。我们会核对通过邮件收到的内容后与你联系。",
    payTitle: "付款说明",
    payAmount: "应付金额",
    payRefNo: "受理编号",
    payRefNoHint: "核对入金时会用到，请妥善保存。",
    payStep1: "请通过下方按钮汇款<b>%A</b>。金额需要你自行填写。",
    payStep2: "汇款人姓名请<b>与申请人姓名一致</b>。不一致会导致确认延迟。",
    payStep3: "确认到账后，我们会在<b>%D个工作日内</b>与你联系。",
    payKakaoBtn: "用 KakaoPay 汇款",
    payBankTitle: "希望银行转账的话",
    payHolder: "账户名",
    payDepositName: "汇款人姓名",
    payAfter: "付款后无需另行告知，确认到账后我们会主动联系你。",
    payLawTitle: "付款前请务必确认",
    payLawBody: "报告一旦开始发送，依据韩国《电子商务法》第17条第2款第5项，撤销申请将受到限制。咨询在开始之前可全额退款。",
    payRefundLink: "查看退款与撤销规定",
    payCopyBtn: "复制申请内容",
    payCopied: "已复制",
    payVat: "含增值税。",
    namingNoticeT: "申请取名前请务必确认",
    namingNoticeD: "需要孩子的<b>姓氏</b>才能开始取名，请写在下方的「还想告诉我们的内容」里。若尚未出生，填写<b>预产期与时辰</b>即可；实际出生时辰确定后我们会免费重新校验。",
  },
  reportPage: {
    eyebrow: "AI命理报告",
    title: "输入信息，AI将为您分析八字",
    desc: "AI基于按韩国天文研究院（KASI）历法精确计算的八字数据撰写报告。",
  },
  reportForm: {
    disclaimer: "免费AI简易分析仅供参考，极少数情况下可能存在误差。如需精确解读，请在查看报告后使用「请求专家确认」按钮。",
    nameLabel: "姓名",
    genderLabel: "性别",
    male: "男",
    female: "女",
    birthLabel: "出生日期",
    yearPh: "年（YYYY）",
    monthPh: "月",
    dayPh: "日",
    lunar: "农历",
    leapMonth: "闰月",
    timeLabel: "出生时间",
    hourPh: "时（0-23）",
    minutePh: "分",
    timeUnknown: "时间不详",
    consultTypeLabel: "咨询类型",
    contactLabel: "联系方式（选填）",
    concernLabel: "困扰内容",
    submitBtn: "生成AI报告",
    loadingBtn: "AI正在分析您的八字...",
    requiredError: "请填写所有必填项。",
    pillars: { year: "年柱", month: "月柱", day: "日柱", hour: "时柱", unknown: "不详" },
    resultDisclaimer: "本报告由AI自动生成，为免费简易分析，极少数情况下可能包含计算误差或解读不准确之处。如作重要决策参考，请务必请求专家确认。",
    expertBtn: "请求专家确认",
    retryBtn: "重新填写",
    consultTypes: ["个人八字", "合婚", "职业·前程", "事业运", "财运", "大运·流年", "起名", "综合分析"],
  },
  casesPage: {
    eyebrow: "咨询案例",
    title: "提前查看真实咨询报告",
    desc: "以下是我们实际撰写的AI命理报告案例。打开报告了解风格，再以您喜欢的方式预约咨询。",
    empty: "暂无已发布的咨询案例，敬请期待。",
    viewBtn: "查看完整报告 →",
  },
  qnaPage: {
    eyebrow: "问答",
    title: "有任何疑问都可以提问",
    desc: "留下您的问题，研究所确认后会为您解答。",
    askBtn: "提问",
    cancelBtn: "取消",
    nameLabel: "姓名",
    titleLabel: "标题",
    contentLabel: "内容",
    submitBtn: "提交",
    submitting: "提交中...",
    empty: "暂无提问。",
    repliedBadge: "已回复",
    waitingBadge: "待回复",
    successMsg: "您的问题已提交。",
    errorMsg: "提交时发生错误。",
  },
};

const fr: Dictionary = {
  header: {
    nav: { services: "Services", about: "À propos", guide: "Comment ça marche", channels: "Chaînes" },
    consult: "Prendre RDV",
    qna: "Q&R",
    admin: "Admin",
  },
  visitCounter: { label: "Visites totales" },
  hero: {
    eyebrow: "IA × Myeongri (BaZi coréen)",
    subtitle: "L'IA et le myeongri traditionnel s'unissent\npour éclairer vos grandes décisions de vie et d'affaires.",
    cta1: "Prendre RDV",
    cta2: "Voir le rapport IA",
    cta3: "Études de cas",
  },
  serviceMenu: {
    eyebrow: "Services",
    title: "Quelle que soit la question, votre thème indique la voie",
    items: [
      { title: "Thème personnel", desc: "Un éclairage clair sur votre tempérament et votre parcours de vie." },
      { title: "Compatibilité", desc: "L'équilibre et l'harmonie entre les thèmes de deux personnes." },
      { title: "Carrière", desc: "Orientations et moments propices selon vos aptitudes." },
      { title: "Réussite professionnelle", desc: "Le bon moment pour lancer ou développer une activité." },
      { title: "Fortune", desc: "Comment l'argent circule pour vous, et comment le gérer." },
      { title: "Cycles de chance", desc: "Votre fortune sur le long et le court terme." },
      { title: "Choix de prénom", desc: "Des orientations de prénom adaptées à votre thème." },
      { title: "Rapport IA Saju", desc: "Recevez votre rapport d'analyse généré par IA." },
    ],
  },
  about: {
    eyebrow: "About",
    tagline: "AI Saju Lab",
    body: "L'Institut de recherche Myeongri de Choi Hyung-cheol, fort de longues années d'étude du myeongri traditionnel, propose via la plateforme AI Saju Lab des analyses plus précises et cohérentes, délivrées rapidement grâce à l'IA. En combinant la finesse traditionnelle avec la puissance de traitement des données de l'IA, nous visons à apporter une aide concrète dans les moments importants de votre vie et de vos affaires.",
    dataCard: "Analyse fondée sur les données",
    myeongriCard: "Théorie du myeongri traditionnel",
    orgCardDesc: "Géré par AI Saju Lab",
  },
  consultGuide: {
    eyebrow: "How it works",
    title: "Trois étapes suffisent",
    steps: [
      { title: "Choisir un type de consultation", desc: "Thème personnel, compatibilité, réussite professionnelle, etc." },
      { title: "Renseigner vos informations", desc: "Indiquez votre date et heure de naissance pour l'analyse du thème." },
      { title: "Décrire votre préoccupation", desc: "Partagez votre question précise pour que l'IA et l'équipe l'analysent ensemble." },
    ],
    cta: "Prendre RDV maintenant",
  },
  channels: { eyebrow: "Channels", title: "Retrouvez-nous aussi sur nos autres canaux" },
  reviews: {
    eyebrow: "Reviews",
    title: "Avis des visiteurs et clients",
    writeBtn: "Laisser un avis",
    cancelBtn: "Annuler",
    nameLabel: "Nom",
    contentLabel: "Avis",
    contentPlaceholder: "Partagez votre expérience de consultation ou de rapport",
    submitBtn: "Envoyer",
    submitting: "Envoi...",
    empty: "Aucun avis pour le moment.",
    incentive: "Laissez un avis dès maintenant et bénéficiez de 50% de réduction sur votre prochaine consultation !",
    successMsg: "Merci pour votre avis.",
    errorMsg: "Une erreur est survenue lors de l'envoi.",
  },
  footer: { rights: "All rights reserved." },
  scrollHint: { label: "Défiler" },
  consultPage: {
    eyebrow: "Prendre RDV",
    title: "Choisissez la consultation qui vous convient",
    desc: "Choisissez votre type de client (standard/habitué) et le mode de demande (simple/détaillé) pour ouvrir le formulaire adapté.",
  },
  consultWizard: {
    step1Title: "D'abord, choisissez votre type de client",
    generalTitle: "Client standard",
    generalDesc: "Première visite, ou tarif standard",
    memberTitle: "Client habitué (membre)",
    memberDesc: "Historique de consultation existant · remises selon le niveau",
    step2Title: "Choisissez un mode de demande",
    backToType: "← Revenir au type de client",
    simpleTitle: "Demande simple",
    simpleDesc: "Choisissez parmi 3 forfaits (rapport seul / +chat·appel / +en personne)",
    detailTitle: "Demande détaillée",
    detailDesc: "Combinez 10 objectifs de consultation avec des options",
    backToMode: "← Revenir au mode de demande",
    badgeGeneral: "Standard",
    badgeMember: "Habitué (membre)",
    badgeSimple: "Simple",
    badgeDetail: "Détaillé",
    packageLabel: "Choisir un forfait",
    purposeLabel: "Objectif de consultation (choix multiple)",
    addonLabel: "Options supplémentaires",
    totalLabel: "Prix estimé",
    memberDiscountNote: "Remise habitué appliquée (taux exact défini par l'administrateur)",
    nameLabel: "Nom",
    genderLabel: "Genre",
    male: "Homme",
    female: "Femme",
    birthLabel: "Date et heure de naissance (ex. 1990-05-15 15h, préciser si calendrier lunaire)",
    birthPlaceholder: "1990-05-15 15h (calendrier solaire)",
    birthDateLabel: "Date de naissance",
    birthHourLabel: "Heure de naissance",
    birthHourPlaceholder: "Choisir l'heure",
    birthTimeUnknownLabel: "Heure de naissance inconnue",
    calendarTypeLabel: "Calendrier solaire / lunaire",
    solarLabel: "Solaire",
    lunarLabel: "Lunaire",
    leapMonthLabel: "Mois intercalaire",
    birthPreviewPrefix: "Vous avez saisi : ",
    birthDateRequired: "Veuillez sélectionner votre date de naissance.",
    birthTimeRequired: "Veuillez sélectionner une heure de naissance ou cocher « Heure de naissance inconnue ».",
    birthDateFuture: "La date de naissance doit être antérieure à aujourd'hui.",
    yearPlaceholder: "Année",
    monthPlaceholder: "Mois",
    dayPlaceholder: "Jour",
    manualEntryToggle: "Saisie libre",
    manualEntryBack: "Retour aux listes",
    manualEntryPlaceholder: "ex. 15 mai 1990, 15h",
    manualEntryHint: "Utilisez AAAA-MM-JJ ou écrivez librement, ex. « 1990-05-15 15h ». C'est analysé automatiquement ci-dessous.",
    contactLabel: "Contact",
    concernLabel: "Votre préoccupation",
    submitBtn: "Envoyer la demande",
    doneTitle: "Votre demande a été reçue",
    doneDesc: "Si votre client de messagerie ne s'est pas ouvert, veuillez envoyer directement les informations ci-dessous. Nous vous contacterons rapidement.",
    priceUnit: "KRW",
    mostBadge: "La plupart des gens",
    fastestBadge: "Le plus rapide",
    saveDelayed: "La base de données a mis trop de temps à répondre : l'enregistrement automatique n'a pas pu être confirmé. Nous vérifierons ce qui nous est parvenu par e-mail et vous recontacterons.",
    saveFailed: "L'enregistrement a échoué. Nous vérifierons ce qui nous est parvenu par e-mail et vous recontacterons.",
    payTitle: "Comment payer",
    payAmount: "Montant à régler",
    payRefNo: "N° de dossier",
    payRefNoHint: "Conservez-le : il nous sert à rapprocher votre paiement.",
    payStep1: "Envoyez <b>%A</b> via le bouton ci-dessous. Vous devrez saisir le montant vous-même.",
    payStep2: "Indiquez comme émetteur <b>le même nom que sur cette demande</b>. Un nom différent retarde la confirmation.",
    payStep3: "Dès votre paiement confirmé, nous vous contactons <b>sous %D jours ouvrés</b>.",
    payKakaoBtn: "Payer avec KakaoPay",
    payBankTitle: "Si vous préférez le virement bancaire",
    payHolder: "Titulaire du compte",
    payDepositName: "Nom de l'émetteur",
    payAfter: "Inutile de nous prévenir après le paiement : nous vous contactons dès réception.",
    payLawTitle: "À lire avant de payer",
    payLawBody: "Une fois l'envoi du rapport commencé, la rétractation est limitée par l'article 17(2)5 de la loi coréenne sur le commerce électronique. Les consultations sont intégralement remboursables tant qu'elles n'ont pas commencé.",
    payRefundLink: "Voir la politique de remboursement",
    payCopyBtn: "Copier ma demande",
    payCopied: "Copié",
    payVat: "TVA incluse.",
    namingNoticeT: "Avant de demander une nomination",
    namingNoticeD: "Nous avons besoin du <b>nom de famille</b> de l'enfant. Indiquez-le dans le champ ci-dessous. S'il n'est pas encore né, saisissez la <b>date et l'heure prévues</b> : nous revérifions gratuitement une fois l'heure réelle connue.",
  },
  reportPage: {
    eyebrow: "Rapport IA Saju",
    title: "Entrez vos informations, l'IA analyse votre thème",
    desc: "L'IA rédige votre rapport à partir de données calculées précisément selon le calendrier de référence KASI.",
  },
  reportForm: {
    disclaimer: "L'analyse rapide gratuite par IA est fournie à titre indicatif et peut rarement contenir des erreurs. Pour une interprétation précise, utilisez le bouton « Demander une revue par un expert » après avoir consulté le rapport.",
    nameLabel: "Nom",
    genderLabel: "Genre",
    male: "Homme",
    female: "Femme",
    birthLabel: "Date de naissance",
    yearPh: "Année (AAAA)",
    monthPh: "Mois",
    dayPh: "Jour",
    lunar: "Calendrier lunaire",
    leapMonth: "Mois intercalaire",
    timeLabel: "Heure de naissance",
    hourPh: "Heure (0-23)",
    minutePh: "Minute",
    timeUnknown: "Heure inconnue",
    consultTypeLabel: "Type de consultation",
    contactLabel: "Contact (optionnel)",
    concernLabel: "Votre préoccupation",
    submitBtn: "Générer le rapport IA",
    loadingBtn: "L'IA analyse votre thème...",
    requiredError: "Veuillez remplir tous les champs obligatoires.",
    pillars: { year: "Année", month: "Mois", day: "Jour", hour: "Heure", unknown: "Inconnu" },
    resultDisclaimer: "Ce rapport a été généré automatiquement par IA dans le cadre d'une analyse rapide gratuite et peut rarement contenir des erreurs de calcul ou une interprétation inexacte. Merci de demander une revue par un expert avant toute décision importante.",
    expertBtn: "Demander une revue par un expert",
    retryBtn: "Recommencer",
    consultTypes: ["Thème personnel", "Compatibilité", "Carrière", "Réussite professionnelle", "Fortune", "Cycles de chance", "Choix de prénom", "Analyse complète"],
  },
  casesPage: {
    eyebrow: "Études de cas",
    title: "Découvrez de vrais rapports de consultation",
    desc: "Voici des exemples réels de rapports myeongri IA que nous avons rédigés. Ouvrez-en un, puis réservez la consultation qui vous convient.",
    empty: "Aucune étude de cas publiée pour le moment.",
    viewBtn: "Voir le rapport complet →",
  },
  qnaPage: {
    eyebrow: "Q&R",
    title: "Posez-nous vos questions",
    desc: "Laissez une question, notre équipe l'examinera et vous répondra.",
    askBtn: "Poser une question",
    cancelBtn: "Annuler",
    nameLabel: "Nom",
    titleLabel: "Titre",
    contentLabel: "Contenu",
    submitBtn: "Envoyer",
    submitting: "Envoi...",
    empty: "Aucune question pour le moment.",
    repliedBadge: "Répondu",
    waitingBadge: "En attente",
    successMsg: "Votre question a été publiée.",
    errorMsg: "Une erreur est survenue lors de l'envoi.",
  },
};

const dictionaries: Record<Lang, Dictionary> = { ko, en, ja, zh, fr };

export function getDict(lang: Lang): Dictionary {
  return dictionaries[lang] ?? dictionaries.en;
}

/** 가격 표시 단위(통화 변환 없이 표기만 언어별로 다르게) */
export function formatPrice(value: number, lang: Lang) {
  const amount = value.toLocaleString("en-US");
  if (lang === "ko") return `${amount}원`;
  if (lang === "ja") return `${amount}ウォン`;
  if (lang === "zh") return `${amount}韩元`;
  return `${amount} KRW`;
}
