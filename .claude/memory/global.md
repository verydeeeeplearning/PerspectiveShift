# Global Memory — PerspectiveShift

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

### [2026-02-18] 프로젝트 초기 설정
- **발견 맥락**: 부트스트랩 환경 구성
- **교정 내용**: LLM 모델을 GPT-4o에서 GPT-5-mini로 변경 (사용자 결정)
- **적용 범위**: 모든 LLM 호출 관련 코드
- **승격 여부**: .claude/config.yaml에 반영됨

### [2026-02-19] DI Container 300줄 제한
- **발견 맥락**: V2-P7 구현 중 di-container.ts가 302줄로 초과
- **교정 내용**: DI container 파일은 300줄 이내로 유지해야 함 (architecture compliance test). 인라인 stub 정의를 압축하여 해결.
- **적용 범위**: `src/infrastructure/config/di-container.ts` 수정 시
- **승격 여부**: 미승격 (테스트에서 자동 검증)

### [2026-02-19] Entity 생성 패턴: optional props
- **발견 맥락**: Friendship entity에 `completedLightProtocols` 추가 시 기존 테스트 호환
- **교정 내용**: 새 필드를 Props 인터페이스에 `optional` (`?`)로 추가하고, 생성자에서 `?? 0` 기본값 할당. 기존 코드 변경 최소화.
- **적용 범위**: 기존 Entity에 새 필드 추가 시
- **승격 여부**: 미승격

### [2026-02-19] Frontend 페이지-레벨 통합 테스트 누락 방지
- **발견 맥락**: V2-P7에서 컴포넌트만 테스트하고 페이지 통합을 누락, 사용자가 지적
- **교정 내용**: 새 컴포넌트를 만들 때 (1) 컴포넌트 단위 테스트 + (2) 페이지에 통합 + (3) 페이지-레벨 테스트 또는 통합 테스트 모두 확인해야 함. 페이지에서 사용하는 로직은 별도 컴포넌트로 추출하여 테스트 가능하게 한다.
- **적용 범위**: Presentation 레이어 모든 작업
- **승격 여부**: 미승격

### [2026-02-19] V2 Domain Model 패턴 요약
- **발견 맥락**: V2 P1-P8 전체 구현 완료
- **교정 내용**:
  - Value Object: `as const` 배열 + `type` union + 메타데이터 Record 패턴 (예: LightProtocolType)
  - Entity: private constructor + `create()`/`reconstitute()` static factory 패턴
  - Use Case: constructor DI (deps interface) + single `execute()` 메서드
  - Repository: Domain에서 port interface 정의, Infrastructure에서 adapter 구현
  - DialogueStep FSM: AFFIRMATION → POSITION → QUESTION → ANSWER → REFLECTION → JOINT_SUMMARY
  - Friendship 실시간 적격성: `ACTIVE && dialogueCount >= 2 && completedLightProtocols >= 1`
- **적용 범위**: 전체 Domain/Application 레이어
- **승격 여부**: ARCHITECTURE.md에 반영됨
