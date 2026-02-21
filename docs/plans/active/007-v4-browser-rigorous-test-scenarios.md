---
owner: "@repo-owner"
status: draft
last_reviewed: 2026-02-21
---

# V4 Browser Rigorous Test Scenarios (신규 유저 기준)

## 1. 문서 목적

이 문서는 **"새로 유입된 유저 1명"** 관점에서 PerspectiveShift의 브라우저 기능을 전반적으로 검증하기 위한 상세 시나리오다.
대상은 수동 브라우저 테스트이며, 필요 시 Playwright 자동화 시나리오로 전환 가능하도록 케이스 ID를 고정한다.

### 1.1 케이스 ID 체계

| 접두사 | 영역 | 설명 |
|--------|------|------|
| **A** | 접근/리다이렉트/탭 | 미들웨어, 라우트 보호, 네비게이션 |
| **B** | 랜딩/로그인/온보딩 | 퍼널 전환, Trust Moment, 질문 응답, 결과 |
| **C** | 매칭/대화(익명) | 후보 탐색, 에너지 반응, FSM 대화, 피드백, 요약 |
| **D** | 인증 유저 기능 | 친구, 채팅, 오프라인, 신고 |
| **E** | 설정/패스포트/PWA | 데이터 관리, 알림, 뱃지, 서비스워커 |
| **F** | API 직접 검증 | UI 비노출 포함 API 스키마/상태 코드 |
| **G** | 보안/프라이버시/회귀 | 개인정보, 입력 검증, 접근성, 반응형, 성능 |

### 1.2 Playwright 전환 가이드

각 케이스는 아래 구조로 설계되어 Playwright 자동화로 1:1 전환 가능하다:

```typescript
// 케이스 ID → 테스트 함수 매핑 예시
test("A-001 익명 유저 보호 라우트 리다이렉트", async ({ page }) => {
  // 1단계: 행동
  await page.goto("/friends");
  // 2단계: 검증
  await expect(page).toHaveURL(/\/auth\/login\?next=%2Ffriends/);
});
```

**선택자 전략** (우선순위):
1. `role` + `name` — `page.getByRole("button", { name: "생각 발견 시작하기" })`
2. `data-testid` — `page.getByTestId("energy-card")`
3. `text` — `page.getByText("아직 대화가 없어요")`
4. CSS selector — 최후 수단

---

## 2. 범위

| 구분 | 경로 | 인증 | 핵심 기능 |
|------|------|------|-----------|
| 퍼널 | `/` | 익명 | 랜딩, CTA |
| 퍼널 | `/auth/login` | 익명/인증 | 매직링크 로그인, 인증 시 리다이렉트 |
| 퍼널 | `/onboarding` | 익명 | Trust Moment, 인구통계, 정밀도, 질문 답변 |
| 퍼널 | `/onboarding/result` | 익명 | Thought Map 결과, 공유 |
| 메인 | `/matching` | 익명 | 매칭 후보, 에너지 반응형 카드, AI 페르소나 fallback |
| 메인 | `/dialogue` | 익명 | 대화 목록 |
| 메인 | `/dialogue/:id` | 익명 | 대화 상세, 턴 제출, 경고/타이핑/완료 상태 |
| 메인 | `/dialogue/:id/feedback` | 익명 | 만족도, 재매칭 의사, 감정 입력 |
| 메인 | `/dialogue/:id/summary` | 익명 | 요약 카드 |
| 관계 | `/friends` | 인증 | 친구 목록/빈 상태 |
| 관계 | `/friends/:id` | 인증 | 공개 레벨, 라이트 프로토콜, 채팅/오프라인 진입 |
| 몰입 | `/chat/:friendshipId` | 인증 | 실시간 채팅 UI, 마이크로 체크인 |
| 관계 | `/offline?friendshipId=...` | 인증 | 오프라인 제안 생성 |
| 관계 | `/offline/:id` | 인증 | 오프라인 제안 응답/체크인 |
| 안전 | `/safety/report?userId=...` | 인증 | 신고 제출 |
| 설정 | `/settings` | 인증 | 더보기, 로그아웃 |
| 설정 | `/settings/data-management` | 인증 | 데이터 관리 UX |
| 설정 | `/settings/notifications` | 인증 | 알림 토글, 7일 끄기, 권한 요청 |
| 메인 | `/passport` | 인증 | 뱃지/발견/저장 페르소나 탭 |

---

## 3. 사전 준비

### 3.1 환경 및 플래그

| 항목 | 설정 | 비고 |
|------|------|------|
| `.env.local` | Supabase URL + Anon Key | 필수 |
| `FEATURE_RELATIONSHIP` | `true` | 관계 기능 전체 검증 시 |
| `OPENAI_API_KEY` | 선택 | 온보딩 결과 정밀도/품질 확인 목적 |
| `LANGSMITH_API_KEY` | 선택 | 에이전트 트레이싱 확인 시 |

### 3.2 브라우저 매트릭스

| 우선순위 | Desktop | Mobile |
|----------|---------|--------|
| **P0** (핵심) | Chrome 최신 | iOS Safari 최신 |
| **P1** (회귀) | Edge 최신 | — |
| **P2** (확장) | Safari 최신 | Android Chrome 최신 |

**최소 실행 매트릭스:**
- P0 케이스: Desktop Chrome + Mobile Safari (390×844)
- P1 케이스: Desktop Chrome + Desktop Edge
- P2 케이스: Desktop Safari + Android Chrome

### 3.3 테스트 계정/데이터

| 구분 | 요구사항 | 용도 |
|------|----------|------|
| 익명 프로필 | 깨끗한 브라우저 세션 1개 | 퍼널/온보딩/매칭 |
| 인증 계정 A | 이메일 로그인 가능 | 친구/채팅/설정 검증 |
| 인증 계정 B | 이메일 로그인 가능 | 상대방 역할 (친구 요청/대화) |
| Friendship 데이터 | 계정 A-B 간 1건 이상 | 채팅/오프라인 검증 |
| Dialogue 세션 | 활성 1건 + 완료 1건 | 대화 상세/피드백/요약 검증 |
| AI 페르소나 | personas API 응답 1건 이상 | 페르소나 fallback 검증 |

### 3.4 실행 전 초기화 체크리스트

```
□ 브라우저 쿠키 전체 삭제
□ localStorage 전체 삭제
□ sessionStorage 전체 삭제
□ DevTools 열기 → Network 탭 고정
□ DevTools → Application 탭 고정
□ DevTools → Console 탭 고정
□ Network 탭에서 "Disable cache" 체크
□ Network 탭에서 "Preserve log" 체크 (페이지 전환 시 로그 유지)
□ Console에서 "Preserve log" 체크
```

---

## 4. 공통 검증 규칙

### 4.1 모든 케이스 공통 (CK: Common checK)

| ID | 검증 항목 | 확인 방법 |
|----|-----------|-----------|
| CK-01 | UI 텍스트/버튼/링크가 기대 상태 | 육안 확인 |
| CK-02 | Network에서 API 상태 코드 확인 | DevTools Network 탭 |
| CK-03 | Network에서 요청 본문 확인 | Request Payload 탭 |
| CK-04 | Network에서 응답 본문 확인 | Response 탭 |
| CK-05 | Application에서 로컬 저장소 키 변경 확인 | DevTools Application 탭 |
| CK-06 | 콘솔 에러 발생 여부 확인 | DevTools Console 탭 (빨간색 에러 0건) |
| CK-07 | 페이지 전환 시 URL 정확성 | 주소창 확인 |

### 4.2 네트워크 공통 헤더

| 검증 항목 | 기대값 |
|-----------|--------|
| `/api/*` 응답 `Cache-Control` | `no-store, no-cache, must-revalidate` |
| 익명 API 호출 `X-Session-Id` 헤더 | UUID 형식 값 존재 |
| 인증 API 호출 Cookie | Supabase 세션 쿠키 포함 |

### 4.3 스토리지 공통 키

| 키 | 저장소 | 용도 | 형식 |
|----|--------|------|------|
| `ps-session-id` | localStorage | 익명 세션 식별 | UUID |
| `onboarding_session` | sessionStorage | 온보딩 세션 | UUID |
| `ps-notification-config` | localStorage | 알림 채널 설정 | JSON `{d1_review:bool,...}` |
| `ps-notification-snooze-until` | localStorage | 알림 일시정지 기한 | ISO 8601 날짜 |

### 4.4 Playwright 공통 헬퍼 (자동화 전환 시)

