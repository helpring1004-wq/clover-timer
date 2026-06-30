const TIMER_OPTIONS = [38, 50, 60, 100];
const app = document.getElementById("app");

const state = {
  selectedDuration: null,
  repeatLabel: null,
  releaseNumber: 1,
  startedAt: null,
  intervalId: null,
  elapsedMs: 0,
};

const MICRO_STEP = 0.1;
const NORMAL_STEP = 1;
const LARGE_STEP = 10;

function goMain() {
  stopTicker();
  state.selectedDuration = null;
  state.repeatLabel = null;
  state.startedAt = null;
  state.elapsedMs = 0;
  render();
}

function startTimer(duration) {
  state.selectedDuration = duration;
  state.repeatLabel = duration.toFixed(1);
  restartTimer();
}

function restartTimer() {
  if (!state.selectedDuration) {
    return;
  }

  state.startedAt = Date.now();
  state.elapsedMs = 0;
  startTicker();
  render();
}

function adjustTimer(deltaSeconds) {
  if (!state.selectedDuration) {
    return;
  }

  const nextDuration = Math.max(0.1, Math.round((state.selectedDuration + deltaSeconds) * 10) / 10);

  state.selectedDuration = nextDuration;
  state.repeatLabel = nextDuration.toFixed(1);
  state.startedAt = Date.now();
  state.elapsedMs = 0;
  startTicker();
  render();
}

function hideReleaseBadge() {
  return;
}

function startTicker() {
  stopTicker();
  updateCountdown();
  state.intervalId = window.setInterval(updateCountdown, 100);
}

function stopTicker() {
  if (state.intervalId !== null) {
    window.clearInterval(state.intervalId);
    state.intervalId = null;
  }
}

function updateCountdown() {
  if (!state.selectedDuration || !state.startedAt) {
    return;
  }

  const durationMs = state.selectedDuration * 1000;
  const elapsedMs = Date.now() - state.startedAt;
  const cycleElapsedMs = elapsedMs % durationMs;

  state.elapsedMs = cycleElapsedMs;

  const countdown = document.querySelector("[data-countdown]");
  const screen = document.querySelector("[data-timer-screen]");

  if (countdown) {
    countdown.textContent = String(Math.floor(cycleElapsedMs / 1000));
  }

  if (screen) {
    screen.classList.toggle(
      "flash",
      cycleElapsedMs >= durationMs - 3000 && cycleElapsedMs < durationMs,
    );
  }
}

function renderMain() {
  document.title = `Clover Timer v${state.releaseNumber}`;
  app.innerHTML = `
    <section class="screen main-screen">
      <div class="main-panel">
        <div class="release-banner">UPDATE v${state.releaseNumber}</div>
        <div class="title-area">
          <h1>Clover 반복 타이머</h1>
          <p>시간을 터치하면 바로 시작됩니다</p>
        </div>
        <div class="timer-grid">
          ${TIMER_OPTIONS.map(
            (seconds) => `
              <button class="timer-option" type="button" data-duration="${seconds}">
                ${seconds}초
              </button>
            `,
          ).join("")}
        </div>
      </div>
    </section>
  `;

  app.querySelectorAll("[data-duration]").forEach((button) => {
    button.addEventListener("pointerdown", () => {
      const duration = Number(button.getAttribute("data-duration"));
      startTimer(duration);
    });
  });
}

function renderTimer() {
  document.title = `Clover Timer v${state.releaseNumber}`;
  const durationMs = state.selectedDuration * 1000;
  const displaySeconds = Math.floor(state.elapsedMs / 1000);
  const isFlashing = state.elapsedMs >= durationMs - 3000 && state.elapsedMs < durationMs;

  app.innerHTML = `
    <section class="screen timer-screen ${isFlashing ? "flash" : ""}" data-timer-screen>
      <button class="main-button" type="button" data-main-button>MAIN</button>
      <div class="release-badge">UPDATE v${state.releaseNumber}</div>
      <div class="adjust-panel" aria-label="타이머 조정">
        <div class="adjust-group" aria-label="미세조정">
          <button class="adjust-button micro" type="button" data-adjust="${-MICRO_STEP}">-0.1</button>
          <button class="adjust-button micro" type="button" data-adjust="${MICRO_STEP}">+0.1</button>
        </div>
        <div class="adjust-group" aria-label="기본조정">
          <button class="adjust-button" type="button" data-adjust="${-NORMAL_STEP}">-1</button>
          <button class="adjust-button" type="button" data-adjust="${NORMAL_STEP}">+1</button>
        </div>
        <div class="adjust-group" aria-label="대폭조정">
          <button class="adjust-button" type="button" data-adjust="${-LARGE_STEP}">-10</button>
          <button class="adjust-button" type="button" data-adjust="${LARGE_STEP}">+10</button>
        </div>
      </div>
      <button class="timer-face" type="button" data-reset-area>
        <div class="countdown" data-countdown>${displaySeconds}</div>
        <div class="unit">초</div>
        <div class="status">${state.repeatLabel ?? state.selectedDuration.toFixed(1)}초 반복 중</div>
        <div class="hint">화면을 터치하면 처음부터 다시 시작됩니다</div>
      </button>
    </section>
  `;

  const mainButton = app.querySelector("[data-main-button]");
  const resetArea = app.querySelector("[data-reset-area]");
  const adjustButtons = app.querySelectorAll("[data-adjust]");
  const releaseBadge = app.querySelector(".release-badge");

  mainButton.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
    goMain();
  });

  resetArea.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
    restartTimer();
  });

  adjustButtons.forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
      adjustTimer(Number(button.getAttribute("data-adjust")));
    });
  });

  if (releaseBadge) {
    releaseBadge.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
    });
  }
}

function render() {
  if (state.selectedDuration === null) {
    renderMain();
    return;
  }

  renderTimer();
}

render();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
    if ("caches" in window) {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((key) => caches.delete(key)));
    }
  });
}