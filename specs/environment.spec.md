---
owner: "@repo-owner"
status: active
last_reviewed: 2026-02-18
---

# Environment Spec — PerspectiveShift

> 이 파일은 에이전트 환경의 기계 판독 가능한 스펙이다.
> 에이전트는 이 YAML을 "요구사항"으로 읽고, 레포를 이 상태로 만든다.
> **이 스펙과 실제 파일 상태가 어긋나면, 스펙이 우선이다.**

## Machine-Readable Spec

```yaml
agent_env_spec_version: "0.3"
project: "PerspectiveShift"

# === 지원 환경 ===
runtime:
  language: "TypeScript"
  framework: "Next.js (App Router)"
  package_manager: "pnpm"
  test_framework: "vitest"
  lint_tool: "eslint"

# === LLM / Agent ===
llm:
  provider: "OpenAI"
  primary_model: "gpt-5-mini"
  agent_framework: "LangGraph"
  monitoring: "LangSmith"

# === 인프라 ===
infrastructure:
  database: "Supabase (PostgreSQL)"
  deployment: "Vercel"
  auth: "OAuth 2.0 (Google, Kakao, Apple) via Supabase Auth"
  realtime: "Supabase Realtime"

# === 필수 파일/디렉토리 ===
required_paths:
  # 거버넌스 문서
  - AGENTS.md
  - ARCHITECTURE.md
  - CONSTITUTION.md
  - POLICIES.md
  - PROTOCOL.md
  - PR_POLICY.md
  # 스펙
  - specs/environment.spec.md
  - specs/constitution.md
  - specs/features/
  - specs/decisions/
  # 문서
  - docs/_meta/doc-conventions.md
  - docs/plans/README.md
  - docs/plans/active/000-bootstrap.md
  # 평가
  - evals/README.md
  - evals/eval-config.yaml
  - evals/golden/
  - evals/regression/
  # 표준 엔트리포인트
  - tools/bootstrap
  - tools/doctor
  - tools/fmt
  - tools/lint
  - tools/test
  - tools/ci
  # 에이전트 설정
  - .claude/config.yaml
  - .claude/invariants/architecture.yaml
  - .claude/invariants/naming.yaml
  - .claude/invariants/quality.yaml
  - .claude/team/planner.md
  - .claude/team/implementer.md
  - .claude/team/reviewer.md
  - .claude/team/tester.md
  - .claude/memory/global.md
  - .claude/memory/personal.md
  - .claude/templates/spec-template.md
  - .claude/templates/adr-template.md
  - .claude/templates/pr-template.md

# === 표준 엔트리포인트 계약 ===
entrypoint_contract:
  bootstrap:
    role: "의존성 설치/초기 구성"
    network_required: true
    approval_note: "네트워크 접근이 필요하므로 승인 필요 작업"
  doctor:
    role: "환경 건강 체크"
    exit_0_means: "필수 파일 + 툴체인 + 설정 체크 통과"
    exit_nonzero_means: "누락/오설정 발견 + 다음 액션 안내"
  ci:
    role: "fmt → lint → test → build(if present) 순서 보장"
    must_run_in_order: ["fmt", "lint", "test", "build_if_present"]
    exit_0_means: "모든 체크 통과"
  fmt:
    role: "코드 포맷팅 (prettier)"
  lint:
    role: "코드 린트 (eslint)"
  test:
    role: "테스트 실행 (vitest)"

# === 거버넌스 ===
governance:
  pr_first: true
  plan_required_for:
    - "dependency_addition"
    - "mass_edit > 20 files"
    - "network_install"
    - "ci_workflow_change"
    - "architecture_invariant_change"
  approvals_required_for:
    - "destructive_commands"
    - "installing_system_packages"
    - "adding_prod_dependencies"
    - "accessing_network"
    - "deploy_or_release"
    - "db_schema_change"

# === 문서 구조 ===
doc_structure:
  progressive_disclosure: true
  front_matter_required_fields: ["owner", "status", "last_reviewed"]
  status_values: ["draft", "active", "deprecated"]
```

## Human-Readable Summary

### 표준 엔트리포인트
| 명령 | 역할 | 네트워크 | 승인 |
|------|------|---------|------|
| `./tools/bootstrap` | 의존성 설치/초기 구성 | 필요 | 승인 필요 |
| `./tools/doctor` | 환경 건강 체크 | 불필요 | 자동 |
| `./tools/fmt` | 코드 포맷팅 | 불필요 | 자동 |
| `./tools/lint` | 코드 린트 | 불필요 | 자동 |
| `./tools/test` | 테스트 실행 | 불필요 | 자동 |
| `./tools/ci` | fmt→lint→test→build | 불필요 | 자동 |

### 검증 방법
- `./tools/doctor`가 이 스펙의 `required_paths`를 검증한다
- `./tools/ci`가 이 스펙의 `entrypoint_contract.ci.must_run_in_order`를 실행한다
