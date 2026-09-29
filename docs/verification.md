# Website verification

Checked on 2026-09-29 with Node.js 26.3.0 and Google Chrome 154.0.8037.57 on macOS.
The CI workflow uses Node.js 24 and Playwright's pinned Chromium on Ubuntu.

Local results:

- Seven Node tests pass: four generated pages, links at a `/pdflistener/` project prefix,
  release configuration, complete translation keys, PCM audio, public-release copy,
  deployment allowlist, original font/notice integrity with negative cases, and the local server's byte-range/path isolation behavior.
- Real Chrome integration passes for English and Korean at 320, 390, 768, 1024 and
  1440px, with no horizontal page overflow.
- Playback, pause, jumping to a sentence, speed changes, paper-mode illustration,
  FAQ, language links, skip-to-content keyboard navigation and navigation without
  JavaScript pass.
- axe WCAG 2 A/AA and 2.1 AA checks report zero violations in tested states:
  both home pages at 390/1440px and both license pages at 320px.
- No application console errors, failed local requests or external page requests
  were observed in the integration test.
- Chrome’s rendered-font inspection confirms `Pretendard SemiBold`, `isCustomFont: true`,
  for every glyph in the requested Korean feature heading and the Korean legal heading.
  The original WOFF2 and complete OFL notice match pinned upstream bytes.
- Desktop/mobile screenshots were visually reviewed after the Korean typography change. The capture helper waits
  for fonts, the lazy app screenshot and a paint before capturing a full page;
  this fixed stale/repeated compositor content seen in an initial Chrome capture.
- `npm audit --audit-level=high` reports zero vulnerabilities for the two pinned
  development packages. Neither package is copied into the public output.
- Output is 17 static files, about 1.95MB including the 16.9-second WAV sample.
  The WAV uses original example text, rendered by the existing app with Kokoro Heart.

The checked product baseline is PDF Listener 0.1.1: Apple Silicon, macOS 26+,
English speech, local processing, and no public-distribution clearance yet.
The current app manifest reports ad-hoc signing, no notarization and
`publicDistributionReady: false`. The site reflects that status. Changing site
configuration cannot complete the app's signing or license verification.

Scope limits: automated browser checks do not certify every accessibility need,
physical iPhone/Safari behavior, voice quality or legal compliance. Website tests
do not repeat or replace the app's PDF/speech/runtime/source-coverage audits.
Screenshot and machine-readable results are generated in ignored `test-results/`
and are uploaded as verification artifacts by GitHub Actions.
