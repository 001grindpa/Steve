document.addEventListener("DOMContentLoaded", () => {
    if (document.body.id === "landing") {
        const body = document.querySelector("body");
        const loader = body.querySelector(".loader");
        const subBody = body.querySelector(".sub-body");

        window.addEventListener("load", () => {
            loader.style.display = "none";
            subBody.style.display = "block";
        })
    }
})