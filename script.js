const counter = document.querySelector("span#count");
const ddong = document.querySelector("div#content");
const spoon = document.querySelector("svg#spoon");
const scoop = document.querySelector("g#scoop");
let scoopTimer;

const SAVE_KEY = "ddong-save-v1";

const CLICK_UPGRADES = [
    { id: "bigspoon", name: "왕숟가락", icon: "🥄", desc: "클릭당 +1", power: 1, base: 15 },
    { id: "ladle", name: "국자", icon: "🍲", desc: "클릭당 +5", power: 5, base: 250 },
    { id: "shovel", name: "삽", icon: "🪏", desc: "클릭당 +30", power: 30, base: 4000 },
    { id: "excavator", name: "포크레인", icon: "🚜", desc: "클릭당 +200", power: 200, base: 60000 },
    { id: "blackhole", name: "블랙홀 입", icon: "🕳️", desc: "클릭당 +1500", power: 1500, base: 1500000 },
];

const WORKERS = [
    { id: "alba", name: "똥 먹는 알바", icon: "🧑", desc: "시급 받고 똥 먹음 · 초당 1개", rate: 1, base: 50 },
    { id: "dog", name: "똥개", icon: "🐶", desc: "원래 좋아함 · 초당 6개", rate: 6, base: 700 },
    { id: "fly", name: "똥파리 군단", icon: "🪰", desc: "윙윙 · 초당 35개", rate: 35, base: 9000 },
    { id: "youtuber", name: "똥 먹방 유튜버", icon: "📹", desc: "구독 좋아요 · 초당 200개", rate: 200, base: 120000 },
    { id: "factory", name: "똥 먹는 공장", icon: "🏭", desc: "24시간 가동 · 초당 1200개", rate: 1200, base: 1800000 },
    { id: "alien", name: "똥 먹는 외계인", icon: "👽", desc: "지구 똥 접수 · 초당 8000개", rate: 8000, base: 30000000 },
];

const SKINS = [
    { id: "basic", name: "기본 똥", icon: "💩", desc: "갓 나온 따끈한 똥", cost: 0, filter: "" },
    { id: "gold", name: "황금똥", icon: "✨", desc: "번쩍번쩍", cost: 10000, filter: "sepia(1) saturate(5) hue-rotate(-10deg) brightness(1.4)" },
    { id: "mint", name: "민트초코똥", icon: "🍫", desc: "호불호 갈림", cost: 80000, filter: "hue-rotate(110deg) saturate(1.4)" },
    { id: "ghost", name: "유령똥", icon: "👻", desc: "먹어도 배가 안 부름", cost: 500000, filter: "grayscale(1) brightness(1.7) opacity(0.75)" },
    { id: "rainbow", name: "무지개똥", icon: "🌈", desc: "유니콘이 쌌음", cost: 5000000, filter: null },
];

const ACHIEVEMENTS = [
    { id: "t1", icon: "🥄", name: "첫 숟갈", desc: "드디어 똥을 먹었다...", check: () => state.total >= 1 },
    { id: "t100", icon: "😋", name: "똥 맛을 알아버림", desc: "똥 100개 먹기", check: () => state.total >= 100 },
    { id: "t1k", icon: "🍷", name: "똥 소믈리에", desc: "똥 1,000개 먹기", check: () => state.total >= 1e3 },
    { id: "t100k", icon: "👨‍🍳", name: "똥 미식가", desc: "똥 10만 개 먹기", check: () => state.total >= 1e5 },
    { id: "t10m", icon: "👑", name: "똥의 왕", desc: "똥 1,000만 개 먹기", check: () => state.total >= 1e7 },
    { id: "t1b", icon: "🌌", name: "우주 최강 똥먹보", desc: "똥 10억 개 먹기", check: () => state.total >= 1e9 },
    { id: "boss", icon: "💼", name: "사장님", desc: "첫 알바 고용", check: () => totalWorkers() >= 1 },
    { id: "boss50", icon: "🏢", name: "똥 재벌", desc: "알바 50명 고용", check: () => totalWorkers() >= 50 },
    { id: "click500", icon: "💪", name: "손목 나감", desc: "500번 클릭", check: () => state.clicks >= 500 },
    { id: "fever", icon: "🔥", name: "피버 타임!", desc: "피버 발동", check: () => state.fevers >= 1 },
    { id: "golden", icon: "🌟", name: "황금을 찾아서", desc: "황금똥 클릭", check: () => state.goldens >= 1 },
    { id: "skins", icon: "🎨", name: "똥 패셔니스타", desc: "스킨 전부 모으기", check: () => state.skins.length === SKINS.length },
];

