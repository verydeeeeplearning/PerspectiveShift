---
owner: "@repo-owner"
status: active
last_reviewed: 2026-02-18
---

# Document Conventions

## Front-matter (필수)
모든 운영 문서(governance, specs, plans, domain guides)에는 아래 YAML front-matter를 포함한다:

```yaml
---
owner: "@username"
status: draft | active | deprecated
last_reviewed: YYYY-MM-DD
---
```

## Status Lifecycle
```
draft → active → deprecated
```

## Progressive Disclosure 원칙
- AGENTS.md에는 링크/요약만 포함
- 상세 규칙은 해당 문서로 분산
- 도메인별 지식은 docs/domain-guides/로 분산

## Naming
- 파일명: kebab-case (예: `doc-conventions.md`)
- 계획 문서: `NNN-title.md` (예: `000-bootstrap.md`)
- ADR: `ADR-NNN-title.md` (예: `ADR-001-choose-database.md`)

## Rot Prevention
- `last_reviewed`가 90일 이상 지난 문서는 검토 대상
- 코드와 불일치하는 문서 발견 시 즉시 업데이트 또는 deprecated 처리
