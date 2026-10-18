const counter = document.querySelector("span#count");
const ddong = document.querySelector("div#content");

function add() {
    const prev = Number(counter.textContent);
    counter.textContent = prev + 1;
    console.log("똥 먹음", counter.textContent);
    ddong.style.filter = `hue-rotate(${(prev * 30) % 360}deg)`;
}