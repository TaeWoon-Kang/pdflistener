# Website verification

Checked on 2026-10-19 with Node.js 26.3.0 and Google Chrome 155.0.8059.82 on macOS.
CI uses Node.js 24 and the pinned Playwright Chromium on Ubuntu.

## iPhone and iPad launch update

- Apple's public lookup for app ID `6817984584`, in the US and Korean storefronts,
  confirms the free universal iPhone/iPad app, version 1.0, minimum OS 18.0.
  [App Store listing](https://apps.apple.com/app/id6817984584).
- The site now describes Mac, iPhone and iPad availability. Mac requirements remain
  Apple Silicon and macOS 26+; iPhone and iPad require iOS / iPadOS 18+.
- All installation links use the official App Store listing. Historical third-party
  source links remain on the license pages and are explicitly not app installers.
- The existing Mac screenshot is labelled as a version 0.1.1 example, with a note
  that the mobile layout differs. The original share-image composition now lists
  all three platforms. No app binaries, model files or new dependencies were added.
- Mac and mobile component summaries and in-app notice locations are distinguished.
  Mobile entries were checked against the app's bundled voice-engine notices.
  The privacy policy already covers all three platforms and cloud-file downloads.

## Local checks

- All seven Node tests pass: six generated routes, project-subpath links/resources,
  App Store-only installation configuration, matching translation keys, PCM sample,
  deployment allowlist/size, original font and notice integrity (including rejection
  cases), and preview server byte-range and path-isolation behavior.
- Real Chrome integration passes in English and Korean at 320, 390, 768, 1024 and
  1440px, without horizontal page overflow.
- Playback, pause, sentence seeking, speed changes, paper-mode illustration, FAQ,
  language navigation, keyboard skip links and navigation without JavaScript pass.
- axe WCAG 2 A/AA and 2.1 AA checks report zero violations in the tested home,
  license and privacy page states. No console errors, failed requests or external
  page requests were observed.
- Rendered-font checks confirm the original self-hosted Pretendard SemiBold for
  Korean headings. Font bytes and the complete OFL notice remain unchanged.
- English/Korean desktop and mobile screenshots and the share image were visually
  reviewed. `npm audit --audit-level=high` reports zero vulnerabilities.
- Public output: 19 static files, 1,968,507 bytes (about 1.88 MiB), below the 3 MiB
  budget, including the existing original audio sample.

## Scope and repeatability

Run `npm test` and `npm run test:browser` (with a supported Chromium executable).
Ignored `test-results/` contains the current screenshots and machine-readable
browser results. GitHub Actions repeats verification before a manual Pages deploy.

These checks do not certify physical iPhone/Safari behavior, every accessibility
need, voice quality or legal compliance, and do not replace app-release testing.
For the original website font review, see [font review](font-license-review.md).
