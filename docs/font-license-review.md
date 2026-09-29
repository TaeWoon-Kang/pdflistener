# 사이트 글꼴 변경 및 라이선스 검토

검토일: 2026-09-29. 범위: 이 저장소의 영어·한국어 홍보 사이트와 라이선스 페이지.
앱 실행 파일 전체의 라이선스 검토를 대신하지 않는다.

## 적용 결과와 사용 범위

한국어 h1/h2 제목을 명조 계열 시스템 글꼴에서 **Pretendard SemiBold**로 변경했다.
“중요한 내용은 또렷하게. 불필요한 끊김은 줄이게.”도 포함한다.
굵기 600의 원본 웹폰트를 자체 호스팅하고, 자간·행간과 제목의 기울임을 조정했다.
본문·영어 제목은 기기에 설치된 시스템 글꼴을 계속 사용한다.
기존 앱 스크린샷과 공유 PNG는 변경하지 않았다.

**‘사이트의 모든 글꼴이 오픈소스’ 또는 ‘저작권이 없다’는 결론이 아니다.**
Pretendard는 저작권이 있으며 SIL Open Font License 1.1 조건에 따른 상업적 이용과
재배포가 허용된다. 제목 옆에 저작자 이름을 매번 넣을 의무와, 웹폰트 파일을 배포할 때
원문 저작권 고지 및 라이선스를 보존할 의무는 구분해야 한다.
이번 웹폰트 배포에는 후자의 의무가 있으므로 원문을 함께 제공한다.

## 원본과 고지

