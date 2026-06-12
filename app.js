const TIMER_OPTIONS = [38, 50, 60, 100];
const app = document.getElementById("app");

const state = {
  selectedDuration: null,
  startedAt: null,
  intervalId: null,
  elapsedMs: 0,
};

function goMain() {
  stopTicker();
  state.selectedDuration = null;
  state.startedAt = null;
  state.elapsedMs = 0;
  render();
}

function startTimer(duration) {
  state.selectedDuration = duration;
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

  const nextDuration = Math.max(1, state.selectedDuration + deltaSeconds);

  state.selectedDuration = nextDuration;
  state.startedAt = Date.now();
  state.elapsedMs = 0;
  startTicker();
  render();
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
  app.innerHTML = `
    <section class="screen main-screen">
      <div class="main-panel">
        <div class="title-area">
          <h1>크로버 반복 타이머</h1>
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
  const durationMs = state.selectedDuration * 1000;
  const elapsedSeconds = Math.floor(state.elapsedMs / 1000);
  const isFlashing =
    state.elapsedMs >= durationMs - 3000 && state.elapsedMs < durationMs;

  app.innerHTML = `
    <section class="screen timer-screen ${isFlashing ? "flash" : ""}" data-timer-screen>
      <button class="main-button" type="button" data-main-button>MAIN</button>
      <div class="adjust-panel" aria-label="타이머 조정">
        <button class="adjust-button" type="button" data-adjust="-10">-10</button>
        <button class="adjust-button" type="button" data-adjust="-1">-1</button>
        <button class="adjust-button" type="button" data-adjust="+1">+1</button>
        <button class="adjust-button" type="button" data-adjust="+10">+10</button>
      </div>
      <button class="timer-face" type="button" data-reset-area>
        <div class="countdown" data-countdown>${elapsedSeconds}</div>
        <div class="unit">초</div>
        <div class="status">${state.selectedDuration}초 반복 중</div>
        <div class="hint">화면을 터치하면 처음부터 다시 시작됩니다</div>
      </button>
    </section>
  `;

  const mainButton = app.querySelector("[data-main-button]");
  const resetArea = app.querySelector("[data-reset-area]");
  const adjustButtons = app.querySelectorAll("[data-adjust]");

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
}

function render() {
  if (state.selectedDuration === null) {
    renderMain();
    return;
  }

  renderTimer();
}

render();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      return null;
    });
  });
}