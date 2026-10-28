// 먹기(클릭/꾹 누르기/스페이스바), 화면 갱신, 게임 루프.

const ddong = document.querySelector("div#content");
const ddongSvg = ddong.querySelector("svg");
let holdTimer = null;
let holdX = 0;
let holdY = 0;
let rainAcc = 0;

function eat(x, y) {
    const power = clickPower();
    gain(power);
    state.clicks++;
    floatText(`+${fmt(power)}`, x, y, power > basePower());
    showScoop();
    ddongSvg.animate([{ transform: "scale(1.06, 0.9)" }, { transform: "none" }], 120);

    if (!feverOn()) {
        boost.heat += 3;
        if (boost.heat >= 100) {
            boost.heat = 0;
            boost.feverUntil = Date.now() + FEVER_TIME;
            state.fevers++;
            toast(`🔥 피버 타임! ${FEVER_TIME / 1000}초간 한 입 ×${FEVER_MULT}!`);
        }
    }
}

// 누르고 있는 동안 HOLD_RATE 속도로 계속 먹는다
function startHold(x, y) {
    holdX = x;
    holdY = y;
    if (holdTimer) return;
    eat(holdX, holdY);
    holdTimer = setInterval(() => eat(holdX, holdY), 1000 / HOLD_RATE);
}

function stopHold() {
    clearInterval(holdTimer);
    holdTimer = null;
}

ddong.addEventListener("pointerdown", (e) => startHold(e.clientX, e.clientY));
ddong.addEventListener("pointermove", (e) => {
    holdX = e.clientX;
    holdY = e.clientY;
});
document.addEventListener("pointerup", stopHold);
document.addEventListener("pointercancel", stopHold);
ddong.addEventListener("pointerleave", stopHold);

document.addEventListener("keydown", (e) => {
    if (e.code !== "Space") return;
    e.preventDefault();
    const rect = ddongSvg.getBoundingClientRect();
    startHold(rect.left + rect.width / 2, rect.top + rect.height / 3);
});
document.addEventListener("keyup", (e) => {
    if (e.code === "Space") stopHold();
});

function render() {
    document.querySelector("span#count").textContent = fmt(state.total);
    document.querySelector("#points").textContent = fmt(state.points);
    document.querySelector("#per-click").textContent = fmt(clickPower());
    document.querySelector("#per-sec").textContent = fmt(perSecond());
    document.querySelector("#mult").textContent = `×${fmt(evolution().mult)}`;
    updateShop();

    const fever = document.querySelector("div#fever");
    const bar = document.querySelector("div#fever-bar");
    const label = document.querySelector("span#fever-label");
    const left = boost.feverUntil - Date.now();
    fever.classList.toggle("on", left > 0);
    if (left > 0) {
        bar.style.width = `${(left / FEVER_TIME) * 100}%`;
        label.textContent = `🔥 피버! 한 입 ×${FEVER_MULT} (${Math.ceil(left / 1000)}초)`;
    } else {
        bar.style.width = `${boost.heat}%`;
        label.textContent = frenzyOn() ? `🌟 황금 광란! 한 입 ×${FRENZY_MULT}` : "계속 먹으면 피버 게이지가 차요!";
    }
    document.title = `💩 ${fmt(state.total)} - Ddong`;
}

let last = performance.now();
let slowTimer = 0;

function tick(now) {
    const dt = Math.min((now - last) / 1000, 1);
    last = now;

    gain(perSecond() * dt);
    boost.heat = Math.max(0, boost.heat - 10 * dt);

    rainAcc += Math.min(perSecond() / (30 * evolution().mult), 3) * dt;
    while (rainAcc >= 1) {
        rainAcc--;
        dropRain();
    }

    if (evolution().filter === null) ddong.style.filter = `hue-rotate(${(now / 8) % 360}deg) saturate(2)`;

    render();
    slowTimer += dt;
    if (slowTimer > 0.5) {
        slowTimer = 0;
        checkAchievements();
    }
    requestAnimationFrame(tick);
}

document.querySelector("button#reset").addEventListener("click", () => {
    if (!confirm("정말 모든 똥 기록을 지울까요?")) return;
    try {
        localStorage.removeItem(SAVE_KEY);
    } catch {}
    window.onbeforeunload = null;
    location.reload();
});

load();
const away = Math.min((Date.now() - state.savedAt) / 1000, OFFLINE_LIMIT);
if (away > 10 && perSecond() > 0) {
    const earned = perSecond() * away;
    gain(earned);
    toast(`😴 자리 비운 동안 알바들이 똥 ${fmt(earned)}개를 먹었어요!`);
}
buildShop();
applyEvolution();
renderWorkers();
plantFlowers();
checkAchievements();
requestAnimationFrame(tick);
setInterval(save, 5000);
window.onbeforeunload = save;
setTimeout(spawnGolden, 8000 + Math.random() * 10000);
