/* ========================= */
/* LOADER */
/* ========================= */

window.addEventListener("load", () => {

    const loader = document.querySelector(".loader");

    if(loader){

        setTimeout(() => {

            loader.style.opacity = "0";

            setTimeout(() => {

                loader.style.display = "none";

            },500);

        },800);

    }

});

/* ========================= */
/* NAVBAR SCROLL */
/* ========================= */

const navbar =
document.querySelector(".navbar");

window.addEventListener("scroll", () => {

    if(window.scrollY > 50){

        navbar.classList.add("scrolled");

    }else{

        navbar.classList.remove("scrolled");

    }

});

/* ========================= */
/* MOBILE MENU */
/* ========================= */

const menuBtn =
document.querySelector(".menu-btn");

const navLinks =
document.querySelector(".nav-links");

if(menuBtn){

    menuBtn.addEventListener("click", () => {

        navLinks.classList.toggle("active");

        const icon =
        menuBtn.querySelector("i");

        if(navLinks.classList.contains("active")){

            icon.classList.remove("fa-bars");
            icon.classList.add("fa-xmark");

        }else{

            icon.classList.remove("fa-xmark");
            icon.classList.add("fa-bars");

        }

    });

}

/* ========================= */
/* CLOSE MENU */
/* ========================= */

document
.querySelectorAll(".nav-links a")
.forEach(link => {

    link.addEventListener("click", () => {

        navLinks.classList.remove("active");

        const icon =
        menuBtn.querySelector("i");

        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-bars");

    });

});

/* ========================= */
/* SMOOTH SCROLL */
/* ========================= */

document
.querySelectorAll('a[href^="#"]')
.forEach(anchor => {

    anchor.addEventListener("click", function(e){

        e.preventDefault();

        const target =
       
