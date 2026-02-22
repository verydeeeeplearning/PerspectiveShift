# BOOTSTRAP.md — Agent Environment Auto-Configuration Protocol

> **이 문서의 목적**: 이 문서를 읽은 코딩 에이전트는 아래 지침을 순서대로 실행하여 프로젝트의 개발 환경, 문서 체계, 검증 시스템, 거버넌스 구조를 자동으로 구성한다.
>
> **실행 방법**: 이 문서를 프로젝트 리포지토리 루트에 배치한 뒤, 에이전트에게 "이 문서를 읽고 환경을 구성해줘"라고 지시한다.
>
> **핵심 원칙**: 에이전트는 이 문서의 모든 섹션을 순서대로 읽고, `[EXECUTE]` 태그가 붙은 지시사항을 실행한다. `[TEMPLATE]` 태그는 생성할 파일의 내용이다. `[RULE]` 태그는 모든 작업에 적용되는 불변 규칙이다.

---

## 0. 사전 준비: 프로젝트 변수 수집

[EXECUTE] 환경 구성을 시작하기 전에, 아래 2단계를 수행하라.

### 0.1 자동 스택 감지 (Stack Detection)

프로젝트 루트의 기존 파일을 분석하여 스택을 자동 감지하라. **감지된 기존 설정은 절대 교체하지 않고 존중(래핑)한다.**

```
감지 우선순위:
  Node/TS  → package.json
  Python   → pyproject.toml 또는 requirements.txt
  Go       → go.mod
  Rust     → Cargo.toml
  Java     → build.gradle 또는 pom.xml

패키지 매니저 감지 (Node):
  pnpm-lock.yaml 존재 → pnpm
  yarn.lock 존재      → yarn
  package-lock.json   → npm
  lockfile 없음       → 새 매니저를 도입하지 말고 사용자에게 제안만

패키지 매니저 감지 (Python):
  uv.lock 존재        → uv
  poetry.lock 존재    → poetry
  requirements.txt    → venv + pip
  아무것도 없음        → 사용자에게 제안만

기존 도구 감지:
  Makefile, justfile, .github/workflows, scripts/, npm scripts 등
  → 존재하면 교체하지 말고, tools/에서 래핑(wrapper)한다
```

### 0.2 변수 확정

자동 감지로 채울 수 없는 항목만 사용자에게 질문한다.

```yaml
# === 프로젝트 기본 정보 ===
PROJECT_NAME: ""           # 프로젝트 이름 (예: "my-saas-app")
PROJECT_DESCRIPTION: ""    # 1줄 설명
PROJECT_DOMAIN: ""         # 비즈니스 도메인 (예: "e-commerce", "fintech", "developer-tools")

# === 기술 스택 (자동 감지 우선, 감지 불가 시 질문) ===
PRIMARY_LANGUAGE: ""       # 주 언어 (예: "TypeScript", "Python", "Go")
FRAMEWORK: ""              # 주 프레임워크 (예: "Next.js", "FastAPI", "Gin")
PACKAGE_MANAGER: ""        # 패키지 매니저 (예: "pnpm", "pip", "go mod")
TEST_FRAMEWORK: ""         # 테스트 프레임워크 (예: "vitest", "pytest", "go test")
LINT_TOOL: ""              # 린트 도구 (예: "eslint", "ruff", "golangci-lint")

# === 인프라 ===
DATABASE: ""               # DB (예: "PostgreSQL", "MongoDB", "None")
DEPLOYMENT_TARGET: ""      # 배포 대상 (예: "Vercel", "AWS", "Docker", "None")
CI_PLATFORM: ""            # CI 플랫폼 (예: "GitHub Actions", "GitLab CI", "None")

# === 에이전트 설정 ===
AGENT_TYPE: ""             # 사용 중인 에이전트 (예: "Claude Code", "Codex", "Cursor", "Copilot")
AUTONOMY_LEVEL: "medium"  # 자율성 수준: "low" | "medium" | "high"
```

### 0.3 빈 레포 처리 규칙

레포가 비어있거나 초기 상태인 경우:

```
1. README.md에서 프로젝트 의도를 발견할 수 있으면
   → 그에 맞는 최소 스켈레톤 추가 (Hello World 수준)
   → tools/ci가 의미 있게 동작하도록 구성

2. 의도가 불명확하면
   → 환경만 구성한다 (문서 + tools + 프로토콜)
   → 실제 앱/패키지는 생성하지 않는다
   → specs/environment.spec.md에 "프로젝트 타입 결정을 위해 사용자 확인 필요"를 기록한다
```

[RULE] 변수 확정이 완료되면 사용자에게 감지 결과 + 확정된 변수 목록을 보여주고 확인을 받은 뒤 다음 단계로 진행하라.

---

## 1. Constitutional Principles — 프로젝트 헌법

아래 5가지 원칙은 이 프로젝트에서 에이전트가 내리는 **모든 판단의 최상위 기준**이다. 충돌이 발생하면 번호가 낮은 원칙이 우선한다.

```
원칙 1: 스펙이 Source of Truth다 — 코드는 스펙의 구현이다.
        코드를 먼저 작성하지 마라. 스펙(의도와 제약)을 먼저 문서화하고,
        그 스펙을 기준으로 구현하라.

원칙 2: 보이지 않으면 존재하지 않는다 — 모든 결정을 리포지토리 내 파일로 인코딩하라.
        에이전트가 실행 중에 접근할 수 없는 지식은 존재하지 않는 것과 같다.
        모든 의사결정, 합의, 맥락을 버전 관리되는 마크다운으로 기록하라.

원칙 3: 목표를 안내하되 경로를 강제하지 마라 — 불변량을 강제하되 구현을 마이크로매니지하지 마라.
        "데이터 형상은 경계에서 파싱하라"는 강제한다.
        "Zod를 사용하라"는 강제하지 않는다.

원칙 4: 검증 없는 출력은 출력이 아니다 — 모든 변경은 자동 검증을 통과해야 한다.
        코드를 작성했으면 테스트를 실행하라. 린트를 통과시켜라.
        Before/After를 비교하라. 실패하면 수정하고 반복하라.

원칙 5: 수정이 저렴하면 예방 비용을 줄여라 — 완벽을 기다리지 말고 빠르게 반복하라.
        기술 부채는 고금리 대출과 같다. 작은 증분으로 지속적으로 상환하라.
```

[RULE] 에이전트는 모든 작업에서 이 5가지 원칙을 참조한다. 원칙과 충돌하는 행동을 감지하면, 해당 원칙을 인용하며 경로를 수정하라.

---

## 2. 디렉토리 구조 생성

[EXECUTE] 아래 디렉토리 구조를 프로젝트 루트에 생성하라. 이미 존재하는 디렉토리/파일은 건드리지 않는다. 기존 프로젝트 구조와 충돌하지 않도록 주의하라.

```
{{PROJECT_ROOT}}/
│
├── AGENTS.md                              ← [생성] 에이전트 진입점 (목차, ~100줄)
├── ARCHITECTURE.md                        ← [생성] 아키텍처 맵
├── CONSTITUTION.md                        ← [생성] 프로젝트 헌법 (불변량)
├── POLICIES.md                            ← [생성] 승인/보안/시크릿 정책
├── PROTOCOL.md                            ← [생성] Phase Gate 작업 프로토콜
├── PR_POLICY.md                           ← [생성] PR 정책 + 머지 철학
│
├── specs/                                 ← [생성] 스펙 디렉토리 (SDD)
│   ├── environment.spec.md                ← [생성] 환경 스펙 (기계 판독 가능 YAML 포함)
│   ├── constitution.md                    ← [생성] 프로젝트 헌법 상세
│   ├── features/                          ← [생성] 기능별 스펙
│   │   └── .gitkeep
│   └── decisions/                         ← [생성] Architecture Decision Records
│       └── .gitkeep
│
├── docs/                                  ← [생성] 문서 디렉토리
│   ├── _meta/
│   │   └── doc-conventions.md             ← [생성] 문서 메타데이터 표준
│   ├── plans/
│   │   ├── README.md                      ← [생성] 계획 문서 운영 규칙
│   │   └── active/
│   │       └── 000-bootstrap.md           ← [생성] 부트스트랩 실행 계획/로그
│   ├── design-docs/                       ← [생성] 설계 문서
│   │   └── .gitkeep
│   ├── references/                        ← [생성] 외부 기술 참조
│   │   └── .gitkeep
│   └── domain-guides/                     ← [생성] 도메인별 가이드
│       └── .gitkeep
│
├── evals/                                 ← [생성] 평가 디렉토리 (EDD)
│   ├── README.md                          ← [생성] eval 구조 설명
│   ├── bootstrap/
│   │   └── fresh-clone.md                 ← [생성] 부트스트랩 eval 케이스
│   ├── golden/                            ← [생성] 골든 테스트 케이스
│   │   └── .gitkeep
│   ├── regression/                        ← [생성] 회귀 방지 세트
│   │   └── .gitkeep
│   └── eval-config.yaml                   ← [생성] 평가 설정
│
├── tools/                                 ← [생성] 표준 엔트리포인트 (스택 무관 고정 인터페이스)
│   ├── bootstrap                          ← [생성] 의존성 설치/초기 구성
│   ├── doctor                             ← [생성] 환경 건강 체크
│   ├── fmt                                ← [생성] 포맷팅
│   ├── lint                               ← [생성] 린트
│   ├── test                               ← [생성] 테스트
│   └── ci                                 ← [생성] fmt → lint → test → build 순서 보장
│
├── scripts/                               ← [생성] 확장 스크립트 (gardening 등)
│   └── gardening/                         ← [생성] 문서 정원 관리
│       └── .gitkeep
│
├── .claude/                                ← [생성] 에이전트 설정 디렉토리
│   ├── config.yaml                        ← [생성] 에이전트 런타임 설정
│   ├── team/                              ← [생성] 에이전트 팀 페르소나
│   │   ├── planner.md
│   │   ├── implementer.md
│   │   ├── reviewer.md
│   │   └── tester.md
│   ├── memory/                            ← [생성] 학습 기록
│   │   ├── global.md
│   │   └── personal.md
│   ├── templates/                         ← [생성] 템플릿
│   │   ├── spec-template.md
│   │   ├── adr-template.md
│   │   └── pr-template.md
│   └── invariants/                        ← [생성] 불변량 정의
│       ├── architecture.yaml
│       ├── naming.yaml
│       └── quality.yaml
│
└── .github/                               ← [생성, CI_PLATFORM이 GitHub Actions인 경우]
    ├── pull_request_template.md            ← [생성] PR 템플릿
    └── workflows/
        └── agent-verify.yaml              ← [생성] CI 워크플로우
```

