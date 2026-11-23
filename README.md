# 한끼어때 — 냉장고 파먹기

확인한 재료만, 장보기 없이, 조리 용기 하나로 만드는 한 끼. React + Vite + Tailwind 계열 프론트엔드(현재 스타일시트 기반)와 Express API를 단일 출처로 제공하는 배포형 프로젝트입니다.

## 실행

- Node.js 20 이상
- `npm install`
- `npm --prefix server install && npm --prefix client install`
- 개발: `npm run dev` (Vite 5173 → Express 5001 프록시)
- 테스트: `npm test`
- 빌드: `npm run build`
- 프로덕션: `npm start` (Express가 `client/dist`와 `/api`를 같은 출처에서 제공)

서버 환경변수:

- `PORT`: 플랫폼이 할당하는 포트
- `GEMINI_API_KEY`: 선택. 서버 측 Gemini Vision 키. 미설정 시 사진 분석은 비활성화되고 직접 입력은 계속 동작
- `MFDS_COOKRCP_API_KEY`: 선택. 식약처 COOKRCP01 수집용 키.
- `MFDS_IMPORT_TOKEN`: 선택. `/api/admin/cookrcp/candidates` 검수용 API 보호 토큰. 이 API는 원천 데이터를 검수 대기 형태로 반환하며 자동 추천에 넣지 않음

## 배포 (Render 예시)

1. 이 폴더를 GitHub 저장소 루트에 push.
2. Render에서 **New → Web Service**로 저장소 연결.
3. Root Directory는 비우고 Build Command는 `npm install && npm --prefix server install && npm --prefix client install && npm run build`, Start Command는 `npm start`.
4. 필요할 때만 `GEMINI_API_KEY`, `MFDS_COOKRCP_API_KEY`를 Render Environment에 서버 변수로 등록.
5. Render가 제공하는 `https://....onrender.com` 주소에서 `/health`가 `{"status":"ok"...}`인지 확인.

이 프로젝트는 앱 단일 출처로 프론트/API를 서비스하므로 플랫폼 TLS가 둘 다 HTTPS를 제공합니다. 이 실행 환경에는 사용자의 GitHub/Render 계정 권한이나 배포 토큰이 연결되어 있지 않아 외부 공개 URL을 생성하거나 배포했다고 주장할 수 없습니다.

## 안전/검증 원칙

- 사진은 메모리에서 분석 후 보관하지 않음. 클라이언트는 AI 후보를 `pending`으로 취급하고 사용자가 승인한 재료만 재고에 반영.
- Gemini 키는 브라우저로 전달하지 않음. 미설정/오류는 후보를 만들지 않고 직접 입력으로 전환.
- `status !== confirmed`, 수량/단위 미확정 재료는 추천에서 제외.
- 필수 재료와 필수 양념을 각각 수량·단위까지 비교. 기본양념 자동 보유 없음.
- 라면사리와 스프 포함 봉지라면은 서로 다른 재료.
- 레시피는 검수된 자체 레시피만 초기 추천. COOKRCP01 원천은 제목·재료·전체 조리단계 대조 전까지 공개 추천에서 제외.

## 중요한 현재 범위

카메라/파일 선택, 후보 확인·수정·삭제, 직접 입력, 기본양념 확인, 용기 필터, 선호 재료 우선순위, 단계별 조리 타이머를 구현했습니다. 다중 이미지의 동일 물체 cross-photo deduplication, CV 후보별 정밀 bbox 품질, 실기기 카메라 권한/모바일 Safari 및 배포 후 외부 HTTPS 검증은 실제 브라우저·배포 환경에서 추가 검증이 필요합니다. COOKRCP01 자동 수집도 키가 필요하며 수집 데이터는 검수 승인 전 노출하지 않습니다.
