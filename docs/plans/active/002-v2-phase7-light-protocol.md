# V2-P7: 라이트 프로토콜 3종 + 실시간 대화 조건 변경 + 마이크로 체크인

**Status**: Complete
**Started**: 2026-02-19
**Last Updated**: 2026-02-19
**Blueprint**: `002-v2-enhancement-blueprint.md`
**Dependencies**: V2-P6 (Feedback & Metrics — Feel Heard Score 등)

---

## Overview

### Feature Description

Phase 3 (Relationship Escalation)의 핵심 v2 변경사항:

1. **라이트 프로토콜 3종**: 친구 간 실시간 대화 전 수행하는 가벼운 구조화 대화
   - Common Ground Check (3분)
   - Joint Question (5분)
   - Switch Sides Mini (5분)
2. **실시간 대화 오픈 조건 변경**: 최소 2회 구조화된 대화 + **라이트 프로토콜 1회 이상** 완료 필수
3. **20분마다 마이크로 체크인**: 실시간 대화 중 가벼운 구조 유지

### Success Criteria

- [ ] `LightProtocolSession` entity 구현 (3가지 타입)
- [ ] `LightProtocolType` VO 구현 (COMMON_GROUND, JOINT_QUESTION, SWITCH_SIDES)
- [ ] 각 프로토콜별 워크플로 구현
- [ ] `Friendship` entity에 `lightProtocolCount` 추적 필드 추가
- [ ] 실시간 대화 오픈 조건: 구조화 2회+ AND 라이트 프로토콜 1회+ 충족 검증
- [ ] 20분마다 마이크로 체크인 메시지 자동 삽입
- [ ] 라이트 프로토콜 UI 3종
- [ ] 기존 친구/채팅 테스트 호환

---

## Architecture Decisions

### Layer Mapping

| Layer | Components | Responsibility |
|-------|-----------|---------------|
| Domain | `LightProtocolSession` entity, `LightProtocolType` VO, `Friendship` 수정 | 프로토콜 모델, 오픈 조건 |
| Application | `StartLightProtocolUseCase`, `SubmitLightProtocolUseCase`, `CheckRealtimeEligibilityUseCase` | 워크플로 |
| Infrastructure | `SupabaseLightProtocolRepository`, `RealtimeBroadcaster` 수정 | 저장, 실시간 체크인 |
| Presentation | `LightProtocolForm`, `MicroCheckinPrompt`, 친구 상세 UI 수정 | UX |

### Key Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| `LightProtocolSession`을 별도 Entity로 | 구조화된 대화와 다른 생명주기 (짧고 반복적) | Entity 수 증가 |
| 프로토콜 타입을 Enum VO로 | 3가지 고정 타입 | 확장 시 VO 수정 필요 |
| 마이크로 체크인을 서버 푸시로 | 타이머 정확도 | 클라이언트 타이머보다 신뢰성 높음 |
| 오픈 조건을 `Friendship` entity에서 검증 | 비즈니스 규칙은 도메인에 | Friendship entity 책임 증가 |

---

## Implementation Phases

### Sub-Phase 7.1: Domain Layer — Light Protocol & 조건 변경
**Goal**: 라이트 프로토콜 도메인 모델, 실시간 대화 오픈 조건 수정

#### RED: Write Failing Tests First
- [ ] Test 7.1.1: `LightProtocolType` VO 테스트
  - File: `test/unit/domain/value-objects/light-protocol-type.test.ts`
  - COMMON_GROUND (3분), JOINT_QUESTION (5분), SWITCH_SIDES (5분)
  - 각 타입별 이름, 설명, 소요 시간
  - Expected: Tests FAIL

- [ ] Test 7.1.2: `LightProtocolSession` entity 테스트
  - File: `test/unit/domain/entities/light-protocol-session.test.ts`
  - `friendshipId: string`
  - `type: LightProtocolType`
  - `status: 'ACTIVE' | 'COMPLETED'`
  - `initiatorResponse: string | null`
  - `responderResponse: string | null`
  - **Common Ground Check**: `agreedPoint`, `differentPoint`, `curiousPoint`
  - **Joint Question**: `jointQuestion: string`
  - **Switch Sides**: `initiatorSwitched: string`, `responderSwitched: string`
  - `complete()` → 양쪽 모두 응답 시 COMPLETED
  - 타임아웃 (24시간 후 만료)
  - Expected: Tests FAIL

- [ ] Test 7.1.3: `Friendship` 수정 — 프로토콜 카운트 & 오픈 조건
  - File: `test/unit/domain/entities/friendship.test.ts` 수정
  - `completedLightProtocols: number` 필드 추가
  - `isRealtimeEligible()`: 구조화 2회+ AND 라이트 프로토콜 1회+ → true
  - 기존 조건만 충족 (프로토콜 0회) → false
  - Expected: Tests FAIL

