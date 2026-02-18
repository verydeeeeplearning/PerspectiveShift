# AGENTS.md — PerspectiveShift

> 이 파일은 코딩 에이전트의 진입점이다. 각 섹션은 상세 문서로의 포인터를 포함한다.
> **원칙: 이 파일은 100줄 이내의 목차로 유지한다. 상세 내용은 링크된 문서에 작성한다.**

## Project Identity
- **이름**: PerspectiveShift
- **설명**: LLM Agent 기반 구조화된 대화 플랫폼
- **도메인**: civic-tech
- **헌법**: → [CONSTITUTION.md](CONSTITUTION.md)

## Golden Rules (요약)
- 정책: [POLICIES.md](POLICIES.md)를 최우선으로 준수
- Spec-first: [specs/environment.spec.md](specs/environment.spec.md)가 환경의 1차 진실 소스
- PR-first: 변경은 PR 단위로, 작게
- Verify: `./tools/doctor` → `./tools/ci` 통과가 기본

## Standard Commands (스택 무관 고정 인터페이스)
```bash
./tools/bootstrap    # 의존성 설치/초기 구성
./tools/doctor       # 환경 건강 체크
./tools/fmt          # 포맷팅
./tools/lint         # 린트
./tools/test         # 테스트
./tools/ci           # fmt → lint → test → build 순서 보장
```

## Architecture
- **아키텍처 맵**: → [ARCHITECTURE.md](ARCHITECTURE.md)
- **의존성 규칙**: → [.claude/invariants/architecture.yaml](.claude/invariants/architecture.yaml)
- **결정 기록**: → [specs/decisions/](specs/decisions/)

## Tech Stack
- **언어**: TypeScript
- **프레임워크**: Next.js (App Router)
- **패키지 매니저**: pnpm
- **테스트**: Vitest
- **린트**: ESLint
- **LLM**: OpenAI GPT-5-mini
- **Agent Framework**: LangGraph
- **DB**: Supabase (PostgreSQL)
- **배포**: Vercel

## Development Workflow (SDD + PR-First)
1. 스펙 작성: → [.claude/templates/spec-template.md](.claude/templates/spec-template.md)
2. 태스크 분해 및 구현
3. 테스트 + eval 실행
4. PR 생성: → [.claude/templates/pr-template.md](.claude/templates/pr-template.md)
5. 리뷰 → 머지
- **상세 프로토콜**: → [PROTOCOL.md](PROTOCOL.md)

## Coding Standards & Invariants
- **아키텍처 규칙**: → [.claude/invariants/architecture.yaml](.claude/invariants/architecture.yaml)
- **네이밍 규칙**: → [.claude/invariants/naming.yaml](.claude/invariants/naming.yaml)
- **품질 게이트**: → [.claude/invariants/quality.yaml](.claude/invariants/quality.yaml)

## Testing & Evaluation (EDD)
- **eval 설정**: → [evals/eval-config.yaml](evals/eval-config.yaml)
- **골든 테스트**: → [evals/golden/](evals/golden/)
- **회귀 세트**: → [evals/regression/](evals/regression/)

## Agent Team Roles
- **Planner**: → [.claude/team/planner.md](.claude/team/planner.md)
- **Implementer**: → [.claude/team/implementer.md](.claude/team/implementer.md)
- **Reviewer**: → [.claude/team/reviewer.md](.claude/team/reviewer.md)
- **Tester**: → [.claude/team/tester.md](.claude/team/tester.md)

## Policies & Permissions
- **정책**: → [POLICIES.md](POLICIES.md)
- **PR 정책**: → [PR_POLICY.md](PR_POLICY.md)

## Memory & Learnings
- **글로벌 학습**: → [.claude/memory/global.md](.claude/memory/global.md)
- **개인 학습**: → [.claude/memory/personal.md](.claude/memory/personal.md)

## Docs Index (Progressive Disclosure)
- **문서 규약**: → [docs/_meta/doc-conventions.md](docs/_meta/doc-conventions.md)
- **실행 계획**: → [docs/plans/](docs/plans/)
- **도메인 가이드**: → [docs/domain-guides/](docs/domain-guides/)
