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
        const clearChat = body.querySelector("#trash_can");
        const sideMenu = body.querySelector(".block-1");
        const bugerLogo = body.querySelector("#check-menu + label");
        const bugerLogoCheck = body.querySelector("#check-menu");
        const recipesCont = body.querySelector(".block-3");
        const userIngreCont = body.querySelector(".block-3 .ingre-cont");
        const dishesCont = body.querySelector(".block-3 .dishes");
        const preDishInfo = body.querySelector(".block-3 .dishes .pre-info");
        const greenLoader = body.querySelector(".block-3 #green-loader");
        // const dishes = body.querySelectorAll(".block-3 .dishes .two img");
        // const ingreContTitle = body.querySelector(".block-3 .ingre-cont .before-ingre");
        // const ingreCont = body.querySelector(".block-3 .ingre-cont .ingre");
        const cancelOptions = body.querySelector(".block-3 .ingre-cont .cancel");
        // recipesCont.style.background = "red";

        // page loading logic
        window.addEventListener("load", () => {
            loader.style.display = "none";
            subBody.style.display = "block";
        })

        // clicking body removes sidebar menu
        body.addEventListener("click", () => {
            if (bugerLogoCheck.checked == true) {
                bugerLogo.click();
            }
        })
        sideMenu.addEventListener("click", (e) => {
            e.stopPropagation();
        })
        bugerLogo.addEventListener("click", (e) => {
            e.stopPropagation();
        })

        // remove pre dish info ("dishes will appear here") when dish is generated/available
        if (userIngreCont.textContent.trim() != "") {
            preDishInfo.style.display = "none";

            // iplement cancel options action
            cancelOptions.classList.add("active");
        };
        // clear steve's ideas
        recipesCont.addEventListener("click", async (e) => {
            let cancelBtn = e.target.closest(".cancel");
            if (cancelBtn) {
                console.log("btn clicked");
                // retrieve later generated dom elements
                const ingreContTitle = body.querySelector(".block-3 .ingre-cont .before-ingre");
                const ingreCont = body.querySelector(".block-3 .ingre-cont .ingre");
                if (cancelBtn.classList.contains("active")) {
                    try {
                        let r = await fetch("/cancel-options", {
                            method: "DELETE"
                        });
                        let d = await r.json();
                        console.log(d.detail);

                        // clear front-end text
                        dishesCont.textContent = "";
                        ingreCont.textContent = "";
                        ingreContTitle.textContent = "";
                        // create and add back pre-dish info i.e "Steve's ideas will appear here" el
                        let preDishInfo = document.createElement("div");
                        preDishInfo.classList.add("pre-info")
                        preDishInfo.textContent = "Steve's ideas will appear here.";
                        dishesCont.append(preDishInfo);
                        // remove the active class from cancel el when there's nothing to cancel
                        cancelBtn.classList.remove("active");
                        
                        // create notification for status
                        let notice = document.createElement("div");
                        notice.classList.add("notice");
                        notice.style.backgroundColor = "gray";
                        notice.textContent = d.detail;
                        noticeCont.prepend(notice);
                        notice.classList.add("show");
                        setTimeout(() => {
                            notice.classList.add("remove");
                        }, 4000);
                        
                    } catch (e) {
                        console.log("Unexpected error ->", e);
                    } finally {
                        console.log("clicked cancel button")
                    }
                } else {
                    // create notification for status
                    let notice = document.createElement("div");
                    notice.classList.add("notice");
                    notice.style.backgroundColor = "red";
                    notice.textContent = "No recommendations to clear";
                    noticeCont.prepend(notice);
                    notice.classList.add("show");
                    setTimeout(() => {
                        notice.classList.add("remove");
                    }, 3000);
                    return console.log("No recommendations to clear");
                }
            };
            // send request to add dish to favorites and remove
            const dishes = body.querySelectorAll(".block-3 .dishes .two img");
            for (let i=0; i < dishes.length; i++) {
                if (e.target == dishes[i]) {
                    if (dishes[i].style.backgroundColor == "lightcoral") {
                        // remove dish from list if exists
                        dishes[i].style.backgroundColor = "transparent";
                        try {
                            let r = await fetch(`/remove-dish?index=${i}`, {
                                method: "DELETE"
                            });
                            let d = await r.json();
                            
                            // create notification for status
                            let notice = document.createElement("div");
                            notice.classList.add("notice");
                            notice.style.backgroundColor = "gray";
                            notice.textContent = d.detail;
                            noticeCont.prepend(notice);
                            notice.classList.add("show");
                            setTimeout(() => {
                                notice.classList.add("remove");
                            }, 4000);
                        } catch (e) {
                            console.log("Unexpected error ->", e);
                        } finally {
                            console.log("You have sent a request to remove meal");
                        }
                    } else {
                        // add dish to list
                        dishes[i].style.backgroundColor = "lightcoral";
                        try {
                            let r = await fetch(`/add-dish?index=${i}`, {
                                method: "POST"
                            });
                            let d = await r.json();
                            
                            // create notification for status
                            let notice = document.createElement("div");
                            notice.classList.add("notice");
                            notice.style.backgroundColor = "blue";
                            notice.textContent = d.detail;
                            noticeCont.prepend(notice);
                            notice.classList.add("show");
                            setTimeout(() => {
                                notice.classList.add("remove");
                            }, 4000);
                        } catch (e) {
                            console.log("Unexpected error ->", e);
                        } finally {
                            console.log("You have sent a request to add meal");
                        }   
                    }
                }
            }
        });

        // clear chat db on click
        clearChat.addEventListener("click", async () => {
            try {
                let r = await fetch("/clear_chat", {
                    method: "DELETE"
                });
                let d = await r.json();
                console.log(d.detail);
                chatCont.textContent = "";
            }
            catch (e) {
                console.log("Unexpected error ->", e);
            }
        })

        // auto load existing chat
        // this can be done with jinja too
        try {
            r = await fetch("/chat");
            d = await r.json();
            if (d.detail == "not_found") {
                return console.log("empty chat");
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
                chatCont.scrollTop = chatCont.scrollHeight;
            })
        }
        catch (e) {
            console.log("Unexpected error ->", e);
        }

        // render conversation chat between user and steve
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
            chatCont.scrollTop = chatCont.scrollHeight
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
                // fetch dishes to make
                replies = ["Ok.", "On it.", "Searching the web right now.", "You got it."];
                replies.forEach(async el => {
                    if (steveTxt.textContent == el) {
                        console.log("Getting dishes...");
                        try {
                            r = await fetch("/to-make");
                            d = await r.json();
                            // handle when dishes array is empty
                            if (d.detail == "") {
                                return console.log("The array of dishes is empty");
                            }
                            // clear recipe container before appending new data
                            userIngreCont.textContent = "";
                            dishesCont.textContent = "";
                            greenLoader.style.display = "block";
                            setTimeout(() => {
                                greenLoader.style.display = "none";
                                // start creating and appending dish details
                                // create the cancel button
                                let cancelBtn = document.createElement("div");
                                cancelBtn.classList.add("cancel", "active");
                                let line1 = document.createElement("div");
                                let line2 = document.createElement("div");
                                cancelBtn.appendChild(line1);
                                cancelBtn.appendChild(line2);
                                userIngreCont.appendChild(cancelBtn);


                                const beforeIngre = document.createElement("div");
                                beforeIngre.textContent = "Based on your ingredients";
                                beforeIngre.classList.add("before-ingre");
                                userIngreCont.appendChild(beforeIngre);
                                
                                
                                d.detail.forEach(el => {
                                    // render user's ingres
                                    if (el["user's ingredients"]) {
                                        var items = el["user's ingredients"].split(", ");
                                        var ing = document.createElement("div");
                                        ing.classList.add("ingre");
                                        userIngreCont.append(ing);
                                        for (let item in items) {
                                            let div = document.createElement("div");
                                            div.textContent = items[item];
                                            ing.appendChild(div);
                                        }
                                        // return here so that the loop does not attempt to render
                                        // a dish el with the "user's ingredients" data.
                                        return;
                                    }
                                    // render dish info container
                                    let dish = document.createElement("div");
                                    dish.classList.add("dish");
                                    dishesCont.appendChild(dish);
                                    let innerInfo = document.createElement("div");
                                    innerInfo.classList.add("one");
                                    dish.appendChild(innerInfo);
                                    // render dish name
                                    let h4 = document.createElement("h4");
                                    h4.textContent = el.name;
                                    innerInfo.appendChild(h4);
                                    // render dish innerItemsCont
                                    let innerItemsCont = document.createElement("div");
                                    innerInfo.appendChild(innerItemsCont);
                                    // render innerItems
                                    // create timeImg and timeData elements container
                                    let itemOne = document.createElement("div");
                                    itemOne.classList.add("info");
                                    innerItemsCont.appendChild(itemOne);
                                    // create timeImg and timeData elements
                                    let timeImg = document.createElement("img");
                                    timeImg.src = "static/images/time.png";
                                    itemOne.appendChild(timeImg);
                                    let timeData = document.createElement("div");
                                    timeData.textContent = el.time_it_takes;
                                    itemOne.appendChild(timeData);
                                    // create modeImg and Modedata el container
                                    let itemTwo = document.createElement("div");
                                    itemTwo.classList.add("info");
                                    innerItemsCont.appendChild(itemTwo);
                                    // create modeImg and Modedata elements container
                                    let modeImg = document.createElement("img");
                                    modeImg.src = "static/images/chart.png";
                                    itemOne.appendChild(modeImg);
                                    let modeData = document.createElement("div");
                                    modeData.textContent = el.difficulty;
                                    itemOne.appendChild(modeData);

                                    // render description
                                    let desc = document.createElement("div");
                                    desc.classList.add("desc");
                                    desc.textContent = el.description;
                                    innerInfo.appendChild(desc);
                                    // render ingredients
                                    let ingred = document.createElement("div");
                                    ingred.classList.add("uses");
                                    ingred.textContent = "Uses: ";
                                    ingred.textContent += el.ingredients;
                                    innerInfo.appendChild(ingred);
                                    // render fav iconCont
                                    let favCont = document.createElement("div");
                                    favCont.classList.add("two");
                                    dish.appendChild(favCont);
                                    // render fav iconImg
                                    let favImg = document.createElement("img");
                                    favImg.src = "static/images/love.png";
                                    favCont.appendChild(favImg);
                                })
                            }, 3000);

                        } catch(e) {
                            console.log("Unexpected error ->", e);
                        }
                    }
                });
            } catch (error) {
                console.log("Unexpected error ->", error);
            } finally {
                console.log("request completed");
            }
        })
    }
})