# Evals — PerspectiveShift

이 디렉토리는 **EDD(Eval-Driven Development)** 구조이다.

## Structure
- `golden/`: 골든 테스트 케이스 (핵심 기능의 정답 세트)
- `regression/`: 회귀 방지 케이스 (수정된 버그의 재현 방지)
- `bootstrap/`: 환경 부트스트랩 검증
- `eval-config.yaml`: 평가 파이프라인 설정

## Workflow
1. 새 기능 → golden/ 에 eval 케이스 작성
2. 버그 수정 → regression/ 에 재현 케이스 등록
3. CI에서 eval 세트 자동 실행 → 회귀 감지
