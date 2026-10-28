// 마우스를 따라다니는 숟가락 커서.

const spoon = document.querySelector("svg#spoon");
const spoonBody = document.querySelector("g#spoon-body");
const scoop = document.querySelector("g#scoop");
let scoopTimer;

// 한 입 뜰 때마다 숟가락을 까딱이고 똥을 얹어 보여준다
function showScoop() {
    scoop.style.filter = document.querySelector("div#content").style.filter;
    scoop.classList.add("show");
    clearTimeout(scoopTimer);
    scoopTimer = setTimeout(() => scoop.classList.remove("show"), 300);
    spoonBody.animate([{ transform: "rotate(-14deg)" }, { transform: "rotate(0deg)" }], 80);
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
