// 화면 연출: 떠오르는 숫자, 알림, 배경, 황금똥.

function floatText(text, x, y, big) {
    const el = document.createElement("div");
    el.className = big ? "float big" : "float";
    el.textContent = text;
    el.style.left = `${x - 20 + Math.random() * 40}px`;
    el.style.top = `${y - 30}px`;
    document.body.append(el);
    setTimeout(() => el.remove(), 1000);
}

function toast(text) {
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = text;
    document.querySelector("div#toasts").append(el);
    setTimeout(() => el.remove(), 3500);
}

function applyEvolution() {
    const evo = evolution();
    const ddong = document.querySelector("div#content");
    if (evo.filter !== null) ddong.style.filter = evo.filter;
    ddong.style.scale = evo.size;
    document.querySelector("span#accessory").textContent = evo.accessory;
}

function plantFlowers() {
    const box = document.querySelector("div#flowers");
    for (let i = 0; i < 18; i++) {
        const el = document.createElement("span");
        el.textContent = ["🌼", "🌷", "🌱", "🍄", "🌸"][i % 5];
        el.style.left = `${Math.random() * 95}%`;
        el.style.bottom = `${Math.random() * 70}%`;
        box.append(el);
    }
}

function dropRain() {
    const el = document.createElement("span");
    el.textContent = "💩";
    el.style.left = `${Math.random() * 100}vw`;
    el.style.fontSize = `${14 + Math.random() * 16}px`;
    el.style.animationDuration = `${3 + Math.random() * 3}s`;
    document.querySelector("div#rain").append(el);
    setTimeout(() => el.remove(), 6000);
}

function spawnGolden() {
    const el = document.createElement("div");
    el.className = "golden";
    el.textContent = "💩";
    el.style.left = `${10 + Math.random() * 55}vw`;
    el.style.top = `${15 + Math.random() * 60}vh`;
    el.addEventListener("pointerdown", (e) => {
        e.stopPropagation();
        state.goldens++;
        if (Math.random() < 0.5) {
            const bonus = Math.max(500, perSecond() * 120, basePower() * 200);
            gain(bonus);
            floatText(`+${fmt(bonus)}`, e.clientX, e.clientY, true);
            toast("🌟 황금똥! 똥 폭풍 보너스!");
        } else {
            boost.frenzyUntil = Date.now() + FRENZY_TIME;
            toast(`🌟 황금똥! ${FRENZY_TIME / 1000}초간 한 입 ×${FRENZY_MULT}!`);
        }
        el.remove();
    });
    document.body.append(el);
    setTimeout(() => el.remove(), 10000);
    setTimeout(spawnGolden, 15000 + Math.random() * 25000);
}
