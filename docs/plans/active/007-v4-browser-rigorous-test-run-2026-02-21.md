---
owner: "@repo-owner"
status: draft
last_reviewed: 2026-02-21
---

# V4 Browser Rigorous Test Run Log (2026-02-21)

## 실행 정보
- 실행 환경: Windows + Playwright (`pnpm.cmd playwright test`)
- 실행 일시: 2026-02-21
- 기준 문서: `docs/plans/active/007-v4-browser-rigorous-test-scenarios.md`
- 비고: 최초 실행 시 `:3000` 점유 프로세스가 500 상태라 종료 후 재실행

## 익명(anonymous) 결과

| Spec | 결과 | 상세 |
|---|---|---|
| `test/e2e/funnel/landing.anon.spec.ts` | FAIL | 0/3 |
| `test/e2e/funnel/login.anon.spec.ts` | PASS | 2/2 |
| `test/e2e/funnel/onboarding.anon.spec.ts` | FAIL | 2/5 |
| `test/e2e/funnel/onboarding-result.anon.spec.ts` | PASS | 4/4 |
| `test/e2e/main/matching.anon.spec.ts` | FAIL | 2/4 |
| `test/e2e/main/dialogue-list.anon.spec.ts` | FAIL | 3/4 |
| `test/e2e/main/dialogue-detail.anon.spec.ts` | FAIL | 0/2 |
| `test/e2e/main/dialogue-feedback.anon.spec.ts` | PASS | 3/3 |
| `test/e2e/main/dialogue-summary.anon.spec.ts` | FAIL | 0/2 |
| `test/e2e/navigation/middleware-redirects.anon.spec.ts` | PASS | 9/9 |
| `test/e2e/navigation/bottom-tab.anon.spec.ts` | FAIL | 2/3 |
| `test/e2e/smoke/all-pages-render.anon.spec.ts` | PASS | 5/5 |

### 익명 합계
- PASS: 32
- FAIL: 14
- TOTAL: 46

## 인증(authenticated) 결과

| Spec | 결과 | 상세 |
|---|---|---|
| `test/e2e/funnel/login.auth.spec.ts` | FAIL | `auth-setup` 실패로 본 테스트 미실행 |
| `test/e2e/navigation/middleware-redirects.auth.spec.ts` | FAIL | `auth-setup` 실패로 2개 미실행 |
| `test/e2e/navigation/bottom-tab.auth.spec.ts` | FAIL | `auth-setup` 실패로 3개 미실행 |
| `test/e2e/main/friends-list.auth.spec.ts` | FAIL | `auth-setup` 실패로 4개 미실행 |
| `test/e2e/main/friend-detail.auth.spec.ts` | FAIL | `auth-setup` 실패로 3개 미실행 |
| `test/e2e/immersive/chat.auth.spec.ts` | FAIL | `auth-setup` 실패로 3개 미실행 |
| `test/e2e/main/offline.auth.spec.ts` | FAIL | `auth-setup` 실패로 2개 미실행 |
| `test/e2e/main/safety-report.auth.spec.ts` | FAIL | `auth-setup` 실패로 3개 미실행 |
| `test/e2e/smoke/all-pages-render.auth.spec.ts` | FAIL | `auth-setup` 실패로 4개 미실행 |

## 공통 차단 원인 (Auth)

`test/e2e/global-setup.ts` 단계에서 Supabase 로그인 실패:

- 에러: `Supabase auth failed: fetch failed`
- 원인: `.env.test.local`의 기본 placeholder (`your-project.supabase.co`) 사용으로 DNS 해석 실패
- 하위 원인: `getaddrinfo ENOTFOUND your-project.supabase.co`

## 주요 실패 패턴 (Anonymous)

1. 카피/UX 변경으로 기대값 불일치
- 예: 랜딩 H1, 매칭 빈 상태 문구, 대화 목록 빈 상태 문구

2. 플로우 변경으로 테스트 순서 불일치
- 예: 온보딩에서 TrustMoment 이후 즉시 정밀도 선택 기대(실제는 demographic 단계 존재)

3. 상호작용 동작 불일치
- 예: 하단 탭 `대화` 클릭 후 URL 전환 검증 실패

4. 모킹 데이터와 현재 화면 모델 불일치 가능성
- 예: 대화 상세/요약 페이지 렌더링 검증 실패