[RULE] `.claude/` 디렉토리는 `.gitignore`에 추가하지 않는다. 이 디렉토리의 모든 파일은 버전 관리 대상이다.

[RULE] 기존 프로젝트에 동일 이름의 디렉토리/파일이 존재하면, 기존 구조를 존중하고 내용을 **통합/보완**한다. 절대 덮어쓰지 마라.

---

## 3. 파일 생성: AGENTS.md (에이전트 진입점)

[EXECUTE] 프로젝트 루트에 `AGENTS.md`를 생성하라. 이 파일은 ~100줄의 목차/포인터 역할만 수행한다.

[TEMPLATE: AGENTS.md]

```markdown
# AGENTS.md — {{PROJECT_NAME}}

> 이 파일은 코딩 에이전트의 진입점이다. 각 섹션은 상세 문서로의 포인터를 포함한다.
> **원칙: 이 파일은 100줄 이내의 목차로 유지한다. 상세 내용은 링크된 문서에 작성한다.**

## Project Identity
- **이름**: {{PROJECT_NAME}}
- **설명**: {{PROJECT_DESCRIPTION}}
- **도메인**: {{PROJECT_DOMAIN}}
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
- **언어**: {{PRIMARY_LANGUAGE}}
- **프레임워크**: {{FRAMEWORK}}
- **패키지 매니저**: {{PACKAGE_MANAGER}}
- **테스트**: {{TEST_FRAMEWORK}}
- **린트**: {{LINT_TOOL}}

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
```

[RULE] AGENTS.md는 100줄을 초과하지 않는다. 새로운 정보가 추가될 때, 상세 내용은 해당 문서에 작성하고 AGENTS.md에는 포인터만 추가한다.

---

## 4. 파일 생성: ARCHITECTURE.md

[EXECUTE] 프로젝트 루트에 `ARCHITECTURE.md`를 생성하라. 기존 코드베이스가 있으면 분석하여 실제 구조를 반영하라. 신규 프로젝트면 아래 템플릿을 기반으로 작성하라.

[TEMPLATE: ARCHITECTURE.md]

```markdown
# Architecture — {{PROJECT_NAME}}

> 이 문서는 프로젝트의 아키텍처 맵이다. 에이전트는 코드 변경 전 이 문서를 참조하여
> 의존성 방향과 레이어 경계를 준수해야 한다.

## 1. 레이어 구조

### 의존성 방향 (반드시 이 방향으로만)
```
[Types/Models] → [Config] → [Repository/Data] → [Service/Logic] → [Runtime/Handler] → [UI/API Surface]
```

- **Types/Models**: 데이터 타입 정의, 인터페이스, 스키마
- **Config**: 환경 설정, 상수, 기능 플래그
- **Repository/Data**: 데이터 접근 계층, 외부 서비스 클라이언트
- **Service/Logic**: 비즈니스 로직, 유스케이스
- **Runtime/Handler**: HTTP 핸들러, CLI 커맨드, 이벤트 리스너
- **UI/API Surface**: 프론트엔드 컴포넌트, API 라우트 정의

### 교차 관심사 (Cross-Cutting Concerns)
교차 관심사는 **Providers**라는 단일 명시적 인터페이스를 통해서만 진입한다:
- 인증(Auth)
- 로깅(Logging)
- 텔레메트리(Telemetry)
- 기능 플래그(Feature Flags)
- 에러 처리(Error Handling)

## 2. 디렉토리 ↔ 레이어 매핑

| 디렉토리 | 레이어 | 의존 가능 대상 |
|----------|--------|---------------|
| `src/types/` 또는 `src/models/` | Types/Models | 없음 (최하위) |
| `src/config/` | Config | Types |
| `src/repository/` 또는 `src/data/` | Repository | Types, Config |
| `src/service/` 또는 `src/logic/` | Service | Types, Config, Repository |
| `src/handlers/` 또는 `src/routes/` | Runtime | Types, Config, Service |
| `src/ui/` 또는 `src/pages/` | UI Surface | 모든 레이어 (단, Repository 직접 접근 금지) |

## 3. 도메인 경계

(에이전트: 기존 코드베이스를 분석하여 이 섹션을 채워라. 각 도메인/모듈의 책임과 경계를 기술하라.)

| 도메인 | 디렉토리 | 책임 | 외부 의존성 |
|--------|----------|------|------------|
| (분석 후 채움) | | | |

## 4. 데이터 흐름

(에이전트: 주요 데이터 흐름을 기술하라. 예: 사용자 요청 → API → Service → DB → 응답)

## 5. 주요 설계 결정

→ 상세 ADR은 [specs/decisions/](specs/decisions/) 참조
```

[RULE] 에이전트는 기존 코드베이스가 있으면, 코드를 분석하여 ARCHITECTURE.md의 "도메인 경계"와 "데이터 흐름" 섹션을 실제 구조에 맞게 채워야 한다.

---

## 5. 파일 생성: CONSTITUTION.md + POLICIES.md + PROTOCOL.md + PR_POLICY.md

### 5.1 CONSTITUTION.md

[EXECUTE] 프로젝트 루트에 `CONSTITUTION.md`를 생성하라.

[TEMPLATE: CONSTITUTION.md]

```markdown
---
owner: "@repo-owner"
status: active
last_reviewed: {{TODAY_DATE}}
---

# Constitution — {{PROJECT_NAME}} (Non-negotiables)

> 이 문서는 프로젝트의 불변 규칙이다. 모든 스펙, 코드, 설계 결정은 이 원칙을 준수해야 한다.
> 변경 시 반드시 ADR(Architecture Decision Record)을 작성하라.

## 핵심 원칙

1. **스펙이 Source of Truth**: 코드를 먼저 작성하지 마라. 기능 구현 전 `specs/features/`에 스펙을 작성하라.
2. **보이지 않으면 존재하지 않는다**: 모든 의사결정을 리포지토리 내 파일로 기록하라.
3. **불변량 강제, 구현 자유**: 경계(아키텍처, 데이터 검증)는 강제. 구현 세부사항은 에이전트 판단에 위임.
4. **검증 없는 출력은 출력이 아니다**: 모든 변경은 `./tools/ci` 통과 필수.
5. **수정이 저렴하면 예방 비용을 줄여라**: 작은 증분으로 빠르게 반복.
6. **시크릿/개인정보 커밋 금지**: 어떤 상황에서도.
7. **기존 스택 존중**: 패키지 매니저/락파일/테스트러너가 있으면 교체하지 말고 래핑.
8. **대량 수정/의존성 추가/네트워크 작업은 계획+승인 후 수행**.

## 기술 원칙

### T1. 지루한 기술이 더 낫다
합성 가능하고, API가 안정적이며, 널리 알려진 기술을 선호하라.

### T2. 데이터 형상은 경계에서 파싱하라
외부에서 들어오는 모든 데이터는 모듈 경계에서 검증/파싱한다.

### T3. 린트 에러 메시지가 교정 지침이다
모든 린트/검증 규칙의 에러 메시지는 "무엇이 잘못되었고, 어떻게 고쳐야 하는지"를 포함한다.

### T4. 구조화된 로깅
모든 로그는 구조화된 형태(JSON 등)로 출력한다.

## 도메인 원칙

(에이전트: {{PROJECT_DOMAIN}}에 특화된 원칙을 추가하라.)
```

### 5.2 POLICIES.md

[EXECUTE] 프로젝트 루트에 `POLICIES.md`를 생성하라. 이 파일은 에이전트와 인간 모두가 읽는 정책 문서다.

[TEMPLATE: POLICIES.md]