```typescript
// 공통 fixture: 깨끗한 세션 보장
async function cleanSession(page: Page) {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

// API 응답 대기 헬퍼
async function waitForApi(page: Page, urlPattern: string) {
  return page.waitForResponse((r) =>
    r.url().includes(urlPattern) && r.status() < 400
  );
}

// 콘솔 에러 수집기
function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  return errors;
}
```

---

## 5. 상세 시나리오

---

## A. 접근/리다이렉트/탭 네비게이션

### A-001 익명 유저 보호 라우트 리다이렉트

**전제조건:** 비인증 상태 (쿠키 없음)

**절차:**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | 주소창에 `/friends` 입력 후 Enter | URL이 `/auth/login?next=%2Ffriends`로 변경됨 |
| 2 | 주소창에 `/friends/some-uuid` 입력 후 Enter | URL이 `/auth/login?next=%2Ffriends%2Fsome-uuid`로 변경됨 |
| 3 | 주소창에 `/chat/some-friendship-id` 입력 후 Enter | URL이 `/auth/login?next=%2Fchat%2Fsome-friendship-id`로 변경됨 |
| 4 | 주소창에 `/offline/some-id` 입력 후 Enter | URL이 `/auth/login?next=%2Foffline%2Fsome-id`로 변경됨 |
| 5 | 주소창에 `/safety/report` 입력 후 Enter | URL이 `/auth/login?next=%2Fsafety%2Freport`로 변경됨 |
| 6 | 주소창에 `/settings` 입력 후 Enter | URL이 `/auth/login?next=%2Fsettings`로 변경됨 |
| 7 | 주소창에 `/settings/data-management` 입력 후 Enter | URL이 `/auth/login?next=%2Fsettings%2Fdata-management`로 변경됨 |
| 8 | 주소창에 `/settings/notifications` 입력 후 Enter | URL이 `/auth/login?next=%2Fsettings%2Fnotifications`로 변경됨 |

**네트워크 확인:**
- 각 요청에서 302 리다이렉트 발생
- 리다이렉트 Location 헤더에 `/auth/login?next=...` 포함

**Playwright 힌트:**
```typescript
test("A-001", async ({ page }) => {
  const routes = ["/friends", "/friends/some-uuid", "/chat/some-id",
    "/offline/some-id", "/safety/report", "/settings",
    "/settings/data-management", "/settings/notifications"];
  for (const route of routes) {
    await page.goto(route);
    await expect(page).toHaveURL(new RegExp(
      `/auth/login\\?next=${encodeURIComponent(route).replace(/%/g, "%25")}`
    ));
  }
});
```

---

### A-002 익명 유저 공개 라우트 접근

**전제조건:** 비인증 상태

**절차:**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | `/` 접속 | 랜딩 페이지 정상 렌더링, 리다이렉트 없음 |
| 2 | `/onboarding` 접속 | Trust Moment 화면 정상 렌더링 |
| 3 | `/matching` 접속 | 매칭 페이지 정상 렌더링 (로딩 → 콘텐츠) |
| 4 | `/dialogue` 접속 | 대화 목록 정상 렌더링 |
| 5 | `/auth/login` 접속 | 로그인 폼 정상 렌더링 |

**검증 상세:**
- 각 페이지에서 콘솔 에러 0건
- URL이 변경되지 않고 입력한 경로 그대로 유지
- 각 페이지의 H1 텍스트:
  - `/`: "새로운 관점을 만나보세요"
  - `/onboarding`: "나의 생각 발견하기"
  - `/matching`: "대화 상대 찾기"
  - `/dialogue`: "내 대화 목록"
  - `/auth/login`: "PerspectiveShift"

---

### A-003 인증 유저 로그인 라우트 차단

**전제조건:** 인증 완료 상태 (유효한 Supabase 세션 쿠키)

**절차:**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | 주소창에 `/auth/login` 입력 후 Enter | URL이 `/friends`로 즉시 리다이렉트 |
| 2 | `/auth/login?next=/matching` 입력 후 Enter | URL이 `/friends`로 리다이렉트 (`next` 파라미터 무시됨) |

**네트워크 확인:**
- 미들웨어에서 302 리다이렉트 → Location: `/friends`

---

### A-004 익명 하단 탭 검증

**전제조건:** 비인증 상태

**절차:**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | `/matching` 접속 | 하단 탭바 표시됨 |
| 2 | 탭 항목 확인 | `매칭`, `대화`, `로그인` 3개 탭 존재 |
| 3 | `매칭` 탭 상태 확인 | `aria-selected="true"` 또는 활성 스타일 적용 |
| 4 | `대화` 탭 클릭 | URL이 `/dialogue`로 전환 |
| 5 | `대화` 탭 상태 확인 | `대화` 탭이 활성 상태로 전환 |
| 6 | `로그인` 탭 클릭 | URL이 `/auth/login`로 전환 |
| 7 | `친구` 탭 존재 여부 확인 | `친구` 탭이 표시되지 **않음** |
| 8 | `더보기` 탭 존재 여부 확인 | `더보기` 탭이 표시되지 **않음** |

**접근성 검증:**
- 탭바: `role="tablist"` 또는 `<nav>` 시맨틱
- 각 탭: `role="tab"` 또는 `<a>` 링크
- 활성 탭: `aria-selected="true"` 또는 `aria-current="page"`

**Playwright 힌트:**
```typescript
test("A-004", async ({ page }) => {
  await page.goto("/matching");
  const tabs = page.locator("nav a, [role=tab]");
  await expect(tabs).toHaveCount(3);
  await expect(tabs.nth(0)).toContainText("매칭");
  await expect(tabs.nth(1)).toContainText("대화");
  await expect(tabs.nth(2)).toContainText("로그인");
  await tabs.nth(1).click();
  await expect(page).toHaveURL("/dialogue");
});
```

---

### A-005 인증 하단 탭 검증

**전제조건:** 인증 완료 상태

**절차:**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | `/friends` 접속 | 하단 탭바 표시됨 |
| 2 | 탭 항목 확인 | `매칭`, `대화`, `친구`, `더보기` 4개 탭 존재 |
| 3 | `로그인` 탭 존재 여부 확인 | `로그인` 탭이 표시되지 **않음** |
| 4 | `친구` 탭 상태 확인 | 활성 상태 |
| 5 | `매칭` 탭 클릭 | `/matching` 이동 |
| 6 | `대화` 탭 클릭 | `/dialogue` 이동 |
| 7 | `더보기` 탭 클릭 | `/settings` 이동 |
| 8 | `/settings`에서 탭 상태 확인 | `더보기` 탭 활성 |
| 9 | `/passport` 접속 | 탭바 표시, 적절한 탭 활성 |
| 10 | `/safety/report?userId=x` 접속 | 탭바 표시, `더보기` 탭 활성 |

---

### A-006 인증 유저 랜딩 페이지 자동 리다이렉트

**전제조건:** 인증 완료 상태

**절차:**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | `/` 접속 | 로딩 스피너가 잠시 표시됨 |
| 2 | 리다이렉트 대기 | URL이 `/friends`로 자동 전환 |
| 3 | 콘솔 확인 | 에러 없음 |

**구현 참조:** `src/app/page.tsx` — `useAuth()` → `isAuthenticated === true` → `router.replace("/friends")`

---

### A-007 딥링크 next 파라미터 복원

**전제조건:** 비인증 상태

**절차:**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | `/friends/some-uuid` 접속 → `/auth/login?next=%2Ffriends%2Fsome-uuid`로 리다이렉트됨 | `next` 파라미터 정확 |
| 2 | 매직 링크로 로그인 완료 | 로그인 성공 |
| 3 | 로그인 후 리다이렉트 확인 | `/friends/some-uuid`로 복원 (또는 `/friends`로 기본 이동) |

> **참고:** 현재 로그인 후 `next` 복원 구현 여부에 따라 결과가 다를 수 있음. 미구현 시 버그로 기록.

---

## B. 랜딩/로그인/온보딩

### B-001 랜딩 기본 UI

**전제조건:** 비인증 상태, 깨끗한 세션

