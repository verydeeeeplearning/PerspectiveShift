---
owner: "@repo-owner"
status: active
last_reviewed: 2026-02-18
---

# Protocol — PerspectiveShift (Phase Gate)

> 에이전트는 모든 작업에서 이 Phase Gate를 따른다. 부트스트랩뿐 아니라 기능 구현, 버그 수정, 리팩토링 모두에 적용된다.

## Phase 0: Inventory (현황 파악)
- 레포 구조/스택/기존 명령 파악
- 관련 스펙/문서/ADR 확인
- 영향 범위 식별
- 결과를 `docs/plans/active/`에 기록

## Phase 1: Spec (스펙 확정)
- 기능 변경: `specs/features/`에 스펙 작성 (spec-template.md 사용)
- 환경 변경: `specs/environment.spec.md` 갱신
- 아키텍처 변경: `specs/decisions/`에 ADR 작성
- **스펙이 1차 진실 소스**

## Phase 2: Plan (실행 계획)
- `docs/plans/active/`에 실행 계획 작성
- 목표 / 비목표 / 변경 파일 목록 / 위험 작업 / Definition of Done / Rollback 방법

## Phase 3: Execute (구현)
- 계획 범위 내 변경만 수행
- 불변량 준수 (`.agent/invariants/`)
- 권한 정책 준수 (`POLICIES.md`)

## Phase 4: Verify (LOOP UNTIL CLEAN)
```
./tools/doctor → 실패 시 원인 수정 → 재실행
./tools/ci     → 실패 시 원인 수정 → 재실행
반복: "통과" 또는 "외부 의존성으로 통과 불가 확정"까지
```

## Phase 5: PR / Handoff (최종 산출)
- PR 템플릿에 맞는 요약 작성
- 승인 필요 작업은 실행하지 말고 PR 본문에 명시
- 실패/교정이 있었다면 `evals/regression/`에 회귀 방지 케이스 등록

## 워크플로우별 Phase 적용

### 새 기능 구현
```
Phase 0 → Phase 1(스펙) → Phase 2(계획) → 사용자 승인
→ Phase 3(구현: LOOP → 코드+테스트 → 린트 → 테스트)
→ Phase 4(검증) → Phase 5(PR)
```

### 버그 수정
```
Phase 0(재현) → 실패 테스트 작성
→ Phase 3(수정: LOOP UNTIL CLEAN) → Phase 4(검증)
→ evals/regression에 케이스 등록 → Phase 5(PR)
```

### 리팩토링
```
Phase 0 → Phase 1(ADR) → Phase 2(계획, 기존 테스트 기준선 확인)
→ Phase 3(리팩토링: 기존 테스트 수정 없이 통과 필수)
→ Phase 4(검증) → Phase 5(PR)
```

### 문서 정원 관리 (주기적)
```
Phase 0(스캔) → Phase 3(불일치 수정, 메모리 승격)
→ Phase 4(검증) → Phase 5(PR)
```