const state = {
    total: 0,
    points: 0,
    clicks: 0,
    fevers: 0,
    goldens: 0,
    owned: {},
    skins: ["basic"],
    skin: "basic",
    achievements: [],
};

let heat = 0;
let feverUntil = 0;
let frenzyUntil = 0;
let rainAcc = 0;

function load() {
    try {
        const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
        if (saved) Object.assign(state, saved);
    } catch {}
}

function save() {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch {}
}

function fmt(n) {
    if (n < 10000) return n < 100 && n % 1 ? n.toFixed(1) : Math.floor(n).toLocaleString();
    for (const [unit, size] of [["조", 1e12], ["억", 1e8], ["만", 1e4]]) {
        if (n >= size) return (n / size).toFixed(n / size < 100 ? 1 : 0) + unit;
    }
}

const owned = (id) => state.owned[id] || 0;
const cost = (item) => Math.ceil(item.base * 1.15 ** owned(item.id));
const totalWorkers = () => WORKERS.reduce((sum, w) => sum + owned(w.id), 0);

function basePower() {
    return 1 + CLICK_UPGRADES.reduce((sum, u) => sum + owned(u.id) * u.power, 0);
}

function clickPower() {
    let power = basePower();
    if (Date.now() < feverUntil) power *= 3;
    if (Date.now() < frenzyUntil) power *= 7;
    return power;
}

function perSecond() {
    return WORKERS.reduce((sum, w) => sum + owned(w.id) * w.rate, 0);
}

function gain(n) {
    state.total += n;
    state.points += n;
}

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

function add(e) {
    const power = clickPower();
    gain(power);
    state.clicks++;
    console.log("똥 먹음", state.total);
    floatText(`+${fmt(power)}`, e.clientX, e.clientY, power > basePower());
    scoop.style.filter = ddong.style.filter;
    scoop.classList.add("show");
    clearTimeout(scoopTimer);
    scoopTimer = setTimeout(() => scoop.classList.remove("show"), 500);

    if (Date.now() > feverUntil) {
        heat += 5;
        if (heat >= 100) {
            heat = 0;
            feverUntil = Date.now() + 10000;
            state.fevers++;
            toast("🔥 피버 타임! 10초간 클릭 3배!");
        }
    }
    render();
}

ddong.addEventListener("click", add);

/* 상점 */
function makeItem(item, onBuy) {
    const btn = document.createElement("button");
    btn.className = "item";
    btn.innerHTML = `
        <span class="icon">${item.icon}</span>
        <span><div class="name">${item.name}</div><div class="desc">${item.desc}</div></span>
        <span class="side"><div class="owned"></div><div class="price"></div></span>`;
    btn.addEventListener("click", onBuy);
    return btn;
}

const shopItems = [];

function buildShop() {
    for (const [list, selector] of [[CLICK_UPGRADES, "#shop-click"], [WORKERS, "#shop-workers"]]) {
        for (const item of list) {
            const btn = makeItem(item, () => {
                const price = cost(item);
                if (state.points < price) return;
                state.points -= price;
                state.owned[item.id] = owned(item.id) + 1;
                if (list === WORKERS) {
                    renderWorkers();
                    if (owned(item.id) === 1) toast(`${item.icon} ${item.name} 고용 완료!`);
                }
                render();
            });
            document.querySelector(selector).append(btn);
            shopItems.push({ btn, update: () => {
                btn.querySelector(".owned").textContent = owned(item.id);
                btn.querySelector(".price").textContent = `💩 ${fmt(cost(item))}`;
                btn.disabled = state.points < cost(item);
            } });
        }
    }

    for (const skin of SKINS) {
        const btn = makeItem(skin, () => {
            if (!state.skins.includes(skin.id)) {
                if (state.points < skin.cost) return;
                state.points -= skin.cost;
                state.skins.push(skin.id);
                toast(`${skin.icon} ${skin.name} 획득!`);
            }
            state.skin = skin.id;
            applySkin();
            render();
        });
        document.querySelector("#shop-skins").append(btn);
        shopItems.push({ btn, update: () => {
            const have = state.skins.includes(skin.id);
            btn.querySelector(".owned").textContent = state.skin === skin.id ? "✅" : "";
            btn.querySelector(".price").textContent = have ? "보유" : `💩 ${fmt(skin.cost)}`;
            btn.disabled = !have && state.points < skin.cost;
            btn.classList.toggle("selected", state.skin === skin.id);
        } });
    }

    const box = document.querySelector("div#achievements");
    for (const ach of ACHIEVEMENTS) {
        const el = document.createElement("span");
        el.id = `ach-${ach.id}`;
        el.textContent = ach.icon;
        el.title = `${ach.name} - ${ach.desc}`;
        box.append(el);
    }
}

