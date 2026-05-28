document.addEventListener("DOMContentLoaded", async () => {
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
                    noticeCont.prepend(notice);
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
        const form = body.querySelector("main h1 ~ form");
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
                    noticeCont.prepend(notice);
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
                    noticeCont.prepend(notice);
                }
                else if (d.detail == "Check password again") {
                    notice.textContent = d.detail;
                    notice.style.backgroundColor = "red";
                    notice.style.color = "white";
                    notice.classList.add("show");
                    noticeCont.prepend(notice);
                }
                // clear notification
                setTimeout(() => {
                    notice.classList.add("remove");
                    btnText.style.display = "block";
                    btnLoader.style.display = "none";
                    submitBtn.disabled = false;
                    // noticeCont.removeChild(notice);
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
    else if (document.body.id == "index") {
        const body = document.querySelector("body");
        const loader = body.querySelector(".loader");
        const subBody = body.querySelector(".sub-body");
        const chatCont = body.querySelector(".block-2 .chat-area .chat-cont");
        const chatForm = body.querySelector(".block-2 .chat-area .input-cont form");
        const queryInput = body.querySelector("#query");
        const queryBtn = body.querySelector(".block-2 .chat-area .input-cont form button");
        const noticeCont = body.querySelector("main .noticeCont");

        // page loading logic
        window.addEventListener("load", () => {
            loader.style.display = "none";
            subBody.style.display = "block";
        })

        // auto load existing chat
        try {
            r = await fetch("/chat");
            d = await r.json();
            if (d.detail == "not_found") {
                console.log("empty chat");
            }
            d.detail.forEach(el => {
                // render user's text
                let userContG = document.createElement("div");
                userContG.classList.add("user-cont");
                // create user's text container and append to parent
                let userG = document.createElement("div");
                userG.classList.add("user");
                userContG.appendChild(userG);
                // create user's text el and time el
                let userTxtG = document.createElement("div");
                userTxtG.classList.add("user-txt");
                userTxtG.textContent = el.user_txt;
                let timeG = document.createElement("div");
                timeG.classList.add("user-time");
                timeG.textContent = el.user_time;
                // append both el to parent
                userG.appendChild(userTxtG);
                userG.appendChild(timeG);
                // append parent to ancestor
                chatCont.appendChild(userContG);
                chatCont.scrollTop = chatCont.scrollHeight;

                // render steve's text
                // create steve's response container
                let steveContG = document.createElement("div");
                steveContG.classList.add("steve-cont");
                let steveG = document.createElement("div");
                steveG.classList.add("steve");
                steveContG.appendChild(steveG);
                // create steve's text el and append to steve's cont
                let steveTxtG = document.createElement("div");
                steveTxtG.classList.add("txt");
                steveTxtG.textContent = el.steve_txt;
                steveG.appendChild(steveTxtG);
                // create time el for steve and append
                let steveTimeG = document.createElement("div");
                steveTimeG.classList.add("time");
                steveTimeG.textContent = el.steve_time;
                steveG.appendChild(steveTimeG);

                // append steve's response container to ancestor
                chatCont.appendChild(steveContG);
                chatCont.scrollTop = chatCont.scrollHeight
            })
        }
        catch (e) {
            console.log("Unexpected error ->", e)
        }

        chatForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            let formObject = Object.fromEntries(new FormData(chatForm));
            let query = queryInput.value;

            // configure time
            let hour = new Date().getHours();
            let minute = new Date().getMinutes();
            minute = (minute < 9)? `0${minute}`: minute;
            hour = (hour < 9)? `0${hour}`: hour;
            let period = "AM";
            if (hour >= 12) {
                // hour = 24 -hour;
                period = "PM";
            }

            // handle empty input field
            if (formObject.query.trim() === "") {
                let notice = document.createElement("div");
                notice.classList.add("notice");
                notice.textContent = "Query field is empty";
                noticeCont.prepend(notice);
                notice.classList.add("show");
                setTimeout(() => {
                    notice.classList.add("remove");
                }, 3000);

                return;
            }
            // handle btn when streaming is live
            queryBtn.disabled = true;
            queryBtn.style.cursor = "progress";
            
            // handle user chat
            // create user's text parent container
            let userCont = document.createElement("div");
            userCont.classList.add("user-cont");
            // create user's text container and append to parent
            let user = document.createElement("div");
            user.classList.add("user");
            userCont.appendChild(user);
            // create user's text el and time el
            let userTxt = document.createElement("div");
            userTxt.classList.add("user-txt");
            userTxt.textContent = formObject.query;
            let time = document.createElement("div");
            time.classList.add("user-time");
            time.textContent = `${hour}:${minute} ${period}`;
            // append both el to parent
            user.appendChild(userTxt);
            user.appendChild(time);
            // append parent to ancestor
            chatCont.appendChild(userCont);
            chatCont.scrollTop = chatCont.scrollHeight;
            queryInput.value = "";

            // handle API call (bot response etc)
            // create steve's response container
            let steveCont = document.createElement("div");
            steveCont.classList.add("steve-cont");
            // create gif loader and append to steve's response cont
            let loaderGif = document.createElement("img");
            loaderGif.src = "static/gifs/loading-dots.gif";
            steveCont.appendChild(loaderGif);

            // append steve's response container to ancestor
            chatCont.appendChild(steveCont);
            try {
                let response = await fetch(`/steve?query=${query}`);
                let reader = response.body.getReader();
                let decoder = new TextDecoder();

                let steve = document.createElement("div");
                steve.classList.add("steve");
                loaderGif.style.display = "none";
                steveCont.appendChild(steve);
                // create steve's text el and append to steve's cont
                let steveTxt = document.createElement("div");
                steveTxt.classList.add("txt");
                steve.appendChild(steveTxt);
                // create time el for steve and append
                let steveTime = document.createElement("div");
                steveTime.classList.add("time");
                steveTime.textContent = `${hour}:${minute} ${period}`;
                steve.appendChild(steveTime);


                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    steveTxt.innerHTML += chunk;
                    chatCont.scrollTop = chatCont.scrollHeight;
                }
                queryBtn.disabled = false;
                queryBtn.style.cursor = "pointer";
            } catch (error) {
                console.log("Unexpected error ->", error);
            } finally {
                console.log("request completed");
            }
        })
    }
})