**절차:**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | `/` 접속 | 페이지 로드 완료 |
| 2 | 메인 타이틀 확인 | "새로운 관점을 만나보세요" 텍스트 표시 |
| 3 | 서브타이틀 확인 | "안전하고 구조화된 대화를 통해 다른 시각을 이해해보세요" 표시 |
| 4 | CTA 버튼 확인 | "생각 발견 시작하기" 버튼 표시, 클릭 가능 상태 |
| 5 | 개인정보 문구 확인 | "🔒 대화는 익명 · 데이터는 내 손 안에" 표시 |
| 6 | 데이터 관리 링크 확인 | "내 데이터 관리" 링크 존재, `href="/settings/data-management"` |
| 7 | 로그인 링크 확인 | "이미 계정이 있나요?" + "로그인" 링크 존재, `href="/auth/login"` |
| 8 | 레이아웃 확인 | 콘텐츠가 수직 중앙 정렬, 좌우 패딩 적용 |

**시각적 검증:**
- 배경: Paper 텍스처 (`--color-paper: #FAFAF9`)
- 타이틀: Noto Serif KR 서체 (세리프)
- CTA 버튼: `--color-indigo-depth` 배경, 흰색 텍스트, pill 형태
- 잠금 아이콘: `aria-hidden="true"`

**콘솔 검증:**
- 에러 0건
- 경고 중 무시 가능한 것 외 없음

---

### B-002 랜딩 CTA 이동

**전제조건:** B-001 완료 상태

**절차:**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | "생각 발견 시작하기" 버튼 클릭 | URL이 `/onboarding`으로 전환 |
| 2 | 페이지 렌더링 확인 | Trust Moment 화면 표시 |
| 3 | 뒤로가기(브라우저) | `/`로 복귀 |

---

### B-003 로그인 화면 기본 동작

**전제조건:** 비인증 상태

**절차:**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | `/auth/login` 접속 | 로그인 폼 렌더링 |
| 2 | 헤더 확인 | "PerspectiveShift" 텍스트 표시 |
| 3 | 서브헤더 확인 | "이메일로 간편하게 로그인하세요" |
| 4 | 이메일 입력 필드 확인 | `type="email"`, `placeholder="example@email.com"`, `autocomplete="email"` |
| 5 | 이메일 입력 없이 제출 시도 | 버튼이 `disabled` 상태 (클릭 불가) |
| 6 | 유효하지 않은 이메일 입력 (예: "abc") | 브라우저 기본 이메일 검증 표시 또는 버튼 비활성 유지 |
| 7 | 유효한 이메일 입력 (예: "test@example.com") | 버튼 활성화 |
| 8 | "로그인 링크 받기" 클릭 | 로딩 상태 표시 (버튼 스피너) |
| 9 | 성공 응답 대기 | "메일을 확인하세요" 성공 화면 표시 |
| 10 | 성공 화면 확인 | 입력한 이메일 주소 표시 + "메일함을 확인해주세요" |
| 11 | "다른 이메일로 다시 시도" 클릭 | 폼 화면으로 복귀, 이메일 필드 비어있음 |
| 12 | "홈으로 돌아가기" 링크 확인 | `href="/"` |

**에러 시나리오:**

| 단계 | 행동 | 검증 |
|------|------|------|
| E-1 | Supabase 500 에러 유도 (네트워크 차단 등) | 에러 메시지 표시 (빨간색) |
| E-2 | 에러 상태에서 재입력/재제출 | 정상 동작 복구 |

**네트워크 확인:**
- POST 요청: Supabase Auth API (매직 링크 전송)
- 성공: 200 OK
- 실패: 에러 본문에서 메시지 추출

**접근성 검증:**
- `<label htmlFor="email">` → `<input id="email">` 연결
- 버튼: 포커스 가능, Enter 키로 제출 가능
- 에러 메시지: `aria-live="polite"` 또는 동등 처리

---

### B-004 Trust Moment 상세/데이터 관리 진입

**전제조건:** 비인증 상태

**절차:**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | `/onboarding` 접속 | Trust Moment 화면 표시 |
| 2 | Trust Moment 3줄 요약 확인 | 개인정보 보호 관련 핵심 메시지 표시 |
| 3 | "자세히 보기" 클릭 | 상세 설명 영역 토글 열림 (애니메이션) |
| 4 | 상세 설명 내용 확인 | 데이터 수집/보호 정책 상세 내용 |
| 5 | "자세히 보기" 다시 클릭 | 상세 설명 영역 토글 닫힘 |
| 6 | "내 데이터 관리" 링크 클릭 | `/settings/data-management` 이동 |
| 7 | 뒤로가기 | `/onboarding`으로 복귀, Trust Moment 상태 유지 |

---

### B-005 온보딩 단계 전환 (Trust → Demographic)

**전제조건:** B-004 완료 상태 (Trust Moment 화면)

**절차:**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | "시작하기" 버튼 클릭 | Demographic 단계로 전환 |
| 2 | 연령대 선택지 확인 | 연령대 옵션 목록 표시 |
| 3 | 직업군 선택지 확인 | 직업군 옵션 목록 표시 |
| 4 | 아무것도 선택하지 않은 상태 확인 | "다음으로" 버튼 비활성 (`disabled`) |
| 5 | 연령대만 선택 | 버튼 여전히 비활성 |
| 6 | 직업군만 선택 (연령대 해제) | 버튼 여전히 비활성 |
| 7 | 연령대 + 직업군 모두 선택 | "다음으로" 버튼 활성화 |
| 8 | "다음으로" 클릭 | 질문(정밀도 선택) 단계로 전환 |

**스토리지 확인:**
- `sessionStorage.onboarding_session`: UUID 생성됨

---

### B-006 정밀도 선택

**전제조건:** B-005 완료 상태 (Demographic → Questions 전환됨)

**절차:**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | 정밀도 선택 화면 확인 | 3개 카드 표시 |
| 2 | "빠르게 시작" 카드 확인 | 5문항, 예상 시간 표시 |
| 3 | "표준 분석" 카드 확인 | 10문항, 예상 시간 표시, **추천 뱃지** 표시 |
| 4 | "정밀 분석" 카드 확인 | 20문항, 예상 시간 표시 |
| 5 | "빠르게 시작" 선택 | Quick 모드 진입, 핵심 5문항 시작 |

**시각적 검증:**
- 추천 뱃지: "표준 분석" 카드에만 강조 스타일 적용
- 각 카드: 문항 수 + 예상 소요 시간 명시
- 선택 시 카드 선택 상태 시각 피드백 (border 또는 배경 변경)

---

### B-007 핵심 문항 진행 (OX/RUBRIC)

**전제조건:** B-006에서 Quick 모드 선택 완료

**절차:**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | 첫 번째 문항 표시 확인 | 문항 텍스트 + 응답 UI 표시 |
| 2 | 진행 바 확인 | "1/5" 또는 진행률 표시 |
| 3 | **OX 문항일 때:** O/X 버튼 확인 | 두 개 선택지 표시 |
| 4 | O 클릭 | 다음 문항으로 자동 이동, 진행 바 업데이트 |
| 5 | **RUBRIC 문항일 때:** 1~5 스케일 확인 | 5단계 선택지 표시 |
| 6 | 스케일 3 선택 | 다음 문항으로 이동 |
| 7 | **불확실 옵션:** RUBRIC 문항에서 "불확실" 옵션 확인 | "불확실" 버튼/옵션 존재 (RUBRIC만) |
| 8 | "불확실" 선택 | 다음 문항으로 이동, 해당 차원 confidence=LOW 처리 |
| 9 | 5번째 문항까지 응답 완료 | Quick 완료 상태 |
| 10 | 각 문항 전환 시 애니메이션 | 슬라이드 또는 페이드 전환 |

**상세 검증 (특정 문항):**
- q4, q9 문항: "왜 묻는지" 툴팁 표시 ("매칭 시 대화 난이도를 조절하는 데 사용됩니다.")

---

### B-008 Quick Upsell 분기

**전제조건:** B-007 완료 (Quick 5문항 응답 완료)

**절차:**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | 업셀 화면 표시 확인 | "5문항 더 할래요" / "지금 결과 보기" 선택지 |
| 2 | "5문항 더 할래요" 선택 | Standard 확장 문항 시작 (6~10번 문항) |
| 3 | 확장 문항 5개 응답 | 모든 문항 응답 완료 |
| 4 | 결과 생성 진행 | 로딩 화면 → 결과 페이지 이동 |

**대안 경로:**

| 단계 | 행동 | 검증 |
|------|------|------|
| 2-alt | "지금 결과 보기" 선택 | 바로 결과 생성 시작 (로딩) |
| 3-alt | 결과 생성 완료 | `/onboarding/result?data=...` 이동 |

---

### B-009 온보딩 오픈엔드 문항 (확장)

**전제조건:** Standard 또는 Detailed 모드에서 OPEN_ENDED 문항 진입

