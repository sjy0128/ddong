const counter = document.querySelector("span#count");

function add() {
    counter.textContent = Number(counter.textContent) + 1;
    console.log("똥 먹음", counter.textContent);
}

add();