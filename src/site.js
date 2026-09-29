const audio = document.querySelector("#sample-audio");
if (audio) {
  const play = document.querySelector("#play-sample");
  const seek = document.querySelector("#sample-seek");
  const time = document.querySelector("#sample-time");
  const error = document.querySelector(".sample-error");
  const reader = document.querySelector(".reader");
  const sentences = [...document.querySelectorAll(".sentence")];
  const format = (seconds) =>
    `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
  let intent = 0;
  async function start(at) {
    const request = ++intent;
    error.hidden = true;
    try {
      if (Number.isFinite(audio.duration) && at !== undefined)
        audio.currentTime = at;
      await audio.play();
      if (request === intent && at !== undefined) audio.currentTime = at;
    } catch (e) {
      if (e.name !== "AbortError" && request === intent) error.hidden = false;
    }
  }
  play.addEventListener("click", () => {
    if (audio.paused) start();
    else {
      intent++;
      audio.pause();
    }
  });
  document
    .querySelector("[data-listen]")
    ?.addEventListener("click", (event) => {
      event.preventDefault();
      reader.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "center",
      });
      play.focus({ preventScroll: true });
      start();
    });
  sentences.forEach((sentence) =>
    sentence.addEventListener("click", () =>
      start(Number(sentence.dataset.start)),
    ),
  );
  for (const event of ["play", "pause", "ended"])
    audio.addEventListener(event, () => {
      play.setAttribute(
        "aria-label",
        audio.paused ? play.dataset.play : play.dataset.pause,
      );
      reader.classList.toggle("playing", !audio.paused);
    });
  audio.addEventListener("error", () => {
    error.hidden = false;
  });
  audio.addEventListener("timeupdate", () => {
    seek.value = String(audio.currentTime);
    time.textContent = `${format(audio.currentTime)} / ${format(Number(seek.max))}`;
    for (const sentence of sentences)
      sentence.classList.toggle(
        "current",
        audio.currentTime >= Number(sentence.dataset.start) &&
          audio.currentTime < Number(sentence.dataset.end),
      );
  });
  seek.addEventListener("input", () => {
    if (Number.isFinite(audio.duration)) audio.currentTime = Number(seek.value);
    else start(Number(seek.value));
  });
  document
    .querySelector("#sample-speed")
    .addEventListener("change", (event) => {
      audio.playbackRate = Number(event.target.value);
    });
  const mode = document.querySelector("#paper-mode"),
    note = document.querySelector("#filter-note");
  mode.addEventListener("click", () => {
    const enabled = mode.getAttribute("aria-pressed") !== "true";
    mode.setAttribute("aria-pressed", String(enabled));
    mode.querySelector("span").textContent = enabled
      ? mode.dataset.on
      : mode.dataset.off;
    document.querySelectorAll("[data-excluded]").forEach((el) => {
      el.hidden = enabled;
    });
    note.textContent = enabled ? note.dataset.on : note.dataset.off;
  });
}
