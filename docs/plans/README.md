# Plans

## Directory Structure
- `active/`: 진행 중인 계획 (현재 비어있음 — 모든 계획 실행 완료 후 삭제됨)
- `done/`: 완료된 계획 (아카이브)
- `debt/`: 기술부채/나중에 처리

## Current Implementation Status

전체 구현 현황은 [`docs/IMPLEMENTATION_STATUS.md`](../IMPLEMENTATION_STATUS.md) 참조.

### 주요 수치 (2026-02-22 기준)
- **프로덕션 코드**: 555 파일 / 32,522줄
- **테스트**: 2,002개 (377 파일)
- **Domain**: 37 엔티티, 84 값 객체, 34 포트 인터페이스
- **Application**: 104 유스케이스, 33 DTO
- **API Routes**: 43개
- **DB Migrations**: 10개

## Completed Versions

모든 계획 문서는 실행 완료 후 삭제되었습니다. 원본은 git history에서 확인 가능합니다.

| 버전 | 상태 | 주요 내용 |
|------|------|----------|
| **v1** (Phase 1-3) | Complete | Stance Discovery, Structured Dialogue, Relationship Escalation |
| **v2** (P1-P8) | Complete | Self-Affirmation, 6-Dim Stance, Thought Map, Adaptive Matching, Dialogue FSM, Feedback, Light Protocol, Analytics/Safety |
| **v3** Dynamic Questions | Complete | 4-tier 정밀도, LLM 동적 질문 생성, 차원 커버리지 추적 |
| **v4** (P0-P2) | Complete | 32개 피처 — Trust Moment, 페르소나, Trailer, 스캐폴딩, 튜링 게임, JITAI, PWA 등 |

## Active Plans

- [`PLAN_codebase-cleanup.md`](./PLAN_codebase-cleanup.md): 코드베이스 정리 계획

## Plan Template (minimal)
모든 계획 문서는 아래를 포함한다:
- Goal / Non-goals
- Steps
- Definition of Done
- Risks / Rollback
- Status Log (append-only)
