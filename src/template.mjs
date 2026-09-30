import { content } from "./content.mjs";
export const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const arrow = '<span aria-hidden="true">↗</span>';
const components = [
  ["pdfminer.six", "MIT", "https://github.com/pdfminer/pdfminer.six"],
  [
    "Speechify string-tracker",
    "MIT",
    "https://github.com/SpeechifyInc/string-tracker",
  ],
  ["Misaki", "Apache-2.0", "https://github.com/hexgrad/misaki"],
  [
    "Kokoro-82M",
    "Apache-2.0 model notices",
    "https://huggingface.co/hexgrad/Kokoro-82M",
  ],
  [
    "MLX / MLX-Audio",
    "MIT + third-party notices",
    "https://github.com/ml-explore/mlx",
  ],
  [
    "ONNX Runtime",
    "MIT + third-party notices",
    "https://github.com/microsoft/onnxruntime",
  ],
  [
    "Electron",
    "MIT + nested component licenses",
    "https://github.com/electron/electron",
  ],
  ["FFmpeg", "LGPL-2.1-or-later", "https://ffmpeg.org/legal.html"],
  [
    "Chromium",
    "BSD / MIT / MPL and other notices",
    "https://www.chromium.org/",
  ],
  ["OpenSSL", "Apache-2.0", "https://github.com/openssl/openssl"],
];

