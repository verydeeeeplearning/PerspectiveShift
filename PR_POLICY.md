---
owner: "@repo-owner"
status: active
last_reviewed: 2026-02-18
---

# PR Policy — PerspectiveShift

## Principles
- PR은 작게 (리뷰 가능한 단위)
- 모든 PR은 `./tools/ci` 결과를 포함
- 승인 필요한 작업(의존성 추가/네트워크/CI 변경)은 PR 본문에 명시
- 수정이 저렴하므로 최소한의 블로킹 게이트 유지
- 짧은 PR 생명주기 지향

## Required in PR Description
- What: 무엇을 변경했는가
- Why: 왜 변경했는가
- How: 어떻게 변경했는가
- 관련 스펙 링크 (해당 시)
- 실행한 명령 + 결과
- 위험 요소 + Rollback 방법
- 승인 필요 작업 목록

## Merge Philosophy
- CI 통과 + 린트 통과 = 머지 가능 (기본)
- 에이전트 자체 리뷰 → 인간 최종 확인
- 테스트 flake 시 후속 실행으로 해결 (즉시 블로킹하지 않음)

## Entropy Management (AI Slop 방지)
- 골든 principles를 `.agent/invariants/`에 인코딩
- YOLO-style 데이터 탐색 금지
- 공유 유틸리티 패키지 선호 (헬퍼 중복 방지)
- 기술 부채는 작은 증분으로 지속 상환
