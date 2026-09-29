# PDF Listener website

PDF Listener의 한국어·영어 홍보 사이트입니다. 이 폴더 자체가 별도 Git 저장소이며,
앱 프로젝트나 음성 모델 없이 독립적으로 빌드됩니다. 현재 앱 다운로드는 **준비 중**으로 표시됩니다.

## 로컬에서 보기

Node.js 22.12 이상이 필요합니다. 앱을 실행하는 명령과 달리 **`site` 폴더 안에서** 실행합니다.

```sh
cd site
npm start
```

다른 위치에 복제했다면 해당 저장소 폴더에서 `npm start`를 실행하세요.
브라우저에서 <http://127.0.0.1:4173>을 열면 됩니다. 한국어 페이지는 `/ko/`입니다.
빌드와 미리보기에는 npm 패키지 설치가 필요하지 않습니다. 수정 후 서버를 재시작하면 다시 빌드합니다.
4173 포트가 사용 중이면 `PORT=4174 npm start`를 사용할 수 있습니다.

## GitHub Pages에 게시하기

설정된 저장소: <https://github.com/TaeWoon-Kang/pdflistener>

예정 사이트 주소: <https://taewoon-kang.github.io/pdflistener/>

1. 이 저장소의 `main` 브랜치를 GitHub에 올립니다. 앱 상위 폴더는 포함하지 않습니다.
2. 저장소의 **Settings → Pages → Build and deployment → Source**에서 **GitHub Actions**를 선택합니다.
3. **Actions → Verify and publish website → Run workflow**에서 `main`을 선택합니다.
4. 빌드·링크·브라우저 검사가 통과한 파일만 GitHub Pages에 배포됩니다.

일반 push와 pull request에서는 검사만 실행합니다. 사이트 게시 및 업데이트는 위 워크플로를
직접 실행할 때 이루어집니다. `github-pages` 환경에 승인 규칙을 설정했다면 그 규칙도 적용됩니다.
실패한 실행에서는 기존 사이트를 교체하지 않습니다. 되돌리려면 이전 변경을 `git revert`로 복구한 뒤
워크플로를 다시 실행합니다.

GitHub 공식 문서: [Pages 사용자 지정 워크플로](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## 나중에 앱 다운로드 연결하기

공개 정보는 [`site.config.mjs`](site.config.mjs)에 모았습니다.
Developer ID 인증서, 개인 키, 암호는 이 파일이나 사이트 저장소에 넣지 마세요.
인증서는 앱 서명 환경에서 사용하며, 사이트에는 검증 결과와 공개 링크만 입력합니다.

앱의 서명·공증과 남은 배포 라이선스/대응 소스 검토를 실제로 완료한 뒤:

1. 앱 ZIP, 해당 배포본의 대응 소스, 앱 이용 조건을 공개할 위치를 준비합니다.
2. `version`, `downloadUrl`, `sourceUrl`, `termsUrl`, 앱 ZIP의 `sha256`을 입력합니다.
3. 완료한 검증에 맞춰 `developerIDSigned`, `notarized`, `licenseReviewComplete`를 `true`로 바꿉니다.
4. 마지막으로 `publicReady`를 `true`로 바꾸고 테스트합니다.
5. `src/content.mjs`의 지원 환경, 상태 확인 날짜, 스크린샷 설명을 해당 버전에 맞게 검토합니다.

필수 값이 빠지면 빌드가 실패합니다. 이는 설정 누락 방지 장치이며 실제 서명·공증·법적 의무의
충족 여부를 검증해 주는 기능은 아닙니다. 사이트의 라이선스 안내도 전체 앱의 라이선스 목록을 대신하지 않습니다.
공개 전환 시 다운로드 버튼, FAQ, 배포 상태와 소스 안내가 두 언어 모두 바뀝니다.

앱 ZIP과 모델은 `assets/`에 넣지 마세요. 앱 파일은 향후 GitHub Releases 등의 다운로드 URL로
연결하고, Pages에는 `dist/`의 정적 사이트만 올립니다.
[GitHub Pages는 게시 사이트 용량을 1GB로 제한하며 상업적 이용에도 제한이 있습니다.](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
추후 유료 판매·결제 기능을 도입할 때는 호스팅 조건을 다시 확인하세요.

## 검사

```sh
npm ci --ignore-scripts
npm test
CHROME_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npm run test:browser
```

Chrome이 없다면 Playwright Chromium을 설치해서 검사할 수 있습니다.

```sh
npx --no-install playwright-core install chromium
npm run test:browser
```

단위 검사는 링크·정적 파일·음성 샘플·다운로드 설정·미리보기 서버를 확인합니다.
브라우저 검사는 영문/한글, 320–1440px 화면, 키보드, 접근성, 실제 샘플 재생, 문장 이동,
언어 전환과 JavaScript 없는 탐색을 확인합니다. 결과와 스크린샷은 `test-results/`에 저장됩니다.
브라우저 자동 검사는 실제 iPhone/Safari 사용성 검사나 앱 전체의 배포 검증을 대체하지 않습니다.

## 구조와 자료

- `src/content.mjs`: 한국어/영어 문구
- `src/template.mjs`: 정적 HTML 생성
- `src/site.css`, `src/site.js`: 반응형 화면 및 샘플 플레이어
- `assets/`: 기존 앱 아이콘, 실제 앱 화면, 직접 작성한 예문의 실제 Kokoro Heart 음성
- `tools/`: Node 기본 모듈 기반 빌드/로컬 서버, 선택적 공유 이미지 생성 도구
- `dist/`: 배포 산출물. 빌드 때 새로 생성하며 Git에 포함하지 않습니다.

사이트는 외부 폰트·방문 분석·PDF 업로드를 사용하지 않습니다.
논문 모드 버튼은 제외 항목을 시각적으로 설명하는 예시이며 녹음된 음성은 바뀌지 않습니다.
앱 자체의 배포 라이선스는 미정입니다. 이 저장소에도 임의로 MIT 라이선스를 부여하지 않았습니다.
테스트용 `axe-core`(MPL-2.0), `playwright-core`(Apache-2.0)는 배포 결과물에 포함되지 않습니다.

## English

A standalone English/Korean promotional website for PDF Listener. Run `npm start` in this
repository and open <http://127.0.0.1:4173>. No runtime packages or external services are needed.
Run `npm ci --ignore-scripts`, `npm test`, and `npm run test:browser` to verify it (install Chromium
or set `CHROME_PATH` first). Every push to `main` and pull request runs verification; a manual
**Verify and publish website** workflow run on `main` publishes to GitHub Pages after checks pass.

The app download remains unavailable while signing, notarization and distribution-license review
are pending. Public URLs and release flags live in `site.config.mjs`; never add signing secrets.
The recorded demo is original English text synthesized with the actual app. The paper-mode toggle
illustrates filtering without changing the recording. Neither model weights nor app binaries are shipped here.
