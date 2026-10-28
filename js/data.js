// 게임 밸런스 데이터. 숫자만 바꿔서 난이도를 조절할 수 있다.

const PRICE_GROWTH = 1.12; // 하나 살 때마다 가격이 12%씩 오름
const HOLD_RATE = 12; // 꾹 누르고 있을 때 초당 먹는 횟수
const FEVER_MULT = 5;
const FEVER_TIME = 8000;
const FRENZY_MULT = 7;
const FRENZY_TIME = 15000;
const OFFLINE_LIMIT = 2 * 60 * 60; // 오프라인 수익은 최대 2시간치

const CLICK_UPGRADES = [
    { id: "bigspoon", name: "왕숟가락", icon: "🥄", desc: "한 입에 +2", power: 2, base: 10 },
    { id: "ladle", name: "국자", icon: "🍲", desc: "한 입에 +12", power: 12, base: 120 },
    { id: "shovel", name: "삽", icon: "🪏", desc: "한 입에 +80", power: 80, base: 1500 },
    { id: "excavator", name: "포크레인", icon: "🚜", desc: "한 입에 +500", power: 500, base: 20000 },
    { id: "blackhole", name: "블랙홀 입", icon: "🕳️", desc: "한 입에 +4000", power: 4000, base: 300000 },
];

const WORKERS = [
    { id: "alba", name: "똥 먹는 알바", icon: "🧑", desc: "시급 받고 똥 먹음 · 초당 3개", rate: 3, base: 30 },
    { id: "dog", name: "똥개", icon: "🐶", desc: "원래 좋아함 · 초당 20개", rate: 20, base: 300 },
    { id: "fly", name: "똥파리 군단", icon: "🪰", desc: "윙윙 · 초당 130개", rate: 130, base: 3500 },
    { id: "youtuber", name: "똥 먹방 유튜버", icon: "📹", desc: "구독 좋아요 · 초당 900개", rate: 900, base: 40000 },
    { id: "factory", name: "똥 먹는 공장", icon: "🏭", desc: "24시간 가동 · 초당 7000개", rate: 7000, base: 500000 },
    { id: "alien", name: "똥 먹는 외계인", icon: "👽", desc: "지구 똥 접수 · 초당 6만 개", rate: 60000, base: 8000000 },
];

// 순서대로만 진화할 수 있고, 진화할수록 모든 획득량에 배율이 붙는다.
const EVOLUTIONS = [
    { name: "기본 똥", icon: "💩", desc: "갓 나온 따끈한 똥", mult: 1, cost: 0, filter: "", accessory: "", size: 1 },
    { name: "황금똥", icon: "✨", desc: "번쩍번쩍", mult: 3, cost: 2000, filter: "sepia(1) saturate(5) hue-rotate(-10deg) brightness(1.4)", accessory: "✨", size: 1.04 },
    { name: "민트초코똥", icon: "🍫", desc: "호불호 갈림", mult: 10, cost: 50000, filter: "hue-rotate(110deg) saturate(1.4)", accessory: "🍃", size: 1.08 },
    { name: "유령똥", icon: "👻", desc: "먹어도 배가 안 부름", mult: 40, cost: 1500000, filter: "grayscale(1) brightness(1.7) opacity(0.75)", accessory: "👻", size: 1.12 },
    { name: "왕똥", icon: "👑", desc: "똥들의 왕", mult: 200, cost: 50000000, filter: "saturate(1.8) hue-rotate(-20deg)", accessory: "👑", size: 1.16 },
    { name: "무지개똥", icon: "🌈", desc: "유니콘이 쌌음", mult: 1000, cost: 2000000000, filter: null, accessory: "🦄", size: 1.2 },
];

const ACHIEVEMENTS = [
    { id: "t1", icon: "🥄", name: "첫 숟갈", desc: "드디어 똥을 먹었다...", check: () => state.total >= 1 },
    { id: "t1k", icon: "😋", name: "똥 맛을 알아버림", desc: "똥 1,000개 먹기", check: () => state.total >= 1e3 },
    { id: "t100k", icon: "🍷", name: "똥 소믈리에", desc: "똥 10만 개 먹기", check: () => state.total >= 1e5 },
    { id: "t10m", icon: "👨‍🍳", name: "똥 미식가", desc: "똥 1,000만 개 먹기", check: () => state.total >= 1e7 },
    { id: "t1b", icon: "👑", name: "똥의 왕", desc: "똥 10억 개 먹기", check: () => state.total >= 1e9 },
    { id: "t1t", icon: "🌌", name: "우주 최강 똥먹보", desc: "똥 1조 개 먹기", check: () => state.total >= 1e12 },
    { id: "boss", icon: "💼", name: "사장님", desc: "첫 알바 고용", check: () => totalWorkers() >= 1 },
    { id: "boss100", icon: "🏢", name: "똥 재벌", desc: "알바 100명 고용", check: () => totalWorkers() >= 100 },
    { id: "bite1k", icon: "💪", name: "멈출 수 없어", desc: "1,000입 먹기", check: () => state.clicks >= 1000 },
    { id: "fever", icon: "🔥", name: "피버 타임!", desc: "피버 발동", check: () => state.fevers >= 1 },
    { id: "golden", icon: "🌟", name: "황금을 찾아서", desc: "황금똥 클릭", check: () => state.goldens >= 1 },
    { id: "evo", icon: "🧬", name: "최종 진화", desc: "무지개똥까지 진화", check: () => state.evo === EVOLUTIONS.length - 1 },
];
