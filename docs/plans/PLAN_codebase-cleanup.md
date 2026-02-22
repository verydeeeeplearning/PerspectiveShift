# Implementation Plan: 코드베이스 정리 (Codebase Cleanup)

**Status**: Pending Approval
**Started**: 2026-02-22
**Last Updated**: 2026-02-22

---

## Overview

### 목적
현재까지 구현된 시스템 외 중복되거나 불필요한 내용을 체계적으로 정리한다.
임시 파일, 데드 코드, 중복 로직, 오래된 문서, 잘못된 설정을 제거하여 코드베이스 건강도를 높인다.

### 정리 대상 요약

| 카테고리 | 항목 수 | 예상 절감 |
|---------|--------|----------|
| 임시 파일 & 아티팩트 | 10+ | ~1.1 GB 디스크 + git noise 제거 |
| 데드 코드 (미사용 유스케이스/엔티티/VO/인프라) | 13개 파일 | ~650줄 프로덕션 코드 제거 |
| 중복 로직 | 2건 | 혼동 방지 |
| 오래된 문서 | 3개 파일 | 정보 불일치 해소 |
| 설정/CI 오류 | 5건 | CI 파이프라인 정상화 |
| .gitignore 누락 | 4건 | git status 노이즈 제거 |

---

## Phase 1: 임시 파일 & 아티팩트 제거

**Goal**: 디스크 공간 회수 + git status 정리
**예상 소요**: 15분

### 작업 목록

- [ ] **1.1** `.tmp-prodcheck/` 워크트리 제거
  - `git worktree remove --force .tmp-prodcheck` 실행
  - 이 디렉토리는 2/20 시점 detached HEAD 워크트리 (구버전 스냅샷)
  - 내부에 `.env.local` (실 자격증명 포함) 존재 — 반드시 제거
  - 예상 절감: **~1.1 GB**

- [ ] **1.2** 루트 임시 HTML 파일 삭제
  - `.tmp_live_app.html` (8.6 KB) — 라이브 앱 HTML 스크래핑 스냅샷
  - `.tmp_vercel_page.html` (800 KB) — Vercel 대시보드 HTML 스크래핑
  - 둘 다 untracked, 프로덕션 가치 없음

- [ ] **1.3** dev 로그 파일 정리
  - `.next-dev-3010.err.log`, `.next-dev-3010.out.log`
  - `.next-dev-3011.err.log`, `.next-dev-3011.out.log`
  - 이미 gitignore됨, 디스크에서만 삭제

- [ ] **1.4** 테스트 아티팩트 정리
  - `playwright-report/` (1.3 MB) — 이전 테스트 리포트
  - `test-results/` (5 KB) — 테스트 결과 메타데이터
  - `.playwright-mcp/` (1.1 MB) — MCP 세션 로그/스크린샷
  - 모두 gitignore됨, 디스크에서만 삭제

- [ ] **1.5** `.serena/` 캐시 정리
  - `cache/typescript/` (4.1 MB) — TS 심볼 캐시
  - 삭제 후 다음 Serena 세션에서 자동 재생성

### Quality Gate
- [ ] `git status`에서 `??` untracked 파일 0개 확인
- [ ] `git worktree list`에서 .tmp-prodcheck 없음 확인
- [ ] 빌드/테스트 영향 없음 확인

---

## Phase 2: .gitignore & 설정 정상화

**Goal**: git status 노이즈 영구 제거 + CI 수정
**예상 소요**: 20분

### 작업 목록

- [ ] **2.1** `.gitignore`에 누락 항목 추가
  ```
  # AI tool state
  .serena/

  # Temporary working directories
  .tmp-prodcheck/
  .tmp_*.html
  ```

- [ ] **2.2** `.prettierignore`에 누락 항목 추가
  ```
  .serena/
  .tmp-prodcheck/
  .tmp_*.html
  ```

- [ ] **2.3** `codex-automation.yaml` 제거
  - `.github/workflows/codex-automation.yaml`
  - `openai/codex-action@v1`은 존재하지 않는 GitHub Action
  - 실행 시 항상 실패하는 비기능 워크플로우

- [ ] **2.4** `agent-verify.yaml`에서 미존재 브랜치 제거
  - `branches: [main, develop]` → `branches: [main]`
  - `develop` 브랜치는 존재하지 않음

- [ ] **2.5** `tools/test` 수정
  - `pnpm run test` → `pnpm run test:run`
  - 현재 watch 모드로 실행되어 로컬 CI에서 hang 발생

- [ ] **2.6** `tools/build` 생성
  - `tools/ci`가 `./tools/build` 존재 여부를 확인하지만 파일 미존재
  - `pnpm run build`를 래핑하는 스크립트 추가

