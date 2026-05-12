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
    else if (document.body.id === "signup") {
        const body = document.querySelector("body");
        const eye = body.querySelector("main #eye");
        const pwFields = body.querySelectorAll("main form .pw");
        const form = body.querySelector("#signup main h1 ~ form");
        const loader = body.querySelector(".loader");
        const subBody = body.querySelector(".sub-body");
        const noticeCont = body.querySelector("main .section-container .noticeCont");
        const btnLoader = body.querySelector("main h1 ~ form #loading");
        const btnText = body.querySelector("main h1 ~ form #loading + span");
        const submitBtn = body.querySelector("main h1 ~ form button");

        // page loading logic
        window.addEventListener("load", () => {
            loader.style.display = "none";
            subBody.style.display = "block";
        })

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            var newForm = Object.fromEntries(new FormData(form));
            // send http request
            try {
                let r = await fetch("/signup", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(newForm)
                })
                btnText.style.display = "none";
                btnLoader.style.display = "block";
                submitBtn.disabled = true;
                let d = await r.json() 
                console.log(d.detail);
                // create a notification el and append dynamic notice
                let notice = document.createElement("div");
                notice.classList.add("notice");
                if (d.detail == "success") {
                    notice.textContent = "Successful signup. Redirecting to Login...";
                    notice.classList.add("show");
                    noticeCont.appendChild(notice);
                } else if (d.detail == "mismatched") {
                    notice.textContent = "Please make sure password is matching";
                    notice.style.backgroundColor = "red";
                    notice.style.color = "white";
                    notice.classList.add("show");
                    noticeCont.appendChild(notice);
                } else if (d.detail == "Empty field detected" || d.detail == "exists") {
                    if (d.detail == "Empty field detected") {
                        notice.textContent = d.detail;
                    } else if (d.detail == "exists") {
                        notice.textContent = "This email already exists"
                    }
                    notice.style.backgroundColor = "yellow";
                    notice.style.color = "red";
                    notice.classList.add("show");
                    noticeCont.appendChild(notice);
                }
                else if (d.detail == "short" || d.detail == "no digit" 
                    || d.detail == "no lowercase" ||
                        d.detail == "no uppercase" || d.detail == "invalid") {
                    if (d.detail == "short") {
                        notice.textContent = "Password is too short";
                    } else if (d.detail == "no digit") {
                        notice.textContent = "Add at least one digit to password";
                    } else if (d.detail == "no lowercase") {
                        notice.textContent = "Add at least one lowercase to password";
                    }else if (d.detail == "no uppercase") {
                        notice.textContent = "Add at least one uppercase to password";
                    } else if (d.detail == "invalid") {
                        notice.textContent = "Please enter a valid email";
                    }
                    notice.style.backgroundColor = "blue";
                    notice.style.color = "lightblue";
                    notice.classList.add("show");
                    noticeCont.appendChild(notice);
                }
                // clear notification
                setTimeout(() => {
                    notice.classList.add("remove");
                    btnText.style.display = "block";
                    btnLoader.style.display = "none";
                    submitBtn.disabled = false;
                    if (d.detail == "success") {
                        let login = document.createElement("a");
                        login.href = "/login";
                        login.click();
                    }
                }, 4000);
                // catch errors incase of any
            } catch(e) {
                console.log("unexpected error: ", e)
            }
        })

        eye.addEventListener("click", () => {
            pwFields.forEach(el => {
                if (el.type === "password") {
                    el.type = "text";
                    eye.src = "static/images/closed-eye.png";
                } else {
                    el.type = "password";
                    eye.src = "static/images/opened-eye.png";
                }
            })
        })
    }
    else if (document.body.id === "login") {
        const body = document.querySelector("body");
        const eye = body.querySelector("main #eye");
        const pwFields = body.querySelectorAll("main form .pw");
        const form = body.querySelector("#login main h1 ~ form");
        const loader = body.querySelector(".loader");
        const subBody = body.querySelector(".sub-body");
        const noticeCont = body.querySelector("main .section-container .noticeCont");
        const btnLoader = body.querySelector("main h1 ~ form #loading");
        const btnText = body.querySelector("main h1 ~ form #loading + span");
        const submitBtn = body.querySelector("main h1 ~ form button");

        // page loading logic
        window.addEventListener("load", () => {
            loader.style.display = "none";
            subBody.style.display = "block";
        })

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            var newForm = Object.fromEntries(new FormData(form));
            // send http request
            try {
                let r = await fetch("/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(newForm)
                })
                btnText.style.display = "none";
                btnLoader.style.display = "block";
                submitBtn.disabled = true;
                let d = await r.json() 
                console.log(d.detail);
                // create a notification el and append dynamic notice
                let notice = document.createElement("div");
                notice.classList.add("notice");
                if (d.detail == "success") {
                    notice.textContent = "Logging in...";
                    notice.classList.add("show");
                    noticeCont.appendChild(notice);
                }
                else if (d.detail == "empty" || d.detail == "not exist") {
                    if (d.detail == "empty") {
                        notice.textContent = "Empty field detected";
                    } else if (d.detail == "not exist") {
                        notice.textContent = "This account does not exist"
                    }
                    notice.style.backgroundColor = "yellow";
                    notice.style.color = "red";
                    notice.classList.add("show");
                    noticeCont.appendChild(notice);
                }
                else if (d.detail == "Check password again") {
                    notice.textContent = d.detail;
                    notice.style.backgroundColor = "red";
                    notice.style.color = "white";
                    notice.classList.add("show");
                    noticeCont.appendChild(notice);
                }
                // clear notification
                setTimeout(() => {
                    notice.classList.add("remove");
                    btnText.style.display = "block";
                    btnLoader.style.display = "none";
                    submitBtn.disabled = false;
                    if (d.detail == "success") {
                        let login = document.createElement("a");
                        login.href = "/";
                        login.click();
                    }
                }, 4000);
                // catch errors incase of any
            } catch(e) {
                console.log("unexpected error: ", e)
            }
        })

        eye.addEventListener("click", () => {
            pwFields.forEach(el => {
                if (el.type === "password") {
                    el.type = "text";
                    eye.src = "static/images/closed-eye.png";
                } else {
                    el.type = "password";
                    eye.src = "static/images/opened-eye.png";
                }
            })
        })
    }
})