**절차:**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | OPEN_ENDED 문항 진입 | 텍스트 입력 영역 표시 |
| 2 | 예시 확인 | 예시 텍스트 표시됨 |
| 3 | "이전 예시" 클릭 | 이전 예시로 전환 |
| 4 | "다음 예시" 클릭 | 다음 예시로 전환 |
| 5 | 예시 순환 확인 | 마지막 예시 → 첫 예시로 순환 |
| 6 | "Coach" 토글 클릭 | Coach 힌트 문구 표시/숨김 |
| 7 | 텍스트 입력 없이 "확인" 시도 | 제출 불가 (버튼 비활성 또는 경고) |
| 8 | 텍스트 입력 후 "확인" 클릭 | 다음 문항으로 이동 |

**입력 검증:**
- 빈 문자열: 제출 불가
- 공백만 입력: 제출 불가
- 최소 1자 이상 유효 텍스트: 제출 가능

---

### B-010 온보딩 실패/재시도

**전제조건:** 온보딩 문항 모두 응답 완료 상태

**절차:**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | DevTools에서 네트워크를 Offline으로 변경 | 네트워크 차단됨 |
| 2 | 결과 생성 요청 발생 | API 호출 실패 |
| 3 | 에러 화면 확인 | "생각 분석에 실패했습니다. 다시 시도해주세요." 표시 |
| 4 | 에러 아이콘 확인 | 빨간 배경 원형 + SVG 아이콘 |
| 5 | 네트워크를 Online으로 복원 | 네트워크 복구 |
| 6 | "다시 시도" 버튼 클릭 | API 재요청 발생 |
| 7 | 성공 시 | 결과 페이지로 이동 |

**네트워크 확인:**
- 실패 시: `/api/onboarding/result` POST → 네트워크 에러 또는 500
- 재시도 시: 동일 엔드포인트 재요청
- 성공 시: 200 + ThoughtMapOutput 응답

---

### B-011 온보딩 결과 정상/오류 진입

**전제조건:** 온보딩 결과 페이지 직접 접근 테스트

**시나리오 1: 정상 데이터**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | `/onboarding/result?data=<valid-encoded-json>` 접속 | Thought Map 렌더링 |
| 2 | Thought Map 구성 확인 | 6축 레이더 차트 또는 그리드 시각화 |
| 3 | 별명(alias) 표시 확인 | 예: "제한적 신뢰주의자" |
| 4 | 각 축 포지션 값 표시 | 6개 차원의 수치/위치 표시 |

**시나리오 2: 데이터 누락**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | `/onboarding/result` 접속 (쿼리 파라미터 없음) | "결과 데이터가 없습니다." 표시 |
| 2 | CTA 확인 | "온보딩 시작하기" 또는 "다시 시작하기" 버튼 표시 |
| 3 | CTA 클릭 | `/onboarding`으로 이동 |

**시나리오 3: 잘못된 JSON**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | `/onboarding/result?data=invalid-json-string` 접속 | "결과를 불러올 수 없습니다." 표시 |
| 2 | CTA 클릭 | `/onboarding`으로 이동 |

---

### B-012 Thought Map 결과 액션

**전제조건:** B-011 시나리오 1 완료 (정상 결과 화면)

**절차:**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | "대화 상대 찾기" 버튼 확인 | CTA 버튼 표시 |
| 2 | "대화 상대 찾기" 클릭 | `/matching` 이동 |
| 3 | 뒤로가기 후 결과 화면 복귀 | 결과 데이터 유지 |
| 4 | "공유하기" 버튼 확인 | 공유 버튼 존재 |
| 5-a | (Web Share API 지원 브라우저) "공유하기" 클릭 | 네이티브 공유 시트 표시 |
| 5-b | (Web Share API 미지원) "공유하기" 클릭 | 클립보드 복사 + 복사 완료 피드백 |

**시각적 검증:**
- Thought Map: Blueprint 스타일 시각화 (정치적 좌/우 아님)
- 공유 카드 하단: 프라이버시 문구 존재 (개인 식별 정보 없음 확인)

---

### B-013 온보딩 세션 지속성

**전제조건:** 온보딩 진행 중 (3/5 문항 응답 완료)

**절차:**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | `sessionStorage.onboarding_session` 값 확인 | UUID 존재 |
| 2 | 페이지 새로고침 (F5) | 온보딩 상태 확인 |
| 3 | 같은 탭에서 `/` 이동 후 `/onboarding` 재진입 | 세션 지속 여부 확인 |
| 4 | 새 탭에서 `/onboarding` 접속 | 새 세션 시작 (sessionStorage는 탭별 격리) |

> **참고:** sessionStorage는 탭별 격리되므로 새 탭에서는 새 세션이 시작됨. 이는 정상 동작.

---

### B-014 온보딩 Detailed 모드 전체 흐름

**전제조건:** 비인증 상태, 깨끗한 세션

**절차:**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | 온보딩 시작 → 정밀도 "정밀 분석" 선택 | 20문항 모드 진입 |
| 2 | 진행 바 확인 | "1/20" 표시 |
| 3 | 핵심 문항 5개 응답 (OX/RUBRIC) | 진행 바 "5/20" |
| 4 | 확장 문항 15개 응답 (OX/RUBRIC/OPEN_ENDED 혼합) | 진행 바 "20/20" |
| 5 | 결과 생성 대기 | "Thought Map을 생성하고 있습니다..." 로딩 표시 |
| 6 | 결과 페이지 이동 | `/onboarding/result?data=...` |

**네트워크 확인:**
- `/api/onboarding/answer` POST: 각 답변마다 또는 일괄 전송
- `/api/onboarding/result` POST: 최종 결과 계산 요청
- `OPENAI_API_KEY` 설정 시: LLM 기반 정밀 분석 결과 포함
- 미설정 시: 코드 기반 fallback 결과

---

## C. 매칭/대화 (익명)

### C-001 매칭 페이지 기본 상태

**전제조건:** 비인증 상태, 익명 세션 존재 (`ps-session-id`)

**절차:**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | `/matching` 접속 | 페이지 로드 시작 |
| 2 | 로딩 상태 확인 | `MatchCardSkeleton` (카드 스켈레톤) 2개 표시 |
| 3 | 로딩 완료 대기 | 스켈레톤 → 실제 콘텐츠로 교체 |
| 4 | 헤더 텍스트 확인 | "대화 상대 찾기" H1 표시 |
| 5 | 서브헤더 확인 | "당신과 적절한 의견 거리를 가진 상대를 찾아 구조화된 대화를 시작하세요." |
| 6 | 최종 상태 확인 | 후보 카드 / 페르소나 카드 / 빈 상태 중 하나 |

**네트워크 확인:**
- `GET /api/matching/candidates` → `{ candidates: [...] }`
- `GET /api/matching/personas` → `{ personas: [...] }`
- 두 요청 모두 `X-Session-Id` 헤더 포함
- 응답 `Cache-Control: no-store, no-cache, must-revalidate`

**Playwright 힌트:**
```typescript
test("C-001", async ({ page }) => {
  await page.goto("/matching");
  await expect(page.locator("[class*=skeleton], [class*=Skeleton]")).toBeVisible();
  await page.waitForResponse("**/api/matching/candidates");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("대화 상대 찾기");
});
```

---

### C-002 후보 존재 시 에너지 반응형 카드

**전제조건:** `/api/matching/candidates` 응답에 후보 1명 이상 존재

**절차:**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | 매칭 페이지 로드 완료 | 대표 후보 카드 표시 |
| 2 | 에너지 선택 칩 확인 | "높음" / "보통" / "낮음" 칩 3개 표시 |
| 3 | "높음" (ACTIVE) 선택 | 카드 내 시간/난이도/CTA 라벨 동적 변경 |
| 4 | 카드 변경 확인 | 높은 에너지 전용 라벨 (예: "15분 심층 대화") |
| 5 | "보통" (STEADY) 선택 | 카드 라벨 변경 (예: "10분 대화") |
| 6 | "낮음" (REST) 선택 | CTA가 "가볍게 5분 시작"으로 변경 |
| 7 | 전환 애니메이션 확인 | 에너지 변경 시 카드가 부드럽게 갱신 (Framer Motion) |

**카드 내 정보 확인:**
- 주제 (topic): 텍스트 표시
- 의견 거리 (opinion distance): 시각적 표시
- 난이도 (effort grade): 레이블
- 예상 시간: 분 단위
- 대화 트레일러 (conversation trailer): 2~3줄 미리보기 텍스트