function applySkin() {
    const skin = SKINS.find((s) => s.id === state.skin) || SKINS[0];
    if (skin.filter !== null) ddong.style.filter = skin.filter;
}

function renderWorkers() {
    const box = document.querySelector("div#workers");
    box.innerHTML = "";
    for (const w of WORKERS) {
        const n = owned(w.id);
        if (!n) continue;
        const group = document.createElement("div");
        group.className = "group";
        for (let i = 0; i < Math.min(n, 8); i++) {
            const el = document.createElement("span");
            el.className = "worker";
            el.style.animationDelay = `${-Math.random() * 2}s`;
            el.innerHTML = `${w.icon}<span class="food">💩</span>`;
            group.append(el);
        }
        if (n > 8) {
            const count = document.createElement("span");
            count.className = "count";
            count.textContent = `×${n}`;
            group.append(count);
        }
        box.append(group);
    }
}

function render() {
    counter.textContent = fmt(state.total);
    document.querySelector("#points").textContent = fmt(state.points);
    document.querySelector("#per-click").textContent = fmt(clickPower());
    document.querySelector("#per-sec").textContent = fmt(perSecond());
    for (const item of shopItems) item.update();

    const fever = document.querySelector("div#fever");
    const bar = document.querySelector("div#fever-bar");
    const label = document.querySelector("span#fever-label");
    const left = feverUntil - Date.now();
    fever.classList.toggle("on", left > 0);
    if (left > 0) {
        bar.style.width = `${left / 100}%`;
        label.textContent = `🔥 피버! 클릭 x3 (${Math.ceil(left / 1000)}초)`;
    } else {
        bar.style.width = `${heat}%`;
        label.textContent = Date.now() < frenzyUntil ? "🌟 클릭 광란! x7" : "연타해서 피버 게이지를 채우세요!";
    }
    document.title = `💩 ${fmt(state.total)} - Ddong`;
}

function checkAchievements() {
    for (const ach of ACHIEVEMENTS) {
        const got = state.achievements.includes(ach.id);
        if (!got && ach.check()) {
            state.achievements.push(ach.id);
            toast(`🏆 업적 달성: ${ach.icon} ${ach.name}`);
        }
        document.querySelector(`#ach-${ach.id}`).classList.toggle("got", got || ach.check());
    }
    document.querySelector("#ach-count").textContent = `${state.achievements.length}/${ACHIEVEMENTS.length}`;
}

/* 황금똥 */
function spawnGolden() {
    const el = document.createElement("div");
    el.className = "golden";
    el.textContent = "💩";
    el.style.left = `${10 + Math.random() * 55}vw`;
    el.style.top = `${15 + Math.random() * 60}vh`;
    el.addEventListener("click", (e) => {
        state.goldens++;
        if (Math.random() < 0.5) {
            const bonus = Math.max(100, perSecond() * 60, clickPower() * 30);
            gain(bonus);
            floatText(`+${fmt(bonus)}`, e.clientX, e.clientY, true);
            toast("🌟 황금똥! 똥 폭풍 보너스!");
        } else {
            frenzyUntil = Date.now() + 15000;
            toast("🌟 황금똥! 15초간 클릭 7배!");
        }
        el.remove();
        render();
    });
    document.body.append(el);
    setTimeout(() => el.remove(), 8000);
    setTimeout(spawnGolden, 30000 + Math.random() * 60000);
}

/* 배경 */
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

let last = performance.now();
let slowTimer = 0;

function tick(now) {
    const dt = Math.min((now - last) / 1000, 1);
    last = now;

    gain(perSecond() * dt);
    heat = Math.max(0, heat - 12 * dt);

    rainAcc += Math.min(perSecond() / 30, 3) * dt;
    while (rainAcc >= 1) {
        rainAcc--;
        dropRain();
    }

    if (state.skin === "rainbow") ddong.style.filter = `hue-rotate(${(now / 8) % 360}deg) saturate(2)`;

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
buildShop();
applySkin();
renderWorkers();
plantFlowers();
checkAchievements();
requestAnimationFrame(tick);
setInterval(save, 5000);
window.onbeforeunload = save;
setTimeout(spawnGolden, 20000 + Math.random() * 20000);

document.addEventListener("mousemove", (e) => {
    spoon.style.display = "block";
    spoon.style.transform = `translate(${e.clientX - 45}px, ${e.clientY - 55}px)`;
});

document.addEventListener("mouseleave", () => {
    spoon.style.display = "none";
});

document.addEventListener("mousedown", () => spoon.classList.add("down"));
document.addEventListener("mouseup", () => spoon.classList.remove("down"));