#### GREEN: Implement to Make Tests Pass
- [ ] Task 7.1.4: `LightProtocolType` VO 구현
  - File: `src/domain/value-objects/light-protocol-type.ts`

- [ ] Task 7.1.5: `LightProtocolSession` entity 구현
  - File: `src/domain/entities/light-protocol-session.ts`
  - 3가지 타입별 응답 구조
  - 양쪽 응답 완료 시 자동 COMPLETED

- [ ] Task 7.1.6: `Friendship` entity 수정
  - File: `src/domain/entities/friendship.ts`
  - `completedLightProtocols` 필드
  - `isRealtimeEligible()` 메서드 수정

- [ ] Task 7.1.7: `LightProtocolRepository` 인터페이스
  - File: `src/domain/interfaces/light-protocol-repository.ts`

#### Quality Gate
- [ ] 3가지 프로토콜 타입 모두 동작
- [ ] 오픈 조건 검증 정확
- [ ] Domain 외부 의존성 없음

---

### Sub-Phase 7.2: Application Layer — Use Cases
**Goal**: 라이트 프로토콜 시작/제출, 실시간 대화 자격 확인

#### RED: Write Failing Tests First
- [ ] Test 7.2.1: `StartLightProtocolUseCase` 테스트
  - File: `test/unit/application/use-cases/start-light-protocol.test.ts`
  - 친구 관계 확인 → 프로토콜 타입 선택 → 세션 생성
  - 친구가 아닌 사용자 → ForbiddenError
  - Mock: FriendshipRepository, LightProtocolRepository
  - Expected: Tests FAIL

- [ ] Test 7.2.2: `SubmitLightProtocolUseCase` 테스트
  - File: `test/unit/application/use-cases/submit-light-protocol.test.ts`
  - 한쪽 응답 제출 → 대기
  - 양쪽 모두 응답 → COMPLETED → Friendship.completedLightProtocols 증가
  - 만료된 세션 응답 → ExpiredError
  - Expected: Tests FAIL

- [ ] Test 7.2.3: `CheckRealtimeEligibilityUseCase` 테스트
  - File: `test/unit/application/use-cases/check-realtime-eligibility.test.ts`
  - 조건 충족 → { eligible: true }
  - 조건 미충족 → { eligible: false, reason: '...' }
  - Expected: Tests FAIL

#### GREEN: Implement to Make Tests Pass
- [ ] Task 7.2.4: `StartLightProtocolUseCase` 구현
  - File: `src/application/use-cases/start-light-protocol.ts`

- [ ] Task 7.2.5: `SubmitLightProtocolUseCase` 구현
  - File: `src/application/use-cases/submit-light-protocol.ts`

- [ ] Task 7.2.6: `CheckRealtimeEligibilityUseCase` 구현
  - File: `src/application/use-cases/check-realtime-eligibility.ts`

- [ ] Task 7.2.7: DTOs
  - File: `src/application/dtos/light-protocol-input.ts`
  - File: `src/application/dtos/light-protocol-output.ts`

#### Quality Gate
- [ ] 프로토콜 시작 → 응답 → 완료 전체 흐름
- [ ] 실시간 대화 자격 확인 정확

---

### Sub-Phase 7.3: Infrastructure Layer — Repository & 마이크로 체크인
**Goal**: 라이트 프로토콜 저장, 실시간 대화 마이크로 체크인

#### RED: Write Failing Tests First
- [ ] Test 7.3.1: `SupabaseLightProtocolRepository` 테스트
  - File: `test/unit/infrastructure/persistence/supabase-light-protocol-repository.test.ts`
  - 세션 생성, 조회, 응답 업데이트, 완료
  - Expected: Tests FAIL

- [ ] Test 7.3.2: 마이크로 체크인 로직 테스트
  - File: `test/unit/infrastructure/external/micro-checkin-scheduler.test.ts`
  - 실시간 대화 시작 후 20분 경과 → 체크인 메시지 생성
  - "지금까지 대화에서 가장 흥미로웠던 점은?" 형식
  - Expected: Tests FAIL

#### GREEN: Implement to Make Tests Pass
- [ ] Task 7.3.3: `SupabaseLightProtocolRepository` 구현
  - File: `src/infrastructure/persistence/supabase-light-protocol-repository.ts`

- [ ] Task 7.3.4: 마이크로 체크인 스케줄러
  - File: `src/infrastructure/external/micro-checkin-scheduler.ts`
  - 20분 간격 체크인 메시지 생성
  - Realtime Broadcaster로 전송