---

### C-003 대표 후보 시작/거절

**전제조건:** C-002 완료, 대표 후보 카드 표시됨

**시나리오 1: 대화 시작**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | "대화 시작" 버튼 클릭 | 버튼 로딩 상태 |
| 2 | 네트워크 확인 | `POST /api/matching/proposals` 호출 |
| 3 | 요청 본문 확인 | `{ targetSessionId: "..." }` |
| 4 | 성공 응답 | 대화 세션 생성 |
| 5 | 페이지 이동 확인 | `/dialogue/:id` 이동 |

**시나리오 2: 거절**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | "다음에" 또는 거절 버튼 클릭 | 현재 대표 후보 제거 |
| 2 | 다음 후보 표시 | 서브 후보 중 다음 후보가 대표로 승격 |
| 3 | 후보가 없으면 | 빈 상태 또는 페르소나 fallback |

---

### C-004 서브 후보 카드

**전제조건:** 후보가 2명 이상 존재

**절차:**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | 대표 후보 아래 영역 확인 | "다른 후보" 섹션 헤더 표시 (`text-xs font-semibold uppercase`) |
| 2 | 서브 후보 카드 확인 | 각 후보: 주제, 의견 거리, 난이도 표시 |
| 3 | 서브 후보 "대화 제안" 클릭 | `POST /api/matching/proposals` 호출 |
| 4 | 요청 본문 확인 | 해당 후보의 `targetSessionId` 포함 |
| 5 | 성공 시 | 대화 세션 생성 → `/dialogue/:id` 이동 |
| 6 | 목록 갱신 확인 | 제안된 후보가 목록에서 제거/갱신 |

---

### C-005 인간 후보 없음 + 페르소나 fallback

**전제조건:** `/api/matching/candidates` → 빈 배열, `/api/matching/personas` → 1건 이상

**절차:**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | 매칭 페이지 로드 완료 | 인간 후보 영역 없음 |
| 2 | PersonaSelector 표시 확인 | AI 페르소나 카드 목록 표시 |
| 3 | 페르소나 이름/설명 확인 | 각 페르소나: 이름, 대화 스타일 설명 |
| 4 | 페르소나 선택 | 선택한 페르소나 강조 |
| 5 | "대화 시작" 클릭 | 로딩 상태 |
| 6 | 네트워크 확인 | `POST /api/dialogue/sessions` 호출 |
| 7 | 요청 본문 확인 | `{ candidateType: "agent", personaId: "..." }` |
| 8 | 성공 응답 | `{ id: "session-uuid" }` |
| 9 | 페이지 이동 | `/dialogue/:id` (`window.location.href`) |

---

### C-006 후보/페르소나 모두 없음

**전제조건:** candidates=[], personas=[] (양쪽 API 모두 빈 응답)

**절차:**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | 매칭 페이지 로드 완료 | 빈 상태 렌더링 |
| 2 | 빈 상태 아이콘 확인 | SVG 아이콘 표시 |
| 3 | 메시지 확인 | "지금은 매칭 상대가 없어요" |
| 4 | 힌트 확인 | "다른 참여자가 온보딩을 완료하면 후보가 표시됩니다" |
| 5 | CTA 없음 확인 | 새로고침 외 별도 액션 버튼 없음 |

---

### C-007 대화 목록 (익명)

**전제조건:** 비인증 상태, 익명 세션

**시나리오 1: 세션 존재**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | `/dialogue` 접속 | 로딩 스켈레톤 (CardSkeleton 3개) |
| 2 | 로딩 완료 | 세션 목록 표시 |
| 3 | 세션 카드 정보 확인 | 상대 별명, 주제, 단계 진행 표시 |
| 4 | 상태 뱃지 확인 — ACTIVE | "진행 중" (`bg-indigo-depth text-text-inverse`) |
| 5 | 상태 뱃지 — COMPLETED | "완료" (`bg-semantic-similarity-soft text-semantic-similarity`) |
| 6 | 상태 뱃지 — EXPIRED | "만료" (점선 테두리, 회색) |
| 7 | 상태 뱃지 — CANCELLED | "취소" (점선 테두리, 회색) |
| 8 | 날짜 표시 | `ko-KR` 포맷 (예: "2026. 2. 21.") |
| 9 | StepIndicator 표시 | `compact` 모드, 현재 단계 강조 |
| 10 | 세션 카드 클릭 | `/dialogue/:id` 이동 |

**시나리오 2: 세션 미존재**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | `/dialogue` 접속 (세션 0건) | 빈 상태 표시 |
| 2 | 메시지 확인 | "아직 대화가 없어요" |
| 3 | 링크 확인 | "대화 상대 찾기 →" 링크 존재 |
| 4 | 링크 클릭 | `/matching` 이동 |

**네트워크 확인:**
- `GET /api/dialogue/sessions` → `{ sessions: [...] }` 또는 `{ sessions: [] }`

---

### C-008 대화 상세 ACTIVE 상태

**전제조건:** ACTIVE 상태 대화 세션 존재

**절차:**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | `/dialogue/:id` 접속 | 로딩 → 세션 데이터 렌더링 |
| 2 | 단계 인디케이터 확인 | StepIndicator: 6단계 표시 (현재 단계 강조) |
| 3 | FSM 단계 명 | AFFIRMATION / POSITION / QUESTION / ANSWER / REFLECTION / JOINT_SUMMARY |
| 4 | 이전 턴 목록 확인 | TurnDisplay 컴포넌트로 이전 제출 내용 표시 |
| 5 | 입력 폼 확인 (mySubmitted=false) | TurnSubmissionForm 표시 |
| 6 | 10자 미만 입력 | 제출 불가 (버튼 비활성 또는 경고) |
| 7 | 정확히 10자 입력 | 제출 가능 |
| 8 | 100자 이상 입력 | 정상 제출 가능 |
| 9 | "제출" 버튼 클릭 | 로딩 상태 |
| 10 | 네트워크 확인 | `POST /api/dialogue/sessions/:id/turns` |
| 11 | 요청 본문 확인 | `{ content: "입력한 텍스트" }` |
| 12 | 성공 응답 확인 | 턴 제출 완료, 세션 상태 갱신 |

**입력 검증 규칙:**

| 입력 길이 | 결과 |
|-----------|------|
| 0자 (빈 값) | 제출 불가 |
| 1~9자 | 제출 불가 |
| 10자 이상 | 제출 가능 |

**네트워크 응답 구조:**
```json
{
  "toneCheck": { "passed": true, "suggestion": null },
  "driftCheck": { "drifted": false },
  "agentResponse": null
}
```

---

### C-009 대화 상세 보조 상태 (typing/warning/waiting)

**전제조건:** ACTIVE 대화 세션

**시나리오 1: AI 에이전트 타이핑 인디케이터**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | AI 페르소나 세션에서 턴 제출 | 제출 성공 |
| 2 | 응답 `agentResponse` 확인 | `{ personaName: "...", delayMs: N }` |
| 3 | 타이핑 인디케이터 표시 | "{personaName}이(가) 입력 중..." 표시 |
| 4 | `delayMs` 경과 (최대 3000ms) | 인디케이터 사라짐, 세션 갱신 |
| 5 | AI 응답 턴 표시 | 턴 목록에 AI 응답 추가 |

**시나리오 2: 톤/드리프트 경고**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | 공격적 어조 텍스트 제출 | 제출 처리 |
| 2 | `toneCheck.passed=false` 응답 | FacilitatorWarning 표시 (`type: "tone"`) |
| 3 | 제안 텍스트 확인 | 대안 표현 제시 |
| 4 | 초기 입장 모순 텍스트 제출 | 제출 처리 |
| 5 | `driftCheck.drifted=true` 응답 | FacilitatorWarning 표시 (`type: "drift"`) |

**시나리오 3: 상대방 대기 상태**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | 내 턴 제출 완료 (mySubmitted=true) | TurnSubmissionForm 사라짐 |
| 2 | WaitingForOpponent 표시 | 대기 메시지 표시 |
| 3 | 새로고침 | 대기 상태 유지 |

---

### C-010 대화 완료/피드백/요약 흐름

**전제조건:** COMPLETED 상태 대화 세션 존재