출처는 [Pretendard 공식 저장소](https://github.com/orioncactus/pretendard)이며
커밋 `7aeb0698819be2b4097dae8ec8fe6a795e5cf3ae`로 고정했다.
폰트 바이너리는 v1.3.9의 원본과 같고, 라이선스는 동일 고정 커밋의 전체 고지를 사용한다.
이 고지에는 Kil Hyung-jin, Adobe/Source, Inter Project Authors,
M+ FONTS Project Authors와 Reserved Font Names가 포함된다.
옛 태그의 단일 제작자 고지만 복사하지 않았다.

- [배포되는 글꼴 고지 전문](../assets/fonts/OFL-Pretendard.txt)
- [원본 경로·커밋·SHA-256·Git blob 기록](../assets/fonts/provenance.json)
- [고정된 공식 원문](https://github.com/orioncactus/pretendard/blob/7aeb0698819be2b4097dae8ec8fe6a795e5cf3ae/LICENSE)
- [SIL OFL 공식 원문](https://openfontlicense.org/open-font-license-official-text/)
- [SIL OFL FAQ](https://openfontlicense.org/ofl-faq/), 특히 1.1.2, 1.10–1.11, 웹폰트 관련 2절

`Pretendard-SemiBold.woff2`는 785,856바이트이며 SHA-256은
`c863f76a7de5c1ddc1ed8b2fa794964530774592c4f31407a84e2a2ae93f17f0`이다.
`OFL-Pretendard.txt`는 4,816바이트이며 SHA-256은
`82e9c8a4b203261f10ddba1296422d64914ff3d4b7bd8a12896d03f0f088d70a`이다.
둘 다 다운로드 때 공식 Git blob과 대조했고, 원본 바이트를 그대로 보관한다.
글꼴 서브셋 생성, 포맷 변환, 내부 이름 변경, 메타데이터 제거는 하지 않았다.
원본 `LICENSE`의 배포 파일명만 구별하기 쉽게 바꿨고 내용은 동일하다.

OFL은 글꼴만의 단독 판매를 금지하며, 재배포 시 고지를 유지하고 글꼴 자체에 다른
라이선스를 적용하지 않도록 한다. 수정본의 Reserved Font Name 사용에는 별도 조건이 있다.
글꼴 사용으로 사이트 자체 코드 전체가 OFL로 바뀌는 것은 아니다.
저장소 `UNLICENSED`와 글꼴 OFL의 적용 범위를 README와 양쪽 언어의 공개 안내에 구분했다.

## 시스템 글꼴과 기존 이미지

CSS에 남아 있는 Apple SD Gothic Neo, AppleMyungjo, Iowan Old Style, Baskerville,
Segoe UI, Palatino Linotype, Georgia 및 OS 선택자는 오픈소스라는 뜻이 아니다.
방문자 기기의 글꼴을 선택하는 이름이며 해당 OS 글꼴 바이너리는 이 사이트에 없다.
현재 방식에 대해 확인한 공식 문서에서 추가 웹페이지 저작권 고지 의무나 위반 근거를
발견하지 못했다. OS 글꼴을 서버에 복사하거나 변환해 배포해도 된다는 뜻은 아니다.

- [Microsoft Font redistribution FAQ](https://learn.microsoft.com/en-us/typography/fonts/font-faq):
  Windows 글꼴의 CSS 참조와 글꼴 파일 재배포를 구분한다.
- [Apple Fonts 기술 문서](https://developer.apple.com/documentation/technologyoverviews/fonts):
  웹에서 시스템 글꼴과 문서 글꼴을 참조하는 방법을 설명한다.
- [macOS Golden Gate SLA §2E](https://www.apple.com/legal/sla/docs/macOSGoldenGate.pdf),
  [macOS Tahoe SLA §2E](https://www.apple.com/legal/sla/docs/macOSTahoe.pdf):
  OS에 포함된 글꼴의 표시·인쇄와 내장 시 제한을 구분한다.

기존 Mac의 SFNS 메타데이터는 해당 OS의 사용권 계약을 가리켰다.
개발자 웹사이트에서 별도로 내려받는 디자인용 SF 패키지의 계약을 OS 글꼴 호출에
그대로 적용하지 않았다. Windows 글꼴 FAQ를 Mac 공급본의 사용 허가로 대신하지도 않았다.
PNG는 완성된 화면과 문구를 담은 래스터 이미지이며 글꼴 소프트웨어를 내장하지 않는다.
이 구분은 기존 사용 형태에 대한 검토이며 이미지의 모든 권리에 대한 일반 보증은 아니다.

## 누락 방지 및 검증

- `tools/fonts.mjs`는 고지와 글꼴이 모두 존재하고 기록된 크기·SHA-256과 일치하는지 확인한다.
  누락, 변경, manifest에서 고지 항목 삭제 시 검증이 실패하는 사례도 테스트했다.
- 빌드는 글꼴, 원문 고지, 출처 JSON을 명시적 허용 목록으로 `dist/assets/fonts/`에 복사한다.
  영어·한국어 라이선스 페이지에서 고지 전문과 출처로 연결하며 하단에서 해당 페이지에 접근한다.
- `/pdflistener/` 아래에서 HTML 링크와 CSS 상대 경로를 검사했다. 로컬 Chrome에서
  요청한 한글 제목의 24개 글리프가 모두 `Pretendard SemiBold`, `isCustomFont: true`로 확인됐다.
  한글 라이선스 제목도 동일하게 확인했다. CSS 이름만 조사한 결과가 아니다.
- 7개 Node 검사 및 실제 브라우저 통합 검사를 통과했다. 320–1440px 가로 넘침 없음,
  검사한 상태의 axe 위반 0건, 외부 요청·실패 요청·콘솔 오류 0건이다.
- 전체 출력은 약 1.95MB이며 기존 3MiB 상한을 유지한다. 새 런타임 의존성이나 외부 CDN은 없다.

해시 검사는 유지보수 과정의 누락·변경 감지 장치다. 공격자가 소스와 manifest를 모두
변경하는 상황을 막는 독립 보안 인증이나 권리자의 권원에 대한 증명은 아니다.
업데이트 시에는 글꼴과 고지, 공식 출처를 함께 검토하고 기록된 해시를 갱신해야 한다.

## 외부 AI 교차 검토

사용자의 요청에 따라 AGY CLI에 `gemini-3.8-flash-high`, high effort를 지정해 검토를 진행했다.
공식 원문, 현재 사용 방식, 구현 코드와 검사 결과를 제공하고 반론을 요청했다.
AGY는 제공된 자료만 검토했으며 직접 브라우저나 파일을 검사한 것은 아니다.

1. 최초 답변의 ‘완벽하게 충족’, ‘원천 차단’ 및 근거 없는 ‘양도 금지’ 표현을 재검토하도록 요청했다.
   후속 답변에서 이를 철회·정정했다. 원문이 허용하는 재배포와 금지하는 단독 판매를 구분했다.
2. 추가로 제기한 Pages 경로 우려는 이미 상대 경로와 `/pdflistener/` 실제 테스트로 확인한 사항이다.
   저장소 코드와 OFL 글꼴의 라이선스 범위는 README와 공개 안내에서 명시적으로 구분했다.
3. manifest까지 함께 변경되는 공격의 탐지는 이번 해시 검증의 보장 범위가 아님을 기록했다.
   고지 파일명 중복이나 해시를 별도 환경 변수에 보관하는 방안은 필수 의무로 취급하지 않았다.

추가 경로 코드와 고지 문구를 전달한 세 번째 검토에서, AGY는 제공된 자료 범위에
확인된 구체적인 필수 수정이 남아 있지 않다고 답했다. 공개 배포 파일 검증은 별도로 수행한다.

Claude CLI에도 동일한 원문 자료로 검토를 요청했으나 OAuth 로그인 만료 오류가 반환되었다.
Claude의 검토 결과는 아직 없으며, 로그인 복구 후 추가 검토가 필요하다.
AI 답변 수나 합의는 법률적 보증이 아니다. 최종 판단의 근거는 공식 조건과 실제 배포 구성이다.
이번 범위에서 발견한 고지 의무는 반영했지만 향후 모든 관할권에서의 분쟁 부재를 보증하지 않는다.
