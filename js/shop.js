// 상점, 알바생 표시, 업적.

let buyMode = 1;
const shopItems = [];

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

// 선택한 구매 모드(×1, ×10, MAX)에 따라 이번에 살 개수
function buyCount(item) {
    return buyMode === "max" ? Math.max(1, maxAffordable(item)) : buyMode;
}

function buildShop() {
    for (const btn of document.querySelectorAll("div#buy-mode button")) {
        btn.addEventListener("click", () => {
            buyMode = btn.dataset.n === "max" ? "max" : Number(btn.dataset.n);
            for (const other of document.querySelectorAll("div#buy-mode button")) other.classList.toggle("on", other === btn);
        });
    }

    for (const [list, selector] of [[CLICK_UPGRADES, "#shop-click"], [WORKERS, "#shop-workers"]]) {
        for (const item of list) {
            const btn = makeItem(item, () => {
                const n = buyCount(item);
                const price = priceOf(item, n);
                if (state.points < price) return;
                state.points -= price;
                const before = owned(item.id);
                state.owned[item.id] = before + n;
                if (list === WORKERS) {
                    renderWorkers();
                    if (before === 0) toast(`${item.icon} ${item.name} 고용 완료!`);
                }
            });
            document.querySelector(selector).append(btn);
            shopItems.push(() => {
                const n = buyCount(item);
                btn.querySelector(".owned").textContent = owned(item.id);
                btn.querySelector(".price").textContent = `${n > 1 ? `×${n} ` : ""}💩 ${fmt(priceOf(item, n))}`;
                btn.disabled = state.points < priceOf(item, n);
            });
        }
    }

    EVOLUTIONS.forEach((evo, i) => {
        const btn = makeItem({ ...evo, desc: `${evo.desc} · 모든 획득량 ×${fmt(evo.mult)}` }, () => {
            if (i !== state.evo + 1 || state.points < evo.cost) return;
            state.points -= evo.cost;
            state.evo = i;
            applyEvolution();
            toast(`🧬 ${evo.name}(으)로 진화! 이제 모든 획득량 ×${fmt(evo.mult)}`);
        });
        document.querySelector("#shop-evolution").append(btn);
        shopItems.push(() => {
            const done = i <= state.evo;
            btn.classList.toggle("done", done);
            btn.classList.toggle("locked", i > state.evo + 1);
            btn.querySelector(".owned").textContent = i === state.evo ? "✅" : "";
            btn.querySelector(".price").textContent = done ? "진화 완료" : `💩 ${fmt(evo.cost)}`;
            btn.disabled = i !== state.evo + 1 || state.points < evo.cost;
        });
    });

    const box = document.querySelector("div#achievements");
    for (const ach of ACHIEVEMENTS) {
        const el = document.createElement("span");
        el.id = `ach-${ach.id}`;
        el.textContent = ach.icon;
        el.title = `${ach.name} - ${ach.desc}`;
        box.append(el);
    }
}

function updateShop() {
    for (const update of shopItems) update();
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

function checkAchievements() {
    for (const ach of ACHIEVEMENTS) {
        if (!state.achievements.includes(ach.id) && ach.check()) {
            state.achievements.push(ach.id);
            toast(`🏆 업적 달성: ${ach.icon} ${ach.name}`);
        }
        document.querySelector(`#ach-${ach.id}`).classList.toggle("got", state.achievements.includes(ach.id));
    }
    document.querySelector("#ach-count").textContent = `${state.achievements.length}/${ACHIEVEMENTS.length}`;
}
