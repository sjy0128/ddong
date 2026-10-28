// 저장되는 진행 상황과 그걸로 계산하는 값들.

const SAVE_KEY = "ddong-save-v2";

const state = {
    total: 0,
    points: 0,
    clicks: 0,
    fevers: 0,
    goldens: 0,
    owned: {},
    evo: 0,
    achievements: [],
    savedAt: Date.now(),
};

// 저장하지 않는 일시적인 효과
const boost = {
    heat: 0,
    feverUntil: 0,
    frenzyUntil: 0,
};

function load() {
    try {
        const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
        if (saved) Object.assign(state, saved);
    } catch {}
}

function save() {
    state.savedAt = Date.now();
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch {}
}

function fmt(n) {
    if (n < 10000) return n < 100 && n % 1 ? n.toFixed(1) : Math.floor(n).toLocaleString();
    for (const [unit, size] of [["경", 1e16], ["조", 1e12], ["억", 1e8], ["만", 1e4]]) {
        if (n >= size) return (n / size).toFixed(n / size < 100 ? 1 : 0) + unit;
    }
}

const owned = (id) => state.owned[id] || 0;
const evolution = () => EVOLUTIONS[state.evo];
const totalWorkers = () => WORKERS.reduce((sum, w) => sum + owned(w.id), 0);
const feverOn = () => Date.now() < boost.feverUntil;
const frenzyOn = () => Date.now() < boost.frenzyUntil;

// item을 n개 더 살 때의 총 가격
function priceOf(item, n) {
    const first = item.base * PRICE_GROWTH ** owned(item.id);
    return Math.ceil(first * (PRICE_GROWTH ** n - 1) / (PRICE_GROWTH - 1));
}

// 지금 포인트로 item을 몇 개까지 살 수 있는지
function maxAffordable(item) {
    const first = item.base * PRICE_GROWTH ** owned(item.id);
    return Math.floor(Math.log(state.points * (PRICE_GROWTH - 1) / first + 1) / Math.log(PRICE_GROWTH));
}

function basePower() {
    return (1 + CLICK_UPGRADES.reduce((sum, u) => sum + owned(u.id) * u.power, 0)) * evolution().mult;
}

function clickPower() {
    let power = basePower();
    if (feverOn()) power *= FEVER_MULT;
    if (frenzyOn()) power *= FRENZY_MULT;
    return power;
}

function perSecond() {
    return WORKERS.reduce((sum, w) => sum + owned(w.id) * w.rate, 0) * evolution().mult;
}

function gain(n) {
    state.total += n;
    state.points += n;
}