### Quality Gate
- [ ] `git status` 깨끗한 상태 확인
- [ ] `./tools/ci` 전체 파이프라인 정상 통과
- [ ] `.gitignore` 패턴이 새 임시 파일을 올바르게 무시하는지 확인

---

## Phase 3: 데드 코드 제거

**Goal**: 프로덕션에서 사용되지 않는 코드 제거
**예상 소요**: 30분

### 3A: 미사용 유스케이스 (4개)

| 파일 | 클래스 | 미사용 근거 |
|------|--------|-----------|
| `application/use-cases/calculate-fatigue.ts` | `CalculateFatigueUseCase` | DI 미등록, API 라우트 stub (TODO 주석) |
| `application/use-cases/enforce-daily-limit.ts` | `EnforceDailyLimitUseCase` | DI 미등록, API 라우트 stub |
| `application/use-cases/start-dynamic-onboarding.ts` | `StartDynamicOnboardingUseCase` | `GenerateNextBatchUseCase`로 대체됨 |
| `application/use-cases/get-trailer-quality-stats.ts` | `GetTrailerQualityStatsUseCase` | DI 미등록, API 라우트 없음 |

- [ ] **3A.1** 위 4개 유스케이스 파일 + 대응 테스트 파일 삭제
- [ ] **3A.2** `index.ts`에서 해당 export 제거 (존재 시)
- [ ] **3A.3** API stub 라우트 정리
  - `api/user/fatigue/route.ts` — TODO stub이면 삭제
  - `api/user/daily-limit/route.ts` — TODO stub이면 삭제

### 3B: 미사용 도메인 엔티티 (2개)

| 파일 | 클래스 | 미사용 근거 |
|------|--------|-----------|
| `domain/entities/peak-end-flow.ts` | `PeakEndFlow` | 프로덕션 import 없음 (동명 UI 컴포넌트는 별개) |
| `domain/entities/reflection-flow.ts` | `ReflectionFlow` | 프로덕션 import 없음 |

- [ ] **3B.1** 위 2개 엔티티 파일 + 대응 테스트 파일 삭제

### 3C: 미사용 값 객체 (2개)

| 파일 | 클래스 | 미사용 근거 |
|------|--------|-----------|
| `domain/value-objects/self-affirmation.ts` | `SelfAffirmation` | 유스케이스가 이 VO 대신 plain 타입 사용 |
| `domain/value-objects/metric-tier.ts` | `MetricTier` | 분석 대시보드 미구현으로 미사용 |

- [ ] **3C.1** 위 2개 VO 파일 + 대응 테스트 파일 삭제

### 3D: 미사용 인프라 파일 (3개)

| 파일 | 클래스 | 미사용 근거 |
|------|--------|-----------|
| `infrastructure/external/facilitator-safety.ts` | `validateFacilitatorInput` | 안전 검증 함수가 어디서도 호출되지 않음 |
| `infrastructure/external/llm-evaluator.ts` | `LlmEvaluator` | 인터페이스만 정의, DI 미배선 |
| `infrastructure/external/micro-checkin-scheduler.ts` | `MicroCheckinScheduler` | UI와 연결되지 않음 |

- [ ] **3D.1** 위 3개 인프라 파일 + 대응 테스트 파일 삭제

### 3E: 미사용 DTO (2개)

| 파일 | 클래스 | 미사용 근거 |
|------|--------|-----------|
| `application/dtos/chat-input.ts` | `SendMessageInputSchema` 등 | API 라우트가 스키마 검증 없이 body 직접 접근 |
| `application/dtos/disclosure-input.ts` | `UpdateDisclosureInputSchema` 등 | 동일 |

- [ ] **3E.1** 위 2개 DTO 파일 + 대응 테스트 파일 삭제
  > **대안**: API 라우트에서 이 스키마를 실제 사용하도록 연결 (보안 강화). 이 경우 삭제하지 않고 Phase 외 별도 작업으로 처리.

### Quality Gate
- [ ] `pnpm run build` 성공 (삭제된 파일 import 에러 없음)
- [ ] `pnpm run test:run` 기존 통과 테스트 유지
- [ ] 삭제한 파일에 대한 import가 남아있지 않은지 grep 확인

---

## Phase 4: 중복 로직 정리

**Goal**: 동일 로직의 이중 구현 제거
**예상 소요**: 20분

### 4A: JITAI 규칙 중복

