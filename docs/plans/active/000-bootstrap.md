---
owner: "@agent"
status: active
last_reviewed: 2026-02-18
---

# Plan: Bootstrap Agent-Ready Environment

## Goal
표준 엔트리포인트(`./tools/*`)와 핵심 문서/스펙/거버넌스 체계를 구성한다.

## Non-goals
- 제품 기능 개발은 포함하지 않는다.
- 기존 코드를 수정하지 않는다.

## Steps
1. ✅ Inventory (스택 감지, 기존 구조 파악)
2. ✅ Spec 확정 (specs/environment.spec.md)
3. ✅ 문서/거버넌스 파일 생성
4. ✅ tools/ 엔트리포인트 생성
5. ✅ 불변량/에이전트 설정 생성
6. ⬜ Verify (`./tools/doctor`, `./tools/ci`)

## Definition of Done
- specs/environment.spec.md의 `required_paths`에 나열된 모든 파일 존재
- `./tools/doctor` 통과
- `./tools/ci` 통과 (또는 스택 미설정으로 인한 예외 기록)

## Risks / Rollback
- 변경은 새 파일 생성이므로, 삭제로 롤백 가능
- 기존 파일은 수정하지 않음

## Status Log
- 2026-02-18: Bootstrap 시작
- 2026-02-18: Phase 0-7 파일 생성 완료 (doctor/ci 검증 대기)