**절차:**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | `/dialogue/:id` 접속 (COMPLETED) | 완료 배너 표시 |
| 2 | 배너 텍스트 | "대화가 완료되었습니다" |
| 3 | 액션 확인 | "피드백 남기기" + "요약 카드 보기" |
| 4 | "피드백 남기기" 클릭 | `/dialogue/:id/feedback` 이동 |
| 5 | H1 확인 | "대화 피드백" |
| 6 | 만족도 0점 상태 | "피드백 제출" 버튼 비활성 |
| 7 | 만족도 3점 선택 | 버튼 활성화 |
| 8 | 재매칭 체크 | "다른 상대와 다시 대화하고 싶습니다" 토글 |
| 9 | 감정 입력 (선택) | 최대 500자 |
| 10 | "피드백 제출" 클릭 | "제출 중..." 로딩 |
| 11 | 네트워크 | `POST /api/dialogue/sessions/:id/feedback` |
| 12 | 요청 본문 | `{ satisfaction: 3, rematchWillingness: true, emotionCheckIn: "..." }` |
| 13 | 성공 → 자동 이동 | `/dialogue/:id/summary` |
| 14 | 요약 H1 | "대화 요약 카드" |
| 15 | SummaryCardView | 요약 콘텐츠 렌더링 |
| 16 | "새로운 대화 시작하기 →" | `/matching` 이동 |

---

### C-011 대화 상세 세션 미존재/만료

**절차:**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | `/dialogue/non-existent-id` 접속 | "세션을 찾을 수 없습니다." 표시 |
| 2 | EXPIRED 세션 접속 | "만료" 상태 표시, 입력 폼 없음 |
| 3 | CANCELLED 세션 접속 | "취소" 상태 표시, 입력 폼 없음 |

---

### C-012 요약 페이지 에러 처리

**절차:**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | 유효한 `/dialogue/:id/summary` | 요약 카드 정상 렌더링 |
| 2 | 요약 없는 세션 | "요약을 찾을 수 없습니다." |
| 3 | API 500 에러 유도 | 에러 메시지 (빨간색) 표시 |

---

### C-013 대화 FSM 단계별 UI 변화

**전제조건:** ACTIVE 세션, 각 단계에서 확인

| FSM 단계 | UI 특성 | 검증 |
|----------|---------|------|
| AFFIRMATION | 자기긍정 리마인더 | 긍정 메시지 표시, 간단한 확인 폼 |
| POSITION | 입장 진술 | 자유 텍스트 입력 (10자 이상), 톤체크 활성 |
| QUESTION | 질문하기 | 상대에게 보낼 질문 입력, 톤체크 활성 |
| ANSWER | 답변하기 | 상대 질문 표시 + 답변 입력, 톤체크 활성 |
| REFLECTION | 성찰 | 성찰 문항, 간소화된 입력 |
| JOINT_SUMMARY | 공동 요약 | 요약 결과 표시, 양측 합의 콘텐츠 |

**단계 인디케이터 시각적 검증:**
- 완료 단계: 채워진 원/체크마크
- 현재 단계: 강조 (active 스타일)
- 미래 단계: 빈 원/회색

---

## D. 인증 유저 기능 (친구/채팅/오프라인/신고)

### D-001 친구 목록 기본/빈 상태

**전제조건:** 인증 완료 상태

**시나리오 1: 친구 있음**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | `/friends` 접속 | 로딩 스켈레톤 (CardSkeleton 2개 + 헤더 스켈레톤) |
| 2 | 로딩 완료 | 친구 목록 표시 |
| 3 | H1 확인 | "친구 목록" |
| 4 | "새 대화 시작" 링크 | `href="/matching"` |
| 5 | 친구 카드 구성 | 아바타 + 별칭 + 대화 횟수 + 단계 라벨 |
| 6 | 별칭 형식 | "참여자_{userId 앞4자리 대문자}" |
| 7 | 아바타 | 이름 첫 2글자, 순환 배경색 (`userId.charCodeAt(0) % 4`) |
| 8 | 대화 횟수 | "대화 N회" |
| 9 | 단계 (0회) | "친구 단계" (text-secondary) |
| 10 | 단계 (≥1회) | "실시간 대화 단계" (accent-primary) |
| 11 | 단계 (≥3회) | "오프라인 준비" (semantic-similarity) |
| 12 | 카드 클릭 | `/friends/:friendshipId` 이동 |

**시나리오 2: 친구 없음**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | `/friends` 접속 (0명) | "아직 친구가 없습니다" |
| 2 | CTA | "대화 시작하러 가기 →" → `/matching` |

---

### D-002 친구 상세 기본 정보

**전제조건:** 인증, 친구 관계 존재

**절차:**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | `/friends/:id` 접속 | 로딩 → 상세 렌더링 |
| 2 | "← 목록" 링크 | `href="/friends"` |
| 3 | H1 | "참여자_{userId 앞4자리}" |
| 4 | "관계 단계" 섹션 | 현재 단계 + 3단계 설명 |
| 5 | "공개 레벨" 섹션 | 내/상대 공개 레벨 표시 |
| 6 | 공개 라벨 | "익명 별칭" / "성향 타입" / "전체 스탠스" / "표시 이름" |
| 7 | 채팅 버튼 | eligible 여부에 따라 활성/잠금 |
| 8 | 오프라인 링크 | 조건 충족 시 표시 |
| 9 | "친구 해제" 버튼 | 존재 |
| 10 | "신고하기" 링크 | `href="/safety/report?userId=..."` |

**네트워크 (병렬):**
- `GET /api/relationship/friends/:id`
- `GET /api/relationship/disclosure?friendshipId=:id`
- `GET /api/chat/:id/eligibility`

---

### D-003 공개 레벨 올리기

**전제조건:** 내 공개 레벨 < 3

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | 현재 레벨 확인 | "내 공개: {label} (레벨 {N})" |
| 2 | "공개 레벨 올리기" 클릭 | `POST /api/relationship/disclosure` body: `{ friendshipId, level: N+1 }` |
| 3 | 레벨 업데이트 | UI 반영 |
| 4 | 최대(3) 도달 | 버튼 사라짐 |

---

### D-004 라이트 프로토콜 시작

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | LightProtocolSection 확인 | 3종 버튼 표시 |
| 2 | Common Ground 클릭 | `POST /api/light-protocol` body: `{ friendshipId, type: "COMMON_GROUND", initiatorId }` |
| 3 | Joint Question 클릭 | `type: "JOINT_QUESTION"` |
| 4 | Switch Sides 클릭 | `type: "SWITCH_SIDES"` |

---

### D-005 실시간 채팅 진입 조건

**시나리오 1: eligible=true**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | 버튼 활성 확인 | 클릭 가능 |
| 2 | 클릭 | `/chat/:friendshipId` 이동 |

**시나리오 2: eligible=false**

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | 버튼 잠금 확인 | 비활성/잠금 아이콘 |
| 2 | 사유 확인 | 자격 미달 사유 텍스트 |

**자격 조건:** ACTIVE friendship + 대화 ≥2회 + 라이트 프로토콜 ≥1회

---

### D-006 채팅 페이지 기본 동작

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | `/chat/:friendshipId` 접속 | 로딩 → 메시지 로드 |
| 2 | 헤더 | "채팅" + "←" 뒤로가기 |
| 3 | 메시지 히스토리 | `GET /api/chat/:friendshipId/messages` |
| 4 | 내 메시지 | 오른쪽 정렬 (ChatBubble isMine=true) |
| 5 | 상대 메시지 | 왼쪽 정렬 |
| 6 | 메시지 입력 + 전송 | `POST /api/chat/:friendshipId/messages` → 201 |
| 7 | UI 갱신 | 새 메시지 목록 하단 추가 + 자동 스크롤 |

---

### D-007 채팅 마이크로 체크인 (20분)

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | 20분 경과 (또는 시간 가속) | MicroCheckinPrompt 표시 |
| 2 | 프롬프트 확인 | 5개 중 하나 순환 |
| 3 | 텍스트 입력 + 제출 | 프롬프트 닫힘 |
| 4 | 40분 후 | 다음 프롬프트 (다른 문구) |
| 5 | "건너뛰기" | 프롬프트 닫힘 |

**체크인 프롬프트 (순환):**
1. "지금까지 대화에서 가장 흥미로웠던 점은 무엇인가요?"
2. "상대의 의견 중 새롭게 알게 된 것이 있나요?"
3. "지금 기분이 어떤가요? 대화를 계속하고 싶으신가요?"
4. "이 대화에서 가장 공감이 간 부분은 무엇인가요?"
5. "상대방에게 더 알고 싶은 것이 있나요?"

---