- [ ] Task 7.3.5: DI Container 업데이트
  - File: `src/infrastructure/config/di-container.ts`

#### Quality Gate
- [ ] Repository 저장/조회 동작
- [ ] 마이크로 체크인 20분 간격 동작

---

### Sub-Phase 7.4: Presentation Layer — UI 구현
**Goal**: 라이트 프로토콜 UI 3종, 마이크로 체크인 UI, 친구 상세 수정

#### RED: Write Failing Tests First
- [ ] Test 7.4.1: `CommonGroundForm` 테스트
  - File: `test/unit/presentation/components/common-ground-form.test.tsx`
  - "우리가 동의하는 1가지 / 아직 다른 1가지 / 더 알아보고 싶은 1가지"
  - 3개 텍스트 필드
  - Expected: Tests FAIL

- [ ] Test 7.4.2: `JointQuestionForm` 테스트
  - File: `test/unit/presentation/components/joint-question-form.test.tsx`
  - "우리 둘 다 답을 모르는 질문 1개를 함께 만들어봐요"
  - 한쪽 제안 → 상대 수정/동의
  - Expected: Tests FAIL

- [ ] Test 7.4.3: `SwitchSidesForm` 테스트
  - File: `test/unit/presentation/components/switch-sides-form.test.tsx`
  - "상대 입장에서 내 주장을 1문장으로 말해보기"
  - 양쪽 작성 → 공개 → 비교
  - Expected: Tests FAIL

- [ ] Test 7.4.4: 친구 상세 — 라이트 프로토콜 & 실시간 대화 조건
  - File: `test/unit/presentation/pages/friend-detail.test.tsx` 수정
  - 라이트 프로토콜 시작 버튼
  - 실시간 대화 버튼: 조건 미충족 시 잠금 + 안내 메시지
  - Expected: Tests FAIL

- [ ] Test 7.4.5: 마이크로 체크인 프롬프트
  - File: `test/unit/presentation/components/micro-checkin-prompt.test.tsx`
  - 실시간 대화 중 20분마다 체크인 카드 표시
  - 간단한 텍스트 입력 → 제출/스킵
  - Expected: Tests FAIL

#### GREEN: Implement to Make Tests Pass
- [ ] Task 7.4.6: `CommonGroundForm` 컴포넌트
  - File: `src/app/friends/[id]/_components/CommonGroundForm.tsx`

- [ ] Task 7.4.7: `JointQuestionForm` 컴포넌트
  - File: `src/app/friends/[id]/_components/JointQuestionForm.tsx`

- [ ] Task 7.4.8: `SwitchSidesForm` 컴포넌트
  - File: `src/app/friends/[id]/_components/SwitchSidesForm.tsx`

- [ ] Task 7.4.9: `MicroCheckinPrompt` 컴포넌트
  - File: `src/app/chat/[friendshipId]/_components/MicroCheckinPrompt.tsx`

- [ ] Task 7.4.10: 친구 상세 페이지 수정
  - File: `src/app/friends/[id]/page.tsx` 수정
  - 라이트 프로토콜 섹션 추가
  - 실시간 대화 조건 표시

- [ ] Task 7.4.11: API Routes
  - File: `src/app/api/light-protocol/route.ts` — 시작
  - File: `src/app/api/light-protocol/[id]/submit/route.ts` — 응답 제출
  - File: `src/app/api/light-protocol/[id]/route.ts` — 조회
  - File: `src/app/api/chat/[friendshipId]/eligibility/route.ts` — 실시간 대화 자격

- [ ] Task 7.4.12: 채팅 페이지 수정 — 마이크로 체크인 통합
  - File: `src/app/chat/[friendshipId]/page.tsx` 수정
  - 20분 타이머 → 체크인 프롬프트 삽입

#### Quality Gate
- [ ] 3종 프로토콜 UI 전체 동작
- [ ] 실시간 대화 잠금/해제 조건 동작
- [ ] 마이크로 체크인 20분 간격 동작
- [ ] 모바일 반응형

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| 라이트 프로토콜이 번거로움으로 인식 | Medium | Medium | 3분/5분 짧은 포맷, 게임화 요소 |
| 마이크로 체크인이 대화 흐름 방해 | Medium | Low | 스킵 가능, 카드 형태로 비침습적 |
| 실시간 대화 조건 강화로 기존 친구 관계 영향 | Low | Medium | 기존 친구에 대해서는 조건 완화 또는 grace period |

## Progress Tracking

- Sub-Phase 7.1 (Domain): 100%
- Sub-Phase 7.2 (Application): 100%
- Sub-Phase 7.3 (Infrastructure): 100%
- Sub-Phase 7.4 (Presentation): 100%
- **Overall**: 100%
