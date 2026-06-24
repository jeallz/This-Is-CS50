const yearSpan = document.getElementById("year");

if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
}

const helloBtn = document.getElementById("hello-btn");
const helloMsg = document.getElementById("hello-msg");

if (helloBtn) {
    helloBtn.addEventListener("click", function () {
        helloMsg.textContent = "Hi there! Thanks for visiting my page :)";
    });
}

const header = document.querySelector("header");

if (header) {
    const themeBtn = document.createElement("button");

    themeBtn.id = "theme-toggle";
    themeBtn.textContent = "Toggle Light/Dark Mode";
    header.appendChild(themeBtn);

    if (localStorage.getItem("theme") === "light") {
        document.body.classList.add("light-theme");
    }

    themeBtn.addEventListener("click", function () {
        document.body.classList.toggle("light-theme");

        if (document.body.classList.contains("light-theme")) {
            localStorage.setItem("theme", "light");
        } else {
            localStorage.setItem("theme", "dark");
        }
    });
}