```markdown
---
owner: "@repo-owner"
status: active
last_reviewed: {{TODAY_DATE}}
---

# Policies — {{PROJECT_NAME}}

> 에이전트는 이 정책을 최우선으로 준수한다. 정책과 다른 지침이 충돌하면, 이 정책이 우선한다.

## Hard Prohibitions (절대 금지 — 승인 있어도 불가)

- 시크릿/토큰/개인정보를 파일/로그/커밋에 저장
- 레포 바깥 경로(`/`, `~`, 상위 디렉토리) 대량 삭제/변경
- `rm -rf /` 류 파괴적 명령
- `curl ... | sh` 류 원격 스크립트 실행
- `sudo` 명령 실행
- `.env` 파일 직접 생성 (`.env.example` 템플릿만 가능)

## Approvals Required (승인 필요 — 실행 전 사용자 확인)

| 작업 | 예시 | 이유 |
|------|------|------|
| 네트워크 접근 | 패키지 설치, 외부 다운로드 | 공급망/재현성/보안 |
| 시스템 패키지 설치 | apt/brew 설치 | 환경 오염/권한 |
| 의존성 추가 (특히 prod) | `dependencies` 추가 | 공급망 위험 |
| 대량 수정 | 20개 파일 이상 자동 변경 | 리뷰 불가/드리프트 |
| CI 워크플로 변경 | `.github/workflows/*` | 배포/보안 영향 |
| 릴리즈/배포 | 태그/배포 명령 | 고위험 |
| 아키텍처 불변량 변경 | `.claude/invariants/*` 수정 | 구조적 영향 |
| 데이터베이스 스키마 변경 | 마이그레이션 파일 | 데이터 무결성 |

## Allowed by Default (기본 허용)

- 레포 읽기/검색
- 로컬 테스트/린트/포맷 실행 (`./tools/*`)
- 문서/스캐폴딩 생성 (안전 범위)
- `src/`, `tests/`, `docs/`, `specs/`, `evals/` 내 파일 생성/수정
- `.claude/` 내 설정/메모리 업데이트
- PR 템플릿에 맞는 변경 요약 작성

## Secrets Handling

- `.env.example` 템플릿만 생성 가능 (실제 값은 placeholder)
- 실제 `.env` 생성은 사용자에게 요청
- 로그에 환경변수 값 출력 금지
- 하드코딩된 시크릿 감지 시 즉시 경고

## Escalation (승인 불가능 환경에서의 대응)

승인 요청이 불가능한 환경이라면:
1. 안전한 범위에서만 파일 생성/수정
2. 승인 필요한 명령은 "제안"으로 남김
3. 사람이 실행할 커맨드를 문서/PR 설명에 제공
```

### 5.3 PROTOCOL.md

[EXECUTE] 프로젝트 루트에 `PROTOCOL.md`를 생성하라. 이 파일은 부트스트랩 이후에도 에이전트가 모든 작업에서 참조하는 범용 작업 프로토콜이다.

[TEMPLATE: PROTOCOL.md]

```markdown
---
owner: "@repo-owner"
status: active
last_reviewed: {{TODAY_DATE}}
---

# Protocol — {{PROJECT_NAME}} (Phase Gate)

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
- 불변량 준수 (`.claude/invariants/`)
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
```

### 5.4 PR_POLICY.md

[EXECUTE] 프로젝트 루트에 `PR_POLICY.md`를 생성하라.

[TEMPLATE: PR_POLICY.md]

```markdown
---
owner: "@repo-owner"
status: active
last_reviewed: {{TODAY_DATE}}
---

# PR Policy — {{PROJECT_NAME}}

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
- 골든 principles를 `.claude/invariants/`에 인코딩
- YOLO-style 데이터 탐색 금지
- 공유 유틸리티 패키지 선호 (헬퍼 중복 방지)
- 기술 부채는 작은 증분으로 지속 상환
```

### 5.5 .github/pull_request_template.md

[EXECUTE] CI_PLATFORM이 "GitHub Actions"인 경우 `.github/pull_request_template.md`를 생성하라.

[TEMPLATE: .github/pull_request_template.md]

```markdown
## What
-

## Why
-

## How
-

## Related Spec
- specs/features/...

## Commands Run
- [ ] `./tools/doctor` — result:
- [ ] `./tools/ci` — result:

## Changes
| File | Type | Description |
|------|------|-------------|
| | add/modify/delete | |

## Risks / Rollback
-

## Approvals Needed
- [ ] Network access
- [ ] Dependency addition
- [ ] CI workflow change
- [ ] System packages
- [ ] DB migration
- [ ] None
```



## 6. 파일 생성: specs/environment.spec.md (기계 판독 가능 환경 스펙)

[EXECUTE] `specs/environment.spec.md`를 생성하라. 이 파일은 환경의 **1차 진실 소스(Source of Truth)**이다. 이 스펙과 실제 파일 상태가 어긋나면, 스펙이 우선이다.

[TEMPLATE: specs/environment.spec.md]

```markdown
---
owner: "@repo-owner"
status: active
last_reviewed: {{TODAY_DATE}}
---

# Environment Spec — {{PROJECT_NAME}}

> 이 파일은 에이전트 환경의 기계 판독 가능한 스펙이다.
> 에이전트는 이 YAML을 "요구사항"으로 읽고, 레포를 이 상태로 만든다.
> **이 스펙과 실제 파일 상태가 어긋나면, 스펙이 우선이다.**

## Machine-Readable Spec

```yaml
agent_env_spec_version: "0.3"
project: "{{PROJECT_NAME}}"

# === 지원 환경 ===
runtime:
  language: "{{PRIMARY_LANGUAGE}}"
  framework: "{{FRAMEWORK}}"
  package_manager: "{{PACKAGE_MANAGER}}"
  test_framework: "{{TEST_FRAMEWORK}}"
  lint_tool: "{{LINT_TOOL}}"

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
    role: "코드 포맷팅"
  lint:
    role: "코드 린트"
  test:
    role: "테스트 실행"

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
```

---

## 7. 파일 생성: tools/ (표준 엔트리포인트)

[EXECUTE] `tools/` 디렉토리에 6개의 스크립트를 생성하라. **명령 이름과 계약은 스택에 무관하게 고정**이다. 내부 구현만 스택에 맞게 달라진다.

[RULE] 모든 `./tools/*`는 실행 권한이 있어야 한다 (`chmod +x`).
[RULE] 레포에 이미 테스트/린트 명령이 존재한다면, `./tools/*`는 그것을 래핑(wrapper)해야 한다. 교체하지 않는다.
[RULE] 출력은 간결하되, 실패 시 다음 액션을 정확히 안내한다.
[RULE] 가능한 경우 "무엇을 실행했는지" 로그를 출력한다.

### 7.1 tools/doctor (필수)

역할: 필수 파일 존재 여부 + 툴체인 설치 여부 + 설정 정합성 점검.
실패 시 "무엇이 빠졌고 어떻게 해결하는지"를 안내해야 한다.

[TEMPLATE: tools/doctor]

```sh
#!/usr/bin/env sh
set -eu

echo "=== [doctor] Environment Health Check ==="
echo ""

errors=0
warnings=0

# --- 1) Required governance files ---
echo "[doctor] Checking governance files..."
for f in AGENTS.md ARCHITECTURE.md CONSTITUTION.md POLICIES.md PROTOCOL.md PR_POLICY.md; do
  if [ ! -e "$f" ]; then
    echo "  ✗ MISSING: $f"
    errors=$((errors + 1))
  else
    echo "  ✓ $f"
  fi
done

# --- 2) Required spec/doc files ---
echo ""
echo "[doctor] Checking specs and docs..."
for f in specs/environment.spec.md specs/constitution.md evals/README.md evals/eval-config.yaml docs/_meta/doc-conventions.md docs/plans/README.md; do
  if [ ! -e "$f" ]; then
    echo "  ✗ MISSING: $f"
    errors=$((errors + 1))
  else
    echo "  ✓ $f"
  fi
done

# --- 3) Required tools ---
echo ""
echo "[doctor] Checking standard entrypoints..."
for f in tools/bootstrap tools/doctor tools/fmt tools/lint tools/test tools/ci; do
  if [ ! -x "$f" ]; then
    echo "  ✗ MISSING or not executable: $f"
    echo "    → Fix: create the file and run: chmod +x $f"
    errors=$((errors + 1))
  else
    echo "  ✓ $f"
  fi
done

# --- 4) Agent config ---
echo ""
echo "[doctor] Checking agent config..."
for f in .claude/config.yaml .claude/invariants/architecture.yaml .claude/invariants/naming.yaml .claude/invariants/quality.yaml; do
  if [ ! -e "$f" ]; then
    echo "  ✗ MISSING: $f"
    errors=$((errors + 1))
  else
    echo "  ✓ $f"
  fi
done

# --- 5) Stack detection ---
echo ""
echo "[doctor] Stack detection..."
if [ -f package.json ]; then
  echo "  ✓ Detected: Node.js (package.json)"
  if [ -f pnpm-lock.yaml ]; then echo "    Package manager: pnpm"; fi
  if [ -f yarn.lock ]; then echo "    Package manager: yarn"; fi
  if [ -f package-lock.json ]; then echo "    Package manager: npm"; fi
fi
if [ -f pyproject.toml ] || [ -f requirements.txt ]; then
  echo "  ✓ Detected: Python"
fi
if [ -f go.mod ]; then
  echo "  ✓ Detected: Go"
fi
if [ -f Cargo.toml ]; then
  echo "  ✓ Detected: Rust"
fi

# --- Summary ---
echo ""
echo "=== [doctor] Summary ==="
echo "  Errors:   $errors"
echo "  Warnings: $warnings"

if [ "$errors" -ne 0 ]; then
  echo ""
  echo "[doctor] FAIL: $errors issue(s) found. Fix the items marked ✗ above."
  exit 2
fi

echo ""
echo "[doctor] OK — all checks passed."
```

### 7.2 tools/ci (필수)

역할: `fmt → lint → test → build(if present)` 순서 보장.

[TEMPLATE: tools/ci]

```sh
#!/usr/bin/env sh
set -eu

echo "=== [ci] Running full verification pipeline ==="
echo ""

echo "[ci] Step 1/4: fmt..."
./tools/fmt
echo ""

echo "[ci] Step 2/4: lint..."
./tools/lint
echo ""

echo "[ci] Step 3/4: test..."
./tools/test
echo ""

if [ -x ./tools/build ]; then
  echo "[ci] Step 4/4: build..."
  ./tools/build
  echo ""
else
  echo "[ci] Step 4/4: build... (skipped: ./tools/build not present)"
  echo ""
fi

echo "=== [ci] OK — all checks passed ==="
```

### 7.3 tools/bootstrap (필수)

역할: 의존성 설치/초기 구성. 네트워크가 필요하므로 승인 필요.

[TEMPLATE: tools/bootstrap]

```sh
#!/usr/bin/env sh
set -eu

echo "=== [bootstrap] Project Setup ==="
echo ""
echo "[bootstrap] NOTE: This script may require network access."
echo "[bootstrap] If running in restricted mode, commands will be shown as suggestions."
echo ""

# (에이전트: 감지된 스택에 맞게 아래를 구현하라)
# Node example:
# if [ -f pnpm-lock.yaml ]; then
#   echo "[bootstrap] Running: pnpm install"
#   pnpm install
# elif [ -f yarn.lock ]; then
#   echo "[bootstrap] Running: yarn install"
#   yarn install
# elif [ -f package-lock.json ]; then
#   echo "[bootstrap] Running: npm ci"
#   npm ci
# fi

# Python example:
# if [ -f pyproject.toml ]; then
#   echo "[bootstrap] Running: uv sync (or pip install -e .)"
# fi

echo "[bootstrap] Suggestion: Review and run the appropriate install command for your stack."
echo "[bootstrap] Done (safe mode)."
```

### 7.4 tools/fmt, tools/lint, tools/test (필수)

[EXECUTE] 에이전트는 감지된 스택에 맞게 `tools/fmt`, `tools/lint`, `tools/test`를 구현하라.

**구현 규칙**:
- 레포에 이미 `package.json scripts`가 있으면 그것을 호출한다. 예: `npm run lint`
- Python 프로젝트에 `ruff` 설정이 있으면 `ruff format` / `ruff check`
- Go 프로젝트면 `gofmt` / `go vet` / `go test ./...`
- 아무것도 없으면 최소 도구를 추가하되, 도구 선택은 **최소 + 널리 쓰이는 것** 우선
- 명령이 없으면 명확히 메시지를 출력하고 0으로 종료 (다른 tools/* 흐름을 블로킹하지 않음)

[TEMPLATE: tools/fmt (기본 스켈레톤)]

```sh
#!/usr/bin/env sh
set -eu

echo "[fmt] Running formatter..."

# (에이전트: 감지된 스택에 맞게 구현)
# Node:   npx prettier --write .
# Python: ruff format .
# Go:     gofmt -w .
# Rust:   cargo fmt

echo "[fmt] No formatter configured yet. Skipping."
echo "[fmt] → To configure: add formatter command to this script."
```

[TEMPLATE: tools/lint (기본 스켈레톤)]

```sh
#!/usr/bin/env sh
set -eu

echo "[lint] Running linter..."

# (에이전트: 감지된 스택에 맞게 구현)
# Node:   npx eslint .
# Python: ruff check .
# Go:     go vet ./...
# Rust:   cargo clippy

echo "[lint] No linter configured yet. Skipping."
echo "[lint] → To configure: add linter command to this script."
```

[TEMPLATE: tools/test (기본 스켈레톤)]

```sh
#!/usr/bin/env sh
set -eu

echo "[test] Running tests..."

# (에이전트: 감지된 스택에 맞게 구현)
# Node:   npx vitest run / npx jest
# Python: pytest
# Go:     go test ./...
# Rust:   cargo test

echo "[test] No test runner configured yet. Skipping."
echo "[test] → To configure: add test command to this script."
```

[RULE] 모든 tools/* 생성 후 `chmod +x tools/*`를 실행하라.

---

## 8. 파일 생성: docs/ (문서 규약 + 계획 운영)

### 8.1 docs/_meta/doc-conventions.md

[EXECUTE] `docs/_meta/doc-conventions.md`를 생성하라. 이 파일은 프로젝트의 모든 운영 문서에 적용되는 메타데이터 표준이다.

[TEMPLATE: docs/_meta/doc-conventions.md]

```markdown
---
owner: "@repo-owner"
status: active
last_reviewed: {{TODAY_DATE}}
---

# Document Conventions

## Front-matter (필수)
모든 운영 문서(governance, specs, plans, domain guides)에는 아래 YAML front-matter를 포함한다:

```yaml
---
owner: "@username"            # 문서 소유자
status: draft | active | deprecated   # 문서 상태
last_reviewed: YYYY-MM-DD    # 마지막 검토일
---
```

## Status Lifecycle
```
draft → active → deprecated
```
- **draft**: 작성 중, 아직 공식 문서가 아님
- **active**: 현재 유효한 공식 문서
- **deprecated**: 더 이상 유효하지 않음 (참조용으로만 유지)

## Progressive Disclosure 원칙
- AGENTS.md에는 링크/요약만 포함
- 상세 규칙은 해당 문서(POLICIES.md, PROTOCOL.md 등)로 분산
- 도메인별 지식은 docs/domain-guides/로 분산

## Naming
- 파일명: kebab-case (예: `doc-conventions.md`)
- 계획 문서: `NNN-title.md` (예: `000-bootstrap.md`, `001-auth-feature.md`)
- ADR: `ADR-NNN-title.md` (예: `ADR-001-choose-database.md`)

## Rot Prevention
- `last_reviewed`가 90일 이상 지난 문서는 검토 대상
- 코드와 불일치하는 문서 발견 시 즉시 업데이트 또는 deprecated 처리
```

### 8.2 docs/plans/README.md + active/000-bootstrap.md

[TEMPLATE: docs/plans/README.md]

```markdown
# Plans

## Directory Structure
- `active/`: 진행 중인 계획
- `done/`: 완료된 계획 (아카이브)
- `debt/`: 기술부채/나중에 처리

## Plan Template (minimal)
모든 계획 문서는 아래를 포함한다:
- Goal / Non-goals
- Steps
- Definition of Done
- Risks / Rollback
- Status Log (append-only)
```

[TEMPLATE: docs/plans/active/000-bootstrap.md]

```markdown
---
owner: "@agent"
status: active
last_reviewed: {{TODAY_DATE}}
---

# Plan: Bootstrap Agent-Ready Environment

## Goal
표준 엔트리포인트(`./tools/*`)와 핵심 문서/스펙/거버넌스 체계를 구성한다.

## Non-goals
- 제품 기능 개발은 포함하지 않는다.
- 기존 코드를 수정하지 않는다.

## Steps
1. Inventory (스택 감지, 기존 구조 파악)
2. Spec 확정 (specs/environment.spec.md)
3. 문서/거버넌스 파일 생성
4. tools/ 엔트리포인트 생성
5. 불변량/에이전트 설정 생성
6. Verify (`./tools/doctor`, `./tools/ci`)

## Definition of Done
- specs/environment.spec.md의 `required_paths`에 나열된 모든 파일 존재
- `./tools/doctor` 통과
- `./tools/ci` 통과 (또는 스택 미결정으로 인한 예외 기록)

## Risks / Rollback
- 변경은 새 파일 생성이므로, 삭제로 롤백 가능
- 기존 파일은 수정하지 않음

## Status Log
- {{TODAY_DATE}}: Bootstrap 시작
```

---

## 9. 파일 생성: .claude/invariants/

[EXECUTE] `.claude/invariants/` 디렉토리에 3개의 불변량 정의 파일을 생성하라.

### 9.1 architecture.yaml

[TEMPLATE: .claude/invariants/architecture.yaml]

```yaml
# Architecture Invariants — {{PROJECT_NAME}}
# 이 파일의 규칙은 기계적으로 강제된다.
# 모든 에러 메시지는 교정 지침을 포함해야 한다.

invariants:

  - id: "arch-001"
    name: "의존성 방향 강제"
    rule: |
      의존성은 다음 방향으로만 허용된다:
      Types/Models → Config → Repository/Data → Service/Logic → Runtime/Handler → UI/API Surface
      역방향 의존성은 금지된다.
    enforcement: "lint"
    severity: "error"
    error_message: |
      [ARCH-001] 역방향 의존성 감지: {{source_layer}} → {{target_layer}}
      교정: 의존성을 역전하려면 인터페이스/프로토콜을 사용하세요.
      참조: ARCHITECTURE.md의 "레이어 구조" 섹션

  - id: "arch-002"
    name: "교차 관심사는 Providers를 통해 진입"
    rule: |
      인증, 로깅, 텔레메트리, 기능 플래그 등 교차 관심사는
      Providers 인터페이스를 통해서만 비즈니스 로직에 진입한다.
    enforcement: "lint"
    severity: "error"
    error_message: |
      [ARCH-002] 교차 관심사의 직접 import 감지
      교정: Providers 인터페이스를 통해 주입하세요.
      참조: ARCHITECTURE.md의 "교차 관심사" 섹션

  - id: "arch-003"
    name: "경계에서 데이터 파싱"
    rule: |
      외부에서 들어오는 모든 데이터는 모듈 경계에서 스키마 검증/파싱한다.
      검증되지 않은 외부 데이터를 내부 로직에 전달하지 않는다.
    enforcement: "review"
    severity: "warning"
    error_message: |
      [ARCH-003] 외부 데이터가 검증 없이 내부로 전달됨
      교정: 모듈 진입점에서 스키마 검증을 추가하세요.
      참조: CONSTITUTION.md "T2. 데이터 형상은 경계에서 파싱하라"

  - id: "arch-004"
    name: "파일 크기 제한"
    rule: |
      단일 소스 파일은 300줄을 초과하지 않는다. 초과 시 모듈 분리.
    enforcement: "lint"
    severity: "warning"
    error_message: |
      [ARCH-004] 파일이 300줄을 초과합니다 (현재: {{line_count}}줄)
      교정: 책임을 분리하여 여러 모듈로 나누세요.
```

### 9.2 naming.yaml

[TEMPLATE: .claude/invariants/naming.yaml]

```yaml
# Naming Invariants — {{PROJECT_NAME}}

invariants:

  - id: "name-001"
    name: "파일 네이밍 규칙"
    rule: |
      - 소스 파일: kebab-case (예: user-service.ts)
      - 테스트 파일: 소스파일명.test.확장자 또는 test_소스파일명.확장자
      - 컴포넌트 파일 (React 등): PascalCase (예: UserProfile.tsx)
    enforcement: "lint"
    severity: "warning"
    error_message: |
      [NAME-001] 파일명이 네이밍 규칙을 위반합니다: {{filename}}
      교정: kebab-case(일반 파일) 또는 PascalCase(컴포넌트)를 사용하세요.

  - id: "name-002"
    name: "타입/인터페이스 네이밍"
    rule: |
      - 타입/인터페이스: PascalCase
      - I 접두사 사용하지 않음 (IUser ✗ → User ✓)
      - 열거형: PascalCase, 멤버는 UPPER_SNAKE_CASE
    enforcement: "lint"
    severity: "warning"
    error_message: |
      [NAME-002] 타입/인터페이스 네이밍 규칙 위반: {{identifier}}
      교정: PascalCase를 사용하고, I 접두사를 제거하세요.

  - id: "name-003"
    name: "함수/변수 네이밍"
    rule: |
      - 함수/메서드: camelCase (JS/TS) 또는 snake_case (Python/Go)
      - 상수: UPPER_SNAKE_CASE
      - 불리언: is_, has_, can_, should_ 접두사 권장
    enforcement: "lint"
    severity: "info"
    error_message: |
      [NAME-003] 함수/변수 네이밍 관례 불일치: {{identifier}}
      교정: {{PRIMARY_LANGUAGE}} 관례를 따르세요.
```

### 9.3 quality.yaml

[TEMPLATE: .claude/invariants/quality.yaml]

```yaml
# Quality Invariants — {{PROJECT_NAME}}

invariants:

  - id: "qual-001"
    name: "테스트 커버리지 요구사항"
    rule: |
      - 새 비즈니스 로직(Service 레이어)은 테스트를 동반
      - 유틸리티 함수는 반드시 단위 테스트 보유
    enforcement: "review"
    severity: "error"
    error_message: |
      [QUAL-001] 새 비즈니스 로직에 테스트가 없습니다
      교정: 해당 모듈의 테스트 파일을 생성하고 핵심 경로를 테스트하세요.

  - id: "qual-002"
    name: "구조화된 로깅"
    rule: |
      console.log, print(), fmt.Println() 같은 비구조화 로깅 금지.
      프로젝트의 구조화된 로거를 사용하라.
    enforcement: "lint"
    severity: "warning"
    error_message: |
      [QUAL-002] 비구조화 로깅 감지: {{statement}}
      교정: 프로젝트의 구조화된 로거를 사용하세요.

  - id: "qual-003"
    name: "에러 처리"
    rule: |
      - 빈 catch 블록 금지
      - 에러는 삼키지 않고, 로깅하거나 상위로 전파
    enforcement: "lint"
    severity: "error"
    error_message: |
      [QUAL-003] 빈 catch 블록 또는 에러 삼키기 감지
      교정: 에러를 로깅하거나 상위로 전파하세요.

  - id: "qual-004"
    name: "TODO/FIXME 관리"
    rule: |
      - TODO 주석은 관련 이슈 번호 포함 (예: // TODO(#123): ...)
      - HACK 주석은 이유와 해결 시점 포함
    enforcement: "review"
    severity: "info"
    error_message: |
      [QUAL-004] TODO/FIXME에 이슈 번호가 없습니다: {{comment}}
      교정: 관련 이슈를 생성하고 번호를 추가하세요.
```

---

## 10. 파일 생성: .claude/team/ (에이전트 팀 페르소나)

[EXECUTE] `.claude/team/` 디렉토리에 4개의 에이전트 페르소나 파일을 생성하라.

### 10.1 planner.md

[TEMPLATE: .claude/team/planner.md]

```markdown
# Agent Role: Planner

## Mission
기능 요청이나 버그 리포트를 수신하여, 구현 가능한 스펙과 실행 계획으로 변환한다.

## When Activated
- 새로운 기능 요청, 대규모 리팩토링, 아키텍처 변경 시

## Inputs
- 사용자의 요청
- ARCHITECTURE.md, 관련 도메인 가이드, 기존 스펙

## Outputs
1. 스펙 문서: `specs/features/{{feature-name}}.spec.md`
2. 태스크 목록 (각 태스크 = 하나의 커밋 단위)
3. ADR (아키텍처 변경 시): `specs/decisions/ADR-{{NNN}}-{{title}}.md`

## Process
PROTOCOL.md의 Phase 0 → Phase 1 → Phase 2를 수행한다.

## Constraints
- 스펙 없이 구현 시작 금지
- 아키텍처 불변량 위반 계획 금지
- 불확실한 요구사항은 가정하지 말고 사용자에게 질문

## Escalation
- 요구사항이 기존 아키텍처와 근본적으로 충돌할 때
- 보안/프라이버시 관련 결정이 필요할 때
```

### 10.2 implementer.md

[TEMPLATE: .claude/team/implementer.md]

```markdown
# Agent Role: Implementer

## Mission
승인된 스펙과 태스크를 기반으로 코드를 작성하고, 테스트를 추가하며, 불변량을 준수한다.

## When Activated
- Planner가 스펙을 작성하고 태스크를 분해한 후
- 단순한 버그 수정 (스펙 없이 진행 가능한 경우)

## Inputs
- 스펙, ARCHITECTURE.md, .claude/invariants/*.yaml, POLICIES.md

## Outputs
1. 소스 코드, 테스트 코드, 문서 업데이트

## Process — LOOP UNTIL CLEAN
```
태스크 선택 → 코드 작성 → 테스트 작성 → 검증 루프:
  a. ./tools/test → 실패 시 수정 → (a)
  b. ./tools/lint → 실패 시 교정 지침 따름 → (b)
  c. ./tools/fmt  → 적용
  d. 모두 통과 → 다음 태스크
전체 완료 → ./tools/ci 실행 → PR 생성 준비
```

## Constraints
- 스펙에 명시되지 않은 기능 임의 추가 금지
- 불변량 위반 시 즉시 수정 (에러 메시지의 교정 지침 참조)
- 파일 300줄 초과 시 모듈 분리
- POLICIES.md 권한 준수
- 검증 루프 3회 반복 후 실패 시 에스컬레이션

## Escalation
- 검증 루프 3회 이상 실패, 스펙 모호성 발견, 불변량과 스펙 충돌
```

### 10.3 reviewer.md

[TEMPLATE: .claude/team/reviewer.md]

```markdown
# Agent Role: Reviewer

## Mission
코드 변경을 검토하여 불변량 준수, 스펙 충족, 코드 품질을 확인한다.

## When Activated
- Implementer의 코드 변경 완료 후, PR 생성 전 자체 리뷰 단계

## Review Checklist

### 스펙 준수
- [ ] 스펙의 모든 수용 기준이 구현되었는가?
- [ ] 스펙에 없는 불필요한 변경이 없는가?

### 아키텍처 불변량
- [ ] 의존성 방향 올바른가? (ARCH-001)
- [ ] 교차 관심사가 Providers 경유인가? (ARCH-002)
- [ ] 데이터가 경계에서 파싱되는가? (ARCH-003)
- [ ] 파일 크기 제한 준수? (ARCH-004)

### 품질
- [ ] 새 로직에 테스트 동반? (QUAL-001)
- [ ] 구조화된 로깅 사용? (QUAL-002)
- [ ] 에러 적절히 처리? (QUAL-003)

### 보안
- [ ] 하드코딩된 시크릿 없는가?
- [ ] 사용자 입력이 적절히 검증/이스케이프되는가?

## Outputs
- 리뷰 결과: 승인 / 변경 요청 / 에스컬레이션
- 피드백 목록: 위치, 문제, 교정 제안

## Escalation
- 보안 취약점 발견, 중대한 아키텍처 결정 필요
```

### 10.4 tester.md

[TEMPLATE: .claude/team/tester.md]

```markdown
# Agent Role: Tester

## Mission
코드 변경에 대한 테스트를 설계/실행하고, eval 케이스를 관리한다.

## When Activated
- 코드 변경 시 (테스트 작성), 새 기능 스펙 시 (eval 설계), 정기 회귀 테스트 시

## EDD (Eval-Driven Development) Process
1. 스펙에서 핵심 시나리오 추출
2. 각 시나리오를 eval 케이스로 작성 (evals/golden/)
3. 실패/버그 발생 시 → evals/regression/에 추가
4. CI에서 eval 세트 자동 실행

## Test-Driven Agentic Workflow
1. 실패하는 테스트를 먼저 작성
2. Implementer에게 "이 테스트를 통과시켜라"로 지시
3. 테스트 통과 확인 → 리팩토링 → 재검증

## Escalation
- 테스트 환경 설정 문제, 외부 서비스 의존으로 테스트 불가능
```

---

## 11. 파일 생성: evals/ (EDD 구조)

### 11.1 evals/README.md

[TEMPLATE: evals/README.md]

```markdown
# Evals — {{PROJECT_NAME}}

이 디렉토리는 **EDD(Eval-Driven Development)** 구조이다.
"실패 → eval 승격 → 회귀 방지"를 위한 체계.

## Structure
- `golden/`: 골든 테스트 케이스 (핵심 기능의 정답 세트)
- `regression/`: 회귀 방지 케이스 (수정된 버그의 재현 방지)
- `bootstrap/`: 환경 부트스트랩 검증
- `eval-config.yaml`: 평가 파이프라인 설정

## Workflow
1. 새 기능 → golden/ 에 eval 케이스 작성
2. 버그 수정 → regression/ 에 재현 케이스 등록
3. CI에서 eval 세트 자동 실행 → 회귀 감지
```

### 11.2 evals/bootstrap/fresh-clone.md

[TEMPLATE: evals/bootstrap/fresh-clone.md]

```markdown
---
type: eval_case
id: bootstrap.fresh.clone
status: active
---

# Eval: Fresh Clone Bootstrap

## Steps
1. repo clone
2. `./tools/bootstrap` (네트워크 가능 환경)
3. `./tools/doctor`
4. `./tools/ci`

## Expected
- doctor: 모든 required_paths 존재 확인, 0 반환
- ci: fmt→lint→test 순서 실행, 0 반환 (또는 스택 미설정 시 명확한 안내)

## Failure Handling
- 실패 시 원인을 기록하고 evals/regression/에 케이스 추가
```

### 11.3 evals/eval-config.yaml

[TEMPLATE: evals/eval-config.yaml]

```yaml
# Eval Configuration — {{PROJECT_NAME}}

eval_pipeline:
  runner: "{{TEST_FRAMEWORK}}"
  golden_dir: "evals/golden/"
  regression_dir: "evals/regression/"

  triggers:
    - "PR 생성 시"
    - "main 브랜치 머지 시"

failure_policy:
  golden_failure: "block_merge"
  regression_failure: "block_merge"
  new_failure_action: "create_regression_case"

promotion:
  auto_promote_fixed_bugs: true

case_format:
  required_fields: ["id", "description", "input", "expected_behavior"]
  optional_fields: ["acceptable_variations", "pass_criteria", "tags"]
```

---

## 12. 파일 생성: .claude/memory/ + .claude/config.yaml + .claude/templates/

### 12.1 .claude/memory/global.md

[TEMPLATE: .claude/memory/global.md]

```markdown
# Global Memory — {{PROJECT_NAME}}

> 프로젝트 레벨의 학습 기록. 에이전트가 발견한 비자명한 교정, 패턴, 주의사항.
> 반복되는 교정은 .claude/invariants/로 승격한다.

## 기록 형식
```
### [날짜] 제목
- **발견 맥락**: 어떤 작업 중 발견
- **교정 내용**: 잘못된 것 + 올바른 방법
- **적용 범위**: 이 교정이 적용되는 상황
- **승격 여부**: 미승격 | invariant로 승격됨 (참조: XXX)
```

## 학습 기록

(에이전트: 작업 중 발견한 비자명한 교정을 여기에 기록하라.)
```

### 12.2 .claude/memory/personal.md

[TEMPLATE: .claude/memory/personal.md]

```markdown
# Personal Memory

> 개인 개발자의 선호와 패턴. 에이전트가 스타일에 맞춰 동작하도록 돕는다.

## 코딩 스타일 선호
(에이전트: 사용자 스타일 선호를 파악하면 기록)

## 커뮤니케이션 선호
(에이전트: 사용자 응답 스타일 선호를 파악하면 기록)

## 자주 사용하는 패턴
(에이전트: 반복 코드 패턴을 파악하면 기록)
```

### 12.3 .claude/config.yaml

[TEMPLATE: .claude/config.yaml]

```yaml
# Agent Configuration — {{PROJECT_NAME}}

project:
  name: "{{PROJECT_NAME}}"
  description: "{{PROJECT_DESCRIPTION}}"
  domain: "{{PROJECT_DOMAIN}}"

tech_stack:
  language: "{{PRIMARY_LANGUAGE}}"
  framework: "{{FRAMEWORK}}"
  package_manager: "{{PACKAGE_MANAGER}}"
  test_framework: "{{TEST_FRAMEWORK}}"
  lint_tool: "{{LINT_TOOL}}"
  database: "{{DATABASE}}"

agent:
  type: "{{AGENT_TYPE}}"
  autonomy_level: "{{AUTONOMY_LEVEL}}"

workflow:
  require_spec_before_implementation: true
  require_eval_with_new_feature: true
  require_pr_template: true

verification:
  max_retry_on_failure: 3
  escalate_after_retries: true
  before_after_verification: true

entropy_management:
  gardening_frequency: "weekly"
  memory_promotion_review: "weekly"
```

### 12.4 .claude/templates/spec-template.md

[TEMPLATE: .claude/templates/spec-template.md]

```markdown
---
owner: ""
status: draft
last_reviewed: YYYY-MM-DD
---

# Feature Spec: {{FEATURE_NAME}}

## 1. 목표 (Goal)
(무엇을 달성하려 하는가? 1-3 문장)

## 2. 배경 (Background)
(왜 이것이 필요한가?)

## 3. 제약 조건 (Constraints)
- 아키텍처: (ARCHITECTURE.md 참조)
- 기술: (사용 가능/불가 기술)
- 성능: (SLA, 응답 시간)
- 보안: (인증, 권한)

## 4. 수용 기준 (Acceptance Criteria)
- [ ] 기준 1
- [ ] 기준 2

## 5. 기술 설계 (Technical Design)
### 영향받는 레이어/모듈
| 레이어 | 모듈 | 변경 유형 |
|--------|------|----------|
| | | 신규/수정/삭제 |

## 6. 실행 계획 (Execution Plan)
- [ ] Task 1 (각 태스크 = 하나의 커밋 단위)
- [ ] Task 2

## 7. 테스트 계획 (Test Plan)
- 단위 테스트: ...
- Eval 케이스: ...

## 8. 위험 요소 (Risks)
| 위험 | 영향 | 완화 방안 |
|------|------|----------|
| | | |

## 9. 결정 로그 (Decision Log)
| 날짜 | 결정 | 이유 |
|------|------|------|
| | | |
```

### 12.5 .claude/templates/adr-template.md

[TEMPLATE: .claude/templates/adr-template.md]

```markdown
---
owner: ""
status: proposed
last_reviewed: YYYY-MM-DD
---

# ADR-{{NNN}}: {{TITLE}}

## 컨텍스트 (Context)
(어떤 상황에서 이 결정이 필요한가?)

## 결정 (Decision)
(무엇을 결정했는가?)

## 근거 (Rationale)
### 고려한 대안
1. **대안 A**: — 장점: / 단점:
2. **선택한 방안**: — 장점: / 단점:

## 결과 (Consequences)
- 긍정적: ...
- 부정적: ...

## 관련 문서
- (관련 스펙, 이슈 링크)
```

### 12.6 .claude/templates/pr-template.md

[TEMPLATE: .claude/templates/pr-template.md]

```markdown
## What
(무엇을 변경했는가)

## Why
(왜 변경했는가)

## How
(어떻게 변경했는가)

## Related Spec
- specs/features/...

## Commands Run
- [ ] `./tools/doctor` — result:
- [ ] `./tools/ci` — result:

## Changes
| File | Type | Description |
|------|------|-------------|
| | add/modify/delete | |

## Risks / Rollback
-

## Approvals Needed
- [ ] None
```


## 13. CI 워크플로우 생성

[EXECUTE] `CI_PLATFORM`이 "GitHub Actions"인 경우 `.github/workflows/agent-verify.yaml`을 생성하라. 다른 CI 플랫폼이면 해당 형식으로. "None"이면 건너뛰라.

[TEMPLATE: .github/workflows/agent-verify.yaml]

```yaml
name: Agent Verification

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # (에이전트: PRIMARY_LANGUAGE에 맞는 setup action 추가)
      # - uses: actions/setup-node@v4
      # - uses: actions/setup-python@v5
      # - uses: actions/setup-go@v5

      - name: Bootstrap
        run: ./tools/bootstrap

      - name: Doctor
        run: ./tools/doctor

      - name: CI (fmt + lint + test)
        run: ./tools/ci
```

---

## 14. 파일 생성: scripts/gardening/ (문서 정원 관리)

[EXECUTE] `scripts/gardening/` 디렉토리에 2개의 스크립트를 생성하라.

### 14.1 scripts/gardening/doc-sync-check

역할: 문서와 코드/구조의 동기화 상태를 검증한다.

[TEMPLATE: scripts/gardening/doc-sync-check]

```sh
#!/usr/bin/env sh
set -eu

echo "=== [doc-sync] Document Synchronization Check ==="
echo ""

issues=0

# --- 1) AGENTS.md 링크 검증 ---
echo "[doc-sync] Checking AGENTS.md links..."
if [ -f AGENTS.md ]; then
  # Extract markdown links and check if targets exist
  grep -oP '\[.*?\]\((.*?)\)' AGENTS.md 2>/dev/null | grep -oP '\((.+?)\)' | tr -d '()' | while read -r link; do
    # Skip http links
    case "$link" in http*|https*) continue ;; esac
    if [ ! -e "$link" ]; then
      echo "  ✗ Broken link in AGENTS.md: $link"
      issues=$((issues + 1))
    fi
  done || true
fi

# --- 2) specs/environment.spec.md required_paths 검증 ---
echo ""
echo "[doc-sync] Checking required_paths from environment spec..."
if [ -f specs/environment.spec.md ]; then
  # Quick check: verify governance files exist
  for f in AGENTS.md ARCHITECTURE.md CONSTITUTION.md POLICIES.md PROTOCOL.md PR_POLICY.md; do
    if [ ! -e "$f" ]; then
      echo "  ✗ Required path missing: $f"
      issues=$((issues + 1))
    fi
  done
fi

# --- 3) Front-matter 검증 (운영 문서에 status/last_reviewed 존재 여부) ---
echo ""
echo "[doc-sync] Checking front-matter in governance docs..."
for f in CONSTITUTION.md POLICIES.md PROTOCOL.md PR_POLICY.md; do
  if [ -f "$f" ]; then
    if ! head -5 "$f" | grep -q "status:"; then
      echo "  ⚠ Missing front-matter 'status' in: $f"
    fi
    if ! head -10 "$f" | grep -q "last_reviewed:"; then
      echo "  ⚠ Missing front-matter 'last_reviewed' in: $f"
    fi
  fi
done

echo ""
echo "=== [doc-sync] Check complete ==="
```

### 14.2 scripts/gardening/memory-review

역할: Memory → Invariant 승격 후보를 식별한다.

[TEMPLATE: scripts/gardening/memory-review]

```sh
#!/usr/bin/env sh
set -eu

echo "=== [memory-review] Memory → Invariant Promotion Review ==="
echo ""

if [ ! -f .claude/memory/global.md ]; then
  echo "[memory-review] No global memory file found. Nothing to review."
  exit 0
fi

echo "[memory-review] Current global memory entries:"
echo ""

# Count entries (lines starting with ### [)
count=$(grep -c '^### \[' .claude/memory/global.md 2>/dev/null || echo "0")
echo "  Total entries: $count"

# Find entries marked as 미승격
unpromoted=$(grep -c '승격 여부: 미승격' .claude/memory/global.md 2>/dev/null || echo "0")
echo "  Unpromoted entries: $unpromoted"

if [ "$unpromoted" -gt 0 ]; then
  echo ""
  echo "[memory-review] Unpromoted entries (candidates for invariant promotion):"
  grep -B 3 '승격 여부: 미승격' .claude/memory/global.md 2>/dev/null || true
  echo ""
  echo "[memory-review] TIP: If a correction appears 2+ times, consider promoting to .claude/invariants/"
fi

echo ""
echo "=== [memory-review] Review complete ==="
```

[RULE] 모든 scripts/gardening/* 생성 후 `chmod +x scripts/gardening/*`를 실행하라.

---

## 15. 파일 생성: specs/constitution.md (헌법 상세)

[EXECUTE] `specs/constitution.md`를 생성하라. 루트의 `CONSTITUTION.md`가 요약이라면, 이 파일은 상세 버전이다.

[TEMPLATE: specs/constitution.md]

```markdown
---
owner: "@repo-owner"
status: active
last_reviewed: {{TODAY_DATE}}
---

# Project Constitution (상세) — {{PROJECT_NAME}}

> 이 문서는 CONSTITUTION.md의 상세 확장이다.
> 각 원칙의 구체적 적용 방법과 예시를 포함한다.

## P1. 스펙이 Source of Truth다

### 적용 방법
- 기능 구현 전 `specs/features/`에 스펙을 작성한다 (.claude/templates/spec-template.md 사용)
- 스펙에 명시되지 않은 동작은 버그다
- 스펙 변경 시 관련 코드도 함께 업데이트한다

### SDD (Spec-Driven Development) 워크플로우
```
요청 → 스펙 작성 → 스펙 승인 → 태스크 분해 → 구현 → 검증 → PR
```

## P2. 보이지 않으면 존재하지 않는다

### 적용 방법
- 모든 아키텍처 결정 → specs/decisions/ADR-*.md
- 모든 기능 스펙 → specs/features/*.spec.md
- 모든 코딩 컨벤션 → .claude/invariants/
- 모든 도메인 지식 → docs/domain-guides/
- 구두 합의, 채팅의 결정 → 문서로 옮겨야 유효

### 금지
- 에이전트가 접근할 수 없는 곳(머릿속, 외부 도구, 채팅 스레드)에만 존재하는 결정

## P3. 목표를 안내하되 경로를 강제하지 마라

### 강제하는 것 (불변량)
- 아키텍처 경계, 의존성 방향
- 데이터 검증 위치
- 네이밍 규칙
- 파일 크기 제한

### 자유를 주는 것 (구현 세부사항)
- 라이브러리/프레임워크 내 구체적 선택
- 알고리즘 세부사항
- 내부 모듈 구조 (불변량 범위 내에서)

## P4. 검증 없는 출력은 출력이 아니다

### LOOP UNTIL CLEAN 패턴
```
코드 변경 → ./tools/fmt → ./tools/lint → ./tools/test → ./tools/ci
     ↑                                                      │
     └──── 하나라도 실패 시 원인 분석 → 수정 ←──────────────┘
```

### Before/After 검증
- UI 변경: 변경 전/후 스크린샷 비교
- API 변경: 변경 전/후 응답 비교
- 성능 변경: 벤치마크 전/후 비교

## P5. 수정이 저렴하면 예방 비용을 줄여라

### 머지 철학
- 최소한의 블로킹 게이트 (CI 통과 = 머지 가능)
- 짧은 PR 생명주기
- 테스트 flake 시 후속 실행으로 해결

### 엔트로피 관리
- 기술 부채는 작은 증분으로 지속 상환
- 정기 문서 정원 관리
- Memory → Invariant 승격 루프

## 기술 원칙 상세

### T1. 지루한 기술이 더 낫다
판단 기준:
1. 합성 가능성 (composability)
2. API 안정성
3. 훈련 데이터에서의 표현 풍부성 (에이전트가 잘 아는 기술)

외부 라이브러리 vs 자체 구현 판단:
- 자체 구현 선호: 관측 가능성 통합 필요, 100% 테스트 커버리지 필요, 런타임 제약 특수
- 외부 라이브러리 선호: 표준화된 문제, 유지보수 부담 높음, 보안 패치 필요

### T2. 데이터 형상은 경계에서 파싱하라
- "데이터 형상은 경계에서 파싱하라" → 강제 (불변량)
- "Zod/pydantic을 사용하라" → 강제하지 않음 (구현 선택)

### T3. 린트 에러 메시지가 교정 지침이다
모든 린트/검증 규칙의 에러 메시지 형식:
```
[규칙ID] 무엇이 잘못되었는가
교정: 어떻게 고쳐야 하는가
참조: 관련 문서 링크
```

## 도메인 원칙

(에이전트: {{PROJECT_DOMAIN}}에 특화된 원칙을 추가하라.)
```

---

## 16. Bootstrap Execution Sequence — 실행 순서

[EXECUTE] 에이전트는 이 문서를 읽은 후, 아래 순서대로 환경을 구성한다. 각 Phase 완료 후 결과를 사용자에게 보고하라.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 0: Inventory (현황 파악)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ 0.1  스택 자동 감지 (섹션 0.1)
       → lockfile, config 파일 분석
       → 기존 테스트/린트/빌드 명령 파악
□ 0.2  빈 레포 여부 판단 (섹션 0.3)
       → 비어있으면 빈 레포 처리 규칙 적용
□ 0.3  변수 확정 (섹션 0.2)
       → 자동 감지 결과 + 사용자 질문으로 확정
□ 0.4  사용자에게 감지 결과 + 변수 목록 보여주고 확인 받기

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 1: Scaffold (디렉토리 구조 생성)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ 1.1  디렉토리 구조 생성 (섹션 2)
       → 기존 디렉토리와 충돌하지 않도록 주의

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 2: Governance (거버넌스 문서 생성)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ 2.1  AGENTS.md 생성 (섹션 3)
□ 2.2  ARCHITECTURE.md 생성 (섹션 4)
       → 기존 코드 있으면 분석하여 실제 구조 반영
□ 2.3  CONSTITUTION.md 생성 (섹션 5.1)
□ 2.4  POLICIES.md 생성 (섹션 5.2)
□ 2.5  PROTOCOL.md 생성 (섹션 5.3)
□ 2.6  PR_POLICY.md 생성 (섹션 5.4)
□ 2.7  .github/pull_request_template.md 생성 (섹션 5.5, 해당 시)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 3: Specification (스펙 체계 구축)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ 3.1  specs/environment.spec.md 생성 (섹션 6)
□ 3.2  specs/constitution.md 생성 (섹션 15)
□ 3.3  docs/_meta/doc-conventions.md 생성 (섹션 8.1)
□ 3.4  docs/plans/README.md 생성 (섹션 8.2)
□ 3.5  docs/plans/active/000-bootstrap.md 생성 (섹션 8.2)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 4: Tools (표준 엔트리포인트 구축)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ 4.1  tools/doctor 생성 (섹션 7.1)
□ 4.2  tools/ci 생성 (섹션 7.2)
□ 4.3  tools/bootstrap 생성 (섹션 7.3)
□ 4.4  tools/fmt, tools/lint, tools/test 생성 (섹션 7.4)
       → 감지된 스택에 맞게 실제 명령 래핑
□ 4.5  chmod +x tools/*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 5: Agent Config (에이전트 설정 구축)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ 5.1  .claude/config.yaml 생성 (섹션 12.3)
□ 5.2  .claude/invariants/architecture.yaml 생성 (섹션 9.1)
□ 5.3  .claude/invariants/naming.yaml 생성 (섹션 9.2)
       → PRIMARY_LANGUAGE에 맞게 규칙 조정
□ 5.4  .claude/invariants/quality.yaml 생성 (섹션 9.3)
□ 5.5  .claude/team/planner.md 생성 (섹션 10.1)
□ 5.6  .claude/team/implementer.md 생성 (섹션 10.2)
□ 5.7  .claude/team/reviewer.md 생성 (섹션 10.3)
□ 5.8  .claude/team/tester.md 생성 (섹션 10.4)
□ 5.9  .claude/templates/spec-template.md 생성 (섹션 12.4)
□ 5.10 .claude/templates/adr-template.md 생성 (섹션 12.5)
□ 5.11 .claude/templates/pr-template.md 생성 (섹션 12.6)
□ 5.12 .claude/memory/global.md 생성 (섹션 12.1)
□ 5.13 .claude/memory/personal.md 생성 (섹션 12.2)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 6: Evaluation (평가 체계 구축)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ 6.1  evals/README.md 생성 (섹션 11.1)
□ 6.2  evals/bootstrap/fresh-clone.md 생성 (섹션 11.2)
□ 6.3  evals/eval-config.yaml 생성 (섹션 11.3)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 7: Automation (자동화 스크립트 구축)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ 7.1  scripts/gardening/doc-sync-check 생성 (섹션 14.1)
□ 7.2  scripts/gardening/memory-review 생성 (섹션 14.2)
□ 7.3  chmod +x scripts/gardening/*
□ 7.4  CI 워크플로우 생성 (섹션 13, 해당 시)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 8: Verify (LOOP UNTIL CLEAN)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ 8.1  ./tools/doctor 실행
       → 실패 시: 원인 수정 → 재실행 (LOOP)
□ 8.2  ./tools/ci 실행
       → 실패 시: 원인 수정 → 재실행 (LOOP)
       → 스택 미설정으로 fmt/lint/test가 skip된 경우: 정상 (기록)
□ 8.3  scripts/gardening/doc-sync-check 실행
       → AGENTS.md 링크 유효성 확인
□ 8.4  docs/plans/active/000-bootstrap.md에 실행 로그 기록

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 9: Report (완료 보고)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
에이전트는 아래 형식으로 최종 보고한다:

  ✅ 생성/수정한 파일 목록
  ✅ 스택 감지 결과 (예: Node+TS, Python 등)
  ✅ 실행한 명령과 결과
     - ./tools/doctor 결과 (요약)
     - ./tools/ci 결과 (요약)
  ⚠️ 승인 필요로 인해 실행하지 않은 작업 목록
     (예: "pnpm install — 네트워크 접근 필요")
  🔁 다음 단계 제안:
     - "첫 번째 기능 스펙을 작성하시겠습니까?"
     - "기존 코드에 대한 eval 케이스를 생성하시겠습니까?"
     - "ARCHITECTURE.md를 더 상세하게 채우시겠습니까?"
     - "./tools/bootstrap를 실행하여 의존성을 설치하시겠습니까?"
```

---

## 17. Self-Evolution Rules — 자기 진화 규칙

이 환경은 정적이지 않다. 아래 규칙에 따라 지속적으로 진화한다.

### 17.1 Memory → Invariant 승격 루프

```
.claude/memory/global.md에서 동일 교정이 2회 이상 발생
    → .claude/invariants/에 새 규칙으로 승격
    → 해당 규칙의 에러 메시지에 교정 지침 포함
    → global.md에서 해당 항목을 "승격됨"으로 마크
```

### 17.2 문서 정원 관리

```
주기적으로 (config.yaml의 gardening_frequency에 따라):
    → scripts/gardening/doc-sync-check 실행
    → 불일치 발견 시 수정
    → scripts/gardening/memory-review 실행
    → 승격 후보 발견 시 승격 PR 생성
```

### 17.3 문서 Rot 방지

```
docs/_meta/doc-conventions.md의 규칙에 따라:
    → last_reviewed가 90일 이상 지난 문서 식별
    → 검토 후 업데이트 또는 deprecated 처리
```

### 17.4 스펙 라이프사이클

```
specs/features/의 각 스펙:
    draft → approved → in-progress → completed → deprecated
    - completed 후 30일 → deprecated 이동 제안
    - deprecated 스펙은 참조용으로만 유지
```

### 17.5 BOOTSTRAP.md 자체의 진화

```
이 문서(BOOTSTRAP.md) 자체도 버전 관리 대상이다.
환경 운영 중 발견된 개선 사항:
    → ADR로 기록 (specs/decisions/)
    → BOOTSTRAP.md 업데이트
    → 변경 이유와 영향을 커밋 메시지에 기록
```

---

## 18. Quick Reference — 빠른 참조

### 표준 명령어 (스택 무관 고정)

```bash
./tools/bootstrap    # 의존성 설치/초기 구성 (승인 필요)
./tools/doctor       # 환경 건강 체크
./tools/fmt          # 포맷팅
./tools/lint         # 린트
./tools/test         # 테스트
./tools/ci           # fmt → lint → test → build 순서 보장
```

### 파일 위치 가이드

| 찾고자 하는 것 | 위치 |
|---------------|------|
| 에이전트 진입점 | `AGENTS.md` |
| 아키텍처 맵 | `ARCHITECTURE.md` |
| 프로젝트 헌법 (요약) | `CONSTITUTION.md` |
| 프로젝트 헌법 (상세) | `specs/constitution.md` |
| 승인/보안 정책 | `POLICIES.md` |
| 작업 프로토콜 (Phase Gate) | `PROTOCOL.md` |
| PR 정책 | `PR_POLICY.md` |
| 환경 스펙 (기계 판독) | `specs/environment.spec.md` |
| 기능 스펙 | `specs/features/` |
| 설계 결정 기록 | `specs/decisions/` |
| 문서 메타데이터 표준 | `docs/_meta/doc-conventions.md` |
| 실행 계획 | `docs/plans/active/` |
| 아키텍처 불변량 | `.claude/invariants/architecture.yaml` |
| 네이밍 규칙 | `.claude/invariants/naming.yaml` |
| 품질 게이트 | `.claude/invariants/quality.yaml` |
| 에이전트 설정 | `.claude/config.yaml` |
| 에이전트 역할 | `.claude/team/` |
| 스펙 템플릿 | `.claude/templates/spec-template.md` |
| ADR 템플릿 | `.claude/templates/adr-template.md` |
| PR 템플릿 | `.claude/templates/pr-template.md` |
| 골든 테스트 | `evals/golden/` |
| 회귀 테스트 | `evals/regression/` |
| 프로젝트 학습 기록 | `.claude/memory/global.md` |
| 개인 학습 기록 | `.claude/memory/personal.md` |
| 문서 동기화 검증 | `scripts/gardening/doc-sync-check` |
| 메모리 승격 검토 | `scripts/gardening/memory-review` |

### 워크플로우 요약

```
새 기능:   요청 → 스펙 작성 → 승인 → 태스크 분해 → 구현(LOOP) → 리뷰 → PR → 머지
버그 수정:  재현 → 실패 테스트 → 수정(LOOP) → 회귀 케이스 등록 → PR → 머지
리팩토링:  ADR → 기준선 확인 → 리팩토링 → 전체 테스트 → 리뷰 → PR → 머지
정원 관리:  스캔 → 불일치 수정 → 메모리 승격 → PR → 머지
```

### 최종 체크리스트 (에이전트가 보고서 작성 전에 확인)

```
□ specs/environment.spec.md가 현재 레포 스택/명령을 정확히 반영
□ AGENTS.md가 짧고(~100줄), 표준 명령과 링크가 정확
□ POLICIES.md에 승인/금지 규칙이 명확
□ PROTOCOL.md가 Phase Gate를 정의
□ PR_POLICY.md + PR 템플릿 존재
□ ./tools/doctor 존재하고, 실패 시 다음 조치를 안내
□ ./tools/ci가 fmt→lint→test 순서를 보장
□ docs/plans/active/000-bootstrap.md에 실행 로그 기록
□ evals/ skeleton 존재 (README + bootstrap eval)
□ .claude/invariants/ 3종 존재 (architecture, naming, quality)
□ .claude/team/ 4종 존재 (planner, implementer, reviewer, tester)
```

---

> **이 문서의 마지막 지시**: 에이전트는 Phase 0부터 Phase 9까지 순서대로 실행하라.
> 각 Phase 완료 시 진행 상황을 사용자에게 보고하라.
> 전체 완료 후 ✅/⚠️/🔁 형식으로 최종 보고하라.
