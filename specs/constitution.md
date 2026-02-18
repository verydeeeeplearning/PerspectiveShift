---
owner: "@repo-owner"
status: active
last_reviewed: 2026-02-18
---

# Project Constitution (상세) — PerspectiveShift

> 이 문서는 CONSTITUTION.md의 상세 확장이다.

## P1. 스펙이 Source of Truth다

### SDD (Spec-Driven Development) 워크플로우
```
요청 → 스펙 작성 → 스펙 승인 → 태스크 분해 → 구현 → 검증 → PR
```

## P2. 보이지 않으면 존재하지 않는다

- 모든 아키텍처 결정 → specs/decisions/ADR-*.md
- 모든 기능 스펙 → specs/features/*.spec.md
- 모든 코딩 컨벤션 → .claude/invariants/
- 모든 도메인 지식 → docs/domain-guides/

## P3. 목표를 안내하되 경로를 강제하지 마라

### 강제하는 것 (불변량)
- 아키텍처 경계, 의존성 방향
- 데이터 검증 위치
- 네이밍 규칙, 파일 크기 제한

### 자유를 주는 것 (구현 세부사항)
- 라이브러리 내 구체적 선택
- 알고리즘 세부사항

## P4. 검증 없는 출력은 출력이 아니다

### LOOP UNTIL CLEAN 패턴
```
코드 변경 → ./tools/fmt → ./tools/lint → ./tools/test → ./tools/ci
     ↑                                                      │
     └──── 하나라도 실패 시 원인 분석 → 수정 ←──────────────┘
```

## P5. 수정이 저렴하면 예방 비용을 줄여라

- 최소한의 블로킹 게이트 (CI 통과 = 머지 가능)
- 짧은 PR 생명주기
- 기술 부채는 작은 증분으로 지속 상환

## 도메인 원칙

### D1. Privacy by Design
Identity와 Stance 데이터를 물리적으로 분리. 매칭 엔진은 anonymized vector만 접근.

### D2. Anonymity by Default
모든 사용자 간 상호작용은 기본 익명. 공개는 상호 동의 시에만.

### D3. LLM 호출 전 PII Scrubbing 필수
사용자 텍스트 → Regex + NER 기반 PII 제거 → LLM API 전송.

### D4. 적정 거리 매칭
완전 정반대가 아닌 cosine distance 0.4-0.7 범위의 "적정 거리" 이견을 매칭.
