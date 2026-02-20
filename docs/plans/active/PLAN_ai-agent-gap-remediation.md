# Implementation Plan: AI Agent Gap 遺꾩꽍 諛??섏젙

**Status**: Completed
**Started**: 2026-02-20
**Last Updated**: 2026-02-20

**CRITICAL INSTRUCTIONS**: After completing each phase:
1. Check off completed task checkboxes
2. Run all quality gate validation commands
3. Verify ALL quality gate items pass
4. Update "Last Updated" date
5. Document learnings in Notes section
6. Only then proceed to next phase

DO NOT skip quality gates or proceed with failing checks

---

## Overview

### 諛곌꼍
`AI_Agent_func.md`(湲곗〈 ?ㅺ퀎)? `AI_Agent_new_function.md`(?ъ슜???쇰뱶諛?瑜?鍮꾧탳 遺꾩꽍??寃곌낵,
**?ㅺ퀎 ?먯튃??洹쇰낯?곸쑝濡?蹂寃?*??

```
??湲곗〈: AI Agent? ?ㅼ젣 ?щ엺??遺꾨━??蹂꾨룄 ?몃옓
??蹂寃? AI Agent? ?ㅼ젣 ?щ엺???숈씪??留ㅼ묶 ????쇳빀 (援щ텇 遺덇?)
```

### 濡쒖뺄 ?ㅽ뻾 ?먭? 寃곌낵 (2026-02-20)
釉뚮씪?곗??먯꽌 吏곸젒 ?뺤씤??寃곌낵:
- 留ㅼ묶 ?섏씠吏??"AI ????곷?? ?곗뒿?대낫?몄슂" 蹂꾨룄 ?뱀뀡 ?쒖떆 ??**???ㅺ퀎 ?꾨컲**
- ?섎Ⅴ?뚮굹 "??뷀븯湲? ?대┃ ??**?섏씠吏 癒뱁넻** (Agent ?몄뀡 ?앹꽦 API 遺??
- ?먮꼫吏 ?좏깮湲????멸컙 ?꾨낫 ?놁쑝硫?**誘몃끂異?*
- ?듭빱 ?꾪꽣 (?ㅻ쫫???뺣룄 ?щ씪?대뜑) ??**留ㅼ묶 ?섏씠吏 誘몄뿰??*
- ???吏꾩엯 遺덇?濡??쇳겕-?붾뱶/?쒕쭅 ?뚯뒪??AI ?묐떟 ?덉쭏 **寃利?遺덇?**

### Success Criteria
- [x] AI/?щ엺 ?듯빀 留ㅼ묶 ? ?숈옉 (?숈씪 移대뱶, 援щ텇 遺덇?)
- [x] ?듭빱 ?꾪꽣 + ?ㅻ쫫???뺣룄 ?щ씪?대뜑媛 留ㅼ묶 ?섏씠吏?먯꽌 ?숈옉
- [x] Agent ????몄뀡 ?앹꽦 ???ㅼ젣 ???吏꾪뻾 媛??
- [x] 留ㅼ묶 移대뱶 ?섎떒??"?곷?媛 AI?????덉뼱?? 怨좎? 諛곕꼫
- [x] ?쇳겕-?붾뱶?먯꽌 ?쒕쭅 寃뚯엫 ?뺤긽 ?숈옉
- [x] ?꾩껜 E2E ?뚮줈??濡쒖뺄 釉뚮씪?곗??먯꽌 寃利??꾨즺
- [x] 紐⑤뱺 湲곗〈 + ?좉퇋 ?뚯뒪???듦낵

---

## Gap 遺꾩꽍 醫낇빀

### A. 援ы쁽 議댁옱?섏?留????ㅺ퀎? 異⑸룎 (由ы뙥?곕쭅 ?꾩슂)

| # | ??ぉ | ?꾩옱 ?곹깭 | ?붽뎄 ?곹깭 | ?곹뼢??|
|---|------|----------|----------|--------|
| A1 | `PersonaSelector.tsx` | 蹂꾨룄 AI ?좏깮 UI濡??ъ슜 | **?먭린** ???듯빀 ?濡??泥?| ?뵶 Major |
| A2 | `FindMatchCandidates` UC | ?щ엺留?寃??| ?щ엺+Agent ?듯빀 寃???ㅼ퐫?대쭅 | ?뵶 Major |
| A3 | `MatchCandidate` ?뷀떚??| `candidateType` ?꾨뱶 ?놁쓬 | `'human' \| 'agent'` + `personaId?` 異붽? | ?뵶 Major |
| A4 | `CheckMatchingPool` UC | `suggestPersona` 遺꾧린 諛섑솚 | `suggestPersona` ?쒓굅, ?듯빀 ??먯꽌 ?먮룞 泥섎━ | ?윞 Medium |
| A5 | `FinalCTAType` VO | `TALK_TO_HUMAN`, `NOTIFY_AND_OTHER_PERSONA` 議댁옱 | ?대떦 媛??먭린 ??AI ?몄텧?섎뒗 CTA ?쒓굅 | ?윞 Medium |
| A6 | `ApplyAnchorFilter` UC | 3?④퀎 threshold 諛⑹떇 | `DifferenceLevel` VO + ?먮꼫吏蹂??곹븳 ?쒗븳 諛⑹떇 | ?윞 Medium |
| A7 | `AnchorFilterPanel.tsx` | 肄붾뱶 議댁옱, 留ㅼ묶 ?섏씠吏 誘몄뿰??| 留ㅼ묶 ?섏씠吏???듯빀 + 誘몃━蹂닿린 ?띿뒪??+ ?먮꼫吏 ?곕룞 | ?윞 Medium |
| A8 | 留ㅼ묶 page.tsx | PersonaSelector 遺꾧린, 蹂꾨룄 ?몃옓 | ?듯빀 移대뱶 + AiDisclaimerBanner | ?뵶 Major |
| A9 | `PersonaResponseDelay` VO | `calculate()` ?⑥씪 硫붿꽌??| Phase 2??`calculateFromDistribution()` 異붽? | ?윟 Minor |
| A10 | ?쒕쭅 由ъ썙??泥닿퀎 | 2醫?(?뺣떟/3?곗냽) | 5醫?(?뺣떟2醫?+ 3?곗냽 + ?ㅻ떟2醫? | ?윟 Minor |

### B. 援ы쁽???꾩쟾???녿뒗 寃?(?좉퇋 媛쒕컻 ?꾩슂)

| # | ??ぉ | ?ㅻ챸 | ?곹뼢??|
|---|------|------|--------|
| B1 | **Agent ????몄뀡 ?앹꽦 API** | POST `/api/dialogue/sessions` ??Agent 留ㅼ묶 ???몄뀡 ?앹꽦 | ?뵶 Critical |
| B2 | `AiDisclaimerBanner.tsx` | 留ㅼ묶 移대뱶 ?섎떒 "?곷?媛 AI?????덉뼱?? 怨좎? 諛곕꼫 | ?뵶 Major |
| B3 | `DifferenceLevel` VO | 0~1 ?щ씪?대뜑 媛???distance 踰붿쐞 留ㅽ븨 + ?쇰꺼 | ?윞 Medium |
| B4 | `PersonaProfile.toAnchorAttributes()` | ?섎Ⅴ?뚮굹 ???듭빱 ?띿꽦 蹂??硫붿꽌??| ?윞 Medium |
| B5 | ??댄븨 ?몃뵒耳?댄꽣 而댄룷?뚰듃 | "?곷?媛 ?묒꽦 以?.." UI (AI/?щ엺 ?숈씪) | ?윞 Medium |
| B6 | `MatchScore` ?듯빀 ?ㅼ퐫?대쭅 | `pool_scarcity_bonus` 媛?곗젏 濡쒖쭅 | ?윞 Medium |
| B7 | ?먮꼫吏蹂??ㅻ쫫 ?щ씪?대뜑 ?곹븳 ?쒗븳 | LOW??.4, NORMAL??.7, HIGH??.0 | ?윟 Minor |
| B8 | LLM ?꾨＼?꾪듃 ?먯뿰?ㅻ윭? 媛뺥솕 | ?ㅽ?, 遺덉셿???쒗쁽, 湲몄씠 遺덇퇋移?洹쒖튃 異붽? | ?윟 Minor |
| B9 | `AnchorFilterPanel` ?뚯뒪??| Domain/Application/Presentation ?뚯뒪??| ?윞 Medium |
| B10 | ?좉퇋 ?대깽???앹냼?몃? | `ai_disclaimer_view`, `anchor_filter_set` ??6醫?| ?윟 Minor |

### C. ??젣/?먭린 ??ぉ

| # | ??ぉ | ??젣 ?댁쑀 |
|---|------|----------|
| C1 | `PersonaSelector.tsx` 而댄룷?뚰듃 | AI瑜?蹂꾨룄濡??좏깮?섎뒗 UI 遺덊븘??|
| C2 | `PersonaSelector.test.tsx` ?뚯뒪??| 而댄룷?뚰듃 ?먭린???곕Ⅸ ?뚯뒪????젣 |
| C3 | `CheckMatchingPool.suggestPersona` 諛섑솚媛?| ?듯빀 ??먯꽌 ?먮룞 泥섎━ |
| C4 | `FinalCTAType.TALK_TO_HUMAN` | AI??뚯쓣 ?붿떆?섎뒗 CTA |
| C5 | `FinalCTAType.NOTIFY_AND_OTHER_PERSONA` | ?섎Ⅴ?뚮굹 媛쒕뀗 誘몃끂異?|
| C6 | `persona_select_{id}` ?대깽??| ?ъ슜??吏곸젒 ?좏깮 ?놁쓬 |
| C7 | `persona_dialogue_start` ?대깽??| ?ъ슜???硫??대깽???꾨떂 |
| C8 | "AI ?곗뒿" 愿??紐⑤뱺 移댄뵾/?꾩씠肄?| UX ?먯튃 ?꾨컲 |

---

## Architecture Decisions (Clean Architecture)

### Layer Mapping for This Feature

| Layer | 蹂寃?而댄룷?뚰듃 | Responsibility |
|-------|-------------|---------------|
| Domain | `MatchCandidate` (+candidateType), `DifferenceLevel` VO, `PersonaProfile` (+toAnchorAttributes), `PersonaResponseDelay` (+calculateFromDistribution), `FinalCTAType` (媛?蹂寃?, `TuringReward` (5醫? | 鍮꾩쫰?덉뒪 洹쒖튃 |
| Application | `FindMatchCandidates` (?듯빀 ?), `ApplyAnchorFilter` (DifferenceLevel ?곕룞), `CreateAgentDialogueSession` (?좉퇋), `CheckMatchingPool` (suggestPersona ?쒓굅) | ?좎뒪耳?댁뒪 ?ㅼ??ㅽ듃?덉씠??|
| Infrastructure | Agent ?몄뀡 ?앹꽦 API, ?듯빀 留ㅼ묶 荑쇰━, LLM ?꾨＼?꾪듃 媛뺥솕 | ?몃? I/O |
| Presentation | 留ㅼ묶 page.tsx (?듯빀 移대뱶), `AiDisclaimerBanner` (?좉퇋), `AnchorFilterPanel` (?곕룞), `TypingIndicator` (?좉퇋), PersonaSelector (?먭린) | UI ?뚮뜑留?|

### Key Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| AI/?щ엺 ?듯빀 留ㅼ묶 ? | Cold Start ?먯뿰 ?닿껐 + ?쒕쭅 寃뚯엫 ?щ? 洹밸???| Agent ?먯뿰?ㅻ윭? ?덉쭏 湲곗? ?곸듅 |
| ?ъ쟾 怨좎? + 寃뚯엫??| ?щ챸?깃낵 紐곗엯??洹좏삎 | ?쇰? ?ъ슜?먭? 紐⑤뱺 ?곷? ?섏떖 媛??|
| PersonaSelector ?먭린 | "AI ?곗뒿" ?꾨젅?대컢 ?쒓굅 | 湲곗〈 ?뚯뒪????젣 ?꾩슂 |
| candidateType UI 誘몃끂異?| 留ㅼ묶 移대뱶?먯꽌 AI/?щ엺 援щ텇 遺덇? ?먯튃 | ?대? 遺꾧린 蹂듭옟??利앷? |

---

## Dependencies

### Required Before Starting
- [x] `AI_Agent_func.md` 湲곗〈 湲곕뒫 援ы쁽 ?꾨즺
- [x] `AI_Agent_new_function.md` ?좉퇋 ?붽뎄?ы빆 ?뺤젙
- [x] 濡쒖뺄 ?ㅽ뻾 ?먭? ?꾨즺 (踰꾧렇 ?앸퀎)

### External Dependencies
- OpenAI GPT-5-mini API (LLM ?꾨＼?꾪듃 蹂寃?

---

## Test Strategy

**TDD Principle**: Write tests FIRST, then implement to make them pass

| Test Type | Coverage Target | Purpose |
|-----------|-----------------|---------|
| Unit Tests | >=80% | Domain VO/Entity 蹂寃? UC 濡쒖쭅 |
| Integration Tests | Critical paths | Agent ?몄뀡 ?앹꽦, ?듯빀 留ㅼ묶 E2E |
| Component Tests | UI 寃利?| AiDisclaimerBanner, AnchorFilterPanel ?곕룞, TypingIndicator |

---

## Implementation Phases

### Phase 1: Domain Layer 蹂寃?(Foundation)
**Goal**: ?듯빀 留ㅼ묶 ???湲곕컲???섎뒗 ?꾨찓??紐⑤뜽 蹂寃?**Status**: Completed

#### RED: Write Failing Tests First
- [x] 1.1: `MatchCandidate` ??`candidateType` ?꾨뱶 + `personaId?` ?꾨뱶 ?뚯뒪??  - File: `src/domain/entities/__tests__/match-candidate.test.ts`
  - 寃利? human/agent ????앹꽦, personaId ?듭뀛??
- [x] 1.2: `DifferenceLevel` VO ?뚯뒪??  - File: `src/domain/value-objects/__tests__/difference-level.test.ts`
  - 寃利? 0~1 踰붿쐞, `toDistanceRange()`, `toLabel()`, 踰붿쐞 珥덇낵 ?먮윭
- [x] 1.3: `PersonaProfile.toAnchorAttributes()` ?뚯뒪??  - File: `src/domain/entities/__tests__/persona-profile.test.ts` (湲곗〈 ?뚯씪 ?뺤옣)
  - 寃利? ageGroup?뭓ge_group, jobCategory?뭞ob_category 蹂??
- [x] 1.4: `FinalCTAType` 蹂寃???`TALK_TO_HUMAN`, `NOTIFY_AND_OTHER_PERSONA` ?쒓굅 ?뚯뒪??  - File: `src/domain/value-objects/__tests__/final-cta-type.test.ts` (湲곗〈 ?섏젙)
  - 寃利? ?듯빀 CTA 濡쒖쭅 (AI/?щ엺 援щ텇 ?녿뒗 CTA)
- [x] 1.5: ?쒕쭅 由ъ썙??5醫??뚯뒪??  - File: `src/domain/value-objects/__tests__/turing-reward.test.ts` (湲곗〈 ?뺤옣)
  - 寃利? ?뺣떟 2醫?+ 3?곗냽 + ?ㅻ떟 2醫?硫붿떆吏/?먯닔

#### GREEN: Implement to Make Tests Pass
- [x] 1.6: `MatchCandidate` ?뷀떚?곗뿉 `candidateType`, `personaId` 異붽?
- [x] 1.7: `DifferenceLevel` VO ?앹꽦
- [x] 1.8: `PersonaProfile`??`toAnchorAttributes()` 硫붿꽌??異붽?
- [x] 1.9: `FinalCTAType`?먯꽌 AI ?몄텧 CTA ?쒓굅, ?듯빀 CTA 異붽?
- [x] 1.10: ?쒕쭅 由ъ썙??5醫?援ы쁽

#### REFACTOR: Clean Up Code
- [x] 1.11: `CheckMatchingPool` 諛섑솚 ??낆뿉??`suggestPersona` ?쒓굅
- [x] 1.12: 湲곗〈 `suggestPersona` 李몄“?섎뒗 ?뚯뒪???섏젙

#### Quality Gate
- [x] TDD compliance verified
- [x] Build passes (`pnpm build`)
- [x] All tests pass (`pnpm test`)
- [x] Linting clean (`pnpm lint`)
- [x] Domain has no external dependencies
- [x] No security issues

---

### Phase 2: Application Layer ???듯빀 留ㅼ묶 ?붿쭊
**Goal**: ?щ엺+Agent ?듯빀 ?ㅼ퐫?대쭅, ?듭빱 ?꾪꽣 DifferenceLevel ?곕룞
**Status**: Completed

#### RED: Write Failing Tests First
- [x] 2.1: `FindMatchCandidates` ??Agent ?꾨낫 ?ы븿 ?듯빀 ?ㅼ퐫?대쭅 ?뚯뒪??  - File: `src/application/use-cases/__tests__/find-match-candidates.test.ts` (?뺤옣)
  - 寃利? PersonaRepository 濡쒕뱶 ??MatchCandidate(agent) 蹂?????щ엺怨??듯빀 ?뺣젹
  - 寃利? `pool_scarcity_bonus` (?щ엺 0紐끸넂0.3, 1~2紐끸넂0.1, 3+??.0)
- [x] 2.2: `ApplyAnchorFilter` ??DifferenceLevel + ?먮꼫吏 ?곹븳 ?뚯뒪??  - File: `src/application/use-cases/__tests__/apply-anchor-filter.test.ts` (?좉퇋)
  - 寃利? DifferenceLevel.toDistanceRange() ?곸슜, LOW?뭢ax 0.4 ??
- [x] 2.3: `CreateAgentDialogueSession` UC ?뚯뒪??  - File: `src/application/use-cases/__tests__/create-agent-dialogue-session.test.ts`
  - 寃利? personaId ???몄뀡 ?앹꽦, 珥덇린 affirmation ?④퀎

#### GREEN: Implement to Make Tests Pass
- [x] 2.4: `FindMatchCandidates` UC??Agent ?꾨낫 ?듯빀 濡쒖쭅 異붽?
  - PersonaRepository ?섏〈??異붽?
  - ?섎Ⅴ?뚮굹 ??MatchCandidate(agent) 蹂??
  - pool_scarcity_bonus ?곸슜
- [x] 2.5: `ApplyAnchorFilter` UC 由ы뙥?곕쭅
  - DifferenceLevel ?뚮씪誘명꽣 異붽?
  - ?먮꼫吏蹂??곹븳 ?쒗븳 濡쒖쭅
  - AI ?섎Ⅴ?뚮굹 ?듭빱 ?띿꽦 ?꾪꽣留?(toAnchorAttributes)
- [x] 2.6: `CreateAgentDialogueSession` UC 援ы쁽
  - PersonaRepository, DialogueSessionRepository ?섏〈??
  - Agent ?몄뀡 ?앹꽦 + 珥덇린 ?곹깭 ?ㅼ젙

#### REFACTOR
- [x] 2.7: DI Container???좉퇋 UC 諛붿씤??異붽?
- [x] 2.8: 湲곗〈 `CheckMatchingPool` 李몄“ 肄붾뱶 ?뺣━

#### Quality Gate
- [x] TDD compliance verified
- [x] Build passes
- [x] All tests pass
- [x] Use cases depend only on port interfaces
- [x] No business logic leak into infrastructure

---

### Phase 3: Infrastructure ??Agent ?몄뀡 API + LLM ?꾨＼?꾪듃
**Goal**: Agent ????몄뀡 ?앹꽦 API, LLM ?꾨＼?꾪듃 ?먯뿰?ㅻ윭? 媛뺥솕
**Status**: Completed

#### RED: Write Failing Tests First
- [x] 3.1: POST `/api/dialogue/sessions` ??Agent ?몄뀡 ?앹꽦 API ?뚯뒪??
  - 寃利? personaId ?ы븿 ?붿껌 ???몄뀡 ID 諛섑솚
- [x] 3.2: `PersonaResponseDelay.calculateFromDistribution()` ?뚯뒪??
  - File: `src/domain/value-objects/__tests__/persona-response-delay.test.ts` (?뺤옣)
  - 寃利? mean/stdDev 湲곕컲 遺꾪룷 ?섑뵆留? 2~30珥??대옩??

#### GREEN: Implement to Make Tests Pass
- [x] 3.3: POST `/api/dialogue/sessions` API ?쇱슦??援ы쁽
  - Agent 留ㅼ묶 ??`CreateAgentDialogueSession` UC ?몄텧
  - ?щ엺 留ㅼ묶 ??湲곗〈 濡쒖쭅 ?좎?
- [x] 3.4: `PersonaResponseDelay`??`calculateFromDistribution()` 異붽?
- [x] 3.5: LLM ?꾨＼?꾪듃 ?먯뿰?ㅻ윭? 洹쒖튃 異붽?
  - File: `src/infrastructure/external/persona-prompts.ts`
  - ?ㅽ? 10% ?뺣쪧, 遺덉셿???쒗쁽, 湲몄씠 遺덇퇋移???

#### Quality Gate
- [x] TDD compliance verified
- [x] Build passes
- [x] All tests pass
- [x] API ?쇱슦??curl濡?吏곸젒 寃利?
- [x] No security issues (?낅젰 寃利? ?몄뀡 ?몄쬆)

---

### Phase 4: Presentation Layer ???듯빀 留ㅼ묶 UI
**Goal**: PersonaSelector ?먭린, ?듯빀 移대뱶 UI, AiDisclaimerBanner, AnchorFilterPanel ?곕룞
**Status**: Completed

#### RED: Write Failing Tests First
- [x] 4.1: `AiDisclaimerBanner` 而댄룷?뚰듃 ?뚯뒪??
  - File: `src/app/(main)/matching/__tests__/AiDisclaimerBanner.test.tsx`
  - 寃利? 怨좎? ?띿뒪???뚮뜑留? ?묒? ?고듃, ?묎렐??
- [x] 4.2: `TypingIndicator` 而댄룷?뚰듃 ?뚯뒪??
  - File: `src/app/(main)/dialogue/_components/__tests__/TypingIndicator.test.tsx`
  - 寃利? "?곷?媛 ?묒꽦 以?.." ?쒖떆, ?좊땲硫붿씠??
- [x] 4.3: `AnchorFilterPanel` ?듯빀 ?뚯뒪??
  - File: `src/app/(main)/matching/__tests__/AnchorFilterPanel.test.tsx`
  - 寃利? ?듭빱 ?좏깮, ?ㅻ쫫 ?щ씪?대뜑, ?먮꼫吏蹂??곹븳, 誘몃━蹂닿린 ?띿뒪??
- [x] 4.4: 留ㅼ묶 page.tsx ?듯빀 ?뚯뒪??
  - 寃利? PersonaSelector 誘몄궗?? ?듯빀 移대뱶 ?뚮뜑留? AiDisclaimerBanner ?쒖떆

#### GREEN: Implement to Make Tests Pass
- [x] 4.5: `AiDisclaimerBanner.tsx` ?앹꽦
  - ?묒? ?고듃 (text-xs), ?뚯깋 (text-text-tertiary)
  - "?렞 ?곷?媛 AI?????덉뼱?? ?????留욎텛硫?由ъ썙??"
- [x] 4.6: `TypingIndicator.tsx` ?앹꽦
  - "?곷?媛 ?묒꽦 以?.." + ???좊땲硫붿씠??
  - AI/?щ엺 ?숈씪 UI
- [x] 4.7: `AnchorFilterPanel.tsx` 由ы뙥?곕쭅
  - DifferenceLevel ?щ씪?대뜑 (?곗냽??0~1)
  - ?먮꼫吏蹂??곹븳 ?쒓컖???쒗븳
  - ?ㅼ떆媛?誘몃━蹂닿린 ?띿뒪??
- [x] 4.8: 留ㅼ묶 page.tsx 由ы뙥?곕쭅
  - PersonaSelector import ?쒓굅
  - ?듯빀 ?꾨낫 紐⑸줉 ?뚮뜑留?(candidateType 誘몃끂異?
  - AnchorFilterPanel ?곕룞
  - AiDisclaimerBanner ?곸떆 ?쒖떆
  - EnergySelector瑜??꾨낫 ?좊Т? 臾닿??섍쾶 ??긽 ?쒖떆

#### Cleanup
- [x] 4.9: `PersonaSelector.tsx` ??젣
- [x] 4.10: `PersonaSelector.test.tsx` ??젣
- [x] 4.11: 湲덉? 臾멸뎄 ?먭? (codebase ?꾩껜?먯꽌 "AI ?곗뒿", "遊뉕낵 ??? ??寃??

#### Quality Gate
- [x] TDD compliance verified
- [x] Build passes
- [x] All tests pass
- [x] 濡쒖뺄 釉뚮씪?곗??먯꽌 留ㅼ묶 ?섏씠吏 ?듯빀 移대뱶 ?뺤씤
- [x] ?묎렐??(aria-label ?? 寃利?
- [x] 湲덉? 臾멸뎄 0嫄?

---

### Phase 5: E2E ?듯빀 寃利?+ ?쇳겕-?붾뱶 CTA 蹂寃?
**Goal**: ?꾩껜 ?뚮줈??濡쒖뺄 釉뚮씪?곗? 寃利? ?쇳겕-?붾뱶 CTA ?듯빀
**Status**: Completed

#### RED: Write Failing Tests First
- [x] 5.1: ?쇳겕-?붾뱶 CTA ?듯빀 ?뚯뒪??
  - File: `src/app/(main)/dialogue/_components/__tests__/PeakEndFlow.test.tsx` (?뺤옣)
  - 寃利? "?ㅼ쓬 ???李얘린" CTA, "移쒓뎄 ?섍린" (?щ엺留?, "?ㅻ뒛? ?ш린源뚯?"
  - 寃利? "?ㅼ젣 ?щ엺怨???뷀븯湲?, "?ㅻⅨ ?섎Ⅴ?뚮굹" 臾멸뎄 誘몄궗??
- [x] 5.2: ?쒕쭅 寃뚯엫 ?ъ쟾 怨좎? ???쇳겕-?붾뱶 異붿륫 ??由ъ썙???뚮줈???뚯뒪??

#### GREEN: Implement Changes
- [x] 5.3: `determineFinalCTA()` ?⑥닔 蹂寃?
  - `TALK_TO_HUMAN` ??`FIND_NEXT_DIALOGUE`濡??듯빀
  - `NOTIFY_AND_OTHER_PERSONA` ?쒓굅
  - `BECOME_FRIENDS`???щ엺??寃쎌슦留??쒕쾭?먯꽌 ?쒖꽦??
- [x] 5.4: ?쇳겕-?붾뱶 CTA ?쇰꺼 ?쒓뎅??蹂寃?
- [x] 5.5: ?쒕쭅 由ъ썙??硫붿떆吏 5醫??쒓뎅??援ы쁽

#### E2E 釉뚮씪?곗? 寃利?
- [x] 5.6: 留ㅼ묶 ???먮꼫吏 ?좏깮 ???듭빱 ?꾪꽣 ???듯빀 ?꾨낫 ?쒖떆 ?뺤씤
- [x] 5.7: ?꾨낫 移대뱶 ?대┃ ??Agent ????몄뀡 ?앹꽦 ?????吏꾩엯 ?뺤씤
- [x] 5.8: Agent ?묐떟 ?쒕젅??+ ??댄븨 ?몃뵒耳?댄꽣 ?뺤씤
- [x] 5.9: ????꾨즺 ???쇳겕-?붾뱶 ???쒕쭅 寃뚯엫 ??由ъ썙???뺤씤
- [x] 5.10: "?곷?媛 AI?????덉뼱?? 怨좎? 諛곕꼫 ?쒖떆 ?뺤씤
- [x] 5.11: 湲덉? 臾멸뎄 ?꾩껜 ?섏씠吏 ?ъ젏寃

#### Quality Gate
- [x] Build passes
- [x] All tests pass (湲곗〈 + ?좉퇋)
- [x] 濡쒖뺄 釉뚮씪?곗? E2E ?꾩껜 ?뚮줈???듦낵
- [x] Guardrail 硫뷀듃由??섏쭛 ?대깽??諛쒗솕 ?뺤씤
- [x] ?묎렐??寃利?
- [x] ?깅뒫 ????놁쓬

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| ?듯빀 留ㅼ묶 ?ㅼ퐫?대쭅??AI瑜??덈Т ?먯＜ 留ㅼ묶 | Medium | High | pool_scarcity_bonus 媛以묒튂 ?쒕떇, AI 鍮꾩쑉 Guardrail |
| Agent ?먯뿰?ㅻ윭? 遺議깆쑝濡?利됱떆 援щ텇??| Medium | High | LLM ?꾨＼?꾪듃 諛섎났 ?뚯뒪?? ?ㅼ궗?⑹옄 ?쇰뱶諛?猷⑦봽 |
| PersonaSelector ??젣 ??湲곗〈 ?뚯뒪??????ㅽ뙣 | Low | Medium | Phase 4?먯꽌 ?쒖감 ?뺣━ |
| ????몄뀡 ?앹꽦 API ?몄쬆 痍⑥빟??| Low | High | X-Session-Id 寃利?+ rate limiting |
| DifferenceLevel ?щ씪?대뜑 UX 吏곴???遺議?| Medium | Medium | 誘몃━蹂닿린 ?띿뒪??+ ?ъ슜???뚯뒪??|

---

## Rollback Strategy

### Phase 蹂?濡ㅻ갚
- **Phase 1 ?ㅽ뙣**: Domain 蹂寃?revert (?뷀떚??VO留?蹂寃쎌씠???덉쟾)
- **Phase 2 ?ㅽ뙣**: UC 蹂寃?revert + DI 諛붿씤???먮났
- **Phase 3 ?ㅽ뙣**: API ?쇱슦???쒓굅, LLM ?꾨＼?꾪듃 ?먮났
- **Phase 4 ?ㅽ뙣**: PersonaSelector 蹂듭썝, page.tsx git revert
- **Phase 5 ?ㅽ뙣**: CTA ?쇰꺼 ?먮났

### ?꾩껜 濡ㅻ갚
- `git stash` ?먮뒗 feature branch?먯꽌 ?묒뾽 ??main??癒몄? ?꾧퉴吏 ?덉쟾

---

## Progress Tracking
- Phase 1 (Domain): 100%
- Phase 2 (Application): 100%
- Phase 3 (Infrastructure): 100%
- Phase 4 (Presentation): 100%
- Phase 5 (E2E + CTA): 100%
Overall: 100%

---

## Phase Sizing

| Phase | ?덉긽 ?쒓컙 | ?듭떖 ?묒뾽 |
|-------|----------|----------|
| Phase 1 | 2~3h | Domain 紐⑤뜽 蹂寃?(VO/Entity 5媛? |
| Phase 2 | 3~4h | ?듯빀 留ㅼ묶 ?붿쭊 + Agent ?몄뀡 UC |
| Phase 3 | 2~3h | API ?쇱슦??+ LLM ?꾨＼?꾪듃 |
| Phase 4 | 3~4h | UI ?듯빀 (?먭린+?좉퇋+?곕룞) |
| Phase 5 | 2~3h | E2E 寃利?+ CTA 蹂寃?|
| **Total** | **12~17h** | |

---

## Notes & Learnings
- 2026-02-20: 濡쒖뺄 ?ㅽ뻾?쇰줈 Agent ????몄뀡 ?앹꽦 API 遺??諛쒓껄 (?좊떅 ?뚯뒪?몃쭔?쇰줈??諛쒓껄 遺덇?)
- 2026-02-20: PersonaSelector ???먭린 ??곸씠誘濡?湲곗〈 ?뚯뒪?몃룄 ??젣 ?꾩슂
- 2026-02-20: `AI_Agent_func.md`??P2-3, P2-4??肄붾뱶 援ы쁽 ?꾨즺 ?곹깭?대굹, ???ㅺ퀎??留욊쾶 ?섏젙 ?꾩슂
- 2026-02-20: `pnpm lint`媛 `.tmp-prodcheck/.next` ?곗텧臾쇱쓣 ?ㅼ틪???ㅽ뙣?섎?濡?`eslint.config.mjs` ignore??`.tmp-prodcheck/` 異붽? ?꾩슂
- 2026-02-20: ?쒕쭅 由ъ썙?????蹂寃???Presentation ?뚯뒪???쎌뒪(`TuringTestPanel`)? UC ?뚯뒪??`submit-turing-guess`) ?숈떆 ?낅뜲?댄듃媛 ?꾩슂
- 2026-02-20: Agent scarcity bonus???щ엺 ?꾨낫??"?꾩껜 ? ?ш린"(0紐?1~2紐?3+紐? 湲곗??쇰줈 怨꾩궛?댁빞 ?붽뎄?ы빆怨??뚯뒪?멸? ?쇱튂??- 2026-02-20: `ApplyAnchorFilter`?먯꽌 ?먮꼫吏 ?곹븳?쇰줈 range媛 ???먯쑝濡??섏텞?????덉뼱 理쒖냼 ??蹂댁젙(0.2)???ｌ뼱??UX媛 ?좎???
- 2026-02-20: Phase 4 UI 통합 완료 (AiDisclaimerBanner, TypingIndicator, AnchorFilterPanel, 매칭 페이지 통합 + PersonaSelector 제거)
- 2026-02-20: Phase 5 CTA/튜링 플로우 테스트 보강 완료 (PeakEndFlow 리그레션 테스트 + WaitingForOpponent 타이핑 인디케이터 검증)
- 2026-02-20: 금지 문구 점검 후 잔존 2건(‘AI 연습 대화’)을 ‘AI 대화’로 교체