### D-008 오프라인 제안 생성

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | `/offline?friendshipId=:id` 접속 | "오프라인 만남 제안" 폼 |
| 2 | 날짜/장소 미입력 제출 | 정상 제출 (모두 선택) |
| 3 | 네트워크 | `POST /api/offline/proposals` body: `{ friendshipId, proposedAt: null, locationHint: null }` |
| 4 | 성공 | `/friends/:friendshipId` 이동 |
| E-1 | friendshipId 없이 접속 | "friendshipId가 필요합니다." |

---

### D-009 오프라인 상세 응답/체크인

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | `/offline/:id` 접속 | 상세 표시 (상태/일시/장소) |
| 2 | "확정" 클릭 | `POST .../respond` body: `{ action: "confirm" }` |
| 3 | "취소" 클릭 | body: `{ action: "cancel" }` |
| 4 | "안전" 체크인 | `POST .../checkin` body: `{ status: "SAFE" }` |
| 5 | "우려" 체크인 | body: `{ status: "CONCERN" }` |

---

### D-010 신고하기 플로우

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | `/safety/report?userId=:target` 접속 | "사용자 신고" 폼 |
| 2 | 사유 5개 확인 | "괴롭힘" / "위협" / "개인정보 요구" / "사칭" / "기타" |
| 3 | 기본 선택 | "괴롭힘" (HARASSMENT) |
| 4 | 사유 변경 + 설명 입력(선택, 500자) | 정상 |
| 5 | "신고하기" 클릭 | `POST /api/safety/report` → 201 |
| 6 | 성공 화면 | "신고 완료" + 안내 문구 |
| 7 | "돌아가기" | `router.back()` |
| E-1 | userId 없이 접속 | "신고 대상이 지정되지 않았습니다." |

---

### D-011 친구 해제

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | 친구 상세에서 "친구 해제" 클릭 | `DELETE /api/relationship/friends/:id` |
| 2 | 성공 | `/friends` 이동 |
| 3 | 목록 확인 | 해당 친구 사라짐 |

---

## E. 설정/패스포트/PWA

### E-001 설정 메인

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | `/settings` 접속 | "더보기" H1 |
| 2 | 이메일 카드 | 사용자 이메일 + 아바타 |
| 3 | "내 데이터 관리" 클릭 | `/settings/data-management` |
| 4 | "알림 설정" 클릭 | `/settings/notifications` |
| 5 | "로그아웃" 클릭 | 세션 삭제 → 랜딩/로그인 이동 |

---

### E-002 데이터 관리 페이지

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | H1 | "데이터 관리" |
| 2 | 저장 데이터 목록 | "닉네임", "입장 프로필", "대화 기록" |
| 3 | 페이지 로드 이벤트 | `data_mgmt_view` 발생 |
| 4 | "데이터 내보내기" 클릭 | `alert("준비 중입니다")` |
| 5 | "데이터 삭제 요청" 클릭 | confirm 다이얼로그 |
| 6 | "취소" | 다이얼로그 닫힘 |
| 7 | "확인" | 삭제 처리 + `data_delete_confirm` 이벤트 |

---

### E-003 알림 설정 토글 영속성

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | 기본 상태 확인 | d1_review=on, matching=on, persona=on, weekly=off |
| 2 | 토글 변경 | d1_review=off, weekly=on |
| 3 | localStorage 확인 | `ps-notification-config` 업데이트됨 |
| 4 | F5 새로고침 | 변경 유지 |

---

### E-004 알림 7일 끄기

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | "7일 끄기" 클릭 | 상태 → "7일 끄기 활성화 ({날짜}까지)" |
| 2 | localStorage | `ps-notification-snooze-until` = ISO 날짜 (+7일) |
| 3 | 새로고침 | 상태 유지 |

---

### E-005 브라우저 알림 권한 요청

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | "브라우저 권한 요청" 클릭 | 브라우저 알림 프롬프트 |
| 2-a | 허용 | `notification_permission_granted` 이벤트 |
| 2-b | 차단 | `notification_permission_denied` 이벤트 |

---

### E-006 패스포트 탭 기능

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | `/passport` 접속 | "🗺️ Perspective Passport" |
| 2 | 통계 | "이번 주: N", "누적 탐색: N" |
| 3 | "뱃지" 탭 (기본) | BadgeGrid 렌더링 |
| 4 | "발견 목록" 탭 | 발견 카드 목록 |
| 5 | "저장 페르소나" 탭 | 페르소나 카드 (이름, 대화수, 마지막 날짜) |
| 6 | "이어서 대화" 클릭 | `/matching?mode=ai-practice&personaId=:id` |

---

### E-007 서비스워커/매니페스트

| 단계 | 행동 | 검증 |
|------|------|------|
| 1 | Application → Service Workers | `/sw.js` 등록 확인 |
| 2 | `/manifest.json` 접속 | name/short_name/icons/start_url 유효 |
| 3 | 오프라인 모드 | 캐시된 쉘 또는 fallback |

> PWA v4-P2 범위. 미구현 시 SKIP.

---

## F. API 직접 검증 (UI 비노출 포함)

### F-001 claim-session API

```javascript
// 유효 요청
fetch('/api/auth/claim-session', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ sessionId: 'test-session' })
}).then(r => console.log(r.status)); // 200

// 비유효 요청
fetch('/api/auth/claim-session', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  credentials: 'include', body: JSON.stringify({})
}).then(r => console.log(r.status)); // 400
```

---

### F-002 friend-request API

| 조건 | 결과 |
|------|------|
| `FEATURE_RELATIONSHIP=true` | 정상 응답 |
| `FEATURE_RELATIONSHIP=false` | 404 (`Feature disabled`) |

---

### F-003 block/unblock API

| 요청 | 결과 |
|------|------|
| `POST /api/relationship/block` + 유효 body | 성공 |
| `POST /api/relationship/block` + 비유효 body | 4xx |

---

### F-004 reflection/joint-summary API

| 요청 | 결과 |
|------|------|
| `POST .../reflection` + 유효 body | 스키마 통과 |
| `POST .../reflection` + 비유효 body | 400 |
| `GET .../joint-summary` | 세션 기준 결과 |

---

### F-005 chat read API

| 요청 | 결과 |
|------|------|
| `POST .../read` + `{ messageIds: [] }` | 400 |
| `POST .../read` + `{ messageIds: ["msg-1"] }` | 성공 |

---

### F-006 daily-limit API

| 요청 | 결과 |
|------|------|
| `GET /api/user/daily-limit` | `{ remaining, limit, isLimited }` |

---

### F-007 fatigue API

| 요청 | 결과 |
|------|------|
| `GET /api/user/fatigue` | `{ score, cooldownMode }` |

---

## G. 보안/프라이버시/회귀 체크

### G-001 개인정보 노출 금지

| 단계 | 검증 |
|------|------|
| 1 | 온보딩 공유 카드: 실명/전화/이메일 노출 없음 |
| 2 | 매칭 트레일러: PII 스크러빙 확인 (이름→XXX) |
| 3 | 대화 턴: 상대 실명 노출 없음 |
| 4 | 공유 카드 하단: 프라이버시 문구 존재 |
| 5 | 친구 별칭: "참여자_XXXX" 형식 |

---

### G-002 미인증 요청 방어

| 요청 | 결과 |
|------|------|
| 쿠키 삭제 후 `GET /api/relationship/friends` | 401 |
| `POST /api/safety/report` | 401 |
| `GET /api/chat/:id/messages` | 401 |
| `DELETE /api/relationship/friends/:id` | 401 |
| 응답 본문 | 서버 스택 트레이스 없음 |

---

### G-003 입력 검증

| 요청 | 결과 |
|------|------|
| feedback `satisfaction: -1` | 4xx |
| feedback `satisfaction: 100` | 4xx |
| turns 빈 content | 4xx |
| turns 10만자 content | 4xx 또는 서버 제한 |
| report 존재하지 않는 reason | 4xx |
| 모든 에러 응답 | 스택 노출 없음, JSON 에러만 |

---

### G-004 에러 복구 UX

| 단계 | 검증 |
|------|------|
| 1 | 매칭 페이지 네트워크 끊김 → 에러 배너 |
| 2 | 에러 문구: 사용자 친화적 (기술 용어 없음) |
| 3 | 복구 후 새로고침 → 정상 |
| 4 | 대화 상세 500 → 에러 표시 |

---

### G-005 접근성 기본

