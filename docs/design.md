# Design and acceptance

An English/Korean promotional website for PDF Listener, independent of the app.
References: the existing white/tan headphone icon and actual dark desktop screen.
Use those assets and product behavior as evidence; no borrowed third-party design.

Visual direction: warm paper, dark ink, muted brown, editorial serif English headlines, modern Pretendard Korean headings,
fine rules and restrained corners. A dark interactive reader illustrates the
product. An actual desktop screenshot is clearly distinguished from that demo.
The primary action is listening to an original English sample. No fabricated
testimonials, performance figures, launch dates or download links.

English and Korean have separate static URLs, titles, descriptions and hreflang.
Pages must remain useful without JavaScript. Assets are self-hosted. Korean h1/h2
use original Pretendard SemiBold (OFL-1.1); other text uses device-installed fonts.
Keep the original font and complete notices together with pinned provenance.
No signup, file upload, analytics, external embeds or server API is needed.

At 320, 390, 768, 1024 and 1440px: no horizontal overflow, keyboard-accessible
controls, readable content, 44px touch controls, reduced-motion support.
Demonstration paper-mode filtering is illustrative; the audio is a real local
Kokoro Heart output from original text, not speech generated in the website.

Keep app support accurate: Apple Silicon, macOS 26+, English speech, Korean/
English UI, selectable-text PDFs up to 50MB. Automatic exclusions need review.
Public app download remains unavailable until release conditions are completed.
Developer ID credentials belong to the future app-signing workflow, never here.

Validation: build and link/resource checks, release-configuration checks,
two-language real-Chrome checks, sample playback/seeking, paper toggle, FAQ,
mobile and keyboard checks. GitHub Actions checks future pushes/PRs; publishing
is a separate manually triggered Pages job following successful checks.