export function render(lang, legal, config, sample) {
  const t = { ...content[lang] };
  if (config.release.publicReady) {
    t.releaseCopy = t.publishedCopy;
    t.legalSources = t.publishedSources;
    t.faqs = t.faqs.map(([question, answer], index) => [
      question,
      index === t.faqs.length - 1 ? t.publishedFAQ : answer,
    ]);
  }
  const depth = (lang === "ko" ? 1 : 0) + (legal ? 1 : 0);
  const root = "../".repeat(depth) || "./";
  const home = legal ? "../" : "./";
  const routes = {
    en: legal ? "licenses/" : "",
    ko: legal ? "ko/licenses/" : "ko/",
  };
  const canonical = new URL(routes[lang], config.url).href;
  const languageLinks = `<div class="languages" aria-label="${t.language}">${["en", "ko"].map((l) => `<a href="${root + routes[l]}" lang="${l}" hreflang="${l}" ${l === lang ? 'aria-current="page"' : ""}>${l === "en" ? "EN" : "한국어"}</a>`).join("")}</div>`;
  const brand = `<a class="brand" href="${home}" aria-label="PDF Listener"><img src="${root}assets/icon.png" alt="" width="40" height="40">PDF Listener<span class="brand-platform">/ Mac</span></a>`;
  const releaseAction = config.release.publicReady
    ? `<a class="button primary" href="${escape(config.release.downloadUrl)}">${t.download} ${arrow}</a><p class="release-links"><a href="${escape(config.release.sourceUrl)}">${t.sourceDownload}</a> · <a href="${escape(config.release.termsUrl)}">${t.terms}</a></p><p class="release-detail">${t.ffmpegNotice}</p><details class="checksum-details"><summary>${t.checksumToggle}<span aria-hidden="true">+</span></summary><p class="checksum">SHA-256: ${escape(config.release.sha256)}</p></details>`
    : `<p class="release-pending"><span aria-hidden="true"></span>${t.pending}</p><p class="release-detail">${t.releaseDetail}</p>`;
  const demo = `<div class="reader" id="listen" aria-labelledby="demo-title">
    <div class="reader-chrome"><span class="traffic" aria-hidden="true"><i></i><i></i><i></i></span><span>${t.demoFile}</span><span class="reader-mark" aria-hidden="true">◧</span></div>
    <div class="reader-body"><div class="reader-heading"><p class="eyebrow">${t.demoLabel}</p><button class="paper-toggle" id="paper-mode" type="button" aria-pressed="true" data-on="${t.on}" data-off="${t.off}">${t.paperMode}<span>${t.on}</span></button></div>
    <h2 id="demo-title">${t.demoTitle}</h2><p class="sample-hint">${t.sampleLabel}</p>
    <div class="paper-text" lang="en"><p class="excluded" data-excluded hidden>${t.author}</p><h3>${t.demoSection}</h3>
      ${sample.segments.map((s, i) => `<p><button type="button" class="sentence ${i === 0 ? "current" : ""}" data-start="${s.start}" data-end="${s.end}">${escape(s.text)}</button>${i === 0 ? '<span class="excluded" data-excluded hidden> [1, 2]</span>' : ""}</p>`).join("")}
      <p class="excluded caption" data-excluded hidden>${t.caption}</p></div>
    <p id="filter-note" class="filter-note" role="status" data-on="${t.filterOn}" data-off="${t.filterOff}">${t.filterOn}</p>
    <div class="sample-player"><button class="play-button" id="play-sample" type="button" aria-label="${t.play}" data-play="${t.play}" data-pause="${t.pause}"><span class="play-symbol" aria-hidden="true"></span></button>
    <div class="sample-track"><label class="visually-hidden" for="sample-seek">${t.seek}</label><input id="sample-seek" type="range" min="0" max="${sample.duration}" value="0" step="0.1"><div class="track-meta"><span>${t.voice}</span><span id="sample-time">0:00 / ${formatTime(sample.duration)}</span></div></div>
    <label class="speed-control"><span class="visually-hidden">${t.speed}</span><select id="sample-speed"><option value="1">1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></label></div>
    <audio id="sample-audio" preload="none" src="${root}assets/sample.wav"></audio><p class="sample-error" role="alert" hidden>${t.audioError}</p>
    <p class="voice-hint">${t.voiceHint} <a href="${root}assets/sample.wav" download>${t.audioFallback} ↓</a></p></div>
  </div>`;
  const main = legal
    ? `<main id="main" class="legal-main wrap"><a class="text-link" href="../">← ${t.back}</a><p class="eyebrow">PDF LISTENER / ${t.licenses}</p><h1>${t.legalTitle}</h1><p class="lede">${t.legalIntro}</p>
    <section class="legal-status"><h2>${t.legalStatusTitle}</h2><p>${config.release.publicReady ? `${escape(config.release.version)} · ${t.publishedStatus}` : t.legalStatus}</p>${config.release.publicReady ? releaseAction : ""}<p class="muted">${t.checked}</p></section>
    <section><h2>${t.legalComponents}</h2><div class="table-wrap"><table><thead><tr><th scope="col">${t.component}</th><th scope="col">${t.license}</th></tr></thead><tbody>${components.map(([name, license, url]) => `<tr><td><a href="${url}">${name} ${arrow}</a></td><td>${lang === "ko" ? license.replace("model notices", "모델 고지").replace("third-party notices", "제3자 고지").replace("nested component licenses", "포함 구성요소별 라이선스").replace("and other notices", "및 기타 고지") : license}</td></tr>`).join("")}</tbody></table></div><p class="muted">${t.legalScope}</p></section>
    <section><h2>${t.legalSourcesTitle}</h2><p>${t.legalSources}</p></section><section><h2>${t.legalSiteTitle}</h2><p>${t.legalSite}</p></section><section id="website-fonts"><h2>${t.legalFontsTitle}</h2><p>${t.legalFonts}</p><p><a href="${root}assets/fonts/OFL-Pretendard.txt">${t.fontLicense}</a><br><a href="https://github.com/orioncactus/pretendard">${t.fontSource} ${arrow}</a><br><a href="${root}assets/fonts/provenance.json">${t.fontProvenance}</a></p></section></main>`
    : `<main id="main">
    <section class="hero wrap"><div class="hero-copy"><p class="eyebrow">PDF LISTENER <span>/</span> FOR MAC</p><h1>${t.headline}</h1><p class="hero-intro">${t.intro}</p><div class="hero-actions"><a class="button primary" data-listen href="#listen"><span aria-hidden="true">▷</span>${t.cta}</a><a class="text-link" href="#release">${t.secondary} ${arrow}</a></div><p class="compatibility">${t.requirements}<br><span>${t.speechNote}</span></p><div class="hero-note"><span class="small-wave" aria-hidden="true">${[8, 18, 28, 14, 24, 34, 17, 10].map((h) => `<i class="bar-${h}"></i>`).join("")}</span>${t.eyebrow}</div></div>${demo}</section>
    <div class="benefits wrap">${t.benefitLabels.map((x, i) => `<div><span class="benefit-number">0${i + 1}</span><div><h2>${x}</h2><p>${t.benefitDescriptions[i]}</p></div></div>`).join("")}</div>
    <section class="focus-section wrap section" id="features"><div class="section-intro"><p class="eyebrow">${t.focusKicker}</p><h2>${t.focusTitle}</h2><p>${t.focusIntro}</p></div><ol class="feature-list">${t.focusItems.map(([title, body], i) => `<li><span class="feature-number">0${i + 1}</span><div><h3>${title}</h3><p>${body}</p></div></li>`).join("")}</ol></section>
    <section class="screen-section section"><div class="wrap"><div class="screen-heading"><div><p class="eyebrow">${t.screenKicker}</p><h2>${t.screenTitle}</h2></div><p>${t.screenCopy}</p></div><figure class="app-shot"><img src="${root}assets/app-preview.png" alt="${t.screenshotAlt}" width="2200" height="1640" loading="lazy"><figcaption>${t.screenshotCaption}</figcaption></figure></div></section>
    <section class="local-section wrap section"><div class="local-art" aria-hidden="true"><div class="local-orbit"></div><div class="local-orbit second"></div><div class="local-icon"><img src="${root}assets/icon.png" width="120" height="120" alt=""></div><span class="local-caption">PDF → VOICE<br><strong>ON YOUR MAC</strong></span></div><div><p class="eyebrow">${t.localKicker}</p><h2>${t.localTitle}</h2><p>${t.localCopy}</p><ul class="check-list">${t.localItems.map((x) => `<li><span aria-hidden="true">✓</span>${x}</li>`).join("")}</ul></div></section>
    <section class="workflow wrap section"><h2>${t.workflowTitle}</h2><ol>${t.steps.map(([a, b], i) => `<li><span class="step-number">0${i + 1}</span><h3>${a}</h3><p>${b}</p></li>`).join("")}</ol></section>
    <section class="faq-section wrap section" id="faq"><div><p class="eyebrow">FAQ</p><h2>${t.faqTitle}</h2></div><div class="faqs">${t.faqs.map(([q, a], i) => `<details${i === 0 ? " open" : ""}><summary>${q}<span aria-hidden="true">+</span></summary><p>${a}</p></details>`).join("")}</div></section>
    <section class="release-section" id="release"><div class="wrap release-inner"><img src="${root}assets/icon.png" width="72" height="72" alt=""><p class="eyebrow">${t.releaseKicker}</p><h2>${t.releaseTitle}</h2><p>${t.releaseCopy}</p>${releaseAction}<a class="button secondary" href="${escape(config.repository)}">${t.github} ${arrow}</a><p class="compatibility">${t.requirements}</p></div></section>
    </main>`;
  return `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><meta name="theme-color" content="#f7f5f0">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self'; media-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'">
<title>${legal ? `${t.licenses} — PDF Listener` : t.title}</title><meta name="description" content="${escape(legal ? t.legalIntro : t.description)}"><link rel="canonical" href="${canonical}">
${["en", "ko"].map((l) => `<link rel="alternate" hreflang="${l}" href="${new URL(routes[l], config.url).href}">`).join("")}<link rel="alternate" hreflang="x-default" href="${new URL(routes.en, config.url).href}">
<meta property="og:type" content="website"><meta property="og:title" content="${escape(legal ? t.licenses : t.title)}"><meta property="og:description" content="${escape(legal ? t.legalIntro : t.description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${new URL("assets/share.png", config.url).href}"><meta property="og:locale" content="${lang === "ko" ? "ko_KR" : "en_US"}"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${root}assets/icon.png"><link rel="stylesheet" href="${root}assets/site.css"><script src="${root}assets/site.js" defer></script></head>
<body><a class="skip-link" href="#main">${t.skip}</a><header class="site-header"><div class="wrap header-inner">${brand}<nav aria-label="${lang === "ko" ? "주요 메뉴" : "Main navigation"}"><a href="${home}#features">${t.features}</a><a href="${home}#listen">${t.experience}</a><a href="${home}#release">${t.release}</a></nav>${languageLinks}</div></header>${main}
<footer class="wrap footer"><div>${brand}<p>${t.footer}</p></div><div class="footer-links"><a href="${legal ? "./" : "./licenses/"}">${t.licenses}</a><a href="${escape(config.repository)}">GitHub ${arrow}</a><a href="#">${t.top} ↑</a></div><p class="footer-note">PDF Listener · ${t.speechNote}</p></footer></body></html>`;
}
function formatTime(seconds) {
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}
