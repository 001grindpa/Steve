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
            const dishDetail = body.querySelectorAll(".block-3 .dishes .dish");
            for (let i=0; i < dishes.length; i++) {
                if (e.target == dishes[i]) {
                    if (dishes[i].style.backgroundColor == "lightcoral") {
                        // remove dish from list if exists
                        dishes[i].style.backgroundColor = "transparent";
                        let name = dishDetail[i].querySelector(".one h4");
                        // console.log("Dish name: ", name.textContent);
                        try {
                            let r = await fetch(`/remove-dish?name=${name.textContent}`, {
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
    else if (document.body.id == "fav") {
        const body = document.querySelector("body");
        const subBody = body.querySelector(".sub-body");
        const loader = body.querySelector(".loader");
        const sideMenu = body.querySelector(".block-1");
        const bugerLogo = body.querySelector("#check-menu + label");
        const bugerLogoCheck = body.querySelector("#check-menu");
        const searchInput = body.querySelector(".block-2 #search input");
        const searchForm = body.querySelector(".block-2 #search");
        const dishesBlock = body.querySelector(".block-3");
        const noticeCont = body.querySelector(".noticeCont");
        const recipeCont = body.querySelector(".block-4");
        const rmRecipeBtn = body.querySelector(".block-4 button");
        const recipeContent = body.querySelector(".block-4 .recipeCont .main-content")
        const recipeLoader = body.querySelector(".block-4 .recipeCont img");

        // render page after window loads
        window.addEventListener("load", () => {
            loader.style.display = "none";
            subBody.style.display = "block";
        })

        // clicking body removes floating elements
        body.addEventListener("click", (e) => {
            let clickedEl = e.target;
            // console.log("clicked el: ", clickedEl);
            // get generated dishes el/objects from DOM
            const dishOptionsIcon = body.querySelectorAll(".block-3 .dish-cont .dish-header img");
            const dishOptionsCont = body.querySelectorAll(".block-3 .dish-cont .options");
            const dishData = body.querySelectorAll(".block-3 .dish-cont");
            // prevents removal if clicked on container
            for(let i=0; i < dishOptionsIcon.length; i++) {
                if (clickedEl === dishOptionsIcon[i] || 
                    clickedEl === dishOptionsCont[i] ||
                    clickedEl === dishData[i].querySelectorAll(".options .option div")[0] ||
                    clickedEl === dishData[i].querySelectorAll(".options .option div")[1] ||
                    clickedEl === dishData[i].querySelectorAll(".options .option div")[2] ||
                    clickedEl === dishData[i].querySelectorAll(".options .option img")[0] ||
                    clickedEl === dishData[i].querySelectorAll(".options .option img")[1] ||
                    clickedEl === dishData[i].querySelectorAll(".options .option img")[2]) {
                    // console.log("clicked icon");
                    return;
                } 
            }
            // 
            dishOptionsCont.forEach((el) => {
                if (el.style.display === "block") {
                    el.style.display = "none";
                }
            })

            // removes floating sidebar menu
            if (bugerLogoCheck.checked) {
                bugerLogo.click();
            }
        })
        sideMenu.addEventListener("click", (e) => {
            e.stopPropagation();
        })
        bugerLogo.addEventListener("click", (e) => {
            e.stopPropagation();
        })

        // this fetch client auto retrieves meals stored in db
        try {
            let resp = await fetch("/dishes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({"fav": ""})
            });
            let dishesObjs = await resp.json();
            console.log("Dishes: ", dishesObjs.detail);
            // remove existing from dishes container
            dishesBlock.innerHTML = "";
            dishesObjs.detail.forEach(dish => {
                // create dish container
                let dishCont = document.createElement("div");
                dishCont.classList.add("dish-cont");
                // apend dishCont to block3
                dishesBlock.appendChild(dishCont);
                // create options floating el
                let options = document.createElement("div");
                options.classList.add("options");
                // append options cont to dishes cont
                dishCont.appendChild(options);
                // create options children
                let option1 = document.createElement("div"); // create option1
                option1.classList.add("option");
                // create option1 children
                let img1 = document.createElement("img");
                img1.src = "static/images/love.png";
                option1.appendChild(img1); // append to option1
                let content1 = document.createElement("div");
                content1.textContent = "Remove from favorites";
                option1.appendChild(content1); // append to option1
                
                let option2 = document.createElement("div"); // create option2
                option2.classList.add("option");
                // create option2 children
                let img2 = document.createElement("img");
                img2.src = "static/images/calender.png";
                option2.appendChild(img2); // append to option2
                let content2 = document.createElement("div");
                content2.textContent = "Add to meal planner";
                option2.appendChild(content2); // append to option2

                let option3 = document.createElement("div"); // create option3
                option3.classList.add("option");
                // create option2 children
                let img3 = document.createElement("img");
                img3.src = "static/images/big-share.png";
                option3.appendChild(img3); // append to option3
                let content3 = document.createElement("div");
                content3.textContent = "Share";
                option3.appendChild(content3); // append to option3
                // append option1, 2, 3 to options cont
                options.appendChild(option1);
                options.appendChild(option2);
                options.appendChild(option3);
                
                // start creating main dish content
                let head = document.createElement("div"); // header cont
                head.classList.add("dish-header");
                dishCont.appendChild(head); // append head directly to dish cont
                // create head children
                let h4 = document.createElement("h4");
                h4.textContent = dish["name"];
                let dots = document.createElement("img");
                dots.src = "static/images/dots.png";
                // append h4 and dots to head cont
                head.appendChild(h4);
                head.appendChild(dots);

                // start creating main dish body
                let subDetails = document.createElement("div");
                subDetails.classList.add("sub-details");
                dishCont.appendChild(subDetails); // append subDetails to dishes cont
                // start creating sub details children
                let timeDetail = document.createElement("div");
                timeDetail.classList.add("sub-detail");
                subDetails.appendChild(timeDetail); // append timeDetail to subDetails cont
                let timeImg = document.createElement("img"); // time detail
                timeImg.src = "static/images/time.png";
                let timeDiv = document.createElement("div"); // time detail
                timeDiv.textContent = dish["time"];
                // append both time details to the container
                timeDetail.appendChild(timeImg);
                timeDetail.appendChild(timeDiv);
                // second sub detail child
                let modeDetail = document.createElement("div");
                modeDetail.classList.add("sub-detail");
                subDetails.appendChild(modeDetail); // append modeDetail to subDetails cont
                let modeImg = document.createElement("img"); // mode detail
                modeImg.src = "static/images/chart.png";
                let modeDiv = document.createElement("div"); // mode detail
                modeDiv.textContent = dish["mode"];
                // append both mode details to the container
                modeDetail.appendChild(modeImg);
                modeDetail.appendChild(modeDiv);
                
                // create content container and append to dishCont
                let content = document.createElement("div");
                content.classList.add("content");
                dishCont.appendChild(content);
                // start creating content children
                let dishDesc = document.createElement("div");
                dishDesc.textContent = dish["description"];
                let uses = document.createElement("div"); // ingredients content
                uses.classList.add("uses");
                uses.textContent = `Uses: ${dish["ingredients"]}`;
                let origin = document.createElement("div"); // origin content
                origin.classList.add("origin");
                origin.textContent = `Origin: ${dish["origin"]}`;
                // append both contents to the content container
                content.appendChild(dishDesc);
                content.appendChild(uses);
                content.appendChild(origin);

                // create and append recipe btn to dishCont finally
                let recipeBtn = document.createElement("div");
                recipeBtn.classList.add("recipe");
                recipeBtn.textContent = "View Recipe";
                dishCont.appendChild(recipeBtn);
            });
            if (dishesBlock.innerHTML == "") {
                let noDishCont = document.createElement("div");
                noDishCont.classList.add("no-dish");
                dishesBlock.appendChild(noDishCont);
                let noDishImg = document.createElement("img");
                noDishImg.src = "static/images/no_dishes.png";
                noDishCont.appendChild(noDishImg);
            }

        } catch (e) {
            console.log("Unexpected error -> ", e);
        }
        // filter dishes based on user input
        searchInput.addEventListener("input", async () => {
            let formObj = Object.fromEntries(new FormData(searchForm));
            console.log("Form Data: ", JSON.stringify(formObj));
            
            try {
                let resp = await fetch("/dishes", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formObj)
                });
                let dishesObjs = await resp.json();
                console.log("Retrieved Dishes: ", dishesObjs.detail);
                // remove existing from dishes container if searched dish exists
                if (dishesObjs.detail) {
                    dishesBlock.innerHTML = "";
                }
                dishesObjs.detail.forEach(dish => {
                    // create dish container
                    let dishCont = document.createElement("div");
                    dishCont.classList.add("dish-cont");
                    // apend dishCont to block3
                    dishesBlock.appendChild(dishCont);
                    // create options floating el
                    let options = document.createElement("div");
                    options.classList.add("options");
                    // append options cont to dishes cont
                    dishCont.appendChild(options);
                    // create options children
                    let option1 = document.createElement("div"); // create option1
                    option1.classList.add("option");
                    // create option1 children
                    let img1 = document.createElement("img");
                    img1.src = "static/images/love.png";
                    option1.appendChild(img1); // append to option1
                    let content1 = document.createElement("div");
                    content1.textContent = "Remove from favorites";
                    option1.appendChild(content1); // append to option1
                    
                    let option2 = document.createElement("div"); // create option2
                    option2.classList.add("option");
                    // create option2 children
                    let img2 = document.createElement("img");
                    img2.src = "static/images/calender.png";
                    option2.appendChild(img2); // append to option2
                    let content2 = document.createElement("div");
                    content2.textContent = "Add to meal planner";
                    option2.appendChild(content2); // append to option2

                    let option3 = document.createElement("div"); // create option3
                    option3.classList.add("option");
                    // create option2 children
                    let img3 = document.createElement("img");
                    img3.src = "static/images/big-share.png";
                    option3.appendChild(img3); // append to option3
                    let content3 = document.createElement("div");
                    content3.textContent = "Share";
                    option3.appendChild(content3); // append to option3
                    // append option1, 2, 3 to options cont
                    options.appendChild(option1);
                    options.appendChild(option2);
                    options.appendChild(option3);
                    
                    // start creating main dish content
                    let head = document.createElement("div"); // header cont
                    head.classList.add("dish-header");
                    dishCont.appendChild(head); // append head directly to dish cont
                    // create head children
                    let h4 = document.createElement("h4");
                    h4.textContent = dish["name"];
                    let dots = document.createElement("img");
                    dots.src = "static/images/dots.png";
                    // append h4 and dots to head cont
                    head.appendChild(h4);
                    head.appendChild(dots);

                    // start creating main dish body
                    let subDetails = document.createElement("div");
                    subDetails.classList.add("sub-details");
                    dishCont.appendChild(subDetails); // append subDetails to dishes cont
                    // start creating sub details children
                    let timeDetail = document.createElement("div");
                    timeDetail.classList.add("sub-detail");
                    subDetails.appendChild(timeDetail); // append timeDetail to subDetails cont
                    let timeImg = document.createElement("img"); // time detail
                    timeImg.src = "static/images/time.png";
                    let timeDiv = document.createElement("div"); // time detail
                    timeDiv.textContent = dish["time"];
                    // append both time details to the container
                    timeDetail.appendChild(timeImg);
                    timeDetail.appendChild(timeDiv);
                    // second sub detail child
                    let modeDetail = document.createElement("div");
                    modeDetail.classList.add("sub-detail");
                    subDetails.appendChild(modeDetail); // append modeDetail to subDetails cont
                    let modeImg = document.createElement("img"); // mode detail
                    modeImg.src = "static/images/chart.png";
                    let modeDiv = document.createElement("div"); // mode detail
                    modeDiv.textContent = dish["mode"];
                    // append both mode details to the container
                    modeDetail.appendChild(modeImg);
                    modeDetail.appendChild(modeDiv);
                    
                    // create content container and append to dishCont
                    let content = document.createElement("div");
                    content.classList.add("content");
                    dishCont.appendChild(content);
                    // start creating content children
                    let dishDesc = document.createElement("div");
                    dishDesc.textContent = dish["description"];
                    let uses = document.createElement("div"); // ingredients content
                    uses.classList.add("uses");
                    uses.textContent = `Uses: ${dish["ingredients"]}`;
                    let origin = document.createElement("div"); // origin content
                    origin.classList.add("origin");
                    origin.textContent = `Origin: ${dish["origin"]}`;
                    // append both contents to the content container
                    content.appendChild(dishDesc);
                    content.appendChild(uses);
                    content.appendChild(origin);

                    // create and append recipe btn to dishCont finally
                    let recipeBtn = document.createElement("div");
                    recipeBtn.classList.add("recipe");
                    recipeBtn.textContent = "View Recipe";
                    dishCont.appendChild(recipeBtn);
                });
                if (dishesBlock.innerHTML == "") {
                    let noDishCont = document.createElement("div");
                    noDishCont.classList.add("no-dish");
                    dishesBlock.appendChild(noDishCont);
                    let noDishImg = document.createElement("img");
                    noDishImg.src = "static/images/no_dish_found.png";
                    noDishCont.appendChild(noDishImg);
                }
            }
            catch (e) {
                console.log("Unexpected error -> ", e);
            }
        })

        // control dish options cont el
        dishesBlock.addEventListener("click", async (e) => {
            // get generated dishes el/objects from DOM
            const dishData = body.querySelectorAll(".block-3 .dish-cont");
            
            let targetEl = e.target;

            for (let i=0; i < dishData.length; i ++) {
                // check if clicked existing container el == generated el out of many similar
                if (targetEl == dishData[i].querySelector(".dish-header img")) {

                    const dishOptionsIcon = dishData[i].querySelector(".dish-header img");
                    const dishOptionsCont = dishData[i].querySelector(".options");

                    if (dishOptionsCont.style.display == "block") {
                        return dishOptionsCon.style.display = "none";
                    }
                    return dishOptionsCont.style.display = "block";
                }
                // remove dish from fav list if true
                if (targetEl == dishData[i].querySelectorAll(".options .option div")[0] || targetEl == dishData[i].querySelectorAll(".options .option img")[0]) {
                    
                    let name = dishData[i].querySelector(".dish-header h4").textContent;
                    try {
                        let resp = await fetch(`/remove-dish?name=${name}`, {
                            method: "DELETE"
                        });
                        let data = await resp.json();
                        console.log(data.detail);
                        if (data.detail == "Meal removed from list") {
                            dishesBlock.removeChild(dishData[i]);
                        }
                        // create notification for status
                        let notice = document.createElement("div");
                        notice.classList.add("notice");
                        notice.style.backgroundColor = "blue";
                        notice.textContent = data.detail;
                        noticeCont.prepend(notice);
                        notice.classList.add("show");
                        setTimeout(() => {
                            notice.classList.add("remove");
                        }, 4000);
                    } catch (e) {
                        console.log("Unexpected error -> ", e);
                    }
                }
                // add dish to planner
                else if (targetEl == dishData[i].querySelectorAll(".options .option div")[1] || targetEl == dishData[i].querySelectorAll(".options .option img")[1]) {
                    console.log("add to planner clicked");
                    let name = dishData[i].querySelector(".dish-header h4").textContent;
                    
                    try {
                        let resp = await fetch(`/add-to-planner?meal=${name}`, {
                            method: "PUT",
                        });
                        let data = await resp.json();
                        console.log(data.detail);

                        // create notification for status
                        let notice = document.createElement("div");
                        notice.classList.add("notice");
                        notice.style.backgroundColor = "blue";
                        notice.textContent = data.detail;
                        noticeCont.prepend(notice);
                        notice.classList.add("show");
                        setTimeout(() => {
                            notice.classList.add("remove");
                        }, 4000);

                    } catch (e) {
                        console.log("Unexpected error ->", e)
                    }
                }
                else if (targetEl == dishData[i].querySelector(".recipe")) {
                    let dishName = dishData[i].querySelector(".dish-header h4").textContent;
                    // let timeToMake = dishData[i].querySelector(".sub-details .sub-detail div").textContent;
                    // let des = dishData[i].querySelector(".content div").textContent;
                    // let ingre = dishData[i].querySelector(".content .uses").textContent;
                    // let origin = dishData[i].querySelector(".content .origin").textContent;
                    console.log("recipe button clicked");
                    console.log("recipe button clicked again");
                    // recipeContent.textContent = "";
                    recipeLoader.style.display = "block";
                    recipeContent.style.display = "none";
                    recipeContent.innerHTML = "";
                    rmRecipeBtn.disabled = true;
                    rmRecipeBtn.style.cursor = "progress";
                    rmRecipeBtn.textContent = "loading...";
                   
                    // display recipe el
                    recipeCont.style.display = "block";
                    body.style.overflowY = "hidden";
                    
                    try {
                        let resp = await fetch(`/get-recipe?name=${dishName}`);
                        let data = await resp.json();

                        console.log(data.detail);
                        // get ingredients
                        let ingredients = data.detail["ingredients"].split(", ");
                        // get steps
                        let steps = data.detail["steps"].split(", ");
                        // get quantities
                        let quantities = data.detail["quantities"].split(", ");

                        // create dynamic recipeContent
                        // create recipe name
                        let recipeName = document.createElement("h3");
                        recipeName.textContent = data.detail["dish_name"];
                        recipeContent.appendChild(recipeName);
                        //create the ingredients container
                        let ingreCont = document.createElement("div");
                        ingreCont.classList.add("ingreCont");
                        recipeContent.appendChild(ingreCont) // append it to parent first
                        //create children
                        let ingreContTitle = document.createElement("div");
                        ingreContTitle.classList.add("title");
                        ingreCont.appendChild(ingreContTitle) // append title cont
                        //create title children
                        let ingreTitle = document.createElement("h4");
                        ingreTitle.textContent = "Ingredients";
                        ingreContTitle.appendChild(ingreTitle); // append first child
                        let nOfIngres = document.createElement("div");
                        nOfIngres.textContent = ingredients.length;
                        ingreContTitle.appendChild(nOfIngres); // append second child

                        // create unordered list el, ingreCont child 
                        let list = document.createElement("ul");
                        ingreCont.appendChild(list); // append to parent
                        ingredients.forEach((ingredient, index) => {
                            let listItem = document.createElement("li");
                            list.appendChild(listItem);
                            let ingreDiv = document.createElement("div");
                            ingreDiv.textContent = ingredient;
                            listItem.appendChild(ingreDiv); // append li child
                            let quantity = document.createElement("div");
                            quantity.textContent = quantities[index];
                            listItem.appendChild(quantity);
                        });

                        // create line, ingreCont child
                        let line = document.createElement("div");
                        line.classList.add("line");
                        ingreCont.appendChild(line);

                        // create steps cont, ingreCont child
                        let stepsCont = document.createElement("div");
                        stepsCont.classList.add("stepsCont");
                        ingreCont.appendChild(stepsCont); // append to parent
                        // create steps children
                        let stepsHeader = document.createElement("h4");
                        stepsHeader.textContent = "Steps";
                        stepsCont.appendChild(stepsHeader);
                        // steps
                        steps.forEach((step, index) => {
                            let stepDiv = document.createElement("div");
                            stepDiv.classList.add("step");
                            stepsCont.appendChild(stepDiv); // append to parent
                            let stepIndex = document.createElement("div");
                            stepIndex.textContent = index+1;
                            stepDiv.appendChild(stepIndex); // append to parent
                            let stepData = document.createElement("div");
                            stepData.textContent = step.trim();
                            stepDiv.appendChild(stepData); // append child
                        })

                    } catch(e) {
                        console.log(e);
                        alert("Unexpected error, try again");
                        recipeCont.style.display = "none";
                        body.style.overflowY = "auto";
                    }
                    setTimeout(() => {
                        recipeLoader.style.display = "none";
                        recipeContent.style.display = "block";
                        rmRecipeBtn.disabled = false;
                        rmRecipeBtn.style.cursor = "pointer";
                        rmRecipeBtn.textContent = "ok";
                    }, 3000);
                }
            }
        })
        // removes recipe el when clicked
        rmRecipeBtn.addEventListener("click", () => {
            if (recipeCont.style.display == "block") {
                recipeCont.style.display = "none";
                body.style.overflowY = "auto";
            }
        })
    } else if (document.body.id == "planner") {
        const body = document.querySelector("body");
        const subBody = body.querySelector(".sub-body");
        const loader = body.querySelector(".loader");
        const sideMenu = body.querySelector(".block-1");
        const bugerLogoCheck = body.querySelector("#check-menu");
        const bugerLogo = body.querySelector("#check-menu + label");
        const dishesCont = body.querySelector(".block-2 .add-from .dishes-cont");
        const dateCont = body.querySelector(".block-3 .date-bg .date");
        const dateContWeekDay = body.querySelector(".block-3 .date-bg .date span:nth-child(1)");
        const dateContMonth = body.querySelector(".block-3 .date-bg .date span:nth-child(2)");
        const dateContDate = body.querySelector(".block-3 .date-bg .date span:nth-child(3)");
        const dateContYear = body.querySelector(".block-3 .date-bg .date span:nth-child(4)");
        const leftBtn = body.querySelector(".block-3 .date-bg button:nth-child(1)");
        const rightBtn = body.querySelector(".block-3 .date-bg button:nth-child(3)");
        const noticeCont = body.querySelector("main .noticeCont");
        const addDishCont = body.querySelector(".block-3 .content-2");
        const addMeal = body.querySelectorAll(".block-3 .content-2 .add-meal-cont .bg .add-meal");

        // render page after window loads
        window.addEventListener("load", () => {
            loader.style.display = "none";
            subBody.style.display = "block";
        })

        body.addEventListener("click", (e) => {
            let target = e.target;
            // removes floating sidebar menu
            if (bugerLogoCheck.checked) {
                bugerLogo.click();
            }
            // remove all floating menus etc
            let menu = document.querySelectorAll(".block-3 .content-2 .add-meal-cont .bg .meal .meal-menu-cont");
            let menuIcons = document.querySelectorAll(".block-3 .content-2 .add-meal-cont .bg .menuIcon");
            let recipeIcon = document.querySelectorAll(".recipeIcon");
            let recipeTxt = document.querySelectorAll(".show-recipe-cont div");

            for (let i=0; i < menuIcons.length; i++) {
                if (target==menuIcons[i]||target==menu[i]||target==recipeIcon[i]||target==recipeTxt[i]) {
                    return;
                }
            }
            
            menu.forEach(el => {
                if (el.style.display == "block") {
                    el.style.display = "none";
                }
            })
        })

        sideMenu.addEventListener("click", (e) => {
            e.stopPropagation();
        })
        bugerLogo.addEventListener("click", (e) => {
            e.stopPropagation();
        })

        // auto make a request to get all dishes added to planner
        let data;
        try {
            let resp = await fetch("/planner-dishes");
            data = await resp.json();

            console.log("Dishes added to Planner: ", data.detail);

            // create each dish item and append to parent cont
            dishesCont.innerHTML = "";

            data.detail.forEach(el => {
                let item = document.createElement("div");
                item.classList.add("dish");
                dishesCont.appendChild(item); // append to parent first
                // create item children
                let itemHeader = document.createElement("h4");
                itemHeader.textContent = el["name"];
                item.appendChild(itemHeader); // append to parent
                // create item's body child
                let itemBody = document.createElement("div");
                itemBody.classList.add("about");
                itemBody.textContent = el["description"];
                item.appendChild(itemBody);
            })

        } catch (e) {
            console.log("Unexpected error => ", e);
        }
        // handle date container data
        const months = {
            0: "Jan", 1: "Feb", 2: "March", 
            3: "April", 4: "May", 5: "June", 6: "Jul", 7: "Aug", 8: "Sept", 
            9: "Oct", 10: "Nov", 11: "Dec"
        };
        const days = {
            0: "Sun", 1: "Mon", 2: "Tues",
            3: "Wed", 4: "Thurs", 5: "Fri",
            6: "Sat"
        }
        let weekday = new Date().toLocaleString("default", {weekday: "short"});
        let month = new Date().toLocaleString("default", {month: "short"});
        let date = new Date().getDate();
        let year = new Date().getFullYear();
        let monthIndex = new Date().getMonth();
        
        dateContWeekDay.textContent = weekday;
        dateContMonth.textContent = month;
        dateContDate.textContent = date;
        dateContYear.textContent = year;

        let currentDay = new Date().getDay();
        let currentDate = date;
        let currentMonthIndex = monthIndex;
        let currentYear = year;
        let totalDaysInMonth;

        // use event listeners to change date
        rightBtn.addEventListener("click", () => {
            // update day of the week
            currentDay = eval(currentDay + 1) % 7;
            dateContWeekDay.textContent = days[currentDay];

            // update date and month
            totalDaysInMonth = new Date(year, currentMonthIndex+1, 0).getDate();
            currentDate = (currentDate + 1) % (totalDaysInMonth+1);
            if (currentDate == 0) {
                currentMonthIndex = (currentMonthIndex + 1) % 12;
                currentDate = 1;
                dateContMonth.textContent = months[currentMonthIndex];
            }
            // update year
             if (currentMonthIndex == 0 && currentDate == 1) {
                currentYear += 1;
                dateContYear.textContent = currentYear;
            }

            dateContDate.textContent = currentDate;
            
            // add future meals 
        });
        
        leftBtn.addEventListener("click", () => {
            if (month == months[currentMonthIndex] && currentDate == date) {
                console.log("clicked");
                // create notification for status
                let notice = document.createElement("div");
                notice.classList.add("notice");
                notice.style.backgroundColor = "green";
                notice.textContent = "Please check history for previous days data";
                noticeCont.prepend(notice);
                notice.classList.add("show");
                setTimeout(() => {
                    notice.classList.add("remove");
                }, 4000);
                return;
            }
            // update year
            // check upkeep
            if (currentMonthIndex == 0 && currentDate == 1) {
                currentMonthIndex = 11;
                currentDate = 32; // 1 will be removed from it in the code that updates date below
            }
            // perform upkeep
            if (currentMonthIndex == 11 && currentDate == 32) {
                currentYear -= 1;
                dateContYear.textContent = currentYear;
                dateContMonth.textContent = months[currentMonthIndex];
            }

            // update day of the week
            if (currentDay == 0) {
                currentDay = 6;
            } else {
                currentDay = eval(currentDay - 1);
            }
            dateContWeekDay.textContent = days[currentDay];
            
            // update date and month
            currentDate -= 1;
            if (currentDate == 0) {
                currentMonthIndex -= 1;
                totalDaysInMonth = new Date(year, currentMonthIndex+1, 0).getDate();
                currentDate = totalDaysInMonth;
                // update month to prev month
                dateContMonth.textContent = months[currentMonthIndex];
            }

            dateContDate.textContent = currentDate;
        });

        // clicking the dynamically added items menu icon pops up menu
        // read content-2 container for clicked items

        let allPeriodCont = document.querySelectorAll(".block-3 .content-2 .add-meal-cont .bg");
        
        // use a loop to interact with period dish based on the one clicked
        for (let i = 0; i < allPeriodCont.length; i++) {
            allPeriodCont[i].addEventListener("click", (e) => {
                let menuIcons = document.querySelectorAll(".block-3 .content-2 .add-meal-cont .bg .menuIcon");
                let menu = document.querySelectorAll(".block-3 .content-2 .add-meal-cont .bg .meal .meal-menu-cont");

                let target = e.target;

                if (target == menuIcons[i]) {
                    if (menu[i].style.display == "block") {
                        menu[i].style.display="none";
                    } else {
                        menu[i].style.display="block";
                    }
                }
            })
        }
        
        // go through 'data' content, add seperate them into three arrays based on their 
        let morningDishes = [];
        let afternoonDishes = [];
        let eveningDishes = [];
        data.detail.forEach(el => {
            let mealTime = el["time"].split("m")[0];
            if (mealTime.trim() <= 20) {
                morningDishes.push(el["name"]);
            } else if (mealTime.trim() > 20 && mealTime.trim() <= 30) {
                afternoonDishes.push(el["name"]);
            } else if (mealTime.trim() >= 31) {
                eveningDishes.push(el["name"]);
            }
        });
        // console.log("Morning Dishes: %s\nAfternoon Dishes: %s\nEvening Dishes: %s", morningDishes, afternoonDishes, eveningDishes);

        // use the loop to check which meals qualify for which period
        for (let i=0; i < addMeal.length; i++) {
            addMeal[i].addEventListener("click", async (e) => {
                let plannerDishes = document.querySelectorAll(".block-2 .add-from .dishes-cont .dish");
                let dishNames = document.querySelectorAll(".block-2 .add-from .dishes-cont .dish h4");
                // if morning
                if (i == 0) {
                    if (addMeal[i].style.backgroundColor == "var(--faded-yellow)") {
                        addMeal[i].style.backgroundColor = "transparent";
                        addMeal[i].classList.remove("choosen"); // remove as choosen
                        // remove selectable if exists
                        plannerDishes.forEach(el => {
                            if (el.classList.contains("selectable")) {
                                el.classList.remove("selectable");
                            }
                        })
                    } else {
                        // remove choosen from other addMeal containers and disable them
                        addMeal.forEach(el => {
                            if (el.classList.contains("choosen")) {
                                el.classList.remove("choosen");
                                el.click();
                            }
                        });

                        addMeal[i].classList.add("choosen") // make choosen
                        addMeal[i].style.backgroundColor = "var(--faded-yellow)";
                        dishNames.forEach((el, index) => {
                            morningDishes.forEach(el2 => {
                                // add selectable if eligible
                                if (el.textContent == el2) {
                                    plannerDishes[index].classList.add("selectable");
                                }
                            })
                        })
                    }
                }
                // if afternoon
                if (i == 1) {
                    if (addMeal[i].style.backgroundColor == "var(--faded-orange)") {
                        addMeal[i].style.backgroundColor = "transparent";
                        addMeal[i].classList.remove("choosen"); // remove as choosen
                        // remove selectable if exists
                        plannerDishes.forEach(el => {
                            if (el.classList.contains("selectable")) {
                                el.classList.remove("selectable");
                            }
                        })
                    } else {
                        // remove choosen from other addMeal containers and disable them
                        addMeal.forEach(el => {
                            if (el.classList.contains("choosen")) {
                                el.classList.remove("choosen");
                                el.click();
                            }
                        });

                        addMeal[i].classList.add("choosen") // make choosen
                        addMeal[i].style.backgroundColor = "var(--faded-orange)";
                        dishNames.forEach((el, index) => {
                            afternoonDishes.forEach(el2 => {
                                // add selectable if eligible
                                if (el.textContent == el2) {
                                    plannerDishes[index].classList.add("selectable");
                                }
                            })
                        })
                    }
                }
                // if evening
                if (i == 2) {
                    if (addMeal[i].style.backgroundColor == "var(--faded-black)") {
                        addMeal[i].style.backgroundColor = "transparent";
                        addMeal[i].classList.remove("choosen"); // remove as choosen
                        // remove selectable if exists
                        plannerDishes.forEach(el => {
                            if (el.classList.contains("selectable")) {
                                el.classList.remove("selectable");
                            }
                        })
                    } else {
                        // remove choosen from other addMeal containers and disable them
                        addMeal.forEach(el => {
                            if (el.classList.contains("choosen")) {
                                el.classList.remove("choosen");
                                el.click();
                            }
                        });

                        addMeal[i].classList.add("choosen") // make choosen
                        addMeal[i].style.backgroundColor = "var(--faded-black)";
                        dishNames.forEach((el, index) => {
                            eveningDishes.forEach(el2 => {
                                // add selectable if eligible
                                if (el.textContent == el2) {
                                    plannerDishes[index].classList.add("selectable");
                                }
                            })
                        })
                    }
                }
            })
        }
    }
})