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
- ci: fmt→lint→test 순서 실행, 0 반환

## Failure Handling
- 실패 시 원인을 기록하고 evals/regression/에 케이스 추가