| 구현 위치 | 사용처 |
|----------|--------|
| `domain/value-objects/intervention-policy.ts` → `InterventionPolicy.evaluate()` | LangGraph 에이전트가 실제 사용 |
| `application/use-cases/evaluate-jitai-rules.ts` → `EvaluateJitaiRulesUseCase` | DI 등록됨, 하지만 **어떤 API 라우트/컴포넌트도 호출하지 않음** |

동일한 5개 규칙 (DISTRESS, FATIGUE, TENSION, BLANK_FEAR, LOW_LISTENING)을 동일한 조건으로 평가.
출력 형태만 다름 (`InterventionDecision` vs `JitaiAction[]`).

- [ ] **4A.1** `EvaluateJitaiRulesUseCase` + 테스트 삭제
- [ ] **4A.2** DI 컨테이너에서 `evaluateJitaiRulesUseCase` 제거
- [ ] **4A.3** `InterventionPolicy`를 단일 진실 공급원(Single Source of Truth)으로 유지

### 4B: 중복 테스트 파일

- [ ] **4B.1** `adaptive-matching.test.ts` 검토
  - `FindMatchCandidatesUseCase`를 `find-match-candidates.test.ts`와 중복 테스트
  - 고유한 테스트 케이스가 있으면 `find-match-candidates.test.ts`에 병합 후 삭제
  - 완전 중복이면 바로 삭제

### 4C: DI 컨테이너 중복 인스턴스

- [ ] **4C.1** `container-core.ts`에서 `fallbackQuestionGenerator` 정리
  - `questionGenerator`와 `fallbackQuestionGenerator` 두 인스턴스 생성
  - `questionGenerator`는 컨테이너에서 반환되지만 어디서도 소비되지 않음
  - `next-batch/route.ts`가 ad-hoc으로 `FallbackQuestionGenerator` 직접 생성
  - → 불필요한 인스턴스 제거 또는 일관된 패턴으로 통합

### Quality Gate
- [ ] `pnpm run build` 성공
- [ ] `pnpm run test:run` 통과 테스트 수 유지 또는 증가
- [ ] grep으로 삭제된 심볼 참조 없음 확인

---

## Phase 5: 마이그레이션 번호 충돌 수정

**Goal**: 마이그레이션 실행 순서 모호성 해결
**예상 소요**: 10분

### 작업 목록

- [ ] **5.1** 마이그레이션 번호 충돌 해결
  - `006-seed-30-users.sql`과 `006-v4-persistence.sql`이 동일 번호
  - `006-v4-persistence.sql` → `007-v4-persistence.sql`로 번호 변경
  - 기존 `007-fix-dialogue-step-constraint.sql` → `008-...`
  - `008-fix-dialogue-turns-step-constraint.sql` → `009-...`
  - `009-add-demographic-columns.sql` → `010-...`

> **주의**: 이미 프로덕션 DB에 적용된 마이그레이션이 있다면 파일 이름만 변경하고, 마이그레이션 이력 테이블과의 정합성을 확인해야 함.

### Quality Gate
- [ ] 마이그레이션 파일 번호가 모두 고유한지 확인
- [ ] 파일 내용 변경 없음 확인 (번호만 변경)

---

## Phase 6: 문서 정비

**Goal**: 오래된 문서와 현재 상태 간 불일치 해소
**예상 소요**: 30분

### 작업 목록

- [ ] **6.1** 미커밋 삭제 파일들 커밋
  - `docs/plans/v3-frontend-testing-guide.md` (이미 삭제됨, 미커밋)
  - `docs/plans/active/007-v4-browser-rigorous-test-scenarios.md` (이미 삭제됨)
  - `docs/plans/active/007-v4-browser-rigorous-test-run-2026-02-21.md` (이미 삭제됨)
  - `product_plan.md` (이미 삭제됨, `PerspectiveShift_v4.md`로 대체)

- [ ] **6.2** `docs/plans/README.md` 전면 재작성
  - 현재 20+ 개 삭제된 파일을 참조하는 심각한 stale 상태
  - 테스트 수 "877 tests / 149 files" → 실제 "2,002 tests / 377 files"
  - 삭제된 계획들의 아카이브 사실 반영
  - `docs/IMPLEMENTATION_STATUS.md`를 살아있는 현황 문서로 연결

- [ ] **6.3** `ARCHITECTURE.md` 업데이트
  - Section 4 "Domain Model Summary" — "22 entities, 34 VOs" → "37 entities, 84 VOs"
  - Section 7 "Current State" — "v2.0 Complete, 877 tests" → 현재 상태 반영
  - 삭제된 계획 파일 링크 제거
  - **또는**: 아키텍처 원칙만 유지하고, 현재 상태는 `IMPLEMENTATION_STATUS.md`로 위임