| 검증 항목 | 기대 |
|-----------|------|
| 탭바 시맨틱 | `<nav>` 또는 `role="tablist"` |
| 활성 탭 | `aria-selected` 또는 `aria-current` |
| 라디오 (신고) | `role="radio"`, `aria-checked` |
| 키보드 Tab | 주요 동선 탐색 가능 |
| 키보드 Enter | 버튼/링크 활성화 |
| 포커스 이동 | 막힘 없음 |

---

### G-006 반응형

| 뷰포트 | 검증 |
|---------|------|
| 390×844 (모바일) | 가로 스크롤 없음, 탭 겹침 없음, 카드 맞춤 |
| 768×1024 (태블릿) | 레이아웃 정상 |
| 1440×900 (데스크톱) | 중앙 정렬, max-width |

**Playwright 힌트:**
```typescript
const viewports = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];
for (const vp of viewports) {
  test(`G-006 ${vp.width}x${vp.height}`, async ({ page }) => {
    await page.setViewportSize(vp);
    await page.goto("/");
    const hasHScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHScroll).toBe(false);
  });
}
```

---

### G-007 성능 스모크

| 페이지 | 기준 |
|--------|------|
| 랜딩 LCP | < 2.5s |
| 매칭 로드 | 스켈레톤→콘텐츠 < 3s |
| 대화 상세 | 로딩→데이터 < 2s |
| CLS | 큰 레이아웃 시프트 없음 |
| 버튼 반응 | 체감 지연 < 300ms |

---

### G-008 다크모드/시스템 테마

| 단계 | 검증 |
|------|------|
| OS 다크모드 활성화 | 텍스트/배경 대비 확인 |
| 카드/버튼 스타일 | 깨지지 않음 |

> Paper 테마 기반 → 다크모드 미지원 시 라이트 강제 확인

---

### G-009 브라우저 뒤로가기/앞으로가기

| 단계 | 검증 |
|------|------|
| 랜딩→온보딩→매칭 이동 | 정상 네비게이션 |
| 뒤로가기 | 이전 페이지 복원 |
| 앞으로가기 | 다음 페이지 복원 |
| 대화 상세에서 뒤로가기 | 대화 목록 복귀 |

---

### G-010 동시 탭 세션

| 단계 | 검증 |
|------|------|
| 탭 A 로그인, 탭 B `/friends` | 세션 공유 |
| 탭 A 로그아웃 → 탭 B 새로고침 | 로그인 리다이렉트 |

---

## 6. 실행 순서 권장

```
A (접근 제어) → B (퍼널) → C (익명 코어) → D (인증 코어) → E (설정/PWA) → F (API) → G (비기능)
```

**실패 시 재현 프로토콜:**
1. 동일 세션에서 즉시 재현 1회
2. 재현 성공 → 버그 리포트
3. 재현 실패 → 스토리지 초기화 후 재검증 1회
4. 여전히 실패 → 간헐적 버그로 기록

---

## 7. 케이스 우선순위

| 우선순위 | 기준 | 케이스 |
|----------|------|--------|
| **P0** | 신규 유저 핵심 전환 | A-001~A-007, B-001~B-014, C-001~C-013 |
| **P1** | 관계/안전/설정 핵심 | D-001~D-011, E-001~E-006 |
| **P2** | PWA/API/비기능 | E-007, F-001~F-007, G-001~G-010 |

**총 케이스:**

| 그룹 | 수 |
|------|----|
| A 접근/리다이렉트 | 7 |
| B 랜딩/로그인/온보딩 | 14 |
| C 매칭/대화 | 13 |
| D 인증 기능 | 11 |
| E 설정/패스포트/PWA | 7 |
| F API 직접 검증 | 7 |
| G 보안/비기능 | 10 |
| **합계** | **69** |

---

## 8. 기존 Playwright 커버리지 매핑

| 시나리오 그룹 | 관련 스펙 파일 |
|---------------|---------------|
| 랜딩/로그인/온보딩 | `test/e2e/funnel/landing.anon.spec.ts`, `login.anon.spec.ts`, `login.auth.spec.ts`, `onboarding.anon.spec.ts`, `onboarding-result.anon.spec.ts` |
| 매칭/대화 | `test/e2e/main/matching.anon.spec.ts`, `dialogue-list.anon.spec.ts`, `dialogue-detail.anon.spec.ts`, `dialogue-feedback.anon.spec.ts`, `dialogue-summary.anon.spec.ts` |
| 친구/채팅/오프라인/신고 | `test/e2e/main/friends-list.auth.spec.ts`, `friend-detail.auth.spec.ts`, `chat.auth.spec.ts`, `offline.auth.spec.ts`, `safety-report.auth.spec.ts` |
| 네비게이션/스모크 | `test/e2e/navigation/*.spec.ts`, `test/e2e/smoke/*.spec.ts` |

---

## 9. 버그 리포트 포맷

```markdown
## 버그 리포트

**케이스 ID:** [예: B-010]
**심각도:** [P0/P1/P2]

### 재현 환경
- 브라우저/버전:
- OS:
- 빌드 SHA:
- 뷰포트:

### 재현 절차
1. ...
2. ...

### 기대 결과
...

### 실제 결과
...

### 증거
- Network: [URL, 상태, 응답]
- Console: [에러 메시지]
- Storage: [키-값]
- 스크린샷: [첨부]
```

---

## 10. Playwright 자동화 전환 체크리스트

| 항목 | 확인 |
|------|------|
| 케이스 ID 보존 | 테스트 이름에 ID 포함 |
| 인증 fixture | Supabase 쿠키 주입 |
| 익명 fixture | storage 초기화 |
| API mock | `page.route()` 응답 제어 |
| 뷰포트 매트릭스 | 파라미터화 |
| 네트워크 검증 | `waitForResponse()` + 상태 코드 |
| 콘솔 에러 | `page.on("console")` |
| 시각적 회귀 | `toHaveScreenshot()` |

---

## 부록: 전체 API 엔드포인트 매핑

| 메서드 | 엔드포인트 | 인증 | 케이스 |
|--------|-----------|------|--------|
| POST | `/api/auth/callback` | — | B-003 |
| POST | `/api/auth/claim-session` | 인증 | F-001 |
| POST | `/api/onboarding/self-affirmation` | 익명 | B-005 |
| POST | `/api/onboarding/confidence` | 익명 | B-007 |
| POST | `/api/onboarding/answer` | 익명 | B-007~009 |
| POST | `/api/onboarding/result` | 익명 | B-010,014 |
| GET | `/api/matching/candidates` | 익명 | C-001~004 |
| GET | `/api/matching/personas` | 익명 | C-005 |
| POST | `/api/matching/proposals` | 익명 | C-003,004 |
| GET | `/api/dialogue/sessions` | 익명 | C-007 |
| POST | `/api/dialogue/sessions` | 익명 | C-005 |
| GET | `/api/dialogue/sessions/:id` | 익명 | C-008,009 |
| POST | `/api/dialogue/sessions/:id/turns` | 익명 | C-008,009 |
| GET | `/api/dialogue/sessions/:id/summary` | 익명 | C-010,012 |
| POST | `/api/dialogue/sessions/:id/reflection` | 익명 | F-004 |
| POST | `/api/dialogue/sessions/:id/feedback` | 익명 | C-010 |
| GET | `/api/dialogue/sessions/:id/joint-summary` | 익명 | F-004 |
| GET | `/api/relationship/friends` | 인증 | D-001 |
| GET | `/api/relationship/friends/:id` | 인증 | D-002 |
| DELETE | `/api/relationship/friends/:id` | 인증 | D-011 |
| POST | `/api/relationship/friend-request` | 인증 | F-002 |
| POST | `/api/relationship/disclosure` | 인증 | D-003 |
| GET | `/api/relationship/disclosure` | 인증 | D-002 |
| POST | `/api/relationship/block` | 인증 | F-003 |
| GET | `/api/chat/:fId/messages` | 인증 | D-006 |
| POST | `/api/chat/:fId/messages` | 인증 | D-006 |
| GET | `/api/chat/:fId/eligibility` | 인증 | D-005 |
| POST | `/api/chat/:fId/read` | 인증 | F-005 |
| POST | `/api/offline/proposals` | 인증 | D-008 |
| POST | `/api/offline/proposals/:id/respond` | 인증 | D-009 |
| POST | `/api/offline/proposals/:id/checkin` | 인증 | D-009 |
| POST | `/api/safety/report` | 인증 | D-010 |
| POST | `/api/light-protocol` | 인증 | D-004 |
| GET | `/api/user/daily-limit` | 익명 | F-006 |
| GET | `/api/user/fatigue` | 익명 | F-007 |
