const counter = document.querySelector("span#count");
const ddong = document.querySelector("div#content");
const spoon = document.querySelector("svg#spoon");
const scoop = document.querySelector("g#scoop");
let scoopTimer;

function add() {
    const prev = Number(counter.textContent);
    counter.textContent = prev + 1;
    console.log("똥 먹음", counter.textContent);
    scoop.style.filter = ddong.style.filter;
    scoop.classList.add("show");
    clearTimeout(scoopTimer);
    scoopTimer = setTimeout(() => scoop.classList.remove("show"), 500);
}

document.addEventListener("mousemove", (e) => {
    spoon.style.display = "block";
    spoon.style.transform = `translate(${e.clientX - 45}px, ${e.clientY - 55}px)`;
});

document.addEventListener("mouseleave", () => {
    spoon.style.display = "none";
});

document.addEventListener("mousedown", () => spoon.classList.add("down"));
document.addEventListener("mouseup", () => spoon.classList.remove("down"));