- [ ] **6.4** `.agent/` → `.claude/` 참조 일관성 수정
  - `PR_POLICY.md`: `.agent/invariants/` → `.claude/invariants/`
  - `BOOTSTRAP.md`: `.agent/` 참조 전체 → `.claude/`

- [ ] **6.5** `BOOTSTRAP.md` 위치 이동 검토
  - 2,255줄의 부트스트래핑 템플릿 — 이미 실행 완료된 내용
  - 루트 → `docs/_meta/bootstrap-template.md`로 이동 고려
  - 이동 시 루트 문서 혼잡도 감소

- [ ] **6.6** `docs/IMPLEMENTATION_STATUS.md` 커밋
  - 이번 세션에서 작성한 상세 현황 문서
  - 커밋하여 공식 문서로 등록

### Quality Gate
- [ ] 모든 문서 내 링크가 실존하는 파일을 가리키는지 확인
- [ ] `ARCHITECTURE.md`의 수치가 `IMPLEMENTATION_STATUS.md`와 일치
- [ ] `.agent/` 참조가 코드베이스에서 0건인지 grep 확인

---

## Phase 7: 가드닝 스크립트 정비

**Goal**: 미사용 스크립트 정리
**예상 소요**: 10분

### 작업 목록

- [ ] **7.1** `scripts/gardening/` 평가
  - `doc-sync-check` — CI에서 호출되지 않음, 수동 전용
  - `memory-review` — CI에서 호출되지 않음, 수동 전용
  - 삭제하거나, `tools/doctor`에 통합하거나, README에 수동 실행 안내 추가

- [ ] **7.2** `docs/design-docs/.gitkeep` 빈 디렉토리 정리
  - `docs/design/`과 `docs/design-docs/`가 공존 — 후자는 빈 디렉토리
  - 삭제

### Quality Gate
- [ ] `tools/` 내 모든 스크립트가 정상 실행 가능
- [ ] 빈 디렉토리가 불필요하게 남아있지 않음

---

## 전체 리스크 평가

| 리스크 | 확률 | 영향 | 완화 |
|--------|------|------|------|
| 삭제한 코드가 실제로 간접적으로 사용됨 | 낮음 | 중간 | 삭제 전 grep으로 import 확인, 빌드 테스트 |
| 마이그레이션 번호 변경이 프로덕션 DB에 영향 | 중간 | 높음 | 프로덕션 마이그레이션 이력 확인 후 진행 |
| 문서 재작성 시 유용한 정보 손실 | 낮음 | 낮음 | git history에서 복구 가능 |
| git worktree 제거 실패 | 낮음 | 낮음 | `--force` 옵션 사용 |

## 롤백 전략

- **Phase 1-2**: 파일 시스템 작업만, git 이력에서 복구 가능
- **Phase 3-4**: 코드 삭제 → `git checkout -- <file>` 또는 `git stash`로 복구
- **Phase 5**: 파일 이름 변경만 → `git mv`로 되돌림
- **Phase 6**: 문서 수정 → git 이력에서 복구
- **전체**: 각 Phase를 별도 커밋으로 분리하여 선택적 revert 가능

---

## 진행 순서 및 의존성

```
Phase 1 (임시 파일) ──→ Phase 2 (.gitignore/CI) ──→ 커밋 A
                                                        │
Phase 3 (데드 코드) ──→ Phase 4 (중복 로직) ───────→ 커밋 B
                                                        │
Phase 5 (마이그레이션) ────────────────────────────→ 커밋 C
                                                        │
Phase 6 (문서) ──→ Phase 7 (스크립트) ─────────────→ 커밋 D
```

## 예상 총 소요 시간

| Phase | 소요 |
|-------|------|
| Phase 1: 임시 파일 | 15분 |
| Phase 2: 설정 정상화 | 20분 |
| Phase 3: 데드 코드 | 30분 |
| Phase 4: 중복 로직 | 20분 |
| Phase 5: 마이그레이션 | 10분 |
| Phase 6: 문서 | 30분 |
| Phase 7: 스크립트 | 10분 |
| **합계** | **~2시간 15분** |

---

## 결정 필요 사항

다음 사항은 사용자 확인이 필요합니다:

1. **미사용 DTO (Phase 3E)**: 삭제 vs API 라우트에 스키마 검증 연결?
2. **마이그레이션 번호 (Phase 5)**: 프로덕션 DB에 이미 적용된 마이그레이션이 있는지?
3. **BOOTSTRAP.md (Phase 6.5)**: 루트 유지 vs `docs/_meta/`로 이동?
4. **가드닝 스크립트 (Phase 7.1)**: 삭제 vs `tools/doctor` 통합 vs 수동 유지?
